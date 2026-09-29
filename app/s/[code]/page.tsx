"use client";

import { use } from "react";
import Link from "next/link";
import { useRespondentPerToegangscode } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { voortgang } from "@/lib/scoring";
import { volgendeUrl } from "@/lib/scan-routing";
import { ScanInvullingStatus } from "@/lib/types";
import { PageWithChrome } from "@/components/PageWithChrome";

const STATUS_LABEL: Record<ScanInvullingStatus, string> = {
  uitgenodigd: "Nog te starten",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

/**
 * De publieke respondent-link (v1-aanpassingen.md punt 2): alleen een
 * toegangscode, geen gegevens. Gaat altijd eerst naar "Mijn metingen"
 * (CLAUDE.md sectie 3, scherm 4), ook bij precies één invulling. De 4
 * vaste links (Visie/Bouwstenen/AI/2030) staan in de nav, niet meer als
 * losse kaarten op de pagina zelf — dit is de hub, dus zonder terugknop.
 */
export default function ToegangscodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const gegevens = useRespondentPerToegangscode(code);
  const assessments = useAssessments();

  if (!gegevens) {
    return (
      <PageWithChrome>
        <div className="container section" style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1>Ongeldige link</h1>
          <p>Deze link bestaat niet (meer). Neem contact op met Coniche voor een nieuwe link.</p>
        </div>
      </PageWithChrome>
    );
  }

  const { lid, invullingen } = gegevens;

  return (
    <PageWithChrome logoHref={`/s/${code}`} code={code}>
      <div className="container section" style={{ maxWidth: "40rem" }}>
        <span className="eyebrow">Mijn metingen</span>
        <h1>Welkom terug{lid.naam ? `, ${lid.naam}` : ""}</h1>

        {invullingen.length === 0 ? (
          <p className="mt-4">Je hebt op dit moment geen lopende meting.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-6">
            {invullingen.map(({ scanUitvoering, invulling }) => {
              const assessment = assessments.find((a) => a.id === scanUitvoering.assessmentId);
              const { percentage } = assessment
                ? voortgang(assessment, invulling.antwoorden)
                : { percentage: 0 };
              return (
                <Link
                  key={invulling.id}
                  href={volgendeUrl(invulling.id, invulling.status)}
                  className="card"
                  style={{ display: "block" }}
                >
                  <p className="font-semibold text-ink">
                    {scanUitvoering.label} — {assessment?.naam ?? "Onbekend type"}
                  </p>
                  <p className="text-sm text-ink-m mt-1">
                    {STATUS_LABEL[invulling.status]}
                    {invulling.status !== "afgerond" && ` · ${percentage}%`}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageWithChrome>
  );
}
