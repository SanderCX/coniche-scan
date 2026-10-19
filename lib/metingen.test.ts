import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { zorgscan } from "@/data/zorgscan-assessment";
import { alleVragen } from "./assessment-structuur";
import { overallScore } from "./scoring";
import {
  aantalAfgerondInMeting,
  dagVan,
  dubbeleCombinatieTekst,
  genereerLabel,
  gemiddeldeAntwoordenVoorMetingMetSamenstelling,
  isGeldigeDatum,
  laatsteMeetdatum,
  metingMetCombinatie,
  nieuwsteEerst,
  onderdeelEenheden,
  oudsteEerst,
  ruimOrganisatieOp,
  selectieHeeftZelfdeOnderdeel,
  standaardLabel,
  stelOnderdeelVoor,
  toonMeetdatum,
  voldoetAanMinScans,
} from "./metingen";
import type { Organisatie, ScanInvulling, ScanUitvoering } from "./types";

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

const A = zorgscan;
const inv = (id: string, metingId: string, lidId: string, waarde: number, status: ScanInvulling["status"] = "afgerond"): ScanInvulling => ({
  id, scanUitvoeringId: metingId, organisatieLidId: lidId, status, aangemaaktOp: "x", uitgenodigdOp: "x", gestartOp: null, afgerondOp: null,
  antwoorden: Object.fromEntries(alleVragen(A).map((v) => [v.id, waarde])), opmerkingenPerBouwblok: {}, bewaarVerlengdTot: null,
});
const meting = (id: string, extra: Partial<ScanUitvoering> = {}): ScanUitvoering => ({
  id, organisatieId: "O", assessmentId: A.id, label: id, aangemaaktOp: "2026-01-01T00:00:00.000Z", invullingen: [], ...extra,
});
const lid = (id: string) => ({ id, organisatieId: "O", email: `${id}@x.nl`, naam: id, functie: "", team: "", notities: "", toegangscode: `c${id}`, aangemaaktOp: "x" });
const org = (extra: Partial<Organisatie> = {}): Organisatie => ({
  id: "O", naam: "Org", kenmerken: {}, leden: [lid("L1"), lid("L2")], scanUitvoeringen: [], aangemaaktDoor: null, toegewezenAan: [],
  benchmarkToegestaan: false, aangemaaktOp: "x", gewijzigdOp: "x", ...extra,
});
const zet = (o: Organisatie) => opslag.set(KEY, JSON.stringify([o]));
const laad = () => (JSON.parse(opslag.get(KEY)!) as Organisatie[])[0];
const audit = () => (JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; details: Record<string, unknown> | null }[]);

describe("meetdatum", () => {
  it("herkent alleen echte kalenderdagen in de vorm JJJJ-MM-DD", () => {
    expect(isGeldigeDatum("2026-10-14")).toBe(true);
    expect(isGeldigeDatum("2026-02-30")).toBe(false);
    expect(isGeldigeDatum("14-10-2026")).toBe(false);
    expect(isGeldigeDatum("")).toBe(false);
    expect(isGeldigeDatum(undefined)).toBe(false);
  });

  it("toont de datum als dd-mm-jjjj en 'Datum ontbreekt' zonder datum", () => {
    expect(toonMeetdatum("2026-10-14")).toBe("14-10-2026");
    expect(toonMeetdatum(undefined)).toBe("Datum ontbreekt");
    expect(toonMeetdatum("kapot")).toBe("Datum ontbreekt");
  });

  it("leidt de dag af uit een tijdstip zonder tijdzone-verschuiving", () => {
    expect(dagVan("2026-01-14 09:12:00")).toBe("2026-01-14");
    expect(dagVan("2026-01-14T23:59:59.000Z")).toBe("2026-01-14");
    expect(dagVan("")).toBeUndefined();
    expect(dagVan(null)).toBeUndefined();
    expect(dagVan("2026-13-40")).toBeUndefined();
  });

  it("laatste meetdatum van een selectie, en null als geen enkele Meting er een heeft", () => {
    expect(laatsteMeetdatum([{ meetdatum: "2026-01-10" }, { meetdatum: "2026-06-01" }, {}])).toBe("2026-06-01");
    expect(laatsteMeetdatum([{}, {}])).toBeNull();
  });
});

