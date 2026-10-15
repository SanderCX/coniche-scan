"use client";

import { useState } from "react";
import { Assessment, Antwoord } from "@/lib/types";
import { AfdelingVerdeling, QuickscanScan, VraagVerdeling, quickscanVerdeling } from "@/lib/quickscan-groep";
import { kolommenVoorScans } from "@/lib/visualisatie";
import { klasseVanPercentage } from "@/lib/quickscan";
import { Tegels } from "@/components/visualisatie/gedeeld";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { ANTWOORD_KLEUR, KLASSE_STIJL } from "./gedeeld";

type Stand = "verdeling" | "respondent";

/**
 * Weergave 4, Antwoorden per vraag (`visualisatie-quickscan.md`, 4), met twee standen: Verdeling (standaard) en Per respondent.
 * Verdeling toont per vraag een gestapelde balk van Ja, Nee en Weet ik niet over de respondenten die de afdeling relevant
 * vonden, zonder namen. Per respondent toont een cel J, N of ? per scan, met de namen of initialen van weergave G.
 */
export function QuickscanAntwoorden({
  assessment,
  scans,
  namen,
  anoniem,
  perRespondentToegestaan = true,
}: {
  assessment: Assessment;
  scans: QuickscanScan[];
  /** De naam per scan-id, voor de stand Per respondent. */
  namen: Record<string, string>;
  /** Een Lead zonder namen: De kolommen heten R1 tot en met Rn. */
  anoniem: boolean;
  perRespondentToegestaan?: boolean;
}) {
  const [stand, setStand] = useState<Stand>("verdeling");
  const verdeling = quickscanVerdeling(assessment, scans);
  if (scans.length === 0) return <p className="admin-notice">Er zijn nog geen afgeronde scans in deze Meting.</p>;
  return (
    <div className="vis" data-weergave="quickscan-antwoorden">
      {perRespondentToegestaan && (
        <div className="vis-acties">
          <WeergaveWissel
            ariaLabel="Stand van de antwoorden"
            opties={[
              { waarde: "verdeling", label: "Verdeling" },
              { waarde: "respondent", label: "Per respondent" },
            ]}
            waarde={stand}
            onChange={setStand}
          />
        </div>
      )}
      {stand === "verdeling" ? (
        <Verdeling verdeling={verdeling} />
      ) : (
        <PerRespondent assessment={assessment} scans={scans} namen={namen} anoniem={anoniem} />
      )}
    </div>
  );
}

function Verdeling({ verdeling }: { verdeling: AfdelingVerdeling[] }) {
  const eerste = verdeling.find((a) => a.respondenten > 0)?.categorie.id ?? verdeling[0]?.categorie.id;
  const [gekozen, setGekozen] = useState<string | undefined>(eerste);
  const a = verdeling.find((x) => x.categorie.id === gekozen) ?? verdeling[0];
  if (!a) return null;
  const totaal = a.ja + a.nee + a.weetNiet;
  const pct = (n: number) => (totaal === 0 ? 0 : Math.round((n / totaal) * 100));
  const vraagTegel = (v: VraagVerdeling | null, wat: "ja" | "weetNiet") =>
    v
      ? {
          waarde: `${wat === "ja" ? v.ja : v.weetNiet} van ${v.ja + v.nee + v.weetNiet}`,
          sub: `${v.bouwblokNaam}, vraag ${v.nummer}`,
        }
      : { waarde: "–" };
  return (
    <>
      <div className="qv-keuze" role="group" aria-label="Afdeling">
        {verdeling.map((x) => (
          <button
            key={x.categorie.id}
            type="button"
            className="pil"
            disabled={x.respondenten === 0}
            aria-pressed={x.categorie.id === a.categorie.id}
            onClick={() => setGekozen(x.categorie.id)}
          >
            {x.categorie.naam}
          </button>
        ))}
      </div>

      <Tegels
        tegels={[
          { label: "Respondenten", waarde: String(a.respondenten), sub: "die de afdeling relevant vonden" },
          {
            label: "Alle antwoorden",
            waarde: `${pct(a.ja)}% Ja`,
            sub: `${pct(a.nee)}% Nee · ${pct(a.weetNiet)}% Weet ik niet`,
          },
          { label: "Minst vaak Ja", ...vraagTegel(a.minstJa, "ja") },
          { label: "Vaakst Weet ik niet", ...vraagTegel(a.vaakstWeetNiet, "weetNiet") },
        ]}
      />
      <div className="qv-stapel" style={{ marginTop: "0.6rem" }} role="img" aria-label={`Ja ${pct(a.ja)}%, Nee ${pct(a.nee)}%, Weet ik niet ${pct(a.weetNiet)}%`}>
        <div style={{ width: `${pct(a.ja)}%`, background: ANTWOORD_KLEUR.ja }}>{a.ja || ""}</div>
        <div style={{ width: `${pct(a.nee)}%`, background: ANTWOORD_KLEUR.nee }}>{a.nee || ""}</div>
        <div style={{ width: `${pct(a.weetNiet)}%`, background: ANTWOORD_KLEUR.weetNiet, color: "var(--ink)" }}>{a.weetNiet || ""}</div>
      </div>
      <p className="qv-legenda">
        <span><i style={{ background: ANTWOORD_KLEUR.ja }} />Ja</span>
        <span><i style={{ background: ANTWOORD_KLEUR.nee }} />Nee</span>
        <span><i style={{ background: ANTWOORD_KLEUR.weetNiet }} />Weet ik niet</span>
        <span className="text-ink-s">De getallen in de balken zijn aantallen respondenten.</span>
      </p>

      {a.dimensies.map((d) => (
        <section key={d.bouwblok.id}>
          <div className="qv-dimensie-kop">
            <span>
              {d.bouwblok.naam}
              {d.gewicht !== 1 && <span className="gewicht-chip" style={{ marginLeft: "0.4rem" }}>{String(d.gewicht).replace(".", ",")}×</span>}
              <span className="text-ink-s" style={{ fontWeight: 400 }}> · {d.vragen.length} {d.vragen.length === 1 ? "vraag" : "vragen"}</span>
            </span>
            <span>{d.percentage === null ? "–" : `${d.percentage}% Ja gemiddeld`}</span>
          </div>
          {d.vragen.map((v) => (
            <VraagRij key={v.vraagId} v={v} />
          ))}
        </section>
      ))}
    </>
  );
}

