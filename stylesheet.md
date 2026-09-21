# Coniche Scan — Stylesheet

Drie lagen, niet door elkaar gebruiken:

1. **Officieel/leidend** — het merkpalet (`CON_Kleurenschema2022.pdf`) en
   de echte CSS-bron van de app zelf: `tokens.css`, `base.css`,
   `components.css`, `charts.css`, `admin.css` (allemaal aangeleverd door
   Joost). Dit zijn geen reconstructies meer, dit IS de broncode. Sander
   neemt deze bestanden letterlijk over; dit document vat samen wat erin
   zit en welke beslissingen daarmee vastliggen, het herhaalt niet elke
   regel CSS.
2. **Scan-specifieke patronen** — vorm en gedrag van componenten die
   alleen in de scan-app voorkomen. Grotendeels nu ook gedekt door de
   CSS-bestanden uit laag 1, hier staat vooral toelichting bij *waarom*.
3. **Afgekeurd** — een paar categoriekleuren die eerder verkeerd
   gerenderd werden, kort gedocumenteerd zodat niemand ze per ongeluk
   terugzet.

## Laag 1 — Officieel/leidend

### Merkpalet

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

Geen officieel rood in de huisstijl — relevant voor de classificatiekleur
"Basis op Orde", zie verderop.

### CSS custom properties (`tokens.css`, aangeleverd door Joost — bron voor de hele app)

Dit is niet langer een reconstructie, dit is het echte bestand. Sander
neemt dit letterlijk over, niet herschrijven:

```css
/* Design tokens — stylesheet.md laag 1 (enige bron voor opmaak). */
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

  --pu: #392944; /* Proces & Tech — toegevoegd vanuit het merkpalet */

  --ink: #1c1c1a;
  --ink-m: #4d4d49;
  --ink-s: #888884;

  --bg: #ffffff;
  --bg-warm: #faf9f7;
  --bg-mid: #f2f0eb;

  --border: #e8e6e1;
  --border-d: #d4d1ca;

  --r: 6px;
  --nav-h: 4.5rem; /* nieuw: vaste nav-hoogte, nodig om de sidebar in de
                       doorloopflow sticky tegenaan te zetten, zie
                       "Sticky sidebar" hieronder */

  /* Classificatiekleuren — bewust NIET --or/--gr, universele statustinten
     los van de merkkleuren. */
  --stat-red: #dc2626;
  --stat-red-faint: #fdecec;
  --stat-amber: #e8871e;
  --stat-amber-faint: #fdf2e3;
  --stat-green: #22a06b;
  --stat-green-faint: #e7f6ef;
}
```

Dit dekt meteen het eerdere open punt op: de classificatiekleuren
(rood/oranje/groen voor "Basis op Orde"/"Uitbouwen"/"Sterk punt") zijn nu
vastgelegd als `--stat-red`/`--stat-amber`/`--stat-green`, bewust andere
waarden dan de categoriekleuren, elk met een bijpassende `-faint`
achtergrondtint voor badges.

Categorie-toewijzing (Dark-variant als hoofdkleur, Light-variant waar een
tweede tint nodig is, bijv. hover):

- Overkoepelend: `--or` (Dark Orange)
- Organisatie: `--bl` (Dark Blue)
- Mens: `--gr` (Dark Green)
- Fundament: `--ye` (Dark Yellow)
- Proces & Tech: `--pu` (Dark Purple)

### Typografie

- **Lettertype**: Epilogue (400/500/600/700/800) via Google Fonts, voor
  zowel body-tekst als koppen.
- **Accentfont**: Source Serif 4 (italic 400/600) — alleen voor citaten/
  quotes, niet voor gewone UI-tekst.
- **Koppen**: font-weight 800 (h1/h2) of 700 (h3), line-height 1.1,
  licht negatieve letter-spacing, kleur `var(--ink)`.
  - h1: `clamp(2.5rem, 5vw, 4rem)`
  - h2: `clamp(1.85rem, 3.5vw, 2.65rem)`
  - h3: `1.12rem`
- **Body-tekst**: line-height 1.78, kleur `var(--ink-m)`.
- **Label/eyebrow-tekst**: font-size `.69rem`, font-weight 700,
  letter-spacing `.14em`, hoofdletters, kleur `var(--or)` — het patroon
  voor kleine kop-labels zoals "AI Assessment" boven een scanpagina.

### Layout en spacing

