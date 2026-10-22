# Coniche Scan: Benchmark

De records staan in `datamodel.md` (Benchmark), de schermen in `beheerpagina.md` punt 14 en de privacytekst in `privacy-pagina.md` sectie 3a. Dit bestand beschrijft het gedrag. Een filterstand uit Verkennen is op te slaan als benchmark op niveau 1 en aan een Lead te geven (Niveau 1, Opgeslagen verkenning).

## Wat het is

Een benchmark zet de scores van een zelf gekozen groep naast elkaar. Een Admin stelt hem samen, op één plek in beheer (de tab Benchmark). Er zijn drie niveaus, met dezelfde rekenregel en dezelfde opbouw van de weergave.

| Niveau | Wat wordt vergeleken | Een lid is |
|---|---|---|
| 1. Tussen organisaties | Een groep organisaties | Een organisatie met één Meting per Assessment |
| 2. Binnen een organisatie, tussen Metingen | Twee of meer Metingen van één organisatie, bijvoorbeeld voor en na een verbetertraject of twee onderdelen | Een Meting |
| 3. Binnen een Meting | De scans in één Meting | Een afgeronde scan |

Een benchmark kan één of meer Assessments omvatten, bijvoorbeeld de Klantcontact Volwassenheidsscan en de AI-volwassenheidsscan. De resultaten van elk Assessment staan in een eigen sectie. Scores van verschillende Assessments worden niet samengevoegd, omdat de bouwblokken verschillen.

Scores worden berekend en nooit opgeslagen (`datamodel.md`, Scoreberekening). Dat geldt voor alle niveaus.

Naast de benchmark bestaat Verkennen (`visualisatie-verkennen.md`). Daar werkt de Admin op de hele pool van een Assessment met filters die hij tijdens het kijken wisselt, zonder een groep samen te stellen en zonder iets op te slaan. Verkennen gebruikt dezelfde rekenregels als niveau 1 (Gedeelde regels hieronder) en is zelf niet voor een Lead. Een Admin kan de filters opslaan als benchmark (Niveau 1, Opgeslagen verkenning). Dat is de route om een verkenning aan een Lead te tonen.

## Plek in beheer

De benchmark staat als tab Benchmarks onder de hoofdlink Resultaten (`beheerpagina.md`, punt 7). Een benchmark hoort bij een groep en dus niet onder één organisatie. Alle niveaus staan hier, zodat alle vergelijkingen op één plek zitten. Bij het aanmaken kiest de Admin eerst het niveau.

Vooralsnog kan alleen een Admin erbij. Er is een eigen permissie `benchmark.beheren`, alleen voor Admin, zodat een Consultant er later bij kan zonder dat de rechtenmatrix om moet. De schermen staan in `beheerpagina.md`, punt 14.

## Datamodel

De records staan in `datamodel.md`, Deel 2: Benchmark. Het zijn `Benchmark`, `BenchmarkLid` (een organisatie met een Assessment en een Meting) en `LeadToegang` met `weergave: "benchmark"` (een vinkje van een Lead voor een benchmark, `datamodel-rollen.md`), plus het veld `Organisatie.benchmarkToegestaan`. De twee instellingen `benchmarkMinOrganisaties` (startwaarde 5) en `benchmarkMinScans` (startwaarde 3) staan in `beheerpagina.md`, punt 10. Zie Drempels hieronder.

Het niveau staat als veld op de benchmark (zie `datamodel.md`). Een benchmark zonder niveau is een benchmark tussen organisaties. Het sectorfilter bij het samenstellen wordt niet opgeslagen, het is een zoekhulp. Een opgeslagen verkenning slaat wel filters op en geen leden (Niveau 1, Opgeslagen verkenning).

## Gedeelde regels

Deze regels gelden op alle niveaus.

Elk lid telt even zwaar mee, ongeacht het aantal respondenten daaronder. Bij vijf leden telt elk lid voor een vijfde. Per lid:

- Het gemiddelde antwoord per vraag over de afgeronde scans van dat lid.
- De gedeelde scorefunctie op die gemiddelden, met `Bouwblok.gewicht`, geeft de bouwblokscore, categoriescore en totaalscore van het lid.

De benchmark is het gemiddelde over de leden van dat Assessment, per vraag, bouwblok, categorie en totaalscore. De berekening is lineair, dus dit komt uit op hetzelfde als het gemiddelde van de scores van de leden. Er komt geen tweede rekenmethode bij (`datamodel.md`, Scoreberekening). Gearchiveerde content rekent mee zoals bij de andere weergaven (`datamodel.md`, Content bewerken). Een lid zonder afgeronde scan telt niet mee.

De cijfers worden live berekend (`lib/benchmark.ts`). De samenstelling staat vast, dus de lijst met leden verandert alleen als de Admin hem wijzigt. De cijfers bewegen mee als er nog scans binnenkomen, als een scan wordt verwijderd of als een gewicht verandert. Een gewichtswijziging werkt voor alle leden tegelijk door.

De weergave toont een peildatum en per lid het aantal scans. Is later een stabiele versie nodig, dan kan die een kopie worden die bij het vinkje van de Lead vastligt.

Omdat een lid met één respondent even zwaar telt als een lid met veertig, bewaakt `benchmarkMinScans` de ondergrens.

Een benchmark wordt altijd per Assessment berekend. Metingen en organisaties van verschillende Assessments worden niet gemengd.

## Niveau 1: Tussen organisaties

### Samenstellen

De Admin doorloopt drie keuzes, de laatste twee in dezelfde lijst.

