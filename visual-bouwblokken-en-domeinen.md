# Coniche Scan: Bouwblokken en AI-domeinen, interactief overzicht

Twee varianten van hetzelfde component: Een radar met onderaan of naast de radar de bouwblokken of domeinen als rijen. Het is een sectie op de Assessment-pagina (`schermen.md`, Assessment-pagina), geen eigen route en geen eigen hero.

| Variant | Sectie | Assessment-pagina van | Elementen |
|---|---|---|---|
| Bouwblokken | "De 15 bouwblokken" | Klantcontact Volwassenheid en Zorg | 15 bouwblokken in 5 groepen |
| AI-domeinen | "AI in klantcontact" | AI-volwassenheidsscan | 8 AI-domeinen, geen groepen |

Het verschil is de categorielaag: De AI-volwassenheidsscan heeft die niet (`CLAUDE.md`, Assessment). Alles wat niet bij de variant staat, geldt voor beide. Het ontwerp staat in `Claude outputs/radar/` (borden `Herontwerp-Volwassenheid` en `Herontwerp-AI`). Het ontwerp is de bron voor de opmaak, deze spec voor het gedrag.

## Doel

Eén visueel overzicht van alle bouwblokken of domeinen. Beweeg je over een element, dan staat de centrale vraag in de kaart erboven. Een klik opent de beschrijving en de centrale vraag.

## Plek

- De sectie staat op de Assessment-pagina en is bereikbaar via de sticky sub-nav. Bij Volwassenheid en Zorg staat ze onder de sectie Visie. Bij de AI-scan staat ze boven de sectie "Klantcontact richting 2030".
- Er is geen link "Bouwblokken" of "AI" in de header en geen route `/bouwblokken` of `/ai-scan`.
- De beschrijving en de centrale vraag komen uitsluitend terug in de modal van dit component.
- Binnen een persoonlijke respondent-link (via "Over deze scan" op Mijn metingen) gaat de toegangscode mee via `?code=`, zodat het logo en de exit-actie "← Terug naar Mijn metingen" naar de juiste plek verwijzen.
- Het component is alleen voor desktopbreedte (`CLAUDE.md`, Uitgangspunten).

## Bron voor de inhoud

| Gegeven | Bouwblokken | AI-domeinen |
|---|---|---|
| Naam, categorie en volgnummer | `content-klantcontact-volwassenheid.md` | `content-ai-scan.md` |
| Beschrijving en centrale vraag | `visie-coniche.md`, deel 2 | `visie-ai-klantcontact.md` |
| Velden in het datamodel | `Bouwblok.toelichting` en `Bouwblok.centraleVraag` | Dezelfde velden |

De modal gebruikt de toelichting (`Bouwblok.toelichting`), niet de omschrijving (`Bouwblok.omschrijving`). De omschrijving is de korte vraagzin die elders bij het bouwblok staat.

## Gedeeld: Opbouw

- **Stage.** Drie kolommen in de container van de pagina (1096px bij een venster van 1240px): Links 280px, midden 536px, rechts 280px, verticaal gecentreerd. In het midden staat de radar (536 bij 536px).
- **Radar.** Eén taartpunt per element, met de klok mee vanaf boven, straal 190px, gevuld met de kleur van het element op 22% dekking en een witte rand van 1,5px. Ringen bij score 2, 3, 4 en 5 (wit op 70%, 37,5px per stap, score 5 op straal 150px). Een veelhoek in `--or` met voorbeeldscores, zonder getallen, zodat het een radar lijkt. Dit zijn geen echte scores.
- **Nummer.** Buiten elke taartpunt, op straal 226px, staat het nummer in een cirkel van 26px in de kleur van het element.
- **Rijen.** De elementen staan als rijen links en rechts van de radar (klasse `.pl`).
- **Kaart met de centrale vraag.** Boven de stage, gecentreerd, hoogstens 720px breed, 96px hoog, `--bg-mid`, 1px rand, 10px radius, padding 16px 24px. Zonder hover staat er een label en een uitnodigende zin, bij hover staat er "n · Naam" (label, 12px, hoofdletters) met de centrale vraag (18px, regelhoogte 26px).

## Gedeeld: Hover, focus en klik

- **Hover** op een rij of een nummer (beide werken hetzelfde): De taartpunt gaat naar 62% dekking en de andere taartpunten naar 10%. De rij krijgt een rand in de kleur van het element en een ring van 2px op 20%. Het nummer in de radar wordt 1,25 keer zo groot. De kaart toont de centrale vraag. Focus met het toetsenbord doet hetzelfde als hover.
- **Klik** op een taartpunt, een nummer of een rij opent de Toelichtingsmodal (`stylesheet.md`, "Modal en Toelichtingsmodal" en Toelichtingsmodal, opbouw). In het ontwerp staat de modal over de sectie, in de app is het de gewone overlay over de hele pagina. Eén functie en één opmaak: Geen tweede modalfunctie, geen eigen stijlen, geen content dupliceren.
- **Sluiten.** Met de ronde sluitknop rechtsboven, met de Escape-toets of met een klik buiten de modal.
- De doorloopflow gebruikt de modal niet. Daar staat de toelichting direct in de kop van het bouwblok (`stylesheet.md`, Doorloopflow).

