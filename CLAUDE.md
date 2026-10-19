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
| `visie-ai-klantcontact.md` | Visie op AI in klantcontact, per domein van de AI-volwassenheidsscan |
| `content-2030.md` | Duidingsstuk "Klantcontact richting 2030", los van de scanresultaten |
| `bouwstenenmodel-visual.md` | Spec voor het interactieve overzicht van de 15 bouwstenen |
| `ai-domeinenmodel-visual.md` | Spec voor het interactieve overzicht van de 8 AI-domeinen |
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
- **Help**: Gebouwd op 19 oktober 2026 (`help.md`). Een helppagina per rol
  (Respondent, Lead, Consultant en Admin) met 24 onderwerpen als Markdown in
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
eigen KPI-waarden, gebouwd op 19 oktober 2026). Niet "leden" of
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
2. Een verticale scheidingslijn, **alleen als punt 1 iets bevat**.
3. **De 4 vaste content-links** (Visie, Bouwstenen, AI, 2030, zie
   verderop in deze sectie). Aanwezig op elk scherm, inclusief de 3
   publieke schermen (Kies jouw assessment, Assessment-landingspagina,
   Voorbeeld-output) en het intake-scherm.
4. Een verticale scheidingslijn, **alleen als punt 5 iets bevat**.
5. Uiterst rechts de link om de sectie te verlaten, met een `←` ervoor
   (bijv. "← Terug naar Mijn metingen" op de doorloopflow, de
   resultatenpagina en de 4 content-pagina's). Op de 4 content-pagina's
   staat deze link alleen bij een herkende gebruiker; zonder sessie
   ontbreekt hij, met de scheidingslijn ervoor (punt 4), en eindigt de
   nav op de 4 links en "Inloggen". Terug gaat dan via het logo.
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
   assessment, de andere publieke schermen en de 4 content-pagina's
   zonder sessie) staat hier in plaats daarvan **"Inloggen"** —
   zelfde plek, uitgelogde variant van datzelfde slot, geen dropdown en
   geen pijltje ervoor of erachter. Het slot is dus nooit leeg: Met een
   herkende gebruiker staat er het menu, zonder staat er "Inloggen". Conventie: Een account-/profielmenu
   (of de uitgelogde variant ervan) staat vrijwel altijd als
   allerlaatste element in een nav, voorbij eventuele terug-links, niet
   ervoor. Dit corrigeert een eerdere versie van deze spec die het
   Accountmenu links van de exit-actie plaatste.

