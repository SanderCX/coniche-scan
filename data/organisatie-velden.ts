import { VeldDefinitie } from "@/lib/types";

const kanalen = ["Call", "Voicebot", "Livechat", "Chatbot", "E-mail", "Whatsapp"];

const techstackCategorieen = [
  "Contact center",
  "Conversational AI",
  "CRM",
  "Kennismanagement",
  "LLM-oplossing",
  "IT en deployment",
];

export const organisatieVelden: VeldDefinitie[] = [
  {
    id: "volume-klantbasis",
    label: "Volume en klantbasis",
    type: "groep",
    subvelden: [
      {
        id: "totaal-klanten",
        label: "Totaal aantal klanten",
        type: "groep",
        subvelden: [
          { id: "totaal", label: "Totaal aantal klanten", type: "getal" },
          { id: "b2b-percentage", label: "Waarvan B2B", type: "percentage" },
          { id: "b2c-percentage", label: "Waarvan B2C", type: "percentage" },
        ],
      },
      {
        id: "contacten-per-jaar",
        label: "Totaal aantal contacten per jaar, per kanaal",
        type: "groep",
        subvelden: kanalen.map((kanaal) => ({
          id: `kanaal-${kanaal.toLowerCase()}`,
          label: kanaal,
          type: "getal" as const,
        })),
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
      { id: "percentage-2026", label: "Percentage 2026", type: "percentage" },
      { id: "ambitie-2030", label: "Ambitie 2030", type: "percentage" },
    ],
  },
  {
    id: "techstack",
    label: "Techstack",
    type: "groep",
    subvelden: techstackCategorieen.map((categorie) => ({
      id: `techstack-${categorie.toLowerCase().replace(/\s+/g, "-")}`,
      label: categorie,
      type: "groep" as const,
      subvelden: [
        { id: "leverancier", label: "Leverancier", type: "tekst" as const },
        {
          id: "ondersteuning",
          label: "Zelf / extern ondersteund",
          type: "select" as const,
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
        type: "groep",
        subvelden: [
          { id: "aantal", label: "Aantal FTE", type: "getal" },
          { id: "inhouse-percentage", label: "Waarvan inhouse", type: "percentage" },
          { id: "bpo-percentage", label: "Waarvan BPO", type: "percentage" },
        ],
      },
      {
        id: "fte-management-support",
        label: "Klantcontact management & support",
        type: "getal",
      },
      {
        id: "fte-it-devops",
        label: "IT DevOps medewerkers",
        type: "groep",
        subvelden: [
          { id: "aantal", label: "Aantal FTE", type: "getal" },
          { id: "digital-percentage", label: "Percentage gericht op Digital", type: "percentage" },
        ],
      },
    ],
  },
  {
    id: "kpis",
    label: "KPI's",
    type: "groep",
    subvelden: [
      { id: "aht", label: "AHT", type: "getal" },
      { id: "nps", label: "NPS", type: "getal" },
      { id: "csat", label: "CSAT", type: "percentage" },
      { id: "sla", label: "SLA", type: "percentage" },
      { id: "ftr", label: "FTR", type: "percentage" },
    ],
  },
];
