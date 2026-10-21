"use client";

import { useState } from "react";
import { Antwoord, Assessment, Bouwblok } from "@/lib/types";
import { useInstellingen } from "@/lib/instellingen-store";
import { veldKleur, tekstOpVeldKleur } from "@/lib/colors";
import {
  GroepProfiel,
  GroepVeld,
  NIVEAUS,
  Niveau,
  SpanningScan,
  VeldScore,
  fmt1,
  fmtVerschil,
  groepProfiel,
  niveauNaam,
  rond1,
  spanningProfiel,
  veldKorteNaam,
} from "@/lib/spanning";
import {
  RADAR,
  Punt,
  hoekVoorAs,
  puntOp,
  puntVoorScore,
  straalVoorScore,
  veelhoekPad,
  wedgePad,
} from "@/lib/spanning-radar";
import { RingGegevens } from "@/components/ScoreRing";
import { ResultaatKop, Totaalkaart } from "@/components/Resultaatkop";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { celStap, schaalFractie } from "@/lib/mijn-metingen";

type Weergave = "eigen" | "groep";

/** Het eigen profiel: De antwoorden van één afgeronde scan. */
export interface SpanningEigen {
  antwoorden: Record<string, Antwoord>;
  subregel: (string | null | undefined | false)[];
}

/** De groep: De afgeronde scans van een Meting. De aanroeper beslist of de groep getoond mag worden (`groepZichtbaar`). */
export interface SpanningGroepInvoer {
  scans: SpanningScan[];
  subregel: (string | null | undefined | false)[];
}

const NEGATIEF = "var(--dal)";
const POSITIEF = "var(--bl)";

/** De ring van het Gemiddeld niveau: Gevuld tot (niveau − 1) / 4, in de volle kleur en de celkleur van het afgeronde niveau. */
export function ringVanGemiddeld(assessment: Assessment, gemiddeld: { score: number; niveau: Niveau }): RingGegevens {
  const stap = celStap(gemiddeld.score);
  return {
    fractie: schaalFractie(gemiddeld.score),
    kleur: `var(--score-${stap})`,
    getal: fmt1(gemiddeld.score),
    klasseNaam: niveauNaam(assessment, gemiddeld.niveau),
    chipAchtergrond: `var(--score-${stap}-cel)`,
    chipTekst: `var(--score-${stap}-cel-tekst)`,
  };
}

/**
 * Het resultaat van de Digitale Spanningsmeter (`visualisatie-spanningsmeter.md`, Resultaat; `CLAUDE.md`, scherm 6): Eén pagina in
 * twee weergaven, Jouw profiel (de antwoorden van één scan) en Groep (de afgeronde scans van een Meting). De schakelaar staat er
 * alleen als beide weergaven er zijn. Onder de Resultaatkop staat de Totaalkaart met het Gemiddeld niveau (een weergave en geen
 * score), twee kaarten met de belangrijkste spanning, de radar en de tabel Score per veld die elkaar oplichten, bij een groep de
 * uitsplitsing per rol, en De vijf niveaus. De open voorbeelden uit de groep staan er niet: De vrijgave is nog niet besloten.
 */
