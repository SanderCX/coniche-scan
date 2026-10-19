import Link from "next/link";
import { HelpBlok, leesInline } from "@/lib/help-bron";

/** Eén regel tekst met `**vet**` en verwijzingen naar andere onderwerpen. */
export function HelpInline({ tekst, href }: { tekst: string; href: (slug: string) => string }) {
  return (
    <>
      {leesInline(tekst).map((d, i) =>
        d.soort === "vet" ? (
          <strong key={i}>{d.tekst}</strong>
        ) : d.soort === "verwijzing" ? (
          <Link key={i} href={href(d.slug)}>
            {d.tekst}
          </Link>
        ) : (
          <span key={i}>{d.tekst}</span>
        )
      )}
    </>
  );
}

/** De blokken van een sectie: Alinea's, een genummerde lijst met dezelfde nummers als de markeringen in de afbeelding, of opsommingen. */
export function HelpBlokken({ blokken, href }: { blokken: HelpBlok[]; href: (slug: string) => string }) {
  return (
    <>
      {blokken.map((b, i) =>
        b.soort === "alinea" ? (
          <p key={i}>
            <HelpInline tekst={b.tekst} href={href} />
          </p>
        ) : b.soort === "genummerd" ? (
          <ol key={i} className="help-genummerd">
            {b.items.map((item, j) => (
              <li key={j}>
                <span className="help-nr" aria-hidden="true">
                  {j + 1}
                </span>
                <span>
                  <HelpInline tekst={item} href={href} />
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <ul key={i} className="help-opsomming">
            {b.items.map((item, j) => (
              <li key={j}>
                <HelpInline tekst={item} href={href} />
              </li>
            ))}
          </ul>
        )
      )}
    </>
  );
}
