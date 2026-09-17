# Coniche Scan — Projectspecificatie

Herbouw van de klantcontact-volwassenheidsscan (voorheen "Volwassenheidsmodel
Klantcontact"). Geen code hergebruikt uit de oude versie, wel de volledige
content en scoringslogica, gereconstrueerd uit screenshots en het PDF-rapport
van de oude app. Doel van vandaag: een doorloopbaar werkend prototype,
gebouwd zodat de eisen van morgen (instelbare velden, meerdere respondenten
per organisatie) er niet als losse laag overheen hoeven, maar al in het
datamodel zitten.

## Kernprincipe voor vandaag

Bouw de flow generiek over data heen, niet met hardcoded schermen per
bouwblok. Bouwblokken, vragen, schaal-labels en organisatievelden zijn data
(zie hieronder), geen componentstructuur. Dat is het verschil tussen "morgen
een beheerscherm bouwen dat deze JSON bewerkt" en "morgen alles overnieuw".

Wat vandaag WEL gebouwd wordt: de volledige doorloopflow, met de content van
de Klantcontact Volwassenheidsscan (dit document) als eerste en enige
ingevulde assessment-type.

Wat vandaag NIET gebouwd wordt (bewust uitgesteld):
- AI-gegenereerde managementsamenvatting (placeholder in UI is prima, geen
  API-integratie)
- Beheerscherm om velden/vragen te bewerken (de JSON-structuur moet er wel
  al staan, het scherm erboven niet)
- Aggregatie van scores over meerdere respondenten (gemiddelde/spreiding
  binnen één organisatie) — nader uit te werken, nu alleen het datamodel zo
  bouwen dat het niet in de weg zit
- PDF/CSV-export (knoppen mogen aanwezig zijn, functionaliteit later)
- Echte backend/auth — voor vandaag localStorage + hardcoded content

## Rolverdeling vandaag

- Sander: richt Claude Code in, bouwt de scaffold en de flow
- Joost: content en datamodel (dit document), comms

---

## 1. Datamodel

### Assessment (scan-type)

Er is straks meer dan één scan-type (Klantcontact Volwassenheid, Zorg-variant,
AI-Volwassenheid, later een Adoptiescan). Bouw dus geen vaste lijst
bouwblokken in de flow-logica, maar een `Assessment`-object waar de intake-
en doorloopflow generiek doorheen navigeert.

```
Assessment {
  id: string
  naam: string                    // bijv. "Klantcontact Volwassenheid"
  subtitel: string                // "±30 minuten. Heldere inzichten. Direct verbeterkansen."
  beschrijving: string
  doelgroep: string                // "MT, operations en CX-verantwoordelijken..."
  icoon: string
  geschatteDuur: string             // "±30 minuten"
  categorieen: Categorie[]
  schaal: SchaalLabel[5]            // globaal per Assessment, zie sectie 3
  organisatieVelden: VeldDefinitie[] // zie sectie 2
}
```

### Categorie

```
Categorie {
  id: string
  naam: string                     // "Overkoepelend", "Organisatie", "Proces & Tech", "Mens", "Fundament"
  kleur: string                    // accentkleur, zie sectie 4
  volgorde: number
  bouwblokken: Bouwblok[]
}
```

### Bouwblok

```
Bouwblok {
  id: string
  volgnummer: number               // 1 t/m 15, doorlopend over alle categorieën
  naam: string
  omschrijving: string             // de vraagzin onder de titel
  tags: string[]                   // variabel aantal! Financial control heeft er maar 1, andere 5-6
  vragen: Vraag[]                  // steeds 4 in de huidige scan, maar niet hardcoded aannemen
}
```

### Vraag

```
Vraag {
  id: string
  volgnummer: number               // 1 t/m 4 binnen het bouwblok
  tekst: string
}
```

### SchaalLabel

Vaste 1–5-schaal, globaal ingesteld per Assessment (dus voor de hele
Klantcontact Volwassenheidsscan identiek over alle 60 vragen — bij een
toekomstige AI-scan of Adoptiescan mag dit een andere set zijn):

```
1: Niet aanwezig
2: Deels / incidenteel
3: Aanwezig en meestal toegepast
4: Structureel geborgd en gemeten
5: Geoptimaliseerd en continu verbeterd
```

### Organisatie (scan-instantie, aangemaakt door Coniche in beheer)

Dit is de grote wijziging ten opzichte van de oude versie: een scan wordt
aangemaakt op organisatieniveau door Coniche, met vaste kenmerken die de
respondenten niet mogen aanpassen, en respondenten worden per e-mailadres
uitgenodigd.

```
Organisatie {
  id: string
  assessmentId: string
  naam: string
  kenmerken: { [veldId: string]: waarde }   // ingevuld door Coniche, read-only voor respondenten
  respondenten: Respondent[]
}
```

`kenmerken` volgt de `organisatieVelden`-lijst van het Assessment
(instelbaar in beheer, zie sectie 2). Voor vandaag: hardcode de veldenlijst
uit sectie 2 als data, het beheerscherm erboven hoeft nog niet te bestaan.

### Respondent

```
Respondent {
  id: string
  organisatieId: string
  email: string                    // enige verplichte veld bij uitnodigen
  naam: string                     // door respondent zelf ingevuld
  rol: string
  team: string                     // optioneel
  notities: string                 // optioneel
  antwoorden: { [vraagId: string]: number }  // 1-5
  opmerkingenPerBouwblok: { [bouwblokId: string]: string }
  status: "uitgenodigd" | "bezig" | "afgerond"
  gestartOp: datetime
  afgerondOp: datetime | null
}
```

Let op: organisatienaam, sector/subsector etc. staan NIET meer in het
korte respondent-formulier (dat was de oude screenshot 4) — die liggen al
vast op het `Organisatie`-niveau voordat de respondent begint. Het
respondent-formulier bevat alleen nog: naam, rol/functie, team (optioneel),
notities (optioneel).

---

## 2. Organisatievelden (instelbaar in beheer, vandaag als vaste data)

Bron: intern rapport dat Coniche zelf samenstelt over klanten (zie
voorbeeld "4a"). Voor vandaag hardcoded als JSON-structuur, zodat er later
een beheerscherm overheen kan zonder de flow te herbouwen.

```
VeldDefinitie {
  id: string
  label: string
  type: "tekst" | "getal" | "select" | "select-met-verdeling" | "percentage" | "groep"
  opties?: string[]                // vaste antwoordcategorieën, indien van toepassing
  subvelden?: VeldDefinitie[]       // voor herhalende structuren, zie techstack hieronder
}
```

Veldengroepen uit het bronmateriaal:

**Volume en klantbasis**
- Totaal aantal klanten (getal, met B2B/B2C-verdeling als percentage)
- Totaal aantal contacten per jaar, per kanaal: Call, Voicebot, Livechat,
  Chatbot, E-mail, Whatsapp (elk een getal, "niet van toepassing" toegestaan)
- Adoptie mijnomgeving/app (percentage)

**Digitalisering**
- Percentage 2026 (getal)
- Ambitie 2030 (getal)

**Techstack** — zes herhalende structuren, elk met dezelfde twee subvelden
(leverancier, zelf/extern ondersteund):
- Contact center
- Conversational AI
- CRM
- Kennismanagement
- LLM-oplossing
- IT en deployment

Model dit dus als één herbruikbare `TechstackItem { categorie, leverancier,
ondersteuning: "zelf" | "extern" }`, niet als 12 losse velden.

**FTE**
- Klantcontact medewerkers (getal, met inhouse/BPO-verdeling)
- Klantcontact management & support (getal)
- IT DevOps medewerkers (getal, met percentage gericht op Digital)

**KPI's** — vaste set, elk een los numeriek veld: AHT, NPS, CSAT, SLA, FTR

---

## 3. Scoringslogica (herleid uit het PDF-rapport, niet los gedocumenteerd)

- **Bouwblokscore** = gemiddelde van de scores op de vragen binnen dat
  bouwblok, afgerond op 1 decimaal.
- **Categoriescore** = gemiddelde van de bouwblokscores binnen die
  categorie, afgerond op 1 decimaal.
- **Overall score** = gemiddelde van ALLE 15 bouwblokscores samen — dus
  NIET het gemiddelde van de 5 categoriescores. Geverifieerd met de
  voorbeelddata: gemiddelde van de 5 categoriescores geeft 2,5, maar het
  rapport toont 2,7, wat exact overeenkomt met het gemiddelde van alle 15
  bouwblokken. Categorieën met meer bouwblokken (Organisatie, Proces & Tech,
  Mens hebben er 4; Overkoepelend heeft er 2; Fundament heeft er 1) wegen
  dus niet gelijk mee als je via categoriegemiddelden zou rekenen — bouw dit
  bewust op bouwblok-niveau.
- **Afronding**: standaard "half-away-from-zero" (zoals JS `toFixed(1)`),
  zichtbaar aan 1,25 → 1,3 in de voorbeelddata.
- **Voortgang** = aantal beantwoorde vragen / totaal aantal vragen in de
  hele scan (dus op vraagniveau, niet op bouwblokniveau — geverifieerd: na
  bouwblok 1 stond de voortgang op 7% = 4/60, na 1 vraag in bouwblok 2 op
  8% = 5/60).
- **Bouwblok-status in sidebar**: drie staten — nog niet begonnen (grijs
  nummer), bezig (gevuld cirkeltje + "x/4" naast de titel), afgerond (groen
  vinkje).

### Classificatie (Basis op Orde / Uitbouwen / Sterk punt)

Legenda uit het resultatenscherm:
- Rood — "Basis op Orde": "De basis moet op dit punt eerst op orde gemaakt
  worden om verder te kunnen uitbouwen."
- Oranje — "Uitbouwen": "De basis is op orde en je bent onderweg, maar er
  is nog een verbeterstap nodig om richting excellent te gaan."
- Groen — "Sterk punt": "Hier is de organisatie al heel goed in. Benut dit
  optimaal en bouw het verder uit, ook ter ondersteuning van zwakkere
  bouwblokken."

Exacte cutoffs staan nergens expliciet, maar zijn deels te herleiden uit de
voorbeelddata op categorieniveau: 1,0 en 2,0 zijn rood, 3,0/3,3 zijn oranje.
Bouwblokniveau: 3,8/4,0/5,0 zijn bevestigd groen (via Top 3 Sterktes),
1,0/1,3 bevestigd rood (via Top 3 Verbeterkansen). Voor vandaag een
werkbare aanname: **< 2,5 rood, 2,5–3,49 oranje, ≥ 3,5 groen** — dit is een
aanname, geen bevestigd gegeven, en moet later worden geverifieerd of
gecorrigeerd zodra het functioneel ontwerp er nog bij gevonden wordt.

### Top 3 Sterktes / Top 3 Verbeterkansen

Simpelweg de 15 bouwblokken gesorteerd op score: hoogste 3 = Sterktes,
laagste 3 = Verbeterkansen.

---

## 4. Kleuren per categorie

Bevestigd over alle 15 bouwblokken in de interactieve doorloopflow (de
PDF-export gebruikt overigens overal oranje, ongeacht categorie — dat is
bewust anders, geen fout):

- Overkoepelend: oranje
- Organisatie: blauw
- Proces & Tech: paars
- Mens: groen
- Fundament: geel/goud

Exacte hex-waarden nog niet bevestigd — gebruik voorlopig standaard
Tailwind-tinten (orange-500, blue-500, purple-500, green-500, amber-500)
totdat de huisstijlkleuren van Coniche.nl bekend zijn.

---

## 5. Schermflow

1. **Kies jouw assessment** — landingspagina met kaarten per Assessment-type
   (voor vandaag: alleen Klantcontact Volwassenheid ingevuld, de kaarten-
   component moet wel generiek over `Assessment[]` heen werken)
2. **Assessment-landingspagina** — titel, hero, 3 feature-cards, "Praktische
   informatie"-blok met 4 punten (invultijd, direct resultaat, AI-samenvatting
   [placeholder], privacy)
