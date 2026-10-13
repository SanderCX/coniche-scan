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
  const keuze = { rij: { organisatieNaam: "Nieuw", respondentEmail: "a@x.nl", respondentNaam: "", respondentFunctie: "", respondentTeam: "", scanNotitie: "", meetingLabel: "Legacy-import 2026", status: "afgerond", uitgenodigdOp: "x", gestartOp: null, afgerondOp: null, antwoorden: {}, opmerkingenPerBouwblok: {}, rijNummer: 1 }, assessmentId: "A", organisatieId: null };

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

  it("zet aangemaaktOp op het importmoment en niet op de datum uit het bestand, en logt of de Respondent nieuw was", () => {
    opslag.set("coniche-scan:gebruikers", JSON.stringify([gebruiker("a1", "admin")]));
    zet([]);
    const voor = Date.now();
    db.voerLegacyImportUit([{ ...keuze, rij: { ...keuze.rij, uitgenodigdOp: "2020-01-01T00:00:00.000Z" } } as never], "a1", "g-1");
    const invulling = (laad() as unknown as { scanUitvoeringen: { invullingen: { uitgenodigdOp: string; aangemaaktOp: string }[] }[] }[])[0].scanUitvoeringen[0].invullingen[0];
    expect(invulling.uitgenodigdOp).toBe("2020-01-01T00:00:00.000Z");
    expect(new Date(invulling.aangemaaktOp).getTime()).toBeGreaterThanOrEqual(voor);
    const log = JSON.parse((opslag.get("coniche-scan:audit") as string | undefined) ?? "[]") as { actie: string; details: Record<string, unknown> | null }[];
    const geimporteerd = log.find((e) => e.actie === "scan.geimporteerd");
    expect(geimporteerd?.details?.respondentNieuw).toBe(true);
    expect(JSON.stringify(geimporteerd?.details)).not.toContain("a@x.nl");
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
    // "Scan zonder Meting" komt hier niet meer voor: De Meting waarin een scan staat is de juiste, en een verwijzing naar een
    // andere Meting wordt bij het laden hersteld (zie "scanverwijzingen" hieronder).
    expect(aantallen()).toEqual({
      "scan-zonder-respondent": 1,
      "scan-zonder-meting": 0,
      "respondent-zonder-organisatie": 1,
      "meting-zonder-organisatie": 1,
      "lead-zonder-meting": 1,
    });
    expect(db.totaalVondsten(db.controleerIntegriteit())).toBe(4);
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

describe("scanverwijzingen na verplaatsen", () => {
  const scanVan = (orgId: string, scanId: string) => {
    for (const m of laad().find((o) => o.id === orgId)!.scanUitvoeringen as unknown as { id: string; invullingen: { id: string; scanUitvoeringId: string }[] }[]) {
      const i = m.invullingen.find((x) => x.id === scanId);
      if (i) return { metingId: m.id, verwijstNaar: i.scanUitvoeringId };
    }
    return null;
  };

  it("een scan naar een andere Meting verplaatsen werkt beide verwijzingen bij", () => {
    zet([org("O1", [lid("L1", "O1", "a@x.nl")], [meting("M1", "O1", "Een", [inv("I1", "M1", "L1")]), meting("M2", "O1", "Twee", [])])]);
    expect(db.verplaatsResponsNaarMeting("I1", "M2")).toMatchObject({ ok: true });
    expect(scanVan("O1", "I1")).toEqual({ metingId: "M2", verwijstNaar: "M2" });
    expect(db.totaalVondsten(db.controleerIntegriteit())).toBe(0);
  });

  it("een scan naar een andere organisatie verplaatsen werkt beide verwijzingen bij, ook in een nieuwe Meting", () => {
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl")], [meting("M1", "O1", "Een", [inv("I1", "M1", "L1")])]),
      org("O2", [], []),
    ]);
    expect(db.verplaatsResponsNaarOrganisatie("I1", "O2", null, "Nieuw")).toMatchObject({ ok: true });
    const na = scanVan("O2", "I1")!;
    expect(na.verwijstNaar).toBe(na.metingId);
    expect(db.totaalVondsten(db.controleerIntegriteit())).toBe(0);
  });

  it("bestaande data met een scan die naar een andere Meting verwijst wordt bij het laden hersteld", () => {
    zet([org("O1", [lid("L1", "O1", "a@x.nl")], [meting("M1", "O1", "Een", [{ ...inv("I1", "M1", "L1"), scanUitvoeringId: "OUDE-METING" }])])]);
    expect(db.totaalVondsten(db.controleerIntegriteit())).toBe(0);
    expect(db.getScanInvulling("I1")?.scanUitvoering.id).toBe("M1");
  });
});

