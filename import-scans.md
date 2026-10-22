# Coniche Scan: Import van scans (CSV)

Beheerfunctie om ingevulde
scans uit CSV-bestanden in het huidige datamodel te zetten. Twee
bronformaten, met een keuze vooraf in beheer (zie "Werkwijze in
beheer"):

- **"Oude tool"**: Export uit de oude (vibe-gecodeerde, stopgezette)
  tool, zodat historische klantdata niet verloren gaat. Gebaseerd op
  twee daadwerkelijke exports van dezelfde klant: Één Klantcontact
  Volwassenheidsscan en één AI-volwassenheidsscan (`<organisatie-
  slug>`), beide met exact dezelfde bouwstenen/domeinen en
  vraagteksten als de huidige content. **Tijdelijk**: Verdwijnt zodra
  de historische migratie voltooid is, zie `backlog.md`.
- **"Coniche Scan (eigen export)"**: Onze eigen "Als CSV"-export
  (`export-csv.md`) teruglezen. Vooral bedoeld als tijdelijke manier om
  data tussen browsers te verplaatsen zolang de opslag nog localStorage
  is (CLAUDE.md, Status): Exporteer op de ene browser, importeer op de
  andere. **Blijft bestaan** ook na de historische migratie.

**Gecombineerd bestand.** Bij beide formaten mag één CSV-bestand scans
van meerdere organisaties en van meerdere Assessment-types bevatten, één
rij per ingevulde scan. Een bestand heeft één bronformaat: Oude tool en
eigen export worden niet in één upload gemengd, want het formaat
bepaalt het scheidingsteken. Alles wat in de rest van dit document per
rij wordt bepaald (organisatie, Assessment-type, Respondent) blijft per
rij gelden. Wat over rijen heen moet kloppen (organisatie koppelen, Meting
aanmaken, Respondent hergebruiken) staat onder "Over rijen heen in één
bestand". Een map of een selectie van meerdere bestanden telt in dit
document als één gecombineerd bestand: Alle rijen vormen samen één import,
met dezelfde organisatie-, Respondent- en Meting-regels over alle
bestanden heen.

**Map met losse bestanden (alleen "Oude tool").** De batch-export van de
oude tool bevat geen antwoorden per vraag. De bron is daarom een map met
losse exports, één bestand per scan. In de uploadstap kies je bij "Oude
tool" een map (losse bestanden kiezen kan ook). De tool leest alleen de
`.csv`-bestanden die direct in die map staan; submappen en andere
bestandstypes worden genegeerd en in de samenvatting genoemd. De rijen uit
alle bestanden worden samengevoegd tot één verzameling, op volgorde van
bestandsnaam (alfabetisch) en daarbinnen op rijvolgorde, en daarna
verwerkt als één gecombineerd bestand. "Eerste rij in bestandsvolgorde"
verwijst naar die samengevoegde volgorde. De "Coniche Scan (eigen
export)" kent geen mapvariant: Die export is al één CSV met meerdere
rijen.

De rest van dit document beschrijft eerst het "oude" formaat in detail
(kolommen, matching, edge cases), en sluit af met wat voor het "nieuwe"
formaat anders is.

## Waar dit component een plek krijgt

Een knop "Importeren" in het organisatie-detail (`beheerpagina.md`, punt 8),
alleen voor een Admin. De import hoort bij die ene organisatie: Alle scans
komen daar terecht. Een bestand kan rijen van andere organisaties bevatten;
die koppel je aan deze organisatie of sla je over (zie Organisatie-matching).
Een Consultant ziet de knop niet en krijgt bij de importroute een melding in
plaats van de importfunctie.

## Bronformaat "oude tool"

Eén CSV-bestand met de export uit de oude tool, één rij per ingevulde
scan (`assessment_id`). Een bestand kan de scans van één organisatie
bevatten, maar ook van meerdere organisaties en van beide scantypes
tegelijk, bijvoorbeeld door de losse exports samen te voegen. In de praktijk is het
een map met losse exports, één bestand per scan (zie de inleiding). De
volgorde van de rijen maakt niet uit voor het resultaat, behalve waar
hieronder "eerste rij in bestandsvolgorde" staat. De bestandsnaam (bijv.
`assessment-<organisatie-slug>-2026-01-14.csv`) is informatief, niet
leidend: De tool leest organisatie- en datumgegevens uit de kolommen, niet
uit de bestandsnaam. De voorbeeldweergave toont de bestandsnaam wel bij
elke rij, zodat een probleemrij terug te vinden is in de map.

**Bestanden die niet te importeren zijn.** Een bestand zonder kolom
`answers`, of met een lege `answers`, wordt als geheel overgeslagen met de
melding "Bevat geen antwoorden per vraag (mogelijk een batch-export)". Een
bestand zonder kopregel of zonder rijen, en een bestand waarvan `answers`
geen geldige JSON is, krijgt een eigen melding. Een overgeslagen bestand
blokkeert de rest van de map niet, ook niet als het tussen andere
bestanden staat. Is het het enige bestand, dan valt er niets te importeren
en blijft alleen de melding over. Het gedrag is dus voor elke selectie
gelijk. Een overgeslagen bestand wacht niet op een goedkeuring van de
beheerder: Er is geen rij om goed te keuren, anders dan bij een 95%-match
(een rij die wél te importeren is maar afwijkt). Omdat een overgeslagen
bestand een scan kan kosten, is het wel zichtbaar op drie plekken: Bovenaan
de bestandssamenvatting, op de bulkknop (zie "Werkwijze in beheer") en in
de controlegetallen van `go-live-plan.md`.

