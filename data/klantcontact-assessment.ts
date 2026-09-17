import { Assessment, Bouwblok } from "@/lib/types";
import { organisatieVelden } from "./organisatie-velden";

function bb(
  id: string,
  volgnummer: number,
  naam: string,
  omschrijving: string,
  toelichting: string,
  tags: string[],
  vragen: string[]
): Bouwblok {
  return {
    id,
    volgnummer,
    naam,
    omschrijving,
    toelichting,
    tags,
    vragen: vragen.map((tekst, i) => ({
      id: `${id}-v${i + 1}`,
      volgnummer: i + 1,
      tekst,
    })),
  };
}

const bb1 = bb(
  "bb1",
  1,
  "Organisatiestrategie",
  "Wat zijn de belangrijkste korte en langere termijn strategische organisatiedoelen en -plannen",
  "Kernwoorden: missie en visie, kernwaarden en merkwaarden, groei- en ontwikkelplannen voor de korte en lange termijn, visie op werkgeverschap.",
  [
    "Missie en visie",
    "Kernwaarden / brand values",
    "Korte- en langetermijn groei- en ontwikkelplannen",
    "Visie op werkgeverschap",
  ],
  [
    "Is er een actueel strategiedocument (max. 2 jaar oud) waarin missie/visie/kernwaarden én 3–7 strategische doelen staan?",
    "Zijn die strategische doelen vertaald naar meetbare KPI's/OKR's met streefwaarden en een eigenaar per doel?",
    "Is er een vast ritme (minimaal per kwartaal) waarin de voortgang op strategische doelen wordt besproken en besluiten worden vastgelegd?",
    "Is er een vastgelegd skills-/capaciteitsplan (minimaal voor 12 maanden vooruit) dat aansluit op de strategie (werving, training, leiderschap)?",
  ]
);

const bb2 = bb(
  "bb2",
  2,
  "Klantcontact visie & strategie",
  "In hoeverre is de klantcontactstrategie ondersteunend aan de organisatiestrategie? Welke servicewaarden zijn daarbij leidend?",
  "Kernwoorden: visie op klantcontact, servicewaarden, groei- en ontwikkelplannen voor de korte en lange termijn, strategische roadmap, visie op werkgeverschap binnen klantcontact.",
  [
    "Visie op klantcontact",
    "Servicewaarden",
    "Korte- en langetermijn groei- en ontwikkelplannen",
    "Strategische roadmap",
    "Visie op werkgeverschap (binnen CC)",
  ],
  [
    "Is er een vastgelegde klantcontactvisie en -strategie (max. 2 jaar oud) die expliciet verwijst naar de organisatiedoelen?",
    "Zijn servicewaarden vastgelegd én doorvertaald naar minimaal 5 concrete gedrags-/beslisregels (bijv. compensatie, escalatie, uitzonderingen)?",
    "Is er een klantcontact-roadmap (6–18 maanden) met geprioriteerde initiatieven, eigenaar, planning en afhankelijkheden?",
    "Is er een expliciete segment- of klantgroepindeling waarin per segment de servicebelofte en kanaalvoorkeur is beschreven?",
  ]
);

const bb3 = bb(
  "bb3",
  3,
  "Structuur & Sturing",
  "Zijn het huidige organisatiestructuur en besturingsmodel ondersteunend aan de klantcontact-strategie en servicewaarden?",
  "Geeft aan hoe het klantcontact is ingericht — strategische keuzes bepalen dat. Kernwoorden: structuur en hiërarchie, inrichting eerste en tweede lijn, skills en routering, sourcing, besturingsmodel, KPI-huis, rapportages en dashboards. De inrichting vloeit voort uit de strategie van de organisatie; daarnaast is de (be)sturing van het klantcontact een belangrijke factor die beïnvloed wordt door leiderschap en cultuur.",
  [
    "Structuur/hiërarchie van klantcontact organisatie",
    "Rollen en verantwoordelijkheden",
    "Governance (o.a. MT, overlegstructuren, besluitvorming)",
    "Mandaat en eigenaarschap",
    "Performance Indicatoren / KPI-huis",
    "Reporting en dashboards",
  ],
  [
    "Is er een actueel organogram + rolbeschrijvingen voor klantcontact waarin mandaat en verantwoordelijkheden per rol staan?",
    "Is er een vaste overlegstructuur (wekelijks/maandelijks/kwartaal) met agenda, KPI-set en besluitlog (actielijst met owner en datum)?",
    "Bestaat er een formeel KPI-huis voor klantcontact (klant, kwaliteit, efficiency, medewerker, kosten) met definities en databronnen?",
    "Zijn dashboards/rapportages voor klantcontact minimaal wekelijks beschikbaar en worden ze aantoonbaar gebruikt (notulen/acties)?",
  ]
);

