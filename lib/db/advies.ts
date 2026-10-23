import type { Adviesstap, Adviesverloop, AdviesverloopMeting, Organisatie } from "../types";
import { laadAlles, slaAlles } from "./store";
import { logAudit } from "../audit-store";
import { organisatieContext } from "../audit-context";
import { nieuwId } from "../id";
import { getIngelogdeGebruikerId } from "../admin-auth";
import { getAssessments } from "../assessment-store";
import { getGebruikers } from "../gebruikers-store";
import { profielVan } from "../advies-profiel";
import { getBenchmarksMetLeden } from "../benchmark-leden";
import { getAdviesCatalogus } from "../advies-catalogus-store";
import { LABEL_MAX, adviesverlopenVan, controleerLink, geschikteBenchmarks, koppelRijen, lopendAdviesverloop, onderdeelNaamVan } from "../advies";
import type { Resultaat } from "./meting-plannen";

/**
 * Het adviesverloop van een Organisatie of Onderdeel: Starten, Metingen koppelen, peilmeting, shortlist, rol, stappen, afronden en
 * verwijderen (`adviesverloop.md`, `datamodel.md`, Adviesverloop). Elke wijziging wordt gelogd, nooit met de inhoud van een prompt. Een afgerond
 * adviesverloop is alleen nog te lezen, behalve heropenen en verwijderen.
 */

interface Context {
  alles: Organisatie[];
  organisatie: Organisatie;
  av: Adviesverloop;
}

function zoek(organisatieId: string, adviesverloopId: string): Context | null {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  const av = organisatie?.adviesverlopen?.find((a) => a.id === adviesverloopId);
  return organisatie && av ? { alles, organisatie, av } : null;
}

const GEEN_AV = { ok: false, reden: "Adviesverloop niet gevonden." } as const;
const AFGEROND = { ok: false, reden: "Dit adviesverloop is afgerond. Heropen het om iets te wijzigen." } as const;

function opslaan(c: Context): void {
  c.organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(c.alles);
}

function context(c: Context) {
  return { ...organisatieContext(c.organisatie), onderdeelNaam: onderdeelNaamVan(c.organisatie, c.av.onderdeelId) };
}

function metingContextNaam(organisatie: Organisatie, metingId: string | null): string | null {
  const m = organisatie.scanUitvoeringen.find((x) => x.id === metingId);
  return m ? m.label : null;
}

function audit(c: Context, actie: string, extra: Record<string, unknown>): void {
  logAudit({ actie, entiteitType: "adviesverloop", entiteitId: c.av.id, entiteitNaam: c.organisatie.naam, details: { ...context(c), ...extra } });
}

/** Het adviesverloop starten vanaf een Meting met afgeronde scans. Is er al een lopend adviesverloop voor dit Onderdeel, dan kan dat niet. */
export function startAdviesverloop(organisatieId: string, metingId: string, label?: string): Resultaat<{ adviesverloop: Adviesverloop }> {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  const meting = organisatie?.scanUitvoeringen.find((m) => m.id === metingId);
  if (!organisatie || !meting) return { ok: false, reden: "Meting niet gevonden." };
  const onderdeelId = meting.onderdeelId ?? null;
  if (lopendAdviesverloop(organisatie, onderdeelId)) return { ok: false, reden: "Er loopt al een adviesverloop voor dit onderdeel. Koppel de Meting daaraan." };
  const rij = koppelRijen(organisatie, null, onderdeelId, getAssessments(), getBenchmarksMetLeden(alles), metingId).find((r) => r.meting.id === metingId);
  if (rij?.reden && rij.reden !== "Minstens één Meting") return { ok: false, reden: rij.reden };
  const nu = new Date().toISOString();
  const gebruiker = getIngelogdeGebruikerId() ?? "";
  // De rol is de standaardrol uit de adviescontext van de Consultant (`adviesverloop.md`, Jouw rol bij deze klant).
  const profiel = profielVan(getGebruikers().find((g) => g.id === gebruiker), getAdviesCatalogus());
  const av: Adviesverloop = {
    id: nieuwId(),
    organisatieId,
    onderdeelId,
    status: "lopend",
    afgerondOp: null,
    startMetingId: metingId,
    peilMetingId: null,
    aangemaaktDoor: gebruiker,
    aangemaaktOp: nu,
    benchmarkId: null,
    shortlistBouwsteenIds: null,
    nvFaseIds: [],
    nvUseCaseIds: [],
    rolId: profiel.standaardRolId,
    metingen: [{ adviesverloopId: "", metingId, label: label?.trim().slice(0, LABEL_MAX) || null, gekoppeldOp: nu, gekoppeldDoor: gebruiker }],
    stappen: [],
  };
  av.metingen[0].adviesverloopId = av.id;
  organisatie.adviesverlopen = [...adviesverlopenVan(organisatie), av];
  const c: Context = { alles, organisatie, av };
  opslaan(c);
  audit(c, "adviesverloop.statusGewijzigd", { status: "lopend", actie: "gestart", metingLabel: meting.label });
  return { ok: true, adviesverloop: av };
}

