# Coniche Scan: PDF Klantcontact Volwassenheidsscan, visuele opbouw

**Status: Gebouwd (as-built). Leidend document voor de PDF-export.**
Beschrijft hoe de PDF van één ingevulde Klantcontact Volwassenheidsscan
eruitziet, pagina voor pagina, én de inhoudelijke regels die voor de
PDF-export van **beide** scan-types gelden (bron van de content,
slotsectie, bulk-export). De AI-scan-variant staat in
`export-pdf-visual-ai-scan.md` en beschrijft alleen wat daar anders is;
dit document is voor haar het naslagwerk voor de gedeelde elementen.
Kleuren en typografie komen uit `stylesheet.md`. Bedoeld als overdracht:
Wie de PDF nabouwt of aanpast, vindt hier de maten en keuzes.

**Voorbeeld**: 10 pagina's (A4), bestandsnaam
`<Organisatie> Volwassenheidsscan Report.pdf`.

## Export van één scan, geen aggregatie

Uitsluitend één scan per PDF: Geen geaggregeerde data over meerdere
respondenten, dat is een apart, onbesloten punt (`backlog.md`,
Aggregatie).

**Bulk-export vanuit Ingevulde scans (`admin-beheerpagina.md` punt 7)
blijft beperkt tot CSV.** Geen bulk-PDF: Bij een CSV met meerdere rijen
is er geen aggregatie-vraagstuk (elke rij blijft een eigen scan), bij
een PDF met meerdere scans wel. "Eén gedeelde exportfunctie" (punt 7)
betekent dus: Zelfde functie, twee uitkomsten al naar gelang de context
(CSV bij een selectie van meerdere, CSV of PDF bij precies één scan).

## Bron voor de inhoud

Geen nieuwe content, alleen hergebruik van bestaande bronnen: De scores
komen uit `ScanInvulling.antwoorden`, de organisatie- en
respondentgegevens uit `Organisatie`/`Respondent`/`Meting`, de
toelichting en centrale vraag per bouwblok uit `Bouwblok.toelichting` en
`Bouwblok.centraleVraag` (allemaal `datamodel.md`, dezelfde velden als
de modal in de interactieve visuals gebruikt), en de slotsectie uit
`visie-coniche.md` deel 1 of `content-2030.md` (zie hieronder).

## Slotsectie per scan-type

Eén contentbestand komt volledig en apart terug in de PDF: Als
allerlaatste sectie van het document, na alle bouwblokken/domeinen.
Bouwstenen deel 2 en de AI-domeinen-beschrijvingen zijn geen aparte
sectie: Die tekst zit al per bouwblok verweven, via `Bouwblok.toelichting`
(zie "Per bouwblok" hieronder), dus geen dubbele bron nodig.

```
Assessment {
  ...
  pdfContentSecties: { titel: string, bron: ContentBron } | null
}

type ContentBron =
  | "visie-coniche.md-deel1"
  | "content-2030.md"
```

Beheerbaar bij punt 1 (Assessment-types) in `admin-beheerpagina.md`,
als dropdown met deze vaste bronnen, geen vrij tekstveld (voorkomt een
stille lege sectie bij een tikfout).

- **Klantcontact Volwassenheid**: `{titel: "Visie", bron:
  "visie-coniche.md-deel1"}` → Pagina 10 hieronder.
- **AI-volwassenheid**: `{titel: "2030", bron: "content-2030.md"}` →
  zie `export-pdf-visual-ai-scan.md`, pagina's 6 t/m 9.

## Techniek in het kort

- Server-side HTML naar PDF met Puppeteer (Chromium), één functie:
  `buildResultatenPdfHtml` in `lib/pdf/build-html.ts`. Route:
  `app/api/export-pdf/route.ts`. De browser stuurt de volledige payload
  mee (opslag is nog localStorage).
- Charts zijn handgebouwde SVG's (`lib/pdf/charts.ts`), kleuren uit
  `lib/colors.ts`.
