// Assessment "Klantcontact Volwassenheid" — CLAUDE.md sectie 6 /
// content-klantcontact-volwassenheid.md. 15 bouwblokken, 5 categorieën, 60 vragen.
// toelichting-tekst komt uit coniche_bouwstenen.md (officieel Bouwstenenmodel).

function vraag(bouwblokId, volgnummer, tekst) {
  return { id: `${bouwblokId}-v${volgnummer}`, volgnummer, tekst };
}

function bouwblok({ volgnummer, naam, omschrijving, toelichting, tags, vragen }) {
  const id = `bb${volgnummer}`;
  return {
    id,
    volgnummer,
    naam,
    omschrijving,
    toelichting,
    tags,
    vragen: vragen.map((tekst, i) => vraag(id, i + 1, tekst)),
  };
}

const categorieen = [
  {
    id: "overkoepelend",
    naam: "Overkoepelend",
    kleur: "--or",
    volgorde: 1,
    bouwblokken: [
      bouwblok({
        volgnummer: 1,
        naam: "Organisatiestrategie",
        omschrijving:
          "Wat zijn de belangrijkste korte en langere termijn strategische organisatiedoelen en -plannen",
        toelichting:
          "Wat zijn de belangrijkste strategische organisatiedoelen en -plannen voor de korte en langere termijn? Kernthema's: missie en visie, kernwaarden en merkwaarden, groei- en ontwikkelplannen voor de korte en lange termijn, visie op werkgeverschap.",
        tags: [
          "Missie en visie",
          "Kernwaarden / brand values",
          "Korte- en langetermijn groei- en ontwikkelplannen",
          "Visie op werkgeverschap",
        ],
        vragen: [
          "Is er een actueel strategiedocument (max. 2 jaar oud) waarin missie/visie/kernwaarden én 3–7 strategische doelen staan?",
          "Zijn die strategische doelen vertaald naar meetbare KPI's/OKR's met streefwaarden en een eigenaar per doel?",
          "Is er een vast ritme (minimaal per kwartaal) waarin de voortgang op strategische doelen wordt besproken en besluiten worden vastgelegd?",
          "Is er een vastgelegd skills-/capaciteitsplan (minimaal voor 12 maanden vooruit) dat aansluit op de strategie (werving, training, leiderschap)?",
        ],
      }),
      bouwblok({
        volgnummer: 2,
        naam: "Klantcontact visie & strategie",
        omschrijving:
          "In hoeverre is de klantcontactstrategie ondersteunend aan de organisatiestrategie? Welke servicewaarden zijn daarbij leidend?",
        toelichting:
          "In hoeverre ondersteunt de klantcontactstrategie de organisatiestrategie? Welke servicewaarden zijn daarbij leidend? Kernthema's: visie op klantcontact, servicewaarden, groei- en ontwikkelplannen voor de korte en lange termijn, strategische roadmap, visie op werkgeverschap binnen klantcontact.",
        tags: [
          "Visie op klantcontact",
          "Servicewaarden",
          "Korte- en langetermijn groei- en ontwikkelplannen",
          "Strategische roadmap",
          "Visie op werkgeverschap (binnen CC)",
        ],
        vragen: [
          "Is er een vastgelegde klantcontactvisie en -strategie (max. 2 jaar oud) die expliciet verwijst naar de organisatiedoelen?",
          "Zijn servicewaarden vastgelegd én doorvertaald naar minimaal 5 concrete gedrags-/beslisregels (bijv. compensatie, escalatie, uitzonderingen)?",
          "Is er een klantcontact-roadmap (6–18 maanden) met geprioriteerde initiatieven, eigenaar, planning en afhankelijkheden?",
          "Is er een expliciete segment- of klantgroepindeling waarin per segment de servicebelofte en kanaalvoorkeur is beschreven?",
        ],
      }),
    ],
  },
  {
    id: "organisatie",
    naam: "Organisatie",
    kleur: "--bl",
    volgorde: 2,
    bouwblokken: [
      bouwblok({
        volgnummer: 3,
        naam: "Structuur & Sturing",
        omschrijving:
          "Zijn het huidige organisatiestructuur en besturingsmodel ondersteunend aan de klantcontact-strategie en servicewaarden?",
        toelichting:
          "Geeft aan hoe het klantcontact is ingericht. Strategische keuzes bepalen hoe het klantcontact wordt ingericht. Zijn de huidige organisatiestructuur en het besturingsmodel voldoende ondersteunend aan de klantcontactstrategie en servicewaarden? De inrichting vloeit voort uit de strategie van de organisatie. Daarnaast is de (be)sturing van het klantcontact een belangrijke factor die beïnvloed wordt door leiderschap en cultuur. Kernthema's: structuur en hiërarchie, inrichting eerste en tweede lijn, skills en routering, sourcing, besturingsmodel, KPI-huis, rapportages en dashboards.",
        tags: [
          "Structuur/hiërarchie van klantcontact organisatie",
          "Rollen en verantwoordelijkheden",
          "Governance (o.a. MT, overlegstructuren, besluitvorming)",
          "Mandaat en eigenaarschap",
          "Performance Indicatoren / KPI-huis",
          "Reporting en dashboards",
        ],
        vragen: [
          "Is er een actueel organogram + rolbeschrijvingen voor klantcontact waarin mandaat en verantwoordelijkheden per rol staan?",
          "Is er een vaste overlegstructuur (wekelijks/maandelijks/kwartaal) met agenda, KPI-set en besluitlog (actielijst met owner en datum)?",
          "Bestaat er een formeel KPI-huis voor klantcontact (klant, kwaliteit, efficiency, medewerker, kosten) met definities en databronnen?",
          "Zijn dashboards/rapportages voor klantcontact minimaal wekelijks beschikbaar en worden ze aantoonbaar gebruikt (notulen/acties)?",
        ],
      }),
      bouwblok({
        volgnummer: 11,
        naam: "Leren uit klantcontact",
        omschrijving:
          "In hoeverre leert de organisatie structureel van klantcontact (contactredenen, feedback, fouten) en vertaalt dit naar verbeteringen?",
        toelichting:
          "Hoe kan klantcontact op een klantgerichte wijze bijdragen aan de continue verbetering van organisatiebrede processen? Klanten vertellen je elke dag wat ze van je product of dienst vinden. Deze signalen zijn essentieel om de organisatie continu te verbeteren en tegelijkertijd de klanttevredenheid te verhogen. Klantsignaalmanagement is de kern van deze bouwsteen. Kernthema's: klantsignalen, klantcontactredenen, conversational intelligence, data naar informatie/inzicht/verbetering, rol van klantcontact in het organisatiebrede verbeterproces.",
        tags: [
          "Contact drivers",
          "VOC (Voice of Customer)",
          "Continuous improvement",
          "Root cause analysis",
          "Closed feedback loop",
          "Verbeterbacklog",
        ],
        vragen: [
          "Worden contactredenen (drivers) consequent vastgelegd in het ticketsysteem met eenduidige definities en training?",
          "Is er een vaste analysecyclus (minimaal maandelijks) waarin topdrivers en trends worden besproken met owners buiten klantcontact?",
          "Is er een verbeterbacklog met prioritering (impact/effort), eigenaar, status en evaluatie van gerealiseerde benefits?",
          "Is er een closed-loop terugkoppeling: verbeteringen resulteren aantoonbaar in updates in kennis/training/proces?",
        ],
      }),
      bouwblok({
        volgnummer: 13,
        naam: "Financial control",
        omschrijving:
          "In hoeverre is de financiële huishouding van de klantcontactorganisatie inzichtelijk en op orde?",
        toelichting:
          "In hoeverre is de financiële huishouding van de klantcontactorganisatie inzichtelijk en op orde? Hoe zorg je dat je 'in control' bent en blijft en niet verrast wordt. Dit wordt vaak gezien als een van de belangrijkste bouwstenen binnen klantcontact. Kernthema's: inzicht in kosten en bijdragen van klantcontact, financiële kengetallen en KPI's, budgetmodel.",
        tags: ["Inzicht in CC kosten en bijdragen"],
        vragen: [
          "Is er een gespecificeerd klantcontactbudget (mensen, tooling, leveranciers) en wordt realisatie minimaal per maand bijgehouden?",
          "Zijn kosten per kanaal of per type contact inzichtelijk (desnoods via berekening op volume x kostprijs)?",
          "Worden business cases voor verbeterinitiatieven vastgelegd (kosten, baten, risico's) en achteraf geëvalueerd op realisatie?",
          "Is er een forecast-/scenario-aanpak voor capaciteit en kosten (minimaal per kwartaal herijkt)?",
        ],
      }),
      bouwblok({
        volgnummer: 14,
        naam: "Positionering klantcontact",
        omschrijving:
          "Welke rol speelt klantcontact in de organisatie en wat is de slagkracht?",
        toelichting:
          "Welke rol speelt klantcontact in de organisatie en wat is de slagkracht? Is klantbeleving een serieus gespreksonderwerp aan de directietafel of wordt klantcontact gezien als 'noodzakelijk kwaad'? Kernthema's: plaats in het organigram, interne zichtbaarheid, stakeholdermanagement, interne slagkracht, positie aan de besluitvormingstafel.",
        tags: [
          "Plaats van klantcontact in organigram",
          "Interne zichtbaarheid klantcontact (afdeling) / PR",
          "Stakeholder management",
          "Interne slagkracht klantcontact afdeling",
          '"seat at the table"',
        ],
        vragen: [
          "Is klantcontact structureel vertegenwoordigd in besluitvormende overleggen die klantimpact hebben (bijv. product/IT change board)?",
          "Is er een vast escalatie- en besluitpad waarmee klantcontact issues in de keten kan oplossen (met eigenaren buiten CC)?",
          "Worden inzichten uit klantcontact periodiek gedeeld met de organisatie (rapportage/presentatie) en leidt dat aantoonbaar tot acties?",
          "Is er een duidelijke service owner/afsprakenstelsel voor end-to-end service (wie bewaakt kwaliteit/ervaring over teams heen)?",
        ],
      }),
    ],
  },
  {
    id: "proces-tech",
    naam: "Proces & Tech",
    kleur: "--pu",
    volgorde: 3,
    bouwblokken: [
      bouwblok({
        volgnummer: 4,
        naam: "Systemen & Tools",
        omschrijving:
          "In hoeverre is de klantcontactorganisatie goed gefaciliteerd met de juiste systemen en tooling?",
        toelichting:
          "In hoeverre ondersteunt de technische infrastructuur de klantcontactstrategie? AI, AQM, routering, spraakherkenning… Techniek en digitalisering gaan razendsnel. Dit alles vooral bekeken vanuit de functionaliteit voor klanten en medewerkers. Kernthema's: omnichannel klantcontactplatform, CRM-integratie, integraal klantbeeld.",
        tags: [
          "CRM/klantbeeld",
          "Ticketing/Case management",
          "Telefonie / CC platform",
          "Chat / messaging",
          "Kennisbank tooling",
          "Rapportage / BI tooling",
          "Integraties / API's",
          "Tooling-fit vs procesfit",
        ],
        vragen: [
          "Werkt klantcontact in één primair systeem voor cases/tickets (geen structurele parallelle Excel/losse mailbox-processen)?",
          "Is er CTI/telefoonintegratie of een andere koppeling waardoor contactmomenten automatisch aan klant/case worden gekoppeld?",
          "Is er een centraal klantbeeld beschikbaar tijdens het contact (historie, openstaande zaken, afspraken) zonder te wisselen tussen >2 systemen?",
          "Is er een beheerproces voor tooling (release/changes, rechten, integraties) inclusief owner en documentatie?",
        ],
      }),
      bouwblok({
        volgnummer: 6,
        naam: "Workforce Management",
        omschrijving:
          "In hoeverre is de planning/capaciteit goed ingericht om servicelevels te halen tegen acceptabele kosten?",
        toelichting:
          "Zijn de processen voor capaciteitsmanagement op orde? Aan de hand van de schijf van 6 wordt het proces geanalyseerd en per stap het verbeterpotentieel in kaart gebracht. Kernthema's: WFM-volwassenheid, WFM-cyclus, nauwkeurigheid van het forecastingmodel, skills en routering.",
        tags: [
          "Forecasting",
          "Capaciteitsplanning",
          "Roostering",
          "Intra-day management",
          "Shrinkage",
          "Skill-based routing",
          "Servicelevel/ASA/abandonment",
        ],
        vragen: [
          "Worden volumes en workload structureel voorspeld (minimaal maandelijks) en vergeleken met realisatie (forecast vs actual)?",
          "Is er een intraday proces (dagelijks) met monitoring en bijstuuracties (playbook/afspraken) om SL/ASA te halen?",
          "Worden shrinkage-categorieën (verlof, training, verzuim, meetings) structureel gemeten en gepland met targets?",
          "Worden roosters/skills afgestemd op kanaal- en skillvraag (skill-based), en is dat aantoonbaar ingericht in tooling/werkwijze?",
        ],
      }),
      bouwblok({
        volgnummer: 10,
        naam: "Kennismanagement",
        omschrijving:
          "In hoeverre is kennis vastgelegd, onderhouden en vindbaar zodat medewerkers en klanten snel het juiste antwoord krijgen?",
        toelichting:
          "Hoe wordt kennis binnen de organisatie gecreëerd, ontsloten en beheerd? Alle informatie is beschikbaar, 'je hoeft mensen alleen nog maar te leren zoeken'. Kernthema's: kennisbank, kennisbeheer, verantwoordelijkheid en eigenaarschap.",
        tags: [
          "Kennisstructuur/taxonomie",
          "Ownership (knowledge owners)",
          "Content lifecycle",
          "Zoekbaarheid",
          "Kenniskwaliteit",
          "Selfservice content",
        ],
        vragen: [
          "Is er één centrale kennisbank (intern en/of extern) met duidelijke structuur/categorieën die aansluiten op contactredenen?",
          "Is kennis-eigenaarschap ingericht (knowledge owners) en bestaat er een reviewcyclus (bijv. elke 3–6 maanden)?",
          "Is er een proces om nieuwe kennis te maken/actualiseren op basis van issues/changes (intake → review → publicatie)?",
          "Wordt kennisgebruik gemeten (views/search/no-result/feedback) en worden artikelen aantoonbaar verbeterd op basis van data?",
        ],
      }),
      bouwblok({
        volgnummer: 12,
        naam: "Kanaalmanagement",
        omschrijving:
          "In hoeverre is de kanaalstrategie (voice, mail, chat, messaging, selfservice) bewust ingericht en optimaal gemanaged?",
        toelichting:
          "Welke keuzes worden gemaakt met betrekking tot kanaalsturing en waarom? Elke klant heeft een voorkeurskanaal. Hoe manage je dat het beste en kun je klanten misschien 'verleiden' naar het voorkeurskanaal van de organisatie? Kernthema's: kanaalstrategie, kanaalsturing en kanaalverleiding, omnichannel, selfservice, technologie zoals chatbots en speech analytics.",
        tags: [
          "Kanaalstrategie",
          "Kanaalshift",
          "Routing & triage",
          "Selfservice",
          "Omnichannel customer experience",
          "Kanaalperformance",
        ],
        vragen: [
          "Is er een vastgelegde kanaalstrategie waarin per contactreden minimaal één voorkeurskanaal is benoemd (incl. uitzonderingen)?",
          "Zijn routeringsregels/triage vastgelegd en wordt kanaalperformance minimaal maandelijks gemonitord (SL/CSAT/containment)?",
          "Is selfservice ingericht (FAQ/helpcenter/chatbot of formulieren) en wordt deflection/containment gemeten?",
          "Kan een klant kanaalwisselen zonder opnieuw alles uit te leggen (context mee via case/ticket-ID en zichtbare historie)?",
        ],
      }),
    ],
  },
  {
    id: "mens",
    naam: "Mens",
    kleur: "--gr",
    volgorde: 4,
    bouwblokken: [
      bouwblok({
        volgnummer: 5,
        naam: "Performance Management",
        omschrijving:
          "In hoeverre wordt performance van medewerkers en teams structureel gemeten, besproken en verbeterd?",
        toelichting:
          "Hoe wordt succes inzichtelijk gemaakt en in hoeverre is dit in lijn met de strategische doelen? Kernthema's: doelen en KPI's op team/individu, ritme van performance gesprekken, coaching-on-the-job, transparantie in performance, kwaliteit vs kwantiteit balans, feedback cultuur.",
        tags: [
          "Doelen en KPI's op team/individu",
          "Ritme van performance gesprekken",
          "Coaching-on-the-job",
          "Transparantie in performance",
          "Kwaliteit vs kwantiteit balans",
          "Feedback cultuur",
        ],
        vragen: [
          "Heeft iedere medewerker een set vastgelegde doelen (minimaal 3 KPI's/verwachtingen) die periodiek worden bijgewerkt?",
          "Is er een vast kwaliteitsproces (QA) met steekproeven, calibratie en vastgelegde kwaliteitscriteria?",
          "Vinden er structurele 1-op-1's/coachinggesprekken plaats volgens vast ritme (minimaal maandelijks) met vastlegging van afspraken?",
          "Is er een formele verbeterroute voor onderperformance (plan, termijnen, support, evaluatie) die ook daadwerkelijk wordt toegepast?",
        ],
      }),
      bouwblok({
        volgnummer: 7,
        naam: "Learning & Development",
        omschrijving:
          "In hoeverre zijn onboarding, training en ontwikkeling structureel ingericht en passend bij de klantcontactstrategie?",
        toelichting:
          "Hoe zijn opleiding, training en persoonlijke ontwikkeling georganiseerd? Kernthema's: vinden/binden/boeien, training van nieuwe medewerkers, onboarding, terugdringen van vroege uitstroom, coaching, leerpaden en perspectief, learningmanagementsysteem.",
        tags: [
          "Onboarding",
          "Opleidingsplan",
          "Skills matrix",
          "Coaching & mentoring",
          "LMS / leerplatform",
          "Assessments / toetsen",
          "70-20-10 / blended learning",
        ],
        vragen: [
          "Is er een vast onboardingprogramma met modules, duur, leerdoelen en toetsing voordat iemand volledig zelfstandig draait?",
          "Is er een actuele skills-matrix per rol/team waarin per skill een niveau is beschreven en medewerkers zijn ingeschaald?",
          "Is er een vast leerplatform of centrale plek (LMS/KB) waar trainingen, content en voortgang worden beheerd?",
          "Worden leerinterventies geëvalueerd op effect (minimaal 1 van: QA-score, AHT, FCR, CSAT) en wordt het programma daarop aangepast?",
        ],
      }),
      bouwblok({
        volgnummer: 8,
        naam: "Employee Engagement",
        omschrijving:
          "In hoeverre is er aandacht voor betrokkenheid, welzijn en duurzame inzetbaarheid binnen klantcontact?",
        toelichting:
          "Hoe worden medewerkers betrokken, enthousiast en energiek gemaakt en gehouden? Belangrijk thema voor elke organisatie in een steeds krapper wordende arbeidsmarkt. Kernthema's: visie op werkgeverschap, autonomie, verbinding, purpose, gezondheid en welzijn, verzuim en verloop, employee journey.",
        tags: [
          "Medewerkerstevredenheid",
          "Bevlogenheid",
          "Verzuim / welzijn",
          "Retentie",
          "Psychologische veiligheid",
          "Erkenning en waardering",
        ],
        vragen: [
          "Wordt medewerkerstevredenheid structureel gemeten (minimaal 2x per jaar of via pulses) en worden resultaten gedeeld?",
          "Is er een concreet actieplan op engagement/welzijn met owners en deadlines, en wordt voortgang periodiek besproken?",
          "Worden verzuim- en verloopcijfers structureel gemonitord (minimaal maandelijks) en gekoppeld aan oorzaakanalyse?",
          "Zijn er aantoonbare interventies voor duurzame inzetbaarheid (bijv. roosterkeuzes, werkdrukmaatregelen, coaching) met monitoring?",
        ],
      }),
      bouwblok({
        volgnummer: 9,
        naam: "Leiderschap",
        omschrijving:
          "In hoeverre is het leiderschap binnen klantcontact effectief en in lijn met de gewenste cultuur en prestaties?",
        toelichting:
          "Wat is de visie op leiderschap en wat betekent die voor de huidige inrichting van de organisatie? Leiderschap is allesbepalend voor de cultuur en daarmee voor het succes van de organisatie. Het gaat over autonomie en high performing teams. Kernthema's: nieuw leiderschap, faciliteren, ontwikkelen, winnen, zelfsturen en zelfroosteren.",
        tags: [
          "Leiderschapsstijl",
          "Voorbeeldgedrag",
          "Coachend leiderschap",
          "Besluitvaardigheid",
          "Stakeholder management",
          "Teamontwikkeling",
        ],
        vragen: [
          "Is er een vast ritme waarin teamleads prestaties en ontwikkeling met hun teams bespreken (teammeetings + 1-op-1's)?",
          "Is er een vastgelegde set verwachtingen/competenties voor teamleads (rolprofiel) en worden die ook beoordeeld/ontwikkeld?",
          "Is er een structureel overleg met key stakeholders buiten klantcontact (product/IT/operations) met besluiten en opvolging?",
          "Is er opvolgingsplanning of talent-review (minimaal jaarlijks) voor sleutelrollen binnen klantcontact?",
        ],
      }),
    ],
  },
  {
    id: "fundament",
    naam: "Fundament",
    kleur: "--ye",
    volgorde: 5,
    bouwblokken: [
      bouwblok({
        volgnummer: 15,
        naam: "Cultuur",
        omschrijving:
          "Hoe kan de heersende afdelingscultuur beschreven worden en in hoeverre is deze passend bij visie en strategie van de organisatie?",
        toelichting:
          "Hoe kan de heersende afdelingscultuur worden beschreven en in hoeverre past deze bij de visie en strategie van de organisatie? Kernthema's: cultuurbewustzijn, klantgerichtheid, growth mindset en fixed mindset.",
        tags: ["Cultuurbewustzijn", "Klantcentriciteit", "Growth / fixed mindset"],
        vragen: [
          "Is er een expliciete set gedragsprincipes (bijv. klantgericht, eigenaarschap, samenwerken) die in onboarding en coaching terugkomt?",
          "Bestaan er vaste rituelen om te leren van fouten/incidenten (retrospectives, blameless reviews) met vastgelegde verbeteracties?",
          "Worden successen en goed klantgedrag structureel erkend (bijv. shout-outs, awards, storytelling) met zichtbaar ritme?",
          "Is er een meetinstrument voor cultuur/veiligheid (minimaal 1x per jaar) en is er opvolging met acties en terugkoppeling?",
        ],
      }),
    ],
  },
];

