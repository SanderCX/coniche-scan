import { describe, expect, it } from "vitest";
import {
  adviesverloopVoorMeting,
  bouwContextblok,
  bouwPromptTekst,
  blokkadeVerwijderenMeting,
  casesVoorBouwsteen,
  controleerLink,
  eersteMeting,
  faseRegel,
  faseVoortgang,
  klasseCodeVan,
  koppelRijen,
  lopendAdviesverloop,
  metingResultaten,
  opLaagsteScore,
  peilMeting,
  ruimAdviesverlopenOp,
  shortlist,
  verschilSindsEerste,
  verschilTekst,
} from "./advies";
import { ADVIES_CATALOGUS_BEGIN } from "@/data/advies-catalogus";
import { magAdviescatalogusBeheren, magAdviesverloop } from "./rechten";
import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { actieveBouwblokkenMetGroep } from "./assessment-structuur";
import type { AdviesCatalogus, Adviesstap, Adviesverloop, Antwoord, Benchmark, Gebruiker, Organisatie, ScanInvulling, ScanUitvoering } from "./types";

const AID = "klantcontact-volwassenheid";
const A = klantcontactVolwassenheid;

/** Een afgeronde scan waarin bouwsteen n het antwoord `(n + verschuiving) % 5 + 1` krijgt: Bouwsteen 5, 10 en 15 scoren 1 (verschuiving 0). */
function scan(id: string, verschuiving = 0): ScanInvulling {
  const antwoorden: Record<string, Antwoord> = {};
  for (const { bouwblok } of actieveBouwblokkenMetGroep(A)) {
    for (const v of bouwblok.vragen) antwoorden[v.id] = ((bouwblok.volgnummer + verschuiving) % 5) + 1;
  }
  return {
    id, scanUitvoeringId: "x", organisatieLidId: "L", status: "afgerond", antwoorden, opmerkingenPerBouwblok: {}, notitie: null,
    aangemaaktOp: "x", uitgenodigdOp: "x", gestartOp: "x", afgerondOp: "2026-10-01T10:00:00Z", bewaarVerlengdTot: null,
  } as unknown as ScanInvulling;
}
const meting = (id: string, meetdatum: string, extra: Partial<ScanUitvoering> = {}): ScanUitvoering => ({
  id, organisatieId: "O", assessmentId: AID, label: `Meting ${id}`, meetdatum, aangemaaktOp: "x", invullingen: [scan(`s-${id}`)], ...extra,
});
const stap = (useCaseId: string, extra: Partial<Adviesstap> = {}): Adviesstap => ({
  id: `st-${useCaseId}`, adviesverloopId: "AV", useCaseId, status: "gedaan", bouwsteenId: null, metingId: null, link: "", gedaanOp: "2026-10-02T10:00:00Z", gedaanDoor: "G", ...extra,
});
const av = (extra: Partial<Adviesverloop> = {}): Adviesverloop => ({
  id: "AV", organisatieId: "O", onderdeelId: null, status: "lopend", afgerondOp: null, startMetingId: "m1", peilMetingId: null, aangemaaktDoor: "G",
  aangemaaktOp: "2026-10-01T10:00:00Z", extraBouwsteenIds: [], rolId: "consultant", rolTekst: "", stappen: [],
  metingen: [{ adviesverloopId: "AV", metingId: "m1", label: "Nulmeting", gekoppeldOp: "x", gekoppeldDoor: "G" }], ...extra,
});
const gekoppeld = (...ids: string[]) => ids.map((metingId) => ({ adviesverloopId: "AV", metingId, label: null, gekoppeldOp: "x", gekoppeldDoor: "G" }));
const org = (extra: Partial<Organisatie> = {}): Organisatie => ({
  id: "O", naam: "Org O", kenmerken: {}, leden: [], scanUitvoeringen: [meting("m1", "2026-03-01")], aangemaaktDoor: null, toegewezenAan: [],
  benchmarkToegestaan: false, aangemaaktOp: "x", gewijzigdOp: "x", ...extra,
});
const bouwsteenNummers = (r: { bouwblok: { volgnummer: number } }[]) => r.map((x) => x.bouwblok.volgnummer);

