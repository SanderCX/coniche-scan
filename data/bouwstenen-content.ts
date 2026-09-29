/**
 * Statische content voor de publieke "Bouwstenen"-pagina
 * (`app/bouwstenen/page.tsx`), letterlijk overgenomen uit `visie-coniche.md`
 * deel 2. `kleur` verwijst naar `lib/colors.ts` CATEGORIE_COLORS, zodat dit
 * dezelfde categoriekleuren gebruikt als de scan zelf.
 */

export interface BouwsteenContent {
  nummer: number;
  naam: string;
  beschrijving: string[];
  centraleVraag: string;
}

export interface BouwsteenGroep {
  naam: string;
  kleur: string;
  bouwstenen: BouwsteenContent[];
}

export const bouwstenenGroepen: BouwsteenGroep[] = [
  {
    naam: "Overkoepelend",
    kleur: "oranje",
    bouwstenen: [
      {
        nummer: 1,
        naam: "Organisatiestrategie",
        beschrijving: [
          "Goed klantcontact begint bij de richting van de organisatie als geheel. Die richting moet concreet genoeg zijn om keuzes op te baseren. Dat betekent een actuele strategie met missie, visie, kernwaarden en een beperkt aantal doelen. Die doelen zijn vertaald naar meetbare doelstellingen met een streefwaarde en een eigenaar, en op een vast moment, minstens elk kwartaal, wordt de voortgang besproken en worden besluiten vastgelegd.",
          "Strategie gaat ook over mensen. Welke capaciteit en vaardigheden zijn het komende jaar nodig, en hoe worden werving, opleiding en leiderschap daarop afgestemd? Zonder zo'n plan loopt de bezetting achter op wat de strategie vraagt.",
        ],
        centraleVraag:
          "Is de strategie concreet genoeg, en wordt die actief gevolgd, om er keuzes in klantcontact op te baseren?",
      },
      {
        nummer: 2,
        naam: "Klantcontactvisie & Strategie",
        beschrijving: [
          "De klantcontactstrategie vertaalt de doelen van de organisatie naar dienstverlening. Ze legt vast welke rol klantcontact speelt en verwijst daarbij expliciet naar de organisatiedoelen. Ze beschrijft ook welke klantgroepen er zijn en wat elke groep mag verwachten, inclusief het kanaal dat daarbij past.",
          "Servicewaarden krijgen pas betekenis als medewerkers ze kunnen toepassen. Daarom horen er concrete beslisregels bij, bijvoorbeeld voor compensatie, escalatie en uitzonderingen. De strategie heeft verder een route nodig: een roadmap voor de komende zes tot achttien maanden, met geprioriteerde initiatieven, eigenaren, planning en onderlinge afhankelijkheden.",
        ],
        centraleVraag:
          "Is vastgelegd hoe klantcontact bijdraagt aan de organisatiedoelen, en is dat vertaald naar beslisregels en een concrete route?",
      },
    ],
  },
  {
    naam: "Organisatie",
    kleur: "blauw",
    bouwstenen: [
      {
        nummer: 3,
        naam: "Structuur & Sturing",
        beschrijving: [
          "Strategie werkt pas als de organisatie zo is ingericht dat mensen ernaar kunnen handelen. Dat begint bij duidelijkheid over rollen: wie is waarvoor verantwoordelijk en wie mag wat besluiten.",
          "Sturing vraagt daarnaast een vast ritme van overleg, met een agenda, een vaste set KPI's en een besluitenlijst met eigenaren en data. Die KPI's komen uit een KPI-huis dat klant, kwaliteit, efficiency, medewerker en kosten in balans houdt, met heldere definities en bronnen. Dashboards zijn minstens wekelijks beschikbaar en worden aantoonbaar gebruikt: ze komen terug in verslagen en leiden tot acties.",
        ],
        centraleVraag: "Is duidelijk wie waarover beslist, en wordt er op basis van betrouwbare cijfers gestuurd?",
      },
      {
        nummer: 4,
        naam: "Leren uit klantcontact",
        beschrijving: [
          "Elke vraag of klacht die binnenkomt, zegt iets over hoe de organisatie werkt. Die informatie is alleen bruikbaar als contactredenen consequent en eenduidig worden vastgelegd, en medewerkers daarin getraind zijn.",
          "Daarna moet er iets mee gebeuren. In een vaste analysecyclus, minstens maandelijks, worden de belangrijkste contactredenen en trends besproken met de eigenaren buiten klantcontact die de oorzaak kunnen wegnemen. Verbeteringen komen op een backlog met prioriteit, eigenaar en status, en achteraf wordt gekeken of ze het beoogde effect hadden. Een verbetering is pas af als ze zichtbaar terugkomt in de kennisbank, een training of een aangepast proces.",
          "Van alle bouwstenen volgt deze de verbetercyclus het meest letterlijk.",
        ],
        centraleVraag: "Leiden signalen uit klantcontact aantoonbaar tot verbeteringen in de organisatie?",
      },
      {
        nummer: 5,
        naam: "Financial Control",
        beschrijving: [
          "Keuzes over capaciteit, kanalen en investeringen vragen inzicht in wat klantcontact kost en wat verbeteringen opleveren. Dat begint bij een gespecificeerd budget voor mensen, tooling en leveranciers, waarvan de realisatie maandelijks wordt gevolgd. Daarnaast zijn de kosten per kanaal of per type contact bekend, desnoods berekend als volume maal kostprijs.",
          "Voor verbeterinitiatieven wordt vooraf een business case gemaakt met kosten, baten en risico's, en achteraf gekeken of die is waargemaakt. Een forecast voor capaciteit en kosten, die elk kwartaal wordt herijkt, laat zien wat er de komende periode nodig is.",
        ],
        centraleVraag: "Worden keuzes over de inzet van middelen onderbouwd met inzicht in kosten en effect?",
      },
      {
        nummer: 6,
        naam: "Positionering Klantcontact",
        beschrijving: [
          "Klantcontact ziet vaak als eerste wat er misgaat in producten en processen. Of daar iets mee gebeurt, hangt af van de positie die klantcontact in de organisatie heeft.",
          "Die positie is op een paar punten zichtbaar. Klantcontact is structureel vertegenwoordigd in overleggen waar besluiten met klantimpact vallen, zoals een product- of change board. Er is een vast pad om problemen in de keten te escaleren naar eigenaren buiten klantcontact. Inzichten uit klantcontact worden regelmatig met de organisatie gedeeld en leiden tot acties. Verder is iemand eigenaar van de dienstverlening van begin tot eind, over teams heen, zodat de ervaring van de klant niet tussen afdelingen in valt.",
        ],
        centraleVraag: "Heeft klantcontact de positie en de afspraken om problemen in de hele keten opgelost te krijgen?",
      },
    ],
  },
  {
    naam: "Proces & Tech",
    kleur: "paars",
    bouwstenen: [
      {
        nummer: 7,
        naam: "Systemen & Tools",
        beschrijving: [
          "Systemen moeten het werk van medewerkers eenvoudiger maken. Concreet betekent dat: alle cases en tickets in één primair systeem, zonder parallelle Excel-lijsten of losse mailboxen, en contactmomenten die automatisch aan de juiste klant en case worden gekoppeld.",
          "Tijdens een gesprek heeft de medewerker het volledige klantbeeld bij de hand (historie, openstaande zaken, afspraken) zonder tussen meer dan twee systemen te wisselen. Achter de schermen is het beheer geregeld: wijzigingen, rechten en koppelingen hebben een eigenaar en zijn gedocumenteerd.",
          "Hoe systemen de klant zelf ondersteunen, bijvoorbeeld via selfservice of een chatbot, valt onder Kanaalmanagement.",
        ],
        centraleVraag: "Hebben medewerkers tijdens het contact alles bij de hand, in systemen die goed beheerd worden?",
      },
      {
        nummer: 8,
        naam: "Workforce Management",
        beschrijving: [
          "Workforce Management zorgt dat vraag en capaciteit bij elkaar passen. Dat vraagt een voorspelbaar proces. Volumes en werklast worden minstens maandelijks voorspeld en achteraf vergeleken met wat er werkelijk gebeurde.",
          "Gedurende de dag wordt bijgestuurd volgens vaste afspraken om het servicelevel te halen. Afwezigheid door verlof, training, verzuim en overleg (shrinkage) wordt gemeten en met een doelwaarde meegepland. Roosters sluiten aan op de vraag per kanaal en per vaardigheid, en dat is aantoonbaar ingericht in de planningstool en de werkwijze.",
          "Een goed planningsproces voorkomt ook onnodige werkdruk. Hoe medewerkers dat ervaren, komt terug bij Employee Engagement.",
        ],
        centraleVraag: "Beschikt de organisatie op het juiste moment over de juiste capaciteit?",
      },
      {
        nummer: 9,
        naam: "Kennismanagement",
        beschrijving: [
          "Consistente dienstverlening vraagt dat medewerkers en klanten hetzelfde juiste antwoord vinden. Als kennis verspreid, verouderd of onvindbaar is, hangt de kwaliteit van het antwoord af van wie er toevallig helpt.",
          "Kennis wordt daarom beheerd als bedrijfsmiddel. Er is één centrale kennisbank, ingedeeld naar de redenen waarom klanten contact opnemen. Elk onderdeel heeft een eigenaar en wordt periodiek herzien. Nieuwe kennis komt via een vast proces van aanvraag, controle en publicatie tot stand. Het gebruik wordt gemeten, bijvoorbeeld zoekopdrachten zonder resultaat en feedback op artikelen, en artikelen worden op basis daarvan verbeterd.",
        ],
        centraleVraag: "Kan iedereen het juiste antwoord vinden op het moment dat het nodig is?",
      },
      {
        nummer: 10,
        naam: "Kanaalmanagement",
        beschrijving: [
          "Niet elke vraag hoort in hetzelfde kanaal. Per contactreden is vastgelegd welk kanaal de voorkeur heeft, met de uitzonderingen daarop.",
          "Routering en triage zorgen dat klanten op de juiste plek terechtkomen, en de prestaties per kanaal worden maandelijks gevolgd. Selfservice, zoals een helpcenter, chatbot of formulier, is ingericht en er wordt gemeten hoeveel vragen daar werkelijk worden opgelost. Wisselt een klant van kanaal, dan gaat de context mee via het casenummer en de zichtbare historie, en hoeft hij zijn verhaal niet opnieuw te doen.",
        ],
        centraleVraag: "Worden klanten via het passende kanaal geholpen, zonder dat ze bij een wissel opnieuw moeten beginnen?",
      },
    ],
  },
  {
    naam: "Mens",
    kleur: "groen",
    bouwstenen: [
      {
        nummer: 11,
        naam: "Performance Management",
        beschrijving: [
          "Performance Management is bedoeld om medewerkers beter te laten worden. Dat begint bij weten wat er verwacht wordt: iedere medewerker heeft vastgelegde doelen die regelmatig worden bijgewerkt.",
          "Kwaliteit wordt beoordeeld via een vast proces met steekproeven, vaste criteria en calibratie, zodat beoordelaars op dezelfde manier meten. Prestaties komen minstens maandelijks aan bod in een 1-op-1 of coachgesprek, en de afspraken worden vastgelegd. Blijft iemand achter, dan is er een verbeterroute met een plan, termijnen en ondersteuning, en die wordt in de praktijk ook gevolgd.",
        ],
        centraleVraag: "Is er een vaste cyclus waarin prestaties van medewerkers worden besproken en verbeterd?",
      },
      {
        nummer: 12,
        naam: "Learning & Development",
        beschrijving: [
          "De kwaliteit van dienstverlening kan niet hoger worden dan het vakmanschap van de mensen die het contact voeren. Dat begint bij een vast onboardingprogramma, met modules, een vaste duur, leerdoelen en een toets voordat een nieuwe medewerker zelfstandig aan de slag gaat.",
          "Daarna gaat de ontwikkeling door. Een actuele skills-matrix laat per rol zien welk niveau nodig is en waar iedere medewerker staat. Trainingen, leermateriaal en voortgang staan op één vaste plek. Of een training werkt, blijkt uit de cijfers: leerinterventies worden beoordeeld op hun effect op bijvoorbeeld de kwaliteitsscore, afhandeltijd of klanttevredenheid, en het programma wordt daarop aangepast.",
        ],
        centraleVraag: "Worden medewerkers aantoonbaar beter in hun vak?",
      },
      {
        nummer: 13,
        naam: "Employee Engagement",
        beschrijving: [
          "Betrokken medewerkers leveren betere dienstverlening en blijven langer. Betrokkenheid groeit als mensen zich gewaardeerd voelen en hun werk op een gezonde manier kunnen volhouden.",
          "Of dat lukt, moet een organisatie weten en opvolgen. De tevredenheid van medewerkers wordt minstens twee keer per jaar gemeten en de uitkomsten worden gedeeld. Daar hoort een actieplan bij met eigenaren en deadlines, waarvan de voortgang regelmatig wordt besproken. Verzuim en verloop worden maandelijks gevolgd, met aandacht voor de oorzaken. Maatregelen voor duurzame inzetbaarheid, zoals rekening houden met roosterwensen of werkdruk beperken, worden ingevoerd en op hun effect gevolgd.",
        ],
        centraleVraag: "Weet de organisatie hoe het met haar medewerkers gaat, en doet ze daar aantoonbaar iets mee?",
      },
      {
        nummer: 14,
        naam: "Leiderschap",
        beschrijving: [
          "Leidinggevenden bepalen in hoge mate hoe goed de andere bouwstenen in de praktijk werken. In klantcontact ligt dat voor een groot deel bij de teamleads.",
          "Teamleads bespreken prestaties en ontwikkeling in een vast ritme met hun team, zowel in teamoverleg als individueel. Wat er van een teamlead verwacht wordt, staat in een rolprofiel, en daarop worden ze beoordeeld en ontwikkeld. Het leiderschap van klantcontact onderhoudt daarnaast een vast overleg met de belangrijkste partijen in de organisatie, zoals product, IT en operations, waarin besluiten worden genomen en opgevolgd. Voor sleutelrollen is er minstens jaarlijks een talentreview met opvolgingsplanning, zodat het vertrek van één persoon de afdeling niet stillegt.",
        ],
        centraleVraag: "Is leidinggeven in klantcontact duidelijk belegd en verbonden met de rest van de organisatie?",
      },
    ],
  },
  {
    naam: "Fundament",
    kleur: "antraciet",
    bouwstenen: [
      {
        nummer: 15,
        naam: "Cultuur",
        beschrijving: [
          "Cultuur is zichtbaar in gedrag, vooral op momenten dat geen procedure het antwoord geeft. Daar sluit deze bouwsteen aan op de beslisregels uit de klantcontactstrategie (bouwsteen 2).",
          "Een organisatie heeft haar gedragsprincipes expliciet benoemd, zoals klantgerichtheid, eigenaarschap en samenwerking, en die komen terug in onboarding en coaching. Fouten en incidenten worden besproken om ervan te leren, zonder schuldvraag, en leiden tot vastgelegde verbeteracties. Goed gedrag en successen worden zichtbaar en in een vast ritme erkend. Minstens één keer per jaar wordt gemeten hoe medewerkers de cultuur en de psychologische veiligheid ervaren, met opvolging en terugkoppeling.",
        ],
        centraleVraag: "Is het gedrag dat de strategie vraagt expliciet gemaakt, en wordt het in de praktijk ondersteund?",
      },
    ],
  },
];

/**
 * Platte lijst met groepsnaam/-kleur per bouwsteen, voor snel opzoeken op
 * nummer (zie components/BouwblokForm.tsx: toelichting-overlay in de
 * doorloopflow van de Klantcontact Volwassenheidsscan).
 */
export const alleBouwstenen: (BouwsteenContent & { groepNaam: string; kleur: string })[] =
  bouwstenenGroepen.flatMap((groep) =>
    groep.bouwstenen.map((bouwsteen) => ({ ...bouwsteen, groepNaam: groep.naam, kleur: groep.kleur }))
  );