Kolommen, gegroepeerd naar wat ermee gebeurt:

### Geïmporteerd

| Kolom | Doel |
|---|---|
| `organization_name` | `Organisatie.naam` (matching, zie hieronder) |
| `sector_name`, `subsector_name` | `Organisatie.kenmerken` (nieuwe velden, zie `datamodel.md`, Organisatievelden) |
| `assessor_name` | `Respondent.naam` (zie "Wie de Respondent wordt") |
| `respondent_email` | `Respondent.email`, genormaliseerd |
| `respondent_role` | `Respondent.functie` |
| `team_name` | `Respondent.team` |
| `start_comment` | `ScanInvulling.notitie` (zie "Notitie per scan") |
| `created_at` | `ScanInvulling.gestartOp` |
| (geen kolom) | `ScanInvulling.aangemaaktOp`: Het moment van importeren, niet de datum uit het bestand |
| `completed_at` | `ScanInvulling.afgerondOp` |
| `status` | `ScanInvulling.status`: Altijd `"completed"` → `"afgerond"`. De export uit de oude tool is handmatig en gebeurt alleen voor scans die Coniche wil behouden, dus altijd afgerond; de tool importeert geen andere statuswaarde en meldt het als er onverwacht een andere waarde in een rij staat |
| `answers` (JSON) | `ScanInvulling.antwoorden`, per vraag (mapping hieronder) |
| `answers[].blockComment` | `ScanInvulling.opmerkingenPerBouwsteen`, één per bouwsteen (dedupliceren, zie hieronder) |

`answers` is een platte lijst van 60 (Klantcontact) of 40 (AI-scan)
losse vraag-items, geen geneste structuur per bouwsteen. Velden per
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
  waarop "Assessment- en bouwsteen-matching" verderop matcht; de
  blok-telling (punt 1 daar) controleert tegen het **aantal groepen**,
  niet tegen `answers.length`.
- **Scoreveld is `answerScore`**, niet `score`. `answerLabel` bevat
  hetzelfde als tekst (het bijbehorende `SchaalLabel`), wordt niet
  apart geïmporteerd: `ScanInvulling.antwoorden` slaat alleen het
  cijfer op, de labeltekst volgt al uit `datamodel.md` (SchaalLabel).
- **`weight`**: Niet per antwoord geïmporteerd. Dit hoort inhoudelijk
  bij de bouwsteen-definitie (`Bouwsteen.gewicht`, zie `datamodel.md`),
  niet bij de losse invulling, en al helemaal niet bij de losse vraag, ook al staat
  het in de CSV op elk vraag-item: Gecontroleerd over beide bestanden
  is deze waarde overal `1`, ook binnen elk blok, dus niets wijst
  erop dat er ooit per vraag gevarieerd werd. Bij beide huidige CSV's
  staat dit overal op `1`, gelijk aan de standaardwaarde, dus geen
  actie nodig. Wijkt dit in een toekomstige import af van het huidige
  `Bouwsteen.gewicht`, dan is dat een contentvraagstuk voor dat moment,
  geen uitbreiding van deze import.

  **Zorgscan**: Ook in de oude exports van de Zorgscan staat `weight`
  overal op 1, terwijl de Zorgscan in de nieuwe tool gewogen is (bouwsteen
  4, 10 en 11 op 2, zie `content-zorgscan.md`). De oude tool paste de
  weging dus nooit toe. Geïmporteerde Zorgscans worden met de nieuwe
  weging berekend, zoals alle scans van dat Assessment. Hun totaalscore wijkt
  daardoor af van de oude `overall_score`, en dat is bedoeld.

### Bewust niet geïmporteerd

- **Alle afgeleide scores**: `overall_score`, `overall_label`,
  `scores_by_building_block`, `scores_by_category`, `radar_chart_data`,
  `strengths`, `weaknesses`. De app berekent dit altijd live uit
  `antwoorden` (`datamodel.md`, Scoreberekening); apart importeren zou een tweede,
  potentieel afwijkende bron van waarheid opleveren.
- **De AI-samenvatting**: `ai_summary_generated`, `ai_summary_overall`,
  `ai_summary_per_block`, `ai_summary_next_steps`, `ai_summary_cta`,
  `ai_summary_disclaimer`, `ai_summary_generated_at`,
  `ai_summary_model`. Gegenereerd door een ouder model op een oudere
  contentversie; de nieuwe AI-managementsamenvatting (`backlog.md`)
  start straks vers, geen import van oude AI-tekst.
- **Consent**: `consent_given`, `consent_timestamp`. De huidige intake
  slaat bewust geen serverside toestemmingsstatus op (`schermen.md`,
  Intake); historische toestemmingsdata importeren zou dat
  weer via een achterdeur doen.
- `export_timestamp`: Moment van de CSV-export uit de oude tool, geen
  betekenis in het nieuwe model.
- `respondent_phone`: `Respondent` heeft geen telefoonveld en krijgt er
  voor deze import ook geen.
- **Contactpersonen en het Dossier**: Ze staan niet in de oude tool en
  niet in de eigen export, dus ook niet in de import (`datamodel.md`, Contactpersoon, Privacy; het Dossier sinds `dossier.md`, Exports).

## Wie de Respondent wordt

Geldt voor het formaat "Oude tool". Bij de eigen export komen de
Respondenten uit de kolommen van de export zelf, op dezelfde manier.

