"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties, resetRespondentInvulling } from "@/lib/db";
import { voortgang } from "@/lib/scoring";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";
import { Respondent } from "@/lib/types";

const STATUS_LABEL: Record<Respondent["status"], string> = {
  uitgenodigd: "Uitgenodigd",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

type Kolom = "naam" | "organisatie" | "assessment" | "rolTeam" | "status" | "voortgang" | "gestart";

interface Rij {
  respondentId: string;
  organisatieId: string;
  assessmentId: string;
  naam: string;
  organisatie: string;
  assessment: string;
  rolTeam: string;
  status: Respondent["status"];
  voortgang: number;
  gestart: number;
}

const KOLOMMEN: { key: Kolom; label: string }[] = [
  { key: "naam", label: "Naam" },
  { key: "organisatie", label: "Organisatie" },
  { key: "assessment", label: "Assessment" },
  { key: "rolTeam", label: "Rol / team" },
  { key: "status", label: "Status" },
  { key: "voortgang", label: "Voortgang" },
  { key: "gestart", label: "Gestart" },
];

export default function IngevuldeScansPage() {
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const [sortKolom, setSortKolom] = useState<Kolom>("gestart");
  const [sortRichting, setSortRichting] = useState<"asc" | "desc">("desc");
  const [filterOrganisatie, setFilterOrganisatie] = useState("");
  const [filterAssessment, setFilterAssessment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const rijen = useMemo<Rij[]>(() => {
    return organisaties.flatMap((org) => {
      const assessment = assessments.find((a) => a.id === org.assessmentId);
      return org.respondenten.map((r): Rij => {
        const { percentage } = assessment
          ? voortgang(assessment, r.antwoorden)
          : { percentage: 0 };
        return {
          respondentId: r.id,
          organisatieId: org.id,
          assessmentId: org.assessmentId,
          naam: r.naam || r.email,
          organisatie: org.naam,
          assessment: assessment?.naam ?? "Onbekend",
          rolTeam: [r.rol, r.team].filter(Boolean).join(" / ") || "—",
          status: r.status,
          voortgang: percentage,
          gestart: r.gestartOp ? new Date(r.gestartOp).getTime() : 0,
        };
      });
    });
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

  const bulk = useBulkSelect(gesorteerd.map((r) => r.respondentId));

  function handleSort(kolom: Kolom) {
    if (kolom === sortKolom) {
      setSortRichting((r) => (r === "asc" ? "desc" : "asc"));
    } else {
      setSortKolom(kolom);
      setSortRichting("asc");
    }
  }

  function handleVerwijderen() {
    const ids = [...bulk.selected];
    if (
      !window.confirm(
        `${ids.length} scan-invulling(en) verwijderen? Dit wist de antwoorden en opmerkingen; de respondent en uitnodiging blijven bestaan (status gaat terug naar "uitgenodigd"). Dit kan niet ongedaan gemaakt worden.`
      )
    )
      return;
    resetRespondentInvulling(ids);
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
                onVerwijderen={handleVerwijderen}
                verwijderLabel="Verwijderen"
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {gesorteerd.map((r) => (
                    <tr key={r.respondentId}>
                      <td>
                        <input
                          type="checkbox"
                          checked={bulk.isSelected(r.respondentId)}
                          onChange={() => bulk.toggle(r.respondentId)}
                        />
                      </td>
                      <td>{r.naam}</td>
                      <td>{r.organisatie}</td>
                      <td>{r.assessment}</td>
                      <td>{r.rolTeam}</td>
                      <td>
                        <span className={`admin-badge status-${r.status}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td>{r.voortgang}%</td>
                      <td>{r.gestart ? new Date(r.gestart).toLocaleDateString("nl-NL") : "—"}</td>
                      <td>
                        <Link href={`/beheer/scans/${r.respondentId}`}>Bekijk</Link>
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
