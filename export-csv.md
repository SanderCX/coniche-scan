# Coniche Scan: Export naar CSV

Legt de kolommen van de "Als CSV"-optie in de Exporteren-dropdown
volledig vast (resultatenpagina, één scan, en `beheerpagina.md`
punt 7, Ingevulde scans, één of meerdere scans — zelfde kolomstructuur
in beide gevallen, alleen het aantal rijen verschilt). Vergelijkbaar
van opzet met de CSV die we importeren (`import-scans.md`),
maar dan met onze eigen velden, correct volgens `datamodel.md`, en
vollediger: Waar de import bewust een deel van de oude kolommen
weglaat, geldt die terughoudendheid hier niet — dit is de laatste stap
in de keten (niets leest een CSV-export terug in de app), dus geen
risico op een tweede, afwijkende bron van waarheid.

## Waar dit een plek krijgt

Bestaande "Als CSV"-optie in de Exporteren-dropdown: Resultatenpagina
(één scan) en `beheerpagina.md` punt 7, Ingevulde scans (één of
meerdere geselecteerde scans). Zelfde exportfunctie, zelfde kolommen,
of het nu 1 of N rijen oplevert.

## Grain: één rij per ingevulde scan

Zelfde niveau als de import: Eén `ScanInvulling` is één rij. Geen
aggregatie over meerdere respondenten binnen een `Meting` — de
aggregatieweergave zelf bestaat wel (`beheerpagina.md`,
Organisatie-resultaten), maar een CSV-export daarvan nog niet, net als
bij de PDF- en InDesign-export.

## Bulk-export blijft binnen één organisatie

**Geen bulk-CSV-export over meerdere organisaties heen, in verband met
datavermenging.** Concreet: Bulk-export (meerdere geselecteerde scans
in één CSV) is mogelijk zodra alle geselecteerde scans bij dezelfde
organisatie horen. Dat geldt zowel op de organisatie-gefilterde
"Ingevulde scans"-lijst op de organisatie-detailpagina
(`beheerpagina.md` punt 4) als op het globale overzicht (punt 7),
ook als dat niet is gefilterd. Bevat de selectie scans van meer dan één
organisatie, dan is "Exporteren" uitgeschakeld, met het Info-icoon
`info.bulkExportOrganisatie` ernaast. Een export van één scan
(één rij) kan altijd, ook op het globale overzicht.

## Kolommen

### Basisgegevens

| Kolom | Bron | Toelichting |
|---|---|---|
| `organisatie_naam` | `Organisatie.naam` | |
| `meting_label` | `Meting.label` | bijv. "Nulmeting 2026" |
| `assessment_naam` | `Assessment.naam` | bijv. "Klantcontact Volwassenheid" |
| `respondent_naam` | `Respondent.naam` | leeg zolang de intake niet is gestart |
| `respondent_email` | `Respondent.email` | |
| `respondent_functie` | `Respondent.functie` | |
| `respondent_team` | `Respondent.team` | |
| `status` | `ScanInvulling.status` | `"uitgenodigd"` / `"bezig"` / `"afgerond"` |
| `uitgenodigd_op` | `ScanInvulling.uitgenodigdOp` | |
| `gestart_op` | `ScanInvulling.gestartOp` | leeg zolang niet gestart |
| `afgerond_op` | `ScanInvulling.afgerondOp` | leeg zolang niet afgerond |
| `aantal_beantwoord` | afgeleid van `antwoorden` | bijv. `42` |
| `aantal_vragen_totaal` | afgeleid van `Assessment` | bijv. `60`; samen met vorige kolom dezelfde voortgang als op de resultatenpagina |

### Berekende score-samenvatting

Alleen gevuld bij `status = "afgerond"`; bij `"uitgenodigd"`/`"bezig"`
blijven deze kolommen leeg (geen score op een onvolledige invulling).

| Kolom | Toelichting |
|---|---|
| `overall_score` | Gewogen gemiddelde van alle antwoorden, van 5, uit de gedeelde scoreberekening (`datamodel.md`, Scoreberekening, inclusief `Bouwblok.gewicht`); zelfde functie als resultatenpagina, PDF- en InDesign-export |
| `groepsScores` | JSON-kolom, zelfde vorm als `export-indesign.md`, `<groepsScores>`: `{"type": "categorie" of "bouwblok", "groepen": [{"naam": ..., "score": ..., "bouwblokken": [{"nummer": ..., "naam": ..., "score": ..., "gewicht": ...}, ...]}, ...]}`. Zelfde regel: `type="categorie"` bij een scan mét categorielaag (Klantcontact Volwassenheid), `type="bouwblok"` zonder (AI-volwassenheid). Bij `type="categorie"` heeft elke groep een lijst `bouwblokken` met het gewicht per bouwblok; bij `type="bouwblok"` is de groep zelf een bouwblok en heeft hij direct `nummer` en `gewicht` (geen `bouwblokken`-lijst). Het gewicht staat er altijd, ook bij 1: Dit is machinedata, geen weergave |

**Geen aparte top-3-kolommen.** Sterktes en verbeterkansen zijn triviaal
af te leiden door `groepsScores` te sorteren; een aparte, dubbele
representatie voegt niets toe en kan uit de pas gaan lopen met de
brondata.

**Geen aparte `gewicht`-kolom.** `Bouwblok.gewicht` (`datamodel.md`) is
een content-eigenschap van het Assessment, geen gegeven van déze ene
scan, en voor elke rij met hetzelfde Assessment identiek. Het gewicht
staat daarom per bouwblok in `groepsScores`. Daarmee is `overall_score`
na te rekenen uit alleen de export: `Σ(gewicht × score van het
bouwblok) / Σ gewicht` geeft de overall zolang alle bouwblokken evenveel
vragen hebben (nu altijd 4 bij Klantcontact, 5 bij AI), met als
afwijking de afronding van de bouwblokscores. Een eventueel gewicht
wordt na een wijziging in één keer doorgerekend (`datamodel.md`), dus
een oudere CSV-export kan afwijken van de actuele score.

