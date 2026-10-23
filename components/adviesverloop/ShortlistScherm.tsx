"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { ScoreRing } from "@/components/ScoreRing";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { BouwblokCirkel } from "@/components/dossier/BouwblokChip";
import { zetRol, zetShortlist } from "@/lib/db";
import { opLaagsteScore, verplaatsInLijst, verschilTekst } from "@/lib/advies";
import { CLASSIFICATIE_INFO } from "@/lib/colors";
import { formatScore } from "@/lib/format";
import { openMijnAccount } from "@/lib/mijn-account-open";
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

/** De naam en het nummer van elke bouwsteen van de peilmeting, voor het audit-log. */
const namenVan = (data: AdviesData) => Object.fromEntries(data.resultaten.map((r) => [r.bouwblok.id, { nummer: r.bouwblok.volgnummer, naam: r.bouwblok.naam }]));

/**
 * Scherm Adviesverloop (`adviesverloop.md`, Scherm Adviesverloop): De regel "Jouw rol bij deze klant" en de kaart Shortlist voor het gesprek, met per bouwsteen de
 * volgorde met pijltjes, de ring, de naam, het verschil met de benchmark en de spreiding, de klasse en een knop naar de resultaten. De Consultant kiest zelf welke
 * bouwstenen erop staan en in welke volgorde. Onderaan "Uitwerken".
 */
