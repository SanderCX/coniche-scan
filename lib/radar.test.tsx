import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { zorgscan } from "@/data/zorgscan-assessment";
import { aiVolwassenheid } from "@/data/ai-scan-assessment";
import { alleVragen } from "./assessment-structuur";
import { alleBouwblokResultaten, alleGroepResultaten } from "./scoring";
import { DOMEIN_KLEUREN, CATEGORIE_COLORS, domeinKleur, tekstOpKleur } from "./colors";
import { groepSleutel, staatVan } from "./grafiek-actief";
import { RadarChartView } from "@/components/RadarChartView";
import { CategorieStaafdiagram } from "@/components/CategorieStaafdiagram";
import { DomeinKolommen } from "@/components/DomeinKolommen";

const antwoorden = Object.fromEntries(alleVragen(zorgscan).map((v, i) => [v.id, (i % 5) + 1]));
const bouwblokken = alleBouwblokResultaten(zorgscan, antwoorden);
const groepen = alleGroepResultaten(zorgscan, bouwblokken, antwoorden);

const aiAntwoorden = Object.fromEntries(alleVragen(aiVolwassenheid).map((v, i) => [v.id, (i % 4) + 2]));
const aiBouwblokken = alleBouwblokResultaten(aiVolwassenheid, aiAntwoorden);
const aiGroepen = alleGroepResultaten(aiVolwassenheid, aiBouwblokken, aiAntwoorden);

