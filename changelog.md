# Coniche Scan — Changelog

## 2026-10-21 (26) — Specs van Joost, PR 160: Dossier met Events en Blogs, koppeling aan AI-domeinen, radar van de AI-domeinen

Op verzoek van Sander ("pull devops", daarna "ja bouw maar"): PR 160 (alleen specs) is gebouwd.

**Gedaan**:
- **Dossier, vier soorten** (`lib/types.ts`, `lib/dossier.ts`): `Dossieritem.soort` is nu `nieuws`, `case`, `event` of `blog`, met `datum`, `einddatum` en `plaats`. Controle per soort, `isVerlopen` en de status "Verlopen" (een Event is verlopen vanaf de dag na zijn einddatum of datum), volgorde (Events op datum, Blogs en Nieuws nieuwste eerst), `aantallPerSoort`, `LeadEvent`, `LeadBlog`, `LeadDossier` met vier lijsten, `voorproef` en `aantalTekst` ("2 cases · 2 nieuwsberichten · 2 events · 1 blog"). Een verlopen Event telt niet mee voor de Lead en niet in de bevestiging bij Open voor Lead.
- **Koppeling per Assessment**: `DOSSIER_ASSESSMENT_IDS`, `dossierBouwblokkenPerAssessment`, `dossierRadarMeting`. In het formulier staat bij "Gaat over" een pil-groep per Assessment.
- **Kaart bij de Organisatie** (`DossierKaart`): Filter Alles, Cases, Nieuws, Events en Blogs met aantallen, een formulier met vier soorten (Event: datum, einddatum, plaats; Blog: link), regel "{datum} tot {einddatum}, {plaats}", icoon, kleur en statusbadge per soort (`EventIcoon`, `BlogIcoon`, `SoortIcoon`).
- **Dossierpagina** (`app/s/[code]/dossier/page.tsx`): Pil per Assessment boven de radar, één radar per Assessment (ook de AI-domeinen), het filter in `?bouwblok=`, secties Cases, Nieuws, Events (komend eerst, "Eerdere events (n)" klapt uit) en Blogs, en een kopregel met een tegel per soort.
- **Mijn metingen**: Stippen voor Event (groen) en Blog (amber), tellerregel met alle soorten, chips en tag op 12px.
- **AI-domeinen als radar** (`components/assessment/AiDomeinenSectie.tsx`): Vervangt het raster van kaarten op de Assessment-pagina van de AI-scan (spec `ai-domeinenmodel-visual.md`), met de kaart met de centrale vraag, rijen links en rechts en de Toelichtingsmodal.
- **Film Het dossier lezen, AI-variant** (`DossierFilmPodium ai`, `MiniRadar` voor beide soorten): Op de Assessment-pagina van de AI-scan en in Help.
- **Help** (`npm run help`): "Het dossier lezen", "Het Dossier van je consultant" en "Het Dossier van een Organisatie"; de Info-tekst `info.dossier` noemt events en blogs.
- **Tests**: `lib/dossier.test.ts` uitgebreid, `lib/dossier-ai-ui.test.tsx` nieuw (radar, film, Assessments). Alle 607 tests slagen, tsc, lint en build zijn schoon.

**Specs bijgewerkt** (voorstel naar gebouwd, met "Zo gebouwd"): `dossier.md`, `datamodel.md`, `stylesheet.md` (Soortkleuren), `visualisatie-mijn-metingen.md`, `ai-domeinenmodel-visual.md`, `CLAUDE.md`, `help.md`, `beheerpagina.md` (Info-tekst).

**Afwijkingen en interpretaties**: Zie `dossier.md`, Zo gebouwd (Events, Blogs en de koppeling aan AI-domeinen). De belangrijkste: "Vandaag" is de lokale datum van de browser, de chips en de tag staan weer op 12px (de tokens `--fs-11` en `--fs-13` blijven voor andere onderdelen), de pil-groep per Assessment verschijnt alleen bij meer dan één radar, en een item zonder koppeling verschijnt alleen zonder filter. De beheerkaart (formulier voor Event en Blog) is niet in de browser bekeken, omdat daar een Admin-login voor nodig is; hij is wel door tsc, lint en tests gedekt.

## 2026-10-21 (25) — De Digitale Spanningsmeter gebouwd

Op verzoek van Sander ("Nu de Spanningsmeter bouwen", daarna "ja bouw maar"): Het hele voorstel van 21 oktober 2026 (`content-spanningsmeter.md`, `visualisatie-spanningsmeter.md`, `datamodel.md`, antwoordType `spanning`) is gebouwd als vijfde Assessment. Een tussentijdse `pull devops` haalde PR 160 (Dossier met Events en Blogs) binnen, alleen specs, niet gebouwd.

**Gedaan**:
- **Rekenen** (`lib/spanning.ts`, `lib/spanning-radar.ts`): Veldscore (een 0 telt niet mee, minder dan drie beoordeeld is "Onvoldoende zicht"), niveau, spanning ten opzichte van het laagste voorgaande veld, grootste spanning, gemiddeld niveau, groep (gemiddelde, laagste, hoogste, spreiding, meest uiteenlopend), uitsplitsing per rolgroep met `spanningMinPerRol`, en `groepZichtbaar`. Tests (`lib/spanning.test.ts`, `lib/spanning-radar.test.ts`) met het rekenvoorbeeld uit het datamodel (deelnemer en groep van 12).
- **Data en types**: `AntwoordType` `spanning`, `Bouwblok.korteNaam` en `ijkpunten`, `Vraag.invalshoek` en `aandachtspunt`, `Assessment.openVraag` en `rolgroepen`, `ScanInvulling.rolgroep`, `Instellingen.spanningMinPerRol`. `data/spanningsmeter-assessment.ts` (6 velden, 30 vragen, schaal, open vraag, rolgroepen), `data/demo-antwoorden-spanning.ts`, icoon `gauge`, veldkleuren (`lib/colors.ts`).
- **Doorloopflow**: Intake met Rolgroep (niet verplicht), sidebar met de zes velden, veldkop met Info-icoon en Toelichtingsmodal (omschrijving, ijkpunten, basis), instructievlak met de vijf ijkpunten, vraagkaarten met invalshoek, "Waar je op let" achter een Info-knop, antwoordkeuze 1 tot 5 met niveaunaam en de pil "0 · Kan ik niet beoordelen", open vraag, Vorig veld en Volgend veld.
- **Resultaat** (`components/spanning/SpanningResultaat.tsx`): Jouw profiel en Groep met schakelaar, Totaalkaart met het Gemiddeld niveau (de ring heeft nu een `label`), twee kaarten met de belangrijkste spanning, radar en tabel Score per veld die elkaar oplichten, Gemiddelde per rol en De vijf niveaus. Op de resultatenpagina van een respondent (een Lead met Resultaten kan naar Groep), de Lead-pagina van een Meting, de Rapportage in beheer en de voorbeeld-output.
- **Mijn metingen**: Teaser van dit type in de Kaart met cirkel (ring met "Niveau", rij per veld met nummer, de zin over de grootste spanning).
- **Scherm 1**: `lib/assessmentcirkel.ts` en `AssessmentCirkel` herschreven voor vijf delen van 72° (variant E2), met de band van de Spanningsmeter en een vaste plek per Assessment. Test opnieuw geschreven.
- **Scherm 2**: Secties De 6 spanningsvelden, Praktisch, Wat krijg ik en Visie (`SpanningVeldenSectie`, `SpanningVisieSectie`), de film Wat krijg ik met drie stapkaarten van 9 seconden (`SpanningFilm`), "Over deze scan: spanningsvelden en visie", de tegel op scherm 1.
- **Beheer**: Het formulier Spanningsmeter onder Drempels en termijnen (`info.spanningMinPerRol`), bij de content de open vraag en de rolgroepen (de weging is er niet), en `heeftEigenResultaat` houdt dit type uit export, benchmark, Verkennen en de samengestelde Meting. De score staat niet in de lijst met Organisaties, het Scan-overzicht en het Conflict.
- **Help** (`npm run help`): Alinea's bij "Een scan invullen", "Je resultaten lezen", "Mijn metingen", "Zo werkt de scan" en "Drempels en termijnen".
- **Tests**: `lib/spanning-ui.test.tsx` (landing, film, Mijn metingen, resultaat, doorloopflow), alle 587 tests slagen.

**Specs bijgewerkt** (voorstel naar gebouwd, met "Zo gebouwd" en de afwijkingen): `CLAUDE.md`, `content-spanningsmeter.md`, `visualisatie-spanningsmeter.md` (met de lijst afwijkingen en interpretaties voor Joost), `datamodel.md`, `stylesheet.md`, `beheerpagina.md` (twee Info-teksten), `help.md`, `backlog.md`.

**Afwijkingen en interpretaties**: Zie `visualisatie-spanningsmeter.md`, Zo gebouwd. De belangrijkste: Niveaurondje 4 heeft `--ink`, Rolgroep is niet verplicht, de voorbeelden uit de groep ontbreken (vrijgave niet besloten), de cirkel heeft 15 hoekpunten en het label staat op 200px, en het bewerken van ijkpunten en toelichtingen in beheer is nog niet gebouwd.

## 2026-10-21 (24) — SCAN weer uit de nav

Op verzoek van Sander: Het woord SCAN achter het logo (entry 23) is weer weg (`SiteHeader`, `.nav-scan`). De nav heeft weer alleen het logo, met daarachter de rolbadge in beheer. De eyebrow "Coniche Scan" boven de titel op scherm 1 en in de hero van de Quickscan blijft vervallen.

## 2026-10-21 (23) — SCAN achter het logo, geen eyebrow "Coniche Scan" meer

Op verzoek van Sander: In de nav staat achter het logo het woord SCAN (`SiteHeader`, `.nav-scan`, 14px, gewicht 800, letterafstand .14em, `--or`, onderaan uitgelijnd met het logo, een link naar dezelfde bestemming als het logo, ook in beheer vóór de rolbadge). De eyebrow "Coniche Scan" boven de titel op scherm 1 en in de hero van de Quickscan is vervallen. De spec noemt dit niet: Kleur, maat en plek zijn mijn keuze, en `CLAUDE.md` en `stylesheet.md` zijn hier nog niet op aangepast.

## 2026-10-21 (22) — Specs van Joost, PR 158: Kop en volgorde van de Assessment-pagina, paneel op scherm 1

Op verzoek van Sander gebouwd uit `CLAUDE.md` (scherm 1 en 2) en `stylesheet.md` (Assessmenttegel, Kop van de Assessment-pagina en sectie-inleiding). De Digitale Spanningsmeter uit dezelfde PR is bewust niet gebouwd (voorstel, apart te beslissen).

**Gedaan**:
- **Kop**: Bij een Assessment met content staat bovenaan alleen het icoon in een witte cirkel van 56px en de titel (48px) op één regel, links uitgelijnd. Eyebrow, zin, ankerlink, kenmerken, knop en "Bedoeld voor ..." zijn uit de kop. De Quickscan houdt zijn eigen opbouw met de hero.
- **Volgorde**: De inhoudssectie (De 15 bouwblokken of AI in klantcontact), Praktisch, Wat krijg ik en als laatste Visie (bij AI Klantcontact richting 2030). De sub-nav volgt die volgorde (`paginaSecties`). De secties wisselen af tussen wit en `--bg-warm`, de warme met een boven- en onderrand.
- **Praktisch** (`PraktischSectie`): Kop "Wat je kunt verwachten" met "Bedoeld voor ..." als inleiding, de drie kaarten (bij AI "per domein"), en daaronder de uitgeschakelde knop van 52px met het Info-icoon (22px) en de toelichting (15px).
- **Typografie**: `text-wrap: pretty` op de inleiding (hoogstens 880px) en op `.card p`, en een niet-brekende spatie na een koppelteken in een samengestelde woordgroep (`nbspNaKoppelteken`).
- **Paneel op scherm 1**: Titel 24px, zin 16px en punten 14px (regelhoogte 20px), zoals Joost het in de spec heeft vastgezet. De lege tekst staat op 24px.
- **Tests**: Aangepaste `lib/landing.test.ts` (volgorde van de secties). Bekeken in de browser: kop, sub-nav, afwisselende achtergronden en Praktisch.

- **Labels op de cirkel**: De pil om de korte naam op scherm 1 was te smal (`max-width` 150px) waardoor de naam er 9px buiten viel bij "Klantcontact Volwassenheid", "AI-Volwassenheid" en "Volwassenheid Zorg". De pil is nu zo breed als zijn langste woord (`width: min-content`), de naam staat op twee regels en valt er nooit meer buiten.

**Specs bijgewerkt**: `CLAUDE.md`, `stylesheet.md`, `help.md`.

**Keuzes en afwijkingen**: De teksten van de kaarten in Praktisch (behalve de eenheid "per domein") zijn die van de vorige pagina, de spec geeft alleen de wijzigingen. De Digitale Spanningsmeter, de vijf delen van de cirkel en het `gauge`-icoon horen bij die latere ronde.

## 2026-10-21 (21) — Specs van Joost, PR 156: Kies jouw assessment als cirkel met vier kwarten, lettermaten volgens de specs

Op verzoek van Sander gebouwd uit `CLAUDE.md` (scherm 1, ontwerp `Home-D`) en `stylesheet.md` (Assessmenttegel).

**Gedaan**:
- **Scherm 1** (`app/page.tsx`, `components/AssessmentCirkel.tsx`, `lib/assessmentcirkel.ts`): De tegels zijn vervangen door één cirkel van 568px in vier kwarten van 280px met 8px ertussen, in de volgorde van de Assessments. De linkerhelft is één radar met vijf wedges van 36° (Fundament op de scheiding), rechtsboven staan vijf wedges van 18° in de AI-kleuren, de oranje lijn met 13 hoekpunten loopt door de drie kwarten, rechtsonder staan vier bogen in de klassekleuren van de Quickscan. In het midden staat het icoon (`public/coniche-icoon.svg`) in een cirkel van 80px, op elk kwart een pil met icoon en korte naam. Hover maakt een kwart 2,5% groter, een klik schuift het kwart naar buiten met schaduw en een pulserende stip, de andere kwarten gaan naar 38%, en rechts staat het detailpaneel met titel (26px), zin (17px), drie punten (15px) en de knop "Bekijk dit assessment". Bediening met toetsenbord en schermlezer (keuzegroep, pijltoetsen), onder 768px staat het paneel onder de cirkel.
- **Opruimen**: `AssessmentCard` en de CSS van de tegel zijn verwijderd. `tegelInhoud` blijft, het paneel gebruikt het.
- **Lettermaten**: De specs van de Herontwerp-onderdelen noemen 11, 13, 15 en 17px, die ik eerder naar de maten van de letterschaal had afgerond. Ze staan nu op de maten uit de specs, met de tokens `--fs-11`, `--fs-13`, `--fs-15` en `--fs-17` (`stylesheet.md`, Lettergroottes, ter bevestiging door Joost). Het gaat om de punten en het paneel, de Toelichtingsmodal, de pillen en de centrale vraag bij de bouwblokken, de chips in het Dossier, de tag Nieuw en de voorproef op de Dossierkaart, en de nummercirkel in de film van de AI-scan.
- **Tests**: `lib/assessmentcirkel.test.ts` (9 tests). Bekeken in de browser: De cirkel, een klik, de pijltoets en het schalen onder 568px.

**Specs bijgewerkt**: `CLAUDE.md`, `stylesheet.md`, `dossier.md`, `bouwstenenmodel-visual.md`, `visualisatie-mijn-metingen.md`, `help.md`.

**Keuzes en afwijkingen**: De kop staat links op wit, zonder de verloopachtergrond van de oude pagina (de spec noemt die niet). Bij meer dan vier Assessments staan de overige niet in de cirkel (`backlog.md`). De pijltoets loopt in de volgorde van de Assessments. De pulse van de stip groeit tot 2,1 keer. De inleiding is het voorstel uit de spec. Ik kon het ontwerp niet bekijken.

## 2026-10-21 (20) — Specs van Joost, PR 153: Sub-nav onder de hoofd-nav, radar voor de 15 bouwblokken, Toelichtingsmodal

Op verzoek van Sander gebouwd uit `CLAUDE.md` (scherm 2), `stylesheet.md` (Sub-nav, Toelichtingsmodal, opbouw) en `bouwstenenmodel-visual.md` (Herontwerp: Radar met bouwblokken).

**Gedaan**:
- **Sub-nav** (`AssessmentSubNav`): De hoofd-nav blijft sticky (de prop `navNietSticky` is vervallen), de sub-nav zit eronder (`top: var(--nav-h)`, 64px) met de inhoud op de breedte van de pagina. De pillen staan in een omlijnde capsule en de actieve pil is massief oranje. De actieve sectie is de laatste die minder dan 170px onder de bovenkant van het venster begint (`actieveSectie`, getest), de scroll-marge is nav plus sub-nav. De tokens `--or-pil` en `--or-pil-tekst` zijn weer weg.
- **Radar voor de 15 bouwblokken** (`BouwblokkenSectie`): Drie kolommen (Mens en Fundament links, de radar met Proces & Tech eronder in het midden, Overkoepelend en Organisatie rechts), 15 taartpunten op 22% met ringen bij score 2 tot en met 5 en een veelhoek met voorbeeldscores, nummers op straal 226px. Hover of focus op een pil of nummer zet de taartpunt op 62% en de rest op 10%, geeft de pil een gekleurde rand en laat het nummer 1,25 keer zo groot worden. De kaart boven de radar toont de centrale vraag.
- **Toelichtingsmodal** (`components/ToelichtingModal.tsx`): De nieuwe opbouw (nummer in een cirkel, naam, categorie in hoofdletters, ronde sluitknop, centrale vraag, beschrijving) in de doorloopflow, bij de bouwblokken en bij de AI-domeinen. `toelichtingVoor` levert nummer, categorie en kleur mee.
- **Ring en chip**: Stonden al midden onder elkaar en op één regel (`.score-ring-blok`, `.score-ring-chip`), niets aangepast.
- **Gevonden onderweg**: Een hydratiefout door afgeronde percentages in de radar (server en browser rekenen de cosinus iets anders), opgelost met twee decimalen.

**Specs bijgewerkt**: `CLAUDE.md`, `stylesheet.md`, `bouwstenenmodel-visual.md`.

**Keuzes en afwijkingen**: Teksten op 14px waar de spec 13 of 15px noemt (de letterschaal kent die niet), de centrale vraag in de kaart op 16px in plaats van 17px. De schaal van de veelhoek in de radar en de voorbeeldscores zijn mijn keuze. Ik kon het ontwerp niet bekijken.

## 2026-10-21 (19) — Specs van Joost, PR 151: Herontwerp van de navigatie en de Assessment-pagina's, films over de radar

Op verzoek van Sander gebouwd uit `CLAUDE.md` (sectie 3, Globale layout, scherm 1, 2 en 5), `stylesheet.md` (Assessmenttegel en sub-nav), `help.md` (Films over de radar) en de specs van de visuals.

**Gedaan**:
- **Nav**: De vier content-links zijn weg (`MetingLinksNav` verwijderd), scheidingslijnen staan alleen nog waar aan beide kanten iets staat. Op Mijn metingen staat alleen "Mijn gegevens". De tabbladtitels van de oude pagina's zijn weg.
- **Scherm 1**: Tegels (`AssessmentCard`, `tegelInhoud` in `lib/landing.ts`) met een zin en drie punten met een lijnicoon (nieuw: `VlagIcoon`), de hele tegel klikbaar.
- **Assessment-pagina** (`app/[assessmentId]/page.tsx`): De hero, een sticky sub-nav (`AssessmentSubNav`, actieve pil uit de scrollpositie) en de secties Visie, De 15 bouwblokken, AI in klantcontact, Klantcontact richting 2030, Wat krijg ik en Praktisch (`components/assessment/`). De hoofd-nav scrolt hier weg. De Quickscan heeft geen content en houdt zijn oude opbouw. De hero-link wordt een ankerlink (`#bouwblokken`, bij de AI-scan "8 domeinen" naar `#ai`). Tokens `--or-pil` en `--or-pil-tekst`.
- **Routes**: `/visie`, `/bouwstenen`, `/ai-scan` en `/klantcontact-2030` zijn verwijderd en sturen door (`next.config.ts`), `?code=` blijft meegaan.
- **Over deze scan**: Een link naast de knoppen op de Meting-kaart (`lib/landing.ts`, `overDezeScan`), niet bij de Quickscan.
- **Films**: "Het dossier" (onder Wat krijg ik) en "De radar in je resultaten" (in "Je resultaten lezen") als CSS-animaties (`components/help/RadarFilms.tsx`), een onderwerp kan meer films hebben, en het nieuwe Help-onderwerp "Het dossier lezen". 28 onderwerpen.
- **Tests**: `lib/landing.test.ts` (7 tests: content per type, secties, "Over deze scan", tegels), aangepaste help- en radartests. Bekeken in de browser: tegels, sub-nav met actieve pil, de secties, de redirects met code, "Over deze scan", de Quickscan en beide films.

**Specs bijgewerkt**: `CLAUDE.md`, `stylesheet.md`, `help.md`, `bouwstenenmodel-visual.md`, `ai-domeinenmodel-visual.md`, `content-2030.md`, `visualisatie-mijn-metingen.md`.

**Keuzes en afwijkingen**: De drie feature-cards staan bovenaan "Wat krijg ik", want het ontwerp heeft er geen plek voor (open punt 1). "Wat is goed klantcontact?" staat onder de drie visiekaarten (open punt 4). De korte tekst op een visiekaart is de eerste alinea en op een 2030-kaart de eerste zin. De ontwerpen zelf (Design-artifact) kon ik niet bekijken: Opmaak, maten en voorbeelddata van de films volgen de tekst van de spec. De pillen onder de 2030-kaarten zijn niet klikbaar. Een Lead ziet "Over deze scan" op de kaart van de hele Meting, niet op "Jouw scan".

## 2026-10-21 (18) — Specs van Joost, PR 149: Het Dossier per Organisatie, de knopbreedte en het domeindiagram

Op verzoek van Sander gebouwd uit `dossier.md`, `visualisatie-mijn-metingen.md` (Dossierkaart, knopbreedte) en `stylesheet.md` (Domeinen, Filtermodus op de Dossierpagina).

**Gedaan**:
- **Dossier op de Organisatie** (`lib/dossier.ts`, `lib/db/dossier.ts`, `components/beheer/DossierKaart.tsx`): Een kaart onder Toegang en Afspraken en boven de KPI's, met "Open voor Lead" (bevestiging met het aantal items), het filter Alles, Cases en Nieuws, de rijen met statusbadge en het formulier voor Nieuws en Case met de chips "Gaat over bouwblokken" en "Zichtbaar voor klant". `Organisatie.dossier`, `Organisatie.caseToegestaan` en `OrganisatieLid.dossierGezienOp` staan in `lib/types.ts`.
- **Overgang**: De lijst Nieuws bij de Kenmerken is weg. Bij het laden wordt elk `nieuwsartikel` een Dossieritem van soort Nieuws, zonder dat iets open of zichtbaar is. `contacten-nieuws` heet nu `contactpersonen` (code, test, component en helponderwerp).
- **De Afspraak "Mag als case gebruikt worden"** (`components/beheer/CaseVlag.tsx`): Een derde vinkje in de kaart Afspraken, alleen een Admin, met een bevestiging bij uitzetten die de zichtbare Cases bij andere Organisaties telt. De bevestiging bij het verwijderen van een Organisatie noemt de Cases die naar haar verwijzen, en `slaAlles` maakt ze los (`ruimDossierOp`).
- **Rechten, audit, info**: `magDossierBewerken` en `magCaseVlagZetten` (`lib/rechten.ts`), `dossier.itemToegevoegd/itemGewijzigd/itemVerwijderd`, `dossier.geopend/gesloten` en `organisatie.caseVlagGewijzigd`, `info.dossier` en `info.caseVlag` (`info.nieuwsartikelen` vervalt).
- **Mijn metingen**: De sectie "Dossier, 1" met een kaart (voorproef, aantallen, tag "Nieuw") onder Vergelijkingen, en de knop "Bekijk dossier" even breed als "Bekijk vergelijking" (`.mm-knop--vast`, 184px).
- **Dossierpagina** (`app/s/[code]/dossier/page.tsx`): De kop met tegels, de kaart "Waar dit dossier over gaat" met de radar in een filtermodus (`RadarChartView` met `filter`, het gekozen bouwblok in de URL), de filterbalk, de Cases en het Nieuws. Een Lead ziet nooit de naam van de Organisatie in een Case (`leadDossier`). Scores in de radar komen alleen uit een Meting waarvoor de Lead Resultaten heeft (`lib/dossier-radar.ts`).
- **Domeindiagram**: De sleutel met namen onder de plot is weg, de namen staan in de tooltip (drie regels met een groepsreeks), de plot is hoogstens 736px breed en gecentreerd, en de legenda staat er alleen met een groepsreeks.
- **Help**: Twee onderwerpen (Het Dossier van een Organisatie, Het Dossier van je consultant), `contactpersonen` zonder nieuws, en `mijn-metingen` noemt de kaart. 27 onderwerpen.
- **Tests**: `lib/dossier.test.ts` (20 tests), de filtermodus in `lib/radar.test.tsx`, bijgewerkte `lib/contactpersonen.test.ts`. Bekeken in de browser met een Lead, een Organisatie met Sector en Afspraak en een zonder, op een lokale server zonder database.

**Specs bijgewerkt**: `dossier.md` (Zo gebouwd), `CLAUDE.md`, `datamodel.md`, `beheerpagina.md`, `stylesheet.md`, `visualisatie-mijn-metingen.md`, `help.md`, `export-csv.md`, `export-indesign.md`, `import-scans.md`, `privacy-pagina.md`.

**Afwijkingen en keuzes**: De chips, de tag "Nieuw" en de aantalregel staan op 12px (de spec noemt 11 en 13px, de letterschaal kent die niet). "Open voor Lead" en "Zichtbaar voor klant" zijn vinkjes, zoals de andere schakelaars in beheer. Wat een Lead ziet, wordt in het prototype in de browser bepaald (`leadDossier`), niet aan de serverkant. Een Case zonder Sector bij de Organisatie in de case is voor de Lead onzichtbaar. De waarschuwing "Noem de organisatie niet bij naam." staat één keer. Een lange branche staat op 24px in het oranje blok. De volledige lijst staat in `dossier.md`, Zo gebouwd.

## 2026-10-20 (17) — Specs van Joost, PR 146: De film Wat krijg ik per Assessment-type

Op verzoek van Sander gebouwd uit `help.md`, Films, Varianten van Wat krijg ik per Assessment-type, en `CLAUDE.md`, scherm 2.

**Gedaan**:
- **Varianten** (`lib/film.ts`, `components/help/HelpFilm.tsx`): De film kiest zijn variant op het type van het Assessment. Klantcontact Volwassenheid en de Zorgscan hebben vijf categorieën met ring 3,4, de AI-scan acht rijen met nummercirkel en domeinkleur en ring 2,5 (tot 37,5%), en de Quickscan vier afdelingen in klassekleur met ring 58% (Gemiddeld ontwikkeld), een vraag met Ja, Nee of Weet ik niet en de legenda "Laagste tot hoogste percentage". De stapkaarten volgen het type, stap 3 is overal dezelfde zin.
- **Weging bij de Zorgscan**: "Drie bouwblokken tellen 2× mee" onder de klassenaam en de zin "Bouwblokken die zwaarder meetellen, tonen hun factor, zoals 2×." op stapkaart 2. Het aantal en de factor komen uit de gewichten (`filmWeging`), zonder namen. Zonder gewichten ongelijk aan 1 verschijnen ze niet.
- **Landingspagina**: De film staat nu bij elk Assessment, ook bij de Quickscan, en `HelpFilm` krijgt het Assessment mee. De knop "Bekijk wat je krijgt" voor de Quickscan vervalt daarmee. In Help staat de variant met categorieën.
- **Opmaak** (`app/styles/help.css`): `--ring-vul` en `--ring-kleur` op de ring, rijen van 36px (AI-scan) en 52px (Quickscan), stippellijnen door de rijen, en balkanimaties tot en met rij 8.
- **Tests**: `lib/film.test.tsx` (10 tests), bekeken in de browser bij de AI-scan, de Quickscan en de Zorgscan.

**Afwijkingen en keuzes**: De nummercirkel heeft een getal van 12px in plaats van 11px (de letterschaal heeft geen 11px). Het laagste en hoogste percentage bij de Quickscan (51 tot 93, 44 tot 90, 30 tot 81 en 27 tot 77) heb ik bedacht, want de spec noemt alleen de gemiddelden. De AI-scan toont alleen de stip, geen lijn. In de browser waar ik testte, staan de gewichten van de Zorgscan in de opgeslagen data op 1, dus daar staat de weging-regel niet in de film: De seed heeft 2 (`CLAUDE.md`, sectie 5, Weging), de opgeslagen data moeten daarop staan.

## 2026-10-20 (16) — Specs van Joost, PR 145: AI-domeinen, hover tussen radar en diagram, Resultaatkop bij de benchmark, hero

Op verzoek van Sander gebouwd uit de specs van Joost (`stylesheet.md`, Radar en staafdiagram op het resultaatscherm, Getallen in een cirkel of balk, Resultaatkop; `CLAUDE.md`, scherm 2, 5 en 6; `visualisatie-quickscan.md`; `benchmark.md`; `datamodel.md`; `privacy-pagina.md`). Een eerdere bouw van mij met lichte tinten voor de AI-domeinen is vervangen door palet B van Joost.

**Gedaan**:
- **Contactpersonen en Nieuws alleen voor een Admin**: Nieuw recht `contactpersonen.bewerken` (`magContactpersonenBewerken` in `lib/rechten.ts`). Een Consultant ziet de lijsten zonder "+ Toevoegen" en "Bewerken". Onder het veld Notitie staat de waarschuwing "Alleen zakelijke, openbaar vindbare informatie. Geen privégegevens.", de Info-teksten zijn aangepast, de privacypagina noemt contactpersonen en het helponderwerp is bijgewerkt.
- **Domeinkleuren, palet B**: Oranje, blauw, groen, paars, geel, turkoois `#1f9aa0`, framboos `#d1467f` en lavendel `#8a7bb8` (`DOMEIN_KLEUREN` in `lib/colors.ts`), via `groepKleur` in de radar, de taartpunten en de weergaven. Tekst op geel, turkoois en lavendel is `--ink`.
- **Kolomdiagram per domein** (`components/DomeinKolommen.tsx`): Een staand diagram in de volgorde 1 tot en met 8, met twee balken per kolom (Organisatie in de domeinkleur, Rest van de groep in `#b8b5ad`), nummercirkels onder de kolommen, een sleutel met de namen in twee kolommen van vier, een legenda en een tooltip met drie regels. Het vervangt de liggende balken van Recharts.
- **Hover tussen radar en diagram** (`lib/grafiek-actief.ts`, `components/ResultaatKaarten.tsx`): Hover of focus op een knooppunt, balk of kolom laat de andere lichten oplichten (taartpunt naar 50%, score-stip op de veelhoek, ring om de balk) en dimt de rest, in 120 ms.
- **Radar**: De tooltip staat buiten de veelhoek (boven of onder het knooppunt bij de verticale as, anders in de hoek van het kwadrant), de taartpunten staan op 20%, de tweede reeks heeft een streeplijn in `--ink` en er is een legenda onder de radar. De zin onder het staafdiagram is vervallen.
- **Classificatie** staat in een kaart over de breedte van de Top 3 met de klassen links, midden en rechts (`1fr auto 1fr`).
- **Getallen in een cirkel of balk**: `padding-top: 0.09em` bij de ring, de gestapelde balk, de knooppunten en de nummercirkels.
- **Resultaatkop bij de benchmark**: Eyebrow "Benchmark" en de Totaalkaart in de View per organisatie, de sectie van de groep, de scans van een Meting, de vergelijking tussen Metingen (alleen de kop) en de Quickscan. Quickscan, Gemiddelde en spreiding heeft de Totaalkaart in plaats van twee tegels.
- **Landingspagina**: De hero (`Open-B`) op wit, met één zin uitleg, de link "15 bouwblokken in 5 pijlers" (`lib/landing.ts`), de drie kenmerken, de knop en één regel toelichting. De seedteksten van de Klantcontact- en Zorgscan zijn ingekort tot de eerste zin.
- **Schrijfwijze**: "AI" blijft in hoofdletters in "Alle AI-domeinen" (`kleineLetter` in `lib/visualisatie.ts`). De kaarten heten "Per domein" en "Scores per domein".

**Keuzes en afwijkingen**: De vergelijking tussen Metingen heeft geen Totaalkaart, want ze heeft geen eigen totaal en de spec zegt niet welke Meting de ring toont. De tweede zin van de beschrijving ("Elke vraag is gebaseerd op aantoonbaar bewijs …") staat al in de kaart "Concreet en toepasbaar", dus ik heb de kaart "Volledig beeld" niet aangepast. De seedteksten veranderen niets in opgeslagen Assessments: Bij een oude tekst haalt `heroUitleg` het stuk over de bouwblokken uit de eerste zin.

## 2026-10-20 (15) — Contactpersonen en nieuws bij de Kenmerken van een Organisatie

Op verzoek van Sander: Een Admin en een Consultant (eigen Organisaties) kunnen bij een Organisatie relevante contactpersonen toevoegen, met functie en LinkedIn-profiel, en relevante nieuwsartikelen met een link. Specs: `datamodel.md` (Contactpersoon en Nieuwsartikel, Audit, Verwijderen, rechtenmatrix), `beheerpagina.md` (punt 4, Contactpersonen en Nieuws, en twee Info-teksten in het register), `CLAUDE.md` (Status). Help: `help/contactpersonen-en-nieuws.md` (25 onderwerpen).

**Gedaan**:
- **Opslag**: `Organisatie.contactpersonen` en `Organisatie.nieuwsartikelen` (`lib/types.ts`), geladen met lege lijsten bij oudere data. De regels staan in `lib/contacten-nieuws.ts` (naam, adressen, volgorde), het opslaan in `lib/db/contacten-nieuws.ts`.
- **Scherm**: `components/beheer/ContactenNieuws.tsx`, onder het raster in de kaart Kenmerken: Twee lijsten naast elkaar, met "+ Toevoegen", "Bewerken" en in de bewerkmodal "Verwijderen" met bevestiging. Links openen in een nieuw tabblad. Het LinkedIn-profiel is een LinkedIn-logo (`components/icons/LinkedInIcoon.tsx`, 18px, grijs, oranje bij hover) achter de naam, in plaats van een tekstlink (op verzoek van Sander).
- **Audit**: `contactpersoon.toegevoegd/gewijzigd/verwijderd` en `nieuwsartikel.toegevoegd/gewijzigd/verwijderd`. Bij een contactpersoon staat nooit de naam, de functie, het adres of de notitie in de log, bij een artikel wel de titel.
- **Tests**: `lib/contacten-nieuws.test.ts` (10 tests), bekeken in de browser met een contactpersoon en een artikel, daarna weer verwijderd.

**Keuzes waar de vraag open liet**: De velden (naam, functie, LinkedIn, notitie bij een persoon; titel, link, bron, datum, notitie bij een artikel) heb ik zelf gekozen, met alleen de naam of titel en bij een artikel de link verplicht. Een LinkedIn-adres moet bij linkedin.com horen. Het recht is `organisaties.bewerken`, zoals de Kenmerken, en er is geen apart recht. Er is geen e-mailadres of telefoonnummer bij een persoon, om zo weinig mogelijk persoonsgegevens vast te leggen. Een contactpersoon verwijderen kan alleen per persoon. De CSV-export, de InDesign-export en de import nemen ze niet mee.

## 2026-10-20 (14) — Laagste en hoogste vraag in Antwoorden zijn een meter

Op verzoek van Sander: De tegels Laagste vraag en Hoogste vraag in de weergave Antwoorden tonen hun score in een ring van 64px, zoals de andere scoretegels (`visualisatie-scores.md`, Scores in een tegel zijn een meter).

## 2026-10-20 (13) — Lege regel boven en onder de vragen in Antwoorden

Op verzoek van Sander: Bij een uitgeklapt bouwblok in de weergave Antwoorden staat boven de eerste en onder de laatste vraag een lege regel ruimte (eerst 30px, op verzoek van Sander een halve regel van 15px, `.vis-antw-ruimte`, een rij zonder inhoud met `aria-hidden`). `visualisatie-scores.md`, onderdeel G, bijgewerkt. Bekeken in een Meting van Gemeente Amsterdam.

## 2026-10-20 (12) — De percentages in het Quickscan-resultaat zijn een meter

Op verzoek van Sander: In de rijen van Sterkste afdeling en Meeste ontwikkelruimte (Quickscan) staat het percentage in een kleine ring van 44px (`ScoreRing mini`) die tot dat percentage gevuld is in de klassekleur. Bij 100% past het getal in 12px in de ring. De rij houdt zijn tint. `.qs-uitgelicht-rij strong` is vervallen.

Ook het percentage in de kaart van elke afdeling (Poliklinieken "5 / 15 33%") is een ring van 44px, naast de punten. `.qs-punten` is nu een `div` met een flexrij (een ring in een `p` is ongeldige HTML) en `.qs-percentage` is vervallen.

## 2026-10-20 (11) — De duur van de film vervalt

Op verzoek van Sander: Het label boven de films (Wat krijg ik, De Meetperiode kiezen) is "Voorbeeld met voorbeelddata", zonder "· 16 seconden". `HelpFilm.tsx` en `help.md` aangepast. De duur staat nog wel in `help.md` bij de beschrijving van elke film.

## 2026-10-20 (10) — Scores in de tegels zijn een meter

Op verzoek van Sander: In de tegels boven de weergaven (zoals Per bouwblok) staan de scores nu als ring van 64px met het getal erin (`ScoreRing` met de nieuwe variant `tegel`) in plaats van als groot getal. Het gaat om de totaalscore, het hoogste en het laagste bouwblok, de hoogste en laagste Meting of organisatie en de gemiddelden in Verkennen. Aantallen, verschillen en de standaardafwijking blijven getallen, evenals de tegels met twee scores ("2,9 → 3,1" en "2,9 | 3,1"): Daar past één ring niet. `Tegels` kreeg een optioneel veld `score`. De percentages in de tegels van de Quickscan zijn niet aangepast. `visualisatie-scores.md` bijgewerkt.

## 2026-10-20 (9) — Nummers van de domeinen in Scores per Domein (AI-scan)

Op verzoek van Sander: Bij de AI-scan staat het nummer van het domein nu voor de naam in het diagram "Scores per Domein" ("1 · Strategie en governance"), zodat het aansluit op de knooppunten van de radar. `GroepResultaat.nummers` is er ook bij een platte Assessment gevuld, met het nummer van het bouwblok. Bekeken in de voorbeeld-output van de AI-scan. `stylesheet.md` bijgewerkt.

## 2026-10-20 (8) — De radar 1,2 keer zo groot

Op verzoek van Sander: De radar is 1,2 keer zo groot getoond: 372px in plaats van de 309px die in een kaart van een derde paste. Omdat zo'n kaart niet breder dan 309px kan zijn, zijn de kolommen `2fr 3fr` geworden in plaats van `1fr 2fr` (radarkaart 429px, staafdiagram 643px bij een pagina van 1160px; het staafdiagram blijft verticaal). `.radar-vlak` heeft `max-width: 372px`. `stylesheet.md` bijgewerkt.

## 2026-10-20 (7) — Radar een derde, staafdiagram twee derde

Op verzoek van Sander: De kolommen op het resultaatscherm zijn `1fr 2fr` (Per bouwblok een derde, Per categorie twee derde) in plaats van 480px en de rest, en op elk scherm vanaf 1000px. Onder 1000px staan ze onder elkaar (was 800px, want in een derde van 920px wordt de radar te klein). Bij een pagina van 1160px is de radarkaart 357px en het staafdiagram 715px, waarbij het staafdiagram verticaal blijft. `stylesheet.md` bijgewerkt.

## 2026-10-20 (6) — Legenda onder de radar weg, nummers bij de categorieën in het staafdiagram

Op verzoek van Sander: De regel met de categorieën onder de radar ("Overkoepelend · 1–2", enzovoort) is weg. De nummers van de bouwblokken staan nu bij de categorienaam in het staafdiagram: Onder de naam in de verticale vorm, achter de naam ("Proces & Tech · 7–10") in de horizontale vorm, waarvoor het label 150px breed is geworden in plaats van 120px. Daarvoor heeft `GroepResultaat` een veld `nummers`, gevuld in `alleGroepResultaten`. Het Recharts-diagram met de vergelijking (benchmark) toont de nummers ook, als tweede regel onder de naam. De radar zelf is daarmee eenvoudiger: De groepering in de component is vervallen. Test aangepast en uitgebreid (471 tests). `stylesheet.md` bijgewerkt.

## 2026-10-20 (5) — De ring in de top 3

Op verzoek van Sander: Bij Top 3 Sterktes en Top 3 Verbeterkansen staat de score nu in een kleine ring (`ScoreRing` met de nieuwe variant `mini`, 44px, getal in 14px, zonder label en chip) in plaats van als los getal. De ring vult tot (score − 1) / 4 in de volle scorekleur, zoals de grote ring. De rij houdt zijn tint. De tekstkleur `--score-tekst` van de rij en de stijl `.top3-item .score-pill` zijn vervallen. De rijen Sterkste afdeling en Meeste ontwikkelruimte van de Quickscan zijn niet aangepast: Daar staan percentages, en de vraag ging over de top 3. `stylesheet.md` bijgewerkt.

## 2026-10-20 (4) — De radar kleiner

Op verzoek van Sander: De radar (`.radar-vlak`) is maximaal 360px breed in plaats van 432px. De knooppunten blijven 26px en staan procentueel op hun plek, dus ze schalen mee in positie maar niet in grootte. `stylesheet.md` bijgewerkt.

## 2026-10-20 (3) — Radar en staafdiagram ook op een smaller scherm naast elkaar

Op verzoek van Sander: Op een scherm van rond 920px stonden de twee kaarten onder elkaar (de spec liet ze onder 1200px stapelen). Nu staan ze van 800 tot 1200px als twee gelijke kaarten naast elkaar en pas onder 800px onder elkaar. Omdat het staafdiagram met 104px per categorie niet in een kaart van 416px past, springt het om naar de horizontale vorm op basis van de breedte van zijn kaart (`@container`, onder 500px) in plaats van van het scherm. Bekeken op 700, 920 en 1400px. `stylesheet.md`, Radar en staafdiagram op het resultaatscherm, is aangepast.

## 2026-10-20 (2) — Banner "Dit is een voorbeeld" vervalt in de voorbeeld-output

Op verzoek van Sander: De banner onder de kop van de voorbeeld-output herhaalde wat de eyebrow "Voorbeeld-output" al zegt, en is weggehaald in `ResultsView` en `QuickscanResultaten`. De prop `isPreview` en de CSS-klasse `.preview-banner` zijn opgeruimd. Specs bijgewerkt: `stylesheet.md`, Resultaatkop, Zo gebouwd.

## 2026-10-20 — Iconen en link op de landingspagina van een Assessment

Op verzoek van Sander (`CLAUDE.md`, scherm 2). Grijze lijniconen (`components/icons/LandingIcons.tsx`) bij de subtitel, voor de titel van de feature-cards en bij Praktische informatie, en de zin "15 bouwblokken, verdeeld over 5 pijlers" is een link naar `/bouwstenen` (`.tekst-link`).

**Keuzes waar de vraag open liet**: Ook "Heldere inzichten" heeft een icoon, zodat de drie delen van de subtitel gelijk zijn. De iconen staan voor de titel van de kaarten (eerst in de cirkel boven de titel, op verzoek van Sander verplaatst), en de nummers vervallen. De link staat alleen in de beschrijving bovenaan ("Breng in kaart hoe volwassen … 15 bouwblokken, verdeeld over 5 pijlers …") en niet in de kaart Volledig beeld, waar dezelfde zin staat. Dat was eerst andersom gebouwd en is op verzoek van Sander omgedraaid. De icoon bij een deel van de subtitel volgt uit de tekst (minuten, inzicht, verbeterkansen of vervolgstappen), dus een Assessment met een andere subtitel krijgt alleen een icoon als het deel daarbij past.

## 2026-10-19 (9) — Specs van Joost, PR 141: de radar met knooppunten, het staafdiagram met tooltip en de top 3 in scorekleur

Op verzoek van Sander gebouwd (`stylesheet.md`, Radar en staafdiagram op het resultaatscherm en Staafdiagram per categorie; `content-ziekenhuis-quickscan.md`, Resultaten, 3; `CLAUDE.md`, scherm 6). Helpbestand: `help/resultaten-lezen.md`.

**Gedaan**:
- **Radar** (`components/RadarChartView.tsx`): Een eigen SVG met per bouwblok een genummerd knooppunt van 26px (wit, rand in de categoriekleur), taartpunten in de categoriekleur, de klassegrenzen 2,5 en 3,5 als stippellijnen en een regel met de
  categorieën en hun nummers eronder. De naam staat in de tooltip (hover, Tab en een tik), met de factor bij een gewogen bouwblok. De radar met twee reeksen in de benchmark heeft dezelfde knooppunten en toont beide scores in de tooltip.
- **Staafdiagram** (`components/CategorieStaafdiagram.tsx`): Geen getal boven de balk, een tooltip met naam, getal en klasse bij hover en toetsenbordfocus, de klassenamen in een regel eronder, geen horizontaal scrollen en onder 640px een
  horizontaal diagram. Het diagram met een vergelijking en dat per domein (AI-scan) houdt Recharts.
- **Resultaatscherm**: De radar ("Per bouwblok") en het staafdiagram ("Per categorie") staan in twee kaarten naast elkaar, op de pagina van een respondent en in Overzicht van een Meting. De top 3 heeft de rijen in de tint van de score,
  de Quickscan-rijen Sterkste en Meeste in de tint van de klasse.
- **Tests**: `lib/radar.test.tsx` (6 tests) met server-rendering van beide componenten.

**Keuzes waar de spec open liet**: `BouwblokResultaat` heeft nu `groepKleur` voor de knooppunten. De tooltip werkt met CSS (`:hover` en `:focus`) in plaats van met script, zodat hij ook met het toetsenbord opent. Het diagram met twee reeksen houdt Recharts, omdat de
spec één reeks beschrijft.

## 2026-10-19 (8) — Specs van Joost, PR 139: de Resultaatkop, Toegang en Afspraken, korte namen in Kenmerken en `Meting.onderdeel` vervalt

Op verzoek van Sander gebouwd (`stylesheet.md`, Resultaatkop; `content-ziekenhuis-quickscan.md`, Resultaten; `visualisatie-quickscan.md`, 3; `beheerpagina.md`, punt 4; `datamodel.md`, Onderdeel en Korte namen). Helpbestanden: `help/resultaten-lezen.md` en `help/mijn-metingen.md`.

**Gedaan**:
- **Resultaatkop** (`components/Resultaatkop.tsx`): `ResultaatKop` (eyebrow, titel, subregel) en `Totaalkaart` (ring van 128px, chip, uitleg en feiten) voor het resultaatscherm van een respondent, de resultatenpagina van
  een Meting (met de schakelaar ertussen) en de voorbeeld-output (met "← Terug" rechts). De Classificatie heeft een kop en alleen een gekleurde stip. De Quickscan-totaalkaart van eerder vandaag is erin opgegaan.
- **Quickscan**: Sterkste afdeling en Meeste ontwikkelruimte als twee kolommen met rijen (`SterksteMeeste`, ook onder Gemiddelde en spreiding, waar de tegels vervallen), de chips in de afdelingskaart als gewone regels met
  een stip, en de `aandachtZin` in 14px.
- **Staafdiagram per categorie**: Getal in 14px, tooltip met naam en klasse, alle namen op één regel en minstens 104px per categorie.
- **Organisatie-detail**: De kaarten Toegang (eigenaar, toegewezen Consultants met Intrekken, toewijzen in een modal, `info.organisatieToegang`) en Afspraken (Benchmark-vlag en Namen tonen) naast elkaar onder Kenmerken, de Kenmerken
  in de volgorde van de spec, en de korte namen in de kaart en in Sector en Subsector in het formulier (`ZoekSelect`: een keuzelijst met zoekveld, de korte naam per optie en het origineel in de tooltip).
- **`Meting.onderdeel` vervalt**: De naam komt uit het Onderdeel via `onderdeelId` (`onderdeelVan(organisatie, meting)`), de oude tekst wordt bij het laden nog één keer gelezen om de Onderdelen aan te maken en verdwijnt dan,
  en het aanmaken, wijzigen, importeren en samenbrengen kiest of maakt het Onderdeel met `zorgVoorOnderdeel`. De tests zijn omgezet naar `onderdeelId`. 1 nieuwe test voor de korte namen in de kaart.

**Keuzes waar de spec open liet**: Het zoekveld bij Sector en Subsector is een eigen keuzelijst (`ZoekSelect`) omdat een gewone keuzelijst de originele titel niet doorzoekbaar maakt. De ring op de benchmarkviews blijft 156px, omdat de spec de
Resultaatkop alleen voor een resultaatscherm van een scan noemt. De opgeslagen data in localStorage bevat de oude tekst tot de eerstvolgende schrijfactie.

## 2026-10-19 (7) — Specs van Joost, PR 137: de `.score-ring` voor de totaalscore op Mijn metingen en de resultaten

Op verzoek van Sander gebouwd (`stylesheet.md`, Resultaten; `content-ziekenhuis-quickscan.md`, Resultaten; `visualisatie-mijn-metingen.md`, Kaart met cirkel). Helpbestanden: Geen aanpassing.

**Gedaan**:
- **Eén ring** (`components/ScoreRing.tsx`, `.score-ring`): Dezelfde ring op Mijn metingen, het resultatenscherm van een scan met een schaal (`ScoreCircle`, ook in de voorbeeld-output en de benchmark) en de totaalkaart
  van de Quickscan. De oude classificatiecirkel is uit de interface verdwenen (de PDF houdt de zijne). `--fs-36` is toegevoegd.
- **Quickscan-totaalkaart**: De nieuwe opbouw met de klasse in 18px, "{punten} van {maximum} punten", "{x} van 4 afdelingen beoordeeld" en de ring met chip. De zin over een afdeling die niet meetelt luidt nu "Vragen over
  {afdeling} zijn niet beantwoord. De afdeling telt niet mee in het totaal."
- **Mijn metingen**: Een kaart met een paneel is altijd op volle breedte, een Lead zonder eigen scan krijgt de groep als balk met lijn en eindstreepjes, en een niet-beantwoorde Quickscan-afdeling blijft als rij staan met "–" en
  een uitlegregel. 1 nieuwe test.

**Keuzes waar de spec open liet**: Het getal in de ring is `--fs-36`, het oude `--text-3xl` van Tailwind (40px) blijft staan omdat niets het gebruikt.

## 2026-10-19 (6) — Specs van Joost, PR 134: KPI-kolomkop, Quickscan-ruimte, de ring in de film en de Kaart met cirkel

Op verzoek van Sander gebouwd (`beheerpagina.md`, punt 4, KPI's; `visualisatie-quickscan.md`, 3, Ruimte en lagen; `visualisatie-mijn-metingen.md`, Kaart met cirkel; `help.md`, Films). Helpbestanden: Geen, want de film
zelf is aangepast en de onderwerpen veranderen niet.

**Gedaan**:
- **KPI-kolomkop**: Vaste kolommen van 96px (eerste 240px), de naam op één regel met een afkapping en "n van m" eronder, de kop van een Onderdeel als knop die de modal opent (het potlood vervalt), de eenheid achter
  de naam ("AHT (s)") en rijen van 48px. Gemeten in de browser.
- **Quickscan, Gemiddelde en spreiding**: Vier vaste kolommen (280, minstens 360, 64 en 176px), rijen van 48px, de streep van 32px achter de bollen en bollen en streep die binnen het spoor blijven. Getest met
  synthetische scans op een tijdelijke pagina, die weer is verwijderd.
- **Film Wat krijg ik**: De cirkel is een ring met de volle kleur van de afgeronde score (3,4 rondt af op 3, geel), gevuld tot 60%.
- **Kaart met cirkel op Mijn metingen** (`CirkelPaneel`): Voor een Respondent, een Lead en een Lead die ook invult, met de cirkel, de klassenchip, de groep als stip op de cirkel, Jij en Groep op één spoor, de legenda,
  de respons met datum en de lage-drempelstand. De Quickscan heeft dezelfde kaart in percentages, met nu ook een lijn van laagste tot hoogste percentage per afdeling in de teaser van de hele Meting. De chip
  Tussenstand of Eindstand vervalt in deze kaart. 3 nieuwe tests in `lib/mijn-metingen.test.ts`.

**Keuzes waar de spec open liet**: Een Lead zonder eigen scan krijgt het paneel met de groep als hoofdcirkel (zonder stip en legenda). Een Lead die invult maar nog niet is afgerond, en een Assessment zonder categorieën, houden de
oude kaart. Het tooltipwoord bij een Onderdeel is "Klik om te bewerken" in plaats van "wijzigen". De Kaart met cirkel is een voorstel van Joost dat nog niet formeel is besloten: Het is gebouwd op verzoek van Sander.

## 2026-10-19 (5) — Specs van Joost, PR 133: kaart Kenmerken en de regel Bewerken

Op verzoek van Sander gebouwd (`beheerpagina.md`, punt 4, Kenmerken; `stylesheet.md`, Bewerken: op de plek of in een modal; `help.md`). Helpbestand: `help/score-vergelijken.md`.

**Gedaan**:
- **Kaart Kenmerken** (`components/beheer/KenmerkenKaart.tsx`, `lib/kenmerken-weergave.ts`): Bovenaan het organisatie-detail een raster van vier kolommen met label en waarde,
  met de opmaak uit de spec ("410.000, 15 / 85%", "31% / 60%", "Pakket 1, extern ondersteund"), zonder lege velden en met "Er zijn nog geen kenmerken ingevuld.". "Bewerken" opent een
  modal met het bestaande formulier in twee kolommen. De volgorde van het detail is nu Kenmerken, KPI's, Metingen, Respondenten en Leads. Het formulier onderaan en het kopje Organisatiekenmerken
  zijn vervallen.
- **Regel Bewerken**: De naam van een Organisatie (naam en korte naam), en een Meting (onderdeel, meetdatum en naam) staan niet meer in een formulier op de pagina maar in een modal.
  Knoppen, potloden en titels die "Wijzigen" heetten, heten "Bewerken" (Onderdeel, Meting, samenstelling, benchmark, verkenning en weging).
- **Help**: Een slotalinea over de reikwijdte in `help/score-vergelijken.md` en "bewerken" in plaats van "wijzigen" in `help/verder-waar-je-was.md`.
- 5 nieuwe tests (`lib/kenmerken-weergave.test.ts`).

**Keuzes waar de spec open liet**: Het raster volgt de lijst met organisatievelden, dus Digitalisering staat na Volume en klantbasis en de Sector is de volledige SBI-naam. Het aandeel BPO staat niet in de
kaart. Een groep van groepen (Volume en klantbasis, Techstack, FTE) staat in de modal over de volle breedte. "Gegevens bekijken/wijzigen" in "Mijn gegevens" houdt zijn naam, omdat die in `CLAUDE.md` staat.

## 2026-10-19 (4) — De helppagina en de laatste punten van de KPI-definities

Op verzoek van Sander gebouwd (`help.md`; `beheerpagina.md`, punt 3, KPI's en kanalen). Helpbestanden: Alle 24 bestanden in `help/` zijn nieuw. De specs van Joost hadden
voor de KPI-definities drie punten die niet in het design stonden (hernoemen, verwijderen en volgorde), die ik heb ingevuld.

**Gedaan**:
- **Help** (`help.md`): De pagina `/help` (Respondent en Lead, met `?code=`) en `/beheer/help` (Admin en Consultant), met zijbalk, zoekveld, inhoudsopgave per groep en
  het artikel in de vaste opbouw. De rij "Help" staat in het Accountmenu en in "Mijn gegevens". Wat een rol ziet volgt uit `HELP_GROEPEN` en `rollen` en, voor een Lead,
  uit zijn vinkjes (`lib/help.ts`).
- **Inhoud en controle**: 24 onderwerpen in `help/*.md` met kopgegevens, twee SVG's, `scripts/bouw-help.ts` (draait voor `dev` en `build`, schrijft
  `data/help-onderwerpen.ts`) en `controleerHelp` in `lib/help-bron.ts`. `lib/help.test.ts` bewaakt de bronnen, de rollen en de schrijfregels (geen gedachtestreepjes, geen
  namen van instellingen). Het bouwen ging van Node 24 type stripping uit, dus `allowImportingTsExtensions` staat aan in `tsconfig.json`.
- **Films**: "Wat krijg ik" (16 seconden) en "De Meetperiode kiezen" (12 seconden) als CSS-animaties met stapkaarten, pauzeknop en eindbeeld bij verminderde beweging
  (`components/help/HelpFilm.tsx`, `app/styles/help.css`). Wat krijg ik staat ook op de Assessment-landingspagina, met de knop "Bekijk de voorbeeld-output" in plaats van
  "Bekijk wat je krijgt" in de hero.
- **KPI-definities**: Een kanaal hernoemen (invoerveld in de lijst Kanalen), een KPI verwijderen (met bevestiging die de waarden noemt), en de volgorde van KPI's en kanalen
  wijzigen met ↑ en ↓. Gelogd als `kanaal.hernoemd`, `kpiDefinitie.verwijderd`, `kpiDefinitie.volgordeGewijzigd` en `kanaal.volgordeGewijzigd`. Test in `lib/kpi.test.ts`.

**Keuzes waar de spec open liet**: De routes (`/help` en `/beheer/help`, de route was open). "Je score vergelijken" is ingevuld als uitleg van klassen, categorieën, radar en top 3.
"Leads toegang geven" is alleen voor een Admin, omdat het Leads-venster dat is. De film staat niet bij de Quickscan, want hij toont staven op de schaal van 1 tot 5. Alleen de
twee uitgewerkte onderwerpen hebben een illustratie. De inhoud wacht op de beoordeling van Joost.

## 2026-10-19 (3) — Specs van Joost, PR 129: balklijst, Onderdeel als object en KPI's per plek en kanaal

Op verzoek van Sander gebouwd (`stylesheet.md`, Balklijst; `datamodel.md`, Onderdeel en KPI's en kanalen; `beheerpagina.md`, punt 3 en 4; `visualisatie-verkennen.md`,
KPI's als kenmerk). De helppagina (`help.md`) is niet gebouwd: De inhoud en de films moeten eerst met Joost worden afgestemd.

**Gedaan**:
- **Balklijst**: Vaste kolommen voor label, waarde en extra gegevens (`.vis-rij`, `.qv-rij`, `.qv-lijst-rij` met een eigen kolom voor "1 vraag",
  `.qv-vraag-rij`, `.mm-teaser-rij`), balken van 8, 12 en 16px met een afronding van 4px, vullingen in hele pixels met minstens 4px (`balkVul`), en de gestapelde
  balk als `Stapel` met het getal pas vanaf 24px en een tooltip. Sporen met even hoogtes (36 en 28px). De controle staat in `lib/balklijst.test.ts`.
- **Kleinere punten uit PR 129**: De matrix toont het onderdeel op de eerste regel van de kolomkop en de meetdatum op de tweede, de tegels Hoogste en Laagste Meting noemen
  onderdeel en datum, en de kop boven de rijen is "Bouwblok". Minstens 32px tussen de schakelaar en "Toon als".
- **Onderdeel als object** (`lib/onderdelen.ts`, `lib/db/onderdelen.ts`): `Organisatie.onderdelen`, `Meting.onderdeelId`, de overgang bij het laden, `maakOnderdeel`,
  `hernoemOnderdeel` (de Metingen volgen) en `verwijderOnderdeel` (alleen zonder Meting, met de KPI-waarden), gelogd als `onderdeel.aangemaakt`, `.hernoemd` en `.verwijderd`.
  Het veld Onderdeel is overal een keuzelijst met "Nieuw onderdeel…" (`OnderdeelVeld`, in Meting plannen, Wijzigen, Gemiddelde maken, Scans samenbrengen, de uitnodiging
  en de import), met `info.metingOnderdeel`.
- **KPI's en kanalen** (`lib/kpi.ts`, `lib/kpi-beheer.ts`, `lib/db/kpi.ts`): `KpiWaarde`, de definities en kanalen bij de instellingen, de overgang van `kenmerken.kpis` en
  de zes contactenvelden naar KPI-waarden, het blok KPI's met de tabel, het openklappen per kanaal en de modals voor Onderdelen, "KPI's invullen" en de tab KPI's en kanalen
  bij Organisatievelden (alleen Admin). Gelogd als `kpi.waardenGewijzigd` (één gebeurtenis per plek, één `groepId`), `kpiDefinitie.*` en `kanaal.*`.
- **Verkennen**: Eén regel per KPI, met een groep Kanaal bij een KPI met een waarde per kanaal, de waarde van de plek van de eenheid zonder terugval op Algemeen, de naam
  "AHT Call-drempel", en Ingezette kanalen uit de KPI Contacten per jaar.
- **Exports en import**: InDesign haalt `kpi…` en `contacten…` uit Algemeen, de CSV heeft de JSON-kolom `organisatie_kpis` (niet in de AVG-inzage) en de import leest die en
  zet een oudere export met KPI's in `organisatie_kenmerken` om.
- 45 nieuwe tests.

**Keuzes waar de spec open liet**: `Meting.onderdeel` blijft staan als de naam van het Onderdeel (een kopie die bij elke schrijfactie wordt bijgewerkt) in plaats van te
vervallen, omdat de naam op tientallen plekken zonder de Organisatie wordt getoond. De test voor de balklijst leest de opmaak en meet niet in een browser. Een KPI-waarde
heeft geen eenheid in het invoerveld, alleen onder de naam. Bij een kanaal dat een Admin verwijdert, valt een opgeslagen verkenning met dat kanaal in het filter er stil
omheen (het filter wordt genegeerd). Opslaan als benchmark bewaart geen KPI en kanaal, want Verkennen heeft nog geen filter op bereik.

## 2026-10-19 (2) — Specs van Joost, PR 127: onderdeel I en J van de scorevisualisaties (ronde B)

Op verzoek van Sander gebouwd (`visualisatie-scores.md`, I en J).

**Gedaan**:
- **Eenheden**: De weergaven A en B rekenen met eenheden als pseudo-scans (`eenhedenGemiddeld`, `eenhedenSpreiding`), zodat een onderdeel of een
  lid met haar gemiddelde antwoord per vraag meetelt zonder tweede rekenmethode. `eenhedenNaastElkaar`, de zes vormen (clip-path) en
  `stapelStappen` voor Naast elkaar.
- **Samengestelde Meting, vergelijking en verkenning op één Organisatie** (`OnderdelenWeergaven`): De schakelaar Overzicht, Per bouwblok, Spreiding
  (vanaf 3) en Antwoorden (uitgeschakeld), "Toon als" Gemiddeld of Naast elkaar, en een kaart per onderdeel met vorm, naam, datum en totaalscore.
  Bij een vergelijking met twee Metingen blijft Naast elkaar weergave C of H.
- **Niveau 1 en het perspectief van een lid**: De benchmark tussen organisaties heeft de samenvatting bovenaan en de schakelaar Overzicht, Per bouwblok,
  Spreiding en Matrix. Het perspectief van een lid heeft Overzicht, Per bouwblok (D) en Spreiding met de ring op het lid. De Admin ziet het
  perspectief van een onderdeel ook op de organisatiepagina van de benchmark.
- **Niveau 3**: Overzicht en Spreiding boven de lijst met scans.
- **Labels en getallen**: "Bouwblok" waar de Assessment "bouwsteen" zegt (`bouwblokWoorden`), "onderdeel" als eenheid, en een decimale komma in de
  scorecirkel, de resultaten, de matrix, de tegels en de tooltips (`formatScore`).
- 7 nieuwe tests.

**Keuzes waar de spec open liet**: Een Lead op een samengestelde Meting ziet geen namen van de onderliggende Metingen (`benchmark.md` wint van
"voorlopig onder Resultaten" in I), dus wel Gemiddeld en Spreiding en geen Naast elkaar. Spreiding is er vanaf drie eenheden ook bij organisaties. De
reden "Bouwblok" is toegepast op de beheer- en benchmarkschermen en niet in de doorloopflow van de respondent. Bij een benchmark tussen organisaties
heeft Per bouwblok geen Toon als.

## 2026-10-19 (1) — Specs van Joost, PR 127: Fundament in geel, staafdiagram, Mijn metingen en Meetperiode

Op verzoek van Sander gebouwd (ronde A). Onderdeel I en J van `visualisatie-scores.md` (de weergaven bij een samengestelde Meting, niveau 1,
het perspectief van een lid en de hoofdpagina van een Meting) zijn niet gebouwd.

**Gedaan**:
- **Fundament in merkgeel** (`stylesheet.md`, Categoriekleuren): `--fu` is `--ye`, de hex in `CATEGORIE_COLORS` is `#ffc043`. Tekst in of bij de kleur
  staat in `--ink`: `lijnKleur`, `tekstOpKleur` en `accentStijl` (`lib/colors.ts`) zetten `--accent-t` en `--accent-op`, gebruikt in de sidebar,
  de bouwsteenkop, de Toelichtingsmodal en het bouwstenenmodel. De sleutel `antraciet` blijft staan in de data.
- **Staafdiagram per categorie**: Categoriekleuren, as van 1 tot 5, stippellijnen op 2,5 en 3,5 met de klassenamen, het getal van 16px vet boven de
  balk met een decimale komma. Per bouwblok of domein blijft de scorekleur. De PDF blijft zoals hij was.
- **Mijn metingen**: Het spoor loopt van 1 tot 5 (`schaalFractie`), in de eigen scan een balk van 8px, bij Hele meting een stip met een lijn van
  laagste tot hoogste scan, de ankers 1 en 5, en een tekstalternatief per rij. De Quickscan houdt de balk met het percentage.
- **Meetperiode** (`Benchmark.meetperiode`, `lib/verkennen.ts`): De keuze Meest recente of Periode in Verkennen en bij het wijzigen van een opgeslagen
  verkenning, met de regel over wat telt en hoeveel er afvallen, en `info.verkennenMeetperiode`. `kiesPoolMetingen` volgt "Welke Meting telt waar":
  Bij Organisaties ook een samengestelde Meting, bij Onderdelen nooit. De periode staat in het paneel, het detail, de Lead-pagina en de audit-log, en
  het Leads-venster toont de reden "Geen Meting in de Meetperiode".
- **Benchmark samenstellen**: Per organisatie en Assessment alle Metingen als keuze (naam, onderdeel, meetdatum, scans of "Gemiddelde van n Metingen",
  "Zit in …"), de voorgestelde Meting staat zichtbaar aangevinkt. De teller van een verkenning volgt de eenheid ("3 onderdelen van 1 Organisatie").
- 8 nieuwe en aangepaste tests.

**Keuzes waar de spec open liet**: De einddatum van de Meetperiode is inclusief. Een Meting zonder meetdatum valt buiten elke periode. Bij een
samengestelde Meting op Mijn metingen staat alleen de stip, zonder lijn. De reden "Geen onderdelen met een eigen Meting" is niet gebouwd, omdat de
situatie niet voorkomt (zie `benchmark.md`). Met een onvolledige periode (één datum) telt de meest recente Meting.

## 2026-10-17 (1) — Specs van Joost, PR 125: opgeslagen verkenning en de eenheid Onderdelen

Op verzoek van Sander gebouwd (`benchmark.md`, Opgeslagen verkenning, `visualisatie-verkennen.md`, Eenheid en Opslaan als benchmark).
Het onderdeel I van `visualisatie-scores.md` (weergaven voor een samengestelde Meting en een vergelijking) is niet gebouwd.

**Gedaan**:
- **Datamodel**: `Benchmark.soort`, `eenheid` en `filters` (`lib/types.ts`). Een verkenning heeft geen opgeslagen leden: `lib/verkenning-benchmark.ts`
  berekent ze uit de filters met de poolregels van Verkennen. `useBenchmarksMetLeden` en `getBenchmarksMetLeden` geven de benchmarks met leden,
  `slaAlles` laat een vinkje vervallen zodra een Organisatie niet meer aan de filters voldoet.
- **Verkennen**: De groep Eenheid (Organisaties of Onderdelen) met de kenmerken Organisatie en Onderdeel, en de knop Opslaan als benchmark met
  het paneel. `PoolLid` heeft een eigen `id` en `naam`. `info.verkennenEenheid` en `info.verkennenOpslaan` zijn nieuw in het register.
- **Beheer**: De badge Vaste groep of Verkenning en het aantal Organisaties in de lijst en het detail, de filters als regels, Wijzigen voor
  naam en filters (`VerkenningBewerken`), en in het Leads-venster een kolom met de badge, het aantal en de reden "Te weinig Organisaties in deze
  groep: n, minimaal m" onder de drempel.
- **Lead**: De view bij de eenheid Onderdelen (elk eigen onderdeel met naam tegenover de rest), met `benchmarkMinOrganisaties` op Organisaties
  en uitgezonderd bij een filter op één Organisatie. De pagina toont de naam en de filters van een verkenning.
- 15 nieuwe tests (`lib/verkenning-benchmark.test.ts`, `lib/verkennen.test.ts`, `lib/benchmark.test.ts`).

**Keuzes waar de spec open liet**: Een samengestelde Meting en haar onderliggende Metingen tellen niet allebei mee (de onderliggende vallen
eruit). Een filter naar een verdwenen kenmerk maakt de groep leeg. `info.verkennenEenheid` heb ik zelf geschreven. Wijzigen laat alleen
waarden en filters weghalen, geen nieuwe toevoegen.

## 2026-10-16 (2) — Mijn metingen: gelijke uitlijning van Jouw scan en Hele meting

Op verzoek van Sander. De regel "Gemiddelde van n afgeronde scans" onder het getal van de hele meting vervalt, het aantal staat
achter de titel ("Gemiddelde score · 6 scans"). Zo staan de rijen van beide blokken op dezelfde hoogte (`lib/mijn-metingen.ts`,
`components/mijn-metingen/`).

## 2026-10-16 (1) — Mijn metingen: een Lead is altijd als Lead herkenbaar

Op verzoek van Sander. Naast de Organisatie in de kop staat de rolchip "Lead", en zonder Metingen of vergelijkingen staat er een
korte melding (`app/s/[code]/page.tsx`, `visualisatie-mijn-metingen.md`, Gebouwd).

## 2026-10-15 (9) — Specs van Joost, PR 121: Verkennen, melding, herstel en de drempel instellen

Op verzoek van Sander gebouwd (`visualisatie-verkennen.md`, Groeperen en focus, Drempels, `beheerpagina.md`, Formulier Verkennen).

**Gedaan**:
- **Percentage 0** bij `verkennenMinIngevuldPct` (geen ondergrens), met aangepaste invoerregel en foutmelding in het formulier.
- **Redenen** bij een uitgeschakelde pil noemen de instelling ("Minder dan 6 Organisaties in de pool (instelling Organisaties in de
  pool, minimum)"). Ingezette kanalen staat als uitgeschakelde pil met een eigen reden, "Geen kenmerk" alleen zolang er geen
  kenmerk is, en "alleen filteren" in het menu Kenmerk toevoegen.
- **Levensduur van een melding en herstel**: `besluitGroepering` bepaalt bij elke wijziging opnieuw de groepering en de melding.
  Vorige versie hield de gekozen groepering vast en toonde de melding zolang de situatie duurde.
- **De drempel instellen** (voorstel, door Joost te bevestigen): Slider met afgeronde stappen, invoerveld, snelknoppen Mediaan en
  Gemiddelde, klikken op een staaf, en getallen met punten en komma (`formatGetal`, `drempelStap`).
- 12 nieuwe tests in `lib/verkennen.test.ts` (kanalen, nul procent, besluit, getalnotatie en stap).

## 2026-10-15 (8) — Specs van Joost, PR 119: drempels voor Verkennen en de opmaak van Mijn metingen

Op verzoek van Sander gebouwd (`visualisatie-verkennen.md`, Drempels, `visualisatie-mijn-metingen.md`).

**Drempels voor Verkennen**:
- Vijf instellingen in plaats van constanten (`lib/instellingen-store.ts`): `verkennenMinGroep` (3), `verkennenMinVergelijking`
  (5, voorheen `verkennenWaarschuwingGroep`, een opgeslagen waarde onder de oude naam wordt overgenomen), `verkennenMinPool` (6),
  `verkennenMaxGroepen` (12) en `verkennenMinIngevuldPct` (40). `kanGroeperen` krijgt ze mee en noemt ze in de reden.
- Het formulier Verkennen bij Drempels en termijnen (`app/beheer/drempels/page.tsx`) met vijf velden, uitleg onder elk veld en de
  melding bij een ongeldige invoer. `info.verkennenInstellingen` vervangt `info.verkennenDrempels`. Het verband gebruikt
  `verkennenMinGroep` als minimum en het menu Kenmerk toevoegen `verkennenMinIngevuldPct` voor het grijs.

**Mijn metingen**:
- Nieuwe opmaak (`app/s/[code]/page.tsx`, `components/mijn-metingen/`, `app/styles/mijn-metingen.css`): De kop met "Welkom terug,
  <voornaam>" en de Organisatie, secties met aantal (Nog te doen en Afgerond voor een respondent, Metingen en Vergelijkingen
  voor een Lead), kaarten met Assessment-icoon, statuschip, voortgang en teaser, de respons en de benchmarkkaart. Een Lead die
  zelf ook invult krijgt één kaart met de blokken Jouw scan en Hele meting.
- `lib/mijn-metingen.ts` (11 tests): De teaser van een scan en van de hele Meting voor schaal en Quickscan, de relatieve tijd,
  de volgorde van de secties en de respons.
- `ScanInvulling.laatstOpgeslagenOp`, gezet bij elke wijziging van de antwoorden.

**Keuzes waar de spec open liet** (onder Gebouwd in `visualisatie-mijn-metingen.md`): Eindstand als alle uitgenodigde scans klaar
zijn, "Laatst opgeslagen" in dagen tot en met 6, de Quickscan-teaser van een Lead volgt de regels van de eigen scan.

## 2026-10-15 (7) — Specs van Joost, PR 117: Kenmerken en Groeperen op bij Verkennen

Op verzoek van Sander gebouwd (`visualisatie-verkennen.md`, Kenmerken en filters, Groeperen en focus, Zonder groepering).

**Gedaan**:
- **Kaart Kenmerken** (`components/verkennen/KenmerkenKaart.tsx`): Het scherm begint leeg, met "Snel beginnen" (CRM-pakket, Sector,
  AHT) en het menu Kenmerk toevoegen (`FilterMenu.tsx`, uitgeschakeld met "toegevoegd" bij wat er al staat). Per kenmerk een rij
  met korte naam, potlood, kruisje en pillen of de tekst "Getal, n van N ingevuld". Ingezette kanalen is een kenmerk dat alleen
  filtert. Wis filters laat de kenmerken staan, het kruisje haalt kenmerk en filter weg.
- **Groeperen op** (`Vergelijken.tsx`): Een pilvormige groep met een pil per kenmerk dat kan groeperen, de reden bij een
  uitgeschakelde pil in een tooltip en onder de groep, de pil "Geen kenmerk", de terugval met melding, de drempel met eenheid
  (`VeldDefinitie.eenheid`) en "n zonder waarde". `info.verkennenKenmerken` en de nieuwe tekst van `info.verkennenGroeperen`.
- **Regels** (`lib/verkennen.ts`, 6 nieuwe tests): `kanGroeperen` (pool minstens 6, kenmerk bij minstens 40% ingevuld, select met 2
  tot 12 waarden, getal met twee verschillende waarden) en `splitsFocus`: De rest zijn de Organisaties van de andere groepen.
- **Zonder groepering**: De hele pool is de focus in alle vier de weergaven, Grootste verschil is uitgeschakeld.

**Opmerking**: Met de seed (3 Organisaties met toestemming voor benchmark) kan niets groeperen. De reden staat onder Groeperen op.

## 2026-10-15 (6) — Specs van Joost, PR 116: opmaakronde en korte namen

Op verzoek van Sander gebouwd (`stylesheet.md`, `visualisatie-verkennen.md`, `beheerpagina.md` punt 3, `datamodel.md`).

**Opmaak**:
- **Tokens** (`app/styles/tokens.css`): Acht lettergroottes in even px (`--fs-12` tot `--fs-48`, de oude `--fs-xs/s/m/l`
  vervallen), afstandsraster `--sp-1` tot `--sp-12`, `--kolom-b` (96px), de celtinten `--score-N-cel` met tekstkleur, `--dal` en
  `--control-h` op 40px. De Tailwind-schaal in `app/globals.css` is tot dezelfde acht maten beperkt. Alle losse `font-size`s in CSS
  en inline styles lopen via de tokens, grafiektekst is 12px, de paginatitel `.page-title` 32px.
- **Pil** (`.pil`, `.pil-groep`, `.weergave-wissel`): Eén vorm voor keuzes, gekozen is massief oranje. Toegepast in de
  weergave-schakelaar, de filters en focusgroepen van Verkennen en de antwoorden van de Quickscan.
- **Scorekleur op drie niveaus**: Band, cel en vol. De matrix en de heatmap (eerste kolom en Overall) gebruiken de celtinten, het
  verschil is blauw (`--bl`) of `--dal`, een afwijkende cel in de matrix heeft een driehoek van 8px in plaats van de zwarte rand.
- **Kolomkop en rijkop** (`WeergaveMatrix`, `WeergaveHeatmap`): Kolommen van 96px, de kop op één regel met een afkapping en de
  tweede regel (meetdatum of "n = 5") in 12px, de volledige naam in een tooltip. Rijkop 240px op één regel.

**Korte namen**:
- **Data**: `Organisatie.korteNaam` (aanmaken en bewerken, `info.korteNaamOrganisatie`) en `Instellingen.korteNamen` voor
  veldnamen en waarden (`lib/korte-namen.ts`, 7 tests). De beginwaarden voor de 22 SBI-sectoren komen uit `sbi-indeling.md`.
  Elke wijziging is een gebeurtenis `korteNaam.gewijzigd`, zonder de nieuwe naam.
- **Beheer**: De pagina Organisatievelden (`/beheer/organisatievelden`, tab voor een Admin) met de schakelaar Velden | Korte
  namen. De tabel heeft filters op veld en zoekterm, "waarden in gebruik zonder korte naam bovenaan", een teller, validatie op
  lengte (30) en uniciteit binnen het veld, en één Opslaan.
- **Verkennen**: Het filtermenu met zoekveld, koppen per groep en "n van N" (grijs onder 40%), de korte naam op chips en
  groepsnamen, het origineel in de tooltip, een potlood naast de kop van een filter dat de modal Korte namen opent en
  `info.verkennenGroeperen` naast Groeperen op. De matrix tussen organisaties toont de korte naam van de Organisatie.

**Keuzes waar de spec open liet**: De weergave Velden toont de definitie alleen lezend (het beheren van de velden zelf is niet
gebouwd). De korte namen staan bij de instellingen en niet op de definitie, zodat er geen nieuwe serversleutel nodig is. Het
sectorfilter bij een benchmark gebruikt de korte namen niet, de spec vraagt daar nog bevestiging.

## 2026-10-15 (5) — Quickscan Ziekenhuis: geen testknop in de doorloopflow

Op verzoek van Sander. De tijdelijke testknop ("Vul alle vragen automatisch in") staat niet meer bij de Quickscan
(`app/scan/[respondentId]/doorloop/page.tsx`), de andere scans houden hem. De Ja / Nee / Weet ik niet-tak van de knop is
verwijderd.

## 2026-10-15 (4) — Specs van Joost, PR 114: Verkennen

Op verzoek van Sander volledig gebouwd (`visualisatie-verkennen.md`, `beheerpagina.md` punt 15).

**Gedaan**:
- **Scherm** (`app/beheer/verkennen/page.tsx`): De tab Verkennen onder Resultaten, alleen voor een Admin (`verkennen.inzien`,
  `lib/rechten.ts`). Keuze van het Assessment, filters, vergelijken en vier weergaven. Het scherm slaat niets op.
- **Filters** (`components/verkennen/FilterPaneel.tsx`): Afgeleid uit de organisatievelden (`filterVelden`), dus een nieuw veld wordt
  vanzelf een filter. Chips voor select-velden ("of"), een bereik met histogram voor getallen, ingezette kanalen ("en"), "Filter
  toevoegen" en "Wis filters", en de teller "X van Y Organisaties in de pool" met het aantal zonder toestemming.
- **Vergelijken** (`Vergelijken.tsx`): Groeperen op CRM-pakket, sector of de AHT-drempel (slider met histogram), de focusgroep als
  chips en de waarschuwing bij een kleine groep.
- **Weergaven**: Groep tegenover de rest, Spreiding binnen de groep (beide met sorteren op grootste verschil of spreiding), Alle
  groepen naast elkaar (heatmap, een klik op een kolomkop maakt de groep de focus) en Verband met een kenmerk (diagram met lijn,
  r en een woord bij de sterkte).
- **Berekeningen** (`lib/verkennen.ts`, 14 tests): De pool, filters, groepen, gemiddelde, mediaan, kwartielen, standaardafwijking
  (n − 1), heatmap en regressie.
- **Instellingen**: `verkennenMinGroep` (3) en `verkennenWaarschuwingGroep` (5) bij Drempels en termijnen, met `info.verkennenDrempels`
  en `info.verkennen` in het register.

**Keuzes waar de spec open liet** (onder Gebouwd in `visualisatie-verkennen.md`): Meerdere kanalen werken als "en", de drempels staan
op 3 en 5, en groeperen kan op CRM-pakket, sector en AHT. Voor Joost nog te bevestigen: De eerste twee, en de keuze van de
groeperingsvelden.

**Nog niet gebouwd**: Een versie voor de Consultant, de Quickscan Ziekenhuis, meerdere Metingen per Organisatie, AHT per kanaal,
bewaren als benchmark en export (allemaal onder Later).

**Tests**: 324 (was 310).

## 2026-10-15 (3) — Voorbeeld-output: Gemiddelde en afwijking bij de Klantcontact Volwassenheidsscan

Op verzoek van Sander gebouwd (`app/[assessmentId]/voorbeeld/page.tsx`).

**Gedaan**:
- Onder het voorbeeldresultaat staat bij de Klantcontact Volwassenheidsscan de weergave Per bouwblok van een Meting (`visualisatie-scores.md`,
  A) met zes demo-respondenten, onder de kop "Gemiddelde en afwijking" en de tekst dat de tool bij meerdere respondenten van dezelfde
  Meting en organisatie ook inzicht geeft in de gemiddelde scores en de afwijkingen daarop.
- De kop van de pagina volgt de spec: Het label "Voorbeeld-output" is de oranje eyebrow, de titel de standaard h1 (`stylesheet.md`,
  Koppen) en "← Terug" een `.btn .btn-outline .btn-compact`. Eerder stonden daar losse Tailwind-klassen (grijs label, kleine
  titel, kale rand). De sectie eronder heeft ook een eyebrow.
- De kop volgt de aangescherpte spec (PR 112): "← Terug" staat rechts naast de h1 en is daarmee verticaal uitgelijnd (niet meer
  naast de eyebrow), en elke `.btn` heeft `white-space: nowrap` en `flex-shrink: 0`, zodat pijl en label op één regel blijven.
  De eyebrows "Sterkste afdeling" en "Meeste ontwikkelruimte" van de Quickscan waren groen en rood en zijn nu oranje.
- Onder de balk "Dit is een voorbeeld met demo-data…" staat een regel ruimte (1,5rem) voor de eerste kaart van het resultaat
  (`.preview-banner`, voor alle Assessments).
- De demo-scans staan in `data/demo-antwoorden-per-assessment.ts` (`getDemoMetingScans`): Afwijkingen van één punt op de vaste
  demo-antwoorden. Dezelfde sectie staat ook bij de AI-volwassenheidsscan en de Zorgscan. Voor de Quickscan is er (nog) geen demo van
  een Meting.

## 2026-10-15 (2) — Specs van Joost, PR 109: Visualisaties van de Quickscan Ziekenhuis

Op verzoek van Sander volledig gebouwd (`visualisatie-quickscan.md`).

**Gedaan**:
- **Weergave 1 en 2** (`components/QuickscanResultaten.tsx`, `components/quickscan/QuickscanOverzicht.tsx`): De schakelaar Per
  afdeling en Overzicht met `?weergave=overzicht`, op het resultaatscherm, de voorbeeld-output en de scan in beheer. De totaalkaart
  noemt afdelingen die niet meetellen bij naam, en een kaart "Niet van toepassing" zegt dat antwoorden bewaard blijven.
  Overzicht heeft de afdelingen op één schaal met een lijn op het totaal, de matrix afdeling × dimensie en alle bouwblokken van
  laag naar hoog.
- **Weergave 3 en 4** (`components/quickscan/QuickscanGemiddeldeSpreiding.tsx`, `QuickscanAntwoorden.tsx`): Op de resultatenpagina
  van een Meting heeft de schakelaar voor dit type Overzicht (het gemiddelde in dezelfde kaarten), Gemiddelde en spreiding, en
  Antwoorden met Verdeling en Per respondent. Een Lead ziet een afdeling met minder relevante scans dan `benchmarkMinRespondenten`
  als "Te weinig antwoorden".
- **Weergave 5** (`components/quickscan/QuickscanBenchmarkView.tsx`): De view per organisatie in percentages, voor een Admin en een
  Lead, en in de lijst van de benchmark het totaal met de klasse. Een Assessment met Ja / Nee / Weet ik niet is nu te kiezen bij een
  benchmark tussen organisaties.
- **Berekeningen** (`lib/quickscan-groep.ts`): Gemiddelde en spreiding over een Meting, de verdeling per vraag en de vergelijking
  tussen organisaties, met 14 tests. Het Leads-venster laat Resultaten, Spreiding en Antwoorden voor dit type weer toe, alleen
  Exporteren blijft grijs. De kolommen van Per respondent komen uit dezelfde functie als weergave G (`kolommenVoorScans`).

**Keuzes waar de spec open liet** (onder Gebouwd in `visualisatie-quickscan.md`): De grenzen van het spreidingslabel staan op 14 en
20, het totaal is alle punten gedeeld door alle mogelijke punten, de respondent krijgt de schakelaar op scherm 6, en bij gelijkstand
tonen de tegels de eerste vraag in de volgorde van het model. Voor Joost nog te bevestigen: Deze vier plus de drempel "Onbekend bij".

**Nog niet gebouwd**: De weergaven C, E en H voor dit type, een samengestelde Meting, de benchmark binnen een organisatie en binnen
een Meting, en export.

**Tests**: 310 (was 296).

## 2026-10-15 — Klantcontact management & support krijgt "Aantal FTE" zoals IT DevOps

Op verzoek van Sander gebouwd.

**Gedaan** (`datamodel.md`, Organisatievelden, FTE):
- Het veld "Klantcontact management & support" is een groep met het veld "Aantal FTE", net als "IT DevOps medewerkers", met dezelfde
  kop en hetzelfde vlak (`data/organisatie-velden.ts`).
- Bestaande waarden worden bij het laden omgezet: `28` wordt `{ aantal: 28 }` (`lib/fte.ts`, met tests). De demo-organisatie en
  de InDesign-export (`fteKlantcontactManagementSupport`, `lib/indesign/kenmerken-xml.ts`) lezen het nieuwe pad. Het element en
  de CSV-kolom met de kenmerken blijven bestaan, de waarde staat nu in de groep.

**Keuze**: Het veld staat nu, zoals de andere twee, in een eigen kader met kop. Het invoerveld is daardoor even breed als het kader.

**Tests**: 296 (was 294).

## 2026-10-14 (4) — Specs van Joost, PR 105: De kaart op de Lead-pagina toont alleen Resultaten en Uitnodigen

Op verzoek van Sander gebouwd (`app/s/[code]/page.tsx`).

**Gedaan** (`CLAUDE.md`, scherm 4; `beheerpagina.md`, punt 6a; `datamodel.md`, Wat de Lead op zijn eigen pagina ziet):
- De knoppen Spreiding en Antwoorden zijn van de Meting-kaart en van de kaart bij de eigen scan gehaald. Ze zitten in de
  schakelaar op de resultatenpagina van de Meting, waar ze al stonden voor zover het vinkje aan staat.
- "Bekijk de resultaten van de hele meting" heet nu "Resultaten hele meting".

**Tests**: ongewijzigd, 294.

## 2026-10-14 (3) — Specs van Joost, PR 103: Quickscan Ziekenhuis en de lezing bij een vergelijking tussen Metingen

Op verzoek van Sander volledig gebouwd. Er is niets aan de opgeslagen data omgezet: Een bestaande browser of serverkopie krijgt
de Quickscan er één keer bij, en een benchmark van vóór de lezing volgt haar lezing uit haar leden.

**Gedaan, Quickscan Ziekenhuis** (`content-ziekenhuis-quickscan.md`; `datamodel.md`, Antwoordtype, Scoreberekening):
- **Datamodel** (`lib/types.ts`): `Assessment.antwoordType`, `instructieregel` en `relevantieVraag`, `Categorie.optioneel` en
  `omschrijving`, `Bouwblok.aandachtZin` en `ScanInvulling.relevantie`. Een antwoord is een getal of `"ja"`, `"nee"`,
  `"weet-niet"`. Alle schaalfuncties negeren een antwoord dat geen getal is (`numeriekeAntwoorden`).
- **Scoring** (`lib/quickscan.ts`, met tests): Ja is 1 punt, bouwblok `p/n`, afdeling en overall `Σ(g × p) / Σ(g × n)`, klassen vanaf
  80 en 50 op het afgeronde percentage, afdelingen die niet van toepassing zijn tellen niet mee, chips bij minstens twee
  dimensies (sterkste basis minstens 3 vragen, gelijkstand geeft geen chip). Voortgang en afronden volgen de relevantie
  (`lib/scoring.ts`).
- **Content**: 4 afdelingen, 10 dimensies, 60 vragen (`data/ziekenhuis-quickscan-assessment.ts`), met demo-antwoorden voor de
  voorbeeld-output (5, 3, 5 en 4 van 15, samen 17 van 60).
- **Doorloopflow**: Per afdeling twee kaarten (definitie en relevantievraag), pas na Ja volgen de vragen, Ja / Nee / Weet ik niet
  per vraag, sidebar met de afdelingen en dimensies, en de testknop vult dit type ook.
- **Resultaten**: Totaalkaart, een kaart per afdeling met verdieping op de dimensies en de chips, "Sterkste afdeling" en "Meeste
  ontwikkelruimte", en de legenda. Radar, top 3 en staafdiagram per categorie vervallen.
- **Beheer**: Instructieregel en relevantievraag bij het Assessment, omschrijving en Optioneel bij een afdeling en de zin bij het
  grootste aandachtspunt bij een dimensie.

**Gedaan, de lezing** (`benchmark.md`, Niveau 2; `visualisatie-scores.md`, C, E en H):
- `Benchmark.lezing` (`ontwikkeling` of `naastElkaar`) met de schakelaar "Lees als" bij aanmaken en wijzigen. De app stelt de
  lezing voor zolang de Admin de schakelaar niet aanraakte. Bij Ontwikkeling over tijd staan Metingen met een ander onderdeel
  uitgeschakeld en kan Opslaan niet bij gelijke meetdata, bij Naast elkaar staat er een waarschuwing boven
  `benchmarkMaxDagenTussenMetingen` dagen (nieuwe instelling bij Drempels en termijnen, startwaarde 90, geen blokkade).
- Weergave H (`WeergaveNaastElkaar`): Cirkel en ruit, het verschil zonder teken met het symbool van de hogere Meting, "Gelijk",
  tegels en een legenda. De matrix heeft bij Naast elkaar de kolom Hoogste, de Metingen staan op naam. De waarschuwing bij een
  ander onderdeel in weergave C vervalt, want die Metingen komen daar niet meer voor.
- De knop "Vergelijking" toont bij meer dan één benchmark de naam met de lezing, voor een Lead alleen de lezing. De lijst met
  benchmarks en het detail tonen de lezing.
- De meetdatum van een samengestelde Meting is alleen-lezen in "Wijzigen" ("Volgt de nieuwste Meting in de samenstelling") en
  staat met dezelfde toelichting in het Meting-overzicht.

**Keuzes waar de spec open liet**:
- De bestaande schermen voor 1–5-scores zijn voor de Quickscan bewust uit (CLAUDE.md, scherm 6): Gemiddelde van een Meting,
  Per bouwblok, Spreiding en Antwoorden, benchmark, samengestelde Meting, Exporteren en de vinkjes in het Leads-venster behalve
  Uitnodigen.
- Het ⓘ naast een bouwblok verschijnt alleen met een toelichting of centrale vraag, ook bij de andere Assessments.
- Een Assessment met dit type heeft `schaal: []` in de code in plaats van `null`.
- De wegingskaart noemt de naam als "Afdeling · Dimensie" (open punt 3), de factor in de flow blijft "2×".
- Een verwijderde seed-Assessment komt niet terug (bijgehouden per browser).
- In `datamodel.md`, `benchmark.md` en `visualisatie-scores.md` stonden onderdelen van PR 100 (Leads-venster, `LeadToegang`,
  `antwoordenMetNamen`, kolom Verschil) weer als "voorstel". Ze zijn teruggezet op gebouwd. Wat nog voorstel is: Het vervallen
  van niveau 3 als `Benchmark.niveau` (de weergave voor de Admin bestaat nog).

**Tests**: 294 (was 274): Quickscan-scoring met de rekenvoorbeelden uit de spec, klassen en afronding, chips en gelijkstand,
relevantie en voortgang, de lezing (voorstel, regels, dagen, volgorde) en weergave H met de kolom Hoogste.

## 2026-10-14 (2) — Specs van Joost, PR 100: Meetdatum vervangt de ronde, Leads-venster in plaats van tabel

Op verzoek van Sander volledig gebouwd. De opgeslagen data blijft bruikbaar: Bestaande Metingen houden naam, onderdeel en
samenstelling, de meetdatum is leeg tot een Admin of Consultant hem invult.

**Gedaan, de ronde vervalt** (`datamodel.md`, Meting; `beheerpagina.md`, punt 5):
- **Datamodel**: `Ronde`, `Meting.rondeId` en `Organisatie.rondes` zijn weg (`lib/types.ts`). Er komen `Meting.meetdatum` (een dag
  zonder tijdstip, `JJJJ-MM-DD`) en `Meting.labelHandmatig`. Het laden haalt een oude ronde uit de data en zet `labelHandmatig`
  bij een Meting zonder meetdatum, zodat de oude naam blijft staan tot "Standaardnaam herstellen".
- **Pure functies** (`lib/metingen.ts`, voorheen `lib/rondes.ts`): Meetdatum valideren en tonen, de naam "{onderdeel} | okt
  2026", sortering op meetdatum (nieuwste eerst, een Meting zonder datum onderaan), dezelfde combinatie van onderdeel,
  Assessment en meetdatum, en de waarschuwing voor twee Metingen met hetzelfde onderdeel.
- **Meting plannen en wijzigen** (`lib/db/meting-plannen.ts`): Assessment-type, Onderdeel en Meetdatum (verplicht). "Wordt: …"
  onder de rij, een waarschuwing bij dezelfde combinatie en geen blokkade. Wijzigen heeft Onderdeel, Meetdatum en Naam met
  "Standaardnaam herstellen". Nieuw: "Meetdatum instellen…" op een selectie, één gebeurtenis per Meting
  (`meting.meetdatumGewijzigd`).
- **Weg**: "Nieuwe ronde starten", "Naar ronde…", de rondekop, het Ronde-overzicht, de tab Rondes (het adres stuurt door) en
  "Vergelijk met vorige ronde".
- **Samengestelde Meting** ("Gemiddelde maken"): Metingen van één organisatie en één Assessment op elke meetdatum, standaard
  niets aangevinkt, een Meting zonder meetdatum of met te weinig scans uitgeschakeld met reden, en de meetdatum is de laatste van
  de selectie. De waarschuwing bij hetzelfde onderdeel staat onder de lijst.
- **Resultaten**: Eén tab Metingen (en voor een Admin Benchmarks), een Consultant ziet geen tabbalk. Kolommen Organisatie,
  Meting, Onderdeel, Assessment, Meetdatum en Afgeronde scans, filters op Organisatie, Assessment en een periode op meetdatum.
- **Import**: De meetdatum is de oudste datum van de scans in de Meting, aanpasbaar per Meting in de voorbeeldweergave. Een
  tweede scan van dezelfde Respondent krijgt een eigen Meting met haar eigen datum. De kolom `meting_meetdatum` van de eigen
  export wordt gelezen, `ronde` genegeerd. De CSV-export heeft `meting_meetdatum` in plaats van `ronde`.

**Gedaan, vergelijking tussen Metingen** (`benchmark.md`, Niveau 2; `visualisatie-scores.md`, C en E):
- De benchmark binnen een organisatie vergelijkt precies twee Metingen van één Assessment, een samengestelde Meting mag meedoen.
  De weergave is C (ring, stip en verschil) met daaronder de matrix (E) met kolom Verschil per bouwblok, per categorie en voor
  de totaalscore. Geen groepsgemiddelde, geen gemiddelde en bereik per rij en geen zwarte rand. `benchmarkMinMetingen` vervalt.
- Op de resultatenpagina staat de knop "Vergelijking": Eén benchmark opent direct, meer geven een keuzelijst, geen enkele een
  uitgeschakelde knop met `info.vergelijkMetingen`. Een Consultant krijgt de knop niet. De view per Meting
  (`/beheer/benchmark/.../meting/...`) vervalt.
- Een Lead ziet de vergelijking van de Metingen waarvoor hij Resultaten heeft, en alleen bij minstens twee. Het benchmarkvinkje
  vervalt als dat minder wordt.

**Gedaan, Leads-venster** (`beheerpagina.md`, punt 6a; `stylesheet.md`, `.modal-box--vol`):
- Op het organisatie-detail staat een compact blok Leads (naam, "Ziet 3 weergaven", "Bekijk", "Leads beheren", bij meer dan vijf
  "Alle Leads beheren →", zonder Leads "+ Lead toevoegen"). De vinkjes staan in het venster (`?leads=<organisatieId>`).
- Het venster heeft een vaste kop en voettekst, alleen de tabel scrolt, met een vaste eerste kolom en twee kopregels. Een
  keuzelijst Assessment bij meer dan één Assessment, "Sluiten zonder op te slaan?" bij niet-opgeslagen vinkjes, en na Opslaan
  blijft het venster open met een melding. Vanuit het Respondent-overzicht opent "Leads beheren" hetzelfde venster in dezelfde
  modal. De organisatie valt eronder onder het Bewerkslot.

**Keuzes waar de spec open liet**:
- Eigen export zonder `meting_meetdatum`: De meetdatum blijft leeg (de eerste bullet van `import-scans.md`), ook al zegt de
  laatste alinea dat dan de afleiding geldt. Een onbekende datum is veiliger dan een verkeerde.
- Een Meting uit de tijd van de rondes houdt haar naam ook als ze een meetdatum krijgt ("Bestaande Metingen houden hun naam").
  "Standaardnaam herstellen" laat de naam volgen.
- Een benchmark binnen een organisatie met meer dan twee Metingen of meer Assessments blijft zichtbaar (tabel en matrix zonder
  Verschil). Wijzigen maakt er een vergelijking van twee Metingen van.
- "Per categorie" in de kolom Verschil is een rij per categorie onder het laatste bouwblok, alleen bij een Assessment met
  categorielaag.
- "Alle Leads beheren →" en "Leads beheren" zijn knoppen: Ze openen een venster en zijn dus een actie, geen navigatie.

**Tests**: 274 (was 248): Meetdatum en naam, volgorde, dezelfde combinatie, Meting plannen en wijzigen, Meetdatum instellen,
de overgang van de rondes, de samengestelde Meting zonder ronde, de import met meetdatum, de vergelijking van twee Metingen
voor Admin en Lead en de kolom Verschil in de matrix.

**Open**: Of een Lead de lijst Metingen ook krijgt (`backlog.md`). Er zijn geen tests voor de schermen zelf (Metingen-lijst,
Leads-venster), alleen voor de berekeningen en opslag eronder.

## 2026-10-14 — Specs van Joost, PR 97: hoofdlink Resultaten, tabel Leads en import vanuit de organisatie

Op uitdrukkelijk verzoek van Sander volledig gebouwd, zonder eerst een backup van de opslag te maken (de data zet Sander zo
nodig later terug).

**Gedaan, deel 1: Resultaten** (`beheerpagina.md`, punt 5, 7 en 8):
- **Hoofdlink Resultaten** met de tabs Rondes, Metingen en (alleen Admin) Benchmarks. De hoofdlink Benchmark en de pagina
  Ingevulde scans vervallen: `/beheer/scans` en `/beheer/import` sturen door. Het kruimelpad en de actieve hoofdlink volgen de
  weg waarlangs je een Meting bereikte (`?via=resultaten`, `lib/resultaten-nav.ts`).
- **Ronde-overzicht** (`/beheer/rondes/[rondeId]`) met de Metingen van de ronde, "Gemiddelde van deze ronde" en "Vergelijk
  met vorige ronde" (uitgeschakeld met `info.vergelijkRonde` zolang er geen vergelijkbare eerdere ronde is).
- **Scanlijst in het Meting-overzicht**: Sorteerbaar (`sort` en `dir` in de adresbalk), met bulk Exporteren, Naar andere
  Meting en Verwijderen, en een rij die het Scan-overzicht opent.
- **Metingen plannen** als veldenrij op de organisatiepagina, met "Wordt: …" onder de rij.
- **Importeren vanuit de organisatie** (`ImportScans`, Admin-only): De doelorganisatie ligt vast, per organisatienaam in het
  bestand is het koppelen of overslaan. "Nieuw aanmaken" bestaat niet meer.

**Gedaan, deel 2: Leads** (`beheerpagina.md`, punt 6a, `benchmark.md`, `datamodel.md` deel 2):
- **Tabel Leads** op het organisatie-detail (`LeadsTabel`): Per Lead een vinkje per weergave (Resultaten, Spreiding,
  Antwoorden, Uitnodigen, Exporteren) per Meting, en per benchmark een kolom. Grijze cellen met reden in een Info-icoon,
  concept tot "Opslaan", afhankelijkheden (Spreiding, Antwoorden en Exporteren vragen Resultaten; een samengestelde Meting
  heeft alleen Resultaten; niveau 2 vraagt Resultaten op een lid-Meting; niveau 3 heeft geen kolom).
- **`LeadToegang`** in plaats van `RespondentRolMeting`, `leadVoorOrganisatie` en `BenchmarkToewijzing` (`lib/lead-toegang.ts`).
  `Respondent.lead` is de rol. Vinkjes vallen weg als de Lead zijn rol verliest, de Meting of benchmark verdwijnt, of een
  vinkje waar het vorige van afhangt wordt uitgezet (`ruimLeadToegangOp`, bij elke opslag en na het wijzigen of verwijderen
  van een benchmark via `ruimBenchmarkVinkjesOp`).
- **Overgang** (`voerLeadOvergangUit`, `zetLegacyBereikOm`): Een Lead met Metingen krijgt Resultaten, Uitnodigen en
  Exporteren voor die Metingen. "Hele organisatie" is omgezet voor de Metingen die er nu zijn, met een melding aan de Admin.
  Een toewijzing op niveau 1 of 2 is een benchmarkvinkje, een view op één scan is Spreiding voor die Meting. Idempotent.
- **Lead toevoegen**: Een bestaande of nieuwe Respondent, zonder verplichte Meting. "Lead" is ook los van een vragenlijst.
- **Lead-landingspagina** (`/s/[code]`): Kaarten per Meting per ronde met alleen de aangevinkte knoppen, benchmarkkaarten en
  de eigen scans. Alle weergaven op de Lead-pagina volgen de vinkjes.
- **Namen bij Antwoorden** (`Organisatie.antwoordenMetNamen`): Uit betekent R1 tot en met Rn zonder tooltip, in een vaste
  volgorde uit een hash van het scan-id (`antwoordenPerVraag(..., { anoniem })`).
- **Benchmarkviews zonder toewijzen**: Het blok "Toewijzen" is vervangen door een lijst van Leads die de view zien
  (`LeadsOpView`). `info.benchmarkToewijzen` is vervallen.

**Keuzes waar de spec open liet**:
- Niveau 3 (view op één scan) blijft bestaan als beheerweergave voor de Admin, de Lead krijgt er geen kolom voor.
- Een vinkje voor een verdwenen benchmark of Meting valt direct, niet pas bij de eerstvolgende opslag.
- "Lead zonder vinkjes" toont "Ziet nog niets" in de tabel.

**Tests**: 248 (was 230): De Lead-rol en vinkjes, afhankelijkheden, de omzetting van het oude bereik, de grijze cellen,
`leadViewsVoorBenchmark`, de overgang van toewijzingen, Lead toevoegen, uitnodigen en verplaatsen, anonieme Antwoorden en de
kruimelpaden.

**Open**: Of een Lead de lijsten Rondes en Metingen ook krijgt (`backlog.md`). De tests voor de lijsten Rondes en Metingen
zelf en voor het bestandsimport met een doelorganisatie volgen nog.

## 2026-10-13 (6) — Specs van Joost, PR 93: Weergave G, Antwoorden per vraag

**Gedaan**:
- **Weergave G** (`visualisatie-scores.md`, G): De vierde knop "Antwoorden" in de schakelaar op de resultatenpagina van een
  Meting in beheer (`?weergave=antwoorden`), alleen voor een Admin en Consultant. Een Lead ziet haar nooit (op de pagina van de
  Lead staat `antwoordenToegestaan` uit), en een samengestelde Meting heeft geen scans en dus geen knop.
- **Berekening** (`antwoordenPerVraag`, `lib/visualisatie.ts`): Eén kolom per afgeronde scan, de bouwblokken met hun vragen
  (met de tekst uit de content), per bouwblok de score van elke respondent, Gem. en N per rij, de Totaalscore uit de gedeelde
  scorefunctie met de gewichten, en de tegels (Respondenten, Beantwoord, Laagste en Hoogste vraag).
- **Weergave** (`WeergaveAntwoorden`): Initialen in de kolomkop met de naam in een tooltip, alle bouwblokken standaard
  ingeklapt met "Alles uitklappen" en "Alles inklappen", de vijf scorekleuren per cel (wit op 1 en 5, donker op 2 tot en met 4,
  lege cel wit met een rand), en een kaart die zelf scrolt met een vaste kolomkop en linkerkolom.
- **Specs**: G staat op gebouwd in `visualisatie-scores.md`, met de gemaakte keuzes onder Afwijkingen en keuzes. De schakelaar
  in `stylesheet.md` en de regel in `beheerpagina.md` volgen.

**Keuzes waar de spec open liet**:
- Kolomvolgorde: Op het laatste woord van de naam (een Respondent heeft één veld `naam`), daarna de hele naam.
- Gelijke initialen krijgen een volgnummer ("JV", "JV2").
- Een gearchiveerde vraag zonder antwoorden krijgt geen rij.

**Tests**: 230 (was 225): Kolomvolgorde en initialen, antwoorden en scores per bouwblok, de totaalscore uit de gedeelde
scorefunctie, een lege cel, en een Meting zonder afgeronde scans.

**Open** (staat ook bij Joost): Sorteren of filteren op bouwblok en een CSV-export van deze matrix.

## 2026-10-13 (5) — Specs van Joost, PR 91: Label van een Meting vervalt, Naar ronde met onderdeel per Meting

**Gedaan**:
- **Naam van een Meting** (`datamodel.md`, Naam van een Meting; `beheerpagina.md`, punt 5): Het label is nergens meer een
  invoerveld. `maakMeting`, `wijzigMeting`, `maakSamengesteldeMeting`, `wijzigSamengesteldeMeting` en `brengScansSamen` maken
  de naam uit onderdeel en ronde (`genereerLabel`). Een ronde is verplicht bij het aanmaken. Een Meting zonder ronde houdt
  haar oude label tot ze een ronde krijgt. Het formulier toont ter controle "Wordt: …".
- **Eén component voor de twee velden** (`OnderdeelRondeVelden`): Ronde (bestaande of nieuwe) en Onderdeel, in Meting
  plannen, de nieuwe Meting bij "Vragenlijst sturen" (Respondent-overzicht), Wijzigen en Scans samenbrengen.
- **"Naar ronde…" als modal** (`NaarRondeModal`): Bovenaan de ronde, daaronder per Meting alleen het veld Onderdeel, voorgevuld
  uit het oude label (`stelOnderdeelVoor`: de tekst vóór " | ", een eigen onderdeel blijft, anders "Hele organisatie").
  `naarRonde` is alles of niets en neemt per Meting een onderdeel. De controle (`controleerNaarRonde`) draait in het scherm en
  in de opslag: Geen twee Metingen met hetzelfde onderdeel en Assessment in de ronde, ook niet met wat er al staat. Een botsing
  staat rood in de regel, met beide uitwegen (`botsingTekst`). Ook vanuit het Meting-overzicht, voor die ene Meting.
- **Wijzigen achter een potlood** naast de naam in het Meting-overzicht (gewone en samengestelde Meting), met alleen Onderdeel
  en Ronde. Een samengestelde Meting wijzigt alleen het onderdeel.
- **Scans samenbrengen**: Het onderdeel van de nieuwe Meting is voorgesteld uit het oude label van de eerste scan, het label is
  weg, "Zonder ronde" is er niet meer, en de botsmelding noemt beide uitwegen.
- **Info-icoon `info.metingBegrippen`** naast de kop Metingen (register in `beheerpagina.md`, punt 2a).
- **Specs**: De statusregels van Ronde, onderdeel, Naar ronde, Wijzigen en Samengestelde Meting stonden na PR 91 weer op
  voorstel en staan nu op gebouwd. `datamodel.md` verwees naar "Naam van een Meting", die sectie ontbrak: Het Label-punt is
  daarvoor omgeschreven.

**Tests**: 225 (was 222): `naarRonde` alles of niets met onderdeel per Meting en een nieuwe ronde pas bij succes,
`stelOnderdeelVoor`, de naam bij een Meting zonder ronde, en de bestaande tests zonder label.

**Open**:
- De voorstelregel gebruikt alleen de tekst vóór " | ": Een geïmporteerd label als "Legacy-import 2026 Univé Zuid-Nederland"
  geeft "Hele organisatie" en vraagt dus een handmatig onderdeel. Een slimmere afleiding (importprefix weglaten) staat niet
  in de spec.
- `maakScanUitvoering` (met label, `lib/db/metingen.ts`) is niet meer in gebruik door de schermen.

## 2026-10-13 (4) — Specs van Joost, PR 89: Notitie per scan en Scans samenbrengen in één Meting

**Gedaan**:
- **`ScanInvulling.notitie`** (`datamodel.md`, Notitie op de scan): Optioneel veld op de scan (ontbreekt bij oudere data). De import
  zet `start_comment` (oude tool) of `scan_notitie` (eigen export) op de scan en schrijft niet meer naar
  `Respondent.notities`. Een bestaande Respondent houdt zijn eigen notities. `GevalideerdeRij.respondentNotities` is hernoemd
  naar `scanNotitie`. Eerder geplakte notities zijn niet te herstellen: Die scans opnieuw importeren.
- **Notitie zichtbaar**: Kolom Notitie in de lijst Ingevulde scans (sorteerbaar, op één regel met de volledige tekst bij
  hover, `.cel-notitie`), regel Notitie in het Scan-overzicht (alleen als er een is), regel Notitie per kolom bij "Conflict
  oplossen" en een kolom Notitie in de voorbeeldweergave van de import.
- **CSV-export**: Kolom `scan_notitie` direct na `respondent_team`, ook in de AVG-inzage. De import van de eigen export leest
  hem terug, zonder de kolom blijft de notitie leeg.
- **Scans samenbrengen in één Meting** (`beheerpagina.md`, punt 6b): Knop "Samenbrengen in één Meting…" in de
  bulk-actiebalk van de organisatie-gefilterde lijst, uitgeschakeld met `info.scansSamenbrengen` bij een selectie met meer dan
  één Assessment. De modal (`ScansSamenbrengenModal`) heeft bovenaan de doel-Meting (bestaand, of nieuw met Label, Onderdeel
  en Ronde) en per scan een keuze van de Respondent: Dezelfde houden, nieuwe (naam, e-mail, functie, team, leeg) of een
  bestaande. De controle (`lib/samenbrengen.ts`) kijkt naar het eindresultaat, ook voor scans die er al staan, en toont de
  botsing als rode regel bij de scan zelf. Opslaan (`brengScansSamen`, `lib/db/samenbrengen.ts`) is alles of niets en
  werkt per scan `scanUitvoeringId` en `organisatieLidId` bij. Daarna volgt de melding met het aantal scans, de Meting en de
  ronde, en de knop "Lege Metingen verwijderen" (met bevestiging). Bewerkslot op alle scans en Respondenten van de selectie
  zolang de modal open staat. Audit: `respons.metingVerplaatst` per bron-Meting, `respons.respondentGewijzigd` per
  gewijzigde scan, plus `respondent.aangemaakt`, `meting.aangemaakt` en `ronde.aangemaakt`, allemaal met één `groepId`.
- **Specs**: De statusregels staan op gebouwd (`datamodel.md`, `beheerpagina.md`, `import-scans.md`, `export-csv.md`,
  `backlog.md`) en `info.scansSamenbrengen` staat in het register.

**Tests**: 222 (was 212): Notitie per scan bij de import (twee notities onder één Respondent, bestaande notities blijven),
`scan_notitie` in de import en de CSV, en samenbrengen (nieuwe Meting en ronde, alles of niets, scan die er al staat,
e-mailadres in gebruik of dubbel, ander Assessment en bezette combinatie in de ronde, audit zonder persoonsgegevens).

**Open**:
- De lijst-weergave en de modal houden de notitie als platte tekst. Een zoekfilter op de notitie is niet gebouwd (niet gespecificeerd).
- De Respondent wordt bewust niet uit de notitie afgeleid.

## 2026-10-13 (3) — Specs van Joost, PR 86 en 87: Ronde en onderdeel, samengestelde Meting, bereik op de lid-Meting

**Gedaan**:
- **Ronde en onderdeel** (`datamodel.md`, Meting, Ronde en onderdeel): `Ronde` als record op `Organisatie.rondes`, en
  `ScanUitvoering.rondeId`, `onderdeel` en `samenstelling`. Pure helpers in `lib/rondes.ts` (label "{onderdeel} | {ronde}",
  uniekheid per ronde, opruimen van lege rondes en samenstellingen, vergelijkbare Metingen), schrijfacties in
  `lib/db/rondes.ts` (`maakMeting`, `wijzigMeting`, `hernoemRonde`, `naarRonde`, `startNieuweRonde`). Een lege ronde verdwijnt
  vanzelf. Audit: `ronde.aangemaakt`, `ronde.hernoemd`.
- **Organisatie-detail** (`MetingenSectie`): De lijst Metingen is gegroepeerd per ronde met de nieuwste bovenaan en
  "Zonder ronde" onderaan, met "Nieuwe ronde starten", hernoemen met het potlood en "Naar ronde…" voor bestaande Metingen.
  "+ Meting plannen" heeft de velden Ronde en Onderdeel, `MetingWijzigenFormulier` wijzigt label, onderdeel en ronde.
- **Samengestelde Meting** (`benchmark.md`, Onderdeel en samengestelde Meting): Eén ronde, één Assessment, minstens twee
  Metingen, elk even zwaar (`gemiddeldeAntwoordenVoorMetingMetSamenstelling`). Formulier, overzicht met de onderliggende
  Metingen en matrix (E), badge "Gemiddelde", geen Respondenten en niet invulbaar. Verwijderen van een onderliggende Meting
  haalt haar uit de samenstelling en logt `meting.samengesteldVerwijderd`. Op niveau 2 en 3 is een samengestelde Meting geen lid.
  Een niveau 1-lid mag er wel een zijn.
- **Overzicht van een ronde** (`app/beheer/rondes/[rondeId]`): De matrix van één ronde, met de onderdelen als kolommen.
- **Vergelijken** (`visualisatie-scores.md`, C): De voorgestelde vorige Meting is dezelfde combinatie van onderdeel en
  Assessment in de vorige ronde, met de regel "Let op: Dit zijn verschillende onderdelen, het verschil is geen ontwikkeling."
- **Matrix, volgorde van de kolommen** (E): Bij Metingen met verschillende onderdelen staan de kolommen per onderdeel bij
  elkaar en binnen een onderdeel op volgorde van ronde, met onderdeel en ronde in de kop (`sorteerPerOnderdeel`).
- **Import** (`import-scans.md`, Ronde en onderdeel): Elke geïmporteerde Meting krijgt `rondeId` en `onderdeel`. De ronde is het
  importlabel zonder de bronnaam, het onderdeel de bronnaam bij meerdere bronnamen (aanpasbaar per bronnaam in de koppeltabel,
  kolom "Onderdeel") of anders "Hele organisatie". De kolommen `ronde` en `onderdeel` van de eigen export gaan voor. Dezelfde
  Respondent twee keer geeft een eigen ronde met de datum erachter. De rondes van één aanroep krijgen `aangemaaktOp` op
  volgorde van de oudste scan. `bekendeRondes` laat een latere aanroep aansluiten.
- **CSV-export**: De kolommen `ronde` en `onderdeel` staan direct na `meting_label`.
- **Bereik op de lid-Meting, niveau 1** (`benchmark.md`, Bereik van een Lead): Een view van niveau 1 is toe te wijzen aan een
  Lead met bereik op de Meting van de organisatie die als lid in de benchmark zit (`heeftBereikOpLidMeting`). De Lead ziet
  alleen de secties waarvan de lid-Meting binnen zijn bereik valt en die aan de drempel voldoen. Een toewijzing vervalt als het
  bereik wegvalt (`verwijderToewijzingenZonderBereik`) of als de benchmark wordt gewijzigd en de lid-Meting buiten het bereik
  valt (`wijzigBenchmark`). Een toewijzing van vóór de regel, zonder bereik, blijft eenmalig staan met de melding "Deze Lead
  heeft geen bereik op de Meting van deze organisatie in de benchmark". In het blok Toewijzen staat het bereik van de Lead.
  Een samengestelde Meting is in "Lead toevoegen" en het blok Toegang een bewuste keuze, met de badge "Gemiddelde" en de regel
  "Ziet alleen het gemiddelde". Toegang erft niet mee.
- **Specs**: De statusregels van Ronde, onderdeel, samengestelde Meting, import, CSV en de matrix staan op gebouwd
  (`datamodel.md`, `beheerpagina.md`, `benchmark.md`, `import-scans.md`, `export-csv.md`, `visualisatie-scores.md`, `backlog.md`).

**Tests**: 212 (was 183): `lib/rondes.test.ts` (21), import van ronde en onderdeel (6), CSV-kolommen, bereik op de
lid-Meting op niveau 1 (aangepast).

**Open**:
- Een kolom met het verschil binnen een groep per onderdeel in E (open bij Joost).
- Bij een nieuwe ronde de Respondenten meenemen, een eigen peildatum op een ronde en een samengestelde Meting die slechts
  één onderliggende Meting overhoudt (alleen een melding): Niet aangeraakt, zie `backlog.md`.
- Tussen twee aparte imports blijft het aan de beheerder om de oudste eerst te importeren.

## 2026-10-13 (2) — Specs van Joost, PR 84: Organisatie hernoemen, Info-icoon op de regel, matrix op niveau 1

**Gedaan**:
- **Organisatie hernoemen** (`beheerpagina.md` punt 4, `datamodel.md`, Audit): In de kop van het organisatie-detail staat de
  naam met een potlood. Een klik maakt er een invoerveld van met Opslaan en Annuleren. De naam is verplicht en wordt
  getrimd. `hernoemOrganisatie` (`lib/db/organisaties.ts`) wijzigt alleen `Organisatie.naam`, het `id` en de koppelingen
  blijven gelijk, en logt `organisatie.hernoemd` met `oudeNaam` en `nieuweNaam`. Een ongewijzigde naam logt niets. 4 tests.
- **Info-icoon valt nooit van de regel af** (`stylesheet.md`, Info-icoon): Nieuwe klasse `.knop-met-icoon` (knop of veld en
  icoon in één groep zonder afbreken). Toegepast bij Drempels en termijnen (beide formulieren), het blok Toewijzen,
  Respondent bewerken en het formulier voor een benchmark op niveau 3. De velden in de rij mogen krimpen (`min-width: 0`).
  Gemeten op 760px breed: Het icoon staat op dezelfde regel als de knop.
- **Matrix op niveau 1** (`visualisatie-scores.md`, E; `benchmark.md`): `BenchmarkGroepSectie` toont de matrix nu ook bij een
  benchmark tussen organisaties, met organisaties als kolommen (naam, label van de Meting en aantal scans). De tegels heten
  Hoogste en Laagste organisatie. Bij veel kolommen scrolt de matrix horizontaal met een vaste eerste kolom (voorstel van
  Joost). Alleen voor de Admin.
- **Opmerking over de testomgeving**: Door een herstart van de preview haalde de browser de organisaties opnieuw uit Neon.
  In de benchmark "vb" ontbrak daardoor het lid Univé (de Meting stond alleen lokaal): De matrix toont twee kolommen.

## 2026-10-13 — Specs van Joost van 12 oktober (PR 74): Rol / functie, Bereik van een Lead, Instellingen, Mijn account, visualisatie van scores

**Gedaan**:
- **`datamodel.md` hersteld**: Joosts commit `1634e38` had de Techstack-sectie teruggezet naar de stand van vóór `aefa956`
  (zes categorieën, zelf/extern, IT en deployment). Hersteld naar de huidige stand, zonder de lijsten te herhalen: Die staan
  in `content-techstack.md` (zoals Joost bedoelde). `VeldDefinitie` heeft weer `voorop` en `eigenOptiePlaceholder`, en
  `toonAlsBroer` is vervallen.
- **Rol / functie als keuzelijst** (`content-respondentrol.md`, 29 rollen): Eén gedeeld component
  `KeuzelijstMetEigenOptie` voor Techstack en Rol / functie (`RespondentFunctieKeuze`), in de intake, "Mijn gegevens",
  Respondent bewerken, Conflict oplossen en "Andere Respondent koppelen". Aangeleverde volgorde, "Anders…" onderaan,
  eigen invoer en bestaande vrije tekst komen vanzelf in de lijst. `data/respondent-rollen.ts` wordt door een test
  gelijk gehouden aan het contentbestand. Het veld blijft verplicht, zoals het was (open punt bij Joost).
- **Bereik van een Lead** (`datamodel.md` deel 2, `benchmark.md`, `beheerpagina.md` punt 6a): `OrganisatieLid.leadVoorOrganisatie`,
  gedeelde hulpfuncties in `lib/lead.ts` (`isLead`, `leadMetingIdsVan`, `heeftBereikOpOrganisatie`, `heeftBereikOpMeting`).
  - Formulier "Lead toevoegen" (`LeadToevoegenFormulier`) en blok Toegang: Specifieke Metingen of Hele organisatie, met de
    vaste waarschuwing (`.admin-notice`, zonder bevestiging). Wisselen van bereik bewaart de gekozen Metingen, pas het
    intrekken wist ze. `zetLeadBereik` vervangt `zetLeadMetingen` (die blijft als wrapper).
  - "Lead" is `leadVoorOrganisatie` of minstens één Meting: badge, lijsten, Mijn metingen, resultaten en benchmark.
  - Verplaatsen, samenvoegen, importeren en nieuwe Respondenten maken `leadVoorOrganisatie` leeg.
  - Benchmark: Niveau 1 vraagt een Lead voor de hele organisatie, niveau 2 en 3 bereik op de Meting. Een toewijzing vervalt op
    elk niveau als het bereik wegvalt (`verwijderToewijzingenZonderBereik`). Een niveau 1-toewijzing van vóór het bereik blijft
    eenmalig staan, met de melding "Deze Lead heeft geen bereik op deze organisatie". Het blok Toewijzen toont het bereik van
    de Lead, "Geen Lead met bereik op {…}" en "+ Lead toevoegen" als modal met het bereik voorgekozen.
  - `viewsVoorLead` en `leadViewVoorToewijzing` nemen nu het bereik van de Lead in plaats van `leadMetingIds`.
- **Andere Respondent koppelen** in het Scan-overzicht (`AndereRespondentKoppelenStap`): Hergebruikt
  `koppelScanAanAndereRespondent`. Een Respondent met al een scan in de Meting is niet te kiezen en de lijst zegt waarom.
  Bij Respondent bewerken staat de vaste regel "Deze wijziging geldt voor alle {n} scans van {naam} bij {organisatie}".
- **Instellingen in het Accountmenu**: "Applicatie" is geen hoofdlink meer. Het Accountmenu heeft "Mijn account",
  "Instellingen" (Admin) en "Uitloggen" met een scheidingslijn, rechts uitgelijnd, met actieve staat zolang een pagina onder
  Instellingen open is. Tabbalk: Gebruikers (landing), Drempels en termijnen (was Instellingen, `/beheer/drempels`), Algemene
  teksten, Content-pagina's (nog een lege pagina), Audit-log en Data-integriteit (`/beheer/data-integriteit`). `/beheer/applicatie`
  en `/beheer/instellingen` sturen door. Het menu volgt het toetsenbord (pijltjes, Esc).
- **Mijn account** (`MijnAccountModal`): Naam wijzigen, e-mailadres en rol alleen-lezen, "Wachtwoord wijzigen" uitgeschakeld
  met Info-icoon (komt met de echte inlog), recht `account.bewerken` en audit `gebruiker.eigenGegevensGewijzigd`.
- **Visualisatie van hoge en lage scores** (`visualisatie-scores.md`, A tot en met E): Berekeningen in `lib/visualisatie.ts`,
  weergaven in `components/visualisatie/`, de schakelaar `.weergave-wissel`.
  - Resultatenpagina van een Meting: Overzicht, Per bouwblok (A) en Spreiding (B), de vergelijking met een vorige Meting (C)
    en "Bekijk in benchmark" (Admin). De weergave staat in de adresbalk.
  - Resultatenpagina van één scan: "Scores van deze scan" en "Positie in de Meting" (B met ring), uitgeschakeld onder
    `benchmarkMinRespondenten` met `info.positieMeting`.
  - Benchmark: D vervangt de lijst met het verschil per bouwblok op niveau 1 en bij de view per Meting, B op niveau 3, en
    E is de matrix op niveau 2. Een Lead ziet D en B alleen via een toegewezen view.
  - Tests: 131 → 179, onder meer voor de berekeningen (kwartielen zoals `KWARTIEL.INC`, steekproef-standaardafwijking,
    klassewissel), het Lead-bereik (wisselen, verplaatsen, vervallen van toewijzingen) en de rollenlijst.
- **Blok Toewijzen zonder Lead met bereik**: De melding "Geen Lead met bereik op {organisatie of Meting}" staat nu in de
  keuzelijst zelf (zoals `benchmark.md` zegt), niet ernaast en niet naast "Geen Lead beschikbaar". Eén keer.
- **Statusregels in de specs** op "gebouwd op 13 oktober 2026" gezet, en twee nieuwe Info-teksten in het register
  (`info.positieMeting`, `info.mijnAccountWachtwoord`).

**Niet gedaan / open**:
- Export van de nieuwe weergaven (PDF, CSV, InDesign).
- De spreidingsgrenzen (0,55 en 0,8) staan als constante. Joosts open punten (drempel voor de band in D, namen bij een
  stip in B, meer dan twee Metingen in C) zijn niet aangeraakt.
- Content-pagina's (`beheerpagina.md`, punt 11) en het wachtwoord in Mijn account wachten op overleg en de echte inlog.

## 2026-10-12 — Techstack: keuzelijsten voor Contact center, Conversational AI, CRM, Kennismanagement en WFM

**Gedaan** (op verzoek van Sander, nog niet in een spec van Joost; `datamodel.md` is bijgewerkt):
- **WFM is een nieuwe, zevende Techstack-categorie** (`techstackCategorieen`, id `techstack-wfm`), in het formulier direct
  onder Contact center, met 20 vaste opties. Daardoor krijgt de InDesign-export een element `techstackWfm`
  (`lib/indesign/kenmerken-xml.ts`, `export-indesign.md`, voorbeeld en telling). Het aantal elementen in de spec
  stond op 24, de code had er 26, nu 27. Een bestaand InDesign-sjabloon moet het nieuwe element nog taggen. De CSV
  heeft geen eigen kolom: De kenmerken zitten daar als geheel in, dus WFM komt daar vanzelf in mee.
- **Oplossing bij Techstack, Contact center (19 opties), Conversational AI (14), CRM (17), Kennismanagement (14) en
  WFM (20)**
  (`data/organisatie-velden.ts`, `techstackOplossingen`) is een keuzelijst op alfabet met "Anders…" onderaan. Bij
  "Anders…" verschijnt een invoerveld (`Naam van de oplossing`) dat bij Enter of bij het verlaten van het veld wordt
  bewaard. Een nieuwe lijst voor een categorie is één regel in `techstackOplossingen`.
- **Nieuw veldtype-vlag** `VeldDefinitie.eigenOptie` (`lib/types.ts`) en component `SelectMetEigenOptie` in
  `components/beheer/KenmerkenForm.tsx`. Elk `select`-veld kan er nu mee worden ingericht.
- **Eigen invoer komt in de lijst** zonder aparte opslag (`lib/kenmerken-opties.ts`): De lijst is de vaste lijst plus
  alles wat organisaties op dat veld hebben ingevuld. Getrimd, zonder dubbelen op hoofdletters (de spelling van de
  vaste optie wint). Bestaande vrije tekst, bijvoorbeeld "Genesys" in de demo-organisatie, verschijnt zo vanzelf als
  keuze. Gevolg: Gebruikt geen enkele organisatie een eigen waarde meer, dan verdwijnt hij uit de lijst.
- **"Ondersteund door" vervangt zelf/extern** bij Contact center, WFM, Conversational AI, CRM en Kennismanagement:
  Eén keuzelijst per categorie met "Geen ondersteuning" (= zelf) als eerste keuze, daarna 25 partijen op alfabet
  (Sabio, Coniche, Frontline, Accenture, KPN enz.) en "Anders…" onderaan. Eerst was dit een tweede veld bij "extern"
  (`toonAlsBroer`), dat is na Sanders aanpassing weer verwijderd. Nieuw: `VeldDefinitie.voorop` (opties die bovenaan
  blijven, niet alfabetisch) en `eigenOptiePlaceholder`, `lib/techstack.ts` (`GEEN_ONDERSTEUNING`,
  `ondersteuningVan`, `migreerTechstackOndersteuning`). De bovenste lijst in het aangeleverde bericht stond onder de
  kop "CCO", die heb ik als Contact center gelezen.
- **Bestaande data**: Bij het laden wordt `ondersteuning: "zelf"` omgezet naar `ondersteuner: "Geen ondersteuning"`
  (`lib/db/store.ts`, zonder aparte migratiestap). Een oude `extern` zonder bekende partij blijft staan tot er een
  partij is gekozen. In de InDesign-export is `ondersteuning` nu afgeleid (`zelf` bij "Geen ondersteuning", `extern`
  bij een partij), dus het sjabloon merkt niets. De partij zelf zit er **nog niet** in. In de CSV zit het veld al, in
  de JSON-kolom met de kenmerken. Bij LLM-oplossing is dat veld later weggehaald, zie hierboven.
- **Volgorde van de techstack-categorieën** (op verzoek van Sander): Contact center, WFM, CRM, Kennismanagement,
  Conversational AI, LLM-oplossing (`techstackCategorieen`). Alleen het formulier: De volgorde van de elementen in de
  InDesign-export is niet veranderd, het sjabloon koppelt op elementnaam.
- **LLM-oplossing krijgt eigen velden**: "LLM (modelfamilie)" (16 opties, opgeslagen als `leverancier`) en
  "LLM-toegangsroute" (7 opties, `toegangsroute`), beide keuzelijsten met "Anders…" in aangeleverde volgorde. Geen
  "Ondersteund door", Deploymentmodel en Cloudleverancier meer bij LLM. Het oude veld zelf/extern is daar weg, dus de
  InDesign-export zet `ondersteuning` bij `techstackLlmOplossing` altijd op "n.v.t." (een oude opgeslagen waarde
  komt niet meer mee). Deploymentmodel en Cloudleverancier staan bij de andere vijf categorieën. De toegangsroute zit
  nog niet in de InDesign-export. Alle zes categorieën hebben nu een keuzelijst voor de Oplossing.
- **Categorie "IT en deployment" vervallen** (op verzoek van Sander): Er zijn nu zes techstack-categorieën. Deployment
  en cloud staan als velden Deploymentmodel en Cloudleverancier bij elke categorie. Uit de InDesign-export is het
  element `techstackItDeployment` gehaald (26 elementen, was 27). Een bestaand sjabloon dat dat element tagt, moet
  de tag loslaten. Bestaande waarden onder `techstack-it-en-deployment` in opgeslagen organisaties worden niet
  gewist: Ze staan nog in de data (en in de JSON-kolom van de CSV) maar niet meer in het formulier.
- **CRM, ondersteunende partijen**: De BPO's Concentrix, Teleperformance en Yource zijn eruit en BusinessBase is
  erbij, dus 23 partijen. De andere vier categorieën zijn niet aangepast. KPN, VodafoneZiggo Zakelijk en Odido
  Business staan er nog in (telecomproviders, niet als BPO gerekend).
- **Deploymentmodel (9 opties) en Cloudleverancier (20 opties)** bij elke techstack-categorie, op dezelfde regel
  achter Oplossing en Ondersteund door (vier velden naast elkaar, elk 192px). Keuzelijsten met "Anders…", in de
  aangeleverde volgorde (`voorop` met de hele lijst) en eigen invoer daarna op alfabet. Opgeslagen als
  `deploymentmodel` en `cloudleverancier`. Nog niet in de InDesign-export.
- **Demo-organisatie** (`data/demo-organisatie.ts`) gebruikt nu lijstwaarden (Genesys Cloud, Sabio, Seamly,
  Salesforce Service Cloud).
- **Waarde blijft een gewone tekst**, dus de InDesign-export (`techstackContactCenter leverancier`) en de CSV
  veranderen niet.
- 5 nieuwe tests (110 in totaal): paden, verzamelen, alfabetische lijst, huidige waarde, spelling.

## 2026-10-12 — Assessment verwijderen: plek op de kaart en tekst van het Info-icoon

**Gedaan** (spec van Joost, PR 69, `beheerpagina.md` punt 1 en het Info-register):
- **Kaart in de Assessment-lijst** (`app/beheer/content/page.tsx`, `.admin-row-groep` en `.admin-row-link` in
  `admin.css`): De kaart is nu de wrapper over de volle breedte van de lijst, met de link als vulling en de knop
  "Verwijderen" in een eigen laatste kolom, rechts uitgelijnd en verticaal gecentreerd. Eerder stond de knop naast de
  kaart en was die even breed als de inhoud. Gemeten: 3 kaarten van 896px, knop op elke rij op dezelfde plek.
- **Vaste plek voor het Info-icoon** (spec van Joost, PR 72): Naast de knop staat een kolom van `1.25rem` met `0.5rem`
  ruimte ervoor (`.assessment-verwijderen-icoonplek`), ook als er geen icoon is. Gemeten: Actieve en uitgeschakelde
  knop zijn allebei 121,9 × 38,4px en eindigen op 48,2px van de kaartrand, met of zonder icoon.
- **Telregel onder de knop weg** (`components/beheer/AssessmentVerwijderen.tsx`). De zin komt nu uit de app zelf als
  eerste zin van het Info-icoon: "Dit Assessment kan niet worden verwijderd, want er zijn nog {n} Metingen bij {m}
  organisaties." (enkelvoud: "er is nog 1 Meting bij 1 organisatie"). `InfoIcoon` kreeg daarvoor een prop `voorloop`:
  de zin staat voor de tekst, is niet aanpasbaar, staat in de bewerkstand alleen-lezen boven het tekstvak en telt
  niet mee in de 500 tekens.
- **`info.assessmentVerwijderen` stond niet in `data/info-teksten.ts`**: Het icoon had dus geen standaardtekst.
  Toegevoegd met de tekst uit het register. De laatste zin uit het register ("De tekst begint altijd met het aantal
  Metingen en organisaties, die zin maakt de app zelf") is een uitleg voor de bouwer en staat niet in de
  standaardtekst, omdat een Admin hem anders in het icoon ziet. Aan Joost bevestigd te krijgen.

## 2026-10-08 — Tabbladtitel, Inloggen op elke publieke pagina, Coniche-favicon, Content-iconen

**Gedaan**:
- **Tabbladtitel** `<Paginanaam> | Coniche Scan` (`stylesheet.md`, Browsericoon): Eén lijst met routes en namen
  (`data/pagina-titels.ts`) en één component in de root-layout (`components/PaginaTitel.tsx`), omdat bijna alle
  pagina's client-componenten zijn en geen `metadata` kunnen exporteren. Next zet bij een verse laadbeurt zijn
  eigen titel er na de hydratie overheen, dus het component zet de titel terug zodra die afwijkt.
- **"Inloggen" rechtsboven** (`CLAUDE.md`, Globale layout, punt 7): Stond alleen op scherm 1. Nu zet
  `PageWithChrome` het standaard in het identiteitsmenu-slot zodra er geen menu en geen `code` is, dus ook op de
  4 content-pagina's zonder sessie, de privacypagina, de landingspagina en Toegang.
- **Coniche-favicon**: `app/favicon.ico`, `app/icon.svg` en `app/apple-icon.png` uit `afbeeldingen/`.
- **Content-lijst**: Assessment-icoon in een oranje rondje (`.assessment-icoon-rond`, `stylesheet.md`,
  Assessment-icoon).
- **Bulk-export** volgens de specs van 7 oktober (zie hieronder bij 7 oktober).
- **Specs van Joost, 8 oktober (PR 49)**:
  - **`ScanInvulling.aangemaaktOp`** (`datamodel.md`): Het moment waarop de regel in de app is aangemaakt, bij een
    import het importmoment (één waarde per import, niet de datum uit het bestand). Gezet bij uitnodigen
    (`maakInvulling`), bij een import en in de demodata. Bestaande data zonder het veld valt terug op
    `uitgenodigdOp` (`normaliseerOrganisatie`). Nieuwe kolom "Aangemaakt" in Ingevulde scans (sorteerbaar) en
    `aangemaakt_op` in de CSV, tussen `status` en `uitgenodigd_op`. De import leest de kolom niet in.
  - **Periodeknoppen even breed** (`.knoppen-gelijk`, `stylesheet.md`, Gelijke breedte): `inline-grid` met
    `grid-auto-columns: 1fr`, alle zes de knoppen 113px.
  - **Audit-log**: Een gewone rij heeft geen "Meer"-knop en geen uitklapblok meer, dus geen ID's of ruwe JSON in de
    app (die staan alleen in de export). Een uitgeklapte importgroep toont een tabel (Bestand, Rij, Assessment,
    Organisatie, Respondent, Status-badge), afgeleid door `importRegels` in `lib/audit-weergave.ts`. Voor die tabel
    logt `import.gestart` nu ook een lijst `rijen` (bestand, rij, assessment, organisatie) en `scan.geimporteerd`
    of de Respondent nieuw was (`respondentNieuw`), en `import.rijMislukt` ook assessment en organisatie. De
    Respondent-kolom toont "Nieuw" of "Gevonden", nooit een naam of e-mailadres (geen persoonsgegevens in de
    audit-log). Oudere groepen zonder rijenlijst tonen alleen wat er gebeurde. De melding en de knop "Toon 30
    dagen" bij een lege periode zijn weg.
  - 4 nieuwe tests (52 → 56): `aangemaakt_op` in de CSV, `importRegels` (twee) en `aangemaaktOp` bij een import.
- **Benchmark gebouwd** (`benchmark.md`, `datamodel.md` deel 3, `beheerpagina.md` punt 14; spec van Joost, 8 oktober,
  status daar nog "Voorstel"):
  - **Records en opslag**: `Benchmark`, `BenchmarkLid` en `BenchmarkToewijzing` in `lib/types.ts`, opslag in
    `lib/benchmark-store.ts` (localStorage-sleutel `coniche-scan:benchmarks`, alleen in deze browser: de Neon-tabel kent
    de sleutel niet, net als bij de audit-log). `Organisatie.benchmarkToegestaan` (standaard `false`) en de instellingen
    `benchmarkMinOrganisaties` (5) en `benchmarkMinScans` (3).
  - **Berekening** (`lib/benchmark.ts`, pure functies, gedeelde scorefunctie): Per organisatie het gemiddelde per vraag
    over de afgeronde scans van de gekozen Meting, daarna het gemiddelde over de organisaties, dus elke organisatie telt
    even zwaar. De view van organisatie X zet haar naast de rest van de groep zonder X zelf. De teller is "X van Y
    organisaties".
  - **Admin** (Admin-only, `magBenchmarkBeheren`, vierde link in de nav): Lijst, aanmaken en wijzigen (Assessments, dan
    organisaties met sectorfilter en de Meting per Assessment, met de teller die oranje wordt onder de drempel), detail
    met een sectie per Assessment (gemiddelden per categorie, bouwblok en vraag), de view per organisatie, en toewijzen
    aan en intrekken bij een Lead. Verwijderen noemt het aantal toewijzingen.
  - **Lead**: Op "Mijn metingen" een kaart per toegewezen view, alleen als er een sectie te zien is: Het Assessment moet aan
    de drempel voldoen en de Lead moet de Meting van zijn organisatie mogen inzien. De Lead-pagina toont nooit namen
    van andere organisaties en ook niet de naam van de benchmark (vrije tekst van een Admin).
  - **Vlag** op het organisatie-detail (alleen Admin, `BenchmarkVlag`), met een bevestiging die het aantal benchmarks noemt.
  - **Opruimen** (`datamodel.md`, Verwijderen en datakoppelingen): Een Meting weg haalt het lid uit de benchmark, een
    Organisatie weg haalt leden en toewijzingen weg, een Respondent met Lead-rol weg of verplaatst haalt zijn toewijzingen
    weg, de vlag uitzetten haalt de organisatie uit alle benchmarks. De beheerweergave meldt dat (`Benchmark.meldingen`,
    een hulp voor het scherm, niet in het datamodel). De bevestigingen bij het verwijderen van een Meting en Organisatie
    noemen het.
  - **Audit**: `benchmark.aangemaakt`, `.gewijzigd` (ook automatisch, met reden), `.verwijderd`, `.toegewezen`,
    `.toewijzingIngetrokken` en `organisatie.benchmarkVlagGewijzigd`, zonder gegevens van de Lead. Drie Info-iconen
    (`info.benchmarkInstellingen`, `.benchmarkVlag`, `.benchmarkToewijzen`), ook in het register in `beheerpagina.md`.
  - **Waarom een organisatie ontbreekt**: Het formulier toont onder de lijst per organisatie met de vlag die niet te kiezen
    is de reden (geen Meting van het Assessment, of te weinig afgeronde scans in één Meting, `nietTeKiezenOrganisaties`).
    De teller verschijnt pas zodra er een organisatie gekozen is. Achter de uitgeschakelde knop "Benchmark aanmaken" staat
    een Info-icoon (`info.benchmarkAanmaken`) met wat er nodig is: Een naam, een Assessment en een aangevinkte organisatie.
  - **Niet gebouwd** (staat ook zo in `benchmark.md`): Export van een benchmark, rechten voor een Consultant, een
    vastgezette versie in plaats van live cijfers, de range van de groep als band, en berekenen op de server. Zolang de
    berekening in de browser draait, staan de gegevens van alle organisaties in de browser van een Lead: Dat is een
    prototype-beperking (`backlog.md`, Benchmark op de server berekenen).
  - **Afwijking van de spec**: Het groepsgemiddelde staat in de staafdiagrammen als tweede, neutrale balk naast die van de
    organisatie, niet als markering. De toestemmingstekst in de intake en de disclaimer in `privacy-pagina.md` (sectie 3a)
    zijn niet aangepast: De formulering volgt volgens de spec nog.
  - 15 nieuwe tests (56 → 71 totaal): De berekening, de keuzelijst, de view, de drempel, de Lead-regels en de
    opruimregels.
- **Verplaatste scans en import per bronnaam** (specs van Joost, 8 oktober, PR 67):
  - **Fout hersteld**: Een scan heeft twee verwijzingen, naar zijn Respondent (`organisatieLidId`) en naar zijn Meting
    (`scanUitvoeringId`). Elke verplaatsing in `lib/db/verplaatsen.ts` (hele Respondent, losse respons naar een andere
    organisatie en naar een andere Meting) werkte alleen de eerste bij. Nu beide. Daardoor meldde de
    data-integriteitscontrole een correct verplaatste scan als "zonder Meting", en kon een scan via die controle worden
    verwijderd.
  - **Bestaande data hersteld bij het laden** (`normaliseerOrganisatie`): De Meting waarin een scan staat is de juiste, dus
    `scanUitvoeringId` wordt daarop gezet, ook in de kopie die uit Neon komt. Gevolg: De controle "Ingevulde scans zonder
    bestaande Meting" kan niet meer voorkomen, want een scan die in een Meting staat, heeft die Meting. De controle
    blijft staan. Scans die al via die controle zijn verwijderd, komen hierdoor niet terug.
  - **Import, een Meting per bronnaam** (`import-scans.md`, Meting): Rijen delen een Meting als doelorganisatie, Assessment,
    bronnaam (de organisatienaam uit het bestand, getrimd) en label overeenkomen. Zijn er twee of meer bronnamen aan
    dezelfde organisatie gekoppeld, dan krijgt het label de bronnaam erachter ("Legacy-import 2026 Onderdeel A"); bij
    één bronnaam blijft het label zoals het was. De importpagina bepaalt dat over de hele import
    (`bronnamenPerDoel`), de import zelf krijgt `bronnaam`, `bronnaamInLabel` en `bekendeMetingen` mee.
  - **Eén scan per Respondent per Meting**: Heeft een Respondent in de gevonden Meting al een scan, dan krijgt de scan een eigen
    Meting met de datum erachter ("... (14-01-2026)"), en bij dezelfde datum een volgnummer ("(2)"). De datum komt van
    `created_at` (`gestartOp`). Een latere, aparte aanroep sluit aan via de labels die de import terugmeldt.
  - 7 nieuwe tests (97 → 104 totaal), en een aangepaste verwachting in de integriteitstest.
- **Toewijzen op alle benchmarkniveaus, drempels per niveau en Assessment verwijderen** (specs van Joost, 8 oktober,
  PR 65):
  - **Toewijzen aan een Lead op niveau 2 en 3**: Het blok "Toewijzen aan een Lead" (`ToewijzenBlok`) staat nu op elke view en is
    gelijk op alle niveaus: De Leads aan wie de view is toegewezen met de datum en "Bekijk" en "Intrekken", en een
    keuzelijst met de Leads die in aanmerking komen. Niveau 1 een Lead van de organisatie, niveau 2 en 3 een Lead op de
    Meting (`leadMetingIds`). "Bekijk" opent het Respondent-overzicht van de Lead over de pagina heen (ook op niveau 1,
    daar was het nog niet gebouwd). Zonder Lead staat er "Geen Lead beschikbaar" met de reden en een uitgeschakelde knop
    (`info.benchmarkToewijzen`). Op niveau 3 noemt het blok dat de Lead de scores van deze Respondent ziet.
  - **Opslag**: `BenchmarkToewijzing.metingId` en `onderwerpRespondentId`, uniek per benchmark, onderwerp en Lead. Het audit-log
    noemt het niveau en het label van de Meting, nooit de Respondent of de Lead.
  - **Vervallen**: Een toewijzing vervalt als de Meting uit de benchmark valt of wordt verwijderd, als de scan of de
    Respondent van de view wordt verwijderd, als de Lead wordt verwijderd of de Lead-rol op de Meting verliest (niveau 2 en
    3), of als de benchmark zo wordt gewijzigd dat het lid niet meer meedoet.
  - **Lead-view op alle niveaus** (`leadViewVoorToewijzing`): De Lead moet de Meting mogen inzien en de groep moet aan de drempel
    van het niveau voldoen, anders staat er niets. De view bevat alleen het lid zelf en aggregaten, nooit een ander lid
    (geen rij met organisatie en Metingen). Op niveau 3 staat de naam van de Respondent van de scan erbij.
  - **Drempels per niveau** (Instellingen): `benchmarkMinMetingen` (niveau 2, 3) en `benchmarkMinRespondenten` (niveau 3,
    5). De waarschuwing onder de ondergrens op niveau 3 gebruikt nu de laatste in plaats van `benchmarkMinScans`.
  - **Assessment verwijderen** (`lib/assessment-verwijderen.ts`, `AssessmentVerwijderen`): Alleen als er geen enkele Meting van is, bij
    welke organisatie dan ook. De controle staat in de gegevenslaag en wordt bij bevestigen herhaald. De knop is
    uitgeschakeld met een Info-icoon en "3 Metingen bij 1 organisatie". De bevestiging noemt de aantallen categorieën,
    bouwblokken en vragen, de benchmarks waaruit het wordt gehaald (met een melding daar) en de afgeleide Assessments,
    waarvan alleen `afgeleidVanAssessmentId` op `null` gaat. Gelogd als `assessment.verwijderd`. De kaart in de lijst
    staat nu in een rij met de knop ernaast, omdat een knop niet in de link zelf mag.
  - **Testknop**: "Gemiddelde score" is een keuzelijst met 2, 3 en 4 in plaats van een invulveld.
  - **Knoppen in het blok Toewijzen**: "Bekijk" en "Intrekken" staan naast elkaar in `.knoppen-gelijk`, even breed (de breedste)
    en rechts in de laatste kolom, in plaats van onder elkaar. `.knoppen-gelijk` heeft nu `width: max-content`, anders
    blijft elke knop in een smalle tabelkolom op zijn eigen breedte.
  - 13 nieuwe tests (84 → 97 totaal).
- **Benchmark niveau 2 en 3 gebouwd** (`benchmark.md`, Niveau 2 en 3; spec van Joost, 8 oktober, daar nog "voorstel"):
  - **Niveau**: `Benchmark.niveau` (`organisaties` | `metingen` | `scans`, ontbreekt = `organisaties`). Bij aanmaken kiest de
    Admin eerst het niveau; het niveau staat vast na het aanmaken. De lijst heeft een kolom Niveau.
  - **Niveau 2, binnen een organisatie** (`MetingenBenchmarkForm`): Eerst één organisatie (zonder vlag), dan de Assessments
    en per Assessment minstens twee Metingen met minimaal `benchmarkMinScans` afgeronde scans. Meerdere leden per
    Assessment, een Meting hoogstens één keer. De teller is "N Metingen" (geen Y), de sectie toont het gemiddelde van
    de Metingen met per Meting haar eigen score, en de view per Meting (`/beheer/benchmark/[id]/meting/[metingId]`) zet
    de Meting naast de overige Metingen zonder zichzelf, met de labels als namen.
  - **Niveau 3, binnen een Meting** (`ScanBenchmarkForm`): Eén organisatie, Assessment en Meting. De sectie toont de
    afgeronde scans met de naam van de Respondent en de overall score, en de view per scan
    (`/beheer/benchmark/[id]/scan/[invullingId]`) zet de scan naast het gemiddelde van de andere scans in de Meting,
    elke scan even zwaar. De ondergrens is `benchmarkMinScans` inclusief de scan zelf (voorstel in de spec): Eronder
    staat een waarschuwing. Opgeslagen als benchmark met niveau `scans` en één lid, de Meting.
  - **Rekenen**: Dezelfde gedeelde rekenregel voor alle niveaus (`maakVergelijking` in `lib/benchmark.ts`), de view per
    lid is `VergelijkingsView`. `BenchmarkOrganisatieView` heeft teksten per niveau (overige Metingen, overige scans).
  - **Vlag en opruimen**: De vlag `benchmarkToegestaan` geldt alleen voor niveau 1: Uitzetten haalt de organisatie alleen uit
    de benchmarks tussen organisaties en de bevestiging telt alleen die. Een Meting of Organisatie verwijderen haalt het
    lid uit elk niveau. Audit-events bevatten het niveau en bij niveau 2 en 3 de labels van de Metingen. Geen
    toewijzen aan een Lead en geen Lead-view op niveau 2 en 3 (open punt in de spec).
  - **Niet gebouwd**: De spreiding per bouwblok en het zichtbaar maken van hoge en lage scores op niveau 3 (nog niet
    ontworpen), een samengestelde Meting, en export. Twee nieuwe Info-iconen
    (`info.benchmarkAanmakenMetingen`, `info.benchmarkAanmakenScans`), ook in het register.
  - 12 nieuwe tests (72 → 84 totaal).
- **Eén kop op de Organisatie-resultaten** (`beheerpagina.md`, punt 4; spec van Joost, 8 oktober): Bovenaan het
  Meting-label als eyebrow, dan de naam van het Assessment als titel, dan "Gemiddelde over N afgeronde
  respondenten". `ResultsView` heeft een prop `toonKop` (standaard aan): Uit laat hij de tweede titel en de
  voortgangsregel ("60 van 60 vragen beantwoord") weg. Beide staan alleen nog op het resultatenscherm van één scan
  (beheer en respondent) en in de voorbeeld-output. Ook de resultatenpagina van een Lead (`/s/[code]/resultaten/…`)
  gebruikt dezelfde weergave en had dezelfde dubbele kop, dus die is meegenomen.
- **Zorgscan-gewichten weer op 2** (branch `code/zorgscan-gewichten-8-okt` van Joost, gemerged): Bouwblok 4, 10 en
  11 in `data/zorgscan-assessment.ts`, conform de spec. De seed geldt alleen voor een lege opslag: Een al opgeslagen
  Zorgscan (localStorage en Neon) houdt zijn gewichten tot een Admin ze aanpast bij Content (wordt gelogd als
  `bouwblok.gewichtGewijzigd`). `lib/weging.test.tsx` verwacht nu dat alleen de Zorgscan-seed afwijkende gewichten
  heeft.
- **Dropdowns** (`stylesheet.md`, Formulieren, Dropdowns, en Dropdown-knop; specs van Joost, 8 oktober): Eén
  gevulde chevron overal (`.65rem` breed, driehoek met de punt naar beneden). In de Dropdown-knop is het een
  CSS-vorm met `currentColor` (`.dropdown-pijl`, oranje in een outline-knop), in `select.field`,
  `.admin-field select` en `select.veld-compact` een achtergrondafbeelding in `--ink-m` (`appearance: none`,
  `.875rem` van de rechterrand, `padding-right: 2.5rem`, focusrand zoals `.field`). Het blok staat onderaan
  `admin.css`, omdat `.admin-field select` daar zelf `padding` en `background` zet. Het pijltje staat `.5rem`
  achter de tekst.
- **Tekst in besturingselementen** (`stylesheet.md`, Typografie): In filterrijen (`.filter-rij`, op Ingevulde
  scans, Respondenten, Audit-log en de Meting-plannen-rij) en in tabellen zijn `select` en invoerveld `--fs-s`,
  gewicht 400. Menu-opties zijn gewicht 400 in Epilogue.
- **14px in beheer** (Sander, 8 oktober): In de beheeromgeving zijn `--fs-s` en `--fs-m` beide `.875rem`
  (`body:has(.admin-main)` in `admin.css`, ook voor de Tailwind-varianten `--text-sm` en `--text-base`), en gewone
  `p`-tekst, zoals de introregel onder een titel, is `--fs-m` in plaats van de 16px van de browser. Op `body`
  zodat modals en Info-velden meekomen. De respondentkant houdt `.85rem` en `.9rem`. **De spec zegt dit nog niet**:
  `stylesheet.md` noemt twee maten (13,6 en 14,4px) en geen beheer-uitzondering.
- **Datumveld**: `input[type="date"]` heeft dezelfde hoogte, rand en padding als een dropdown (`--control-h`,
  `box-sizing: border-box`, `--fs-s`). In de Audit-log staan de labels en velden op dezelfde bovenrand.
- **Info-icoon naast een titel** (`.titel-rij`, Audit-log en Algemene teksten): Het icoon staat gecentreerd op de
  titel. De onderrand van de `h1` telde mee bij het centreren (18px) en zette het icoon 9px te laag, dus staat die
  nu op de rij.

## 2026-10-07 — Specwijzigingen van 7 oktober, lijstknoppen, AVG-inzage als CSV, Azure-plan

**Aanleiding**: Sander liet de gewijzigde specs (`CLAUDE.md`, `beheerpagina.md`, `import-scans.md`,
`stylesheet.md`, daarna `datamodel.md`, `export-csv.md`) per wijziging langslopen, met goedkeuring per punt.

**Gedaan** (commit `56076bf` en daarna):
- **Inlogscherm** zonder rolkeuze: De rol volgt uit het account (`login(email, wachtwoord)`).
- **`.btn-outline`**: Witte vulling, `2px` oranje rand en tekst, hover `--bg-warm`.
- **Info-icoon**: Wit rondje met `1px` oranje rand en een oranje "i", geen hover-staat.
- **Import alleen voor een Admin** (`magImporteren`): Een Consultant ziet op de tab Import een melding
  ("Vraag de beheerder om bestanden te importeren."), de route is dicht en `voerLegacyImportUit`
  weigert een verzoek van een Consultant (`geweigerd`). Twee tests.
- **Knop in een lijstrij**: "Bekijk" en "Meer" in een eigen laatste kolom (`td.cel-knop`), rechts uitgelijnd
  en verticaal gecentreerd, ook in de audit-log.
- **Gestapelde knoppen** (`.knoppenstapel`) met gelijke breedte: Verwijderen en Verlengen bij "Data ouder dan
  de bewaartermijn".
- **"+ Lead toevoegen"** als oranje knop onder de lijst Respondenten, het formulier opent pas na een klik.
- **AVG-inzage als CSV** (`genereerInzageCsv`, `export-csv.md`, Inzage): Eén rij per scan, extra kolommen
  `respondent_notities` en `respondent_aangemaakt_op`, geen organisatiekenmerken of toegangscode, bestandsnaam
  `Inzage <Organisatie> - <Respondent> - <datum>.csv`, log `respondent.inzage` (met organisatienaam, naast het
  aantal scans, een kleine uitbreiding op de spec).
- **CSV `groepsScores`** met per bouwblok `nummer`, `naam`, `score` en `gewicht` (altijd aanwezig, komma bij
  decimalen). Bij categorieën als lijst `bouwblokken` per groep, zonder categorieën direct op de groep.
- **Bulk-CSV-export** werkt ook op het globale overzicht zodra alle geselecteerde scans bij dezelfde organisatie
  horen (nieuwe spec van Joost, 7 oktober). Bij een selectie over meer dan één organisatie is Exporteren
  uitgeschakeld, met het Info-icoon `info.bulkExportOrganisatie` ernaast (terug in het register).
- **Tests**: 52 (CSV, import voor Admin, groepsScores, inzage).
- `azure-plan.md`: Overzicht van de stappen om de app op Azure DevOps met een Microsoft SQL-database te
  deployen en via `coniche-scan.nl` bereikbaar te maken. Alleen een plan, niets uitgevoerd.
- `afbeeldingen/`: De drie assessment-iconen (doel, schittering, hart) als PNG en SVG, om te delen met Joost.

**Nog niet gedaan, bewust**: Het Info-icoon-register in `beheerpagina.md` loopt achter op de code, zie
`OverlegMetJoost.md`. De tijdelijke Beheer-link in de footer staat er nog (zie 6 oktober).

## 2026-10-06 — Info-icoon als dialoog, knoppen en links, label "Bekijk", overleg met Joost

**Gedaan**:
- **Info-icoon** als gecentreerd dialoog met dimlaag (`createPortal`, `z-index` boven modals, Esc sluit alleen
  het veld, focus erheen en terug), "Standaardtekst herstellen" als knop.
- **Knoppen en links** (`stylesheet.md`): Alle acties zijn `.btn-outline .btn-compact` (Kopieer link, Openen,
  Bekijk, Verlengen, Goedkeuren, Archiveren, Herstellen, Filters wissen), verwijderen `.btn-danger`, geen "·"
  tussen acties (`.knoppenrij`). Gotcha: `.admin-table a` kleurde alle links oranje, ook knoppen
  (nu `a:not(.btn)`). Privacylink in de toestemmingstekst als `.tekst-link`.
- **Respondent-overzicht, blok Toegang**: Het selectievakje "Lead" met de Metingen in het blok zelf (geen stap
  "Beheren" meer) en een eigen deel "Vragenlijst sturen" voor elke Respondent, met een Meting-keuze of
  "Nieuwe Meting" (`components/beheer/ToegangBlok.tsx`).
- **Mijn metingen voor een Lead**: Knoppen "Start de intake" en "Ga verder met de scan".
- **Data-integriteit** (`components/beheer/DataIntegriteit.tsx`, `lib/db/integriteit.ts`): Vijf controles,
  een modal per controle met koppelen of verwijderen per vondst, elk met een bevestiging, acties loggen
  `vanuit: Data-integriteit` (`metExtraDetails`).
- **Conflict oplossen** (`ConflictOplossen.tsx`, `ConflictHost.tsx`, `lib/db/conflict.ts`): Modal "Twee scans van
  dezelfde Respondent" bij "Respons naar andere Meting", met `respons.respondentGewijzigd`.
- **Gebruiker aanmaken** genereert het wachtwoord (12 tekens), eenmalig in beeld.
- **Zorgscan-gewichten** in de seed terug naar 1 (open besluit, `CLAUDE.md`). Ook in de opgeslagen data teruggezet.
- **Instellingen** (`/beheer/instellingen`, Applicatie): Bewaartermijn en verlengtermijn verhuisd uit
  Organisaties, Admin-only. Organisaties toont alleen de lijsten "Data ouder dan de bewaartermijn" en
  "Verlengd, nog niet opnieuw te beoordelen". De sessieduur volgt met de backend.
- **Uitleg naar Info-icoon**: Audit-log, Algemene teksten, Content (Toelichting, Bouwblok-label) en Conflict
  oplossen. Zes nieuwe sleutels in `data/info-teksten.ts`.
- **"Bekijk >>" wordt "Bekijk"**, knoppen gelijk gemaakt. De spec noemt nog ">>".
- **Dev-only autologin in beheer** (`devAutoLogin`, alleen `next dev`, blokkade na handmatig uitloggen).
- **Tijdelijk: Beheer-link in de footer** naast Privacy, op verzoek, in strijd met `stylesheet.md`.
- `OverlegMetJoost.md`: Punten voor Joost (Info-icoon-register, Content-pagina's Visie/Bouwstenen/AI/2030,
  uiterlijk en label van "Bekijk").
- Commits `e6cbdd8` en `9d52345`, gepusht naar `main`.

**Nog niet gedaan, bewust**: Content-pagina's (punt 11): Wacht op overleg met Joost.

## 2026-10-05 — Nieuwe specs verwerkt: Weging, Bewerkslot, Audit-log, Info-icoon, Import met goedkeuring

**Aanleiding**: Sander liet de nieuwe `.md`'s (`CLAUDE.md`, `datamodel.md`, `beheerpagina.md`, `import-scans.md`,
`stylesheet.md`, `backlog.md`, `go-live-plan.md`, `privacy-pagina.md`) per wijziging langslopen.

**Gedaan**:
- **Weging van bouwblokken**: `lib/scoring.ts` rekent gewogen (categoriescore `Σ(g × score)/Σ g`, overall
  `Σ(g × som)/Σ(g × n)` uit de ruwe antwoorden), `Categorie.gewicht` weg, wegingskaart op de intake, "2×"-chips
  in flow, sidebar, resultaten, radar en PDF, weging-editor in Content met bevestiging (`WegingBeheer`) en
  `bouwblok.gewichtGewijzigd`, `Assessment.wegingTitel/wegingToelichting`. Rekenvoorbeeld uit de spec als test
  (172 over 60 vragen: 2,87, gewogen 3,0).
- **`Bouwblok.toelichting`/`centraleVraag` en `Assessment.bouwblokLabel`** als echte velden
  (`lib/assessment-migratie.ts` vult bestaande data eenmalig uit de oude opzoektabellen).
- **Bewerkslot** (`lib/bewerkslot.ts`, `app/api/slot/[type]/[id]`, tabel `bewerk_sloten`): Scan, Respondent en
  Organisatie, met de naam van de houder in beheer. Vervangt het Scanslot.
- **Audit-log** (`lib/audit-store.ts`, `/beheer/audit`): Logging van beheeracties zonder persoonsgegevens,
  scherm met periodeknoppen, filters in de URL, importgroepen, CSV-export en opruimen na de bewaartermijn.
  Staat nog alleen in de browser: De Neon-tabel `app_data` heeft een CHECK-constraint op de sleutels.
- **Info-icoon**: Alleen klik, potlood voor een Admin om de tekst op de plek aan te passen, register met
  sleutels (`data/info-teksten.ts`), overzicht onder Algemene teksten, `algemeneTekst.gewijzigd`.
- **Import**: Goedkeuren per waarschuwingsrij en één knop "Importeer N rijen", overgeslagen bestanden,
  genegeerde submappen, Respondent uit het bestand, `start_comment` ongewijzigd in de notities, importgroep in
  de audit-log.
- Tests van 15 naar 45.

**Nog niet gedaan, bewust**: Specs voor Content-pagina's en de Neon-constraint voor de audit-log.

## 2026-10-02 — Scan-punten 1 t/m 8: beveiligingsmaatregelen, tests, opruiming, toegankelijkheid

**Aanleiding**: Sander wil de eerste acht punten uit de scan van de oplossing doorvoeren.

**Gedaan**: Zie `backlog.md`, "Gedaan (2 oktober 2026)". Next.js 16.3.8, `/api/mail` en
`lib/mailer.ts` weg, `gebruikers` niet meer in Neon (en de rij met wachtwoorden verwijderd),
grootte- en gelijktijdigheidslimieten op `/api/store` en `/api/export-pdf`, dev op `127.0.0.1`,
vitest met 15 tests, `lib/db.ts` gesplitst in `lib/db/` (zelfde importpad `@/lib/db`),
Content-pagina gesplitst (`lib/assessment-bewerken.ts`, `components/beheer/BouwblokEditor.tsx`),
exportcode samengebracht in `lib/scan-export.ts`, oud prototype naar `archief-prototype/`,
focusval in de modals (`lib/use-focus-val.ts`), `:focus-visible`, "Bekijk >>" in de lijst
Respondenten. Twee checkpoint-commits.

**Nog niet gedaan, bewust**: Echte server-side autorisatie en data per record
(punt 1, 3 en 8) vragen een andere opzet van de respondentflow en staan als plan klaar ter
goedkeuring. `gebruikers` leeft nu per browser: Een account dat in de ene browser is
aangemaakt, bestaat niet in een andere.

## 2026-10-02 — Resterende uitlegteksten in beheer naar het Info-icoon

Algemene teksten (toelichting bij het veld), Content (Icoon en Slotsectie voor de
PDF-export) en Applicatie (Data-integriteit) gebruiken nu het Info-icoon in plaats van
vaste tekst eronder. "Afgeleid van: …" (een gegeven, geen uitleg) en lege-lijstmeldingen
blijven staan. Lijst van plekken in `stylesheet.md`, Info-icoon.

## 2026-10-02 — Getalvelden zonder pijltjes

Alle `input[type="number"]` (bewaartermijn, verlenging, weging/gewicht in Content,
organisatiekenmerken zoals aantallen en percentages, de testknop) tonen alleen de waarde,
zonder de pijltjes om met 1 te verhogen of te verlagen. Eén regel in `base.css`, dus ook voor
toekomstige getalvelden. Vastgelegd in `stylesheet.md` (Formulieren, Getalvelden zonder pijltjes).

## 2026-10-02 — Info-icoon in plaats van vaste uitleg bij Bewaartermijn

`components/InfoIcoon.tsx` (oranje rondje met uitroepteken, klik opent een afsluitbaar
informatieveld) vervangt de vaste uitlegtekst onder het formulier "Bewaartermijn ingevulde
scans" (`app/beheer/organisaties/page.tsx`), zowel in de Admin-weergave (naast Opslaan) als
in de weergave voor een Consultant (achter de termijnen). Vastgelegd in `stylesheet.md`,
Info-icoon. Gotcha: Tailwind-marges zoals `mt-6` op een `h3` werken niet, omdat de
ongelaagde `h3`-regel in `base.css` ze overschrijft: Marges op koppen daarom inline of in CSS.
Daarna ook omgezet: De twee uitlegteksten op de Import-pagina (bij "Bestanden kiezen" en
bij "rijen importeren") en de uitleg bij het bewerkformulier in het Respondent-overzicht.
De regel "uitleg in een Info-icoon, niet als vaste tekst" staat nu in `CLAUDE.md`
(Uitgangspunten), `beheerpagina.md` (Vormgeving) en `stylesheet.md` (Info-icoon). Het
informatieveld opent ook met mouse-over (sluit weer bij weggaan), en een klik zet het vast.
Het Respondent-overzicht kon niet in de browser getest worden: Er zijn op dit moment geen
respondenten.

## 2026-10-02 — Typografie: één schaal voor interface-tekst, vaste veld- en knophoogte

**Aanleiding**: Sander wil consistente lettertypes en maten, en een melding bij
wat niet gespecificeerd is. Gemeten: Eén beheerpagina toonde 10 tot 13 lettergroottes.

**Besluit (Sander)**: Schaal `--fs-xs/s/m/l` = .75/.85/.9/1.15rem, gewichten 400/600/700/800
(500 vervalt), Geist Mono weg, `code` in Epilogue, PDF blijft Helvetica/Arial.

**Gedaan**: Tokens in `tokens.css`; 57 `font-size`-waarden in `components.css`,
`admin.css` en `charts.css` op die tokens gezet (eyebrow, koppen, iconen en
display-maten bewust niet); Tailwind `text-xs/sm/base/lg` volgen dezelfde waarden
(`globals.css`); 22 keer `font-medium` naar `font-semibold`; inline `fontSize` op de
tokens; één modaltitelregel (`.modal-overlay .modal-box h2`, was afhankelijk van de
plek in de pagina: 18,4px binnen `.admin-main`, daarbuiten de volle h2); Geist Mono uit
`layout.tsx`; `font-family: inherit` voor alle formulierelementen en `code`.
Veldhoogte: `--control-h` (2,4rem) voor `.admin-field input/select` en
`.btn.btn-compact`, gemeten 38,4px voor allemaal (ook dropdown en selectiebalk).

**Gemeten na afloop**: Per beheerpagina nog 12 / 13,6 / 14,4 / 18,4 / 30,4px plus de
lopende tekst van 16px. **Niet in de schaal** (staat in `stylesheet.md`, Open punten):
inleidende regels, privacykoppen, bouwblokkoppen, de score in de cirkel en de
grafiektekst.

## 2026-10-02 — Scanslot: één persoon tegelijk per scan, scan-bevindingen op de backlog

**Aanleiding**: Uit de scan van de oplossing bleek dat twee gelijktijdige
bewerkers van één scan elkaars antwoorden kunnen overschrijven. Besluit
(Sander): De eerste respondent blokkeert de scan tijdens het invullen, een
tweede krijgt een melding.

**Gebouwd**: `lib/scan-slot.ts` (`useScanSlot`, hartslag elke 15 seconden,
vrijgeven bij verlaten), `app/api/slot/[scanId]/route.ts` (één atomaire
`INSERT … ON CONFLICT … WHERE`, TTL 90 seconden), tabel `scan_sloten`
(`scripts/maak-sloten-tabel.mjs`, eenmalig gedraaid in Neon),
`components/ScanBezet.tsx` en de koppeling in de intake- en doorloopflow. De
wachtende pagina controleert zelf opnieuw en opent de vragenlijst zodra het
slot vrij is. Zonder database valt het slot terug op `localStorage`. Het
vrijgeven wacht 400 ms en kijkt of een volgende pagina in hetzelfde tabblad het
slot al heeft overgenomen, anders wist de overgang intake naar vragenlijst het
net geclaimde slot weer.

**Getest**: De API met twee houders (claim, bezet, hartslag, vrijgeven door de
verkeerde houder, verlopen slot) en in de browser met twee tabbladen: Het
tweede tabblad kreeg de melding en kreeg na het sluiten van het eerste
automatisch de vragenlijst. Eén keer bleef een nieuw tabblad op "Laden…"
hangen terwijl de data al in `localStorage` stond; na een herlaadbeurt en met
leeg geheugen was het niet te reproduceren.

**Specs**: `CLAUDE.md` (scherm 5, Eén persoon tegelijk per scan) en
`datamodel.md` (Scanslot). **Backlog**: De bevindingen van de scan staan in
`backlog.md` onder "Uit de scan van 2 oktober 2026", verdeeld over drie fasen
(functioneel afronden, database en rollen, deployment en beveiliging).

## 2026-10-02 — Beheer herbouwd naar Respondent-/Scan-overzicht, Meting-pagina en tabbalk

**Aanleiding**: De nieuwe `beheerpagina.md` (Navigatie in beheer, punt 4 t/m
7) beschrijft een andere beheerstructuur dan er stond: Een tabbalk, kruimelpad,
één lijst Respondenten en het Respondent-/Scan-overzicht als modal in plaats
van acties per rij en een detailpagina per scan.

**Gebouwd**
- **Tabbalk** (Organisaties, Respondenten, Ingevulde scans, Import) in
  `BeheerChrome`, alleen op de lijstpagina's. De losse nav-links "Ingevulde
  scans →" en "Import van scans →" zijn vervallen. **Kruimelpad**
  (`components/beheer/Kruimelpad.tsx`) op organisatie-detail,
  Meting-overzicht en de resultatenschermen.
- **Respondent-overzicht** en **Scan-overzicht** als modal
  (`RespondentOverzicht.tsx`, `ScanOverzicht.tsx`, gehost door
  `BeheerOverzichten.tsx` in `BeheerChrome`) via `?respondent=<id>` en
  `?scan=<id>`. De terugknop van de browser sluit de modal, een gedeelde link
  opent hem alleen bij toegang. `lib/beheer-url.ts` houdt filters, sortering en
  de modal in de adresbalk. Gotcha: `history.replaceState(window.history.state,
  …)` synchroniseert in Next.js niet met `useSearchParams` (het interne state-object
  geldt als Next-eigen aanroep), daarom geeft `schoneState()` een schoon object door.
- **Vervolgstappen** in dezelfde modal (`VerplaatsStappen.tsx`): Scan naar
  andere Meting (ook bulk), scan naar andere organisatie, hele Respondent
  verplaatsen met een Meting-keuze per bron-Meting, samenvoegen bij
  e-mailconflict, Lead-toegang beheren.
- **Nieuwe pagina's**: `/beheer/respondenten` (lijst met filters en zoekveld),
  `/beheer/metingen/[id]` (Meting-overzicht met uitnodigen, selectie, label wijzigen,
  verwijderen), `/beheer/resultaten/[id]` (resultaten van één scan in beheer, met
  Exporteren in de nav). `/beheer/scans/[respondentId]` is vervallen.
- **Organisatie-detail** toont Metingen, Respondenten en scans met "Bekijk >>" en
  maximaal 5 rijen, met een link naar de gefilterde lijst.
- **Samenvoeg- en verplaatslogica** in `lib/db.ts` volgt nu de spec: Een scan
  waarvan de bestaande Respondent in dezelfde Meting al een scan heeft, wordt
  overgeslagen en blijft staan, de oorspronkelijke Respondent wordt dan niet
  verwijderd. Voorheen verdween zo'n scan stilzwijgend. Ongeldige Meting-keuze
  breekt de hele actie af. Lead-koppelingen vervallen bij het verplaatsen naar een
  andere organisatie (ze verwijzen naar Metingen van de oude).
- Import: naast "Bestanden kiezen" nu "Map kiezen" (`webkitdirectory`).

**Specs bijgewerkt**: `beheerpagina.md` (Status, bewaartermijn in dagen, teruggekomen
oude tekst over Toegang, Rolbadge en Gebruikers hersteld, Respondenten op gebouwd),
`stylesheet.md` (Tabbalk en kruimelpad, Overzichtsmodal, Vervolgstappen), `backlog.md` en
`CLAUDE.md` (Weging op de backlog, niet gebouwd).

**Bewust niet gebouwd**: Audit-log en Content-pagina's (staan in de spec als nog niet
gebouwd), de tab Organisatievelden, Verificatie-blokkade opheffen, paginering,
Weging (backlog). Overgeslagen scans komen dus nog niet in een audit-log terecht.

## 2026-10-01 — Lokale, host-brede opslag + bugfix bronformaat-detectie

**Aanleiding**: "Ik wil lokaal op dezelfde host met dezelfde data kunnen
werken" — alles stond puur in de `localStorage` van de browser die er
toevallig in zat (CLAUDE.md, Status), dus elke browser op hetzelfde
apparaat had zijn eigen, geïsoleerde data.

**Nieuw: `app/api/store/[key]/route.ts`** (GET/PUT, JSON-tekst 1-op-1 naar
een bestand onder `.data/` in de projectroot, niet gecommit). **Nieuw:
`lib/server-sync.ts`** met twee functies, ingebouwd in alle vijf losse
localStorage-stores (`lib/db.ts`, `lib/assessment-store.ts`,
`lib/gebruikers-store.ts`, `lib/instellingen-store.ts`,
`lib/algemene-teksten-store.ts`): `haalServerKopieOp` haalt bij het laden
van de pagina eenmalig de serverkopie op en overschrijft de lokale
`localStorage`-waarde ermee als ze verschilt; `stuurNaarServer` stuurt na
elke schrijfactie (fire-and-forget) de nieuwe staat naar de server. Geen
server bereikbaar (bijv. een productie-build zonder deze route): beide
falen stil, `localStorage` blijft dan gewoon de enige bron, zoals
voorheen.

Bewust **niet** de geplande Postgres-database (Neon, `backlog.md`) —
geen auth, geen gelijktijdigheidscontrole, "laatste schrijver wint". Puur
bedoeld voor één persoon die op één apparaat tussen browsers wisselt
tijdens lokale ontwikkeling, niet voor gedeeld/productiegebruik.

**Een race geconstateerd en gefixt vóórdat 'm iemand trof**: Eerste versie
pushte bij het zaaien van nieuwe localStorage (lege browser) meteen de
standaardseed naar de server — dat kon een al bestaande, echte serverkopie
overschrijven vóórdat de asynchrone ophaalronde had kunnen draaien. Seed-
push verwijderd: Een lege browser wacht nu op `haalServerKopieOp` en pusht
pas iets bij een eerste echte schrijfactie.

Geverifieerd in de browser: een instelling opgeslagen → terug te vinden in
`.data/instellingen.json`; daarna `localStorage` gewist en herladen → de
server-waarde kwam terug i.p.v. de standaardwaarde. Zelfde bevestigd voor
de echte organisatiedata (`.data/organisaties.json`, de drie bestaande
organisaties).

**Bugfix, `detecteerBronFormaat` (`lib/import-legacy.ts`)**: Las de
headerregel met een kale `split(",")`/`split(";")` i.p.v. de
aanhalingstekens-bewuste `parseCsv` die de rijen zelf al wél gebruikten.
Een bulk-export met aangehaalde kolomkoppen (`"organisatie_naam";...`,
gebruikelijk bij Excel-/pandas-achtige bulk-exports) matchte daardoor
nergens mee — de aanhalingstekens bleven letterlijk in elke kolomnaam
staan, dus geen enkele kolom kwam overeen met de verwachte naam, en het
hele bestand werd afgewezen met "kon het bronformaat niet bepalen",
ook al stond er verder een geldig bestand in. Root cause aangedragen
door Sander (zelf gevonden in het gedrag, hier toegepast op
`lib/import-legacy.ts`); nu lost `detecteerBronFormaat` de headerregel
op met dezelfde `parseCsv`-tokenizer. Geverifieerd met een scriptje (4
combinaties: oud/nieuw formaat × wel/niet aangehaalde headers, alle vier
correct) en in de browser met een bestand dat exact het gemelde probleem
reproduceerde (aangehaalde headers, bronformaat "Coniche Scan (eigen
export)") — detecteert nu correct i.p.v. de foutmelding te geven.

## 2026-10-01 — Import van scans: bijgewerkt op `import-scans.md`

**Aanleiding**: "Pas import aan op basis van md" — `import-scans.md` was
fors uitgebreid (meerdere organisaties/Assessment-types in één bestand,
organisatie-koppeling per unieke naam i.p.v. per rij, een 95%-
vraagtekst-tiebreak voor Assessment-detectie, en Metingen die binnen één
beheersessie worden samengevoegd), de implementatie liep daar nog niet
in mee.

**`lib/import-legacy.ts`**: `detecteerAssessment`'s vraagtekst-tiebreak
(nodig zodra bouwblok-namen tussen scan-types botsen, zoals Klantcontact
Volwassenheid/Zorgscan) ging van alles-of-niets naar een percentage:
exact één kandidaat op 100% blijft automatisch; geen 100%, maar precies
één kandidaat op of boven de 95%-drempel, wordt óók gedetecteerd maar
vereist een losse bevestiging per rij (nooit in bulk), met het
percentage en de afwijkende vragen in `GevalideerdeRij`. Geverifieerd
met een scriptje tegen de echte Klantcontact-/Zorgscan-content (100%,
96,7% met 2 gewijzigde vragen, en 83,3% met 10 gewijzigde vragen —
respectievelijk automatisch, losse bevestiging, en onbepaald). Ook: het
Meting-label voor de eigen export kreeg de specced "Import "-prefix
(stond er nog niet).

**`lib/db.ts`**, `voerLegacyImportUit`: Maakte voorheen altijd een
nieuwe organisatie/Meting per rij, ook als twee rijen dezelfde
(nieuwe) organisatienaam of dezelfde organisatie/Assessment/Meting-label
deelden — in strijd met "Organisatie, één keer per unieke naam" en
"Binnen één import delen rijen één Meting". Nu: dedupliceert binnen één
aanroep op naam resp. op organisatie+Assessment+label, en `LegacyImportKeuze`
accepteert optioneel een al bekend `organisatieId`/`metingId` zodat een
latere, aparte bevestiging binnen dezelfde beheersessie (bijv. een
95%-rij die pas na de bulk-import wordt bevestigd) bij dezelfde
organisatie/Meting aansluit in plaats van een dubbele aan te maken.
Geverifieerd in de browser: twee rijen met een nieuwe, gedeelde
organisatienaam en hetzelfde Meting-label kwamen samen in precies één
organisatie met precies één Meting (2 invullingen), niet twee losse.

**`app/beheer/import/page.tsx`**, flink herbouwd:
- Organisatiekoppeling is nu één keuze per unieke organisatienaam
  (koppelen aan bestaand / nieuw aanmaken / overslaan), niet meer een
  dropdown per rij — met een "Organisaties koppelen"-tabel boven de
  voorbeeldweergave. Een exacte naam-match wordt nog steeds automatisch
  gekoppeld, zonder keuze te vragen.
- Nieuwe samenvatting bovenaan: aantal rijen, organisaties
  (bestaand/nieuw/nog te kiezen), rijen per Assessment-type, rijen met
  een probleem.
- Rijen met een 95%+-match krijgen een eigen "Importeer deze rij"-knop en
  tellen niet mee in de bulkknop; een "overslaan"-organisatie toont
  "Organisatie overgeslagen" i.p.v. een importeerbare rij.
- Na een bevestiging (bulk of los) blijven alle rijen zichtbaar in de
  voorbeeldweergave; geïmporteerde rijen krijgen de badge "Geïmporteerd"
  en zijn niet opnieuw te bevestigen, in plaats van dat het hele scherm
  na één druk op de knop leegt.
- Bronformaat-tekst in `import-scans.md` zelf rechtgezet: Twee plekken
  (de inleiding en "Werkwijze in beheer" stap 1) beschreven nog een
  handmatige bronformaat-keuze vooraf, terwijl dat al eerder deze sessie
  bewust is vervangen door automatische detectie (`detecteerBronFormaat`)
  — en de rest van het document (en de code-comments die ernaar
  verwijzen) ging daar ook al van uit. Rechtgezet naar automatische
  detectie, consistent met de rest van de spec en de al bestaande
  implementatie.

## 2026-10-01 — "Ingevulde scans"/"Import" naar `.nav-right`, Bewaartermijn in dagen

**"Ingevulde scans →"/"Import van scans →" van de pagina-body naar
`.nav-right`**: Stonden als platte tekstlinks bovenaan de body van
`/beheer/organisaties` — hoorden daar niet, het zijn scherm-specifieke
navigatie-acties (CLAUDE.md sectie 3, Globale layout, punt 1), net als
"Naar resultaten →" op de doorloopflow. Nieuw:
`components/beheer/BeheerNavActions.tsx`, een context waarmee een
beheerpagina haar eigen nav-right-content kan registreren — nodig omdat
`BeheerChrome` in `app/beheer/layout.tsx` zit, één laag boven elke
pagina, en dus geen `navRight`-prop van de pagina zelf kan aannemen
zoals `PageWithChrome` dat op de respondentkant wel kan.

**Bewaartermijn/Verlenging: maanden → dagen.** `Instellingen.
bewaarTermijnMaanden`/`verlengTermijnMaanden` hernoemd naar
`bewaarTermijnDagen`/`verlengTermijnDagen` (`lib/instellingen-store.ts`),
`isOuderDanBewaartermijn` en `verlengBewaartermijn` (`lib/db.ts`)
gebruiken nu `setDate` i.p.v. `setMonth`. Labels op
`/beheer/organisaties` aangepast ("(dagen)"), `datamodel.md` deel 2,
`beheerpagina.md` punt 4 en `privacy-pagina.md` bijgewerkt. Geen
migratie van bestaande waarden nodig: Zonder eerder ingestelde termijn
(`null`, geen default) was er niets om om te rekenen.

## 2026-09-30 — Volledige app-audit (3 lenzen) en de fixes daaruit

**Aanleiding**: "Kun je de coniche app nog een keer doorlopen, met de
blik vanuit bouwfout/aanname/elegantie?" Vier parallelle audits (eigen
beheer-review + drie subagents: respondent-flow, exports, content-
fidelity, datamodel/rechten) leverden ~19 bouwfouten, ~21 aannames en
~15 elegantie-suggesties op. Op "fix all" hieronder verwerkt, met
tsc/eslint/next build + browsertests na elke groep.

**Toegang/rechten (de twee met echt databeveiligingsrisico)**:
- Scan-detail (`/beheer/scans/[respondentId]`) en Rapportage
  (`/beheer/rapportage/[scanUitvoeringId]`) hadden geen `magOrganisatie
  Toegang`-guard: Een Consultant die een id van een andere organisatie
  kende/raadde, zag volledige antwoorden/scores. Guard toegevoegd, zelfde
  patroon als de organisatie-detailpagina.
- Import (`/beheer/import`) gebruikte het ongefilterde `useOrganisaties()`
  voor matching/dropdown: Een Consultant kon zo importeren in een
  organisatie buiten zijn bereik. Nu gescopet via `zichtbareOrganisaties`.
- Lead `export.uitvoeren` voor toegewezen Metingen (rechtenmatrix
  inmiddels vastgelegd) ontbrak: PDF-exportknop toegevoegd aan de Lead-
  resultatenpagina (`/s/[code]/resultaten/[scanUitvoeringId]`), met een
  omschrijvende naam i.p.v. een respondentnaam. CSV/InDesign voor een
  Meting-gemiddelde zijn bewust nog niet gebouwd (geen vastgelegd
  kolomformaat voor een aggregaat) — open punt.

**Content bewerken: archiveren i.p.v. hard verwijderen** (datamodel.md
zei dit al, was nooit gebouwd): `gearchiveerd?: boolean` op
`Categorie`/`Bouwblok`/`Vraag`. "Verwijderen" in het contentbeheerscherm
zet dit veld, met een "Gearchiveerd"-lijstje en Herstellen-knop erbij,
i.p.v. het record te verwijderen. Nieuwe invullingen krijgen gearchiveerde
content niet meer te zien (`lib/assessment-structuur.ts`, nieuwe
`actieveGroepen`/`actieveBouwblokkenMetGroep`/`actieveVragen`, gebruikt
door de doorloopflow, `Sidebar`, `voortgang()` en de tellingen op
landingspagina/contentoverzicht); scoring/exports op een bestaande
invulling blijven de ongefilterde functies gebruiken, dus scores uit
eerdere invullingen blijven behouden — geverifieerd met een losse
scoring-test (antwoord op een inmiddels gearchiveerde vraag telt nog mee)
en in de browser (archiveren/herstellen via `/beheer/content/...`).

**Meting verwijderen**: Bestond niet, ondanks dat datamodel.md het als
gebouwd documenteerde. `verwijderMeting` (`lib/db.ts`) + knop naast
"Wijzig label" in het organisatie-detail, met bevestiging.

**Sector-variant kopiëren brak stilzwijgend de bouwsteen-content**:
`duplicateAssessmentAsVariant` gaf gekopieerde bouwblokken een kale UUID,
die geen `"bb"/"zorg-"/"ai"`-voorvoegsel meer matchte in
`lib/bouwblok-info.ts` — dus verloor elke sector-variant zijn CENTRALE
VRAAG/beschrijving. `nieuwBouwblokId` behoudt nu het voorvoegsel van het
bronbouwblok. De onderliggende lookup-architectuur (i.p.v. een echt
`centraleVraag`-veld) staat gedocumenteerd als bekende, grotere
vervolgstap in `datamodel.md`, Bouwblok.

**Lead-toegang beheren, per respondent-rij** (beheerpagina.md punt 6a,
was alleen als losse "Leads"-sectie gebouwd met e-mail opnieuw intikken):
Nieuwe `LeadToegangDropdown` in de respondententabel van het organisatie-
detail — checkbox per Meting, "Vragenlijst sturen" waar nog geen
invulling bestaat. De losse "Leads"-sectie blijft ernaast bestaan voor
het aanmaken van een Lead met een nog onbekend e-mailadres.

**"Mijn gegevens"-menu** (CLAUDE.md sectie 3, was nergens gebouwd):
Nieuwe `MijnGegevensMenu`/`MijnGegevensMenuVoorCode`/
`RespondentGegevensVelden`-componenten (het laatste hergebruikt door
zowel de intake als deze modal, geen nieuw formulier). Toegevoegd aan
"Mijn metingen", doorloopflow, resultatenpagina, Lead-resultatenpagina en
de 4 content-pagina's — niet op intake (nog geen identiteit om te tonen)
of de 3 publieke schermen. "Uitloggen" navigeert naar `/toegang`; een
lokale sessie om te wissen bestaat nog niet (`ToegangsSessie`, deel 2).

**Bulk-Exporteren bood nooit PDF/InDesign, ook niet bij 1 selectie**
(beide export-specs eisen dat wel): `BulkToolbar`'s Exporteren-knop is nu
een Dropdown-knop (Als PDF/Als CSV/Voor InDesign), met PDF/InDesign
uitgeschakeld ("Beschikbaar bij precies één scan") tenzij precies 1 rij
geselecteerd is. Toegepast op zowel "Ingevulde scans" (globaal) als de
organisatie-detailpagina.

**Twee CSV-bugs** (`lib/csv-export.ts`): `opmerkingen_per_bouwblok` nam
lege strings mee (een gewiste opmerking bleef als `""`-entry staan) —
nu gefilterd. `antwoorden`/`opmerkingen_per_bouwblok` werden leeggemaakt
bij een niet-afgeronde scan, een restrictie die de spec alleen voor de
score-samenvatting stelt — nu altijd gevuld met wat er al ingevuld is.

**Respondent-flow, dode eindes en naam-mismatches**:
- Samengevoegde Lead/eigen-Meting-kaart (`/s/[code]`) had geen link naar
  de eigen invulling zodra die nog niet afgerond was én niemand anders in
  de meting al klaar was — beide knoppen bleven dan onzichtbaar. Fallback-
  link toegevoegd ("Start/Ga verder met jouw scan").
- Nav-label "AI-scan" → "AI" (CLAUDE.md noemt de 4 links consistent
  Visie/Bouwstenen/AI/2030).
- AI-domeinkaarten kregen de specced 1,5px rand i.p.v. de gewone 1px.

**Contentfidelity-fixes** (data vs. spec-tekst):
- Drie bouwsteennamen liepen uiteen tussen `data/klantcontact-
  assessment.ts` en `data/bouwstenen-content.ts` (#2, #5, #6) — bron was
  dat `content-klantcontact-volwassenheid.md` en `visie-coniche.md` zelf
  al niet overeenkwamen. `coniche_bouwstenen.md` (het officiële
  Excel-/coniche.nl-referentiedocument) als scheidsrechter genomen:
  "Klantcontact visie & strategie" / "Financial control" /
  "Positionering klantcontact" overal doorgevoerd (ook in
  `visie-coniche.md` en `bouwstenenmodel-visual.md`).
- Bouwsteen 1/15 renderen niet edge-to-edge op `/bouwstenen`, in
  tegenstelling tot de tekst van `bouwstenenmodel-visual.md` — bleek een
  bewuste eerdere keuze van Sander ("op verzoek", staat als comment in de
  code), dus niet teruggedraaid maar als afwijking gedocumenteerd in de
  spec zelf.
- `data/ai-scan-assessment.ts`'s naam kreeg de hoofdletter terug
  ("AI-Volwassenheid", matcht `content-ai-scan.md`).
- Een weggevallen zin in `data/visie-content.ts` ("Een medewerker kan een
  gesprek goed voeren terwijl het proces erachter vastloopt.")
  teruggezet — het bestand claimt een letterlijke kopie van
  `visie-coniche.md` te zijn.

**Kleinere elegantie-opruiming**: `isVlakkeAssessment()` (bestond al in
`lib/assessment-structuur.ts`) vervangt drie losse herimplementaties in
`lib/scoring.ts`/`lib/csv-export.ts`/`lib/indesign/build-xml.ts`. InDesign
deelt nu de `kortLabel`-fallback (oud opgeslagen assessment zonder
`kortLabel`) met de PDF-export, was eerder alleen in de bestandsnaam-slug
toegepast, niet in het `<kortLabel>`-element zelf.

**Niet aangepakt, bewust**: Het volledig omzetten van `centraleVraag`/de
rijke beschrijving naar echte velden op `Bouwblok` (i.p.v. de losse
lookup-tabellen `data/bouwstenen-content.ts`/`data/ai-domeinen-
content.ts`) — dat vraagt het overzetten van tekst voor 15+8+15
bouwblokken, een grotere, foutgevoelige contentmigratie die beter apart
en met Sander's review gebeurt dan als onderdeel van deze bugfix-ronde.
CSV/InDesign voor een Meting-gemiddelde (Lead-export): zie hierboven.

## 2026-09-30 — Meting-label wijzigen, Score/Voortgang, AVG-verzoek, Bewaartermijn

**Aanleiding**: "Kijk naar nieuwe MD's voor wijzigingen en voer deze
door." `beheerpagina.md` bleek fors uitgebreid met vijf nieuwe,
grotendeels zelfstandig bouwbare stukken (geen backend nodig), plus de
gebruikelijke teruggevallen statusregels.

**Weer teruggevallen statusregels** (zelfde terugkerend patroon):
"Toegang", "Vormgeving"/Rolbadge en "## Status" stonden weer op de oude,
van-vóór-de-RBAC-bouw tekst. Rechtgezet.

**Foute claim gecorrigeerd**: Punt 12 (nieuw, "Audit-log") beweerde dat
`AuditEvent` "al gelogd wordt" — klopt niet, er staat nergens in de code
ook maar één `AuditEvent`. `datamodel.md` deel 2 classificeert
`AuditEvent` zelf al als "vereist een echte backend" (naast
`Sessie`/`VerificatieCode`) — logisch, een audit-log die door dezelfde
localStorage leest die hij zou moeten controleren biedt geen garantie.
Rechtgezet: Audit-log-scherm kan pas gebouwd worden zodra `AuditEvent`
er is, niet ervoor.

**Vier nieuwe stukken gebouwd, alle vier prototype-niveau (localStorage,
geen backend nodig)**:

- **Meting-label wijzigen** (punt 5): "Wijzig label" naast elke Meting-
  titel in het organisatie-detail, `hernoemMeting` (`lib/db.ts`). Het
  assessment-type blijft vast na aanmaken, zoals gespecificeerd.
- **Score/Voortgang-kolommen, Consultant-only** (punt 4): Op
  `/beheer/organisaties`, alleen zichtbaar voor een Consultant. Score =
  gemiddelde van de meest recente Meting met ≥1 afgeronde scan (zelfde
  drempel als Organisatie-resultaten); Voortgang = "X van Y afgerond"
  van diezelfde Meting, verborgen zodra die volledig afgerond is.
- **AVG-verzoek verwerken** (punt 4): Twee knoppen per respondent in de
  organisatiedetail-tabel. "AVG-inzage" exporteert alle data van die
  respondent (persoonsgegevens + antwoorden over alle metingen van de
  organisatie heen) als JSON-download. "AVG-verwijdering" hergebruikt de
  bestaande `verwijderLeden` — geen nieuwe verwijderlogica. Nog niet
  gelogd naar `AuditEvent` (bestaat nog niet, zie hierboven).
- **Bewaartermijn ingevulde scans** (punt 4, `datamodel.md` deel 2):
  Nieuwe `lib/instellingen-store.ts` (`bewaarTermijnMaanden`,
  `verlengTermijnMaanden`, beide zonder default) en `ScanInvulling.
  bewaarVerlengdTot` (nieuw veld, `lib/types.ts`, met defensieve
  normalisatie voor oudere localStorage-data). Nieuw blok onderaan
  `/beheer/organisaties`: instellingen Admin-only bewerkbaar (Consultant
  ziet ze read-only), de "Data ouder dan de bewaartermijn"-lijst zelf
  volgt het bereik van de rest van het scherm (alle organisaties voor
  Admin, eigen voor Consultant) — dat stond expliciet zo in de spec,
  in tegenspraak met de eerste "(Admin-only)"-parenthese erboven; de
  preciezere, uitgeschreven bereik-regel heeft gewonnen. Geen
  automatische verwijdering: Verwijderen (bestaande actie) of Verlengen
  (zet `bewaarVerlengdTot`) per rij, verder blijft een scan gewoon
  bestaan.

**Getest in de browser**: Meting hernoemd en teruggezien. Bewaartermijn
op 6/3 maanden gezet, een testscan 8 maanden terug afgerond gezet —
verscheen in de lijst, "Verlengen" haalde 'm er weer uit. Als
Consultant: Score-badge (3.0) correct berekend, Voortgang verborgen bij
volledig afgerond, Bewaartermijn-instellingen read-only met de eigen
(gefilterde) lijst erbij. AVG-inzage triggerde een download zonder
console-fouten. `tsc --noEmit`, `eslint .` en `next build` lopen schoon
door. Testdata na afloop opgeruimd.

## 2026-09-30 — Twee CSS-bugs die knoppen/velden door elkaar lieten hoogte-variëren

**Aanleiding**: Screenshot van de Metingen-rij (Assessment-type-select,
Label-veld, "+ Meting plannen"-knop) — "wil je de knoppen en invulvakken
netter maken zelfde hoogte."

Bij het opmeten van de daadwerkelijke gerenderde hoogtes bleken er **twee
losstaande, sessie-brede CSS-bugs** te zitten, niet iets wat alleen deze
ene rij raakte:

1. **`.btn-compact` deed het niet buiten `.nav-right`.** De regel stond
   vóór de algemene `.btn`-regel in `components.css`; bij gelijke
   specificiteit wint de latere regel, dus elke `.btn-compact`-knop
   buiten de nav (Uitnodigen, Rapportage, Lead toevoegen, Meting
   plannen, bulk-toolbars) kreeg stilzwijgend de volle `.btn`-padding
   (~52px hoog in plaats van de bedoelde ~30px). Gefixt door de selector
   te veranderen naar `.btn.btn-compact` (twee klassen, hogere
   specificiteit, wint altijd ongeacht volgorde in het bestand) —
   dezelfde truc die `.nav-right .btn` toevallig al goed deed.
2. **`<select>` erft `body`'s `line-height: 1.78` niet, `<input>`/
   `<textarea>`/`<button>` wél.** Daardoor was een `<input>` met
   identieke padding/font-size als een `<select>` toch merkbaar hoger
   (47px tegenover 38px, gemeten op de Metingen-rij). Gefixt met een
   line-height-reset op alle vier formulierelementen in `base.css`.

**Resultaat**: Select, input en (compacte) knop in de Metingen-rij
verschillen nu nog ~2px in hoogte (38 / 36 / 35px) in plaats van 38 / 47
/ 52px — visueel gelijk. `.btn-compact` kreeg daarnaast iets meer
verticale padding (0,5rem → 0,7rem) om dat laatste stukje te dichten.

**Impact breder dan gevraagd**: Beide bugs golden voor elke
`.btn-compact`-knop en elk formulier in heel beheer, niet alleen de
Metingen-rij — bulk-toolbars, Uitnodigen/Rapportage/Lead-knoppen zien er
nu allemaal merkbaar compacter uit. Gecontroleerd dat dit geen
ongewenste neveneffecten geeft: bulk-toolbar (Organisaties-lijst),
nav-dropdown en de standaard `.btn-or`-knoppen (niet-compact) zien er
nog hetzelfde uit.

**Getest in de browser**: Hoogtes opgemeten vóór en na de fix via
`getBoundingClientRect()`, visueel gecontroleerd op de Metingen-rij, de
organisatielijst en de bulk-toolbar. `tsc --noEmit`, `eslint .` en
`next build` lopen schoon door (zuiver CSS, geen TS-impact).

## 2026-09-30 — Bronformaat automatisch gedetecteerd, beheernav naar 3 hoofdlinks

**Aanleiding**: "Bronformaat moet je bij import zelf uitvogelen en volg
bij het menu bovenin de specs!" Twee losse punten in één zin.

**1. Bronformaat-detectie** (`import-scans.md`, Werkwijze in beheer):
De handmatige "Bronformaat"-dropdown op `/beheer/import` is vervangen
door automatische detectie uit de headerregel van het bestand zelf
(`detecteerBronFormaat`, `lib/import-legacy.ts`) — zelfde soort
detectie als het Assessment-type per rij hieronder al deed. De twee
formaten delen geen van hun onderscheidende kolomnamen, dus geen risico
op een verkeerde gok; geen van beide herkend geeft een duidelijke
melding in plaats van een gok. Het gedetecteerde formaat blijft zichtbaar
als info-regel. Getest: beide formaten correct herkend, en een
onherkenbaar bestand geeft de nieuwe foutmelding in plaats van stil te
falen.

**2. Beheernav naar drie hoofdlinks** (`beheerpagina.md`, "Wat
beheerbaar is" — deze sectie beschreef de doelstructuur al, maar de
navigatie in de code was nog de oude platte lijst van 7 links):
`components/beheer/BeheerChrome.tsx` toont nu **Applicatie** (Admin-only:
Gebruikers, Algemene teksten; Instellingen en Content-pagina's staan er
met een toelichting waarom nog niet), **Assessments** (Admin-only, was
"Content") en **Organisaties** (Admin: alle, Consultant: eigen) — geen
"Overzicht" meer. `/beheer` stuurt nu door naar `/beheer/organisaties`,
de enige van de drie die ook een Consultant ziet. Nieuwe hub-pagina
`/beheer/applicatie` (met de verplaatste Data-integriteit-check).
"Ingevulde scans" en "Import" hebben geen eigen navlink meer; twee
nieuwe links bovenaan `/beheer/organisaties` houden ze bereikbaar.

**Ook meteen rechtgezet**: `beheerpagina.md`'s eigen "## Status"-sectie
stond weer op een oude versie (zei nog "Gebruikersbeheer... nog te
bouwen", terwijl dat al weken klaar is) — dezelfde terugkerende
concurrent-edit-situatie als eerder deze sessie.

**Getest in de browser**: Als Admin alle drie de links zichtbaar,
actief-status klopt op subpagina's (bijv. `/beheer/scans` licht
"Organisaties" op). Als Consultant alleen "Organisaties" zichtbaar, en
inloggen stuurt meteen daarheen door. `tsc --noEmit`, `eslint .` en
`next build` lopen schoon door.

## 2026-09-30 — Import: onopgemerkte leesfout kon "er gebeurt niets" veroorzaken

**Aanleiding**: "Waarom werkt de import niet?" Zowel het "oude tool"- als
het "eigen export"-formaat bleken end-to-end te werken tegen realistische
testdata (rechtstreeks tegen `lib/import-legacy.ts` getest via `tsx`, én
via de echte `/beheer/import`-pagina met een geïnjecteerd testbestand) —
geen reproductie van een gebroken matching/validatie. Navraag bij Sander:
het scherm doet "helemaal niets" na het kiezen van een bestand.

**Gevonden**: `handleBestand` (`app/beheer/import/page.tsx`) had geen
`.catch()` op `bestand.text().then(...)`. Faalt het lezen van het bestand
zelf, of gooit er iets een fout binnen die keten, dan werd dat een
onopgemerkte "unhandled promise rejection" — geen voorbeeldweergave, geen
melding, precies het "er gebeurt niets"-symptoom. De validatiefuncties
zelf zijn goed met try/catch afgeschermd (ongeldige JSON in `answers` etc.
geeft al netjes een probleemrij), dus dit gat zat specifiek in het
allereerste stapje: het bestand inlezen.

**Doorgevoerd**: `.catch()` toegevoegd met een zichtbare foutmelding
(nieuwe `leesFout`-state, getoond boven de voorbeeldweergave). Geverifieerd
door `File.prototype.text` tijdelijk te laten falen: De melding "Bestand
lezen mislukt: ..." verschijnt nu, in plaats van niets.

**Nog open**: De onderliggende oorzaak van Sanders "niets gebeurt" is
zelf niet gereproduceerd — dit legt 'm alleen bloot in plaats van hem op
te lossen. Volgende stap: opnieuw proberen en de foutmelding delen die nu
verschijnt (of, als het na deze fix wél gewoon werkt, was het probleem
deze silent failure zelf).

## 2026-09-30 — Rol als extra veld op het inlogscherm

**Aanleiding**: "Bij het inloggen bij beheer wil ik de rol kunnen kiezen
admin of consultant." Gevraagd via `AskUserQuestion` hoe dat moest werken
— gekozen: rol als extra veld náást het bestaande e-mail/wachtwoord-
formulier, geen los sneltoegang-pad zonder wachtwoord.

**Doorgevoerd**: `zoekGebruikerVoorLogin` (`lib/gebruikers-store.ts`)
en `login` (`lib/admin-auth.ts`) kregen een derde parameter `rol`.
Inloggen lukt alleen als e-mail, wachtwoord én de gekozen rol allemaal
kloppen voor hetzelfde account — een Consultant die "Admin" selecteert
komt er dus niet in, met dezelfde foutmelding als een verkeerd
wachtwoord (geen aparte melding die zou verklappen dát de rol het
probleem was). `components/beheer/BeheerLoginForm.tsx` kreeg de
dropdown. `beheerpagina.md`, Toegang, bijgewerkt (en de status daar
tegelijk teruggezet: was weer teruggevallen op de oude "alle
beheeraccounts dezelfde rechten"-tekst van vóór de RBAC-bouw).

**Getest in de browser**: Admin-account + "Consultant" geselecteerd →
geweigerd. Admin-account + "Admin" geselecteerd → gelukt. `tsc
--noEmit` en `eslint .` schoon.

## 2026-09-30 — E-mailadres altijd genormaliseerd (getrimd, lowercase)

**Aanleiding**: "Fix import met nieuwe MD." `datamodel.md`, Respondent,
was aangevuld met een nieuwe, harde regel: e-mailadres altijd
genormaliseerd (getrimd, lowercase) vóór opslag én bij elke vergelijking
— ook bij Respondent-matching in uitnodigen en import, en hetzelfde voor
`Gebruiker.email`. De bestaande code normaliseerde alleen bij de
vergelijking zelf (`.trim().toLowerCase()` aan beide kanten van een
`===`), niet bij opslag: Een nieuw lid/gebruiker kreeg zijn e-mailadres
met de originele schrijfwijze/hoofdletters opgeslagen. Werkte toevallig
nog goed zolang alle vergelijkingen zelf ook normaliseerden, maar was
een tikkende tijdbom zodra een plek dat een keer vergat.

**Doorgevoerd**: Eén gedeelde `normaliseerEmail` (`lib/email.ts`),
gebruikt bij elke plek waar een e-mailadres wordt opgeslagen of
vergeleken: `nodigLidUit`, `voegLeadToe`, `voerLegacyImportUit`
(`lib/db.ts`), `maakGebruiker`, `zoekGebruikerVoorLogin`
(`lib/gebruikers-store.ts`), en het wijzigen van een Gebruiker
(`app/beheer/gebruikers/[gebruikerId]/page.tsx`). Ook met terugwerkende
kracht: `normaliseerOrganisatie` (`lib/db.ts`) en `parseSnapshot` in
`lib/gebruikers-store.ts` normaliseren nu ook bestaande e-mailadressen
uit oudere localStorage-data bij het inlezen, zodat matching ook daar
blijft werken.

**Getest in de browser**: Ingelogd met `"  Admin@Coniche.NL  "` (spaties
+ hoofdletters) tegen het bestaande, kleine-letters wachtwoord — werkt.
`tsc --noEmit`, `eslint .` en `next build` lopen schoon door.

**Losstaand, ook deze sessie**: `.claude/launch.json` kan geen pad
meenemen in een localhost-`url` (de preview-tool weigert dat) — Sander
wil de preview altijd op `/beheer` starten in plaats van de publieke
homepage. Vastgelegd als geheugen-item in plaats van in de launch-config:
voortaan expliciet naar `/beheer` navigeren direct na elke
`preview_start` voor dit project.

## 2026-09-30 — Volledige spec-audit: alle MD's tegen de code gelegd

**Aanleiding**: "Ik wil dat je alle specs in de MD files heel zorgvuldig
bekijkt en verwerkt." Alle specs (behalve wat al net was doorgenomen)
systematisch tegen de code gelegd via 6 parallelle deelaudits (content/
bouwstenen, AI-scan, Zorgscan + bouwstenenmodel-visual, 2030 + privacy,
exports, import + SBI), plus een eigen doorlichting van `datamodel.md`'s
`Assessment`/`Bouwblok`-types.

**Doorgevoerd (concrete bugs, geen spec-keuzes)**:

- `data/ai-domeinen-content.ts`: ontbrekende zin bij AI-domein 2
  toegevoegd (stond wel in `visie-ai-klantcontact.md`, was niet
  overgenomen), plus een stale bestandsverwijzing in de bovenste comment
  gecorrigeerd (`app/ai-domeinen/page.tsx` bestaat niet, is `app/ai-scan/
  page.tsx`).
- `app/klantcontact-2030/page.tsx`: ontbrekende `<h2>Geen vast
  eindbeeld</h2>` toegevoegd — enige sectie zonder kop, verder klopte de
  hele pagina woordelijk met `content-2030.md`.
- `app/privacy/page.tsx`: sectie 6 ("Wie de gegevens kan zien") miste de
  Admin-uitzondering, de hele Lead-regel en "e-mailverzending"; sectie 7
  ("Beveiliging") miste de 2FA-zin. Beide teruggezet conform
  `privacy-pagina.md`, en de Lead-regel geactualiseerd naar wat er
  inmiddels staat ("resultaten van zijn toegewezen Metingen", niet "de
  hele organisatie" — dat laatste was toch al nooit gebouwd).
- `lib/pdf/build-html.ts`: de kop "Per categorie" boven het staafdiagram
  stond hard gecodeerd, ook voor de AI-scan (die geen categorieën heeft).
  Gebruikt nu `isVlakkeAssessment`, zoals `components/ResultsView.tsx`
  al deed.
- **AI-scan resultatenscherm, horizontale balk** (CLAUDE.md schermflow
  punt 6): "Scores per Domein" gebruikte dezelfde verticale
  `CategoryBarChart` als de categorieën-versie — de spec vraagt expliciet
  om een horizontale balk per domein. `CategoryBarChart` kreeg een
  `horizontaal`-modus (recharts `layout="vertical"`), aangezet via
  `isVlakkeAssessment` in `ResultsView`. Getest: Klantcontact-scan
  ongewijzigd (verticaal), AI-scan nu horizontaal en aflopend gesorteerd.
- **Bulk-CSV-export op de organisatiedetailpagina**: stond er nog
  helemaal niet (`export-csv.md` vroeg hier expliciet om, als plek voor
  bulk-export binnen één organisatie) — toegevoegd aan
  `ScanUitvoeringBlok` in `app/beheer/organisaties/[organisatieId]/
  page.tsx`, hergebruikt dezelfde `lib/csv-export.ts`-functies als het
  globale overzicht.
- **Geen bevestiging vóór verwijderen in het contentbeheerscherm**: Een
  categorie/bouwblok/vraag verwijderen kon zonder enige confirmatie.
  Toegevoegd als stopgap (`confirm()` per actie,
  `app/beheer/content/[assessmentId]/page.tsx`) — de eigenlijke
  archiveer-in-plaats-van-verwijderen-logica uit `datamodel.md` bestaat
  nog niet, zie de open punten hieronder.
- Kleine naamgevings-inconsistenties tussen specs rechtgezet
  ("Klantcontact visie & strategie", "Financial control",
  "Positionering klantcontact" — kleine letter, matcht de code) in
  `visie-coniche.md` en `coniche_bouwstenen.md`.

**Doorgevoerd (documentatiecorrecties, geen gedragswijziging)**:

- `datamodel.md`, `Assessment`: `featureCards`,
  `bouwblokEenheidEnkelvoud`/`Meervoud` toegevoegd (bestonden in de code,
  stonden nergens in het datamodel); `organisatieVelden` als veld
  verwijderd (is platformbreed geworden, `data/organisatie-velden.ts` —
  een stille, nooit doorgevoerde keuze uit `datamodel-rbac-voorstel.md`);
  `icoon`-comment rechtgezet (was weer "letterlijke emoji" met de allang
  teruggedraaide stethoscoop-verwijzing).
- `datamodel.md`, `Bouwblok`: `centraleVraag` bestaat niet als veld —
  gecorrigeerd naar de werkelijke opzet (losse lookup-tabel per
  Assessment-type, gekoppeld op `volgnummer`/id-prefix,
  `lib/bouwblok-info.ts`), met de twee ontdekte gevolgen expliciet
  vastgelegd: Een zelf aangemaakt bouwblok krijgt nooit een centrale
  vraag, en het "Toelichting"-veld in het contentbeheerscherm heeft voor
  de 3 bestaande Assessment-types geen zichtbaar effect. Zelfde correctie
  doorgevoerd in `ai-domeinenmodel-visual.md` en
  `bouwstenenmodel-visual.md`, die dezelfde onjuiste claim maakten.
- `datamodel.md` deel 2: statusregel bovenaan was weer teruggevallen op
  "Voorstel, wordt gebouwd samen met de database" — rechtgezet naar wat
  er inmiddels allemaal staat (Gebruikers, Lead-rol, aggregatie) en wat
  echt nog op een backend wacht.
- `inhoudelijk-fundament.md`: de claim dat niets wordt doorgevoerd voordat
  een bouwsteen-status op `akkoord` staat, klopte niet — alle content
  stond allang live terwijl alle 15 bouwstenen nog op `Concept` staan.
  Rechtgezet: De status is een redactionele tracker, geen technische
  gate.
- `privacy-pagina.md`: statusregel ("nog niets van overgenomen") en de
  footer-verwijzing naar de inmiddels verwijderde "Beheer"-link
  rechtgezet.
- `export-csv.md`: "geen bulk-export op het globale overzicht" was niet
  (meer) waar — het globale overzicht staat bulk-export toe, maar
  uitgeschakeld zodra de selectie meer dan één organisatie beslaat.
  Vastgelegd als bewuste, gelijkwaardige oplossing voor hetzelfde
  datavermenging-risico, naast de nieuw toegevoegde plek op de
  organisatiedetailpagina.
- `CLAUDE.md`: bestandenindex kreeg `v1-aanpassingen.md` en
  `coniche_bouwstenen.md` (stonden er niet in, terwijl ze allebei actief
  gebruikt worden); de nav-voorbeeldzin bij punt 5 verwees nog naar "←
  Terug naar site vanuit beheer", die actie bestaat niet meer.
- `datamodel-rbac-voorstel.md`: statusregel toegevoegd die vastlegt dat
  dit voorstel op vrijwel elk punt anders is uitgevallen dan wat
  uiteindelijk gebouwd is (met één uitzondering: platformbrede
  organisatievelden, die wel is overgenomen).

**Bewust niet zelf opgelost, vastgelegd in `v1-aanpassingen.md`**:

- **Zorgscan-content**: 29 van de 60 vraagteksten blijken woordelijk
  gelijk aan het Klantcontact-template — dus niet sector-vertaald, in
  tegenspraak met wat `content-zorgscan.md` beweerde. Dit is
  inhoudelijke scaninhoud voor een echte doelgroep (zorgorganisaties);
  vraagt Joost/Sander's input, geen aanname die ik er zelf in typ.
- **Content archiveren i.p.v. verwijderen**: `datamodel.md` beschrijft
  dit als bedoeld gedrag, maar er is geen `gearchiveerd`-veld en geen
  logica — alleen de bevestigingsvraag hierboven is als stopgap
  toegevoegd. De eigenlijke functie is een grotere klus.
- **`datamodel-rbac-voorstel.md` laten staan of verwijderen**: Nu als
  historisch archief gemarkeerd, definitieve keuze aan Sander.
- **"Toelichting"-veld zonder zichtbaar effect**: Of dit acceptabel is
  zolang het maar gedocumenteerd staat, of dat het contentbeheerscherm
  een waarschuwing verdient.

**Niet aangeraakt, want al consistent**: import/SBI (`import-scans.md`,
`sbi-indeling.md`), InDesign-export, PDF-export voor de Zorgscan,
`gewicht`-velden, de bouwstenenmodel-visual/ai-domeinenmodel-visual
routing en modal-hergebruik, en alle 15×4/8×5 vraagstructuren.

**Getest**: `tsc --noEmit`, `eslint .`, `next build` schoon. In de
browser: AI-scan-resultaten tonen een horizontale, aflopend gesorteerde
balk (Klantcontact-scan ongewijzigd verticaal), bulk-export op de
organisatiedetailpagina werkt, privacy- en 2030-pagina tonen de
aangevulde tekst. Testdata na afloop opgeruimd.

## 2026-09-30 — Vier nieuwe MD's verwerkt: Toegang-scherm, Algemene teksten, Meting-samenvalling

**Aanleiding**: "Verwerk de 4 nieuwe MD's" — CLAUDE.md, `datamodel.md`,
`stylesheet.md` en `beheerpagina.md` bleken tussentijds fors uitgebreid
(publiek/beheer-scheiding aangescherpt, scherm 4a "Toegang", Algemene
teksten, een nieuwe 3-links beheer-IA, Instellingen, 2FA/TOTP-uitwerking,
Verificatie-blokkade, en het samenvallen van een eigen Meting met een
toegewezen Meting bij een Lead).

**Weer een gedeeltelijke terugval**, zelfde terugkerend patroon: de
RBAC-statusregels in `beheerpagina.md` ("Toegang", "## Status",
Rolbadge) en `datamodel.md` deel 2 (de openingsalinea) stonden weer op
een oudere, van-vóór-de-RBAC versie — rechtgezet zonder Sander's
intussen toegevoegde nieuwe content te verliezen. Ook een sinds eerder
al stale referentie in CLAUDE.md ("← Terug naar site vanuit beheer" in
de generieke nav-voorbeeldzin) rechtgezet: Beheer heeft inmiddels geen
exit-actie meer, zie hieronder.

**Concreet gebouwd, want zelfstandig en niet afhankelijk van een nog
ontbrekende backend**:

- **Scherm 4a, "Toegang"** (`app/toegang/page.tsx`, CLAUDE.md sectie 3):
  Publiek, e-mailveld + "Versturen", vaste neutrale bevestigingstekst.
  Geen echte code/link verstuurd (vraagt de Coniche-mailserver,
  `backlog.md`). Bereikbaar via een nieuwe "Inloggen"-link op scherm 1
  ("Kies jouw assessment"), op de identiteitsmenu-plek in `.nav-right`
  (`PageWithChrome` kreeg hiervoor een nieuwe `identiteitMenu`-prop).
- **Footer**: "Beheer"-link verwijderd (`components/SiteFooter.tsx`) —
  nu alleen nog "Privacy", conform stylesheet.md's aangescherpte
  publiek/beheer-scheiding.
- **Beheer-nav**: "← Terug naar site" en de scheidingslijn ervoor
  verwijderd (`components/beheer/BeheerChrome.tsx`) — Uitloggen is nu de
  enige weg uit beheer, conform `beheerpagina.md`'s expliciete
  "hierbij vervallen".
- **Algemene teksten** (`datamodel.md`, `AlgemeneTekst`;
  `beheerpagina.md` punt 2a): `lib/algemene-teksten-store.ts` (zelfde
  localStorage-patroon als de andere stores), nieuw scherm
  `/beheer/teksten` (Admin-only, `magAlgemeneTekstenBeheren`), en de
  eerste tekst (`mijnMetingenIntro`) die nu op "Mijn metingen"
  (`app/s/[code]/page.tsx`) verschijnt in plaats van hardcoded te zijn.
- **Meting-samenvalling bij een Lead** (`beheerpagina.md` punt 6a, "Valt
  een eigen Meting samen met een toegewezen Meting"): Is een Lead voor
  dezelfde Meting ook zelf respondent, dan toont "Mijn metingen" nu één
  kaart (`EigenEnLeadMetingKaart`) met "Bekijk jouw resultaten" (alleen
  als de eigen invulling afgerond is) naast "Bekijk de resultaten van de
  hele meting" — niet langer twee losse kaarten.

**Bewust nog niet gebouwd, met reden**: De volledige herschikking van de
beheer-nav naar drie links (Applicatie/Assessments/Organisaties) — raakt
routing/IA breed en de helft van de onderliggende schermen (Instellingen,
Content-pagina's-editor) bestaat nog niet, dus eerst de losse onderdelen.
Instellingen (`sessieDuurUren`) en Verificatie-blokkade opheffen: hebben
allebei een `VerificatieCode`/`ToegangsSessie` nodig die nog niet bestaat
(wacht op de backend) — de gekozen defaultwaarden staan al vast in
`datamodel.md`. Content-pagina's beheerbaar maken (punt 11): het
onderliggende datamodel is in het document zelf nog als open punt
gemarkeerd.

**Getest in de browser**: "Inloggen" → "Toegang" → e-mail versturen →
neutrale bevestiging. Footer toont alleen Privacy. Beheer-nav toont geen
"Terug naar site" meer. Een Lead aangemaakt die tegelijk zelf
uitgenodigd is voor dezelfde Meting ("Ook Lead maken"), invulling op
"afgerond" gezet: "Mijn metingen" toonde de samengevoegde kaart met
beide knoppen. `/beheer/teksten` opgeslagen tekst kwam meteen terug op
"Mijn metingen". `tsc --noEmit`, `eslint .` en `next build` lopen schoon
door. Testdata na afloop uit localStorage verwijderd.

## 2026-09-30 — Lead-rol en Meting-niveau resultatenaggregatie

**Aanleiding**: Vervolg op de vorige entry — Sander koos expliciet "Nu
doorbouwen" toen gevraagd of de Lead-rol en de aggregatie er in dezelfde
beurt bij moesten (`beheerpagina.md` punt 6a, `datamodel.md` deel 2,
`RespondentRolMeting`).

**Datamodel**: `OrganisatieLid.leadMetingIds: string[]` (`lib/types.ts`)
— `ScanUitvoering.id`'s waar dit lid Lead-toegang toe heeft. Leeg = geen
Lead; er is bewust geen apart "is Lead"-veld, want een Lead bestaat per
spec niet zonder minstens 1 gekoppelde Meting. Genormaliseerd in
`normaliseerOrganisatie` (`lib/db.ts`) voor oudere localStorage-data
zonder dit veld.

**`lib/db.ts`**:
- `nodigLidUit` kreeg een derde parameter `ookLeadMaken` — voegt de
  scanUitvoeringId toe aan `leadMetingIds` naast de uitnodiging zelf.
  Ook hergebruikt voor "Vragenlijst sturen" vanaf een bestaande Lead
  (zelfde functie, met `ookLeadMaken: true` en het e-mailadres van de
  Lead).
- Nieuw: `voegLeadToe` (maakt/hergebruikt een lid zónder ScanInvulling,
  met een verplichte, niet-lege lijst Metingen) en `zetLeadMetingen`
  (zet de volledige lijst in één keer — alles uitvinken trekt de
  Lead-rol in).
- `RespondentContext` (gebruikt door "Mijn metingen") kreeg
  `leadMetingen: ScanUitvoering[]`, los van de eigen `invullingen`.

**Gedeelde scoreberekening**: `gemiddeldeAntwoordenVoorMeting` verhuisd
naar `lib/scoring.ts` (was inline in de Rapportage-pagina) — dezelfde
functie voedt nu zowel `/beheer/rapportage/[scanUitvoeringId]` als de
nieuwe Lead-resultatenpagina, conform datamodel.md's "één gedeelde
functie, geen tweede herimplementatie".

**Nieuwe route**: `/s/[code]/resultaten/[scanUitvoeringId]` — de
Lead-variant van de Rapportage-pagina, bereikbaar via de persoonlijke
link in plaats van een beheerlogin. Beveiligd op
`lid.leadMetingIds.includes(scanUitvoeringId)`: een toegangscode zonder
Lead-toegang tot die specifieke Meting krijgt "Geen toegang", geverifieerd
in de browser met een tweede, niet-gekoppelde toegangscode.

**Admin-UI** (`app/beheer/organisaties/[organisatieId]/page.tsx`):
- Checkbox "Ook Lead maken" naast het bestaande uitnodigen-formulier per
  Meting.
- Nieuwe sectie "Leads" (Admin-only zichtbaar via `magLeadToekennen`):
  lijst van huidige Leads met per Meting een checkbox
  (`zetLeadMetingen`) en, waar nog geen invulling bestaat, een knop
  "Vragenlijst sturen"; een inklapbare "+ Lead toevoegen"-vorm (naam,
  e-mail, verplichte multi-select van minstens 1 Meting).

**Respondentkant** (`app/s/[code]/page.tsx`): nieuwe sectie "Metingen
waar je Lead van bent", los van "Mijn metingen" hierboven. Per Meting:
aantal respondenten/afgerond, een compact uitnodigen-formulier
(`respondenten.uitnodigen: toegewezen metingen`) en, zodra er
minstens 1 afgeronde scan is, "Bekijk resultaten" naar de nieuwe route.

**Getest in de browser**: Een Lead aangemaakt zonder eigen invulling,
bevestigd dat "Mijn metingen" leeg blijft en alleen de Lead-toegang
toont; via de Lead's eigen pagina een respondent uitgenodigd; twee
invullingen met testantwoorden op "afgerond" gezet; de resultatenpagina
gaf dezelfde score als de bestaande beheer-Rapportage zou geven; een
andere, niet-gekoppelde toegangscode kreeg terecht "Geen toegang" op
dezelfde resultaten-URL. `tsc --noEmit`, `eslint .` en `next build`
lopen schoon door. Testdata na afloop uit localStorage verwijderd.

**Doc-fixes tijdens het verwerken**: `beheerpagina.md` punt 6a sprak nog
van bereik "aangemaakt" in plaats van "eigen" (verouderde term naast de
al bijgewerkte Rechtenmatrix) — rechtgezet. `v1-aanpassingen.md` punt 3
bijgewerkt: "Organisatie-toegang toewijzen" lost het zichtbaarheidsprobleem
van `aangemaaktDoor: null`-organisaties deels op, maar er is nog geen UI
om `aangemaaktDoor` zelf over te zetten buiten het
gedeactiveerde-Consultant-pad.

## 2026-09-30 — Organisatie-toegang toewijzen (deel van de nieuwe RBAC-MD's)

**Aanleiding**: "Verwerk nieuwe MD's." `beheerpagina.md` en `datamodel.md`
bleken flink uitgebreid met een grote nieuwe rechtenlaag: `bereik "eigen"`
(niet meer alleen `aangemaaktDoor`, ook `OrganisatieToegang`/
`toegewezenAan`: een Admin kan een organisatie aan een andere Consultant
toewijzen, bovenop het eigenaarschap van de aanmaker), plus een hele
nieuwe Lead-rol (`RespondentRolMeting`) en Meting-niveau
resultatenaggregatie.

**Twee bestanden waren tussentijds teruggevallen** op een ouder moment
(zelfde terugkerende patroon als eerder deze sessie): De RBAC-statusregel
in `beheerpagina.md`/`datamodel.md` deel 2 ontbrak. Teruggezet, zonder
Sander's intussen toegevoegde nieuwe content (Organisatie-toegang,
Lead-rol, code-referenties uit de proza gehaald — zie de vorige entry's
patroon) te verliezen.

**Doorgevoerd, het "eigen"-deel van de nieuwe rechtenlaag**:

- `Organisatie.toegewezenAan: string[]` (`lib/types.ts`): gebruikerId's
  van Consultants die een Admin deze organisatie expliciet toewees,
  bovenop `aangemaaktDoor`.
- `lib/rechten.ts`: `magOrganisatieToegang` (hernoemd van
  `magOrganisatieBeheren`, alias behouden) checkt nu ook `toegewezenAan`.
  Vier van de vijf eerder "conservatief dichtgezette" permissies
  (`organisaties.verwijderen`, `respondenten.leadToekennen`,
  `respondenten.verwijderen`, `scans.verwijderen`) zijn nu expliciet
  "eigen" in de matrix, dus opengezet voor een Consultant, scoped per
  organisatie — alleen `content.beheren` blijft "te bevestigen"/Admin-only.
- **"Organisatie-toegang toewijzen"**, Admin-only, op de organisatie-
  detailpagina: Multi-select van actieve Consultants (min. de eigenaar
  zelf), aan-/uitvinken zet direct `toegewezenAan` om.
- **"Aangemaakt door"** nu altijd zichtbaar (niet alleen voor Admin): Op
  de organisatielijst per rij, en op het organisatie-detailscherm samen
  met wie er verder toegewezen is.
- **"Openen"-knop** naast "Kopieer link", op zowel de net-uitgenodigd-
  bevestiging als de bestaande respondentenlijst: Opent de publieke link
  direct in een nieuw tabblad.

**Nog niet gebouwd, bewust apart gehouden gezien de omvang**: De hele
Lead-rol (`RespondentRolMeting`, "Lead toevoegen"/"Lead-toegang beheren"/
"Vragenlijst sturen", het "Ook Lead maken"-vinkje, en de Lead's eigen
weergave op zijn persoonlijke link) en de Meting-niveau
resultatenaggregatie die zowel Organisatie-resultaten (beheer) als de
Lead-pagina nodig hebben. Dit raakt zowel de beheer- als de
respondentkant met substantiële nieuwe schermen — apart voorgelegd aan
Sander in plaats van er in dezelfde beurt doorheen te bouwen.

**Getest in de browser**: Een testconsultant aangemaakt, een organisatie
aan hem toegewezen via de nieuwe UI, bevestigd dat "Aangemaakt door"/"Ook
toegewezen aan" live bijwerkt, en dat de Consultant de organisatie
daarna zelf kan zien en openen (niet alleen de eigenaar). Testdata na
afloop opgeruimd. `tsc --noEmit`, `eslint .` en `next build` lopen schoon
door.

## 2026-09-30 — Zorgscan-icoon toch een hartje-outline

**Verzoek van Sander**, meteen na de vorige entry: "Maak van de icon voor
Zorg een hart outline in de stijl van de 2 andere icons" — terugdraaien
van de stethoscoop-emoji naar een eigen SVG-hartje, in dezelfde
lijnstijl als "target" (Klantcontact Volwassenheid) en "sparkle"
(AI-volwassenheid).

**Afwijking van wat net nog gedocumenteerd stond**: `content-zorgscan.md`
noemde de stethoscoop expliciet als Joost's keuze, "boven een hartje-
outline". Dit verzoek draait die keuze terug — gemeld, niet stilzwijgend
gecorrigeerd, zie `content-zorgscan.md`.

**Doorgevoerd**:

- `components/icons/AssessmentIcons.tsx`: `HeartIcon` teruggezet, nu als
  outline (stroke, geen fill — gebruikt de standaard lijnstijl van
  `IconBase`, net als "target"), niet de eerder verwijderde gevulde
  variant.
- `data/zorgscan-assessment.ts`: `icoon: "🩺"` → `icoon: "heart"`.
- `content-zorgscan.md` en `datamodel.md` (het `Assessment.icoon`-
  voorbeeld) bijgewerkt: Niet langer de stethoscoop als voorbeeld, met
  een duidelijke aantekening dat dit teruggedraaid is.

**Getest**: Homepage toont het hartje-icoon, visueel gelijk aan de
stroke-stijl van de andere twee scan-iconen. `tsc --noEmit`, `eslint .`
en `next build` lopen schoon door.

**Nagekomen, zelfde verzoeklijn**: Het hartje oogde daarna nog iets te
dominant naast de cirkels/sparkle (een hart vult de 24x24 viewBox
optisch voller). Op verzoek 0.9x verkleind, rond het midden van de
viewBox (`<g transform="translate(1.2 1.2) scale(0.9)">` in
`HeartIcon`), niet via de buitenste `width`/`height` (die blijven gelijk
aan de andere iconen, alleen de vorm zelf krimpt lichtjes).

## 2026-09-30 — Nieuwe MD's verwerkt: bestandshernoemingen, anonimisering, icoon-bug

**Aanleiding**: "Kijk naar de laatste nieuwe MD's en voer wijzigingen
door." Sander had, gelijktijdig met eerder werk, `admin-beheerpagina.md`
en `import-legacy-scans.md` hernoemd naar `beheerpagina.md` en
`import-scans.md` (als losse, voorlopige kopieën), en in dat laatste
bestand een echte klantnaam die in de vraagteksten-CSV van de historische
import terecht was gekomen, geanonimiseerd.

**Hernoemd, met behoud van de meest recente inhoud** (de losse kopieën
die Sander achterliet waren gebaseerd op een ouder moment, van vóór het
role-based-access-werk van vandaag — dat werk stond er niet in, dus de
hernoeming is toegepast op de huidige inhoud, niet op die oudere kopie):

- `admin-beheerpagina.md` → **`beheerpagina.md`**
- `import-legacy-scans.md` → **`import-scans.md`**, mét de anonimisering
  (een echte klantnaam vervangen door `<Organisatie>`/`<organisatie-
  slug>`-placeholders in de voorbeelden en het scenario "twee organisaties
  die achteraf dezelfde klant blijken").

Alle kruisverwijzingen naar de oude bestandsnamen bijgewerkt, in elke
.md- en code-comment in de repository (`CLAUDE.md`, `stylesheet.md`,
`export-csv.md`, `sbi-indeling.md`, `backlog.md`, `v1-aanpassingen.md`,
`datamodel.md`, `export-indesign.md`, en alle `app/beheer/*`/`lib/*`
bronbestanden die ernaar verwezen in een commentaarregel). Dezelfde
klantnaam ook geanonimiseerd op de drie overige plekken waar hij nog
stond: `changelog.md` (drie historische vermeldingen) en een
codevoorbeeld in `lib/pdf/bestandsnaam.ts`.

**Twee losse reverts van eerder werk teruggezet** (dezelfde bestanden
waren, door hetzelfde gelijktijdige opslaan, teruggevallen naar een
ouder moment): De RBAC-statusalinea in `datamodel.md` deel 2, en (na
controle) bevestigd dat `content-zorgscan.md`'s eigen alinea over de
hergebruikte bouwsteen-content wél intact was — dat was een foutieve
aanname bij het controleren, geen echte revert.

**Nieuw gevonden bij het doorlezen: een echte bug**. `datamodel.md`
specificeert `Assessment.icoon` nu expliciet als "letterlijke emoji" —
`content-zorgscan.md` vermeldt zelfs dat Joost bewust "🩺" (stethoscoop)
koos boven een hartje-outline voor de Zorgscan. Het Icoon-veld in het
contentbeheerscherm was echter een vaste `<select>` met alleen de twee
bestaande SVG-icoonsleutels ("target", "sparkle") — een beheerder kon
dus nooit zelf een emoji instellen. Rechtgezet:

- `data/zorgscan-assessment.ts`: `icoon: "heart"` → `icoon: "🩺"` (de
  daadwerkelijke, door Joost gekozen emoji, in plaats van de eerder door
  mij gebouwde hartje-SVG die dus niet was wat Joost koos).
- De inmiddels ongebruikte `HeartIcon`/`"heart"`-sleutel verwijderd uit
  `components/icons/AssessmentIcons.tsx`.
- Icoon-veld in `/beheer/content/[assessmentId]` van een `<select>` naar
  een vrij tekstveld, met live preview en een toelichting over de twee
  resterende SVG-sleutels.

Gedocumenteerd als opgeloste afwijking in `v1-aanpassingen.md`.

**Getest**: Homepage toont 🩺 correct naast "Klantcontact Volwassenheid –
Zorg"; het Icoon-veld in het contentbeheerscherm toont nu een vrij
tekstveld met werkende preview. `tsc --noEmit`, `eslint .` en
`next build` lopen schoon door.

## 2026-09-30 — Role based access (Admin/Consultant), prototype-niveau

**Aanleiding**: "Maak de role based access volgens specificaties in de
MD's" + twee nieuwe MD-wijzigingen verwerkt (`beheerpagina.md`
punt 9 "Gebruikers", en `stylesheet.md`'s nieuwe Rolbadge). Gebouwd op
`datamodel.md` deel 2 (Rollen, rechten en inlog), niet op het losse,
expliciet nog niet gevalideerde `datamodel-rbac-voorstel.md` (dat
document zegt zelf: "niets van overgenomen").

**Nieuw**:

- **`Gebruiker`** (`lib/types.ts`, `lib/gebruikers-store.ts`): Admin- en
  Consultant-accounts, prototype-niveau (localStorage, platte
  wachtwoorden, geen 2FA — zelfde disclaimer als het bestaande
  `lib/admin-auth.ts`). Bij eerste gebruik gezaaid met de al werkende
  inloggegevens (`admin@coniche.nl`/`coniche2026`), zodat een bestaande
  sessie kan blijven inloggen.
- **`/beheer/gebruikers`**: Lijst, aanmaken, wijzigen, deactiveren (nooit
  hard verwijderen). "Minimaal 1 actieve Admin"-check blokkeert de
  laatste Admin. Deactiveren van een Consultant met eigen organisaties
  vraagt verplicht een nieuwe eigenaar voor die organisaties
  ("eigenaarschap overzetten"). Ook "Heractiveren" toegevoegd — niet
  letterlijk in de spec, maar zonder terugweg zou deactiveren
  onomkeerbaar zijn.
- **`lib/admin-auth.ts` herbouwd** op `Gebruiker` in plaats van twee
  hardcoded inloggegevens: `login()` zoekt nu een Gebruiker op
  e-mail+wachtwoord, `useIngelogdeGebruiker()` geeft de volledige
  Gebruiker terug (rol, naam, e-mail) i.p.v. alleen een boolean.
- **`lib/rechten.ts`** (nieuw): Centrale rechtencontroles uit de
  Rechtenmatrix, code in plaats van losse `Rol`/`Permissie`/
  `RolPermissie`-datarecords (met precies 2 beheerrollen en een matrix
  die voor de helft "te bevestigen" is, zou dat nu ongebruikte
  flexibiliteit zijn — toegelicht in `lib/types.ts` bij `Gebruiker`).
  Bereik "aangemaakt" toegepast op Organisaties (lijst + detail-toegang)
  en Ingevulde scans (globaal overzicht) voor een Consultant, via het
  nieuwe veld `Organisatie.aangemaaktDoor`.
- **Rolbadge** (`stylesheet.md`): Vervangt de vaste zwarte "Beheer"-badge
  naast het logo aan de beheerkant door een badge in de rolkleur (Admin
  blauw, Consultant oranje) met de echte rol van de ingelogde Gebruiker
  — geen losse aanduiding meer, de vraag die `stylesheet.md` daarover
  openliet ("hoe wordt de rol bepaald") is hiermee beantwoord.
- **Accountmenu** (`beheerpagina.md`): Dropdown-knop met
  e-mailadres, uiterst rechts ná "← Terug naar site". Inhoud: niet-
  klikbare rij "e-mail (Rol)", dan "Uitloggen". `DropdownKnop` kreeg
  hiervoor een optionele niet-klikbare header-rij.
- **Nav**: "Gebruikers" tussen "Organisaties" en "Ingevulde scans",
  alleen zichtbaar voor Admin. "Content" ook Admin-only (zie hieronder).

**Conservatieve standaardkeuzes, expliciet als open vraag in
`v1-aanpassingen.md`**: Vijf permissies staan in de Rechtenmatrix zelf al
als "te bevestigen" voor een Consultant (`content.beheren`,
`organisaties.verwijderen`, `respondenten.leadToekennen`,
`respondenten.verwijderen`, `scans.verwijderen`) — hier allemaal op geen
toegang gezet, in lijn met "minimale toegang per rol", tot Sander
bevestigt of een Consultant sommige hiervan wél moet kunnen. Concreet:
een Consultant ziet de link "Content" niet en kan niets verwijderen
(organisaties, respondenten, scans) — alleen Admin.

**Niet gebouwd** (vereist een echte backend, `datamodel.md` deel 2):
2FA, `Sessie`, `VerificatieCode`/`ToegangsSessie`, `AuditEvent`, en de
hele organisatiekant (Lead heeft nog geen eigen ingelogde weergave —
`ROL_KLEUR` heeft er wel alvast een kleurtoken voor klaarstaan).

**Getest in de browser**: Ingelogd als de gezaaide Admin (blauwe badge,
volledige nav, Accountmenu-inhoud correct). Nieuwe Consultant aangemaakt,
ingelogd (oranje badge, "Gebruikers"/"Content" niet in de nav), een
organisatie aangemaakt en bevestigd dat die correct `aangemaaktDoor` op
deze Consultant krijgt, en dat de organisatielijst voor deze Consultant
alleen die ene organisatie toont (niet de bestaande seed-organisatie,
die geen `aangemaaktDoor` heeft). Testdata na afloop opgeruimd.
`tsc --noEmit`, `eslint .` en `next build` lopen schoon door.

## 2026-09-29 — PDF: minder ruimte rond de oranje streep tussen bouwstenen

**Verzoek van Sander**: Op elke bouwsteenpagina (alle scan-types) mag de
tweede bouwsteen direct onder de oranje streep staan, met ongeveer 1
regel tussenruimte — merkbaar minder dan voorheen.

**Oorzaak van de ruime afstand**: `.streep` (`lib/pdf/build-html.ts`) had
`margin: auto 0` binnen de flex-kolom van de pagina, waardoor de streep
in het midden van de vrije ruimte op de pagina kwam te zweven. Bij een
korter bouwsteen-paar (weinig tekst, geen opmerking) leverde dat een
grote, per pagina wisselende afstand op — precies zo bedoeld toen dit
gebouwd werd (zie de oorspronkelijke code-comment: "de restruimte
verschijnt zo als één ruime tussenruimte..."), maar niet meer gewenst.

**Fix**: `margin: auto 0` vervangen door een vaste, kleine marge.
`.bouwsteen-blok:first-child`'s padding-bottom (voor de streep) van 7mm
naar 3mm, `.streep + .bouwsteen-blok`'s padding-top (na de streep) van
7mm naar 4mm — voor de compacte variant (AI-scan) van 6mm naar 2mm/3mm.
Onbenutte ruimte op een korter paar blijft nu gewoon onderaan de pagina
staan in plaats van rond de streep verdeeld te worden.

**Getest**: Alle drie de scan-types opnieuw geëxporteerd (Klantcontact
Volwassenheid, AI-scan met de compacte variant, en beide nogmaals met
een lange opmerking op het eerste bouwblok van een paar, om te
controleren dat de kleinere marge niet tegen de opmerking aan botst).
Paginatelling ongewijzigd (10/10/9). Pagina's visueel geïnspecteerd:
bouwsteen 2 staat nu direct onder de streep, restruimte valt onderaan de
pagina.

**Doorgevoerd in de specs**, zoals gevraagd: `export-pdf-visual-
volwassenheidsscan.md` (Pagina 2 t/m 9, inclusief het rechtzetten van
"Vier pagina's" naar "Acht pagina's" — 15 bouwstenen in paren is altijd al
acht pagina's geweest, niet vier) en `export-pdf-visual-ai-scan.md` (de
Normaal/Compact-tabel).

## 2026-09-29 — Bug: complete opmaak/beschrijving per bouwsteen ontbrak in de Zorgscan-PDF

**Gemeld door Sander**, na het zij-aan-zij vergelijken van een echte
Klantcontact- en Zorgscan-PDF: "In de zorg scan PDF mis ik de opmaak en
beschrijving per bouwsteen zoals in de andere PDF." De vorige fix (zie
hieronder, dezelfde dag) loste alleen de lege pagina op met een platte
alinea — de rijke opmaak (categorie-eyebrow, "CENTRALE VRAAG"-blok, de
volledige beschrijving) ontbrak nog steeds.

**Oorzaak**: `toelichtingVoor` (`lib/bouwblok-info.ts`) matcht die rijke
content alleen voor bouwblok-id's die met `bb` (Klantcontact
Volwassenheid) of `ai` (AI-scan) beginnen. De Zorgscan heeft eigen id's
(`zorg-...`), dus viel altijd terug op de kale variant. Dezelfde check
zit dubbel in `components/BouwblokForm.tsx` (de toelichting-overlay in
de doorloopflow).

**Fix**: Beide plekken matchen nu ook `zorg-...`-id's, op `volgnummer`,
tegen dezelfde `data/bouwstenen-content.ts` als de Klantcontact
Volwassenheidsscan — de Zorgscan heeft immers exact dezelfde 15
bouwblokken/nummering (sector-variant, `datamodel.md`). Resultaat:
identieke opmaak in de PDF (en de overlay) als het template, met content
die nog niet sector-vertaald is naar patiënt-/cliëntcontact — dat blijft
een open punt voor Joost, nu expliciet zo gedocumenteerd in
`content-zorgscan.md` en `export-pdf-visual-zorgscan.md`.

**Getest**: Zorgscan-PDF opnieuw gegenereerd en pagina 2 en 9 (het
oneven laatste bouwblok) gerenderd als afbeelding, zij-aan-zij vergeleken
met de aangeleverde Klantcontact-PDF — identieke lay-out, nog steeds 10
pagina's, geen overloop. `tsc --noEmit`, `eslint .` en `next build`
blijven schoon.

## 2026-09-29 — Bug: uitleg-alinea ontbrak per bouwblok in de Zorgscan-PDF

**Gemeld door Sander**: "ik mis in de zorg scan PDF de tekst van de
bouwstenen."

**Oorzaak**: `lib/pdf/build-html.ts` bouwt de uitleg per bouwblok op uit
`toelichtingVoor(bouwblok)` (`lib/bouwblok-info.ts`), dat alleen content
teruggeeft voor bouwblok-id's die met `bb` (Klantcontact Volwassenheid)
of `ai` (AI-scan) beginnen. De Zorgscan heeft eigen id's (`zorg-...`,
data/zorgscan-assessment.ts), dus die functie geeft daar altijd
`undefined` terug. De fallback-tak voor dat geval liet daardoor alleen
de bouwblok-naam en de score-badge zien — geen enkele uitlegtekst, ook
niet de gewone `Bouwblok.toelichting` die wél op elk bouwblok staat.
Dezelfde fallback in de doorloopflow (`components/BouwblokForm.tsx`)
toont die tekst wel al correct; alleen de PDF-export had dit gat.

**Fix**: De fallback in `build-html.ts` (`uitlegHtml`) rendert nu ook
`Bouwblok.toelichting` als platte alinea, wanneer er geen rijke content
is. Geverifieerd door de Zorgscan-PDF opnieuw te genereren (API-route
rechtstreeks aangeroepen met demo-antwoorden) en de tekst uit pagina 2
te extraheren: "Kernwoorden: missie en visie, kernwaarden..." staat er nu
onder de titel, vóór de vragentabel. Nog steeds 10 pagina's, geen
paginaverschuiving.

**Gedocumenteerd** in `export-pdf-visual-zorgscan.md` ("Bron van de
tekst": legt nu precies uit welk bouwblok-id-patroon de rijke content
triggert en wat het fallback-pad laat zien) en als opgeloste afwijking
in `v1-aanpassingen.md`.

## 2026-09-29 — export-pdf-visual-zorgscan.md: gecondenseerd en hernoemd

**Vervolg op de vorige entry.** Sander bevestigde beide openstaande
punten uit `v1-aanpassingen.md`:

- `export-pdf-visual-volwassenheidsscan zorg.md` herschreven naar het
  verschillen-patroon van `export-pdf-visual-ai-scan.md`: Alleen wat voor
  de Zorgscan anders is (bestandsnaam, footer-label), met een verwijzing
  terug naar `export-pdf-visual-volwassenheidsscan.md` voor de gedeelde
  elementen. Aangezien de Zorgscan qua paginaopbouw identiek is aan het
  template (zelfde 15 bouwblokken/5 categorieën), is het document nu
  vooral "identiek, met deze twee naamsverschillen" in plaats van een
  volledige herhaling van elke pagina.
- Hernoemd naar `export-pdf-visual-zorgscan.md` (geen spatie meer),
  consistent met `export-pdf-visual-ai-scan.md`.

`CLAUDE.md` (Bestanden-tabel), `content-zorgscan.md` en
`v1-aanpassingen.md` bijgewerkt met de nieuwe bestandsnaam; beide punten
verplaatst van "Actief" naar "Verwerkt in de specs".

## 2026-09-29 — Zorgscan: PDF-bestandsnaam rechtgezet op nieuwe MD

**Aanleiding**: Nieuwe spec `export-pdf-visual-volwassenheidsscan
zorg.md` aangeleverd (PDF-opbouw voor de Zorgscan). Inhoudelijk vrijwel
gelijk aan `export-pdf-visual-volwassenheidsscan.md` — logisch, de
PDF-export is generiek gebouwd over elk Assessment heen (CLAUDE.md,
Uitgangspunten) — maar specificeert wel een expliciete bestandsnaam:
`<Organisatie> Volwassenheidsscan Zorg Report.pdf`.

**Afwijking gevonden en hersteld**: `pdfBestandsnaam`
(`lib/pdf/bestandsnaam.ts`) bouwt de naam als `"{organisatie}
{kortLabel} Report"`. De Zorgscan was gebouwd met `kortLabel:
"Zorgscan"`, dus de PDF zou `<Organisatie> Zorgscan Report.pdf` heten —
niet wat de nieuwe spec voorschrijft. `data/zorgscan-assessment.ts`
aangepast naar `kortLabel: "Volwassenheidsscan Zorg"`; werkt automatisch
door in de PDF-footer, de PDF-bestandsnaam en de InDesign-bestandsnamen
(alle drie generiek op hetzelfde veld). `content-zorgscan.md` bijgewerkt.

**Twee open punten voor Sander, in `v1-aanpassingen.md`** (niet zelf
doorgevoerd): De nieuwe MD is nog bijna een letterlijke kopie van de
bestaande in plaats van een kort verschillen-document zoals
`export-pdf-visual-ai-scan.md` dat al is voor de AI-scan, en heeft een
spatie in de bestandsnaam in plaats van een koppelteken.

**Getest**: `kortLabel` in het contentbeheerscherm en in de opgeslagen
Assessment-data bevestigd als "Volwassenheidsscan Zorg". `tsc --noEmit`,
`eslint .` en `next build` blijven schoon.

## 2026-09-29 — Bug: crash op oudere/beschadigde localStorage-data

**Gemeld door Sander**: In een gewone browser (niet de testomgeving hier)
crashte de app met `TypeError: Cannot read properties of undefined
(reading 'find')` op `organisatie.leden.find(...)` in
`zoekRespondentPerToegangscode` (`lib/db.ts`), bij het openen van een
persoonlijke link.

**Oorzaak**: Die browser had al langer een eigen
`coniche-scan:organisaties`-snapshot in localStorage staan, van vóór een
eerdere wijziging aan het `Organisatie`-type in deze sessie. Er bestaat
geen migratiepad voor de opslag (CLAUDE.md, Status: "Alles staat nog in de
localStorage") — `getSnapshot()` zaait alleen vers wanneer de sleutel
volledig ontbreekt, en leest een bestaande snapshot altijd letterlijk
terug, ook als die niet meer helemaal met het huidige type overeenkomt.
Elke plek in `lib/db.ts` (tientallen aanroepen) ging er vervolgens
klakkeloos van uit dat `organisatie.leden`/`scanUitvoeringen`/
`invullingen` altijd arrays zijn — één organisatie-record zonder `leden`
crasht dan de hele app, niet alleen die ene organisatie.

**Fix**: Nieuwe `normaliseerOrganisatie` in `lib/db.ts`, toegepast in
`parseSnapshot` (dus voor elke lezing, via zowel de hooks als
`laadAlles()`): Zet `leden`/`scanUitvoeringen` altijd naar een array
(leeg als ze ontbreken of geen array zijn), en doet hetzelfde voor
`invullingen` binnen elke `scanUitvoering` en voor `kenmerken`. Geen
inhoudelijke migratie, alleen de vorm rechtgetrokken zodat de rest van de
code veilig kan blijven aannemen dat deze velden bestaan.

**Getest**: Een organisatie-record zonder `leden` en zonder
`invullingen` (exact het gemelde scenario) in localStorage geplant en
`/s/[code]` geopend — toont nu netjes "Ongeldige link" in plaats van te
crashen, en `/beheer/organisaties` toont de kapotte organisatie als "0
respondenten, 0 afgerond" zonder de rest van de pagina mee te trekken.
`tsc --noEmit`, `eslint .` en `next build` blijven schoon.

## 2026-09-29 — Bug: legacy-import verwarde Zorgscan met het template

**Gemeld door Sander**: De laatste CSV-import was een Zorgscan-invulling,
maar kwam binnen als "Klantcontact Volwassenheid" — de twee lijken op
elkaar (zelfde bouwblokken), maar de Zorgscan-vraagteksten zijn anders
geformuleerd.

**Oorzaak**: `detecteerAssessment` (`lib/import-legacy.ts`,
`import-scans.md`, "Assessment- en bouwblok-matching") bepaalde het
scan-type alleen op bouwblok-/domeinnamen. Sinds de Zorgscan bestaat (vorige
changelog-entry) is die aanname niet meer waar: Een sector-variant kopieert
de bouwblok-namen van zijn template één-op-één, dus de Klantcontact
Volwassenheidsscan en de Zorgscan hebben exact dezelfde 15 namen. De functie
liep de Assessment-lijst in vaste volgorde af en gaf de eerste treffer terug
— altijd de Klantcontact Volwassenheidsscan, omdat die als eerste in
`data/assessments.ts` staat, ongeacht welke van de twee het echt was.

**Fix**: `detecteerAssessment` doet er nu een tweede stap bij wanneer de
naam-stap meerdere kandidaten oplevert: De vraagteksten in de CSV
(`questionText`, op volgorde per blok) vergelijken met de vraagteksten van
elke kandidaat. Is er precies één kandidaat waarvan alle vraagteksten
woordelijk overeenkomen, dan is dat het gedetecteerde type. Blijft dat
alsnog onbepaald (bijv. ontbrekende `questionText`, of — in theorie — twee
scan-types met zowel identieke namen als identieke vraagteksten), dan
importeert de tool niets en meldt een duidelijk matchingprobleem, dezelfde
"niet importeren en melden"-regel als de rest van deze import.
`import-scans.md` bijgewerkt met deze tweede stap.

**Bestaande foute data hersteld**: De al geïmporteerde meting
("Huisartsenpraktijk Fictief-2", Legacy-import 2026) stond met
`assessmentId: "klantcontact-volwassenheid"` en antwoorden onder
Klantcontact's vraag-id's (`bb1-v1`, ...) terwijl het de Zorgscan-invulling
was. Rechtgezet met een eenmalige migratie: `assessmentId` naar
`"zorgscan"`, en elke antwoord-/opmerking-sleutel 1-op-1 herschreven naar
de overeenkomstige Zorgscan-id op dezelfde positie (bouwblok-volgnummer +
vraagvolgnummer) — beide Assessments hebben identieke structuur, dus deze
mapping is exact, geen educated guess. Geverifieerd: De resultatenpagina en
`/beheer/scans/...` tonen nu "Klantcontact Volwassenheid – Zorg" met de
echte zorg-vraagteksten en de oorspronkelijke scores (2.0 op alles).

**Getest**: Een synthetische Klantcontact-rij en een synthetische
Zorgscan-rij (identieke bloknamen, eigen vraagteksten) door
`valideerLegacyRijen` gehaald — elk resolvet nu naar het juiste type.
`tsc --noEmit`, `eslint .` en `next build` blijven schoon.

## 2026-09-29 — Zorgscan: eerste echte sector-variant

**Aanleiding**: Sander leverde Joost's bronmateriaal aan (`zorgscan.pdf`,
de PDF-export van een proefinvulling voor een fictieve huisartsenpraktijk,
plus de bijbehorende CSV-export met de 60 vraagteksten in gestructureerde
vorm). Daarmee kon het generieke sector-variant-mechanisme (vorige
changelog-entry) voor het eerst met echte content gevuld worden — het punt
dat toen nog open stond.

**Doorgevoerd**:

- **`data/zorgscan-assessment.ts`**: Nieuw Assessment "Klantcontact
  Volwassenheid – Zorg" (`id: "zorgscan"`, `kortLabel: "Zorgscan"`,
  `afgeleidVanAssessmentId: "klantcontact-volwassenheid"`). Zelfde 15
  bouwblokken, 5 categorieën, volgorde en gewichten (allemaal nog 1) als
  het template — alleen de 60 vraagteksten zijn vervangen door Joost's
  zorg-versie (patiënt-/cliëntcontact, medische/niet-medische
  contactredenen). Toegevoegd aan `data/assessments.ts`, dus voortaan
  standaard aanwezig naast de Klantcontact Volwassenheidsscan en de
  AI-volwassenheidsscan (`CLAUDE.md`, Status).
- **`content-zorgscan.md`** (nieuw): De spec-vastlegging van alle 60
  vraagteksten per bouwblok, zelfde structuur als
  `content-klantcontact-volwassenheid.md`. Bevat een expliciet open punt
  voor Joost: Bouwblok-omschrijving, -toelichting en -tags zijn bewust nog
  niet sector-vertaald — dat stond letterlijk zo genoteerd in zijn
  brondocument ("terminologie in toelichtingenbalkje nog aanpassen op
  zorg(taal)"). Zolang dat niet gebeurd is, valt de toelichting-overlay
  per bouwblok terug op de generieke tekst (bestaand, correct
  fallbackgedrag van `lib/bouwblok-info.ts` — geen rijke "CENTRALE
  VRAAG"-content zoals bij de Klantcontact Volwassenheidsscan, omdat er
  nog geen zorg-versie van `visie-coniche.md` deel 2 bestaat).
- **Nieuw icoon "heart"** (`components/icons/AssessmentIcons.tsx`): De
  twee bestaande scans gebruiken "target"/"sparkle"; de Zorgscan kreeg een
  eigen icoon in plaats van een van die twee te hergebruiken.
- **`data/demo-antwoorden-zorgscan.ts`** + wiring in
  `data/demo-antwoorden-per-assessment.ts`: Demo-data met spreiding voor
  de "Voorbeeld-output"-preview (scherm 3), naar het patroon van
  `data/demo-antwoorden.ts` — niet de vlakke "alles 2" van Joost's
  proefinvulling, die was puur bedoeld om de vraagteksten te controleren.
- **`CLAUDE.md`/`backlog.md`**: Bestandenlijst, Status en sectie 4
  bijgewerkt; het "Zorg-variant bouwen"-punt uit de backlog gehaald (nu
  gebouwd).

**Getest in de browser**: Kaart op "Kies jouw assessment" en de
assessment-landingspagina (heart-icoon, sector-tekst), de
Voorbeeld-output-preview (score 3.1, "Uitbouwen", 60/60 vragen, radar en
staafdiagram met alle 15 bouwblokken/5 categorieën), en het
contentbeheerscherm (`/beheer/content/zorgscan`): Alle 60 vraagteksten
correct geladen en bewerkbaar, gewicht-velden op 1, "Afgeleid van:
Klantcontact Volwassenheid" zichtbaar in zowel de lijst als de
detailpagina. `tsc --noEmit`, `eslint .` en `next build` lopen schoon door.

**Niet meegenomen (bewust)**: De PDF- en InDesign-export, CSV-export en
alle overige generieke functionaliteit werken automatisch mee omdat ze
assessment-agnostisch gebouwd zijn (`CLAUDE.md`, Uitgangspunten) — daar is
niets scan-specifieks aan aangepast of hoeven aanpassen.

## 2026-09-28 — Sector-varianten, gewichten en InDesign-export

**Aanleiding**: Drie backlog-punten in één keer opgepakt, alle drie al
gespecificeerd in de MD's: `Categorie.gewicht`/`Bouwblok.gewicht`
(`datamodel.md`), het generieke mechanisme om een Assessment leeg of als
sector-variant aan te maken (`datamodel.md`, "Sector-varianten";
`beheerpagina.md`, punt 1), en de InDesign-export
(`export-indesign.md`).

**Gewichten**:

- `Categorie` en `Bouwblok` hebben nu een `gewicht`-veld (`lib/types.ts`),
  standaard `1`, bewerkbaar in het contentbeheer
  (`app/beheer/content/[assessmentId]/page.tsx`: een "Gewicht"-invoerveld
  naast de kleur bij een categorie, en in `BouwblokEditor`). **Heeft nog
  geen effect op de score-berekening**: Die blijft het ongewogen
  gemiddelde uit `CLAUDE.md` sectie 1. Het veld ligt klaar voor de
  Zorg-variant, die met echte historische zorg-gewichten moet komen.
- Bestaande content (`data/klantcontact-assessment.ts`,
  `data/ai-scan-assessment.ts`) kreeg `gewicht: 1` op elke categorie en
  elk bouwblok.

**Assessment-types, generiek aanmaken**:

- `Assessment.afgeleidVanAssessmentId` (`lib/types.ts`): informatief veld,
  wijst naar het Assessment waar een sector-variant vanaf gekopieerd is
  (`null` bij een op zichzelf staand Assessment). Geen lopende koppeling:
  een latere wijziging aan het origineel werkt niet door.
- **Nieuw scherm** `/beheer/content/nieuw`: keuze "Leeg aanmaken" of
  "Vanuit bestaand Assessment", met naam en kort label.
  - `createAssessment` (`lib/assessment-store.ts`): een volledig leeg
    Assessment met standaard schaallabels, geen categorieën of
    bouwblokken.
  - `duplicateAssessmentAsVariant`: `structuredClone` van het
    bron-Assessment, met een verse id op het Assessment zelf én op élke
    Categorie/Bouwblok/Vraag (via `nieuwId()`), zodat de kopie volledig
    onafhankelijk is — bewerken van de kopie raakt het origineel niet.
    Zet `afgeleidVanAssessmentId` op het bron-id.
  - `/beheer/content` toont bij een sector-variant "Afgeleid van: …" in
    de sub-regel; de contentbeheerpagina zelf toont dit ook boven de
    instellingen.
- Contentbeheer kreeg twee kleinere aanvullingen die hierbij nodig waren:
  een "Kort label"-veld in de instellingen, en een `pdfContentSecties`-
  editor (kiezen tussen "Geen slotsectie" / Visie / 2030, met eigen
  titel) — voorheen alleen als vaste data instelbaar.
- **Mechanisme gebouwd en end-to-end getest** (aanmaken, dupliceren,
  volledig losstaande id's verifiëren, gewicht bewerken) met een
  wegwerp-testassessment, niet bewaard. **De echte Zorg-variant is niet
  gebouwd**: Joost's bronmateriaal (vraagteksten, historische
  zorg-gewichten) staat nog niet in de repository. Dat blijft een open
  punt tot dat materiaal er is — zie `backlog.md`.

**InDesign-export** (`export-indesign.md`):

- Derde optie "Voor InDesign (XML)" in de "Exporteren"-dropdown op de
  resultatenpagina, naast "Als PDF" en "Als CSV".
- Levert een ZIP (client-side gebouwd met `fflate`, geen server nodig,
  zelfde patroon als de CSV-export): één `scan-export.xml` plus 5
  losse SVG-bestanden (classificatiecirkel, radar, staafdiagram, top 3
  sterktes, top 3 verbeterkansen), bestandsnamen volgens
  `<organisatie>-<scan>-...svg`, `href`'s met het letterlijke
  `file:///./`-voorvoegsel uit de spec.
- **Nieuwe module** `lib/indesign/`: `xml-utils.ts` (escapen, slug),
  `kenmerken-xml.ts` (de 24 organisatiekenmerken als losse, met name
  getagde XML-elementen — bewust geen JSON-blob zoals bij CSV, elk
  kenmerk moet in InDesign een eigen tekst-/beeldframe kunnen worden;
  ontbrekende waarden worden de letterlijke tekst `"n.v.t."`),
  `charts.ts` (twee nieuwe standalone SVG's: `scoreAlgemeenSvg`,
  `top3ListSvg`; radar/staafdiagram hergebruiken de bestaande
  `lib/pdf/charts.ts`), `content-sectie.ts` (plat maken van de
  Visie/2030-content tot losse `<alinea>`-elementen, `**vet**`/
  `*cursief*` naar `<b>`/`<i>`, koppen als vetgedrukte alinea — er is
  geen apart kop-element in het contract), `build-xml.ts` (orkestreert
  alles), `export.ts` (ZIP + download).
- `<groepsScores type="categorie">` bij een Assessment met categorieën,
  `type="bouwblok"` bij een vlakke indeling (AI-scan) — mirrort
  `Assessment.categorieen`.
- **Getest voor beide vormen**: Klantcontact Volwassenheid (met
  categorieën, alle 24 kenmerken inclusief de "n.v.t."-fallback, Visie-
  slotsectie) en AI-Volwassenheid (vlak, `type="bouwblok"`, 8 domeinen,
  2030-slotsectie). Beide keren de ZIP uitgepakt en de XML en alle 5
  SVG's gevalideerd als well-formed XML. **Niet getest in InDesign
  zelf** (geen toegang tot Joost's sjabloon/InDesign hier) — de
  structuur is gecontroleerd tegen `export-indesign.md`, niet visueel
  tegen een echte plaatsing.

**Verificatie**: `tsc --noEmit`, `eslint .` en `next build` liepen na dit
hele blok schoon door (alleen bestaande warnings in de oude `js/`-map,
ongewijzigd).

## 2026-09-28 — Import CSV: ook onze eigen export teruglezen

**Aanleiding**: De "Als CSV"-export teruglezen bij "Import van historische
scans" gaf een foutmelding (alle 6 verplichte kolommen ontbraken) — geen
bug, maar twee bewust verschillende formaten (`export-csv.md` exporteert
onze eigen kolommen, `import-scans.md` verwachtte alleen het
formaat van de externe, stopgezette tool). Op verzoek uitgebreid met een
tweede bronformaat, zodat een eigen export wél teruggelezen kan worden —
vooral bedoeld om data tussen browsers te verplaatsen zolang de opslag
nog localStorage is (CLAUDE.md, Status).

**Doorgevoerd**:

- **Beheerscherm** (`/beheer/import`): Nieuwe keuze "Bronformaat" bovenaan
  ("Oude tool" / "Coniche Scan (eigen export)"), bepaalt scheidingsteken,
  verplichte kolommen en matchinglogica. Wisselen van formaat wist het
  al ingelezen bestand.
- **`lib/import-legacy.ts`**: CSV-parser generiek gemaakt (instelbaar
  scheidingsteken: komma voor "oud", puntkomma voor "nieuw"; een
  voorloop-BOM wordt gestript). Nieuwe `parseNieuweExportCsv`/
  `valideerNieuweExportRijen` naast de bestaande "oud"-functies, beide
  met dezelfde `GevalideerdeRij`-uitvoer, zodat de preview-tabel en
  `voerLegacyImportUit` (`lib/db.ts`) ongewijzigd allebei bedienen.
- **"Nieuw"-formaat matcht rechtstreeks op onze eigen `bouwblokId`/
  `vraagId`** (geen naam-/volgorde-heuristiek nodig, het is al onze eigen
  data) en importeert alle drie de statussen (niet alleen afgeronde
  scans). `organisatie_kenmerken` wordt één-op-één overgenomen bij het
  aanmaken van een nieuwe organisatie; een bestaande organisatie behoudt
  haar eigen kenmerken. Het `meting_label` komt letterlijk uit de export.
- **`lib/db.ts`**: `voerLegacyImportUit` gebruikt nu `rij.status` en
  `rij.uitgenodigdOp` in plaats van hardcoded `"afgerond"`, en past
  `organisatieKenmerken` toe bij een nieuw aangemaakte organisatie.

**Op de backlog gezet**: Bronformaat "Oude tool" verwijderen zodra de
historische migratie voltooid is (`backlog.md`, "Voor productie").
"Coniche Scan (eigen export)" blijft wel bestaan.

Getest met een echte export→import-rondgang: Een afgeronde scan
geëxporteerd als CSV, teruggeïmporteerd met bronformaat "nieuw" —
dezelfde 15 bouwsteenscores, dezelfde overall-score (3.0), en de Meting
kreeg het letterlijke `meting_label` terug. Het "oude" formaat is los
opnieuw getest (regressie): nog steeds correct assessment-detectie en
matching.

## 2026-09-28 — Sector/Subsector: alsnog cascading-select

**Aanleiding**: Sector toonde terecht alleen de 22 Secties, maar
Subsector toonde altijd alle 87 Afdelingen plat, ongeacht de gekozen
Sector — een eerdere, bewuste spec-keuze ("Geen cascading-select tussen
de twee", `sbi-indeling.md`/`datamodel.md`). Op verzoek teruggedraaid:
Subsector cascadeert nu op Sector en is pas te kiezen nadat Sector
gekozen is. Rechtstreeks in beide specs gewijzigd, niet stil in de code
afgeweken.

**Doorgevoerd**:

- **Nieuw generiek veldtype `select-afhankelijk`** (`lib/types.ts`,
  `VeldDefinitie`): Een select waarvan de optielijst afhangt van de
  waarde van een broer-veld binnen dezelfde groep (`afhankelijkVan` +
  `optiesPerWaarde`). Bewust generiek gehouden, niet Sector/Subsector-
  specifiek hardcoded (CLAUDE.md, Uitgangspunten: "geen hardcoded
  schermen, dit is data").
- **`components/beheer/KenmerkenForm.tsx`**: Rendert het nieuwe type
  (uitgeschakeld met "Kies eerst {label van het broer-veld}" zolang dat
  broer-veld leeg is), en wist een afhankelijke waarde automatisch zodra
  het veld waarvan die afhangt wijzigt — een blijvende, niet meer
  passende Subsector-keuze na het wijzigen van Sector zou stille foutieve
  data opleveren.
- **`data/organisatie-velden.ts`**: Nieuwe `sbiSubsectorenPerSector`,
  de 87 Afdelingen gegroepeerd per Sectie op basis van de officiële
  tweecijferige Afdelingscode (niet op titelgelijkenis): Elke Sectie
  A–V heeft een vaste, aaneengesloten codereeks (bijv. G = 46–47, L =
  64–66), geverifieerd door elke Afdeling automatisch in te delen en de
  uitkomst te controleren tegen de Sectie-titels — alle 87 kwamen
  inhoudelijk overeen met hun Sectie (bijv. Afdeling 65 "verzekeringen
  en pensioenfondsen" onder Sectie L "financiële dienstverlening en
  verzekeringen"). Deze codereeksen staan nu ook in `sbi-indeling.md`
  (nieuwe kolom "Afdelingen" in de Sector-tabel), zodat de indeling
  gedocumenteerd is en niet alleen impliciet in code leeft.
- **`lib/import-legacy.ts`**: De SBI-mapping voor een import zoekt de
  subsector nu eerst binnen de Afdelingen van de al-bepaalde sector
  (nauwkeuriger), met de volledige lijst als terugval.

Getest: Sector "Groot- en detailhandel" beperkt Subsector tot precies
"Groothandel"/"Detailhandel"; Subsector wisselt en wordt leeg zodra
Sector daarna verandert; Subsector staat uitgeschakeld zonder gekozen
Sector; een import (<Organisatie>, sector "Financiële dienstverlening",
subsector "Verzekeringen en pensioenfondsen") vult na import nog
steeds correct Sectie L / Afdeling 65 in, nu binnen de gecascadeerde
velden.

## 2026-09-28 — PDF-bug: bouwsteen 7 niet meer op dezelfde pagina als 8

**Gevonden**: Een bouwsteenpaar wordt in de PDF in één HTML-blok
opgebouwd (`lib/pdf/build-html.ts`), maar elk bouwsteenblok mag zelf
niet over twee pagina's gesplitst worden (`page-break-inside: avoid`).
Was de gecombineerde inhoud van een paar — met name door een langere
opmerking bij een of beide bouwstenen — hoger dan de beschikbare
paginaruimte (±245mm), dan sprong het tweede blok in zijn geheel naar
een nieuwe, verder lege pagina. Bevestigd door zelf twee opmerkingen
van een paar zinnen toe te voegen aan bouwsteen 7 en 8: de PDF ging van
10 naar 11 pagina's, met bouwsteen 7 alleen op de ene pagina en
bouwsteen 8 alleen, met veel witruimte, op de volgende.

**Fix (gekozen optie: verkrappen, geen dynamische meting)**: Tekst en
marges op de bouwsteenpagina's van de Volwassenheidsscan-PDF iets
verdicht, zodat er meer buffer overblijft voordat een paar de
pagina-hoogte overschrijdt:

- Lettergrootte 8,5pt → 8,3pt, regelhoogte 1,45 → 1,4.
- Ruimte rond de middenstreep 9mm → 7mm aan beide kanten.
- Kleinere marges rond de uitleg, de centrale-vraagbox, de tabel en de
  opmerking zelf.

Dit lost het gemelde geval op (getest: met dezelfde twee opmerkingen
weer 10 pagina's, bouwsteen 7 en 8 weer samen) maar is geen garantie
voor élke denkbare tekstlengte — bij een uitzonderlijk lange opmerking
kan het zich in theorie nog voordoen. Een echte garantie vraagt
dynamische hoogtemeting tijdens het genereren (bewust niet gekozen,
grotere aanpassing). De AI-scan-PDF (die bovenop deze waarden nog de
`compact`-laag gebruikt voor de 5-vragen-domeinen) is ongewijzigd
gebleven qua paginatelling (9) en oogt nog steeds ruim genoeg; beide
visual-specs (`export-pdf-visual-volwassenheidsscan.md`,
`export-pdf-visual-ai-scan.md`) zijn bijgewerkt met de nieuwe maten.

## 2026-09-28 — Bug: verwijderen deed niets

**Gevonden**: De "Verwijderen"-knop op Ingevulde scans leek niets te
doen. Reproductie in de Claude-browserpane bevestigde de oorzaak: De
knop riep `window.confirm()` aan, en die browserpane onderdrukt native
JavaScript-dialogen stilzwijgend — `confirm()` levert dan altijd `false`
op, zonder enige melding. De knop deed het dus wel, maar stopte meteen
bij een bevestigingsvraag die de gebruiker nooit te zien kreeg. Dezelfde
`window.confirm()` stond ook op Organisaties en op de
respondentenlijst van een organisatie (drie plekken in totaal), dus
hetzelfde risico overal waar een browser(omgeving) native dialogen
onderdrukt.

**Fix**: Nieuwe `components/beheer/BevestigModal.tsx`, dezelfde
`.modal-overlay`/`.modal-box`-stijl als de rest van de app, met
Annuleren/Verwijderen-knoppen — vervangt `window.confirm()` op alle drie
plekken (`app/beheer/scans/page.tsx`, `app/beheer/organisaties/page.tsx`,
`app/beheer/organisaties/[organisatieId]/page.tsx`). Geen
browserafhankelijkheid meer, en meteen een opmaak die bij de rest van
beheer past in plaats van de kale systeemdialoog.

Getest: Verwijderen op Ingevulde scans (rij verdwijnt na bevestigen),
Organisaties (juiste waarschuwingstekst met het aantal respondenten dat
meegaat) en Annuleren (modal sluit, niets verwijderd, selectie blijft
staan).

## 2026-09-28 — Import: Assessment-type nu automatisch bepaald

**Aanleiding**: Vraag om de importtool het Assessment-type zelf te laten
vaststellen, in plaats van de beheerder dit vooraf te laten kiezen. Dat
laatste stond met een expliciete reden in `import-scans.md`
("om te voorkomen dat een fout bestand stilzwijgend op het verkeerde
scan-type wordt geplakt") — een bewuste spec-keuze, dus rechtstreeks
gewijzigd in dat bestand (sectie "Assessment- en bouwblok-matching"),
niet zomaar in de code afgeweken.

**Waarom dit alsnog veilig is**: De bestaande matching (blok- én
vraagaantal moeten exact kloppen, namen moeten matchen) ving een
verkeerd gekozen type toch al af met een duidelijk matchingprobleem —
de handmatige keuze kostte dus een stap zonder een risico weg te nemen
dat de matching niet al dekte.

**Doorgevoerd**:

- **`lib/import-legacy.ts`**: Nieuwe functie `detecteerAssessment`
  vergelijkt de gegroepeerde bloknamen uit de CSV met de bouwblokken/
  domeinen van elk Assessment-type; alleen bij een exacte match (aantal
  én alle namen) geldt een type als gedetecteerd. Geen match: de rij
  krijgt de melding "Kon geen Assessment-type bepalen" i.p.v. een gok.
  `valideerLegacyRijen` neemt nu de volledige assessments-lijst i.p.v.
  één vooraf gekozen Assessment, en bepaalt het type per rij (zodat een
  bestand met een onverwachte mix altijd correct blijft, al komt dat in
  de praktijk niet voor: één export is altijd één scan-type).
- **`/beheer/import`**: De Assessment-type-dropdown is weg. De
  voorbeeldweergave toont een nieuwe kolom "Assessment" met het
  gedetecteerde type per rij (of "—" als dat niet lukte).

Getest: Een Klantcontact-CSV en een AI-scan-CSV (beide met de juiste
bouwblok-/domeinnamen uit de huidige content) worden allebei correct
gedetecteerd en geïmporteerd; een CSV met twee onbekende bloknamen geeft
"Kon geen Assessment-type bepalen" en importeert niets.

## 2026-09-28 — CSV-export van ingevulde scans gebouwd

**Aanleiding**: `export-csv.md`, een nieuwe, volledige spec voor de tot nu
toe uitgeschakelde "Als CSV"-optie in de Exporteren-dropdown, op de
resultatenpagina en in `beheerpagina.md` punt 7 (Ingevulde scans).

**Doorgevoerd**:

- **`lib/csv-export.ts`**: `genereerScansCsv` bouwt de CSV exact volgens de
  kolommen uit de spec (basisgegevens, `overall_score`/`groepsScores` —
  alleen gevuld bij status "afgerond" — `organisatie_kenmerken`,
  `antwoorden` en `opmerkingen_per_bouwblok`, alle drie als JSON-kolom).
  Puntkomma-gescheiden, UTF-8 met BOM, en decimalen met een komma
  (`3,8`) i.p.v. een punt — Excel-NL-conventie. `groepsScores` is met de
  hand opgebouwd i.p.v. met `JSON.stringify`: Door de komma-decimalen is
  dat veld strikt genomen geen valide JSON meer, bewust volgens de spec
  ("dit is de laatste stap in de keten, niets leest de CSV terug in de
  app"). Client-side, geen serverroute nodig (alle data staat al in de
  browser).
- **Resultatenpagina**: "Als CSV" in de Exporteren-dropdown werkt nu,
  bestandsnaam `<Organisatie> - <Respondent> - <Meting>.csv`.
- **Ingevulde scans (globaal overzicht)**: De "Exporteren"-knop in de
  bulk-toolbar (`BulkToolbar`, nieuwe optionele props `onExporteren`/
  `exporterenDisabledReden`) werkt nu voor 1 of meer geselecteerde scans,
  bestandsnaam `Ingevulde scans export <datum>.csv` bij meerdere rijen.
  **Bulk-CSV blijft binnen één organisatie** (export-csv.md, "in verband
  met datavermenging"): Bevat de selectie scans van meer dan één
  organisatie, dan blijft de knop uitgeschakeld met een tooltip die
  vraagt eerst op Organisatie te filteren. Geen aparte, nieuwe
  "organisatie-gefilterde Ingevulde scans"-pagina gebouwd hiervoor: De
  bestaande organisatiefilter op dit overzicht vervult al die rol, en de
  check op de daadwerkelijke selectie (niet alleen het filter) dekt de
  eigenlijke zorg — datavermenging — preciezer.

Getest: Bulk-export van 2 scans binnen dezelfde organisatie (juiste BOM,
kolommen, komma-decimalen, volledige antwoorden- en opmerkingen-JSON
gecontroleerd), de blokkade bij 2 scans uit verschillende organisaties
(knop uitgeschakeld, juiste tooltip), en de losse CSV-export vanaf de
resultatenpagina (juiste bestandsnaam).

## 2026-09-28 — Nieuwe MD's verwerkt

**Nagekomen verbetering, zelfde dag**: Het CSV-bestandsveld op
`/beheer/import` toonde de kale, ongestylede browserknop ("Bestand
kiezen" / "Geen bestand gekozen"), enige plek in de app zonder eigen
opmaak. Vervangen door een `.btn-outline`-knop die een verborgen
`<input type="file">` aanstuurt, met de gekozen bestandsnaam ernaast —
zelfde patroon als andere secundaire acties in `stylesheet.md`.

**Naamgevingsconflict, opgelost door de conventie van Sander te volgen**:
Ik had zelf `pdf-visual-volwassenheidsscan.md` en `pdf-visual-ai-scan.md`
aangemaakt. Sander leverde intussen `export-pdf-visual-
volwassenheidsscan.md` en `export-pdf-visual-ai-scan.md` aan, die
hetzelfde onderwerp dekken maar aansluiten bij de bestaande naam
`export-pdf.md` en de gedeelde regels (bron, slotsectie, bulk-export)
bundelen in het volwassenheidsscan-document als leidend stuk. Mijn twee
bestanden en het nu overbodige `export-pdf.md` zijn verwijderd; de
nieuwe bestanden staan al in `CLAUDE.md`'s bestandentabel.

**Kleine inconsistentie gecorrigeerd**: `import-scans.md` gebruikte
op twee plekken "AI-Volwassenheid" (hoofdletter V) naast "AI-volwassenheid"
(kleine v) elders in hetzelfde bestand en in alle andere specs. Rechtgezet
naar de doorgaande kleine-v-schrijfwijze.

**Doorgevoerd**:

- **Organisatievelden Sector en subsector** (`datamodel.md`,
  Organisatievelden): Twee losse select-velden, vaste optielijsten uit
  de nieuwe `sbi-indeling.md` (22 secties, 87 afdelingen, SBI2025 top 2
  niveaus). Toegevoegd aan `data/organisatie-velden.ts`, vóór "Volume en
  klantbasis". Geen cascading-select tussen de twee, zoals gespecificeerd.
  Gecontroleerd in het organisatieformulier: Beide dropdowns staan naast
  elkaar met het juiste aantal opties.

**Nog niet doorgevoerd, aan Sander voorgelegd (zie chat)**:

- `Assessment.pdfContentSecties` van array naar één (of geen) object, en
  `ContentBron` van 4 naar 2 waarden — nu vastgelegd in `datamodel.md` en
  `export-pdf-visual-volwassenheidsscan.md`, nog niet in de code
  (`lib/types.ts`, beide assessment-databestanden, `lib/pdf/build-html.ts`,
  `lib/pdf/content-secties.ts`).
- `import-scans.md`: Nieuwe beheerfunctie (CSV-import van
  historische scans), spec compleet en "klaar om te bouwen", nog niet
  gebouwd.


**Alsnog doorgevoerd (op verzoek, na overleg)**:

- **`Assessment.pdfContentSecties`: array → één (of geen) slotsectie,
  `ContentBron` 4 → 2 waarden.** `lib/types.ts`, beide
  assessment-databestanden, `lib/pdf/build-html.ts` en
  `lib/pdf/content-secties.ts` (dode functies `bouwstenenDeel2Html`/
  `aiDomeinenHtml` en de onnodig geworden `PER_BOUWBLOK_BRONNEN`-gate
  verwijderd — de per-bouwblok toelichting werkt nu onvoorwaardelijk,
  zoals de nieuwe spec beschrijft). Geen zichtbaar verschil in de PDF's:
  Beide test-PDF's (10 en 9 pagina's) opnieuw gegenereerd en pagina 1/10
  respectievelijk pagina 6 visueel vergeleken met de vorige versie,
  identiek. **Val op**: De test-fixtures in de scratchpad bevatten nog
  een oud, ingebed `assessment`-object (client stuurt het hele object
  mee) — bij een respondent-browser die zijn snapshot vóór deze wijziging
  al had geseed, geldt hetzelfde. Geen nieuwe fallback toegevoegd: Dit
  gold al voor eerdere velden op `Assessment` en is een bekend,
  geaccepteerd risico van de localStorage-opzet (`CLAUDE.md`, Status).

- **`import-scans.md` gebouwd**: Nieuwe beheerpagina
  `/beheer/import` (nav-link "Import", naast Content), met CSV-upload,
  keuze van het Assessment-type, een voorbeeldweergave per rij
  (gevonden/nieuwe organisatie kiezen, matchingproblemen apart getoond
  zonder de rest te blokkeren) en een bevestigknop. Nieuwe bestanden:
  `lib/import-legacy.ts` (CSV-parser, SBI-mapping, matching-validatie,
  geen localStorage-toegang) en `voerLegacyImportUit` in `lib/db.ts`
  (het daadwerkelijk wegschrijven). Getest met een zelf opgebouwde CSV
  (15 bouwstenen, juiste namen en vraagaantallen uit de huidige content):
  Nieuwe organisatie, respondent met de Legacy-import-notitieprefix,
  Meting "Legacy-import 2025", status "Afgerond", scores en opmerking
  kwamen correct door in Ingevulde scans en de organisatiedetailpagina.

  **Bug gevonden en gefixt tijdens het testen**: De eerste versie van de
  SBI-matching (`mapNaarSbiTitel`) koos bij "Verzekeringen en
  pensioenfondsen" de verkeerde Afdeling (64, die dat onderwerp juist
  uitsluit: "... met uitzondering van verzekeringen en pensioenfondsen"),
  omdat een simpele "bevat de tekst"-check niet onderscheidt tussen het
  hoofdonderwerp van een SBI-titel en een uitzonderingsclausule erin.
  Herschreven naar woordoverlap-scoring die woorden vóór "met
  uitzondering van" zwaarder laat wegen; nu wordt Afdeling 65 gekozen,
  zoals `sbi-indeling.md` expliciet als voorbeeld noemt.

  **Aanname, niet in de spec vastgelegd**: Er was geen voorbeeld-CSV
  beschikbaar, dus de vorm van de `answers`-kolom (JSON: een array van
  blokken met `buildingBlockName`, optioneel `blockComment`, en
  `questions` met een numerieke `score` per vraag) is een eigen
  reconstructie op basis van de wel-beschreven veldnamen
  (`buildingBlockName`, `blockComment`, `questionId`). Controleer dit
  tegen de eerste echte export voordat deze tool op productiedata
  draait — staat ook als code-comment boven `LegacyAnswerBlock` in
  `lib/import-legacy.ts`.

  **Eigen invulling, niet expliciet in de spec**: Een respondent die al
  bestaat (zelfde e-mailadres binnen de organisatie) wordt hergebruikt
  zonder zijn naam/functie/team/notities te overschrijven met de
  importdata — terughoudend gekozen om recentere, zelf ingevoerde
  gegevens niet te laten overschrijven door een oudere import.


**Nagekomen fix, zelfde dag: de importfunctie werkt nu echt.** Bij het
testen met een echte export (<Organisatie> Zuid-Nederland) bleek mijn eigen
aanname over de vorm van de `answers`-kolom verkeerd: Ik had een array
van 15 blok-objecten met een geneste `questions`-array verondersteld.
Sander en ik hebben `import-scans.md` (en `datamodel.md`, zie
hieronder) bijgewerkt met de daadwerkelijke structuur uit de twee echte
exports, en die is nu in `lib/import-legacy.ts` verwerkt:

- **`answers` is een platte lijst** van losse vraag-items (60 bij
  Klantcontact, 40 bij de AI-scan), geen geneste structuur per bouwblok.
  Nieuwe functie `groepeerPerBouwblok` groepeert deze lijst eerst op
  `buildingBlockId` (volgorde van eerste voorkomen), vóórdat de
  bestaande matching- en telregels worden toegepast — de blok-telling
  controleert nu tegen het aantal groepen, niet tegen `answers.length`.
- **Scoreveld heet `answerScore`**, niet `score`. `answerLabel` en
  `weight` worden bewust niet geïmporteerd (weight staat overal op 1,
  zie `datamodel.md`, `Bouwblok.gewicht`/`Categorie.gewicht` hieronder).
- **`blockComment` staat op elk vraag-item binnen een blok herhaald**:
  Gededupliceerd tot één waarde per bouwblok; tegenstrijdige waarden
  binnen hetzelfde blok laten de hele rij afkeuren, zoals de spec
  voorschrijft.

Getest met een zelf opgebouwde CSV die de bevestigde structuur exact
volgt (60 platte vraag-items, juiste `buildingBlockId`/`buildingBlockName`
uit de huidige content): Voorbeeldweergave toont nu "1 van de 1 rijen
klaar", en na bevestigen kloppen alle 15 bouwsteenscores, de
100%-voortgang en de opmerking in Ingevulde scans.

**`datamodel.md` kreeg in dezelfde ronde `Categorie.gewicht` en
`Bouwblok.gewicht` (standaard 1, nog geen effect op de score-berekening
— volgt pas bij een toekomstige sector-variant). Puur ter voorbereiding,
geen code-wijziging nu nodig: `weight` in de CSV staat overal op 1 en
wordt niet geïmporteerd, zoals hierboven.**

**Knoppen op `/beheer/import` rechtgezet**: "Bestand kiezen" en de
importknop misten de gedeelde basisklasse `.btn` (alleen `.btn-outline`/
`.btn-or`, de kleurmodifier zonder de padding/afmetingen die `.btn`
levert, zie `stylesheet.md`, Knoppen) — vandaar de kale, ongestylede
knoppen. Ook kon "Bestand kiezen" op smallere schermen naar twee regels
wrappen doordat de knop in de flex-rij mocht meekrimpen met de
bestandsnaam ernaast; nu `flex: none` op de knop, de bestandsnaam breekt
zo nodig zelf af.
## 2026-09-25 — Werkende PDF-export van een ingevulde scan

**Aanleiding**: `export-pdf.md`, een volledig uitgewerkte spec voor échte
PDF-export (in plaats van de uitgeschakelde "Als PDF"-knop), voorgelegd
en goedgekeurd — inclusief de bouwkeuze die de spec zelf als "niet
achteraf te maken" aanmerkte: Server-side rendering (Puppeteer/headless
Chromium) i.p.v. platte browser-print, nodig voor een echte "Pagina X/Y"
in de footer.

Na de eerste versie (platte scoretabel + alle duidingscontent los aan het
eind) gaf Sander aan de hand van 6 referentieschermafbeeldingen een
concreet gewenste opbouw door: de radar- en staafdiagram terug (i.p.v.
een tabel), de legenda erbij, en per bouwblok eerst de uitleg (dezelfde
content als de toelichting-modal) direct gevolgd door de vragen en
score van dát bouwblok — in plaats van alle uitleg (Bouwstenen/AI-
domeinen) als los blok aan het eind.

**Doorgevoerd**:

- **Twee visual-specs voor de PDF's**: `pdf-visual-volwassenheidsscan.md`
  en `pdf-visual-ai-scan.md` beschrijven per pagina hoe beide PDF's
  eruitzien (maten, kleuren, paginaverdeling, bronbestanden). Opgenomen
  in de bestandentabel van `CLAUDE.md`.

- **Volwassenheidsscan-PDF: Visie-pagina in de stijl van /visie**. De
  laatste pagina volgt nu de opbouw van de webpagina: hero met oranje
  gloed en de vetgedrukte subtitel, kopjes als h2, "Wat is goed
  klantcontact?" in een warme kaart met oranje vinkjes in twee kolommen,
  en de verbetercyclus als vijf genummerde stappen met pijltjes (was
  eerder een platte tekstregel). Past nog steeds op 1 pagina. De
  hero-subtitel en de kaartintro staan nu in `data/visie-content.ts`
  (`visieIntro`, `watIsGoedIntro`) en worden door pagina én PDF gebruikt.

- **AI-scan-PDF vanaf pagina 6 in de stijl van /klantcontact-2030**. De
  2030-sectie (pagina 6 t/m 9) volgt nu de opbouw van de webpagina: hero
  met oranje gloed vanaf de paginarand, kopjes als h2, genummerde punten
  als omkaderde kaarten met oranje nummercirkel, en de kenmerken in een
  warme kaart met twee kolommen. Oorspronkelijk stonden de nummers los
  boven de titels zonder opmaak, en stond er nog een kop "Geen vast
  eindbeeld" die op de webpagina al was weggehaald. De sectie is
  handmatig over 4 pagina's verdeeld (`.pdf-pagina`), zodat geen kaart of
  kop midden op een pagina wordt afgebroken. De drie vaste tussenzinnen
  uit de webpagina staan nu in `data/klantcontact-2030-content.ts`
  (`vijfDingenIntro`, `machineCustomerEffectenIntro`, `kenmerkenIntro`)
  en worden door pagina én PDF gebruikt.

- **AI-scan-PDF: overal 2 domeinen per pagina**. AI-domeinen hebben 5
  vragen en een langere uitleg, waardoor het eerste paar over twee
  pagina's liep. Scans met meer dan 4 vragen per bouwblok krijgen nu een
  compactere opmaak (`.bouwsteen-pagina.compact` in `lib/pdf/build-html.ts`:
  iets kleiner lettertype, minder marges). Gecontroleerd met een echte
  AI-payload: 9 pagina's, elk domeinpaar op één pagina. De Klantcontact-PDF
  is ongewijzigd (10 pagina's).
- **Nieuwe dependency**: `puppeteer`, voor het server-side renderen van
  de PDF.
- **Nieuwe route** `app/api/export-pdf/route.ts` (POST): Bouwt een
  zelfstandige HTML-string en print die via een headless Chromium-pagina
  naar PDF, met `displayHeaderFooter`/`footerTemplate` voor de native
  paginanummering. Zelfstandig gekozen i.p.v. Puppeteer naar de live
  resultatenpagina te laten navigeren: Die pagina haalt zijn data uit
  `localStorage`, waar de server geen toegang toe heeft. De client stuurt
  daarom alle benodigde data (het actuele `Assessment` zoals de
  respondent het zag, antwoorden, opmerkingen, organisatie- en
  respondentnaam) direct mee in de request-body.
- **Nieuwe Assessment-velden** (`datamodel.md`): `kortLabel` (voor de
  PDF-footer) en `pdfContentSecties` (welke duidingscontent per
  scan-type in de PDF komt, met een vaste `ContentBron`-lijst i.p.v. een
  vrij tekstveld), ingevuld voor beide bestaande scan-types.
- **Opbouw van het document** (`lib/pdf/build-html.ts`): Kop, metagegevens,
  overall-classificatiecirkel met naam/voortgang, radar- en staafdiagram
  naast elkaar, Top 3 Sterktes/Verbeterkansen, Legenda — daarna per
  bouwblok, in vaste volgorde, eerst de uitleg (categorie/nummer-label,
  centrale vraag, beschrijving — dezelfde content als de toelichting-
  modal) en direct daaronder de vragentabel met score en een eventuele
  opmerking. Duidingssecties die niet per bouwblok horen (Visie/2030)
  staan als afsluitende sectie(s) achteraan.
- **`lib/pdf/charts.ts`** (nieuw): Radar- en staafdiagram als kale SVG
  (geen recharts/DOM nodig in de PDF-context), met dezelfde kleuren en
  data als `RadarChartView.tsx`/`CategoryBarChart.tsx` op het scherm. De
  radar-viewBox is bewust veel breder dan hoog: Bij 15 assen zijn de
  buitenste labels (bijv. "13. Employee Engagement") lang genoeg om een
  vierkante viewBox te doen clippen.
- **`lib/pdf/content-secties.ts`**: Map van `ContentBron` naar de
  volledige tekst uit dezelfde content-bestanden als de interactieve
  pagina's (`visie-content.ts`, `bouwstenen-content.ts`,
  `klantcontact-2030-content.ts`, `ai-domeinen-content.ts`), gebruikt
  voor de afsluitende Visie/2030-sectie.
- **`lib/bouwblok-info.ts`** (uitgebreid): `toelichtingVoor()` geeft nu de
  volledige toelichting (eyebrow, titel, centrale vraag, beschrijving)
  per bouwblok terug, dezelfde content-lookup die al in `BouwblokForm.tsx`
  zat, nu gedeeld tussen de toelichting-overlay en de PDF.
- **`escape-html.ts`**: Voorkomt HTML-injectie via vrije tekst zoals
  respondent-opmerkingen.
- De "Als PDF"-optie in de Exporteren-dropdown op de resultatenpagina is
  niet langer uitgeschakeld en toont "Bezig…" tijdens het genereren.
- **Eerste pagina verdicht**: Kop, metagegevens, score-cirkel, radar/
  staafdiagram, Top 3 en Legenda stonden verspreid over 2 pagina's
  (de tweede grotendeels leeg door de geforceerde pagina-einde vóór het
  eerste bouwblok). Marges, lettergroottes en de intrinsieke hoogte van
  beide SVG-grafieken verkleind zodat dit blok nu op 1 pagina past.
- **Metagegevens-blok herzien**: De losse sectie met 3 boxen
  (Assessmentdatum/Naam invuller/Geëxporteerd op) is weg. Onderweg bleek
  de CSS-selector `.metagegevens div` ook de labels zelf te raken, met
  een dubbele rand tot gevolg (box-in-een-box) — dat probleem is nu
  irrelevant. In de kop staat nu, onder de titel en boven de oranje
  lijn, één regel: "{datum} | {assessment naam} | {naam invuller}".
  "Geëxporteerd op" is vervallen (voegde weinig toe naast de andere
  twee, en stond nergens elders in het document).
- **Pagina 1 vult de volledige hoogte**: In plaats van vaste, kleine
  marges (die ruimte onderaan de pagina onbenut lieten) is pagina 1 nu
  een flex-kolom (`justify-content: space-between`) die de 4 blokken
  (kop, scores, top 3, legenda) evenredig over de volledige paginahoogte
  verdeelt. Onderdelen (classificatiecirkel, grafieken, teksten) zijn
  tegelijk weer iets vergroot, nu er ruimte is.
- **2 bouwstenen per pagina**: Elk even-genummerd paar bouwblokken
  (1+2, 3+4, …) begint voortaan geforceerd op een nieuwe pagina, en elk
  bouwblok blijft ongesplitst (`page-break-inside: avoid`). Om dat
  daadwerkelijk te laten passen zijn de teksten binnen een bouwblok
  (uitleg, centrale vraag, vragentabel, opmerking) flink verdicht:
  Kleinere letters, minder regelhoogte en marge. Bracht het totaal
  aantal pagina's terug van 18 naar 11 voor de Klantcontact-scan.
- **Dubbele titel per bouwblok weggehaald**: De titel + score stonden
  twee keer — één keer in de uitleg (bijv. "Organisatiestrategie") en
  nogmaals vlak boven de vragentabel. Dat tweede kopje is weg; de score
  staat nu rechtsboven bij de titel ín de uitleg (ook bij een bouwblok
  zonder rijke toelichting, dan valt het terug op de kale bouwblok-naam
  met score, in plaats van los content-blok).
- **Meer ruimte tussen de 2 bouwstenen op een pagina**: Marge en padding
  tussen bouwblokken vergroot.
- **Scheidingslijn tussen bouwstenen oranje** in plaats van lichtgrijs
  (de laatste bouwsteen van het document heeft er nu bewust geen, dat is
  geen scheiding tussen twee bouwstenen meer).
- **Conditionele opmaak op de score per vraag**: De Score-kolom in de
  vragentabel toont nu een gekleurd vakje per antwoord (1 rood t/m 5
  groen), met dezelfde kleuren als het bestaande `ANTWOORD_KLEUR`-systeem
  uit het admin-scanoverzicht — hergebruikt in plaats van een nieuwe
  kleurenset te verzinnen.
- **Bouwsteen-pagina's vullen de volledige hoogte**: Elk paar bouwstenen
  (1+2, 3+4, …) staat nu in een eigen pagina-vullende flex-kolom, dezelfde
  techniek als pagina 1: De restruimte verschijnt als één ruime
  tussenruimte tussen de twee bouwstenen, niet als onbenutte witruimte
  onderaan. Interne marges binnen een bouwsteen (na de titel, rond de
  centrale vraag, rond de tabel, vóór een opmerking) zijn ook iets
  ruimer.
- **Visie op 1 pagina**: De afsluitende Visie-sectie liep over 2
  pagina's. Algemene duidingssecties (`.algemene-sectie`) hebben nu
  kleinere letters, minder regelhoogte en tighter marges, zonder
  bovenrand/extra ruimte boven de kop, zodat de Visie op één pagina past
  (totaal 11 → 10 pagina's voor de Klantcontact-scan). De 2030-sectie
  van de AI-scan is veel langer en loopt nog steeds over meerdere
  pagina's, maar profiteert wel van dezelfde verdichting.
- **Coniche-logo in de footer vanaf pagina 2**: Rechtsonder staat nu
  achter de scannaam (bijv. "Volwassenheidsscan") het Coniche-logo, niet
  op pagina 1 (daar staat het al in de kop). Dat kan niet met Puppeteer's
  `footerTemplate` (één sjabloon voor alle pagina's), dus de footer
  ("Pagina X / Y", scannaam, logo) is verhuisd naar `@page`-marginboxen
  in de HTML zelf (`@bottom-left`/`@bottom-right`, met `@page :first`
  zonder logo) en `preferCSSPageSize` in `route.ts`.
- **Oranje gloed en "CONICHE SCAN"-label in de PDF-kop**: Zelfde hero-
  uitstraling als de webpagina's: Een verloop van licht oranje naar wit
  achter de kop, over de volle paginabreedte tot de bovenrand, met "Coniche
  Scan" als oranje label boven de titel. Daarvoor zijn de zijmarges van
  `@page` naar 0 gegaan (Chrome knipt anders af op de paginamarge) en heeft
  de body dezelfde 16mm als padding; de eerste pagina heeft geen bovenmarge.
- **Zelfde hero op de Visie-pagina in de PDF**: Ook de afsluitende
  Visie (en bij de AI-scan de 2030-sectie) begint met de oranje gloed,
  "Coniche Scan" als label en de titel van de webpagina ("Onze visie op
  goed klantcontact" / "Klantcontact richting 2030"). Daarvoor krijgt de
  eerste pagina van die sectie een eigen benoemde pagina (`@page
  algemene:first`) zonder bovenmarge. De Visie past nog op 1 pagina.
- **Visie-gloed vanaf de bovenrand van de pagina**: De Visie-pagina
  heeft nu een pagina zonder bovenmarge (`@page algemene`), zodat de
  oranje gloed echt bij de paginarand begint. Alleen voor secties die op
  1 pagina passen (`PAST_OP_1_PAGINA`, nu de Visie): Bij de lange
  2030-sectie zouden alle vervolgpagina's anders ook zonder bovenmarge
  beginnen, die houdt de gewone marge (met de gloed dus onder die marge).
- **Vaste ruimte na de oranje streep op de bouwsteenpagina's**: De
  restruimte van een pagina komt nu vóór de oranje streep (het eerste
  bouwsteen-blok rekt op) in plaats van ná de streep, en het tweede blok
  krijgt een vaste `padding-top` van 12mm. De streep verschuift dus per
  pagina, maar de ruimte eronder is overal gelijk.
- **Ruimte boven en onder de oranje streep gelijk**: De streep is nu een
  eigen element in het midden van de vrije paginaruimte (`margin: auto`),
  met 9mm padding aan beide kanten. De restruimte wordt zo gelijk verdeeld
  boven en onder de streep, op elke pagina (vervangt de eerdere aanpak
  met vaste ruimte alleen ná de streep).
- **Spelling**: "AI-scan" (nav-knop) en "AI-volwassenheid" (naam van het
  assessment, dus ook op kaarten, in de PDF en in de tabellen) in plaats
  van "AI Scan" / "AI-Volwassenheid". Browsers die de assessments al
  eerder in localStorage hebben geseed houden de oude naam tot hun
  opgeslagen assessments worden hersteld/gewist.
- **Bestandsnaam van de PDF per scan-type**: "{bedrijfsnaam} {kortLabel}
  Report.pdf", dus "<Organisatie> Volwassenheidsscan Report.pdf" voor de
  Klantcontact-scan en "<Organisatie> AI-scan Report.pdf" voor de AI-scan (was
  "- Resultaten" voor beide). Eén gedeelde functie
  (`lib/pdf/bestandsnaam.ts`) voor zowel de server-header als de
  download-naam in de browser, zodat die niet uit elkaar kunnen lopen.

Geverifieerd: Een echte PDF gegenereerd (via curl, buiten de browser om)
en pagina voor pagina bekeken in Chromium's ingebouwde PDF-viewer — kop,
radar/staafdiagram (geen afgeknipte labels meer na het verbreden van de
radar-viewBox), Top 3 + Legenda, en per bouwblok de uitleg direct gevolgd
door de vragentabel en opmerking, tot en met de afsluitende Visie-sectie
met de juiste paginanummering in de footer. Losstaand daarvan: Een echte
klik op "Als PDF" in de UI geeft een geldige PDF terug (`Content-Type:
application/pdf`, 200 OK), voor zowel de Klantcontact- als de
AI-Volwassenheidsscan. `npx tsc --noEmit`, `npm run build` en `npm run
lint` slagen zonder nieuwe fouten.

## 2026-09-24 — Nav-volgorde definitief, route /ai-scan, leespagina's opgeruimd

**Aanleiding**: Nieuwe/bijgewerkte spec-bestanden verwerkt
(`CLAUDE.md`, `stylesheet.md`, `datamodel.md`,
`bouwstenenmodel-visual.md`, `ai-domeinenmodel-visual.md`). Drie
concrete, nu expliciet vastgelegde punten voorgelegd en op alle drie
akkoord gekregen.

**Doorgevoerd**:
- **Nav-volgorde definitief**: `.nav-right` volgt nu exact CLAUDE.md
  sectie 3: scherm-specifieke acties samen, zonder scheidingslijn
  ertussen (bijv. "← Terug naar de scan" + "Exporteren" naast elkaar),
  dan een scheidingslijn (alleen als die acties er zijn), dan de 4 vaste
  content-links, dan een scheidingslijn (alleen als er een exit-actie
  is), dan de exit-actie. De net toegevoegde `terugActie`-prop op
  `PageWithChrome` is weer verwijderd — één `navRight`-prop volstaat.
- **Route hernoemd**: `/ai-domeinen` → `/ai-scan`, conform
  `ai-domeinenmodel-visual.md`. De "AI Scan"-knop in de header linkt nu
  naar de nieuwe route.
- **Overbodige leespagina's verwijderd**: `/visie/bouwstenen` en
  `/visie/ai` (platte tekstversies) zijn weg. Beide spec-bestanden zeggen
  nu expliciet "geen losse leespagina meer" — de beschrijving en
  centrale vraag per bouwsteen/domein leven uitsluitend nog in de modal
  van de interactieve visuals op `/bouwstenen` en `/ai-scan`.

Geverifieerd in de browser: Nav-volgorde klopt op de resultatenpagina
(inclusief de gegroepeerde "Terug naar de scan" + "Exporteren"), de
"AI Scan"-knop opent `/ai-scan` met behoud van `?code=`, en er linkt
nergens meer iets naar de verwijderde routes. `npx tsc --noEmit`, `npm
run build` en `npm run lint` slagen zonder nieuwe fouten.

## 2026-09-24 — "Klantcontact richting 2030": hero opgeschoond, nav-volgorde rechtgetrokken

**Aanleiding**: Sander vond de hero van `/klantcontact-2030` te druk (een
subtitel-zin plus een aparte kop "Geen vast eindbeeld" boven dezelfde
inleidende tekst) en de ruimte eronder te groot nu de subtitel weg was.
Los daarvan bleek `.nav-right` niet meer overeen te komen met de
bijgewerkte CLAUDE.md: Die legt sinds kort expliciet vast dat de 4 vaste
content-links "altijd bovenaan" staan (punt 1, vóór elke
scherm-specifieke actie), terwijl de resultatenpagina/doorloopflow ze nog
ná hun eigen acties toonden. Na de eerste ronde bleek Sander op de
resultatenpagina toch een extra scheidingslijn te willen, met "Terug naar
de scan" losstaand uiterst links ervan.

**Doorgevoerd**:
- `/klantcontact-2030`: De hero-subtitel ("Een duidingsstuk over de
  markt...") en de kop "Geen vast eindbeeld" zijn verwijderd — de twee
  inleidende alinea's staan er nog gewoon, direct onder de hero. Padding
  tussen hero en tekst verkleind (was `4.5rem`/`2.5rem`, nu
  `0.5rem`/`1rem`) nu er niets meer tussen zit.
- `.nav-right`-volgorde rechtgetrokken op alle schermen: `PageWithChrome`
  rendert de 4 vaste links nu vóór de overige pagina-specifieke
  `navRight`-content in plaats van erna, met de scheidingslijn +
  exit-actie (via de `toonTerug`-afhandeling, verplaatst van
  `MetingLinksNav` naar `PageWithChrome` zelf) nog steeds als laatste.
  `MetingLinksNav` doet nu alleen de 4 links, niet meer de exit-link.
- Nieuwe `terugActie`-prop op `PageWithChrome`: Een terug-actie binnen
  hetzelfde scherm die uiterst links komt te staan, gevolgd door een
  eigen scheidingslijn, vóór de 4 vaste links. Op de resultatenpagina
  gebruikt voor "← Terug naar de scan" (met pijltje, zoals de andere
  terug-acties in de nav), los van "Exporteren" dat bij de vaste links
  blijft staan.

Resultaat op de resultatenpagina: "← Terug naar de scan" →
scheidingslijn → Visie/Bouwstenen/AI Scan/2030 → Exporteren →
scheidingslijn → "← Terug naar Mijn metingen". Elders (doorloopflow,
"Mijn metingen") blijft de volgorde Visie/Bouwstenen/AI Scan/2030 →
scherm-specifieke actie(s) → scheidingslijn → exit-actie, waar van
toepassing.

Geverifieerd in de browser op de resultatenpagina, de doorloopflow en
"Mijn metingen" (waar de exit-actie terecht ontbreekt). `npx tsc
--noEmit`, `npm run build` en `npm run lint` slagen zonder nieuwe
fouten.

## 2026-09-24 — content-2030.md ingehaald: 4 ontbrekende onderdelen toegevoegd

**Aanleiding**: Bij het doorlopen van de bijgewerkte spec-bestanden bleek
`content-2030.md` flink uitgebreid ten opzichte van wat er al op
`/klantcontact-2030` stond. Per onderdeel gevraagd en akkoord gekregen op
alle vier.

**Doorgevoerd** (`data/klantcontact-2030-content.ts`,
`app/klantcontact-2030/page.tsx`):
- Nieuwe sectie "Kosten en businesscase" tussen "Wat dit voor AI concreet
  betekent" en "Wat dit voor mensen betekent" (Gartner/McKinsey-cijfers).
- 4e punt bij "Wat dit voor AI concreet betekent": "Beveiliging is voor
  een groot deel een intern vraagstuk" (Gartner), plus een ontbrekende
  cijferalinea bij punt 2 (Stanford HAI, AI-agents).
- 2 nieuwe alinea's bij "Wat dit voor mensen betekent" (Deloitte-cijfers
  over adoptie, McKinsey-cijfer over baanverlies).
- "De machine customer"-sectie uitgebreid met een nieuwe bullet-lijst van
  5 concrete effecten op het contact zelf, en een cijferalinea over
  wereldwijde AI-adoptie (Stanford HAI) bij punt 2.

Technisch: `TitelTekst.tekst` accepteert nu `string | string[]` zodat een
genummerd punt meerdere alinea's kan hebben (nodig voor de nieuwe
cijferalinea's); `GenummerdeLijst` in `klantcontact-2030/page.tsx` is
daarop aangepast.

Geverifieerd in de browser: Alle vier de toevoegingen staan op de juiste
plek en in de juiste volgorde op `/klantcontact-2030`. `npx tsc --noEmit`,
`npm run build` en `npm run lint` slagen zonder nieuwe fouten.

## 2026-09-24 — De 4 vaste links (Visie/Bouwstenen/AI Scan/2030) overal in de header

**Aanleiding**: Direct na de nav-herstructurering hieronder bleken de 4
vaste content-links te beperkt: Ze stonden alleen nog op "Mijn metingen"
en de 4 content-pagina's zelf, zoals CLAUDE.md op dat moment voorschreef.
Sander wilde de knoppen weer overal terug.

**Doorgevoerd**: `PageWithChrome` rendert de 4 vaste links (via
`MetingLinksNav`) nu zelf, altijd, in plaats van dat losse pagina's ze
zelf in hun `navRight` moeten opnemen — nieuwe props `code` (voor de
`?code=`-parameter) en `toonTerug` (voor de exit-link) op `PageWithChrome`
zelf. Daardoor staan ze nu ook op de eerder niet-bediende schermen: Kies
jouw assessment, de assessment-landingspagina, Voorbeeld-output, en
binnen de persoonlijke link ook op de Respondent-intake. Op de
doorloopflow en de resultatenpagina staan ze na de scherm-specifieke
acties ("Naar resultaten →", "Terug naar de scan" + Exporteren) en vóór
de scheidingslijn + exit-link, volgens de bestaande nav-volgorderegel.
De 5 pagina's die de links al hadden (Mijn metingen, Visie, Bouwstenen,
AI Scan, 2030) gebruiken nu ook de nieuwe `code`/`toonTerug`-props in
plaats van zelf `<MetingLinksNav>` te renderen, om dubbele links te
voorkomen. CLAUDE.md is bijgewerkt: Het eerder openstaande punt of deze
links ook op doorloopflow/resultatenpagina moesten staan, is hiermee
beantwoord (ja, overal) en uit de open punten gehaald.

Geverifieerd in de browser: De 4 links staan op alle geteste schermen
(home, assessment-landingspagina, Mijn metingen, doorloopflow,
resultatenpagina), in de juiste volgorde en zonder dubbele links; de
Exporteren-dropdown werkt nog steeds. `npx tsc --noEmit`, `npm run build`
en `npm run lint` slagen zonder nieuwe fouten.

## 2026-09-24 — Nav-herstructurering rond "Mijn metingen", export-dropdown, "Naar resultaten →" en 2030-sectie

**Aanleiding**: `CLAUDE.md`, `stylesheet.md`, `content-2030.md`,
`beheerpagina.md` en `v1-aanpassingen.md` zijn bijgewerkt met een
aantal concrete specificatiewijzigingen. In plaats van die stilzwijgend
door te voeren (zoals eerder in dit project gebeurde), is per onderdeel
expliciet gevraagd of het doorgevoerd moest worden — op alle 4 is "ja"
geantwoord.

**Doorgevoerd**:
- **"De machine customer" op `/klantcontact-2030`**: nieuwe sectie tussen
  "Vijf dingen die iedere organisatie moet ontwerpen" en "Wat dit voor AI
  concreet betekent", met een korte inleiding, 3 genummerde punten en een
  afsluiting — content uit het bijgewerkte `content-2030.md`
  (`data/klantcontact-2030-content.ts`).
- **Eén export-knop i.p.v. twee losse**: nieuwe herbruikbare
  `DropdownKnop`-component (`components/DropdownKnop.tsx`,
  `.dropdown-knop`/`.dropdown-menu`-stijlen in `components.css`) volgens de
  nieuwe "Dropdown-knop"-spec in `stylesheet.md`. Op de resultatenpagina
  vervangen de twee uitgeschakelde PDF/CSV-knoppen onderaan de pagina door
  één "Exporteren ▾"-knop in de nav, met "Als PDF"/"Als CSV" als
  (nog uitgeschakelde) opties.
- **"Naar resultaten →" in de doorloopflow**: zodra een invulling
  `"afgerond"` is, toont de nav-rechts van de doorloopflow een link
  rechtstreeks naar de resultatenpagina, vóór de scheidingslijn — zodat
  een respondent die per ongeluk terug navigeert naar de scan niet
  vastloopt zonder weg terug naar de resultaten.
- **Nav-herstructurering rond "Mijn metingen"**: de 4 vaste content-links
  (Visie/Bouwstenen/AI Scan/2030 — voorheen globaal via `PageWithChrome`
  op élke pagina) staan nu alleen nog op de 5 relevante pagina's: "Mijn
  metingen" zelf en de 4 content-pagina's, via de nieuwe
  `MetingLinksNav`-component. `PageWithChrome` is teruggebracht naar een
  simpele doorgeefluik (`navRight`/`logoHref` props, geen hardcoded
  content meer). Om de naamconflicten op te lossen tussen de bestaande
  interactieve grids en de nieuwe platte-tekstpagina's uit dezelfde
  content, zijn de laatste ondergebracht op nieuwe routes:
  `/visie/bouwstenen` (uit `visie-coniche.md` deel 2) en `/visie/ai` (uit
  `visie-ai-klantcontact.md`) — `/bouwstenen` en `/ai-domeinen`
  (de interactieve grids) blijven ongewijzigd bestaan, maar verliezen hun
  plek in de hoofdnav. Overal binnen een persoonlijke respondent-link
  (intake, doorloopflow, resultaten, Mijn metingen, de 4 content-pagina's)
  gaat het logo nu naar "Mijn metingen" i.p.v. de publieke homepage
  (`logoHref`-prop op `SiteHeader`), en threaden alle content-pagina's een
  `?code=`-parameter door zodat ze zowel hun eigen "← Terug naar Mijn
  metingen"-exitlink als de logo-bestemming kunnen opbouwen. Doorloopflow
  en resultatenpagina krijgen bewust niet de 4 content-links in hun nav
  (CLAUDE.md markeert dat expliciet als een nog open punt, geen vastgesteld
  gedrag).

Geverifieerd in de browser: "Mijn metingen" en de 4 content-pagina's tonen
de nav-links en (waar van toepassing) de exitlink correct, inclusief
doorgegeven `?code=`; de Exporteren-dropdown opent/sluit correct met de
juiste tooltip op de uitgeschakelde opties; "Naar resultaten →" verschijnt
alleen bij een afgeronde invulling; het logo verwijst binnen een
respondent-link naar "Mijn metingen"; `/bouwstenen` en `/ai-domeinen`
blijven los bereikbaar en werken ongewijzigd. `npx tsc --noEmit`, `npm run
build` en `npm run lint` slagen zonder nieuwe fouten (de 4 bestaande
warnings in `js/*.js` zijn ongerelateerde legacy-bestanden).

## 2026-09-24 — Fix: "Kopieer" bevestigde soms een mislukte klembord-actie

**Aanleiding**: Sander meldde dat de "Kopieer"-knop bij een publieke link
soms een niet-werkende link kopieert. Oorzaak: `navigator.clipboard.
writeText(...)` werd aangeroepen zonder de belofte af te wachten of op
een fout te controleren — de knop toonde altijd meteen "Gekopieerd!",
ook als het schrijven naar het klembord op de achtergrond mislukte (bijv.
geen focus op de pagina, strenger browserbeleid). In dat geval bleef de
vórige inhoud van het klembord staan — een oude, mogelijk niet meer
geldige link — zonder dat de gebruiker dat kon zien.

**Doorgevoerd**: nieuwe `kopieerNaarKlembord()` in `lib/clipboard.ts`:
wacht de Clipboard API af en valt bij een fout terug op de klassieke
`document.execCommand("copy")`-methode via een tijdelijk tekstveld. Beide
plekken die een publieke link kopiëren
(`app/beheer/scans/[respondentId]/page.tsx`,
`app/beheer/organisaties/[organisatieId]/page.tsx`) gebruiken 'm nu, en
tonen "Gekopieerd!" alleen nog bij een bevestigd succesvolle kopie —
anders "Mislukt, probeer opnieuw" zodat de gebruiker het merkt.

Geverifieerd in de browser: de knop toont "Gekopieerd!" alleen als het
klembord daadwerkelijk is bijgewerkt. `npx tsc --noEmit`, `npm run build`
en `npm run lint` slagen zonder fouten.

## 2026-09-24 — Nieuwe pagina "AI" met het AI-domeinenmodel

**Aanleiding**: `ai-domeinenmodel-visual.md` toegevoegd (analoog aan
`bouwstenenmodel-visual.md`, maar dan voor de 8 AI-domeinen). Sander
vroeg om een nav-knop "AI" tussen "Bouwstenen" en "2030" die hiernaartoe
verwijst — de spec zelf liet die plek expliciet open ("volledig open,
hangt nog nergens").

**Doorgevoerd**: nieuwe pagina `/ai-domeinen`, één plat grid van 4×2
kaarten (geen categorielaag zoals bij de Klantcontact-scan, dus geen
overkoepelende/fundamentele balken en geen kleurgroepering — alle 8
domeinen gebruiken dezelfde `--or`-accentkleur, zoals de spec voorschrijft
om geen niet-bestaande indeling te suggereren). Klikken opent dezelfde
`Modal`-component als `/bouwstenen` en de toelichting-overlay in de
doorloopflow, met eyebrow "AI-DOMEIN N".

**Update dezelfde dag**: `visie-ai-klantcontact.md` is aangeleverd, dus de
eerder genoemde beperking (geen "Centrale vraag"-blok, alleen de kale
omschrijving) is opgeheven. Nieuw `data/ai-domeinen-content.ts`
(hetzelfde patroon als `data/bouwstenen-content.ts`) met beschrijving +
centrale vraag per domein. `/ai-domeinen` toont nu het volledige
"Centrale vraag"-blok. `components/BouwblokForm.tsx` (de
toelichting-overlay in de doorloopflow) is verbreed van alleen de
Klantcontact-scan naar ook de AI-scan: één `toelichtingInfo`-object dat
naar `alleBouwstenen` (bb…) of `aiDomeinen` (ai…) kijkt en anders op
`bouwblok.toelichting` terugvalt, zodat het i-icoontje in de doorloopflow
voor beide scans nu exact dezelfde content toont als de bijbehorende
publieke overzichtspagina — zoals `ai-domeinenmodel-visual.md` vereiste
("geen content dupliceren").

Geverifieerd in de browser: nav-knop, grid, klik-naar-modal, de
actieve/hover-status, en het i-icoontje in de AI-doorloopflow tonen
dezelfde "Centrale vraag"-content. `npx tsc --noEmit`, `npm run build` en
`npm run lint` slagen zonder fouten.

## 2026-09-23 — Rapportage-knop: gemiddelde over afgeronde respondenten per meting

**Aanleiding**: Sander vroeg om een "Rapportage"-knop naast "Uitnodigen"
per meting, die een rapport maakt over de ingevulde scans met status
"afgerond". Dit is de eenvoudigste invulling van het backlogpunt
"Aggregatie over meerdere respondenten binnen een meting" (alleen het
gemiddelde, geen spreiding/afwijking — dat stond daar expliciet nog open).

**Doorgevoerd**: nieuwe knop `Rapportage` in `ScanUitvoeringBlok`
(`app/beheer/organisaties/[organisatieId]/page.tsx`), naast de
uitnodigingsform, uitgeschakeld zolang er nog geen enkele afgeronde
invulling is. Leidt naar een nieuwe pagina
`/beheer/rapportage/[scanUitvoeringId]`: pakt alle invullingen met status
"afgerond" binnen die ene meting, middelt per vraag over die respondenten
(`(som van de antwoorden op die vraag) / aantal respondenten`), en geeft
dat gemiddelde-antwoordenobject aan de bestaande `ResultsView`-component
— dezelfde component als de individuele resultatenpagina, dus bouwblok-/
categoriescores, radar, staafdiagram, top 3 en legenda werken hier
identiek, nu op het gemiddelde in plaats van één respondent. Nieuwe
`useScanUitvoering(scanUitvoeringId)`-lookup in `lib/db.ts` om organisatie
+ meting rechtstreeks op scanUitvoering-id te vinden (bestond nog niet;
de bestaande lookups zochten op scanInvulling-id of toegangscode).

Geverifieerd in de browser: rapportage voor een meting met 2 afgeronde
AI-scan-respondenten toont een correct gemiddelde (overall score 3.5,
"Sterk punt"), met werkende radar/staafdiagram-tooltips en top 3.
`npx tsc --noEmit`, `npm run build` en `npm run lint` slagen zonder
fouten.

## 2026-09-23 — Visuele verfijning bouwstenen-overzicht, spacing en hergebruik in de doorloopflow

**Aanleiding**: iteratieve bijsturing door Sander op de eerste bouwpoging
van `/bouwstenen` (uitlijning, kleuren, kadering) en op de spacing van de
nieuwe content-pagina's, plus het verzoek om de toelichting-overlay in de
doorloopflow dezelfde rijke informatie te tonen als de bouwstenen-pagina.

**`/bouwstenen`, stap voor stap bijgesteld naar het definitieve resultaat**:
- Elk bouwsteen-blok vult verticaal (`display:flex; align-items:center`)
  zodat 1-regelige en 2-regelige titels binnen dezelfde rij evenveel
  ruimte gebruiken, met een vaste `height: 4.75rem` zodat alle 15 blokken
  exact even groot zijn (niet alleen even hoog, ook `minWidth: 0` zodat
  lange samengestelde woorden ("Kennismanagement", "Kanaalmanagement") de
  kolombreedte niet meer opdrukken — die twee mogen nu over 2 regels,
  met een onzichtbare break-hint op de samenstellingsgrens in plaats van
  een lelijke afbreking midden in "-ment").
- De 3 gegroepeerde rijen (Organisatie/Proces & Tech/Mens) hebben een
  achtergrondkleur (`var(--or-faint)`, licht oranje) die label + kaarten
  samen omvat, zonder bullet-stip voor de labeltekst.
- Blok 1, 5, 9, 13 en 15 lijnen rechts uit met kolom 3; blok 2 lijnt
  rechts uit met kolom 4 (kolom 1 blijft voor alle full-width balken en
  grid-kaarten gelijk links uitgelijnd) — bereikt door de balken
  `gridColumn: "1 / span 3"` resp. `"1 / -1"` te geven binnen dezelfde
  4-koloms grid als de rijen zelf, i.p.v. een eigen `1fr`-grid.
- Een oranje stippellijn-kader om het geheel, waarvan de boven- en
  onderrand niet om blok 1 en 15 heen lopen maar er precies horizontaal
  doorheen (op de verticale middens) — gemeten via `getBoundingClientRect`
  in een `useLayoutEffect` (`StippellijnKader`-component), niet met een
  gewone CSS `border`, omdat die geen niet-symmetrische padding kan geven.
  Dit wijkt bewust af van `bouwstenenmodel-visual.md` ("geen
  stippellijn-kader om de grid heen") — expliciet zo gevraagd door Sander.
- Categorielabels ("Organisatie", "Proces & Tech", "Mens") van `text-xs`
  naar `text-sm`, gelijk aan de bouwsteen-titels.

**Spacing op `/visie` en `/klantcontact-2030` verkleind**: de gedeelde
`.section`-klasse (6rem verticale padding, bedoeld voor landingspagina's)
verving ik op deze twee content-pagina's door een kleinere eigen padding
(2.5rem), zonder de gedeelde klasse zelf aan te passen (die wordt elders
nog gebruikt). Hero-onderkant en de afsluitende ruimte voor de footer
zijn ook verkleind. De herointro op `/visie` is verbreed (`maxWidth`
38→44rem) zodat hij op exact 2 regels uitkomt i.p.v. 3.

**Privacy-koppen kleiner**: de 9 genummerde `<h2>`-koppen op `/privacy`
hebben nu `fontSize: 1.3rem` in plaats van de standaard h2-grootte
(~2.65rem) — blijven semantisch `<h2>`, alleen visueel kleiner.

**Nav**: "2030" toegevoegd naast "Visie" en "Bouwstenen" in de gedeelde
header (`PageWithChrome`), verwijzend naar de al bestaande
`/klantcontact-2030`-pagina.

**Toelichting-overlay in de doorloopflow hergebruikt de bouwstenen-content**:
`components/BouwblokForm.tsx` toont nu, voor de Klantcontact
Volwassenheidsscan (bouwblok-id's beginnend met "bb"), dezelfde
eyebrow/titel/"Centrale vraag"/beschrijving-opmaak als de
`/bouwstenen`-modal, via een nieuwe `alleBouwstenen`-lookup in
`data/bouwstenen-content.ts` (gekoppeld op `bouwblok.volgnummer`). De
AI-Volwassenheidsscan heeft deze content nog niet (bevestigd door
Sander: "Voor de AI scan zullen we deze nog maken") en valt terug op de
bestaande `bouwblok.toelichting`-tekst. `components/Modal.tsx` kreeg
hiervoor eerder al de optionele `eyebrow`/`accentColor`-props (zie de
vorige changelog-entry), nu ook gebruikt door deze tweede plek.

Geverifieerd in de browser bij elke stap; `npx tsc --noEmit`,
`npm run build` en `npm run lint` slagen zonder fouten.

## 2026-09-23 — Drie nieuwe content-specs verwerkt: bouwstenenmodel, 2030, privacy

**Aanleiding**: Sander en Joost voegden drie nieuwe specs toe
(`bouwstenenmodel-visual.md`, `content-2030.md`, `privacy-pagina.md`) en
werkten `v1-aanpassingen.md` punt 2 bij: de publieke link gaat nu altijd
eerst naar "Mijn metingen" (ook bij precies één invulling), met daarop
vaste links naar Visie, Bouwstenen en een nieuw 2030-duidingsstuk.

**Doorgevoerd**:
- **`/bouwstenen` volledig herbouwd** naar `bouwstenenmodel-visual.md`:
  2 volle-breedte balken (Overkoepelend), een 4-koloms grid per categorie
  (Organisatie/Proces & Tech/Mens) en 1 balk (Fundament). Kaarten zijn wit
  met een linker accentrand in de categoriekleur (`--accent` +
  `.card-accent-left`), geen gevulde kleurvlakken — de categoriekleur
  vult alléén de kaart waarvan de modal nu open staat. Klikken opent de
  bestaande `Modal`-component (niet een nieuwe) met een eyebrow
  "CATEGORIE · BOUWSTEEN N", de naam, een "Centrale vraag"-blok met
  linker accentbalk, en de beschrijving. `components/Modal.tsx` kreeg
  daarvoor twee nieuwe, optionele props (`eyebrow`, `accentColor`) —
  bestaande aanroepen (de `toelichting`-overlay in `BouwblokForm.tsx`)
  blijven ongewijzigd werken. `button.card:hover` toegevoegd aan
  `components.css` (de bestaande hover-lift gold tot nu toe alleen voor
  `a.card`).
- **"Mijn metingen" (`/s/[code]`) toont nu altijd het overzicht**, ook bij
  precies één invulling (niet meer automatisch doorsturen). Onderaan een
  "Meer lezen"-blok met vaste links naar Visie, Bouwstenen en het nieuwe
  2030-duidingsstuk.
- **Nieuwe pagina `/klantcontact-2030`**, content uit `content-2030.md`
  (`data/klantcontact-2030-content.ts`): geen vast eindbeeld, vijf dingen
  om te ontwerpen, wat dit voor AI en voor mensen betekent, wat
  voorbereide organisaties gemeen hebben, en de relatie met de scan zelf.
- **Nieuwe pagina `/privacy`**, content uit `privacy-pagina.md`
  (9 secties; 5, 7 en 8 bewust met placeholder-tekst, nog niet juridisch
  getoetst). Footer heeft nu een "Privacy"-link naast "Beheer". De
  respondent-intake (`app/scan/[respondentId]/intake/page.tsx`) kreeg een
  verplicht toestemmingsvakje ("Ik geef toestemming om mijn antwoorden...
  te delen met Coniche") met een link naar deze pagina — alleen
  client-side verplicht (geen nieuw datamodel-veld: er wordt nu geen
  aparte toestemmingsstatus opgeslagen, dat stond ook niet in de spec).

Geverifieerd in de browser: de bouwstenen-kaarten openen de modal met de
juiste categoriekleur en centrale vraag, en de actieve kaart kleurt in en
weer uit bij sluiten; "Mijn metingen" toont beide test-metingen plus de
drie vaste links; het toestemmingsvakje blokkeert daadwerkelijk het
verzenden van de intake zolang het niet is aangevinkt.
`npx tsc --noEmit`, `npm run build` en `npm run lint` slagen zonder
fouten.

## 2026-09-23 — De 6 actieve punten uit v1-aanpassingen.md verwerkt

**Aanleiding**: Sander en Joost hebben `CLAUDE.md`, `beheerpagina.md`,
`v1-aanpassingen.md`, `backlog.md`, de content-bestanden en `stylesheet.md`
grondig herzien, en drie nieuwe documenten toegevoegd (`datamodel.md`,
`visie-coniche.md`, `inhoudelijk-fundament.md`). Sander vroeg om deze
aangepaste specs te verwerken in de app. Alle zes punten die toen nog
"Actief" stonden in `v1-aanpassingen.md` zijn nu doorgevoerd (en daar
verplaatst naar "Opgelost"):

- **Punt 16, "Respondenten" i.p.v. "Leden"**: alle UI-teksten in
  `app/beheer/**` aangepast (knoppen, meldingen, rij-subtitels). De
  interne typenaam `OrganisatieLid` blijft ongewijzigd, zoals de spec
  toestaat.
- **Punt 15, Fundament-kleur antraciet**: `--fu` (`#44403c`) toegevoegd
  aan `tokens.css` en de Tailwind-brug in `globals.css`. `lib/colors.ts`
  → `CATEGORIE_COLORS` verloor de `textHex`-tekstvariant (niet meer nodig
  nu alle vijf kleuren zelf leesbaar zijn) en de sleutel "goud" heet nu
  "antraciet" (ook zichtbaar in de contentbeheer-dropdown, dus eerlijk
  benoemd). `data/klantcontact-assessment.ts`'s Fundament-categorie
  gebruikt de nieuwe sleutel.
- **Punt 13, Scorekleuren in vijf stappen**: nieuwe `--score-1` t/m
  `--score-5`-tokens (`tokens.css`) en `SCORE_KLEUR`/`scoreKleur()` in
  `lib/colors.ts`, vervangen de classificatie-gebaseerde kleuring
  (`CLASSIFICATIE_HEX`, weg) in `ScoreCircle`, `CategoryBarChart`, de
  top 3-pills en het admin-scanoverzicht. De legenda toont per
  classificatie nu 1 of 2 kleurstippen (bijv. "Basis op Orde" = rood +
  oranje), passend bij welke scores die classificatie omvat.
- **Punt 12, Bouwsteen-nummering**: `data/klantcontact-assessment.ts`'s
  15 `volgnummer`-velden bijgewerkt naar de nieuwe nummering uit
  `visie-coniche.md`. De `id`-velden (en dus vraag-id's, dus bestaande
  antwoorden) blijven ongewijzigd.
- **Punt 14, Geen achterblijvende data na verwijderen**: nieuwe
  `controleerDataIntegriteit()` in `lib/db.ts`, met een "Data-integriteit
  — Controleer nu"-knop op het beheerdashboard. Nested structuur
  voorkomt de meeste weesdata vanzelf (kind bestaat alleen genest in zijn
  ouder); de enige plek waar het wél kon (`verwijderLeden` die niet
  cascadeert) was al correct.
- **Punt 2, Korte niet-herleidbare link**: nieuw `toegangscode`-veld op
  `OrganisatieLid` (`lib/toegangscode.ts` genereert 10 tekens uit een
  alfabet zonder 0/o/1/l/i, cryptografisch random), gezet bij het
  aanmaken van een lid in `nodigLidUit`. `lib/uitnodiging-link.ts` bouwt
  nu `/s/<code>` in plaats van de oude link met een base64-bootstrap
  erin. Nieuwe route `app/s/[code]/page.tsx`: bij precies 1 invulling
  direct doorsturen (intake/doorloop/resultaten naar keuze van de
  status), bij 0 of meerdere een "Mijn metingen"-overzicht. Bewuste
  vereenvoudiging t.o.v. het voorstel: geen aparte `Toegangscode`-tabel —
  de code staat direct op het lid, dat geeft hetzelfde resultaat
  (lid weg → code weg) zonder een tweede structuur erbij.
  **Gevolg**: de link werkt niet meer cross-browser zonder gedeelde
  backend (bewuste keuze, zie v1-aanpassingen.md) — `importScanInvulling`/
  `decodeBootstrap`/`ScanInvullingBootstrap` zijn daarom verwijderd.
  Ook `ScanUitvoering.status`/`.openVanaf`/`.sluitOp` zijn weg: nooit
  gebruikt, en meetperiode-planning staat expliciet in `backlog.md`.

Geverifieerd in de browser: Fundament-accentkleur is antraciet in de
doorloopflow; het resultatenscherm toont "Uitbouwen" nu in geel (score 3)
in plaats van oranje, met de juiste kleur op de cirkel, staafdiagram, top
3 en legenda; de sidebar toont de nieuwe bouwsteen-nummers; de
data-integriteitscontrole meldt "Geen achterblijvende data gevonden."; en
een respondent met twee metingen (Klantcontact + AI) opent via zijn ene
`/s/<code>`-link het "Mijn metingen"-overzicht, met per meting een link
naar het juiste scherm. `npx tsc --noEmit`, `npm run build` en
`npm run lint` slagen zonder fouten.

## 2026-09-23 — "Verwijderen" op Ingevulde scans laat de rij nu ook echt verdwijnen

**Aanleiding**: Sander meldde dat hij een scan niet kon verwijderen op
"Ingevulde scans" — na bevestigen van de verwijderactie bleef de rij
gewoon staan. Oorzaak: die knop deed wat beheerpagina.md ("Verwijderen
— cascade-regels") altijd al voorschreef voor déze pagina — alleen de
antwoorden/status resetten naar "uitgenodigd", niet de rij weggooien, zodat
het lid en de uitnodiging bleven bestaan. Functioneel werkte dat dus
precies zoals gespecificeerd, maar het woord "Verwijderen" wekt de
verwachting dat de rij verdwijnt, en dat gebeurde niet — verwarrend genoeg
om als bug te voelen.

**Doorgevoerd**: Sander koos ervoor om het gedrag aan te passen in plaats
van alleen de tekst te verduidelijken. `lib/db.ts` heeft nu
`verwijderScanInvullingen(scanInvullingIds)` in plaats van
`resetScanInvullingen`: deze gooit de `ScanInvulling` zelf weg uit haar
`ScanUitvoering`, dus de rij verdwijnt uit "Ingevulde scans". Bewust
NIET zo diep als "Leden verwijderen" op de organisatiepagina (dat gooit
de hele persoon weg, met cascade naar ÁL hun metingen) — deze actie raakt
alleen deze ene scan-uitnodiging. Als dezelfde persoon nog een andere
meting heeft lopen (bijv. zowel de Klantcontact- als de AI-scan), blijft
die andere meting gewoon intact; alleen het lid zelf (naam, e-mailadres)
overleeft sowieso altijd. `app/beheer/scans/page.tsx` gebruikt de nieuwe
functie en heeft een aangepaste bevestigingstekst die dit ook benoemt.

Geverifieerd: een testpersoon met twee metingen (Klantcontact + AI) —
verwijderen van de Klantcontact-rij liet die rij verdwijnen, terwijl de
AI-rij van dezelfde persoon (nog steeds "Afgerond", 100%) intact bleef en
het lid zelf in de organisatie bleef bestaan.

## 2026-09-23 — Tijdelijke testknop op de doorloopflow: vragenlijst automatisch invullen

**Aanleiding**: op verzoek van Sander, om het resultatenscherm
(classificatiekleuren, radar chart, spreiding tussen bouwblokken) te
kunnen testen zonder telkens met de hand 40-60 vragen te beantwoorden.

**Doorgevoerd**: bovenaan `app/scan/[respondentId]/doorloop/page.tsx`
staat nu een duidelijk gemarkeerd blok ("TESTKNOP (tijdelijk)", stippellijn,
oranje) met een invoerveld voor een gemiddelde score (2 t/m 4) en een knop
"Vul alle vragen automatisch in". Die vult ALLE vragen van de hele
assessment (niet alleen het huidige bouwblok) met een cyclisch patroon:
gemiddelde-1, gemiddelde, gemiddelde+1, herhalend — zodat bouwblokken en
categorieën een realistische spreiding rond het gekozen gemiddelde
krijgen in plaats van allemaal exact dezelfde score. Zet de invulling
meteen op "afgerond" en springt door naar het resultatenscherm.

**Nog te doen vóór productie**: dit is expliciet tijdelijk (zie de
comment in de code) en moet eruit voordat de app naar echte respondenten
gaat — een respondent hoort dit hulpmiddel nooit te zien.

## 2026-09-23 — Test-modus verwijderd (admin-login-bypass en testklant-knop)

**Aanleiding**: Sander vroeg om "de test optie" te verwijderen. Dit was
`lib/instellingen.ts`: één localStorage-vlag, standaard AAN, die twee
dingen deed — Beheer openen zonder in te loggen (`app/beheer/layout.tsx`)
en op de assessment-landingspagina een "Start assessment"-knop tonen die
direct naar een vaste testklant sprong (`vindOfMaakTestInvulling` in
lib/db.ts) in plaats van de knop uit te schakelen. Precies het punt dat
al eerder was gesignaleerd als iets om vóór productie op te lossen (de
live Vercel-deploy stond hiermee open zonder wachtwoord).

**Doorgevoerd**: `lib/instellingen.ts` verwijderd. `app/beheer/layout.tsx`
valt nu altijd terug op `BeheerLoginForm` (echte e-mail+wachtwoord-login,
`lib/admin-auth.ts` — die bestond al, test-modus was er alleen een bypass
omheen). `app/beheer/page.tsx` verloor de test-modus-toggle en het
testklant-linkblok. `app/[assessmentId]/page.tsx` toont de "Start
assessment"-knop nu altijd disabled met de "toegang via persoonlijke
link"-tekst; `vindOfMaakTestInvulling` en de bijbehorende
`TEST_LID_EMAIL` in lib/db.ts zijn weg. De vaste testklant-seed in
`data/demo-organisatie.ts` (voor een niet-lege eerste indruk van het
beheerscherm) blijft ongewijzigd staan — dat is losse seed-data, geen
"test optie" om in of uit te schakelen.

Geverifieerd: `/beheer` toont nu direct het inlogformulier (geen bypass
meer), de landingspagina's "Start assessment"-knop is altijd disabled.
`npx tsc --noEmit`, `npm run build` en `npm run lint` slagen zonder
fouten.

## 2026-09-23 — Datamodel herbouwd op `datamodel-rbac-voorstel.md` (Deel 1: structuur, geen auth/RBAC)

**Aanleiding**: Sander deelde `datamodel-rbac-voorstel.md` (status:
voorstel, nog niet gevalideerd) en vroeg of dit in de app past en welke
verschillen er zijn. Belangrijkste verschil met het oude model: één
`Respondent`-record deed daar drie dingen tegelijk — de persoon, de
organisatie-uitnodiging én de ene invulling — waardoor een organisatie
nooit meer dan één scanronde per persoon kon hebben en een tweede
scan-type voor dezelfde organisatie niet paste. Het voorstel splitst dit
in `Organisatie → OrganisatieLid[]` (de persoon) en
`Organisatie → ScanUitvoering[]` (een geplande ronde, met eigen
assessment-type) `→ ScanInvulling[]` (één poging van één persoon in één
ronde). Sander koos expliciet voor **Deel 1**: alleen deze structurele
herindeling, niet het auth/RBAC-gedeelte van het voorstel.

**Doorgevoerd**: `lib/types.ts` en `lib/db.ts` volledig herbouwd op de
nieuwe structuur; alle pagina's in `app/beheer/**` en `app/scan/**`
volgen. Bewuste vereenvoudigingen t.o.v. het voorstel, alle vier omdat
ze óf een echte backend vereisen (die er nog niet is) óf geen aantoonbare
meerwaarde hebben in een localStorage-prototype:
- Geen `Gebruiker`/`Sessie`/`Rol`/`Permissie`/`VerificatieCode`-hashing/
  `AuditEvent` — dit zijn geen datamodel-keuzes maar een echte
  authenticatielaag; die clientside nadoen met localStorage zou schijn-
  veiligheid opleveren. Blijft "Deel 2", nog te bouwen zodra er een
  backend is.
- Geen apart `toegangsToken`-veld: `nieuwId()` (`lib/id.ts`) genereert al
  `crypto.randomUUID()`, dus elk `.id` is zelf al niet te raden — een
  tweede token ernaast zou hetzelfde probleem dubbel oplossen.
- Content (`Categorie`/`Bouwblok`/`Vraag`) blijft genest in de
  Assessment-data, niet genormaliseerd naar losse FK-tabellen — dat stond
  niet in de vijf onderbouwde redenen van het voorstel en zou puur kosten
  toevoegen.
- `antwoorden`/`opmerkingenPerBouwblok` blijven `Record<string, ...>`-
  maps op `ScanInvulling`, geen losse tijdgestempelde per-antwoord-
  records — niet nodig zolang er geen antwoordgeschiedenis getoond hoeft
  te worden.
- De publieke link wijst nog steeds naar `ScanInvulling.id`, niet naar
  `OrganisatieLid.id` — dat laatste hoort bij het voorstel's "persoonlijke
  omgeving met meerdere invullingen"-scherm, dat expliciet nog niet
  gebouwd is (zie ook backlog.md).

Terminologie: intern heet dit nog steeds "Scanuitvoering" (het
`ScanUitvoering`-type, `scanUitvoeringId`, functienamen als
`maakScanUitvoering`), maar alle gebruikersgerichte tekst (admin-scherm,
knoppen, koppen) zegt voortaan "Meting" — op verzoek van Sander.

Geverifieerd in de browser: een organisatie kan nu meerdere
scanuitvoeringen/metingen hebben (verschillende assessment-types of
rondes); een tweede uitnodiging voor hetzelfde e-mailadres binnen
dezelfde organisatie hergebruikt het bestaande `OrganisatieLid` in plaats
van een dubbele persoon aan te maken; de doorloopflow, intake en
"Ingevulde scans"-overzicht (incl. nieuwe "Meting"-kolom en filters)
werken door op de nieuwe structuur. `npx tsc --noEmit`, `npm run build`
en `npm run lint` slagen zonder fouten.

## 2026-09-22 — Fundament-geel te licht als tekstkleur, donkerdere variant toegevoegd

**Aanleiding**: Sander meldde dat de gele Fundament-kleur (`--ye:
#ffc043` uit tokens.css) slecht leesbaar is — als tekst ("FUNDAMENT" in
de sidebar, "BOUWBLOK 15" boven een bouwblok) en als achtergrond onder
witte tekst (het "bezig"-rondje) heeft dit geel te weinig contrast op
een lichte achtergrond. Geen bouwfout: het officiële merkpalet in
stylesheet.md heeft zelf geen donkerder geel/goud naast `--ye`/`--ye-l`.

**Doorgevoerd**: `lib/colors.ts` → `CATEGORIE_COLORS.goud` heeft nu een
los `textHex: "#8a6d00"` naast de officiële `hex: "#ffc043"`. Alle
plekken die de categoriekleur als `--accent` (tekst, wit-op-kleur
achtergrond, randen) gebruiken — `Sidebar.tsx`, `BouwblokForm.tsx`, en
via `accentHex` ook `ScaleRadio.tsx` — gebruiken nu `textHex` in plaats
van `hex`. Voor de andere vier categorieën (oranje/blauw/paars/groen)
is `textHex` gelijk aan `hex`, die zijn zelf al donker genoeg. De
officiële `#ffc043`/`bg-ye` blijft ongewijzigd beschikbaar voor plekken
waar geel puur als kleurvlak dient, niet als tekst.

Bouwbeslissingen die niet uit een van de content-/specdocumenten
(CLAUDE.md, v1-aanpassingen.md, etc.) volgen, maar tijdens het bouwen
door Sander zijn genomen — meestal om een tegenstrijdigheid tussen twee
eerder aangeleverde documenten op te lossen. Nieuwste bovenaan.

## 2026-09-22 — Sidebar: koptekst (naam/voortgang) losgemaakt van de lijst

**Aanleiding**: op verzoek van Sander (met screenshot) — de naam en
voortgang ("X% — Y van Z vragen") verdwenen bovenin de sidebar zodra je
in `.flow-main` helemaal naar beneden scrolde naar het einde van een
bouwblok (bij de "Volgende"-knop). Root cause: de sidebar was ÉÉN sticky
box (naam + voortgang + lijst samen). Een `position: sticky`-element
ontsnapt onvermijdelijk aan het vastplakken zodra de scroll de onderkant
van zijn eigen containing block nadert — en dat gebeurt bij een gedeelde
box exact aan het eind van elk bouwblok, precies het moment waarop de
voortgang zichtbaar moet blijven. Eerdere tussenstap (`.flow-sidebar`
laten meegroeien met `.flow-main` i.p.v. vaste 100vh-hoogte) hielp wel
(later probleem pas), maar loste het niet fundamenteel op: bij het einde
van ÉÉN bouwblok is er per definitie nooit genoeg resterende scrolhoogte
over voor een grote sticky box om vast te blijven plakken.

**Doorgevoerd**: de koptekst (naam + voortgangsbalk + label) en de lijst
(categorieën/bouwblokken) zijn nu twee aparte sticky elementen
(`.flow-sidebar-koptekst` / `.flow-sidebar-lijst` in components.css, zie
`components/Sidebar.tsx`) i.p.v. één gedeelde box. De koptekst is klein
genoeg dat hij nooit de bodem van een bouwblok kan bereiken, en blijft
dus altijd zichtbaar. De lijst mag — anders dan de koptekst — nog wél een
keer wegscrollen bij een kort bouwblok; dat was niet het gemelde
probleem. `.flow-sidebar` zelf rekt via CSS Grid mee met `.flow-main`
(geen vaste 100vh-hoogte meer) zodat de lijst zo lang mogelijk zichtbaar
blijft. Geldt alleen boven de 900px-breakpoint; de mobiele variant
(`.flow-mobiel-voortgang`, zie het vorige punt hieronder) was al apart
opgelost en blijft ongewijzigd.

## 2026-09-21 — Rebuild op de aangeleverde `tokens.css`/`components.css`/`admin.css`/`charts.css`

## 2026-09-22 — Compacte voortgangsbalk onder de 900px-breakpoint

**Aanleiding**: op verzoek van Sander — tijdens het beantwoorden van
vragen op een smal scherm moet de voortgang altijd zichtbaar blijven.
Dit botst met de bestaande, expliciet vastgelegde afspraak in
`stylesheet.md`/`components.css` (v1-aanpassingen.md punt 11): de sticky
sidebar-fix geldt uitdrukkelijk alleen boven de 900px-breakpoint,
daaronder is `.flow-sidebar` bewust `position: static` en scrolt dus
mee weg — een volledige sticky sidebar past simpelweg niet naast de
inhoud op een telefoonbreedte.

**Doorgevoerd**: een nieuw, compact element (`.flow-mobiel-voortgang` in
components.css, component `components/MobielVoortgang.tsx`) met alleen de
voortgangsbalk + "X% — Y van Z vragen", dat ALLEEN onder 900px zichtbaar
is en daar altijd sticky blijft — niet als kind van `.flow-sidebar` (die
blijft ongewijzigd static/wegscrollend), maar als eigen element vóór
`.flow-layout`, zodat het sticky blijft over de volledige paginahoogte
(inclusief het scrollen door de vragen in `.flow-main`), niet alleen
binnen de sidebar zelf. Boven 900px ongewijzigd: de volledige sidebar is
daar al sticky, dus dit element blijft verborgen.

## 2026-09-22 — Test-modus: "Start assessment" ook bruikbaar op de landingspagina

**Aanleiding**: op verzoek van Sander — test-modus moest ook gelden voor
de "Start assessment"-knop op scherm 2 (assessment-landingspagina), die
normaal altijd disabled is omdat toegang uitsluitend via een door Coniche
aangemaakte uitnodiging loopt (zie de eerdere beslissing van 2026-09-17
hieronder, die voor de reguliere flow nog steeds geldt).

**Doorgevoerd**: staat test-modus aan (`lib/instellingen.ts`), dan is de
knop klikbaar en roept `lib/db.ts` → `vindOfMaakTestRespondent(assessmentId)`
aan: zoekt een bestaande testorganisatie+respondent voor dát
assessment-type (herkenbaar aan het vaste testklant-e-mailadres
`sander_hesselink@hotmail.com`), of maakt er één aan (organisatie
"TestConicheScan BV", lege kenmerken) als die nog niet bestaat. Voor de
Klantcontact Volwassenheidsscan is dit dezelfde testklant als de
seed-data; voor elk ander assessment-type (nu: AI-Volwassenheid) ontstaat
een eigen testorganisatie bij de eerste keer klikken. Navigeert daarna
naar de publieke-link-gate (`/scan/[respondentId]`), die vervolgens net
als bij een echte respondent doorstuurt naar intake/doorloop/resultaten
op basis van status — nogmaals klikken op "Start assessment" begint dus
niet opnieuw, maar hervat waar de testklant gebleven was.

## 2026-09-22 — Test-modus voor Beheer: inloggen overslaan, standaard aan

**Aanleiding**: op expliciet verzoek van Sander, om tijdens de bouw snel
Beheer in te kunnen en de vragenlijsten door te kunnen ontwikkelen zonder
elke keer in te loggen. Dit is een ANDER "test-modus"-concept dan de
schakelaar die op 2026-09-17 was toegevoegd en op 2026-09-21 weer is
verwijderd (die sloeg op het overslaan van de respondent-
e-mailverificatie, inmiddels vervangen door de "Publieke link"-flow
zonder verificatiescherm) — dit gaat over de admin-inlog uit
beheerpagina.md ("Login": e-mail + wachtwoord + 2FA, hier nog een
prototype-inlog).

**Doorgevoerd**: `lib/instellingen.ts` (opnieuw toegevoegd, zelfde
bestandsnaam als eerder maar andere inhoud) met een schakelaar, standaard
AAN. Staat hij aan, dan slaat `app/beheer/layout.tsx` de inlogcheck over
en is Beheer direct open. Schakelaar staat op het beheer-dashboard, samen
met een vaste testklant (organisatie "TestConicheScan BV", respondent
`sander_hesselink@hotmail.com`, status "uitgenodigd") die als seed-data in
`data/demo-organisatie.ts` staat, met een kopieerknop voor de publieke
link zodat de doorloopflow direct getest kan worden. Omdat de seed alleen
bij een lege localStorage wordt geschreven, is een browser die de scan al
eerder had geopend (bijv. tijdens eerder testen) niet automatisch
bijgewerkt — die testklant moet er dan handmatig bij, of localStorage
wissen.

Dit is uitdrukkelijk een tijdelijk bouwhulpmiddel, geen vervanger voor de
echte e-mail+wachtwoord+2FA-inlog uit beheerpagina.md — die blijft
de standaard zodra test-modus uitstaat.

## 2026-09-21 — Rebuild op de aangeleverde `tokens.css`/`components.css`/`admin.css`/`charts.css`

**Aanleiding**: Joost leverde een volledig statisch HTML/CSS/JS-ontwerp
aan (`index.html`, `designer-preview-homepage.html`, `css/`, `js/`,
`assets/`) dat stylesheet.md nu expliciet als de letterlijke, leidende
CSS-bron aanwijst ("Sander neemt deze bestanden letterlijk over, niet
herschrijven"). Tegelijk een grote update van CLAUDE.md,
beheerpagina.md en v1-aanpassingen.md.

**Doorgevoerd**:
- De 5 aangeleverde CSS-bestanden zijn 1-op-1 gekopieerd naar
  `app/styles/` en geïmporteerd in `app/globals.css` (na Tailwind). Alle
  nieuwe/herbouwde UI (nav, footer, sidebar, knoppen, badges, admin-
  schermen, resultatenscherm) gebruikt de letterlijke klassenamen
  daaruit (`.nav`, `.btn-or`, `.admin-table`, `.flow-sidebar`, ...) i.p.v.
  ad-hoc Tailwind-kleurutilities. Enige bewuste afwijking: `.field`/
  `input[type=text]` in components.css dekte geen `email`/`password`/
  `number`-velden — dat selector-bereik is lokaal verbreed (zelfde
  waarden, geen nieuw ontwerp) zodat login-/uitnodigingsformulieren
  bruikbaar blijven.
- Nav/footer/sidebar volledig herbouwd naar de nu vastgelegde specs:
  sticky nav, permanent wit, 3px oranje onderrand, vaste hoogte
  (`--nav-h`), logo 44px, `.nav-right`-patroon (acties → scheidingslijn
  → "← Terug naar site"). Footer zonder logo (nog open designpunt).
  Sidebar sticky met een eigen scrollgebied, geen eigen logo meer.
- Radiobutton-accentkleur volgt nu de categorie (`--accent`) i.p.v. vast
  oranje. Classificatiekleuren (rood/oranje/groen) volgen nu
  `--stat-red`/`--stat-amber`/`--stat-green` uit tokens.css — dit zijn
  ANDERE hex-waarden dan de eerder geïmplementeerde Tailwind
  red-600/orange-500/green-600.
- **Toegangsflow vervangen door de "2a. Tussenoplossing" uit
  v1-aanpassingen.md**: de eerder gebouwde e-mail+verificatiecode-flow
  (`lib/verificatie.ts`, `/uitnodiging/[respondentId]`) en de bijbehorende
  test-modus-schakelaar (`lib/instellingen.ts`) zijn verwijderd. Daarvoor
  in de plaats: een "Publieke link" (`/scan/[respondentId]`, opgebouwd in
  `lib/uitnodiging-link.ts`) die direct doorstuurt naar het scherm dat bij
  de status van de respondent hoort — geen verificatiescherm. De admin
  deelt deze link zelf (kopieerknop op de organisatie-detailpagina en op
  de scandetailpagina), er wordt niets automatisch gemaild. Reden om dit
  nu als DE actieve flow te bouwen i.p.v. ernaast: de aangeleverde
  mockup (`js/screens/admin/adminScanDetail.js`) implementeert uitsluitend
  dit publieke-link-patroon, zonder verificatiescherm. De volledige
  e-mail+code-verificatie (v1-aanpassingen.md punt 2, nog niet afgevinkt)
  is dus niet geschrapt als toekomstig doel, alleen niet meer de actieve
  bouw — bij oppakken: git-historie vóór dit commit (`lib/verificatie.ts`,
  `app/uitnodiging/[respondentId]/`) als startpunt.
- `lib/mailer.ts`/`lib/gmail.ts`/`app/api/mail/route.ts` (Gmail-integratie)
  zijn UIT gebruik gehaald (nieuw uitnodigen toont alleen nog de publieke
  link, mailt niet automatisch — expliciet zo gevraagd in punt 2a) maar
  bewust niet verwijderd: herbruikbaar zodra de volledige verificatieflow
  hierboven weer wordt opgepakt.
- Respondent-datamodel: `naam` is nu `string | null` (leeg tot de intake
  is ingevuld, met e-mailadres als fallback in admin-lijsten — zie
  CLAUDE.md sectie 1). Nieuw veld `uitgenodigdOp` toegevoegd, los van
  `gestartOp` (dat nu `string | null` is en pas gezet wordt zodra de
  respondent scherm 4 indient) — nodig omdat de cascade-regels in
  beheerpagina.md `gestartOp` bij een reset laten wissen terwijl de
  uitnodigingsdatum moet blijven staan, en dat kon niet allebei op
  hetzelfde veld.
- Admin herbouwd naar de 3-schermen-plus-tabel-structuur uit
  beheerpagina.md: `/beheer/organisaties` (lijst, was voorheen
  `/beheer/scans`), `/beheer/organisaties/nieuw`, `/beheer/organisaties/
  [id]` (detail, was voorheen `/beheer/scans/[organisatieId]`), en
  `/beheer/scans` is nu de platte "Ingevulde scans"-tabel over alle
  organisaties heen (Organisatie-kolom, sorteerbare kolommen,
  bulk-selectie/verwijderen, exportknop als stub) met een aparte
  scandetailpagina op `/beheer/scans/[respondentId]`. De admin-navigatie
  is vervangen door de gedeelde publieke nav/footer met "Beheer"-badge en
  admin-links (was een losse linker-sidebar) — zie stylesheet.md/
  beheerpagina.md "Admin hergebruikt de publieke nav/footer".
- Verwijder-cascades geïmplementeerd volgens beheerpagina.md:
  "Ingevulde scans" verwijderen = reset (status → "uitgenodigd", data
  gewist, naam/rol/team/notities blijven staan), "Respondenten"
  verwijderen = harde verwijdering (vanuit Organisatie-detail), Organisatie
  verwijderen cascadeert naar al haar respondenten. Bevestigingsteksten
  letterlijk overgenomen uit de aangeleverde mockup.

## 2026-09-17 — Test-modus: verificatie overslaan, instelbaar in beheer

**Aanleiding**: Sander kreeg "Ongeldige link" bij het openen van een
uitnodigingslink in zijn eigen browser (Chrome/Safari), en wilde een
snelle manier om de vragenlijst te testen zonder steeds de volledige
e-mail+code-verificatie te doorlopen.

**Root cause van de "Ongeldige link"**: er is nog geen gedeelde backend
(zie CLAUDE.md/BACKLOG.md — expliciet toekomstwerk). Organisaties en
respondenten leven alleen in de localStorage van de browser waarin de
scan is aangemaakt (het beheerscherm). Een respondent die de link in een
ANDERE browser opent (bijv. vanuit zijn eigen e-mailclient) heeft daar
geen lokale data, dus "Ongeldige link" is in die zin correct gedrag,
geen bug — maar wel een echt probleem zodra respondenten de link
daadwerkelijk per e-mail ontvangen.

**Doorgevoerd (twee aanvullende oplossingen)**:
1. De uitnodigingslink draagt sindsdien de organisatie- en
   respondentgegevens zelf mee (`lib/uitnodiging-link.ts`,
   `lib/db.ts` → `importRespondent`), zodat elke browser die de link
   opent zichzelf kan "bootstrappen" — ook zonder gedeelde backend werkt
   de link dan in een willekeurige browser.
2. Op expliciet verzoek van Sander: een **test-modus**, instelbaar via
   een schakelaar op het beheer-dashboard (`lib/instellingen.ts`). Staat
   deze aan, dan mogen de intake/doorloop/resultaten-pagina's rechtstreeks
   geopend worden zonder verificatie — bedoeld om snel de vragenlijst te
   kunnen doorlopen tijdens het testen. In de scan-detailpagina
   verschijnt dan per respondent een "Kopieer testlink"-knop naast de
   normale uitnodigingslink. Staat de test-modus uit, dan is dit gedrag
   identiek aan de normale (beveiligde) flow.

Dit is uitdrukkelijk een tijdelijk hulpmiddel voor vandaag, geen vervanger
voor de e-mail+code-verificatie uit v1-aanpassingen.md punt 2 — die blijft
de standaard zodra test-modus uitstaat.

## 2026-09-17 — "Start assessment"-knop op scherm 2 is niet-klikbaar

**Aanleiding**: CLAUDE.md sectie 5 (bijgewerkt) vraagt om een primaire
"Start assessment"-knop op de assessment-landingspagina die rechtstreeks
naar scherm 4 (Respondent-intake) gaat. Dat botst met
v1-aanpassingen.md punt 2: toegang loopt uitsluitend via een
persoonlijke, niet-herleidbare uitnodigingslink per respondent plus
e-mailverificatie — er bestaat geen generieke `/intake`-route zonder
een specifieke `respondentId`. Een knop die daar rechtstreeks naartoe
zou moeten linken, kan dus niet functioneren zonder de toegangsbeveiliging
te omzeilen.

**Besluit (Sander, gekozen optie 2 van 3 voorgelegde opties)**: de
"Start assessment"-knop staat er wél, op dezelfde plek als in de
oorspronkelijke screenshots (direct onder de hero, naast/boven de
aparte "Bekijk wat je krijgt"-knop naar scherm 3), maar is een
niet-klikbare/disabled knop. Een tooltip/title legt uit dat toegang via
een persoonlijke uitnodiging verloopt. Geen echte navigatie naar intake
vanaf dit scherm.

Zie ook: CLAUDE.md sectie 5, v1-aanpassingen.md punt 2 en 7.
