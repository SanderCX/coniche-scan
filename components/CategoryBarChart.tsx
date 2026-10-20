"use client";

import { Bar, BarChart, Cell, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GroepResultaat } from "@/lib/scoring";
import { CATEGORIE_COLORS, scoreKleur } from "@/lib/colors";
import { CategorieStaafdiagram } from "@/components/CategorieStaafdiagram";
import { DomeinKolommen } from "@/components/DomeinKolommen";
import { GrafiekActief, ZetActief } from "@/lib/grafiek-actief";
import { formatGewicht } from "@/lib/format";

/**
 * `horizontaal` (CLAUDE.md sectie 3, scherm 6): Bij een Assessment zonder
 * categorie-laag (bijv. de AI-volwassenheidsscan) vervalt het staafdiagram per
 * categorie voor een staand kolomdiagram per domein, in de volgorde van de
 * domeinen en niet op score gesorteerd (`DomeinKolommen`, `stylesheet.md`, Domeinen).
 *
 * `vergelijking` (`benchmark.md`, View per organisatie): Het gemiddelde van de rest van de groep, als neutrale balk
 * naast de score van de organisatie. Gelijk aan `resultaten` qua volgorde.
 */
export function CategoryBarChart({
  resultaten,
  horizontaal = false,
  vergelijking,
  naam = "Score",
  vergelijkingNaam = "Rest van de groep",
  actief,
  onActief,
}: {
  resultaten: GroepResultaat[];
  horizontaal?: boolean;
  vergelijking?: GroepResultaat[];
  naam?: string;
  vergelijkingNaam?: string;
  /** De actieve staat van de ouder, zodat de radar en dit diagram elkaar oplichten (`lib/grafiek-actief.ts`). */
  actief?: GrafiekActief | null;
  onActief?: ZetActief;
}) {
  const data = resultaten.map((r, i) => ({
    naam: r.gewicht && r.gewicht !== 1 ? `${r.groepNaam} (${formatGewicht(r.gewicht)}×)` : r.groepNaam,
    score: r.score ?? 0,
    // Per categorie de categoriekleur (`stylesheet.md`, Categoriekleuren), per domein de domeinkleur (Domeinkleuren).
    kleur: r.score === null ? "#e8e6e1" : r.kleur && CATEGORIE_COLORS[r.kleur] ? CATEGORIE_COLORS[r.kleur].hex : scoreKleur(r.score),
    vergelijking: vergelijking?.[i]?.score ?? 0,
    nummers: r.nummers,
  }));

  // Zonder categorielaag (de AI-scan): Een staand kolomdiagram per domein, in de volgorde van de domeinen (`components/DomeinKolommen.tsx`).
  if (horizontaal) {
    return <DomeinKolommen resultaten={resultaten} vergelijking={vergelijking} naam={naam} vergelijkingNaam={vergelijkingNaam} actief={actief} onActief={onActief} />;
  }

  // Het staafdiagram per categorie met één reeks (`components/CategorieStaafdiagram.tsx`): Het getal staat in de tooltip, niet boven de balk.
  if (!vergelijking) return <CategorieStaafdiagram resultaten={resultaten} actief={actief} onActief={onActief} />;

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
