import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Gedeelde nav + footer voor de respondent-facing schermen (CLAUDE.md sectie 5). */
export function PageWithChrome({
  children,
  navRight,
}: {
  children: React.ReactNode;
  /** Pagina-specifieke acties in de nav (bijv. resultatenscherm: terug + export). */
  navRight?: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader navRight={navRight} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  );
}