3. **Voorbeeld-output preview** — dezelfde resultaatcomponenten als scherm 6,
   gevuld met vaste demo-data (`isPreview: true` of een aparte mock-dataset,
   zodat de resultaatcomponent maar één keer gebouwd hoeft te worden)
4. **Respondent-intake** — alleen naam, rol/functie, team (optioneel),
   notities (optioneel). Organisatiekenmerken liggen al vast op
   Organisatie-niveau, dus GEEN organisatienaam/sector/subsector-velden meer
   in dit scherm.
5. **Doorloopflow** — vaste sidebar (Coniche-logo, naam respondent,
   voortgangspercentage, 5 categorieën met genummerde bouwblokken, actieve
   bouwblok gemarkeerd, 3 statussen per bouwblok). Hoofdscherm per bouwblok:
   gekleurde kop met titel + omschrijving, tags, grijze instructieregel
   ("Beantwoord op basis van wat aantoonbaar geregeld is (documenten,
   ritmes, tooling, afspraken)."), 4 vragen met 5-punts radiobuttons, één
   opmerkingenveld onderaan (per bouwblok, niet per vraag). Knoptekst
   wisselt op het allerlaatste bouwblok van "Volgende" naar "Bekijk
   resultaten".
6. **Resultatenscherm** — overall score (groot getal + classificatie-cirkel
   + voortgang "60 van 60 vragen"), radar chart (alle 15 bouwblokken),
   staafdiagram per categorie (5 balken, kleur = classificatie niet
   categoriekleur), Top 3 Sterktes / Top 3 Verbeterkansen, legenda-blok met
   de 3 classificaties, export-knoppen (PDF/CSV — stub voor vandaag)