export function ShortlistScherm({ data, kanWijzigen, onUitwerken }: { data: AdviesData; kanWijzigen: boolean; onUitwerken: () => void }) {
  const { shortlist, adviesverloop, peil, organisatie } = data;
  const { shortlistAantal } = useInstellingen();
  const [kiezen, setKiezen] = useState(false);
  const eigen = adviesverloop.shortlistBouwsteenIds !== null;
  const ids = shortlist.map((r) => r.bouwblok.id);
  const aantalTekst = `${shortlist.length} ${shortlist.length === 1 ? "bouwsteen" : "bouwstenen"}`;

  const rolRegel = (
    <div className="adv-rolregel" aria-label="Jouw rol bij deze klant">
      <strong>Jouw rol bij deze klant</strong>
      <div className="pil-rij" role="group" aria-label="Rol">
        {data.profiel.rollen.map((r) => (
          <button
            key={r.id}
            type="button"
            className="pil"
            aria-pressed={r.id === data.rol.id}
            disabled={!kanWijzigen}
            onClick={() => zetRol(organisatie.id, adviesverloop.id, r.id)}
          >
            {r.naam}
          </button>
        ))}
      </div>
      <button type="button" className="tekstknop" style={{ marginLeft: "auto" }} onClick={() => openMijnAccount("adviescontext")}>
        Aanpassen in Mijn account
      </button>
    </div>
  );

  if (!peil || !data.assessment) {
    return (
      <>
        {rolRegel}
        <section className="beheer-kaart" aria-label="Shortlist voor het gesprek">
          <div className="beheer-kaart-kop">
            <h2>Shortlist voor het gesprek</h2>
          </div>
          <p className="text-sm text-ink-s">
            {peil ? "Dit adviesverloop werkt op scans met een schaal van 1 tot 5. De peilmeting heeft een ander antwoordtype." : "Er is nog geen gekoppelde Meting met afgeronde scans. Kies of koppel een Meting in het blok Scan hierboven."}
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      {rolRegel}
      <section className="beheer-kaart" aria-labelledby="adv-shortlist-kop">
        <div className="beheer-kaart-kop">
          <div>
            <div className="titel-rij">
              <h2 id="adv-shortlist-kop">Shortlist voor het gesprek</h2>
              <InfoIcoon sleutel="info.adviesverloopShortlist" />
            </div>
            <p className="adv-sub">{eigen ? `${aantalTekst}. Jij bepaalt wat erop staat en wat eerst komt.` : `${aantalTekst}: ${laagsteTekst(shortlistAantal)}.`}</p>
          </div>
          <button type="button" className="btn btn-outline btn-compact" disabled={!kanWijzigen} onClick={() => setKiezen(true)}>
            Bouwstenen kiezen
          </button>
        </div>
        {shortlist.length === 0 ? (
          <p className="text-sm text-ink-s">Er staat niets op de shortlist. Kies minstens één bouwsteen om te kunnen uitwerken.</p>
        ) : (
          <div>
            {shortlist.map((r, i) => {
              const klasse = classificatie(r.score);
              const groep = data.groepen.get(r.bouwblok.id);
              const bm = data.benchmark?.perBouwsteen.get(r.bouwblok.id);
              const sp = data.spreiding.get(r.bouwblok.id);
              const sinds = data.verschil?.get(r.bouwblok.id);
              const feiten = [
                bm ? `Benchmark ${verschilTekst(bm.verschil)}` : null,
                sp ? `Spreiding ${sp.label.toLowerCase()}` : null,
                sinds !== undefined ? `${verschilTekst(sinds)} sinds de eerste Meting` : null,
                eigen && !r.standaard ? "Door jou toegevoegd" : null,
              ].filter(Boolean);
              const verplaats = (richting: -1 | 1) => zetShortlist(organisatie.id, adviesverloop.id, verplaatsInLijst(ids, r.bouwblok.id, richting), ids, namenVan(data));
              return (
                <div key={r.bouwblok.id} className="adv-rij">
                  <div className="adv-volgorde">
                    <span className="adv-volgnummer">{i + 1}</span>
                    <span className="adv-pijltjes">
                      <button type="button" aria-label={`${r.bouwblok.naam} omhoog`} disabled={!kanWijzigen || i === 0} onClick={() => verplaats(-1)}>
                        ↑
                      </button>
                      <button type="button" aria-label={`${r.bouwblok.naam} omlaag`} disabled={!kanWijzigen || i === shortlist.length - 1} onClick={() => verplaats(1)}>
                        ↓
                      </button>
                    </span>
                  </div>
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
                </div>
              );
            })}
          </div>
        )}
        <div className="adv-voet">
          <span>
            {eigen
              ? "Eerst bovenaan. De uitwerking en de prompts gaan over deze bouwstenen."
              : `${laagsteTekst(shortlistAantal)} staan er standaard in. Met de pijltjes bepaal je wat eerst komt.`}
            {eigen && kanWijzigen && (
              <>
                {" "}
                <button type="button" className="tekstknop" onClick={() => zetShortlist(organisatie.id, adviesverloop.id, null, ids, namenVan(data))}>
                  Standaard herstellen
                </button>
              </>
            )}
          </span>
          <button type="button" className="btn btn-or" disabled={shortlist.length === 0} onClick={onUitwerken}>
            Uitwerken
          </button>
        </div>
        {kiezen && <KiezenModal data={data} onSluit={() => setKiezen(false)} />}
      </section>
    </>
  );
}

/**
 * De modal Bouwstenen kiezen (Overzichtsmodal): Alle bouwstenen van laag naar hoog score, met de huidige keuze aangevinkt. Een aangevinkte bouwsteen komt achteraan op
 * de lijst, een uitgevinkte verdwijnt eruit. De volgorde bepaalt de Consultant op het scherm met de pijltjes.
 */
export function KiezenModal({ data, onSluit }: { data: AdviesData; onSluit: () => void }) {
  const ids = data.shortlist.map((r) => r.bouwblok.id);
  const alle = opLaagsteScore(data.resultaten);
  return (
    <OverzichtModal label="Bouwstenen kiezen" onSluit={onSluit} className="modal-box--instelling">
      <div className="overzicht-kop">
        <h2>Bouwstenen kiezen</h2>
        <p>Vink aan wat je wilt bespreken en haal weg wat niet past.</p>
      </div>
      <div>
        {alle.map((r) => {
          const groep = data.groepen.get(r.bouwblok.id);
          return (
            <div key={r.bouwblok.id} className="adv-modalrij">
              <label>
                <input
                  type="checkbox"
                  checked={ids.includes(r.bouwblok.id)}
                  onChange={(e) =>
                    zetShortlist(
                      data.organisatie.id,
                      data.adviesverloop.id,
                      e.target.checked ? [...ids, r.bouwblok.id] : ids.filter((id) => id !== r.bouwblok.id),
                      ids,
                      namenVan(data)
                    )
                  }
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
          {ids.length} {ids.length === 1 ? "bouwsteen" : "bouwstenen"} gekozen.
        </span>
        <button type="button" className="btn btn-or btn-compact" onClick={onSluit}>
          Klaar
        </button>
      </div>
    </OverzichtModal>
  );
}
