import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Zelfde aanpak als `lib/db.test.ts`: localStorage en fetch worden vervangen door een in-memory versie, vóór het importeren.
const opslag = new Map<string, string>();
const ORG_KEY = "coniche-scan:organisaties";

type Db = typeof import("./db");
type Store = typeof import("./benchmark-store");
let db: Db;
let store: Store;

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
  store = await import("./benchmark-store");
});

beforeEach(() => opslag.clear());

type Rij = Record<string, unknown>;
const lid = (id: string, orgId: string, extra: Rij = {}) => ({
  id, organisatieId: orgId, email: `${id}@x.nl`, naam: id, functie: "", team: "", notities: "", toegangscode: `c${id}`, aangemaaktOp: "x", ...extra,
});
const org = (id: string, leden: Rij[], metingen: Rij[], vlag = true) => ({
  id, naam: `Org ${id}`, kenmerken: {}, aangemaaktOp: "x", aangemaaktDoor: null, toegewezenAan: [], benchmarkToegestaan: vlag, leden, scanUitvoeringen: metingen,
});
const meting = (id: string, orgId: string) => ({ id, organisatieId: orgId, assessmentId: "A", label: id, aangemaaktOp: "x", invullingen: [] });
const zet = (orgs: Rij[]) => opslag.set(ORG_KEY, JSON.stringify(orgs));
const namen = { assessmentNamen: ["A"], organisatieNamen: [] as string[] };

/** Een benchmark met organisaties O1 en O2, en het vinkje voor de view van die benchmark voor Lead L1 van O1. */
function opzet() {
  zet([
    org("O1", [lid("L1", "O1", { lead: true })], [meting("M1", "O1")]),
    org("O2", [lid("L2", "O2")], [meting("M2", "O2")]),
  ]);
  const b = store.maakBenchmark(
    { naam: "Test", assessmentIds: ["A"], aangemaaktDoor: "g1", leden: [
      { organisatieId: "O1", assessmentId: "A", metingId: "M1" },
      { organisatieId: "O2", assessmentId: "A", metingId: "M2" },
    ] },
    namen
  );
  db.slaLeadToegangOp("O1", [{ respondentId: "L1", weergave: "benchmark", benchmarkId: b.id, aan: true }], "g1");
  return b;
}
const huidig = () => store.getBenchmarks()[0];
/** Alle vinkjes van alle organisaties, zoals opgeslagen. */
const vinkjes = () =>
  (JSON.parse(opslag.get(ORG_KEY) ?? "[]") as { leadToegang?: { respondentId: string; weergave: string; metingId?: string; benchmarkId?: string }[] }[]).flatMap(
    (o) => o.leadToegang ?? []
  );
const benchmarkVinkjes = () => vinkjes().filter((t) => t.weergave === "benchmark");
const audit = () => (JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; details: Record<string, unknown> | null }[]).map((e) => e.actie);

