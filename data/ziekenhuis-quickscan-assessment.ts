import { Assessment, Bouwblok, Categorie } from "@/lib/types";

/**
 * Klantcontact Quickscan – Ziekenhuis (`content-ziekenhuis-quickscan.md`): 4 afdelingen (de categorieën), per afdeling 2 of 3
 * dimensies (de bouwblokken) en 60 vragen, 15 per afdeling, met het antwoordType "ja-nee-weetniet" (`datamodel.md`,
 * Antwoordtype). Standalone Assessment, geen sector-variant van de Zorgscan.
 *
 * Bron: Joost, een PDF-resultaat van een ingevulde proefscan voor een fictief ziekenhuis in de oude tool. De vraagteksten zijn
 * letterlijk overgenomen, ook de volgorde binnen een dimensie. De teksten die in de spec als voorstel staan (de zin bij Mensen,
 * subtitel, beschrijving, doelgroep, feature-cards, instructieregel, icoon en kleur) zijn nieuw geschreven.
 *
 * Alle afdelingen zijn `optioneel`: De respondent beantwoordt eerst of de afdeling relevant is (`Assessment.relevantieVraag`).
 */

/** De zin onder de afdelingskaart bij het grootste aandachtspunt, per dimensie (`content-ziekenhuis-quickscan.md`, Dimensies). */
const AANDACHT_ZIN: Record<string, string> = {
  Organisatie: "Binnen deze afdeling lijkt de organisatorische borging van klantcontact nog beperkt ontwikkeld.",
  "Processen en techniek":
    "Binnen deze afdeling lijkt de grootste ontwikkelruimte te zitten in processen, werkwijzen en ondersteunende techniek.",
  Mensen:
    "Binnen deze afdeling lijkt de grootste ontwikkelruimte te zitten bij de mensen, in kennis, bevoegdheden en de belasting door telefonie.",
};

/** Een dimensie binnen een afdeling. Geen tags, geen toelichting en geen centrale vraag: De Toelichtingsmodal heeft dan niets te tonen. */
function dimensie(id: string, volgnummer: number, naam: string, vragen: string[]): Bouwblok {
  return {
    id,
    volgnummer,
    naam,
    omschrijving: "",
    toelichting: null,
    centraleVraag: null,
    tags: [],
    gewicht: 1,
    aandachtZin: AANDACHT_ZIN[naam] ?? null,
    vragen: vragen.map((tekst, i) => ({ id: `${id}-v${i + 1}`, volgnummer: i + 1, tekst })),
  };
}

function afdeling(id: string, naam: string, volgorde: number, omschrijving: string, bouwblokken: Bouwblok[]): Categorie {
  return { id, naam, kleur: "oranje", volgorde, optioneel: true, omschrijving, bouwblokken };
}

const poliklinieken = afdeling(
  "qs-poliklinieken",
  "Poliklinieken",
  1,
  "Polikliniek = een patiënt komt hier, alleen op afspraak, voor medische consulten, onderzoeken of kleine behandelingen door een arts-specialist, zonder opname",
  [
    dimensie("qs-poli-organisatie", 1, "Organisatie", [
      "Is duidelijk wie op de polikliniek verantwoordelijk is voor het beheer van telefonie en bereikbaarheid?",
      "Zijn rapportages beschikbaar over bereikbaarheid (bijv. wachttijd in seconden, % beantwoord)?",
      "Is aantoonbaar dat telefonische informatie de uitkomsten beïnvloedt in afsprakenplanning?",
      "Wordt de patiënttevredenheid over telefonische bereikbaarheid gemeten en gebruikt voor verbeteringen?",
    ]),
    dimensie("qs-poli-processen", 2, "Processen en techniek", [
      "Bestaat er een vaste werkinstructie voor het opnemen, afhandelen en registreren van telefoontjes?",
      "Wordt binnen de polikliniek gewerkt met één primair systeem voor telefoonregistratie (bijv. EPD-taken, tickets, bellijsten)?",
      "Is er een standaard procedure voor doorverbinden en terugbelverzoeken?",
      "Zijn wachttijdafspraken richting patiënten (bijv. max. X keer overgaan) bekend bij de medewerkers?",
      "Zijn telefonische contactredenen eenduidig vastgelegd in het EPD of een ander systeem?",
      "Wordt vastgelegd hoeveel belverzoeken per dag/week binnenkomen én worden afgehandeld?",
      "Is er inzicht in de piekmomenten van het telefonieverkeer op de poli?",
      "Worden actuele wachtrijen/achterstanden (bijv. terugbel-lijsten) structureel gemonitord?",
      "Worden volumes en benodigde capaciteit voorspeld op basis van historische data?",
      "Worden telefonische escalaties (bijv. medicatie, klachten, spoedvragen) systematisch geregistreerd en geanalyseerd?",
    ]),
    dimensie("qs-poli-mensen", 3, "Mensen", [
      "Is er een actueel overzicht van welke medewerkers bevoegd zijn medische vragen telefonisch te beantwoorden?",
    ]),
  ]
);