describe("de shortlist", () => {
  const resultaten = metingResultaten(A, org(), meting("m1", "2026-03-01"));

  it("bevat de laagste scores, en bij gelijke scores het laagste nummer", () => {
    expect(bouwsteenNummers(shortlist(resultaten, [], 3))).toEqual([5, 10, 15]);
    expect(bouwsteenNummers(shortlist(resultaten, [], 2))).toEqual([5, 10]);
  });

  it("voegt de toegevoegde bouwstenen toe in de volgorde van de score en markeert ze", () => {
    const hoog = resultaten.find((r) => r.bouwblok.volgnummer === 4)!.bouwblok.id; // score 5
    const lijst = shortlist(resultaten, [hoog], 3);
    expect(bouwsteenNummers(lijst)).toEqual([5, 10, 15, 4]);
    expect(lijst.map((r) => r.standaard)).toEqual([true, true, true, false]);
  });

  it("slaat een bouwsteen zonder score over", () => {
    const zonder = resultaten.map((r, i) => (i === 0 ? { ...r, score: null } : r));
    expect(opLaagsteScore(zonder)).toHaveLength(resultaten.length - 1);
  });

  it("koppelt een score aan de klassecode van de catalogus", () => {
    expect(klasseCodeVan("rood")).toBe("basis");
    expect(klasseCodeVan("oranje")).toBe("uitbouwen");
    expect(klasseCodeVan("groen")).toBe("sterk");
  });
});

describe("peilmeting en eerste Meting", () => {
  const o = org({ scanUitvoeringen: [meting("m1", "2026-03-01"), meting("m2", "2026-06-01"), meting("m3", "2026-09-01", { invullingen: [] })] });

  it("is automatisch de meest recente gekoppelde Meting met afgeronde scans", () => {
    expect(peilMeting(o, av({ metingen: gekoppeld("m1", "m2", "m3") }))?.id).toBe("m2");
  });
  it("is de gekozen Meting, maar niet als ze geen afgeronde scans heeft of niet meer gekoppeld is", () => {
    expect(peilMeting(o, av({ metingen: gekoppeld("m1", "m2"), peilMetingId: "m1" }))?.id).toBe("m1");
    expect(peilMeting(o, av({ metingen: gekoppeld("m1", "m2", "m3"), peilMetingId: "m3" }))?.id).toBe("m2");
    expect(peilMeting(o, av({ metingen: gekoppeld("m1"), peilMetingId: "m2" }))?.id).toBe("m1");
  });
  it("kent geen peilmeting zolang geen gekoppelde Meting afgeronde scans heeft", () => {
    expect(peilMeting(o, av({ metingen: gekoppeld("m3"), startMetingId: "m3" }))).toBeNull();
  });
  it("neemt de startMeting als eerste, en anders de oudste", () => {
    expect(eersteMeting(o, av({ metingen: gekoppeld("m1", "m2"), startMetingId: "m2" }))?.id).toBe("m2");
    expect(eersteMeting(o, av({ metingen: gekoppeld("m2", "m1"), startMetingId: "weg" }))?.id).toBe("m1");
  });
  it("toont het verschil sinds de eerste Meting alleen bij hetzelfde Assessment", () => {
    const o2 = org({ scanUitvoeringen: [meting("m1", "2026-03-01", { invullingen: [scan("a", 0)] }), meting("m2", "2026-09-01", { invullingen: [scan("b", 1)] })] });
    const verschil = verschilSindsEerste(A, o2, av({ metingen: gekoppeld("m1", "m2") }));
    expect(verschil).not.toBeNull();
    expect(verschil!.size).toBe(15);
    expect(verschilTekst(0.4)).toBe("+0,4");
    expect(verschilTekst(-0.2)).toBe("−0,2");
    expect(verschilTekst(0)).toBe("0,0");
    expect(verschilSindsEerste(A, o2, av({ metingen: gekoppeld("m1") }))).toBeNull();
    const ander = org({ scanUitvoeringen: [meting("m1", "2026-03-01"), meting("m2", "2026-09-01", { assessmentId: "zorgscan" })] });
    expect(verschilSindsEerste(A, ander, av({ metingen: gekoppeld("m1", "m2") }))).toBeNull();
  });
});

