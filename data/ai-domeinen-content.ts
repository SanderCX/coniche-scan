/**
 * Statische content voor de publieke "AI"-pagina (`app/ai-domeinen/page.tsx`),
 * letterlijk overgenomen uit `visie-ai-klantcontact.md`.
 */

export interface AiDomeinContent {
  nummer: number;
  naam: string;
  beschrijving: string[];
  centraleVraag: string;
}

export const aiDomeinen: AiDomeinContent[] = [
  {
    nummer: 1,
    naam: "Strategie en governance",
    beschrijving: [
      "AI heeft alleen duurzame waarde wanneer inzet, prioriteiten en randvoorwaarden bewust worden aangestuurd. Daarom moet duidelijk zijn welke rol AI speelt in het realiseren van klant- en organisatiedoelen, wie daar verantwoordelijk voor is en welke kaders daarbij gelden.",
      "Een organisatie die AI succesvol inzet, behandelt AI niet als een verzameling experimenten. Er is een gedeelde visie, eigenaarschap is belegd, investeringen worden bewust gekozen en er zijn afspraken over risico's, ethiek, compliance en menselijk toezicht.",
      "Zonder die basis ontstaat versnippering. Er worden oplossingen gebouwd, maar niet gestuurd.",
    ],
    centraleVraag: "Is duidelijk waarom, waarvoor en onder welke voorwaarden de organisatie AI inzet?",
  },
  {
    nummer: 2,
    naam: "Data, integratie en architectuur",
    beschrijving: [
      "De kwaliteit van AI wordt begrensd door de kwaliteit van de onderliggende data en systemen.",
      "AI moet kunnen beschikken over betrouwbare informatie, actuele kennis en een technische omgeving waarin gegevens veilig, consistent en herleidbaar beschikbaar zijn. Dat vraagt om integratie tussen systemen, duidelijke definities en een architectuur die groei en verandering ondersteunt. Ook is vastgelegd wat er gebeurde, wanneer en met welke input, zodat AI achteraf te controleren blijft.",
      "Een organisatie met een sterke basis voorkomt dat AI-oplossingen afhankelijk worden van losse databronnen, handmatig beheer of individuele kennis.",
    ],
    centraleVraag: "Beschikt AI over de gegevens, kennis en technische basis die nodig zijn om betrouwbaar te functioneren?",
  },
  {
    nummer: 3,
    naam: "Use-cases en automatisering",
    beschrijving: [
      "AI levert pas waarde wanneer het onderdeel wordt van het dagelijkse klantcontactproces.",
      "Dat begint met duidelijke use-cases die aantoonbaar bijdragen aan klantwaarde, medewerkerondersteuning of efficiency. Vervolgens moeten deze toepassingen opgenomen worden in processen, werkwijzen en operationele sturing.",
      "Een volwassen organisatie kiest bewust welke taken geautomatiseerd worden, welke ondersteuning AI biedt aan medewerkers en waar menselijk oordeel noodzakelijk blijft.",
    ],
    centraleVraag: "Wordt AI op een doelgerichte manier ingezet om klantcontact aantoonbaar beter te maken?",
  },
  {
    nummer: 4,
    naam: "Performance, monitoring en kwaliteit",
    beschrijving: [
      "AI vraagt dezelfde discipline als iedere andere bedrijfskritische voorziening.",
      "Organisaties moeten weten of AI doet wat verwacht wordt, welke resultaten worden gerealiseerd en welke risico's ontstaan. Dat vraagt om metingen, monitoring, testen en structurele feedback.",
      "Een volwassen organisatie stuurt niet alleen op implementatie, maar op prestaties. AI-output wordt gevolgd, gecontroleerd en verbeterd op basis van meetbare resultaten. Waar nodig kan de organisatie ook uitleggen waarom AI tot een bepaald advies of antwoord komt.",
    ],
    centraleVraag: "Is inzichtelijk hoe goed AI presteert en waarom AI tot haar uitkomsten komt, en wordt daar actief op gestuurd?",
  },
  {
    nummer: 5,
    naam: "Mensen, skills en adoptie",
    beschrijving: [
      "De waarde van AI wordt uiteindelijk bepaald door de mensen die ermee werken.",
      "Dat vraagt om nieuwe vaardigheden, duidelijke verwachtingen en vertrouwen in de manier waarop AI wordt ingezet. Medewerkers moeten begrijpen wat AI doet, wanneer zij erop kunnen vertrouwen en wanneer zij moeten ingrijpen.",
      "Een volwassen organisatie ondersteunt medewerkers actief bij adoptie en zorgt dat verantwoordelijkheden en competenties aansluiten op de nieuwe werkelijkheid.",
    ],
    centraleVraag: "Zijn medewerkers voldoende toegerust om AI effectief en verantwoord te gebruiken?",
  },
  {
    nummer: 6,
    naam: "Security, risk en compliance",
    beschrijving: [
      "AI introduceert nieuwe risico's rondom privacy, beveiliging, regelgeving en besluitvorming.",
      "Een organisatie moet weten welke risico's aanwezig zijn, welke beheersmaatregelen gelden en hoe incidenten worden voorkomen, vastgesteld en afgehandeld. Bij interacties met een hoog risico is vooraf bepaald wanneer een mens meekijkt of moet ingrijpen.",
      "Volwassen AI-organisaties behandelen security, privacy en compliance niet als controle achteraf, maar als ontwerpprincipe vanaf het begin.",
    ],
    centraleVraag: "Zijn de belangrijkste risico's rondom AI beheerst en aantoonbaar onder controle, inclusief het moment waarop een mens meekijkt?",
  },
  {
    nummer: 7,
    naam: "Operating model en schaalbaarheid",
    beschrijving: [
      "Succesvolle AI-oplossingen ontstaan niet door één goede pilot, maar door een organisatie die AI structureel kan ontwikkelen, beheren en verbeteren.",
      "Daarvoor zijn processen nodig voor selectie, ontwikkeling, implementatie, onderhoud en evaluatie. Ook moeten eigenaarschap, budgetten en verantwoordelijkheden helder zijn ingericht. Een volwassen organisatie werkt daarbij met herbruikbare bouwblokken (zoals kennisontsluiting, datakoppelingen, analyse en waarborgen) in plaats van elke AI-oplossing opnieuw uit te vinden, en beoordeelt leveranciers en technologie op vaste criteria zoals kwaliteit, kosten, risico en afhankelijkheid.",
      "Een volwassen organisatie beschikt over een herhaalbare aanpak waarmee succesvolle toepassingen opgeschaald kunnen worden zonder afhankelijk te zijn van individuen of losse projecten.",
    ],
    centraleVraag: "Kan de organisatie AI duurzaam ontwikkelen, beheren en opschalen, met herbruikbare bouwblokken en bewust gekozen leveranciers?",
  },
  {
    nummer: 8,
    naam: "Klant- en kanaalervaring",
    beschrijving: [
      "AI wordt uiteindelijk beoordeeld door klanten, niet op de onderliggende technologie maar op de ervaring die ontstaat.",
      "Klanten verwachten dat AI begrijpelijk, betrouwbaar en consistent werkt, ongeacht het kanaal dat zij gebruiken. Ook moet duidelijk zijn wanneer AI wordt ingezet en hoe eenvoudig een medewerker kan worden betrokken wanneer dat nodig is. Dat geldt ook voor toegankelijkheid: iedere klant moet mee kunnen komen, ongeacht taalniveau, beperking of manier van spreken.",
      "Een volwassen organisatie stuurt daarom actief op klantvertrouwen, gebruiksgemak, toegankelijkheid en de kwaliteit van de totale klantreis.",
    ],
    centraleVraag: "Draagt AI zichtbaar bij aan een betere en toegankelijke klant- en kanaalervaring?",
  },
];
