"use client";

import { useState } from "react";
import Link from "next/link";
import { verwijderScanInvullingen } from "@/lib/db";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magScanVerwijderen } from "@/lib/rechten";
import { alleBouwblokkenMetGroep } from "@/lib/assessment-structuur";
import { bouwblokScore, classificatie, overallScore, voortgang } from "@/lib/scoring";
import { scoreKleur } from "@/lib/colors";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { exporteerScanIndesign, exporteerScanPdf, exporteerScansCsv } from "@/lib/beheer-export";
import { Assessment, Organisatie, OrganisatieLid, ScanInvulling, ScanUitvoering } from "@/lib/types";
import { DropdownKnop } from "@/components/DropdownKnop";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";
import { NaarAndereMetingStap, ScanVerplaatsResultaat } from "@/components/beheer/VerplaatsStappen";
import { STATUS_LABEL, datumTekst, rolTeamTekst } from "@/components/beheer/overzicht-helpers";

const NIVEAU_LABEL = { rood: "Basis op Orde", oranje: "Uitbouwen", groen: "Sterk punt" } as const;

/**
 * Scan-overzicht (beheerpagina.md punt 7): vervangt de vroegere
 * detailpagina per scan. Kop, scan-gegevens (beschrijvingslijst), toegang
 * en acties; "Bekijk Respondent" wisselt de inhoud van dezelfde modal.
 */
