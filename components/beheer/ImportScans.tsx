"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { useAssessments } from "@/lib/assessment-store";
import { voerLegacyImportUit, LegacyImportKeuze, LegacyImportRijResultaat } from "@/lib/db";
import { Organisatie } from "@/lib/types";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { logAudit, nieuweGroepId } from "@/lib/audit-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import {
  ImportBronFormaat,
  bestandOverslaanReden,
  detecteerBronFormaat,
  parseLegacyCsv,
  parseNieuweExportCsv,
  valideerLegacyRijen,
  valideerNieuweExportRijen,
  GevalideerdeRij,
} from "@/lib/import-legacy";

const BRONFORMAAT_LABEL: Record<ImportBronFormaat, string> = {
  oud: "Oude tool",
  nieuw: "Coniche Scan (eigen export)",
};

/** Eén geselecteerd bestand, met per bestand zijn eigen gedetecteerde bronformaat of fout — bestanden mogen onderling een ander bronformaat hebben. */
interface BestandStatus {
  naam: string;
  bronFormaat: ImportBronFormaat | null;
  fout: string | null;
  ontbrekendeKolommen: string[];
  /** Het bestand is als geheel niet te importeren (import-scans.md, "Bestanden die niet te importeren zijn"). */
  overgeslagenReden?: string | null;
}

/** De reden waarom een bestand niet meedoet, of `null` als het wél rijen levert. Elk zo'n bestand telt als overgeslagen. */
function bestandReden(b: BestandStatus): string | null {
  if (b.overgeslagenReden) return b.overgeslagenReden;
  if (b.fout) return b.fout;
  if (b.ontbrekendeKolommen.length > 0) return `Mist verplichte kolommen: ${b.ontbrekendeKolommen.join(", ")}.`;
  return null;
}

/** Een gevalideerde rij, met erbij uit welk bestand ze komt (meerdere bestanden tegelijk, zie hieronder). */
interface RijMetBron extends GevalideerdeRij {
  bestandsnaam: string;
}

/** `rijNummer` is uniek per bestand (lib/import-legacy.ts), niet over bestanden heen: dit is de sleutel die hier wél overal uniek is. */
function rijSleutel(rij: Pick<RijMetBron, "bestandsnaam" | "rijNummer">): string {
  return `${rij.bestandsnaam}::${rij.rijNummer}`;
}

/**
 * De import start in het organisatie-detail, dus de doelorganisatie ligt vast (`import-scans.md`, Organisatie-matching, Vanuit
 * een organisatie). Per organisatienaam in het bestand zijn er twee keuzes: Koppelen aan deze organisatie of overslaan.
 */
type OrgActie = "koppelen" | "overslaan";
interface OrgKeuze {
  actie: OrgActie;
  /** Alleen bij `actie === "koppelen"`: Altijd de doelorganisatie. */
  organisatieId?: string;
}

/**
 * Beheerpunt 8 (`beheerpagina.md`): import van scans uit een of meerdere CSV-bestanden tegelijk, elk in een van twee
 * bronformaten (`import-scans.md`), vanuit het organisatie-detail en dus voor één doelorganisatie. Het bronformaat wordt per
 * bestand uit de inhoud zelf bepaald (`detecteerBronFormaat`), niet vooraf door de beheerder gekozen.
 *
 * **Organisatie, één keer per unieke naam** (import-scans.md, "Over rijen heen in één bestand"): Niet een dropdown per rij,
 * maar één keuze (koppelen aan deze organisatie of overslaan) per unieke `organisatieNaam`, toegepast op alle rijen met die
 * naam. Een exacte match met de naam van deze organisatie staat standaard op koppelen, de rest op overslaan.
 *
 * **Binnen één beheersessie delen rijen met dezelfde organisatie, Assessment en Meting-label één Meting**, ook over meerdere
 * afzonderlijke bevestigingen heen (import-scans.md, "Meting"). `metingIdPerSleutel` onthoudt daarvoor wat deze sessie al is
 * aangemaakt, zodat een latere `voerLegacyImportUit`-aanroep het echte id meekrijgt.
 *
 * Alleen voor een Admin: De pagina die dit toont, controleert dat (`magImporteren`).
 */