const bb11 = bb(
  "bb11",
  11,
  "Leren uit klantcontact",
  "In hoeverre leert de organisatie structureel van klantcontact (contactredenen, feedback, fouten) en vertaalt dit naar verbeteringen?",
  "Kernwoorden: klantsignalen, klantcontactredenen, conversational intelligence, data naar informatie/inzicht/verbetering, rol van klantcontact in het organisatiebrede verbeterproces. Klanten vertellen je elke dag wat ze van je product of dienst vinden — deze signalen zijn essentieel om de organisatie continu te verbeteren en tegelijkertijd de klanttevredenheid te verhogen. Klantsignaalmanagement is de kern van deze bouwsteen.",
  [
    "Contact drivers",
    "VOC (Voice of Customer)",
    "Continuous improvement",
    "Root cause analysis",
    "Closed feedback loop",
    "Verbeterbacklog",
  ],
  [
    "Worden contactredenen (drivers) consequent vastgelegd in het ticketsysteem met eenduidige definities en training?",
    "Is er een vaste analysecyclus (minimaal maandelijks) waarin topdrivers en trends worden besproken met owners buiten klantcontact?",
    "Is er een verbeterbacklog met prioritering (impact/effort), eigenaar, status en evaluatie van gerealiseerde benefits?",
    "Is er een closed-loop terugkoppeling: verbeteringen resulteren aantoonbaar in updates in kennis/training/proces?",
  ]
);

const bb13 = bb(
  "bb13",
  13,
  "Financial control",
  "In hoeverre is de financiële huishouding van de klantcontactorganisatie inzichtelijk en op orde?",
  "Kernwoorden: inzicht in kosten en bijdragen van klantcontact, financiële kengetallen en KPI's, budgetmodel. Hoe zorg je dat je 'in control' bent en blijft en niet verrast wordt? Dit wordt vaak gezien als een van de belangrijkste bouwstenen binnen klantcontact.",
  ["Inzicht in CC kosten en bijdragen"],
  [
    "Is er een gespecificeerd klantcontactbudget (mensen, tooling, leveranciers) en wordt realisatie minimaal per maand bijgehouden?",
    "Zijn kosten per kanaal of per type contact inzichtelijk (desnoods via berekening op volume x kostprijs)?",
    "Worden business cases voor verbeterinitiatieven vastgelegd (kosten, baten, risico's) en achteraf geëvalueerd op realisatie?",
    "Is er een forecast-/scenario-aanpak voor capaciteit en kosten (minimaal per kwartaal herijkt)?",
  ]
);

const bb14 = bb(
  "bb14",
  14,
  "Positionering klantcontact",
  "Welke rol speelt klantcontact in de organisatie en wat is de slagkracht?",
  "Kernwoorden: plaats in het organigram, interne zichtbaarheid, stakeholdermanagement, interne slagkracht, positie aan de besluitvormingstafel. Is klantbeleving een serieus gespreksonderwerp aan de directietafel, of wordt klantcontact gezien als 'noodzakelijk kwaad'?",
  [
    "Plaats van klantcontact in organigram",
    "Interne zichtbaarheid klantcontact (afdeling) / PR",
    "Stakeholder management",
    "Interne slagkracht klantcontact afdeling",
    '"seat at the table"',
  ],
  [
    "Is klantcontact structureel vertegenwoordigd in besluitvormende overleggen die klantimpact hebben (bijv. product/IT change board)?",
    "Is er een vast escalatie- en besluitpad waarmee klantcontact issues in de keten kan oplossen (met eigenaren buiten CC)?",
    "Worden inzichten uit klantcontact periodiek gedeeld met de organisatie (rapportage/presentatie) en leidt dat aantoonbaar tot acties?",
    "Is er een duidelijke service owner/afsprakenstelsel voor end-to-end service (wie bewaakt kwaliteit/ervaring over teams heen)?",
  ]
);

