# Coniche Scan — Changelog

## 2026-09-29 — Bug: crash op oudere/beschadigde localStorage-data

**Gemeld door Sander**: In een gewone browser (niet de testomgeving hier)
crashte de app met `TypeError: Cannot read properties of undefined
(reading 'find')` op `organisatie.leden.find(...)` in
`zoekRespondentPerToegangscode` (`lib/db.ts`), bij het openen van een
persoonlijke link.

**Oorzaak**: Die browser had al langer een eigen
`coniche-scan:organisaties`-snapshot in localStorage staan, van vóór een
eerdere wijziging aan het `Organisatie`-type in deze sessie. Er bestaat
geen migratiepad voor de opslag (CLAUDE.md, Status: "Alles staat nog in de
localStorage") — `getSnapshot()` zaait alleen vers wanneer de sleutel
volledig ontbreekt, en leest een bestaande snapshot altijd letterlijk
terug, ook als die niet meer helemaal met het huidige type overeenkomt.
Elke plek in `lib/db.ts` (tientallen aanroepen) ging er vervolgens
klakkeloos van uit dat `organisatie.leden`/`scanUitvoeringen`/
`invullingen` altijd arrays zijn — één organisatie-record zonder `leden`
crasht dan de hele app, niet alleen die ene organisatie.

**Fix**: Nieuwe `normaliseerOrganisatie` in `lib/db.ts`, toegepast in
`parseSnapshot` (dus voor elke lezing, via zowel de hooks als
`laadAlles()`): Zet `leden`/`scanUitvoeringen` altijd naar een array
(leeg als ze ontbreken of geen array zijn), en doet hetzelfde voor
`invullingen` binnen elke `scanUitvoering` en voor `kenmerken`. Geen
inhoudelijke migratie, alleen de vorm rechtgetrokken zodat de rest van de
code veilig kan blijven aannemen dat deze velden bestaan.

**Getest**: Een organisatie-record zonder `leden` en zonder
`invullingen` (exact het gemelde scenario) in localStorage geplant en
`/s/[code]` geopend — toont nu netjes "Ongeldige link" in plaats van te
crashen, en `/beheer/organisaties` toont de kapotte organisatie als "0
respondenten, 0 afgerond" zonder de rest van de pagina mee te trekken.
`tsc --noEmit`, `eslint .` en `next build` blijven schoon.

## 2026-09-29 — Bug: legacy-import verwarde Zorgscan met het template

**Gemeld door Sander**: De laatste CSV-import was een Zorgscan-invulling,
maar kwam binnen als "Klantcontact Volwassenheid" — de twee lijken op
elkaar (zelfde bouwblokken), maar de Zorgscan-vraagteksten zijn anders
geformuleerd.

**Oorzaak**: `detecteerAssessment` (`lib/import-legacy.ts`,
`import-legacy-scans.md`, "Assessment- en bouwblok-matching") bepaalde het
scan-type alleen op bouwblok-/domeinnamen. Sinds de Zorgscan bestaat (vorige
changelog-entry) is die aanname niet meer waar: Een sector-variant kopieert
de bouwblok-namen van zijn template één-op-één, dus de Klantcontact
Volwassenheidsscan en de Zorgscan hebben exact dezelfde 15 namen. De functie
liep de Assessment-lijst in vaste volgorde af en gaf de eerste treffer terug
— altijd de Klantcontact Volwassenheidsscan, omdat die als eerste in
`data/assessments.ts` staat, ongeacht welke van de twee het echt was.

**Fix**: `detecteerAssessment` doet er nu een tweede stap bij wanneer de
naam-stap meerdere kandidaten oplevert: De vraagteksten in de CSV
(`questionText`, op volgorde per blok) vergelijken met de vraagteksten van
elke kandidaat. Is er precies één kandidaat waarvan alle vraagteksten
woordelijk overeenkomen, dan is dat het gedetecteerde type. Blijft dat
alsnog onbepaald (bijv. ontbrekende `questionText`, of — in theorie — twee
scan-types met zowel identieke namen als identieke vraagteksten), dan
importeert de tool niets en meldt een duidelijk matchingprobleem, dezelfde
"niet importeren en melden"-regel als de rest van deze import.
`import-legacy-scans.md` bijgewerkt met deze tweede stap.

**Bestaande foute data hersteld**: De al geïmporteerde meting
("Huisartsenpraktijk Fictief-2", Legacy-import 2026) stond met
`assessmentId: "klantcontact-volwassenheid"` en antwoorden onder
Klantcontact's vraag-id's (`bb1-v1`, ...) terwijl het de Zorgscan-invulling
was. Rechtgezet met een eenmalige migratie: `assessmentId` naar
`"zorgscan"`, en elke antwoord-/opmerking-sleutel 1-op-1 herschreven naar
de overeenkomstige Zorgscan-id op dezelfde positie (bouwblok-volgnummer +
vraagvolgnummer) — beide Assessments hebben identieke structuur, dus deze
mapping is exact, geen educated guess. Geverifieerd: De resultatenpagina en
`/beheer/scans/...` tonen nu "Klantcontact Volwassenheid – Zorg" met de
echte zorg-vraagteksten en de oorspronkelijke scores (2.0 op alles).

**Getest**: Een synthetische Klantcontact-rij en een synthetische
Zorgscan-rij (identieke bloknamen, eigen vraagteksten) door
`valideerLegacyRijen` gehaald — elk resolvet nu naar het juiste type.
`tsc --noEmit`, `eslint .` en `next build` blijven schoon.

## 2026-09-29 — Zorgscan: eerste echte sector-variant

**Aanleiding**: Sander leverde Joost's bronmateriaal aan (`zorgscan.pdf`,
de PDF-export van een proefinvulling voor een fictieve huisartsenpraktijk,
plus de bijbehorende CSV-export met de 60 vraagteksten in gestructureerde
vorm). Daarmee kon het generieke sector-variant-mechanisme (vorige
changelog-entry) voor het eerst met echte content gevuld worden — het punt
dat toen nog open stond.

**Doorgevoerd**:

- **`data/zorgscan-assessment.ts`**: Nieuw Assessment "Klantcontact
  Volwassenheid – Zorg" (`id: "zorgscan"`, `kortLabel: "Zorgscan"`,
  `afgeleidVanAssessmentId: "klantcontact-volwassenheid"`). Zelfde 15
  bouwblokken, 5 categorieën, volgorde en gewichten (allemaal nog 1) als
  het template — alleen de 60 vraagteksten zijn vervangen door Joost's
  zorg-versie (patiënt-/cliëntcontact, medische/niet-medische
  contactredenen). Toegevoegd aan `data/assessments.ts`, dus voortaan
  standaard aanwezig naast de Klantcontact Volwassenheidsscan en de
  AI-volwassenheidsscan (`CLAUDE.md`, Status).