1. Assessments kiezen, minstens één.
2. Organisaties kiezen. De lijst toont alleen organisaties met `benchmarkToegestaan` die minstens één Meting hebben van een gekozen Assessment, met minimaal `benchmarkMinScans` afgeronde scans. Per organisatie staat welke van de gekozen Assessments ze heeft en hoeveel afgeronde scans. Optioneel kan de lijst gefilterd worden op Sector en Subsector (`sbi-indeling.md`), met meerdere keuzes tegelijk. Het filter is een hulp en geen eis. De groep mag dus uit meerdere sectoren bestaan. Een organisatie met de vlag die niet in de lijst staat, komt met de reden onder de lijst (geen Meting van dat Assessment, of te weinig afgeronde scans).
3. Metingen kiezen. Vinkt de Admin een organisatie aan, dan verschijnt eronder per gekozen Assessment de lijst met alle Metingen die meedoen mogen, gewone en samengestelde. Per Meting staan de naam, het onderdeel, de meetdatum en het aantal afgeronde scans, en bij een samengestelde Meting "Gemiddelde van n Metingen". Er is altijd een keuze, ook bij één Meting. De app mag de meest recente voorstellen, maar dat voorstel staat zichtbaar aangevinkt en wordt nooit stil toegepast. Zit een Meting in een samengestelde Meting, dan staat bij haar "Zit in {naam}", zodat de Admin ziet dat ze al in een ander gemiddelde meetelt.

Naast elk gekozen Assessment loopt tijdens het samenstellen de teller "X van Y organisaties" mee (zie Teller).

Per Assessment heeft een organisatie hoogstens één lid in een benchmark.

Valt een lid weg doordat de Meting of de Organisatie is verwijderd, of doordat de vlag `benchmarkToegestaan` is ingetrokken, dan verdwijnt het lid uit de benchmark. De beheerweergave toont daarvan een melding (`Benchmark.meldingen`), die de Admin kan wegklikken. De melding wordt bewaard bij de benchmark, tot ze is weggeklikt of tot de samenstelling wordt gewijzigd.

Heeft een organisatie een Meting voor maar een deel van de gekozen Assessments, dan doet ze mee bij de Assessments waarvoor ze wel een Meting heeft. Het aantal organisaties kan dus per Assessment verschillen.

### Teller

Boven elke Assessment-sectie staat "X van Y organisaties". Y is het aantal organisaties in de benchmark. X is het aantal daarvan met een lid voor dat Assessment.

- De Admin ziet daarnaast welke organisaties ontbreken en per organisatie het aantal afgeronde scans.
- Bij een verkenning staat de teller per eenheid. Bij de eenheid Organisaties "n Organisaties". Bij de eenheid Onderdelen "n onderdelen van m Organisaties", bijvoorbeeld "3 onderdelen van 1 Organisatie". Bij één is het enkelvoud.
- De Lead ziet alleen het aantal organisaties in de vergelijking, dus zonder Y. Y bevat organisaties die bij dat Assessment niet meedoen, en dat is voor de Lead geen informatie die iets toevoegt.
- Tijdens het samenstellen krijgt de teller een waarschuwingskleur zodra een Assessment onder de drempel zakt.

### Weergave voor de Admin

Per Assessment een sectie met de gemiddelden van de groep, per vraag, per bouwblok, per categorie en totaalscore. De Admin ziet de namen van de organisaties. De resultaatcomponenten van het resultatenscherm (`schermen.md`, Resultatenpagina) worden hergebruikt waar dat kan. Elke sectie is een zelfstandig onderdeel, zodat een latere PDF per Assessment een eigen deel kan krijgen.

Per Assessment komt onder de gemiddelden van de groep ook de matrix die niveau 2 heeft (Niveau 2, Weergave). De bouwblokken zijn de rijen en de organisaties de kolommen, zodat de Admin in één blik ziet welke organisatie op welk bouwblok afwijkt. De opbouw staat in `visualisatie-scores.md`, onderdeel E.

- **Kolommen.** Eén kolom per lid van het Assessment. De kop toont de organisatienaam, met daaronder het label van de Meting en het aantal afgeronde scans. Organisaties die bij dat Assessment ontbreken, staan niet als kolom in de matrix. Ze staan al bij de teller.
- **Cijfers.** Het gemiddelde van de rij is het groepsgemiddelde van het bouwblok, want elk lid telt even zwaar mee (Gedeelde regels). De matrix leest dus uit dezelfde berekening als de rest van de sectie en heeft geen eigen rekenregel.
- **Alleen voor de Admin.** De kolomkoppen tonen de namen van de organisaties. Een Lead ziet deze matrix nooit en houdt alleen zijn view per organisatie (View per organisatie).
- **Bij veel organisaties.** De matrix scrolt horizontaal met een vaste eerste kolom.

### View per organisatie

Vanuit de benchmark opent de Admin voor elke deelnemende organisatie X een view. Per Assessment waar X lid van is, staat de Meting van X naast het gemiddelde van de rest van de groep, zonder X zelf. Zou X meetellen, dan trekt ze het gemiddelde naar zichzelf toe en kan ze bij een kleine groep de scores van de anderen terugrekenen.

Opbouw van de view:

- Bovenaan de Resultaatkop met de Totaalkaart van X, in plaats van de losse ring (`stylesheet.md`, Resultaatkop, Benchmark). De schakelaar staat eronder.
- Een radar met twee reeksen, X en de rest van de groep.
- Het staafdiagram per categorie, met het groepsgemiddelde als tweede, neutraal gekleurde balk naast die van X. De tweede balk komt in plaats van een markering, want hij leest beter.
- De radar en het staafdiagram naast elkaar lichten elkaar op, in beide richtingen en met beide reeksen, en scrollen niet (`stylesheet.md`, Radar en staafdiagram op elke plek, zonder scroll). Dat geldt ook voor de view van een lid bij niveau 1 en voor het detail van een benchmark.
- Het verschil per bouwblok (X min de rest, op één decimaal).
- Onder de view de tekst "Vergelijkgroep van n organisaties, samengesteld door Coniche", met de peildatum.

