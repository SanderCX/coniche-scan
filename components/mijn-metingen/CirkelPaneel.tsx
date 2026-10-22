"use client";

import { balkVul } from "@/lib/format";
import { ScoreRing, ringVanTeaser } from "@/components/ScoreRing";
import { Respons, Teaser, langeDatum } from "@/lib/mijn-metingen";
import { dagVan } from "@/lib/metingen";

/**
 * De Kaart met cirkel (`visualisatie-mijn-metingen.md`, Kaart met cirkel, voorstel van 19 oktober 2026): Een paneel met links een
 * zijblok (de cirkel met de totaalscore, de klassenchip en bij een Lead de groep) en rechts een rij per categorie of afdeling met Jij en
 * Groep op één spoor. Eén paneel voor een Respondent, een Lead en een Lead die ook invult, voor elk Assessment met categorieën,
 * afdelingen of domeinen (de AI-scan, besloten door Joost op 22 oktober 2026). De groep staat er alleen bij een Lead met Resultaten en genoeg afgeronde scans.
 */

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
    <div className={`mm-paneel ${quick ? "mm-paneel--quick" : ""} ${hoofd.rijenLabel ? "mm-paneel--spanning" : ""}`}>
      <div className="mm-zij">
        <ScoreRing
          ring={ringVanTeaser(hoofd)}
          stipFractie={metJij && groep ? groep.ring.fractie : undefined}
          alt={hoofd.ringAlt ?? `Totaalscore ${hoofd.getal}${klasse ? `, ${klasse}` : ""}`}
          label={hoofd.ringLabel}
        />
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
          <span className="mm-label-klein">{hoofd.rijenLabel ?? (quick ? "Per afdeling" : "Per categorie")}</span>
          <span />
          {metJij && <span className="mm-kolomkop">Jij</span>}
          {metGroep && <span className="mm-kolomkop">Groep</span>}
        </div>
        {hoofd.rijen.map((r) => {
          const g = groepRij.get(r.sleutel);
          const jijLeeg = r.nietBeantwoord === true;
          const groepLeeg = !g || g.nietBeantwoord === true;
          const alt = [r.alt, metJij && g && !g.nietBeantwoord ? `groep ${g.waarde}` : ""].filter(Boolean).join(", ");
          const titel = jijLeeg ? "Niet beantwoord" : quick && metJij ? r.waarde : undefined;
          return (
            <div key={r.sleutel} className="mm-paneel-rij" role="img" aria-label={alt} title={titel}>
              <span className={`mm-paneel-naam ${jijLeeg && metJij ? "mm-paneel-naam--leeg" : ""}`} title={r.naam}>
                {r.nummer && (
                  <span className="sp-nr sp-nr--rij" style={{ background: r.nummer.achtergrond, color: r.nummer.tekst }}>
                    {r.nummer.nr}
                  </span>
                )}
                <span className="mm-paneel-naamtekst">{r.naam}</span>
              </span>
              <span className="mm-paneel-spoor" aria-hidden="true">
                {metJij && !jijLeeg && <i {...vul(r.fractie * 100, r.kleur)} />}
                {metGroep && !groepLeeg && g && (
                  <>
                    {/* Met een Jij: Een stip op het gemiddelde. Zonder Jij: Een balk tot het gemiddelde, want een stip op een leeg spoor valt weg. */}
                    {!metJij && <i {...vul(g.fractie * 100, g.kleur)} />}
                    {g.lijn && (metJij || (groep?.aantalScans ?? 0) > 1) && (
                      <>
                        <b className="mm-teaser-lijn" style={{ left: `${g.lijn.van * 100}%`, width: `${(g.lijn.tot - g.lijn.van) * 100}%` }} />
                        {!metJij && (
                          <>
                            <b className="mm-teaser-eind" style={{ left: `${g.lijn.van * 100}%` }} />
                            <b className="mm-teaser-eind" style={{ left: `${g.lijn.tot * 100}%` }} />
                          </>
                        )}
                      </>
                    )}
                    {metJij && <b className="mm-teaser-stip" style={{ left: `${g.fractie * 100}%`, background: g.kleur }} />}
                  </>
                )}
              </span>
              {metJij && (
                <span className={`mm-paneel-waarde ${jijLeeg ? "mm-paneel-waarde--leeg" : "mm-paneel-waarde--jij"}`}>
                  {jijLeeg ? "–" : quick ? r.waarde.split(" · ").pop() : r.waarde}
                </span>
              )}
              {metGroep && <span className="mm-paneel-waarde">{groepLeeg ? "–" : g.waarde}</span>}
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
        {metGroep && (
          <p className="mm-legenda">
            {metJij ? (
              <>
                <span><i className="mm-legenda-balk" /> Jouw score</span>
                <span><i className="mm-legenda-stip" /> Gemiddelde van de groep</span>
                <span><i className="mm-legenda-lijn" /> Laagste tot hoogste score</span>
              </>
            ) : (
              <>
                <span><i className="mm-legenda-balk" /> Gemiddelde van de groep</span>
                {(groep?.aantalScans ?? 0) > 1 && <span><i className="mm-legenda-lijn" /> Laagste tot hoogste score</span>}
              </>
            )}
          </p>
        )}
        {hoofd.spanningsZin && (
          <p className="mm-spanning">
            <strong>Grootste spanning:</strong> {hoofd.spanningsZin}
          </p>
        )}
        {quick && hoofd.rijen.some((r) => r.nietBeantwoord) && (
          <p className="mm-sub mm-wacht-regel">– Niet beantwoord. Het totaal telt alleen de beantwoorde afdelingen.</p>
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