### Organisatiekenmerken

| Kolom | Toelichting |
|---|---|
| `organisatie_kenmerken` | JSON-kolom, letterlijk `Organisatie.kenmerken` (`{ [veldId]: waarde }`, `datamodel.md`) |

**Bewust één JSON-kolom, geen kolom per veld** (dus geen aparte
`sector`, `subsector`, `nps`, etc.). Organisatievelden zijn nu vaste
data, maar staan in `beheerpagina.md` onder "Nog te bouwen": Zodra
die zelf beheerbaar worden, kan de set velden wijzigen zonder dat de
app opnieuw gebouwd hoeft te worden. Een vaste kolom per huidig veld
zou deze spec (en elke CSV die er al van bestaat) bij zo'n wijziging
laten verouderen; de JSON-vorm volgt automatisch mee, ongeacht welke
velden er op dat moment bestaan.

### Antwoorden

| Kolom | Toelichting |
|---|---|
| `antwoorden` | JSON-kolom, array van antwoord-items, zie hieronder |
| `opmerkingen_per_bouwblok` | JSON-kolom, `{ [bouwblokId]: tekst }`, alleen bouwblokken met een ingevulde opmerking |

Elk item in `antwoorden`:

```json
{
  "bouwblokId": "organisatiestrategie",
  "bouwblokNaam": "Organisatiestrategie",
  "vraagId": "...",
  "vraagTekst": "Is er een actueel strategiedocument (max. 2 jaar oud) waarin missie/visie/kernwaarden én 3–7 strategische doelen staan?",
  "score": 5,
  "schaalLabel": "Geoptimaliseerd en continu verbeterd"
}
```

Zelfde soort vorm als de kolom die we importeren
(`import-scans.md`, `answers`), met dezelfde reden: `vraagTekst`
en `schaalLabel` erbij, niet alleen `vraagId` en `score`, zodat de CSV
ook leesbaar is voor wie het datamodel niet kent — een consultant die
'm in Excel opent, niet alleen Sander of de import-tool later.

## Inzage (AVG)

De actie "AVG-inzage" in het Respondent-overzicht (`beheerpagina.md`,
punt 6b) levert een CSV op met alle gegevens van één Respondent. Het is
dezelfde exportfunctie en dezelfde kolomstructuur als hierboven, met
deze afwijkingen:

- **Selectie**: Alle `ScanInvulling`en van deze Respondent, ook die met
  status `"uitgenodigd"` of `"bezig"`. Eén rij per scan. Een Respondent
  zonder scans levert één rij op met alleen de persoonsgegevens, met de
  scankolommen leeg, zodat de persoonsgegevens altijd in het bestand
  staan. Een Respondent hoort bij één Organisatie, dus de regel "Bulk-
  export blijft binnen één organisatie" geldt hier vanzelf.
- **Extra kolommen** (Basisgegevens): `respondent_notities`
  (`Respondent.notities`) en `respondent_aangemaakt_op`
  (`Respondent.aangemaaktOp`).
- **Weggelaten**: `organisatie_kenmerken`, want dat zijn gegevens van de
  Organisatie en niet van de Respondent. De persoonlijke link en
  toegangscode staan er ook niet in, want dat is een toegangsmiddel en
  geen gegeven over de persoon.
- **Rechten**: Admin voor alle Organisaties, Consultant voor zijn eigen
  (`beheerpagina.md`, punt 6b).
- **Bestandsnaam**: `Inzage <Organisatie> - <Respondent> - <datum>.csv`.
  Is de naam van de Respondent leeg, dan staat het e-mailadres op die
  plek, zoals in de beheeroverzichten.
- **Logging**: Elke inzage wordt gelogd als `respondent.inzage`
  (`datamodel.md`, Audit), met het aantal scans en de naam van de Organisatie in
  `details`, en geen persoonsgegevens van de Respondent. Dat is het bewijs dat het verzoek is afgehandeld.

## Bestandsnaam

- **Eén scan** (resultatenpagina): `<Organisatie> - <Respondent> -
  <Meting>.csv`.
- **Meerdere scans** (Ingevulde scans, bulk): `Ingevulde scans export
  <datum>.csv`.

## CSV-formaat

- **Scheidingsteken: puntkomma, niet komma.** Excel-NL (het gangbare
  gebruik hier) gebruikt de komma als decimaalteken en verwacht
  standaard een puntkomma-gescheiden CSV; met een komma-CSV opent
  Excel-NL alles in één kolom. Decimalen in `overall_score` en de
  scores binnen `groepsScores` dus met een komma (`3,8`), niet een punt.
  Dit geldt ook voor `gewicht` bij een decimaal gewicht (`1,5`).
- **UTF-8 met BOM**, zodat Excel-NL diakrieten (é, ü) en het
  euroteken correct toont zonder handmatige encoding-keuze bij het
  openen.
- **JSON-kolommen als string**, met de JSON zelf dubbel aangehaald en
  interne aanhalingstekens verdubbeld (standaard CSV-escaping), niet
  als los, ongeëscaped blok tekst.

## Beslist

- **Score-berekening**: Eén gedeelde functie, zie `datamodel.md`,
  Scoreberekening. Deze export implementeert `overall_score`/
  `groepsScores` niet apart.
- **Bulk-export alleen binnen één organisatie**, in verband met
  datavermenging. Op het globale overzicht werkt dat ook zonder filter,
  zolang de selectie bij één organisatie hoort. Zie hierboven.
