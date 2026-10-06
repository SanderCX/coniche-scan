# Coniche Scan: Projectspecificatie

Doorlopende specificatie van de Coniche Scan-app: Uitgangspunten,
scoringslogica en schermflow, met verwijzingen naar het datamodel en de
opmaak. Het document groeit mee terwijl er
iteratief functionaliteit en nieuwe scans (assessment-types) bijkomen.
Waar het ambigu of onvolledig is, wordt dat hier opgelost.

## Bestanden

| Bestand | Inhoud |
|---|---|
| `CLAUDE.md` | Dit document. Uitgangspunten, scoring, schermflow |
| `datamodel.md` | Het datamodel: Deel 1 gebouwd, deel 2 (rollen, rechten, inlog) voorstel |
| `stylesheet.md` | Alle opmaak: Kleuren, typografie, componenten |
| `visie-coniche.md` | Visie op goed klantcontact en de vijftien bouwstenen |
| `inhoudelijk-fundament.md` | Hoe visie, bouwstenen en scan samenhangen, met status per onderdeel |
| `content-klantcontact-volwassenheid.md` | Vragen en tags van de Klantcontact Volwassenheidsscan |
| `content-ai-scan.md` | Vragen van de AI-volwassenheidsscan |
| `content-zorgscan.md` | Vragen van de Zorgscan, sector-variant van de Klantcontact Volwassenheidsscan |
| `visie-ai-klantcontact.md` | Visie op AI in klantcontact, per domein van de AI-volwassenheidsscan |
| `content-2030.md` | Duidingsstuk "Klantcontact richting 2030", los van de scanresultaten |
| `bouwstenenmodel-visual.md` | Spec voor het interactieve overzicht van de 15 bouwstenen |
| `ai-domeinenmodel-visual.md` | Spec voor het interactieve overzicht van de 8 AI-domeinen |
| `privacy-pagina.md` | De privacypagina |
| `export-pdf-visual-volwassenheidsscan.md` | PDF-export van één ingevulde scan: gedeelde regels (bron, slotsectie, bulk-export) plus de visuele opbouw voor de Klantcontact Volwassenheidsscan |
| `export-pdf-visual-ai-scan.md` | PDF-export: visuele opbouw voor de AI-volwassenheidsscan, verschillen t.o.v. hierboven |
| `export-pdf-visual-zorgscan.md` | PDF-export: visuele opbouw voor de Zorgscan, verschillen t.o.v. `export-pdf-visual-volwassenheidsscan.md` (grotendeels geen, zelfde structuur als het template) |
| `export-indesign.md` | Export van één ingevulde scan als XML + losse chart-afbeeldingen, voor handmatige verwerking in een InDesign-sjabloon |
| `export-csv.md` | Export naar CSV: kolommen voor de "Als CSV"-optie, één of meerdere scans |
| `beheerpagina.md` | De beheeromgeving |
| `import-scans.md` | Import van scans (CSV): de oude, stopgezette tool, en onze eigen export teruglezen |
| `sbi-indeling.md` | Vaste optielijst voor Sector/Subsector (SBI2025, top 2 niveaus) |
| `backlog.md` | Bewust nog niet opgepakt |
| `go-live-plan.md` | Actielijst naar productie |
| `changelog.md` | Bouwlog van Sander: per datum wat er in de code veranderd is, waarom, en welke specs daarbij zijn bijgewerkt |

## Uitgangspunten

- Bouw de flow generiek over data heen, niet met hardcoded schermen per
  bouwblok. Bouwblokken, vragen, schaallabels en organisatievelden zijn
  data. Een nieuw scan-type of veld vraagt dan een beheerscherm dat die
  data bewerkt, geen nieuwe flow.
- De app hoeft voorlopig niet responsive te zijn. Ontwerp en test voor
  desktop.
- Uitleg bij een veld of knop staat in een Info-icoon en niet als vaste
  tekst eronder (`stylesheet.md`, Info-icoon). Elke Info-icoon-tekst heeft
  een initiële waarde en is door een Admin aan te passen op de plek zelf
  (`beheerpagina.md`, punt 2a, Algemene teksten).
- Een actie is een knop en geen link. Links zijn er alleen voor navigatie:
  kruimelpad, header, footer en verwijzingen in lopende tekst
  (`stylesheet.md`, Knoppen en links).
