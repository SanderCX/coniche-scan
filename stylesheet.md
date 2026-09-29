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
- `.btn-compact`: Kleinere maat (`padding: .5rem 1rem; font-size: .8rem`)
  voor knoppen in de nav en in bulk-actiebalken, zoals "N geselecteerd"
  met Exporteren en Verwijderen.

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

### Footer

Op elk scherm, met dezelfde `.container`-breedte als de rest van de
pagina. Twee links naast elkaar: "Beheer" (naar de inlogpagina) en
"Privacy" (naar `privacy-pagina.md`). Geen logo (zie Open punten,
Footer-logo, en Logo hierboven).

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

- Footer-logo: Vraagt een witte variant van het logo, nu geen prioriteit.
- Focus- en error-states bij formuliervalidatie.