export function SpanningResultaat({
  assessment,
  eigen,
  groep,
  begin,
  toonKop = true,
  titel,
  eyebrowEigen = "Jouw resultaat",
  eyebrowGroep = "Resultaat van de Meting",
  kopRechts,
}: {
  assessment: Assessment;
  eigen?: SpanningEigen | null;
  groep?: SpanningGroepInvoer | null;
  /** De weergave waarmee de pagina begint. Standaard Jouw profiel, anders Groep. */
  begin?: Weergave;
  toonKop?: boolean;
  titel?: string;
  eyebrowEigen?: string;
  eyebrowGroep?: string;
  /** Rechts naast de titel, alleen in de voorbeeld-output: "← Terug". */
  kopRechts?: React.ReactNode;
}) {
  const { spanningMinPerRol } = useInstellingen();
  const [gekozen, setGekozen] = useState<Weergave>(begin ?? (eigen ? "eigen" : "groep"));
  const weergave: Weergave = gekozen === "groep" && !groep ? "eigen" : gekozen === "eigen" && !eigen ? "groep" : gekozen;
  const [actief, setActief] = useState<number | null>(null);

  const profiel = weergave === "eigen" && eigen ? spanningProfiel(assessment, eigen.antwoorden) : null;
  const groepsprofiel = weergave === "groep" && groep ? groepProfiel(assessment, groep.scans, spanningMinPerRol) : null;
  const gedeeld = groepsprofiel ?? profiel;
  if (!gedeeld) return null;
  const velden: (VeldScore | GroepVeld)[] = gedeeld.velden;

  const subregel = weergave === "eigen" ? eigen?.subregel : groep?.subregel;
  const aantalVragen = velden.reduce((n, v) => n + v.vragen, 0);
  // "30 van 30 vragen beantwoord": Een 0 (kan ik niet beoordelen) is ook een antwoord.
  const beantwoord = eigen ? velden.reduce((n, v) => n + v.veld.vragen.filter((q) => !q.gearchiveerd && eigen.antwoorden[q.id] !== undefined).length, 0) : 0;

  return (
    <div>
      {toonKop && (
        <ResultaatKop
          eyebrow={weergave === "eigen" ? eyebrowEigen : eyebrowGroep}
          titel={titel ?? assessment.naam}
          subregel={subregel}
          rechts={kopRechts}
        />
      )}

      {eigen && groep && (
        <div className="sp-schakelaar">
          <WeergaveWissel<Weergave>
            ariaLabel="Weergave"
            waarde={weergave}
            onChange={setGekozen}
            opties={[
              { waarde: "eigen", label: "Jouw profiel" },
              { waarde: "groep", label: "Groep" },
            ]}
          />
        </div>
      )}

      {gedeeld.gemiddeld ? (
        <Totaalkaart
          ring={ringVanGemiddeld(assessment, gedeeld.gemiddeld)}
          ringLabel="Niveau"
          ringAlt={`Gemiddeld niveau ${fmt1(gedeeld.gemiddeld.score)}, ${niveauNaam(assessment, gedeeld.gemiddeld.niveau)}`}
          uitleg={NIVEAUS[gedeeld.gemiddeld.niveau - 1].betekenis}
          feiten={[
            weergave === "eigen"
              ? `${beantwoord} van ${aantalVragen} vragen beantwoord`
              : `Gemiddelde van ${groepsprofiel?.scans} afgeronde ${groepsprofiel?.scans === 1 ? "scan" : "scans"}`,
          ]}
          extra={["Gemiddelde van de zes velden. De Spanningsmeter kent geen totaalscore."]}
        />
      ) : (
        <p className="admin-notice">Er is nog geen veld met genoeg beoordeelde vragen voor een profiel. Een veld heeft minstens drie vragen met een score van 1 tot 5 nodig.</p>
      )}

      <BelangrijksteSpanning gedeeld={gedeeld} groep={groepsprofiel} />

      <div className="sp-radar-rij">
        <section className="resultaat-kaart" aria-label="Spanningsprofiel">
          <h3>Spanningsprofiel</h3>
          <Radar assessment={assessment} velden={velden} grootste={gedeeld.grootste} groep={weergave === "groep"} actief={actief} onActief={setActief} />
          <RadarLegenda groep={weergave === "groep"} metGrootste={gedeeld.grootste !== null} />
        </section>
        <section className="resultaat-kaart" aria-label="Score per veld">
          <h3>Score per veld</h3>
          <ScoreTabel assessment={assessment} velden={velden} grootste={gedeeld.grootste} groep={weergave === "groep"} aantalScans={groepsprofiel?.scans} actief={actief} onActief={setActief} />
        </section>
      </div>

      {groepsprofiel && groepsprofiel.rollen.length >= 2 && <GemiddeldePerRol assessment={assessment} groep={groepsprofiel} min={spanningMinPerRol} />}

      <VijfNiveaus />
    </div>
  );
}