const bb4 = bb(
  "bb4",
  4,
  "Systemen & Tools",
  "In hoeverre is de klantcontactorganisatie goed gefaciliteerd met de juiste systemen en tooling?",
  "Kernwoorden: omnichannel klantcontactplatform, CRM-integratie, integraal klantbeeld. AI, AQM, routering, spraakherkenning... techniek en digitalisering gaan razendsnel. Dit alles vooral bekeken vanuit de functionaliteit voor klanten en medewerkers.",
  [
    "CRM/klantbeeld",
    "Ticketing/Case management",
    "Telefonie / CC platform",
    "Chat / messaging",
    "Kennisbank tooling",
    "Rapportage / BI tooling",
    "Integraties / API's",
    "Tooling-fit vs procesfit",
  ],
  [
    "Werkt klantcontact in één primair systeem voor cases/tickets (geen structurele parallelle Excel/losse mailbox-processen)?",
    "Is er CTI/telefoonintegratie of een andere koppeling waardoor contactmomenten automatisch aan klant/case worden gekoppeld?",
    "Is er een centraal klantbeeld beschikbaar tijdens het contact (historie, openstaande zaken, afspraken) zonder te wisselen tussen >2 systemen?",
    "Is er een beheerproces voor tooling (release/changes, rechten, integraties) inclusief owner en documentatie?",
  ]
);

const bb6 = bb(
  "bb6",
  6,
  "Workforce Management",
  "In hoeverre is de planning/capaciteit goed ingericht om servicelevels te halen tegen acceptabele kosten?",
  "Kernwoorden: WFM-volwassenheid, WFM-cyclus, nauwkeurigheid van het forecastingmodel, skills en routering. Aan de hand van de schijf van 6 wordt het proces geanalyseerd en per stap het verbeterpotentieel in kaart gebracht.",
  [
    "Forecasting",
    "Capaciteitsplanning",
    "Roostering",
    "Intra-day management",
    "Shrinkage",
    "Skill-based routing",
    "Servicelevel/ASA/abandonment",
  ],
  [
    "Worden volumes en workload structureel voorspeld (minimaal maandelijks) en vergeleken met realisatie (forecast vs actual)?",
    "Is er een intraday proces (dagelijks) met monitoring en bijstuuracties (playbook/afspraken) om SL/ASA te halen?",
    "Worden shrinkage-categorieën (verlof, training, verzuim, meetings) structureel gemeten en gepland met targets?",
    "Worden roosters/skills afgestemd op kanaal- en skillvraag (skill-based), en is dat aantoonbaar ingericht in tooling/werkwijze?",
  ]
);

const bb10 = bb(
  "bb10",
  10,
  "Kennismanagement",
  "In hoeverre is kennis vastgelegd, onderhouden en vindbaar zodat medewerkers en klanten snel het juiste antwoord krijgen?",
  "Kernwoorden: kennisbank, kennisbeheer, verantwoordelijkheid en eigenaarschap. Alle informatie is beschikbaar — 'je hoeft mensen alleen nog maar te leren zoeken'.",
  [
    "Kennisstructuur/taxonomie",
    "Ownership (knowledge owners)",
    "Content lifecycle",
    "Zoekbaarheid",
    "Kenniskwaliteit",
    "Selfservice content",
  ],
  [
    "Is er één centrale kennisbank (intern en/of extern) met duidelijke structuur/categorieën die aansluiten op contactredenen?",
    "Is kennis-eigenaarschap ingericht (knowledge owners) en bestaat er een reviewcyclus (bijv. elke 3–6 maanden)?",
    "Is er een proces om nieuwe kennis te maken/actualiseren op basis van issues/changes (intake → review → publicatie)?",
    "Wordt kennisgebruik gemeten (views/search/no-result/feedback) en worden artikelen aantoonbaar verbeterd op basis van data?",
  ]
);

const bb12 = bb(
  "bb12",
  12,
  "Kanaalmanagement",
  "In hoeverre is de kanaalstrategie (voice, mail, chat, messaging, selfservice) bewust ingericht en optimaal gemanaged?",
  "Kernwoorden: kanaalstrategie, kanaalsturing en kanaalverleiding, omnichannel, selfservice, technologie zoals chatbots en speech analytics. Elke klant heeft een voorkeurskanaal — hoe manage je dat het beste, en kun je klanten misschien 'verleiden' naar het voorkeurskanaal van de organisatie?",
  [
    "Kanaalstrategie",
    "Kanaalshift",
    "Routing & triage",
    "Selfservice",
    "Omnichannel customer experience",
    "Kanaalperformance",
  ],
  [
    "Is er een vastgelegde kanaalstrategie waarin per contactreden minimaal één voorkeurskanaal is benoemd (incl. uitzonderingen)?",
    "Zijn routeringsregels/triage vastgelegd en wordt kanaalperformance minimaal maandelijks gemonitord (SL/CSAT/containment)?",
    "Is selfservice ingericht (FAQ/helpcenter/chatbot of formulieren) en wordt deflection/containment gemeten?",
    "Kan een klant kanaalwisselen zonder opnieuw alles uit te leggen (context mee via case/ticket-ID en zichtbare historie)?",
  ]
);

