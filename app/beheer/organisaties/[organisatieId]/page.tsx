"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useAssessment } from "@/lib/assessment-store";
import { useOrganisatie, updateOrganisatie, nodigRespondentUit, verwijderRespondenten } from "@/lib/db";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { voortgang } from "@/lib/scoring";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";
import { Respondent } from "@/lib/types";

const STATUS_LABEL: Record<Respondent["status"], string> = {
  uitgenodigd: "Uitgenodigd",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

export default function OrganisatieDetailPage({
  params,
}: {
  params: Promise<{ organisatieId: string }>;
}) {
  const { organisatieId } = use(params);
  const organisatie = useOrganisatie(organisatieId);
  const assessment = useAssessment(organisatie?.assessmentId ?? "");

  const [email, setEmail] = useState("");
  const [nieuweLink, setNieuweLink] = useState<string | null>(null);
  const [gekopieerdId, setGekopieerdId] = useState<string | null>(null);
  const [kenmerkenOpgeslagen, setKenmerkenOpgeslagen] = useState(false);
  const bulk = useBulkSelect(organisatie?.respondenten.map((r) => r.id) ?? []);

  if (!organisatie || !assessment) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Organisatie niet gevonden.</p>
      </div>
    );
  }
  const organisatieVast = organisatie;

  function kopieerLink(id: string, url: string) {
    navigator.clipboard.writeText(url);
    setGekopieerdId(id);
    setTimeout(() => setGekopieerdId((huidig) => (huidig === id ? null : huidig)), 1600);
  }

  function handleUitnodigen(e: React.FormEvent) {
    e.preventDefault();
    const respondent = nodigRespondentUit(organisatieId, email.trim());
    if (!respondent) return;
    setNieuweLink(maakPubliekeLink(window.location.origin, organisatieVast, respondent));
    setEmail("");
  }

  function handleVerwijderen() {
    const ids = [...bulk.selected];
    if (
      !window.confirm(
        `${ids.length} respondent(en) definitief verwijderen? Dit kan niet ongedaan gemaakt worden.`
      )
    )
      return;
    verwijderRespondenten(ids);
    bulk.clear();
  }

  function handleKenmerkenOpslaan(kenmerken: Record<string, unknown>) {
    updateOrganisatie(organisatieId, (o) => ({ ...o, kenmerken }));
    setKenmerkenOpgeslagen(true);
    setTimeout(() => setKenmerkenOpgeslagen(false), 1600);
  }

  return (
    <div className="admin-main">
      <Link href="/beheer/organisaties" className="admin-back">
        ← Organisaties
      </Link>
      <h1>{organisatie.naam}</h1>
      <p className="text-sm text-ink-s">{assessment.naam}</p>

      <h2>Respondent uitnodigen</h2>
      <form onSubmit={handleUitnodigen} className="flex gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="naam@organisatie.nl"
          className="admin-field flex-1"
          style={{ marginBottom: 0 }}
        />
        <button type="submit" className="btn btn-or">
          Uitnodigen
        </button>
      </form>
      {nieuweLink && (
        <div className="admin-notice mt-3">
          <p className="font-medium text-ink">
            Respondent aangemaakt. Deel deze publieke link handmatig (mail, chat) — er wordt niets
            automatisch verstuurd:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-bg px-2 py-1 text-xs">{nieuweLink}</code>
            <button
              type="button"
              onClick={() => kopieerLink("nieuw", nieuweLink)}
              className="btn btn-outline btn-compact"
            >
              {gekopieerdId === "nieuw" ? "Gekopieerd!" : "Kopieer"}
            </button>
          </div>
        </div>
      )}

      <h2>Respondenten</h2>
      {organisatie.respondenten.length === 0 ? (
        <p className="admin-notice">Nog geen respondenten uitgenodigd.</p>
      ) : (
        <>
          <BulkToolbar
            aantal={bulk.selected.size}
            onVerwijderen={handleVerwijderen}
            verwijderLabel="Respondenten verwijderen"
          />
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
                <th>Naam</th>
                <th>E-mail</th>
                <th>Status</th>
                <th>Voortgang</th>
                <th>Uitgenodigd</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {organisatie.respondenten.map((r) => {
                const { percentage } = voortgang(assessment, r.antwoorden);
                return (
                  <tr key={r.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={bulk.isSelected(r.id)}
                        onChange={() => bulk.toggle(r.id)}
                      />
                    </td>
                    <td>{r.naam || <em className="text-ink-s">{r.email}</em>}</td>
                    <td>{r.email}</td>
                    <td>
                      <span className={`admin-badge status-${r.status}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td>{percentage}%</td>
                    <td>{new Date(r.uitgenodigdOp).toLocaleDateString("nl-NL")}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          kopieerLink(r.id, maakPubliekeLink(window.location.origin, organisatieVast, r))
                        }
                        className="admin-sort-btn"
                      >
                        {gekopieerdId === r.id ? "Gekopieerd!" : "Kopieer link"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <h2>Organisatiekenmerken</h2>
      {assessment.organisatieVelden.length === 0 ? (
        <p className="admin-notice">Geen organisatievelden gedefinieerd.</p>
      ) : (
        <>
          <KenmerkenForm
            velden={assessment.organisatieVelden}
            waarden={organisatie.kenmerken}
            onChange={handleKenmerkenOpslaan}
          />
          <span className={`admin-save-state ${kenmerkenOpgeslagen ? "zichtbaar" : ""}`}>
            Opgeslagen ✓
          </span>
        </>
      )}
    </div>
  );
}
