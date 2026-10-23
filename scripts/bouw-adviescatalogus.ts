// Bouwt de beginwaarde van de Adviescatalogus (`adviesverloop.md`, `content-adviesverloop.md`): Leest `content-adviesverloop.md` en schrijft
// `data/advies-catalogus.ts`. Handmatig met `npm run adviescatalogus`, na elke wijziging van het contentbestand. De structuur volgt
// `datamodel.md`, Adviesverloop. Alle use cases tellen mee in de fasestrook (`inStrook`): Een Admin past dat per use case aan.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WORTEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRON = join(WORTEL, "content-adviesverloop.md");
const UITVOER = join(WORTEL, "data", "advies-catalogus.ts");

const APP_CODES: Record<string, string> = {
  "Copilot (app)": "copilot",
  Word: "word",
  Excel: "excel",
  PowerPoint: "ppt",
  Outlook: "outlook",
  Teams: "teams",
  OneNote: "onenote",
  "Copilot Studio": "studio",
};
const ROL_IDS: Record<string, string> = { Consultant: "consultant", Salesmanager: "salesmanager", "Teamleider (interim)": "teamleider" };

interface Prompt {
  rolId: string;
  context: string;
  prompt: string;
}

/** Het veld `- **Naam**: tekst` uit een stuk regels, met doorlopende regels erbij tot het volgende veld of een lege regel. */
function veld(regels: string[], naam: string): string {
  const begin = regels.findIndex((r) => r.startsWith(`- **${naam}**:`));
  if (begin === -1) return "";
  const delen = [regels[begin].replace(`- **${naam}**:`, "").trim()];
  for (let i = begin + 1; i < regels.length; i++) {
    if (regels[i].trim() === "" || regels[i].startsWith("- **") || regels[i].startsWith("#")) break;
    delen.push(regels[i].trim());
  }
  return delen.join("\n").trim();
}

const tekst = readFileSync(BRON, "utf8").split("\n");

// Rollen: "### Consultant" tot en met de persona-tekst, binnen "## Rollen".
const rollen: { id: string; naam: string; standaardTekst: string; volgorde: number }[] = [];
{
  const van = tekst.findIndex((r) => r === "## Rollen");
  const tot = tekst.findIndex((r, i) => i > van && r.startsWith("## "));
  const stuk = tekst.slice(van + 1, tot);
  const koppen = stuk.map((r, i) => (r.startsWith("### ") ? i : -1)).filter((i) => i >= 0);
  koppen.forEach((k, n) => {
    const naam = stuk[k].replace("### ", "").trim();
    const eind = koppen[n + 1] ?? stuk.length;
    const body = stuk.slice(k + 1, eind);
    const p = body.findIndex((r) => r.startsWith("**Persona-tekst**"));
    const persona = body.slice(p + 1).join("\n").trim();
    rollen.push({ id: ROL_IDS[naam] ?? naam.toLowerCase(), naam, standaardTekst: persona, volgorde: n + 1 });
  });
}

