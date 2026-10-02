"use client";

import { Suspense, useMemo, useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties, verwijderScanInvullingen } from "@/lib/db";
import { voortgang } from "@/lib/scoring";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { NaarAndereMetingStap, ScanVerplaatsResultaat } from "@/components/beheer/VerplaatsStappen";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";
import { STATUS_LABEL, rolTeamTekst } from "@/components/beheer/overzicht-helpers";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { zichtbareOrganisaties } from "@/lib/rechten";
import { useBeheerOverzicht, useUrlParams } from "@/lib/beheer-url";
import { ScanInvulling } from "@/lib/types";
import { CsvRijContext } from "@/lib/csv-export";
import { exporteerScanIndesign, exporteerScanPdf, exporteerScansCsv } from "@/lib/scan-export";

type Kolom = "naam" | "organisatie" | "assessment" | "scanLabel" | "rolTeam" | "status" | "voortgang" | "gestart";

interface Rij {
  invullingId: string;
  organisatieId: string;
  assessmentId: string;
  naam: string;
  organisatie: string;
  assessment: string;
  scanLabel: string;
  rolTeam: string;
  status: ScanInvulling["status"];
  voortgang: number;
  gestart: number;
}

const KOLOMMEN: { key: Kolom; label: string }[] = [
  { key: "naam", label: "Naam" },
  { key: "organisatie", label: "Organisatie" },
  { key: "assessment", label: "Assessment" },
  { key: "scanLabel", label: "Meting" },
  { key: "rolTeam", label: "Rol / team" },
  { key: "status", label: "Status" },
  { key: "voortgang", label: "Voortgang" },
  { key: "gestart", label: "Gestart" },
];

/**
 * Ingevulde scans (beheerpagina.md punt 7). Filters en sortering staan in de
 * adresbalk; een rij (of "Bekijk >>") opent het Scan-overzicht als modal
 * (`?scan=<id>`). Met het filter Organisatie is dit de organisatie-
 * gefilterde versie, waar ook "Naar andere Meting" en bulk-CSV mogelijk zijn.
 */
