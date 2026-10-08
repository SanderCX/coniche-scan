"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { Assessment, Benchmark, BenchmarkLid, Organisatie } from "@/lib/types";
import {
  aantalAfgerond,
  kandidaatOrganisaties,
  KandidaatOrganisatie,
  nietTeKiezenOrganisaties,
  standaardMetingId,
} from "@/lib/benchmark";

/**
 * Samenstellen of wijzigen van een benchmark (`benchmark.md`, Samenstellen; `beheerpagina.md`, punt 14): Eerst de
 * Assessments, daarna de organisaties met het optionele sectorfilter, en per organisatie de Meting per Assessment in
 * dezelfde lijst. Naast elk gekozen Assessment loopt de teller "X van Y organisaties" mee, met een waarschuwingskleur zodra
 * die onder de minimale groepsgrootte zakt. Het sectorfilter is een zoekhulp en wordt niet opgeslagen.
 */
export interface BenchmarkFormWaarden {
  naam: string;
  assessmentIds: string[];
  leden: BenchmarkLid[];
}

const scansTekst = (n: number, afgerond = false) => `${n} ${afgerond ? "afgeronde " : ""}${n === 1 ? "scan" : "scans"}`;

function sectorVan(organisatie: Organisatie): { sector: string; subsector: string } {
  const v = organisatie.kenmerken["sector-subsector"] as { sector?: string; subsector?: string } | undefined;
  return { sector: v?.sector ?? "", subsector: v?.subsector ?? "" };
}

