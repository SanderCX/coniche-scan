# Coniche Scan: AI-domeinenmodel, interactief overzicht

Geen eigen route: Dit is de sectie "AI in klantcontact" op de Assessment-pagina van de AI-scan (`CLAUDE.md`, sectie 3, scherm 2). Het overzicht is sinds 21 oktober 2026 een radar met acht taartpunten, analoog aan de radar op de Assessment-pagina van Volwassenheid (`bouwstenenmodel-visual.md`). Eén structureel verschil: De AI-volwassenheidsscan heeft geen categorielaag (`CLAUDE.md`, Assessment). Waar dat verschil doorwerkt staat hieronder expliciet, de rest is hetzelfde patroon en niet opnieuw uitgelegd. Design: `Claude outputs/radar/`, bord Herontwerp-AI.

## Doel

Eén visuele component, een overzicht van de 8 AI-domeinen. Beweeg je over een domein, dan zie je de centrale vraag. Klikken op een domein opent de beschrijving en de centrale vraag.

## Hergebruik van bestaande content, geen nieuwe

De Toelichtingsmodal (`stylesheet.md`, "Modal en Toelichtingsmodal"), dezelfde als in `bouwstenenmodel-visual.md`. Een klik op een domein in dit overzicht opent die modal. De doorloopflow toont dezelfde content sinds 22 oktober 2026 direct in de kop van het bouwblok (`stylesheet.md`, Doorloopflow) en heeft geen modal meer. Beide gebruiken dezelfde content (`Bouwblok.toelichting` en `Bouwblok.centraleVraag`, gevuld vanuit `visie-ai-klantcontact.md`). Eén functie en één opmaak: Geen tweede modalfunctie, geen eigen stijlen, geen content dupliceren.

## Waar dit component een plek krijgt

Sectie "AI in klantcontact" op de Assessment-pagina van de AI-scan, met daaronder de sectie "Klantcontact richting 2030", bereikbaar via de sticky sub-nav. De link "AI" in de header en de route `/ai-scan` bestaan niet meer. De beschrijving en centrale vraag per domein komen uitsluitend nog terug in de modal van dit component. **Gebouwd (21 oktober 2026)** als raster van vier kolommen kaarten in `components/assessment/AiDomeinenSectie.tsx`, met de nummercirkel in de domeinkleur (`domeinKleur`) en de accentkleur van de modal in dezelfde kleur (voorheen overal `--or`). **Radar gebouwd (21 oktober 2026, PR 160)**: De radar hieronder vervangt dat raster, zie Zo gebouwd onderaan.

## Bron voor de inhoud

Naam en volgnummer: `content-ai-scan.md`. Beschrijving en centrale vraag: `visie-ai-klantcontact.md`. In het datamodel dezelfde velden als bij de Klantcontact-scan: `Bouwblok.toelichting` en `Bouwblok.centraleVraag` (`datamodel.md`).

---

## Structuur

Drie kolommen van 280px, 536px en 280px, zoals bij Volwassenheid, met boven de radar de kaart voor de centrale vraag.

- **Midden**: De radar van 536px, met 8 taartpunten van 45° die bij −22,5° beginnen, zodat domein 1 boven staat en de rest met de klok mee loopt. Straal van de taartpunten 190px, nummercirkels van 26px op straal 226px, ringen bij score 2, 3, 4 en 5 (37,5px per stap), taartpunten op 22% vulling met een witte rand van 1,5px. Voorbeeldpolygoon zoals bij Volwassenheid.
- **Rechts**: Domein 1 tot en met 4 als rijen (`.pl`).
- **Links**: Domein 5 tot en met 8 als rijen.
- Er zijn geen groepskoppen boven de rijen, want er is geen categorielaag.
- De kaart voor de centrale vraag (96px hoog) staat boven de radar en toont standaard "Beweeg over een domein of een nummer in de radar om de centrale vraag te zien."

## Kleur

Elk domein heeft zijn eigen kleur, palet B uit `stylesheet.md` ("Domeinkleuren (AI-scan)"). De eerdere keuze voor één kleur voor alle domeinen is vervallen. Tekst in of op een domeinkleur is wit, behalve bij 5, 6 en 8 waar het `--ink` is. Het label "AI-domein 5", "AI-domein 6" en "AI-domein 8" in de modal staat in `--ink-m` in plaats van in de domeinkleur, anders is het contrast te laag. De accentbalk van de centrale vraag in de modal blijft wel in de domeinkleur.

## Interactie

- **Hover** op een taartpunt, nummer of rij: De taartpunt gaat naar 62% vulling, de andere naar 10%, de nummercirkel schaalt naar 125%, de rij krijgt een rand in de domeinkleur en de kaart toont de centrale vraag van dat domein.
- **Klik** op een taartpunt, nummer of rij opent de Toelichtingsmodal met:
  1. Het kleine label `Assessment.bouwblokLabel` ("AI-domein") met het volgnummer, stijl zoals `.eyebrow`.
  2. De naam van het domein als kop.
  3. De centrale vraag met een linker accentbalk en het label "CENTRALE VRAAG" erboven.
  4. De beschrijving als lopende tekst.

## Film en Dossier

- De sectie "Wat krijg ik" op de AI-pagina toont dezelfde twee films als bij Volwassenheid, met acht domeinen. De tweede film is de AI-variant van de Dossier-film (`Film-Dossier-AI`): Een radar met 8 taartpunten, waarin alleen de domeinen met items in het Dossier gevuld en klikbaar zijn. Een klik filtert de lijst op dat domein. De tekst spreekt van "domein", niet van "bouwblok".
- De eerste film noemt "een staaf per domein" in plaats van "per categorie".

## Koppeling met het Dossier

Besloten door Joost op 21 oktober 2026: Een Dossieritem mag aan AI-domeinen gekoppeld worden, en de Dossier-pagina toont per Assessment een eigen radar (`dossier.md`, Koppeling aan bouwblokken en Radar met filter).

## Open punten

- Precieze bewoording van het kleine label (nu "AI-domein" in `bouwblokLabel`, aanpasbaar in beheer).

## Zo gebouwd (21 oktober 2026)

`components/assessment/AiDomeinenSectie.tsx` is de radar van deze spec: Een SVG van 536px met 8 taartpunten van 45° (straal 190px, domein 1 boven, met de klok mee), nummercirkels van 26px op straal 226px, ringen bij score 2 tot en met 5, en links en rechts vier rijen (domein 1 tot en met 4 rechts, 5 tot en met 8 links) in de klassen `br-*` van de bouwstenenradar. Boven de radar staat de kaart met de centrale vraag. Hover of focus op een knooppunt, een rij of een taartpunt licht het domein op; een klik opent de Toelichtingsmodal met de categorie "AI-domein" en de domeinkleur. De voorbeeldpolygoon is vaste demodata. Het oude raster van kaarten en zijn CSS (`.ap-domeinen`, `.ap-domein`) is verwijderd.
