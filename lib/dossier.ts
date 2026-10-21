/**
 * Het Dossier van een Organisatie (`dossier.md`, `datamodel.md`, Dossieritem): De regels voor de velden, de status van een item, de
 * volgorde en wat een Lead ziet. Pure functies zonder opslag.
 *
 * Wat een Lead ziet, komt uit `leadDossier`. Dat geeft een eigen vorm terug zonder `caseOrganisatieId` en zonder naam van de Organisatie in
 * de Case, zodat die gegevens niet in de schermen van de Lead kunnen komen (`dossier.md`, Wat de Lead ziet). In het prototype staat alle
 * data in de browser; met de database wordt dit aan de serverkant bepaald.
 */
import type { Assessment, Dossier, Dossieritem, Organisatie, OrganisatieLid } from "./types";
import { KorteNamen, SECTOR_VELD_ID, korteNaamWaarde } from "./korte-namen";
import { Controle, normaliseerUrl, schoon } from "./contactpersonen";
import { alleBouwblokkenMetGroep } from "./assessment-structuur";

export const TITEL_MAX = 200;
export const TOELICHTING_MAX = 400;
export const SAMENVATTING_MAX = 600;
export const BRON_MAX = 80;
export const OMVANG_MAX = 40;
export const TOT_RESULTAAT_MAX = 40;

/** Het Assessment waarvan de bouwblokken aan een item gekoppeld kunnen worden (`dossier.md`, Koppeling aan bouwblokken). */
export const DOSSIER_ASSESSMENT_ID = "klantcontact-volwassenheid";

export function leegDossier(): Dossier {
  return { openVoorLead: false, openSinds: null, gewijzigdOp: null, items: [] };
}

/** Het Dossier van een Organisatie, of een leeg en dicht Dossier bij data van vóór het Dossier. */
export function dossierVan(organisatie: Pick<Organisatie, "dossier">): Dossier {
  return organisatie.dossier ?? leegDossier();
}

const DATUM = /^\d{4}-\d{2}-\d{2}$/;

export interface DossierInvoer {
  soort: "nieuws" | "case";
  titel: string;
  toelichting: string;
  url: string;
  bouwblokIds: string[];
  zichtbaarVoorLead: boolean;
  bron: string;
  gepubliceerdOp: string;
  samenvatting: string;
  caseOrganisatieId: string | null;
  omvang: string;
  totResultaat: string;
}

/** Een lege invoer voor een nieuw item van dit soort. */
export function leegDossierInvoer(soort: "nieuws" | "case"): DossierInvoer {
  return {
    soort,
    titel: "",
    toelichting: "",
    url: "",
    bouwblokIds: [],
    zichtbaarVoorLead: false,
    bron: "",
    gepubliceerdOp: "",
    samenvatting: "",
    caseOrganisatieId: null,
    omvang: "",
    totResultaat: "",
  };
}

/** De invoer van een bestaand item, voor het formulier. */
export function invoerVanItem(item: Dossieritem): DossierInvoer {
  const { id: _id, aangemaaktOp: _a, gewijzigdOp: _g, ...invoer } = item;
  void _id; void _a; void _g;
  return invoer;
}

/**
 * De invoer van een item controleren en schoonmaken (`dossier.md`, Regels). Een Nieuwsitem heeft een titel en een geldig adres nodig, een Case
 * een titel, een samenvatting en een Organisatie in de case (die niet de eigen Organisatie is). Velden van het andere soort worden leeg
 * bewaard. Of het item open mag staan, hangt af van de Afspraak en de Sector van de Organisatie in de case: Dat controleert
 * `kanOpenZetten`, omdat het van andere Organisaties afhangt.
 */
