# Content: Zorgscan (Klantcontact Volwassenheid – Zorg)

Vragen en tags voor het `Assessment`-object "Klantcontact Volwassenheid –
Zorg" (`id: "zorgscan"`, `kortLabel: "Volwassenheidsscan Zorg"`, `icoon:
"🩺"` — stethoscoop, gekozen door Joost boven een hartje-outline, zie
`datamodel.md`, `Assessment.icoon`; zie `export-pdf-visual-zorgscan.md`
voor de PDF-bestandsnaam die daaruit volgt): 15 bouwblokken, 5
categorieën, 60 vragen op de 1–5-schaal uit `datamodel.md`. Sector-variant
van "Klantcontact Volwassenheid" (`afgeleidVanAssessmentId:
"klantcontact-volwassenheid"`, zie `datamodel.md`, Sector-varianten): Zelfde
structuur, bouwblokken, categorieën en volgorde als het template, met
twee verschillen: De vraagteksten zijn herschreven naar patiënt-/
cliëntcontact en naar medische/niet-medische contactredenen, en drie
bouwblokken hebben een zwaarder gewicht (zie Weging hieronder).

**Bron**: Joost, aangeleverd als PDF-export ("Volwassenheidsmodel
Klantcontact – Resultaten") en CSV-export van een proefinvulling voor een
fictieve huisartsenpraktijk (alle antwoorden op 2, "Deels / incidenteel",
puur om de vraagteksten door te nemen — geen echte meting).

**Open punt, terug te leggen bij Joost**: Bouwblok-naam, -omschrijving,
-toelichting en -tags staan hieronder nog identiek aan de generieke
Klantcontact Volwassenheidsscan (`content-klantcontact-volwassenheid.md`).
In de brontekst van Joost stond de expliciete notitie "LET OP: Terminologie
in toelichtingenbalkje bovenaan de pagina nog wel aanpassen op zorg(taal)"
— die sectorvertaling van de intro-/toelichtingteksten (en van de
overlay-toelichting die een respondent opent via het icoon naast de titel)
is dus bewust nog niet gemaakt, alleen de 60 vraagteksten zijn af en
overgenomen.

**Tijdelijk, tot die sectorvertaling er is**: De toelichting-overlay en de
PDF-export tonen per bouwblok wél de volledige rijke content (eyebrow,
"CENTRALE VRAAG"-blok, beschrijving) — maar dat is letterlijk dezelfde
tekst als bij de Klantcontact Volwassenheidsscan, gematcht op
`volgnummer` in plaats van op een eigen zorg-versie. Zonder deze
hergebruik-stap ontbrak die content voor de Zorgscan volledig. Zodra er
een zorg-versie van `visie-coniche.md` deel 2 komt, vervangt die dit
hergebruik.

**Weging.** Drie bouwblokken tellen in deze scan dubbel mee in de
categoriescore en in de overall-score (`Bouwblok.gewicht = 2`, zie
`datamodel.md`, Bouwblok en Scoreberekening). De nummers zijn de
`volgnummer`s van de bouwblokken:

- 4 Leren uit Klantcontact
- 10 Kanaalmanagement
- 11 Performance Management

Alle andere bouwblokken hebben gewicht `1`. De Zorgscan was een beta; als
een gewicht later verandert (bijvoorbeeld naar 1,3), dan rekent dat in
één keer door in alle ingevulde scans, zie `datamodel.md`. De oude tool
paste deze weging niet toe: Bij geïmporteerde Zorgscans staat daar overal
gewicht 1, zie `import-scans.md`.

De wegingskaart bij aanvang van de scan (CLAUDE.md, sectie 3) gebruikt
voor deze scan de volgende tekst (`Assessment.wegingTitel` en
`wegingToelichting`):

- Titel: "Gewogen scoring voor de zorgsector"
- Tekst: "Binnen dit assessment wegen niet alle bouwblokken even zwaar mee
  in de totaalscore. Vanuit zorginhoudelijk perspectief zijn drie
  bouwblokken extra bepalend voor kwaliteit, veiligheid en
  schaalbaarheid van klant- en patiëntcontact:" gevolgd door de lijst met
  bouwblokken en hun factor (de lijst volgt uit de gewichten, niet uit
  deze tekst).

### Overkoepelend (oranje)

**1. Organisatiestrategie**
> Wat zijn de belangrijkste korte en langere termijn strategische
> organisatiedoelen en -plannen
Tags: Missie en visie, Kernwaarden / brand values, Korte- en langetermijn
groei- en ontwikkelplannen, Visie op werkgeverschap
1. Is er een actueel strategiedocument (max. 2 jaar oud) waarin
   missie/visie/kernwaarden én 3–7 strategische doelen staan?
2. Zijn die strategische doelen in protocollen en/of werkinstructies
   vertaald naar meetbare doelen met streefwaarden en een eigenaar per
   doel?
3. Is er een vast ritme (minimaal per kwartaal) waarin de voortgang op
   strategische doelen wordt besproken en besluiten worden vastgelegd?
4. Is er een vastgelegd expertise-/capaciteitsplan (minimaal voor 12
   maanden vooruit) dat aansluit op de strategie (werving, training,
   leiderschap)?

**2. Klantcontact visie & strategie**
> In hoeverre is de klantcontactstrategie ondersteunend aan de
> organisatiestrategie? Welke servicewaarden zijn daarbij leidend?
Tags: Visie op klantcontact, Servicewaarden, Korte- en langetermijn groei-
en ontwikkelplannen, Strategische roadmap, Visie op werkgeverschap (binnen CC)
1. Is er een vastgelegde visie en -strategie op patiënt- of cliëntcontact
   (max. 2 jaar oud) die expliciet verwijst naar de organisatiedoelen?
2. Zijn waarden rondom patiënt- of cliëntcontact vastgelegd én
   doorvertaald naar minimaal 5 concrete gedrags-/beslisregels (bijv.
   compensatie, escalatie, uitzonderingen)?
3. Is er een plan van aanpak rondom patiënt- of cliëntcontact (6–18
   maanden) met geprioriteerde initiatieven, eigenaar, planning en
   afhankelijkheden?
4. Is er een expliciete categorie- of groepsindeling waarin per segment de
   doelstelling en kanaalvoorkeur is beschreven?

### Organisatie (blauw)

**3. Structuur & Sturing**
> Zijn het huidige organisatiestructuur en besturingsmodel ondersteunend
> aan de klantcontact-strategie en servicewaarden?
Tags: Structuur/hiërarchie van klantcontact organisatie, Rollen en
verantwoordelijkheden, Governance (o.a. MT, overlegstructuren,
besluitvorming), Mandaat en eigenaarschap, Performance Indicatoren /
KPI-huis, Reporting en dashboards
1. Is er een actueel organogram + rolbeschrijvingen voor patiënt- of
   cliëntcontact waarin mandaat en verantwoordelijkheden per rol staan?
2. Is er een vaste overlegstructuur (wekelijks/maandelijks/kwartaal) met
   agenda, doelstellingenoverzicht en besluitlog (actielijst met eigenaar
   en datum)?
3. Bestaat er een formele afsprakenset rondom de doelstellingen voor
   contact (patiënt/cliënt, kwaliteit, efficiency, medewerker, kosten) met
   definities en databronnen?
4. Zijn dashboards/rapportages voor klantcontact minimaal wekelijks
   beschikbaar en worden ze aantoonbaar gebruikt (notulen/acties)?

**4. Leren uit Klantcontact**
> In hoeverre leert de organisatie structureel van klantcontact
> (contactredenen, feedback, fouten) en vertaalt dit naar verbeteringen?
Tags: Contact drivers, VOC (Voice of Customer), Continuous improvement,
Root cause analysis, Closed feedback loop, Verbeterbacklog
1. Worden medische en niet-medische contactredenen consequent vastgelegd
   in een (ticket-)systeem met eenduidige definities en training?
2. Is er een vaste analysecyclus (minimaal maandelijks) waarin successen
   en trends worden besproken met het hele team?
3. Is er een verbeterbacklog met prioritering (impact/effort), eigenaar,
   status en evaluatie van gerealiseerde benefits?
4. Is er een closed-loop terugkoppeling: verbeteringen resulteren
   aantoonbaar in updates in kennis/training/proces?

**5. Financial control**
> In hoeverre is de financiële huishouding van de klantcontactorganisatie
> inzichtelijk en op orde?
Tags: Inzicht in CC kosten en bijdragen
1. Is er een gespecificeerd patiënt- of cliëntcontactbudget (mensen,
   middelen, leveranciers) en wordt realisatie minimaal per maand
   bijgehouden?
2. Zijn kosten per kanaal of per type contact inzichtelijk (desnoods via
   berekening op volume x kostprijs)?
3. Worden kosten, baten, risico's voor verbeterinitiatieven vastgelegd
   (business cases) en achteraf geëvalueerd op realisatie?
4. Is er een scenario-aanpak (forecast) voor capaciteit en kosten
   (minimaal per kwartaal herijkt)?

**6. Positionering klantcontact**
> Welke rol speelt klantcontact in de organisatie en wat is de slagkracht?
Tags: Plaats van klantcontact in organigram, Interne zichtbaarheid
klantcontact (afdeling) / PR, Stakeholder management, Interne slagkracht
klantcontact afdeling, "seat at the table"
1. Is patiënt- en cliëntcontact structureel vertegenwoordigd in
   besluitvormende overleggen die impact hebben (bijv. zorg/IT,
   zorg/facilitair of zorg/administratie)?
2. Is er een vast escalatie- en besluitpad waarmee klantcontact issues in
   de keten kan oplossen (met eigenaren buiten CC)?
3. Worden inzichten uit patiënt- en cliëntcontact periodiek gedeeld met de
   organisatie (rapportage/presentatie) en leidt dat aantoonbaar tot
   acties?
4. Is er een duidelijke service owner/afsprakenstelsel voor end-to-end
   service (wie bewaakt kwaliteit/ervaring over teams heen)?

### Proces & Tech (paars)

**7. Systemen & Tools**
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

**8. Workforce Management**
> In hoeverre is de planning/capaciteit goed ingericht om servicelevels te
> halen tegen acceptabele kosten?
Tags: Forecasting, Capaciteitsplanning, Roostering, Intra-day management,
Shrinkage, Skill-based routing, Servicelevel/ASA/abandonment
1. Worden volumes en workload structureel voorspeld (minimaal maandelijks)
   en vergeleken met realisatie (forecast vs actual)?
2. Is er een dagelijks proces met monitoring en bijstuuracties (afspraken)
   om doelstellingen te halen?
3. Worden shrinkage-categorieën (verlof, training, verzuim, meetings)
   structureel gemeten en gepland met targets?
4. Worden roosters en competenties afgestemd op kanaalkeuze en vereiste
   competenties en is dat aantoonbaar ingericht in werkwijze en
   werkinstructies?

**9. Kennismanagement**
> In hoeverre is kennis vastgelegd, onderhouden en vindbaar zodat
> medewerkers en klanten snel het juiste antwoord krijgen?
Tags: Kennisstructuur/taxonomie, Ownership (knowledge owners), Content
lifecycle, Zoekbaarheid, Kenniskwaliteit, Selfservice content
1. Is er één centrale kennisbank (intern en/of extern) met duidelijke
   structuur/categorieën die aansluit op medische en op niet-medische
   contactredenen?
2. Is kennis-eigenaarschap ingericht mbt medische en niet-medische
   contactredenen en bestaat er een reviewcyclus (bijv. elke 3–6
   maanden)?
3. Is er een proces om nieuwe kennis te maken/actualiseren op basis van
   issues/changes (intake → review → publicatie)?
4. Wordt kennisgebruik gemeten (views/search/no-result/feedback) en
   worden protocollen en werkinstructies aantoonbaar verbeterd op basis
   van data?

**10. Kanaalmanagement**
> In hoeverre is de kanaalstrategie (voice, mail, chat, messaging,
> selfservice) bewust ingericht en optimaal gemanaged?
Tags: Kanaalstrategie, Kanaalshift, Routing & triage, Selfservice,
Omnichannel customer experience, Kanaalperformance
1. Is er een vastgelegde kanaalstrategie waarin per medische en
   niet-medische contactreden minimaal één voorkeurskanaal is benoemd
   (incl. uitzonderingen)?
2. Zijn niet-medische routeringsregels/triage vastgelegd en wordt
   kanaaleffectiviteit minimaal maandelijks gemonitord?
3. Is selfservice ingericht (FAQ/helpcenter/chatbot of formulieren) en
   worden de effecten hiervan gemeten?
4. Kan een klant kanaalwisselen zonder opnieuw alles uit te leggen
   (context mee via case/ticket-ID en zichtbare historie)?

### Mens (groen)

**11. Performance Management**
> In hoeverre wordt performance van medewerkers en teams structureel
> gemeten, besproken en verbeterd?
Tags: Doelen en KPI's op team/individu, Ritme van performance gesprekken,
Coaching-on-the-job, Transparantie in performance, Kwaliteit vs kwantiteit
balans, Feedback cultuur
1. Heeft iedere medewerker een set vastgelegde doelen (minimaal 3) die
   periodiek worden bijgewerkt?
2. Is er een vast kwaliteitsproces (QA) met steekproeven, calibratie en
   vastgelegde kwaliteitscriteria?
3. Vinden er structurele 1-op-1's/coachinggesprekken plaats volgens vast
   ritme (minimaal maandelijks) met vastlegging van afspraken?
4. Is er een formele verbeterroute voor onderperformance (plan,
   termijnen, support, evaluatie) die ook daadwerkelijk wordt toegepast?

**12. Learning & Development**
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
4. Worden leerinterventies geëvalueerd op effect (minimaal 1 van gestelde
   doelen) en wordt het programma daarop aangepast?

**13. Employee Engagement**
> In hoeverre is er aandacht voor betrokkenheid, welzijn en duurzame
> inzetbaarheid binnen klantcontact?
Tags: Medewerkerstevredenheid, Bevlogenheid, Verzuim / welzijn, Retentie,
Psychologische veiligheid, Erkenning en waardering
1. Wordt medewerkerstevredenheid structureel gemeten (minimaal 2x per
   jaar of via pulses) en worden resultaten gedeeld?
2. Is er een concreet actieplan op betrokkenheid/welzijn met eigenaar en
   deadlines, en wordt voortgang periodiek besproken?
3. Worden verzuim- en verloopcijfers structureel gemonitord (minimaal
   maandelijks) en gekoppeld aan oorzaakanalyse?
4. Zijn er aantoonbare interventies voor duurzame inzetbaarheid (bijv.
   roosterkeuzes, werkdrukmaatregelen, coaching) met monitoring?

**14. Leiderschap**
> In hoeverre is het leiderschap binnen klantcontact effectief en in lijn
> met de gewenste cultuur en prestaties?
Tags: Leiderschapsstijl, Voorbeeldgedrag, Coachend leiderschap,
Besluitvaardigheid, Stakeholder management, Teamontwikkeling
1. Is er een vast ritme waarin teamleads prestaties en ontwikkeling met
   hun teams bespreken (teammeetings + 1-op-1's)?
2. Is er een vastgelegde set verwachtingen/competenties voor
   leidinggevende(n) (rolprofiel) en worden die ook beoordeeld/
   ontwikkeld?
3. Is er een structureel overleg met belangrijke stakeholders buiten
   klantcontact (zorg/IT/facilitair) met besluiten en opvolging?
4. Is er opvolgingsplanning in de HR-cyclus: jaargesprek,
   functioneringsgesprek of beoordelingsgesprek (minimaal jaarlijks) voor
   sleutelrollen binnen patiënten- of cliëntencontact?

### Fundament (antraciet)

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
4. Is er een meetinstrument voor cultuur/veiligheid (minimaal 1x per
   jaar) en is er opvolging met acties en terugkoppeling?
