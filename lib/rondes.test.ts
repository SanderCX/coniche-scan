import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { zorgscan } from "@/data/zorgscan-assessment";
import { alleVragen } from "./assessment-structuur";
import { overallScore } from "./scoring";
import {
  aantalAfgerondInMeting,
  genereerLabel,
  gemiddeldeAntwoordenVoorMetingMetSamenstelling,
  ruimOrganisatieOp,
  sorteerPerOnderdeel,
  vergelijkbareMetingen,
  voldoetAanMinScans,
} from "./rondes";
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
const lid = (id: string) => ({ id, organisatieId: "O", email: `${id}@x.nl`, naam: id, functie: "", team: "", notities: "", toegangscode: `c${id}`, leadMetingIds: [], aangemaaktOp: "x" });
const org = (extra: Partial<Organisatie> = {}): Organisatie => ({
  id: "O", naam: "Org", kenmerken: {}, leden: [lid("L1"), lid("L2")], scanUitvoeringen: [], rondes: [], aangemaaktDoor: null, toegewezenAan: [],
  benchmarkToegestaan: false, aangemaaktOp: "x", gewijzigdOp: "x", ...extra,
});
const ronde = (id: string, label: string, aangemaaktOp: string) => ({ id, organisatieId: "O", label, aangemaaktOp });
const zet = (o: Organisatie) => opslag.set(KEY, JSON.stringify([o]));
const laad = () => (JSON.parse(opslag.get(KEY)!) as Organisatie[])[0];
const audit = () => (JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; details: Record<string, unknown> | null }[]);