/** De Metingen van het adviesverloop vervangen door een selectie, elk met een eigen label. Er blijft altijd minstens één Meting gekoppeld. */
export function koppelMetingen(
  organisatieId: string,
  adviesverloopId: string,
  selectie: { metingId: string; label: string }[],
  benchmarkKeuze?: string | null
): Resultaat {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  if (c.av.status === "afgerond") return AFGEROND;
  const unieke = new Map(selectie.map((s) => [s.metingId, s.label.trim().slice(0, LABEL_MAX)]));
  if (unieke.size === 0) return { ok: false, reden: "Er blijft minstens één Meting gekoppeld." };
  const benchmarks = getBenchmarksMetLeden(c.alles);
  const rijen = koppelRijen(c.organisatie, c.av, c.av.onderdeelId, getAssessments(), benchmarks);
  const huidig = new Map(c.av.metingen.map((m) => [m.metingId, m]));
  for (const id of unieke.keys()) {
    if (huidig.has(id)) continue;
    const rij = rijen.find((r) => r.meting.id === id);
    if (!rij) return { ok: false, reden: "Meting niet gevonden." };
    if (rij.reden) return { ok: false, reden: rij.reden };
  }
  // Bij Metingen van verschillende Assessments hoort een Benchmark waarin de Organisatie en al die Assessments zitten (`datamodel.md`, Ander Assessment).
  const assessmentIds = [...new Set(c.organisatie.scanUitvoeringen.filter((m) => unieke.has(m.id)).map((m) => m.assessmentId))];
  let benchmarkId: string | null = null;
  if (assessmentIds.length > 1) {
    const geschikt = geschikteBenchmarks(benchmarks, c.organisatie.id, assessmentIds);
    if (geschikt.length === 0) return { ok: false, reden: "Geen benchmark met beide Assessments" };
    const gekozen = [benchmarkKeuze, c.av.benchmarkId].find((id) => id && geschikt.some((b) => b.id === id));
    if (gekozen) benchmarkId = gekozen;
    else if (geschikt.length === 1) benchmarkId = geschikt[0].id;
    else return { ok: false, reden: "Kies een Benchmark voor de koppeling." };
  }
  const benchmarkGewijzigd = (c.av.benchmarkId ?? null) !== benchmarkId;
  c.av.benchmarkId = benchmarkId;
  const nu = new Date().toISOString();
  const gebruiker = getIngelogdeGebruikerId() ?? "";
  const nieuw: AdviesverloopMeting[] = [...unieke].map(([metingId, label]) => {
    const bestaand = huidig.get(metingId);
    return bestaand ? { ...bestaand, label: label || null } : { adviesverloopId: c.av.id, metingId, label: label || null, gekoppeldOp: nu, gekoppeldDoor: gebruiker };
  });
  const toegevoegd = nieuw.filter((m) => !huidig.has(m.metingId));
  const losgemaakt = c.av.metingen.filter((m) => !unieke.has(m.metingId));
  const labelsGewijzigd = nieuw.filter((m) => huidig.has(m.metingId) && huidig.get(m.metingId)!.label !== m.label);
  c.av.metingen = nieuw;
  if (!unieke.has(c.av.startMetingId)) {
    const eerste = c.organisatie.scanUitvoeringen.find((m) => unieke.has(m.id));
    c.av.startMetingId = eerste?.id ?? [...unieke.keys()][0];
  }
  if (c.av.peilMetingId && !unieke.has(c.av.peilMetingId)) c.av.peilMetingId = null;
  for (const s of c.av.stappen) if (s.metingId && !unieke.has(s.metingId)) s.metingId = null;
  if (toegevoegd.length === 0 && losgemaakt.length === 0 && labelsGewijzigd.length === 0 && !benchmarkGewijzigd) return { ok: true };
  opslaan(c);
  for (const m of toegevoegd) audit(c, "adviesverloop.metingGekoppeld", { actie: "gekoppeld", metingLabel: metingContextNaam(c.organisatie, m.metingId), label: m.label });
  for (const m of losgemaakt) audit(c, "adviesverloop.metingGekoppeld", { actie: "losgekoppeld", metingLabel: metingContextNaam(c.organisatie, m.metingId), label: m.label });
  for (const m of labelsGewijzigd) audit(c, "adviesverloop.metingGekoppeld", { actie: "label gewijzigd", metingLabel: metingContextNaam(c.organisatie, m.metingId), label: m.label });
  return { ok: true };
}

