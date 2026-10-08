"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useBenchmarks } from "@/lib/benchmark-store";
import { bouwBenchmarkSecties } from "@/lib/benchmark";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";

const datumFormat = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

/**
 * Benchmark, de lijst (`beheerpagina.md`, punt 14): Alle benchmarks, per rij de naam, de Assessments met per Assessment
 * het aantal organisaties als "X van Y" (`benchmark.md`, Teller) en wanneer de benchmark is aangemaakt. Alleen een Admin.
 */
export default function BenchmarkLijstPage() {
  const gebruiker = useIngelogdeGebruiker();
  const benchmarks = useBenchmarks();
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const router = useRouter();

  if (!magBenchmarkBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet Benchmark.</p>
      </div>
    );
  }

  return (
    <div className="admin-main admin-main--breed">
      <h1>Benchmark</h1>
      <p>Zet de scores van een zelf gekozen groep organisaties naast elkaar.</p>
      <Link href="/beheer/benchmark/nieuw" className="btn btn-or btn-compact" style={{ marginBottom: "1.5rem" }}>
        + Benchmark aanmaken
      </Link>

      {benchmarks.length === 0 ? (
        <p className="admin-notice">Nog geen benchmarks.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Naam</th>
              <th>Assessments</th>
              <th>Aangemaakt</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((b) => {
              const secties = bouwBenchmarkSecties(b, assessments, organisaties);
              return (
                <tr key={b.id} className="admin-table-rij-klikbaar" onClick={() => router.push(`/beheer/benchmark/${b.id}`)}>
                  <td>
                    <strong>{b.naam}</strong>
                  </td>
                  <td>
                    {secties.map((s) => (
                      <div key={s.assessment.id}>
                        {s.assessment.naam}: {s.teller.x} van {s.teller.y} organisaties
                      </div>
                    ))}
                  </td>
                  <td>{datumFormat.format(new Date(b.aangemaaktOp))}</td>
                  <td className="cel-knop">
                    <Link
                      href={`/beheer/benchmark/${b.id}`}
                      className="btn btn-outline btn-compact"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Bekijk
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
