/**
 * De bron van de Help (`help.md`): Kopgegevens lezen, een artikel in secties splitsen en de controle die bij het bouwen draait
 * (`scripts/bouw-help.ts`). Zonder bestandstoegang, zodat dezelfde functies in het script, in de app en in de tests werken.
 */

export type HelpRol = "Respondent" | "Lead" | "Consultant" | "Admin";
export const HELP_ROLLEN: HelpRol[] = ["Respondent", "Lead", "Consultant", "Admin"];

/** De onderwerpgroepen met de rollen die ze mogen zien (`help.md`, Rol en inhoud), in de volgorde van de inhoudsopgave. */
export const HELP_GROEPEN: { naam: string; rollen: HelpRol[] }[] = [
  { naam: "Beginnen", rollen: ["Respondent", "Lead", "Consultant", "Admin"] },
  { naam: "Je resultaten", rollen: ["Respondent", "Lead", "Consultant", "Admin"] },
  { naam: "Voor Leads", rollen: ["Lead"] },
  { naam: "Scans en Metingen", rollen: ["Consultant", "Admin"] },
  { naam: "Resultaten voor beheer", rollen: ["Consultant", "Admin"] },
  { naam: "Verkennen en Benchmarks", rollen: ["Admin"] },
  { naam: "Instellingen", rollen: ["Admin"] },
];

/** De toegang die een Lead nodig kan hebben voor een onderwerp (`LeadToegang.weergave`, `beheerpagina.md`, punt 6a). */
export const HELP_TOEGANG = ["resultaten", "spreiding", "antwoorden", "uitnodigen", "exporteren", "benchmark"];

/** De films die bestaan (`help.md`, Films). */
export const HELP_FILMS = ["wat-krijg-ik", "meetperiode", "radar", "dossier"];

export interface HelpOnderwerp {
  /** Bestandsnaam zonder `.md`, ook het deel van de route. */
  slug: string;
  titel: string;
  groep: string;
  volgorde: number;
  rollen: HelpRol[];
  /** Alleen bij Lead: Het onderwerp is er als de Lead minstens één van deze weergaven heeft. Leeg betekent geen voorwaarde. */
  toegang: string[];
  afbeelding: string | null;
  film: string | null;
  bronnen: string[];
  bijgewerkt: string;
  /** De Markdown na de kopgegevens. */
  tekst: string;
  /** De inhoud van de afbeelding (SVG), ingelezen bij het bouwen. */
  svg: string | null;
}

export type HelpBlok = { soort: "alinea"; tekst: string } | { soort: "genummerd"; items: string[] } | { soort: "lijst"; items: string[] };

export interface HelpSectie {
  kop: string;
  blokken: HelpBlok[];
}

export interface HelpArtikel {
  /** De alinea('s) voor de eerste kop: Waar het onderwerp over gaat. */
  intro: HelpBlok[];
  secties: HelpSectie[];
}

/** De vaste koppen, in de volgorde van het bestand (`help.md`, Opbouw van de pagina). */
export const KOP_KORT = "In het kort";
export const KOP_ZIE = "Zie ook";
export const KOP_PRAKTIJK = "Voorbeeld uit de praktijk";
export const KOP_LET_OP = "Let op";
export const KOPPEN_LIJST = ["Wat je ziet", "Wat elke keuze doet"];

export function isAdminOnderwerp(o: Pick<HelpOnderwerp, "rollen">): boolean {
  return o.rollen.length === 1 && o.rollen[0] === "Admin";
}

/** Splitst `---`-kopgegevens van de tekst. Een waarde tussen blokhaken is een lijst, gescheiden door komma's. */
export function leesKopgegevens(inhoud: string): { kop: Record<string, string | string[]>; tekst: string } | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(inhoud);
  if (!m) return null;
  const kop: Record<string, string | string[]> = {};
  for (const regel of m[1].split(/\r?\n/)) {
    if (!regel.trim() || regel.trim().startsWith("#")) continue;
    const i = regel.indexOf(":");
    if (i === -1) continue;
    const sleutel = regel.slice(0, i).trim();
    const waarde = regel.slice(i + 1).trim();
    kop[sleutel] =
      waarde.startsWith("[") && waarde.endsWith("]")
        ? waarde
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : waarde;
  }
  return { kop, tekst: m[2].trim() };
}