function IngevuldeScansPageInhoud() {
  const ingelogd = useIngelogdeGebruiker();
  const organisaties = zichtbareOrganisaties(ingelogd, useOrganisaties());
  const assessments = useAssessments();
  const { get, set } = useUrlParams();
  const { open } = useBeheerOverzicht();

  const filterOrganisatie = get("organisatie");
  const filterAssessment = get("assessment");
  const filterStatus = get("status");
  const sortKolom = get("sort", "gestart") as Kolom;
  const sortRichting = get("dir", "desc") === "asc" ? "asc" : "desc";

  const rijen = useMemo<Rij[]>(() => {
    return organisaties.flatMap((org) =>
      org.scanUitvoeringen.flatMap((scanUitvoering) => {
        const assessment = assessments.find((a) => a.id === scanUitvoering.assessmentId);
        return scanUitvoering.invullingen.flatMap((invulling): Rij[] => {
          const lid = org.leden.find((l) => l.id === invulling.organisatieLidId);
          if (!lid) return [];
          const { percentage } = assessment ? voortgang(assessment, invulling.antwoorden) : { percentage: 0 };
          return [
            {
              invullingId: invulling.id,
              organisatieId: org.id,
              assessmentId: scanUitvoering.assessmentId,
              naam: lid.naam || lid.email,
              organisatie: org.naam,
              assessment: assessment?.naam ?? "Onbekend",
              scanLabel: scanUitvoering.label,
              rolTeam: rolTeamTekst(lid),
              status: invulling.status,
              voortgang: percentage,
              gestart: invulling.gestartOp ? new Date(invulling.gestartOp).getTime() : 0,
            },
          ];
        });
      })
    );
  }, [organisaties, assessments]);

  /** Voor export: de volledige context per rij, buiten de platte weergave-`Rij` om. */
  const exportContextPerInvulling = useMemo(() => {
    const map = new Map<string, CsvRijContext>();
    for (const organisatie of organisaties) {
      for (const scanUitvoering of organisatie.scanUitvoeringen) {
        const assessment = assessments.find((a) => a.id === scanUitvoering.assessmentId);
        if (!assessment) continue;
        for (const invulling of scanUitvoering.invullingen) {
          const lid = organisatie.leden.find((l) => l.id === invulling.organisatieLidId);
          if (!lid) continue;
          map.set(invulling.id, { organisatie, scanUitvoering, lid, invulling, assessment });
        }
      }
    }
    return map;
  }, [organisaties, assessments]);

  const gefilterd = useMemo(
    () =>
      rijen.filter((r) => {
        if (filterOrganisatie && r.organisatieId !== filterOrganisatie) return false;
        if (filterAssessment && r.assessmentId !== filterAssessment) return false;
        if (filterStatus && r.status !== filterStatus) return false;
        return true;
      }),
    [rijen, filterOrganisatie, filterAssessment, filterStatus]
  );

  const gesorteerd = useMemo(() => {
    const kopie = [...gefilterd];
    kopie.sort((a, b) => {
      const va = a[sortKolom];
      const vb = b[sortKolom];
      const cmp =
        typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "nl");
      return sortRichting === "asc" ? cmp : -cmp;
    });
    return kopie;
  }, [gefilterd, sortKolom, sortRichting]);

  const bulk = useBulkSelect(gesorteerd.map((r) => r.invullingId));
  const [verwijderenOpen, setVerwijderenOpen] = useState(false);
  const [naarMetingOpen, setNaarMetingOpen] = useState(false);
  const [pdfBezig, setPdfBezig] = useState(false);

  function handleSort(kolom: Kolom) {
    if (kolom === sortKolom) set({ dir: sortRichting === "asc" ? "desc" : "asc" });
    else set({ sort: kolom, dir: "asc" });
  }

  function handleVerwijderenBevestigd() {
    verwijderScanInvullingen([...bulk.selected]);
    bulk.clear();
    setVerwijderenOpen(false);
  }

  // Bulk-CSV-export mag geen data van meerdere organisaties samenvoegen
  // (export-csv.md, "Bulk-export blijft binnen één organisatie").
  const geselecteerdeOrganisatieIds = new Set(
    [...bulk.selected].map((id) => exportContextPerInvulling.get(id)?.organisatie.id).filter(Boolean)
  );
  const exporterenDisabledReden =
    geselecteerdeOrganisatieIds.size > 1
      ? "Selecteer scans van één organisatie om samen te exporteren (filter op Organisatie hierboven)."
      : undefined;

  function handleExporteren() {
    const context = [...bulk.selected]
      .map((id) => exportContextPerInvulling.get(id))
      .filter((r): r is CsvRijContext => r !== undefined);
    exporteerScansCsv(context);
    bulk.clear();
  }

  // PDF/InDesign zijn "beschikbaar bij precies één scan".
  const enkeleSelectie = bulk.selected.size === 1 ? exportContextPerInvulling.get([...bulk.selected][0]) : undefined;

  async function handleExporterenPdf() {
    if (!enkeleSelectie) return;
    setPdfBezig(true);
    const gelukt = await exporteerScanPdf(enkeleSelectie);
    setPdfBezig(false);
    if (gelukt) bulk.clear();
    else window.alert("Het exporteren als PDF is mislukt. Probeer het opnieuw.");
  }

  function handleVerplaatst(r: ScanVerplaatsResultaat) {
    setNaarMetingOpen(false);
    bulk.clear();
    zetBeheerMelding({
      tekst:
        r.overgeslagen.length === 0
          ? `${r.verplaatst} scan${r.verplaatst === 1 ? "" : "s"} verplaatst naar Meting "${r.doelLabel}".`
          : `${r.verplaatst} scan(s) verplaatst naar "${r.doelLabel}", ${r.overgeslagen.length} overgeslagen: ${[
              ...new Set(r.overgeslagen.map((o) => o.reden)),
            ].join(" ")}`,
    });
  }

  const filterOrganisatieObject = organisaties.find((o) => o.id === filterOrganisatie);
  const filtersActief = Boolean(filterOrganisatie || filterAssessment || filterStatus);

  return (
    <div className="admin-main admin-main--breed">
      <h1>Ingevulde scans</h1>
      <p>
        {filterOrganisatieObject
          ? `De scans van ${filterOrganisatieObject.naam}.`
          : "Overzicht over alle organisaties heen. Voor scans per organisatie, kies hieronder een Organisatie."}
      </p>

      {rijen.length === 0 ? (
        <p className="admin-notice">Nog geen scans ingevuld.</p>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-end gap-3">
            <div className="admin-field" style={{ marginBottom: 0, minWidth: "12rem" }}>
              <label>Organisatie</label>
              <select value={filterOrganisatie} onChange={(e) => set({ organisatie: e.target.value })}>
                <option value="">Alle organisaties</option>
                {organisaties.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.naam}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field" style={{ marginBottom: 0, minWidth: "12rem" }}>
              <label>Assessment</label>
              <select value={filterAssessment} onChange={(e) => set({ assessment: e.target.value })}>
                <option value="">Alle assessment-types</option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.naam}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field" style={{ marginBottom: 0, minWidth: "10rem" }}>
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => set({ status: e.target.value })}>
                <option value="">Alle statussen</option>
                <option value="uitgenodigd">Uitgenodigd</option>
                <option value="bezig">Bezig</option>
                <option value="afgerond">Afgerond</option>
              </select>
            </div>
            {filtersActief && (
              <button
                type="button"
                onClick={() => set({ organisatie: null, assessment: null, status: null })}
                className="text-sm text-ink-m hover:text-ink"
                style={{ paddingBottom: "0.7rem" }}
              >
                Filters wissen
              </button>
            )}
          </div>

          {gesorteerd.length === 0 ? (
            <p className="admin-notice">Geen scans gevonden voor deze filters.</p>
          ) : (
            <>
              {/* scans.verwijderen: alle (Admin) / eigen (Consultant) — de rijen komen al uit zichtbareOrganisaties. */}
              <BulkToolbar
                aantal={bulk.selected.size}
                onVerwijderen={() => setVerwijderenOpen(true)}
                verwijderLabel="Verwijderen"
                onExporteren={handleExporteren}
                exporterenDisabledReden={exporterenDisabledReden}
                onExporterenPdf={enkeleSelectie ? handleExporterenPdf : undefined}
                onExporterenIndesign={
                  enkeleSelectie
                    ? () => {
                        exporteerScanIndesign(enkeleSelectie);
                        bulk.clear();
                      }
                    : undefined
                }
                exportBezig={pdfBezig}
                onNaarAndereMeting={filterOrganisatieObject ? () => setNaarMetingOpen(true) : undefined}
              />
              <BevestigModal
                open={verwijderenOpen}
                titel="Scans verwijderen"
                bericht={`${bulk.selected.size} scan-invulling(en) definitief verwijderen? De respondent zelf en eventuele andere Metingen van deze persoon blijven bestaan, alleen deze scan(s) verdwijnen. Dit kan niet ongedaan gemaakt worden.`}
                onBevestigen={handleVerwijderenBevestigd}
                onAnnuleren={() => setVerwijderenOpen(false)}
              />
              {naarMetingOpen && filterOrganisatieObject && (
                <OverzichtModal label="Scans naar andere Meting" onSluit={() => setNaarMetingOpen(false)}>
                  <NaarAndereMetingStap
                    organisatie={filterOrganisatieObject}
                    invullingIds={[...bulk.selected]}
                    onTerug={() => setNaarMetingOpen(false)}
                    onKlaar={handleVerplaatst}
                  />
                </OverzichtModal>
              )}
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>
                      <IndeterminateCheckbox
                        checked={bulk.alleGeselecteerd}
                        indeterminate={bulk.sommigeGeselecteerd}
                        onChange={bulk.toggleAll}
                      />
                    </th>
                    {KOLOMMEN.map((k) => (
                      <th key={k.key}>
                        <button type="button" className="admin-sort-btn" onClick={() => handleSort(k.key)}>
                          {k.label}
                          {sortKolom === k.key ? (sortRichting === "asc" ? " ▲" : " ▼") : ""}
                        </button>
                      </th>
                    ))}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {gesorteerd.map((r) => (
                    <tr key={r.invullingId} className="admin-table-rij-klikbaar" onClick={() => open("scan", r.invullingId)}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={bulk.isSelected(r.invullingId)}
                          onChange={() => bulk.toggle(r.invullingId)}
                        />
                      </td>
                      <td>{r.naam}</td>
                      <td>{r.organisatie}</td>
                      <td>{r.assessment}</td>
                      <td>{r.scanLabel}</td>
                      <td>{r.rolTeam}</td>
                      <td>
                        <span className={`admin-badge status-${r.status}`}>{STATUS_LABEL[r.status]}</span>
                      </td>
                      <td>{r.voortgang}%</td>
                      <td>{r.gestart ? new Date(r.gestart).toLocaleDateString("nl-NL") : ""}</td>
                      <td>
                        <button type="button" className="admin-bekijk-knop" onClick={() => open("scan", r.invullingId)}>
                          Bekijk &gt;&gt;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}

/** `useSearchParams` (filters in de URL) vraagt een Suspense-grens zodat de pagina statisch gebouwd kan worden. */
export default function IngevuldeScansPage() {
  return (
    <Suspense fallback={null}>
      <IngevuldeScansPageInhoud />
    </Suspense>
  );
}
