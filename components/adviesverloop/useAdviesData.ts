"use client";

import { useAssessments } from "@/lib/assessment-store";
import { actieveBouwblokkenMetGroep } from "@/lib/assessment-structuur";
import { useAdviesCatalogus } from "@/lib/advies-catalogus-store";
import { useOrganisaties } from "@/lib/db";
import { useInstellingen } from "@/lib/instellingen-store";
import { useBenchmarksMetLeden } from "@/lib/use-benchmarks";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { kiesProfielRol, useAdviesProfiel } from "@/lib/advies-profiel";
import {
  BenchmarkVerschil,
  BouwsteenSpreiding,
  ShortlistRij,
  benchmarkVerschil,
  eersteMeting,
  gekoppeldeMetingen,
  heeftBouwstenenMetScore,
  metingNaamInTraject,
  metingResultaten,
  peilMeting,
  shortlist,
  spreidingPerBouwsteen,
  verschilSindsEerste,
} from "@/lib/advies";
import type { BouwblokResultaat } from "@/lib/scoring";
import type { AdviesCatalogus, AdviesProfiel, AdviesProfielRol, Adviesverloop, Assessment, Organisatie, ScanUitvoering } from "@/lib/types";

export interface AdviesData {
  organisatie: Organisatie;
  adviesverloop: Adviesverloop;
  catalogus: AdviesCatalogus;
  gekoppeld: ScanUitvoering[];
  peil: ScanUitvoering | null;
  peilLabel: string;
  assessment: Assessment | null;
  resultaten: BouwblokResultaat[];
  groepen: Map<string, { naam: string; kleur: string | null }>;
  shortlist: ShortlistRij[];
  /** De adviescontext van de ingelogde Gebruiker en de rol die bij dit adviesverloop gekozen is (valt terug op de standaardrol). */
  profiel: AdviesProfiel;
  rol: AdviesProfielRol;
  /** Het verschil per bouwsteen met de eerste Meting van hetzelfde Assessment, of `null`. */
  verschil: Map<string, number> | null;
  benchmark: BenchmarkVerschil | null;
  spreiding: Map<string, BouwsteenSpreiding>;
  eerste: { label: string; maand: string; resultaten: BouwblokResultaat[] } | null;
}

/** Alles wat de schermen van het adviesverloop van de peilmeting nodig hebben, op één plek berekend. */
export function useAdviesData(organisatieId: string, adviesverloopId: string): AdviesData | null {
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const catalogus = useAdviesCatalogus();
  const benchmarks = useBenchmarksMetLeden();
  const instellingen = useInstellingen();
  const profiel = useAdviesProfiel(useIngelogdeGebruiker()?.id);
  const organisatie = organisaties.find((o) => o.id === organisatieId);
  const adviesverloop = organisatie?.adviesverlopen?.find((a) => a.id === adviesverloopId);
  if (!organisatie || !adviesverloop) return null;

  const gekoppeld = gekoppeldeMetingen(organisatie, adviesverloop);
  const peil = peilMeting(organisatie, adviesverloop);
  const assessment = peil ? (assessments.find((a) => a.id === peil.assessmentId) ?? null) : null;
  const bruikbaar = assessment && heeftBouwstenenMetScore(assessment) ? assessment : null;
  const resultaten = peil && bruikbaar ? metingResultaten(bruikbaar, organisatie, peil) : [];
  const groepen = new Map<string, { naam: string; kleur: string | null }>();
  if (bruikbaar) for (const b of actieveBouwblokkenMetGroep(bruikbaar)) groepen.set(b.bouwblok.id, { naam: b.groepNaam ?? "", kleur: b.groepKleur });
  const eersteM = eersteMeting(organisatie, adviesverloop);
  const eerste =
    peil && bruikbaar && eersteM && eersteM.id !== peil.id && eersteM.assessmentId === peil.assessmentId
      ? { label: metingNaamInTraject(adviesverloop, eersteM), maand: eersteM.meetdatum ?? "", resultaten: metingResultaten(bruikbaar, organisatie, eersteM) }
      : null;
  return {
    organisatie,
    adviesverloop,
    catalogus,
    gekoppeld,
    peil,
    peilLabel: peil ? metingNaamInTraject(adviesverloop, peil) : "",
    assessment: bruikbaar,
    resultaten,
    groepen,
    profiel,
    rol: kiesProfielRol(profiel, adviesverloop.rolId),
    shortlist: shortlist(resultaten, adviesverloop.shortlistBouwsteenIds, instellingen.shortlistAantal),
    verschil: bruikbaar ? verschilSindsEerste(bruikbaar, organisatie, adviesverloop) : null,
    benchmark: bruikbaar ? benchmarkVerschil(bruikbaar, resultaten, organisatie, organisaties, assessments, benchmarks, instellingen.benchmarkMinOrganisaties) : null,
    spreiding: peil && bruikbaar ? spreidingPerBouwsteen(bruikbaar, organisatie, peil) : new Map(),
    eerste,
  };
}
