import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  aantalTekst,
  aantallenPerSoortLead,
  filterOpSoort,
  sectiesVanItem,
  naamVoorLeadVan,
  controleerNaamVoorLead,
  sectieVanScore,
  sorteerVerdeling,
  verdeelOverSecties,
  VERDELING_EERST,
  aantallPerSoort,
  aantalZichtbaarVoorLead,
  benchmarksVoorDossier,
  brancheVan,
  dossierBouwblokkenPerAssessment,
  eventsInVolgorde,
  isVerlopen,
  itemsInVolgorde,
  vandaag,
  casesDieVerwijzenNaar,
  controleerDossieritem,
  filterOpBouwblok,
  isNieuwVoorLead,
  itemStatus,
  itemsPerBouwblok,
  kanOpenZetten,
  leadDossier,
  leegDossier as leegDossierVoorTest,
  leegDossierInvoer,
  nieuwsNieuwsteEerst,
  casesNieuwsteEerst,
  ruimDossierOp,
  voorproef,
  zetNieuwsartikelenOm,
} from "./dossier";
import { automatischeRadarMeting, dossierRadarMeting, radarBronVan, verlorenRadarBronnen } from "./dossier-radar";
import type { Benchmark, Dossieritem, LeadToegang, Organisatie, OrganisatieLid, ScanUitvoering } from "./types";

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

const org = (id: string, extra: Partial<Organisatie> = {}): Organisatie => ({
  id, naam: `Org ${id}`, kenmerken: {}, leden: [], scanUitvoeringen: [], aangemaaktDoor: null, toegewezenAan: [],
  benchmarkToegestaan: false, aangemaaktOp: "x", gewijzigdOp: "x", ...extra,
});
const metSector = (id: string, caseToegestaan = true): Organisatie =>
  org(id, { caseToegestaan, kenmerken: { "sector-subsector": { sector: "Informatie en communicatie" } } });
const zet = (...lijst: Organisatie[]) => opslag.set(KEY, JSON.stringify(lijst));
const laad = (id: string) => db.laadAlles().find((o) => o.id === id)!;
const audit = () => (JSON.parse(opslag.get("coniche-scan:audit") ?? "[]") as { actie: string; entiteitNaam?: string | null; details: Record<string, unknown> | null }[]);

const nieuws = (extra = {}) => ({ ...leegDossierInvoer("nieuws"), titel: "Groei", url: "nu.nl/groei", ...extra });
const caseInvoer = (extra = {}) => ({ ...leegDossierInvoer("case"), titel: "Snellere intake", samenvatting: "Het is gelukt.", caseOrganisatieId: "C", omvang: "800 medewerkers", totResultaat: "6 weken", ...extra });

describe("controle van de invoer", () => {
  it("een nieuwsitem heeft een titel en een geldig adres nodig, de datum is optioneel", () => {
    expect(controleerDossieritem(nieuws({ titel: "" }), "O").ok).toBe(false);
    expect(controleerDossieritem(nieuws({ url: "" }), "O").ok).toBe(false);
    expect(controleerDossieritem(nieuws({ url: "javascript:x" }), "O")).toEqual({ ok: false, reden: "Dit is geen geldig webadres." });
    expect(controleerDossieritem(nieuws({ gepubliceerdOp: "31-02-2026" }), "O").ok).toBe(false);
    const r = controleerDossieritem(nieuws({ bron: "NU.nl", gepubliceerdOp: "2026-10-14" }), "O");
    expect(r.ok && r.waarde.url).toBe("https://nu.nl/groei");
  });
  it("een case heeft een titel, een samenvatting en een andere organisatie nodig, het adres is optioneel", () => {
    expect(controleerDossieritem(caseInvoer({ samenvatting: " " }), "O").ok).toBe(false);
    expect(controleerDossieritem(caseInvoer({ caseOrganisatieId: null }), "O")).toEqual({ ok: false, reden: "Kies de organisatie in de case." });
    expect(controleerDossieritem(caseInvoer({ caseOrganisatieId: "O" }), "O").ok).toBe(false);
    expect(controleerDossieritem(caseInvoer({ url: "geen adres" }), "O").ok).toBe(false);
    const r = controleerDossieritem(caseInvoer({ bron: "x", gepubliceerdOp: "2026-01-01" }), "O");
    expect(r.ok && r.waarde).toMatchObject({ url: "", bron: "", gepubliceerdOp: "", omvang: "800 medewerkers" });
  });
  it("beperkt de lengtes", () => {
    expect(controleerDossieritem(nieuws({ titel: "x".repeat(201) }), "O").ok).toBe(false);
    expect(controleerDossieritem(nieuws({ toelichting: "x".repeat(401) }), "O").ok).toBe(false);
    expect(controleerDossieritem(caseInvoer({ samenvatting: "x".repeat(601) }), "O").ok).toBe(false);
    expect(controleerDossieritem(caseInvoer({ omvang: "x".repeat(41) }), "O").ok).toBe(false);
  });
});

describe("openzetten van een case", () => {
  it("vraagt toestemming en een Sector bij de organisatie in de case", () => {
    const c = caseInvoer();
    expect(kanOpenZetten(c, undefined)).toBe("Kies de organisatie in de case.");
    expect(kanOpenZetten(c, org("C"))).toBe("Zonder toestemming van de organisatie in de case kan een case niet zichtbaar worden.");
    expect(kanOpenZetten(c, org("C", { caseToegestaan: true }))).toBe("Vul de Sector in bij de Kenmerken van Org C.");
    expect(kanOpenZetten(c, metSector("C"))).toBeNull();
    expect(kanOpenZetten(nieuws(), undefined)).toBeNull();
  });
  it("de branche is de korte naam van de Sector", () => {
    expect(brancheVan(metSector("C"))).not.toBe("");
    expect(brancheVan(org("C"))).toBe("");
    expect(brancheVan(undefined)).toBe("");
  });
});

