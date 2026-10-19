"use client";

import { use } from "react";
import Link from "next/link";
import { useAssessment } from "@/lib/assessment-store";
import { actieveVragen } from "@/lib/assessment-structuur";
import { PageWithChrome } from "@/components/PageWithChrome";
import { InfoIcoon } from "@/components/InfoIcoon";
import { AssessmentIcon } from "@/components/icons/AssessmentIcons";
import { HelpFilm } from "@/components/help/HelpFilm";

export default function AssessmentLandingPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const assessment = useAssessment(assessmentId);

  if (!assessment) {
    return (
      <PageWithChrome>
        <div className="container section" style={{ textAlign: "center" }}>
          Assessment niet gevonden.
        </div>
      </PageWithChrome>
    );
  }

  const assessmentVast = assessment;
  const totaalVragen = actieveVragen(assessmentVast).length;
  // De film toont staven op de schaal van 1 tot 5, dus alleen bij een scan met die schaal.
  const metFilm = assessment.antwoordType !== "ja-nee-weetniet";

  return (
    <PageWithChrome>
      <div
        style={{
          background: "linear-gradient(180deg, var(--or-faint) 0%, var(--bg) 65%)",
        }}
      >
        <div className="container" style={{ padding: "4.5rem 2rem 3rem", textAlign: "center" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "4.75rem",
                height: "4.75rem",
                borderRadius: "50%",
                background: "var(--bg)",
                boxShadow: "0 10px 28px rgba(28, 28, 26, 0.1)",
              }}
            >
              <AssessmentIcon
                name={assessment.icoon}
                style={{ width: "2.25rem", height: "2.25rem", color: "var(--or)" }}
              />
            </div>
          </div>
          <span className="eyebrow">Coniche Scan</span>
          <h1>{assessment.naam}</h1>
          <p
            style={{
              maxWidth: "34rem",
              margin: "0 auto",
              fontSize: "var(--fs-18)",
              fontWeight: 700,
              color: "var(--ink)",
            }}
          >
            {assessment.subtitel}
          </p>
          <p style={{ maxWidth: "38rem", margin: "1rem auto 0" }}>{assessment.beschrijving}</p>
          <p className="text-sm" style={{ color: "var(--ink-s)", marginTop: "0.6rem" }}>
            Bedoeld voor: {assessment.doelgroep}
          </p>

          <div className="btn-rij" style={{ margin: "2.5rem auto 0", maxWidth: "26rem" }}>
            <div style={{ display: "flex", flex: 1, alignItems: "center", gap: "0.5rem" }}>
              <button type="button" disabled className="btn btn-or">
                Start assessment
              </button>
              <InfoIcoon sleutel="info.startAssessment" />
            </div>
            {/* Bij een scan met de film vervangt de knop onder de film deze link (CLAUDE.md, scherm 2). */}
            {metFilm ? null : (
              <Link href={`/${assessment.id}/voorbeeld`} className="btn btn-outline">
                Bekijk wat je krijgt
              </Link>
            )}
          </div>
          <p className="text-xs" style={{ maxWidth: "26rem", margin: "1rem auto 0", color: "var(--ink-s)" }}>
            Deze scan vul je in via een persoonlijke link die Coniche met je deelt — neem contact
            op met Coniche om een scan te starten voor jouw organisatie.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "5rem" }}>
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-3"
          style={{ marginTop: "-2.5rem", position: "relative", zIndex: 1 }}
        >
          {assessment.featureCards.map((card, i) => (
            <div key={card.titel} className="card card-accent-top" style={{ background: "var(--bg)" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2.2rem",
                  height: "2.2rem",
                  borderRadius: "50%",
                  background: "var(--or-faint)",
                  color: "var(--or)",
                  fontWeight: 800,
                  fontSize: "var(--fs-14)",
                  marginBottom: "0.9rem",
                }}
              >
                {i + 1}
              </span>
              <h3>{card.titel}</h3>
              <p className="text-sm" style={{ color: "var(--ink-m)" }}>
                {card.tekst}
              </p>
            </div>
          ))}
        </div>

        {/* De film Wat krijg ik (`help.md`, Films): Tussen de kaarten en Praktische informatie, met de knop naar de Voorbeeld-output.
            Alleen bij een scan met een schaal van 1 tot 5: De film toont staven op die schaal. */}
        {metFilm && (
          <HelpFilm
            naam="wat-krijg-ik"
            opmerking="Alle cijfers in de film zijn voorbeelddata."
            knop={
              <Link href={`/${assessment.id}/voorbeeld`} className="btn btn-or">
                Bekijk de voorbeeld-output
              </Link>
            }
          />
        )}

        <div className="card card-warm" style={{ marginTop: "2.5rem" }}>
          <h3>Praktische informatie</h3>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3" style={{ marginTop: "1.2rem" }}>
            <div>
              <dt className="eyebrow" style={{ marginBottom: "0.3rem" }}>
                Invultijd
              </dt>
              <dd className="text-sm" style={{ color: "var(--ink-m)" }}>
                {assessment.geschatteDuur}, verdeeld over {totaalVragen} vragen.
              </dd>
            </div>
            <div>
              <dt className="eyebrow" style={{ marginBottom: "0.3rem" }}>
                Direct resultaat
              </dt>
              <dd className="text-sm" style={{ color: "var(--ink-m)" }}>
                Na afronding zie je meteen je scores en classificaties.
              </dd>
            </div>
            <div>
              <dt className="eyebrow" style={{ marginBottom: "0.3rem" }}>
                Privacy
              </dt>
              <dd className="text-sm" style={{ color: "var(--ink-m)" }}>
                Toegang verloopt via een persoonlijke, niet-herleidbare link die Coniche met je
                deelt.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </PageWithChrome>
  );
}
