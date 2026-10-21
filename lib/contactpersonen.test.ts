import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { contactpersonenOpAlfabet, controleerContactpersoon, isLinkedinAdres, normaliseerUrl } from "./contactpersonen";
import type { Organisatie } from "./types";

const opslag = new Map<string, string>();
const KEY = "coniche-scan:organisaties";
type Db = typeof import("./db");
let db: Db;

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
  db = await import("./db");
});
beforeEach(() => opslag.clear());

const org = (): Organisatie => ({
  id: "O", naam: "Org", kenmerken: {}, leden: [], scanUitvoeringen: [], aangemaaktDoor: null, toegewezenAan: [],
  benchmarkToegestaan: false, aangemaaktOp: "x", gewijzigdOp: "x",
});
const zet = () => opslag.set(KEY, JSON.stringify([org()]));
const laad = () => (JSON.parse(opslag.get(KEY)!) as Organisatie[])[0];
const audit = () => (JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; entiteitNaam?: string | null; details: Record<string, unknown> | null }[]);

describe("adressen", () => {
  it("zet een adres zonder schema om naar https en weigert andere schema's", () => {
    expect(normaliseerUrl("www.linkedin.com/in/anna")).toBe("https://www.linkedin.com/in/anna");
    expect(normaliseerUrl("http://nu.nl/a")).toBe("http://nu.nl/a");
    expect(normaliseerUrl("javascript:alert(1)")).toBeNull();
    expect(normaliseerUrl("ftp://x.nl")).toBeNull();
    expect(normaliseerUrl("geen adres")).toBeNull();
    expect(normaliseerUrl("")).toBeNull();
  });
  it("herkent een LinkedIn-adres aan het domein en niet aan de tekst", () => {
    expect(isLinkedinAdres("https://www.linkedin.com/in/anna")).toBe(true);
    expect(isLinkedinAdres("https://linkedin.com/in/anna")).toBe(true);
    expect(isLinkedinAdres("https://nl.linkedin.com/in/anna")).toBe(true);
    expect(isLinkedinAdres("https://evil.com/linkedin.com")).toBe(false);
    expect(isLinkedinAdres("https://notlinkedin.com/in/a")).toBe(false);
  });
});

describe("controle van de invoer", () => {
  it("een contactpersoon heeft een naam nodig, het LinkedIn-adres is optioneel maar moet kloppen", () => {
    expect(controleerContactpersoon({ naam: " ", functie: "", linkedinUrl: "", notitie: "" }).ok).toBe(false);
    const r = controleerContactpersoon({ naam: "  Anna   de Vries ", functie: "CX-directeur", linkedinUrl: "linkedin.com/in/anna", notitie: "" });
    expect(r.ok && r.waarde).toMatchObject({ naam: "Anna de Vries", linkedinUrl: "https://linkedin.com/in/anna" });
    expect(controleerContactpersoon({ naam: "A", functie: "", linkedinUrl: "https://twitter.com/a", notitie: "" }).ok).toBe(false);
    expect(controleerContactpersoon({ naam: "A", functie: "", linkedinUrl: "", notitie: "" }).ok).toBe(true);
  });
});

describe("volgorde", () => {
  it("contactpersonen staan op alfabet", () => {
    const c = contactpersonenOpAlfabet([
      { id: "1", naam: "Zoë", functie: "", linkedinUrl: "", notitie: "", aangemaaktOp: "x" },
      { id: "2", naam: "anna", functie: "", linkedinUrl: "", notitie: "", aangemaaktOp: "x" },
    ]);
    expect(c.map((p) => p.naam)).toEqual(["anna", "Zoë"]);
  });
});

describe("opslaan, wijzigen en verwijderen", () => {
  it("voegt een contactpersoon toe, wijzigt hem en verwijdert hem, zonder naam in de audit-log", () => {
    zet();
    const r = db.voegContactpersoonToe("O", { naam: "Anna", functie: "CX", linkedinUrl: "https://www.linkedin.com/in/anna", notitie: "" });
    expect(r.ok).toBe(true);
    const id = laad().contactpersonen![0].id;
    expect(db.wijzigContactpersoon("O", id, { naam: "Anna", functie: "COO", linkedinUrl: "https://www.linkedin.com/in/anna", notitie: "" }).ok).toBe(true);
    expect(laad().contactpersonen![0].functie).toBe("COO");
    expect(db.verwijderContactpersoon("O", id).ok).toBe(true);
    expect(laad().contactpersonen).toHaveLength(0);
    const log = audit().filter((e) => e.actie.startsWith("contactpersoon."));
    expect(log.map((e) => e.actie)).toEqual(["contactpersoon.toegevoegd", "contactpersoon.gewijzigd", "contactpersoon.verwijderd"]);
    expect(JSON.stringify(log)).not.toMatch(/Anna|linkedin\.com|COO|CX/);
    expect(log[1].details).toMatchObject({ velden: ["functie"] });
  });
  it("een ongeldige invoer bewaart niets en een wijziging zonder verschil logt niets", () => {
    zet();
    expect(db.voegContactpersoonToe("O", { naam: "", functie: "", linkedinUrl: "", notitie: "" }).ok).toBe(false);
    expect(laad().contactpersonen ?? []).toHaveLength(0);
    const anna = (db.voegContactpersoonToe("O", { naam: "Anna", functie: "CX", linkedinUrl: "", notitie: "" }) as { ok: true; contactpersoon: { id: string } }).contactpersoon.id;
    const voor = audit().length;
    expect(db.wijzigContactpersoon("O", anna, { naam: "Anna", functie: "CX", linkedinUrl: "", notitie: "" }).ok).toBe(true);
    expect(audit()).toHaveLength(voor);
  });
  it("een onbekende Organisatie of id geeft een fout", () => {
    zet();
    expect(db.voegContactpersoonToe("X", { naam: "A", functie: "", linkedinUrl: "", notitie: "" }).ok).toBe(false);
    expect(db.verwijderContactpersoon("O", "nope").ok).toBe(false);
  });
  it("een organisatie van vóór deze velden laadt met een lege lijst", () => {
    const { contactpersonen, ...oud } = { ...org(), contactpersonen: [] };
    void contactpersonen;
    opslag.set(KEY, JSON.stringify([oud]));
    expect(db.laadAlles()[0].contactpersonen).toEqual([]);
  });
});
