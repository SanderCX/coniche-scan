"use client";

import { useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { maakMeting, nodigLidUit, zetLeadRol } from "@/lib/db";
import { isLead as lidIsLead } from "@/lib/lead";
import { leadSamenvatting } from "@/lib/lead-toegang";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { Organisatie, OrganisatieLid } from "@/lib/types";
import { isSamengesteld } from "@/lib/rondes";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import {
  NIEUWE_RONDE,
  OnderdeelRondeVelden,
  OnderdeelRondeWaarde,
  beginWaarde,
  rondeDoel,
} from "@/components/beheer/OnderdeelRondeVelden";

const NIEUWE_METING = "__nieuw__";

/**
 * Blok "Toegang" in het Respondent-overzicht (`beheerpagina.md`, punt 6a en 6b): De persoonlijke
 * link met "Kopieer" en "Openen", het selectievakje "Lead" met de Metingen direct in het blok
 * (geen tweede venster), en het deel "Vragenlijst sturen" voor elke Respondent.
 */
export function ToegangBlok({
  organisatie,
  lid,
  link,
  magLead,
  onMelding,
}: {
  organisatie: Organisatie;
  lid: OrganisatieLid;
  link: string;
  magLead: boolean;
  onMelding: (tekst: string, fout?: boolean) => void;
}) {
  const assessments = useAssessments();
  const metingen = organisatie.scanUitvoeringen;
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";

  const [kopieerGelukt, setKopieerGelukt] = useState<boolean | null>(null);
  async function kopieer() {
    setKopieerGelukt(await kopieerNaarKlembord(link));
    setTimeout(() => setKopieerGelukt(null), 1600);
  }

  /* ---------- Lead ---------- */
  // Het vakje "Lead" geeft de Respondent een rij in de tabel Leads van de organisatie (`beheerpagina.md`, punt 6a). De vinkjes
  // zelf staan alleen daar. Uitvinken trekt de rol in, na een bevestiging die zegt dat alle vinkjes van deze Lead verdwijnen.
  const isLead = lidIsLead(lid);
  const [intrekkenOpen, setIntrekkenOpen] = useState(false);

  function onVakje(aan: boolean) {
    if (aan) {
      zetLeadRol(lid.id, true);
      onMelding("Deze Respondent is nu Lead. Vink in de tabel Leads aan wat hij ziet.");
    } else {
      setIntrekkenOpen(true);
    }
  }
  function trekLeadIn() {
    zetLeadRol(lid.id, false);
    setIntrekkenOpen(false);
    onMelding("Lead-rol ingetrokken, met alle vinkjes van deze Lead.");
  }

  /* ---------- Vragenlijst sturen ---------- */
  // Een samengestelde Meting heeft geen Respondenten en is niet invulbaar (`benchmark.md`, Samengestelde Meting).
  const beschikbaar = metingen.filter((m) => !isSamengesteld(m) && !m.invullingen.some((i) => i.organisatieLidId === lid.id));
  const [metingKeuze, setMetingKeuze] = useState("");
  const [nieuwAssessment, setNieuwAssessment] = useState("");
  // Een nieuwe Meting heeft alleen Onderdeel en Ronde, de naam maakt de app (`beheerpagina.md`, punt 5).
  const [nieuwConcept, setNieuwConcept] = useState<OnderdeelRondeWaarde | null>(null);
  const nieuwWaarde = nieuwConcept ?? beginWaarde(organisatie);
  const keuze = metingKeuze || (beschikbaar[0]?.id ?? NIEUWE_METING);
  const nieuweMeting = keuze === NIEUWE_METING;
  const kanSturen = nieuweMeting
    ? nieuwAssessment !== "" && (nieuwWaarde.ronde !== NIEUWE_RONDE || nieuwWaarde.nieuweRonde.trim() !== "")
    : beschikbaar.some((m) => m.id === keuze);

  function stuur() {
    if (!kanSturen) return;
    let metingId = keuze;
    let label = beschikbaar.find((m) => m.id === keuze)?.label ?? "";
    if (nieuweMeting) {
      const r = maakMeting(organisatie.id, {
        assessmentId: nieuwAssessment,
        onderdeel: nieuwWaarde.onderdeel,
        ...rondeDoel(nieuwWaarde),
      });
      if (!r.ok) {
        onMelding(r.reden, true);
        return;
      }
      metingId = r.meting.id;
      label = r.meting.label;
    }
    // Alleen de ScanInvulling: De vinkjes van een Lead veranderen er niet door (`beheerpagina.md`, punt 6a).
    const resultaat = nodigLidUit(metingId, lid.email);
    if (!resultaat) {
      onMelding("Versturen is niet gelukt.", true);
      return;
    }
    setMetingKeuze("");
    setNieuwAssessment("");
    setNieuwConcept(null);
    onMelding(`Vragenlijst gestuurd voor Meting "${label}".`);
  }

  return (
    <>
      <section className="overzicht-blok">
        <div className="overzicht-blok-kop">
          <h3>Toegang</h3>
        </div>
        <div className="overzicht-link-rij">
          <input type="text" readOnly value={link} aria-label="Persoonlijke link" />
          <button type="button" className="btn btn-outline btn-compact" onClick={kopieer}>
            {kopieerGelukt === null ? "Kopieer" : kopieerGelukt ? "Gekopieerd!" : "Mislukt"}
          </button>
          <a href={link} target="_blank" rel="noreferrer" className="btn btn-outline btn-compact">
            Openen
          </a>
        </div>

        <div style={{ marginTop: "0.9rem" }}>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isLead} disabled={!magLead} onChange={(e) => onVakje(e.target.checked)} />
            <span className="font-semibold text-ink">Lead</span>
          </label>
          <p className="text-sm text-ink-m" style={{ margin: "0.2rem 0 0 1.6rem" }}>
            {leadSamenvatting(organisatie, lid)}
            {isLead && " (de vinkjes staan in de tabel Leads van de organisatie)"}
          </p>
        </div>
      </section>

      <section className="overzicht-blok">
        <div className="overzicht-blok-kop">
          <h3>Vragenlijst sturen</h3>
        </div>
        <div className="knoppenrij">
          <select className="veld-compact" value={keuze} onChange={(e) => setMetingKeuze(e.target.value)} aria-label="Meting">
            {beschikbaar.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {assessmentNaam(m.assessmentId)}
              </option>
            ))}
            <option value={NIEUWE_METING}>Nieuwe Meting</option>
          </select>
          <button type="button" className="btn btn-outline btn-compact" disabled={!kanSturen} onClick={stuur}>
            Vragenlijst sturen
          </button>
        </div>
        {nieuweMeting && (
          <>
            <div className="knoppenrij" style={{ marginTop: "0.6rem" }}>
              <select
                className="veld-compact"
                value={nieuwAssessment}
                onChange={(e) => setNieuwAssessment(e.target.value)}
                aria-label="Assessment-type"
              >
                <option value="">Kies een Assessment-type</option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.naam}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: "0.6rem" }}>
              <OnderdeelRondeVelden organisatie={organisatie} waarde={nieuwWaarde} onChange={setNieuwConcept} idPrefix="toegang-meting" />
            </div>
          </>
        )}
      </section>

      <BevestigModal
        open={intrekkenOpen}
        titel="Lead-rol intrekken"
        bericht="Deze Respondent is dan geen Lead meer en alle vinkjes van deze Lead in de tabel Leads verdwijnen. Zijn eigen scans blijven bestaan."
        bevestigLabel="Lead-rol intrekken"
        onBevestigen={trekLeadIn}
        onAnnuleren={() => setIntrekkenOpen(false)}
      />
    </>
  );
}
