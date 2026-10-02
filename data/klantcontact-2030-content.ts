/**
 * Statische content voor de publieke "Klantcontact richting 2030"-pagina
 * (`app/klantcontact-2030/page.tsx`), letterlijk overgenomen uit
 * `content-2030.md`.
 */

export const geenVastEindbeeld: string[] = [
  "Waar klantcontact naartoe gaat richting 2030 ligt niet vast. Organisaties bewegen niet dezelfde kant op: de ene zet vooral in op verdere digitalisering, de andere kiest bewust voor meer menselijk contact. Dat is geen tussenfase die vanzelf overgaat, het is een blijvend kenmerk van de markt.",
  "Daarom is de vraag niet welk model wint. De vraag is hoe je een organisatie inricht die met beide kanten overweg kan, zonder nu al te moeten kiezen wat er over vijf jaar dominant is.",
];

export const vijfDingenIntro =
  "Ongeacht welke kant een organisatie op beweegt, komen vijf keuzes sowieso op haar pad.";

export const machineCustomerEffectenIntro =
  "Wat dit in de praktijk betekent voor het contact zelf:";

export const kenmerkenIntro =
  "Uit gesprekken met organisaties die actief bezig zijn met klantcontact richting 2030, komen steeds dezelfde punten terug, langs vijf invalshoeken:";

export interface TitelTekst {
  titel: string;
  tekst: string | string[];
}

export const vijfDingenOntwerpen: TitelTekst[] = [
  {
    titel: "Waar een beslissing landt",
    tekst: "Steeds meer keuzes worden niet meer tijdens het contact zelf gemaakt, maar vooraf vastgelegd in processen, regels en kennisstructuren. Dat geldt voor een chatbot net zo goed als voor een medewerker. De vraag is niet of dat gebeurt, maar welke beslissingen je bewust vooraf vastlegt, welke altijd bij een mens blijven, en welke kunnen verschuiven.",
  },
  {
    titel: "Meerdere manieren van werken naast elkaar",
    tekst: "Snelle, gestandaardiseerde afhandeling en zorgvuldig menselijk contact met ruimte voor afweging blijven allebei bestaan, vaak tegelijk. Dat moet je expliciet inrichten, in routering, mandaat en wat je naar klanten communiceert, anders ontstaat er wrijving zodra de balans verschuift.",
  },
  {
    titel: "Het omschakelpunt tussen mens en systeem",
    tekst: "Niet het kanaal bepaalt de kwaliteit van het contact, maar het moment waarop context wordt overgedragen, waarop een medewerker van de standaardlogica mag afwijken, of waarop een uitzondering wordt geaccepteerd. Is dat niet bewust ingericht, dan voelt elke verandering als verstoring. Dat omschakelpunt wordt met de opkomst van de machine customer een stap complexer: niet alleen wanneer een systeem naar een mens overdraagt, maar ook of je weet of er aan de andere kant een mens, een systeem, of de AI-assistent van een klant zit.",
  },
  {
    titel: "Kennis los van het kanaal",
    tekst: "Kanalen blijven veranderen, de behoefte aan consistente informatie niet. Wie kennis per kanaal apart organiseert, is kwetsbaar voor elke volgende verschuiving. Wat als waarheid geldt, wie dat beheert en hoe het beschikbaar is voor mens én systeem, is een randvoorwaarde, geen bijzaak.",
  },
  {
    titel: "Ruimte om terug te kunnen",
    tekst: "Omdat het eindbeeld niet vaststaat, is het riskant om keuzes onnodig vast te zetten, in technologie, contracten of rolverdeling. Dat betekent niet besluiteloos blijven, maar bewust keuzeruimte openhouden.",
  },
];

export const machineCustomerIntro: string[] = [
  "Dezelfde AI-technologie die organisaties zelf intern inzetten, komt ook beschikbaar voor klanten. In de toekomst neemt niet altijd de klant zelf contact op, maar een AI-assistent namens die klant: die leest documenten, verzamelt context en klantgegevens, formuleert vragen, start acties en levert complete dossiers aan. Dat is een verschuiving van \"uitleg en zoeken\" naar \"dossier en actie\".",
];

