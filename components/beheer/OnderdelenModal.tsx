"use client";

import { useState } from "react";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { hernoemOnderdeel, maakOnderdeel, verwijderGevolgenOnderdeel, verwijderOnderdeel } from "@/lib/db";
import { ONDERDEEL_NAAM_MAX, isHeleOrganisatie, onderdelenOpAlfabet } from "@/lib/onderdelen";
import { Organisatie } from "@/lib/types";

const schoon = (naam: string) => naam.trim().replace(/\s+/g, " ");
const sleutel = (naam: string) => schoon(naam).toLowerCase();

/**
 * De modal Onderdelen (`beheerpagina.md`, Organisatiepaneel, Onderdelen), geopend via Bewerken: Een rij per Onderdeel op alfabet met een tekstveld voor de
 * naam en "Verwijderen" (uitgeschakeld zolang er Metingen aan het Onderdeel hangen, met de reden in een tooltip), en onderaan een rij om een nieuw Onderdeel
 * toe te voegen. Namen wijzigen en toevoegen worden bewaard met Opslaan, Annuleren gooit ze weg. Verwijderen vraagt een bevestiging die het aantal
 * KPI-waarden noemt en gebeurt na die bevestiging direct. De naamregels staan in `datamodel.md`, Onderdeel: Verplicht, uniek binnen de Organisatie (zonder
 * verschil tussen hoofdletters en kleine letters) en "Hele organisatie" is gereserveerd.
 */
