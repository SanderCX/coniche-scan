import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { klantcontactVolwassenheid as A } from "@/data/klantcontact-assessment";
import { ADVIES_CATALOGUS_BEGIN } from "@/data/advies-catalogus";
import { actieveBouwblokkenMetGroep } from "../assessment-structuur";
import type { Adviesverloop, Antwoord, Organisatie, ScanInvulling, ScanUitvoering } from "../types";

const opslag = new Map<string, string>();
const KEY = "coniche-scan:organisaties";
type Db = typeof import("../db");
type Catalogus = typeof import("../advies-catalogus-store");
type Benchmarks = typeof import("../benchmark-store");
let db: Db;
let catalogus: Catalogus;
let benchmarks: Benchmarks;

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
  db = await import("../db");
  catalogus = await import("../advies-catalogus-store");
  benchmarks = await import("../benchmark-store");
});
beforeEach(() => opslag.clear());

const AID = A.id;
function scan(id: string, afgerond = true): ScanInvulling {
  const antwoorden: Record<string, Antwoord> = {};
  if (afgerond) for (const { bouwblok } of actieveBouwblokkenMetGroep(A)) for (const v of bouwblok.vragen) antwoorden[v.id] = (bouwblok.volgnummer % 5) + 1;
  return {
    id, scanUitvoeringId: "x", organisatieLidId: "L", status: afgerond ? "afgerond" : "uitgenodigd", antwoorden, opmerkingenPerBouwblok: {}, notitie: null,
    aangemaaktOp: "x", uitgenodigdOp: "x", gestartOp: "x", afgerondOp: afgerond ? "2026-10-01T10:00:00Z" : null, bewaarVerlengdTot: null,
  } as unknown as ScanInvulling;
}
const meting = (id: string, meetdatum: string, extra: Partial<ScanUitvoering> = {}): ScanUitvoering => ({
  id, organisatieId: "O", assessmentId: AID, label: `Meting ${id}`, meetdatum, aangemaaktOp: "x", invullingen: [scan(`s-${id}`)], ...extra,
});
const org = (extra: Partial<Organisatie> = {}): Organisatie => ({
  id: "O", naam: "Org O", kenmerken: {}, leden: [], scanUitvoeringen: [meting("m1", "2026-03-01"), meting("m2", "2026-06-01")], aangemaaktDoor: null, toegewezenAan: [],
  benchmarkToegestaan: false, aangemaaktOp: "x", gewijzigdOp: "x", ...extra,
});
const zet = (...lijst: Organisatie[]) => opslag.set(KEY, JSON.stringify(lijst));
const laad = () => db.laadAlles().find((o) => o.id === "O")!;
const auditLog = () => JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; details: Record<string, unknown> | null }[];
const acties = () => auditLog().map((e) => e.actie);
const lopend = (): Adviesverloop => laad().adviesverlopen![0];
const eerstvolgende = () => ADVIES_CATALOGUS_BEGIN.useCases.find((u) => u.inStrook)!;

function start(metingId = "m1") {
  const r = db.startAdviesverloop("O", metingId);
  if (!r.ok) throw new Error(r.reden);
  return r.adviesverloop;
}

describe("een adviesverloop starten", () => {
  it("begint bij een Meting met afgeronde scans, met de eerste rol en zijn tekst", () => {
    zet(org());
    const a = start("m1");
    expect(a).toMatchObject({ status: "lopend", onderdeelId: null, startMetingId: "m1", peilMetingId: null, benchmarkId: null, shortlistBouwsteenIds: null, nvFaseIds: [], nvUseCaseIds: [], stappen: [], rolId: "consultant" });
    expect(a).not.toHaveProperty("rolTekst");
    expect(a.metingen.map((m) => m.metingId)).toEqual(["m1"]);
    expect(laad().adviesverlopen).toHaveLength(1);
    expect(auditLog().at(-1)).toMatchObject({ actie: "adviesverloop.statusGewijzigd", details: { organisatieNaam: "Org O", onderdeelNaam: "Hele organisatie", status: "lopend" } });
  });
  it("weigert een Meting zonder afgeronde scans", () => {
    zet(org({ scanUitvoeringen: [meting("m1", "2026-03-01", { invullingen: [scan("a", false)] })] }));
    const r = db.startAdviesverloop("O", "m1");
    expect(r).toEqual({ ok: false, reden: "Nog geen afgeronde scans" });
    expect(laad().adviesverlopen ?? []).toHaveLength(0);
  });
  it("weigert een tweede lopend adviesverloop voor hetzelfde Onderdeel", () => {
    zet(org());
    start("m1");
    const r = db.startAdviesverloop("O", "m2");
    expect(r.ok).toBe(false);
    expect(laad().adviesverlopen).toHaveLength(1);
  });
  it("laat na afronden een nieuw adviesverloop toe", () => {
    zet(org());
    const a = start("m1");
    expect(db.rondAdviesverloopAf("O", a.id).ok).toBe(true);
    expect(db.startAdviesverloop("O", "m2").ok).toBe(true);
    expect(laad().adviesverlopen).toHaveLength(2);
  });
  it("weigert een Meting die al bij een adviesverloop hoort", () => {
    zet(org());
    const a = start("m1");
    db.rondAdviesverloopAf("O", a.id);
    expect(db.startAdviesverloop("O", "m1")).toEqual({ ok: false, reden: "Hoort bij een ander adviesverloop" });
  });
});

