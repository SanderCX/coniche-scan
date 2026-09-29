"use client";

import { useIngelogd } from "@/lib/admin-auth";
import { BeheerLoginForm } from "@/components/beheer/BeheerLoginForm";
import { BeheerChrome } from "@/components/beheer/BeheerChrome";

export default function BeheerLayout({ children }: { children: React.ReactNode }) {
  const ingelogd = useIngelogd();

  if (!ingelogd) {
    return <BeheerLoginForm />;
  }

  return <BeheerChrome>{children}</BeheerChrome>;
}