/** De titel en de tekst van de kaart Grootste spanning, met de volledige veldnamen (open punt 6: In koppen staat de volledige naam). */
function koppeling(v: VeldScore): { titel: string; tekst: string } | null {
  if (v.spanning === null || !v.referentie || v.score === null) return null;
  const refScore = referentieScore(v);
  const verschil = fmt1(Math.abs(v.spanning));
  const titel = v.spanning >= 0 ? `${v.veld.naam} loopt voor op ${v.referentie.naam}` : `${v.veld.naam} blijft achter bij ${v.referentie.naam}`;
  return { titel, tekst: `${fmt1(v.score)} tegen ${refScore}, een verschil van ${verschil}.` };
}

/** De score van het referentieveld, uit de spanning: `score − spanning`. Zo hoeft het profiel de referentiescore niet apart te dragen. */
function referentieScore(v: VeldScore): string {
  return fmt1((v.ruw as number) - (v.spanning as number));
}

function BelangrijksteSpanning({ gedeeld, groep }: { gedeeld: { grootste: VeldScore | null }; groep: GroepProfiel | null }) {
  const spanning = gedeeld.grootste ? koppeling(gedeeld.grootste) : null;
  const meest = groep?.meestUiteenlopend;
  const kaarten: { label: string; titel: string; tekst: string }[] = [];
  if (meest && meest.laagste !== null && meest.hoogste !== null) {
    kaarten.push({
      label: "Meest uiteenlopend",
      titel: meest.veld.naam,
      tekst: `Scores van ${fmt1(meest.laagste)} tot ${fmt1(meest.hoogste)}.`,
    });
  }
  if (spanning) kaarten.push({ label: "Grootste spanning", titel: spanning.titel, tekst: spanning.tekst });
  if (!groep) {
    kaarten.push({
      label: "Daarna",
      titel: "Het groepsbeeld volgt",
      tekst: "Het groepsbeeld volgt in de sessie. Jouw antwoorden blijven anoniem.",
    });
  }
  if (kaarten.length === 0) return null;
  return (
    <div className="sp-kaarten">
      {kaarten.map((k) => (
        <section key={k.label} className="resultaat-kaart sp-spanningkaart">
          <span className="sp-label">{k.label}</span>
          <h3>{k.titel}</h3>
          <p>{k.tekst}</p>
        </section>
      ))}
    </div>
  );
}