- **`content-zorgscan.md`** (nieuw): De spec-vastlegging van alle 60
  vraagteksten per bouwblok, zelfde structuur als
  `content-klantcontact-volwassenheid.md`. Bevat een expliciet open punt
  voor Joost: Bouwblok-omschrijving, -toelichting en -tags zijn bewust nog
  niet sector-vertaald — dat stond letterlijk zo genoteerd in zijn
  brondocument ("terminologie in toelichtingenbalkje nog aanpassen op
  zorg(taal)"). Zolang dat niet gebeurd is, valt de toelichting-overlay
  per bouwblok terug op de generieke tekst (bestaand, correct
  fallbackgedrag van `lib/bouwblok-info.ts` — geen rijke "CENTRALE
  VRAAG"-content zoals bij de Klantcontact Volwassenheidsscan, omdat er
  nog geen zorg-versie van `visie-coniche.md` deel 2 bestaat).
- **Nieuw icoon "heart"** (`components/icons/AssessmentIcons.tsx`): De
  twee bestaande scans gebruiken "target"/"sparkle"; de Zorgscan kreeg een
  eigen icoon in plaats van een van die twee te hergebruiken.
- **`data/demo-antwoorden-zorgscan.ts`** + wiring in
  `data/demo-antwoorden-per-assessment.ts`: Demo-data met spreiding voor
  de "Voorbeeld-output"-preview (scherm 3), naar het patroon van
  `data/demo-antwoorden.ts` — niet de vlakke "alles 2" van Joost's
  proefinvulling, die was puur bedoeld om de vraagteksten te controleren.
- **`CLAUDE.md`/`backlog.md`**: Bestandenlijst, Status en sectie 4
  bijgewerkt; het "Zorg-variant bouwen"-punt uit de backlog gehaald (nu
  gebouwd).

**Getest in de browser**: Kaart op "Kies jouw assessment" en de
assessment-landingspagina (heart-icoon, sector-tekst), de
Voorbeeld-output-preview (score 3.1, "Uitbouwen", 60/60 vragen, radar en
staafdiagram met alle 15 bouwblokken/5 categorieën), en het
contentbeheerscherm (`/beheer/content/zorgscan`): Alle 60 vraagteksten
correct geladen en bewerkbaar, gewicht-velden op 1, "Afgeleid van:
Klantcontact Volwassenheid" zichtbaar in zowel de lijst als de
detailpagina. `tsc --noEmit`, `eslint .` en `next build` lopen schoon door.

**Niet meegenomen (bewust)**: De PDF- en InDesign-export, CSV-export en
alle overige generieke functionaliteit werken automatisch mee omdat ze
assessment-agnostisch gebouwd zijn (`CLAUDE.md`, Uitgangspunten) — daar is
niets scan-specifieks aan aangepast of hoeven aanpassen.

## 2026-09-28 — Sector-varianten, gewichten en InDesign-export

**Aanleiding**: Drie backlog-punten in één keer opgepakt, alle drie al
gespecificeerd in de MD's: `Categorie.gewicht`/`Bouwblok.gewicht`
(`datamodel.md`), het generieke mechanisme om een Assessment leeg of als
sector-variant aan te maken (`datamodel.md`, "Sector-varianten";
`admin-beheerpagina.md`, punt 1), en de InDesign-export
(`export-indesign.md`).

**Gewichten**:

- `Categorie` en `Bouwblok` hebben nu een `gewicht`-veld (`lib/types.ts`),
  standaard `1`, bewerkbaar in het contentbeheer
  (`app/beheer/content/[assessmentId]/page.tsx`: een "Gewicht"-invoerveld
  naast de kleur bij een categorie, en in `BouwblokEditor`). **Heeft nog
  geen effect op de score-berekening**: Die blijft het ongewogen
  gemiddelde uit `CLAUDE.md` sectie 1. Het veld ligt klaar voor de
  Zorg-variant, die met echte historische zorg-gewichten moet komen.
- Bestaande content (`data/klantcontact-assessment.ts`,
  `data/ai-scan-assessment.ts`) kreeg `gewicht: 1` op elke categorie en
  elk bouwblok.

**Assessment-types, generiek aanmaken**:

- `Assessment.afgeleidVanAssessmentId` (`lib/types.ts`): informatief veld,
  wijst naar het Assessment waar een sector-variant vanaf gekopieerd is
  (`null` bij een op zichzelf staand Assessment). Geen lopende koppeling:
  een latere wijziging aan het origineel werkt niet door.
- **Nieuw scherm** `/beheer/content/nieuw`: keuze "Leeg aanmaken" of
  "Vanuit bestaand Assessment", met naam en kort label.
  - `createAssessment` (`lib/assessment-store.ts`): een volledig leeg
    Assessment met standaard schaallabels, geen categorieën of
    bouwblokken.
  - `duplicateAssessmentAsVariant`: `structuredClone` van het
    bron-Assessment, met een verse id op het Assessment zelf én op élke
    Categorie/Bouwblok/Vraag (via `nieuwId()`), zodat de kopie volledig
    onafhankelijk is — bewerken van de kopie raakt het origineel niet.
    Zet `afgeleidVanAssessmentId` op het bron-id.
  - `/beheer/content` toont bij een sector-variant "Afgeleid van: …" in
    de sub-regel; de contentbeheerpagina zelf toont dit ook boven de
    instellingen.
- Contentbeheer kreeg twee kleinere aanvullingen die hierbij nodig waren:
  een "Kort label"-veld in de instellingen, en een `pdfContentSecties`-
  editor (kiezen tussen "Geen slotsectie" / Visie / 2030, met eigen
  titel) — voorheen alleen als vaste data instelbaar.
- **Mechanisme gebouwd en end-to-end getest** (aanmaken, dupliceren,
  volledig losstaande id's verifiëren, gewicht bewerken) met een
  wegwerp-testassessment, niet bewaard. **De echte Zorg-variant is niet
  gebouwd**: Joost's bronmateriaal (vraagteksten, historische
  zorg-gewichten) staat nog niet in de repository. Dat blijft een open
  punt tot dat materiaal er is — zie `backlog.md`.

**InDesign-export** (`export-indesign.md`):

- Derde optie "Voor InDesign (XML)" in de "Exporteren"-dropdown op de
  resultatenpagina, naast "Als PDF" en "Als CSV".
- Levert een ZIP (client-side gebouwd met `fflate`, geen server nodig,
  zelfde patroon als de CSV-export): één `scan-export.xml` plus 5
  losse SVG-bestanden (classificatiecirkel, radar, staafdiagram, top 3
  sterktes, top 3 verbeterkansen), bestandsnamen volgens
  `<organisatie>-<scan>-...svg`, `href`'s met het letterlijke
  `file:///./`-voorvoegsel uit de spec.
- **Nieuwe module** `lib/indesign/`: `xml-utils.ts` (escapen, slug),
  `kenmerken-xml.ts` (de 24 organisatiekenmerken als losse, met name
  getagde XML-elementen — bewust geen JSON-blob zoals bij CSV, elk
  kenmerk moet in InDesign een eigen tekst-/beeldframe kunnen worden;
  ontbrekende waarden worden de letterlijke tekst `"n.v.t."`),
  `charts.ts` (twee nieuwe standalone SVG's: `scoreAlgemeenSvg`,
  `top3ListSvg`; radar/staafdiagram hergebruiken de bestaande
  `lib/pdf/charts.ts`), `content-sectie.ts` (plat maken van de
  Visie/2030-content tot losse `<alinea>`-elementen, `**vet**`/
  `*cursief*` naar `<b>`/`<i>`, koppen als vetgedrukte alinea — er is
  geen apart kop-element in het contract), `build-xml.ts` (orkestreert
  alles), `export.ts` (ZIP + download).
- `<groepsScores type="categorie">` bij een Assessment met categorieën,
  `type="bouwblok"` bij een vlakke indeling (AI-scan) — mirrort
  `Assessment.categorieen`.
- **Getest voor beide vormen**: Klantcontact Volwassenheid (met
  categorieën, alle 24 kenmerken inclusief de "n.v.t."-fallback, Visie-
  slotsectie) en AI-Volwassenheid (vlak, `type="bouwblok"`, 8 domeinen,
  2030-slotsectie). Beide keren de ZIP uitgepakt en de XML en alle 5
  SVG's gevalideerd als well-formed XML. **Niet getest in InDesign
  zelf** (geen toegang tot Joost's sjabloon/InDesign hier) — de
  structuur is gecontroleerd tegen `export-indesign.md`, niet visueel
  tegen een echte plaatsing.

**Verificatie**: `tsc --noEmit`, `eslint .` en `next build` liepen na dit
hele blok schoon door (alleen bestaande warnings in de oude `js/`-map,
ongewijzigd).

## 2026-09-28 — Import CSV: ook onze eigen export teruglezen

**Aanleiding**: De "Als CSV"-export teruglezen bij "Import van historische
scans" gaf een foutmelding (alle 6 verplichte kolommen ontbraken) — geen
bug, maar twee bewust verschillende formaten (`export-csv.md` exporteert
onze eigen kolommen, `import-legacy-scans.md` verwachtte alleen het
formaat van de externe, stopgezette tool). Op verzoek uitgebreid met een
tweede bronformaat, zodat een eigen export wél teruggelezen kan worden —
vooral bedoeld om data tussen browsers te verplaatsen zolang de opslag
nog localStorage is (CLAUDE.md, Status).

**Doorgevoerd**:

- **Beheerscherm** (`/beheer/import`): Nieuwe keuze "Bronformaat" bovenaan
  ("Oude tool" / "Coniche Scan (eigen export)"), bepaalt scheidingsteken,
  verplichte kolommen en matchinglogica. Wisselen van formaat wist het
  al ingelezen bestand.
- **`lib/import-legacy.ts`**: CSV-parser generiek gemaakt (instelbaar
  scheidingsteken: komma voor "oud", puntkomma voor "nieuw"; een
  voorloop-BOM wordt gestript). Nieuwe `parseNieuweExportCsv`/
  `valideerNieuweExportRijen` naast de bestaande "oud"-functies, beide
  met dezelfde `GevalideerdeRij`-uitvoer, zodat de preview-tabel en
  `voerLegacyImportUit` (`lib/db.ts`) ongewijzigd allebei bedienen.
- **"Nieuw"-formaat matcht rechtstreeks op onze eigen `bouwblokId`/
  `vraagId`** (geen naam-/volgorde-heuristiek nodig, het is al onze eigen
  data) en importeert alle drie de statussen (niet alleen afgeronde
  scans). `organisatie_kenmerken` wordt één-op-één overgenomen bij het
  aanmaken van een nieuwe organisatie; een bestaande organisatie behoudt
  haar eigen kenmerken. Het `meting_label` komt letterlijk uit de export.
- **`lib/db.ts`**: `voerLegacyImportUit` gebruikt nu `rij.status` en
  `rij.uitgenodigdOp` in plaats van hardcoded `"afgerond"`, en past
  `organisatieKenmerken` toe bij een nieuw aangemaakte organisatie.

**Op de backlog gezet**: Bronformaat "Oude tool" verwijderen zodra de
historische migratie voltooid is (`backlog.md`, "Voor productie").
"Coniche Scan (eigen export)" blijft wel bestaan.

Getest met een echte export→import-rondgang: Een afgeronde scan
geëxporteerd als CSV, teruggeïmporteerd met bronformaat "nieuw" —
dezelfde 15 bouwsteenscores, dezelfde overall-score (3.0), en de Meting
kreeg het letterlijke `meting_label` terug. Het "oude" formaat is los
opnieuw getest (regressie): nog steeds correct assessment-detectie en
matching.

## 2026-09-28 — Sector/Subsector: alsnog cascading-select

**Aanleiding**: Sector toonde terecht alleen de 22 Secties, maar
Subsector toonde altijd alle 87 Afdelingen plat, ongeacht de gekozen
Sector — een eerdere, bewuste spec-keuze ("Geen cascading-select tussen
de twee", `sbi-indeling.md`/`datamodel.md`). Op verzoek teruggedraaid:
Subsector cascadeert nu op Sector en is pas te kiezen nadat Sector
gekozen is. Rechtstreeks in beide specs gewijzigd, niet stil in de code
afgeweken.

**Doorgevoerd**:

- **Nieuw generiek veldtype `select-afhankelijk`** (`lib/types.ts`,
  `VeldDefinitie`): Een select waarvan de optielijst afhangt van de
  waarde van een broer-veld binnen dezelfde groep (`afhankelijkVan` +
  `optiesPerWaarde`). Bewust generiek gehouden, niet Sector/Subsector-
  specifiek hardcoded (CLAUDE.md, Uitgangspunten: "geen hardcoded
  schermen, dit is data").
- **`components/beheer/KenmerkenForm.tsx`**: Rendert het nieuwe type
  (uitgeschakeld met "Kies eerst {label van het broer-veld}" zolang dat
  broer-veld leeg is), en wist een afhankelijke waarde automatisch zodra
  het veld waarvan die afhangt wijzigt — een blijvende, niet meer
  passende Subsector-keuze na het wijzigen van Sector zou stille foutieve
  data opleveren.
- **`data/organisatie-velden.ts`**: Nieuwe `sbiSubsectorenPerSector`,
  de 87 Afdelingen gegroepeerd per Sectie op basis van de officiële
  tweecijferige Afdelingscode (niet op titelgelijkenis): Elke Sectie
  A–V heeft een vaste, aaneengesloten codereeks (bijv. G = 46–47, L =
  64–66), geverifieerd door elke Afdeling automatisch in te delen en de
  uitkomst te controleren tegen de Sectie-titels — alle 87 kwamen
  inhoudelijk overeen met hun Sectie (bijv. Afdeling 65 "verzekeringen
  en pensioenfondsen" onder Sectie L "financiële dienstverlening en
  verzekeringen"). Deze codereeksen staan nu ook in `sbi-indeling.md`
  (nieuwe kolom "Afdelingen" in de Sector-tabel), zodat de indeling
  gedocumenteerd is en niet alleen impliciet in code leeft.
- **`lib/import-legacy.ts`**: De SBI-mapping voor een import zoekt de
  subsector nu eerst binnen de Afdelingen van de al-bepaalde sector
  (nauwkeuriger), met de volledige lijst als terugval.

Getest: Sector "Groot- en detailhandel" beperkt Subsector tot precies
"Groothandel"/"Detailhandel"; Subsector wisselt en wordt leeg zodra
Sector daarna verandert; Subsector staat uitgeschakeld zonder gekozen
Sector; een import (Univé, sector "Financiële dienstverlening",
subsector "Verzekeringen en pensioenfondsen") vult na import nog
steeds correct Sectie L / Afdeling 65 in, nu binnen de gecascadeerde
velden.

## 2026-09-28 — PDF-bug: bouwsteen 7 niet meer op dezelfde pagina als 8

**Gevonden**: Een bouwsteenpaar wordt in de PDF in één HTML-blok
opgebouwd (`lib/pdf/build-html.ts`), maar elk bouwsteenblok mag zelf
niet over twee pagina's gesplitst worden (`page-break-inside: avoid`).
Was de gecombineerde inhoud van een paar — met name door een langere
opmerking bij een of beide bouwstenen — hoger dan de beschikbare
paginaruimte (±245mm), dan sprong het tweede blok in zijn geheel naar
een nieuwe, verder lege pagina. Bevestigd door zelf twee opmerkingen
van een paar zinnen toe te voegen aan bouwsteen 7 en 8: de PDF ging van
10 naar 11 pagina's, met bouwsteen 7 alleen op de ene pagina en
bouwsteen 8 alleen, met veel witruimte, op de volgende.

**Fix (gekozen optie: verkrappen, geen dynamische meting)**: Tekst en
marges op de bouwsteenpagina's van de Volwassenheidsscan-PDF iets
verdicht, zodat er meer buffer overblijft voordat een paar de
pagina-hoogte overschrijdt:

- Lettergrootte 8,5pt → 8,3pt, regelhoogte 1,45 → 1,4.
- Ruimte rond de middenstreep 9mm → 7mm aan beide kanten.
- Kleinere marges rond de uitleg, de centrale-vraagbox, de tabel en de
  opmerking zelf.

Dit lost het gemelde geval op (getest: met dezelfde twee opmerkingen
weer 10 pagina's, bouwsteen 7 en 8 weer samen) maar is geen garantie
voor élke denkbare tekstlengte — bij een uitzonderlijk lange opmerking
kan het zich in theorie nog voordoen. Een echte garantie vraagt
dynamische hoogtemeting tijdens het genereren (bewust niet gekozen,
grotere aanpassing). De AI-scan-PDF (die bovenop deze waarden nog de
`compact`-laag gebruikt voor de 5-vragen-domeinen) is ongewijzigd
gebleven qua paginatelling (9) en oogt nog steeds ruim genoeg; beide
visual-specs (`export-pdf-visual-volwassenheidsscan.md`,
`export-pdf-visual-ai-scan.md`) zijn bijgewerkt met de nieuwe maten.

## 2026-09-28 — Bug: verwijderen deed niets

**Gevonden**: De "Verwijderen"-knop op Ingevulde scans leek niets te
doen. Reproductie in de Claude-browserpane bevestigde de oorzaak: De
knop riep `window.confirm()` aan, en die browserpane onderdrukt native
JavaScript-dialogen stilzwijgend — `confirm()` levert dan altijd `false`
op, zonder enige melding. De knop deed het dus wel, maar stopte meteen
bij een bevestigingsvraag die de gebruiker nooit te zien kreeg. Dezelfde
`window.confirm()` stond ook op Organisaties en op de
respondentenlijst van een organisatie (drie plekken in totaal), dus
hetzelfde risico overal waar een browser(omgeving) native dialogen
onderdrukt.

**Fix**: Nieuwe `components/beheer/BevestigModal.tsx`, dezelfde
`.modal-overlay`/`.modal-box`-stijl als de rest van de app, met
Annuleren/Verwijderen-knoppen — vervangt `window.confirm()` op alle drie
plekken (`app/beheer/scans/page.tsx`, `app/beheer/organisaties/page.tsx`,
`app/beheer/organisaties/[organisatieId]/page.tsx`). Geen
browserafhankelijkheid meer, en meteen een opmaak die bij de rest van
beheer past in plaats van de kale systeemdialoog.

Getest: Verwijderen op Ingevulde scans (rij verdwijnt na bevestigen),
Organisaties (juiste waarschuwingstekst met het aantal respondenten dat
meegaat) en Annuleren (modal sluit, niets verwijderd, selectie blijft
staan).

## 2026-09-28 — Import: Assessment-type nu automatisch bepaald

**Aanleiding**: Vraag om de importtool het Assessment-type zelf te laten
vaststellen, in plaats van de beheerder dit vooraf te laten kiezen. Dat
laatste stond met een expliciete reden in `import-legacy-scans.md`
("om te voorkomen dat een fout bestand stilzwijgend op het verkeerde
scan-type wordt geplakt") — een bewuste spec-keuze, dus rechtstreeks
gewijzigd in dat bestand (sectie "Assessment- en bouwblok-matching"),
niet zomaar in de code afgeweken.

**Waarom dit alsnog veilig is**: De bestaande matching (blok- én
vraagaantal moeten exact kloppen, namen moeten matchen) ving een
verkeerd gekozen type toch al af met een duidelijk matchingprobleem —
de handmatige keuze kostte dus een stap zonder een risico weg te nemen
dat de matching niet al dekte.

**Doorgevoerd**:

- **`lib/import-legacy.ts`**: Nieuwe functie `detecteerAssessment`
  vergelijkt de gegroepeerde bloknamen uit de CSV met de bouwblokken/
  domeinen van elk Assessment-type; alleen bij een exacte match (aantal
  én alle namen) geldt een type als gedetecteerd. Geen match: de rij
  krijgt de melding "Kon geen Assessment-type bepalen" i.p.v. een gok.
  `valideerLegacyRijen` neemt nu de volledige assessments-lijst i.p.v.
  één vooraf gekozen Assessment, en bepaalt het type per rij (zodat een
  bestand met een onverwachte mix altijd correct blijft, al komt dat in
  de praktijk niet voor: één export is altijd één scan-type).
- **`/beheer/import`**: De Assessment-type-dropdown is weg. De
  voorbeeldweergave toont een nieuwe kolom "Assessment" met het
  gedetecteerde type per rij (of "—" als dat niet lukte).

Getest: Een Klantcontact-CSV en een AI-scan-CSV (beide met de juiste
bouwblok-/domeinnamen uit de huidige content) worden allebei correct
gedetecteerd en geïmporteerd; een CSV met twee onbekende bloknamen geeft
"Kon geen Assessment-type bepalen" en importeert niets.

## 2026-09-28 — CSV-export van ingevulde scans gebouwd

**Aanleiding**: `export-csv.md`, een nieuwe, volledige spec voor de tot nu
toe uitgeschakelde "Als CSV"-optie in de Exporteren-dropdown, op de
resultatenpagina en in `admin-beheerpagina.md` punt 7 (Ingevulde scans).

**Doorgevoerd**:

- **`lib/csv-export.ts`**: `genereerScansCsv` bouwt de CSV exact volgens de
  kolommen uit de spec (basisgegevens, `overall_score`/`groepsScores` —
  alleen gevuld bij status "afgerond" — `organisatie_kenmerken`,
  `antwoorden` en `opmerkingen_per_bouwblok`, alle drie als JSON-kolom).
  Puntkomma-gescheiden, UTF-8 met BOM, en decimalen met een komma
  (`3,8`) i.p.v. een punt — Excel-NL-conventie. `groepsScores` is met de
  hand opgebouwd i.p.v. met `JSON.stringify`: Door de komma-decimalen is
  dat veld strikt genomen geen valide JSON meer, bewust volgens de spec
  ("dit is de laatste stap in de keten, niets leest de CSV terug in de
  app"). Client-side, geen serverroute nodig (alle data staat al in de
  browser).
- **Resultatenpagina**: "Als CSV" in de Exporteren-dropdown werkt nu,
  bestandsnaam `<Organisatie> - <Respondent> - <Meting>.csv`.
- **Ingevulde scans (globaal overzicht)**: De "Exporteren"-knop in de
  bulk-toolbar (`BulkToolbar`, nieuwe optionele props `onExporteren`/
  `exporterenDisabledReden`) werkt nu voor 1 of meer geselecteerde scans,
  bestandsnaam `Ingevulde scans export <datum>.csv` bij meerdere rijen.
  **Bulk-CSV blijft binnen één organisatie** (export-csv.md, "in verband
  met datavermenging"): Bevat de selectie scans van meer dan één
  organisatie, dan blijft de knop uitgeschakeld met een tooltip die
  vraagt eerst op Organisatie te filteren. Geen aparte, nieuwe
  "organisatie-gefilterde Ingevulde scans"-pagina gebouwd hiervoor: De
  bestaande organisatiefilter op dit overzicht vervult al die rol, en de
  check op de daadwerkelijke selectie (niet alleen het filter) dekt de
  eigenlijke zorg — datavermenging — preciezer.

Getest: Bulk-export van 2 scans binnen dezelfde organisatie (juiste BOM,
kolommen, komma-decimalen, volledige antwoorden- en opmerkingen-JSON
gecontroleerd), de blokkade bij 2 scans uit verschillende organisaties
(knop uitgeschakeld, juiste tooltip), en de losse CSV-export vanaf de
resultatenpagina (juiste bestandsnaam).

## 2026-09-28 — Nieuwe MD's verwerkt

**Nagekomen verbetering, zelfde dag**: Het CSV-bestandsveld op
`/beheer/import` toonde de kale, ongestylede browserknop ("Bestand
kiezen" / "Geen bestand gekozen"), enige plek in de app zonder eigen
opmaak. Vervangen door een `.btn-outline`-knop die een verborgen
`<input type="file">` aanstuurt, met de gekozen bestandsnaam ernaast —
zelfde patroon als andere secundaire acties in `stylesheet.md`.

**Naamgevingsconflict, opgelost door de conventie van Sander te volgen**:
Ik had zelf `pdf-visual-volwassenheidsscan.md` en `pdf-visual-ai-scan.md`
aangemaakt. Sander leverde intussen `export-pdf-visual-
volwassenheidsscan.md` en `export-pdf-visual-ai-scan.md` aan, die
hetzelfde onderwerp dekken maar aansluiten bij de bestaande naam
`export-pdf.md` en de gedeelde regels (bron, slotsectie, bulk-export)
bundelen in het volwassenheidsscan-document als leidend stuk. Mijn twee
bestanden en het nu overbodige `export-pdf.md` zijn verwijderd; de
nieuwe bestanden staan al in `CLAUDE.md`'s bestandentabel.

**Kleine inconsistentie gecorrigeerd**: `import-legacy-scans.md` gebruikte
op twee plekken "AI-Volwassenheid" (hoofdletter V) naast "AI-volwassenheid"
(kleine v) elders in hetzelfde bestand en in alle andere specs. Rechtgezet
naar de doorgaande kleine-v-schrijfwijze.

**Doorgevoerd**:

- **Organisatievelden Sector en subsector** (`datamodel.md`,
  Organisatievelden): Twee losse select-velden, vaste optielijsten uit
  de nieuwe `sbi-indeling.md` (22 secties, 87 afdelingen, SBI2025 top 2
  niveaus). Toegevoegd aan `data/organisatie-velden.ts`, vóór "Volume en
  klantbasis". Geen cascading-select tussen de twee, zoals gespecificeerd.
  Gecontroleerd in het organisatieformulier: Beide dropdowns staan naast
  elkaar met het juiste aantal opties.

**Nog niet doorgevoerd, aan Sander voorgelegd (zie chat)**:

- `Assessment.pdfContentSecties` van array naar één (of geen) object, en
  `ContentBron` van 4 naar 2 waarden — nu vastgelegd in `datamodel.md` en
  `export-pdf-visual-volwassenheidsscan.md`, nog niet in de code
  (`lib/types.ts`, beide assessment-databestanden, `lib/pdf/build-html.ts`,
  `lib/pdf/content-secties.ts`).
- `import-legacy-scans.md`: Nieuwe beheerfunctie (CSV-import van
  historische scans), spec compleet en "klaar om te bouwen", nog niet
  gebouwd.


**Alsnog doorgevoerd (op verzoek, na overleg)**:

- **`Assessment.pdfContentSecties`: array → één (of geen) slotsectie,
  `ContentBron` 4 → 2 waarden.** `lib/types.ts`, beide
  assessment-databestanden, `lib/pdf/build-html.ts` en
  `lib/pdf/content-secties.ts` (dode functies `bouwstenenDeel2Html`/
  `aiDomeinenHtml` en de onnodig geworden `PER_BOUWBLOK_BRONNEN`-gate
  verwijderd — de per-bouwblok toelichting werkt nu onvoorwaardelijk,
  zoals de nieuwe spec beschrijft). Geen zichtbaar verschil in de PDF's:
  Beide test-PDF's (10 en 9 pagina's) opnieuw gegenereerd en pagina 1/10
  respectievelijk pagina 6 visueel vergeleken met de vorige versie,
  identiek. **Val op**: De test-fixtures in de scratchpad bevatten nog
  een oud, ingebed `assessment`-object (client stuurt het hele object
  mee) — bij een respondent-browser die zijn snapshot vóór deze wijziging
  al had geseed, geldt hetzelfde. Geen nieuwe fallback toegevoegd: Dit
  gold al voor eerdere velden op `Assessment` en is een bekend,
  geaccepteerd risico van de localStorage-opzet (`CLAUDE.md`, Status).

- **`import-legacy-scans.md` gebouwd**: Nieuwe beheerpagina
  `/beheer/import` (nav-link "Import", naast Content), met CSV-upload,
  keuze van het Assessment-type, een voorbeeldweergave per rij
  (gevonden/nieuwe organisatie kiezen, matchingproblemen apart getoond
  zonder de rest te blokkeren) en een bevestigknop. Nieuwe bestanden:
  `lib/import-legacy.ts` (CSV-parser, SBI-mapping, matching-validatie,
  geen localStorage-toegang) en `voerLegacyImportUit` in `lib/db.ts`
  (het daadwerkelijk wegschrijven). Getest met een zelf opgebouwde CSV
  (15 bouwstenen, juiste namen en vraagaantallen uit de huidige content):
  Nieuwe organisatie, respondent met de Legacy-import-notitieprefix,
  Meting "Legacy-import 2025", status "Afgerond", scores en opmerking
  kwamen correct door in Ingevulde scans en de organisatiedetailpagina.

  **Bug gevonden en gefixt tijdens het testen**: De eerste versie van de
  SBI-matching (`mapNaarSbiTitel`) koos bij "Verzekeringen en
  pensioenfondsen" de verkeerde Afdeling (64, die dat onderwerp juist
  uitsluit: "... met uitzondering van verzekeringen en pensioenfondsen"),
  omdat een simpele "bevat de tekst"-check niet onderscheidt tussen het
  hoofdonderwerp van een SBI-titel en een uitzonderingsclausule erin.
  Herschreven naar woordoverlap-scoring die woorden vóór "met
  uitzondering van" zwaarder laat wegen; nu wordt Afdeling 65 gekozen,
  zoals `sbi-indeling.md` expliciet als voorbeeld noemt.

  **Aanname, niet in de spec vastgelegd**: Er was geen voorbeeld-CSV
  beschikbaar, dus de vorm van de `answers`-kolom (JSON: een array van
  blokken met `buildingBlockName`, optioneel `blockComment`, en
  `questions` met een numerieke `score` per vraag) is een eigen
  reconstructie op basis van de wel-beschreven veldnamen
  (`buildingBlockName`, `blockComment`, `questionId`). Controleer dit
  tegen de eerste echte export voordat deze tool op productiedata
  draait — staat ook als code-comment boven `LegacyAnswerBlock` in
  `lib/import-legacy.ts`.

  **Eigen invulling, niet expliciet in de spec**: Een respondent die al
  bestaat (zelfde e-mailadres binnen de organisatie) wordt hergebruikt
  zonder zijn naam/functie/team/notities te overschrijven met de
  importdata — terughoudend gekozen om recentere, zelf ingevoerde
  gegevens niet te laten overschrijven door een oudere import.


**Nagekomen fix, zelfde dag: de importfunctie werkt nu echt.** Bij het
testen met een echte export (Univé Zuid-Nederland) bleek mijn eigen
aanname over de vorm van de `answers`-kolom verkeerd: Ik had een array
van 15 blok-objecten met een geneste `questions`-array verondersteld.
Sander en ik hebben `import-legacy-scans.md` (en `datamodel.md`, zie
hieronder) bijgewerkt met de daadwerkelijke structuur uit de twee echte
exports, en die is nu in `lib/import-legacy.ts` verwerkt:

- **`answers` is een platte lijst** van losse vraag-items (60 bij
  Klantcontact, 40 bij de AI-scan), geen geneste structuur per bouwblok.
  Nieuwe functie `groepeerPerBouwblok` groepeert deze lijst eerst op
  `buildingBlockId` (volgorde van eerste voorkomen), vóórdat de
  bestaande matching- en telregels worden toegepast — de blok-telling
  controleert nu tegen het aantal groepen, niet tegen `answers.length`.
- **Scoreveld heet `answerScore`**, niet `score`. `answerLabel` en
  `weight` worden bewust niet geïmporteerd (weight staat overal op 1,
  zie `datamodel.md`, `Bouwblok.gewicht`/`Categorie.gewicht` hieronder).
- **`blockComment` staat op elk vraag-item binnen een blok herhaald**:
  Gededupliceerd tot één waarde per bouwblok; tegenstrijdige waarden
  binnen hetzelfde blok laten de hele rij afkeuren, zoals de spec
  voorschrijft.

Getest met een zelf opgebouwde CSV die de bevestigde structuur exact
volgt (60 platte vraag-items, juiste `buildingBlockId`/`buildingBlockName`
uit de huidige content): Voorbeeldweergave toont nu "1 van de 1 rijen
klaar", en na bevestigen kloppen alle 15 bouwsteenscores, de
100%-voortgang en de opmerking in Ingevulde scans.

**`datamodel.md` kreeg in dezelfde ronde `Categorie.gewicht` en
`Bouwblok.gewicht` (standaard 1, nog geen effect op de score-berekening
— volgt pas bij een toekomstige sector-variant). Puur ter voorbereiding,
geen code-wijziging nu nodig: `weight` in de CSV staat overal op 1 en
wordt niet geïmporteerd, zoals hierboven.**

**Knoppen op `/beheer/import` rechtgezet**: "Bestand kiezen" en de
importknop misten de gedeelde basisklasse `.btn` (alleen `.btn-outline`/
`.btn-or`, de kleurmodifier zonder de padding/afmetingen die `.btn`
levert, zie `stylesheet.md`, Knoppen) — vandaar de kale, ongestylede
knoppen. Ook kon "Bestand kiezen" op smallere schermen naar twee regels
wrappen doordat de knop in de flex-rij mocht meekrimpen met de
bestandsnaam ernaast; nu `flex: none` op de knop, de bestandsnaam breekt
zo nodig zelf af.
## 2026-09-25 — Werkende PDF-export van een ingevulde scan

**Aanleiding**: `export-pdf.md`, een volledig uitgewerkte spec voor échte
PDF-export (in plaats van de uitgeschakelde "Als PDF"-knop), voorgelegd
en goedgekeurd — inclusief de bouwkeuze die de spec zelf als "niet
achteraf te maken" aanmerkte: Server-side rendering (Puppeteer/headless
Chromium) i.p.v. platte browser-print, nodig voor een echte "Pagina X/Y"
in de footer.

Na de eerste versie (platte scoretabel + alle duidingscontent los aan het
eind) gaf Sander aan de hand van 6 referentieschermafbeeldingen een
concreet gewenste opbouw door: de radar- en staafdiagram terug (i.p.v.
een tabel), de legenda erbij, en per bouwblok eerst de uitleg (dezelfde
content als de toelichting-modal) direct gevolgd door de vragen en
score van dát bouwblok — in plaats van alle uitleg (Bouwstenen/AI-
domeinen) als los blok aan het eind.

**Doorgevoerd**:

- **Twee visual-specs voor de PDF's**: `pdf-visual-volwassenheidsscan.md`
  en `pdf-visual-ai-scan.md` beschrijven per pagina hoe beide PDF's
  eruitzien (maten, kleuren, paginaverdeling, bronbestanden). Opgenomen
  in de bestandentabel van `CLAUDE.md`.

- **Volwassenheidsscan-PDF: Visie-pagina in de stijl van /visie**. De
  laatste pagina volgt nu de opbouw van de webpagina: hero met oranje
  gloed en de vetgedrukte subtitel, kopjes als h2, "Wat is goed
  klantcontact?" in een warme kaart met oranje vinkjes in twee kolommen,
  en de verbetercyclus als vijf genummerde stappen met pijltjes (was
  eerder een platte tekstregel). Past nog steeds op 1 pagina. De
  hero-subtitel en de kaartintro staan nu in `data/visie-content.ts`
  (`visieIntro`, `watIsGoedIntro`) en worden door pagina én PDF gebruikt.

- **AI-scan-PDF vanaf pagina 6 in de stijl van /klantcontact-2030**. De
  2030-sectie (pagina 6 t/m 9) volgt nu de opbouw van de webpagina: hero
  met oranje gloed vanaf de paginarand, kopjes als h2, genummerde punten
  als omkaderde kaarten met oranje nummercirkel, en de kenmerken in een
  warme kaart met twee kolommen. Oorspronkelijk stonden de nummers los
  boven de titels zonder opmaak, en stond er nog een kop "Geen vast
  eindbeeld" die op de webpagina al was weggehaald. De sectie is
  handmatig over 4 pagina's verdeeld (`.pdf-pagina`), zodat geen kaart of
  kop midden op een pagina wordt afgebroken. De drie vaste tussenzinnen
  uit de webpagina staan nu in `data/klantcontact-2030-content.ts`
  (`vijfDingenIntro`, `machineCustomerEffectenIntro`, `kenmerkenIntro`)
  en worden door pagina én PDF gebruikt.

- **AI-scan-PDF: overal 2 domeinen per pagina**. AI-domeinen hebben 5
  vragen en een langere uitleg, waardoor het eerste paar over twee
  pagina's liep. Scans met meer dan 4 vragen per bouwblok krijgen nu een
  compactere opmaak (`.bouwsteen-pagina.compact` in `lib/pdf/build-html.ts`:
  iets kleiner lettertype, minder marges). Gecontroleerd met een echte
  AI-payload: 9 pagina's, elk domeinpaar op één pagina. De Klantcontact-PDF
  is ongewijzigd (10 pagina's).
- **Nieuwe dependency**: `puppeteer`, voor het server-side renderen van
  de PDF.
- **Nieuwe route** `app/api/export-pdf/route.ts` (POST): Bouwt een
  zelfstandige HTML-string en print die via een headless Chromium-pagina
  naar PDF, met `displayHeaderFooter`/`footerTemplate` voor de native
  paginanummering. Zelfstandig gekozen i.p.v. Puppeteer naar de live
  resultatenpagina te laten navigeren: Die pagina haalt zijn data uit
  `localStorage`, waar de server geen toegang toe heeft. De client stuurt
  daarom alle benodigde data (het actuele `Assessment` zoals de
  respondent het zag, antwoorden, opmerkingen, organisatie- en
  respondentnaam) direct mee in de request-body.
- **Nieuwe Assessment-velden** (`datamodel.md`): `kortLabel` (voor de
  PDF-footer) en `pdfContentSecties` (welke duidingscontent per
  scan-type in de PDF komt, met een vaste `ContentBron`-lijst i.p.v. een
  vrij tekstveld), ingevuld voor beide bestaande scan-types.
- **Opbouw van het document** (`lib/pdf/build-html.ts`): Kop, metagegevens,
  overall-classificatiecirkel met naam/voortgang, radar- en staafdiagram
  naast elkaar, Top 3 Sterktes/Verbeterkansen, Legenda — daarna per
  bouwblok, in vaste volgorde, eerst de uitleg (categorie/nummer-label,
  centrale vraag, beschrijving — dezelfde content als de toelichting-
  modal) en direct daaronder de vragentabel met score en een eventuele
  opmerking. Duidingssecties die niet per bouwblok horen (Visie/2030)
  staan als afsluitende sectie(s) achteraan.
- **`lib/pdf/charts.ts`** (nieuw): Radar- en staafdiagram als kale SVG
  (geen recharts/DOM nodig in de PDF-context), met dezelfde kleuren en
  data als `RadarChartView.tsx`/`CategoryBarChart.tsx` op het scherm. De
  radar-viewBox is bewust veel breder dan hoog: Bij 15 assen zijn de
  buitenste labels (bijv. "13. Employee Engagement") lang genoeg om een
  vierkante viewBox te doen clippen.
- **`lib/pdf/content-secties.ts`**: Map van `ContentBron` naar de
  volledige tekst uit dezelfde content-bestanden als de interactieve
  pagina's (`visie-content.ts`, `bouwstenen-content.ts`,
  `klantcontact-2030-content.ts`, `ai-domeinen-content.ts`), gebruikt
  voor de afsluitende Visie/2030-sectie.
- **`lib/bouwblok-info.ts`** (uitgebreid): `toelichtingVoor()` geeft nu de
  volledige toelichting (eyebrow, titel, centrale vraag, beschrijving)
  per bouwblok terug, dezelfde content-lookup die al in `BouwblokForm.tsx`
  zat, nu gedeeld tussen de toelichting-overlay en de PDF.
- **`escape-html.ts`**: Voorkomt HTML-injectie via vrije tekst zoals
  respondent-opmerkingen.
- De "Als PDF"-optie in de Exporteren-dropdown op de resultatenpagina is
  niet langer uitgeschakeld en toont "Bezig…" tijdens het genereren.
- **Eerste pagina verdicht**: Kop, metagegevens, score-cirkel, radar/
  staafdiagram, Top 3 en Legenda stonden verspreid over 2 pagina's
  (de tweede grotendeels leeg door de geforceerde pagina-einde vóór het
  eerste bouwblok). Marges, lettergroottes en de intrinsieke hoogte van
  beide SVG-grafieken verkleind zodat dit blok nu op 1 pagina past.
- **Metagegevens-blok herzien**: De losse sectie met 3 boxen
  (Assessmentdatum/Naam invuller/Geëxporteerd op) is weg. Onderweg bleek
  de CSS-selector `.metagegevens div` ook de labels zelf te raken, met
  een dubbele rand tot gevolg (box-in-een-box) — dat probleem is nu
  irrelevant. In de kop staat nu, onder de titel en boven de oranje
  lijn, één regel: "{datum} | {assessment naam} | {naam invuller}".
  "Geëxporteerd op" is vervallen (voegde weinig toe naast de andere
  twee, en stond nergens elders in het document).
- **Pagina 1 vult de volledige hoogte**: In plaats van vaste, kleine
  marges (die ruimte onderaan de pagina onbenut lieten) is pagina 1 nu
  een flex-kolom (`justify-content: space-between`) die de 4 blokken
  (kop, scores, top 3, legenda) evenredig over de volledige paginahoogte
  verdeelt. Onderdelen (classificatiecirkel, grafieken, teksten) zijn
  tegelijk weer iets vergroot, nu er ruimte is.
- **2 bouwstenen per pagina**: Elk even-genummerd paar bouwblokken
  (1+2, 3+4, …) begint voortaan geforceerd op een nieuwe pagina, en elk
  bouwblok blijft ongesplitst (`page-break-inside: avoid`). Om dat
  daadwerkelijk te laten passen zijn de teksten binnen een bouwblok
  (uitleg, centrale vraag, vragentabel, opmerking) flink verdicht:
  Kleinere letters, minder regelhoogte en marge. Bracht het totaal
  aantal pagina's terug van 18 naar 11 voor de Klantcontact-scan.
- **Dubbele titel per bouwblok weggehaald**: De titel + score stonden
  twee keer — één keer in de uitleg (bijv. "Organisatiestrategie") en
  nogmaals vlak boven de vragentabel. Dat tweede kopje is weg; de score
  staat nu rechtsboven bij de titel ín de uitleg (ook bij een bouwblok
  zonder rijke toelichting, dan valt het terug op de kale bouwblok-naam
  met score, in plaats van los content-blok).
- **Meer ruimte tussen de 2 bouwstenen op een pagina**: Marge en padding
  tussen bouwblokken vergroot.
- **Scheidingslijn tussen bouwstenen oranje** in plaats van lichtgrijs
  (de laatste bouwsteen van het document heeft er nu bewust geen, dat is
  geen scheiding tussen twee bouwstenen meer).
- **Conditionele opmaak op de score per vraag**: De Score-kolom in de
  vragentabel toont nu een gekleurd vakje per antwoord (1 rood t/m 5
  groen), met dezelfde kleuren als het bestaande `ANTWOORD_KLEUR`-systeem
  uit het admin-scanoverzicht — hergebruikt in plaats van een nieuwe
  kleurenset te verzinnen.
- **Bouwsteen-pagina's vullen de volledige hoogte**: Elk paar bouwstenen
  (1+2, 3+4, …) staat nu in een eigen pagina-vullende flex-kolom, dezelfde
  techniek als pagina 1: De restruimte verschijnt als één ruime
  tussenruimte tussen de twee bouwstenen, niet als onbenutte witruimte
  onderaan. Interne marges binnen een bouwsteen (na de titel, rond de
  centrale vraag, rond de tabel, vóór een opmerking) zijn ook iets
  ruimer.
- **Visie op 1 pagina**: De afsluitende Visie-sectie liep over 2
  pagina's. Algemene duidingssecties (`.algemene-sectie`) hebben nu
  kleinere letters, minder regelhoogte en tighter marges, zonder
  bovenrand/extra ruimte boven de kop, zodat de Visie op één pagina past
  (totaal 11 → 10 pagina's voor de Klantcontact-scan). De 2030-sectie
  van de AI-scan is veel langer en loopt nog steeds over meerdere
  pagina's, maar profiteert wel van dezelfde verdichting.
- **Coniche-logo in de footer vanaf pagina 2**: Rechtsonder staat nu
  achter de scannaam (bijv. "Volwassenheidsscan") het Coniche-logo, niet
  op pagina 1 (daar staat het al in de kop). Dat kan niet met Puppeteer's
  `footerTemplate` (één sjabloon voor alle pagina's), dus de footer
  ("Pagina X / Y", scannaam, logo) is verhuisd naar `@page`-marginboxen
  in de HTML zelf (`@bottom-left`/`@bottom-right`, met `@page :first`
  zonder logo) en `preferCSSPageSize` in `route.ts`.
- **Oranje gloed en "CONICHE SCAN"-label in de PDF-kop**: Zelfde hero-
  uitstraling als de webpagina's: Een verloop van licht oranje naar wit
  achter de kop, over de volle paginabreedte tot de bovenrand, met "Coniche
  Scan" als oranje label boven de titel. Daarvoor zijn de zijmarges van
  `@page` naar 0 gegaan (Chrome knipt anders af op de paginamarge) en heeft
  de body dezelfde 16mm als padding; de eerste pagina heeft geen bovenmarge.
- **Zelfde hero op de Visie-pagina in de PDF**: Ook de afsluitende
  Visie (en bij de AI-scan de 2030-sectie) begint met de oranje gloed,
  "Coniche Scan" als label en de titel van de webpagina ("Onze visie op
  goed klantcontact" / "Klantcontact richting 2030"). Daarvoor krijgt de
  eerste pagina van die sectie een eigen benoemde pagina (`@page
  algemene:first`) zonder bovenmarge. De Visie past nog op 1 pagina.
- **Visie-gloed vanaf de bovenrand van de pagina**: De Visie-pagina
  heeft nu een pagina zonder bovenmarge (`@page algemene`), zodat de
  oranje gloed echt bij de paginarand begint. Alleen voor secties die op
  1 pagina passen (`PAST_OP_1_PAGINA`, nu de Visie): Bij de lange
  2030-sectie zouden alle vervolgpagina's anders ook zonder bovenmarge
  beginnen, die houdt de gewone marge (met de gloed dus onder die marge).
- **Vaste ruimte na de oranje streep op de bouwsteenpagina's**: De
  restruimte van een pagina komt nu vóór de oranje streep (het eerste
  bouwsteen-blok rekt op) in plaats van ná de streep, en het tweede blok
  krijgt een vaste `padding-top` van 12mm. De streep verschuift dus per
  pagina, maar de ruimte eronder is overal gelijk.
- **Ruimte boven en onder de oranje streep gelijk**: De streep is nu een
  eigen element in het midden van de vrije paginaruimte (`margin: auto`),
  met 9mm padding aan beide kanten. De restruimte wordt zo gelijk verdeeld
  boven en onder de streep, op elke pagina (vervangt de eerdere aanpak
  met vaste ruimte alleen ná de streep).
- **Spelling**: "AI-scan" (nav-knop) en "AI-volwassenheid" (naam van het
  assessment, dus ook op kaarten, in de PDF en in de tabellen) in plaats
  van "AI Scan" / "AI-Volwassenheid". Browsers die de assessments al
  eerder in localStorage hebben geseed houden de oude naam tot hun
  opgeslagen assessments worden hersteld/gewist.
- **Bestandsnaam van de PDF per scan-type**: "{bedrijfsnaam} {kortLabel}
  Report.pdf", dus "Univé Volwassenheidsscan Report.pdf" voor de
  Klantcontact-scan en "Univé AI-scan Report.pdf" voor de AI-scan (was
  "- Resultaten" voor beide). Eén gedeelde functie
  (`lib/pdf/bestandsnaam.ts`) voor zowel de server-header als de
  download-naam in de browser, zodat die niet uit elkaar kunnen lopen.

Geverifieerd: Een echte PDF gegenereerd (via curl, buiten de browser om)
en pagina voor pagina bekeken in Chromium's ingebouwde PDF-viewer — kop,
radar/staafdiagram (geen afgeknipte labels meer na het verbreden van de
radar-viewBox), Top 3 + Legenda, en per bouwblok de uitleg direct gevolgd
door de vragentabel en opmerking, tot en met de afsluitende Visie-sectie
met de juiste paginanummering in de footer. Losstaand daarvan: Een echte
klik op "Als PDF" in de UI geeft een geldige PDF terug (`Content-Type:
application/pdf`, 200 OK), voor zowel de Klantcontact- als de
AI-Volwassenheidsscan. `npx tsc --noEmit`, `npm run build` en `npm run
lint` slagen zonder nieuwe fouten.

## 2026-09-24 — Nav-volgorde definitief, route /ai-scan, leespagina's opgeruimd

**Aanleiding**: Nieuwe/bijgewerkte spec-bestanden verwerkt
(`CLAUDE.md`, `stylesheet.md`, `datamodel.md`,
`bouwstenenmodel-visual.md`, `ai-domeinenmodel-visual.md`). Drie
concrete, nu expliciet vastgelegde punten voorgelegd en op alle drie
akkoord gekregen.

**Doorgevoerd**:
- **Nav-volgorde definitief**: `.nav-right` volgt nu exact CLAUDE.md
  sectie 3: scherm-specifieke acties samen, zonder scheidingslijn
  ertussen (bijv. "← Terug naar de scan" + "Exporteren" naast elkaar),
  dan een scheidingslijn (alleen als die acties er zijn), dan de 4 vaste
  content-links, dan een scheidingslijn (alleen als er een exit-actie
  is), dan de exit-actie. De net toegevoegde `terugActie`-prop op
  `PageWithChrome` is weer verwijderd — één `navRight`-prop volstaat.
- **Route hernoemd**: `/ai-domeinen` → `/ai-scan`, conform
  `ai-domeinenmodel-visual.md`. De "AI Scan"-knop in de header linkt nu
  naar de nieuwe route.
- **Overbodige leespagina's verwijderd**: `/visie/bouwstenen` en
  `/visie/ai` (platte tekstversies) zijn weg. Beide spec-bestanden zeggen
  nu expliciet "geen losse leespagina meer" — de beschrijving en
  centrale vraag per bouwsteen/domein leven uitsluitend nog in de modal
  van de interactieve visuals op `/bouwstenen` en `/ai-scan`.

Geverifieerd in de browser: Nav-volgorde klopt op de resultatenpagina
(inclusief de gegroepeerde "Terug naar de scan" + "Exporteren"), de
"AI Scan"-knop opent `/ai-scan` met behoud van `?code=`, en er linkt
nergens meer iets naar de verwijderde routes. `npx tsc --noEmit`, `npm
run build` en `npm run lint` slagen zonder nieuwe fouten.

## 2026-09-24 — "Klantcontact richting 2030": hero opgeschoond, nav-volgorde rechtgetrokken

**Aanleiding**: Sander vond de hero van `/klantcontact-2030` te druk (een
subtitel-zin plus een aparte kop "Geen vast eindbeeld" boven dezelfde
inleidende tekst) en de ruimte eronder te groot nu de subtitel weg was.
Los daarvan bleek `.nav-right` niet meer overeen te komen met de
bijgewerkte CLAUDE.md: Die legt sinds kort expliciet vast dat de 4 vaste
content-links "altijd bovenaan" staan (punt 1, vóór elke
scherm-specifieke actie), terwijl de resultatenpagina/doorloopflow ze nog
ná hun eigen acties toonden. Na de eerste ronde bleek Sander op de
resultatenpagina toch een extra scheidingslijn te willen, met "Terug naar
de scan" losstaand uiterst links ervan.

**Doorgevoerd**:
- `/klantcontact-2030`: De hero-subtitel ("Een duidingsstuk over de
  markt...") en de kop "Geen vast eindbeeld" zijn verwijderd — de twee
  inleidende alinea's staan er nog gewoon, direct onder de hero. Padding
  tussen hero en tekst verkleind (was `4.5rem`/`2.5rem`, nu
  `0.5rem`/`1rem`) nu er niets meer tussen zit.
- `.nav-right`-volgorde rechtgetrokken op alle schermen: `PageWithChrome`
  rendert de 4 vaste links nu vóór de overige pagina-specifieke
  `navRight`-content in plaats van erna, met de scheidingslijn +
  exit-actie (via de `toonTerug`-afhandeling, verplaatst van
  `MetingLinksNav` naar `PageWithChrome` zelf) nog steeds als laatste.
  `MetingLinksNav` doet nu alleen de 4 links, niet meer de exit-link.
- Nieuwe `terugActie`-prop op `PageWithChrome`: Een terug-actie binnen
  hetzelfde scherm die uiterst links komt te staan, gevolgd door een
  eigen scheidingslijn, vóór de 4 vaste links. Op de resultatenpagina
  gebruikt voor "← Terug naar de scan" (met pijltje, zoals de andere
  terug-acties in de nav), los van "Exporteren" dat bij de vaste links
  blijft staan.

Resultaat op de resultatenpagina: "← Terug naar de scan" →
scheidingslijn → Visie/Bouwstenen/AI Scan/2030 → Exporteren →
scheidingslijn → "← Terug naar Mijn metingen". Elders (doorloopflow,
"Mijn metingen") blijft de volgorde Visie/Bouwstenen/AI Scan/2030 →
scherm-specifieke actie(s) → scheidingslijn → exit-actie, waar van
toepassing.

Geverifieerd in de browser op de resultatenpagina, de doorloopflow en
"Mijn metingen" (waar de exit-actie terecht ontbreekt). `npx tsc
--noEmit`, `npm run build` en `npm run lint` slagen zonder nieuwe
fouten.

## 2026-09-24 — content-2030.md ingehaald: 4 ontbrekende onderdelen toegevoegd

**Aanleiding**: Bij het doorlopen van de bijgewerkte spec-bestanden bleek
`content-2030.md` flink uitgebreid ten opzichte van wat er al op
`/klantcontact-2030` stond. Per onderdeel gevraagd en akkoord gekregen op
alle vier.

**Doorgevoerd** (`data/klantcontact-2030-content.ts`,
`app/klantcontact-2030/page.tsx`):
- Nieuwe sectie "Kosten en businesscase" tussen "Wat dit voor AI concreet
  betekent" en "Wat dit voor mensen betekent" (Gartner/McKinsey-cijfers).
- 4e punt bij "Wat dit voor AI concreet betekent": "Beveiliging is voor
  een groot deel een intern vraagstuk" (Gartner), plus een ontbrekende
  cijferalinea bij punt 2 (Stanford HAI, AI-agents).
- 2 nieuwe alinea's bij "Wat dit voor mensen betekent" (Deloitte-cijfers
  over adoptie, McKinsey-cijfer over baanverlies).
- "De machine customer"-sectie uitgebreid met een nieuwe bullet-lijst van
  5 concrete effecten op het contact zelf, en een cijferalinea over
  wereldwijde AI-adoptie (Stanford HAI) bij punt 2.

Technisch: `TitelTekst.tekst` accepteert nu `string | string[]` zodat een
genummerd punt meerdere alinea's kan hebben (nodig voor de nieuwe
cijferalinea's); `GenummerdeLijst` in `klantcontact-2030/page.tsx` is
daarop aangepast.

Geverifieerd in de browser: Alle vier de toevoegingen staan op de juiste
plek en in de juiste volgorde op `/klantcontact-2030`. `npx tsc --noEmit`,
`npm run build` en `npm run lint` slagen zonder nieuwe fouten.

## 2026-09-24 — De 4 vaste links (Visie/Bouwstenen/AI Scan/2030) overal in de header

**Aanleiding**: Direct na de nav-herstructurering hieronder bleken de 4
vaste content-links te beperkt: Ze stonden alleen nog op "Mijn metingen"
en de 4 content-pagina's zelf, zoals CLAUDE.md op dat moment voorschreef.
Sander wilde de knoppen weer overal terug.

**Doorgevoerd**: `PageWithChrome` rendert de 4 vaste links (via
`MetingLinksNav`) nu zelf, altijd, in plaats van dat losse pagina's ze
zelf in hun `navRight` moeten opnemen — nieuwe props `code` (voor de
`?code=`-parameter) en `toonTerug` (voor de exit-link) op `PageWithChrome`
zelf. Daardoor staan ze nu ook op de eerder niet-bediende schermen: Kies
jouw assessment, de assessment-landingspagina, Voorbeeld-output, en
binnen de persoonlijke link ook op de Respondent-intake. Op de
doorloopflow en de resultatenpagina staan ze na de scherm-specifieke
acties ("Naar resultaten →", "Terug naar de scan" + Exporteren) en vóór
de scheidingslijn + exit-link, volgens de bestaande nav-volgorderegel.
De 5 pagina's die de links al hadden (Mijn metingen, Visie, Bouwstenen,
AI Scan, 2030) gebruiken nu ook de nieuwe `code`/`toonTerug`-props in
plaats van zelf `<MetingLinksNav>` te renderen, om dubbele links te
voorkomen. CLAUDE.md is bijgewerkt: Het eerder openstaande punt of deze
links ook op doorloopflow/resultatenpagina moesten staan, is hiermee
beantwoord (ja, overal) en uit de open punten gehaald.

Geverifieerd in de browser: De 4 links staan op alle geteste schermen
(home, assessment-landingspagina, Mijn metingen, doorloopflow,
resultatenpagina), in de juiste volgorde en zonder dubbele links; de
Exporteren-dropdown werkt nog steeds. `npx tsc --noEmit`, `npm run build`
en `npm run lint` slagen zonder nieuwe fouten.

## 2026-09-24 — Nav-herstructurering rond "Mijn metingen", export-dropdown, "Naar resultaten →" en 2030-sectie

**Aanleiding**: `CLAUDE.md`, `stylesheet.md`, `content-2030.md`,
`admin-beheerpagina.md` en `v1-aanpassingen.md` zijn bijgewerkt met een
aantal concrete specificatiewijzigingen. In plaats van die stilzwijgend
door te voeren (zoals eerder in dit project gebeurde), is per onderdeel
expliciet gevraagd of het doorgevoerd moest worden — op alle 4 is "ja"
geantwoord.

**Doorgevoerd**:
- **"De machine customer" op `/klantcontact-2030`**: nieuwe sectie tussen
  "Vijf dingen die iedere organisatie moet ontwerpen" en "Wat dit voor AI
  concreet betekent", met een korte inleiding, 3 genummerde punten en een
  afsluiting — content uit het bijgewerkte `content-2030.md`
  (`data/klantcontact-2030-content.ts`).
- **Eén export-knop i.p.v. twee losse**: nieuwe herbruikbare
  `DropdownKnop`-component (`components/DropdownKnop.tsx`,
  `.dropdown-knop`/`.dropdown-menu`-stijlen in `components.css`) volgens de
  nieuwe "Dropdown-knop"-spec in `stylesheet.md`. Op de resultatenpagina
  vervangen de twee uitgeschakelde PDF/CSV-knoppen onderaan de pagina door
  één "Exporteren ▾"-knop in de nav, met "Als PDF"/"Als CSV" als
  (nog uitgeschakelde) opties.
- **"Naar resultaten →" in de doorloopflow**: zodra een invulling
  `"afgerond"` is, toont de nav-rechts van de doorloopflow een link
  rechtstreeks naar de resultatenpagina, vóór de scheidingslijn — zodat
  een respondent die per ongeluk terug navigeert naar de scan niet
  vastloopt zonder weg terug naar de resultaten.
- **Nav-herstructurering rond "Mijn metingen"**: de 4 vaste content-links
  (Visie/Bouwstenen/AI Scan/2030 — voorheen globaal via `PageWithChrome`
  op élke pagina) staan nu alleen nog op de 5 relevante pagina's: "Mijn
  metingen" zelf en de 4 content-pagina's, via de nieuwe
  `MetingLinksNav`-component. `PageWithChrome` is teruggebracht naar een
  simpele doorgeefluik (`navRight`/`logoHref` props, geen hardcoded
  content meer). Om de naamconflicten op te lossen tussen de bestaande
  interactieve grids en de nieuwe platte-tekstpagina's uit dezelfde
  content, zijn de laatste ondergebracht op nieuwe routes:
  `/visie/bouwstenen` (uit `visie-coniche.md` deel 2) en `/visie/ai` (uit
  `visie-ai-klantcontact.md`) — `/bouwstenen` en `/ai-domeinen`
  (de interactieve grids) blijven ongewijzigd bestaan, maar verliezen hun
  plek in de hoofdnav. Overal binnen een persoonlijke respondent-link
  (intake, doorloopflow, resultaten, Mijn metingen, de 4 content-pagina's)
  gaat het logo nu naar "Mijn metingen" i.p.v. de publieke homepage
  (`logoHref`-prop op `SiteHeader`), en threaden alle content-pagina's een
  `?code=`-parameter door zodat ze zowel hun eigen "← Terug naar Mijn
  metingen"-exitlink als de logo-bestemming kunnen opbouwen. Doorloopflow
  en resultatenpagina krijgen bewust niet de 4 content-links in hun nav
  (CLAUDE.md markeert dat expliciet als een nog open punt, geen vastgesteld
  gedrag).

Geverifieerd in de browser: "Mijn metingen" en de 4 content-pagina's tonen
de nav-links en (waar van toepassing) de exitlink correct, inclusief
doorgegeven `?code=`; de Exporteren-dropdown opent/sluit correct met de
juiste tooltip op de uitgeschakelde opties; "Naar resultaten →" verschijnt
alleen bij een afgeronde invulling; het logo verwijst binnen een
respondent-link naar "Mijn metingen"; `/bouwstenen` en `/ai-domeinen`
blijven los bereikbaar en werken ongewijzigd. `npx tsc --noEmit`, `npm run
build` en `npm run lint` slagen zonder nieuwe fouten (de 4 bestaande
warnings in `js/*.js` zijn ongerelateerde legacy-bestanden).

## 2026-09-24 — Fix: "Kopieer" bevestigde soms een mislukte klembord-actie

**Aanleiding**: Sander meldde dat de "Kopieer"-knop bij een publieke link
soms een niet-werkende link kopieert. Oorzaak: `navigator.clipboard.
writeText(...)` werd aangeroepen zonder de belofte af te wachten of op
een fout te controleren — de knop toonde altijd meteen "Gekopieerd!",
ook als het schrijven naar het klembord op de achtergrond mislukte (bijv.
geen focus op de pagina, strenger browserbeleid). In dat geval bleef de
vórige inhoud van het klembord staan — een oude, mogelijk niet meer
geldige link — zonder dat de gebruiker dat kon zien.

**Doorgevoerd**: nieuwe `kopieerNaarKlembord()` in `lib/clipboard.ts`:
wacht de Clipboard API af en valt bij een fout terug op de klassieke
`document.execCommand("copy")`-methode via een tijdelijk tekstveld. Beide
plekken die een publieke link kopiëren
(`app/beheer/scans/[respondentId]/page.tsx`,
`app/beheer/organisaties/[organisatieId]/page.tsx`) gebruiken 'm nu, en
tonen "Gekopieerd!" alleen nog bij een bevestigd succesvolle kopie —
anders "Mislukt, probeer opnieuw" zodat de gebruiker het merkt.

Geverifieerd in de browser: de knop toont "Gekopieerd!" alleen als het
klembord daadwerkelijk is bijgewerkt. `npx tsc --noEmit`, `npm run build`
en `npm run lint` slagen zonder fouten.

## 2026-09-24 — Nieuwe pagina "AI" met het AI-domeinenmodel

**Aanleiding**: `ai-domeinenmodel-visual.md` toegevoegd (analoog aan
`bouwstenenmodel-visual.md`, maar dan voor de 8 AI-domeinen). Sander
vroeg om een nav-knop "AI" tussen "Bouwstenen" en "2030" die hiernaartoe
verwijst — de spec zelf liet die plek expliciet open ("volledig open,
hangt nog nergens").

**Doorgevoerd**: nieuwe pagina `/ai-domeinen`, één plat grid van 4×2
kaarten (geen categorielaag zoals bij de Klantcontact-scan, dus geen
overkoepelende/fundamentele balken en geen kleurgroepering — alle 8
domeinen gebruiken dezelfde `--or`-accentkleur, zoals de spec voorschrijft
om geen niet-bestaande indeling te suggereren). Klikken opent dezelfde
`Modal`-component als `/bouwstenen` en de toelichting-overlay in de
doorloopflow, met eyebrow "AI-DOMEIN N".

**Update dezelfde dag**: `visie-ai-klantcontact.md` is aangeleverd, dus de
eerder genoemde beperking (geen "Centrale vraag"-blok, alleen de kale
omschrijving) is opgeheven. Nieuw `data/ai-domeinen-content.ts`
(hetzelfde patroon als `data/bouwstenen-content.ts`) met beschrijving +
centrale vraag per domein. `/ai-domeinen` toont nu het volledige
"Centrale vraag"-blok. `components/BouwblokForm.tsx` (de
toelichting-overlay in de doorloopflow) is verbreed van alleen de
Klantcontact-scan naar ook de AI-scan: één `toelichtingInfo`-object dat
naar `alleBouwstenen` (bb…) of `aiDomeinen` (ai…) kijkt en anders op
`bouwblok.toelichting` terugvalt, zodat het i-icoontje in de doorloopflow
voor beide scans nu exact dezelfde content toont als de bijbehorende
publieke overzichtspagina — zoals `ai-domeinenmodel-visual.md` vereiste
("geen content dupliceren").

Geverifieerd in de browser: nav-knop, grid, klik-naar-modal, de
actieve/hover-status, en het i-icoontje in de AI-doorloopflow tonen
dezelfde "Centrale vraag"-content. `npx tsc --noEmit`, `npm run build` en
`npm run lint` slagen zonder fouten.

## 2026-09-23 — Rapportage-knop: gemiddelde over afgeronde respondenten per meting

**Aanleiding**: Sander vroeg om een "Rapportage"-knop naast "Uitnodigen"
per meting, die een rapport maakt over de ingevulde scans met status
"afgerond". Dit is de eenvoudigste invulling van het backlogpunt
"Aggregatie over meerdere respondenten binnen een meting" (alleen het
gemiddelde, geen spreiding/afwijking — dat stond daar expliciet nog open).

**Doorgevoerd**: nieuwe knop `Rapportage` in `ScanUitvoeringBlok`
(`app/beheer/organisaties/[organisatieId]/page.tsx`), naast de
uitnodigingsform, uitgeschakeld zolang er nog geen enkele afgeronde
invulling is. Leidt naar een nieuwe pagina
`/beheer/rapportage/[scanUitvoeringId]`: pakt alle invullingen met status
"afgerond" binnen die ene meting, middelt per vraag over die respondenten
(`(som van de antwoorden op die vraag) / aantal respondenten`), en geeft
dat gemiddelde-antwoordenobject aan de bestaande `ResultsView`-component
— dezelfde component als de individuele resultatenpagina, dus bouwblok-/
categoriescores, radar, staafdiagram, top 3 en legenda werken hier
identiek, nu op het gemiddelde in plaats van één respondent. Nieuwe
`useScanUitvoering(scanUitvoeringId)`-lookup in `lib/db.ts` om organisatie
+ meting rechtstreeks op scanUitvoering-id te vinden (bestond nog niet;
de bestaande lookups zochten op scanInvulling-id of toegangscode).

Geverifieerd in de browser: rapportage voor een meting met 2 afgeronde
AI-scan-respondenten toont een correct gemiddelde (overall score 3.5,
"Sterk punt"), met werkende radar/staafdiagram-tooltips en top 3.
`npx tsc --noEmit`, `npm run build` en `npm run lint` slagen zonder
fouten.

## 2026-09-23 — Visuele verfijning bouwstenen-overzicht, spacing en hergebruik in de doorloopflow

**Aanleiding**: iteratieve bijsturing door Sander op de eerste bouwpoging
van `/bouwstenen` (uitlijning, kleuren, kadering) en op de spacing van de
nieuwe content-pagina's, plus het verzoek om de toelichting-overlay in de
doorloopflow dezelfde rijke informatie te tonen als de bouwstenen-pagina.

**`/bouwstenen`, stap voor stap bijgesteld naar het definitieve resultaat**:
- Elk bouwsteen-blok vult verticaal (`display:flex; align-items:center`)
  zodat 1-regelige en 2-regelige titels binnen dezelfde rij evenveel
  ruimte gebruiken, met een vaste `height: 4.75rem` zodat alle 15 blokken
  exact even groot zijn (niet alleen even hoog, ook `minWidth: 0` zodat
  lange samengestelde woorden ("Kennismanagement", "Kanaalmanagement") de
  kolombreedte niet meer opdrukken — die twee mogen nu over 2 regels,
  met een onzichtbare break-hint op de samenstellingsgrens in plaats van
  een lelijke afbreking midden in "-ment").
- De 3 gegroepeerde rijen (Organisatie/Proces & Tech/Mens) hebben een
  achtergrondkleur (`var(--or-faint)`, licht oranje) die label + kaarten
  samen omvat, zonder bullet-stip voor de labeltekst.
- Blok 1, 5, 9, 13 en 15 lijnen rechts uit met kolom 3; blok 2 lijnt
  rechts uit met kolom 4 (kolom 1 blijft voor alle full-width balken en
  grid-kaarten gelijk links uitgelijnd) — bereikt door de balken
  `gridColumn: "1 / span 3"` resp. `"1 / -1"` te geven binnen dezelfde
  4-koloms grid als de rijen zelf, i.p.v. een eigen `1fr`-grid.
- Een oranje stippellijn-kader om het geheel, waarvan de boven- en
  onderrand niet om blok 1 en 15 heen lopen maar er precies horizontaal
  doorheen (op de verticale middens) — gemeten via `getBoundingClientRect`
  in een `useLayoutEffect` (`StippellijnKader`-component), niet met een
  gewone CSS `border`, omdat die geen niet-symmetrische padding kan geven.
  Dit wijkt bewust af van `bouwstenenmodel-visual.md` ("geen
  stippellijn-kader om de grid heen") — expliciet zo gevraagd door Sander.
- Categorielabels ("Organisatie", "Proces & Tech", "Mens") van `text-xs`
  naar `text-sm`, gelijk aan de bouwsteen-titels.

**Spacing op `/visie` en `/klantcontact-2030` verkleind**: de gedeelde
`.section`-klasse (6rem verticale padding, bedoeld voor landingspagina's)
verving ik op deze twee content-pagina's door een kleinere eigen padding
(2.5rem), zonder de gedeelde klasse zelf aan te passen (die wordt elders
nog gebruikt). Hero-onderkant en de afsluitende ruimte voor de footer
zijn ook verkleind. De herointro op `/visie` is verbreed (`maxWidth`
38→44rem) zodat hij op exact 2 regels uitkomt i.p.v. 3.

**Privacy-koppen kleiner**: de 9 genummerde `<h2>`-koppen op `/privacy`
hebben nu `fontSize: 1.3rem` in plaats van de standaard h2-grootte
(~2.65rem) — blijven semantisch `<h2>`, alleen visueel kleiner.

**Nav**: "2030" toegevoegd naast "Visie" en "Bouwstenen" in de gedeelde
header (`PageWithChrome`), verwijzend naar de al bestaande
`/klantcontact-2030`-pagina.

**Toelichting-overlay in de doorloopflow hergebruikt de bouwstenen-content**:
`components/BouwblokForm.tsx` toont nu, voor de Klantcontact
Volwassenheidsscan (bouwblok-id's beginnend met "bb"), dezelfde
eyebrow/titel/"Centrale vraag"/beschrijving-opmaak als de
`/bouwstenen`-modal, via een nieuwe `alleBouwstenen`-lookup in
`data/bouwstenen-content.ts` (gekoppeld op `bouwblok.volgnummer`). De
AI-Volwassenheidsscan heeft deze content nog niet (bevestigd door
Sander: "Voor de AI scan zullen we deze nog maken") en valt terug op de
bestaande `bouwblok.toelichting`-tekst. `components/Modal.tsx` kreeg
hiervoor eerder al de optionele `eyebrow`/`accentColor`-props (zie de
vorige changelog-entry), nu ook gebruikt door deze tweede plek.

Geverifieerd in de browser bij elke stap; `npx tsc --noEmit`,
`npm run build` en `npm run lint` slagen zonder fouten.

## 2026-09-23 — Drie nieuwe content-specs verwerkt: bouwstenenmodel, 2030, privacy

**Aanleiding**: Sander en Joost voegden drie nieuwe specs toe
(`bouwstenenmodel-visual.md`, `content-2030.md`, `privacy-pagina.md`) en
werkten `v1-aanpassingen.md` punt 2 bij: de publieke link gaat nu altijd
eerst naar "Mijn metingen" (ook bij precies één invulling), met daarop
vaste links naar Visie, Bouwstenen en een nieuw 2030-duidingsstuk.

**Doorgevoerd**:
- **`/bouwstenen` volledig herbouwd** naar `bouwstenenmodel-visual.md`:
  2 volle-breedte balken (Overkoepelend), een 4-koloms grid per categorie
  (Organisatie/Proces & Tech/Mens) en 1 balk (Fundament). Kaarten zijn wit
  met een linker accentrand in de categoriekleur (`--accent` +
  `.card-accent-left`), geen gevulde kleurvlakken — de categoriekleur
  vult alléén de kaart waarvan de modal nu open staat. Klikken opent de
  bestaande `Modal`-component (niet een nieuwe) met een eyebrow
  "CATEGORIE · BOUWSTEEN N", de naam, een "Centrale vraag"-blok met
  linker accentbalk, en de beschrijving. `components/Modal.tsx` kreeg
  daarvoor twee nieuwe, optionele props (`eyebrow`, `accentColor`) —
  bestaande aanroepen (de `toelichting`-overlay in `BouwblokForm.tsx`)
  blijven ongewijzigd werken. `button.card:hover` toegevoegd aan
  `components.css` (de bestaande hover-lift gold tot nu toe alleen voor
  `a.card`).
- **"Mijn metingen" (`/s/[code]`) toont nu altijd het overzicht**, ook bij
  precies één invulling (niet meer automatisch doorsturen). Onderaan een
  "Meer lezen"-blok met vaste links naar Visie, Bouwstenen en het nieuwe
  2030-duidingsstuk.
- **Nieuwe pagina `/klantcontact-2030`**, content uit `content-2030.md`
  (`data/klantcontact-2030-content.ts`): geen vast eindbeeld, vijf dingen
  om te ontwerpen, wat dit voor AI en voor mensen betekent, wat
  voorbereide organisaties gemeen hebben, en de relatie met de scan zelf.
- **Nieuwe pagina `/privacy`**, content uit `privacy-pagina.md`
  (9 secties; 5, 7 en 8 bewust met placeholder-tekst, nog niet juridisch
  getoetst). Footer heeft nu een "Privacy"-link naast "Beheer". De
  respondent-intake (`app/scan/[respondentId]/intake/page.tsx`) kreeg een
  verplicht toestemmingsvakje ("Ik geef toestemming om mijn antwoorden...
  te delen met Coniche") met een link naar deze pagina — alleen
  client-side verplicht (geen nieuw datamodel-veld: er wordt nu geen
  aparte toestemmingsstatus opgeslagen, dat stond ook niet in de spec).

Geverifieerd in de browser: de bouwstenen-kaarten openen de modal met de
juiste categoriekleur en centrale vraag, en de actieve kaart kleurt in en
weer uit bij sluiten; "Mijn metingen" toont beide test-metingen plus de
drie vaste links; het toestemmingsvakje blokkeert daadwerkelijk het
verzenden van de intake zolang het niet is aangevinkt.
`npx tsc --noEmit`, `npm run build` en `npm run lint` slagen zonder
fouten.

## 2026-09-23 — De 6 actieve punten uit v1-aanpassingen.md verwerkt

**Aanleiding**: Sander en Joost hebben `CLAUDE.md`, `admin-beheerpagina.md`,
`v1-aanpassingen.md`, `backlog.md`, de content-bestanden en `stylesheet.md`
grondig herzien, en drie nieuwe documenten toegevoegd (`datamodel.md`,
`visie-coniche.md`, `inhoudelijk-fundament.md`). Sander vroeg om deze
aangepaste specs te verwerken in de app. Alle zes punten die toen nog
"Actief" stonden in `v1-aanpassingen.md` zijn nu doorgevoerd (en daar
verplaatst naar "Opgelost"):

- **Punt 16, "Respondenten" i.p.v. "Leden"**: alle UI-teksten in
  `app/beheer/**` aangepast (knoppen, meldingen, rij-subtitels). De
  interne typenaam `OrganisatieLid` blijft ongewijzigd, zoals de spec
  toestaat.
- **Punt 15, Fundament-kleur antraciet**: `--fu` (`#44403c`) toegevoegd
  aan `tokens.css` en de Tailwind-brug in `globals.css`. `lib/colors.ts`
  → `CATEGORIE_COLORS` verloor de `textHex`-tekstvariant (niet meer nodig
  nu alle vijf kleuren zelf leesbaar zijn) en de sleutel "goud" heet nu
  "antraciet" (ook zichtbaar in de contentbeheer-dropdown, dus eerlijk
  benoemd). `data/klantcontact-assessment.ts`'s Fundament-categorie
  gebruikt de nieuwe sleutel.
- **Punt 13, Scorekleuren in vijf stappen**: nieuwe `--score-1` t/m
  `--score-5`-tokens (`tokens.css`) en `SCORE_KLEUR`/`scoreKleur()` in
  `lib/colors.ts`, vervangen de classificatie-gebaseerde kleuring
  (`CLASSIFICATIE_HEX`, weg) in `ScoreCircle`, `CategoryBarChart`, de
  top 3-pills en het admin-scanoverzicht. De legenda toont per
  classificatie nu 1 of 2 kleurstippen (bijv. "Basis op Orde" = rood +
  oranje), passend bij welke scores die classificatie omvat.
- **Punt 12, Bouwsteen-nummering**: `data/klantcontact-assessment.ts`'s
  15 `volgnummer`-velden bijgewerkt naar de nieuwe nummering uit
  `visie-coniche.md`. De `id`-velden (en dus vraag-id's, dus bestaande
  antwoorden) blijven ongewijzigd.
- **Punt 14, Geen achterblijvende data na verwijderen**: nieuwe
  `controleerDataIntegriteit()` in `lib/db.ts`, met een "Data-integriteit
  — Controleer nu"-knop op het beheerdashboard. Nested structuur
  voorkomt de meeste weesdata vanzelf (kind bestaat alleen genest in zijn
  ouder); de enige plek waar het wél kon (`verwijderLeden` die niet
  cascadeert) was al correct.
- **Punt 2, Korte niet-herleidbare link**: nieuw `toegangscode`-veld op
  `OrganisatieLid` (`lib/toegangscode.ts` genereert 10 tekens uit een
  alfabet zonder 0/o/1/l/i, cryptografisch random), gezet bij het
  aanmaken van een lid in `nodigLidUit`. `lib/uitnodiging-link.ts` bouwt
  nu `/s/<code>` in plaats van de oude link met een base64-bootstrap
  erin. Nieuwe route `app/s/[code]/page.tsx`: bij precies 1 invulling
  direct doorsturen (intake/doorloop/resultaten naar keuze van de
  status), bij 0 of meerdere een "Mijn metingen"-overzicht. Bewuste
  vereenvoudiging t.o.v. het voorstel: geen aparte `Toegangscode`-tabel —
  de code staat direct op het lid, dat geeft hetzelfde resultaat
  (lid weg → code weg) zonder een tweede structuur erbij.
  **Gevolg**: de link werkt niet meer cross-browser zonder gedeelde
  backend (bewuste keuze, zie v1-aanpassingen.md) — `importScanInvulling`/
  `decodeBootstrap`/`ScanInvullingBootstrap` zijn daarom verwijderd.
  Ook `ScanUitvoering.status`/`.openVanaf`/`.sluitOp` zijn weg: nooit
  gebruikt, en meetperiode-planning staat expliciet in `backlog.md`.

Geverifieerd in de browser: Fundament-accentkleur is antraciet in de
doorloopflow; het resultatenscherm toont "Uitbouwen" nu in geel (score 3)
in plaats van oranje, met de juiste kleur op de cirkel, staafdiagram, top
3 en legenda; de sidebar toont de nieuwe bouwsteen-nummers; de
data-integriteitscontrole meldt "Geen achterblijvende data gevonden."; en
een respondent met twee metingen (Klantcontact + AI) opent via zijn ene
`/s/<code>`-link het "Mijn metingen"-overzicht, met per meting een link
naar het juiste scherm. `npx tsc --noEmit`, `npm run build` en
`npm run lint` slagen zonder fouten.

## 2026-09-23 — "Verwijderen" op Ingevulde scans laat de rij nu ook echt verdwijnen

**Aanleiding**: Sander meldde dat hij een scan niet kon verwijderen op
"Ingevulde scans" — na bevestigen van de verwijderactie bleef de rij
gewoon staan. Oorzaak: die knop deed wat admin-beheerpagina.md ("Verwijderen
— cascade-regels") altijd al voorschreef voor déze pagina — alleen de
antwoorden/status resetten naar "uitgenodigd", niet de rij weggooien, zodat
het lid en de uitnodiging bleven bestaan. Functioneel werkte dat dus
precies zoals gespecificeerd, maar het woord "Verwijderen" wekt de
verwachting dat de rij verdwijnt, en dat gebeurde niet — verwarrend genoeg
om als bug te voelen.

**Doorgevoerd**: Sander koos ervoor om het gedrag aan te passen in plaats
van alleen de tekst te verduidelijken. `lib/db.ts` heeft nu
`verwijderScanInvullingen(scanInvullingIds)` in plaats van
`resetScanInvullingen`: deze gooit de `ScanInvulling` zelf weg uit haar
`ScanUitvoering`, dus de rij verdwijnt uit "Ingevulde scans". Bewust
NIET zo diep als "Leden verwijderen" op de organisatiepagina (dat gooit
de hele persoon weg, met cascade naar ÁL hun metingen) — deze actie raakt
alleen deze ene scan-uitnodiging. Als dezelfde persoon nog een andere
meting heeft lopen (bijv. zowel de Klantcontact- als de AI-scan), blijft
die andere meting gewoon intact; alleen het lid zelf (naam, e-mailadres)
overleeft sowieso altijd. `app/beheer/scans/page.tsx` gebruikt de nieuwe
functie en heeft een aangepaste bevestigingstekst die dit ook benoemt.

Geverifieerd: een testpersoon met twee metingen (Klantcontact + AI) —
verwijderen van de Klantcontact-rij liet die rij verdwijnen, terwijl de
AI-rij van dezelfde persoon (nog steeds "Afgerond", 100%) intact bleef en
het lid zelf in de organisatie bleef bestaan.

## 2026-09-23 — Tijdelijke testknop op de doorloopflow: vragenlijst automatisch invullen

**Aanleiding**: op verzoek van Sander, om het resultatenscherm
(classificatiekleuren, radar chart, spreiding tussen bouwblokken) te
kunnen testen zonder telkens met de hand 40-60 vragen te beantwoorden.

**Doorgevoerd**: bovenaan `app/scan/[respondentId]/doorloop/page.tsx`
staat nu een duidelijk gemarkeerd blok ("TESTKNOP (tijdelijk)", stippellijn,
oranje) met een invoerveld voor een gemiddelde score (2 t/m 4) en een knop
"Vul alle vragen automatisch in". Die vult ALLE vragen van de hele
assessment (niet alleen het huidige bouwblok) met een cyclisch patroon:
gemiddelde-1, gemiddelde, gemiddelde+1, herhalend — zodat bouwblokken en
categorieën een realistische spreiding rond het gekozen gemiddelde
krijgen in plaats van allemaal exact dezelfde score. Zet de invulling
meteen op "afgerond" en springt door naar het resultatenscherm.

**Nog te doen vóór productie**: dit is expliciet tijdelijk (zie de
comment in de code) en moet eruit voordat de app naar echte respondenten
gaat — een respondent hoort dit hulpmiddel nooit te zien.

## 2026-09-23 — Test-modus verwijderd (admin-login-bypass en testklant-knop)

**Aanleiding**: Sander vroeg om "de test optie" te verwijderen. Dit was
`lib/instellingen.ts`: één localStorage-vlag, standaard AAN, die twee
dingen deed — Beheer openen zonder in te loggen (`app/beheer/layout.tsx`)
en op de assessment-landingspagina een "Start assessment"-knop tonen die
direct naar een vaste testklant sprong (`vindOfMaakTestInvulling` in
lib/db.ts) in plaats van de knop uit te schakelen. Precies het punt dat
al eerder was gesignaleerd als iets om vóór productie op te lossen (de
live Vercel-deploy stond hiermee open zonder wachtwoord).

**Doorgevoerd**: `lib/instellingen.ts` verwijderd. `app/beheer/layout.tsx`
valt nu altijd terug op `BeheerLoginForm` (echte e-mail+wachtwoord-login,
`lib/admin-auth.ts` — die bestond al, test-modus was er alleen een bypass
omheen). `app/beheer/page.tsx` verloor de test-modus-toggle en het
testklant-linkblok. `app/[assessmentId]/page.tsx` toont de "Start
assessment"-knop nu altijd disabled met de "toegang via persoonlijke
link"-tekst; `vindOfMaakTestInvulling` en de bijbehorende
`TEST_LID_EMAIL` in lib/db.ts zijn weg. De vaste testklant-seed in
`data/demo-organisatie.ts` (voor een niet-lege eerste indruk van het
beheerscherm) blijft ongewijzigd staan — dat is losse seed-data, geen
"test optie" om in of uit te schakelen.

Geverifieerd: `/beheer` toont nu direct het inlogformulier (geen bypass
meer), de landingspagina's "Start assessment"-knop is altijd disabled.
`npx tsc --noEmit`, `npm run build` en `npm run lint` slagen zonder
fouten.

## 2026-09-23 — Datamodel herbouwd op `datamodel-rbac-voorstel.md` (Deel 1: structuur, geen auth/RBAC)

**Aanleiding**: Sander deelde `datamodel-rbac-voorstel.md` (status:
voorstel, nog niet gevalideerd) en vroeg of dit in de app past en welke
verschillen er zijn. Belangrijkste verschil met het oude model: één
`Respondent`-record deed daar drie dingen tegelijk — de persoon, de
organisatie-uitnodiging én de ene invulling — waardoor een organisatie
nooit meer dan één scanronde per persoon kon hebben en een tweede
scan-type voor dezelfde organisatie niet paste. Het voorstel splitst dit
in `Organisatie → OrganisatieLid[]` (de persoon) en
`Organisatie → ScanUitvoering[]` (een geplande ronde, met eigen
assessment-type) `→ ScanInvulling[]` (één poging van één persoon in één
ronde). Sander koos expliciet voor **Deel 1**: alleen deze structurele
herindeling, niet het auth/RBAC-gedeelte van het voorstel.

**Doorgevoerd**: `lib/types.ts` en `lib/db.ts` volledig herbouwd op de
nieuwe structuur; alle pagina's in `app/beheer/**` en `app/scan/**`
volgen. Bewuste vereenvoudigingen t.o.v. het voorstel, alle vier omdat
ze óf een echte backend vereisen (die er nog niet is) óf geen aantoonbare
meerwaarde hebben in een localStorage-prototype:
- Geen `Gebruiker`/`Sessie`/`Rol`/`Permissie`/`VerificatieCode`-hashing/
  `AuditEvent` — dit zijn geen datamodel-keuzes maar een echte
  authenticatielaag; die clientside nadoen met localStorage zou schijn-
  veiligheid opleveren. Blijft "Deel 2", nog te bouwen zodra er een
  backend is.
- Geen apart `toegangsToken`-veld: `nieuwId()` (`lib/id.ts`) genereert al
  `crypto.randomUUID()`, dus elk `.id` is zelf al niet te raden — een
  tweede token ernaast zou hetzelfde probleem dubbel oplossen.
- Content (`Categorie`/`Bouwblok`/`Vraag`) blijft genest in de
  Assessment-data, niet genormaliseerd naar losse FK-tabellen — dat stond
  niet in de vijf onderbouwde redenen van het voorstel en zou puur kosten
  toevoegen.
- `antwoorden`/`opmerkingenPerBouwblok` blijven `Record<string, ...>`-
  maps op `ScanInvulling`, geen losse tijdgestempelde per-antwoord-
  records — niet nodig zolang er geen antwoordgeschiedenis getoond hoeft
  te worden.
- De publieke link wijst nog steeds naar `ScanInvulling.id`, niet naar
  `OrganisatieLid.id` — dat laatste hoort bij het voorstel's "persoonlijke
  omgeving met meerdere invullingen"-scherm, dat expliciet nog niet
  gebouwd is (zie ook backlog.md).

Terminologie: intern heet dit nog steeds "Scanuitvoering" (het
`ScanUitvoering`-type, `scanUitvoeringId`, functienamen als
`maakScanUitvoering`), maar alle gebruikersgerichte tekst (admin-scherm,
knoppen, koppen) zegt voortaan "Meting" — op verzoek van Sander.

Geverifieerd in de browser: een organisatie kan nu meerdere
scanuitvoeringen/metingen hebben (verschillende assessment-types of
rondes); een tweede uitnodiging voor hetzelfde e-mailadres binnen
dezelfde organisatie hergebruikt het bestaande `OrganisatieLid` in plaats
van een dubbele persoon aan te maken; de doorloopflow, intake en
"Ingevulde scans"-overzicht (incl. nieuwe "Meting"-kolom en filters)
werken door op de nieuwe structuur. `npx tsc --noEmit`, `npm run build`
en `npm run lint` slagen zonder fouten.

## 2026-09-22 — Fundament-geel te licht als tekstkleur, donkerdere variant toegevoegd

**Aanleiding**: Sander meldde dat de gele Fundament-kleur (`--ye:
#ffc043` uit tokens.css) slecht leesbaar is — als tekst ("FUNDAMENT" in
de sidebar, "BOUWBLOK 15" boven een bouwblok) en als achtergrond onder
witte tekst (het "bezig"-rondje) heeft dit geel te weinig contrast op
een lichte achtergrond. Geen bouwfout: het officiële merkpalet in
stylesheet.md heeft zelf geen donkerder geel/goud naast `--ye`/`--ye-l`.

**Doorgevoerd**: `lib/colors.ts` → `CATEGORIE_COLORS.goud` heeft nu een
los `textHex: "#8a6d00"` naast de officiële `hex: "#ffc043"`. Alle
plekken die de categoriekleur als `--accent` (tekst, wit-op-kleur
achtergrond, randen) gebruiken — `Sidebar.tsx`, `BouwblokForm.tsx`, en
via `accentHex` ook `ScaleRadio.tsx` — gebruiken nu `textHex` in plaats
van `hex`. Voor de andere vier categorieën (oranje/blauw/paars/groen)
is `textHex` gelijk aan `hex`, die zijn zelf al donker genoeg. De
officiële `#ffc043`/`bg-ye` blijft ongewijzigd beschikbaar voor plekken
waar geel puur als kleurvlak dient, niet als tekst.

Bouwbeslissingen die niet uit een van de content-/specdocumenten
(CLAUDE.md, v1-aanpassingen.md, etc.) volgen, maar tijdens het bouwen
door Sander zijn genomen — meestal om een tegenstrijdigheid tussen twee
eerder aangeleverde documenten op te lossen. Nieuwste bovenaan.

## 2026-09-22 — Sidebar: koptekst (naam/voortgang) losgemaakt van de lijst

**Aanleiding**: op verzoek van Sander (met screenshot) — de naam en
voortgang ("X% — Y van Z vragen") verdwenen bovenin de sidebar zodra je
in `.flow-main` helemaal naar beneden scrolde naar het einde van een
bouwblok (bij de "Volgende"-knop). Root cause: de sidebar was ÉÉN sticky
box (naam + voortgang + lijst samen). Een `position: sticky`-element
ontsnapt onvermijdelijk aan het vastplakken zodra de scroll de onderkant
van zijn eigen containing block nadert — en dat gebeurt bij een gedeelde
box exact aan het eind van elk bouwblok, precies het moment waarop de
voortgang zichtbaar moet blijven. Eerdere tussenstap (`.flow-sidebar`
laten meegroeien met `.flow-main` i.p.v. vaste 100vh-hoogte) hielp wel
(later probleem pas), maar loste het niet fundamenteel op: bij het einde
van ÉÉN bouwblok is er per definitie nooit genoeg resterende scrolhoogte
over voor een grote sticky box om vast te blijven plakken.

**Doorgevoerd**: de koptekst (naam + voortgangsbalk + label) en de lijst
(categorieën/bouwblokken) zijn nu twee aparte sticky elementen
(`.flow-sidebar-koptekst` / `.flow-sidebar-lijst` in components.css, zie
`components/Sidebar.tsx`) i.p.v. één gedeelde box. De koptekst is klein
genoeg dat hij nooit de bodem van een bouwblok kan bereiken, en blijft
dus altijd zichtbaar. De lijst mag — anders dan de koptekst — nog wél een
keer wegscrollen bij een kort bouwblok; dat was niet het gemelde
probleem. `.flow-sidebar` zelf rekt via CSS Grid mee met `.flow-main`
(geen vaste 100vh-hoogte meer) zodat de lijst zo lang mogelijk zichtbaar
blijft. Geldt alleen boven de 900px-breakpoint; de mobiele variant
(`.flow-mobiel-voortgang`, zie het vorige punt hieronder) was al apart
opgelost en blijft ongewijzigd.

## 2026-09-21 — Rebuild op de aangeleverde `tokens.css`/`components.css`/`admin.css`/`charts.css`

## 2026-09-22 — Compacte voortgangsbalk onder de 900px-breakpoint

**Aanleiding**: op verzoek van Sander — tijdens het beantwoorden van
vragen op een smal scherm moet de voortgang altijd zichtbaar blijven.
Dit botst met de bestaande, expliciet vastgelegde afspraak in
`stylesheet.md`/`components.css` (v1-aanpassingen.md punt 11): de sticky
sidebar-fix geldt uitdrukkelijk alleen boven de 900px-breakpoint,
daaronder is `.flow-sidebar` bewust `position: static` en scrolt dus
mee weg — een volledige sticky sidebar past simpelweg niet naast de
inhoud op een telefoonbreedte.

**Doorgevoerd**: een nieuw, compact element (`.flow-mobiel-voortgang` in
components.css, component `components/MobielVoortgang.tsx`) met alleen de
voortgangsbalk + "X% — Y van Z vragen", dat ALLEEN onder 900px zichtbaar
is en daar altijd sticky blijft — niet als kind van `.flow-sidebar` (die
blijft ongewijzigd static/wegscrollend), maar als eigen element vóór
`.flow-layout`, zodat het sticky blijft over de volledige paginahoogte
(inclusief het scrollen door de vragen in `.flow-main`), niet alleen
binnen de sidebar zelf. Boven 900px ongewijzigd: de volledige sidebar is
daar al sticky, dus dit element blijft verborgen.

## 2026-09-22 — Test-modus: "Start assessment" ook bruikbaar op de landingspagina

**Aanleiding**: op verzoek van Sander — test-modus moest ook gelden voor
de "Start assessment"-knop op scherm 2 (assessment-landingspagina), die
normaal altijd disabled is omdat toegang uitsluitend via een door Coniche
aangemaakte uitnodiging loopt (zie de eerdere beslissing van 2026-09-17
hieronder, die voor de reguliere flow nog steeds geldt).

**Doorgevoerd**: staat test-modus aan (`lib/instellingen.ts`), dan is de
knop klikbaar en roept `lib/db.ts` → `vindOfMaakTestRespondent(assessmentId)`
aan: zoekt een bestaande testorganisatie+respondent voor dát
assessment-type (herkenbaar aan het vaste testklant-e-mailadres
`sander_hesselink@hotmail.com`), of maakt er één aan (organisatie
"TestConicheScan BV", lege kenmerken) als die nog niet bestaat. Voor de
Klantcontact Volwassenheidsscan is dit dezelfde testklant als de
seed-data; voor elk ander assessment-type (nu: AI-Volwassenheid) ontstaat
een eigen testorganisatie bij de eerste keer klikken. Navigeert daarna
naar de publieke-link-gate (`/scan/[respondentId]`), die vervolgens net
als bij een echte respondent doorstuurt naar intake/doorloop/resultaten
op basis van status — nogmaals klikken op "Start assessment" begint dus
niet opnieuw, maar hervat waar de testklant gebleven was.

## 2026-09-22 — Test-modus voor Beheer: inloggen overslaan, standaard aan

**Aanleiding**: op expliciet verzoek van Sander, om tijdens de bouw snel
Beheer in te kunnen en de vragenlijsten door te kunnen ontwikkelen zonder
elke keer in te loggen. Dit is een ANDER "test-modus"-concept dan de
schakelaar die op 2026-09-17 was toegevoegd en op 2026-09-21 weer is
verwijderd (die sloeg op het overslaan van de respondent-
e-mailverificatie, inmiddels vervangen door de "Publieke link"-flow
zonder verificatiescherm) — dit gaat over de admin-inlog uit
admin-beheerpagina.md ("Login": e-mail + wachtwoord + 2FA, hier nog een
prototype-inlog).

**Doorgevoerd**: `lib/instellingen.ts` (opnieuw toegevoegd, zelfde
bestandsnaam als eerder maar andere inhoud) met een schakelaar, standaard
AAN. Staat hij aan, dan slaat `app/beheer/layout.tsx` de inlogcheck over
en is Beheer direct open. Schakelaar staat op het beheer-dashboard, samen
met een vaste testklant (organisatie "TestConicheScan BV", respondent
`sander_hesselink@hotmail.com`, status "uitgenodigd") die als seed-data in
`data/demo-organisatie.ts` staat, met een kopieerknop voor de publieke
link zodat de doorloopflow direct getest kan worden. Omdat de seed alleen
bij een lege localStorage wordt geschreven, is een browser die de scan al
eerder had geopend (bijv. tijdens eerder testen) niet automatisch
bijgewerkt — die testklant moet er dan handmatig bij, of localStorage
wissen.

Dit is uitdrukkelijk een tijdelijk bouwhulpmiddel, geen vervanger voor de
echte e-mail+wachtwoord+2FA-inlog uit admin-beheerpagina.md — die blijft
de standaard zodra test-modus uitstaat.

## 2026-09-21 — Rebuild op de aangeleverde `tokens.css`/`components.css`/`admin.css`/`charts.css`

**Aanleiding**: Joost leverde een volledig statisch HTML/CSS/JS-ontwerp
aan (`index.html`, `designer-preview-homepage.html`, `css/`, `js/`,
`assets/`) dat stylesheet.md nu expliciet als de letterlijke, leidende
CSS-bron aanwijst ("Sander neemt deze bestanden letterlijk over, niet
herschrijven"). Tegelijk een grote update van CLAUDE.md,
admin-beheerpagina.md en v1-aanpassingen.md.

**Doorgevoerd**:
- De 5 aangeleverde CSS-bestanden zijn 1-op-1 gekopieerd naar
  `app/styles/` en geïmporteerd in `app/globals.css` (na Tailwind). Alle
  nieuwe/herbouwde UI (nav, footer, sidebar, knoppen, badges, admin-
  schermen, resultatenscherm) gebruikt de letterlijke klassenamen
  daaruit (`.nav`, `.btn-or`, `.admin-table`, `.flow-sidebar`, ...) i.p.v.
  ad-hoc Tailwind-kleurutilities. Enige bewuste afwijking: `.field`/
  `input[type=text]` in components.css dekte geen `email`/`password`/
  `number`-velden — dat selector-bereik is lokaal verbreed (zelfde
  waarden, geen nieuw ontwerp) zodat login-/uitnodigingsformulieren
  bruikbaar blijven.
- Nav/footer/sidebar volledig herbouwd naar de nu vastgelegde specs:
  sticky nav, permanent wit, 3px oranje onderrand, vaste hoogte
  (`--nav-h`), logo 44px, `.nav-right`-patroon (acties → scheidingslijn
  → "← Terug naar site"). Footer zonder logo (nog open designpunt).
  Sidebar sticky met een eigen scrollgebied, geen eigen logo meer.
- Radiobutton-accentkleur volgt nu de categorie (`--accent`) i.p.v. vast
  oranje. Classificatiekleuren (rood/oranje/groen) volgen nu
  `--stat-red`/`--stat-amber`/`--stat-green` uit tokens.css — dit zijn
  ANDERE hex-waarden dan de eerder geïmplementeerde Tailwind
  red-600/orange-500/green-600.
- **Toegangsflow vervangen door de "2a. Tussenoplossing" uit
  v1-aanpassingen.md**: de eerder gebouwde e-mail+verificatiecode-flow
  (`lib/verificatie.ts`, `/uitnodiging/[respondentId]`) en de bijbehorende
  test-modus-schakelaar (`lib/instellingen.ts`) zijn verwijderd. Daarvoor
  in de plaats: een "Publieke link" (`/scan/[respondentId]`, opgebouwd in
  `lib/uitnodiging-link.ts`) die direct doorstuurt naar het scherm dat bij
  de status van de respondent hoort — geen verificatiescherm. De admin
  deelt deze link zelf (kopieerknop op de organisatie-detailpagina en op
  de scandetailpagina), er wordt niets automatisch gemaild. Reden om dit
  nu als DE actieve flow te bouwen i.p.v. ernaast: de aangeleverde
  mockup (`js/screens/admin/adminScanDetail.js`) implementeert uitsluitend
  dit publieke-link-patroon, zonder verificatiescherm. De volledige
  e-mail+code-verificatie (v1-aanpassingen.md punt 2, nog niet afgevinkt)
  is dus niet geschrapt als toekomstig doel, alleen niet meer de actieve
  bouw — bij oppakken: git-historie vóór dit commit (`lib/verificatie.ts`,
  `app/uitnodiging/[respondentId]/`) als startpunt.
- `lib/mailer.ts`/`lib/gmail.ts`/`app/api/mail/route.ts` (Gmail-integratie)
  zijn UIT gebruik gehaald (nieuw uitnodigen toont alleen nog de publieke
  link, mailt niet automatisch — expliciet zo gevraagd in punt 2a) maar
  bewust niet verwijderd: herbruikbaar zodra de volledige verificatieflow
  hierboven weer wordt opgepakt.
- Respondent-datamodel: `naam` is nu `string | null` (leeg tot de intake
  is ingevuld, met e-mailadres als fallback in admin-lijsten — zie
  CLAUDE.md sectie 1). Nieuw veld `uitgenodigdOp` toegevoegd, los van
  `gestartOp` (dat nu `string | null` is en pas gezet wordt zodra de
  respondent scherm 4 indient) — nodig omdat de cascade-regels in
  admin-beheerpagina.md `gestartOp` bij een reset laten wissen terwijl de
  uitnodigingsdatum moet blijven staan, en dat kon niet allebei op
  hetzelfde veld.
- Admin herbouwd naar de 3-schermen-plus-tabel-structuur uit
  admin-beheerpagina.md: `/beheer/organisaties` (lijst, was voorheen
  `/beheer/scans`), `/beheer/organisaties/nieuw`, `/beheer/organisaties/
  [id]` (detail, was voorheen `/beheer/scans/[organisatieId]`), en
  `/beheer/scans` is nu de platte "Ingevulde scans"-tabel over alle
  organisaties heen (Organisatie-kolom, sorteerbare kolommen,
  bulk-selectie/verwijderen, exportknop als stub) met een aparte
  scandetailpagina op `/beheer/scans/[respondentId]`. De admin-navigatie
  is vervangen door de gedeelde publieke nav/footer met "Beheer"-badge en
  admin-links (was een losse linker-sidebar) — zie stylesheet.md/
  admin-beheerpagina.md "Admin hergebruikt de publieke nav/footer".
- Verwijder-cascades geïmplementeerd volgens admin-beheerpagina.md:
  "Ingevulde scans" verwijderen = reset (status → "uitgenodigd", data
  gewist, naam/rol/team/notities blijven staan), "Respondenten"
  verwijderen = harde verwijdering (vanuit Organisatie-detail), Organisatie
  verwijderen cascadeert naar al haar respondenten. Bevestigingsteksten
  letterlijk overgenomen uit de aangeleverde mockup.

## 2026-09-17 — Test-modus: verificatie overslaan, instelbaar in beheer

**Aanleiding**: Sander kreeg "Ongeldige link" bij het openen van een
uitnodigingslink in zijn eigen browser (Chrome/Safari), en wilde een
snelle manier om de vragenlijst te testen zonder steeds de volledige
e-mail+code-verificatie te doorlopen.

**Root cause van de "Ongeldige link"**: er is nog geen gedeelde backend
(zie CLAUDE.md/BACKLOG.md — expliciet toekomstwerk). Organisaties en
respondenten leven alleen in de localStorage van de browser waarin de
scan is aangemaakt (het beheerscherm). Een respondent die de link in een
ANDERE browser opent (bijv. vanuit zijn eigen e-mailclient) heeft daar
geen lokale data, dus "Ongeldige link" is in die zin correct gedrag,
geen bug — maar wel een echt probleem zodra respondenten de link
daadwerkelijk per e-mail ontvangen.

**Doorgevoerd (twee aanvullende oplossingen)**:
1. De uitnodigingslink draagt sindsdien de organisatie- en
   respondentgegevens zelf mee (`lib/uitnodiging-link.ts`,
   `lib/db.ts` → `importRespondent`), zodat elke browser die de link
   opent zichzelf kan "bootstrappen" — ook zonder gedeelde backend werkt
   de link dan in een willekeurige browser.
2. Op expliciet verzoek van Sander: een **test-modus**, instelbaar via
   een schakelaar op het beheer-dashboard (`lib/instellingen.ts`). Staat
   deze aan, dan mogen de intake/doorloop/resultaten-pagina's rechtstreeks
   geopend worden zonder verificatie — bedoeld om snel de vragenlijst te
   kunnen doorlopen tijdens het testen. In de scan-detailpagina
   verschijnt dan per respondent een "Kopieer testlink"-knop naast de
   normale uitnodigingslink. Staat de test-modus uit, dan is dit gedrag
   identiek aan de normale (beveiligde) flow.

Dit is uitdrukkelijk een tijdelijk hulpmiddel voor vandaag, geen vervanger
voor de e-mail+code-verificatie uit v1-aanpassingen.md punt 2 — die blijft
de standaard zodra test-modus uitstaat.

## 2026-09-17 — "Start assessment"-knop op scherm 2 is niet-klikbaar

**Aanleiding**: CLAUDE.md sectie 5 (bijgewerkt) vraagt om een primaire
"Start assessment"-knop op de assessment-landingspagina die rechtstreeks
naar scherm 4 (Respondent-intake) gaat. Dat botst met
v1-aanpassingen.md punt 2: toegang loopt uitsluitend via een
persoonlijke, niet-herleidbare uitnodigingslink per respondent plus
e-mailverificatie — er bestaat geen generieke `/intake`-route zonder
een specifieke `respondentId`. Een knop die daar rechtstreeks naartoe
zou moeten linken, kan dus niet functioneren zonder de toegangsbeveiliging
te omzeilen.

**Besluit (Sander, gekozen optie 2 van 3 voorgelegde opties)**: de
"Start assessment"-knop staat er wél, op dezelfde plek als in de
oorspronkelijke screenshots (direct onder de hero, naast/boven de
aparte "Bekijk wat je krijgt"-knop naar scherm 3), maar is een
niet-klikbare/disabled knop. Een tooltip/title legt uit dat toegang via
een persoonlijke uitnodiging verloopt. Geen echte navigatie naar intake
vanaf dit scherm.

Zie ook: CLAUDE.md sectie 5, v1-aanpassingen.md punt 2 en 7.
