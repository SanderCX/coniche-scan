import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RESPONDENT_ROLLEN } from "@/data/respondent-rollen";
import { gebruikteFuncties, optieLijst, uniekeTeksten } from "./kenmerken-opties";

describe("Rol / functie", () => {
  it("houdt de lijst in de code gelijk aan content-respondentrol.md", () => {
    const md = readFileSync("content-respondentrol.md", "utf8");
    const lijst = md.slice(md.indexOf("## 2. De lijst"), md.indexOf("## 3."));
    const uitSpec = lijst
      .split("\n")
      .filter((regel) => /^\d+\. /.test(regel))
      .map((regel) => regel.replace(/^\d+\.\s*/, "").trim());
    expect(RESPONDENT_ROLLEN).toEqual(uitSpec);
    expect(RESPONDENT_ROLLEN).toHaveLength(29);
  });

  it("heeft geen dubbelen en begint met Klantenservicemedewerker", () => {
    expect(new Set(RESPONDENT_ROLLEN.map((r) => r.toLowerCase())).size).toBe(RESPONDENT_ROLLEN.length);
    expect(RESPONDENT_ROLLEN[0]).toBe("Klantenservicemedewerker");
  });

  it("zet eigen invoer achter de vaste rollen, op alfabet, en laat de aangeleverde volgorde staan", () => {
    const lijst = optieLijst([], ["Zorgcoördinator", "Accountmanager", "teamleider"], undefined, RESPONDENT_ROLLEN);
    expect(lijst.slice(0, 29)).toEqual(RESPONDENT_ROLLEN);
    expect(lijst.slice(29)).toEqual(["Accountmanager", "Zorgcoördinator"]);
  });

  it("verzamelt functies van de Respondenten, zonder lege waarden en dubbelen", () => {
    const orgs = [
      { leden: [{ functie: " Teamleider " }, { functie: "" }, { functie: null }] },
      { leden: [{ functie: "teamleider" }, { functie: "Ombudsman" }] },
    ];
    expect(gebruikteFuncties(orgs)).toEqual(["Teamleider", "Ombudsman"]);
    expect(uniekeTeksten(["a", "A", 5, null, " b "])).toEqual(["a", "b"]);
  });
});