De Respondent komt uit de gegevens in het bestand. Dat is meestal de
Coniche-medewerker die de scan destijds namens de organisatie invulde. Er
is geen aparte neutrale Respondent. De beheerder kan de Respondent na de
import bewerken, bijvoorbeeld naar de echte klantcontactpersoon
(`beheerpagina.md`, punt 6b, "Respondent bewerken"). Een Respondent die de
import aanmaakt, is nooit Lead (`datamodel.md`, Verplaatsen, samenvoegen en
importeren). `respondent_role` komt ongewijzigd binnen als `functie`, ook als de
waarde niet in de keuzelijst staat (`content-respondentrol.md`). Zo'n waarde
wordt vanzelf een extra keuze zolang een Respondent hem heeft.

| Kolom in het bestand | Veld op `Respondent` |
|---|---|
| `assessor_name` | `naam` |
| `respondent_email` | `email`, genormaliseerd (getrimd, lowercase) |
| `respondent_role` | `functie` |
| `team_name` | `team` |
| `start_comment` | `ScanInvulling.notitie`, ongewijzigd en zonder opbouwtekst (zie "Notitie per scan") |

- **Hergebruik**: De regel uit `datamodel.md` (Respondent) geldt
  ongewijzigd. Hetzelfde genormaliseerde e-mailadres binnen een
  organisatie is één Respondent, binnen één import en ook in latere
  imports. De gegevens van een bestaande Respondent worden niet
  overschreven, ook `Respondent.notities` niet.
- **Notitie per scan**: Elke rij houdt zijn eigen
  `start_comment` als notitie op zijn eigen scan. Er wordt niets aan de
  Respondent geplakt, ook niet als meerdere rijen of bestanden dezelfde
  Respondent hebben. Dit was de fout bij het importeren van meerdere
  bestanden: Dezelfde Respondent kreeg alle notities als één tekst. De
  notitie is zichtbaar in de voorbeeldweergave van de import, in het
  Scan-overzicht en in de scanlijst van het Meting-overzicht (kolom Notitie), en hij gaat
  mee naar een andere Meting en naar een andere Respondent samen met de scan
  (`beheerpagina.md`, "Scans samenbrengen in één Meting").
- **Geen e-mailadres in de rij**: Het e-mailadres is verplicht, dus de rij
  heeft een matchingprobleem en wordt niet geïmporteerd. De rij staat met
  die reden in beeld.
- **Telefoonnummer**: `respondent_phone` wordt niet overgenomen.
- **Persoonlijke link**: Elke Respondent krijgt een Toegangscode zoals
  altijd. Is de Respondent een Coniche-medewerker, dan hoort de beheerder
  die link niet te delen. Bewerken naar de echte persoon kan achteraf.
- **Daarna aanpassen**: Alle scans van een Respondent in die organisatie
  gaan mee bij bewerken. Een losse respons aan een andere Respondent in
  dezelfde organisatie hangen kan met "Andere Respondent koppelen"
  (`beheerpagina.md`, "Respons naar andere Meting verplaatsen"). Staan bij
  een import veel scans onder één Respondent die er eigenlijk bij
  verschillende personen horen, en moeten ze in één Meting komen, dan doet
  "Scans samenbrengen in één Meting" het koppelen en verplaatsen in één stap
  (`beheerpagina.md`).

## Organisatie-matching

Op `organization_name`, exact op tekst. Bij geen exacte match toont de
tool de bestaande organisaties zodat de beheerder zelf kiest: Koppelen
aan een bestaande organisatie (bijv. "<Organisatie> Zuid-Nederland" en
"<Organisatie>" zijn mogelijk dezelfde klant, anders gespeld) of een
nieuwe aanmaken. **Geen automatische fuzzy-match**: Dat risico (twee
losse klanten samen laten vallen) is groter dan het gemak.

**Vanuit een organisatie.** De import start in
het organisatie-detail, dus de doelorganisatie ligt vast. Per unieke
organisatienaam in het bestand zijn er twee keuzes: Koppelen aan deze
organisatie (de standaard bij een exacte match met de naam van deze
organisatie) of overslaan. "Nieuw aanmaken" en koppelen aan een andere
bestaande organisatie bestaan niet meer. Staan er in een bestand rijen van
meerdere klanten, dan importeer je het bestand per organisatie opnieuw, elke
keer vanuit die organisatie. Een nieuwe organisatie maak je eerst aan met
"Aanmaken" (`beheerpagina.md`, punt 4).

Gaat dit een keer toch mis, bijvoorbeeld twee net iets anders gespelde
namen blijken achteraf dezelfde klant en zijn als twee losse
organisaties het systeem ingekomen, dan is dat achteraf te herstellen:
`beheerpagina.md`, punt 6b, "Respondent of losse respons naar een
andere organisatie verplaatsen".

**Eigenaarschap van een nieuw aangemaakte organisatie**: `aangemaaktDoor`
wordt de beheerder die de import bevestigt (Werkwijze in beheer,
"Goedkeuren en importeren, op één plek"), net als bij de handmatige "Aanmaken"-actie
(`beheerpagina.md`, punt 4). Bij een bestaande, hergebruikte organisatie
verandert het eigenaarschap niet.

## Over rijen heen in één bestand

Geldt voor beide bronformaten.

