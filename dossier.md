# Coniche Scan: Dossier

Spec voor het Dossier van een Organisatie: Een lijst Cases, Benchmarks, Nieuws, Events en Blogs die een Consultant samenstelt, en die hij zichtbaar kan maken voor de Lead van de Organisatie. Het Dossier vervangt de lijst Nieuws bij de Kenmerken.

Ontwerp: Claude Design, "Coniche Scan Dossier", versie 15, borden 1, 3, 5 en 6, en bord 8 (Benchmark als Dossier-item). Het ontwerp is de bron voor de opmaak, deze spec voor het gedrag. Wat in een ander document staat en hier wordt aangepast, staat onder Aanpassingen in andere documenten.

Ontwerpen: bord `Dossier-beheer-B` (de schakelaar "Zichtbaar voor Lead" staat in een paneel "Instellingen voor de Lead"), `Dossier-verdeling-origineel` (de verdeling naast de radar) en `Dossier-item` (het formulier van een item met een schakelaar en drie even brede knoppen). Bij de Lead heet het Dossier "zichtbaar" en niet "open".

## Doel

Een Consultant wil bij een Organisatie bewaren wat hij tijdens een traject tegenkomt: Nieuws over de Organisatie, cases uit andere trajecten, events (vooral van Coniche of gelieerde partijen), blogs en een benchmark waarin de Organisatie zit. Een deel daarvan wil hij laten zien aan de Lead, met uitleg waarom het bij de Organisatie past. Het Dossier is primair een hulpmiddel voor de Consultant. De Lead ziet alleen wat de Consultant bewust zichtbaar maakt.

## Wat in versie 1 zit

- Vijf soorten items: Nieuws, Case, Event, Blog en Benchmark. Event, Blog en Benchmark hebben dezelfde opzet als de andere soorten (zelfde koppeling aan bouwstenen, zelfde schakelaar Zichtbaar voor Lead, zelfde rechten). Een Benchmark verwijst naar een benchmark waarin de Organisatie zit en linkt voor de Lead door naar die benchmark (zie Regels, Soort Benchmark).
- Het Dossier hangt aan de Organisatie. Een Dossier per Meting of per Onderdeel komt later.
- Een item kan gekoppeld worden aan bouwstenen van de Klantcontact Volwassenheidsscan en aan de AI-domeinen van de AI-scan. Op de pagina van de Lead filtert de radar op die koppeling, met een eigen radar per Assessment.
- Eén schakelaar op het Dossier ("Zichtbaar voor Lead") en per item een schakelaar "Zichtbaar voor Lead". Beide staan standaard uit. Het zijn schakelaars, dezelfde op beide plekken. Het Dossier heeft verder een eigen naam voor de Lead en per Assessment een instelling welke Meting de scores levert (zie Naam en scorebron).
- Een nieuwe Afspraak "Mag als case gebruikt worden" bij de Organisatie die in een Case voorkomt.

Wat er niet in zit, met een reden: Een gedeelde bibliotheek van items die over Organisaties heen wordt hergebruikt, een systeemvoorstel op basis van scores, koppeling aan één bepaald bouwsteen vanuit de resultaatpagina, andere soorten items (whitepaper, werkwijze, tool, webinar-opname) en koppeling aan andere Assessments dan de Klantcontact Volwassenheidsscan en de AI-scan. De eerste versie moet eenvoudig zijn, en de bibliotheek vraagt om herbruikbare items waar nog geen beheerscherm voor is. De ontwerpen daarvoor staan als v2 in hetzelfde ontwerpbestand.

## Datamodel

Het veld `Organisatie.nieuwsartikelen` vervalt. In plaats daarvan krijgt `Organisatie` het veld `dossier`. De velden staan ook in `datamodel.md`, Dossieritem.

```
Organisatie.dossier {
  zichtbaar: boolean                // standaard false
  zichtbaarSinds: datetime | null   // het moment waarop zichtbaar voor het laatst aan ging
  naamVoorLead: string              // maximaal 80 tekens, leeg = "Dossier {Organisatie.naam}"
  radarBronnen: RadarBron[]         // hoogstens één per Assessment met een radar, leeg of ontbrekend = overal automatisch
  gewijzigdOp: datetime | null      // laatste wijziging in wat een Lead ziet
  items: Dossieritem[]
}

Dossieritem {
  id: string
  soort: "nieuws" | "case" | "event" | "blog" | "benchmark"   // staat vast na het aanmaken
  titel: string                     // verplicht, getrimd, maximaal 200 tekens; bij een Benchmark leeg, de titel is de naam van de benchmark
  toelichting: string               // maximaal 400 tekens, mag leeg zijn, zie Toelichting
  zichtbaarVoorLead: boolean        // standaard false
  bouwsteenIds: string[]             // Bouwsteen.id, van de Klantcontact Volwassenheidsscan en de AI-scan, zie Koppeling aan bouwstenen, mag leeg zijn
  url: string                       // Nieuws: verplicht. Case: optioneel. Benchmark: geen, de link volgt uit benchmarkId. Altijd http of https
  aangemaaktOp: datetime
  gewijzigdOp: datetime

  // alleen bij soort "nieuws" en "blog"
  bron: string                      // de publicatie of de site, maximaal 80 tekens
  gepubliceerdOp: date | ""         // jjjj-mm-dd, leeg als het onbekend is

  // alleen bij soort "event"
  datum: date                       // jjjj-mm-dd, verplicht (de startdatum)
  einddatum: date | ""              // jjjj-mm-dd, leeg bij een event van één dag, niet voor `datum`
  plaats: string                    // maximaal 80 tekens, bijvoorbeeld "Utrecht" of "Online", mag leeg zijn

  // alleen bij soort "case"
  samenvatting: string              // verplicht, maximaal 600 tekens
  caseOrganisatieId: string | null  // de Organisatie waar de case over gaat, verplicht bij opslaan
  omvang: string                    // vrije tekst, maximaal 40 tekens, bijvoorbeeld "800 medewerkers"
  totResultaat: string              // vrije tekst, maximaal 40 tekens, bijvoorbeeld "6 weken"

  // alleen bij soort "benchmark"
  benchmarkId: string | null        // Benchmark.id (`benchmark.md`), verplicht bij opslaan, de Organisatie van het Dossier is lid van die benchmark
}
```

### Naam en scorebron

Ontwerp: `Dossier-beheer-B`.

```
RadarBron {
  assessmentId: string              // Assessment met een radar: Klantcontact Volwassenheid of AI-volwassenheid
  metingId: string | null           // null = automatisch (meest recent), anders een vaste Meting
}
```

- **Naam voor de Lead.** `naamVoorLead` is de titel van het Dossier bij de Lead (vrije tekst, getrimd, maximaal 80 tekens). Leeg geeft "Dossier {Organisatie.naam}". De naam staat alleen in het Dossier, de Organisatie zelf houdt haar naam. Overal waar de Lead de titel "Dossier {Organisatie}" zag, staat nu deze naam.
- **Scorebron.** Een ontbrekende `RadarBron` voor een Assessment betekent automatisch. `metingId` verwijst naar een Meting van die Organisatie en dat Assessment. De regels staan onder Welke scores.
- **Recht.** Wie `dossier.bewerken` heeft, mag beide instellingen wijzigen (Admin alle Organisaties, Consultant de eigen). Het Bewerkslot van de Organisatie geldt.