describe("naam van een Meting", () => {
  it("is '{onderdeel} | {maand jaar}', of alleen '{maand jaar}' bij Hele organisatie", () => {
    expect(genereerLabel("Team A", "2026-10-14")).toBe("Team A | okt 2026");
    expect(genereerLabel("Hele organisatie", "2026-10-14")).toBe("okt 2026");
    expect(genereerLabel("  ", "2027-03-01")).toBe("mrt 2027");
  });

  it("is zonder meetdatum alleen het onderdeel", () => {
    expect(genereerLabel("Team A", null)).toBe("Team A");
    expect(standaardLabel({ onderdeel: "Team B", meetdatum: "2026-01-02" })).toBe("Team B | jan 2026");
    expect(standaardLabel({})).toBe("Hele organisatie");
  });
});

describe("volgorde van Metingen", () => {
  const m = (label: string, meetdatum?: string) => meting(label, { label, meetdatum });
  it("nieuwste eerst met een Meting zonder meetdatum onderaan, bij dezelfde datum op naam", () => {
    const lijst = [m("B", "2026-01-01"), m("Zonder"), m("A", "2026-01-01"), m("Nieuw", "2026-09-01")];
    expect(nieuwsteEerst(lijst).map((x) => x.label)).toEqual(["Nieuw", "A", "B", "Zonder"]);
  });
  it("oudste eerst voor een vergelijking, een Meting zonder meetdatum achteraan", () => {
    const lijst = [m("Nieuw", "2026-09-01"), m("Zonder"), m("Oud", "2026-01-01")];
    expect(oudsteEerst(lijst).map((x) => x.label)).toEqual(["Oud", "Nieuw", "Zonder"]);
  });
});

describe("dezelfde combinatie", () => {
  const o = org({
    scanUitvoeringen: [
      meting("A", { onderdeel: "Team A", meetdatum: "2026-10-14", label: "Team A | okt 2026" }),
      meting("Z", { onderdeel: "Team A" }),
    ],
  });
  it("vindt een Meting met hetzelfde onderdeel, Assessment en meetdatum", () => {
    expect(metingMetCombinatie(o, "Team A", A.id, "2026-10-14")?.id).toBe("A");
    expect(metingMetCombinatie(o, " Team A ", A.id, "2026-10-14")?.id).toBe("A");
    expect(metingMetCombinatie(o, "Team A", A.id, "2026-10-14", "A")).toBeUndefined();
  });
  it("kent geen combinatie bij een andere datum, een ander onderdeel of een ander Assessment, en niet zonder datum", () => {
    expect(metingMetCombinatie(o, "Team A", A.id, "2026-11-01")).toBeUndefined();
    expect(metingMetCombinatie(o, "Team B", A.id, "2026-10-14")).toBeUndefined();
    expect(metingMetCombinatie(o, "Team A", "ander", "2026-10-14")).toBeUndefined();
    expect(metingMetCombinatie(o, "Team A", A.id, null)).toBeUndefined();
  });
  it("de waarschuwing noemt de Meting die er al is", () => {
    expect(dubbeleCombinatieTekst("Team A | okt 2026")).toContain("Team A | okt 2026");
  });
});

