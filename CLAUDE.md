# Coniche Scan: Projectspecificatie

De specificatie van de Coniche Scan-app. Dit bestand bevat de uitgangspunten, de terminologie, de scoringslogica en de index op de andere specs. De schermen staan in `schermen.md`, het datamodel in `datamodel.md` en de opmaak in `stylesheet.md`. De spec beschrijft hoe iets moet werken; wat daarvan gebouwd is, staat in de statustabel hieronder. Waar de spec ambigu of onvolledig is, wordt dat hier opgelost.

## Bestanden

**Kern**

| Bestand | Inhoud |
|---|---|
| `CLAUDE.md` | Dit document: Uitgangspunten, status, terminologie, scoring en index |
| `schermen.md` | De schermen van de respondent- en leadkant op naam, met de navigatieregel |
| `datamodel.md` | Het datamodel: Objecten, velden, scoreberekening, benchmark en de regels erbij |
| `datamodel-rollen.md` | Rollen, rechten en inlog |
| `stylesheet.md` | Alle opmaak: Kleuren, typografie, componenten |
| `beheerpagina.md` | De beheeromgeving, met een inhoudsopgave bovenaan |
| `bouwnotities.md` | Het archief van de bouw: Wat er per datum is gebouwd en hoe. Geen spec |

**Content per Assessment**

| Bestand | Inhoud |
|---|---|
| `content-klantcontact-volwassenheid.md` | Vragen en tags van de Klantcontact Volwassenheidsscan |
| `content-zorgscan.md` | Vragen van de Zorgscan, sector-variant van de Klantcontact Volwassenheidsscan |
| `content-ai-scan.md` | Vragen van de AI-volwassenheidsscan |
| `content-ziekenhuis-quickscan.md` | Afdelingen (categorieën), dimensies (bouwblokken), vragen en resultaatopbouw van de Klantcontact Quickscan – Ziekenhuis (Ja / Nee / Weet ik niet) |
| `content-spanningsmeter.md` | Vragen, ijkpunten, open voorbeeldvragen en achtergrondvragen van de Spanningsmeter (zes spanningsvelden, 30 gescoorde vragen), met de rekenregels en een validatieplan |
| `content-respondentrol.md` | De vaste lijst bij het veld Rol / functie van de Respondent |
| `content-techstack.md` | De vaste lijsten bij de organisatievelden Techstack, oplossingen en ondersteunende partijen |

**Visie en uitleg**

| Bestand | Inhoud |
|---|---|
| `visie-coniche.md` | Visie op goed klantcontact en de vijftien bouwblokken |
| `inhoudelijk-fundament.md` | Hoe visie, bouwblokken en scan samenhangen, met status per onderdeel |
| `visie-ai-klantcontact.md` | Visie op AI in klantcontact, per domein van de AI-volwassenheidsscan |
| `content-2030.md` | Duidingsstuk "Klantcontact richting 2030", los van de scanresultaten; sectie op de Assessment-pagina van de AI-scan |
| `visual-bouwblokken-en-domeinen.md` | Het interactieve overzicht van de 15 bouwblokken (Volwassenheid en Zorg) en de 8 AI-domeinen (AI), een sectie op de Assessment-pagina |
| `privacy-pagina.md` | De privacypagina |
| `help.md` | De helppagina in de app: Een regel Help in het menu, uitleg per rol met illustratie, als Markdown-bestanden in `help/` |

**Resultaten en vergelijken**

| Bestand | Inhoud |
|---|---|
| `visualisatie-scores.md` | Hoe hoge en lage scores getoond worden: Één meting, spreiding binnen een Meting, tussen Metingen, tussen organisaties en de matrix over Metingen |
| `visualisatie-quickscan.md` | Visualisaties van de Quickscan Ziekenhuis in percentages: Eigen resultaat (twee standen), gemiddelde en spreiding, antwoorden per vraag en benchmark |
| `visualisatie-spanningsmeter.md` | Visualisaties van de Spanningsmeter: Het beeld in de cirkel, de doorloopflow, Mijn metingen, het resultaat van een respondent en van een groep, de landingspagina en de film Wat krijg ik |
| `visualisatie-mijn-metingen.md` | Opmaak van Mijn metingen voor Respondent en Lead: Kaarten, statussen, teaser van de uitkomst, respons, benchmarkkaart |
| `visualisatie-verkennen.md` | Admin-scherm Verkennen onder Resultaten: Filteren, groeperen en vergelijken van alle Organisaties van één Assessment, met vier weergaven |
| `benchmark.md` | Benchmark op drie niveaus: Tussen organisaties (geaggregeerd en anoniem, met een view per organisatie voor een Lead), binnen een organisatie tussen Metingen, en binnen een Meting |
| `dossier.md` | Het Dossier van een Organisatie: Nieuws, Cases, Events en Blogs die een Consultant samenstelt en openzet voor de Lead, met koppeling aan bouwblokken, de radar met filter en de verdeling (Basis op orde, Uitbouwen, Sterk punt) met de rail "In dit dossier", de Afspraak "Mag als case gebruikt worden" en de rechten |

