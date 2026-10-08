import { Organisatie, ScanInvulling, ScanUitvoering } from "../types";
import { nieuwId } from "../id";
import { normaliseerEmail } from "../email";
import { GevalideerdeRij } from "../import-legacy";
import { laadAlles, slaAlles } from "./store";
import { genereerUniekeToegangscode } from "./respondenten";
import { AuditInvoer, logAudit } from "../audit-store";
import { getGebruikers } from "../gebruikers-store";
import { metingContext, organisatieContext } from "../audit-context";

/** Import van scans uit een CSV (import-scans.md): schrijft rijen weg als Organisatie, Respondent, Meting en scan. */

export interface LegacyImportKeuze {
  rij: GevalideerdeRij;
  assessmentId: string;
  /**
   * `null` = nieuwe organisatie aanmaken met `rij.organisatieNaam`. Geef,
   * zodra bekend (een eerdere aanroep binnen dezelfde beheersessie heeft
   * 'm al aangemaakt — `import-scans.md`, "Binnen één import"/"Meting"),
   * het echte id door i.p.v. opnieuw `null`: anders ontstaat per aanroep
   * een nieuwe organisatie met dezelfde naam, in plaats van één.
   */
  organisatieId: string | null;
  /**
   * Zelfde idee als `organisatieId`, maar voor de Meting: `null`/weggelaten
   * = nieuwe Meting aanmaken. Binnen één aanroep worden rijen met
   * dezelfde organisatie, Assessment en `rij.meetingLabel` altijd
   * samengevoegd tot één Meting, ook als ze hier allemaal `null` krijgen
   * (`import-scans.md`, Meting, "Binnen één import delen rijen één
   * Meting"); geef het echte id door voor een latere, aparte aanroep die
   * bij diezelfde combinatie moet aansluiten.
   */
  metingId?: string | null;
  /**
   * De organisatienaam zoals die in het bestand staat (getrimd), `import-scans.md`, Meting. Standaard `rij.organisatieNaam`.
   * Rijen delen alleen een Meting als doelorganisatie, Assessment, bronnaam en label overeenkomen.
   */
  bronnaam?: string;
  /**
   * Zijn er twee of meer bronnamen aan dezelfde organisatie gekoppeld, dan krijgt het label de bronnaam erachter, bijvoorbeeld
   * "Legacy-import 2026 Onderdeel A". Bij maar één bronnaam zegt die niets extra's en blijft het label zoals het is. De
   * aanroeper weet dat over de hele import, deze aanroep ziet maar een deel van de rijen.
   */
  bronnaamInLabel?: boolean;
  /**
   * Metingen die deze import eerder aanmaakte voor dezelfde organisatie, Assessment en bronnaam, per label. Zo sluiten ook de
   * varianten met een datum (zie hieronder) aan bij een latere, aparte aanroep.
   */
  bekendeMetingen?: Record<string, string>;
}

/** Per verwerkte rij, in dezelfde volgorde als de input: met welke organisatie/Meting hij uiteindelijk geschreven is — voor de aanroeper om te onthouden richting een latere, aparte aanroep (zie `LegacyImportKeuze`). */
export interface LegacyImportRijResultaat {
  organisatieId: string;
  scanUitvoeringId: string;
  /** Het uiteindelijke label van de Meting, voor de aanroeper om te onthouden (zie `LegacyImportKeuze.bekendeMetingen`). */
  label: string;
  bronnaam: string;
}

/**
 * Het label van de poging om een Meting te vinden of aan te maken (`import-scans.md`, Eén scan per Respondent per Meting): Eerst
 * het gewone label, heeft de Respondent daar al een scan in, dan met de datum van `created_at` erachter ("Legacy-import
 * 2026 Onderdeel A (14-01-2026)"), en bij dezelfde datum met een volgnummer ("(2)", "(3)").
 */
export function importMetingLabel(basis: string, datum: string, poging: number): string {
  if (poging === 0) return basis;
  if (poging === 1) return `${basis} (${datum})`;
  return `${basis} (${datum}) (${poging})`;
}

