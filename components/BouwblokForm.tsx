import { Antwoord, Bouwblok, Categorie, ScanWeergave, SchaalLabel } from "@/lib/types";
import { CATEGORIE_COLORS, accentStijl } from "@/lib/colors";
import { ScaleRadio } from "./ScaleRadio";
import { JaNeeRadio } from "./JaNeeRadio";
import { AfdelingKaarten } from "./AfdelingKaarten";
import { BouwblokKop } from "./BouwblokKop";

export function BouwblokForm({
  bouwblok,
  categorieKleur,
  categorieNaam,
  bouwblokLabel,
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
  /** Eyebrow in de kop van het bouwblok (`Assessment.bouwblokLabel`). */
  bouwblokLabel: string;
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
    nummer: number;
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
          nummer={afdeling.nummer}
          relevantieVraag={afdeling.relevantieVraag}
          relevantie={afdeling.relevantie}
          onRelevantie={afdeling.onRelevantie}
        />
      )}
      {toonVragen && (
      <>
      <BouwblokKop bouwblok={bouwblok} groepNaam={categorieNaam} bouwblokLabel={bouwblokLabel} accentStyle={accentStyle} />

      <div className="instructievlak">
        {instructieregel?.trim() ||
          "Beantwoord op basis van wat aantoonbaar geregeld is (documenten, ritmes, tooling, afspraken)."}
      </div>

      {bouwblok.vragen.map((vraag) => (
        <div key={vraag.id} id={`vraag-${vraag.id}`} className="vraag-blok">
          <p className={`vraag-tekst ${jaNee ? "vraag-tekst--groot" : ""}`}>
            {vraag.volgnummer}. {vraag.tekst}
          </p>
          {jaNee ? (
            <JaNeeRadio
              naam={vraag.id}
              waarde={respondent.antwoorden[vraag.id]}
              onChange={(waarde) => handleAntwoord(vraag.id, waarde)}
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
        <label>Opmerkingen bij deze bouwsteen (optioneel)</label>
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