describe("de radar met knooppunten", () => {
  const html = renderToStaticMarkup(<RadarChartView resultaten={bouwblokken} />);
  it("heeft per bouwblok een knooppunt met een aria-label met nummer, naam, score en klasse", () => {
    expect(html.match(/class="radar-knoop /g)).toHaveLength(15);
    expect(html).toMatch(/aria-label="1, Organisatiestrategie, \d,\d, (Basis op Orde|Uitbouwen|Sterk punt)/);
  });
  it("toont de namen alleen in de tooltip en de factor bij een gewogen bouwblok", () => {
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("4 · Leren uit klantcontact 2×");
    expect(html).toContain("<strong>1 · Organisatiestrategie</strong>");
  });
  it("heeft onder de radar geen legenda met categorieën maar een legenda met de lijnen", () => {
    expect(html).not.toContain("radar-categorieen");
    expect(html).toContain("Grenzen 2,5 en 3,5");
    expect(html).not.toContain("Rest van de groep");
  });
  it("zet de taartpunten op 20% dekking", () => {
    expect(html).toMatch(/class="radar-taart"[^>]*fill-opacity="0\.2"/);
  });
  it("toont bij een tweede reeks beide scores met de klasse in de tooltip en de reeks in de legenda", () => {
    const m = renderToStaticMarkup(<RadarChartView resultaten={bouwblokken} vergelijking={bouwblokken} naam="Org" vergelijkingNaam="Groep" />);
    expect(m).toMatch(/Org \d,\d · /);
    expect(m).toMatch(/Groep \d,\d · /);
    expect(m).toContain("stroke-dasharray=\"4 3\"");
    expect(m).toContain(">Groep</li>");
  });
  it("zet de tooltip dichtbij de verticale as boven of onder het knooppunt en verder weg in de hoek van het kwadrant", () => {
    expect(html).toMatch(/radar-tip radar-tip--boven/);
    expect(html).toMatch(/radar-tip radar-tip--onder/);
    expect(html).toMatch(/radar-tip radar-tip--hoek radar-tip--(lt|rt|lb|rb)/);
  });
  it("toont de tooltip en de score-stip alleen van het actieve knooppunt, en dimt de rest", () => {
    const b = bouwblokken[3];
    const m = renderToStaticMarkup(
      <RadarChartView resultaten={bouwblokken} actief={{ groepKey: groepSleutel(b.groepId, b.bouwblok.id), bouwblokId: b.bouwblok.id }} onActief={() => {}} />,
    );
    expect(m.match(/is-zichtbaar/g)).toHaveLength(1);
    expect(m.match(/class="radar-stip"/g)).toHaveLength(1);
    expect(m).toContain("is-actief");
    expect(m).toContain("is-gedimd");
    expect(m).toMatch(/fill-opacity="0\.5"/);
    expect(m).toMatch(/fill-opacity="0\.09"/);
  });
  it("laat bij een hele categorie alle bouwblokken ervan oplichten", () => {
    const b = bouwblokken[3];
    const m = renderToStaticMarkup(<RadarChartView resultaten={bouwblokken} actief={{ groepKey: b.groepId }} onActief={() => {}} />);
    const inGroep = bouwblokken.filter((r) => r.groepId === b.groepId).length;
    expect(m.match(/class="radar-stip"/g)).toHaveLength(inGroep);
  });
});

describe("de actieve staat", () => {
  it("geeft een bouwblok de staat actief, groep, gedimd of normaal", () => {
    expect(staatVan(null, "a", "1")).toBe("normaal");
    expect(staatVan({ groepKey: "a", bouwblokId: "1" }, "a", "1")).toBe("actief");
    expect(staatVan({ groepKey: "a", bouwblokId: "1" }, "a", "2")).toBe("groep");
    expect(staatVan({ groepKey: "a", bouwblokId: "1" }, "b", "3")).toBe("gedimd");
    expect(staatVan({ groepKey: "a" }, "a", "2")).toBe("actief");
  });
  it("gebruikt zonder categorielaag het bouwblok zelf als groep", () => {
    expect(groepSleutel("_vlak", "b7")).toBe("b7");
    expect(groepSleutel("cat1", "b7")).toBe("cat1");
  });
});

describe("het staafdiagram per categorie", () => {
  const html = renderToStaticMarkup(<CategorieStaafdiagram resultaten={groepen} />);
  it("heeft een balk per categorie die met Tab bereikbaar is, met naam, score en klasse in het aria-label", () => {
    expect(html.match(/class="cat-balk"/g)).toHaveLength(groepen.length);
    expect(html).toMatch(/aria-label="Overkoepelend, \d,\d, /);
  });
  it("toont de naam van elke categorie onder zijn balk, zonder zin over de stippellijnen en zonder getal boven de balk", () => {
    expect(html.match(/class="cat-naam"/g)).toHaveLength(groepen.length);
    for (const g of groepen) expect(html).toContain(g.groepNaam.replace("&", "&amp;"));
    expect(html).not.toContain("De stippellijnen bij 2,5 en 3,5");
    expect(html).not.toContain("recharts");
  });
  it("zet de nummers van de bouwblokken bij de categorienaam", () => {
    expect(html).toContain('<span class="cat-nummers">1–2</span>');
    expect(html).toContain('<span class="cat-nummers">15</span>');
    expect(html).toContain('<span class="cat-nummers">7–10</span>');
  });
  it("laat de balk van de actieve categorie oplichten en dimt de andere", () => {
    const m = renderToStaticMarkup(<CategorieStaafdiagram resultaten={groepen} actief={{ groepKey: groepen[1].groepId }} onActief={() => {}} />);
    expect(m.match(/cat-item is-actief/g)).toHaveLength(1);
    expect(m.match(/cat-item is-gedimd/g)).toHaveLength(groepen.length - 1);
  });
});

describe("de domeinkleuren", () => {
  it("heeft acht kleuren in de volgorde van palet B en begint daarna opnieuw", () => {
    expect([...DOMEIN_KLEUREN]).toEqual(["oranje", "blauw", "groen", "paars", "antraciet", "turkoois", "framboos", "lavendel"]);
    expect(CATEGORIE_COLORS.turkoois.hex).toBe("#1f9aa0");
    expect(CATEGORIE_COLORS.framboos.hex).toBe("#d1467f");
    expect(CATEGORIE_COLORS.lavendel.hex).toBe("#8a7bb8");
    expect(domeinKleur(1)).toBe("oranje");
    expect(domeinKleur(8)).toBe("lavendel");
    expect(domeinKleur(9)).toBe("oranje");
  });
  it("zet donkere tekst op geel, turkoois en lavendel en witte tekst op de rest", () => {
    for (const k of ["antraciet", "turkoois", "lavendel"]) expect(tekstOpKleur(CATEGORIE_COLORS[k].hex)).toBe("var(--ink)");
    for (const k of ["oranje", "blauw", "groen", "paars", "framboos"]) expect(tekstOpKleur(CATEGORIE_COLORS[k].hex)).toBe("#fff");
  });
});

describe("het kolomdiagram per domein", () => {
  const html = renderToStaticMarkup(<DomeinKolommen resultaten={aiGroepen} />);
  it("heeft een kolom per domein in de volgorde 1 tot en met 8 en niet op score gesorteerd", () => {
    expect(html.match(/class="dk-kolom /g)).toHaveLength(8);
    const nummers = [...html.matchAll(/class="dk-nr-cel"[^>]*><span class="dk-nr"[^>]*>(\d)</g)].map((m) => Number(m[1]));
    expect(nummers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it("toont onder de kolommen een cirkel met het nummer en een sleutel met de namen", () => {
    expect(html).toContain('class="dk-sleutel"');
    for (const g of aiGroepen) expect(html).toContain(g.groepNaam.replace("&", "&amp;"));
  });
  it("kleurt elk domein met de eigen domeinkleur en heeft zonder groep één balk per kolom", () => {
    expect(html).toContain("--domein-kleur:#1f9aa0");
    expect(html.match(/dk-staaf dk-staaf--groep/g)).toBeNull();
    expect(html).toContain("Score, de kleur van het domein");
  });
  it("heeft met een vergelijking twee balken per kolom, een tooltip met drie regels en de rest van de groep in de legenda", () => {
    const m = renderToStaticMarkup(<DomeinKolommen resultaten={aiGroepen} vergelijking={aiGroepen} naam="Organisatie" />);
    expect(m.match(/dk-staaf dk-staaf--groep/g)).toHaveLength(8);
    expect(m).toMatch(/Organisatie \d,\d · /);
    expect(m).toMatch(/Rest van de groep \d,\d/);
    expect(m).toContain("Organisatie, de kleur van het domein");
  });
  it("dimt de andere kolommen als een domein actief is", () => {
    const g = aiGroepen[2];
    const m = renderToStaticMarkup(<DomeinKolommen resultaten={aiGroepen} actief={{ groepKey: g.groepId, bouwblokId: g.groepId }} onActief={() => {}} />);
    expect(m.match(/is-actief/g)).toHaveLength(1);
    expect(m.match(/dk-kolom [^"]*is-gedimd/g)).toHaveLength(7);
  });
});