De range van de groep (laagste tot hoogste score) komt als band in de view, zonder namen, samen met de middelste helft van de groep en een label voor de positie. Het verschil per bouwblok (hierboven) gaat op in die weergave. De uitwerking staat in `visualisatie-scores.md`, onderdeel D. Open: Of de band een eigen drempel krijgt.

De view toont nooit de namen van andere organisaties. De Admin bekijkt de view eerst zelf.

### View voor een Lead op niveau 1

De Admin wijst de view niet meer toe op de view zelf. Voor de Lead is het een kolom in het Leads-venster van de organisatie (`beheerpagina.md`, punt 6a), met een vinkje per Lead. De Lead ziet de view naast zijn eigen resultaten op zijn pagina. Wat de Lead ziet:

- Geen automatische toegang. Een nieuwe benchmark is voor elke Lead een lege kolom.
- De view gaat over de Meting van de organisatie die als lid in de benchmark zit. Het vinkje kan voor elke Lead van die organisatie, ook voor een Lead zonder Resultaten, want de view toont de scores van de eigen organisatie zelf al. Van de Lead zelf speelt niets mee, ook niet zijn eigen scan.
- Een sectie alleen als het Assessment aan de drempel voldoet. Het vinkje kan pas aan als minstens één Assessment aan de drempel voldoet, en de Lead ziet alleen de secties die eraan voldoen.
- Wijzigt de samenstelling zodat de organisatie niet meer meedoet, of verdwijnt de Lead, dan wordt de cel grijs en valt het vinkje weg.

**Rechten.** In de rechtenmatrix staat `benchmark.inzien` voor de Lead, met het bereik "aangevinkte benchmarks" (`datamodel-rollen.md`). Wie wat ziet per niveau staat onder Rechten per niveau. De niveaus 2 en 3 en de overige regels staan onder View voor een Lead, verderop.

### Opgeslagen verkenning

Een Admin die in Verkennen (`visualisatie-verkennen.md`) een groep heeft gevonden, slaat de filters op als benchmark op niveau 1. Een Lead ziet dan hoe hij scoort ten opzichte van bijvoorbeeld alle Organisaties met Salesforce, zonder dat de Admin leden hoeft aan te vinken.

- **Soort.** Een benchmark op niveau 1 is een Vaste groep (de leden zijn gekozen, zoals hierboven beschreven) of een Verkenning (de leden volgen uit filters). In de lijst en in het Leads-venster staat het soort als badge.
- **Wat er wordt opgeslagen.** De naam, het Assessment, de eenheid (Organisaties of Onderdelen), de Meetperiode en de filters, dus de kenmerken met de gekozen waarden. De Meetperiode is een begindatum en een einddatum, of leeg als de meest recente Meting telt. De groepering, de focus en de drempel van een getalkenmerk horen bij het kijken en worden niet opgeslagen. De uitkomst ook niet. Een verkenning zonder filter is de hele pool en kan niet worden opgeslagen. Een periode telt niet als filter.
- **Leden.** De leden worden bij elk gebruik bepaald uit de filters, met de poolregels van Verkennen (`visualisatie-verkennen.md`, Pool). Dat zijn de Organisaties met `benchmarkToegestaan` en per Organisatie de Meting die telt volgens de Meetperiode van de verkenning, met minstens `benchmarkMinScans` afgeronde scans (Welke Meting telt waar). Komt er een Organisatie bij die aan de filters voldoet, dan telt ze mee, en valt er een af, dan verdwijnt ze. Bij een Vaste groep ligt de samenstelling vast (Gedeelde regels). Hier niet.
- **Eenheid Onderdelen.** Een lid is dan een onderdeel in plaats van een Organisatie. Alleen gewone Metingen met een onderdeel tellen mee, een samengestelde Meting nooit (Welke Meting telt waar). Een Organisatie kan meerdere leden hebben en elk lid telt even zwaar (Gedeelde regels). Per onderdeel telt de laatste Meting binnen de Meetperiode die aan `benchmarkMinScans` voldoet. Een Organisatie met alleen een samengestelde Meting heeft geen onderdelen en doet niet mee.
- **Toewijzen.** Via het Leads-venster van een Organisatie (`beheerpagina.md`, punt 6a), zoals bij een Vaste groep. De kolom staat er alleen als de Organisatie in de uitkomst zit. Bij de eenheid Organisaties betekent dat dat ze aan de filters voldoet, bij de eenheid Onderdelen dat minstens één onderdeel van haar eraan voldoet. Een Lead van een Organisatie die buiten de groep valt, kan de benchmark dus niet krijgen. De Admin kan dezelfde verkenning aan meerdere Leads geven, en een Lead kan meerdere benchmarks krijgen.
- **Wat de Lead ziet.** De view van niveau 1 (View per organisatie): Zijn eigen Organisatie tegenover de rest van de groep, zonder de eigen Organisatie in die rest. De naam van de benchmark, de filters en de Meetperiode zijn zichtbaar, de ledenlijst niet. De Lead ziet nooit de namen van andere Organisaties of van hun onderdelen. Bij de eenheid Onderdelen ziet hij de onderdelen van zijn eigen Organisatie met naam, naast de rest van de groep als anoniem gemiddelde. De naam van de benchmark is zichtbaar voor de Lead, dus de Admin kiest een naam die iets zegt.
- **Detail en perspectief.** Het detail van een opgeslagen verkenning heeft dezelfde schakelaar als een Meting (`visualisatie-scores.md`, onderdeel I) en volgt de eenheid. Een lege pagina is altijd een fout: Het scherm toont dan een melding met de reden.
  - **Eenheid Organisaties.** Zoals bij een Vaste groep: Het groepsgemiddelde bovenaan, de matrix en per Organisatie de view van niveau 1 tegenover de rest.
  - **Eenheid Onderdelen over meerdere Organisaties.** Het groepsgemiddelde, de matrix met de onderdelen als kolommen en per Organisatie een view met haar onderdelen tegenover de rest van de groep.
  - **Eenheid Onderdelen op één Organisatie.** Er is geen rest. Het detail is weergave I met alle onderdelen, de schakelaar Gemiddeld of Naast elkaar en Spreiding tussen onderdelen. Het perspectief van een onderdeel toont dat onderdeel tegenover de overige onderdelen, met dezelfde schakelaar als een Meting.
