"use client";

import { useState } from "react";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { useAssessments } from "@/lib/assessment-store";
import { useBenchmarksMetLeden } from "@/lib/use-benchmarks";
import { koppelMeting, koppelMetingen, startAdviesverloop, zetPeilMeting } from "@/lib/db";
import { LABEL_MAX, gekoppeldeMetingen, geschikteBenchmarks, heeftAfgerondeScans, koppelRijen, metingNaamInTraject, peilMeting } from "@/lib/advies";
import { aantalOrganisatiesInBenchmark } from "@/lib/dossier";
import { aantalAfgerondInMeting, maandJaar, meetdatumVan, toonMeetdatum } from "@/lib/metingen";
import type { Adviesverloop, Benchmark, Organisatie, ScanUitvoering } from "@/lib/types";

/** De suggesties bij het label van een gekoppelde Meting (`adviesverloop.md`, Metingen in het adviesverloop): Een hulp, geen indeling. */
const LABEL_SUGGESTIES = ["Nulmeting", "Tussenmeting", "Eindmeting"];

const scansTekst = (n: number) => `${n} ${n === 1 ? "scan" : "scans"}`;

/**
 * De modal "Peilmeting kiezen" (`adviesverloop.md`, Modals voor de Metingen): "Automatisch (meest recent)" met de hint welke Meting dat nu is, en per
 * gekoppelde Meting "Handmatig: {label of Meting}". Een Meting zonder afgeronde scans staat er uitgeschakeld. Patroon van "Meting voor de radar".
 */
export function PeilmetingModal({ organisatie, adviesverloop, onSluit }: { organisatie: Organisatie; adviesverloop: Adviesverloop; onSluit: () => void }) {
  const [keuze, setKeuze] = useState<string | null>(adviesverloop.peilMetingId);
  const [fout, setFout] = useState<string | null>(null);
  const gekoppeld = gekoppeldeMetingen(organisatie, adviesverloop);
  const automatisch = peilMeting(organisatie, { ...adviesverloop, peilMetingId: null });

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    const r = zetPeilMeting(organisatie.id, adviesverloop.id, keuze);
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  return (
    <OverzichtModal label="Peilmeting kiezen" onSluit={onSluit} className="modal-box--instelling">
      <form onSubmit={opslaan}>
        <div className="overzicht-kop">
          <h2>Peilmeting kiezen</h2>
          <p>De scores van de peilmeting bepalen de shortlist en het contextblok.</p>
        </div>
        <div className="dos-keuzes" role="radiogroup" aria-label="Peilmeting">
          <label className={`dos-keuze ${keuze === null ? "is-gekozen" : ""}`}>
            <input type="radio" name="adv-peil" checked={keuze === null} onChange={() => setKeuze(null)} />
            <span>
              <strong>Automatisch (meest recent)</strong>
              <span className="dos-hint">{automatisch ? `Nu: ${metingNaamInTraject(adviesverloop, automatisch)}` : "Er is nog geen gekoppelde Meting met afgeronde scans."}</span>
            </span>
          </label>
          {gekoppeld.map((m) => {
            const kanKiezen = heeftAfgerondeScans(organisatie, m);
            const datum = meetdatumVan(m);
            return (
              <label key={m.id} className={`dos-keuze ${keuze === m.id ? "is-gekozen" : ""} ${kanKiezen ? "" : "is-uit"}`}>
                <input type="radio" name="adv-peil" checked={keuze === m.id} disabled={!kanKiezen} onChange={() => setKeuze(m.id)} />
                <span>
                  <strong>Handmatig: {metingNaamInTraject(adviesverloop, m)}</strong>
                  <span className="dos-hint">
                    {datum ? maandJaar(datum) : "Datum ontbreekt"} · {scansTekst(aantalAfgerondInMeting(organisatie, m))}
                  </span>
                  {!kanKiezen && <span className="dos-hint">Nog geen afgeronde scans</span>}
                </span>
              </label>
            );
          })}
        </div>
        {fout && (
          <p className="overzicht-melding fout" role="alert">
            {fout}
          </p>
        )}
        <div className="btn-rij">
          <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
            Annuleren
          </button>
          <button type="submit" className="btn btn-or btn-compact">
            Opslaan
          </button>
        </div>
      </form>
    </OverzichtModal>
  );
}

/**
 * De modal "Metingen koppelen" (`adviesverloop.md`, Modals voor de Metingen): Dezelfde opbouw met een selectievakje per Meting, gegroepeerd per Assessment,
 * en achter elke aangevinkte Meting een optioneel veld Label. Een Meting die niet te kiezen is, toont de reden in grijs. `startMetingId`: de Meting
 * waarmee een nieuw adviesverloop begint (zonder `adviesverloop`) of die al is aangevinkt (de knop Koppelen in het Meting-overzicht).
 */
