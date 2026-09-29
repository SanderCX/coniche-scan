# Coniche Scan: Export voor InDesign (XML)

**Status: Specificatie, klaar om te bouwen.** Levert de inhoud van één
ingevulde scan (scores, top 3, contentsectie) los aan als XML plus
losse chart-afbeeldingen, zodat een designer die in een handmatig
opgemaakt InDesign-document kan verwerken — zoals het bredere
adviesrapport waar de scanresultaten en de visie/2030-content nu al
onderdeel van uitmaken. Complementair aan de bestaande PDF-export
(`export-pdf-visual-volwassenheidsscan.md`): Die levert een
kant-en-klare, door Coniche vastgelegde lay-out; deze export levert
dezelfde inhoud in onderdelen, voor een sjabloon dat niet door de app
wordt bepaald.

## Waar dit een plek krijgt

Derde optie in dezelfde Exporteren-dropdown als nu (resultatenpagina
en `admin-beheerpagina.md` punt 7, Ingevulde scans): Naast "Als PDF"
en "Als CSV" komt **"Voor InDesign (XML)"**. Beschikbaar bij precies
één scan, net als PDF — geen bulk-variant, zie "Wat nog niet kan"
hieronder.

## Wat wordt geëxporteerd

Eén ZIP-bestand, bestandsnaam `<Organisatie> InDesign Export.zip`
(analoog aan de PDF, zie `export-pdf-visual-volwassenheidsscan.md`),
met daarin:

1. **Eén XML-bestand** met alle tekstuele en numerieke content.
2. **Losse chart-afbeeldingen** (SVG), waarnaar de XML verwijst op
   bestandsnaam. Geen ingebedde/base64-afbeeldingen: InDesign's
   XML-import plaatst een gekoppelde afbeelding op pad, geen data-URI.

**Attribuutnaam `href` is verplicht, geen vrije naam.** InDesign
herkent alleen het gereserveerde attribuut `href` op een leeg,
getagd element als instructie om een afbeelding automatisch te
plaatsen bij XML-import. Elk ander attribuut (ook een logische naam
als `bestand`) wordt genegeerd: het kader blijft dan stil leeg, geen
foutmelding. Dit geldt voor alle vijf elementen in `<charts>`
hieronder.

**Waarde van `href` heeft altijd de `file:///`-prefix nodig**, ook
bij een relatief pad binnen dezelfde map (altijd het geval in deze
export, alles zit los in één ZIP): `href="file:///./grafiek.svg"`
— de `./` is nodig om InDesign te dwingen dat relatief te lezen
vanaf de map van de XML, in plaats van als root-pad.
Zonder die prefix — ook een op zich geldige relatieve bestandsnaam —
herkent InDesign de waarde niet als beeldpad en blijft het kader
stil leeg.

**Bij het importeren (File > Import XML) moeten deze opties aan
staan**, anders wordt de link niet gelegd of de content niet
ververst:
- **Create Link** (koppeling aanmaken) — zonder deze optie wordt de
  afbeelding niet gelinkt.
- **Delete elements, frames and content that do not match imported
  XML** — zorgt dat een eerdere/lege placeholder-status wordt
  overschreven in plaats van genegeerd.
- **Do not import contents of whitespace-only elements** — voorkomt
  rommelige lege tekstknopen tussen elementen.

Geen nieuwe contentbron: Dezelfde velden als de PDF-export
(`ScanInvulling.antwoorden`, `Organisatie`/`Respondent`/`Meting`,
`Assessment.pdfContentSecties`), aangevuld met `Organisatie.kenmerken`
(de organisatievelden, zie hieronder), alleen anders verpakt.

## XML-structuur

