"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties, verwijderScanInvullingen } from "@/lib/db";
import { voortgang } from "@/lib/scoring";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { ScanInvulling } from "@/lib/types";
import {
  CsvRijContext,
  csvBestandsnaamBulk,
  csvBestandsnaamEnkel,
  downloadTekstBestand,
  genereerScansCsv,
} from "@/lib/csv-export";

const STATUS_LABEL: Record<ScanInvulling["status"], string> = {
  uitgenodigd: "Uitgenodigd",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

type Kolom =
  | "naam"
  | "organisatie"
  | "assessment"
  | "scanLabel"
  | "rolTeam"
  | "status"
  | "voortgang"
  | "gestart";

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

export default function IngevuldeScansPage() {
  const router = useRouter();
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const [sortKolom, setSortKolom] = useState<Kolom>("gestart");
  const [sortRichting, setSortRichting] = useState<"asc" | "desc">("desc");
  const [filterOrganisatie, setFilterOrganisatie] = useState("");
  const [filterAssessment, setFilterAssessment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const rijen = useMemo<Rij[]>(() => {
    return organisaties.flatMap((org) =>
      org.scanUitvoeringen.flatMap((scanUitvoering) => {
        const assessment = assessments.find((a) => a.id === scanUitvoering.assessmentId);
        return scanUitvoering.invullingen.flatMap((invulling): Rij[] => {
          const lid = org.leden.find((l) => l.id === invulling.organisatieLidId);
          if (!lid) return [];
          const { percentage } = assessment
            ? voortgang(assessment, invulling.antwoorden)
            : { percentage: 0 };
          return [
            {
              invullingId: invulling.id,
              organisatieId: org.id,
              assessmentId: scanUitvoering.assessmentId,
              naam: lid.naam || lid.email,
              organisatie: org.naam,
              assessment: assessment?.naam ?? "Onbekend",
              scanLabel: scanUitvoering.label,
              rolTeam: [lid.functie, lid.team].filter(Boolean).join(" / ") || "—",
              status: invulling.status,
              voortgang: percentage,
              gestart: invulling.gestartOp ? new Date(invulling.gestartOp).getTime() : 0,
            },
          ];
        });
      })
    );
  }, [organisaties, assessments]);

  /** Voor CSV-export: de volledige context per rij, buiten de platte weergave-`Rij` om. */
  const csvContextPerInvulling = useMemo(() => {
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

  const gefilterd = useMemo(() => {
    return rijen.filter((r) => {
      if (filterOrganisatie && r.organisatieId !== filterOrganisatie) return false;
      if (filterAssessment && r.assessmentId !== filterAssessment) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      return true;
    });
  }, [rijen, filterOrganisatie, filterAssessment, filterStatus]);

  const gesorteerd = useMemo(() => {
    const kopie = [...gefilterd];
    kopie.sort((a, b) => {
      const va = a[sortKolom];
      const vb = b[sortKolom];
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "nl");
      return sortRichting === "asc" ? cmp : -cmp;
    });
    return kopie;
  }, [gefilterd, sortKolom, sortRichting]);

  const bulk = useBulkSelect(gesorteerd.map((r) => r.invullingId));

  function handleSort(kolom: Kolom) {
    if (kolom === sortKolom) {
      setSortRichting((r) => (r === "asc" ? "desc" : "asc"));
    } else {
      setSortKolom(kolom);
      setSortRichting("asc");
    }
  }

  const [verwijderenOpen, setVerwijderenOpen] = useState(false);

  function handleVerwijderenBevestigd() {
    verwijderScanInvullingen([...bulk.selected]);
    bulk.clear();
    setVerwijderenOpen(false);
  }

  // Bulk-CSV-export mag geen data van meerdere organisaties samenvoegen
  // (export-csv.md, "Bulk-export blijft binnen één organisatie") — hier op
  // het globale overzicht (admin-beheerpagina.md punt 7) is de selectie dus
  // alleen exporteerbaar zolang die toevallig, of via het organisatiefilter
  // hierboven, tot één organisatie beperkt blijft.
  const geselecteerdeOrganisatieIds = new Set(
    [...bulk.selected].map((id) => csvContextPerInvulling.get(id)?.organisatie.id).filter(Boolean)
  );
  const exporterenDisabledReden =
    geselecteerdeOrganisatieIds.size > 1
      ? "Selecteer scans van één organisatie om samen te exporteren (filter op Organisatie hierboven)."
      : undefined;

  function handleExporteren() {
    const rijen = [...bulk.selected]
      .map((id) => csvContextPerInvulling.get(id))
      .filter((r): r is CsvRijContext => r !== undefined);
    if (rijen.length === 0) return;
    const csv = genereerScansCsv(rijen);
    const bestandsnaam = rijen.length === 1 ? csvBestandsnaamEnkel(rijen[0]) : csvBestandsnaamBulk();
    downloadTekstBestand(csv, bestandsnaam, "text/csv;charset=utf-8");
    bulk.clear();
  }

  const filtersActief = Boolean(filterOrganisatie || filterAssessment || filterStatus);

  function wisFilters() {
    setFilterOrganisatie("");
    setFilterAssessment("");
    setFilterStatus("");
  }

  return (
    <div className="admin-main admin-main--breed">
      <h1>Ingevulde scans</h1>
      <p>Overzicht over alle organisaties heen. Voor scans per organisatie, zie Organisaties.</p>

      {rijen.length === 0 ? (
        <p className="admin-notice">Nog geen scans ingevuld.</p>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-end gap-3">
            <div className="admin-field" style={{ marginBottom: 0, minWidth: "12rem" }}>
              <label>Organisatie</label>
              <select
                value={filterOrganisatie}
                onChange={(e) => setFilterOrganisatie(e.target.value)}
              >
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
              <select
                value={filterAssessment}
                onChange={(e) => setFilterAssessment(e.target.value)}
              >
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
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Alle statussen</option>
                <option value="uitgenodigd">Uitgenodigd</option>
                <option value="bezig">Bezig</option>
                <option value="afgerond">Afgerond</option>
              </select>
            </div>
            {filtersActief && (
              <button
                type="button"
                onClick={wisFilters}
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
              <BulkToolbar
                aantal={bulk.selected.size}
                onVerwijderen={() => setVerwijderenOpen(true)}
                verwijderLabel="Verwijderen"
                onExporteren={handleExporteren}
                exporterenDisabledReden={exporterenDisabledReden}
              />
              <BevestigModal
                open={verwijderenOpen}
                titel="Scans verwijderen"
                bericht={`${bulk.selected.size} scan-invulling(en) definitief verwijderen? De respondent zelf en eventuele andere metingen van deze persoon blijven bestaan — alleen deze scan(s) verdwijnen. Dit kan niet ongedaan gemaakt worden.`}
                onBevestigen={handleVerwijderenBevestigd}
                onAnnuleren={() => setVerwijderenOpen(false)}
              />
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
                        <button
                          type="button"
                          className="admin-sort-btn"
                          onClick={() => handleSort(k.key)}
                        >
                          {k.label}
                          {sortKolom === k.key ? (sortRichting === "asc" ? " ▲" : " ▼") : ""}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gesorteerd.map((r) => (
                    <tr
                      key={r.invullingId}
                      className="admin-table-rij-klikbaar"
                      onClick={() => router.push(`/beheer/scans/${r.invullingId}`)}
                    >
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
                        <span className={`admin-badge status-${r.status}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td>{r.voortgang}%</td>
                      <td>{r.gestart ? new Date(r.gestart).toLocaleDateString("nl-NL") : "—"}</td>
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
