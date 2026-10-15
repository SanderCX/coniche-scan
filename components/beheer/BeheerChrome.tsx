"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DropdownKnop } from "@/components/DropdownKnop";
import { BeheerNavActionsProvider, useBeheerNavActionsValue } from "@/components/beheer/BeheerNavActions";
import { logout, useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren, magContentBeheren, magGebruikersBeheren, magVerkennen } from "@/lib/rechten";
import { VIA_RESULTATEN } from "@/lib/resultaten-nav";
import { ROL_KLEUR } from "@/lib/colors";
import { BeheerMeldingBalk } from "@/components/beheer/BeheerMelding";
import { BeheerOverzichten } from "@/components/beheer/BeheerOverzichten";
import { ConflictHost } from "@/components/beheer/ConflictHost";
import { MijnAccountModal } from "@/components/beheer/MijnAccountModal";

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
 * Drie hoofdlinks (beheerpagina.md, "Wat beheerbaar is"): **Assessments** (Assessment-types, Content, Admin-only),
 * **Organisaties** (Organisaties, Respondenten, ook voor een Consultant, bereik "eigen") en **Resultaten** (Metingen voor Admin en
 * Consultant, Benchmarks alleen voor de Admin). **Instellingen** (voorheen Applicatie: Gebruikers,
 * Drempels en termijnen, Algemene teksten, Content-pagina's, Audit-log, Data-integriteit) staat niet in de nav maar als
 * rij in het Accountmenu, alleen voor een Admin. Elke link wijst naar één hub-pagina voor die sectie. De import is een knop
 * in het organisatie-detail en de pagina Ingevulde scans bestaat niet meer (beheerpagina.md, punt 7 en 8).
 *
 * **Scherm-specifieke acties vóór deze drie links** (CLAUDE.md sectie 3,
 * Globale layout, punt 1 — "Ingevulde scans →"/"Import van scans →" op de
 * Organisaties-hub, via `BeheerNavActions.tsx`): Stonden eerder als platte
 * tekst in de pagina-body, hoorden daar niet: Het zijn navigatie-acties
 * voor het scherm, dus in `.nav-right`, met een scheidingslijn erna net
 * als bij elke andere scherm-specifieke actie.
 */
const INSTELLINGEN_PADEN = [
  "/beheer/instellingen",
  "/beheer/applicatie",
  "/beheer/gebruikers",
  "/beheer/drempels",
  "/beheer/teksten",
  "/beheer/content-paginas",
  "/beheer/audit",
  "/beheer/data-integriteit",
];

type Sectie = "assessments" | "organisaties" | "resultaten";

/**
 * Welke hoofdlink actief is. Het Meting-overzicht en de resultatenpagina's horen bij de hoofdlink waarlangs je kwam: Met
 * `?via=resultaten` is dat Resultaten, anders Organisaties. De benchmarkpagina's zijn altijd Resultaten.
 */
function sectieVoor(pathname: string, via: boolean): Sectie {
  if (pathname.startsWith("/beheer/assessments") || pathname.startsWith("/beheer/content")) return "assessments";
  if (pathname.startsWith("/beheer/benchmark") || pathname.startsWith("/beheer/verkennen")) return "resultaten";
  if (pathname.startsWith("/beheer/resultaten/metingen")) return "resultaten";
  if (
    via &&
    (pathname.startsWith("/beheer/metingen") ||
      pathname.startsWith("/beheer/rapportage") ||
      pathname.startsWith("/beheer/resultaten"))
  ) {
    return "resultaten";
  }
  return "organisaties";
}

/**
 * Tabbalk met de onderdelen van "Organisaties" (beheerpagina.md,
 * "Navigatie in beheer"): alleen zichtbaar op de lijstpagina's zelf, niet
 * op een detailpagina. Metingen en uitnodigen hebben geen tab.
 * Organisatievelden (alleen Admin) volgt zodra dat onderdeel gebouwd is.
 */
const ORGANISATIE_TABS = [
  { href: "/beheer/organisaties", label: "Organisaties" },
  { href: "/beheer/respondenten", label: "Respondenten" },
];

/** Tabbalk van Resultaten (beheerpagina.md, punt 7): Metingen, voor een Admin aangevuld met Benchmarks. */
const RESULTATEN_TABS = [{ href: "/beheer/resultaten/metingen", label: "Metingen" }];
const BENCHMARKS_TAB = { href: "/beheer/benchmark", label: "Benchmarks" };
const VERKENNEN_TAB = { href: "/beheer/verkennen", label: "Verkennen" };

/**
 * Tabbalk van Instellingen (beheerpagina.md, "Navigatie in beheer"): Gebruikers is de landingstab. Alleen zichtbaar op de
 * lijstpagina's zelf, niet op een detailpagina (Nieuwe gebruiker, Gebruiker).
 */
const INSTELLINGEN_TABS = [
  { href: "/beheer/gebruikers", label: "Gebruikers" },
  { href: "/beheer/drempels", label: "Drempels en termijnen" },
  { href: "/beheer/teksten", label: "Algemene teksten" },
  { href: "/beheer/content-paginas", label: "Content-pagina's" },
  { href: "/beheer/audit", label: "Audit-log" },
  { href: "/beheer/data-integriteit", label: "Data-integriteit" },
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
  const via = useSearchParams().get("via") === VIA_RESULTATEN;
  const gebruiker = useIngelogdeGebruiker();
  const navActions = useBeheerNavActionsValue();
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);
  const heeftInstellingen = magGebruikersBeheren(gebruiker);
  const inInstellingen = INSTELLINGEN_PADEN.some((p) => pathname.startsWith(p));

  const links = [
    ...(magContentBeheren(gebruiker)
      ? [{ sectie: "assessments" as const, href: "/beheer/content", label: "Assessments" }]
      : []),
    { sectie: "organisaties" as const, href: "/beheer/organisaties", label: "Organisaties" },
    { sectie: "resultaten" as const, href: "/beheer/resultaten/metingen", label: "Resultaten" },
  ];
  const huidigeSectie = sectieVoor(pathname, via);
  const resultatenTabs = [
    ...RESULTATEN_TABS,
    ...(magBenchmarkBeheren(gebruiker) ? [BENCHMARKS_TAB] : []),
    ...(magVerkennen(gebruiker) ? [VERKENNEN_TAB] : []),
  ];

  const rolInfo = gebruiker ? ROL_KLEUR[gebruiker.rol] : undefined;
  const toonTabs = ORGANISATIE_TABS.some((t) => pathname === t.href);
  // Met maar één tab, zoals bij een Consultant, toont de pagina geen tabbalk (`beheerpagina.md`, punt 7).
  const toonResultatenTabs = resultatenTabs.length > 1 && resultatenTabs.some((t) => pathname === t.href);
  const toonInstellingenTabs = heeftInstellingen && INSTELLINGEN_TABS.some((t) => pathname === t.href);

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
              const actief = huidigeSectie === link.sectie;
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
                rechtsUitgelijnd
                actief={heeftInstellingen && inInstellingen}
                opties={[
                  { label: "Mijn account", onClick: () => setAccountOpen(true) },
                  ...(heeftInstellingen
                    ? [{ label: "Instellingen", onClick: () => router.push("/beheer/gebruikers"), actief: inInstellingen }]
                    : []),
                  { label: "Uitloggen", onClick: logout, scheidingVoor: true },
                ]}
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
      {toonResultatenTabs && (
        <div className="beheer-tabs">
          <nav className="beheer-tabs-inner" aria-label="Onderdelen van Resultaten">
            {resultatenTabs.map((tab) => (
              <Link key={tab.href} href={tab.href} className={`beheer-tab ${pathname === tab.href ? "actief" : ""}`}>
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
      {toonInstellingenTabs && (
        <div className="beheer-tabs">
          <nav className="beheer-tabs-inner" aria-label="Onderdelen van Instellingen">
            {INSTELLINGEN_TABS.map((tab) => (
              <Link key={tab.href} href={tab.href} className={`beheer-tab ${pathname === tab.href ? "actief" : ""}`}>
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
      <BeheerMeldingBalk />
      {gebruiker && accountOpen && <MijnAccountModal gebruiker={gebruiker} open onSluit={() => setAccountOpen(false)} />}
      <main className="flex-1">{children}</main>
      <Suspense fallback={null}>
        <BeheerOverzichten />
      </Suspense>
      <ConflictHost />
      <SiteFooter />
    </>
  );
}