const verpleegafdelingen = afdeling(
  "qs-verpleegafdelingen",
  "Verpleegafdelingen",
  2,
  "Verpleegafdeling = een patiënt verblijft hier met opname, voor behandeling en zorg door verpleegkundigen en artsen",
  [
    dimensie("qs-verpleeg-organisatie", 4, "Organisatie", [
      "Worden trends in telefonische escalaties (bijv. acute verslechtering) geanalyseerd?",
      "Worden telefoonlogs van nachtdiensten en weekenden gemonitord om te bepalen of extra ondersteuning nodig is?",
    ]),
    dimensie("qs-verpleeg-processen", 5, "Processen en techniek", [
      "Is vastgelegd welke telefoonnummers de afdeling gebruikt voor patiënten, mantelzorgers en andere zorgverleners?",
      "Is er een standaard werkwijze voor het aannemen van telefoontjes van familie?",
      "Is duidelijk wie verantwoordelijk is voor het beantwoorden van de afdelingstelefoon tijdens drukte (verdeling binnen shifts)?",
      "Is er een protocol voor hoe verpleegkundigen berichten of terugbelverzoeken tussen collega's vastleggen?",
      "Bestaat er een overzicht van oproepsystemen (DECT, smartphone, pieper) en bijbehorende workflows?",
      "Wordt informatie over belangrijke patiëntsituaties (bijv. ontslag, complicaties) systematisch doorgegeven via vaste belprotocollen?",
      "Is er een analyse van onveilige situaties veroorzaakt door gemiste of vertraagde telefoontjes?",
    ]),
    dimensie("qs-verpleeg-mensen", 6, "Mensen", [
      "Is bekend welke medische vragen wél/niet telefonisch beantwoord mogen worden door de afdeling?",
      "Worden telefoontjes van familieleden geregistreerd in het EPD (bijv. afspraken, zorgen, updates)?",
      "Is er inzicht in hoeveel onderbrekingen verpleegkundigen dagelijks ervaren door telefoonverkeer?",
      "Is er een schaal of lijst beschikbaar voor triage van telefonische vragen van mantelzorgers?",
      "Is aantoonbaar hoeveel tijd verpleegkundigen kwijt zijn aan telefonische communicatie per dienst?",
      "Wordt patiënt- en familie-ervaring over telefonische communicatie structureel gemeten?",
    ]),
  ]
);

const receptie = afdeling(
  "qs-receptie",
  "Receptie / Centrale",
  3,
  "Receptie / Centrale = de balie en de telefooncentrale waar bezoekers en bellers als eerste terechtkomen en worden doorverbonden",
  [
    dimensie("qs-receptie-organisatie", 7, "Organisatie", [
      "Wordt inzichtelijk gemaakt hoeveel gesprekken worden gemist of afgebroken?",
      "Zijn kosten en capaciteit van de centrale inzichtelijk gemaakt (FTE, kosten per gesprek)?",
      "Worden rapportages actief gebruikt om routering te verbeteren of afdelingen te adviseren?",
    ]),
    dimensie("qs-receptie-processen", 8, "Processen en techniek", [
      "Is er een actuele lijst van alle interne telefoonnummers en overplaatsingsregels?",
      "Zijn er duidelijke richtlijnen voor begroeting, identificatie en doorverbinden?",
      "Wordt gewerkt met een vast script voor veelvoorkomende vragen (route, bezoektijden, parkeren)?",
      "Is duidelijk bij welke situaties niet mag worden doorverbonden (bijv. spoedlijnen)?",
      "Is bekend welk telefoonplatform/centralesysteem de receptie gebruikt?",
      "Zijn cijfers beschikbaar over het aantal binnenkomende telefoontjes per dag/maand?",
      "Wordt de gemiddelde verwerkingstijd (AHT) per gesprek gemeten?",
      "Zijn routeringsregels voor afdelingen (bijv. triage, prioriteit) vastgelegd?",
      "Is er zicht op wachttijden in de telefonische wachtrij en piekbelastingpatronen?",
      "Wordt er CTI-koppeling gebruikt om gegevens automatisch mee te geven bij doorverbinden?",
      "Wordt kanaaleffectiviteit (telefoon vs. selfservice) geanalyseerd?",
      "Wordt kwaliteit periodiek gemeten (bijv. mystery calling, QA-formulieren)?",
    ]),
  ]
);

