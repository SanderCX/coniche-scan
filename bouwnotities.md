# Coniche Scan: Bouwnotities

Het archief van de bouw. Dit bestand is geen spec: Het bevat wat er per datum is gebouwd en hoe, zoals dat eerder in de specs zelf stond. Wat de app moet doen, staat in de specs; wat daarvan gebouwd is, staat in de statustabel in `CLAUDE.md`. De bouwlog van Sander (`changelog.md`) hoort bij de code.

Dit bestand is volledig overgenomen uit de specs vóór de opschoning. Verwijzingen als "scherm 2" of "punt 7" zijn de oude nummers: Scherm 1 is Kies jouw assessment, 2 de Assessment-pagina, 3 de Voorbeeld-output, 4 de Intake (met Mijn metingen en het Mijn gegevens-menu), 4a Toegang, 5 de Doorloopflow en 6 de Resultatenpagina (`schermen.md`).

## Statushistorie uit CLAUDE.md

De doorloopflow en de beheeromgeving (Organisaties, Metingen,
Ingevulde scans, die Resultaten worden, `beheerpagina.md` punt 7) zijn gebouwd, met de content van de Klantcontact
Volwassenheidsscan, de AI-volwassenheidsscan en de Zorgscan (sector-variant
van de Klantcontact Volwassenheidsscan, `content-zorgscan.md`).

- **Opslag**: Prototypefase. De data staat in de localStorage van de
  browser. Sander werkt daarnaast met een tijdelijke serveropslag (Neon),
  die vervalt. De database wordt Azure SQL Database (`backlog.md`,
  `azure-plan.md`). Zonder gedeelde opslag werkt een
  link alleen in de browser waar de data staat.
- **Inlog en rollen**: E-mail en wachtwoord voor beheer. Het inlogscherm
  heeft geen rolkeuze: De rol volgt uit het account waarmee iemand
  inlogt. De rollen Admin en Consultant aan de beheerkant en Lead en
  Respondent aan de klantkant zijn nu ingericht als testhulp
  (prototype). De definitieve rollen, rechten, 2FA en inlog volgen met de
  backend (`datamodel.md` deel 2). Admin-accounts hebben onderling
  dezelfde rechten, en meer dan een Consultant.
- **Toegang respondenten**: Via een korte persoonlijke link (10-teken
  code, cryptografisch gegenereerd, zie `datamodel.md`, Toegangscode),
  zonder verificatiecode. E-mailverificatie volgt als er een backend en
  een Coniche-mailserver zijn (`backlog.md`).
- **Bewust uitgesteld**: AI-managementsamenvatting, aggregatie over
  meerdere respondenten (`backlog.md`).
- **Export**: Als PDF (`export-pdf-visual-volwassenheidsscan.md` e.v.),
  als CSV (`export-csv.md`) en voor InDesign als XML (`export-indesign.md`)
  zijn alle drie gebouwd, vanuit dezelfde Exporteren-dropdown op de
  resultatenpagina, in het Meting-overzicht en in de lijsten onder Resultaten
  (`beheerpagina.md`, punt 5 en 7).
- **Benchmark**: Alle drie de niveaus zijn gebouwd: Tussen organisaties
  (PR 61), binnen een organisatie (een vergelijking van twee Metingen) en binnen een Meting (`benchmark.md`). Bij niveau 2 kiest
  de Admin de lezing Ontwikkeling over tijd (weergave C) of Naast elkaar
  (weergave H), gebouwd op 14 oktober 2026.
- **Verkennen**: Gebouwd op 15 oktober 2026 (`visualisatie-verkennen.md`).
  Een Admin-scherm onder Resultaten om alle Organisaties van één Assessment
  te filteren, te groeperen en te vergelijken, met vier weergaven. Nog niet
  voor de Quickscan Ziekenhuis, voor een Consultant en voor meerdere Metingen
  per Organisatie. Korte namen voor veldnamen en waarden (zoals de lange
  SBI-sectoren) houden de filterlijst en de pillen leesbaar, gebouwd op 15
  oktober 2026 (`visualisatie-verkennen.md`, Korte namen). Kenmerken
  (organisatievelden die je toevoegt en waarop je filtert en groepeert)
  beginnen leeg, zonder groepering is de hele pool de focus. Gebouwd op 15
  oktober 2026 (visual design versie 6).
- **Ronde van 19 oktober 2026** (Joost, PR 127), gebouwd: Fundament in merkgeel, het
  staafdiagram per categorie in categoriekleuren met stippellijnen, Mijn metingen
  met een spoor van 1 tot 5 en stip en lijn bij Hele meting, de Meetperiode bij
  Verkennen en bij een opgeslagen verkenning (`benchmark.md`, Welke Meting telt
  waar), het samenstellen van een benchmark met alle Metingen als keuze, en
  onderdeel I en J van `visualisatie-scores.md`: Dezelfde schakelaar op de
  samengestelde Meting, de vergelijking, de benchmark tussen organisaties, het
  perspectief van een lid en de hoofdpagina van een Meting, met Toon als
  (Gemiddeld of Naast elkaar met zes vormen) en Spreiding tussen onderdelen.
- **Radar en staafdiagram** (Joost, PR 141): De radar met
  genummerde knooppunten en de namen in een tooltip, het staafdiagram per categorie
  zonder getal boven de balk (tooltip met naam en klasse), beide naast elkaar in
  twee kaarten, de top 3 in de tint van de score en de Quickscan-rijen Sterkste en
  Meeste in de tint van de klasse (`stylesheet.md`, Radar en staafdiagram op het
  resultaatscherm).
