# Coniche Scan — Stylesheet

Twee bronnen, niet door elkaar gebruiken: de officiële Coniche-huisstijl
(leidend, uit `CON_Kleurenschema2022.pdf`) en de kleuren zoals ze
daadwerkelijk in de oude app gerenderd werden (gemeten met pixelanalyse op
de screenshots). Waar die twee uiteenlopen, is dat een fout in de oude
(vibe-gecodeerde) app, geen bewuste afwijking om over te nemen.

## Officiële Coniche-huisstijlkleuren (leidend)

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

Geen officieel rood in de huisstijl (Dark Purple is inmiddels aangeleverd,
dat gat is gedicht — zie hieronder).

## Vergelijking: gemeten (oude app) versus officieel

| Categorie | Gemeten in oude app | Dichtstbijzijnde officiële kleur | Oordeel |
|---|---|---|---|
| Overkoepelend | `#f25d26` | Dark Orange `#FF671F` | Redelijk dichtbij, niet exact — waarschijnlijk lichte rendering-afwijking, geen bewuste keuze |
| Organisatie | `#0da2e7` | Light Blue `#3A70BF` | Duidelijk te fel/cyaan, geen goede match — **fout in de oude app** |
| Proces & Tech | `#7c3bed` | Dark Purple `#392944` | Compleet mis, niet eens bij benadering — de oude app verzon hier een fel paars dat totaal niet op het officiële, veel donkerdere Dark Purple lijkt |
| Mens | `#21c45d` | Light Green `#38845E` | Te fel/fluorescerend, geen goede match — **fout in de oude app** |
| Fundament | `#e7b008` | Dark Yellow `#FFC043` | Te donker/mosterdkleurig, geen goede match — **fout in de oude app** |

**Advies voor Sander: bouw met de officiële kleuren, niet met de gemeten
kleuren uit de oude app.** Voorstel voor de categorie-toewijzing (Dark-
variant voor de hoofdkleur, Light-variant als die ergens nodig is, bijv.
hover-state):

- Overkoepelend: Dark Orange `#FF671F`
- Organisatie: Dark Blue `#225BA0`
- Mens: Dark Green `#197F4E`
- Fundament: Dark Yellow `#FFC043`
- Proces & Tech: Dark Purple `#392944`

Alle 5 categorieën hebben nu een officiële Coniche-kleur. Geen open
besluit meer op dit punt.

**Bevestiging uit een derde bron**: het bestand `coniche-v4.html`
(eerder samen gebouwd voor de Coniche-homepage) gebruikt in zijn
CSS-variabelen exact dezelfde hex-waarden als het officiële kleurenschema
(`--or:#FF671F`, `--bl:#225BA0`, `--gr:#197F4E`, `--ye:#FFC043`) — dat
bestand is dus een betrouwbare, al geïmplementeerde referentie voor hoe
deze kleuren in code toegepast worden, niet alleen als losse hex-waarden.
Vandaar dat de secties hieronder rechtstreeks uit dat bestand komen.

De classificatiekleuren (rood/oranje/groen voor "Basis op Orde"/
"Uitbouwen"/"Sterk punt", zie verderop) hebben hetzelfde probleem voor
rood: geen officiële Coniche-kleur, en ook `coniche-v4.html` definieert
er geen. Daar is het waarschijnlijk minder problematisch, want dat is een
universele status-kleur (rood = probleem), geen merkidentiteit — maar wel
iets om bewust te beslissen, niet zomaar Tailwind-rood aan te houden.

---

## Kleurtokens als CSS custom properties (uit coniche-v4.html)

Sander kan dit blok vrijwel letterlijk overnemen als startpunt voor
`:root` in de nieuwe scan-app, met Proces & Tech (paars) ernaast
toegevoegd, want dat kwam in de homepage niet voor:

```css
:root {
  --or: #FF671F; --or-l: #FF7F41; --or-faint: #FFF2EC; --or-mid: #FFD5C0;
  --bl: #225BA0; --bl-faint: #EBF1FB;
  --gr: #197F4E; --gr-faint: #E8F5EE;
  --ye: #FFC043;
  --pu: #392944; /* Proces & Tech — niet in coniche-v4.html, toegevoegd
                     vanuit het officiële kleurenschema */
  --ink: #1C1C1A; --ink-m: #4D4D49; --ink-s: #888884;
  --bg: #FFFFFF; --bg-warm: #FAF9F7; --bg-mid: #F2F0EB;
  --border: #E8E6E1; --border-d: #D4D1CA;
  --r: 6px; /* standaard border-radius, zie Layout hieronder */
}
```

`--ink`/`--ink-m`/`--ink-s` zijn de drie tekstkleuren (primair, middel,
secundair) — vervangen de losse `#2e3138`/`#6a7181` die ik eerder uit de
screenshots van de oude scan-app mat. Gebruik voortaan deze tokens, niet
de losse hex-waarden verderop in dit document (die blijven staan als
historische referentie, zie de sectie "Gemeten kleuren").

## Typografie

- **Lettertype**: Epilogue (gewichten 400/500/600/700/800), via Google
  Fonts. Dit is de hoofdfont voor zowel body-tekst als koppen.
- **Accentfont**: Source Serif 4 (italic 400/600) — alleen voor citaten/
  quotes (`.pull-quote blockquote`, `.q-txt`), niet voor gewone UI-tekst.
- **Koppen** (`h1`/`h2`/`h3`): font-weight 800 (h1/h2) of 700 (h3),
  line-height 1.1, letter-spacing licht negatief (-.025em/-.015em),
  kleur `var(--ink)`.
  - h1: `clamp(2.5rem, 5vw, 4rem)`
  - h2: `clamp(1.85rem, 3.5vw, 2.65rem)`
  - h3: `1.12rem`
- **Body-tekst** (`p`): line-height 1.78, kleur `var(--ink-m)`.
- **Label/eyebrow-tekst** (`.label`, zie ook `.hero-tag`): font-size
  `.69rem`, font-weight 700, letter-spacing `.14em`, hoofdletters,
  kleur `var(--or)` — dit is het patroon voor kleine kop-labels zoals
  "AI Assessment" of "Klantcontact Assessment" boven een scanpagina.

## Layout en spacing

- **Border-radius**: `--r: 6px` als standaardwaarde voor knoppen; cards
  gebruiken losstaand `10px` (iets ronder dan knoppen, bewust verschil).
- **Container**: `max-width: 1160px`, `padding: 0 2rem`.
- **Sectie-padding**: `6rem 0` verticaal tussen grote pagina-secties.
- **Nav-balk**: vaste hoogte `64px`, `position: fixed`, start transparant
  over een hero-foto/-kleur, wordt wit met blur zodra er gescrold wordt
  (`.scrolled` class: `background: rgba(255,255,255,.95)`,
  `backdrop-filter: blur(16px)`, dunne onderrand in `var(--border)`).

## Logo-gebruik

- **In de navigatiebalk**: `<img>`, hoogte `34px`, breedte automatisch.
- **In de footer**: `<img>`, hoogte `30px`. Het logo staat op een zwarte
  achtergrond; geen kleurfilter nodig omdat het logobestand zelf al
  transparant is en de oranje kleur er vanzelf doorheen zichtbaar is.
- Gebruik in beide gevallen het logo als los beeldbestand (PNG/SVG), niet
  als CSS-achtergrond, zodat de hoogte simpel te sturen is.

## Componenten (knoppen, badges, kaarten — uit coniche-v4.html)

**Knoppen**, drie varianten, alle met `border-radius: var(--r)`,
`padding: .82rem 1.7rem`, `font-weight: 700`, `font-size: .9rem`:
- `.btn-or` — primaire actie: gevuld `var(--or)`, witte tekst, hover
  wordt `var(--or-l)` (Light Orange) plus een lichte `translateY(-1px)`.
  Dit is de knop voor "Start assessment"/"Volgende".