---

## 6. Volledige contentset — Klantcontact Volwassenheidsscan

15 bouwblokken, 5 categorieën, 60 vragen, allemaal op de globale 1–5-schaal
uit sectie 3.

### Overkoepelend (oranje)

**1. Organisatiestrategie**
> Wat zijn de belangrijkste korte en langere termijn strategische
> organisatiedoelen en -plannen
Tags: Missie en visie, Kernwaarden / brand values, Korte- en langetermijn
groei- en ontwikkelplannen, Visie op werkgeverschap
1. Is er een actueel strategiedocument (max. 2 jaar oud) waarin
   missie/visie/kernwaarden én 3–7 strategische doelen staan?
2. Zijn die strategische doelen vertaald naar meetbare KPI's/OKR's met
   streefwaarden en een eigenaar per doel?
3. Is er een vast ritme (minimaal per kwartaal) waarin de voortgang op
   strategische doelen wordt besproken en besluiten worden vastgelegd?
4. Is er een vastgelegd skills-/capaciteitsplan (minimaal voor 12 maanden
   vooruit) dat aansluit op de strategie (werving, training, leiderschap)?

**2. Klantcontact visie & strategie**
> In hoeverre is de klantcontactstrategie ondersteunend aan de
> organisatiestrategie? Welke servicewaarden zijn daarbij leidend?
Tags: Visie op klantcontact, Servicewaarden, Korte- en langetermijn groei-
en ontwikkelplannen, Strategische roadmap, Visie op werkgeverschap (binnen CC)
1. Is er een vastgelegde klantcontactvisie en -strategie (max. 2 jaar oud)
   die expliciet verwijst naar de organisatiedoelen?
