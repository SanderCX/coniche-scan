# Coniche Scan: Stylesheet

Enige bron voor opmaak. Twee bronnen liggen eronder: Het officiële
Coniche-merkpalet (`CON_Kleurenschema2022.pdf`) en de CSS-bestanden van de
app (`tokens.css`, `base.css`, `components.css`, `charts.css`,
`admin.css`). Die CSS-bestanden worden letterlijk gebruikt. Dit document
vat samen wat erin staat en welke keuzes daarmee vastliggen.

De app hoeft voorlopig niet responsive te zijn. Bestaande media queries
in de CSS mogen blijven staan, maar er wordt alleen op desktop ontworpen
en getest.

---

## Merkpalet

| Kleur | Hex | RGB |
|---|---|---|
| Dark Orange (PMS 165 C) | `#FF671F` | 255, 103, 31 |
| Light Orange (PMS 164 C) | `#FF7F41` | 255, 127, 65 |
| Dark Blue | `#225BA0` | 34, 91, 160 |
| Light Blue | `#3A70BF` | 58, 112, 191 |
| Dark Green | `#197F4E` | 25, 127, 78 |
| Light Green | `#38845E` | 56, 132, 94 |
| Dark Yellow | `#FFC043` | 255, 192, 67 |
| Light Yellow | `#FFCB57` | 255, 203, 87 |
| Dark Purple (PMS 274C) | `#392944` | 57, 41, 68 |
| White | `#FFFFFF` | 255, 255, 255 |
| Black | `#000000` | 0, 0, 0 |

Het merkpalet heeft geen rood. Daarom hebben de scorekleuren eigen
waarden (zie hieronder).

## Tokens

Stand van `tokens.css`, aangevuld met `--nav-h`:

```css
:root {
  --or: #ff671f;
  --or-l: #ff7f41;
  --or-faint: #fff2ec;
  --or-mid: #ffd5c0;

  --bl: #225ba0;
  --bl-l: #3a70bf;
  --bl-faint: #ebf1fb;

  --gr: #197f4e;
  --gr-l: #38845e;
  --gr-faint: #e8f5ee;

  --ye: #ffc043;
  --ye-l: #ffcb57;

  --pu: #392944;          /* Proces & Tech */
  --fu: var(--ye);        /* Fundament, merkgeel #ffc043 (gebouwd op 19 oktober 2026, was antraciet #44403c) */

  --ink: #1c1c1a;
  --ink-m: #4d4d49;
  --ink-s: #888884;

  --bg: #ffffff;
  --bg-warm: #faf9f7;
  --bg-mid: #f2f0eb;

  --border: #e8e6e1;
  --border-d: #d4d1ca;

  --r: 6px;
  --nav-h: 4.5rem;        /* vaste nav-hoogte, nodig voor de sticky sidebar */

  /* Statuskleuren voor de UI (statusbadges, afgerond-vinkje, verwijderknop) */
  --stat-red: #dc2626;
  --stat-red-faint: #fdecec;
  --stat-amber: #e8871e;
  --stat-amber-faint: #fdf2e3;
  --stat-green: #22a06b;
  --stat-green-faint: #e7f6ef;

  /* Scorekleuren, 1 t/m 5 (voorstel, zie "Scorekleuren") */
  --score-1: #dc2626;     /* rood */
  --score-1-faint: #fdecec;
  --score-2: #e8871e;     /* oranje */
  --score-2-faint: #fdf2e3;
  --score-3: #eab308;     /* geel */
  --score-3-faint: #fdf7dc;
  --score-4: #7bc043;     /* lichtgroen */
  --score-4-faint: #eef7e6;
  --score-5: #15803d;     /* donkergroen */
  --score-5-faint: #e6f2ea;

  /* Celtinten voor cellen met een getal, met tekstkleur (voorstel, zie "Drie niveaus van scorekleur") */
  --score-1-cel: #f7c6c1;  --score-1-cel-tekst: #7f1d1d;
  --score-2-cel: #fde9c8;  --score-2-cel-tekst: #6b3a00;
  --score-3-cel: #fbf0b8;  --score-3-cel-tekst: #5c4800;
  --score-4-cel: #dcefc6;  --score-4-cel-tekst: #2f5a12;
  --score-5-cel: #c3e6d2;  --score-5-cel-tekst: #0e4d30;

  /* Verschil: boven is --bl, onder is --dal */
  --dal: #c2570c;

  /* Afstanden, raster van 4px */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
  --sp-6: 24px; --sp-8: 32px; --sp-12: 48px;

  /* Kolombreedte in tabellen en matrices */
  --kolom-b: 96px;
}
```

## Categoriekleuren

- Overkoepelend: `--or`
- Organisatie: `--bl`
- Proces & Tech: `--pu`
- Mens: `--gr`
- Fundament: `--fu`

**Besloten door Joost en gebouwd op 19 oktober 2026, ontworpen in "Coniche Scan Mijn metingen" (bord Kaart en Per categorie).** Fundament wordt het merkgeel (`--ye`, `#ffc043`), zodat de vijf categorieën de merkkleurfamilies volgen: Oranje, blauw, paars, groen en geel. Daarvoor stond Fundament op antraciet, en samen met het donkere paars van Proces & Tech was dat te somber en te gelijkend. Een verdiept geel of oker is geprobeerd en afgekeurd, want dat oogde bruin.

Gevolg van geel: Het contrast met wit is 1,6. De regel dat een categoriekleur leesbaar is als tekst op wit en onder witte tekst geldt daarom niet voor Fundament.

- Fundament is alleen een vulling: Een balk, een stip, een accentrand, een rondje.
- Tekst in of bij een Fundament-vulling staat in `--ink`. Witte tekst op Fundament is niet toegestaan. Bij Proces & Tech en de andere vier blijft witte tekst op de kleur zoals nu.
- Een dunne lijn of tekst in de kleur zelf (bijvoorbeeld een kopje in de categoriekleur) gebruikt voor Fundament `--ink`. Eén uitzondering (besloten door Joost op 22 oktober 2026): Het categoriekopje in de sidebar van de doorloopflow staat voor Fundament in het merkgeel `#ffc043`, zodat het kopje dezelfde kleur heeft als de rest van de pagina. Het contrast is daar laag (ongeveer 1,6) en dat is een bewuste keuze. De eyebrow in de kop van een bouwblok blijft bij Fundament `--ink`.
- Een stip in Fundament op een lichte achtergrond heeft de witte rand van 2 px die alle stippen hebben, zodat hij zichtbaar blijft.
- Het sidebar-rondje "bezig" voor Fundament houdt de kleur en krijgt geen witte tekst of icoon.
- **Zo gebouwd**: `lijnKleur`, `tekstOpKleur` en `accentStijl` in `lib/colors.ts` zetten naast `--accent` ook `--accent-t` (tekst of lijn in de kleur) en `--accent-op` (tekst op de vulling). De sleutel `antraciet` van de categorie blijft staan omdat hij in opgeslagen data zit, alleen de hex is geel geworden.

De Light-variant van geel (`--ye-l`, `#ffcb57`) is te licht om als tweede tint te dienen en blijft ongebruikt.

**Staafdiagram per categorie (gebouwd op 19 oktober 2026).** De balken hebben de categoriekleur, zodat de grafiek dezelfde kleuren heeft als de kaarten op Mijn metingen. De klasse van een categorie staat daarmee niet meer in de balkkleur. De klassegrenzen 2,5 en 3,5 staan als grijze stippellijn (`#9a978f`) door de grafiek. De namen Basis op Orde, Uitbouwen en Sterk punt staan niet bij het staafdiagram. De legenda onder de radar legt de stippellijnen uit (`### Radar en staafdiagram op het resultaatscherm`, Legenda), zodat er rechts van de balken geen ruimte voor labels nodig is en er geen voetnoot onder de grafiek staat (besloten op 20 oktober 2026, eerder een regel van 12 px onder de grafiek). Boven de balk staat geen getal. Het getal staat in de tooltip (voorstel van 19 oktober 2026, eerder 16 px vet en daarna 14 px; beide vielen op tegenover de rest van de pagina). De tooltip verschijnt bij hover en bij toetsenbordfocus op de balk. Hij toont op de eerste regel de naam ("Organisatie") en op de tweede regel het getal met de klasse ("3,8 · Sterk punt"). De balk heeft `tabindex="0"` en een `aria-label` met naam, getal en klasse. Een tooltip is `--ink` met witte tekst, 12 px, 8 px radius en padding 8px 12px, met bij een balk een pijltje naar de balk. Onder elke naam staan de nummers van de bouwblokken van die categorie ("1–2", "3–6", "7–10", "11–14", "15", 12px `--ink-s`, besloten op 20 oktober 2026, voorheen in een legenda onder de radar). In de horizontale vorm staan ze achter de naam ("Proces & Tech · 7–10", label van 150px). Alle vijf de categorienamen staan onder hun balk, op één regel (`white-space: nowrap`, 12 px, `--ink-s`) en worden nooit overgeslagen. **Uitlijning en nadruk (besloten door Joost op 21 oktober 2026, gebouwd op 21 oktober 2026)**: De naam en de nummers van de bouwblokken eronder ("Proces & Tech" en "7–10") staan allebei horizontaal gecentreerd onder het midden van de balk, of onder het midden van de balkgroep als er twee reeksen zijn (`text-anchor: middle`), en niet links uitgelijnd. De getallen op de as (1 tot en met 5, 12px, `--ink-s`) staan rechts uitgelijnd tegen de as en hebben allemaal dezelfde kleur, ook de 1. Bij hover of focus, op de balk of via het knooppunt in de radar, krijgen de naam en de nummers van die categorie gewicht 700 in `--ink`, terwijl de andere labels naar 45% dekking gaan zoals hieronder staat. Elk label staat in een vaste kolombreedte, zodat het vet worden de balken en de andere labels niet doet verschuiven. Voor de nummers onder een categorienaam geldt hetzelfde in het diagram per domein: De nummercirkel onder de kolom is gecentreerd onder de kolom en het nummer erin is al gewicht 700. Elke categorie krijgt daarvoor minstens 104px breedte, dus de plot is 520px breed. De grafiek is nooit breder dan zijn kaart en er is geen horizontaal scrollen. Naast de radar (`### Radar en staafdiagram op het resultaatscherm`) is de kaart 643px breed bij een pagina van 1160px en past de plot ruim. Onder 640px schermbreedte wordt het diagram een horizontaal staafdiagram (naam links, balk rechts, dezelfde tooltip), zodat de namen op één regel blijven zonder te scrollen. Staat er ergens een categorie zonder naam, dan is dat een fout. De as loopt van 1 tot 5 en de balk begint op 1, zoals alle schalen van de scores. De band achter de balken (zie Scorekleur hieronder) vervalt in dit diagram.

De Light-varianten zijn beschikbaar waar een tweede tint nodig is, bijv.
bij hover.

## Scorekleuren

Elke score krijgt een kleur op een vijfstapsschaal:

| Score | Kleur | Token |
|---|---|---|
| 5 | Donkergroen | `--score-5` |
| 4 | Lichtgroen | `--score-4` |
| 3 | Geel | `--score-3` |
| 2 | Oranje | `--score-2` |
| 1 | Rood | `--score-1` |

Een gemiddelde score (bijv. 2,7) krijgt de kleur van de afgeronde waarde,
met dezelfde afronding als in CLAUDE.md sectie 1 (half-away-from-zero).
2,7 wordt dus 3, geel.

De drie classificaties vallen daar precies binnen, omdat hun grenzen (2,5
en 3,5) samenvallen met de afrondingsgrenzen:
- Basis op Orde: Rood (1) of oranje (2)
- Uitbouwen: Geel (3)
- Sterk punt: Lichtgroen (4) of donkergroen (5)

Een classificatielabel neemt de kleur van de afgeronde score over.

Gebruikt voor: Scores per bouwblok en per categorie, de overall score,
de ring van de totaalscore, de staafdiagrammen, de top 3 en de legenda. Niet
voor de antwoordopties in de vragenlijst zelf, om respondenten niet
richting een kleur te sturen.

Tekst op geel en lichtgroen is `var(--ink)`, op de andere drie wit, voor
voldoende contrast. Dit geldt voor de volle kleuren (cirkel, balk, bol).

De hexwaarden zijn een voorstel. Rood en oranje zijn gelijk aan de
bestaande statuskleuren. Donkergroen is bewust iets anders dan `--gr`
(categorie Mens), en de scorekleuren staan los van de categoriekleuren,
zodat een score nooit met een categorie verward wordt.

### Drie niveaus van scorekleur

Besloten door Joost en gebouwd op 15 oktober 2026. Een score
krijgt de kleur op drie niveaus, van zacht naar vol. Welk niveau bij welk
onderdeel hoort, ligt vast:

- **Band** (`--score-N-faint`, of de drie klassekleuren `--stat-red-faint`,
  `--stat-amber-faint` en `--stat-green-faint`): De achtergrond achter een
  balk, bol of streep op een schaal. Overal waar een score op een schaal van
  1 tot 5 (of 0 tot 100%) staat, hoort de band erachter, in de weergaven
  waarvoor `visualisatie-scores.md` hem noemt en daarnaast in het
  spreidingsdiagram en de weergave Per bouwblok van Verkennen en als twee ringen op 2,5 en 3,5 in de radar. Het staafdiagram per categorie heeft geen band maar twee stippellijnen (Categoriekleuren).
- **Cel** (`--score-N-cel`, met tekst `--score-N-cel-tekst`): De vulling van een
  cel met een getal erin: De matrix, de eerste kolom van de heatmap in Verkennen
  en de antwoorden in Antwoorden. De vijf stappen zijn zachter dan de volle
  kleuren, zodat een tabel vol getallen rustig blijft.
- **Vol** (`--score-N`): Alleen voor kleine tekens en vlakken zonder lopende
  tekst: De ring van de totaalscore (`.score-ring`), een stip, een bol, een balk, de ring in een
  totaalkaart en de marker bij een legenda-item.

Een cel met een getal gebruikt dus nooit de volle kleur. De matrix in A tot en
met E houdt de drie klassekleuren als celvulling (`#f7c6c1`, `#fde9c8` en
`#c3e6d2`, zoals nu). De vijf stappen gelden waar een cel een afgeronde score
van 1 tot 5 toont: Antwoorden en de eerste kolom van de heatmap.

| Score | Cel | Tekst in de cel |
|---|---|---|
| 1 | `#f7c6c1` | `#7f1d1d` |
| 2 | `#fde9c8` | `#6b3a00` |
| 3 | `#fbf0b8` | `#5c4800` |
| 4 | `#dcefc6` | `#2f5a12` |
| 5 | `#c3e6d2` | `#0e4d30` |

De hexwaarden van stap 3, 4 en 5 zijn een voorstel en moeten op het scherm
beoordeeld worden. Stap 1 en 2 komen uit de bestaande matrix.

### Verschil en afwijking

- **Verschil** tussen twee waarden (boven of onder het gemiddelde, stijging of
  daling, een groep tegenover de pool): Boven is blauw (`--bl`), onder is
  donkeroranje (`--dal`, `#c2570c`). Rood wordt hiervoor nooit gebruikt.
- **Cel met een verschil** (de heatmap in Verkennen, de kolom Verschil): De
  achtergrond is de kleur met een dekking die oploopt met het verschil, tot
  maximaal 35% bij een verschil van 1,0 of meer, met tekst `var(--ink)` en het
  teken (+ of −) in het getal. Bij 0 is de cel wit. Zo is een verschil nooit
  harder dan een score.
- **Afwijking van de groep** in een matrix (voorheen een zwarte rand): Een
  driehoek van 8px in de linkerbovenhoek van de cel, blauw (`--bl`) bij 0,5 of
  meer boven het gemiddelde van de rij en donkeroranje (`--dal`) bij 0,5 of meer
  eronder.
- **Oranje heeft drie betekenissen** en dat blijft zo: De merkkleur en de
  focus (`--or`), score 2 (`--score-2`) en daling (`--dal`). Een verschil gebruikt
  daarom altijd `--dal` en nooit `--or`, zodat een daling niet op de focus
  lijkt.
- **Zwart**: Er is geen zwarte vulling of rand. `--ink` is een tekstkleur en
  de kleur van dunne lijnen.

---

## Typografie

- **Lettertype**: Epilogue (400/500/600/700/800) via Google Fonts, voor
  body-tekst en koppen.
- **Accentfont**: Source Serif 4 (italic 400/600), alleen voor citaten.
  Nog niet geladen: Er staat in de app geen citaat.