/** Splitst Markdown in alinea's, genummerde lijsten en opsommingen. Alleen wat de Help gebruikt. */
function leesBlokken(regels: string[]): HelpBlok[] {
  const blokken: HelpBlok[] = [];
  let alinea: string[] = [];
  let lijst: { soort: "genummerd" | "lijst"; items: string[] } | null = null;
  const sluitAlinea = () => {
    if (alinea.length) blokken.push({ soort: "alinea", tekst: alinea.join(" ") });
    alinea = [];
  };
  const sluitLijst = () => {
    if (lijst) blokken.push(lijst);
    lijst = null;
  };
  for (const regel of regels) {
    const nummer = /^\s*(\d+)\.\s+(.*)$/.exec(regel);
    const punt = /^\s*[-*]\s+(.*)$/.exec(regel);
    if (nummer || punt) {
      sluitAlinea();
      const soort = nummer ? "genummerd" : "lijst";
      if (lijst && lijst.soort !== soort) sluitLijst();
      if (!lijst) lijst = { soort, items: [] };
      lijst.items.push((nummer ? nummer[2] : punt![1]).trim());
    } else if (!regel.trim()) {
      sluitAlinea();
      sluitLijst();
    } else if (lijst && /^\s+\S/.test(regel)) {
      lijst.items[lijst.items.length - 1] += ` ${regel.trim()}`;
    } else {
      sluitLijst();
      alinea.push(regel.trim());
    }
  }
  sluitAlinea();
  sluitLijst();
  return blokken;
}

/** Het artikel: De intro voor de eerste `##`-kop en daarna een sectie per kop. */
export function leesArtikel(tekst: string): HelpArtikel {
  const regels = tekst.split(/\r?\n/);
  const intro: string[] = [];
  const secties: { kop: string; regels: string[] }[] = [];
  for (const regel of regels) {
    const kop = /^##\s+(.*)$/.exec(regel);
    if (kop) secties.push({ kop: kop[1].trim(), regels: [] });
    else if (secties.length) secties[secties.length - 1].regels.push(regel);
    else intro.push(regel);
  }
  return { intro: leesBlokken(intro), secties: secties.map((s) => ({ kop: s.kop, blokken: leesBlokken(s.regels) })) };
}

/** Inline-opmaak: `**vet**` en `[tekst](slug)` voor een verwijzing naar een ander onderwerp. */
export type HelpInline = { soort: "tekst"; tekst: string } | { soort: "vet"; tekst: string } | { soort: "verwijzing"; tekst: string; slug: string };

export function leesInline(tekst: string): HelpInline[] {
  const delen: HelpInline[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([a-z0-9-]+)\)/g;
  let laatste = 0;
  for (const m of tekst.matchAll(re)) {
    if (m.index > laatste) delen.push({ soort: "tekst", tekst: tekst.slice(laatste, m.index) });
    if (m[1] !== undefined) delen.push({ soort: "vet", tekst: m[1] });
    else delen.push({ soort: "verwijzing", tekst: m[2], slug: m[3] });
    laatste = m.index + m[0].length;
  }
  if (laatste < tekst.length) delen.push({ soort: "tekst", tekst: tekst.slice(laatste) });
  return delen;
}

/** De tekst zonder opmaak, voor het zoeken. */
export function platteTekst(tekst: string): string {
  return leesInline(tekst)
    .map((d) => d.tekst)
    .join("");
}

const alsLijst = (w: string | string[] | undefined): string[] => (Array.isArray(w) ? w : w ? [w] : []);