export interface EffectMetIcoon {
  titel: string;
  tekst: string;
  /** Sleutel in MACHINE_CUSTOMER_ICONS, components/icons/MachineCustomerIcons.tsx. */
  icoon: string;
}

export const machineCustomerEffecten: EffectMetIcoon[] = [
  {
    titel: "Klanten met AI zijn beter voorbereid",
    tekst:
      "Klant-AI bundelt vooraf bestelgegevens, facturen, screenshots en logbestanden tot een compleet dossier, met het verzoek \"los dit op\" in plaats van een losse vraag.",
    icoon: "dossier",
  },
  {
    titel: "Verzoeken worden meer actiegericht",
    tekst: "Niet \"waarom is mijn factuur hoog?\", maar \"corrigeer het bedrag en stuur een nieuwe factuur\".",
    icoon: "bolt",
  },
  {
    titel: "Contactfrequentie stijgt, 24 uur per dag",
    tekst:
      "Een klant kan met AI snel vragen formuleren en die doorlopend opvolgen, wat het contactvolume verhoogt en complexer maakt.",
    icoon: "clock",
  },
  {
    titel: "Verwachtingen verschuiven",
    tekst:
      "De klant verwacht dat de organisatie zelf ook goede CX-AI heeft: gestandaardiseerde antwoorden, snelle responstijden en consistente afhandeling.",
    icoon: "trendUp",
  },
  {
    titel: "Nieuwe vragen over \"foute\" transacties",
    tekst:
      "Een klant neemt contact op over iets dat zijn eigen AI, bewust of onbewust, onterecht heeft aangepast of opgezegd.",
    icoon: "alert",
  },
];

export const machineCustomerPunten: TitelTekst[] = [
  {
    titel:
      "Wat de complexiteit vergroot, is niet één van deze combinaties op zich, maar de toename ervan en het wisselen ertussen",
    tekst: "Klant en medewerker, klant en systeem, de AI-assistent van de klant en het systeem van de organisatie, en alle tussenvormen daarin (een medewerker die met een systeem meekijkt, een klant-AI die uiteindelijk bij een medewerker uitkomt) bestaan naast elkaar. Een gesprek kan tussen deze vormen wisselen zonder dat dat vooraf vaststaat, en elke wisseling vraagt om overdracht van context, autorisatie en verantwoordelijkheid. Machine-to-machine interacties vragen daarbovenop strengere regels rond identiteit, autorisatie en misbruikpreventie dan een gesprek met een mens.",
  },
  {
    titel: "Een deel van dat contact vindt buiten je eigen kanalen plaats",
    tekst: [
      "Klanten stellen hun vraag steeds vaker rechtstreeks aan een algemene AI-assistent als ChatGPT, Claude of Copilot, niet aan de organisatie zelf. De cijfers achter die verschuiving: generatieve AI bereikte in drie jaar tijd meer mensen dan de pc of het internet ooit deden, met een wereldwijde adoptie van 53 procent en een geschatte consumentenwaarde van 172 miljard dollar per jaar in 2026 (Stanford HAI). Nederland valt daarbij in het hoog-adoptiesegment, als welvarende economie. Onder studenten gebruikt inmiddels 4 op de 5 AI, wat betekent dat een groot deel van de toekomstige klanten AI-native is.",
      "Dat brengt twee risico's met zich mee die niets met je eigen platform te maken hebben: of die externe AI je bedrijfscontent wel juist en actueel samenvat, en of het antwoord past bij de specifieke situatie van die ene klant, aangezien de externe AI de klantcontext niet kent. Een op zich correct klinkend antwoord kan voor deze klant alsnog fout zijn.",
    ],
  },
  {
    titel: "Waarom dit een platformvraag is, geen chatbotvraag",
    tekst: "De voor de hand liggende reactie is \"we hebben een slimme chatbot nodig\". De kern ligt dieper en verandert niet met het aantal combinaties hierboven: kunnen de eigen processen machine-to-machine worden uitgevoerd, hoe zijn autorisatie en aansprakelijkheid geregeld, welke acties mag een klant-AI zelfstandig uitvoeren? Dat vraagt zorgvuldiger registreren en bewaken dan tot nu toe gebruikelijk was, soms verder dan waar de formele zorgplicht toe verplicht.",
  },
];

