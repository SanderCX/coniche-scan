"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrganisaties } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { isAdmin, magOrganisatieToegang } from "@/lib/rechten";
import {
  aantalAfgerondInMeting,
  gemiddeldeAntwoordenVoorMetingMetSamenstelling,
  isSamengesteld,
  metingenInRonde,
  onderdeelVan,
  rondesVan,
} from "@/lib/rondes";
import { matrix } from "@/lib/visualisatie";
import { metVia, VIA_RESULTATEN } from "@/lib/resultaten-nav";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { CsvRijContext } from "@/lib/csv-export";
import { exporteerScansCsv } from "@/lib/scan-export";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { RondeKnoppen } from "@/components/beheer/RondeKnoppen";
import { Modal } from "@/components/Modal";
import { SamengesteldeMetingFormulier } from "@/components/beheer/SamengesteldeMetingFormulier";
import { WeergaveMatrix } from "@/components/visualisatie/WeergaveMatrix";

/**
 * Ronde-overzicht (`beheerpagina.md`, punt 7): De resultaten van één ronde van één organisatie. Kop met de naam, de organisatie
 * en de voortgang. Eronder de Metingen van de ronde met Onderdeel, Assessment, afgeronde scans, "Resultaten →" en "Bekijk",
 * en de knoppen "Gemiddelde van deze ronde" en "Vergelijk met vorige ronde" (`RondeKnoppen`, dezelfde als in de rondekop van het
 * organisatie-detail). Voor een Admin staat daaronder de matrix met de onderdelen als kolommen (`visualisatie-scores.md`, E).
 * Het kruimelpad volgt de hoofdlink waarlangs je kwam: Resultaten of Organisaties.
 */