export function controleerDossieritem(invoer: DossierInvoer, eigenOrganisatieId: string): Controle<DossierInvoer> {
  const titel = schoon(invoer.titel);
  if (!titel) return { ok: false, reden: "Vul een titel in." };
  if (titel.length > TITEL_MAX) return { ok: false, reden: `De titel mag maximaal ${TITEL_MAX} tekens hebben.` };
  const toelichting = invoer.toelichting.trim();
  if (toelichting.length > TOELICHTING_MAX) return { ok: false, reden: `De toelichting mag maximaal ${TOELICHTING_MAX} tekens hebben.` };
  const bouwblokIds = [...new Set(invoer.bouwblokIds)];

  let url = "";
  if (invoer.url.trim()) {
    const genormaliseerd = normaliseerUrl(invoer.url);
    if (!genormaliseerd) return { ok: false, reden: "Dit is geen geldig webadres." };
    url = genormaliseerd;
  } else if (invoer.soort === "nieuws") {
    return { ok: false, reden: "Vul het adres van het artikel in." };
  }

  const basis = { ...leegDossierInvoer(invoer.soort), soort: invoer.soort, titel, toelichting, url, bouwblokIds, zichtbaarVoorLead: invoer.zichtbaarVoorLead };

  if (invoer.soort === "nieuws") {
    const bron = schoon(invoer.bron);
    if (bron.length > BRON_MAX) return { ok: false, reden: `De bron mag maximaal ${BRON_MAX} tekens hebben.` };
    const gepubliceerdOp = invoer.gepubliceerdOp.trim();
    if (gepubliceerdOp && (!DATUM.test(gepubliceerdOp) || Number.isNaN(Date.parse(gepubliceerdOp)))) {
      return { ok: false, reden: "De datum klopt niet." };
    }
    return { ok: true, waarde: { ...basis, bron, gepubliceerdOp } };
  }

  const samenvatting = invoer.samenvatting.trim();
  if (!samenvatting) return { ok: false, reden: "Vul een samenvatting in." };
  if (samenvatting.length > SAMENVATTING_MAX) return { ok: false, reden: `De samenvatting mag maximaal ${SAMENVATTING_MAX} tekens hebben.` };
  if (!invoer.caseOrganisatieId) return { ok: false, reden: "Kies de organisatie in de case." };
  if (invoer.caseOrganisatieId === eigenOrganisatieId) return { ok: false, reden: "Een case verwijst niet naar de eigen organisatie." };
  const omvang = schoon(invoer.omvang);
  if (omvang.length > OMVANG_MAX) return { ok: false, reden: `De omvang mag maximaal ${OMVANG_MAX} tekens hebben.` };
  const totResultaat = schoon(invoer.totResultaat);
  if (totResultaat.length > TOT_RESULTAAT_MAX) return { ok: false, reden: `Tot resultaat mag maximaal ${TOT_RESULTAAT_MAX} tekens hebben.` };
  return { ok: true, waarde: { ...basis, samenvatting, caseOrganisatieId: invoer.caseOrganisatieId, omvang, totResultaat } };
}

/** De Sector van een Organisatie (`sbi-indeling.md`), leeg als die niet is ingevuld. */
function sectorVan(organisatie: Pick<Organisatie, "kenmerken">): string {
  let huidig: unknown = organisatie.kenmerken;
  for (const sleutel of SECTOR_VELD_ID.split(".")) {
    if (huidig === null || typeof huidig !== "object") return "";
    huidig = (huidig as Record<string, unknown>)[sleutel];
  }
  return typeof huidig === "string" ? huidig.trim() : "";
}

/**
 * De branche van een Case (`dossier.md`, Regels): De korte naam van de Sector uit de Kenmerken van de Organisatie in de case. Niet te
 * bewerken. Leeg als die Organisatie geen Sector heeft.
 */
export function brancheVan(organisatie: Pick<Organisatie, "kenmerken"> | undefined, korteNamen?: KorteNamen): string {
  if (!organisatie) return "";
  const sector = sectorVan(organisatie);
  return sector ? korteNaamWaarde(korteNamen, SECTOR_VELD_ID, sector) : "";
}

