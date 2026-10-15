import { VeldDefinitie } from "@/lib/types";
import { GEEN_ONDERSTEUNING } from "@/lib/techstack";

const kanalen = ["Call", "Voicebot", "Livechat", "Chatbot", "E-mail", "Whatsapp"];

const sbiSectoren = [
  "Landbouw, bosbouw en visserij",
  "Winning van delfstoffen",
  "Industrie",
  "Productie en distributie van en handel in elektriciteit, gas, stoom en gekoelde lucht",
  "Winning en distributie van water; afval- en afvalwaterbeheer en sanering",
  "Bouwnijverheid",
  "Groot- en detailhandel",
  "Vervoer en opslag",
  "Logies-, maaltijd- en drankverstrekking",
  "Activiteiten van uitgeverijen, omroepactiviteiten, en activiteiten op het gebied van productie en distributie van inhoud",
  "Telecommunicatie, computerprogrammering en consultancy, informatica-infrastructuur en overige activiteiten op het gebied van informatiediensten",
  "Activiteiten op het gebied van financiële dienstverlening en verzekeringen",
  "Exploitatie van en handel in onroerend goed",
  "Wetenschappelijke en technische activiteiten en specialistische zakelijke dienstverlening",
  "Verhuur van roerende goederen en overige zakelijke dienstverlening",
  "Openbaar bestuur, overheidsdiensten en verplichte sociale verzekeringen",
  "Onderwijs",
  "Gezondheids- en welzijnszorg",
  "Kunst, cultuur, sport en recreatie",
  "Overige dienstverlening",
  "Activiteiten van huishoudens als werkgever en niet-gedifferentieerde productie van goederen en diensten door huishoudens voor eigen gebruik",
  "Activiteiten van extraterritoriale organisaties en instanties",
];

