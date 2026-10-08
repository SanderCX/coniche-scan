"use client";

import { use, useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import {
  trekBenchmarkToewijzingIn,
  useBenchmark,
  useBenchmarkToewijzingen,
  wijsBenchmarkToe,
} from "@/lib/benchmark-store";
import { bouwBenchmarkSecties, bouwOrganisatieView, niveauVan } from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { InfoIcoon } from "@/components/InfoIcoon";
import { BenchmarkOrganisatieView } from "@/components/benchmark/BenchmarkOrganisatieView";

/**
 * Benchmark, de view van één organisatie (`beheerpagina.md`, punt 14; `benchmark.md`, View per organisatie): De Admin
 * bekijkt de view eerst zelf, per Assessment waar de organisatie lid van is. Daaronder kiest hij een bestaande Lead van
 * die organisatie om de view aan toe te wijzen, of trekt een toewijzing in. Toewijzen kan alleen als minstens één
 * Assessment aan de minimale groepsgrootte voldoet (`benchmarkMinOrganisaties`).
 */
export default function BenchmarkOrganisatiePage({
  params,
}: {
  params: Promise<{ benchmarkId: string; organisatieId: string }>;
}) {
  const { benchmarkId, organisatieId } = use(params);
  const gebruiker = useIngelogdeGebruiker();
  const benchmark = useBenchmark(benchmarkId);
  const toewijzingen = useBenchmarkToewijzingen();
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const instellingen = useInstellingen();
  const [leadId, setLeadId] = useState("");

  if (!magBenchmarkBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet Benchmark.</p>
      </div>
    );
  }
  const organisatie = organisaties.find((o) => o.id === organisatieId);
  if (!benchmark || !organisatie || niveauVan(benchmark) !== "organisaties") {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Benchmark of organisatie niet gevonden.</p>
      </div>
    );
  }

  const secties = bouwBenchmarkSecties(benchmark, assessments, organisaties);
  const views = secties
    .map((s) => bouwOrganisatieView(s, organisatie.id, instellingen.benchmarkMinOrganisaties))
    .filter((v) => v !== null);
  const peildatum = new Date();
  const voldoet = views.some((v) => v.voldoetAanDrempel);

  const leads = organisatie.leden.filter((l) => l.leadMetingIds.length > 0);
  const eigenToewijzingen = toewijzingen.filter((t) => t.benchmarkId === benchmark.id && t.organisatieId === organisatie.id);
  const nogToeTeWijzen = leads.filter((l) => !eigenToewijzingen.some((t) => t.respondentId === l.id));
  const gekozenLead = leadId || nogToeTeWijzen[0]?.id || "";
  const kanToewijzen = voldoet && nogToeTeWijzen.length > 0;
  const namen = { benchmarkNaam: benchmark.naam, organisatieNaam: organisatie.naam };

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Benchmark", href: "/beheer/benchmark" },
          { label: benchmark.naam, href: `/beheer/benchmark/${benchmark.id}` },
          { label: organisatie.naam },
        ]}
      />
      <h1>{organisatie.naam}</h1>
      <p className="text-sm text-ink-m">
        De view van deze organisatie tegenover de rest van de groep in {benchmark.naam}. Je ziet hem zoals een Lead hem ziet, zonder namen
        van andere organisaties.
      </p>

      <h2>Toewijzen aan een Lead</h2>
      {eigenToewijzingen.length > 0 && (
        <table className="admin-table" style={{ marginBottom: "1rem" }}>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Toegewezen op</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {eigenToewijzingen.map((t) => {
              const lead = organisatie.leden.find((l) => l.id === t.respondentId);
              return (
                <tr key={t.id}>
                  <td>{lead ? lead.naam || lead.email : "Onbekende Lead"}</td>
                  <td>{new Date(t.toegewezenOp).toLocaleDateString("nl-NL")}</td>
                  <td className="cel-knop">
                    <button type="button" className="btn btn-outline btn-compact" onClick={() => trekBenchmarkToewijzingIn(t.id, namen)}>
                      Intrekken
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {leads.length === 0 ? (
        <p className="admin-notice">Deze organisatie heeft nog geen Lead. Maak eerst een Lead aan bij de organisatie.</p>
      ) : (
        <div className="filter-rij flex flex-wrap items-end gap-3">
          <div className="admin-field" style={{ marginBottom: 0, minWidth: "16rem" }}>
            <label>Lead</label>
            <select value={gekozenLead} disabled={nogToeTeWijzen.length === 0} onChange={(e) => setLeadId(e.target.value)}>
              {nogToeTeWijzen.length === 0 && <option value="">Alle Leads hebben deze view al</option>}
              {nogToeTeWijzen.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.naam || l.email}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-or btn-compact"
            disabled={!kanToewijzen || !gekozenLead}
            onClick={() => {
              wijsBenchmarkToe(
                { benchmarkId: benchmark.id, organisatieId: organisatie.id, respondentId: gekozenLead, toegewezenDoor: gebruiker!.id },
                namen
              );
              setLeadId("");
            }}
          >
            Toewijzen
          </button>
          {!voldoet && <InfoIcoon naastVeld sleutel="info.benchmarkToewijzen" />}
        </div>
      )}

      {views.length === 0 ? (
        <p className="admin-notice" style={{ marginTop: "1.5rem" }}>
          Deze organisatie heeft in deze benchmark geen lid meer.
        </p>
      ) : (
        views.map((v) => (
          <div key={v.assessment.id}>
            {!v.voldoetAanDrempel && (
              <p className="admin-notice" style={{ marginTop: "1.5rem" }}>
                {v.assessment.naam}: De groep telt {v.aantalInGroep} organisaties, onder de minimale groepsgrootte van{" "}
                {instellingen.benchmarkMinOrganisaties}. Jij ziet deze view, een Lead niet.
              </p>
            )}
            <BenchmarkOrganisatieView view={v} organisatieNaam={organisatie.naam} peildatum={peildatum} />
          </div>
        ))
      )}
    </div>
  );
}