describe("status en volgorde", () => {
  const item = (extra: Partial<Dossieritem>): Dossieritem => ({
    id: "1", soort: "case", titel: "t", toelichting: "", zichtbaarVoorLead: false, bouwblokIds: [], url: "", aangemaaktOp: "2026-10-01T00:00:00Z",
    gewijzigdOp: "x", bron: "", gepubliceerdOp: "", datum: "", einddatum: "", plaats: "", samenvatting: "s", caseOrganisatieId: "C", omvang: "", totResultaat: "", benchmarkId: null, ...extra,
  });
  it("kent vier statussen", () => {
    const alle = [org("C", { caseToegestaan: true })];
    expect(itemStatus(item({}), alle)).toBe("intern");
    expect(itemStatus(item({ zichtbaarVoorLead: true }), alle)).toBe("zichtbaar");
    expect(itemStatus(item({ zichtbaarVoorLead: true }), [org("C", { caseToegestaan: false })])).toBe("toestemming-ontbreekt");
    expect(itemStatus(item({ caseOrganisatieId: null }), alle)).toBe("kies-organisatie");
    expect(itemStatus(item({ soort: "nieuws", zichtbaarVoorLead: true }), [])).toBe("zichtbaar");
  });
  it("zet cases en nieuws met het nieuwste bovenaan", () => {
    const n = (id: string, gepubliceerdOp: string, aangemaaktOp: string) => item({ id, soort: "nieuws", gepubliceerdOp, aangemaaktOp });
    expect(nieuwsNieuwsteEerst([n("oud", "2026-01-01", "2026-10-01T00:00:00Z"), n("nieuw", "2026-09-01", "2026-09-02T00:00:00Z"), n("zonderDatum", "", "2026-10-19T08:00:00Z")]).map((x) => x.id)).toEqual(["zonderDatum", "nieuw", "oud"]);
    expect(casesNieuwsteEerst([item({ id: "a", aangemaaktOp: "2026-10-01T00:00:00Z" }), item({ id: "b", aangemaaktOp: "2026-10-02T00:00:00Z" })]).map((x) => x.id)).toEqual(["b", "a"]);
  });
});

describe("opslaan, openzetten en loggen", () => {
  it("voegt een nieuwsitem toe, wijzigt het en verwijdert het, met de titel in de audit-log", () => {
    zet(org("O"));
    const r = db.voegDossieritemToe("O", nieuws({ bron: "NU.nl" }));
    expect(r.ok).toBe(true);
    const id = laad("O").dossier!.items[0].id;
    expect(laad("O").dossier!.items[0].url).toBe("https://nu.nl/groei");
    expect(db.wijzigDossieritem("O", id, nieuws({ titel: "Groei bevestigd", bron: "NU.nl" })).ok).toBe(true);
    expect(db.verwijderDossieritem("O", id).ok).toBe(true);
    expect(laad("O").dossier!.items).toHaveLength(0);
    expect(audit().filter((e) => e.actie.startsWith("dossier.")).map((e) => e.actie)).toEqual(["dossier.itemToegevoegd", "dossier.itemGewijzigd", "dossier.itemVerwijderd"]);
    expect(audit().find((e) => e.actie === "dossier.itemGewijzigd")?.details).toMatchObject({ velden: ["titel"], soort: "nieuws" });
  });
  it("een wijziging zonder verschil logt niets en het soort staat vast", () => {
    zet(org("O"));
    db.voegDossieritemToe("O", nieuws());
    const id = laad("O").dossier!.items[0].id;
    const voor = audit().length;
    expect(db.wijzigDossieritem("O", id, nieuws()).ok).toBe(true);
    expect(audit()).toHaveLength(voor);
    db.wijzigDossieritem("O", id, caseInvoer());
    expect(laad("O").dossier!.items[0].soort).toBe("nieuws");
  });
  it("een case zonder toestemming kan niet open, met toestemming wel, en de log noemt de organisatie in de case", () => {
    zet(org("O"), org("C", { caseToegestaan: false, kenmerken: { "sector-subsector": { sector: "Informatie en communicatie" } } }));
    expect(db.voegDossieritemToe("O", caseInvoer({ zichtbaarVoorLead: true })).ok).toBe(false);
    expect(db.voegDossieritemToe("O", caseInvoer()).ok).toBe(true);
    db.zetCaseVlag("C", true);
    const id = laad("O").dossier!.items[0].id;
    expect(db.wijzigDossieritem("O", id, caseInvoer({ zichtbaarVoorLead: true })).ok).toBe(true);
    expect(laad("O").dossier!.gewijzigdOp).not.toBeNull();
    expect(audit().find((e) => e.actie === "dossier.itemToegevoegd")?.details).toMatchObject({ caseOrganisatieNaam: "Org C" });
    expect(audit().find((e) => e.actie === "organisatie.caseVlagGewijzigd")?.details).toMatchObject({ caseToegestaan: true });
  });
  it("openzetten zet zichtbaarSinds en logt het aantal zichtbare items", () => {
    zet(org("O"));
    db.voegDossieritemToe("O", nieuws({ zichtbaarVoorLead: true }));
    db.voegDossieritemToe("O", nieuws({ titel: "Intern" }));
    db.zetDossierZichtbaar("O", true);
    expect(laad("O").dossier!.zichtbaar).toBe(true);
    expect(laad("O").dossier!.zichtbaarSinds).not.toBeNull();
    expect(audit().find((e) => e.actie === "dossier.zichtbaarGemaakt")?.details).toMatchObject({ aantalZichtbaar: 1 });
    db.zetDossierZichtbaar("O", false);
    expect(audit().map((e) => e.actie)).toContain("dossier.verborgen");
  });
  it("een onbekende organisatie of item geeft een fout", () => {
    zet(org("O"));
    expect(db.voegDossieritemToe("X", nieuws()).ok).toBe(false);
    expect(db.verwijderDossieritem("O", "nope").ok).toBe(false);
    expect(db.zetDossierZichtbaar("X", true).ok).toBe(false);
  });
});

describe("verwijderen van een organisatie in een case", () => {
  it("maakt de case los, zet hem dicht en noemt het aantal", () => {
    zet(org("O"), metSector("C"));
    db.voegDossieritemToe("O", caseInvoer({ zichtbaarVoorLead: true }));
    expect(casesDieVerwijzenNaar(["C"], db.laadAlles())).toEqual({ aantal: 1, organisaties: 1 });
    db.verwijderOrganisaties(["C"]);
    const i = laad("O").dossier!.items[0];
    expect(i.caseOrganisatieId).toBeNull();
    expect(i.zichtbaarVoorLead).toBe(false);
    expect(itemStatus(i, db.laadAlles())).toBe("kies-organisatie");
    expect(audit().find((e) => e.actie === "organisatie.verwijderd")?.details).toMatchObject({ aantalCasesLosgemaakt: 1 });
  });
});