- `.btn-outline-w` — secundair op een donkere/foto-achtergrond: witte
  rand (`2px solid rgba(255,255,255,.5)`), transparante vulling, hover
  vult licht op (`rgba(255,255,255,.1)`).
- `.btn-w` — knop bovenop een oranje sectie-achtergrond: witte vulling,
  oranje tekst, hover krijgt een schaduw plus lichte lift.

**Badges/pills**:
- `.hero-tag` / `.label`-stijl — kleine kop-label: gevuld `var(--or)`,
  witte tekst, hoofdletters, sterk afgerond (`border-radius: 3px`, dus
  minder rond dan de andere pills).
- `.g-badge` — content-tag onder een sectiekop: lichte `var(--or-faint)`
  achtergrond, oranje tekst, volledig rond (`border-radius: 100px`), dunne
  `var(--or-mid)` rand. Dit is vermoedelijk het patroon voor de
  bouwblok-tags in de scan zelf.
- `.logo-p` — klantlogo-pill (los van de scan-app, maar zelfde
  pill-stijl): witte achtergrond, `var(--border-d)` rand, volledig rond.

**Kaarten** (`.p-card`, `.case`, `.q-card`, `.g-stat`): witte of
`var(--bg-warm)` achtergrond, `1px solid var(--border)`, `border-radius:
10px`, `padding: 1.8rem`. Herhaald patroon: een gekleurde accentrand aan
één zijde geeft de categorie of het type content aan —
`.p-card`/`.g-stat` gebruiken een `border-top: 4px solid var(--or)` (met
`.bl`/`.gr` class-varianten voor blauw/groen), `.q-card` gebruikt
`border-left: 4px solid var(--bl)`. Dat is exact hetzelfde idee als de
verticale accentbalk bij de bouwblok-koppen in de scan-app, nu bevestigd
als een terugkerend Coniche-patroon, niet iets unieks voor de scan.

## Gemeten kleuren uit de oude app (referentiemateriaal, niet leidend)

De rest van dit document beschrijft wat er daadwerkelijk in de oude app
gerenderd stond, gemeten met pixelanalyse. Dit blijft waardevol voor
niet-merkgebonden elementen (tekstkleuren, randen, achtergronden,
componentstijl), waar geen huisstijlkleur voor bestaat en er dus ook geen
"fout" kan zijn.

## Merkkleur (primair, zoals gerenderd in de oude app)