/** Een bestand lezen tot een onderwerp. `fouten` is leeg als alle kopgegevens kloppen. */
export function leesOnderwerp(slug: string, inhoud: string): { onderwerp: HelpOnderwerp | null; fouten: string[] } {
  const bestand = `help/${slug}.md`;
  const gelezen = leesKopgegevens(inhoud);
  if (!gelezen) return { onderwerp: null, fouten: [`${bestand}: De kopgegevens (tussen ---) ontbreken.`] };
  const { kop, tekst } = gelezen;
  const fouten: string[] = [];
  const tekstveld = (k: string): string => {
    const w = kop[k];
    if (typeof w !== "string" || !w) {
      fouten.push(`${bestand}: Kopgegeven "${k}" ontbreekt.`);
      return "";
    }
    return w;
  };
  const titel = tekstveld("titel");
  const groep = tekstveld("groep");
  const volgordeTekst = tekstveld("volgorde");
  const bijgewerkt = tekstveld("bijgewerkt");
  const rollen = alsLijst(kop.rollen) as HelpRol[];
  if (!rollen.length) fouten.push(`${bestand}: Kopgegeven "rollen" ontbreekt.`);
  for (const r of rollen) if (!HELP_ROLLEN.includes(r)) fouten.push(`${bestand}: Onbekende rol "${r}".`);
  const volgorde = Number(volgordeTekst);
  if (volgordeTekst && !Number.isFinite(volgorde)) fouten.push(`${bestand}: "volgorde" is geen getal.`);
  if (bijgewerkt && !/^\d{4}-\d{2}-\d{2}$/.test(bijgewerkt)) fouten.push(`${bestand}: "bijgewerkt" is geen datum (jjjj-mm-dd).`);
  const afbeelding = typeof kop.afbeelding === "string" && kop.afbeelding ? kop.afbeelding : null;
  const film = typeof kop.film === "string" && kop.film ? kop.film : null;
  return {
    onderwerp: {
      slug,
      titel,
      groep,
      volgorde,
      rollen,
      toegang: alsLijst(kop.toegang),
      afbeelding,
      film,
      bronnen: alsLijst(kop.bronnen),
      bijgewerkt,
      tekst,
      svg: null,
    },
    fouten,
  };
}

export interface HelpControleContext {
  /** Bestaat de spec in de repo? */
  bronBestaat: (naam: string) => boolean;
  /** De datum (jjjj-mm-dd) van de laatste wijziging van een spec, of `null` als die niet bekend is. */
  bronDatum?: (naam: string) => string | null;
}

/**
 * De controle bij het bouwen (`help.md`, Inhoud): Kopgegevens, bronnen, afbeelding, koppen in de vaste volgorde, nummers die in
 * de afbeelding terugkomen en verwijzingen die elke rol van het onderwerp mag volgen. Fouten laten het bouwen mislukken,
 * waarschuwingen niet (`help.md`, Actueel houden).
 */