describe("import: een Meting per bronnaam en één scan per Respondent per Meting", () => {
  const gebruiker = { id: "a1", email: "a1@x.nl", naam: "a1", wachtwoord: "x", rol: "admin", actief: true, laatstIngelogdOp: null, aangemaaktOp: "x" };
  const rij = (bronnaam: string, email: string, extra: Rij = {}) => ({
    organisatieNaam: bronnaam, respondentEmail: email, respondentNaam: "", respondentFunctie: "", respondentTeam: "", scanNotitie: "",
    meetingLabel: "Legacy-import 2026", status: "afgerond", uitgenodigdOp: "2026-01-14T10:00:00.000Z", gestartOp: "2026-01-14T10:00:00.000Z",
    afgerondOp: null, antwoorden: {}, opmerkingenPerBouwblok: {}, rijNummer: 1, ...extra,
  });
  const keuze = (r: Rij, extra: Rij = {}) => ({ rij: r, assessmentId: "A", organisatieId: "O1", ...extra });
  const labels = () => (laad()[0].scanUitvoeringen as unknown as { label: string; invullingen: unknown[] }[]).map((m) => `${m.label} (${m.invullingen.length})`);
  const opzet = () => {
    opslag.set("coniche-scan:gebruikers", JSON.stringify([gebruiker]));
    zet([org("O1", [], [])]);
  };

  it("twee bronnamen in één organisatie krijgen elk een eigen Meting, met de bronnaam achter het label", () => {
    opzet();
    db.voerLegacyImportUit(
      [
        keuze(rij("Onderdeel A", "a@x.nl"), { bronnaam: "Onderdeel A", bronnaamInLabel: true }),
        keuze(rij("Onderdeel B", "b@x.nl"), { bronnaam: "Onderdeel B", bronnaamInLabel: true }),
        keuze(rij("Onderdeel A", "c@x.nl"), { bronnaam: "Onderdeel A", bronnaamInLabel: true }),
      ] as never,
      "a1"
    );
    expect(labels().sort()).toEqual(["Legacy-import 2026 Onderdeel A (2)", "Legacy-import 2026 Onderdeel B (1)"]);
  });

  it("bij één bronnaam blijft het label zoals het was", () => {
    opzet();
    db.voerLegacyImportUit([keuze(rij("Onderdeel A", "a@x.nl"), { bronnaam: "Onderdeel A", bronnaamInLabel: false }), keuze(rij("Onderdeel A", "b@x.nl"), { bronnaam: "Onderdeel A" })] as never, "a1");
    expect(labels()).toEqual(["Legacy-import 2026 (2)"]);
  });

  it("dezelfde Respondent twee keer in dezelfde Meting: De tweede scan krijgt een eigen Meting met de datum, en bij dezelfde datum een volgnummer", () => {
    opzet();
    db.voerLegacyImportUit(
      [keuze(rij("Org", "a@x.nl")), keuze(rij("Org", "A@X.nl ")), keuze(rij("Org", "a@x.nl")), keuze(rij("Org", "b@x.nl"))] as never,
      "a1"
    );
    expect(labels().sort()).toEqual([
      "Legacy-import 2026 (14-01-2026) (2) (1)",
      "Legacy-import 2026 (14-01-2026) (1)",
      "Legacy-import 2026 (2)",
    ].sort());
    // Nooit twee scans van dezelfde Respondent in één Meting.
    for (const m of laad()[0].scanUitvoeringen as unknown as { invullingen: { organisatieLidId: string }[] }[]) {
      const ids = m.invullingen.map((i) => i.organisatieLidId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("een latere, aparte aanroep sluit aan bij de Metingen die de import eerder aanmaakte, ook bij een variant met datum", () => {
    opzet();
    const eerste = db.voerLegacyImportUit([keuze(rij("Org", "a@x.nl")), keuze(rij("Org", "a@x.nl"))] as never, "a1");
    const bekend: Record<string, string> = {};
    eerste.rijResultaten.forEach((r) => (bekend[r.label] = r.scanUitvoeringId));
    db.voerLegacyImportUit([keuze(rij("Org", "b@x.nl"), { bekendeMetingen: bekend }), keuze(rij("Org", "a@x.nl"), { bekendeMetingen: bekend })] as never, "a1");
    // b@x.nl komt in de eerste Meting, a@x.nl heeft in beide al een scan en krijgt een derde Meting met een volgnummer.
    expect(labels().sort()).toEqual([
      "Legacy-import 2026 (14-01-2026) (1)",
      "Legacy-import 2026 (14-01-2026) (2) (1)",
      "Legacy-import 2026 (2)",
    ].sort());
  });
});

describe("import: ronde en onderdeel", () => {
  const gebruiker = { id: "a1", email: "a1@x.nl", naam: "a1", wachtwoord: "x", rol: "admin", actief: true, laatstIngelogdOp: null, aangemaaktOp: "x" };
  const rij = (bronnaam: string, email: string, extra: Rij = {}) => ({
    organisatieNaam: bronnaam, respondentEmail: email, respondentNaam: "", respondentFunctie: "", respondentTeam: "", scanNotitie: "",
    meetingLabel: "Legacy-import 2026", status: "afgerond", uitgenodigdOp: "2026-01-14T10:00:00.000Z", gestartOp: "2026-01-14T10:00:00.000Z",
    afgerondOp: null, antwoorden: {}, opmerkingenPerBouwblok: {}, rijNummer: 1, ...extra,
  });
  const keuze = (r: Rij, extra: Rij = {}) => ({ rij: r, assessmentId: "A", organisatieId: "O1", ...extra });
  type Uit = { rondes?: { id: string; label: string; aangemaaktOp: string }[]; scanUitvoeringen: { label: string; rondeId?: string; onderdeel?: string }[] };
  const uit = () => laad()[0] as unknown as Uit;
  const opzet = () => {
    opslag.set("coniche-scan:gebruikers", JSON.stringify([gebruiker]));
    zet([org("O1", [], [])]);
  };

  it("een import van drie onderdelen geeft één ronde met drie Metingen, met de bronnaam als onderdeel", () => {
    opzet();
    db.voerLegacyImportUit(
      ["Onderdeel A", "Onderdeel B", "Onderdeel C"].map((n, i) => keuze(rij(n, `r${i}@x.nl`), { bronnaam: n, bronnaamInLabel: true })) as never,
      "a1"
    );
    const o = uit();
    expect(o.rondes).toHaveLength(1);
    expect(o.rondes![0].label).toBe("Legacy-import 2026");
    expect(o.scanUitvoeringen.map((m) => m.onderdeel).sort()).toEqual(["Onderdeel A", "Onderdeel B", "Onderdeel C"]);
    expect(new Set(o.scanUitvoeringen.map((m) => m.rondeId)).size).toBe(1);
    // Het label van de Meting blijft zoals het was.
    expect(o.scanUitvoeringen.map((m) => m.label).sort()[0]).toBe("Legacy-import 2026 Onderdeel A");
  });

  it("bij één bronnaam is het onderdeel Hele organisatie", () => {
    opzet();
    db.voerLegacyImportUit([keuze(rij("Org", "a@x.nl"), { bronnaam: "Org", bronnaamInLabel: false })] as never, "a1");
    expect(uit().scanUitvoeringen[0].onderdeel).toBe("Hele organisatie");
  });

  it("een door de beheerder ingesteld onderdeel gaat voor de bronnaam", () => {
    opzet();
    db.voerLegacyImportUit(
      [keuze(rij("Org A", "a@x.nl"), { bronnaam: "Org A", bronnaamInLabel: true, onderdeel: "Team Noord" })] as never,
      "a1"
    );
    expect(uit().scanUitvoeringen[0].onderdeel).toBe("Team Noord");
  });

  it("de kolommen ronde en onderdeel van de eigen export gaan voor de afleiding", () => {
    opzet();
    db.voerLegacyImportUit(
      [keuze(rij("Org", "a@x.nl", { meetingLabel: "Import Nulmeting", ronde: "0-meting", onderdeel: "Team A" }))] as never,
      "a1"
    );
    const o = uit();
    expect(o.rondes![0].label).toBe("0-meting");
    expect(o.scanUitvoeringen[0]).toMatchObject({ label: "Import Nulmeting", onderdeel: "Team A" });
  });

  it("dezelfde Respondent twee keer: De tweede Meting komt in een eigen ronde met de datum, met de oudste ronde eerst", () => {
    opzet();
    db.voerLegacyImportUit(
      [
        keuze(rij("Org", "a@x.nl", { gestartOp: "2026-06-01T10:00:00.000Z", uitgenodigdOp: "2026-06-01T10:00:00.000Z" })),
        keuze(rij("Org", "a@x.nl", { gestartOp: "2026-01-14T10:00:00.000Z" })),
      ] as never,
      "a1"
    );
    const o = uit();
    expect(o.rondes!.map((r) => r.label).sort()).toEqual(["Legacy-import 2026", "Legacy-import 2026 (14-01-2026)"].sort());
    const oudste = o.rondes!.find((r) => r.label === "Legacy-import 2026 (14-01-2026)")!;
    const eerste = o.rondes!.find((r) => r.label === "Legacy-import 2026")!;
    // De rij met de oudste datum staat in de ronde die als eerste is aangemaakt, hoewel de bestandsvolgorde andersom is.
    expect(oudste.aangemaaktOp < eerste.aangemaaktOp).toBe(true);
  });

  it("een latere, aparte aanroep sluit aan bij dezelfde ronde", () => {
    opzet();
    const eerste = db.voerLegacyImportUit([keuze(rij("Org", "a@x.nl"))] as never, "a1");
    const bekendeRondes: Record<string, string> = {};
    const bekendeMetingen: Record<string, string> = {};
    eerste.rijResultaten.forEach((r) => {
      bekendeRondes[r.rondeLabel] = r.rondeId;
      bekendeMetingen[r.label] = r.scanUitvoeringId;
    });
    // Een andere Respondent sluit aan bij dezelfde Meting en dus dezelfde ronde. Dezelfde Respondent krijgt een eigen Meting.
    db.voerLegacyImportUit([keuze(rij("Org", "b@x.nl"), { bekendeRondes, bekendeMetingen })] as never, "a1");
    expect(uit().rondes).toHaveLength(1);
    expect(uit().scanUitvoeringen).toHaveLength(1);
  });
});

describe("notitie per scan", () => {
  const gebruiker = { id: "a1", email: "a1@x.nl", naam: "a1", wachtwoord: "x", rol: "admin", actief: true, laatstIngelogdOp: null, aangemaaktOp: "x" };
  const rij = (email: string, notitie: string, extra: Rij = {}) => ({
    organisatieNaam: "Org", respondentEmail: email, respondentNaam: "", respondentFunctie: "", respondentTeam: "", scanNotitie: notitie,
    meetingLabel: "Legacy-import 2026", status: "afgerond", uitgenodigdOp: "2026-01-14T10:00:00.000Z", gestartOp: "2026-01-14T10:00:00.000Z",
    afgerondOp: null, antwoorden: {}, opmerkingenPerBouwblok: {}, rijNummer: 1, ...extra,
  });
  const keuze = (r: Rij) => ({ rij: r, assessmentId: "A", organisatieId: "O1" });
  type Uit = { leden: { notities: string }[]; scanUitvoeringen: { invullingen: { notitie?: string | null }[] }[] };

  it("elke rij houdt zijn eigen notitie op zijn scan en er wordt niets aan de Respondent geplakt", () => {
    opslag.set("coniche-scan:gebruikers", JSON.stringify([gebruiker]));
    zet([org("O1", [], [])]);
    // Dezelfde Respondent (de invuller) in drie rijen, met elk een andere notitie.
    db.voerLegacyImportUit([keuze(rij("coniche@x.nl", "Jan Jansen")), keuze(rij("coniche@x.nl", "Piet Pietersen")), keuze(rij("coniche@x.nl", ""))] as never, "a1");
    const o = laad()[0] as unknown as Uit;
    expect(o.leden).toHaveLength(1);
    expect(o.leden[0].notities).toBe("");
    const notities = o.scanUitvoeringen.flatMap((m) => m.invullingen.map((i) => i.notitie ?? null)).sort();
    expect(notities).toEqual([null, "Jan Jansen", "Piet Pietersen"].sort());
  });

  it("een bestaande Respondent houdt zijn eigen notities, ook als een rij een notitie heeft", () => {
    opslag.set("coniche-scan:gebruikers", JSON.stringify([gebruiker]));
    zet([org("O1", [lid("L1", "O1", "coniche@x.nl", { notities: "Eigen notitie" })], [])]);
    db.voerLegacyImportUit([keuze(rij("coniche@x.nl", "Jan Jansen"))] as never, "a1");
    expect((laad()[0] as unknown as Uit).leden[0].notities).toBe("Eigen notitie");
  });
});

describe("scans samenbrengen in één Meting", () => {
  type Uit = {
    rondes?: { id: string; label: string }[];
    leden: { id: string; email: string; naam: string | null; toegangscode: string }[];
    scanUitvoeringen: { id: string; label: string; rondeId?: string; onderdeel?: string; invullingen: { id: string; organisatieLidId: string; scanUitvoeringId: string; antwoorden: Record<string, number> }[] }[];
  };
  const uit = () => laad()[0] as unknown as Uit;
  const basis = () => {
    // Tien scans van één invuller in tien losse import-Metingen, zoals na het importeren van tien bestanden.
    const metingen = [1, 2, 3].map((n) => meting(`M${n}`, "O1", `Import ${n}`, [{ ...inv(`I${n}`, `M${n}`, "L1"), antwoorden: { v: n }, notitie: `Persoon ${n}` }]));
    zet([org("O1", [lid("L1", "O1", "coniche@x.nl")], metingen)]);
  };
  const regels = (...ids: string[]) => ids.map((invullingId) => ({ invullingId, respondent: { soort: "houden" as const } }));

  it("zet de scans in één nieuwe Meting in een nieuwe ronde, met per scan een nieuwe Respondent", () => {
    basis();
    const r = db.brengScansSamen(
      "O1",
      { soort: "nieuw", label: "Volwassenheid", onderdeel: "Team Service", nieuweRondeLabel: "0-meting" },
      [1, 2, 3].map((n) => ({
        invullingId: `I${n}`,
        respondent: { soort: "nieuw" as const, naam: `Persoon ${n}`, email: `p${n}@x.nl`, functie: "", team: "" },
      }))
    );
    expect(r).toMatchObject({ ok: true, aantal: 3, doelLabel: "Volwassenheid", rondeLabel: "0-meting" });
    const o = uit();
    const doel = o.scanUitvoeringen.find((m) => m.label === "Volwassenheid")!;
    expect(doel).toMatchObject({ onderdeel: "Team Service" });
    expect(doel.invullingen).toHaveLength(3);
    expect(new Set(doel.invullingen.map((i) => i.organisatieLidId)).size).toBe(3);
    // Beide verwijzingen kloppen en de antwoorden zijn onaangeraakt.
    expect(doel.invullingen.every((i) => i.scanUitvoeringId === doel.id)).toBe(true);
    expect(doel.invullingen.map((i) => i.antwoorden.v).sort()).toEqual([1, 2, 3]);
    expect(o.rondes!.map((x) => x.label)).toEqual(["0-meting"]);
    expect(doel.rondeId).toBe(o.rondes![0].id);
    // De Respondenten zijn nieuw en hebben een eigen toegangscode, de bron-Metingen blijven leeg staan.
    expect(o.leden).toHaveLength(4);
    expect(new Set(o.leden.map((l) => l.toegangscode)).size).toBe(4);
    expect(o.scanUitvoeringen.filter((m) => m.invullingen.length === 0)).toHaveLength(3);
    expect((r as { legeMetingen: unknown[] }).legeMetingen).toHaveLength(3);
  });

  it("alles of niets: Dezelfde Respondent twee keer in de doel-Meting verandert niets", () => {
    basis();
    const voor = opslag.get(KEY);
    const r = db.brengScansSamen("O1", { soort: "nieuw", label: "Doel" }, regels("I1", "I2"));
    expect(r.ok).toBe(false);
    expect((r as { fouten?: Record<string, string> }).fouten).toMatchObject({ I1: expect.stringContaining("al een scan"), I2: expect.stringContaining("al een scan") });
    expect(opslag.get(KEY)).toBe(voor);
  });

  it("een scan die er al staat telt mee in de controle", () => {
    basis();
    // M1 is de doel-Meting: L1 heeft daar al I1. Scan I2 houdt L1 en botst dus.
    const r = db.brengScansSamen("O1", { soort: "bestaand", metingId: "M1" }, regels("I2"));
    expect(r.ok).toBe(false);
    // Met een nieuwe Respondent kan het wel, en I1 blijft staan.
    const ok = db.brengScansSamen("O1", { soort: "bestaand", metingId: "M1" }, [
      { invullingId: "I2", respondent: { soort: "nieuw", naam: "N", email: "n@x.nl", functie: "", team: "" } },
    ]);
    expect(ok).toMatchObject({ ok: true, aantal: 1 });
    expect(uit().scanUitvoeringen.find((m) => m.id === "M1")!.invullingen.map((i) => i.id).sort()).toEqual(["I1", "I2"]);
  });

  it("een e-mailadres dat al in gebruik is, of dat dubbel voorkomt, wordt geweigerd", () => {
    basis();
    const nieuw = (invullingId: string, email: string) => ({ invullingId, respondent: { soort: "nieuw" as const, naam: "", email, functie: "", team: "" } });
    const bestaand = db.brengScansSamen("O1", { soort: "nieuw", label: "Doel" }, [nieuw("I1", " Coniche@X.nl ")]);
    expect(bestaand.ok).toBe(false);
    const dubbel = db.brengScansSamen("O1", { soort: "nieuw", label: "Doel" }, [nieuw("I1", "a@x.nl"), nieuw("I2", "A@x.nl")]);
    expect(dubbel.ok).toBe(false);
    const leeg = db.brengScansSamen("O1", { soort: "nieuw", label: "Doel" }, [nieuw("I1", "")]);
    expect(leeg.ok).toBe(false);
    expect(uit().leden).toHaveLength(1);
  });

  it("scans van verschillende Assessments kunnen niet samen, en een bezette combinatie in de ronde wijst naar die Meting", () => {
    zet([
      org(
        "O1",
        [lid("L1", "O1", "a@x.nl"), lid("L2", "O1", "b@x.nl")],
        [meting("M1", "O1", "Een", [inv("I1", "M1", "L1")], "A"), meting("M2", "O1", "Twee", [inv("I2", "M2", "L2")], "B")]
      ),
    ]);
    expect(db.brengScansSamen("O1", { soort: "nieuw", label: "Doel" }, regels("I1", "I2"))).toMatchObject({ ok: false });

    zet([
      {
        ...org("O1", [lid("L1", "O1", "a@x.nl")], [{ ...meting("M1", "O1", "Een", [inv("I1", "M1", "L1")]), rondeId: "R1", onderdeel: "Team A" }, meting("M2", "O1", "Twee", [])]),
        rondes: [{ id: "R1", organisatieId: "O1", label: "0-meting", aangemaaktOp: "2026-01-01" }],
      },
    ]);
    const r = db.brengScansSamen("O1", { soort: "nieuw", label: "Nieuw", onderdeel: "Team A", rondeId: "R1" }, regels("I1"));
    expect(r).toMatchObject({ ok: false, reden: expect.stringContaining('"Een"') });
  });

  it("logt per bron-Meting en per gewijzigde Respondent, met één groep en zonder persoonsgegevens", () => {
    basis();
    db.brengScansSamen("O1", { soort: "nieuw", label: "Doel" }, [
      { invullingId: "I1", respondent: { soort: "houden" } },
      { invullingId: "I2", respondent: { soort: "nieuw", naam: "Geheim Persoon", email: "geheim@x.nl", functie: "", team: "" } },
    ]);
    const log = JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; groepId: string | null; details: unknown }[];
    const acties = log.map((l) => l.actie).sort();
    expect(acties).toEqual(
      ["meting.aangemaakt", "respondent.aangemaakt", "respons.metingVerplaatst", "respons.metingVerplaatst", "respons.respondentGewijzigd"].sort()
    );
    expect(new Set(log.map((l) => l.groepId)).size).toBe(1);
    expect(JSON.stringify(log)).not.toContain("Geheim");
    expect(JSON.stringify(log)).not.toContain("geheim@x.nl");
  });
});


describe("het bereik van een Lead", () => {
  const benchmarks = () => JSON.parse(opslag.get("coniche-scan:benchmarks") ?? '{"benchmarks":[],"toewijzingen":[]}') as { toewijzingen: { id: string; respondentId: string; metingId?: string }[] };
  // Benchmark B tussen organisaties met M1 van O1 als lid-Meting: Niveau 1 volgt het bereik op de lid-Meting.
  const benchmarkB = { id: "B", naam: "B", niveau: "organisaties", assessmentIds: ["A"], leden: [{ organisatieId: "O1", assessmentId: "A", metingId: "M1" }], meldingen: [], aangemaaktOp: "x", aangemaaktDoor: "a1" };
  const zetToewijzingen = (toewijzingen: Rij[]) => opslag.set("coniche-scan:benchmarks", JSON.stringify({ benchmarks: [benchmarkB], toewijzingen }));
  const basis = () =>
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl", { leadMetingIds: ["M1", "M2"] })], [meting("M1", "O1", "Nul", []), meting("M2", "O1", "Vervolg", [])]),
    ]);

  it("een nieuwe Lead voor de hele organisatie heeft geen Metingen nodig", () => {
    zet([org("O1", [], [meting("M1", "O1", "Nul", [])])]);
    const nieuw = db.voegLeadToe("O1", { naam: "N", email: "n@x.nl", bereik: { soort: "organisatie" } })!;
    expect(nieuw.leadVoorOrganisatie).toBe(true);
    expect(nieuw.leadMetingIds).toEqual([]);
    expect(laad()[0].leden[0]).toMatchObject({ leadVoorOrganisatie: true });
  });

  it("weigert specifieke Metingen zonder een Meting", () => {
    zet([org("O1", [], [meting("M1", "O1", "Nul", [])])]);
    expect(db.voegLeadToe("O1", { naam: "", email: "n@x.nl", bereik: { soort: "metingen", metingIds: [] } })).toBeNull();
  });

  it("wisselen naar de hele organisatie en terug bewaart de gekozen Metingen", () => {
    basis();
    db.zetLeadBereik("L1", { soort: "organisatie" });
    expect(laad()[0].leden[0]).toMatchObject({ leadVoorOrganisatie: true, leadMetingIds: ["M1", "M2"] });
    db.zetLeadBereik("L1", { soort: "metingen", metingIds: ["M1", "M2"] });
    expect(laad()[0].leden[0]).toMatchObject({ leadVoorOrganisatie: false, leadMetingIds: ["M1", "M2"] });
  });

  it("intrekken wist de Lead-rol en de bewaarde Metingen", () => {
    basis();
    db.zetLeadBereik("L1", { soort: "organisatie" });
    db.zetLeadBereik("L1", { soort: "ingetrokken" });
    expect(laad()[0].leden[0]).toMatchObject({ leadVoorOrganisatie: false, leadMetingIds: [] });
  });

  it("een toewijzing vervalt op elk niveau zodra de Lead zijn bereik verliest", () => {
    basis();
    zetToewijzingen([
      { id: "t1", benchmarkId: "B", organisatieId: "O1", respondentId: "L1" },
      { id: "t2", benchmarkId: "B", organisatieId: "O1", metingId: "M1", respondentId: "L1" },
      { id: "t3", benchmarkId: "B", organisatieId: "O1", metingId: "M2", respondentId: "L1" },
      { id: "t4", benchmarkId: "B", organisatieId: "O1", metingId: "M1", respondentId: "ANDER" },
    ]);
    // Alleen M2 houden: De niveau 1-toewijzing (lid-Meting M1) en die van M1 vervallen, die van M2 blijft.
    db.zetLeadBereik("L1", { soort: "metingen", metingIds: ["M2"] });
    expect(benchmarks().toewijzingen.map((t) => t.id).sort()).toEqual(["t3", "t4"]);
  });

  it("een niveau 1-toewijzing zonder bereik op de lid-Meting blijft staan zolang het bereik van de Lead niet wordt gewijzigd (overgangsregel)", () => {
    basis();
    zetToewijzingen([{ id: "t1", benchmarkId: "B", organisatieId: "O1", respondentId: "L1" }]);
    // L1 heeft bereik op M2 en niet op de lid-Meting M1. Een andere Respondent wijzigen raakt deze toewijzing niet.
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl", { leadMetingIds: ["M2"] }), lid("L2", "O1", "b@x.nl")], [meting("M1", "O1", "Nul", []), meting("M2", "O1", "Vervolg", [])]),
    ]);
    db.zetLeadBereik("L2", { soort: "organisatie" });
    expect(benchmarks().toewijzingen.map((t) => t.id)).toEqual(["t1"]);
    // Wijzigen van het bereik van die Lead zelf: De toewijzing heeft geen bereik op de lid-Meting en vervalt.
    db.zetLeadBereik("L1", { soort: "metingen", metingIds: ["M2"] });
    expect(benchmarks().toewijzingen).toHaveLength(0);
  });

  it("een Lead met bereik op de lid-Meting houdt zijn niveau 1-toewijzing, ook zonder de hele organisatie", () => {
    basis();
    zetToewijzingen([{ id: "t1", benchmarkId: "B", organisatieId: "O1", respondentId: "L1" }]);
    db.zetLeadBereik("L1", { soort: "metingen", metingIds: ["M1"] });
    expect(benchmarks().toewijzingen).toHaveLength(1);
  });

  it("een Lead voor de hele organisatie houdt zijn niveau 1-toewijzing en die van elke Meting", () => {
    basis();
    zetToewijzingen([
      { id: "t1", benchmarkId: "B", organisatieId: "O1", respondentId: "L1" },
      { id: "t2", benchmarkId: "B", organisatieId: "O1", metingId: "M2", respondentId: "L1" },
    ]);
    db.zetLeadBereik("L1", { soort: "organisatie" });
    expect(benchmarks().toewijzingen).toHaveLength(2);
  });

  it("verplaatsen naar een andere organisatie maakt het bereik leeg", () => {
    zet([
      org("O1", [lid("L1", "O1", "a@x.nl", { leadMetingIds: ["M1"], leadVoorOrganisatie: true })], [meting("M1", "O1", "Nul", [inv("I1", "M1", "L1")])]),
      org("O2", [], [meting("D1", "O2", "Nul", [])]),
    ]);
    db.verplaatsRespondentNaarOrganisatie("L1", "O2", []);
    expect(laad()[1].leden[0]).toMatchObject({ leadMetingIds: [], leadVoorOrganisatie: false });
  });

  it("data van vóór het bereik wordt als specifieke Metingen geladen", () => {
    zet([org("O1", [lid("L1", "O1", "a@x.nl", { leadMetingIds: ["M1"] })], [meting("M1", "O1", "Nul", [])])]);
    expect(db.laadAlles()[0].leden[0].leadVoorOrganisatie).toBe(false);
  });

  it("Mijn metingen toont bij de hele organisatie ook een Meting die later is aangemaakt", () => {
    zet([org("O1", [lid("L1", "O1", "a@x.nl", { leadVoorOrganisatie: true })], [meting("M1", "O1", "Nul", [])])]);
    expect(db.zoekRespondentPerToegangscode(db.laadAlles(), "cL1")!.leadMetingen.map((m) => m.id)).toEqual(["M1"]);
    const o = laad();
    o[0].scanUitvoeringen.push(meting("M2", "O1", "Later", []));
    zet(o);
    expect(db.zoekRespondentPerToegangscode(db.laadAlles(), "cL1")!.leadMetingen.map((m) => m.id)).toEqual(["M1", "M2"]);
  });
});