describe("welke Metingen te koppelen zijn", () => {
  const benchmark = (assessmentIds: string[]): Benchmark => ({ id: "b", naam: "B", niveau: "organisaties", assessmentIds, leden: [{ organisatieId: "O", metingId: "m1" }] } as unknown as Benchmark);
  const o = org({
    scanUitvoeringen: [
      meting("m1", "2026-03-01"),
      meting("m2", "2026-06-01"),
      meting("m3", "2026-07-01", { invullingen: [] }),
      meting("m4", "2026-08-01", { assessmentId: "zorgscan" }),
      meting("m5", "2026-09-01", { onderdeelId: "x" }),
    ],
    adviesverlopen: [av({ id: "ANDER", metingen: [{ adviesverloopId: "ANDER", metingId: "m2", label: null, gekoppeldOp: "x", gekoppeldDoor: "G" }] })],
  });
  const reden = (id: string, benchmarks: Benchmark[] = []) => koppelRijen(o, av(), null, [A, { ...A, id: "zorgscan" }], benchmarks).find((r) => r.meting.id === id)?.reden ?? null;

  it("noemt de reden van elke Meting die niet te kiezen is", () => {
    expect(reden("m2")).toBe("Hoort bij een ander adviesverloop");
    expect(reden("m3")).toBe("Nog geen afgeronde scans");
    expect(reden("m4")).toBe("Geen benchmark met beide Assessments");
    expect(reden("m1")).toBe("Minstens één Meting");
  });
  it("laat een Meting van een ander Assessment toe als de Organisatie in een benchmark met beide Assessments zit", () => {
    expect(reden("m4", [benchmark([AID, "zorgscan"])])).toBeNull();
    expect(reden("m4", [benchmark([AID])])).toBe("Geen benchmark met beide Assessments");
  });
  it("laat alleen de Metingen van hetzelfde Onderdeel zien", () => {
    expect(koppelRijen(o, av(), null, [A], []).map((r) => r.meting.id)).not.toContain("m5");
  });
  it("laat de laatste gekoppelde Meting niet los, maar wel een van twee", () => {
    const twee = av({ metingen: gekoppeld("m1", "m2x") });
    const rij = koppelRijen(org({ scanUitvoeringen: [meting("m1", "2026-03-01"), meting("m2x", "2026-04-01")] }), twee, null, [A], []);
    expect(rij.every((r) => r.reden === null)).toBe(true);
  });
});