- **Lid dat wegvalt.** De melding "Deze Organisatie zit niet meer in de groep" bestaat alleen bij een Vaste groep. Bij een verkenning volgt de groep de filters. Is de Meting van een lid verwijderd, dan toont het perspectief een melding met de keuze "Kies een andere Meting" in plaats van een lege pagina.
- **Drempels.** Voor wat een Lead ziet geldt `benchmarkMinOrganisaties` (Drempels hieronder). Die telt altijd Organisaties, ook bij de eenheid Onderdelen, want vijf onderdelen uit twee Organisaties zijn te herleiden. De drempel is een instelling die een Admin kan aanpassen. De drempels van Verkennen zelf (`verkennenMinPool` en de andere) gelden voor de Admin tijdens het kijken en niet voor de Lead.
- **Filter op één Organisatie.** Staat er in de filters maar één Organisatie (bijvoorbeeld de onderdelen van Univé), dan is er geen rest die anoniem moet blijven. `benchmarkMinOrganisaties` geldt dan niet. `benchmarkMinScans` geldt per Meting wel. De Lead ziet zijn eigen onderdelen naast elkaar, met naam.
- **Onder de drempel.** De cel in het Leads-venster is grijs, met de reden erbij. De Admin ziet de benchmark altijd. In het Leads-venster staat bij elke kolom van een verkenning het aantal Organisaties, zodat de Admin dit voor het aanvinken weet. De redenen zijn "Te weinig Organisaties in deze groep: {n}, minimaal {min}" (`benchmarkMinOrganisaties`) en "Geen Meting in de Meetperiode" als de Organisatie van de Lead er niet in valt.
- **Aanpassen.** De Admin kan de naam, de filters en de Meetperiode achteraf wijzigen. Staan er Leads aan, dan zegt de bevestiging hoeveel. Valt een Organisatie door de wijziging buiten de groep, dan vervalt het vinkje van haar Leads. Het Assessment en de eenheid zijn niet te wijzigen, daarvoor maakt de Admin een nieuwe verkenning.
- **Vervallen.** Zoals bij een Vaste groep (View voor een Lead, Vervallen). Daar komt bij dat de Organisatie niet meer aan de filters voldoet, bijvoorbeeld omdat een kenmerk is gewijzigd of `benchmarkToegestaan` is ingetrokken.
- **Peildatum.** De cijfers zijn live (Gedeelde regels). De peildatum is het moment van openen.
- **Wie maakt hem aan.** Alleen een Admin (`benchmark.beheren`), vanuit Verkennen met de knop Opslaan als benchmark (`visualisatie-verkennen.md`, Opslaan als benchmark). Aanmaken vanuit de tab Benchmarks is er niet, want de filters horen bij het kijken.

Een filter naar een kenmerk dat niet meer bestaat, maakt de groep leeg. De detailpagina meldt dat en de cel van elke Lead is grijs.

### Drempels

Twee instellingen, door een Admin aan te passen (Instellingen, Drempels en termijnen).

- `benchmarkMinOrganisaties` (startwaarde 5). Minimale groepsgrootte per Assessment, inclusief de organisatie van de view. Bij 5 ziet een Lead het gemiddelde van minstens 4 anderen. De drempel is een afweging op privacy. Bij minder anderen kan een deelnemer uit het groepsgemiddelde en zijn eigen score vrij precies afleiden wat de rest scoort. De Admin ziet de benchmark altijd, ook onder de drempel. Bij een opgeslagen verkenning met de eenheid Onderdelen telt de drempel Organisaties en geen onderdelen (Opgeslagen verkenning).
- `benchmarkMinScans` (startwaarde 3). Minimaal aantal afgeronde scans in een Meting om gekozen te mogen worden. Dit gaat over betrouwbaarheid, omdat een score uit één of twee scans te weinig zegt, zeker met gelijk gewicht per lid.
- `benchmarkMaxDagenTussenMetingen` (startwaarde 90). Alleen voor niveau 2 met de lezing Naast elkaar: Het aantal dagen tussen de oudste en de nieuwste meetdatum waarboven de Admin een waarschuwing krijgt dat het geen vergelijkbaar meetmoment meer is. Het is geen blokkade.

Het privacy statement belooft een minimale groepsgrootte. Die belofte moet overeenkomen met de ingestelde waarde.


### Toestemming en privacy

Het privacy statement krijgt een disclaimer, gebaseerd op de formulering van Vlirdens. De inhoud is dat deelname betekent dat geaggregeerde en anonieme gegevens in een benchmark kunnen komen.

De vlag `benchmarkToegestaan` per organisatie, door een Admin gezet nadat dit met de organisatie is afgesproken, bijvoorbeeld via contract of mail. Zonder vlag staat de organisatie niet in de keuzelijst. De toestemming in de intake wordt per respondent gegeven en gaat over delen met Coniche. Geïmporteerde scans uit de oude tool en eerdere invullingen hebben de nieuwe tekst nooit gezien. De vlag legt vast dat de organisatie als geheel heeft ingestemd. Uitzetten van de vlag haalt de organisatie, na een bevestiging, uit alle benchmarks.

