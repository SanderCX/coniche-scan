"use client";

import { useState } from "react";
import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties, verwijderOrganisaties } from "@/lib/db";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";
import { BevestigModal } from "@/components/beheer/BevestigModal";

export default function OrganisatiesPage() {
  const assessments = useAssessments();
  const organisaties = useOrganisaties();
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
              return (
                <div key={org.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bulk.isSelected(org.id)}
                    onChange={() => bulk.toggle(org.id)}
                  />
                  <Link href={`/beheer/organisaties/${org.id}`} className="admin-row flex-1">
                    <div>
                      <p className="admin-row-titel">{org.naam}</p>
                      <p className="admin-row-sub">
                        {org.scanUitvoeringen.length === 0
                          ? "Nog geen scan gepland"
                          : scanNamen}{" "}
                        · {org.leden.length} respondenten, {afgerond} afgerond
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
