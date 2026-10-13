"use client";

import { useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { voegLeadToe, LeadBereikKeuze } from "@/lib/db";
import { Organisatie, OrganisatieLid, ScanUitvoering } from "@/lib/types";

/**
 * Het formulier "Lead toevoegen" (`beheerpagina.md`, punt 6a): Naam, e-mailadres en een verplichte keuze van het bereik,
 * Specifieke Metingen (1 of meer) of de hele organisatie. Dezelfde keuze als bij "Lead-toegang beheren" in het blok
 * Toegang. Eén component voor de knop op het organisatie-detail en voor de modal op een benchmarkview, waar het bereik
 * al is voorgekozen (`benchmark.md`, Toewijzen aan een Lead op alle niveaus).
 */
export const LEAD_HELE_ORGANISATIE_WAARSCHUWING = "Deze Lead ziet ook Metingen die later worden aangemaakt.";

export function LeadToevoegenFormulier({
  organisatie,
  voorgekozen,
  onToegevoegd,
  onAnnuleren,
}: {
  organisatie: Organisatie;
  /** Het bereik dat al is gekozen als het formulier opent. Standaard Specifieke Metingen zonder keuze. */
  voorgekozen?: LeadBereikKeuze;
  onToegevoegd: (lid: OrganisatieLid) => void;
  onAnnuleren?: () => void;
}) {
  const assessments = useAssessments();
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [soort, setSoort] = useState<"metingen" | "organisatie">(voorgekozen?.soort ?? "metingen");
  const [metingIds, setMetingIds] = useState<string[]>(voorgekozen?.soort === "metingen" ? voorgekozen.metingIds : []);
  const geenMetingen = organisatie.scanUitvoeringen.length === 0;
  const kanOpslaan = email.trim() !== "" && (soort === "organisatie" || metingIds.length > 0);

  function metingLabel(s: ScanUitvoering): string {
    const naamAssessment = assessments.find((a) => a.id === s.assessmentId)?.naam ?? "Onbekend type";
    return `${s.label} — ${naamAssessment}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kanOpslaan) return;
    const lid = voegLeadToe(organisatie.id, {
      naam,
      email,
      bereik: soort === "organisatie" ? { soort: "organisatie" } : { soort: "metingen", metingIds },
    });
    if (lid) onToegevoegd(lid);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" style={{ maxWidth: "28rem" }}>
      <div className="admin-field" style={{ marginBottom: 0 }}>
        <label>Naam</label>
        <input type="text" value={naam} onChange={(e) => setNaam(e.target.value)} />
      </div>
      <div className="admin-field" style={{ marginBottom: 0 }}>
        <label>E-mailadres</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="naam@organisatie.nl" />
      </div>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="text-sm font-medium text-ink">Bereik</legend>
        <label className="flex items-center gap-2 text-sm" style={{ padding: "0.25rem 0" }}>
          <input
            type="radio"
            name="lead-bereik"
            checked={soort === "metingen"}
            disabled={geenMetingen}
            onChange={() => setSoort("metingen")}
          />
          Specifieke Metingen (minstens 1)
        </label>
        {soort === "metingen" && !geenMetingen && (
          <div className="flex flex-col gap-1" style={{ margin: "0.2rem 0 0.4rem 1.6rem" }}>
            {organisatie.scanUitvoeringen.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={metingIds.includes(s.id)}
                  onChange={(e) =>
                    setMetingIds((huidig) => (e.target.checked ? [...huidig, s.id] : huidig.filter((id) => id !== s.id)))
                  }
                />
                {metingLabel(s)}
              </label>
            ))}
          </div>
        )}
        <label className="flex items-center gap-2 text-sm" style={{ padding: "0.25rem 0" }}>
          <input type="radio" name="lead-bereik" checked={soort === "organisatie"} onChange={() => setSoort("organisatie")} />
          Hele organisatie
        </label>
        {soort === "organisatie" && (
          <p className="admin-notice" style={{ margin: "0.4rem 0 0 1.6rem" }}>
            {LEAD_HELE_ORGANISATIE_WAARSCHUWING}
          </p>
        )}
        {geenMetingen && <p className="text-sm text-ink-m">Deze organisatie heeft nog geen Metingen.</p>}
      </fieldset>
      <div className="knoppenrij">
        <button type="submit" disabled={!kanOpslaan} className="btn btn-or btn-compact">
          Lead toevoegen
        </button>
        {onAnnuleren && (
          <button type="button" className="btn btn-outline btn-compact" onClick={onAnnuleren}>
            Annuleren
          </button>
        )}
      </div>
    </form>
  );
}
