import { Categorie } from "@/lib/types";
import { AntwoordPillen } from "./JaNeeRadio";

/**
 * Elke afdeling begint in de doorloopflow met twee onderdelen boven de vragen (`content-ziekenhuis-quickscan.md`, Doorloop per
 * afdeling; ontwerp `Vragenlijst-Quickscan`, besloten door Joost op 22 oktober 2026): De kop van de afdeling, met een oranje balk van
 * 4px links en 28px ruimte erachter, de eyebrow "AFDELING {n}", de naam en daaronder de definitie (`Categorie.omschrijving`), en een
 * witte kaart met de relevantievraag (`Assessment.relevantieVraag`) en de keuzes Ja en Nee als pillen. Pas na Ja volgen de vragen.
 */
export function AfdelingKaarten({
  categorie,
  nummer,
  relevantieVraag,
  relevantie,
  onRelevantie,
}: {
  categorie: Categorie;
  /** Het nummer van de afdeling, in de volgorde van de afdelingen (1 is de eerste). */
  nummer: number;
  relevantieVraag: string;
  relevantie: boolean | undefined;
  onRelevantie: (relevant: boolean) => void;
}) {
  return (
    <div className="afdeling-kaarten">
      <div className="afdeling-kop">
        <p className="afdeling-kop-eyebrow">Afdeling {nummer}</p>
        <h2>{categorie.naam}</h2>
        {categorie.omschrijving && <p className="afdeling-kop-definitie">{categorie.omschrijving}</p>}
      </div>
      <div className="card afdeling-kaart">
        <p className="afdeling-relevantievraag">{relevantieVraag}</p>
        <AntwoordPillen
          naam={`relevantie-${categorie.id}`}
          label={relevantieVraag}
          opties={[
            { waarde: "ja", label: "Ja" },
            { waarde: "nee", label: "Nee" },
          ]}
          waarde={relevantie === undefined ? undefined : relevantie ? "ja" : "nee"}
          onChange={(w) => onRelevantie(w === "ja")}
        />
        {relevantie === false && (
          <p className="text-sm text-ink-m" style={{ margin: "0.8rem 0 0" }}>
            Deze afdeling is niet van toepassing: Haar vragen worden overgeslagen en ze telt niet mee in de score.
          </p>
        )}
      </div>
    </div>
  );
}
