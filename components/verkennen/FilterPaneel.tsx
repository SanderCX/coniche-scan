"use client";

import { DropdownKnop } from "@/components/DropdownKnop";
import {
  FilterStand,
  FilterVeld,
  LEGE_FILTERS,
  PoolLid,
  getalWaarden,
  heeftFilters,
  histogram,
  kanaalAantallen,
  selectOpties,
} from "@/lib/verkennen";

/** De velden die standaard als filter staan: Sector en de ingezette kanalen (`visualisatie-verkennen.md`, Filters). */
export const SECTOR_VELD = "sector-subsector.sector";

/**
 * De filters van Verkennen (`visualisatie-verkennen.md`, Filters): Chips met meerkeuze voor select-velden ("of" binnen een veld),
 * een bereik met twee handvatten en een histogram voor getalvelden, en de ingezette kanalen ("en"). "Filter toevoegen" kiest een
 * extra veld uit de organisatievelden. Onderaan de teller "X van Y Organisaties in de pool" met een balk, en het aantal
 * organisaties zonder toestemming.
 */
export function FilterPaneel({
  velden,
  stand,
  onChange,
  toegevoegd,
  onToegevoegd,
  pool,
  gefilterd,
  zonderToestemming,
}: {
  velden: FilterVeld[];
  stand: FilterStand;
  onChange: (stand: FilterStand) => void;
  toegevoegd: string[];
  onToegevoegd: (ids: string[]) => void;
  pool: PoolLid[];
  gefilterd: PoolLid[];
  zonderToestemming: number;
}) {
  const perId = new Map(velden.map((v) => [v.id, v]));
  const zichtbaar = [SECTOR_VELD, ...toegevoegd].map((id) => perId.get(id)).filter((v): v is FilterVeld => v !== undefined);
  const kanalen = kanaalAantallen(pool);
  // Alleen velden die in de pool minstens één waarde hebben, zodat de keuzelijst niets leegs aanbiedt.
  const keuzes = velden.filter(
    (v) =>
      v.id !== SECTOR_VELD &&
      !toegevoegd.includes(v.id) &&
      (v.type === "select" ? selectOpties(pool, v).length > 0 : getalWaarden(pool, v).length > 0)
  );

  const wisselSelect = (id: string, waarde: string) => {
    const huidig = stand.select[id] ?? [];
    const nieuw = huidig.includes(waarde) ? huidig.filter((w) => w !== waarde) : [...huidig, waarde];
    onChange({ ...stand, select: { ...stand.select, [id]: nieuw } });
  };
  const wisselKanaal = (id: string) =>
    onChange({ ...stand, kanalen: stand.kanalen.includes(id) ? stand.kanalen.filter((k) => k !== id) : [...stand.kanalen, id] });

  const pct = pool.length === 0 ? 0 : Math.round((gefilterd.length / pool.length) * 100);

  return (
    <section className="qv-kaart" aria-label="Filters">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Filters</h3>
        <span style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <DropdownKnop
            label="Filter toevoegen"
            opties={
              keuzes.length === 0
                ? [{ label: "Geen velden met waarden in de pool", disabled: true }]
                : keuzes.map((v) => ({ label: v.label, onClick: () => onToegevoegd([...toegevoegd, v.id]) }))
            }
          />
          <button
            type="button"
            className="btn btn-outline btn-compact"
            disabled={!heeftFilters(stand) && toegevoegd.length === 0}
            onClick={() => {
              onChange(LEGE_FILTERS);
              onToegevoegd([]);
            }}
          >
            Wis filters
          </button>
        </span>
      </div>

      {zichtbaar.map((veld) => (
        <div key={veld.id}>
          <p className="vk-veldkop">{veld.label}</p>
          {veld.type === "select" ? (
            <div className="vk-chips">
              {selectOpties(pool, veld).map((o) => (
                <button
                  key={o.waarde}
                  type="button"
                  className="vk-chip"
                  aria-pressed={(stand.select[veld.id] ?? []).includes(o.waarde)}
                  onClick={() => wisselSelect(veld.id, o.waarde)}
                >
                  {o.waarde}
                  <span>{o.aantal}</span>
                </button>
              ))}
              {selectOpties(pool, veld).length === 0 && <span className="text-sm text-ink-s">Geen waarden in de pool.</span>}
            </div>
          ) : (
            <BereikFilter
              veld={veld}
              pool={pool}
              waarde={stand.bereik[veld.id]}
              onChange={(b) => {
                const bereik = { ...stand.bereik };
                if (b) bereik[veld.id] = b;
                else delete bereik[veld.id];
                onChange({ ...stand, bereik });
              }}
              onVerwijder={() => {
                const bereik = { ...stand.bereik };
                delete bereik[veld.id];
                onChange({ ...stand, bereik });
                onToegevoegd(toegevoegd.filter((t) => t !== veld.id));
              }}
            />
          )}
          {veld.id !== SECTOR_VELD && veld.type === "select" && (
            <button
              type="button"
              className="btn btn-outline btn-compact"
              style={{ marginTop: "0.4rem" }}
              onClick={() => {
                const select = { ...stand.select };
                delete select[veld.id];
                onChange({ ...stand, select });
                onToegevoegd(toegevoegd.filter((t) => t !== veld.id));
              }}
            >
              Filter verwijderen
            </button>
          )}
        </div>
      ))}

      <div>
        <p className="vk-veldkop">Ingezette kanalen (de organisatie zet ze allemaal in)</p>
        <div className="vk-chips">
          {kanalen.map((k) => (
            <button key={k.id} type="button" className="vk-chip" aria-pressed={stand.kanalen.includes(k.id)} onClick={() => wisselKanaal(k.id)}>
              {k.naam}
              <span>{k.aantal}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="vk-teller">
        <strong>
          {gefilterd.length} van {pool.length} Organisaties in de pool
        </strong>
        <div className="vk-teller-balk" aria-hidden="true">
          <div style={{ width: `${pct}%` }} />
        </div>
        {zonderToestemming > 0 && (
          <span className="text-ink-s">
            {zonderToestemming} {zonderToestemming === 1 ? "Organisatie is" : "Organisaties zijn"} niet beschikbaar: Geen toestemming voor benchmark.
          </span>
        )}
      </div>
    </section>
  );
}

function BereikFilter({
  veld,
  pool,
  waarde,
  onChange,
  onVerwijder,
}: {
  veld: FilterVeld;
  pool: PoolLid[];
  waarde: [number, number] | undefined;
  onChange: (bereik: [number, number] | null) => void;
  onVerwijder: () => void;
}) {
  const waarden = getalWaarden(pool, veld);
  if (waarden.length === 0) return <p className="text-sm text-ink-s">Geen waarden in de pool.</p>;
  const min = Math.min(...waarden);
  const max = Math.max(...waarden);
  const [lo, hi] = waarde ?? [min, max];
  const staven = histogram(waarden, min, max);
  const piek = Math.max(1, ...staven);
  const stap = max - min > 100 ? 1 : max - min > 10 ? 0.5 : 0.1;
  return (
    <div>
      <div className="vk-histogram" aria-hidden="true">
        {staven.map((n, i) => (
          <div key={i} style={{ height: `${(n / piek) * 100}%` }} />
        ))}
      </div>
      <input
        type="range"
        className="vk-slider"
        aria-label={`${veld.label}, ondergrens`}
        min={min}
        max={max}
        step={stap}
        value={lo}
        onChange={(e) => {
          const nieuw = Math.min(Number(e.target.value), hi);
          onChange(nieuw <= min && hi >= max ? null : [nieuw, hi]);
        }}
      />
      <input
        type="range"
        className="vk-slider"
        aria-label={`${veld.label}, bovengrens`}
        min={min}
        max={max}
        step={stap}
        value={hi}
        onChange={(e) => {
          const nieuw = Math.max(Number(e.target.value), lo);
          onChange(lo <= min && nieuw >= max ? null : [lo, nieuw]);
        }}
      />
      <p className="text-sm text-ink-m" style={{ margin: 0 }}>
        {String(lo).replace(".", ",")} tot en met {String(hi).replace(".", ",")} · {waarden.length} van {pool.length} Organisaties hebben
        dit veld ingevuld
      </p>
      <button type="button" className="btn btn-outline btn-compact" style={{ marginTop: "0.4rem" }} onClick={onVerwijder}>
        Filter verwijderen
      </button>
    </div>
  );
}
