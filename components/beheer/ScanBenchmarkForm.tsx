"use client";

import { useMemo, useState } from "react";
import { Assessment, Benchmark, BenchmarkLid, Organisatie } from "@/lib/types";
import { aantalAfgerond, kandidaatMetingen, organisatiesVoorScansBenchmark } from "@/lib/benchmark";
import { InfoIcoon } from "@/components/InfoIcoon";

/**
 * Samenstellen of wijzigen van een benchmark binnen een Meting (`benchmark.md`, Niveau 3): Eén organisatie, één Assessment en
 * één Meting waarin de afgeronde scans worden vergeleken. De Meting is het enige lid, de scans volgen eruit. Er geldt
 * geen vlag, want de gegevens verlaten de organisatie niet. De Meting moet minimaal `benchmarkMinScans` afgeronde scans
 * hebben (de ondergrens, voorstel in `benchmark.md`).
 */
export interface ScanBenchmarkWaarden {
  naam: string;
  assessmentIds: string[];
  leden: BenchmarkLid[];
}

export function ScanBenchmarkForm({
  organisaties,
  assessments,
  minScans,
  begin,
  bevestigLabel,
  onOpslaan,
}: {
  organisaties: Organisatie[];
  assessments: Assessment[];
  minScans: number;
  begin?: Benchmark;
  bevestigLabel: string;
  onOpslaan: (waarden: ScanBenchmarkWaarden) => void;
}) {
  const huidig = begin?.leden[0];
  const [naam, setNaam] = useState(begin?.naam ?? "");
  const [organisatieId, setOrganisatieId] = useState(huidig?.organisatieId ?? "");
  const [assessmentId, setAssessmentId] = useState(huidig?.assessmentId ?? "");
  const [metingId, setMetingId] = useState(huidig?.metingId ?? "");

  const organisatieLijst = useMemo(() => {
    const lijst = organisatiesVoorScansBenchmark(organisaties, minScans);
    const eigen = huidig ? organisaties.find((o) => o.id === huidig.organisatieId) : undefined;
    if (eigen && !lijst.some((o) => o.id === eigen.id)) lijst.push(eigen);
    return lijst.sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
  }, [organisaties, minScans, huidig]);
  const organisatie = organisaties.find((o) => o.id === organisatieId);

  // Assessments met minstens één bruikbare Meting, en de Metingen van het gekozen Assessment. Bij wijzigen blijft de huidige Meting
  // zichtbaar, ook als ze onder het minimum zakte.
  const assessmentOpties = useMemo(() => {
    if (!organisatie) return [];
    const ids = new Set(organisatie.scanUitvoeringen.filter((m) => aantalAfgerond(m) >= minScans).map((m) => m.assessmentId));
    if (huidig && huidig.organisatieId === organisatie.id) ids.add(huidig.assessmentId);
    return [...ids].map((id) => ({ id, naam: assessments.find((a) => a.id === id)?.naam ?? "Onbekend Assessment" }));
  }, [organisatie, assessments, minScans, huidig]);
  const metingOpties = useMemo(() => {
    if (!organisatie || !assessmentId) return [];
    const lijst = kandidaatMetingen(organisatie, assessmentId, minScans);
    const eigen = huidig && huidig.organisatieId === organisatie.id ? organisatie.scanUitvoeringen.find((m) => m.id === huidig.metingId) : undefined;
    if (eigen && eigen.assessmentId === assessmentId && !lijst.some((m) => m.meting.id === eigen.id)) lijst.push({ meting: eigen, aantalAfgerond: aantalAfgerond(eigen) });
    return lijst;
  }, [organisatie, assessmentId, minScans, huidig]);

  function kiesOrganisatie(id: string) {
    setOrganisatieId(id);
    setAssessmentId("");
    setMetingId("");
  }
  function kiesAssessment(id: string) {
    setAssessmentId(id);
    // Voorgekozen: De meest recente Meting met genoeg afgeronde scans.
    const org = organisaties.find((o) => o.id === organisatieId);
    setMetingId(org ? (kandidaatMetingen(org, id, minScans)[0]?.meting.id ?? "") : "");
  }

  const kanOpslaan = naam.trim() !== "" && organisatieId !== "" && assessmentId !== "" && metingId !== "";

  function handleOpslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!kanOpslaan) return;
    onOpslaan({ naam: naam.trim(), assessmentIds: [assessmentId], leden: [{ organisatieId, assessmentId, metingId }] });
  }

  return (
    <form onSubmit={handleOpslaan}>
      <div className="admin-field" style={{ maxWidth: "28rem" }}>
        <label htmlFor="benchmark-naam">Naam</label>
        <input id="benchmark-naam" type="text" value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Bijv. Nulmeting 2026 per respondent" />
      </div>

      <h2>Meting</h2>
      {organisatieLijst.length === 0 ? (
        <p className="admin-notice">Er is geen Meting met minstens {minScans} afgeronde scans.</p>
      ) : (
        <div className="filter-rij flex flex-wrap items-end gap-3">
          <div className="admin-field" style={{ marginBottom: 0, minWidth: "16rem" }}>
            <label>Organisatie</label>
            <select value={organisatieId} onChange={(e) => kiesOrganisatie(e.target.value)} disabled={Boolean(begin)}>
              <option value="">Kies een organisatie</option>
              {organisatieLijst.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.naam}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ marginBottom: 0, minWidth: "16rem" }}>
            <label>Assessment</label>
            <select value={assessmentId} onChange={(e) => kiesAssessment(e.target.value)} disabled={!organisatie || Boolean(begin)}>
              <option value="">Kies een Assessment</option>
              {assessmentOpties.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.naam}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ marginBottom: 0, minWidth: "16rem" }}>
            <label>Meting</label>
            <select value={metingId} onChange={(e) => setMetingId(e.target.value)} disabled={!assessmentId}>
              <option value="">Kies een Meting</option>
              {metingOpties.map((m) => (
                <option key={m.meting.id} value={m.meting.id}>
                  {m.meting.label} · {m.aantalAfgerond} {m.aantalAfgerond === 1 ? "afgeronde scan" : "afgeronde scans"}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="btn-rij" style={{ marginTop: "1.5rem", maxWidth: "22rem" }}>
        <button type="submit" className="btn btn-or btn-compact" disabled={!kanOpslaan}>
          {bevestigLabel}
        </button>
        {!kanOpslaan && <InfoIcoon naastVeld sleutel="info.benchmarkAanmakenScans" />}
      </div>
    </form>
  );
}
