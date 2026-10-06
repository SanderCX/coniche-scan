"use client";

import { useEffect } from "react";
import { devAutoLogin, useIngelogdeGebruiker } from "@/lib/admin-auth";
import { BeheerLoginForm } from "@/components/beheer/BeheerLoginForm";
import { BeheerChrome } from "@/components/beheer/BeheerChrome";

export default function BeheerLayout({ children }: { children: React.ReactNode }) {
  // useIngelogdeGebruiker() geeft null terug bij geen sessie, maar ook als de
  // opgeslagen gebruikerId niet meer bestaat of inmiddels gedeactiveerd is
  // (bijv. door een Admin in een andere tab) — beide gevallen tonen het
  // inlogscherm opnieuw, geen kapotte "ingelogd zonder gebruiker"-staat.
  const gebruiker = useIngelogdeGebruiker();

  // Alleen in `next dev`: Start ingelogd als Admin (lib/admin-auth.ts, `devAutoLogin`).
  useEffect(() => {
    if (!gebruiker) devAutoLogin();
  }, [gebruiker]);

  if (!gebruiker) {
    return <BeheerLoginForm />;
  }

  return <BeheerChrome>{children}</BeheerChrome>;
}