// Fasen en use cases.
const fasen: { id: string; volgorde: number; naam: string; korteNaam: string; omschrijving: string }[] = [];
const useCases: {
  id: string;
  faseId: string;
  titel: string;
  omschrijving: string;
  apps: string[];
  inStrook: boolean;
  volgorde: number;
  bouwsteenIds: string[];
  klassen: string[];
  prompts: Prompt[];
}[] = [];
{
  const van = tekst.findIndex((r) => r === "## Fasen en use cases");
  const tot = tekst.findIndex((r, i) => i > van && r.startsWith("## "));
  const stuk = tekst.slice(van + 1, tot === -1 ? tekst.length : tot);
  let faseId = "";
  let ucStart = -1;
  const blokken: { faseId: string; regels: string[] }[] = [];
  for (let i = 0; i < stuk.length; i++) {
    const r = stuk[i];
    const f = r.match(/^### Fase (\d+): (.+)$/);
    if (f) {
      faseId = f[1];
      const einde = stuk.findIndex((x, j) => j > i && /^#{3,4} /.test(x));
      const body = stuk.slice(i + 1, einde === -1 ? stuk.length : einde);
      fasen.push({ id: faseId, volgorde: Number(f[1]), naam: f[2].trim(), korteNaam: veld(body, "Korte naam"), omschrijving: veld(body, "Omschrijving") });
    }
    if (/^#### /.test(r)) {
      if (ucStart >= 0) blokken[blokken.length - 1].regels = stuk.slice(ucStart, i);
      ucStart = i;
      blokken.push({ faseId, regels: [] });
    }
  }
  if (ucStart >= 0) blokken[blokken.length - 1].regels = stuk.slice(ucStart);
  const perFase = new Map<string, number>();
  for (const b of blokken) {
    const kop = b.regels[0].match(/^#### (\S+) (.+)$/)!;
    const rolKoppen = b.regels.map((r, i) => (r.startsWith("##### Rol ") ? i : -1)).filter((i) => i >= 0);
    const kern = b.regels.slice(1, rolKoppen[0] ?? b.regels.length);
    const prompts: Prompt[] = rolKoppen.map((k, n) => {
      const body = b.regels.slice(k + 1, rolKoppen[n + 1] ?? b.regels.length);
      const naam = b.regels[k].replace("##### Rol ", "").trim();
      return { rolId: ROL_IDS[naam] ?? naam.toLowerCase(), context: veld(body, "Context"), prompt: veld(body, "Prompt") };
    });
    const volgorde = (perFase.get(b.faseId) ?? 0) + 1;
    perFase.set(b.faseId, volgorde);
    useCases.push({
      id: kop[1],
      faseId: b.faseId,
      titel: kop[2].trim(),
      omschrijving: veld(kern, "Omschrijving"),
      apps: veld(kern, "Apps")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
        .map((a) => APP_CODES[a] ?? a.toLowerCase()),
      inStrook: prompts.length > 0,
      volgorde,
      bouwsteenIds: [],
      klassen: [],
      prompts,
    });
  }
}

const fouten: string[] = [];
if (fasen.length !== 6) fouten.push(`Er zijn ${fasen.length} fasen gevonden in plaats van 6.`);
if (rollen.length !== 3) fouten.push(`Er zijn ${rollen.length} rollen gevonden in plaats van 3.`);
for (const u of useCases) {
  if (!u.titel || !u.omschrijving) fouten.push(`Use case ${u.id} mist een titel of omschrijving.`);
  for (const a of u.apps) if (!Object.values(APP_CODES).includes(a)) fouten.push(`Use case ${u.id}: onbekende app "${a}".`);
  for (const p of u.prompts) if (!p.prompt) fouten.push(`Use case ${u.id}: een prompt is leeg (${p.rolId}).`);
}
if (fouten.length > 0) {
  console.error(fouten.join("\n"));
  process.exit(1);
}

const uitvoer = `/**
 * De beginwaarde van de Adviescatalogus (\`adviesverloop.md\`, \`beheerpagina.md\`, punt 17): Gegenereerd uit \`content-adviesverloop.md\` met
 * \`npm run adviescatalogus\`. Niet met de hand bewerken: Wijzig het contentbestand en draai het script opnieuw. De catalogus in de app
 * (\`lib/advies-catalogus-store.ts\`) begint met deze waarden en wordt daarna door een Admin beheerd.
 */
import type { AdviesCatalogus } from "@/lib/types";

export const ADVIES_CATALOGUS_BEGIN: AdviesCatalogus = ${JSON.stringify({ fasen, rollen, useCases }, null, 2)};
`;
writeFileSync(UITVOER, uitvoer);
console.log(`Adviescatalogus gebouwd: ${fasen.length} fasen, ${rollen.length} rollen, ${useCases.length} use cases.`);
