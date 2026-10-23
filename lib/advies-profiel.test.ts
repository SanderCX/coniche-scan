import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ADVIES_CATALOGUS_BEGIN } from "@/data/advies-catalogus";
import {
  OVER_MIJ_MAX,
  beginProfiel,
  controleerProfiel,
  kiesProfielRol,
  nieuweProfielRol,
  profielVan,
  promptRolId,
  verwijderProfielRol,
} from "./advies-profiel";
import type { AdviesProfiel, Gebruiker } from "./types";

const opslag = new Map<string, string>();
type Gebruikers = typeof import("./gebruikers-store");
type Profiel = typeof import("./advies-profiel");
let gebruikers: Gebruikers;
let profiel: Profiel;

beforeAll(async () => {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => opslag.get(k) ?? null,
      setItem: (k: string, v: string) => void opslag.set(k, v),
      removeItem: (k: string) => void opslag.delete(k),
    },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  });
  gebruikers = await import("./gebruikers-store");
  profiel = await import("./advies-profiel");
});
beforeEach(() => opslag.clear());

const begin = () => beginProfiel(ADVIES_CATALOGUS_BEGIN);
const auditLog = () => JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string }[];

describe("het beginprofiel", () => {
  it("heeft de rollen uit de catalogus met hun standaardtekst en een lege tekst bij Over mij", () => {
    const p = begin();
    expect(p.overMij).toBe("");
    expect(p.rollen.map((r) => r.id)).toEqual(["consultant", "salesmanager", "teamleider"]);
    expect(p.rollen.map((r) => r.naam)).toEqual(ADVIES_CATALOGUS_BEGIN.rollen.map((r) => r.naam));
    expect(p.rollen[0].tekst).toBe(ADVIES_CATALOGUS_BEGIN.rollen[0].standaardTekst);
    expect(p.rollen.every((r) => r.adviesRolId === r.id)).toBe(true);
    expect(p.standaardRolId).toBe("consultant");
  });
  it("wordt gebruikt zolang de Gebruiker nog geen profiel heeft, en herstelt een kapot profiel", () => {
    expect(profielVan({}, ADVIES_CATALOGUS_BEGIN)).toEqual(begin());
    expect(profielVan(null, ADVIES_CATALOGUS_BEGIN)).toEqual(begin());
    expect(profielVan({ adviesProfiel: { overMij: "x", standaardRolId: "x", rollen: [] } }, ADVIES_CATALOGUS_BEGIN)).toEqual(begin());
    const p = { ...begin(), overMij: "Ik ben Co", standaardRolId: "bestaatniet" };
    expect(profielVan({ adviesProfiel: p }, ADVIES_CATALOGUS_BEGIN)).toMatchObject({ overMij: "Ik ben Co", standaardRolId: "consultant" });
  });
  it("verandert niet als een Admin later de standaardtekst in de catalogus wijzigt", () => {
    const p = { ...begin(), overMij: "x" };
    const gewijzigd = { rollen: ADVIES_CATALOGUS_BEGIN.rollen.map((r) => ({ ...r, standaardTekst: "nieuw" })) };
    expect(profielVan({ adviesProfiel: p }, gewijzigd).rollen[0].tekst).toBe(ADVIES_CATALOGUS_BEGIN.rollen[0].standaardTekst);
  });
});

describe("rollen kiezen", () => {
  it("valt terug op de standaardrol als de gekozen rol is verwijderd", () => {
    const p = begin();
    expect(kiesProfielRol(p, "salesmanager").id).toBe("salesmanager");
    expect(kiesProfielRol(p, "weg").id).toBe("consultant");
    expect(kiesProfielRol(p, null).id).toBe("consultant");
    expect(kiesProfielRol({ ...p, standaardRolId: "teamleider" }, "weg").id).toBe("teamleider");
  });
  it("gebruikt voor een zelf toegevoegde rol de prompt van de rol Consultant", () => {
    expect(promptRolId({ adviesRolId: "salesmanager" })).toBe("salesmanager");
    expect(promptRolId(nieuweProfielRol())).toBe("consultant");
  });
  it("maakt een nieuwe rol met de naam Nieuwe rol en een lege tekst", () => {
    expect(nieuweProfielRol()).toMatchObject({ naam: "Nieuwe rol", tekst: "", adviesRolId: null });
    expect(nieuweProfielRol().id).not.toBe(nieuweProfielRol().id);
  });
  it("verwijdert een rol, schuift de standaardrol door en laat de laatste rol staan", () => {
    const p = begin();
    const zonder = verwijderProfielRol(p, "consultant");
    expect(zonder.rollen.map((r) => r.id)).toEqual(["salesmanager", "teamleider"]);
    expect(zonder.standaardRolId).toBe("salesmanager");
    expect(verwijderProfielRol(p, "teamleider").standaardRolId).toBe("consultant");
    const een: AdviesProfiel = { ...p, rollen: [p.rollen[0]] };
    expect(verwijderProfielRol(een, "consultant")).toBe(een);
  });
});