const bb5 = bb(
  "bb5",
  5,
  "Performance Management",
  "In hoeverre wordt performance van medewerkers en teams structureel gemeten, besproken en verbeterd?",
  "Kernwoorden: succesfactoren, KPI's, impact van het KPI-huis op medewerkers, kwaliteitsmanagement en monitoring, coaching.",
  [
    "Doelen en KPI's op team/individu",
    "Ritme van performance gesprekken",
    "Coaching-on-the-job",
    "Transparantie in performance",
    "Kwaliteit vs kwantiteit balans",
    "Feedback cultuur",
  ],
  [
    "Heeft iedere medewerker een set vastgelegde doelen (minimaal 3 KPI's/verwachtingen) die periodiek worden bijgewerkt?",
    "Is er een vast kwaliteitsproces (QA) met steekproeven, calibratie en vastgelegde kwaliteitscriteria?",
    "Vinden er structurele 1-op-1's/coachinggesprekken plaats volgens vast ritme (minimaal maandelijks) met vastlegging van afspraken?",
    "Is er een formele verbeterroute voor onderperformance (plan, termijnen, support, evaluatie) die ook daadwerkelijk wordt toegepast?",
  ]
);

const bb7 = bb(
  "bb7",
  7,
  "Learning & Development",
  "In hoeverre zijn onboarding, training en ontwikkeling structureel ingericht en passend bij de klantcontactstrategie?",
  "Kernwoorden: vinden, binden en boeien, training van nieuwe medewerkers, onboarding, terugdringen van vroege uitstroom, coaching, leerpaden en perspectief, learningmanagementsysteem.",
  [
    "Onboarding",
    "Opleidingsplan",
    "Skills matrix",
    "Coaching & mentoring",
    "LMS / leerplatform",
    "Assessments / toetsen",
    "70-20-10 / blended learning",
  ],
  [
    "Is er een vast onboardingprogramma met modules, duur, leerdoelen en toetsing voordat iemand volledig zelfstandig draait?",
    "Is er een actuele skills-matrix per rol/team waarin per skill een niveau is beschreven en medewerkers zijn ingeschaald?",
    "Is er een vast leerplatform of centrale plek (LMS/KB) waar trainingen, content en voortgang worden beheerd?",
    "Worden leerinterventies geëvalueerd op effect (minimaal 1 van: QA-score, AHT, FCR, CSAT) en wordt het programma daarop aangepast?",
  ]
);

const bb8 = bb(
  "bb8",
  8,
  "Employee Engagement",
  "In hoeverre is er aandacht voor betrokkenheid, welzijn en duurzame inzetbaarheid binnen klantcontact?",
  "Kernwoorden: visie op werkgeverschap, autonomie, verbinding, purpose, gezondheid en welzijn, verzuim en verloop, employee journey. Belangrijk thema voor elke organisatie in een steeds krapper wordende arbeidsmarkt.",
  [
    "Medewerkerstevredenheid",
    "Bevlogenheid",
    "Verzuim / welzijn",
    "Retentie",
    "Psychologische veiligheid",
    "Erkenning en waardering",
  ],
  [
    "Wordt medewerkerstevredenheid structureel gemeten (minimaal 2x per jaar of via pulses) en worden resultaten gedeeld?",
    "Is er een concreet actieplan op engagement/welzijn met owners en deadlines, en wordt voortgang periodiek besproken?",
    "Worden verzuim- en verloopcijfers structureel gemonitord (minimaal maandelijks) en gekoppeld aan oorzaakanalyse?",
    "Zijn er aantoonbare interventies voor duurzame inzetbaarheid (bijv. roosterkeuzes, werkdrukmaatregelen, coaching) met monitoring?",
  ]
);

