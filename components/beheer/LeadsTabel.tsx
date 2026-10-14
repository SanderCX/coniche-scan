"use client";

import { useMemo, useState } from "react";
import { useOrganisaties, slaLeadToegangOp, sluitLeadOvergangMelding } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useBenchmarks } from "@/lib/benchmark-store";
import { useInstellingen } from "@/lib/instellingen-store";
import { bouwBenchmarkSecties, bouwMetingView, niveauVan, viewsVoorLead } from "@/lib/benchmark";
import {
  LEAD_WEERGAVE_LABEL,
  METING_WEERGAVEN,
  benchmarkCelReden,
  benchmarkGeldigVoorOrganisatie,
  leadToegangVan,
  leadSamenvatting,
  metingCelReden,
  toegangSleutel,
} from "@/lib/lead-toegang";
import { aantalAfgerondInMeting, isSamengesteld, onderdeelVan, rondesNieuwsteEerst } from "@/lib/rondes";
import { LeadToegang, LeadWeergave, Organisatie, ScanUitvoering } from "@/lib/types";
import { useBeheerOverzicht } from "@/lib/beheer-url";
import { InfoIcoon } from "@/components/InfoIcoon";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";

type Cel = Pick<LeadToegang, "respondentId" | "weergave" | "metingId" | "benchmarkId">;

/**
 * De tabel Leads (`beheerpagina.md`, punt 6a): Eén rij per Lead van de organisatie, per Meting vijf kolommen (Resultaten,
 * Spreiding, Antwoorden, Uitnodigen, Exporteren) gegroepeerd per ronde en per benchmark één kolom. Een selectievakje per cel. Alleen
 * een Admin ziet dit blok. Een nieuwe Lead en een nieuwe Meting beginnen zonder vinkjes en er wordt niets meegenomen.
 *
 * De Admin zet vinkjes en klikt op "Opslaan": Zo verandert toegang nooit door één verkeerde klik. Een cel die niet aan te vinken
 * is, is grijs met de reden in `info.leadToegangCel`. Zet de Admin Resultaten uit, dan gaan Spreiding, Antwoorden en Exporteren
 * van die Meting mee uit (in het concept, en na opslaan in de opslag). Bij veel kolommen scrolt de tabel horizontaal met een
 * vaste eerste kolom en een kolomkop die blijft staan.
 */
