"use client";

import { use } from "react";
import Link from "next/link";
import { useOrganisatie, updateOrganisatie } from "@/lib/db";
import { OrganisatiePaneel } from "@/components/beheer/OrganisatiePaneel";
import { DossierKaart } from "@/components/beheer/DossierKaart";
import { AdviesverloopBlok } from "@/components/beheer/AdviesverloopBlok";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { RespondentStatusBadge } from "@/components/beheer/overzicht-helpers";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magOrganisatieToegang, magLeadToekennen } from "@/lib/rechten";
import { useGebruikers } from "@/lib/gebruikers-store";
import { useBeheerOverzicht } from "@/lib/beheer-url";
import { MetBewerkslot } from "@/components/beheer/MetBewerkslot";
import { MetingenSectie } from "@/components/beheer/MetingenSectie";
import { LeadsBlok } from "@/components/beheer/LeadsBlok";
import { isLead } from "@/lib/lead";

/** Aantal rijen per lijst op de detailpagina (beheerpagina.md, punt 4, "Lange lijsten"). */
const MAX_RIJEN = 5;

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
        <p className="admin-notice">Geen toegang: deze organisatie is niet door jou aangemaakt en ook niet aan jou toegewezen.</p>
      </div>
    );
  }

  function handleKenmerkenOpslaan(kenmerken: Record<string, unknown>) {
    updateOrganisatie(organisatieId, (o) => ({ ...o, kenmerken }));
  }

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad delen={[{ label: "Organisaties", href: "/beheer/organisaties" }, { label: organisatie.naam }]} />

      {/* Elke sectie staat op een eigen witte kaart, in deze volgorde (`beheerpagina.md`, Eén kaart per sectie; `stylesheet.md`, Sectiekaart). */}
      <div className="org-kaarten">
        <OrganisatiePaneel organisatie={organisatie} gebruikers={alleGebruikers} onOpslaan={handleKenmerkenOpslaan} />
        {/* Het adviesverloop (`adviesverloop.md`): Alleen voor wie `adviesverloop.bekijken` heeft. */}
        <AdviesverloopBlok organisatie={organisatie} />
        {/* Het Dossier (`dossier.md`): Voor een Admin en voor een Consultant met toegang. */}
        <DossierKaart organisatie={organisatie} />
        <MetingenSectie organisatie={organisatie} />

        <section className="beheer-kaart" aria-label="Respondenten">
          <div className="beheer-kaart-kop">
            <h2>Respondenten</h2>
          </div>
          {organisatie.leden.length === 0 ? (
            <p className="admin-notice">Nog geen respondenten. Nodig ze uit vanuit een Meting.</p>
          ) : (
            <>
              <table className="admin-table">
                <tbody>
                  {organisatie.leden.slice(0, MAX_RIJEN).map((lid) => {
                    const invullingen = organisatie.scanUitvoeringen.flatMap((s) =>
                      s.invullingen.filter((i) => i.organisatieLidId === lid.id),
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
        </section>
        {magLeadToekennen(ingelogd) && <LeadsBlok organisatie={organisatie} />}
      </div>
    </div>
  );
}
