import { Classificatie } from "@/lib/types";
import { isVlakkeAssessment } from "@/lib/assessment-structuur";
import { Assessment } from "@/lib/types";
import { BouwblokRij, KLASSE_LABEL } from "@/lib/visualisatie";

/**
 * Gedeelde onderdelen van de weergaven A tot en met E (`visualisatie-scores.md`, Gedeelde regels): Schaal van 1 tot 5 met
 * de banden van de classificatie, de rijen in de volgorde van het model met groepslabel en accentrand, de tegels en de
 * getalnotatie. Eén plek, zodat alle weergaven dezelfde schaal en leesrichting hebben.
 */

export const KLASSE_KLEUR: Record<Classificatie, string> = {
  rood: "var(--stat-red)",
  oranje: "var(--stat-amber)",
  groen: "var(--stat-green)",
};

/** Eén decimaal met komma, of een streepje zonder waarde. */
export function toon(n: number | null | undefined, decimalen = 1): string {
  return n === null || n === undefined ? "–" : n.toFixed(decimalen).replace(".", ",");
}

/** Positie op de schaal van 1 tot 5, als percentage van de breedte (`(score − 1) / 4`). */
export function pct(score: number): number {
  return Math.min(100, Math.max(0, ((score - 1) / 4) * 100));
}

export function Tegels({ tegels }: { tegels: { label: string; waarde: string; sub?: string }[] }) {
  return (
    <div className="vis-tegels">
      {tegels.map((t) => (
        <div key={t.label} className="vis-tegel">
          <div className="vis-tegel-label">{t.label}</div>
          <div className="vis-tegel-waarde">{t.waarde}</div>
          {t.sub && <div className="vis-tegel-sub">{t.sub}</div>}
        </div>
      ))}
    </div>
  );
}

/** De drie bandnamen boven de eerste rij. */
export function Schaalkop({ rechts }: { rechts?: string }) {
  return (
    <div className="vis-rij vis-schaalkop" aria-hidden="true">
      <div />
      <div className="vis-banden">
        <span style={{ width: "37.5%" }}>{KLASSE_LABEL.rood}</span>
        <span style={{ width: "25%" }}>{KLASSE_LABEL.oranje}</span>
        <span style={{ width: "37.5%" }}>{KLASSE_LABEL.groen}</span>
      </div>
      <div className="text-xs font-bold text-ink-s">{rechts ?? ""}</div>
    </div>
  );
}

/**
 * Een rij: Naam links met volgnummer en accentrand in de categoriekleur, het spoor in het midden en rechts de waarde. Boven
 * een nieuwe groep staat de categorienaam als klein label, tenzij de Assessment geen categorielaag heeft.
 */
export function Rij({
  rij,
  vorigeGroepId,
  assessment,
  children,
  rechts,
  spoorKlasse,
  leeg,
  bandenAchtergrond = true,
}: {
  rij: BouwblokRij;
  vorigeGroepId: string | null;
  assessment: Assessment;
  children?: React.ReactNode;
  rechts?: React.ReactNode;
  spoorKlasse?: string;
  leeg?: boolean;
  bandenAchtergrond?: boolean;
}) {
  const vlak = isVlakkeAssessment(assessment);
  const nieuweGroep = !vlak && rij.groepNaam && rij.groepId !== vorigeGroepId;
  return (
    <>
      {nieuweGroep && <div className="vis-groep">{rij.groepNaam}</div>}
      <div className="vis-rij">
        <div className="vis-naam" style={{ ["--accent" as string]: rij.groepKleur ?? "var(--or)" }}>
          <span className="vis-nr">{rij.bouwblok.volgnummer}</span>
          <span className="vis-naam-tekst" title={rij.bouwblok.naam}>
            {rij.bouwblok.naam}
          </span>
          {rij.gewicht !== 1 && <span className="vis-factor">{rij.gewicht.toString().replace(".", ",")}×</span>}
        </div>
        <div className={`vis-spoor ${bandenAchtergrond ? "" : "vis-spoor--neutraal"} ${spoorKlasse ?? ""}`}>
          {leeg ? <span className="vis-spoor-leeg">–</span> : children}
        </div>
        <div className="vis-waarde">{rechts}</div>
      </div>
    </>
  );
}

/** Voorgaande groep-id's bij een rijenlijst, voor de groepslabels. */
export function vorigeGroepen(rijen: { rij: BouwblokRij }[]): (string | null)[] {
  return rijen.map((r, i) => (i === 0 ? null : rijen[i - 1].rij.groepId));
}

/**
 * De woorden voor de eenheid van een groep in de weergaven A en B (`visualisatie-scores.md`, I en J): Bij een Meting is dat een
 * afgeronde scan, bij een samengestelde Meting en een vergelijking een onderdeel, bij een benchmark een organisatie.
 */
export interface EenheidTeksten {
  enkelvoud: string;
  meervoud: string;
  /** De eerste tegel bij Spreiding: "Respondenten", "Onderdelen" of "Organisaties". */
  telLabel: string;
  /** De regel onder het aantal in die tegel. */
  telSub: string;
}

export const EENHEID_SCAN: EenheidTeksten = { enkelvoud: "afgeronde scan", meervoud: "afgeronde scans", telLabel: "Respondenten", telSub: "afgeronde scans" };

/** Een onderdeel: "Metingen in deze samenstelling" bij een samengestelde Meting, "onderdelen in deze vergelijking" bij een vergelijking. */
export function eenheidOnderdeel(telSub: string): EenheidTeksten {
  return { enkelvoud: "onderdeel", meervoud: "onderdelen", telLabel: "Onderdelen", telSub };
}

export const EENHEID_ORGANISATIE: EenheidTeksten = { enkelvoud: "organisatie", meervoud: "organisaties", telLabel: "Organisaties", telSub: "in de groep" };
