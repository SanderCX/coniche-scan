import { Assessment } from "@/lib/types";
import { HogerKant, KLASSE_LABEL, MatrixWeergave } from "@/lib/visualisatie";
import { SYMBOOL_EERSTE, SYMBOOL_TWEEDE } from "./WeergaveNaastElkaar";
import { Tegels, toon } from "./gedeeld";

/**
 * Weergave E, matrix voor Metingen binnen een organisatie (niveau 2) of voor organisaties (niveau 1)
 * (`visualisatie-scores.md`, E): Rijen zijn bouwblokken, kolommen de Metingen of de organisaties met hun naam, eventueel het
 * label van de Meting en het aantal afgeronde scans. Elke cel is gevuld naar de klasse, met het getal erin, onderaan de
 * totaalscore. Op niveau 1 staan rechts het gemiddelde van de rij en het bereik, en krijgt een cel die 0,5 of meer afwijkt een
 * zwarte rand. Op niveau 2 is er geen groep om van af te wijken: Geen gemiddelde, bereik en rand, wel bij precies twee Metingen
 * een kolom Verschil (de nieuwere min de oudere) per bouwblok, per categorie en voor de totaalscore. Alleen voor een Admin: De
 * kolomkoppen tonen de namen. Bij veel kolommen scrolt de matrix horizontaal met een vaste eerste kolom.
 */
export function WeergaveMatrix({
  assessment,
  weergave,
  kolomSoort = "meting",
}: {
  assessment: Assessment;
  weergave: MatrixWeergave;
  /** `organisatie` of `onderdeel`: De tegels heten Hoogste en Laagste organisatie of onderdeel en de koppen tonen de naam. */
  kolomSoort?: "meting" | "organisatie" | "onderdeel";
}) {
  const { kolommen, rijen } = weergave;
  const soort = kolomSoort === "organisatie" ? "organisatie" : kolomSoort === "onderdeel" ? "onderdeel" : "Meting";
  // Alleen tussen organisaties is er een groep om van af te wijken (`visualisatie-scores.md`, E).
  const groep = kolomSoort === "organisatie";
  const teken = (n: number) => (n > 0 ? "▲ +" : n < 0 ? "▼ −" : "= ");
  const verschilCel = (n: number | null, sleutel: string) => (
    <td key={sleutel} className="vis-matrix-zij">
      {n === null ? "–" : `${teken(n)}${toon(Math.abs(n))}`}
    </td>
  );
  // Naast elkaar: Het symbool van de kolom met de hoogste score in plaats van een verschil met teken.
  const hoogsteCel = (h: HogerKant | null, sleutel: string) => (
    <td key={sleutel} className="vis-matrix-zij">
      {h === null ? (
        "–"
      ) : h === "gelijk" ? (
        "Gelijk"
      ) : (
        <span className="vis-symbool" title={kolommen[h === "eerste" ? 0 : 1]?.label}>
          {h === "eerste" ? SYMBOOL_EERSTE : SYMBOOL_TWEEDE}
        </span>
      )}
    </td>
  );
  return (
    <div className="vis" data-weergave="matrix">
      <Tegels
        tegels={[
          { label: `Hoogste ${soort}`, waarde: toon(weergave.hoogsteMeting?.totaal), sub: weergave.hoogsteMeting?.label },
          { label: `Laagste ${soort}`, waarde: toon(weergave.laagsteMeting?.totaal), sub: weergave.laagsteMeting?.label },
          {
            label: "Grootste verschil",
            waarde: toon(weergave.grootsteVerschil?.verschil),
            sub: weergave.grootsteVerschil?.naam,
          },
          ...(groep
            ? [{ label: "Opvallende cellen", waarde: String(weergave.aantalAfwijkend), sub: "0,5 of meer van het rijgemiddelde" }]
            : []),
        ]}
      />
      <div style={{ overflowX: "auto" }}>
        <table className="vis-matrix">
          <thead>
            <tr>
              <th className="vis-matrix-naam">{assessment.bouwblokLabel}</th>
              {kolommen.map((k, i) => (
                <th key={i}>
                  {weergave.metHoogste && <span className="vis-symbool">{i === 0 ? SYMBOOL_EERSTE : SYMBOOL_TWEEDE} </span>}
                  {k.label}
                  {k.sublabel && <span className="vis-matrix-aantal">{k.sublabel}</span>}
                  <span className="vis-matrix-aantal">
                    {k.aantalScans} {k.aantalScans === 1 ? "scan" : "scans"}
                  </span>
                </th>
              ))}
              {groep && <th>Gemiddelde</th>}
              {groep && <th>Bereik</th>}
              {weergave.metVerschil && <th>Verschil</th>}
              {weergave.metHoogste && <th>Hoogste</th>}
            </tr>
          </thead>
          <tbody>
            {rijen.flatMap((r, index) => [
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
                {groep && <td className="vis-matrix-zij">{toon(r.gemiddelde)}</td>}
                {groep && (
                  <td className="vis-matrix-zij">
                    {r.laagste !== null && r.hoogste !== null ? `${toon(r.laagste)} – ${toon(r.hoogste)}` : "–"}
                  </td>
                )}
                {weergave.metVerschil && verschilCel(r.verschilTweeMetingen, "verschil")}
                {weergave.metHoogste && hoogsteCel(r.hogerKolom, "hoogste")}
              </tr>,
              ...weergave.groepRijen
                .filter((g) => g.naRij === index)
                .map((g) => (
                  <tr key={`groep-${g.groepId}`} className="vis-matrix-groep">
                    <td className="vis-matrix-naam font-bold">{g.naam}</td>
                    {g.cellen.map((c, i) => (
                      <td key={i} className={`vis-cel ${c.klasse ? `vis-cel--${c.klasse}` : "vis-cel--leeg"}`}>
                        {toon(c.score)}
                      </td>
                    ))}
                    {weergave.metVerschil && verschilCel(g.verschilTweeMetingen, "verschil")}
                    {weergave.metHoogste && hoogsteCel(g.hogerKolom, "hoogste")}
                  </tr>
                )),
            ])}
            <tr className="vis-matrix-totaal">
              <td className="vis-matrix-naam font-bold">Totaalscore</td>
              {kolommen.map((k, i) => (
                <td key={i} className={`vis-cel ${k.totaalKlasse ? `vis-cel--${k.totaalKlasse}` : "vis-cel--leeg"}`}>
                  {toon(k.totaal)}
                </td>
              ))}
              {groep && <td />}
              {groep && <td />}
              {weergave.metVerschil && verschilCel(weergave.totaalVerschil, "verschil")}
              {weergave.metHoogste && hoogsteCel(weergave.totaalHoger, "hoogste")}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="vis-onderschrift">
        Elke {soort} telt even zwaar mee, ongeacht het aantal respondenten.
        {groep && " Een zwarte rand betekent: 0,5 of meer van het gemiddelde van de rij."}
        {weergave.metVerschil && " Het verschil is de nieuwere Meting min de oudere."}
        {weergave.metHoogste && ` ${SYMBOOL_EERSTE} is de eerste kolom, ${SYMBOOL_TWEEDE} de tweede: Het symbool staat bij de Meting die hoger scoort.`}
      </p>
    </div>
  );
}
