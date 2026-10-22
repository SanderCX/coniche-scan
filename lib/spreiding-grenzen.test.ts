import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SPREIDING_STANDAARDWAARDEN, controleerSpreidingGrenzen, grensTekst, leesGrens, spreidingLabelVoor } from "./spreiding-grenzen";

const invoer = (extra: Record<string, string> = {}) => ({
  spreidingWisselend: "0,55",
  spreidingVerdeeld: "0,8",
  spreidingWisselendQuickscan: "14",
  spreidingVerdeeldQuickscan: "20",
  ...extra,
});

describe("de grenzen van het spreidingslabel", () => {
  it("leest getallen met een komma of een punt, groter dan 0", () => {
    expect(leesGrens("0,55")).toBe(0.55);
    expect(leesGrens(" 14 ")).toBe(14);
    expect(leesGrens("0.8")).toBe(0.8);
    for (const fout of ["", "0", "-1", "abc", "1,2,3", "1e3", "0,"]) expect(leesGrens(fout)).toBeNull();
  });

  it("toont een grens met een komma", () => {
    expect(grensTekst(0.55)).toBe("0,55");
    expect(grensTekst(14)).toBe("14");
  });

  it("accepteert de startwaarden en elke combinatie met Verdeeld boven Wisselend", () => {
    expect(controleerSpreidingGrenzen(invoer())).toEqual({ ok: true, waarde: SPREIDING_STANDAARDWAARDEN });
    expect(controleerSpreidingGrenzen(invoer({ spreidingWisselend: "0,4", spreidingVerdeeld: "0,9" })).ok).toBe(true);
  });

  it("weigert een leeg veld, nul en een Verdeeld-grens die niet boven Wisselend ligt", () => {
    expect(controleerSpreidingGrenzen(invoer({ spreidingWisselend: "" })).ok).toBe(false);
    expect(controleerSpreidingGrenzen(invoer({ spreidingVerdeeldQuickscan: "0" })).ok).toBe(false);
    expect(controleerSpreidingGrenzen(invoer({ spreidingVerdeeld: "0,55" }))).toEqual({
      ok: false,
      reden: "Bij de schaalscans moet de grens voor Verdeeld boven die voor Wisselend liggen.",
    });
    expect(controleerSpreidingGrenzen(invoer({ spreidingWisselendQuickscan: "25" }))).toEqual({
      ok: false,
      reden: "Bij de Quickscan moet de grens voor Verdeeld boven die voor Wisselend liggen.",
    });
  });

  it("kiest het label op de grenzen: Eronder Eensgezind, op de grens Wisselend, vanaf de tweede grens Verdeeld", () => {
    const g = { wisselend: 0.55, verdeeld: 0.8 };
    expect(spreidingLabelVoor(0.54, g)).toBe("Eensgezind");
    expect(spreidingLabelVoor(0.55, g)).toBe("Wisselend");
    expect(spreidingLabelVoor(0.79, g)).toBe("Wisselend");
    expect(spreidingLabelVoor(0.8, g)).toBe("Verdeeld");
  });
});

describe("de labels volgen de instellingen", () => {
  const opslag = new Map<string, string>();
  type Instellingen = typeof import("./instellingen-store");
  let store: Instellingen;
  let visualisatie: typeof import("./visualisatie");
  let qs: typeof import("./quickscan-groep");

  beforeAll(async () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => opslag.get(k) ?? null,
        setItem: (k: string, v: string) => void opslag.set(k, v),
        removeItem: (k: string) => void opslag.delete(k),
      },
      sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    });
    vi.stubGlobal("fetch", async () => ({ status: 204, text: async () => "" }));
    store = await import("./instellingen-store");
    visualisatie = await import("./visualisatie");
    qs = await import("./quickscan-groep");
  });
  beforeEach(() => opslag.clear());

  it("gebruikt zonder instelling de startwaarden", () => {
    expect(visualisatie.spreidingsLabel(0.6)).toBe("Wisselend");
    expect(qs.spreidingLabelQs(15)).toBe("Wisselend");
    expect(store.getInstellingen()).toMatchObject(SPREIDING_STANDAARDWAARDEN);
  });

  it("heeft de testknop standaard uit en logt het aanzetten als instellingenwijziging", () => {
    expect(store.getInstellingen().testknopAan).toBe(false);
    store.zetInstellingen({ testknopAan: true });
    expect(store.getInstellingen().testknopAan).toBe(true);
    const log = JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; details: { gewijzigd: Record<string, { oud: unknown; nieuw: unknown }> } }[];
    expect(log.find((e) => e.actie === "instellingen.gewijzigd")?.details.gewijzigd.testknopAan).toEqual({ oud: false, nieuw: true });
  });

  it("past het label aan zodra een Admin de grenzen wijzigt, ook bij een oude opslag zonder de velden", () => {
    opslag.set("coniche-scan:instellingen", JSON.stringify({ benchmarkMinOrganisaties: 5 }));
    expect(visualisatie.spreidingsLabel(0.6)).toBe("Wisselend");
    store.zetInstellingen({ spreidingWisselend: 0.7, spreidingVerdeeld: 1, spreidingWisselendQuickscan: 10, spreidingVerdeeldQuickscan: 12 });
    expect(visualisatie.spreidingsLabel(0.6)).toBe("Eensgezind");
    expect(visualisatie.spreidingsLabel(1)).toBe("Verdeeld");
    expect(qs.spreidingLabelQs(11)).toBe("Wisselend");
    expect(qs.spreidingLabelQs(13)).toBe("Verdeeld");
    const log = JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; details: { gewijzigd: Record<string, { oud: number; nieuw: number }> } }[];
    expect(log.find((e) => e.actie === "instellingen.gewijzigd")?.details.gewijzigd.spreidingWisselend).toEqual({ oud: 0.55, nieuw: 0.7 });
  });
});
