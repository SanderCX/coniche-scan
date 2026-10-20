"use client";

import { use } from "react";
import Link from "next/link";
import { useAssessment } from "@/lib/assessment-store";
import { actieveVragen } from "@/lib/assessment-structuur";
import { PageWithChrome } from "@/components/PageWithChrome";
import { InfoIcoon } from "@/components/InfoIcoon";
import { AssessmentIcon } from "@/components/icons/AssessmentIcons";
import { HelpFilm } from "@/components/help/HelpFilm";
import { bouwstenenLink, heroUitleg } from "@/lib/landing";
import { KAART_ICONEN, KlokIcoon, SlotIcoon, StaafIcoon, icoonVoorSubtitel } from "@/components/icons/LandingIcons";

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
  const link = bouwstenenLink(assessment);

  return (
    <PageWithChrome>
      {/* De hero (`CLAUDE.md`, scherm 2, Bovenkant, design Open-B, besloten door Joost op 20 oktober 2026): Gecentreerd op wit, zonder gradient. */}
      <div className="container landing-hero">
        <div className="landing-icoon">
          <AssessmentIcon name={assessment.icoon} style={{ width: "28px", height: "28px", color: "var(--or)" }} />
        </div>
        <span className="eyebrow">Coniche Scan</span>
        <h1>{assessment.naam}</h1>
        <p className="landing-uitleg">{heroUitleg(assessment.beschrijving)}</p>
        {link && (
          <Link href={link.href} className="tekst-link landing-link">
            {link.tekst}
          </Link>
        )}
        <ul className="landing-kenmerken">
          {assessment.subtitel
            .split(/(?<=\.)\s+/)
            .filter(Boolean)
            .map((deel) => {
              const Icoon = icoonVoorSubtitel(deel);
              return (
                <li key={deel}>
                  {Icoon && <Icoon aria-hidden="true" style={{ width: "20px", height: "20px", flexShrink: 0, color: "var(--ink-s)" }} />}
                  {deel}
                </li>
              );
            })}
        </ul>
        <div className="landing-start">
          <button type="button" disabled className="btn btn-or">
            Start assessment
          </button>
          <InfoIcoon sleutel="info.startAssessment" />
        </div>
        <p className="landing-toelichting">Toegang loopt via een persoonlijke link van Coniche. Heb je die niet, neem dan contact op.</p>
        <p className="landing-doelgroep">Bedoeld voor: {assessment.doelgroep}</p>
      </div>

      <div className="container" style={{ paddingBottom: "5rem" }}>
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-3"
          style={{ marginTop: 0 }}
        >
          {assessment.featureCards.map((card, i) => {
            const KaartIcoon = KAART_ICONEN[i];
            return (
            <div key={card.titel} className="card card-accent-top" style={{ background: "var(--bg)" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {KaartIcoon && <KaartIcoon aria-hidden="true" style={{ width: "1.5rem", height: "1.5rem", flexShrink: 0, color: "var(--ink-s)" }} />}
                {card.titel}
              </h3>
              <p className="text-sm" style={{ color: "var(--ink-m)" }}>
                {card.tekst}
              </p>
            </div>
            );
          })}
        </div>

        {/* De film Wat krijg ik (`help.md`, Films, Varianten van Wat krijg ik per Assessment-type): Tussen de kaarten en Praktische informatie,
            met de knop naar de Voorbeeld-output. Elk type heeft zijn eigen variant: Categorieën, domeinen of percentages. */}
        <HelpFilm
          naam="wat-krijg-ik"
          assessment={assessment}
          opmerking="Alle cijfers in de film zijn voorbeelddata."
          knop={
            <Link href={`/${assessment.id}/voorbeeld`} className="btn btn-or">
              Bekijk de voorbeeld-output
            </Link>
          }
        />

        <div className="card card-warm" style={{ marginTop: "2.5rem" }}>
          <h3>Praktische informatie</h3>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3" style={{ marginTop: "1.2rem" }}>
            <div>
              <dt className="eyebrow" style={{ marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <KlokIcoon aria-hidden="true" style={{ width: "1.25rem", height: "1.25rem", flexShrink: 0, color: "var(--ink-s)" }} />
                Invultijd
              </dt>
              <dd className="text-sm" style={{ color: "var(--ink-m)" }}>
                {assessment.geschatteDuur}, verdeeld over {totaalVragen} vragen.
              </dd>
            </div>
            <div>
              <dt className="eyebrow" style={{ marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <StaafIcoon aria-hidden="true" style={{ width: "1.25rem", height: "1.25rem", flexShrink: 0, color: "var(--ink-s)" }} />
                Direct resultaat
              </dt>
              <dd className="text-sm" style={{ color: "var(--ink-m)" }}>
                Na afronding zie je meteen je scores en classificaties.
              </dd>
            </div>
            <div>
              <dt className="eyebrow" style={{ marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <SlotIcoon aria-hidden="true" style={{ width: "1.25rem", height: "1.25rem", flexShrink: 0, color: "var(--ink-s)" }} />
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
