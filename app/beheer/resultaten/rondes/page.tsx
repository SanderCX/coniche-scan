"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** De tab Rondes bestaat niet meer (`beheerpagina.md`, punt 7): Het oude adres stuurt door naar de tab Metingen. */
export default function RondesVerwezen() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/beheer/resultaten/metingen");
  }, [router]);
  return null;
}