- **Primair oranje: `#f25d26`** — gebruikt voor de hoofd-CTA-knoppen
  ("Start assessment", "Volgende"), de oranje kop-woorden ("**Klantcontact**"
  in de titel), en de accentbalk van de Overkoepelend-categorie. Dit is
  géén standaard Tailwind-tint (ligt tussen orange-600 `#ea580c` en
  red-500 `#ef4444` in, warmer/roder dan Tailwind's orange-500 `#f97316`).
- **Knop, inactieve/disabled staat: `#f8ae92`** — gemeten op het
  intake-formulier vóór het aanvinken van de toestemmingscheckbox. Een
  duidelijk lichtere, verzadigingsarme versie van het primaire oranje, niet
  zomaar een opacity-verlaging.
- **Badge/pill-achtergrond (lichte tint): `#fdeee9`** — de lichte
  perzikkleur achter bijvoorbeeld het "Klantcontact Assessment"-label
  bovenaan een scan-pagina.

## Categoriekleuren zoals gemeten (referentie, zie boven voor wat te bouwen)

Gemeten aan de linker accentbalk van bouwblok-koppen, bevestigd over
meerdere bouwblokken per categorie. Dit is dus NIET de bouwinstructie,
alleen documentatie van wat er stond:

| Categorie | Kleur zoals gerenderd | Hex (gemeten, niet leidend) |
|---|---|---|
| Overkoepelend | oranje | `#f25d26` |
| Organisatie | blauw | `#0da2e7` |
| Proces & Tech | paars | `#7c3bed` |
| Mens | groen | `#21c45d` |
| Fundament | goud/geel | `#e7b008` |

## Classificatiekleuren (rood/oranje/groen)

Belangrijk: dit zijn ANDERE kleuren dan de categoriekleuren hierboven, en
ze zijn wél exacte standaard Tailwind-tinten — mogelijk was de oude app
hier niet custom gestyled:

- **Rood ("Basis op Orde"): `#dc2626`** — Tailwind red-600
- **Oranje ("Uitbouwen"): `#f97316`** — Tailwind orange-500 (let op: dit
  is een ANDERE oranje dan het primaire merkoranje `#f25d26` hierboven,
  niet verwisselen)
- **Groen ("Sterk punt"): `#16a34a`** — Tailwind green-600

Gebruikt voor: de score-badges op het resultatenscherm, de balken in
"Score per Categorie"/"Score per Domein" (kleur = classificatie, niet
categoriekleur — dat stond al in CLAUDE.md sectie 4), en de Top
3-cirkeltjes bij Sterktes/Verbeterkansen.

## Tekstkleuren

- **Koppen en primaire tekst: `#2e3138`** — een warme antraciet/houtskool-
  tint, geen standaard Tailwind-zwart of -slate (dichtstbij zou
  neutral-800 `#262626` zijn, maar niet identiek). Consistent gemeten op
  3 verschillende schermen (paginatitel, bouwbloktitel, vraagtekst).
- **Secundaire tekst (antwoordlabels, bijschriften): `#6a7181`** — muted
  blauwgrijs, dicht bij Tailwind slate-500 (`#64748b`) maar niet exact.

## Neutrale kleuren (randen, achtergronden)

- **Kaartrand: `#e5e7eb`** — exact Tailwind gray-200
- **Nummerbadge-achtergrond (bij vraag-antwoordopties): `#f3f4f6`** —
  exact Tailwind gray-100
- **Rij-achtergrond (Top 3-lijsten): `#f9f9fa`** — vrijwel exact Tailwind
  gray-50 (`#f9fafb`)

## Componenten

- **Knoppen**: volledig gevuld (geen outline-stijl) voor de primaire actie,
  afgeronde hoeken (schatting ~8px, niet met zekerheid te meten uit
  screenshots), witte tekst.
- **"Vorige"-knop**: secundaire stijl, lichte grijze rand, geen vulling.
- **Radiobuttons**: dunne cirkel met primair-oranje rand, leeg van
  binnen tot geselecteerd (dan gevuld oranje, zie de ingevulde
  AI-scan-screenshots).
- **Bouwblok-kop**: verticale accentbalk (categoriekleur) links, titel
  vetgedrukt donker, omschrijving direct eronder in secundaire tekstkleur.
- **Tags**: lichte grijze pill-badges onder de bouwblok-omschrijving
  (variabel aantal, zie content-bestanden).
- **Instructieregel**: lichtgrijs vlak (vergelijkbaar met de
  nummerbadge-achtergrond) met de vaste tekst "Beantwoord op basis van wat
  aantoonbaar geregeld is (documenten, ritmes, tooling, afspraken)."

## Wat nog steeds niet met zekerheid uit dit materiaal te halen is

- **Of de scan-app exact dezelfde tokens hergebruikt als coniche-v4.html**,
  of een eigen (verwante) variant. De kleuren zijn identiek bevestigd,
  maar de scan-app is nooit in deze codebasis gebouwd — Sander bouwt 'm
  nu opnieuw, dus dit is een aanname dat hetzelfde systeem herbruikbaar
  is, geen bevestigd feit over de scan-app zelf.
- **Focus- en error-states** (formuliervalidatie, toetsenbord-focus) —
  komen in coniche-v4.html niet voor, dat is een marketingpagina zonder
  formulieren. Hover-states zijn nu wel bekend voor knoppen (zie
  Componenten hierboven).
- **Exacte spacing-schaal buiten wat hierboven staat** (bijv. kleine
  paddings binnen componenten, gap-waarden) — deels uit de CSS te
  destilleren, maar niet volledig gedocumenteerd hier; Sander kan de
  ruwe CSS in coniche-v4.html raadplegen voor specifieke waarden die
  hier niet genoemd staan.