**Export en import**

| Bestand | Inhoud |
|---|---|
| `export-pdf-visual-volwassenheidsscan.md` | PDF-export van één ingevulde scan: Gedeelde regels (bron, slotsectie, bulk-export) plus de visuele opbouw voor de Klantcontact Volwassenheidsscan |
| `export-pdf-visual-ai-scan.md` | PDF-export: Visuele opbouw voor de AI-volwassenheidsscan, verschillen t.o.v. de Klantcontact Volwassenheidsscan |
| `export-pdf-visual-zorgscan.md` | PDF-export: Visuele opbouw voor de Zorgscan, verschillen t.o.v. de Klantcontact Volwassenheidsscan (grotendeels geen) |
| `export-indesign.md` | Export van één ingevulde scan als XML + losse chart-afbeeldingen, voor handmatige verwerking in een InDesign-sjabloon |
| `export-csv.md` | Export naar CSV: Kolommen voor de "Als CSV"-optie, één of meerdere scans |
| `import-scans.md` | Import van scans (CSV): De oude, stopgezette tool, en onze eigen export teruglezen |
| `sbi-indeling.md` | Vaste optielijst voor Sector/Subsector (SBI2025, top 2 niveaus) |

**Plannen**

| Bestand | Inhoud |
|---|---|
| `backlog.md` | Bewust nog niet opgepakt |
| `go-live-plan.md` | Actielijst naar productie |
| `azure-plan.md` | Aanvulling op `go-live-plan.md` met de stappen voor de Azure-omgeving (Azure DevOps, Azure SQL, `coniche-scan.nl`) |

**In de repo**

| Bestand | Inhoud |
|---|---|
| `AGENTS.md` | Instructies voor AI-agents |
| `README.md` | Korte uitleg van de repo en hoe je de app lokaal draait |
| `changelog.md` | Bouwlog van Sander: Per datum wat er in de code veranderd is, waarom, en welke specs daarbij zijn bijgewerkt |

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
- De spec beschrijft hoe iets moet werken. Of het gebouwd is, staat in de statustabel hieronder en de bouwhistorie in `bouwnotities.md`; in de lopende tekst van de specs staan geen datums, besluitnemers of bouwstatus.
- Dit bestand blijft klein. Datamodel en opmaak worden niet bij elke sessie meegeladen: Lees bij een wijziging aan datatypen of database eerst `datamodel.md`, bij een wijziging aan de vormgeving `stylesheet.md`.

## Status

Wat gebouwd is, per onderdeel. De spec van het onderdeel beschrijft hoe het moet werken; de bouwhistorie staat per datum in `bouwnotities.md`.

| Onderdeel | Status | Spec | Toelichting |
|---|---|---|---|
| Doorloopflow, beheeromgeving en Resultaten | Gebouwd | `schermen.md`, `beheerpagina.md` | Voor de Klantcontact Volwassenheidsscan, de AI-volwassenheidsscan en de Zorgscan |
| Opslag | Prototype | `backlog.md`, `azure-plan.md` | Data in de localStorage van de browser en een tijdelijke serveropslag (Neon); de database wordt Azure SQL Database. Zonder gedeelde opslag werkt een link alleen in de browser waar de data staat |
| Inlog en rollen | Prototype | `datamodel-rollen.md` | E-mail en wachtwoord voor beheer; de rollen zijn een testhulp. Definitieve rollen, rechten en 2FA volgen met de backend |
| Toegang respondenten | Gebouwd, zonder verificatiecode | `datamodel.md` (Toegangscode), `schermen.md` (Toegang) | E-mailverificatie volgt met een backend en een Coniche-mailserver |
| Export (PDF, CSV, InDesign) | Gebouwd | `export-*.md` | Voor de schaalscans; niet voor de Quickscan en de Spanningsmeter |
| Benchmark | Gebouwd | `benchmark.md` | Alle drie de niveaus |
| Verkennen | Gebouwd | `visualisatie-verkennen.md` | Nog niet voor de Quickscan Ziekenhuis, voor een Consultant en voor meerdere Metingen per Organisatie |
| Aggregatie over meerdere respondenten | Deels gebouwd | `visualisatie-scores.md` | Het gemiddelde per Meting is gebouwd; afwijking en spreiding zijn ontworpen |
| Dossier | Gebouwd | `dossier.md` | Niet in exports en import |
| Contactpersonen | Gebouwd | `datamodel.md`, `beheerpagina.md` | Alleen een Admin wijzigt ze |
| KPI's per plek en kanaal | Gebouwd | `datamodel.md`, `beheerpagina.md` | Het design staat in `Claude outputs/kpi-design/` |
| Mijn metingen | Gebouwd | `visualisatie-mijn-metingen.md` | Inclusief de kaart met cirkel |
| Opmaak (lettergroottes, pil, scorekleur, balklijst, resultaatkop, radar en staafdiagram) | Gebouwd | `stylesheet.md` | De PDF-export valt er niet onder |
| Help | Gebouwd | `help.md` | De inhoud wacht op beoordeling door Joost |
| Quickscan Ziekenhuis | Deels gebouwd | `content-ziekenhuis-quickscan.md`, `visualisatie-quickscan.md` | Doorloopflow, resultaat en visualisaties zijn gebouwd; PDF, CSV, InDesign, import, vergelijking tussen Metingen en benchmark binnen een organisatie of Meting volgen (`backlog.md`) |
| Spanningsmeter | Deels gebouwd | `content-spanningsmeter.md`, `visualisatie-spanningsmeter.md` | Open: De validatie van de vragen en de verificatie van de teksten |
| AI-managementsamenvatting | Uitgesteld | `backlog.md` | |
| Adoptiescan | Niet gestart | | |

