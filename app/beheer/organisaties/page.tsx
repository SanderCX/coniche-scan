"use client";

import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties, verwijderOrganisaties } from "@/lib/db";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";

export default function OrganisatiesPage() {
  const assessments = useAssessments();
  const organisaties = useOrganisaties();
  const bulk = useBulkSelect(organisaties.map((o) => o.id));

  function handleVerwijderen() {
    const ids = [...bulk.selected];
    const respondentAantal = organisaties
      .filter((o) => ids.includes(o.id))
      .reduce((sum, o) => sum + o.respondenten.length, 0);
    const melding =
      respondentAantal > 0
        ? `${ids.length} organisatie(s) verwijderen? Dit verwijdert ook ${respondentAantal} respondent(en) en hun ingevulde antwoorden. Dit kan niet ongedaan gemaakt worden.`
        : `${ids.length} organisatie(s) verwijderen? Dit kan niet ongedaan gemaakt worden.`;
    if (!window.confirm(melding)) return;
    verwijderOrganisaties(ids);
    bulk.clear();
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

          <BulkToolbar aantal={bulk.selected.size} onVerwijderen={handleVerwijderen} />

          <div className="admin-list">
            {organisaties.map((org) => {
              const assessment = assessments.find((a) => a.id === org.assessmentId);
              const afgerond = org.respondenten.filter((r) => r.status === "afgerond").length;
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
                        {assessment?.naam ?? "Onbekend type"} · {org.respondenten.length}{" "}
                        respondenten, {afgerond} afgerond
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