describe("benchmark-opslag", () => {
  it("een vinkje is uniek per combinatie van benchmark en Lead", () => {
    const b = opzet();
    db.slaLeadToegangOp("O1", [{ respondentId: "L1", weergave: "benchmark", benchmarkId: b.id, aan: true }], "g1");
    expect(benchmarkVinkjes()).toHaveLength(1);
  });

  it("een vinkje kan alleen voor een benchmark waar de organisatie lid van is", () => {
    opzet();
    zet([org("O1", [lid("L1", "O1", { lead: true })], [meting("M1", "O1")]), org("O3", [], [])]);
    const b = store.maakBenchmark(
      { naam: "Zonder O1", assessmentIds: ["A"], aangemaaktDoor: "g1", leden: [{ organisatieId: "O3", assessmentId: "A", metingId: "M3" }] },
      namen
    );
    db.slaLeadToegangOp("O1", [{ respondentId: "L1", weergave: "benchmark", benchmarkId: b.id, aan: true }], "g1");
    expect(benchmarkVinkjes()).toHaveLength(0);
  });

  it("een Meting verwijderen haalt het lid uit de benchmark, met een melding en het vinkje van die organisatie", () => {
    opzet();
    db.verwijderMeting("M1");
    expect(huidig().leden.map((l) => l.organisatieId)).toEqual(["O2"]);
    expect(huidig().meldingen[0].tekst).toContain("Org O1");
    expect(benchmarkVinkjes()).toHaveLength(0);
    expect(audit()).toContain("benchmark.gewijzigd");
  });

  it("een Organisatie verwijderen haalt haar leden en vinkjes weg, de benchmark zelf blijft", () => {
    opzet();
    db.verwijderOrganisaties(["O2"]);
    expect(store.getBenchmarks()).toHaveLength(1);
    expect(huidig().leden.map((l) => l.organisatieId)).toEqual(["O1"]);
    expect(benchmarkVinkjes()).toHaveLength(1); // Het vinkje van O1 blijft: O1 bestaat nog.
  });

  it("een Respondent met Lead-rol verwijderen haalt zijn vinkjes weg", () => {
    opzet();
    db.verwijderLeden(["L1"]);
    expect(benchmarkVinkjes()).toHaveLength(0);
    expect(huidig().leden).toHaveLength(2);
  });

  it("de vlag uitzetten haalt de organisatie uit alle benchmarks en logt de wijziging", () => {
    opzet();
    expect(store.aantalBenchmarksMetOrganisatie("O1")).toBe(1);
    db.zetBenchmarkVlag("O1", false);
    expect(store.aantalBenchmarksMetOrganisatie("O1")).toBe(0);
    expect(benchmarkVinkjes()).toHaveLength(0);
    expect(audit()).toContain("organisatie.benchmarkVlagGewijzigd");
    // Aanzetten verandert niets aan de samenstelling.
    db.zetBenchmarkVlag("O1", true);
    expect(huidig().leden).toHaveLength(1);
  });

  it("een benchmark verwijderen laat geen benchmark over waar een vinkje naar verwijst, organisaties en metingen blijven bestaan", () => {
    const b = opzet();
    store.verwijderBenchmark(b.id, namen);
    expect(store.getBenchmarks()).toHaveLength(0);
    // Een vinkje dat naar een verdwenen benchmark wijst, valt zodra de vinkjes worden opgeruimd.
    db.ruimBenchmarkVinkjesOp();
    expect(benchmarkVinkjes()).toHaveLength(0);
    expect((JSON.parse(opslag.get(ORG_KEY)!) as unknown[]).length).toBe(2);
  });

  it("de audit-log bevat geen naam of e-mailadres van de Lead", () => {
    opzet();
    const log = JSON.parse(opslag.get("coniche-scan:audit")!) as { actie: string; details: unknown }[];
    const gewijzigd = log.filter((e) => e.actie === "lead.toegangGewijzigd");
    expect(gewijzigd.length).toBeGreaterThan(0);
    expect(JSON.stringify(gewijzigd.map((e) => e.details))).not.toMatch(/L1|@x\.nl/);
  });
});