```xml
<scanExport>
  <organisatie>
    <naam>&lt;Organisatie&gt;</naam>
    <kenmerken>
      <sector>Financiële dienstverlening</sector>
      <subsector>Verzekeringen en pensioenfondsen</subsector>
      <totaalKlanten waarde="1800000" b2bPercentage="10" b2cPercentage="90" />
      <contactenCall waarde="2100000" />
      <contactenVoicebot waarde="n.v.t." />
      <contactenLivechat waarde="120000" />
      <contactenChatbot waarde="290000" />
      <contactenEmail waarde="790000" />
      <contactenWhatsapp waarde="70000" />
      <adoptieMijnomgeving percentage="53" />
      <digitaliseringPercentage2026 percentage="50" />
      <digitaliseringAmbitie2030 percentage="80" />
      <techstackContactCenter leverancier="Anywhere" ondersteuning="extern" />
      <techstackConversationalAi leverancier="Spotler" ondersteuning="extern" />
      <techstackCrm leverancier="Microsoft Dynamics 365" ondersteuning="zelf" />
      <techstackKennismanagement leverancier="onderdeel van CRM/MS" ondersteuning="zelf" />
      <techstackLlmOplossing leverancier="n.v.t." ondersteuning="n.v.t." />
      <techstackItDeployment leverancier="Microsoft" ondersteuning="zelf" />
      <fteKlantcontactmedewerkers waarde="..." inhousePercentage="..." bpoPercentage="..." />
      <fteKlantcontactManagementSupport waarde="..." />
      <fteItDevops waarde="..." percentageDigital="..." />
      <kpiAht waarde="n.v.t." />
      <kpiNps waarde="37.4" />
      <kpiCsat waarde="n.v.t." />
      <kpiSla waarde="n.v.t." />
      <kpiFtr waarde="n.v.t." />
    </kenmerken>
  </organisatie>
  <respondent>
    <naam>&lt;Respondent&gt;</naam>
    <functie>&lt;Functie&gt;</functie>
    <team>&lt;Team&gt;</team>
  </respondent>
  <meting>
    <label>Nulmeting 2026</label>
  </meting>
  <assessment>
    <naam>Klantcontact Volwassenheid</naam>
    <kortLabel>Volwassenheidsscan</kortLabel>
  </assessment>
  <datum>2026-09-14</datum>

  <overallScore waarde="3.8" van="5" />
  <voortgang beantwoord="60" totaal="60" />

  <!-- type="categorie" of type="bouwblok", zie toelichting hieronder -->
  <groepsScores type="categorie">
    <groep naam="Strategie" score="3.8" />
    <groep naam="Organisatie" score="3.8" />
    <groep naam="Proces & Tech" score="3.3" />
    <groep naam="Mens" score="4.1" />
    <groep naam="Cultuur" score="4.0" />
  </groepsScores>

  <charts>
    <scoreAlgemeen href="file:///./&lt;organisatie-slug&gt;-volwassenheidsscan-score-algemeen.svg" />
    <radar href="file:///./&lt;organisatie-slug&gt;-volwassenheidsscan-radar.svg" />
    <staafdiagram href="file:///./&lt;organisatie-slug&gt;-volwassenheidsscan-staafdiagram.svg" />
    <top3Sterktes href="file:///./&lt;organisatie-slug&gt;-volwassenheidsscan-top3-sterktes.svg" />
    <top3Verbeterkansen href="file:///./&lt;organisatie-slug&gt;-volwassenheidsscan-top3-verbeterkansen.svg" />
  </charts>

  <contentSectie>
    <titel>Visie</titel>
    <tekst>
      <alinea>Klantcontact is de plek waar beloften worden
      <b>waargemaakt</b>...</alinea>
      <alinea>...</alinea>
    </tekst>
  </contentSectie>
</scanExport>
```

