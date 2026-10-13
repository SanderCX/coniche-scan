"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisatie, updateOrganisatie, hernoemOrganisatie } from "@/lib/db";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { voortgang } from "@/lib/scoring";
import { organisatieVelden } from "@/data/organisatie-velden";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";
import { BenchmarkVlag } from "@/components/beheer/BenchmarkVlag";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { RespondentStatusBadge, STATUS_LABEL } from "@/components/beheer/overzicht-helpers";
import { Organisatie } from "@/lib/types";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren, magOrganisatieToegang, magOrganisatieToewijzen, magLeadToekennen } from "@/lib/rechten";
import { useGebruikers } from "@/lib/gebruikers-store";
import { useBeheerOverzicht } from "@/lib/beheer-url";
import { MetBewerkslot } from "@/components/beheer/MetBewerkslot";
import { LeadToevoegenFormulier } from "@/components/beheer/LeadToevoegenFormulier";
import { MetingenSectie } from "@/components/beheer/MetingenSectie";
import { isLead } from "@/lib/lead";

/** Aantal rijen per lijst op de detailpagina (beheerpagina.md, punt 4, "Lange lijsten"). */
const MAX_RIJEN = 5;

/**
 * "+ Lead toevoegen" (beheerpagina.md punt 6a): nieuwe actie op organisatieniveau. Bestaande Leads staan in de lijst
 * Respondenten (met het label Lead), hun toegang beheer je in het Respondent-overzicht. Het formulier staat in
 * `LeadToevoegenFormulier`, ook voor de modal op een benchmarkview.
 */
function LeadToevoegen({ organisatie }: { organisatie: Organisatie }) {
  const [open, setOpen] = useState(false);
  const [nieuweLink, setNieuweLink] = useState<string | null>(null);
  const [kopieerGelukt, setKopieerGelukt] = useState<boolean | null>(null);

  async function kopieer(url: string) {
    setKopieerGelukt(await kopieerNaarKlembord(url));
    setTimeout(() => setKopieerGelukt(null), 1600);
  }

  // Een oranje knop direct onder de lijst Respondenten, links uitgelijnd (beheerpagina.md, punt 6a).
  // Pas na een klik klapt het formulier eronder open.
  return (
    <div style={{ marginTop: "1rem" }}>
      <button type="button" className="btn btn-or btn-compact" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        + Lead toevoegen
      </button>
      {open && (
        <div className="mt-3">
          <LeadToevoegenFormulier
            key={nieuweLink ?? "nieuw"}
            organisatie={organisatie}
            onToegevoegd={(lid) => setNieuweLink(maakPubliekeLink(window.location.origin, lid))}
          />
        </div>
      )}
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
    </div>
  );
}

/**
 * De naam in de kop met een potlood (`beheerpagina.md`, punt 4, Naam wijzigen): Een klik maakt van de naam een invoerveld
 * met "Opslaan" en "Annuleren". De naam is verplicht en wordt getrimd. Wie dit scherm ziet, mag de organisatie bewerken
 * (`organisaties.bewerken`: Admin alle, Consultant eigen).
 */
function OrganisatieNaam({ organisatieId, naam }: { organisatieId: string; naam: string }) {
  const [bewerken, setBewerken] = useState(false);
  const [concept, setConcept] = useState(naam);
  const [fout, setFout] = useState<string | null>(null);

  function start() {
    setConcept(naam);
    setFout(null);
    setBewerken(true);
  }

  function slaOp(e: React.FormEvent) {
    e.preventDefault();
    const r = hernoemOrganisatie(organisatieId, concept);
    if (!r.ok) {
      setFout(r.reden);
      return;
    }
    setBewerken(false);
  }

  if (bewerken) {
    return (
      <form onSubmit={slaOp} className="flex flex-wrap items-start gap-2" style={{ margin: "0.4rem 0 0.6rem" }}>
        <div className="admin-field" style={{ marginBottom: 0, minWidth: "20rem", flex: "0 1 28rem" }}>
          <input
            type="text"
            autoFocus
            required
            aria-label="Naam van de organisatie"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setBewerken(false)}
          />
          {fout && <p className="overzicht-melding fout" style={{ marginTop: "0.4rem" }}>{fout}</p>}
        </div>
        <button type="submit" className="btn btn-or btn-compact">
          Opslaan
        </button>
        <button type="button" className="btn btn-outline btn-compact" onClick={() => setBewerken(false)}>
          Annuleren
        </button>
      </form>
    );
  }

  return (
    <div className="titel-rij">
      <h1>{naam}</h1>
      <button type="button" className="titel-potlood" aria-label="Naam wijzigen" title="Naam wijzigen" onClick={start}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export default function OrganisatieDetailPage({ params }: { params: Promise<{ organisatieId: string }> }) {
  const { organisatieId } = use(params);
  const organisatie = useOrganisatie(organisatieId);
  const ingelogdVoorSlot = useIngelogdeGebruiker();
  // Het slot wordt alleen geclaimd door wie de organisatie ook mag bewerken: Anders zou iemand
  // zonder toegang het slot van de eigenaar kunnen bezetten.
  const slotId = organisatie && magOrganisatieToegang(ingelogdVoorSlot, organisatie) ? organisatieId : null;
  return (
    <MetBewerkslot type="organisatie" id={slotId} wat="Organisatie">
      <OrganisatieDetailInhoud organisatieId={organisatieId} />
    </MetBewerkslot>
  );
}

function OrganisatieDetailInhoud({ organisatieId }: { organisatieId: string }) {
  const organisatie = useOrganisatie(organisatieId);
  const assessments = useAssessments();
  const ingelogd = useIngelogdeGebruiker();
  const alleGebruikers = useGebruikers();
  const { open } = useBeheerOverzicht();
  const [kenmerkenOpgeslagen, setKenmerkenOpgeslagen] = useState(false);

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
      <OrganisatieNaam organisatieId={organisatie.id} naam={organisatie.naam} />
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

      <MetingenSectie organisatie={organisatie} />

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
                      {isLead(lid) && <span className="lead-badge">Lead</span>}
                    </td>
                    <td>{lid.email}</td>
                    <td>
                      <RespondentStatusBadge invullingen={invullingen} />
                    </td>
                    <td className="cel-knop">
                      <button type="button" className="btn btn-outline btn-compact" onClick={() => open("respondent", lid.id)}>
                        Bekijk
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
                    <td className="cel-knop">
                      <button type="button" className="btn btn-outline btn-compact" onClick={() => open("scan", invulling.id)}>
                        Bekijk
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
      {magBenchmarkBeheren(ingelogd) && <BenchmarkVlag organisatie={organisatie} />}
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