describe("de fasestrook", () => {
  const catalogus = ADVIES_CATALOGUS_BEGIN;
  const strook = (faseId: string) => catalogus.useCases.filter((u) => u.faseId === faseId && u.inStrook && !u.verborgen);

  it("heeft zonder stappen de eerste fase met use cases als huidige fase", () => {
    const v = faseVoortgang(catalogus, { stappen: [] });
    expect(v).toHaveLength(6);
    expect(v.filter((f) => f.huidig)).toHaveLength(1);
    expect(v.find((f) => f.huidig)!.fase.id).toBe(v.find((f) => f.totaal > 0)!.fase.id);
    expect(v.every((f) => f.gedaan === 0 && !f.klaar)).toBe(true);
  });
  it("telt een use case één keer, hoe vaak hij ook voor een bouwsteen is gedaan", () => {
    const eerste = strook("1")[0];
    const v = faseVoortgang(catalogus, { stappen: [stap(eerste.id, { id: "a", bouwsteenId: "b1" }), stap(eerste.id, { id: "b", bouwsteenId: "b2" })] });
    expect(v[0].gedaan).toBe(1);
  });
  it("is klaar als alle use cases in de strook gedaan zijn, en gaat dan naar de volgende fase", () => {
    const v = faseVoortgang(catalogus, { stappen: strook("1").map((u) => stap(u.id)) });
    expect(v[0].klaar).toBe(true);
    expect(v[0].huidig).toBe(false);
    expect(v.find((f) => f.huidig)!.fase.volgorde).toBeGreaterThan(1);
  });
  it("telt een use case buiten de strook of een verborgen use case niet mee", () => {
    const eigen: AdviesCatalogus = {
      ...catalogus,
      useCases: [
        { id: "1-a", faseId: "1", titel: "In", omschrijving: "", apps: [], inStrook: true, volgorde: 1, bouwsteenIds: [], klassen: [], prompts: [] },
        { id: "1-b", faseId: "1", titel: "Uit", omschrijving: "", apps: [], inStrook: false, volgorde: 2, bouwsteenIds: [], klassen: [], prompts: [] },
        { id: "1-c", faseId: "1", titel: "Verborgen", omschrijving: "", apps: [], inStrook: true, verborgen: true, volgorde: 3, bouwsteenIds: [], klassen: [], prompts: [] },
      ],
    };
    const v = faseVoortgang(eigen, { stappen: [stap("1-a")] });
    expect(v[0]).toMatchObject({ totaal: 1, gedaan: 1, klaar: true });
    expect(v.slice(1).every((f) => f.totaal === 0 && !f.klaar && !f.huidig)).toBe(true);
  });
  it("geeft de regel voor lijsten, zoals Oplossen · 0 van 4", () => {
    const regel = faseRegel(catalogus, { stappen: [] });
    expect(regel).toMatch(/^.+ · 0 van \d+$/);
  });
  it("zet de use cases voor een bouwsteen of klasse vooraan", () => {
    const eigen: AdviesCatalogus = {
      ...catalogus,
      useCases: [
        { id: "4-a", faseId: "4", titel: "Algemeen", omschrijving: "", apps: [], inStrook: true, volgorde: 1, bouwsteenIds: [], klassen: [], prompts: [] },
        { id: "4-b", faseId: "4", titel: "Basis", omschrijving: "", apps: [], inStrook: true, volgorde: 2, bouwsteenIds: [], klassen: ["basis"], prompts: [] },
        { id: "4-c", faseId: "4", titel: "Bouwsteen", omschrijving: "", apps: [], inStrook: true, volgorde: 3, bouwsteenIds: ["bs-9"], klassen: [], prompts: [] },
      ],
    };
    expect(casesVoorBouwsteen(eigen, "4", "bs-9", "groen").map((u) => u.id)).toEqual(["4-c", "4-a", "4-b"]);
    expect(casesVoorBouwsteen(eigen, "4", "bs-1", "rood").map((u) => u.id)).toEqual(["4-b", "4-a", "4-c"]);
  });
});

describe("de link van een stap", () => {
  it("accepteert leeg, http en https en weigert de rest", () => {
    expect(controleerLink("")).toEqual({ ok: true, link: "" });
    expect(controleerLink(" https://contoso.sharepoint.com/doc ")).toMatchObject({ ok: true });
    expect(controleerLink("http://x.nl/a")).toMatchObject({ ok: true });
    expect(controleerLink("ftp://x.nl")).toMatchObject({ ok: false });
    expect(controleerLink("javascript:alert(1)")).toMatchObject({ ok: false });
    expect(controleerLink("geen adres")).toMatchObject({ ok: false });
  });
});

describe("het contextblok", () => {
  const o = org({ scanUitvoeringen: [meting("m1", "2026-03-01", { invullingen: [scan("a"), scan("b"), scan("c")] })] });
  const peil = o.scanUitvoeringen[0];
  const invoer = (minRespondenten: number) => ({
    organisatie: o, onderdeelNaam: "Hele organisatie", assessment: A, peil, peilLabel: "Nulmeting", resultaten: metingResultaten(A, o, peil),
    bouwsteenId: null, spreiding: new Map(), benchmark: null, eerste: null, kpiDefinities: [], minRespondenten,
  });

  it("bevat de Meting, het aantal scans en de scores per klasse", () => {
    const blok = bouwContextblok(invoer(3));
    expect(blok).toContain(`Assessment: ${A.naam}`);
    expect(blok).toContain("Afgeronde scans: 3");
    expect(blok).toContain("Totaalscore:");
    expect(blok).toContain("Basis op orde brengen:");
    expect(blok).toContain("Sterke punten:");
  });
  it("laat de scores weg onder de minimale groepsgrootte", () => {
    const blok = bouwContextblok(invoer(4));
    expect(blok).toContain("Afgeronde scans: 3");
    expect(blok).not.toContain("Totaalscore");
    expect(blok).not.toContain("Basis op orde brengen");
    expect(blok).toContain("Niet meegenomen");
  });
  it("zet rol, context en prompt onder elkaar en laat lege delen weg", () => {
    expect(bouwPromptTekst(" rol ", "", " vraag ")).toBe("rol\n\nvraag");
  });
});

