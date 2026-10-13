"use client";

import { Suspense, useState } from "react";
import { Benchmark, Organisatie, OrganisatieLid, ScanUitvoering } from "@/lib/types";
import { niveauVan } from "@/lib/benchmark";
import { trekBenchmarkToewijzingIn, useBenchmarkToewijzingen, wijsBenchmarkToe } from "@/lib/benchmark-store";
import { heeftBereikOpLidMeting, heeftBereikOpMeting, heeftBereikOpOrganisatie } from "@/lib/lead";
import { useBeheerOverzicht } from "@/lib/beheer-url";
import { InfoIcoon } from "@/components/InfoIcoon";
import { Modal } from "@/components/Modal";
import type { LeadBereikKeuze } from "@/lib/db";
import { LeadToevoegenFormulier } from "@/components/beheer/LeadToevoegenFormulier";

/**
 * Het blok "Toewijzen aan een Lead" op een view (`benchmark.md`, Toewijzen aan een Lead op alle niveaus; `beheerpagina.md`,
 * punt 14), gelijk op alle niveaus: Een lijst van de Leads aan wie de view is toegewezen met de datum en de knoppen "Bekijk"
 * en "Intrekken", en daaronder een keuzelijst met de Leads die in aanmerking komen met de knop "Toewijzen".
 *
 * Wie in aanmerking komt (`benchmark.md`, Bereik van een Lead): Niveau 1 een Lead met bereik op de lid-Meting van de
 * organisatie in de benchmark (de Meting aangevinkt, of de hele organisatie), niveau 2 en 3 een Lead met bereik op de Meting
 * van de view. Toewijzen kan alleen als de groep aan de drempel van het niveau voldoet.
 * Heeft het onderwerp geen Lead met passend bereik, dan kan de Admin er een toevoegen in een modal, met het bereik al
 * voorgekozen: Op niveau 1 "Hele organisatie", op niveau 2 en 3 "Specifieke Metingen" met de Meting van de view.
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
  /**
   * Niveau 1: De lid-Metingen van de organisatie waarvan de groep aan de drempel voldoet. Een Lead komt dan alleen in
   * aanmerking met bereik op een van die Metingen, want hij ziet alleen de secties die aan de drempel voldoen. Zonder deze
   * lijst telt `voldoetAanDrempel` voor alle Leads.
   */
  voldoendeMetingIds?: string[];
  gebruikerId: string;
}

export function ToewijzenBlok(props: Props) {
  return (
    <Suspense fallback={null}>
      <ToewijzenBlokInhoud {...props} />
    </Suspense>
  );
}