- **Border-radius**: `--r: 6px` voor knoppen; cards gebruiken los `10px`.
- **Container**: `max-width: 1160px`, `padding: 0 2rem`.
- **Sectie-padding**: `6rem 0` verticaal.

### Logo-gebruik

- **Nav**: `<img>`, hoogte `44px`, breedte automatisch. Definitief
  besloten, zie hierboven bij nav-gedrag.
- **Footer**: voorlopig geen logo, alleen tekst — zie "Nog open". CSS
  staat al klaar (`.mini-logo`, hoogte `28px`) voor zodra dit wel gebouwd
  wordt; dan is een witte/inverse variant van het logo nodig (het huidige
  logobestand is niet geschikt voor een donkere achtergrond).
- Als los beeldbestand (PNG/SVG), niet als CSS-achtergrond.

### Componenten

**Knoppen** (`border-radius: var(--r)`, `padding: .82rem 1.7rem`,
`font-weight: 700`, `font-size: .9rem`):
- `.btn-or` — primair: gevuld `var(--or)`, witte tekst, hover
  `var(--or-l)` + lichte `translateY(-1px)`.
- `.btn-outline-w` — secundair op donkere/foto-achtergrond: witte rand
  (`2px solid rgba(255,255,255,.5)`), transparante vulling.
- `.btn-w` — knop op een oranje sectie-achtergrond: witte vulling,
  oranje tekst.
- `.btn-outline` — secundair op een gewone (lichte) achtergrond:
  transparante vulling, `2px solid var(--border-d)`, donkere tekst
  (`var(--ink)`). Dit is de neutrale tweede knop naast `.btn-or`, bijv.
  "Annuleren" naast "Opslaan".
- **Disabled**: `background: var(--bg-mid)`, tekst `var(--ink-s)`, rand
  `var(--border)`, `cursor: not-allowed`. Geldt voor elke knopvariant.
- **Destructief/verwijderen — ONTBRAK, nu toegevoegd**: `.btn-danger`,
  zelfde maatvoering als de rest, gevulde `var(--stat-red)` met witte
  tekst (consistent met hoe classificatie/status al rood gebruikt),
  hover een tikje donkerder. Niet de rode outline-knop die nu op
  "Verwijderen" staat — die stijl bestaat nergens in components.css,
  dat was een ad-hoc invulling zonder spec. Vervang 'm door deze
  `.btn-danger`.
- **Compacte knopmaat voor actiebalken — nieuw, corrigeert een te
  dominante "Verwijderen"-knop**: `.nav-right .btn` had al een kleinere
  maat (`padding: .5rem 1rem; font-size: .8rem`) dan de standaardknop
  (`.82rem 1.7rem` / `.9rem`), maar dat stond vast aan de nav. Til dat
  los als algemene `.btn-compact`-variant, en gebruik die voor elke
  bulk-actiebalk (bijv. "N geselecteerd" + Exporteren/Verwijderen), niet
  de standaardmaat. Dat voorkomt dat een verwijderknop in zo'n rij
  zwaarder oogt dan de primaire actie op de pagina.

**Knopbreedte binnen een actierij**: knoppen die samen in één rij staan
(bijv. de bulkbalk "Exporteer selectie" + "Verwijderen", of een
formulier met "Annuleren" + "Opslaan") krijgen gelijke breedte — niet
elk hun eigen breedte op basis van teksthoeveelheid. Concreet:
`display: flex` op de container, `flex: 1` (of een gedeelde `min-width`)
op elke `.btn` daarbinnen. Geldt voor knoppen die functioneel bij elkaar
horen in dezelfde rij, niet voor elke knop op de hele pagina — een
volledige-breedte formulierknop en een klein knopje in de nav hoeven
niet gelijk te zijn. Zeg het als je dit breder bedoelt dan dat.

**Badges/pills**:
- Kop-label (`.hero-tag`) — gevuld `var(--or)`, witte tekst,
  hoofdletters, `border-radius: 3px`.
- Content-tag onder een sectiekop (`.g-badge`) — lichte `var(--or-faint)`
  achtergrond, oranje tekst, volledig rond (`border-radius: 100px`),
  dunne `var(--or-mid)` rand. Vermoedelijk het patroon voor de
  bouwblok-tags in de scan zelf.

**Kaarten**: witte of `var(--bg-warm)` achtergrond, `1px solid
var(--border)`, `border-radius: 10px`, `padding: 1.8rem`. Terugkerend
patroon: een gekleurde accentrand aan één zijde (top óf links) geeft de
categorie of het content-type aan — precies hetzelfde idee als de
verticale accentbalk bij de bouwblok-koppen in de scan-app.

