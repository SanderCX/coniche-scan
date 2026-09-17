import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Gedeelde nav + footer voor de respondent-facing schermen (CLAUDE.md sectie 5). */
export function PageWithChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col pt-16">{children}</main>
      <SiteFooter />
    </>
  );
}
