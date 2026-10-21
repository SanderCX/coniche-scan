"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAssessment } from "@/lib/assessment-store";
import { actieveVragen } from "@/lib/assessment-structuur";
import { PageWithChrome } from "@/components/PageWithChrome";
import { InfoIcoon } from "@/components/InfoIcoon";
import { AssessmentIcon } from "@/components/icons/AssessmentIcons";
import { HelpFilm } from "@/components/help/HelpFilm";
import { bouwstenenLink, contentSoort, heroUitleg, paginaSecties } from "@/lib/landing";
import { MijnGegevensMenuVoorCode } from "@/components/MijnGegevensMenuVoorCode";
import { AssessmentSubNav } from "@/components/assessment/AssessmentSubNav";
import { Sectie } from "@/components/assessment/Sectie";
import { PraktischSectie } from "@/components/assessment/PraktischSectie";
import { VisieSectie } from "@/components/assessment/VisieSectie";
import { BouwblokkenSectie } from "@/components/assessment/BouwblokkenSectie";
import { AiDomeinenSectie } from "@/components/assessment/AiDomeinenSectie";
import { Content2030Sectie } from "@/components/assessment/Content2030Sectie";
import { SpanningVeldenSectie } from "@/components/assessment/SpanningVeldenSectie";
import { SpanningVisieSectie } from "@/components/assessment/SpanningVisieSectie";
import { AfdelingenSectie } from "@/components/assessment/AfdelingenSectie";
import { KAART_ICONEN, KlokIcoon, SlotIcoon, StaafIcoon, icoonVoorSubtitel } from "@/components/icons/LandingIcons";

export default function AssessmentLandingPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  return (
    <Suspense fallback={null}>
      <AssessmentLanding assessmentId={assessmentId} />
    </Suspense>
  );
}

/**
 * De Assessment-pagina (`CLAUDE.md`, scherm 2, Herontwerp van 21 oktober 2026): De hero, bij een Assessment met content een sticky sub-nav en de
 * secties (Visie en de 15 bouwblokken, of AI in klantcontact en 2030), "Wat krijg ik" en "Praktisch". De Quickscan heeft nog geen content en houdt de
 * opbouw zonder sub-nav. Met een persoonlijke code in het adres (`?code=`, via "Over deze scan" op Mijn metingen) toont de nav "← Terug naar Mijn
 * metingen" en "Mijn gegevens".
 */