---

## Laag 2 — Scan-specifieke patronen (vorm/gedrag, geen eigen kleur)

Componenten die alleen in de scan-app voorkomen. Kleur komt altijd uit
laag 1 hierboven, hier staat alleen vastgelegd hoe ze zich gedragen:

- **Radiobuttons**: dunne cirkel met categoriekleur als rand, leeg tot
  geselecteerd (dan gevuld).
- **Bouwblok-kop**: verticale accentbalk (categoriekleur) links, titel
  vetgedrukt, omschrijving direct eronder in `var(--ink-m)`.
- **Instructievlak**: lichtgrijs vlak (`var(--bg-mid)` of vergelijkbaar)
  met de vaste tekst "Beantwoord op basis van wat aantoonbaar geregeld is
  (documenten, ritmes, tooling, afspraken)."
- **Knop, disabled/inactieve staat**: een duidelijk lichtere,
  verzadigingsarme versie van de primaire knopkleur, niet zomaar een
  opacity-verlaging — zichtbaar op het intake-formulier vóór het
  aanvinken van de toestemmingscheckbox.
- **Classificatiekleuren** (rood/oranje/groen voor "Basis op Orde"/
  "Uitbouwen"/"Sterk punt"): bevestigd, zie `--stat-red`/`--stat-amber`/
  `--stat-green` (+ `-faint` varianten) in laag 1. Bewust géén
  `--or`/`--gr`, dat zou classificatie met categoriekleur laten
  samenvallen.

## Globaal, bevestigd door Joost — geldt op elke pagina

- **Ruimte bovenaan de pagina** (extra padding direct onder de nav, vóór
  de eerste sectie-inhoud begint): bevestigd goed, aanhouden op alle
  schermen, niet alleen de homepage.
- **Kaart-hover**: lichte lift (`translateY(-2px)`) plus een zachte
  schaduw bij hover op klikbare kaarten (bijv. de assessment-kaarten op
  scherm 1). Bevestigd, geldt voor kaarten overal in de app, niet alleen
  daar waar het nu zichtbaar is.
- **Nav-gedrag — definitief besloten, niet langer open**: `position:
  sticky`, permanent witte achtergrond, `3px solid var(--or)` onderrand,
  zachte schaduw, logo op 44px. Géén transparant-over-hero-gedrag zoals
  in coniche-v4.html — dat patroon is bewust losgelaten. Bron:
  `components.css`, met de expliciete toelichting dat dit is overgenomen
  van de bestaande BOKS-app (`.topbar`), waar het al in de praktijk
  werkt. Sander bouwt dit patroon, geen van beide eerdere varianten.
  **Nieuw**: vaste hoogte `height: var(--nav-h)` (4.5rem) in plaats van
  hoogte die meebeweegt met de inhoud — nodig zodat de sidebar in de
  doorloopflow daar sticky tegenaan kan zetten, zie hieronder. Geldt
  alleen boven de 900px-breakpoint waar `.nav-right` niet wrapt (zie de
  bestaande `@media (max-width: 640px)`-regel op `.nav-right`); onder
  900px is `.flow-sidebar` toch al `position: static` (zie de bestaande
  `@media (max-width: 900px)`-regel), dus daar speelt dit niet.

## Bevestigde componenten uit components.css / charts.css / admin.css

Niet hier herhaald regel voor regel, dit zijn de bestanden zelf — alleen
een routekaart van wat erin zit, zodat je weet waar je moet zijn:

- **Doorloopflow** (`.flow-layout`, `.flow-sidebar`, `.flow-main`):
  sidebar 300px vast, hoofdgedeelte flexibel, 1 kolom onder 900px breed.
  Geen eigen logo meer in de sidebar (zat er eerder dubbel in, nu terecht
  verwijderd — logo zit alleen nog in de gedeelde nav). Voortgangsbalk,
  categorienaam in categoriekleur (via `--accent`), bouwblok-status in 3
  staten — onbegonnen (lege cirkel), bezig (gevuld in categoriekleur),
  afgerond (altijd `--stat-green`, ongeacht categorie).
