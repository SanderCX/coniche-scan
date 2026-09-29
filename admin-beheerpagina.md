# Coniche Scan: Beheeromgeving

De omgeving waarin Coniche scans, content en organisaties beheert.

## Toegang

Beheer is alleen toegankelijk met een account. Nu met e-mail en
wachtwoord; 2FA volgt zodra er een backend is. Rollen binnen beheer
(Admin, Consultant) staan in `datamodel.md` deel 2 en worden met
de backend gebouwd. Tot die tijd hebben alle beheeraccounts dezelfde
rechten.

Respondenten loggen niet in. Zij krijgen een persoonlijke link, zie
`datamodel.md`, Toegangscode.

## Vormgeving

Dezelfde nav en footer als de rest van de app, met een badge "Beheer" en
de beheerlinks in `.nav-right`. Componenten staan in `stylesheet.md`.

In de interface: "Respondenten" (niet "leden"), "Meting" en "Ingevulde
scans". Zie CLAUDE.md, Terminologie.

### Accountmenu

Niet te verwarren met beheeronderdeel 9, "Gebruikers" (de link naar het
beheerscherm voor Admin/Consultant-accounts): Dit is de weergave van de
ingelogde gebruiker zelf, in `.nav-right`.

Helemaal uiterst rechts, ná "← Terug naar site" (de exit-actie), niet
ervoor: Punt 7 van de nav-volgorderegel in CLAUDE.md, Globale layout.
Conventie: Een account-/profielmenu staat vrijwel altijd als
allerlaatste element in een nav, voorbij terug-links. Volgorde in
`.nav-right`, van links naar rechts: Scherm-specifieke acties
(Overzicht/Organisaties/Gebruikers/Ingevulde scans) → scheidingslijn →
"← Terug naar site" → scheidingslijn → Accountmenu.

Eén dropdown-knop, zelfde patroon als de Dropdown-knop uit
`stylesheet.md` (zoals "Exporteren" op de resultatenpagina), niet twee
losse elementen naast elkaar.

- **Knop**: Toont het e-mailadres van de ingelogde gebruiker (bijv.
  "admin@coniche.nl"), met het pijltje van de dropdown-knop.
- **Dropdown-inhoud**: Eerste rij, niet-klikbaar: E-mailadres + rol
  tussen haakjes (bijv. "admin@coniche.nl (Consultant)"). Tweede rij,
  klikbaar: "Uitloggen". Functionaliteit van uitloggen blijft ongewijzigd
  ten opzichte van nu, alleen de plek en vormgeving veranderen.
- **Stand van zaken**: De dropdown-knop zelf staat er al (één knop,
  "admin@coniche.nl" met pijltje). Wat nog niet klopt: Hij staat rechts
  van "← Terug naar site" in plaats van links ervan, zie de volgorde
  hierboven. Eerdere, inmiddels vervallen situatie (los e-mailadres,
  rol en "Uitloggen" naast elkaar, met een scheidingslijn ná "Uitloggen"
  die nergens naar scheidde) is al opgelost door de dropdown-knop zelf.

## Status

- **Gebouwd**: Organisaties (lijst, aanmaken, detail), metingen per
  organisatie, respondenten uitnodigen, Ingevulde scans met filters.
- **Nog te bouwen**: Beheer van assessment-types, content en
  organisatievelden. Gebruikersbeheer (Admin/Consultant), zie punt 9.

---

## Wat beheerbaar is

### 1. Assessment-types

Aanmaken en bewerken van een `Assessment` (`datamodel.md`): Naam, kort
label (voor de PDF-footer, bijv. "Volwassenheidsscan"), subtitel,
beschrijving, doelgroep, geschatte duur, de vijf schaallabels, en de
slotsectie voor de PDF-export (`pdfContentSecties`, zie
  `export-pdf-visual-volwassenheidsscan.md`, Slotsectie per scan-type):
