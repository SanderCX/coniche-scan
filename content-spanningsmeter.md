# Coniche Scan: Content Spanningsmeter

De vragen, de schaal en de ijkpunten van de Spanningsmeter. Dit bestand is de enige plek voor de inhoud. De regels voor rekenen staan in `datamodel.md` (Antwoordtype, Scoreberekening), de schermen in `schermen.md` en de opmaak in `visualisatie-spanningsmeter.md`.

Bron is het document "Digitale Spanningsmeter – vragenset" van Martijn (13 pagina's), dat op zijn beurt op het boek "Onder Spanning" (Franssen, 2026) en de literatuur steunt. De vragen zijn nog niet getest (zie Validatie). De naam van het bronbestand zegt "15 vragen per spanningsveld", de inhoud heeft er 5 gescoord en 1 open per veld, samen 30 gescoorde vragen en 6 open vragen. Het aantal van 5 is hier aangehouden.

## Opzet

- **Assessment**: Spanningsmeter, standalone Assessment zonder `afgeleidVanAssessmentId`. Er is geen categorielaag, de 6 spanningsvelden zijn de `Bouwsteen`en en hangen direct aan het Assessment (`datamodel.md`, Assessment).
- **Eenheid**: Een bouwsteen heet hier een **spanningsveld** (`bouwsteenLabel` "Spanningsveld", enkelvoud "spanningsveld", meervoud "spanningsvelden"). In de interface en in alle specs voor dit Assessment staat "veld" of "spanningsveld", niet "bouwsteen" en niet "domein".
- **Icoon**: Sleutel `gauge`, een halve meter met een wijzer (`stylesheet.md`, Assessment-icoon).
- **Antwoordtype**: `"spanning"` (nieuw, `datamodel.md`, Antwoordtype): Een schaal van 1 tot en met 5 met als extra antwoord 0, "Kan ik niet beoordelen".
- **Vragen**: 30 gescoorde vragen, 5 per veld, en per veld 1 open vraag (zie Open vraag). Een gescoorde vraag heeft een invalshoek, de vraag zelf en een toelichting "Waar je op let".
- **Duur**: Ongeveer 10 tot 15 minuten, inclusief de voorbeelden (`Assessment.geschatteDuur` "±10 tot 15 minuten").
- **Geen totaalscore**: De Spanningsmeter kent geen totaalscore. Er is een score per veld en een spanning tussen de velden (`datamodel.md`, Scoreberekening). Waar het scherm toch één getal toont, is dat een weergave (Gemiddeld niveau, zie `visualisatie-spanningsmeter.md`) en geen score waarop de meter stuurt.
- **Neutrale vragen**: Geen enkele vraag is op een bepaald niveau gericht. Elke vraag beschrijft een invalshoek van het veld en de deelnemer bepaalt zelf waar de organisatie daarop staat.
- **Spanning is vooral een profiel**: Iedere deelnemer ziet na het invullen direct zijn of haar eigen profiel. Pas daarna worden de profielen van de groep naast elkaar gelegd.

## Schaal en niveaus

Eén schaal voor alle vragen (`Assessment.schaal`). De betekenis komt uit het boek.

| Score | Niveau | Betekenis |
|---|---|---|
| 1 | Reactief | We handelen vooral als het pijn doet. |
| 2 | Gefragmenteerd | De spanning is zichtbaar, maar komt niet samen. |
| 3 | Georganiseerd | De spanning wordt besproken binnen bestaande structuren. |
| 4 | Geïntegreerd | De spanning wordt gebruikt om keuzes en samenwerking te versterken. |
| 5 | Adaptief | De spanning voedt het verandervermogen van de organisatie. |
| 0 | Kan ik niet beoordelen | Telt niet mee in de score. |

De schaal is geen volwassenheidsschaal met de labels "Niet aanwezig" tot "Geoptimaliseerd" (`datamodel.md`, SchaalLabel) en gebruikt dus eigen labels. De grenzen van het niveau van een veldscore staan in `datamodel.md`, Scoreberekening (afgerond op een heel getal, dus 1,5 tot 2,49 is Gefragmenteerd).

## Ijkpunt per veld

Bij elk veld staat de Spanningsmeter uit het boek, met de vijf niveaus voor dat veld. Die helpt deelnemers hun score te plaatsen. In de doorloopflow staan de vijf ijkpunten bovenaan het veld, onder de instructie (`schermen.md`, Doorloopflow). Ze zijn gegevens van het veld (`Bouwsteen.ijkpunten`, `datamodel.md`), niet van de vraag.

## Open vraag per veld

Na de vijf vragen van elk veld vraagt de tool om één concreet voorbeeld dat de scores onderbouwt. De open vraag:

> Geef een concreet voorbeeld (een klantmoment, overleg, besluit of project) dat je scores in dit veld onderbouwt.

- Staat standaard aan, is niet verplicht en wordt niet gescoord.
- De ID's zijn VL6, GR6, MG6, DA6, PR6 en TE6.
- Een antwoord staat in `ScanInvulling.opmerkingenPerBouwsteen` (`datamodel.md`), omdat het veld per bouwsteen al bestaat. Bij dit Assessment heet het veld in de doorloopflow niet "Opmerkingen" maar zoals hierboven.
- Tegenvoorbeelden komen in de workshop aan bod en niet in de tool.

## Achtergrondvragen

De tool vraagt bij de intake niets extra voor de Spanningsmeter. De bron noemt drie achtergrondvragen (sessiecode, rol en afdeling), maar we nemen ze niet over. De sessiecode is de Meting zelf. Een rol- of afdelingsvraag is er niet, omdat de app geen afdeling als eigen object kent: Een deel van een Organisatie is een Onderdeel (`datamodel.md`, Onderdeel), met een eigen Meting en eigen KPI-waarden, en zo wordt een deel van de organisatie gemeten.

De antwoorden blijven anoniem: Een groepsweergave toont nooit een antwoord of profiel van één persoon (`visualisatie-spanningsmeter.md`, Anonimiteit).

## De zes velden

De namen, de korte namen en de volgorde zijn de bouwlogica: Verhaal, Regie, Gedrag, Data, Processen, Technologie. De spanning tussen de velden (`datamodel.md`, Scoreberekening) volgt deze volgorde. Een Admin kan de volgorde van de velden dus niet vrij wijzigen zonder de betekenis van "spanning" te veranderen.

| # | Veld | Korte naam | Veldkleur |
|---|---|---|---|
| 1 | Verhaal & leiderschap | Verhaal | `--or` |
| 2 | Governance, regie & control | Regie | `--bl` |
| 3 | Mensen & gedrag | Gedrag | `--gr` |
| 4 | Data | Data | turquoise `#1f9aa0` |
| 5 | Processen | Processen | `--pu` |
| 6 | Technologie | Technologie | `--ye` |

De kleuren staan in `stylesheet.md`, Groepskleuren.

### 1. Verhaal & leiderschap

`omschrijving`: Meet of mensen het verhaal begrijpen, geloven en zelf uitdragen.

Basis: Armenakis & Harris (2002), Readiness for Change (Holt e.a., 2007), visiecommunicatie (Rafferty & Griffin, 2004), woord-daadconsistentie (Simons, 2002) en sensemaking (Balogun & Johnson, 2004).

**Ijkpunt**

| Score | Niveau | Verhaal & leiderschap |
|---|---|---|
| 1 | Reactief | We vertellen het verhaal pas als onrust of weerstand ontstaat. |
| 2 | Gefragmenteerd | Er zijn meerdere verhalen die elkaar niet altijd versterken. |
| 3 | Georganiseerd | Het verhaal is helder, maar blijft vooral communicatie. |
| 4 | Geïntegreerd | Het verhaal geeft richting aan keuzes en gedrag. |
| 5 | Adaptief | Mensen maken zich het verhaal eigen en vertalen het zelf naar beweging. |

**Vragen** (score 1 tot en met 5, of 0 = kan ik niet beoordelen)

| # | Invalshoek | Vraag | Waar je op let |
|---|---|---|---|
| VL1 | Noodzaak | In hoeverre begrijpen mensen in alle lagen waarom verandering nodig is en wat er op het spel staat? | Leggen mensen het in eigen woorden uit, of herhalen ze vooral woorden uit presentaties? Krijg je verschillende antwoorden op het waarom? |
| VL2 | Betekenis voor het werk | In hoeverre weten mensen wat de verandering concreet betekent voor hun eigen werk en gedrag? | Kunnen mensen zeggen wat er op maandagochtend anders gaat, of blijft de ambitie abstract? |
| VL3 | Richting in keuzes | In hoeverre geeft het verhaal richting aan de keuzes die worden gemaakt? | Zie je het verhaal terug in recente keuzes, ook in wat we níet meer doen? Spreken besluiten het verhaal soms tegen? |
| VL4 | Voorbeeldgedrag | In hoeverre laten leiders zelf zien wat zij van anderen vragen? | Veranderen leiders zichtbaar mee in hoe ze werken en beslissen? Vertellen ze in de kern hetzelfde verhaal? |
| VL5 | Dialoog & bijstellen | In hoeverre wordt opgehaald of het verhaal nog aansluit bij wat mensen ervaren, en wordt het daarop bijgesteld? | Gebeurt dat structureel, of toevallig via een klacht of kritische vraag? Wordt cynisme gezien als signaal? |
| VL6 | Voorbeeld (open) | Zie Open vraag per veld. | |

### 2. Governance, regie & control

`omschrijving`: Meet wat regie in de praktijk doet: Kiezen, stoppen, eigenaarschap over grenzen heen en bijsturen.

Basis: Levers of Control (Simons, 1995), beslisrechten (Rogers & Blenko, 2006), strategie-executie (Sull, Homkes & Sull, 2015; Mankins & Steele, 2005) en dynamic capabilities (Teece, 2007).

**Ijkpunt**

| Score | Niveau | Governance, regie & control |
|---|---|---|
| 1 | Reactief | We grijpen pas in als projecten vastlopen of druk oploopt. |
| 2 | Gefragmenteerd | Er lopen veel initiatieven, maar zonder duidelijke prioriteit. |
| 3 | Georganiseerd | Er is overleg en structuur, maar keuzes blijven nog te vrijblijvend. |
| 4 | Geïntegreerd | We verbinden ambitie, prioriteiten en capaciteit actief met elkaar. |
| 5 | Adaptief | We sturen continu bij op voortgang in de veranderende werkelijkheid. |

**Vragen**

| # | Invalshoek | Vraag | Waar je op let |
|---|---|---|---|
| GR1 | Prioriteren & stoppen | In hoeverre worden er duidelijke prioriteiten gesteld, en wordt er ook gestopt? | Is er een gedeeld beeld van wat voorgaat? Wordt bij iets nieuws besloten wat stopt, schuift of kleiner wordt? |
| GR2 | Besluitvorming | In hoeverre wordt er tijdig en definitief besloten wanneer prioriteiten of belangen botsen? | Is duidelijk wie de knoop doorhakt? Reizen vraagstukken langs overlegtafels, of komen besluiten later opnieuw op tafel? |
| GR3 | Eigenaarschap van het geheel | In hoeverre is er eigenaarschap voor vraagstukken die over teams en domeinen heen lopen? | Is er een eigenaar van het totale resultaat, met mandaat en middelen? Of repareren steeds dezelfde mensen informeel de gaten? |
| GR4 | Ambitie & capaciteit | In hoeverre worden ambitie, prioriteiten en beschikbare capaciteit met elkaar in balans gebracht? | Past het geheel van initiatieven in de capaciteit? Dragen lokale doelen bij aan het totale resultaat? |
| GR5 | Signalen & bijsturen | In hoeverre leiden signalen over voortgang, risico's, kosten, klantimpact of werkdruk tot bijsturing? | Wordt er tijdig geëscaleerd zonder dat dat als falen voelt? Durven we een plan los te laten? |
| GR6 | Voorbeeld (open) | Zie Open vraag per veld. | |

### 3. Mensen & gedrag

`omschrijving`: Meet of de organisatie nieuw gedrag logisch, mogelijk en veilig maakt.

Basis: COM-B (Michie, van Stralen & West, 2011), psychologische veiligheid (Edmondson, 1999), Kerr (1975), transfer van training (Baldwin & Ford, 1988) en weerstand als informatie (Ford, Ford & D'Amelio, 2008).

**Ijkpunt**

| Score | Niveau | Mensen & gedrag |
|---|---|---|
| 1 | Reactief | We betrekken mensen pas als weerstand zichtbaar wordt. |
| 2 | Gefragmenteerd | We doen losse interventies, maar gedrag verandert nog beperkt. |
| 3 | Georganiseerd | Er is aandacht voor adoptie en ontwikkeling, maar vooral planmatig. |
| 4 | Geïntegreerd | We verbinden gedrag en leiderschap actief met de verandering. |
| 5 | Adaptief | Mensen nemen eigenaarschap, leren continu en versterken de verandering. |

**Vragen**

| # | Invalshoek | Vraag | Waar je op let |
|---|---|---|---|
| MG1 | Concreet gedrag | In hoeverre is helder welk gedrag moet veranderen, en zie je dat terug in het dagelijkse werk? | Is het gedrag concreet en zichtbaar, of blijft het bij 'meer eigenaarschap'? Wat gebeurt er onder druk? |
| MG2 | Kunnen | In hoeverre krijgen mensen wat ze nodig hebben om nieuw gedrag te leren en toe te passen? | Is er na een training ruimte en begeleiding om te oefenen in het werk zelf? |
| MG3 | Omgeving | In hoeverre maken KPI's, systemen, werkdruk en waardering het nieuwe gedrag makkelijker dan het oude? | Wordt om nieuw gedrag gevraagd terwijl de omgeving het oude nog beloont? |
| MG4 | Durven | In hoeverre is het veilig genoeg om anders te werken, zelf te beslissen en fouten te maken? | Worden twijfels en fouten open besproken? Trekken leiders bij tegenvallers de controle weer naar zich toe? |
| MG5 | Weerstand & verspreiding | In hoeverre wordt weerstand benut als informatie, en wordt nieuw gedrag breed gedragen? | Wordt weerstand bij mensen gelegd, of gezien als signaal over de omgeving? Hangt het af van een paar voorlopers? |
| MG6 | Voorbeeld (open) | Zie Open vraag per veld. | |

### 4. Data

`omschrijving`: Meet of data aannames toetst en keuzes verandert.

Basis: Data-driven decision making (Brynjolfsson, Hitt & Kim, 2011), data-driven culture (Gupta & George, 2016), data governance (Khatri & Brown, 2010), datakwaliteit (Wang & Strong, 1996) en experimenteren (Thomke, 2020).

**Ijkpunt**

| Score | Niveau | Data |
|---|---|---|
| 1 | Reactief | We gebruiken data pas bij discussie, incidenten of prestatiedruk. |
| 2 | Gefragmenteerd | Er is veel data, maar definities en interpretaties verschillen. |
| 3 | Georganiseerd | We hebben dashboards, maar toetsen aannames nog beperkt. |
| 4 | Geïntegreerd | Data helpt ons patronen zien, keuzes maken en voortgang sturen. |
| 5 | Adaptief | Data voedt continu leren, bijsturen en betere besluitvorming. |

**Vragen**

| # | Invalshoek | Vraag | Waar je op let |
|---|---|---|---|
| DA1 | Eenduidigheid | In hoeverre werken we met gedeelde en betrouwbare cijfers en definities? | Komen discussies terug omdat afdelingen eigen bronnen gebruiken? Vertrouwen mensen de data waarmee ze werken? |
| DA2 | Besluiten op data | In hoeverre worden belangrijke besluiten gebaseerd op data, en niet op aannames, ervaring of hiërarchie? | Wordt data pas gezocht nadat de richting al is gekozen? Passen we een keuze aan als data een aanname tegenspreekt? |
| DA3 | Van signaal naar actie | In hoeverre leiden afwijkingen in data tot actie? | Heeft een afwijking een eigenaar? Is vooraf afgesproken bij welke uitkomst we bijsturen? |
| DA4 | Klant en medewerker | In hoeverre worden signalen uit klachten, gesprekken en feedback verbonden tot patronen waarop we handelen? | Komt data die schuurt met het dominante verhaal op tafel? Kleuren rapportages positiever dan de praktijk? |
| DA5 | Toetsen & leren | In hoeverre gebruiken we data om aannames te toetsen en ervan te leren? | Maken we aannames vooraf toetsbaar? Testen we kleinschalig voordat we opschalen? |
| DA6 | Voorbeeld (open) | Zie Open vraag per veld. | |

### 5. Processen

`omschrijving`: Meet hoeveel verborgen complexiteit klanten en medewerkers opvangen en of die structureel verdwijnt.

Basis: De Process Audit (Hammer, 2007), failure demand (Seddon, 2003), Tucker & Edmondson (2003), Repenning & Sterman (2001) en Hammer (1990).

**Ijkpunt**

| Score | Niveau | Processen |
|---|---|---|
| 1 | Reactief | We zien procesproblemen pas als klanten klagen. |
| 2 | Gefragmenteerd | Teams lossen problemen lokaal op, oorzaken blijven bestaan. |
| 3 | Georganiseerd | Processen zijn beschreven, maar uitzonderingen blijven onzichtbaar. |
| 4 | Geïntegreerd | We verbeteren end-to-end op klantwaarde en werkbaarheid. |
| 5 | Adaptief | We herkennen complexiteit vroeg en vereenvoudigen continu. |

**Vragen**

| # | Invalshoek | Vraag | Waar je op let |
|---|---|---|---|
| PR1 | End-to-end eigenaarschap | In hoeverre wordt de klantreis als geheel bewaakt en verbeterd, over afdelingen heen? | Is er één eigenaar van de hele reis, of optimaliseert elk team zijn eigen stap? |
| PR2 | Stroom & frictie | In hoeverre stroomt werk soepel, zonder onnodige wachttijd, overdrachten en herhaal- of herstelwerk? | Moeten klanten hun verhaal meerdere keren vertellen? Weten we welk deel van het werk voortkomt uit iets wat eerder misging? |
| PR3 | Uitzonderingen & workarounds | In hoeverre blijft verborgen complexiteit beperkt, zonder structurele workarounds en uitzonderingen? | Zijn uitzonderingen feitelijk standaard geworden? Hoe lang hebben nieuwe medewerkers nodig om ze allemaal te leren? |
| PR4 | Oorzaken aanpakken | In hoeverre worden terugkerende problemen bij de oorzaak aangepakt? | Lossen teams het lokaal op terwijl de oorzaak blijft? Stranden verbeteringen op afdelingsgrenzen? |
| PR5 | Vereenvoudigen & uitkomst | In hoeverre sturen en verbeteren we processen op klantwaarde en werkbaarheid, en vereenvoudigen we voordat we automatiseren? | Sturen teams op hun eigen productiviteit of op de uitkomst voor de klant? Verdwijnen stappen zonder waarde? |
| PR6 | Voorbeeld (open) | Zie Open vraag per veld. | |

### 6. Technologie

`omschrijving`: Meet of technologie versnelt wat al werkt en landt in werk, proces en data.

Basis: UTAUT (Venkatesh e.a., 2003), Brynjolfsson, Rock & Syverson (2021), Designed for Digital (Ross, Beath & Mocker, 2019), workarounds (Alter, 2014) en het NIST AI Risk Management Framework (2023).

**Ijkpunt**

| Score | Niveau | Technologie |
|---|---|---|
| 1 | Reactief | We zetten technologie in als de druk te groot wordt of problemen vastlopen. |
| 2 | Gefragmenteerd | We hebben veel tools, maar weinig samenhang in gebruik en waarde. |
| 3 | Georganiseerd | Technologie is geïmplementeerd, maar adoptie en gedrag blijven achter. |
| 4 | Geïntegreerd | Technologie verbindt proces, data en gedrag rond klantwaarde. |
| 5 | Adaptief | Technologie versnelt leren, vereenvoudigen en vernieuwen. |

**Vragen**

| # | Invalshoek | Vraag | Waar je op let |
|---|---|---|---|
| TE1 | Waarde | In hoeverre begint de inzet van technologie bij een helder probleem, en levert die aantoonbaar waarde op? | Toetsen we de waarde achteraf? Stoppen we bewust met technologie die niet oplevert? |
| TE2 | Adoptie & gebruik | In hoeverre wordt technologie in de praktijk goed en volledig gebruikt? | Ervaren medewerkers de systemen als nuttig? Houden ze daarnaast eigen lijstjes en workarounds bij? |
| TE3 | Samenhang in het landschap | In hoeverre vormt de technologie één samenhangend geheel? | Bouwen afdelingen eigen oplossingen voor vergelijkbare problemen? Moeten medewerkers schakelen tussen systemen of dubbel invoeren? |
| TE4 | Landen in het werk | In hoeverre veranderen werkwijze, processen en sturing mee bij de invoering van technologie? | Geldt livegang als succes, of minder moeite voor klant en medewerker? |
| TE5 | AI & eigenaarschap | In hoeverre is de inzet van AI goed georganiseerd? | Is duidelijk wie eigenaar is van data, kennis, kwaliteit en risico's? Wijken medewerkers uit naar eigen AI-tools? |
| TE6 | Voorbeeld (open) | Zie Open vraag per veld. | |

## Hoe de app de content gebruikt

- **Doorloopflow** (`schermen.md`, Doorloopflow): Per veld de `omschrijving`, de vijf ijkpunten, de vijf vragen met de invalshoek erboven, de toelichting "Waar je op let" achter een Info-knop bij elke vraag, en daaronder de open vraag.
- **Toelichting "Waar je op let"** stuurt niet naar een score. De tekst is een gegeven van de vraag (`Vraag.aandachtspunt`, `datamodel.md`) en door een Admin te bewerken (`beheerpagina.md`).
- **Toelichtingsmodal** bij een klik op een veld in de radar op de Assessment-pagina (`visualisatie-spanningsmeter.md`, `stylesheet.md`, Toelichtingsmodal): De `omschrijving`, de ijkpunten en de basis (de literatuur). In de doorloopflow staat die inhoud direct in de veldkop, zonder modal. Een centrale vraag is er niet voor dit Assessment (`Bouwsteen.centraleVraag` is leeg).
- **Gearchiveerde vragen**: Zie `datamodel.md`, Content bewerken. Het aantal vragen per veld mag veranderen, de berekening neemt `n` per veld (`datamodel.md`, Scoreberekening).

## Validatie

De vragen zijn gebaseerd op het boek en de literatuur, maar nog niet getest. De bron beschrijft vier stappen vóór ze als meetinstrument gelden:

1. **Expertcheck**: 4 tot 6 experts per vraag beoordelen of die bij het veld past en of de toelichting helpt zonder naar een score te sturen.
2. **Cognitieve pretest**: 5 tot 8 deelnemers uit verschillende rollen denken hardop: Begrijpen ze de vraag, en hoe gebruiken ze de schaal en het ijkpunt?
3. **Pilot**: Minimaal 100 deelnemers, liefst uit meerdere organisaties. Hangen de vijf vragen per veld samen (betrouwbaarheid), welke vragen krijgen vaak "kan ik niet beoordelen", en zijn verschillen tussen rollen herkenbaar?
4. **Herhaalmeting**: Een deel van de groep scoort na 2 tot 3 weken opnieuw. Een vraag die sterk verschuift terwijl er niets is veranderd, is te vaag.

Zolang dit niet gedaan is, mag een resultaat niet als gevalideerde meting worden gepresenteerd. Hoe dat in de app staat (een vermelding, een label "pilot"), is een open punt (`backlog.md`, Spanningsmeter).

## Importbestand

De bron levert een Excelbestand en los een CSV met dezelfde inhoud: De 30 vragen met toelichting, de gedeelde schaal, het ijkpunt per veld, de 6 open vragen apart van de gescoorde vragen, drie achtergrondvragen (sessiecode, rol en afdeling; die nemen we niet over), de rekenregels en een rekenvoorbeeld met een fictieve deelnemer waarmee Coniche de berekening van de tool kan controleren. Dat rekenvoorbeeld hoort in de test van de scorefunctie (`datamodel.md`, Scoreberekening, Spanningsmeter). Hoe de app dit bestand inleest, is nog niet besloten (`backlog.md`).

## Bron

Franssen, M. (2026). Onder Spanning. De literatuur per veld staat in de bron, in het document "Digitale Spanningsmeter – vragenset", onder Literatuur. Dit bestand noemt per veld alleen de basis, niet de volledige verwijzing.