- Een scan, Respondent of Organisatie die iemand bewerkt, kan niet
  tegelijk door een ander bewerkt worden (`datamodel.md`, Bewerkslot).

## Status

De doorloopflow en de beheeromgeving (Organisaties, Metingen,
Ingevulde scans) zijn gebouwd, met de content van de Klantcontact
Volwassenheidsscan, de AI-volwassenheidsscan en de Zorgscan (sector-variant
van de Klantcontact Volwassenheidsscan, `content-zorgscan.md`).

- **Opslag**: Prototypefase. De data staat in de localStorage van de
  browser. Sander werkt daarnaast met een Neon-database als tijdelijke
  serveropslag. Welke database definitief wordt en waar die draait, volgt
  na afstemming met IT (`backlog.md`). Zonder gedeelde opslag werkt een
  link alleen in de browser waar de data staat.
- **Inlog en rollen**: E-mail en wachtwoord voor beheer, met een rolkeuze
  op het inlogscherm. De rollen Admin en Consultant aan de beheerkant en
  Lead en Respondent aan de klantkant zijn nu ingericht als testhulp
  (prototype). De definitieve rollen, rechten, 2FA en inlog volgen met de
  backend (`datamodel.md` deel 2), en de rolkeuze op het inlogscherm
  verdwijnt dan. Admin-accounts hebben onderling dezelfde rechten, en meer
  dan een Consultant.
- **Toegang respondenten**: Via een korte persoonlijke link (10-teken
  code, cryptografisch gegenereerd, zie `datamodel.md`, Toegangscode),
  zonder verificatiecode. E-mailverificatie volgt als er een backend en
  een Coniche-mailserver zijn (`backlog.md`).
- **Bewust uitgesteld**: AI-managementsamenvatting, aggregatie over
  meerdere respondenten (`backlog.md`).
- **Export**: Als PDF (`export-pdf-visual-volwassenheidsscan.md` e.v.),
  als CSV (`export-csv.md`) en voor InDesign als XML (`export-indesign.md`)
  zijn alle drie gebouwd, vanuit dezelfde Exporteren-dropdown op de
  resultatenpagina en bij Ingevulde scans (`beheerpagina.md` punt 7).

## Terminologie

In de interface en in alle specs: **Organisatie**, **Meting** (een
geplande ronde van één scan-type bij één organisatie), **Respondent** (de
persoon), **Ingevulde scan** (één invulling door één respondent binnen
één meting). Niet "leden" of "scanuitvoering". In de code heten sommige
typen nog anders; dat staat in het datamodel.

---

## Datamodel en opmaak

Het datamodel en de opmaak staan in eigen bestanden. Ze worden via een
import bij elke sessie meegeladen:

- Datamodel (deel 1 gebouwd, deel 2 voorstel): @datamodel.md
- Opmaak: @stylesheet.md

Wijzig je iets aan de datatypen of de database, lees dan eerst het
datamodel. Wijzig je iets aan de vormgeving, dan de stylesheet.

---

## 1. Scoringslogica

Elk bouwblok heeft een gewicht `g` (standaard 1, zie `datamodel.md`,
`Bouwblok.gewicht`). Alleen de Zorgscan heeft nu bouwblokken met een
ander gewicht (4, 10 en 11 op 2). Volledige uitwerking en rekenvoorbeeld
staan in `datamodel.md`, Scoreberekening.

- **Bouwblokscore**: Gemiddelde van de vragen binnen het bouwblok,
  ongewogen, afgerond op 1 decimaal.
- **Categoriescore**: Gewogen gemiddelde van de bouwblokscores binnen de
  categorie (`Σ(g × score) / Σ g`), afgerond op 1 decimaal.
- **Overall score**: `Σ(g × som antwoorden per bouwblok) / Σ(g × aantal
  vragen per bouwblok)`. Bij gewicht 1 overal is dat de som van alle
  antwoorden gedeeld door 60. Dit is niet het gemiddelde van de
  categoriescores: Categorieën hebben een ongelijk aantal bouwblokken (2,
  4, 4, 4, 1) en zouden anders ongelijk meewegen. De overall komt uit de
  ruwe antwoorden en niet uit afgeronde bouwblokscores.
- **Afronding**: Half-away-from-zero (zoals JS `toFixed(1)`), alleen op
  getoonde waarden.
- **Voortgang**: Beantwoorde vragen gedeeld door het totaal aantal vragen
  in de scan.