**Organisatie, één keer per unieke naam.** De tool groepeert de rijen
vóór het matchen op `organization_name` (bij de eigen export
`organisatie_naam`), exact op tekst na het wegknippen van spaties vooraan
en achteraan; hoofdletters tellen mee, zoals bij de gewone matching. Per
unieke naam vraagt de voorbeeldweergave één keer om een keuze: Koppelen
aan een bestaande organisatie, nieuw aanmaken of overslaan. Die keuze
geldt voor alle rijen met die naam. Bij overslaan worden al die rijen
niet geïmporteerd, met de melding dat hun organisatie is overgeslagen.
Een exacte match met een bestaande organisatie vraagt geen keuze en wordt
automatisch gekoppeld, zoals hierboven.

**Kenmerken bij een nieuwe organisatie.** Verschillen de kenmerken tussen
rijen van dezelfde nieuwe organisatie (sector en subsector, bij de eigen
export `organisatie_kenmerken`), dan neemt de tool de waarden van de
eerste rij in bestandsvolgorde over. Er is geen markering en geen keuze:
Kenmerken zijn altijd bewerkbaar in het organisatiedetail
(`beheerpagina.md`, punt 4), dus een afwijking is achteraf te corrigeren.

**Respondent hergebruiken binnen het bestand.** De hergebruikregel uit
`datamodel.md` (Respondent) geldt ook voor een Respondent die eerder in
dezelfde import is aangemaakt. Hetzelfde (genormaliseerde) e-mailadres
binnen dezelfde organisatie is dus één Respondent, ook als een eerdere rij
die heeft aangemaakt (zie "Wie de Respondent wordt"). Hetzelfde e-mailadres bij een andere
organisatie geeft een aparte Respondent, omdat een e-mailadres alleen
binnen een organisatie uniek is.

**Meting.** Zie "Meting" hieronder.

## Assessment- en bouwsteen-matching

**Het Assessment-type wordt per rij automatisch bepaald**, niet vooraf
door de beheerder gekozen. Aanvankelijk koos de beheerder dit expliciet,
juist om te voorkomen dat een fout bestand stilzwijgend op het
verkeerde scan-type werd geplakt. Bij nader inzien voegt die stap geen
veiligheid toe die de matching hieronder niet al biedt: Een
gedetecteerd type dat toch niet klopt, geeft vanzelf een rij met een
duidelijk matchingprobleem (blok- of vraagaantal komt niet overeen),
nooit een stilzwijgend foute import. De handmatige keuze kostte dus een
stap zonder een risico weg te nemen.

De tool bepaalt het type in twee stappen. **Eerste stap**: De
(gegroepeerde, zie hieronder) bloknamen uit de CSV vergelijken met de
bouwstenen/domeinen van elk Assessment-type. Is er precies één type
waarvan zowel het aantal als alle namen exact overeenkomen, dan is dat
het gedetecteerde type.

**Tweede stap, nodig sinds sector-varianten bestaan** (`datamodel.md`,
Sector-varianten): Een sector-variant kopieert de bouwsteen-namen van zijn
template één-op-één, de Zorgscan heeft bijvoorbeeld exact dezelfde 15
bouwsteen-namen als de Klantcontact Volwassenheidsscan, alleen de
vraagteksten wijken af. De eerste stap levert dan meerdere kandidaten op
in plaats van precies één. In dat geval beslissen de **vraagteksten**, met
een matchpercentage in plaats van alles-of-niets (dit voorkwam eerder dat
een CSV die vóór een latere, kleine tekstcorrectie in de content was
geëxporteerd, helemaal niet meer te importeren was):

Per kandidaat-type: Het percentage vragen (op volgorde, per blok) dat
woordelijk overeenkomt met de CSV, van het totaal aantal vragen van dat
Assessment-type.

- **Precies één kandidaat op 100%**: Gedetecteerd, automatisch, zoals
  voorheen.
- **Geen enkele kandidaat op 100%, maar precies één op of boven 95%, en
  duidelijk de hoogste** (geen andere kandidaat binnen dezelfde marge):
  ook gedetecteerd, maar niet automatisch, de voorbeeldweergave per rij
  (zie "Werkwijze in beheer") toont het percentage en welke vragen
  afwijken, en de beheerder keurt de rij expliciet goed. Een niet
  goedgekeurde rij telt niet mee op de knop "rijen importeren" (Werkwijze
  in beheer, punt 6): Het blijft een afwijking die bewust goedgekeurd
  wordt, alleen kan het nu wél in plaats van nooit.
- **Geen enkele kandidaat op of boven 95%, of meerdere kandidaten op of
  boven 95%**: Onbepaald, zoals hieronder.

**Drempel vast op 95%**, niet beheerbaar (net als de rest van deze
matchingregels). Bewust ruimer dan de eerder overwogen 99%: Bij 60
vragen is al één volledig herschreven vraag een afwijking van 1/60 ≈
1,7%, dus een drempel van 99% zou vrijwel elke praktische
tekstcorrectie alsnog blokkeren. 95% laat een handvol kleine
wijzigingen toe (spelling, woordvolgorde, een enkele herschreven vraag)
zonder de garantie los te laten: Nog steeds altijd een expliciete
goedkeuring per rij, nooit automatisch en nooit voor alle rijen tegelijk.
Geldt alléén voor deze vraagtekst-tiebreak in stap 2, stap 1
(bouwsteen-namen en -aantal) blijft 100% exact, geen tolerantie: Wijkt
een bouwsteen af, dan blijft dat gewoon "niet importeren en melden".

