"use client";

import { AfsprakenKaart } from "@/components/beheer/AfsprakenKaart";
import { ToegangKaart } from "@/components/beheer/ToegangKaart";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magOrganisatieToewijzen } from "@/lib/rechten";
import type { Gebruiker, Organisatie } from "@/lib/types";

/**
 * De kaart Permissies op het organisatie-detail (`beheerpagina.md`, punt 4, Kaart Permissies): Een eigen kaart onder Bedrijfsgegevens met links Toegang en rechts
 * Afspraken, alleen voor een Admin. Een Consultant ziet de kaart niet.
 */
export function PermissiesKaart({ organisatie, gebruikers }: { organisatie: Organisatie; gebruikers: Gebruiker[] }) {
  const isAdmin = magOrganisatieToewijzen(useIngelogdeGebruiker());
  if (!isAdmin) return null;
  return (
    <section className="beheer-kaart org-anker" id="permissies" aria-label="Permissies">
      <div className="beheer-kaart-kop">
        <h2>Permissies</h2>
      </div>
      <div className="op-onder" style={{ paddingTop: 0, borderTop: "none" }}>
        <ToegangKaart organisatie={organisatie} gebruikers={gebruikers} />
        <AfsprakenKaart organisatie={organisatie} />
      </div>
    </section>
  );
}