export function BenchmarkForm({
  organisaties,
  assessments,
  minScans,
  minOrganisaties,
  begin,
  bevestigLabel,
  onOpslaan,
}: {
  organisaties: Organisatie[];
  assessments: Assessment[];
  minScans: number;
  minOrganisaties: number;
  begin?: Benchmark;
  bevestigLabel: string;
  onOpslaan: (waarden: BenchmarkFormWaarden) => void;
}) {
  const [naam, setNaam] = useState(begin?.naam ?? "");
  const [assessmentIds, setAssessmentIds] = useState<string[]>(begin?.assessmentIds ?? []);
  // Gekozen organisaties en per organisatie de Meting per Assessment.
  const [gekozen, setGekozen] = useState<Record<string, Record<string, string>>>(() => {
    const uit: Record<string, Record<string, string>> = {};
    for (const lid of begin?.leden ?? []) (uit[lid.organisatieId] ??= {})[lid.assessmentId] = lid.metingId;
    return uit;
  });
  const [sectoren, setSectoren] = useState<string[]>([]);
  const [subsectoren, setSubsectoren] = useState<string[]>([]);

  // De lijst: Organisaties met de vlag en genoeg afgeronde scans, plus de huidige leden bij wijzigen (ook als hun Meting
  // inmiddels onder het minimum zakte, anders valt ze ongemerkt weg bij opslaan).
  const kandidaten = useMemo<KandidaatOrganisatie[]>(() => {
    const lijst = kandidaatOrganisaties(organisaties, assessmentIds, minScans);
    for (const lid of begin?.leden ?? []) {
      if (!assessmentIds.includes(lid.assessmentId)) continue;
      const organisatie = organisaties.find((o) => o.id === lid.organisatieId);
      const meting = organisatie?.scanUitvoeringen.find((m) => m.id === lid.metingId);
      if (!organisatie || !meting) continue;
      let kandidaat = lijst.find((k) => k.organisatie.id === organisatie.id);
      if (!kandidaat) {
        kandidaat = { organisatie, perAssessment: [] };
        lijst.push(kandidaat);
      }
      let per = kandidaat.perAssessment.find((p) => p.assessmentId === lid.assessmentId);
      if (!per) {
        per = { assessmentId: lid.assessmentId, metingen: [] };
        kandidaat.perAssessment.push(per);
      }
      if (!per.metingen.some((m) => m.meting.id === meting.id)) per.metingen.push({ meting, aantalAfgerond: aantalAfgerond(meting) });
    }
    return lijst.sort((a, b) => a.organisatie.naam.localeCompare(b.organisatie.naam, "nl"));
  }, [organisaties, assessmentIds, minScans, begin]);

  const nietTeKiezen = useMemo(
    () => nietTeKiezenOrganisaties(organisaties, assessments, assessmentIds, minScans),
    [organisaties, assessments, assessmentIds, minScans]
  );

  const sectorOpties = useMemo(
    () => [...new Set(kandidaten.map((k) => sectorVan(k.organisatie).sector).filter(Boolean))].sort((a, b) => a.localeCompare(b, "nl")),
    [kandidaten]
  );
  const subsectorOpties = useMemo(
    () =>
      [
        ...new Set(
          kandidaten
            .map((k) => sectorVan(k.organisatie))
            .filter((s) => s.subsector && (sectoren.length === 0 || sectoren.includes(s.sector)))
            .map((s) => s.subsector)
        ),
      ].sort((a, b) => a.localeCompare(b, "nl")),
    [kandidaten, sectoren]
  );

  const zichtbaar = kandidaten.filter((k) => {
    const s = sectorVan(k.organisatie);
    return (sectoren.length === 0 || sectoren.includes(s.sector)) && (subsectoren.length === 0 || subsectoren.includes(s.subsector));
  });

  function wisselAssessment(id: string) {
    setAssessmentIds((huidig) => (huidig.includes(id) ? huidig.filter((a) => a !== id) : [...huidig, id]));
  }

  function wisselOrganisatie(k: KandidaatOrganisatie, aan: boolean) {
    setGekozen((huidig) => {
      const nieuw = { ...huidig };
      if (!aan) {
        delete nieuw[k.organisatie.id];
        return nieuw;
      }
      // Voorgekozen: De meest recente Meting met genoeg afgeronde scans.
      const metingen: Record<string, string> = {};
      for (const p of k.perAssessment) {
        const id = standaardMetingId(p.metingen);
        if (id) metingen[p.assessmentId] = id;
      }
      nieuw[k.organisatie.id] = metingen;
      return nieuw;
    });
  }

  function kiesMeting(organisatieId: string, assessmentId: string, metingId: string) {
    setGekozen((huidig) => ({ ...huidig, [organisatieId]: { ...huidig[organisatieId], [assessmentId]: metingId } }));
  }

  /** De gekozen Meting, of de voorgekozen als er nog niets is gekozen (bijv. nadat een Assessment is bijgekozen). */
  function metingVoor(organisatieId: string, assessmentId: string): string | null {
    const expliciet = gekozen[organisatieId]?.[assessmentId];
    if (expliciet) return expliciet;
    const per = kandidaten.find((k) => k.organisatie.id === organisatieId)?.perAssessment.find((p) => p.assessmentId === assessmentId);
    return per ? standaardMetingId(per.metingen) : null;
  }

  // Alleen leden voor gekozen Assessments waarvoor de organisatie een Meting heeft.
  const leden: BenchmarkLid[] = Object.keys(gekozen).flatMap((organisatieId) =>
    assessmentIds.flatMap((assessmentId) => {
      const metingId = metingVoor(organisatieId, assessmentId);
      return metingId ? [{ organisatieId, assessmentId, metingId }] : [];
    })
  );
  const aantalOrganisaties = new Set(leden.map((l) => l.organisatieId)).size;
  const kanOpslaan = naam.trim() !== "" && assessmentIds.length > 0 && leden.length > 0;

  function handleOpslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!kanOpslaan) return;
    onOpslaan({ naam: naam.trim(), assessmentIds, leden });
  }

  return (
    <form onSubmit={handleOpslaan}>
      <div className="admin-field" style={{ maxWidth: "28rem" }}>
        <label htmlFor="benchmark-naam">Naam</label>
        <input id="benchmark-naam" type="text" value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Bijv. Zorg 2026" />
      </div>

      <h2>1. Assessments</h2>
      <div className="benchmark-keuzes">
        {assessments.map((a) => {
          const aan = assessmentIds.includes(a.id);
          const x = leden.filter((l) => l.assessmentId === a.id).length;
          // Pas een teller (en een waarschuwing) zodra er organisaties gekozen zijn: "0 van 0" zegt niets.
          const toonTeller = aan && aantalOrganisaties > 0;
          const onder = toonTeller && x < minOrganisaties;
          return (
            <label key={a.id} className="benchmark-keuze">
              <input type="checkbox" checked={aan} onChange={() => wisselAssessment(a.id)} />
              <span>{a.naam}</span>
              {toonTeller && (
                <span className="benchmark-teller" data-onder-drempel={onder || undefined}>
                  <strong>
                    {x} van {aantalOrganisaties} organisaties
                  </strong>
                </span>
              )}
            </label>
          );
        })}
      </div>

      <h2>2. Organisaties en Metingen</h2>
      {assessmentIds.length === 0 ? (
        <p className="admin-notice">Kies eerst minstens één Assessment.</p>
      ) : kandidaten.length === 0 && nietTeKiezen.length > 0 ? (
        <p className="admin-notice">
          Geen van de organisaties die meedoen aan benchmarks heeft een Meting van een gekozen Assessment met minstens {minScans}{" "}
          afgeronde scans, zie hieronder.
        </p>
      ) : kandidaten.length === 0 ? (
        <p className="admin-notice">
          Er zijn nog geen organisaties die meedoen aan benchmarks met een Meting van een gekozen Assessment van minstens {minScans}{" "}
          afgeronde scans. Zet bij een organisatie de schakelaar &quot;Doet mee aan benchmark&quot; aan, bij de kenmerken op het
          organisatie-detail. <Link href="/beheer/organisaties">Naar Organisaties</Link>
        </p>
      ) : (
        <>
          {(sectorOpties.length > 0 || subsectorOpties.length > 0) && (
            <details className="benchmark-filter">
              <summary>
                Filter op sector{sectoren.length + subsectoren.length > 0 ? ` (${sectoren.length + subsectoren.length} gekozen)` : ""}
              </summary>
              <div className="benchmark-filter-inhoud">
                <fieldset>
                  <legend>Sector</legend>
                  {sectorOpties.map((s) => (
                    <label key={s}>
                      <input
                        type="checkbox"
                        checked={sectoren.includes(s)}
                        onChange={() => setSectoren((h) => (h.includes(s) ? h.filter((x) => x !== s) : [...h, s]))}
                      />
                      {s}
                    </label>
                  ))}
                </fieldset>
                {subsectorOpties.length > 0 && (
                  <fieldset>
                    <legend>Subsector</legend>
                    {subsectorOpties.map((s) => (
                      <label key={s}>
                        <input
                          type="checkbox"
                          checked={subsectoren.includes(s)}
                          onChange={() => setSubsectoren((h) => (h.includes(s) ? h.filter((x) => x !== s) : [...h, s]))}
                        />
                        {s}
                      </label>
                    ))}
                  </fieldset>
                )}
                {(sectoren.length > 0 || subsectoren.length > 0) && (
                  <button
                    type="button"
                    className="btn btn-outline btn-compact"
                    onClick={() => {
                      setSectoren([]);
                      setSubsectoren([]);
                    }}
                  >
                    Filter wissen
                  </button>
                )}
              </div>
            </details>
          )}

          <div className="benchmark-organisaties">
            {zichtbaar.map((k) => {
              const aan = Boolean(gekozen[k.organisatie.id]);
              return (
                <div key={k.organisatie.id} className="benchmark-organisatie" data-gekozen={aan || undefined}>
                  <label className="benchmark-organisatie-kop">
                    <input type="checkbox" checked={aan} onChange={(e) => wisselOrganisatie(k, e.target.checked)} />
                    <strong>{k.organisatie.naam}</strong>
                    <span className="text-sm text-ink-s">
                      {k.perAssessment
                        .map((p) => `${assessments.find((a) => a.id === p.assessmentId)?.naam ?? "?"}: ${scansTekst(Math.max(...p.metingen.map((m) => m.aantalAfgerond)))}`)
                        .join(" · ")}
                    </span>
                  </label>
                  {aan && (
                    <div className="benchmark-metingen">
                      {assessmentIds.map((assessmentId) => {
                        const per = k.perAssessment.find((p) => p.assessmentId === assessmentId);
                        const naamA = assessments.find((a) => a.id === assessmentId)?.naam ?? "?";
                        if (!per) {
                          return (
                            <p key={assessmentId} className="text-sm text-ink-s">
                              {naamA}: Geen Meting met genoeg afgeronde scans, doet hier niet mee.
                            </p>
                          );
                        }
                        return (
                          <div key={assessmentId} className="admin-field" style={{ marginBottom: 0 }}>
                            <label>{naamA}</label>
                            <select
                              value={metingVoor(k.organisatie.id, assessmentId) ?? ""}
                              onChange={(e) => kiesMeting(k.organisatie.id, assessmentId, e.target.value)}
                            >
                              {per.metingen.map((m) => (
                                <option key={m.meting.id} value={m.meting.id}>
                                  {m.meting.label} · {scansTekst(m.aantalAfgerond, true)}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {zichtbaar.length === 0 && <p className="admin-notice">Geen organisaties voor dit filter.</p>}
          </div>
        </>
      )}

      {assessmentIds.length > 0 && nietTeKiezen.length > 0 && (
        <div className="admin-notice" style={{ marginTop: "1rem" }}>
          <strong>
            {nietTeKiezen.length === 1
              ? "Een organisatie doet mee aan benchmarks maar staat niet in de lijst:"
              : `${nietTeKiezen.length} organisaties doen mee aan benchmarks maar staan niet in de lijst:`}
          </strong>
          <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.2rem" }}>
            {nietTeKiezen.map((n) => (
              <li key={n.organisatie.id}>
                {n.organisatie.naam}: {n.redenen.join("; ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="btn-rij" style={{ marginTop: "1.5rem", maxWidth: "22rem" }}>
        <button type="submit" className="btn btn-or btn-compact" disabled={!kanOpslaan}>
          {bevestigLabel}
        </button>
        {!kanOpslaan && <InfoIcoon naastVeld sleutel="info.benchmarkAanmaken" />}
      </div>
    </form>
  );
}
