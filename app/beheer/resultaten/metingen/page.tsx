"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrganisaties } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { zichtbareOrganisaties } from "@/lib/rechten";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { useUrlParams } from "@/lib/beheer-url";
import { isSamengesteld, onderdeelVan, rondeVan } from "@/lib/rondes";
import { metVia } from "@/lib/resultaten-nav";
import { CsvRijContext } from "@/lib/csv-export";
import { exporteerScansCsv } from "@/lib/scan-export";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";
import { ScansSamenbrengenModal } from "@/components/beheer/ScansSamenbrengenModal";

type Kolom = "organisatie" | "ronde" | "onderdeel" | "assessment" | "scans";

interface Rij {
  metingId: string;
  organisatieId: string;
  assessmentId: string;
  organisatie: string;
  ronde: string;
  rondeId: string;
  onderdeel: string;
  assessment: string;
  samengesteld: boolean;
  afgerond: number;
  totaal: number;
  aangemaaktOp: string;
}

const KOLOMMEN: { key: Kolom; label: string }[] = [
  { key: "organisatie", label: "Organisatie" },
  { key: "ronde", label: "Ronde" },
  { key: "onderdeel", label: "Onderdeel" },
  { key: "assessment", label: "Assessment" },
  { key: "scans", label: "Afgeronde scans" },
];

/**
 * Resultaten, tab Metingen (`beheerpagina.md`, punt 7): Eén rij per Meting, ook een Meting zonder ronde (lege cel bij
 * Ronde) en een samengestelde Meting (badge "Gemiddelde"). Een klik opent het Meting-overzicht. Filters: Organisatie, Ronde en
 * Assessment, in de adresbalk. Op een selectie: Exporteren (de afgeronde scans, binnen één organisatie) en "Samenbrengen in
 * één Meting…" (alle scans van de geselecteerde Metingen, binnen één organisatie en één Assessment).
 */
