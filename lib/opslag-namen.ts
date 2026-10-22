/**
 * De namen van opgeslagen velden (`datamodel.md`): Sinds 22 oktober 2026 heten de bouwblokken bouwstenen, ook in het datamodel. In de code
 * heten de typen en eigenschappen nog `Bouwblok`, `bouwblokken`, `bouwblokLabel` enzovoort. De opslag (localStorage en de serverkopie in Neon)
 * gebruikt de namen van het datamodel; deze functies vertalen op de grens: `stringifyOpslag` schrijft de nieuwe namen, `parseOpslag` leest de
 * nieuwe én de oude namen (data van vóór de hernoeming blijft dus gewoon laden en wordt bij de volgende schrijfactie omgezet). Waarden worden
 * niet aangeraakt, alleen de sleutels van objecten.
 */

/** De naam in de code naar de naam in de opslag. */
export const OPSLAG_NAMEN: Readonly<Record<string, string>> = {
  bouwblokken: "bouwstenen",
  bouwblokLabel: "bouwsteenLabel",
  bouwblokEenheidEnkelvoud: "bouwsteenEenheidEnkelvoud",
  bouwblokEenheidMeervoud: "bouwsteenEenheidMeervoud",
  bouwblokIds: "bouwsteenIds",
  opmerkingenPerBouwblok: "opmerkingenPerBouwsteen",
};

const OMGEKEERD: Readonly<Record<string, string>> = Object.fromEntries(Object.entries(OPSLAG_NAMEN).map(([code, opslag]) => [opslag, code]));

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** JSON voor de opslag, met de namen van het datamodel. */
export function stringifyOpslag(waarde: unknown): string {
  return JSON.stringify(waarde, (_sleutel, v) => {
    if (!isObject(v)) return v;
    let hernoemen = false;
    for (const k in v) {
      if (k in OPSLAG_NAMEN) {
        hernoemen = true;
        break;
      }
    }
    if (!hernoemen) return v;
    const uit: Record<string, unknown> = {};
    for (const [k, w] of Object.entries(v)) uit[OPSLAG_NAMEN[k] ?? k] = w;
    return uit;
  });
}

/** JSON uit de opslag, met de namen van de code. Leest ook data met de oude namen. */
export function parseOpslag<T = unknown>(tekst: string): T {
  return JSON.parse(tekst, function (this: Record<string, unknown>, sleutel: string, v: unknown) {
    const code = OMGEKEERD[sleutel];
    if (code !== undefined && isObject(this)) {
      this[code] = v;
      return undefined;
    }
    return v;
  }) as T;
}
