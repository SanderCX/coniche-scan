# Coniche Scan: Bouwstenenmodel, interactief overzicht

**Status: Specificatie, klaar om te bouwen.** Losstaand van de andere
specs qua onderwerp, leunt inhoudelijk op `visie-coniche.md` en qua
componenten op `stylesheet.md`. Niets hergebruiken van de meegestuurde
schets qua stijl, die is alleen het vertrekpunt voor de indeling.

## Doel

Eén visuele component, een overzicht van alle 15 bouwstenen in hun 5
categorieën, van boven naar beneden. Klikken op een bouwsteen toont de
beschrijving en de centrale vraag.

## Hergebruik van bestaande content, geen nieuwe

De modal die opent bij een klik, is dezelfde modal die al bestaat voor
de toelichting-icoontjes ("i") per bouwblok in de doorloopflow
(`stylesheet.md`, `.modal-overlay` / `.modal-box`, CLAUDE.md sectie 3).
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

## Bron voor de inhoud

Naam, categorie en volgnummer: Zoals al doorgevoerd in
`content-klantcontact-volwassenheid.md`. Beschrijving en centrale vraag:
`visie-coniche.md` deel 2. In het datamodel: `Bouwblok.omschrijving` (of
`toelichting`, zie Open punten) en het nieuwe `Bouwblok.centraleVraag`
(`datamodel.md`).

---

## Structuur, van boven naar beneden

**1. Overkoepelend**, 2 bouwstenen, elk een balk over de volle breedte,
gestapeld:
1. Organisatiestrategie
2. Klantcontactvisie & Strategie

**2. Grid van 3 categorieën, elk 4 bouwstenen**, één categorie per rij,
4 kolommen:

| Rij (categorie) | Kolom 1 | Kolom 2 | Kolom 3 | Kolom 4 |
|---|---|---|---|---|
| Organisatie | Structuur & Sturing | Leren uit klantcontact | Financial Control | Positionering Klantcontact |
| Proces & Tech | Systemen & Tools | Workforce Management | Kennismanagement | Kanaalmanagement |
| Mens | Performance Management | Learning & Development | Employee Engagement | Leiderschap |

**3. Fundament**, 1 bouwsteen, een balk over de volle breedte:
Cultuur

Volgorde binnen elke rij van de grid: Zoals hierboven. Geen andere
volgorde nodig.

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
  categorietoken van die rij). Verder een dunne `1px solid var(--border)`
  omtrek, zoals elke kaart.
- Tekst: Donker (`var(--ink)` voor de naam), niet wit. Kleur is er om te
  groeperen, niet om de tekst op te laten staan.
- `border-radius`: 10px, zoals kaarten elders.
- Nummer rechtsboven: Klein en gedempt (`var(--ink-s)`, vergelijkbaar met
  de maat van `.admin-badge`), geen groot halftransparant cijfer.
- Schaduw: Geen. Vlakke kaart, net als een rustende `.card` nu ook geen
  schaduw heeft.

### Hoverstaat

Zoals elke klikbare kaart in de app (`a.card:hover` in `stylesheet.md`):
Lichte lift (`translateY(-2px)`) plus een zachte schaduw, en
`cursor: pointer`. Verder niets, geen kleurverandering.

### Actieve staat (het blok waarvan de overlay nu open staat)

Dit is de enige plek waar de volle categoriekleur als vulling mag: Het
actief geselecteerde blok krijgt `background: var(--accent)`, witte
tekst, en het cijfer rechtsboven wordt wit/gedempt-wit in plaats van
`--ink-s`. Zo blijft de vulling zeldzaam en betekenisvol (dit is wat je
nu bekijkt) in plaats van dat elk blok er zo uitziet.

### Overig

- **Wel een stippellijn-kader** om de grid heen, in de categoriekleur
  van de bovenste/onderste rij: Boven- en onderrand lopen niet om blok
  1 en 15 heen, maar er precies horizontaal doorheen, op de verticale
  middens. Op expliciet verzoek van Sander gebouwd; wijkt af van een
  eerdere versie van deze spec die dit uitsloot.
- **Geen los legenda-blok met kleurvlakken.** De stip-plus-label per rij
  links van de grid (zoals in de tweede schets) mag wel blijven staan,
  dat is klein en informatief, geen apart kader nodig.
- **Gelijke celgrootte** binnen de grid-rij, vaste 4 kolommen, geen
  losse breedtes per tekstlengte.
- De 2 Overkoepelend-balken en de Fundament-balk volgen dezelfde
  standaard/hover/actief-regels als de 12 grid-cellen, alleen over de
  volle breedte.

## Interactie

**Definitief: Modal-overlay, niet een inline paneel.** Klikken op een
bouwsteen-blok opent dezelfde overlay die al bestaat voor de toelichting
bij een bouwblok in de doorloopflow (`stylesheet.md`, `.modal-overlay` /
`.modal-box`). Geen nieuw modal-component bouwen.

**Afwijking om te corrigeren**: De eerste bouwpoging toont de inhoud in
een paneel dat onder de grid verschijnt, met het geklikte blok in de
actieve staat. Dat is niet de spec. Vervang dit door de modal-overlay.

Inhoud van de overlay:
1. Klein label met categorie en bouwsteennummer (zie de tweede schets:
   "OVERKOEPELEND · BOUWSTEEN 1"), stijl zoals `.eyebrow` in
   `stylesheet.md`, kleur de categorietoken.
2. Naam van de bouwsteen (kop).
3. Centrale vraag, met een linker accentbalk in de categoriekleur en een
   klein label "CENTRALE VRAAG" erboven, zoals de tweede schets al
   toont. Dat patroon is goed, overnemen.
4. Beschrijving (`visie-coniche.md`) als gewone body-tekst eronder.

Sluiten: Dezelfde `.modal-close` als elders.

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
