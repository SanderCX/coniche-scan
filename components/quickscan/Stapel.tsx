"use client";

import { useEffect, useRef, useState } from "react";

export interface StapelDeel {
  /** Het aantal (of de grootte) van dit deel: Bij 0 is er geen segment. */
  waarde: number;
  kleur: string;
  tekstkleur?: string;
  /** De tekst in de tooltip, bijvoorbeeld "Ja: 4". */
  titel: string;
}

/** Het getal staat alleen in het segment als het segment minstens zo breed is (`stylesheet.md`, Balklijst, Gestapelde balk). */
export const MIN_SEGMENT_PX = 24;

/**
 * De gestapelde balk (Ja, Nee en Weet ik niet): Het hele spoor is in elke rij even breed en de segmenten verdelen het naar
 * verhouding, afgerond op hele pixels. Een getal staat alleen in een segment van minstens 24px, anders staat het in de tooltip. Een
 * antwoord dat niemand gaf, heeft geen segment. De hoogte is `--balk-h-l` (`.qv-stapel`).
 */
export function Stapel({ delen, ariaLabel, style }: { delen: StapelDeel[]; ariaLabel: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [breedte, setBreedte] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const meet = () => setBreedte(Math.round(el.getBoundingClientRect().width));
    meet();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(meet);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const zichtbaar = delen.filter((d) => d.waarde > 0);
  const totaal = zichtbaar.reduce((n, d) => n + d.waarde, 0);
  // Hele pixels: De grens van elk segment is de afgeronde cumulatieve verhouding, dus de som is precies de breedte van het spoor.
  const grenzen = zichtbaar.map((_, i) => Math.round((zichtbaar.slice(0, i + 1).reduce((n, d) => n + d.waarde, 0) / totaal) * breedte));
  const px = grenzen.map((g, i) => g - (i === 0 ? 0 : grenzen[i - 1]));
  return (
    <div ref={ref} className="qv-stapel" style={style} role="img" aria-label={ariaLabel}>
      {zichtbaar.map((d, i) => (
        <div key={d.titel} style={{ width: breedte === 0 ? `${(d.waarde / totaal) * 100}%` : px[i], background: d.kleur, color: d.tekstkleur }} title={d.titel}>
          {px[i] >= MIN_SEGMENT_PX ? d.waarde : ""}
        </div>
      ))}
    </div>
  );
}
