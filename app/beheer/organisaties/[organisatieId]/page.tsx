"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessments, useAssessment } from "@/lib/assessment-store";
import { useOrganisatie, updateOrganisatie, maakScanUitvoering, nodigLidUit, verwijderLeden } from "@/lib/db";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { voortgang } from "@/lib/scoring";
import { organisatieVelden } from "@/data/organisatie-velden";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { Organisatie, ScanInvulling, ScanUitvoering } from "@/lib/types";

const STATUS_LABEL: Record<ScanInvulling["status"], string> = {
  uitgenodigd: "Uitgenodigd",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

function ScanUitvoeringBlok({
  organisatie,
  scanUitvoering,
  assessmentNaam,
}: {
  organisatie: Organisatie;
  scanUitvoering: ScanUitvoering;
  assessmentNaam: string;
}) {
  const assessment = useAssessment(scanUitvoering.assessmentId);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nieuweLink, setNieuweLink] = useState<string | null>(null);
  const [kopieerStatus, setKopieerStatus] = useState<{ id: string; gelukt: boolean } | null>(null);
  const bulk = useBulkSelect(scanUitvoering.invullingen.map((i) => i.organisatieLidId));

  async function kopieer(id: string, url: string) {
    const gelukt = await kopieerNaarKlembord(url);
    setKopieerStatus({ id, gelukt });
    setTimeout(() => setKopieerStatus((h) => (h?.id === id ? null : h)), 1600);
  }

  function handleUitnodigen(e: React.FormEvent) {
    e.preventDefault();
    const resultaat = nodigLidUit(scanUitvoering.id, email.trim());
    if (!resultaat) return;
    setNieuweLink(maakPubliekeLink(window.location.origin, resultaat.lid));
    setEmail("");
  }

  const [verwijderenOpen, setVerwijderenOpen] = useState(false);

  function handleVerwijderenBevestigd() {
    verwijderLeden([...bulk.selected]);
    bulk.clear();
    setVerwijderenOpen(false);
  }

  const afgerond = scanUitvoering.invullingen.filter((i) => i.status === "afgerond").length;

  return (
    <details className="admin-bouwblok-card" open>
      <summary>
        <span className="admin-bouwblok-titel">
          {scanUitvoering.label} — {assessmentNaam}
        </span>
        <span className="text-xs" style={{ color: "var(--ink-s)" }}>
          {scanUitvoering.invullingen.length} respondenten, {afgerond} afgerond
        </span>
      </summary>

      <div className="mt-3">
        <div className="flex gap-3 items-start">
          <form onSubmit={handleUitnodigen} className="flex flex-1 gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@organisatie.nl"
              className="admin-field flex-1"
              style={{ marginBottom: 0 }}
            />
            <button type="submit" className="btn btn-or btn-compact">
              Uitnodigen
            </button>
          </form>
          <button
            type="button"
            disabled={afgerond === 0}
            title={afgerond === 0 ? "Nog geen afgeronde scans voor deze meting" : undefined}
            onClick={() => router.push(`/beheer/rapportage/${scanUitvoering.id}`)}
            className="btn btn-outline btn-compact"
          >
            Rapportage
          </button>
        </div>
        {nieuweLink && (
          <div className="admin-notice mt-3">
            <p className="font-medium text-ink">
              Lid uitgenodigd. Deel deze publieke link handmatig (mail, chat) — er wordt niets
              automatisch verstuurd:
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-bg px-2 py-1 text-xs">{nieuweLink}</code>
              <button
                type="button"
                onClick={() => kopieer("nieuw", nieuweLink)}
                className="btn btn-outline btn-compact"
              >
                {kopieerStatus?.id === "nieuw"
                  ? kopieerStatus.gelukt
                    ? "Gekopieerd!"
                    : "Mislukt, probeer opnieuw"
                  : "Kopieer"}
              </button>
            </div>
          </div>
        )}

        {scanUitvoering.invullingen.length === 0 ? (
          <p className="admin-notice mt-3">Nog geen respondenten uitgenodigd voor deze scan.</p>
        ) : (
          <>
            <BulkToolbar
              aantal={bulk.selected.size}
              onVerwijderen={() => setVerwijderenOpen(true)}
              verwijderLabel="Respondenten verwijderen"
            />
            <BevestigModal
              open={verwijderenOpen}
              titel="Respondenten verwijderen"
              bericht={`${bulk.selected.size} respondent(en) definitief verwijderen? Dit kan niet ongedaan gemaakt worden.`}
              bevestigLabel="Respondenten verwijderen"
              onBevestigen={handleVerwijderenBevestigd}
              onAnnuleren={() => setVerwijderenOpen(false)}
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
                {scanUitvoering.invullingen.map((invulling) => {
                  const lid = organisatie.leden.find((l) => l.id === invulling.organisatieLidId);
                  if (!lid) return null;
                  const { percentage } = assessment
                    ? voortgang(assessment, invulling.antwoorden)
                    : { percentage: 0 };
                  return (
                    <tr key={invulling.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={bulk.isSelected(lid.id)}
                          onChange={() => bulk.toggle(lid.id)}
                        />
                      </td>
                      <td>{lid.naam || <em className="text-ink-s">{lid.email}</em>}</td>
                      <td>{lid.email}</td>
                      <td>
                        <span className={`admin-badge status-${invulling.status}`}>
                          {STATUS_LABEL[invulling.status]}
                        </span>
                      </td>
                      <td>{percentage}%</td>
                      <td>{new Date(invulling.uitgenodigdOp).toLocaleDateString("nl-NL")}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            kopieer(invulling.id, maakPubliekeLink(window.location.origin, lid))
                          }
                          className="admin-sort-btn"
                        >
                          {kopieerStatus?.id === invulling.id
                            ? kopieerStatus.gelukt
                              ? "Gekopieerd!"
                              : "Mislukt, opnieuw"
                            : "Kopieer link"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </details>
  );
}

export default function OrganisatieDetailPage({
  params,
}: {
  params: Promise<{ organisatieId: string }>;
}) {
  const { organisatieId } = use(params);
  const organisatie = useOrganisatie(organisatieId);
  const assessments = useAssessments();
  const [kenmerkenOpgeslagen, setKenmerkenOpgeslagen] = useState(false);
  const [nieuweScanAssessmentId, setNieuweScanAssessmentId] = useState("");
  const [nieuweScanLabel, setNieuweScanLabel] = useState("Nulmeting");

  if (!organisatie) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Organisatie niet gevonden.</p>
      </div>
    );
  }

  const assessmentIdVoorForm = nieuweScanAssessmentId || assessments[0]?.id || "";

  function handleKenmerkenOpslaan(kenmerken: Record<string, unknown>) {
    updateOrganisatie(organisatieId, (o) => ({ ...o, kenmerken }));
    setKenmerkenOpgeslagen(true);
    setTimeout(() => setKenmerkenOpgeslagen(false), 1600);
  }

  function handleNieuweScan(e: React.FormEvent) {
    e.preventDefault();
    if (!assessmentIdVoorForm) return;
    maakScanUitvoering(organisatieId, {
      assessmentId: assessmentIdVoorForm,
      label: nieuweScanLabel.trim() || "Nulmeting",
    });
    setNieuweScanLabel("Nulmeting");
  }

  return (
    <div className="admin-main">
      <Link href="/beheer/organisaties" className="admin-back">
        ← Organisaties
      </Link>
      <h1>{organisatie.naam}</h1>

      <h2>Metingen</h2>
      <form onSubmit={handleNieuweScan} className="flex flex-wrap items-end gap-3 mb-4">
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label>Assessment-type</label>
          <select
            value={assessmentIdVoorForm}
            onChange={(e) => setNieuweScanAssessmentId(e.target.value)}
          >
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.naam}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label>Label</label>
          <input
            type="text"
            value={nieuweScanLabel}
            onChange={(e) => setNieuweScanLabel(e.target.value)}
            placeholder="Nulmeting 2026"
          />
        </div>
        <button type="submit" className="btn btn-or btn-compact">
          + Meting plannen
        </button>
      </form>

      {organisatie.scanUitvoeringen.length === 0 ? (
        <p className="admin-notice">Nog geen meting gepland voor deze organisatie.</p>
      ) : (
        organisatie.scanUitvoeringen.map((s) => (
          <ScanUitvoeringBlok
            key={s.id}
            organisatie={organisatie}
            scanUitvoering={s}
            assessmentNaam={assessments.find((a) => a.id === s.assessmentId)?.naam ?? "Onbekend type"}
          />
        ))
      )}

      <h2>Organisatiekenmerken</h2>
      {organisatieVelden.length === 0 ? (
        <p className="admin-notice">Geen organisatievelden gedefinieerd.</p>
      ) : (
        <>
          <KenmerkenForm
            velden={organisatieVelden}
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
