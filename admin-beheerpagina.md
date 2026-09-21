# Coniche Scan — Admin-beheerpagina

Vervolgstap na v1, samen met Joost uitgewerkt. 1 rol (admin), toegang voor
Joost en Sander. Geen rechtenmodel nodig, wel het volledige beheer van
content en scans.

## Login

Simpel houden: 2 vaste accounts, geen zelfregistratie of rollenstructuur.
E-mail + wachtwoord + 2FA voor de admin-omgeving. Geldt uitdrukkelijk NIET
voor respondenten die een scan invullen, die loggen niet in (zie hieronder).

## Vormgeving

Bevestigd in `admin.css`: de beheeromgeving hergebruikt de publieke nav
en footer (zelfde logo, zelfde balk), met alleen een extra "terug"-link
binnen diezelfde balk. Geen aparte admin-huisstijl bouwen. Concrete
componenten (inklapbare bouwblok-kaarten voor content-beheer,
statusbadges voor alle drie respondent-statussen, tabelstijl) staan al
klaar — zie `stylesheet.md`, sectie "Bevestigde componenten".

## Toegang voor respondenten

Geen login voor respondenten. Volledige mechanisme (uniek per scan-instantie
én per respondent-invulversie, plus verificatiecode-flow) staat in
v1-aanpassingen.md punt 2 — dat is al bij Sander in bouw, niet hier
dupliceren.

## Wat beheerbaar moet zijn

### 1. Assessment-types
Aanmaken/bewerken van een `Assessment` (zie CLAUDE.md sectie 1): naam,
subtitel, beschrijving, doelgroep, geschatte duur, en de globale schaal-
labels (5 stuks, instelbaar per Assessment-type — dus voor Klantcontact
Volwassenheid anders dan straks voor een AI-scan).

### 2. Content: categorieën, bouwblokken, vragen
Per Assessment: categorieën met kleur en volgorde, bouwblokken daarbinnen
(naam, omschrijving, **toelichting** — de langere uitlegtekst achter de
overlay-link, zie v1-aanpassingen.md punt 3 — tags, variabel aantal tags),
en de vragen per bouwblok (tekst). Dit is de contentset die nu in
CLAUDE.md sectie 6 hardcoded staat voor de Klantcontact
Volwassenheidsscan — dat wordt hiermee bewerkbaar in plaats van vast in
code.

