"use client";

import { useEffect, useState } from "react";
import { PaginaSectie } from "@/lib/landing";

/** De sectie waar je staat (`CLAUDE.md`, scherm 2, Sticky sub-nav): De laatste sectie waarvan de bovenkant minder dan 170px onder de bovenkant van het venster staat. */
export function actieveSectie(tops: { id: string; top: number }[], grens = 170): string | null {
  let actief: string | null = null;
  for (const t of tops) if (t.top < grens) actief = t.id;
  return actief;
}

/**
 * De sticky sub-nav van de Assessment-pagina (`CLAUDE.md`, scherm 2, Herontwerp; `stylesheet.md`, Assessmenttegel en sub-nav): Een balk van 64px direct
 * onder de hoofd-nav, met de inhoud op de breedte van de pagina: Links een capsule met een pil per sectie (de pilvormige groep), rechts de
 * uitgeschakelde knop "Start assessment". Een klik op een pil scrolt naar de sectie (de pillen zijn gewone ankerlinks, `scroll-margin-top` laat ruimte
 * voor de nav en de sub-nav), de pil van de sectie waar je staat is gevuld in `--or`.
 */
export function AssessmentSubNav({ secties }: { secties: PaginaSectie[] }) {
  const [actief, setActief] = useState<string | null>(null);

  useEffect(() => {
    function meet() {
      const tops = secties.flatMap((s) => {
        const el = document.getElementById(s.id);
        return el ? [{ id: s.id, top: el.getBoundingClientRect().top }] : [];
      });
      setActief(actieveSectie(tops));
    }
    meet();
    window.addEventListener("scroll", meet, { passive: true });
    window.addEventListener("resize", meet);
    return () => {
      window.removeEventListener("scroll", meet);
      window.removeEventListener("resize", meet);
    };
  }, [secties]);

  return (
    <nav className="ap-subnav" aria-label="Onderdelen van deze pagina">
      <div className="container ap-subnav-binnen">
        <div className="ap-subnav-pillen">
          {secties.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={`ap-subnav-pil ${actief === s.id ? "is-actief" : ""}`} aria-current={actief === s.id ? "location" : undefined}>
              {s.label}
            </a>
          ))}
        </div>
        <button type="button" disabled className="btn btn-or btn-compact">
          Start assessment
        </button>
      </div>
    </nav>
  );
}