describe("overgang van de nieuwsartikelen", () => {
  it("wordt Dossieritem van soort nieuws, zonder iets open te zetten", () => {
    const d = zetNieuwsartikelenOm({ nieuwsartikelen: [{ id: "n1", titel: "Overname", url: "https://nu.nl/a", bron: "NU.nl", gepubliceerdOp: "2026-10-14", notitie: "Past bij 4", aangemaaktOp: "2026-10-15T00:00:00Z" }] });
    expect(d.zichtbaar).toBe(false);
    expect(d.items).toHaveLength(1);
    expect(d.items[0]).toMatchObject({ soort: "nieuws", titel: "Overname", toelichting: "Past bij 4", zichtbaarVoorLead: false, bouwblokIds: [] });
  });
  it("laden zet een oude organisatie om en laat het oude veld vallen", () => {
    const oud = { ...org("O"), nieuwsartikelen: [{ id: "n1", titel: "T", url: "https://x.nl", bron: "", gepubliceerdOp: "", notitie: "", aangemaaktOp: "2026-10-15T00:00:00Z" }] };
    opslag.set(KEY, JSON.stringify([oud]));
    const geladen = db.laadAlles()[0] as Organisatie & { nieuwsartikelen?: unknown };
    expect(geladen.dossier!.items).toHaveLength(1);
    expect(geladen.nieuwsartikelen).toBeUndefined();
    expect(geladen.caseToegestaan).toBe(false);
    expect(geladen.dossier!.zichtbaar).toBe(false);
  });
  it("een bestaand Dossier blijft zoals het is", () => {
    const d = zetNieuwsartikelenOm({ dossier: { zichtbaar: true, zichtbaarSinds: "2026-10-16T00:00:00Z", gewijzigdOp: null, items: [] } });
    expect(d).toMatchObject({ zichtbaar: true, zichtbaarSinds: "2026-10-16T00:00:00Z" });
  });
});

describe("wat de Lead ziet", () => {
  const opgezet = () => {
    const o = org("O", {
      dossier: {
        zichtbaar: true, zichtbaarSinds: "2026-10-16T08:00:00Z", naamVoorLead: "", radarBronnen: [], gewijzigdOp: "2026-10-17T08:00:00Z",
        items: [
          { ...vul("c1", "case"), zichtbaarVoorLead: true, caseOrganisatieId: "C", bouwblokIds: ["b1", "b2"], omvang: "800 medewerkers" },
          { ...vul("c2", "case"), zichtbaarVoorLead: true, caseOrganisatieId: "Z" },
          { ...vul("c3", "case"), zichtbaarVoorLead: false, caseOrganisatieId: "C" },
          { ...vul("n1", "nieuws"), zichtbaarVoorLead: true, bouwblokIds: ["b2"] },
          { ...vul("n2", "nieuws"), zichtbaarVoorLead: false },
        ],
      },
    });
    return [o, metSector("C"), metSector("Z", false)];
  };
  function vul(id: string, soort: Dossieritem["soort"]): Dossieritem {
    return { id, soort, titel: `Titel ${id}`, toelichting: "", zichtbaarVoorLead: false, bouwblokIds: [], url: "", aangemaaktOp: "2026-10-01T00:00:00Z", gewijzigdOp: "x", bron: "", gepubliceerdOp: "", datum: "", einddatum: "", plaats: "", samenvatting: "s", caseOrganisatieId: null, omvang: "", totResultaat: "", benchmarkId: null };
  }
  it("toont alleen wat openstaat, zichtbaar is en bij een case toestemming heeft", () => {
    const alle = opgezet();
    const d = leadDossier(alle[0], alle)!;
    expect(d.cases.map((c) => c.id)).toEqual(["c1"]);
    expect(d.nieuws.map((n) => n.id)).toEqual(["n1"]);
  });
  it("geeft de organisatie in de case nooit mee, alleen de branche", () => {
    const alle = opgezet();
    const d = leadDossier(alle[0], alle)!;
    expect(JSON.stringify(d)).not.toMatch(/Org C|"C"|caseOrganisatieId/);
    expect(d.cases[0].branche).not.toBe("");
  });
  it("toont niets bij een gesloten Dossier, zonder zichtbare items of zonder Sector in de case", () => {
    const alle = opgezet();
    alle[0].dossier!.zichtbaar = false;
    expect(leadDossier(alle[0], alle)).toBeNull();
    alle[0].dossier!.zichtbaar = true;
    alle[0].dossier!.items.forEach((i) => (i.zichtbaarVoorLead = false));
    expect(leadDossier(alle[0], alle)).toBeNull();
    const [o, c] = opgezet();
    o.dossier!.items = o.dossier!.items.filter((i) => i.id === "c1");
    c.kenmerken = {};
    expect(leadDossier(o, [o, c])).toBeNull();
  });
  it("filtert op bouwsteen, telt per bouwsteen en maakt de voorproef", () => {
    const alle = opgezet();
    const d = leadDossier(alle[0], alle)!;
    expect(filterOpBouwblok(d, "b2").cases).toHaveLength(1);
    expect(filterOpBouwblok(d, "b1").nieuws).toHaveLength(0);
    expect(filterOpBouwblok(d, null).nieuws).toHaveLength(1);
    expect(Object.fromEntries(itemsPerBouwblok(d))).toEqual({ b1: 1, b2: 2 });
    expect(voorproef(d, 1)).toEqual({ titels: [{ soort: "case", titel: "Titel c1" }], meer: 1 });
    expect(aantalTekst(d)).toBe("1 case · 1 nieuwsbericht");
  });
  it("de tag Nieuw staat er tot de Lead de pagina opende na de laatste wijziging", () => {
    const dossier = { gewijzigdOp: "2026-10-17T08:00:00Z", zichtbaarSinds: "2026-10-16T08:00:00Z" };
    expect(isNieuwVoorLead({}, dossier)).toBe(true);
    expect(isNieuwVoorLead({ dossierGezienOp: "2026-10-16T09:00:00Z" }, dossier)).toBe(true);
    expect(isNieuwVoorLead({ dossierGezienOp: "2026-10-18T09:00:00Z" }, dossier)).toBe(false);
  });
  it("markeert het Dossier als gezien, een keer", () => {
    const lid = { id: "L", organisatieId: "O", email: "a@b.nl", naam: null, functie: "", team: "", notities: "", toegangscode: "abc", aangemaaktOp: "x" };
    const [o] = opgezet();
    o.leden = [lid];
    zet(o);
    db.markeerDossierGezien("O", "L");
    const eerste = laad("O").leden[0].dossierGezienOp;
    expect(eerste).toBeTruthy();
    db.markeerDossierGezien("O", "L");
    expect(laad("O").leden[0].dossierGezienOp).toBe(eerste);
  });
});

/* ---------- Events en Blogs (`dossier.md`, 21 oktober 2026) ---------- */

const NU = new Date(2026, 9, 21, 12, 0, 0); // 21 oktober 2026
const event = (extra = {}) => ({ ...leegDossierInvoer("event"), titel: "Klantcontactdag", datum: "2026-11-12", plaats: "Utrecht", ...extra });
const blog = (extra = {}) => ({ ...leegDossierInvoer("blog"), titel: "Waarom regie telt", url: "coniche.nl/blog/regie", ...extra });
const basisItem = (extra: Partial<Dossieritem>): Dossieritem => ({
  id: "i", soort: "event", titel: "t", toelichting: "", zichtbaarVoorLead: false, bouwblokIds: [], url: "", aangemaaktOp: "2026-10-01T00:00:00Z",
  gewijzigdOp: "x", bron: "", gepubliceerdOp: "", datum: "", einddatum: "", plaats: "", samenvatting: "", caseOrganisatieId: null, omvang: "", totResultaat: "", benchmarkId: null, ...extra,
});

