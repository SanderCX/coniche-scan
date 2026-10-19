/**
 * De definities van KPI's en de kanalen aanpassen (`beheerpagina.md`, punt 3, KPI's en kanalen; `datamodel.md`, KPI's en kanalen).
 * Alleen een Admin (`content.beheren`). Gelogd als `kpiDefinitie.aangemaakt`, `kpiDefinitie.gewijzigd`, `kanaal.aangemaakt` en
 * `kanaal.verwijderd`, zonder persoonsgegevens. De opslag staat bij de instellingen, de waarden bij de Organisaties.
 */
import { Kanaal, KpiDefinitie } from "./types";
import { getInstellingen, schrijfInstellingen } from "./instellingen-store";
import { logAudit } from "./audit-store";
import { nieuwId } from "./id";
import { aantalWaardenOpNiveau, gevolgenKanaalVerwijderen } from "./kpi";
import { laadAlles, slaAlles } from "./db/store";

export type BeheerResultaat<T = object> = ({ ok: true } & T) | { ok: false; reden: string };

const gelijk = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Een id voor een nieuwe KPI: De naam in kleine letters met streepjes, uniek tussen de bestaande. */
function kpiIdVoor(naam: string, bestaand: KpiDefinitie[]): string {
  const basis = naam.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kpi";
  let id = basis;
  let n = 2;
  while (bestaand.some((k) => k.id === id)) id = `${basis}-${n++}`;
  return id;
}

export function maakKpi(naam: string): BeheerResultaat<{ kpi: KpiDefinitie }> {
  const schoon = naam.trim();
  if (!schoon) return { ok: false, reden: "Vul een naam in." };
  const { kpiDefinities } = getInstellingen();
  if (kpiDefinities.some((k) => gelijk(k.naam, schoon))) return { ok: false, reden: "Er is al een KPI met deze naam." };
  const kpi: KpiDefinitie = {
    id: kpiIdVoor(schoon, kpiDefinities),
    naam: schoon,
    eenheid: null,
    perOnderdeel: false,
    perKanaal: false,
    volgorde: Math.max(0, ...kpiDefinities.map((k) => k.volgorde)) + 1,
  };
  schrijfInstellingen({ kpiDefinities: [...kpiDefinities, kpi] });
  logAudit({ actie: "kpiDefinitie.aangemaakt", entiteitType: "kpiDefinitie", entiteitId: kpi.id, entiteitNaam: kpi.naam, details: { kpiNaam: kpi.naam } });
  return { ok: true, kpi };
}

export interface KpiWijzigingen {
  naam: string;
  eenheid: string | null;
  perOnderdeel: boolean;
  perKanaal: boolean;
}

/** Hoeveel waarden een vlag vasthoudt: Een Admin kan hem niet uitzetten zolang er waarden op dat niveau staan. */
export function vlagBlokkade(kpiId: string, niveau: "onderdeel" | "kanaal"): number {
  return aantalWaardenOpNiveau(laadAlles(), kpiId, niveau);
}

/**
 * De wijzigingen van de tabel KPI's in één keer (Opslaan). Elk gewijzigd veld wordt gelogd met de oude en de nieuwe waarde. Een vlag
 * die uit moet terwijl er waarden op dat niveau staan, wordt geweigerd.
 */
