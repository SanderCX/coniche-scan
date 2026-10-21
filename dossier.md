# Coniche Scan: Dossier

Spec voor het Dossier van een Organisatie: Een lijst Nieuws en Cases die een Consultant samenstelt, en die hij open kan zetten voor de Lead van de Organisatie. Het Dossier vervangt de lijst Nieuws bij de Kenmerken.

**Status: Voorstel van 20 oktober 2026, gebouwd op 21 oktober 2026 (zie Zo gebouwd).** Joost heeft de richting en het ontwerp goedgekeurd (Claude Design, "Coniche Scan Dossier", versie 15, borden 1, 3, 5 en 6). Het ontwerp is dus de bron voor de opmaak, deze spec voor het gedrag. Wat in een ander document staat en hier wordt aangepast, staat onder Aanpassingen in andere documenten.

## Doel

Een Consultant wil bij een Organisatie bewaren wat hij tijdens een traject tegenkomt: Nieuws over de Organisatie en cases uit andere trajecten. Een deel daarvan wil hij laten zien aan de Lead, met uitleg waarom het bij de Organisatie past. Het Dossier is primair een hulpmiddel voor de Consultant. De Lead ziet alleen wat de Consultant bewust openzet.

## Wat in versie 1 zit

- Twee soorten items: Nieuws en Case.
- Het Dossier hangt aan de Organisatie. Een Dossier per Meting of per Onderdeel komt later.
- Een item kan gekoppeld worden aan bouwblokken van de Klantcontact Volwassenheidsscan. Op de pagina van de Lead filtert de radar op die koppeling.
- Eén schakelaar op de Organisatie ("Open voor Lead") en per item een schakelaar "Zichtbaar voor klant". Beide staan standaard uit.
- Een nieuwe Afspraak "Mag als case gebruikt worden" bij de Organisatie die in een Case voorkomt.

Wat er niet in zit, met een reden: Een gedeelde bibliotheek van items die over Organisaties heen wordt hergebruikt, een systeemvoorstel op basis van scores, koppeling aan één bepaald bouwblok vanuit de resultaatpagina, andere soorten items (whitepaper, werkwijze, tool) en andere Assessments dan de Klantcontact Volwassenheidsscan. De eerste versie moet eenvoudig zijn, en de bibliotheek vraagt om herbruikbare items waar nog geen beheerscherm voor is. De ontwerpen daarvoor staan als v2 in hetzelfde ontwerpbestand.

## Datamodel

Het veld `Organisatie.nieuwsartikelen` vervalt (zie Overgang). In plaats daarvan krijgt `Organisatie` het veld `dossier`. De velden staan ook in `datamodel.md`, Dossieritem.

```
Organisatie.dossier {
  openVoorLead: boolean             // standaard false
  openSinds: datetime | null        // het moment waarop openVoorLead voor het laatst aan ging
  gewijzigdOp: datetime | null      // laatste wijziging in wat een Lead ziet
  items: Dossieritem[]
}

Dossieritem {
  id: string
  soort: "nieuws" | "case"          // staat vast na het aanmaken
  titel: string                     // verplicht, getrimd, maximaal 200 tekens
  toelichting: string               // maximaal 400 tekens, mag leeg zijn, zie Toelichting
  zichtbaarVoorLead: boolean        // standaard false
  bouwblokIds: string[]             // Bouwblok.id, zie Koppeling aan bouwblokken, mag leeg zijn
  url: string                       // Nieuws: verplicht. Case: optioneel. Altijd http of https
  aangemaaktOp: datetime
  gewijzigdOp: datetime

  // alleen bij soort "nieuws"
  bron: string                      // de publicatie of de site, maximaal 80 tekens
  gepubliceerdOp: date | ""         // jjjj-mm-dd, leeg als het onbekend is

  // alleen bij soort "case"
  samenvatting: string              // verplicht, maximaal 600 tekens
  caseOrganisatieId: string | null  // de Organisatie waar de case over gaat, verplicht bij opslaan
  omvang: string                    // vrije tekst, maximaal 40 tekens, bijvoorbeeld "800 medewerkers"
  totResultaat: string              // vrije tekst, maximaal 40 tekens, bijvoorbeeld "6 weken"
}
```

