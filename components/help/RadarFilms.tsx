/**
 * De podia van de twee films over de radar (`help.md`, Films, Films over de radar): "De radar in je resultaten" en "Het dossier lezen". Een kleine radar
 * met 15 genummerde knooppunten in de categoriekleuren, met voorbeelddata. De basisstaat van elk element is het eindbeeld (stap 3), zodat een film bij
 * verminderde beweging stil op het eindbeeld staat. De animaties staan in `app/styles/help.css`.
 */
import { CATEGORIE_COLORS, CLASSIFICATIE_INFO, DOMEIN_KLEUREN, tekstOpKleur } from "@/lib/colors";
import { classificatie } from "@/lib/scoring";
import { sorteerVerdeling } from "@/lib/dossier";

const MAAT = 240;
const MIDDEN = MAAT / 2;
const STRAAL = 66;
const KNOOP_R = 92;
const SCORES = [2.8, 2.6, 3.1, 2.3, 3.4, 3.0, 2.9, 3.5, 3.2, 3.6, 3.9, 3.7, 3.6, 3.6, 2.3];
const NAMEN = [
  "Organisatiestrategie", "Klantcontact visie & strategie", "Structuur & Sturing", "Leren uit klantcontact", "Financial control",
  "Positionering klantcontact", "Systemen & Tools", "Workforce Management", "Kennismanagement", "Kanaalmanagement",
  "Performance Management", "Learning & Development", "Employee Engagement", "Leiderschap", "Cultuur",
];
const komma = (n: number) => n.toFixed(1).replace(".", ",");
/** De categorie (0 tot en met 4) van bouwblok `nr`: 1–2 Overkoepelend, 3–6 Organisatie, 7–10 Proces & Tech, 11–14 Mens, 15 Fundament. */
const categorieVan = (nr: number) => (nr <= 2 ? 0 : nr <= 6 ? 1 : nr <= 10 ? 2 : nr <= 14 ? 3 : 4);
const KLEUREN = [CATEGORIE_COLORS.oranje.hex, CATEGORIE_COLORS.blauw.hex, CATEGORIE_COLORS.paars.hex, CATEGORIE_COLORS.groen.hex, CATEGORIE_COLORS.antraciet.hex];
const CATEGORIE_NAMEN = ["Overkoepelend", "Organisatie", "Proces & Tech", "Mens", "Fundament"];

/** De AI-scan: Acht domeinen met de scores en namen van de film "Wat krijg ik" (`help.md`, Films, AI-scan) en de kleur van elk domein. */
const AI_SCORES = [2.8, 2.4, 2.0, 2.0, 2.4, 3.6, 2.2, 2.2];
const AI_NAMEN = [
  "Strategie en governance", "Data, integratie en architectuur", "Use-cases en automatisering", "Performance, monitoring en kwaliteit",
  "Mensen, skills en adoptie", "Security, risk en compliance", "Operating model en schaalbaarheid", "Klant- en kanaalervaring",
];
const AI_KLEUREN = DOMEIN_KLEUREN.map((k) => CATEGORIE_COLORS[k].hex);

interface RadarSoort {
  aantal: number;
  scores: number[];
  kleur: (nr: number) => string;
  /** Tekstkleur op de kleur van het knooppunt: Wit, behalve op het gele Fundament en het gele domein 5. */
  tekst: (nr: number) => string;
}
const VOLWASSENHEID: RadarSoort = { aantal: 15, scores: SCORES, kleur: (n) => KLEUREN[categorieVan(n)], tekst: (n) => (n === 15 ? "var(--ink)" : "#fff") };
const AI: RadarSoort = { aantal: 8, scores: AI_SCORES, kleur: (n) => AI_KLEUREN[n - 1], tekst: (n) => (tekstOpKleur(AI_KLEUREN[n - 1]) === "#fff" ? "#fff" : "var(--ink)") };

const hoek = (i: number, aantal = 15) => -Math.PI / 2 + (i * 2 * Math.PI) / aantal;
const punt = (r: number, h: number): [number, number] => [MIDDEN + r * Math.cos(h), MIDDEN + r * Math.sin(h)];
const radiaal = (score: number) => ((score - 1) / 4) * STRAAL;
/** De categoriescore van een categorie: Het gemiddelde van haar bouwblokken (voorbeelddata). */
function categorieScore(c: number): number {
  const nrs = Array.from({ length: 15 }, (_, i) => i + 1).filter((n) => categorieVan(n) === c);
  return nrs.reduce((som, n) => som + SCORES[n - 1], 0) / nrs.length;
}

