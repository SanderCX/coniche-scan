import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { zorgscan } from "@/data/zorgscan-assessment";
import { aiVolwassenheid } from "@/data/ai-scan-assessment";
import { ziekenhuisQuickscan } from "@/data/ziekenhuis-quickscan-assessment";
import { filmVariant, filmWeging } from "./film";
import { HelpFilm } from "@/components/help/HelpFilm";

describe("de variant van de film Wat krijg ik", () => {
  it("volgt het type van het Assessment, en zonder Assessment (in Help) zijn het categorieën", () => {
    expect(filmVariant(klantcontactVolwassenheid)).toBe("categorieen");
    expect(filmVariant(zorgscan)).toBe("categorieen");
    expect(filmVariant(aiVolwassenheid)).toBe("domeinen");
    expect(filmVariant(ziekenhuisQuickscan)).toBe("quickscan");
    expect(filmVariant(null)).toBe("categorieen");
    expect(filmVariant(undefined)).toBe("categorieen");
  });
});

describe("de weging in de film", () => {
  it("telt de bouwblokken met een gewicht ongelijk aan 1 en noemt de factor, zonder namen", () => {
    const w = filmWeging(zorgscan);
    expect(w?.regel).toBe("Drie bouwblokken tellen 2× mee");
    expect(w?.zin).toBe("Bouwblokken die zwaarder meetellen, tonen hun factor, zoals 2×.");
  });
  it("is er niet zonder gewichten ongelijk aan 1, en niet bij de Quickscan", () => {
    expect(filmWeging(klantcontactVolwassenheid)).toBeNull();
    expect(filmWeging(aiVolwassenheid)).toBeNull();
    expect(filmWeging(null)).toBeNull();
  });
  it("noemt bij verschillende factoren geen factor en bij één bouwblok het enkelvoud", () => {
    const kopie = structuredClone(zorgscan);
    const blokken = kopie.categorieen!.flatMap((c) => c.bouwblokken).filter((b) => b.gewicht !== 1);
    blokken[0].gewicht = 3;
    expect(filmWeging(kopie)?.regel).toBe("Drie bouwblokken tellen zwaarder mee");
    blokken[1].gewicht = 1;
    blokken[2].gewicht = 1;
    expect(filmWeging(kopie)?.regel).toBe("Één bouwblok telt 3× mee");
  });
});

describe("de film Wat krijg ik per type", () => {
  const html = (a: Parameters<typeof HelpFilm>[0]["assessment"]) => renderToStaticMarkup(<HelpFilm naam="wat-krijg-ik" assessment={a} />);
  it("toont bij Klantcontact vijf categorieën met ring 3,4 en geen weging", () => {
    const h = html(klantcontactVolwassenheid);
    expect(h).toContain("help-film--categorieen");
    expect(h).toContain("Overkoepelend");
    expect(h).toContain(">3,4<");
    expect(h).not.toContain("tellen 2× mee");
    expect(h).toContain("een staaf per categorie.");
  });
  it("toont bij de Zorgscan de weging onder de klassenaam en op stapkaart 2", () => {
    const h = html(zorgscan);
    expect(h).toContain('class="film-weging">Drie bouwblokken tellen 2× mee');
    expect(h).toContain("Bouwblokken die zwaarder meetellen, tonen hun factor, zoals 2×.");
  });
  it("toont bij de AI-scan acht rijen met nummercirkel, ring 2,5 tot 37,5% en een staaf per domein", () => {
    const h = html(aiVolwassenheid);
    expect(h).toContain("help-film--domeinen");
    expect(h.match(/class="film-rij film-rij--domein"/g)).toHaveLength(8);
    expect(h).toContain("--ring-vul:37.5%");
    expect(h).toContain(">2,5<");
    expect(h).toContain("een staaf per domein.");
    expect(h).toContain("Klant- en kanaalervaring");
    expect(h).not.toContain("Laagste tot hoogste");
  });
  it("toont bij de Quickscan percentages, vier afdelingen in klassekleur en eigen stapkaarten en legenda", () => {
    const h = html(ziekenhuisQuickscan);
    expect(h).toContain("help-film--quickscan");
    expect(h).toContain(">58%<");
    expect(h).toContain("Gemiddeld ontwikkeld");
    expect(h.match(/class="film-rij film-rij--afdeling"/g)).toHaveLength(4);
    expect(h).toContain("background:var(--stat-green)");
    expect(h).toContain("background:var(--stat-amber)");
    expect(h).toContain("background:var(--stat-red)");
    expect(h).toContain("Je beantwoordt een vraag met Ja, Nee of Weet ik niet.");
    expect(h).toContain("het totaalpercentage en een staaf per afdeling.");
    expect(h).toContain("Laagste tot hoogste percentage");
    expect(h).not.toContain("Receptie / Centrale</span><div class=\"film-spoor\"><span class=\"film-grens\" style=\"left:50%\"></span><span class=\"film-grens\" style=\"left:80%\"></span><span class=\"film-balk film-balk--3\" style=\"width:47%;background:var(--stat-green)");
  });
  it("heeft voor elk type dezelfde derde stapkaart", () => {
    for (const a of [klantcontactVolwassenheid, zorgscan, aiVolwassenheid, ziekenhuisQuickscan]) {
      expect(html(a)).toContain("Een Lead ziet er het gemiddelde en de spreiding van de groep bij, zodra er genoeg scans zijn.");
    }
  });
  it("heeft in Help zonder Assessment de variant met categorieën", () => {
    expect(html(undefined)).toContain("help-film--categorieen");
  });
});
