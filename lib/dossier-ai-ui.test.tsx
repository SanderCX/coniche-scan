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
    expect(ai).toContain("Operating model en schaalbaarheid");
  });
});

describe("de Assessments waaraan een Dossieritem te koppelen is", () => {
  it("zijn de Klantcontact Volwassenheidsscan en de AI-scan", () => {
    expect([...DOSSIER_ASSESSMENT_IDS]).toEqual(["klantcontact-volwassenheid", "ai-volwassenheid"]);
  });
});