- `privacy-pagina.md` (sectie 3a) vermeldt dat er alleen geaggregeerde gegevens in een benchmark komen, dat er nooit een organisatienaam bij staat, welke minimale groepsgrootte geldt, en dat het verwijderen van een scan die scan ook uit de benchmark haalt, omdat alles wordt berekend.
- Het toestemmingsvakje in de intake (`schermen.md`, Intake) krijgt een aangepaste tekst. Die geldt voor nieuwe respondenten.

## Onderdeel en samengestelde Meting

Een Meting heeft een onderdeel en een meetdatum (`datamodel.md`, Meting). Twee Metingen van dezelfde organisatie kunnen twee dingen betekenen. Het zijn twee delen van de organisatie, bijvoorbeeld Team A en Team B. Of het is hetzelfde deel op twee momenten, bijvoorbeeld Team A in oktober 2026 en in oktober 2027. In het eerste geval is een gemiddelde zinvol. In het tweede geval zegt een gemiddelde weinig en wil je de ontwikkeling zien. De app dwingt die keuze niet af. De gebruiker bepaalt wat hij naast elkaar zet.

- **Ontwikkeling.** Dezelfde combinatie van onderdeel en Assessment op twee meetdata. Je maakt een vergelijking tussen Metingen met de lezing Ontwikkeling over tijd (Niveau 2 hieronder, `visualisatie-scores.md`, onderdeel C).
- **Delen van een geheel.** Verschillende onderdelen. De Admin of Consultant maakt er een samengestelde Meting van (hieronder), of de Admin zet ze in een vergelijking met de lezing Naast elkaar (Niveau 2 hieronder, `visualisatie-scores.md`, onderdeel H).
- **Benchmark tussen organisaties.** Per organisatie doet één Meting per Assessment mee. Dat kan een gewone of een samengestelde Meting zijn, van welke meetdatum dan ook. De keuzelijst in stap 3 van Samenstellen toont ze allemaal, met onderdeel en meetdatum erbij.

### Samengestelde Meting

Een Meting die verwijst naar andere Metingen (`Meting.samenstelling`) en daarvan het gemiddelde toont.

- **Samenstelling.** Eén organisatie, één Assessment, minstens twee Metingen, elke Meting hoogstens één keer. Verder is er geen grens: De Metingen kunnen van verschillende meetdata zijn. Elke onderliggende Meting heeft een meetdatum, voldoet aan `benchmarkMinScans` en is zelf niet samengesteld.
- **Wat ze is.** Een gewone Meting zonder Respondenten en zonder scans. Ze is niet invulbaar en staat in de lijst met de badge "Gemiddelde". De antwoorden worden niet gekopieerd, de scores worden berekend.
- **Gewicht.** Elke Meting telt één keer mee, ongeacht het aantal scans. Dit is dezelfde regel als in de benchmark (Gedeelde regels). Team A met 5 scans en totaalscore 3,0 en Team B met 40 scans en totaalscore 4,0 geven samen 3,5. Per scan gewogen zou het 3,9 zijn, en die variant bestaat niet. Uitleg in één zin: Elk onderdeel telt even zwaar, een team van vijf evenveel als een team van veertig.
- **Waarschuwing bij dezelfde combinatie.** Zitten twee geselecteerde Metingen met hetzelfde onderdeel en Assessment in de selectie, dan staat bij het opslaan een waarschuwing: Een gemiddelde over twee momenten van hetzelfde onderdeel zegt weinig over de ontwikkeling. Opslaan blijft mogelijk.
- **Onderdeel en meetdatum.** Het onderdeel is standaard "Hele organisatie", de naam kan de gebruiker aanpassen. De meetdatum volgt de onderliggende Metingen: Het is de laatste meetdatum van de selectie, en niet los te wijzigen. De app toont hem alleen-lezen.
- **Vergelijken.** Een samengestelde Meting is zelf een Meting, dus ze kan lid zijn van een vergelijking tussen Metingen. Zo is samenstelling 1 (bijvoorbeeld het gemiddelde van de teams in 2026) te vergelijken met samenstelling 2 (het gemiddelde in 2027). Zie Niveau 2.
- **Niveau 3.** Een samengestelde Meting is daar geen lid, want ze heeft geen scans.
- **Verwijderen van een onderliggende Meting.** Verwijderen moet altijd kunnen (bewaartermijn, AVG-verzoek). De Meting valt uit de samenstelling. De bevestiging noemt de samengestelde Metingen waarin ze zit en dat het gemiddelde daardoor verandert. Een samengestelde Meting zonder onderliggende Metingen verdwijnt. Blijft er één over, dan toont ze een melding, en de Admin past haar aan of verwijdert haar. Het alternatief, de gemiddelde antwoorden bij het opslaan vastleggen, staat in `backlog.md`.
- **Wie ziet wat.** Admin en Consultant (eigen organisatie) zien de samenstelling. Een Lead op een samengestelde Meting ziet alleen het gemiddelde en niet de onderliggende Metingen (`backlog.md`). Het vinkje daarop zet de Admin expliciet (View voor een Lead).
- **Weergave.** De resultatenpagina is die van een Meting, met als regel onder de titel "Gemiddelde van {n} Metingen, elk even zwaar". Voor de Admin staat eronder de matrix uit `visualisatie-scores.md`, onderdeel E, met de onderliggende Metingen als kolommen.

### Welke Meting telt waar

Dit is de ene plek waar staat welke Meting meedoet. De andere specs verwijzen hiernaar.

