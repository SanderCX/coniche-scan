"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRespondent } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { alleBouwblokkenMetGroep } from "@/lib/assessment-structuur";
import { bouwblokScore, overallScore, classificatie, voortgang } from "@/lib/scoring";
import { CLASSIFICATIE_INFO, ANTWOORD_KLEUR } from "@/lib/colors";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { Respondent } from "@/lib/types";

const STATUS_LABEL: Record<Respondent["status"], string> = {
  uitgenodigd: "Uitgenodigd",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

export default function ScanDetailPage({
  params,
}: {
  params: Promise<{ respondentId: string }>;
}) {
  const { respondentId } = use(params);
  const gegevens = useRespondent(respondentId);
  const assessment = useAssessment(gegevens?.organisatie.assessmentId ?? "");
  const [gekopieerd, setGekopieerd] = useState(false);

  if (!gegevens || !assessment) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Scan niet gevonden.</p>
      </div>
    );
  }

  const { organisatie, respondent } = gegevens;
  const bouwblokken = alleBouwblokkenMetGroep(assessment);
  const scores = bouwblokken.map((b) => bouwblokScore(b.bouwblok, respondent.antwoorden));
  const overall = overallScore(scores);
  const { percentage } = voortgang(assessment, respondent.antwoorden);

  function kopieerLink() {
    navigator.clipboard.writeText(maakPubliekeLink(window.location.origin, organisatie, respondent));
    setGekopieerd(true);
    setTimeout(() => setGekopieerd(false), 1600);
  }

  return (
    <div className="admin-main">
      <Link href="/beheer/scans" className="admin-back">
        ← Ingevulde scans
      </Link>
      <h1>{respondent.naam || respondent.email}</h1>
      <p className="text-sm text-ink-s">{organisatie.naam}</p>

      <div className="admin-field mt-6" style={{ maxWidth: "34rem" }}>
        <label>Publieke link</label>
        <div className="flex items-center gap-2">
          <input type="text" readOnly value={maakPubliekeLink(typeof window !== "undefined" ? window.location.origin : "", organisatie, respondent)} />
          <button type="button" onClick={kopieerLink} className="btn btn-outline btn-compact">
            {gekopieerd ? "Gekopieerd!" : "Kopieer"}
          </button>
        </div>
      </div>

      <div className="admin-detail-meta">
        <div>
          <p className="label">Assessment</p>
          <p className="waarde">{assessment.naam}</p>
        </div>
        <div>
          <p className="label">Rol / team</p>
          <p className="waarde">{[respondent.rol, respondent.team].filter(Boolean).join(" / ") || "—"}</p>
        </div>
        <div>
          <p className="label">Status</p>
          <p className="waarde">
            <span className={`admin-badge status-${respondent.status}`}>
              {STATUS_LABEL[respondent.status]}
            </span>
          </p>
        </div>
        <div>
          <p className="label">Voortgang</p>
          <p className="waarde">{percentage}%</p>
        </div>
        <div>
          <p className="label">Uitgenodigd</p>
          <p className="waarde">{new Date(respondent.uitgenodigdOp).toLocaleDateString("nl-NL")}</p>
        </div>
        <div>
          <p className="label">Gestart</p>
          <p className="waarde">
            {respondent.gestartOp ? new Date(respondent.gestartOp).toLocaleDateString("nl-NL") : "—"}
          </p>
        </div>
        <div>
          <p className="label">Afgerond</p>
          <p className="waarde">
            {respondent.afgerondOp ? new Date(respondent.afgerondOp).toLocaleDateString("nl-NL") : "—"}
          </p>
        </div>
        {overall !== null && (
          <div>
            <p className="label">Overall score</p>
            <p className="waarde" style={{ color: CLASSIFICATIE_INFO[classificatie(overall)].kleur }}>
              {overall.toFixed(1)}
            </p>
          </div>
        )}
      </div>

      {respondent.notities && (
        <div className="admin-notice">
          <strong>Notities:</strong> {respondent.notities}
        </div>
      )}

      <h2>Antwoorden per {assessment.bouwblokEenheidEnkelvoud.toLowerCase()}</h2>
      {bouwblokken.map(({ bouwblok }) => {
        const opmerking = respondent.opmerkingenPerBouwblok[bouwblok.id];
        return (
          <details key={bouwblok.id} className="admin-bouwblok-card">
            <summary>
              {bouwblok.volgnummer}. {bouwblok.naam}
            </summary>
            <table className="admin-table mt-3">
              <tbody>
                {bouwblok.vragen.map((vraag) => {
                  const antwoord = respondent.antwoorden[vraag.id];
                  const kleur = typeof antwoord === "number" ? ANTWOORD_KLEUR[antwoord] : null;
                  return (
                    <tr key={vraag.id}>
                      <td style={{ width: "70%" }}>{vraag.tekst}</td>
                      <td className="antwoord-cel">
                        {kleur ? (
                          <span
                            className="antwoord-badge"
                            style={{ background: kleur.bg, color: kleur.text }}
                          >
                            {antwoord}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {opmerking && (
              <p className="mt-2 text-sm text-ink-m">
                <strong>Opmerking:</strong> {opmerking}
              </p>
            )}
          </details>
        );
      })}
    </div>
  );
}
