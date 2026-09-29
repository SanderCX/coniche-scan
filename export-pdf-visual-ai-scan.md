# Coniche Scan: PDF AI-scan, visuele opbouw

**Status: Gebouwd (as-built).** Beschrijft hoe de PDF van één ingevulde
AI-volwassenheidsscan eruitziet, pagina voor pagina. De gedeelde regels
(bron van de content, slotsectie-schema, bulk-export, techniek, gedeelde
elementen als papier/marges/hero/footer) staan in
`export-pdf-visual-volwassenheidsscan.md`, dat document is leidend voor
beide scan-types; dit document beschrijft alleen wat voor de AI-scan
anders is.

**Voorbeeld**: 9 pagina's (A4), bestandsnaam `<Organisatie> AI-scan
Report.pdf`. Footer rechts: `Assessment.kortLabel` ("AI-scan") met het
logo.

## Pagina 1: Resultaten

Zelfde opbouw als de volwassenheidsscan: Kop op gloed, classificatiecirkel,
radar, top 3 en legenda. Verschillen: De AI-scan heeft geen categorielaag,
dus in plaats van het staafdiagram per categorie staat er het
staafdiagram per domein, en de sortering volgt de score
(`Assessment.scoresPerGroepGesorteerd`, `datamodel.md`). De radar heet
"Alle AI-domeinen".

## Pagina 2 t/m 5: AI-domeinen, 2 per pagina

Acht domeinen, **overal precies 2 per pagina**, gescheiden door de
oranje middenlijn (zie `export-pdf-visual-volwassenheidsscan.md`).
Omdat een AI-domein 5 vragen heeft (bouwsteen: 4) en langere uitleg,
gebruikt deze scan de compacte variant (`.bouwsteen-pagina.compact`):

| | Normaal | Compact |
|---|---|---|
| Lettergrootte blok | 8,3pt | 8,2pt |
| Regelhoogte | 1,4 | 1,4 |
| Tabelcel | 7,8pt, padding 2px | 7,8pt, padding 2px |
| Ruimte rond middenlijn | 7mm | 6mm |

De compacte variant wordt automatisch gekozen als een bouwblok meer dan
4 vragen heeft (`build-html.ts`, variabele `compact`). Het eyebrow
boven de titel is oranje in plaats van de categoriekleur: De AI-scan
heeft geen categorielaag en dus geen categoriekleur om te tonen
(`datamodel.md`, `Assessment.categorieen` is hier `null`). Kop per
domein: "AI-DOMEIN {N}", verder dezelfde opbouw (naam + score-badge,
centrale vraag, uitleg, vragentabel, opmerking) als een bouwsteen in
`export-pdf-visual-volwassenheidsscan.md`.

## Pagina 6 t/m 9: Slotsectie — Klantcontact richting 2030 (stijl van `/klantcontact-2030`)

Vier pagina's, handmatig verdeeld (`.pdf-pagina`, elk met een eigen
paginabreuk en 14mm bovenruimte) zodat geen kaart of kop midden op een
pagina wordt afgebroken. Tekst 8,8pt, regelhoogte 1,45; h2 15pt.

| Pagina | Inhoud |
|---|---|
| 6 | Hero met gloed vanaf de paginarand (geen bovenmarge), twee inleidende alinea's, "Vijf dingen die iedere organisatie moet ontwerpen" met introzin en 5 kaarten |
| 7 | "De machine customer: nieuwe combinaties": Twee alinea's, introzin en bullets, 3 kaarten, twee slotalinea's |
| 8 | "Wat dit voor AI concreet betekent" (4 kaarten) en "Kosten en businesscase" |
| 9 | "Wat dit voor mensen betekent", de warme kaart "Wat organisaties die zich hierop voorbereiden gemeen hebben" en "De relatie met deze scan" |

**Genummerde kaart**: Wit, rand `1px #e8e6e1`, radius 10px, padding
9px 14px, links een cirkel (24px, `#fff2ec`, oranje cijfer 9pt bold),
titel vetgedrukt, daaronder de tekst. Kaarten worden niet gesplitst.

**Warme kaart** (kenmerken): `#faf9f7`, rand, radius 10px, koptekst
11,5pt, introzin, vijf kenmerken in twee kolommen (titel vet, tekst
8,6pt).

De kop "Geen vast eindbeeld" staat er bewust niet in: Die is ook op
`content-2030.md` en de bijbehorende webpagina weggehaald.

## Bron van de tekst

`data/klantcontact-2030-content.ts` (ook de vaste tussenzinnen:
`vijfDingenIntro`, `machineCustomerEffectenIntro`, `kenmerkenIntro`),
`data/ai-domeinen-content.ts` en `lib/bouwblok-info.ts` (uitleg per
domein), `data/ai-scan-assessment.ts` (vragen, schaal, en de scan-brede
PDF-instellingen — zie de naamverschil-opmerking in
`export-pdf-visual-volwassenheidsscan.md`, Bron van de tekst). Opbouw
van de 2030-pagina's: `lib/pdf/content-secties.ts`, functie
`content2030Html`.

## Let op bij aanpassingen

- Wordt de 2030-tekst langer, dan loopt een van de vier pagina's over:
  Herverdeel de blokken in `content2030Html` (pagina 7 zit het krapst).
- Controleer na een contentwijziging het aantal pagina's (9) en dat elk
  domeinpaar op één pagina staat.