**Geen scheidingslijn zonder inhoud aan beide kanten.** Op "Mijn
metingen" bijvoorbeeld staan de 4 links en het "Mijn gegevens"-menu,
met precies één scheidingslijn ertussen: Geen scherm-specifieke actie
(punt 1) en geen exit-actie (punt 5) op dat scherm, dus geen
scheidingslijn dáár.

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
zit (intake, doorloopflow, resultaten, Mijn metingen, en de 4
content-pagina's), gaat het logo naar "Mijn metingen" in plaats van naar
de publieke homepage. Dit stond nergens vastgelegd, dus `#/` overal was
geen afwijking van de spec maar een gat erin.

### Schermen

1. **Kies jouw assessment**: Kaarten per Assessment-type, generiek over
   `Assessment[]`. **`.nav-right`**: De 4 vaste content-links, dan
   "Inloggen" in het identiteitsmenu-slot (Globale layout hierboven,
   punt 7) — gaat naar scherm 4a, Toegang (e-mail + verificatiecode),
   voor een respondent/Lead die al een account heeft maar zijn
   persoonlijke link niet bij de hand heeft. Nu de enige weg naar
   scherm 4a buiten "Uitloggen" om. Geen scherm-specifieke actie op dit
   scherm (punt 1 leeg), dus geen scheidingslijn daarvóór.
2. **Assessment-landingspagina**: Titel, hero, 3 feature-cards en een
   blok "Praktische informatie" met invultijd, direct resultaat en
   privacy. "Start assessment" staat direct onder de hero maar is
   uitgeschakeld, met de uitleg dat toegang via een persoonlijke link
   loopt. Tussen de drie kaarten en "Praktische informatie" staat de film "Wat
   krijg ik" met stapkaarten (`help.md`, Films, gebouwd op 19 oktober 2026,
   niet bij een scan met Ja / Nee / Weet ik niet), met daaronder de knop
   "Bekijk de voorbeeld-output" naar scherm 3. Die knop vervangt de link
   "Bekijk wat je krijgt" verderop op de pagina. Alle cijfers in de film
   zijn voorbeelddata. Deze pagina
   wordt later mogelijk een leadgenerator met "Toegang aanvragen"
   (`backlog.md`).
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
   - De nav toont hier de 4 vaste content-links en "Inloggen" (Globale
     layout, punt 3 en 7). "← Terug" staat in de kop en niet ook in de nav.
   Onder die kop staat bij de Klantcontact Volwassenheidsscan, de
   AI-volwassenheidsscan en de Zorgscan de weergave Per bouwblok
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
   Knoppen: "Start de scan", "Ga verder", "Bekijk jouw resultaten".

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

   **In de header van "Mijn metingen" staan de 4 vaste content-links**
   (zie de Globale layout hierboven, punt 1 van `.nav-right`), elk naar
   een gewone leespagina (geen modal, geen visual, alleen tekst):
   - **Visie** → `visie-coniche.md` deel 1
   - **Bouwstenen** → de interactieve bouwstenenmodel-visual, route
     `/bouwstenen` (`bouwstenenmodel-visual.md`). Geen aparte leespagina
     meer: De beschrijving en centrale vraag per bouwsteen
     (`visie-coniche.md` deel 2) komen uitsluitend nog terug in de
     modal die opent bij het klikken op een bouwsteen binnen dit
     component.
   - **AI** → de interactieve ai-domeinenmodel-visual, route `/ai-scan`
     (`ai-domeinenmodel-visual.md`). Zelfde patroon: `visie-ai-
     klantcontact.md` levert de modal-content per domein, geen losse
     leespagina.
   - **2030** → `content-2030.md`, gewone leespagina (geen modal, geen
     visual, alleen tekst)

   **Deze 4 links staan op elk scherm van de app**, zie de Globale
   layout hierboven. Sta je al op "Visie", dan zie
   je in `.nav-right` nog steeds ook Bouwstenen/AI/2030, zodat je
   rechtstreeks naar een andere kunt springen zonder eerst terug te
   gaan. Op de 4 content-pagina's, de doorloopflow en de
   resultatenpagina komt daarna, na de scheidingslijn, de losse
   exit-actie "← Terug naar Mijn metingen" (zie de nav-volgorderegel
   hierboven). Die 4 links plus de terugknop staan dus naast elkaar, de
   een vervangt de ander niet. Op Mijn metingen zelf is die terugknop er
   niet, dat is al de hub.

   Voor nu staan alle vier er altijd, ongeacht welke scan-type(s) de
   respondent heeft. **Open, te bespreken met Sander**: Of Bouwstenen en
   AI straks conditioneel worden (alleen tonen bij het bijbehorende
   scan-type), zoals eerder overwogen. Nog geen besluit, bewust als
   vraag laten staan in plaats van stilzwijgend een van beide te kiezen.

   **"Mijn gegevens"-menu.** Niet te verwarren met het Accountmenu uit
   `beheerpagina.md` (dat is voor beheerders, dit is voor
   respondenten): Een dropdown-knop, zelfde patroon als de Dropdown-knop
   uit `stylesheet.md`. Zichtbaar op elk scherm waar een respondent-
   identiteit bestaat: "Mijn metingen", de doorloopflow, de
   resultatenpagina en de 4 content-pagina's, wanneer bereikt via een
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
   zichtbaar, dan volgt een scheidingslijn; is de invulling nog niet
   afgerond, dan begint `.nav-right` direct met de 4 vaste links, geen
   losse scheidingslijn. Dan de 4 vaste content-links, dan de
   scheidingslijn, dan "← Terug naar Mijn metingen".
6. **Resultatenscherm**: Overall score in de ring (`.score-ring`,
   `stylesheet.md`, Resultaten, besloten op 19 oktober 2026) en
   voortgang, radar van alle bouwblokken, staafdiagram per categorie
   (in de categoriekleuren, met de klassegrenzen als stippellijn, gebouwd op 19 oktober 2026, voorheen volgde de kleur de score), top 3 sterktes en verbeterkansen, legenda.
   **Bij AI-volwassenheid** (geen categorielaag, `content-ai-scan.md`)
   vervalt het staafdiagram per categorie: In plaats daarvan "Scores per
   Domein", een horizontale balk per domein individueel, gesorteerd van
   hoog naar laag (`Assessment.scoresPerGroepGesorteerd`).

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
   aan 1 toont zijn factor ("2×") bij de naam, in de radar-legenda en de
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
   die twee onderling. Dan de scheidingslijn, dan de 4 vaste
   content-links (zie Globale layout hierboven). Dan de scheidingslijn,
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
- **Adoptiescan**: Nog niet gestart

Elk contentbestand volgt dezelfde structuur: Per categorie de
bouwblokken met naam, omschrijving, tags en vragen.

---

## 5. Open punten

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
