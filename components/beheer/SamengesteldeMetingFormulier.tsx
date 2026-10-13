"use client";

import { useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { useInstellingen } from "@/lib/instellingen-store";
import { maakSamengesteldeMeting, wijzigSamengesteldeMeting } from "@/lib/db";
import {
  STANDAARD_ONDERDEEL,
  aantalAfgerondInMeting,
  genereerLabel,
  isSamengesteld,
  metingenInRonde,
  onderdeelVan,
  rondesVan,
  voldoetAanMinScans,
} from "@/lib/rondes";
import { Organisatie, ScanUitvoering } from "@/lib/types";

/**
 * Het formulier voor een samengestelde Meting (`beheerpagina.md`, punt 5, Samengestelde Meting): Het Assessment en het
 * onderdeel (voorgevuld met "Hele organisatie"). De naam maakt de app. Daaronder de Metingen van die ronde voor dat Assessment, elk met een
 * selectievakje, het onderdeel en het aantal afgeronde scans, standaard allemaal aan. Een Meting met te weinig scans
 * (`benchmarkMinScans`) is uitgeschakeld, met de reden erbij. Opslaan kan pas bij minstens twee Metingen.
 *
 * Aanmaken (`rondeId`) en wijzigen (`bestaande`) gebruiken hetzelfde formulier. Bij wijzigen liggen de ronde en het
 * Assessment vast.
 */
export function SamengesteldeMetingFormulier({
  organisatie,
  rondeId,
  bestaande,
  onKlaar,
  onAnnuleren,
}: {
  organisatie: Organisatie;
  rondeId: string;
  bestaande?: ScanUitvoering;
  onKlaar: (meting: ScanUitvoering) => void;
  onAnnuleren: () => void;
}) {
  const assessments = useAssessments();
  const { benchmarkMinScans } = useInstellingen();
  const ronde = rondesVan(organisatie).find((r) => r.id === rondeId);
  const metingen = metingenInRonde(organisatie, rondeId).filter((m) => !isSamengesteld(m));
  const assessmentIds = [...new Set(metingen.map((m) => m.assessmentId))];

  const [assessmentId, setAssessmentId] = useState(bestaande?.assessmentId ?? assessmentIds[0] ?? "");
  const [onderdeel, setOnderdeel] = useState(bestaande ? onderdeelVan(bestaande) : STANDAARD_ONDERDEEL);
  const [gekozen, setGekozen] = useState<string[]>(bestaande?.samenstelling ?? []);
  const [initieel, setInitieel] = useState(!bestaande);
  const [fout, setFout] = useState<string | null>(null);

  const kandidaten = metingen.filter((m) => m.assessmentId === assessmentId);
  const aan = (m: ScanUitvoering) => voldoetAanMinScans(organisatie, m, benchmarkMinScans);
  // Standaard allemaal aan, behalve de Metingen die te weinig scans hebben.
  const actueel = initieel ? kandidaten.filter(aan).map((m) => m.id) : gekozen.filter((id) => kandidaten.some((k) => k.id === id));
  const kanOpslaan = actueel.length >= 2;
  const voorstelLabel = ronde ? genereerLabel(onderdeel, ronde.label) : "";
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";

  function wissel(id: string, aanzetten: boolean) {
    const basis = initieel ? actueel : gekozen;
    setInitieel(false);
    setGekozen(aanzetten ? [...basis, id] : basis.filter((x) => x !== id));
  }

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    if (bestaande) {
      const r = wijzigSamengesteldeMeting(bestaande.id, { onderdeel, metingIds: actueel, minScans: benchmarkMinScans });
      if (!r.ok) return setFout(r.reden);
      onKlaar(bestaande);
      return;
    }
    const r = maakSamengesteldeMeting(organisatie.id, {
      rondeId,
      assessmentId,
      onderdeel,
      metingIds: actueel,
      minScans: benchmarkMinScans,
    });
    if (!r.ok) return setFout(r.reden);
    onKlaar(r.meting);
  }

  if (!ronde) return <p className="admin-notice">Ronde niet gevonden.</p>;
  if (assessmentIds.length === 0) {
    return (
      <div>
        <p className="admin-notice">Deze ronde heeft nog geen Metingen om een gemiddelde van te maken.</p>
        <button type="button" className="btn btn-outline btn-compact" onClick={onAnnuleren} style={{ marginTop: "0.8rem" }}>
          Sluiten
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={opslaan} className="text-left">
      <p className="text-sm text-ink-m" style={{ marginTop: 0 }}>
        Het gemiddelde van Metingen in {ronde.label}. Elke Meting telt even zwaar mee, ongeacht het aantal scans.
      </p>
      <div className="admin-field">
        <label>Assessment</label>
        <select value={assessmentId} disabled={!!bestaande} onChange={(e) => { setAssessmentId(e.target.value); setInitieel(true); }}>
          {assessmentIds.map((id) => (
            <option key={id} value={id}>
              {assessmentNaam(id)}
            </option>
          ))}
        </select>
      </div>
      <div className="admin-field">
        <label>Onderdeel</label>
        <input type="text" value={onderdeel} onChange={(e) => setOnderdeel(e.target.value)} />
        {voorstelLabel && (
          <p className="text-sm text-ink-s" style={{ margin: "0.3rem 0 0" }}>
            Wordt: {voorstelLabel}
          </p>
        )}
      </div>
      <div className="admin-field">
        <label>Metingen (minstens twee)</label>
        <div className="flex flex-col gap-1">
          {kandidaten.map((m) => {
            const geschikt = aan(m);
            return (
              <label key={m.id} className="flex items-center gap-2 text-sm" style={{ opacity: geschikt ? 1 : 0.6 }}>
                <input type="checkbox" disabled={!geschikt} checked={actueel.includes(m.id)} onChange={(e) => wissel(m.id, e.target.checked)} />
                <span>
                  {m.label} <span className="text-ink-s">— {onderdeelVan(m)} · {aantalAfgerondInMeting(organisatie, m)} afgeronde scans</span>
                  {!geschikt && <span className="text-ink-s"> · minder dan {benchmarkMinScans} afgeronde scans</span>}
                </span>
              </label>
            );
          })}
        </div>
      </div>
      {fout && <p className="overzicht-melding fout">{fout}</p>}
      <div className="btn-rij" style={{ marginTop: "1rem" }}>
        <button type="button" className="btn btn-outline" onClick={onAnnuleren}>
          Annuleren
        </button>
        <button type="submit" className="btn btn-or" disabled={!kanOpslaan}>
          Opslaan
        </button>
      </div>
    </form>
  );
}