/**
 * De radar met knooppunten. `vol(nr)`: Het knooppunt is altijd gevuld (de filtermodus van het Dossier). `lagen` geeft de overlays per bouwblok een klasse
 * waarop de animatie zich richt: Een gevulde cirkel (`mr-vol`), een taartpunt van 50% (`mr-taart-op`), de score-stip (`mr-stip`) en een tweede ring (`mr-ring`).
 */
function MiniRadar({ gedimd, basisVol, metScores = true, soort = VOLWASSENHEID }: { gedimd?: (nr: number) => boolean; basisVol?: (nr: number) => boolean; metScores?: boolean; soort?: RadarSoort }) {
  const nrs = Array.from({ length: soort.aantal }, (_, i) => i + 1);
  const veelhoek = nrs.map((n) => punt(radiaal(soort.scores[n - 1]), hoek(n - 1, soort.aantal)).map((v) => v.toFixed(1)).join(",")).join(" ");
  const stap = (2 * Math.PI) / soort.aantal;
  return (
    <svg className="mr-radar" viewBox={`0 0 ${MAAT} ${MAAT}`} role="img" aria-hidden="true">
      {nrs.map((n) => {
        const h = hoek(n - 1, soort.aantal);
        const [x1, y1] = punt(STRAAL, h - stap / 2);
        const [x2, y2] = punt(STRAAL, h + stap / 2);
        const d = `M${MIDDEN},${MIDDEN} L${x1.toFixed(1)},${y1.toFixed(1)} A${STRAAL},${STRAAL} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`;
        return (
          <g key={n}>
            <path d={d} fill={soort.kleur(n)} fillOpacity={0.2} stroke="#fff" strokeWidth={1} />
            <path className={`mr-taart-op mr-taart-op--${n}`} d={d} fill={soort.kleur(n)} fillOpacity={0.5} />
          </g>
        );
      })}
      {[2, 3, 4, 5].map((s) => (
        <circle key={s} cx={MIDDEN} cy={MIDDEN} r={radiaal(s)} fill="none" stroke="var(--border)" strokeWidth={1} />
      ))}
      {[2.5, 3.5].map((s) => (
        <circle key={s} cx={MIDDEN} cy={MIDDEN} r={radiaal(s)} fill="none" stroke="#9a978f" strokeWidth={1} strokeDasharray="3 3" />
      ))}
      {metScores && <polygon points={veelhoek} fill="var(--or)" fillOpacity={0.18} stroke="var(--or)" strokeWidth={2} strokeLinejoin="round" />}
      {metScores &&
        nrs.map((n) => {
          const [x, y] = punt(radiaal(soort.scores[n - 1]), hoek(n - 1, soort.aantal));
          return <circle key={n} className={`mr-stip mr-stip--${n}`} cx={x} cy={y} r={5} fill="var(--or)" stroke="#fff" strokeWidth={2} />;
        })}
      {nrs.map((n) => {
        const [x, y] = punt(KNOOP_R, hoek(n - 1, soort.aantal));
        const kleur = soort.kleur(n);
        const tekst = soort.tekst(n);
        const vol = basisVol?.(n);
        return (
          <g key={n} className={`mr-knoop mr-knoop--${n}`} opacity={gedimd?.(n) ? 0.4 : 1}>
            <circle className={`mr-ring mr-ring--${n}`} cx={x} cy={y} r={15} fill="none" stroke={kleur} strokeWidth={2} />
            <circle cx={x} cy={y} r={11} fill={vol ? kleur : "#fff"} stroke={kleur} strokeWidth={2} />
            <circle className={`mr-vol mr-vol--${n}`} cx={x} cy={y} r={11} fill={kleur} stroke={kleur} strokeWidth={2} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={vol ? tekst : "var(--ink)"}>
              {n}
            </text>
            <text className={`mr-vol mr-vol--${n}`} x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={tekst}>
              {n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** "De radar in je resultaten": De radar en het staafdiagram per categorie lichten elkaar op (`stylesheet.md`, Hover tussen radar en staafdiagram). */
export function RadarFilmPodium() {
  return (
    <div className="fr">
      <div className="fr-radar">
        <MiniRadar />
        <span className="fr-tip fr-tip--a" role="presentation">
          <strong>4 · {NAMEN[3]}</strong>
          <span>{komma(SCORES[3])} · Basis op orde</span>
        </span>
      </div>
      <div className="fr-staven">
        <div className="fr-staven-plot">
          {CATEGORIE_NAMEN.map((naam, c) => (
            <div key={naam} className={`fr-staaf-kolom fr-staaf-kolom--${c}`}>
              <span className="fr-staaf-ring" style={{ height: `calc(${((categorieScore(c) - 1) / 4) * 100}% + 6px)` }} />
              <span className="fr-staaf" style={{ height: `${((categorieScore(c) - 1) / 4) * 100}%`, background: KLEUREN[c] }} />
              {c === 3 && (
                <span className="fr-tip fr-tip--b" role="presentation">
                  <strong>Mens</strong>
                  <span>{komma(categorieScore(3))} · Sterk punt</span>
                </span>
              )}
            </div>
          ))}
          <span className="fr-grens" style={{ bottom: `${((2.5 - 1) / 4) * 100}%` }} />
          <span className="fr-grens" style={{ bottom: `${((3.5 - 1) / 4) * 100}%` }} />
        </div>
        <div className="fr-staven-namen">
          {CATEGORIE_NAMEN.map((naam) => (
            <span key={naam}>{naam}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const ITEMS = [
  { soort: "Case", titel: "Van losse kanalen naar één klantreis", bouwblok: 4 },
  { soort: "Nieuws", titel: "Gemeente opent nieuw klantcontactcentrum", bouwblok: 7 },
  { soort: "Case", titel: "Eén kennisbank voor alle kanalen", bouwblok: 7 },
  { soort: "Nieuws", titel: "Nieuwe wet vraagt om beter vastgelegde dossiers", bouwblok: 13 },
];
const AANTAL_ITEMS: Record<number, number> = { 4: 1, 7: 2, 13: 1 };

/**
 * De AI-variant van de film (`Film-Dossier-AI`, `ai-domeinenmodel-visual.md`, Film en Dossier, aangepast op 21 oktober 2026): Dezelfde opbouw met de
 * domeinen 3, 5 en 6 actief (de scores 2,0, 2,4 en 3,6) en een klik op domein 3.
 */
const ITEMS_AI = [
  { soort: "Case", titel: "Mensen meenemen in AI-adoptie", bouwblok: 5 },
  { soort: "Nieuws", titel: "Gemeente zet AI in voor klantvragen", bouwblok: 3 },
  { soort: "Case", titel: "Een use-case van pilot naar productie", bouwblok: 3 },
  { soort: "Nieuws", titel: "Nieuwe regels voor AI en klantdata", bouwblok: 6 },
];
const AANTAL_ITEMS_AI: Record<number, number> = { 3: 2, 5: 1, 6: 1 };

/** De voorbeeldscores van de film Het dossier lezen bij de Klantcontact Volwassenheidsscan: 7 (2,2), 4 (2,3) en 13 (4,1) (`help.md`, Films). */
const DOSSIER_SCORES = SCORES.map((s, i) => (i === 6 ? 2.2 : i === 12 ? 4.1 : s));
const VOLWASSENHEID_DOSSIER: RadarSoort = { ...VOLWASSENHEID, scores: DOSSIER_SCORES };

/**
 * "Het dossier lezen": De radar met alleen actieve knooppunten, een klik filtert de lijst en "Alle items tonen" haalt het filter weg (`dossier.md`, scherm
 * 5). Rechts van de radar staat de verdeling in de opmaak van de Dossierpagina (`dossier.md`, Verdeling rechts van de radar): In een warme kaart met
 * rand de kop en de zin, een witte kaart per bouwblok op laagste score met de cirkel in de categoriekleur, een slanke balk met stip, de score en de klasse, en
 * de legenda onder de rijen zonder aswaarden. Met `ai` de variant met de AI-domeinen.
 */
export function DossierFilmPodium({ ai = false }: { ai?: boolean }) {
  const soort = ai ? AI : VOLWASSENHEID_DOSSIER;
  const items = ai ? ITEMS_AI : ITEMS;
  const aantal = ai ? AANTAL_ITEMS_AI : AANTAL_ITEMS;
  const namen = ai ? AI_NAMEN : NAMEN;
  const actiefNrs = ai ? [3, 5, 6] : [4, 7, 13];
  const gekozen = ai ? 3 : 7;
  const actief = new Set(actiefNrs);
  const eenheid = ai ? "domein" : "bouwsteen";
  const rijen = sorteerVerdeling(actiefNrs.map((n) => ({ n, score: soort.scores[n - 1], volgnummer: n })));
  return (
    <div className={`fd ${ai ? "fd--ai" : ""}`}>
      <div className="fd-kaart">
        <div className="fd-radar">
          <MiniRadar soort={soort} gedimd={(n) => !actief.has(n)} basisVol={(n) => actief.has(n)} />
        </div>
        <div className="fd-verdeling">
          <h4 className="fd-kop">Waar dit dossier over gaat</h4>
          <p className="fd-zin">
            Kies een {eenheid} om de cases, het nieuws, de events en de blogs daarover te zien. Onder de radar staan de {ai ? "domeinen" : "bouwstenen"} met de
            laagste score bovenaan.
          </p>
          <ul className="fd-lijst">
            {rijen.map(({ n, score }) => {
              const klasse = classificatie(score);
              return (
                <li key={n} className={`fd-rij fd-rij--${n}`}>
                  <span className="fd-cirkel fd-cirkel--groot" style={{ background: soort.kleur(n), color: soort.tekst(n) }}>
                    {n}
                  </span>
                  <span className="fd-rij-tekst">
                    <strong>{namen[n - 1]}</strong>
                    <span>
                      {aantal[n]} {aantal[n] === 1 ? "item" : "items"}
                    </span>
                  </span>
                  <span className="fd-balk" aria-hidden="true">
                    <i style={{ left: `${(((score - 1) / 4) * 100).toFixed(1)}%` }} />
                  </span>
                  <span className="fd-score">
                    <strong>{komma(score)}</strong>
                    <span className={`fd-klasse fd-klasse--${klasse}`}>{CLASSIFICATIE_INFO[klasse].label}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <ul className="fd-legenda" aria-hidden="true">
            {(["rood", "oranje", "groen"] as const).map((k) => (
              <li key={k}>
                <i className={`fd-legenda-stip fd-legenda-stip--${k}`} />
                <strong>{CLASSIFICATIE_INFO[k].label}</strong>
                <span>{k === "rood" ? "onder 2,5" : k === "oranje" ? "2,5 tot 3,5" : "vanaf 3,5"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="fd-kolom">
        <div className="fd-filterbalk" aria-hidden="true">
          <span className="fd-cirkel" style={{ background: soort.kleur(gekozen), color: soort.tekst(gekozen) }}>
            {gekozen}
          </span>
          <span className="fd-rij-tekst">
            <strong>{namen[gekozen - 1]}</strong>
            <span>{aantal[gekozen]} items in dit dossier</span>
          </span>
          <span className="fd-wis">Alle items tonen ×</span>
        </div>
        <ul className="fd-items">
          {items.map((i) => (
            <li key={i.titel} className={`fd-item fd-item--${i.bouwblok}`}>
              <span className={`fd-soort fd-soort--${i.soort === "Case" ? "case" : "nieuws"}`}>{i.soort}</span>
              <span className="fd-item-titel">{i.titel}</span>
              <span className="fd-cirkel fd-cirkel--klein" style={{ background: soort.kleur(i.bouwblok), color: soort.tekst(i.bouwblok) }}>
                {i.bouwblok}
              </span>
            </li>
          ))}
        </ul>
        {/* De bron van de scores (`dossier.md`, Bron van de scores): De Lead ziet dat de cijfers uit een meting komen. Voorbeelddata. */}
        <p className="fd-bron">
          Scores uit de meting {ai ? "AI-Volwassenheid in Klantcontact" : "Klantcontact Volwassenheid"} van oktober 2026. <span>Bekijk de meting</span>
        </p>
      </div>
    </div>
  );
}
