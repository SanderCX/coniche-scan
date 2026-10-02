"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * "Overzicht" als apart dashboardscherm vervalt (beheerpagina.md, Wat
 * beheerbaar is): geen 4e link meer naast Applicatie/Assessments/
 * Organisaties, je landt direct op een van de drie. Organisaties is de
 * enige van de drie die zowel Admin als Consultant ziet, dus de
 * natuurlijke landingsplek na inloggen. De vroegere dashboardcijfers zijn
 * verdeeld over hun eigen sectie: Assessment-types staat al op
 * `/beheer/content`, Data-integriteit staat nu op `/beheer/applicatie`.
 */
export default function BeheerRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/beheer/organisaties");
  }, [router]);

  return null;
}
