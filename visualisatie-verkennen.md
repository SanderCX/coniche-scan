# Coniche Scan: Verkennen

Spec voor het Admin-scherm Verkennen, waar je alle Organisaties van één Assessment door elkaar kunt filteren, groeperen en naast elkaar zetten.

**Status: Voorstel van 15 oktober 2026.** Er is een visual design van (Claude Design, "Coniche Scan Verkennen"), met voorbeelddata. Er is nog niets gebouwd. Wat in dit document staat als "Besloten" komt uit het gesprek van 15 oktober 2026.

## Wat het is

Verkennen is bedoeld om vragen te beantwoorden als "scoren Organisaties met pakket X anders dan de rest?" en "hoe verschillend zijn de Organisaties die pakket X gebruiken onderling?". Het werkt op de hele pool van een Assessment, met filters die je tijdens het kijken wisselt.

Het verschilt van de benchmark tussen Organisaties (`benchmark.md`, niveau 1):

- Een benchmark is een samengestelde groep die de Admin opslaat, bedoeld om aan een Lead te laten zien. Verkennen slaat niets op.
- Bij een benchmark kiest de Admin eerst de leden. Bij Verkennen is de hele pool het uitgangspunt en maken filters die kleiner.
- Verkennen is voor de Admin. Een Lead ziet het nooit.

De rekenregels van de benchmark gelden ook hier (`benchmark.md`, Gedeelde regels). Dat zijn één Meting per Organisatie en een gelijk gewicht voor elke Organisatie.

**Besloten.** Admin eerst. Een versie voor de Consultant volgt later (zie Later).

## Plek in beheer

De tab Verkennen onder de hoofdlink Resultaten, naast Metingen en Benchmarks, alleen zichtbaar voor een Admin (`beheerpagina.md`, punt 7 en 15). Kruimelpad Resultaten › Verkennen. Bovenaan staat de keuze van het Assessment. Alles daaronder werkt binnen dat ene Assessment.

## Pool

**Besloten.** De pool is per Assessment. Scores van verschillende Assessments worden niet door elkaar gezet.

- In de pool zitten Organisaties met `benchmarkToegestaan` die een Meting van het gekozen Assessment hebben met minstens `benchmarkMinScans` afgeronde scans.
- Per Organisatie telt de meest recente Meting die aan die eis voldoet, net als bij het samenstellen van een benchmark. Bij een samengestelde Meting (`benchmark.md`, Onderdeel en samengestelde Meting) telt die.
- De Admin ziet de namen van de Organisaties.
- De Zorgscan en de Klantcontact Volwassenheidsscan hebben dezelfde 15 bouwblokken, maar zijn aparte Assessments en dus aparte pools. De Zorgscan weegt bouwblok 4, 10 en 11 dubbel. Binnen een pool speelt dat niet, omdat bouwblokscores ongewogen zijn en de overall scoring van het Assessment volgt (`CLAUDE.md`, sectie 1).

**Teller.** In het filtervenster staat "X van Y Organisaties in de pool". Y is het aantal Organisaties dat voor het Assessment in aanmerking komt, X het aantal na de filters. Eronder staat een balk, en een regel met hoeveel Organisaties niet beschikbaar zijn omdat ze geen toestemming hebben gegeven voor benchmark. Dit volgt het patroon van de redenen onder de lijst bij het samenstellen van een benchmark.

## Filters

De filters komen uit de organisatievelden (`datamodel.md`, `VeldDefinitie`) en niet uit een vaste lijst in de code. Een nieuw veld wordt vanzelf een filter. Het veldtype bepaalt het bedieningselement.

- **Select en select-afhankelijk** (sector, subsector, leverancier per techstackcategorie, ondersteuner, deploymentmodel, cloudleverancier): Chips met meerkeuze en het aantal Organisaties erachter. Meerdere chips binnen één veld werken als "of".
- **Getal en percentage** (AHT, NPS, CSAT, SLA, FTR, FTE, contacten per kanaal, digitaliseringspercentage): Een slider met een histogram erboven. Het getalfilter staat nog niet in het eerste ontwerp, behalve de AHT-drempel bij het groeperen (zie hieronder). Het filter zelf is een bereik met twee handvatten.
- **Ingezette kanalen**: Afgeleid uit de contacten per jaar per kanaal. Een kanaal telt als ingezet bij een waarde boven 0. Een leeg veld is onbekend en telt niet als "niet ingezet". Een Organisatie met "niet van toepassing" bij een kanaal telt als niet ingezet. In het ontwerp werken meerdere gekozen kanalen als "en": De Organisatie moet ze allemaal inzetten.
- **Filter toevoegen**: Een knop waarmee de Admin een extra veld als filter kiest.

Verschillende filters werken als "en". Het filter op sector en het filter op kanalen beperken de pool dus allebei.