export function ImportScans({ doel }: { doel: Organisatie }) {
  const assessments = useAssessments();
  const gebruiker = useIngelogdeGebruiker();

  const [bestanden, setBestanden] = useState<BestandStatus[]>([]);
  const [rijen, setRijen] = useState<RijMetBron[] | null>(null);
  const [orgKeuzePerNaam, setOrgKeuzePerNaam] = useState<Record<string, OrgKeuze>>({});
  const [geimporteerdeSleutels, setGeimporteerdeSleutels] = useState<Set<string>>(new Set());
  // Goedgekeurde waarschuwingsrijen (95%+-match): Goedkeuren is alleen een keuze om mee te nemen en schrijft niets weg.
  const [goedgekeurdeSleutels, setGoedgekeurdeSleutels] = useState<Set<string>>(new Set());
  const [orgIdPerNaam, setOrgIdPerNaam] = useState<Record<string, string>>({});
  // Per doelorganisatie, Assessment en bronnaam de Metingen die deze import al aanmaakte, per label (`LegacyImportKeuze.bekendeMetingen`).
  const [metingIdPerSleutel, setMetingIdPerSleutel] = useState<Record<string, Record<string, string>>>({});
  // De meetdatum per Meting in het bestand, als de beheerder die aanpaste (`import-scans.md`, Meetdatum en onderdeel). Zonder
  // aanpassing geldt de afgeleide datum: De oudste datum van de scans die in de Meting komen.
  const [meetdatumPerMeting, setMeetdatumPerMeting] = useState<Record<string, string>>({});
  // Het onderdeel per bronnaam, als de beheerder het aanpaste (`import-scans.md`, Meetdatum en onderdeel). Leeg = de bronnaam.
  const [onderdeelPerBronnaam, setOnderdeelPerBronnaam] = useState<Record<string, string>>({});
  const [genegeerd, setGenegeerd] = useState<{ inSubmap: number; anderType: number }>({ inSubmap: 0, anderType: 0 });
  const [laatsteActie, setLaatsteActie] = useState<{ aantal: number } | null>(null);
  // Audit-log: De groep begint bij de eerste bevestiging van deze import, annuleren daarvoor logt
  // niets. Rijen die later één voor één alsnog worden geïmporteerd, komen bij dezelfde groep.
  const groepIdRef = useRef<string | null>(null);
  const bestandInputRef = useRef<HTMLInputElement>(null);
  const mapInputRef = useRef<HTMLInputElement>(null);

  /** Is de naam in het bestand gelijk aan de naam van deze organisatie? Dan staat de keuze standaard op koppelen. */
  function vindOrganisatieMatch(naam: string) {
    return doel.naam.trim() === naam.trim() ? doel : undefined;
  }

  /** Parseert/valideert één bestand, zelfde logica als voorheen voor één bestand — nu per bestand in `handleBestand` hieronder aangeroepen. */
  async function verwerkBestand(
    bestand: File
  ): Promise<{ status: BestandStatus; rijen: RijMetBron[] }> {
    let tekst: string;
    try {
      tekst = await bestand.text();
    } catch (error: unknown) {
      console.error("[import] Bestand lezen mislukt:", bestand.name, error);
      return {
        status: {
          naam: bestand.name,
          bronFormaat: null,
          fout:
            error instanceof Error
              ? `Bestand lezen mislukt: ${error.message}`
              : "Bestand lezen mislukt door een onverwachte fout.",
          ontbrekendeKolommen: [],
        },
        rijen: [],
      };
    }

    const overslaanReden = bestandOverslaanReden(tekst);
    if (overslaanReden) {
      return {
        status: { naam: bestand.name, bronFormaat: null, fout: null, ontbrekendeKolommen: [], overgeslagenReden: overslaanReden },
        rijen: [],
      };
    }

    const gedetecteerd = detecteerBronFormaat(tekst);
    if (!gedetecteerd) {
      return {
        status: {
          naam: bestand.name,
          bronFormaat: null,
          fout:
            "Kon het bronformaat niet bepalen: dit lijkt geen geldig CSV-bestand uit de oude tool of onze eigen export (verplichte kolommen ontbreken in de headerregel).",
          ontbrekendeKolommen: [],
        },
        rijen: [],
      };
    }

    // Assessment-type wordt per rij automatisch bepaald ("oud": uit de
    // bouwblok-/domeinnamen; "nieuw": op assessment_naam), niet vooraf
    // gekozen (lib/import-legacy.ts).
    const { ontbrekendeKolommen, gevalideerd } =
      gedetecteerd === "oud"
        ? (() => {
            const r = parseLegacyCsv(tekst);
            return { ontbrekendeKolommen: r.ontbrekendeKolommen, gevalideerd: valideerLegacyRijen(r.rijen, assessments) };
          })()
        : (() => {
            const r = parseNieuweExportCsv(tekst);
            return {
              ontbrekendeKolommen: r.ontbrekendeKolommen,
              gevalideerd: valideerNieuweExportRijen(r.rijen, assessments),
            };
          })();

    if (ontbrekendeKolommen.length > 0) {
      return {
        status: { naam: bestand.name, bronFormaat: gedetecteerd, fout: null, ontbrekendeKolommen },
        rijen: [],
      };
    }

    return {
      status: { naam: bestand.name, bronFormaat: gedetecteerd, fout: null, ontbrekendeKolommen: [] },
      rijen: gevalideerd.map((rij) => ({ ...rij, bestandsnaam: bestand.name })),
    };
  }

  // Meerdere CSV's tegelijk selecteren en importeren, losse bestanden of een
  // hele map (beheerpagina.md, punt 8: "een map met losse CSV's ... of losse
  // bestanden"). Elk bestand wordt apart gelezen en zijn bronformaat apart
  // gedetecteerd (bestanden mogen onderling verschillen, bijv. een mix van
  // oude-tool- en eigen-export-bestanden), de gevalideerde rijen van alle
  // geslaagde bestanden komen daarna samen in één voorbeeldweergave/
  // importactie. Een bestand met een fout (onherkenbaar formaat, ontbrekende
  // kolommen) blokkeert de andere, wél geslaagde bestanden niet. Een nieuwe
  // selectie is een nieuwe beheersessie (import-scans.md, Meting): de
  // Meting/organisatie-geheugens hieronder worden dan ook gewist, niet
  // alleen de rijen.
  //
  // Bij een mapselectie (webkitdirectory) geldt `accept=".csv"` niet — de
  // browser levert alle bestanden uit de map (en submappen), dus niet-CSV-
  // bestanden (bijv. macOS' `.DS_Store`) worden hier stil overgeslagen in
  // plaats van als foutief bestand getoond.
  async function handleBestand(e: React.ChangeEvent<HTMLInputElement>) {
    const alleGekozen = Array.from(e.target.files ?? []);
    // Alleen `.csv`-bestanden die direct in de gekozen map staan: Submappen en andere bestandstypes
    // worden genegeerd en in de samenvatting genoemd (import-scans.md, "Map met losse bestanden").
    const inSubmap = (b: File) => (b.webkitRelativePath ?? "").split("/").length > 2;
    const gekozen = alleGekozen.filter((b) => b.name.toLowerCase().endsWith(".csv") && !inSubmap(b));
    const aantalInSubmap = alleGekozen.filter((b) => b.name.toLowerCase().endsWith(".csv") && inSubmap(b)).length;
    const aantalAnderType = alleGekozen.filter((b) => !b.name.toLowerCase().endsWith(".csv") && !inSubmap(b)).length;
    e.target.value = "";
    if (gekozen.length === 0 && aantalInSubmap === 0 && aantalAnderType === 0) return;
    setGenegeerd({ inSubmap: aantalInSubmap, anderType: aantalAnderType });
    setLaatsteActie(null);
    groepIdRef.current = null;
    setGeimporteerdeSleutels(new Set());
    setGoedgekeurdeSleutels(new Set());
    setOrgIdPerNaam({});
    setMetingIdPerSleutel({});

    const resultaten = await Promise.all(gekozen.map(verwerkBestand));

    setBestanden(resultaten.map((r) => r.status));
    const alleRijen = resultaten.flatMap((r) => r.rijen);
    setRijen(alleRijen);

    // Organisatie, één keuze per unieke naam (import-scans.md, "Over rijen heen in één bestand", Vanuit een organisatie): Een
    // exacte match met de naam van deze organisatie is koppelen, de rest staat op overslaan tot de beheerder koppelt.
    const defaultKeuzes: Record<string, OrgKeuze> = {};
    alleRijen.forEach((rij) => {
      if (defaultKeuzes[rij.organisatieNaam]) return;
      defaultKeuzes[rij.organisatieNaam] = vindOrganisatieMatch(rij.organisatieNaam)
        ? { actie: "koppelen", organisatieId: doel.id }
        : { actie: "overslaan" };
    });
    setOrgKeuzePerNaam(defaultKeuzes);
  }

  const meerdereBestanden = bestanden.length > 1;
  const overgeslagenBestanden = bestanden.filter((b) => bestandReden(b) !== null);

  /** Organisaties, gegroepeerd op unieke naam, in bestandsvolgorde van eerste voorkomen — voor het keuzeblok en de samenvatting. */
  const uniekeOrganisatieNamen = useMemo(() => {
    const namen: string[] = [];
    (rijen ?? []).forEach((rij) => {
      if (!namen.includes(rij.organisatieNaam)) namen.push(rij.organisatieNaam);
    });
    return namen;
  }, [rijen]);

  const keuzeVoorNaam = useCallback(
    (naam: string): OrgKeuze => orgKeuzePerNaam[naam] ?? { actie: "overslaan" },
    [orgKeuzePerNaam]
  );

  /** Mag deze rij nu (nog) geïmporteerd worden: niet al eerder deze sessie gedaan, en haar organisatie niet overgeslagen. */
  const isActioneerbaar = useCallback(
    (rij: RijMetBron): boolean => {
      if (!rij.ok) return false;
      if (geimporteerdeSleutels.has(rijSleutel(rij))) return false;
      return keuzeVoorNaam(rij.organisatieNaam).actie !== "overslaan";
    },
    [geimporteerdeSleutels, keuzeVoorNaam]
  );

  // De set achter de ene knop "N rijen importeren": Rijen zonder probleem, plus de waarschuwingsrijen die zijn goedgekeurd.
  const rijenKlaarVoorBulk = useMemo(
    () => (rijen ?? []).filter((r) => isActioneerbaar(r) && (!r.vereistBevestiging || goedgekeurdeSleutels.has(rijSleutel(r)))),
    [rijen, isActioneerbaar, goedgekeurdeSleutels]
  );
  const nogNietGoedgekeurd = useMemo(
    () => (rijen ?? []).filter((r) => isActioneerbaar(r) && r.vereistBevestiging && !goedgekeurdeSleutels.has(rijSleutel(r))),
    [rijen, isActioneerbaar, goedgekeurdeSleutels]
  );
  const probleemRijen = useMemo(() => (rijen ?? []).filter((r) => !r.ok), [rijen]);
  const overgeslagenRijen = useMemo(
    () => (rijen ?? []).filter((r) => r.ok && keuzeVoorNaam(r.organisatieNaam).actie === "overslaan"),
    [rijen, keuzeVoorNaam]
  );

  /** De doelorganisatie van een bronnaam: Het echte id als dat al bekend is, anders de gekozen organisatie, anders een eigen (nieuwe) organisatie per naam. */
  const doelVan = useCallback(
    (naam: string): string => {
      const keuze = keuzeVoorNaam(naam);
      return orgIdPerNaam[naam] ?? (keuze.actie === "koppelen" && keuze.organisatieId ? keuze.organisatieId : `overslaan::${naam}`);
    },
    [keuzeVoorNaam, orgIdPerNaam]
  );

  /**
   * Hoeveel verschillende bronnamen aan dezelfde organisatie zijn gekoppeld, over de hele import (`import-scans.md`, Meting): Bij twee
   * of meer krijgt elke bronnaam zijn eigen Meting, met de bronnaam achter het label. Bij maar één zegt de bronnaam niets extra's.
   */
  const bronnamenPerDoel = useMemo(() => {
    const perDoel = new Map<string, Set<string>>();
    for (const r of rijen ?? []) {
      if (!r.ok || keuzeVoorNaam(r.organisatieNaam).actie === "overslaan") continue;
      const doel = doelVan(r.organisatieNaam);
      const set = perDoel.get(doel) ?? new Set<string>();
      set.add(r.organisatieNaam.trim());
      perDoel.set(doel, set);
    }
    return perDoel;
  }, [rijen, keuzeVoorNaam, doelVan]);

  /** De sleutel van een Meting in het bestand: Assessment, bronnaam en importlabel (`import-scans.md`, Meting). */
  const metingSleutelVan = (r: { assessmentId?: string | null; organisatieNaam: string; meetingLabel: string }) =>
    `${r.assessmentId ?? ""}::${r.organisatieNaam.trim()}::${r.meetingLabel}`;

  /**
   * De Metingen die deze import aanmaakt, met de afgeleide meetdatum (de oudste datum van haar scans) en het aantal scans. Alleen
   * rijen die meegaan: Niet overgeslagen, niet al geïmporteerd en zonder probleem.
   */
  const metingenInBestand = useMemo(() => {
    const perSleutel = new Map<string, { sleutel: string; bronnaam: string; assessmentNaam: string; label: string; scans: number; afgeleid: string }>();
    for (const r of rijen ?? []) {
      if (!r.ok || keuzeVoorNaam(r.organisatieNaam).actie === "overslaan" || geimporteerdeSleutels.has(rijSleutel(r))) continue;
      const sleutel = metingSleutelVan(r);
      const bestaand = perSleutel.get(sleutel);
      const datum = r.meetdatum ?? "";
      if (!bestaand) {
        perSleutel.set(sleutel, {
          sleutel,
          bronnaam: r.organisatieNaam.trim(),
          assessmentNaam: r.assessmentNaam ?? "—",
          label: r.meetingLabel,
          scans: 1,
          afgeleid: datum,
        });
      } else {
        bestaand.scans += 1;
        if (datum && (!bestaand.afgeleid || datum < bestaand.afgeleid)) bestaand.afgeleid = datum;
      }
    }
    return [...perSleutel.values()];
  }, [rijen, keuzeVoorNaam, geimporteerdeSleutels]);

  /** Is er een organisatie met meerdere bronnamen, dan krijgt de koppeltabel een kolom "Onderdeel" (`import-scans.md`, Meetdatum en onderdeel). */
  const metOnderdelen = [...bronnamenPerDoel.values()].some((set) => set.size >= 2);

  /** Resolve't het organisatie-/Meting-id voor één rij, vóór het bouwen van een `LegacyImportKeuze` (zie de uitleg bij de Provider hierboven). */
  function bouwKeuze(rij: RijMetBron): LegacyImportKeuze {
    const keuze = keuzeVoorNaam(rij.organisatieNaam);
    const organisatieId = orgIdPerNaam[rij.organisatieNaam] ?? (keuze.actie === "koppelen" ? keuze.organisatieId ?? doel.id : doel.id);
    const bronnaam = rij.organisatieNaam.trim();
    const bekendeMetingen = organisatieId ? metingIdPerSleutel[`${organisatieId}::${rij.assessmentId}::${bronnaam}`] : undefined;
    const bronnaamInLabel = (bronnamenPerDoel.get(doelVan(rij.organisatieNaam))?.size ?? 0) >= 2;
    // Het onderdeel geldt alleen bij meerdere bronnamen: Bij één bronnaam is het "Hele organisatie" of de kolom `onderdeel`.
    const onderdeel = bronnaamInLabel ? onderdeelPerBronnaam[bronnaam]?.trim() || undefined : undefined;
    const meetdatum = meetdatumPerMeting[metingSleutelVan(rij)] || undefined;
    return { rij, assessmentId: rij.assessmentId!, organisatieId, bronnaam, bronnaamInLabel, bekendeMetingen, meetdatum, onderdeel };
  }

  /** Na een geslaagde `voerLegacyImportUit`-aanroep: de org/Meting-geheugens bijwerken en de rijen als "geïmporteerd" markeren. */
  function verwerkResultaat(
    verwerkteRijen: RijMetBron[],
    resultaat: { geimporteerd: number; rijResultaten: LegacyImportRijResultaat[] }
  ) {
    setOrgIdPerNaam((prev) => {
      const nieuw = { ...prev };
      verwerkteRijen.forEach((rij, i) => {
        nieuw[rij.organisatieNaam] = resultaat.rijResultaten[i].organisatieId;
      });
      return nieuw;
    });
    setMetingIdPerSleutel((prev) => {
      const nieuw = { ...prev };
      verwerkteRijen.forEach((rij, i) => {
        const { organisatieId, scanUitvoeringId, label, bronnaam } = resultaat.rijResultaten[i];
        const sleutel = `${organisatieId}::${rij.assessmentId}::${bronnaam}`;
        nieuw[sleutel] = { ...(nieuw[sleutel] ?? {}), [label]: scanUitvoeringId };
      });
      return nieuw;
    });
    setGeimporteerdeSleutels((prev) => {
      const nieuw = new Set(prev);
      verwerkteRijen.forEach((rij) => nieuw.add(rijSleutel(rij)));
      return nieuw;
    });
    setLaatsteActie({ aantal: resultaat.geimporteerd });
  }

  /** Geeft het groep-id van deze import, en logt `import.gestart` en `import.rijMislukt` bij de eerste bevestiging. */
  function zorgVoorImportGroep(): string {
    if (groepIdRef.current) return groepIdRef.current;
    const groepId = nieuweGroepId();
    groepIdRef.current = groepId;
    logAudit([
      {
        actie: "import.gestart",
        entiteitType: "import",
        entiteitId: groepId,
        groepId,
        details: {
          aantalBestanden: bestanden.length,
          bestanden: bestanden.map((b) => ({
            naam: b.naam,
            bronFormaat: b.bronFormaat,
            overgeslagen: bestandReden(b) !== null,
            reden: bestandReden(b),
          })),
          aantalRijen: rijen?.length ?? 0,
          // Per rij wat de beheerder vooraf zag (geen gegevens van de Respondent), zodat de groep in de Audit-log
          // ook de rijen toont die nog niet zijn geïmporteerd (`beheerpagina.md`, punt 12).
          rijen: (rijen ?? []).map((r) => ({
            bestand: r.bestandsnaam,
            rijNummer: r.rijNummer,
            assessmentNaam: r.assessmentNaam ?? null,
            organisatieNaam: r.organisatieNaam,
          })),
        },
      },
      ...probleemRijen.map((r) => ({
        actie: "import.rijMislukt",
        entiteitType: "import",
        entiteitId: groepId,
        groepId,
        details: {
          bestand: r.bestandsnaam,
          rijNummer: r.rijNummer,
          assessmentNaam: r.assessmentNaam ?? null,
          organisatieNaam: r.organisatieNaam,
          reden: r.probleem ?? null,
        },
      })),
    ]);
    return groepId;
  }

  function handleBulkBevestigen() {
    if (rijenKlaarVoorBulk.length === 0 || !gebruiker) return;
    const keuzes = rijenKlaarVoorBulk.map(bouwKeuze);
    // Een nieuw aangemaakte organisatie krijgt de importerende gebruiker als
    // aanmaker (bereik "aangemaakt", lib/rechten.ts); een hergebruikte
    // organisatie behoudt haar eigen aangemaaktDoor.
    const res = voerLegacyImportUit(keuzes, gebruiker.id, zorgVoorImportGroep());
    if (res.geweigerd) return;
    verwerkResultaat(rijenKlaarVoorBulk, res);
  }

  function zetGoedkeuring(rij: RijMetBron, goedgekeurd: boolean) {
    setGoedgekeurdeSleutels((prev) => {
      const nieuw = new Set(prev);
      if (goedgekeurd) nieuw.add(rijSleutel(rij));
      else nieuw.delete(rijSleutel(rij));
      return nieuw;
    });
  }

  const totaalRijen = rijen?.length ?? 0;
  // "Importeer 37 rijen, 2 bestanden overgeslagen" (import-scans.md, Werkwijze in beheer, punt 6).
  const importKnopTekst =
    `Importeer ${rijenKlaarVoorBulk.length} rij${rijenKlaarVoorBulk.length === 1 ? "" : "en"}` +
    (overgeslagenBestanden.length > 0
      ? `, ${overgeslagenBestanden.length} bestand${overgeslagenBestanden.length === 1 ? "" : "en"} overgeslagen`
      : "");
  const nogTeKiezenNamen = uniekeOrganisatieNamen.filter((naam) => keuzeVoorNaam(naam).actie === "overslaan");

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Organisaties", href: "/beheer/organisaties" },
          { label: doel.naam, href: `/beheer/organisaties/${doel.id}` },
          { label: "Importeren" },
        ]}
      />
      <h1>Importeren in {doel.naam}</h1>
      <p className="text-sm text-ink-m">
        Ingevulde scans uit een CSV-bestand in {doel.naam} zetten, uit de oude, stopgezette tool of uit onze eigen export. Alle
        scans komen in deze organisatie terecht.
      </p>

      {laatsteActie && (
        <div className="admin-notice" style={{ marginTop: "1.5rem" }}>
          {laatsteActie.aantal} scan{laatsteActie.aantal === 1 ? "" : "s"} geïmporteerd.{" "}
          <Link href="/beheer/resultaten/metingen">Bekijk de Metingen →</Link>
        </div>
      )}

      <div className="admin-field" style={{ marginTop: "1.5rem", maxWidth: "34rem" }}>
        <label>CSV-bestanden</label>
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline btn-compact"
            style={{ flex: "none", whiteSpace: "nowrap" }}
            onClick={() => bestandInputRef.current?.click()}
          >
            Bestanden kiezen
          </button>
          <button
            type="button"
            className="btn btn-outline btn-compact"
            style={{ flex: "none", whiteSpace: "nowrap" }}
            onClick={() => mapInputRef.current?.click()}
          >
            Map kiezen
          </button>
          <span className="text-sm text-ink-m" style={{ overflowWrap: "anywhere" }}>
            {bestanden.length === 0
              ? "Geen bestanden gekozen"
              : `${bestanden.length} bestand${bestanden.length === 1 ? "" : "en"} gekozen`}
          </span>
          <InfoIcoon naastVeld sleutel="info.importBestanden" />
        </div>
        <input
          ref={bestandInputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={handleBestand}
          style={{ display: "none" }}
        />
        <input
          ref={(el) => {
            mapInputRef.current = el;
            // `webkitdirectory`/`directory` bestaan niet als React-prop (geen
            // standaard HTML-attribuut), vandaar hier rechtstreeks op het
            // DOM-element gezet: laat de bestandskiezer een hele map (incl.
            // submappen) selecteren i.p.v. losse bestanden.
            el?.setAttribute("webkitdirectory", "");
            el?.setAttribute("directory", "");
          }}
          type="file"
          multiple
          onChange={handleBestand}
          style={{ display: "none" }}
        />
      </div>

      {/* Bovenaan de overgeslagen bestanden met hun reden, vóór de organisatiekeuzes (import-scans.md, Werkwijze in beheer, punt 3). */}
      {overgeslagenBestanden.length > 0 && (
        <div className="admin-notice" style={{ marginTop: "1rem", borderColor: "var(--stat-red)" }} role="alert">
          <strong>
            {overgeslagenBestanden.length} bestand{overgeslagenBestanden.length === 1 ? "" : "en"} overgeslagen
          </strong>
          <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.2rem" }}>
            {overgeslagenBestanden.map((b) => (
              <li key={b.naam}>
                <strong>{b.naam}</strong>: {bestandReden(b)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {bestanden.length > 0 && (
        <ul className="text-sm text-ink-m mt-2" style={{ listStyle: "none", padding: 0 }}>
          {bestanden
            .filter((b) => bestandReden(b) === null)
            .map((b) => (
              <li key={b.naam} style={{ marginBottom: "0.3rem" }}>
                <strong>{b.naam}</strong>
                {b.bronFormaat && <> — gedetecteerd: {BRONFORMAAT_LABEL[b.bronFormaat]}</>}
              </li>
            ))}
        </ul>
      )}

      {rijen && rijen.length > 0 && (
        <>
          {/* Samenvatting van het bestand (import-scans.md, Werkwijze in beheer, punt 3). */}
          <div className="admin-notice" style={{ marginTop: "1rem" }}>
            <strong>{bestanden.length}</strong> bestand{bestanden.length === 1 ? "" : "en"}
            {genegeerd.inSubmap > 0 && <>, {genegeerd.inSubmap} CSV in submappen genegeerd</>}
            {genegeerd.anderType > 0 && <>, {genegeerd.anderType} bestand{genegeerd.anderType === 1 ? "" : "en"} van een ander type genegeerd</>}
            . <strong>{totaalRijen}</strong> rij{totaalRijen === 1 ? "" : "en"}, waarvan{" "}
            <strong>{uniekeOrganisatieNamen.length - nogTeKiezenNamen.length}</strong> organisatienaam
            {uniekeOrganisatieNamen.length - nogTeKiezenNamen.length === 1 ? "" : "en"} gekoppeld aan {doel.naam},{" "}
            <strong>{nogTeKiezenNamen.length}</strong> nog over te slaan of te koppelen hieronder, en{" "}
            <strong>{probleemRijen.length}</strong> rijen met een probleem.
            <br />
            Per Assessment-type:{" "}
            {Object.entries(
              rijen.reduce<Record<string, number>>((acc, r) => {
                const naam = r.assessmentNaam ?? "onbepaald";
                acc[naam] = (acc[naam] ?? 0) + 1;
                return acc;
              }, {})
            )
              .map(([naam, n]) => `${naam} (${n})`)
              .join(", ")}
            .
          </div>

          {/* Organisatie koppelen, één keuze per unieke naam (import-scans.md, "Over rijen heen in één bestand"). */}
          <div className="flex flex-wrap items-center gap-3">
            <h2 style={{ margin: 0 }}>Organisaties koppelen</h2>
            {nogTeKiezenNamen.length > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-compact"
                onClick={() => {
                  setGoedgekeurdeSleutels(new Set());
                  setOrgKeuzePerNaam((prev) => {
                    const nieuw = { ...prev };
                    for (const naam of uniekeOrganisatieNamen) nieuw[naam] = { actie: "koppelen", organisatieId: doel.id };
                    return nieuw;
                  });
                }}
              >
                Alles koppelen aan {doel.naam}
              </button>
            )}
          </div>
          <table className="admin-table" style={{ marginBottom: "1.5rem" }}>
            <thead>
              <tr>
                <th>Organisatienaam (in CSV)</th>
                <th>Rijen</th>
                <th>Keuze</th>
                {metOnderdelen && <th>Onderdeel</th>}
              </tr>
            </thead>
            <tbody>
              {uniekeOrganisatieNamen.map((naam) => {
                const aantalRijen = rijen.filter((r) => r.organisatieNaam === naam).length;
                const exacteMatch = vindOrganisatieMatch(naam);
                const keuze = keuzeVoorNaam(naam);
                const reedsVastgelegd = Boolean(orgIdPerNaam[naam]);
                return (
                  <tr key={naam}>
                    <td>{naam}</td>
                    <td>{aantalRijen}</td>
                    <td>
                      {reedsVastgelegd ? (
                        <span className="text-sm text-ink-m">Al gekoppeld aan {doel.naam} deze sessie</span>
                      ) : (
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <select
                            value={keuze.actie}
                            aria-label={`Keuze voor ${naam}`}
                            onChange={(e) => {
                              const waarde = e.target.value as OrgActie;
                              // Een gewijzigde organisatiekoppeling trekt de goedkeuring van de rijen van deze organisatie in.
                              setGoedgekeurdeSleutels((prev) => {
                                const nieuw = new Set(prev);
                                (rijen ?? []).filter((r) => r.organisatieNaam === naam).forEach((r) => nieuw.delete(rijSleutel(r)));
                                return nieuw;
                              });
                              setOrgKeuzePerNaam((prev) => ({
                                ...prev,
                                [naam]: waarde === "koppelen" ? { actie: "koppelen", organisatieId: doel.id } : { actie: "overslaan" },
                              }));
                            }}
                          >
                            <option value="koppelen">Koppelen aan: {doel.naam}</option>
                            <option value="overslaan">Overslaan</option>
                          </select>
                          {exacteMatch && <span className="text-sm text-ink-s">Gelijk aan de naam van deze organisatie</span>}
                        </div>
                      )}
                    </td>
                    {metOnderdelen && (
                      <td>
                        {(bronnamenPerDoel.get(doelVan(naam))?.size ?? 0) >= 2 ? (
                          <input
                            type="text"
                            className="veld-compact"
                            value={onderdeelPerBronnaam[naam.trim()] ?? naam.trim()}
                            onChange={(e) => setOnderdeelPerBronnaam((prev) => ({ ...prev, [naam.trim()]: e.target.value }))}
                            aria-label={`Onderdeel voor ${naam}`}
                          />
                        ) : (
                          <span className="text-sm text-ink-m">Hele organisatie</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {metingenInBestand.length > 0 && (
            <>
              <h2>Metingen</h2>
              <p className="text-sm text-ink-m">
                De meetdatum is de oudste datum van de scans in de Meting, zoals ze in het bestand staan. Pas hem aan als dat niet de dag
                is waarop gemeten is. Zonder datum staat de Meting in beheer als &ldquo;Datum ontbreekt&rdquo;.
              </p>
              <table className="admin-table" style={{ marginBottom: "1.5rem" }}>
                <thead>
                  <tr>
                    <th>Bronnaam</th>
                    <th>Assessment</th>
                    <th>Meting</th>
                    <th>Scans</th>
                    <th>Meetdatum</th>
                  </tr>
                </thead>
                <tbody>
                  {metingenInBestand.map((m) => (
                    <tr key={m.sleutel}>
                      <td>{m.bronnaam}</td>
                      <td>{m.assessmentNaam}</td>
                      <td>{m.label}</td>
                      <td>{m.scans}</td>
                      <td>
                        <input
                          type="date"
                          className="veld-compact"
                          value={meetdatumPerMeting[m.sleutel] ?? m.afgeleid}
                          aria-label={`Meetdatum voor ${m.label} van ${m.bronnaam}`}
                          onChange={(e) => setMeetdatumPerMeting((prev) => ({ ...prev, [m.sleutel]: e.target.value }))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <h2>Voorbeeldweergave</h2>
          <table className="admin-table" style={{ marginBottom: "1.5rem" }}>
            <thead>
              <tr>
                {meerdereBestanden && <th>Bestand</th>}
                <th>Rij</th>
                <th>Assessment</th>
                <th>Organisatie</th>
                <th>Respondent</th>
                <th>Notitie</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rijen.map((rij) => {
                const sleutel = rijSleutel(rij);
                const geimporteerd = geimporteerdeSleutels.has(sleutel);
                const orgActie = keuzeVoorNaam(rij.organisatieNaam).actie;
                return (
                  <tr key={sleutel}>
                    {meerdereBestanden && <td>{rij.bestandsnaam}</td>}
                    <td>{rij.rijNummer}</td>
                    <td>{rij.assessmentNaam ?? "—"}</td>
                    <td>{rij.organisatieNaam}</td>
                    <td>{rij.respondentEmail}</td>
                    <td className="cel-notitie" title={rij.scanNotitie || undefined}>
                      {rij.scanNotitie}
                    </td>
                    <td>
                      {geimporteerd ? (
                        <span className="admin-badge status-afgerond">Geïmporteerd</span>
                      ) : !rij.ok ? (
                        <span className="admin-badge status-uitgenodigd" title={rij.probleem}>
                          {rij.probleem}
                        </span>
                      ) : orgActie === "overslaan" ? (
                        <span className="admin-badge status-uitgenodigd">Organisatie overgeslagen</span>
                      ) : rij.vereistBevestiging && goedgekeurdeSleutels.has(sleutel) ? (
                        <span className="admin-badge status-afgerond">Goedgekeurd</span>
                      ) : rij.vereistBevestiging ? (
                        <span
                          className="admin-badge status-bezig"
                          title={`Afwijkende vragen: ${(rij.afwijkendeVragen ?? []).join("; ")}`}
                        >
                          {String(rij.assessmentMatchPercentage).replace(".", ",")}% match, goedkeuring nodig
                        </span>
                      ) : (
                        <span className="admin-badge status-afgerond">Klaar om te importeren</span>
                      )}
                    </td>
                    <td>
                      {!geimporteerd && rij.ok && orgActie !== "overslaan" && rij.vereistBevestiging && (
                        <button
                          type="button"
                          className="btn btn-outline btn-compact"
                          onClick={() => zetGoedkeuring(rij, !goedgekeurdeSleutels.has(sleutel))}
                        >
                          {goedgekeurdeSleutels.has(sleutel) ? "Goedkeuring intrekken" : "Goedkeuren"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {probleemRijen.length > 0 && (
            <p className="text-sm text-ink-m">
              {probleemRijen.length} rij{probleemRijen.length === 1 ? "" : "en"} met een
              matchingprobleem word{probleemRijen.length === 1 ? "t" : "en"} niet geïmporteerd.
            </p>
          )}
          {overgeslagenRijen.length > 0 && (
            <p className="text-sm text-ink-m">
              {overgeslagenRijen.length} rij{overgeslagenRijen.length === 1 ? "" : "en"} met een
              overgeslagen organisatie word{overgeslagenRijen.length === 1 ? "t" : "en"} niet
              geïmporteerd — kies hierboven alsnog &quot;Koppelen&quot; of &quot;Nieuwe organisatie
              aanmaken&quot; om ze alsnog te importeren.
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn btn-or"
              disabled={rijenKlaarVoorBulk.length === 0}
              onClick={handleBulkBevestigen}
            >
              {importKnopTekst}
            </button>
            {nogNietGoedgekeurd.length > 0 && (
              <>
                <span className="text-sm text-ink-m">
                  {nogNietGoedgekeurd.length} rij{nogNietGoedgekeurd.length === 1 ? "" : "en"} wacht
                  {nogNietGoedgekeurd.length === 1 ? "" : "en"} op goedkeuring
                </span>
                <InfoIcoon sleutel="info.importRijen" />
              </>
            )}
          </div>
        </>
      )}

      {rijen && rijen.length === 0 && (
        <p className="text-sm text-ink-m">
          Geen rijen gevonden om te importeren{bestanden.length > 1 ? " in deze bestanden" : " in dit bestand"}.
        </p>
      )}
    </div>
  );
}
