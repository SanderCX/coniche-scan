"use client";

import { useState } from "react";
import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties, verwijderOrganisaties, verlengBewaartermijn, verwijderScanInvullingen } from "@/lib/db";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { isAdmin, isConsultant, zichtbareOrganisaties } from "@/lib/rechten";
import { useGebruikers } from "@/lib/gebruikers-store";
import { Assessment, Organisatie, ScanUitvoering } from "@/lib/types";
import { gemiddeldeAntwoordenVoorMeting, overallScore } from "@/lib/scoring";
import { scoreKleur } from "@/lib/colors";
import { isOuderDanBewaartermijn, useInstellingen } from "@/lib/instellingen-store";

/**
 * Score en Voortgang op de Consultant-lijst (beheerpagina.md punt 4,
 * "portfolio-overzicht"): de meest recente Meting van deze organisatie
 * mét minstens 1 afgeronde scan — dezelfde drempel als
 * Organisatie-resultaten (`beheerpagina.md`, "Organisatie-resultaten").
 * Geen Meting die daaraan voldoet: `undefined`.
 */
function meestRecenteMetingMetAfgerond(organisatie: Organisatie): ScanUitvoering | undefined {
  return [...organisatie.scanUitvoeringen]
    .sort((a, b) => b.aangemaaktOp.localeCompare(a.aangemaaktOp))
    .find((s) => s.invullingen.some((i) => i.status === "afgerond"));
}

function ScoreEnVoortgang({ meting, assessment }: { meting: ScanUitvoering; assessment: Assessment }) {
  const gemiddeldeAntwoorden = gemiddeldeAntwoordenVoorMeting(assessment, meting.invullingen);
  const score = overallScore(assessment, gemiddeldeAntwoorden);
  const afgerond = meting.invullingen.filter((i) => i.status === "afgerond").length;
  const totaal = meting.invullingen.length;
  const volledigAfgerond = afgerond === totaal;

  return (
    <>
      {score !== null && (
        <span
          className="admin-badge"
          style={{ background: `var(--score-${Math.min(5, Math.max(1, Math.round(score)))}-faint)`, color: scoreKleur(score) }}
        >
          {score.toFixed(1)}
        </span>
      )}
      {!volledigAfgerond && (
        <span className="text-xs text-ink-s">
          {afgerond} van {totaal} afgerond
        </span>
      )}
    </>
  );
}

interface VerlopenRij {
  scanInvullingId: string;
  organisatieNaam: string;
  respondentNaam: string;
  metingLabel: string;
  assessmentNaam: string;
  afgerondOp: string;
  /** Tot wanneer een eerdere "Verlengen" de melding uitstelde, `null` als dat nooit gebeurde. */
  verlengdTot: string | null;
}

/**
 * Bewaartermijn ingevulde scans (`datamodel.md` deel 2, Bewaartermijn
 * ingevulde scans; `beheerpagina.md` punt 4). De twee instellingen zelf
 * zijn Admin-only (globaal, niet per organisatie), maar de "Data ouder
 * dan de bewaartermijn"-lijst die eruit volgt heeft hetzelfde bereik als
 * de rest van dit scherm: alle organisaties voor Admin, eigen voor
 * Consultant (`organisaties` komt hier al zo gefilterd binnen). Geen
 * automatische verwijdering — alleen tonen, de beheerder kiest per rij
 * Verwijderen of Verlengen.
 */
