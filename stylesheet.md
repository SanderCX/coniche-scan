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
  --fu: #44403c;          /* Fundament, antraciet (voorstel) */

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
}
```

## Categoriekleuren

- Overkoepelend: `--or`
- Organisatie: `--bl`
- Proces & Tech: `--pu`
- Mens: `--gr`
- Fundament: `--fu`

Elke categoriekleur moet leesbaar zijn als tekst op wit en onder witte
tekst (bijv. het "bezig"-rondje in de sidebar). Daarom is Fundament niet
geel of goud. Voorstel is een warm antraciet (`#44403c`), dat past bij de
warme grijstinten van de huisstijl en ruim voldoende contrast heeft.
Alternatief als het te ingetogen oogt: Petrol (`#1f6f78`), dat zich
duidelijk onderscheidt van de andere vier categoriekleuren.

Er is geen aparte tekstvariant per categorie meer nodig: Alle vijf
categoriekleuren zijn zelf donker genoeg.

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
de classificatiecirkel, de staafdiagrammen, de top 3 en de legenda. Niet
voor de antwoordopties in de vragenlijst zelf, om respondenten niet
richting een kleur te sturen.

Tekst op geel en lichtgroen is `var(--ink)`, op de andere drie wit, voor
voldoende contrast.

De hexwaarden zijn een voorstel. Rood en oranje zijn gelijk aan de
bestaande statuskleuren. Donkergroen is bewust iets anders dan `--gr`
(categorie Mens), en de scorekleuren staan los van de categoriekleuren,
zodat een score nooit met een categorie verward wordt.

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

### Lettergroottes voor interface-tekst

Eén schaal voor alles wat geen kop of lopende tekst is, als tokens in
`tokens.css` (`--fs-*`). Tailwind-klassen volgen dezelfde schaal
(`app/globals.css`: `text-xs`, `text-sm`, `text-base` en `text-lg` zijn
dezelfde waarden), dus `text-sm` en `var(--fs-s)` zijn altijd hetzelfde.

| Token | Maat | Gebruik |
|---|---|---|
| `--fs-xs` | `.75rem` (12px) | Labels, badges, tabelkoppen, kleine tekst, hints |
| `--fs-s` | `.85rem` (13,6px) | Tabellen, formulierlabels en -tekst, nav, compacte knoppen, meldingen |
| `--fs-m` | `.9rem` (14,4px) | Standaardknoppen en invoervelden |
| `--fs-l` | `1.15rem` (18,4px) | Titel van modals en beheerblokken, `.admin-main h2` |

- **Beheer-paginatitel** (`.admin-main h1`): `1.9rem`.
- **Modaltitel**: Altijd `--fs-l`, ongeacht waar de modal staat
  (`.modal-overlay .modal-box h2`).
- **Gewichten**: 400 (lopende tekst), 600 (labels, links, nav), 700
  (knoppen, badges, tabelkoppen) en 800 (koppen). Gewicht 500 wordt niet
  gebruikt.
- **Eyebrow** (`.69rem`) en de koppen (h1/h2/h3) staan hierboven en wijken
  bewust af van deze schaal.
- **Buiten deze schaal, bewust ongewijzigd en nog niet in een eigen
  schaal gevat**: De inleidende regels op de publieke pagina's (`1.1rem`),
  de koppen in de privacypagina (`1.3rem`), de koppen van een bouwblok en
  Assessment-kaart (`1.5rem`/`1.6rem`), de score in de classificatiecirkel
  (`2.4rem`), het icoon van een Assessment (`2rem`) en de tekst in de
  grafieken (10 tot 11px, radar `.68rem`).

**Veldhoogte.** Velden en compacte knoppen die in één rij staan, hebben
dezelfde vaste hoogte: `--control-h` (`2.4rem`, 38,4px), in de CSS voor
`.admin-field input`/`select` en `.btn.btn-compact`. Een knop in de nav
(`.nav-right .btn`) is compacter en volgt dit niet.
### Koppen en lopende tekst

- **Koppen**: Font-weight 800 (h1/h2) of 700 (h3), line-height 1.1,
  licht negatieve letter-spacing, kleur `var(--ink)`.
  - h1: `clamp(2.5rem, 5vw, 4rem)`
  - h2: `clamp(1.85rem, 3.5vw, 2.65rem)`
  - h3: `1.12rem`
- **Body-tekst**: Line-height 1.78, kleur `var(--ink-m)`.
- **Label/eyebrow**: Font-size `.69rem`, font-weight 700, letter-spacing
  `.14em`, hoofdletters, kleur `var(--or)`. Voor kleine kop-labels zoals
  "AI Assessment" boven een scanpagina.

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

---

## Componenten

### Knoppen

Standaardmaat: `border-radius: var(--r)`, `padding: .82rem 1.7rem`,
`font-weight: 700`, `font-size: .9rem`.

- `.btn-or`: Primair. Gevuld `var(--or)`, witte tekst, hover `var(--or-l)`
  met lichte `translateY(-1px)`.
