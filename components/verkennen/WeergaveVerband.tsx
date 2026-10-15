import { PoolLid, Regressie, regressie, sterkteWoord } from "@/lib/verkennen";
import { toon } from "@/components/visualisatie/gedeeld";

export interface VerbandPunt {
  naam: string;
  x: number;
  y: number;
  focus: boolean;
}

const B = 780;
const H = 380;
const M = { l: 52, r: 16, t: 16, b: 42 };

/**
 * Weergave 4, Verband met een kenmerk (`visualisatie-verkennen.md`, 4): Een spreidingsdiagram van 780 bij 380 pixels met een
 * numeriek organisatieveld horizontaal en de overall score of de score van één bouwblok verticaal. De focus is oranje, de rest
 * grijs. Een rechte lijn (kleinste kwadraten) laat de richting zien, naast het diagram staan r, het aantal en een woord bij de
 * sterkte. Bij minder dan drie Organisaties met een waarde staat er "Te weinig data".
 */
export function WeergaveVerband({
  punten,
  xLabel,
  yLabel,
  eenheidX,
}: {
  punten: VerbandPunt[];
  xLabel: string;
  yLabel: string;
  eenheidX?: string;
}) {
  const reg: Regressie | null = regressie(punten.map((p) => ({ x: p.x, y: p.y })));
  if (punten.length < 3) {
    return <p className="admin-notice">Te weinig data: Er zijn {punten.length} Organisaties met een waarde voor {xLabel}, er zijn er minstens 3 nodig.</p>;
  }
  const xs = punten.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const spanX = maxX - minX || 1;
  const px = (x: number) => M.l + ((x - minX) / spanX) * (B - M.l - M.r);
  const py = (y: number) => M.t + (1 - (y - 1) / 4) * (H - M.t - M.b);
  const lijn = reg
    ? { x1: px(minX), y1: py(Math.min(5, Math.max(1, reg.snijpunt + reg.helling * minX))), x2: px(maxX), y2: py(Math.min(5, Math.max(1, reg.snijpunt + reg.helling * maxX))) }
    : null;
  const rest = punten.filter((p) => !p.focus);
  const focus = punten.filter((p) => p.focus);
  return (
    <div className="vis" data-weergave="verkennen-verband" style={{ display: "grid", gridTemplateColumns: "minmax(0, 780px) minmax(12rem, 1fr)", gap: "1.5rem", alignItems: "start" }}>
      <svg viewBox={`0 0 ${B} ${H}`} role="img" aria-label={`Verband tussen ${xLabel} en ${yLabel}`} style={{ width: "100%", height: "auto", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10 }}>
        {[1, 2, 3, 4, 5].map((t) => (
          <g key={t}>
            <line x1={M.l} x2={B - M.r} y1={py(t)} y2={py(t)} stroke="#e8e6e1" />
            <text x={M.l - 8} y={py(t) + 4} textAnchor="end" fontSize="12" fill="#888884">
              {t}
            </text>
          </g>
        ))}
        <line x1={M.l} x2={B - M.r} y1={H - M.b} y2={H - M.b} stroke="#d4d1ca" />
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <text key={f} x={M.l + f * (B - M.l - M.r)} y={H - M.b + 16} textAnchor="middle" fontSize="12" fill="#888884">
            {String(Math.round((minX + f * spanX) * 10) / 10).replace(".", ",")}
          </text>
        ))}
        <text x={(B + M.l - M.r) / 2} y={H - 6} textAnchor="middle" fontSize="12" fill="#4d4d49">
          {xLabel}
          {eenheidX ? ` (${eenheidX})` : ""}
        </text>
        <text x={14} y={H / 2} fontSize="12" fill="#4d4d49" textAnchor="middle" transform={`rotate(-90 14 ${H / 2})`}>
          {yLabel}
        </text>
        {lijn && <line {...lijn} stroke="#4d4d49" strokeWidth="2" strokeDasharray="6 4" />}
        {rest.map((p, i) => (
          <circle key={`r${i}`} cx={px(p.x)} cy={py(p.y)} r="6" fill="rgba(136,136,132,0.55)">
            <title>{`${p.naam}: ${toon(p.y)} bij ${String(p.x).replace(".", ",")}`}</title>
          </circle>
        ))}
        {focus.map((p, i) => (
          <circle key={`f${i}`} cx={px(p.x)} cy={py(p.y)} r="8" fill="#ff671f" stroke="#fff" strokeWidth="2">
            <title>{`${p.naam}: ${toon(p.y)} bij ${String(p.x).replace(".", ",")}`}</title>
          </circle>
        ))}
      </svg>
      <div>
        <div className="vis-tegel">
          <div className="vis-tegel-label">Correlatie r</div>
          <div className="vis-tegel-waarde">{reg ? String(Math.round(reg.r * 100) / 100).replace(".", ",") : "–"}</div>
          <div className="vis-tegel-sub">{reg ? sterkteWoord(reg.r) : "Geen spreiding in de punten"}</div>
        </div>
        <div className="vis-tegel" style={{ marginTop: "0.8rem" }}>
          <div className="vis-tegel-label">Organisaties</div>
          <div className="vis-tegel-waarde">{punten.length}</div>
          <div className="vis-tegel-sub">met een waarde voor {xLabel}</div>
        </div>
        <p className="text-sm text-ink-m" style={{ marginTop: "0.8rem" }}>
          Scores zijn zelfrapportage, en sector en kanaalmix spelen mee. Een verband is geen oorzaak.
        </p>
      </div>
    </div>
  );
}

/** De punten voor het diagram: Alleen Organisaties met een waarde voor het kenmerk en een score. */
export function verbandPunten(
  leden: PoolLid[],
  focusIds: Set<string>,
  x: (l: PoolLid) => number | null,
  y: (l: PoolLid) => number | null
): VerbandPunt[] {
  const uit: VerbandPunt[] = [];
  for (const l of leden) {
    const xv = x(l);
    const yv = y(l);
    if (xv === null || yv === null) continue;
    uit.push({ naam: l.organisatie.naam, x: xv, y: yv, focus: focusIds.has(l.organisatie.id) });
  }
  return uit;
}