`Organisatie.caseToegestaan` (boolean, standaard false) is de Afspraak "Mag als case gebruikt worden". Hij staat naast `benchmarkToegestaan` en `antwoordenMetNamen` (`datamodel.md`, deel 3).

`OrganisatieLid` krijgt `dossierGezienOp: datetime | null`, gezet op het moment dat de Lead de Dossierpagina opent. De tag "Nieuw" op de kaart volgt daaruit (zie Mijn metingen).

### Regels

- **Toelichting.** Voor een Nieuwsitem de reden waarom het artikel relevant is. Voor een Case het blok "Waarom dit voor jullie telt". De Lead leest deze tekst, dus onder het veld staat een korte hint ("De Lead leest deze tekst als je het item openzet.").
- **Titel, samenvatting en toelichting van een Case bevatten geen naam van de Organisatie in de case.** De Lead ziet die naam nergens, en een naam in een vrij tekstveld lekt dat. Onder de velden staat de waarschuwing "Noem de organisatie niet bij naam."
- **Adres.** Alleen `http` en `https`, met een punt in de domeinnaam. Een adres met een ander schema, zoals `javascript:`, wordt geweigerd. Zonder schema wordt `https://` voorgezet. Links openen in een nieuw tabblad met `rel="noopener noreferrer"`. Dit zijn de regels die voor nieuwsartikelen al golden.
- **Branche van een Case.** Is niet te bewerken. Het is de korte naam van de Sector uit de Kenmerken van `caseOrganisatieId` (`sbi-indeling.md`). Heeft die Organisatie geen Sector, dan kan de Case niet op Zichtbaar voor klant, en staat in het formulier "Vul de Sector in bij de Kenmerken van {Organisatie}."
- **Omvang en Tot resultaat.** Beide optioneel. Een leeg veld laat zijn tegel op de pagina van de Lead weg.
- **Een Case verwijst niet naar de eigen Organisatie.** `caseOrganisatieId` mag niet gelijk zijn aan de Organisatie van het Dossier.
- **Welke Organisaties je kunt kiezen.** In het veld "Organisatie in de case" staan de Organisaties met `caseToegestaan` aan, en de Organisaties waar de Consultant toegang toe heeft (die zonder toestemming met de aanduiding "Geen toestemming"). Een Consultant ziet zo geen namen van Organisaties waar hij niets mee te maken heeft en die niets hebben afgesproken.
- **Volgorde.** Cases met de nieuwste bovenaan op `aangemaaktOp`. Nieuws met het nieuwste bovenaan op publicatiedatum, en zonder datum op `aangemaaktOp`, zoals nu.

### Wat de Lead ziet

Een Lead ziet een item alleen als alle drie gelden:

1. `Organisatie.dossier.openVoorLead` staat aan.
2. `Dossieritem.zichtbaarVoorLead` staat aan.
3. Bij een Case: `caseToegestaan` van `caseOrganisatieId` staat aan.

Dit wordt aan de serverkant bepaald, bij elke keer laden. De Lead krijgt `caseOrganisatieId` en de naam van die Organisatie nooit in de gegevens die naar de browser gaan, alleen de branche. Wordt de Afspraak later uitgezet, dan verdwijnt de Case bij de eerstvolgende keer laden voor de Lead, en blijft hij bij de Consultant staan met de status "Toestemming ontbreekt". Het Dossier is voor een Lead geen cijfer uit een andere Organisatie: Er staan geen scores van de Organisatie in de Case.

### Verwijderen en datakoppelingen