describe("het profiel controleren", () => {
  it("trimt de namen en laat een geldig profiel door", () => {
    const p = begin();
    const r = controleerProfiel({ ...p, rollen: [{ ...p.rollen[0], naam: "  Co  " }] });
    expect(r.ok && r.profiel.rollen[0].naam).toBe("Co");
  });
  it("weigert te lange teksten, een lege naam, geen rollen en een dubbele rol", () => {
    const p = begin();
    expect(controleerProfiel({ ...p, overMij: "x".repeat(OVER_MIJ_MAX + 1) }).ok).toBe(false);
    expect(controleerProfiel({ ...p, rollen: [{ ...p.rollen[0], naam: " " }] }).ok).toBe(false);
    expect(controleerProfiel({ ...p, rollen: [{ ...p.rollen[0], naam: "x".repeat(61) }] }).ok).toBe(false);
    expect(controleerProfiel({ ...p, rollen: [{ ...p.rollen[0], tekst: "x".repeat(1001) }] }).ok).toBe(false);
    expect(controleerProfiel({ ...p, rollen: [] }).ok).toBe(false);
    expect(controleerProfiel({ ...p, rollen: [p.rollen[0], p.rollen[0]] }).ok).toBe(false);
  });
  it("herstelt een onbekende standaardrol naar de eerste", () => {
    const r = controleerProfiel({ ...begin(), standaardRolId: "weg" });
    expect(r.ok && r.profiel.standaardRolId).toBe("consultant");
  });
});

describe("het profiel bewaren", () => {
  const zaad = () => gebruikers.getGebruikers()[0] as Gebruiker;

  it("bewaart het profiel bij de Gebruiker en leest het terug, zonder audit-regel", () => {
    const g = zaad();
    const p = { ...begin(), overMij: "Ik ben Co, consultant." };
    expect(profiel.slaProfielOp(g.id, p)).toEqual({ ok: true });
    expect(gebruikers.getGebruikers()[0].adviesProfiel).toMatchObject({ overMij: "Ik ben Co, consultant." });
    expect(profielVan(gebruikers.getGebruikers()[0], ADVIES_CATALOGUS_BEGIN).overMij).toBe("Ik ben Co, consultant.");
    expect(auditLog()).toEqual([]);
  });
  it("bewaart niets bij een ongeldig profiel", () => {
    const g = zaad();
    expect(profiel.slaProfielOp(g.id, { ...begin(), rollen: [] }).ok).toBe(false);
    expect(gebruikers.getGebruikers()[0].adviesProfiel).toBeUndefined();
  });
  it("laat de context van een andere Gebruiker ongemoeid", () => {
    const g = zaad();
    const ander = gebruikers.maakGebruiker({ email: "ander@x.nl", naam: "Ander", rol: "consultant" });
    profiel.slaProfielOp(g.id, { ...begin(), overMij: "van mij" });
    expect(gebruikers.getGebruikers().find((x) => x.id === ander.id)!.adviesProfiel).toBeUndefined();
  });
  it("blijft staan als de Gebruiker zijn naam wijzigt", () => {
    const g = zaad();
    profiel.slaProfielOp(g.id, { ...begin(), overMij: "blijft" });
    gebruikers.updateGebruiker(g.id, (x) => ({ ...x, naam: "Nieuwe naam" }));
    expect(gebruikers.getGebruikers()[0].adviesProfiel?.overMij).toBe("blijft");
  });
});
