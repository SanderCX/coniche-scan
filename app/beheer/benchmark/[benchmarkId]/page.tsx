"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { ruimBenchmarkVinkjesOp, useOrganisaties } from "@/lib/db";
import { sluitBenchmarkMeldingen, useBenchmark, verwijderBenchmark } from "@/lib/benchmark-store";
import {
  benchmarkNamen,
  bouwBenchmarkSecties,
  bouwMetingenVergelijkingen,
  bouwScanSectie,
  LEZING_KEUZE,
  lezingVan,
  niveauVan,
} from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { BenchmarkGroepSectie } from "@/components/benchmark/BenchmarkGroepSectie";
import { BenchmarkScanSectie } from "@/components/benchmark/BenchmarkScanSectie";
import { MetingenVergelijkingView } from "@/components/benchmark/MetingenVergelijkingView";
import { LeadsOpView } from "@/components/benchmark/LeadsOpView";

const datumFormat = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" });

const NIVEAU_TEKST = { organisaties: "Tussen organisaties", metingen: "Binnen een organisatie", scans: "Binnen een Meting" } as const;

/**
 * Benchmark, het detail (`beheerpagina.md`, punt 14): Per Assessment een sectie met de teller "X van Y organisaties", de
 * gemiddelden van de groep en per organisatie het aantal afgeronde scans. De Admin ziet de namen van de organisaties, ook
 * van de organisaties die in een Assessment ontbreken. De cijfers worden live berekend; de peildatum staat erbij
 * (`benchmark.md`, Berekening).
 */
export default function BenchmarkDetailPage({ params }: { params: Promise<{ benchmarkId: string }> }) {
  const { benchmarkId } = use(params);
  const gebruiker = useIngelogdeGebruiker();
  const benchmark = useBenchmark(benchmarkId);
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const instellingen = useInstellingen();
  const router = useRouter();
  const [verwijderenOpen, setVerwijderenOpen] = useState(false);

  if (!magBenchmarkBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet Benchmark.</p>
      </div>
    );
  }
  if (!benchmark) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Benchmark niet gevonden.</p>
      </div>
    );
  }

  const niveau = niveauVan(benchmark);
  const secties = niveau === "organisaties" ? bouwBenchmarkSecties(benchmark, assessments, organisaties) : [];
  const vergelijkingen = niveau === "metingen" ? bouwMetingenVergelijkingen(benchmark, assessments, organisaties) : [];
  // Binnen een organisatie hebben alle leden dezelfde organisatie: Daar staat de lijst met Leads die de vergelijking zien.
  const leadOrganisatie = niveau === "metingen" ? organisaties.find((o) => o.id === benchmark.leden[0]?.organisatieId) : undefined;
  const scanSectie = niveau === "scans" ? bouwScanSectie(benchmark, assessments, organisaties) : null;
  // Het aantal vinkjes van Leads voor deze benchmark: Ze gaan mee als de benchmark wordt verwijderd.
  const aantalVinkjes = organisaties.reduce(
    (n, o) => n + (o.leadToegang ?? []).filter((t) => t.weergave === "benchmark" && t.benchmarkId === benchmark.id).length,
    0
  );

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Resultaten", href: "/beheer/resultaten/metingen" },
          { label: "Benchmarks", href: "/beheer/benchmark" },
          { label: benchmark.naam },
        ]}
      />
      <h1>{benchmark.naam}</h1>
      <p className="text-sm text-ink-m">
        {NIVEAU_TEKST[niveau]}
        {niveau === "metingen" && ` · ${LEZING_KEUZE[lezingVan(benchmark, organisaties)].titel}`} · aangemaakt op {datumFormat.format(new Date(benchmark.aangemaaktOp))} · cijfers berekend op{" "}
        {datumFormat.format(new Date())}
      </p>

      {benchmark.meldingen.length > 0 && (
        <div className="beheer-melding admin-notice" role="status">
          <div>
            {benchmark.meldingen.map((m, i) => (
              <p key={i} style={{ margin: 0 }}>
                {m.tekst}
              </p>
            ))}
          </div>
          <button type="button" className="btn btn-outline btn-compact" onClick={() => sluitBenchmarkMeldingen(benchmark.id)}>
            Sluiten
          </button>
        </div>
      )}

      <div className="btn-rij" style={{ margin: "1rem 0 0", maxWidth: "22rem" }}>
        <Link href={`/beheer/benchmark/${benchmark.id}/bewerken`} className="btn btn-outline btn-compact">
          Wijzigen
        </Link>
        <button type="button" className="btn btn-danger btn-compact" onClick={() => setVerwijderenOpen(true)}>
          Verwijderen
        </button>
      </div>

      {niveau === "scans" ? (
        scanSectie ? (
          <BenchmarkScanSectie sectie={scanSectie} benchmarkId={benchmark.id} minScans={instellingen.benchmarkMinRespondenten} />
        ) : (
          <p className="admin-notice" style={{ marginTop: "1.5rem" }}>
            De Meting van deze benchmark bestaat niet meer.
          </p>
        )
      ) : niveau === "metingen" ? (
        <>
          {vergelijkingen.length === 0 ? (
            <p className="admin-notice" style={{ marginTop: "1.5rem" }}>
              Deze benchmark heeft geen Metingen meer. Een benchmark met minder dan twee leden geeft geen vergelijking.
            </p>
          ) : (
            vergelijkingen.map((v) => (
              <MetingenVergelijkingView
                key={v.assessment.id}
                vergelijking={v}
                beheer
                metingHref={(metingId) => `/beheer/metingen/${metingId}?via=resultaten`}
              />
            ))
          )}
          {leadOrganisatie && <LeadsOpView organisatie={leadOrganisatie} benchmark={benchmark} />}
        </>
      ) : secties.length === 0 ? (
        <p className="admin-notice" style={{ marginTop: "1.5rem" }}>
          Deze benchmark heeft geen Assessments meer.
        </p>
      ) : (
        secties.map((s) => (
          <BenchmarkGroepSectie
            key={s.assessment.id}
            sectie={s}
            benchmarkId={benchmark.id}
            minOrganisaties={instellingen.benchmarkMinOrganisaties}
          />
        ))
      )}

      <BevestigModal
        open={verwijderenOpen}
        titel="Benchmark verwijderen"
        bericht={`${benchmark.naam} verwijderen? ${
          aantalVinkjes > 0
            ? `${aantalVinkjes} vinkje${aantalVinkjes === 1 ? "" : "s"} van Leads ${aantalVinkjes === 1 ? "gaat" : "gaan"} mee. `
            : ""
        }Organisaties, Metingen en scans blijven bestaan. Dit kan niet ongedaan gemaakt worden.`}
        onBevestigen={() => {
          verwijderBenchmark(benchmark.id, benchmarkNamen(benchmark.assessmentIds, benchmark.leden, organisaties, assessments, niveau));
          ruimBenchmarkVinkjesOp();
          router.push("/beheer/benchmark");
        }}
        onAnnuleren={() => setVerwijderenOpen(false)}
      />
    </div>
  );
}
