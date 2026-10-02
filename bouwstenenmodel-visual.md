# Coniche Scan: Bouwstenenmodel, interactief overzicht

Route `/bouwstenen`. Losstaand van de andere
specs qua onderwerp, leunt inhoudelijk op `visie-coniche.md` en qua
componenten op `stylesheet.md`. Niets hergebruiken van de meegestuurde
schets qua stijl, die is alleen het vertrekpunt voor de indeling.

## Doel

Eén visuele component, een overzicht van alle 15 bouwstenen in hun 5
categorieën, van boven naar beneden. Klikken op een bouwsteen toont de
beschrijving en de centrale vraag.

## Hergebruik van bestaande content, geen nieuwe

De modal die opent bij een klik, is de Toelichtingsmodal (`stylesheet.md`,
"Modal en Toelichtingsmodal"), dezelfde als bij de toelichting-icoontjes
("i") per bouwblok in de doorloopflow (CLAUDE.md sectie 3).
Beide triggers, het i-icoontje in de doorloopflow en een klik op een
blok in dit overzicht, openen dezelfde modal met dezelfde content
(`Bouwblok.toelichting` en `Bouwblok.centraleVraag`). Geen nieuwe
overlay bouwen, geen content dupliceren.

## Waar dit component een plek krijgt

**Beantwoord.** Dit ís de bestemming van de link "Bouwstenen" in de 4
vaste content-links in de header (CLAUDE.md sectie 3), route
`/bouwstenen`. Geen losse leespagina met alleen tekst meer ernaast: De
beschrijving en centrale vraag per bouwsteen (`visie-coniche.md` deel 2)
komen uitsluitend nog terug in de modal van dit component.

Binnen een persoonlijke respondent-link gaat de toegangscode mee via
`?code=`, zodat het logo en de exit-actie "← Terug naar Mijn metingen"
naar de juiste plek blijven verwijzen.

## Bron voor de inhoud

Naam, categorie en volgnummer: Zoals al doorgevoerd in
`content-klantcontact-volwassenheid.md`. Beschrijving en centrale vraag:
`visie-coniche.md` deel 2. In het datamodel: `Bouwblok.omschrijving` (of
`toelichting`, zie Open punten) en het nieuwe `Bouwblok.centraleVraag`
(`datamodel.md`).

---

## Hero

Oranje-getinte hero bovenaan de pagina, verloop van `--or-faint` naar
wit, boven het overzicht zelf.

## Structuur, van boven naar beneden

**1. Overkoepelend**, 2 bouwstenen, elk een balk, gestapeld:
1. Organisatiestrategie
2. Klantcontactvisie & Strategie

**Geen rij-label links van deze 2 balken, en ook niet bij Fundament
hieronder.** Alleen de 3 categorie-rijen in de grid hieronder (Organisatie
/ Proces & Tech / Mens) krijgen een naam links van de rij — vandaar dat de
tabel hieronder ook expliciet "Rij (**categorie**)" heet, niet "rij".
Overkoepelend en Fundament zijn geen categorieën, dus geen label, geen
"Overkoepelend"/"Fundament"-tekst ervoor.

**2. Grid van 3 categorieën, elk 4 bouwstenen**, één categorie per rij,
4 kolommen:

| Rij (categorie) | Kolom 1 | Kolom 2 | Kolom 3 | Kolom 4 |
|---|---|---|---|---|
| Organisatie | Structuur & Sturing | Leren uit Klantcontact | Financial Control | Positionering Klantcontact |
| Proces & Tech | Systemen & Tools | Workforce Management | Kennismanagement | Kanaalmanagement |
| Mens | Performance Management | Learning & Development | Employee Engagement | Leiderschap |

**3. Fundament**, 1 bouwsteen, een balk:
Cultuur

Volgorde binnen elke rij van de grid: Zoals hierboven. Geen andere
volgorde nodig.

