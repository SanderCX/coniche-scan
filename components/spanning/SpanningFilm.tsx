import { spanningsmeter } from "@/data/spanningsmeter-assessment";
import { demoAntwoordenSpanning, demoSpanningGroep } from "@/data/demo-antwoorden-spanning";
import { veldKleur } from "@/lib/colors";
import { fmt1, fmtVerschil, groepProfiel, spanningProfiel, veldKorteNaam } from "@/lib/spanning";
import { RADAR, hoekVoorAs, puntOp, puntVoorScore, straalVoorScore, veelhoekPad, wedgePad } from "@/lib/spanning-radar";

/**
 * De film "Wat krijg ik" van de Spanningsmeter (`visualisatie-spanningsmeter.md`, Landingspagina en film Wat krijg ik, variant
 * Spanningsmeter): Drie stapkaarten naast elkaar op een vlak in `--bg-warm`, elk met een nummerbolletje, een titel, een beeld van 200px en een
 * regel. Het geheel loopt in een lus van 9 seconden met CSS (`@keyframes` in `spanning.css`), zonder script. Bij verminderde beweging staan de beelden
 * stil in hun eindstand. Alle cijfers zijn voorbeelddata: De fictieve deelnemer en groep uit `datamodel.md`, Scoreberekening.
 */
const eigen = spanningProfiel(spanningsmeter, demoAntwoordenSpanning);
const groep = groepProfiel(spanningsmeter, demoSpanningGroep);
const plek = (score: number) => ((score - 1) / 4) * 100;