describe("benchmark-opslag per niveau", () => {
  /** Eén organisatie met twee Metingen, in een benchmark binnen een organisatie (niveau 2) en binnen een Meting (niveau 3). */
  function opzetBinnen() {
    zet([org("O1", [lid("L1", "O1")], [meting("M1", "O1"), meting("M2", "O1")], true)]);
    const n2 = store.maakBenchmark(
      { naam: "Binnen", niveau: "metingen", assessmentIds: ["A"], aangemaaktDoor: "g1", leden: [
        { organisatieId: "O1", assessmentId: "A", metingId: "M1" },
        { organisatieId: "O1", assessmentId: "A", metingId: "M2" },
      ] },
      { ...namen, metingLabels: ["M1", "M2"] }
    );
    const n3 = store.maakBenchmark(
      { naam: "Scans", niveau: "scans", assessmentIds: ["A"], aangemaaktDoor: "g1", leden: [{ organisatieId: "O1", assessmentId: "A", metingId: "M1" }] },
      { ...namen, metingLabels: ["M1"] }
    );
    return { n2, n3 };
  }
  const byNaam = (naam: string) => store.getBenchmarks().find((b) => b.naam === naam)!;

  it("een nieuwe benchmark krijgt standaard het niveau organisaties, en het niveau komt in het audit-log", () => {
    zet([org("O1", [], [meting("M1", "O1")])]);
    const b = store.maakBenchmark({ naam: "X", assessmentIds: ["A"], aangemaaktDoor: "g1", leden: [] }, namen);
    expect(b.niveau).toBe("organisaties");
    const log = JSON.parse(opslag.get("coniche-scan:audit")!) as { actie: string; details: Record<string, unknown> }[];
    expect(log.find((e) => e.actie === "benchmark.aangemaakt")?.details.niveau).toBe("organisaties");
  });

  it("de vlag uitzetten raakt alleen de benchmark tussen organisaties: De niveaus binnen een organisatie kennen de vlag niet", () => {
    opzetBinnen();
    const tussen = store.maakBenchmark(
      { naam: "Tussen", niveau: "organisaties", assessmentIds: ["A"], aangemaaktDoor: "g1", leden: [{ organisatieId: "O1", assessmentId: "A", metingId: "M1" }] },
      namen
    );
    expect(store.aantalBenchmarksMetOrganisatie("O1")).toBe(3);
    expect(store.aantalBenchmarksMetOrganisatie("O1", true)).toBe(1);
    db.zetBenchmarkVlag("O1", false);
    expect(byNaam("Tussen").leden).toHaveLength(0);
    expect(byNaam("Binnen").leden).toHaveLength(2);
    expect(byNaam("Scans").leden).toHaveLength(1);
    expect(tussen.id).toBe(byNaam("Tussen").id);
  });

  it("een Meting verwijderen haalt het lid uit elke benchmark, ook op niveau 2 en 3", () => {
    opzetBinnen();
    db.verwijderMeting("M1");
    expect(byNaam("Binnen").leden.map((l) => l.metingId)).toEqual(["M2"]);
    expect(byNaam("Scans").leden).toHaveLength(0);
    expect(byNaam("Scans").meldingen).toHaveLength(1);
  });

  it("een Organisatie verwijderen haalt haar leden uit alle niveaus", () => {
    opzetBinnen();
    db.verwijderOrganisaties(["O1"]);
    expect(store.getBenchmarks().map((b) => b.leden.length)).toEqual([0, 0]);
  });
});

