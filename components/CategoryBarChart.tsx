"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GroepResultaat } from "@/lib/scoring";
import { scoreKleur } from "@/lib/colors";
import { formatGewicht } from "@/lib/format";

/**
 * `horizontaal` (CLAUDE.md sectie 3, scherm 6): Bij een Assessment zonder
 * categorie-laag (bijv. de AI-volwassenheidsscan) vervalt het verticale
 * staafdiagram per categorie voor een horizontale balk per groep — `resultaten`
 * komt dan al gesorteerd van hoog naar laag binnen (`Assessment.
 * scoresPerGroepGesorteerd`, `lib/scoring.ts`).
 */
export function CategoryBarChart({
  resultaten,
  horizontaal = false,
}: {
  resultaten: GroepResultaat[];
  horizontaal?: boolean;
}) {
  const data = resultaten.map((r) => ({
    naam: r.gewicht && r.gewicht !== 1 ? `${r.groepNaam} (${formatGewicht(r.gewicht)}×)` : r.groepNaam,
    score: r.score ?? 0,
    kleur: r.score !== null ? scoreKleur(r.score) : "#e8e6e1",
  }));

  if (horizontaal) {
    return (
      <div className="w-full" style={{ height: `${data.length * 44 + 16}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
          >
            <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "#4d4d49" }} />
            <YAxis
              type="category"
              dataKey="naam"
              width={140}
              tick={{ fontSize: 11, fill: "#4d4d49" }}
            />
            <Tooltip formatter={(value) => Number(value).toFixed(1)} />
            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.kleur} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 8 }}>
          <XAxis dataKey="naam" tick={{ fontSize: 11, fill: "#4d4d49" }} />
          <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "#4d4d49" }} />
          <Tooltip formatter={(value) => Number(value).toFixed(1)} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.kleur} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