2. Zijn servicewaarden vastgelegd én doorvertaald naar minimaal 5 concrete
   gedrags-/beslisregels (bijv. compensatie, escalatie, uitzonderingen)?
3. Is er een klantcontact-roadmap (6–18 maanden) met geprioriteerde
   initiatieven, eigenaar, planning en afhankelijkheden?
4. Is er een expliciete segment- of klantgroepindeling waarin per segment
   de servicebelofte en kanaalvoorkeur is beschreven?

### Organisatie (blauw)

**3. Structuur & Sturing**
> Zijn het huidige organisatiestructuur en besturingsmodel ondersteunend
> aan de klantcontact-strategie en servicewaarden?
Tags: Structuur/hiërarchie van klantcontact organisatie, Rollen en
verantwoordelijkheden, Governance (o.a. MT, overlegstructuren,
besluitvorming), Mandaat en eigenaarschap, Performance Indicatoren /
KPI-huis, Reporting en dashboards
1. Is er een actueel organogram + rolbeschrijvingen voor klantcontact
   waarin mandaat en verantwoordelijkheden per rol staan?
2. Is er een vaste overlegstructuur (wekelijks/maandelijks/kwartaal) met
   agenda, KPI-set en besluitlog (actielijst met owner en datum)?
3. Bestaat er een formeel KPI-huis voor klantcontact (klant, kwaliteit,
   efficiency, medewerker, kosten) met definities en databronnen?