Organisaties zonder waarde voor een filterveld vallen bij dat filter weg. Bij een getalfilter staat erbij hoeveel Organisaties het veld hebben ingevuld (bijvoorbeeld "37 van 50"), omdat de organisatievelden nog niet overal gevuld zijn.

"Wis filters" zet alle filters terug.

## Groeperen en focus

Groeperen verdeelt de pool (na de filters) in groepen. Eén groep is de focus. De rest is alle andere Organisaties in de pool.

- **Groeperen op een select-veld** (CRM-pakket, sector): Eén groep per waarde. In het ontwerp staan CRM-pakket en sector als keuze. Elk select-veld kan hier later bij.
- **Groeperen op een getalveld** (nu AHT): Een drempel met twee groepen, "≤ drempel" en "> drempel". De slider heeft een histogram erboven, waarin de staven van de focusgroep oranje zijn. Onder de slider staat hoeveel Organisaties aan elke kant zitten. De startwaarde van de drempel is de mediaan van de pool. In het ontwerp staat 420 seconden als voorbeeld.
- **Focusgroep**: Chips met de groepsnaam en het aantal. Bij het wisselen van groepering wordt de grootste groep de focus.
- **Kleine groepen.** Een groep met minder dan 3 Organisaties is gestreept getekend en krijgt in de heatmap geen cijfers. Heeft de focus of de rest minder dan 5 Organisaties, dan staat er een waarschuwing dat verschillen voorzichtig gelezen moeten worden. Het is geen blokkade, want de Admin mag de namen zien. Beide grenzen worden instellingen (Instellingen, Drempels en termijnen), met startwaarde 3 en 5.
- Is de focus of de rest leeg, dan staat er een melding en geen grafiek.

## Weergaven

Vier weergaven, gekozen met de weergave-schakelaar boven de resultaten (`stylesheet.md`, Tabbalk en kruimelpad). Het visual design toont ze als tabs met een onderstreping. Bij het bouwen geldt de bestaande schakelaar, zodat er geen tweede soort komt. De rijen zijn de bouwblokken, gegroepeerd per categorie met de categoriekleur (`stylesheet.md`, Categoriekleuren). Bij een Assessment zonder categorielaag (de AI-scan) zijn de rijen de domeinen, zonder kopregels.

### 1. Groep tegenover de rest

Per bouwblok een rij met een schaal van 1 tot 5. Elke Organisatie in de pool is een stip: De focus oranje en iets groter, de rest grijs. Een staande streep markeert het gemiddelde van de focus (oranje) en van de rest (donkergrijs), met een lijn ertussen. Aan de rechterkant staan het gemiddelde van de focus, het gemiddelde van de rest en het verschil als staafje met een getal. Een verschil boven 0 is blauw en onder 0 oranje. Hover op een stip toont de naam van de Organisatie en de score.

Boven de rijen staan vier kaarten: Het gemiddelde van de focus (overall), het gemiddelde van de rest, de grootste plus en de grootste min per bouwblok.

### 2. Spreiding binnen de groep

Dezelfde rijen, maar alleen de stippen van de focus. Daarachter staan het bereik (laagste tot hoogste score) als dunne lijn, de middelste helft van de focus als oranje balk en de mediaan als staande streep. De middelste helft van de rest staat als grijze balk op de achtergrond, ter vergelijking. Rechts staan de mediaan, de spreiding (standaarddeviatie) en het bereik als tekst. Dezelfde vier kaarten staan erboven.

### 3. Alle groepen naast elkaar

Een heatmap met de bouwblokken als rijen en de groepen als kolommen. De eerste kolom toont de hele pool met het gemiddelde in de scorekleuren (`stylesheet.md`, Scorekleuren). De andere kolommen tonen per groep het verschil met het gemiddelde van de hele pool, blauw voor boven en oranje voor onder, met een sterkte die meegroeit tot een verschil van 0,9. Een groep met minder dan 3 Organisaties is grijs met "n<3". Hover toont het gemiddelde van de groep en dat van de pool. Een klik op een kolomkop maakt die groep de focus en opent weergave 1.

### 4. Verband met een kenmerk

Een spreidingsdiagram van 780 bij 380 pixels. Horizontaal staat een numeriek organisatieveld (nu AHT, FTR of NPS), verticaal de overall score of de score van één bouwblok. De focus is oranje, de rest grijs. Een rechte lijn (kleinste kwadraten) laat de richting zien. Naast het diagram staan de correlatiecoëfficiënt r, het aantal Organisaties en een woord bij de sterkte (onder 0,2 nauwelijks, onder 0,4 zwak, onder 0,6 matig, daarboven sterk, met de richting erbij). Bij minder dan 3 Organisaties met een waarde staat er "Te weinig data". Onder de coëfficiënt staat een korte zin dat scores zelfrapportage zijn en dat sector en kanaalmix meespelen, zodat een verband geen oorzaak is.