- **Geen ander lettertype in de interface.** Ook `input`, `select`,
  `textarea`, `button` en `code` (bijv. een persoonlijke link) zijn
  Epilogue, vastgelegd in `base.css`. Geist Mono wordt niet meer geladen. De
  PDF-export houdt bewust Helvetica Neue / Arial
  (`export-pdf-visual-volwassenheidsscan.md`).

### Lettergroottes

Eén schaal van acht maten, allemaal even getallen in px. Er zijn geen halve
maten (geen 13,6px of 14,4px) en geen maten buiten deze lijst. Een nieuwe
`font-size` in de CSS is een fout, geen variant. De schaal staat als tokens
in `tokens.css` (`--fs-12` tot `--fs-48`) en in de Tailwind-configuratie als
enige waarden van `theme.fontSize`, zodat `text-sm` en `var(--fs-14)` altijd
hetzelfde zijn en een losse waarde zoals `text-[13px]` niet kan. Tekst in
grafieken (SVG) volgt dezelfde schaal en erft het lettertype
(`font-family: inherit`). Besloten door Joost en gebouwd op 15 oktober 2026
(`tokens.css`, `@theme` in `app/globals.css`). De PDF-export valt hier niet
onder (zie boven).

| Token | Maat | Gebruik |
|---|---|---|
| `--fs-11` | 11px | Toegevoegd op 21 oktober 2026 voor wat de specs op 11px zetten: De nummercirkel in de film van de AI-scan en de tag Nieuw op de Dossierkaart. Ter bevestiging door Joost |
| `--fs-12` | 12px | Eyebrow, labels, badges, tabelkoppen, hints, tekst in grafieken, de tweede regel van een kolomkop |
| `--fs-13` | 13px | Toegevoegd op 21 oktober 2026: De chips en pillen in het Dossier (`dossier.md`), de voorproef op de Dossierkaart en de pillen van de bouwblokken (`bouwstenenmodel-visual.md`). Ter bevestiging door Joost |
| `--fs-14` | 14px | Alle interface-tekst: Tabellen, formulieren, knoppen, invoervelden, nav, tabs, kruimelpad, pillen, schakelaars, meldingen |
| `--fs-15` | 15px | Toegevoegd op 21 oktober 2026: De punten op een Assessmenttegel en de tekst in de Toelichtingsmodal. Ter bevestiging door Joost |
| `--fs-16` | 16px | Lopende tekst |
| `--fs-17` | 17px | Toegevoegd op 21 oktober 2026: De centrale vraag in de kaart boven de radar van de bouwblokken. Ter bevestiging door Joost |
| `--fs-18` | 18px | Inleidende regel op publieke pagina's, h3, titel van modals en beheerblokken, koppen in de privacypagina en de overzichtsmodal, `.admin-main h2` |
| `--fs-24` | 24px | Kop van een bouwblok en van een Assessment-kaart |
| `--fs-26` | 26px | Toegevoegd op 21 oktober 2026 (PR 166): De titel in het detailpaneel van de Assessmentcirkel en de tekst zonder keuze. Ter bevestiging door Joost |
| `--fs-32` | 32px | Paginatitel (beheer, resultaten, voorbeeld-output), h2 op publieke pagina's |
| `--fs-36` | 36px | Getal in de `.score-ring` |
| `--fs-40` | 40px | Vervallen voor de ring. Alleen nog in gebruik als een ander onderdeel dit token noemt |
| `--fs-48` | 48px | h1 op publieke pagina's |

- **Wat er vervalt**: De tokens `--fs-xs`, `--fs-s`, `--fs-m` en `--fs-l`, de maten
  `.68rem` tot `.9rem`, `1.1rem`, `1.12rem`, `1.15rem`, `1.3rem`, `1.5rem`,
  `1.6rem`, `1.9rem` en `2.4rem`, de `clamp()` bij h1 en h2 en de tekst van 10
  tot 11px in grafieken. De uitzondering in beheer, met `--fs-s` en
  `--fs-m` allebei op 14px, geldt nu overal.
- **Modaltitel**: Altijd 18px, ongeacht waar de modal staat
  (`.modal-overlay .modal-box h2`).
- **Gewichten**: 400 (lopende tekst), 600 (labels, links, nav), 700
  (knoppen, badges, tabelkoppen) en 800 (koppen). Gewicht 500 wordt niet
  gebruikt.

**Veldhoogte.** Velden en compacte knoppen die in één rij staan, hebben
dezelfde vaste hoogte: `--control-h` (`2.5rem`, 40px), in de CSS voor
`.admin-field input`/`select` en `.btn.btn-compact`. Een knop in de nav
(`.nav-right .btn`) is compacter en volgt dit niet. Een pil (32px) staat niet
in dezelfde rij als een veld.

### Tekst in besturingselementen

Knoppen, dropdowns, invoervelden en de opties in een dropdown-menu hebben
binnen één rij of één tabel dezelfde lettermaat. De vaste regel:

- **Lettertype**: Epilogue voor alles (`font-family: inherit` op `button`,
  `input`, `select`, `textarea` en op de opties in een menu).
- **Maat**: 14px (`--fs-14`) voor alles: De knop, de Dropdown-knop, de opties
  in het menu, de `select`, het invoerveld en de pil, in een tabel
  (`.admin-table`), een filter- of actierij, de bulk-actiebalk, een los
  formulier en een modal.
- **Gewicht**: Knoppen (ook de Dropdown-knop) 700. Wat een waarde toont, dus
  de tekst in een `select`, een invoerveld en de opties in een menu, 400. Het
  label boven een veld is 12px (`--fs-12`), gewicht 700, in hoofdletters.
- **Geen afwijking per scherm.** Een knop in een tabelrij heeft dezelfde maat
  als een knop in een filterrij. Een afwijkende `font-size`, `font-weight`
  of regelhoogte op één scherm geldt als een fout, niet als een variant.

### Getallen in een cirkel of balk

Besloten en gebouwd op 20 oktober 2026 (de ring, de gestapelde balk, de knooppunten van de radar en de nummercirkels van het domeinendiagram). Epilogue heeft een grote ruimte onder de basislijn: Bij de cijfers 0 tot en met 9 ligt het midden van het cijfer (ongeveer 0,37em boven de basislijn) 0,09em boven het midden van de regel. Een getal in een gecentreerde cirkel of balk staat daardoor 1px te hoog bij 12px, 1,3px bij 14px. Elk getal dat verticaal gecentreerd moet staan, krijgt `padding-top: 0.09em` en `line-height: 1`. Dat geldt voor de segmenten van de gestapelde balk (`.qv-stapel > div`), de nummercirkels (`.cs-nr`, de knooppunten van de radar), de mini-ring en de ring van de totaalscore, en elke chip met alleen een cijfer. Een getal tussen letters op een regel (een tabel, een zin) hoeft dit niet.

### Koppen en lopende tekst

- **Koppen**: Font-weight 800 (h1/h2) of 700 (h3), line-height 1.1,
  licht negatieve letter-spacing, kleur `var(--ink)`.
  - h1 op publieke pagina's: 48px. Onder 900px 32px.
  - h2 op publieke pagina's: 32px. Onder 900px 24px.
  - h3: 18px.
  - **Paginatitel** (`.page-title`, ook `.admin-main h1`): 32px, gewicht 800.
    Voor elke pagina waar een knop of een andere actie naast de kop staat, zoals
    de voorbeeld-output en de resultaten. Een kop van 48px naast een knop
    breekt over twee regels, dus de grote h1 is alleen voor een kop die de
    volle breedte heeft.
- **Body-tekst**: 16px, line-height 1.78, kleur `var(--ink-m)`. Een
  inleidende regel op een publieke pagina is 18px.
- **Label/eyebrow**: Font-size 12px, font-weight 700, letter-spacing
  `.14em`, hoofdletters, kleur `var(--or)`. Voor kleine kop-labels zoals
  "AI Assessment" boven een scanpagina en "Voorbeeld-output" boven de
  voorbeeldpagina van een scan. De kleur is op elk scherm oranje, ook als
  de kop eronder donker is: Een eyebrow in antraciet of bruin is een fout,
  geen variant. Er is geen eigen kleur per pagina. Een categoriekleur
  geldt alleen waar de spec die voor een eyebrow met naam noemt.

## Layout

- **Border-radius**: `--r` (6px) voor knoppen, 10px voor kaarten.
- **Container**: `max-width: 1160px`, `padding: 0 2rem`.
- **Sectie-padding**: `6rem 0` verticaal.
- **Ruimte bovenaan**: Extra witruimte tussen de nav en de eerste inhoud,
  op elk scherm.
- **Nav**: `position: sticky`, vaste hoogte `var(--nav-h)`, altijd witte
  achtergrond, `3px solid var(--or)` onderrand, zachte schaduw.
  Overgenomen van de bestaande BOKS-app (`.topbar`).
- **Sidebar in de doorloopflow**: Twee losse sticky elementen onder de
  nav. De koptekst (`.flow-sidebar-koptekst`, met naam, voortgangsbalk en
  label) blijft altijd zichtbaar. De lijst met bouwblokken
  (`.flow-sidebar-lijst`) blijft zo lang mogelijk staan, maar mag aan
  het eind van een kort bouwblok alsnog wegscrollen. Zo gebouwd en
  akkoord.
- **Voortgang op smalle schermen**: Onder 900px toont
  `.flow-mobiel-voortgang` een compacte, sticky voortgangsbalk. Bestaat
  al, verder geen werk aan zolang de app niet responsive hoeft.

### Afstanden

Besloten op 15 oktober 2026, gebouwd in de onderdelen die zijn aangeraakt
(de pil, Verkennen, de matrix en de kolomkoppen). Een raster van 4px. Marges, paddings en
tussenruimtes in nieuwe en aangeraakte onderdelen zijn een van deze stappen,
als tokens in `tokens.css`: 4px (`--sp-1`), 8px (`--sp-2`), 12px (`--sp-3`),
16px (`--sp-4`), 24px (`--sp-6`), 32px (`--sp-8`) en 48px (`--sp-12`).

- **Vaste afstanden bij besturing**: 8px tussen pillen en tussen een label
  en zijn rij, 24px tussen twee blokken met besturing en 24px onder een rij
  met pillen of een schakelaar tot de inhoud.
- **Bestaande waarden**: Waarden als `.82rem`, `1.7rem`, `.6rem`, `1.2rem`
  en `1.8rem` liggen niet op het raster. Ze gaan mee naar het raster zodra
  een onderdeel wordt aangeraakt. Er komt geen losse omzetting van de hele
  CSS (`backlog.md`).


## Logo

- **Nav**: `<img>`, hoogte 44px, breedte automatisch.
- **Footer**: Voorlopig geen logo, alleen tekst (zie Open punten). De
  class `.mini-logo` (28px) staat klaar.
- Altijd als los bestand (SVG of PNG) uit `/assets/`, niet als
  CSS-achtergrond.
- **Linkgedrag, contextafhankelijk** (stond hier nog niet, zie CLAUDE.md
  sectie 3): Op de publieke schermen gaat het logo naar `#/`. Zodra een
  respondent binnen zijn persoonlijke link zit, gaat het logo naar "Mijn
  metingen" in plaats van naar de publieke homepage.

### Browsericoon (favicon)

Het icoontje in het browsertabblad, de bladwijzers en het beginscherm van een
telefoon is het mini-icoon van Coniche, dus niet het volledige logo met tekst.

- **Bronbestanden**: Staan klaar in `afbeeldingen/`, getraceerd uit de
  Photoshop-versie `CON_C_Icon_DEF_Oranje.psd` (kleur `#ff671f`, gelijk aan
  `--or`):
  - `coniche-icoon.svg`: vierkant, met een marge van ongeveer 8% rondom, de
    bron voor alle favicon-formaten.
  - `coniche-logo-c.svg`: dezelfde vorm zonder marge, voor ander gebruik.
  - `favicon.ico`, `apple-icon.png` en `icoon-512.png`: de afgeleide formaten.
- **Bestanden in de app** (Next.js pakt deze namen vanzelf op en zet de
  `<link>`-tags zelf):
  - `app/icon.svg`: kopie van `coniche-icoon.svg`.
  - `app/favicon.ico`: 48 × 48 px (met 32 en 16 erin) voor oudere browsers en
    programma's die het vaste adres `/favicon.ico` opvragen.
  - `app/apple-icon.png`: 180 × 180 px, voor iPhone en iPad, op een witte
    achtergrond (`var(--bg)`) zonder transparantie. iOS maakt zelf de
    afgeronde hoeken.
- **Optioneel, later**: 192 × 192 en 512 × 512 px PNG met een
  `manifest.webmanifest`, alleen als de app installeerbaar moet worden. Nu niet
  nodig.
- **Tabbladtitel**: Elke pagina heeft een titel in de vorm
  `<Paginanaam> | Coniche Scan`. De titel hoort bij dit icoon en staat nu nergens
  in de spec.
- **Test**: Kijk in Chrome, Safari en Firefox. Browsers bewaren favicons lang;
  ververs hard (Ctrl+F5) of open een privévenster voordat je oordeelt.

---

## Componenten

### Knoppen

Standaardmaat: `border-radius: var(--r)`, `padding: .82rem 1.7rem`,
`font-weight: 700`, `font-size: var(--fs-14)`.

- `.btn-or`: Primair. Gevuld `var(--or)`, witte tekst, hover `var(--or-l)`
  met lichte `translateY(-1px)`.
- `.btn-outline`: Secundair op een lichte achtergrond. Witte vulling
  (`var(--bg)`), `2px solid var(--or)`, tekst `var(--or)`. Bijv.
  "Annuleren" naast "Opslaan". Oranje rand en tekst maken de knop
  herkenbaar als knop en onderscheiden hem van een invoerveld, dat een
  grijze rand heeft. Hover: Vulling `var(--bg-warm)`, rand en tekst
  ongewijzigd. De gevulde varianten (`.btn-or`, `.btn-danger`, `.btn-w`)
  blijven ongewijzigd.
- `.btn-outline-w`: Secundair op een donkere of foto-achtergrond. Witte
  rand (`2px solid rgba(255,255,255,.5)`), transparant.
- `.btn-w`: Op een oranje achtergrond. Witte vulling, oranje tekst.
- `.btn-danger`: Destructieve acties zoals verwijderen. Gevuld
  `var(--stat-red)`, witte tekst, hover iets donkerder. Geen rode
  outline-variant.
- **Disabled**: `background: var(--bg-mid)`, tekst `var(--ink-s)`, rand
  `var(--border)`, `cursor: not-allowed`. Geldt voor elke variant.