describe("Metingen koppelen, de peilmeting, de shortlist en de n.v.t.-keuzes", () => {
  it("koppelt een Meting met een label en logt het", () => {
    zet(org());
    const a = start("m1");
    expect(db.koppelMeting("O", a.id, "m2", "Eindmeting").ok).toBe(true);
    expect(lopend().metingen.map((m) => [m.metingId, m.label])).toEqual([["m1", null], ["m2", "Eindmeting"]]);
    expect(auditLog().at(-1)).toMatchObject({ actie: "adviesverloop.metingGekoppeld", details: { actie: "gekoppeld", label: "Eindmeting" } });
  });
  it("laat de laatste gekoppelde Meting niet los", () => {
    zet(org());
    const a = start("m1");
    expect(db.koppelMetingen("O", a.id, [])).toEqual({ ok: false, reden: "Er blijft minstens één Meting gekoppeld." });
    expect(lopend().metingen).toHaveLength(1);
  });
  it("koppelt los en zet start- en peilmeting door naar de Meting die overblijft", () => {
    zet(org());
    const a = start("m1");
    db.koppelMeting("O", a.id, "m2", "");
    db.zetPeilMeting("O", a.id, "m1");
    expect(db.koppelMetingen("O", a.id, [{ metingId: "m2", label: "" }]).ok).toBe(true);
    expect(lopend()).toMatchObject({ startMetingId: "m2", peilMetingId: null });
    expect(auditLog().some((e) => e.actie === "adviesverloop.metingGekoppeld" && e.details?.actie === "losgekoppeld")).toBe(true);
  });
  it("kiest een peilmeting alleen uit de gekoppelde Metingen", () => {
    zet(org());
    const a = start("m1");
    expect(db.zetPeilMeting("O", a.id, "m2").ok).toBe(false);
    db.koppelMeting("O", a.id, "m2", "");
    expect(db.zetPeilMeting("O", a.id, "m2").ok).toBe(true);
    expect(lopend().peilMetingId).toBe("m2");
    expect(db.zetPeilMeting("O", a.id, null).ok).toBe(true);
    expect(lopend().peilMetingId).toBeNull();
  });
  it("legt een eigen shortlist vast in de gekozen volgorde en logt wat er veranderde", () => {
    zet(org());
    const a = start("m1");
    const namen = { b1: { nummer: 1, naam: "Strategie" }, b2: { nummer: 2, naam: "Visie" }, b3: { nummer: 3, naam: "Structuur" } };
    expect(db.zetShortlist("O", a.id, ["b1", "b2"], ["b3"], namen).ok).toBe(true);
    expect(lopend().shortlistBouwsteenIds).toEqual(["b1", "b2"]);
    const acties = auditLog().filter((e) => e.actie === "adviesverloop.shortlistGewijzigd").map((e) => [e.details?.actie, e.details?.bouwsteenNummer]);
    expect(acties).toEqual([["toegevoegd", 1], ["toegevoegd", 2], ["verwijderd", 3]]);
    db.zetShortlist("O", a.id, ["b2", "b1"], ["b1", "b2"], namen);
    expect(lopend().shortlistBouwsteenIds).toEqual(["b2", "b1"]);
    expect(auditLog().at(-1)).toMatchObject({ actie: "adviesverloop.shortlistGewijzigd", details: { actie: "volgorde gewijzigd" } });
    expect(JSON.stringify(auditLog().at(-1))).not.toContain("bouwsteenNaam\":\"Strategie");
  });
  it("herstelt de shortlist naar de standaard en laat een lege lijst toe", () => {
    zet(org());
    const a = start("m1");
    db.zetShortlist("O", a.id, [], ["b1"], {});
    expect(lopend().shortlistBouwsteenIds).toEqual([]);
    expect(db.zetShortlist("O", a.id, null, [], {}).ok).toBe(true);
    expect(lopend().shortlistBouwsteenIds).toBeNull();
    expect(auditLog().at(-1)).toMatchObject({ details: { actie: "hersteld naar de standaard" } });
    const aantal = auditLog().length;
    db.zetShortlist("O", a.id, null, [], {});
    expect(auditLog()).toHaveLength(aantal);
  });
  it("bewaart een bouwsteen niet dubbel in de shortlist", () => {
    zet(org());
    const a = start("m1");
    db.zetShortlist("O", a.id, ["b1", "b1", "b2"], [], {});
    expect(lopend().shortlistBouwsteenIds).toEqual(["b1", "b2"]);
  });
  it("kiest een rol uit de adviescontext zonder de tekst te bewaren, en logt niets", () => {
    zet(org());
    const a = start("m1");
    const aantal = auditLog().length;
    expect(db.zetRol("O", a.id, "salesmanager").ok).toBe(true);
    expect(lopend().rolId).toBe("salesmanager");
    expect(lopend()).not.toHaveProperty("rolTekst");
    expect(auditLog()).toHaveLength(aantal);
  });
  it("slaat een fase over en neemt hem weer mee, met log", () => {
    zet(org());
    const a = start("m1");
    expect(db.zetFaseOverslaan("O", a.id, "2", true).ok).toBe(true);
    expect(lopend().nvFaseIds).toEqual(["2"]);
    expect(db.zetFaseOverslaan("O", a.id, "99", true).ok).toBe(false);
    db.zetFaseOverslaan("O", a.id, "2", true);
    expect(lopend().nvFaseIds).toEqual(["2"]);
    expect(db.zetFaseOverslaan("O", a.id, "2", false).ok).toBe(true);
    expect(lopend().nvFaseIds).toEqual([]);
    expect(auditLog().filter((e) => e.actie === "adviesstap.gedaan").map((e) => e.details?.status)).toEqual(["fase overgeslagen", "fase weer meegenomen"]);
  });
  it("verklaart een use case niet van toepassing, maar niet als er al een stap voor is", () => {
    zet(org());
    const a = start("m1");
    const uc = eerstvolgende();
    expect(db.zetUseCaseNv("O", a.id, uc.id, true).ok).toBe(true);
    expect(lopend().nvUseCaseIds).toEqual([uc.id]);
    expect(db.zetUseCaseNv("O", a.id, uc.id, false).ok).toBe(true);
    expect(lopend().nvUseCaseIds).toEqual([]);
    db.legStapVast("O", a.id, { useCaseId: uc.id, status: "gedaan", bouwsteenId: null, metingId: null });
    expect(db.zetUseCaseNv("O", a.id, uc.id, true)).toEqual({ ok: false, reden: "Deze use case is al gedaan. Zet de stap eerst terug naar open." });
    expect(db.zetUseCaseNv("O", a.id, "9-99", true).ok).toBe(false);
  });
  it("haalt een use case uit de n.v.t.-lijst als er toch een stap voor wordt vastgelegd", () => {
    zet(org());
    const a = start("m1");
    const uc = eerstvolgende();
    db.zetUseCaseNv("O", a.id, uc.id, true);
    db.legStapVast("O", a.id, { useCaseId: uc.id, status: "gedaan", bouwsteenId: null, metingId: null });
    expect(lopend().nvUseCaseIds).toEqual([]);
  });
});