- **Item verwijderen.** Een eigen verwijderactie per item, met bevestiging.
- **Organisatie verwijderen.** Het Dossier gaat mee.
- **Organisatie verwijderen die in een Case voorkomt.** De bevestiging noemt het aantal Cases bij andere Organisaties dat naar haar verwijst. Die Cases krijgen `caseOrganisatieId: null`, `zichtbaarVoorLead: false` en de status "Kies een organisatie".
- **Bouwblok gearchiveerd.** De koppeling blijft staan. De chip toont de naam van het bouwblok, maar het bouwblok krijgt geen knooppunt in de radar en filtert dus niet.

### Overgang

Bij het laden van data van vóór deze spec worden de bestaande `nieuwsartikelen` omgezet naar Dossieritems: `soort: "nieuws"`, `titel`, `url`, `bron` en `gepubliceerdOp` blijven gelijk, `notitie` wordt `toelichting`, `zichtbaarVoorLead: false`, `bouwblokIds: []`. `dossier.openVoorLead` is `false`. Geen enkel bestaand artikel wordt dus zichtbaar voor een Lead. `caseToegestaan` is `false` voor alle bestaande Organisaties. De gebeurtenissen `nieuwsartikel.*` in de audit-log blijven leesbaar.

### Koppeling aan bouwblokken

Een item verwijst naar bouwblokken met `Bouwblok.id`. In versie 1 zijn dat de 15 bouwblokken van de Klantcontact Volwassenheidsscan (`content-klantcontact-volwassenheid.md`). Bouwblokken van andere Assessments zijn niet te kiezen. Het veld is optioneel. Een item zonder bouwblokken staat in de lijst op de pagina van de Lead, krijgt geen chip en komt alleen bij "Alle items" in beeld.

## Rechten

| Permissie | Admin | Consultant | Lead | Respondent |
|---|---|---|---|---|
| `dossier.bewerken` (items aanmaken, wijzigen en verwijderen, Zichtbaar voor klant, Open voor Lead) | alle | eigen | - | - |
| `dossier.inzien` | alle | eigen | alleen wat openstaat (zie Wat de Lead ziet), van de eigen Organisatie | - |

- **De Afspraak blijft bij een Admin.** `caseToegestaan` zet alleen een Admin, in de kaart Afspraken, net als de andere twee. Een Consultant ziet de kaart Afspraken niet. In het formulier van een Case staat voor een Consultant daarom bij ontbrekende toestemming de tekst "Vraag een Admin om 'Mag als case gebruikt worden' aan te zetten", en voor een Admin de knop "Naar Afspraken". Het ontwerp toont de knop voor beide rollen.
- **Bewerkslot.** Het Bewerkslot van de Organisatie geldt voor het hele Dossier, zoals bij de Kenmerken.
- **Contactpersonen.** `contactpersonen.bewerken` blijft zoals het is (alleen een Admin). Het gaat nu alleen nog over Contactpersonen.
- **Een Lead kan niets wijzigen.** Er is geen reactie-, opslaan- of deelknop.

## Scherm 1: Organisatie-detail, kaart Dossier (Consultant en Admin)

Ontwerp: Bord 1. De kaart staat onder de Kenmerken en onder de rij Toegang en Afspraken (als die er is), en boven de kaart KPI's. Contactpersonen blijft in de kaart Kenmerken staan, ongewijzigd. De lijst Nieuws in die kaart vervalt.