describe("samengestelde Meting: berekening", () => {
  it("elke onderliggende Meting telt één keer mee, ongeacht het aantal scans", () => {
    const klein = meting("A", { invullingen: [inv("a1", "A", "L1", 2), inv("a2", "A", "L2", 2), inv("a3", "A", "L1", 2)] });
    const groot = meting("B", { invullingen: Array.from({ length: 6 }, (_, i) => inv(`b${i}`, "B", "L1", 4)) });
    const samen = meting("S", { samenstelling: ["A", "B"] });
    const o = org({ scanUitvoeringen: [klein, groot, samen] });
    const antwoorden = gemiddeldeAntwoordenVoorMetingMetSamenstelling(A, o, samen);
    expect(overallScore(A, antwoorden)).toBe(3);
    // Per scan gewogen zou het (3×2 + 6×4) / 9 = 3,3 zijn: Die variant bestaat niet.
    expect(aantalAfgerondInMeting(o, samen)).toBe(9);
  });

  it("een onderliggende Meting zonder afgeronde scans telt niet mee", () => {
    const a = meting("A", { invullingen: [inv("a1", "A", "L1", 5)] });
    const leeg = meting("B", { invullingen: [inv("b1", "B", "L1", 1, "bezig")] });
    const samen = meting("S", { samenstelling: ["A", "B"] });
    const o = org({ scanUitvoeringen: [a, leeg, samen] });
    expect(overallScore(A, gemiddeldeAntwoordenVoorMetingMetSamenstelling(A, o, samen))).toBe(5);
  });

  it("voldoet aan benchmarkMinScans als elke onderliggende Meting dat doet", () => {
    const drie = (id: string) => meting(id, { invullingen: [1, 2, 3].map((k) => inv(`${id}${k}`, id, "L1", 3)) });
    const twee = meting("T", { invullingen: [inv("t1", "T", "L1", 3), inv("t2", "T", "L2", 3)] });
    const o = org({ scanUitvoeringen: [drie("A"), twee, meting("S1", { samenstelling: ["A"] }), meting("S2", { samenstelling: ["A", "T"] })] });
    expect(voldoetAanMinScans(o, o.scanUitvoeringen[2], 3)).toBe(true);
    expect(voldoetAanMinScans(o, o.scanUitvoeringen[3], 3)).toBe(false);
    expect(voldoetAanMinScans(o, o.scanUitvoeringen[1], 3)).toBe(false);
  });

  it("waarschuwt voor twee Metingen met hetzelfde onderdeel en Assessment", () => {
    expect(selectieHeeftZelfdeOnderdeel([{ onderdeel: "Team A", assessmentId: "x" }, { onderdeel: "Team B", assessmentId: "x" }])).toBe(false);
    expect(selectieHeeftZelfdeOnderdeel([{ onderdeel: "Team A", assessmentId: "x" }, { onderdeel: "Team A", assessmentId: "x" }])).toBe(true);
    expect(selectieHeeftZelfdeOnderdeel([{ assessmentId: "x" }, { onderdeel: "Hele organisatie", assessmentId: "x" }])).toBe(true);
  });
});

describe("opruimen", () => {
  it("laat een samengestelde Meting zonder onderliggende Metingen vanzelf verdwijnen", () => {
    const o = org({
      scanUitvoeringen: [meting("A"), meting("S", { samenstelling: ["A"] }), meting("Wees", { samenstelling: ["WEG"] })],
    });
    const r = ruimOrganisatieOp(o);
    expect(r.verwijderdeSamengesteldeIds).toEqual(["Wees"]);
    expect(o.scanUitvoeringen.map((m) => m.id)).toEqual(["A", "S"]);
  });

  it("laat een samengestelde Meting met één onderliggende Meting staan", () => {
    const o = org({ scanUitvoeringen: [meting("A"), meting("B"), meting("S", { samenstelling: ["A", "B"] })] });
    o.scanUitvoeringen = o.scanUitvoeringen.filter((m) => m.id !== "B");
    ruimOrganisatieOp(o);
    expect(o.scanUitvoeringen.find((m) => m.id === "S")?.samenstelling).toEqual(["A"]);
  });

  it("de meetdatum van een samengestelde Meting is de laatste van haar onderliggende Metingen", () => {
    const o = org({
      scanUitvoeringen: [
        meting("A", { meetdatum: "2026-01-10" }),
        meting("B", { meetdatum: "2026-05-02" }),
        meting("S", { samenstelling: ["A", "B"], meetdatum: "2025-01-01" }),
      ],
    });
    ruimOrganisatieOp(o);
    expect(o.scanUitvoeringen.find((m) => m.id === "S")?.meetdatum).toBe("2026-05-02");
  });
});

