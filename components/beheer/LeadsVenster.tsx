"use client";

import { useMemo, useState } from "react";
import { useOrganisaties, slaLeadToegangOp, sluitLeadOvergangMelding } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useBenchmarksMetLeden } from "@/lib/use-benchmarks";
import { aantalOrganisatiesInLeden, isVerkenning, redenGeenLid } from "@/lib/verkenning-benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { bouwBenchmarkSecties, niveauVan, viewsVoorLead } from "@/lib/benchmark";
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
import { aantalAfgerondInMeting, isSamengesteld, nieuwsteEerst, toonMeetdatum } from "@/lib/metingen";
import { LeadToegang, LeadWeergave, Organisatie } from "@/lib/types";
import { useBeheerOverzicht } from "@/lib/beheer-url";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { LeadToevoegenFormulier } from "@/components/beheer/LeadToevoegenFormulier";

type Cel = Pick<LeadToegang, "respondentId" | "weergave" | "metingId" | "benchmarkId">;

const ALLE_ASSESSMENTS = "";

/**
 * Het Leads-venster van een organisatie (`beheerpagina.md`, punt 6a, Blok Leads en Leads-venster): De Overzichtsmodal in de
 * brede variant `.modal-box--vol`, met van boven naar beneden de kop, een regel uitleg, de melding van de overgang, een
 * keuzelijst Assessment (alleen bij meer dan één Assessment), de vinkjestabel, "+ Lead toevoegen" en een vaste voettekst met
 * "Opslaan" en "Annuleren". Alleen de tabel scrolt.
 *
 * Een Meting heeft vijf kolommen (Resultaten, Spreiding, Antwoorden, Uitnodigen, Exporteren), een samengestelde Meting alleen
 * Resultaten, en per benchmark waar de organisatie in zit staat één kolom. De Metingen staan op meetdatum, de nieuwste links.
 * De Admin zet vinkjes en klikt op "Opslaan": Zo verandert toegang nooit door één verkeerde klik. Annuleren zet de vinkjes terug
 * en laat het venster open. Een cel die niet aan te vinken is, is grijs met de reden in `info.leadToegangCel`. Zet de Admin
 * Resultaten uit, dan gaan Spreiding, Antwoorden en Exporteren van die Meting mee uit. Een nieuwe Lead en een nieuwe Meting
 * beginnen zonder vinkjes en er wordt niets meegenomen.
 */