export function LeadsTabel({ organisatie, gebruikerId }: { organisatie: Organisatie; gebruikerId: string }) {
  const { open } = useBeheerOverzicht();
  const alleOrganisaties = useOrganisaties();
  const assessments = useAssessments();
  const benchmarks = useBenchmarks();
  const instellingen = useInstellingen();

  const leads = organisatie.leden.filter((l) => l.lead === true);
  const opgeslagen = useMemo(() => {
    const m = new Map<string, Cel>();
    for (const t of leadToegangVan(organisatie)) m.set(toegangSleutel(t), t);
    return m;
  }, [organisatie]);

  // Het concept: `null` zolang er niets is gewijzigd, dan geldt de opgeslagen stand.
  const [concept, setConcept] = useState<Map<string, Cel> | null>(null);
  const stand = concept ?? opgeslagen;
  const gewijzigd =
    concept !== null &&
    (concept.size !== opgeslagen.size || [...concept.keys()].some((k) => !opgeslagen.has(k)));

  const heeft = (respondentId: string, weergave: LeadWeergave, id: string) =>
    stand.has(toegangSleutel({ respondentId, weergave, ...(weergave === "benchmark" ? { benchmarkId: id } : { metingId: id }) }));

  function zet(cel: Cel, aan: boolean) {
    const volgende = new Map(stand);
    const sleutel = toegangSleutel(cel);
    if (aan) volgende.set(sleutel, cel);
    else {
      volgende.delete(sleutel);
      // Wat van Resultaten afhangt gaat mee uit.
      if (cel.weergave === "resultaten") {
        for (const w of ["spreiding", "antwoorden", "exporteren"] as const) {
          volgende.delete(toegangSleutel({ respondentId: cel.respondentId, weergave: w, metingId: cel.metingId }));
        }
      }
    }
    setConcept(volgende);
  }

  /* ---------- Kolommen ---------- */
  const rondes = rondesNieuwsteEerst(organisatie);
  const groepen: { sleutel: string; naam: string; metingen: ScanUitvoering[] }[] = [
    ...rondes.map((r) => ({
      sleutel: r.id,
      naam: r.label,
      metingen: organisatie.scanUitvoeringen.filter((m) => m.rondeId === r.id),
    })),
    {
      sleutel: "__zonder__",
      naam: "Zonder ronde",
      metingen: organisatie.scanUitvoeringen.filter((m) => !m.rondeId || !rondes.some((r) => r.id === m.rondeId)),
    },
  ].filter((g) => g.metingen.length > 0);
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";

  const benchmarkKolommen = benchmarks
    .filter((b) => benchmarkGeldigVoorOrganisatie(b, organisatie.id))
    .map((b) => {
      const niveau = niveauVan(b) as "organisaties" | "metingen";
      const secties = bouwBenchmarkSecties(b, assessments, alleOrganisaties);
      let voldoet: boolean;
      if (niveau === "organisaties") {
        voldoet = viewsVoorLead(secties, organisatie.id, instellingen.benchmarkMinOrganisaties).length > 0;
      } else {
        voldoet = b.leden
          .filter((l) => l.organisatieId === organisatie.id)
          .some((l) => {
            const sectie = secties.find((s) => s.rijen.some((r) => r.meting.id === l.metingId));
            return !!sectie && bouwMetingView(sectie, l.metingId, instellingen.benchmarkMinMetingen)?.voldoetAanDrempel === true;
          });
      }
      return { benchmark: b, niveau, voldoet };
    });

  const aantalKolommen =
    groepen.reduce((n, g) => n + g.metingen.reduce((k, m) => k + (isSamengesteld(m) ? 1 : METING_WEERGAVEN.length), 0), 0) +
    benchmarkKolommen.length;

  function opslaan() {
    if (!concept) return;
    const wijzigingen = [
      ...[...concept.entries()].filter(([k]) => !opgeslagen.has(k)).map(([, c]) => ({ ...c, aan: true })),
      ...[...opgeslagen.entries()].filter(([k]) => !concept.has(k)).map(([, c]) => ({ ...c, aan: false })),
    ];
    const n = slaLeadToegangOp(organisatie.id, wijzigingen, gebruikerId);
    setConcept(null);
    zetBeheerMelding({ tekst: n === 0 ? "Er is niets gewijzigd." : `${n} ${n === 1 ? "vinkje" : "vinkjes"} opgeslagen.` });
  }

  const drempels = { minRespondenten: instellingen.benchmarkMinRespondenten };

  return (
    <section style={{ marginTop: "2rem" }}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 style={{ margin: 0 }}>Leads</h2>
      </div>
      <p className="text-sm text-ink-m" style={{ margin: "0.4rem 0 0.8rem" }}>
        Vink per Lead aan welke weergaven hij ziet. Een nieuwe Meting of benchmark begint zonder vinkjes, en niets erft mee.
      </p>

      {organisatie.leadOvergangMelding && (
        <div className="admin-notice" role="status" style={{ marginBottom: "1rem" }}>
          <span>{organisatie.leadOvergangMelding}</span>{" "}
          <button type="button" className="btn btn-outline btn-compact" onClick={() => sluitLeadOvergangMelding(organisatie.id)}>
            Sluiten
          </button>
        </div>
      )}

      {leads.length === 0 ? (
        <p className="admin-notice">Nog geen Lead in deze organisatie. Voeg er een toe met &ldquo;+ Lead toevoegen&rdquo;.</p>
      ) : aantalKolommen === 0 ? (
        <p className="admin-notice">Er is nog niets om aan te vinken: Plan eerst een Meting.</p>
      ) : (
        <>
          <div className="lead-tabel-kaart">
            <table className="lead-tabel">
              <thead>
                <tr>
                  <th rowSpan={3} className="lead-tabel-naam">
                    Lead
                  </th>
                  {groepen.map((g) => (
                    <th
                      key={g.sleutel}
                      colSpan={g.metingen.reduce((k, m) => k + (isSamengesteld(m) ? 1 : METING_WEERGAVEN.length), 0)}
                      className="lead-tabel-groep"
                    >
                      {g.naam}
                    </th>
                  ))}
                  {benchmarkKolommen.length > 0 && (
                    <th colSpan={benchmarkKolommen.length} className="lead-tabel-groep">
                      Benchmarks
                    </th>
                  )}
                  <th rowSpan={3}></th>
                </tr>
                <tr>
                  {groepen.flatMap((g) =>
                    g.metingen.map((m) => (
                      <th key={m.id} colSpan={isSamengesteld(m) ? 1 : METING_WEERGAVEN.length} className="lead-tabel-meting">
                        {onderdeelVan(m)}
                        {isSamengesteld(m) && <span className="admin-badge status-uitgenodigd">Gemiddelde</span>}
                        <span className="lead-tabel-sub">{assessmentNaam(m.assessmentId)}</span>
                      </th>
                    ))
                  )}
                  {benchmarkKolommen.map(({ benchmark }) => (
                    <th key={benchmark.id} rowSpan={2} className="lead-tabel-meting">
                      {benchmark.naam}
                    </th>
                  ))}
                </tr>
                <tr>
                  {groepen.flatMap((g) =>
                    g.metingen.flatMap((m) =>
                      (isSamengesteld(m) ? (["resultaten"] as const) : METING_WEERGAVEN).map((w) => (
                        <th key={`${m.id}-${w}`} className="lead-tabel-weergave">
                          {LEAD_WEERGAVE_LABEL[w]}
                          {w === "antwoorden" && organisatie.antwoordenMetNamen === true && (
                            <span className="lead-tabel-sub">met namen</span>
                          )}
                        </th>
                      ))
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const aantal = [...stand.values()].filter((c) => c.respondentId === lead.id).length;
                  return (
                    <tr key={lead.id}>
                      <td className="lead-tabel-naam">
                        <strong>{lead.naam || lead.email}</strong>
                        <span className="lead-tabel-sub">
                          {aantal === 0 ? "Ziet nog niets" : leadSamenvatting({ leadToegang: [...stand.values()] as LeadToegang[] }, lead)}
                        </span>
                      </td>
                      {groepen.flatMap((g) =>
                        g.metingen.flatMap((m) =>
                          (isSamengesteld(m) ? (["resultaten"] as const) : METING_WEERGAVEN).map((w) => {
                            const reden = metingCelReden({
                              weergave: w,
                              meting: m,
                              resultatenAan: heeft(lead.id, "resultaten", m.id),
                              afgerondeScans: aantalAfgerondInMeting(organisatie, m),
                              antwoordenMetNamen: organisatie.antwoordenMetNamen === true,
                              drempels,
                            });
                            const aan = heeft(lead.id, w, m.id);
                            return (
                              <td key={`${m.id}-${w}`} className={`lead-tabel-cel ${reden ? "lead-tabel-cel--grijs" : ""}`}>
                                <input
                                  type="checkbox"
                                  checked={aan && !reden}
                                  disabled={reden !== null}
                                  aria-label={`${LEAD_WEERGAVE_LABEL[w]} van ${m.label} voor ${lead.naam || lead.email}`}
                                  onChange={(e) => zet({ respondentId: lead.id, weergave: w, metingId: m.id }, e.target.checked)}
                                />
                                {reden && <InfoIcoon sleutel="info.leadToegangCel" voorloop={reden} />}
                              </td>
                            );
                          })
                        )
                      )}
                      {benchmarkKolommen.map(({ benchmark, niveau, voldoet }) => {
                        const reden = benchmarkCelReden({
                          niveau,
                          voldoetAanDrempel: voldoet,
                          heeftResultatenOpLidMeting: benchmark.leden.some(
                            (l) => l.organisatieId === organisatie.id && heeft(lead.id, "resultaten", l.metingId)
                          ),
                        });
                        const aan = heeft(lead.id, "benchmark", benchmark.id);
                        return (
                          <td key={benchmark.id} className={`lead-tabel-cel ${reden ? "lead-tabel-cel--grijs" : ""}`}>
                            <input
                              type="checkbox"
                              checked={aan && !reden}
                              disabled={reden !== null}
                              aria-label={`Benchmark ${benchmark.naam} voor ${lead.naam || lead.email}`}
                              onChange={(e) => zet({ respondentId: lead.id, weergave: "benchmark", benchmarkId: benchmark.id }, e.target.checked)}
                            />
                            {reden && <InfoIcoon sleutel="info.leadToegangCel" voorloop={reden} />}
                          </td>
                        );
                      })}
                      <td className="cel-knop">
                        <button type="button" className="btn btn-outline btn-compact" onClick={() => open("respondent", lead.id)}>
                          Bekijk
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="knoppenrij" style={{ marginTop: "0.8rem" }}>
            <button type="button" className="btn btn-or btn-compact" disabled={!gewijzigd} onClick={opslaan}>
              Opslaan
            </button>
            <button type="button" className="btn btn-outline btn-compact" disabled={!gewijzigd} onClick={() => setConcept(null)}>
              Annuleren
            </button>
          </div>
        </>
      )}
    </section>
  );
}