## Gedeeld: Inhoud van de modal

1. Kop: Het kleine label met het volgnummer (stijl `.eyebrow`), de naam als titel. Bij de bouwblokken staat daaronder de categorie in hoofdletters in de categoriekleur.
2. De centrale vraag met een linker accentbalk in de kleur van het element en het label "CENTRALE VRAAG" erboven.
3. De beschrijving als lopende tekst.

Het kleine label is `Assessment.bouwblokLabel` ("Bouwblok" of "AI-domein", aanpasbaar in beheer).

## Variant: Bouwblokken (Volwassenheid en Zorg)

- **Radar.** Vijftien taartpunten van 24°, de n-de op `(n - 1) × 24°` vanaf boven.
- **Groepen.** Links Mens (bouwblok 11 tot en met 14) en Fundament (15). Rechts Overkoepelend (1 en 2) en Organisatie (3 tot en met 6). Onder de radar, over 536px breed in twee kolommen, Proces & Tech (7 tot en met 10).
- **Groepskop.** Een kop in hoofdletters (12px, gewicht 700, `--ink-m`) met een balk van 4px erboven in de categoriekleur en 12px ruimte. Daaronder de bouwblokken als pillen onder elkaar met 8px ertussen.
- **Pil.** Rand 1px, 10px radius, wit, padding 8px 10px. Tekst 14px met regelhoogte 18px en gewicht 600. Links een nummer in een cirkel van 22px met een rand van 2px in de categoriekleur. De tekst breekt af op meerdere regels en loopt nooit uit de pil (`min-width: 0`, `overflow-wrap: anywhere`).
- **Kaartlabel zonder hover.** "De 15 bouwblokken" met de zin "Beweeg over een bouwblok of een nummer in de radar om de centrale vraag te zien."
- **Kleuren.** Uitsluitend de categorietokens uit `stylesheet.md`:

| Groep | Token |
|---|---|
| Overkoepelend | `--or` |
| Organisatie | `--bl` |
| Proces & Tech | `--pu` |
| Mens | `--gr` |
| Fundament | `--fu` |

  Het nummer in de cirkel is wit, bij Fundament `--ink` op geel.
- **Dossier-film.** De tweede film in "Wat krijg ik" toont dezelfde radar met alleen de bouwblokken waarvoor items in het Dossier staan, gevuld en klikbaar (`help.md`).

## Variant: AI-domeinen

- **Radar.** Acht taartpunten van 45° die bij −22,5° beginnen, zodat domein 1 boven staat en de rest met de klok mee loopt. Straal van de taartpunten 190px, nummercirkels van 26px op straal 226px.
- **Rijen.** Rechts domein 1 tot en met 4, links domein 5 tot en met 8. Er zijn geen groepskoppen, want er is geen categorielaag.
- **Kaartlabel zonder hover.** "Beweeg over een domein of een nummer in de radar om de centrale vraag te zien."
- **Kleur.** Elk domein heeft zijn eigen kleur, palet B uit `stylesheet.md` (Groepskleuren, Domeinkleuren). Tekst in of op een domeinkleur is wit, behalve bij domein 5, 6 en 8 waar het `--ink` is. Het label "AI-domein 5", "AI-domein 6" en "AI-domein 8" in de modal staat in `--ink-m` in plaats van in de domeinkleur, anders is het contrast te laag. De accentbalk van de centrale vraag in de modal blijft wel in de domeinkleur.
- **Film.** De sectie "Wat krijg ik" op de AI-pagina toont dezelfde twee films als bij Volwassenheid, met acht domeinen. De eerste film noemt "een staaf per domein" in plaats van "per categorie". De tweede film is de AI-variant van de Dossier-film (`Film-Dossier-AI`): Een radar met 8 taartpunten, waarin alleen de domeinen met items in het Dossier gevuld en klikbaar zijn. Een klik filtert de lijst op dat domein. De tekst spreekt van "domein", niet van "bouwblok".

## Koppeling met het Dossier

Een Dossieritem mag aan bouwblokken of AI-domeinen gekoppeld worden. De Dossier-pagina toont per Assessment een eigen radar (`dossier.md`, Koppeling aan bouwblokken en Radar met filter).

## Open punten

- Precieze bewoording van het kleine label in de modal (nu `bouwblokLabel`, aanpasbaar in beheer).
- Precieze bewoording van het label boven de centrale vraag ("Centrale vraag:" of de vraag zelf laten spreken).