describe("Metingen van een ander Assessment en de Benchmark", () => {
  const twee = () => org({ scanUitvoeringen: [meting("m1", "2026-03-01"), meting("m4", "2026-08-01", { assessmentId: "ai-volwassenheid" })] });
  const namen = { assessmentNamen: [], organisatieNamen: [] };
  const maak = (naam: string, assessmentIds = [AID, "ai-volwassenheid"]) =>
    benchmarks.maakBenchmark({ naam, assessmentIds, aangemaaktDoor: "g", leden: [{ organisatieId: "O", assessmentId: AID, metingId: "m1" }, { organisatieId: "O", assessmentId: "ai-volwassenheid", metingId: "m4" }] }, namen);
  beforeEach(() => opslag.delete("coniche-scan:benchmarks"));

  it("weigert zo'n Meting zonder Benchmark waarin beide Assessments zitten", () => {
    zet(twee());
    const a = start("m1");
    expect(db.koppelMeting("O", a.id, "m4", "")).toEqual({ ok: false, reden: "Geen benchmark met beide Assessments" });
  });
  it("gebruikt de enige geschikte Benchmark zonder te vragen en bewaart hem", () => {
    zet(twee());
    const b = maak("Enige");
    const a = start("m1");
    expect(db.koppelMeting("O", a.id, "m4", "Eindmeting").ok).toBe(true);
    expect(lopend().benchmarkId).toBe(b.id);
    expect(lopend().metingen.map((m) => m.metingId)).toEqual(["m1", "m4"]);
  });
  it("vraagt om een keuze bij meer geschikte Benchmarks, en bewaart die keuze", () => {
    zet(twee());
    maak("Eerste");
    const b2 = maak("Tweede");
    const a = start("m1");
    expect(db.koppelMeting("O", a.id, "m4", "")).toEqual({ ok: false, reden: "Kies een Benchmark voor de koppeling." });
    expect(db.koppelMeting("O", a.id, "m4", "", "bestaatniet").ok).toBe(false);
    expect(db.koppelMeting("O", a.id, "m4", "", b2.id).ok).toBe(true);
    expect(lopend().benchmarkId).toBe(b2.id);
  });
  it("wist de Benchmark als de Meting van het andere Assessment weer losgaat", () => {
    zet(twee());
    maak("Enige");
    const a = start("m1");
    db.koppelMeting("O", a.id, "m4", "");
    expect(db.koppelMetingen("O", a.id, [{ metingId: "m1", label: "" }]).ok).toBe(true);
    expect(lopend().benchmarkId).toBeNull();
  });
  it("koppelt de Meting van het andere Assessment los als de Benchmark wordt verwijderd, en logt dat", () => {
    zet(twee());
    const b = maak("Enige");
    const a = start("m1");
    db.koppelMeting("O", a.id, "m4", "");
    benchmarks.verwijderBenchmark(b.id, namen);
    expect(lopend().metingen.map((m) => m.metingId)).toEqual(["m1"]);
    expect(lopend().benchmarkId).toBeNull();
    expect(auditLog().some((e) => e.actie === "adviesverloop.metingGekoppeld" && e.details?.actie === "losgekoppeld" && String(e.details?.reden).includes("Benchmark"))).toBe(true);
  });
  it("koppelt de Meting los als het Assessment uit de Benchmark gaat", () => {
    zet(twee());
    const b = maak("Enige");
    const a = start("m1");
    db.koppelMeting("O", a.id, "m4", "");
    benchmarks.wijzigBenchmark(b.id, { naam: "Enige", assessmentIds: [AID], leden: [{ organisatieId: "O", assessmentId: AID, metingId: "m1" }] }, namen);
    expect(lopend().metingen.map((m) => m.metingId)).toEqual(["m1"]);
  });
});