export function OnderdelenModal({ organisatie, onSluit }: { organisatie: Organisatie; onSluit: () => void }) {
  const bestaand = onderdelenOpAlfabet(organisatie);
  const [namen, setNamen] = useState<Record<string, string>>({});
  const [nieuwe, setNieuwe] = useState<string[]>([]);
  const [invoer, setInvoer] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [weg, setWeg] = useState<string | null>(null);

  const naamVan = (id: string, oorspronkelijk: string) => namen[id] ?? oorspronkelijk;
  const verwijderd = bestaand.find((o) => o.id === weg);
  const gevolgen = weg ? verwijderGevolgenOnderdeel(organisatie.id, weg) : { metingen: 0, kpiWaarden: 0 };

  /** De fout van één naam tegenover de andere namen in het venster, of `null`. */
  function controleer(naam: string, anderen: string[]): string | null {
    const n = schoon(naam);
    if (!n) return "Vul bij elk onderdeel een naam in.";
    if (n.length > ONDERDEEL_NAAM_MAX) return `Een naam mag maximaal ${ONDERDEEL_NAAM_MAX} tekens hebben.`;
    if (isHeleOrganisatie(n)) return "De naam Hele organisatie is gereserveerd.";
    if (anderen.some((a) => sleutel(a) === sleutel(n))) return `Er is al een onderdeel met de naam "${n}".`;
    return null;
  }

  function voegToe() {
    const n = schoon(invoer);
    const andere = [...bestaand.map((o) => naamVan(o.id, o.naam)), ...nieuwe];
    const f = controleer(n, andere);
    if (f) return setFout(f);
    setNieuwe([...nieuwe, n]);
    setInvoer("");
    setFout(null);
  }

  function opslaan() {
    setFout(null);
    // Eerst alles controleren, zodat er niets half wordt bewaard.
    const alle = [...bestaand.map((o) => naamVan(o.id, o.naam)), ...nieuwe];
    for (const [i, naam] of alle.entries()) {
      const f = controleer(
        naam,
        alle.filter((_, j) => j !== i),
      );
      if (f) return setFout(f);
    }
    for (const o of bestaand) {
      const naam = schoon(naamVan(o.id, o.naam));
      if (naam === o.naam) continue;
      const r = hernoemOnderdeel(organisatie.id, o.id, naam);
      if (!r.ok) return setFout(r.reden);
    }
    for (const naam of nieuwe) {
      const r = maakOnderdeel(organisatie.id, naam);
      if (!r.ok) return setFout(r.reden);
    }
    onSluit();
  }

  function verwijder() {
    if (!weg) return;
    const r = verwijderOnderdeel(organisatie.id, weg);
    setWeg(null);
    if (!r.ok) return setFout(r.reden);
    setNamen(({ [weg]: _weg, ...rest }) => (void _weg, rest));
  }

  return (
    <>
      <OverzichtModal label="Onderdelen" onSluit={onSluit} escUitgeschakeld={weg !== null} className="modal-box--instelling">
        <div className="overzicht-kop">
          <h2>Onderdelen</h2>
          <p className="text-sm text-ink-m" style={{ margin: 0 }}>
            {organisatie.naam}
          </p>
        </div>

        {bestaand.length === 0 && nieuwe.length === 0 && (
          <p className="text-sm text-ink-m">
            Er zijn nog geen onderdelen. De KPI&apos;s gelden voor de hele organisatie en voor alle kanalen samen.
          </p>
        )}

        <ul className="od-lijst">
          {bestaand.map((o) => {
            const g = verwijderGevolgenOnderdeel(organisatie.id, o.id);
            const reden =
              g.metingen > 0
                ? `Dit onderdeel heeft ${g.metingen} ${g.metingen === 1 ? "Meting" : "Metingen"}. Verwijder of wijzig die eerst.`
                : undefined;
            return (
              <li key={o.id} className="od-rij">
                <div className="admin-field od-veld">
                  <input
                    type="text"
                    aria-label={`Naam van ${o.naam}`}
                    maxLength={ONDERDEEL_NAAM_MAX}
                    value={naamVan(o.id, o.naam)}
                    onChange={(e) => {
                      setNamen({ ...namen, [o.id]: e.target.value });
                      setFout(null);
                    }}
                  />
                </div>
                <span title={reden}>
                  <button type="button" className="btn btn-danger btn-compact" disabled={g.metingen > 0} onClick={() => setWeg(o.id)}>
                    Verwijderen
                  </button>
                </span>
              </li>
            );
          })}
          {nieuwe.map((naam, i) => (
            <li key={`nieuw-${i}`} className="od-rij">
              <div className="admin-field od-veld">
                <input
                  type="text"
                  aria-label={`Naam van het nieuwe onderdeel ${naam}`}
                  maxLength={ONDERDEEL_NAAM_MAX}
                  value={naam}
                  onChange={(e) => setNieuwe(nieuwe.map((n, j) => (j === i ? e.target.value : n)))}
                />
              </div>
              <button type="button" className="btn btn-outline btn-compact" onClick={() => setNieuwe(nieuwe.filter((_, j) => j !== i))}>
                Weghalen
              </button>
            </li>
          ))}
          <li className="od-rij od-rij--nieuw">
            <div className="admin-field od-veld">
              <input
                type="text"
                aria-label="Naam van een nieuw onderdeel"
                placeholder="Naam van een nieuw onderdeel"
                maxLength={ONDERDEEL_NAAM_MAX}
                value={invoer}
                onChange={(e) => {
                  setInvoer(e.target.value);
                  setFout(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    voegToe();
                  }
                }}
              />
            </div>
            <button type="button" className="btn btn-or btn-compact" onClick={voegToe}>
              + Toevoegen
            </button>
          </li>
        </ul>

        {fout && (
          <p className="overzicht-melding fout" role="alert">
            {fout}
          </p>
        )}
        <div className="btn-rij" style={{ justifyContent: "flex-end", marginTop: "var(--sp-4)" }}>
          <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
            Annuleren
          </button>
          <button type="button" className="btn btn-or btn-compact" onClick={opslaan}>
            Opslaan
          </button>
        </div>
      </OverzichtModal>
      <BevestigModal
        open={weg !== null}
        titel="Onderdeel verwijderen"
        bericht={
          gevolgen.kpiWaarden > 0
            ? `Het onderdeel "${verwijderd?.naam ?? ""}" wordt verwijderd, met ${gevolgen.kpiWaarden} ${gevolgen.kpiWaarden === 1 ? "KPI-waarde" : "KPI-waarden"}. Dit kan niet ongedaan worden gemaakt.`
            : `Het onderdeel "${verwijderd?.naam ?? ""}" wordt verwijderd. Dit kan niet ongedaan worden gemaakt.`
        }
        onBevestigen={verwijder}
        onAnnuleren={() => setWeg(null)}
      />
    </>
  );
}