4. Zijn dashboards/rapportages voor klantcontact minimaal wekelijks
   beschikbaar en worden ze aantoonbaar gebruikt (notulen/acties)?

**11. Leren uit klantcontact**
> In hoeverre leert de organisatie structureel van klantcontact
> (contactredenen, feedback, fouten) en vertaalt dit naar verbeteringen?
Tags: Contact drivers, VOC (Voice of Customer), Continuous improvement,
Root cause analysis, Closed feedback loop, Verbeterbacklog
1. Worden contactredenen (drivers) consequent vastgelegd in het
   ticketsysteem met eenduidige definities en training?
2. Is er een vaste analysecyclus (minimaal maandelijks) waarin topdrivers
   en trends worden besproken met owners buiten klantcontact?
3. Is er een verbeterbacklog met prioritering (impact/effort), eigenaar,
   status en evaluatie van gerealiseerde benefits?
4. Is er een closed-loop terugkoppeling: verbeteringen resulteren
   aantoonbaar in updates in kennis/training/proces?

**13. Financial control**
> In hoeverre is de financiële huishouding van de klantcontactorganisatie
> inzichtelijk en op orde?
Tags: Inzicht in CC kosten en bijdragen *(let op: dit bouwblok heeft maar 1
tag, tags-lijst is dus variabel qua lengte, niet vast aantal)*
1. Is er een gespecificeerd klantcontactbudget (mensen, tooling,
   leveranciers) en wordt realisatie minimaal per maand bijgehouden?
2. Zijn kosten per kanaal of per type contact inzichtelijk (desnoods via
   berekening op volume x kostprijs)?
