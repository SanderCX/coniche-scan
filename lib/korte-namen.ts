/**
 * Korte namen (`datamodel.md`, Korte namen; `visualisatie-verkennen.md`, Korte namen): Een weergavenaam naast het origineel voor
 * veldnamen en waarden, voor chips en kolomkoppen. De Organisatie bewaart altijd het origineel, een korte naam staat nooit in een
 * export of het organisatie-detail. Pure functies, de opslag staat bij de instellingen (`lib/instellingen-store.ts`).
 */
import { Organisatie } from "./types";
import { FilterVeld, filterVelden, kenmerkWaarde } from "./verkennen";
import { organisatieVelden } from "@/data/organisatie-velden";
import { logAudit } from "./audit-store";
import { schrijfInstellingen } from "./instellingen-store";

export const MAX_KORTE_NAAM = 30;

export interface KorteNaam {
  veldId: string;
  waarde: string;
  korteNaam: string;
}

export interface KorteNamen {
  /** De korte naam per veld, op het pad met punten (`kpis.aht`). */
  velden: Record<string, string>;
  waarden: KorteNaam[];
}

/** De beginwaarden voor de 22 SBI-secties (`sbi-indeling.md`, Korte namen): Door een Admin aan te passen. In de volgorde van A tot en met V. */
export const SBI_KORTE_NAMEN = [
  "Landbouw en visserij",
  "Delfstoffen",
  "Industrie",
  "Energie",
  "Water en afval",
  "Bouw",
  "Handel",
  "Vervoer en opslag",
  "Horeca",
  "Media en uitgeverijen",
  "Telecom en IT",
  "Financiële dienstverlening",
  "Onroerend goed",
  "Wetenschap, techniek en advies",
  "Verhuur en zakelijke diensten",
  "Overheid",
  "Onderwijs",
  "Zorg en welzijn",
  "Kunst, sport en recreatie",
  "Overige dienstverlening",
  "Huishoudens als werkgever",
  "Extraterritoriale organisaties",
];

export const SECTOR_VELD_ID = "sector-subsector.sector";

function beginwaarden(): Map<string, string> {
  const sector = organisatieVelden.find((v) => v.id === "sector-subsector")?.subvelden?.find((v) => v.id === "sector");
  const map = new Map<string, string>();
  (sector?.opties ?? []).forEach((o, i) => {
    if (SBI_KORTE_NAMEN[i]) map.set(`${SECTOR_VELD_ID}\u0000${o}`, SBI_KORTE_NAMEN[i]);
  });
  return map;
}
const BEGIN = beginwaarden();

/** De korte naam van een veld, of het origineel. */
export function korteNaamVeld(store: KorteNamen | undefined, veldId: string, origineel: string): string {
  const k = store?.velden?.[veldId]?.trim();
  return k ? k : origineel;
}

/** De korte naam van een waarde, of het origineel. Een lege korte naam in de opslag betekent bewust het origineel. */
export function korteNaamWaarde(store: KorteNamen | undefined, veldId: string, waarde: string): string {
  const rij = store?.waarden?.find((w) => w.veldId === veldId && w.waarde === waarde);
  if (rij) return rij.korteNaam.trim() || waarde;
  return BEGIN.get(`${veldId}\u0000${waarde}`) ?? waarde;
}

/** De naam van een Organisatie in een kolomkop: De korte naam, anders de naam zelf (`datamodel.md`, Organisatie). */
export function kopNaam(organisatie: Pick<Organisatie, "naam" | "korteNaam">): string {
  return organisatie.korteNaam?.trim() || organisatie.naam;
}

export interface KorteNaamRij {
  soort: "veldnaam" | "waarde";
  veldId: string;
  veldLabel: string;
  origineel: string;
  korteNaam: string;
  inGebruik: number;
}

/**
 * De tabel van de korte namen (`beheerpagina.md`, punt 3): Per veld een rij voor de veldnaam, en per waarde die in gebruik is
 * of in de vaste lijst staat een rij. `inGebruik` is het aantal Organisaties met die waarde, bij een veldnaam het aantal
 * Organisaties dat het veld heeft ingevuld. Waarden die Organisaties zelf invullen komen vanzelf bij.
 */
export function korteNamenRijen(
  organisaties: Pick<Organisatie, "kenmerken">[],
  store: KorteNamen | undefined,
  velden: FilterVeld[] = filterVelden(),
  vasteOpties: Map<string, string[]> = vasteOptiesPerVeld()
): KorteNaamRij[] {
  const rijen: KorteNaamRij[] = [];
  for (const veld of velden) {
    const waarden = organisaties.map((o) => kenmerkWaarde(o, veld.pad));
    const ingevuld = waarden.filter((w) => w !== undefined && w !== null && w !== "").length;
    rijen.push({
      soort: "veldnaam",
      veldId: veld.id,
      veldLabel: veld.label,
      origineel: veld.label,
      korteNaam: store?.velden?.[veld.id] ?? "",
      inGebruik: ingevuld,
    });
    if (veld.type !== "select") continue;
    const telling = new Map<string, number>();
    for (const w of waarden) if (typeof w === "string" && w !== "") telling.set(w, (telling.get(w) ?? 0) + 1);
    for (const vast of vasteOpties.get(veld.id) ?? []) if (!telling.has(vast)) telling.set(vast, 0);
    for (const [waarde, aantal] of telling) {
      const opgeslagen = store?.waarden?.find((x) => x.veldId === veld.id && x.waarde === waarde);
      rijen.push({
        soort: "waarde",
        veldId: veld.id,
        veldLabel: veld.label,
        origineel: waarde,
        korteNaam: opgeslagen ? opgeslagen.korteNaam : (BEGIN.get(`${veld.id}\u0000${waarde}`) ?? ""),
        inGebruik: aantal,
      });
    }
  }
  return rijen;
}

