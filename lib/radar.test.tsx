import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { zorgscan } from "@/data/zorgscan-assessment";
import { alleVragen } from "./assessment-structuur";
import { alleBouwblokResultaten, alleGroepResultaten } from "./scoring";
import { RadarChartView } from "@/components/RadarChartView";
import { CategorieStaafdiagram } from "@/components/CategorieStaafdiagram";

const antwoorden = Object.fromEntries(alleVragen(zorgscan).map((v, i) => [v.id, (i % 5) + 1]));
const bouwblokken = alleBouwblokResultaten(zorgscan, antwoorden);
const groepen = alleGroepResultaten(zorgscan, bouwblokken, antwoorden);

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
  it("heeft onder de radar geen legenda met categorieën meer", () => {
    expect(html).not.toContain("radar-categorieen");
  });
  it("toont bij een tweede reeks beide scores in de tooltip", () => {
    const m = renderToStaticMarkup(<RadarChartView resultaten={bouwblokken} vergelijking={bouwblokken} naam="Org" vergelijkingNaam="Groep" />);
    expect(m).toMatch(/Org \d,\d/);
    expect(m).toMatch(/Groep \d,\d/);
  });
});

describe("het staafdiagram per categorie", () => {
  const html = renderToStaticMarkup(<CategorieStaafdiagram resultaten={groepen} />);
  it("heeft een balk per categorie die met Tab bereikbaar is, met naam, score en klasse in het aria-label", () => {
    expect(html.match(/class="cat-balk"/g)).toHaveLength(groepen.length);
    expect(html).toMatch(/aria-label="Overkoepelend, \d,\d, /);
  });
  it("toont de naam van elke categorie onder zijn balk en de uitleg van de stippellijnen, en geen getal boven de balk", () => {
    expect(html.match(/class="cat-naam"/g)).toHaveLength(groepen.length);
    for (const g of groepen) expect(html).toContain(g.groepNaam.replace("&", "&amp;"));
    expect(html).toContain("De stippellijnen bij 2,5 en 3,5");
    expect(html).not.toContain("recharts");
  });
  it("zet de nummers van de bouwblokken bij de categorienaam", () => {
    expect(html).toContain('<span class="cat-nummers">1–2</span>');
    expect(html).toContain('<span class="cat-nummers">15</span>');
    expect(html).toContain('<span class="cat-nummers">7–10</span>');
  });
});
