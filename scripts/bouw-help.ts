// Bouwt de Help (`help.md`, Inhoud): Leest de Markdown-bestanden in `help/` en de SVG's in `help/afbeeldingen/`, controleert ze
// (`lib/help-bron.ts`, `controleerHelp`) en schrijft `data/help-onderwerpen.ts`. Draait vanzelf voor `npm run dev` en `npm run build`
// en handmatig met `npm run help`. Fouten laten het bouwen mislukken, waarschuwingen niet.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { controleerHelp, leesOnderwerp, type HelpOnderwerp } from "../lib/help-bron.ts";

const WORTEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const UITVOER = join(WORTEL, "data", "help-onderwerpen.ts");

function bronDatum(naam: string): string | null {
  try {
    const d = execFileSync("git", ["log", "-1", "--format=%cs", "--", naam], { cwd: WORTEL, encoding: "utf8" }).trim();
    return d || null;
  } catch {
    return null;
  }
}

/** Leest en controleert alle onderwerpen. Los van het schrijven, zodat de test hem kan gebruiken. */
export function leesHelpMap(wortel = WORTEL, metBronDatum = false): { onderwerpen: HelpOnderwerp[]; fouten: string[]; waarschuwingen: string[] } {
  const map = join(wortel, "help");
  const fouten: string[] = [];
  const onderwerpen: HelpOnderwerp[] = [];
  const bestanden = existsSync(map) ? readdirSync(map).filter((f) => f.endsWith(".md")).sort() : [];
  for (const bestand of bestanden) {
    const slug = bestand.replace(/\.md$/, "");
    if (!/^[a-z0-9-]+$/.test(slug)) {
      fouten.push(`help/${bestand}: De naam is kort en in kleine letters, zonder spaties.`);
      continue;
    }
    const { onderwerp, fouten: f } = leesOnderwerp(slug, readFileSync(join(map, bestand), "utf8"));
    fouten.push(...f);
    if (!onderwerp) continue;
    if (onderwerp.afbeelding) {
      const pad = join(map, "afbeeldingen", onderwerp.afbeelding);
      onderwerp.svg = existsSync(pad) ? readFileSync(pad, "utf8").trim() : null;
    }
    onderwerpen.push(onderwerp);
  }
  const controle = controleerHelp(onderwerpen, {
    bronBestaat: (naam) => existsSync(join(wortel, naam)),
    bronDatum: metBronDatum ? bronDatum : undefined,
  });
  onderwerpen.sort((a, b) => a.groep.localeCompare(b.groep) || a.volgorde - b.volgorde || a.slug.localeCompare(b.slug));
  return { onderwerpen, fouten: [...fouten, ...controle.fouten], waarschuwingen: controle.waarschuwingen };
}

/** De inhoud van `data/help-onderwerpen.ts`. */
export function bouwBestand(onderwerpen: HelpOnderwerp[]): string {
  return `// Gegenereerd door \`npm run help\` (scripts/bouw-help.ts) uit help/*.md. Niet met de hand aanpassen.
import type { HelpOnderwerp } from "@/lib/help-bron";

export const HELP_ONDERWERPEN: HelpOnderwerp[] = ${JSON.stringify(onderwerpen, null, 2)};
`;
}

function main() {
  const { onderwerpen, fouten, waarschuwingen } = leesHelpMap(WORTEL, true);
  for (const w of waarschuwingen) console.warn(`Waarschuwing: ${w}`);
  if (fouten.length) {
    for (const f of fouten) console.error(`Fout: ${f}`);
    process.exit(1);
  }
  writeFileSync(UITVOER, bouwBestand(onderwerpen));
  console.log(`Help gebouwd: ${onderwerpen.length} onderwerpen.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