describe("controle van een event en een blog", () => {
  it("een event heeft een titel en een datum nodig, de einddatum, de plaats en het adres zijn optioneel", () => {
    expect(controleerDossieritem(event({ titel: "" }), "O").ok).toBe(false);
    expect(controleerDossieritem(event({ datum: "" }), "O")).toEqual({ ok: false, reden: "Vul de datum in." });
    expect(controleerDossieritem(event({ datum: "31-02-2026" }), "O")).toEqual({ ok: false, reden: "De datum klopt niet." });
    const r = controleerDossieritem(event({ url: "", einddatum: "", plaats: "" }), "O");
    expect(r.ok && r.waarde).toMatchObject({ soort: "event", datum: "2026-11-12", einddatum: "", plaats: "", url: "" });
    const met = controleerDossieritem(event({ url: "coniche.nl/event", einddatum: "2026-11-13" }), "O");
    expect(met.ok && met.waarde).toMatchObject({ url: "https://coniche.nl/event", einddatum: "2026-11-13" });
  });
  it("een einddatum voor de datum geeft een fout, en het adres moet geldig zijn", () => {
    expect(controleerDossieritem(event({ einddatum: "2026-11-01" }), "O")).toEqual({ ok: false, reden: "De einddatum ligt voor de datum." });
    expect(controleerDossieritem(event({ einddatum: "geen datum" }), "O")).toEqual({ ok: false, reden: "De einddatum klopt niet." });
    expect(controleerDossieritem(event({ url: "javascript:x" }), "O").ok).toBe(false);
    expect(controleerDossieritem(event({ plaats: "x".repeat(81) }), "O").ok).toBe(false);
  });
  it("een event bewaart de velden van de andere soorten leeg", () => {
    const r = controleerDossieritem(event({ bron: "NU.nl", samenvatting: "x", omvang: "800" }), "O");
    expect(r.ok && r.waarde).toMatchObject({ bron: "", gepubliceerdOp: "", samenvatting: "", omvang: "" });
  });
  it("een blog heeft een titel en een geldig adres nodig, zoals nieuws, met bron en datum", () => {
    expect(controleerDossieritem(blog({ url: "" }), "O")).toEqual({ ok: false, reden: "Vul het adres van de blog in." });
    expect(controleerDossieritem(blog({ gepubliceerdOp: "31-02-2026" }), "O").ok).toBe(false);
    const r = controleerDossieritem(blog({ bron: "Coniche", gepubliceerdOp: "2026-10-02" }), "O");
    expect(r.ok && r.waarde).toMatchObject({ soort: "blog", url: "https://coniche.nl/blog/regie", bron: "Coniche", gepubliceerdOp: "2026-10-02", datum: "" });
  });
});

describe("een event verlopen", () => {
  it("is verlopen vanaf de dag na de einddatum, of na de datum zonder einddatum", () => {
    expect(vandaag(NU)).toBe("2026-10-21");
    expect(isVerlopen(basisItem({ datum: "2026-10-21" }), NU)).toBe(false);
    expect(isVerlopen(basisItem({ datum: "2026-10-20" }), NU)).toBe(true);
    expect(isVerlopen(basisItem({ datum: "2026-10-19", einddatum: "2026-10-21" }), NU)).toBe(false);
    expect(isVerlopen(basisItem({ datum: "2026-10-19", einddatum: "2026-10-20" }), NU)).toBe(true);
    expect(isVerlopen(basisItem({ soort: "nieuws", datum: "2020-01-01" }), NU)).toBe(false);
  });
  it("zet het eerstvolgende event bovenaan en daarna de verlopen events met het meest recente eerst", () => {
    const e = (id: string, datum: string) => basisItem({ id, datum });
    const volgorde = eventsInVolgorde([e("a", "2026-12-01"), e("oud1", "2026-09-01"), e("b", "2026-10-25"), e("oud2", "2026-10-01")], NU);
    expect(volgorde.map((x) => x.id)).toEqual(["b", "a", "oud2", "oud1"]);
  });
  it("heeft de status Verlopen, ook als het op Zichtbaar voor Lead stond, en telt dan nog mee voor de Lead", () => {
    const o = org("O", {
      dossier: {
        zichtbaar: true, zichtbaarSinds: null, naamVoorLead: "", radarBronnen: [], gewijzigdOp: null,
        items: [
          basisItem({ id: "oud", datum: "2026-09-01", zichtbaarVoorLead: true }),
          basisItem({ id: "komt", datum: "2026-12-01", zichtbaarVoorLead: true }),
          basisItem({ id: "intern", datum: "2026-12-02" }),
        ],
      },
    });
    expect(itemStatus(o.dossier!.items[0], [o], NU)).toBe("verlopen");
    expect(itemStatus(o.dossier!.items[1], [o], NU)).toBe("zichtbaar");
    expect(itemStatus(o.dossier!.items[2], [o], NU)).toBe("intern");
    expect(aantalZichtbaarVoorLead(o, [o], NU)).toBe(2);
  });
});

describe("volgorde en aantallen met vier soorten", () => {
  it("zet de Consultant-lijst op Cases, Nieuws, Events en Blogs en telt per soort, een verlopen event mee", () => {
    const lijst = [
      basisItem({ id: "bl", soort: "blog", gepubliceerdOp: "2026-10-01" }),
      basisItem({ id: "ev", soort: "event", datum: "2026-11-01" }),
      basisItem({ id: "ne", soort: "nieuws", gepubliceerdOp: "2026-10-01" }),
      basisItem({ id: "ca", soort: "case" }),
      basisItem({ id: "oud", soort: "event", datum: "2026-01-01" }),
    ];
    expect(itemsInVolgorde(lijst, NU).map((i) => i.id)).toEqual(["ca", "ne", "ev", "oud", "bl"]);
    expect(aantallPerSoort(lijst)).toEqual({ alles: 5, cases: 1, benchmarks: 0, nieuws: 1, events: 2, blogs: 1 });
  });
});

