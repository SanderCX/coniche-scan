"use client";

import { useEffect, useState } from "react";
import { actieveSectie } from "@/components/assessment/AssessmentSubNav";

export interface Sprongpil {
  id: string;
  label: string;
}

/**
 * De sprongnavigatie op het organisatie-detail (`beheerpagina.md`, punt 4, Sprongnavigatie): De Sub-nav uit `stylesheet.md` (capsule met pillen, 64px, sticky onder de nav)
 * zonder knop rechts, met een pil per onderdeel van de pagina. Een klik scrolt naar het onderdeel (de pillen zijn ankerlinks), de pil van het onderdeel waar je staat is
 * massief oranje en onderaan de pagina is de laatste pil actief.
 */
export function OrganisatieSprongnav({ pillen }: { pillen: Sprongpil[] }) {
  const [actief, setActief] = useState<string | null>(pillen[0]?.id ?? null);

  useEffect(() => {
    function meet() {
      const tops = pillen.flatMap((p) => {
        const el = document.getElementById(p.id);
        return el ? [{ id: p.id, top: el.getBoundingClientRect().top }] : [];
      });
      const balkOnder = document.querySelector(".ap-subnav")?.getBoundingClientRect().bottom ?? 136;
      const onderaan = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setActief(onderaan ? (pillen[pillen.length - 1]?.id ?? null) : (actieveSectie(tops, balkOnder + 90) ?? pillen[0]?.id ?? null));
    }
    meet();
    window.addEventListener("scroll", meet, { passive: true });
    window.addEventListener("resize", meet);
    return () => {
      window.removeEventListener("scroll", meet);
      window.removeEventListener("resize", meet);
    };
  }, [pillen]);

  return (
    <nav className="ap-subnav" aria-label="Onderdelen van deze pagina">
      <div className="ap-subnav-binnen org-sprongnav-binnen">
        <div className="ap-subnav-pillen">
          {pillen.map((p) => (
            <a key={p.id} href={`#${p.id}`} className={`ap-subnav-pil ${actief === p.id ? "is-actief" : ""}`} aria-current={actief === p.id ? "true" : undefined}>
              {p.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