Bij een Event is `url` optioneel (de aanmeldpagina). Bij een Blog is `url` verplicht, zoals bij Nieuws.

`Organisatie.caseToegestaan` (boolean, standaard false) is de Afspraak "Mag als case gebruikt worden". Hij staat naast `benchmarkToegestaan` en `antwoordenMetNamen` (`datamodel.md`, Deel 2: Benchmark).

`OrganisatieLid` krijgt `dossierGezienOp: datetime | null`, gezet op het moment dat de Lead de Dossierpagina opent. De tag "Nieuw" op de kaart volgt daaruit (zie Mijn metingen).

### Regels

- **Toelichting.** Voor een Nieuwsitem de reden waarom het artikel relevant is. Voor een Case het blok "Waarom dit voor jullie telt". De Lead leest deze tekst, dus onder het veld staat een korte hint ("De Lead leest deze tekst zodra het item zichtbaar is voor de Lead.").
- **Titel, samenvatting en toelichting van een Case bevatten geen naam van de Organisatie in de case.** De Lead ziet die naam nergens, en een naam in een vrij tekstveld lekt dat. In het formulier staat de waarschuwing "Noem de organisatie niet bij naam." één keer, bij Samenvatting. Ze geldt ook voor de titel en de toelichting.
- **Adres.** Alleen `http` en `https`, met een punt in de domeinnaam. Een adres met een ander schema, zoals `javascript:`, wordt geweigerd. Zonder schema wordt `https://` voorgezet. Links openen in een nieuw tabblad met `rel="noopener noreferrer"`. Dit zijn de regels die voor nieuwsartikelen al golden.
- **Branche van een Case.** Is niet te bewerken. Het is de korte naam van de Sector uit de Kenmerken van `caseOrganisatieId` (`sbi-indeling.md`). Heeft die Organisatie geen Sector, dan kan de Case niet op Zichtbaar voor Lead, ziet de Lead de Case niet (ook niet als hij al op Zichtbaar voor Lead stond) en staat in het formulier "Vul de Sector in bij de Kenmerken van {Organisatie}."
- **Omvang en Tot resultaat.** Beide optioneel. Een leeg veld laat zijn tegel op de pagina van de Lead weg.
- **Een Case verwijst niet naar de eigen Organisatie.** `caseOrganisatieId` mag niet gelijk zijn aan de Organisatie van het Dossier.
- **Welke Organisaties je kunt kiezen.** In het veld "Organisatie in de case" staan de Organisaties met `caseToegestaan` aan, en de Organisaties waar de Consultant toegang toe heeft (die zonder toestemming met de aanduiding "Geen toestemming"). Een Consultant ziet zo geen namen van Organisaties waar hij niets mee te maken heeft en die niets hebben afgesproken.
- **Volgorde.** Cases met de nieuwste bovenaan op `aangemaaktOp`. Nieuws en Blogs met het nieuwste bovenaan op publicatiedatum, en zonder datum op `aangemaaktOp`, zoals nu. Events met het eerstvolgende bovenaan op `datum`, daarna de verlopen events met het meest recente eerst.
- **Event verlopen.** Een Event is verlopen vanaf de dag na `einddatum`, of na `datum` als er geen einddatum is. Dat volgt uit de datum, er is geen veld voor. Een verlopen Event verdwijnt niet vanzelf: De Consultant ziet de status "Verlopen" en kan het verwijderen of laten staan, en de Lead vindt het onder "Eerdere events" (zie Dossier lezen).
- **Event en Blog zonder toestemming.** Een Event of Blog heeft geen toestemming van een andere Organisatie nodig. Het gaat om eigen of gelieerde events en om blogs, en ze noemen geen Organisatie.
- **Soort Benchmark.** Een item van deze soort verwijst met `benchmarkId` naar een benchmark (`benchmark.md`) en heeft geen eigen titel en geen eigen link. Op de pagina van de Lead is de titel de `naam` van de benchmark en gaat de knop "Bekijk vergelijking" naar de benchmarkpagina van de Lead (`benchmark.md`, View voor een Lead), in hetzelfde tabblad. Een Consultant kiest alleen uit benchmarks waarin de Organisatie van het Dossier zit (bij een Verkenning: waarvan de uitkomst haar bevat). Dezelfde benchmark staat hoogstens één keer in een Dossier. De Lead ziet de naam van de benchmark, dus die bevat geen organisatienamen (de hint in het formulier zegt dat).
- **Toegang per Lead.** Het item geeft zelf geen toegang. Toegang tot een benchmark is het vinkje van een Lead in het Leads-venster (`benchmark.md`, View voor een Lead), en dat zet alleen een Admin. Een Lead ziet het item alleen met dat vinkje. Heeft geen enkele Lead van de Organisatie het vinkje, dan ziet niemand het item en toont de lijst het label "Geen toegang voor Lead". Zichtbaar voor Lead blijft dan wel aan te zetten, zodat een Consultant het item kan klaarzetten voordat een Admin de toegang geeft. Dat verschilt van een Case zonder toestemming, waar de schakelaar uit staat, omdat een Lead zonder toegang bij een benchmark niets te zien krijgt dat hij niet mag zien.

### Wat de Lead ziet

Een Lead ziet een item alleen als alle voorwaarden gelden:

1. `Organisatie.dossier.zichtbaar` staat aan.
2. `Dossieritem.zichtbaarVoorLead` staat aan.
3. Bij een Case: `caseToegestaan` van `caseOrganisatieId` staat aan.
4. Bij een Case: De Organisatie in de Case heeft een Sector (de branche is dan bekend).
5. Bij een Benchmark: Deze Lead heeft het vinkje voor die benchmark (`LeadToegang` met `weergave: "benchmark"`, `datamodel-rollen.md`) en de Organisatie zit nog in de benchmark. Het vinkje bestaat alleen als de benchmark aan de drempels voldoet (`benchmark.md`, Drempels), dus de kaart linkt nooit naar een view die voor deze Lead leeg is. Dit hangt van de Lead af: Twee Leads van dezelfde Organisatie kunnen een ander Dossier zien.

Dit wordt aan de serverkant bepaald, bij elke keer laden. Het prototype bepaalt het in de browser (`leadDossier`). Dat is alleen toelaatbaar met demodata, want de browser van de Lead krijgt dan ook wat hij niet mag zien. Zodra er echte Organisaties en Cases in staan, moet de server het bepalen (`go-live-plan.md`). De regels over toestemming en branche gelden alleen voor Cases, de regel over het vinkje alleen voor Benchmarks. De Lead krijgt `caseOrganisatieId` en de naam van die Organisatie nooit in de gegevens die naar de browser gaan, alleen de branche. Wordt de Afspraak later uitgezet, dan verdwijnt de Case bij de eerstvolgende keer laden voor de Lead, en blijft hij bij de Consultant staan met de status "Toestemming ontbreekt". Het Dossier is voor een Lead geen cijfer uit een andere Organisatie: Er staan geen scores van de Organisatie in de Case.

### Verwijderen en datakoppelingen