describe("wat de Lead ziet bij events en blogs", () => {
  const dossier = () =>
    org("O", {
      dossier: {
        zichtbaar: true, zichtbaarSinds: "2026-10-16T08:00:00Z", naamVoorLead: "", radarBronnen: [], gewijzigdOp: null,
        items: [
          basisItem({ id: "e1", soort: "event", datum: "2026-11-12", plaats: "Utrecht", zichtbaarVoorLead: true, bouwblokIds: ["ai1"] }),
          basisItem({ id: "e2", soort: "event", datum: "2026-05-01", zichtbaarVoorLead: true }),
          basisItem({ id: "e3", soort: "event", datum: "2026-12-12" }),
          basisItem({ id: "b1", soort: "blog", url: "https://x.nl", gepubliceerdOp: "2026-10-02", zichtbaarVoorLead: true, bouwblokIds: ["ai1", "b2"] }),
          basisItem({ id: "n1", soort: "nieuws", url: "https://x.nl", zichtbaarVoorLead: true }),
        ],
      },
    });
  it("toont events en blogs zonder toestemming van een andere organisatie, de komende voor de verlopen", () => {
    const o = dossier();
    const d = leadDossier(o, [o], undefined, NU)!;
    expect(d.events.map((e) => [e.id, e.verlopen])).toEqual([["e1", false], ["e2", true]]);
    expect(d.blogs.map((b) => b.id)).toEqual(["b1"]);
    expect(d.cases).toEqual([]);
  });
  it("telt een verlopen event niet mee in de voorproef en de aantallen, wel in het aantal per bouwsteen", () => {
    const o = dossier();
    const d = leadDossier(o, [o], undefined, NU)!;
    expect(voorproef(d, 5).titels.map((t) => t.soort)).toEqual(["nieuws", "event", "blog"]);
    expect(aantalTekst(d)).toBe("1 nieuwsbericht · 1 event · 1 blog");
    expect(Object.fromEntries(itemsPerBouwblok(d))).toEqual({ ai1: 2, b2: 1 });
    expect(filterOpBouwblok(d, "ai1").events.map((e) => e.id)).toEqual(["e1"]);
    expect(filterOpBouwblok(d, "ai1").blogs.map((b) => b.id)).toEqual(["b1"]);
  });
  it("laat een soort zonder items in de tekst weg en gebruikt het enkelvoud", () => {
    expect(aantalTekst({ cases: [], benchmarks: [], nieuws: [], events: [], blogs: [{ id: "b" } as never] })).toBe("1 blog");
    expect(aantalTekst({ cases: [{ id: "c" } as never, { id: "d" } as never], benchmarks: [], nieuws: [], events: [{ verlopen: true } as never], blogs: [] })).toBe("2 cases");
  });
  it("toont het Dossier ook als er alleen een verlopen event is", () => {
    const o = dossier();
    o.dossier!.items = o.dossier!.items.filter((i) => i.id === "e2");
    expect(leadDossier(o, [o], undefined, NU)?.events).toHaveLength(1);
  });
});

