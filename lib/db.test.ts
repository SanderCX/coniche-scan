import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// db.ts leest en schrijft localStorage en roept `fetch` aan voor de serversync:
// Beide worden vervangen door een in-memory versie, vóór het importeren.
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
  });
  vi.stubGlobal("fetch", async () => ({ status: 204, text: async () => "" }));
  db = await import("./db");
});

beforeEach(() => opslag.clear());

type Rij = Record<string, unknown>;
const lid = (id: string, orgId: string, email: string, extra: Rij = {}) => ({
  id, organisatieId: orgId, email, naam: email, functie: "", team: "", notities: "",
  toegangscode: `c${id}`, leadMetingIds: [], aangemaaktOp: "2026-01-01", ...extra,
});
const inv = (id: string, metingId: string, lidId: string) => ({
  id, scanUitvoeringId: metingId, organisatieLidId: lidId, status: "afgerond", antwoorden: {},
  opmerkingenPerBouwblok: {}, uitgenodigdOp: "2026-01-01", gestartOp: null, afgerondOp: "2026-01-02", bewaarVerlengdTot: null,
});
const meting = (id: string, orgId: string, label: string, invullingen: Rij[], assessmentId = "A") => ({
  id, organisatieId: orgId, assessmentId, label, aangemaaktOp: "2026-01-01", invullingen,
});
const org = (id: string, leden: Rij[], scanUitvoeringen: Rij[]) => ({
  id, naam: id, kenmerken: {}, aangemaaktOp: "x", aangemaaktDoor: null, toegewezenAan: [], leden, scanUitvoeringen,
});
const zet = (orgs: Rij[]) => opslag.set(KEY, JSON.stringify(orgs));
const laad = () => JSON.parse(opslag.get(KEY)!) as ReturnType<typeof org>[];

describe("hele respondent verplaatsen", () => {
  it("neemt alle scans mee, maakt een ontbrekende Meting aan en wist Lead-koppelingen", () => {
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl", { leadMetingIds: ["M1"] })], [
        meting("M1", "O1", "Nulmeting", [inv("I1", "M1", "L1")]),
        meting("M2", "O1", "Vervolg", [inv("I2", "M2", "L1")]),
      ]),
      org("O2", [], [meting("D1", "O2", "Nulmeting", [])]),
    ]);
    const r = db.verplaatsRespondentNaarOrganisatie("L1", "O2", []);
    expect(r).toMatchObject({ ok: true, verplaatst: 2, overgeslagen: [] });
    const o = laad();
    expect(o[0].leden).toHaveLength(0);
    expect(o[1].leden).toHaveLength(1);
    expect(o[1].leden[0].leadMetingIds).toEqual([]);
    expect(o[1].scanUitvoeringen.find((s) => s.id === "D1")!.invullingen).toHaveLength(1);
    expect(o[1].scanUitvoeringen).toHaveLength(2);
    expect(o[0].scanUitvoeringen.every((s) => (s.invullingen as unknown[]).length === 0)).toBe(true);
  });

  it("slaat bij samenvoegen een scan over als de bestaande respondent in die Meting al een scan heeft", () => {
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl")], [
        meting("M1", "O1", "Nulmeting", [inv("I1", "M1", "L1")]),
        meting("M2", "O1", "Vervolg", [inv("I2", "M2", "L1")]),
      ]),
      org("O2", [lid("L9", "O2", "a@x.nl")], [meting("D1", "O2", "Nulmeting", [inv("I9", "D1", "L9")])]),
    ]);
    const r = db.verplaatsRespondentNaarOrganisatie("L1", "O2", [], "L9");
    expect(r.verplaatst).toBe(1);
    expect(r.overgeslagen).toHaveLength(1);
    expect(r.respondentVerwijderd).toBe(false);
    const o = laad();
    expect(o[0].leden).toHaveLength(1);
    expect(o[0].scanUitvoeringen[0].invullingen).toHaveLength(1);
  });

  it("verwijdert de bronrespondent bij samenvoegen zonder overgeslagen scans", () => {
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl")], [meting("M1", "O1", "Nulmeting", [inv("I1", "M1", "L1")])]),
      org("O2", [lid("L9", "O2", "a@x.nl")], [meting("D1", "O2", "Anders", [])]),
    ]);
    const r = db.verplaatsRespondentNaarOrganisatie("L1", "O2", [{ bronMetingId: "M1", doelMetingId: "D1" }], "L9");
    expect(r).toMatchObject({ verplaatst: 1, respondentVerwijderd: true });
    const o = laad();
    expect(o[0].leden).toHaveLength(0);
    expect((o[1].scanUitvoeringen[0].invullingen as Rij[])[0].organisatieLidId).toBe("L9");
  });

  it("breekt af zonder iets te wijzigen bij een doel-Meting met een ander Assessment-type", () => {
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl")], [meting("M1", "O1", "Nulmeting", [inv("I1", "M1", "L1")])]),
      org("O2", [], [meting("D1", "O2", "Nulmeting", [], "B")]),
    ]);
    const voor = opslag.get(KEY);
    const r = db.verplaatsRespondentNaarOrganisatie("L1", "O2", [{ bronMetingId: "M1", doelMetingId: "D1" }]);
    expect(r.ok).toBe(false);
    expect(opslag.get(KEY)).toBe(voor);
  });

  it("maakt een nieuwe Meting met een eigen label", () => {
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl")], [meting("M1", "O1", "Nulmeting", [inv("I1", "M1", "L1")])]),
      org("O2", [], []),
    ]);
    const r = db.verplaatsRespondentNaarOrganisatie("L1", "O2", [
      { bronMetingId: "M1", doelMetingId: null, nieuwLabel: "Eigen label" },
    ]);
    expect(r.ok).toBe(true);
    expect(laad()[1].scanUitvoeringen.some((s) => s.label === "Eigen label" && (s.invullingen as unknown[]).length === 1)).toBe(true);
  });
});

describe("respondent bewerken met samenvoegen", () => {
  it("hangt scans onder de bestaande respondent en laat een conflicterende scan bij de bron staan", () => {
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl"), lid("L2", "O1", "b@x.nl")], [
        meting("M1", "O1", "N", [inv("I1", "M1", "L1"), inv("I2", "M1", "L2")]),
        meting("M2", "O1", "V", [inv("I3", "M2", "L1")]),
      ]),
    ]);
    const r = db.bewerkRespondent("L1", { naam: "x", email: "b@x.nl", functie: "", team: "", notities: "" }, "L2");
    expect(r).toMatchObject({ verplaatst: 1, respondentVerwijderd: false });
    expect(r!.overgeslagen).toHaveLength(1);
    const o = laad();
    expect(o[0].leden).toHaveLength(2);
    expect((o[0].scanUitvoeringen[1].invullingen as Rij[])[0].organisatieLidId).toBe("L2");
  });
});

describe("respons naar andere Meting", () => {
  it("weigert dezelfde Meting en een Meting waar de respondent al een scan heeft", () => {
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl")], [
        meting("M1", "O1", "N", [inv("I1", "M1", "L1")]),
        meting("M2", "O1", "V", [inv("I2", "M2", "L1")]),
      ]),
    ]);
    expect(db.verplaatsResponsNaarMeting("I1", "M1").ok).toBe(false);
    expect(db.verplaatsResponsNaarMeting("I1", "M2").ok).toBe(false);
    expect(db.verplaatsResponsNaarMeting("I1", null, "Nieuw")).toEqual({ ok: true });
  });
});
