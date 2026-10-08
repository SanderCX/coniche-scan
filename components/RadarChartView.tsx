"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { BouwblokResultaat } from "@/lib/scoring";
import { gewichtMarkering } from "@/lib/weging";

/**
 * Recharts draait de schaal-cijfers van PolarRadiusAxis standaard mee met
 * de hoek van de as (hier 90°, dus op hun kant) — een eigen tick-renderer
 * negeert die rotatie zodat 0–5 gewoon horizontaal leesbaar blijft.
 */
function LeesbareSchaalTick({ x, y, payload }: { x: number; y: number; payload: { value: number } }) {
  return (
    <text x={x} y={y} dy={-4} textAnchor="middle" fontSize={10} fill="#4d4d49">
      {payload.value}
    </text>
  );
}

/**
 * `vergelijking`: Een tweede reeks, bijvoorbeeld de rest van de groep in een benchmark (`benchmark.md`, View per
 * organisatie). De namen geven de legenda; zonder `vergelijking` is dit het gewone radardiagram met één reeks.
 */
export function RadarChartView({
  resultaten,
  vergelijking,
  naam = "Score",
  vergelijkingNaam = "Vergelijking",
}: {
  resultaten: BouwblokResultaat[];
  vergelijking?: BouwblokResultaat[];
  naam?: string;
  vergelijkingNaam?: string;
}) {
  const data = resultaten.map((r, i) => ({
    naam: `${r.bouwblok.volgnummer}. ${r.bouwblok.naam}${gewichtMarkering(r.bouwblok) ? ` (${gewichtMarkering(r.bouwblok)})` : ""}`,
    score: r.score ?? 0,
    vergelijking: vergelijking?.[i]?.score ?? 0,
  }));

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#e8e6e1" />
          <PolarAngleAxis
            dataKey="naam"
            tick={{ fontSize: 10, fill: "#4d4d49" }}
          />
          <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={<LeesbareSchaalTick x={0} y={0} payload={{ value: 0 }} />} />
          {vergelijking && (
            <Radar
              name={vergelijkingNaam}
              dataKey="vergelijking"
              stroke="#4d4d49"
              fill="#4d4d49"
              fillOpacity={0.12}
              strokeDasharray="4 3"
            />
          )}
          <Radar
            name={naam}
            dataKey="score"
            stroke="#ff671f"
            fill="#ff671f"
            fillOpacity={0.25}
          />
          {vergelijking && <Legend wrapperStyle={{ fontSize: 12 }} />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