3. Worden business cases voor verbeterinitiatieven vastgelegd (kosten,
   baten, risico's) en achteraf geëvalueerd op realisatie?
4. Is er een forecast-/scenario-aanpak voor capaciteit en kosten (minimaal
   per kwartaal herijkt)?

**14. Positionering klantcontact**
> Welke rol speelt klantcontact in de organisatie en wat is de slagkracht?
Tags: Plaats van klantcontact in organigram, Interne zichtbaarheid
klantcontact (afdeling) / PR, Stakeholder management, Interne slagkracht
klantcontact afdeling, "seat at the table"
1. Is klantcontact structureel vertegenwoordigd in besluitvormende
   overleggen die klantimpact hebben (bijv. product/IT change board)?
2. Is er een vast escalatie- en besluitpad waarmee klantcontact issues in
   de keten kan oplossen (met eigenaren buiten CC)?
3. Worden inzichten uit klantcontact periodiek gedeeld met de organisatie
   (rapportage/presentatie) en leidt dat aantoonbaar tot acties?
4. Is er een duidelijke service owner/afsprakenstelsel voor end-to-end
   service (wie bewaakt kwaliteit/ervaring over teams heen)?

### Proces & Tech (paars)

**4. Systemen & Tools**
> In hoeverre is de klantcontactorganisatie goed gefaciliteerd met de
> juiste systemen en tooling?
Tags: CRM/klantbeeld, Ticketing/Case management, Telefonie / CC platform,
Chat / messaging, Kennisbank tooling, Rapportage / BI tooling, Integraties
/ API's, Tooling-fit vs procesfit
1. Werkt klantcontact in één primair systeem voor cases/tickets (geen
   structurele parallelle Excel/losse mailbox-processen)?
2. Is er CTI/telefoonintegratie of een andere koppeling waardoor
   contactmomenten automatisch aan klant/case worden gekoppeld?
3. Is er een centraal klantbeeld beschikbaar tijdens het contact
   (historie, openstaande zaken, afspraken) zonder te wisselen tussen >2
   systemen?
4. Is er een beheerproces voor tooling (release/changes, rechten,
   integraties) inclusief owner en documentatie?

**6. Workforce Management**
> In hoeverre is de planning/capaciteit goed ingericht om servicelevels te
> halen tegen acceptabele kosten?
Tags: Forecasting, Capaciteitsplanning, Roostering, Intra-day management,
Shrinkage, Skill-based routing, Servicelevel/ASA/abandonment
1. Worden volumes en workload structureel voorspeld (minimaal maandelijks)
   en vergeleken met realisatie (forecast vs actual)?
2. Is er een intraday proces (dagelijks) met monitoring en bijstuuracties
   (playbook/afspraken) om SL/ASA te halen?
3. Worden shrinkage-categorieën (verlof, training, verzuim, meetings)
   structureel gemeten en gepland met targets?
4. Worden roosters/skills afgestemd op kanaal- en skillvraag
   (skill-based), en is dat aantoonbaar ingericht in tooling/werkwijze?

**10. Kennismanagement**
> In hoeverre is kennis vastgelegd, onderhouden en vindbaar zodat
> medewerkers en klanten snel het juiste antwoord krijgen?
Tags: Kennisstructuur/taxonomie, Ownership (knowledge owners), Content
lifecycle, Zoekbaarheid, Kenniskwaliteit, Selfservice content
1. Is er één centrale kennisbank (intern en/of extern) met duidelijke
   structuur/categorieën die aansluiten op contactredenen?
2. Is kennis-eigenaarschap ingericht (knowledge owners) en bestaat er een
   reviewcyclus (bijv. elke 3–6 maanden)?
3. Is er een proces om nieuwe kennis te maken/actualiseren op basis van
   issues/changes (intake → review → publicatie)?
4. Wordt kennisgebruik gemeten (views/search/no-result/feedback) en worden
   artikelen aantoonbaar verbeterd op basis van data?

**12. Kanaalmanagement**
> In hoeverre is de kanaalstrategie (voice, mail, chat, messaging,
> selfservice) bewust ingericht en optimaal gemanaged?
Tags: Kanaalstrategie, Kanaalshift, Routing & triage, Selfservice,
Omnichannel customer experience, Kanaalperformance
1. Is er een vastgelegde kanaalstrategie waarin per contactreden minimaal
   één voorkeurskanaal is benoemd (incl. uitzonderingen)?
2. Zijn routeringsregels/triage vastgelegd en wordt kanaalperformance
   minimaal maandelijks gemonitord (SL/CSAT/containment)?
3. Is selfservice ingericht (FAQ/helpcenter/chatbot of formulieren) en
   wordt deflection/containment gemeten?
4. Kan een klant kanaalwisselen zonder opnieuw alles uit te leggen
   (context mee via case/ticket-ID en zichtbare historie)?

### Mens (groen)

**5. Performance Management**
> In hoeverre wordt performance van medewerkers en teams structureel
> gemeten, besproken en verbeterd?
Tags: Doelen en KPI's op team/individu, Ritme van performance gesprekken,
Coaching-on-the-job, Transparantie in performance, Kwaliteit vs kwantiteit
balans, Feedback cultuur
1. Heeft iedere medewerker een set vastgelegde doelen (minimaal 3
   KPI's/verwachtingen) die periodiek worden bijgewerkt?
2. Is er een vast kwaliteitsproces (QA) met steekproeven, calibratie en
   vastgelegde kwaliteitscriteria?
3. Vinden er structurele 1-op-1's/coachinggesprekken plaats volgens vast
   ritme (minimaal maandelijks) met vastlegging van afspraken?
4. Is er een formele verbeterroute voor onderperformance (plan, termijnen,
   support, evaluatie) die ook daadwerkelijk wordt toegepast?

**7. Learning & Development**
> In hoeverre zijn onboarding, training en ontwikkeling structureel
> ingericht en passend bij de klantcontactstrategie?
Tags: Onboarding, Opleidingsplan, Skills matrix, Coaching & mentoring, LMS
/ leerplatform, Assessments / toetsen, 70-20-10 / blended learning
1. Is er een vast onboardingprogramma met modules, duur, leerdoelen en
   toetsing voordat iemand volledig zelfstandig draait?
2. Is er een actuele skills-matrix per rol/team waarin per skill een
   niveau is beschreven en medewerkers zijn ingeschaald?
3. Is er een vast leerplatform of centrale plek (LMS/KB) waar trainingen,
   content en voortgang worden beheerd?
4. Worden leerinterventies geëvalueerd op effect (minimaal 1 van:
   QA-score, AHT, FCR, CSAT) en wordt het programma daarop aangepast?

**8. Employee Engagement**
> In hoeverre is er aandacht voor betrokkenheid, welzijn en duurzame
> inzetbaarheid binnen klantcontact?
Tags: Medewerkerstevredenheid, Bevlogenheid, Verzuim / welzijn, Retentie,
Psychologische veiligheid, Erkenning en waardering
1. Wordt medewerkerstevredenheid structureel gemeten (minimaal 2x per jaar
   of via pulses) en worden resultaten gedeeld?
2. Is er een concreet actieplan op engagement/welzijn met owners en
   deadlines, en wordt voortgang periodiek besproken?
3. Worden verzuim- en verloopcijfers structureel gemonitord (minimaal
   maandelijks) en gekoppeld aan oorzaakanalyse?
4. Zijn er aantoonbare interventies voor duurzame inzetbaarheid (bijv.
   roosterkeuzes, werkdrukmaatregelen, coaching) met monitoring?

**9. Leiderschap**
> In hoeverre is het leiderschap binnen klantcontact effectief en in lijn
> met de gewenste cultuur en prestaties?
Tags: Leiderschapsstijl, Voorbeeldgedrag, Coachend leiderschap,
Besluitvaardigheid, Stakeholder management, Teamontwikkeling
1. Is er een vast ritme waarin teamleads prestaties en ontwikkeling met
   hun teams bespreken (teammeetings + 1-op-1's)?
2. Is er een vastgelegde set verwachtingen/competenties voor teamleads
   (rolprofiel) en worden die ook beoordeeld/ontwikkeld?
3. Is er een structureel overleg met key stakeholders buiten klantcontact
   (product/IT/operations) met besluiten en opvolging?
4. Is er opvolgingsplanning of talent-review (minimaal jaarlijks) voor
   sleutelrollen binnen klantcontact?

### Fundament (geel/goud)

**15. Cultuur**
> Hoe kan de heersende afdelingscultuur beschreven worden en in hoeverre
> is deze passend bij visie en strategie van de organisatie?
Tags: Cultuurbewustzijn, Klantcentriciteit, Growth / fixed mindset
1. Is er een expliciete set gedragsprincipes (bijv. klantgericht,
   eigenaarschap, samenwerken) die in onboarding en coaching terugkomt?
2. Bestaan er vaste rituelen om te leren van fouten/incidenten
   (retrospectives, blameless reviews) met vastgelegde verbeteracties?
3. Worden successen en goed klantgedrag structureel erkend (bijv.
   shout-outs, awards, storytelling) met zichtbaar ritme?
4. Is er een meetinstrument voor cultuur/veiligheid (minimaal 1x per jaar)
   en is er opvolging met acties en terugkoppeling?

---

## 7. Open punten / aannames om later te verifiëren

- Exacte cutoffs voor de rood/oranje/groen-classificatie (nu een aanname,
  zie sectie 3)
- Exacte hex-kleurcodes per categorie
- Hoe de aggregatie van meerdere respondenten per organisatie wordt getoond
  (gemiddelde, afwijking t.o.v. gemiddelde, spreiding hoog/laag) — bewust
  nog niet uitgewerkt
- Of "Rol / Functie" bij de respondent een vrij tekstveld blijft of een
  vaste lijst wordt
