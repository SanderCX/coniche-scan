import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { WegingKaart } from "@/components/WegingKaart";
import { bouwblokkenMetAfwijkendGewicht, gewichtMarkering } from "./weging";
import { zorgscan as zorgscanSeed } from "@/data/zorgscan-assessment";
import type { Assessment } from "./types";
import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { aiVolwassenheid } from "@/data/ai-scan-assessment";

// De Zorgscan-seed heeft de gewichten 4, 10 en 11 op 2 (de spec is leidend); deze kopie zet ze er expliciet op, onafhankelijk van de seed.
const zorgscan: Assessment = {
  ...zorgscanSeed,
  categorieen: zorgscanSeed.categorieen!.map((c) => ({
    ...c,
    bouwblokken: c.bouwblokken.map((b) => ({ ...b, gewicht: [4, 10, 11].includes(b.volgnummer) ? 2 : 1 })),
  })),
};

describe("weging", () => {
  it("bouwblokken met een afwijkend gewicht worden gevonden: Alleen de Zorgscan-seed heeft er, en wel 4, 10 en 11 op 2", () => {
    expect(bouwblokkenMetAfwijkendGewicht(zorgscan).map((b) => [b.volgnummer, b.gewicht])).toEqual([
      [4, 2],
      [10, 2],
      [11, 2],
    ]);
    expect(bouwblokkenMetAfwijkendGewicht(klantcontactVolwassenheid)).toEqual([]);
    expect(bouwblokkenMetAfwijkendGewicht(zorgscanSeed).map((b) => [b.volgnummer, b.gewicht])).toEqual([
      [4, 2],
      [10, 2],
      [11, 2],
    ]);
    expect(bouwblokkenMetAfwijkendGewicht(aiVolwassenheid)).toEqual([]);
  });

  it("de factor staat alleen bij een gewicht ongelijk aan 1", () => {
    const b = bouwblokkenMetAfwijkendGewicht(zorgscan)[0];
    expect(gewichtMarkering(b)).toBe("2×");
    expect(gewichtMarkering({ ...b, gewicht: 1.5 })).toBe("1,5×");
    expect(gewichtMarkering({ ...b, gewicht: 1 })).toBeNull();
  });

  it("de wegingskaart toont standaardtitel, standaardtekst en een chip per bouwblok, en ontbreekt zonder afwijkend gewicht", () => {
    const html = renderToStaticMarkup(<WegingKaart assessment={zorgscan} />);
    expect(html).toContain("Gewogen scoring");
    expect(html).toContain("tellen extra mee");
    expect(html).toContain("Leren uit klantcontact (2×)");
    expect(html).toContain("Kanaalmanagement (2×)");
    expect(renderToStaticMarkup(<WegingKaart assessment={klantcontactVolwassenheid} />)).toBe("");
  });

  it("een eigen titel en tekst vervangen de standaard", () => {
    const html = renderToStaticMarkup(
      <WegingKaart assessment={{ ...zorgscan, wegingTitel: "Eigen titel", wegingToelichting: "Eigen tekst." }} />
    );
    expect(html).toContain("Eigen titel");
    expect(html).toContain("Eigen tekst.");
    expect(html).not.toContain("Gewogen scoring");
  });
});