describe("Metingen plannen en wijzigen", () => {
  it("maakt een Meting met onderdeel en meetdatum en de gegenereerde naam", () => {
    zet(org());
    const r = db.maakMeting("O", { assessmentId: A.id, onderdeel: "Team A", meetdatum: "2026-10-14" });
    expect(r.ok).toBe(true);
    const m = laad().scanUitvoeringen[0];
    expect(m).toMatchObject({ label: "Team A | okt 2026", onderdeel: "Team A", meetdatum: "2026-10-14" });
    expect(m.labelHandmatig).toBeFalsy();
    expect(audit().find((e) => e.actie === "meting.aangemaakt")?.details).toMatchObject({ onderdeel: "Team A", meetdatum: "2026-10-14" });
  });

  it("weigert een Meting zonder geldige meetdatum", () => {
    zet(org());
    expect(db.maakMeting("O", { assessmentId: A.id, meetdatum: "" }).ok).toBe(false);
    expect(db.maakMeting("O", { assessmentId: A.id, meetdatum: "2026-02-30" }).ok).toBe(false);
    expect(laad().scanUitvoeringen).toHaveLength(0);
  });

  it("dezelfde combinatie is geen blokkade maar geeft de bestaande Meting terug voor de waarschuwing", () => {
    zet(org());
    db.maakMeting("O", { assessmentId: A.id, onderdeel: "Team A", meetdatum: "2026-10-14" });
    const tweede = db.maakMeting("O", { assessmentId: A.id, onderdeel: "Team A", meetdatum: "2026-10-14" });
    expect(tweede.ok).toBe(true);
    if (tweede.ok) expect(tweede.dubbelVan).toBe("Team A | okt 2026");
    expect(laad().scanUitvoeringen).toHaveLength(2);
  });

  it("wijzigen laat een gegenereerde naam onderdeel en meetdatum volgen en logt de datum", () => {
    zet(org());
    const r = db.maakMeting("O", { assessmentId: A.id, onderdeel: "Team A", meetdatum: "2026-10-14" });
    if (!r.ok) throw new Error("mislukt");
    const w = db.wijzigMeting(r.meting.id, { onderdeel: "Team B", meetdatum: "2027-02-01" });
    expect(w.ok).toBe(true);
    expect(laad().scanUitvoeringen[0]).toMatchObject({ label: "Team B | feb 2027", onderdeel: "Team B", meetdatum: "2027-02-01" });
    const datumLog = audit().find((e) => e.actie === "meting.meetdatumGewijzigd");
    expect(datumLog?.details).toMatchObject({ oudeMeetdatum: "2026-10-14", nieuweMeetdatum: "2027-02-01" });
  });

  it("een zelf aangepaste naam volgt onderdeel en meetdatum niet meer, tot 'Standaardnaam herstellen'", () => {
    zet(org());
    const r = db.maakMeting("O", { assessmentId: A.id, onderdeel: "Team A", meetdatum: "2026-10-14" });
    if (!r.ok) throw new Error("mislukt");
    db.wijzigMeting(r.meting.id, { label: "Pilot Zuid" });
    expect(laad().scanUitvoeringen[0]).toMatchObject({ label: "Pilot Zuid", labelHandmatig: true });
    db.wijzigMeting(r.meting.id, { meetdatum: "2026-11-01" });
    expect(laad().scanUitvoeringen[0].label).toBe("Pilot Zuid");
    db.wijzigMeting(r.meting.id, { herstelLabel: true });
    expect(laad().scanUitvoeringen[0]).toMatchObject({ label: "Team A | nov 2026", labelHandmatig: false });
  });

  it("een naam die gelijk is aan de standaardnaam telt niet als handmatig", () => {
    zet(org());
    const r = db.maakMeting("O", { assessmentId: A.id, onderdeel: "Team A", meetdatum: "2026-10-14" });
    if (!r.ok) throw new Error("mislukt");
    db.wijzigMeting(r.meting.id, { label: "Team A | okt 2026" });
    expect(laad().scanUitvoeringen[0].labelHandmatig).toBe(false);
  });

  it("weigert een lege naam en een kapotte datum, en een eigen datum bij een samengestelde Meting", () => {
    zet(org({ scanUitvoeringen: [meting("A", { meetdatum: "2026-01-01" }), meting("S", { samenstelling: ["A"] })] }));
    expect(db.wijzigMeting("A", { label: "  " }).ok).toBe(false);
    expect(db.wijzigMeting("A", { meetdatum: "nee" }).ok).toBe(false);
    expect(db.wijzigMeting("S", { meetdatum: "2026-02-01" }).ok).toBe(false);
  });

  it("'Meetdatum instellen' zet één datum voor een selectie, laat een naam staan en slaat een samengestelde Meting over", () => {
    zet(
      org({
        scanUitvoeringen: [
          meting("A", { label: "0-meting", labelHandmatig: true }),
          meting("B", { onderdeel: "Team B", label: "Team B | jan 2026", meetdatum: "2026-01-01" }),
          meting("S", { samenstelling: ["A", "B"] }),
        ],
      })
    );
    const r = db.zetMeetdatum("O", ["A", "B", "S"], "2026-03-04");
    expect(r).toMatchObject({ ok: true, gewijzigd: 2, overgeslagen: 1 });
    const o = laad();
    expect(o.scanUitvoeringen.find((m) => m.id === "A")).toMatchObject({ meetdatum: "2026-03-04", label: "0-meting" });
    expect(o.scanUitvoeringen.find((m) => m.id === "B")).toMatchObject({ meetdatum: "2026-03-04", label: "Team B | mrt 2026" });
    // De samengestelde Meting volgt haar onderliggende Metingen.
    expect(o.scanUitvoeringen.find((m) => m.id === "S")?.meetdatum).toBe("2026-03-04");
    const logs = audit().filter((e) => e.actie === "meting.meetdatumGewijzigd");
    expect(logs).toHaveLength(2);
  });

  it("'Meetdatum instellen' weigert een ongeldige datum en doet niets als de datum al zo staat", () => {
    zet(org({ scanUitvoeringen: [meting("A", { meetdatum: "2026-03-04" })] }));
    expect(db.zetMeetdatum("O", ["A"], "").ok).toBe(false);
    const r = db.zetMeetdatum("O", ["A"], "2026-03-04");
    expect(r).toMatchObject({ ok: true, gewijzigd: 0 });
    expect(audit().some((e) => e.actie === "meting.meetdatumGewijzigd")).toBe(false);
  });

  it("stelt het onderdeel voor uit het label: De tekst vóór ' | ', een eigen onderdeel blijft, anders Hele organisatie", () => {
    expect(stelOnderdeelVoor({ label: "Zuid-Nederland | 0-meting" })).toBe("Zuid-Nederland");
    expect(stelOnderdeelVoor({ label: "Zuid-Nederland | 0-meting", onderdeel: "Eigen" })).toBe("Eigen");
    expect(stelOnderdeelVoor({ label: "Legacy-import 2026" })).toBe("Hele organisatie");
  });
});

