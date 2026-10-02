// Assessment "AI-Volwassenheid in Klantcontact" — content-ai-scan.md.
// 8 domeinen, GEEN categorie-laag, 40 vragen (5 per domein). Geen tags per domein.
// Scores per domein worden gesorteerd getoond (scoresPerGroepGesorteerd: true).

function vraag(domeinId, volgnummer, tekst) {
  return { id: `${domeinId}-v${volgnummer}`, volgnummer, tekst };
}

function domein({ volgnummer, naam, omschrijving, vragen }) {
  const id = `ad${volgnummer}`;
  return {
    id,
    volgnummer,
    naam,
    omschrijving,
    toelichting: omschrijving,
    tags: [],
    vragen: vragen.map((tekst, i) => vraag(id, i + 1, tekst)),
  };
}

const bouwblokken = [
  domein({
    volgnummer: 1,
    naam: "Strategie en governance",
    omschrijving: "AI-visie, governance, prioritering, ethiek en compliance",
    vragen: [
      "We hebben een duidelijke AI-visie en strategie die is gekoppeld aan klant- en bedrijfsdoelen.",
      "Er is een formele AI-governance ingericht (rollen, besluitvorming, escalatie, eigenaarschap).",
      "AI-initiatieven worden geprioriteerd via een vaste businesscase-methodiek (waarde, risico, effort).",
      "Responsible AI/ethiek (bias, transparantie, human in the loop) is uitgewerkt in beleid en wordt toegepast.",
      "We voldoen aantoonbaar aan relevante wet- en regelgeving (privacy/security/AI-regels) in onze AI-toepassingen.",
    ],
  }),
  domein({
    volgnummer: 2,
    naam: "Data, integratie en architectuur",
    omschrijving: "Datakwaliteit, ontsluiting, datamodel, kennisbasis en logging",
    vragen: [
      "De kwaliteit van onze klantcontactdata (CRM, ticketing, Kennis, call/chat transcripts) is voldoende voor AI.",
      "Data is goed ontsloten en geïntegreerd over kanalen heen (voice/chat/mail/social) voor AI-toepassingen.",
      "We hebben een beheerd datamodel en definities (bijv. intent, contact reason, outcome) die breed gebruikt worden.",
      "We hebben een robuuste kennisbasis (content lifecycle, eigenaarschap, actualiteit) die AI kan gebruiken.",
      "Logging en datatraceerbaarheid (wat gebeurde wanneer, met welke input) is goed geregeld.",
    ],
  }),
  domein({
    volgnummer: 3,
    naam: "Use-cases en automatisering",
    omschrijving: "Live AI use-cases, agent assist, automatisering en procesintegratie",
    vragen: [
      "We hebben AI-use-cases live die aantoonbaar waarde leveren (kosten, CX, kwaliteit, medewerker).",
      "AI wordt ingezet voor zowel klantinteractie (selfservice) als agent-ondersteuning (Agent assist).",
      "Automatisering (bijv. intentherkenning, samenvatten, classificeren, next-best-action) is uitgerold.",
      "We hebben duidelijke criteria wanneer we wel/niet automatiseren (complexiteit, risico, klantimpact).",
      'End-to-end procesintegratie (van contact naar afhandeling) is ingericht, niet alleen "losse AI pilots".',
    ],
  }),
  domein({
    volgnummer: 4,
    naam: "Performance, monitoring en kwaliteit",
    omschrijving: "AI-impact meting, kwaliteitsmonitoring, testing en feedbackloops",
    vragen: [
      "We meten structureel de impact van AI op KPI's (FCR, AHT, CSAT, NPS, containment, QA).",
      "We monitoren AI-kwaliteit continu (hallucinaties, foutclassificaties, regressie, drift) en sturen bij.",
      "Er is een formeel test- en releaseproces voor AI (denk aan A/B test en rollback).",
      "We hebben een feedbackloop vanuit agents/QA naar model- en kennisverbetering.",
      "We kunnen verklaren waarom AI tot een bepaald advies/antwoord komt (uitlegbaarheid waar nodig).",
    ],
  }),
  domein({
    volgnummer: 5,
    naam: "Mensen, skills en adoptie",
    omschrijving: "Training, vaardigheden, adoptie en vertrouwen in AI",
    vragen: [
      "Onze medewerkers zijn getraind in effectief werken met AI (prompting, verificatie, escalatie).",
      "Supervisors/QA/WFM hebben vaardigheden om AI-output te beoordelen en processen aan te passen.",
      "Verandering en adoptie worden actief gemanaged (communicatie, incentives, begeleiding).",
      "Medewerkers vertrouwen AI en ervaren dat het hun werk makkelijker/beter maakt.",
      "Rollen en verantwoordelijkheden rondom AI (product owner, Kennis eigenaar, risk, IT) zijn helder belegd.",
    ],
  }),
  domein({
    volgnummer: 6,
    naam: "Security, risk en compliance",
    omschrijving: "Security-by-design, privacy, data-retentie en human-in-the-loop",
    vragen: [
      "Security-by-design is standaard bij AI (toegangsbeheer, secrets, encryptie, vendor controls).",
      "Privacy-impact (DPIA/PIA) en dataminimalisatie zijn geregeld voor AI-use-cases.",
      "We hebben duidelijke afspraken over data-retentie, trainingdata, en vendor gebruik van data.",
      "We kunnen incidenten met AI (fout advies, datalek, compliance) snel detecteren en afhandelen.",
      "We hebben beleid voor menselijk toezicht (human-in-the-loop) bij hoog-risico interacties.",
    ],
  }),
  domein({
    volgnummer: 7,
    naam: "Operating model en schaalbaarheid",
    omschrijving: "Delivery model, lifecycle management, schaling en bouwblokken",
    vragen: [
      "We hebben een herhaalbaar delivery model voor AI (van idee → pilot → productie → optimalisatie).",
      "AI-producten hebben lifecycle management (roadmap, budget, ownership, onderhoud).",
      "We schalen succesvolle AI-oplossingen organisatie breed (niet team- of kanaalgebonden).",
      "We werken met standaard bouwblokken (RAG/kennis, MCP/datakoppeling, analytics, orchestration, guardrails).",
      "We evalueren leveranciers/technologie op basis van vaste criteria (kwaliteit, kosten, risico, lock-in).",
    ],
  }),
  domein({
    volgnummer: 8,
    naam: "Klant- en kanaalervaring",
    omschrijving: "Consistentie, transparantie, escalatie en klantperceptie",
    vragen: [
      "AI-ervaring is consistent over kanalen (tone of voice, kennis, policies).",
      'Klanten krijgen duidelijke keuze en transparantie bij AI (bijv. "Contact met medewerker").',
      "Escalatie naar mens is soepel, met contextoverdracht (samenvatting, intent, historie).",
      "We meten klantperceptie van AI (vertrouwen, duidelijkheid, oplossend vermogen).",
      "We sturen actief op inclusiviteit/toegankelijkheid (taalniveau, beperkingen, accent/spraak).",
    ],
  }),
];

