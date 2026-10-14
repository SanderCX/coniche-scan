"use client";

import { useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import { useInstellingen } from "@/lib/instellingen-store";
import { maakSamengesteldeMeting, wijzigSamengesteldeMeting } from "@/lib/db";
import {
  STANDAARD_ONDERDEEL,
  aantalAfgerondInMeting,
  genereerLabel,
  isSamengesteld,
  laatsteMeetdatum,
  meetdatumVan,
  nieuwsteEerst,
  onderdeelVan,
  selectieHeeftZelfdeOnderdeel,
  toonMeetdatum,
  voldoetAanMinScans,
} from "@/lib/metingen";
import { Organisatie, ScanUitvoering } from "@/lib/types";

/**
 * Het formulier voor een samengestelde Meting (`beheerpagina.md`, punt 5, Samengestelde Meting): Het Assessment en het
 * onderdeel (voorgevuld met "Hele organisatie"). De naam maakt de app. Daaronder de Metingen van deze organisatie voor dat
 * Assessment, op meetdatum, elk met een selectievakje, het onderdeel, de meetdatum en het aantal afgeronde scans. Standaard
 * staat er niets aan, omdat de Metingen van verschillende momenten kunnen zijn. Een Meting met te weinig scans
 * (`benchmarkMinScans`) of zonder meetdatum is uitgeschakeld, met de reden erbij. Opslaan kan pas bij minstens twee Metingen.
 *
 * Staan er twee Metingen met hetzelfde onderdeel in de selectie, dan staat er een waarschuwing en blijft opslaan mogelijk. De
 * meetdatum volgt de selectie: De laatste meetdatum, niet los te wijzigen.
 *
 * Aanmaken en wijzigen (`bestaande`) gebruiken hetzelfde formulier. Bij wijzigen ligt het Assessment vast.
 */
export function SamengesteldeMetingFormulier({
  organisatie,
  bestaande,
  onKlaar,
  onAnnuleren,
}: {
  organisatie: Organisatie;
  bestaande?: ScanUitvoering;
  onKlaar: (meting: ScanUitvoering) => void;
  onAnnuleren: () => void;
}) {
  const assessments = useAssessments();
  const { benchmarkMinScans } = useInstellingen();
  const metingen = organisatie.scanUitvoeringen.filter((m) => !isSamengesteld(m));
  // Een gemiddelde over Metingen bestaat niet voor Ja / Nee / Weet ik niet (`backlog.md`, Quickscan Ziekenhuis).
  const assessmentIds = [...new Set(metingen.map((m) => m.assessmentId))].filter((id) => {
    const a = assessments.find((x) => x.id === id);
    return !a || !isJaNeeWeetNiet(a);
  });

  const [assessmentId, setAssessmentId] = useState(bestaande?.assessmentId ?? assessmentIds[0] ?? "");
  const [onderdeel, setOnderdeel] = useState(bestaande ? onderdeelVan(bestaande) : STANDAARD_ONDERDEEL);
  const [gekozen, setGekozen] = useState<string[]>(bestaande?.samenstelling ?? []);
  const [fout, setFout] = useState<string | null>(null);

  const kandidaten = nieuwsteEerst(metingen.filter((m) => m.assessmentId === assessmentId));
  const reden = (m: ScanUitvoering): string | null => {
    if (!meetdatumVan(m)) return "Vul eerst de meetdatum in";
    if (!voldoetAanMinScans(organisatie, m, benchmarkMinScans)) return `Minder dan ${benchmarkMinScans} afgeronde scans`;
    return null;
  };
  const actueel = gekozen.filter((id) => kandidaten.some((k) => k.id === id));
  const gekozenMetingen = kandidaten.filter((m) => actueel.includes(m.id));
  const kanOpslaan = actueel.length >= 2;
  const meetdatum = laatsteMeetdatum(gekozenMetingen);
  const voorstelLabel = meetdatum ? genereerLabel(onderdeel, meetdatum) : "";
  const zelfdeOnderdeel = selectieHeeftZelfdeOnderdeel(gekozenMetingen);
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";

  function wissel(id: string, aanzetten: boolean) {
    setGekozen(aanzetten ? [...actueel, id] : actueel.filter((x) => x !== id));
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
    const r = maakSamengesteldeMeting(organisatie.id, { assessmentId, onderdeel, metingIds: actueel, minScans: benchmarkMinScans });
    if (!r.ok) return setFout(r.reden);
    onKlaar(r.meting);
  }

  if (assessmentIds.length === 0) {
    return (
      <div>
        <p className="admin-notice">Deze organisatie heeft nog geen Metingen om een gemiddelde van te maken.</p>
        <button type="button" className="btn btn-outline btn-compact" onClick={onAnnuleren} style={{ marginTop: "0.8rem" }}>
          Sluiten
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={opslaan} className="text-left">
      <p className="text-sm text-ink-m" style={{ marginTop: 0 }}>
        Het gemiddelde van Metingen van {organisatie.naam}. Elke Meting telt even zwaar mee, ongeacht het aantal scans.
      </p>
      <div className="admin-field">
        <label htmlFor="gemiddelde-assessment">Assessment</label>
        <select
          id="gemiddelde-assessment"
          value={assessmentId}
          disabled={!!bestaande}
          onChange={(e) => {
            setAssessmentId(e.target.value);
            setGekozen([]);
          }}
        >
          {assessmentIds.map((id) => (
            <option key={id} value={id}>
              {assessmentNaam(id)}
            </option>
          ))}
        </select>
      </div>
      <div className="admin-field">
        <label htmlFor="gemiddelde-onderdeel">Onderdeel</label>
        <input id="gemiddelde-onderdeel" type="text" value={onderdeel} onChange={(e) => setOnderdeel(e.target.value)} />
        {voorstelLabel && (
          <p className="text-sm text-ink-s" style={{ margin: "0.3rem 0 0" }}>
            Wordt: {voorstelLabel} (meetdatum {toonMeetdatum(meetdatum)}, de laatste van de gekozen Metingen)
          </p>
        )}
      </div>
      <div className="admin-field">
        <label>Metingen (minstens twee)</label>
        <div className="flex flex-col gap-1">
          {kandidaten.length === 0 && <p className="text-sm text-ink-s">Geen Metingen van dit Assessment.</p>}
          {kandidaten.map((m) => {
            const nee = reden(m);
            return (
              <label key={m.id} className="flex items-center gap-2 text-sm" style={{ opacity: nee ? 0.6 : 1 }}>
                <input type="checkbox" disabled={!!nee} checked={actueel.includes(m.id)} onChange={(e) => wissel(m.id, e.target.checked)} />
                <span>
                  {m.label}{" "}
                  <span className="text-ink-s">
                    — {onderdeelVan(m)} · {toonMeetdatum(meetdatumVan(m))} · {aantalAfgerondInMeting(organisatie, m)} afgeronde scans
                  </span>
                  {nee && <span className="text-ink-s"> · {nee}</span>}
                </span>
              </label>
            );
          })}
        </div>
      </div>
      {zelfdeOnderdeel && (
        <p className="overzicht-melding">
          Een gemiddelde over twee momenten van hetzelfde onderdeel zegt weinig over de ontwikkeling.
        </p>
      )}
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