- **Vaste groep (niveau 1).** Per Organisatie en Assessment kiest de Admin bij het samenstellen één Meting, gewoon of samengesteld, van welke meetdatum ook (Samenstellen, stap 3). De keuze ligt vast.
- **Verkenning, eenheid Organisaties.** Per Organisatie telt de laatste Meting, gewoon of samengesteld, met een meetdatum in de Meetperiode van de verkenning. Zonder Meetperiode telt de meest recente Meting. De Meting heeft minstens `benchmarkMinScans` afgeronde scans. Een Organisatie zonder zo'n Meting doet niet mee.
- **Verkenning, eenheid Onderdelen.** Alleen gewone Metingen met een onderdeel. Per onderdeel telt de laatste Meting in de Meetperiode, of de meest recente zonder periode. Een samengestelde Meting telt nooit mee, want haar onderdelen zijn de onderliggende Metingen zelf, en die tellen al mee. Een Organisatie met één Meting zonder onderdeel is één eenheid, "Hele organisatie". Een Organisatie met alleen een samengestelde Meting heeft geen onderdelen.
- **Meetperiode.** Een begindatum en een einddatum op de meetdatum van de Meting. De Admin kiest een periode per meetmoment, bijvoorbeeld half januari tot begin februari voor de eerste meting en oktober voor de volgende. Zo blijft een eerdere meting te vergelijken, ook als een nieuwe al deels binnen is. Een periode die meeschuift, zoals de laatste twaalf maanden, is er niet (Open punten).
- **Niveau 2.** De Admin kiest de Metingen zelf. Kiest hij een samengestelde Meting en een van haar onderliggende Metingen samen, dan staat bij het opslaan een waarschuwing dat dezelfde scans dubbel meetellen. Opslaan blijft mogelijk.
- **Niveau 3.** Eén gewone Meting. Een keuze is er niet.

## Niveau 2: Binnen een organisatie, tussen Metingen

Een vergelijking van twee of meer Metingen van één organisatie. De vraag die ermee beantwoord wordt is hoe de ene Meting scoort ten opzichte van de andere. Dat kan op twee manieren, en de Admin kiest bij het aanmaken welke (zie Lezing): De ontwikkeling van een onderdeel tussen twee meetdata, of Metingen naast elkaar op een vergelijkbaar meetmoment, bijvoorbeeld twee teams of een samenstelling naast een andere. Deze vergelijking bestaat alleen als iemand haar als benchmark heeft aangemaakt. Er is geen vorige-Meting-knop op de resultatenpagina die zelf een vergelijking maakt.

- **Samenstellen.** De Admin kiest bij het aanmaken het niveau "Binnen een organisatie", daarna één organisatie, één Assessment, de Metingen en de lezing. Er geldt geen vlag `benchmarkToegestaan`, omdat de gegevens de organisatie niet verlaten. De eerste versie vergelijkt precies twee Metingen. Het ontwerp en het datamodel kennen meer dan twee, dus uitbreiden vraagt geen herbouw.
- **Lezing.** Een instelling van de benchmark (`Benchmark.lezing`) die zegt hoe de gekozen Metingen gelezen worden. In het scherm staat ze als schakelaar "Lees als" met twee keuzes. Ze bepaalt welke Metingen samen mogen, de volgorde en de weergave. Een Admin kan ze achteraf wijzigen.
  - **Ontwikkeling over tijd.** Dezelfde Meting op meerdere momenten, bijvoorbeeld Team A in oktober 2026 en in oktober 2027. Alle Metingen hebben hetzelfde onderdeel en een andere meetdatum, en de app dwingt dat af: Opslaan kan niet bij een ander onderdeel of bij twee gelijke meetdata, met de reden onder de lijst. Staan de Metingen op meetdatum, de oudste eerst, dan is dat de volgorde. De weergave is C. Een samenstelling mag, bijvoorbeeld "Hele organisatie 2025" naast "Hele organisatie 2026".
  - **Naast elkaar.** Metingen die op een vergelijkbaar meetmoment naast elkaar staan, bijvoorbeeld Team A en Team B, of een samenstelling naast een andere. Er is geen harde regel voor het onderdeel. Liggen de meetdata meer dan `benchmarkMaxDagenTussenMetingen` dagen uit elkaar (instelling, startwaarde 90), dan staat onder de lijst de waarschuwing "Deze Metingen liggen meer dan {n} dagen uit elkaar. Is dit een vergelijkbaar meetmoment?" Opslaan blijft mogelijk. De volgorde is op de naam van de Meting, zonder richting. De weergave is H, zonder pijlen en zonder "vorige" en "huidige".
  - **Standaardstand.** Kiest de Admin Metingen met hetzelfde onderdeel en verschillende meetdata, dan staat de schakelaar op Ontwikkeling over tijd. In elk ander geval staat ze op Naast elkaar. De standaardstand volgt de selectie zolang de Admin de schakelaar niet zelf heeft aangeraakt.
