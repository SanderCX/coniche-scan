"use client";

import { useState } from "react";

/**
 * De films van de Help (`help.md`, Films): Korte, bewegende uitleg gebouwd met CSS-animaties in de kleuren en de balken van de app, geen
 * video. Elke film heeft stapkaarten die ook het tekstalternatief zijn, een pauzeknop, een beschrijving voor schermlezers en een
 * eindbeeld voor wie verminderde beweging aan heeft (`app/styles/help.css`). Alle cijfers zijn voorbeelddata.
 */
export type FilmNaam = "wat-krijg-ik" | "meetperiode";

const CATEGORIEEN = [
  { naam: "Overkoepelend", kleur: "var(--or)", score: 2.7, laag: 2.0, hoog: 3.4, groep: 2.9 },
  { naam: "Organisatie", kleur: "var(--bl)", score: 3.4, laag: 2.8, hoog: 4.1, groep: 3.5 },
  { naam: "Proces & Tech", kleur: "var(--pu)", score: 3.1, laag: 2.5, hoog: 3.9, groep: 3.2 },
  { naam: "Mens", kleur: "var(--gr)", score: 3.8, laag: 3.0, hoog: 4.4, groep: 3.7 },
  { naam: "Fundament", kleur: "var(--ye)", score: 2.3, laag: 1.9, hoog: 3.0, groep: 2.5 },
];

const komma = (n: number) => n.toFixed(1).replace(".", ",");
/** De plek op een spoor van 1 tot 5, in procenten. */
const plek = (n: number) => ((n - 1) / 4) * 100;

function WatKrijgIkPodium() {
  return (
    <>
      <div className="film-vraag">
        <p className="film-vraag-tekst">Er is een actueel overzicht van alle kanalen waarop klanten ons bereiken.</p>
        <div className="film-schaal">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={`film-keuze film-keuze--${n}`}>
              {n}
            </span>
          ))}
        </div>
        <p className="film-vraag-hint">1 is niet aanwezig, 5 is geoptimaliseerd en continu verbeterd</p>
      </div>
      <div className="film-resultaat">
        <div className="film-totaal">
          <span className="film-cirkel">3,4</span>
          <span className="film-klasse">Uitbouwen</span>
        </div>
        <div className="film-rijen">
          {CATEGORIEEN.map((c, i) => (
            <div key={c.naam} className="film-rij">
              <span className="film-naam">{c.naam}</span>
              <div className="film-spoor">
                <span className={`film-balk film-balk--${i + 1}`} style={{ width: `${plek(c.score)}%`, background: c.kleur }} />
                <span className="film-groeplijn" style={{ left: `${plek(c.laag)}%`, width: `${plek(c.hoog) - plek(c.laag)}%` }} />
                <span className="film-stip" style={{ left: `${plek(c.groep)}%`, background: c.kleur }} />
              </div>
              <span className="film-getal">{komma(c.score)}</span>
            </div>
          ))}
        </div>
        <p className="film-legenda">
          <span className="film-legenda-teken film-legenda-stip" /> Gemiddelde van de groep
          <span className="film-legenda-teken film-legenda-lijn" /> Laagste tot hoogste score
        </p>
      </div>
    </>
  );
}

function MeetperiodePodium() {
  return (
    <div className="film-mp">
      <div className="film-mp-rij">
        <span className="film-mp-label">Meetperiode</span>
        <div className="film-pillen">
          <span className="film-pil film-pil--meest">Meest recente</span>
          <span className="film-pil film-pil--periode">Periode</span>
        </div>
      </div>
      <div className="film-mp-datums">
        <span className="film-datum">12-01-2026</span>
        <span className="film-mp-tot">tot en met</span>
        <span className="film-datum">10-02-2026</span>
      </div>
      <p className="film-mp-regel">Per organisatie telt de laatste Meting tussen 12-01-2026 en 10-02-2026. 6 organisaties hebben geen Meting in deze periode en doen niet mee.</p>
      <div className="film-mp-pool">
        <span className="film-tel">
          <span className="film-tel-oud">38</span>
          <span className="film-tel-nieuw">32</span>
        </span>
        <span>&nbsp;van 44 Organisaties in de pool</span>
      </div>
      <div className="film-mp-balk">
        <span className="film-mp-vul" />
      </div>
    </div>
  );
}

const FILMS: Record<FilmNaam, { titel: string; duur: number; beschrijving: string; stappen: string[]; Podium: () => React.ReactElement }> = {
  "wat-krijg-ik": {
    titel: "Wat krijg ik?",
    duur: 16,
    beschrijving:
      "Een voorbeeldvraag wordt beantwoord met een score van 4 op een schaal van 1 tot 5. Direct daarna verschijnt het resultaat met de totaalscore 3,4 en een staaf per categorie. Als laatste komen bij elke categorie een stip met het gemiddelde van de groep en een grijze lijn van de laagste tot de hoogste score.",
    stappen: [
      "Je beantwoordt een vraag met een score van 1 tot 5.",
      "Direct daarna zie je je resultaat: de totaalscore en een staaf per categorie.",
      "Een Lead ziet er het gemiddelde en de spreiding van de groep bij, zodra er genoeg scans zijn.",
    ],
    Podium: WatKrijgIkPodium,
  },
  meetperiode: {
    titel: "De Meetperiode kiezen",
    duur: 12,
    beschrijving:
      "De keuze bij Meetperiode gaat van Meest recente naar Periode. Er komen twee datums bij, en het aantal Organisaties in de pool daalt van 38 naar 32 van de 44.",
    stappen: [
      "Kies bij Meetperiode voor Periode in plaats van Meest recente.",
      "Vul de twee datums in. Per Organisatie telt de laatste Meting in die periode.",
      "De pool wordt kleiner: Organisaties zonder Meting in de periode doen niet mee.",
    ],
    Podium: MeetperiodePodium,
  },
};

export function HelpFilm({ naam, knop, opmerking }: { naam: FilmNaam; knop?: React.ReactNode; opmerking?: string }) {
  const film = FILMS[naam];
  const [pauze, setPauze] = useState(false);
  const Podium = film.Podium;
  return (
    <section className="help-kaart help-film-kaart" aria-label={`Film: ${film.titel}`}>
      <div className="help-film-kop">
        <div>
          <h3 className="help-kaart-kop">{film.titel}</h3>
          <span className="help-label">Voorbeeld met voorbeelddata · {film.duur} seconden</span>
        </div>
        <button type="button" className="btn btn-outline btn-compact help-film-pauze" aria-pressed={pauze} onClick={() => setPauze(!pauze)}>
          {pauze ? "Afspelen" : "Pauzeer"}
        </button>
      </div>
      <div className={`help-film help-film--${naam}`} data-pauze={pauze ? "ja" : undefined} style={{ ["--film-duur" as string]: `${film.duur}s` }}>
        <div className="help-film-podium" aria-hidden="true">
          <Podium />
        </div>
        <p className="sr-only">{film.beschrijving}</p>
        <ol className="help-film-stappen">
          {film.stappen.map((tekst, i) => (
            <li key={i} className={`help-film-stap help-film-stap--${i + 1}`}>
              <span className="help-film-nr">{i + 1}</span>
              <span className="help-film-tekst">{tekst}</span>
            </li>
          ))}
        </ol>
      </div>
      {opmerking && <p className="help-film-opmerking">{opmerking}</p>}
      {knop}
    </section>
  );
}