export default function RondeOverzichtPage({ params }: { params: Promise<{ rondeId: string }> }) {
  const { rondeId } = use(params);
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const ingelogd = useIngelogdeGebruiker();
  const router = useRouter();
  const via = useSearchParams().get("via") === VIA_RESULTATEN;
  const [gekozen, setGekozen] = useState("");
  const [gemiddeldeOpen, setGemiddeldeOpen] = useState(false);

  const organisatie = organisaties.find((o) => rondesVan(o).some((r) => r.id === rondeId));
  const ronde = organisatie && rondesVan(organisatie).find((r) => r.id === rondeId);
  const metingen = organisatie && ronde ? metingenInRonde(organisatie, ronde.id) : [];
  const bulk = useBulkSelect(metingen.filter((m) => !isSamengesteld(m)).map((m) => m.id));

  if (!organisatie || !ronde) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Ronde niet gevonden.</p>
      </div>
    );
  }
  if (!magOrganisatieToegang(ingelogd, organisatie)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">
          Geen toegang: deze ronde hoort bij een organisatie die niet door jou is aangemaakt en ook niet aan jou is toegewezen.
        </p>
      </div>
    );
  }

  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";
  const echte = metingen.filter((m) => !isSamengesteld(m));
  const totaal = echte.reduce((n, m) => n + m.invullingen.length, 0);
  const afgerond = echte.reduce((n, m) => n + m.invullingen.filter((i) => i.status === "afgerond").length, 0);

  function exporteer() {
    const context: CsvRijContext[] = [];
    for (const m of metingen.filter((x) => bulk.isSelected(x.id))) {
      const assessment = assessments.find((a) => a.id === m.assessmentId);
      if (!assessment) continue;
      for (const invulling of m.invullingen.filter((i) => i.status === "afgerond")) {
        const lid = organisatie!.leden.find((l) => l.id === invulling.organisatieLidId);
        if (lid) context.push({ organisatie: organisatie!, scanUitvoering: m, lid, invulling, assessment });
      }
    }
    exporteerScansCsv(context);
    bulk.clear();
  }

  // De matrix: De onderdelen als kolommen, voor één Assessment, alleen voor een Admin.
  const assessmentIds = [...new Set(metingen.map((m) => m.assessmentId))];
  const matrixAssessmentId = assessmentIds.includes(gekozen) ? gekozen : assessmentIds[0];
  const matrixAssessment = assessments.find((a) => a.id === matrixAssessmentId);
  const kolommen = metingen.filter((m) => m.assessmentId === matrixAssessmentId);

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={
          via
            ? [
                { label: "Resultaten", href: "/beheer/resultaten/rondes" },
                { label: organisatie.naam, href: `/beheer/organisaties/${organisatie.id}` },
                { label: ronde.label },
              ]
            : [
                { label: "Organisaties", href: "/beheer/organisaties" },
                { label: organisatie.naam, href: `/beheer/organisaties/${organisatie.id}` },
                { label: ronde.label },
              ]
        }
      />
      <span className="eyebrow">Ronde</span>
      <h1>{ronde.label}</h1>
      <p className="text-sm text-ink-m">
        <Link href={`/beheer/organisaties/${organisatie.id}`} style={{ color: "var(--or)" }}>
          {organisatie.naam}
        </Link>{" "}
        · {afgerond} van {totaal} afgerond
      </p>

      <div className="overzicht-acties" style={{ margin: "1rem 0 0.5rem" }}>
        <RondeKnoppen organisatie={organisatie} ronde={ronde} onGemiddelde={() => setGemiddeldeOpen(true)} via={via} />
      </div>

      <h2>Metingen in deze ronde</h2>
      {metingen.length === 0 ? (
        <p className="admin-notice">Deze ronde heeft geen Metingen.</p>
      ) : (
        <>
          <BulkToolbar aantal={bulk.selected.size} onExporteren={exporteer} />
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <IndeterminateCheckbox
                    checked={bulk.alleGeselecteerd}
                    indeterminate={bulk.sommigeGeselecteerd}
                    onChange={bulk.toggleAll}
                  />
                </th>
                <th>Onderdeel</th>
                <th>Assessment</th>
                <th>Afgeronde scans</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {metingen.map((m) => {
                const samengesteld = isSamengesteld(m);
                const scans = aantalAfgerondInMeting(organisatie, m);
                const href = metVia(`/beheer/metingen/${m.id}`, via);
                return (
                  <tr key={m.id} className="admin-table-rij-klikbaar" onClick={() => router.push(href)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      {!samengesteld && (
                        <input type="checkbox" checked={bulk.isSelected(m.id)} onChange={() => bulk.toggle(m.id)} aria-label={`Kies ${onderdeelVan(m)}`} />
                      )}
                    </td>
                    <td>
                      {onderdeelVan(m)} {samengesteld && <span className="admin-badge status-uitgenodigd">Gemiddelde</span>}
                    </td>
                    <td>{assessmentNaam(m.assessmentId)}</td>
                    <td>{samengesteld ? "" : `${m.invullingen.filter((i) => i.status === "afgerond").length} van ${m.invullingen.length}`}</td>
                    <td className="cel-knop" onClick={(e) => e.stopPropagation()}>
                      <div className="knoppen-gelijk">
                        {scans > 0 && (
                          <Link href={metVia(`/beheer/rapportage/${m.id}`, via)} className="btn btn-outline btn-compact">
                            Resultaten →
                          </Link>
                        )}
                        <Link href={href} className="btn btn-outline btn-compact">
                          Bekijk
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {isAdmin(ingelogd) && matrixAssessment && kolommen.length > 0 && (
        <>
          <h2>Per bouwblok en per onderdeel</h2>
          {assessmentIds.length > 1 && (
            <div className="admin-field" style={{ maxWidth: "24rem" }}>
              <label>Assessment</label>
              <select value={matrixAssessmentId} onChange={(e) => setGekozen(e.target.value)}>
                {assessmentIds.map((id) => (
                  <option key={id} value={id}>
                    {assessmentNaam(id)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <WeergaveMatrix
            assessment={matrixAssessment}
            kolomSoort="onderdeel"
            weergave={matrix(
              matrixAssessment,
              kolommen.map((m) => ({
                label: onderdeelVan(m),
                sublabel: m.label,
                aantalScans: aantalAfgerondInMeting(organisatie, m),
                antwoorden: gemiddeldeAntwoordenVoorMetingMetSamenstelling(matrixAssessment, organisatie, m),
              }))
            )}
          />
        </>
      )}

      <Modal open={gemiddeldeOpen} onClose={() => setGemiddeldeOpen(false)} title="Gemiddelde van deze ronde">
        {gemiddeldeOpen && (
          <SamengesteldeMetingFormulier
            organisatie={organisatie}
            rondeId={ronde.id}
            onKlaar={(meting) => {
              setGemiddeldeOpen(false);
              router.push(metVia(`/beheer/metingen/${meting.id}`, via));
            }}
            onAnnuleren={() => setGemiddeldeOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
