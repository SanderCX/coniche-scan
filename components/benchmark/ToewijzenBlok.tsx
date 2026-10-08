"use client";

import { Suspense, useState } from "react";
import { Benchmark, Organisatie, OrganisatieLid, ScanUitvoering } from "@/lib/types";
import { niveauVan } from "@/lib/benchmark";
import { trekBenchmarkToewijzingIn, useBenchmarkToewijzingen, wijsBenchmarkToe } from "@/lib/benchmark-store";
import { useBeheerOverzicht } from "@/lib/beheer-url";
import { InfoIcoon } from "@/components/InfoIcoon";

/**
 * Het blok "Toewijzen aan een Lead" op een view (`benchmark.md`, Toewijzen aan een Lead op alle niveaus; `beheerpagina.md`,
 * punt 14), gelijk op alle niveaus: Een lijst van de Leads aan wie de view is toegewezen met de datum en de knoppen "Bekijk"
 * en "Intrekken", en daaronder een keuzelijst met de Leads die in aanmerking komen met de knop "Toewijzen".
 *
 * Wie in aanmerking komt: Niveau 1 een Lead van de organisatie, niveau 2 en 3 een Lead op de Meting van de view
 * (`leadMetingIds`). Toewijzen kan alleen als de groep aan de drempel van het niveau voldoet.
 */
export interface ToewijzenOnderwerp {
  organisatie: Organisatie;
  /** Niveau 2 en 3: De Meting van de view. */
  meting?: ScanUitvoering;
  /** Niveau 3: De Respondent van wie de scan de view is. */
  respondent?: OrganisatieLid;
}

interface Props {
  benchmark: Benchmark;
  onderwerp: ToewijzenOnderwerp;
  /** De groep voldoet aan de drempel van dit niveau. */
  voldoetAanDrempel: boolean;
  gebruikerId: string;
}

export function ToewijzenBlok(props: Props) {
  return (
    <Suspense fallback={null}>
      <ToewijzenBlokInhoud {...props} />
    </Suspense>
  );
}

function ToewijzenBlokInhoud({ benchmark, onderwerp, voldoetAanDrempel, gebruikerId }: Props) {
  const niveau = niveauVan(benchmark);
  const { organisatie, meting, respondent } = onderwerp;
  const toewijzingen = useBenchmarkToewijzingen();
  const { open } = useBeheerOverzicht();
  const [leadId, setLeadId] = useState("");

  const eigen = toewijzingen.filter(
    (t) =>
      t.benchmarkId === benchmark.id &&
      t.organisatieId === organisatie.id &&
      (t.metingId ?? null) === (meting?.id ?? null) &&
      (t.onderwerpRespondentId ?? null) === (respondent?.id ?? null)
  );
  const leads = organisatie.leden.filter(
    (l) => l.leadMetingIds.length > 0 && (niveau === "organisaties" || (meting ? l.leadMetingIds.includes(meting.id) : false))
  );
  const nogToeTeWijzen = leads.filter((l) => !eigen.some((t) => t.respondentId === l.id));
  const gekozen = nogToeTeWijzen.some((l) => l.id === leadId) ? leadId : (nogToeTeWijzen[0]?.id ?? "");
  const kanToewijzen = voldoetAanDrempel && nogToeTeWijzen.length > 0;
  const namen = {
    benchmarkNaam: benchmark.naam,
    organisatieNaam: organisatie.naam,
    niveau,
    ...(meting ? { metingLabel: meting.label } : {}),
  };
  const onderwerpTekst = respondent ? respondent.naam || respondent.email : null;

  return (
    <>
      <h2>Toewijzen aan een Lead</h2>
      {eigen.length > 0 && (
        <table className="admin-table" style={{ marginBottom: "1rem" }}>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Toegewezen op</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {eigen.map((t) => {
              const lead = organisatie.leden.find((l) => l.id === t.respondentId);
              return (
                <tr key={t.id}>
                  <td>{lead ? lead.naam || lead.email : "Onbekende Lead"}</td>
                  <td>{new Date(t.toegewezenOp).toLocaleDateString("nl-NL")}</td>
                  <td className="cel-knop">
                    <div className="knoppen-gelijk">
                      <button type="button" className="btn btn-outline btn-compact" disabled={!lead} onClick={() => lead && open("respondent", lead.id)}>
                        Bekijk
                      </button>
                      <button type="button" className="btn btn-outline btn-compact" onClick={() => trekBenchmarkToewijzingIn(t.id, namen)}>
                        Intrekken
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {leads.length === 0 ? (
        <div className="filter-rij flex flex-wrap items-end gap-3">
          <div className="admin-field" style={{ marginBottom: 0, minWidth: "16rem" }}>
            <label>Lead</label>
            <select disabled>
              <option>Geen Lead beschikbaar</option>
            </select>
          </div>
          <button type="button" className="btn btn-or btn-compact" disabled>
            Toewijzen
          </button>
          <InfoIcoon naastVeld sleutel="info.benchmarkToewijzen" />
          <span className="text-sm text-ink-m" style={{ alignSelf: "center" }}>
            {niveau === "organisaties" ? "Deze organisatie heeft nog geen Lead." : "Deze Meting heeft nog geen Lead."}
          </span>
        </div>
      ) : (
        <div className="filter-rij flex flex-wrap items-end gap-3">
          <div className="admin-field" style={{ marginBottom: 0, minWidth: "16rem" }}>
            <label>Lead</label>
            <select value={gekozen} disabled={nogToeTeWijzen.length === 0} onChange={(e) => setLeadId(e.target.value)}>
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
            disabled={!kanToewijzen || !gekozen}
            aria-describedby={onderwerpTekst ? "toewijzen-privacy" : undefined}
            onClick={() => {
              wijsBenchmarkToe(
                {
                  benchmarkId: benchmark.id,
                  organisatieId: organisatie.id,
                  ...(meting ? { metingId: meting.id } : {}),
                  ...(respondent ? { onderwerpRespondentId: respondent.id } : {}),
                  respondentId: gekozen,
                  toegewezenDoor: gebruikerId,
                },
                namen
              );
              setLeadId("");
            }}
          >
            Toewijzen
          </button>
          {!voldoetAanDrempel && <InfoIcoon naastVeld sleutel="info.benchmarkToewijzen" />}
        </div>
      )}
      {onderwerpTekst && (
        <p id="toewijzen-privacy" className="text-sm text-ink-m" style={{ marginTop: "0.6rem" }}>
          De Lead ziet hiermee de scores van {onderwerpTekst}.
        </p>
      )}
    </>
  );
}