- **Item verwijderen.** Een eigen verwijderactie per item, met bevestiging.
- **Organisatie verwijderen.** Het Dossier gaat mee.
- **Organisatie verwijderen die in een Case voorkomt.** De bevestiging noemt het aantal Cases bij andere Organisaties dat naar haar verwijst. Die Cases krijgen `caseOrganisatieId: null`, `zichtbaarVoorLead: false` en de status "Kies een organisatie".
- **Benchmark verwijderd of Organisatie valt eruit.** Wordt de benchmark verwijderd, dan krijgt het item `benchmarkId: null`, `zichtbaarVoorLead: false` en de status "Kies een benchmark". Valt de Organisatie uit de benchmark, dan blijft het item staan en vervalt het vinkje van haar Leads (`benchmark.md`, Vervallen). Geen enkele Lead heeft dan toegang en het item toont "Geen toegang voor Lead".
- **Bouwsteen gearchiveerd.** De koppeling blijft staan. De chip toont de naam van de bouwsteen, maar de bouwsteen krijgt geen knooppunt in de radar en filtert dus niet.

### Koppeling aan bouwstenen

Een item verwijst naar bouwstenen met `Bouwsteen.id`. Dat zijn de 15 bouwstenen van de Klantcontact Volwassenheidsscan (`content-klantcontact-volwassenheid.md`) en de 8 AI-domeinen van de AI-scan (`content-ai-scan.md`), die in het datamodel ook `Bouwsteen` zijn. Een item mag aan beide soorten tegelijk gekoppeld zijn. Bouwstenen van andere Assessments zijn niet te kiezen. Het veld is optioneel. In de rest van deze spec betekent "bouwsteen" ook een AI-domein, en op een scherm van de AI-scan staat het woord uit `Assessment.bouwsteenLabel` ("AI-domein"). Een item zonder bouwstenen staat in de lijst op de pagina van de Lead, krijgt geen chip en komt alleen bij "Alle items" in beeld.

**Het Dossier per type Assessment.**

| Type | Dossier | Koppeling aan bouwstenen |
|---|---|---|
| Klantcontact Volwassenheid | Ja | De 15 bouwstenen |
| Zorg | Ja, op dezelfde manier | De 15 bouwstenen (dezelfde structuur) |
| AI-volwassenheid | Ja | De 8 AI-domeinen |
| Quickscan Ziekenhuis | Nog niet uitgewerkt | Nog niet uitgewerkt |
| Spanningsmeter | Nog niet uitgewerkt | Nog niet uitgewerkt |

Voor de Quickscan en de Spanningsmeter is het Dossier nog niet uitgewerkt (zie Open punten).

## Rechten

| Permissie | Admin | Consultant | Lead | Respondent |
|---|---|---|---|---|
| `dossier.bewerken` (items aanmaken, wijzigen en verwijderen, Zichtbaar voor Lead, de naam en de scorebron van het Dossier) | alle | eigen | - | - |
| `dossier.inzien` | alle | eigen | alleen wat zichtbaar is (zie Wat de Lead ziet), van de eigen Organisatie | - |

- **De Afspraak blijft bij een Admin.** `caseToegestaan` zet alleen een Admin, in de kaart Afspraken, net als de andere twee. Een Consultant ziet de kaart Afspraken niet. In het formulier van een Case staat voor een Consultant daarom bij ontbrekende toestemming de tekst "Vraag een Admin om 'Mag als case gebruikt worden' aan te zetten", en voor een Admin de knop "Naar Afspraken". Het ontwerp toont de knop voor beide rollen.
- **Bewerkslot.** Het Bewerkslot van de Organisatie geldt voor het hele Dossier, zoals bij de Kenmerken.
- **Contactpersonen.** `contactpersonen.bewerken` blijft zoals het is (alleen een Admin). Het gaat nu alleen nog over Contactpersonen.
- **Benchmark kiezen en toegang.** Wie `dossier.bewerken` heeft, kiest de benchmark, maar het vinkje voor de Lead blijft bij een Admin (`benchmark.md`). Is er geen Lead met toegang, dan staat in het formulier voor een Admin de knop "Naar Leads" (het Leads-venster van de Organisatie, `beheerpagina.md`, punt 6a). Het ontwerp toont de knop voor beide rollen, zoals bij de Case. Een Consultant ziet er dezelfde tekst bij, met erachter "Vraag een Admin om de Lead toegang te geven."
- **Een Lead kan niets wijzigen.** Er is geen reactie-, opslaan- of deelknop.

## Organisatie-detail, kaart Dossier (Consultant en Admin)

Ontwerp: `Dossier-beheer-B` (het eerste ontwerp, Bord 1 en `Dossier-beheer`, vervalt). De pagina volgt het stylesheet strak: Epilogue, alleen de maten 12, 14, 18 en 32px, gewichten 400, 600, 700 en 800, standaardknoppen van 40px, de standaard pil-groep en badges. De kaart staat onder de Kenmerken en onder de rij Toegang en Afspraken (als die er is), en boven de kaart KPI's. Contactpersonen blijft in de kaart Kenmerken staan, ongewijzigd. De lijst Nieuws in die kaart vervalt.

- **Kop.** De eyebrow met de naam van de Organisatie (12px, hoofdletters, `--or`) en de titel "Dossier" (32px, gewicht 800). Daaronder het paneel Instellingen voor de Lead, daarna de filterrij en de items.
- **Paneel "Instellingen voor de Lead".** Een witte kaart (rand 1px `--border`, 10px radius) met een kop (18px, gewicht 800, met Info-icoon `info.dossier`) en drie rijen. Links staat het label (12px, hoofdletters, gewicht 700, `--ink-s`, 200px breed), rechts de waarde (14px) met eronder een hint (12px, `--ink-s`) en uiterst rechts een potloodknop (40×40px, rand 1px `--border-d`, oranje icoon).
  - **Zichtbaar voor Lead.** Een schakelaar (40×24px, oranje als aan) met "Aan" of "Uit" (gewicht 700) en de hint "De Lead ziet het dossier en de items die zichtbaar zijn gemaakt. Uit: alleen jij en je collega-Consultants zien het." Standaard uit. Aanzetten vraagt een bevestiging: "Het Dossier wordt zichtbaar voor de Leads van {Organisatie}. Ze zien {n} items." Bij n gelijk aan 0 staat daar "Er staan nog geen items op Zichtbaar voor Lead." Uitzetten kan zonder bevestiging.
  - **Naam voor de Lead.** De naam (gewicht 700) met de badge "Standaard" zolang er geen eigen naam is, en de hint "Titel van het dossier voor de Lead. Leeg laten geeft "Dossier {Organisatie}"." Het potlood opent de modal "Naam voor de Lead" (560px breed, titel 18px) met een invoerveld, de hint "Leeg laten geeft "Dossier {Organisatie}" (de naam van de Organisatie). De naam komt alleen in het Dossier voor." en de knoppen Annuleren en Opslaan.
  - **Scores in de radar.** Een kleine tabel met de kolommen Assessment, Meting en Bron (kopjes 12px, hoofdletters) en een rij per Assessment met een radar (Klantcontact Volwassenheid en AI-volwassenheid; een Assessment zonder Metingen bij deze Organisatie staat er niet). De Meting staat als "Meting {maand jaar} · {n} scans", de Bron als badge: "Automatisch (meest recent)" (grijs) of "Handmatig" (`--or-faint`, oranje). Het potlood van de rij opent de modal "Meting voor de radar" (560px breed): Een keuze "Automatisch (meest recent)" met de hint welke Meting dat nu is, en per Meting een keuze "Handmatig: {Meting}" met de afrondingsdatum en het aantal scans. Een Meting waarvan de Lead de Resultaten niet mag inzien staat er uitgeschakeld, met de reden "Resultaten niet opengezet voor de Lead, daarom niet te kiezen". Onderaan de regel "De Lead ziet in het dossier welke Meting dit is, met een link naar de resultaten ervan." en de knoppen Annuleren en Opslaan.
