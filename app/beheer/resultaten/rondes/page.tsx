"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrganisaties } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { zichtbareOrganisaties } from "@/lib/rechten";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { useUrlParams } from "@/lib/beheer-url";
import { isSamengesteld } from "@/lib/rondes";
import { metVia } from "@/lib/resultaten-nav";
import { CsvRijContext } from "@/lib/csv-export";
import { exporteerScansCsv } from "@/lib/scan-export";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";

type Kolom = "organisatie" | "ronde" | "metingen" | "scans";

interface Rij {
  rondeId: string;
  organisatieId: string;
  organisatie: string;
  ronde: string;
  aangemaaktOp: string;
  metingen: number;
  afgerond: number;
  totaal: number;
}

const KOLOMMEN: { key: Kolom; label: string }[] = [
  { key: "organisatie", label: "Organisatie" },
  { key: "ronde", label: "Ronde" },
  { key: "metingen", label: "Metingen" },
  { key: "scans", label: "Afgeronde scans" },
];

/**
 * Resultaten, tab Rondes (`beheerpagina.md`, punt 7): Eén rij per ronde van een organisatie, de nieuwste bovenaan. Een klik
 * opent het Ronde-overzicht. Filters (Organisatie en een zoekveld op de naam van de ronde), sortering en de selectie staan
 * zoals bij de andere lijsten: De filters in de adresbalk. Exporteren op een selectie geeft de afgeronde scans in de
 * geselecteerde rondes, alleen binnen één organisatie (`export-csv.md`).
 */
function RondesInhoud() {
  const ingelogd = useIngelogdeGebruiker();
  const organisaties = zichtbareOrganisaties(ingelogd, useOrganisaties());
  const assessments = useAssessments();
  const { get, set } = useUrlParams();
  const router = useRouter();

  const filterOrganisatie = get("organisatie");
  const zoek = get("zoek");
  const sortKolom = get("sort", "nieuwste") as Kolom | "nieuwste";
  const sortRichting = get("dir", "desc") === "asc" ? "asc" : "desc";

  const rijen = useMemo<Rij[]>(
    () =>
      organisaties.flatMap((org) =>
        (org.rondes ?? []).map((ronde) => {
          const metingen = org.scanUitvoeringen.filter((m) => m.rondeId === ronde.id);
          const echte = metingen.filter((m) => !isSamengesteld(m));
          const totaal = echte.reduce((n, m) => n + m.invullingen.length, 0);
          const afgerond = echte.reduce((n, m) => n + m.invullingen.filter((i) => i.status === "afgerond").length, 0);
          return {
            rondeId: ronde.id,
            organisatieId: org.id,
            organisatie: org.naam,
            ronde: ronde.label,
            aangemaaktOp: ronde.aangemaaktOp,
            metingen: metingen.length,
            afgerond,
            totaal,
          };
        })
      ),
    [organisaties]
  );

  const gefilterd = rijen.filter(
    (r) =>
      (!filterOrganisatie || r.organisatieId === filterOrganisatie) &&
      (!zoek || r.ronde.toLowerCase().includes(zoek.toLowerCase()))
  );
  const gesorteerd = [...gefilterd].sort((a, b) => {
    let cmp: number;
    if (sortKolom === "nieuwste") cmp = a.aangemaaktOp.localeCompare(b.aangemaaktOp);
    else if (sortKolom === "metingen") cmp = a.metingen - b.metingen;
    else if (sortKolom === "scans") cmp = a.afgerond - b.afgerond;
    else cmp = String(a[sortKolom]).localeCompare(String(b[sortKolom]), "nl");
    return sortRichting === "asc" ? cmp : -cmp;
  });

  const bulk = useBulkSelect(gesorteerd.map((r) => r.rondeId));
  const geselecteerd = gesorteerd.filter((r) => bulk.isSelected(r.rondeId));
  const meerdereOrganisaties = new Set(geselecteerd.map((r) => r.organisatieId)).size > 1;

  function handleSort(kolom: Kolom) {
    if (kolom === sortKolom) set({ dir: sortRichting === "asc" ? "desc" : "asc" });
    else set({ sort: kolom, dir: "asc" });
  }

  function exporteer() {
    const context: CsvRijContext[] = [];
    for (const r of geselecteerd) {
      const org = organisaties.find((o) => o.id === r.organisatieId);
      if (!org) continue;
      for (const meting of org.scanUitvoeringen.filter((m) => m.rondeId === r.rondeId && !isSamengesteld(m))) {
        const assessment = assessments.find((a) => a.id === meting.assessmentId);
        if (!assessment) continue;
        for (const invulling of meting.invullingen.filter((i) => i.status === "afgerond")) {
          const lid = org.leden.find((l) => l.id === invulling.organisatieLidId);
          if (lid) context.push({ organisatie: org, scanUitvoering: meting, lid, invulling, assessment });
        }
      }
    }
    exporteerScansCsv(context);
    bulk.clear();
  }

  const filtersActief = Boolean(filterOrganisatie || zoek);

  return (
    <div className="admin-main admin-main--breed">
      <h1>Rondes</h1>
      <p>Alle rondes van de organisaties, de nieuwste bovenaan. Een klik opent het overzicht van de ronde.</p>

      {rijen.length === 0 ? (
        <p className="admin-notice">Nog geen rondes. Een ronde ontstaat bij het plannen van een Meting.</p>
      ) : (
        <>
          <div className="filter-rij mb-5 flex flex-wrap items-end gap-3">
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
            <div className="admin-field" style={{ marginBottom: 0, minWidth: "14rem" }}>
              <label>Zoek op naam van de ronde</label>
              <input type="text" value={zoek} onChange={(e) => set({ zoek: e.target.value })} placeholder="0-meting" />
            </div>
            {filtersActief && (
              <button type="button" className="btn btn-outline btn-compact" onClick={() => set({ organisatie: null, zoek: null })}>
                Filters wissen
              </button>
            )}
          </div>

          {gesorteerd.length === 0 ? (
            <p className="admin-notice">Geen rondes gevonden voor deze filters.</p>
          ) : (
            <>
              <BulkToolbar
                aantal={bulk.selected.size}
                onExporteren={meerdereOrganisaties ? undefined : exporteer}
                exporterenOverMeerdereOrganisaties={meerdereOrganisaties}
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
                    <tr
                      key={r.rondeId}
                      className="admin-table-rij-klikbaar"
                      onClick={() => router.push(metVia(`/beheer/rondes/${r.rondeId}`, true))}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={bulk.isSelected(r.rondeId)} onChange={() => bulk.toggle(r.rondeId)} />
                      </td>
                      <td>{r.organisatie}</td>
                      <td>{r.ronde}</td>
                      <td>{r.metingen}</td>
                      <td>
                        {r.afgerond} van {r.totaal}
                      </td>
                      <td className="cel-knop">
                        <Link
                          href={metVia(`/beheer/rondes/${r.rondeId}`, true)}
                          className="btn btn-outline btn-compact"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Bekijk
                        </Link>
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

export default function RondesPage() {
  return (
    <Suspense fallback={null}>
      <RondesInhoud />
    </Suspense>
  );
}
