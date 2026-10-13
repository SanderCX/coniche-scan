import { Assessment } from "@/lib/types";
import { KLASSE_LABEL, MatrixWeergave } from "@/lib/visualisatie";
import { Tegels, toon } from "./gedeeld";

/**
 * Weergave E, matrix voor Metingen binnen een organisatie (`visualisatie-scores.md`, E): Rijen zijn bouwblokken, kolommen
 * de Metingen met hun label en het aantal afgeronde scans. Elke cel is gevuld naar de klasse, met het getal erin. Rechts het
 * gemiddelde van de rij en het bereik, onderaan de totaalscore. Een cel die 0,5 of meer afwijkt van het rijgemiddelde krijgt
 * een zwarte rand. Alleen voor een Admin: De kolomkoppen tonen de labels van de Metingen.
 */
export function WeergaveMatrix({ assessment, weergave }: { assessment: Assessment; weergave: MatrixWeergave }) {
  const { kolommen, rijen } = weergave;
  return (
    <div className="vis" data-weergave="matrix">
      <Tegels
        tegels={[
          { label: "Hoogste Meting", waarde: toon(weergave.hoogsteMeting?.totaal), sub: weergave.hoogsteMeting?.label },
          { label: "Laagste Meting", waarde: toon(weergave.laagsteMeting?.totaal), sub: weergave.laagsteMeting?.label },
          {
            label: "Grootste verschil",
            waarde: toon(weergave.grootsteVerschil?.verschil),
            sub: weergave.grootsteVerschil?.naam,
          },
          { label: "Opvallende cellen", waarde: String(weergave.aantalAfwijkend), sub: "0,5 of meer van het rijgemiddelde" },
        ]}
      />
      <div style={{ overflowX: "auto" }}>
        <table className="vis-matrix">
          <thead>
            <tr>
              <th className="vis-matrix-naam">{assessment.bouwblokLabel}</th>
              {kolommen.map((k, i) => (
                <th key={i}>
                  {k.label}
                  <span className="vis-matrix-aantal">
                    {k.aantalScans} {k.aantalScans === 1 ? "scan" : "scans"}
                  </span>
                </th>
              ))}
              <th>Gemiddelde</th>
              <th>Bereik</th>
            </tr>
          </thead>
          <tbody>
            {rijen.map((r) => (
              <tr key={r.rij.bouwblok.id}>
                <td className="vis-matrix-naam">
                  <span className="text-ink-s font-bold">{r.rij.bouwblok.volgnummer}</span> {r.rij.bouwblok.naam}
                  {r.rij.gewicht !== 1 && <span className="vis-factor"> {r.rij.gewicht.toString().replace(".", ",")}×</span>}
                </td>
                {r.cellen.map((c, i) => (
                  <td
                    key={i}
                    className={`vis-cel ${c.klasse ? `vis-cel--${c.klasse}` : "vis-cel--leeg"} ${c.afwijkend ? "vis-cel--afwijkend" : ""}`}
                    title={c.klasse ? KLASSE_LABEL[c.klasse] : undefined}
                  >
                    {toon(c.score)}
                  </td>
                ))}
                <td className="vis-matrix-zij">{toon(r.gemiddelde)}</td>
                <td className="vis-matrix-zij">
                  {r.laagste !== null && r.hoogste !== null ? `${toon(r.laagste)} – ${toon(r.hoogste)}` : "–"}
                </td>
              </tr>
            ))}
            <tr className="vis-matrix-totaal">
              <td className="vis-matrix-naam font-bold">Totaalscore</td>
              {kolommen.map((k, i) => (
                <td key={i} className={`vis-cel ${k.totaalKlasse ? `vis-cel--${k.totaalKlasse}` : "vis-cel--leeg"}`}>
                  {toon(k.totaal)}
                </td>
              ))}
              <td />
              <td />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="vis-onderschrift">
        Elke Meting telt even zwaar mee, ongeacht het aantal respondenten. Een zwarte rand betekent: 0,5 of meer van het
        gemiddelde van de rij.
      </p>
    </div>
  );
}