export const sbiSubsectorenPerSector: Record<string, string[]> = {
  "Landbouw, bosbouw en visserij": [
    "Landbouw, jacht en dienstverlening voor de landbouw en jacht",
    "Bosbouw, exploitatie van bossen en dienstverlening voor de bosbouw",
    "Visserij en aquacultuur",
  ],
  "Winning van delfstoffen": [
    "Winning van steenkool en bruinkool",
    "Winning van aardolie en aardgas",
    "Winning van metaalertsen",
    "Overige winning van delfstoffen",
    "Dienstverlening voor de winning van delfstoffen",
  ],
  "Industrie": [
    "Vervaardiging van voedingsmiddelen",
    "Vervaardiging van dranken",
    "Vervaardiging van tabaksproducten",
    "Vervaardiging van textiel",
    "Vervaardiging van kleding",
    "Vervaardiging van leer, lederwaren en soortgelijke producten van andere materialen",
    "Houtindustrie en vervaardiging van artikelen van hout en kurk, met uitzondering van meubelen; vervaardiging van artikelen van riet en van vlechtwerk",
    "Vervaardiging van papier en papierwaren",
    "Activiteiten op het gebied van drukwerk en reproductie van opgenomen media",
    "Vervaardiging van cokes en van geraffineerde aardolieproducten",
    "Vervaardiging van chemicaliën en chemische producten",
    "Vervaardiging van farmaceutische grondstoffen en producten",
    "Vervaardiging van producten van rubber of kunststof",
    "Vervaardiging van overige niet-metaalhoudende minerale producten",
    "Vervaardiging van basismetalen",
    "Vervaardiging van producten van metaal, met uitzondering van machines en apparatuur",
    "Vervaardiging van computers en van elektronische en optische apparatuur",
    "Vervaardiging van elektrische apparatuur",
    "Vervaardiging van machines en apparaten, n.e.g.",
    "Vervaardiging van motorvoertuigen, aanhangwagens en opleggers",
    "Vervaardiging van overige vervoermiddelen",
    "Vervaardiging van meubelen",
    "Vervaardiging van overige goederen",
    "Reparatie, onderhoud en installatie van machines en apparaten",
  ],
  "Productie en distributie van en handel in elektriciteit, gas, stoom en gekoelde lucht": [
    "Productie en distributie van en handel in elektriciteit, gas, stoom en gekoelde lucht",
  ],
  "Winning en distributie van water; afval- en afvalwaterbeheer en sanering": [
    "Winning, behandeling en distributie van water",
    "Afvalwaterinzameling en -behandeling",
    "Afvalinzameling, voorbereiding tot recycling, en verwijdering",
    "Sanering en overig afvalbeheer",
  ],
  "Bouwnijverheid": [
    "Burgerlijke en utiliteitsbouw",
    "Grond-, water- en wegenbouw",
    "Gespecialiseerde werkzaamheden in de bouw",
  ],
  "Groot- en detailhandel": [
    "Groothandel",
    "Detailhandel",
  ],
  "Vervoer en opslag": [
    "Vervoer over land en via pijpleidingen",
    "Vervoer over water",
    "Luchtvaart",
    "Opslag en dienstverlening voor vervoer",
    "Post- en koeriersdiensten",
  ],
  "Logies-, maaltijd- en drankverstrekking": [
    "Logiesverstrekking en -bemiddeling",
    "Exploitatie van eet- en drinkgelegenheden",
  ],
  "Activiteiten van uitgeverijen, omroepactiviteiten, en activiteiten op het gebied van productie en distributie van inhoud": [
    "Activiteiten van uitgeverijen",
    "Productie en distributie van films en video- en televisieprogramma's en audio, maken van geluidsopnamen en uitgeven van muziekopnamen",
    "Programmering, uitzending, perssagentschappen en overige activiteiten op het gebied van de verspreiding van inhoud",
  ],
  "Telecommunicatie, computerprogrammering en consultancy, informatica-infrastructuur en overige activiteiten op het gebied van informatiediensten": [
    "Telecommunicatie",
    "Computerprogrammering, consultancy en aanverwante activiteiten",
    "Dienstverlenende activiteiten op het gebied van informatie",
  ],
  "Activiteiten op het gebied van financiële dienstverlening en verzekeringen": [
    "Financiële dienstverlening, met uitzondering van verzekeringen en pensioenfondsen",
    "Activiteiten op het gebied van verzekeringen en pensioenfondsen, met uitzondering van verplichte sociale verzekeringen",
    "Ondersteunende activiteiten voor financiële diensten, verzekeringen en pensioenen",
  ],
  "Exploitatie van en handel in onroerend goed": [
    "Exploitatie van en handel in onroerend goed",
  ],
  "Wetenschappelijke en technische activiteiten en specialistische zakelijke dienstverlening": [
    "Rechtskundige en boekhoudkundige dienstverlening",
    "Activiteiten van hoofdkantoren, interne concerndiensten en managementadvisering",
    "Activiteiten van architecten en ingenieurs; technisch ontwerp en advies, keuring en controle",
    "Wetenschappelijk onderzoek en ontwikkeling",
    "Reclameactiviteiten, marktonderzoek en public relations",
    "Overige wetenschappelijke en technische activiteiten en overige specialistische zakelijke dienstverlening",
    "Veterinaire dienstverlening",
  ],
  "Verhuur van roerende goederen en overige zakelijke dienstverlening": [
    "Verhuur en lease",
    "Arbeidsbemiddeling, activiteiten van uitzendbureaus en personeelsbeheer",
    "Activiteiten van reisbureaus, reisorganisatoren, reserveringsbureaus en aanverwante activiteiten",
    "Opsporings- en beveiligingsdiensten",
    "Diensten in verband met gebouwen; landschapsverzorging",
    "Administratieve en ondersteunende activiteiten ten behoeve van kantoren en overige zakelijke dienstverlening",
  ],
  "Openbaar bestuur, overheidsdiensten en verplichte sociale verzekeringen": [
    "Openbaar bestuur, overheidsdiensten en verplichte sociale verzekeringen",
  ],
  "Onderwijs": [
    "Onderwijs",
  ],
  "Gezondheids- en welzijnszorg": [
    "Gezondheidszorg",
    "Verpleging, verzorging en begeleiding met verblijf",
    "Maatschappelijke dienstverlening zonder verblijf",
  ],
  "Kunst, cultuur, sport en recreatie": [
    "Activiteiten op het gebied van scheppende en uitvoerende kunst",
    "Activiteiten van bibliotheken, archieven, musea en overige culturele activiteiten",
    "Exploitatie van loterijen, kansspelen en kansspelautomaten",
    "Sport, ontspanning en recreatie",
  ],
  "Overige dienstverlening": [
    "Activiteiten van ledenorganisaties",
    "Reparatie en onderhoud van computers, consumentenartikelen, auto's en motorfietsen",
    "Persoonlijke dienstverlening",
  ],
  "Activiteiten van huishoudens als werkgever en niet-gedifferentieerde productie van goederen en diensten door huishoudens voor eigen gebruik": [
    "Activiteiten van huishoudens als werkgever van huishoudelijk personeel",
    "Niet-gedifferentieerde productie van goederen en diensten door particuliere huishoudens voor eigen gebruik",
  ],
  "Activiteiten van extraterritoriale organisaties en instanties": [
    "Activiteiten van extraterritoriale organisaties en instanties",
  ],
};