Een titel en een bron, gekozen uit een vaste lijst, geen vrij
tekstveld.

**Sector-variant aanmaken vanuit een template** (`datamodel.md`,
Sector-varianten): Naast "Nieuw Assessment aanmaken" (leeg) een tweede
actie, "Aanmaken vanuit bestaand Assessment". Kies een bestaand
Assessment als template; de actie kopieert al zijn Categorieën,
Bouwblokken en Vragen naar nieuwe content-records onder het nieuwe
Assessment (`afgeleidVanAssessmentId` wijst terug naar het template,
puur ter herkomst). Daarna bewerk je de kopie als een gewoon
Assessment: Naam/kortLabel aanpassen (bijv. "Zorgscan"), en per
Bouwblok/Vraag de tekst, en per Categorie/Bouwblok het gewicht. Geen
lopende koppeling met het template: Een latere wijziging daarop werkt
niet door in de sector-variant.

In de Assessment-lijst in beheer: Bij een afgeleid Assessment een
regel "Afgeleid van: <naam template>", puur informatief.

### 2. Content

Per Assessment: Categorieën met kleur en volgorde, bouwblokken (naam,
omschrijving, toelichting, tags) en de vragen per bouwblok. Content waar
al antwoorden aan hangen wordt gearchiveerd, niet verwijderd
(`datamodel.md`, Content bewerken).

### 3. Organisatievelden

De organisatievelden uit `datamodel.md` (volume en klantbasis,
digitalisering, techstack, FTE, KPI's) wordt zelf ook beheerbaar: Label,
type en vaste antwoordcategorieën.

### 4. Organisaties

- **Lijst**: Alle organisaties, met per rij de naam, het aantal
  respondenten en het aantal afgeronde scans.
- **Aanmaken**: Naam en kenmerken invullen.
- **Detail**: Kenmerken (altijd bewerkbaar), de metingen van deze
  organisatie, en de respondenten met hun status.
- **Respondent of losse respons naar een andere organisatie
  verplaatsen**: Bedoeld om een verkeerde organisatiekoppeling recht te
  zetten, bijvoorbeeld na een import (`import-legacy-scans.md`) waarbij
  per ongeluk een tweede organisatie is aangemaakt voor een klant die al
  bestond onder een net iets andere naam. Twee aparte acties vanaf de
  respondentenlijst in het organisatie-detail, elk met een ander effect:

  1. **Hele respondent verplaatsen** (actie per respondent): Zet
     `Respondent.organisatieId` om naar een andere, bestaande
     organisatie. Alle ScanInvullingen van deze respondent gaan mee.
  2. **Eén losse respons verplaatsen** (actie per ingevulde scan in de
     scanlijst van een respondent): De respondent zelf blijft in zijn
     huidige organisatie, alleen deze ene ScanInvulling gaat naar een
     andere organisatie.

  **Doelorganisatie**: Zoeken en kiezen uit bestaande organisaties.
  Geen nieuwe organisatie aanmaken vanuit deze actie, dat gebeurt bij
  Aanmaken hierboven.

  **E-mailconflict in de doelorganisatie**: Bestaat daar al een
  Respondent met hetzelfde e-mailadres, dan geldt de bestaande regel uit
  `datamodel.md` (Respondent): Hergebruiken in plaats van dupliceren.
  Bij "hele respondent verplaatsen" gaan alle ScanInvullingen dan naar
  die bestaande Respondent, en wordt de verplaatste Respondent zelf (met
  zijn Toegangscode) verwijderd: Zijn persoonlijke link werkt daarna
  niet meer, de link van de bestaande respondent in de doelorganisatie
  blijft gelden. De beheerder bevestigt dit expliciet voordat het
  gebeurt, geen automatische stille samenvoeging. Bij "losse respons
  verplaatsen" gaat alleen die ene respons naar de bestaande (of een
  nieuw aangemaakte) Respondent in de doelorganisatie; de oorspronkelijke
  Respondent blijft gewoon bestaan met zijn overige responsen.

  **Meting in de doelorganisatie**: Een ScanInvulling hangt aan een
  Meting, en een Meting hoort bij precies één organisatie
  (`datamodel.md`). Verplaatsen van een respons vraagt dus ook een
  Meting in de doelorganisatie, van hetzelfde Assessment-type. Bestaat
  die al, dan kiest de beheerder welke. Bestaat die nog niet, dan maakt
  de actie er automatisch één aan, met hetzelfde label als de
  oorspronkelijke.

  **Leeggeraakte respondent**: Verplaatst een losse respons de laatste
  ScanInvulling van een respondent weg, dan blijft die respondent zonder
  scans, maar mét zijn toegangscode, gewoon staan in de oorspronkelijke
  organisatie. Geen automatische opruiming: Er kan bewust reden zijn om
  deze respondent daar te laten staan, bijvoorbeeld om later opnieuw uit
  te nodigen voor een nieuwe meting. Opruimen blijft een aparte, bewuste
  actie (bestaande verwijderfunctie op de respondent).

  **Resultaat**: Een organisatie waar na het verplaatsen niets meer
  onder hangt, is te verwijderen via de bestaande verwijderfunctie
  hieronder (Verwijderen). Die cascade is dan leeg, geen nieuwe logica
  nodig.

