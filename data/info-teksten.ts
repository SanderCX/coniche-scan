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
    plek: "Applicatie, Instellingen, formulier Bewaartermijn ingevulde scans",
    tekst:
      "Zonder ingestelde bewaartermijn verschijnt hier nooit een scan: Er is geen automatische verwijdering, alleen een melding zodra jij een termijn instelt.",
  },
  {
    sleutel: "info.importBestanden",
    plek: "Import, bij \"Bestanden kiezen\"",
    tekst:
      "Meerdere bestanden tegelijk mogen: Houd Cmd/Ctrl (of Shift voor een reeks) ingedrukt bij het selecteren, of kies direct een hele map met losse CSV's. Elk bestand mag een ander bronformaat hebben, dat wordt per bestand apart herkend.",
  },
  {
    sleutel: "info.importRijen",
    plek: "Import, bij \"rijen importeren\"",
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
    plek: "Applicatie, Data-integriteit, naast \"Controleer nu\"",
    tekst:
      "Controleert of er, bijvoorbeeld na een verwijderactie, nog ingevulde scans zijn die naar een niet-bestaande Respondent verwijzen.",
  },
  {
    sleutel: "info.startAssessment",
    plek: "Assessment-landingspagina, achter de uitgeschakelde knop \"Start assessment\"",
    tekst: "Toegang tot een assessment loopt via een persoonlijke uitnodiging.",
  },
  {
    sleutel: "info.bulkExportOrganisatie",
    plek: "Ingevulde scans, achter de uitgeschakelde knop \"Exporteren\" bij een selectie over meer dan één organisatie",
    tekst: "Bulk-export kan alleen binnen één organisatie. Filter eerst op Organisatie.",
  },
  {
    sleutel: "info.exportEenScan",
    plek: "Ingevulde scans en organisatie-detail, achter de uitgeschakelde opties \"Als PDF\" en \"Voor InDesign (XML)\"",
    tekst: "Beschikbaar bij precies één scan.",
  },
];

export function standaardInfoTekst(sleutel: string): string {
  return INFO_TEKSTEN.find((t) => t.sleutel === sleutel)?.tekst ?? "";
}

/** Maximale lengte van een Info-icoon-tekst (`beheerpagina.md`, punt 2a). */
export const INFO_TEKST_MAX_TEKENS = 500;