function MetingenInhoud() {
  const ingelogd = useIngelogdeGebruiker();
  const organisaties = zichtbareOrganisaties(ingelogd, useOrganisaties());
  const assessments = useAssessments();
  const { get, set } = useUrlParams();
  const router = useRouter();

  const filterOrganisatie = get("organisatie");
  const filterRonde = get("ronde");
  const filterAssessment = get("assessment");
  const sortKolom = get("sort", "nieuwste") as Kolom | "nieuwste";
  const sortRichting = get("dir", "desc") === "asc" ? "asc" : "desc";
  const [samenbrengenOpen, setSamenbrengenOpen] = useState(false);

  const rijen = useMemo<Rij[]>(
    () =>
      organisaties.flatMap((org) =>
        org.scanUitvoeringen.map((m) => {
          const samengesteld = isSamengesteld(m);
          return {
            metingId: m.id,
            organisatieId: org.id,
            assessmentId: m.assessmentId,
            organisatie: org.naam,
            ronde: rondeVan(org, m)?.label ?? "",
            rondeId: m.rondeId ?? "",
            onderdeel: onderdeelVan(m),
            assessment: assessments.find((a) => a.id === m.assessmentId)?.naam ?? "Onbekend type",
            samengesteld,
            afgerond: samengesteld ? 0 : m.invullingen.filter((i) => i.status === "afgerond").length,
            totaal: samengesteld ? 0 : m.invullingen.length,
            aangemaaktOp: m.aangemaaktOp,
          };
        })
      ),
    [organisaties, assessments]
  );

  const rondeOpties = useMemo(() => {
    const perNaam = new Map<string, string>();
    for (const r of rijen) {
      if (r.rondeId && (!filterOrganisatie || r.organisatieId === filterOrganisatie)) perNaam.set(r.rondeId, `${r.ronde} (${r.organisatie})`);
    }
    return [...perNaam.entries()];
  }, [rijen, filterOrganisatie]);

  const gefilterd = rijen.filter(
    (r) =>
      (!filterOrganisatie || r.organisatieId === filterOrganisatie) &&
      (!filterRonde || r.rondeId === filterRonde) &&
      (!filterAssessment || r.assessmentId === filterAssessment)
  );
  const gesorteerd = [...gefilterd].sort((a, b) => {
    let cmp: number;
    if (sortKolom === "nieuwste") cmp = a.aangemaaktOp.localeCompare(b.aangemaaktOp);
    else if (sortKolom === "scans") cmp = a.afgerond - b.afgerond;
    else cmp = String(a[sortKolom]).localeCompare(String(b[sortKolom]), "nl");
    return sortRichting === "asc" ? cmp : -cmp;
  });

  const bulk = useBulkSelect(gesorteerd.filter((r) => !r.samengesteld).map((r) => r.metingId));
  const geselecteerd = gesorteerd.filter((r) => bulk.isSelected(r.metingId));
  const meerdereOrganisaties = new Set(geselecteerd.map((r) => r.organisatieId)).size > 1;
  const meerdereAssessments = new Set(geselecteerd.map((r) => r.assessmentId)).size > 1;
  const organisatieVanSelectie = geselecteerd.length > 0 && !meerdereOrganisaties ? organisaties.find((o) => o.id === geselecteerd[0].organisatieId) : undefined;
  const scanIds = geselecteerd.flatMap((r) => organisatieVanSelectie?.scanUitvoeringen.find((m) => m.id === r.metingId)?.invullingen.map((i) => i.id) ?? []);

  function handleSort(kolom: Kolom) {
    if (kolom === sortKolom) set({ dir: sortRichting === "asc" ? "desc" : "asc" });
    else set({ sort: kolom, dir: "asc" });
  }

  function exporteer() {
    const context: CsvRijContext[] = [];
    for (const r of geselecteerd) {
      const org = organisaties.find((o) => o.id === r.organisatieId);
      const meting = org?.scanUitvoeringen.find((m) => m.id === r.metingId);
      const assessment = assessments.find((a) => a.id === r.assessmentId);
      if (!org || !meting || !assessment) continue;
      for (const invulling of meting.invullingen.filter((i) => i.status === "afgerond")) {
        const lid = org.leden.find((l) => l.id === invulling.organisatieLidId);
        if (lid) context.push({ organisatie: org, scanUitvoering: meting, lid, invulling, assessment });
      }
    }
    exporteerScansCsv(context);
    bulk.clear();
  }

  const filtersActief = Boolean(filterOrganisatie || filterRonde || filterAssessment);

  return (
    <div className="admin-main admin-main--breed">
      <h1>Metingen</h1>
      <p>Alle Metingen van de organisaties. Een klik opent het Meting-overzicht met de scans.</p>

      {rijen.length === 0 ? (
        <p className="admin-notice">Nog geen Metingen.</p>
      ) : (
        <>
          <div className="filter-rij mb-5 flex flex-wrap items-end gap-3">
            <div className="admin-field" style={{ marginBottom: 0, minWidth: "12rem" }}>
              <label>Organisatie</label>
              <select value={filterOrganisatie} onChange={(e) => set({ organisatie: e.target.value, ronde: null })}>
                <option value="">Alle organisaties</option>
                {organisaties.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.naam}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field" style={{ marginBottom: 0, minWidth: "12rem" }}>
              <label>Ronde</label>
              <select value={filterRonde} onChange={(e) => set({ ronde: e.target.value })}>
                <option value="">Alle rondes</option>
                {rondeOpties.map(([id, naam]) => (
                  <option key={id} value={id}>
                    {naam}
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
            {filtersActief && (
              <button
                type="button"
                className="btn btn-outline btn-compact"
                onClick={() => set({ organisatie: null, ronde: null, assessment: null })}
              >
                Filters wissen
              </button>
            )}
          </div>

          {gesorteerd.length === 0 ? (
            <p className="admin-notice">Geen Metingen gevonden voor deze filters.</p>
          ) : (
            <>
              <BulkToolbar
                aantal={bulk.selected.size}
                onExporteren={meerdereOrganisaties ? undefined : exporteer}
                exporterenOverMeerdereOrganisaties={meerdereOrganisaties}
                onSamenbrengen={() => setSamenbrengenOpen(true)}
                samenbrengenUitgeschakeld={meerdereOrganisaties || meerdereAssessments}
              />
              {samenbrengenOpen && organisatieVanSelectie && (
                <ScansSamenbrengenModal
                  organisatie={organisatieVanSelectie}
                  invullingIds={scanIds}
                  onSluit={() => {
                    setSamenbrengenOpen(false);
                    bulk.clear();
                  }}
                  onKlaar={() => {}}
                />
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
                    <tr
                      key={r.metingId}
                      className="admin-table-rij-klikbaar"
                      onClick={() => router.push(metVia(`/beheer/metingen/${r.metingId}`, true))}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        {!r.samengesteld && (
                          <input
                            type="checkbox"
                            aria-label={`Kies ${r.onderdeel} ${r.ronde}`}
                            checked={bulk.isSelected(r.metingId)}
                            onChange={() => bulk.toggle(r.metingId)}
                          />
                        )}
                      </td>
                      <td>{r.organisatie}</td>
                      <td>{r.ronde}</td>
                      <td>
                        {r.onderdeel} {r.samengesteld && <span className="admin-badge status-uitgenodigd">Gemiddelde</span>}
                      </td>
                      <td>{r.assessment}</td>
                      <td>{r.samengesteld ? "" : `${r.afgerond} van ${r.totaal}`}</td>
                      <td className="cel-knop">
                        <Link
                          href={metVia(`/beheer/metingen/${r.metingId}`, true)}
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

export default function MetingenPage() {
  return (
    <Suspense fallback={null}>
      <MetingenInhoud />
    </Suspense>
  );
}
