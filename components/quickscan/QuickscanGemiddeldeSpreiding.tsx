"use client";

import { useState } from "react";
import { MetingAfdeling, MetingBouwblok, QuickscanMeting, SpreidingUitkomst } from "@/lib/quickscan-groep";
import { Tegels } from "@/components/visualisatie/gedeeld";
import { Hulplijnen, KLASSE_STIJL, KlasseBadge, getal } from "./gedeeld";

function SpreidingLabel({ u }: { u: SpreidingUitkomst | null }) {
  if (!u) return null;
  if (u.soort === "weinigVragen") {
    return (
      <span className="qv-label qv-label--gestreept">
        {u.vragen} {u.vragen === 1 ? "vraag" : "vragen"}
      </span>
    );
  }
  if (u.soort === "weinigAntwoorden") return <span className="qv-label qv-label--gestreept">Te weinig antwoorden</span>;
  return <span className={`qv-label ${u.label === "Verdeeld" ? "qv-label--verdeeld" : ""}`}>{u.label}</span>;
}

/**
 * Weergave 3, Gemiddelde en spreiding (`visualisatie-quickscan.md`, 3): Per afdeling een kaart, per dimensie een balk van 0 tot
 * 100% met per voorkomende score een grijze bol met het aantal respondenten erin (één respondent is een kleine stip zonder
 * getal), een zwarte streep op het gemiddelde en rechts het gemiddelde met het spreidingslabel. De bollen hebben geen naam, geen
 * tooltip en zijn niet aanklikbaar. Geldt voor een Lead de ondergrens `minRespondenten`, dan staat een afdeling met minder
 * relevante scans er als "Te weinig antwoorden".
 */
export function QuickscanGemiddeldeSpreiding({
  meting,
  uitgenodigd,
  minRespondenten,
}: {
  meting: QuickscanMeting;
  /** Het aantal uitgenodigde respondenten, voor de tegel "Afgeronde scans". */
  uitgenodigd?: number;
  /** De ondergrens voor een Lead (`benchmarkMinRespondenten`). Voor een Admin en Consultant `undefined`. */
  minRespondenten?: number;
}) {
  const [opSpreiding, setOpSpreiding] = useState(false);
  if (meting.aantalScans === 0) return <p className="admin-notice">Er zijn nog geen afgeronde scans in deze Meting.</p>;
  const gemiddeldeTegel = (lijst: MetingAfdeling[]) =>
    lijst.length === 0
      ? { waarde: "–", sub: undefined }
      : { waarde: lijst.map((a) => a.categorie.naam).join(", "), sub: `${lijst[0].percentage}%` };
  const sterkste = gemiddeldeTegel(meting.sterkste);
  const meeste = gemiddeldeTegel(meting.meesteOntwikkelruimte);

  return (
    <div className="vis" data-weergave="quickscan-spreiding">
      <Tegels
        tegels={[
          {
            label: "Afgeronde scans",
            waarde: String(meting.aantalScans),
            sub: uitgenodigd !== undefined ? `van ${uitgenodigd} uitgenodigd` : undefined,
          },
          {
            label: "Totaal van de Meting",
            waarde: meting.percentage === null ? "–" : `${meting.percentage}%`,
            sub: meting.klasse ? (meting.klasse === "groen" ? "Sterk ontwikkeld" : meting.klasse === "oranje" ? "Gemiddeld ontwikkeld" : "Aanzienlijke ontwikkelruimte") : undefined,
          },
          { label: "Sterkste afdeling", ...sterkste },
          { label: "Meeste ontwikkelruimte", ...meeste },
        ]}
      />
      <div className="vis-acties">
        <button type="button" className="btn btn-outline btn-compact" onClick={() => setOpSpreiding((x) => !x)} aria-pressed={opSpreiding}>
          {opSpreiding ? "Volgorde van het model" : "Sorteer op spreiding"}
        </button>
      </div>

      {meting.afdelingen.map((a) => (
        <AfdelingKaart key={a.categorie.id} afdeling={a} opSpreiding={opSpreiding} minRespondenten={minRespondenten} />
      ))}
      <p className="vis-onderschrift">
        Een grijze bol is het aantal respondenten met die score, een zwarte streep is het gemiddelde. De spreiding is de
        standaardafwijking in procentpunten: onder 14 eensgezind, van 14 tot 20 wisselend, vanaf 20 verdeeld.
      </p>
    </div>
  );
}

