"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { logout } from "@/lib/admin-auth";

const links = [
  { href: "/beheer", label: "Overzicht" },
  { href: "/beheer/organisaties", label: "Organisaties" },
  { href: "/beheer/scans", label: "Ingevulde scans" },
  { href: "/beheer/content", label: "Content" },
];

/**
 * Beheer hergebruikt de publieke nav/footer (zelfde logo, zelfde balk),
 * met alleen extra links + een "terug"-link binnen diezelfde balk — geen
 * aparte admin-huisstijl. Zie admin-beheerpagina.md "Vormgeving" en
 * stylesheet.md "Admin hergebruikt de publieke nav/footer".
 */
export function BeheerChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <SiteHeader
        badge="Beheer"
        navRight={
          <>
            {links.map((link) => {
              const actief =
                link.href === "/beheer" ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} className={actief ? "actief" : ""}>
                  {link.label}
                </Link>
              );
            })}
            <Link href="/" className="admin-nav-terug">
              ← Terug naar site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="border-0 bg-transparent p-0 cursor-pointer"
              style={{ font: "inherit" }}
            >
              Uitloggen
            </button>
          </>
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
