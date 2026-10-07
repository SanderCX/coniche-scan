# Content: AI-Volwassenheid in Klantcontact

Vragen voor het `Assessment`-object "AI-Volwassenheid in Klantcontact": 8
domeinen, 40 vragen (5 per domein), op dezelfde 1–5-schaal als de
Klantcontact Volwassenheidsscan. Beschrijving en centrale vraag per
domein (`Bouwblok.toelichting` en `Bouwblok.centraleVraag`,
`datamodel.md`): `visie-ai-klantcontact.md`.

## Verschillen met de Klantcontact Volwassenheidsscan

- **Geen categorieën**: De 8 domeinen staan plat onder elkaar in de
  sidebar. In de UI heten bouwblokken hier "domeinen". Zie
  `datamodel.md` (`categorieen` is optioneel).
- **Geen tags**: Geen van de domeinen heeft een tags-rij.
- **Scores gesorteerd**: "Scores per Domein" op het resultatenscherm is
  gesorteerd van hoog naar laag (`scoresPerGroepGesorteerd: true`).

## Assessment-gegevens

- Naam: "AI-Volwassenheid in Klantcontact"
- Subtitel: "±20 minuten. Helder inzicht. Direct vervolgstappen."
- Bouwblok-label (`Assessment.bouwblokLabel`): "AI-domein". De eyebrow in
  de Toelichtingsmodal wordt daarmee "AI-DOMEIN 2" (zonder categorienaam,
  want er zijn geen categorieën).
- Beschrijving: "Deze assessment geeft inzicht in hoe volwassen jouw
  organisatie is in het inzetten van AI binnen klantcontact. Je krijgt
  zicht op sterke punten, ontwikkelgebieden en waar gerichte
  vervolgstappen nodig zijn."
- Doelgroep: "Organisaties die AI inzetten of overwegen en willen weten
  waar ze staan én wat de volgende stap is."
- Geschatte duur: ±20 minuten, overal hetzelfde.
- Feature-cards: "8 AI-domeinen", "Visueel Rapport" en een derde kaart
  die nog gekozen moet worden (geen AI-samenvatting, die is voor nu
  geschrapt).

---

## De 8 domeinen

**1. Strategie en governance**
> AI-visie, governance, prioritering, ethiek en compliance
1. We hebben een duidelijke AI-visie en strategie die is gekoppeld aan
   klant- en bedrijfsdoelen.
2. Er is een formele AI-governance ingericht (rollen, besluitvorming,
   escalatie, eigenaarschap).
3. AI-initiatieven worden geprioriteerd via een vaste businesscase-
   methodiek (waarde, risico, effort).
4. Responsible AI/ethiek (bias, transparantie, human in the loop) is
   uitgewerkt in beleid en wordt toegepast.
5. We voldoen aantoonbaar aan relevante wet- en regelgeving
   (privacy/security/AI-regels) in onze AI-toepassingen.

**2. Data, integratie en architectuur**
> Datakwaliteit, ontsluiting, datamodel, kennisbasis en logging
1. De kwaliteit van onze klantcontactdata (CRM, ticketing, Kennis,
   call/chat transcripts) is voldoende voor AI.
2. Data is goed ontsloten en geïntegreerd over kanalen heen
   (voice/chat/mail/social) voor AI-toepassingen.
3. We hebben een beheerd datamodel en definities (bijv. intent, contact
   reason, outcome) die breed gebruikt worden.
4. We hebben een robuuste kennisbasis (content lifecycle, eigenaarschap,
   actualiteit) die AI kan gebruiken.
5. Logging en datatraceerbaarheid (wat gebeurde wanneer, met welke input)
   is goed geregeld.

**3. Use-cases en automatisering**
> Live AI use-cases, agent assist, automatisering en procesintegratie
1. We hebben AI-use-cases live die aantoonbaar waarde leveren (kosten,
   CX, kwaliteit, medewerker).
2. AI wordt ingezet voor zowel klantinteractie (selfservice) als
   agent-ondersteuning (Agent assist).
3. Automatisering (bijv. intentherkenning, samenvatten, classificeren,
   next-best-action) is uitgerold.
4. We hebben duidelijke criteria wanneer we wel/niet automatiseren
   (complexiteit, risico, klantimpact).
5. End-to-end procesintegratie (van contact naar afhandeling) is
   ingericht, niet alleen "losse AI pilots".

**4. Performance, monitoring en kwaliteit**
> AI-impact meting, kwaliteitsmonitoring, testing en feedbackloops
1. We meten structureel de impact van AI op KPI's (FCR, AHT, CSAT, NPS,
   containment, QA).
2. We monitoren AI-kwaliteit continu (hallucinaties, foutclassificaties,
   regressie, drift) en sturen bij.
3. Er is een formeel test- en releaseproces voor AI (denk aan A/B test en
   rollback).
4. We hebben een feedbackloop vanuit agents/QA naar model- en
   kennisverbetering.
5. We kunnen verklaren waarom AI tot een bepaald advies/antwoord komt
   (uitlegbaarheid waar nodig).

**5. Mensen, skills en adoptie**
> Training, vaardigheden, adoptie en vertrouwen in AI
1. Onze medewerkers zijn getraind in effectief werken met AI (prompting,
   verificatie, escalatie).
2. Supervisors/QA/WFM hebben vaardigheden om AI-output te beoordelen en
   processen aan te passen.
3. Verandering en adoptie worden actief gemanaged (communicatie,
   incentives, begeleiding).
4. Medewerkers vertrouwen AI en ervaren dat het hun werk makkelijker/beter
   maakt.
5. Rollen en verantwoordelijkheden rondom AI (product owner, Kennis
   eigenaar, risk, IT) zijn helder belegd.

**6. Security, risk en compliance**
> Security-by-design, privacy, data-retentie en human-in-the-loop
1. Security-by-design is standaard bij AI (toegangsbeheer, secrets,
   encryptie, vendor controls).
2. Privacy-impact (DPIA/PIA) en dataminimalisatie zijn geregeld voor
   AI-use-cases.
3. We hebben duidelijke afspraken over data-retentie, trainingdata, en
   vendor gebruik van data.
4. We kunnen incidenten met AI (fout advies, datalek, compliance) snel
   detecteren en afhandelen.
5. We hebben beleid voor menselijk toezicht (human-in-the-loop) bij
   hoog-risico interacties.

**7. Operating model en schaalbaarheid**
> Delivery model, lifecycle management, schaling en bouwblokken
1. We hebben een herhaalbaar delivery model voor AI (van idee → pilot →
   productie → optimalisatie).
2. AI-producten hebben lifecycle management (roadmap, budget, ownership,
   onderhoud).
3. We schalen succesvolle AI-oplossingen organisatie breed (niet team- of
   kanaalgebonden).
4. We werken met standaard bouwblokken (RAG/kennis, MCP/datakoppeling,
   analytics, orchestration, guardrails).
5. We evalueren leveranciers/technologie op basis van vaste criteria
   (kwaliteit, kosten, risico, lock-in).

**8. Klant- en kanaalervaring**
> Consistentie, transparantie, escalatie en klantperceptie
1. AI-ervaring is consistent over kanalen (tone of voice, kennis,
   policies).
2. Klanten krijgen duidelijke keuze en transparantie bij AI (bijv.
   "Contact met medewerker").
3. Escalatie naar mens is soepel, met contextoverdracht (samenvatting,
   intent, historie).
4. We meten klantperceptie van AI (vertrouwen, duidelijkheid, oplossend
   vermogen).
5. We sturen actief op inclusiviteit/toegankelijkheid (taalniveau,
   beperkingen, accent/spraak).
