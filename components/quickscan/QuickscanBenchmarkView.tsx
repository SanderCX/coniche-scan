import { BenchmarkRijQs, BenchmarkViewQs } from "@/lib/quickscan-groep";
import { Tegels } from "@/components/visualisatie/gedeeld";
import { Hulplijnen, getal } from "./gedeeld";

const teken = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "");

/**
 * Weergave 5, Benchmark (`visualisatie-quickscan.md`, 5): De view van een organisatie naast de rest van de groep, in percentages
 * van 0 tot 100 en zonder klassebanden. Per rij een lichte band van het minimum tot het maximum, een donkerder band van het
 * eerste tot het derde kwartiel, een blauwe streep op het groepsgemiddelde en een oranje bol met witte rand op X. Rechts het
 * percentage van X, het verschil met het gemiddelde in procentpunten en het positielabel. Nooit de namen van andere leden.
 */
export function QuickscanBenchmarkView({
  view,
  eigenNaam,
  peildatum,
}: {
  view: BenchmarkViewQs;
  eigenNaam: string;
  peildatum: Date;
}) {
  return (
    <div className="vis" data-weergave="quickscan-benchmark">
      <Tegels
        tegels={[
          { label: "Vergelijkgroep", waarde: String(view.groepsgrootte), sub: "ziekenhuizen, X inbegrepen" },
          { label: "Boven het gemiddelde", waarde: String(view.boven), sub: `van ${view.aantalMetScore} bouwblokken` },
          { label: "Bovenste kwart", waarde: String(view.inBovensteKwart), sub: "bouwblokken" },
          { label: "Onderste kwart", waarde: String(view.inOndersteKwart), sub: "bouwblokken" },
        ]}
      />
      <div className="qv-kaart">
        <div className="qv-bandnamen qv-bandnamen--breed" aria-hidden="true" style={{ marginBottom: "0.3rem" }}>
          <div />
          <div style={{ justifyContent: "space-between" }}>
            <span>0%</span>
            <span>50%</span>
            <span>80%</span>
            <span>100%</span>
          </div>
          <div style={{ justifyContent: "flex-end" }}>{eigenNaam}</div>
        </div>
        {view.rijen.map((r) => (
          <Rij key={`${r.soort}-${r.sleutel}`} r={r} eigenNaam={eigenNaam} />
        ))}
      </div>
      <p className="vis-onderschrift">
        Vergelijkgroep van {view.groepsgrootte} ziekenhuizen, samengesteld door Coniche. Peildatum{" "}
        {new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(peildatum)}. De lichte band loopt van het laagste tot het hoogste
        ziekenhuis, de donkere band is het middelste deel van de groep, de blauwe streep het gemiddelde.
      </p>
    </div>
  );
}

function Rij({ r, eigenNaam }: { r: BenchmarkRijQs; eigenNaam: string }) {
  const diep = r.soort === "dimensie";
  if (r.nietVanToepassing) {
    return (
      <div className="qv-rij qv-rij--breed qv-rij--nvt">
        <span className="qv-naam qv-naam--nvt" style={{ paddingLeft: diep ? "1rem" : 0 }}>
          {r.naam}
        </span>
        <div className="qv-spoor qv-spoor--neutraal" />
        <span className="qv-waarde">Niet van toepassing</span>
      </div>
    );
  }
  return (
    <div className="qv-rij qv-rij--breed">
      <span className="qv-naam" style={{ fontWeight: r.soort === "dimensie" ? 600 : 800, paddingLeft: diep ? "1rem" : 0 }}>
        {r.naam}
        {r.gewicht !== 1 && <span className="gewicht-chip" style={{ marginLeft: "0.4rem" }}>{getal(r.gewicht)}×</span>}
      </span>
      <div className="qv-spoor qv-spoor--neutraal">
        <Hulplijnen />
        {r.groep && (
          <>
            <span className="qv-band qv-band--breed" style={{ left: `${r.groep.min}%`, width: `${r.groep.max - r.groep.min}%` }} />
            <span className="qv-band qv-band--smal" style={{ left: `${r.groep.q1}%`, width: `${r.groep.q3 - r.groep.q1}%` }} />
            <span className="qv-streep qv-streep--groep" style={{ left: `${r.groep.gemiddelde}%` }} />
          </>
        )}
        {r.eigen !== null && (
          <span className="qv-bol qv-bol--x" style={{ left: `${r.eigen}%` }} title={`${eigenNaam}: ${r.eigen}%`} />
        )}
      </div>
      <span className="qv-waarde">
        {r.eigen !== null && <strong>{r.eigen}%</strong>}
        {r.teWeinig ? (
          <span className="qv-label qv-label--gestreept">Te weinig ziekenhuizen</span>
        ) : (
          <>
            {r.verschil !== null && (
              <span className="text-ink-m" style={{ marginLeft: "0.4rem" }}>
                {teken(r.verschil)}
                {Math.abs(r.verschil)} pp
              </span>
            )}
            {r.positie && r.positie !== "Middenmoot" && (
              <span className={`qv-label ${r.positie === "Bovenste kwart" ? "qv-label--boven" : "qv-label--onder"}`}>{r.positie}</span>
            )}
            {r.positie === "Middenmoot" && <span className="qv-label">Middenmoot</span>}
          </>
        )}
      </span>
    </div>
  );
}
