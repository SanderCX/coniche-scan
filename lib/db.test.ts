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
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
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

describe("import alleen voor een Admin", () => {
  const gebruiker = (id: string, rol: string) => ({ id, email: `${id}@x.nl`, naam: id, wachtwoord: "x", rol, actief: true, laatstIngelogdOp: null, aangemaaktOp: "x" });
  const keuze = { rij: { organisatieNaam: "Nieuw", respondentEmail: "a@x.nl", respondentNaam: "", respondentFunctie: "", respondentTeam: "", respondentNotities: "", meetingLabel: "Legacy-import 2026", status: "afgerond", uitgenodigdOp: "x", gestartOp: null, afgerondOp: null, antwoorden: {}, opmerkingenPerBouwblok: {}, rijNummer: 1 }, assessmentId: "A", organisatieId: null };

  it("weigert een importverzoek van een Consultant en schrijft niets weg", () => {
    opslag.set("coniche-scan:gebruikers", JSON.stringify([gebruiker("c1", "consultant"), gebruiker("a1", "admin")]));
    zet([]);
    const r = db.voerLegacyImportUit([keuze as never], "c1");
    expect(r).toMatchObject({ geimporteerd: 0, geweigerd: true });
    expect(laad()).toHaveLength(0);
  });

  it("een Admin mag wel importeren", () => {
    opslag.set("coniche-scan:gebruikers", JSON.stringify([gebruiker("a1", "admin")]));
    zet([]);
    expect(db.voerLegacyImportUit([keuze as never], "a1").geimporteerd).toBe(1);
  });
});

describe("data-integriteit", () => {
  // Beschadigde data: O1 heeft een scan zonder Respondent, een scan zonder Meting, een Respondent en een Meting zonder Organisatie en een Lead met een onbestaande Meting.
  const beschadigd = () =>
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl", { leadMetingIds: ["M1", "WEG"] }), lid("L2", "GEENORG", "b@x.nl")], [
        meting("M1", "O1", "Nulmeting", [inv("I1", "M1", "L1"), inv("I2", "M1", "NIEMAND"), { ...inv("I3", "M1", "L2"), scanUitvoeringId: "WEGMETING" }]),
        meting("M2", "GEENORG", "Wees", []),
      ]),
    ]);
  const aantallen = () => Object.fromEntries(db.controleerIntegriteit().map((c) => [c.id, c.vondsten.length]));

  it("vindt per controle de verwijzingen naar een niet-bestaand record", () => {
    beschadigd();
    expect(aantallen()).toEqual({
      "scan-zonder-respondent": 1,
      "scan-zonder-meting": 1,
      "respondent-zonder-organisatie": 1,
      "meting-zonder-organisatie": 1,
      "lead-zonder-meting": 1,
    });
    expect(db.totaalVondsten(db.controleerIntegriteit())).toBe(5);
  });

  it("gezonde data heeft geen vondsten", () => {
    zet([org("O1", [lid("L1", "O1", "a@x.nl")], [meting("M1", "O1", "Nulmeting", [inv("I1", "M1", "L1")])])]);
    expect(db.totaalVondsten(db.controleerIntegriteit())).toBe(0);
  });

  it("koppelen en verwijderen lossen elke vondst op, en loggen met 'vanuit Data-integriteit'", () => {
    beschadigd();
    expect(db.koppelWeesScanAanRespondent("I2", "L1").ok).toBe(false); // L1 heeft al een scan in M1
    db.verwijderScanInvullingen(["I2"]);
    expect(db.koppelWeesScanAanMeting("I3", "M1").ok).toBe(true);
    expect(db.koppelWeesRespondentAanOrganisatie("L2", "O1").ok).toBe(true);
    expect(db.koppelWeesMetingAanOrganisatie("M2", "O1").ok).toBe(true);
    expect(db.verwijderLeadVerwijzing("L1", "WEG").ok).toBe(true);
    expect(db.totaalVondsten(db.controleerIntegriteit())).toBe(0);
    const log = JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; details: Record<string, unknown> | null }[];
    expect(log.find((e) => e.actie === "respons.metingVerplaatst")?.details).toMatchObject({ vanuit: "Data-integriteit" });
    expect(log.find((e) => e.actie === "respondent.leadVerwijzingVerwijderd")?.details).toMatchObject({ vanuit: "Data-integriteit" });
  });
});

