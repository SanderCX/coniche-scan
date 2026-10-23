"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { ScoreRing } from "@/components/ScoreRing";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { BouwblokCirkel } from "@/components/dossier/BouwblokChip";
import { zetExtraBouwsteen } from "@/lib/db";
import { opLaagsteScore, verschilTekst } from "@/lib/advies";
import { CLASSIFICATIE_INFO } from "@/lib/colors";
import { formatScore } from "@/lib/format";
import { classificatie } from "@/lib/scoring";
import { ringVanScore } from "@/lib/score-ring";
import { useInstellingen } from "@/lib/instellingen-store";
import type { AdviesData } from "./useAdviesData";

const GETALWOORD: Record<number, string> = { 1: "één", 2: "twee", 3: "drie", 4: "vier", 5: "vijf" };

/** "De drie laagste scores" of "De laagste score": Het aantal in woorden tot en met vijf. */
function laagsteTekst(aantal: number): string {
  return aantal === 1 ? "De laagste score" : `De ${GETALWOORD[aantal] ?? aantal} laagste scores`;
}

/** De kleur van de chip van een klasse (`stylesheet.md`, Scorekleuren): De celkleur van de afgeronde score. */
export function KlasseChip({ score }: { score: number }) {
  const klasse = classificatie(score);
  const ring = ringVanScore(score, klasse);
  return (
    <span className="klasse-chip" style={{ background: ring.chipAchtergrond, color: ring.chipTekst }}>
      {CLASSIFICATIE_INFO[klasse].label}
    </span>
  );
}

/**
 * Scherm Adviesverloop (`adviesverloop.md`, Scherm Adviesverloop): De kaart Shortlist voor het gesprek met per bouwsteen de ring, de naam, het verschil met de
 * benchmark en de spreiding, de klasse en een knop naar de resultaten. Onderaan "Uitwerken".
 */