/**
 * Vaste keuzes voor de Oplossing per techstack-categorie (LLM-oplossing staat apart, zie `llmModelfamilies`). Keuzelijst
 * met "Anders…" (`eigenOptie`). De volgorde hier maakt niet uit: De app toont de lijst op alfabet.
 */
const techstackOplossingen: Record<string, string[]> = {
  "Contact center": [
    "Genesys Cloud",
    "NICE CXone",
    "Microsoft 365 Contact Center",
    "Anywhere 365",
    "Enreach Contact Center",
    "Cisco Webex Contact Center",
    "Avaya Experience Platform",
    "Salesforce Service Cloud Voice",
    "Amazon Connect",
    "Odigo",
    "RingCentral Contact Center",
    "Mitel Contact Center",
    "Freshdesk Contact Center",
    "Puzzel",
    "Zendesk",
    "Five9",
    "Talkdesk",
    "Storm CX",
    "Sprinklr",
  ],
  "Conversational AI": [
    "Google Dialogflow CX",
    "Microsoft Copilot Studio",
    "CM.com Conversational AI Cloud",
    "Seamly",
    "Cognigy",
    "Genesys Cloud Digital & Voice Bots",
    "Zendesk AI Agents",
    "Watermelon",
    "IBM Watson Assistant",
    "Chatlayer",
    "Kore.ai",
    "Amazon Lex",
    "Rasa",
    "Parloa",
  ],
  CRM: [
    "Salesforce Service Cloud",
    "Microsoft Dynamics 365 Customer Service",
    "ServiceNow Customer Service Management",
    "SAP Service Cloud",
    "Pega Customer Service",
    "Oracle CX Service",
    "Zendesk",
    "Freshdesk",
    "HubSpot Service Hub",
    "Trengo",
    "Intercom",
    "SuperOffice",
    "Zoho Desk",
    "TOPdesk",
    "AFAS CRM",
    "Oracle Siebel CRM",
    "SugarCRM",
  ],
  Kennismanagement: [
    "Salesforce Knowledge",
    "ServiceNow Knowledge Management",
    "Microsoft Dynamics 365 Knowledge Management",
    "Zendesk Guide",
    "NICE CXone Expert",
    "eGain Knowledge",
    "Verint Knowledge Management",
    "CM.com Knowledge",
    "Confluence",
    "SharePoint",
    "TOPdesk Kennisbank",
    "Freshdesk Knowledge Base",
    "KnowledgePlaza",
    "Guru",
  ],
  WFM: [
    "NICE WFM",
    "Verint Workforce Management",
    "Calabrio WFM",
    "Genesys Cloud WEM",
    "Injixo",
    "Alvaria Workforce",
    "Playvox",
    "Assembled",
    "Zendesk WFM",
    "Puzzel WFM",
    "Talkdesk WFM",
    "Five9 WFM",
    "Pipkins Merlang",
    "Monet WFM",
    "ORTEC Workforce Scheduling",
    "Inplanning",
    "Intradiem",
    "GMT Planet",
    "Zoom Workforce Management",
    "Planday",
  ],
};

