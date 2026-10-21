/**
 * De Spanningsmeter (`content-spanningsmeter.md`, voorstel van 21 oktober 2026, gebouwd op 21 oktober 2026): Een vijfde
 * Assessment met antwoordType "spanning". Zes spanningsvelden (de bouwblokken) zonder categorielaag, met per veld vijf gescoorde
 * vragen, de vijf ijkpunten uit het boek en de basis (de literatuur). Bron: "Spanningsmeter – vragenset" van Martijn en het
 * boek "Onder Spanning" (Franssen, 2026). De open voorbeeldvraag per veld heeft geen eigen record: Het antwoord staat in
 * `ScanInvulling.opmerkingenPerBouwblok` en de tekst in `Assessment.openVraag`.
 */
import { Assessment, Bouwblok } from "@/lib/types";

/** Een gescoorde vraag: ID, invalshoek, de vraag zelf en de toelichting "Waar je op let". */
type VraagBron = [id: string, invalshoek: string, tekst: string, aandachtspunt: string];

function veld(
  volgnummer: number,
  naam: string,
  korteNaam: string,
  omschrijving: string,
  basis: string,
  ijkpunten: [string, string, string, string, string],
  vragen: VraagBron[]
): Bouwblok {
  return {
    id: `sp-${volgnummer}`,
    volgnummer,
    naam,
    korteNaam,
    omschrijving,
    // De basis (de literatuur) staat in de Toelichtingsmodal van het veld, onder de ijkpunten.
    toelichting: basis,
    centraleVraag: null,
    tags: [],
    ijkpunten,
    gewicht: 1,
    vragen: vragen.map(([id, invalshoek, tekst, aandachtspunt], i) => ({
      id,
      volgnummer: i + 1,
      tekst,
      invalshoek,
      aandachtspunt,
    })),
  };
}

