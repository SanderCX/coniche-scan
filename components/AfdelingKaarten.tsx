import { Categorie } from "@/lib/types";

/**
 * Elke afdeling begint in de doorloopflow met twee kaarten boven de vragen (`content-ziekenhuis-quickscan.md`, Doorloop per
 * afdeling): Een kaart met de naam van de afdeling, een oranje balk links en daaronder de definitie (`Categorie.omschrijving`),
 * en een kaart met de relevantievraag (`Assessment.relevantieVraag`) en de keuzes Ja en Nee. Pas na Ja volgen de vragen.
 */
export function AfdelingKaarten({
  categorie,
  relevantieVraag,
  relevantie,
  onRelevantie,
}: {
  categorie: Categorie;
  relevantieVraag: string;
  relevantie: boolean | undefined;
  onRelevantie: (relevant: boolean) => void;
}) {
  const naam = `relevantie-${categorie.id}`;
  return (
    <div className="afdeling-kaarten">
      <div className="card afdeling-kaart" style={{ borderLeft: "4px solid var(--or)" }}>
        <p className="eyebrow">Afdeling</p>
        <h2 style={{ margin: "0.1rem 0 0.4rem" }}>{categorie.naam}</h2>
        {categorie.omschrijving && <p style={{ margin: 0, color: "var(--ink-m)" }}>{categorie.omschrijving}</p>}
      </div>
      <div className="card afdeling-kaart">
        <p className="vraag-tekst" style={{ marginTop: 0 }}>
          {relevantieVraag}
        </p>
        <div className="schaal" role="radiogroup" aria-label={relevantieVraag}>
          {[
            { waarde: true, label: "Ja" },
            { waarde: false, label: "Nee" },
          ].map((o) => (
            <label key={o.label} className="schaal-optie">
              <input type="radio" name={naam} checked={relevantie === o.waarde} onChange={() => onRelevantie(o.waarde)} />
              <span className="optie-tekst">
                <strong className="text-ink">{o.label}</strong>
              </span>
            </label>
          ))}
        </div>
        {relevantie === false && (
          <p className="text-sm text-ink-m" style={{ margin: "0.8rem 0 0" }}>
            Deze afdeling is niet van toepassing: Haar vragen worden overgeslagen en ze telt niet mee in de score.
          </p>
        )}
      </div>
    </div>
  );
}
