/**
 * Register van de Info-iconen (`beheerpagina.md`, punt 2a, Algemene teksten):
 * sleutel, plek en initiële tekst. De tekst hier is de standaardtekst; een Admin
 * kan hem op de plek zelf aanpassen (`components/InfoIcoon.tsx`). Een lege of
 * ontbrekende waarde in de Algemene teksten betekent: Deze standaardtekst.
 *
 * Een standaardtekst bevat geen verwijzing naar een document of andere
 * bouwerstekst. Elk nieuw Info-icoon krijgt hier een regel, en dezelfde regel
 * komt in het register in `beheerpagina.md`.
 */
export interface InfoTekstDefinitie {
  sleutel: string;
  plek: string;
  tekst: string;
}

export const INFO_TEKSTEN: InfoTekstDefinitie[] = [
  {
    sleutel: "info.bewaartermijn",
    plek: "Instellingen, Drempels en termijnen, formulier Bewaartermijn ingevulde scans",
    tekst:
      "Zonder ingestelde bewaartermijn verschijnt hier nooit een scan: Er is geen automatische verwijdering, alleen een melding zodra jij een termijn instelt.",
  },
  {
    sleutel: "info.importBestanden",
    plek: "Importeren (organisatie-detail), bij \"Bestanden kiezen\"",
    tekst:
      "Meerdere bestanden tegelijk mogen: Houd Cmd/Ctrl (of Shift voor een reeks) ingedrukt bij het selecteren, of kies direct een hele map met losse CSV's. Elk bestand mag een ander bronformaat hebben, dat wordt per bestand apart herkend.",
  },
  {
    sleutel: "info.importRijen",
    plek: "Importeren (organisatie-detail), bij \"rijen importeren\"",
    tekst:
      "Rijen met een 95%+-vraagtekstmatch (niet 100%) tellen pas mee na een expliciete goedkeuring per rij, met de knop \"Goedkeuren\" in de tabel hierboven.",
  },
  {
    sleutel: "info.respondentBewerken",
    plek: "Respondent-overzicht, bewerkformulier",
    tekst:
      "De persoonlijke link blijft ongewijzigd, ook na een nieuw e-mailadres. Een wijziging geldt voor alle scans van deze Respondent.",
  },
  {
    sleutel: "info.algemeneTeksten",
    plek: "Algemene teksten, bij het tekstveld",
    tekst: "Staat direct onder de titel op de persoonlijke link van elke respondent/Lead.",
  },
  {
    sleutel: "info.contentIcoon",
    plek: "Content, veld Icoon",
    tekst: "Een emoji die op de kaart van dit assessment staat, bijvoorbeeld 🩺.",
  },
  {
    sleutel: "info.contentSlotsectie",
    plek: "Content, Slotsectie voor de PDF-export",
    tekst:
      "Kies de titel en de bron van de slotsectie aan het eind van de PDF uit de vaste lijst. Zonder keuze krijgt de PDF geen slotsectie.",
  },
  {
    sleutel: "info.auditLog",
    plek: "Audit-log, naast de paginatitel",
    tekst: "Wie (of het Systeem) wat deed, wanneer en op welk record. Alleen-lezen. Geen persoonsgegevens uit scans.",
  },
  {
    sleutel: "info.algemeneTekstenPagina",
    plek: "Algemene teksten, naast de paginatitel",
    tekst: "Teksten los van één Assessment-type. Wijzigingen zijn direct zichtbaar, geen aparte publicatiestap.",
  },
  {
    sleutel: "info.algemeneTekstenInfoIconen",
    plek: "Algemene teksten, naast de kop Info-iconen",
    tekst:
      "Alle toelichtingen achter een Info-icoon, met de plek en de actuele tekst. Aanpassen kan op de plek zelf, met het potlood in het open Info-icoon.",
  },
  {
    sleutel: "info.contentToelichting",
    plek: "Content, veld Toelichting van een bouwblok",
    tekst:
      "Lopende tekst in de Toelichtingsmodal bij dit bouwblok. Een lege regel scheidt de alinea's. Laat je het veld leeg, dan ontbreekt dit onderdeel in de modal.",
  },
  {
    sleutel: "info.contentBouwblokLabel",
    plek: "Content, veld Bouwblok-label",
    tekst: "De kleine kop boven de titel in de Toelichtingsmodal, bijvoorbeeld \"Bouwsteen\" of \"AI-domein\", gevolgd door het nummer.",
  },
  {
    sleutel: "info.conflictOplossen",
    plek: "Conflict oplossen, naast de titel van de modal",
    tekst:
      "Een Respondent heeft per Meting één scan. Hang één van de twee scans aan een andere Respondent. Alleen die scan gaat mee, de oorspronkelijke Respondent blijft bestaan met de andere scan.",
  },
  {
    sleutel: "info.dataIntegriteit",
    plek: "Instellingen, Data-integriteit, naast \"Controleer nu\"",
    tekst:
      "Controleert of er, bijvoorbeeld na een verwijderactie, nog ingevulde scans zijn die naar een niet-bestaande Respondent verwijzen.",
  },
  {
    sleutel: "info.startAssessment",
    plek: "Assessment-landingspagina, achter de uitgeschakelde knop \"Start assessment\"",
    tekst: "Toegang tot een assessment loopt via een persoonlijke uitnodiging.",
  },
  {
    sleutel: "info.metingBegrippen",
    plek: "Organisatie-detail, naast de kop \"Metingen\"",
    tekst:
      "Onderdeel: Welk deel van de organisatie gemeten wordt, zoals \"Zuid-Nederland Zakelijk\", of \"Hele organisatie\". Assessment: De vragenlijst. Meetdatum: De dag waarop gemeten wordt, niet de dag van aanmaken of importeren. Meting: Eén onderdeel met één Assessment op één meetdatum, de Respondenten horen bij een Meting. De naam van de Meting maakt de app uit onderdeel en meetdatum, je kunt hem achteraf aanpassen.",
  },
  {
    sleutel: "info.scansSamenbrengen",
    plek: "Resultaten, lijst Metingen, achter de uitgeschakelde knop \"Samenbrengen in één Meting…\" bij een selectie met meer dan één Assessment of meer dan één organisatie",
    tekst: "Samenbrengen kan alleen voor Metingen van hetzelfde Assessment, binnen één organisatie. Selecteer alleen Metingen van één Assessment.",
  },
  {
    sleutel: "info.bulkExportOrganisatie",
    plek: "Resultaten, lijst Metingen, achter de uitgeschakelde knop \"Exporteren\" bij een selectie over meer dan één organisatie",
    tekst: "Bulk-export kan alleen binnen één organisatie. Filter eerst op Organisatie.",
  },
  {
    sleutel: "info.positieMeting",
    plek: "Resultaten van één scan, naast de uitgeschakelde weergave \"Positie in de Meting\"",
    tekst:
      "De positie van een scan tegenover de andere scans in de Meting is er pas bij voldoende afgeronde scans. Bij minder is een scan te herleiden naar een persoon. Het minimum staat bij Drempels en termijnen (aantal respondenten per Meting).",
  },
  {
    sleutel: "info.mijnAccountWachtwoord",
    plek: "Mijn account, naast de uitgeschakelde knop \"Wachtwoord wijzigen\"",
    tekst: "Wachtwoord wijzigen komt met de echte inlog. Tot die tijd vraag je een Admin om je wachtwoord te wijzigen.",
  },
  {
    sleutel: "info.assessmentVerwijderen",
    plek: "Assessments, op de kaart en het detail, naast de uitgeschakelde knop \"Verwijderen\"",
    tekst:
      "Verwijder eerst alle Metingen van dit Assessment, bij alle organisaties. Daarna kan het Assessment worden verwijderd. Dit kan niet ongedaan worden gemaakt.",
  },
  {
    sleutel: "info.benchmarkInstellingen",
    plek: "Instellingen, Drempels en termijnen, formulier Benchmark",
    tekst:
      "Een Lead ziet een vergelijking pas als de groep groot genoeg is, inclusief het lid van de view: Zoveel organisaties (tussen organisaties), Metingen (binnen een organisatie) of scans in de Meting (binnen een Meting). Het aantal scans per gekozen Meting is hoeveel afgeronde scans een Meting minstens moet hebben om in een benchmark gekozen te kunnen worden. Het aantal dagen tussen Metingen is voor een vergelijking met de lezing Naast elkaar: Liggen de meetdata verder uit elkaar, dan krijg je bij het opslaan een waarschuwing. Opslaan blijft mogelijk.",
  },
  {
    sleutel: "info.verkennen",
    plek: "Verkennen, naast de paginatitel",
    tekst:
      "Verkennen werkt op de pool van één Assessment: De Organisaties met toestemming voor benchmark die een Meting hebben met genoeg afgeronde scans, de meest recente per Organisatie. Elke Organisatie telt even zwaar mee. Het scherm slaat niets op en een Lead ziet het nooit.",
  },
  {
    sleutel: "info.verkennenDrempels",
    plek: "Instellingen, Drempels en termijnen, formulier Verkennen",
    tekst:
      "Een groep met minder organisaties dan het minimum is gestreept en krijgt in de heatmap geen cijfers. Heeft de focus of de rest minder organisaties dan de waarschuwingsgrens, dan staat er een waarschuwing dat verschillen voorzichtig gelezen moeten worden. Dat is geen blokkade.",
  },
  {
    sleutel: "info.benchmarkVlag",
    plek: "Organisatie-detail, bij de schakelaar \"Doet mee aan benchmark\"",
    tekst:
      "Zet dit pas aan nadat dit met de organisatie is afgesproken, bijvoorbeeld via contract of mail. Zonder deze schakelaar staat de organisatie niet in de keuzelijst van een benchmark. Uitzetten haalt de organisatie uit alle benchmarks.",
  },
  {
    sleutel: "info.benchmarkAanmaken",
    plek: "Benchmark aanmaken of wijzigen, achter de uitgeschakelde knop",
    tekst:
      "Een benchmark heeft een naam nodig, minstens één Assessment en minstens één organisatie die je hebt aangevinkt. Een organisatie staat alleen in de lijst als ze meedoet aan benchmarks en een Meting heeft van een gekozen Assessment met genoeg afgeronde scans.",
  },
  {
    sleutel: "info.benchmarkAanmakenMetingen",
    plek: "Benchmark binnen een organisatie aanmaken of wijzigen, achter de uitgeschakelde knop",
    tekst:
      "Een vergelijking tussen Metingen heeft een naam nodig, een organisatie, een Assessment en precies twee Metingen. Een Meting is alleen te kiezen met een meetdatum en genoeg afgeronde scans.",
  },
  {
    sleutel: "info.benchmarkAanmakenScans",
    plek: "Benchmark binnen een Meting aanmaken of wijzigen, achter de uitgeschakelde knop",
    tekst:
      "Een benchmark binnen een Meting heeft een naam nodig, een organisatie, een Assessment en een Meting. Een Meting is alleen te kiezen met genoeg afgeronde scans.",
  },
  {
    sleutel: "info.vergelijkMetingen",
    plek: "Resultaten van een Meting, naast de uitgeschakelde knop \"Vergelijking\"",
    tekst:
      "Deze Meting zit in geen enkele vergelijking. Een Admin maakt die aan onder Resultaten, Benchmarks, met het niveau Binnen een organisatie.",
  },
  {
    sleutel: "info.leadToegangCel",
    plek: "Leads-venster van de organisatie, in een grijze cel",
    tekst:
      "De reden volgt de situatie. Spreiding, Antwoorden en Exporteren kunnen pas aan als Resultaten van dezelfde Meting aan staat. Een samengestelde Meting heeft alleen Resultaten. Spreiding heeft te weinig scans om anoniem te blijven. Bij anonieme namen heeft de Meting te weinig afgeronde scans om anoniem te blijven. Een benchmark is er pas als de groep groot genoeg is, en bij een benchmark binnen een organisatie ook als de Lead Resultaten heeft van een Meting in die benchmark.",
  },
  {
    sleutel: "info.antwoordenMetNamen",
    plek: "Organisatie-detail, bij de schakelaar \"Namen tonen bij Antwoorden\"",
    tekst:
      "Uit: Leads zien de antwoorden als R1 tot en met Rn. Aan: Leads zien de namen van de respondenten. Stem dit af met de opdrachtgever voordat je het aanzet. Het geldt voor alle Leads van deze organisatie.",
  },
  {
    sleutel: "info.exportEenScan",
    plek: "Meting-overzicht en de lijsten onder Resultaten, achter de uitgeschakelde opties \"Als PDF\" en \"Voor InDesign (XML)\"",
    tekst: "Beschikbaar bij precies één scan.",
  },
];

export function standaardInfoTekst(sleutel: string): string {
  return INFO_TEKSTEN.find((t) => t.sleutel === sleutel)?.tekst ?? "";
}

/** Maximale lengte van een Info-icoon-tekst (`beheerpagina.md`, punt 2a). */
export const INFO_TEKST_MAX_TEKENS = 500;