export const assessmentKlantcontact = {
  id: "klantcontact-volwassenheid",
  naam: "Klantcontact Volwassenheid",
  subtitel: "±30 minuten. Heldere inzichten. Direct verbeterkansen.",
  beschrijving:
    "Deze assessment brengt in kaart hoe volwassen jouw organisatie is ingericht op het gebied van klantcontact, van strategie tot cultuur. Je krijgt zicht op sterke punten, ontwikkelgebieden en concrete verbeterkansen.",
  doelgroep: "MT, operations en CX-verantwoordelijken binnen klantcontactorganisaties.",
  icoon: "🧭",
  geschatteDuur: "±30 minuten",
  categorieen,
  bouwblokken: null,
  scoresPerGroepGesorteerd: false,
  schaal: [
    { waarde: 1, label: "Niet aanwezig" },
    { waarde: 2, label: "Deels / incidenteel" },
    { waarde: 3, label: "Aanwezig en meestal toegepast" },
    { waarde: 4, label: "Structureel geborgd en gemeten" },
    { waarde: 5, label: "Geoptimaliseerd en continu verbeterd" },
  ],
  organisatieVeldenRef: "organisatieVelden",
  featureCards: [
    { titel: "15 Bouwblokken", tekst: "Een volledig beeld over 5 categorieën, van strategie tot cultuur." },
    { titel: "Visueel Rapport", tekst: "Radar- en staafdiagrammen, sterktes en verbeterkansen in één oogopslag." },
    { titel: "±30 minuten", tekst: "Compact in te vullen, direct bruikbare inzichten." },
  ],
  praktischeInfo: [
    "Invultijd: ±30 minuten, in eigen tempo te onderbreken.",
    "Direct resultaat: zodra de laatste vraag is beantwoord, staat het rapport klaar.",
    "Privacy: antwoorden blijven binnen de organisatie, geen individuele beoordeling.",
  ],
};
