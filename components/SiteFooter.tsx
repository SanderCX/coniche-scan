import Link from "next/link";

/**
 * Gedeelde footer. Bewust nog zonder logo, zie stylesheet.md "Nog open —
 * wacht op designbeslissing van Joost": vereist een witte/inverse
 * logovariant die er nog niet is. `.mini-logo` (28px) staat klaar in
 * components.css voor zodra dat besluit valt.
 */
export function SiteFooter() {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} Coniche — Maakt Meer Werkend ·{" "}
      <Link href="/privacy" className="footer-admin-link">
        Privacy
      </Link>
      {/* TIJDELIJK (op verzoek van Sander): Link naar beheer op elke pagina. De spec heeft in de footer alleen
          "Privacy" (stylesheet.md, Footer). Verwijderen zodra dit niet meer nodig is. */}
      {" · "}
      <Link href="/beheer" className="footer-admin-link">
        Beheer
      </Link>
    </footer>
  );
}
