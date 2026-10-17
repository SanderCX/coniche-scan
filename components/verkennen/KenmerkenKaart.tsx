"use client";

import { useState } from "react";
import { FilterMenu } from "@/components/verkennen/FilterMenu";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { KorteNamenTabel } from "@/components/beheer/KorteNamenTabel";
import { InfoIcoon } from "@/components/InfoIcoon";
import { useInstellingen } from "@/lib/instellingen-store";
import { korteNaamVeld, korteNaamWaarde } from "@/lib/korte-namen";
import {
  FilterStand,
  FilterVeld,
  KANALEN_ID,
  LEGE_FILTERS,
  ONDERDEEL_ID,
  ORGANISATIE_ID,
  PoolLid,
  getalWaarden,
  heeftFilters,
  ingevuldAantal,
  kanaalAantallen,
  selectOpties,
  veldLabelZonderGroep,
  waardeLabel,
} from "@/lib/verkennen";

/** De snelkoppelingen op een lege kaart (`visualisatie-verkennen.md`, Kenmerken en filters): Geen vaste kenmerken. */
export const SNEL_BEGINNEN = ["techstack.techstack-crm.leverancier", "sector-subsector.sector", "kpis.aht"];
/** Bij de eenheid Onderdelen staat Organisatie erbij (`visualisatie-verkennen.md`, Eenheid). */
export const SNEL_BEGINNEN_ONDERDELEN = [...SNEL_BEGINNEN, ORGANISATIE_ID];

/**
 * De kaart Kenmerken (`visualisatie-verkennen.md`, Kenmerken en filters): Het scherm begint leeg. Een toegevoegd kenmerk is
 * automatisch een filter en een mogelijke groepering. Per kenmerk een rij met de korte naam, een potlood voor de korte namen van
 * dat veld, een kruisje en de keuzepillen (select) of een tekst (getal). Onderaan "Wis filters" en de teller "X van Y
 * Organisaties in de pool" met een balk en het aantal Organisaties zonder toestemming.
 */
