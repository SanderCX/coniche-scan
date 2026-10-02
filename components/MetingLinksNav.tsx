import Link from "next/link";

const VASTE_LINKS = [
  { href: "/visie", label: "Visie" },
  { href: "/bouwstenen", label: "Bouwstenen" },
  { href: "/ai-scan", label: "AI" },
  { href: "/klantcontact-2030", label: "2030" },
];

/**
 * De 4 vaste content-links (CLAUDE.md sectie 3, Globale layout punt 3),
 * ná eventuele scherm-specifieke acties (punt 1) en vóór de exit-actie
 * (punt 5) — de volgorde zit in `PageWithChrome`, hier alleen de links
 * zelf. `code` wordt doorgegeven zodat elke pagina weet welke "Mijn
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