### 3. Organisatievelden (VeldDefinitie's)
De veldenlijst uit CLAUDE.md sectie 2 (volume/klantbasis, digitalisering,
techstack, FTE, KPI's) wordt zelf ook beheerbaar: label, type, vaste
antwoordcategorieën waar van toepassing. Dit is een meta-laag boven de
scans zelf.

### 4. Organisaties — lijst, aanmaken, detail

Dit stond er eerder als abstracte eis ("scans aanmaken", "respondenten
toevoegen"), maar is nog nergens als concreet scherm gebouwd — de
huidige "Ingevulde scans"-pagina (zie punt 6) is een platte lijst zonder
organisatie-laag erboven. Drie schermen nodig:

- **Organisaties-lijst**: alle aangemaakte organisaties, met per rij in
  elk geval naam, aantal uitgenodigde respondenten, aantal afgerond.
- **Organisatie aanmaken**: kies een Assessment-type, vul organisatienaam
  en -kenmerken in volgens de veldenlijst van punt 3.
- **Organisatie-detail**: toont de organisatiekenmerken (read-only na
  aanmaken, of bewerkbaar — nog te bevestigen), en de lijst respondenten
  binnen die organisatie met hun status. Vanaf hier respondenten
  toevoegen: e-mailadres invoeren, uitnodiging versturen (zie het
  verificatiemechanisme in v1-aanpassingen.md punt 2 voor hoe de
  respondent vervolgens toegang krijgt).

### 5. Respondenten toevoegen

Gebeurt vanuit de Organisatie-detailpagina (punt 4), niet als los scherm:
e-mailadres invoeren, voortgang/status per respondent zien (uitgenodigd /
bezig / afgerond — alle drie hebben inmiddels een badge-stijl, zie
`stylesheet.md`).

### 6. Ingevulde scans — overzicht met bulk-acties

Bestaat al als eerste versie, met kolommen Naam, Assessment, Rol/Team,
Status, Voortgang, Gestart, en een "bekijk"-link per rij. Nog toe te
voegen:

- **Organisatie-kolom**: ontbreekt nog, moet erbij — logisch, want dit
  overzicht spant over alle organisaties heen (zie "Bevestigd"
  hieronder), dus zonder die kolom is niet te zien bij welke organisatie
  een rij hoort. Plek in de kolomvolgorde: voor de hand liggend vlak na
  of voor Naam, definitieve positie aan de bouwer.
- **Sorteerbare kolommen**: alle kolommen (dus ook de nieuwe
  Organisatie-kolom) klikbaar sorteerbaar maken, niet later maar nu al.
- **Selectievakjes per rij**, plus een "alles selecteren"-vakje in de
  koprij.
- **Verwijderen**: een prullenbak-icoon dat verschijnt zodra er iets
  geselecteerd is, verwijdert de geselecteerde scan-instanties.
- **Exporteren**: de knop staat er, de functie nog niet. Dit wordt de
  ENE herbruikbare exportfunctie die ook op de resultatenpagina gebruikt
  wordt (zie BACKLOG.md, "PDF- en CSV-export van resultaten") — niet twee
  keer bouwen. Op dit scherm waarschijnlijk een bulk-export van de
  geselecteerde rijen, op de resultatenpagina een export van die ene
  scan — zelfde onderliggende functie, ander bereik.
- Nog te beslissen: hoort deze lijst hier los te blijven staan (alle
  scans, over alle organisaties heen, handig voor snel overzicht), of
  verhuist hij naar binnen de Organisatie-detailpagina (punt 4)? Beide
  kunnen ook naast elkaar bestaan — dit overzicht dan als "alles",
  Organisatie-detail als gefilterde weergave.

## Nog meer te overwegen (nog geen besluit, ter bespreking)

Functionaliteit die logisch bij dit soort beheeromgeving hoort, maar nog
niet is gevraagd of vastgelegd:

- Filteren/zoeken in "Ingevulde scans" (op organisatie, assessment-type,
  status, periode) en sorteren op kolom — wordt al snel nodig zodra er
  meer dan een paar organisaties zijn.
- Respondent opnieuw uitnodigen (bijv. de verificatiemail is kwijt of
  verlopen) zonder een compleet nieuwe respondent aan te maken.
- Toegang van een respondent intrekken (per ongeluk verkeerd
  e-mailadres uitgenodigd).
- Bulk-uitnodigen: meerdere e-mailadressen in één keer toevoegen (bijv.
  plakken uit een lijst) in plaats van steeds één voor één.
- Herinneringsmail naar respondenten die al een tijd op "uitgenodigd" of
  "bezig" blijven staan.
- Organisatie dupliceren/als sjabloon gebruiken (zelfde
  organisatiekenmerken-structuur hergebruiken voor een nieuwe klant).

Geen van deze hoeft nu een besluit te krijgen, maar zeg het als er iets
bij zit dat je alsnog wilt meenemen, dan zet ik het in BACKLOG.md of hier
concreet.

## Verwijderen — cascade-regels

**Twee verschillende acties, niet één**:
- **Op "Ingevulde scans" verwijderen** → gooit alleen díe ene scan-
  invulling weg (antwoorden, opmerkingen, status, start-/einddatum van
  die poging). De respondent zelf (naam, e-mailadres, uitnodiging)
  blijft bestaan.
- **Op "Respondenten" verwijderen** → gooit de hele respondent weg, met
  cascade naar al diens scan-invullingen.

**Dit vraagt op termijn een knip in het datamodel die er nu nog niet
is.** CLAUDE.md sectie 1 modelleert `antwoorden`/`opmerkingenPerBouwblok`/
`status`/`gestartOp`/`afgerondOp` nu rechtstreeks als velden ÓP
`Respondent` — dat gaat uit van precies één invulling per respondent.
Zodra dezelfde respondent later nogmaals een scan moet kunnen invullen
(dezelfde of een andere), moeten die velden verhuizen naar een los
`ScanInvulling`-record (N per Respondent) in plaats van vaste velden op
Respondent zelf. Dat is bewust NIET nu te bouwen — staat als apart punt
in BACKLOG.md — maar de twee verwijderacties hierboven moeten er nu al
wel rekening mee houden dat ze straks los van elkaar moeten werken. Met
precies 1 invulling per respondent komt "scan verwijderen" in de
praktijk nog op hetzelfde neer als "antwoorden van deze respondent
wissen zonder de respondent zelf te verwijderen" — bouw het dus als twee
aparte acties, ook al is het effect nu bijna gelijk.

**Concreet, nu al bevestigd** (via de tussenoplossing in
v1-aanpassingen.md punt 2a): "Ingevulde scans" verwijderen = status
terug naar `"uitgenodigd"`, `antwoorden`/`opmerkingenPerBouwblok`/
`gestartOp`/`afgerondOp` gewist — maar `naam`/`rol`/`team`/`notities`
blijven staan. Bij een volgend bezoek aan dezelfde link komt de
respondent dus weer op scherm 4 (intake) terecht, met die eerdere
gegevens al vooringevuld, in plaats van bij nul te moeten beginnen.

**Organisatie verwijderen** → cascadeert naar:
- Alle `Respondenten` binnen die organisatie, inclusief al hun
  scan-invullingen
- De organisatiekenmerken zelf
- Raakt NIET het Assessment-type — dat is generiek en blijft bestaan voor
  andere organisaties

Risico, gezien wat we net over terugkerende organisaties bespraken: een
harde verwijdering van een hele organisatie kost mogelijk waardevolle
historie van een klant die later terugkomt. Overweeg een stevige
bevestigingsstap ("Dit verwijdert ook N respondenten en hun ingevulde
antwoorden, dit kan niet ongedaan gemaakt worden") in plaats van
verwijderen zonder waarschuwing. Een echte archief-/soft-delete-optie is
een grotere wijziging, zet ik desgewenst in BACKLOG.md.

**Respondent verwijderen** → verwijdert alleen die ene respondent (naam,
rol, team, notities, antwoorden, opmerkingen, status, data). De
organisatie en de overige respondenten blijven ongemoeid. Geen
automatische cascade omhoog: als het de laatste respondent was, blijft
de organisatie gewoon leeg bestaan.

**Select + verwijderen wordt een terugkerend patroon**, niet uniek voor
"Ingevulde scans": zelfde functionaliteit (selectievakjes, "alles
selecteren", `.btn-danger` in de compacte maat) hoort ook op de
Organisaties-lijst en op de respondentenlijst binnen een
Organisatie-detailpagina. Eén herbruikbare component, niet drie keer
apart bouwen.



- Exacte login-methode (zie aanname hierboven)
- Of bouwblokken/vragen alleen bewerkbaar zijn per Assessment-type, of ook
  herbruikbaar tussen types (bijv. een bouwblok delen tussen de
  Volwassenheidsscan en de Zorg-variant)

## Bevestigd

- **Organisatiekenmerken blijven altijd bewerkbaar**, ook nadat
  respondenten al zijn uitgenodigd. Geen vergrendel-logica. Reden, niet
  alleen foutcorrectie: organisaties komen terug voor een volgende scan,
  en de kenmerken worden in de praktijk niet altijd in één keer
  ingevuld — een deel vult Coniche zelf, een deel wordt samen met
  medewerkers van de klantorganisatie doorlopen. Zie de opmerking
  hieronder over wat dat betekent voor het huidige model.
- **"Ingevulde scans" blijft het volledige overzicht** (over alle
  organisaties heen), naast de gefilterde weergave per Organisatie-
  detailpagina — beide bestaan naast elkaar. Belangrijkste eis: er moet
  altijd een pad zijn van organisatie → respondent → scan, niet welke
  pagina daarbij "primair" is.

## Spanning met CLAUDE.md, nog niet opgelost

CLAUDE.md sectie 1 omschrijft `Organisatie.kenmerken` nog als "ingevuld
door Coniche, read-only voor respondenten". Dat klopt niet meer met wat
hierboven bevestigd is: soms vult een medewerker van de klantorganisatie
zelf een deel van de kenmerken in, niet alleen Coniche. Dat is een
groter punt dan alleen "bewerkbaar blijven" — het raakt namelijk ook wie
er toegang toe heeft en via welk mechanisme (huidige respondenten-
toegang is per scan-invulling, niet voor het bewerken van
organisatiekenmerken). Voor nu geen wijziging in de bouw, maar dit moet
op een gegeven moment een eigen besluit krijgen — zie BACKLOG.md.

