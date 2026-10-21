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
  badgeKleur,
  navRight,
  logoHref = "/",
}: {
  /** bijv. "Beheer" — zonder `badgeKleur` de vaste zwarte pil naast het logo. */
  badge?: string;
  /** Met een kleur wordt dit de Rolbadge (stylesheet.md, "Rolbadge"): gevuld met
   * deze kleur i.p.v. zwart, en met de vierkantere `.hero-tag`-vorm. Zie `ROL_KLEUR`
   * (`lib/colors.ts`). */
  badgeKleur?: string;
  /** Pagina-specifieke acties/links, rechts uitgelijnd. */
  navRight?: React.ReactNode;
  /** Binnen een persoonlijke respondent-link gaat het logo naar "Mijn metingen" i.p.v. de publieke homepage (CLAUDE.md sectie 3). */
  logoHref?: string;
}) {
  return (
    <header className="nav">
      <Link href={logoHref} className="nav-logo">
        <Image
          src="/LOGO/Coniche_MMW_standard.svg"
          alt="Coniche"
          width={200}
          height={44}
          style={{ height: "44px", width: "auto" }}
          priority
        />
      </Link>
      {badge && (
        <span
          className={badgeKleur ? "nav-badge nav-badge-rol" : "nav-badge"}
          style={badgeKleur ? { background: badgeKleur } : undefined}
        >
          {badge}
        </span>
      )}
      {navRight && <div className="nav-right">{navRight}</div>}
    </header>
  );
}
