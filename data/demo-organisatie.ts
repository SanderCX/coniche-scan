import { Organisatie, TechstackItem } from "@/lib/types";

const techstack: Record<string, TechstackItem> = {
  "techstack-contact-center": {
    categorie: "Contact center",
    leverancier: "Genesys",
    ondersteuning: "extern",
  },
  "techstack-conversational-ai": {
    categorie: "Conversational AI",
    leverancier: "Cognigy",
    ondersteuning: "extern",
  },
  "techstack-crm": { categorie: "CRM", leverancier: "Salesforce", ondersteuning: "zelf" },
  "techstack-kennismanagement": {
    categorie: "Kennismanagement",
    leverancier: "Confluence",
    ondersteuning: "zelf",
  },
  "techstack-llm-oplossing": {
    categorie: "LLM-oplossing",
    leverancier: "Claude (Anthropic)",
    ondersteuning: "extern",
  },
  "techstack-it-en-deployment": {
    categorie: "IT en deployment",
    leverancier: "AWS",
    ondersteuning: "zelf",
  },
};

export const demoOrganisatie: Organisatie = {
  id: "org-demo",
  assessmentId: "klantcontact-volwassenheid",
  naam: "Demo Organisatie B.V.",
  kenmerken: {
    "volume-klantbasis": {
      "totaal-klanten": { totaal: 480000, "b2b-percentage": 15, "b2c-percentage": 85 },
      "contacten-per-jaar": {
        "kanaal-call": 620000,
        "kanaal-voicebot": 90000,
        "kanaal-livechat": 210000,
        "kanaal-chatbot": 340000,
        "kanaal-e-mail": 180000,
        "kanaal-whatsapp": 75000,
      },
      "adoptie-mijnomgeving": 62,
    },
    digitalisering: { "percentage-2026": 48, "ambitie-2030": 75 },
    techstack,
    fte: {
      "fte-klantcontact": { aantal: 240, "inhouse-percentage": 70, "bpo-percentage": 30 },
      "fte-management-support": 28,
      "fte-it-devops": { aantal: 14, "digital-percentage": 60 },
    },
    kpis: { aht: 285, nps: 32, csat: 84, sla: 88, ftr: 76 },
  },
  respondenten: [],
};
