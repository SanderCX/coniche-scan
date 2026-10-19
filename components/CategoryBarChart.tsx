"use client";

import { Bar, BarChart, Cell, LabelList, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GroepResultaat } from "@/lib/scoring";
import { CATEGORIE_COLORS, CLASSIFICATIE_INFO, scoreKleur } from "@/lib/colors";
import { classificatie } from "@/lib/scoring";
import { formatGewicht } from "@/lib/format";

/**
 * `horizontaal` (CLAUDE.md sectie 3, scherm 6): Bij een Assessment zonder
 * categorie-laag (bijv. de AI-volwassenheidsscan) vervalt het verticale
 * staafdiagram per categorie voor een horizontale balk per groep — `resultaten`
 * komt dan al gesorteerd van hoog naar laag binnen (`Assessment.
 * scoresPerGroepGesorteerd`, `lib/scoring.ts`).
 *
 * `vergelijking` (`benchmark.md`, View per organisatie): Het gemiddelde van de rest van de groep, als neutrale balk
 * naast de score van de organisatie. Gelijk aan `resultaten` qua volgorde.
 */
export function CategoryBarChart({
  resultaten,
  horizontaal = false,
  vergelijking,
  naam = "Score",
  vergelijkingNaam = "Vergelijking",
}: {
  resultaten: GroepResultaat[];
  horizontaal?: boolean;
  vergelijking?: GroepResultaat[];
  naam?: string;
  vergelijkingNaam?: string;
}) {
  const data = resultaten.map((r, i) => ({
    naam: r.gewicht && r.gewicht !== 1 ? `${r.groepNaam} (${formatGewicht(r.gewicht)}×)` : r.groepNaam,
    score: r.score ?? 0,
    // Per categorie de categoriekleur (`stylesheet.md`, Categoriekleuren). Per bouwblok (horizontaal) blijft de scorekleur.
    kleur:
      r.score === null
        ? "#e8e6e1"
        : !horizontaal && r.kleur && CATEGORIE_COLORS[r.kleur]
          ? CATEGORIE_COLORS[r.kleur].hex
          : scoreKleur(r.score),
    vergelijking: vergelijking?.[i]?.score ?? 0,
  }));
  const hoogtePerRij = vergelijking ? 64 : 44;

  if (horizontaal) {
    return (
      <div className="w-full" style={{ height: `${data.length * hoogtePerRij + 16}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
          >
            <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: "#4d4d49" }} />
            <YAxis
              type="category"
              dataKey="naam"
              width={140}
              tick={{ fontSize: 12, fill: "#4d4d49" }}
            />
            <Tooltip formatter={(value) => Number(value).toFixed(1).replace(".", ",")} />
            {vergelijking && <Legend wrapperStyle={{ fontSize: 12 }} />}
            <Bar dataKey="score" name={naam} radius={[0, 6, 6, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.kleur} />
              ))}
            </Bar>
            {vergelijking && <Bar dataKey="vergelijking" name={vergelijkingNaam} fill="#b8b5ae" radius={[0, 6, 6, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Vorm van het staafdiagram per categorie (`stylesheet.md`, Categoriekleuren): as van 1 tot 5, de balk begint op 1, de klassegrenzen
  // 2,5 en 3,5 als grijze stippellijn met de klassenamen aan de rechterkant, het getal in 14px (gewicht 500) boven elke balk en alle
  // categorienamen onder hun balk op één regel. Elke categorie krijgt minstens 104px, dus de grafiek is minstens 520px breed.
  const lijnProps = { stroke: "#9a978f", strokeDasharray: "4 4", strokeWidth: 1 } as const;
  const klasseLabel = (value: string) => ({ value, position: "right" as const, fill: "var(--ink-s)", fontSize: 12 });
  const minBreedte = Math.max(520, data.length * 104 + 80);
  return (
    <div className="w-full" style={{ overflowX: "auto" }}>
      <div className="h-72 w-full" style={{ minWidth: minBreedte }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 96, left: -16, bottom: 8 }}>
            <XAxis dataKey="naam" interval={0} tick={<CategorieTick />} height={32} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: "#4d4d49" }} allowDataOverflow />
            {vergelijking ? (
              <Tooltip formatter={(value) => Number(value).toFixed(1).replace(".", ",")} />
            ) : (
              // De tooltip toont de naam en de klasse, niet nog eens het getal dat al boven de balk staat.
              <Tooltip content={<KlasseTooltip />} />
            )}
            {vergelijking && <Legend wrapperStyle={{ fontSize: 12 }} />}
            <ReferenceLine y={2.5} {...lijnProps} />
            <ReferenceLine y={3.5} {...lijnProps} />
            <ReferenceLine y={1.75} stroke="none" label={klasseLabel("Basis op Orde")} />
            <ReferenceLine y={3} stroke="none" label={klasseLabel("Uitbouwen")} />
            <ReferenceLine y={4.25} stroke="none" label={klasseLabel("Sterk punt")} />
            <Bar dataKey="score" name={naam} radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.kleur} />
              ))}
              <LabelList
                dataKey="score"
                position="top"
                formatter={(value) => Number(value).toFixed(1).replace(".", ",")}
                style={{ fontSize: 14, fontWeight: 500, fill: "var(--ink)" }}
              />
            </Bar>
            {vergelijking && <Bar dataKey="vergelijking" name={vergelijkingNaam} fill="#b8b5ae" radius={[6, 6, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Een categorienaam op één regel onder zijn balk, nooit afgebroken en nooit overgeslagen. */
function CategorieTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  return (
    <text x={x} y={(y ?? 0) + 14} textAnchor="middle" fontSize={12} fill="var(--ink-s)" style={{ whiteSpace: "nowrap" }}>
      {payload?.value}
    </text>
  );
}

/** "Organisatie · Uitbouwen": De naam en de klasse van de afgeronde score. */
function KlasseTooltip({ active, payload }: { active?: boolean; payload?: { payload: { naam: string; score: number } }[] }) {
  if (!active || !payload?.length) return null;
  const { naam, score } = payload[0].payload;
  return (
    <div className="grafiek-tooltip">
      {naam} · {CLASSIFICATIE_INFO[classificatie(score)].label}
    </div>
  );
}