export function controleerHelp(onderwerpen: HelpOnderwerp[], ctx: HelpControleContext): { fouten: string[]; waarschuwingen: string[] } {
  const fouten: string[] = [];
  const waarschuwingen: string[] = [];
  const perSlug = new Map<string, HelpOnderwerp>();
  for (const o of onderwerpen) {
    if (perSlug.has(o.slug)) fouten.push(`help/${o.slug}.md: De naam komt twee keer voor.`);
    perSlug.set(o.slug, o);
  }
  for (const o of onderwerpen) {
    const bestand = `help/${o.slug}.md`;
    const groep = HELP_GROEPEN.find((g) => g.naam === o.groep);
    if (!groep) fouten.push(`${bestand}: Onbekende groep "${o.groep}".`);
    else
      for (const r of o.rollen)
        if (!groep.rollen.includes(r)) fouten.push(`${bestand}: De rol ${r} mag de groep "${o.groep}" niet zien.`);
    if (o.toegang.length && !o.rollen.includes("Lead")) fouten.push(`${bestand}: "toegang" hoort alleen bij de rol Lead.`);
    for (const t of o.toegang) if (!HELP_TOEGANG.includes(t)) fouten.push(`${bestand}: Onbekende toegang "${t}".`);
    for (const f of (o.film ?? "").split(",").map((x) => x.trim()).filter(Boolean))
      if (!HELP_FILMS.includes(f)) fouten.push(`${bestand}: Onbekende film "${f}".`);
    if (!o.bronnen.length) fouten.push(`${bestand}: Kopgegeven "bronnen" ontbreekt.`);
    for (const b of o.bronnen) {
      if (!ctx.bronBestaat(b)) fouten.push(`${bestand}: De bron ${b} bestaat niet.`);
      else {
        const datum = ctx.bronDatum?.(b);
        if (datum && o.bijgewerkt && datum > o.bijgewerkt)
          waarschuwingen.push(`${bestand}: De bron ${b} is nieuwer (${datum}) dan "bijgewerkt" (${o.bijgewerkt}).`);
      }
    }
    if (o.afbeelding && o.svg === null) fouten.push(`${bestand}: De afbeelding ${o.afbeelding} ontbreekt in help/afbeeldingen/.`);

    const artikel = leesArtikel(o.tekst);
    const koppen = artikel.secties.map((s) => s.kop);
    if (!artikel.intro.some((b) => b.soort === "alinea")) fouten.push(`${bestand}: Na de kopgegevens ontbreekt de alinea over waar het onderwerp over gaat.`);
    const vast = [KOP_KORT, "lijst", KOP_PRAKTIJK, KOP_LET_OP, KOP_ZIE];
    const volgorde = koppen.map((k) => (KOPPEN_LIJST.includes(k) ? "lijst" : k));
    let vorige = -1;
    for (const k of volgorde) {
      const i = vast.indexOf(k);
      if (i === -1) fouten.push(`${bestand}: Onbekende kop "${k}".`);
      else if (i <= vorige) fouten.push(`${bestand}: De kop "${k}" staat niet in de vaste volgorde.`);
      else vorige = i;
    }
    for (const verplicht of [KOP_KORT, "lijst", KOP_ZIE]) {
      if (!volgorde.includes(verplicht)) fouten.push(`${bestand}: De kop "${verplicht === "lijst" ? KOPPEN_LIJST.join(" of ") : verplicht}" ontbreekt.`);
    }

    const lijst = artikel.secties.find((s) => KOPPEN_LIJST.includes(s.kop));
    const genummerd = lijst?.blokken.find((b) => b.soort === "genummerd");
    if (lijst && !genummerd) fouten.push(`${bestand}: Onder "${lijst.kop}" staat geen genummerde lijst.`);
    if (genummerd?.soort === "genummerd" && o.svg) {
      for (let n = 1; n <= genummerd.items.length; n++)
        if (!new RegExp(`data-nr="${n}"`).test(o.svg)) fouten.push(`${bestand}: Nummer ${n} staat niet als markering in de afbeelding.`);
    }

    const zie = artikel.secties.find((s) => s.kop === KOP_ZIE);
    const verwijzingen = zie?.blokken.flatMap((b) => (b.soort === "lijst" ? b.items : [])).flatMap((i) => leesInline(i).filter((d) => d.soort === "verwijzing")) ?? [];
    if (zie && (verwijzingen.length < 1 || verwijzingen.length > 3)) fouten.push(`${bestand}: "${KOP_ZIE}" heeft ${verwijzingen.length} verwijzingen, dat moeten er een tot drie zijn.`);
    for (const v of artikel.secties.flatMap((s) => s.blokken).concat(artikel.intro)) {
      const items = v.soort === "alinea" ? [v.tekst] : v.items;
      for (const tekst of items)
        for (const d of leesInline(tekst)) {
          if (d.soort !== "verwijzing") continue;
          const doel = perSlug.get(d.slug);
          if (!doel) {
            fouten.push(`${bestand}: De verwijzing naar "${d.slug}" wijst naar een onderwerp dat niet bestaat.`);
            continue;
          }
          const mist = o.rollen.filter((r) => !doel.rollen.includes(r));
          if (mist.length) fouten.push(`${bestand}: De verwijzing naar "${d.slug}" is niet te volgen voor de rol ${mist.join(" en ")}.`);
        }
    }
  }
  return { fouten, waarschuwingen };
}