/** Een Meting aan het lopende adviesverloop koppelen, met een optioneel label (de knop Koppelen in het Meting-overzicht). */
export function koppelMeting(organisatieId: string, adviesverloopId: string, metingId: string, label: string, benchmarkKeuze?: string | null): Resultaat {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  return koppelMetingen(organisatieId, adviesverloopId, [...c.av.metingen.map((m) => ({ metingId: m.metingId, label: m.label ?? "" })), { metingId, label }], benchmarkKeuze);
}

/** De peilmeting kiezen: `null` is automatisch de meest recente gekoppelde Meting met afgeronde scans. */
export function zetPeilMeting(organisatieId: string, adviesverloopId: string, metingId: string | null): Resultaat {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  if (c.av.status === "afgerond") return AFGEROND;
  if (metingId !== null && !c.av.metingen.some((m) => m.metingId === metingId)) return { ok: false, reden: "Deze Meting is niet gekoppeld." };
  if (c.av.peilMetingId === metingId) return { ok: true };
  c.av.peilMetingId = metingId;
  opslaan(c);
  audit(c, "adviesverloop.shortlistGewijzigd", { actie: "peilmeting gekozen", metingLabel: metingId ? metingContextNaam(c.organisatie, metingId) : "automatisch" });
  return { ok: true };
}

export interface BouwsteenNaam {
  nummer: number;
  naam: string;
}

/**
 * De shortlist vastleggen (`adviesverloop.md`, Bouwstenen kiezen): De gekozen bouwstenen in de gekozen volgorde, of `null` voor de standaard (de laagste scores).
 * `vorige` is de lijst zoals de Consultant hem zag, zodat het log zegt wat er is toegevoegd of weggehaald, of dat alleen de volgorde veranderde.
 */
export function zetShortlist(
  organisatieId: string,
  adviesverloopId: string,
  nieuw: string[] | null,
  vorige: string[],
  namen: Record<string, BouwsteenNaam>
): Resultaat {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  if (c.av.status === "afgerond") return AFGEROND;
  const uniek = nieuw === null ? null : [...new Set(nieuw)];
  if (JSON.stringify(c.av.shortlistBouwsteenIds) === JSON.stringify(uniek)) return { ok: true };
  c.av.shortlistBouwsteenIds = uniek;
  opslaan(c);
  const nu = uniek ?? [];
  const naam = (id: string) => ({ bouwsteenNummer: namen[id]?.nummer ?? null, bouwsteenNaam: namen[id]?.naam ?? null });
  if (uniek === null) {
    audit(c, "adviesverloop.shortlistGewijzigd", { actie: "hersteld naar de standaard" });
    return { ok: true };
  }
  const toegevoegd = nu.filter((id) => !vorige.includes(id));
  const weg = vorige.filter((id) => !nu.includes(id));
  for (const id of toegevoegd) audit(c, "adviesverloop.shortlistGewijzigd", { actie: "toegevoegd", ...naam(id) });
  for (const id of weg) audit(c, "adviesverloop.shortlistGewijzigd", { actie: "verwijderd", ...naam(id) });
  if (toegevoegd.length === 0 && weg.length === 0) audit(c, "adviesverloop.shortlistGewijzigd", { actie: "volgorde gewijzigd" });
  return { ok: true };
}