- **KPI's per plek en kanaal** (besloten door Joost): Een KPI-waarde hoort bij de hele
  organisatie, een Onderdeel of een kanaal, en je vult alleen in wat je weet
  (`datamodel.md`, Onderdeel en KPI's en kanalen). Het Onderdeel wordt een eigen
  object (de tekst op de Meting blijft als de naam van het Onderdeel, `datamodel.md`, Onderdeel, Zo gebouwd). In het organisatie-detail staat een
  eigen blok KPI's en een modal "KPI's invullen" (`beheerpagina.md`, punt 4). De
  KPI's en kanalen zelf beheert een Admin (punt 3), en Verkennen kiest per KPI
  een kanaal (`visualisatie-verkennen.md`, KPI's als kenmerk). Het design staat
  in `Claude outputs/kpi-design/`: Zes borden als `.dc.html` met een PNG per bord.
- **Balklijst** (`stylesheet.md`, Balklijst): Elke lijst met balken heeft kolommen met een vaste breedte voor
  label, waarde en extra gegevens, balken van 8, 12 of 16px, afgerond op hele pixels met minstens 4px boven nul, en een gestapelde balk met
  getallen vanaf 24px. Een test leest de opmaak (`lib/balklijst.test.ts`).
- **Opmaakronde**: Besloten door Joost en gebouwd op 15 oktober 2026
  (`stylesheet.md`). Acht lettergroottes in even px (12, 14, 16, 18,
  24, 32, 40, 48) in plaats van zo'n 17 maten, met de paginatitel op 32px.
  Eén vorm voor keuzes: De pil en de pilvormige groep, waarin gekozen massief
  oranje is en zwart geen vulling meer. Drie niveaus van scorekleur (band, cel,
  vol), zodat een cel met een getal een zachte tint krijgt. Verschil in blauw
  en donkeroranje. Kolomkoppen en rijkoppen op één regel met een tooltip, kolommen
  van 96px, en een afstandsraster van 4px. De PDF-export valt er niet onder.
- **Kaart met cirkel op Mijn metingen** (`visualisatie-mijn-metingen.md`): Een paneel met een cirkel met de totaalscore,
  de klassenchip en bij een Lead de groep, met Jij en Groep op één spoor per
  categorie of afdeling. Voor Assessments met categorieën of afdelingen.
- **Resultaatkop, Toegang en Afspraken, korte namen in Kenmerken**: Eén Resultaatkop met de `.score-ring` voor
  het resultaatscherm van een respondent, een Meting en de voorbeeld-output (`stylesheet.md`, Resultaatkop), de Quickscan met Sterkste en Meeste als twee
  kolommen, het staafdiagram per categorie met getal van 14px, de kaarten Toegang en Afspraken op het organisatie-detail, korte namen in de kaart
  Kenmerken en in Sector en Subsector, en `Meting.onderdeel` is vervallen (de naam komt uit het Onderdeel).
- **Contactpersonen** (op verzoek van Sander):
  Bij de Kenmerken van een Organisatie legt een Admin relevante
  contactpersonen vast, met functie en LinkedIn-profiel (`datamodel.md`,
  Contactpersoon, `beheerpagina.md`, punt 4). Het zijn geen Respondenten, een
  Lead ziet ze niet en de gegevens van een contactpersoon staan niet in de
  audit-log. Alleen openbare, zakelijke gegevens zijn toegestaan, geen
  privégegevens. Vooralsnog mag alleen een Admin ze wijzigen (recht `contactpersonen.bewerken`); een Consultant ziet ze bij eigen Organisaties.
- **Dossier** (`dossier.md`): Het Dossier vervangt de lijst nieuwsartikelen die
  Sander bij de Kenmerken zette. Een Consultant (en een Admin) stelt bij een
  Organisatie een lijst Nieuws en Cases samen, koppelt items aan bouwblokken, en
  zet het Dossier en per item open voor de Lead. Op Mijn metingen van de Lead is
  het één kaart "Dossier" onder Vergelijkingen die naar de Dossierpagina gaat,
  met de radar van de bouwblokken waarop de lijst filtert. Een Case verwijst
  naar een andere Organisatie en kan alleen open als die de Afspraak "Mag als
  case gebruikt worden" heeft (standaard uit). De Lead ziet de branche en
  de omvang, nooit de naam. Afwijkingen van eerdere besluiten: Een Consultant mag
  het Dossier van eigen Organisaties wijzigen (`dossier.bewerken`), en een Lead
  ziet de items die zijn opengezet (`dossier.inzien`). Contactpersonen blijft
  zoals het was. Gebouwd: De kaart Dossier op het organisatie-detail met het
  formulier voor Nieuws en Case, de Afspraak "Mag als case gebruikt worden" in de
  kaart Afspraken, de kaart Dossier op Mijn metingen en de Dossierpagina
  `/s/[code]/dossier` met de radar in een filtermodus. Een nieuwsartikel uit de
  eerste bouw is bij het laden een Dossieritem geworden. Het Dossier staat niet
  in exports en import. Een Case zonder toestemming blijft bij de Consultant
  staan en verdwijnt bij de Lead. In het prototype bepaalt `leadDossier`
  (`lib/dossier.ts`) wat een Lead ziet, zonder naam of id van de Organisatie in
  een Case, tot dat aan de serverkant kan.
- **Spanningsmeter** (ontworpen met Joost in het Design-artifact "Spanningsmeter: home en schermen"): Een vijfde Assessment, bron het boek "Onder Spanning" (Franssen, 2026) en de opzet van Martijn van 20 oktober 2026. Zes spanningsvelden (Verhaal & leiderschap, Governance, regie & control, Mensen & gedrag, Data, Processen, Technologie) met elk vijf gescoorde vragen op een eigen schaal van 1 tot 5 met ijkpunten, een score 0 voor "Kan ik niet beoordelen" en een open voorbeeldvraag zonder score. Er is geen categorielaag en geen totaalscore: Het resultaat is een profiel van zes veldscores met de spanning tussen de velden, en bij een groep de laagste en hoogste score (`content-spanningsmeter.md`, `datamodel.md`, antwoordType `spanning`, `visualisatie-spanningsmeter.md`). De toegang is gelijk aan die van de andere scans. De bron (het PDF van Martijn) is een bron en geen voorschrift: Waar de app een algemene wijze voor Assessments heeft, geldt die. Wat Joost besloot: De plek als vijfde deel in de cirkel op scherm 1 met volgorde E2, het beeld, het icoon en de kleuren. Nog open: De punten onderaan `visualisatie-spanningsmeter.md`, de verificatie van de teksten en de validatie van de vragen.
- **Help**: Gebouwd op 19 oktober 2026 (`help.md`). Een helppagina per rol
  (Respondent, Lead, Consultant en Admin) met 27 onderwerpen (het Dossier heeft er twee) als Markdown in
  `help/`, twee films met CSS-animaties en de rij "Help" in het Accountmenu
  en in "Mijn gegevens". De inhoud is door Claude Code geschreven en wacht op
  de beoordeling van Joost. Alleen twee onderwerpen hebben een illustratie.
- **Quickscan Ziekenhuis**: Gebouwd op 14 oktober 2026
  (`content-ziekenhuis-quickscan.md`): Het eerste Assessment met
  antwoordType Ja / Nee / Weet ik niet, met doorloopflow en eigen
  resultaatscherm. De visualisaties (eigen resultaat in twee standen, gemiddelde
  en spreiding, antwoorden per vraag en benchmark tussen organisaties) zijn
  gebouwd op 15 oktober 2026 (`visualisatie-quickscan.md`). PDF, CSV, InDesign
  en import volgen later, evenals de vergelijking tussen Metingen en de
  benchmark binnen een organisatie of een Meting (`backlog.md`).

## Gebouwd-secties en Zo gebouwd-blokken uit de specs

Per blok staat het bestand waaruit het komt.

### beheerpagina.md: Zo gebouwd
    - **Zo gebouwd**:
      `components/beheer/Contactpersonen.tsx`, in `KenmerkenKaart` onder het
      raster. De regels staan in `lib/contactpersonen.ts`, de opslag in
      `lib/db/contactpersonen.ts` en de test in `lib/contactpersonen.test.ts`
      (voorheen `contacten-nieuws`). Het deel voor nieuwsartikelen is
      verhuisd naar het Dossier (`lib/dossier.ts`).

### beheerpagina.md: Zo gebouwd
  - **Zo gebouwd**: `KenmerkenKaart` (`components/beheer/KenmerkenKaart.tsx`) en de opmaak in `lib/kenmerken-weergave.ts`, met een test. De kaart staat bovenaan het organisatie-detail, daaronder de kaart KPI's en dan Metingen. Het raster volgt de volgorde van de lijst in `organisatie-velden.ts`, dus Digitalisering staat na Volume en klantbasis. Een veld dat de spec niet noemt, valt terug op zijn label en waarde. De modal gebruikt het bestaande formulier (`KenmerkenForm`) in twee kolommen, met een groep van groepen (Volume en klantbasis, Techstack, FTE) over de volle breedte. Het label voor FTE van de klantcontactmedewerkers is "Klantcontactmedewerkers, inhouse" met "140, 70% inhouse", en het aandeel BPO staat niet in de kaart (alleen in het formulier). Voor IT DevOps staat "12, 25% digital". De blokken Benchmark en Namen tonen (Admin) staan onder het blok Leads, zonder eigen kop, omdat de kop Organisatiekenmerken vervalt. Het Bewerkslot geldt al zolang het organisatie-detail open is.

### content-ziekenhuis-quickscan.md: Gebouwd (sectie)
## Gebouwd

De scoring staat in `lib/quickscan.ts` (met tests in
`lib/quickscan.test.ts`), de content in `data/ziekenhuis-quickscan-assessment.ts`, de demo-antwoorden voor de
voorbeeld-output in `data/demo-antwoorden-quickscan.ts`, de kaarten in `components/AfdelingKaarten.tsx`,
`components/JaNeeRadio.tsx` en `components/QuickscanResultaten.tsx`.

**De open punten bovenaan, zoals gebouwd**

1. Het minimum van 3 vragen voor "Relatief sterkste basis" staat als één constante (`MIN_VRAGEN_STERKSTE_BASIS`).
   "Grootste aandachtspunt" en "Relatief sterkste basis" komen alleen bij minstens twee dimensies in een afdeling en
   alleen als er één laagste respectievelijk hoogste is. Bij gelijkstand staat er geen chip.
2. Radar, top 3 en staafdiagram per categorie vervallen voor dit Assessment. In plaats daarvan staan "Sterkste afdeling" en
   "Meeste ontwikkelruimte" (alle gelijke afdelingen bij gelijkstand, geen van beide bij één afdeling of als alles gelijk is).
3. De wegingskaart toont de naam als "Afdeling · Dimensie", bijvoorbeeld "Poliklinieken · Organisatie (2×)". De factor in de
   doorloopflow en in de sidebar staat al binnen de afdeling en blijft "2×".
4. De voorgestelde teksten staan zoals in dit bestand en zijn te wijzigen in beheer: Bij het Assessment de instructieregel en
   de relevantievraag, bij een afdeling de omschrijving en het vinkje Optioneel, bij een dimensie de zin bij het grootste
   aandachtspunt (`aandachtZin`).

**Keuzes bij het bouwen**

- **Opslag.** De antwoorden staan als `"ja"`, `"nee"` of `"weet-niet"` in `ScanInvulling.antwoorden`, de relevantie per
  afdeling in `ScanInvulling.relevantie`. Een Assessment met dit type heeft `schaal: []` in de code in plaats van `null`, zodat
  bestaande schermen die de schaal doorlopen niet breken. Alle schaalfuncties negeren een antwoord dat geen getal is.
- **Toelichtingsicoon.** De dimensies hebben geen toelichting, centrale vraag of tags. Het ⓘ naast de titel van een bouwblok
  verschijnt daarom alleen als er een toelichting of centrale vraag is, bij elk Assessment.
- **Bestaande data.** Een browser of serverkopie met opgeslagen Assessments krijgt de Quickscan er één keer bij. Een Admin die
  het Assessment verwijdert, ziet het niet terugkomen (per browser onthouden).
- **Schermen die niet uitgewerkt zijn voor dit type** (besloten bij het bouwen, zie ook `backlog.md`). Het gemiddelde, de
  spreiding, de antwoorden per vraag en de benchmark tussen organisaties zijn sinds 15 oktober 2026 gebouwd
  (`visualisatie-quickscan.md`). Nog niet:
  - Een samengestelde Meting en de benchmark binnen een organisatie of een Meting (de weergaven C, E en H in percentages):
    Het Assessment staat niet in die keuzelijsten.
  - Leads-venster: De vinkjes Resultaten, Spreiding, Antwoorden en Uitnodigen werken. Exporteren is grijs met de reden.
  - Exporteren: De dropdown ontbreekt op de resultatenpagina en in het Meting-overzicht. De CSV-bulkexport slaat deze scans
    over en meldt dat.
  - De tijdelijke testknop in de doorloopflow staat niet bij dit Assessment: Een respondent vult de Quickscan zelf in.


### datamodel.md: Zo gebouwd
- **Zo gebouwd (afwijking, op daarna teruggedraaid: `Meting.onderdeel` bleef eerst staan).** `Meting.onderdeelId` is er, maar het tekstveld `Meting.onderdeel` is niet vervallen: Het is de naam van het Onderdeel als kopie, zodat een Meting zonder de Organisatie erbij te lezen is en de vele plekken die de naam tonen niet allemaal de Organisatie hoeven op te zoeken. `zorgOnderdelenKloppend` (`lib/onderdelen.ts`) houdt de twee kloppend bij elke keer laden en bij elke schrijfactie (`slaAlles`): De naam bepaalt het Onderdeel (hoofdletterongevoelig, met de spelling van het bestaande Onderdeel), een naam die nog geen Onderdeel is maakt er een aan, en "Hele organisatie" is `null`. Hernoemen (`hernoemOnderdeel`) werkt de kopie en de naam van elke Meting bij, behalve bij `labelHandmatig`. De overgang loopt bij het laden en is stabiel: Een Onderdeel dat uit bestaande data ontstaat, krijgt een id uit een hash van de Organisatie en de naam, tot het is opgeslagen.

### help.md: Zo gebouwd
  - **Zo gebouwd.** `components/help/RadarFilms.tsx` heeft de twee podia (`RadarFilmPodium`, `DossierFilmPodium`) met een kleine radar van 15 knooppunten in SVG, en `HelpFilm` heeft de namen `radar` en `dossier` (`FilmNaam`, `HELP_FILMS`). De basisstaat in `help.css` is het eindbeeld (stap 3: Mens aangewezen, of het filter weg), de animaties staan in het blok voor beweging. Een onderwerp kan meer films hebben, gescheiden door een komma in de kopgegevens (`film: wat-krijg-ik, radar`, "Je resultaten lezen"). De film "Het dossier lezen" staat bij het nieuwe onderwerp "Het dossier lezen" (voor een Lead) en onder "Wat krijg ik" op de Assessment-pagina (`CLAUDE.md`, scherm 2); het onderwerp "Het Dossier van je consultant" gaat over de kaart op Mijn metingen. Afwijking: De nummers en kleuren van de knooppunten, de scores (4 is 2,3 en Mens is 3,7) en de teksten van de voorbeelditems zijn voorbeelddata die ik heb bedacht, het ontwerp is voor mij niet leesbaar.

### help.md: Zo gebouwd
- **Zo gebouwd.** `lib/film.ts` kiest de variant (`filmVariant`: Ja / Nee / Weet ik niet is `quickscan`, zonder categorielaag is `domeinen`, anders `categorieen`) en rekent de weging uit de gewichten (`filmWeging`). `HelpFilm` krijgt daarvoor `assessment`: De landingspagina geeft het Assessment mee, Help niet en toont dus de variant met categorieën. De film staat nu bij elk Assessment, dus ook bij de Quickscan (daar vervalt de knop "Bekijk wat je krijgt" voor de knop onder de film). De ring heeft `--ring-vul` en `--ring-kleur`, de rijen van de AI-scan en de Quickscan hebben een eigen opmaak (`.film-rij--domein`, `.film-rij--afdeling`, `.film-grens`) en de balkanimaties lopen tot en met rij 8. Afwijkingen: De nummercirkel van de AI-scan heeft een getal van 12px (`--fs-12`) in plaats van 11px, omdat de letterschaal geen 11px kent. De spec geeft bij de Quickscan alleen het gemiddelde van de groep, dus het laagste en hoogste percentage (51 tot 93, 44 tot 90, 30 tot 81 en 27 tot 77) zijn voorbeelddata die ik heb bedacht. De AI-scan toont bij de stip geen lijn van laagste tot hoogste, want de spec noemt daar alleen de groepsgemiddelden, en de legenda heeft er alleen de stip. De weging van de Zorgscan staat alleen in de film zolang de bouwblokken in de opgeslagen Assessment echt een gewicht ongelijk aan 1 hebben: Staan ze er (nog) op 1, dan verschijnt de regel niet, zoals de spec zegt (`CLAUDE.md`, sectie 5, Weging).

### help.md: Gebouwd (sectie)
## Gebouwd

Gebouwd op 19 oktober 2026, op verzoek van Sander. De inhoud is door Claude Code geschreven op basis van de specs en moet door Joost worden beoordeeld.

- **Routes.** `/help` en `/help/{onderwerp}` voor een Respondent of Lead, met de persoonlijke code in de adresbalk (`/help?code=…`, zoals bij Mijn metingen). `/beheer/help` en `/beheer/help/{onderwerp}` voor een Admin of Consultant, binnen de beheeromgeving. Eén component voor beide (`components/help/HelpPagina.tsx`). Zonder code is er op `/help` alleen een korte melding met een link naar Toegang (Open punten, Help zonder menu). Zonder onderwerp in de route staat het eerste onderwerp van de rol open. Een onderwerp dat de rol niet mag zien, geeft de melding "Dit onderwerp bestaat niet" met de inhoudsopgave ernaast.
- **Menu.** De rij "Help" staat in het Accountmenu na "Mijn account" en "Instellingen" (`components/beheer/BeheerChrome.tsx`) en in "Mijn gegevens" na "Gegevens bekijken/bewerken" (`components/MijnGegevensMenu.tsx`). Op `/beheer/help` is de rij gemarkeerd.
- **Inhoud.** 28 bestanden in `help/` (op kwamen er twee bij voor het Dossier en `contactpersonen-en-nieuws` werd `contactpersonen`), met twee SVG's in `help/afbeeldingen/` (de twee uitgewerkte onderwerpen). `npm run help` (`scripts/bouw-help.ts`, Node 24 met type stripping) leest ze, controleert ze (`lib/help-bron.ts`, `controleerHelp`) en schrijft `data/help-onderwerpen.ts`. Het draait vanzelf voor `npm run dev` en `npm run build`, en `lib/help.test.ts` controleert dat het bestand bij de bronnen past. Gecontroleerd worden de kopgegevens, de groep en de rollen per groep, de bronnen, de afbeelding, de vaste koppen in de vaste volgorde, de genummerde lijst tegenover de markeringen `data-nr` in de SVG, en dat elke rol van een onderwerp alle verwijzingen onder Zie ook kan volgen. Een bron die volgens git nieuwer is dan `bijgewerkt` geeft een waarschuwing.
- **Rol en toegang.** Een beheerder krijgt zijn rol uit `Gebruiker.rol`. Een Respondent is Lead als hij de Lead-rol heeft en krijgt dan de weergaven uit zijn `LeadToegang` mee (`lib/help.ts`, `helpRolRespondent`). Een onderwerp over een Lead-weergave (`toegang`) staat er alleen bij het bijbehorende vinkje. De rol komt dus nog uit de browser, zoals de rest van het prototype. Met de backend moet dat uit de sessie komen (Rol en inhoud).
- **Pagina.** Zijbalk met zoekveld en inhoudsopgave, het artikel in de vaste opbouw en de film vóór de illustratie, onder In het kort. Een Admin ziet het label "Admin" achter de onderwerpen die een Consultant niet ziet. De badge boven de titel is "Iedereen", "Respondent en Lead", "Admin en Consultant" of de rol. Het zoeken filtert in de browser op titel en tekst, waarbij elk woord moet voorkomen.
- **Films.** `components/help/HelpFilm.tsx` en `app/styles/help.css`: Twee films met CSS-animaties, drie stapkaarten waarvan de lopende een oranje rand en een oranje nummer heeft, een pauzeknop (`aria-pressed`) en een verborgen beschrijving voor schermlezers. Bij verminderde beweging staat de film op het eindbeeld en is de pauzeknop weg. Wat krijg ik staat ook op de Assessment-landingspagina, onder de drie kaarten en boven Praktische informatie, met de knop "Bekijk de voorbeeld-output". Die knop vervangt de knop "Bekijk wat je krijgt" in de hero. Bij een scan met Ja / Nee / Weet ik niet (de Quickscan) staat de film er niet, want hij toont staven op de schaal van 1 tot 5. Daar blijft "Bekijk wat je krijgt" staan.

**Afwijkingen en invullingen waar de spec open liet**:
- De twee films hebben een eigen kop (de titel van de film) boven het label "Voorbeeld met voorbeelddata" (zonder de duur).
- Alleen "Je resultaten lezen" en "Verkennen" hebben een illustratie. De andere onderwerpen hebben `afbeelding` leeg, zoals de kopgegevens dat toestaan. Voor de rest moeten illustraties nog worden ontworpen.
- "Je score vergelijken" legt uit hoe een Respondent zijn score kan vergelijken: De klassen, de categorieën naast elkaar (staafdiagram met stippellijnen op de klassegrenzen), de radar en de top 3. Joost heeft het onderwerp goedgekeurd op 19 oktober 2026, met vier hulpmiddelen in de tekst en onder "Let op" een slotalinea over de reikwijdte: Het onderwerp gaat over de Klantcontact Volwassenheidsscan en de Zorgscan, de AI-scan toont de domeinen in een eigen overzicht, en de Quickscan werkt met percentages en de klassen Goed op orde, Gemiddeld inzicht en Ontwikkelruimte. Een eigen variant voor de AI-scan en de Quickscan is een open punt.
- Twee onderwerpen voor een Lead zijn erbij gekomen: "Antwoorden per vraag" (toegang `antwoorden`) en "Respondenten uitnodigen" (toegang `uitnodigen`), omdat een Lead die vinkjes kan hebben. Ook "KPI's invullen" is erbij gekomen (`datamodel.md`, Help).
- "Leads toegang geven" heeft alleen de rol Admin, hoewel de tabel in Rol en inhoud de groep Resultaten voor beheer aan de Consultant geeft. Het Leads-venster is Admin-only (`beheerpagina.md`, punt 6a). Het onderwerp heeft daarom het label Admin.
- Een rol die op een onderwerp niet mag, bestaat voor die rol niet: Er is geen aparte pagina "geen toegang".



### stylesheet.md: Zo gebouwd
- **Zo gebouwd**: `lijnKleur`, `tekstOpKleur` en `accentStijl` in `lib/colors.ts` zetten naast `--accent` ook `--accent-t` (tekst of lijn in de kleur) en `--accent-op` (tekst op de vulling). De sleutel `antraciet` van de categorie blijft staan omdat hij in opgeslagen data zit, alleen de hex is geel geworden.

### stylesheet.md: Zo gebouwd
- **Zo gebouwd.** De tegel is `.card.ap-tegel` en de sub-nav `.ap-subnav` (`app/styles/assessment-pagina.css`), met `AssessmentCard` en `AssessmentSubNav`. De secties hebben `scroll-margin-top: 60px`, en `scroll-behavior: smooth` staat alleen aan bij `prefers-reduced-motion: no-preference`. De pillen zijn gewone ankerlinks. Het icoon in de tegel is 48px en de punten hebben een icoon van 20px.

### stylesheet.md: Zo gebouwd
- **Zo gebouwd**: De radar (`RadarChartView`) en de twee diagrammen delen één actieve staat (`lib/grafiek-actief.ts`: `GrafiekActief`, `staatVan` en `useGrafiekActief`), die `ResultaatKaarten` (`components/ResultaatKaarten.tsx`) bewaart en aan de radar en het diagram doorgeeft. Zonder die props heeft elk diagram een eigen staat. De sleutel van een groep is de categorie, en zonder categorielaag het bouwblok zelf (`groepSleutel`). De tooltip van de radar staat niet meer in het knooppunt maar ernaast in `.radar-vlak` (`.radar-tip`, met `--boven`, `--onder` of een hoek `--lt`, `--rt`, `--lb`, `--rb`), en alle tooltips staan in de HTML, de actieve heeft `is-zichtbaar`. De drempel bij de verticale as is 90px in een tekening van 440px, omgerekend naar de 432px van de radar. De legenda onder de radar staat in de radar zelf (`.radar-legenda`, de tweede lijn alleen met een vergelijking). Het kolomdiagram is `components/DomeinKolommen.tsx` (`.dk-*` in `charts.css`) en vervangt de liggende balken van Recharts voor een Assessment zonder categorielaag. Het sorteert op nummer, en `DOMEIN_KLEUREN` en `domeinKleur` staan in `lib/colors.ts` (de sleutels `turkoois`, `framboos` en `lavendel` staan niet in de keuzelijst van een categorie, `CATEGORIE_KLEUR_KEUZES`). De kolomsleutel wordt één kolom onder 520px kaartbreedte (container query). Het kleine getal in de nummercirkels krijgt `padding-top: 0.09em`, net als de ring en de gestapelde balk. `kleineLetter` (`lib/visualisatie.ts`) houdt "AI-domeinen" in hoofdletters.

### stylesheet.md: Zo gebouwd
- **Zo gebouwd**: `components/RadarChartView.tsx` is een eigen SVG met knooppunten als knoppen (geen Recharts meer), met de tooltip in CSS (`.grafiek-tooltip`, zichtbaar bij `:hover` en `:focus`), en de categoriekleur komt uit `BouwblokResultaat.groepKleur`. `components/CategorieStaafdiagram.tsx` is het staafdiagram met één reeks (HTML en CSS, de balken zijn knoppen met `aria-label`, onder 640px horizontaal). Het staafdiagram met een tweede reeks (de vergelijking met een groep in een benchmark) houdt Recharts, met de klassenamen aan de rechterkant. Het diagram per domein (AI-scan) wordt een eigen staand kolomdiagram met sleutel, zoals bij Domeinen hierboven (zie Zo gebouwd ()). De twee kaarten staan in `ResultsView` (`.resultaat-kaarten`, `2fr 3fr`, onder 1000px onder elkaar. Het staafdiagram wordt horizontaal met een container query op de kaart (`.resultaat-kaart` is een `container`), onder 500px kaartbreedte, naast de bestaande regel onder 640px schermbreedte) en dus ook in Overzicht van een Meting. De Top 3 heeft de rijen in de tint van de score (`scoreTint`) en de Quickscan-rijen in de tint van de klasse (`SterksteMeeste`). De kaart van de radar heet "Per bouwblok", bij de AI-scan "Per domein". De radar met twee reeksen in de benchmarkviews heeft dezelfde knooppunten en tooltip, in de kaarten van die views.

### stylesheet.md: Zo gebouwd
- **Zo gebouwd**: `components/Resultaatkop.tsx` heeft twee delen, `ResultaatKop` (eyebrow, titel, subregel) en `Totaalkaart` (ring van 128px via `ScoreRing klein`, chip, uitleg, feiten en extra regels), omdat de resultatenpagina van een Meting er de schakelaar tussen zet. `ResultsView` en `QuickscanResultaten` renderen ze; op een Meting staat `ResultaatKop` op de pagina zelf ("Resultaat van de Meting", met de Meting, de Organisatie en het aantal afgeronde scans in de subregel) en `ResultsView` toont met `toonKop={false}` alleen de totaalkaart. In de voorbeeld-output staat de knop "← Terug" rechts in de kop. De banner "Dit is een voorbeeld met demo-data" is op 20 oktober 2026 vervallen, want de eyebrow "Voorbeeld-output" zegt dat al. De Classificatie heeft een kop van 18px en per klasse een stip van 10px (`.classificatie-legenda`), de grenzen als "Onder 2,5", "2,5 tot en met 3,49" en "Vanaf 3,5". De benchmarkviews houden tot 20 oktober 2026 de ring van 156px zonder Resultaatkop (voorstel hieronder, Benchmark).

### stylesheet.md: Zo gebouwd
- **Zo gebouwd.** De tokens `--balk-h-s`, `--balk-h-m`, `--balk-h-l` en `--balk-r` staan in `tokens.css`. De lijsten `.vis-rij` (240px, spoor, 208px), `.qv-rij`, `.qv-lijst-rij` (240px, spoor, 112px, 80px voor "1 vraag"), `.qv-vraag-rij` en `.mm-teaser-rij` hebben vaste kolommen, de sporen `.vis-spoor` (36px) en `.qv-spoor` (28px) zijn even. De vulling is `.balk-vul` (`max(4px, round(var(--p), 1px))`, `balkVul` in `lib/format.ts`). De gestapelde balk is `Stapel` (`components/quickscan/Stapel.tsx`) en meet zijn spoor in hele pixels, met het getal alleen in een segment van minstens 24px en een tooltip bij de rest. De controle is een test op de opmaak in plaats van een meting in de browser (`lib/balklijst.test.ts`): Die leest `app/styles/*.css` en faalt bij een kolom die de inhoud volgt of een hoogte die niet klopt.

### visualisatie-mijn-metingen.md: Zo gebouwd
- **Zo gebouwd.** De fractie van een rij is (score − 1) / 4 (`schaalFractie` in `lib/mijn-metingen.ts`). De lijn komt uit de categoriescore van elke afgeronde scan. Bij een samengestelde Meting is er geen lijn: Haar scores worden berekend uit gemiddelden van Metingen en er is geen scan om een laagste en hoogste uit te halen, dus alleen de stip. Naam en getal hebben bij een schaal in beide blokken dezelfde breedte (170 px en 3 rem).

### visualisatie-mijn-metingen.md: Gebouwd (sectie)
## Gebouwd

De pagina is `app/s/[code]/page.tsx`, de kaarten staan in
`components/mijn-metingen/MijnMetingenOnderdelen.tsx`, de rekenregels in `lib/mijn-metingen.ts` (met tests) en de opmaak in
`app/styles/mijn-metingen.css`.

**Keuzes waar de spec open liet**

- **Laatst opgeslagen.** `ScanInvulling.laatstOpgeslagenOp` is gezet bij elke wijziging van de antwoorden (`updateScanInvulling`).
  Bij data van vóór het veld ontbreekt het en vervalt de rechterhelft van de voortgangsregel. In dagen staat het tot en met 6 dagen
  geleden, vanaf 7 dagen als datum.
- **Tussenstand en eindstand.** Er is nog geen sluitingsdatum, dus "Eindstand" staat er zodra alle uitgenodigde scans van de
  Meting zijn afgerond en anders "Tussenstand". Een samengestelde Meting heeft de chip "Gemiddelde".
- **Quickscan-teaser voor een Lead.** Dezelfde regels als bij de eigen scan, met het gemiddelde van de Meting
  (`quickscanMeting`) en alleen percentages in de rijen.
- **Zonder categorieën, afdelingen en domeinen** staat alleen het totaal met de klassenpil. De AI-scan was hier de eerste uitzondering; zie AI-scan onder Kaart met cirkel voor de nieuwe vorm.
- **"Respondenten uitnodigen"** opent onder de knoppen het invoerveld voor een e-mailadres.
- **Benchmarkkaart.** Titel is `Benchmark.naam`. De regel noemt het aantal organisaties alleen bij `benchmarkMinOrganisaties`. Bij
  niveau 2 staat "Vergelijking van Metingen".
- **Smalle blokken.** Vervallen voor een kaart met een paneel, want die is altijd breed. Voor andere kaarten: In een kaart of blok smaller dan 560px staat het getal boven de rijen (container query), zodat de balken
  breed genoeg blijven naast een tweede blok.
- **Een Lead is altijd als Lead herkenbaar** (op verzoek van Sander): Naast de naam van de Organisatie in de kop staat de
  rolchip "Lead", ook als er geen Meting of vergelijking voor hem aanstaat. Zijn er geen Lead-kaarten, dan staat er een korte
  melding "Je bent Lead van <Organisatie>. Een beheerder bepaalt welke resultaten je hier ziet. Er staat nu nog niets voor je
  klaar." boven zijn eigen scans. Dit is een aanvulling op de spec, die de rolchip alleen op kaarten noemt.
- **Aantal scans achter de titel.** Bij de teaser van de hele meting staat het aantal niet als regel "Gemiddelde van n afgeronde
  scans" onder het getal, maar achter de titel ("Gemiddelde score · 6 scans"). Zo hebben het blok Jouw scan en het blok Hele
  meting dezelfde regels en staan de rijen op dezelfde hoogte (op verzoek van Sander, wijkt af van de spec).
- Nog niet: De staten "te weinig scans" en "geen Resultaten" als apart ontwerp, "Oudere metingen tonen" en de lege staat per
  sectie.



### visualisatie-quickscan.md: Zo gebouwd
- **Zo gebouwd.** `DimensieRij` in `components/quickscan/QuickscanGemiddeldeSpreiding.tsx` en `.qv-rij--spreiding` in `app/styles/visualisatie.css`: Kolommen van 280, minstens 360, 64 en 176 px met 24 px ertussen, rijen van 48 px (gemeten in de browser), spoor van 12 px, een streep van 32 px (`z-index` 1) achter de bollen (`z-index` 2), en bollen en streep die met `clamp()` binnen het spoor blijven. Bij minder dan 3 vragen staat het aantal alleen in het spreidingslabel. Op een kaart smaller dan ongeveer 1000 px scrolt de kaart horizontaal, omdat het spoor minstens 360 px krijgt. De namen van de banden boven het spoor passen pas bij een spoor van ongeveer 450 px of meer.

### visualisatie-quickscan.md: Gebouwd (sectie)
## Gebouwd

De berekeningen staan in `lib/quickscan-groep.ts` (met tests in `lib/quickscan-groep.test.ts`), de
weergaven in `components/quickscan/` en `components/QuickscanResultaten.tsx`.

**Plekken**

- 1 en 2: `QuickscanResultaten` met de schakelaar Per afdeling en Overzicht (`?weergave=overzicht`), op het resultaatscherm van de
  respondent, de voorbeeld-output en de scan in beheer. "Positie in de Meting" (weergave B op niveau 3) is er voor dit type niet.
- 3 en 4: `MetingWeergaven` op de resultatenpagina van een Meting, in beheer en voor een Lead. De schakelaar heeft Overzicht
  (het gemiddelde van de Meting in dezelfde kaarten), "Gemiddelde en spreiding" en Antwoorden. Per bouwblok vervalt. De knop
  Spreiding in het Leads-venster opent weergave 3.
- 5: De view per organisatie van een benchmark tussen organisaties (`BenchmarkOrganisatieView`), voor een Admin en een Lead. In
  de lijst van de benchmark staat per organisatie het totaal met de klasse.

**Keuzes waar de spec open liet** (de open punten hierboven, met de gebouwde waarde)

- De grenzen van het spreidingslabel staan als constante: 14 en 20 procentpunten, minstens 3 vragen en minstens 3 relevante scans
  (`QS_SPREIDING_GRENZEN`).
- Het totaal van een Meting is alle punten gedeeld door alle mogelijke punten van de relevante afdelingen, over alle scans. In de
  kaart van de Meting staat bij het totaal geen aantal punten, omdat het maximum per scan verschilt als een afdeling niet
  voor iedereen relevant is. Hetzelfde geldt voor de benchmark: Elk lid telt even zwaar met zijn totaal.
- De respondent krijgt op scherm 6 de schakelaar Per afdeling en Overzicht.
- "Onbekend bij x van y" staat vanaf 40% Weet ik niet en minstens drie respondenten (`QS_ONBEKEND_AANDEEL`, `QS_ONBEKEND_MIN`).
- De stand Per respondent bij Antwoorden is gebouwd: Cellen J, N of ? met de namen en initialen van weergave G, voor een Lead
  zonder namen R1 tot en met Rn.
- Een Admin ziet in Gemiddelde en spreiding geen naam bij een bol (geen tooltip, niet aanklikbaar).
- Het minimum en het maximum in de benchmark staan er zoals in de spec. Het risico dat één organisatie herleidbaar is, geldt
  zoals bij weergave D (`visualisatie-scores.md`, Open punten).
- Bij gelijkstand tonen de tegels "Minst vaak Ja" en "Vaakst Weet ik niet" de eerste vraag in de volgorde van het model.
- De groep voor een rij in de benchmark telt alleen de leden met een afgeronde scan. Is de groep (X inbegrepen) kleiner dan
  `benchmarkMinOrganisaties`, dan staat bij die rij "Te weinig ziekenhuizen" en geen band.

**Nog niet gebouwd**

- De weergaven C, E en H voor dit type (vergelijking tussen Metingen in percentages) en de samengestelde Meting.
- De benchmark binnen een organisatie en binnen een Meting voor dit type.
- Export van deze weergaven naar PDF, CSV en InDesign.


### visualisatie-scores.md: Gebouwd (sectie)
## Gebouwd

De berekeningen staan in `lib/visualisatie.ts` (met tests), de weergaven in
`components/visualisatie/`, de schakelaar is `WeergaveWissel`.

**Plekken**

- A en B: `MetingWeergaven` op de resultatenpagina van een Meting in beheer en voor de Lead
  (`/s/[code]/resultaten/[scanUitvoeringId]`). B op niveau 3 staat ook in de view van een scan (benchmark) en in
  "Positie in de Meting" op de resultatenpagina van één scan.
- C: De view van een benchmark binnen een organisatie (niveau 2) met de lezing Ontwikkeling over tijd bij twee Metingen.
- H: Dezelfde view met de lezing Naast elkaar bij twee Metingen (`naastElkaarUitAntwoorden`, `WeergaveNaastElkaar`). De matrix
  eronder heeft dan de kolom Hoogste. Een benchmark die van vóór de lezing is, volgt haar lezing uit de leden
  (`datamodel.md`, Benchmark, `lezing`).
- D: De view per organisatie (niveau 1) van de benchmark, ook voor een Lead.
- E: De matrix in de sectie van een benchmark op niveau 2 (kolommen met Metingen) en op niveau 1 (kolommen met organisaties,
  met het label van de Meting en het aantal scans onder de naam), alleen voor de Admin. Bij veel kolommen scrolt de matrix
  horizontaal met een vaste eerste kolom.
- G: De vierde knop "Antwoorden" in de schakelaar op de resultatenpagina van een Meting in beheer (`?weergave=antwoorden`),
  alleen voor een Admin en Consultant (`antwoordenToegestaan`), nooit voor een Lead en niet bij een samengestelde Meting
  (die heeft geen scans). `antwoordenPerVraag` (`lib/visualisatie.ts`), `WeergaveAntwoorden`.

**Afwijkingen en keuzes**

- De waarde van "Sorteer op spreiding" staat niet in de adresbalk.
- De kleuren van de stip zijn de drie klassekleuren (`--stat-red`, `--stat-amber`, `--stat-green`), zoals voorgesteld. De
  vijf scorekleuren van `stylesheet.md` zijn niet gebruikt (zie Open punten).
- De spreidingsgrenzen staan als constante (`SPREIDING_GRENZEN`, 0,55 en 0,8) en zijn nog niet instelbaar.
- Is een Lead voor een Meting een Lead met `benchmarkMinRespondenten` nog niet gehaald, dan staat de lijn van laagste tot
  hoogste score uit. Voor een Admin en een Consultant staat hij altijd aan.
- Zonder categorielaag (AI-volwassenheid) vervallen de groepslabels. Bij "Sorteer op spreiding" vervallen ze ook.
- Een Admin kan in B geen naam bij een stip zien (zie Open punten).
- G, kolomvolgorde: Alfabetisch op het laatste woord van de naam, daarna de hele naam. Een Respondent heeft één veld `naam`,
  dus "achternaam" is het laatste woord ("Jan de Vries" staat onder V).
- G, initialen: De eerste letter van het eerste en het laatste woord, of de eerste twee letters van één woord. Gelijke
  initialen krijgen een volgnummer ("JV", "JV2"). De volledige naam staat in de tooltip.
- G, een gearchiveerde vraag die niemand beantwoordde, heeft geen rij. Wie haar wel beantwoordde, ziet haar met de tekst van de
  content zoals die nu is (er is geen versiegeschiedenis van een vraagtekst).
- G, de kleur volgt de afgeronde waarde op één decimaal (2,45 wordt 2,5 en dus de kleur van 3).
- Elke Meting in de matrix telt even zwaar mee. Met twee kolommen wijkt elke cel precies 0,5 of meer af van het
  rijgemiddelde en krijgt dus een rand. De regel is zo bedoeld, maar bij twee Metingen is de markering daardoor weinig
  onderscheidend.

**Nog niet gebouwd**

- Export van deze weergaven naar PDF, CSV en InDesign.
- Meer dan twee Metingen in C en H zelf (Naast elkaar met vormen bij drie tot en met zes Metingen is er).
- Een kolom met het verschil binnen een groep per onderdeel in E (open, zie Volgorde van de kolommen).
- Een eigen drempel voor de band en de kwartielen in D.


### visualisatie-verkennen.md: Gebouwd (sectie)
## Gebouwd

De berekeningen staan in `lib/verkennen.ts` (met tests in `lib/verkennen.test.ts`), het scherm in
`app/beheer/verkennen/page.tsx` en de onderdelen in `components/verkennen/`.

**Kenmerken en Groeperen op** (vervangt de eerste versie met Sector en kanalen als standaard)

- Het scherm begint leeg. `components/verkennen/KenmerkenKaart.tsx` is de kaart Kenmerken, `FilterMenu.tsx` het menu Kenmerk
  toevoegen, `Vergelijken.tsx` Groeperen op en de focusgroep. De stand (kenmerken, gekozen waarden, groepering, drempel) staat in
  de pagina `app/beheer/verkennen/page.tsx` en wordt niet opgeslagen.
- Of een kenmerk kan groeperen staat in `kanGroeperen` (`lib/verkennen.ts`, met tests). De drempels zijn constanten met de
  startwaarden uit de spec: `MIN_POOL_GROEPEREN` (6), `MAX_WAARDEN_GROEPEREN` (12) en `MIN_INGEVULD_AANDEEL` (40%). Een getal
  kan niet groeperen als er geen twee verschillende waarden zijn.
- Het eerste bruikbare kenmerk dat de Admin toevoegt wordt de groepering. De terugval gebeurt zodra de gekozen groepering niet meer
  kan: De groepering staat dan op het eerste kenmerk dat wel kan, met de melding. Wordt de eerder gekozen groepering weer
  bruikbaar (bijvoorbeeld na "Wis filters"), dan keert de groepering daarnaar terug.
- De rest zijn de Organisaties van de andere groepen (`splitsFocus`). Wie het kenmerk niet heeft, zit in geen groep en staat als
  "n zonder waarde" onder de focusgroep.
- Zonder groepering is de hele pool de focus: Weergave 1 en 2 tonen alleen de pool met de kaarten Gemiddelde van de pool,
  Organisaties, Hoogste en Laagste bouwblok, de heatmap alleen de kolom Hele pool met de hint, en Grootste verschil is
  uitgeschakeld (met een tooltip).
- De drempel bij een getal gebruikt `VeldDefinitie.eenheid`: Alleen AHT heeft "s", bij een percentage is het "%". Groepsnamen
  zijn "≤ 420 s" en "> 420 s".
- Ingezette kanalen staat als kenmerk in het menu (groep Volume en klantbasis), alleen als filter en niet als groepering.
- Nog niet: De pil "Ander kenmerk…" boven ongeveer vijf pillen (open punt), en een filter op bereik bij getallen (Later).
- De pool-eis van 6 Organisaties betekent dat Groeperen op bij de seed (3 Organisaties met toestemming) niet kan: De pool
  verschijnt dan zonder groepering, met de reden onder Groeperen op.

**Keuzes waar de spec open liet** (de open punten hierboven, met de gebouwde waarde)

- Meerdere gekozen kanalen werken als "en", zoals in het ontwerp. Een Organisatie met een leeg veld voor een gekozen kanaal valt weg.
- De drempels zijn instellingen bij Drempels en termijnen, nu vijf (zie Drempels hieronder): Het
  formulier Verkennen, `info.verkennenInstellingen`. `verkennenWaarschuwingGroep` heet `verkennenMinVergelijking`. Het scherm
  leest ze en toont ze in zijn meldingen, ook de grens voor grijs in het menu Kenmerk toevoegen en het minimum voor het verband.
- Groeperen kan op CRM-pakket (`techstack.techstack-crm.leverancier`), sector en de AHT-drempel. De AHT-drempel begint op de
  mediaan van de gefilterde pool, afgerond.
- Filters: Sector staat er standaard en de ingezette kanalen. "Filter toevoegen" biedt elk select- of getalveld uit de
  organisatievelden dat in de pool minstens één waarde heeft. Een getalfilter is een bereik met twee schuiven (geen losse drempel).
  De chips tonen de aantallen in de hele pool, de teller "X van Y" volgt de filters.
- Een groep zonder waarde voor het groeperingsveld hoort bij geen groep, maar telt wel mee in de rest.
- Het verband (weergave 4) neemt de Organisaties na de filters, met AHT, FTR of NPS horizontaal. De lijn en r komen bij minstens
  3 Organisaties met een waarde.
- Het Assessment-keuzeveld toont geen Assessment met Ja / Nee / Weet ik niet (Later).

**Korte namen en opmaakronde**

- De korte namen staan bij de instellingen (`Instellingen.korteNamen`, server-sleutel `instellingen`), met pure functies in
  `lib/korte-namen.ts` (met tests). Voor de Secties van de SBI gelden de beginwaarden uit `sbi-indeling.md` zolang er geen
  opgeslagen korte naam is. Een lege opgeslagen korte naam betekent bewust het origineel.
- Het filtermenu (`components/verkennen/FilterMenu.tsx`) biedt elk select- of getalveld, ook als de pool er geen waarden voor heeft:
  Zo'n veld staat grijs. De grens voor grijs is 40% van de Organisaties in de pool en staat nu als constante in de code.
- Het potlood naast de kop van een filter staat bij select-velden en opent de modal met de waarden van dat veld, op volgorde van
  "in gebruik zonder korte naam" eerst.
- De groepsnaam (chip, heatmapkolom) is de korte naam van de waarde, het origineel staat in de tooltip. De kenmerken bij Verband
  gebruiken de korte naam van het veld.
- Het info-icoon bij Groeperen op is `info.verkennenGroeperen`. Groeperen kent altijd een keuze (startwaarde CRM-pakket).
- Nog niet: Het sectorfilter bij het samenstellen van een benchmark gebruikt de korte namen niet (open punt hieronder), en een
  opgeslagen korte naam voor een waarde die nergens meer voorkomt wordt niet opgeruimd in Data-integriteit.

**Ronde na PR 121**

- **Terugval, levensduur en herstel** staan in `besluitGroepering` (`lib/verkennen.ts`, met tests). Elke wijziging van kenmerken,
  filters of keuze bepaalt de groepering en de melding opnieuw (`wijzig` in `app/beheer/verkennen/page.tsx`): Een melding
  verdwijnt dus bij de volgende wijziging en komt niet terug. Is er geen pil gekozen en kan een kenmerk weer groeperen, dan wordt
  de eerste die kan gekozen, zonder melding.
- **Redenen noemen de instelling**, met het getal van de huidige waarde. Ingezette kanalen staat als uitgeschakelde pil met "Kan
  niet groeperen: Een Organisatie kan meerdere kanalen hebben", en "Geen kenmerk" staat alleen zolang er geen kenmerk is
  toegevoegd. In het menu Kenmerk toevoegen staat "alleen filteren" bij Ingezette kanalen.
- **Percentage 0** bij `verkennenMinIngevuldPct` betekent geen ondergrens (formulier, `kanGroeperen` en het grijs in het menu).
- **De drempel instellen**: De slider volgt `drempelStap` (1, 2 of 5 keer een macht van tien, ongeveer 100 standen, de uiteinden op
  een veelvoud van de stap) en Shift met de pijltjestoetsen verschuift tien stappen. Het invoerveld, de snelknoppen Mediaan en
  Gemiddelde en een klik op een staaf (bovengrens van die staaf) werken elkaar bij. Een waarde buiten het bereik wordt op de
  dichtstbijzijnde grens gezet met de regel "Dit kenmerk loopt in de pool van x tot y." Getallen hebben punten als
  duizendtalscheiding en een komma voor decimalen (`formatGetal`), ook in de groepsnamen. Mediaan en gemiddelde zijn afgerond op
  hele getallen, bij decimale waarden op één decimaal.

**Eenheid en Opslaan als benchmark**

- **Eenheid.** `bouwPool(…, eenheid)` en `kiesPoolMetingen` in `lib/verkennen.ts`: Bij Onderdelen telt per organisatie per onderdeel (de
  naam) de meest recente Meting met genoeg scans. Elk lid van de pool heeft een eigen `id` en `naam` (`PoolLid`), zodat meerdere
  onderdelen van één Organisatie los te filteren en te groeperen zijn. De kenmerken Organisatie (alleen Organisaties met meer dan
  één onderdeel) en Onderdeel (groeperen alleen binnen één Organisatie) staan in de groep "Organisatie en onderdeel" van het menu.
  Wisselen naar Organisaties laat ze vervallen, met de terugvalmelding "Organisatie en Onderdeel bestaan alleen bij Eenheid
  Onderdelen". De teksten, de teller en de redenen gebruiken het woord onderdelen, met de regel "De pool bestaat uit n onderdelen
  van m Organisaties" en de voettekst over het gelijke gewicht.
- **Open punt van Joost, mijn keuze: Samengestelde Meting.** Komt een samengestelde Meting in de pool, dan vallen haar eigen
  onderliggende Metingen eruit, zodat ze niet dubbel tellen.
- **Opslaan als benchmark** (`components/verkennen/OpslaanAlsBenchmark.tsx`): Paneel met naam (maximaal 60 tekens), de filters als
  regels, het aantal in de groep en de groene regel erna. De knop is uit zonder filter of bij een pool onder `verkennenMinPool`. De
  naam is voorgevuld bij één filter met één waarde. Opgeslagen worden de filters, de eenheid en het Assessment
  (`Benchmark.soort = "verkenning"`, `lib/verkenning-benchmark.ts`).
- **`info.verkennenEenheid`** staat niet in het register van Joost: Ik heb de regel toegevoegd (`beheerpagina.md`, punt 2a) met een
  eigen tekst, de spec noemt alleen "een Info-icoon" naast Eenheid.

**Nog niet gebouwd**: Wat onder Later staat.




## Open punten uit CLAUDE.md (oude stand)


- Spanningsmeter: Besloten door Joost: Open voorbeelden zijn alleen zichtbaar voor Leads, anoniem en pas vanaf het minimum aantal respondenten. Het Gemiddeld niveau blijft als weergave in de ring staan. Nog open: De drempelwaarden waarbij het Gemiddeld niveau op een niveau uitkomt (Joost levert een screenshot aan), de teksten van de Visie en de landingspagina die nog geverifieerd moeten worden, en de validatie van de vragen (`content-spanningsmeter.md`). Ook: Hoe de cirkel eruitziet bij meer dan vijf Assessments.

- Herontwerp van de Assessment-pagina's (scherm 1 en 2, verwerkt in tweede ronde): Nog te beslissen. (1) De drie feature-cards komen niet meer terug; besloten: De zin "Elke vraag is gebaseerd op aantoonbaar bewijs" gaat naar de sectie Praktisch. (2) Besloten: "Start assessment" blijft altijd uitgeschakeld, ook voor een herkende Respondent; toegang loopt via de persoonlijke link. (3) Of de zin en de drie punten in het detailpaneel van de cirkel beheerbaar zijn of in de code staan, en of "Concrete stappen" klopt met wat het resultaat toont (`stylesheet.md`, Vervolgstappen). (4) De tekst "Wat is goed klantcontact?" uit `visie-coniche.md` deel 1 staat in het ontwerp niet apart in de sectie Visie. (5) Welke tekst bij de Zorgscan komt. (6) De film "De radar in je resultaten" staat niet op de Assessment-pagina's, alleen Wat krijg ik en Het dossier. (7) Of de teksten van Visie, Bouwblokken, AI en 2030 beheerbaar blijven zoals in `beheerpagina.md`, punt 11.


- Aggregatie over meerdere respondenten: Het gemiddelde per Meting is
  gebouwd (`beheerpagina.md`, Organisatie-resultaten). Afwijking en
  spreiding daarbovenop zijn ontworpen en nog niet gebouwd
  (`visualisatie-scores.md`).
- Benchmark: Alle niveaus zijn gebouwd. De open punten staan onderaan
  `benchmark.md`.
- Weging: De weging is gebouwd. De gewichten van de Zorgscan (bouwblok 4, 10
  en 11 op 2) zijn besloten: De spec is leidend. De seed staat op 2. De
  opgeslagen data moeten daarop staan.
- Quickscan Ziekenhuis: De open punten staan bovenaan
  `content-ziekenhuis-quickscan.md`, met per punt wat er is gebouwd. Ze
  zijn klein (een minimum voor een chip, of de radar wegblijft, namen in de
  wegingskaart en de voorstelteksten). De scan zelf heeft rework nodig
  (`backlog.md`). De open punten van de visualisaties staan onderaan
  `visualisatie-quickscan.md`.
- Verkennen: De open punten staan onderaan `visualisatie-verkennen.md`, onder
  andere of meerdere gekozen kanalen als "en" of "of" werken, de
  startwaarden van de vijf instelbare drempels (`visualisatie-verkennen.md`,
  Drempels).
- Rol/functie bij de respondent: Vrij tekstveld of vaste lijst.
- Focus- en error-states in formulieren (zie `stylesheet.md`).


## Rondes (oude stand, vervallen)

Uit de specs verwijderd bij de opschoning. Eerder bestond de entiteit Ronde:

- beheerpagina.md, punt 5, Status: Besloten door Joost en gebouwd op 14 oktober 2026. De ronde vervalt. Wat op 13 oktober 2026 met rondes is gebouwd (rondekoppen, "Nieuwe ronde starten", "Naar ronde…", het overzicht van een ronde) is vervangen door onderdeel en meetdatum per Meting.
- Overgang: De entiteit Ronde, het veld `rondeId`, "Nieuwe ronde starten", "Naar ronde…", het hernoemen van een ronde en het overzicht van een ronde vervallen. Bestaande Metingen houden hun naam, onderdeel en samenstelling; hun meetdatum is leeg.
- datamodel.md, Overgang van de rondes: `Ronde` en `Meting.rondeId` vervallen. De Metingen houden hun `label`, onderdeel en `samenstelling`. De audit-regels `ronde.aangemaakt` en `ronde.hernoemd` blijven geldig voor wat al is gelogd.
- De rondekop in het organisatie-detail en de knop "Overzicht" daarin vervielen met de ronde. Het "Overzicht van een ronde" in visualisatie-scores.md vervalt eveneens: Voor meerdere onderdelen naast elkaar maakt de Admin een vergelijking tussen Metingen.
- export-csv.md: De kolom `ronde` van 13 oktober 2026 vervalt; de kolommen `onderdeel` (13 oktober 2026) en `meting_meetdatum` (14 oktober 2026) kwamen ervoor in de plaats.


## Overgangen van prototypedata (uit de specs)

Uit de specs gehaald omdat ze de omzetting van eerder gebouwde prototypedata beschrijven en niet het gedrag van de app.

### beheerpagina.md: Overgang (punt 6a, Leads)

**Overgang van wat op 13 oktober 2026 is gebouwd.**

- Een Lead met `leadMetingIds` krijgt Resultaten, Uitnodigen en Exporteren aan
  voor die Metingen, want dat kon hij al.
- Een Lead met `leadVoorOrganisatie` krijgt die drie aan voor alle Metingen
  die nu bestaan, en niet voor latere. De Admin krijgt op de organisatie een
  melding dat dit zo is omgezet.
- Elke `BenchmarkToewijzing` op niveau 1 of 2 wordt een aangevinkte
  benchmarkkolom voor die Lead. Een toewijzing op niveau 3 wordt Spreiding aan
  voor die Meting, zonder ring op de scan, met een melding aan de Admin.

### beheerpagina.md: Overgang (punt 7, Resultaten)

**Overgang van wat op 13 oktober 2026 is gebouwd.**

- De hoofdlink Benchmark heet Resultaten. De bestaande benchmarkschermen staan
  onder de tab Benchmarks, met het kruimelpad Resultaten › Benchmarks › {naam}.
  De oude adressen verwijzen door.
- De pagina Ingevulde scans en de tab Import vervallen. Het oude adres van
  Ingevulde scans verwijst door naar Resultaten › Metingen.
- De rondekop in het organisatie-detail en de knop "Overzicht" daarin vervallen
  met de ronde (`beheerpagina.md`, punt 5, Overgang).
- Het Scan-overzicht, de filters in de URL en de bulk-export blijven
  werken zoals nu, op de nieuwe plekken.

### datamodel.md: Overgang (Onderdeel en KPI's)

**Overgang van wat er is gebouwd.**

1. Per Organisatie wordt elke tekst in `Meting.onderdeel` die niet "Hele
   organisatie" is, een Onderdeel. Teksten die hoofdletterongevoelig en
   zonder voor- en achterspaties gelijk zijn, worden één Onderdeel, met de
   spelling die het vaakst voorkomt (bij gelijke aantallen die van de oudste
   Meting). De Metingen krijgen `onderdeelId`. "Hele organisatie" wordt `null`.
2. De KPI-velden in `Organisatie.kenmerken` worden `KpiWaarde` met
   `onderdeelId: null` en `kanaalId: null`.
3. De zes getalvelden voor contacten per kanaal worden `KpiWaarde` voor de KPI
   Contacten per jaar, met het kanaal erbij. "Niet van toepassing" wordt 0. Voor
   Verkennen en voor Ingezette kanalen is dat gelijk, want beide tellen "niet
   van toepassing" als niet ingezet. De waarde Algemeen voor Contacten per jaar
   bestond niet en blijft leeg.
4. De kanalenlijst en de startset KPI's worden aangemaakt zoals hierboven.
5. Een opgeslagen verkenning die naar `kpis.aht` of een ander KPI-veld verwijst,
   verwijst daarna naar de KPI met het kanaal Algemeen. Een filter op ingezette
   kanalen blijft werken.
6. Een CSV van de eigen export uit de tijd voor deze wijziging, met KPI's in
   `organisatie_kenmerken`, wordt bij import op dezelfde manier omgezet
   (`import-scans.md`).

### dossier.md: Overgang (Dossier)

### Overgang

Bij het laden van data van vóór deze spec worden de bestaande `nieuwsartikelen` omgezet naar Dossieritems: `soort: "nieuws"`, `titel`, `url`, `bron` en `gepubliceerdOp` blijven gelijk, `notitie` wordt `toelichting`, `zichtbaarVoorLead: false`, `bouwblokIds: []`. `dossier.zichtbaar` is `false`, `naamVoorLead` is leeg en `radarBronnen` is leeg (overal automatisch). Data met de oude veldnamen `openVoorLead` en `openSinds` wordt bij het laden omgezet naar `zichtbaar` en `zichtbaarSinds`. Geen enkel bestaand artikel wordt dus zichtbaar voor een Lead. `caseToegestaan` is `false` voor alle bestaande Organisaties. De gebeurtenissen `nieuwsartikel.*` in de audit-log blijven leesbaar.


## Bouwdetails en statusregels uit de specs (opschoning)

Per blok het bestand waaruit het komt.

### benchmark.md: Opgeslagen verkenning, bouwdetails

De leden van een verkenning worden berekend in `lib/verkenning-benchmark.ts` (`ledenVoorVerkenning`,
`materialiseerBenchmark`, met tests). Schermen lezen de benchmarks met leden via `useBenchmarksMetLeden` (`lib/use-benchmarks.ts`),
de opslag houdt de vinkjes kloppend via `getBenchmarksMetLeden` bij elke schrijfactie op de organisaties (`slaAlles`). Zo vervalt een
vinkje vanzelf als een Organisatie niet meer aan de filters voldoet.

- Een filter naar een kenmerk dat niet meer bestaat, maakt de groep leeg (voorstel uit de open punten). De detailpagina meldt dat en
  de cel van elke Lead is grijs.
- Wijzigen (`components/beheer/VerkenningBewerken.tsx`): De naam en het weghalen van waarden of filters, met minstens één filter. Nieuwe
  filters of andere waarden zet de Admin in Verkennen, daarna slaat hij een nieuwe verkenning op. De bevestiging noemt het aantal
  vinkjes dat vervalt.
- De view van een Lead bij de eenheid Onderdelen (`leadViewsOnderdelen` in `lib/benchmark.ts`): Elk eigen onderdeel met naam
  tegenover de onderdelen van andere Organisaties als anoniem gemiddelde, de drempel telt Organisaties. Bij een filter op één
  Organisatie geldt de drempel niet. De lead-pagina toont de naam en de filters van een verkenning, niet de ledenlijst.
- Nog niet: Een Consultant die opslaat, en de peildatum bij een verkenning (die is nu "vandaag").
- De Meetperiode en de regels onder Welke Meting telt waar (`lib/verkennen.ts`, `kiesPoolMetingen`), de teller per eenheid in het detail en het samenstellen met alle Metingen als keuze. Op de Meetperiode staat een Lead-reden in het Leads-venster ("Geen Meting in de Meetperiode"). De reden "Geen onderdelen met een eigen Meting" is niet gebouwd: Een samengestelde Meting voldoet alleen aan `benchmarkMinScans` als haar onderliggende Metingen dat doen, en die tellen dan zelf mee als onderdeel, dus de situatie komt niet voor.
- Het detail en het perspectief van een opgeslagen verkenning (`visualisatie-scores.md`, onderdeel I en J).

### stylesheet.md: ScoreRing

**Zo gebouwd**:
  `components/ScoreRing.tsx` (`.score-ring` in `components.css`) is de ene
  component voor Mijn metingen (`CirkelPaneel`), het resultatenscherm
  (`ScoreCircle`, ook in de voorbeeld-output en de benchmark) en de totaalkaart van
  de Quickscan. De klasse `.classificatie-cirkel` bestaat alleen nog in de PDF.
  `--fs-36` staat in `tokens.css`, `--fs-40` is niet meer in gebruik. 

### stylesheet.md: Afgevallen palet voor de domeinkleuren

Het alternatief (palet A: Lichte tinten van de merkkleuren `#7fa6d6`, `#ffa072`, `#7fc2a0`) is afgevallen omdat het te veel op de bestaande kleuren leek.

### stylesheet.md: RadarChartView met filter

 **Zo gebouwd**: `RadarChartView` heeft de prop `filter` (`RadarFilter`: `actief`, `gekozen`, `onKies`). Een actief knooppunt is `.is-filter` (gevuld), het gekozen bouwblok `.is-gekozen` (de tweede ring), de rest `.is-gedimd.is-inactief` met `aria-disabled` en de tooltip bij hover en focus. De veelhoek en de legenda-reeks verdwijnen als alle scores `null` zijn (`lib/dossier-radar.ts` geeft die scores alleen mee als de Lead `resultaten` heeft voor een Meting van de Klantcontact Volwassenheidsscan).

### stylesheet.md: CategorieStaafdiagram

- **Staafdiagram per categorie, zo gebouwd**: Zie Radar en staafdiagram op het resultaatscherm, Zo gebouwd. `CategorieStaafdiagram` heeft geen getal boven de balk en een tooltip met naam en klasse. Alleen de vergelijking met een groep houdt Recharts (`CategorieTick`, minstens 104px per categorie).

### stylesheet.md: Benchmark-views

 **Zo gebouwd**: Alle zes de views hebben `ResultaatKop` met de eyebrow "Benchmark" en `ScoreCircle` komt er niet meer in voor. De View per organisatie (`BenchmarkOrganisatieView`) heeft de subregel "{naam} tegenover de rest van de groep · {n} andere organisaties", bij een Meting "de overige Metingen" en bij een scan "de overige scans" (`TEKSTEN`). De Totaalkaart staat onder de schakelaar, in elke weergave (`OnderdelenWeergaven` heeft daarvoor `onderSchakelaar`), met als enige feit "Rest van de groep: 3,8". De sectie van de groep heeft het feit "Elke organisatie telt even zwaar mee", die van de scans van een Meting "Gemiddelde van 3 afgeronde scans" en "Elke scan telt even zwaar mee", en de Quickscan het percentage van X in de ring (de rij Totaal van de view). 

### stylesheet.md: Eyebrow bij een Meting

- **Eyebrow bij een Meting**: De gebouwde pagina toont hier "OKT 2026". Het voorstel is "Resultaat van de Meting", met de Meting in de subregel, zodat de eyebrow bij elke Resultaatkop hetzelfde soort tekst is.

### stylesheet.md: Keuzepil

Besloten door Joost en gebouwd op 15 oktober 2026 (`.pil`, `.pil-groep` en
`.weergave-wissel`). Eén vorm voor
alles wat de gebruiker kiest, ter vervanging van de rechthoekige
weergave-schakelaar met een zwarte actieve knop, de filterchips met een zwarte
vulling en de oranje omlijnde afdelingsknoppen van de Quickscan.

### stylesheet.md: Filterchip: bouwgeschiedenis

Uit het visual design van Verkennen (`visualisatie-verkennen.md`), gebouwd op
15 oktober 2026 met de oude vorm van de chips en bijgewerkt in de opmaakronde van
dezelfde dag (keuzepil, filtermenu met korte namen en de modal Korte namen). Alleen de onderdelen die nog niet in dit document staan. 

### stylesheet.md: Footer: Beheer-link

**Geen "Beheer"-link meer.** Vroeger stond die hier naast "Privacy",
maar dat gaf een zichtbare stap van de respondent/lead-kant naar
beheer, terwijl die twee kanten bewust gescheiden zijn (`datamodel.md`
deel 2, Uitgangspunten). Weggehaald uit het ene gedeelde
footer-component (`schermen.md`, Globale layout: Dezelfde footer op elk
scherm), niet alleen op respondent/lead-schermen, dat voorkomt een
uitzondering per schermtype in een component dat overal identiek moet
zijn. Beheer blijft gewoon bereikbaar: Rechtstreeks via de eigen URL,
en het inlogscherm daar is hetzelfde scherm dat ook verschijnt na
"Uitloggen" vanuit beheer zelf (`beheerpagina.md`, Accountmenu).

### datamodel.md: Meting.onderdeel vervalt

- **Besluit 19 oktober 2026: `Meting.onderdeel` vervalt.** Zo gebouwd: `onderdeelVan(organisatie, meting)` zoekt de naam via `onderdeelId` (`lib/onderdelen.ts`, `onderdeelNaamVan`), het veld staat niet meer in het type, `zorgOnderdelenKloppend` leest de oude tekst alleen nog bij het laden om de Onderdelen aan te maken en verwijdert ze daarna, en het aanmaken en wijzigen van een Meting kiest of maakt het Onderdeel met `zorgVoorOnderdeel`. Het is gebouwd als kopie van de naam van het Onderdeel, naast `Meting.onderdeelId`. De spec heeft die kopie niet nodig: De naam komt uit het Onderdeel via `onderdeelId`, en een tweede veld voor dezelfde informatie kan na een hernoeming uit de pas lopen. Op te ruimen: Het veld verdwijnt uit het type, `zorgOnderdelenKloppend` en `hernoemOnderdeel` hoeven de kopie niet meer bij te houden, en de plekken die de naam tonen zoeken het Onderdeel op via `onderdeelId`. De overgang (hieronder) leest de tekst nog één keer om de Onderdelen aan te maken. Hernoemen van een Onderdeel werkt de naam van de Metingen bij, behalve bij `labelHandmatig`, zoals nu.

### datamodel.md: Toegangscode als veld op Respondent

**Afwijking, bewust zo gebouwd**: Gebouwd als veld op `Respondent`
(`toegangscode`) in plaats van als aparte tabel zoals hierboven staat.
Geeft hetzelfde resultaat (respondent weg → code weg) zonder een tweede
structuur ernaast.

### datamodel.md: Toegangscode: link zonder database

Zolang er geen database is, werkt een link alleen in de browser waar de
data staat: Zonder gegevens in de link kan een andere browser zich niet
meer "bootstrappen" (zie CLAUDE.md, Status). 

### datamodel.md: Deel 2: status prototype

**Status: Voorstel.** De rollen Admin, Consultant, Lead en Respondent zijn
nu ingericht als testhulp (prototype). De definitieve inrichting volgt
samen met de backend en de database.

### datamodel.md: Drempel hernoemd

`verkennenWaarschuwingGroep` is hernoemd naar `verkennenMinVergelijking`: Een opgeslagen waarde onder de oude naam wordt bij het lezen overgenomen. De startwaarden zijn de norm vanuit het ontwerp. Gebouwd op 15 oktober 2026: Het percentage mag 0 zijn (geen ondergrens), dus voor het percentage geldt 0 tot en met 100.

### beheerpagina.md: Status per onderdeel (oude statusblok)

## Status

- Organisaties (lijst, aanmaken, detail), metingen per
  organisatie, respondenten uitnodigen, Ingevulde scans met filters, Import
  (beide op omgezet, zie punt 7 en 8), Assessments, Content, Gebruikersbeheer (punt 9), Drempels en termijnen (punt 10),
  Audit-log (punt 12) en Data-integriteit (punt 13). Ook gebouwd zijn de
  resultatenpagina's in beheer: De Organisatie-resultaten per Meting
  (punt 4) en de resultaten van één scan, met het kruimelpad hierboven en
  de dropdown "Exporteren". De audit-log staat nog alleen in de browser,
  tot de database er is (`azure-plan.md`).
- **Nog te bouwen**: Organisatievelden (punt 3): De editor
  `VeldDefinitieEditor` staat klaar, maar geen pagina gebruikt hem. En
  Het verwijderen van een Assessment (punt 1), gespecificeerd op 8 oktober
  2026. En Content-pagina's (punt 11), na overleg. De spec is leidend. Verder de
  hoofdlink Resultaten met de tab Metingen (punt 7) en de Benchmark (punt 14, `benchmark.md`): Het niveau tussen organisaties is
  gebouwd (PR 61). De niveaus binnen een organisatie en binnen een Meting zijn
  besproken en nog niet gebouwd.

### beheerpagina.md: DossierKaart

 Zo gebouwd: `components/beheer/DossierKaart.tsx` met het
    formulier erin, de opslag in `lib/db/dossier.ts` en de regels in
    `lib/dossier.ts`.

### beheerpagina.md: Kenmerken: volgorde en de afwijkende bouw

De gebouwde kaart moet deze volgorde volgen. Wijkt ze af
    (de schermafbeelding van zet Digitalisering tussen CRM en Conversational AI), dan wordt de code aangepast en niet de spec. 

### beheerpagina.md: Leads-venster

De tabel Leads stond als blok op de pagina van het organisatie-detail. Het
blok Leads met het Leads-venster (modal) is gebouwd op 14 oktober 2026 en
verving die tabel op de pagina.

### visualisatie-scores.md: Weergaven I en J: code en plekken

Gebouwd (`lib/visualisatie.ts`, `components/visualisatie/OnderdelenWeergaven.tsx`, `WeergaveMeerdere.tsx`, `VormTeken.tsx`). De
weergaven A en B rekenen met eenheden alsof het scans zijn (`eenhedenGemiddeld`, `eenhedenSpreiding`): Elk onderdeel of lid
is een pseudo-scan met haar gemiddelde antwoord per vraag, dus er is geen tweede rekenmethode. Naast elkaar met zes vormen
(`eenhedenNaastElkaar`, `VORMEN`, met clip-path in `visualisatie.css`) en de stapeling van gelijke scores (`stapelStappen`).

**Plekken**

- **Samengestelde Meting** (`MetingWeergaven` met `onderdelen`): De schakelaar met Overzicht, Per bouwblok, Spreiding en Antwoorden
  (uitgeschakeld, `info.antwoordenGeenScans`), "Toon als" met Gemiddeld (standaard) en Naast elkaar (`?toon=naast`), en onder het
  Overzicht een kaart per onderdeel (`OnderdelenKaarten`) met vorm, naam, meetdatum en totaalscore.
- **Vergelijking binnen een organisatie** (`MetingenVergelijkingView`): Dezelfde schakelaar met eigen stand (niet in de
  adresbalk), Naast elkaar als standaard. Bij precies twee Metingen is Naast elkaar weergave C of H naar de lezing, bij drie tot en
  met zes Metingen staan de vormen er, wat ook de eerdere beperking tot twee Metingen in C en H opheft voor Naast elkaar.
- **Benchmark tussen organisaties** (`BenchmarkGroepSectie`): De samenvatting van de groep bovenaan, daaronder de schakelaar
  Overzicht, Per bouwblok, Spreiding en Matrix. Bij een opgeslagen verkenning op één Organisatie met de eenheid Onderdelen is het
  detail weergave I, met Toon als en Antwoorden uitgeschakeld.
- **Perspectief van een lid** (`BenchmarkOrganisatieView`): Overzicht, Per bouwblok (D) en Spreiding (B met de ring op het lid, de
  overige leden zijn de vergelijkgroep: `VergelijkingsView.spreidingLeden`). De Admin ziet het perspectief van een onderdeel
  ook op `/beheer/benchmark/[id]/organisatie/[id]` (`leadViewsOnderdelen`).
- **Hoofdpagina van een Meting met scans** (`BenchmarkScanSectie`, niveau 3): Overzicht en Spreiding boven de lijst. De view van
  één scan houdt de samenvatting van de Respondent met daaronder de positie ten opzichte van de groep, zonder schakelaar.
- **Labels en getallen**: `bouwblokWoorden` geeft "bouwblok" of, bij een eigen eenheid, het woord van de Assessment, in de weergaven van de
  resultaten, de benchmark en Verkennen, en "onderdeel" als eenheid (de matrix heeft de tegels Hoogste en Laagste onderdeel, de
  kop "Per bouwblok en per onderdeel"). Scores staan overal met een decimale komma (`formatScore`, ook op het scherm van de
  respondent).

**Afwijkingen en keuzes**

### visualisatie-mijn-metingen.md: vervallen teasers

De teasers "Jouw overall score" (Volwassenheidsscan), de Quickscan-teaser, de teaser van de hele meting met de chip Tussenstand/Eindstand en de kaart "Lead en respondent" met twee blokken zijn vervangen door de Kaart met cirkel. Zie git-historie van de oude versie van de spec.

### visualisatie-mijn-metingen.md: Zo gebouwd (Kaart met cirkel)

### Zo gebouwd

`CirkelPaneel` (`components/mijn-metingen/CirkelPaneel.tsx`) en de opmaak in `app/styles/mijn-metingen.css`, met de gegevens in `lib/mijn-metingen.ts` (`Teaser.ring`, en bij de Quickscan de lijn van laagste tot hoogste percentage per afdeling).

- **Wanneer het paneel er staat.** Bij een afgeronde eigen scan, bij een Lead met Resultaten en genoeg afgeronde scans, en bij beide, voor een Assessment met categorieën of afdelingen. Een Assessment zonder categorieën, afdelingen en domeinen houdt de teaser met alleen het totaal en de klassenpil. De AI-scan krijgt het paneel met domeinrijen vanaf 22 oktober 2026 (AI-scan hierboven); tot die tijd staat hij nog op de teaser met alleen het totaal. Een Lead die ook invult maar zijn eigen scan nog niet heeft afgerond, houdt de twee blokken Jouw scan en Hele meting.
- **Lead zonder eigen scan.** Het paneel toont de groep: De cirkel is het gemiddelde van de Meting, onder de chip staat "Groep, n scans", en de rijen hebben alleen stip, lijn en de kolom Groep. Er is dan geen stip op de cirkel en geen legenda, want er is niets om mee te vergelijken. De spec beschrijft deze stand niet.
- **Onder de drempel.** Een Lead die ook invult krijgt het paneel met de eigen balken en onder de rijen de regel "Resultaten van de groep volgen bij minstens n afgeronde scans (k van n)". Een Lead zonder eigen scan houdt het blok "Resultaten volgen bij minstens n afgeronde scans" met de teller.
- **Knoppen.** De hoofdknop van de eigen scan staat in dezelfde rij als "Resultaten hele meting" en "Respondenten uitnodigen", elk 232 px bij meer dan één knop.
- **Quickscan.** Zijblok 220 px, namen van 136 px, getallen als percentage (de punten staan in de tooltip van de rij), balk en stip in de klassekleur van hun eigen percentage, schaal 0 tot 100%, chip in de celkleur van de klasse.
- **Samengestelde Meting.** Geen respons en geen lijn: Haar scores komen uit gemiddelden van Metingen. De chip "Gemiddelde" blijft staan.
- **Breedte, Lead zonder eigen scan en afdeling niet beantwoord** (Joost): Elke kaart met een paneel is op volle breedte (`mm-kaart--vol`). Zonder kolom Jij staat de groep als balk in de categoriekleur met bij meer dan één scan de lijn met eindstreepjes (`.mm-teaser-eind`), zonder stip. Een afdeling zonder beantwoorde vragen is een rij met "–" in `--ink-s` en de tooltip "Niet beantwoord" (`TeaserRij.nietBeantwoord`), met onder de rijen de uitlegregel. De ring is de gedeelde `.score-ring` (`components/ScoreRing.tsx`).
- **Tekstalternatief.** De cirkel heeft "Totaalscore 3,0, Uitbouwen" en elke rij haar tekstalternatief met, bij een Lead, de groepswaarde.

### visualisatie-verkennen.md: Statusparagrafen bovenaan

Er is een visual design (Claude Design, "Coniche Scan Verkennen") met voorbeelddata. Dat design (versie 6) toont ook het gedrag van Kenmerken en Groeperen op zoals hieronder beschreven, met een gedeeltelijke kenmerkenlijst: Sector, CRM-pakket, LLM-oplossing, Ingezette kanalen, AHT, NPS en FTR. De keuzes bij het bouwen staan onder Gebouwd. De korte namen, de pilvormige groep en de celtinten zijn gebouwd op 15 oktober 2026 (zie Gebouwd). Kenmerken en Groeperen op zijn gebouwd op 15 oktober 2026 naar versie 6 van het visual design. De vijf instelbare drempels (zie Drempels) zijn gebouwd op 15 oktober 2026. Twee wijzigingen daarop zijn voorstel van 15 oktober 2026 en nog niet gebouwd: Het percentage Kenmerk ingevuld mag 0 zijn (geen ondergrens), en de reden bij een uitgeschakelde pil noemt de instelling erachter. Wat in dit document staat als "Besloten" komt uit het gesprek van 15 oktober 2026.

Voorstel van 16 oktober 2026, ontworpen in versie 14 van het visual design: De eenheid Onderdelen (Eenheid) en Opslaan als benchmark.

### content-ziekenhuis-quickscan.md: Totaalkaart Quickscan: bouwdetails

 De totaalkaart van 19 oktober 2026 is gebouwd in `components/QuickscanResultaten.tsx`; de Resultaatkop vervangt haar en is gebouwd op 19 oktober 2026 (`components/QuickscanResultaten.tsx`, `components/Resultaatkop.tsx`).

### dossier.md: Dossier: wijzigingen en code

Vier dingen veranderen, met ontwerpen in Claude Design (Coniche Scan): (1) bij de Lead heet het Dossier niet meer "open" maar "zichtbaar", en de schakelaar "Zichtbaar voor Lead" staat in een paneel "Instellingen voor de Lead" (bord `Dossier-beheer-B`); (2) een Consultant of Admin kan het Dossier een eigen naam voor de Lead geven en per Assessment kiezen welke Meting de scores in de radar levert; (3) de verdeling naast de radar krijgt een rustiger opmaak (bord `Dossier-verdeling-origineel`); (4) het formulier van een item krijgt een schakelaar en drie even brede knoppen (bord `Dossier-item`). De rest van dit document is daarop aangepast. De gebouwde code gebruikt nog de namen `openVoorLead`, `openSinds` en `dossier.geopend`, en moet die hernoemen.

### content-2030.md: component

De sectie op de Assessment-pagina is `components/assessment/Content2030Sectie.tsx`.


### bouwstenenmodel-visual.md en ai-domeinenmodel-visual.md: samengevoegd (22 oktober 2026)

Beide specs zijn samengevoegd in `visual-bouwblokken-en-domeinen.md`. De volgende onderdelen van de eerdere versie zijn vervallen of verplaatst:

- De eerste opzet met balken, hero, 4-koloms grid, stippellijn-kader en perzikvlakken (vervallen door het herontwerp van 21 oktober 2026).
- De eerste bouwpoging met een paneel onder de grid (afwijking, vervangen door de modal).
- Bouwstatus: `components/assessment/BouwblokkenSectie.tsx` (gebouwd, vijf kolommen) en `components/assessment/AiDomeinenSectie.tsx` (gebouwd als raster van vier kolommen; de radar vervangt dat raster, nog te bouwen).
- Fout in de eerste bouwpoging van de pil: "Organisatiestrategie" liep buiten het vak.
- De modal in de doorloopflow (i-icoon) is op 22 oktober 2026 vervallen.

### beheerpagina.md: formulier Verkennen

Op 15 oktober 2026 stonden de eerste twee velden al in de app (`verkennenMinGroep` en `verkennenWaarschuwingGroep`, met `info.verkennenDrempels`), door Joost op 2 en 2 gezet om te proberen. De spec maakt er vijf van, hernoemt `verkennenWaarschuwingGroep` naar `verkennenMinVergelijking` en vervangt het Info-icoon door `info.verkennenInstellingen`. De rij `info.verkennenDrempels` vervalt.

### Hernoeming van bouwblok naar bouwsteen (22 oktober 2026)

In alle specs is "bouwblok" vervangen door "bouwsteen" (en "bouwblokken" door "bouwstenen"), ook in het datamodel en de veldnamen. De bestandsnaam `visual-bouwblokken-en-domeinen.md` is `visual-bouwstenen-en-domeinen.md` geworden. De oude naam staat in dit archief ongewijzigd, omdat hij de toestand van dat moment beschrijft.

## 22 oktober 2026: Bouwsteen in de interface

In de interface heet het overal Bouwsteen (besloten door Sander op 22 oktober 2026), ook waar de spec "Bouwblok" noemt. Eerder dezelfde dag was het label even "Bouwblok" (PR 170 en 171) en is dat teruggedraaid. De code-identifiers (`Bouwblok`, `bouwblokLabel`, `bouwblok-kop`, de CSV-kolommen en de URL-parameter `?bouwblok=`) blijven zoals ze waren. Gebouwd: `bouwblokLabel`, `bouwblokEenheidEnkelvoud` en `bouwblokEenheidMeervoud` zijn "Bouwsteen" en "bouwstenen" in de seed van Klantcontact en Zorg en bij een nieuw Assessment, en `verrijkAssessment` (`lib/assessment-migratie.ts`) zet opgeslagen waarden "Bouwblok" en "bouwblokken" om (een eigen label blijft staan). Alle zichtbare teksten zijn omgezet: De kop en de sidebar van de doorloopflow, de radar en de sectie "De 15 bouwstenen", het Dossier, de weergaven, de beheerpagina's, de films, de wegingskaart, de audit-log, de importmeldingen en de helpbestanden. `bouwblokWoorden` (`lib/visualisatie.ts`) vertaalt niet meer naar "bouwblok": De weergaven gebruiken de eenheid van de Assessment. `contentSoort` (`lib/landing.ts`) herkent Volwassenheid en Zorg aan het id of `afgeleidVanAssessmentId` en niet aan het label. De route `/bouwstenen` blijft een redirect; er komt geen `/bouwblokken` bij. De content over AI-bouwblokken in de AI-teksten (`data/ai-*`) is niet aangepast: Dat zijn bouwblokken in de zin van technische onderdelen.

## 22 oktober 2026: Letterschaal, schrijfwijze en labels

- **Letterschaal van acht maten** (12, 14, 16, 18, 24, 32, 36 en 48px, `stylesheet.md`, Lettergroottes). De tokens `--fs-11`, `--fs-13`, `--fs-15`, `--fs-17`, `--fs-26` en `--fs-40` zijn uit `tokens.css` en `--text-3xl` in `globals.css` is 36px. Omgezet: Het detailpaneel van de Assessmentcirkel (titel en tekst zonder keuze 24px met regelhoogte 28px, zin 16/26px, punten 14/20px), de regel naast "Start assessment" (14px), de centrale vraag boven de radar van de bouwblokken (18/26px), de pil in die radar (14px), de Toelichtingsmodal (16/24px) en de nummercirkel in de film van de AI-scan (12px).
- **"Basis op orde"** met een kleine letter in alle UI-teksten, tests, helpbestanden en `data/help-onderwerpen.ts` (`CLASSIFICATIE_INFO`, `lib/colors.ts`).
- **Teksten:** "Gegevens bekijken/bewerken" in het Mijn gegevens-menu, "Over deze scan: Visie en bouwblokken" en "Over deze scan: Spanningsvelden en visie", de Quickscan-weergave heet "Spreiding" (voorheen "Gemiddelde en spreiding") en de ring van de Spanningsmeter heeft het label "Gemiddeld niveau" op twee regels (`ScoreRing`: Een label langer dan 12 tekens zet elk woord op een eigen regel van 14px).
- **Route.** `/bouwstenen` blijft een redirect naar `/klantcontact-volwassenheid#bouwblokken`; er komt geen `/bouwblokken` bij.
- **Nog te doen (Joost past de specs aan):** De spreidingsgrenzen van de Quickscan (14 en 20 procentpunten, `QS_SPREIDING_GRENZEN` in `lib/quickscan-groep.ts`) blijven vaste constanten tot de instelling in `beheerpagina.md` en `datamodel.md` staat (`backlog.md`, Code volgt de spec).

## 22 oktober 2026: Namen in de opslag, Benchmark in het Dossier en Spreiding

- **Namen in de opslag.** De datamodelnamen (`bouwstenen`, `bouwsteenLabel`, `bouwsteenIds`, `opmerkingenPerBouwsteen`, `info.contentBouwsteenLabel`, `bouwsteen.gewichtGewijzigd`, de CSV-kolom `opmerkingen_per_bouwsteen`) staan in de opslag en de exports. In de code heten het nog `bouwblokken` enzovoort: `lib/opslag-namen.ts` vertaalt bij het opslaan en lezen, en oude opgeslagen data blijft leesbaar. Een volledige hernoeming in de code is niet gedaan.
- **Benchmark in het Dossier** (`dossier.md`): `Dossieritem.benchmarkId`, status "Geen toegang voor Lead" en "Kies een benchmark", per Lead zichtbaar via zijn vinkje (`LeadContext` in `leadDossier`). De keuzelijst bevat benchmarks waarin de Organisatie zit, niet niveau 3.
- **Spreiding** (`beheerpagina.md`): De vier grenzen zijn instellingen (`lib/spreiding-grenzen.ts`). `SPREIDING_GRENZEN` en `QS_SPREIDING_GRENZEN` zijn nu de startwaarden. Het formulier staat onder Drempels en termijnen. De regel "constanten blijven staan tot de spec er is" hierboven is daarmee vervallen.