export function LeadsVenster({
  organisatie,
  gebruikerId,
  onSluit,
}: {
  organisatie: Organisatie;
  gebruikerId: string;
  onSluit: () => void;
}) {
  const { open, leadToevoegen } = useBeheerOverzicht();
  const alleOrganisaties = useOrganisaties();
  const assessments = useAssessments();
  const benchmarks = useBenchmarksMetLeden();
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
  const gewijzigd = concept !== null && (concept.size !== opgeslagen.size || [...concept.keys()].some((k) => !opgeslagen.has(k)));

  const [assessmentKeuze, setAssessmentKeuze] = useState(ALLE_ASSESSMENTS);
  const [melding, setMelding] = useState<string | null>(null);
  const [sluitenVraag, setSluitenVraag] = useState(false);
  const [toevoegenOpen, setToevoegenOpen] = useState(leadToevoegen);
  const [nieuweLink, setNieuweLink] = useState<string | null>(null);
  const [kopieerGelukt, setKopieerGelukt] = useState<boolean | null>(null);

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
    setMelding(null);
    setConcept(volgende);
  }

  /* ---------- Kolommen ---------- */
  const assessmentIds = [...new Set(organisatie.scanUitvoeringen.map((m) => m.assessmentId))];
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";
  const metingen = nieuwsteEerst(
    organisatie.scanUitvoeringen.filter((m) => assessmentKeuze === ALLE_ASSESSMENTS || m.assessmentId === assessmentKeuze)
  );
  const kolommenVan = (m: (typeof metingen)[number]) => (isSamengesteld(m) ? (["resultaten"] as const) : METING_WEERGAVEN);

  const benchmarkKolommen = benchmarks
    .map((b) => ({ b, geenLid: isVerkenning(b) && !benchmarkGeldigVoorOrganisatie(b, organisatie.id) ? redenGeenLid(alleOrganisaties, b, organisatie.id, instellingen.benchmarkMinScans) : null }))
    .filter(({ b, geenLid }) => benchmarkGeldigVoorOrganisatie(b, organisatie.id) || geenLid !== null)
    .map(({ b, geenLid }) => {
      const niveau = niveauVan(b) as "organisaties" | "metingen";
      // Bij een opgeslagen verkenning telt de drempel Organisaties, ook bij de eenheid Onderdelen. Staat er in de filters maar één
      // Organisatie, dan geldt hij niet (`benchmark.md`, Opgeslagen verkenning, Filter op één Organisatie).
      const verkenning = isVerkenning(b);
      const aantalOrganisaties = aantalOrganisatiesInLeden(b.leden);
      const enkeleOrganisatie = (b.filters ?? []).some((f) => f.kenmerk === "__organisatie" && f.waarden.length === 1);
      const voldoet = verkenning
        ? enkeleOrganisatie || aantalOrganisaties >= instellingen.benchmarkMinOrganisaties
        : niveau === "organisaties"
          ? viewsVoorLead(bouwBenchmarkSecties(b, assessments, alleOrganisaties), organisatie.id, instellingen.benchmarkMinOrganisaties).length > 0
          : true;
      return { benchmark: b, niveau, voldoet: geenLid === null && voldoet, verkenning, aantalOrganisaties, geenLid };
    });

  const aantalKolommen = metingen.reduce((n, m) => n + kolommenVan(m).length, 0) + benchmarkKolommen.length;
  const drempels = { minRespondenten: instellingen.benchmarkMinRespondenten };

  function opslaan() {
    if (!concept) return;
    const wijzigingen = [
      ...[...concept.entries()].filter(([k]) => !opgeslagen.has(k)).map(([, c]) => ({ ...c, aan: true })),
      ...[...opgeslagen.entries()].filter(([k]) => !concept.has(k)).map(([, c]) => ({ ...c, aan: false })),
    ];
    const n = slaLeadToegangOp(organisatie.id, wijzigingen, gebruikerId);
    setConcept(null);
    setMelding(n === 0 ? "Er is niets gewijzigd." : `Opgeslagen: ${n} ${n === 1 ? "vinkje" : "vinkjes"} gewijzigd.`);
  }

  function probeerTeSluiten() {
    if (gewijzigd) setSluitenVraag(true);
    else onSluit();
  }

  async function kopieer(url: string) {
    setKopieerGelukt(await kopieerNaarKlembord(url));
    setTimeout(() => setKopieerGelukt(null), 1600);
  }

  return (
    <OverzichtModal label="Leads" onSluit={probeerTeSluiten} escUitgeschakeld={sluitenVraag} vol>
      <div className="overzicht-kop">
        <h2>Leads</h2>
        <p className="overzicht-kop-sub">{organisatie.naam}</p>
      </div>

      <div className="vol-scroll">
        <p className="text-sm text-ink-m" style={{ margin: "0 0 0.8rem" }}>
          Vink per Lead aan welke weergaven hij ziet. Een nieuwe Lead en een nieuwe Meting beginnen zonder vinkjes.
        </p>

        {organisatie.leadOvergangMelding && (
          <div className="admin-notice" role="status" style={{ marginBottom: "1rem" }}>
            <span>{organisatie.leadOvergangMelding}</span>{" "}
            <button type="button" className="btn btn-outline btn-compact" onClick={() => sluitLeadOvergangMelding(organisatie.id)}>
              Sluiten
            </button>
          </div>
        )}
        {melding && (
          <p className="overzicht-melding" role="status">
            {melding}
          </p>
        )}

        {assessmentIds.length > 1 && (
          <div className="admin-field" style={{ maxWidth: "22rem" }}>
            <label htmlFor="leads-assessment">Assessment</label>
            <select id="leads-assessment" value={assessmentKeuze} onChange={(e) => setAssessmentKeuze(e.target.value)}>
              <option value={ALLE_ASSESSMENTS}>Alle Assessments</option>
              {assessmentIds.map((id) => (
                <option key={id} value={id}>
                  {assessmentNaam(id)}
                </option>
              ))}
            </select>
          </div>
        )}

        {leads.length === 0 ? (
          <p className="admin-notice">Nog geen Lead in deze organisatie. Voeg er een toe met &ldquo;+ Lead toevoegen&rdquo;.</p>
        ) : aantalKolommen === 0 ? (
          <p className="admin-notice">Er is nog niets om aan te vinken: Plan eerst een Meting.</p>
        ) : (
          <div className="lead-tabel-kaart">
            <table className="vinkjes-tabel lead-tabel">
              <thead>
                <tr>
                  <th rowSpan={2} className="lead-tabel-naam">
                    Lead
                  </th>
                  {metingen.map((m) => (
                    <th key={m.id} colSpan={kolommenVan(m).length} className="lead-tabel-meting">
                      {m.label}
                      {isSamengesteld(m) && <span className="admin-badge status-uitgenodigd">Gemiddelde</span>}
                      <span className="lead-tabel-sub">
                        {toonMeetdatum(m.meetdatum)}
                        {assessmentIds.length > 1 && ` · ${assessmentNaam(m.assessmentId)}`}
                      </span>
                    </th>
                  ))}
                  {benchmarkKolommen.map(({ benchmark, verkenning, aantalOrganisaties }) => (
                    <th key={benchmark.id} rowSpan={2} className="lead-tabel-meting">
                      Benchmark
                      {verkenning && <span className="mm-rolchip" style={{ marginLeft: "var(--sp-2)" }}>Verkenning</span>}
                      <span className="lead-tabel-sub">{benchmark.naam}</span>
                      {verkenning && (
                        <span className="lead-tabel-sub">
                          {aantalOrganisaties} {aantalOrganisaties === 1 ? "Organisatie" : "Organisaties"}
                        </span>
                      )}
                    </th>
                  ))}
                  <th rowSpan={2}></th>
                </tr>
                <tr>
                  {metingen.flatMap((m) =>
                    kolommenVan(m).map((w, i) => (
                      <th key={`${m.id}-${w}`} className={`lead-tabel-weergave ${i === 0 ? "lead-tabel-begin" : ""}`}>
                        {LEAD_WEERGAVE_LABEL[w]}
                        {w === "antwoorden" && organisatie.antwoordenMetNamen === true && (
                          <span className="lead-tabel-sub">met namen</span>
                        )}
                      </th>
                    ))
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
                      {metingen.flatMap((m) =>
                        kolommenVan(m).map((w, i) => {
                          const reden = metingCelReden({
                            weergave: w,
                            meting: m,
                            resultatenAan: heeft(lead.id, "resultaten", m.id),
                            afgerondeScans: aantalAfgerondInMeting(organisatie, m),
                            antwoordenMetNamen: organisatie.antwoordenMetNamen === true,
                            drempels,
                            ondersteund: !isJaNeeWeetNiet(assessments.find((a) => a.id === m.assessmentId) ?? { antwoordType: "schaal" }),
                          });
                          const aan = heeft(lead.id, w, m.id);
                          return (
                            <td
                              key={`${m.id}-${w}`}
                              className={`lead-tabel-cel ${i === 0 ? "lead-tabel-begin" : ""} ${reden ? "lead-tabel-cel--grijs cel-grijs" : ""}`}
                            >
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
                      )}
                      {benchmarkKolommen.map(({ benchmark, niveau, voldoet, verkenning, aantalOrganisaties, geenLid }) => {
                        const reden = verkenning
                          ? geenLid
                            ? geenLid
                            : voldoet
                            ? null
                            : `Te weinig Organisaties in deze groep: ${aantalOrganisaties}, minimaal ${instellingen.benchmarkMinOrganisaties}.`
                          : benchmarkCelReden({
                              niveau,
                              voldoetAanDrempel: voldoet,
                              aantalLidMetingenMetResultaten: benchmark.leden.filter(
                                (l) => l.organisatieId === organisatie.id && heeft(lead.id, "resultaten", l.metingId)
                              ).length,
                            });
                        const aan = heeft(lead.id, "benchmark", benchmark.id);
                        return (
                          <td
                            key={benchmark.id}
                            className={`lead-tabel-cel lead-tabel-begin ${reden ? "lead-tabel-cel--grijs cel-grijs" : ""}`}
                          >
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
        )}

        {/* "+ Lead toevoegen" onder de tabel: Een eigen actie, los van "Opslaan" van de vinkjes, die de al gezette vinkjes niet
            verandert. De nieuwe rij verschijnt zonder vinkjes. */}
        <div style={{ marginTop: "1rem" }}>
          <button type="button" className="btn btn-or btn-compact" aria-expanded={toevoegenOpen} onClick={() => setToevoegenOpen((o) => !o)}>
            + Lead toevoegen
          </button>
          {toevoegenOpen && (
            <div className="mt-3">
              <LeadToevoegenFormulier
                key={nieuweLink ?? "nieuw"}
                organisatie={organisatie}
                onToegevoegd={(lid) => setNieuweLink(maakPubliekeLink(window.location.origin, lid))}
              />
            </div>
          )}
          {nieuweLink && (
            <div className="admin-notice mt-3">
              <p className="font-medium text-ink">Lead toegevoegd. Deel deze link handmatig:</p>
              <div className="overzicht-link-rij mt-2">
                <input readOnly value={nieuweLink} aria-label="Persoonlijke link" />
                <button type="button" onClick={() => kopieer(nieuweLink)} className="btn btn-outline btn-compact">
                  {kopieerGelukt === null ? "Kopieer" : kopieerGelukt ? "Gekopieerd!" : "Mislukt, probeer opnieuw"}
                </button>
                <a href={nieuweLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-compact">
                  Openen
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="vol-voet">
        <div className="btn-rij">
          <button type="button" className="btn btn-outline btn-compact" disabled={!gewijzigd} onClick={() => setConcept(null)}>
            Annuleren
          </button>
          <button type="button" className="btn btn-or btn-compact" disabled={!gewijzigd} onClick={opslaan}>
            Opslaan
          </button>
        </div>
      </div>

      <BevestigModal
        open={sluitenVraag}
        titel="Sluiten zonder op te slaan?"
        bericht="Er zijn vinkjes gewijzigd die nog niet zijn opgeslagen. Sluiten zet ze terug naar de opgeslagen stand."
        bevestigLabel="Sluiten"
        bevestigVariant="primair"
        annuleerLabel="Terug"
        onBevestigen={() => {
          setSluitenVraag(false);
          onSluit();
        }}
        onAnnuleren={() => setSluitenVraag(false)}
      />
    </OverzichtModal>
  );
}
