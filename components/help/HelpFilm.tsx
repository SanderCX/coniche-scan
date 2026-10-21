"use client";

import { useState } from "react";
import { CATEGORIE_COLORS, DOMEIN_KLEUREN } from "@/lib/colors";
import { FilmVariant, filmVariant, filmWeging } from "@/lib/film";
import { Assessment } from "@/lib/types";
import { DossierFilmPodium, RadarFilmPodium } from "@/components/help/RadarFilms";
import { SPANNING_FILM_BESCHRIJVING, SPANNING_FILM_STAPPEN, SpanningFilmStappen } from "@/components/spanning/SpanningFilm";

/**
 * De films van de Help (`help.md`, Films): Korte, bewegende uitleg gebouwd met CSS-animaties in de kleuren en de balken van de app, geen
 * video. Elke film heeft stapkaarten die ook het tekstalternatief zijn, een pauzeknop, een beschrijving voor schermlezers en een
 * eindbeeld voor wie verminderde beweging aan heeft (`app/styles/help.css`). Alle cijfers zijn voorbeelddata.
 *
 * "Wat krijg ik" heeft een variant per Assessment-type (`lib/film.ts`, `filmVariant`): Categorieën (Klantcontact Volwassenheid en de
 * Zorgscan, die er de weging bij toont), domeinen (de AI-scan) en percentages (de Quickscan). Zonder Assessment, zoals in Help, is het de
 * variant met categorieën.
 */
export type FilmNaam = "wat-krijg-ik" | "meetperiode" | "radar" | "dossier";

const CATEGORIEEN = [
  { naam: "Overkoepelend", kleur: "var(--or)", score: 2.7, laag: 2.0, hoog: 3.4, groep: 2.9 },
  { naam: "Organisatie", kleur: "var(--bl)", score: 3.4, laag: 2.8, hoog: 4.1, groep: 3.5 },
  { naam: "Proces & Tech", kleur: "var(--pu)", score: 3.1, laag: 2.5, hoog: 3.9, groep: 3.2 },
  { naam: "Mens", kleur: "var(--gr)", score: 3.8, laag: 3.0, hoog: 4.4, groep: 3.7 },
  { naam: "Fundament", kleur: "var(--ye)", score: 2.3, laag: 1.9, hoog: 3.0, groep: 2.5 },
];

/** De acht domeinen van de AI-scan met voorbeelddata (`help.md`, Films, AI-scan): De score en het gemiddelde van de groep, in de volgorde 1 tot en met 8. */
const DOMEINEN = [
  { naam: "Strategie en governance", score: 2.8, groep: 3.9 },
  { naam: "Data, integratie en architectuur", score: 2.4, groep: 3.8 },
  { naam: "Use-cases en automatisering", score: 2.0, groep: 3.4 },
  { naam: "Performance, monitoring en kwaliteit", score: 2.0, groep: 3.4 },
  { naam: "Mensen, skills en adoptie", score: 2.4, groep: 3.8 },
  { naam: "Security, risk en compliance", score: 3.6, groep: 4.0 },
  { naam: "Operating model en schaalbaarheid", score: 2.2, groep: 3.7 },
  { naam: "Klant- en kanaalervaring", score: 2.2, groep: 3.4 },
];

/** De vier afdelingen van de Quickscan met voorbeeldpercentages (`help.md`, Films, Quickscan). Het bereik is voorbeelddata van mij: De spec noemt alleen het gemiddelde. */
const AFDELINGEN = [
  { naam: "Poliklinieken", score: 85, laag: 51, hoog: 93, groep: 72 },
  { naam: "Verpleegafdelingen", score: 64, laag: 44, hoog: 90, groep: 70 },
  { naam: "Receptie / Centrale", score: 47, laag: 30, hoog: 81, groep: 58 },
  { naam: "Patiëntenservice", score: 36, laag: 27, hoog: 77, groep: 52 },
];

const komma = (n: number) => n.toFixed(1).replace(".", ",");
/** De plek op een spoor van 1 tot 5, in procenten. */
const plek = (n: number) => ((n - 1) / 4) * 100;
/** De klassekleur van een percentage bij de Quickscan: Groen vanaf 80%, oranje vanaf 50%, anders rood. */
const klassekleur = (p: number) => (p >= 80 ? "var(--stat-green)" : p >= 50 ? "var(--stat-amber)" : "var(--stat-red)");
const domeinHex = (i: number) => CATEGORIE_COLORS[DOMEIN_KLEUREN[i % DOMEIN_KLEUREN.length]].hex;