### 5. Metingen

Vanuit de organisatie: Een meting aanmaken met een assessment-type en
een label (bijv. "Nulmeting 2026"). Een organisatie kan meerdere metingen
hebben, ook van verschillende scan-types.

### 6. Respondenten uitnodigen

Binnen een meting: E-mailadres invoeren. Bestaat dat adres al binnen de
organisatie, dan wordt dezelfde respondent hergebruikt. Er ontstaat een
ingevulde scan met status `"uitgenodigd"`. Zolang er geen mailserver is,
kopieert de beheerder de persoonlijke link van de respondent (knop
"Kopieer link") en deelt die zelf.

### 7. Ingevulde scans

Overzicht van alle ingevulde scans over alle organisaties heen, met
daarnaast een gefilterde versie op de detailpagina van elke organisatie.
Er is altijd een pad van organisatie via meting en respondent naar de
scan.

- **Kolommen**: Naam, Organisatie, Meting, Assessment, Rol/Team, Status,
  Voortgang, Gestart, en een link "bekijk". Alle kolommen sorteerbaar.
- **Filters**: Aanwezig, zoals gebouwd.
- **Selectie**: Selectievakje per rij en "alles selecteren" in de koprij.
- **Acties op de selectie**: Exporteren en Verwijderen (compacte knoppen,
  gelijke breedte).
- **Export**: Eén gedeelde exportfunctie voor dit overzicht (meerdere
  scans) en de resultatenpagina (één scan), zie `export-csv.md` voor de
  exacte kolommen. **Bulk-CSV (meerdere scans in één export) alleen
  vanaf de organisatie-gefilterde versie van dit overzicht (punt 4,
  organisatie-detailpagina), niet hier op het globale overzicht over
  alle organisaties heen** — in verband met datavermenging, zie
  `export-csv.md`. Hier op het globale overzicht blijft dus alleen
  losse export per scan mogelijk. PDF en de InDesign-export (XML) zijn
  sowieso alleen beschikbaar bij precies één scan (hier, org-gefilterd,
  of op de resultatenpagina), zie
  `export-pdf-visual-volwassenheidsscan.md`, Export van één scan, geen
  aggregatie, en `export-indesign.md`.

Selecteren en verwijderen is een terugkerend patroon: Dezelfde component
komt ook op de lijst van organisaties, de metingen en de respondenten.

### 8. Import van scans (CSV)

Twee bronformaten, met een keuze vooraf: De oude, stopgezette tool
(eenmalige/periodieke historische migratie) en onze eigen "Als
CSV"-export (`export-csv.md` teruglezen, o.a. om data tussen browsers te
verplaatsen zolang de opslag nog localStorage is). Volledige spec,
inclusief veldmapping en matchingregels per formaat:
`import-legacy-scans.md`.