function ToewijzenBlokInhoud({ benchmark, onderwerp, voldoetAanDrempel, voldoendeMetingIds, gebruikerId }: Props) {
  const niveau = niveauVan(benchmark);
  const { organisatie, meting, respondent } = onderwerp;
  const toewijzingen = useBenchmarkToewijzingen();
  const { open } = useBeheerOverzicht();
  const [leadId, setLeadId] = useState("");
  const [leadToevoegenOpen, setLeadToevoegenOpen] = useState(false);

  const eigen = toewijzingen.filter(
    (t) =>
      t.benchmarkId === benchmark.id &&
      t.organisatieId === organisatie.id &&
      (t.metingId ?? null) === (meting?.id ?? null) &&
      (t.onderwerpRespondentId ?? null) === (respondent?.id ?? null)
  );
  // Niveau 1 volgt het bereik op de lid-Meting van de organisatie in de benchmark.
  const lidMetingen = benchmark.leden.filter((l) => l.organisatieId === organisatie.id);
  const heeftBereik = (l: OrganisatieLid) =>
    niveau === "organisaties"
      ? heeftBereikOpLidMeting(l, lidMetingen, organisatie.id)
      : meting
        ? heeftBereikOpMeting(l, organisatie.id, meting.id)
        : false;
  const leads = organisatie.leden.filter(heeftBereik);
  const nogToeTeWijzen = leads.filter((l) => !eigen.some((t) => t.respondentId === l.id));
  const gekozen = nogToeTeWijzen.some((l) => l.id === leadId) ? leadId : (nogToeTeWijzen[0]?.id ?? "");
  // Niveau 1: Alleen een Lead die minstens één sectie ziet die aan de drempel voldoet.
  const lidMetingDrempel = voldoendeMetingIds
    ? lidMetingen.filter((l) => voldoendeMetingIds.includes(l.metingId))
    : lidMetingen;
  const ziet = (l: OrganisatieLid) => niveau !== "organisaties" || heeftBereikOpLidMeting(l, lidMetingDrempel, organisatie.id);
  const gekozenLead = nogToeTeWijzen.find((l) => l.id === gekozen);
  const kanToewijzen = voldoetAanDrempel && !!gekozenLead && ziet(gekozenLead);
  const namen = {
    benchmarkNaam: benchmark.naam,
    organisatieNaam: organisatie.naam,
    niveau,
    ...(meting ? { metingLabel: meting.label } : {}),
  };
  const onderwerpTekst = respondent ? respondent.naam || respondent.email : null;
  const bereikNaam = niveau === "organisaties" ? `de Meting van ${organisatie.naam} in deze benchmark` : `Meting ${meting?.label ?? ""}`.trim();
  const voorgekozenBereik: LeadBereikKeuze =
    niveau === "organisaties" || !meting ? { soort: "organisatie" } : { soort: "metingen", metingIds: [meting.id] };

  return (
    <>
      <h2>Toewijzen aan een Lead</h2>
      {eigen.length > 0 && (
        <table className="admin-table" style={{ marginBottom: "1rem" }}>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Bereik</th>
              <th>Toegewezen op</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {eigen.map((t) => {
              const lead = organisatie.leden.find((l) => l.id === t.respondentId);
              const organisatieBereik = lead ? heeftBereikOpOrganisatie(lead, organisatie.id) : false;
              const metingBereik = lead && meting ? heeftBereikOpMeting(lead, organisatie.id, meting.id) : false;
              // Een toewijzing van vóór het bereik, aan een Lead zonder bereik op de lid-Meting (niveau 1) of de Meting: Blijft
              // eenmalig staan, de Lead ziet niets (`benchmark.md`, Bereik van een Lead, Bestaande toewijzingen).
              const lidBereik = lead ? heeftBereikOpLidMeting(lead, lidMetingen, organisatie.id) : false;
              const zonderBereik = !!lead && !(niveau === "organisaties" ? lidBereik : metingBereik);
              // De Metingen van de lid-Meting waarop de Lead bereik heeft, voor de kolom Bereik op niveau 1.
              const dekkendeLabels = lead
                ? lidMetingen
                    .filter((l) => heeftBereikOpMeting(lead, organisatie.id, l.metingId))
                    .map((l) => organisatie.scanUitvoeringen.find((m) => m.id === l.metingId)?.label ?? "Onbekende Meting")
                : [];
              return (
                <tr key={t.id}>
                  <td>{lead ? lead.naam || lead.email : "Onbekende Lead"}</td>
                  <td>
                    {zonderBereik ? (
                      <span className="text-sm" style={{ color: "var(--stat-red)" }}>
                        {niveau === "organisaties"
                          ? "Deze Lead heeft geen bereik op de Meting van deze organisatie in de benchmark"
                          : "Deze Lead heeft geen bereik op deze Meting"}
                      </span>
                    ) : organisatieBereik ? (
                      "Hele organisatie"
                    ) : niveau === "organisaties" ? (
                      `Meting ${dekkendeLabels.join(", ")}`
                    ) : (
                      `Meting ${meting?.label ?? ""}`.trim()
                    )}
                  </td>
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
          {/* De melding staat in de keuzelijst zelf (`benchmark.md`, Toewijzen aan een Lead): Eén keer, niet ernaast. */}
          <div className="admin-field" style={{ marginBottom: 0, minWidth: "16rem" }}>
            <label>Lead</label>
            <select disabled aria-label="Lead">
              <option>Geen Lead met bereik op {bereikNaam}</option>
            </select>
          </div>
          <span className="knop-met-icoon">
            <button type="button" className="btn btn-or btn-compact" disabled>
              Toewijzen
            </button>
            <InfoIcoon naastVeld sleutel="info.benchmarkToewijzen" />
          </span>
          <button type="button" className="btn btn-or btn-compact" onClick={() => setLeadToevoegenOpen(true)}>
            + Lead toevoegen
          </button>
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
          <span className="knop-met-icoon">
            <button
              type="button"
              className="btn btn-or btn-compact"
              disabled={!kanToewijzen}
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
          </span>
          <button type="button" className="btn btn-or btn-compact" onClick={() => setLeadToevoegenOpen(true)}>
            + Lead toevoegen
          </button>
        </div>
      )}
      <Modal open={leadToevoegenOpen} onClose={() => setLeadToevoegenOpen(false)} title="Lead toevoegen">
        <p className="text-sm text-ink-m" style={{ marginTop: 0 }}>
          Voor {organisatie.naam}. Een Lead die {niveau === "organisaties" ? "de Meting van deze organisatie in de benchmark" : "deze Meting"} niet
          dekt, kan de view niet krijgen.
        </p>
        {leadToevoegenOpen && (
          <LeadToevoegenFormulier
            organisatie={organisatie}
            voorgekozen={voorgekozenBereik}
            onToegevoegd={(lid) => {
              // Na opslaan sluit de modal en staat de nieuwe Lead geselecteerd, klaar voor "Toewijzen".
              setLeadId(lid.id);
              setLeadToevoegenOpen(false);
            }}
            onAnnuleren={() => setLeadToevoegenOpen(false)}
          />
        )}
      </Modal>
      {onderwerpTekst && (
        <p id="toewijzen-privacy" className="text-sm text-ink-m" style={{ marginTop: "0.6rem" }}>
          De Lead ziet hiermee de scores van {onderwerpTekst}.
        </p>
      )}
    </>
  );
}
