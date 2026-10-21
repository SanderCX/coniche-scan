/**
 * De podia van de twee films over de radar (`help.md`, Films, Films over de radar): "De radar in je resultaten" en "Het dossier lezen". Een kleine radar
 * met 15 genummerde knooppunten in de categoriekleuren, met voorbeelddata. De basisstaat van elk element is het eindbeeld (stap 3), zodat een film bij
 * verminderde beweging stil op het eindbeeld staat. De animaties staan in `app/styles/help.css`.
 */
import { CATEGORIE_COLORS } from "@/lib/colors";

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

const hoek = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / 15;
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
function MiniRadar({ gedimd, basisVol, metScores = true }: { gedimd?: (nr: number) => boolean; basisVol?: (nr: number) => boolean; metScores?: boolean }) {
  const nrs = Array.from({ length: 15 }, (_, i) => i + 1);
  const veelhoek = nrs.map((n) => punt(radiaal(SCORES[n - 1]), hoek(n - 1)).map((v) => v.toFixed(1)).join(",")).join(" ");
  const stap = (2 * Math.PI) / 15;
  return (
    <svg className="mr-radar" viewBox={`0 0 ${MAAT} ${MAAT}`} role="img" aria-hidden="true">
      {nrs.map((n) => {
        const h = hoek(n - 1);
        const [x1, y1] = punt(STRAAL, h - stap / 2);
        const [x2, y2] = punt(STRAAL, h + stap / 2);
        const d = `M${MIDDEN},${MIDDEN} L${x1.toFixed(1)},${y1.toFixed(1)} A${STRAAL},${STRAAL} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`;
        return (
          <g key={n}>
            <path d={d} fill={KLEUREN[categorieVan(n)]} fillOpacity={0.2} stroke="#fff" strokeWidth={1} />
            <path className={`mr-taart-op mr-taart-op--${n}`} d={d} fill={KLEUREN[categorieVan(n)]} fillOpacity={0.5} />
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
          const [x, y] = punt(radiaal(SCORES[n - 1]), hoek(n - 1));
          return <circle key={n} className={`mr-stip mr-stip--${n}`} cx={x} cy={y} r={5} fill="var(--or)" stroke="#fff" strokeWidth={2} />;
        })}
      {nrs.map((n) => {
        const [x, y] = punt(KNOOP_R, hoek(n - 1));
        const kleur = KLEUREN[categorieVan(n)];
        const tekst = n === 15 ? "var(--ink)" : "#fff";
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
          <span>{komma(SCORES[3])} · Basis op Orde</span>
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

/** "Het dossier lezen": De radar met alleen actieve knooppunten, een klik filtert de lijst en "Alle items tonen" haalt het filter weg (`dossier.md`, scherm 5). */
export function DossierFilmPodium() {
  const actief = new Set([4, 7, 13]);
  return (
    <div className="fd">
      <div className="fd-radar">
        <MiniRadar gedimd={(n) => !actief.has(n)} basisVol={(n) => actief.has(n)} />
      </div>
      <div className="fd-kolom">
        <ul className="fd-lijst">
          {[4, 7, 13].map((n) => (
            <li key={n} className={`fd-rij fd-rij--${n}`}>
              <span className="fd-cirkel" style={{ background: KLEUREN[categorieVan(n)], color: n === 15 ? "var(--ink)" : "#fff" }}>
                {n}
              </span>
              <span className="fd-rij-tekst">
                <strong>{NAMEN[n - 1]}</strong>
                <span>
                  {CATEGORIE_NAMEN[categorieVan(n)]} · {komma(SCORES[n - 1])}
                </span>
              </span>
              <span className="fd-aantal">
                {AANTAL_ITEMS[n]} {AANTAL_ITEMS[n] === 1 ? "item" : "items"}
              </span>
            </li>
          ))}
        </ul>
        <div className="fd-filterbalk" aria-hidden="true">
          <span className="fd-cirkel" style={{ background: KLEUREN[2], color: "#fff" }}>
            7
          </span>
          <span className="fd-rij-tekst">
            <strong>{NAMEN[6]}</strong>
            <span>2 items in dit dossier</span>
          </span>
          <span className="fd-wis">Alle items tonen ×</span>
        </div>
        <ul className="fd-items">
          {ITEMS.map((i) => (
            <li key={i.titel} className={`fd-item fd-item--${i.bouwblok}`}>
              <span className={`fd-soort fd-soort--${i.soort === "Case" ? "case" : "nieuws"}`}>{i.soort}</span>
              <span className="fd-item-titel">{i.titel}</span>
              <span className="fd-cirkel fd-cirkel--klein" style={{ background: KLEUREN[categorieVan(i.bouwblok)], color: "#fff" }}>
                {i.bouwblok}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
