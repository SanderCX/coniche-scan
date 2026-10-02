"use client";

import Link from "next/link";
import { useGebruikers } from "@/lib/gebruikers-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magGebruikersBeheren } from "@/lib/rechten";
import { ROL_KLEUR } from "@/lib/colors";

/**
 * Gebruikers (Admin en Consultant), beheerpagina.md punt 9. Los
 * beheeronderdeel, uitsluitend voor Admin — een Consultant ziet de link
 * niet (`BeheerChrome`) en krijgt hier, mocht die toch direct de URL
 * openen, dezelfde toegangsmelding als de rest van beheer bij een
 * ontbrekend recht.
 */
export default function GebruikersPage() {
  const ingelogd = useIngelogdeGebruiker();
  const gebruikers = useGebruikers();

  if (!magGebruikersBeheren(ingelogd)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">
          Geen toegang: alleen een Admin kan gebruikers beheren.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-main">
      <div className="flex items-center justify-between">
        <h1>Gebruikers</h1>
        <Link href="/beheer/gebruikers/nieuw" className="btn btn-or">
          + Nieuwe gebruiker
        </Link>
      </div>
      <p className="text-sm text-ink-m">
        Admin- en Consultant-accounts voor beheer. Respondenten en Leads loggen hier niet in, zie
        de organisatiepagina.
      </p>

      <table className="admin-table mt-4">
        <thead>
          <tr>
            <th>Naam</th>
            <th>E-mail</th>
            <th>Rol</th>
            <th>Status</th>
            <th>Laatst ingelogd</th>
          </tr>
        </thead>
        <tbody>
          {gebruikers.map((g) => (
            <tr key={g.id}>
              <td>
                <Link href={`/beheer/gebruikers/${g.id}`} className="font-semibold text-ink">
                  {g.naam}
                </Link>
              </td>
              <td>{g.email}</td>
              <td>{ROL_KLEUR[g.rol].label}</td>
              <td>
                <span
                  className={`admin-badge ${g.actief ? "status-actief" : "status-gedeactiveerd"}`}
                >
                  {g.actief ? "Actief" : "Gedeactiveerd"}
                </span>
              </td>
              <td>
                {g.laatstIngelogdOp
                  ? new Date(g.laatstIngelogdOp).toLocaleDateString("nl-NL")
                  : "Nog niet ingelogd"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
