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

export function RadarChartView({ resultaten }: { resultaten: BouwblokResultaat[] }) {
  const data = resultaten.map((r) => ({
    naam: `${r.bouwblok.volgnummer}. ${r.bouwblok.naam}`,
    score: r.score ?? 0,
  }));

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="naam"
            tick={{ fontSize: 10, fill: "#6a7181" }}
          />
          <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fontSize: 10, fill: "#6a7181" }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#f25d26"
            fill="#f25d26"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