export function KoppelModal({
  organisatie,
  adviesverloop,
  onderdeelId,
  aangevinkt,
  onSluit,
  onGestart,
}: {
  organisatie: Organisatie;
  adviesverloop: Adviesverloop | null;
  onderdeelId: string | null;
  /** Een Meting die aangevinkt begint, naast de al gekoppelde. */
  aangevinkt?: string;
  onSluit: () => void;
  /** Alleen bij het starten: Het nieuwe adviesverloop. */
  onGestart?: (adviesverloopId: string) => void;
}) {
  const assessments = useAssessments();
  const benchmarks = useBenchmarksMetLeden();
  const startMetingId = adviesverloop ? undefined : aangevinkt;
  const rijen = koppelRijen(organisatie, adviesverloop, onderdeelId, assessments, benchmarks, startMetingId);
  const [gekozen, setGekozen] = useState<Record<string, string>>(() => {
    const begin: Record<string, string> = {};
    for (const r of rijen) {
      if (r.gekoppeld) begin[r.meting.id] = adviesverloop?.metingen.find((m) => m.metingId === r.meting.id)?.label ?? "";
    }
    if (aangevinkt && !(aangevinkt in begin)) begin[aangevinkt] = "";
    return begin;
  });
  const [fout, setFout] = useState<string | null>(null);
  // Bij Metingen van verschillende Assessments hoort een Benchmark (`adviesverloop.md`, Benchmark kiezen).
  const [benchmarkKeuze, setBenchmarkKeuze] = useState<string | null>(adviesverloop?.benchmarkId ?? null);
  const [kiestBenchmark, setKiestBenchmark] = useState(false);
  const gekozenAssessmentIds = [...new Set(rijen.filter((r) => r.meting.id in gekozen).map((r) => r.meting.assessmentId))];
  const geschikt = gekozenAssessmentIds.length > 1 ? geschikteBenchmarks(benchmarks, organisatie.id, gekozenAssessmentIds) : [];
  const keuzeNodig = geschikt.length > 1 && !geschikt.some((b) => b.id === benchmarkKeuze);

  const perAssessment = [...new Set(rijen.map((r) => r.meting.assessmentId))].map((id) => ({ id, naam: assessments.find((a) => a.id === id)?.naam ?? id, rijen: rijen.filter((r) => r.meting.assessmentId === id) }));
  const aantalGekozen = Object.keys(gekozen).length;

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    if (keuzeNodig && !kiestBenchmark) return setKiestBenchmark(true);
    const keuze = geschikt.some((b) => b.id === benchmarkKeuze) ? benchmarkKeuze : null;
    if (!adviesverloop) {
      const eerste = aangevinkt ?? Object.keys(gekozen)[0];
      if (!eerste) return setFout("Kies een Meting om mee te beginnen.");
      const r = startAdviesverloop(organisatie.id, eerste, gekozen[eerste]);
      if (!r.ok) return setFout(r.reden);
      const rest = Object.entries(gekozen).filter(([id]) => id !== eerste);
      for (const [id, label] of rest) {
        const k = koppelMeting(organisatie.id, r.adviesverloop.id, id, label, keuze);
        if (!k.ok) return setFout(k.reden);
      }
      onGestart?.(r.adviesverloop.id);
      return onSluit();
    }
    const r = koppelMetingen(
      organisatie.id,
      adviesverloop.id,
      Object.entries(gekozen).map(([metingId, label]) => ({ metingId, label })),
      keuze
    );
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  function zet(m: ScanUitvoering, aan: boolean) {
    setGekozen((vorige) => {
      const volgende = { ...vorige };
      if (aan) volgende[m.id] = volgende[m.id] ?? "";
      else delete volgende[m.id];
      return volgende;
    });
  }

  if (kiestBenchmark) {
    return (
      <BenchmarkModal
        benchmarks={geschikt}
        assessmentNaam={(id) => assessments.find((a) => a.id === id)?.naam ?? id}
        keuze={benchmarkKeuze}
        onKeuze={setBenchmarkKeuze}
        fout={fout}
        onTerug={() => setKiestBenchmark(false)}
        onOpslaan={(e) => {
          if (!benchmarkKeuze) return e.preventDefault();
          opslaan(e);
        }}
      />
    );
  }

  return (
    <OverzichtModal label="Metingen koppelen" onSluit={onSluit} className="modal-box--instelling">
      <form onSubmit={opslaan}>
        <div className="overzicht-kop">
          <h2>Metingen koppelen</h2>
          <p>Metingen van dezelfde Organisatie en hetzelfde Onderdeel. Het label is vrij en mag leeg.</p>
        </div>
        <datalist id="adv-label-suggesties">
          {LABEL_SUGGESTIES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        {perAssessment.map((groep) => (
          <div key={groep.id}>
            <p className="advcat-kop">{groep.naam}</p>
            {groep.rijen.map((r) => {
              const aan = r.meting.id in gekozen;
              const datum = meetdatumVan(r.meting);
              const uit = !!r.reden && !(r.gekoppeld && !r.vast);
              const naam = r.meting.label;
              return (
                <div key={r.meting.id} className={`adv-modalrij ${uit ? "adv-modalrij--uit" : ""}`}>
                  <label>
                    <input type="checkbox" checked={aan} disabled={uit} onChange={(e) => zet(r.meting, e.target.checked)} />
                    <span className="adv-regel-tekst">
                      <strong>{naam}</strong>
                      <span className="adv-reden">
                        {toonMeetdatum(datum)} · {scansTekst(aantalAfgerondInMeting(organisatie, r.meting))}
                        {r.reden ? ` · ${r.reden}` : ""}
                      </span>
                    </span>
                  </label>
                  {aan && (
                    <input
                      type="text"
                      list="adv-label-suggesties"
                      aria-label={`Label voor ${naam}`}
                      placeholder="Bijvoorbeeld Tussenmeting"
                      maxLength={LABEL_MAX}
                      value={gekozen[r.meting.id]}
                      onChange={(e) => setGekozen({ ...gekozen, [r.meting.id]: e.target.value })}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {rijen.length === 0 && <p className="dos-hint">Er zijn geen Metingen voor dit onderdeel.</p>}
        {geschikt.length === 1 && <p className="dos-hint">Benchmark voor de koppeling: {geschikt[0].naam}</p>}
        {geschikt.length > 1 && benchmarkKeuze && geschikt.some((b) => b.id === benchmarkKeuze) && (
          <p className="dos-hint">Benchmark voor de koppeling: {geschikt.find((b) => b.id === benchmarkKeuze)!.naam}</p>
        )}
        {fout && (
          <p className="overzicht-melding fout" role="alert">
            {fout}
          </p>
        )}
        <div className="btn-rij">
          <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
            Annuleren
          </button>
          <button type="submit" className="btn btn-or btn-compact" disabled={aantalGekozen === 0}>
            {adviesverloop ? "Opslaan" : "Starten"}
          </button>
        </div>
      </form>
    </OverzichtModal>
  );
}

/**
 * De modal "Benchmark voor de koppeling" (`adviesverloop.md`, Benchmark kiezen): Een keuzerondje per Benchmark met de naam, het aantal leden en de Assessments, met de
 * Benchmark die al gekozen is voorgeselecteerd. 560px, patroon "Meting voor de radar".
 */
function BenchmarkModal({
  benchmarks,
  assessmentNaam,
  keuze,
  onKeuze,
  fout,
  onTerug,
  onOpslaan,
}: {
  benchmarks: Benchmark[];
  assessmentNaam: (id: string) => string;
  keuze: string | null;
  onKeuze: (id: string) => void;
  fout: string | null;
  onTerug: () => void;
  onOpslaan: (e: React.FormEvent) => void;
}) {
  return (
    <OverzichtModal label="Benchmark voor de koppeling" onSluit={onTerug} className="modal-box--instelling">
      <form onSubmit={onOpslaan}>
        <div className="overzicht-kop">
          <h2>Benchmark voor de koppeling</h2>
          <p>De Organisatie zit in meer dan één Benchmark waarin deze Assessments staan. Kies welke de Metingen verbindt.</p>
        </div>
        <div className="dos-keuzes" role="radiogroup" aria-label="Benchmark voor de koppeling">
          {benchmarks.map((b) => {
            const n = aantalOrganisatiesInBenchmark(b);
            return (
              <label key={b.id} className={`dos-keuze ${keuze === b.id ? "is-gekozen" : ""}`}>
                <input type="radio" name="adv-benchmark" checked={keuze === b.id} onChange={() => onKeuze(b.id)} />
                <span>
                  <strong>{b.naam}</strong>
                  <span className="dos-hint">
                    {n} {n === 1 ? "organisatie" : "organisaties"} · {b.assessmentIds.map(assessmentNaam).join(", ")}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {fout && (
          <p className="overzicht-melding fout" role="alert">
            {fout}
          </p>
        )}
        <div className="btn-rij">
          <button type="button" className="btn btn-outline btn-compact" onClick={onTerug}>
            Terug
          </button>
          <button type="submit" className="btn btn-or btn-compact" disabled={!keuze}>
            Opslaan
          </button>
        </div>
      </form>
    </OverzichtModal>
  );
}
