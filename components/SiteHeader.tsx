import Image from "next/image";
import Link from "next/link";

/**
 * Gedeelde navigatiebalk over alle schermen (publiek én beheer), zie
 * stylesheet.md "Nav-gedrag — definitief besloten": sticky, permanent wit,
 * 3px oranje onderrand, vaste hoogte `--nav-h`, logo 44px. Geen
 * transparant-wordt-wit-bij-scroll meer (bewust losgelaten).
 */
export function SiteHeader({
  badge,
  navRight,
}: {
  /** bijv. "Beheer" — de zwarte pil naast het logo. */
  badge?: string;
  /** Pagina-specifieke acties/links, rechts uitgelijnd. */
  navRight?: React.ReactNode;
}) {
  return (
    <header className="nav">
      <Link href="/" className="nav-logo">
        <Image
          src="/LOGO/Coniche_MMW_standard.svg"
          alt="Coniche"
          width={200}
          height={44}
          style={{ height: "44px", width: "auto" }}
          priority
        />
      </Link>
      {badge && <span className="nav-badge">{badge}</span>}
      {navRight && <div className="nav-right">{navRight}</div>}
    </header>
  );
}
