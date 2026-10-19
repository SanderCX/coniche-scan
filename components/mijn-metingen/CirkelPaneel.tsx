"use client";

import { balkVul } from "@/lib/format";
import { Respons, Teaser, langeDatum } from "@/lib/mijn-metingen";
import { dagVan } from "@/lib/metingen";

/**
 * De Kaart met cirkel (`visualisatie-mijn-metingen.md`, Kaart met cirkel, voorstel van 19 oktober 2026): Een paneel met links een
 * zijblok (de cirkel met de totaalscore, de klassenchip en bij een Lead de groep) en rechts een rij per categorie of afdeling met Jij en
 * Groep op één spoor. Eén paneel voor een Respondent, een Lead en een Lead die ook invult, voor elk Assessment met categorieën of
 * afdelingen. De groep staat er alleen bij een Lead met Resultaten en genoeg afgeronde scans.
 */

const CIRKEL = 156;
const DIKTE = 14;
const STRAAL = (CIRKEL - DIKTE) / 2;
const OMTREK = 2 * Math.PI * STRAAL;

/** De cirkel: Spoor, vulling vanaf boven met de klok mee en bij een groep een stip op het gemiddelde. */
function Cirkel({ teaser, stipFractie, alt }: { teaser: Teaser; stipFractie?: number; alt: string }) {
  const fractie = Math.min(1, Math.max(0, teaser.ring.fractie));
  const hoek = ((stipFractie ?? 0) * 2 * Math.PI) as number;
  const midden = CIRKEL / 2;
  return (
    <div className="mm-cirkel" role="img" aria-label={alt}>
      <svg width={CIRKEL} height={CIRKEL} viewBox={`0 0 ${CIRKEL} ${CIRKEL}`} aria-hidden="true">
        <circle cx={midden} cy={midden} r={STRAAL} fill="none" stroke="var(--bg-mid)" strokeWidth={DIKTE} />
        {fractie > 0 && (
          <circle
            cx={midden}
            cy={midden}
            r={STRAAL}
            fill="none"
            stroke={teaser.ring.kleur}
            strokeWidth={DIKTE}
            strokeLinecap="round"
            strokeDasharray={`${fractie * OMTREK} ${OMTREK}`}
            transform={`rotate(-90 ${midden} ${midden})`}
          />
        )}
        {stipFractie !== undefined && (
          <circle
            cx={midden + STRAAL * Math.sin(hoek)}
            cy={midden - STRAAL * Math.cos(hoek)}
            r={7}
            fill="var(--ink-m)"
            stroke="var(--bg-warm)"
            strokeWidth={2}
          />
        )}
      </svg>
      <div className="mm-cirkel-tekst">
        <span className="mm-cirkel-getal">{teaser.getal}</span>
        <span className="mm-cirkel-label">Totaalscore</span>
      </div>
    </div>
  );
}

