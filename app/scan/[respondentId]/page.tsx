"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScanInvulling } from "@/lib/db";
import { PageWithChrome } from "@/components/PageWithChrome";
import { volgendeUrl } from "@/lib/scan-routing";

/**
 * Interne route, per scan-invulling: stuurt door naar het scherm dat bij
 * de status hoort. Het publieke startpunt is de korte respondent-link
 * (`/s/[code]`, v1-aanpassingen.md punt 2), die hier op uitkomt.
 */
export default function ScanGatePage({
  params,
}: {
  params: Promise<{ respondentId: string }>;
}) {
  const { respondentId } = use(params);
  const gegevens = useScanInvulling(respondentId);
  const router = useRouter();

  useEffect(() => {
    if (!gegevens) return;
    router.replace(volgendeUrl(respondentId, gegevens.invulling.status));
  }, [gegevens, respondentId, router]);

  if (!gegevens) {
    return (
      <PageWithChrome>
        <div className="container section" style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1>Ongeldige link</h1>
          <p>
            Deze uitnodiging bestaat niet (meer). Neem contact op met Coniche voor een nieuwe
            link.
          </p>
        </div>
      </PageWithChrome>
    );
  }

  return (
    <PageWithChrome>
      <div className="flex-1 px-6 py-16 text-center text-ink-m">Laden...</div>
    </PageWithChrome>
  );
}