- **Kop.** De titel "Dossier" (16px, gewicht 700) met een Info-icoon (`info.dossier`). Rechts de schakelaar "Open voor Lead" (met label "Niet gedeeld" als hij uit staat) en de knop "+ Toevoegen" (`.btn-or`, `.btn-compact`).
- **Open voor Lead aanzetten.** Vraagt een bevestiging: "Het Dossier wordt zichtbaar voor de Leads van {Organisatie}. Ze zien {n} items." Bij n gelijk aan 0 staat daar "Er staan nog geen items op Zichtbaar voor klant." Uitzetten kan zonder bevestiging.
- **Filter.** Een pil-groep `.pil-groep` met Alles, Cases en Nieuws, elk met het aantal erachter. De gekozen pil is massief oranje.
- **Rijen.** Zoals de kaart van een Lead (`visualisatie-mijn-metingen.md`): Een cirkel van 48px (Case in `--or-faint` met oranje icoon, Nieuws in `--bl-faint` met blauw icoon), de eyebrow CASE (`--or`) of NIEUWS (`--bl`) in 12px hoofdletters, de titel in 18px gewicht 800, een regel in 14px `--ink-s`, de toelichting in 14px `--ink-m`, rechts een statusbadge en de knop "Bewerken" (`.btn-outline`).
  - Regel bij een Case: "{Organisatie in de case}, {branche in kleine letters}, ongeveer {omvang}, resultaat in {tot resultaat}". Een leeg veld valt weg. De Consultant ziet hier de naam van de Organisatie, de Lead niet.
  - Regel bij Nieuws: "{bron}, {datum}", zoals nu.
- **Statusbadge.** Eén van drie, in de kleuren van de bestaande statuschips: "Zichtbaar voor klant" (groen), "Intern" (grijs) en "Toestemming ontbreekt" (oranje, voor een Case waarvan de Organisatie `caseToegestaan` uit heeft, ook als het item op Zichtbaar voor klant stond). "Kies een organisatie" (oranje) bij een Case zonder `caseOrganisatieId`.
- **Leeg.** "Er staan nog geen items in het Dossier."

## Scherm 3: Item toevoegen of bewerken

Ontwerp: Bord 3. Een modal van 640px breed, over een gedimde pagina. Titel "Item toevoegen aan het Dossier" (bij Bewerken "Item bewerken"). Onderin "Annuleren" en "Opslaan"; bij Bewerken staat links "Verwijderen" (`.btn-danger`) dat om een bevestiging vraagt (`BevestigModal`).

- **Soort.** Een pil-groep met Nieuws en Case. Bij Bewerken staat de soort vast (de pil-groep is dan alleen-lezen).
- **Nieuws.** Titel (verplicht), Link (verplicht), Bron, Datum en Toelichting. In de toelichting staat de hint voor de Lead.
- **Case.** Titel (verplicht), Samenvatting (verplicht), Organisatie in de case (verplicht), Branche (alleen-lezen, met de hint "Uit de kenmerken van de organisatie."), Omvang, Tot resultaat, Link naar de volledige case (optioneel) en Toelichting.
  - Onder het veld Organisatie staat een groen paneel "Toestemming staat vastgelegd bij de Afspraken van {Organisatie}." of een oranje paneel met de uitleg en de knop of tekst uit Rechten.
- **Gaat over bouwblokken.** Optioneel, onder de soortvelden. Alle 15 bouwblokken staan als chips in de volgorde van de nummers: Een cirkel van 22px met het nummer in de categoriekleur (bij Fundament `--ink` op geel) en de naam. Een gekozen chip heeft een oranje rand en de achtergrond `--or-faint`. Meerdere keuzes mogelijk. Onder de chips: "De Lead ziet de gekozen bouwblokken bij het item en kan in de radar op deze bouwblokken filteren."
- **Zichtbaar voor klant.** Een schakelaar onder een scheidingslijn, uit bij een nieuw item. Label "Alleen intern" of "Zichtbaar voor klant" met eronder een regel: "Alleen jij en je collega-consultants zien dit item." of "De Lead ziet dit item zodra het Dossier open staat." Bij een Case zonder toestemming is de schakelaar uitgeschakeld (opacity 50%) met de regel "Zonder toestemming van de organisatie in de case kan een case niet open."
- **Opslaan.** Een fout staat boven de knoppen in een `.overzicht-melding`, bijvoorbeeld "Dit is geen geldig webadres." of "Kies de organisatie in de case." Het Bewerkslot geldt zolang de modal open staat.

## Scherm 4: Mijn metingen, kaart Dossier (Lead)

Ontwerp: Bord 6 (de gekozen optie A). Bord 7 laat de afgewezen optie zien, met losse secties Cases en Nieuws, en vervalt uit het ontwerp zodra de bouw is gestart.

