"use client";

import { use } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useBenchmark } from "@/lib/benchmark-store";
import { bouwScanSectie, bouwScanView, niveauVan } from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { BenchmarkOrganisatieView } from "@/components/benchmark/BenchmarkOrganisatieView";

/**
 * Benchmark binnen een Meting, de view van één scan (`benchmark.md`, Niveau 3): De scan van een Respondent naast het gemiddelde
 * van de andere afgeronde scans in dezelfde Meting, zonder de scan zelf. Alleen een Admin, die de namen van de
 * Respondenten al ziet. Onder `benchmarkMinScans` (inclusief de scan zelf) staat een waarschuwing: De vergelijking is dan te
 * herleiden naar personen.
 */
export default function BenchmarkScanPage({ params }: { params: Promise<{ benchmarkId: string; invullingId: string }> }) {
  const { benchmarkId, invullingId } = use(params);
  const gebruiker = useIngelogdeGebruiker();
  const benchmark = useBenchmark(benchmarkId);
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const instellingen = useInstellingen();

  if (!magBenchmarkBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet Benchmark.</p>
      </div>
    );
  }
  if (!benchmark || niveauVan(benchmark) !== "scans") {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Benchmark niet gevonden.</p>
      </div>
    );
  }

  const sectie = bouwScanSectie(benchmark, assessments, organisaties);
  const scan = sectie?.scans.find((s) => s.invulling.id === invullingId);
  const view = sectie ? bouwScanView(sectie, invullingId, instellingen.benchmarkMinScans) : null;
  if (!sectie || !scan || !view) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Deze scan doet niet meer mee aan de benchmark.</p>
      </div>
    );
  }

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Benchmark", href: "/beheer/benchmark" },
          { label: benchmark.naam, href: `/beheer/benchmark/${benchmark.id}` },
          { label: scan.naam },
        ]}
      />
      <h1>{scan.naam}</h1>
      <p className="text-sm text-ink-m">
        De scan van deze Respondent in {sectie.meting.label} ({sectie.organisatie.naam}) tegenover de andere scans in die Meting.
      </p>
      {!view.voldoetAanDrempel && (
        <p className="admin-notice" style={{ marginTop: "1.5rem" }}>
          De Meting heeft {view.aantalInGroep} {view.aantalInGroep === 1 ? "afgeronde scan" : "afgeronde scans"}, onder de ondergrens van{" "}
          {instellingen.benchmarkMinScans}: Een vergelijking is dan te herleiden naar personen.
        </p>
      )}
      <BenchmarkOrganisatieView view={view} organisatieNaam={scan.naam} peildatum={new Date()} niveau="scans" />
    </div>
  );
}