describe("organisatie hernoemen", () => {
  const auditActies = () => (JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; details: Record<string, unknown> | null; entiteitNaam?: string | null }[]);
  const basis = () => zet([org("O1", [lid("L1", "O1", "a@x.nl")], [meting("M1", "O1", "Nul", [inv("I1", "M1", "L1")])])]);

  it("wijzigt alleen de naam: id en koppelingen blijven gelijk, en logt de oude en de nieuwe naam", () => {
    basis();
    const r = db.hernoemOrganisatie("O1", "  Nieuwe naam  ");
    expect(r).toEqual({ ok: true, gewijzigd: true });
    const o = laad()[0];
    expect(o.id).toBe("O1");
    expect(o.naam).toBe("Nieuwe naam");
    expect(o.leden).toHaveLength(1);
    expect(o.scanUitvoeringen).toHaveLength(1);
    const e = auditActies().find((a) => a.actie === "organisatie.hernoemd")!;
    expect(e.details).toMatchObject({ oudeNaam: "O1", nieuweNaam: "Nieuwe naam" });
    expect(e.entiteitNaam).toBe("Nieuwe naam");
  });

  it("weigert een lege naam en wijzigt niets", () => {
    basis();
    expect(db.hernoemOrganisatie("O1", "   ")).toEqual({ ok: false, reden: "De naam is verplicht." });
    expect(laad()[0].naam).toBe("O1");
    expect(auditActies().some((a) => a.actie === "organisatie.hernoemd")).toBe(false);
  });

  it("een ongewijzigde naam logt niets", () => {
    basis();
    expect(db.hernoemOrganisatie("O1", "O1")).toEqual({ ok: true, gewijzigd: false });
    expect(auditActies().some((a) => a.actie === "organisatie.hernoemd")).toBe(false);
  });

  it("een onbekende organisatie geeft een fout", () => {
    basis();
    expect(db.hernoemOrganisatie("ONBEKEND", "X").ok).toBe(false);
  });
});