**Verticale ruimte rond de balken.** De standaard rij-gap (`0.6rem`,
`.bouwstenen-model`) geldt tussen bouwsteen 1 en 2 (die horen "gestapeld"
te zijn, bewust dicht op elkaar) en tussen de 3 categorie-rijen
onderling. Tussen bouwsteen 2 en de Organisatie-rij eronder, en tussen de
Mens-rij en bouwsteen 15 eronder, is dat te krap — daar komt een grotere
marge, `1.2rem` in plaats van `0.6rem`, zodat 1/2/15 duidelijk los staan
van de grid in plaats van ertegenaan te schurken.

### Breedte en uitlijning van de balken

De 3 balken (bouwsteen 1, 2, 15) zijn niet alle drie vol breed, en niet
allemaal even breed als elkaar. Ze gebruiken dezelfde 4-koloms grid als
de categorie-rijen eronder (zelfde `grid-template-columns`), en spannen
daarbinnen een vast aantal kolommen — geen losse breedteberekening in
percentages, om pixel-exacte uitlijning met de grid te garanderen:

- **Bouwsteen 1 (Organisatiestrategie)** en **bouwsteen 15 (Cultuur)**
  spannen kolom 2 en 3 (`grid-column: 2 / 4`): 2 van de 4 kolommen,
  gecentreerd onder de grid, niet links- of rechtsuitgelijnd. Rustiger
  beeld dan vol- of 3/4-breed, en dit is ook waarom de stippellijn (zie
  "Overig" hieronder) precies door hun midden kan lopen: hun breedte
  staat los van de breedte van die stippellijn, die wél de volle
  gridbreedte volgt (zie hieronder).
- **Bouwsteen 2 (Klantcontactvisie & Strategie)** spant alle 4 kolommen
  (`grid-column: 1 / 5`): De volle gridbreedte, zelfde breedte als de
  stippellijn eromheen.

## Kleuren

Uitsluitend de bestaande categorietokens uit `stylesheet.md`, geen
nieuwe kleuren:

- Overkoepelend: `--or`
- Organisatie: `--bl`
- Proces & Tech: `--pu`
- Mens: `--gr`
- Fundament: `--fu`

## Wat strakker moet dan de schets

De schets diende als vertrekpunt voor de indeling, niet voor de
vormgeving. Er is een eerste bouwpoging geweest waarbij elk blok volledig
gevuld was met de verzadigde categoriekleur, met een zware drop-shadow en
een groot halftransparant nummer. Dat is te dominant en wijkt af van hoe
kleur elders in de app wordt ingezet. Onderstaande vervangt "gebruik de
categoriekleuren" door een exacte, niet voor interpretatie vatbare
beschrijving per staat.

### Standaardstaat: Kleur als accent, niet als vulling

Elk bouwsteen-blok is een gewone kaart, hetzelfde patroon als `.card` in
`stylesheet.md`:

- Achtergrond: Wit (`var(--bg)`), niet de categoriekleur en niet een
  getinte versie ervan.
- Rand: `border-left: 4px solid var(--accent)` (dezelfde
  `.card-accent-left`-klasse die al bestaat, met `--accent` gezet op de
  categorietoken van die rij). Verder een `1.5px solid var(--border)`
  omtrek — iets dikker dan de gewone `1px` van `.card` elders, omdat deze
  blokken kleiner zijn en dicht op elkaar staan; de rand mag hier iets
  meer gewicht hebben om de blokken los van elkaar te houden.
- Tekst: Donker (`var(--ink)` voor de naam), niet wit. Kleur is er om te
  groeperen, niet om de tekst op te laten staan.
- `border-radius`: 10px, zoals kaarten elders.
- Nummer rechtsboven: Klein en gedempt (`var(--ink-s)`, vergelijkbaar met
  de maat van `.admin-badge`), geen groot halftransparant cijfer.
- Schaduw: Geen. Vlakke kaart, net als een rustende `.card` nu ook geen
  schaduw heeft.

### Actieve staat (het blok waarvan de overlay nu open staat)

