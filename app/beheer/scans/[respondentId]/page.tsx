"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useScanInvulling } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { alleBouwblokkenMetGroep } from "@/lib/assessment-structuur";
import { bouwblokScore, overallScore, voortgang } from "@/lib/scoring";
import { ANTWOORD_KLEUR, scoreKleur } from "@/lib/colors";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { ScanInvulling } from "@/lib/types";

const STATUS_LABEL: Record<ScanInvulling["status"], string> = {
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
  const gegevens = useScanInvulling(respondentId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const [kopieerStatus, setKopieerStatus] = useState<"idle" | "gelukt" | "mislukt">("idle");

  if (!gegevens || !assessment) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Scan niet gevonden.</p>
      </div>
    );
  }

  const { organisatie, scanUitvoering, lid, invulling } = gegevens;
  const bouwblokken = alleBouwblokkenMetGroep(assessment);
  const scores = bouwblokken.map((b) => bouwblokScore(b.bouwblok, invulling.antwoorden));
  const overall = overallScore(scores);
  const { percentage } = voortgang(assessment, invulling.antwoorden);

  async function kopieerLink() {
    const gelukt = await kopieerNaarKlembord(maakPubliekeLink(window.location.origin, lid));
    setKopieerStatus(gelukt ? "gelukt" : "mislukt");
    setTimeout(() => setKopieerStatus("idle"), 1600);
  }

  return (
    <div className="admin-main">
      <Link href="/beheer/scans" className="admin-back">
        ← Ingevulde scans
      </Link>
      <h1>{lid.naam || lid.email}</h1>
      <p className="text-sm text-ink-s">
        {organisatie.naam} · {scanUitvoering.label}
      </p>

      <div className="admin-field mt-6" style={{ maxWidth: "34rem" }}>
        <label>Publieke link</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={typeof window !== "undefined" ? maakPubliekeLink(window.location.origin, lid) : ""}
          />
          <button type="button" onClick={kopieerLink} className="btn btn-outline btn-compact">
            {kopieerStatus === "gelukt"
              ? "Gekopieerd!"
              : kopieerStatus === "mislukt"
                ? "Mislukt, probeer opnieuw"
                : "Kopieer"}
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
          <p className="waarde">{[lid.functie, lid.team].filter(Boolean).join(" / ") || "—"}</p>
        </div>
        <div>
          <p className="label">Status</p>
          <p className="waarde">
            <span className={`admin-badge status-${invulling.status}`}>
              {STATUS_LABEL[invulling.status]}
            </span>
          </p>
        </div>
        <div>
          <p className="label">Voortgang</p>
          <p className="waarde">{percentage}%</p>
        </div>
        <div>
          <p className="label">Uitgenodigd</p>
          <p className="waarde">{new Date(invulling.uitgenodigdOp).toLocaleDateString("nl-NL")}</p>
        </div>
        <div>
          <p className="label">Gestart</p>
          <p className="waarde">
            {invulling.gestartOp ? new Date(invulling.gestartOp).toLocaleDateString("nl-NL") : "—"}
          </p>
        </div>
        <div>
          <p className="label">Afgerond</p>
          <p className="waarde">
            {invulling.afgerondOp ? new Date(invulling.afgerondOp).toLocaleDateString("nl-NL") : "—"}
          </p>
        </div>
        {overall !== null && (
          <div>
            <p className="label">Overall score</p>
            <p className="waarde" style={{ color: scoreKleur(overall) }}>
              {overall.toFixed(1)}
            </p>
          </div>
        )}
      </div>

      {lid.notities && (
        <div className="admin-notice">
          <strong>Notities:</strong> {lid.notities}
        </div>
      )}

      <h2>Antwoorden per {assessment.bouwblokEenheidEnkelvoud.toLowerCase()}</h2>
      {bouwblokken.map(({ bouwblok }) => {
        const opmerking = invulling.opmerkingenPerBouwblok[bouwblok.id];
        const score = bouwblokScore(bouwblok, invulling.antwoorden);
        return (
          <details key={bouwblok.id} className="admin-bouwblok-card">
            <summary>
              <span className="admin-bouwblok-titel">
                {bouwblok.volgnummer}. {bouwblok.naam}
              </span>
              {score !== null && (
                <span
                  className="admin-bouwblok-score"
                  style={{ color: scoreKleur(score) }}
                >
                  {score.toFixed(1)}
                </span>
              )}
            </summary>
            <table className="admin-table mt-3">
              <tbody>
                {bouwblok.vragen.map((vraag) => {
                  const antwoord = invulling.antwoorden[vraag.id];
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