describe("vinkjes op niveau 2 en 3", () => {
  const lidMetScans = (id: string, extra: Rij = {}) => lid(id, "O1", extra);
  const metingMetScans = (id: string, respondenten: string[]) => ({
    ...meting(id, "O1"),
    invullingen: respondenten.map((r) => ({ id: `i-${id}-${r}`, scanUitvoeringId: id, organisatieLidId: r, status: "afgerond", antwoorden: {}, opmerkingenPerBouwblok: {}, aangemaaktOp: "x", uitgenodigdOp: "x", gestartOp: null, afgerondOp: null, bewaarVerlengdTot: null })),
  });
  const aan = (respondentId: string, weergave: string, id: string) =>
    ({ respondentId, weergave, aan: true, ...(weergave === "benchmark" ? { benchmarkId: id } : { metingId: id }) }) as Parameters<Db["slaLeadToegangOp"]>[1][number];

  /** Een Lead (L1), een Respondent (R1) met een scan in M1 en M2, een benchmark binnen een organisatie en een binnen een Meting. */
  function opzet() {
    zet([org("O1", [lidMetScans("L1", { lead: true }), lidMetScans("R1")], [metingMetScans("M1", ["R1"]), metingMetScans("M2", ["R1"])])]);
    const n2 = store.maakBenchmark(
      { naam: "Binnen", niveau: "metingen", assessmentIds: ["A"], aangemaaktDoor: "g1", leden: [
        { organisatieId: "O1", assessmentId: "A", metingId: "M1" },
        { organisatieId: "O1", assessmentId: "A", metingId: "M2" },
      ] },
      namen
    );
    const n3 = store.maakBenchmark(
      { naam: "Scans", niveau: "scans", assessmentIds: ["A"], aangemaaktDoor: "g1", leden: [{ organisatieId: "O1", assessmentId: "A", metingId: "M1" }] },
      namen
    );
    return { n2, n3 };
  }

  it("niveau 2 vraagt Resultaten op twee lid-Metingen, niveau 3 heeft geen kolom voor een Lead", () => {
    const { n2, n3 } = opzet();
    db.slaLeadToegangOp("O1", [aan("L1", "benchmark", n2.id), aan("L1", "benchmark", n3.id)], "g1");
    expect(benchmarkVinkjes()).toHaveLength(0);
    // Met Resultaten op één lid-Meting is er niets te vergelijken.
    db.slaLeadToegangOp("O1", [aan("L1", "resultaten", "M1"), aan("L1", "benchmark", n2.id)], "g1");
    expect(benchmarkVinkjes()).toHaveLength(0);
    db.slaLeadToegangOp(
      "O1",
      [aan("L1", "resultaten", "M1"), aan("L1", "resultaten", "M2"), aan("L1", "benchmark", n2.id), aan("L1", "benchmark", n3.id)],
      "g1"
    );
    expect(benchmarkVinkjes().map((t) => t.benchmarkId)).toEqual([n2.id]);
  });

  it("Resultaten van een lid-Meting uitzetten haalt het vinkje van een benchmark op niveau 2 mee, want dan is er niets te vergelijken", () => {
    const { n2 } = opzet();
    db.slaLeadToegangOp("O1", [aan("L1", "resultaten", "M1"), aan("L1", "resultaten", "M2"), aan("L1", "benchmark", n2.id)], "g1");
    expect(benchmarkVinkjes()).toHaveLength(1);
    db.slaLeadToegangOp("O1", [{ ...aan("L1", "resultaten", "M2"), aan: false }], "g1");
    expect(vinkjes().map((t) => t.weergave)).toEqual(["resultaten"]);
  });

  it("een Meting verwijderen haalt de vinkjes van die Meting weg, ook het benchmarkvinkje dat erop leunde", () => {
    const { n2 } = opzet();
    db.slaLeadToegangOp(
      "O1",
      [aan("L1", "resultaten", "M1"), aan("L1", "resultaten", "M2"), aan("L1", "uitnodigen", "M1"), aan("L1", "benchmark", n2.id)],
      "g1"
    );
    db.verwijderMeting("M1");
    // Wat van M1 was valt weg. De benchmark is nog maar van één Meting en heeft geen vinkje meer.
    expect(vinkjes().map((t) => `${t.weergave}:${t.metingId ?? ""}`)).toEqual(["resultaten:M2"]);
  });

  it("de Respondent van een scan verwijderen raakt de vinkjes van de Lead niet", () => {
    const { n2 } = opzet();
    db.slaLeadToegangOp("O1", [aan("L1", "resultaten", "M1"), aan("L1", "resultaten", "M2"), aan("L1", "benchmark", n2.id)], "g1");
    db.verwijderLeden(["R1"]);
    expect(vinkjes()).toHaveLength(3);
  });

  it("de Lead verwijderen, of zijn rol intrekken, haalt zijn vinkjes weg", () => {
    const { n2 } = opzet();
    db.slaLeadToegangOp("O1", [aan("L1", "resultaten", "M1"), aan("L1", "resultaten", "M2"), aan("L1", "benchmark", n2.id)], "g1");
    db.zetLeadRol("L1", false);
    expect(vinkjes()).toHaveLength(0);
    opslag.clear();
    const { n2: n2b } = opzet();
    db.slaLeadToegangOp("O1", [aan("L1", "resultaten", "M1"), aan("L1", "resultaten", "M2"), aan("L1", "benchmark", n2b.id)], "g1");
    db.verwijderLeden(["L1"]);
    expect(vinkjes()).toHaveLength(0);
  });

  it("een benchmark wijzigen zodat een Meting met Resultaten niet meer meedoet haalt het benchmarkvinkje weg", () => {
    const { n2 } = opzet();
    db.slaLeadToegangOp("O1", [aan("L1", "resultaten", "M1"), aan("L1", "resultaten", "M2"), aan("L1", "benchmark", n2.id)], "g1");
    store.wijzigBenchmark(n2.id, { naam: "Binnen", assessmentIds: ["A"], leden: [{ organisatieId: "O1", assessmentId: "A", metingId: "M2" }] }, namen);
    // Het benchmarkvinkje valt zodra de vinkjes worden opgeruimd.
    db.ruimBenchmarkVinkjesOp();
    expect(benchmarkVinkjes()).toHaveLength(0);
    expect(vinkjes().map((t) => t.weergave).sort()).toEqual(["resultaten", "resultaten"]);
  });
});