**`kenmerken`**: Eén los, benoemd element per organisatieveld uit
`datamodel.md` (Organisatievelden), 1-op-1 met de huidige, vaste
lijst (Sector, Subsector, Volume en klantbasis, Digitalisering,
Techstack, FTE, KPI's). **Bewust geen JSON-blob zoals bij de
CSV-export** (`export-csv.md`, `organisatie_kenmerken`): Daar was een
blob juist de bedoeling, omdat niets in een CSV-cel een kader in een
sjabloon hoeft te raken. Hier moet elk kenmerk een eigen, taggable
tekstkader in InDesign kunnen vullen, dus elk kenmerk krijgt zijn
eigen elementnaam. Ontbreekt een waarde (organisatie heeft dit
kenmerk niet ingevuld), dan is de waarde `"n.v.t."`, geen leeg
element — zelfde reden als bij de CSV: Een leeg element is in
InDesign niet te onderscheiden van "nog niet getagd".

**Kwetsbaarheid van deze aanpak**: Zodra organisatievelden zelf
beheerbaar worden (`admin-beheerpagina.md`, "Nog te bouwen") en de
lijst dus kan wijzigen, moeten deze elementnamen en het sjabloon
gelijk opgaan. Geen nieuw risico t.o.v. de rest van deze spec (zie
"Eigenaarschap van de tagnamen" onderaan), maar hier weegt het zwaarder
mee: Deze 24 elementen zijn de plek waar een toekomstige wijziging in
organisatievelden het eerst merkbaar wordt.

**`top3Sterktes`/`top3Verbeterkansen` als SVG, geen tekstelementen**
(toelichting): Elke lijst is één afbeelding (rangnummer, naam, score-badge in de
kleur uit `stylesheet.md`'s score-schaal), net als de radar en het
staafdiagram — geen drie losse `<item>`-tekstkaders om per stuk te
taggen. Reden: de opmaak (rangcirkel, gekleurde scorebadge) is vast
vormgegeven en hergebruikt dezelfde renderlogica als het
staafdiagram; als tekstelementen zou dat drie tekstkaders én een los
gekleurd vormkader per item vergen, met evenveel losse tags als een
hele grafiek. Zelfde afweging als bij de charts: één taggable
beeldkader per lijst, inhoud vast bepaald door de export.

**`groepsScores`, attribuut `type`**: Volgt exact dezelfde regel als
`Assessment.categorieen` in `datamodel.md`. Heeft het scan-type een
categorielaag (Klantcontact Volwassenheid, 5 categorieën), dan is
`type="categorie"` en is elke `<groep>` een categorie-gemiddelde.
Ontbreekt die laag (AI-volwassenheid, 8 domeinen plat), dan is
`type="bouwblok"` en is elke `<groep>` een los bouwblok/domein — geen
kunstmatige categorie ertussen, zelfde uitgangspunt als elders
("Maak geen kunstmatige categorieën met elk één bouwblok",
`datamodel.md`).

**`contentSectie`**: Hergebruikt `Assessment.pdfContentSecties`
(`titel` en `bron`, zie `export-pdf-visual-volwassenheidsscan.md`,
Slotsectie per scan-type) — dus bij Klantcontact Volwassenheid de
visie (`visie-coniche.md` deel 1), bij AI-volwassenheid het
2030-duidingsstuk (`content-2030.md`). Ontbreekt `pdfContentSecties`
voor het gekozen Assessment, dan blijft dit element weg uit de XML
(geen leeg element).

**Nadruk binnen `<alinea>`**: Vet en cursief uit de brontekst
(`visie-coniche.md` deel 1 / `content-2030.md`) gaan mee als
inline-markup, `<b>` en `<i>`, geen platte tekst. Bij de omzetting van
markdown (`**vet**`, `*cursief*`) naar deze inline-tags geldt dezelfde
grens als bij de rest van de content: Geen geneste of overlappende
markup (`**vet met *cursief* erin**`) hoeft ondersteund te worden,
alleen losstaand vet of cursief per stuk tekst.

## Techniek in het kort

- Zelfde data-verzameling als `buildResultatenPdfHtml`
  (`lib/pdf/build-html.ts`), alleen de output-stap verschilt: XML +
  losse bestanden in plaats van HTML-naar-PDF.
- De charts zijn er al als SVG (`lib/pdf/charts.ts`); deze export
  hergebruikt die renderfunctie en schrijft het resultaat weg als los
  bestand in plaats van in te bedden in de PDF-HTML. Top3Sterktes en
  Top3Verbeterkansen krijgen een eigen, vergelijkbare renderfunctie
  (rangcirkel + naam + scorebadge), dezelfde aanpak als de charts.
- Bestandsnamen: `<organisatie-slug>-<scannaam-slug>-radar.svg`,
  `...-staafdiagram.svg`, `...-top3-sterktes.svg` en
  `...-top3-verbeterkansen.svg`, zodat ze uniek zijn binnen de ZIP en
  herkenbaar buiten context.

## Sjabloon aan de InDesign-kant

De tagnamen hierboven zijn het contract tussen export en sjabloon: Wie
het InDesign-sjabloon opbouwt, tagt de tekst- en beeldkaders met
precies deze namen (via de Structure-functie, XML-import). Een
afwijkende tagnaam levert geen foutmelding op, alleen een kader dat
bij import stil leeg blijft — dat is de belangrijkste valkuil bij
XML-import in InDesign, dus deze XML-structuur is de bron van waarheid
voor het taggen, niet andersom.

## Wat nog niet kan

- **Geen bulk-export.** Elke export rendert charts en vult een
  contentsectie voor één scan; bij een selectie van meerdere scans is
  er geen vraag hoe die zich tot elkaar verhouden (los naast elkaar in
  de ZIP, of samengevoegd?) zonder een aggregatie-vraagstuk aan te
  raken. Zelfde grens als bij PDF (`export-pdf-visual-volwassenheidsscan.md`,
  "Export van één scan, geen aggregatie").
- **Geen aggregatie over meerdere respondenten binnen een Meting.**
  Staat in `backlog.md` onder Functioneel als nog niet ontworpen. Deze
  XML-structuur is er wel naar toe te groeien: Een aggregaat zou
  dezelfde `groepsScores`/`top3Sterktes`/`top3Verbeterkansen`-vorm
  krijgen, één laag hoger (per Meting in plaats van per
  ScanInvulling), plus een veld voor het aantal respondenten. Dat is
  hier bewust niet vastgelegd zolang de aggregatie zelf geen
  ontwerpkeuze heeft.

## Beslist

- **Nadruk binnen `contentSectie`**: Gaat mee als inline-markup
  (`<b>`/`<i>`), geen platte tekst. Zie hierboven.
- **Eigenaarschap van de tagnamen**: Joost tagt en beheert het
  InDesign-sjabloon zelf, deze spec is en blijft daarbij de bron van
  waarheid voor de tagnamen (geen apart afstemmingsrisico tussen twee
  partijen).
- **`kenmerken` als losse elementen, geen JSON-blob**: Bewuste
  afwijking van de CSV-export, zie toelichting bij `kenmerken`
  hierboven.
- **`scoreAlgemeen` en `top3Sterktes`/`top3Verbeterkansen` als SVG, geen
  tekstelementen**: Zie toelichting hierboven.
