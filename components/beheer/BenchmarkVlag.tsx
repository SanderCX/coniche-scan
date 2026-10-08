"use client";

import { useState } from "react";
import { Organisatie } from "@/lib/types";
import { zetBenchmarkVlag } from "@/lib/db";
import { aantalBenchmarksMetOrganisatie } from "@/lib/benchmark-store";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { InfoIcoon } from "@/components/InfoIcoon";

/**
 * De benchmark-vlag (`beheerpagina.md`, punt 4, Benchmark-vlag): Een schakelaar "Doet mee aan benchmark" op het
 * organisatie-detail, alleen voor een Admin. Staat uit bij een nieuwe organisatie. Uitzetten gaat na een bevestiging die
 * noemt in hoeveel benchmarks de organisatie meedoet, want haar leden vallen dan uit die benchmarks.
 */
export function BenchmarkVlag({ organisatie }: { organisatie: Organisatie }) {
  const [bevestigOpen, setBevestigOpen] = useState(false);
  const aantal = aantalBenchmarksMetOrganisatie(organisatie.id, true);

  function wissel(aan: boolean) {
    if (aan) zetBenchmarkVlag(organisatie.id, true);
    else if (aantal > 0) setBevestigOpen(true);
    else zetBenchmarkVlag(organisatie.id, false);
  }

  return (
    <div className="flex items-center gap-2" style={{ marginBottom: "1rem" }}>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" checked={organisatie.benchmarkToegestaan} onChange={(e) => wissel(e.target.checked)} />
        Doet mee aan benchmark
      </label>
      <InfoIcoon sleutel="info.benchmarkVlag" />
      <BevestigModal
        open={bevestigOpen}
        titel="Niet meer meedoen aan benchmarks"
        bericht={`${organisatie.naam} doet mee aan ${aantal} benchmark${aantal === 1 ? "" : "s"}. Zet je de vlag uit, dan valt ze uit ${aantal === 1 ? "die benchmark" : "die benchmarks"} en vervallen de bijbehorende toewijzingen aan Leads. De Meting en de scans blijven bestaan.`}
        bevestigLabel="Uitzetten"
        onBevestigen={() => {
          zetBenchmarkVlag(organisatie.id, false);
          setBevestigOpen(false);
        }}
        onAnnuleren={() => setBevestigOpen(false)}
      />
    </div>
  );
}