/** De ring met de score erin: De vulling en de kleur komen mee (`--ring-vul`, `--ring-kleur`). */
function Ring({ getal, vul, kleur, klasse, extra }: { getal: string; vul: number; kleur: string; klasse: string; extra?: string }) {
  return (
    <div className="film-totaal">
      <span className="film-cirkel" style={{ ["--ring-vul" as string]: `${vul}%`, ["--ring-kleur" as string]: kleur }}>
        {getal}
      </span>
      <span className="film-klasse">{klasse}</span>
      {extra && <span className="film-weging">{extra}</span>}
    </div>
  );
}

function Vraag({ variant }: { variant: FilmVariant }) {
  if (variant === "quickscan") {
    return (
      <div className="film-vraag">
        <p className="film-vraag-tekst">Er is een actueel overzicht van alle kanalen waarop patiënten ons bereiken.</p>
        <div className="film-schaal">
          {["Ja", "Nee", "Weet ik niet"].map((t) => (
            <span key={t} className={`film-keuze film-keuze--tekst ${t === "Ja" ? "film-keuze--4" : ""}`}>
              {t}
            </span>
          ))}
        </div>
        <p className="film-vraag-hint">Weet je het niet, kies dan Weet ik niet</p>
      </div>
    );
  }
  return (
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
  );
}

function Rijen({ variant }: { variant: FilmVariant }) {
  if (variant === "domeinen") {
    return (
      <div className="film-rijen film-rijen--domeinen">
        {DOMEINEN.map((d, i) => (
          <div key={d.naam} className="film-rij film-rij--domein">
            <span className="film-nr" style={{ ["--domein-kleur" as string]: domeinHex(i) }} aria-hidden="true">
              {i + 1}
            </span>
            <span className="film-naam">{d.naam}</span>
            <div className="film-spoor">
              <span className="film-grens" style={{ left: `${plek(2.5)}%` }} />
              <span className="film-grens" style={{ left: `${plek(3.5)}%` }} />
              <span className={`film-balk film-balk--${i + 1}`} style={{ width: `${plek(d.score)}%`, background: domeinHex(i) }} />
              <span className="film-stip" style={{ left: `${plek(d.groep)}%`, background: domeinHex(i) }} />
            </div>
            <span className="film-getal">{komma(d.score)}</span>
          </div>
        ))}
      </div>
    );
  }
  if (variant === "quickscan") {
    return (
      <div className="film-rijen film-rijen--quickscan">
        {AFDELINGEN.map((a, i) => (
          <div key={a.naam} className="film-rij film-rij--afdeling">
            <span className="film-naam">{a.naam}</span>
            <div className="film-spoor">
              <span className="film-grens" style={{ left: "50%" }} />
              <span className="film-grens" style={{ left: "80%" }} />
              <span className={`film-balk film-balk--${i + 1}`} style={{ width: `${a.score}%`, background: klassekleur(a.score) }} />
              <span className="film-groeplijn" style={{ left: `${a.laag}%`, width: `${a.hoog - a.laag}%` }} />
              <span className="film-stip" style={{ left: `${a.groep}%`, background: klassekleur(a.score) }} />
            </div>
            <span className="film-getal">{a.score}%</span>
          </div>
        ))}
      </div>
    );
  }
  return (
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
  );
}

