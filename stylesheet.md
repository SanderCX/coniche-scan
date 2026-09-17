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

De classificatiekleuren (rood/oranje/groen voor "Basis op Orde"/
"Uitbouwen"/"Sterk punt", zie verderop) hebben hetzelfde probleem voor
rood: geen officiële Coniche-kleur. Daar is het waarschijnlijk minder
problematisch, want dat is een universele status-kleur (rood = probleem),
geen merkidentiteit — maar wel iets om bewust te beslissen, niet zomaar
Tailwind-rood aan te houden.

---

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

## Wat NIET met zekerheid uit de screenshots te halen is

- **Font-family**: visueel een systeem-sans-serif, consistent met Inter of
  vergelijkbaar, maar dit is niet met zekerheid uit pixels te herleiden.
  Vraag dit na bij Sander (waarschijnlijk staat het al vast in zijn
  Tailwind-config van de oude app) of lever een Figma/huisstijlbron aan.
- **Exacte border-radius- en spacing-schaal** (px-waarden voor
  afgeronde hoeken, padding, marges) — visueel te schatten maar niet
  pixel-exact te meten zonder de originele CSS of een designbestand.
- **Hover-, focus- en error-states** — geen van de screenshots toont deze
  interactiestaten (behalve de disabled-knop hierboven).
