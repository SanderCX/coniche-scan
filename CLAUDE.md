# Coniche Scan: Projectspecificatie

Doorlopende specificatie van de Coniche Scan-app: Uitgangspunten,
scoringslogica en schermflow, met verwijzingen naar het datamodel en de
opmaak. Het document groeit mee terwijl er
iteratief functionaliteit en nieuwe scans (assessment-types) bijkomen.
Waar het ambigu of onvolledig is, wordt dat hier opgelost.

## Bestanden

| Bestand | Inhoud |
|---|---|
| `CLAUDE.md` | Dit document. Uitgangspunten, scoring, schermflow |
| `datamodel.md` | Het datamodel: Deel 1 gebouwd, deel 2 (rollen, rechten, inlog) voorstel |
| `stylesheet.md` | Alle opmaak: Kleuren, typografie, componenten |
| `visie-coniche.md` | Visie op goed klantcontact en de vijftien bouwstenen |
| `inhoudelijk-fundament.md` | Hoe visie, bouwstenen en scan samenhangen, met status per onderdeel |
| `content-klantcontact-volwassenheid.md` | Vragen en tags van de Klantcontact Volwassenheidsscan |
| `content-ai-scan.md` | Vragen van de AI-volwassenheidsscan |
| `content-zorgscan.md` | Vragen van de Zorgscan, sector-variant van de Klantcontact Volwassenheidsscan |
| `content-ziekenhuis-quickscan.md` | Afdelingen (categorieën), dimensies (bouwblokken), vragen en resultaatopbouw van de Klantcontact Quickscan – Ziekenhuis (Ja / Nee / Weet ik niet) |
| `content-spanningsmeter.md` | Vragen, ijkpunten, open voorbeeldvragen en achtergrondvragen van de Spanningsmeter (zes spanningsvelden, 30 gescoorde vragen), met de rekenregels en een validatieplan (voorstel van 21 oktober 2026, gebouwd op 21 oktober 2026) |
| `visie-ai-klantcontact.md` | Visie op AI in klantcontact, per domein van de AI-volwassenheidsscan |
| `content-2030.md` | Duidingsstuk "Klantcontact richting 2030", los van de scanresultaten; staat als sectie op de Assessment-pagina van de AI-scan |
| `bouwstenenmodel-visual.md` | Spec voor het interactieve overzicht van de 15 bouwstenen, een sectie op de Assessment-pagina van Klantcontact Volwassenheid en Zorg |
| `ai-domeinenmodel-visual.md` | Spec voor het interactieve overzicht van de 8 AI-domeinen, een sectie op de Assessment-pagina van de AI-scan |
| `privacy-pagina.md` | De privacypagina |
| `export-pdf-visual-volwassenheidsscan.md` | PDF-export van één ingevulde scan: gedeelde regels (bron, slotsectie, bulk-export) plus de visuele opbouw voor de Klantcontact Volwassenheidsscan |
| `export-pdf-visual-ai-scan.md` | PDF-export: visuele opbouw voor de AI-volwassenheidsscan, verschillen t.o.v. hierboven |
| `export-pdf-visual-zorgscan.md` | PDF-export: visuele opbouw voor de Zorgscan, verschillen t.o.v. `export-pdf-visual-volwassenheidsscan.md` (grotendeels geen, zelfde structuur als het template) |
| `export-indesign.md` | Export van één ingevulde scan als XML + losse chart-afbeeldingen, voor handmatige verwerking in een InDesign-sjabloon |
| `export-csv.md` | Export naar CSV: kolommen voor de "Als CSV"-optie, één of meerdere scans |
| `beheerpagina.md` | De beheeromgeving |
| `import-scans.md` | Import van scans (CSV): de oude, stopgezette tool, en onze eigen export teruglezen |
| `sbi-indeling.md` | Vaste optielijst voor Sector/Subsector (SBI2025, top 2 niveaus) |
| `benchmark.md` | Benchmark op drie niveaus: Tussen organisaties (gebouwd, geaggregeerd en anoniem, met een view per organisatie voor een Lead), binnen een organisatie tussen Metingen, en binnen een Meting (beide voorstel) |
| `visualisatie-scores.md` | Hoe hoge en lage scores getoond worden: één meting, spreiding binnen een Meting, tussen Metingen, tussen organisaties en de matrix over Metingen (besloten ontwerp, gebouwd op 13 oktober 2026) |
| `visualisatie-quickscan.md` | Visualisaties van de Quickscan Ziekenhuis in percentages: eigen resultaat (twee standen), gemiddelde en spreiding, antwoorden per vraag en benchmark (besloten op 15 oktober 2026, gebouwd) |
| `visualisatie-spanningsmeter.md` | Visualisaties van de Spanningsmeter: het beeld in de cirkel, de doorloopflow, Mijn metingen, het resultaat van een respondent en van een groep, de landingspagina en de film Wat krijg ik (voorstel van 21 oktober 2026, gebouwd op 21 oktober 2026) |
| `dossier.md` | Het Dossier van een Organisatie: Nieuws, Cases, Events en Blogs die een Consultant samenstelt en openzet voor de Lead, met koppeling aan bouwblokken, de radar met filter en de verdeling (Basis op Orde, Uitbouwen, Sterk punt) met de rail "In dit dossier", de Afspraak "Mag als case gebruikt worden" en de rechten (voorstel van 20 oktober 2026, gebouwd op 21 oktober 2026) |
| `visualisatie-mijn-metingen.md` | Opmaak van de landingspagina "Mijn metingen" voor Respondent en Lead: kaarten, statussen, teaser van de uitkomst, respons, benchmarkkaart (voorstel van 15 oktober 2026, gebouwd op 15 oktober 2026) |
| `visualisatie-verkennen.md` | Admin-scherm Verkennen onder Resultaten: filteren, groeperen en vergelijken van alle Organisaties van één Assessment, met vier weergaven (besloten en gebouwd op 15 oktober 2026) |
| `help.md` | De helppagina in de app. Een regel Help in het menu, uitleg per rol met illustratie, als Markdown-bestanden in `help/` (gebouwd op 19 oktober 2026) |
| `backlog.md` | Bewust nog niet opgepakt |
| `go-live-plan.md` | Actielijst naar productie |
| `azure-plan.md` | Aanvulling op `go-live-plan.md` met de stappen voor de Azure-omgeving (Azure DevOps, Azure SQL, `coniche-scan.nl`) |
| `AGENTS.md` | Instructies voor AI-agents in de repo |
| `README.md` | Korte uitleg van de repo en hoe je de app lokaal draait |
| `changelog.md` | Bouwlog van Sander: per datum wat er in de code veranderd is, waarom, en welke specs daarbij zijn bijgewerkt |

## Uitgangspunten

- Bouw de flow generiek over data heen, niet met hardcoded schermen per
  bouwblok. Bouwblokken, vragen, schaallabels en organisatievelden zijn
  data. Een nieuw scan-type of veld vraagt dan een beheerscherm dat die
  data bewerkt, geen nieuwe flow.
- De app hoeft voorlopig niet responsive te zijn. Ontwerp en test voor
  desktop.
- Uitleg bij een veld of knop staat in een Info-icoon en niet als vaste
  tekst eronder (`stylesheet.md`, Info-icoon). Elke Info-icoon-tekst heeft
  een initiële waarde en is door een Admin aan te passen op de plek zelf
  (`beheerpagina.md`, punt 2a, Algemene teksten).
- Verandert een spec iets wat een gebruiker ziet of doet, dan gaat het
  bijbehorende helpbestand in `help/` mee (`help.md`, Actueel houden).
- Een actie is een knop en geen link. Links zijn er alleen voor navigatie:
  kruimelpad, header, footer en verwijzingen in lopende tekst
  (`stylesheet.md`, Knoppen en links).
- Een scan, Respondent of Organisatie die iemand bewerkt, kan niet
  tegelijk door een ander bewerkt worden (`datamodel.md`, Bewerkslot).

## Status

De doorloopflow en de beheeromgeving (Organisaties, Metingen,
Ingevulde scans, die Resultaten worden, `beheerpagina.md` punt 7) zijn gebouwd, met de content van de Klantcontact
Volwassenheidsscan, de AI-volwassenheidsscan en de Zorgscan (sector-variant
van de Klantcontact Volwassenheidsscan, `content-zorgscan.md`).

- **Opslag**: Prototypefase. De data staat in de localStorage van de
  browser. Sander werkt daarnaast met een tijdelijke serveropslag (Neon),
  die vervalt. De database wordt Azure SQL Database (`backlog.md`,
  `azure-plan.md`). Zonder gedeelde opslag werkt een
  link alleen in de browser waar de data staat.
- **Inlog en rollen**: E-mail en wachtwoord voor beheer. Het inlogscherm
  heeft geen rolkeuze: De rol volgt uit het account waarmee iemand
  inlogt. De rollen Admin en Consultant aan de beheerkant en Lead en
  Respondent aan de klantkant zijn nu ingericht als testhulp
  (prototype). De definitieve rollen, rechten, 2FA en inlog volgen met de
  backend (`datamodel.md` deel 2). Admin-accounts hebben onderling
  dezelfde rechten, en meer dan een Consultant.
- **Toegang respondenten**: Via een korte persoonlijke link (10-teken
  code, cryptografisch gegenereerd, zie `datamodel.md`, Toegangscode),
  zonder verificatiecode. E-mailverificatie volgt als er een backend en
  een Coniche-mailserver zijn (`backlog.md`).
- **Bewust uitgesteld**: AI-managementsamenvatting, aggregatie over
  meerdere respondenten (`backlog.md`).
- **Export**: Als PDF (`export-pdf-visual-volwassenheidsscan.md` e.v.),
  als CSV (`export-csv.md`) en voor InDesign als XML (`export-indesign.md`)
  zijn alle drie gebouwd, vanuit dezelfde Exporteren-dropdown op de
  resultatenpagina, in het Meting-overzicht en in de lijsten onder Resultaten
  (`beheerpagina.md`, punt 5 en 7).
- **Benchmark**: Alle drie de niveaus zijn gebouwd: Tussen organisaties
  (PR 61), binnen een organisatie (een vergelijking van twee Metingen, 14
  oktober 2026) en binnen een Meting (`benchmark.md`). Bij niveau 2 kiest
  de Admin de lezing Ontwikkeling over tijd (weergave C) of Naast elkaar
  (weergave H), gebouwd op 14 oktober 2026.
- **Verkennen**: Gebouwd op 15 oktober 2026 (`visualisatie-verkennen.md`).
  Een Admin-scherm onder Resultaten om alle Organisaties van één Assessment
  te filteren, te groeperen en te vergelijken, met vier weergaven. Nog niet
  voor de Quickscan Ziekenhuis, voor een Consultant en voor meerdere Metingen
  per Organisatie. Korte namen voor veldnamen en waarden (zoals de lange
  SBI-sectoren) houden de filterlijst en de pillen leesbaar, gebouwd op 15
  oktober 2026 (`visualisatie-verkennen.md`, Korte namen). Kenmerken
  (organisatievelden die je toevoegt en waarop je filtert en groepeert)
  beginnen leeg, zonder groepering is de hele pool de focus. Gebouwd op 15
  oktober 2026 (visual design versie 6).