## Terminologie

In de interface en in alle specs gelden deze termen. In de code heten sommige typen nog anders; dat staat in het datamodel.

| Term | Betekenis | Niet gebruiken |
|---|---|---|
| **Assessment** | Een scan-type: Klantcontact Volwassenheid, Zorg, AI-volwassenheid, Quickscan Ziekenhuis of Spanningsmeter | |
| **Organisatie** | De klant waarbij gemeten wordt | |
| **Meting** | Een afname van één Assessment bij één Organisatie, voor één Onderdeel op één meetdatum | Scanuitvoering |
| **Respondent** | De persoon die een scan invult | Lid |
| **Ingevulde scan** | Eén invulling door één Respondent binnen één Meting | |
| **Onderdeel** | Een deel van een Organisatie met een eigen naam en eigen KPI-waarden | Afdeling, rolgroep |
| **Bouwblok** | Een van de 15 bouwblokken van de Klantcontact Volwassenheidsscan | Bouwsteen |
| **Spanningsveld** | Een van de zes velden van de Spanningsmeter. In de code een bouwblok; in de interface nooit "bouwblok" | |

## Assessments en functies

Wat elk Assessment kent. Een lege cel is niet gespecificeerd.

| | Klantcontact Volwassenheid | Zorg | AI-volwassenheid | Quickscan Ziekenhuis | Spanningsmeter |
|---|---|---|---|---|---|
| Antwoordtype | Schaal 1 tot 5 | Schaal 1 tot 5 | Schaal 1 tot 5 | Ja / Nee / Weet ik niet | Spanning (1 tot 5, en 0 voor "Kan ik niet beoordelen") |
| Opbouw | 15 bouwblokken in 5 categorieën | 15 bouwblokken in 5 categorieën | 8 domeinen, geen categorielaag | 4 afdelingen met 10 dimensies | 6 spanningsvelden, geen categorielaag |
| Vragen | 60 | 60 | 40 | 60 | 30 gescoord, 6 open |
| Gewichten per bouwblok | Nee | Ja (bouwblok 4, 10 en 11 op 2) | Nee | Nee | Nee |
| Totaalscore | Ja | Ja | Ja | Ja, in procenten | Nee: Een profiel van zes veldscores |
| Radar en staafdiagram per categorie | Ja | Ja | Radar; kolomdiagram per domein | Nee | Radar; tabel Score per veld |
| Per afdeling of veld | | | | Ja | Ja |
| PDF-export | Ja | Ja | Ja | Nee | Nee (`backlog.md`) |
| CSV-export | Ja | Ja | Ja | Nee | Nee (`backlog.md`) |
| InDesign-export | Ja | Ja | Ja | Nee | Nee (`backlog.md`) |
| Benchmark | Ja | Ja | Ja | Ja (tussen organisaties) | |
| Dossier | Ja | Ja | Ja | Nee | Nee |
| Verkennen | Ja | Ja | Ja | Nee | |
| Sector-variant van | | Klantcontact Volwassenheid | | | |

