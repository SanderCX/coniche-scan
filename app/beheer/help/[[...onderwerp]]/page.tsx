"use client";

import { use } from "react";
import { HelpPagina } from "@/components/help/HelpPagina";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { helpRolBeheer } from "@/lib/help";

/**
 * De Help voor een Admin of Consultant (`help.md`, Plek in de app): Via het Accountmenu, binnen de beheeromgeving, met de gewone
 * navigatiebalk. De rol komt uit de ingelogde gebruiker.
 */
export default function BeheerHelpPage({ params }: { params: Promise<{ onderwerp?: string[] }> }) {
  const { onderwerp } = use(params);
  const gebruiker = useIngelogdeGebruiker();
  if (!gebruiker) return null;
  return (
    <div className="admin-main admin-main--breed">
      <HelpPagina gebruiker={helpRolBeheer(gebruiker.rol)} basis="/beheer/help" slug={onderwerp?.[0]} />
    </div>
  );
}