Dit is de enige plek waar de volle categoriekleur als vulling mag: Het
actief geselecteerde blok krijgt `background: var(--accent)`, witte
tekst, en het cijfer rechtsboven wordt wit op 75% dekking in plaats van
`--ink-s`. Zo blijft de vulling zeldzaam en betekenisvol (dit is wat je
nu bekijkt) in plaats van dat elk blok er zo uitziet.

### Hoverstaat

Zoals elke klikbare kaart in de app (`a.card:hover` in `stylesheet.md`):
Lichte lift (`translateY(-2px)`) plus een zachte schaduw, en
`cursor: pointer`. Verder niets, geen kleurverandering. Bevestigd zo
gebouwd.

### Overig

- **Stippellijn-kader** om de grid heen, steeds `2px dashed var(--or)`,
  met **afgeronde hoeken** (`border-radius: 10px`, zelfde maat als de
  kaarten) — geen scherpe 90°-hoeken. Altijd oranje, ook langs de
  Fundament-rij (antraciet), niet de categoriekleur van die rij. Boven-
  en onderrand lopen niet om blok 1
  en 15 heen, maar lopen er precies horizontaal doorheen, op het
  verticale midden van die twee kaarten. Dit wordt gemeten met
  JavaScript (positie van kaart 1 en 15 na renderen), niet met een
  gewone CSS-`border`, omdat `border` geen dwarsdoorsnede door de
  kaarten heen kan maken.
  **Links en rechts sluit het kader niet strak aan tegen de buitenste
  rand**, maar houdt daar `0.75rem` marge overheen — zelfde reden als
  bij elke andere ruimte tussen elementen in de app: een kader dat
  precies op de rand valt oogt te krap. Rechts is die buitenste rand
  kolom 4 (bepaald door de breedte van bouwsteen 2). **Links is dat niet
  de kaartrand van kolom 1, maar de linkerrand van de perzikvlakken**
  (zie "Achtergrondvlak" hieronder) — die steken verder naar links uit
  dan de kaarten zelf, dus het kader moet ook om hén heen vallen, niet
  er dwars doorheen. Deze marge is puur horizontaal; de verticale
  positie van boven-/onderrand blijft zoals hierboven beschreven, door
  het midden van kaart 1/15.
- **Geen stip voor de categorienaam.** Alleen de naam zelf links van de
  rij, geen bullet ervoor. Geen los legenda-blok met kleurvlakken
  ernaast.
- **Gelijke celgrootte** binnen de grid-rij, vaste 4 kolommen, vaste
  hoogte van 4,75rem per kaart. Elke naam mag over 2 regels breken als
  hij niet past — geen uitzonderingsregel meer voor specifiek
  "Kennismanagement"/"Kanaalmanagement", gewoon een normale
  tekst-wrap zoals de kaart breed is. Geen minimale kaartbreedte
  nodig om 1 regel af te dwingen.
- De 2 Overkoepelend-balken en de Fundament-balk volgen dezelfde
  standaard/hover/actief-regels als de 12 grid-cellen, alleen over hun
  eigen breedte (zie "Breedte en uitlijning van de balken" hierboven).
