"use client";

import Link from "next/link";
import { useAdviesCatalogus } from "@/lib/advies-catalogus-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { adviesverlopenVan, faseRegel, onderdeelNaamVan } from "@/lib/advies";
import { magAdviesverloop } from "@/lib/rechten";
import type { Organisatie } from "@/lib/types";

/**
 * Het blok Adviesverloop op het organisatie-detail (`beheerpagina.md`, punt 4, Adviesverloop): Per adviesverloop één regel met het Onderdeel (of de hele
 * Organisatie), de huidige fase, het aantal gekoppelde Metingen, de status en de knop Openen. Alleen voor wie `adviesverloop.bekijken` heeft. Een
 * adviesverloop start vanuit een Meting (het Meting-overzicht), niet hier.
 */
export function AdviesverloopBlok({ organisatie }: { organisatie: Organisatie }) {
  const gebruiker = useIngelogdeGebruiker();
  const catalogus = useAdviesCatalogus();
  if (!magAdviesverloop(gebruiker, organisatie)) return null;
  const lijst = [...adviesverlopenVan(organisatie)].sort((a, b) => (a.status === b.status ? b.aangemaaktOp.localeCompare(a.aangemaaktOp) : a.status === "lopend" ? -1 : 1));

  return (
    <section className="beheer-kaart" aria-label="Adviesverloop">
      <div className="beheer-kaart-kop">
        <h2>Adviesverloop</h2>
      </div>
      {lijst.length === 0 ? (
        <p className="text-sm text-ink-s">Er is nog geen adviesverloop. Start er een vanuit een Meting met afgeronde scans.</p>
      ) : (
        <table className="admin-table">
          <tbody>
            {lijst.map((av) => (
              <tr key={av.id}>
                <td>
                  <strong>{onderdeelNaamVan(organisatie, av.onderdeelId)}</strong>
                </td>
                <td>{faseRegel(catalogus, av) ?? "Geen fasen met stappen"}</td>
                <td>
                  {av.metingen.length} {av.metingen.length === 1 ? "Meting" : "Metingen"}
                </td>
                <td>{av.status === "lopend" ? "Lopend" : "Afgerond"}</td>
                <td className="cel-knop">
                  <Link className="btn btn-outline btn-compact" href={`/beheer/organisaties/${organisatie.id}/adviesverloop/${av.id}`}>
                    Openen
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