describe("label", () => {
  it("is '{onderdeel} | {ronde}', of alleen de ronde bij Hele organisatie", () => {
    expect(genereerLabel("Team A", "0-meting")).toBe("Team A | 0-meting");
    expect(genereerLabel("Hele organisatie", "0-meting")).toBe("0-meting");
    expect(genereerLabel("  ", "Nameting")).toBe("Nameting");
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
});

describe("opruimen", () => {
  it("laat een lege ronde en een samengestelde Meting zonder onderliggende Metingen vanzelf verdwijnen", () => {
    const o = org({
      rondes: [ronde("R1", "0-meting", "2026-01-01"), ronde("R2", "Leeg", "2026-02-01")],
      scanUitvoeringen: [meting("A", { rondeId: "R1" }), meting("S", { rondeId: "R1", samenstelling: ["WEG"] })],
    });
    const r = ruimOrganisatieOp(o);
    expect(r.verwijderdeSamengesteldeIds).toEqual(["S"]);
    expect(r.verwijderdeRondeIds).toEqual(["R2"]);
    expect(o.rondes!.map((x) => x.id)).toEqual(["R1"]);
  });

  it("laat een samengestelde Meting met één onderliggende Meting staan", () => {
    const o = org({ scanUitvoeringen: [meting("A"), meting("S", { samenstelling: ["A", "WEG"] })] });
    ruimOrganisatieOp(o);
    expect(o.scanUitvoeringen.find((m) => m.id === "S")?.samenstelling).toEqual(["A"]);
  });
});

describe("vergelijken met een vorige Meting", () => {
  const rondes = [ronde("R1", "0-meting", "2026-01-01"), ronde("R2", "Nameting", "2026-06-01")];
  it("stelt dezelfde combinatie van onderdeel en Assessment in de vorige ronde voor", () => {
    const o = org({
      rondes,
      scanUitvoeringen: [
        meting("A1", { rondeId: "R1", onderdeel: "Team A" }),
        meting("B1", { rondeId: "R1", onderdeel: "Team B" }),
        meting("A2", { rondeId: "R2", onderdeel: "Team A", aangemaaktOp: "2026-06-01T00:00:00.000Z" }),
      ],
    });
    const lijst = vergelijkbareMetingen(o, o.scanUitvoeringen[2]);
    expect(lijst.map((v) => v.meting.id)).toEqual(["A1", "B1"]);
    expect(lijst[0].ontwikkeling).toBe(true);
    expect(lijst[1].ontwikkeling).toBe(false);
  });

  it("valt terug op de meest recente eerdere Meting van hetzelfde Assessment zonder ronde", () => {
    const o = org({
      scanUitvoeringen: [
        meting("M1", { aangemaaktOp: "2026-01-01T00:00:00.000Z" }),
        meting("M2", { aangemaaktOp: "2026-03-01T00:00:00.000Z" }),
        meting("M3", { aangemaaktOp: "2026-05-01T00:00:00.000Z" }),
      ],
    });
    expect(vergelijkbareMetingen(o, o.scanUitvoeringen[2]).map((v) => v.meting.id)).toEqual(["M2", "M1"]);
  });

  it("een ander Assessment is niet te vergelijken", () => {
    const o = org({ scanUitvoeringen: [meting("A", { assessmentId: "ander" }), meting("B", { aangemaaktOp: "2026-05-01T00:00:00.000Z" })] });
    expect(vergelijkbareMetingen(o, o.scanUitvoeringen[1])).toHaveLength(0);
  });
});

describe("rondes beheren", () => {
  it("maakt een Meting met het gegenereerde label en weigert hetzelfde onderdeel en Assessment in dezelfde ronde", () => {
    zet(org());
    const r = db.maakMeting("O", { assessmentId: A.id, onderdeel: "Team A", nieuweRondeLabel: "0-meting" });
    expect(r.ok && r.meting.label).toBe("Team A | 0-meting");
    const ronde1 = laad().rondes![0];
    const dubbel = db.maakMeting("O", { assessmentId: A.id, onderdeel: "Team A", rondeId: ronde1.id });
    expect(dubbel.ok).toBe(false);
    if (!dubbel.ok) expect(dubbel.reden).toContain("Team A | 0-meting");
    expect(db.maakMeting("O", { assessmentId: A.id, onderdeel: "Team B", rondeId: ronde1.id }).ok).toBe(true);
    expect(audit().some((e) => e.actie === "ronde.aangemaakt")).toBe(true);
  });

  it("hernoemt een ronde en laat gegenereerde labels meegaan, maar niet een label dat met de hand is aangepast", () => {
    zet(
      org({
        rondes: [ronde("R1", "0-meting", "2026-01-01")],
        scanUitvoeringen: [
          meting("A", { rondeId: "R1", onderdeel: "Team A", label: "Team A | 0-meting" }),
          meting("B", { rondeId: "R1", onderdeel: "Hele organisatie", label: "Mijn eigen naam" }),
        ],
      })
    );
    expect(db.hernoemRonde("R1", "Nulmeting")).toEqual({ ok: true, gewijzigd: true });
    const o = laad();
    expect(o.scanUitvoeringen.find((m) => m.id === "A")!.label).toBe("Team A | Nulmeting");
    expect(o.scanUitvoeringen.find((m) => m.id === "B")!.label).toBe("Mijn eigen naam");
    const e = audit().find((x) => x.actie === "ronde.hernoemd")!;
    expect(e.details).toMatchObject({ oudeNaam: "0-meting", nieuweNaam: "Nulmeting" });
    expect(db.hernoemRonde("R1", "  ")).toMatchObject({ ok: false });
  });

  it("wijzigen van het onderdeel laat een gegenereerd label volgen en weigert een botsing", () => {
    zet(
      org({
        rondes: [ronde("R1", "0-meting", "2026-01-01")],
        scanUitvoeringen: [
          meting("A", { rondeId: "R1", onderdeel: "Team A", label: "Team A | 0-meting" }),
          meting("B", { rondeId: "R1", onderdeel: "Team B", label: "Team B | 0-meting" }),
        ],
      })
    );
    expect(db.wijzigMeting("A", { onderdeel: "Team C" }).ok).toBe(true);
    expect(laad().scanUitvoeringen.find((m) => m.id === "A")!.label).toBe("Team C | 0-meting");
    const botsing = db.wijzigMeting("A", { onderdeel: "Team B" });
    expect(botsing.ok).toBe(false);
  });

  it("'Naar ronde…' slaat een Meting met een botsing en een samengestelde Meting over, met reden", () => {
    zet(
      org({
        rondes: [ronde("R1", "0-meting", "2026-01-01"), ronde("R2", "Nameting", "2026-06-01")],
        scanUitvoeringen: [
          meting("A1", { rondeId: "R1", onderdeel: "Team A" }),
          meting("A2", { rondeId: "R2", onderdeel: "Team A" }),
          meting("Los", { onderdeel: "Team C" }),
          meting("S", { rondeId: "R1", samenstelling: ["A1"], onderdeel: "Hele organisatie" }),
        ],
      })
    );
    const r = db.naarRonde("O", ["A1", "Los", "S"], { rondeId: "R2" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.verplaatst).toBe(1);
      expect(r.overgeslagen.map((o) => o.metingId).sort()).toEqual(["A1", "S"]);
    }
    expect(laad().scanUitvoeringen.find((m) => m.id === "Los")!.rondeId).toBe("R2");
  });

  it("start een nieuwe ronde vanuit de vorige: Onderdeel en Assessment over, Respondenten alleen met het vinkje", () => {
    const basis = () =>
      zet(
        org({
          rondes: [ronde("R1", "0-meting", "2026-01-01")],
          scanUitvoeringen: [
            meting("A", { rondeId: "R1", onderdeel: "Team A", invullingen: [inv("i1", "A", "L1", 3), inv("i2", "A", "L2", 4)] }),
            meting("B", { rondeId: "R1", onderdeel: "Team B" }),
          ],
        })
      );
    basis();
    const zonder = db.startNieuweRonde("O", { label: "Nameting 2027", vanRondeId: "R1", metingIds: ["A", "B"] });
    expect(zonder).toMatchObject({ ok: true, aantalMetingen: 2 });
    let o = laad();
    const nieuwe = o.scanUitvoeringen.filter((m) => m.rondeId !== "R1");
    expect(nieuwe.map((m) => m.label).sort()).toEqual(["Team A | Nameting 2027", "Team B | Nameting 2027"]);
    expect(nieuwe.every((m) => m.invullingen.length === 0)).toBe(true);

    basis();
    db.startNieuweRonde("O", { label: "Nameting 2027", vanRondeId: "R1", metingIds: ["A"], respondentenMeenemen: true });
    o = laad();
    const kopie = o.scanUitvoeringen.find((m) => m.rondeId !== "R1" && m.onderdeel === "Team A")!;
    expect(kopie.invullingen.map((i) => i.organisatieLidId).sort()).toEqual(["L1", "L2"]);
    expect(kopie.invullingen.every((i) => i.status === "uitgenodigd" && Object.keys(i.antwoorden).length === 0)).toBe(true);
    // Dezelfde Respondenten, niet opnieuw aangemaakt.
    expect(o.leden).toHaveLength(2);
  });

  it("neemt een samengestelde Meting alleen mee als al haar onderliggende Metingen meegaan", () => {
    zet(
      org({
        rondes: [ronde("R1", "0-meting", "2026-01-01")],
        scanUitvoeringen: [
          meting("A", { rondeId: "R1", onderdeel: "Team A" }),
          meting("B", { rondeId: "R1", onderdeel: "Team B" }),
          meting("S", { rondeId: "R1", samenstelling: ["A", "B"] }),
        ],
      })
    );
    expect(db.startNieuweRonde("O", { label: "Nameting", vanRondeId: "R1", metingIds: ["A", "S"] }).ok).toBe(false);
    const ok = db.startNieuweRonde("O", { label: "Nameting", vanRondeId: "R1", metingIds: ["A", "B", "S"] });
    expect(ok).toMatchObject({ ok: true, aantalMetingen: 3 });
    const o = laad();
    const nieuweS = o.scanUitvoeringen.find((m) => m.rondeId !== "R1" && m.samenstelling)!;
    const nieuweIds = o.scanUitvoeringen.filter((m) => m.rondeId === nieuweS.rondeId && !m.samenstelling).map((m) => m.id).sort();
    expect([...nieuweS.samenstelling!].sort()).toEqual(nieuweIds);
  });
});

describe("samengestelde Meting maken en verwijderen", () => {
  const drie = (id: string, onderdeel: string, rondeId = "R1") =>
    meting(id, { rondeId, onderdeel, invullingen: [1, 2, 3].map((k) => inv(`${id}-${k}`, id, "L1", 3)) });
  const basis = () =>
    zet(org({ rondes: [ronde("R1", "0-meting", "2026-01-01")], scanUitvoeringen: [drie("A", "Team A"), drie("B", "Team B"), meting("Weinig", { rondeId: "R1", onderdeel: "Team C" })] }));

  it("maakt een samengestelde Meting in de ronde met minstens twee Metingen", () => {
    basis();
    const r = db.maakSamengesteldeMeting("O", { rondeId: "R1", assessmentId: A.id, label: "Gemiddelde", metingIds: ["A", "B"], minScans: 3 });
    expect(r.ok).toBe(true);
    const s = laad().scanUitvoeringen.find((m) => m.samenstelling)!;
    expect(s).toMatchObject({ rondeId: "R1", onderdeel: "Hele organisatie", invullingen: [] });
    expect(audit().find((e) => e.actie === "meting.samengesteldAangemaakt")?.details).toMatchObject({ onderliggendeMetingen: ["A", "B"] });
  });

  it("weigert minder dan twee Metingen, een Meting onder benchmarkMinScans en een botsing van het onderdeel", () => {
    basis();
    const stap = (metingIds: string[], onderdeel?: string) =>
      db.maakSamengesteldeMeting("O", { rondeId: "R1", assessmentId: A.id, label: "G", metingIds, onderdeel, minScans: 3 });
    expect(stap(["A"]).ok).toBe(false);
    const weinig = stap(["A", "Weinig"]);
    expect(weinig.ok).toBe(false);
    if (!weinig.ok) expect(weinig.reden).toContain("minder dan 3");
    expect(stap(["A", "B"], "Team A").ok).toBe(false);
  });

  it("verwijderen van een onderliggende Meting laat de samengestelde Meting staan met de rest, en verwijdert haar bij nul", () => {
    basis();
    db.maakSamengesteldeMeting("O", { rondeId: "R1", assessmentId: A.id, label: "G", metingIds: ["A", "B"], minScans: 3 });
    db.verwijderMeting("A");
    expect(laad().scanUitvoeringen.find((m) => m.samenstelling)?.samenstelling).toEqual(["B"]);
    db.verwijderMeting("B");
    expect(laad().scanUitvoeringen.some((m) => m.samenstelling)).toBe(false);
    expect(audit().filter((e) => e.actie === "meting.samengesteldVerwijderd")).toHaveLength(1);
  });

  it("een samengestelde Meting zit niet in een andere samengestelde Meting", () => {
    basis();
    db.maakSamengesteldeMeting("O", { rondeId: "R1", assessmentId: A.id, label: "G1", metingIds: ["A", "B"], minScans: 3 });
    const s = laad().scanUitvoeringen.find((m) => m.samenstelling)!;
    const r = db.maakSamengesteldeMeting("O", { rondeId: "R1", assessmentId: A.id, label: "G2", onderdeel: "Anders", metingIds: [s.id, "A"], minScans: 3 });
    expect(r.ok).toBe(false);
  });
});

describe("sorteerPerOnderdeel", () => {
  const organisatie = {
    rondes: [
      { id: "R1", organisatieId: "O", label: "0-meting", aangemaaktOp: "2026-01-01" },
      { id: "R2", organisatieId: "O", label: "Nameting", aangemaaktOp: "2026-06-01" },
    ],
  } as unknown as Organisatie;
  const rij = (id: string, onderdeel: string | undefined, rondeId: string) => ({
    organisatie,
    meting: { id, onderdeel, rondeId, aangemaaktOp: "2026-07-01" } as unknown as ScanUitvoering,
  });

  it("groepeert per onderdeel en zet binnen een onderdeel de oudste ronde eerst", () => {
    const rijen = [rij("b2", "Team B", "R2"), rij("a2", "Team A", "R2"), rij("b1", "Team B", "R1"), rij("a1", "Team A", "R1")];
    expect(sorteerPerOnderdeel(rijen).map((r) => r.meting.id)).toEqual(["a1", "a2", "b1", "b2"]);
  });

  it("laat de volgorde staan bij één onderdeel", () => {
    const rijen = [rij("x2", undefined, "R2"), rij("x1", undefined, "R1")];
    expect(sorteerPerOnderdeel(rijen).map((r) => r.meting.id)).toEqual(["x2", "x1"]);
  });
});
