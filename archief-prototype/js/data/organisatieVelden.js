// VeldDefinitie[] — CLAUDE.md sectie 2. Vandaag hardcoded, later beheerbaar.
// TechstackItem is één herbruikbare subveld-structuur (categorie, leverancier, ondersteuning).

const TECHSTACK_CATEGORIEEN = [
  "Contact center",
  "Conversational AI",
  "CRM",
  "Kennismanagement",
  "LLM-oplossing",
  "IT en deployment",
];

export const organisatieVelden = [
  {
    id: "volume-klantbasis",
    label: "Volume en klantbasis",
    type: "groep",
    subvelden: [
      {
        id: "totaal-klanten",
        label: "Totaal aantal klanten",
        type: "getal",
      },
      {
        id: "verdeling-b2b-b2c",
        label: "Verdeling B2B / B2C",
        type: "select-met-verdeling",
        opties: ["B2B", "B2C"],
      },
      {
        id: "contacten-per-jaar",
        label: "Totaal aantal contacten per jaar, per kanaal",
        type: "groep",
        subvelden: [
          { id: "kanaal-call", label: "Call", type: "getal" },
          { id: "kanaal-voicebot", label: "Voicebot", type: "getal" },
          { id: "kanaal-livechat", label: "Livechat", type: "getal" },
          { id: "kanaal-chatbot", label: "Chatbot", type: "getal" },
          { id: "kanaal-email", label: "E-mail", type: "getal" },
          { id: "kanaal-whatsapp", label: "Whatsapp", type: "getal" },
        ],
      },
      {
        id: "adoptie-mijnomgeving",
        label: "Adoptie mijnomgeving/app",
        type: "percentage",
      },
    ],
  },
  {
    id: "digitalisering",
    label: "Digitalisering",
    type: "groep",
    subvelden: [
      { id: "digitalisering-2026", label: "Percentage 2026", type: "getal" },
      { id: "digitalisering-ambitie-2030", label: "Ambitie 2030", type: "getal" },
    ],
  },
  {
    id: "techstack",
    label: "Techstack",
    type: "groep",
    subvelden: TECHSTACK_CATEGORIEEN.map((categorie) => ({
      id: `techstack-${slugify(categorie)}`,
      label: categorie,
      type: "groep",
      subvelden: [
        { id: "leverancier", label: "Leverancier", type: "tekst" },
        {
          id: "ondersteuning",
          label: "Zelf/extern ondersteund",
          type: "select",
          opties: ["zelf", "extern"],
        },
      ],
    })),
  },
  {
    id: "fte",
    label: "FTE",
    type: "groep",
    subvelden: [
      {
        id: "fte-klantcontact",
        label: "Klantcontact medewerkers",
        type: "getal",
      },
      {
        id: "fte-klantcontact-verdeling",
        label: "Verdeling inhouse / BPO",
        type: "select-met-verdeling",
        opties: ["Inhouse", "BPO"],
      },
      {
        id: "fte-management-support",
        label: "Klantcontact management & support",
        type: "getal",
      },
      {
        id: "fte-it-devops",
        label: "IT DevOps medewerkers",
        type: "getal",
      },
      {
        id: "fte-it-devops-digital",
        label: "Percentage gericht op Digital",
        type: "percentage",
      },
    ],
  },
  {
    id: "kpis",
    label: "KPI's",
    type: "groep",
    subvelden: [
      { id: "kpi-aht", label: "AHT", type: "getal" },
      { id: "kpi-nps", label: "NPS", type: "getal" },
      { id: "kpi-csat", label: "CSAT", type: "getal" },
      { id: "kpi-sla", label: "SLA", type: "getal" },
      { id: "kpi-ftr", label: "FTR", type: "getal" },
    ],
  },
];

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
