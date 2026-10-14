"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScanUitvoering } from "@/lib/types";

/**
 * De eyebrow boven de titel van een resultatenpagina van een Meting. Tijdens een vergelijking staat er "Vergelijking met
 * {naam van de vorige ronde}" in plaats van het label van de Meting zelf (`visualisatie-scores.md`, Navigatie).
 */
export function VergelijkingEyebrow({
  label,
  eerdereMetingen,
  rondeLabelVan,
}: {
  label: string;
  eerdereMetingen: ScanUitvoering[];
  /** De naam van de ronde van een eerdere Meting: De vergelijking is met een vorige ronde. Zonder ronde geldt het label. */
  rondeLabelVan?: (meting: ScanUitvoering) => string | undefined;
}) {
  return (
    <Suspense fallback={<span className="eyebrow">{label}</span>}>
      <Inhoud label={label} eerdereMetingen={eerdereMetingen} rondeLabelVan={rondeLabelVan} />
    </Suspense>
  );
}

function Inhoud({
  label,
  eerdereMetingen,
  rondeLabelVan,
}: {
  label: string;
  eerdereMetingen: ScanUitvoering[];
  rondeLabelVan?: (meting: ScanUitvoering) => string | undefined;
}) {
  const id = useSearchParams().get("vergelijk");
  const vorige = id ? eerdereMetingen.find((m) => m.id === id) : undefined;
  const naam = vorige ? (rondeLabelVan?.(vorige) ?? vorige.label) : undefined;
  return <span className="eyebrow">{naam ? `Vergelijking met ${naam}` : label}</span>;
}