describe("koppeling aan bouwstenen van twee Assessments", () => {
  it("biedt de bouwstenen van Klantcontact Volwassenheid en de domeinen van de AI-scan, in die volgorde en op nummer", async () => {
    const { assessments } = await import("@/data/assessments");
    const per = dossierBouwblokkenPerAssessment(assessments);
    expect(per.map((p) => p.assessment.id)).toEqual(["klantcontact-volwassenheid", "ai-volwassenheid"]);
    expect(per.map((p) => p.bouwblokken.length)).toEqual([15, 8]);
    expect(per[1].bouwblokken.map((b) => b.bouwblok.volgnummer)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    // Een AI-domein heeft een domeinkleur en geen categorie.
    expect(per[1].bouwblokken[0].groepKleur).toBe("oranje");
    expect(per[1].bouwblokken[0].groepNaam).toBeNull();
  });
  it("laat de Zorgscan, de Quickscan en de Spanningsmeter weg", async () => {
    const { assessments } = await import("@/data/assessments");
    expect(dossierBouwblokkenPerAssessment(assessments).some((p) => ["zorgscan", "quickscan-ziekenhuis", "spanningsmeter"].includes(p.assessment.id))).toBe(false);
  });
});

describe("opslaan van events en blogs", () => {
  it("bewaart een event en een blog en logt de soort", () => {
    zet(org("O"));
    expect(db.voegDossieritemToe("O", event()).ok).toBe(true);
    expect(db.voegDossieritemToe("O", blog()).ok).toBe(true);
    const items = laad("O").dossier!.items;
    expect(items.map((i) => i.soort)).toEqual(["event", "blog"]);
    expect(audit().filter((a) => a.actie === "dossier.itemToegevoegd").map((a) => a.details?.soort)).toEqual(["event", "blog"]);
  });
  it("laat de soort bij het wijzigen vast en wijzigt de datum van een event", () => {
    zet(org("O"));
    const r = db.voegDossieritemToe("O", event());
    const id = r.ok ? r.item.id : "";
    expect(db.wijzigDossieritem("O", id, { ...event(), datum: "2026-11-20", soort: "nieuws" }).ok).toBe(true);
    expect(laad("O").dossier!.items[0]).toMatchObject({ soort: "event", datum: "2026-11-20" });
  });
  it("laadt data van vóór events en blogs met lege velden", () => {
    const d = zetNieuwsartikelenOm({ dossier: { zichtbaar: false, zichtbaarSinds: null, gewijzigdOp: null, items: [{ id: "a", soort: "nieuws", titel: "t" }] } });
    expect(d.items[0]).toMatchObject({ datum: "", einddatum: "", plaats: "" });
  });
});

describe("de verdeling over secties in de lijst van de Lead", () => {
  const scores = new Map<string, number | null>([
    ["b1", 1.8],
    ["b2", 3.0],
    ["b3", 4.2],
    ["b4", null],
  ]);
  const item = (id: string, bouwblokIds: string[], extra: object = {}) => ({ id, bouwblokIds, ...extra });

  it("deelt een score in op dezelfde grenzen als de klassen", () => {
    expect(sectieVanScore(2.49)).toBe("basis");
    expect(sectieVanScore(2.5)).toBe("uitbouwen");
    expect(sectieVanScore(3.49)).toBe("uitbouwen");
    expect(sectieVanScore(3.5)).toBe("sterk");
  });

  it("zet een item in elke sectie waarin een van zijn bouwstenen valt, over beide Assessments heen", () => {
    expect(sectiesVanItem(["b3", "b2"], scores)).toEqual(["uitbouwen", "sterk"]);
    expect(sectiesVanItem(["b3", "b1", "b2"], scores)).toEqual(["basis", "uitbouwen", "sterk"]);
    expect(sectiesVanItem(["b3"], scores)).toEqual(["sterk"]);
    expect(sectiesVanItem(["b1", "b1"], scores)).toEqual(["basis"]);
  });

  it("zet een item zonder bouwsteen of zonder score in Algemeen, en een bouwsteen zonder score geeft geen sectie", () => {
    expect(sectiesVanItem([], scores)).toEqual(["algemeen"]);
    expect(sectiesVanItem(["b4"], scores)).toEqual(["algemeen"]);
    expect(sectiesVanItem(["onbekend"], scores)).toEqual(["algemeen"]);
    expect(sectiesVanItem(["b4", "b1"], scores)).toEqual(["basis"]);
  });

  it("verdeelt de lijsten, laat lege secties weg en houdt de volgorde van de secties vast", () => {
    const l = {
      cases: [item("c1", ["b3"]), item("c2", ["b1"])],
      nieuws: [item("n1", [])],
      events: [item("e1", ["b2"], { verlopen: false }), item("e2", ["b2"], { verlopen: true })],
      benchmarks: [],
      blogs: [],
    } as unknown as Parameters<typeof verdeelOverSecties>[0];
    const secties = verdeelOverSecties(l, scores, "bouwsteen");
    expect(secties.map((x) => x.sectie)).toEqual(["basis", "uitbouwen", "sterk", "algemeen"]);
    expect(secties.map((x) => x.aantal)).toEqual([1, 1, 1, 1]);
    expect(secties[3].regel).toBe("Niet aan één bouwsteen gekoppeld");
    expect(secties[1].lijsten.events.map((e) => e.id)).toEqual(["e1", "e2"]);
    expect(verdeelOverSecties({ cases: [], benchmarks: [], nieuws: [], events: [], blogs: [] }, scores, "domein")).toEqual([]);
  });

  it("telt per soort zonder verlopen events en filtert op soort", () => {
    const l = {
      cases: [item("c1", [])],
      nieuws: [item("n1", []), item("n2", [])],
      events: [item("e1", [], { verlopen: false }), item("e2", [], { verlopen: true })],
      benchmarks: [],
      blogs: [item("b1", [])],
    } as unknown as Parameters<typeof filterOpSoort>[0];
    expect(aantallenPerSoortLead(l)).toEqual({ alles: 5, case: 1, benchmark: 0, nieuws: 2, event: 1, blog: 1 });
    expect(filterOpSoort(l, "alles")).toBe(l);
    const alleenNieuws = filterOpSoort(l, "nieuws");
    expect([alleenNieuws.cases.length, alleenNieuws.nieuws.length, alleenNieuws.events.length, alleenNieuws.blogs.length]).toEqual([0, 2, 0, 0]);
  });

  it("sorteert de verdeling op de laagste score, en zonder scores op het nummer", () => {
    const met = sorteerVerdeling([
      { naam: "c", score: 3.4, volgnummer: 3 },
      { naam: "a", score: 1.9, volgnummer: 9 },
      { naam: "b", score: 1.9, volgnummer: 4 },
      { naam: "z", score: null, volgnummer: 1 },
    ]);
    expect(met.map((r) => r.naam)).toEqual(["b", "a", "c", "z"]);
    const zonder = sorteerVerdeling([
      { naam: "x", score: null, volgnummer: 7 },
      { naam: "y", score: null, volgnummer: 2 },
    ]);
    expect(zonder.map((r) => r.naam)).toEqual(["y", "x"]);
    expect(VERDELING_EERST).toBe(4);
  });
});

describe("een item in meerdere secties (22 oktober 2026)", () => {
  const scores = new Map<string, number | null>([
    ["b1", 1.8],
    ["b2", 3.0],
    ["b3", 4.2],
  ]);
  const item = (id: string, bouwblokIds: string[]) => ({ id, bouwblokIds });

  it("zet een item in elke sectie waarin een bouwsteen valt en telt het per sectie", () => {
    const l = {
      cases: [item("c1", ["b1", "b3"])],
      nieuws: [item("n1", ["b1"]), item("n2", ["b2"])],
      events: [],
      benchmarks: [],
      blogs: [],
    } as unknown as Parameters<typeof verdeelOverSecties>[0];
    const secties = verdeelOverSecties(l, scores, "bouwsteen");
    expect(secties.map((x) => [x.sectie, x.aantal])).toEqual([
      ["basis", 2],
      ["uitbouwen", 1],
      ["sterk", 1],
    ]);
    // De case staat in twee secties, maar de tegels en pillen tellen hem één keer.
    expect(aantallenPerSoortLead(l).alles).toBe(3);
    expect(secties[0].lijsten.cases.map((c) => c.id)).toEqual(["c1"]);
    expect(secties[2].lijsten.cases.map((c) => c.id)).toEqual(["c1"]);
  });
});

describe("naam voor de Lead", () => {
  it("is standaard Dossier {Organisatie} en anders de eigen naam", () => {
    expect(naamVoorLeadVan(org("O"))).toBe("Dossier Org O");
    expect(naamVoorLeadVan(org("O", { dossier: { ...leegDossierVoorTest(), naamVoorLead: "  Onze aanpak  " } }))).toBe("Onze aanpak");
    expect(naamVoorLeadVan(org("O", { dossier: { ...leegDossierVoorTest(), naamVoorLead: "   " } }))).toBe("Dossier Org O");
  });

  it("controleert de lengte (hoogstens 80 tekens) en trimt", () => {
    expect(controleerNaamVoorLead("  Naam ")).toEqual({ ok: true, waarde: "Naam" });
    expect(controleerNaamVoorLead("")).toEqual({ ok: true, waarde: "" });
    expect(controleerNaamVoorLead("x".repeat(81)).ok).toBe(false);
    expect(controleerNaamVoorLead("x".repeat(80)).ok).toBe(true);
  });

  it("komt in het Dossier van de Lead, en in de log als instelling gewijzigd (zonder persoonsgegevens)", () => {
    zet(org("O", { caseToegestaan: false }));
    db.voegDossieritemToe("O", nieuws({ zichtbaarVoorLead: true }));
    expect(db.zetNaamVoorLead("O", "Onze aanpak").ok).toBe(true);
    db.zetDossierZichtbaar("O", true);
    const o = laad("O");
    expect(leadDossier(o, db.laadAlles())?.naam).toBe("Onze aanpak");
    expect(audit().find((e) => e.actie === "dossier.instellingGewijzigd")?.details).toMatchObject({ veld: "naamVoorLead", nieuw: "Onze aanpak" });
    expect(db.zetNaamVoorLead("O", "x".repeat(81)).ok).toBe(false);
    // Leeg geeft weer de standaardnaam.
    db.zetNaamVoorLead("O", "");
    expect(leadDossier(laad("O"), db.laadAlles())?.naam).toBe("Dossier Org O");
  });
});

describe("de oude veldnamen van het Dossier", () => {
  it("openVoorLead en openSinds worden zichtbaar en zichtbaarSinds, met een lege naam en bronnen", () => {
    const d = zetNieuwsartikelenOm({ dossier: { openVoorLead: true, openSinds: "2026-10-16T08:00:00Z", gewijzigdOp: null, items: [] } });
    expect(d).toMatchObject({ zichtbaar: true, zichtbaarSinds: "2026-10-16T08:00:00Z", naamVoorLead: "", radarBronnen: [] });
    expect(d).not.toHaveProperty("openVoorLead");
  });
  it("laden zet een opgeslagen Dossier met de oude namen om", () => {
    const oud = { ...org("O"), dossier: { openVoorLead: true, openSinds: "2026-10-16T08:00:00Z", gewijzigdOp: null, items: [] } };
    opslag.set(KEY, JSON.stringify([oud]));
    expect(laad("O").dossier).toMatchObject({ zichtbaar: true, zichtbaarSinds: "2026-10-16T08:00:00Z", naamVoorLead: "", radarBronnen: [] });
  });
});

describe("de scorebron van het Dossier", () => {
  const AID = "klantcontact-volwassenheid";
  const meting = (id: string, meetdatum: string, extra: Partial<ScanUitvoering> = {}): ScanUitvoering => ({
    id, organisatieId: "O", assessmentId: AID, label: `Meting ${id}`, meetdatum, aangemaaktOp: "x", invullingen: [], ...extra,
  });
  const lid = (id: string, lead: boolean) => ({
    id, organisatieId: "O", email: `${id}@x.nl`, naam: null, functie: "", team: "", notities: "", toegangscode: id.padEnd(10, "x"), lead,
  }) as unknown as OrganisatieLid;
  const toegang = (respondentId: string, metingId: string): LeadToegang => ({ respondentId, weergave: "resultaten", metingId, toegekendDoor: "A", toegekendOp: "x" });
  const opgezet = (extra: Partial<Organisatie> = {}) =>
    zet(
      org("O", {
        leden: [lid("L1", true)],
        scanUitvoeringen: [meting("m1", "2026-03-01"), meting("m2", "2026-09-01"), meting("m3", "2026-10-01")],
        leadToegang: [toegang("L1", "m1"), toegang("L1", "m2")],
        ...extra,
      })
    );

  it("is automatisch de meest recente Meting die de Lead mag zien", () => {
    opgezet();
    const o = laad("O");
    expect(dossierRadarMeting(o, "L1", AID)?.id).toBe("m2");
    expect(automatischeRadarMeting(o, AID)?.id).toBe("m2");
    expect(radarBronVan(o, AID)).toBeNull();
  });

  it("kiest handmatig één Meting, en onzichtbare Metingen zijn niet te kiezen", () => {
    opgezet();
    expect(db.zetRadarBron("O", AID, "m1").ok).toBe(true);
    expect(dossierRadarMeting(laad("O"), "L1", AID)?.id).toBe("m1");
    expect(db.zetRadarBron("O", AID, "m3").ok).toBe(false);
    expect(db.zetRadarBron("O", AID, "bestaat-niet").ok).toBe(false);
    expect(db.zetRadarBron("O", "quickscan-ziekenhuis", "m1").ok).toBe(false);
    expect(audit().find((e) => e.actie === "dossier.instellingGewijzigd")?.details).toMatchObject({ veld: "radarBron", nieuw: "Meting m1", oud: "automatisch" });
    // Terug naar automatisch.
    expect(db.zetRadarBron("O", AID, null).ok).toBe(true);
    expect(laad("O").dossier!.radarBronnen).toEqual([]);
  });

  it("geeft een Lead zonder de gekozen Meting geen scores", () => {
    opgezet({ leden: [lid("L1", true), lid("L2", true)], leadToegang: [toegang("L1", "m1"), toegang("L2", "m2")] });
    db.zetRadarBron("O", AID, "m1");
    expect(dossierRadarMeting(laad("O"), "L1", AID)?.id).toBe("m1");
    expect(dossierRadarMeting(laad("O"), "L2", AID)).toBeNull();
  });

  it("zet het Dossier uit als een gekozen Meting niet meer zichtbaar is voor de Lead, en aanzetten kan dan niet", () => {
    opgezet();
    db.voegDossieritemToe("O", nieuws({ zichtbaarVoorLead: true }));
    db.zetRadarBron("O", AID, "m1");
    expect(db.zetDossierZichtbaar("O", true).ok).toBe(true);
    // De Admin zet Resultaten van m1 uit voor de Lead.
    db.slaLeadToegangOp("O", [{ respondentId: "L1", weergave: "resultaten", metingId: "m1", aan: false }], "A");
    expect(laad("O").dossier!.zichtbaar).toBe(false);
    expect(verlorenRadarBronnen(laad("O"))).toMatchObject([{ assessmentId: AID, metingId: "m1", reden: "niet-zichtbaar", metingLabel: "Meting m1" }]);
    const verborgen = audit().filter((e) => e.actie === "dossier.verborgen");
    expect(verborgen.at(-1)?.details).toMatchObject({ reden: expect.stringContaining("niet meer zichtbaar") });
    expect(db.zetDossierZichtbaar("O", true).ok).toBe(false);
    // Weer Automatisch kiezen maakt aanzetten mogelijk.
    db.zetRadarBron("O", AID, null);
    expect(db.zetDossierZichtbaar("O", true).ok).toBe(true);
  });

  it("zet het Dossier ook uit als de gekozen Meting is verwijderd", () => {
    opgezet();
    db.zetRadarBron("O", AID, "m2");
    db.zetDossierZichtbaar("O", true);
    db.verwijderMeting("m2");
    const o = laad("O");
    expect(o.dossier!.zichtbaar).toBe(false);
    expect(verlorenRadarBronnen(o)).toMatchObject([{ metingId: "m2", reden: "verwijderd", metingLabel: null }]);
  });
});


/* ---------- Benchmark als vijfde soort (`dossier.md`, 22 oktober 2026) ---------- */

describe("een Benchmark in het Dossier", () => {
  const BKEY = "coniche-scan:benchmarks";
  const bench = (id: string, naam: string, extra: Partial<Benchmark> = {}): Benchmark => ({
    id, naam, assessmentIds: ["klantcontact-volwassenheid"], leden: [{ organisatieId: "O", assessmentId: "klantcontact-volwassenheid", metingId: "m" }, { organisatieId: "P", assessmentId: "klantcontact-volwassenheid", metingId: "n" }],
    meldingen: [], aangemaaktOp: "x", aangemaaktDoor: "A", ...extra,
  });
  const zetBenchmarks = (...lijst: Benchmark[]) => opslag.set(BKEY, JSON.stringify({ benchmarks: lijst, toewijzingen: [] }));
  const lid = (id: string, lead: boolean) => ({
    id, organisatieId: "O", email: `${id}@x.nl`, naam: null, functie: "", team: "", notities: "", toegangscode: id.padEnd(10, "x"), lead,
  }) as unknown as OrganisatieLid;
  const bToegang = (respondentId: string, benchmarkId: string): LeadToegang => ({ respondentId, weergave: "benchmark", benchmarkId, toegekendDoor: "A", toegekendOp: "x" });
  const invoer = (extra = {}) => ({ ...leegDossierInvoer("benchmark"), benchmarkId: "b1", ...extra });
  const bItem = (extra: Partial<Dossieritem> = {}): Dossieritem => ({
    id: "bi", soort: "benchmark", titel: "", toelichting: "Waarom relevant", zichtbaarVoorLead: true, bouwblokIds: [], url: "", aangemaaktOp: "2026-10-01T00:00:00Z",
    gewijzigdOp: "x", bron: "", gepubliceerdOp: "", datum: "", einddatum: "", plaats: "", samenvatting: "", caseOrganisatieId: null, omvang: "", totResultaat: "", benchmarkId: "b1", ...extra,
  });

  it("vraagt alleen een benchmark: geen titel en geen link", () => {
    expect(controleerDossieritem(invoer({ benchmarkId: null }), "O")).toEqual({ ok: false, reden: "Kies een benchmark." });
    const r = controleerDossieritem(invoer({ titel: "eigen titel", url: "https://x.nl", bron: "x" }), "O");
    expect(r.ok && r.waarde).toMatchObject({ soort: "benchmark", titel: "", url: "", bron: "", benchmarkId: "b1" });
    expect(controleerDossieritem(invoer({ toelichting: "x".repeat(401) }), "O").ok).toBe(false);
  });

  it("kiest alleen uit benchmarks waarin de Organisatie zit, en een benchmark hoogstens één keer", () => {
    const keuze = { kiesbaar: [{ id: "b1" }], alInDossier: ["b2"] };
    expect(controleerDossieritem(invoer(), "O", keuze).ok).toBe(true);
    expect(controleerDossieritem(invoer({ benchmarkId: "b9" }), "O", keuze).ok).toBe(false);
    expect(controleerDossieritem(invoer({ benchmarkId: "b2" }), "O", { kiesbaar: [{ id: "b2" }], alInDossier: ["b2"] })).toEqual({ ok: false, reden: "Deze benchmark staat al in het Dossier." });
    const lijst = benchmarksVoorDossier([bench("b1", "Zeta"), bench("b2", "Alfa"), bench("b3", "Anders", { leden: [{ organisatieId: "P", assessmentId: "x", metingId: "n" }] }), bench("b4", "Scans", { niveau: "scans" })], "O");
    expect(lijst.map((b) => b.naam)).toEqual(["Alfa", "Zeta"]);
  });

  it("kent de statussen Kies een benchmark en Geen toegang voor Lead", () => {
    const o = org("O", { leden: [lid("L1", true)], leadToegang: [] });
    const context = (benchmarks: Benchmark[], organisatie = o) => ({ benchmarks, organisatie });
    expect(itemStatus(bItem({ benchmarkId: null }), [o], NU)).toBe("kies-benchmark");
    expect(itemStatus(bItem(), [o], NU, context([]))).toBe("kies-benchmark");
    expect(itemStatus(bItem(), [o], NU, context([bench("b1", "B")]))).toBe("geen-toegang");
    expect(itemStatus(bItem({ zichtbaarVoorLead: false }), [o], NU, context([bench("b1", "B")]))).toBe("intern");
    const mét = org("O", { leden: [lid("L1", true)], leadToegang: [bToegang("L1", "b1")] });
    expect(itemStatus(bItem(), [mét], NU, context([bench("b1", "B")], mét))).toBe("zichtbaar");
  });

  it("de Lead ziet de benchmark alleen met zijn eigen vinkje, met de naam van de benchmark als titel", () => {
    const o = org("O", {
      leden: [lid("L1", true), lid("L2", true)],
      leadToegang: [bToegang("L1", "b1")],
      dossier: { zichtbaar: true, zichtbaarSinds: "x", naamVoorLead: "", radarBronnen: [], gewijzigdOp: "x", items: [bItem({ bouwblokIds: ["b2"] })] },
    });
    const b = bench("b1", "Zorg tegen elkaar");
    const context = (leadId: string) => ({ leadId, benchmarks: [b], assessments: [{ id: "klantcontact-volwassenheid", naam: "Klantcontact Volwassenheid" }], minOrganisaties: 2 });
    const d = leadDossier(o, [o], undefined, NU, context("L1"))!;
    expect(d.benchmarks).toEqual([
      { id: "bi", benchmarkId: "b1", titel: "Zorg tegen elkaar", regel: "Vergelijking van 2 organisaties, Klantcontact Volwassenheid", toelichting: "Waarom relevant", bouwblokIds: ["b2"], aangemaaktOp: "2026-10-01T00:00:00Z" },
    ]);
    expect(leadDossier(o, [o], undefined, NU, context("L2"))).toBeNull();
    expect(leadDossier(o, [o], undefined, NU)).toBeNull();
    expect(leadDossier(o, [o], undefined, NU, { ...context("L1"), benchmarks: [] })).toBeNull();
    // Onder het minimum staat het aantal organisaties niet in de regel.
    expect(leadDossier(o, [o], undefined, NU, { ...context("L1"), minOrganisaties: 5 })!.benchmarks[0].regel).toBe("Vergelijking, Klantcontact Volwassenheid");
    expect(voorproef(d, 5).titels).toEqual([{ soort: "benchmark", titel: "Zorg tegen elkaar" }]);
    expect(aantalTekst(d)).toBe("1 benchmark");
    expect(Object.fromEntries(itemsPerBouwblok(d))).toEqual({ b2: 1 });
    expect(aantallenPerSoortLead(d).benchmark).toBe(1);
    expect(filterOpBouwblok(d, "b9").benchmarks).toEqual([]);
  });

  it("zet de Organisatie van een verwijderde benchmark terug op Kies een benchmark", () => {
    const o = org("O", { dossier: { zichtbaar: true, zichtbaarSinds: "x", naamVoorLead: "", radarBronnen: [], gewijzigdOp: "x", items: [bItem(), bItem({ id: "bj", benchmarkId: "b2" })] } });
    expect(ruimDossierOp([o], [{ id: "b2" }])).toBe(1);
    expect(o.dossier!.items[0]).toMatchObject({ benchmarkId: null, zichtbaarVoorLead: false });
    expect(o.dossier!.items[1]).toMatchObject({ benchmarkId: "b2", zichtbaarVoorLead: true });
  });

  it("voegt een benchmark toe, logt de naam van de benchmark en weigert een tweede keer dezelfde", () => {
    zet(org("O", { leden: [lid("L1", true)] }), org("P"));
    zetBenchmarks(bench("b1", "Zorg tegen elkaar"));
    const r = db.voegDossieritemToe("O", invoer());
    expect(r.ok).toBe(true);
    expect(audit().find((e) => e.actie === "dossier.itemToegevoegd")).toMatchObject({ entiteitNaam: "Zorg tegen elkaar", details: { soort: "benchmark", titel: "Zorg tegen elkaar" } });
    expect(db.voegDossieritemToe("O", invoer())).toEqual({ ok: false, reden: "Deze benchmark staat al in het Dossier." });
    // Een benchmark waar de Organisatie niet in zit is niet te kiezen.
    zetBenchmarks(bench("b1", "Zorg tegen elkaar"), bench("b5", "Zonder O", { leden: [{ organisatieId: "P", assessmentId: "klantcontact-volwassenheid", metingId: "n" }] }));
    expect(db.voegDossieritemToe("O", invoer({ benchmarkId: "b5" })).ok).toBe(false);
  });
});