const patientenservice = afdeling(
  "qs-patientenservice",
  "Patiëntenservice",
  4,
  "Patiëntenservice = het team dat vragen, verzoeken en klachten van patiënten afhandelt, buiten de directe behandeling om",
  [
    dimensie("qs-ps-organisatie", 9, "Organisatie", [
      "Wordt de naleving van doorlooptijden (bijv. binnen 24 uur terugbellen) gemonitord?",
      "Worden selfservice-alternatieven (FAQ, portaal, chatbot) actief bijgehouden en gemonitord?",
      "Is er inzicht in hoeveel telefonische vragen door digitalisering kunnen worden voorkomen?",
      "Worden trends/tijdslijnen van klachten of herhaalverzoeken geanalyseerd?",
      "Is er een integrale rapportage die laat zien hoe telefonische contacten door de keten bewegen (service → poli → arts)?",
    ]),
    dimensie("qs-ps-processen", 10, "Processen en techniek", [
      "Is er een duidelijke taakomschrijving van het team (bijv. afspraken, algemene informatie, klachtenmeldpunt)?",
      "Zijn scripts of standaardantwoorden beschikbaar voor de meest gestelde vragen?",
      "Is er een vaste procedure voor het escaleren van medische vragen naar de juiste afdeling?",
      "Wordt informatie die patiënten telefonisch delen correct vastgelegd in het betreffende systeem?",
      "Is duidelijk wie verantwoordelijk is voor het actueel houden van informatie (protocollen, Q&A)?",
      "Worden volumes per vraagtype vastgelegd (bijv. afspraken, wachtlijstvragen, klachten, portaalvragen)?",
      "Kan het team zien of een patiënt al eerder contact heeft opgenomen en wat er toen besproken is?",
      "Zijn er afspraken met poliklinieken over wachttijden, urgentie en terugkoppeling?",
      "Wordt de kwaliteit van afhandeling gemeten via QA of tevredenheidsmetingen?",
      "Worden resultaten (bijv. wachttijd, volumes, succes selfservice) gebruikt om de organisatie te adviseren of beleid aan te passen?",
    ]),
  ]
);

export const ziekenhuisQuickscan: Assessment = {
  id: "quickscan-ziekenhuis",
  naam: "Klantcontact Quickscan – Ziekenhuis",
  kortLabel: "Quickscan Ziekenhuis",
  subtitel: "±15 minuten. Snel inzicht in waar het ziekenhuis staat.",
  beschrijving:
    "Deze quickscan geeft inzicht in hoe goed klantcontact in jouw ziekenhuis is geregeld, per afdeling: Poliklinieken, verpleegafdelingen, receptie en centrale, en patiëntenservice. Je beantwoordt 60 vragen met Ja, Nee of Weet ik niet en ziet daarna per afdeling waar de basis op orde is en waar ontwikkelruimte zit.",
  doelgroep:
    "Ziekenhuizen die willen weten hoe het telefonisch klantcontact per afdeling is geregeld en waar ze het eerst moeten verbeteren.",
  // Tijdelijke emoji (voorstel, Joost kiest): 🩺 is al van de Zorgscan. Zonder SVG bij de sleutel valt de app terug op de emoji.
  icoon: "🏥",
  geschatteDuur: "±15 minuten",
  afgeleidVanAssessmentId: null,
  pdfContentSecties: null,
  bouwblokken: null,
  scoresPerGroepGesorteerd: false,
  bouwblokLabel: "Dimensie",
  bouwblokEenheidEnkelvoud: "dimensie",
  bouwblokEenheidMeervoud: "dimensies",
  wegingTitel: null,
  wegingToelichting: null,
  featureCards: [
    { titel: "4 afdelingen", tekst: "Poliklinieken, verpleegafdelingen, receptie en centrale, en patiëntenservice." },
    { titel: "Resultaat per dimensie", tekst: "Per afdeling zie je de dimensies Organisatie, Processen en techniek en Mensen." },
    { titel: "Direct resultaat", tekst: "Na afloop zie je meteen per afdeling waar de basis op orde is en waar ontwikkelruimte zit." },
  ],
  // Geen 1–5-schaal: Elke vraag heeft de antwoorden Ja, Nee en Weet ik niet (`antwoordType`).
  schaal: [],
  antwoordType: "ja-nee-weetniet",
  instructieregel:
    "Kies Ja als dit aantoonbaar geregeld is. Is het niet geregeld, kies Nee. Weet je het niet, kies Weet ik niet; dat telt voor de score als Nee.",
  relevantieVraag: "Is deze afdeling relevant voor uw situatie?",
  categorieen: [poliklinieken, verpleegafdelingen, receptie, patientenservice],
};