- **Plek.** Een eigen sectie "Dossier, 1" onder Vergelijkingen. Is er geen sectie Vergelijkingen, dan onder Metingen. De sectie staat er alleen als `openVoorLead` aan staat en er minstens één item zichtbaar is. Het Dossier is dus één kaart in het overzicht, en de losse Cases en Nieuwsberichten staan er niet.
- **Kaart.** Zoals de benchmarkkaart (`visualisatie-mijn-metingen.md`, Benchmarkkaart): Volle breedte, achtergrond `--bg-warm`, links een rond icoon van 48px in `--or-faint` met een oranje mapje. Daarnaast de eyebrow "Dossier" (12px, hoofdletters, `--or`), eventueel de tag "Nieuw" (blauw), de titel "Dossier {Organisatie}" (18px, gewicht 800) en de regel "Gedeeld door je consultant op {openSinds}" (14px, `--ink-s`).
- **Voorproef.** Onder de regel maximaal drie chips met de titels van items: Eerst de Cases, daarna het Nieuws, een stip in oranje of blauw ervoor. Zijn er meer, dan staat er "+ n meer" achter. Daaronder in 13px: "2 cases · 2 nieuwsberichten".
- **Knop.** "Bekijk dossier" (hoofdactie), even breed als "Bekijk vergelijking" op de benchmarkkaart. Dat is 184px in het ontwerp; zie Open punten voor de regel over knopbreedte.
- **Tag "Nieuw".** Staat er zolang `OrganisatieLid.dossierGezienOp` leeg is of vóór `dossier.gewijzigdOp` ligt.

## Scherm 5: Dossier lezen (Lead)

Ontwerp: Bord 5. Een pagina van de Lead bij de persoonlijke link (voorstel voor de route: `app/s/[code]/dossier/page.tsx`). De nav is die van de Lead, met "← Terug naar Mijn metingen". Opent de Lead de pagina, dan wordt `dossierGezienOp` gezet.

Een animatie van de radar met filter staat in de Help (`help.md`, Films, Het dossier lezen; ontwerp `Film-Dossier`). Dezelfde film staat sinds 21 oktober 2026 ook op de Assessment-pagina, in de sectie "Wat krijg ik" (`CLAUDE.md`, sectie 3, scherm 2).

Van boven naar beneden:

1. **Kop.** Achtergrond `--or-faint` met concentrische cirkels in `--or-mid` rechts. Er is geen paars in de kop (de kop lijkt anders te veel op een andere Coniche-site). Eyebrow "Dossier" (`--or`, donkerder variant `#c2570c` voor tekst), titel "Dossier {Organisatie}" (32px), een zin ("Je consultant heeft cases en nieuws verzameld die passen bij jullie situatie, met bij elk item uitleg waarom. Bij elk item staat het bouwblok waar het over gaat."), twee chips ("Gedeeld door je consultant", de datum van `openSinds`) en rechts twee tegels met het aantal Cases en het aantal Nieuwsberichten.
2. **Waar dit dossier over gaat.** Een kaart (10px radius, `--bg-warm`, padding 32px) met links de radar en rechts een lijst met bouwblokken. Alleen aanwezig als minstens één zichtbaar item bouwblokken heeft. Zie Radar met filter.
3. **Filterbalk.** Alleen als er een filter staat: Een balk in `--or-faint` met het bouwblok (cirkel met nummer, naam, "n items in dit dossier") en rechts de knop "Alle items tonen ×" (`.btn-outline`, 32px hoog).
4. **Cases.** Een kop met oranje icoon, "Cases" (24px, gewicht 800) en de regel "Zo hebben andere organisaties het aangepakt". Per Case een kaart (`.case`): Links een oranje blok van 168px met de branche (32px, gewicht 800) en het label "Branche". Rechts de badge "Case", de titel (24px), de samenvatting (16px, `--ink-m`), de tegels Omvang en Tot resultaat, het blok "Waarom dit voor jullie telt" (alleen met toelichting, achtergrond `--or-faint`, rand `--or-mid`), en onderaan "Gaat over" met de chips en de knop "Lees de case" (alleen met link). De naam van de Organisatie in de case staat er nergens.
5. **Nieuws.** Een kop met blauw icoon, "Nieuws" en de regel "Wat er speelt rond jullie organisatie". Per item een rij (`.nieuws`): Links een datumtegel van 64px in `--bl-faint` (maand en dag; zonder datum een nieuwsicoon), de titel als link, de bron, de toelichting, de chips "Gaat over", rechts de knop "Lees artikel ↗" (`.btn-outline`, 36px).
6. **Slotregel.** "Vragen over dit dossier? Je consultant helpt je graag verder."

