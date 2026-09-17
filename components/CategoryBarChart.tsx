"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GroepResultaat } from "@/lib/scoring";
import { classificatie } from "@/lib/scoring";
import { CLASSIFICATIE_HEX } from "@/lib/colors";

export function CategoryBarChart({ resultaten }: { resultaten: GroepResultaat[] }) {
  const data = resultaten.map((r) => ({
    naam: r.groepNaam,
    score: r.score ?? 0,
    kleur: r.score !== null ? CLASSIFICATIE_HEX[classificatie(r.score)] : "#e5e7eb",
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 8 }}>
          <XAxis dataKey="naam" tick={{ fontSize: 11, fill: "#6a7181" }} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#6a7181" }} />
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
