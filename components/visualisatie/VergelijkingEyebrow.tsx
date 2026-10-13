"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScanUitvoering } from "@/lib/types";

/**
 * De eyebrow boven de titel van een resultatenpagina van een Meting. Tijdens een vergelijking staat er "Vergelijking met
 * {label van de vorige Meting}" in plaats van het label van de Meting zelf (`visualisatie-scores.md`, Navigatie).
 */
export function VergelijkingEyebrow({ label, eerdereMetingen }: { label: string; eerdereMetingen: ScanUitvoering[] }) {
  return (
    <Suspense fallback={<span className="eyebrow">{label}</span>}>
      <Inhoud label={label} eerdereMetingen={eerdereMetingen} />
    </Suspense>
  );
}

function Inhoud({ label, eerdereMetingen }: { label: string; eerdereMetingen: ScanUitvoering[] }) {
  const id = useSearchParams().get("vergelijk");
  const vorige = id ? eerdereMetingen.find((m) => m.id === id) : undefined;
  return <span className="eyebrow">{vorige ? `Vergelijking met ${vorige.label}` : label}</span>;
}
