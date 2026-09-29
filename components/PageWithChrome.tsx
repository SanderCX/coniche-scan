import Link from "next/link";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { MetingLinksNav } from "./MetingLinksNav";

/**
 * Gedeelde nav + footer voor de respondent-facing schermen (CLAUDE.md
 * sectie 3, "Globale layout"). Volgorde in `.nav-right`, exact zoals daar
 * vastgelegd: eerst de scherm-specifieke acties (`navRight`, onderling
 * zonder scheidingslijn), dan een scheidingslijn (alleen als die acties
 * er zijn), dan de 4 vaste content-links, dan een scheidingslijn (alleen
 * als er een exit-actie is), dan als laatste de exit-actie.
 */
export function PageWithChrome({
  children,
  navRight,
  code,
  toonTerug,
  logoHref,
}: {
  children: React.ReactNode;
  /** Scherm-specifieke acties, uiterst links (bijv. resultatenscherm: "← Terug naar de scan" + Exporteren, samen zonder scheidingslijn). */
  navRight?: React.ReactNode;
  /** Toegangscode van de respondent, geeft de 4 vaste links een ?code= en maakt `toonTerug` mogelijk. */
  code?: string;
  /** Toont "← Terug naar Mijn metingen" na een scheidingslijn, als laatste. Vereist `code`. */
  toonTerug?: boolean;
  /** Binnen een persoonlijke respondent-link gaat het logo naar "Mijn metingen" i.p.v. "/". */
  logoHref?: string;
}) {
  return (
    <>
      <SiteHeader
        logoHref={logoHref}
        navRight={
          <>
            {navRight}
            {navRight && <span className="nav-divider" />}
            <MetingLinksNav code={code} />
            {toonTerug && code && (
              <>
                <span className="nav-divider" />
                <Link href={`/s/${code}`}>← Terug naar Mijn metingen</Link>
              </>
            )}
          </>
        }
      />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  );
}