export function CirkelPaneel({
  eigen,
  groep,
  groepWacht,
  respons,
  afgerondOp,
}: {
  /** De teaser van de eigen scan. `null` bij een Lead die niet invult: Dan toont het paneel alleen de groep. */
  eigen: Teaser | null;
  /** De teaser van de hele Meting, alleen met Resultaten aan en genoeg afgeronde scans. */
  groep: Teaser | null;
  /** Met Resultaten aan maar onder de drempel: "Resultaten van de groep volgen bij minstens n afgeronde scans". */
  groepWacht?: { afgerond: number; minimum: number };
  /** Alleen voor een Lead. `laatsteDatum` is de dag van de laatst afgeronde scan. */
  respons?: Respons & { laatsteDatum: string };
  /** Voor een Respondent zonder Resultaten: "Afgerond op <datum>". */
  afgerondOp?: string | null;
}) {
  const hoofd = eigen ?? groep;
  if (!hoofd) return null;
  const quick = hoofd.soort === "percentage";
  const groepRij = new Map((groep?.rijen ?? []).map((r) => [r.sleutel, r]));
  const metGroep = groep !== null && groepRij.size > 0;
  const metJij = eigen !== null;
  const klasse = hoofd.klasseNaam ?? "";
  const groepAantal = groep?.aantalScans;

  return (
    <div className={`mm-paneel ${quick ? "mm-paneel--quick" : ""}`}>
      <div className="mm-zij">
        <Cirkel
          teaser={hoofd}
          stipFractie={metJij && groep ? groep.ring.fractie : undefined}
          alt={`Totaalscore ${hoofd.getal}${klasse ? `, ${klasse}` : ""}`}
        />
        <span className="mm-cirkel-chip" style={{ background: hoofd.ring.chipAchtergrond, color: hoofd.ring.chipTekst }}>
          {klasse}
        </span>
        {metJij && groep && (
          <div className="mm-zij-groep">
            <span className="mm-label-klein">Groep, {groepAantal} scans</span>
            <span>
              <strong>{groep.getal}</strong> {groep.klasseNaam}
            </span>
          </div>
        )}
        {!metJij && groep && (
          <div className="mm-zij-groep">
            <span className="mm-label-klein">Groep, {groepAantal} scans</span>
          </div>
        )}
        {metJij && !groep && afgerondOp && (
          <div className="mm-zij-groep">
            <span className="mm-tekst">Afgerond op {langeDatum(dagVan(afgerondOp))}</span>
          </div>
        )}
      </div>

      <div className="mm-paneel-rijen" style={{ ["--mm-kolommen" as string]: (metJij ? 1 : 0) + (metGroep ? 1 : 0) }}>
        <div className="mm-paneel-rij mm-paneel-kop">
          <span className="mm-label-klein">{quick ? "Per afdeling" : "Per categorie"}</span>
          <span />
          {metJij && <span className="mm-kolomkop">Jij</span>}
          {metGroep && <span className="mm-kolomkop">Groep</span>}
        </div>
        {hoofd.rijen.map((r) => {
          const g = groepRij.get(r.sleutel);
          const alt = [r.alt, metJij && g ? `groep ${g.waarde}` : ""].filter(Boolean).join(", ");
          return (
            <div key={r.sleutel} className="mm-paneel-rij" role="img" aria-label={alt} title={quick && metJij ? r.waarde : undefined}>
              <span className="mm-paneel-naam" title={r.naam}>
                {r.naam}
              </span>
              <span className="mm-paneel-spoor" aria-hidden="true">
                {metJij && <i {...vul(r.fractie * 100, r.kleur)} />}
                {metGroep && g && (
                  <>
                    {g.lijn && <b className="mm-teaser-lijn" style={{ left: `${g.lijn.van * 100}%`, width: `${(g.lijn.tot - g.lijn.van) * 100}%` }} />}
                    <b className="mm-teaser-stip" style={{ left: `${g.fractie * 100}%`, background: g.kleur }} />
                  </>
                )}
              </span>
              {metJij && <span className="mm-paneel-waarde mm-paneel-waarde--jij">{quick ? r.waarde.split(" · ").pop() : r.waarde}</span>}
              {metGroep && <span className="mm-paneel-waarde">{g?.waarde ?? ""}</span>}
            </div>
          );
        })}
        <div className="mm-paneel-rij mm-paneel-ankers" aria-hidden="true">
          <span />
          <span className="mm-paneel-anker-spoor">
            <span>{quick ? "0" : "1"}</span>
            <span>{quick ? "100%" : "5"}</span>
          </span>
          {metJij && <span />}
          {metGroep && <span />}
        </div>
        {metJij && metGroep && (
          <p className="mm-legenda">
            <span><i className="mm-legenda-balk" /> Jouw score</span>
            <span><i className="mm-legenda-stip" /> Gemiddelde van de groep</span>
            <span><i className="mm-legenda-lijn" /> Laagste tot hoogste score</span>
          </p>
        )}
        {metJij && groepWacht && (
          <p className="mm-sub mm-wacht-regel">
            Resultaten van de groep volgen bij minstens {groepWacht.minimum} afgeronde scans ({groepWacht.afgerond} van {groepWacht.minimum})
          </p>
        )}
      </div>

      {respons && (
        <div className="mm-paneel-respons">
          <div className="mm-voortgang-rij">
            <span className="mm-tekst">
              {respons.afgerond} van {respons.uitgenodigd} respondenten afgerond
            </span>
            {respons.compleet ? (
              <span className="mm-respons-rechts">
                {respons.laatsteDatum && <span className="mm-tekst mm-sub-14">{respons.laatsteDatum}</span>}
                <span className="mm-chip mm-chip--groen">
                  <i aria-hidden="true" />
                  Compleet
                </span>
              </span>
            ) : (
              <span className="mm-sub-14">
                {respons.laatsteDatum ? `Bijgewerkt ${respons.laatsteDatum} · ` : ""}
                {respons.percentage}%
              </span>
            )}
          </div>
          <div
            className="mm-respons-balk"
            role="img"
            aria-label={`${respons.afgerond} van ${respons.uitgenodigd} respondenten afgerond`}
          >
            <div style={{ width: `${respons.uitgenodigd === 0 ? 0 : (respons.afgerond / respons.uitgenodigd) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

/** De vulling van een balk: Hele pixels, minstens 4px boven nul (`stylesheet.md`, Balklijst). */
function vul(percentage: number, kleur?: string): { className: string; style: React.CSSProperties } {
  const b = balkVul(percentage);
  return { className: b.className, style: { ...(b.style as React.CSSProperties), ...(kleur ? { background: kleur } : {}) } };
}