describe("stappen vastleggen", () => {
  it("legt een gekopieerde prompt vast, zonder de inhoud ervan in het log", () => {
    zet(org());
    const a = start("m1");
    const uc = eerstvolgende();
    const r = db.legStapVast("O", a.id, { useCaseId: uc.id, status: "promptGekopieerd", bouwsteenId: "bs-5", metingId: "m1" });
    expect(r.ok).toBe(true);
    expect(lopend().stappen).toHaveLength(1);
    expect(lopend().stappen[0]).toMatchObject({ useCaseId: uc.id, status: "promptGekopieerd", bouwsteenId: "bs-5", metingId: "m1", link: "" });
    const log = auditLog().at(-1)!;
    expect(log).toMatchObject({ actie: "adviesstap.gedaan", details: { useCaseCode: uc.id, status: "prompt gekopieerd", organisatieNaam: "Org O" } });
    expect(JSON.stringify(log)).not.toContain(uc.prompts[0]?.prompt.slice(0, 30) ?? "@@");
  });
  it("werkt dezelfde use case voor dezelfde bouwsteen bij in plaats van er een tweede stap van te maken", () => {
    zet(org());
    const a = start("m1");
    const uc = eerstvolgende();
    db.legStapVast("O", a.id, { useCaseId: uc.id, status: "promptGekopieerd", bouwsteenId: "bs-5", metingId: "m1" });
    db.legStapVast("O", a.id, { useCaseId: uc.id, status: "gedaan", bouwsteenId: "bs-5", metingId: "m1", link: "https://contoso.sharepoint.com/d" });
    expect(lopend().stappen).toHaveLength(1);
    expect(lopend().stappen[0]).toMatchObject({ status: "gedaan", link: "https://contoso.sharepoint.com/d" });
    db.legStapVast("O", a.id, { useCaseId: uc.id, status: "promptGekopieerd", bouwsteenId: "bs-5", metingId: "m1" });
    expect(lopend().stappen[0].link).toBe("https://contoso.sharepoint.com/d");
    db.legStapVast("O", a.id, { useCaseId: uc.id, status: "gedaan", bouwsteenId: "bs-10", metingId: "m1" });
    expect(lopend().stappen).toHaveLength(2);
  });
  it("weigert een link die geen http of https is, en een onbekende use case", () => {
    zet(org());
    const a = start("m1");
    const uc = eerstvolgende();
    expect(db.legStapVast("O", a.id, { useCaseId: uc.id, status: "gedaan", bouwsteenId: null, metingId: null, link: "javascript:alert(1)" }).ok).toBe(false);
    expect(db.legStapVast("O", a.id, { useCaseId: "9-99", status: "gedaan", bouwsteenId: null, metingId: null }).ok).toBe(false);
    expect(lopend().stappen).toHaveLength(0);
  });
  it("zet een stap terug naar open: de Adviesstap verdwijnt", () => {
    zet(org());
    const a = start("m1");
    const uc = eerstvolgende();
    const r = db.legStapVast("O", a.id, { useCaseId: uc.id, status: "gedaan", bouwsteenId: null, metingId: null });
    if (!r.ok) throw new Error(r.reden);
    expect(db.zetStapTerug("O", a.id, r.stap.id).ok).toBe(true);
    expect(lopend().stappen).toHaveLength(0);
    expect(auditLog().at(-1)).toMatchObject({ actie: "adviesstap.gedaan", details: { status: "teruggezet" } });
  });
});

