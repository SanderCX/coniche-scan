"use client";

import { Organisatie } from "@/lib/types";
import { useBeheerOverzicht } from "@/lib/beheer-url";

/** Aantal Leads dat het blok toont voor "Alle Leads beheren" (`beheerpagina.md`, punt 6a). */
const MAX_LEADS = 5;

/**
 * Het blok Leads op het organisatie-detail (`beheerpagina.md`, punt 6a, Blok Leads en Leads-venster): Compact, onder het blok
 * Respondenten, alleen voor een Admin. Eén regel per Lead met de naam, de samenvatting ("Ziet 3 weergaven" of "Ziet nog
 * niets") en "Bekijk", dat het Respondent-overzicht opent. De vinkjes zelf staan in het Leads-venster, dat opent met "Leads
 * beheren". Zonder Leads staat er "Nog geen Leads" met de knop "+ Lead toevoegen", die het venster opent met het formulier al
 * open.
 */
export function LeadsBlok({ organisatie }: { organisatie: Organisatie }) {
  const { open } = useBeheerOverzicht();
  const leads = organisatie.leden.filter((l) => l.lead === true);
  const samenvatting = (leadId: string) => {
    const aantal = (organisatie.leadToegang ?? []).filter((t) => t.respondentId === leadId).length;
    return aantal === 0 ? "Ziet nog niets" : `Ziet ${aantal} ${aantal === 1 ? "weergave" : "weergaven"}`;
  };

  return (
    <section className="beheer-kaart" aria-label="Leads">
      <div className="beheer-kaart-kop">
        <h2>Leads</h2>
        <button
          type="button"
          className="btn btn-outline btn-compact"
          onClick={() => open("leads", organisatie.id)}
          style={{ marginLeft: "auto" }}
        >
          Leads beheren
        </button>
      </div>
      {leads.length === 0 ? (
        <div style={{ marginTop: "0.8rem" }}>
          <p className="admin-notice">Nog geen Leads.</p>
          <button type="button" className="btn btn-or btn-compact" onClick={() => open("leads", organisatie.id, { toevoegen: true })}>
            + Lead toevoegen
          </button>
        </div>
      ) : (
        <>
          <table className="admin-table" style={{ marginTop: "0.8rem" }}>
            <tbody>
              {leads.slice(0, MAX_LEADS).map((lead) => (
                <tr key={lead.id} className="admin-table-rij-klikbaar" onClick={() => open("respondent", lead.id)}>
                  <td>
                    {lead.naam || <em className="text-ink-s">{lead.email}</em>} <span className="lead-badge">Lead</span>
                  </td>
                  <td className="text-ink-m">{samenvatting(lead.id)}</td>
                  <td className="cel-knop">
                    <button
                      type="button"
                      className="btn btn-outline btn-compact"
                      onClick={(e) => {
                        e.stopPropagation();
                        open("respondent", lead.id);
                      }}
                    >
                      Bekijk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length > MAX_LEADS && (
            <button
              type="button"
              className="lijst-meer-link"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              onClick={() => open("leads", organisatie.id)}
            >
              Alle Leads beheren →
            </button>
          )}
        </>
      )}
    </section>
  );
}