/**
 * Of een item open mag staan voor de Lead: Alleen een Case heeft voorwaarden (`dossier.md`, Regels en Scherm 3). De Organisatie in de case
 * moet bestaan, de Afspraak "Mag als case gebruikt worden" hebben en een Sector. `null` als het mag, anders de reden.
 */
export function kanOpenZetten(
  invoer: Pick<DossierInvoer, "soort" | "caseOrganisatieId">,
  caseOrganisatie: Pick<Organisatie, "naam" | "kenmerken" | "caseToegestaan"> | undefined
): string | null {
  if (invoer.soort !== "case") return null;
  if (!invoer.caseOrganisatieId || !caseOrganisatie) return "Kies de organisatie in de case.";
  if (caseOrganisatie.caseToegestaan !== true) return "Zonder toestemming van de organisatie in de case kan een case niet open.";
  if (!sectorVan(caseOrganisatie)) return `Vul de Sector in bij de Kenmerken van ${caseOrganisatie.naam}.`;
  return null;
}

export type DossierStatus = "zichtbaar" | "intern" | "toestemming-ontbreekt" | "kies-organisatie";

export const DOSSIER_STATUS_LABEL: Record<DossierStatus, string> = {
  zichtbaar: "Zichtbaar voor klant",
  intern: "Intern",
  "toestemming-ontbreekt": "Toestemming ontbreekt",
  "kies-organisatie": "Kies een organisatie",
};

/**
 * De status van een item voor de Consultant (`dossier.md`, Scherm 1): "Kies een organisatie" bij een Case zonder Organisatie,
 * "Toestemming ontbreekt" bij een Case waarvan de Organisatie de Afspraak niet (meer) heeft, ook als het item op Zichtbaar voor klant
 * stond, anders "Zichtbaar voor klant" of "Intern".
 */
export function itemStatus(item: Dossieritem, alle: Pick<Organisatie, "id" | "caseToegestaan">[]): DossierStatus {
  if (item.soort === "case") {
    if (!item.caseOrganisatieId) return "kies-organisatie";
    const o = alle.find((x) => x.id === item.caseOrganisatieId);
    if (!o || o.caseToegestaan !== true) return "toestemming-ontbreekt";
  }
  return item.zichtbaarVoorLead ? "zichtbaar" : "intern";
}