describe("afronden, heropenen en verwijderen", () => {
  it("laat een afgerond adviesverloop alleen nog lezen", () => {
    zet(org());
    const a = start("m1");
    db.rondAdviesverloopAf("O", a.id);
    expect(lopend()).toMatchObject({ status: "afgerond" });
    expect(lopend().afgerondOp).not.toBeNull();
    expect(db.koppelMeting("O", a.id, "m2", "").ok).toBe(false);
    expect(db.zetPeilMeting("O", a.id, null).ok).toBe(false);
    expect(db.zetShortlist("O", a.id, ["b1"], [], {}).ok).toBe(false);
    expect(db.zetFaseOverslaan("O", a.id, "2", true).ok).toBe(false);
    expect(db.zetUseCaseNv("O", a.id, eerstvolgende().id, true).ok).toBe(false);
    expect(db.legStapVast("O", a.id, { useCaseId: eerstvolgende().id, status: "gedaan", bouwsteenId: null, metingId: null }).ok).toBe(false);
    expect(db.zetRol("O", a.id, "salesmanager").ok).toBe(false);
  });
  it("heropent, tenzij er al een ander adviesverloop loopt", () => {
    zet(org());
    const a = start("m1");
    db.rondAdviesverloopAf("O", a.id);
    const b = start("m2");
    expect(db.heropenAdviesverloop("O", a.id).ok).toBe(false);
    db.verwijderAdviesverloop("O", b.id);
    expect(db.heropenAdviesverloop("O", a.id).ok).toBe(true);
    expect(laad().adviesverlopen![0]).toMatchObject({ status: "lopend", afgerondOp: null });
    expect(acties().filter((x) => x === "adviesverloop.statusGewijzigd")).toHaveLength(4);
  });
  it("verwijdert het adviesverloop met zijn stappen en laat de Metingen staan", () => {
    zet(org());
    const a = start("m1");
    db.legStapVast("O", a.id, { useCaseId: eerstvolgende().id, status: "gedaan", bouwsteenId: null, metingId: null });
    const r = db.verwijderAdviesverloop("O", a.id);
    expect(r).toEqual({ ok: true, aantalStappen: 1 });
    expect(laad().adviesverlopen).toEqual([]);
    expect(laad().scanUitvoeringen).toHaveLength(2);
    expect(auditLog().at(-1)).toMatchObject({ actie: "adviesverloop.verwijderd", details: { aantalStappen: 1 } });
  });
});