/** De rol kiezen die bij dit adviesverloop hoort: Een `AdviesProfielRol.id` uit de adviescontext van de Consultant. Niet gelogd. */
export function zetRol(organisatieId: string, adviesverloopId: string, rolId: string): Resultaat {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  if (c.av.status === "afgerond") return AFGEROND;
  if (c.av.rolId === rolId) return { ok: true };
  c.av.rolId = rolId;
  opslaan(c);
  return { ok: true };
}

/** Een fase overslaan of weer meenemen (`adviesverloop.md`, Overslaan en niet van toepassing). */
export function zetFaseOverslaan(organisatieId: string, adviesverloopId: string, faseId: string, overslaan: boolean): Resultaat {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  if (c.av.status === "afgerond") return AFGEROND;
  const fase = getAdviesCatalogus().fasen.find((f) => f.id === faseId);
  if (!fase) return { ok: false, reden: "Fase niet gevonden." };
  if (c.av.nvFaseIds.includes(faseId) === overslaan) return { ok: true };
  c.av.nvFaseIds = overslaan ? [...c.av.nvFaseIds, faseId] : c.av.nvFaseIds.filter((id) => id !== faseId);
  opslaan(c);
  audit(c, "adviesstap.gedaan", { status: overslaan ? "fase overgeslagen" : "fase weer meegenomen", faseNaam: fase.naam });
  return { ok: true };
}

/** Een use case niet van toepassing verklaren of weer meenemen. Met een stap kan dat niet: Zet de stap eerst terug naar open. */
export function zetUseCaseNv(organisatieId: string, adviesverloopId: string, useCaseId: string, nv: boolean): Resultaat {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  if (c.av.status === "afgerond") return AFGEROND;
  const useCase = getAdviesCatalogus().useCases.find((u) => u.id === useCaseId);
  if (!useCase) return { ok: false, reden: "Use case niet gevonden." };
  if (c.av.nvUseCaseIds.includes(useCaseId) === nv) return { ok: true };
  if (nv && c.av.stappen.some((s) => s.useCaseId === useCaseId)) return { ok: false, reden: "Deze use case is al gedaan. Zet de stap eerst terug naar open." };
  c.av.nvUseCaseIds = nv ? [...c.av.nvUseCaseIds, useCaseId] : c.av.nvUseCaseIds.filter((id) => id !== useCaseId);
  opslaan(c);
  audit(c, "adviesstap.gedaan", { useCaseCode: useCase.id, useCaseTitel: useCase.titel, status: nv ? "niet van toepassing" : "weer meegenomen" });
  return { ok: true };
}

export interface StapInvoer {
  useCaseId: string;
  status: Adviesstap["status"];
  bouwsteenId: string | null;
  metingId: string | null;
  link?: string;
}

/**
 * Een stap vastleggen (een gekopieerde prompt of "Markeer als gedaan"). Dezelfde use case voor dezelfde bouwsteen is één stap: Een tweede keer
 * kopiëren of markeren werkt die stap bij. Alleen de stap en de link worden bewaard, niet de inhoud van de prompt.
 */
