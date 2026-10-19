import { Classificatie } from "@/lib/types";
import { KLASSE_STIJL } from "./gedeeld";

interface AfdelingRij {
  categorie: { id: string; naam: string };
  percentage: number | null;
  klasse: Classificatie | null;
}

function Kolom({ titel, afdelingen }: { titel: string; afdelingen: AfdelingRij[] }) {
  return (
    <div>
      <h3 className="qs-uitgelicht-kop">{titel}</h3>
      <div className="qs-uitgelicht-rijen">
        {afdelingen.map((a) => (
          // De rij heeft de tint van de klasse van de afdeling, zoals de chip en de kaart erboven (`content-ziekenhuis-quickscan.md`, Resultaten, 3).
          <div
            key={a.categorie.id}
            className="qs-uitgelicht-rij"
            style={a.klasse ? { background: KLASSE_STIJL[a.klasse].vulling, borderColor: KLASSE_STIJL[a.klasse].rand } : undefined}
          >
            <span>{a.categorie.naam}</span>
            <strong style={{ color: a.klasse ? KLASSE_STIJL[a.klasse].tekst : undefined }}>{a.percentage ?? 0}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * "Sterkste afdeling" en "Meeste ontwikkelruimte" (`content-ziekenhuis-quickscan.md`, Resultaten, 3, voorstel van 19 oktober 2026):
 * Dezelfde component als Top 3 Sterktes en Top 3 Verbeterkansen bij de andere scans, twee kolommen naast elkaar met een rij per
 * afdeling. Bij gelijkstand staat elke gelijke afdeling als eigen rij. Het blok verdwijnt als een van beide leeg is.
 */
export function SterksteMeeste({ sterkste, meeste }: { sterkste: AfdelingRij[]; meeste: AfdelingRij[] }) {
  if (sterkste.length === 0 || meeste.length === 0) return null;
  return (
    <div className="qs-uitgelicht">
      <Kolom titel="Sterkste afdeling" afdelingen={sterkste} />
      <Kolom titel="Meeste ontwikkelruimte" afdelingen={meeste} />
    </div>
  );
}
