"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** De hoofdlink Resultaten opent op de tab Rondes (`beheerpagina.md`, punt 7). */
export default function ResultatenIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/beheer/resultaten/rondes");
  }, [router]);
  return null;
}