/** De vaste waarden per select-veld (`opties`, `voorop` en, bij een afhankelijk veld, alle waarden uit `optiesPerWaarde`). */
export function vasteOptiesPerVeld(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const loop = (lijst: typeof organisatieVelden, pad: string[]) => {
    for (const v of lijst) {
      const p = [...pad, v.id];
      if (v.type === "groep") loop(v.subvelden ?? [], p);
      else if (v.type === "select" || v.type === "select-afhankelijk") {
        const alle = [...(v.opties ?? []), ...(v.voorop ?? []), ...Object.values(v.optiesPerWaarde ?? {}).flat()];
        map.set(p.join("."), [...new Set(alle)]);
      }
    }
  };
  loop(organisatieVelden, []);
  return map;
}

/** Een korte naam is hoogstens 30 tekens en uniek binnen het veld, zonder verschil tussen hoofdletters en kleine letters. */
export function valideerKorteNamen(rijen: KorteNaamRij[]): Record<string, string> {
  const fouten: Record<string, string> = {};
  const sleutel = (r: KorteNaamRij) => `${r.soort}\u0000${r.veldId}\u0000${r.origineel}`;
  const perVeld = new Map<string, Map<string, string>>();
  for (const r of rijen) {
    const k = r.korteNaam.trim();
    if (k.length > MAX_KORTE_NAAM) fouten[sleutel(r)] = `Hoogstens ${MAX_KORTE_NAAM} tekens.`;
    // Alleen waarden van één veld moeten onderling uniek zijn. Een veldnaam heeft zijn eigen naamruimte.
    if (r.soort !== "waarde") continue;
    const effectief = (k || r.origineel).toLowerCase();
    const groep = perVeld.get(r.veldId) ?? new Map<string, string>();
    const bestaand = groep.get(effectief);
    if (bestaand !== undefined) {
      fouten[sleutel(r)] = `Deze naam is al in gebruik bij ${bestaand}.`;
    } else groep.set(effectief, r.origineel);
    perVeld.set(r.veldId, groep);
  }
  return fouten;
}

export function foutSleutel(r: Pick<KorteNaamRij, "soort" | "veldId" | "origineel">): string {
  return `${r.soort}\u0000${r.veldId}\u0000${r.origineel}`;
}

/** Slaat de bewerkte tabel op: Alleen rijen die afwijken van wat er al stond. Elke wijziging is een gebeurtenis zonder de nieuwe naam. */
export function bewaarKorteNamen(bewerkt: KorteNaamRij[], huidig: KorteNamen | undefined, naamVan: (r: KorteNaamRij) => string = (r) => r.veldLabel): number {
  const nieuw: KorteNamen = { velden: { ...(huidig?.velden ?? {}) }, waarden: [...(huidig?.waarden ?? [])] };
  let gewijzigd = 0;
  for (const r of bewerkt) {
    const k = r.korteNaam.trim();
    if (r.soort === "veldnaam") {
      const oud = (huidig?.velden?.[r.veldId] ?? "").trim();
      if (oud === k) continue;
      if (k) nieuw.velden[r.veldId] = k;
      else delete nieuw.velden[r.veldId];
    } else {
      const bestaand = huidig?.waarden?.find((w) => w.veldId === r.veldId && w.waarde === r.origineel);
      const oud = bestaand ? bestaand.korteNaam.trim() : (BEGIN.get(`${r.veldId}\u0000${r.origineel}`) ?? "");
      if (oud === k) continue;
      nieuw.waarden = nieuw.waarden.filter((w) => !(w.veldId === r.veldId && w.waarde === r.origineel));
      // Een lege korte naam bij een beginwaarde blijft bewaard, zodat het origineel bewust blijft staan.
      if (k || BEGIN.has(`${r.veldId}\u0000${r.origineel}`)) nieuw.waarden.push({ veldId: r.veldId, waarde: r.origineel, korteNaam: k });
    }
    gewijzigd += 1;
    logAudit({
      actie: "korteNaam.gewijzigd",
      entiteitType: "instellingen",
      entiteitId: r.veldId,
      details: { veld: naamVan(r), soort: r.soort, origineel: r.origineel },
    });
  }
  if (gewijzigd > 0) schrijfInstellingen({ korteNamen: nieuw });
  return gewijzigd;
}