function Radar({
  assessment,
  velden,
  grootste,
  groep,
  actief,
  onActief,
}: {
  assessment: Assessment;
  velden: (VeldScore | GroepVeld)[];
  grootste: VeldScore | null;
  groep: boolean;
  actief: number | null;
  onActief: (i: number | null) => void;
}) {
  const n = velden.length;
  const punten: (Punt | null)[] = velden.map((v, i) => (v.ruw === null ? null : puntVoorScore(i, n, v.ruw)));
  const aanwezig = punten.filter((p): p is Punt => p !== null);
  const metBand = groep && velden.every((v) => (v as GroepVeld).laagste !== null && (v as GroepVeld).hoogste !== null);
  const buitenPad = metBand ? veelhoekPad(velden.map((v, i) => puntVoorScore(i, n, (v as GroepVeld).hoogste as number))) : "";
  const binnenPad = metBand ? veelhoekPad(velden.map((v, i) => puntVoorScore(i, n, (v as GroepVeld).laagste as number)).reverse()) : "";
  const alt = `Spanningsprofiel: ${velden.map((v) => `${veldKorteNaam(v.veld)} ${v.score === null ? "onvoldoende zicht" : fmt1(v.score)}`).join(", ")}`;
  const grootsteIndex = grootste ? velden.findIndex((v) => v.veld.id === grootste.veld.id) : -1;

  return (
    <svg className="sp-radar" viewBox={`0 0 ${RADAR.grootte} ${RADAR.grootte}`} role="img" aria-label={alt}>
      {velden.map((v, i) => (
        <path
          key={`w${v.veld.id}`}
          d={wedgePad(i, n)}
          fill={veldKleur(v.volgnummer)}
          fillOpacity={actief === null ? 0.12 : actief === i ? 0.34 : 0.06}
          stroke="#fff"
          strokeWidth={1}
          onMouseEnter={() => onActief(i)}
          onMouseLeave={() => onActief(null)}
          style={{ transition: "fill-opacity 200ms" }}
        >
          <title>{`${v.volgnummer}, ${v.veld.naam}`}</title>
        </path>
      ))}
      {[2, 3, 4, 5].map((s) => (
        <circle key={s} cx={RADAR.midden} cy={RADAR.midden} r={straalVoorScore(s)} fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={1.5} />
      ))}
      {velden.map((v, i) => {
        const buiten = puntOp(hoekVoorAs(i, n), RADAR.buiten);
        return <line key={`a${v.veld.id}`} x1={RADAR.midden} y1={RADAR.midden} x2={buiten.x} y2={buiten.y} stroke="#fff" strokeWidth={1} />;
      })}
      {metBand && <path d={`${buitenPad} ${binnenPad}`} fill="var(--or)" fillOpacity={0.12} fillRule="evenodd" />}
      {aanwezig.length >= 3 && (
        <path d={veelhoekPad(aanwezig)} fill={groep ? "none" : "var(--or)"} fillOpacity={groep ? 0 : 0.14} stroke="var(--or)" strokeWidth={2.5} strokeLinejoin="miter" />
      )}
      {aanwezig.length === 2 && <path d={`M ${aanwezig[0].x} ${aanwezig[0].y} L ${aanwezig[1].x} ${aanwezig[1].y}`} stroke="var(--or)" strokeWidth={2.5} />}
      {punten.map((p, i) =>
        p ? <circle key={`p${i}`} cx={p.x} cy={p.y} r={7} fill="var(--or)" stroke="#fff" strokeWidth={2} /> : null
      )}
      {grootsteIndex >= 0 && punten[grootsteIndex] && (
        <circle cx={punten[grootsteIndex]!.x} cy={punten[grootsteIndex]!.y} r={13} fill="none" stroke="var(--dal)" strokeWidth={2} />
      )}
      {velden.map((v, i) => {
        const plek = puntOp(hoekVoorAs(i, n), RADAR.buiten + 28);
        const groter = actief === i;
        return (
          <g
            key={`k${v.veld.id}`}
            tabIndex={0}
            role="img"
            aria-label={`${v.volgnummer}, ${v.veld.naam}, ${v.score === null ? "onvoldoende zicht" : `${fmt1(v.score)}, ${niveauNaam(assessment, v.niveau as Niveau)}`}`}
            onMouseEnter={() => onActief(i)}
            onMouseLeave={() => onActief(null)}
            onFocus={() => onActief(i)}
            onBlur={() => onActief(null)}
            className="sp-knooppunt"
          >
            <circle cx={plek.x} cy={plek.y} r={groter ? RADAR.knooppunt + 4 : RADAR.knooppunt} fill={veldKleur(v.volgnummer)} stroke={groter ? "var(--ink)" : "#fff"} strokeWidth={groter ? 3 : 2} />
            <text x={plek.x} y={plek.y} textAnchor="middle" dominantBaseline="central" dy="0.06em" fontSize={20} fontWeight={700} fill={tekstOpVeldKleur(v.volgnummer)} fontFamily="inherit">
              {v.volgnummer}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RadarLegenda({ groep, metGrootste }: { groep: boolean; metGrootste: boolean }) {
  return (
    <ul className="sp-legenda">
      {groep ? (
        <>
          <li>
            <svg width="28" height="10" aria-hidden="true">
              <line x1="0" y1="5" x2="28" y2="5" stroke="var(--or)" strokeWidth="2.5" />
            </svg>
            Gemiddelde van de groep
          </li>
          <li>
            <svg width="28" height="10" aria-hidden="true">
              <rect x="0" y="0" width="28" height="10" fill="var(--or)" fillOpacity="0.25" />
            </svg>
            Laagste tot hoogste score in de groep
          </li>
        </>
      ) : (
        <li>
          <svg width="28" height="10" aria-hidden="true">
            <line x1="0" y1="5" x2="28" y2="5" stroke="var(--or)" strokeWidth="2.5" />
          </svg>
          Jouw profiel
        </li>
      )}
      {metGrootste && (
        <li>
          <svg width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--dal)" strokeWidth="2" />
          </svg>
          Grootste spanning
        </li>
      )}
    </ul>
  );
}

function ScoreTabel({
  assessment,
  velden,
  grootste,
  groep,
  aantalScans,
  actief,
  onActief,
}: {
  assessment: Assessment;
  velden: (VeldScore | GroepVeld)[];
  grootste: VeldScore | null;
  groep: boolean;
  aantalScans: number | undefined;
  actief: number | null;
  onActief: (i: number | null) => void;
}) {
  return (
    <div className="sp-tabel" role="table" aria-label="Score per veld">
      <div className="sp-tabel-kop" role="row">
        <span role="columnheader">Veld</span>
        <span role="columnheader">Schaal 1 tot 5</span>
        <span role="columnheader">{groep ? "Gemiddelde" : "Jouw score"}</span>
        <span role="columnheader" className="sp-rechts">
          Spanning
        </span>
      </div>
      {velden.map((v, i) => {
        const kleur = veldKleur(v.volgnummer);
        const g = v as GroepVeld;
        const is = grootste?.veld.id === v.veld.id;
        const stap = v.score === null ? null : celStap(v.score);
        return (
          <div
            key={v.veld.id}
            role="row"
            className={`sp-tabel-rij ${actief === i ? "is-actief" : ""}`}
            tabIndex={0}
            onMouseEnter={() => onActief(i)}
            onMouseLeave={() => onActief(null)}
            onFocus={() => onActief(i)}
            onBlur={() => onActief(null)}
          >
            <span role="cell" className="sp-tabel-naam" title={v.veld.naam}>
              <span className="sp-nr" style={{ background: kleur, color: tekstOpVeldKleur(v.volgnummer) }}>
                {v.volgnummer}
              </span>
              <span className="sp-tabel-tekst">
                <span>{veldKorteNaam(v.veld)}</span>
                {groep && g.scansMetScore < (aantalScans ?? 0) && <small>{g.scansMetScore} van {aantalScans} beoordeeld</small>}
              </span>
            </span>
            <span role="cell" className="sp-spoor-cel">
              {v.score === null ? (
                <span className="sp-spoor" />
              ) : groep ? (
                <span className="sp-spoor sp-spoor--groep">
                  {g.laagste !== null && g.hoogste !== null && (
                    <span className="sp-bereik" style={{ left: `${schaalFractie(g.laagste) * 100}%`, width: `${(schaalFractie(g.hoogste) - schaalFractie(g.laagste)) * 100}%` }} />
                  )}
                  <span className="sp-stip" style={{ left: `${schaalFractie(v.score) * 100}%`, background: kleur }} />
                </span>
              ) : (
                <span className="sp-spoor">
                  <span className="sp-balk" style={{ width: `${schaalFractie(v.score) * 100}%`, background: kleur }} />
                </span>
              )}
            </span>
            <span role="cell">
              {v.score === null || stap === null ? (
                <span className="sp-geen">Onvoldoende zicht</span>
              ) : (
                <span className="sp-chip" style={{ background: `var(--score-${stap}-cel)`, color: `var(--score-${stap}-cel-tekst)` }}>
                  {fmt1(v.score)} · {niveauNaam(assessment, v.niveau as Niveau)}
                </span>
              )}
            </span>
            <span role="cell" className="sp-rechts">
              {v.spanning === null ? (
                "–"
              ) : (
                <span className={is ? "sp-spanning sp-spanning--grootste" : "sp-spanning"} style={{ color: v.spanning >= 0 ? POSITIEF : NEGATIEF }}>
                  {fmtVerschil(v.spanning)}
                </span>
              )}
            </span>
          </div>
        );
      })}
      {grootste && (
        <p className="sp-tabel-uitleg">
          <span className="sp-spanning sp-spanning--grootste">±</span> Grootste spanning. Het verschil met het laagste veld dat eerder in de volgorde staat. Positief is voorlopen op het fundament.
        </p>
      )}
    </div>
  );
}

function GemiddeldePerRol({ assessment, groep, min }: { assessment: Assessment; groep: GroepProfiel; min: number }) {
  const kolommen = groep.rollen;
  const grootste = groep.grootsteRolVerschil;
  return (
    <section className="resultaat-kaart sp-rol" aria-label="Gemiddelde per rol">
      <div className="sp-rol-kop">
        <h3>Gemiddelde per rol</h3>
        <p>Een rol met minder dan {min} deelnemers staat niet in de tabel, zodat antwoorden anoniem blijven.</p>
      </div>
      <div className="sp-rol-tabel" style={{ gridTemplateColumns: `220px repeat(${kolommen.length}, minmax(96px, 1fr)) 110px` }} role="table">
        <span />
        {kolommen.map((k) => (
          <span key={k.rolgroep} className="sp-rol-kolom" role="columnheader" title={k.rolgroep}>
            <strong>{k.rolgroep}</strong>
            <small>{k.scans} deelnemers</small>
          </span>
        ))}
        <span className="sp-rol-kolom sp-rechts" role="columnheader">
          <strong>Verschil</strong>
        </span>
        {groep.velden.map((v, vi) => (
          <RolRij key={v.veld.id} assessment={assessment} veld={v.veld} kolommen={kolommen.map((k) => k.gemiddelden[vi])} verschil={groep.rolVerschil[vi]} grootste={grootste} />
        ))}
      </div>
    </section>
  );
}

function RolRij({ assessment, veld, kolommen, verschil, grootste }: { assessment: Assessment; veld: Bouwblok; kolommen: (number | null)[]; verschil: number | null; grootste: number | null }) {
  const is = verschil !== null && grootste !== null && rond1(verschil) === rond1(grootste);
  return (
    <>
      <span className="sp-tabel-naam" role="rowheader" title={veld.naam}>
        <span className="sp-nr" style={{ background: veldKleur(veld.volgnummer), color: tekstOpVeldKleur(veld.volgnummer) }}>
          {veld.volgnummer}
        </span>
        <span className="sp-tabel-tekst">{veldKorteNaam(veld)}</span>
      </span>
      {kolommen.map((g, i) => {
        const stap = g === null ? null : celStap(g);
        return (
          <span
            key={i}
            role="cell"
            className="sp-rol-cel"
            style={stap === null ? undefined : { background: `var(--score-${stap}-cel)`, color: `var(--score-${stap}-cel-tekst)` }}
            title={g === null ? undefined : `${fmt1(g)}, ${niveauNaam(assessment, stap as Niveau)}`}
          >
            {g === null ? "–" : fmt1(g)}
          </span>
        );
      })}
      <span role="cell" className={`sp-rechts sp-rol-verschil ${is ? "is-grootste" : ""}`}>
        {verschil === null ? "–" : fmt1(verschil)}
      </span>
    </>
  );
}

function VijfNiveaus() {
  return (
    <section className="resultaat-kaart sp-niveaus" aria-label="De vijf niveaus">
      <h3>De vijf niveaus</h3>
      <ol>
        {NIVEAUS.map((n) => (
          <li key={n.niveau}>
            <span className="sp-niveau-rond" style={{ background: `var(--score-${n.niveau})`, color: n.niveau === 3 || n.niveau === 4 ? "var(--ink)" : "#fff" }}>
              {n.niveau}
            </span>
            <strong>{n.naam}</strong>
            <small>{n.grenzen}</small>
            <span>{n.betekenis}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
