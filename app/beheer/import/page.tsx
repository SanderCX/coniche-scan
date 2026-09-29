"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties, voerLegacyImportUit, LegacyImportKeuze } from "@/lib/db";
import {
  ImportBronFormaat,
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

/**
 * Beheerpunt 8 (`admin-beheerpagina.md`): import van scans uit een
 * CSV-bestand, in twee bronformaten (`import-legacy-scans.md`). Losse
 * actie, niet gekoppeld aan één organisatie vooraf — die volgt per rij uit
 * de CSV.
 */
export default function ImportLegacyPage() {
  const assessments = useAssessments();
  const organisaties = useOrganisaties();

  const [bronFormaat, setBronFormaat] = useState<ImportBronFormaat>("oud");
  const [rijen, setRijen] = useState<GevalideerdeRij[] | null>(null);
  const [ontbrekendeKolommen, setOntbrekendeKolommen] = useState<string[]>([]);
  const [organisatieKeuzePerRij, setOrganisatieKeuzePerRij] = useState<Record<number, string>>({});
  const [resultaat, setResultaat] = useState<{ geimporteerd: number } | null>(null);
  const [bestandsnaam, setBestandsnaam] = useState<string | null>(null);
  const bestandInputRef = useRef<HTMLInputElement>(null);

  function vindOrganisatieMatch(naam: string) {
    return organisaties.find((o) => o.naam === naam);
  }

  function handleBestand(e: React.ChangeEvent<HTMLInputElement>) {
    const bestand = e.target.files?.[0];
    if (!bestand) return;
    setResultaat(null);
    setBestandsnaam(bestand.name);
    bestand.text().then((tekst) => {
      // Assessment-type wordt per rij automatisch bepaald ("oud": uit de
      // bouwblok-/domeinnamen; "nieuw": op assessment_naam), niet vooraf
      // gekozen (lib/import-legacy.ts).
      const { ontbrekendeKolommen, gevalideerd } =
        bronFormaat === "oud"
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
      setOntbrekendeKolommen(ontbrekendeKolommen);
      if (ontbrekendeKolommen.length > 0) {
        setRijen(null);
        return;
      }
      setRijen(gevalideerd);
      const defaultKeuzes: Record<number, string> = {};
      gevalideerd.forEach((rij) => {
        const match = vindOrganisatieMatch(rij.organisatieNaam);
        if (match) defaultKeuzes[rij.rijNummer] = match.id;
      });
      setOrganisatieKeuzePerRij(defaultKeuzes);
    });
    e.target.value = "";
  }

  const okRijen = useMemo(() => rijen?.filter((r) => r.ok) ?? [], [rijen]);
  const probleemRijen = useMemo(() => rijen?.filter((r) => !r.ok) ?? [], [rijen]);

  function handleBevestigen() {
    if (okRijen.length === 0) return;
    const keuzes: LegacyImportKeuze[] = okRijen.map((rij) => ({
      rij,
      assessmentId: rij.assessmentId!,
      organisatieId: organisatieKeuzePerRij[rij.rijNummer] ?? null,
    }));
    const res = voerLegacyImportUit(keuzes);
    setResultaat(res);
    setRijen(null);
  }

  return (
    <div className="admin-main admin-main--breed">
      <Link href="/beheer" className="admin-back">
        ← Overzicht
      </Link>
      <h1>Import van scans</h1>
      <p className="text-sm text-ink-m">
        Ingevulde scans uit een CSV-bestand in het datamodel zetten, uit de oude, stopgezette
        tool of uit onze eigen export. Volledige spec: <code>import-legacy-scans.md</code>.
      </p>

      {resultaat && (
        <div className="admin-notice" style={{ marginTop: "1.5rem" }}>
          {resultaat.geimporteerd} scan{resultaat.geimporteerd === 1 ? "" : "s"} geïmporteerd.{" "}
          <Link href="/beheer/scans">Bekijk Ingevulde scans →</Link>
        </div>
      )}

      <div className="admin-field" style={{ marginTop: "1.5rem", maxWidth: "24rem" }}>
        <label>Bronformaat</label>
        <select
          value={bronFormaat}
          onChange={(e) => {
            setBronFormaat(e.target.value as ImportBronFormaat);
            setRijen(null);
            setOntbrekendeKolommen([]);
            setBestandsnaam(null);
            setResultaat(null);
          }}
        >
          {(Object.keys(BRONFORMAAT_LABEL) as ImportBronFormaat[]).map((f) => (
            <option key={f} value={f}>
              {BRONFORMAAT_LABEL[f]}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field" style={{ maxWidth: "24rem" }}>
        <label>CSV-bestand</label>
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          <button
            type="button"
            className="btn btn-outline btn-compact"
            style={{ flex: "none", whiteSpace: "nowrap" }}
            onClick={() => bestandInputRef.current?.click()}
          >
            Bestand kiezen
          </button>
          <span className="text-sm text-ink-m" style={{ overflowWrap: "anywhere" }}>
            {bestandsnaam ?? "Geen bestand gekozen"}
          </span>
        </div>
        <input
          ref={bestandInputRef}
          type="file"
          accept=".csv"
          onChange={handleBestand}
          style={{ display: "none" }}
        />
      </div>

      {ontbrekendeKolommen.length > 0 && (
        <div className="admin-notice" style={{ borderColor: "var(--stat-red)", color: "var(--stat-red)" }}>
          Dit bestand mist verplichte kolommen: {ontbrekendeKolommen.join(", ")}.
        </div>
      )}

      {rijen && rijen.length > 0 && (
        <>
          <h2>
            Voorbeeldweergave: {okRijen.length} van de {rijen.length} rijen klaar om te importeren
          </h2>

          <table className="admin-table" style={{ marginBottom: "1.5rem" }}>
            <thead>
              <tr>
                <th>Rij</th>
                <th>Assessment</th>
                <th>Organisatie</th>
                <th>Respondent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rijen.map((rij) => (
                <tr key={rij.rijNummer}>
                  <td>{rij.rijNummer}</td>
                  <td>{rij.assessmentNaam ?? "—"}</td>
                  <td>
                    {rij.ok ? (
                      <select
                        value={organisatieKeuzePerRij[rij.rijNummer] ?? ""}
                        onChange={(e) =>
                          setOrganisatieKeuzePerRij((prev) => ({
                            ...prev,
                            [rij.rijNummer]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Nieuwe organisatie &quot;{rij.organisatieNaam}&quot;</option>
                        {organisaties.map((o) => (
                          <option key={o.id} value={o.id}>
                            Koppelen aan: {o.naam}
                          </option>
                        ))}
                      </select>
                    ) : (
                      rij.organisatieNaam
                    )}
                  </td>
                  <td>{rij.respondentEmail}</td>
                  <td>
                    {rij.ok ? (
                      <span className="admin-badge status-afgerond">Klaar om te importeren</span>
                    ) : (
                      <span className="admin-badge status-uitgenodigd" title={rij.probleem}>
                        {rij.probleem}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {probleemRijen.length > 0 && (
            <p className="text-sm text-ink-m">
              {probleemRijen.length} rij{probleemRijen.length === 1 ? "" : "en"} met een
              matchingprobleem word{probleemRijen.length === 1 ? "t" : "en"} overgeslagen en niet
              geïmporteerd; de overige rijen worden gewoon geïmporteerd.
            </p>
          )}

          <button
            type="button"
            className="btn btn-or"
            disabled={okRijen.length === 0}
            onClick={handleBevestigen}
          >
            {okRijen.length} rij{okRijen.length === 1 ? "" : "en"} importeren
          </button>
        </>
      )}

      {rijen && rijen.length === 0 && (
        <p className="text-sm text-ink-m">Geen rijen gevonden in dit bestand.</p>
      )}
    </div>
  );
}