### 9. Gebruikers (Admin en Consultant)

Los beheeronderdeel, uitsluitend voor Admin- en Consultant-accounts
(`datamodel.md` deel 2, `Gebruiker`). Respondenten en Leads blijven
bereikbaar via de organisatie (punt 4), niet hier.

- **Lijst**: Naam, e-mail, rol, status (actief/gedeactiveerd), laatst
  ingelogd.
- **Aanmaken**: Naam, e-mail, rol. Wachtwoord stelt de gebruiker zelf in
  via een link (verificatiepad volgt met de mailserver, `backlog.md`).
- **Wijzigen**: Naam, e-mail, rol.
- **Deactiveren, niet verwijderen**: Nooit hard verwijderd
  (`datamodel.md` deel 2). Actie heet "Deactiveren", `.btn-danger` met
  bevestiging.
- **Eigenaarschap bij deactiveren van een Consultant**: Verplicht
  overzetten van diens organisaties naar een andere Consultant of Admin
  vóórdat deactiveren definitief is (per organisatie of in bulk).
- **Minimaal 1 actieve Admin verplicht**: Deactiveren van een Admin is
  geblokkeerd zolang hij de laatste actieve Admin is, met een duidelijke
  melding waarom. Geldt ook bij zelf-deactivering: Geen aparte regel
  nodig, dezelfde check geldt altijd.
- **2FA**: `tfaActief` verplicht voordat beheer toegankelijk is
  (`datamodel.md` deel 2). Komt met de backend, niet in dit punt. Al
  genoteerd in `backlog.md` onder rollen/rechten/inlog.

**`.nav-right`**: Nieuwe link "Gebruikers", tussen "Organisaties" en
"Ingevulde scans".

**Toegang tot dit scherm**: Alleen Admin (`gebruikers.beheren`, bereik
`alle`, Rechtenmatrix). Een Consultant ziet deze link niet.

---

## Verwijderen

Wat er precies wordt verwijderd, staat in `datamodel.md` onder
"Verwijderen en datakoppelingen". Kort:

- **Ingevulde scan**: Alleen die invulling. De respondent en zijn link
  blijven bestaan.
- **Respondent**: De persoon met al zijn ingevulde scans.
- **Meting**: De meting met alle ingevulde scans daarin.
- **Organisatie**: Alles wat eronder hangt.

Elke verwijderactie vraagt een bevestiging die noemt wat er mee
verdwijnt, bij een organisatie met aantallen. Na verwijderen blijft er
geen losse data achter.

Opnieuw invullen is iets wat de respondent later zelf vanuit de scan
doet, niet een beheeractie (`backlog.md`).

---

## Ter overweging, nog niet besloten

- Een respondent opnieuw uitnodigen zonder een nieuwe aan te maken
- Toegang van een respondent intrekken (nieuwe code, oude link werkt dan
  niet meer)
- Meerdere e-mailadressen tegelijk uitnodigen
- Herinneringsmail bij respondenten die lang op "uitgenodigd" of "bezig"
  staan
- Een organisatie dupliceren als sjabloon

## Open punten

- Of bouwblokken en vragen herbruikbaar moeten zijn tussen
  assessment-types.
- Organisatiekenmerken worden in de praktijk soms samen met medewerkers
  van de klant ingevuld. Het huidige model kent die toegang niet
  (`backlog.md`).
- Geen eigen schermflow-beschrijving voor de beheerkant (Overzicht,
  Organisaties, Ingevulde scans als schermen), zoals CLAUDE.md die wel
  heeft voor de respondentkant. De navigatie-items worden in CLAUDE.md
  sectie 3 als voorbeeld genoemd, maar de schermen zelf staan alleen
  hier, per onderdeel, niet als doorlopende flow.
