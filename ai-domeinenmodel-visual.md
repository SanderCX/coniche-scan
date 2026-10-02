# Coniche Scan: AI-domeinenmodel, interactief overzicht

Route `/ai-scan`. Analoog aan
`bouwstenenmodel-visual.md`, met één structureel verschil: De
AI-volwassenheidsscan heeft geen categorielaag (CLAUDE.md, Assessment).
Waar dat verschil doorwerkt staat hieronder expliciet; de rest is
hetzelfde patroon, niet opnieuw uitgelegd.

## Doel

Eén visuele component, een overzicht van de 8 AI-domeinen. Klikken op
een domein toont de beschrijving en de centrale vraag.

## Hergebruik van bestaande content, geen nieuwe

De Toelichtingsmodal (`stylesheet.md`, "Modal en Toelichtingsmodal"),
dezelfde als bij de toelichting-icoontjes ("i") per bouwblok in de
doorloopflow en als in `bouwstenenmodel-visual.md`. Het i-icoontje in de
doorloopflow en een klik op een domein in dit overzicht openen dezelfde
modal met dezelfde content (`Bouwblok.toelichting` en
`Bouwblok.centraleVraag`, hier gevuld vanuit `visie-ai-klantcontact.md`).
Eén functie en één opmaak: Geen tweede modalfunctie, geen eigen stijlen,
geen content dupliceren.

## Waar dit component een plek krijgt

**Beantwoord.** Dit ís de bestemming van de link "AI" in de 4 vaste
content-links in de header (CLAUDE.md sectie 3), route `/ai-scan`. Geen
losse leespagina met alleen tekst meer ernaast: De beschrijving en
centrale vraag per domein (`visie-ai-klantcontact.md`) komen uitsluitend
nog terug in de modal van dit component.

## Bron voor de inhoud

Naam en volgnummer: `content-ai-scan.md`. Beschrijving en centrale vraag:
`visie-ai-klantcontact.md`. In het datamodel dezelfde velden als bij de
Klantcontact-scan, geen nieuwe: `Bouwblok.toelichting` en
`Bouwblok.centraleVraag` (`datamodel.md`), nu ook gevuld voor deze 8
bouwblokken.

---

## Structuur

Eén grid, 4 kolommen × 2 rijen, geen overkoepelende of fundamentele
balken (die bestonden bij de bouwstenen omdat 2 en 1 bouwsteen buiten de
hoofdgroepen vielen; hier vallen alle 8 domeinen binnen dezelfde,
enkele laag):

| Kolom 1 | Kolom 2 | Kolom 3 | Kolom 4 |
|---|---|---|---|
| 1. Strategie en governance | 2. Data, integratie en architectuur | 3. Use-cases en automatisering | 4. Performance, monitoring en kwaliteit |
| 5. Mensen, skills en adoptie | 6. Security, risk en compliance | 7. Operating model en schaalbaarheid | 8. Klant- en kanaalervaring |

## Kleur

**Geen kleur per domein.** Er is geen categorie om een kleur aan op te
hangen, en 8 losse, verzonnen kleuren zouden een indeling suggereren die
er niet is. Alle 8 blokken gebruiken dezelfde accentkleur: `--or`. Dat is
geen nieuwe keuze, het is de bestaande fallback uit `components.css`
(`var(--accent, var(--or))`), nu voor het eerst met tekst geëxpliciteerd
in `stylesheet.md`.

## Visuele specificatie

Zelfde drie staten als `bouwstenenmodel-visual.md`, met `--or` overal
waar daar `--accent` (de categorietoken) staat:

- **Standaard**: Witte kaart (`.card`), `border-left: 4px solid var(--or)`
  (`.card-accent-left`), donkere tekst, klein gedempt volgnummer
  rechtsboven, geen schaduw. **Omtrek `1.5px solid var(--border)`**, niet
  de gewone `1px` van `.card` — zelfde afwijking en zelfde reden als
  `bouwstenenmodel-visual.md`: kleinere kaarten, dicht op elkaar in een
  grid, dus iets meer gewicht in de rand om ze los van elkaar te houden.
- **Hover**: Lift en zachte schaduw (`a.card:hover`), `cursor: pointer`.
- **Actief** (het geopende domein): `background: var(--or)`, witte
  tekst, wit/gedempt-wit volgnummer.

Gelijke celgrootte binnen de grid, vaste 4 kolommen, geen wrap-logica
(de app is niet responsive, CLAUDE.md, Uitgangspunten).

## Interactie

De Toelichtingsmodal, identiek aan die van `bouwstenenmodel-visual.md` en
aan het i-icoon in de doorloopflow (`stylesheet.md`, "Modal en
Toelichtingsmodal"). Inhoud:

1. Klein label: `Assessment.bouwblokLabel` ("AI-domein") met het
   volgnummer, bijv. "AI-DOMEIN 1" (geen categorie te noemen, die is er
   niet), stijl zoals `.eyebrow`, kleur `--or`.
2. Naam van het domein (kop).
3. Centrale vraag, linker accentbalk in `--or`, label "CENTRALE VRAAG"
   erboven.
4. Beschrijving (`visie-ai-klantcontact.md`) als body-tekst.

---

## Open punten

- Precieze bewoording van het kleine label (nu "AI-domein" in
  `bouwblokLabel`, geen definitieve tekst; aanpasbaar in beheer).