## Sorteren

Bij weergave 1 en 2 kan de Admin kiezen tussen de volgorde van het model (met kopregels per categorie) en sorteren op grootste verschil (weergave 1) of grootste spreiding (weergave 2). Bij sorteren vervallen de kopregels, de categoriekleur blijft als streepje voor de naam.

## Rekenregels

- Per Organisatie telt de bouwblokscore van haar Meting (`CLAUDE.md`, sectie 1).
- Het gemiddelde van een groep is het gemiddelde van de scores van haar Organisaties, dus elke Organisatie telt even zwaar. Het aantal scans binnen een Meting speelt geen rol.
- De overall van een Organisatie volgt de Overall score van het Assessment (met weging waar die geldt). Het gemiddelde van een groep is het gemiddelde van die overalls.
- Het verschil is het gemiddelde van de focus min dat van de rest, op één decimaal. Het teken is een plus of een min (−), en bij een verschil van minder dan 0,05 staat er geen teken.
- Kwartielen en mediaan gebruiken lineaire interpolatie. De spreiding is de standaarddeviatie met n−1, en blijft leeg bij minder dan 2 Organisaties.
- In de heatmap telt de groep zelf mee in het gemiddelde van de hele pool.
- Afronding volgt `CLAUDE.md`, sectie 1, en geldt alleen voor getoonde waarden.

## Opmaak

Alle opmaak staat in `stylesheet.md`. Het ontwerp gebruikt de bestaande tokens, Epilogue, kaarten met 10px radius en de eyebrow in oranje. De weergave-schakelaar (`.weergave-wissel`) dient voor de vier weergaven, voor Groeperen op en voor Sorteren. Nieuw zijn de filterchip, de focuschip, de slider met histogram en de waarschuwing bij een kleine groep. Die staan als voorstel in `stylesheet.md`, onder Filterchip, focuschip en slider (Verkennen).

Kleuren in de grafieken: Focus oranje (`--or`), rest grijs (`rgba(136,136,132,.5)`), gemiddelde van de rest `--ink-m`, verschil boven 0 blauw (`--bl`) en onder 0 oranje. De scorekleuren staan alleen op absolute scores, zoals de eerste kolom van de heatmap.

## Privacy en rechten

- Alleen een Admin ziet Verkennen, met de permissie `verkennen.inzien` (`datamodel.md` deel 2, Rechtenmatrix). Dat sluit aan op de benchmark, waar de Admin de namen van de Organisaties ook ziet (`benchmark.md`, Weergave voor de Admin).
- Er is geen minimale groepsgrootte voor het tonen van cijfers aan de Admin. Wel geldt de waarschuwing bij kleine groepen.
- Het scherm slaat niets op. De filterstand verdwijnt als de Admin het scherm verlaat.

## Later

- **Consultant.** Een Consultant mag de namen van Organisaties die niet de zijne zijn niet zien. Dan gelden `benchmarkMinOrganisaties` voor beide kanten van elke splitsing (focus en rest) en de regel dat een filter dat een kant onder de drempel brengt niets toont. Anders is een Organisatie terug te rekenen uit het verschil tussen groep en rest. Voor de eigen klanten van de Consultant kan een uitzondering gelden, die moet nog besloten worden.
- **Operationele KPI's als filter en als groepering.** Dit werkt vanzelf zodra ze organisatievelden zijn.
- **AHT per kanaal.** Dit is een wijziging in het datamodel: AHT wordt een subveld bij elk kanaal in plaats van één los KPI-veld. Het filter combineert dan "kanaal ingezet" met een AHT-slider voor dat kanaal. Dit moet Sander inpassen in `datamodel.md`.
- **Bewaren als benchmark.** Een filterstand kan een benchmark worden (`benchmark.md`, Samenstellen), en dat is ook de route om het resultaat aan een Lead te tonen.
- **Export** van de gefilterde pool als CSV (`export-csv.md`).
- **Quickscan Ziekenhuis.** De antwoorden zijn percentages (`visualisatie-quickscan.md`), dus de schaal wordt 0 tot 100%, met de classificatiekleuren van de Quickscan.
- **Meerdere Metingen per Organisatie.** Nu telt de meest recente. Een tijdsdimensie hoort bij niveau 2 van de benchmark.

## Open punten

- Werken meerdere gekozen kanalen als "en" of als "of"? Het ontwerp gebruikt "en".
- Zijn 3 en 5 de juiste startwaarden voor de drempels bij kleine groepen? Met ongeveer 10 Organisaties per branche vallen combinaties van sector en pakket snel onder 5.
- Welke velden komen als eerste in de groepering naast CRM-pakket en sector (deploymentmodel, ondersteuner, kanaal ingezet)?
- Moet een getalfilter naast het bereik ook een drempel kunnen zijn (onder of boven één waarde)? Bij het groeperen is dat al zo.