- **Status in de sidebar**: Nog niet begonnen (grijs nummer), bezig
  (gevuld cirkeltje met "x/4" naast de titel), afgerond (groen vinkje).

### Classificatie

- "Basis op Orde" (onder 2,5): "De basis moet op dit punt eerst op orde
  gemaakt worden om verder te kunnen uitbouwen."
- "Uitbouwen" (2,5 tot en met 3,49): "De basis is op orde en je bent
  onderweg, maar er is nog een verbeterstap nodig om richting excellent
  te gaan."
- "Sterk punt" (vanaf 3,5): "Hier is de organisatie al heel goed in.
  Benut dit optimaal en bouw het verder uit, ook ter ondersteuning van
  zwakkere bouwblokken."

### Scorekleuren

Elke score krijgt een kleur op basis van de afgeronde waarde: 5
donkergroen, 4 lichtgroen, 3 geel, 2 oranje, 1 rood. Basis op Orde is
daarmee rood of oranje, Uitbouwen geel, Sterk punt licht- of donkergroen.
Tokens en details in `stylesheet.md`.

### Top 3

De bouwblokken gesorteerd op score: De hoogste 3 zijn de sterktes, de
laagste 3 de verbeterkansen.

---

## 2. Kleuren per categorie

Overkoepelend oranje, Organisatie blauw, Proces & Tech paars, Mens groen,
Fundament antraciet. De interactieve flow gebruikt deze kleuren; de
PDF-export gebruikt overal oranje.

Alle opmaakwaarden (hexcodes, tekstkleuren, scorekleuren, knopstaten)
staan uitsluitend in `stylesheet.md`.

---

## 3. Schermflow

### Globale layout

Eén gedeelde navigatiebalk en footer op elk scherm, als één component,
vormgegeven volgens `stylesheet.md`. Alle schermen gebruiken de tokens
uit `stylesheet.md`.

De nav heeft een vast deel links (logo) en een contextueel deel rechts
(`.nav-right`) met acties voor het scherm waar je bent. Volgorde binnen
`.nav-right`, overal gelijk:

1. Scherm-specifieke acties, indien aanwezig, uiterst links (bijv.
   "Naar resultaten →" op de doorloopflow zodra de scan afgerond is,
   "← Terug naar de scan" samen met "Exporteren" op de resultatenpagina,
   geen scheidingslijn tussen die twee onderling, in beheer:
   "Applicatie", "Assessments" en "Organisaties" voor een Admin, alleen
   "Organisaties" voor een Consultant, zie `beheerpagina.md`, Wat
   beheerbaar is). Geen
   apart concept meer voor een terug- versus een vooruit-actie binnen
   hetzelfde scherm: Beide staan hier, uiterst links, ongeacht de
   richting.
2. Een verticale scheidingslijn, **alleen als punt 1 iets bevat**.
3. **De 4 vaste content-links** (Visie, Bouwstenen, AI, 2030, zie
   verderop in deze sectie). Aanwezig op elk scherm, inclusief de 3
   publieke schermen (Kies jouw assessment, Assessment-landingspagina,
   Voorbeeld-output) en het intake-scherm.