- `.btn-outline`: Secundair op een lichte achtergrond. Transparant,
  `2px solid var(--border-d)`, tekst `var(--ink)`. Bijv. "Annuleren" naast
  "Opslaan".
- `.btn-outline-w`: Secundair op een donkere of foto-achtergrond. Witte
  rand (`2px solid rgba(255,255,255,.5)`), transparant.
- `.btn-w`: Op een oranje achtergrond. Witte vulling, oranje tekst.
- `.btn-danger`: Destructieve acties zoals verwijderen. Gevuld
  `var(--stat-red)`, witte tekst, hover iets donkerder. Geen rode
  outline-variant.
- **Disabled**: `background: var(--bg-mid)`, tekst `var(--ink-s)`, rand
  `var(--border)`, `cursor: not-allowed`. Geldt voor elke variant.
- `.btn-compact`: Kleinere maat (`height: var(--control-h); padding: 0 1rem; font-size: var(--fs-s)`)
  voor knoppen in de nav en in bulk-actiebalken, zoals "N geselecteerd"
  met Exporteren en Verwijderen, en voor een knop die naast een
  `.admin-field`-invoerveld in dezelfde rij staat (bijv. "+ Meting
  plannen" naast het Label-veld) — de vaste hoogte `--control-h`
  (38,4px) is bewust gelijk aan die van een `.admin-field input`/`select`
  ernaast (gemeten: 38,4px voor beide), geen losse afstemming per rij nodig. **Selector in de code is `.btn.btn-compact`, niet los
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
in een knop is niet groter dan de tekstregel (`.8rem`), en de wrapper van een
Dropdown-knop is `inline-flex` zodat hij niet hoger is dan zijn knop.

**Formulierelementen krijgen niet de line-height van lopende tekst.**
`input`/`select`/`textarea`/`button` erven anders `body`'s
`line-height: 1.78` ongelijk (`<select>` negeert dat als enige, de
andere drie wel), wat bij gelijke padding/font-size toch merkbaar
verschillende hoogtes gaf. Vaste `line-height: normal` op alle vier in
`base.css` regelt dat: Een `.admin-field select` en het `input` ernaast
komen daardoor vanzelf op (vrijwel) dezelfde hoogte uit.

**Gelijke breedte**: Knoppen die samen in één actierij staan, krijgen
dezelfde breedte (`display: flex` op de rij, `flex: 1` of een gedeelde
`min-width` op elke knop). Dat geldt per rij, niet voor alle knoppen op
een pagina.

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

### Badges

- `.hero-tag`: Kop-label. Gevuld `var(--or)`, witte tekst, hoofdletters,
  `border-radius: 3px`.
- `.g-badge`: Tag onder een kop, ook voor de bouwblok-tags. Achtergrond
  `var(--or-faint)`, oranje tekst, `border-radius: 100px`, rand
  `var(--or-mid)`.
- `.admin-badge`: Status van een respondent. `.status-afgerond` groen,
  `.status-bezig` amber, `.status-uitgenodigd` blauw.
- **Rolbadge** (vervangt de vaste, zwarte badge "Beheer" naast het logo):
  Toont de rol van waaruit je het scherm bekijkt, gevuld met de
  bijbehorende rolkleur (zie Rolkleuren hieronder), witte tekst, verder
  zelfde vorm als `.hero-tag` (hoofdletters, `border-radius: 3px`).
  **Tijdelijke aanduiding**, vooruitlopend op de echte rollen/rechten uit
  `datamodel.md` deel 2 (nog niet gebouwd): Bedoeld om tijdens het bouwen
  snel te zien vanuit welk perspectief (Admin/Consultant/Lead/Respondent)
  een scherm bekeken wordt, niet als een gevalideerde inlogstatus. Hoe de
  getoonde rol precies bepaald wordt zolang er geen echte rollen/rechten
  zijn, is aan Sander.

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
de header en de footer (inclusief de vaste content-links en de exit-actie
"← Terug naar ...") en een verwijzing binnen lopende tekst naar een andere
pagina, zoals de privacypagina in de toestemmingstekst. Een link is oranje
(`var(--or)`) zonder onderstreping, met onderstreping bij hover.

**Knoppenrij.** Meerdere compacte acties naast elkaar in een rij, bijvoorbeeld
"Kopieer" en "Openen" achter de persoonlijke link, staan als `.btn-outline
.btn-compact` met een tussenruimte van `0.5rem`. Ze zijn gelijk van hoogte
(`var(--control-h)`) en er staan geen scheidingstekens tussen. Staat er een
`<select>` in dezelfde rij, dan is dat een compacte variant van
hetzelfde formaat, niet het volle `select.field` uit Formulieren hieronder.

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

### Doorloopflow

- **Layout**: Sidebar 300px, hoofdgedeelte flexibel. Het logo staat
  alleen in de nav, niet in de sidebar.
- **Sidebar**: Voortgangsbalk, categorienaam in categoriekleur (via
  `--accent`), status per bouwblok: Leeg (niet begonnen), gevuld in
  categoriekleur (bezig), `--stat-green` (afgerond, ongeacht categorie).
- **Bouwblok-kop**: Verticale accentbalk in categoriekleur, titel
  vetgedrukt, omschrijving eronder in `var(--ink-m)`.
- **Toelichting**: `.toelichting-link` naast de titel opent
  `.modal-overlay` met `.modal-box`.
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

- `.classificatie-cirkel` en `.legenda` voor de overall score en de
  legenda.
- Staafdiagram (`charts.css`): Kleur volgt de scorekleur van die balk
  (`--kleur` gezet op `--score-1` t/m `--score-5`), niet de categorie.
  Radar als SVG.

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
- **Klikbare rijen** in een lijst hebben ook altijd een knop "Bekijk >>" in
  de rij, zodat de rij ook zonder muis te openen is.

### Info-icoon

Voor een korte uitleg bij een veld of knop, in plaats van een vaste tekst
eronder, en voor de reden achter een uitgeschakelde knop (in plaats van
een `title`-tooltip). Zie `components/InfoIcoon.tsx`, `.info-icoon` en
`.info-veld`.

- **Icoon**: Een oranje rondje (`var(--or)`) van `1.25rem` met een wit
  uitroepteken (`--fs-xs`, gewicht 800), hover `var(--or-l)`. Het staat
  direct achter de knop of het veld waar het over gaat (rechts ervan, bij
  een groot veld zoals een tekstvak op de hoogte van de eerste regel),
  niet achter het label. In een rij met velden en knoppen staat het
  gecentreerd op de veldhoogte (`--control-h`).
- **Informatieveld**: Een klik op het icoon toont het veld gecentreerd in
  het zichtbare venster (`position: fixed`, horizontaal en verticaal in het
  midden van de viewport), niet vanaf het icoon. Daardoor staat het nooit
  half buiten beeld, ook niet als het icoon onderaan een lange pagina of
  tegen de rand van een modal staat. De layout verspringt niet. Opmaak:
  `var(--bg-warm)`, rand `1px solid var(--border-d)` met links een `4px`
  oranje rand, `--fs-s`, schaduw zoals de Dropdown-knop, breedte maximaal
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
  beheerpagina's (`max-width: 1300px`). Tabtekst `.85rem`, gewicht 600,
  `var(--ink-m)`. De actieve tab is `var(--ink)` met een onderstreep van
  `3px solid var(--or)`. Alleen zichtbaar op de lijstpagina's van
  Organisaties, niet op een detailpagina (`beheerpagina.md`, Navigatie in
  beheer).
- **Kruimelpad** (`.kruimelpad`): Boven de paginatitel, `.85rem`,
  `var(--ink-s)`, gescheiden door een `›` in `var(--border-d)`. Elk deel is
  een link, het laatste deel staat in `var(--ink)` en is niet klikbaar. Een
  link krijgt bij hover `var(--or)`.
- **Melding bovenaan een beheerpagina** (`.beheer-melding`): Een
  `.admin-notice` met groene tint (`--stat-green-faint`, rand
  `--stat-green`) en een sluitkruisje, na een actie die de Respondent van de
  pagina haalt. Verdwijnt bij het wisselen van pagina.

### Overzichtsmodal

Voor het Respondent-overzicht en het Scan-overzicht in beheer
(`beheerpagina.md`, punt 6b en 7). Dezelfde `.modal-overlay` en `.modal-box`
als de andere modals, met `.modal-box--breed`: `max-width: 720px`,
`max-height: 88vh`, scrollt binnen de modal. Sluiten met het kruisje, Esc,
een klik naast de modal of de terugknop van de browser.

- **Kop** (`.overzicht-kop`): Naam als `h2` (`1.3rem`), eronder een regel
  `.85rem` met organisatie en de statusbadge. Een Lead krijgt de Lead-badge
  (zie Badges).
- **Blokken** (`.overzicht-blok`): Elk blok begint met een scheidingslijn
  (`1px solid var(--border)`) en een kopje in kapitalen (`.72rem`,
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

### Vervolgstappen

Een actie die meer vraagt dan één klik (verplaatsen, samenvoegen,
Lead-toegang beheren) vervangt de inhoud van dezelfde Overzichtsmodal door
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
| Fundament | `#e7b008`, `#ffc043`, `#8a6d00` | `--fu` |

## Open punten

- **Typografie van de display-maten**: De maten die in "Buiten deze schaal"
  staan (inleidende regels, privacykoppen, bouwblokkoppen, de score in de
  cirkel, grafiektekst) hebben nog geen eigen schaal. Nog te besluiten of
  die er komt, en welke waarden.
- **Citaten**: Source Serif 4 staat in de spec maar de app toont nog geen
  citaat. Pas laden als er een komt.
- Footer-logo: Vraagt een witte variant van het logo, nu geen prioriteit.
- Error-states bij formuliervalidatie (de focusstijl staat onder Toetsenbord en focus).
