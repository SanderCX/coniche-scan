import Link from "next/link";

const VASTE_LINKS = [
  { href: "/visie", label: "Visie" },
  { href: "/bouwstenen", label: "Bouwstenen" },
  { href: "/ai-scan", label: "AI-scan" },
  { href: "/klantcontact-2030", label: "2030" },
];

/**
 * De 4 vaste content-links, altijd vooraan in `.nav-right` (CLAUDE.md
 * sectie 3, Globale layout punt 1), vóór eventuele scherm-specifieke
 * acties. `code` wordt doorgegeven zodat elke pagina weet welke "Mijn
 * metingen" erbij hoort.
 */
export function MetingLinksNav({ code }: { code?: string }) {
  return (
    <>
      {VASTE_LINKS.map((link) => (
        <Link key={link.href} href={code ? `${link.href}?code=${code}` : link.href}>
          {link.label}
        </Link>
      ))}
    </>
  );
}