- **Ronde van 19 oktober 2026** (Joost, PR 127), gebouwd: Fundament in merkgeel, het
  staafdiagram per categorie in categoriekleuren met stippellijnen, Mijn metingen
  met een spoor van 1 tot 5 en stip en lijn bij Hele meting, de Meetperiode bij
  Verkennen en bij een opgeslagen verkenning (`benchmark.md`, Welke Meting telt
  waar), het samenstellen van een benchmark met alle Metingen als keuze, en
  onderdeel I en J van `visualisatie-scores.md`: Dezelfde schakelaar op de
  samengestelde Meting, de vergelijking, de benchmark tussen organisaties, het
  perspectief van een lid en de hoofdpagina van een Meting, met Toon als
  (Gemiddeld of Naast elkaar met zes vormen) en Spreiding tussen onderdelen.
- **Radar en staafdiagram** (Joost, PR 141, gebouwd op 19 oktober 2026): De radar met
  genummerde knooppunten en de namen in een tooltip, het staafdiagram per categorie
  zonder getal boven de balk (tooltip met naam en klasse), beide naast elkaar in
  twee kaarten, de top 3 in de tint van de score en de Quickscan-rijen Sterkste en
  Meeste in de tint van de klasse (`stylesheet.md`, Radar en staafdiagram op het
  resultaatscherm).
