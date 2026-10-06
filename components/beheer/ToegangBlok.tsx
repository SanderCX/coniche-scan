"use client";

import { useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { maakScanUitvoering, nodigLidUit, zetLeadMetingen } from "@/lib/db";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { Organisatie, OrganisatieLid } from "@/lib/types";
import { BevestigModal } from "@/components/beheer/BevestigModal";

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
  const isLead = lid.leadMetingIds.length > 0;
  const [leadOpen, setLeadOpen] = useState(false); // vakje aangevinkt voor een nieuwe Lead, nog niet opgeslagen
  const [gekozen, setGekozen] = useState<string[] | null>(null); // concept, `null` = de opgeslagen keuze
  const [intrekkenOpen, setIntrekkenOpen] = useState(false);
  const actueel = gekozen ?? lid.leadMetingIds;
  const vakjeAan = isLead || leadOpen;
  const gewijzigd = gekozen !== null && [...gekozen].sort().join() !== [...lid.leadMetingIds].sort().join();

  function onVakje(aan: boolean) {
    if (aan) {
      setLeadOpen(true);
      setGekozen(lid.leadMetingIds);
    } else if (isLead) {
      setIntrekkenOpen(true);
    } else {
      setLeadOpen(false);
      setGekozen(null);
    }
  }
  function toggleMeting(id: string, aan: boolean) {
    setGekozen(aan ? [...actueel, id] : actueel.filter((x) => x !== id));
  }
  function slaLeadOp() {
    zetLeadMetingen(lid.id, actueel);
    setLeadOpen(false);
    setGekozen(null);
    onMelding(`Lead-toegang opgeslagen: ${actueel.length} ${actueel.length === 1 ? "Meting" : "Metingen"}.`);
  }
  function annuleerLead() {
    setLeadOpen(false);
    setGekozen(null);
  }
  function trekLeadIn() {
    zetLeadMetingen(lid.id, []);
    setIntrekkenOpen(false);
    setLeadOpen(false);
    setGekozen(null);
    onMelding("Lead-rol ingetrokken.");
  }

  /* ---------- Vragenlijst sturen ---------- */
  const beschikbaar = metingen.filter((m) => !m.invullingen.some((i) => i.organisatieLidId === lid.id));
  const [metingKeuze, setMetingKeuze] = useState("");
  const [nieuwAssessment, setNieuwAssessment] = useState("");
  const [nieuwLabel, setNieuwLabel] = useState("");
  const keuze = metingKeuze || (beschikbaar[0]?.id ?? NIEUWE_METING);
  const nieuweMeting = keuze === NIEUWE_METING;
  const kanSturen = nieuweMeting ? nieuwAssessment !== "" && nieuwLabel.trim() !== "" : beschikbaar.some((m) => m.id === keuze);

  function stuur() {
    if (!kanSturen) return;
    let metingId = keuze;
    let label = beschikbaar.find((m) => m.id === keuze)?.label ?? "";
    if (nieuweMeting) {
      const meting = maakScanUitvoering(organisatie.id, { assessmentId: nieuwAssessment, label: nieuwLabel.trim() });
      if (!meting) return;
      metingId = meting.id;
      label = meting.label;
    }
    // Is de Respondent Lead, dan geeft dezelfde stap hem ook toegang tot die Meting.
    const resultaat = nodigLidUit(metingId, lid.email, isLead);
    if (!resultaat) {
      onMelding("Versturen is niet gelukt.", true);
      return;
    }
    setMetingKeuze("");
    setNieuwAssessment("");
    setNieuwLabel("");
    onMelding(`Vragenlijst gestuurd voor Meting "${label}"${isLead ? ", met Lead-toegang tot die Meting" : ""}.`);
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
            <input
              type="checkbox"
              checked={vakjeAan}
              disabled={!magLead}
              onChange={(e) => onVakje(e.target.checked)}
            />
            <span className="font-semibold text-ink">Lead</span>
          </label>
          <p className="text-sm text-ink-m" style={{ margin: "0.2rem 0 0 1.6rem" }}>
            {isLead
              ? `Lead voor ${lid.leadMetingIds.length} ${lid.leadMetingIds.length === 1 ? "Meting" : "Metingen"}`
              : "Geen Lead"}
          </p>

          {vakjeAan && (
            <div style={{ margin: "0.7rem 0 0 1.6rem" }}>
              {metingen.length === 0 ? (
                <p className="overzicht-melding fout">Plan eerst een Meting voordat je Lead-toegang kunt geven.</p>
              ) : (
                <>
                  <div style={{ maxHeight: metingen.length > 5 ? "10.5rem" : undefined, overflowY: metingen.length > 5 ? "auto" : undefined }}>
                    {metingen.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 text-sm" style={{ padding: "0.25rem 0" }}>
                        <input type="checkbox" checked={actueel.includes(m.id)} onChange={(e) => toggleMeting(m.id, e.target.checked)} />
                        <span>
                          {m.label} <span className="text-ink-s">— {assessmentNaam(m.assessmentId)}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="knoppenrij" style={{ marginTop: "0.7rem" }}>
                    <button
                      type="button"
                      className="btn btn-or btn-compact"
                      disabled={actueel.length === 0 || (isLead && !gewijzigd)}
                      onClick={slaLeadOp}
                    >
                      Opslaan
                    </button>
                    <button type="button" className="btn btn-outline btn-compact" onClick={annuleerLead}>
                      Annuleren
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
            <input
              className="veld-compact"
              type="text"
              value={nieuwLabel}
              onChange={(e) => setNieuwLabel(e.target.value)}
              placeholder="Label van de nieuwe Meting"
              aria-label="Label van de nieuwe Meting"
             
            />
          </div>
        )}
      </section>

      <BevestigModal
        open={intrekkenOpen}
        titel="Lead-rol intrekken"
        bericht="Deze Respondent is dan geen Lead meer en ziet de resultaten en uitnodigingen van die Metingen niet meer. Zijn eigen scans blijven bestaan."
        bevestigLabel="Lead-rol intrekken"
        onBevestigen={trekLeadIn}
        onAnnuleren={() => setIntrekkenOpen(false)}
      />
    </>
  );
}
