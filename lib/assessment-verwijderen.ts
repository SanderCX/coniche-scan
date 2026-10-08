import { Assessment, Benchmark, Organisatie } from "./types";
import { getAssessment, verwijderAssessmentRecord } from "./assessment-store";
import { haalAssessmentUitBenchmarks } from "./benchmark-store";
import { laadAlles } from "./db";
import { logAudit } from "./audit-store";

/**
 * Een Assessment verwijderen (`beheerpagina.md`, punt 1; `datamodel.md`, Verwijderen en datakoppelingen): Alleen als er geen
 * enkele Meting van bestaat, bij welke organisatie dan ook (ook geen Meting zonder scans). Bestaat er wel een Meting,
 * dan kan het niet, ook niet door een Admin, en er is geen tussenvorm waarin de Metingen meegaan. De Admin verwijdert eerst zelf
 * alle Metingen. Zonder Metingen bestaan er geen scans, antwoorden of benchmarkleden van dit Assessment, dus er verdwijnt alleen
 * de definitie.
 */

export interface AssessmentGebruik {
  aantalMetingen: number;
  aantalOrganisaties: number;
}

/** Hoeveel Metingen er van dit Assessment zijn en bij hoeveel organisaties. */
export function assessmentGebruik(organisaties: Organisatie[], assessmentId: string): AssessmentGebruik {
  let aantalMetingen = 0;
  let aantalOrganisaties = 0;
  for (const organisatie of organisaties) {
    const aantal = organisatie.scanUitvoeringen.filter((m) => m.assessmentId === assessmentId).length;
    aantalMetingen += aantal;
    if (aantal > 0) aantalOrganisaties++;
  }
  return { aantalMetingen, aantalOrganisaties };
}

/** Wat er met een Assessment verdwijnt, voor de bevestiging. Telt ook de gearchiveerde content mee. */
export interface AssessmentEffecten {
  aantalCategorieen: number;
  aantalBouwblokken: number;
  aantalVragen: number;
  /** Namen van de benchmarks waaruit het Assessment wordt gehaald. */
  benchmarkNamen: string[];
  /** Namen van Assessments die ervan zijn afgeleid: Ze houden hun inhoud, alleen de regel "Afgeleid van" vervalt. */
  afgeleideNamen: string[];
}

export function assessmentEffecten(assessment: Assessment, alleAssessments: Assessment[], benchmarks: Benchmark[]): AssessmentEffecten {
  const bouwblokken = [...(assessment.categorieen ?? []).flatMap((c) => c.bouwblokken), ...(assessment.bouwblokken ?? [])];
  return {
    aantalCategorieen: assessment.categorieen?.length ?? 0,
    aantalBouwblokken: bouwblokken.length,
    aantalVragen: bouwblokken.reduce((n, b) => n + b.vragen.length, 0),
    benchmarkNamen: benchmarks.filter((b) => b.assessmentIds.includes(assessment.id)).map((b) => b.naam),
    afgeleideNamen: alleAssessments.filter((a) => a.afgeleidVanAssessmentId === assessment.id).map((a) => a.naam),
  };
}

export type VerwijderAssessmentResultaat =
  | { ok: true }
  | { ok: false; reden: "onbekend" }
  | ({ ok: false; reden: "metingen" } & AssessmentGebruik);

/**
 * Verwijdert het Assessment. De controle staat hier, in de gegevenslaag, en niet alleen in de uitgeschakelde knop: Is er in de
 * tussentijd een Meting bijgekomen, dan gebeurt er niets en geeft dit de reden terug. Met de database wordt dit een
 * verwijzing die het verwijderen weigert zolang er Metingen zijn. Gelogd als `assessment.verwijderd`, zonder scans of
 * persoonsgegevens (er zijn er geen bij betrokken).
 */
export function verwijderAssessment(assessmentId: string, benchmarks: Benchmark[]): VerwijderAssessmentResultaat {
  const assessment = getAssessment(assessmentId);
  if (!assessment) return { ok: false, reden: "onbekend" };
  const gebruik = assessmentGebruik(laadAlles(), assessmentId);
  if (gebruik.aantalMetingen > 0) return { ok: false, reden: "metingen", ...gebruik };

  const effecten = assessmentEffecten(assessment, [], benchmarks);
  const resultaat = verwijderAssessmentRecord(assessmentId);
  if (!resultaat) return { ok: false, reden: "onbekend" };
  const benchmarkNamen = haalAssessmentUitBenchmarks(assessmentId, assessment.naam);
  logAudit({
    actie: "assessment.verwijderd",
    entiteitType: "assessment",
    entiteitId: assessment.id,
    entiteitNaam: assessment.naam,
    details: {
      assessmentNaam: assessment.naam,
      kortLabel: assessment.kortLabel,
      aantalCategorieen: effecten.aantalCategorieen,
      aantalBouwblokken: effecten.aantalBouwblokken,
      aantalVragen: effecten.aantalVragen,
      benchmarkNamen,
    },
  });
  return { ok: true };
}