- **Welke Metingen.** Elke Meting van die organisatie met dit Assessment, mits ze een meetdatum heeft en minimaal `benchmarkMinScans` afgeronde scans (een samengestelde Meting voldoet als haar onderliggende Metingen voldoen). Het onderdeel mag verschillen, behalve bij de lezing Ontwikkeling over tijd. Een Meting kan hoogstens één keer meedoen. Doen een samengestelde Meting en een van haar onderliggende Metingen allebei mee, dan staat bij het opslaan een waarschuwing, omdat dezelfde scans dan twee keer meetellen in de vergelijking.
- **Volgorde.** Bij Ontwikkeling over tijd op meetdatum, de oudste eerst. Bij Naast elkaar op de naam van de Meting. De weergave toont de naam van de Meting en haar meetdatum.
- **Leden.** Een lid is een Meting (`BenchmarkLid`, met overal dezelfde `organisatieId`). In tegenstelling tot niveau 1 mag een organisatie meerdere leden per Assessment hebben.
- **Berekening.** Zie Gedeelde regels. Elke Meting telt even zwaar mee, ongeacht het aantal respondenten. Er is geen groepsgemiddelde over de gekozen Metingen, want een gemiddelde over twee momenten zegt weinig. Elke Meting toont haar eigen scores.
- **Teller.** "N Metingen". Er is geen Y, want de Admin kiest de Metingen zelf.
- **Weergave.** Bij Ontwikkeling over tijd en twee Metingen weergave C, met een holle ring op de oudere Meting, een gevulde stip op de nieuwere en het verschil per bouwblok. Bij Naast elkaar en twee Metingen weergave H, met twee verschillende symbolen en het verschil zonder richting. Daaronder een matrix met de bouwblokken als rijen en de Metingen als kolommen, in de volgorde van de lezing, met bij Ontwikkeling een kolom Verschil en bij Naast elkaar een kolom Hoogste, per bouwblok, per categorie en voor de totaalscore. De opbouw staat in `visualisatie-scores.md`, onderdeel C, H en E. Binnen één organisatie is anonimiteit geen probleem voor de Admin, dus de namen van de Metingen staan erbij.
- **Vorige Meting.** Er is geen automatische "vorige Meting". De Admin kiest welke twee Metingen samen een vergelijking vormen.
- **Op de resultatenpagina.** Zit een Meting in een benchmark binnen een organisatie, dan staat op haar resultatenpagina een knop "Vergelijking" die die benchmark opent. Zit ze in meer dan één, dan opent een keuzelijst met de naam van de benchmark en de lezing erbij. Zit ze in geen enkele, dan is de knop uitgeschakeld, met een Info-icoon (`info.vergelijkMetingen`) die zegt dat een Admin eerst een vergelijking moet aanmaken.
- **View voor een Lead.** Een Admin geeft een Lead via het Leads-venster het vinkje voor de benchmark (zie View voor een Lead).
- **Verwijderen.** Valt een Meting weg, dan verdwijnt het lid, zoals op niveau 1. Een benchmark met minder dan twee leden geeft een melding.

## Niveau 3: Binnen een Meting

De vraag is hoe een scan scoort ten opzichte van alle andere scans in dezelfde Meting. Het ontwerp van de spreiding en van hoge en lage scores staat in `visualisatie-scores.md`, onderdeel B. Wat daarnaast vastligt:

- **Lid.** Een afgeronde scan. De vergelijkgroep van een scan is alle andere afgeronde scans in dezelfde Meting, zonder de scan zelf. Dat is dezelfde reden als op niveau 1.
- **Berekening.** Elke scan telt even zwaar mee. Per vraag het gemiddelde antwoord van de andere scans, daarop de gedeelde scorefunctie.
- **Ondergrens.** Bij weinig scans is de vergelijking te herleiden naar personen. Daarom geldt een eigen instelling voor niveau 3, `benchmarkMinRespondenten` (startwaarde 5): Het minimale aantal afgeronde scans in de Meting, inclusief de scan van de view. Een Admin past hem aan in Instellingen. Te bevestigen.
- **Wie ziet het.** De Admin, die de namen van de Respondenten al ziet. Een Lead krijgt de spreiding als kolom Spreiding en de antwoorden via Antwoorden, beide zonder koppeling aan één scan (zie View voor een Lead).
- **Opslag.** Omdat de view niet meer aan een Lead wordt toegewezen, is er geen `Benchmark` met niveau "scans" nodig. Niveau 3 is een weergave op de resultatenpagina; wie wat ziet, staat onder Rechten per niveau.
- **Weergave.** Per bouwblok een stip per scan, een streep op het gemiddelde van de andere scans, een ring op de scan van de view en een label voor de spreiding (Eensgezind, Wisselend, Verdeeld). Zie `visualisatie-scores.md`, onderdeel B.

## Rechten per niveau

| Niveau | Admin | Consultant | Lead |
|---|---|---|---|
| 1. Tussen organisaties | Stelt samen en bekijkt, met de namen van de organisaties | Ziet de tab Benchmarks niet | De view van de eigen organisatie tegenover de rest, anoniem, met een vinkje van de Admin en boven de drempel |
| 2. Binnen een organisatie | Stelt samen en bekijkt, met de namen van de Metingen | Ziet de tab Benchmarks niet | Alleen de leden waarvoor hij Resultaten heeft, met een vinkje van de Admin |
| 3. Binnen een Meting | De weergaven Spreiding en Antwoorden, met de ring op één scan | Spreiding en Antwoorden voor Metingen binnen zijn bereik | Spreiding als kolom en Antwoorden als de Admin dat aanvinkt, zonder ring op één scan |

## View voor een Lead

Eén Leads-venster per organisatie bepaalt wat een Lead ziet (`beheerpagina.md`, punt 6a). Voor benchmarks is dat één kolom per benchmark waar de organisatie in zit, met een vinkje per Lead. Een Lead heeft geen bereik meer en een view wordt niet meer op de view zelf toegewezen.