export function ScanOverzicht({
  organisatie,
  scanUitvoering,
  lid,
  invulling,
  assessment,
  onSluit,
  onOpenRespondent,
}: {
  organisatie: Organisatie;
  scanUitvoering: ScanUitvoering;
  lid: OrganisatieLid;
  invulling: ScanInvulling;
  assessment: Assessment;
  onSluit: () => void;
  onOpenRespondent: () => void;
}) {
  const ingelogd = useIngelogdeGebruiker();
  const [naarMeting, setNaarMeting] = useState(false);
  const [verwijderenOpen, setVerwijderenOpen] = useState(false);
  const [kopieerGelukt, setKopieerGelukt] = useState<boolean | null>(null);
  const [pdfBezig, setPdfBezig] = useState(false);
  const [melding, setMelding] = useState<{ tekst: string; fout?: boolean } | null>(null);

  const naam = lid.naam || lid.email;
  const link = typeof window === "undefined" ? "" : maakPubliekeLink(window.location.origin, lid);
  const afgerond = invulling.status === "afgerond";
  const { beantwoord, totaal, percentage } = voortgang(assessment, invulling.antwoorden);
  const score = afgerond
    ? overallScore(alleBouwblokkenMetGroep(assessment).map((b) => bouwblokScore(b.bouwblok, invulling.antwoorden)))
    : null;
  const rolTeam = rolTeamTekst(lid);
  const context = { organisatie, scanUitvoering, lid, invulling, assessment };

  async function kopieer() {
    setKopieerGelukt(await kopieerNaarKlembord(link));
    setTimeout(() => setKopieerGelukt(null), 1600);
  }

  async function handlePdf() {
    setPdfBezig(true);
    const gelukt = await exporteerScanPdf(context);
    setPdfBezig(false);
    if (!gelukt) setMelding({ tekst: "Het exporteren als PDF is mislukt. Probeer het opnieuw.", fout: true });
  }

  function handleVerplaatst(r: ScanVerplaatsResultaat) {
    setNaarMeting(false);
    setMelding({
      tekst:
        r.overgeslagen.length === 0
          ? `Scan verplaatst naar Meting "${r.doelLabel}".`
          : `Niet verplaatst: ${r.overgeslagen.map((o) => o.reden).join(" ")}`,
      fout: r.overgeslagen.length > 0,
    });
  }

  function handleVerwijderd() {
    verwijderScanInvullingen([invulling.id]);
    setVerwijderenOpen(false);
    zetBeheerMelding({ tekst: `De scan van ${naam} (${scanUitvoering.label}) is verwijderd. De Respondent blijft bestaan.` });
    onSluit();
  }

  return (
    <>
      <OverzichtModal label={`Scan van ${naam}`} onSluit={onSluit} escUitgeschakeld={verwijderenOpen}>
        {naarMeting ? (
          <NaarAndereMetingStap
            organisatie={organisatie}
            invullingIds={[invulling.id]}
            onTerug={() => setNaarMeting(false)}
            onKlaar={handleVerplaatst}
          />
        ) : (
          <>
            <div className="overzicht-kop">
              <h2>{naam}</h2>
              <div className="overzicht-kop-sub">
                <span>
                  {organisatie.naam} · {scanUitvoering.label} · {assessment.naam}
                </span>
                <span className={`admin-badge status-${invulling.status}`}>{STATUS_LABEL[invulling.status]}</span>
              </div>
            </div>

            {melding && (
              <div className={`overzicht-melding ${melding.fout ? "fout" : ""}`} role="status">
                {melding.tekst}
              </div>
            )}

            <section className="overzicht-blok">
              <div className="overzicht-blok-kop">
                <h3>Scan</h3>
              </div>
              <dl className="beschrijvingslijst">
                <dt>Rol / team</dt>
                <dd>{rolTeam}</dd>
                <dt>Gestart</dt>
                <dd>{datumTekst(invulling.gestartOp)}</dd>
                {afgerond && (
                  <>
                    <dt>Afgerond</dt>
                    <dd>{datumTekst(invulling.afgerondOp)}</dd>
                  </>
                )}
                <dt>Voortgang</dt>
                <dd>{afgerond ? `${totaal} van ${totaal} vragen` : `${beantwoord} van ${totaal} vragen (${percentage}%)`}</dd>
                {score !== null && (
                  <>
                    <dt>Overall score</dt>
                    <dd>
                      <strong style={{ color: scoreKleur(score) }}>{score.toFixed(1)}</strong> · {NIVEAU_LABEL[classificatie(score)]}
                    </dd>
                  </>
                )}
              </dl>
            </section>

            <section className="overzicht-blok">
              <div className="overzicht-blok-kop">
                <h3>Toegang</h3>
              </div>
              <div className="overzicht-link-rij">
                <input type="text" readOnly value={link} aria-label="Persoonlijke link" />
                <button type="button" className="btn btn-outline btn-compact" onClick={kopieer}>
                  {kopieerGelukt === null ? "Kopieer" : kopieerGelukt ? "Gekopieerd!" : "Mislukt"}
                </button>
                <a href={link} target="_blank" rel="noreferrer" className="admin-bekijk-knop">
                  Openen
                </a>
              </div>
            </section>

            <section className="overzicht-blok">
              <div className="overzicht-blok-kop">
                <h3>Acties</h3>
              </div>
              <div className="overzicht-acties">
                {afgerond && (
                  <Link href={`/beheer/resultaten/${invulling.id}`} className="btn btn-outline btn-compact">
                    Resultaten bekijken
                  </Link>
                )}
                <DropdownKnop
                  label={pdfBezig ? "Bezig…" : "Exporteren"}
                  opties={[
                    { label: "Als PDF", onClick: handlePdf, disabled: pdfBezig },
                    { label: "Als CSV", onClick: () => exporteerScansCsv([context]) },
                    { label: "Voor InDesign (XML)", onClick: () => exporteerScanIndesign(context) },
                  ]}
                />
                <button type="button" className="btn btn-outline btn-compact" onClick={() => setNaarMeting(true)}>
                  Naar andere Meting
                </button>
                <button type="button" className="admin-bekijk-knop" onClick={onOpenRespondent}>
                  Bekijk Respondent
                </button>
              </div>
              <div className="overzicht-acties" style={{ marginTop: "1.2rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <button
                  type="button"
                  className="btn btn-danger btn-compact"
                  disabled={!magScanVerwijderen(ingelogd, organisatie)}
                  onClick={() => setVerwijderenOpen(true)}
                >
                  Verwijderen
                </button>
              </div>
            </section>
          </>
        )}
      </OverzichtModal>
      <BevestigModal
        open={verwijderenOpen}
        titel="Scan verwijderen"
        bericht={`De scan van ${naam} (${scanUitvoering.label}) definitief verwijderen, met antwoorden en opmerkingen? De Respondent en zijn andere scans blijven bestaan. Dit kan niet ongedaan gemaakt worden.`}
        bevestigLabel="Scan verwijderen"
        onBevestigen={handleVerwijderd}
        onAnnuleren={() => setVerwijderenOpen(false)}
      />
    </>
  );
}
