import Link from "next/link";

export interface KruimelDeel {
  label: string;
  /** Het laatste deel (de huidige pagina) heeft geen href en is niet klikbaar. */
  href?: string;
}

/**
 * Pad boven de paginatitel op een detailpagina (beheerpagina.md,
 * "Navigatie in beheer"): volgt de hiërarchie Organisatie › Meting ›
 * Resultaten, niet de klikgeschiedenis. Elk deel klikbaar behalve het laatste.
 */
export function Kruimelpad({ delen }: { delen: KruimelDeel[] }) {
  return (
    <nav className="kruimelpad" aria-label="Kruimelpad">
      {delen.map((deel, i) => (
        <span key={`${deel.label}-${i}`} style={{ display: "contents" }}>
          {i > 0 && <span className="kruimelpad-scheiding">›</span>}
          {deel.href ? <Link href={deel.href}>{deel.label}</Link> : <span style={{ color: "var(--ink)" }}>{deel.label}</span>}
        </span>
      ))}
    </nav>
  );
}
