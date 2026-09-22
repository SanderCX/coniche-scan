"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { BouwblokResultaat } from "@/lib/scoring";

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

export function RadarChartView({ resultaten }: { resultaten: BouwblokResultaat[] }) {
  const data = resultaten.map((r) => ({
    naam: `${r.bouwblok.volgnummer}. ${r.bouwblok.naam}`,
    score: r.score ?? 0,
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
          <Radar
            name="Score"
            dataKey="score"
            stroke="#ff671f"
            fill="#ff671f"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