/**
 * Partijen die een techstack-categorie ondersteunen, voor de keuzelijst "Ondersteund door". Per categorie een eigen
 * lijst, op alfabet getoond, met "Geen ondersteuning" (zelf) vooraan en "Anders…" onderaan. LLM-oplossing heeft geen
 * "Ondersteund door" (zie `llmModelfamilies`).
 */
const techstackOndersteuners: Record<string, string[]> = {
  "Contact center": [
    "Sabio", "Coniche", "Frontline", "Cloudoe", "Bright Contact", "Axians", "NTT Data", "Proximus NXT", "KPN",
    "VodafoneZiggo Zakelijk", "Odido Business", "Concentrix", "Teleperformance", "Yource", "Conscia", "SPIE ICS",
    "Computacenter", "Eviden", "Accenture", "Capgemini", "Cegeka", "Wortell", "Avanade", "Sopra Steria", "Inetum",
  ],
  WFM: [
    "Sabio", "Coniche", "Frontline", "Cloudoe", "Bright Contact", "NTT Data", "Teleperformance", "Concentrix",
    "Yource", "Axians", "Proximus NXT", "Conscia", "KPN", "VodafoneZiggo Zakelijk", "Odido Business", "Accenture",
    "Capgemini", "Avanade", "HSO", "Cegeka", "Sopra Steria", "Eviden", "Computacenter", "Deloitte", "Vlirdens",
  ],
  Kennismanagement: [
    "TKC The Knowledge Company", "Neople", "Coniche", "Frontline", "Cloudoe", "Bright Contact", "Plat4mation",
    "Devoteam", "Avanade", "Macaw", "ilionx", "HSO", "Conclusion", "Cegeka", "Sopra Steria", "Capgemini",
    "Accenture", "Deloitte Digital", "Sabio", "Concentrix", "Teleperformance", "Yource", "KPN",
    "VodafoneZiggo Zakelijk", "Odido Business",
  ],
  CRM: [
    "Accenture", "Deloitte Digital", "Capgemini", "Coniche", "Frontline", "Cloudoe", "Bright Contact", "PwC",
    "Sopra Steria", "Avanade", "HSO", "Macaw", "ilionx", "Conclusion", "Plat4mation", "Devoteam",
    "NTT Data Business Solutions", "Valtech", "BusinessBase", "Cegeka", "KPN",
    "VodafoneZiggo Zakelijk", "Odido Business",
  ],
  "Conversational AI": [
    "Sabio", "Coniche", "Frontline", "Cloudoe", "Bright Contact", "Studio Winegum", "Seamly", "Neople", "Incentro",
    "Devoteam", "Accenture", "Capgemini", "Deloitte", "Conclusion", "Avanade", "Macaw", "Wortell", "ilionx",
    "Sopra Steria", "Concentrix", "Teleperformance", "Yource", "KPN", "VodafoneZiggo Zakelijk", "Odido Business",
  ],
};

/**
 * Per techstack-categorie komen er twee keuzelijsten bij op dezelfde regel: Deploymentmodel en Cloudleverancier. Beide
 * staan in de volgorde zoals aangeleverd (een logische volgorde, niet alfabetisch) via `voorop`. Eigen invoer ("Anders…")
 * komt daarna, op alfabet.
 */
const deploymentmodellen = [
  "Public Cloud (SaaS, multi-tenant)",
  "Dedicated Cloud (single-tenant)",
  "Private Cloud",
  "Sovereign Cloud",
  "Hosted bij provider",
  "Hosted bij partner/integrator",
  "On-premises",
  "Hybride",
  "Multicloud",
];

const cloudleveranciers = [
  "Microsoft Azure",
  "Amazon Web Services",
  "Google Cloud",
  "Oracle Cloud",
  "IBM Cloud",
  "Vendor eigen cloud",
  "VMware",
  "OpenStack",
  "OVHcloud",
  "STACKIT",
  "Scaleway",
  "IONOS",
  "Leaseweb",
  "Previder",
  "Cyso",
  "KPN",
  "VodafoneZiggo",
  "Odido",
  "Rijkscloud / ODC",
  "Eigen datacenter",
];