- **Achtergrondvlak achter elke categorie-rij** (Organisatie, Proces &
  Tech, Mens — niet achter Overkoepelend/Fundament, die hebben geen
  categorie): `background: var(--or-faint)`, `border-radius: 10px`.
  **Drie losse vlakken, niet één doorlopend blok** over de 3 rijen heen.
  Dit is een harde eis, geen esthetische voorkeur: 3 zichtbaar
  gescheiden vlakken, met duidelijke witruimte ertussen — niet 3
  elementen die toevallig los renderen maar optisch aan elkaar plakken.
  Daarom expliciet een eigen, grotere marge tussen de vlakken onderling,
  los van de gewone `0.6rem` rij-gap van de grid (die geldt nog wel
  tussen de kaarten/koppen onderling; het vlak zelf krijgt de extra
  marge erbovenop). **Reken die marge uit vanaf de uitsteek-padding
  hierboven, niet als los vast getal**: minimaal twee keer die padding
  (nu `2 × 0,7rem = 1,4rem`), zodat twee aangrenzende vlakken elkaar
  nooit raken ongeacht hoe groot de uitsteek is — verander je die
  padding later, dan schuift deze marge automatisch mee. Padding rondom
  de 4 kaarten zodat het vlak zichtbaar uitsteekt (ongeveer `0.7rem`
  boven/onder/rechts).
  Altijd `--or-faint`, ook bij de Proces &
  Tech- en Mens-rij — geen getinte versie van de categoriekleur van die
  rij, om dezelfde reden als de stippellijn altijd oranje is: één
  neutrale, merkkleurige ondergrond, geen 3 verschillende tinten door
  elkaar.
  **Links loopt het vlak door tot onder de categorienaam** (dus niet
  alleen rondom de 4 kaarten, maar ook onder de labelkolom links
  ervan) — de naam staat daarmee op het vlak, niet ernaast in het wit.
  De naam krijgt daarbinnen zelf ook padding (`~1rem` links, gelijke
  maat als de padding van een kaart), zodat de tekst niet tegen de
  linkerrand van het vlak plakt maar er ruimte omheen houdt, net als in
  een kaart. De categorienaam zelf krijgt gewone tekstkleur (`var(--ink-m)`, zoals
  een neutraal label elders in de app), niet langer de categoriekleur
  (`var(--accent)`) — dat onderscheid was nooit nodig, de kleur zit al
  in de accentrand van de kaarten zelf.

## Interactie

**Definitief: Modal-overlay, niet een inline paneel.** Klikken op een
bouwsteen-blok opent de Toelichtingsmodal (`stylesheet.md`, "Modal en
Toelichtingsmodal"), dezelfde overlay als bij de toelichting bij een
bouwblok in de doorloopflow. Eén functie, één opmaak. Geen tweede
modalfunctie en geen inline stijlen bouwen.

**Afwijking om te corrigeren**: De eerste bouwpoging toont de inhoud in
een paneel dat onder de grid verschijnt, met het geklikte blok in de
actieve staat. Dat is niet de spec. Vervang dit door de modal-overlay.

Inhoud van de overlay (voor alle triggers gelijk, de volledige
beschrijving staat in `stylesheet.md`):
1. Klein label met categorie en bouwsteennummer (zie de tweede schets:
   "OVERKOEPELEND · BOUWSTEEN 1"), stijl zoals `.eyebrow` in
   `stylesheet.md`, kleur de categorietoken.
2. Naam van de bouwsteen (kop).
3. Centrale vraag, met een linker accentbalk in de categoriekleur en een
   klein label "CENTRALE VRAAG" erboven, zoals de tweede schets al
   toont. Dat patroon is goed, overnemen.
4. Beschrijving (`visie-coniche.md`) als gewone body-tekst eronder.

Sluiten: Dezelfde `.modal-close` als elders, plus de Escape-toets en een
klik buiten de modal.

## Niet responsive

Zoals de rest van de app (CLAUDE.md, Uitgangspunten): Alleen voor
desktop-breedte. De grid blijft vast op 4 kolommen, geen wrap-logica
nodig.

---

## Open punten

- `Bouwblok.omschrijving` is nu de korte vraagzin die in de doorloopflow
  onder de bouwblok-titel staat (bijv. "Wat zijn de belangrijkste korte
  en langere termijn strategische organisatiedoelen en -plannen"). De
  langere beschrijving uit `visie-coniche.md` staat nu in
  `Bouwblok.toelichting`. Voor dit scherm is de toelichting de juiste
  tekst, niet de omschrijving. Check dat bij het bouwen niet de
  verkeerde van de twee gebruikt wordt.
- Precieze bewoording in de overlay ("Centrale vraag:" als label, of
  gewoon de vraag zelf laten spreken) nog niet vastgelegd.
