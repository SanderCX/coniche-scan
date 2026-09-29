/**
 * Zet `Organisatie.kenmerken` (genest, `data/organisatie-velden.ts`) om naar
 * de 24 losse, benoemde XML-elementen uit `export-indesign.md` — geen
 * JSON-blob zoals bij de CSV-export, elk kenmerk krijgt zijn eigen taggable
 * elementnaam. Ontbreekt een waarde, dan is die "n.v.t.", nooit een leeg
 * element (zie de spec, "kenmerken").
 */
import { escapeXml } from "./xml-utils";

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

export function kenmerkenXml(kenmerken: Record<string, unknown>): string {
  const sectorSubsector = kenmerken["sector-subsector"];
  const volume = kenmerken["volume-klantbasis"];
  const digitalisering = kenmerken["digitalisering"];
  const techstack = kenmerken["techstack"];
  const fte = kenmerken["fte"];
  const kpis = kenmerken["kpis"];

  const delen = [
    tekstEl("sector", pad(sectorSubsector, "sector")),
    tekstEl("subsector", pad(sectorSubsector, "subsector")),
    el("totaalKlanten", {
      waarde: pad(volume, "totaal-klanten", "totaal"),
      b2bPercentage: pad(volume, "totaal-klanten", "b2b-percentage"),
      b2cPercentage: pad(volume, "totaal-klanten", "b2c-percentage"),
    }),
    el("contactenCall", { waarde: pad(volume, "contacten-per-jaar", "kanaal-call") }),
    el("contactenVoicebot", { waarde: pad(volume, "contacten-per-jaar", "kanaal-voicebot") }),
    el("contactenLivechat", { waarde: pad(volume, "contacten-per-jaar", "kanaal-livechat") }),
    el("contactenChatbot", { waarde: pad(volume, "contacten-per-jaar", "kanaal-chatbot") }),
    el("contactenEmail", { waarde: pad(volume, "contacten-per-jaar", "kanaal-e-mail") }),
    el("contactenWhatsapp", { waarde: pad(volume, "contacten-per-jaar", "kanaal-whatsapp") }),
    el("adoptieMijnomgeving", { percentage: pad(volume, "adoptie-mijnomgeving") }),
    el("digitaliseringPercentage2026", { percentage: pad(digitalisering, "percentage-2026") }),
    el("digitaliseringAmbitie2030", { percentage: pad(digitalisering, "ambitie-2030") }),
    el("techstackContactCenter", {
      leverancier: pad(techstack, "techstack-contact-center", "leverancier"),
      ondersteuning: pad(techstack, "techstack-contact-center", "ondersteuning"),
    }),
    el("techstackConversationalAi", {
      leverancier: pad(techstack, "techstack-conversational-ai", "leverancier"),
      ondersteuning: pad(techstack, "techstack-conversational-ai", "ondersteuning"),
    }),
    el("techstackCrm", {
      leverancier: pad(techstack, "techstack-crm", "leverancier"),
      ondersteuning: pad(techstack, "techstack-crm", "ondersteuning"),
    }),
    el("techstackKennismanagement", {
      leverancier: pad(techstack, "techstack-kennismanagement", "leverancier"),
      ondersteuning: pad(techstack, "techstack-kennismanagement", "ondersteuning"),
    }),
    el("techstackLlmOplossing", {
      leverancier: pad(techstack, "techstack-llm-oplossing", "leverancier"),
      ondersteuning: pad(techstack, "techstack-llm-oplossing", "ondersteuning"),
    }),
    el("techstackItDeployment", {
      leverancier: pad(techstack, "techstack-it-en-deployment", "leverancier"),
      ondersteuning: pad(techstack, "techstack-it-en-deployment", "ondersteuning"),
    }),
    el("fteKlantcontactmedewerkers", {
      waarde: pad(fte, "fte-klantcontact", "aantal"),
      inhousePercentage: pad(fte, "fte-klantcontact", "inhouse-percentage"),
      bpoPercentage: pad(fte, "fte-klantcontact", "bpo-percentage"),
    }),
    el("fteKlantcontactManagementSupport", { waarde: pad(fte, "fte-management-support") }),
    el("fteItDevops", {
      waarde: pad(fte, "fte-it-devops", "aantal"),
      percentageDigital: pad(fte, "fte-it-devops", "digital-percentage"),
    }),
    el("kpiAht", { waarde: pad(kpis, "aht") }),
    el("kpiNps", { waarde: pad(kpis, "nps") }),
    el("kpiCsat", { waarde: pad(kpis, "csat") }),
    el("kpiSla", { waarde: pad(kpis, "sla") }),
    el("kpiFtr", { waarde: pad(kpis, "ftr") }),
  ];

  return `<kenmerken>${delen.join("")}</kenmerken>`;
}