Een sectie zonder items (door het filter of omdat er geen zijn) valt weg, met de kop.

### Radar met filter

De radar is dezelfde component als op het resultaatscherm (`stylesheet.md`, Radar en staafdiagram op het resultaatscherm), in een filtermodus. Alles uit die spec geldt (knooppunten van 26px met alleen het nummer, taartpunten per categorie, ringen op 2,5 en 3,5), met deze verschillen:

- **Actieve knooppunten.** Alleen bouwblokken met minstens één zichtbaar item zijn actief. Een actief knooppunt is gevuld in de categoriekleur (nummer wit, bij Fundament `--ink`) en is een knop. De andere knooppunten staan op 40% dekking, zijn niet klikbaar en hebben alleen de tooltip.
- **Klik.** Een klik op een actief knooppunt filtert de lijsten Cases en Nieuws op dat bouwblok. Een tweede klik op hetzelfde knooppunt heft het filter op. Er is één bouwblok tegelijk te kiezen.
- **Gekozen bouwblok.** Het knooppunt krijgt een witte ring en daaromheen een ring van 2px in de categoriekleur. De taartpunt van het bouwblok krijgt 50% dekking (de andere punten houden hun dekking).
- **Dezelfde klik elders.** Een rij in de lijst rechts van de radar, en een chip bij een item, doen hetzelfde als het knooppunt. Er is maar één filter, bewaard in de URL (`?bouwblok=…`) zodat de terugknop van de browser werkt.
- **Score.** De polygoon en de score-stippen volgen de Meting waarvan de Lead de Resultaten mag zien (zie hieronder). Een stip van 10px met een witte rand van 2px in `--or` komt alleen bij de actieve bouwblokken.
- **Legenda onder de radar.** "Organisatie {naam}" met de oranje lijn en "Grenzen 2,5 en 3,5" met de stippellijn, in het formaat van de legenda in `stylesheet.md`.
- **Tooltip.** Zoals de tooltip van de radar: Eerste regel nummer en naam, tweede regel getal en klasse.
- **Toetsenbord.** Tab loopt langs de actieve knooppunten. Enter of spatie filtert. `aria-pressed` staat op het gekozen knooppunt.

**Welke scores.** De radar toont de groepsscore per bouwblok van de meest recente Meting (op meetdatum) van de Klantcontact Volwassenheidsscan van deze Organisatie waarvan de Lead de Resultaten mag inzien (`resultaten.inzien`, de aangevinkte weergave Resultaten). Is er zo'n Meting niet, dan staat de radar zonder polygoon, zonder stippen en zonder scores en klassen in de tooltip en de lijst. Het Dossier lekt dus geen scores die de Lead niet mag zien.

**Lijst rechts van de radar.** Per actief bouwblok een knop: De cirkel met het nummer (22px, categoriekleur), de naam in 14px gewicht 700, daaronder "{categorie} · {score} · {klasse}" in 12px `--ink-s`, en rechts "{n} item" of "{n} items" in een grijs label. De gekozen rij heeft een oranje rand en de achtergrond `--or-faint`.