function WatKrijgIkPodium({ variant, weging }: { variant: FilmVariant; weging: string | null }) {
  return (
    <>
      <Vraag variant={variant} />
      <div className="film-resultaat">
        {variant === "quickscan" ? (
          <Ring getal="58%" vul={58} kleur="var(--stat-amber)" klasse="Gemiddeld ontwikkeld" />
        ) : variant === "domeinen" ? (
          // 2,5 rondt af op 3 en is dus geel (`--score-3`), gevuld tot (2,5 - 1) / 4.
          <Ring getal="2,5" vul={plek(2.5)} kleur="var(--score-3)" klasse="Uitbouwen" />
        ) : (
          // 3,4 rondt af op 3 en is dus geel (`--score-3`, `help.md`, Films, Ring), gevuld tot (3,4 - 1) / 4.
          <Ring getal="3,4" vul={plek(3.4)} kleur="var(--score-3)" klasse="Uitbouwen" extra={weging ?? undefined} />
        )}
        <Rijen variant={variant} />
        <p className="film-legenda">
          <span className="film-legenda-teken film-legenda-stip" /> Gemiddelde van de groep
          {variant !== "domeinen" && (
            <>
              <span className="film-legenda-teken film-legenda-lijn" /> {variant === "quickscan" ? "Laagste tot hoogste percentage" : "Laagste tot hoogste score"}
            </>
          )}
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

interface FilmGegevens {
  titel: string;
  duur: number;
  beschrijving: string;
  stappen: string[];
  podium: React.ReactElement;
}

const STAP_3 = "Een Lead ziet er het gemiddelde en de spreiding van de groep bij, zodra er genoeg scans zijn.";

/** "Wat krijg ik" voor een variant (`help.md`, Films, Varianten van Wat krijg ik per Assessment-type). */
function watKrijgIk(variant: FilmVariant, weging: { regel: string; zin: string } | null): FilmGegevens {
  const podium = <WatKrijgIkPodium variant={variant} weging={weging?.regel ?? null} />;
  if (variant === "quickscan") {
    return {
      titel: "Wat krijg ik?",
      duur: 16,
      beschrijving:
        "Een voorbeeldvraag wordt beantwoord met Ja. Direct daarna verschijnt het resultaat met het totaalpercentage 58 en een staaf per afdeling, in de kleur van de klasse. Als laatste komen bij elke afdeling een stip met het gemiddelde van de groep en een grijze lijn van het laagste tot het hoogste percentage.",
      stappen: ["Je beantwoordt een vraag met Ja, Nee of Weet ik niet.", "Direct daarna zie je je resultaat: het totaalpercentage en een staaf per afdeling.", STAP_3],
      podium,
    };
  }
  if (variant === "domeinen") {
    return {
      titel: "Wat krijg ik?",
      duur: 16,
      beschrijving:
        "Een voorbeeldvraag wordt beantwoord met een score van 4 op een schaal van 1 tot 5. Direct daarna verschijnt het resultaat met de totaalscore 2,5 en een staaf per domein, in de kleur van het domein. Als laatste komt bij elk domein een stip met het gemiddelde van de groep.",
      stappen: ["Je beantwoordt een vraag met een score van 1 tot 5.", "Direct daarna zie je je resultaat: de totaalscore en een staaf per domein.", STAP_3],
      podium,
    };
  }
  return {
    titel: "Wat krijg ik?",
    duur: 16,
    beschrijving:
      "Een voorbeeldvraag wordt beantwoord met een score van 4 op een schaal van 1 tot 5. Direct daarna verschijnt het resultaat met de totaalscore 3,4 en een staaf per categorie." +
      (weging ? ` ${weging.regel}.` : "") +
      " Als laatste komen bij elke categorie een stip met het gemiddelde van de groep en een grijze lijn van de laagste tot de hoogste score.",
    stappen: [
      "Je beantwoordt een vraag met een score van 1 tot 5.",
      "Direct daarna zie je je resultaat: de totaalscore en een staaf per categorie." + (weging ? ` ${weging.zin}` : ""),
      STAP_3,
    ],
    podium,
  };
}

const MEETPERIODE: FilmGegevens = {
  titel: "De Meetperiode kiezen",
  duur: 12,
  beschrijving:
    "De keuze bij Meetperiode gaat van Meest recente naar Periode. Er komen twee datums bij, en het aantal Organisaties in de pool daalt van 38 naar 32 van de 44.",
  stappen: [
    "Kies bij Meetperiode voor Periode in plaats van Meest recente.",
    "Vul de twee datums in. Per Organisatie telt de laatste Meting in die periode.",
    "De pool wordt kleiner: Organisaties zonder Meting in de periode doen niet mee.",
  ],
  podium: <MeetperiodePodium />,
};

/** "De radar in je resultaten" (`help.md`, Films over de radar): De hover tussen de radar en het staafdiagram per categorie. */
const RADAR: FilmGegevens = {
  titel: "De radar in je resultaten",
  duur: 16,
  beschrijving:
    "Je ziet je score per bouwblok in de radar en per categorie in het staafdiagram. De cursor gaat over bouwblok 4, Leren uit klantcontact: het knooppunt, de taartpunt en de score-stip lichten op, de balk van de categorie Organisatie krijgt een ring en de andere balken dimmen, en een tooltip toont 4, Leren uit klantcontact en 2,3, Basis op Orde. Daarna gaat de cursor over de balk Mens: de bouwblokken 11 tot en met 14 lichten op in de radar en de tooltip boven de balk toont Mens en 3,7, Sterk punt.",
  stappen: [
    "Je ziet je score per bouwblok in de radar en per categorie in het staafdiagram.",
    "Wijs je een bouwblok aan, dan lichten het bolletje, de taartpunt en de balk van zijn categorie op. De tooltip noemt de naam, de score en de klasse.",
    "Wijs je een balk aan, dan lichten de bouwblokken van die categorie op in de radar.",
  ],
  podium: <RadarFilmPodium />,
};

/** "Het dossier lezen" (`help.md`, Films over de radar; `dossier.md`, scherm 5): De radar met alleen actieve knooppunten en het filter op een bouwblok. */
const DOSSIER: FilmGegevens = {
  titel: "Het dossier, de radar voor de Lead",
  duur: 16,
  beschrijving:
    "De radar toont alleen actieve knooppunten voor de bouwblokken 4, 7 en 13, waar items bij staan, met rechts de lijst met bouwblokken. Een klik op bouwblok 7, Systemen en Tools, toont de filterbalk met 2 items in dit dossier en laat alleen de items bij dat bouwblok staan: een case en een nieuwsbericht. Een klik op Alle items tonen haalt het filter weg. De voorbeelditems noemen geen organisatie.",
  stappen: [
    "De radar toont alleen de bouwblokken waar je consultant items bij heeft gezet. Rechts staat de lijst met die bouwblokken.",
    "Kies een bouwblok, in de radar of in de lijst: Alleen de cases en het nieuws bij dat bouwblok blijven staan.",
    "Kies Alle items tonen om het filter weg te halen en alles weer te zien.",
  ],
  podium: <DossierFilmPodium />,
};

/** De AI-variant van "Het dossier lezen" (`Film-Dossier-AI`): Een radar met 8 taartpunten in de domeinkleuren, de tekst spreekt van "domein". */
const DOSSIER_AI: FilmGegevens = {
  titel: "Het dossier, de radar voor de Lead",
  duur: 16,
  beschrijving:
    "De radar toont alleen actieve knooppunten voor de AI-domeinen 2, 4 en 7, waar items bij staan, met rechts de lijst met domeinen. Een klik op domein 7, Operating model en schaalbaarheid, toont de filterbalk met 2 items in dit dossier en laat alleen de items bij dat domein staan: een case en een nieuwsbericht. Een klik op Alle items tonen haalt het filter weg. De voorbeelditems noemen geen organisatie.",
  stappen: [
    "De radar toont alleen de domeinen waar je consultant items bij heeft gezet. Rechts staat de lijst met die domeinen.",
    "Kies een domein, in de radar of in de lijst: Alleen de cases en het nieuws bij dat domein blijven staan.",
    "Kies Alle items tonen om het filter weg te halen en alles weer te zien.",
  ],
  podium: <DossierFilmPodium ai />,
};

/**
 * `assessment`: Bij "Wat krijg ik" op de landingspagina van een Assessment bepaalt het type de variant van de film. In Help is er geen
 * Assessment en staat de variant met categorieën.
 */
export function HelpFilm({
  naam,
  knop,
  opmerking,
  assessment,
}: {
  naam: FilmNaam;
  knop?: React.ReactNode;
  opmerking?: string;
  assessment?: Assessment | null;
}) {
  const variant = naam === "wat-krijg-ik" ? filmVariant(assessment) : "categorieen";
  // De Spanningsmeter heeft een eigen film van drie stapkaarten met elk een beeld (`visualisatie-spanningsmeter.md`), geen podium met stappen eronder.
  const spanning = naam === "wat-krijg-ik" && variant === "spanning";
  const film =
    spanning
      ? {
          titel: "Wat krijg ik?",
          duur: 9,
          beschrijving: SPANNING_FILM_BESCHRIJVING,
          stappen: SPANNING_FILM_STAPPEN.map((st) => `${st.titel} ${st.regel}`),
          podium: <></>,
        }
      : naam === "wat-krijg-ik"
      ? watKrijgIk(variant, variant === "categorieen" ? filmWeging(assessment) : null)
      : naam === "radar"
        ? RADAR
        : naam === "dossier"
          ? assessment && filmVariant(assessment) === "domeinen"
            ? DOSSIER_AI
            : DOSSIER
          : MEETPERIODE;
  const [pauze, setPauze] = useState(false);
  return (
    <section className="help-kaart help-film-kaart" aria-label={`Film: ${film.titel}`}>
      <div className="help-film-kop">
        <div>
          <h3 className="help-kaart-kop">{film.titel}</h3>
          <span className="help-label">Voorbeeld met voorbeelddata</span>
        </div>
        <button type="button" className="btn btn-outline btn-compact help-film-pauze" aria-pressed={pauze} onClick={() => setPauze(!pauze)}>
          {pauze ? "Afspelen" : "Pauzeer"}
        </button>
      </div>
      <div
        className={`help-film help-film--${naam} help-film--${variant}`}
        data-pauze={pauze ? "ja" : undefined}
        style={{ ["--film-duur" as string]: `${film.duur}s` }}
      >
        {spanning ? (
          <>
            <div className="sf-vlak" aria-hidden="true">
              <SpanningFilmStappen />
            </div>
            <p className="sr-only">{film.beschrijving}</p>
          </>
        ) : (
          <>
            <div className="help-film-podium" aria-hidden="true">
              {film.podium}
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
          </>
        )}
      </div>
      {opmerking && <p className="help-film-opmerking">{opmerking}</p>}
      {knop}
    </section>
  );
}