function AssessmentLanding({ assessmentId }: { assessmentId: string }) {
  const assessment = useAssessment(assessmentId);
  const code = useSearchParams().get("code") ?? undefined;
  const chrome = {
    code,
    toonTerug: !!code,
    logoHref: code ? `/s/${code}` : undefined,
    identiteitMenu: code ? <MijnGegevensMenuVoorCode code={code} /> : undefined,
  };

  if (!assessment) {
    return (
      <PageWithChrome {...chrome}>
        <div className="container section" style={{ textAlign: "center" }}>
          Assessment niet gevonden.
        </div>
      </PageWithChrome>
    );
  }

  const totaalVragen = actieveVragen(assessment).length;
  const link = bouwstenenLink(assessment);
  const secties = paginaSecties(assessment);
  const soort = contentSoort(assessment);
  const metContent = secties.length > 0;

  const featureKaarten = (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3" style={{ marginTop: 0 }}>
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
  );

  const praktisch = (
    <div className="card card-warm">
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
            Toegang verloopt via een persoonlijke, niet-herleidbare link die Coniche met je deelt.
          </dd>
        </div>
      </dl>
    </div>
  );

  const voorbeeldKnop = (
    <Link href={`/${assessment.id}/voorbeeld`} className="btn btn-or">
      Bekijk de voorbeeld-output
    </Link>
  );

  // De secties in de volgorde van 21 oktober 2026, met een afwisselende achtergrond die met wit begint (`CLAUDE.md`, scherm 2).
  const wat = (warm: boolean) => (
    <Sectie
      key="wat"
      id="wat"
      warm={warm}
      kop="Zo ziet je resultaat eruit"
      inleiding={
        soort === "quickscan"
          ? "Na afronding zie je meteen je totaalpercentage en je score per afdeling. Hieronder zie je hoe dat eruitziet, met voorbeelddata."
          : soort === "spanning"
          ? "Je krijgt direct je eigen Spanningsprofiel. Daarna leggen we de profielen van de groep naast elkaar. Alle cijfers hieronder zijn voorbeelddata."
          : soort === "ai"
          ? "Na afronding zie je meteen je totaalscore en je score per domein. Hieronder zie je hoe dat eruitziet, met voorbeelddata."
          : "Na afronding zie je meteen je totaalscore en je score per categorie en per bouwblok. Hieronder zie je hoe dat eruitziet, met voorbeelddata."
      }
      kinderen={
        soort === "spanning" || soort === "quickscan" ? (
          // De Spanningsmeter en de Quickscan hebben alleen de film Wat krijg ik: De Spanningsmeter heeft geen Dossier, de Quickscan geen bouwblokken met een radar. De Spanningsmeter heeft één film en geen feature-kaarten, en het Dossier is er niet voor (`visualisatie-spanningsmeter.md`).
          <HelpFilm naam="wat-krijg-ik" assessment={assessment} opmerking="Alle cijfers in de film zijn voorbeelddata." knop={voorbeeldKnop} />
        ) : (
          // De drie feature-cards komen niet meer terug (besloten door Joost op 21 oktober 2026): De zin over aantoonbaar bewijs staat bij Praktisch.
          <>
            <HelpFilm naam="wat-krijg-ik" assessment={assessment} opmerking="Alle cijfers in de film zijn voorbeelddata." knop={voorbeeldKnop} />
            <HelpFilm naam="dossier" assessment={assessment} />
          </>
        )
      }
    />
  );
  const sectieNodes: ((warm: boolean) => React.ReactNode)[] = [
    (warm) =>
      soort === "spanning" ? (
        <SpanningVeldenSectie key="velden" assessment={assessment} warm={warm} />
      ) : soort === "quickscan" ? (
        <AfdelingenSectie key="afdelingen" assessment={assessment} warm={warm} />
      ) : soort === "ai" ? (
        <AiDomeinenSectie key="ai" warm={warm} />
      ) : (
        <BouwblokkenSectie key="bouwblokken" warm={warm} />
      ),
    (warm) => <PraktischSectie key="praktisch" assessment={assessment} aantalVragen={totaalVragen} warm={warm} />,
    wat,
    (warm) =>
      soort === "spanning" ? (
        <SpanningVisieSectie key="visie" warm={warm} />
      ) : soort === "ai" ? (
        <Content2030Sectie key="2030" warm={warm} />
      ) : (
        <VisieSectie key="visie" warm={warm} />
      ),
  ];

  return (
    <PageWithChrome {...chrome}>
      {metContent ? (
        <>
          {/* De kop (`CLAUDE.md`, scherm 2, Bovenkant, tweede ronde van 21 oktober 2026): Alleen het icoon en de titel op één regel, links uitgelijnd. */}
          <div className="container ap-kop">
            <span className="ap-kop-icoon">
              <AssessmentIcon name={assessment.icoon} style={{ width: "28px", height: "28px", color: "var(--or)" }} strokeWidth={1.8} />
            </span>
            <h1>{assessment.naam}</h1>
          </div>
          <AssessmentSubNav secties={secties} />
          {sectieNodes.map((maak, i) => maak(i % 2 === 1))}
        </>
      ) : (
        <>
          {/* Een Assessment zonder content (de Quickscan) houdt voorlopig de hero van 20 oktober 2026 (`CLAUDE.md`, scherm 2, Bovenkant, design Open-B). */}
          <div className="container landing-hero">
            <div className="landing-icoon">
              <AssessmentIcon name={assessment.icoon} style={{ width: "28px", height: "28px", color: "var(--or)" }} />
            </div>
            <h1>{assessment.naam}</h1>
            <p className="landing-uitleg">{heroUitleg(assessment.beschrijving)}</p>
            {link && (
              <a href={link.href} className="tekst-link landing-link">
                {link.tekst}
              </a>
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
            {featureKaarten}
            {/* De film Wat krijg ik (`help.md`, Films, Varianten van Wat krijg ik per Assessment-type): Met de knop naar de Voorbeeld-output. */}
            <HelpFilm naam="wat-krijg-ik" assessment={assessment} opmerking="Alle cijfers in de film zijn voorbeelddata." knop={voorbeeldKnop} />
            <div style={{ marginTop: "2.5rem" }}>{praktisch}</div>
          </div>
        </>
      )}
    </PageWithChrome>
  );
}