**Chips.** Bij een item staan achter "Gaat over" (12px, hoofdletters, `--ink-s`) de bouwblokken als chips: De cirkel met het nummer en de naam, 13px gewicht 600, rand 1px `--border`, afgerond. Een klik filtert.

## Audit

Nieuwe gebeurtenissen (`datamodel.md`, Audit), in plaats van `nieuwsartikel.*`:

- `dossier.itemToegevoegd`, `dossier.itemGewijzigd` en `dossier.itemVerwijderd`. `details` bevat de Organisatie, de soort, de titel, en bij `itemGewijzigd` de namen van de gewijzigde velden. Bij een Case staat ook de naam van de Organisatie in de case erin (de log is alleen voor een Admin).
- `dossier.geopend` en `dossier.gesloten`: `openVoorLead` is aan of uit gezet, met de Organisatie en het aantal zichtbare items.
- `organisatie.caseVlagGewijzigd`: `caseToegestaan` is gewijzigd, met de Organisatie en de nieuwe waarde.

## Exports

Het Dossier staat niet in de exports (`export-csv.md`, `export-indesign.md`, `export-pdf-visual-*.md`) en niet in de import (`import-scans.md`).

## Info-teksten

Nieuw (`beheerpagina.md`, Info-iconen):

- `info.dossier`: "Cases en nieuws die je bij deze organisatie bewaart. Alleen jij en je collega-consultants zien ze. De Lead ziet een item pas als het Dossier open staat én het item op Zichtbaar voor klant staat. Een case kan alleen open als de organisatie in de case dat heeft toegestaan."
- `info.caseVlag`: "Zet dit pas aan nadat dit met de organisatie is afgesproken, bijvoorbeeld via contract of mail. Dan mag een consultant deze organisatie als case laten zien aan de lead van een andere organisatie. De lead ziet de branche en de omvang, nooit de naam. Uitzetten haalt de cases met deze organisatie meteen weg bij de leads."

`info.nieuwsartikelen` vervalt.

## Zo gebouwd (21 oktober 2026)