- `.btn-compact`: Kleinere maat (`height: var(--control-h); padding: 0 1rem; font-size: var(--fs-14)`)
  voor knoppen in de nav en in bulk-actiebalken, zoals "N geselecteerd"
  met Exporteren en Verwijderen, en voor een knop die naast een
  `.admin-field`-invoerveld in dezelfde rij staat (bijv. "+ Meting
  plannen" naast het Label-veld) — de vaste hoogte `--control-h`
  (40px) is bewust gelijk aan die van een `.admin-field input`/`select`
  ernaast (gemeten: 40px voor beide), geen losse afstemming per rij nodig. **Selector in de code is `.btn.btn-compact`, niet los
  `.btn-compact`**: Bij gelijke specificiteit met de algemene `.btn`-regel
  wint anders de regel die later in het bestand staat, ongeacht welke
  klasse "bedoeld" specifieker is — met los `.btn-compact` kreeg elke
  compacte knop buiten `.nav-right` stilzwijgend de volle `.btn`-maat.

**Gelijke hoogte voor elke knopvariant.** Elke `.btn` heeft een `2px`
rand, bij de gevulde varianten (`.btn-or`, `.btn-danger`, `.btn-w`)
transparant, en `line-height: normal`. Zonder rand is een `.btn-outline`
4px hoger dan een gevulde knop ernaast, en een `<a class="btn">` erft
anders de regelhoogte 1.78 van de body-tekst en wordt hoger dan een
`<button>`. Ook zonder gevolgen voor de hoogte: Een pijltje in een knop
(Dropdown-knop) staat in een eigen element met `line-height: 0`, een icoon
in een knop is niet groter dan de tekstregel (14px), en de wrapper van een
Dropdown-knop is `inline-flex` zodat hij niet hoger is dan zijn knop.

**Knoptekst staat op één regel.** Elke `.btn` heeft `white-space: nowrap`
en `flex-shrink: 0`, en een pijl (`←`, `→`) staat in dezelfde regel als
het label, nooit erboven of eronder. Een knop heeft geen vaste breedte of
hoogte buiten `--control-h` bij `.btn-compact`. Staat een knop naast een
kop in een flexrij (zoals "← Terug" rechts van de titel op een
publieke pagina), dan zorgt de kop voor ruimte (`min-width: 0`, mag
afbreken) en niet de knop. Een knop die door te weinig ruimte over twee
regels loopt of smaller wordt dan zijn tekst, geldt als een fout.

**Formulierelementen krijgen niet de line-height van lopende tekst.**
`input`/`select`/`textarea`/`button` erven anders `body`'s
`line-height: 1.78` ongelijk (`<select>` negeert dat als enige, de
andere drie wel), wat bij gelijke padding/font-size toch merkbaar
verschillende hoogtes gaf. Vaste `line-height: normal` op alle vier in
`base.css` regelt dat: Een `.admin-field select` en het `input` ernaast
komen daardoor vanzelf op (vrijwel) dezelfde hoogte uit.

**Gelijke breedte**: Knoppen die samen in één rij staan, krijgen allemaal
de breedte van de breedste knop in die rij. Dat geldt voor actierijen en
ook voor filterknoppen zoals de periodekeuze in het Audit-log (Vandaag,
7 dagen, 30 dagen, 90 dagen, Alles, Aangepast). Knoppen op eigen
tekstbreedte plus padding geven een onrustig beeld.

- Rij: `display: inline-grid; grid-auto-flow: column;
  grid-auto-columns: 1fr; gap: .5rem`. Alle kolommen worden zo even breed
  als de breedste inhoud.
- De tekst staat gecentreerd. Elke knop houdt zijn eigen variant (de
  actieve periode blijft gevuld, de rest `.btn-outline`).
- Het geldt per rij, niet voor alle knoppen op een pagina. Breekt de rij
  op smalle schermen af naar meerdere regels, dan is de breedste knop per
  regel leidend.

Knoppen die onder elkaar staan, bijvoorbeeld "Verwijderen" en "Verlengen"
in de actiekolom van een lijst, krijgen ook dezelfde breedte: Die van de
breedste knop in die stapel (bijv. een kolom met `display: grid` en
`justify-items: stretch`, of een gedeelde `min-width`). Ook dat geldt
per stapel, niet voor alle knoppen op een pagina. Elke knop houdt zijn
eigen variant (een rode "Verwijderen" naast een outline-knop "Verlengen").

### Dropdown-knop

Nieuw, nog niet eerder gespecificeerd. Voor acties met meerdere opties
onder één knop, zoals "Exporteren" op de resultatenpagina (CLAUDE.md
sectie 3): Eén knop in de gewenste variant hierboven (meestal
`.btn-outline` of `.btn-compact`, niet `.btn-or`, want dit is meestal
geen primaire actie), met een klein pijltje. Bij klikken opent een
menu direct eronder, links uitgelijnd met de knop: Witte achtergrond,
`1px solid var(--border)`, `border-radius: var(--r)`, zachte schaduw
(zelfde als een gehoverde kaart). Elke optie in het menu is een rij met
`padding: .6rem 1rem`, tekst `var(--ink)`, hover `background:
var(--bg-mid)`. Sluit bij een klik buiten het menu of op een optie.

**Eén pijltje overal.** Het pijltje is een gevulde, kleine chevron
(een driehoek met de punt naar beneden, `.65rem` breed), niet een dunne
lijn-chevron. Dezelfde chevron staat in de Dropdown-knop en in elke
`select` (zie Formulieren, Dropdowns). Kleur: de kleur van de tekst ernaast,
dus `var(--or)` in een outline-knop en `var(--ink-m)` in een select. Het
pijltje staat `.5rem` achter de tekst. De rechter padding van de knop is
even groot als de linker.

**Accountmenu in beheer.** Het Accountmenu (`beheerpagina.md`, Accountmenu)
is een Dropdown-knop als `.btn-outline .btn-compact` met het e-mailadres als
label, uiterst rechts in `.nav-right`. Omdat de knop aan de rechterrand
staat, is het menu rechts uitgelijnd met de knop en niet links, anders loopt
het buiten het scherm.

- **Eerste rij** (e-mailadres en rol): Niet klikbaar, `var(--ink-s)`,
  `--fs-14`, zonder hover.
- **Scheidingslijn** boven "Uitloggen": `1px solid var(--border)`, met
  `.25rem` ruimte boven en onder.
- **Actieve staat**: Zolang een pagina onder Instellingen open is, heeft de
  knop een achtergrond `var(--or-faint)`, met rand en tekst ongewijzigd in
  `var(--or)`. De rij "Instellingen" in het menu heeft dan dezelfde
  achtergrond, tekst `var(--or)` en gewicht 700, met `aria-current="page"`.
  Zonder actieve pagina is de knop zoals elke `.btn-outline`.
- **Mijn account**: De rij opent een modal (`Modal`, zoals "Mijn gegevens"). De
  rij zelf heeft geen actieve staat.

### Badges

- `.hero-tag`: Kop-label. Gevuld `var(--or)`, witte tekst, hoofdletters,
  `border-radius: 3px`.
- `.g-badge`: Tag onder een kop, ook voor de bouwblok-tags. Achtergrond
  `var(--or-faint)`, oranje tekst, `border-radius: 100px`, rand
  `var(--or-mid)`.
- `.admin-badge`: Status van een respondent. `.status-afgerond` groen,
  `.status-bezig` amber, `.status-uitgenodigd` blauw.
- **Rolbadge** (vervangt de vaste, zwarte badge "Beheer" naast het logo):
  Toont de rol van de ingelogde Gebruiker, dus alleen Admin of
  Consultant. Die rol is bij het aanmaken van de Gebruiker gezet
  (`beheerpagina.md`, punt 9). De badge staat alleen aan de beheerkant.
  Gevuld met de bijbehorende rolkleur (zie Rolkleuren hieronder), witte
  tekst, verder zelfde vorm als `.hero-tag` (hoofdletters,
  `border-radius: 3px`). Lead en Respondent hebben geen Rolbadge, want ze
  loggen niet in op beheer. Hun rol volgt uit de Organisatie (zie
  Lead-badge hieronder).

- **Lead-badge in een respondentenlijst** (bijv. `beheerpagina.md`,
  punt 6a: de chip "LEAD" naast de naam van een respondent met de
  Lead-rol). **Niet hetzelfde als de Rolbadge hierboven**: De Rolbadge
  toont vanuit welk perspectief jíj het scherm bekijkt (één badge, bij
  het logo); dit toont een eigenschap van de respondent in die rij
  (mogelijk meerdere per lijst). Zelfde rolkleur (Lead = paars,
  `--pu`), zelfde vorm als `.hero-tag`/Rolbadge (hoofdletters,
  `border-radius: 3px`, witte tekst).

**Rolkleuren**: Los van de categoriekleuren (CLAUDE.md sectie 2), maar
hergebruikt vier van dezelfde merkkleuren (geel en antraciet blijven
ongebruikt voor rollen):

| Rol | Kleur | Token |
|---|---|---|
| Admin | Blauw | `--bl` |
| Consultant | Oranje | `--or` |
| Lead | Paars | `--pu` |
| Respondent | Groen | `--gr` |

### Knoppen en links

**Een actie is een knop, geen link.** Alles wat iets uitvoert of opent op een
formulier, in een modal of in een lijstrij is een `.btn`, dus ook "Kopieer
link", "Openen", "Vragenlijst sturen", "Standaardtekst herstellen" en
"Bekijk Respondent". Secundaire acties gebruiken `.btn-outline
.btn-compact`.

**Een link is alleen voor navigatie.** Dat zijn het kruimelpad, de links in
de header en de footer (inclusief de exit-actie
"← Terug naar ...") en een verwijzing binnen lopende tekst naar een andere
pagina, zoals de privacypagina in de toestemmingstekst. Een link is oranje
(`var(--or)`) zonder onderstreping, met onderstreping bij hover.

**Knoppenrij.** Meerdere compacte acties naast elkaar in een rij, bijvoorbeeld
"Kopieer" en "Openen" achter de persoonlijke link, staan als `.btn-outline
.btn-compact` met een tussenruimte van `0.5rem`. Ze zijn gelijk van hoogte
(`var(--control-h)`) en er staan geen scheidingstekens tussen. Staat er een
`<select>` in dezelfde rij, dan is dat een compacte variant van
hetzelfde formaat, niet het volle `select.field` uit Formulieren hieronder.

**Knop in een lijstrij.** Een knop in een rij van een lijst of tabel
("Bekijk", "Meer") staat in een eigen laatste kolom, rechts uitgelijnd en
verticaal gecentreerd in de rij. De knop staat dus op elke rij op dezelfde
plek, ongeacht hoe lang de tekst in de kolom ervoor is, en staat nooit
direct achter die tekst. Dat geldt voor elke lijst, ook de audit-log.

### Assessment-icoon

Het icoon van een Assessment, getoond op de kaart bij "Kies jouw
assessment" en op de landingspagina (`Assessment.icoon`, `datamodel.md`).
De SVG's staan in de map `afbeeldingen/` naast de specs, met een
overzichtsblad (`assessment-iconen.svg` en `.png`) en per icoon een
bestand `assessment-icoon-<sleutel>.svg`. De code bewaart ze onder
`ASSESSMENT_ICONS`.

| Sleutel | Beeld | Assessment |
|---|---|---|
| `target` | Doel: twee ringen met een punt, lijntekening | Klantcontact Volwassenheid |
| `sparkle` | Schittering: vierpuntige ster, gevuld | AI-volwassenheid |
| `heart` | Hart, lijntekening | Zorgscan |
| `cross` | Plusteken, lijntekening | Klantcontact Quickscan – Ziekenhuis |
| `gauge` | Halve meter met een bliksemflits als wijzer: Een lijnboog (`M6 19a8.5 8.5 0 1 1 12 0`) en een gevulde flits (`M12.7 6 10.2 10.8H12.1L11.3 16l2.8-6.6h-1.9Z`, 38° gedraaid om het midden (12, 13)) die vanuit het draaipunt naar rechtsboven wijst; bronbestand `afbeeldingen/assessment-icoon-gauge.svg` | Spanningsmeter (voorstel van 21 oktober 2026, gebouwd op 21 oktober 2026, `AssessmentIcons.tsx`) |

- **Opbouw**: Een rond vlak in `var(--or-faint)` met daarin het icoon in
  `var(--or)`. Lijntekeningen hebben een lijndikte van `1.75` op een
  raster van 24 bij 24, met afgeronde uiteinden en hoeken. Dat raster is
  tussen 60% en 67% van de diameter van het rondje, dus er blijft ruim
  een rand rondom over.
- **Op Mijn metingen**: Rond vlak van 48 px met een icoon van 30 px, zie
  `visualisatie-mijn-metingen.md`.
- **Grootte**: `2rem` voor het icoon zoals het in de lopende UI staat
  (zie Typografie). De SVG's zijn schaalbaar en dus ook groter te
  gebruiken.
- **Achtergrond**: De losse SVG-bestanden in `afbeeldingen/` hebben een
  witte rechthoek als achtergrond, bedoeld als voorbeeld. In de app
  komen alleen het rondje en het icoon, zonder die rechthoek.
- **Nieuw icoon**: Een nieuw Assessment krijgt een nieuwe sleutel met een
  SVG in dezelfde stijl en kleuren, en een regel in de tabel hierboven.
  Zonder SVG bij de sleutel valt de app terug op een letterlijke emoji
  (`datamodel.md`).

### Assessmenttegel en sub-nav (besloten door Joost op 21 oktober 2026)

Ontwerp in het Design-artifact: `Home` en `Gekozen` (Spanningsmeter-artifact, volgorde E2; `Home-D` is vervallen), `Herontwerp-Volwassenheid`, `Herontwerp-AI`, `Herontwerp-Quickscan` en `Proef-Sticky`. Gedrag en inhoud staan in `CLAUDE.md`, sectie 3, scherm 1 en 2.

- **Assessmenttegel.** Een kaart (`.card`) met 32px padding en 20px tussenruimte. Bovenaan het Assessment-icoon (48px, `--or`) en de titel (24px, regelhoogte 28px, gewicht 800) naast elkaar met 20px ertussen, daaronder één zin (16px, regelhoogte 26px, `--ink-m`) en daaronder drie regels van 14px (regelhoogte 20px, `--ink-m`) met 12px ertussen. Voor elke regel staat een grijs lijnicoon van 20px (`--ink-s`, lijndikte 1,7, ronde uiteinden). Deze opbouw (icoon, titel, zin en drie regels) staat nu in het detailpaneel van de Assessmentcirkel op scherm 1, met 24px voor de titel en 16px voor de zin, en daaronder de knop "Bekijk dit assessment". Een losse tegel met een klikbaar vlak komt niet meer voor op scherm 1. Gebouwd op 21 oktober 2026: `.ac-detail` in `assessment-pagina.css`, de tegel (`.ap-tegel`) is verwijderd; de maten zijn op 21 oktober 2026 aangepast aan de maten hierboven (titel 24px, zin 16px, regels 14px).
- **Assessmentcirkel (besloten door Joost op 21 oktober 2026, variant E2; de maten en hoekpunten staan in `CLAUDE.md`, scherm 1, De cirkel).** Vijf delen van 72° in `#faf8f5` met een witte rand van 8px. Kleurwedges: drie per deel van 24° met 30% dekking en een witte rand van 1,2px. Hulpcirkels: wit, 75% dekking, 1,2px, op de scores 2 tot en met 5. De lijn: `--or`, 2,5px, scherpe hoeken (`stroke-linejoin: miter`), met een vulling van `--or` op 14% dekking; alle hoekpunten tussen score 2,5 en 3,9. De band van de Spanningsmeter: `--or` op 10% dekking met één dunne grijze rand (`#a3a19b`, 1px). De stip: 18px, `--or`, witte rand van 3px, vaste gloed `0 0 12px 3px rgba(255,103,31,.55)` en een pulse die in 1,8s tot 16px groeit en vervaagt; hij ligt op een hoekpunt van de lijn en nooit onder een label. Het label is een witte pil (94% dekking, 14px afronding, lichte schaduw). Een gekozen deel schuift 10px naar buiten (0,35s), de andere delen staan op 38% dekking en een tweede klik heft de keuze op. Het midden is een witte cirkel van 80px met het favicon (46px).
- **Sub-nav (aangepast op 21 oktober 2026, gebouwd op 21 oktober 2026, PR 153).** Een balk van 64px hoog, wit, met een boven- en een onderrand (`--line`), direct onder de nav (`position: sticky; top: var(--nav-h)`, z-index onder die van de nav). De inhoud loopt links en rechts gelijk met de container van de pagina (Layout, Container), dus niet tegen de rand van het venster. Links staat één omlijnde capsule (1px rand, volledig rond, 4px padding, 4px tussenruimte) met de pillen, zoals de groep pillen in Keuzepil en pilvormige groep: pil 34px hoog, 18px padding, 14px, gewicht 700, tekst `--ink-m`, bij hover een lichtgrijze achtergrond; de actieve pil is gevuld met `--or` en heeft witte tekst. Rechts de uitgeschakelde knop "Start assessment".
- **Kop van de Assessment-pagina en sectie-inleiding (besloten door Joost op 21 oktober 2026, gebouwd op 21 oktober 2026, ontwerp `Herontwerp-Volwassenheid` en `Herontwerp-AI`).** De kop is één regel met het icoon in een witte cirkel van 56px (schaduw `0 4px 16px rgba(28,28,26,.08)`, icoon 28px, lijndikte 1,8, `--or`) en op 20px ernaast de titel (48px, regelhoogte 56px, gewicht 800), links uitgelijnd met de container, met 56px ruimte erboven en 40px eronder. De inleidende zin onder een sectiekop (`.lead`, 18px, regelhoogte 28px, `--ink-m`) is hoogstens 880px breed met `text-wrap: pretty`, zodat een openingszin niet te vroeg afbreekt en geen losse laatste woorden krijgt; `text-wrap: pretty` staat ook op de tekst in kaarten (`.card p`). Een koppelteken in een samengestelde woordgroep ("zorg- en welzijnsorganisaties") krijgt een niet-brekende spatie (`&nbsp;`) erachter. Secties wisselen af tussen wit en `--bg-warm` met boven- en onderrand op de warme sectie.
- **Tokens.** De twee oranjetinten van de actieve pil zijn `--or-pil` (`#fff1e8`) en `--or-pil-tekst` (`#c2570c`, gelijk aan `--dal`), toegevoegd aan `tokens.css` op 21 oktober 2026.
- **Zo gebouwd (21 oktober 2026).** De tegel is `.card.ap-tegel` en de sub-nav `.ap-subnav` (`app/styles/assessment-pagina.css`), met `AssessmentCard` en `AssessmentSubNav`. De secties hebben `scroll-margin-top: 60px`, en `scroll-behavior: smooth` staat alleen aan bij `prefers-reduced-motion: no-preference`. De pillen zijn gewone ankerlinks. Het icoon in de tegel is 48px en de punten hebben een icoon van 20px.
- **Toelichtingsmodal, opbouw (besloten door Joost op 21 oktober 2026, gebouwd op 21 oktober 2026, ontwerp `Herontwerp-Volwassenheid`; het gebruik in de doorloopflow is vervallen op 22 oktober 2026 en gebouwd op 22 oktober 2026).** Gebruikt bij een klik op een bouwblok of domein in `bouwstenenmodel-visual.md` en `ai-domeinenmodel-visual.md`. Van boven naar beneden: (1) De kop met links het nummer van het bouwblok in een cirkel van 28px met een rand van 2px in de categoriekleur (12px, gewicht 700), daarnaast de naam als modaltitel (18px, gewicht 700) met daaronder de categorie in hoofdletters (12px, gewicht 700, letterafstand .08em) in de categoriekleur, en uiterst rechts de sluitknop, een ronde knop van 36px in een lichtgrijs vlak met een kruisje. Bij Fundament staat het categorielabel in `--ink-m`, omdat geel op wit te weinig contrast geeft. (2) De centrale vraag in een vlak met een balk van 4px links in de categoriekleur, `--bg-mid`, met het label "CENTRALE VRAAG" erboven (12px, hoofdletters, `--ink-s`) en de vraag in 15px, regelhoogte 24px, gewicht 600. (3) De beschrijving in 15px, regelhoogte 24px, `--ink-m`, per alinea 12px ruimte. De volgorde is dus kop, centrale vraag, beschrijving. In de doorloopflow staat dezelfde inhoud sinds 22 oktober 2026 direct in de kop van het bouwblok, zonder modal (zie Doorloopflow). Een domein van de AI-scan heeft geen categorie: het label vervalt en de accentkleur is `--or`. Het woord "Bouwsteen" staat niet meer in het label, want het nummer in de cirkel zegt dat al. **Zo gebouwd (21 oktober 2026)**: `components/ToelichtingModal.tsx` (`.tm-*` in `components.css`) vervangt de oude `Modal` met eyebrow in `BouwblokForm`, `BouwblokkenSectie` en `AiDomeinenSectie`. De tekst in de modal staat op 15px met regelhoogte 24px (`--fs-15`). Bij Fundament staat het label in `--ink-m`, bij een domein van de AI-scan geldt `--or` voor de cirkel en de balk, ook al heeft het domein een eigen kleur.

### Kaarten

Witte of `var(--bg-warm)` achtergrond, `1px solid var(--border)`,
`border-radius: 10px`, `padding: 1.8rem`. Een gekleurde rand aan één zijde
(boven of links) geeft de categorie of het type inhoud aan.

Elke klikbare kaart (`a.card`, `.assessment-card`, `.admin-row`) krijgt
bij hover een lichte lift (`translateY(-2px)`) en een zachte schaduw.

### Formulieren

`.field` geldt voor tekst-, e-mail-, wachtwoord- en getalvelden (in
`components.css` stond alleen tekst). Focus-state: Rand `var(--or)` met
een zachte ring in `var(--or-faint)`.

**Getalvelden zonder pijltjes.** Een `input[type="number"]` toont alleen de
waarde, zonder de pijltjes om hem met 1 te verhogen of te verlagen
(`base.css`). De waarde typ je in; het toetsenbordtype voor getallen blijft.

**Gelijke hoogte voor elk formulier-element.** `.field` (tekstvelden),
`select.field` (dropdowns) en knoppen krijgen dezelfde hoogte zodra ze naast
elkaar in één rij staan, bijvoorbeeld de Assessment-type-dropdown, het
Label-veld en de knop "Meting plannen". De vaste waarde is `--control-h`
(zie Typografie, Veldhoogte). Concreet gelijk: Verticale padding,
`border-radius`, randdikte en -kleur en `font-size`.

**Datumvelden.** Een `input[type="date"]` heeft dezelfde hoogte als een
dropdown (`--control-h`), met `box-sizing: border-box` en `line-height:
normal`, zodat het kalendericoon van de browser het veld niet hoger maakt.
Randdikte, -kleur, `border-radius`, padding en `font-size` (`--fs-14`) zijn
gelijk aan die van een `select`. Staat een datumveld naast een dropdown in een
filterrij (bijvoorbeeld in de Audit-log), dan staan de labels erboven op
dezelfde hoogte en beginnen de velden op dezelfde bovenrand (`align-items:
flex-start` op de rij, elk veld met label in een eigen kolom). Alleen met
gelijke veldhoogte en gelijke labelhoogte lijnen de titels van beide
elementen boven netjes uit.

**Veldenrij met labels en een knop.** Dit geldt voor elke rij waarin velden met
een label erboven naast elkaar staan, met of zonder knop erachter, zoals het
plannen van een Meting (Assessment-type, Onderdeel, Meetdatum en "+ Meting
plannen"). De rij heeft `align-items: flex-start`, nooit `flex-end` of
`center`, en elk veld staat met zijn label in een eigen kolom. Alle labels
hebben dezelfde hoogte, dus alle velden beginnen op dezelfde bovenrand. Een
knop in de rij krijgt bovenaan een lege ruimte ter hoogte van een label
(`padding-top` of een lege labelregel), zodat hij op de hoogte van de velden
staat en niet op die van de labels. Hulptekst onder één veld, zoals "Wordt:
Zuid-Nederland Zakelijk | okt 2026" onder Meetdatum, maakt de rij niet hoger en duwt de andere velden niet
omlaag. Hij staat onder de rij, of absoluut gepositioneerd onder zijn eigen
veld, zodat de kolom van dat veld niet hoger wordt dan de andere. Bij `flex-end`
zakken anders alle velden zonder hulptekst naar beneden, en staat Assessment-type
lager dan Onderdeel en Meetdatum.

**Dropdowns (`select.field`, `.admin-field select` en de compacte select in
een knoppenrij).** De pijl van de browser staat uit (`appearance: none`).
In plaats daarvan staat er een eigen chevron als achtergrondafbeelding,
dezelfde gevulde chevron als in de Dropdown-knop (zie Knoppen, Dropdown-knop):
`.65rem` breed, kleur `var(--ink-m)`, `background-position: right .875rem
center`. De chevron staat dus 14px van de rechterrand, even ver als de
tekst aan de linkerkant van de rand af staat. Rechts is de `padding-right`
`2.5rem`, zodat een lange optie niet onder de chevron doorloopt. Bij focus
krijgt het veld dezelfde rand en ring als `.field`.

### Bewerken: Op de plek of in een modal

Eén regel voor elke bewerkactie in de app. Een enkel veld bewerk je op de plek
zelf: Een potlood naast de waarde, die dan een invoerveld met "Opslaan" en
"Annuleren" wordt (de naam van een Organisatie). Zijn het twee of meer velden,
of staat er een tabel of keuzelijst in, dan opent een modal
(`.modal-box--breed`, "Opslaan" en "Annuleren" onderin): Kenmerken, KPI's
invullen, een Onderdeel wijzigen, Mijn gegevens. De pagina erachter verspringt
dan niet en het Bewerkslot blijft zichtbaar. Een Respondent-overzicht dat al
een modal is, wisselt zijn blok Gegevens naar een formulier binnen die modal en
opent geen tweede. Een knop die bewerken start heet "Bewerken" of draagt een
potlood, nooit "Wijzigen". Gebouwd op 19 oktober 2026 voor de Organisatie
(naam en korte naam), de Meting (onderdeel, meetdatum en naam), de Kenmerken, het
Onderdeel, de samenstelling, de Verkenning en de Weging, en de knoppen en titels
die "Wijzigen" heetten heten nu "Bewerken". Het menu-item "Gegevens
bekijken/wijzigen" in "Mijn gegevens" houdt zijn naam, want die staat zo in
`CLAUDE.md`, sectie 3.

### Doorloopflow

- **Layout**: Sidebar 300px, hoofdgedeelte flexibel. Het logo staat
  alleen in de nav, niet in de sidebar.
- **Sidebar** (besloten door Joost op 22 oktober 2026, ontwerp `Vragenlijst-sidebar-doorlopend`, gebouwd op 22 oktober 2026): Bovenaan de naam van de respondent en de voortgangsbalk met de regel "100% – 60 van 60 vragen". Daaronder per categorie een kopje en de bouwblokken. Het kopje is 12px, hoofdletters, gewicht 800, letterafstand .08em, in de categoriekleur (via `--accent`). Bij Fundament staat het kopje in geel (`#ffc043`, zie Categoriekleuren). Status per bouwblok: Leeg (niet begonnen), gevuld in categoriekleur (bezig), `--stat-green` (afgerond, ongeacht categorie).
  - **Actief bouwblok.** Een vlak in `#e7e4dc` met 6px radius, de naam in gewicht 700 en `--ink`.
  - **Lijn langs de actieve categorie.** Naast de categorie waarin de lezer staat loopt een lijn van 3px breed met afgeronde uiteinden in de categoriekleur, 14px links van de bouwblokken (in de marge van de sidebar). De lijn begint direct onder het kopje en loopt tot en met de onderkant van het laatste bouwblok van die categorie, met 3px marge onderaan. Alleen de actieve categorie heeft de lijn en het actieve bouwblok heeft zelf geen streepje, want het grijze vlak wijst dat aan. Bij Fundament is de lijn geel. Een eerdere variant had een streepje van 3px alleen voor het actieve bouwblok; Joost koos de lijn langs de hele categorie (idee van Sander).
  - **Zonder categorie-laag** (de AI-scan en de Spanningsmeter): Er is geen groep, dus het actieve bouwblok krijgt zelf een streepje van 3px in `--or` (bij de Spanningsmeter in de veldkleur), 14px links van het vlak, met 3px marge boven en onder de rij. Bij de Quickscan zijn de afdelingen de categorieën en loopt de lijn langs de afdeling.
- **Bouwblok-kop** (besloten door Joost op 22 oktober 2026, ontwerp `Vragenlijst-toelichting`, gebouwd op 22 oktober 2026): Een verticale accentbalk van 4px in de categoriekleur met 28px ruimte erachter, over de hele kop, die stopt onder de toelichting en niet doorloopt langs de vragen. Van boven naar beneden staan de eyebrow "{CATEGORIE} · BOUWBLOK {n}" (12px, hoofdletters, gewicht 700, letterafstand .14em, in de categoriekleur), de titel (32px, gewicht 800, bij een gewicht ongelijk aan 1 met de chip met de factor), het label "CENTRALE VRAAG" (12px, hoofdletters, gewicht 700, `--ink-s`) met de centrale vraag (18px, regelhoogte 28px, gewicht 700), en de toelichting (16px, regelhoogte 26px, `--ink-m`, niet breder dan 760px, 16px tussen de alinea's). Dit zijn `Bouwblok.centraleVraag` en `Bouwblok.toelichting`, dezelfde inhoud als in de Toelichtingsmodal. Een domein van de AI-scan heeft geen categorie: De eyebrow is dan "BOUWBLOK {n}" en toont "AI-DOMEIN {n}" (`Assessment.bouwblokLabel`), en de accentkleur is `--or`.
- **Per type** (ontwerpen `Vragenlijst-toelichting` voor de Volwassenheidsscan en de Zorgscan, `Vragenlijst-AI`, `Vragenlijst-Quickscan` en `Vragenlijst-Spanningsmeter`, besloten door Joost op 22 oktober 2026 zodat alle vragenlijsten één opmaak houden):
  - **Volwassenheidsscan en Zorgscan.** Zoals hierboven beschreven, met de vijf categorieën en de lijn langs de actieve categorie.
  - **AI-scan.** De sidebar heeft acht domeinen zonder kopjes, elk met een vinkje en de naam. De naam breekt af op een tweede regel als hij niet past. Het actieve domein krijgt het streepje in `--or`. De eyebrow is "AI-DOMEIN {n}", de kop heeft de centrale vraag en de toelichting uit `visie-ai-klantcontact.md`, en de antwoordkeuze staat in `--or`.
  - **Quickscan.** De afdelingen zijn de categorieën, met het kopje in `--or` en de lijn langs de actieve afdeling. Een afdeling die niet van toepassing is, staat grijs (`#b3b0a8`) met "· N.V.T." achter het kopje en doorgestreepte namen. Rechts van een dimensie staat het aantal beantwoorde vragen ("4/4"). De dimensies hebben geen toelichting, dus de kop van een dimensie bestaat alleen uit de balk, de eyebrow "{AFDELING} · DIMENSIE {n}" en de naam. De kop van een afdeling en de relevantievraag staan in `content-ziekenhuis-quickscan.md`, Doorloop per afdeling.
  - **Spanningsmeter.** De sidebar heeft zes velden met nummerbolletje in de veldkleur en rechts de status; het actieve veld krijgt het streepje in de veldkleur. De veldkop is die uit `visualisatie-spanningsmeter.md`, Doorloopflow.
- **Geen i-icoon en geen tags.** Het i-icoon naast de titel en de `.toelichting-link` vervallen, want de toelichting staat in de kop. `Bouwblok.omschrijving` en de tags staan niet meer in de doorloopflow (ze blijven in de data en in de beheerpagina).
- **Zo gebouwd (22 oktober 2026).** `components/BouwblokKop.tsx` (`.bouwblok-kop*` in `components.css`: balk 4px, 28px ruimte, eyebrow 12px `.14em`, titel 32px, label Centrale vraag, vraag 18px/28px/700, toelichting 16px/26px tot 760px) vervangt de kop met i-icoon in `BouwblokForm`; `ToelichtingModal` blijft voor de radar-overzichten. `Sidebar.tsx` heeft `.sidebar-categorie--actief` (de lijn, `::before` op `.sidebar-bouwblokken`, `left: -14px`, 3px breed, `bottom: 3px`), `.sidebar-bouwblok.actief` (`#e7e4dc`, 6px radius) en `.sidebar-bouwblok--streep` (de AI-scan); `SpanningSidebar` heeft hetzelfde met `--veld`. De kopjes zijn 12px, 800, `.08em` in `--accent` (bij Fundament geel). De Quickscan heeft `AfdelingKaarten` (balk, "AFDELING n", naam 32px, definitie 700px, een kaart met de relevantievraag), `AntwoordPillen` (`.antwoord-pil`, 40px, gekozen `--or`) en bij een afdeling die niet van toepassing is `.sidebar-categorie--nvt` (`#b3b0a8`, "· N.V.T.", doorgestreepte namen, alleen het eerste bouwblok kiesbaar). **Interpretaties:** (1) De eyebrow volgt `Assessment.bouwblokLabel` ("OVERKOEPELEND · BOUWSTEEN 1", "AI-DOMEIN 1", "{AFDELING} · DIMENSIE n"); de spec schrijft voor de Volwassenheidsscan "BOUWBLOK {n}", maar het datamodel zegt dat het label standaard "Bouwsteen" is. (2) Een bouwbloknaam in de sidebar breekt af op een tweede regel bij alle typen, niet alleen bij de AI-scan. (3) Bij de AI-scan geldt `--or` als accent: `categorieKleur` is `null` zonder categorienaam, zodat de kleur van het domein niet meer in de kop of de antwoordkeuze komt. (4) De regel onder de voortgangsbalk heeft een en-streepje ("100% – 60 van 60 vragen"). (5) Bij de Quickscan staat achter elke dimensie het aantal beantwoorde vragen ("4/4"), ook als de dimensie klaar is; bij de andere typen alleen als je bezig bent, zoals eerder.
- **Instructievlak**: Vlak in `var(--bg-mid)` met de vaste
  instructietekst.
- **Radiobuttons**: Rand en gevulde stip in categoriekleur (`--accent`).
- **Scans zonder categorie-laag** (bijv. de AI-Volwassenheidsscan): Overal
  waar hierboven `--accent` staat, valt dat terug op `--or` zodra er geen
  categoriekleur is om te zetten (`var(--accent, var(--or))`, al zo
  gebouwd in `components.css`). Dat is de kleurkeuze voor elk scherm dat
  bouwblokken toont zonder categorieën, niet alleen de doorloopflow, bijv.
  ook `ai-domeinenmodel-visual.md`.

### Resultaten

- `.score-ring` (besloten op 19 oktober 2026, design bord "Totaalkaart
  resultaten met ring, voorstel (19 oktober)" en `visualisatie-mijn-metingen.md`,
  Kaart met cirkel) vervangt de classificatiecirkel overal op het scherm. Eén
  component voor de totaalscore op Mijn metingen en op het resultatenscherm:
  156px, een spoor in `--bg-mid` en een boog van 14px met afgeronde uiteinden,
  beginnend bovenaan en met de klok mee. De vulling is `(score − 1) / 4` bij een
  score van 1 tot 5 en `percentage / 100` bij een percentage. De kleur van de
  boog is de volle kleur van de afgeronde score (`--score-N`) of, bij de
  Quickscan, de klassekleur (`--stat-red`, `--stat-amber`, `--stat-green`). In de
  ring staat het getal in 36px (`--fs-36`), gewicht 800, met "Totaalscore" in
  12px hoofdletters eronder. Onder de ring staat de klassenchip in de celkleur. Ring en chip staan midden onder elkaar: De chip is horizontaal gecentreerd op de verticale as van de ring, met 12px ruimte erboven, en staat altijd op één regel (`white-space: nowrap`). De klassenaam staat nooit als kale tekst en nooit linksuitgelijnd naast een gecentreerde ring.
  Een groepsstip (14px, `--ink-m`, witte rand van 2px) staat alleen waar een
  groep zichtbaar is. De PDF-export houdt zijn eigen cirkel
  (`export-pdf-visual-volwassenheidsscan.md`). **Zo gebouwd (19 oktober 2026)**:
  `components/ScoreRing.tsx` (`.score-ring` in `components.css`) is de ene
  component voor Mijn metingen (`CirkelPaneel`), het resultatenscherm
  (`ScoreCircle`, ook in de voorbeeld-output en de benchmark) en de totaalkaart van
  de Quickscan. De klasse `.classificatie-cirkel` bestaat alleen nog in de PDF.
  `--fs-36` staat in `tokens.css`, `--fs-40` is niet meer in gebruik. `ScoreRing` heeft twee kleine varianten (besloten en gebouwd op 20 oktober 2026): `mini` (44px, het getal erin in 14px, zonder label en chip, in de top 3 en bij de percentages van de Quickscan) en `tegel` (64px, het getal erin in 16px, in de tegels van `visualisatie-scores.md`, Scores in een tegel zijn een meter). Beide vullen tot de score in de volle scorekleur, zoals de grote ring.
- `.legenda` voor de legenda.
- Staafdiagram per categorie (`components/CategorieStaafdiagram.tsx`, via `CategoryBarChart`): De categoriekleur,
  zie Categoriekleuren. Het staafdiagram per domein (AI-scan, geen
  categorielaag) heeft de domeinkleur per kolom (`### Radar en staafdiagram op het resultaatscherm`, Domeinkleuren), niet meer de scorekleur.
  Radar als SVG (`### Radar en staafdiagram op het resultaatscherm`).

### Radar en staafdiagram op het resultaatscherm

Voorstel van 19 oktober 2026 (suggestie van Sander), gebouwd op 19 oktober 2026 (zie Zo gebouwd), design in `Claude outputs/resultaatkop/` (bord 1 met hover, bord 3 zonder). Op het resultaatscherm van een schaalscan staan onder de totaalkaart twee kaarten naast elkaar met 24px ertussen: "Per bouwblok" (de radar, twee vijfde van de breedte) en "Per categorie" (het staafdiagram, drie vijfde; besloten op 20 oktober 2026, eerder was de radar 480px breed en daarna een derde). Onder 1000px schermbreedte staan ze onder elkaar. Is de kaart van het staafdiagram smaller dan zijn plot (onder 500px), dan wordt het diagram horizontaal. De resultatenpagina van een Meting in beheer gebruikt in Overzicht dezelfde twee kaarten.

- **Knooppunten**: Rond de radar staat per bouwblok een cirkel van 26px met alleen het nummer van het bouwblok (12px, gewicht 700, `--ink`). De cirkel is wit gevuld en heeft een rand van 2px in de categoriekleur (Categoriekleuren). De namen van de bouwblokken staan niet in of rond de radar, want met dit lettertype en deze maat wordt dat te vol. Ze staan in de tooltip. Onder de radar staat geen legenda met categorieën (vervallen op 20 oktober 2026): De nummers van de bouwblokken staan bij de categorienaam in het staafdiagram ernaast (hieronder).
- **Vlak**: De score loopt van 1 in het midden tot 5 aan de rand (straal 130px bij een tekening van 432px, getoond op maximaal 372px breed (1,2 keer de 309px van een kaart van een derde), zodat de radar niet de hele kaart vult; besloten op 20 oktober 2026). De veelhoek heeft een lijn van 2px in `--or` en een vulling in `--or` met 18% dekking. Achter de radar heeft elke categorie een taartpunt in de categoriekleur met 20% dekking (besloten op 20 oktober 2026, voorheen 9%, wat te licht was naast de volle kleuren van het staafdiagram) en witte scheidslijnen tussen de bouwblokken. Dekking in hex als `fill: <kleur>33`. De klassegrenzen 2,5 en 3,5 staan als twee stippellijnen (`#9a978f`, 1px).
- **Hover en focus**: Bij hover of toetsenbordfocus op een knooppunt wordt de cirkel gevuld in de categoriekleur (nummer wit, bij Fundament `--ink`) en komt er een tweede ring van 2px omheen. Elk knooppunt is met Tab bereikbaar (`tabindex="0"`) en heeft een `aria-label` zoals "4, Leren uit Klantcontact, 3,2, Uitbouwen". Op een aanraakscherm opent een tik dezelfde tooltip.
- **Hover tussen radar en staafdiagram (besloten door Joost op 20 oktober 2026, gebouwd op 20 oktober 2026, design in `Claude outputs/resultaatkop/`, bord Main en bord AI-scan)**: De radar en het staafdiagram lichten elkaar op, in beide richtingen. Hover of focus op een knooppunt: De taartpunt van dat bouwblok gaat naar 50% dekking (de andere taartpunten van dezelfde categorie blijven 20%, die van de overige categorieën zakken naar 9%), de score-stip van het bouwblok verschijnt op de veelhoek, het knooppunt krijgt de volle kleur en een tweede ring, knooppunten van andere categorieën gaan naar 40% dekking, en de balk van de categorie in het staafdiagram krijgt een ring van 3px in de categoriekleur met 30% dekking terwijl de andere balken en hun labels naar 35% en 45% dekking gaan, en het label van de balk zelf (naam en nummers) vet wordt (gewicht 700, `--ink`, `Uitlijning en nadruk` bij het staafdiagram per categorie). Hover of focus op een balk: Alle knooppunten, taartpunten en score-stippen van de bouwblokken in die categorie lichten op, de rest dimt op dezelfde manier. De overgang duurt 120 ms. De tooltip staat in de grafiek waar de muis of focus is, nooit in beide (besloten op 20 oktober 2026, gebouwd op 21 oktober 2026 met `GrafiekActief.bron`): Hover op een knooppunt toont de tooltip bij de radar en laat het staafdiagram alleen oplichten, hover of focus op een balk toont hem boven de balk en laat de radar alleen oplichten. Dat geldt voor elke combinatie van radar en diagram: Het staafdiagram per categorie, het diagram per domein (AI-scan), en dezelfde twee met twee reeksen in een benchmark (View per organisatie, Per bouwblok, Per categorie, Per domein). Er is dus nooit een tooltip in de radar en in het diagram tegelijk. Een kolom of balk met twee reeksen toont één tooltip, met de naam en beide scores. De kleuren van het oplichten blijven zoals beschreven. Op een aanraakscherm geldt de laatst aangetikte staat tot een tik buiten de grafiek. Een score-stip is 10px met een witte rand van 2px, in `--or` (de reeks Organisatie) of `--ink` (de reeks Rest van de groep).
- **Radar en staafdiagram op elke plek, zonder scroll (besloten door Joost op 21 oktober 2026, gebouwd op 21 oktober 2026; aanleiding was de view van een lid in een benchmark, waar het staafdiagram horizontaal scrolde en de klassenamen bij de stippellijnen werden afgekapt)**: Een diagram scrolt nooit, niet horizontaal en niet binnen zijn kaart. Het schaalt mee met de breedte van de kaart: De SVG heeft een `viewBox` en `width: 100%`, de balken verdelen de beschikbare breedte, en de klassenamen bij de stippellijnen (Sterk punt, Uitbouwen, Basis op Orde) staan binnen de kaart, in een kolom rechts die van de plotbreedte is afgetrokken. Past een label niet, dan krijgt het een tooltip en wordt het niet afgekapt. De twee kaarten staan naast elkaar met de radarkaart op 460px en de kaart met het staafdiagram op de rest van de breedte, onder 1000px onder elkaar. De regel over hover tussen radar en staafdiagram geldt overal waar beide naast elkaar staan, dus op het resultaatscherm, de voorbeeld-output, het Overzicht van een Meting, de view van een lid en het detail van een benchmark (`benchmark.md`). Bij twee reeksen, de organisatie en de rest van de groep, lichten beide balken van de categorie en beide lijnen en stippen van de radar samen op, en de tooltip toont beide waarden met het verschil. Een test controleert bij 1280px en bij 1024px breedte dat geen kaart met een diagram een `scrollWidth` heeft die groter is dan zijn `clientWidth`.
  **Zo gebouwd (21 oktober 2026, PR 163):** Het staafdiagram per categorie (`CategorieStaafdiagram`) is HTML en CSS met of zonder tweede reeks: Het Recharts-diagram met twee reeksen is vervallen. Met een tweede reeks staan er twee balken van 24px per categorie (de organisatie in de categoriekleur, de rest van de groep in `#b8b5ad`), een tooltip boven de hoogste balk met beide waarden en het verschil (`Verschil −0,4`), beide balken lichten samen op (ring van 3px om beide), en de klassenamen staan in een kolom van 64px rechts van de plot ("Basis op Orde" breekt af in twee regels) in plaats van afgekapt buiten de kaart. De kaart `.resultaat-kaarten` heeft de radar op 460px en het diagram op de rest. De omslag naar horizontaal gaat per kaart op de **binnenbreedte** (container query, zonder padding van 48px): Zonder tweede reeks onder 560px, met tweede reeks onder 540px (de kolom met klassenamen vraagt ruimte). Bij een pagina van 1160px is de kaart 612px (binnen 564px) en staat het diagram verticaal, bij 1024px schermbreedte is de kaart 476px en staat het horizontaal. `GrafiekActief.bron` (`radar` of `diagram`) bepaalt welke grafiek de tooltip toont: Een kolom van het domeindiagram zette eerder ook de tooltip van de radar aan. Nadruk en uitlijning: De namen en nummers onder de balken staan gecentreerd, de getallen op de as hebben één kleur (`--ink-s`) en bij hover worden de naam en de nummers vet zonder dat de kolom verschuift. **Afwijking:** De test op `scrollWidth` bij 1280px en 1024px is niet gebouwd (er is geen browsertest in de repo): `lib/radar.test.tsx` controleert de opmaak (de kolombreedte van 460px, de centrering, het vet worden, de klassenamen en de afwezigheid van Recharts) en de breedtes zijn in de browser nagemeten bij 1231px en 1024px (geen kaart met `scrollWidth` groter dan `clientWidth`). De klassenamen staan alleen bij het diagram met twee reeksen: Bij één reeks legt de legenda onder de radar de stippellijnen uit, zoals besloten op 20 oktober 2026.
- **Tooltip van de radar**: Dezelfde opmaak als die van het staafdiagram (hierboven). Eerste regel in gewicht 700 met het nummer en de naam ("4 · Leren uit Klantcontact"), tweede regel met het getal en de klasse ("3,2 · Uitbouwen"). Hij staat buiten de radar, nooit over de veelhoek heen (besloten op 20 oktober 2026, eerder naast het knooppunt). Staat het knooppunt dichtbij de verticale as (minder dan 90px van het midden in een tekening van 440px), dan staat de tooltip 24px boven of onder het knooppunt met een pijltje, binnen de kaart gehouden. Staat het knooppunt verder naar links of rechts, dan staat de tooltip in de hoek van het kwadrant: Links of rechts 1,5% van de kaartbreedte van de rand, boven of onder 1% van de hoogte, zonder pijltje. Heeft het bouwblok een gewicht ongelijk aan 1, dan staat de factor erbij ("2×", `CLAUDE.md`, Weging in de resultaten).
- **Radar met twee reeksen** (`benchmark.md`, View per organisatie): Dezelfde knooppunten en tooltip. De tooltip toont onder de naam beide scores, op twee regels ("Organisatie 3,2 · Uitbouwen" en "Rest van de groep 3,6"). De tweede reeks heeft een lijn van 2px in `--ink` met streepjes (`4 3`) en een vulling in `--ink` met 8% dekking.
- **Legenda onder de radar (besloten op 20 oktober 2026)**: Onder de radar staat een regel van 12px in `--ink-s` met 16px regelhoogte, 24px tussen de items en 8px tussen lijnstukje en tekst. Elk item heeft een lijnstukje van 28px in de stijl van de lijn in de radar: "Organisatie" (`--or`, 2px, doorgetrokken), "Rest van de groep" (`--ink`, 2px, streepjes) en "Grenzen 2,5 en 3,5" (`#888884`, 1px, stippels `3 3`). De legenda is algemeen: Hij toont de reeksen die in die weergave bestaan (een tweede lijn komt er afhankelijk van het type analyse bij, zoals de benchmark) en "Grenzen 2,5 en 3,5" staat er altijd bij. De zin over de klassegrenzen onder het staafdiagram vervalt daarmee.
- **Top 3 sterktes en verbeterkansen** (voorstel van 19 oktober 2026): Onder de twee kaarten, in twee kolommen met 24px ertussen. Boven elke kolom de kop in 16px, gewicht 700. Per bouwblok een rij (10px radius, padding 12px 16px) met links de naam in 14px `--ink` en rechts de score in een kleine ring (`.score-ring--mini`, 44px, dezelfde boog als de ring van de totaalscore in de volle scorekleur, het getal erin in 14px, gewicht 700, `--ink`, zonder label; besloten op 20 oktober 2026, eerder het getal in 16px, gewicht 600). De rij heeft de tint van de afgeronde score: Achtergrond `--score-N-faint`, rand `1px solid var(--score-N-cel)` (N is 1 tot en met 5, `### Drie niveaus van scorekleur`). Een verbeterkans met een score van 3,6 is dus lichtgroen, omdat de klasse bij de score hoort en niet bij de plek in de lijst. De rijen van Sterkste afdeling en Meeste ontwikkelruimte bij de Quickscan volgen dezelfde regel met de klassekleuren (`content-ziekenhuis-quickscan.md`, Resultaten).
- **Domeinen (AI-scan, besloten door Joost op 20 oktober 2026, gebouwd op 20 oktober 2026 met een sleutel, en op 21 oktober 2026 aangepast zonder sleutel, design in `Claude outputs/resultaatkop/`, bord AI-scan)**: De AI-scan heeft geen categorielaag, dus de kleur komt van het domein. De kaart naast de radar heet "Scores per domein" en is een staand kolomdiagram (geen liggende balken en niet meer gesorteerd op score, de volgorde is 1 tot en met 8 zoals rond de radar; `Assessment.scoresPerGroepGesorteerd` geldt dus niet meer voor deze kaart). De plot is 300px hoog en nooit breder dan de kaart: Er is geen horizontaal en geen verticaal scrollen. Elk domein heeft een kolom met twee balken van 26px naast elkaar (4px ertussen): Links de Organisatie in de domeinkleur, rechts de Rest van de groep in `#b8b5ad`; zonder groepsreeks staat alleen de eerste balk. De as loopt van 1 tot 5, de klassegrenzen 2,5 en 3,5 staan als stippellijn (`#9a978f`), zoals bij het staafdiagram per categorie. Onder elke kolom staat geen naam maar een cirkel van 24px met het nummer van het domein (12px, gewicht 700, `--ink`, rand van 2px in de domeinkleur, wit gevuld). De namen staan niet onder de plot: Ze staan in de tooltip, zoals bij de nummers rond de radar (besloten op 20 oktober 2026, eerder een sleutel van twee kolommen met cirkel en naam). De plot is hoogstens 704px breed (88px per kolom, gebouwd op 21 oktober 2026: 736px met de as van 32px erbij) en staat gecentreerd in de kaart, zodat de kolommen dichter bij elkaar staan. Onder de plot staat alleen een legenda als er een groepsreeks is ("Organisatie, de kleur van het domein" en "Rest van de groep", 12px); zonder groepsreeks vervalt ook die. Hover tussen kolom, cirkel, knooppunt en taartpunt werkt zoals bij de bouwblokken (Hover tussen radar en staafdiagram). Dat omvat de regel over de tooltip: Hover op een kolom of cirkel toont de tooltip alleen in het diagram en laat de radar alleen oplichten, hover op een knooppunt toont hem alleen bij de radar en laat het diagram alleen oplichten (besloten op 21 oktober 2026, op de AI-scan stond hij nog in beide). Een kolom toont bij hover een tooltip boven de hoogste balk, met drie regels: "3 · Use-cases en automatisering", "Organisatie 2,0 · Basis op Orde" en "Rest van de groep 3,4".
- **Domeinkleuren (AI-scan, besloten door Joost op 20 oktober 2026, palet B, gebouwd op 20 oktober 2026)**: Acht kleuren in de volgorde van de domeinen, zo dat buren op de radar zo veel mogelijk verschillen. 1 `--or` (`#ff671f`), 2 `--bl` (`#225ba0`), 3 `--gr` (`#197f4e`), 4 `--pu` (`#392944`), 5 `--ye` (`#ffc043`), 6 turquoise `#1f9aa0`, 7 framboos `#d1467f`, 8 lavendel `#8a7bb8`. Tekst in of op een domeinkleur is wit, behalve bij 5, 6 en 8 waar het `--ink` is (zoals bij Fundament). Een stip of cirkel in een lichte domeinkleur krijgt de witte rand die alle stippen hebben. De kleuren 6 tot en met 8 zijn nieuw en horen bij de AI-scan; een nieuwe scan met meer dan acht groepen vraagt om een eigen besluit. Het alternatief (palet A: lichte tinten van de merkkleuren `#7fa6d6`, `#ffa072`, `#7fc2a0`) is afgevallen omdat het te veel op de bestaande kleuren leek.
- **Veldkleuren Spanningsmeter (voorstel van 21 oktober 2026, gebouwd op 21 oktober 2026 in `veldKleur` en `tekstOpVeldKleur`, `lib/colors.ts`, `visualisatie-spanningsmeter.md`, Veldkleuren)**: Zes kleuren in de volgorde van de spanningsvelden: 1 `--or` (`#ff671f`), 2 `--bl` (`#225ba0`), 3 `--gr` (`#197f4e`), 4 turquoise `#1f9aa0`, 5 `--pu` (`#392944`), 6 `--ye` (`#ffc043`). Tekst in of op een veldkleur is wit, behalve bij 6 waar het `--ink` is (zoals bij Fundament). Een stip of cirkel in geel krijgt de witte rand die alle stippen hebben. Een veldkleur is een vulling of accent en nooit de kleur van een score.
- **Niveaurondjes met nummer (voorstel van 21 oktober 2026, gebouwd op 21 oktober 2026)**: Bij "De vijf niveaus" staat per niveau een rondje van 22px in de volle scorekleur met het nummer 1 tot en met 5 erin (12px, gewicht 700, wit, bij 3 `--ink`). Gebouwd met `--ink` bij 3 en 4, volgens de regel dat tekst op geel en lichtgroen `--ink` is.
- **Spanningsmarkering (voorstel van 21 oktober 2026, gebouwd op 21 oktober 2026)**: De grootste spanning in de radar is een ring van 2px in `#c2570c` om het hoekpunt, in de tabel een pil met dezelfde rand. Een negatieve spanning staat in `#c2570c`, een positieve in `--bl`.
- **Schrijfwijze**: "AI" staat altijd in hoofdletters, ook in koppen en in een kop die uit een meervoud wordt opgebouwd: "Alle AI-domeinen", niet "Alle ai-domeinen" (besloten op 20 oktober 2026). Een weergave die "Alle {meervoud}" opbouwt uit `bouwblokEenheidMeervoud` zet dus alleen de eerste letter van een woord in kleine letters als dat woord niet met een afkorting begint, of het veld bevat de volledige schrijfwijze ("AI-domeinen").
- **Filtermodus op de Dossierpagina (voorstel van 20 oktober 2026, gebouwd op 21 oktober 2026, `dossier.md`, Radar met filter)**: Dezelfde radar met één reeks, waarin alleen de bouwblokken met zichtbare Dossieritems actief zijn. Een actief knooppunt is gevuld in de categoriekleur (nummer wit, bij Fundament `--ink`), is een knop met `aria-pressed` en filtert de lijsten Cases, Nieuws, Events en Blogs bij een klik. De andere knooppunten staan op 40% dekking en zijn niet klikbaar. Het gekozen knooppunt heeft een witte ring met daaromheen een ring van 2px in de categoriekleur, en de taartpunt van dat bouwblok staat op 50% dekking. De score-stip (10px, witte rand van 2px, `--or`) staat alleen bij de actieve bouwblokken. De verdeling rechts van de radar (rijen, balken, de gloed van de stip in de balk, de bron van de scores en de rail "In dit dossier") staat in `dossier.md`, Verdeling rechts van de radar. Zonder Meting waarvan de Lead de Resultaten mag zien ontbreken polygoon, stippen en scores, en dan ook de reeks Organisatie in de legenda. **Zo gebouwd (21 oktober 2026)**: `RadarChartView` heeft de prop `filter` (`RadarFilter`: `actief`, `gekozen`, `onKies`). Een actief knooppunt is `.is-filter` (gevuld), het gekozen bouwblok `.is-gekozen` (de tweede ring), de rest `.is-gedimd.is-inactief` met `aria-disabled` en de tooltip bij hover en focus. De veelhoek en de legenda-reeks verdwijnen als alle scores `null` zijn (`lib/dossier-radar.ts` geeft die scores alleen mee als de Lead `resultaten` heeft voor een Meting van de Klantcontact Volwassenheidsscan).
- **Soortkleuren van Dossieritems (21 oktober 2026, gebouwd op 21 oktober 2026, `dossier.md`)**: Case `--or` op `--or-faint`, Nieuws `--bl` op `--bl-faint`, Event `--gr` op `#e7f6ef`, Blog tekst `#7a5600` op `#fff6e0`. Een verlopen Event is grijs (`--ink-s` op `--bg-warm`). Gebouwd voor alle vier de soorten, met het filter op de Dossierpagina en op de kaart bij de Organisatie.
- **Wat vervalt**: De namen van de bouwblokken bij de radar en de radar-legenda met namen. De factor van een gewogen bouwblok staat in de tooltip.
- **Zo gebouwd (20 oktober 2026)**: De radar (`RadarChartView`) en de twee diagrammen delen één actieve staat (`lib/grafiek-actief.ts`: `GrafiekActief`, `staatVan` en `useGrafiekActief`), die `ResultaatKaarten` (`components/ResultaatKaarten.tsx`) bewaart en aan de radar en het diagram doorgeeft. Zonder die props heeft elk diagram een eigen staat. De sleutel van een groep is de categorie, en zonder categorielaag het bouwblok zelf (`groepSleutel`). De tooltip van de radar staat niet meer in het knooppunt maar ernaast in `.radar-vlak` (`.radar-tip`, met `--boven`, `--onder` of een hoek `--lt`, `--rt`, `--lb`, `--rb`), en alle tooltips staan in de HTML, de actieve heeft `is-zichtbaar`. De drempel bij de verticale as is 90px in een tekening van 440px, omgerekend naar de 432px van de radar. De legenda onder de radar staat in de radar zelf (`.radar-legenda`, de tweede lijn alleen met een vergelijking). Het kolomdiagram is `components/DomeinKolommen.tsx` (`.dk-*` in `charts.css`) en vervangt de liggende balken van Recharts voor een Assessment zonder categorielaag. Het sorteert op nummer, en `DOMEIN_KLEUREN` en `domeinKleur` staan in `lib/colors.ts` (de sleutels `turkoois`, `framboos` en `lavendel` staan niet in de keuzelijst van een categorie, `CATEGORIE_KLEUR_KEUZES`). De kolomsleutel wordt één kolom onder 520px kaartbreedte (container query). Het kleine getal in de nummercirkels krijgt `padding-top: 0.09em`, net als de ring en de gestapelde balk. `kleineLetter` (`lib/visualisatie.ts`) houdt "AI-domeinen" in hoofdletters.
- **Zo gebouwd (19 oktober 2026)**: `components/RadarChartView.tsx` is een eigen SVG met knooppunten als knoppen (geen Recharts meer), met de tooltip in CSS (`.grafiek-tooltip`, zichtbaar bij `:hover` en `:focus`), en de categoriekleur komt uit `BouwblokResultaat.groepKleur`. `components/CategorieStaafdiagram.tsx` is het staafdiagram met één reeks (HTML en CSS, de balken zijn knoppen met `aria-label`, onder 640px horizontaal). Het staafdiagram met een tweede reeks (de vergelijking met een groep in een benchmark) houdt Recharts, met de klassenamen aan de rechterkant. Het diagram per domein (AI-scan) wordt een eigen staand kolomdiagram met sleutel, zoals bij Domeinen hierboven (gebouwd op 20 oktober 2026, zie Zo gebouwd (20 oktober 2026)). De twee kaarten staan in `ResultsView` (`.resultaat-kaarten`, `2fr 3fr`, onder 1000px onder elkaar. Het staafdiagram wordt horizontaal met een container query op de kaart (`.resultaat-kaart` is een `container`), onder 500px kaartbreedte, naast de bestaande regel onder 640px schermbreedte) en dus ook in Overzicht van een Meting. De Top 3 heeft de rijen in de tint van de score (`scoreTint`) en de Quickscan-rijen in de tint van de klasse (`SterksteMeeste`). De kaart van de radar heet "Per bouwblok", bij de AI-scan "Per domein". De radar met twee reeksen in de benchmarkviews heeft dezelfde knooppunten en tooltip, in de kaarten van die views.

### Resultaatkop

Voorstel van 19 oktober 2026, gebouwd op 19 oktober 2026 (zie Zo gebouwd), design in `Claude outputs/resultaatkop/`. Eén kop bovenaan elk resultaatscherm van een scan: De resultaten van een respondent (scherm 6), de resultatenpagina van een Meting en de voorbeeld-output. Hij is voor de schaalscans en de Quickscan dezelfde component, met dezelfde opbouw en maten. Van boven naar beneden:

- **Eyebrow**: 12px, hoofdletters, `--or`. "Jouw resultaat" bij een respondent, "Resultaat van de Meting" bij een Meting en "Voorbeeld-output" in de voorbeeld-output.
- **Titel**: `.page-title` (32px), de naam van het Assessment, op één regel. Alleen in de voorbeeld-output staat rechts de knop "← Terug" (`CLAUDE.md`, scherm 3).
- **Subregel**: 14px, `--ink-s`, de gegevens gescheiden door " · ". Bij een respondent de naam, de Meting en de afrondingsdatum ("Joost · Meting oktober 2026 · afgerond op 15 oktober 2026"). Bij een Meting de Meting, de Organisatie en het aantal afgeronde scans.
- **Totaalkaart** (kaart, 10px radius, padding 24px 32px): Links de ring (`.score-ring`, 128px) met de score erin in 32px (`--fs-32`), gewicht 700, en eronder het label "TOTAALSCORE" in 12px (`--fs-12`) `--ink-s`, in hoofdletters met een letterafstand van `0.04em`. Het getal van 40px past niet rustig in de ring. Bij de schaalscans staat in de ring het getal ("4,1"), bij de Quickscan het percentage ("58%"). Rechts, met 32px ertussen: De klassenaam als chip (gevuld in de klassekleur met de tekstkleur van de klasse, `stylesheet.md`, Scorekleuren), daaronder bij een schaalscan de uitleg van de klasse in 14px `--ink-m` (`CLAUDE.md`, sectie 1, Classificatie), en daaronder de feiten in 14px `--ink-s`, elk op een eigen regel: "60 van 60 vragen beantwoord" of "Gemiddelde van 3 afgeronde scans" bij een schaalscan, en "4 van 4 afdelingen beoordeeld", "{punten} van {maximum} punten" en eventueel "Gemiddelde van 3 afgeronde scans" bij de Quickscan. De Quickscan heeft geen uitleg per klasse.
- **Kleur**: De ring, de chip en de rijen van de top 3 (bij de Quickscan van Sterkste afdeling en Meeste ontwikkelruimte) dragen scorekleur. Lopende tekst en koppen staan in `--ink`, `--ink-m` of `--ink-s`. De klassenaam staat dus niet nog eens als gekleurde tekst naast de ring, en het score-getal in de ring niet in kleur.
- **Wat vervalt**: De losse ring boven de titel (schaalscans) en de kaart met het label "OVERALL VOLWASSENHEID" en de gekleurde klassenaam (Quickscan). De regels over weging en over afdelingen die niet meetellen blijven, onder de feiten, in 14px `--ink-s`.

**Opbouw van de hele pagina** (voorstel van 19 oktober 2026; de designs `01-resultaatkop-schaalscan` en `02-quickscan-meting` tonen de volledige pagina, met de nav). Van boven naar beneden:

- **Respondent (scherm 6)**: De nav van de respondentkant ("← Terug naar Mijn metingen" en "Mijn gegevens", sinds 21 oktober 2026 zonder de vier content-links), geen kruimelpad en geen schakelaar. Daaronder de Resultaatkop, de kaart Per categorie met het staafdiagram, Top 3 sterktes en Top 3 verbeterkansen, en de Classificatie.
- **Meting in beheer (schaalscan en Quickscan)**: De beheer-nav (Assessments, Organisaties, Resultaten, Accountmenu) en het kruimelpad, bijvoorbeeld Resultaten › Bedrijf A › Meting oktober 2026 › Resultaten van de Meting (`beheerpagina.md`, Navigatie in beheer). Daaronder de Resultaatkop met de eyebrow "Resultaat van de Meting", dan de weergave-schakelaar met rechts ervan de knop "Vergelijking" en het Info-icoon (`visualisatie-scores.md`, Navigatie), dan de totaalkaart en de inhoud van de gekozen weergave. Bij de Quickscan zijn dat Scores per afdeling en Sterkste afdeling en Meeste ontwikkelruimte (`content-ziekenhuis-quickscan.md`, Resultaten). De Classificatie staat altijd onderaan.
- **Classificatie** (`.legenda`): Kop in 18px, gewicht 700, zoals de andere koppen van een sectie. Daaronder de klassen in drie kolommen, in een kaart (10px radius, 1px `--border`, padding 24px 32px, zoals de Totaalkaart) die over dezelfde breedte loopt als de twee kolommen van de Top 3 erboven, van de linkerrand van de eerste tot de rechterrand van de tweede. De drie klassen staan over die breedte verdeeld: Basis op Orde links tegen de binnenrand, Uitbouwen in het midden van de kaart en Sterk punt rechts, met zijn rechterkant tegen de binnenrand. Dat is een grid met `1fr auto 1fr` en `justify-self: start`, `center` en `end`, zodat het midden ook echt het midden is als de teksten niet even breed zijn. De tekst binnen elke klasse blijft links uitgelijnd. Onder 640px staan ze onder elkaar, links uitgelijnd. Zonder kaart eindigt de legenda op ruim twee derde van de breedte, terwijl de kaarten erboven doorlopen, en dat oogt afgebroken (voorstel van 20 oktober 2026, gebouwd op 20 oktober 2026). Per klasse een stip van 10px in de klassekleur, de naam in 14px, gewicht 700, `--ink`, en de grenzen in 14px `--ink-s`. De naam staat dus niet in kleur. Bij de Quickscan staan de punten per afdeling erbij, bij de schaalscans de scoregrenzen ("Vanaf 3,5").
- **Zo gebouwd (19 oktober 2026)**: `components/Resultaatkop.tsx` heeft twee delen, `ResultaatKop` (eyebrow, titel, subregel) en `Totaalkaart` (ring van 128px via `ScoreRing klein`, chip, uitleg, feiten en extra regels), omdat de resultatenpagina van een Meting er de schakelaar tussen zet. `ResultsView` en `QuickscanResultaten` renderen ze; op een Meting staat `ResultaatKop` op de pagina zelf ("Resultaat van de Meting", met de Meting, de Organisatie en het aantal afgeronde scans in de subregel) en `ResultsView` toont met `toonKop={false}` alleen de totaalkaart. In de voorbeeld-output staat de knop "← Terug" rechts in de kop. De banner "Dit is een voorbeeld met demo-data" is op 20 oktober 2026 vervallen, want de eyebrow "Voorbeeld-output" zegt dat al. De Classificatie heeft een kop van 18px en per klasse een stip van 10px (`.classificatie-legenda`), de grenzen als "Onder 2,5", "2,5 tot en met 3,49" en "Vanaf 3,5". De benchmarkviews houden tot 20 oktober 2026 de ring van 156px zonder Resultaatkop (voorstel hieronder, Benchmark).
- **Staafdiagram per categorie, zo gebouwd (19 oktober 2026)**: Zie Radar en staafdiagram op het resultaatscherm, Zo gebouwd. `CategorieStaafdiagram` heeft geen getal boven de balk en een tooltip met naam en klasse. Alleen de vergelijking met een groep houdt Recharts (`CategorieTick`, minstens 104px per categorie).
- **Benchmark** (voorstel van 20 oktober 2026, gebouwd op 20 oktober 2026): De View per organisatie (`benchmark.md`, View per organisatie) en de sectie met het gemiddelde van de groep krijgen dezelfde Resultaatkop en Totaalkaart als de resultatenpagina van een Meting. Nu staan daar een gecentreerde ring van 156px en een regel "Overall score van {organisatie} · groep zonder {organisatie}: 3,8". Van boven naar beneden:
  - **Kop**: Eyebrow "Benchmark", als titel (`.page-title`, 32px) de naam van het Assessment en een subregel in 14px `--ink-s`. Bij de View per organisatie is dat "{Organisatie} tegenover de rest van de groep · {n} andere organisaties", bij de groep "{n} organisaties in de groep". De losse `<h2>` met de naam van het Assessment vervalt. Staan er meer Assessments onder elkaar, dan krijgt elke sectie zijn eigen kop.
  - **Schakelaar**: Onder de kop, zoals bij een Meting, met de weergaven Overzicht, Per bouwblok en Spreiding (`visualisatie-scores.md`, Navigatie).
  - **Totaalkaart**: Dezelfde kaart als bij een Meting, met de ring van 128px. Bij de View per organisatie staat in de ring de overall van de organisatie, met de klassenaam als chip en de uitleg van de klasse. Het enige feit is "Rest van de groep: 3,8", in 14px `--ink-s`, en dat ontbreekt als de rest geen overall heeft. Bij de groep staat in de ring het gemiddelde van de groep, met het feit "Elke organisatie telt even zwaar mee" (`benchmark.md`, Gedeelde regels).
  - **Wat vervalt**: De ring van 156px in het midden en de regel "Overall score van ...". De namen van andere organisaties komen ook in de kop niet voor, dus een Lead ziet dezelfde kop.
  - **Alle weergaven dezelfde kop (besloten op 20 oktober 2026, gebouwd op 20 oktober 2026, met één afwijking)**: De koppen worden zo veel mogelijk gelijkgetrokken. Dezelfde Resultaatkop (eyebrow, `.page-title`, subregel) en Totaalkaart met ring van 128px gelden ook voor de sectie met de scans van één Meting (`BenchmarkScanSectie`, eyebrow "Benchmark", per scan de naam van de Respondent in de subregel), voor de vergelijking tussen Metingen (`MetingenVergelijkingView`) en voor de Quickscan in een benchmark (`QuickscanBenchmarkView`, met het percentage in de ring). De losse `<h2>` met de naam van het Assessment en `ScoreCircle` vervallen overal. Per type verschilt alleen de inhoud van de ring (getal of percentage) en de feiten, niet de opbouw of de maten. **Zo gebouwd (20 oktober 2026)**: Alle zes de views hebben `ResultaatKop` met de eyebrow "Benchmark" en `ScoreCircle` komt er niet meer in voor. De View per organisatie (`BenchmarkOrganisatieView`) heeft de subregel "{naam} tegenover de rest van de groep · {n} andere organisaties", bij een Meting "de overige Metingen" en bij een scan "de overige scans" (`TEKSTEN`). De Totaalkaart staat onder de schakelaar, in elke weergave (`OnderdelenWeergaven` heeft daarvoor `onderSchakelaar`), met als enige feit "Rest van de groep: 3,8". De sectie van de groep heeft het feit "Elke organisatie telt even zwaar mee", die van de scans van een Meting "Gemiddelde van 3 afgeronde scans" en "Elke scan telt even zwaar mee", en de Quickscan het percentage van X in de ring (de rij Totaal van de view). **Afwijking**: De vergelijking tussen Metingen (`MetingenVergelijkingView`) heeft de Resultaatkop maar geen Totaalkaart, want zo'n vergelijking heeft geen eigen totaal: Elke Meting heeft er een, en die staat in de tabel. Welke Meting de ring zou tonen, is een keuze die de spec niet maakt. De radar en de diagrammen in een benchmark zijn `ResultaatKaarten` met een tweede reeks, dus ze hebben de hover, de legenda en het kolomdiagram.
- **Eyebrow bij een Meting**: De gebouwde pagina toont hier "OKT 2026". Het voorstel is "Resultaat van de Meting", met de Meting in de subregel, zodat de eyebrow bij elke Resultaatkop hetzelfde soort tekst is.

### Beheer

De beheeromgeving gebruikt dezelfde nav en footer, met alleen een extra
terug-link in de balk. Inklapbare bouwblok-kaarten (`.admin-bouwblok-card`
met `<details>`) voor contentbeheer, tabelstijl uit `admin.css`.

### Toetsenbord en focus

- **Focus**: Elk bedienbaar element krijgt bij toetsenbordnavigatie een
  oranje omtrek van `2px` (`:focus-visible`, `base.css`), niet bij een
  muisklik. Invoervelden houden hun eigen focusstijl (oranje rand met ring).
- **Modals** (`Modal`, `BevestigModal`, `OverzichtModal`): De focus gaat bij
  het openen naar de modal, Tab en Shift+Tab blijven erin
  (`lib/use-focus-val.ts`), en bij het sluiten keert de focus terug naar het
  element waar je vandaan kwam. Staan er twee modals boven elkaar, dan houdt
  alleen de bovenste de focus vast.
- **Klikbare rijen** in een lijst hebben ook altijd een knop "Bekijk" in
  de rij, zodat de rij ook zonder muis te openen is.

### Info-icoon

Voor een korte uitleg bij een veld of knop, in plaats van een vaste tekst
eronder, en voor de reden achter een uitgeschakelde knop (in plaats van
een `title`-tooltip). Zie `components/InfoIcoon.tsx`, `.info-icoon` en
`.info-veld`.

- **Icoon**: Een wit rondje (`var(--bg)`) van `1.25rem` met een `1px`
  oranje rand (`var(--or)`) en een oranje kleine letter "i" (`var(--or)`,
  `--fs-12`, gewicht 800). Geen hover-staat: Het icoon reageert alleen op
  een klik (zie Openen en sluiten). Het staat
  direct achter de knop of het veld waar het over gaat (rechts ervan, bij
  een groot veld zoals een tekstvak op de hoogte van de eerste regel),
  niet achter het label. In een rij met velden en knoppen staat het
  gecentreerd op de veldhoogte (`--control-h`).
- **Naast een titel**: Staat het icoon achter een paginatitel of kop (bijvoorbeeld
  "Audit-log"), dan staan titel en icoon in één rij (`display: flex;
  align-items: center; gap: .5rem`), zodat het icoon verticaal gecentreerd
  op de titel staat. Het staat niet hoger (superscript), niet lager en niet
  op de basislijn. Bij een titel die op twee regels afbreekt, staat het icoon
  achter de laatste regel.
- **Nooit van de regel af**: Het icoon valt niet los van het veld of de tekst
  waar het achter staat. Het icoon krijgt `flex-shrink: 0` en `white-space:
  nowrap`, en de rij (veld, eenheid of aantal, icoon) is een flexrij zonder
  `flex-wrap`, of het laatste woord en het icoon staan samen in één
  `white-space: nowrap`-element. Is er te weinig ruimte, dan breekt de tekst
  ervoor af en niet het icoon naar een eigen regel. Dit geldt ook bij een
  aantal of eenheid vlak voor het icoon, zoals "{n} scans" of "dagen" bij
  Drempels en termijnen. Een veld of invoer in die rij mag krimpen
  (`min-width: 0`), het icoon niet.
- **Informatieveld**: Een klik op het icoon toont het veld gecentreerd in
  het zichtbare venster (`position: fixed`, horizontaal en verticaal in het
  midden van de viewport), niet vanaf het icoon. Daardoor staat het nooit
  half buiten beeld, ook niet als het icoon onderaan een lange pagina of
  tegen de rand van een modal staat. De layout verspringt niet. Opmaak:
  `var(--bg-warm)`, rand `1px solid var(--border-d)` met links een `4px`
  oranje rand, `--fs-14`, schaduw zoals de Dropdown-knop, breedte maximaal
  `26rem` en `calc(100vw - 2rem)` op een smal venster, en maximaal `80vh`
  hoog met scrollen als de tekst langer is. Achter het veld staat een lichte
  dimlaag (zoals `.modal-overlay`, maar zonder eigen kop), zodat duidelijk is
  dat het veld bovenop de pagina ligt. Rechtsboven een sluitkruisje en, voor
  een Admin, links daarvan een potlood.
- **Staat het icoon in een modal**, bijvoorbeeld het Respondent-overzicht,
  dan komt het veld boven die modal te staan (hogere `z-index`), nog steeds
  gecentreerd in het venster. De modal eronder blijft staan en open.
- **Openen en sluiten**: Alleen met een klik. Er is geen mouse-over, omdat
  het veld ook een potlood en een kruisje heeft die bediend moeten worden.
  Sluiten kan met het kruisje, Esc of een klik op de dimlaag. De focus gaat
  bij het openen naar het veld en komt bij het sluiten terug op het icoon
  (`role="dialog"`, zie Toetsenbord en focus).
- **Bewerken (alleen een Admin)**: Het potlood heeft dezelfde grootte als
  het kruisje, kleur `var(--ink-s)` en bij hover `var(--ink)`. Een klik
  vervangt de tekst door een tekstvak van dezelfde breedte dat meegroeit,
  met een teller voor maximaal 500 tekens. Eronder staan "Opslaan"
  (`.btn-or .btn-compact`) en "Annuleren" (`.btn-outline .btn-compact`), en
  een knop "Standaardtekst herstellen" (`.btn-outline .btn-compact`, naast
  Annuleren) zodra de tekst afwijkt. Het is een knop en geen link, want het
  voert een actie uit. In de
  bewerkstand sluit een klik op de dimlaag het veld niet, zodat getypte tekst
  niet verloren gaat. Esc annuleert het bewerken, een tweede Esc sluit het
  veld. Na opslaan toont het veld direct de nieuwe tekst.
- **Wat erin hoort**: Uitleg bij een veld of instelling, of de reden achter
  een uitgeschakelde knop. Meldingen over wat er is gebeurd of een lege
  lijst ("Geen scans gevonden") blijven gewone `.admin-notice`s.
- **Waar het staat en wat erin staat**: Het register met sleutels, plekken
  en initiële teksten staat in `beheerpagina.md`, punt 2a, Algemene
  teksten. Een nieuwe uitleg bij een veld of knop gaat altijd in een
  Info-icoon, met een nieuwe regel in dat register.

### Tabbalk en kruimelpad (beheer)

- **Tabbalk** (`.beheer-tabs`): Direct onder de nav, witte achtergrond met
  een `1px solid var(--border)` onderrand, op dezelfde breedte als de
  beheerpagina's (`max-width: 1300px`). Tabtekst 14px, gewicht 600,
  `var(--ink-m)`. De actieve tab is `var(--ink)` met een onderstreep van
  `3px solid var(--or)`. Alleen zichtbaar op de lijstpagina's van
  Organisaties en op de pagina's onder Instellingen, niet op een detailpagina (`beheerpagina.md`, Navigatie in
  beheer).
- **Kruimelpad** (`.kruimelpad`): Boven de paginatitel, 14px,
  `var(--ink-s)`, gescheiden door een `›` in `var(--border-d)`. Elk deel is
  een link, het laatste deel staat in `var(--ink)` en is niet klikbaar. Een
  link krijgt bij hover `var(--or)`.
- **Weergave-schakelaar** (`.weergave-wissel`, besloten op 12 oktober 2026,
  gebouwd op 13 oktober 2026, ook met de vierde knop Antwoorden): Een
  pilvormige groep van 2 tot 4 pillen op een resultatenpagina, onder de kop
  en boven de inhoud (Keuzepil en pilvormige groep, hieronder). Hij is bedoeld
  voor het wisselen van weergave binnen één pagina en dus niet voor
  navigatie, de bestaande tabbalk blijft voor lijstpagina's.
- **Melding bovenaan een beheerpagina** (`.beheer-melding`): Een
  `.admin-notice` met groene tint (`--stat-green-faint`, rand
  `--stat-green`) en een sluitkruisje, na een actie die de Respondent van de
  pagina haalt. Verdwijnt bij het wisselen van pagina.

### Keuzepil en pilvormige groep

Besloten door Joost en gebouwd op 15 oktober 2026 (`.pil`, `.pil-groep` en
`.weergave-wissel`). Eén vorm voor
alles wat de gebruiker kiest, ter vervanging van de rechthoekige
weergave-schakelaar met een zwarte actieve knop, de filterchips met een zwarte
vulling en de oranje omlijnde afdelingsknoppen van de Quickscan.

**De regel.** Gekozen is massief oranje (`var(--or)`) met witte tekst, op elk
scherm. Zwart (`var(--ink)`) is geen vulling voor een besturingselement. Een
pil die niet gekozen is, is wit met grijze rand en grijze tekst en niet oranje
omlijnd, want oranje rand en tekst maken van een keuze een knop met een actie
(`.btn-outline`).

- **Keuzepil** (`.pil`): 32px hoog, `border-radius: 16px`, `padding: 0 16px`,
  `1px solid var(--border-d)`, witte achtergrond, tekst 14px gewicht 600 in
  `var(--ink-m)`, `white-space: nowrap`. Een aantal erachter ("12") staat in
  gewicht 400.
  - Hover (niet gekozen): Rand `var(--or)` en tekst `var(--ink)`.
  - Gekozen: `background: var(--or)`, rand `var(--or)`, witte tekst. Hover op een
    gekozen pil: `var(--or-l)`.
  - Uitgeschakeld: 50% dekking, met een Info-icoon voor de reden.
  - Verwijderbaar (filterchip): Een kruisje van 14px achter de tekst.
  - Focus: De bestaande focusstijl (zie Toetsenbord en focus).
- **Pilvormige groep** (`.pil-groep`, voor de weergave-schakelaar
  `.weergave-wissel`): Eén afgeronde houder om een rij pillen, met
  `1px solid var(--border-d)`, `border-radius: 20px`, witte achtergrond,
  `padding: 4px` en 2px tussen de pillen. De pillen erin hebben geen eigen rand
  (transparant, zodat de maat gelijk blijft), zijn 32px hoog en 14px
  gewicht 600. Hover op een niet-gekozen pil: `var(--bg-warm)`. Gekozen is
  massief oranje. Het toetsenbord kent Tab naar de groep en pijltjes links en
  rechts binnen de groep, met `role="tablist"` en `aria-selected` op de
  pillen. Rechts naast de groep kan een losse actieknop staan
  (`.btn-compact`).
- **Wanneer een groep en wanneer losse pillen**: Een vast aantal korte opties
  waarvan er precies één gekozen is (de weergaven, Groeperen op, Sorteren) is
  een pilvormige groep. Opties die uit de data komen, in wisselend aantal of
  met wisselende lengte, zijn losse pillen die op een tweede regel mogen
  doorlopen: De focusgroepen, de filters en de afdelingen van de Quickscan.
- **Wat het niet is**: De tabbalk (`.beheer-tabs`) blijft voor het wisselen van
  pagina en houdt de onderstreepte actieve tab. Een actie ("Opslaan",
  "Exporteren") blijft een knop.
- **Afstanden**: 8px tussen losse pillen, in de rij en tussen twee regels. Het
  label boven een rij (Groeperen op, in het label-formaat van 12px) staat 8px
  boven de pillen. Tussen twee blokken met besturing, zoals Groeperen op en
  Focusgroep, staat 24px, en onder een rij pillen tot de inhoud eronder
  minimaal 24px (zie Afstanden bij Layout).

### Kolomkop en rijkop in tabellen, matrices en heatmaps

Gebouwd op 15 oktober 2026 (matrix en heatmap, `.vis-kolomkop`). Een kop breekt nooit over meerdere regels en geeft
de kolom geen breedte. De Antwoorden-weergave (initialen met de volledige naam
in een tooltip) en de lijst Respondenten zijn het voorbeeld.

- **Kolombreedte**: Elke kolom met cijfers heeft dezelfde vaste breedte van 96px
  (`--kolom-b`), ook als de kop korter of langer is. Past een tabel niet, dan
  scrolt de kaart horizontaal met de eerste kolom vast, zoals bij Antwoorden. Uitzondering: In Antwoorden is een kolom met initialen (R1 tot Rn) 48px breed.
- **Kolomkop**: Hooguit twee regels van vaste hoogte. De eerste is de korte naam
  of afkorting in 14px gewicht 700, op één regel en met een afkapping (`…`) als
  hij niet past. De tweede is optioneel, 12px gewicht 400 in `var(--ink-s)`,
  voor een kort gegeven als "n = 11". Al het andere staat in de tooltip:
  de volledige naam, het label en de meetdatum van de Meting en het aantal
  scans. Een tooltip volgt het patroon van de initialen in Antwoorden.
  Bij Metingen als kolom is de eerste regel het onderdeel en de tweede de
  meetdatum, omdat de naam van de Meting (bijvoorbeeld "0-meting") vaak voor
  alle kolommen gelijk is (`visualisatie-scores.md`, onderdeel E).
- **Namen van Organisaties in een kop**: De korte naam van de Organisatie
  (`Organisatie.korteNaam`, optioneel, `datamodel.md`) en anders de naam zelf.
- **Rijkop** (bouwblok, vraag, groep): Eén regel, `white-space: nowrap`, met
  een afkapping en de volledige naam in een tooltip. De eerste kolom is
  240px breed, met het volgnummer en de accentrand van de categorie voor de
  naam.
- **Groepskoppen en chips**: Een chip of kop met een groepsnaam toont de korte
  naam. Het aantal ("n = 11") staat in de tweede regel van een kolomkop of
  achter de naam in een pil, nooit tussen de naam en de rest van een
  afgebroken regel.
- **Fout, geen variant**: Een kop die op twee regels uitkomt omdat de naam lang
  is, een kolom die breder wordt dan 96px en een rijkop die op twee regels
  breekt.


### Balklijst (rijen met een balk)

Gebouwd op 19 oktober 2026. Joost zag op de landingspagina en in de Quickscan balken die optisch niet even breed of hoog waren. Een kolom die de breedte van zijn inhoud aanneemt, geeft dat effect, en dit is de regel die het voorkomt. Elke lijst met balken (de categorieën op Mijn metingen, de afdelingen en bouwblokken van de Quickscan, de rijen van de benchmark, de gestapelde balken bij Antwoorden) volgt deze regels.

- **Drie kolommen met een vaste breedte.** Elke rij is een raster met een label, een spoor en een waarde. Het label en de waarde hebben een vaste breedte per lijst en het spoor neemt de rest (`1fr`). Een kolom neemt nooit de breedte van de inhoud aan. Zo begint en eindigt het spoor in elke rij op dezelfde plaats, ook als het label of de waarde in de ene rij langer is.
- **Extra gegevens.** Een aanvulling als "2 vragen" of "n.v.t." heeft een eigen kolom met een vaste breedte en staat nooit in dezelfde cel als de waarde. Anders is de waardekolom per rij anders breed en verschuift het spoor.
- **Label.** Eén regel, afgekapt met een tooltip voor de volledige tekst (`Kolomkop en rijkop`). Een lang label ("Verpleegafdelingen · Mensen") maakt het spoor niet korter.
- **Waarde.** Rechts uitgelijnd, met cijfers van gelijke breedte (`font-variant-numeric: tabular-nums`).
- **Hoogte.** Eén hoogte per lijst, in even pixels, zodat de rand scherp is: 8px in een compacte lijst (Mijn metingen, categorieën), 12px in een lijst met afdelingen of bouwblokken, 16px in een gestapelde balk. De hoogte hangt niet af van de inhoud of van de kleur.
- **Lengte.** De balk is een percentage van het spoor, op de schaal van de weergave (1 tot 5 bij scores, 0 tot 100% bij percentages). De lengte wordt afgerond op hele pixels. Een waarde boven nul krijgt minstens 4px, zodat een lage score zichtbaar blijft. Bij een waarde van nul staat alleen het spoor.
- **Uiteinden.** Alle uiteinden van een balk hebben dezelfde afronding (4px, nooit meer dan de halve hoogte). Een rand of schaduw maakt een balk niet dikker. Een lichte kleur zoals het merkgeel krijgt dezelfde hoogte en geen rand, en het getal ernaast draagt de leesbaarheid.
- **Gestapelde balk (Ja, Nee en Weet ik niet).** Het hele spoor is in elke rij even breed en de segmenten verdelen het naar verhouding. Een getal staat alleen in het segment als het segment minstens 24px breed is. Anders staat het in de tooltip. Een antwoord dat niemand gaf, heeft geen segment. Het getal staat precies in het midden van de balk, ook verticaal (besloten op 20 oktober 2026, het stond ruim een pixel te hoog): Zie Getallen in een cirkel of balk bij Typografie.
- **Sporen op één lijn.** Staan twee blokken naast elkaar (zoals Jouw scan en Hele meting), dan hebben ze dezelfde breedte voor label en waarde, zodat de sporen op één lijn staan.
- **Controle.** Een test meet in elke lijst de breedte en de hoogte van de sporen en balken en faalt als die in één lijst verschillen.
- **Zo gebouwd (19 oktober 2026).** De tokens `--balk-h-s`, `--balk-h-m`, `--balk-h-l` en `--balk-r` staan in `tokens.css`. De lijsten `.vis-rij` (240px, spoor, 208px), `.qv-rij`, `.qv-lijst-rij` (240px, spoor, 112px, 80px voor "1 vraag"), `.qv-vraag-rij` en `.mm-teaser-rij` hebben vaste kolommen, de sporen `.vis-spoor` (36px) en `.qv-spoor` (28px) zijn even. De vulling is `.balk-vul` (`max(4px, round(var(--p), 1px))`, `balkVul` in `lib/format.ts`). De gestapelde balk is `Stapel` (`components/quickscan/Stapel.tsx`) en meet zijn spoor in hele pixels, met het getal alleen in een segment van minstens 24px en een tooltip bij de rest. De controle is een test op de opmaak in plaats van een meting in de browser (`lib/balklijst.test.ts`): Die leest `app/styles/*.css` en faalt bij een kolom die de inhoud volgt of een hoogte die niet klopt.

### Filterchip, focuschip en slider (Verkennen)

Uit het visual design van Verkennen (`visualisatie-verkennen.md`), gebouwd op
15 oktober 2026 met de oude vorm van de chips en bijgewerkt in de opmaakronde van
dezelfde dag (keuzepil, filtermenu met korte namen en de modal Korte namen). Alleen de onderdelen die nog niet in dit document staan. De vier weergaven, Groeperen op en Sorteren gebruiken de
pilvormige groep (`.weergave-wissel`).

- **Filterchip**: Een keuzepil (zie Keuzepil en pilvormige groep) met het aantal
  Organisaties erachter in gewicht 400. Gekozen is hij massief oranje, met een
  kruisje om het filter weg te halen.
- **Focuschip**: Dezelfde keuzepil. Gekozen is hij massief oranje, zoals elke
  gekozen pil. Een groep onder de drempel `verkennenMinGroep` heeft een gestreepte rand
  en tekst in `var(--ink-s)`.
- **Slider met histogram**: Een smalle balk (4px) in `var(--border-d)` met een
  rond handvat van 20px in `var(--or)` en een witte rand. Erboven een histogram
  van 12 staven, 52px hoog, waarvan de staven van de focusgroep `var(--or)` zijn
  en de andere `#cfccc5`. Onder de slider staan het bereik en het aantal
  Organisaties aan elke kant van de drempel.
- **Kleine groep**: Een waarschuwing in `--stat-amber-faint` met een
  driehoekicoon, in de stijl van de bestaande meldingen.
- **Menu Kenmerk toevoegen**: Een dropdown onder de knop "Kenmerk toevoegen" (zelfde patroon
  als de Dropdown-knop), 380px breed en maximaal 440px hoog, scrollt binnen het
  menu. Bovenaan een zoekveld. Daaronder per groep een kopregel in het
  label-formaat (`--fs-12`, gewicht 700, hoofdletters) en de velden als rijen,
  links de korte naam (`--fs-14`, gewicht 600) en rechts "n van N" in
  `var(--ink-s)`, gewicht 400. Een veld met weinig ingevulde waarden heeft
  grijze tekst. Hover `var(--bg-warm)`. Het volledige pad staat in een tooltip.
- **Kaart Kenmerken**: Een kaart met titel, Info-icoon en per kenmerk een rij. De kenmerknaam staat als label (`--fs-12`, gewicht 700, hoofdletters), met rechts een kruisje van 24px rond om het kenmerk te verwijderen. De rijen zijn gescheiden door een lijn van 1px `--border` en 24px ruimte. De waarden zijn losse keuzepillen.
- **Lege staat van Kenmerken**: De tekst in `--ink-s` (`--fs-12`) en daaronder "Snel beginnen:" met losse keuzepillen, 8px ertussen. Daaronder de knop "Kenmerk toevoegen", met 24px ruimte.
- **Uitgeschakelde pil in een groep**: 50% dekking, `cursor: not-allowed`, nooit als gekozen getekend. De reden staat in een tooltip en als regel van `--fs-12` in `--ink-s` onder de groep.
- **Pil "Geen kenmerk"**: Een losse, uitgeschakelde pil van 32px, zonder pilvormige groep eromheen, zodat hij even hoog is als de andere pillen.
- **Melding bij de terugval van Groeperen op**: Een melding in `--stat-amber-faint` met een driehoekicoon, in de stijl van de melding bij een kleine groep.
- **Korte naam in een chip**: De chip toont de korte naam en bij hover het
  origineel in een tooltip.
- **Modal Korte namen**: De basismodal (`.modal-box--breed`) met een tabel van
  Origineel, Korte naam (invoerveld met teller, maximaal 30 tekens) en In
  gebruik, en "Annuleren" en "Opslaan" (`.btn-or .btn-compact`).

### Overzichtsmodal

Voor het Respondent-overzicht en het Scan-overzicht in beheer
(`beheerpagina.md`, punt 6b en 7). Dezelfde `.modal-overlay` en `.modal-box`
als de andere modals, met `.modal-box--breed`: `max-width: 720px`,
`max-height: 88vh`, scrollt binnen de modal. Sluiten met het kruisje, Esc,
een klik naast de modal of de terugknop van de browser.

- **Kop** (`.overzicht-kop`): Naam als `h2` (18px), eronder een regel
  14px met organisatie en de statusbadge. Een Lead krijgt de Lead-badge
  (zie Badges).
- **Blokken** (`.overzicht-blok`): Elk blok begint met een scheidingslijn
  (`1px solid var(--border)`) en een kopje in kapitalen (12px,
  `letter-spacing: .08em`, `var(--ink-s)`). Rechts in de kop mag één kleine
  knop staan, bijv. "Bewerken".
- **Beschrijvingslijst** (`.beschrijvingslijst`): Label links (`9rem`,
  `var(--ink-s)`), waarde rechts. Een lege waarde laat de cel leeg, nooit
  een los streepje.
- **Persoonlijke link** (`.overzicht-link-rij`): Alleen-lezen veld, daarna
  "Kopieer" en "Openen" (beide `.btn-outline .btn-compact`).
- **Scanregel** (`.overzicht-scanregel`): Links Meting en Assessment, rechts
  de statusbadge en de dropdown-knop "Acties".
- **Melding in de modal** (`.overzicht-melding`): Groen na een geslaagde
  actie, rood (`.fout`) bij een fout of overgeslagen scans.
- **Acties** (`.overzicht-acties`): Compacte knoppen naast elkaar,
  links uitgelijnd. Destructieve acties zijn `.btn-danger`.

**Brede variant `.modal-box--vol`.** Voor het Leads-venster
(`beheerpagina.md`, punt 6a), waar een brede tabel in staat.
`width: min(96vw, 1600px)`, `max-height: 90vh`. Het venster zelf scrolt niet.
Het bestaat uit drie vlakken onder elkaar. Eerst de kop (`.overzicht-kop`), dan een
scrollvlak (`.vol-scroll`, `overflow: auto`) en een vaste voettekst
(`.vol-voet`, `border-top: 1px solid var(--border)`, `.btn-rij` rechts
uitgelijnd). Sluiten werkt zoals bij de andere Overzichtsmodals.
Op een scherm smaller dan 720px vult het venster het hele scherm.

- **Vinkjestabel** (`.vinkjes-tabel`): In het scrollvlak. De eerste kolom
  (naam en e-mailadres) is vast (`position: sticky; left: 0`, achtergrond
  `var(--bg)`). De twee kopregels zijn vast (`position: sticky; top: 0`
  en een tweede rij direct eronder). Bovenaan staat het label van de Meting over
  de vijf kolommen heen, daaronder de weergave. Tussen twee Metingen staat een
  lijn van `1px solid var(--border)`. Cellen zijn gecentreerd, een grijze
  cel (`.cel-grijs`) heeft een Info-icoon.

### Vervolgstappen

Een actie die meer vraagt dan één klik (verplaatsen, samenvoegen)
vervangt de inhoud van dezelfde Overzichtsmodal door
een korte stap, geen tweede modal erbovenop. Bovenaan "← Terug"
(`.overzicht-stap-terug`), dan een kop, een korte uitleg, de keuzes en
onderaan een `.btn-rij` met "Annuleren" (`.btn-outline`) en de
bevestigknop. Een bevestiging die gegevens laat verdwijnen (een Respondent
samenvoegen) krijgt `.btn-danger` en noemt in de tekst wat er verdwijnt.
Een gewone verwijderactie gebruikt de bestaande bevestigingsmodal.

### Footer

Op elk scherm, met dezelfde `.container`-breedte als de rest van de
pagina. Eén link: "Privacy" (naar `privacy-pagina.md`). Geen logo (zie
Open punten, Footer-logo, en Logo hierboven).

**Geen "Beheer"-link meer.** Vroeger stond die hier naast "Privacy",
maar dat gaf een zichtbare stap van de respondent/lead-kant naar
beheer, terwijl die twee kanten bewust gescheiden zijn (`datamodel.md`
deel 2, Uitgangspunten). Weggehaald uit het ene gedeelde
footer-component (CLAUDE.md, Globale layout: dezelfde footer op elk
scherm), niet alleen op respondent/lead-schermen — dat voorkomt een
uitzondering per schermtype in een component dat overal identiek moet
zijn. Beheer blijft gewoon bereikbaar: rechtstreeks via de eigen URL,
en het inlogscherm daar is hetzelfde scherm dat ook verschijnt na
"Uitloggen" vanuit beheer zelf (`beheerpagina.md`, Accountmenu).

---

## Niet gebruiken

Eerder gebruikte categoriekleuren die niet (meer) gebruikt worden:

| Categorie | Niet gebruiken | Wel |
|---|---|---|
| Overkoepelend | `#f25d26` | `--or` |
| Organisatie | `#0da2e7` | `--bl` |
| Proces & Tech | `#7c3bed` | `--pu` |
| Mens | `#21c45d` | `--gr` |
| Fundament | `#e7b008`, `#8a6d00`, en sinds 19 oktober 2026 ook het antraciet `#44403c` | `--fu` (het merkgeel `#ffc043`) |

## Open punten

- **Contrast van oranje**: Witte tekst op `--or` (`#ff671f`) haalt ongeveer
  3:1 bij 14px. Dat geldt nu voor `.btn-or` en voor elke gekozen pil
  (Keuzepil, hierboven). Een donkerder oranje voor vulling met tekst is een
  merkbesluit van Coniche (`backlog.md`, Contrast) en werkt door in alle pillen.
- **Lengte van een korte naam in een kolomkop**: Een kolomkop is 96px breed
  (Kolomkop en rijkop). Een korte naam tot 12 tekens past zonder afkapping.
  Nog te besluiten of de modal Korte namen dat als advies toont.
- **Citaten**: Source Serif 4 staat in de spec maar de app toont nog geen
  citaat. Pas laden als er een komt.
- Footer-logo: Vraagt een witte variant van het logo, nu geen prioriteit.
- Error-states bij formuliervalidatie (de focusstijl staat onder Toetsenbord en focus).
