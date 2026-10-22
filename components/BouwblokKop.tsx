import { Bouwblok } from "@/lib/types";
import { gewichtMarkering } from "@/lib/weging";

/** De alinea's van een tekst: Een lege regel scheidt ze (`Bouwblok.toelichting`). */
export function alineas(tekst: string | null | undefined): string[] {
  return (tekst ?? "")
    .trim()
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * De kop van een bouwblok in de doorloopflow (`stylesheet.md`, Doorloopflow, Bouwblok-kop; besloten door Joost op 22 oktober 2026,
 * ontwerp `Vragenlijst-toelichting`): Een verticale accentbalk van 4px met 28px ruimte erachter over de hele kop, die stopt onder de
 * toelichting. Van boven naar beneden de eyebrow ("{CATEGORIE} · {BOUWBLOKLABEL} {n}", in de categoriekleur), de titel met bij een
 * gewicht ongelijk aan 1 de chip met de factor, het blok "Centrale vraag" en de toelichting. Er is geen i-icoon en geen modal meer, en
 * de omschrijving en de tags staan hier niet. Zonder centrale vraag of toelichting ontbreekt dat onderdeel, zoals bij de dimensies
 * van de Quickscan (alleen balk, eyebrow en naam).
 */
export function BouwblokKop({
  bouwblok,
  groepNaam,
  bouwblokLabel,
  accentStyle,
}: {
  bouwblok: Bouwblok;
  /** De naam van de categorie of afdeling, `null` zonder categorielaag. */
  groepNaam: string | null;
  /** `Assessment.bouwblokLabel`, bijv. "Bouwsteen", "AI-domein" of "Dimensie". */
  bouwblokLabel: string;
  /** De stijlvariabelen van de categoriekleur (`accentStijl`), `undefined` valt terug op `--or`. */
  accentStyle?: React.CSSProperties;
}) {
  const eyebrow = [groepNaam, `${bouwblokLabel} ${bouwblok.volgnummer}`].filter(Boolean).join(" · ").toUpperCase();
  const centraleVraag = bouwblok.centraleVraag?.trim() || null;
  const toelichting = alineas(bouwblok.toelichting);

  return (
    <div className="bouwblok-kop" style={accentStyle}>
      <p className="bouwblok-kop-eyebrow">{eyebrow}</p>
      <div className="bouwblok-kop-titelrij">
        <h2>{bouwblok.naam}</h2>
        {gewichtMarkering(bouwblok) && <span className="gewicht-chip">{gewichtMarkering(bouwblok)}</span>}
      </div>
      {centraleVraag && (
        <div className="bouwblok-kop-vraag">
          <p className="bouwblok-kop-label">Centrale vraag</p>
          <p className="bouwblok-kop-centrale-vraag">{centraleVraag}</p>
        </div>
      )}
      {toelichting.length > 0 && (
        <div className="bouwblok-kop-toelichting">
          {toelichting.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}
    </div>
  );
}
