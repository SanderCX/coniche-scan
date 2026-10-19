import { useState } from "react";
import { Antwoord, Bouwblok, Categorie, ScanWeergave, SchaalLabel } from "@/lib/types";
import { CATEGORIE_COLORS, accentStijl, lijnKleur } from "@/lib/colors";
import { toelichtingVoor } from "@/lib/bouwblok-info";
import { gewichtMarkering } from "@/lib/weging";
import { ScaleRadio } from "./ScaleRadio";
import { JaNeeRadio } from "./JaNeeRadio";
import { AfdelingKaarten } from "./AfdelingKaarten";
import { Modal } from "./Modal";

export function BouwblokForm({
  bouwblok,
  categorieKleur,
  categorieNaam,
  bouwblokLabel,
  eenheid,
  schaal,
  respondent,
  isLaatsteBouwblok,
  jaNee = false,
  instructieregel,
  afdeling,
  kanAfronden = true,
  onAntwoord,
  onOpmerking,
  onVolgende,
}: {
  bouwblok: Bouwblok;
  categorieKleur: string | null;
  categorieNaam: string | null;
  /** Eyebrow in de Toelichtingsmodal (`Assessment.bouwblokLabel`). */
  bouwblokLabel: string;
  /** UI-woord voor dit bouwblok, bijv. "Bouwblok" of "Domein". */
  eenheid: string;
  schaal: SchaalLabel[];
  respondent: ScanWeergave;
  isLaatsteBouwblok: boolean;
  /** Bij antwoordType "ja-nee-weetniet": Drie keuzes per vraag in plaats van de 1–5-schaal. */
  jaNee?: boolean;
  /** `Assessment.instructieregel`. Leeg: De standaardtekst voor de 1–5-schaal. */
  instructieregel?: string | null;
  /**
   * Alleen bij het eerste bouwblok van een optionele categorie: De kaarten met de definitie en de relevantievraag. Pas na Ja
   * staan de vragen er (`content-ziekenhuis-quickscan.md`, Doorloop per afdeling).
   */
  afdeling?: {
    categorie: Categorie;
    relevantieVraag: string;
    relevantie: boolean | undefined;
    onRelevantie: (relevant: boolean) => void;
  };
  /** Op het laatste bouwblok: Mag de scan nu worden afgerond? Anders staat de knop uit. */
  kanAfronden?: boolean;
  onAntwoord: (vraagId: string, waarde: Antwoord) => void;
  onOpmerking: (tekst: string) => void;
  onVolgende: () => void;
}) {
  const kleur = categorieKleur ? CATEGORIE_COLORS[categorieKleur] : undefined;
  const accentStyle = kleur
    ? (accentStijl(kleur.hex) as React.CSSProperties)
    : undefined;
  const toonVragen = !afdeling || afdeling.relevantie === true;
  const alleBeantwoord = toonVragen
    ? bouwblok.vragen.every((v) => respondent.antwoorden[v.id] !== undefined)
    : afdeling.relevantie === false;
  const [toelichtingOpen, setToelichtingOpen] = useState(false);

  const toelichtingInfo = toelichtingVoor(bouwblok, {
    bouwblokLabel,
    groepNaam: categorieNaam,
    groepKleur: categorieKleur,
  });

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

  function handleAntwoord(vraagId: string, waarde: Antwoord) {
    onAntwoord(vraagId, waarde);
    scrollNaarVolgende(vraagId);
  }

  return (
    <div>
      {afdeling && (
        <AfdelingKaarten
          categorie={afdeling.categorie}
          relevantieVraag={afdeling.relevantieVraag}
          relevantie={afdeling.relevantie}
          onRelevantie={afdeling.onRelevantie}
        />
      )}
      {toonVragen && (
      <>
      <div className="bouwblok-kop" style={accentStyle}>
        <p className="eyebrow" style={accentStyle}>
          {eenheid} {bouwblok.volgnummer}
        </p>
        <div className="bouwblok-kop-titelrij">
          <h2>{bouwblok.naam}</h2>
          {gewichtMarkering(bouwblok) && <span className="gewicht-chip">{gewichtMarkering(bouwblok)}</span>}
          {toelichtingInfo && (
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
          )}
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
        {toelichtingInfo?.centraleVraag && (
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
                color: lijnKleur(toelichtingInfo.accentColor),
                letterSpacing: "0.08em",
                marginBottom: "0.2rem",
              }}
            >
              CENTRALE VRAAG
            </p>
            <p style={{ color: "var(--ink)", fontWeight: 600 }}>{toelichtingInfo.centraleVraag}</p>
          </div>
        )}
        {toelichtingInfo?.beschrijving.map((tekst, i) => (
          <p key={i}>{tekst}</p>
        ))}
      </Modal>

      <div className="instructievlak">
        {instructieregel?.trim() ||
          "Beantwoord op basis van wat aantoonbaar geregeld is (documenten, ritmes, tooling, afspraken)."}
      </div>

      {bouwblok.vragen.map((vraag) => (
        <div key={vraag.id} id={`vraag-${vraag.id}`} className="vraag-blok">
          <p className="vraag-tekst">
            {vraag.volgnummer}. {vraag.tekst}
          </p>
          {jaNee ? (
            <JaNeeRadio
              naam={vraag.id}
              waarde={respondent.antwoorden[vraag.id]}
              onChange={(waarde) => handleAntwoord(vraag.id, waarde)}
              accentHex={kleur?.hex}
            />
          ) : (
            <ScaleRadio
              naam={vraag.id}
              schaal={schaal}
              waarde={typeof respondent.antwoorden[vraag.id] === "number" ? (respondent.antwoorden[vraag.id] as number) : undefined}
              onChange={(waarde) => handleAntwoord(vraag.id, waarde)}
              accentHex={kleur?.hex}
            />
          )}
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

      </>
      )}

      <div className="flow-actions" style={{ justifyContent: "flex-end" }} id={toonVragen ? undefined : "bouwblok-einde"}>
        <button
          type="button"
          className="btn btn-or"
          disabled={!alleBeantwoord || (isLaatsteBouwblok && !kanAfronden)}
          onClick={onVolgende}
        >
          {isLaatsteBouwblok ? "Bekijk resultaten" : "Volgende"}
        </button>
      </div>
    </div>
  );
}
