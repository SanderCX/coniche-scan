import { useState } from "react";
import { Bouwblok, ScanWeergave, SchaalLabel } from "@/lib/types";
import { CATEGORIE_COLORS } from "@/lib/colors";
import { alleBouwstenen } from "@/data/bouwstenen-content";
import { aiDomeinen } from "@/data/ai-domeinen-content";
import { ScaleRadio } from "./ScaleRadio";
import { Modal } from "./Modal";

export function BouwblokForm({
  bouwblok,
  categorieKleur,
  eenheid,
  schaal,
  respondent,
  isLaatsteBouwblok,
  onAntwoord,
  onOpmerking,
  onVolgende,
}: {
  bouwblok: Bouwblok;
  categorieKleur: string | null;
  /** UI-woord voor dit bouwblok, bijv. "Bouwblok" of "Domein". */
  eenheid: string;
  schaal: SchaalLabel[];
  respondent: ScanWeergave;
  isLaatsteBouwblok: boolean;
  onAntwoord: (vraagId: string, waarde: number) => void;
  onOpmerking: (tekst: string) => void;
  onVolgende: () => void;
}) {
  const kleur = categorieKleur ? CATEGORIE_COLORS[categorieKleur] : undefined;
  const accentStyle = kleur
    ? ({ ["--accent" as string]: kleur.hex } as React.CSSProperties)
    : undefined;
  const alleBeantwoord = bouwblok.vragen.every(
    (v) => typeof respondent.antwoorden[v.id] === "number"
  );
  const [toelichtingOpen, setToelichtingOpen] = useState(false);

  /**
   * Klantcontact Volwassenheidsscan (bouwblok-id's "bb…") heeft rijke
   * bouwsteen-content uit visie-coniche.md (data/bouwstenen-content.ts,
   * dezelfde bron als de publieke bouwstenen-pagina). De AI-scan
   * (bouwblok-id's "ai…") heeft dezelfde soort content uit
   * visie-ai-klantcontact.md (data/ai-domeinen-content.ts, dezelfde bron
   * als de publieke AI-pagina). Zonder match (nog niet bestaande content)
   * valt de overlay terug op `bouwblok.toelichting`.
   */
  const bouwsteenInfo = bouwblok.id.startsWith("bb")
    ? alleBouwstenen.find((b) => b.nummer === bouwblok.volgnummer)
    : undefined;
  const aiDomeinInfo = bouwblok.id.startsWith("ai")
    ? aiDomeinen.find((d) => d.nummer === bouwblok.volgnummer)
    : undefined;

  const toelichtingInfo = bouwsteenInfo
    ? {
        eyebrow: `${bouwsteenInfo.groepNaam.toUpperCase()} · BOUWSTEEN ${bouwsteenInfo.nummer}`,
        accentColor: CATEGORIE_COLORS[bouwsteenInfo.kleur]?.hex ?? "var(--or)",
        centraleVraag: bouwsteenInfo.centraleVraag,
        beschrijving: bouwsteenInfo.beschrijving,
      }
    : aiDomeinInfo
      ? {
          eyebrow: `AI-DOMEIN ${aiDomeinInfo.nummer}`,
          accentColor: "var(--or)",
          centraleVraag: aiDomeinInfo.centraleVraag,
          beschrijving: aiDomeinInfo.beschrijving,
        }
      : undefined;

  /** Scrollt na het kiezen van een antwoord naar de volgende vraag (of, bij
   * de laatste vraag, naar het opmerkingenveld/de knop) — een korte
   * vertraging zodat de gekozen radio eerst zichtbaar gevuld wordt voordat
   * de pagina beweegt. */
  function scrollNaarVolgende(huidigeVraagId: string) {
    const index = bouwblok.vragen.findIndex((v) => v.id === huidigeVraagId);
    const volgende = bouwblok.vragen[index + 1];
    const targetId = volgende ? `vraag-${volgende.id}` : "bouwblok-einde";
    setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  }

  function handleAntwoord(vraagId: string, waarde: number) {
    onAntwoord(vraagId, waarde);
    scrollNaarVolgende(vraagId);
  }

  return (
    <div>
      <div className="bouwblok-kop" style={accentStyle}>
        <p className="eyebrow" style={accentStyle}>
          {eenheid} {bouwblok.volgnummer}
        </p>
        <div className="bouwblok-kop-titelrij">
          <h2>{bouwblok.naam}</h2>
          <button
            type="button"
            onClick={() => setToelichtingOpen(true)}
            aria-label={`Meer uitleg over ${bouwblok.naam}`}
            title="Meer uitleg"
            className="toelichting-link"
            style={accentStyle}
          >
            ⓘ
          </button>
        </div>
        <p className="bouwblok-omschrijving">{bouwblok.omschrijving}</p>
        <div className="tags-rij" style={{ marginTop: "0.8rem" }}>
          {bouwblok.tags.map((tag) => (
            <span key={tag} className="g-badge">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <Modal
        open={toelichtingOpen}
        onClose={() => setToelichtingOpen(false)}
        title={bouwblok.naam}
        eyebrow={toelichtingInfo?.eyebrow}
        accentColor={toelichtingInfo?.accentColor}
      >
        {toelichtingInfo ? (
          <>
            <div
              style={{
                borderLeft: `3px solid ${toelichtingInfo.accentColor}`,
                paddingLeft: "0.9rem",
                margin: "0 0 1.2rem",
              }}
            >
              <p
                className="text-xs font-bold"
                style={{
                  color: toelichtingInfo.accentColor,
                  letterSpacing: "0.08em",
                  marginBottom: "0.2rem",
                }}
              >
                CENTRALE VRAAG
              </p>
              <p style={{ color: "var(--ink)", fontWeight: 600 }}>{toelichtingInfo.centraleVraag}</p>
            </div>
            {toelichtingInfo.beschrijving.map((tekst, i) => (
              <p key={i}>{tekst}</p>
            ))}
          </>
        ) : (
          bouwblok.toelichting
        )}
      </Modal>

      <div className="instructievlak">
        Beantwoord op basis van wat aantoonbaar geregeld is (documenten, ritmes, tooling,
        afspraken).
      </div>

      {bouwblok.vragen.map((vraag) => (
        <div key={vraag.id} id={`vraag-${vraag.id}`} className="vraag-blok">
          <p className="vraag-tekst">
            {vraag.volgnummer}. {vraag.tekst}
          </p>
          <ScaleRadio
            naam={vraag.id}
            schaal={schaal}
            waarde={respondent.antwoorden[vraag.id]}
            onChange={(waarde) => handleAntwoord(vraag.id, waarde)}
            accentHex={kleur?.hex}
          />
        </div>
      ))}

      <div className="field opmerking-veld" id="bouwblok-einde">
        <label>Opmerkingen bij dit bouwblok (optioneel)</label>
        <textarea
          value={respondent.opmerkingenPerBouwblok[bouwblok.id] ?? ""}
          onChange={(e) => onOpmerking(e.target.value)}
          rows={3}
          placeholder="Toelichting, context of voorbeelden..."
        />
      </div>

      <div className="flow-actions" style={{ justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn btn-or"
          disabled={!alleBeantwoord}
          onClick={onVolgende}
        >
          {isLaatsteBouwblok ? "Bekijk resultaten" : "Volgende"}
        </button>
      </div>
    </div>
  );
}