/** De zes rijen van stap 1: Een nummerbolletje in de veldkleur en een balk met stip die vult tot de score. */
function Rijen() {
  return (
    <div className="sf-rijen">
      {eigen.velden.map((v, i) => (
        <div key={v.veld.id} className="sf-rij">
          <span className="sf-nr" style={{ background: veldKleur(v.volgnummer), color: v.volgnummer === 6 ? "var(--ink)" : "#fff" }}>
            {v.volgnummer}
          </span>
          <span className="sf-spoor">
            <span
              className="sf-vul"
              style={{ ["--p" as string]: `${plek(v.score as number)}%`, ["--k" as string]: veldKleur(v.volgnummer), animationDelay: `${i * 0.35}s` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

/** De radar van stap 2 en 3: Wedges en hulpcirkels, met het eigen profiel (stap 2) of de band, de lijn van de groep en de ring (stap 3). */
function Radar({ stap }: { stap: 2 | 3 }) {
  const n = 6;
  const eigenPunten = eigen.velden.map((v, i) => puntVoorScore(i, n, v.ruw as number));
  const groepPunten = groep.velden.map((v, i) => puntVoorScore(i, n, v.ruw as number));
  const hoogste = groep.velden.map((v, i) => puntVoorScore(i, n, v.hoogste as number));
  const laagste = groep.velden.map((v, i) => puntVoorScore(i, n, v.laagste as number)).reverse();
  const grootsteIndex = groep.grootste ? groep.velden.findIndex((v) => v.veld.id === groep.grootste!.veld.id) : -1;
  const ring = grootsteIndex >= 0 ? groepPunten[grootsteIndex] : null;
  return (
    <svg className="sf-radar" viewBox={`0 0 ${RADAR.grootte} ${RADAR.grootte}`} aria-hidden="true">
      {eigen.velden.map((v, i) => (
        <path key={v.veld.id} d={wedgePad(i, n)} fill={veldKleur(v.volgnummer)} fillOpacity={0.14} stroke="#fff" strokeWidth={1} />
      ))}
      {[2, 3, 4, 5].map((s) => (
        <circle key={s} cx={RADAR.midden} cy={RADAR.midden} r={straalVoorScore(s)} fill="none" stroke="#fff" strokeWidth={2} />
      ))}
      {eigen.velden.map((v, i) => {
        const buiten = puntOp(hoekVoorAs(i, n), RADAR.buiten);
        return <line key={v.veld.id} x1={RADAR.midden} y1={RADAR.midden} x2={buiten.x} y2={buiten.y} stroke="#fff" strokeWidth={1} />;
      })}
      {stap === 2 ? (
        <g className="sf-profiel">
          <path d={veelhoekPad(eigenPunten)} fill="var(--or)" fillOpacity={0.14} stroke="var(--or)" strokeWidth={4} strokeLinejoin="miter" />
          {eigenPunten.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={9} fill="var(--or)" stroke="#fff" strokeWidth={3} />
          ))}
        </g>
      ) : (
        <g className="sf-groep">
          <path d={`${veelhoekPad(hoogste)} ${veelhoekPad(laagste)}`} fill="var(--or)" fillOpacity={0.14} fillRule="evenodd" />
          <path d={veelhoekPad(groepPunten)} fill="none" stroke="var(--or)" strokeWidth={4} strokeLinejoin="miter" />
          {groepPunten.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={9} fill="var(--or)" stroke="#fff" strokeWidth={3} />
          ))}
        </g>
      )}
      {stap === 3 && ring && <circle className="sf-ring" cx={ring.x} cy={ring.y} r={18} fill="none" stroke="var(--dal)" strokeWidth={3} />}
    </svg>
  );
}

function Stap({ nr, titel, regel, children }: { nr: number; titel: string; regel: string; children: React.ReactNode }) {
  return (
    <li className={`sf-stap sf-stap--${nr}`}>
      <span className="sf-stap-nr">{nr}</span>
      <h4>{titel}</h4>
      <div className="sf-beeld">{children}</div>
      <p>{regel}</p>
    </li>
  );
}

export const SPANNING_FILM_STAPPEN = [
  { titel: "Je beoordeelt zes velden.", regel: "Per veld vijf vragen op een schaal van 1 tot 5. Kun je een vraag niet beoordelen, dan kies je 0." },
  { titel: "Je profiel verschijnt.", regel: "Je krijgt een score en een niveau per veld, van Reactief tot Adaptief. Meteen na afronden." },
  { titel: "De spanning wordt zichtbaar.", regel: "Het groepsbeeld toont het gemiddelde, de spreiding en de grootste spanning. Antwoorden blijven anoniem." },
];

/** De drie stapkaarten van de film. De wrapper (kop, pauzeknop en `--film-duur`) staat in `HelpFilm`. */
export function SpanningFilmStappen() {
  const g = groep.grootste;
  const chip = g && g.referentie && g.spanning !== null ? `${veldKorteNaam(g.veld)} ${fmtVerschil(g.spanning)} op ${veldKorteNaam(g.referentie)}` : null;
  return (
    <ol className="sf">
      <Stap nr={1} titel={SPANNING_FILM_STAPPEN[0].titel} regel={SPANNING_FILM_STAPPEN[0].regel}>
        <Rijen />
      </Stap>
      <Stap nr={2} titel={SPANNING_FILM_STAPPEN[1].titel} regel={SPANNING_FILM_STAPPEN[1].regel}>
        <Radar stap={2} />
      </Stap>
      <Stap nr={3} titel={SPANNING_FILM_STAPPEN[2].titel} regel={SPANNING_FILM_STAPPEN[2].regel}>
        <Radar stap={3} />
        {chip && <span className="sf-chip">{chip}</span>}
      </Stap>
    </ol>
  );
}

export const SPANNING_FILM_BESCHRIJVING = `Eerst vult elke balk zich tot de score van het veld, zes velden na elkaar. Daarna groeit het profiel in de radar uit vanuit het midden: ${eigen.velden
  .map((v) => `${veldKorteNaam(v.veld)} ${fmt1(v.score as number)}`)
  .join(", ")}. Als laatste verschijnen de band en het gemiddelde van de groep, met een ring om de grootste spanning${
  g0() ? `: ${g0()}` : ""
}.`;

function g0(): string | null {
  const g = groep.grootste;
  return g && g.referentie && g.spanning !== null ? `${veldKorteNaam(g.veld)} ${fmtVerschil(g.spanning)} op ${veldKorteNaam(g.referentie)}` : null;
}
