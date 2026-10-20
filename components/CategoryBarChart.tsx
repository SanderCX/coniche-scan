"use client";

import { Bar, BarChart, Cell, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GroepResultaat } from "@/lib/scoring";
import { CATEGORIE_COLORS, scoreKleur } from "@/lib/colors";
import { CategorieStaafdiagram } from "@/components/CategorieStaafdiagram";
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
    // Per domein (horizontaal) staat het nummer van het domein voor de naam, zodat het diagram aansluit op de radar ernaast.
    naam: `${horizontaal && r.nummers ? `${r.nummers} · ` : ""}${r.gewicht && r.gewicht !== 1 ? `${r.groepNaam} (${formatGewicht(r.gewicht)}×)` : r.groepNaam}`,
    score: r.score ?? 0,
    // Per categorie de categoriekleur (`stylesheet.md`, Categoriekleuren). Per bouwblok (horizontaal) blijft de scorekleur.
    kleur:
      r.score === null
        ? "#e8e6e1"
        : !horizontaal && r.kleur && CATEGORIE_COLORS[r.kleur]
          ? CATEGORIE_COLORS[r.kleur].hex
          : scoreKleur(r.score),
    vergelijking: vergelijking?.[i]?.score ?? 0,
    nummers: r.nummers,
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

  // Het staafdiagram per categorie met één reeks (`components/CategorieStaafdiagram.tsx`): Het getal staat in de tooltip, niet boven de balk.
  if (!vergelijking) return <CategorieStaafdiagram resultaten={resultaten} />;

  // Met een tweede reeks (de vergelijking met een groep in een benchmark) blijft het Recharts-diagram met een legenda.
  const lijnProps = { stroke: "#9a978f", strokeDasharray: "4 4", strokeWidth: 1 } as const;
  const klasseLabel = (value: string) => ({ value, position: "right" as const, fill: "var(--ink-s)", fontSize: 12 });
  const minBreedte = Math.max(520, data.length * 104 + 80);
  return (
    <div className="w-full" style={{ overflowX: "auto" }}>
      <div className="h-72 w-full" style={{ minWidth: minBreedte }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 96, left: -16, bottom: 8 }}>
            <XAxis dataKey="naam" interval={0} tick={<CategorieTick nummers={Object.fromEntries(data.map((d) => [d.naam, d.nummers]))} />} height={44} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: "#4d4d49" }} allowDataOverflow />
            <Tooltip formatter={(value) => Number(value).toFixed(1).replace(".", ",")} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={2.5} {...lijnProps} />
            <ReferenceLine y={3.5} {...lijnProps} />
            <ReferenceLine y={1.75} stroke="none" label={klasseLabel("Basis op Orde")} />
            <ReferenceLine y={3} stroke="none" label={klasseLabel("Uitbouwen")} />
            <ReferenceLine y={4.25} stroke="none" label={klasseLabel("Sterk punt")} />
            <Bar dataKey="score" name={naam} radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.kleur} />
              ))}
            </Bar>
            <Bar dataKey="vergelijking" name={vergelijkingNaam} fill="#b8b5ae" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Een categorienaam op één regel onder zijn balk, nooit afgebroken en nooit overgeslagen. */
function CategorieTick({
  x,
  y,
  payload,
  nummers,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
  nummers?: Record<string, string | undefined>;
}) {
  const nrs = payload ? nummers?.[payload.value] : undefined;
  return (
    <text x={x} y={(y ?? 0) + 14} textAnchor="middle" fontSize={12} fill="var(--ink-s)" style={{ whiteSpace: "nowrap" }}>
      {payload?.value}
      {nrs && (
        <tspan x={x} dy={16}>
          {nrs}
        </tspan>
      )}
    </text>
  );
}
