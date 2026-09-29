import { VeldDefinitie } from "@/lib/types";

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
      subvelden: [
        { id: "leverancier", label: "Oplossing", type: "tekst" as const },
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
