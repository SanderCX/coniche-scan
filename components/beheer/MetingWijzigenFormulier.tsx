"use client";

import { useState } from "react";
import { wijzigMeting } from "@/lib/db";
import {
  dubbeleCombinatieTekst,
  isGeldigeDatum,
  isSamengesteld,
  meetdatumVan,
  metingMetCombinatie,
  onderdeelVan,
  standaardLabel,
} from "@/lib/metingen";
import { Organisatie, ScanUitvoering } from "@/lib/types";
import {
  OnderdeelMeetdatumVelden,
  OnderdeelMeetdatumWaarde,
  onderdeelFout,
  onderdeelNaamVoorOpslaan,
} from "@/components/beheer/OnderdeelMeetdatumVelden";

/**
 * "Wijzigen" van een Meting (`beheerpagina.md`, punt 5): Achter het potlood naast de naam van de Meting, met alleen de velden
 * Onderdeel, Meetdatum en Naam en verder niets. De naam is voorgevuld met de huidige naam. Pas je hem aan, dan volgt hij
 * onderdeel en meetdatum niet meer (`Meting.labelHandmatig`), en "Standaardnaam herstellen" zet hem terug. Het Assessment ligt
 * vast. Een samengestelde Meting heeft geen eigen meetdatum: Ze volgt de onderliggende Metingen. Dezelfde combinatie als een
 * andere Meting is een waarschuwing en geen blokkade.
 */
export function MetingWijzigenFormulier({
  organisatie,
  meting,
  onKlaar,
}: {
  organisatie: Organisatie;
  meting: ScanUitvoering;
  onKlaar: () => void;
}) {
  const samengesteld = isSamengesteld(meting);
  const [waarde, setWaarde] = useState<OnderdeelMeetdatumWaarde>({ onderdeel: onderdeelVan(meting), meetdatum: meetdatumVan(meting) ?? "" });
  const onderdeelNaam = onderdeelNaamVoorOpslaan(organisatie, waarde);
  const [naam, setNaam] = useState(meting.label);
  // De naam volgt onderdeel en meetdatum zolang de gebruiker hem niet zelf aanpast.
  const [naamAangepast, setNaamAangepast] = useState(meting.labelHandmatig === true);
  const [fout, setFout] = useState<string | null>(null);

  // De naam die de app zelf zou maken uit het onderdeel en de meetdatum zoals ze nu in het formulier staan.
  const standaard = standaardLabel({
    onderdeel: onderdeelNaam,
    meetdatum: isGeldigeDatum(waarde.meetdatum) ? waarde.meetdatum : meetdatumVan(meting) ?? undefined,
  });
  const getoondeNaam = naamAangepast ? naam : standaard;
  const dubbel = isGeldigeDatum(waarde.meetdatum)
    ? metingMetCombinatie(organisatie, onderdeelNaam, meting.assessmentId, waarde.meetdatum, meting.id)
    : undefined;

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    const onderdeelProbleem = onderdeelFout(organisatie, waarde);
    if (onderdeelProbleem) return setFout(onderdeelProbleem);
    if (!samengesteld && waarde.meetdatum && !isGeldigeDatum(waarde.meetdatum)) return setFout("De meetdatum klopt niet.");
    const r = wijzigMeting(meting.id, {
      onderdeel: onderdeelNaam,
      ...(samengesteld ? {} : { meetdatum: waarde.meetdatum || null }),
      ...(naamAangepast ? { label: getoondeNaam } : { herstelLabel: true }),
    });
    if (!r.ok) return setFout(r.reden);
    onKlaar();
  }

  return (
    <form onSubmit={opslaan} style={{ marginBottom: "0.8rem" }}>
      <div className="flex flex-wrap items-start gap-3">
        <OnderdeelMeetdatumVelden
          organisatie={organisatie}
          waarde={waarde}
          onChange={setWaarde}
          idPrefix="wijzig-meting"
          inRij
          meetdatumUitgeschakeld={samengesteld}
        />
        <div className="admin-field" style={{ marginBottom: 0, minWidth: "18rem" }}>
          <label htmlFor="wijzig-meting-naam">Naam</label>
          <input
            id="wijzig-meting-naam"
            type="text"
            required
            value={getoondeNaam}
            onChange={(e) => {
              setNaam(e.target.value);
              setNaamAangepast(true);
            }}
          />
        </div>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label aria-hidden="true" style={{ visibility: "hidden" }}>
            &nbsp;
          </label>
          <span className="knoppenrij">
            <button type="submit" className="btn btn-or btn-compact">
              Opslaan
            </button>
            <button type="button" className="btn btn-outline btn-compact" onClick={onKlaar}>
              Annuleren
            </button>
            {(naamAangepast || meting.labelHandmatig) && getoondeNaam !== standaard && (
              <button
                type="button"
                className="btn btn-outline btn-compact"
                onClick={() => {
                  setNaamAangepast(false);
                  setNaam(standaard);
                }}
              >
                Standaardnaam herstellen
              </button>
            )}
          </span>
        </div>
      </div>
      {dubbel && <p className="overzicht-melding" style={{ margin: "0.6rem 0 0" }}>{dubbeleCombinatieTekst(dubbel.label)}</p>}
      {fout && <p className="overzicht-melding fout" style={{ margin: "0.6rem 0 0" }}>{fout}</p>}
    </form>
  );
}
