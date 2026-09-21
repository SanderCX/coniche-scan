"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRespondent, importRespondent } from "@/lib/db";
import { decodeBootstrap } from "@/lib/uitnodiging-link";
import { PageWithChrome } from "@/components/PageWithChrome";

/**
 * De "Publieke link" (v1-aanpassingen.md punt 2a): het adres dat de admin
 * handmatig deelt. Geen verificatiescherm — stuurt rechtstreeks door naar
 * het scherm dat bij de status van de respondent hoort.
 */
function volgendeUrl(respondentId: string, status: string): string {
  if (status === "afgerond") return `/scan/${respondentId}/resultaten`;
  if (status === "bezig") return `/scan/${respondentId}/doorloop`;
  return `/scan/${respondentId}/intake`;
}

export default function ScanGatePage({
  params,
  searchParams,
}: {
  params: Promise<{ respondentId: string }>;
  searchParams: Promise<{ b?: string }>;
}) {
  const { respondentId } = use(params);
  const { b: bootstrapParam } = use(searchParams);
  const gegevens = useRespondent(respondentId);
  const router = useRouter();

  // Deze browser heeft mogelijk nog geen lokale data (bijv. de respondent die
  // de link vanuit zijn eigen e-mailclient/chat opent, i.p.v. de browser
  // waarin de scan is aangemaakt) — de link draagt de benodigde gegevens dan
  // zelf mee via de `b`-param, zie lib/uitnodiging-link.ts.
  useEffect(() => {
    if (gegevens || !bootstrapParam) return;
    const bootstrap = decodeBootstrap(bootstrapParam);
    if (bootstrap && bootstrap.respondent.id === respondentId) {
      importRespondent(bootstrap.organisatie, bootstrap.respondent);
    }
  }, [gegevens, bootstrapParam, respondentId]);

  useEffect(() => {
    if (!gegevens) return;
    router.replace(volgendeUrl(respondentId, gegevens.respondent.status));
  }, [gegevens, respondentId, router]);

  if (!gegevens) {
    if (bootstrapParam) {
      return (
        <PageWithChrome>
          <div className="flex-1 px-6 py-16 text-center text-ink-m">Laden...</div>
        </PageWithChrome>
      );
    }
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