function AfdelingKaart({
  afdeling: a,
  opSpreiding,
  minRespondenten,
}: {
  afdeling: MetingAfdeling;
  opSpreiding: boolean;
  minRespondenten?: number;
}) {
  const naam = a.categorie.naam;
  if (!a.vanToepassing) {
    return (
      <section className="qv-kaart" style={{ background: "var(--bg-mid)" }}>
        <h3 className="qv-naam--nvt">{naam}</h3>
        <p className="qv-kaart-sub">Niet van toepassing: Geen respondent vond deze afdeling relevant.</p>
      </section>
    );
  }
  const teWeinig = minRespondenten !== undefined && a.relevanteScans < minRespondenten;
  if (teWeinig) {
    return (
      <section className="qv-kaart">
        <h3>{naam}</h3>
        <p className="qv-kaart-sub">
          Relevant voor {a.relevanteScans} van {a.alleScans} respondenten.
        </p>
        <p className="text-sm text-ink-m" style={{ margin: 0 }}>
          Te weinig antwoorden om de spreiding te tonen.
        </p>
      </section>
    );
  }
  const dimensies: MetingBouwblok[] = opSpreiding
    ? [...a.bouwblokken].sort((x, y) => (y.sd ?? -1) - (x.sd ?? -1))
    : a.bouwblokken;
  const s = a.klasse ? KLASSE_STIJL[a.klasse] : null;
  return (
    <section className="qv-kaart" style={{ borderLeft: `4px solid ${s?.kleur ?? "var(--border)"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "baseline" }}>
        <h3>{naam}</h3>
        <span>
          <strong style={{ color: s?.tekst, fontSize: "var(--fs-18)" }}>{a.percentage ?? 0}%</strong>{" "}
          <span className="text-sm text-ink-m">
            {getal(a.punten)}/{getal(a.maximum)}
          </span>{" "}
          <KlasseBadge klasse={a.klasse} />
        </span>
      </div>
      <p className="qv-kaart-sub">
        Relevant voor {a.relevanteScans} van {a.alleScans} respondenten
        {a.relevanteScans < a.alleScans && ` (${a.alleScans - a.relevanteScans} vond de afdeling niet van toepassing)`}.
      </p>
      <div className="qv-rij qv-rij--spreiding qv-bandnamen" aria-hidden="true">
        <div />
        <div className="qv-bandnamen-spoor">
          <span style={{ width: "50%" }}>Ontwikkelruimte</span>
          <span style={{ width: "30%" }}>Gemiddeld inzicht</span>
          <span style={{ width: "20%" }}>Goed op orde</span>
        </div>
        <div style={{ justifyContent: "flex-end" }}>Gemiddelde</div>
        <div />
      </div>
      {dimensies.map((b) => (
        <DimensieRij key={b.bouwblok.id} b={b} />
      ))}
    </section>
  );
}

/**
 * Een rij per dimensie (`visualisatie-quickscan.md`, 3, Ruimte en lagen): Vier kolommen met een vaste breedte (label 280px, spoor,
 * gemiddelde 64px en spreidingslabel 176px), minstens 48px hoog. In het spoor liggen van onder naar boven de banden, de stippellijnen,
 * de streep op het gemiddelde (32px, achter de bollen) en de bollen, die binnen het spoor blijven. Alles staat op één regel.
 */
function DimensieRij({ b }: { b: MetingBouwblok }) {
  const s = b.klasse ? KLASSE_STIJL[b.klasse] : null;
  // Bij minder dan 3 vragen staat het aantal in het spreidingslabel en niet ook achter de naam.
  const metAantal = b.vragen >= 3;
  const naamTekst = `${b.bouwblok.naam}${metAantal ? ` · ${b.vragen} vragen` : ""}`;
  return (
    <div className="qv-rij qv-rij--spreiding">
      <span className="qv-naam qv-naam--een" title={b.bouwblok.naam}>
        {b.bouwblok.naam}
        {b.gewicht !== 1 && <span className="gewicht-chip" style={{ marginLeft: "0.4rem" }}>{getal(b.gewicht)}×</span>}
        {metAantal && <span className="text-ink-s" style={{ fontWeight: 400, fontSize: "var(--fs-12)" }}> · {b.vragen} vragen</span>}
        <span className="sr-only">{naamTekst}</span>
      </span>
      <div className="qv-spoor qv-spoor--lagen">
        <Hulplijnen />
        {b.gemiddelde !== null && (
          <span className="qv-streep qv-streep--laag" style={{ left: `clamp(1px, ${b.gemiddelde}%, calc(100% - 1px))` }} title={`Gemiddelde: ${b.percentage}%`} />
        )}
        {b.bollen.map((bol) => (
          <span
            key={bol.percentage}
            className={`qv-bol qv-bol--groep ${bol.aantal === 1 ? "qv-bol--een" : ""}`}
            style={{ left: `clamp(${bol.aantal === 1 ? 7 : 12}px, ${bol.percentage}%, calc(100% - ${bol.aantal === 1 ? 7 : 12}px))` }}
          >
            {bol.aantal > 1 ? bol.aantal : ""}
          </span>
        ))}
      </div>
      <span className="qv-gemiddelde" style={{ color: s?.tekst }}>
        {b.percentage ?? 0}%
      </span>
      <span className="qv-spreiding">
        <SpreidingLabel u={b.spreiding} />
      </span>
    </div>
  );
}
