import { describe, expect, it } from "vitest";
import { kruimelsVoorMeting, metVia } from "./resultaten-nav";

const org = { id: "O", naam: "Org" };
const meting = { id: "M", label: "Team A | 0-meting" };

describe("metVia", () => {
  it("laat een adres ongemoeid zonder via, en zet via=resultaten erbij met behoud van andere parameters", () => {
    expect(metVia("/beheer/metingen/M", false)).toBe("/beheer/metingen/M");
    expect(metVia("/beheer/metingen/M", true)).toBe("/beheer/metingen/M?via=resultaten");
    expect(metVia("/beheer/metingen/M?sort=naam", true)).toBe("/beheer/metingen/M?sort=naam&via=resultaten");
    expect(metVia("/beheer/metingen/M?via=resultaten", true)).toBe("/beheer/metingen/M?via=resultaten");
  });
});

describe("kruimelsVoorMeting", () => {
  it("via Organisaties: Organisaties > Organisatie > Meting, de Meting zonder link", () => {
    expect(kruimelsVoorMeting(org, meting, false)).toEqual([
      { label: "Organisaties", href: "/beheer/organisaties" },
      { label: "Org", href: "/beheer/organisaties/O" },
      { label: "Team A | 0-meting" },
    ]);
  });

  it("via Resultaten: Resultaten > Organisatie > Meting", () => {
    const k = kruimelsVoorMeting(org, meting, true);
    expect(k.map((d) => d.label)).toEqual(["Resultaten", "Org", "Team A | 0-meting"]);
    expect(k[0].href).toBe("/beheer/resultaten/metingen");
  });

  it("met een laatste deel is de Meting zelf een link die het pad meeneemt", () => {
    const k = kruimelsVoorMeting(org, meting, true, "Resultaten van de Meting");
    expect(k.at(-2)).toEqual({ label: "Team A | 0-meting", href: "/beheer/metingen/M?via=resultaten" });
    expect(k.at(-1)).toEqual({ label: "Resultaten van de Meting" });
    expect(kruimelsVoorMeting(org, meting, false, "X").at(-2)?.href).toBe("/beheer/metingen/M");
  });
});