export function legStapVast(organisatieId: string, adviesverloopId: string, invoer: StapInvoer): Resultaat<{ stap: Adviesstap }> {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  if (c.av.status === "afgerond") return AFGEROND;
  const useCase = getAdviesCatalogus().useCases.find((u) => u.id === invoer.useCaseId);
  if (!useCase) return { ok: false, reden: "Use case niet gevonden." };
  const link = controleerLink(invoer.link ?? "");
  if (!link.ok) return { ok: false, reden: link.reden };
  const bestaand = c.av.stappen.find((s) => s.useCaseId === invoer.useCaseId && s.bouwsteenId === invoer.bouwsteenId);
  const nu = new Date().toISOString();
  const gebruiker = getIngelogdeGebruikerId() ?? "";
  // Een gekopieerde prompt overschrijft een eerder "gedaan" met link niet: De link blijft staan.
  const stap: Adviesstap = bestaand
    ? { ...bestaand, status: invoer.status, metingId: invoer.metingId, link: link.link || bestaand.link, gedaanOp: nu, gedaanDoor: gebruiker }
    : { id: nieuwId(), adviesverloopId: c.av.id, useCaseId: invoer.useCaseId, status: invoer.status, bouwsteenId: invoer.bouwsteenId, metingId: invoer.metingId, link: link.link, gedaanOp: nu, gedaanDoor: gebruiker };
  c.av.stappen = bestaand ? c.av.stappen.map((s) => (s.id === bestaand.id ? stap : s)) : [...c.av.stappen, stap];
  // Een use case met een stap is niet meer van toepassing-verklaard.
  c.av.nvUseCaseIds = c.av.nvUseCaseIds.filter((id) => id !== invoer.useCaseId);
  opslaan(c);
  audit(c, "adviesstap.gedaan", { useCaseCode: useCase.id, useCaseTitel: useCase.titel, status: invoer.status === "gedaan" ? "gedaan" : "prompt gekopieerd", metingLabel: metingContextNaam(c.organisatie, invoer.metingId), metLink: !!stap.link });
  return { ok: true, stap };
}

/** Een stap terugzetten naar open: De Adviesstap verdwijnt. */
export function zetStapTerug(organisatieId: string, adviesverloopId: string, stapId: string): Resultaat {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  if (c.av.status === "afgerond") return AFGEROND;
  const stap = c.av.stappen.find((s) => s.id === stapId);
  if (!stap) return { ok: true };
  const useCase = getAdviesCatalogus().useCases.find((u) => u.id === stap.useCaseId);
  c.av.stappen = c.av.stappen.filter((s) => s.id !== stapId);
  opslaan(c);
  audit(c, "adviesstap.gedaan", { useCaseCode: stap.useCaseId, useCaseTitel: useCase?.titel ?? null, status: "teruggezet", metingLabel: metingContextNaam(c.organisatie, stap.metingId) });
  return { ok: true };
}

export function rondAdviesverloopAf(organisatieId: string, adviesverloopId: string): Resultaat {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  if (c.av.status === "afgerond") return { ok: true };
  c.av.status = "afgerond";
  c.av.afgerondOp = new Date().toISOString();
  opslaan(c);
  audit(c, "adviesverloop.statusGewijzigd", { status: "afgerond", actie: "afgerond" });
  return { ok: true };
}

/** Heropenen kan alleen als er voor dit Onderdeel geen ander lopend adviesverloop is. */
export function heropenAdviesverloop(organisatieId: string, adviesverloopId: string): Resultaat {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  if (c.av.status === "lopend") return { ok: true };
  if (lopendAdviesverloop(c.organisatie, c.av.onderdeelId)) return { ok: false, reden: "Er loopt al een ander adviesverloop voor dit onderdeel." };
  c.av.status = "lopend";
  c.av.afgerondOp = null;
  opslaan(c);
  audit(c, "adviesverloop.statusGewijzigd", { status: "lopend", actie: "heropend" });
  return { ok: true };
}

/** Het adviesverloop met zijn koppelingen en stappen verwijderen. De Metingen blijven bestaan. */
export function verwijderAdviesverloop(organisatieId: string, adviesverloopId: string): Resultaat<{ aantalStappen: number }> {
  const c = zoek(organisatieId, adviesverloopId);
  if (!c) return GEEN_AV;
  const aantalStappen = c.av.stappen.length;
  c.organisatie.adviesverlopen = adviesverlopenVan(c.organisatie).filter((a) => a.id !== c.av.id);
  opslaan(c);
  audit(c, "adviesverloop.verwijderd", { aantalStappen, aantalMetingen: c.av.metingen.length });
  return { ok: true, aantalStappen };
}