/**
 * LLM-oplossing wijkt af van de andere categorieën: Geen "Ondersteund door", Deploymentmodel of Cloudleverancier, maar
 * een modelfamilie (de Oplossing) en een toegangsroute. Beide staan in de aangeleverde volgorde (`voorop`).
 */
const llmModelfamilies = [
  "OpenAI GPT",
  "Anthropic Claude",
  "Google Gemini",
  "Meta Llama",
  "Mistral",
  "Cohere Command",
  "xAI Grok",
  "DeepSeek",
  "Alibaba Qwen",
  "Amazon Nova",
  "Microsoft Phi",
  "IBM Granite",
  "NVIDIA Nemotron",
  "GPT-NL",
  "Vendor eigen model",
  "Onbekend / niet openbaar",
];

const llmToegangsroutes = [
  "Direct via modelleverancier (API)",
  "Azure AI Foundry / Azure OpenAI",
  "AWS Bedrock",
  "Google Vertex AI",
  "Ingebouwd in vendorplatform",
  "Self-hosted (open-weight model)",
  "EU-gehost / sovereign",
];

const LLM_CATEGORIE = "LLM-oplossing";

/** De volgorde van het formulier: Contact center, WFM, CRM, Kennismanagement, Conversational AI, LLM-oplossing. */
const techstackCategorieen = [
  "Contact center",
  "WFM",
  "CRM",
  "Kennismanagement",
  "Conversational AI",
  "LLM-oplossing",
];

export const organisatieVelden: VeldDefinitie[] = [
  {
    id: "sector-subsector",
    label: "Sector en subsector",
    type: "groep",
    subvelden: [
      { id: "sector", label: "Sector", type: "select", opties: sbiSectoren },
      {
        id: "subsector",
        label: "Subsector",
        type: "select-afhankelijk",
        afhankelijkVan: "sector",
        optiesPerWaarde: sbiSubsectorenPerSector,
      },
    ],
  },
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
      subvelden:
        categorie === LLM_CATEGORIE
          ? [
              {
                id: "leverancier",
                label: "LLM (modelfamilie)",
                type: "select" as const,
                opties: [],
                voorop: llmModelfamilies,
                eigenOptie: true,
                eigenOptiePlaceholder: "Naam van de modelfamilie",
              },
              {
                id: "toegangsroute",
                label: "LLM-toegangsroute",
                type: "select" as const,
                opties: [],
                voorop: llmToegangsroutes,
                eigenOptie: true,
                eigenOptiePlaceholder: "Naam van de toegangsroute",
              },
            ]
          : [
              {
                id: "leverancier",
                label: "Oplossing",
                type: "select" as const,
                opties: techstackOplossingen[categorie],
                eigenOptie: true,
              },
              {
                id: "ondersteuner",
                label: "Ondersteund door",
                type: "select" as const,
                opties: techstackOndersteuners[categorie],
                voorop: [GEEN_ONDERSTEUNING],
                eigenOptie: true,
                eigenOptiePlaceholder: "Naam van de partij",
              },
              {
                id: "deploymentmodel",
                label: "Deploymentmodel",
                type: "select" as const,
                opties: [],
                voorop: deploymentmodellen,
                eigenOptie: true,
                eigenOptiePlaceholder: "Naam van het deploymentmodel",
              },
              {
                id: "cloudleverancier",
                label: "Cloudleverancier",
                type: "select" as const,
                opties: [],
                voorop: cloudleveranciers,
                eigenOptie: true,
                eigenOptiePlaceholder: "Naam van de cloudleverancier",
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
        type: "groep",
        subvelden: [{ id: "aantal", label: "Aantal FTE", type: "getal" }],
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

/** Id's van de techstack-categorieën met een lijst "Ondersteund door" (voor het omzetten van het oude veld `ondersteuning`). */
export const techstackCategorieIdsMetLijst: string[] = Object.keys(techstackOndersteuners).map(
  (categorie) => `techstack-${categorie.toLowerCase().replace(/\s+/g, "-")}`
);
