"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface BeheerMeldingInhoud {
  tekst: string;
  link?: { href: string; label: string };
}

let huidig: BeheerMeldingInhoud | null = null;
const luisteraars = new Set<() => void>();

/** Zet een melding bovenaan de beheerpagina (beheerpagina.md, "Wat er gebeurt na een actie in het Respondent-overzicht"). */
export function zetBeheerMelding(melding: BeheerMeldingInhoud | null): void {
  huidig = melding;
  luisteraars.forEach((l) => l());
}

function subscribe(l: () => void) {
  luisteraars.add(l);
  return () => luisteraars.delete(l);
}

export function BeheerMeldingBalk() {
  const melding = useSyncExternalStore(
    subscribe,
    () => huidig,
    () => null
  );
  const pathname = usePathname();

  // Een melding hoort bij de pagina waar de actie gebeurde: wisselen van pagina ruimt hem op.
  useEffect(() => {
    return () => zetBeheerMelding(null);
  }, [pathname]);

  if (!melding) return null;
  return (
    <div className="beheer-melding" role="status">
      <div className="admin-notice">
        <span>
          {melding.tekst}
          {melding.link && (
            <>
              {" "}
              <Link href={melding.link.href} className="font-semibold" style={{ color: "var(--or)" }}>
                {melding.link.label}
              </Link>
            </>
          )}
        </span>
        <button type="button" className="admin-sort-btn" onClick={() => zetBeheerMelding(null)} aria-label="Melding sluiten">
          ✕
        </button>
      </div>
    </div>
  );
}