4. Een verticale scheidingslijn, **alleen als punt 5 iets bevat**.
5. Uiterst rechts de link om de sectie te verlaten, met een `←` ervoor
   (bijv. "← Terug naar Mijn metingen" op de doorloopflow, de
   resultatenpagina en de 4 content-pagina's). Op de 4 content-pagina's
   staat deze link alleen bij een herkende gebruiker; zonder sessie
   ontbreekt hij, met de scheidingslijn ervoor (punt 4), en eindigt de
   nav op de 4 links en "Inloggen". Terug gaat dan via het logo.
   **Beheer heeft geen
   exit-actie**: Geen "← Terug naar site" — voegde niets toe en
   verwarde met "Uitloggen" in het Accountmenu ernaast (twee manieren
   om "weg te gaan" naast elkaar). Uitloggen is de enige manier om
   beheer te verlaten. Was eerder wél gespecificeerd, hierbij vervallen.
6. Een verticale scheidingslijn, **alleen als punt 7 iets bevat**.
7. **Identiteitsmenu, helemaal uiterst rechts, voorbij de exit-actie**:
   Het Accountmenu (`beheerpagina.md`) aan de beheerkant, het
   "Mijn gegevens"-menu (verderop in deze sectie) aan de respondentkant.
   Op elk scherm zonder ingelogde/herkende gebruiker (scherm 1, Kies jouw
   assessment, de andere publieke schermen en de 4 content-pagina's
   zonder sessie) staat hier in plaats daarvan **"Inloggen"** —
   zelfde plek, uitgelogde variant van datzelfde slot, geen dropdown en
   geen pijltje ervoor of erachter. Het slot is dus nooit leeg: Met een
   herkende gebruiker staat er het menu, zonder staat er "Inloggen". Conventie: Een account-/profielmenu
   (of de uitgelogde variant ervan) staat vrijwel altijd als
   allerlaatste element in een nav, voorbij eventuele terug-links, niet
   ervoor. Dit corrigeert een eerdere versie van deze spec die het
   Accountmenu links van de exit-actie plaatste.

**Geen scheidingslijn zonder inhoud aan beide kanten.** Op "Mijn
metingen" bijvoorbeeld staan de 4 links en het "Mijn gegevens"-menu,
met precies één scheidingslijn ertussen: Geen scherm-specifieke actie
(punt 1) en geen exit-actie (punt 5) op dat scherm, dus geen
scheidingslijn dáár.

**"Terug naar" is niet automatisch de exit-actie.** Op de
resultatenpagina is "Terug naar de scan" een scherm-specifieke actie
(punt 1, je blijft binnen dezelfde scan), "Terug naar Mijn metingen" is
de exit-actie (punt 5, je verlaat de scan). Beide staan er dus naast
elkaar, niet in plaats van elkaar.

Welke acties op de overige schermen in de nav horen, wordt aangevuld
zodra de visuele uitwerking verder is.

**Logo, contextafhankelijk**: Op de publieke schermen (Kies jouw
assessment, Assessment-landingspagina, Voorbeeld-output) gaat het logo
naar `#/`, zoals nu. Zodra een respondent binnen zijn persoonlijke link
zit (intake, doorloopflow, resultaten, Mijn metingen, en de 4
content-pagina's), gaat het logo naar "Mijn metingen" in plaats van naar
de publieke homepage. Dit stond nergens vastgelegd, dus `#/` overal was
geen afwijking van de spec maar een gat erin.

### Schermen

1. **Kies jouw assessment**: Kaarten per Assessment-type, generiek over
   `Assessment[]`. **`.nav-right`**: De 4 vaste content-links, dan
   "Inloggen" in het identiteitsmenu-slot (Globale layout hierboven,
   punt 7) — gaat naar scherm 4a, Toegang (e-mail + verificatiecode),
   voor een respondent/Lead die al een account heeft maar zijn
   persoonlijke link niet bij de hand heeft. Nu de enige weg naar
   scherm 4a buiten "Uitloggen" om. Geen scherm-specifieke actie op dit
   scherm (punt 1 leeg), dus geen scheidingslijn daarvóór.
2. **Assessment-landingspagina**: Titel, hero, 3 feature-cards en een
   blok "Praktische informatie" met invultijd, direct resultaat en
   privacy. "Start assessment" staat direct onder de hero maar is
   uitgeschakeld, met de uitleg dat toegang via een persoonlijke link
   loopt. Verderop "Bekijk wat je krijgt" (naar scherm 3). Deze pagina
   wordt later mogelijk een leadgenerator met "Toegang aanvragen"
   (`backlog.md`).
3. **Voorbeeld-output**: Dezelfde resultaatcomponenten als scherm 6, met
   vaste demodata. De resultaatcomponent wordt één keer gebouwd.
4. **Respondent-intake**: Naam, rol/functie, team en notities. Verplicht
   toestemmingsvakje ("Ik geef toestemming om mijn antwoorden te delen
   met Coniche"), met een link naar `privacy-pagina.md`. Alleen
   client-side verplicht: Er wordt geen aparte toestemmingsstatus
   opgeslagen, geen nieuw datamodel-veld.

   **Wegingskaart**: Heeft het Assessment minstens één bouwblok met een
   gewicht ongelijk aan 1, dan staat bovenaan de intake (boven het
   formulier) een kaart (`stylesheet.md`, Wegingskaart) met een
   weegschaalicoon, met:
   `Assessment.wegingTitel`, `Assessment.wegingToelichting` en daaronder
   een chip per bouwblok met gewicht ongelijk aan 1, bijvoorbeeld
   "Kanaalmanagement (2×)". De chips staan op volgorde van het
   bouwblok-nummer. Zijn titel of toelichting leeg, dan geldt de
   standaardtitel "Gewogen scoring" en de standaardtekst "Binnen dit
   assessment wegen niet alle bouwblokken even zwaar mee in de
   totaalscore. De volgende bouwblokken tellen extra mee:". Heeft geen
   enkel bouwblok een afwijkend gewicht, dan verschijnt de kaart niet.
   Gewicht 1 is de normale situatie en wordt nergens getoond. De tekst
   is per Assessment aanpasbaar in beheer (`beheerpagina.md`).

   **Openen van de persoonlijke link**: De link gaat altijd eerst naar
   "Mijn metingen" (naam volgt), ook als de respondent maar één
   invulling heeft. Van daaruit door naar de intake (bij
   `"uitgenodigd"`), de doorloopflow (bij `"bezig"`) of de resultaten
   (bij `"afgerond"`), per invulling. Bij meerdere invullingen toont de
   pagina ze allemaal met hun status. Bovenaan, boven de lijst, een
   introtekst uit `mijnMetingenIntro` (`datamodel.md`, Algemene
   teksten) — beheerbaar, geen vaste tekst in de code.

   **Bij een Lead-rol** (`datamodel.md` deel 2) komen hier ook de
   resultaten van en de uitnodigen-actie voor zijn toegewezen Metingen
   bij (niet de hele organisatie), ongeacht of de Lead zelf invullingen
   heeft — zie `beheerpagina.md`, punt 6a.

   **In de header van "Mijn metingen" staan de 4 vaste content-links**
   (zie de Globale layout hierboven, punt 1 van `.nav-right`), elk naar
   een gewone leespagina (geen modal, geen visual, alleen tekst):
   - **Visie** → `visie-coniche.md` deel 1
   - **Bouwstenen** → de interactieve bouwstenenmodel-visual, route
     `/bouwstenen` (`bouwstenenmodel-visual.md`). Geen aparte leespagina
     meer: De beschrijving en centrale vraag per bouwsteen
     (`visie-coniche.md` deel 2) komen uitsluitend nog terug in de
     modal die opent bij het klikken op een bouwsteen binnen dit
     component.
   - **AI** → de interactieve ai-domeinenmodel-visual, route `/ai-scan`
     (`ai-domeinenmodel-visual.md`). Zelfde patroon: `visie-ai-
     klantcontact.md` levert de modal-content per domein, geen losse
     leespagina.
   - **2030** → `content-2030.md`, gewone leespagina (geen modal, geen
     visual, alleen tekst)

   **Deze 4 links staan op elk scherm van de app**, zie de Globale
   layout hierboven. Sta je al op "Visie", dan zie
   je in `.nav-right` nog steeds ook Bouwstenen/AI/2030, zodat je
   rechtstreeks naar een andere kunt springen zonder eerst terug te
   gaan. Op de 4 content-pagina's, de doorloopflow en de
   resultatenpagina komt daarna, na de scheidingslijn, de losse
   exit-actie "← Terug naar Mijn metingen" (zie de nav-volgorderegel
   hierboven). Die 4 links plus de terugknop staan dus naast elkaar, de
   een vervangt de ander niet. Op Mijn metingen zelf is die terugknop er
   niet, dat is al de hub.

   Voor nu staan alle vier er altijd, ongeacht welke scan-type(s) de
   respondent heeft. **Open, te bespreken met Sander**: Of Bouwstenen en
   AI straks conditioneel worden (alleen tonen bij het bijbehorende
   scan-type), zoals eerder overwogen. Nog geen besluit, bewust als
   vraag laten staan in plaats van stilzwijgend een van beide te kiezen.

   **"Mijn gegevens"-menu.** Niet te verwarren met het Accountmenu uit
   `beheerpagina.md` (dat is voor beheerders, dit is voor
   respondenten): Een dropdown-knop, zelfde patroon als de Dropdown-knop
   uit `stylesheet.md`. Zichtbaar op elk scherm waar een respondent-
   identiteit bestaat: "Mijn metingen", de doorloopflow, de
   resultatenpagina en de 4 content-pagina's, wanneer bereikt via een
   persoonlijke link. Niet op de 3 publieke schermen en niet op de
   intake zelf (daar is nog geen opgeslagen identiteit om te tonen).

   Positie in `.nav-right`: Punt 7 van de nav-volgorderegel in Globale
   layout hierboven, helemaal uiterst rechts, voorbij de exit-actie
   "← Terug naar Mijn metingen" (niet ervoor).

   - **Knop**: Label "Mijn gegevens", met het pijltje van de
     dropdown-knop. Geen naam/e-mail in de knop zelf: Die staan al in
     de dropdown-inhoud.
   - **Dropdown-inhoud, rij 1, klikbaar**: "Gegevens bekijken/wijzigen"
     → opent een modal (dezelfde basismodal uit
     `stylesheet.md`, "Modal en Toelichtingsmodal"), niet een
     losse pagina. In die modal hetzelfde formulier als de intake (naam,
     rol/functie, team, notities), vooringevuld met de huidige waarden
     van `Respondent`. Hergebruik van het intake-formulier, geen nieuw
     formulier bouwen. Opslaan schrijft direct naar `Respondent`, geen
     aparte bevestigingsstap.
   - **Dropdown-inhoud, rij 2, klikbaar**: "Uitloggen" → navigeert naar
     het nieuwe scherm "Toegang" (zie hieronder) en wist de lokale
     respondent-sessie in deze browser (de `code` die aan deze sessie
     gekoppeld is, zie `datamodel.md`, Toegangscode). Respondenten
     hebben geen account om echt op af te melden, dit is het verlaten
     van de lokale sessie, niet een serverside logout.

4a. **Toegang** (nieuw scherm, publiek, geen inlog nodig): De
    bestemming van "Uitloggen" hierboven, én van "Inloggen" op scherm 1,
    en de eerste stap van de toekomstige e-mailverificatie-flow uit
    `datamodel.md` deel 2 (`VerificatieCode`). Nu al gebouwd, zonder de
    code-stap erachteraan:

    - Eén e-mailveld en een knop "Versturen".
    - Na versturen: Een vaste, neutrale bevestigingstekst, ongeacht of
      het adres bestaat (bijv. "Als dit e-mailadres bekend is, ontvang
      je een nieuwe toegangslink"). Geen daadwerkelijke code of link
      wordt verstuurd: Dat vraagt de Coniche-mailserver, die er nog
      niet is (`backlog.md`). Dit scherm is dus nu een niet-functionele
      voorkant van een latere echte flow, geen mock die iets anders
      beweert te doen dan het kan.
    - **Later, met de backend**: Dit scherm wordt gevolgd door een
      code-invoerstap (`VerificatieCode`, 15 minuten geldig,
      `datamodel.md` deel 2), en de link naar deze pagina blijft
      hetzelfde.
5. **Doorloopflow**: Sidebar met naam respondent, voortgang, categorieën
   met genummerde bouwblokken, actief bouwblok gemarkeerd en drie
   statussen. De sidebar blijft staan als de inhoud rechts scrolt (zie
   `stylesheet.md`). Per bouwblok: Een kop in de categoriekleur met titel
   en omschrijving, een icoon naast de titel dat de Toelichtingsmodal
   opent (`stylesheet.md`: eyebrow, naam, centrale vraag en
   `toelichting`, dezelfde modal als in de visuals), tags, de instructieregel "Beantwoord op basis van
   wat aantoonbaar geregeld is (documenten, ritmes, tooling,
   afspraken).", de vragen met 5-puntsschaal en één opmerkingenveld per
   bouwblok. Heeft een bouwblok een gewicht ongelijk aan 1, dan staat
   naast de titel een kleine chip met de factor ("2×") en in de sidebar
   achter het bouwblok dezelfde marker. Bij gewicht 1 staat er niets. Op het laatste bouwblok wordt "Volgende" de knop "Bekijk
   resultaten".

   **Eén persoon tegelijk per scan.** Een scan die iemand invult, is
   voor anderen vergrendeld (`datamodel.md`, Bewerkslot). Opent een tweede
   persoon dezelfde scan, dan krijgt die een melding dat de scan nu in
   gebruik is en kan hij hem op dat moment niet openen. De scan opent
   zodra het slot vrij is.

   **`.nav-right`**: "Naar resultaten →" als scherm-specifieke actie,
   uiterst links (met een pijl naar rechts, niet links: Dit is een
   voorwaartse actie, geen terug-actie. Alleen zichtbaar zodra deze
   ScanInvulling `"afgerond"` is, gaat rechtstreeks naar scherm 6 zonder
   opnieuw door de bouwblokken te hoeven klikken). Is deze actie
   zichtbaar, dan volgt een scheidingslijn; is de invulling nog niet
   afgerond, dan begint `.nav-right` direct met de 4 vaste links, geen
   losse scheidingslijn. Dan de 4 vaste content-links, dan de
   scheidingslijn, dan "← Terug naar Mijn metingen".
6. **Resultatenscherm**: Overall score met classificatiecirkel en
   voortgang, radar van alle bouwblokken, staafdiagram per categorie
   (kleur volgt de score), top 3 sterktes en verbeterkansen, legenda.
   **Bij AI-volwassenheid** (geen categorielaag, `content-ai-scan.md`)
   vervalt het staafdiagram per categorie: In plaats daarvan "Scores per
   Domein", een horizontale balk per domein individueel, gesorteerd van
   hoog naar laag (`Assessment.scoresPerGroepGesorteerd`).

   **Weging in de resultaten**: Een bouwblok met een gewicht ongelijk
   aan 1 toont zijn factor ("2×") bij de naam, in de radar-legenda en de
   lijst per bouwblok, en in de top 3 als het daarin staat. De getoonde
   bouwblokscore zelf blijft ongewogen. Categoriescore en overall zijn
   gewogen (zie Scoringslogica). Geen factor bij gewicht 1. Dezelfde
   markering komt terug in de PDF en staat als `gewicht` per bouwblok in
   de JSON-kolom `groepsScores` van de CSV (`export-csv.md`). De
   InDesign-export krijgt voorlopig alleen de gewogen scores
   (`export-indesign.md`, Weging). De PDF-specs
   (`export-pdf-visual-*.md`) volgen later; tot die tijd geldt deze
   regel ook voor de PDF.

   **`.nav-right`**: "← Terug naar de scan" samen met één knop
   "Exporteren" met een dropdown (opties "Als PDF", "Als CSV" en "Voor
   InDesign (XML)", zie `stylesheet.md`, niet losse knoppen), als
   scherm-specifieke acties, uiterst links, geen scheidingslijn tussen
   die twee onderling. Dan de scheidingslijn, dan de 4 vaste
   content-links (zie Globale layout hierboven). Dan de scheidingslijn,
   dan "← Terug naar Mijn metingen". Eén gedeelde exportfunctie, zie
   `beheerpagina.md` en `export-indesign.md`.

**Bron voor de toelichting**: De bouwsteenbeschrijvingen in
`visie-coniche.md` deel 2. Zolang die op `concept` staan (zie
`inhoudelijk-fundament.md`), blijft de huidige tekst in de app staan.

---

## 4. Content per scan-type

- **Klantcontact Volwassenheid**: `content-klantcontact-volwassenheid.md`
  (15 bouwblokken, 5 categorieën, 60 vragen)
- **AI-volwassenheid in Klantcontact**: `content-ai-scan.md` (8 domeinen,
  geen categorie-laag, 40 vragen)
- **Klantcontact Volwassenheid – Zorg (Zorgscan)**: `content-zorgscan.md`
  (zelfde 15 bouwblokken/5 categorieën/60 vragen als hierboven,
  sector-variant met vraagteksten herschreven naar patiënt-/cliëntcontact,
  `afgeleidVanAssessmentId: "klantcontact-volwassenheid"`, zie
  `datamodel.md`, Sector-varianten). Bouwblok-omschrijving, -toelichting en
  -tags zijn nog niet sector-vertaald, zie het open punt bovenaan
  `content-zorgscan.md`.
- **Adoptiescan**: Nog niet gestart

Elk contentbestand volgt dezelfde structuur: Per categorie de
bouwblokken met naam, omschrijving, tags en vragen.

---

## 5. Open punten

- Aggregatie over meerdere respondenten: Het gemiddelde per Meting is
  gebouwd (`beheerpagina.md`, Organisatie-resultaten). Afwijking en
  spreiding daarbovenop zijn nog niet ontworpen (`backlog.md`).
- Weging: De weging is gebouwd. Nog te besluiten of de gewichten van de
  Zorgscan (bouwblok 4, 10 en 11 op 2) blijven staan of terug naar 1
  gaan.
- Rol/functie bij de respondent: Vrij tekstveld of vaste lijst.
- Focus- en error-states in formulieren (zie `stylesheet.md`).