/** De datum van een scan voor het label, zoals in de beheerweergave: 14-01-2026. */
function labelDatum(iso: string | null | undefined): string {
  const datum = iso ? new Date(iso) : null;
  if (!datum || Number.isNaN(datum.getTime())) return "onbekende datum";
  return datum.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Schrijft gevalideerde rijen (`lib/import-legacy.ts`) definitief weg
 * (`import-scans.md`, Werkwijze in beheer, Meting, "Over rijen heen in
 * één bestand"). Organisaties en Metingen die **binnen deze ene aanroep**
 * voor het eerst voorkomen (nieuwe organisatienaam, of nieuwe combinatie
 * organisatie/Assessment/label) worden maar één keer aangemaakt en
 * daarna door latere rijen in dezelfde aanroep hergebruikt — rijen die
 * expliciet al een `organisatieId`/`metingId` meekrijgen (van een eerdere
 * aanroep in dezelfde beheersessie) tellen ook mee voor die hergebruik-
 * groepering. Zie `LegacyImportKeuze` voor hoe de aanroeper dat tussen
 * aparte aanroepen laat doorwerken.
 *
 * Een respondent die al bestaat (zelfde e-mailadres binnen de organisatie)
 * wordt hergebruikt zonder zijn naam/functie/team/notities te overschrijven
 * — dat is bewust een terughoudende keuze (niet in de spec expliciet
 * vastgelegd): De import mag geen recentere, zelf ingevoerde gegevens van
 * een bestaande respondent overschrijven met oudere importdata.
 */
export function voerLegacyImportUit(
  keuzes: LegacyImportKeuze[],
  aangemaaktDoor: string,
  /** Alle gebeurtenissen van één import delen dit id in de audit-log (`datamodel.md`, Audit, Groepen). */
  groepId: string | null = null
): { geimporteerd: number; rijResultaten: LegacyImportRijResultaat[]; geweigerd?: boolean } {
  // Alleen een Admin mag importeren (`beheerpagina.md`, punt 8): Een verzoek van een Consultant wordt geweigerd.
  const actor = getGebruikers().find((g) => g.id === aangemaaktDoor);
  if (actor?.rol !== "admin") return { geimporteerd: 0, rijResultaten: [], geweigerd: true };
  const alles = laadAlles();
  // Het importmoment: Eén waarde voor alle scans van deze import (`ScanInvulling.aangemaaktOp`).
  const importMoment = new Date().toISOString();
  // Geen naam, e-mailadres of andere gegevens van de Respondent in de log (datamodel.md, Audit).
  const gelogd: AuditInvoer[] = [];
  let geimporteerd = 0;
  const rijResultaten: LegacyImportRijResultaat[] = [];

  // Nieuw aangemaakt BINNEN deze aanroep, dus hergebruikbaar door een
  // volgende rij in dezelfde `keuzes`-lijst (import-scans.md, "Organisatie,
  // één keer per unieke naam" / "Binnen één import delen rijen één
  // Meting"). Niet bedoeld om tussen aparte aanroepen heen te onthouden —
  // dat doet de aanroeper zelf, via de teruggegeven `rijResultaten`.
  const nieuweOrgPerNaam = new Map<string, Organisatie>();
  const nieuweMetingPerSleutel = new Map<string, ScanUitvoering>();

  for (const { rij, assessmentId, organisatieId, metingId, bronnaam: bronnaamKeuze, bronnaamInLabel, bekendeMetingen } of keuzes) {
    let organisatie =
      (organisatieId ? alles.find((o) => o.id === organisatieId) : undefined) ??
      nieuweOrgPerNaam.get(rij.organisatieNaam);
    let nieuwAangemaakt = false;
    if (!organisatie) {
      const nu = new Date().toISOString();
      organisatie = {
        id: nieuwId(),
        naam: rij.organisatieNaam,
        kenmerken: {},
        leden: [],
        scanUitvoeringen: [],
        aangemaaktDoor,
        toegewezenAan: [],
        benchmarkToegestaan: false,
        aangemaaktOp: nu,
        gewijzigdOp: nu,
      };
      alles.push(organisatie);
      nieuweOrgPerNaam.set(rij.organisatieNaam, organisatie);
      nieuwAangemaakt = true;
      gelogd.push({
        actie: "organisatie.aangemaakt",
        entiteitType: "organisatie",
        entiteitId: organisatie.id,
        entiteitNaam: organisatie.naam,
        groepId,
        details: organisatieContext(organisatie),
      });
    }

    // "nieuw"-formaat: organisatie_kenmerken is al compleet, alleen toepassen bij een
    // nieuw aangemaakte organisatie — bij hergebruik van een bestaande organisatie
    // blijven haar eigen, mogelijk recentere kenmerken staan. Bij meerdere rijen voor
    // dezelfde nieuwe organisatie (binnen of tussen aanroepen) geldt dit alleen op het
    // moment van aanmaken, dus feitelijk de eerste rij in bestandsvolgorde
    // (import-scans.md, "Kenmerken bij een nieuwe organisatie").
    if (rij.organisatieKenmerken && nieuwAangemaakt) {
      organisatie.kenmerken = { ...rij.organisatieKenmerken };
    } else if ((rij.sectorTitel || rij.subsectorTitel) && !organisatie.kenmerken["sector-subsector"]) {
      organisatie.kenmerken["sector-subsector"] = {
        sector: rij.sectorTitel ?? "",
        subsector: rij.subsectorTitel ?? "",
      };
    }

    let lid = organisatie.leden.find((l) => l.email === normaliseerEmail(rij.respondentEmail));
    // Een bestaande Respondent wordt niet overschreven. Een `start_comment` die nog niet in de
    // notities staat, komt als nieuwe regel onder de bestaande notities (import-scans.md).
    if (lid && rij.respondentNotities && !lid.notities.includes(rij.respondentNotities)) {
      lid.notities = lid.notities ? `${lid.notities}\n${rij.respondentNotities}` : rij.respondentNotities;
    }
    const respondentNieuw = !lid;
    if (!lid) {
      lid = {
        id: nieuwId(),
        organisatieId: organisatie.id,
        email: normaliseerEmail(rij.respondentEmail),
        naam: rij.respondentNaam || null,
        functie: rij.respondentFunctie,
        team: rij.respondentTeam,
        notities: rij.respondentNotities,
        toegangscode: genereerUniekeToegangscode(alles),
        leadMetingIds: [],
        aangemaaktOp: new Date().toISOString(),
      };
      organisatie.leden.push(lid);
      gelogd.push({
        actie: "respondent.aangemaakt",
        entiteitType: "respondent",
        entiteitId: lid.id,
        groepId,
        details: organisatieContext(organisatie),
      });
    }

    // Eén Meting per doelorganisatie, Assessment, bronnaam en label, en hooguit één scan per Respondent per Meting
    // (`import-scans.md`, Meting en Eén scan per Respondent per Meting). Heeft de Respondent in de gevonden Meting al een scan,
    // dan krijgt de scan een eigen Meting met een label met de datum erachter.
    const bronnaam = (bronnaamKeuze ?? rij.organisatieNaam).trim();
    const basisLabel = bronnaamInLabel ? `${rij.meetingLabel} ${bronnaam}` : rij.meetingLabel;
    const bekend: Record<string, string> = { ...(bekendeMetingen ?? {}), ...(metingId ? { [basisLabel]: metingId } : {}) };
    const datumTekst = labelDatum(rij.gestartOp ?? rij.uitgenodigdOp);
    let scanUitvoering: ScanUitvoering | undefined;
    for (let poging = 0; !scanUitvoering; poging++) {
      const label = importMetingLabel(basisLabel, datumTekst, poging);
      const metingSleutel = `${organisatie.id}::${assessmentId}::${bronnaam}::${label}`;
      let meting =
        (bekend[label] ? organisatie.scanUitvoeringen.find((s) => s.id === bekend[label]) : undefined) ??
        nieuweMetingPerSleutel.get(metingSleutel);
      if (!meting) {
        meting = {
          id: nieuwId(),
          organisatieId: organisatie.id,
          assessmentId,
          label,
          aangemaaktOp: new Date().toISOString(),
          invullingen: [],
        };
        organisatie.scanUitvoeringen.push(meting);
        nieuweMetingPerSleutel.set(metingSleutel, meting);
        gelogd.push({
          actie: "meting.aangemaakt",
          entiteitType: "meting",
          entiteitId: meting.id,
          entiteitNaam: meting.label,
          groepId,
          details: metingContext(organisatie, meting),
        });
      }
      if (!meting.invullingen.some((i) => i.organisatieLidId === lid!.id)) scanUitvoering = meting;
    }

    const invulling: ScanInvulling = {
      id: nieuwId(),
      scanUitvoeringId: scanUitvoering.id,
      organisatieLidId: lid.id,
      status: rij.status,
      antwoorden: rij.antwoorden,
      opmerkingenPerBouwblok: rij.opmerkingenPerBouwblok,
      aangemaaktOp: importMoment,
      uitgenodigdOp: rij.uitgenodigdOp,
      gestartOp: rij.gestartOp,
      afgerondOp: rij.afgerondOp,
      bewaarVerlengdTot: null,
    };
    scanUitvoering.invullingen.push(invulling);
    gelogd.push({
      actie: "scan.geimporteerd",
      entiteitType: "scan",
      entiteitId: invulling.id,
      groepId,
      details: {
        ...metingContext(organisatie, scanUitvoering),
        bestand: (rij as { bestandsnaam?: string }).bestandsnaam ?? null,
        rijNummer: rij.rijNummer,
        // Alleen of de Respondent nieuw was, geen gegevens van de Respondent zelf (datamodel.md, Audit).
        respondentNieuw,
        // Bij een goedgekeurde 95%+-rij het percentage (import-scans.md, Audit-log).
        ...(rij.vereistBevestiging ? { vraagtekstMatchPercentage: rij.assessmentMatchPercentage } : {}),
      },
    });
    rijResultaten.push({ organisatieId: organisatie.id, scanUitvoeringId: scanUitvoering.id, label: scanUitvoering.label, bronnaam });
    geimporteerd++;
  }

  slaAlles(alles);
  logAudit(gelogd);
  return { geimporteerd, rijResultaten };
}
