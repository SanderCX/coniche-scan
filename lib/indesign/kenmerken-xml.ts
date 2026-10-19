/**
 * Zet `Organisatie.kenmerken` (genest, `data/organisatie-velden.ts`) om naar
 * de 26 losse, benoemde XML-elementen uit `export-indesign.md` — geen
 * JSON-blob zoals bij de CSV-export, elk kenmerk krijgt zijn eigen taggable
 * elementnaam. Ontbreekt een waarde, dan is die "n.v.t.", nooit een leeg
 * element (zie de spec, "kenmerken").
 */
import { escapeXml } from "./xml-utils";
import { ondersteuningVan } from "../techstack";
import { KPI_CONTACTEN, kpiWaardeVan } from "../kpi";
import type { KpiWaarde } from "../types";

const NVT = "n.v.t.";

function pad(obj: unknown, ...path: string[]): unknown {
  let huidig: unknown = obj;
  for (const stap of path) {
    if (typeof huidig !== "object" || huidig === null) return undefined;
    huidig = (huidig as Record<string, unknown>)[stap];
  }
  return huidig;
}

function tekst(waarde: unknown): string {
  if (waarde === undefined || waarde === null || waarde === "") return NVT;
  return String(waarde);
}

/** Eén leeg, zelfsluitend element met attributen; ontbrekende waarden worden "n.v.t.". */
function el(naam: string, attrs: Record<string, unknown>): string {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${escapeXml(tekst(v))}"`)
    .join(" ");
  return `<${naam} ${attrStr} />`;
}

/** Eén tekstelement (sector/subsector, geen attributen). */
function tekstEl(naam: string, waarde: unknown): string {
  return `<${naam}>${escapeXml(tekst(waarde))}</${naam}>`;
}

/**
 * De KPI's en de contacten per kanaal komen uit de KPI-waarden bij Algemeen (`export-indesign.md`, voorstel van 19 oktober 2026): De
 * elementen blijven bestaan zodat het sjabloon werkt. Waarden per Onderdeel en kanalen die een Admin toevoegt, krijgen geen element
 * zolang het sjabloon er niet om vraagt.
 */
export function kenmerkenXml(kenmerken: Record<string, unknown>, kpiWaarden: KpiWaarde[] = []): string {
  const algemeen = (kpiId: string, kanaalId: string | null = null) => kpiWaardeVan({ kpiWaarden }, kpiId, { onderdeelId: null, kanaalId }) ?? undefined;
  const sectorSubsector = kenmerken["sector-subsector"];
  const volume = kenmerken["volume-klantbasis"];
  const digitalisering = kenmerken["digitalisering"];
  const techstack = kenmerken["techstack"];
  const fte = kenmerken["fte"];

  const delen = [
    tekstEl("sector", pad(sectorSubsector, "sector")),
    tekstEl("subsector", pad(sectorSubsector, "subsector")),
    el("totaalKlanten", {
      waarde: pad(volume, "totaal-klanten", "totaal"),
      b2bPercentage: pad(volume, "totaal-klanten", "b2b-percentage"),
      b2cPercentage: pad(volume, "totaal-klanten", "b2c-percentage"),
    }),
    el("contactenCall", { waarde: algemeen(KPI_CONTACTEN, "kanaal-call") }),
    el("contactenVoicebot", { waarde: algemeen(KPI_CONTACTEN, "kanaal-voicebot") }),
    el("contactenLivechat", { waarde: algemeen(KPI_CONTACTEN, "kanaal-livechat") }),
    el("contactenChatbot", { waarde: algemeen(KPI_CONTACTEN, "kanaal-chatbot") }),
    el("contactenEmail", { waarde: algemeen(KPI_CONTACTEN, "kanaal-e-mail") }),
    el("contactenWhatsapp", { waarde: algemeen(KPI_CONTACTEN, "kanaal-whatsapp") }),
    el("adoptieMijnomgeving", { percentage: pad(volume, "adoptie-mijnomgeving") }),
    el("digitaliseringPercentage2026", { percentage: pad(digitalisering, "percentage-2026") }),
    el("digitaliseringAmbitie2030", { percentage: pad(digitalisering, "ambitie-2030") }),
    el("techstackContactCenter", {
      leverancier: pad(techstack, "techstack-contact-center", "leverancier"),
      ondersteuning: ondersteuningVan(pad(techstack, "techstack-contact-center")),
    }),
    el("techstackConversationalAi", {
      leverancier: pad(techstack, "techstack-conversational-ai", "leverancier"),
      ondersteuning: ondersteuningVan(pad(techstack, "techstack-conversational-ai")),
    }),
    el("techstackCrm", {
      leverancier: pad(techstack, "techstack-crm", "leverancier"),
      ondersteuning: ondersteuningVan(pad(techstack, "techstack-crm")),
    }),
    el("techstackKennismanagement", {
      leverancier: pad(techstack, "techstack-kennismanagement", "leverancier"),
      ondersteuning: ondersteuningVan(pad(techstack, "techstack-kennismanagement")),
    }),
    el("techstackLlmOplossing", {
      leverancier: pad(techstack, "techstack-llm-oplossing", "leverancier"),
      // Geen "Ondersteund door" bij LLM-oplossing: Het attribuut blijft staan voor het sjabloon, maar is altijd "n.v.t.".
      ondersteuning: undefined,
    }),
    el("techstackWfm", {
      leverancier: pad(techstack, "techstack-wfm", "leverancier"),
      ondersteuning: ondersteuningVan(pad(techstack, "techstack-wfm")),
    }),
    el("fteKlantcontactmedewerkers", {
      waarde: pad(fte, "fte-klantcontact", "aantal"),
      inhousePercentage: pad(fte, "fte-klantcontact", "inhouse-percentage"),
      bpoPercentage: pad(fte, "fte-klantcontact", "bpo-percentage"),
    }),
    el("fteKlantcontactManagementSupport", { waarde: pad(fte, "fte-management-support", "aantal") }),
    el("fteItDevops", {
      waarde: pad(fte, "fte-it-devops", "aantal"),
      percentageDigital: pad(fte, "fte-it-devops", "digital-percentage"),
    }),
    el("kpiAht", { waarde: algemeen("aht") }),
    el("kpiNps", { waarde: algemeen("nps") }),
    el("kpiCsat", { waarde: algemeen("csat") }),
    el("kpiSla", { waarde: algemeen("sla") }),
    el("kpiFtr", { waarde: algemeen("ftr") }),
  ];

  return `<kenmerken>${delen.join("")}</kenmerken>`;
}