describe("overgang van de rondes bij het laden", () => {
  it("laat een Meting haar naam en onderdeel houden, zonder meetdatum, en laat de ronde vallen", () => {
    opslag.set(
      KEY,
      JSON.stringify([
        {
          ...org(),
          rondes: [{ id: "R1", organisatieId: "O", label: "0-meting", aangemaaktOp: "x" }],
          scanUitvoeringen: [{ ...meting("A", { label: "Team A | 0-meting", onderdeel: "Team A" }), rondeId: "R1" }],
        },
      ])
    );
    const o = db.laadAlles()[0];
    expect(o.scanUitvoeringen[0]).toMatchObject({ label: "Team A | 0-meting", onderdeel: "Team A", labelHandmatig: true });
    expect(o.scanUitvoeringen[0].meetdatum).toBeUndefined();
    expect(Object.keys(o)).not.toContain("rondes");
    expect(Object.keys(o.scanUitvoeringen[0])).not.toContain("rondeId");
  });
});

describe("samengestelde Meting maken en verwijderen", () => {
  const drie = (id: string, onderdeel: string, meetdatum?: string) =>
    meting(id, { onderdeel, meetdatum, invullingen: [1, 2, 3].map((k) => inv(`${id}-${k}`, id, "L1", 3)) });
  const basis = () =>
    zet(
      org({
        scanUitvoeringen: [
          drie("A", "Team A", "2026-01-10"),
          drie("B", "Team B", "2026-06-10"),
          meting("Weinig", { onderdeel: "Team C", meetdatum: "2026-03-01" }),
          drie("ZonderDatum", "Team D"),
        ],
      })
    );

  it("maakt een samengestelde Meting van minstens twee Metingen, met de laatste meetdatum van de selectie", () => {
    basis();
    const r = db.maakSamengesteldeMeting("O", { assessmentId: A.id, metingIds: ["A", "B"], minScans: 3 });
    expect(r.ok).toBe(true);
    const s = laad().scanUitvoeringen.find((m) => m.samenstelling)!;
    expect(s).toMatchObject({ onderdeel: "Hele organisatie", meetdatum: "2026-06-10", label: "jun 2026", invullingen: [] });
    expect(audit().find((e) => e.actie === "meting.samengesteldAangemaakt")?.details).toMatchObject({ onderliggendeMetingen: ["A", "B"] });
  });

  it("weigert minder dan twee Metingen, een Meting onder benchmarkMinScans en een Meting zonder meetdatum", () => {
    basis();
    const stap = (metingIds: string[]) => db.maakSamengesteldeMeting("O", { assessmentId: A.id, metingIds, minScans: 3 });
    expect(stap(["A"]).ok).toBe(false);
    const weinig = stap(["A", "Weinig"]);
    expect(weinig.ok).toBe(false);
    if (!weinig.ok) expect(weinig.reden).toContain("minder dan 3");
    const zonder = stap(["A", "ZonderDatum"]);
    expect(zonder.ok).toBe(false);
    if (!zonder.ok) expect(zonder.reden).toContain("meetdatum");
  });

  it("een gemiddelde over twee momenten van hetzelfde onderdeel mag, met een waarschuwing in het formulier", () => {
    zet(org({ scanUitvoeringen: [drie("A", "Team A", "2026-01-10"), drie("B", "Team A", "2026-06-10")] }));
    expect(db.maakSamengesteldeMeting("O", { assessmentId: A.id, metingIds: ["A", "B"], minScans: 3 }).ok).toBe(true);
  });

  it("Metingen van verschillende meetdata mogen samen, binnen één Assessment", () => {
    zet(org({ scanUitvoeringen: [drie("A", "Team A", "2025-01-10"), drie("B", "Team B", "2026-06-10"), { ...drie("X", "Team X", "2026-06-10"), assessmentId: "ander" }] }));
    expect(db.maakSamengesteldeMeting("O", { assessmentId: A.id, metingIds: ["A", "B"], minScans: 3 }).ok).toBe(true);
    expect(db.maakSamengesteldeMeting("O", { assessmentId: A.id, metingIds: ["A", "X"], minScans: 3 }).ok).toBe(false);
  });

  it("verwijderen van een onderliggende Meting laat de samengestelde Meting staan met de rest, en verwijdert haar bij nul", () => {
    basis();
    db.maakSamengesteldeMeting("O", { assessmentId: A.id, metingIds: ["A", "B"], minScans: 3 });
    db.verwijderMeting("A");
    expect(laad().scanUitvoeringen.find((m) => m.samenstelling)?.samenstelling).toEqual(["B"]);
    db.verwijderMeting("B");
    expect(laad().scanUitvoeringen.some((m) => m.samenstelling)).toBe(false);
    expect(audit().filter((e) => e.actie === "meting.samengesteldVerwijderd")).toHaveLength(1);
  });

  it("een samengestelde Meting zit niet in een andere samengestelde Meting", () => {
    basis();
    db.maakSamengesteldeMeting("O", { assessmentId: A.id, metingIds: ["A", "B"], minScans: 3 });
    const s = laad().scanUitvoeringen.find((m) => m.samenstelling)!;
    const r = db.maakSamengesteldeMeting("O", { assessmentId: A.id, onderdeel: "Anders", metingIds: [s.id, "A"], minScans: 3 });
    expect(r.ok).toBe(false);
  });

  it("wijzigen past de samenstelling aan en de meetdatum volgt de nieuwe selectie", () => {
    basis();
    zet({ ...laad(), scanUitvoeringen: [...laad().scanUitvoeringen, drie("C", "Team C2", "2026-09-30")] });
    const r = db.maakSamengesteldeMeting("O", { assessmentId: A.id, metingIds: ["A", "B"], minScans: 3 });
    if (!r.ok) throw new Error("mislukt");
    expect(db.wijzigSamengesteldeMeting(r.meting.id, { metingIds: ["A", "C"], minScans: 3 }).ok).toBe(true);
    expect(laad().scanUitvoeringen.find((m) => m.id === r.meting.id)).toMatchObject({ samenstelling: ["A", "C"], meetdatum: "2026-09-30" });
  });
});

describe("onderdelen van een samengestelde Meting", () => {
  it("zijn de onderliggende Metingen op meetdatum met hun eigen gemiddelde, een Meting zonder scans valt weg", () => {
    const a = meting("A", { onderdeel: "Team A", meetdatum: "2026-03-01", invullingen: [inv("a1", "A", "L1", 2), inv("a2", "A", "L2", 4)] });
    const b = meting("B", { onderdeel: "Team B", meetdatum: "2026-01-01", invullingen: [inv("b1", "B", "L1", 5)] });
    const leeg = meting("C", { onderdeel: "Team C", meetdatum: "2026-02-01" });
    const s = meting("S", { samenstelling: ["A", "B", "C"] });
    const o = org({ scanUitvoeringen: [a, b, leeg, s] });
    const eenheden = onderdeelEenheden(A, o, s);
    expect(eenheden.map((e) => e.id)).toEqual(["B", "A"]);
    expect(eenheden[0].sublabel).toBe("Team B · 01-01-2026");
    expect(eenheden[1].aantalScans).toBe(2);
    expect(overallScore(A, eenheden[1].antwoorden)).toBe(3);
  });
});
