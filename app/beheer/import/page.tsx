"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties, voerLegacyImportUit, LegacyImportKeuze, LegacyImportRijResultaat } from "@/lib/db";
import { logAudit, nieuweGroepId } from "@/lib/audit-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magImporteren, zichtbareOrganisaties } from "@/lib/rechten";
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

type OrgActie = "koppelen" | "nieuw" | "overslaan";
interface OrgKeuze {
  actie: OrgActie;
  /** Alleen bij `actie === "koppelen"`. */
  organisatieId?: string;
}

/**
 * Beheerpunt 8 (`beheerpagina.md`): import van scans uit een of meerdere
 * CSV-bestanden tegelijk, elk in een van twee bronformaten
 * (`import-scans.md`). Het bronformaat wordt per bestand uit de inhoud
 * zelf bepaald (`detecteerBronFormaat`), niet vooraf door de beheerder
 * gekozen — zelfde soort automatische detectie als het Assessment-type
 * per rij. Losse actie, niet gekoppeld aan één organisatie vooraf — die
 * volgt per rij uit de CSV.
 *
 * **Organisatie, één keer per unieke naam** (import-scans.md, "Over rijen
 * heen in één bestand"): Niet een dropdown per rij, maar één keuze
 * (koppelen/nieuw aanmaken/overslaan) per unieke `organisatieNaam`,
 * toegepast op alle rijen met die naam — `orgKeuzePerNaam` hieronder.
 *
 * **Binnen één beheersessie delen rijen met dezelfde organisatie,
 * Assessment en Meting-label één Meting**, ook over meerdere afzonderlijke
 * bevestigingen heen (bulk nu, een losse rij later) — import-scans.md,
 * "Meting". `orgIdPerNaam`/`metingIdPerSleutel` onthouden daarvoor welke
 * organisatie/Meting deze sessie al eerder is aangemaakt, zodat een latere
 * `voerLegacyImportUit`-aanroep het echte id meekrijgt i.p.v. opnieuw een
 * nieuwe aan te maken (`lib/db.ts`, `LegacyImportKeuze`).
 */
/**
 * Import is alleen voor een Admin (`beheerpagina.md`, punt 8; `import-scans.md`): Een Consultant ziet
 * alleen zijn eigen Organisaties en kan niet beoordelen of een Organisatie die de import nieuw
 * aanmaakt zomaar toegevoegd mag worden. Hij krijgt hier een melding in plaats van de importfunctie,
 * ook als hij de route rechtstreeks opent. De tekst staat vast in de code en hoort niet in het
 * register van Algemene teksten.
 */
export default function ImportPagina() {
  const gebruiker = useIngelogdeGebruiker();
  if (!magImporteren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Vraag de beheerder om bestanden te importeren.</p>
      </div>
    );
  }
  return <ImportLegacyPage />;
}

