"use client";

import { useMemo, useState } from "react";
import { Assessment, Benchmark, BenchmarkLid, Organisatie } from "@/lib/types";
import {
  aantalAfgerond,
  assessmentsVoorMetingenBenchmark,
  KandidaatMeting,
  MIN_METINGEN_PER_ASSESSMENT,
  organisatiesVoorMetingenBenchmark,
} from "@/lib/benchmark";
import { InfoIcoon } from "@/components/InfoIcoon";

const scansTekst = (n: number) => `${n} ${n === 1 ? "afgeronde scan" : "afgeronde scans"}`;

/**
 * Samenstellen of wijzigen van een benchmark binnen een organisatie (`benchmark.md`, Niveau 2; `beheerpagina.md`, punt 14,
 * Niveau 2 en 3): Eerst één organisatie, dan de Assessments en de Metingen daarvan, minstens twee per Assessment. Er geldt
 * geen vlag `benchmarkToegestaan`, want de gegevens verlaten de organisatie niet. Een Meting moet minimaal
 * `benchmarkMinScans` afgeronde scans hebben, om dezelfde reden als tussen organisaties.
 */
export interface MetingenBenchmarkWaarden {
  naam: string;
  assessmentIds: string[];
  leden: BenchmarkLid[];
}

export function MetingenBenchmarkForm({
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
  onOpslaan: (waarden: MetingenBenchmarkWaarden) => void;
}) {
  const [naam, setNaam] = useState(begin?.naam ?? "");
  const [organisatieId, setOrganisatieId] = useState(begin?.leden[0]?.organisatieId ?? "");
  // Per gekozen Assessment de gekozen Metingen. Een Assessment dat een sleutel heeft, doet mee.
  const [gekozen, setGekozen] = useState<Record<string, string[]>>(() => {
    const uit: Record<string, string[]> = {};
    for (const lid of begin?.leden ?? []) (uit[lid.assessmentId] ??= []).push(lid.metingId);
    return uit;
  });

  const organisatieLijst = useMemo(() => {
    const lijst = organisatiesVoorMetingenBenchmark(organisaties, minScans);
    const huidig = begin ? organisaties.find((o) => o.id === begin.leden[0]?.organisatieId) : undefined;
    if (huidig && !lijst.some((o) => o.id === huidig.id)) lijst.push(huidig);
    return lijst.sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
  }, [organisaties, minScans, begin]);
  const organisatie = organisaties.find((o) => o.id === organisatieId);

  // De Assessments en Metingen van deze organisatie. Bij wijzigen blijven de huidige leden zichtbaar, ook als hun Meting
  // inmiddels onder het minimum zakte, anders valt ze ongemerkt weg bij opslaan.
  const keuze = useMemo(() => {
    if (!organisatie) return [];
    const per = assessmentsVoorMetingenBenchmark(organisatie, minScans).map((p) => ({ assessmentId: p.assessmentId, metingen: [...p.metingen] }));
    for (const lid of begin?.leden ?? []) {
      if (lid.organisatieId !== organisatie.id) continue;
      const meting = organisatie.scanUitvoeringen.find((m) => m.id === lid.metingId);
      if (!meting) continue;
      let p = per.find((x) => x.assessmentId === lid.assessmentId);
      if (!p) {
        p = { assessmentId: lid.assessmentId, metingen: [] };
        per.push(p);
      }
      if (!p.metingen.some((m) => m.meting.id === meting.id)) p.metingen.push({ meting, aantalAfgerond: aantalAfgerond(meting) });
    }
    return per;
  }, [organisatie, minScans, begin]);

  function kiesOrganisatie(id: string) {
    setOrganisatieId(id);
    setGekozen({});
  }

  function wisselAssessment(assessmentId: string, metingen: KandidaatMeting[]) {
    setGekozen((h) => {
      const nieuw = { ...h };
      if (nieuw[assessmentId]) delete nieuw[assessmentId];
      else nieuw[assessmentId] = metingen.map((m) => m.meting.id); // Voorgekozen: Alle bruikbare Metingen.
      return nieuw;
    });
  }

  function wisselMeting(assessmentId: string, metingId: string) {
    setGekozen((h) => {
      const huidig = h[assessmentId] ?? [];
      return { ...h, [assessmentId]: huidig.includes(metingId) ? huidig.filter((m) => m !== metingId) : [...huidig, metingId] };
    });
  }

  const assessmentIds = Object.keys(gekozen);
  const leden: BenchmarkLid[] = assessmentIds.flatMap((assessmentId) =>
    (gekozen[assessmentId] ?? []).map((metingId) => ({ organisatieId, assessmentId, metingId }))
  );
  const kanOpslaan =
    naam.trim() !== "" &&
    organisatieId !== "" &&
    assessmentIds.length > 0 &&
    assessmentIds.every((a) => (gekozen[a] ?? []).length >= MIN_METINGEN_PER_ASSESSMENT);

  function handleOpslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!kanOpslaan) return;
    onOpslaan({ naam: naam.trim(), assessmentIds, leden });
  }

  return (
    <form onSubmit={handleOpslaan}>
      <div className="admin-field" style={{ maxWidth: "28rem" }}>
        <label htmlFor="benchmark-naam">Naam</label>
        <input id="benchmark-naam" type="text" value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Bijv. Bedrijfsonderdelen 2026" />
      </div>

      <h2>1. Organisatie</h2>
      {organisatieLijst.length === 0 ? (
        <p className="admin-notice">
          Er is geen organisatie met minstens {MIN_METINGEN_PER_ASSESSMENT} Metingen van hetzelfde Assessment met elk minstens {minScans} afgeronde scans.
        </p>
      ) : (
        <div className="admin-field" style={{ maxWidth: "28rem" }}>
          <select aria-label="Organisatie" value={organisatieId} onChange={(e) => kiesOrganisatie(e.target.value)} disabled={Boolean(begin)}>
            <option value="">Kies een organisatie</option>
            {organisatieLijst.map((o) => (
              <option key={o.id} value={o.id}>
                {o.naam}
              </option>
            ))}
          </select>
        </div>
      )}

      {organisatie && (
        <>
          <h2>2. Assessments en Metingen</h2>
          <div className="benchmark-organisaties">
            {keuze.map((p) => {
              const aan = Boolean(gekozen[p.assessmentId]);
              const aantal = gekozen[p.assessmentId]?.length ?? 0;
              const naamA = assessments.find((a) => a.id === p.assessmentId)?.naam ?? "Onbekend Assessment";
              return (
                <div key={p.assessmentId} className="benchmark-organisatie" data-gekozen={aan || undefined}>
                  <label className="benchmark-organisatie-kop">
                    <input type="checkbox" checked={aan} onChange={() => wisselAssessment(p.assessmentId, p.metingen)} />
                    <strong>{naamA}</strong>
                    {aan && (
                      <span className="benchmark-teller" data-onder-drempel={aantal < MIN_METINGEN_PER_ASSESSMENT || undefined}>
                        <strong>
                          {aantal} {aantal === 1 ? "Meting" : "Metingen"}
                        </strong>
                      </span>
                    )}
                  </label>
                  {aan && (
                    <div className="benchmark-metingen">
                      {p.metingen.map((m) => (
                        <label key={m.meting.id} className="benchmark-keuze" style={{ fontWeight: 400 }}>
                          <input
                            type="checkbox"
                            checked={(gekozen[p.assessmentId] ?? []).includes(m.meting.id)}
                            onChange={() => wisselMeting(p.assessmentId, m.meting.id)}
                          />
                          {m.meting.label} · {scansTekst(m.aantalAfgerond)}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {keuze.length === 0 && (
              <p className="admin-notice">
                Deze organisatie heeft geen Assessment met {MIN_METINGEN_PER_ASSESSMENT} Metingen van minstens {minScans} afgeronde scans.
              </p>
            )}
          </div>
        </>
      )}

      <div className="btn-rij" style={{ marginTop: "1.5rem", maxWidth: "22rem" }}>
        <button type="submit" className="btn btn-or btn-compact" disabled={!kanOpslaan}>
          {bevestigLabel}
        </button>
        {!kanOpslaan && <InfoIcoon naastVeld sleutel="info.benchmarkAanmakenMetingen" />}
      </div>
    </form>
  );
}