export function wijzigKpis(wijzigingen: Record<string, KpiWijzigingen>): BeheerResultaat<{ gewijzigd: number }> {
  const { kpiDefinities } = getInstellingen();
  const namen = new Map<string, string>();
  for (const k of kpiDefinities) {
    const w = wijzigingen[k.id];
    const naam = (w?.naam ?? k.naam).trim();
    if (!naam) return { ok: false, reden: "Vul bij elke KPI een naam in." };
    const sleutel = naam.toLowerCase();
    if (namen.has(sleutel)) return { ok: false, reden: `Er zijn twee KPI's met de naam "${naam}".` };
    namen.set(sleutel, k.id);
    if (w && k.perOnderdeel && !w.perOnderdeel && vlagBlokkade(k.id, "onderdeel") > 0) {
      return { ok: false, reden: `${k.naam} heeft waarden per onderdeel: De vlag Per onderdeel kan niet uit.` };
    }
    if (w && k.perKanaal && !w.perKanaal && vlagBlokkade(k.id, "kanaal") > 0) {
      return { ok: false, reden: `${k.naam} heeft waarden per kanaal: De vlag Per kanaal kan niet uit.` };
    }
  }
  let gewijzigd = 0;
  const nieuw = kpiDefinities.map((k) => {
    const w = wijzigingen[k.id];
    if (!w) return k;
    const eenheid = w.eenheid?.trim() ? w.eenheid.trim() : null;
    const velden: Record<string, { oud: unknown; nieuw: unknown }> = {};
    if (w.naam.trim() !== k.naam) velden.naam = { oud: k.naam, nieuw: w.naam.trim() };
    if (eenheid !== k.eenheid) velden.eenheid = { oud: k.eenheid, nieuw: eenheid };
    if (w.perOnderdeel !== k.perOnderdeel) velden.perOnderdeel = { oud: k.perOnderdeel, nieuw: w.perOnderdeel };
    if (w.perKanaal !== k.perKanaal) velden.perKanaal = { oud: k.perKanaal, nieuw: w.perKanaal };
    if (Object.keys(velden).length === 0) return k;
    gewijzigd += 1;
    logAudit({
      actie: "kpiDefinitie.gewijzigd",
      entiteitType: "kpiDefinitie",
      entiteitId: k.id,
      entiteitNaam: w.naam.trim(),
      details: { kpiNaam: k.naam, wijzigingen: velden },
    });
    return { ...k, naam: w.naam.trim(), eenheid, perOnderdeel: w.perOnderdeel, perKanaal: w.perKanaal };
  });
  if (gewijzigd > 0) schrijfInstellingen({ kpiDefinities: nieuw });
  return { ok: true, gewijzigd };
}

export function maakKanaal(naam: string): BeheerResultaat<{ kanaal: Kanaal }> {
  const schoon = naam.trim();
  if (!schoon) return { ok: false, reden: "Vul een naam in." };
  const { kanalen } = getInstellingen();
  if (kanalen.some((k) => gelijk(k.naam, schoon))) return { ok: false, reden: "Er is al een kanaal met deze naam." };
  const kanaal: Kanaal = { id: nieuwId(), naam: schoon, volgorde: Math.max(0, ...kanalen.map((k) => k.volgorde)) + 1 };
  schrijfInstellingen({ kanalen: [...kanalen, kanaal] });
  logAudit({ actie: "kanaal.aangemaakt", entiteitType: "kanaal", entiteitId: kanaal.id, entiteitNaam: kanaal.naam, details: { kanaalNaam: kanaal.naam } });
  return { ok: true, kanaal };
}

/** Wat het verwijderen van een kanaal meeneemt, voor de bevestiging. */
export function gevolgenKanaal(kanaalId: string): { waarden: number; organisaties: number } {
  return gevolgenKanaalVerwijderen(laadAlles(), kanaalId);
}

/** Een kanaal verwijderen, met al zijn KPI-waarden bij alle Organisaties. */
export function verwijderKanaal(kanaalId: string): BeheerResultaat<{ waarden: number; organisaties: number }> {
  const { kanalen } = getInstellingen();
  const kanaal = kanalen.find((k) => k.id === kanaalId);
  if (!kanaal) return { ok: false, reden: "Kanaal niet gevonden." };
  const alles = laadAlles();
  const gevolgen = gevolgenKanaalVerwijderen(alles, kanaalId);
  for (const o of alles) if (o.kpiWaarden) o.kpiWaarden = o.kpiWaarden.filter((w) => w.kanaalId !== kanaalId);
  if (gevolgen.waarden > 0) slaAlles(alles);
  schrijfInstellingen({ kanalen: kanalen.filter((k) => k.id !== kanaalId) });
  logAudit({
    actie: "kanaal.verwijderd",
    entiteitType: "kanaal",
    entiteitId: kanaal.id,
    entiteitNaam: kanaal.naam,
    details: { kanaalNaam: kanaal.naam, aantalKpiWaarden: gevolgen.waarden, aantalOrganisaties: gevolgen.organisaties },
  });
  return { ok: true, ...gevolgen };
}