export function ShortlistScherm({ data, kanWijzigen, onUitwerken }: { data: AdviesData; kanWijzigen: boolean; onUitwerken: () => void }) {
  const { shortlist, adviesverloop, peil } = data;
  const { shortlistAantal } = useInstellingen();
  const [toevoegen, setToevoegen] = useState(false);
  const extra = shortlist.filter((r) => !r.standaard).length;

  if (!peil || !data.assessment) {
    return (
      <section className="beheer-kaart" aria-label="Shortlist voor het gesprek">
        <div className="beheer-kaart-kop">
          <h2>Shortlist voor het gesprek</h2>
        </div>
        <p className="text-sm text-ink-s">
          {peil ? "Dit adviesverloop werkt op scans met een schaal van 1 tot 5. De peilmeting heeft een ander antwoordtype." : "Er is nog geen gekoppelde Meting met afgeronde scans. Kies of koppel een Meting in het blok Scan hierboven."}
        </p>
      </section>
    );
  }

  return (
    <section className="beheer-kaart" aria-labelledby="adv-shortlist-kop">
      <div className="beheer-kaart-kop">
        <div>
          <div className="titel-rij">
            <h2 id="adv-shortlist-kop">Shortlist voor het gesprek</h2>
            <InfoIcoon sleutel="info.adviesverloopShortlist" />
          </div>
          <p className="adv-sub">
            {shortlist.length} {shortlist.length === 1 ? "bouwsteen" : "bouwstenen"}: {laagsteTekst(shortlistAantal)}
            {extra > 0 ? ` en ${extra} toegevoegd` : ""}
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-compact" disabled={!kanWijzigen} onClick={() => setToevoegen(true)}>
          Bouwsteen toevoegen
        </button>
      </div>
      <div>
        {shortlist.map((r) => {
          const klasse = classificatie(r.score);
          const groep = data.groepen.get(r.bouwblok.id);
          const bm = data.benchmark?.perBouwsteen.get(r.bouwblok.id);
          const sp = data.spreiding.get(r.bouwblok.id);
          const sinds = data.verschil?.get(r.bouwblok.id);
          const feiten = [
            bm ? `Benchmark ${verschilTekst(bm.verschil)}` : null,
            sp ? `Spreiding ${sp.label.toLowerCase()}` : null,
            sinds !== undefined ? `${verschilTekst(sinds)} sinds de eerste Meting` : null,
          ].filter(Boolean);
          return (
            <div key={r.bouwblok.id} className="adv-rij">
              <ScoreRing mini metChip={false} ring={ringVanScore(r.score, klasse)} alt={`${r.bouwblok.naam}: ${formatScore(r.score)}`} />
              <div className="adv-rij-tekst">
                <p className="eyebrow">
                  Bouwsteen {r.bouwblok.volgnummer}
                  {groep?.naam ? ` · ${groep.naam}` : ""}
                </p>
                <span className="adv-rij-naam">{r.bouwblok.naam}</span>
                {feiten.length > 0 && <span className="adv-rij-feit">{feiten.join(" · ")}</span>}
              </div>
              <KlasseChip score={r.score} />
              <Link className="btn btn-outline btn-compact" href={`/beheer/rapportage/${peil.id}`}>
                Bekijk in resultaten
              </Link>
              {!r.standaard && kanWijzigen && (
                <button
                  type="button"
                  className="btn btn-outline btn-compact"
                  onClick={() => zetExtraBouwsteen(data.organisatie.id, adviesverloop.id, r.bouwblok.id, false, r.bouwblok.naam, r.bouwblok.volgnummer)}
                >
                  Verwijderen
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="adv-voet">
        <span>{laagsteTekst(shortlistAantal)} staan er standaard in.</span>
        <button type="button" className="btn btn-or" onClick={onUitwerken}>
          Uitwerken
        </button>
      </div>
      {toevoegen && <ToevoegenModal data={data} onSluit={() => setToevoegen(false)} />}
    </section>
  );
}

/** De modal Bouwsteen toevoegen (Overzichtsmodal): Alle andere bouwstenen van laag naar hoog, met een selectievakje. Een open deur is welkom. */
function ToevoegenModal({ data, onSluit }: { data: AdviesData; onSluit: () => void }) {
  const staat = new Set(data.shortlist.map((r) => r.bouwblok.id));
  const kandidaten = opLaagsteScore(data.resultaten).filter((r) => !staat.has(r.bouwblok.id) || data.adviesverloop.extraBouwsteenIds.includes(r.bouwblok.id));
  const extra = new Set(data.adviesverloop.extraBouwsteenIds);
  return (
    <OverzichtModal label="Bouwsteen toevoegen" onSluit={onSluit} className="modal-box--instelling">
      <div className="overzicht-kop">
        <h2>Bouwsteen toevoegen</h2>
        <p>Van laag naar hoog. Ook een bouwsteen die goed scoort kan erbij, als je er met de klant over wilt spreken.</p>
      </div>
      <div>
        {kandidaten.map((r) => {
          const groep = data.groepen.get(r.bouwblok.id);
          return (
            <div key={r.bouwblok.id} className="adv-modalrij">
              <label>
                <input
                  type="checkbox"
                  checked={extra.has(r.bouwblok.id)}
                  onChange={(e) => zetExtraBouwsteen(data.organisatie.id, data.adviesverloop.id, r.bouwblok.id, e.target.checked, r.bouwblok.naam, r.bouwblok.volgnummer)}
                />
                <BouwblokCirkel volgnummer={r.bouwblok.volgnummer} groepKleur={groep?.kleur} />
                <span className="adv-regel-tekst">
                  <strong>{r.bouwblok.naam}</strong>
                  <span className="adv-reden">{groep?.naam}</span>
                </span>
              </label>
              <strong>{formatScore(r.score)}</strong>
              <KlasseChip score={r.score} />
            </div>
          );
        })}
      </div>
      <div className="adv-voet" style={{ marginTop: "var(--sp-4)" }}>
        <span>
          {extra.size} {extra.size === 1 ? "bouwsteen" : "bouwstenen"} toegevoegd
        </span>
        <button type="button" className="btn btn-or btn-compact" onClick={onSluit}>
          Klaar
        </button>
      </div>
    </OverzichtModal>
  );
}