- **Filter.** Een pil-groep `.pil-groep` met Alles, Cases, Benchmarks, Nieuws, Events en Blogs, elk met het aantal erachter (verlopen Events tellen mee). De gekozen pil is massief oranje. Rechts op dezelfde hoogte staat de knop "+ Toevoegen" (`.btn-or`, `.btn-compact`, 40px).
- **Rijen.** Eén witte kaart (rand 1px `--border`, 10px radius) met de items onder elkaar, gescheiden door een lijn van 1px `--border`. Een rij heeft vier kolommen (150px, 1fr, auto en 112px, 24px ertussen, padding 16px 24px): De soort als icoon met label (zie Soortkleur en icoon), de titel (14px, gewicht 700) met daaronder de regel in 14px `--ink-m`, de statusbadge, en de knop "Bewerken" (`.btn-outline`, 40px hoog, 112px breed). De toelichting staat niet in de rij.
  - Regel bij een Case: "{Organisatie in de case}, {branche in kleine letters}, ongeveer {omvang}, resultaat in {tot resultaat}". Een leeg veld valt weg. De Consultant ziet hier de naam van de Organisatie, de Lead niet.
  - Regel bij Nieuws en Blog: "{bron}, {datum}", zoals nu.
  - Regel bij een Event: "{datum}, {plaats}", bij een meerdaags event "{datum} tot {einddatum}, {plaats}". Een lege plaats valt weg.
  - Regel bij een Benchmark: "{Assessment}, {n} organisaties, {k} van {m} Leads hebben toegang", met m het aantal Leads van de Organisatie. Bij k gelijk aan 0 staat er "geen Lead heeft toegang". De titel is de naam van de benchmark.
- **Soortkleur en icoon.** In de eerste kolom van de rij staat een ronde tegel van 40px met het icoon van de soort (20px, lijndikte 1,75, `SoortIcoon` uit `components/icons/DossierIcons.tsx`), met 12px ruimte ervoor het label van de soort (12px, hoofdletters, gewicht 700, letterafstand .1em). Tegel, icoon en label hebben dezelfde kleuren als de kopicoontjes en datumtegels op de pagina van de Lead. Het label draagt de betekenis, het icoon is decoratief (`aria-hidden`).
  - **Case.** Koffertje, tegel `--or-faint`, icoon en label `--or`.
  - **Nieuws.** Krant, tegel `--bl-faint`, icoon en label `--bl`.
  - **Event.** Kalender, tegel `#e7f6ef`, icoon en label `--gr`. Een verlopen Event heeft een grijze tegel (`--bg-warm`) met icoon en label in `--ink-s`, zoals de datumtegel bij de Lead.
  - **Blog.** Pen op een blad, tegel `#fff6e0`, icoon en label `#7a5600`.
  - **Benchmark.** Staafdiagram (drie staven), tegel `#efeaf2`, icoon en label `--pu`. Nieuws is al blauw, dus Benchmark heeft geen blauw, ook al is de benchmarkkaart op Mijn metingen blauw (zie Open punten).
- **Statusbadge.** In de kleuren van de bestaande statuschips: "Zichtbaar voor Lead" (groen), "Intern" (grijs), "Verlopen" (grijs, alleen bij een Event waarvan de datum voorbij is) en "Toestemming ontbreekt" (oranje, voor elke Case waarvan de Organisatie `caseToegestaan` uit heeft, ook als het item op Intern staat). "Kies een organisatie" (oranje) bij een Case zonder `caseOrganisatieId`. Bij een Benchmark komen "Geen toegang voor Lead" (oranje, `zichtbaarVoorLead` staat aan maar geen enkele Lead van de Organisatie heeft het vinkje voor de benchmark) en "Kies een benchmark" (oranje, de benchmark bestaat niet meer) erbij.
- **Leeg.** "Er staan nog geen items in het Dossier."

## Item toevoegen of bewerken

Ontwerp: `Dossier-item` (herzien en akkoord op : Toelichting met teller en bouwstenen per categorie). Een modal van 640px breed, padding 32px, over een gedimde pagina. Titel "Item toevoegen aan het Dossier" (bij Bewerken "Item bewerken"). Onderin drie even brede knoppen (128px, 40px hoog): Links "Verwijderen" (`.btn-danger`, alleen bij Bewerken, vraagt om een bevestiging met `BevestigModal`), rechts "Annuleren" (`.btn-outline`) en "Opslaan" (`.btn-or`).

- **Soort.** Een pil-groep met Nieuws, Case, Event, Blog en Benchmark. Bij Bewerken staat de soort vast (de pil-groep is dan alleen-lezen).
- **Nieuws.** Titel (verplicht), Link (verplicht), Bron, Datum en Toelichting. In de toelichting staat de hint voor de Lead.
- **Event.** Titel (verplicht), Datum (verplicht), Einddatum (optioneel), Plaats, Link (optioneel) en Toelichting. Een einddatum voor de datum geeft de fout "De einddatum ligt voor de datum."
- **Blog.** Titel (verplicht), Link (verplicht), Bron, Datum en Toelichting, zoals Nieuws.
- **Benchmark.** Benchmark (verplicht, een keuzelijst met de benchmarks waarin de Organisatie zit; er is geen titelveld en geen linkveld), Toelichting en de bouwstenen. Onder het veld staat de hint "Alleen benchmarks waar {Organisatie} in zit. De Lead ziet de naam van de benchmark, dus kies een naam zonder organisatienamen." en een vlak (`--bg-warm`, rand 1px `--border`, 6px radius, padding 12px 16px) met drie kolommen zonder waarde om in te vullen: Assessment, Vergelijking ("{n} organisaties") en Soort (Vaste groep of Verkenning). Daaronder een groen paneel "{k} van {m} Leads van {Organisatie} hebben toegang tot deze benchmark. Alleen zij zien dit item." of, bij k gelijk aan 0, een oranje paneel "Geen enkele Lead van {Organisatie} heeft toegang tot deze benchmark. Een Admin geeft toegang in het Leads-venster. Zolang dat niet is gebeurd, ziet niemand dit item." met de knop "Naar Leads" (zie Rechten). De placeholder van de toelichting is "Waarom is deze vergelijking relevant voor deze organisatie?".
- **Case.** Titel (verplicht), Samenvatting (verplicht), Organisatie in de case (verplicht), Branche (alleen-lezen, met de hint "Uit de kenmerken van de organisatie."), Omvang, Tot resultaat, Link naar de volledige case (optioneel) en Toelichting.
  - Organisatie en Branche staan naast elkaar in twee kolommen van gelijke breedte met 16px ertussen, en Omvang en Tot resultaat ook. Onder het veld Organisatie staat een groen paneel "Toestemming staat vastgelegd bij de Afspraken van {Organisatie}." of een oranje paneel met de uitleg en de knop of tekst uit Rechten.