function BewaartermijnBlok({
  organisaties,
  assessments,
  isAdminGebruiker,
}: {
  organisaties: Organisatie[];
  assessments: Assessment[];
  isAdminGebruiker: boolean;
}) {
  const instellingen = useInstellingen();
  const verlopenRijen: VerlopenRij[] = organisaties.flatMap((org) =>
    org.scanUitvoeringen.flatMap((meting) => {
      const assessment = assessments.find((a) => a.id === meting.assessmentId);
      return meting.invullingen
        .filter((i) => isOuderDanBewaartermijn(i, instellingen))
        .map((invulling) => {
          const lid = org.leden.find((l) => l.id === invulling.organisatieLidId);
          return {
            scanInvullingId: invulling.id,
            organisatieNaam: org.naam,
            respondentNaam: lid?.naam || lid?.email || "onbekend",
            metingLabel: meting.label,
            assessmentNaam: assessment?.naam ?? "Onbekend type",
            afgerondOp: invulling.afgerondOp!,
            verlengdTot: invulling.bewaarVerlengdTot,
          };
        });
    })
  );

  // Scans waarvan de melding op dit moment is uitgesteld: Ze staan niet in de
  // lijst hierboven, dus alleen hier is te zien tot wanneer.
  const nu = new Date();
  const verlengdeRijen: VerlopenRij[] = organisaties.flatMap((org) =>
    org.scanUitvoeringen.flatMap((meting) => {
      const assessment = assessments.find((a) => a.id === meting.assessmentId);
      return meting.invullingen
        .filter((i) => i.status === "afgerond" && i.bewaarVerlengdTot && new Date(i.bewaarVerlengdTot) > nu)
        .map((invulling) => {
          const lid = org.leden.find((l) => l.id === invulling.organisatieLidId);
          return {
            scanInvullingId: invulling.id,
            organisatieNaam: org.naam,
            respondentNaam: lid?.naam || lid?.email || "onbekend",
            metingLabel: meting.label,
            assessmentNaam: assessment?.naam ?? "Onbekend type",
            afgerondOp: invulling.afgerondOp!,
            verlengdTot: invulling.bewaarVerlengdTot,
          };
        });
    })
  );

  function handleVerlengen(scanInvullingId: string) {
    if (instellingen.verlengTermijnDagen === null) return;
    verlengBewaartermijn(scanInvullingId, instellingen.verlengTermijnDagen);
  }

  // Geen `window.confirm()`: Dat wordt in sommige browseromgevingen
  // onderdrukt en geeft dan stil `false`, waardoor de knop niets lijkt te
  // doen (zie `components/beheer/BevestigModal.tsx`).
  const [teVerwijderen, setTeVerwijderen] = useState<VerlopenRij | null>(null);

  function handleVerwijderenBevestigd() {
    if (!teVerwijderen) return;
    verwijderScanInvullingen([teVerwijderen.scanInvullingId]);
    setTeVerwijderen(null);
  }

  return (
    <details className="admin-bouwblok-card mt-10">
      <summary>
        <span className="admin-bouwblok-titel">Data ouder dan de bewaartermijn</span>
      </summary>

      <BevestigModal
        open={teVerwijderen !== null}
        titel="Ingevulde scan verwijderen"
        bericht={`De scan van ${teVerwijderen?.respondentNaam ?? ""} (${teVerwijderen?.metingLabel ?? ""}, ${teVerwijderen?.organisatieNaam ?? ""}) definitief verwijderen, met antwoorden en opmerkingen? De respondent en zijn andere scans blijven bestaan. Dit kan niet ongedaan gemaakt worden.`}
        bevestigLabel="Scan verwijderen"
        onBevestigen={handleVerwijderenBevestigd}
        onAnnuleren={() => setTeVerwijderen(null)}
      />

      <div className="mt-3">
        {instellingen.bewaarTermijnDagen === null && (
          <p className="admin-notice">
            Er is nog geen bewaartermijn ingesteld, dus er verschijnt hier niets.
            {isAdminGebruiker && (
              <>
                {" "}
                <Link href="/beheer/instellingen">Stel de bewaartermijn in bij Instellingen →</Link>
              </>
            )}
          </p>
        )}

        {instellingen.bewaarTermijnDagen !== null && (
          <>
            <h3 style={{ fontSize: "var(--fs-l)", marginTop: "1.5rem" }}>
              Data ouder dan de bewaartermijn ({verlopenRijen.length})
            </h3>
            {verlopenRijen.length === 0 ? (
              <p className="admin-notice mt-2">Geen ingevulde scans ouder dan de ingestelde termijn.</p>
            ) : (
              <table className="admin-table mt-2">
                <thead>
                  <tr>
                    <th>Organisatie</th>
                    <th>Respondent</th>
                    <th>Meting</th>
                    <th>Afgerond op</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {verlopenRijen.map((rij) => (
                    <tr key={rij.scanInvullingId}>
                      <td>{rij.organisatieNaam}</td>
                      <td>{rij.respondentNaam}</td>
                      <td>
                        {rij.metingLabel} — {rij.assessmentNaam}
                      </td>
                      <td>{new Date(rij.afgerondOp).toLocaleDateString("nl-NL")}</td>
                      <td>
                        <div className="knoppenstapel">
                          <button type="button" className="btn btn-danger btn-compact" onClick={() => setTeVerwijderen(rij)}>
                            Verwijderen
                          </button>
                          {instellingen.verlengTermijnDagen !== null && (
                            <button
                              type="button"
                              className="btn btn-outline btn-compact"
                              onClick={() => handleVerlengen(rij.scanInvullingId)}
                            >
                              Verlengen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {verlengdeRijen.length > 0 && (
              <>
                <h3 style={{ fontSize: "var(--fs-l)", marginTop: "1.5rem" }}>
                  Verlengd, nog niet opnieuw te beoordelen ({verlengdeRijen.length})
                </h3>
                <table className="admin-table mt-2">
                  <thead>
                    <tr>
                      <th>Organisatie</th>
                      <th>Respondent</th>
                      <th>Meting</th>
                      <th>Afgerond op</th>
                      <th>Verlengd tot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verlengdeRijen.map((rij) => (
                      <tr key={rij.scanInvullingId}>
                        <td>{rij.organisatieNaam}</td>
                        <td>{rij.respondentNaam}</td>
                        <td>
                          {rij.metingLabel} — {rij.assessmentNaam}
                        </td>
                        <td>{new Date(rij.afgerondOp).toLocaleDateString("nl-NL")}</td>
                        <td>{new Date(rij.verlengdTot!).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </div>
    </details>
  );
}

export default function OrganisatiesPage() {
  const assessments = useAssessments();
  const gebruiker = useIngelogdeGebruiker();
  const alleGebruikers = useGebruikers();
  // Bereik "eigen" (datamodel.md deel 2, Rechtenmatrix): een Consultant ziet
  // alleen organisaties die hij zelf aanmaakte of waaraan een Admin hem
  // toewees, een Admin ziet alles.
  const organisaties = zichtbareOrganisaties(gebruiker, useOrganisaties());
  const bulk = useBulkSelect(organisaties.map((o) => o.id));
  const [verwijderenOpen, setVerwijderenOpen] = useState(false);

  const ledenAantal = organisaties
    .filter((o) => bulk.selected.has(o.id))
    .reduce((sum, o) => sum + o.leden.length, 0);
  const verwijderMelding =
    ledenAantal > 0
      ? `${bulk.selected.size} organisatie(s) verwijderen? Dit verwijdert ook ${ledenAantal} respondent(en) en hun ingevulde antwoorden. Dit kan niet ongedaan gemaakt worden.`
      : `${bulk.selected.size} organisatie(s) verwijderen? Dit kan niet ongedaan gemaakt worden.`;

  function handleVerwijderenBevestigd() {
    verwijderOrganisaties([...bulk.selected]);
    bulk.clear();
    setVerwijderenOpen(false);
  }

  return (
    <div className="admin-main">
      <div className="flex items-center justify-between">
        <h1>Organisaties</h1>
        <Link href="/beheer/organisaties/nieuw" className="btn btn-or">
          + Nieuwe organisatie
        </Link>
      </div>

      {organisaties.length === 0 ? (
        <p className="admin-notice">Nog geen organisaties aangemaakt.</p>
      ) : (
        <>
          <label className="mb-3 flex items-center gap-2 text-sm text-ink-m">
            <IndeterminateCheckbox
              checked={bulk.alleGeselecteerd}
              indeterminate={bulk.sommigeGeselecteerd}
              onChange={bulk.toggleAll}
            />
            Alles selecteren
          </label>

          {/* organisaties.verwijderen: alle (Admin) / eigen (Consultant) — de lijst
              hierboven is al gefilterd op "eigen" (zichtbareOrganisaties), dus elke
              selecteerbare rij is per definitie een organisatie die deze gebruiker
              mag verwijderen. Geen losse per-rij check nodig. */}
          <BulkToolbar aantal={bulk.selected.size} onVerwijderen={() => setVerwijderenOpen(true)} />
          <BevestigModal
            open={verwijderenOpen}
            titel="Organisaties verwijderen"
            bericht={verwijderMelding}
            onBevestigen={handleVerwijderenBevestigd}
            onAnnuleren={() => setVerwijderenOpen(false)}
          />

          <div className="admin-list">
            {organisaties.map((org) => {
              const scanNamen = org.scanUitvoeringen
                .map((s) => assessments.find((a) => a.id === s.assessmentId)?.naam ?? "Onbekend type")
                .join(", ");
              const alleInvullingen = org.scanUitvoeringen.flatMap((s) => s.invullingen);
              const afgerond = alleInvullingen.filter((i) => i.status === "afgerond").length;
              // "Aangemaakt door" is puur informatief, geen filter — altijd zichtbaar
              // voor iedereen die de organisatie ziet (beheerpagina.md, punt 4).
              const eigenaar = alleGebruikers.find((g) => g.id === org.aangemaaktDoor);
              // Score/Voortgang: alléén op de Consultant-lijst (portfolio-overzicht),
              // niet op de Admin-lijst — een Admin volgt geen individuele
              // klantrelaties op (beheerpagina.md, punt 4).
              const scoreMeting = isConsultant(gebruiker) ? meestRecenteMetingMetAfgerond(org) : undefined;
              const scoreAssessment = scoreMeting
                ? assessments.find((a) => a.id === scoreMeting.assessmentId)
                : undefined;
              return (
                <div key={org.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bulk.isSelected(org.id)}
                    onChange={() => bulk.toggle(org.id)}
                  />
                  <Link href={`/beheer/organisaties/${org.id}`} className="admin-row flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="admin-row-titel">{org.naam}</p>
                        <p className="admin-row-sub">
                          {org.scanUitvoeringen.length === 0
                            ? "Nog geen scan gepland"
                            : scanNamen}{" "}
                          · {org.leden.length} respondenten, {afgerond} afgerond · Aangemaakt
                          door: {eigenaar ? eigenaar.naam : "onbekend"}
                        </p>
                      </div>
                      {isConsultant(gebruiker) && (
                        <div className="flex items-center gap-2" style={{ flex: "none" }}>
                          {scoreMeting && scoreAssessment ? (
                            <ScoreEnVoortgang meting={scoreMeting} assessment={scoreAssessment} />
                          ) : (
                            <span className="text-xs text-ink-s">-</span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}

      <BewaartermijnBlok
        organisaties={organisaties}
        assessments={assessments}
        isAdminGebruiker={isAdmin(gebruiker)}
      />
    </div>
  );
}