describe("conflict oplossen: scan aan een andere Respondent koppelen", () => {
  const stel = () =>
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl"), lid("L2", "O1", "b@x.nl")], [
        meting("M1", "O1", "Nulmeting", [inv("I1", "M1", "L1")]),
        meting("M2", "O1", "Vervolg", [inv("I2", "M2", "L1")]),
      ]),
    ]);

  it("maakt een nieuwe Respondent met eigen e-mailadres en toegangscode, alleen die ene scan gaat mee", () => {
    stel();
    const r = db.koppelScanAanAndereRespondent("I2", { soort: "nieuw", invoer: { naam: "N", email: " Nieuw@X.nl ", functie: "", team: "", notities: "" } });
    expect(r.ok).toBe(true);
    const o = laad()[0];
    expect(o.leden).toHaveLength(3);
    const nieuw = o.leden.find((l) => l.email === "nieuw@x.nl")!;
    expect(nieuw.toegangscode).toBeTruthy();
    expect((o.scanUitvoeringen[1].invullingen as { organisatieLidId: string }[])[0].organisatieLidId).toBe(nieuw.id);
    expect((o.scanUitvoeringen[0].invullingen as { organisatieLidId: string }[])[0].organisatieLidId).toBe("L1");
  });

  it("weigert een e-mailadres dat al bij een Respondent van de organisatie hoort, en een Respondent met al een scan in die Meting", () => {
    stel();
    expect(db.koppelScanAanAndereRespondent("I2", { soort: "nieuw", invoer: { naam: "", email: "b@x.nl", functie: "", team: "", notities: "" } }).ok).toBe(false);
    expect(db.koppelScanAanAndereRespondent("I2", { soort: "nieuw", invoer: { naam: "", email: "", functie: "", team: "", notities: "" } }).ok).toBe(false);
    expect(db.koppelScanAanAndereRespondent("I2", { soort: "bestaand", lidId: "L1" }).ok).toBe(false);
  });

  it("hangt de scan aan een bestaande Respondent en logt respons.respondentGewijzigd zonder persoonsgegevens", () => {
    stel();
    expect(db.koppelScanAanAndereRespondent("I2", { soort: "bestaand", lidId: "L2" }).ok).toBe(true);
    expect((laad()[0].scanUitvoeringen[1].invullingen as { organisatieLidId: string }[])[0].organisatieLidId).toBe("L2");
    const log = JSON.parse(opslag.get("coniche-scan:audit") ?? "[]");
    expect(log.some((e: { actie: string }) => e.actie === "respons.respondentGewijzigd")).toBe(true);
    expect(JSON.stringify(log)).not.toContain("b@x.nl");
  });

  it("een verplaatsing die op dit conflict stuit, meldt het doel-Meting-id", () => {
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl")], [
        meting("M1", "O1", "Nulmeting", [inv("I1", "M1", "L1")]),
        meting("M2", "O1", "Vervolg", [inv("I2", "M2", "L1")]),
      ]),
    ]);
    const r = db.verplaatsResponsNaarMeting("I2", "M1");
    expect(r.ok).toBe(false);
    expect(r.conflict).toEqual({ doelMetingId: "M1" });
  });
});

describe("audit-log bij beheeracties", () => {
  const AUDIT_KEY = "coniche-scan:audit";
  const audit = () => JSON.parse(opslag.get(AUDIT_KEY) ?? "[]") as { actie: string; details: Record<string, unknown> | null }[];

  it("verplaatsen logt de actie met organisatienamen en zonder persoonsgegevens", () => {
    zet([
      org("O1", [lid("L1", "O1", "geheim@x.nl")], [meting("M1", "O1", "Nulmeting", [inv("I1", "M1", "L1")])]),
      org("O2", [], []),
    ]);
    db.verplaatsRespondentNaarOrganisatie("L1", "O2", []);
    const events = audit();
    const verplaatst = events.find((e) => e.actie === "respondent.verplaatst");
    expect(verplaatst?.details).toMatchObject({ bronOrganisatieNaam: "O1", doelOrganisatieNaam: "O2", aantalScans: 1 });
    expect(JSON.stringify(events)).not.toContain("geheim@x.nl");
  });

  it("een gewijzigde e-mail wordt gelogd als veldnaam, niet als waarde", () => {
    zet([org("O1", [lid("L1", "O1", "oud@x.nl", { naam: "Jan" })], [])]);
    db.bewerkRespondent("L1", { naam: "Jan", email: "nieuw@x.nl", functie: "", team: "", notities: "" });
    const bewerkt = audit().find((e) => e.actie === "respondent.bewerkt");
    expect(bewerkt?.details?.velden).toEqual(["e-mail"]);
    expect(JSON.stringify(audit())).not.toContain("nieuw@x.nl");
  });

  it("organisatie verwijderen logt de naam en de aantallen", () => {
    zet([org("O1", [lid("L1", "O1", "a@x.nl")], [meting("M1", "O1", "Nulmeting", [inv("I1", "M1", "L1")])])]);
    db.verwijderOrganisaties(["O1"]);
    const e = audit().find((x) => x.actie === "organisatie.verwijderd");
    expect(e?.details).toMatchObject({ organisatieNaam: "O1", aantalRespondenten: 1, aantalMetingen: 1, aantalScans: 1 });
  });
});

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