const velden: Bouwblok[] = [
  veld(
    1,
    "Verhaal & leiderschap",
    "Verhaal",
    "Meet of mensen het verhaal begrijpen, geloven en zelf uitdragen.",
    "Basis: Armenakis & Harris (2002), Readiness for Change (Holt e.a., 2007), visiecommunicatie (Rafferty & Griffin, 2004), woord-daadconsistentie (Simons, 2002) en sensemaking (Balogun & Johnson, 2004).",
    [
      "We vertellen het verhaal pas als onrust of weerstand ontstaat.",
      "Er zijn meerdere verhalen die elkaar niet altijd versterken.",
      "Het verhaal is helder, maar blijft vooral communicatie.",
      "Het verhaal geeft richting aan keuzes en gedrag.",
      "Mensen maken zich het verhaal eigen en vertalen het zelf naar beweging.",
    ],
    [
      [
        "VL1",
        "Noodzaak",
        "In hoeverre begrijpen mensen in alle lagen waarom verandering nodig is en wat er op het spel staat?",
        "Leggen mensen het in eigen woorden uit, of herhalen ze vooral woorden uit presentaties? Krijg je verschillende antwoorden op het waarom?",
      ],
      [
        "VL2",
        "Betekenis voor het werk",
        "In hoeverre weten mensen wat de verandering concreet betekent voor hun eigen werk en gedrag?",
        "Kunnen mensen zeggen wat er op maandagochtend anders gaat, of blijft de ambitie abstract?",
      ],
      [
        "VL3",
        "Richting in keuzes",
        "In hoeverre geeft het verhaal richting aan de keuzes die worden gemaakt?",
        "Zie je het verhaal terug in recente keuzes, ook in wat we níet meer doen? Spreken besluiten het verhaal soms tegen?",
      ],
      [
        "VL4",
        "Voorbeeldgedrag",
        "In hoeverre laten leiders zelf zien wat zij van anderen vragen?",
        "Veranderen leiders zichtbaar mee in hoe ze werken en beslissen? Vertellen ze in de kern hetzelfde verhaal?",
      ],
      [
        "VL5",
        "Dialoog & bijstellen",
        "In hoeverre wordt opgehaald of het verhaal nog aansluit bij wat mensen ervaren, en wordt het daarop bijgesteld?",
        "Gebeurt dat structureel, of toevallig via een klacht of kritische vraag? Wordt cynisme gezien als signaal?",
      ],
    ]
  ),
  veld(
    2,
    "Governance, regie & control",
    "Regie",
    "Meet wat regie in de praktijk doet: kiezen, stoppen, eigenaarschap over grenzen heen en bijsturen.",
    "Basis: Levers of Control (Simons, 1995), beslisrechten (Rogers & Blenko, 2006), strategie-executie (Sull, Homkes & Sull, 2015; Mankins & Steele, 2005) en dynamic capabilities (Teece, 2007).",
    [
      "We grijpen pas in als projecten vastlopen of druk oploopt.",
      "Er lopen veel initiatieven, maar zonder duidelijke prioriteit.",
      "Er is overleg en structuur, maar keuzes blijven nog te vrijblijvend.",
      "We verbinden ambitie, prioriteiten en capaciteit actief met elkaar.",
      "We sturen continu bij op voortgang in de veranderende werkelijkheid.",
    ],
    [
      [
        "GR1",
        "Prioriteren & stoppen",
        "In hoeverre worden er duidelijke prioriteiten gesteld, en wordt er ook gestopt?",
        "Is er een gedeeld beeld van wat voorgaat? Wordt bij iets nieuws besloten wat stopt, schuift of kleiner wordt?",
      ],
      [
        "GR2",
        "Besluitvorming",
        "In hoeverre wordt er tijdig en definitief besloten wanneer prioriteiten of belangen botsen?",
        "Is duidelijk wie de knoop doorhakt? Reizen vraagstukken langs overlegtafels, of komen besluiten later opnieuw op tafel?",
      ],
      [
        "GR3",
        "Eigenaarschap van het geheel",
        "In hoeverre is er eigenaarschap voor vraagstukken die over teams en domeinen heen lopen?",
        "Is er een eigenaar van het totale resultaat, met mandaat en middelen? Of repareren steeds dezelfde mensen informeel de gaten?",
      ],
      [
        "GR4",
        "Ambitie & capaciteit",
        "In hoeverre worden ambitie, prioriteiten en beschikbare capaciteit met elkaar in balans gebracht?",
        "Past het geheel van initiatieven in de capaciteit? Dragen lokale doelen bij aan het totale resultaat?",
      ],
      [
        "GR5",
        "Signalen & bijsturen",
        "In hoeverre leiden signalen over voortgang, risico's, kosten, klantimpact of werkdruk tot bijsturing?",
        "Wordt er tijdig geëscaleerd zonder dat dat als falen voelt? Durven we een plan los te laten?",
      ],
    ]
  ),
  veld(
    3,
    "Mensen & gedrag",
    "Gedrag",
    "Meet of de organisatie nieuw gedrag logisch, mogelijk en veilig maakt.",
    "Basis: COM-B (Michie, van Stralen & West, 2011), psychologische veiligheid (Edmondson, 1999), Kerr (1975), transfer van training (Baldwin & Ford, 1988) en weerstand als informatie (Ford, Ford & D'Amelio, 2008).",
    [
      "We betrekken mensen pas als weerstand zichtbaar wordt.",
      "We doen losse interventies, maar gedrag verandert nog beperkt.",
      "Er is aandacht voor adoptie en ontwikkeling, maar vooral planmatig.",
      "We verbinden gedrag en leiderschap actief met de verandering.",
      "Mensen nemen eigenaarschap, leren continu en versterken de verandering.",
    ],
    [
      [
        "MG1",
        "Concreet gedrag",
        "In hoeverre is helder welk gedrag moet veranderen, en zie je dat terug in het dagelijkse werk?",
        "Is het gedrag concreet en zichtbaar, of blijft het bij 'meer eigenaarschap'? Wat gebeurt er onder druk?",
      ],
      [
        "MG2",
        "Kunnen",
        "In hoeverre krijgen mensen wat ze nodig hebben om nieuw gedrag te leren en toe te passen?",
        "Is er na een training ruimte en begeleiding om te oefenen in het werk zelf?",
      ],
      [
        "MG3",
        "Omgeving",
        "In hoeverre maken KPI's, systemen, werkdruk en waardering het nieuwe gedrag makkelijker dan het oude?",
        "Wordt om nieuw gedrag gevraagd terwijl de omgeving het oude nog beloont?",
      ],
      [
        "MG4",
        "Durven",
        "In hoeverre is het veilig genoeg om anders te werken, zelf te beslissen en fouten te maken?",
        "Worden twijfels en fouten open besproken? Trekken leiders bij tegenvallers de controle weer naar zich toe?",
      ],
      [
        "MG5",
        "Weerstand & verspreiding",
        "In hoeverre wordt weerstand benut als informatie, en wordt nieuw gedrag breed gedragen?",
        "Wordt weerstand bij mensen gelegd, of gezien als signaal over de omgeving? Hangt het af van een paar voorlopers?",
      ],
    ]
  ),
  veld(
    4,
    "Data",
    "Data",
    "Meet of data aannames toetst en keuzes verandert.",
    "Basis: Data-driven decision making (Brynjolfsson, Hitt & Kim, 2011), data-driven culture (Gupta & George, 2016), data governance (Khatri & Brown, 2010), datakwaliteit (Wang & Strong, 1996) en experimenteren (Thomke, 2020).",
    [
      "We gebruiken data pas bij discussie, incidenten of prestatiedruk.",
      "Er is veel data, maar definities en interpretaties verschillen.",
      "We hebben dashboards, maar toetsen aannames nog beperkt.",
      "Data helpt ons patronen zien, keuzes maken en voortgang sturen.",
      "Data voedt continu leren, bijsturen en betere besluitvorming.",
    ],
    [
      [
        "DA1",
        "Eenduidigheid",
        "In hoeverre werken we met gedeelde en betrouwbare cijfers en definities?",
        "Komen discussies terug omdat afdelingen eigen bronnen gebruiken? Vertrouwen mensen de data waarmee ze werken?",
      ],
      [
        "DA2",
        "Besluiten op data",
        "In hoeverre worden belangrijke besluiten gebaseerd op data, en niet op aannames, ervaring of hiërarchie?",
        "Wordt data pas gezocht nadat de richting al is gekozen? Passen we een keuze aan als data een aanname tegenspreekt?",
      ],
      [
        "DA3",
        "Van signaal naar actie",
        "In hoeverre leiden afwijkingen in data tot actie?",
        "Heeft een afwijking een eigenaar? Is vooraf afgesproken bij welke uitkomst we bijsturen?",
      ],
      [
        "DA4",
        "Klant en medewerker",
        "In hoeverre worden signalen uit klachten, gesprekken en feedback verbonden tot patronen waarop we handelen?",
        "Komt data die schuurt met het dominante verhaal op tafel? Kleuren rapportages positiever dan de praktijk?",
      ],
      [
        "DA5",
        "Toetsen & leren",
        "In hoeverre gebruiken we data om aannames te toetsen en ervan te leren?",
        "Maken we aannames vooraf toetsbaar? Testen we kleinschalig voordat we opschalen?",
      ],
    ]
  ),
  veld(
    5,
    "Processen",
    "Processen",
    "Meet hoeveel verborgen complexiteit klanten en medewerkers opvangen en of die structureel verdwijnt.",
    "Basis: De Process Audit (Hammer, 2007), failure demand (Seddon, 2003), Tucker & Edmondson (2003), Repenning & Sterman (2001) en Hammer (1990).",
    [
      "We zien procesproblemen pas als klanten klagen.",
      "Teams lossen problemen lokaal op, oorzaken blijven bestaan.",
      "Processen zijn beschreven, maar uitzonderingen blijven onzichtbaar.",
      "We verbeteren end-to-end op klantwaarde en werkbaarheid.",
      "We herkennen complexiteit vroeg en vereenvoudigen continu.",
    ],
    [
      [
        "PR1",
        "End-to-end eigenaarschap",
        "In hoeverre wordt de klantreis als geheel bewaakt en verbeterd, over afdelingen heen?",
        "Is er één eigenaar van de hele reis, of optimaliseert elk team zijn eigen stap?",
      ],
      [
        "PR2",
        "Stroom & frictie",
        "In hoeverre stroomt werk soepel, zonder onnodige wachttijd, overdrachten en herhaal- of herstelwerk?",
        "Moeten klanten hun verhaal meerdere keren vertellen? Weten we welk deel van het werk voortkomt uit iets wat eerder misging?",
      ],
      [
        "PR3",
        "Uitzonderingen & workarounds",
        "In hoeverre blijft verborgen complexiteit beperkt, zonder structurele workarounds en uitzonderingen?",
        "Zijn uitzonderingen feitelijk standaard geworden? Hoe lang hebben nieuwe medewerkers nodig om ze allemaal te leren?",
      ],
      [
        "PR4",
        "Oorzaken aanpakken",
        "In hoeverre worden terugkerende problemen bij de oorzaak aangepakt?",
        "Lossen teams het lokaal op terwijl de oorzaak blijft? Stranden verbeteringen op afdelingsgrenzen?",
      ],
      [
        "PR5",
        "Vereenvoudigen & uitkomst",
        "In hoeverre sturen en verbeteren we processen op klantwaarde en werkbaarheid, en vereenvoudigen we voordat we automatiseren?",
        "Sturen teams op hun eigen productiviteit of op de uitkomst voor de klant? Verdwijnen stappen zonder waarde?",
      ],
    ]
  ),
  veld(
    6,
    "Technologie",
    "Technologie",
    "Meet of technologie versnelt wat al werkt en landt in werk, proces en data.",
    "Basis: UTAUT (Venkatesh e.a., 2003), Brynjolfsson, Rock & Syverson (2021), Designed for Digital (Ross, Beath & Mocker, 2019), workarounds (Alter, 2014) en het NIST AI Risk Management Framework (2023).",
    [
      "We zetten technologie in als de druk te groot wordt of problemen vastlopen.",
      "We hebben veel tools, maar weinig samenhang in gebruik en waarde.",
      "Technologie is geïmplementeerd, maar adoptie en gedrag blijven achter.",
      "Technologie verbindt proces, data en gedrag rond klantwaarde.",
      "Technologie versnelt leren, vereenvoudigen en vernieuwen.",
    ],
    [
      [
        "TE1",
        "Waarde",
        "In hoeverre begint de inzet van technologie bij een helder probleem, en levert die aantoonbaar waarde op?",
        "Toetsen we de waarde achteraf? Stoppen we bewust met technologie die niet oplevert?",
      ],
      [
        "TE2",
        "Adoptie & gebruik",
        "In hoeverre wordt technologie in de praktijk goed en volledig gebruikt?",
        "Ervaren medewerkers de systemen als nuttig? Houden ze daarnaast eigen lijstjes en workarounds bij?",
      ],
      [
        "TE3",
        "Samenhang in het landschap",
        "In hoeverre vormt de technologie één samenhangend geheel?",
        "Bouwen afdelingen eigen oplossingen voor vergelijkbare problemen? Moeten medewerkers schakelen tussen systemen of dubbel invoeren?",
      ],
      [
        "TE4",
        "Landen in het werk",
        "In hoeverre veranderen werkwijze, processen en sturing mee bij de invoering van technologie?",
        "Geldt livegang als succes, of minder moeite voor klant en medewerker?",
      ],
      [
        "TE5",
        "AI & eigenaarschap",
        "In hoeverre is de inzet van AI goed georganiseerd?",
        "Is duidelijk wie eigenaar is van data, kennis, kwaliteit en risico's? Wijken medewerkers uit naar eigen AI-tools?",
      ],
    ]
  ),
];