describe("verwijderen van een Meting of een Onderdeel", () => {
  it("weigert de enige gekoppelde Meting van een adviesverloop", () => {
    zet(org());
    start("m1");
    const r = db.verwijderMeting("m1");
    expect(r.ok).toBe(false);
    expect(laad().scanUitvoeringen.map((m) => m.id)).toContain("m1");
  });
  it("verwijdert een gekoppelde Meting als er meer zijn en zet start- en peilmeting door", () => {
    zet(org());
    const a = start("m1");
    db.koppelMeting("O", a.id, "m2", "");
    db.zetPeilMeting("O", a.id, "m1");
    db.legStapVast("O", a.id, { useCaseId: eerstvolgende().id, status: "promptGekopieerd", bouwsteenId: null, metingId: "m1" });
    expect(db.verwijderMeting("m1")).toEqual({ ok: true });
    expect(lopend()).toMatchObject({ startMetingId: "m2", peilMetingId: "m2" });
    expect(lopend().metingen.map((m) => m.metingId)).toEqual(["m2"]);
    expect(lopend().stappen[0].metingId).toBeNull();
  });
  it("laat een Meting die niet bij een adviesverloop hoort gewoon verdwijnen", () => {
    zet(org());
    start("m1");
    expect(db.verwijderMeting("m2")).toEqual({ ok: true });
    expect(laad().scanUitvoeringen.map((m) => m.id)).toEqual(["m1"]);
  });
  it("weigert een Onderdeel met een adviesverloop te verwijderen", () => {
    const onderdeel = { id: "od", organisatieId: "O", naam: "Klantenservice", aangemaaktOp: "x" };
    zet(org({ onderdelen: [onderdeel], scanUitvoeringen: [meting("m1", "2026-03-01", { onderdeelId: "od" })] }));
    const a = start("m1");
    expect(a.onderdeelId).toBe("od");
    // De Meting hangt aan het Onderdeel: die blokkade komt eerst, ook zonder adviesverloop.
    expect(db.verwijderOnderdeel("O", "od").ok).toBe(false);
    zet(org({ onderdelen: [onderdeel], scanUitvoeringen: [], adviesverlopen: [{ ...a, metingen: [], stappen: [] }] }));
    const r = db.verwijderOnderdeel("O", "od");
    expect(r).toEqual({ ok: false, reden: "Dit onderdeel heeft een adviesverloop. Verwijder dat eerst." });
  });
  it("laat een Meting van een adviesverloop niet naar een ander Onderdeel verhuizen", () => {
    zet(org());
    start("m1");
    const r = db.wijzigMeting("m1", { onderdeel: "Klantenservice" });
    expect(r.ok).toBe(false);
    expect(laad().scanUitvoeringen.find((m) => m.id === "m1")!.onderdeelId ?? null).toBeNull();
  });
  it("laat het adviesverloop met de Organisatie verdwijnen", () => {
    zet(org());
    start("m1");
    db.verwijderOrganisaties(["O"]);
    expect(db.laadAlles()).toEqual([]);
  });
});