export const machineCustomerSlot: string[] = [
  "Stel dat de AI-assistent van een klant een wijziging doorvoert, en die klant zegt achteraf dat nooit zelf gevraagd te hebben: dan is het cruciaal dat de organisatie kan aantonen dat ze netjes in opdracht van de klant heeft gehandeld, eventueel via een vastgelegde volmacht. Zonder registratie van wie welke actie initieerde, staat een organisatie met lege handen, en dat risico is het grootst bij verkeer dat het eigen platform niet eens bereikt.",
  "Dit is precies waarom \"Data, integratie en architectuur\" een centraal platform als randvoorwaarde noemt, niet als wenselijke extra: zonder dat fundament wordt onzichtbaar wie welke stap zette.",
];

export const aiConcreet: TitelTekst[] = [
  {
    titel: "Van interface naar gesprek",
    tekst: "Klanten bellen nog steeds het liefst, maar voice- en chatbots worden gewaardeerd voor eenvoudige vragen, identificatie en het routeren van een gesprek. De grootste uitdaging is inmiddels minder technisch en meer \"emotioneel\": niet wat een klant zegt, maar wat hij bedoelt.",
  },
  {
    titel: "Van gesprek naar onderbouwd handelen",
    tekst: [
      "Twee dingen maken generatieve AI geschikt voor productie in klantcontact. Met RAG (Retrieval Augmented Generation) haalt een bot eerst betrouwbare informatie op uit een gecontroleerde bron, in plaats van zelf te verzinnen, wat leidt tot minder hallucinaties en traceerbare antwoorden. Met MCP (Model Context Protocol) krijgt een bot gestandaardiseerde, expliciet begrensde toegang tot systemen zoals CRM of casebeheer, met logging van elke actie. Beide vragen om eigenaarschap, een reviewcyclus en duidelijke rechten, geen losse techniek.",
      "Hoe ver die zelfstandigheid inmiddels reikt, laat zich ook in cijfers uitdrukken: AI-agents voltooien inmiddels 66 procent van complexe computertaken zelfstandig, tegen 12 procent een jaar eerder (Stanford HAI). Voor klantcontact betekent dit dat routinematige backofficetaken zoals dossieropzoeking, CRM-invoer en het aanmaken van tickets steeds vaker geautomatiseerd kunnen worden. Agents falen echter nog bij 1 op de 3 taken, dus menselijk toezicht blijft voorlopig onmisbaar. De winnende strategie is daarbij niet wachten tot de techniek volgroeid is, maar blijven pilotten en leren omgaan met steeds nieuwe mogelijkheden.",
    ],
  },
  {
    titel: "Voorwaarden voordat het naar productie gaat",
    tekst: "Autorisatie en dataminimalisatie, een fallback naar een medewerker bij twijfel of een risicovolle vraag, en doorlopend monitoren op compliance en toon. Pas als die basis staat, is een volgende stap zoals een agentic bot (die zelf een plan uitvoert in meerdere stappen) verantwoord.",
  },
  {
    titel: "Beveiliging is voor een groot deel een intern vraagstuk",
    tekst: "Acht op de tien AI-datalekken zijn het gevolg van interne beleidsschendingen, niet van hackers (Gartner). Traditionele beveiligingstools zijn niet ingericht op AI-specifieke kwetsbaarheden, en schaduw-AI (AI-tools die medewerkers zelf zijn gaan gebruiken, buiten het zicht van IT) vormt daarbij een eigen risico. Gartner verwacht dat tegen 2028 de helft van de organisaties een specifiek AI-beveiligingsplatform inzet. Een eerste stap is een risicobeoordeling van alle AI-tools die in gebruik zijn, inclusief de tools die niet formeel zijn goedgekeurd.",
  },
];

export const kostenBusinesscase: string[] = [
  "Twee cijfers die de urgentie van financiële planning onderstrepen.",
  "Gartner verwacht dat de kosten van AI-agents, zowel voor implementatie als voor beheer, tegen 2028 vervijfvoudigen. Vroeg instappen kan voordeel bieden, mits goed gepland, en dat vraagt om een heldere businesscase vooraf in plaats van achteraf.",
  "Tegelijk richt 80 procent van organisaties AI primair op efficiëntie en kostenreductie (McKinsey). Koplopers combineren dat structureel met groei- en innovatiedoelen: zij streven driemaal vaker naar transformatieve AI-verandering, in plaats van alleen bestaande processen goedkoper te maken. Wie AI alleen inzet om te besparen, denkt daarmee klein. De winst zit voor een belangrijk deel in klantwaarde die nu nog niet geleverd wordt: hyperpersonalisatie en proactieve service leveren aantoonbaar betere resultaten dan kostenbesparing alleen. Workflow-redesign hoort daarbij als doorlopend proces, niet als eenmalig project.",
];

