import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { assessments } from "@/data/assessments";
import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { AiDomeinenSectie } from "@/components/assessment/AiDomeinenSectie";
import { DossierFilmPodium } from "@/components/help/RadarFilms";
import { filmVariant } from "./film";
import { DOSSIER_ASSESSMENT_IDS } from "./dossier";

describe("de AI-domeinen als radar op de Assessment-pagina", () => {
  const html = renderToStaticMarkup(<AiDomeinenSectie warm={false} />);

  it("toont acht knooppunten en acht rijen, zonder het oude raster van kaarten", () => {
    expect(html).toContain("br-rijen");
    expect(html).not.toContain("ap-domein");
    expect((html.match(/br-pil/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });
});

const aiVolwassenheid = assessments.find((a) => a.id === "ai-volwassenheid")!;

describe("de film Het dossier lezen", () => {
  it("heeft een AI-variant met de radar van acht domeinen", () => {
    expect(filmVariant(aiVolwassenheid)).toBe("domeinen");
    expect(filmVariant(klantcontactVolwassenheid)).toBe("categorieen");
    const ai = renderToStaticMarkup(<DossierFilmPodium ai />);
    const standaard = renderToStaticMarkup(<DossierFilmPodium />);
    expect((ai.match(/class="mr-knoop[ "]/g) ?? []).length).toBe(8);
    expect((standaard.match(/class="mr-knoop[ "]/g) ?? []).length).toBe(15);
    expect(ai).toContain("Use-cases en automatisering");
  });

  it("toont de lijst in de opmaak van de Dossierpagina, op laagste score eerst (22 oktober 2026)", () => {
    const rijen = (html: string) => [...html.matchAll(/class="fd-rij fd-rij--(\d+)"/g)].map((m) => Number(m[1]));
    const scores = (html: string) => [...html.matchAll(/<span class="fd-score"><strong>([\d,]+)<\/strong>/g)].map((m) => m[1]);
    const standaard = renderToStaticMarkup(<DossierFilmPodium />);
    const ai = renderToStaticMarkup(<DossierFilmPodium ai />);
    expect(rijen(standaard)).toEqual([7, 4, 13]);
    expect(scores(standaard)).toEqual(["2,2", "2,3", "4,1"]);
    expect(rijen(ai)).toEqual([3, 5, 6]);
    expect(scores(ai)).toEqual(["2,0", "2,4", "3,6"]);
    // De warme kaart met de kop, de slanke balk met stip, de klasse als badge en een legenda zonder aswaarden.
    for (const html of [standaard, ai]) {
      expect(html).toContain("fd-kaart");
      expect(html).toContain("Waar dit dossier over gaat");
      expect(html).toContain("fd-balk");
      expect(html).toContain("fd-legenda");
      expect(html).not.toContain("dp-ankers");
    }
    // De cirkels van 5 en 6 hebben een donker nummer op geel en groenblauw.
    expect(ai).toMatch(/background:#ffc043;color:var\(--ink\)">5</);
    expect(ai).toMatch(/background:#1f9aa0;color:var\(--ink\)">6</);
    // Het gekozen domein staat in de filterbalk, het gekozen bouwblok 7 bij de Klantcontact Volwassenheid.
    expect(ai).toMatch(/fd-filterbalk[^]*?>3<[^]*?2 items in dit dossier/);
    expect(standaard).toMatch(/fd-filterbalk[^]*?>7<[^]*?2 items in dit dossier/);
  });
});

describe("de Assessments waaraan een Dossieritem te koppelen is", () => {
  it("zijn de Klantcontact Volwassenheidsscan en de AI-scan", () => {
    expect([...DOSSIER_ASSESSMENT_IDS]).toEqual(["klantcontact-volwassenheid", "ai-volwassenheid"]);
  });
});