function ImportLegacyPage() {
  const assessments = useAssessments();
  const alleOrganisaties = useOrganisaties();
  const gebruiker = useIngelogdeGebruiker();
  // Bereik "eigen" (datamodel.md deel 2, Rechtenmatrix, metingen.plannen/
  // respondenten.uitnodigen): een Consultant mag alleen importeren in
  // organisaties die hij zelf aanmaakte of waaraan een Admin hem toewees.
  // Matcht de import verder niets, dan wordt een nieuwe organisatie
  // aangemaakt (met deze gebruiker als aanmaker), nooit weggeschreven naar
  // een organisatie buiten dit bereik.
  const organisaties = useMemo(
    () => zichtbareOrganisaties(gebruiker, alleOrganisaties),
    [gebruiker, alleOrganisaties]
  );

  const [bestanden, setBestanden] = useState<BestandStatus[]>([]);
  const [rijen, setRijen] = useState<RijMetBron[] | null>(null);
  const [orgKeuzePerNaam, setOrgKeuzePerNaam] = useState<Record<string, OrgKeuze>>({});
  const [geimporteerdeSleutels, setGeimporteerdeSleutels] = useState<Set<string>>(new Set());
  // Goedgekeurde waarschuwingsrijen (95%+-match): Goedkeuren is alleen een keuze om mee te nemen en schrijft niets weg.
  const [goedgekeurdeSleutels, setGoedgekeurdeSleutels] = useState<Set<string>>(new Set());
  const [orgIdPerNaam, setOrgIdPerNaam] = useState<Record<string, string>>({});
  // Per doelorganisatie, Assessment en bronnaam de Metingen die deze import al aanmaakte, per label (`LegacyImportKeuze.bekendeMetingen`).
  const [metingIdPerSleutel, setMetingIdPerSleutel] = useState<Record<string, Record<string, string>>>({});
  const [genegeerd, setGenegeerd] = useState<{ inSubmap: number; anderType: number }>({ inSubmap: 0, anderType: 0 });
  const [laatsteActie, setLaatsteActie] = useState<{ aantal: number } | null>(null);
  // Audit-log: De groep begint bij de eerste bevestiging van deze import, annuleren daarvoor logt
  // niets. Rijen die later één voor één alsnog worden geïmporteerd, komen bij dezelfde groep.
  const groepIdRef = useRef<string | null>(null);
  const bestandInputRef = useRef<HTMLInputElement>(null);
  const mapInputRef = useRef<HTMLInputElement>(null);

  function vindOrganisatieMatch(naam: string) {
    return organisaties.find((o) => o.naam.trim() === naam.trim());
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

    // Organisatie, één keuze per unieke naam (import-scans.md, "Over rijen
    // heen in één bestand"): een exacte match met een bestaande organisatie
    // vraagt geen keuze en wordt automatisch gekoppeld, anders is "nieuwe
    // organisatie aanmaken" de standaardkeuze.
    const defaultKeuzes: Record<string, OrgKeuze> = {};
    alleRijen.forEach((rij) => {
      if (defaultKeuzes[rij.organisatieNaam]) return;
      const match = vindOrganisatieMatch(rij.organisatieNaam);
      defaultKeuzes[rij.organisatieNaam] = match
        ? { actie: "koppelen", organisatieId: match.id }
        : { actie: "nieuw" };
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
    (naam: string): OrgKeuze => orgKeuzePerNaam[naam] ?? { actie: "nieuw" },
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
      return orgIdPerNaam[naam] ?? (keuze.actie === "koppelen" && keuze.organisatieId ? keuze.organisatieId : `nieuw::${naam}`);
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

  /** Resolve't het organisatie-/Meting-id voor één rij, vóór het bouwen van een `LegacyImportKeuze` (zie de uitleg bij de Provider hierboven). */
  function bouwKeuze(rij: RijMetBron): LegacyImportKeuze {
    const keuze = keuzeVoorNaam(rij.organisatieNaam);
    const organisatieId =
      orgIdPerNaam[rij.organisatieNaam] ?? (keuze.actie === "koppelen" ? keuze.organisatieId ?? null : null);
    const bronnaam = rij.organisatieNaam.trim();
    const bekendeMetingen = organisatieId ? metingIdPerSleutel[`${organisatieId}::${rij.assessmentId}::${bronnaam}`] : undefined;
    const bronnaamInLabel = (bronnamenPerDoel.get(doelVan(rij.organisatieNaam))?.size ?? 0) >= 2;
    return { rij, assessmentId: rij.assessmentId!, organisatieId, bronnaam, bronnaamInLabel, bekendeMetingen };
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
  const nogTeKiezenNamen = uniekeOrganisatieNamen.filter((naam) => !vindOrganisatieMatch(naam));

  return (
    <div className="admin-main admin-main--breed">
      <Link href="/beheer/organisaties" className="admin-back">
        ← Organisaties
      </Link>
      <h1>Import van scans</h1>
      <p className="text-sm text-ink-m">
        Ingevulde scans uit een CSV-bestand in het datamodel zetten, uit de oude, stopgezette
        tool of uit onze eigen export.
      </p>

      {laatsteActie && (
        <div className="admin-notice" style={{ marginTop: "1.5rem" }}>
          {laatsteActie.aantal} scan{laatsteActie.aantal === 1 ? "" : "s"} geïmporteerd.{" "}
          <Link href="/beheer/scans">Bekijk Ingevulde scans →</Link>
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
            <strong>{uniekeOrganisatieNamen.length - nogTeKiezenNamen.length}</strong> bij een bestaande
            organisatie, <strong>{nogTeKiezenNamen.length}</strong> bij een nieuwe organisatie (nog te
            kiezen hieronder), en <strong>{probleemRijen.length}</strong> met een probleem.
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
          <h2>Organisaties koppelen</h2>
          <table className="admin-table" style={{ marginBottom: "1.5rem" }}>
            <thead>
              <tr>
                <th>Organisatienaam (in CSV)</th>
                <th>Rijen</th>
                <th>Keuze</th>
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
                        <span className="text-sm text-ink-m">
                          Al gekoppeld deze sessie ({keuze.actie === "nieuw" ? "nieuw aangemaakt" : "bestaand"})
                        </span>
                      ) : exacteMatch ? (
                        <span className="text-sm text-ink-m">
                          Automatisch gekoppeld aan bestaande organisatie &quot;{exacteMatch.naam}&quot;
                        </span>
                      ) : (
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <select
                            value={keuze.actie === "koppelen" ? keuze.organisatieId ?? "" : keuze.actie}
                            onChange={(e) => {
                              const waarde = e.target.value;
                              // Een gewijzigde organisatiekoppeling trekt de goedkeuring van de rijen van deze organisatie in.
                              setGoedgekeurdeSleutels((prev) => {
                                const nieuw = new Set(prev);
                                (rijen ?? []).filter((r) => r.organisatieNaam === naam).forEach((r) => nieuw.delete(rijSleutel(r)));
                                return nieuw;
                              });
                              setOrgKeuzePerNaam((prev) => ({
                                ...prev,
                                [naam]:
                                  waarde === "nieuw" || waarde === "overslaan"
                                    ? { actie: waarde }
                                    : { actie: "koppelen", organisatieId: waarde },
                              }));
                            }}
                          >
                            <option value="nieuw">Nieuwe organisatie aanmaken</option>
                            <option value="overslaan">Overslaan</option>
                            {organisaties.map((o) => (
                              <option key={o.id} value={o.id}>
                                Koppelen aan: {o.naam}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2>Voorbeeldweergave</h2>
          <table className="admin-table" style={{ marginBottom: "1.5rem" }}>
            <thead>
              <tr>
                {meerdereBestanden && <th>Bestand</th>}
                <th>Rij</th>
                <th>Assessment</th>
                <th>Organisatie</th>
                <th>Respondent</th>
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
