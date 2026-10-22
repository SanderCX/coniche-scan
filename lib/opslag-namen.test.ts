import { describe, expect, it } from "vitest";
import { parseOpslag, stringifyOpslag } from "./opslag-namen";

describe("de namen in de opslag (22 oktober 2026)", () => {
  const assessment = {
    id: "a",
    bouwblokLabel: "Bouwsteen",
    bouwblokEenheidEnkelvoud: "Bouwsteen",
    bouwblokEenheidMeervoud: "bouwstenen",
    categorieen: [{ id: "c", bouwblokken: [{ id: "bb1", naam: "Strategie", vragen: [] }] }],
    bouwblokken: null,
  };

  it("schrijft de namen van het datamodel", () => {
    const tekst = stringifyOpslag([assessment]);
    expect(tekst).toContain('"bouwsteenLabel":"Bouwsteen"');
    expect(tekst).toContain('"bouwsteenEenheidMeervoud":"bouwstenen"');
    expect(tekst).toContain('"bouwstenen":[{"id":"bb1"');
    expect(tekst).toContain('"bouwstenen":null');
    expect(tekst).not.toContain("bouwblokken");
    expect(tekst).not.toContain("bouwblokLabel");
  });

  it("leest de nieuwe namen terug naar de namen van de code", () => {
    expect(parseOpslag(stringifyOpslag([assessment]))).toEqual([assessment]);
  });

  it("leest ook data met de oude namen", () => {
    expect(parseOpslag(JSON.stringify([assessment]))).toEqual([assessment]);
  });

  it("hernoemt de velden van een Dossieritem en een invulling en laat de waarden en de sleutels van een kaart met id's staan", () => {
    const org = {
      dossier: { items: [{ id: "i", bouwblokIds: ["bb1", "ai2"] }] },
      scanUitvoeringen: [{ invullingen: [{ opmerkingenPerBouwblok: { bb1: "tekst", bouwblokken: "geen sleutel van een veld, maar van een kaart" } }] }],
    };
    const tekst = stringifyOpslag(org);
    expect(tekst).toContain('"bouwsteenIds":["bb1","ai2"]');
    expect(tekst).toContain('"opmerkingenPerBouwsteen":{"bb1":"tekst","bouwstenen"');
    // De sleutel van een kaart die toevallig zo heet, wordt meegenomen: Dat is acceptabel omdat id's nooit zo heten, en terug is het weer gelijk.
    expect(parseOpslag(tekst)).toEqual(org);
  });
});