- **Sticky sidebar — correctie, huidige bouw is fout**: `.flow-sidebar`
  heeft nu wel `overflow-y: auto`, maar zonder begrensde hoogte doet dat
  niets — de sidebar scrollt gewoon mee met de rest van de pagina in
  plaats van op zijn plek te blijven staan. Fix (alleen boven de
  900px-breakpoint, zie hierboven bij nav):
  ```css
  .flow-sidebar {
    position: sticky;
    top: var(--nav-h);
    height: calc(100vh - var(--nav-h));
    overflow-y: auto;
  }
  ```
  Dat geeft de sidebar precies één eigen, intern scrollgebied — geen
  dubbele scrollbar op de pagina — terwijl `.flow-main` gewoon normaal
  meescrollt met de rest van de pagina.
- **Radiobuttons**: rand én gevulde stip in categoriekleur (`--accent`),
  niet vast oranje — dat had ik eerder generiek beschreven, nu
  preciezer.
- **Toelichting-overlay**: `.toelichting-link` (icoon naast de
  bouwblok-titel) opent `.modal-overlay`/`.modal-box`. Bevestigt de
  aanname uit v1-aanpassingen.md punt 3.
- **Classificatiecirkel en legenda** (`.classificatie-cirkel`,
  `.legenda`): voor de overall-score en de "Basis op Orde/Uitbouwen/
  Sterk punt"-legenda op het resultatenscherm.
- **Bar- en radar-chart** (`charts.css`): bar-rijen kleuren op
  classificatie (`--kleur`, default `--stat-amber`), niet op categorie —
  consistent met wat al in CLAUDE.md sectie 4 stond. Radar is SVG-
  gebaseerd.
- **Formuliervelden**: focus-state nu bekend — oranje rand plus een
  zachte ring in `--or-faint`. Dit was een open punt, is opgelost.
- **Kaart-hover is nu letterlijk generiek**: de CSS-selector is
  `a.card:hover, .assessment-card:hover`, dus elke klikbare kaart met de
  `.card`-klasse krijgt de lift + schaduw, niet alleen de
  assessment-kaarten. Zelfde patroon bevestigd op `.admin-row:hover` in
  admin.css. Geen losse afspraak meer nodig per plek.
- **Nav-actieknoppen**: `.nav-right .btn` bestaat nu, expliciet bedoeld
  voor "resultatenscherm: terug naar de scan + exporteren" (letterlijk zo
  in de CSS-comment). Dit is precies wat in v1-aanpassingen.md punt 1
  gevraagd werd — CSS-kant staat klaar, de daadwerkelijke koppeling
  (welke knoppen, welke acties) moet Sander nog bouwen.
- **Admin hergebruikt de publieke nav/footer** — expliciet zo in
  `admin.css` gedocumenteerd ("zelfde logo, zelfde balk"), met alleen een
  extra "terug"-link binnen diezelfde balk. Bevestigt wat
  admin-beheerpagina.md al aannam.
- **Admin-componenten**: inklapbare bouwblok-kaarten (`.admin-bouwblok-
  card`, `<details>/<summary>`) voor het bewerken van bouwblokken en
  vragen, statusbadges voor respondenten — nu alle drie statussen gedekt:
  `.status-afgerond` (groen), `.status-bezig` (amber), en `.status-
  uitgenodigd` (nu toegevoegd, blauw-getint — sluit het eerdere open punt
  hierover af).

## Nog open — wacht op designbeslissing van Joost

- **Footer-logo**: de CSS staat al klaar (`.mini-logo`, 28px — preciezer
  dan de 30px die ik eerder noemde), maar wordt nog niet gebruikt. Zelfde
  reden als eerder: vereist een witte/inverse logovariant, bewust geen
  prioriteit nu. Sander bouwt de class niet actief in totdat dit besluit
  valt.

---

## Laag 3 — Afgekeurd

Deze categoriekleuren zijn op enig moment fout gerenderd geweest
(gemeten met pixelanalyse, ver vóór het merkpalet bekend was). Niet
gebruiken, alleen hier zodat niemand ze per ongeluk terugzet:

| Categorie | Afgekeurde kleur | Was bedoeld als | Afstand tot officieel |
|---|---|---|---|
| Organisatie | `#0da2e7` | Dark Blue `#225BA0` | Te fel/cyaan |
| Proces & Tech | `#7c3bed` | Dark Purple `#392944` | Compleet mis, geen enkele gelijkenis |
| Mens | `#21c45d` | Dark Green `#197F4E` | Te fel/fluorescerend |
| Fundament | `#e7b008` | Dark Yellow `#FFC043` | Te donker/mosterdkleurig |
| Overkoepelend | `#f25d26` | Dark Orange `#FF671F` | Dichtbij, niet exact |
