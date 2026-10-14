"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * De pagina Ingevulde scans bestaat niet meer (`beheerpagina.md`, punt 7): De scans staan per Meting in het
 * Meting-overzicht. Het oude adres stuurt door naar Resultaten › Metingen, met het filter Organisatie als dat er was.
 */
function Doorverwijzing() {
  const router = useRouter();
  const organisatie = useSearchParams().get("organisatie");
  useEffect(() => {
    router.replace(organisatie ? `/beheer/resultaten/metingen?organisatie=${encodeURIComponent(organisatie)}` : "/beheer/resultaten/metingen");
  }, [router, organisatie]);
  return null;
}

export default function IngevuldeScansVerwezen() {
  return (
    <Suspense fallback={null}>
      <Doorverwijzing />
    </Suspense>
  );
}