describe("de overgang van toewijzingen naar vinkjes", () => {
  const toewijzing = (id: string, benchmarkId: string, extra: Rij = {}) => ({
    id, benchmarkId, organisatieId: "O1", respondentId: "L1", toegewezenDoor: "g1", toegewezenOp: "x", ...extra,
  });
  const zetOud = (benchmarks: Rij[], toewijzingen: Rij[]) =>
    opslag.set("coniche-scan:benchmarks", JSON.stringify({ benchmarks, toewijzingen }));
  const bm = (id: string, niveau: string, metingId = "M1") => ({
    id, naam: id, niveau, assessmentIds: ["A"], meldingen: [], aangemaaktOp: "x", aangemaaktDoor: "g1",
    leden: [{ organisatieId: "O1", assessmentId: "A", metingId }],
  });
  const orgs = () => JSON.parse(opslag.get(ORG_KEY)!) as { leden: { id: string; lead?: boolean }[]; leadToegang?: Rij[]; leadOvergangMelding?: string | null }[];

  it("zet een toewijzing om in een vinkje en maakt de Respondent Lead, en wist de toewijzing", () => {
    zet([org("O1", [lid("L1", "O1")], [meting("M1", "O1")])]);
    zetOud([bm("B1", "organisaties")], [toewijzing("t1", "B1")]);
    db.voerLeadOvergangUit();
    const o = orgs()[0];
    expect(o.leden[0].lead).toBe(true);
    expect(o.leadToegang).toMatchObject([{ respondentId: "L1", weergave: "benchmark", benchmarkId: "B1" }]);
    expect(store.legeToewijzingen()).toHaveLength(0);
  });

  it("zet een view op één scan om in Spreiding voor die Meting, met een melding aan de Admin", () => {
    zet([org("O1", [lid("L1", "O1")], [meting("M1", "O1")])]);
    zetOud([bm("B3", "scans")], [toewijzing("t3", "B3", { metingId: "M1", onderwerpRespondentId: "R1" })]);
    db.voerLeadOvergangUit();
    const o = orgs()[0];
    // Spreiding hangt af van Resultaten: Zonder dat vinkje valt het bij het opruimen, de melding blijft.
    expect(o.leadOvergangMelding).toContain("Spreiding");
  });

  it("laat een toewijzing van een nog onbekende Lead staan, en een tweede keer draaien verandert niets", () => {
    zet([org("O1", [lid("L1", "O1")], [meting("M1", "O1")])]);
    zetOud([bm("B1", "organisaties")], [toewijzing("t1", "B1"), toewijzing("t2", "B1", { respondentId: "ONBEKEND" })]);
    db.voerLeadOvergangUit();
    expect(store.legeToewijzingen().map((t) => t.id)).toEqual(["t2"]);
    db.voerLeadOvergangUit();
    expect(orgs()[0].leadToegang).toHaveLength(1);
    expect(store.legeToewijzingen().map((t) => t.id)).toEqual(["t2"]);
  });
});