export const assessmentAi = {
  id: "ai-volwassenheid",
  naam: "AI-Volwassenheid in Klantcontact",
  subtitel: "±20 minuten. Helder inzicht. Direct vervolgstappen.",
  beschrijving:
    "Deze assessment geeft inzicht in hoe volwassen jouw organisatie is in het inzetten van AI binnen klantcontact. Je krijgt zicht op sterke punten, ontwikkelgebieden en waar gerichte vervolgstappen nodig zijn.",
  doelgroep:
    "Organisaties die AI inzetten of overwegen en willen weten waar ze staan én wat de volgende stap is.",
  icoon: "🤖",
  geschatteDuur: "±20 minuten",
  categorieen: null,
  bouwblokken,
  scoresPerGroepGesorteerd: true,
  schaal: [
    { waarde: 1, label: "Niet aanwezig" },
    { waarde: 2, label: "Deels / incidenteel" },
    { waarde: 3, label: "Aanwezig en meestal toegepast" },
    { waarde: 4, label: "Structureel geborgd en gemeten" },
    { waarde: 5, label: "Geoptimaliseerd en continu verbeterd" },
  ],
  organisatieVeldenRef: "organisatieVelden",
  featureCards: [
    { titel: "8 AI-domeinen", tekst: "Van strategie tot klantervaring, het volledige AI-landschap in kaart." },
    { titel: "Visueel Rapport", tekst: "Radar- en staafdiagrammen, sterktes en verbeterkansen in één oogopslag." },
    { titel: "±20 minuten", tekst: "40 vragen, compact in te vullen." },
  ],
  praktischeInfo: [
    "Invultijd: ±20 minuten, in eigen tempo te onderbreken.",
    "Direct resultaat: zodra de laatste vraag is beantwoord, staat het rapport klaar.",
    "Privacy: antwoorden blijven binnen de organisatie, geen individuele beoordeling.",
  ],
};
