"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties, voerLegacyImportUit, LegacyImportKeuze, LegacyImportRijResultaat } from "@/lib/db";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { zichtbareOrganisaties } from "@/lib/rechten";
import {
  ImportBronFormaat,
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
export default function ImportLegacyPage() {
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
  const [orgIdPerNaam, setOrgIdPerNaam] = useState<Record<string, string>>({});
  const [metingIdPerSleutel, setMetingIdPerSleutel] = useState<Record<string, string>>({});
  const [laatsteActie, setLaatsteActie] = useState<{ aantal: number } | null>(null);
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
    const gekozen = Array.from(e.target.files ?? []).filter((bestand) =>
      bestand.name.toLowerCase().endsWith(".csv")
    );
    e.target.value = "";
    if (gekozen.length === 0) return;
    setLaatsteActie(null);
    setGeimporteerdeSleutels(new Set());
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

  const rijenKlaarVoorBulk = useMemo(
    () => (rijen ?? []).filter((r) => isActioneerbaar(r) && !r.vereistBevestiging),
    [rijen, isActioneerbaar]
  );
  const rijenVoorIndividueleBevestiging = useMemo(
    () => (rijen ?? []).filter((r) => isActioneerbaar(r) && r.vereistBevestiging),
    [rijen, isActioneerbaar]
  );
  const probleemRijen = useMemo(() => (rijen ?? []).filter((r) => !r.ok), [rijen]);
  const overgeslagenRijen = useMemo(
    () => (rijen ?? []).filter((r) => r.ok && keuzeVoorNaam(r.organisatieNaam).actie === "overslaan"),
    [rijen, keuzeVoorNaam]
  );

  /** Resolve't het organisatie-/Meting-id voor één rij, vóór het bouwen van een `LegacyImportKeuze` (zie de uitleg bij de Provider hierboven). */
  function bouwKeuze(rij: RijMetBron): LegacyImportKeuze {
    const keuze = keuzeVoorNaam(rij.organisatieNaam);
    const organisatieId =
      orgIdPerNaam[rij.organisatieNaam] ?? (keuze.actie === "koppelen" ? keuze.organisatieId ?? null : null);
    const metingSleutel = organisatieId ? `${organisatieId}::${rij.assessmentId}::${rij.meetingLabel}` : null;
    const metingId = metingSleutel ? metingIdPerSleutel[metingSleutel] : undefined;
    return { rij, assessmentId: rij.assessmentId!, organisatieId, metingId };
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
        const { organisatieId, scanUitvoeringId } = resultaat.rijResultaten[i];
        nieuw[`${organisatieId}::${rij.assessmentId}::${rij.meetingLabel}`] = scanUitvoeringId;
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

  function handleBulkBevestigen() {
    if (rijenKlaarVoorBulk.length === 0 || !gebruiker) return;
    const keuzes = rijenKlaarVoorBulk.map(bouwKeuze);
    // Een nieuw aangemaakte organisatie krijgt de importerende gebruiker als
    // aanmaker (bereik "aangemaakt", lib/rechten.ts); een hergebruikte
    // organisatie behoudt haar eigen aangemaaktDoor.
    const res = voerLegacyImportUit(keuzes, gebruiker.id);
    verwerkResultaat(rijenKlaarVoorBulk, res);
  }

  function handleRijBevestigen(rij: RijMetBron) {
    if (!gebruiker) return;
    const res = voerLegacyImportUit([bouwKeuze(rij)], gebruiker.id);
    verwerkResultaat([rij], res);
  }

  const totaalRijen = rijen?.length ?? 0;
  const nogTeKiezenNamen = uniekeOrganisatieNamen.filter((naam) => !vindOrganisatieMatch(naam));

  return (
    <div className="admin-main admin-main--breed">
      <Link href="/beheer/organisaties" className="admin-back">
        ← Organisaties
      </Link>
      <h1>Import van scans</h1>
      <p className="text-sm text-ink-m">
        Ingevulde scans uit een CSV-bestand in het datamodel zetten, uit de oude, stopgezette
        tool of uit onze eigen export. Volledige spec: <code>import-scans.md</code>.
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
          <InfoIcoon naastVeld>
            Meerdere bestanden tegelijk mogen: Houd Cmd/Ctrl (of Shift voor een reeks) ingedrukt bij het
            selecteren, of kies direct een hele map met losse CSV&apos;s. Elk bestand mag een ander bronformaat
            hebben, dat wordt per bestand apart herkend.
          </InfoIcoon>
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

      {bestanden.length > 0 && (
        <ul className="text-sm text-ink-m mt-2" style={{ listStyle: "none", padding: 0 }}>
          {bestanden.map((b) => (
            <li key={b.naam} style={{ marginBottom: "0.3rem" }}>
              <strong>{b.naam}</strong>
              {b.bronFormaat && !b.fout && b.ontbrekendeKolommen.length === 0 && (
                <> — gedetecteerd: {BRONFORMAAT_LABEL[b.bronFormaat]}</>
              )}
              {b.fout && <span style={{ color: "var(--stat-red)" }}> — {b.fout}</span>}
              {b.ontbrekendeKolommen.length > 0 && (
                <span style={{ color: "var(--stat-red)" }}>
                  {" "}
                  — mist verplichte kolommen: {b.ontbrekendeKolommen.join(", ")}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {rijen && rijen.length > 0 && (
        <>
          {/* Samenvatting van het bestand (import-scans.md, Werkwijze in beheer, punt 3). */}
          <div className="admin-notice" style={{ marginTop: "1rem" }}>
            <strong>{totaalRijen}</strong> rij{totaalRijen === 1 ? "" : "en"}, waarvan{" "}
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
                      ) : rij.vereistBevestiging ? (
                        <span
                          className="admin-badge status-bezig"
                          title={`Afwijkende vragen: ${(rij.afwijkendeVragen ?? []).join("; ")}`}
                        >
                          {rij.assessmentMatchPercentage}% match — bevestig los
                        </span>
                      ) : (
                        <span className="admin-badge status-afgerond">Klaar om te importeren</span>
                      )}
                    </td>
                    <td>
                      {!geimporteerd && rij.ok && orgActie !== "overslaan" && rij.vereistBevestiging && (
                        <button
                          type="button"
                          className="admin-sort-btn"
                          onClick={() => handleRijBevestigen(rij)}
                        >
                          Importeer deze rij
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
              {rijenKlaarVoorBulk.length} rij{rijenKlaarVoorBulk.length === 1 ? "" : "en"} importeren
            </button>
            {rijenVoorIndividueleBevestiging.length > 0 && (
              <InfoIcoon>
                {rijenVoorIndividueleBevestiging.length} rij
                {rijenVoorIndividueleBevestiging.length === 1 ? "" : "en"} met een 95%+-vraagtekstmatch (niet
                100%) telt hier niet in mee: Die bevestig je altijd los, met &quot;Importeer deze rij&quot; in
                de tabel hierboven.
              </InfoIcoon>
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
