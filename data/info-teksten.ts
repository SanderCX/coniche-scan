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
    tekst: "De kleine kop boven de titel in de Toelichtingsmodal, bijvoorbeeld \"Bouwblok\" of \"AI-domein\", gevolgd door het nummer.",
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
    sleutel: "info.verkennenInstellingen",
    plek: "Instellingen, Drempels en termijnen, formulier Verkennen",
    tekst:
      "Grenzen voor Verkennen. Een groep onder het minimum is gestreept en krijgt geen cijfers. Bij een kleinere focus of rest staat een waarschuwing. In een kleinere pool kun je niet groeperen. Een kenmerk met meer waarden dan het maximum of een lagere invulling dan het minimum kan niet groeperen.",
  },
  {
    sleutel: "info.korteNaamOrganisatie",
    plek: "Organisatie aanmaken en bewerken, naast het veld Korte naam",
    tekst:
      "Een korte naam staat in de kolomkoppen van matrices en heatmaps, bijvoorbeeld \"Rabobank\" in plaats van de volledige naam. Laat je het veld leeg, dan geldt de naam zelf. De volledige naam staat in de tooltip.",
  },
  {
    sleutel: "info.verkennenGroeperen",
    plek: "Verkennen, naast het label Groeperen op",
    tekst:
      "Kies een kenmerk om de Organisaties in groepen te verdelen. Daarna kies je de groep waarop je inzoomt (de focusgroep). Die wordt vergeleken met alle andere Organisaties. Is er nog geen kenmerk, dan staat er: Er is nog geen kenmerk om op te groeperen. Voeg bij Kenmerken een kenmerk toe, dan kun je de Organisaties erop in groepen verdelen.",
  },
  {
    sleutel: "info.verkennenEenheid",
    plek: "Verkennen, naast het label Eenheid",
    tekst:
      "Kies waarover je vergelijkt. Bij Organisaties telt elke Organisatie één keer, met één Meting (zie Meetperiode). Bij Onderdelen telt elk onderdeel van een Organisatie apart, en elk onderdeel telt even zwaar mee.",
  },
  {
    sleutel: "info.contactpersonen",
    plek: "Organisatie-detail, bij Kenmerken, naast de kop Contactpersonen",
    tekst:
      "Mensen bij de organisatie die voor Coniche relevant zijn, met hun functie en het LinkedIn-profiel. Het zijn geen Respondenten en ze krijgen niets toegestuurd. Een Admin beheert ze, een Consultant met toegang tot deze organisatie ziet ze.",
  },
  {
    sleutel: "info.dossier",
    plek: "Organisatie-detail, kaart Dossier, naast de kop van het paneel Instellingen voor de Lead",
    tekst:
      "Cases, nieuws, events en blogs die je bij deze organisatie bewaart. Alleen jij en je collega-consultants zien ze. De Lead ziet een item pas als het Dossier zichtbaar is én het item op Zichtbaar voor Lead staat. Een case kan alleen zichtbaar worden als de organisatie in de case dat heeft toegestaan.",
  },
  {
    sleutel: "info.caseVlag",
    plek: "Organisatie-detail, bij de schakelaar \"Mag als case gebruikt worden\"",
    tekst:
      "Zet dit pas aan nadat dit met de organisatie is afgesproken, bijvoorbeeld via contract of mail. Dan mag een consultant deze organisatie als case laten zien aan de lead van een andere organisatie. De lead ziet de branche en de omvang, nooit de naam. Uitzetten haalt de cases met deze organisatie meteen weg bij de leads.",
  },
  {
    sleutel: "info.kpiBlok",
    plek: "Organisatie-detail, blok KPI's, naast de titel",
    tekst: "Algemeen geldt voor de hele organisatie en voor alle kanalen samen. Vul in wat je weet en splits uit zodra je meer weet.",
  },
  {
    sleutel: "info.kpiPlek",
    plek: "Modal KPI's invullen, naast het label Plek",
    tekst: "Kies voor welk deel van de organisatie je invult. Algemeen is de hele organisatie.",
  },
  {
    sleutel: "info.kpiKanalen",
    plek: "Modal KPI's invullen, naast het label Kanalen uitsplitsen",
    tekst: "Kies alleen de kanalen waarvoor je cijfers hebt. De kolom Algemeen blijft altijd staan.",
  },
  {
    sleutel: "info.kpiDefinities",
    plek: "Organisatievelden, tab KPI's en kanalen, naast de titel KPI's",
    tekst: "Per KPI bepaal je of hij per onderdeel en per kanaal ingevuld mag worden. Algemeen is altijd mogelijk.",
  },
  {
    sleutel: "info.kanalen",
    plek: "Organisatievelden, tab KPI's en kanalen, naast de titel Kanalen",
    tekst: "De lijst met kanalen die bij een KPI kunnen staan. Een kanaal telt als ingezet bij een volume boven 0.",
  },
  {
    sleutel: "info.metingOnderdeel",
    plek: "Meting plannen en de andere formulieren met een veld Onderdeel, naast het label Onderdeel",
    tekst: "Kies een onderdeel van deze organisatie of maak een nieuw onderdeel aan. Een nieuw onderdeel verschijnt ook als kolom bij de KPI's.",
  },
  {
    sleutel: "info.verkennenMeetperiode",
    plek: "Verkennen en het wijzigen van een opgeslagen verkenning, naast het label Meetperiode",
    tekst:
      "Per Organisatie telt de laatste Meting met een meetdatum in deze periode. Zo kun je ronde 1 blijven vergelijken, ook als ronde 2 al deels binnen is. Zonder periode telt de meest recente Meting. Een Organisatie zonder Meting in de periode doet niet mee.",
  },
  {
    sleutel: "info.verkennenOpslaan",
    plek: "Verkennen, naast de knop Opslaan als benchmark",
    tekst:
      "Je slaat de filters op en niet de uitkomst. De groep volgt de filters: Komt er een Organisatie bij die erbij past, dan telt die mee. Daarna wijs je de benchmark toe aan een Lead van een Organisatie die erin zit, in het Leads-venster van die Organisatie.",
  },
  {
    sleutel: "info.verkennenKenmerken",
    plek: "Verkennen, kaart Kenmerken, naast de titel",
    tekst:
      "Zet hier een kenmerk neer om op te filteren en om op te groeperen. Een kenmerk zonder gekozen waarde filtert niets. Filteren op bereik bij getallen volgt later.",
  },
  {
    sleutel: "info.korteNamen",
    plek: "Organisatievelden, tab Korte namen, naast de titel, en in de modal Korte namen in Verkennen",
    tekst:
      "Een korte naam staat op de chips en in de grafieken van Verkennen. De Organisatie houdt de originele waarde, ook in de exports. Laat je het veld leeg, dan geldt het origineel.",
  },
  {
    sleutel: "info.organisatieToegang",
    plek: "Organisatie-detail, kaart Toegang, naast de titel",
    tekst:
      "De eigenaar is de Consultant die de organisatie heeft aangemaakt. Een toegewezen Consultant mag deze organisatie ook zien en beheren, en dezelfde gegevens inzien. Intrekken haalt die toegang weer weg.",
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
    sleutel: "info.spreidingOnderdelen",
    plek: "Resultaten van een samengestelde Meting, een vergelijking en een benchmark, naast de uitgeschakelde weergave Spreiding",
    tekst: "Spreiding tussen onderdelen is er vanaf 3 onderdelen. Bij twee zegt een standaardafwijking weinig.",
  },
  {
    sleutel: "info.antwoordenGeenScans",
    plek: "Resultaten van een samengestelde Meting en een vergelijking, naast de uitgeschakelde weergave Antwoorden",
    tekst:
      "Antwoorden per vraag is er alleen bij één Meting met scans. Een samengestelde Meting heeft geen scans en een vergelijking mengt Metingen.",
  },
  {
    sleutel: "info.toonAls",
    plek: "Resultaten van een samengestelde Meting en een vergelijking, naast het label Toon als",
    tekst:
      "Gemiddeld telt elk onderdeel even zwaar mee, ongeacht het aantal scans, en laat niet zien welk onderdeel waar zit. Naast elkaar geeft elk onderdeel een eigen vorm op zijn eigen score. De vorm onderscheidt de onderdelen, niet de kleur.",
  },
  {
    sleutel: "info.toonAlsTeVeel",
    plek: "Resultaten van een samengestelde Meting en een vergelijking, naast de uitgeschakelde keuze Naast elkaar",
    tekst: "Naast elkaar is er bij hoogstens zes onderdelen, want er zijn zes vormen. Bij meer onderdelen toont de weergave het gemiddelde.",
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
      "De reden volgt de situatie. Spreiding, Antwoorden en Exporteren kunnen pas aan als Resultaten van dezelfde Meting aan staat. Een samengestelde Meting heeft alleen Resultaten. Spreiding heeft te weinig scans om anoniem te blijven. Bij anonieme namen heeft de Meting te weinig afgeronde scans om anoniem te blijven. Een benchmark is er pas als de groep groot genoeg is, en bij een benchmark binnen een organisatie ook als de Lead Resultaten heeft van een Meting in die benchmark. Bij een Verkenning met te weinig Organisaties staat er: \"Te weinig Organisaties in deze groep: {n}, minimaal {min}.\"",
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