describe("opruimen van een adviesverloop", () => {
  it("laat een gekoppelde Meting die er niet meer is vallen en kiest een nieuwe start- en peilmeting", () => {
    const o = org({
      scanUitvoeringen: [meting("m2", "2026-06-01")],
      adviesverlopen: [av({ metingen: gekoppeld("m1", "m2"), startMetingId: "m1", peilMetingId: "m1", stappen: [stap("1-1", { metingId: "m1" }), stap("1-2", { metingId: "m2" })] })],
    });
    expect(ruimAdviesverlopenOp(o)).toEqual([]);
    const a = o.adviesverlopen![0];
    expect(a.metingen.map((m) => m.metingId)).toEqual(["m2"]);
    expect(a.startMetingId).toBe("m2");
    expect(a.peilMetingId).toBe("m2");
    expect(a.stappen.map((s) => s.metingId)).toEqual([null, "m2"]);
  });
  it("laat een adviesverloop zonder Meting verdwijnen en geeft het terug", () => {
    const o = org({ scanUitvoeringen: [], adviesverlopen: [av()] });
    const weg = ruimAdviesverlopenOp(o);
    expect(weg).toHaveLength(1);
    expect(o.adviesverlopen).toEqual([]);
  });
  it("verandert niets als alles klopt", () => {
    const o = org({ adviesverlopen: [av()] });
    const voor = JSON.stringify(o.adviesverlopen);
    expect(ruimAdviesverlopenOp(o)).toEqual([]);
    expect(JSON.stringify(o.adviesverlopen)).toBe(voor);
  });
  it("vindt het adviesverloop van een Meting, het lopende van een Onderdeel en de blokkade bij de enige Meting", () => {
    const o = org({ adviesverlopen: [av({ id: "klaar", status: "afgerond" }), av({ id: "loopt", metingen: gekoppeld("m1", "m2") })] });
    expect(adviesverloopVoorMeting(o, "m2")?.id).toBe("loopt");
    expect(lopendAdviesverloop(o, null)?.id).toBe("loopt");
    expect(lopendAdviesverloop(o, "ander")).toBeUndefined();
    expect(blokkadeVerwijderenMeting(org({ adviesverlopen: [av()] }), "m1")).toMatch(/enige Meting/);
    expect(blokkadeVerwijderenMeting(o, "m2")).toBeNull();
    expect(blokkadeVerwijderenMeting(o, "onbekend")).toBeNull();
  });
});

describe("de rechten op het adviesverloop", () => {
  const gebruiker = (rol: string, id = "G1") => ({ id, rol, actief: true }) as unknown as Gebruiker;
  const eigen = { aangemaaktDoor: "G1", toegewezenAan: [] as string[] };
  const vreemd = { aangemaaktDoor: "G2", toegewezenAan: [] as string[] };

  it("geeft een Admin alle Organisaties en een Consultant de eigen", () => {
    expect(magAdviesverloop(gebruiker("admin"), vreemd)).toBe(true);
    expect(magAdviesverloop(gebruiker("consultant"), eigen)).toBe(true);
    expect(magAdviesverloop(gebruiker("consultant"), { aangemaaktDoor: "G2", toegewezenAan: ["G1"] })).toBe(true);
    expect(magAdviesverloop(gebruiker("consultant"), vreemd)).toBe(false);
  });
  it("geeft een Lead, een Respondent en niemand geen toegang", () => {
    expect(magAdviesverloop(gebruiker("lead"), eigen)).toBe(false);
    expect(magAdviesverloop(gebruiker("respondent"), eigen)).toBe(false);
    expect(magAdviesverloop(null, eigen)).toBe(false);
  });
  it("laat alleen een Admin de catalogus beheren", () => {
    expect(magAdviescatalogusBeheren(gebruiker("admin"))).toBe(true);
    expect(magAdviescatalogusBeheren(gebruiker("consultant"))).toBe(false);
    expect(magAdviescatalogusBeheren(null)).toBe(false);
  });
});
