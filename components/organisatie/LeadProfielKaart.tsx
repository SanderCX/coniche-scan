"use client";

import { useState } from "react";
import { Cijferrij, KanalenBlok, KpiRingenBlok, OverigBlok, ProfielKop, TechstackBlok } from "@/components/organisatie/ProfielBlokken";
import { kanaalStijl } from "@/lib/kanaal-stijl";
import { bouwKpiRing, kopTekstKpis } from "@/lib/kpi-ringen";
import type { LeadProfiel } from "@/lib/dossier";

/**
 * Het profiel van de eigen Organisatie bovenaan het Dossier van de Lead (`dossier.md`, Scherm 5, 1a, en Profiel van de Organisatie): Dezelfde opmaak als het
 * organisatiepaneel, zonder knoppen, met alleen de blokken die de Consultant aanzette. Staan de blokken Kanalen en KPI's allebei aan, dan zijn de ingezette
 * kanalen knoppen waarmee de Lead de ringen per kanaal bekijkt (`dossier.md`, KPI-ringen).
 */
export function LeadProfielKaart({ profiel }: { profiel: LeadProfiel }) {
  const [kanaalId, setKanaalId] = useState<string | null>(null);
  const kanaal = profiel.kanalen.find((k) => k.id === kanaalId && k.klikbaar);
  const gekozenId = kanaal?.id ?? null;
  const ringen = profiel.kpis.map((k) => bouwKpiRing(k, gekozenId));
  return (
    <section className="op-paneel dp-profiel" aria-label={`Profiel van ${profiel.naam}`}>
      <ProfielKop letter={profiel.letter} naam={profiel.naam} sector={profiel.sector} subsector={profiel.subsector} niveau="h2" />
      <Cijferrij cijfers={profiel.cijfers} />
      <KanalenBlok kanalen={profiel.kanalen} gekozen={gekozenId} onKies={profiel.kpis.length > 0 ? setKanaalId : undefined} />
      <KpiRingenBlok kop={kopTekstKpis([kanaal?.naam.toLocaleUpperCase("nl-NL")])} ringen={ringen} kanaalKleur={kanaal ? kanaalStijl(kanaal.naam).kleur : "var(--or)"} legenda={!!kanaal} />
      <TechstackBlok tegels={profiel.techstack} />
      <OverigBlok overig={profiel.overig} />
    </section>
  );
}
