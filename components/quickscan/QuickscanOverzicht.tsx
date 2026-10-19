import { balkVul } from "@/lib/format";
import { QuickscanAfdeling, QuickscanResultaat } from "@/lib/quickscan";
import { Bandnamen, Hulplijnen, KLASSE_STIJL, getal } from "./gedeeld";

/**
 * Weergave 2, Overzicht (`visualisatie-quickscan.md`, 2): Drie kaarten onder elkaar met het eigen resultaat over alle afdelingen
 * heen. Eerst de afdelingen op één schaal van 0 tot 100% met een gestreepte lijn op het totaal, dan een matrix afdeling ×
 * dimensie, dan alle bouwblokken van laag naar hoog. Dit vervangt de top 3, die voor de Quickscan vervalt. Kleur staat nooit
 * alleen: Elke bol, balk en cel heeft een getal.
 */
export function QuickscanOverzicht({ resultaat }: { resultaat: QuickscanResultaat }) {
  const { afdelingen } = resultaat;

  // De kolommen van de matrix: De dimensienamen in volgorde van voorkomen (Organisatie, Processen en techniek, Mensen).
  const dimensieNamen: string[] = [];
  for (const a of afdelingen) for (const b of a.bouwblokken) if (!dimensieNamen.includes(b.bouwblok.naam)) dimensieNamen.push(b.bouwblok.naam);

  // Alle bouwblokken van laag naar hoog, op de exacte verhouding, bij gelijkspel in de volgorde van het model.
  const lijst = afdelingen
    .filter((a) => a.vanToepassing)
    .flatMap((a, ai) =>
      a.bouwblokken.map((b, bi) => ({ afdeling: a, b, volgorde: ai * 100 + bi }))
    )
    .filter((x) => x.b.breuk !== null)
    .sort((x, y) => (x.b.breuk as number) - (y.b.breuk as number) || x.volgorde - y.volgorde);

  return (
    <div data-weergave="quickscan-overzicht">
      <section className="qv-kaart" aria-label="Afdelingen op één schaal">
        <h3>Afdelingen op één schaal</h3>
        <p className="qv-kaart-sub">
          Elke bol is het percentage van een afdeling. De gestreepte lijn is het totaal
          {resultaat.percentage !== null && ` (${resultaat.percentage}%)`}.
        </p>
        <Bandnamen />
        {afdelingen.map((a) => (
          <AfdelingRij key={a.categorie.id} afdeling={a} totaal={resultaat.percentage} />
        ))}
      </section>

      <section className="qv-kaart" aria-label="Afdeling en dimensie">
        <h3>Afdeling × dimensie</h3>
        <p className="qv-kaart-sub">Het percentage Ja per dimensie, met het aantal Ja van het aantal vragen eronder.</p>
        <table className="qv-matrix">
          <thead>
            <tr>
              <th>Afdeling</th>
              {dimensieNamen.map((n) => (
                <th key={n}>{n}</th>
              ))}
              <th>Afdeling</th>
            </tr>
          </thead>
          <tbody>
            {afdelingen.map((a) => {
              if (!a.vanToepassing) {
                return (
                  <tr key={a.categorie.id}>
                    <td className="qv-naam qv-naam--nvt">{a.categorie.naam}</td>
                    <td className="qv-cel qv-cel--leeg" colSpan={dimensieNamen.length + 1}>
                      Niet van toepassing
                    </td>
                  </tr>
                );
              }
              const afdelingStijl = a.klasse ? KLASSE_STIJL[a.klasse] : null;
              return (
                <tr key={a.categorie.id}>
                  <td className="qv-naam">{a.categorie.naam}</td>
                  {dimensieNamen.map((naam) => {
                    const b = a.bouwblokken.find((x) => x.bouwblok.naam === naam);
                    if (!b) {
                      return (
                        <td key={naam} className="qv-cel qv-cel--leeg">
                          Geen dimensie
                        </td>
                      );
                    }
                    const s = b.klasse ? KLASSE_STIJL[b.klasse] : null;
                    return (
                      <td key={naam} className="qv-cel" style={s ? { background: s.cel, color: s.tekst } : undefined}>
                        {b.percentage ?? "–"}%
                        <small>
                          {getal(b.punten)}/{b.vragen}
                        </small>
                      </td>
                    );
                  })}
                  <td
                    className="qv-cel qv-cel--afdeling"
                    style={afdelingStijl ? { background: afdelingStijl.cel, color: afdelingStijl.tekst, borderColor: afdelingStijl.tekst } : undefined}
                  >
                    {a.percentage ?? "–"}%
                    <small>
                      {getal(a.punten)}/{getal(a.maximum)}
                    </small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="qv-kaart" aria-label="Alle bouwblokken">
        <h3>Alle bouwblokken, van laag naar hoog</h3>
        <p className="qv-kaart-sub">Gesorteerd op de exacte verhouding. Bij gelijkspel staat de volgorde van het model.</p>
        {lijst.length === 0 && <p className="text-sm text-ink-m">Er is nog niets om te tonen.</p>}
        {lijst.map(({ afdeling, b }) => {
          const s = b.klasse ? KLASSE_STIJL[b.klasse] : null;
          return (
            <div key={b.bouwblok.id} className="qv-lijst-rij">
              <span className="qv-naam">
                {afdeling.categorie.naam} · {b.bouwblok.naam}
                {b.gewicht !== 1 && <span className="gewicht-chip" style={{ marginLeft: "0.4rem" }}>{getal(b.gewicht)}×</span>}
              </span>
              <div className="qv-balk" aria-hidden="true">
                <div
                  className={balkVul(b.percentage ?? 0).className}
                  style={{ ...(balkVul(b.percentage ?? 0).style as React.CSSProperties), background: s?.kleur ?? "var(--ink-s)" }}
                />
              </div>
              <span className="qv-waarde">
                {getal(b.punten)}/{b.vragen} · <strong style={{ color: s?.tekst }}>{b.percentage ?? 0}%</strong>
              </span>
              {/* Een aanvulling als "1 vraag" heeft een eigen kolom en staat nooit in de cel van de waarde (`stylesheet.md`, Balklijst). */}
              <span className="qv-extra">{b.vragen < 3 ? `${b.vragen} ${b.vragen === 1 ? "vraag" : "vragen"}` : ""}</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function AfdelingRij({ afdeling, totaal }: { afdeling: QuickscanAfdeling; totaal: number | null }) {
  const naam = afdeling.categorie.naam;
  if (!afdeling.vanToepassing || afdeling.percentage === null) {
    return (
      <div className="qv-rij qv-rij--nvt">
        <span className="qv-naam qv-naam--nvt">{naam}</span>
        <div className="qv-spoor qv-spoor--neutraal" />
        <span className="qv-waarde">Niet van toepassing</span>
      </div>
    );
  }
  const s = afdeling.klasse ? KLASSE_STIJL[afdeling.klasse] : null;
  return (
    <div className="qv-rij">
      <span className="qv-naam">{naam}</span>
      <div className="qv-spoor">
        <Hulplijnen />
        {totaal !== null && <span className="qv-streep qv-streep--totaal" style={{ left: `${totaal}%` }} title={`Totaal: ${totaal}%`} />}
        <span
          className="qv-bol"
          style={{ left: `${afdeling.percentage}%`, ["--qv-kleur" as string]: s?.kleur }}
          title={`${naam}: ${afdeling.percentage}%`}
        />
      </div>
      <span className="qv-waarde">
        <strong style={{ color: s?.tekst }}>{afdeling.percentage}%</strong> · {getal(afdeling.punten)}/{getal(afdeling.maximum)}
      </span>
    </div>
  );
}
