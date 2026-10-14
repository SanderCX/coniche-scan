"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * De tab Import bestaat niet meer: Importeren is een knop in het organisatie-detail (`beheerpagina.md`, punt 8). Het oude
 * adres stuurt door naar de lijst Organisaties.
 */
export default function ImportVerwezen() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/beheer/organisaties");
  }, [router]);
  return null;
}
