import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Controle op de Balklijst (`stylesheet.md`, Balklijst): In elke lijst met balken hebben het label en de waarde een vaste breedte
 * en neemt alleen het spoor de rest. Een balk heeft een vaste, even hoogte en elke afronding is hoogstens de halve hoogte. Een
 * echte meting van de breedte en hoogte in de browser kan in een test zonder browser niet, dus deze test leest de opmaak.
 */
const MAP = join(process.cwd(), "app", "styles");
const css = readdirSync(MAP)
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(join(MAP, f), "utf8"))
  .join("\n");

/** Het eerste blok van een selector dat niet in een media- of containerregel staat: `selector { ... }` op het hoogste niveau. */
function regel(selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(`(?:^|\\n)${esc}\\s*\\{([^}]*)\\}`).exec(css);
  if (!m) throw new Error(`Geen regel voor ${selector}`);
  return m[1];
}

function waarde(blok: string, eigenschap: string): string | null {
  const m = new RegExp(`(?:^|[;\\s])${eigenschap}\\s*:\\s*([^;]+);`).exec(blok);
  return m ? m[1].trim() : null;
}

/** Splitst een lijst met kolommen op spaties buiten haakjes. */
function kolommen(tekst: string): string[] {
  const uit: string[] = [];
  let diepte = 0;
  let huidig = "";
  for (const c of tekst) {
    if (c === "(") diepte++;
    if (c === ")") diepte--;
    if (c === " " && diepte === 0) {
      if (huidig) uit.push(huidig);
      huidig = "";
    } else huidig += c;
  }
  if (huidig) uit.push(huidig);
  return uit;
}

const VAST = /^(\d+px|var\(--[a-z-]+(, ?\d+px)?\))$/;
const RUIMTE = /^(1fr|minmax\(0, ?1fr\))$/;

describe("Balklijst: kolommen met een vaste breedte", () => {
  const lijsten = [".mm-teaser-rij", ".vis-rij", ".qv-rij", ".qv-lijst-rij", ".qv-vraag-rij", ".qv-bandnamen"];
  for (const selector of lijsten) {
    it(`${selector} heeft vaste kolommen en één spoor dat de rest neemt`, () => {
      const kol = kolommen(waarde(regel(selector), "grid-template-columns") ?? "");
      expect(kol.length).toBeGreaterThanOrEqual(3);
      const ruimte = kol.filter((k) => RUIMTE.test(k));
      expect(ruimte).toHaveLength(1);
      for (const k of kol) expect(VAST.test(k) || RUIMTE.test(k), `kolom ${k}`).toBe(true);
    });
  }

  it("een kolom neemt nooit de breedte van de inhoud aan", () => {
    for (const selector of lijsten) {
      const w = waarde(regel(selector), "grid-template-columns") ?? "";
      expect(w).not.toMatch(/auto|max-content|min-content|fit-content/);
    }
  });
});

describe("Balklijst: hoogte en afronding", () => {
  const token = (naam: string) => Number(/(\d+)px/.exec(waarde(regel(":root"), naam) ?? "")?.[1]);

  it("de hoogtes zijn even pixels: 8, 12 en 16", () => {
    expect([token("--balk-h-s"), token("--balk-h-m"), token("--balk-h-l")]).toEqual([8, 12, 16]);
  });

  it("de afronding is 4px en nooit meer dan de halve hoogte", () => {
    expect(token("--balk-r")).toBe(4);
    expect(token("--balk-r")).toBeLessThanOrEqual(token("--balk-h-s") / 2);
  });

  it("de sporen en balken hebben een vaste hoogte per lijst", () => {
    expect(waarde(regel(".mm-balk"), "height")).toBe("8px");
    expect(waarde(regel(".mm-teaser-balk"), "height")).toBe("8px");
    expect(waarde(regel(".qv-balk"), "height")).toBe("var(--balk-h-m)");
    expect(waarde(regel(".qv-stapel"), "height")).toBe("var(--balk-h-l)");
    for (const selector of [".vis-spoor", ".qv-spoor"]) {
      const px = Number(/^(\d+)px$/.exec(waarde(regel(selector), "height") ?? "")?.[1]);
      expect(px % 2, selector).toBe(0);
    }
  });

  it("een vulling is hele pixels met minstens 4px boven nul", () => {
    expect(regel(".balk-vul")).toMatch(/max\(4px, round\(var\(--p, 0%\), 1px\)\)/);
  });
});
