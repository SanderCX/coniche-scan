"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DropdownKnop } from "@/components/DropdownKnop";
import { BeheerNavActionsProvider, useBeheerNavActionsValue } from "@/components/beheer/BeheerNavActions";
import { logout, useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magContentBeheren, magGebruikersBeheren } from "@/lib/rechten";
import { ROL_KLEUR } from "@/lib/colors";
import { BeheerMeldingBalk } from "@/components/beheer/BeheerMelding";
import { BeheerOverzichten } from "@/components/beheer/BeheerOverzichten";

/**
 * Beheer hergebruikt de publieke nav/footer (zelfde logo, zelfde balk),
 * met alleen extra links + een "terug"-link binnen diezelfde balk — geen
 * aparte admin-huisstijl. Zie beheerpagina.md "Vormgeving" en
 * stylesheet.md "Admin hergebruikt de publieke nav/footer".
 *
 * Nav-volgorde exact zoals beheerpagina.md, "Accountmenu" voorschrijft:
 * scherm-specifieke links → scheidingslijn → Accountmenu, helemaal
 * uiterst rechts. Geen "← Terug naar site" meer (beheerpagina.md,
 * Accountmenu: "Geen '← Terug naar site' in beheer" — vervangt met
 * "Uitloggen" als enige manier om beheer te verlaten).
 *
 * Drie hoofdlinks (beheerpagina.md, "Wat beheerbaar is"), geen 4e
 * "Overzicht" meer: **Applicatie** (Gebruikers, Instellingen, Algemene
 * teksten, Content-pagina's) en **Assessments** (Assessment-types,
 * Content) zijn Admin-only; **Organisaties** (Organisatievelden,
 * Organisaties, Metingen, Respondenten, Lead-rol, Ingevulde scans,
 * Import) ziet ook een Consultant, met bereik "eigen". Elke link wijst
 * naar één hub-pagina voor die sectie; onderdelen zonder eigen top-navlink
 * (Ingevulde scans, Import) zijn vanaf de Organisaties-hub bereikbaar.
 *
 * **Scherm-specifieke acties vóór deze drie links** (CLAUDE.md sectie 3,
 * Globale layout, punt 1 — "Ingevulde scans →"/"Import van scans →" op de
 * Organisaties-hub, via `BeheerNavActions.tsx`): Stonden eerder als platte
 * tekst in de pagina-body, hoorden daar niet: Het zijn navigatie-acties
 * voor het scherm, dus in `.nav-right`, met een scheidingslijn erna net
 * als bij elke andere scherm-specifieke actie.
 */
const PAD_PER_SECTIE: { sectie: "applicatie" | "assessments" | "organisaties"; paden: string[] }[] = [
  { sectie: "applicatie", paden: ["/beheer/applicatie", "/beheer/gebruikers", "/beheer/teksten"] },
  { sectie: "assessments", paden: ["/beheer/assessments", "/beheer/content"] },
  {
    sectie: "organisaties",
    paden: [
      "/beheer/organisaties",
      "/beheer/respondenten",
      "/beheer/scans",
      "/beheer/import",
      "/beheer/metingen",
      "/beheer/resultaten",
      "/beheer/rapportage",
    ],
  },
];

/**
 * Tabbalk met de onderdelen van "Organisaties" (beheerpagina.md,
 * "Navigatie in beheer"): alleen zichtbaar op de lijstpagina's zelf, niet
 * op een detailpagina. Metingen en uitnodigen hebben geen tab.
 * Organisatievelden (alleen Admin) volgt zodra dat onderdeel gebouwd is.
 */
const ORGANISATIE_TABS = [
  { href: "/beheer/organisaties", label: "Organisaties" },
  { href: "/beheer/respondenten", label: "Respondenten" },
  { href: "/beheer/scans", label: "Ingevulde scans" },
  { href: "/beheer/import", label: "Import" },
];

export function BeheerChrome({ children }: { children: React.ReactNode }) {
  return (
    <BeheerNavActionsProvider>
      <BeheerChromeInner>{children}</BeheerChromeInner>
    </BeheerNavActionsProvider>
  );
}

function BeheerChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const gebruiker = useIngelogdeGebruiker();
  const navActions = useBeheerNavActionsValue();

  const links = [
    ...(magGebruikersBeheren(gebruiker)
      ? [{ sectie: "applicatie" as const, href: "/beheer/applicatie", label: "Applicatie" }]
      : []),
    ...(magContentBeheren(gebruiker)
      ? [{ sectie: "assessments" as const, href: "/beheer/content", label: "Assessments" }]
      : []),
    { sectie: "organisaties" as const, href: "/beheer/organisaties", label: "Organisaties" },
  ];

  const rolInfo = gebruiker ? ROL_KLEUR[gebruiker.rol] : undefined;
  const toonTabs = ORGANISATIE_TABS.some((t) => pathname === t.href);

  return (
    <>
      <SiteHeader
        badge={rolInfo ? rolInfo.label.toUpperCase() : "Beheer"}
        badgeKleur={rolInfo?.hex}
        navRight={
          <>
            {navActions}
            {navActions && <span className="nav-divider" />}
            {links.map((link) => {
              const sectiePaden = PAD_PER_SECTIE.find((p) => p.sectie === link.sectie)?.paden ?? [link.href];
              const actief = sectiePaden.some((p) => pathname.startsWith(p));
              return (
                <Link key={link.href} href={link.href} className={actief ? "actief" : ""}>
                  {link.label}
                </Link>
              );
            })}
            <span className="nav-divider" />
            {gebruiker && (
              <DropdownKnop
                label={gebruiker.email}
                header={`${gebruiker.email} (${ROL_KLEUR[gebruiker.rol].label})`}
                opties={[{ label: "Uitloggen", onClick: logout }]}
              />
            )}
          </>
        }
      />
      {toonTabs && (
        <div className="beheer-tabs">
          <nav className="beheer-tabs-inner" aria-label="Onderdelen van Organisaties">
            {ORGANISATIE_TABS.map((tab) => (
              <Link key={tab.href} href={tab.href} className={`beheer-tab ${pathname === tab.href ? "actief" : ""}`}>
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
      <BeheerMeldingBalk />
      <main className="flex-1">{children}</main>
      <Suspense fallback={null}>
        <BeheerOverzichten />
      </Suspense>
      <SiteFooter />
    </>
  );
}
