"use client";

import Link from "next/link";
import { Benchmark, Organisatie } from "@/lib/types";
import { heeftBenchmarkToegang } from "@/lib/lead-toegang";
import { useBeheerOverzicht } from "@/lib/beheer-url";

/**
 * "Leads" op een view van een benchmark (`benchmark.md`, View voor een Lead; `beheerpagina.md`, punt 14): Er is geen blok meer om
 * een Lead te kiezen. Wie de view ziet, vink je aan in het Leads-venster van de organisatie. Onder de view staat alleen een
 * lijst van de Leads die hem nu zien, met per Lead de knop "Bekijk" (het Respondent-overzicht) en een verwijzing naar dat
 * venster.
 */
export function LeadsOpView({ organisatie, benchmark }: { organisatie: Organisatie; benchmark: Benchmark }) {
  const { open } = useBeheerOverzicht();
  const leads = organisatie.leden.filter((l) => l.lead === true && heeftBenchmarkToegang(organisatie, l.id, benchmark.id));
  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Leads die deze view zien</h2>
      {leads.length === 0 ? (
        <p className="text-sm text-ink-m">Geen Lead ziet deze view.</p>
      ) : (
        <table className="admin-table" style={{ marginBottom: "0.8rem" }}>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{l.naam || l.email}</td>
                <td className="cel-knop">
                  <button type="button" className="btn btn-outline btn-compact" onClick={() => open("respondent", l.id)}>
                    Bekijk
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="text-sm text-ink-m">
        Wie de view ziet, vink je aan in het Leads-venster van{" "}
        <Link href={`/beheer/organisaties/${organisatie.id}?leads=${organisatie.id}`} style={{ color: "var(--or)" }}>
          {organisatie.naam}
        </Link>
        .
      </p>
    </section>
  );
}