- **Samenvatting en Toelichting.** De meerregelige velden hebben een vaste hoogte: Samenvatting 72px (twee regels), Toelichting 96px (drie regels). Onder het veld staat links de hint (12px, `--ink-s`) en rechts de tekenteller "{n} / {max}" (12px, `--ink-s`), met n het aantal ingevoerde tekens. De maxima zijn 600 tekens voor Samenvatting en 400 voor Toelichting (`maxLength` op het veld, dus typen stopt bij het maximum). De hint onder Samenvatting is "Noem de organisatie niet bij naam." en onder Toelichting de hint voor de Lead. Eerder had Toelichting geen eigen hoogte en geen teller, waardoor het veld te klein was en niet te zien was hoeveel ruimte er nog was. De enkelregelige velden (Titel, Bron, Plaats, Omvang, Tot resultaat) hebben geen teller.
- **Gaat over bouwstenen.** Optioneel, onder de soortvelden, met het label "Gaat over bouwstenen (optioneel)". Bij twee Assessments staat boven de chips een pil-groep met "Klantcontact Volwassenheid" en "AI-volwassenheid", met bij elke pil het aantal gekozen bouwstenen. De bouwstenen van het gekozen Assessment (15 of 8) staan als chips, bij Klantcontact Volwassenheid gegroepeerd per categorie. Links van elke groep staat de categorienaam (12px, hoofdletters, gewicht 700, `--ink-s`, 108px breed), rechts staan de chips van die categorie in de volgorde van de nummers, met 8px ertussen en 12px tussen de groepen. De groepen zijn Overkoepelend (1 en 2), Organisatie (3 tot en met 6), Proces & Tech (7 tot en met 10), Mens (11 tot en met 14) en Fundament (15), zoals in het model. Een AI-domein heeft geen categorie, dus de acht chips staan zonder labelkolom in de volgorde van de nummers. Een AI-domein heeft zijn domeinkleur (`stylesheet.md`, Groepskleuren) en geen categoriekleur: Een gevulde cirkel van 22px in de categoriekleur met het nummer in wit (bij Fundament `--ink` op geel) en de naam. Een gekozen chip heeft een oranje rand en de achtergrond `--or-faint`. Meerdere keuzes mogelijk. Onder de chips: "De Lead ziet de gekozen bouwstenen bij het item en kan in de radar op deze bouwstenen filteren."
- **Zichtbaar voor Lead.** Een schakelaar (40×24px, oranje als aan, dezelfde als in het paneel Instellingen voor de Lead) onder een scheidingslijn, uit bij een nieuw item. Het label is "Zichtbaar voor Lead" (14px, gewicht 700), met eronder een regel (12px, `--ink-s`): "Alleen jij en je collega-consultants zien dit item." (uit) of "De Lead ziet dit item zodra het Dossier zichtbaar is voor de Lead." (aan). Bij een Case zonder toestemming is de schakelaar uitgeschakeld (opacity 50%) met de regel "Zonder toestemming van de organisatie in de case kan een case niet zichtbaar worden." Bij een Benchmark is de regel bij aan "De Lead ziet dit item zodra het Dossier zichtbaar is voor de Lead, en alleen een Lead met toegang tot de benchmark." en blijft de schakelaar bruikbaar zonder toegang (zie Regels, Toegang per Lead).
- **Opslaan.** Een fout staat boven de knoppen in een `.overzicht-melding`, bijvoorbeeld "Dit is geen geldig webadres." of "Kies de organisatie in de case." Het Bewerkslot geldt zolang de modal open staat.

## Mijn metingen, kaart Dossier (Lead)

Ontwerp: Bord 6 (de gekozen optie A). Bord 7 laat de afgewezen optie zien, met losse secties Cases en Nieuws, en vervalt uit het ontwerp zodra de bouw is gestart.

- **Plek.** Een eigen sectie "Dossier, 1" onder Vergelijkingen. Is er geen sectie Vergelijkingen, dan onder Metingen. De sectie staat er alleen als `zichtbaar` aan staat en er minstens één item zichtbaar is. Het Dossier is dus één kaart in het overzicht, en de losse Cases en Nieuwsberichten staan er niet.
- **Kaart.** Zoals de benchmarkkaart (`visualisatie-mijn-metingen.md`, Benchmarkkaart): Volle breedte, achtergrond `--bg-warm`, links een rond icoon van 48px in `--or-faint` met een oranje mapje. Daarnaast de eyebrow "Dossier" (12px, hoofdletters, `--or`), eventueel de tag "Nieuw" (blauw), de titel {naam voor de Lead} (18px, gewicht 800) en de regel "Gedeeld door je consultant op {zichtbaarSinds}" (14px, `--ink-s`).
- **Voorproef.** Onder de regel maximaal drie chips met de titels van items: Eerst de Cases, daarna de Benchmarks, het Nieuws, de Events en de Blogs, een stip in oranje, paars, blauw, groen of amber ervoor. Een verlopen Event staat er niet bij. Zijn er meer, dan staat er "+ n meer" achter. Daaronder in 12px: "2 cases · 1 benchmark · 2 nieuwsberichten · 2 events · 1 blog". Een soort zonder items valt weg, en een verlopen Event telt niet mee.
- **Knop.** "Bekijk dossier" (hoofdactie), even breed als "Bekijk vergelijking" op de benchmarkkaart. Dat is 184px in het ontwerp; zie Open punten voor de regel over knopbreedte.
- **Tag "Nieuw".** Staat er zolang `OrganisatieLid.dossierGezienOp` leeg is of vóór `dossier.gewijzigdOp` ligt.

## Dossier lezen (Lead)

Ontwerp: Bord 5. Een pagina van de Lead bij de persoonlijke link. De nav is die van de Lead, met "← Terug naar Mijn metingen". Opent de Lead de pagina, dan wordt `dossierGezienOp` gezet.

Van boven naar beneden:

1. **Kop.** Achtergrond `--or-faint` met concentrische cirkels in `--or-mid` rechts. Er is geen paars in de kop (de kop lijkt anders te veel op een andere Coniche-site). Eyebrow "Dossier" (`--or`, donkerder variant `#c2570c` voor tekst), titel {naam voor de Lead} (32px), een zin ("Je consultant heeft cases en nieuws verzameld die passen bij jullie situatie, met bij elk item uitleg waarom. Bij elk item staat de bouwsteen waar het over gaat."), twee chips ("Gedeeld door je consultant", de datum van `zichtbaarSinds`) en rechts een tegel per soort dat items heeft, met het aantal (Cases, Benchmarks, Nieuwsberichten, Events, Blogs). Een verlopen Event telt niet mee.
2. **Waar dit dossier over gaat.** Een kaart (10px radius, `--bg-warm`, padding 32px) met links de radar en rechts de verdeling (zie Verdeling rechts van de radar). Alleen aanwezig als minstens één zichtbaar item bouwstenen heeft. Hebben items bouwstenen in twee Assessments, dan staat boven de radar een pil-groep met de namen van die Assessments en toont de kaart er één tegelijk, met bij elke pil het aantal items. Bij maar één Assessment staat die pil-groep er niet. De eerste keer staat het Assessment met de meeste zichtbare items open. Een filter op een bouwsteen van het andere Assessment zet de pil om. Eerdere events tellen hier mee, ook als ze nog dichtgeklapt zijn. Zie Radar met filter.
3. **Filterbalk.** Alleen als er een filter staat: Een balk in `--or-faint` met de bouwsteen (cirkel met nummer, naam, "n items in dit dossier") en rechts de knop "Alle items tonen ×" (`.btn-outline`, 32px hoog).
4. **Soortfilter.** Een rij pillen: Alles, Cases, Benchmarks, Nieuws, Events, Blogs, elk met het aantal items dat nu in de lijst past (een verlopen Event telt niet mee, het filter op een bouwsteen telt wel mee). Eén pil is tegelijk gekozen, standaard Alles. De pil van de gekozen soort is oranje gevuld. Het soortfilter en het filter op een bouwsteen werken samen.
5. **Lijst met rail "In dit dossier".** Links een rail die meescrolt (sticky) met de kop "In dit dossier" (12px, hoofdletters) en per sectie een regel: Het nummer in een cirkel, de naam en het aantal items. Een klik springt naar de sectie. De sectie waar de lezer staat is subtiel gemarkeerd: Een achtergrond van `--or-faint`, de naam in `--ink` (gewicht 700), het nummer in een cirkel van `--or` met een wit nummer en het aantal in `--ink-m`. De regel is dus niet oranje gevuld (dat was te zwaar naast de rest van de pagina); de andere regels hebben geen achtergrond en krijgen bij hover `--bg-warm`. Rechts de secties zelf, in deze volgorde:
   1. **Basis op orde brengen** ("Hier ligt de meeste winst"): Items met minstens één bouwsteen in de klasse Basis op orde (score onder 2,5).
   2. **Uitbouwen** ("Dit werkt al en kan verder groeien"): Items met minstens één bouwsteen van 2,5 tot 3,5.
   3. **Sterk punt** ("Hier zijn jullie goed in, houd dat vast"): Items met minstens één bouwsteen op 3,5 of hoger.
   4. **Algemeen** ("Niet aan één {bouwsteen of domein} gekoppeld"): Items zonder bouwsteen, of waarvan geen enkele bouwsteen een score heeft. Het is een vierde groep naast de drie klassen, met een grijze cirkel met een streepje in plaats van een nummer.

   Een item staat in elke sectie waarin minstens één van zijn bouwstenen valt. Elke bouwsteen telt met de klasse van zijn eigen score, over beide Assessments heen. Een item met een bouwsteen in Basis op orde en een bouwsteen in Sterk punt staat dus in beide secties, zodat de Lead ook ziet wat er al goed gaat bij een item dat ook een zwak punt raakt. Eerder stond een item alleen in de sectie van zijn laagste bouwsteen, waardoor de rail vaak alleen Basis op orde brengen toonde. Het aantal in de rail en achter de sectienaam telt de items in die sectie, dus de aantallen samen mogen hoger zijn dan het aantal items. De tegels in de kop, de pil Alles en de soortpillen tellen elk item één keer. In Algemeen staan alleen items zonder bouwsteen en items waarvan geen enkele bouwsteen een score heeft. Een bouwsteen zonder score geeft een item geen sectie. Elk item toont in elke sectie al zijn chips "Gaat over". Een sectie zonder items valt weg, met zijn regel in de rail. Binnen een sectie staan de items per soort, elk met een eigen kop (hieronder). Is er geen Meting waarvan de Lead de Resultaten mag zien, dan bestaan er geen klassen: Dan is er geen verdeling, geen rail en geen secties, en staan de soorten gewoon onder elkaar met dezelfde koppen.
6. **Cases.** Een kop met oranje icoon, "Cases" (24px, gewicht 800) en de regel "Zo hebben andere organisaties het aangepakt". Per Case een kaart (`.case`): Links een oranje blok van 168px met de branche (32px, gewicht 800; een branche van meer dan 14 tekens staat op 24px, anders past ze niet in de 168px) en het label "Branche". Rechts de badge "Case", de titel (24px), de samenvatting (16px, `--ink-m`), de tegels Omvang en Tot resultaat, het blok "Waarom dit voor jullie telt" (alleen met toelichting, achtergrond `--or-faint`, rand `--or-mid`), en onderaan "Gaat over" met de chips en de knop "Lees de case" (alleen met link). De naam van de Organisatie in de case staat er nergens.
7. **Benchmarks.** Een kop met paars icoon (het staafdiagram in `--pu` op `#efeaf2`), "Benchmarks" (24px, gewicht 800) en de regel "Zo doen jullie het naast andere organisaties" (ontwerp bord 8). Per Benchmark een rij zoals bij Nieuws: Links een tegel van 64px in `#efeaf2` met het staafdiagram (28px, `--pu`), de titel (de naam van de benchmark, 18px, gewicht 700, als link), de regel "Vergelijking van {n} organisaties, {Assessment}" (14px, `--ink-s`), de toelichting, de chips "Gaat over" en rechts de knop "Bekijk vergelijking" (`.btn-outline`, 36px). Het aantal organisaties valt uit de regel weg als de benchmark onder `benchmarkMinOrganisaties` zit, zoals op de benchmarkkaart (`visualisatie-mijn-metingen.md`, Benchmarkkaart). Link en knop gaan naar de benchmarkpagina van de Lead en openen in hetzelfde tabblad, want de Lead blijft in de app, dus zonder pijl ↗. Er staan alleen benchmarks waarvoor deze Lead het vinkje heeft.
8. **Nieuws.** Een kop met blauw icoon, "Nieuws" en de regel "Wat er speelt rond jullie organisatie". Per item een rij (`.nieuws`): Links een datumtegel van 64px in `--bl-faint` (maand en dag; zonder datum een nieuwsicoon), de titel als link, de bron, de toelichting, de chips "Gaat over", rechts de knop "Lees artikel ↗" (`.btn-outline`, 36px). Er staat geen soortlabel in de rij: De kop zegt de soort al.
9. **Events.** Een kop met groen icoon, "Events" en de regel "Zien we je daar?". Per Event een rij zoals bij Nieuws, met links een datumtegel van 64px in `#e7f6ef` (maand en dag, in `--gr`), de titel, "{datum}, {plaats}", de toelichting, de chips "Gaat over" en rechts de knop "Meer informatie ↗" (alleen met link). Verlopen Events staan niet in de lijst maar achter de regel "Eerdere events tonen ({n})" onder de lijst, die bij een klik uitklapt (en dan "Eerdere events verbergen ({n})" heet). Die zijn dan grijs (datumtegel in `--bg-warm`) en hebben geen knop. Een filter op een bouwsteen klapt de eerdere events van die bouwsteen niet vanzelf uit.
10. **Blogs.** Een kop met amberkleurig icoon, "Blogs" en de regel "Om verder te lezen". Opmaak zoals Nieuws, met een datumtegel van `#fff6e0` en de knop "Lees blog ↗".
11. **Slotregel.** "Vragen over dit dossier? Je consultant helpt je graag verder."

Een soort zonder items in een sectie (door een filter of omdat er geen zijn) valt weg, met de kop. Staat er na filteren niets meer, dan staat er één regel: "Voor deze keuze staat nog niets in het dossier."

### Radar met filter

De radar is dezelfde component als op het resultaatscherm (`stylesheet.md`, Radar en staafdiagram op het resultaatscherm), in een filtermodus. Bij de AI-scan zijn dat 8 taartpunten van 45° in de domeinkleuren, zonder categorielaag (`visual-bouwstenen-en-domeinen.md`), en heet de lijst naast de radar "domeinen". De film voor de Lead en de Help is `Film-Dossier-AI` (ontwerp `radar`). Alles uit die spec geldt (knooppunten van 26px met alleen het nummer, taartpunten per categorie, ringen op 2,5 en 3,5), met deze verschillen:

- **Actieve knooppunten.** Alleen bouwstenen met minstens één zichtbaar item zijn actief. Een actief knooppunt is gevuld in de categoriekleur (nummer wit, bij Fundament `--ink`) en is een knop. De andere knooppunten staan op 40% dekking, zijn niet klikbaar en hebben alleen de tooltip.
- **Klik.** Een klik op een actief knooppunt filtert de lijsten Cases, Benchmarks, Nieuws, Events en Blogs op die bouwsteen. Een tweede klik op hetzelfde knooppunt heft het filter op. Er is één bouwsteen tegelijk te kiezen, over beide Assessments heen.
- **Gekozen bouwsteen.** Het knooppunt krijgt een witte ring en daaromheen een ring van 2px in de categoriekleur. De taartpunt van de bouwsteen krijgt 50% dekking (de andere punten houden hun dekking).
- **Dezelfde klik elders.** Een rij in de lijst rechts van de radar, en een chip bij een item, doen hetzelfde als het knooppunt. Er is maar één filter, bewaard in de URL (`?bouwsteen=…`) zodat de terugknop van de browser werkt.
- **Score.** De polygoon en de score-stippen volgen de Meting waarvan de Lead de Resultaten mag zien (zie hieronder). Een stip van 10px met een witte rand van 2px in `--or` komt alleen bij de actieve bouwstenen.
- **Legenda onder de radar.** "Organisatie {naam}" met de oranje lijn en "Grenzen 2,5 en 3,5" met de stippellijn, in het formaat van de legenda in `stylesheet.md`.
- **Tooltip.** Zoals de tooltip van de radar: Eerste regel nummer en naam, tweede regel getal en klasse.
- **Toetsenbord.** Tab loopt langs de actieve knooppunten. Enter of spatie filtert. `aria-pressed` staat op het gekozen knooppunt.

**Welke scores.** (Ontwerp `Dossier-beheer-B`.) De radar en de verdeling tonen de groepsscore per bouwsteen van één Meting per Assessment (Klantcontact Volwassenheid of AI-volwassenheid) bij deze Organisatie. Welke Meting dat is, stelt een Consultant of Admin in per Dossier en per Assessment (zie Naam en scorebron en Organisatie-detail):
- **Automatisch (meest recent)** is de standaard. Het Dossier gebruikt de meest recente Meting (op meetdatum) van dat Assessment bij deze Organisatie waarvan de Lead de Resultaten mag inzien (`resultaten.inzien`, de aangevinkte weergave Resultaten). Een nieuwe Meting wordt vanzelf overgenomen.
- **Handmatig** kiest één bepaalde Meting (`RadarBron.metingId`). Kiesbaar zijn alleen Metingen van dat Assessment bij deze Organisatie waarvan de Lead de Resultaten mag inzien.
- **Verliest een gekozen Meting zijn zichtbaarheid**, omdat de weergave Resultaten voor de Lead wordt uitgezet of de Meting wordt verwijderd, dan gaat `zichtbaar` van het Dossier uit. De Lead ziet het Dossier dan niet meer, dus ook geen scores die hij niet mag zien. Het paneel Instellingen voor de Lead toont boven de rij Zichtbaar voor Lead een melding (oranje, `.overzicht-melding`): "Het Dossier is niet meer zichtbaar voor de Lead, omdat de Meting voor de radar ({Assessment}, {Meting}) niet meer zichtbaar is voor de Lead. Controleer de Meting en zet het Dossier daarna weer aan." De gekozen Meting blijft in de rij staan met de aanduiding "Niet zichtbaar voor de Lead", zodat de Consultant ziet welke het is. Aanzetten kan pas weer als elke handmatig gekozen Meting weer zichtbaar is voor de Lead, of de Consultant voor dat Assessment een andere Meting of Automatisch kiest.
- **Geen Meting beschikbaar.** Is er geen Meting waarvan de Lead de Resultaten mag inzien, dan staat de radar zonder polygoon, zonder stippen en zonder scores en klassen in de tooltip en de lijst, en zonder reeks in de legenda.
- **Transparant voor de Lead.** De bronregel onder de verdeling noemt de gekozen Meting en linkt naar de Resultaten ervan (zie Bron van de scores).

**Verdeling rechts van de radar.** (Ontwerp `Dossier-verdeling-origineel`.) De kaart "Waar dit dossier over gaat" heeft de achtergrond `--bg-warm`, een rand van 1px `--border`, 10px radius en padding 32px. Links staat de radar met zijn legenda eronder, verticaal gecentreerd in de ruimte links; rechts een kolom van 660px. In die kolom van boven naar beneden: De kop "Waar dit dossier over gaat" (18px, gewicht 800), een zin (16px, regelhoogte 26px, `--ink-m`: "Kies een bouwsteen om de cases, het nieuws, de events en de blogs daarover te zien. Onder de radar staan de bouwstenen met de laagste score bovenaan." Bij AI: "domein" en "domeinen"), de rijen, de legenda, de knop "Nog {n} bouwstenen tonen ▾" (bij AI "domeinen", bij 1 "bouwsteen" of "domein"; na een klik "Minder tonen ▴") en de bronregel. Er staat geen uitlegrij met de klassen boven de rijen en geen as met getallen onder de rijen. Eerst 4 rijen, de **laagste score eerst**.
- **Rij.** Elke rij is een eigen witte kaart (rand 1px `--border`, 10px radius, padding 14px 16px, minimaal 64px hoog, 8px tussen twee kaarten) met vier kolommen (28px, 1fr, 180px en 132px, 20px ertussen): De cirkel met het nummer (28px), **gevuld in de categoriekleur met een wit nummer** (bij Fundament `--ink` op geel), zodat hij overeenkomt met het gevulde knooppunt in de radar; de naam (14px, regelhoogte 20px, gewicht 700, hoogstens twee regels) met daaronder "{n} item" of "{n} items" (12px, regelhoogte 16px, `--ink-s`, 4px onder de naam); de balk; en de score (14px, gewicht 700) met de klasse als badge (12px, gewicht 700, 24px hoog, afgerond), rechts uitgelijnd.
- **Balk.** De schaal 1 tot 5 als slanke balk van 10px hoog, afgerond, met een rand van 1px `--border` en drie bleke zones: Basis op orde (37,5%, rood `#d9383a` met 10% dekking), Uitbouwen (25%, oranje `#e8892b` met 13%) en Sterk punt (37,5%, groen `#1c9a5b` met 11%), met de grenzen op 2,5 en 3,5 (dezelfde grenzen als de stippellijnen in de radar). Er staan geen lijnen op de grenzen en geen getallen onder de balken: De legenda noemt de grenzen. Een stip van 14px in `--or` met een witte rand van 2px staat op de score, met een duidelijke gloed: `0 0 0 3px rgba(255,103,31,.25), 0 0 10px 3px rgba(255,103,31,.6)` (de gloed is oranje, ook op de gekleurde zones).
- **Legenda.** Onder de laatste rij, buiten de witte kaarten, op één regel, 12px onder de laatste kaart en 16px naar rechts ingesprongen (uitgelijnd met de cirkels in de rijen): Drie items met een stip van 12px (rood `#d9383a`, oranje `#e8892b`, groen `#1c9a5b`), de klassenaam (14px, gewicht 700) en de grens (14px, `--ink-s`): "Basis op orde onder 2,5", "Uitbouwen 2,5 tot 3,5" en "Sterk punt vanaf 3,5". Bij een smal scherm breekt de legenda naar een tweede regel.
- **Klik.** Een klik op de rij doet hetzelfde als de klik op het knooppunt in de radar. De gekozen rij heeft een oranje rand en de achtergrond `--or-faint`. `aria-pressed` staat op de gekozen rij.
- **Bron van de scores.** Onder de verdeling (en onder de radar bij een smal scherm) staat een regel (12px, `--ink-s`): "Scores uit de meting {Assessment} van {maand jaar}, groepsscore van {n} afgeronde scans." met daarachter de link "Bekijk de meting" (`--or`, onderstreept bij hover). De link gaat naar de Resultaten van die Meting, dezelfde pagina als de knop "Resultaten hele meting" op Mijn metingen, zodat de Lead de onderliggende meting kan nalopen. Het is de Meting die volgens de scorebron van het Dossier voor dat Assessment is gekozen (zie Welke scores); bij twee Assessments volgt de regel de pil boven de radar. Zonder zo'n Meting staat de regel er niet en is er ook geen verdeling. Een rij heeft geen eigen link, want een klik op de rij filtert. Wie meer wil zien, volgt de link naar de Meting. In de tooltip van een rij staat "Groepsscore {score}, meting {maand jaar}".
- **Klassen.** Dezelfde namen en grenzen als overal (`stylesheet.md`): Basis op orde onder 2,5, Uitbouwen van 2,5 tot 3,5 en Sterk punt vanaf 3,5.
- **Zonder Meting.** Is er geen Meting waarvan de Lead de Resultaten mag zien, dan is er geen verdeling: Naast de radar staat dan de lijst van de actieve bouwstenen zonder score en klasse, met alleen het nummer, de naam en "{n} items" (volgorde: Het nummer van de bouwsteen). Er is ook geen rail en geen sectieverdeling (zie het scherm hierboven)
- **Twee Assessments.** De pil-groep boven de radar schakelt de radar en de verdeling om. Rail en secties blijven één geheel over beide Assessments heen, want een item kan in meerdere secties staan.