export const watDitVoorMensenBetekent: string[] = [
  "Naarmate eenvoudige vragen worden geautomatiseerd, houden medewerkers vooral de complexere, minder voorspelbare gevallen over. Dat maakt beoordelingsvermogen, empathie en het omgaan met onduidelijkheid belangrijker, niet minder belangrijk. Het roept ook een praktische vraag op: als de eenvoudige gevallen verdwijnen, waar leren nieuwe medewerkers dan nog het vak?",
  "AI-geletterdheid wordt daarmee een basisvaardigheid: begrijpen hoe een AI-systeem tot een antwoord komt, waar de grenzen liggen, en hoe je de uitkomst beoordeelt in plaats van klakkeloos overneemt. Organisaties die dat niet expliciet aanpakken, lopen tegen ongecontroleerd gebruik van externe AI-tools aan, met risico's voor data en privacy.",
  "Toegang tot AI-tools is niet hetzelfde als daadwerkelijk gebruik. Minder dan 60 procent van de medewerkers die toegang hebben tot een AI-tool, zet die ook dagelijks in, en 21 procent gebruikt AI alleen omdat het verplicht is (Deloitte). Belangrijkste oorzaken zijn te weinig training, onduidelijkheid over het nut en soms wantrouwen. Wat adoptie wel versnelt: rolspecifieke training, bijvoorbeeld gericht op klachtenafhandeling, en betrokken senior leiders die AI zelf actief gebruiken en als voorbeeld fungeren. Draagvlak van onderaf werkt het beste in combinatie met zichtbare steun vanuit het management.",
  "De angst voor baanverlies is begrijpelijk, maar meestal niet terecht in de vorm die mensen vrezen. De meerderheid van organisaties verwacht weinig tot geen krimp in personeelsaantallen (McKinsey). Functies veranderen wel ingrijpend, zeker in service operations. De uitdaging voor klantcontactorganisaties is niet het vervangen van mensen, maar het tijdig begeleiden en bijscholen van medewerkers. Wie daar nu niet in investeert, betaalt daar later de prijs voor.",
];

export const gemeenschappelijkeKenmerken: TitelTekst[] = [
  {
    titel: "Strategie",
    tekst: "Digitalisering is geen doel op zich. Organisaties kiezen expliciet welk contact schaalbaar digitaal kan, en welk contact bewust menselijk blijft.",
  },
  {
    titel: "Organisatie",
    tekst: "Klantcontact wordt minder een uitvoerend domein en vaker een strategisch thema, met explicieter belegd eigenaarschap over klantreizen en kanalen.",
  },
  {
    titel: "Proces & technologie",
    tekst: "Digitalisering en AI werken pas goed op een degelijk fundament. Verouderde systemen, versnipperde processen en inconsistente data beperken wat er mogelijk is, ongeacht de techniek die je erbovenop zet.",
  },
  {
    titel: "Mens",
    tekst: "Werk verschuift van volume naar complexere dossiers, wat vraagt om andere vormen van opleiden en coachen, vaker met AI-ondersteuning daarbij.",
  },
  {
    titel: "Cultuur",
    tekst: "Voorzichtigheid met digitalisering komt zelden voort uit weerstand tegen verandering, maar uit de wens om regie te houden over klantrelaties en risico's.",
  },
];

export const relatieMetScan: string =
  "Deze scan meet waar de eigen organisatie nu staat op de bouwstenen van klantcontact. Dit stuk beschrijft waar de markt als geheel naartoe beweegt. Dat zijn twee verschillende vragen: een lage score op een bouwsteen zegt iets over de eigen inrichting, niet automatisch iets over de marktontwikkeling hierboven, en andersom. Beide samen geven wel een vollediger beeld: wat een organisatie nu al goed geregeld heeft, en wat er op haar afkomt.";
