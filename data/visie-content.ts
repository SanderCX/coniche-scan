/**
 * Statische content voor de publieke "Visie"-pagina (`app/visie/page.tsx`),
 * letterlijk overgenomen uit `visie-coniche.md` deel 1. Geen Assessment-data
 * (geen scoringslogica, geen beheerscherm nodig) — vandaar hier als gewone
 * constbegren i.p.v. via het generieke Assessment-datamodel.
 */

export interface VisieSectie {
  titel: string;
  alineas: string[];
}

export const visieSecties: VisieSectie[] = [
  {
    titel: "Klantcontact als plek waar beloften worden waargemaakt",
    alineas: [
      "In klantcontact merkt een klant of een organisatie waarmaakt wat ze belooft. Het organogram, het beleidsplan of het jaarplan kent de klant niet; wat hij kent, is hoe zijn vraag werd afgehandeld.",
      "Hoe dat gaat, is het resultaat van keuzes op veel plekken tegelijk: in de strategie, de inrichting, de processen en systemen, het leiderschap en de manier waarop mensen met elkaar samenwerken. Een organisatie met goede medewerkers en moderne systemen kan klanten toch teleurstellen als die keuzes niet op elkaar aansluiten.",
      "De kwaliteit van klantcontact hangt daarom af van wat een organisatie structureel geregeld heeft. Denk aan afspraken die ook gelden als een bepaalde collega afwezig is, of een overleg dat op vaste momenten plaatsvindt en tot besluiten leidt.",
      "Coniche heeft de Bouwstenen van Klantcontact ontwikkeld om dat geheel in kaart te brengen. Het model beschrijft vijftien onderdelen die samen bepalen hoe goed klantcontact functioneert. Met de scan wordt per onderdeel zichtbaar hoe ver een organisatie is, als basis om gericht te verbeteren.",
    ],
  },
  {
    titel: "Kwaliteit zit in het geheel",
    alineas: [
      "Kwaliteit in klantcontact wordt vaak gekoppeld aan de medewerker: voert die het gesprek goed, volgt die de procedure? Dat is een deel van het verhaal. Medewerkers werken binnen processen, processen draaien op systemen, en systemen worden gekozen op basis van strategie en doelen. Als daar iets schuift, merkt de klant dat, hoe goed de medewerker ook is.",
      "Kwaliteit is in dit model daarom geen losse bouwsteen. Het komt op meerdere plekken terug: bij Performance Management (een vast kwaliteitsproces), Kennismanagement (actuele en vindbare kennis), Leren uit klantcontact (verbeteringen die aantoonbaar doorwerken) en Kanaalmanagement (een klant hoeft zijn verhaal niet opnieuw te doen).",
    ],
  },
  {
    titel: "Van meten naar verbeteren",
    alineas: [
      "Veel organisaties meten klantcontact uitgebreid. Een kleiner deel slaagt erin om op basis daarvan structureel te verbeteren. Een rapportage verandert op zichzelf niets. Er verandert pas iets als iemand op basis van de cijfers een besluit neemt en dat besluit ook wordt uitgevoerd.",
      "In de praktijk stokt het vaak tussen besluiten en doen: er ligt een plan, maar niemand is eigenaar van de uitvoering, of achteraf kijkt niemand of het effect had. Deze cyclus komt terug in de scan, in de schaal en in de opbouw van de vragen per bouwsteen.",
    ],
  },
];

export const visieIntro =
  "Klantcontact is de plek waar een klant merkt of een organisatie waarmaakt wat ze belooft. Deze visie beschrijft wat daarvoor nodig is.";

export const watIsGoedIntro =
  "Goed klantcontact levert structureel waarde op voor klanten en voor de organisatie. In de praktijk betekent dat:";

export const watIsGoedKlantcontact: string[] = [
  "Het sluit aan op wat klanten nodig hebben.",
  "Het draagt bij aan de doelen van de organisatie.",
  "Het versterkt het vertrouwen van klanten.",
  "Het is efficiënt georganiseerd.",
  "Het is vol te houden voor de mensen die het uitvoeren.",
  "Het wordt aantoonbaar beter.",
];

export const watIsGoedKlantcontactSlot =
  "Die eisen kunnen met elkaar botsen. Een organisatie kan tevreden klanten hebben tegen kosten die niet vol te houden zijn. Ze kan ook efficiënt werken terwijl klanten steeds opnieuw moeten bellen voor dezelfde vraag. Een medewerker kan een gesprek goed voeren terwijl het proces erachter vastloopt. Coniche beoordeelt klantcontact daarom altijd over meerdere onderdelen tegelijk.";

export const verbetercyclus: string[] = ["Meten", "Begrijpen", "Besluiten", "Doen", "Leren"];
