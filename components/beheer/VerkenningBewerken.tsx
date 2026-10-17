"use client";

import { useState } from "react";
import { useOrganisaties } from "@/lib/db";
import { useInstellingen } from "@/lib/instellingen-store";
import { Benchmark, VerkenningFilter } from "@/lib/types";
import { ledenVoorVerkenning, filterRegels } from "@/lib/verkenning-benchmark";
import { maakFilterNamen } from "@/lib/verkenning-namen";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { MAX_NAAM_BENCHMARK } from "@/components/verkennen/OpslaanAlsBenchmark";

/**
 * Een opgeslagen verkenning wijzigen (`benchmark.md`, Opgeslagen verkenning, Aanpassen): De naam en de filters. Het Assessment en
 * de eenheid zijn niet te wijzigen, daarvoor maakt de Admin een nieuwe verkenning. Een waarde of een filter haal je weg met het
 * kruisje, er blijft minstens één filter met een waarde. Staan er Leads aan, dan zegt de bevestiging hoeveel vinkjes vervallen
 * doordat een Organisatie buiten de groep valt.
 */
export function VerkenningBewerken({
  benchmark,
  onOpslaan,
  onAnnuleren,
}: {
  benchmark: Benchmark;
  onOpslaan: (w: { naam: string; filters: VerkenningFilter[] }) => void;
  onAnnuleren: () => void;
}) {
  const organisaties = useOrganisaties();
  const { korteNamen, benchmarkMinScans } = useInstellingen();
  const [naam, setNaam] = useState(benchmark.naam);
  const [filters, setFilters] = useState<VerkenningFilter[]>(benchmark.filters ?? []);
  const [bevestig, setBevestig] = useState(false);
  const namen = maakFilterNamen(korteNamen, organisaties);

  const haalWaardeWeg = (kenmerk: string, waarde: string) =>
    setFilters(
      filters
        .map((f) => (f.kenmerk === kenmerk ? { ...f, waarden: f.waarden.filter((w) => w !== waarde) } : f))
        .filter((f) => f.waarden.length > 0)
    );
  const geldig = naam.trim() !== "" && filters.length > 0;
  const nieuweLeden = ledenVoorVerkenning(organisaties, { ...benchmark, filters }, benchmarkMinScans);
  const nieuweOrganisaties = new Set(nieuweLeden.map((l) => l.organisatieId));
  // Vinkjes van Leads voor een Organisatie die door de wijziging buiten de groep valt.
  const vervallen = organisaties
    .filter((o) => !nieuweOrganisaties.has(o.id))
    .reduce((n, o) => n + (o.leadToegang ?? []).filter((t) => t.weergave === "benchmark" && t.benchmarkId === benchmark.id).length, 0);
  const regels = filterRegels(filters, namen);

  function klaar() {
    onOpslaan({ naam: naam.trim().slice(0, MAX_NAAM_BENCHMARK), filters });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)", maxWidth: "40rem" }}>
      <div className="admin-field" style={{ marginBottom: 0 }}>
        <label htmlFor="verkenning-naam">Naam (zichtbaar voor de Lead)</label>
        <input id="verkenning-naam" type="text" maxLength={MAX_NAAM_BENCHMARK} value={naam} onChange={(e) => setNaam(e.target.value)} />
        <span className="text-xs text-ink-s">
          {naam.length} van {MAX_NAAM_BENCHMARK} tekens
        </span>
      </div>

      <div>
        <p className="vk-veldkop" style={{ marginTop: 0 }}>
          Filters
        </p>
        {filters.length === 0 ? (
          <p className="admin-notice">Er moet minstens één filter overblijven.</p>
        ) : (
          filters.map((f) => (
            <div key={f.kenmerk} className="vk-kenmerk" style={{ paddingTop: "var(--sp-3)" }}>
              <p className="vk-veldkop" style={{ margin: 0 }}>
                {namen.veld(f.kenmerk)}
              </p>
              <div className="vk-chips">
                {f.waarden.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className="pil"
                    aria-pressed="true"
                    aria-label={`${namen.waarde(f.kenmerk, w)} weghalen`}
                    onClick={() => haalWaardeWeg(f.kenmerk, w)}
                  >
                    {namen.waarde(f.kenmerk, w)}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
        <p className="text-sm text-ink-m" style={{ margin: "var(--sp-3) 0 0" }}>
          {regels.join(" · ")}
        </p>
        <p className="text-sm text-ink-m" style={{ margin: "var(--sp-2) 0 0" }}>
          Nu {nieuweOrganisaties.size} {nieuweOrganisaties.size === 1 ? "Organisatie" : "Organisaties"} in de groep. Meer filters of andere waarden zet je in Verkennen,
          daarna sla je een nieuwe verkenning op.
        </p>
      </div>

      <div className="btn-rij">
        <button type="button" className="btn btn-or btn-compact" disabled={!geldig} onClick={() => (vervallen > 0 ? setBevestig(true) : klaar())}>
          Opslaan
        </button>
        <button type="button" className="btn btn-outline btn-compact" onClick={onAnnuleren}>
          Annuleren
        </button>
      </div>

      <BevestigModal
        open={bevestig}
        titel="Verkenning wijzigen"
        bericht={`Door deze wijziging valt er minstens één Organisatie buiten de groep. ${vervallen} vinkje${vervallen === 1 ? "" : "s"} van Leads ${vervallen === 1 ? "vervalt" : "vervallen"}.`}
        bevestigLabel="Opslaan"
        bevestigVariant="primair"
        onBevestigen={() => {
          setBevestig(false);
          klaar();
        }}
        onAnnuleren={() => setBevestig(false)}
      />
    </div>
  );
}