describe("de Adviescatalogus", () => {
  beforeEach(() => catalogus.resetAdviesCatalogus());

  it("begint met zes fasen, drie rollen en de use cases uit het contentbestand", () => {
    const c = catalogus.getAdviesCatalogus();
    expect(c.fasen).toHaveLength(6);
    expect(c.rollen.map((r) => r.id)).toEqual(["consultant", "salesmanager", "teamleider"]);
    expect(c.useCases.length).toBeGreaterThan(40);
    expect(c.useCases.every((u) => u.inStrook === u.prompts.length > 0)).toBe(true);
  });
  it("hernoemt een fase en logt de naam van het veld, tenzij er al een adviesverloop is", () => {
    expect(catalogus.wijzigFase("1", { korteNaam: "Starten nu" }, false).ok).toBe(true);
    expect(catalogus.getAdviesCatalogus().fasen.find((f) => f.id === "1")!.korteNaam).toBe("Starten nu");
    expect(auditLog().at(-1)).toMatchObject({ actie: "adviescatalogus.gewijzigd", details: { soort: "fase", actie: "gewijzigd", velden: ["korteNaam"] } });
    expect(catalogus.wijzigFase("1", { korteNaam: "Anders" }, true)).toEqual({ ok: false, reden: "Er bestaat al een adviesverloop: De fasen staan vast." });
    expect(catalogus.verplaatsFase("2", -1, true).ok).toBe(false);
  });
  it("verplaatst een fase binnen de volgorde", () => {
    catalogus.verplaatsFase("2", -1, false);
    const f = catalogus.getAdviesCatalogus().fasen;
    expect(f.find((x) => x.id === "2")!.volgorde).toBe(1);
    expect(f.find((x) => x.id === "1")!.volgorde).toBe(2);
  });
  it("maakt een use case, weigert een dubbele code en een lege titel", () => {
    const invoer = { id: "1-99", faseId: "1", titel: "Nieuw", omschrijving: "", apps: ["word"], inStrook: true, bouwsteenIds: [], klassen: [] };
    expect(catalogus.maakUseCase(invoer).ok).toBe(true);
    expect(catalogus.maakUseCase(invoer).ok).toBe(false);
    expect(catalogus.maakUseCase({ ...invoer, id: "1-98", titel: " " }).ok).toBe(false);
    expect(catalogus.maakUseCase({ ...invoer, id: "1-97", apps: ["bestaatniet"] }).ok).toBe(false);
    expect(catalogus.maakUseCase({ ...invoer, id: "1-96", titel: "x".repeat(121) }).ok).toBe(false);
  });
  it("verwijdert een use case alleen zonder stappen, anders kan hij worden verborgen", () => {
    const id = ADVIES_CATALOGUS_BEGIN.useCases[0].id;
    expect(catalogus.verwijderUseCase(id, 2).ok).toBe(false);
    expect(catalogus.verbergUseCase(id, true).ok).toBe(true);
    expect(catalogus.getAdviesCatalogus().useCases.find((u) => u.id === id)!.verborgen).toBe(true);
    expect(catalogus.verwijderUseCase(id, 0).ok).toBe(true);
    expect(catalogus.getAdviesCatalogus().useCases.some((u) => u.id === id)).toBe(false);
  });
  it("zet een prompt per rol en haalt hem weg als context en prompt leeg zijn, zonder de inhoud te loggen", () => {
    const id = ADVIES_CATALOGUS_BEGIN.useCases[0].id;
    expect(catalogus.zetPrompt(id, "salesmanager", "Situatie X", "Geheime promptinhoud").ok).toBe(true);
    expect(catalogus.getAdviesCatalogus().useCases.find((u) => u.id === id)!.prompts.find((p) => p.rolId === "salesmanager")).toEqual({ rolId: "salesmanager", context: "Situatie X", prompt: "Geheime promptinhoud" });
    expect(JSON.stringify(auditLog())).not.toContain("Geheime promptinhoud");
    expect(catalogus.zetPrompt(id, "salesmanager", "", "").ok).toBe(true);
    expect(catalogus.getAdviesCatalogus().useCases.find((u) => u.id === id)!.prompts.some((p) => p.rolId === "salesmanager")).toBe(false);
    expect(catalogus.zetPrompt(id, "bestaatniet", "a", "b").ok).toBe(false);
  });
  it("verplaatst een use case binnen zijn fase", () => {
    const fase1 = catalogus.getAdviesCatalogus().useCases.filter((u) => u.faseId === "1").sort((a, b) => a.volgorde - b.volgorde);
    catalogus.verplaatsUseCase(fase1[0].id, 1);
    const na = catalogus.getAdviesCatalogus().useCases.filter((u) => u.faseId === "1").sort((a, b) => a.volgorde - b.volgorde);
    expect(na[1].id).toBe(fase1[0].id);
  });
});