function VraagRij({ v }: { v: VraagVerdeling }) {
  const totaal = v.ja + v.nee + v.weetNiet;
  const breedte = (n: number) => (totaal === 0 ? 0 : (n / totaal) * 100);
  const klasse = v.jaPercentage === null ? null : klasseVanPercentage(v.jaPercentage);
  return (
    <div className="qv-vraag-rij">
      <span className="text-ink-s" style={{ fontWeight: 700 }}>{v.nummer}</span>
      <span>
        {v.tekst}
        {v.onbekend && (
          <span className="qv-label qv-label--gestreept" style={{ marginLeft: 0, marginTop: "0.3rem", display: "block", width: "fit-content" }}>
            Onbekend bij {v.weetNiet} van {totaal}
          </span>
        )}
      </span>
      <div className="qv-stapel" role="img" aria-label={`Ja ${v.ja}, Nee ${v.nee}, Weet ik niet ${v.weetNiet}`}>
        {v.ja > 0 && <div style={{ width: `${breedte(v.ja)}%`, background: ANTWOORD_KLEUR.ja }}>{v.ja}</div>}
        {v.nee > 0 && <div style={{ width: `${breedte(v.nee)}%`, background: ANTWOORD_KLEUR.nee }}>{v.nee}</div>}
        {v.weetNiet > 0 && <div style={{ width: `${breedte(v.weetNiet)}%`, background: ANTWOORD_KLEUR.weetNiet, color: "var(--ink)" }}>{v.weetNiet}</div>}
      </div>
      <span className="qv-waarde" style={{ color: klasse ? KLASSE_STIJL[klasse].tekst : undefined, fontWeight: 700 }}>
        {v.jaPercentage === null ? "–" : `${v.jaPercentage}% Ja`}
      </span>
    </div>
  );
}

const CEL: Record<Antwoord & string, { letter: string; kleur: string; tekst: string }> = {
  ja: { letter: "J", kleur: ANTWOORD_KLEUR.ja, tekst: "#fff" },
  nee: { letter: "N", kleur: ANTWOORD_KLEUR.nee, tekst: "#fff" },
  "weet-niet": { letter: "?", kleur: ANTWOORD_KLEUR.weetNiet, tekst: "var(--ink)" },
};

function PerRespondent({
  assessment,
  scans,
  namen,
  anoniem,
}: {
  assessment: Assessment;
  scans: QuickscanScan[];
  namen: Record<string, string>;
  anoniem: boolean;
}) {
  const kolommen = kolommenVoorScans(
    scans.map((s) => ({ id: s.id, naam: namen[s.id] ?? "" })),
    anoniem
  );
  const perId = new Map(scans.map((s) => [s.id, s]));
  const categorieen = (assessment.categorieen ?? []).filter((c) => !c.gearchiveerd);
  return (
    <div className="vis-antw-kaart" style={{ marginTop: "1rem" }}>
      <table className="vis-antw">
        <thead>
          <tr>
            <th className="vis-antw-naam">Vraag</th>
            {kolommen.map((k) => (
              <th key={k.invullingId} title={k.naam || undefined}>
                {k.initialen}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categorieen.flatMap((c) =>
            c.bouwblokken
              .filter((b) => !b.gearchiveerd)
              .flatMap((b) => [
                <tr key={`k-${b.id}`} className="vis-antw-blok">
                  <td className="vis-antw-naam" colSpan={kolommen.length + 1}>
                    <strong>
                      {c.naam} · {b.naam}
                    </strong>
                  </td>
                </tr>,
                ...b.vragen
                  .filter((v) => !v.gearchiveerd)
                  .map((v) => (
                    <tr key={v.id}>
                      <td className="vis-antw-naam" title={v.tekst}>
                        <span className="text-ink-s" style={{ fontWeight: 700 }}>
                          {b.volgnummer}.{v.volgnummer}
                        </span>{" "}
                        {v.tekst}
                      </td>
                      {kolommen.map((k) => {
                        const scan = perId.get(k.invullingId);
                        const relevant = scan?.relevantie?.[c.id] !== false;
                        const a = scan?.antwoorden[v.id];
                        const cel = relevant && typeof a === "string" ? CEL[a] : undefined;
                        return (
                          <td
                            key={k.invullingId}
                            className="qv-cel-antwoord"
                            style={cel ? { background: cel.kleur, color: cel.tekst } : { color: "var(--ink-s)" }}
                          >
                            {cel ? cel.letter : relevant ? "" : "n.v.t."}
                          </td>
                        );
                      })}
                    </tr>
                  )),
              ])
          )}
        </tbody>
      </table>
    </div>
  );
}