Blijft het na beide stappen onbepaald (geen enkele volledige match in
stap 1, of geen kandidaat op of boven de 95%-drempel in stap 2, of
meerdere kandidaten op of boven die drempel), dan blijft de rij onbepaald
met een duidelijke melding ("kon geen Assessment-type bepalen"), in
plaats van een gok. Het gedetecteerde type (en, bij een 95%+-match, het
percentage) staat in de voorbeeldweergave per rij (zie "Werkwijze in
beheer").

Na die detectie valideert de tool per rij:
1. Aantal blokken/domeinen in `answers` moet overeenkomen met het
   gedetecteerde Assessment (15 bij Klantcontact Volwassenheid, 8 bij
   AI-volwassenheid), al gegarandeerd door de detectiestap hierboven,
   maar blijft hier ook expliciet gecontroleerd.
2. Elk blok wordt gematcht op **naam** (`buildingBlockName` in de CSV
   tegen `Bouwsteen.naam`), niet op het CSV-eigen `buildingBlockId`
   (dat is een oude, eigen slug en komt niet noodzakelijk overeen met
   het huidige `Bouwsteen.id`). Bij twee kandidaten met verschillende
   `Bouwsteen.id` maar toevallig dezelfde naam: Handmatig oplossen, de
   tool importeert die rij niet automatisch.
3. Binnen een blok worden de vragen **op volgorde** gematcht (eerste
   vraag in de CSV op `Vraag.volgnummer` 1, enzovoort), niet op
   `questionId`: Ook dat is een oude, eigen sleutel. Komt het aantal
   vragen in een blok niet overeen met het aantal in het huidige
   `Bouwsteen.vragen`, dan slaat de tool die rij over met een duidelijke
   melding, in plaats van een deel van de antwoorden te importeren.

**De huidige `Vraag`-tekst is altijd leidend voor wat er daadwerkelijk
geïmporteerd wordt.** De koppeling gebeurt op positie/volgnummer (punt 3
hierboven), niet op de letterlijke tekst uit de CSV. De vraagtekst-match
in stap 2 van de type-detectie hierboven is dus alleen het signaal om
het juiste Assessment-type te herkennen, niet de bron van de
uiteindelijke koppeling, dat was al zo, en blijft zo.

Bij twijfel geldt: **Niet importeren en melden**, boven een deel
importeren dat er correct uitziet maar het niet is.

## Opmerkingen per bouwsteen

`blockComment` staat in de CSV op elke vraag binnen een blok, met
dezelfde tekst herhaald (het is een opmerking per blok, geen opmerking
per vraag). De tool neemt die tekst één keer over in
`ScanInvulling.opmerkingenPerBouwsteen`. Staan er binnen één blok
verschillende, tegenstrijdige `blockComment`-waarden (zou niet moeten
voorkomen, maar de tool checkt het), dan importeert de tool die rij
niet en meldt het, in plaats van er zelf één van te kiezen.

## Meting

De oude tool kende geen `Meting`: Elke rij is een losse
organisatie+datum-combinatie. Geïmporteerde rijen komen altijd in een
**nieuwe Meting** met "import" in het label. Zo herkent de beheerder
deze Metingen later en kan hij de responsen omhangen naar de echte Meting
(zie "Omhangen na de import"). Een import hergebruikt nooit een bestaande
Meting, ook niet een Meting uit een eerdere import van dezelfde
organisatie.

Binnen één import delen rijen één Meting als doelorganisatie, Assessment,
bronnaam en label overeenkomen. De bronnaam is de organisatienaam zoals die
in het bestand staat (`organization_name`, bij de eigen export
`organisatie_naam`), getrimd. Een Meting hoort bij precies één Assessment
(`datamodel.md`), dus een organisatie met beide scantypes in het bestand
krijgt twee Metingen.

**Meerdere bronnamen in één organisatie.** Koppelt de beheerder in de
voorbeeldweergave twee of meer bronnamen aan dezelfde organisatie (bestaand of
nieuw), bijvoorbeeld een organisatie met meerdere onderdelen die in de oude
tool los stonden, dan blijft het onderscheid tussen die bronnamen behouden:
Elke bronnaam krijgt zijn eigen Meting. Het label krijgt dan de bronnaam
erachter, bijvoorbeeld "Legacy-import 2026 Onderdeel A" of "Import
Nulmeting 2026 Onderdeel A". De beheerder hernoemt die Metingen achteraf naar
wat ze zijn. Wordt maar één bronnaam aan de organisatie gekoppeld, dan komt de
bronnaam niet in het label, want die zegt dan niets extra's.

**Eén scan per Respondent per Meting.** Een Respondent heeft in een Meting
hooguit één scan (`datamodel.md`). Komt dezelfde Respondent (hetzelfde
genormaliseerde e-mailadres) binnen dezelfde Meting-sleutel nog een keer
voor, bijvoorbeeld omdat dezelfde Coniche-medewerker meerdere scans namens de
organisatie invulde, dan krijgt die scan een eigen Meting. Het label krijgt
de datum van `created_at` erachter, bijvoorbeeld "Legacy-import 2026 Onderdeel A
(14-01-2026)", en bij dezelfde datum een volgnummer "(2)". De scans en de
Respondent zelf blijven zoals ze zijn. De beheerder hernoemt of verplaatst ze
achteraf (zie "Omhangen na de import").

- **Oude tool**: Label **"Legacy-import {jaar van `created_at`}"** (bijv.
  "Legacy-import 2026"). Rijen van dezelfde organisatie, dezelfde bronnaam en
  hetzelfde Assessment uit hetzelfde jaar komen samen in één Meting, tenzij
  een Respondent er al een scan in heeft (zie hierboven).
- **Eigen export**: Label **"Import {meting_label}"**, met het
  `meting_label` uit de export (bijv. "Import Nulmeting 2026"). Rijen met
  dezelfde organisatie, dezelfde bronnaam, hetzelfde Assessment en hetzelfde
  `meting_label` komen samen in één Meting, tenzij een Respondent er al een
  scan in heeft (zie hierboven).

"Binnen één import" betekent één geladen bestand in één beheersessie.
Neem je een rij later alsnog mee met dezelfde knop (zie
"Werkwijze in beheer"), dan komt die in de Meting die eerder in die
sessie al voor die combinatie is aangemaakt. Een nieuwe upload, ook van
hetzelfde bestand, begint met nieuwe Metingen.

**Meetdatum en onderdeel.** De oude tool kende geen onderdeel en geen
meetdatum (`datamodel.md`, Meting). De import leidt ze af uit wat hij al weet.

- **Meetdatum.** De oudste `created_at` van de scans die in de Meting komen
  (de oude tool, de dag zonder tijdstip). Het is de dag waarop in de oude tool
  is gemeten en niet het moment van importeren. Bij de eigen export geldt de
  kolom `meting_meetdatum`, als die er is (`export-csv.md`). Ontbreekt hij, dan
  blijft de meetdatum leeg en staat de Meting in beheer als "Datum ontbreekt".
  In de voorbeeldweergave staat de afgeleide datum per Meting, aanpasbaar
  voordat de beheerder importeert.
- **Onderdeel.** De bronnaam, als meerdere bronnamen aan dezelfde organisatie
  zijn gekoppeld. In de voorbeeldweergave staat dan per bronnaam een veld
  "Onderdeel", voorgevuld met de bronnaam en aanpasbaar. Bij één bronnaam is het
  onderdeel "Hele organisatie". Bij de eigen export geldt het onderdeel uit de
  kolom `onderdeel`, als die er is (`export-csv.md`). Het veld is de keuzelijst Onderdeel (`beheerpagina.md`, punt 5, Het veld
  Onderdeel). De bronnaam staat gekozen als er een Onderdeel met die naam
  bestaat (hoofdletterongevoelig), anders als "Nieuw onderdeel…" met de bronnaam
  ingevuld. Het Onderdeel ontstaat bij het importeren. De KPI's uit een eigen
  export (`organisatie_kpis`) worden teruggelezen en overschrijven bij een
  bestaande Organisatie niets, zoals `organisatie_kenmerken`. Een oudere eigen
  export met KPI's in `organisatie_kenmerken` wordt omgezet: De KPI's krijgen `onderdeelId: null` en `kanaalId: null`, en de zes getalvelden voor contacten per kanaal worden KPI-waarden van Contacten per jaar, met het kanaal erbij.
- **Dezelfde Respondent twee keer.** Krijgt een scan een eigen Meting omdat
  dezelfde Respondent al een scan heeft in die Meting (zie hierboven), dan hoort
  die Meting bij zijn eigen meetdatum. Het label krijgt dezelfde datumconventie,
  bijvoorbeeld "Legacy-import 2026 (14-01-2026)". Zo ontstaan een 0-meting
  en een nameting die in hetzelfde jaar zijn gedaan.
- **Volgorde.** De volgorde in de tijd komt uit de meetdatum, niet uit de
  volgorde waarin de rijen binnenkomen.
- **Daarna.** De beheerder past waar nodig de naam en het onderdeel aan en
  verplaatst indien nodig responsen of hele Metingen (`beheerpagina.md`,
  punt 5, Wijzigen en punt 6b).

**Omhangen na de import.** Dit is een voorwaarde voor deze aanpak: De
beheerder kan elke geïmporteerde respons naar een andere Meting van
dezelfde organisatie en hetzelfde Assessment verplaatsen
(`beheerpagina.md`, punt 6b, "Respons naar andere Meting verplaatsen").
Is de import-Meting daarna leeg, dan verwijdert de beheerder die met de
bestaande verwijderfunctie (`beheerpagina.md`, Verwijderen). De import
legt zelf geen koppeling vast met de Meting waar de respons uiteindelijk
hoort.

## Werkwijze in beheer

1. **Bron kiezen**: Met "Map kiezen" een map, of met "Bestanden kiezen"
   losse bestanden. Bij de eigen export is dat één CSV.
2. **Bronformaat herkennen**: De app bepaalt zelf uit de kopregel of het
   bestand "Oude tool" of "Coniche Scan (eigen export)" is. Dat bepaalt
   welke kolommen verplicht zijn en welk scheidingsteken de CSV gebruikt
   (komma resp. puntkomma, zie hieronder bij het nieuwe formaat). Herkent
   de app geen van beide, dan volgt een duidelijke melding.
3. **Samenvatting van het bestand of de map**: Bovenaan de overgeslagen
   bestanden met hun reden (zie "Bestanden die niet te importeren zijn"),
   vóór de organisatiekeuzes. Daarna het aantal bestanden, genegeerde
   submappen en bestandstypes, aantal rijen, aantal organisaties
   (bestaand, nieuw, nog te kiezen), aantal rijen per Assessment-type en
   aantal rijen met een probleem.
4. **Organisaties koppelen**: Per unieke organisatienaam één keuze
   (koppelen aan de organisatie waarvanuit je importeert, of overslaan), zie
   "Organisatie-matching" en "Over rijen heen in één bestand".
5. **Voorbeeldweergave per rij** vóór het definitief importeren:
   Bestandsnaam, gedetecteerd of opgegeven Assessment-type, gevonden of
   nieuwe organisatie, gevonden of nieuwe respondent, aantal gematchte/niet-
   gematchte blokken en vragen. Rijen met een matchingprobleem (waaronder
   een niet te bepalen Assessment-type) worden gemarkeerd en apart
   afgehandeld, ze blokkeren niet de import van de overige rijen in het
   bestand. **Bij een 95%+-vraagtekstmatch** (Assessment- en
   bouwsteen-matching, stap 2): Het percentage en de afwijkende vraag/vragen
   staan er ook bij, zodat de beheerder ziet wat hij goedkeurt.
6. **Goedkeuren en importeren, op één plek.** Importeren gebeurt alleen
   met de ene knop onder de lijst, "N rijen importeren". Daarmee geeft de
   beheerder in één keer goedkeuring voor de hele set. Er is geen knop
   "Importeer deze rij" meer. Wat in de set zit:
   - **Rijen zonder probleem** ("Klaar om te importeren") zitten er
     automatisch in.
   - **Rijen met een waarschuwing**, een 95%+-match ("98,3% match,
     goedkeuring nodig"), zitten er pas in na een expliciete goedkeuring
     per rij, met de knop "Goedkeuren" in de rij. De rij toont dan de
     badge "Goedgekeurd" en de knop "Goedkeuring intrekken". Elke
     goedkeuring telt er één bij op de knop. Goedkeuren is alleen een
     keuze om mee te nemen en schrijft niets weg.
   - **Rijen met een matchingprobleem of een overgeslagen organisatie**
     zitten er niet in en hebben geen knop. Lost de beheerder het probleem
     op, bijvoorbeeld door de organisatie te koppelen, dan wordt het een
     rij zonder probleem of met een waarschuwing.
   De knop noemt het aantal rijen in de set en het aantal overgeslagen
   bestanden (bijvoorbeeld "Importeer 37 rijen, 2 bestanden
   overgeslagen"). Staan er waarschuwingsrijen die nog niet zijn
   goedgekeurd, dan staat er naast de knop hoeveel dat er zijn. Een
   gewijzigde organisatiekoppeling bij een goedgekeurde rij trekt de
   goedkeuring in, omdat de rij opnieuw wordt beoordeeld.
7. Resultaat per rij: Nieuwe of hergebruikte `Organisatie` en
   `Respondent`, `Meting` (zie "Meting"), nieuwe `ScanInvulling` (status:
   Zie per formaat hieronder).

### Rijen die niet lukken

- **Een rij slaagt of mislukt als geheel.** `Organisatie`, `Respondent`,
  `Meting` en `ScanInvulling` van één rij worden samen weggeschreven of
  helemaal niet. Er blijft geen halve rij achter.
- **Na het importeren blijven alle rijen in beeld.** Geslaagde rijen
  staan als "geïmporteerd" en zijn niet meer goed te keuren. Rijen die niet
  zijn gelukt staan er met de reden, zoals een matchingprobleem of een
  overgeslagen organisatie.
- **Niet-geïmporteerde rijen importeer je alsnog met dezelfde knop.** Een
  rij met een waarschuwing keur je dan alsnog goed, een rij met een
  probleem eerst oplossen, bijvoorbeeld door de organisatie alsnog te
  koppelen. De knop "N rijen importeren" telt dan alleen de rijen die nog
  niet zijn geïmporteerd. Opnieuw de map of het bestand kiezen is niet
  nodig.
- **Geen downloadbestand met overgeslagen rijen.** De import geeft alleen
  aan wat er niet is gelukt.
- **De markering "geïmporteerd" hoort bij de geladen map of het geladen
  bestand in deze sessie.** Het is geen controle op dubbele scans, zie
  "Beslist". Sluit de beheerder het scherm of kiest hij de map opnieuw, dan
  is de markering weg.
- **Annuleren vóór importeren schrijft niets weg.** Na importeren is er
  geen ongedaan maken van de hele import. Een rij die verkeerd is
  binnengekomen, ruim je op met de bestaande verwijderacties
  (`beheerpagina.md`, Verwijderen) of verplaats je met de acties in punt
  4.

## Bronformaat "Coniche Scan (eigen export)"

Leest de kolommen van `export-csv.md` terug. Verschillen met het "oude"
formaat hierboven:

- **Scheidingsteken puntkomma**, niet komma, en het bestand mag een
  UTF-8-BOM bevatten, beide precies zoals `export-csv.md` ze zelf
  schrijft.
- **Geen naam-/volgorde-matching nodig**: `antwoorden` bevat al onze
  eigen `bouwsteenId` en `vraagId` (het is immers onze eigen data), dus
  de import matcht daar rechtstreeks op. Bestaat een `vraagId` niet meer
  in de huidige content (bijv. na een contentwijziging), dan wordt die
  rij overgeslagen met een duidelijke melding, dezelfde "niet
  importeren en melden"-regel als het oude formaat.
- **Assessment-type wordt gematcht op `assessment_naam`** (exacte
  naam), niet gedetecteerd uit de bouwstenen: Onze eigen export
  vermeldt de naam al expliciet, geen detectiestap nodig.
- **Alle drie de statussen worden geïmporteerd** (`uitgenodigd`,
  `bezig`, `afgerond`), niet alleen afgeronde scans: Dit is geen
  eenmalige historische migratie maar een manier om de volledige
  toestand van een organisatie te verplaatsen.
- **`organisatie_kenmerken` wordt één-op-één overgenomen** (inclusief
  Sector/Subsector) bij het aanmaken van een nieuwe organisatie, van de
  eerste rij in bestandsvolgorde (zie "Over rijen heen in één bestand").
  Wordt een bestaande organisatie hergebruikt, dan blijven haar eigen
  kenmerken staan, geen overschrijving met mogelijk oudere geëxporteerde
  data.
- **Respondenten uit de export zelf**: De
  Respondent komt uit `respondent_naam`, `respondent_email`,
  `respondent_functie` en `respondent_team`, en `Respondent.notities` wordt
  niet aangepast. De kolom `scan_notitie` (`export-csv.md`) wordt
  `ScanInvulling.notitie`. Ontbreekt de kolom, dan blijft de notitie leeg.
- **Meting**: Een nieuwe Meting met het label "Import {meting_label}",
  met het `meting_label` uit de export erin, niet het label "Legacy-import
  {jaar}" (dit is geen import uit een externe tool). Rijen met dezelfde
  organisatie, dezelfde bronnaam, hetzelfde Assessment en hetzelfde
  `meting_label` delen één Meting, zie "Meting" hierboven. Een bestaande Meting met dezelfde naam
  wordt niet hergebruikt. Het onderdeel komt uit de kolom `onderdeel` en de meetdatum uit de
  kolom `meting_meetdatum`, als die in het bestand staan (`export-csv.md`).
  Ontbreken ze, dan geldt de afleiding bij "Meetdatum en onderdeel" hierboven.
  Een oude kolom `ronde` in het bestand wordt genegeerd.

## Audit-log

Elke import wordt als groep gelogd in de audit-log (`beheerpagina.md`,
punt 12; `datamodel.md`, Audit). De groep begint bij de eerste
keer dat de knop "rijen importeren" wordt gebruikt. Goedkeuren en
annuleren vóór het importeren logt niets. Gelogd worden de start
met de geladen bestanden en welke daarvan direct zijn overgeslagen (met
reden), per geïmporteerde rij de scan en wat daarbij is aangemaakt
(Organisatie, Respondent, Meting), bij een goedgekeurde 95%+-rij het
percentage, en per mislukte rij de reden. Rijen die later alsnog worden
geïmporteerd, komen bij dezelfde groep.

De log bevat geen persoonsgegevens uit de scans. Er staan dus geen
namen of e-mailadressen van Respondenten in, ook niet de herkomstregel
uit de notities. Een scan staat erin met Organisatie, Assessment en
Meting.

## Beslist

- **Goedkeuren en importeren op één plek**: Een rij met een
  waarschuwing (95%+-match) wordt niet meer los geïmporteerd. De beheerder
  keurt de rij goed, waarna ze meetelt op de knop "N rijen importeren".
  Importeren gebeurt alleen met die ene knop, voor de hele set. Goedkeuren
  blijft per rij, omdat een afwijking bewust bekeken moet worden. Een
  "alles goedkeuren" voor de waarschuwingsrijen is er bewust niet.
- **Telefoonnummer**: Bewust weggelaten, geen nieuw veld op
  `Respondent`.
- **Andere statussen dan `"completed"`**: De export uit de oude tool
  blijft handmatig, en Coniche exporteert alleen de afgeronde
  (`"completed"`) scans die behouden moeten blijven. Geen ondersteuning
  nodig voor onafgeronde of andere statuswaarden.
- **Dubbele import van dezelfde scan**: Voor nu geen dedup-detectie op
  `assessment_id`, ook niet binnen één gecombineerd bestand of bij overlap
  tussen bestanden in één map. Dit is een
  eenmalige (of incidentele) actie met een beperkt aantal historische
  CSV's, geen doorlopend proces. Wordt het importeren van extern
  afgenomen scans structureel (bijv. vaker scans laten uitvoeren en
  importeren), dan is dit opnieuw te bekijken. Het enige vangnet is de
  markering "geïmporteerd" per rij binnen de geladen sessie
  ("Rijen die niet lukken") en het importlogboek in `go-live-plan.md`.
- **Gecombineerd bestand**: Bij beide formaten
  ondersteund, één bronformaat per bestand. Organisatie wordt één keer per
  unieke naam gekozen, kenmerken komen van de eerste rij, en elke import
  maakt nieuwe Metingen met "import" in het label die de beheerder later
  omhangt.
- **Deels mislukte import**: Alleen aangeven wat niet is gelukt, geen
  downloadbestand met overgeslagen rijen. Rijen die niet zijn
  geïmporteerd blijven in beeld en importeer je alsnog met dezelfde knop.
- **Map met losse bestanden**: Alleen bij "Oude tool",
  omdat de batch-export van de oude tool geen antwoorden per vraag
  bevat. Alleen bestanden direct in de gekozen map, geen submappen. De
  rijen worden samengevoegd en verder verwerkt als gecombineerd bestand.
- **Respondent uit het bestand bij "Oude tool"**: Elke
  geïmporteerde scan krijgt een Respondent met de gegevens uit het bestand
  (naam, e-mailadres, functie, team en notitie), in plaats van een
  neutrale Respondent. Dat kan, omdat de beheerder een Respondent
  achteraf kan bewerken.

## Open

- **Sector/subsector-opties**: Vastgelegd als de standaard
  SBI2025-indeling, alleen de bovenste twee niveaus (Secties,
  Afdelingen), zie `sbi-indeling.md`. Deze import mapt
  `sector_name`/`subsector_name` (de verkorte, eigen tekst uit de oude
  tool) naar de bijbehorende officiële SBI-titel uit die lijst, niet
  naar de letterlijke oude tekst.
