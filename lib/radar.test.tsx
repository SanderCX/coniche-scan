import { readFileSync } from "node:fs";
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
  it("heeft per bouwsteen een knooppunt met een aria-label met nummer, naam, score en klasse", () => {
    expect(html.match(/class="radar-knoop /g)).toHaveLength(15);
    expect(html).toMatch(/aria-label="1, Organisatiestrategie, \d,\d, (Basis op orde|Uitbouwen|Sterk punt)/);
  });
  it("toont de namen alleen in de tooltip en de factor bij een gewogen bouwsteen", () => {
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
  it("laat bij een hele categorie alle bouwstenen ervan oplichten", () => {
    const b = bouwblokken[3];
    const m = renderToStaticMarkup(<RadarChartView resultaten={bouwblokken} actief={{ groepKey: b.groepId }} onActief={() => {}} />);
    const inGroep = bouwblokken.filter((r) => r.groepId === b.groepId).length;
    expect(m.match(/class="radar-stip"/g)).toHaveLength(inGroep);
  });
});

describe("de actieve staat", () => {
  it("geeft een bouwsteen de staat actief, groep, gedimd of normaal", () => {
    expect(staatVan(null, "a", "1")).toBe("normaal");
    expect(staatVan({ groepKey: "a", bouwblokId: "1" }, "a", "1")).toBe("actief");
    expect(staatVan({ groepKey: "a", bouwblokId: "1" }, "a", "2")).toBe("groep");
    expect(staatVan({ groepKey: "a", bouwblokId: "1" }, "b", "3")).toBe("gedimd");
    expect(staatVan({ groepKey: "a" }, "a", "2")).toBe("actief");
  });
  it("gebruikt zonder categorielaag de bouwsteen zelf als groep", () => {
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
  it("zet de nummers van de bouwstenen bij de categorienaam", () => {
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
  it("zet donkere tekst alleen op geel en witte tekst op de rest, ook op turkoois en lavendel", () => {
    expect(tekstOpKleur(CATEGORIE_COLORS.antraciet.hex)).toBe("var(--ink)");
    for (const k of ["oranje", "blauw", "groen", "paars", "framboos", "turkoois", "lavendel"]) expect(tekstOpKleur(CATEGORIE_COLORS[k].hex)).toBe("#fff");
  });
});

describe("het kolomdiagram per domein", () => {
  const html = renderToStaticMarkup(<DomeinKolommen resultaten={aiGroepen} />);
  it("heeft een kolom per domein in de volgorde 1 tot en met 8 en niet op score gesorteerd", () => {
    expect(html.match(/class="dk-kolom /g)).toHaveLength(8);
    const nummers = [...html.matchAll(/class="dk-nr-cel"[^>]*><span class="dk-nr"[^>]*>(\d)</g)].map((m) => Number(m[1]));
    expect(nummers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it("toont onder de kolommen een cirkel met het nummer, zonder sleutel, en de namen in de tooltip", () => {
    expect(html).not.toContain("dk-sleutel");
    expect(html.match(/class="dk-nr-cel"/g)).toHaveLength(8);
    for (const g of aiGroepen) expect(html).toContain(`${g.nummers} · ${g.groepNaam.replace("&", "&amp;")}`);
  });
  it("kleurt elk domein met de eigen domeinkleur en heeft zonder groep één balk per kolom", () => {
    expect(html).toContain("--domein-kleur:#1f9aa0");
    expect(html.match(/dk-staaf dk-staaf--groep/g)).toBeNull();
    expect(html).not.toContain("dk-legenda");
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

describe("de radar in de filtermodus (Dossier)", () => {
  const actief = new Set([bouwblokken[0].bouwblok.id, bouwblokken[3].bouwblok.id]);
  it("maakt alleen de actieve bouwstenen tot knoppen met aria-pressed en dimt de rest", () => {
    const m = renderToStaticMarkup(<RadarChartView resultaten={bouwblokken} filter={{ actief, gekozen: bouwblokken[3].bouwblok.id, onKies: () => {} }} />);
    expect(m.match(/aria-pressed="/g)).toHaveLength(2);
    expect(m.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(m.match(/is-filter/g)).toHaveLength(2);
    expect(m.match(/is-inactief/g)).toHaveLength(13);
    expect(m.match(/is-gekozen/g)).toHaveLength(1);
    expect(m.match(/aria-disabled="true"/g)).toHaveLength(13);
  });
  it("zet de taartpunt van de gekozen bouwsteen op 50% en de rest op 20%", () => {
    const m = renderToStaticMarkup(<RadarChartView resultaten={bouwblokken} filter={{ actief, gekozen: bouwblokken[3].bouwblok.id, onKies: () => {} }} />);
    expect(m.match(/fill-opacity="0\.5"/g)).toHaveLength(1);
    expect(m.match(/class="radar-taart"[^>]*fill-opacity="0\.2"/g)).toHaveLength(14);
  });
  it("toont score-stippen alleen bij de actieve bouwstenen", () => {
    const m = renderToStaticMarkup(<RadarChartView resultaten={bouwblokken} filter={{ actief, gekozen: null, onKies: () => {} }} />);
    expect(m.match(/class="radar-stip"/g)).toHaveLength(2);
  });
  it("heeft zonder scores geen veelhoek, geen stippen, geen score in de tooltip en geen reeks in de legenda", () => {
    const zonder = bouwblokken.map((r) => ({ ...r, score: null }));
    const m = renderToStaticMarkup(<RadarChartView resultaten={zonder} naam="Organisatie Test" filter={{ actief, gekozen: null, onKies: () => {} }} />);
    expect(m).not.toContain("<polygon");
    expect(m).not.toContain("radar-stip");
    expect(m).not.toContain("Organisatie Test");
    expect(m).toContain("Grenzen 2,5 en 3,5");
    expect(m).not.toMatch(/<span>–/);
  });
});

describe("één tooltip tegelijk en het staafdiagram met twee reeksen", () => {
  it("toont geen tooltip in de radar als de muis of focus in het diagram is", () => {
    const b = bouwblokken[3];
    const uitDiagram = renderToStaticMarkup(
      <RadarChartView resultaten={bouwblokken} actief={{ groepKey: groepSleutel(b.groepId, b.bouwblok.id), bouwblokId: b.bouwblok.id, bron: "diagram" }} onActief={() => {}} />,
    );
    expect(uitDiagram.match(/is-zichtbaar/g)).toBeNull();
    // De radar licht wel op.
    expect(uitDiagram).toContain("is-actief");
    expect(uitDiagram.match(/class="radar-stip"/g)).toHaveLength(1);
  });

  it("tekent twee balken per categorie met een tooltip met beide waarden en het verschil, en de klassenamen in de kaart", () => {
    const html = renderToStaticMarkup(<CategorieStaafdiagram resultaten={groepen} vergelijking={groepen} naam="Org" vergelijkingNaam="Groep" />);
    expect((html.match(/class="cat-balk cat-balk--dubbel"/g) ?? []).length).toBe(groepen.length);
    expect((html.match(/cat-staaf--groep/g) ?? []).length).toBe(groepen.length);
    expect(html).toMatch(/Org \d,\d · /);
    expect(html).toMatch(/Groep \d,\d/);
    expect(html).toContain("Verschil");
    for (const klasse of ["Sterk punt", "Uitbouwen", "Basis op orde"]) expect(html).toContain(`>${klasse}</span>`);
    expect(html).toContain("Groep</li>");
    expect(html).not.toContain("recharts");
  });

  it("heeft zonder tweede reeks geen klassenamen en geen dubbele balken", () => {
    const html = renderToStaticMarkup(<CategorieStaafdiagram resultaten={groepen} />);
    expect(html).not.toContain("cat-klassen");
    expect(html).not.toContain("cat-balk--dubbel");
  });

  it("zet de as op één kleur en de namen gecentreerd", () => {
    const css = readFileSync(new URL("../app/styles/charts.css", import.meta.url), "utf8");
    expect(css).toMatch(/\.cat-as \{[^}]*color: var\(--ink-s\)/);
    expect(css).toMatch(/\.cat-naam \{[^}]*text-align: center/);
    expect(css).toMatch(/\.cat-item\.is-actief \.cat-naam,\s*\.cat-item\.is-actief \.cat-nummers \{[^}]*font-weight: 700/);
  });

  it("kent geen liggend staafdiagram: Een kolom is minstens 88px en onder de 440px staan alleen de nummers onder de balk", () => {
    const css = readFileSync(new URL("../app/styles/charts.css", import.meta.url), "utf8");
    expect(css).not.toContain("left: 158px");
    expect(css).not.toMatch(/\.cat-kolommen \{[^}]*flex-direction: column/);
    expect(css).toMatch(/\.cat-item \{\s*min-width: 88px/);
    expect(css).toMatch(/@container \(max-width: 439px\) \{[^@]*\.cat-naam \{[^}]*font-size: 0/);
  });

  it("geeft de radar 460px en het staafdiagram de rest van de breedte", () => {
    const css = readFileSync(new URL("../app/styles/components.css", import.meta.url), "utf8");
    expect(css).toMatch(/\.resultaat-kaarten \{[^}]*grid-template-columns: minmax\(0, 460px\) minmax\(0, 1fr\)/);
  });
});
