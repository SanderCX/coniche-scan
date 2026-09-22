"use client";

import { useIngelogd } from "@/lib/admin-auth";
import { useTestModus } from "@/lib/instellingen";
import { BeheerLoginForm } from "@/components/beheer/BeheerLoginForm";
import { BeheerChrome } from "@/components/beheer/BeheerChrome";

export default function BeheerLayout({ children }: { children: React.ReactNode }) {
  const ingelogd = useIngelogd();
  const testModus = useTestModus();

  if (!ingelogd && !testModus) {
    return <BeheerLoginForm />;
  }

  return <BeheerChrome>{children}</BeheerChrome>;
}