/** Een datum jjjj-mm-dd of een tijdstip als "14 okt 2026". */
export function datumKort(d: string): string {
  const datum = new Date(d.length === 10 ? `${d}T00:00:00Z` : d);
  return Number.isNaN(datum.getTime()) ? d : datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Cases met de nieuwste bovenaan, op het moment van toevoegen (`dossier.md`, Regels, Volgorde). */
export function casesNieuwsteEerst<T extends Pick<Dossieritem, "soort" | "aangemaaktOp">>(lijst: T[]): T[] {
  return lijst.filter((i) => i.soort === "case").sort((a, b) => b.aangemaaktOp.localeCompare(a.aangemaaktOp));
}

/** Nieuws met het nieuwste bovenaan: Op publicatiedatum, en zonder datum op het moment van toevoegen. */
export function nieuwsNieuwsteEerst<T extends Pick<Dossieritem, "soort" | "gepubliceerdOp" | "aangemaaktOp">>(lijst: T[]): T[] {
  const sleutel = (n: T) => n.gepubliceerdOp || n.aangemaaktOp.slice(0, 10);
  return lijst
    .filter((i) => i.soort === "nieuws")
    .sort((a, b) => sleutel(b).localeCompare(sleutel(a)) || b.aangemaaktOp.localeCompare(a.aangemaaktOp));
}

/** Alle items voor de Consultant: Eerst de Cases, dan het Nieuws, elk in de eigen volgorde. */
export function itemsInVolgorde<T extends Dossieritem>(lijst: T[]): T[] {
  return [...casesNieuwsteEerst(lijst), ...nieuwsNieuwsteEerst(lijst)];
}

/** Het aantal items per soort. */
export function aantallPerSoort(lijst: Pick<Dossieritem, "soort">[]): { alles: number; cases: number; nieuws: number } {
  const cases = lijst.filter((i) => i.soort === "case").length;
  return { alles: lijst.length, cases, nieuws: lijst.length - cases };
}

/** Het aantal items dat de Lead nu zou zien als het Dossier open stond (voor de bevestiging bij Open voor Lead). */
export function aantalZichtbaarVoorLead(organisatie: Organisatie, alle: Organisatie[]): number {
  return dossierVan(organisatie).items.filter((i) => itemStatus(i, alle) === "zichtbaar").length;
}

/** Het aantal Cases bij andere Organisaties dat naar deze Organisatie verwijst (voor de bevestigingen). */
export function casesDieVerwijzenNaar(organisatieIds: string[], alle: Pick<Organisatie, "id" | "dossier">[]): { aantal: number; organisaties: number } {
  const ids = new Set(organisatieIds);
  let aantal = 0;
  let organisaties = 0;
  for (const o of alle) {
    if (ids.has(o.id)) continue;
    const n = dossierVan(o).items.filter((i) => i.soort === "case" && i.caseOrganisatieId && ids.has(i.caseOrganisatieId)).length;
    aantal += n;
    if (n > 0) organisaties += 1;
  }
  return { aantal, organisaties };
}

/** Het aantal Cases bij andere Organisaties dat open staat of stond en naar deze Organisatie verwijst, voor de bevestiging bij het uitzetten van de Afspraak. */
export function zichtbareCasesDieVerwijzenNaar(organisatieId: string, alle: Pick<Organisatie, "id" | "dossier">[]): { aantal: number; organisaties: number } {
  let aantal = 0;
  let organisaties = 0;
  for (const o of alle) {
    if (o.id === organisatieId) continue;
    const n = dossierVan(o).items.filter((i) => i.soort === "case" && i.caseOrganisatieId === organisatieId && i.zichtbaarVoorLead).length;
    aantal += n;
    if (n > 0) organisaties += 1;
  }
  return { aantal, organisaties };
}

/* ---------- Wat de Lead ziet ---------- */

export interface LeadCase {
  id: string;
  titel: string;
  samenvatting: string;
  toelichting: string;
  /** De korte naam van de Sector van de Organisatie in de case. */
  branche: string;
  omvang: string;
  totResultaat: string;
  url: string;
  bouwblokIds: string[];
  aangemaaktOp: string;
}

export interface LeadNieuws {
  id: string;
  titel: string;
  toelichting: string;
  bron: string;
  gepubliceerdOp: string;
  url: string;
  bouwblokIds: string[];
  aangemaaktOp: string;
}

export interface LeadDossier {
  organisatieNaam: string;
  openSinds: string | null;
  gewijzigdOp: string | null;
  cases: LeadCase[];
  nieuws: LeadNieuws[];
}

/**
 * Het Dossier zoals een Lead het ziet (`dossier.md`, Wat de Lead ziet): `null` als het Dossier niet open staat of er geen enkel item
 * zichtbaar is. Een item is zichtbaar als `openVoorLead` aan staat, het item op Zichtbaar voor klant staat en, bij een Case, de
 * Organisatie in de case de Afspraak heeft en een Sector (de branche). De Case heeft in dit resultaat geen Organisatie-id en geen naam.
 */
export function leadDossier(organisatie: Organisatie, alle: Organisatie[], korteNamen?: KorteNamen): LeadDossier | null {
  const dossier = dossierVan(organisatie);
  if (!dossier.openVoorLead) return null;
  const zichtbaar = dossier.items.filter((i) => i.zichtbaarVoorLead);
  const cases: LeadCase[] = casesNieuwsteEerst(zichtbaar).flatMap((i) => {
    const o = alle.find((x) => x.id === i.caseOrganisatieId);
    if (!o || o.caseToegestaan !== true) return [];
    const branche = brancheVan(o, korteNamen);
    if (!branche) return [];
    return [
      {
        id: i.id,
        titel: i.titel,
        samenvatting: i.samenvatting,
        toelichting: i.toelichting,
        branche,
        omvang: i.omvang,
        totResultaat: i.totResultaat,
        url: i.url,
        bouwblokIds: i.bouwblokIds,
        aangemaaktOp: i.aangemaaktOp,
      },
    ];
  });
  const nieuws: LeadNieuws[] = nieuwsNieuwsteEerst(zichtbaar).map((i) => ({
    id: i.id,
    titel: i.titel,
    toelichting: i.toelichting,
    bron: i.bron,
    gepubliceerdOp: i.gepubliceerdOp,
    url: i.url,
    bouwblokIds: i.bouwblokIds,
    aangemaaktOp: i.aangemaaktOp,
  }));
  if (cases.length + nieuws.length === 0) return null;
  return { organisatieNaam: organisatie.naam, openSinds: dossier.openSinds, gewijzigdOp: dossier.gewijzigdOp, cases, nieuws };
}

/** Of de kaart Dossier de tag "Nieuw" krijgt: Zolang de Lead de pagina niet heeft geopend na de laatste wijziging. */
export function isNieuwVoorLead(lid: Pick<OrganisatieLid, "dossierGezienOp">, dossier: Pick<Dossier, "gewijzigdOp" | "openSinds">): boolean {
  if (!lid.dossierGezienOp) return true;
  const laatste = [dossier.gewijzigdOp, dossier.openSinds].filter((x): x is string => !!x).sort().pop();
  return !!laatste && lid.dossierGezienOp < laatste;
}

/** De voorproef op de kaart (`visualisatie-mijn-metingen.md`, Dossierkaart): Ten hoogste drie titels, eerst de Cases. */
export function voorproef(d: Pick<LeadDossier, "cases" | "nieuws">, max = 3): { titels: { soort: "case" | "nieuws"; titel: string }[]; meer: number } {
  const alle = [
    ...d.cases.map((c) => ({ soort: "case" as const, titel: c.titel })),
    ...d.nieuws.map((n) => ({ soort: "nieuws" as const, titel: n.titel })),
  ];
  return { titels: alle.slice(0, max), meer: Math.max(0, alle.length - max) };
}

/** "2 cases · 2 nieuwsberichten", met het enkelvoud bij 1 en een soort zonder items weggelaten. */
export function aantalTekst(d: Pick<LeadDossier, "cases" | "nieuws">): string {
  const delen: string[] = [];
  if (d.cases.length > 0) delen.push(`${d.cases.length} ${d.cases.length === 1 ? "case" : "cases"}`);
  if (d.nieuws.length > 0) delen.push(`${d.nieuws.length} ${d.nieuws.length === 1 ? "nieuwsbericht" : "nieuwsberichten"}`);
  return delen.join(" · ");
}

/** Het aantal zichtbare items per bouwblok (`Bouwblok.id`), voor de radar en de lijst naast de radar. */
export function itemsPerBouwblok(d: Pick<LeadDossier, "cases" | "nieuws">): Map<string, number> {
  const kaart = new Map<string, number>();
  for (const i of [...d.cases, ...d.nieuws]) for (const id of i.bouwblokIds) kaart.set(id, (kaart.get(id) ?? 0) + 1);
  return kaart;
}

/** Filtert de zichtbare items op één bouwblok. Zonder bouwblok blijft alles staan. */
export function filterOpBouwblok(d: LeadDossier, bouwblokId: string | null): { cases: LeadCase[]; nieuws: LeadNieuws[] } {
  if (!bouwblokId) return { cases: d.cases, nieuws: d.nieuws };
  return {
    cases: d.cases.filter((c) => c.bouwblokIds.includes(bouwblokId)),
    nieuws: d.nieuws.filter((n) => n.bouwblokIds.includes(bouwblokId)),
  };
}

/** De bouwblokken waaruit een item kiest, in de volgorde van de nummers (`dossier.md`, Koppeling aan bouwblokken). */
export function dossierBouwblokken(assessments: Assessment[]) {
  const assessment = assessments.find((a) => a.id === DOSSIER_ASSESSMENT_ID);
  if (!assessment) return [];
  return alleBouwblokkenMetGroep(assessment).sort((a, b) => a.bouwblok.volgnummer - b.bouwblok.volgnummer);
}

/**
 * Het Dossier laden uit data van vóór het Dossier (`dossier.md`, Overgang): De bestaande `nieuwsartikelen` worden Dossieritems van soort
 * Nieuws, `notitie` wordt `toelichting`, en niets staat open of zichtbaar. Een Dossier dat er al is, blijft zoals het is. Het oude veld
 * wordt weggehaald.
 */
export function zetNieuwsartikelenOm(ruw: Record<string, unknown>): Dossier {
  const bestaand = ruw.dossier as Partial<Dossier> | undefined;
  const items: Dossieritem[] = Array.isArray(bestaand?.items) ? (bestaand!.items as Dossieritem[]).map(vulItemAan) : [];
  const oud = Array.isArray(ruw.nieuwsartikelen) ? (ruw.nieuwsartikelen as Record<string, unknown>[]) : [];
  for (const n of oud) {
    const id = String(n.id ?? "");
    if (!id || items.some((i) => i.id === id)) continue;
    items.push({
      ...vulItemAan({}),
      id,
      soort: "nieuws",
      titel: String(n.titel ?? ""),
      url: String(n.url ?? ""),
      bron: String(n.bron ?? ""),
      gepubliceerdOp: String(n.gepubliceerdOp ?? ""),
      toelichting: String(n.notitie ?? ""),
      aangemaaktOp: String(n.aangemaaktOp ?? ""),
      gewijzigdOp: String(n.aangemaaktOp ?? ""),
    });
  }
  return {
    openVoorLead: bestaand?.openVoorLead === true,
    openSinds: bestaand?.openSinds ?? null,
    gewijzigdOp: bestaand?.gewijzigdOp ?? null,
    items,
  };
}

function vulItemAan(i: Partial<Dossieritem>): Dossieritem {
  return {
    id: i.id ?? "",
    soort: i.soort === "case" ? "case" : "nieuws",
    titel: i.titel ?? "",
    toelichting: i.toelichting ?? "",
    zichtbaarVoorLead: i.zichtbaarVoorLead === true,
    bouwblokIds: Array.isArray(i.bouwblokIds) ? i.bouwblokIds : [],
    url: i.url ?? "",
    aangemaaktOp: i.aangemaaktOp ?? "",
    gewijzigdOp: i.gewijzigdOp ?? i.aangemaaktOp ?? "",
    bron: i.bron ?? "",
    gepubliceerdOp: i.gepubliceerdOp ?? "",
    samenvatting: i.samenvatting ?? "",
    caseOrganisatieId: i.caseOrganisatieId ?? null,
    omvang: i.omvang ?? "",
    totResultaat: i.totResultaat ?? "",
  };
}

/**
 * Een Case waarvan de Organisatie niet meer bestaat, krijgt `caseOrganisatieId: null` en staat niet meer open (`dossier.md`, Verwijderen en
 * datakoppelingen). Eén plek, aangeroepen bij elke schrijfactie. Geeft het aantal aangepaste Cases terug.
 */
export function ruimDossierOp(alles: Organisatie[]): number {
  const bestaand = new Set(alles.map((o) => o.id));
  let aantal = 0;
  for (const o of alles) {
    if (!o.dossier) continue;
    for (const i of o.dossier.items) {
      if (i.soort === "case" && i.caseOrganisatieId && !bestaand.has(i.caseOrganisatieId)) {
        i.caseOrganisatieId = null;
        i.zichtbaarVoorLead = false;
        i.gewijzigdOp = new Date().toISOString();
        o.dossier.gewijzigdOp = i.gewijzigdOp;
        aantal += 1;
      }
    }
  }
  return aantal;
}
