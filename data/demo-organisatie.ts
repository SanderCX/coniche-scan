import { Organisatie, ScanInvulling, ScanUitvoering, OrganisatieLid, TechstackItem } from "@/lib/types";

/**
 * Seed-data: vult localStorage bij het allereerste gebruik (zie
 * lib/db.ts `getSnapshot`), zodat het beheerscherm niet leeg start.
 */
const testLid: OrganisatieLid = {
  id: "lid-testklant",
  organisatieId: "org-demo",
  email: "sander_hesselink@hotmail.com",
  naam: null,
  functie: "",
  team: "",
  notities: "",
  toegangscode: "k7m2p9xq4r",
  leadMetingIds: [],
  aangemaaktOp: new Date().toISOString(),
};

const testInvulling: ScanInvulling = {
  id: "resp-testklant",
  scanUitvoeringId: "scan-demo",
  organisatieLidId: "lid-testklant",
  status: "uitgenodigd",
  antwoorden: {},
  opmerkingenPerBouwblok: {},
  aangemaaktOp: new Date().toISOString(),
  uitgenodigdOp: new Date().toISOString(),
  gestartOp: null,
  afgerondOp: null,
  bewaarVerlengdTot: null,
};

const testScanUitvoering: ScanUitvoering = {
  id: "scan-demo",
  organisatieId: "org-demo",
  assessmentId: "klantcontact-volwassenheid",
  label: "Testronde",
  aangemaaktOp: new Date().toISOString(),
  invullingen: [testInvulling],
};

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
  naam: "TestConicheScan BV",
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
  leden: [testLid],
  scanUitvoeringen: [testScanUitvoering],
  // Seed-data, geen echte aanmaker — zichtbaar voor Admin, niet voor een
  // Consultant (bereik "eigen", lib/rechten.ts) totdat een Admin het
  // eigenaarschap alsnog toekent of de organisatie toewijst.
  aangemaaktDoor: null,
  toegewezenAan: [],
  aangemaaktOp: new Date().toISOString(),
  gewijzigdOp: new Date().toISOString(),
};