export function KenmerkenKaart({
  velden,
  kenmerken,
  stand,
  onStand,
  onToevoegen,
  onVerwijder,
  pool,
  gefilterd,
  zonderToestemming,
  eenheidWoord = "Organisaties",
  snelBeginnen = SNEL_BEGINNEN,
  onderTeller,
}: {
  /** Alle velden die een kenmerk kunnen zijn, ook "Ingezette kanalen". */
  velden: FilterVeld[];
  kenmerken: string[];
  stand: FilterStand;
  onStand: (stand: FilterStand) => void;
  onToevoegen: (id: string) => void;
  onVerwijder: (id: string) => void;
  pool: PoolLid[];
  gefilterd: PoolLid[];
  zonderToestemming: number;
  /** "Organisaties" of "onderdelen" (`visualisatie-verkennen.md`, Eenheid). */
  eenheidWoord?: string;
  snelBeginnen?: string[];
  /** Onder de teller en de balk, bijvoorbeeld de knop Opslaan als benchmark. */
  onderTeller?: React.ReactNode;
}) {
  const { korteNamen, verkennenMinIngevuldPct } = useInstellingen();
  const [modalVeld, setModalVeld] = useState<string | null>(null);
  const perId = new Map(velden.map((v) => [v.id, v]));
  const rijen = kenmerken.map((id) => perId.get(id)).filter((v): v is FilterVeld => v !== undefined);
  const organisaties = pool.map((l) => l.organisatie);
  const kanalen = kanaalAantallen(pool);
  const naamVan = (v: FilterVeld) => korteNaamVeld(korteNamen, v.id, veldLabelZonderGroep(v));

  const wisselSelect = (id: string, waarde: string) => {
    const huidig = stand.select[id] ?? [];
    const nieuw = huidig.includes(waarde) ? huidig.filter((w) => w !== waarde) : [...huidig, waarde];
    onStand({ ...stand, select: { ...stand.select, [id]: nieuw } });
  };
  const wisselKanaal = (id: string) =>
    onStand({ ...stand, kanalen: stand.kanalen.includes(id) ? stand.kanalen.filter((k) => k !== id) : [...stand.kanalen, id] });
  const pct = pool.length === 0 ? 0 : Math.round((gefilterd.length / pool.length) * 100);

  return (
    <section className="qv-kaart" aria-label="Kenmerken">
      <div className="titel-rij">
        <h3 style={{ margin: 0 }}>Kenmerken</h3>
        <InfoIcoon sleutel="info.verkennenKenmerken" />
      </div>

      {rijen.length === 0 ? (
        <div className="vk-leeg">
          <p className="text-sm text-ink-m" style={{ margin: 0 }}>
            Nog geen kenmerken. Voeg een kenmerk toe om te filteren en te vergelijken.
          </p>
          <div className="vk-chips" style={{ alignItems: "center" }}>
            <span className="text-xs text-ink-s">Snel beginnen:</span>
            {snelBeginnen.map((id) => perId.get(id))
              .filter((v): v is FilterVeld => v !== undefined)
              .map((v) => (
                <button key={v.id} type="button" className="pil" title={v.label} onClick={() => onToevoegen(v.id)}>
                  {naamVan(v)}
                </button>
              ))}
          </div>
        </div>
      ) : (
        rijen.map((veld) => (
          <div key={veld.id} className="vk-kenmerk">
            <div className="vk-kop-rij">
              <p className="vk-veldkop" title={veld.label}>
                {naamVan(veld)}
              </p>
              {veld.type === "select" && veld.id !== KANALEN_ID && veld.id !== ORGANISATIE_ID && veld.id !== ONDERDEEL_ID && (
                <button
                  type="button"
                  className="vk-potlood"
                  aria-label={`Korte namen van ${naamVan(veld)} bewerken`}
                  title="Korte namen bewerken"
                  onClick={() => setModalVeld(veld.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                className="vk-kruis"
                aria-label={`${naamVan(veld)} verwijderen`}
                title="Kenmerk verwijderen"
                onClick={() => onVerwijder(veld.id)}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {veld.id === KANALEN_ID ? (
              <div className="vk-chips">
                {kanalen.map((k) => (
                  <button key={k.id} type="button" className="pil" aria-pressed={stand.kanalen.includes(k.id)} onClick={() => wisselKanaal(k.id)}>
                    {k.naam}
                    <span>{k.aantal}</span>
                  </button>
                ))}
              </div>
            ) : veld.type === "select" ? (
              <div className="vk-chips">
                {selectOpties(pool, veld).map((o) => (
                  <button
                    key={o.waarde}
                    type="button"
                    className="pil"
                    title={veld.id === ORGANISATIE_ID ? waardeLabel(pool, veld, o.waarde) : o.waarde}
                    aria-pressed={(stand.select[veld.id] ?? []).includes(o.waarde)}
                    onClick={() => wisselSelect(veld.id, o.waarde)}
                  >
                    {veld.id === ORGANISATIE_ID ? waardeLabel(pool, veld, o.waarde) : korteNaamWaarde(korteNamen, veld.id, o.waarde)}
                    <span>{o.aantal}</span>
                  </button>
                ))}
                {selectOpties(pool, veld).length === 0 && <span className="text-sm text-ink-s">Geen waarden in de pool.</span>}
              </div>
            ) : (
              <p className="text-sm text-ink-m" style={{ margin: 0 }}>
                Getal, {getalWaarden(pool, veld).length || ingevuldAantal(organisaties, veld)} van {pool.length} ingevuld. Te gebruiken bij
                Groeperen op.
              </p>
            )}
          </div>
        ))
      )}

      <div className="vk-acties">
        <FilterMenu velden={velden} toegevoegd={kenmerken} pool={pool} korteNamen={korteNamen} grijsOnderPct={verkennenMinIngevuldPct} onKies={onToevoegen} />
        <button type="button" className="btn btn-outline btn-compact" disabled={!heeftFilters(stand)} onClick={() => onStand(LEGE_FILTERS)}>
          Wis filters
        </button>
      </div>

      <div className="vk-teller">
        <strong>
          {gefilterd.length} van {pool.length} {eenheidWoord} in de pool
        </strong>
        <div className="vk-teller-balk" aria-hidden="true">
          <div style={{ width: `${pct}%` }} />
        </div>
        {eenheidWoord === "onderdelen" && (
          <span className="text-ink-s" style={{ display: "block" }}>
            De pool bestaat uit {pool.length} onderdelen van {new Set(pool.map((l) => l.organisatie.id)).size} Organisaties.
          </span>
        )}
        {zonderToestemming > 0 && (
          <span className="text-ink-s">
            {zonderToestemming} {zonderToestemming === 1 ? "Organisatie is" : "Organisaties zijn"} niet beschikbaar: Geen toestemming voor benchmark.
          </span>
        )}
      </div>

      {onderTeller}
      {eenheidWoord === "onderdelen" && (
        <p className="vk-voet">Elk onderdeel telt even zwaar mee, ook als een Organisatie er meer heeft dan een andere.</p>
      )}

      {modalVeld && perId.get(modalVeld) && (
        <OverzichtModal label="Korte namen" onSluit={() => setModalVeld(null)}>
          <div className="overzicht-kop">
            <div className="titel-rij">
              <h2 style={{ margin: 0 }}>Korte namen</h2>
              <InfoIcoon sleutel="info.korteNamen" />
            </div>
            <p className="text-sm text-ink-m" style={{ margin: 0 }}>
              {perId.get(modalVeld)?.label}
            </p>
          </div>
          <KorteNamenTabel veldId={modalVeld} onKlaar={() => setModalVeld(null)} />
        </OverzichtModal>
      )}
    </section>
  );
}
