/**
 * De kaart Kenmerken op het organisatie-detail (`beheerpagina.md`, punt 4, Kenmerken): De ingevulde organisatievelden als een
 * raster van label en waarde. Pure functies. Velden zonder waarde staan er niet in. Het label is de veldnaam (nooit de korte
 * naam) en de waarde staat letterlijk zoals opgeslagen. Samengestelde velden tonen hun delen achter elkaar.
 */
import type { VeldDefinitie } from "./types";
import { ondersteuningVan } from "./techstack";

export interface KenmerkItem {
  label: string;
  waarde: string;
}

type Obj = Record<string, unknown>;
const obj = (w: unknown): Obj => (typeof w === "object" && w !== null ? (w as Obj) : {});

function tekst(w: unknown): string {
  return typeof w === "string" ? w.trim() : "";
}

/** Een getal met punt als duizendtalscheiding en komma als decimaalteken, of `null` zonder getal. */
export function getalTekst(w: unknown): string | null {
  if (w === "" || w === null || w === undefined) return null;
  const n = typeof w === "number" ? w : Number(String(w).replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return n.toLocaleString("nl-NL", { maximumFractionDigits: 2 });
}

const procent = (w: unknown): string | null => {
  const t = getalTekst(w);
  return t === null ? null : `${t}%`;
};

/** "15 / 85%": De getallen achter elkaar met een schuine streep, het procentteken achter het laatste getal. */
function reeksProcent(delen: unknown[]): string | null {
  const t = delen.map(getalTekst);
  const aanwezig = t.filter((x): x is string => x !== null);
  if (aanwezig.length === 0) return null;
  return `${aanwezig.join(" / ")}%`;
}

const samen = (...delen: (string | null | undefined)[]): string => delen.filter((d): d is string => !!d).join(", ");

function techstackWaarde(item: Obj, leverancier: string): string {
  const oplossing = tekst(item[leverancier]);
  const hoe = ondersteuningVan(item);
  return samen(oplossing, hoe === "extern" ? "extern ondersteund" : hoe === "zelf" ? "zelf ondersteund" : null);
}

/** Een groep zonder eigen opmaak: Elk subveld met een waarde als eigen item. */
function algemeen(veld: VeldDefinitie, waarde: unknown): KenmerkItem[] {
  if (veld.type === "groep") {
    const o = obj(waarde);
    return (veld.subvelden ?? []).flatMap((sub) => algemeen(sub, o[sub.id]));
  }
  const t = veld.type === "getal" ? getalTekst(waarde) : veld.type === "percentage" ? procent(waarde) : tekst(waarde) || null;
  return t ? [{ label: veld.label, waarde: t }] : [];
}

/**
 * Het raster, in de volgorde van de lijst met organisatievelden. Bekende velden hebben de opmaak uit de spec. Een nieuw veld valt
 * terug op label en waarde (`algemeen`), zodat er niets uit het raster valt.
 */
export function kenmerkenRaster(velden: VeldDefinitie[], kenmerken: Record<string, unknown>): KenmerkItem[] {
  const items: KenmerkItem[] = [];
  const voeg = (label: string, waarde: string | null | undefined) => {
    if (waarde) items.push({ label, waarde });
  };
  for (const veld of velden) {
    const w = obj(kenmerken[veld.id]);
    switch (veld.id) {
      case "sector-subsector":
        voeg("Sector", tekst(w.sector));
        voeg("Subsector", tekst(w.subsector));
        break;
      case "volume-klantbasis": {
        const klanten = obj(w["totaal-klanten"]);
        voeg("Klanten, B2B / B2C", samen(getalTekst(klanten.totaal), reeksProcent([klanten["b2b-percentage"], klanten["b2c-percentage"]])));
        voeg("Adoptie mijnomgeving/app", procent(w["adoptie-mijnomgeving"]));
        break;
      }
      case "digitalisering":
        voeg("Digitalisering 2026 / 2030", [procent(w["percentage-2026"]), procent(w["ambitie-2030"])].filter(Boolean).join(" / "));
        break;
      case "techstack":
        for (const cat of veld.subvelden ?? []) {
          const item = obj(w[cat.id]);
          if (cat.label === "LLM-oplossing") {
            voeg(cat.label, samen(tekst(item.leverancier), tekst(item.toegangsroute)));
          } else {
            voeg(cat.label, techstackWaarde(item, "leverancier"));
          }
        }
        break;
      case "fte": {
        const kc = obj(w["fte-klantcontact"]);
        const ms = obj(w["fte-management-support"]);
        const it = obj(w["fte-it-devops"]);
        const inhouse = procent(kc["inhouse-percentage"]);
        voeg("Klantcontactmedewerkers, inhouse", samen(getalTekst(kc.aantal), inhouse ? `${inhouse} inhouse` : null));
        voeg("Klantcontact management & support", getalTekst(ms.aantal));
        const digital = procent(it["digital-percentage"]);
        voeg("IT DevOps, gericht op Digital", samen(getalTekst(it.aantal), digital ? `${digital} digital` : null));
        break;
      }
      default:
        items.push(...algemeen(veld, kenmerken[veld.id]));
    }
  }
  return items;
}
