"use client";

import { useState } from "react";
import { Assessment } from "@/lib/types";
import { AntwoordenWeergave, rond1 } from "@/lib/visualisatie";
import { Tegels, toon } from "./gedeeld";

/** De scorekleur van een antwoord of score: De afgeronde waarde, 2,5 krijgt de kleur van 3 (`visualisatie-scores.md`, G). */
function stap(waarde: number): 1 | 2 | 3 | 4 | 5 {
  return Math.min(5, Math.max(1, Math.round(rond1(waarde)))) as 1 | 2 | 3 | 4 | 5;
}

/**
 * Weergave G, Antwoorden per vraag (`visualisatie-scores.md`, G): Eén kolom per afgeronde scan met de initialen van de
 * respondent (de naam in een tooltip), de bouwblokken als uitklapbare rijen met hun vragen. Elke cel heeft de scorekleur van
 * de afgeronde waarde, met vijf stappen: Hier staan losse antwoorden en geen gemiddelden over een groep. Rechts per rij het
 * gemiddelde en het aantal antwoorden, onderaan de totaalscore. Alleen voor een Admin en Consultant: Dit zijn de antwoorden van
 * personen met naam. Alle bouwblokken staan standaard ingeklapt. De kaart scrolt zelf, met de kop en de linkerkolom vast.
 */
export function WeergaveAntwoorden({ assessment, weergave }: { assessment: Assessment; weergave: AntwoordenWeergave }) {
  const { kolommen, rijen } = weergave;
  const [open, setOpen] = useState<Set<string>>(new Set());
  const alleIds = rijen.map((r) => r.rij.bouwblok.id);

  const toggle = (id: string) =>
    setOpen((vorig) => {
      const nieuw = new Set(vorig);
      if (nieuw.has(id)) nieuw.delete(id);
      else nieuw.add(id);
      return nieuw;
    });

  const percentage = weergave.mogelijk === 0 ? null : Math.round((weergave.beantwoord / weergave.mogelijk) * 100);
  const vraagTegel = (v: AntwoordenWeergave["laagsteVraag"]) => ({
    waarde: toon(v?.score),
    score: v?.score,
    sub: v ? `${v.bouwblok}, vraag ${v.nummer}` : undefined,
  });
  const laagste = vraagTegel(weergave.laagsteVraag);
  const hoogste = vraagTegel(weergave.hoogsteVraag);

  if (kolommen.length === 0) {
    return <p className="admin-notice">Er zijn nog geen afgeronde scans in deze Meting.</p>;
  }

  return (
    <div className="vis" data-weergave="antwoorden">
      <Tegels
        tegels={[
          { label: "Respondenten", waarde: String(weergave.aantalRespondenten) },
          {
            label: "Beantwoord",
            waarde: percentage === null ? "–" : `${percentage}%`,
            sub: `${weergave.beantwoord} van ${weergave.mogelijk} vragen`,
          },
          { label: "Laagste vraag", ...laagste },
          { label: "Hoogste vraag", ...hoogste },
        ]}
      />
      <div className="vis-acties">
        <button type="button" className="btn btn-outline btn-compact" onClick={() => setOpen(new Set(alleIds))}>
          Alles uitklappen
        </button>
        <button type="button" className="btn btn-outline btn-compact" onClick={() => setOpen(new Set())}>
          Alles inklappen
        </button>
      </div>
      <div className="vis-antw-kaart">
        <table className="vis-antw">
          <thead>
            <tr>
              <th className="vis-antw-naam">{assessment.bouwblokLabel}</th>
              {kolommen.map((k) => (
                <th key={k.invullingId} title={k.naam || undefined}>
                  {k.initialen}
                </th>
              ))}
              <th>Gem.</th>
              <th>N</th>
            </tr>
          </thead>
          <tbody>
            {rijen.map((r) => {
              const id = r.rij.bouwblok.id;
              const uitgeklapt = open.has(id);
              return (
                <RijGroep key={id}>
                  <tr className="vis-antw-blok" style={{ ["--accent" as string]: r.rij.groepKleur ?? undefined }}>
                    <td className="vis-antw-naam">
                      <button
                        type="button"
                        className="vis-antw-toggle"
                        aria-expanded={uitgeklapt}
                        aria-label={`${uitgeklapt ? "Klap in" : "Klap uit"}: ${r.rij.bouwblok.naam}`}
                        onClick={() => toggle(id)}
                      >
                        <span className="vis-antw-pijl" aria-hidden="true">
                          {uitgeklapt ? "▾" : "▸"}
                        </span>
                        <span className="vis-nr">{r.rij.bouwblok.volgnummer}</span>
                        <span>{r.rij.bouwblok.naam}</span>
                        {r.rij.gewicht !== 1 && <span className="vis-factor">{r.rij.gewicht.toString().replace(".", ",")}×</span>}
                      </button>
                    </td>
                    {r.scores.map((s, i) => (
                      <td key={i} className={s === null ? "vis-antw-cel vis-antw-cel--leeg" : `vis-antw-cel vis-antw-cel--${stap(s)}`}>
                        {s === null ? "" : toon(s)}
                      </td>
                    ))}
                    <td className="vis-antw-zij">{toon(r.gemiddelde)}</td>
                    <td className="vis-antw-zij">{r.n}</td>
                  </tr>
                  {uitgeklapt && <Ruimte kolommen={kolommen.length + 3} />}
                  {uitgeklapt &&
                    r.vragen.map((v) => (
                      <tr key={v.vraagId} className="vis-antw-vraag">
                        <td className="vis-antw-naam">
                          <span className="vis-antw-vraagtekst">
                            <span className="text-ink-s font-bold">{v.nummer}</span> {v.tekst}
                          </span>
                        </td>
                        {v.antwoorden.map((a, i) => (
                          <td key={i} className={a === null ? "vis-antw-cel vis-antw-cel--leeg" : `vis-antw-cel vis-antw-cel--${stap(a)}`}>
                            {a === null ? "" : a}
                          </td>
                        ))}
                        <td className="vis-antw-zij">{toon(v.gemiddelde)}</td>
                        <td className="vis-antw-zij">{v.n}</td>
                      </tr>
                    ))}
                  {uitgeklapt && <Ruimte kolommen={kolommen.length + 3} />}
                </RijGroep>
              );
            })}
            <tr className="vis-antw-totaal">
              <td className="vis-antw-naam font-bold">Totaalscore</td>
              {weergave.totaal.map((t, i) => (
                <td key={i} className={t === null ? "vis-antw-cel vis-antw-cel--leeg" : `vis-antw-cel vis-antw-cel--${stap(t)}`}>
                  {toon(t)}
                </td>
              ))}
              <td className="vis-antw-zij">{toon(weergave.totaalGemiddelde)}</td>
              <td className="vis-antw-zij">{weergave.totaalN}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="vis-onderschrift">
        Elke kolom is een respondent{kolommen.some((k) => k.naam) ? ", met de naam in een tooltip" : " (anoniem, in een vaste volgorde)"}.
        Een bouwblokcel toont de bouwblokscore van die respondent, een lege cel is een onbeantwoorde vraag.
      </p>
    </div>
  );
}

/** Een lege regel ruimte boven de eerste en onder de laatste vraag van een uitgeklapt bouwblok. */
function Ruimte({ kolommen }: { kolommen: number }) {
  return (
    <tr className="vis-antw-ruimte" aria-hidden="true">
      <td colSpan={kolommen} />
    </tr>
  );
}

/** Een fragment met sleutel: Een bouwblokrij en zijn vraagrijen horen bij elkaar. */
function RijGroep({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