## Scoringslogica

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
- **Totaalscore**: `Σ(g × som antwoorden per bouwblok) / Σ(g × aantal
  vragen per bouwblok)`. Bij gewicht 1 overal is dat de som van alle
  antwoorden gedeeld door 60. Dit is niet het gemiddelde van de
  categoriescores: Categorieën hebben een ongelijk aantal bouwblokken (2,
  4, 4, 4, 1) en zouden anders ongelijk meewegen. De totaalscore komt uit de
  ruwe antwoorden en niet uit afgeronde bouwblokscores.
- **Afronding**: Half-away-from-zero (zoals JS `toFixed(1)`), alleen op
  getoonde waarden.
- **Voortgang**: Beantwoorde vragen gedeeld door het totaal aantal vragen
  in de scan.
- **Status in de sidebar**: Nog niet begonnen (grijs nummer), bezig
  (gevuld cirkeltje met "x/4" naast de titel), afgerond (groen vinkje).

### Classificatie

- "Basis op orde" (onder 2,5): "De basis moet op dit punt eerst op orde
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

Het percentage is leidend en de punten zijn daaruit afgeleid: 12 van 15 is precies 80% en dus Goed op orde. Kleuren: De bestaande
groen, oranje en rood uit `stylesheet.md`, Scorekleuren.

De totaalscore gebruikt dezelfde drie grenzen met eigen namen: "Sterk
ontwikkeld", "Gemiddeld ontwikkeld" en "Aanzienlijke ontwikkelruimte"
(`content-ziekenhuis-quickscan.md`, Afspraken over de inhoud).

### Scorekleuren

Elke score krijgt een kleur op basis van de afgeronde waarde: 5
donkergroen, 4 lichtgroen, 3 geel, 2 oranje, 1 rood. Basis op orde is
daarmee rood of oranje, Uitbouwen geel, Sterk punt licht- of donkergroen.
Tokens en details in `stylesheet.md`. Daar staan ook de drie niveaus van
scorekleur (band, cel, vol): Een cel met een getal krijgt een zachte celtint
en nooit de volle kleur.

### Top 3

De bouwblokken gesorteerd op score: De hoogste 3 zijn de sterktes, de
laagste 3 de verbeterkansen.

## Kleuren per categorie

Overkoepelend oranje, Organisatie blauw, Proces & Tech paars, Mens groen,
Fundament geel (het merkgeel `#ffc043`, daarvoor antraciet). Fundament is alleen een vulling, dus tekst in en bij die kleur staat in `--ink` (`stylesheet.md`, Categoriekleuren). De interactieve flow gebruikt deze kleuren; de
PDF-export gebruikt overal oranje.

Alle opmaakwaarden (hexcodes, tekstkleuren, scorekleuren, knopstaten)
staan uitsluitend in `stylesheet.md`.

## Content per Assessment

- **Klantcontact Volwassenheid**: `content-klantcontact-volwassenheid.md` (15 bouwblokken, 5 categorieën, 60 vragen)
- **AI-volwassenheid in Klantcontact**: `content-ai-scan.md` (8 domeinen, geen categorielaag, 40 vragen)
- **Klantcontact Volwassenheid – Zorg (Zorgscan)**: `content-zorgscan.md` (dezelfde 15 bouwblokken, 5 categorieën en 60 vragen als de Klantcontact Volwassenheidsscan; sector-variant met vraagteksten herschreven naar patiënt- en cliëntcontact, `afgeleidVanAssessmentId: "klantcontact-volwassenheid"`, zie `datamodel.md`, Sector-varianten). Bouwblok-omschrijving, -toelichting en -tags zijn nog niet sector-vertaald, zie het open punt bovenaan `content-zorgscan.md`.
- **Klantcontact Quickscan – Ziekenhuis**: `content-ziekenhuis-quickscan.md` (4 categorieën die de afdelingen zijn, 10 bouwblokken die de dimensies zijn, 60 vragen met Ja / Nee / Weet ik niet, standalone Assessment)
- **Spanningsmeter**: `content-spanningsmeter.md` (6 spanningsvelden, geen categorielaag, 30 gescoorde vragen plus 6 open voorbeeldvragen, antwoordType `spanning`)

Elk contentbestand volgt dezelfde structuur: Per categorie de bouwblokken met naam, omschrijving, tags en vragen.

## Open punten

De open punten staan onderaan het bestand van het onderdeel:

| Onderdeel | Bestand |
|---|---|
| Schermen en Assessment-pagina's | `schermen.md` |
| Benchmark | `benchmark.md` |
| Quickscan Ziekenhuis | `content-ziekenhuis-quickscan.md`, `visualisatie-quickscan.md` |
| Verkennen | `visualisatie-verkennen.md` |
| Spanningsmeter | `content-spanningsmeter.md`, `visualisatie-spanningsmeter.md` |