**Chips.** Bij een item staan achter "Gaat over" (12px, hoofdletters, `--ink-s`) de bouwstenen als chips: De cirkel met het nummer en de naam, 12px gewicht 600, rand 1px `--border`, afgerond. Een klik filtert.

## Audit

Nieuwe gebeurtenissen (`datamodel.md`, Audit), in plaats van `nieuwsartikel.*`:

- `dossier.itemToegevoegd`, `dossier.itemGewijzigd` en `dossier.itemVerwijderd`. `details` bevat de Organisatie, de soort (nieuws, case, event, blog of benchmark), de titel (bij een Benchmark de naam van de benchmark), en bij `itemGewijzigd` de namen van de gewijzigde velden. Bij een Case staat ook de naam van de Organisatie in de case erin (de log is alleen voor een Admin).
- `dossier.zichtbaarGemaakt` en `dossier.verborgen` (voorheen `dossier.geopend` en `dossier.gesloten`): `zichtbaar` is aan of uit gezet, met de Organisatie en het aantal zichtbare items. Gaat het Dossier uit omdat een gekozen Meting niet meer zichtbaar is voor de Lead, dan staat daar ook de reden en de Meting bij.
- `dossier.instellingGewijzigd`: `naamVoorLead` of een `radarBronnen` is gewijzigd. `details` bevat de Organisatie, het veld, bij een scorebron het Assessment en de Meting (of "automatisch"), en de oude en nieuwe waarde.
- `organisatie.caseVlagGewijzigd`: `caseToegestaan` is gewijzigd, met de Organisatie en de nieuwe waarde.

## Exports

Het Dossier staat niet in de exports (`export-csv.md`, `export-indesign.md`, `export-pdf-visual-*.md`) en niet in de import (`import-scans.md`).

## Info-teksten

Nieuw (`beheerpagina.md`, Info-iconen):

- `info.dossier`: "Cases, benchmarks, nieuws, events en blogs die je bij deze organisatie bewaart. Alleen jij en je collega-consultants zien ze. De Lead ziet een item pas als het Dossier zichtbaar is én het item op Zichtbaar voor Lead staat. Een case kan alleen zichtbaar worden als de organisatie in de case dat heeft toegestaan, en een benchmark alleen voor een Lead die toegang heeft tot die benchmark."
- `info.caseVlag`: "Zet dit pas aan nadat dit met de organisatie is afgesproken, bijvoorbeeld via contract of mail. Dan mag een consultant deze organisatie als case laten zien aan de lead van een andere organisatie. De lead ziet de branche en de omvang, nooit de naam. Uitzetten haalt de cases met deze organisatie meteen weg bij de leads."

`info.nieuwsartikelen` vervalt.

## Open punten

- **Kleur van Benchmark.** In het Dossier is Benchmark paars, omdat Nieuws al blauw is en twee blauwe soorten in één lijst slecht te onderscheiden zijn. De benchmarkkaart op Mijn metingen is wel blauw. Gelijktrekken kan alleen door Nieuws of de benchmarkkaart een andere kleur te geven.
- **Plek van Benchmarks op de Lead-pagina.** De sectie staat direct na de Cases. Bij sommige Dossiers past onderaan beter, omdat de benchmark dan na het lezen van de cases en het nieuws komt.
- **Vierde groep "Algemeen".** Items zonder bouwsteen of zonder score staan in een vierde sectie. De klassen zijn er drie (Basis op orde, Uitbouwen, Sterk punt). De groep staat in het ontwerp. Alternatief: Zulke items onderaan zonder kop, of voorop als "Voor iedereen".
- **Knopbreedte.** `visualisatie-mijn-metingen.md` zegt dat een enkele knop zo breed is als zijn tekst, en 232px bij twee knoppen. Gewenst is dat "Bekijk dossier" even breed is als "Bekijk vergelijking". Mogelijke oplossing: Eén vaste breedte voor de knop op de kaarten Benchmark en Dossier (184px in het ontwerp) en de regel in `visualisatie-mijn-metingen.md` daarop aanpassen. De Meting-kaart houdt zijn eigen regel.
- **Koppeling aan andere Assessments.** Quickscan en Spanningsmeter hebben nog geen Dossier. Komen ze erbij, dan krijgen ze een eigen pil naast de radar.
- **Dossier per Meting of Onderdeel.** Bij een grote Organisatie met meerdere Onderdelen en Metingen is één Dossier op de Organisatie misschien te grof. Dat komt pas aan bod na gebruik.
- **Volgorde door de Consultant.** In versie 1 is de volgorde vast (nieuwste bovenaan). Handmatig ordenen is een latere vraag.
- **Branche ontbreekt.** Een Case-Organisatie zonder Sector blokkeert zichtbaar maken. Misschien is een handmatig veld Branche in de Case beter. Eerst zien hoe vaak het voorkomt.
- **Eerdere events.** Verlopen Events blijven bij de Lead staan achter een uitklapregel. Is dat te veel ruis, dan kan een Consultant ze verwijderen. Een automatische opruiming na een aantal maanden is een latere vraag.
- **Toestemming vastleggen.** De Afspraak legt vast dát er is afgesproken, niet wanneer of met wie. Een tekstveld daarvoor is niet nodig zolang contract of mail de bron blijft.
