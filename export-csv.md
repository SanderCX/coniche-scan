# Coniche Scan: Export naar CSV

**Status: Specificatie, klaar om te (her)bouwen.** Legt de kolommen van
de bestaande "Als CSV"-optie in de Exporteren-dropdown voor het eerst
volledig vast (resultatenpagina, één scan, en `admin-beheerpagina.md`
punt 7, Ingevulde scans, één of meerdere scans — zelfde kolomstructuur
in beide gevallen, alleen het aantal rijen verschilt). Vergelijkbaar
van opzet met de CSV die we importeren (`import-legacy-scans.md`),
maar dan met onze eigen velden, correct volgens `datamodel.md`, en
vollediger: Waar de import bewust een deel van de oude kolommen
weglaat, geldt die terughoudendheid hier niet — dit is de laatste stap
in de keten (niets leest een CSV-export terug in de app), dus geen
risico op een tweede, afwijkende bron van waarheid.

## Waar dit een plek krijgt

Bestaande "Als CSV"-optie in de Exporteren-dropdown: Resultatenpagina
(één scan) en `admin-beheerpagina.md` punt 7, Ingevulde scans (één of
meerdere geselecteerde scans). Zelfde exportfunctie, zelfde kolommen,
of het nu 1 of N rijen oplevert.

## Grain: één rij per ingevulde scan

Zelfde niveau als de import: Eén `ScanInvulling` is één rij. Geen
aggregatie over meerdere respondenten binnen een `Meting` — dat blijft
een apart vraagstuk (`backlog.md`, Aggregatie), net als bij de PDF- en
InDesign-export.

## Bulk-export blijft binnen één organisatie

**Geen bulk-CSV-export over meerdere organisaties heen, in verband met
datavermenging.** Concreet: Bulk-export (meerdere geselecteerde scans
in één CSV) is alleen mogelijk vanaf de organisatie-gefilterde
"Ingevulde scans"-lijst op de organisatie-detailpagina
(`admin-beheerpagina.md` punt 4), niet vanaf het globale overzicht
over alle organisaties heen (punt 7). Op dat globale overzicht blijft
alleen losse export per scan mogelijk (één rij tegelijk, dezelfde
grain als PDF/InDesign), geen selectie/bulk-actie voor Exporteren.

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
| `overall_score` | Gemiddelde van alle antwoorden, van 5, uit de gedeelde scoreberekening (`datamodel.md`, Scoreberekening) — zelfde functie als resultatenpagina, PDF- en InDesign-export |
| `groepsScores` | JSON-kolom, zelfde vorm als `export-indesign.md`, `<groepsScores>`: `{"type": "categorie" of "bouwblok", "groepen": [{"naam": ..., "score": ...}, ...]}`. Zelfde regel: `type="categorie"` bij een scan mét categorielaag (Klantcontact Volwassenheid), `type="bouwblok"` zonder (AI-volwassenheid) |

**Geen aparte top-3-kolommen.** Sterktes en verbeterkansen zijn triviaal
af te leiden door `groepsScores` te sorteren; een aparte, dubbele
representatie voegt niets toe en kan uit de pas gaan lopen met de
brondata.

**Geen `gewicht`-kolom.** `Categorie.gewicht`/`Bouwblok.gewicht`
(`datamodel.md`) zijn content-eigenschappen van het Assessment, geen
gegeven van déze ene scan — voor elke rij met hetzelfde Assessment
identiek, dus geen zinvolle kolom op scanniveau.

### Organisatiekenmerken

| Kolom | Toelichting |
|---|---|
| `organisatie_kenmerken` | JSON-kolom, letterlijk `Organisatie.kenmerken` (`{ [veldId]: waarde }`, `datamodel.md`) |

**Bewust één JSON-kolom, geen kolom per veld** (dus geen aparte
`sector`, `subsector`, `nps`, etc.). Organisatievelden zijn nu vaste
data, maar staan in `admin-beheerpagina.md` onder "Nog te bouwen": Zodra
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
(`import-legacy-scans.md`, `answers`), met dezelfde reden: `vraagTekst`
en `schaalLabel` erbij, niet alleen `vraagId` en `score`, zodat de CSV
ook leesbaar is voor wie het datamodel niet kent — een consultant die
'm in Excel opent, niet alleen Sander of de import-tool later.

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
  datavermenging. Zie hierboven.
