"use client";

import { useState } from "react";
import { MetingAfdeling, MetingBouwblok, QuickscanMeting, SpreidingUitkomst } from "@/lib/quickscan-groep";
import { Tegels } from "@/components/visualisatie/gedeeld";
import { Bandnamen, Hulplijnen, KLASSE_STIJL, KlasseBadge, getal } from "./gedeeld";

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
      <Bandnamen rechts="Gemiddelde" />
      {dimensies.map((b) => (
        <DimensieRij key={b.bouwblok.id} b={b} />
      ))}
    </section>
  );
}

function DimensieRij({ b }: { b: MetingBouwblok }) {
  const s = b.klasse ? KLASSE_STIJL[b.klasse] : null;
  return (
    <div className="qv-rij">
      <span className="qv-naam">
        {b.bouwblok.naam}
        {b.gewicht !== 1 && <span className="gewicht-chip" style={{ marginLeft: "0.4rem" }}>{getal(b.gewicht)}×</span>}
        <span className="text-ink-s" style={{ fontWeight: 400 }}> · {b.vragen} {b.vragen === 1 ? "vraag" : "vragen"}</span>
      </span>
      <div className="qv-spoor">
        <Hulplijnen />
        {b.bollen.map((bol) => (
          <span
            key={bol.percentage}
            className={`qv-bol qv-bol--groep ${bol.aantal === 1 ? "qv-bol--een" : ""}`}
            style={{ left: `${bol.percentage}%` }}
          >
            {bol.aantal > 1 ? bol.aantal : ""}
          </span>
        ))}
        {b.gemiddelde !== null && <span className="qv-streep" style={{ left: `${b.gemiddelde}%` }} title={`Gemiddelde: ${b.percentage}%`} />}
      </div>
      <span className="qv-waarde">
        <strong style={{ color: s?.tekst }}>{b.percentage ?? 0}%</strong>
        <SpreidingLabel u={b.spreiding} />
      </span>
    </div>
  );
}