- **KPI's per plek en kanaal** (gebouwd op 19 oktober 2026, besloten door
  Joost): Een KPI-waarde hoort bij de hele
  organisatie, een Onderdeel of een kanaal, en je vult alleen in wat je weet
  (`datamodel.md`, Onderdeel en KPI's en kanalen). Het Onderdeel wordt een eigen
  object (de tekst op de Meting blijft als de naam van het Onderdeel, `datamodel.md`, Onderdeel, Zo gebouwd). In het organisatie-detail staat een
  eigen blok KPI's en een modal "KPI's invullen" (`beheerpagina.md`, punt 4). De
  KPI's en kanalen zelf beheert een Admin (punt 3), en Verkennen kiest per KPI
  een kanaal (`visualisatie-verkennen.md`, KPI's als kenmerk). Het design staat
  in `Claude outputs/kpi-design/`: Zes borden als `.dc.html` met een PNG per bord.
- **Balklijst** (gebouwd op 19 oktober 2026, `stylesheet.md`, Balklijst): Elke lijst met balken heeft kolommen met een vaste breedte voor
  label, waarde en extra gegevens, balken van 8, 12 of 16px, afgerond op hele pixels met minstens 4px boven nul, en een gestapelde balk met
  getallen vanaf 24px. Een test leest de opmaak (`lib/balklijst.test.ts`).
- **Opmaakronde**: Besloten door Joost en gebouwd op 15 oktober 2026
  (`stylesheet.md`). Acht lettergroottes in even px (12, 14, 16, 18,
  24, 32, 40, 48) in plaats van zo'n 17 maten, met de paginatitel op 32px.
  Eén vorm voor keuzes: De pil en de pilvormige groep, waarin gekozen massief
  oranje is en zwart geen vulling meer. Drie niveaus van scorekleur (band, cel,
  vol), zodat een cel met een getal een zachte tint krijgt. Verschil in blauw
  en donkeroranje. Kolomkoppen en rijkoppen op één regel met een tooltip, kolommen
  van 96px, en een afstandsraster van 4px. De PDF-export valt er niet onder.
- **Kaart met cirkel op Mijn metingen** (gebouwd op 19 oktober 2026,
  `visualisatie-mijn-metingen.md`): Een paneel met een cirkel met de totaalscore,
  de klassenchip en bij een Lead de groep, met Jij en Groep op één spoor per
  categorie of afdeling. Voor Assessments met categorieën of afdelingen.
- **Resultaatkop, Toegang en Afspraken, korte namen in Kenmerken** (gebouwd op 19 oktober 2026): Eén Resultaatkop met de `.score-ring` voor
  het resultaatscherm van een respondent, een Meting en de voorbeeld-output (`stylesheet.md`, Resultaatkop), de Quickscan met Sterkste en Meeste als twee
  kolommen, het staafdiagram per categorie met getal van 14px, de kaarten Toegang en Afspraken op het organisatie-detail, korte namen in de kaart
  Kenmerken en in Sector en Subsector, en `Meting.onderdeel` is vervallen (de naam komt uit het Onderdeel).
- **Contactpersonen** (gebouwd op 20 oktober 2026, op verzoek van Sander):
  Bij de Kenmerken van een Organisatie legt een Admin relevante
  contactpersonen vast, met functie en LinkedIn-profiel (`datamodel.md`,
  Contactpersoon, `beheerpagina.md`, punt 4). Het zijn geen Respondenten, een
  Lead ziet ze niet en de gegevens van een contactpersoon staan niet in de
  audit-log. Alleen openbare, zakelijke gegevens zijn toegestaan, geen
  privégegevens. Vooralsnog mag alleen een Admin ze wijzigen (recht
  `contactpersonen.bewerken`, besloten op 20 oktober 2026, gebouwd); een Consultant ziet ze bij eigen Organisaties.
- **Dossier** (besloten door Joost op 20 oktober 2026, gebouwd op 21 oktober
  2026, `dossier.md`): Het Dossier vervangt de lijst nieuwsartikelen die
  Sander bij de Kenmerken zette. Een Consultant (en een Admin) stelt bij een
  Organisatie een lijst Nieuws en Cases samen, koppelt items aan bouwblokken, en
  zet het Dossier en per item open voor de Lead. Op Mijn metingen van de Lead is
  het één kaart "Dossier" onder Vergelijkingen die naar de Dossierpagina gaat,
  met de radar van de bouwblokken waarop de lijst filtert. Een Case verwijst
  naar een andere Organisatie en kan alleen open als die de Afspraak "Mag als
  case gebruikt worden" heeft (standaard uit). De Lead ziet de branche en
  de omvang, nooit de naam. Afwijkingen van eerdere besluiten: Een Consultant mag
  het Dossier van eigen Organisaties wijzigen (`dossier.bewerken`), en een Lead
  ziet de items die zijn opengezet (`dossier.inzien`). Contactpersonen blijft
  zoals het was. Gebouwd: De kaart Dossier op het organisatie-detail met het
  formulier voor Nieuws en Case, de Afspraak "Mag als case gebruikt worden" in de
  kaart Afspraken, de kaart Dossier op Mijn metingen en de Dossierpagina
  `/s/[code]/dossier` met de radar in een filtermodus. Een nieuwsartikel uit de
  eerste bouw is bij het laden een Dossieritem geworden. Het Dossier staat niet
  in exports en import. Een Case zonder toestemming blijft bij de Consultant
  staan en verdwijnt bij de Lead. In het prototype bepaalt `leadDossier`
  (`lib/dossier.ts`) wat een Lead ziet, zonder naam of id van de Organisatie in
  een Case, tot dat aan de serverkant kan. **Verdeling, rail en soortfilter** (besloten door Joost op 21 oktober 2026, ontwerp `Dossier-lead-v3`, gebouwd op 21 oktober 2026, PR 163): De Dossierpagina heeft een soortfilter (Alles, Cases, Nieuws, Events, Blogs), rechts van de radar een verdeling met de bouwblokken of domeinen op de laagste score eerst, en een lijst met een meescrollende rail "In dit dossier" met de secties Basis op orde brengen, Uitbouwen, Sterk punt en Algemeen, bepaald door het laagst scorende bouwblok van een item. Zonder Meting waarvan de Lead de Resultaten mag zien is er geen verdeling, rail en secties (`dossier.md`, Zo gebouwd). **Events, Blogs en AI-domeinen**
  (besloten door Joost en gebouwd op 21 oktober 2026, PR 160): Het Dossier heeft
  vier soorten, Nieuws, Case, Event en Blog. Een Event verloopt de dag na zijn
  (eind)datum en staat bij de Lead achter "Eerdere events". Items koppel je aan
  bouwblokken van de Klantcontact Volwassenheidsscan én aan de domeinen van de
  AI-scan, en de Dossierpagina heeft een radar per Assessment met een pil-groep
  om te wisselen (`dossier.md`, Zo gebouwd).
- **Herontwerp van navigatie en Assessment-pagina's** (besloten door Joost op 21
  oktober 2026, gebouwd op 21 oktober 2026, PR 151): De vier content-links zijn uit
  de nav, de content staat als secties op de Assessment-pagina met een sticky
  sub-nav, scherm 1 heeft tegels met drie punten, en Mijn metingen heeft "Over
  deze scan" op de Meting-kaart. Zie scherm 1, 2 en 5 hieronder, onder "Zo
  gebouwd".
- **Spanningsmeter** (voorstel van 21 oktober 2026, ontworpen met Joost in het Design-artifact "Spanningsmeter: home en schermen", gebouwd op 21 oktober 2026): Een vijfde Assessment, bron het boek "Onder Spanning" (Franssen, 2026) en de opzet van Martijn van 20 oktober 2026. Zes spanningsvelden (Verhaal & leiderschap, Governance, regie & control, Mensen & gedrag, Data, Processen, Technologie) met elk vijf gescoorde vragen op een eigen schaal van 1 tot 5 met ijkpunten, een score 0 voor "Kan ik niet beoordelen" en een open voorbeeldvraag zonder score. Er is geen categorielaag en geen totaalscore: Het resultaat is een profiel van zes veldscores met de spanning tussen de velden, en bij een groep de laagste en hoogste score en de voorbeelden uit de groep (`content-spanningsmeter.md`, `datamodel.md`, antwoordType `spanning`, `visualisatie-spanningsmeter.md`). De toegang is gelijk aan die van de andere scans. Wat Joost besloot: De plek als vijfde deel in de cirkel op scherm 1 met volgorde E2, het beeld, het icoon en de kleuren. Nog open: De punten onderaan `visualisatie-spanningsmeter.md`, de verificatie van de teksten en de validatie van de vragen. **Zo gebouwd (21 oktober 2026)**: Het hele voorstel, met een scorefunctie met tests (`lib/spanning.ts`), de doorloopflow met intake, het resultaat Jouw profiel en Groep met de voorbeelden uit de groep, de kaart op Mijn metingen, de cirkel met vijf delen, de Assessment-pagina met radar en film en de help (aangepast op 21 oktober 2026 na PR 163: Geen rolgroep en geen uitsplitsing per rol meer, en de zes velden als radar). Nog niet voor dit type: PDF, CSV, InDesign, import, benchmark, Verkennen, een samengestelde Meting, de weergaven Spreiding en Antwoorden, en het bewerken van ijkpunten, invalshoeken en toelichtingen in beheer (`backlog.md`, Spanningsmeter). De afwijkingen en interpretaties staan in `visualisatie-spanningsmeter.md`, Zo gebouwd.
- **Help**: Gebouwd op 19 oktober 2026 (`help.md`). Een helppagina per rol
  (Respondent, Lead, Consultant en Admin) met 28 onderwerpen (het Dossier
  heeft er drie, gebouwd op 21 oktober 2026) als Markdown in
  `help/`, twee films met CSS-animaties en de rij "Help" in het Accountmenu
  en in "Mijn gegevens". De inhoud is door Claude Code geschreven en wacht op
  de beoordeling van Joost. Alleen twee onderwerpen hebben een illustratie.
- **Quickscan Ziekenhuis**: Gebouwd op 14 oktober 2026
  (`content-ziekenhuis-quickscan.md`): Het eerste Assessment met
  antwoordType Ja / Nee / Weet ik niet, met doorloopflow en eigen
  resultaatscherm. De visualisaties (eigen resultaat in twee standen, gemiddelde
  en spreiding, antwoorden per vraag en benchmark tussen organisaties) zijn
  gebouwd op 15 oktober 2026 (`visualisatie-quickscan.md`). PDF, CSV, InDesign
  en import volgen later, evenals de vergelijking tussen Metingen en de
  benchmark binnen een organisatie of een Meting (`backlog.md`).

## Terminologie

In de interface en in alle specs: **Organisatie**, **Meting** (een
afname van één scan-type bij één organisatie, voor één onderdeel op één meetdatum), **Respondent** (de
persoon), **Ingevulde scan** (één invulling door één respondent binnen
één meting), **Onderdeel** (een deel van een Organisatie met een eigen naam en
eigen KPI-waarden, gebouwd op 19 oktober 2026), **Spanningsveld** (een van de zes velden van de Spanningsmeter, in de code een bouwblok; in de interface nooit "bouwblok"). Niet "leden" of
"scanuitvoering". In de code heten sommige
typen nog anders; dat staat in het datamodel.

---

## Datamodel en opmaak

Het datamodel en de opmaak staan in eigen bestanden. Ze worden via een
import bij elke sessie meegeladen:

- Datamodel (deel 1 gebouwd, deel 2 voorstel): @datamodel.md
- Opmaak: @stylesheet.md

Wijzig je iets aan de datatypen of de database, lees dan eerst het
datamodel. Wijzig je iets aan de vormgeving, dan de stylesheet.

---

## 1. Scoringslogica

Elk bouwblok heeft een gewicht `g` (standaard 1, zie `datamodel.md`,
`Bouwblok.gewicht`). Alleen de Zorgscan heeft nu bouwblokken met een
ander gewicht (4, 10 en 11 op 2). Volledige uitwerking en rekenvoorbeeld
staan in `datamodel.md`, Scoreberekening.

Deze sectie beschrijft het antwoordType `"schaal"` (1–5). Een Assessment
met antwoordType `"ja-nee-weetniet"` (de Quickscan) rekent in punten en
procenten: Zie `datamodel.md`, Scoreberekening, en de classificatie voor
dat type hieronder. De categoriescore is daar geen gemiddelde van de
bouwblokpercentages, maar het aantal Ja van de hele categorie gedeeld
door het aantal vragen.

- **Bouwblokscore**: Gemiddelde van de vragen binnen het bouwblok,
  ongewogen, afgerond op 1 decimaal.
- **Categoriescore**: Gewogen gemiddelde van de bouwblokscores binnen de
  categorie (`Σ(g × score) / Σ g`), afgerond op 1 decimaal.
- **Overall score**: `Σ(g × som antwoorden per bouwblok) / Σ(g × aantal
  vragen per bouwblok)`. Bij gewicht 1 overal is dat de som van alle
  antwoorden gedeeld door 60. Dit is niet het gemiddelde van de
  categoriescores: Categorieën hebben een ongelijk aantal bouwblokken (2,
  4, 4, 4, 1) en zouden anders ongelijk meewegen. De overall komt uit de
  ruwe antwoorden en niet uit afgeronde bouwblokscores.
- **Afronding**: Half-away-from-zero (zoals JS `toFixed(1)`), alleen op
  getoonde waarden.
- **Voortgang**: Beantwoorde vragen gedeeld door het totaal aantal vragen
  in de scan.
- **Status in de sidebar**: Nog niet begonnen (grijs nummer), bezig
  (gevuld cirkeltje met "x/4" naast de titel), afgerond (groen vinkje).

### Classificatie

- "Basis op Orde" (onder 2,5): "De basis moet op dit punt eerst op orde
  gemaakt worden om verder te kunnen uitbouwen."
- "Uitbouwen" (2,5 tot en met 3,49): "De basis is op orde en je bent
  onderweg, maar er is nog een verbeterstap nodig om richting excellent
  te gaan."
- "Sterk punt" (vanaf 3,5): "Hier is de organisatie al heel goed in.
  Benut dit optimaal en bouw het verder uit, ook ter ondersteuning van
  zwakkere bouwblokken."

### Classificatie bij Ja / Nee / Weet ik niet (Quickscan)

Drie klassen, bepaald op het afgeronde percentage (hele procenten). Ze
gelden voor een afdeling (categorie), een dimensie (bouwblok) en de
totaalscore. Er zijn geen
uitlegzinnen per klasse.

- "Goed op orde": Vanaf 80% (groen). Bij 15 vragen 12 tot en met 15
  punten.
- "Gemiddeld inzicht": 50% tot en met 79% (oranje). Bij 15 vragen 8 tot
  en met 11 punten.
- "Ontwikkelruimte": Onder 50% (rood). Bij 15 vragen 0 tot en met 7
  punten.

Het percentage is leidend en de punten zijn daaruit afgeleid. De oude
tool toonde 13–15 en 8–12 punten, maar 12 van 15 is precies 80% en dus
Goed op orde; die puntenrange is hier gecorrigeerd. Kleuren: De bestaande
groen, oranje en rood uit `stylesheet.md`, Scorekleuren.

De totaalscore gebruikt dezelfde drie grenzen met eigen namen: "Sterk
ontwikkeld", "Gemiddeld ontwikkeld" en "Aanzienlijke ontwikkelruimte"
(besloten, `content-ziekenhuis-quickscan.md`, Besloten).

### Scorekleuren

Elke score krijgt een kleur op basis van de afgeronde waarde: 5
donkergroen, 4 lichtgroen, 3 geel, 2 oranje, 1 rood. Basis op Orde is
daarmee rood of oranje, Uitbouwen geel, Sterk punt licht- of donkergroen.
Tokens en details in `stylesheet.md`. Daar staan ook de drie niveaus van
scorekleur (band, cel, vol): Een cel met een getal krijgt een zachte celtint
en nooit de volle kleur.

### Top 3

De bouwblokken gesorteerd op score: De hoogste 3 zijn de sterktes, de
laagste 3 de verbeterkansen.

---

## 2. Kleuren per categorie

Overkoepelend oranje, Organisatie blauw, Proces & Tech paars, Mens groen,
Fundament geel (het merkgeel `#ffc043`, gebouwd op 19 oktober 2026, daarvoor antraciet). Fundament is alleen een vulling, dus tekst in en bij die kleur staat in `--ink` (`stylesheet.md`, Categoriekleuren). De interactieve flow gebruikt deze kleuren; de
PDF-export gebruikt overal oranje.

Alle opmaakwaarden (hexcodes, tekstkleuren, scorekleuren, knopstaten)
staan uitsluitend in `stylesheet.md`.

---

## 3. Schermflow

### Globale layout

Eén gedeelde navigatiebalk en footer op elk scherm, als één component,
vormgegeven volgens `stylesheet.md`. Alle schermen gebruiken de tokens
uit `stylesheet.md`.

De nav heeft een vast deel links (logo) en een contextueel deel rechts
(`.nav-right`) met acties voor het scherm waar je bent. Volgorde binnen
`.nav-right`, overal gelijk:

1. Scherm-specifieke acties, indien aanwezig, uiterst links (bijv.
   "Naar resultaten →" op de doorloopflow zodra de scan afgerond is,
   "← Terug naar de scan" samen met "Exporteren" op de resultatenpagina,
   geen scheidingslijn tussen die twee onderling, in beheer:
   "Assessments", "Organisaties" en "Resultaten" voor een Admin,
   "Organisaties" en "Resultaten" voor een Consultant; "Instellingen" staat in het Accountmenu, zie `beheerpagina.md`, Wat
   beheerbaar is). Geen
   apart concept meer voor een terug- versus een vooruit-actie binnen
   hetzelfde scherm: Beide staan hier, uiterst links, ongeacht de
   richting.
2. Een verticale scheidingslijn, **alleen als punt 1 iets bevat** en er rechts ervan nog iets staat (punt 5 of 7).
3. **Vervallen (besloten door Joost op 21 oktober 2026, ontwerp `Herontwerp-Navigatie`).** De 4 vaste content-links (Visie, Bouwstenen, AI, 2030) staan niet meer in de nav. De content staat op de Assessment-pagina (scherm 2), bij het Assessment waar hij bij hoort. Een gebruiker met een persoonlijke link komt daar via "Over deze scan" op de Meting-kaart op Mijn metingen. De nummering van deze punten blijft zoals ze was, omdat andere specs ernaar verwijzen.
4. Vervallen, zie punt 3.
5. Uiterst rechts de link om de sectie te verlaten, met een `←` ervoor
   (bijv. "← Terug naar Mijn metingen" op de doorloopflow, de
   resultatenpagina en de Assessment-pagina met een persoonlijke link). Op de
   Assessment-pagina staat deze link alleen bij een herkende gebruiker; zonder
   sessie ontbreekt hij en staat er alleen "Inloggen". Terug gaat dan via het logo.
   **Beheer heeft geen
   exit-actie**: Geen "← Terug naar site" — voegde niets toe en
   verwarde met "Uitloggen" in het Accountmenu ernaast (twee manieren
   om "weg te gaan" naast elkaar). Uitloggen is de enige manier om
   beheer te verlaten. Was eerder wél gespecificeerd, hierbij vervallen.
6. Een verticale scheidingslijn, **alleen als punt 7 iets bevat**.
7. **Identiteitsmenu, helemaal uiterst rechts, voorbij de exit-actie**:
   Het Accountmenu (`beheerpagina.md`) aan de beheerkant, het
   "Mijn gegevens"-menu (verderop in deze sectie) aan de respondentkant.
   Op elk scherm zonder ingelogde/herkende gebruiker (scherm 1, Kies jouw
   assessment, de andere publieke schermen en de Assessment-pagina
   zonder sessie) staat hier in plaats daarvan **"Inloggen"** —
   zelfde plek, uitgelogde variant van datzelfde slot, geen dropdown en
   geen pijltje ervoor of erachter. Het slot is dus nooit leeg: Met een
   herkende gebruiker staat er het menu, zonder staat er "Inloggen". Conventie: Een account-/profielmenu
   (of de uitgelogde variant ervan) staat vrijwel altijd als
   allerlaatste element in een nav, voorbij eventuele terug-links, niet
   ervoor. Dit corrigeert een eerdere versie van deze spec die het
   Accountmenu links van de exit-actie plaatste.

**Geen scheidingslijn zonder inhoud aan beide kanten.** Op "Mijn
metingen" bijvoorbeeld staat alleen het "Mijn gegevens"-menu, zonder
scheidingslijn: Geen scherm-specifieke actie (punt 1) en geen exit-actie
(punt 5) op dat scherm.

**"Terug naar" is niet automatisch de exit-actie.** Op de
resultatenpagina is "Terug naar de scan" een scherm-specifieke actie
(punt 1, je blijft binnen dezelfde scan), "Terug naar Mijn metingen" is
de exit-actie (punt 5, je verlaat de scan). Beide staan er dus naast
elkaar, niet in plaats van elkaar.

Welke acties op de overige schermen in de nav horen, wordt aangevuld
zodra de visuele uitwerking verder is.

**Logo, contextafhankelijk**: Op de publieke schermen (Kies jouw
assessment, Assessment-landingspagina, Voorbeeld-output) gaat het logo
naar `#/`, zoals nu. Zodra een respondent binnen zijn persoonlijke link
zit (intake, doorloopflow, resultaten, Mijn metingen en de
Assessment-pagina met een persoonlijke link), gaat het logo naar "Mijn metingen" in plaats van naar
de publieke homepage. Dit stond nergens vastgelegd, dus `#/` overal was
geen afwijking van de spec maar een gat erin.

### Schermen

1. **Kies jouw assessment**: Kaarten per Assessment-type, generiek over
   `Assessment[]`. **`.nav-right`**:
   "Inloggen" in het identiteitsmenu-slot (Globale layout hierboven,
   punt 7) — gaat naar scherm 4a, Toegang (e-mail + verificatiecode),
   voor een respondent/Lead die al een account heeft maar zijn
   persoonlijke link niet bij de hand heeft. Nu de enige weg naar
   scherm 4a buiten "Uitloggen" om. Geen scherm-specifieke actie op dit
   scherm (punt 1 leeg), dus geen scheidingslijn daarvóór.

   **Kies jouw assessment als cirkel (besloten door Joost op 21 oktober 2026, ontwerp `Home` en `Gekozen` in het Spanningsmeter-artifact, volgorde E2; de vier-kwartenversie `Home-D`, de eerdere tegels in `Herontwerp-Home` en de voorstellen `Home-A` tot en met `Home-C` zijn vervallen en uit het Design-artifact gehaald)**: De pagina toont geen lijst met kaarten. Eén cirkel is verdeeld in vijf gelijke delen en elk deel is een Assessment. Een klik op een deel zet dat Assessment naast de cirkel in detail. **Bouw naar het blok De cirkel hieronder.** Het is de volledige beschrijving van de geometrie. Een eerdere versie met vier kwarten, wedges van 36°, tien wedges per helft en 21 hoekpunten is vervallen en mag niet meer terugkomen. **Status**: De gebouwde cirkel (21 oktober 2026, `components/AssessmentCirkel.tsx` en `lib/assessmentcirkel.ts`) wijkt hiervan af en is nog niet aangepast aan deze beschrijving. De specs zijn leidend.
   - **Opbouw van de pagina**: Onder de nav, met de container van de pagina (Layout, Container): De eyebrow "Coniche Scan" (12px, hoofdletters, `--or`), de titel "Kies jouw assessment" (h1) en een inleiding van twee zinnen (18px, regelhoogte 28px, `--ink-m`, hoogstens 640px breed). Voorstel voor de inleiding: "Coniche Scan laat zien hoe volwassen jouw klantcontact is en waar de grootste kansen liggen. Je collega's vullen een korte vragenlijst in, jij krijgt een radar met concrete vervolgstappen." Daaronder, op 40px, twee kolommen: Links de cirkel (568px, zie **De cirkel** hieronder), rechts het detailpaneel (de rest van de breedte), 56px ertussen en verticaal gecentreerd ten opzichte van elkaar.
   - **De cirkel** (alle maten voor een cirkel van 568px breed en hoog, viewBox 568 × 568 met het middelpunt op 284/284; op een andere breedte schalen ze mee. Hoeken zijn in graden vanaf 12 uur met de klok mee):
     - **Delen en volgorde (variant E2).** Vijf delen van 72° met de klok mee vanaf links: Klantcontact Volwassenheid (middenlijn 270°), Zorg (342°), AI-Volwassenheid (54°), Quickscan (126°) en Spanningsmeter (198°). Een deel loopt 36° naar weerszijden van zijn middenlijn. De plek is vast per Assessment en volgt dus niet de volgorde van de Assessments in de data. De Volwassenheid-delen liggen links bij elkaar en de Quickscan breekt met zijn bogen de rechterhelft.
     - **Achtergrond en randen.** Elk deel is een taartpunt tot straal 284px in `#faf8f5`. Rond elk deel loopt een witte rand van 8px (afgeronde hoeken), zodat de delen los van elkaar liggen.
     - **Midden.** Een witte cirkel van 80px met een lichte schaduw (`0 2px 12px rgba(28,28,26,.12)`) boven de delen, met daarin het favicon van Coniche (`afbeeldingen/coniche-icoon.svg`, 46px). Het midden reageert niet op de muis.
     - **Kleuren per deel.** Elk deel met een radar heeft precies drie gekleurde wedges van 24° tot straal 262px, met 30% dekking en een witte rand van 1,2px, met de klok mee binnen het deel. Het is een selectie van de kleuren van het Assessment en niet alle categorieën of alle domeinen. Klantcontact Volwassenheid en Zorg: `#ff671f` (Overkoepelend), `#225ba0` (Organisatie), `#197f4e` (Mens). AI-Volwassenheid: `#ff671f`, `#1f9aa0`, `#d1467f` (domeinen). Spanningsmeter: `#225ba0`, `#1f9aa0`, `#ffc043`.
     - **Hulpcirkels en schaal.** Per deel lopen vier witte bogen (75% dekking, 1,2px) over de 72° van het deel, op de scores 2, 3, 4 en 5. De straal volgt één schaal: straal = 48 + (score − 1) × 50 px. Dat geeft score 2 = 98px, 2,5 = 123px, 3 = 148px, 3,5 = 173px, 3,9 = 193px, 4 = 198px en 5 = 248px. Het midden (score 1, 48px) blijft vrij.
     - **De lijn.** Eén oranje lijn (`#ff671f`, 2,5px, scherpe hoeken met `stroke-linejoin: miter`, geen afronding, geen tweede of dikkere lijn) loopt in één stuk door de vier delen met een radar, met een vulling van `#ff671f` met 14% dekking (een vlak van het middelpunt naar de hoekpunten van het deel). Een echte meting heeft pieken en dalen, en daarom liggen alle hoekpunten tussen score 2,5 en 3,9: Een dal gaat nooit onder 2,5 (123px) en een piek komt niet boven 3,9 (193px), dus nooit op of tegen de hulpcirkels van 4 en 5. De lijn heeft **13 hoekpunten, 24° van elkaar**, van 162° tot en met 90° (450°) met de klok mee. Dalen liggen op de grenzen tussen de delen en pieken binnen een deel. Een deel tekent zijn eigen vier hoekpunten, waarvan de eerste en de laatste gedeeld zijn met het buurdeel, zodat de lijn precies aansluit. In de Quickscan loopt de lijn niet door. In de delen die niet gekozen zijn, dimt het hele deel naar 38% dekking en daarmee ook de lijn.
       Hoekpunten (nummer: hoek, score, straal): 1: 162°, 2,6, 128px. 2: 186°, 3,7, 183px. 3: 210°, 2,9, 143px. 4: 234°, 2,5, 123px. 5: 258°, 3,3, 163px. 6: 282°, 3,9, 193px. 7: 306°, 2,7, 133px. 8: 330°, 2,8, 138px. 9: 354°, 3,6, 178px. 10: 18°, 2,5, 123px. 11: 42°, 3,8, 188px. 12: 66°, 3,0, 148px. 13: 90°, 2,6, 128px.
       Per deel: Spanningsmeter hoekpunt 1 tot en met 4 (162° tot 234°, drie wedges van 24°). Klantcontact Volwassenheid 4 tot en met 7 (234° tot 306°). Zorg 7 tot en met 10 (306° tot 18°). AI-Volwassenheid 10 tot en met 13 (18° tot 90°). De grenzen (hoekpunt 1, 4, 7, 10 en 13) zijn allemaal dalen. Een dal ligt dus op de grens tussen twee delen en nooit op een piek.
     - **Band van de Spanningsmeter.** Alleen het deel van de Spanningsmeter heeft een band die de spreiding van de groep laat zien: 0,75 punt onder en boven de lijn (straal volgens de schaal, op dezelfde hoeken), `#ff671f` met 10% dekking. De rand van de band is één dunne grijze lijn (`#a3a19b`, 1px, doorgetrokken, gesloten) en geen oranje streepjesranden. De lijn zelf blijft oranje. Andere delen hebben geen band.
     - **Quickscan.** Geen radar maar vier concentrische bogen over 56° (de middenlijn plus en min 28°), met straal 56, 90, 124 en 158px, 14px dik en ronde uiteinden. Baan `#e9e6df`, gekleurd deel 84%, 62%, 48% en 71% van de 56° in `#22a06b`, `#e8871e`, `#dc2626` en `#e8871e` (de kleuren van de Quickscan-klassen, grenzen 50% en 80%).
     - **Label per deel.** Een witte pil (94% dekking, afronding 14px, padding 10px 14px, lichte schaduw) langs de middenlijn van het deel, op 235px van het middelpunt (Zorg 240px; Quickscan 200px) en bij Klantcontact Volwassenheid 16px lager, zodat de pil de stip niet raakt, met het Assessment-icoon (30px, `#ff671f`) en de korte naam in twee regels (14px, regelhoogte 18px, gewicht 700): "Klantcontact / Volwassenheid" (icoon `target`), "Volwassenheid / Zorg" (`heart`), "AI-Volwassenheid / in Klantcontact" (`sparkle`), "Quickscan / Ziekenhuis" (`cross`) en "Spanningsmeter" op één regel (`gauge`, `visualisatie-spanningsmeter.md`, Het beeld). De pil wordt niet afgeknipt en reageert niet op de muis.
     - **Gedrag.** Zonder selectie staat rechts "Vijf assessments in één cirkel. Klik op een deel voor de details." (kop 26px, gewicht 800). Bij hover wordt een deel 2,5% groter (0,35s). Een klik kiest het deel: Het schuift 10px naar buiten langs zijn middenlijn, wordt 2% groter en krijgt een schaduw (`0 10px 30px rgba(28,28,26,.18)`), de andere vier gaan naar 38% dekking en er verschijnt een stip. Rechts verschijnt het detailpaneel met een zachte overgang (0,4s, 6px omhoog). Een tweede klik op het gekozen deel heft de keuze op: Het deel schuift terug, de andere delen krijgen hun dekking terug, de stip verdwijnt en rechts staat weer de tekst van het begin ("Vijf assessments in één cirkel. Klik op een deel voor de details."), met een zachte overgang van 0,4s. Een klik op een ander deel wisselt de keuze direct. Er is steeds precies één deel gekozen of geen, en Escape heft de keuze ook op. De delen zijn bedienbaar met toetsenbord en schermlezer (een keuzegroep met vijf opties, pijltoetsen wisselen, de naam van het Assessment is de label).
     - **De stip.** Een oranje stip van 18px met een witte rand van 3px op het gekozen deel, met een gloed die hem laat oplichten: Een vaste gloed van oranje licht rondom (`0 0 12px 3px rgba(255,103,31,.55)`) en daarbovenop een pulse, een ring die in 1,8s tot 16px groeit en vervaagt. De gloed is oranje en niet grijs of beige. Het midden van de stip ligt precies op een hoekpunt van de lijn, en wel de hoogste van de twee binnenste hoekpunten van het deel: Spanningsmeter hoekpunt 2, Klantcontact Volwassenheid hoekpunt 6, Zorg hoekpunt 9 en AI-Volwassenheid hoekpunt 12. **De stip staat nooit in of tegen een label**: Hij ligt minstens 8px buiten de pil (ongeveer 210 × 56px). Valt de hoogste piek van het deel onder de pil, dan neemt de stip de andere binnenste hoekpunt (bij AI-Volwassenheid is dat hoekpunt 12 in plaats van 11). Bij de Quickscan staat hij in het midden van de rode boog (straal 124px, halverwege het gekleurde deel). Hij laat zien waar je op de visual kijkt. Als er later gemiddelde scores van de branche zijn, kan de stip daar het gemiddelde ten opzichte van de eigen score tonen (`backlog.md`).
   - **Detailpaneel**: Van boven naar beneden: de titel van het Assessment (26px, regelhoogte 32px, gewicht 800), de samenvattende zin (17px, regelhoogte 27px, `--ink-m`), de drie punten met grijs lijnicoon (15px, iconen 20px, `--ink-s`, zelfde stijl als op scherm 2), 12px ertussen, en de knop "Bekijk dit assessment" (48px hoog, `--or`, 10px afronding, 28px padding) op 24px eronder, die naar scherm 2 gaat. Alleen de knop is klikbaar.  De titel is de volledige naam van het Assessment ("Klantcontact Volwassenheid – Zorg"), het label op de cirkel is de korte naam.
   - **Smal scherm**: Onder 768px staat de cirkel bovenaan op de volle breedte (hij schaalt mee) en het detailpaneel eronder. Bij het kiezen van een deel scrolt de pagina naar het paneel.
   Teksten in het detailpaneel (de samenvattende zin en de drie punten): De drie punten zijn per Assessment concreet en komen niet in elke kaart hetzelfde terug: Het eerste noemt het aantal vragen en de invultijd, het tweede de opbouw van het Assessment en het derde wat je in het resultaat terugziet. Voorstel voor de teksten:
         - **Klantcontact Volwassenheid**: "Breng in kaart hoe volwassen jouw klantcontactorganisatie is." Punten: "60 vragen, ±30 minuten" (klok), "15 bouwblokken in 5 categorieën" (lagen), "Concrete stappen op basis van je scores" (vlag).
   - **AI-Volwassenheid in Klantcontact**: "Zie hoe ver jouw organisatie is met AI in klantcontact." Punten: "40 vragen, ±20 minuten", "8 AI-domeinen", "Concrete stappen per domein".
   - **Klantcontact Volwassenheid – Zorg**: "Breng in kaart hoe volwassen het patiënt- of cliëntcontact van jouw zorg- of welzijnsorganisatie is." Punten: "60 vragen, ±30 minuten", "15 bouwblokken in 5 categorieën", "Scores gewogen voor de zorg, met concrete stappen".
   - **Klantcontact Quickscan – Ziekenhuis**: "Zie snel waar jouw ziekenhuis staat in klantcontact." Punten: "60 vragen, ±15 minuten", "10 dimensies", "Gemiddelde en spreiding per afdeling" (staafjes).
   De aantallen komen waar het kan uit het Assessment. Of de zin en de punten beheerbaar zijn of in de code staan, is nog niet besloten (Open punten). Open punten bij de cirkel: Hoe de cirkel eruitziet bij meer dan vijf Assessments en of de stip later het branchegemiddelde toont.
   - **Spanningsmeter**: "Zie waar de spanning zit tussen verhaal, regie, gedrag, data, processen en technologie." Punten: "30 vragen, ±10 tot 15 minuten", "6 spanningsvelden", "Je eigen Spanningsprofiel, daarna de groep naast elkaar".
2. **Assessment-landingspagina** (herontwerp van 21 oktober 2026, zie het blok **Herontwerp** hieronder; waar de tekst ervan afwijkt, geldt het herontwerp, en voor de kop en de volgorde van de secties geldt de tweede ronde van 21 oktober 2026, zie Bovenkant): Titel, hero, 3 feature-cards en een
   blok "Praktische informatie" met invultijd, direct resultaat en
   privacy. "Start assessment" staat direct onder de hero maar is
   uitgeschakeld, met de uitleg dat toegang via een persoonlijke link
   loopt. Tussen de drie kaarten en "Praktische informatie" staat de film "Wat
   krijg ik" met stapkaarten (`help.md`, Films, gebouwd op 19 oktober 2026,
   met per Assessment-type een eigen variant: Klantcontact en Zorg met categorieën (Zorg met de weging),
   de AI-scan met een rij per domein en de Quickscan met percentages per afdeling; voorstel van
   20 oktober 2026, gebouwd op 20 oktober 2026, `help.md`, Films, Varianten van Wat krijg ik), met daaronder de knop
   "Bekijk de voorbeeld-output" naar scherm 3. Die knop vervangt de link
   "Bekijk wat je krijgt" verderop op de pagina. Alle cijfers in de film
   zijn voorbeelddata. Op de pagina staan grijze lijniconen (`--ink-s`, op het
   raster van de Assessment-iconen, `components/icons/LandingIcons.tsx`, gebouwd op
   20 oktober 2026): Voor elk deel van de subtitel ("±30 minuten", "Heldere
   inzichten", "Direct verbeterkansen", gekozen op de inhoud van het deel), voor de
   titel van elke feature-card (Volledig beeld, Direct inzicht, Concreet en
   toepasbaar, op volgorde van de kaart, zonder nummer) en voor de drie
   koppen van Praktische informatie. De zin "15 bouwblokken, verdeeld over 5
   pijlers" was in de beschrijving bovenaan een ankerlink (vervallen met de kop van 21 oktober 2026, tweede ronde, zie Bovenkant) naar de sectie "De 15 bouwblokken" op dezelfde pagina (niet ook in de kaart Volledig beeld, waar de zin nog eens staat). Bij de AI-scan is "8 domeinen" een ankerlink naar de sectie "AI in klantcontact". Deze pagina
   wordt later mogelijk een leadgenerator met "Toegang aanvragen"
   (`backlog.md`).
   **Bovenkant (kop, besloten door Joost op 21 oktober 2026, tweede ronde van het herontwerp, ontwerp `Herontwerp-Volwassenheid` en `Herontwerp-AI`, gebouwd op 21 oktober 2026)**: De gecentreerde hero van 20 oktober 2026 (design `Open-B`) vervalt. In plaats daarvan staat bovenaan alleen een kop op één regel, links uitgelijnd met de container van de pagina (Layout, Container): Het Assessment-icoon in een witte cirkel van 56px met een lichte schaduw (icoon 28px) en op 20px ernaast de titel (48px, regelhoogte 56px, gewicht 800). De kop heeft 56px ruimte erboven en 40px eronder en staat direct boven de sticky sub-nav. Er staan geen eyebrow "Coniche Scan", geen beschrijvende zin, geen ankerlink "15 bouwblokken in 5 pijlers" (of "8 domeinen"), geen kenmerken ("±30 minuten", "Heldere inzichten", "Direct verbeterkansen"), geen knop "Start assessment" met toelichting en geen regel "Bedoeld voor ..." meer in de kop. De knop en de toelichting staan nu in de sectie Praktisch, "Bedoeld voor ..." is de inleiding van die sectie, en de uitgeschakelde knop "Start assessment" blijft rechts in de sub-nav staan. De beschrijving van het Assessment ("Breng in kaart hoe volwassen ...") staat alleen nog in het detailpaneel op scherm 1 (open punt 8). Dit geldt voor alle Assessments met secties (Volwassenheid, Zorg en AI); de Quickscan houdt voorlopig zijn eigen opbouw.
   **Herontwerp (besloten door Joost op 21 oktober 2026, ontwerp `Herontwerp-Volwassenheid`, `Herontwerp-AI`, `Herontwerp-Quickscan` en `Herontwerp-Navigatie` in het Design-artifact; een klikbaar voorbeeld van het scrollen staat in `Proef-Sticky`)**: De content die eerder achter de vier links bovenin stond (Visie, Bouwstenen, AI, 2030) staat nu op de Assessment-pagina zelf, bij het Assessment waar hij bij hoort. De pagina is één lange pagina met een sticky sub-nav (geen tabs).
   - **Opbouw van boven naar beneden (volgorde gewijzigd op 21 oktober 2026, tweede ronde, gebouwd voor Volwassenheid, Zorg en AI; de sectie "De 4 afdelingen" bij de Quickscan is nog niet gebouwd)**: De kop (zie hierboven), de sticky sub-nav, de inhoudssectie van het Assessment (bij Volwassenheid en Zorg "De 15 bouwblokken", bij de AI-scan "AI in klantcontact", bij de Spanningsmeter "De 6 spanningsvelden", bij de Quickscan "De 4 afdelingen"), "Praktisch", "Wat krijg ik", de sectie met de visie (bij Volwassenheid, Zorg en de Spanningsmeter "Visie", bij de AI-scan "Klantcontact richting 2030") en de footer. De hoofd-nav blijft bovenaan staan en de sub-nav zit eronder. Secties wisselen af tussen wit en `--bg-warm`, beginnend met wit.
   - **Sticky sub-nav (aangepast op 21 oktober 2026, gebouwd op 21 oktober 2026, PR 153; de pil "De 4 afdelingen" bij de Quickscan is nog niet gebouwd)**: Een balk van 64px hoog met een boven- en onderrand, direct onder de hoofd-nav (`position: sticky; top: var(--nav-h)`), met links één omlijnde capsule met de pillen (pil 34px hoog, 14px, gewicht 700, de actieve pil gevuld met `--or` en witte tekst, `stylesheet.md`, Sub-nav) en rechts de uitgeschakelde knop "Start assessment". Een klik op een pil scrolt zacht naar de sectie, met ruimte erboven voor de balken (`scroll-margin-top`). Als sectie geldt de laatste sectie waarvan de bovenkant minder dan 90px onder de balk staat. De pillen werken ook als gewone ankerlinks (`#bouwblokken`, `#ai`, `#velden`, `#afdelingen`, `#praktisch`, `#wat`, `#visie`, `#2030`). Staat in het systeem verminderde beweging aan, dan scrolt de pagina niet zacht.
   - **Secties per Assessment**:
     - Klantcontact Volwassenheid en Zorg: "De 15 bouwblokken", "Praktisch", "Wat krijg ik", "Visie". De Zorgscan gebruikt voorlopig dezelfde teksten; zorgspecifieke teksten volgen later (`backlog.md`).
     - AI-volwassenheid: "AI in klantcontact", "Praktisch", "Wat krijg ik", "Klantcontact richting 2030".
     - Spanningsmeter (voorstel van 21 oktober 2026, gebouwd op 21 oktober 2026, ontwerp `Landing`): "De 6 spanningsvelden", "Praktisch", "Wat krijg ik", "Visie". De kop, de sticky sub-nav en de wisselende achtergronden zijn die van de andere Assessments. De velden staan als interactieve radar met zes taartpunten, de rijen eromheen en de Toelichtingsmodal van het veld bij een klik (gebouwd op 21 oktober 2026, PR 163), de Visie heeft drie kaarten (voorstel van teksten, de definitieve tekst volgt uit het boek) en "Wat krijg ik" heeft een eigen variant van de film en alleen die film (`visualisatie-spanningsmeter.md`, Landingspagina en film Wat krijg ik).
     - Quickscan Ziekenhuis (besloten door Joost op 21 oktober 2026, ontwerp `Herontwerp-Quickscan` in het Design-artifact; de eerdere versie zonder sub-nav vervalt): Dezelfde kop en opbouw als de andere Assessments: De compacte kop met het icoon `cross` en de titel "Klantcontact Quickscan – Ziekenhuis", de sticky sub-nav met "De 4 afdelingen" (`#afdelingen`), "Praktisch", "Wat krijg ik" en "Visie", en de secties in die volgorde. **De 4 afdelingen** (voor de Quickscan, in de plaats van de bouwblokken): De kop "Vier afdelingen die samen het klantcontact van het ziekenhuis bepalen", een inleiding ("Je beantwoordt 60 vragen met Ja, Nee of Weet ik niet, 15 per afdeling. Daarna zie je per afdeling waar de basis op orde is en waar ontwikkelruimte zit.") en vier kaarten naast elkaar, één per afdeling: Een nummercirkel (oranje rand) met de naam, de definitie uit `content-ziekenhuis-quickscan.md` (De 4 afdelingen, in een zin zonder "X =") en onderaan de vragen per dimensie (Organisatie, Processen en techniek, Mensen; alleen de dimensies die de afdeling heeft, samen 15). Eronder een regel dat een afdeling die niet relevant is, wordt overgeslagen. Er is geen radar of spin, want de Quickscan toont percentages en bogen. De kaarten zijn niet klikbaar. **Praktisch**: Zoals bij de andere Assessments, met "±15 minuten" en "Direct resultaat" ("score per afdeling"). **Wat krijg ik**: Alleen de film Wat krijg ik van de Quickscan (`Film-Quickscan`), zonder de film Het dossier, want de Quickscan heeft geen bouwblokken met een radar. **Visie**: Dezelfde sectie als bij Volwassenheid.
   - **Visie** (bron `visie-coniche.md`, deel 1): Een sectiekop met een korte inleiding en drie kaarten naast elkaar (Beloften waarmaken, Kwaliteit zit in het geheel, Van meten naar verbeteren), elk met een korte tekst en "Lees verder". "Lees verder" klapt de volledige tekst op dezelfde pagina uit; er is geen aparte pagina.
   - **De 15 bouwblokken** (bron `visie-coniche.md`, deel 2, component `bouwstenenmodel-visual.md`, besloten door Joost op 21 oktober 2026, gebouwd op 21 oktober 2026, ontwerp `Herontwerp-Volwassenheid`): Een interactieve radar met de 15 bouwblokken, met de bouwblokken per categorie er omheen. De vijf kolommen met bouwblokken uit de eerste opzet vervallen. Beweeg je over een bouwblok of een nummer in de radar, dan licht het bijbehorende stuk van de radar op en staat de centrale vraag in een kaart boven de radar. Een klik opent de Toelichtingsmodal met de beschrijving en de centrale vraag (`stylesheet.md`, Toelichtingsmodal). De opbouw staat in `bouwstenenmodel-visual.md`.
   - **AI in klantcontact** (bron `visie-ai-klantcontact.md`, component `ai-domeinenmodel-visual.md`): De acht domeinen als interactieve radar met een nummercirkel in de domeinkleur (`stylesheet.md`, Domeinkleuren) en de namen in rijen links en rechts, zoals de radar van de bouwblokken (gebouwd op 21 oktober 2026, PR 160, het raster van kaarten is vervallen). Een klik opent de Toelichtingsmodal.
   - **Klantcontact richting 2030** (bron `content-2030.md`): De vijf ontwerpkeuzes als vijf kaarten naast elkaar (nummer, titel, één zin), daaronder pillen met de overige onderdelen van het stuk en "Lees het hele stuk", dat het volledige stuk op dezelfde pagina uitklapt.
   - **Wat krijg ik**: Kop "Zo ziet je resultaat eruit" met een inleidende zin die bij het type past. Daaronder de film Wat krijg ik van het type (`help.md`, Films, met de knop "Bekijk de voorbeeld-output") en daaronder de film "Het dossier, de radar voor de Lead" (`help.md`, Films, ontwerp `Film-Dossier`), zonder knop. Beide staan in een kaart met drie stapkaarten.
   - **Praktisch** (aangepast op 21 oktober 2026, gebouwd op 21 oktober 2026, `PraktischSectie`): Sectiekop "Wat je kunt verwachten" met als inleiding "Bedoeld voor ..." (de doelgroep van het Assessment), daaronder de drie kaarten (invultijd, direct resultaat, privacy; bij AI "±20 minuten" en "per domein" in plaats van "per bouwblok") en daaronder op 32px een rij met de knop "Start assessment" (uitgeschakeld, 52px hoog), het Info-icoon (22px, `--or`) en de toelichting "Toegang loopt via een persoonlijke link van Coniche. Heb je die niet, neem dan contact op." (15px, `--ink-m`, hoogstens 460px). De sectie heet in de sub-nav "Praktisch".
   - **Routes**: De losse pagina's `/visie`, `/bouwstenen`, `/ai-scan` en de 2030-pagina vervallen. Een oud adres stuurt door naar de Assessment-pagina waar de content nu staat (Visie en Bouwstenen naar Klantcontact Volwassenheid, AI en 2030 naar de AI-scan).
   - **Zo gebouwd (21 oktober 2026, bijgewerkt voor de kop en de volgorde)**: Kop (`.ap-kop`) en volgorde zoals hierboven beschreven; de secties krijgen `warm` op de oneven plek (`Sectie`, `.ap-sectie--warm`), de ankerlink en de hero zijn alleen nog te zien bij een Assessment zonder content (de Quickscan). `nbspNaKoppelteken` (`lib/format.ts`) zet de niet-brekende spatie in de inleiding, de kaarten van Praktisch en de zin in het paneel op scherm 1. `bouwstenenLink` bestaat nog voor de Quickscan-hero maar levert geen link meer op voor de andere types in de pagina. Hieronder staat de eerdere beschrijving: `app/[assessmentId]/page.tsx` heeft de hero, `AssessmentSubNav` (`components/assessment/`) en de secties `VisieSectie`, `BouwblokkenSectie`, `AiDomeinenSectie` en `Content2030Sectie` (de inhoud komt uit dezelfde `data/*-content.ts` als de oude pagina's). Welk type content een Assessment heeft, bepaalt `contentSoort` (`lib/landing.ts`): De Bouwsteen als eenheid met categorieën is Volwassenheid (Klantcontact en Zorg), AI-domeinen is AI, en alles anders (de Quickscan) geen content en dus geen sub-nav. De hoofd-nav blijft sticky en de sub-nav zit eronder (`top: var(--nav-h)`, 64px, binnen de container). De actieve pil komt uit de scrollpositie (`actieveSectie`, de laatste sectie die minder dan 170px onder de bovenkant van het venster begint) en is massief oranje in een capsule. De drie feature-cards staan niet meer op de pagina (besloten door Joost op 21 oktober 2026, gebouwd op 21 oktober 2026, PR 163): De zin "Elke vraag is gebaseerd op aantoonbaar bewijs: documenten, ritmes, tooling en afspraken." staat achter "Bedoeld voor ..." in de inleiding van Praktisch (`PraktischSectie`, alleen bij een Assessment waarvan een feature-card die zin heeft, nu Klantcontact Volwassenheid). De Quickscan houdt de kaarten in zijn eigen opbouw. De film "Het dossier" staat onder "Wat krijg ik" van het type, zonder knop. De Visie toont de eerste alinea op de kaart en de rest met "Lees verder", de kaart "Wat is goed klantcontact?" staat onder de drie kaarten (open punt 4), de bouwblokken zijn een radar met de groepen eromheen (`BouwblokkenSectie`), en de 2030-kaarten tonen de eerste zin van elke ontwerpkeuze. De oude routes sturen door (`next.config.ts`, `?code=` blijft meegaan). Zonder `?code=` heeft de nav alleen "Inloggen", met een code "← Terug naar Mijn metingen" en "Mijn gegevens".
   - **Bereikbaarheid**: Een bezoeker zonder sessie komt hier via scherm 1, met alleen "Inloggen" in de nav. Een gebruiker met een persoonlijke link komt hier via "Over deze scan" op de Meting-kaart (zie scherm 5); de nav toont dan "← Terug naar Mijn metingen" en "Mijn gegevens" en het logo gaat naar Mijn metingen.
3. **Voorbeeld-output**: Dezelfde resultaatcomponenten als scherm 6, met
   vaste demodata. De resultaatcomponent wordt één keer gebouwd. Voor
   elk Assessment, dus ook voor de AI-scan, de Zorgscan en de Quickscan,
   staat bovenaan dezelfde kop:
   - Links een eyebrow "Voorbeeld-output" (`stylesheet.md`, Label/eyebrow,
     oranje en in hoofdletters), daaronder als paginatitel (`.page-title`, 32px,
     `stylesheet.md`, Koppen en lopende tekst) de naam van het Assessment. Een
     h1 van 48px past hier niet naast de knop en breekt over twee regels.
   - Rechts naast de h1, verticaal uitgelijnd met de h1, een knop
     "← Terug" (`.btn.btn-outline.btn-compact`, `stylesheet.md`, Knoptekst
     staat op één regel) naar de Assessment-landingspagina (scherm 2).
     Pijl en tekst staan op één regel en de knop heeft de hoogte
     `--control-h`.
   - De kop is één component voor alle Assessments. Een afwijking per
     Assessment (andere kleur, andere knop) is een fout.
   - De nav toont hier alleen "Inloggen" (Globale
     layout, punt 7). "← Terug" staat in de kop en niet ook in de nav.
   Onder die kop staat bij de Spanningsmeter de weergave Groep van het resultaat met demodata (`visualisatie-spanningsmeter.md`, Resultaat). Bij de Klantcontact Volwassenheidsscan, de
   AI-volwassenheidsscan en de Zorgscan staat de weergave Per bouwblok
   van een Meting met zes demo-respondenten (`visualisatie-scores.md`, A), met
   de uitleg dat de tool bij meerdere respondenten van dezelfde Meting en
   organisatie ook het gemiddelde en de afwijking daarop toont.
4. **Respondent-intake**: Naam, rol/functie, team en notities. Verplicht
   toestemmingsvakje ("Ik geef toestemming om mijn antwoorden te delen
   met Coniche"), met een link naar `privacy-pagina.md`. Alleen
   client-side verplicht: Er wordt geen aparte toestemmingsstatus
   opgeslagen, geen nieuw datamodel-veld. De tekst van het vakje wordt
   uitgebreid voor de benchmark (`benchmark.md`, Toestemming en privacy),
   de exacte formulering volgt.

   **Bij de Spanningsmeter** (voorstel) heeft de intake geen extra velden. Een deel van een organisatie is een Onderdeel (geen afdeling en geen rolgroep). Op Mijn metingen heet de link "Over deze scan: spanningsvelden en visie". Het veld Rolgroep is op 21 oktober 2026 uit de intake gehaald (besloten door Joost).

   **Wegingskaart**: Heeft het Assessment minstens één bouwblok met een
   gewicht ongelijk aan 1, dan staat bovenaan de intake (boven het
   formulier) een kaart (`stylesheet.md`, Wegingskaart) met een
   weegschaalicoon, met:
   `Assessment.wegingTitel`, `Assessment.wegingToelichting` en daaronder
   een chip per bouwblok met gewicht ongelijk aan 1, bijvoorbeeld
   "Kanaalmanagement (2×)". De chips staan op volgorde van het
   bouwblok-nummer. Zijn titel of toelichting leeg, dan geldt de
   standaardtitel "Gewogen scoring" en de standaardtekst "Binnen dit
   assessment wegen niet alle bouwblokken even zwaar mee in de
   totaalscore. De volgende bouwblokken tellen extra mee:". Heeft geen
   enkel bouwblok een afwijkend gewicht, dan verschijnt de kaart niet.
   Gewicht 1 is de normale situatie en wordt nergens getoond. De tekst
   is per Assessment aanpasbaar in beheer (`beheerpagina.md`).

   **Openen van de persoonlijke link**: De link gaat altijd eerst naar
   "Mijn metingen" (naam volgt), ook als de respondent maar één
   invulling heeft. Van daaruit door naar de intake (bij
   `"uitgenodigd"`), de doorloopflow (bij `"bezig"`) of de resultaten
   (bij `"afgerond"`), per invulling. Bij meerdere invullingen toont de
   pagina ze allemaal met hun status. Bovenaan, boven de lijst, een
   introtekst uit `mijnMetingenIntro` (`datamodel.md`, Algemene
   teksten) — beheerbaar, geen vaste tekst in de code.

   **Opmaak van "Mijn metingen"**: kaarten per Meting met Assessment-icoon,
   statuschip, voortgang en, bij een afgeronde scan, een teaser van de
   uitkomst. Een Lead ziet ook een teaser van de hele meting (alleen met
   Resultaten aan en minstens `benchmarkMinRespondenten` afgeronde scans).
   Volledig in `visualisatie-mijn-metingen.md`, gebouwd op 15 oktober 2026.
   Knoppen: "Start de scan", "Ga verder", "Bekijk jouw resultaten". Naast de knoppen staat "Over deze scan" (gebouwd op 21 oktober 2026, `OverDezeScan`, `lib/landing.ts`, `overDezeScan`): Op de kaart van een eigen scan en op de kaart van de hele Meting bij een Lead, niet bij de Quickscan, de benchmarkkaart of de Dossierkaart.

   **Bij een Lead-rol** (`datamodel.md` deel 2) toont de pagina alleen wat een
   Admin voor deze Lead heeft aangevinkt (`beheerpagina.md`, punt 6a).
   Bovenaan staat de naam van de organisatie. Daaronder staat één kaart per
   Meting waarvoor minstens één weergave aan staat, op meetdatum, de nieuwste bovenaan, met
   de nieuwste bovenaan, met alleen de knoppen Resultaten en Uitnodigen, voor zover ze aan staan
   (Spreiding en Antwoorden zitten in de schakelaar op de resultatenpagina). Daaronder staat een
   kaart per benchmark die aan staat. Een Lead kan alleen een benchmark
   hebben, en dan bestaat de pagina alleen uit die kaart. Is de Lead ook
   respondent, dan komen zijn eigen scans erbij. Een Lead die geen respondent
   is, ziet geen intake, geen vragenlijst en geen lijst met eigen scans. Heeft
   een Lead niets aan staan en geen scans, dan staat er een korte melding dat
   er nog niets voor hem klaarstaat (`beheerpagina.md`, punt 6a).

   **De content (Visie, Bouwstenen, AI en 2030) staat niet meer in de header** (besloten door Joost op 21 oktober 2026, zie de Globale layout, punt 3, en scherm 2). Op elke Meting-kaart van een Respondent staat een link "Over deze scan" naar de Assessment-pagina (scherm 2) van het Assessment van die Meting, met de persoonlijke code (`?code=`). De linktekst hangt af van het type: "Over deze scan: visie en bouwblokken" bij Klantcontact Volwassenheid en Zorg, "Over deze scan: AI-domeinen en 2030" bij de AI-scan. Bij de Quickscan staat de link er niet zolang daar geen extra content is. De link staat naast "Bekijk resultaten" (zelfde stijl, `--or`, 14px, gewicht 700). Een Lead die geen Respondent is en alleen een benchmark heeft, ziet de link niet. De vraag of Bouwstenen en AI conditioneel moeten worden is hiermee vervallen: De content hangt nu aan het Assessment zelf.

   **"Mijn gegevens"-menu.** Niet te verwarren met het Accountmenu uit
   `beheerpagina.md` (dat is voor beheerders, dit is voor
   respondenten): Een dropdown-knop, zelfde patroon als de Dropdown-knop
   uit `stylesheet.md`. Zichtbaar op elk scherm waar een respondent-
   identiteit bestaat: "Mijn metingen", de doorloopflow, de
   resultatenpagina en de Assessment-pagina, wanneer bereikt via een
   persoonlijke link. Niet op de 3 publieke schermen en niet op de
   intake zelf (daar is nog geen opgeslagen identiteit om te tonen).

   Positie in `.nav-right`: Punt 7 van de nav-volgorderegel in Globale
   layout hierboven, helemaal uiterst rechts, voorbij de exit-actie
   "← Terug naar Mijn metingen" (niet ervoor).

   - **Knop**: Label "Mijn gegevens", met het pijltje van de
     dropdown-knop. Geen naam/e-mail in de knop zelf: Die staan al in
     de dropdown-inhoud.
   - **Dropdown-inhoud, rij 1, klikbaar**: "Gegevens bekijken/wijzigen"
     → opent een modal (dezelfde basismodal uit
     `stylesheet.md`, "Modal en Toelichtingsmodal"), niet een
     losse pagina. In die modal hetzelfde formulier als de intake (naam,
     rol/functie, team, notities), vooringevuld met de huidige waarden
     van `Respondent`. Hergebruik van het intake-formulier, geen nieuw
     formulier bouwen. Opslaan schrijft direct naar `Respondent`, geen
     aparte bevestigingsstap.
   - **Dropdown-inhoud, rij 2, klikbaar**: "Help" → opent de helppagina
     voor Respondent en Lead (`help.md`), gebouwd op 19 oktober 2026.
     "Uitloggen" schuift daardoor naar rij 3.
   - **Dropdown-inhoud, laatste rij, klikbaar**: "Uitloggen" → navigeert naar
     het nieuwe scherm "Toegang" (zie hieronder) en wist de lokale
     respondent-sessie in deze browser (de `code` die aan deze sessie
     gekoppeld is, zie `datamodel.md`, Toegangscode). Respondenten
     hebben geen account om echt op af te melden, dit is het verlaten
     van de lokale sessie, niet een serverside logout.

4a. **Toegang** (nieuw scherm, publiek, geen inlog nodig): De
    bestemming van "Uitloggen" hierboven, én van "Inloggen" op scherm 1,
    en de eerste stap van de toekomstige e-mailverificatie-flow uit
    `datamodel.md` deel 2 (`VerificatieCode`). Nu al gebouwd, zonder de
    code-stap erachteraan:

    - Eén e-mailveld en een knop "Versturen".
    - Na versturen: Een vaste, neutrale bevestigingstekst, ongeacht of
      het adres bestaat (bijv. "Als dit e-mailadres bekend is, ontvang
      je een nieuwe toegangslink"). Geen daadwerkelijke code of link
      wordt verstuurd: Dat vraagt de Coniche-mailserver, die er nog
      niet is (`backlog.md`). Dit scherm is dus nu een niet-functionele
      voorkant van een latere echte flow, geen mock die iets anders
      beweert te doen dan het kan.
    - **Later, met de backend**: Dit scherm wordt gevolgd door een
      code-invoerstap (`VerificatieCode`, 15 minuten geldig,
      `datamodel.md` deel 2), en de link naar deze pagina blijft
      hetzelfde.
5. **Doorloopflow**: Sidebar met naam respondent, voortgang, categorieën
   met genummerde bouwblokken, actief bouwblok gemarkeerd en drie
   statussen. De sidebar blijft staan als de inhoud rechts scrolt (zie
   `stylesheet.md`). Per bouwblok: Een kop in de categoriekleur met titel
   en omschrijving, een icoon naast de titel dat de Toelichtingsmodal
   opent (`stylesheet.md`: eyebrow, naam, centrale vraag en
   `toelichting`, dezelfde modal als in de visuals), tags, de instructieregel "Beantwoord op basis van
   wat aantoonbaar geregeld is (documenten, ritmes, tooling,
   afspraken).", de vragen met 5-puntsschaal en één opmerkingenveld per
   bouwblok. Heeft een bouwblok een gewicht ongelijk aan 1, dan staat
   naast de titel een kleine chip met de factor ("2×") en in de sidebar
   achter het bouwblok dezelfde marker. Bij gewicht 1 staat er niets. Op het laatste bouwblok wordt "Volgende" de knop "Bekijk
   resultaten".

   **Bij de Spanningsmeter** (antwoordType `spanning`, gebouwd op 21 oktober 2026) heeft de doorloopflow zes velden zonder categorieën. Per vraag staan vijf ronde knoppen 1 tot en met 5 met de niveaunaam eronder en een aparte pil "0 · Kan ik niet beoordelen"; boven de vragen staan de vijf ijkpunten van het veld, bij elke vraag een Info-knop "Waar je op let", en onder de vragen een open voorbeeldvraag die niet verplicht is en geen score krijgt. De voortgang telt de 30 gescoorde vragen (`visualisatie-spanningsmeter.md`, Doorloopflow).

   **Bij Ja / Nee / Weet ik niet (Quickscan).** Bij elke vraag staan drie
   knoppen, "Ja", "Nee" en "Weet ik niet", in plaats van de 5-puntsschaal.
   De instructieregel komt uit `Assessment.instructieregel`. De sidebar
   werkt zoals bij de andere scans: De afdelingen zijn de categorieën, met
   daaronder de genummerde bouwblokken (de dimensies) en per bouwblok het
   aantal beantwoorde vragen. Een bouwblok kan maar één vraag hebben
   (Mensen bij de poliklinieken). Eén persoon vult de hele scan in. Elke
   afdeling begint met haar definitie en de vraag of ze relevant is voor
   de situatie van de respondent (Ja of Nee). Bij Nee worden haar vragen
   overgeslagen en telt ze niet mee in de score (`datamodel.md`,
   Antwoordtype, Optionele categorieën, en
   `content-ziekenhuis-quickscan.md`, Doorloop per afdeling).

   **Eén persoon tegelijk per scan.** Een scan die iemand invult, is
   voor anderen vergrendeld (`datamodel.md`, Bewerkslot). Opent een tweede
   persoon dezelfde scan, dan krijgt die een melding dat de scan nu in
   gebruik is en kan hij hem op dat moment niet openen. De scan opent
   zodra het slot vrij is.

   **`.nav-right`**: "Naar resultaten →" als scherm-specifieke actie,
   uiterst links (met een pijl naar rechts, niet links: Dit is een
   voorwaartse actie, geen terug-actie. Alleen zichtbaar zodra deze
   ScanInvulling `"afgerond"` is, gaat rechtstreeks naar scherm 6 zonder
   opnieuw door de bouwblokken te hoeven klikken). Is deze actie
   zichtbaar, dan volgt een scheidingslijn, dan "← Terug naar Mijn metingen";
   is de invulling nog niet afgerond, dan staat er alleen "← Terug naar Mijn
   metingen", zonder scheidingslijn.
6. **Resultatenscherm**: Bovenaan de Resultaatkop met eyebrow, titel, subregel
   en totaalkaart (voorstel van 19 oktober 2026, `stylesheet.md`,
   Resultaatkop, voor elke scan dezelfde). De overall score staat daarin in de
   ring (`.score-ring`, `stylesheet.md`, Resultaten, besloten op 19 oktober 2026) en
   voortgang, radar van alle bouwblokken en staafdiagram per categorie naast elkaar
   (genummerde knooppunten met de namen in een tooltip, zonder getallen in de balken,
   gebouwd op 19 oktober 2026, `stylesheet.md`, Radar en staafdiagram op het resultaatscherm;
   het staafdiagram in de categoriekleuren, met de klassegrenzen als stippellijn, gebouwd op 19 oktober 2026, voorheen volgde de kleur de score), top 3 sterktes en verbeterkansen, legenda.
   **Bij AI-volwassenheid** (geen categorielaag, `content-ai-scan.md`)
   vervalt het staafdiagram per categorie: In plaats daarvan "Scores per
   domein", een staand kolomdiagram met een kolom per domein in volgorde 1 tot en met 8
   (een eigen kleur per domein, nummercirkels onder de kolommen en de namen in de tooltip;
   gebouwd op 20 oktober 2026, `stylesheet.md`, Radar en staafdiagram op het
   resultaatscherm, Domeinen). Het staat niet meer gesorteerd op score en scrolt niet.

   **Bij de Spanningsmeter** (voorstel) heeft het scherm geen overall score. Onder de Resultaatkop staan de Totaalkaart met het Gemiddeld niveau in de ring (een weergave, geen score), twee kaarten met de grootste spanning, de radar en de tabel Score per veld naast elkaar (hover in beide richtingen, zonder scroll), en bij een groep de voorbeelden uit de groep (alleen voor Leads, anoniem). Een respondent ziet Jouw profiel, een Lead met zichtbare groep kan schakelen naar Groep (`visualisatie-spanningsmeter.md`, Resultaat). Radar, staafdiagram per categorie en top 3 van de andere scans vervallen. De uitsplitsing per rol is vervallen en de kaart met voorbeelden uit de groep is gebouwd op 21 oktober 2026.

   **Bij Ja / Nee / Weet ik niet (Quickscan)** heeft het scherm een eigen
   opbouw: Een totaalkaart (met de ring, `content-ziekenhuis-quickscan.md`,
   Resultaten), een kaart per afdeling (categorie) met
   verdieping op de bouwblokken (dimensies), "Sterkste afdeling" en
   "Meeste ontwikkelruimte", en de legenda van de drie klassen. Radar,
   staafdiagram per categorie en top 3 vervallen. Een afdeling die niet
   van toepassing is staat er grijs en doorgestreept, en doet niet mee in
   de totaalscore of in "Sterkste afdeling" en "Meeste ontwikkelruimte". Uitwerking in `content-ziekenhuis-quickscan.md`,
   Resultaten. De Exporteren-dropdown toont voorlopig alleen de opties
   die voor dit type bestaan, dus nu geen. Het scherm heeft de schakelaar
   Per afdeling en Overzicht (`visualisatie-quickscan.md`, 1 en 2). De
   resultatenpagina van een Meting heeft voor dit type de weergaven Overzicht
   (het gemiddelde van de Meting), Gemiddelde en spreiding, en Antwoorden
   (`visualisatie-quickscan.md`, 3 en 4). Een benchmark tussen organisaties
   heeft weergave 5. Nog niet voor dit type: Een samengestelde Meting, een
   benchmark binnen een organisatie of een Meting, en Exporteren.

   **Weging in de resultaten**: Een bouwblok met een gewicht ongelijk
   aan 1 toont zijn factor ("2×") bij de naam, in de tooltip van de radar en in de
   lijst per bouwblok, en in de top 3 als het daarin staat. De getoonde
   bouwblokscore zelf blijft ongewogen. Categoriescore en overall zijn
   gewogen (zie Scoringslogica). Geen factor bij gewicht 1. Dezelfde
   markering komt terug in de PDF en staat als `gewicht` per bouwblok in
   de JSON-kolom `groepsScores` van de CSV (`export-csv.md`). De
   InDesign-export krijgt voorlopig alleen de gewogen scores
   (`export-indesign.md`, Weging). De PDF-specs
   (`export-pdf-visual-*.md`) volgen later; tot die tijd geldt deze
   regel ook voor de PDF.

   **`.nav-right`**: "← Terug naar de scan" samen met één knop
   "Exporteren" met een dropdown (opties "Als PDF", "Als CSV" en "Voor
   InDesign (XML)", zie `stylesheet.md`, niet losse knoppen), als
   scherm-specifieke acties, uiterst links, geen scheidingslijn tussen
   die twee onderling. Dan de scheidingslijn,
   dan "← Terug naar Mijn metingen". Eén gedeelde exportfunctie, zie
   `beheerpagina.md` en `export-indesign.md`.

**Bron voor de toelichting**: De bouwsteenbeschrijvingen in
`visie-coniche.md` deel 2. Zolang die op `concept` staan (zie
`inhoudelijk-fundament.md`), blijft de huidige tekst in de app staan.

---

## 4. Content per scan-type

- **Klantcontact Volwassenheid**: `content-klantcontact-volwassenheid.md`
  (15 bouwblokken, 5 categorieën, 60 vragen)
- **AI-volwassenheid in Klantcontact**: `content-ai-scan.md` (8 domeinen,
  geen categorie-laag, 40 vragen)
- **Klantcontact Volwassenheid – Zorg (Zorgscan)**: `content-zorgscan.md`
  (zelfde 15 bouwblokken/5 categorieën/60 vragen als hierboven,
  sector-variant met vraagteksten herschreven naar patiënt-/cliëntcontact,
  `afgeleidVanAssessmentId: "klantcontact-volwassenheid"`, zie
  `datamodel.md`, Sector-varianten). Bouwblok-omschrijving, -toelichting en
  -tags zijn nog niet sector-vertaald, zie het open punt bovenaan
  `content-zorgscan.md`.
- **Klantcontact Quickscan – Ziekenhuis**:
  `content-ziekenhuis-quickscan.md` (4 categorieën die de afdelingen
  zijn, 10 bouwblokken die de dimensies zijn, 60 vragen met Ja / Nee /
  Weet ik niet, standalone Assessment). Gebouwd op 14 oktober 2026.
- **Spanningsmeter**: `content-spanningsmeter.md` (6 spanningsvelden, geen categorie-laag, 30 gescoorde vragen plus 6 open voorbeeldvragen, antwoordType `spanning`, voorstel van 21 oktober 2026, gebouwd op 21 oktober 2026).
- **Adoptiescan**: Nog niet gestart

Elk contentbestand volgt dezelfde structuur: Per categorie de
bouwblokken met naam, omschrijving, tags en vragen.

---

## 5. Open punten

- Spanningsmeter (21 oktober 2026): Besloten door Joost: Open voorbeelden zijn alleen zichtbaar voor Leads, anoniem en pas vanaf het minimum aantal respondenten. Het Gemiddeld niveau blijft als weergave in de ring staan. Nog open: De drempelwaarden waarbij het Gemiddeld niveau op een niveau uitkomt (Joost levert een screenshot aan), de teksten van de Visie en de landingspagina die nog geverifieerd moeten worden, en de validatie van de vragen (`content-spanningsmeter.md`). Ook: Hoe de cirkel eruitziet bij meer dan vijf Assessments.

- Herontwerp van de Assessment-pagina's (21 oktober 2026, scherm 1 en 2, verwerkt in tweede ronde): Nog te beslissen. (1) De drie feature-cards komen niet meer terug; besloten: De zin "Elke vraag is gebaseerd op aantoonbaar bewijs" gaat naar de sectie Praktisch. (2) Besloten: "Start assessment" blijft altijd uitgeschakeld, ook voor een herkende Respondent; toegang loopt via de persoonlijke link. (3) Of de zin en de drie punten in het detailpaneel van de cirkel beheerbaar zijn of in de code staan, en of "Concrete stappen" klopt met wat het resultaat toont (`stylesheet.md`, Vervolgstappen). (4) De tekst "Wat is goed klantcontact?" uit `visie-coniche.md` deel 1 staat in het ontwerp niet apart in de sectie Visie. (5) Welke tekst bij de Zorgscan komt. (6) De film "De radar in je resultaten" staat niet op de Assessment-pagina's, alleen Wat krijg ik en Het dossier. (7) Of de teksten van Visie, Bouwstenen, AI en 2030 beheerbaar blijven zoals in `beheerpagina.md`, punt 11.


- Aggregatie over meerdere respondenten: Het gemiddelde per Meting is
  gebouwd (`beheerpagina.md`, Organisatie-resultaten). Afwijking en
  spreiding daarbovenop zijn ontworpen en nog niet gebouwd
  (`visualisatie-scores.md`).
- Benchmark: Alle niveaus zijn gebouwd. De open punten staan onderaan
  `benchmark.md`.
- Weging: De weging is gebouwd. De gewichten van de Zorgscan (bouwblok 4, 10
  en 11 op 2) zijn besloten: de spec is leidend. De seed staat op 2. De
  opgeslagen data moeten daarop staan.
- Quickscan Ziekenhuis: De open punten staan bovenaan
  `content-ziekenhuis-quickscan.md`, met per punt wat er is gebouwd. Ze
  zijn klein (een minimum voor een chip, of de radar wegblijft, namen in de
  wegingskaart en de voorstelteksten). De scan zelf heeft rework nodig
  (`backlog.md`). De open punten van de visualisaties staan onderaan
  `visualisatie-quickscan.md`.
- Verkennen: De open punten staan onderaan `visualisatie-verkennen.md`, onder
  andere of meerdere gekozen kanalen als "en" of "of" werken, de
  startwaarden van de vijf instelbare drempels (`visualisatie-verkennen.md`,
  Drempels).
- Rol/functie bij de respondent: Vrij tekstveld of vaste lijst.
- Focus- en error-states in formulieren (zie `stylesheet.md`).