export const spanningsmeter: Assessment = {
  id: "spanningsmeter",
  afgeleidVanAssessmentId: null,
  naam: "Spanningsmeter",
  kortLabel: "Spanningsmeter",
  subtitel: "±10 tot 15 minuten. Zie waar de spanning zit tussen de zes velden.",
  beschrijving:
    "Zie waar de spanning zit tussen verhaal, regie, gedrag, data, processen en technologie. Je beoordeelt zes spanningsvelden met elk vijf vragen en ziet direct je eigen Spanningsprofiel. Daarna worden de profielen van de groep naast elkaar gelegd.",
  doelgroep:
    "Teams en organisaties die digitale verandering voorbereiden of uitvoeren en willen zien waar verhaal, regie, gedrag, data, processen en technologie uit balans zijn.",
  icoon: "gauge",
  geschatteDuur: "±10 tot 15 minuten",
  pdfContentSecties: null,
  categorieen: null,
  bouwblokken: velden,
  scoresPerGroepGesorteerd: false,
  bouwblokLabel: "Spanningsveld",
  bouwblokEenheidEnkelvoud: "spanningsveld",
  bouwblokEenheidMeervoud: "spanningsvelden",
  wegingTitel: null,
  wegingToelichting: null,
  featureCards: [
    { titel: "6 spanningsvelden", tekst: "Verhaal, regie, gedrag, data, processen en technologie, elk met vijf vragen op een eigen schaal van 1 tot 5." },
    { titel: "Direct je eigen profiel", tekst: "Meteen na afronden zie je je score per veld, het niveau en waar de spanning het grootst is." },
    { titel: "Daarna de groep", tekst: "Het beeld van de groep komt als de resultaten zijn opengezet. Antwoorden in groepsweergaven blijven anoniem." },
  ],
  schaal: [
    { waarde: 1, label: "Reactief" },
    { waarde: 2, label: "Gefragmenteerd" },
    { waarde: 3, label: "Georganiseerd" },
    { waarde: 4, label: "Geïntegreerd" },
    { waarde: 5, label: "Adaptief" },
  ],
  antwoordType: "spanning",
  instructieregel:
    "Beantwoord elke vraag vanuit wat jij zelf ziet in de organisatie. Kies een score van 1 tot 5 op de Spanningsmeter van dit veld. Kun je een vraag niet beoordelen, kies dan 0. Die vraag telt dan niet mee.",
  openVraag: "Geef een concreet voorbeeld (een klantmoment, overleg, besluit of project) dat je scores in dit veld onderbouwt.",
};
