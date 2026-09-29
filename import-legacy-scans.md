# Coniche Scan: Import van scans (CSV)

**Status: Gebouwd, twee bronformaten.** Beheerfunctie om ingevulde
scans uit een CSV-bestand in het huidige datamodel te zetten. Twee
bronformaten, met een keuze vooraf in beheer (zie "Werkwijze in
beheer"):

- **"Oude tool"**: Export uit de oude (vibe-gecodeerde, stopgezette)
  tool, zodat historische klantdata niet verloren gaat. Gebaseerd op
  twee daadwerkelijke exports: één Klantcontact Volwassenheidsscan
  (Univé Zuid-Nederland) en één AI-volwassenheidsscan (Unive), beide
  met exact dezelfde bouwblokken/domeinen en vraagteksten als de
  huidige content. **Tijdelijk**: Verdwijnt zodra de historische
  migratie voltooid is, zie `backlog.md`.
- **"Coniche Scan (eigen export)"**: Onze eigen "Als CSV"-export
  (`export-csv.md`) teruglezen. Vooral bedoeld als tijdelijke manier om
  data tussen browsers te verplaatsen zolang de opslag nog localStorage
  is (CLAUDE.md, Status): Exporteer op de ene browser, importeer op de
  andere. **Blijft bestaan** ook na de historische migratie.

De rest van dit document beschrijft eerst het "oude" formaat in detail
(kolommen, matching, edge cases), en sluit af met wat voor het "nieuwe"
formaat anders is.

## Waar dit component een plek krijgt

Nieuw punt in `admin-beheerpagina.md`, als losse actie (niet gekoppeld
aan één specifieke organisatie vooraf: De organisatie wordt per rij in
de CSV bepaald, zie hieronder). Alleen voor Admin en Consultant
(zelfde toegang als de rest van beheer).

## Bronformaat "oude tool"

Eén CSV-bestand per export uit de oude tool, één rij per ingevulde scan
(`assessment_id`). Een bestand kan meerdere rijen bevatten. De
bestandsnaam (bijv. `assessment-Unive-2026-01-14.csv`) is informatief,
niet leidend: De tool leest organisatie- en datumgegevens uit de
kolommen, niet uit de bestandsnaam.

Kolommen, gegroepeerd naar wat ermee gebeurt:

### Geïmporteerd

| Kolom | Doel |
|---|---|
| `organization_name` | `Organisatie.naam` (matching, zie hieronder) |
| `sector_name`, `subsector_name` | `Organisatie.kenmerken` (nieuwe velden, zie `datamodel.md`, Organisatievelden) |
| `assessor_name`, `respondent_email`, `respondent_role` | `Respondent.naam`/`email`/`functie` |
| `team_name` | `Respondent.team` |
| `start_comment` | `Respondent.notities`, met een vaste prefix (zie hieronder) |
| `created_at` | `ScanInvulling.gestartOp` |
| `completed_at` | `ScanInvulling.afgerondOp` |
| `status` | `ScanInvulling.status`: Altijd `"completed"` → `"afgerond"`. De export uit de oude tool is handmatig en gebeurt alleen voor scans die Coniche wil behouden, dus altijd afgerond; de tool importeert geen andere statuswaarde en meldt het als er onverwacht een andere waarde in een rij staat |
| `answers` (JSON) | `ScanInvulling.antwoorden`, per vraag (mapping hieronder) |
| `answers[].blockComment` | `ScanInvulling.opmerkingenPerBouwblok`, één per bouwblok (dedupliceren, zie hieronder) |

`answers` is een platte lijst van 60 (Klantcontact) of 40 (AI-scan)
losse vraag-items, geen geneste structuur per bouwblok. Velden per
item, uit de daadwerkelijke CSV's:

```json
{
  "buildingBlockId": "organisatiestrategie",
  "buildingBlockName": "Organisatiestrategie",
  "buildingBlockCategory": "Overkoepelend",
  "questionId": "orgstrategie_v3_q1",
  "questionText": "Is er een actueel strategiedocument (max. 2 jaar oud) waarin missie/visie/kernwaarden én 3–7 strategische doelen staan?",
  "answerScore": 5,
  "answerLabel": "Geoptimaliseerd en continu verbeterd",
  "weight": 1,
  "blockComment": null
}
```

- **Groeperen vóór matchen**: De tool groepeert deze platte lijst eerst
  op `buildingBlockId` (volgorde van eerste voorkomen), vóórdat de
  matchingregels hieronder worden toegepast. Dat geeft de blokken
  waarop "Assessment- en bouwblok-matching" verderop matcht; de
  blok-telling (punt 1 daar) controleert tegen het **aantal groepen**,
  niet tegen `answers.length`.
- **Scoreveld is `answerScore`**, niet `score`. `answerLabel` bevat
  hetzelfde als tekst (het bijbehorende `SchaalLabel`), wordt niet
  apart geïmporteerd: `ScanInvulling.antwoorden` slaat alleen het
  cijfer op, de labeltekst volgt al uit `datamodel.md` (SchaalLabel).
- **`weight`**: Niet per antwoord geïmporteerd. Dit hoort inhoudelijk
  bij de categorie-/bouwblok-definitie (`Categorie.gewicht` resp.
  `Bouwblok.gewicht`, zie `datamodel.md`), niet bij de losse
  invulling — en al helemaal niet bij de losse vraag, ook al staat
  het in de CSV op elk vraag-item: Gecontroleerd over beide bestanden
  is deze waarde overal `1`, ook binnen elk blok, dus niets wijst
  erop dat er ooit per vraag gevarieerd werd. Bij beide huidige CSV's
  staat dit overal op `1`, gelijk aan de standaardwaarde, dus geen
  actie nodig. Wijkt dit in een toekomstige import af van het huidige
  `Categorie.gewicht`/`Bouwblok.gewicht` (bijv. bij een sector-variant
  met eigen gewichten), dan is dat een contentvraagstuk voor dat
  moment, geen uitbreiding van deze import.

### Bewust niet geïmporteerd

- **Alle afgeleide scores**: `overall_score`, `overall_label`,
  `scores_by_building_block`, `scores_by_category`, `radar_chart_data`,
  `strengths`, `weaknesses`. De app berekent dit altijd live uit
  `antwoorden` (CLAUDE.md sectie 1); apart importeren zou een tweede,
  potentieel afwijkende bron van waarheid opleveren.
- **De AI-samenvatting**: `ai_summary_generated`, `ai_summary_overall`,
  `ai_summary_per_block`, `ai_summary_next_steps`, `ai_summary_cta`,
  `ai_summary_disclaimer`, `ai_summary_generated_at`,
  `ai_summary_model`. Gegenereerd door een ouder model op een oudere
  contentversie; de nieuwe AI-managementsamenvatting (`backlog.md`)
  start straks vers, geen import van oude AI-tekst.
- **Consent**: `consent_given`, `consent_timestamp`. De huidige intake
  slaat bewust geen serverside toestemmingsstatus op (CLAUDE.md
  sectie 3, scherm 4); historische toestemmingsdata importeren zou dat
  weer via een achterdeur doen.
- `export_timestamp`: Moment van de CSV-export uit de oude tool, geen
  betekenis in het nieuwe model.
- `respondent_phone`: `Respondent` heeft geen telefoonveld en krijgt er
  voor deze import ook geen.

## Wie de Respondent wordt

**De Coniche-medewerker die de scan invulde** (`assessor_name`,
`respondent_email`, `respondent_phone`, `respondent_role`) wordt de
`Respondent`, niet de klantcontactpersoon uit `start_comment`. Dit is
functioneel correct: Deze scans zijn destijds bewust namens de
organisatie ingevuld, samen met een contactpersoon, niet zelfstandig
door de klant. `start_comment` bevat die contactpersoon als vrije tekst
(bijv. "Samen ingevuld met Kim Phan") en wordt overgenomen in
`Respondent.notities`, met een vaste prefix zodat duidelijk blijft dat
dit een geïmporteerde, geen zelf ingevoerde notitie is: **"Legacy-import
uit de oude tool. Oorspronkelijke notitie: '{start_comment}'."**

Bestaat er al een `Respondent` met dit e-mailadres binnen deze
organisatie (bijv. Sander vulde al eerder een scan in voor dezelfde
klant), dan wordt die hergebruikt — de bestaande regel uit
`datamodel.md` (Respondent) geldt hier ongewijzigd, geen nieuwe logica.

## Organisatie-matching

Op `organization_name`, exact op tekst. Bij geen exacte match toont de
tool de bestaande organisaties zodat de beheerder zelf kiest: Koppelen
aan een bestaande organisatie (bijv. "Univé Zuid-Nederland" en "Unive"
zijn mogelijk dezelfde klant, anders gespeld) of een nieuwe aanmaken.
**Geen automatische fuzzy-match**: Dat risico (twee losse klanten samen
laten vallen) is groter dan het gemak.

Gaat dit een keer toch mis, bijvoorbeeld "Univé Zuid-Nederland" en
"Unive" blijken achteraf dezelfde klant en zijn als twee losse
organisaties het systeem ingekomen, dan is dat achteraf te herstellen:
`admin-beheerpagina.md`, punt 4, "Respondent of losse respons naar een
andere organisatie verplaatsen".

## Assessment- en bouwblok-matching

**Het Assessment-type wordt per rij automatisch bepaald**, niet vooraf
door de beheerder gekozen. Aanvankelijk koos de beheerder dit expliciet,
juist om te voorkomen dat een fout bestand stilzwijgend op het
verkeerde scan-type werd geplakt. Bij nader inzien voegt die stap geen
veiligheid toe die de matching hieronder niet al biedt: Een
gedetecteerd type dat toch niet klopt, geeft vanzelf een rij met een
duidelijk matchingprobleem (blok- of vraagaantal komt niet overeen),
nooit een stilzwijgend foute import. De handmatige keuze kostte dus een
stap zonder een risico weg te nemen.

De tool bepaalt het type in twee stappen. **Eerste stap**: de
(gegroepeerde, zie hieronder) bloknamen uit de CSV vergelijken met de
bouwblokken/domeinen van elk Assessment-type. Is er precies één type
waarvan zowel het aantal als alle namen exact overeenkomen, dan is dat
het gedetecteerde type.

**Tweede stap, nodig sinds sector-varianten bestaan** (`datamodel.md`,
Sector-varianten): Een sector-variant kopieert de bouwblok-namen van zijn
template één-op-één — de Zorgscan heeft bijvoorbeeld exact dezelfde 15
bouwblok-namen als de Klantcontact Volwassenheidsscan, alleen de
vraagteksten wijken af. De eerste stap levert dan meerdere kandidaten op
in plaats van precies één. In dat geval beslissen de **vraagteksten**: Is
er van die kandidaten precies één waarvan alle vraagteksten (op volgorde,
per blok) woordelijk overeenkomen met de CSV, dan is dat het gedetecteerde
type.

Blijft het na beide stappen onbepaald (geen enkele volledige match in
stap 1, of geen eenduidige inhoudsmatch in stap 2), dan blijft de rij
onbepaald met een duidelijke melding ("kon geen Assessment-type
bepalen"), in plaats van een gok. Het gedetecteerde type staat in de
voorbeeldweergave per rij (zie "Werkwijze in beheer").

Na die detectie valideert de tool per rij:
1. Aantal blokken/domeinen in `answers` moet overeenkomen met het
   gedetecteerde Assessment (15 bij Klantcontact Volwassenheid, 8 bij
   AI-volwassenheid) — al gegarandeerd door de detectiestap hierboven,
   maar blijft hier ook expliciet gecontroleerd.
2. Elk blok wordt gematcht op **naam** (`buildingBlockName` in de CSV
   tegen `Bouwblok.naam`), niet op het CSV-eigen `buildingBlockId`
   (dat is een oude, eigen slug en komt niet noodzakelijk overeen met
   het huidige `Bouwblok.id`). Bij twee kandidaten met verschillende
   `Bouwblok.id` maar toevallig dezelfde naam: Handmatig oplossen, de
   tool importeert die rij niet automatisch.
3. Binnen een blok worden de vragen **op volgorde** gematcht (eerste
   vraag in de CSV op `Vraag.volgnummer` 1, enzovoort), niet op
   `questionId`: Ook dat is een oude, eigen sleutel. Komt het aantal
   vragen in een blok niet overeen met het aantal in het huidige
   `Bouwblok.vragen`, dan slaat de tool die rij over met een duidelijke
   melding, in plaats van een deel van de antwoorden te importeren.

Bij twijfel geldt: **Niet importeren en melden**, boven een deel
importeren dat er correct uitziet maar het niet is.

## Opmerkingen per bouwblok

`blockComment` staat in de CSV op elke vraag binnen een blok, met
dezelfde tekst herhaald (het is een opmerking per blok, geen opmerking
per vraag). De tool neemt die tekst één keer over in
`ScanInvulling.opmerkingenPerBouwblok`. Staan er binnen één blok
verschillende, tegenstrijdige `blockComment`-waarden (zou niet moeten
voorkomen, maar de tool checkt het), dan importeert de tool die rij
niet en meldt het, in plaats van er zelf één van te kiezen.

## Meting

De oude tool kende geen `Meting`: Elke rij is een losse
organisatie+datum-combinatie. De import maakt daarom per geïmporteerde
rij een nieuwe `Meting` aan, met een vast label: **"Legacy-import
{jaar van `created_at`}"** (bijv. "Legacy-import 2026"). Meerdere
imports in hetzelfde jaar voor dezelfde organisatie krijgen dus
hetzelfde label; ze blijven wel losse `Meting`-records (één per
geïmporteerde rij), niet samengevoegd.

## Werkwijze in beheer

1. **Bronformaat kiezen**: "Oude tool" of "Coniche Scan (eigen
   export)". Bepaalt welke kolommen verplicht zijn en welk
   scheidingsteken de CSV gebruikt (komma resp. puntkomma, zie hieronder
   bij het nieuwe formaat).
2. CSV uploaden.
3. **Voorbeeldweergave per rij** vóór het definitief importeren:
   Gedetecteerd of opgegeven Assessment-type, gevonden of nieuwe
   organisatie, gevonden of nieuwe respondent, aantal gematchte/niet-
   gematchte blokken en vragen. Rijen met een matchingprobleem (waaronder
   een niet te bepalen Assessment-type) worden gemarkeerd en apart
   afgehandeld, ze blokkeren niet de import van de overige rijen in het
   bestand.
4. Bevestigen per rij, of in bulk voor de rijen zonder gevonden
   probleem.
5. Resultaat: Nieuwe of hergebruikte `Organisatie` en `Respondent`,
   nieuwe `Meting`, nieuwe `ScanInvulling` (status: zie per formaat
   hieronder).

## Bronformaat "Coniche Scan (eigen export)"

Leest de kolommen van `export-csv.md` terug. Verschillen met het "oude"
formaat hierboven:

- **Scheidingsteken puntkomma**, niet komma, en het bestand mag een
  UTF-8-BOM bevatten — beide precies zoals `export-csv.md` ze zelf
  schrijft.
- **Geen naam-/volgorde-matching nodig**: `antwoorden` bevat al onze
  eigen `bouwblokId` en `vraagId` (het is immers onze eigen data), dus
  de import matcht daar rechtstreeks op. Bestaat een `vraagId` niet meer
  in de huidige content (bijv. na een contentwijziging), dan wordt die
  rij overgeslagen met een duidelijke melding — dezelfde "niet
  importeren en melden"-regel als het oude formaat.
- **Assessment-type wordt gematcht op `assessment_naam`** (exacte
  naam), niet gedetecteerd uit de bouwblokken: Onze eigen export
  vermeldt de naam al expliciet, geen detectiestap nodig.
- **Alle drie de statussen worden geïmporteerd** (`uitgenodigd`,
  `bezig`, `afgerond`), niet alleen afgeronde scans: Dit is geen
  eenmalige historische migratie maar een manier om de volledige
  toestand van een organisatie te verplaatsen.
- **`organisatie_kenmerken` wordt één-op-één overgenomen** (inclusief
  Sector/Subsector) bij het aanmaken van een nieuwe organisatie. Wordt
  een bestaande organisatie hergebruikt, dan blijven haar eigen
  kenmerken staan — geen overschrijving met mogelijk oudere geëxporteerde
  data.
- **Geen aparte notitie-prefix**: `Respondent.notities` wordt niet
  aangepast (er is geen `start_comment`-achtig veld in onze eigen
  export om te bewaren).
- **Meting-label**: Het letterlijke `meting_label` uit de export, niet
  "Legacy-import {jaar}" — dit is immers geen import uit een externe
  tool.

## Beslist

- **Telefoonnummer**: Bewust weggelaten, geen nieuw veld op
  `Respondent`.
- **Andere statussen dan `"completed"`**: De export uit de oude tool
  blijft handmatig, en Coniche exporteert alleen de afgeronde
  (`"completed"`) scans die behouden moeten blijven. Geen ondersteuning
  nodig voor onafgeronde of andere statuswaarden.
- **Dubbele import van dezelfde scan**: Voor nu geen dedup-detectie op
  `assessment_id`. Dit is een eenmalige (of incidentele) actie met een
  beperkt aantal historische CSV's, geen doorlopend proces. Wordt het
  importeren van extern afgenomen scans structureel (bijv. vaker
  scans laten uitvoeren en importeren), dan is dit opnieuw te bekijken.
- **Sector/subsector-opties**: Vastgelegd als de standaard
  SBI2025-indeling, alleen de bovenste twee niveaus (Secties,
  Afdelingen), zie `sbi-indeling.md`. Deze import mapt
  `sector_name`/`subsector_name` (de verkorte, eigen tekst uit de oude
  tool) naar de bijbehorende officiële SBI-titel uit die lijst, niet
  naar de letterlijke oude tekst.
