import Link from "next/link";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/**
 * Gedeelde nav + footer voor de respondent-facing schermen (CLAUDE.md
 * sectie 3, "Globale layout"). Volgorde in `.nav-right`, exact zoals daar
 * vastgelegd: eerst de scherm-specifieke acties (`navRight`, onderling
 * zonder scheidingslijn), dan de exit-actie, dan het identiteitsmenu, met
 * alleen een scheidingslijn waar aan beide kanten iets staat. De 4 vaste
 * content-links zijn vervallen (21 oktober 2026): De content staat op de
 * Assessment-pagina.
 */
export function PageWithChrome({
  children,
  navRight,
  code,
  toonTerug,
  logoHref,
  identiteitMenu,
  navNietSticky = false,
}: {
  children: React.ReactNode;
  /** Scherm-specifieke acties, uiterst links (bijv. resultatenscherm: "← Terug naar de scan" + Exporteren, samen zonder scheidingslijn). */
  navRight?: React.ReactNode;
  /** Toegangscode van de respondent, maakt `toonTerug` mogelijk. */
  code?: string;
  /** Toont "← Terug naar Mijn metingen" na een scheidingslijn, als laatste. Vereist `code`. */
  toonTerug?: boolean;
  /** Binnen een persoonlijke respondent-link gaat het logo naar "Mijn metingen" i.p.v. "/". */
  logoHref?: string;
  /**
   * Punt 7 van de nav-volgorderegel (CLAUDE.md, Globale layout):
   * helemaal uiterst rechts, voorbij de exit-actie. Op scherm 1 is dit
   * "Inloggen" (de uitgelogde staat van deze plek); zodra het "Mijn
   * gegevens"-menu bestaat, hoort dat hier ook.
   */
  identiteitMenu?: React.ReactNode;
  /** De hoofd-nav scrolt weg in plaats van te blijven staan: Op de Assessment-pagina staat de sticky sub-nav bovenaan (`CLAUDE.md`, scherm 2). */
  navNietSticky?: boolean;
}) {
  // Het slot is nooit leeg: Zonder herkende gebruiker (geen menu en geen code) staat er "Inloggen", de uitgelogde
  // variant van datzelfde slot (CLAUDE.md, Globale layout, punt 7).
  const identiteit = identiteitMenu ?? (code ? undefined : <Link href="/toegang">Inloggen</Link>);
  return (
    <>
      <SiteHeader
        logoHref={logoHref}
        nietSticky={navNietSticky}
        navRight={
          <>
            {navRight}
            {navRight && (toonTerug && code ? true : !!identiteit) && <span className="nav-divider" />}
            {toonTerug && code && <Link href={`/s/${code}`}>← Terug naar Mijn metingen</Link>}
            {toonTerug && code && identiteit && <span className="nav-divider" />}
            {identiteit}
          </>
        }
      />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  );
}