- **Bestanden.** De regels en de pure functies staan in `lib/dossier.ts` (controle van de invoer, status, volgorde, `leadDossier`, `isNieuwVoorLead`, de overgang van de nieuwsartikelen en `ruimDossierOp`), de opslag in `lib/db/dossier.ts` (items, Open voor Lead, de Afspraak en `markeerDossierGezien`), de radar-gegevens van de Lead in `lib/dossier-radar.ts`. De kaart en het formulier zijn `components/beheer/DossierKaart.tsx`, de Afspraak is `components/beheer/CaseVlag.tsx`, de kaart op Mijn metingen is `DossierKaart` in `components/mijn-metingen/MijnMetingenOnderdelen.tsx` en de Dossierpagina is `app/s/[code]/dossier/page.tsx`. De opmaak staat in `app/styles/dossier.css` (de pagina van de Lead) en `admin.css` (`.dos-*`, de beheerkant). Rechten: `magDossierBewerken` (de eigen Organisaties voor een Consultant) en `magCaseVlagZetten` (alleen een Admin). Tests: `lib/dossier.test.ts` en de filtermodus in `lib/radar.test.tsx`.
- **De lijst Nieuws bij de Kenmerken is weg.** `Organisatie.nieuwsartikelen` bestaat niet meer: Bij het laden wordt elk artikel een Dossieritem (Overgang), en het oude veld valt weg. De bestanden `contacten-nieuws` heten nu `contactpersonen`, het helponderwerp `contactpersonen-en-nieuws` is `contactpersonen`.
- **Wat een Lead ziet, wordt in het prototype in de browser bepaald.** `leadDossier` geeft een eigen vorm terug zonder `caseOrganisatieId` en zonder naam, zodat de schermen van de Lead die gegevens niet kunnen tonen. De data zelf staat in de browser, dus echt afschermen kan pas met de database ("aan de serverkant").
- **Een Case zonder branche is voor een Lead onzichtbaar.** Heeft de Organisatie in de case geen Sector meer (bijvoorbeeld na een wijziging nadat het item openstond), dan laat `leadDossier` de Case weg. De spec zegt alleen dat zo'n Case niet open kan.
- **De status "Toestemming ontbreekt"** staat bij elke Case waarvan de Organisatie de Afspraak niet heeft, ook als het item op Intern staat. De spec noemt dit expliciet bij een item dat op Zichtbaar voor klant stond.
- **Het item bewerken met een verlopen toestemming.** Een Case die al open stond, kan bewerkt worden zonder dat de toestemming klopt en houdt zijn stand. Nieuw openzetten kan alleen met toestemming en een Sector.
- **De tag "Nieuw"** staat er zolang `dossierGezienOp` leeg is of vóór de laatste van `openSinds` en `gewijzigdOp` ligt. `gewijzigdOp` verandert alleen bij een wijziging in wat een Lead kan zien (een item dat zichtbaar was of wordt), bij het openzetten, en als de Afspraak van een Organisatie in een zichtbare Case verandert.
- **Schakelaars zijn vinkjes.** "Open voor Lead" en "Zichtbaar voor klant" zijn, zoals de andere schakelaars in beheer (`BenchmarkVlag`), een vinkje met een label en geen schuifknop.
- **Letterschaal.** De chips (13px in het ontwerp), de tag "Nieuw" en de regel met aantallen (11 en 13px) staan op 12px, want de letterschaal kent geen andere maten (`stylesheet.md`, Lettergroottes).
- **De waarschuwing "Noem de organisatie niet bij naam."** staat één keer, onder Samenvatting, in plaats van bij elk veld.
- **"Naar Afspraken".** Voor een Admin sluit de knop het formulier en scrolt naar de kaart Afspraken. Een Consultant ziet de tekst "Vraag een Admin om 'Mag als case gebruikt worden' aan te zetten".
- **De kop van de Dossierpagina** heeft de concentrische cirkels als `repeating-radial-gradient` in `--or-mid` en geen paars. Een lange branche (meer dan 14 tekens, de korte naam van een Sector) staat in het oranje blok op 24px in plaats van 32px, anders past ze niet in 168px.
- **Zonder toegang.** Een Lead zonder open Dossier, of een Respondent zonder Lead-rol, ziet op de Dossierpagina "Geen dossier".
- **De filter in de URL** (`?bouwblok=`) gebruikt `router.push`, zodat de terugknop van de browser de vorige stand terugzet. Een bouwblok dat niet actief is, wordt genegeerd.
- **Nog niet gebouwd.** De ontwerpen voor de latere versie (bibliotheek, systeemvoorstel) en bord 7 (de afgewezen optie, dat uit het ontwerp vervalt) hebben geen code nodig.

## Open punten

- **Knopbreedte.** `visualisatie-mijn-metingen.md` zegt dat een enkele knop zo breed is als zijn tekst, en 232px bij twee knoppen. Joost wil dat "Bekijk dossier" even breed is als "Bekijk vergelijking". Voorstel: Eén vaste breedte voor de knop op de kaarten Benchmark en Dossier (184px in het ontwerp) en de regel in `visualisatie-mijn-metingen.md` daarop aanpassen. De Meting-kaart houdt zijn eigen regel.
- **Dossier per Meting of Onderdeel.** Bij een grote Organisatie met meerdere Onderdelen en Metingen is één Dossier op de Organisatie misschien te grof. Dat komt pas aan bod na gebruik.
- **Volgorde door de Consultant.** In versie 1 is de volgorde vast (nieuwste bovenaan). Handmatig ordenen is een latere vraag.
- **Branche ontbreekt.** Een Case-Organisatie zonder Sector blokkeert openzetten. Misschien is een handmatig veld Branche in de Case beter. Eerst zien hoe vaak het voorkomt.
- **Toestemming vastleggen.** De Afspraak legt vast dát er is afgesproken, niet wanneer of met wie. Een tekstveld daarvoor is niet nodig zolang contract of mail de bron blijft.
