"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useOrganisatie, updateOrganisatie, hernoemOrganisatie } from "@/lib/db";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { KenmerkenKaart } from "@/components/beheer/KenmerkenKaart";
import { KpiBlok } from "@/components/beheer/KpiBlok";
import { AfsprakenKaart } from "@/components/beheer/AfsprakenKaart";
import { DossierKaart } from "@/components/beheer/DossierKaart";
import { ToegangKaart } from "@/components/beheer/ToegangKaart";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { RespondentStatusBadge } from "@/components/beheer/overzicht-helpers";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magOrganisatieToegang, magOrganisatieToewijzen, magLeadToekennen } from "@/lib/rechten";
import { useGebruikers } from "@/lib/gebruikers-store";
import { useBeheerOverzicht } from "@/lib/beheer-url";
import { MetBewerkslot } from "@/components/beheer/MetBewerkslot";
import { MetingenSectie } from "@/components/beheer/MetingenSectie";
import { LeadsBlok } from "@/components/beheer/LeadsBlok";
import { isLead } from "@/lib/lead";
import { InfoIcoon } from "@/components/InfoIcoon";
import { MAX_KORTE_NAAM } from "@/lib/korte-namen";

/** Aantal rijen per lijst op de detailpagina (beheerpagina.md, punt 4, "Lange lijsten"). */
const MAX_RIJEN = 5;

/**
 * De naam in de kop met een potlood (`beheerpagina.md`, punt 4, Naam wijzigen): Een klik opent een modal met de velden Naam en Korte naam
 * (twee velden, dus een modal volgens `stylesheet.md`, Bewerken: op de plek of in een modal), met "Annuleren" en "Opslaan". De naam is verplicht en wordt getrimd. Wie dit scherm ziet, mag de organisatie bewerken
 * (`organisaties.bewerken`: Admin alle, Consultant eigen).
 */
function OrganisatieNaam({ organisatieId, naam, korteNaam }: { organisatieId: string; naam: string; korteNaam: string }) {
  const [bewerken, setBewerken] = useState(false);
  const [concept, setConcept] = useState(naam);
  const [conceptKort, setConceptKort] = useState(korteNaam);
  const [fout, setFout] = useState<string | null>(null);

  function start() {
    setConcept(naam);
    setConceptKort(korteNaam);
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
    const kort = conceptKort.trim().slice(0, MAX_KORTE_NAAM);
    if (kort !== korteNaam) {
      updateOrganisatie(organisatieId, (o) => ({ ...o, korteNaam: kort || null }));
    }
    setBewerken(false);
  }

  return (
    <div className="titel-rij">
      <h1>{naam}</h1>
      {korteNaam && (
        <span className="text-sm text-ink-s" title="Korte naam in kolomkoppen">
          Korte naam: {korteNaam}
        </span>
      )}
      <button type="button" className="titel-potlood" aria-label="Naam bewerken" title="Naam bewerken" onClick={start}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {bewerken && (
        <OverzichtModal label="Organisatie bewerken" onSluit={() => setBewerken(false)}>
          <form onSubmit={slaOp}>
            <div className="overzicht-kop">
              <h2>Organisatie bewerken</h2>
            </div>
            <div className="admin-field" style={{ marginTop: "var(--sp-4)" }}>
              <label htmlFor="org-naam">Naam</label>
              <input id="org-naam" type="text" autoFocus required value={concept} onChange={(e) => setConcept(e.target.value)} />
              {fout && (
                <p className="overzicht-melding fout" style={{ marginTop: "0.4rem" }}>
                  {fout}
                </p>
              )}
            </div>
            <div className="admin-field">
              <label htmlFor="org-korte-naam" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                Korte naam
                <InfoIcoon sleutel="info.korteNaamOrganisatie" />
              </label>
              <input
                id="org-korte-naam"
                type="text"
                maxLength={MAX_KORTE_NAAM}
                value={conceptKort}
                onChange={(e) => setConceptKort(e.target.value)}
              />
            </div>
            <div className="btn-rij" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-outline btn-compact" onClick={() => setBewerken(false)}>
                Annuleren
              </button>
              <button type="submit" className="btn btn-or btn-compact">
                Opslaan
              </button>
            </div>
          </form>
        </OverzichtModal>
      )}
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
  const ingelogd = useIngelogdeGebruiker();
  const alleGebruikers = useGebruikers();
  const { open } = useBeheerOverzicht();

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

  function handleKenmerkenOpslaan(kenmerken: Record<string, unknown>) {
    updateOrganisatie(organisatieId, (o) => ({ ...o, kenmerken }));
  }

  const eigenaar = alleGebruikers.find((g) => g.id === organisatie.aangemaaktDoor);
  const toegewezenGebruikers = alleGebruikers.filter((g) => organisatie.toegewezenAan.includes(g.id));

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad delen={[{ label: "Organisaties", href: "/beheer/organisaties" }, { label: organisatie.naam }]} />
      <OrganisatieNaam organisatieId={organisatie.id} naam={organisatie.naam} korteNaam={organisatie.korteNaam ?? ""} />
      <p className="text-sm text-ink-m">
        Aangemaakt door: {eigenaar ? eigenaar.naam : "onbekend"}
        {toegewezenGebruikers.length > 0 && ` · Ook toegewezen aan: ${toegewezenGebruikers.map((g) => g.naam).join(", ")}`}
      </p>

      <KenmerkenKaart organisatie={organisatie} onOpslaan={handleKenmerkenOpslaan} />
      {/* Toegang en Afspraken (alleen een Admin) staan naast elkaar onder de kaart Kenmerken. */}
      {magOrganisatieToewijzen(ingelogd) && (
        <div className="kaarten-rij">
          <ToegangKaart organisatie={organisatie} gebruikers={alleGebruikers} />
          <AfsprakenKaart organisatie={organisatie} />
        </div>
      )}
      {/* Het Dossier (`dossier.md`) staat onder Toegang en Afspraken en boven de KPI's, voor een Admin en voor een Consultant met toegang. */}
      <DossierKaart organisatie={organisatie} />
      <KpiBlok organisatie={organisatie} />

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
      {magLeadToekennen(ingelogd) && <LeadsBlok organisatie={organisatie} />}

    </div>
  );
}