- **Niveau 1.** De Lead krijgt de view van de organisatie tegenover de rest van de groep, als de organisatie in de benchmark zit. Resultaten is niet nodig, omdat de view de scores van de eigen organisatie zelf al toont. De lid-Meting kan per Assessment een andere zijn, en is vaak een samengestelde Meting (Onderdeel en samengestelde Meting). De Lead ziet alleen de secties die aan de drempel voldoen.
- **Opgeslagen verkenning (niveau 1).** Een Lead krijgt een Verkenning op dezelfde manier als een Vaste groep, met een vinkje in zijn kolom van het Leads-venster, en alleen als zijn Organisatie in de uitkomst zit. Wat hij ziet en welke drempels gelden, staat onder Niveau 1, Opgeslagen verkenning.
- **Niveau 2.** De Lead ziet de vergelijking met de Metingen die lid zijn van de benchmark en waarvoor hij Resultaten heeft, en niet meer dan dat. Heeft hij Resultaten op minder dan twee van de leden, dan is er niets te vergelijken en is de cel in de tabel grijs. Bij twee leden moet hij dus beide hebben.
- **Niveau 3.** De spreiding binnen een Meting krijgt een Lead als kolom Spreiding in het Leads-venster, zonder ring (`visualisatie-scores.md`, onderdeel B). Positie in de Meting, de ring op één scan, blijft voor de Admin. Een Lead die de antwoorden mag zien, krijgt ze via Antwoorden (`visualisatie-scores.md`, onderdeel G).
- **Geen scan nodig.** Een Lead kan een view krijgen zonder zelf een scan te hebben.
- **Samengestelde Meting.** Resultaten op een samengestelde Meting is altijd een bewuste keuze van de Admin. Toegang erft niet mee. Een Lead op een onderliggende Meting krijgt de samengestelde Meting niet, en andersom. Hij ziet alleen het gemiddelde. Er zijn geen Respondenten om uit te nodigen, en export van een samengestelde Meting is nog niet gedekt.
- **Geen namen van andere leden.** De Lead ziet nooit de namen van andere leden. Op niveau 2 staan dus geen namen van andere Metingen in zijn view, ook al ziet de Admin ze wel.
- **Drempels.** Elk niveau heeft een eigen instelling, door een Admin aan te passen in Instellingen. Niveau 1: `benchmarkMinOrganisaties` (startwaarde 5). Niveau 2: Geen eigen drempel meer. Het minimum is twee Metingen, en `benchmarkMinScans` geldt per Meting. Bij de lezing Naast elkaar geeft `benchmarkMaxDagenTussenMetingen` een waarschuwing, en geen drempel. Voldoet de groep niet, dan is de cel in de tabel grijs. De Admin ziet de benchmark altijd, ook onder de drempel.
- **Het scherm.** Op de view staat geen blok meer om een Lead te kiezen en geen knop "+ Lead toevoegen". Onder de view staat een lijst van de Leads die hem nu zien, met per Lead de knop "Bekijk" (het Respondent-overzicht, `beheerpagina.md`, punt 6b) en een verwijzing naar het Leads-venster van de organisatie.
- **Vervallen.** Het vinkje valt weg als de Meting wordt verwijderd, als de Lead of zijn Lead-rol verdwijnt, als de benchmark wordt verwijderd, als de organisatie of de Meting uit de benchmark valt, of, bij niveau 2, als de Lead zijn Resultaten op de lid-Meting verliest.
- **Audit.** `lead.toegangGewijzigd` (`datamodel.md`, Audit), met in `details` de benchmark en de organisatie, zonder naam of e-mailadres van de Lead. De bestaande gebeurtenissen `benchmark.toegewezen` en `benchmark.toewijzingIngetrokken` blijven geldig voor wat al is gelogd.

## Audit en verwijderen

De gebeurtenissen staan in `datamodel.md`, Audit, onder Benchmark. Wat een verwijderactie in andere records voor een benchmark betekent, staat in `datamodel.md`, Verwijderen en datakoppelingen. Een benchmark verwijderen verwijdert ook de vinkjes van Leads voor die benchmark. Organisaties, Metingen en scans blijven bestaan.

## Buiten deze spec

- Export (PDF, CSV, InDesign) van een benchmark. Dat is een derde soort naast de export van één scan en van een organisatieresultaat.
- Rechten van een Consultant op de benchmark.
- Een vastgezette versie in plaats van live cijfers.
- De berekening op de server (`backlog.md`, Fase 2). Nu draait ze in de browser, dus de privacyregels voor een Lead worden alleen in de schermen bewaakt.
- Ontwikkeling over meer dan twee meetdata binnen een benchmark (niveau 2 vergelijkt eerst twee Metingen).

## Open punten

- De startwaarden 5 en 3 van `benchmarkMinOrganisaties` en `benchmarkMinScans`.
- Of de tab Benchmark op het hoogste niveau blijft staan.
- De exacte tekst van de disclaimer en het toestemmingsvakje.
- Niveau 3: De startwaarde van `benchmarkMinRespondenten` (5).
- Niveau 2: Of voor het privacy statement iets nodig is, nu de gegevens binnen de organisatie blijven.
- Niveau 3: De grenzen van het spreidingslabel en de vraag of een Admin bij een stip de naam kan zien (`visualisatie-scores.md`, Open punten).
- Niveau 1: Of de band en de kwartielen van de groep een eigen drempel krijgen.
- Opgeslagen verkenning: Of een Consultant later een verkenning mag opslaan, en of een Meetperiode die meeschuift (de laatste twaalf maanden) nodig is.
- Niveau 1: Of de matrix bij heel veel organisaties een andere weergave nodig heeft dan horizontaal scrollen.
- Niveau 2: Hoe de weergave eruitziet bij meer dan twee Metingen, bijvoorbeeld een lijn per bouwblok over de meetdata. De eerste versie vergelijkt twee.
- Samengestelde Meting: Wat er gebeurt als er één onderliggende Meting overblijft, en de aanvulling in `datamodel.md`, Verwijderen en datakoppelingen.
- Niveau 1: Of het sectorfilter bij het samenstellen van een benchmark de korte namen gebruikt (`visualisatie-verkennen.md`, Korte namen).