- Footer via CSS `@page`-marginboxen, niet via Puppeteer's
  footerTemplate: Alleen zo kan het logo pas vanaf pagina 2 verschijnen.
- Volle paginabreedte voor de gloed: Zijmarges van de pagina zijn 0, de
  `body` heeft `padding: 0 16mm`.
- **Paginanummering werkt.** Een eerdere versie van deze spec noemde dit
  een "harde technische grens" bij platte browser-print-to-PDF. De
  daadwerkelijke build laat gewone paginanummering zien ("Pagina 1 /
  10"), via Puppeteer, dus geen open punt meer.

## Gedeelde elementen

Deze tabel geldt voor beide scan-types; `export-pdf-visual-ai-scan.md`
verwijst hiernaar.

| Element | Waarde |
|---|---|
| Papier | A4, marge boven 26mm (0 op pagina's met gloed), onder 20mm |
| Zijruimte | 16mm via `body`-padding |
| Lettertype | Helvetica Neue / Arial, body 10,5pt (secties verdicht, zie onder) |
| Tekstkleur | `#1c1c1a` koppen, `#4d4d49` lopende tekst |
| Accent | `#ff671f` (oranje), `#fff2ec` (faint), `#ffd5c0` (mid) |
| Kaart | wit of `#faf9f7`, rand `1px #e8e6e1`, radius 10px |
| Hero (kop-glow) | Verloop `#fff2ec` naar wit, volle paginabreedte; eyebrow "CONICHE SCAN" oranje 8pt, letter-spacing .14em; h1 20pt weight 800, gecentreerd |

**Footer**: Links "Pagina X / Y" (8px, `#888884`). Rechts de korte
scannaam (`Assessment.kortLabel`, bijv. "Volwassenheidsscan", oranje 8px
bold) met het Coniche-logo (9mm hoog) erachter. Op pagina 1 geen logo
(dat staat al in de kop) en het paginanummer links.

## Pagina 1: Resultaten

Eén pagina, full-height flex-kolom (`min-height: 271mm`,
`justify-content: space-between`) zodat de vier blokken de pagina
gelijkmatig vullen.

1. **Kop** op de gloed: Logo links, rechts eyebrow, "`<Organisatie>` –
   Resultaten" en een metaregel `datum | scannaam | respondent`. Onder de
   kop een oranje lijn (3px).
2. **Scores**: Classificatiecirkel (108px, rand 7px in de scorekleur,
   score 23pt), "Resultaat voor `<naam>`", scannaam, voortgang ("x van y
   vragen beantwoord"). Daaronder twee kolommen: Radar (alle bouwstenen)
   en staafdiagram per categorie.
3. **Top 3 Sterktes / Verbeterkansen**: Twee kolommen, per rij een
   scorebadge en de bouwsteennaam.
4. **Legenda**: Drie kolommen (Basis op Orde, Uitbouwen, Sterk punt) met
   scorestippen in de scorekleur, label en omschrijving, woordelijk de
   toelichtingstekst uit CLAUDE.md sectie 1.

## Pagina 2 t/m 9: Bouwstenen, 2 per pagina

Vier pagina's, elk een paar bouwstenen (15 bouwstenen; het laatste paar
telt er één). Per pagina een flex-kolom (`min-height: 245mm`) met een
**oranje horizontale lijn (2px) precies in het midden** tussen de twee
bouwstenen; de ruimte boven en onder de lijn is gelijk (7mm padding plus
de resterende ruimte verdeeld met `margin: auto`). Een bouwsteen wordt
nooit over twee pagina's gesplitst.

**Val op, opgelost**: Een lange opmerking bij een of beide bouwstenen van
een paar kon het paar over de beschikbare paginahoogte laten heen groeien
— omdat elk bouwsteenblok ongesplitst moet blijven, sprong het tweede
blok dan in zijn geheel naar een volgende, verder lege pagina (bijv.
bouwsteen 7 wel, bouwsteen 8 niet meer op dezelfde pagina). De tekst en
marges hieronder zijn daarom verdicht t.o.v. een eerdere versie van deze
pagina's, met meer buffer voor een opmerking. Bij een uitzonderlijk lange
opmerking kan dit zich nog steeds voordoen; zie "Let op bij
aanpassingen".

Per bouwsteen, van boven naar beneden:

- **Kop**: Eyebrow (categorienaam) in de categoriekleur, "{CATEGORIE} ·
  BOUWSTEEN {N}" (bijv. "OVERKOEPELEND · BOUWSTEEN 1"), titel 10,5pt.
  Rechts, op dezelfde hoogte: De **score-badge** (gemiddelde, kleur volgt
  de scorekleur).
- **Centrale vraag**: Blok met linkerrand 3px in de categoriekleur, label
  "CENTRALE VRAAG" 7pt, `Bouwblok.centraleVraag` vetgedrukt.
- **Uitleg**: `Bouwblok.toelichting` in 1 tot 3 alinea's, 8,3pt.
- **Vragentabel**: Kolommen Vraag, Score, Antwoord (het schaallabel dat
  bij die score hoort, `SchaalLabel`, `datamodel.md`, niet het cijfer
  nogmaals). De **score-cel is een badge met conditionele kleur** naar
  het antwoord (`ANTWOORD_KLEUR`, 1 rood tot 5 donkergroen), tekstkleur
  ink op geel en lichtgroen, anders wit. Onbeantwoord: streepje.
- **Opmerking** (alleen als ingevuld, `ScanInvulling.opmerkingenPerBouwblok`):
  Vlak `#faf9f7`, rand, radius 8px.

## Pagina 10: Slotsectie — Visie (stijl van `/visie`)

Eén pagina zonder bovenmarge, zodat de gloed vanaf de paginarand loopt.
Tekst iets verdicht (8,5pt, regelhoogte 1,42) zodat alles past.

1. **Hero**: Eyebrow, h1 "Onze visie op goed klantcontact" en de
   vetgedrukte subtitel (10,5pt, max 150mm breed).
2. **Sectie** "Klantcontact als plek waar beloften worden waargemaakt":
   h2 13pt, vier alinea's.
3. **Warme kaart** "Wat is goed klantcontact?": Achtergrond `#faf9f7`,
   introzin, zes punten in **twee kolommen met oranje vinkcirkels**
   (15px, witte ✓), slotalinea.
4. **Secties** "Kwaliteit zit in het geheel" en "Van meten naar
   verbeteren" als h2 met alinea's.
5. **Verbetercyclus**: Vijf genummerde cirkels (30px, `#fff2ec` met
   oranje cijfer) met het label eronder, tussen de stappen een pijl in
   `#ffd5c0`. Onder de cyclus de slotalinea.

## Bron van de tekst

Zelfde databestanden als de webpagina's, zodat pagina en PDF nooit uit
elkaar lopen: `data/visie-content.ts` (Visie),
`data/bouwstenen-content.ts` en `lib/bouwblok-info.ts` (uitleg per
bouwsteen), `data/klantcontact-assessment.ts` (vragen, schaal, en de
scan-brede PDF-instellingen, in de code `pdfContentSecties` genoemd —
zelfde naam als `Assessment.pdfContentSecties` in `datamodel.md`).

## Open punten

1. Sector/Subsector: Nieuwe organisatievelden toevoegen, of bewust
   weglaten uit de PDF?

## Let op bij aanpassingen

- Wordt de tekst van de Visie langer, dan past hij niet meer op 1
  pagina: Verdicht verder in `.pdf-pagina.visie` of verdeel over twee
  `.pdf-pagina`'s.
- Bouwstenen met veel langere uitleg kunnen het paar over de pagina
  duwen; controleer na een contentwijziging het aantal pagina's (10).
- Geen backticks in de CSS-commentaren in `build-html.ts` (de HTML staat
  in een template literal).