const bb9 = bb(
  "bb9",
  9,
  "Leiderschap",
  "In hoeverre is het leiderschap binnen klantcontact effectief en in lijn met de gewenste cultuur en prestaties?",
  "Kernwoorden: nieuw leiderschap, faciliteren, ontwikkelen, winnen, zelfsturen en zelfroosteren. Leiderschap is allesbepalend voor de cultuur en daarmee voor het succes van de organisatie — het gaat over autonomie en high performing teams.",
  [
    "Leiderschapsstijl",
    "Voorbeeldgedrag",
    "Coachend leiderschap",
    "Besluitvaardigheid",
    "Stakeholder management",
    "Teamontwikkeling",
  ],
  [
    "Is er een vast ritme waarin teamleads prestaties en ontwikkeling met hun teams bespreken (teammeetings + 1-op-1's)?",
    "Is er een vastgelegde set verwachtingen/competenties voor teamleads (rolprofiel) en worden die ook beoordeeld/ontwikkeld?",
    "Is er een structureel overleg met key stakeholders buiten klantcontact (product/IT/operations) met besluiten en opvolging?",
    "Is er opvolgingsplanning of talent-review (minimaal jaarlijks) voor sleutelrollen binnen klantcontact?",
  ]
);

const bb15 = bb(
  "bb15",
  15,
  "Cultuur",
  "Hoe kan de heersende afdelingscultuur beschreven worden en in hoeverre is deze passend bij visie en strategie van de organisatie?",
  "Kernwoorden: cultuurbewustzijn, klantgerichtheid, growth mindset en fixed mindset.",
  ["Cultuurbewustzijn", "Klantcentriciteit", "Growth / fixed mindset"],
  [
    "Is er een expliciete set gedragsprincipes (bijv. klantgericht, eigenaarschap, samenwerken) die in onboarding en coaching terugkomt?",
    "Bestaan er vaste rituelen om te leren van fouten/incidenten (retrospectives, blameless reviews) met vastgelegde verbeteracties?",
    "Worden successen en goed klantgedrag structureel erkend (bijv. shout-outs, awards, storytelling) met zichtbaar ritme?",
    "Is er een meetinstrument voor cultuur/veiligheid (minimaal 1x per jaar) en is er opvolging met acties en terugkoppeling?",
  ]
);

export const klantcontactVolwassenheid: Assessment = {
  id: "klantcontact-volwassenheid",
  naam: "Klantcontact Volwassenheid",
  subtitel: "±30 minuten. Heldere inzichten. Direct verbeterkansen.",
  beschrijving:
    "Breng in kaart hoe volwassen jouw klantcontactorganisatie is op 15 bouwblokken, verdeeld over 5 pijlers — van strategie tot cultuur. Elke vraag is gebaseerd op aantoonbaar bewijs: documenten, ritmes, tooling en afspraken.",
  doelgroep: "MT, operations en CX-verantwoordelijken binnen klantcontactorganisaties",
  icoon: "🎯",
  geschatteDuur: "±30 minuten",
  bouwblokken: null,
  scoresPerGroepGesorteerd: false,
  bouwblokEenheidEnkelvoud: "Bouwblok",
  bouwblokEenheidMeervoud: "bouwblokken",
  featureCards: [
    {
      titel: "Volledig beeld",
      tekst: "15 bouwblokken, verdeeld over 5 pijlers — van strategie tot cultuur.",
    },
    {
      titel: "Direct inzicht",
      tekst: "Score per bouwblok, categorie en totaal, met sterktes en verbeterkansen.",
    },
    {
      titel: "Concreet en toepasbaar",
      tekst:
        "Elke vraag is gebaseerd op aantoonbaar bewijs: documenten, ritmes, tooling en afspraken.",
    },
  ],
  schaal: [
    { waarde: 1, label: "Niet aanwezig" },
    { waarde: 2, label: "Deels / incidenteel" },
    { waarde: 3, label: "Aanwezig en meestal toegepast" },
    { waarde: 4, label: "Structureel geborgd en gemeten" },
    { waarde: 5, label: "Geoptimaliseerd en continu verbeterd" },
  ],
  organisatieVelden,
  categorieen: [
    {
      id: "overkoepelend",
      naam: "Overkoepelend",
      kleur: "oranje",
      volgorde: 1,
      bouwblokken: [bb1, bb2],
    },
    {
      id: "organisatie",
      naam: "Organisatie",
      kleur: "blauw",
      volgorde: 2,
      bouwblokken: [bb3, bb11, bb13, bb14],
    },
    {
      id: "proces-tech",
      naam: "Proces & Tech",
      kleur: "paars",
      volgorde: 3,
      bouwblokken: [bb4, bb6, bb10, bb12],
    },
    {
      id: "mens",
      naam: "Mens",
      kleur: "groen",
      volgorde: 4,
      bouwblokken: [bb5, bb7, bb8, bb9],
    },
    {
      id: "fundament",
      naam: "Fundament",
      kleur: "goud",
      volgorde: 5,
      bouwblokken: [bb15],
    },
  ],
};
