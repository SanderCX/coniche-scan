"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisatie, updateOrganisatie, maakScanUitvoering, voegLeadToe } from "@/lib/db";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { voortgang } from "@/lib/scoring";
import { organisatieVelden } from "@/data/organisatie-velden";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { RespondentStatusBadge, STATUS_LABEL } from "@/components/beheer/overzicht-helpers";
import { Organisatie, ScanUitvoering } from "@/lib/types";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magOrganisatieToegang, magOrganisatieToewijzen, magLeadToekennen } from "@/lib/rechten";
import { useGebruikers } from "@/lib/gebruikers-store";
import { useBeheerOverzicht } from "@/lib/beheer-url";

/** Aantal rijen per lijst op de detailpagina (beheerpagina.md, punt 4, "Lange lijsten"). */
const MAX_RIJEN = 5;

/**
 * "+ Lead toevoegen" (beheerpagina.md punt 6a): nieuwe actie op
 * organisatieniveau. Bestaande Leads staan in de lijst Respondenten (met
 * het label Lead), hun toegang beheer je in het Respondent-overzicht.
 */
function LeadToevoegen({ organisatie }: { organisatie: Organisatie }) {
  const assessments = useAssessments();
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [metingIds, setMetingIds] = useState<string[]>([]);
  const [nieuweLink, setNieuweLink] = useState<string | null>(null);
  const [kopieerGelukt, setKopieerGelukt] = useState<boolean | null>(null);

  function metingLabel(s: ScanUitvoering): string {
    const naamAssessment = assessments.find((a) => a.id === s.assessmentId)?.naam ?? "Onbekend type";
    return `${s.label} — ${naamAssessment}`;
  }

  async function kopieer(url: string) {
    setKopieerGelukt(await kopieerNaarKlembord(url));
    setTimeout(() => setKopieerGelukt(null), 1600);
  }

  function handleToevoegen(e: React.FormEvent) {
    e.preventDefault();
    if (metingIds.length === 0) return;
    const lid = voegLeadToe(organisatie.id, { naam, email, metingIds });
    if (!lid) return;
    setNieuweLink(maakPubliekeLink(window.location.origin, lid));
    setNaam("");
    setEmail("");
    setMetingIds([]);
  }

  if (organisatie.scanUitvoeringen.length === 0) return null;

  return (
    <details className="admin-bouwblok-card" style={{ marginTop: "1rem" }}>
      <summary>
        <span className="admin-bouwblok-titel">+ Lead toevoegen</span>
      </summary>
      <form onSubmit={handleToevoegen} className="mt-3 flex flex-col gap-3" style={{ maxWidth: "28rem" }}>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label>Naam</label>
          <input type="text" value={naam} onChange={(e) => setNaam(e.target.value)} />
        </div>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label>E-mailadres</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="naam@organisatie.nl" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Toegang tot Metingen (minstens 1)</label>
          <div className="mt-1 flex flex-col gap-1">
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
        </div>
        <button type="submit" disabled={metingIds.length === 0} className="btn btn-or btn-compact self-start">
          Lead toevoegen
        </button>
      </form>
      {nieuweLink && (
        <div className="admin-notice mt-3">
          <p className="font-medium text-ink">Lead toegevoegd. Deel deze link handmatig:</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-bg px-2 py-1 text-xs">{nieuweLink}</code>
            <button type="button" onClick={() => kopieer(nieuweLink)} className="btn btn-outline btn-compact">
              {kopieerGelukt === null ? "Kopieer" : kopieerGelukt ? "Gekopieerd!" : "Mislukt, probeer opnieuw"}
            </button>
            <a href={nieuweLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-compact">
              Openen
            </a>
          </div>
        </div>
      )}
    </details>
  );
}

export default function OrganisatieDetailPage({ params }: { params: Promise<{ organisatieId: string }> }) {
  const { organisatieId } = use(params);
  const organisatie = useOrganisatie(organisatieId);
  const assessments = useAssessments();
  const ingelogd = useIngelogdeGebruiker();
  const alleGebruikers = useGebruikers();
  const router = useRouter();
  const { open } = useBeheerOverzicht();
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

  // Bereik "eigen": een Consultant mag alleen organisaties bewerken die hij zelf aanmaakte of
  // waaraan een Admin hem toewees (datamodel.md deel 2, Rechtenmatrix).
  if (!magOrganisatieToegang(ingelogd, organisatie)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">
          Geen toegang: deze organisatie is niet door jou aangemaakt en ook niet aan jou toegewezen.
        </p>
      </div>
    );
  }

  const assessmentIdVoorForm = nieuweScanAssessmentId || assessments[0]?.id || "";
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";

  function handleKenmerkenOpslaan(kenmerken: Record<string, unknown>) {
    updateOrganisatie(organisatieId, (o) => ({ ...o, kenmerken }));
    setKenmerkenOpgeslagen(true);
    setTimeout(() => setKenmerkenOpgeslagen(false), 1600);
  }

  function handleToegangWisselen(consultantId: string, toegewezen: boolean) {
    updateOrganisatie(organisatieId, (o) => ({
      ...o,
      toegewezenAan: toegewezen ? [...o.toegewezenAan, consultantId] : o.toegewezenAan.filter((id) => id !== consultantId),
    }));
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

  const eigenaar = alleGebruikers.find((g) => g.id === organisatie.aangemaaktDoor);
  const toegewezenGebruikers = alleGebruikers.filter((g) => organisatie.toegewezenAan.includes(g.id));
  const toeTeWijzenKandidaten = alleGebruikers.filter(
    (g) => g.actief && g.rol === "consultant" && g.id !== organisatie.aangemaaktDoor
  );

  const scans = organisatie.scanUitvoeringen.flatMap((meting) =>
    meting.invullingen.flatMap((invulling) => {
      const lid = organisatie.leden.find((l) => l.id === invulling.organisatieLidId);
      return lid ? [{ meting, invulling, lid }] : [];
    })
  );

  return (
    <div className="admin-main">
      <Kruimelpad delen={[{ label: "Organisaties", href: "/beheer/organisaties" }, { label: organisatie.naam }]} />
      <h1>{organisatie.naam}</h1>
      <p className="text-sm text-ink-m">
        Aangemaakt door: {eigenaar ? eigenaar.naam : "onbekend"}
        {toegewezenGebruikers.length > 0 && ` · Ook toegewezen aan: ${toegewezenGebruikers.map((g) => g.naam).join(", ")}`}
      </p>

      {magOrganisatieToewijzen(ingelogd) && toeTeWijzenKandidaten.length > 0 && (
        <details className="admin-notice mt-3 mb-6" style={{ maxWidth: "28rem" }}>
          <summary className="cursor-pointer font-medium text-ink">Organisatie-toegang toewijzen</summary>
          <p className="mt-2 text-sm text-ink-m">
            Geeft een andere Consultant toegang tot deze organisatie, bovenop het eigenaarschap van{" "}
            {eigenaar ? eigenaar.naam : "de aanmaker"}.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {toeTeWijzenKandidaten.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={organisatie.toegewezenAan.includes(c.id)}
                  onChange={(e) => handleToegangWisselen(c.id, e.target.checked)}
                />
                {c.naam} ({c.email})
              </label>
            ))}
          </div>
        </details>
      )}

      <h2>Metingen</h2>
      <form onSubmit={handleNieuweScan} className="flex flex-wrap items-end gap-3 mb-4">
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label>Assessment-type</label>
          <select value={assessmentIdVoorForm} onChange={(e) => setNieuweScanAssessmentId(e.target.value)}>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.naam}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label>Label</label>
          <input type="text" value={nieuweScanLabel} onChange={(e) => setNieuweScanLabel(e.target.value)} placeholder="Nulmeting 2026" />
        </div>
        <button type="submit" className="btn btn-or btn-compact">
          + Meting plannen
        </button>
      </form>

      {organisatie.scanUitvoeringen.length === 0 ? (
        <p className="admin-notice">Nog geen meting gepland voor deze organisatie.</p>
      ) : (
        <table className="admin-table">
          <tbody>
            {organisatie.scanUitvoeringen.map((s) => {
              const afgerond = s.invullingen.filter((i) => i.status === "afgerond").length;
              return (
                <tr key={s.id} className="admin-table-rij-klikbaar" onClick={() => router.push(`/beheer/metingen/${s.id}`)}>
                  <td>
                    <strong>{s.label}</strong> <span className="text-ink-s">— {assessmentNaam(s.assessmentId)}</span>
                  </td>
                  <td>
                    {s.invullingen.length} respondent{s.invullingen.length === 1 ? "" : "en"}, {afgerond} afgerond
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={`/beheer/metingen/${s.id}`} className="admin-bekijk-knop" onClick={(e) => e.stopPropagation()}>
                      Bekijk &gt;&gt;
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <h2>Respondenten</h2>
      {organisatie.leden.length === 0 ? (
        <p className="admin-notice">Nog geen respondenten. Nodig ze uit vanuit een Meting.</p>
      ) : (
        <>
          <table className="admin-table">
            <tbody>
              {organisatie.leden.slice(0, MAX_RIJEN).map((lid) => {
                const invullingen = organisatie.scanUitvoeringen.flatMap((s) =>
                  s.invullingen.filter((i) => i.organisatieLidId === lid.id)
                );
                return (
                  <tr key={lid.id} className="admin-table-rij-klikbaar" onClick={() => open("respondent", lid.id)}>
                    <td>
                      {lid.naam || <em className="text-ink-s">{lid.email}</em>}{" "}
                      {lid.leadMetingIds.length > 0 && <span className="lead-badge">Lead</span>}
                    </td>
                    <td>{lid.email}</td>
                    <td>
                      <RespondentStatusBadge invullingen={invullingen} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="admin-bekijk-knop" onClick={() => open("respondent", lid.id)}>
                        Bekijk &gt;&gt;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {organisatie.leden.length > MAX_RIJEN && (
            <Link href={`/beheer/respondenten?organisatie=${organisatie.id}`} className="lijst-meer-link">
              Alle respondenten van deze organisatie →
            </Link>
          )}
        </>
      )}
      {magLeadToekennen(ingelogd, organisatie) && <LeadToevoegen organisatie={organisatie} />}

      <h2>Ingevulde scans</h2>
      {scans.length === 0 ? (
        <p className="admin-notice">Nog geen scans.</p>
      ) : (
        <>
          <table className="admin-table">
            <tbody>
              {scans.slice(0, MAX_RIJEN).map(({ meting, invulling, lid }) => {
                const assessment = assessments.find((a) => a.id === meting.assessmentId);
                const { percentage } = assessment ? voortgang(assessment, invulling.antwoorden) : { percentage: 0 };
                return (
                  <tr key={invulling.id} className="admin-table-rij-klikbaar" onClick={() => open("scan", invulling.id)}>
                    <td>{lid.naam || <em className="text-ink-s">{lid.email}</em>}</td>
                    <td>
                      {meting.label} <span className="text-ink-s">— {assessmentNaam(meting.assessmentId)}</span>
                    </td>
                    <td>
                      <span className={`admin-badge status-${invulling.status}`}>{STATUS_LABEL[invulling.status]}</span>
                    </td>
                    <td>{percentage}%</td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="admin-bekijk-knop" onClick={() => open("scan", invulling.id)}>
                        Bekijk &gt;&gt;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {scans.length > MAX_RIJEN && (
            <Link href={`/beheer/scans?organisatie=${organisatie.id}`} className="lijst-meer-link">
              Alle ingevulde scans van deze organisatie →
            </Link>
          )}
        </>
      )}

      <h2>Organisatiekenmerken</h2>
      {organisatieVelden.length === 0 ? (
        <p className="admin-notice">Geen organisatievelden gedefinieerd.</p>
      ) : (
        <>
          <KenmerkenForm velden={organisatieVelden} waarden={organisatie.kenmerken} onChange={handleKenmerkenOpslaan} />
          <span className={`admin-save-state ${kenmerkenOpgeslagen ? "zichtbaar" : ""}`}>Opgeslagen ✓</span>
        </>
      )}
    </div>
  );
}
