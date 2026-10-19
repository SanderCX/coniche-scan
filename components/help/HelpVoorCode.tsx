"use client";

import { useRespondentPerToegangscode } from "@/lib/db";
import { HelpPagina } from "@/components/help/HelpPagina";
import { helpRolRespondent } from "@/lib/help";

/** De Help voor de Respondent of Lead achter een persoonlijke code, met de rol en de toegang van die persoon. */
export function HelpVoorCode({ code, slug }: { code: string; slug?: string }) {
  const gegevens = useRespondentPerToegangscode(code);
  if (!gegevens) {
    return (
      <div className="help-kaart" style={{ maxWidth: "36rem", margin: "var(--sp-8) auto" }}>
        <h1 className="page-title">Ongeldige link</h1>
        <p>Deze link bestaat niet (meer). Neem contact op met Coniche voor een nieuwe link.</p>
      </div>
    );
  }
  return <HelpPagina gebruiker={helpRolRespondent(gegevens.lid, gegevens.organisatie)} basis="/help" code={code} slug={slug} />;
}
