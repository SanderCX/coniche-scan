import { Sectie } from "@/components/assessment/Sectie";
import { InfoIcoon } from "@/components/InfoIcoon";
import { KlokIcoon, SlotIcoon, StaafIcoon } from "@/components/icons/LandingIcons";
import { nbspNaKoppelteken } from "@/lib/format";
import { Assessment } from "@/lib/types";

/**
 * De sectie "Praktisch" (`CLAUDE.md`, scherm 2, Praktisch, aangepast op 21 oktober 2026): De sectiekop "Wat je kunt verwachten" met "Bedoeld voor ..." als
 * inleiding, de drie kaarten (invultijd, direct resultaat, privacy) en daaronder de rij met de uitgeschakelde knop "Start assessment", het Info-icoon en de
 * toelichting. Bij een Assessment met domeinen staat er "per domein" in plaats van "per bouwblok".
 */
export function PraktischSectie({ assessment, aantalVragen, warm }: { assessment: Assessment; aantalVragen: number; warm: boolean }) {
  const eenheid = assessment.bouwblokLabel === "AI-domein" ? "domein" : "bouwblok";
  const spanning = assessment.antwoordType === "spanning";
  const kaarten = [
    { Icoon: KlokIcoon, titel: "Invultijd", tekst: `${assessment.geschatteDuur}${spanning ? " voor" : ", verdeeld over"} ${aantalVragen} vragen.` },
    {
      Icoon: StaafIcoon,
      titel: "Direct resultaat",
      tekst: spanning
        ? "Je eigen profiel. Het groepsbeeld volgt als de resultaten zijn opengezet."
        : `Na afronding zie je meteen je scores en classificaties per ${eenheid}.`,
    },
    {
      Icoon: SlotIcoon,
      titel: "Privacy",
      tekst: spanning ? "Antwoorden in groepsweergaven zijn anoniem." : "Toegang verloopt via een persoonlijke, niet-herleidbare link die Coniche met je deelt.",
    },
  ];
  return (
    <Sectie
      id="praktisch"
      warm={warm}
      kop="Wat je kunt verwachten"
      inleiding={`Bedoeld voor ${assessment.doelgroep}`}
      kinderen={
        <>
          <div className="ap-praktisch-kaarten">
            {kaarten.map(({ Icoon, titel, tekst }) => (
              <div key={titel} className="card" style={{ background: "var(--bg)" }}>
                <h3 className="ap-praktisch-titel">
                  <Icoon aria-hidden="true" style={{ width: "1.25rem", height: "1.25rem", flexShrink: 0, color: "var(--ink-s)" }} />
                  {titel}
                </h3>
                <p>{nbspNaKoppelteken(tekst)}</p>
              </div>
            ))}
          </div>
          <div className="ap-start">
            <button type="button" disabled className="btn btn-or ap-start-knop">
              Start assessment
            </button>
            <InfoIcoon sleutel="info.startAssessment" />
            <p>Toegang loopt via een persoonlijke link van Coniche. Heb je die niet, neem dan contact op.</p>
          </div>
        </>
      }
    />
  );
}
