# Coniche Scan: Datamodel

Enige bron voor het datamodel.

- **Deel 1: Content en gegevens.** Content, organisatie, respondent, meting, ingevulde
  scan, toegangscode, organisatievelden, en de regels voor verwijderen.
- **Deel 2: Benchmark.** Het gedrag staat in `benchmark.md`, hier alleen de records en de
  uitbreiding op Organisatie.

Rollen, rechten, inlog en audit staan in `datamodel-rollen.md`. Termen (Meting, Respondent, Ingevulde scan) staan in CLAUDE.md onder
Terminologie.

---

## Deel 1: Content en gegevens

### Assessment (scan-type)

Er zijn meerdere scan-types (Klantcontact Volwassenheid, AI-volwassenheid,
later een Zorg-variant en een Adoptiescan). De intake- en doorloopflow
navigeert generiek door een `Assessment`-object heen.

```
Assessment {
  id: string
  naam: string                      // bijv. "Klantcontact Volwassenheid"
  kortLabel: string                 // bijv. "Volwassenheidsscan", "AI-scan", zie export-pdf-visual-volwassenheidsscan.md
  subtitel: string
  beschrijving: string
  doelgroep: string
  icoon: string                     // sleutel in ASSESSMENT_ICONS (eigen SVG's, nu target, sparkle, heart, cross en gauge, zie stylesheet.md, Assessment-icoon); valt terug op een letterlijke emoji als er geen SVG bij de sleutel is
  geschatteDuur: string             // bijv. "±30 minuten"
  categorieen: Categorie[] | null   // optioneel, zie hieronder
  bouwstenen: Bouwsteen[] | null    // gebruikt als categorieen ontbreken
  scoresPerGroepGesorteerd: boolean // sorteert de lijst Scores per groep op waarde; de AI-scan toont Scores per domein in volgorde 1 tot en met 8 (stylesheet.md, Domeinen), dus voor de kaart naast de radar niet gebruikt
  schaal: SchaalLabel[5] | null     // per Assessment, zie hieronder; null bij antwoordType "ja-nee-weetniet"
  antwoordType: "schaal" | "ja-nee-weetniet" | "spanning" // standaard "schaal" (1–5), zie Antwoordtype
  instructieregel: string | null    // regel boven de vragen in de doorloopflow; leeg = de standaardtekst voor de 1–5-schaal
  relevantieVraag: string | null    // alleen als een Categorie optioneel is: de Ja/Nee-vraag bovenaan die categorie, zie Optionele categorieën
  pdfContentSecties: { titel: string, bron: ContentBron } | null // zie export-pdf-visual-volwassenheidsscan.md
  afgeleidVanAssessmentId: string | null // zie Sector-varianten hieronder
  bouwsteenLabel: string             // eyebrow in de Toelichtingsmodal en in de kop van de bouwsteen in de doorloopflow; standaard "Bouwsteen" (Klantcontact, Zorg), "AI-domein" bij de AI-scan
  bouwsteenEenheidEnkelvoud: string  // enkelvoud van de eenheid in lopende tekst, bijv. "bouwsteen" of "domein"
  bouwsteenEenheidMeervoud: string   // meervoud, bijv. "bouwstenen" of "domeinen"
  wegingTitel: string | null        // kop van de wegingskaart, zie Bouwsteen.gewicht; leeg = standaardtitel
  wegingToelichting: string | null  // tekst van de wegingskaart, per Assessment aanpasbaar; leeg = standaardtekst
  openVraag: string | null          // alleen bij antwoordType "spanning": tekst van de open vraag onder elke bouwsteen, in plaats van het opmerkingenveld; leeg = het gewone opmerkingenveld, zie content-spanningsmeter.md
}
```

Niet elk scan-type heeft een categorie-laag. De Klantcontact
Volwassenheidsscan groepeert 15 bouwstenen in 5 categorieën, de
AI-volwassenheidsscan heeft 8 domeinen plat onder elkaar. Als
`categorieen` leeg is, tonen sidebar en resultatenpagina de bouwstenen
direct, zonder categoriekop. Maak geen kunstmatige categorieën met elk
één bouwsteen.

### Sector-varianten

Een sector-variant (bijv. een Zorg-versie van de Klantcontact
Volwassenheidsscan) is een **eigen, volwaardig Assessment-record**,
geen schakelaar binnen één Assessment. Reden: Het scherm Kies jouw
assessment (`schermen.md`) toont kaarten per Assessment-type,
generiek over `Assessment[]`, een sector-variant moet daar als eigen
kaart verschijnen, met eigen `naam`/`kortLabel` (bijv. "Zorgscan"), dus
moet het een eigen record zijn. Een Meting koppelt aan precies één
Assessment (`assessmentId`), dus deze keuze sluit direct aan op het
bestaande model.

**`afgeleidVanAssessmentId`**: Verwijst naar het Assessment waarvan
deze variant is afgeleid (`null` bij een op zichzelf staand
Assessment, zoals nu de Klantcontact- en AI-volwassenheidsscan). Puur
herkomstinformatie voor beheer (bijv. "afgeleid van Klantcontact
Volwassenheid" tonen in de lijst), geen lopende koppeling. Wordt het
template verwijderd, dan wordt het veld `null` en verdwijnt de regel
"Afgeleid van" (zie Verwijderen en datakoppelingen).

**Aanmaken = kopiëren, geen levende overerving.** Bij het aanmaken van
een sector-variant vanuit een template kopieert die actie alle
Categorieën, Bouwstenen en Vragen naar nieuwe, losse content-records
onder het nieuwe Assessment (nieuwe id's). Daarna zijn het gewone,
onafhankelijke content-records: Wijzig je een vraagtekst of een
`Bouwsteen.gewicht` op de sector-variant, dan raakt dat alleen die
variant. Een latere correctie op het template werkt dus
niet automatisch door in bestaande sector-varianten, bewuste keuze,
om dezelfde reden als "Content bewerken" hieronder: Een sector-scan
die al ingevuld is, mag niet ongemerkt van betekenis veranderen omdat
iemand het template bijwerkt. Een generieke fix (bijv. een typo in een
vraagtekst die in alle varianten voorkomt) moet dus bewust in elke
variant apart worden doorgevoerd.

Wat er bij het kopiëren verandert, komt met het aanmaken van de eerste
sector-variant zelf aan bod (nog niet uitgewerkt): In elk geval de
vraagteksten en de gewichten per bouwsteen, mogelijk ook
bouwsteentoelichtingen. De structuur (aantal bouwstenen, categorieën,
volgorde) blijft ongewijzigd overnemen, tenzij expliciet aangepast.

### Categorie

```
Categorie {
  id: string
  naam: string                      // "Overkoepelend", "Organisatie", "Proces & Tech", "Mens", "Fundament"
  kleur: string                     // categoriekleur, waarde in stylesheet.md
  omschrijving: string | null       // definitie onder de naam in de doorloopflow (Quickscan); leeg = niets tonen
  optioneel: boolean                // standaard false; true = de respondent kan aangeven dat deze categorie niet van toepassing is, zie Optionele categorieën
  volgorde: number
  gearchiveerd: boolean             // standaard false, zie Content bewerken
  bouwstenen: Bouwsteen[]
}
```

### Bouwsteen

```
Bouwsteen {
  id: string
  volgnummer: number                // 1 t/m 15, volgens de nummering in visie-coniche.md
  naam: string
  omschrijving: string              // de vraagzin onder de titel
  toelichting: string | null        // lopende tekst in de Toelichtingsmodal en direct in de kop van de bouwsteen in de doorloopflow, zie stylesheet.md; leeg = dat onderdeel ontbreekt
  centraleVraag: string | null      // blok "CENTRALE VRAAG" in dezelfde modal, bron: visie-coniche.md deel 2 / visie-ai-klantcontact.md; leeg = het blok ontbreekt
  tags: string[]                    // variabel aantal
  korteNaam: string | null          // alleen bij antwoordType "spanning": naam voor rijen en tooltips waar de volledige naam te lang is ("Verhaal", "Regie", ...); leeg = de volledige naam
  ijkpunten: string[] | null        // alleen bij antwoordType "spanning": vijf teksten, één per niveau 1 tot en met 5, het ijkpunt uit het boek voor dit veld; leeg = geen ijkpunt
  gewicht: number                   // standaard 1, zie toelichting hieronder
  gearchiveerd: boolean             // standaard false, zie Content bewerken
  aandachtZin: string | null        // alleen bij antwoordType "ja-nee-weetniet": zin onder de categoriekaart als deze bouwsteen het grootste aandachtspunt is, zie content-ziekenhuis-quickscan.md
  vragen: Vraag[]                   // nu steeds 4 (AI-scan: 5, Spanningsmeter: 5, Quickscan: 1 tot en met 12), niet hardcoded aannemen
}
```

**`gewicht`** (alleen op `Bouwsteen`, niet op `Categorie` en niet op
`Vraag`): Bepaalt hoe zwaar een bouwsteen meetelt in de scores. Standaard
`1`. Een getal groter dan 0, ook decimalen (bijv. `1,5`). Het gewicht
hangt aan de bouwsteen en dus aan het bouwstenenmodel, inclusief de
categorie waarin het blok zit. Bij een Assessment zonder categorielaag
(AI-volwassenheid) werkt het hetzelfde.

Het gewicht werkt door in de categoriescore en in de totaalscore, niet
in de bouwsteenscore zelf (zie Scoreberekening). Een gewicht ongelijk aan
1 is bewust zichtbaar voor de respondent: Zie `schermen.md`, Intake
(Wegingskaart) en `stylesheet.md` (factor per bouwsteen). Een gewicht van 1 wordt nergens
getoond, dat is de normale situatie.

Bij Klantcontact Volwassenheid en AI-volwassenheid staat het overal op
`1`. Bij de Zorgscan hebben drie bouwstenen gewicht `2`: 4 (Leren uit
Klantcontact), 10 (Kanaalmanagement) en 11 (Performance Management), zie
`content-zorgscan.md`. De bouwsteen-nummers zijn de `volgnummer`s uit
`visie-coniche.md`.

Bij de Quickscan is een bouwsteen een dimensie binnen een afdeling. Een
afdeling zwaarder laten wegen betekent daar hetzelfde gewicht op al haar
bouwstenen (`content-ziekenhuis-quickscan.md`).

**Wijzigen kan altijd**, ook als er al ingevulde scans zijn. Scores
worden nooit opgeslagen maar altijd berekend uit `antwoorden` en het
actuele gewicht, dus een wijziging werkt in één keer door in alle
scans van dat Assessment: Resultatenpagina, PDF, InDesign, CSV en de
Organisatie-resultaten per Meting. Dat is een bewuste verantwoordelijkheid van Coniche. De wijziging wordt gelogd (`bouwsteen.gewichtGewijzigd`,
zie Audit).

### Vraag

```
Vraag {
  id: string
  volgnummer: number                // binnen de bouwsteen
  tekst: string
  invalshoek: string | null         // alleen bij antwoordType "spanning": korte naam van de invalshoek, boven de vraag ("Noodzaak", "Prioriteren & stoppen"); leeg = niets tonen
  aandachtspunt: string | null      // alleen bij antwoordType "spanning": de toelichting "Waar je op let" achter een Info-knop bij de vraag; leeg = geen Info-knop
  gearchiveerd: boolean             // standaard false, zie Content bewerken
}
```

### SchaalLabel

Een 1–5-schaal per Assessment. Voor de twee huidige scans identiek:

```
1: Niet aanwezig
2: Deels / incidenteel
3: Aanwezig en meestal toegepast
4: Structureel geborgd en gemeten
5: Geoptimaliseerd en continu verbeterd
```

De betekenis per niveau staat in `inhoudelijk-fundament.md` sectie 1.

De Spanningsmeter heeft een eigen schaal met andere labels
(Reactief, Gefragmenteerd, Georganiseerd, Geïntegreerd, Adaptief,
`content-spanningsmeter.md`, Schaal en niveaus). De labels staan in
`Assessment.schaal`, de waarde `0` (Kan ik niet beoordelen) niet: Die hoort bij
het antwoordType en heeft in de interface altijd dezelfde tekst.

### Antwoordtype

`Assessment.antwoordType` bepaalt hoe een vraag wordt beantwoord en hoe de
score wordt berekend. Een Assessment heeft één antwoordType voor al zijn
vragen.

- `"schaal"` (standaard): Een antwoord van 1 tot en met 5 volgens
  `Assessment.schaal`. De score is een gemiddelde (Scoreberekening).
  Klantcontact Volwassenheid, AI-volwassenheid en de Zorgscan.
- `"ja-nee-weetniet"`: Een antwoord is `"ja"`, `"nee"` of `"weet-niet"`.
  Er is geen schaal (`schaal` is `null`). Ja is 1 punt, Nee en Weet ik niet
  zijn 0 punten. Weet ik niet blijft als eigen antwoord bewaard, zodat het
  resultaat per antwoord kan tellen. De score is een aantal punten en een
  percentage (Scoreberekening). Klantcontact Quickscan – Ziekenhuis
  (`content-ziekenhuis-quickscan.md`).
- `"spanning"`: Een antwoord
  van 1 tot en met 5 volgens `Assessment.schaal`, met als extra waarde `0`
  voor "Kan ik niet beoordelen". Een 0 is een geldig antwoord (de vraag telt
  als beantwoord), maar telt niet mee in de score. Er is geen totaalscore: De
  uitkomst is een score per bouwsteen (hier een spanningsveld), een niveau en de
  spanning tussen de velden (Scoreberekening). Spanningsmeter
  (`content-spanningsmeter.md`).

Een vraag is beantwoord zodra er een waarde staat, ook `"weet-niet"` en ook
`0` bij `"spanning"`. De voortgang telt dus ook Weet ik niet en Kan ik niet
beoordelen mee.

**Structuur van de Spanningsmeter.** Dit Assessment gebruikt de bestaande
lagen en voegt er geen toe. Er is geen categorielaag (`categorieen` is leeg),
de 6 spanningsvelden zijn `Bouwsteen`en direct onder het Assessment, en de 5
gescoorde vragen per veld zijn `Vraag`en. De volgorde van de bouwstenen is de
bouwlogica en telt mee in de berekening (Scoreberekening, Spanning). Wat per
bouwsteen en per vraag extra is (ijkpunten, invalshoek, "Waar je op let", de
open vraag) staat in de velden hieronder en bij Bouwsteen en Vraag. `gewicht`
is bij dit antwoordType niet in gebruik en de wegingskaart verschijnt niet.

**Structuur van de Quickscan.** Dit Assessment gebruikt de bestaande
lagen en voegt er geen toe. De 4 afdelingen zijn `Categorie`s, de
dimensies (Organisatie, Processen en techniek, Mensen) zijn `Bouwsteen`en
onder een afdeling, en de vragen hangen aan die bouwstenen. Een
dimensie die in een afdeling geen vragen heeft, bestaat daar niet als
bouwsteen. Dezelfde dimensienaam komt daardoor in meerdere afdelingen
terug als aparte bouwstenen.

**Optionele categorieën.** Een Categorie met `optioneel: true` begint in
de doorloopflow met de vraag uit `Assessment.relevantieVraag`, met Ja en
Nee als antwoord, onder de `omschrijving` van de categorie. Het antwoord
staat in `ScanInvulling.relevantie`.

- Ja: De categorie is van toepassing en haar vragen worden gesteld.
- Nee: De categorie is niet van toepassing. Haar bouwstenen en vragen
  worden overgeslagen en ze doet in geen enkele score mee
  (Scoreberekening). Antwoorden die er al stonden blijven bewaard en
  tellen weer mee als de respondent terugkeert naar Ja.
- Zolang de vraag niet beantwoord is, telt de categorie in de voortgang
  mee als van toepassing.
- Een scan is afgerond als elke optionele categorie een antwoord op de
  relevantievraag heeft en alle vragen van de categorieën die van
  toepassing zijn beantwoord zijn. Minstens één categorie moet van
  toepassing zijn: Zijn ze allemaal Nee, dan is er niets te scoren en kan
  de scan niet worden afgerond.
- Bij `optioneel: false`, dus bij elk ander Assessment, verandert er
  niets.

### Organisatie

Aangemaakt in beheer. Een organisatie is niet aan één scan-type gebonden:
Die koppeling loopt via Meting.

```
Organisatie {
  id: string
  naam: string                      // bewerkbaar via organisaties.bewerken, gelogd als organisatie.hernoemd
  korteNaam?: string | null // weergavenaam in kolomkoppen, maximaal 30 tekens, leeg betekent `naam`
  kenmerken: { [veldId: string]: waarde }   // in beheer, altijd bewerkbaar, niet door respondenten
  aangemaaktOp: datetime
}
```

`kenmerken` volgt de organisatievelden (zie hieronder). De KPI's en de contacten per kanaal staan niet meer in `kenmerken` maar als `KpiWaarde` (KPI's en kanalen, bij de organisatievelden).

### Onderdeel

Een Onderdeel is een deel van een Organisatie waarover een Meting gaat en waarvoor KPI-waarden kunnen worden ingevuld, zoals "Particulier" of "Team A". Tot nu toe was het onderdeel een tekst op de Meting. Nu bestaat het één keer per Organisatie, en gebruiken de Metingen en de KPI's dezelfde lijst.

```
Onderdeel {
  id: string
  organisatieId: string
  naam: string
  aangemaaktOp: datetime
}
```

- **Hele organisatie is geen Onderdeel.** Het is de vaste standaard. Een Meting zonder onderdeel heeft `onderdeelId: null`, en een KPI-waarde met `onderdeelId: null` geldt voor de hele organisatie. De naam "Hele organisatie" is gereserveerd, ook in andere hoofdletters.
- **Naam.** Verplicht en getrimd, zoals de naam van een Organisatie. Uniek binnen de Organisatie, zonder verschil tussen hoofdletters en kleine letters. Komt een ingetypte naam hoofdletterongevoelig overeen met een bestaand Onderdeel, dan geldt dat Onderdeel met zijn eigen spelling (zoals bij "Anders…", zie Organisatievelden).
- **Aanmaken** kan op twee plekken die dezelfde lijst gebruiken: In het venster Onderdelen onder Bewerken in het organisatie-detail en in elk formulier met een veld Onderdeel (`beheerpagina.md`, punt 5, Het veld Onderdeel). Een Onderdeel mag bestaan zonder Meting en zonder KPI-waarden.
- **Hernoemen** verandert de naam op één plek. De keuzelijst bij de KPI's, de Metingen en de naam van elke Meting volgen. Een Meting met `labelHandmatig` houdt haar eigen naam.
- **Verwijderen** kan alleen als er geen Meting aan hangt. De KPI-waarden van het Onderdeel verdwijnen mee, en de bevestiging noemt hoeveel (Verwijderen en datakoppelingen).
- **Recht.** `organisaties.bewerken`. Aanmaken kan ook met `metingen.plannen`, omdat een Consultant bij het plannen van een Meting een nieuw team moet kunnen noemen.
- **`Meting.onderdeel` bestaat niet.** De naam van het Onderdeel komt uit het Onderdeel via `onderdeelId`; een tweede veld voor dezelfde informatie kan na een hernoeming uit de pas lopen. Hernoemen van een Onderdeel werkt de naam van de Metingen bij, behalve bij `labelHandmatig`.

### Contactpersoon

Een Admin legt bij een Organisatie vast welke mensen relevant zijn. Een Consultant ziet ze bij de eigen Organisaties en kan ze vooralsnog niet wijzigen (zie Recht en slot). Ze staan bij de Kenmerken op het organisatie-detail (`beheerpagina.md`, punt 4, Contactpersonen). Nieuwsartikelen horen bij het Dossier (zie Dossieritem).

```
Contactpersoon {
  id: string
  naam: string                      // verplicht, getrimd, maximaal 80 tekens
  functie: string                   // vrije tekst, maximaal 80 tekens, mag leeg zijn
  linkedinUrl: string               // het adres van het profiel, altijd https:// of http://, leeg als er geen is
  notitie: string                   // waarom de persoon relevant is, maximaal 300 tekens
  aangemaaktOp: datetime
}
```

`Organisatie.contactpersonen` is een lijst die ontbreekt in data van vóór dit veld (dan is ze leeg).

- **Geen Respondent, geen gebruiker.** Een Contactpersoon heeft geen e-mailadres, geen toegangscode en geen rol. Er wordt niets naartoe gestuurd, en ze doen niet mee in een scan, een benchmark of een export.
- **LinkedIn-adres.** Optioneel. Wat is ingevuld, moet een adres van `linkedin.com` of een subdomein zijn (de controle is op het domein, niet op de tekst). Zonder schema wordt `https://` voorgezet. Een ander domein wordt geweigerd.
- **Volgorde.** Op alfabet, hoofdletterongevoelig.
- **Recht en slot.** Aanmaken, wijzigen en verwijderen vraagt het recht `contactpersonen.bewerken` en het Bewerkslot van de Organisatie, zoals bij de Kenmerken. Alleen een Admin heeft dat recht (alle Organisaties). Een Consultant ziet de lijst bij de eigen Organisaties, zonder de knoppen om te wijzigen. Als de functie stabiel is, krijgt een Consultant het recht ook, beperkt tot eigen Organisaties (zoals bij `organisaties.bewerken`); dan verandert alleen de rechtenmatrix. Een Lead en een Respondent zien ze niet.
- **Verwijderen.** Een eigen verwijderactie per item, met bevestiging. Wordt de Organisatie verwijderd, dan gaan ze mee (Verwijderen en datakoppelingen).
- **Privacy.** Een Contactpersoon is een persoon buiten de app, en een naam met functie blijft ook als die openbaar is een persoonsgegeven. Daarom staan hun gegevens niet in de audit-log (Audit) en niet in de exports (`export-csv.md`, `export-indesign.md` en `import-scans.md` noemen dat). Alleen openbaar vindbare, zakelijke gegevens zijn toegestaan: Naam, functie, het LinkedIn-profiel en een zakelijke notitie. Geen privégegevens, zoals een privé e-mailadres, telefoonnummer, woonadres of geboortedatum, en niets over de persoon als privépersoon. Onder het veld Notitie staat een korte waarschuwing met die regel, omdat een vrij tekstveld de plek is waar zoiets ongemerkt binnenkomt. Wat er is vastgelegd, is wat Coniche uit openbare bronnen weet, en Coniche is er verantwoordelijk voor dat dat klopt.

### Dossieritem

Een Consultant stelt bij een Organisatie een Dossier samen van Nieuws, Cases, Events en Blogs, en kan het zichtbaar maken voor de Lead. De regels, de schermen en de rechten staan in `dossier.md`. Het Dossier vervangt het veld `Organisatie.nieuwsartikelen`.

```
Organisatie.dossier {
  zichtbaar: boolean                // standaard false
  zichtbaarSinds: datetime | null   // het moment waarop zichtbaar voor het laatst aan ging
  naamVoorLead: string              // maximaal 80 tekens, leeg = "Dossier {Organisatie.naam}"
  toonProfiel: {                    // welke blokken van het organisatiepaneel de Lead ziet
    cijfers: boolean                // standaard false
    kanalen: boolean                // standaard false
    techstack: boolean              // standaard false
    overig: boolean                 // standaard false
    kpis: boolean                   // standaard false, de KPI's van de hele Organisatie als ringen
  }
  radarBronnen: RadarBron[]         // hoogstens één per Assessment met een radar, leeg = overal automatisch
  gewijzigdOp: datetime | null      // laatste wijziging in wat een Lead ziet
  items: Dossieritem[]
}

RadarBron {
  assessmentId: string              // Klantcontact Volwassenheid of AI-volwassenheid
  metingId: string | null           // null = automatisch (meest recent), anders een vaste Meting van deze Organisatie
}

Dossieritem {
  id: string
  soort: "nieuws" | "case" | "event" | "blog" | "benchmark"   // staat vast na het aanmaken
  titel: string                     // verplicht, getrimd, maximaal 200 tekens; bij een Benchmark leeg, de titel is de naam van de benchmark
  toelichting: string               // maximaal 400 tekens, mag leeg zijn
  zichtbaarVoorLead: boolean        // standaard false
  bouwsteenIds: string[]             // Bouwsteen.id van de Klantcontact Volwassenheidsscan en de AI-scan, mag leeg zijn
  url: string                       // Nieuws en Blog: verplicht. Case en Event: optioneel. Benchmark: geen. Altijd http of https
  aangemaaktOp: datetime
  gewijzigdOp: datetime
  bron: string                      // alleen Nieuws en Blog, maximaal 80 tekens
  gepubliceerdOp: date | ""         // alleen Nieuws en Blog, jjjj-mm-dd
  datum: date                       // alleen Event, verplicht, jjjj-mm-dd
  einddatum: date | ""              // alleen Event, niet voor datum
  plaats: string                    // alleen Event, maximaal 80 tekens
  samenvatting: string              // alleen Case, verplicht, maximaal 600 tekens
  caseOrganisatieId: string | null  // alleen Case: de Organisatie waar de case over gaat
  omvang: string                    // alleen Case, maximaal 40 tekens
  totResultaat: string              // alleen Case, maximaal 40 tekens
  benchmarkId: string | null        // alleen Benchmark: Benchmark.id, de Organisatie is lid van die benchmark, verplicht bij opslaan
}
```

- **Event verlopen** is afgeleid uit `datum` of `einddatum` (`dossier.md`, Regels), er is geen veld voor.
- **Een Lead ziet een item** als `Organisatie.dossier.zichtbaar` aan staat, `zichtbaarVoorLead` aan staat en, bij een Case, `Organisatie.caseToegestaan` van `caseOrganisatieId` aan staat. De naam van de Organisatie in de Case gaat nooit naar de Lead. Bij een Benchmark komt daar bij dat de Lead het vinkje heeft (`LeadToegang` met `weergave: "benchmark"`) en de Organisatie nog in de benchmark zit (`dossier.md`, Wat de Lead ziet).
- **Naam en scorebron.** `naamVoorLead` is de titel van het Dossier bij de Lead. `radarBronnen` bepaalt per Assessment welke Meting de scores in de radar en de verdeling levert: `metingId` leeg is automatisch (de meest recente Meting waarvan de Lead de Resultaten mag inzien), anders een vaste Meting die de Lead mag inzien. Wie `dossier.bewerken` heeft, mag beide wijzigen. De regels staan in `dossier.md` (Welke scores).
- **Profiel voor de Lead.** `toonProfiel` bepaalt welke blokken van het organisatiepaneel (`beheerpagina.md`, Organisatiepaneel) de Lead bovenaan het Dossier ziet: `cijfers` (klanten, FTE klantcontact, contacten per jaar en digitalisering), `kanalen`, `techstack`, `overig` (Adoptie mijnomgeving/app, Klantcontact management & support en IT DevOps-medewerkers) en `kpis` (de KPI's van de hele Organisatie als ringen). Alle vijf staan standaard uit. Een blok is alleen zichtbaar als `Organisatie.dossier.zichtbaar` ook aan staat. Toegang, Afspraken en Contactpersonen zijn nooit zichtbaar voor de Lead. Wie `dossier.bewerken` heeft, mag `toonProfiel` wijzigen. De regels staan in `dossier.md` (Wat de Lead ziet, Profiel).
- **`OrganisatieLid.dossierGezienOp`** (datetime of null) bepaalt of de kaart Dossier bij een Lead de tag "Nieuw" krijgt.


### Respondent (in de code: `OrganisatieLid`)

De persoon, los van hoe vaak die een scan invult.

```
Respondent {
  id: string
  organisatieId: string
  email: string                     // uniek binnen de organisatie, genormaliseerd (zie hieronder)
  naam: string | null               // leeg tot de eerste intake
  functie: string | null            // in de interface: "Rol / Functie"
  team: string | null
  notities: string | null
  aangemaaktOp: datetime
}
```

Wordt iemand uitgenodigd met een e-mailadres dat al bestaat binnen de
organisatie, dan wordt dezelfde respondent hergebruikt.

**E-mailadres altijd genormaliseerd** (getrimd, lowercase) vóór
opslag én bij elke vergelijking, ook bij de verificatiecode-flow
(Toegang voor respondenten hieronder) en bij Respondent-matching in
uitnodigen en import (`import-scans.md`). Zonder normalisatie
ontstaat bij een andere schrijfwijze (hoofdletters, spaties) een
dubbele respondent in plaats van hergebruik. Geldt hetzelfde voor
`Gebruiker.email` hieronder, anders herkent een latere login een
eerder toegewezen organisatie niet.

Zolang `naam` leeg is, tonen beheeroverzichten het e-mailadres als
herkenbare placeholder in de Naam-kolom. Intakegegevens (naam, functie,
team, notities) staan op de respondent en zijn bij een volgende meting
al ingevuld.

### Meting (in de code: `ScanUitvoering`)

Eén afname van één scan-type bij één organisatie, voor één onderdeel en op één
meetdatum, bijv. "Zuid-Nederland Zakelijk | okt 2026". Een organisatie heeft
meerdere Metingen, ook van verschillende Assessments. Wat Metingen van elkaar
onderscheidt, zijn het onderdeel, het Assessment en de meetdatum. Een groepering
daarboven bestaat niet. Wat bij elkaar hoort, kies je zelf bij een vergelijking
of een gemiddelde (`benchmark.md`).

```
Meting {
  id: string
  organisatieId: string
  assessmentId: string
  label: string                     // de naam, zie Naam van een Meting
  labelHandmatig: boolean // standaard false
  onderdeelId: string | null // null is "Hele organisatie", zie Onderdeel. 
  meetdatum?: date // zonder tijdstip
  samenstelling?: string[] // metingIds, alleen bij een samengestelde Meting
  aangemaaktOp: datetime
}
```

**Onderdeel en meetdatum.** Het onderdeel zegt over welk deel van de
organisatie een Meting gaat, bijvoorbeeld "Team A", en is standaard "Hele
organisatie". Een Meting kiest een Onderdeel uit de lijst van de Organisatie (zie Onderdeel). Waar de spec hieronder
"onderdeel" schrijft, is dat de naam van dat Onderdeel, of "Hele organisatie"
bij `onderdeelId: null`. De meetdatum is de dag waarop de Meting plaatsvindt. Respondenten
mogen er daarna nog dagen over doen. Het is niet het moment waarop de Meting in
de app is aangemaakt (`aangemaaktOp`) en niet het moment van importeren.

- **Meetdatum is verplicht** bij het aanmaken van een Meting, en is achteraf
  te wijzigen. De datum geeft de volgorde in de tijd, en daarmee de volgorde
  waarin Metingen in een vergelijking staan (`benchmark.md`, Niveau 2). Een
  Meting zonder meetdatum toont "Datum ontbreekt". Ze kan pas in een
  vergelijking of samenstelling als de datum is ingevuld.
- **Bij een import** is de meetdatum de oudste `created_at` van de scans die in
  de Meting komen (de oude tool), of de kolom `meting_meetdatum` van onze eigen
  export (`import-scans.md`, Meetdatum, `export-csv.md`).
- **Uniek.** Er is geen harde uniciteitsregel. Een Meting met dezelfde
  organisatie, hetzelfde onderdeel, hetzelfde Assessment en dezelfde meetdatum
  als een bestaande Meting geeft een waarschuwing bij opslaan, geen blokkade.
- **Naam van een Meting.** De app maakt de naam uit onderdeel en meetdatum,
  "{onderdeel} | {maand jaar}", bijvoorbeeld "Team A | okt 2026", en bij het
  onderdeel "Hele organisatie" alleen "{maand jaar}". Het veld `label` is de
  opslag van die naam. Verandert het onderdeel of de meetdatum, dan volgt de
  naam. Een gebruiker kan de naam overschrijven, bijvoorbeeld als twee Metingen
  in dezelfde maand voor hetzelfde onderdeel bestaan. `labelHandmatig` staat
  dan op true en de naam volgt onderdeel en meetdatum niet meer. Een
  geïmporteerd label blijft staan tot de beheerder het wijzigt.
- **Onderdeel uit het label voorstellen.** Een
  geïmporteerde Meting heeft het onderdeel "Hele organisatie", ook als haar
  label een onderdeel noemt (bijv. "Zuid-Nederland | 0-meting" na een import).
  "Scans samenbrengen" en Wijzigen stellen het onderdeel voor uit het label: De
  tekst vóór " | ", anders "Hele organisatie". Het is een voorstel dat de
  beheerder ziet en kan aanpassen, nooit een stille wijziging. Met het Onderdeel
  als object is het voorstel een keuze in de
  keuzelijst: Bestaat er een Onderdeel met die naam (hoofdletterongevoelig),
  dan staat dat gekozen. Anders staat er "Nieuw onderdeel…" met de naam
  ingevuld, en ontstaat het Onderdeel pas als de beheerder bevestigt.

**Samengestelde Meting (aangepast in het).** Een Meting met `samenstelling` is een gemiddelde over andere
Metingen van dezelfde organisatie en hetzelfde Assessment, minstens twee, elk
hoogstens één keer en zelf niet samengesteld. De Metingen kiest de gebruiker
zelf, zonder verdere grens. Ze heeft standaard het onderdeel "Hele
organisatie". Haar meetdatum volgt de onderliggende Metingen: Het is de
laatste meetdatum van de geselecteerde Metingen. Ze is dus niet los te
wijzigen, en een geselecteerde Meting zonder datum blokkeert het opslaan. Een
samenstelling waarvan de leden geen datum hebben toont "Datum ontbreekt". In de app staat de datum altijd alleen-lezen,
zonder invoerveld, met de toelichting "Volgt de nieuwste Meting in de
samenstelling". Ze heeft geen Respondenten en geen `ScanInvulling`s, en kopieert geen antwoorden:
De scores worden berekend uit de onderliggende Metingen (Scoreberekening,
Gemiddelde over een groep leden). Een samengestelde Meting is zelf een Meting,
dus ze kan als `BenchmarkLid.metingId` meedoen aan een benchmark tussen
organisaties, en aan een vergelijking tussen Metingen. Zo is samenstelling 1 te
vergelijken met samenstelling 2.

### ScanInvulling

Eén invulling door één respondent binnen één meting.

```
ScanInvulling {
  id: string
  metingId: string
  respondentId: string
  status: "uitgenodigd" | "bezig" | "afgerond"
  aangemaaktOp: datetime            // moment waarop de regel in de app is aangemaakt; bij een import het importmoment
  uitgenodigdOp: datetime
  gestartOp: datetime | null        // gezet bij het verzenden van de intake
  afgerondOp: datetime | null
  laatstOpgeslagenOp: datetime | null // voor "Laatst opgeslagen" op Mijn metingen (`visualisatie-mijn-metingen.md`); gezet bij elk opslaan van een antwoord
  antwoorden: { [vraagId: string]: number | string }   // 1-5, of "ja" | "nee" | "weet-niet" bij antwoordType "ja-nee-weetniet", of 0-5 bij antwoordType "spanning" (0 = kan ik niet beoordelen)
  relevantie: { [categorieId: string]: boolean }       // alleen bij optionele categorieën: true = van toepassing, false = niet van toepassing, ontbreekt = nog niet beantwoord
  opmerkingenPerBouwsteen: { [bouwsteenId: string]: string }   // bij antwoordType "spanning": het antwoord op de open vraag (Assessment.openVraag) per bouwsteen
  notitie: string | null // zie hieronder
  bewaarVerlengdTot: datetime | null        // zie Bewaartermijn ingevulde scans
}
```

Uniek per combinatie van meting en respondent. Dezelfde scan opnieuw
invullen gebeurt via een nieuwe meting.

**Notitie op de scan.** Een notitie bij het starten
van een scan (bij de import `start_comment`, `import-scans.md`) hoort bij die
ene scan en staat op de `ScanInvulling`, niet op de Respondent. Reden: Eén
Respondent kan veel scans hebben, en bij een import is dat vaak dezelfde
Respondent voor alle regels (een Coniche-medewerker die voor een klant invult).
Stond de notitie op de Respondent, dan werden alle notities van die Respondent
aan elkaar geplakt en was niet meer te zien welke notitie bij welke scan hoort.
`Respondent.notities` blijft bestaan voor wat de beheerder zelf bij de persoon
opschrijft. De import schrijft er niet meer naar. Bestaande, aan elkaar geplakte
notities op een Respondent zijn niet meer uit elkaar te halen. De scans zijn dan
opnieuw te importeren (`import-scans.md`, Notitie per scan).

Status: `"uitgenodigd"` bij het uitnodigen, `"bezig"` zodra de intake is
verzonden (ook al is de voortgang dan nog 0%), `"afgerond"` als alle
vragen beantwoord zijn (bij optionele categorieën: Zie Antwoordtype,
Optionele categorieën).

### Bewerkslot

Een record dat iemand bewerkt, kan niet tegelijk door een ander bewerkt
worden. Het slot geldt voor een ingevulde scan (invullen en bewerken), een
Respondent en een Organisatie. Later komt content erbij (Assessments,
Content-pagina's). Het slot op een Organisatie geldt voor elke bewerking van
die Organisatie: De Kenmerken, "KPI's invullen" en het toevoegen, wijzigen of
verwijderen van een Onderdeel.

```
Bewerkslot {
  entiteitType: "scan" | "respondent" | "organisatie"   // later ook content
  entiteitId: string
  houder: string                    // wie het slot heeft
  hartslagOp: datetime
}
```

- **Eerste wint**: Wie als eerste een record opent om te bewerken, krijgt het
  slot. Claimen is atomair: Twee gelijktijdige pogingen leveren één houder.
- **Tweede persoon**: Krijgt een melding dat het record nu in gebruik is en
  kan het op dat moment niet openen. In beheer staat in de melding wie het
  slot heeft. Aan de respondentkant staat er geen naam in. De melding
  verdwijnt en het record opent zodra het slot vrij is.
- **Hartslag en vervallen**: De houder meldt zich elke 15 seconden. Zonder
  hartslag vervalt het slot na 90 seconden, zodat een gesloten tabblad of
  een crash geen blijvend slot achterlaat.
- **Vrijgeven**: Bij sluiten, opslaan of weggaan van de pagina. Een
  overgang naar een volgende pagina in hetzelfde tabblad (intake naar
  vragenlijst) behoudt het slot.
- **Zonder database**: Valt terug op localStorage, en geldt dan alleen
  binnen die browser.

Sander werkt de velden en de techniek uit. Dit legt vast hoe het
gedrag moet zijn.

### Scoreberekening

Eén gedeelde functie berekent de totaalscore en de score per
categorie/bouwsteen uit `antwoorden` en `Bouwsteen.gewicht`. Alle scores
worden berekend en nooit opgeslagen. Met `g` het gewicht van een
bouwsteen en `n` het aantal vragen in dat blok:

- **Bouwsteenscore** = som van de antwoorden in het blok gedeeld door `n`.
  Ongewogen.
- **Categoriescore** = `Σ(g × bouwsteenscore) / Σ g` over de bouwstenen
  in die categorie. Een blok met gewicht 2 telt dus dubbel mee.
- **Totaalscore** = `Σ(g × som antwoorden per blok) / Σ(g × n)` over alle
  bouwstenen. Bij gewicht `1` overal is dat de som van alle antwoorden
  gedeeld door het aantal vragen (60 bij Klantcontact). De totaalscore komt
  uit de ruwe antwoorden en niet uit afgeronde bouwsteenscores.
- **Afronding** alleen op getoonde waarden: 1 decimaal, half-away-from-
  zero (`toFixed(1)`). Classificatie en kleur volgen de afgeronde
  waarde.

Rekenvoorbeeld Zorgscan: Een invulling met som 172 over 60 vragen is
ongewogen 2,87. Met de blokken 4, 10 en 11 op gewicht 2 komt de som op
215 en de deler op 72, dus 2,99 (afgerond 3,0). Dit voorbeeld hoort in
de test van de scorefunctie.

**Antwoordtype `"ja-nee-weetniet"` (Quickscan).** Hier is de score een
aantal punten en een percentage, geen gemiddelde van 1 tot 5. Met `p` het
aantal Ja in een bouwsteen, `n` het aantal vragen in dat blok en `g` het
gewicht:

- **Bouwsteenscore** = `p` punten van `n`, als percentage `p / n`.
  Ongewogen. Bij de Quickscan is dit de score van een dimensie binnen een
  afdeling.
- **Categoriescore** = `Σ(g × p) / Σ(g × n)` over de bouwstenen in die
  categorie, als percentage. Dit wijkt af van het gemiddelde van de
  bouwsteenpercentages dat bij de schaal geldt, want dat laat een bouwsteen
  van 1 vraag even zwaar tellen als een bouwsteen van 10. Poliklinieken
  scoren op Organisatie 2 van 4, Processen en techniek 2 van 10 en Mensen
  1 van 1: De afdeling staat op 5 van 15 (33%), het gemiddelde van de drie
  percentages zou 57% zijn.
- **Totaalscore** = `Σ(g × p) / Σ(g × n)` als percentage. De getoonde punten
  zijn `Σ(g × p)` van `Σ(g × n)`. Bij gewicht 1 overal is dat het aantal
  Ja gedeeld door het aantal vragen (60 bij de Quickscan). Net als bij de
  schaal komt de totaalscore uit de ruwe antwoorden en niet uit afgeronde
  bouwsteenpercentages.
- **Niet van toepassing.** Bouwstenen van een categorie met `relevantie`
  op `false` doen niet mee. Totaalscore en punten gaan dan over de overige
  categorieën, bijvoorbeeld 14 van 15 punten (93%) als alleen
  Patiëntenservice van toepassing is en daar 14 vragen met Ja zijn
  beantwoord. De categorie zelf krijgt geen score en geen klasse.
- **Tellingen** per bouwsteen: Het aantal Ja, Nee en Weet ik niet, uit
  `antwoorden`.
- **Afronding**: Alleen op getoonde waarden, hele procenten,
  half-away-from-zero. Klasse en kleur volgen het afgeronde percentage
  (`CLAUDE.md`, sectie 1, Classificatie).

Rekenvoorbeeld Quickscan (de fictieve proefscan uit de PDF): De vier
afdelingen scoren 5, 3, 5 en 4 punten van 15, samen 17 van 60, dus 28%
(28,3 afgerond). Krijgen de bouwstenen van de tweede afdeling gewicht 2, dan is het
`Σ(g × p)` 5 + 6 + 5 + 4 = 20 en `Σ(g × n)` 15 + 30 + 15 + 15 = 75, dus
27% (26,7 afgerond). Dit voorbeeld hoort in de test van de scorefunctie.

Voor dit antwoordType gebruikt voorlopig alleen de resultatenpagina deze
berekening. PDF, CSV, InDesign, import, het gemiddelde over meerdere
Respondenten, spreiding en benchmark zijn er nog niet voor uitgewerkt
(`backlog.md`).

**Antwoordtype `"spanning"` (Spanningsmeter).** Hier is er geen bouwsteen-gemiddelde dat in een
totaalscore uitkomt. De uitkomst is een score per spanningsveld, een niveau en
de spanning tussen de velden. Met `a` een antwoord van 1 tot en met 5, een
vraag met antwoord `0` of zonder antwoord is niet beoordeeld:

- **Veldscore** = gemiddelde van de beoordeelde antwoorden in het veld (de
  antwoorden 1 tot en met 5), met één decimaal getoond. Een 0 telt niet mee in
  teller en noemer. Zijn er minder dan drie beoordeeld, dan heeft het veld geen
  score en toont de interface "Onvoldoende zicht" in plaats van een getal. Zo'n
  veld doet niet mee in niveau, spanning en gemiddeld niveau.
- **Niveau** = de getoonde veldscore afgerond op een heel getal (half-away-from-
  zero), met de naam uit `Assessment.schaal`: Onder 1,5 Reactief, 1,5 tot en met
  2,49 Gefragmenteerd, 2,5 tot en met 3,49 Georganiseerd, 3,5 tot en met 4,49
  Geïntegreerd, vanaf 4,5 Adaptief. Kleur en chip volgen het niveau
  (`stylesheet.md`, Scorekleuren).
- **Spanning** per veld, behalve het eerste: `score(veld) − min(score van alle
  voorgaande velden)`, over de voorgaande velden die een score hebben. De
  volgorde is die van `Bouwsteen.volgnummer`: Verhaal, Regie, Gedrag, Data,
  Processen, Technologie. Positief betekent dat het veld voorloopt op zijn
  fundament, negatief dat het achterblijft bij het laagste veld daarvoor. Het
  eerste veld heeft geen spanning, evenmin een veld zonder voorgaand veld met
  een score. De berekening gebruikt de ongeronde veldscores en toont één
  decimaal met een min-teken (`−`) of plusteken, dus het getoonde verschil kan
  0,1 afwijken van het verschil van twee getoonde scores.
- **Grootste spanning** = het veld met de grootste absolute spanning. Bij gelijke
  waarden het veld dat het eerst komt. Het profiel markeert dat veld.
- **Gemiddeld niveau** = gemiddelde van de veldscores van de velden met een score,
  ongewogen, met één decimaal en het bijbehorende niveau. Dit is een weergave en
  geen score van de meter (`visualisatie-spanningsmeter.md`, Ring).
- **Groep.** Per veld telt elke afgeronde scan met een veldscore één keer. Het
  gemiddelde van de groep is het gemiddelde van die veldscores, de laagste en
  hoogste score zijn het minimum en maximum ervan, en de spreiding is hoogste
  minus laagste. Het aantal "beoordeeld" is het aantal scans met een veldscore in
  dat veld. De spanning van de groep wordt berekend op de groepsgemiddelden, niet
  als gemiddelde van de spanningen van de personen. Het veld "Meest uiteenlopend"
  is het veld met de grootste spreiding (bij gelijke spreiding het eerste).
- **Onder de drempel.** Een groepsweergave voor een Lead volgt `benchmarkMinRespondenten`
  (Instellingen): Eronder staat er geen gemiddelde, laagste en hoogste score en
  geen voorbeelden. Wat een respondent ziet, is alleen het eigen
  profiel, tenzij een Admin de groepsweergave voor hem aanzet (`beheerpagina.md`,
  punt 6a). De antwoorden en het profiel van één persoon staan nooit in een
  groepsweergave.
- **Afronding**: Alleen op getoonde waarden, half-away-from-zero, één decimaal.

Rekenvoorbeeld (de fictieve deelnemer uit de designs). Antwoorden per veld:
Verhaal 4, 4, 4, 4, 3 (3,8), Regie 3, 3, 2, 3, 2 (2,6), Gedrag 2, 2, 3, 2, 2
(2,2), Data 3, 4, 3, 3, 4 (3,4), Processen 2, 3, 2, 3, 2 (2,4) en Technologie 4,
4, 4, 4, 4 (4,0). Niveaus: Geïntegreerd, Georganiseerd, Gefragmenteerd,
Georganiseerd, Gefragmenteerd en Geïntegreerd. Spanning: Regie −1,2 (2,6 min
3,8), Gedrag −0,4 (2,2 min 2,6), Data +1,2 (3,4 min 2,2), Processen +0,2 (2,4 min
2,2) en Technologie +1,8 (4,0 min 2,2). De grootste spanning is Technologie. Het
gemiddeld niveau is 3,1 (18,4 gedeeld door 6), Georganiseerd. Geeft de deelnemer
bij Verhaal als laatste een 0 (4, 4, 4, 4, 0), dan is de veldscore 4,0 over vier
antwoorden. Groep (12 scans): Gemiddelden 3,6, 2,9, 2,7, 3,2, 2,5 en 3,9 geven
spanningen van −0,7, −0,2, +0,5, −0,2 en +1,4, met Technologie als grootste (op
Processen, 2,5). De spreiding is het grootst bij Gedrag (1,4 tot 4,0, dus 2,6).
Deze voorbeelden horen in de test van de scorefunctie, naast het rekenvoorbeeld in
het importbestand van de bron (`content-spanningsmeter.md`, Importbestand).

Voor dit antwoordType gebruikt voorlopig alleen de resultatenpagina deze
berekening, met Mijn metingen. PDF, CSV, InDesign, import, de vergelijking tussen
Metingen, benchmark en Verkennen zijn er nog niet voor uitgewerkt
(`backlog.md`).

Vier plekken gebruiken dezelfde uitkomst, geen van alle een eigen
herimplementatie: De resultatenpagina, de PDF-export
(`export-pdf-visual-volwassenheidsscan.md`), de InDesign-export
(`export-indesign.md`, `groepsScores`) en de CSV-export
(`export-csv.md`, `overall_score`/`groepsScores`). Wijkt de score op
één van die plekken af van de andere, dan is dat per definitie een
bug in die ene plek, niet een tweede, losstaande berekening.

**Gemiddelde over een groep leden (benchmark).** Voor een gemiddelde over een
groep telt elk lid even zwaar, ongeacht het aantal respondenten daaronder. Dit
geldt voor de benchmark op alle niveaus (`benchmark.md`). Een lid is een
organisatie met haar Meting (niveau 1), een Meting (niveau 2) of een afgeronde
scan (niveau 3).

- Per lid wordt eerst het gemiddelde antwoord per vraag genomen over de
  afgeronde scans, en daarna het gemiddelde van die waarden over de leden.
- Op die gemiddelden werkt dezelfde scorefunctie als hierboven, met
  `Bouwsteen.gewicht`. Omdat de berekening lineair is, geeft dit hetzelfde
  als het gemiddelde van de scores van de leden. Er komt dus geen
  tweede rekenmethode bij.
- De leden horen bij hetzelfde Assessment. Een lid zonder afgeronde scan
  telt niet mee.
- Een samengestelde Meting volgt dezelfde regel: De onderliggende
  Metingen zijn de leden en elke Meting telt één keer mee, ongeacht het aantal
  scans. Team A met 5 scans en totaalscore 3,0 en Team B met 40 scans en totaalscore 4,0
  geven samen 3,5. Per scan gewogen zou het 3,9 zijn, en die variant bestaat
  niet.

### Toegangscode

De interne lijst achter de persoonlijke links. Eén link per respondent,
niet per ingevulde scan: De link blijft werken zolang de respondent
bestaat, ook als een van zijn scans wordt verwijderd.

```
Toegangscode {
  code: string                      // kort en willekeurig, zie hieronder
  respondentId: string
  aangemaaktOp: datetime
}
```

- **Formaat**: 10 tekens uit een alfabet zonder verwarrende tekens (geen
  0/O, 1/l/I), bijv. `k7m2p9xq4r`. Gegenereerd met een cryptografisch
  veilige random-functie, nooit afgeleid van een id, e-mailadres of naam.
- **De link bevat alleen de code**, bijv. `/s/k7m2p9xq4r`: Geen id's,
  geen e-mailadres, geen naam en geen organisatiegegevens, ook niet
  gecodeerd.
- **Codes zijn uniek.** Wordt een respondent verwijderd, dan verdwijnt
  ook zijn code, en werkt de link niet meer.
- **Wat de link opent**: Zie `schermen.md`, Mijn metingen
  (Openen van de persoonlijke link).

E-mailverificatie bij het
openen van de link (code per mail, 15 minuten geldig) hoort bij de backend
en de Coniche-mailserver (`backlog.md`).

### Verwijderen en datakoppelingen

Na elke verwijderactie blijft er geen data achter die naar iets
verwijst wat niet meer bestaat.

- **Ingevulde scan**: Alleen die ene invulling, met antwoorden en
  opmerkingen. De respondent, zijn link en zijn andere invullingen
  blijven bestaan.
- **Respondent**: De respondent, zijn toegangscode en al zijn
  invullingen.
- **Meting**: De meting en alle invullingen daarbinnen, en haar koppeling met een Adviesverloop. Het Adviesverloop en zijn Adviesstappen blijven bestaan; `startMetingId` en `peilMetingId` die naar de Meting wijzen worden de eerstvolgende gekoppelde Meting, en de `metingId` van een Adviesstap wordt `null`. Is het de enige gekoppelde Meting, dan kan ze niet worden verwijderd zolang het Adviesverloop bestaat. Respondenten
  en het Onderdeel van de Meting blijven bestaan.
- **Onderdeel**: Alleen als er geen Meting en geen Adviesverloop
  aan hangt. De KPI-waarden van het Onderdeel verdwijnen mee, en de
  bevestiging noemt het aantal.
- **Kanaal**: Het kanaal met al zijn
  KPI-waarden, bij alle Organisaties. De bevestiging noemt het aantal
  waarden en het aantal Organisaties.
- **Organisatie**: Alles wat eronder hangt: Metingen, respondenten,
  toegangscodes, invullingen, antwoorden en opmerkingen, en Onderdelen en KPI-waarden, en
  Contactpersonen, het Dossier en de Adviesverlopen. Het
  assessment-type en de content blijven staan.
- **Organisatie die in een Case voorkomt**:
  De Cases bij andere Organisaties die naar haar verwijzen krijgen
  `caseOrganisatieId: null` en worden onzichtbaar voor de Lead. De
  bevestiging noemt het aantal (`dossier.md`, Verwijderen en datakoppelingen).
- **Assessment**: Alleen als er geen enkele Meting van dit Assessment
  bestaat, bij welke organisatie dan ook (ook geen Meting zonder scans).
  Bestaat er wel een Meting, dan kan het Assessment niet worden verwijderd,
  ook niet door een Admin. Er is geen tussenvorm waarin de Metingen
  meegaan. De Admin verwijdert eerst zelf alle Metingen van dit Assessment
  (en zo nodig de Organisaties), en kan het Assessment daarna verwijderen.
  Zonder Metingen bestaan er geen scans, antwoorden of benchmarkleden van
  dit Assessment, dus er verdwijnt alleen de definitie: Het Assessment, zijn
  Categorieën, Bouwstenen, Vragen en Schaallabels, ook de gearchiveerde.
  Dit kan niet ongedaan worden gemaakt, en de bevestiging zegt dat.

Verwijzingen naar een verwijderd Assessment worden opgeruimd. Bij een ander
Assessment dat ervan is afgeleid, wordt `afgeleidVanAssessmentId` `null` (het
is alleen herkomstinformatie, zie Sector-varianten). Staat het Assessment in
`Benchmark.assessmentIds`, dan valt het daar weg en meldt de benchmark dat
(`Benchmark.meldingen`). De kaart op de publieke keuzepagina en de
landingspagina van het Assessment verdwijnen.

Een benchmark (Deel 2) verwijst naar organisaties en Metingen. Een Lead
krijgt een view van een benchmark via een `LeadToegang` met `weergave:
"benchmark"` (`benchmark.md`, View voor een Lead). Verdwijnt een van die
records, dan verdwijnt ook de verwijzing.

- Een Meting weg haalt het lid uit de benchmark en haalt alle `LeadToegang` van
  die Meting weg (`resultaten` en `antwoorden`).
- Een Organisatie weg haalt haar leden weg en alle `LeadToegang` van haar
  Leads.
- Een Respondent met Lead-rol weg haalt zijn `LeadToegang` weg. Verliest een
  Respondent de Lead-rol, dan vervalt ook al zijn `LeadToegang`.
- Een Benchmark weg haalt de vinkjes van Leads voor die benchmark weg.
- Verliest een Lead zijn `resultaten` voor een Meting, dan vervallen ook zijn
  `spreiding`, `antwoorden` en `exporteren` voor die Meting. Was dat zijn laatste lid-Meting van een
  benchmark binnen een organisatie (niveau 2), dan vervalt ook zijn vinkje
  voor die benchmark.
- Een verwijderde ingevulde scan haalt geen lid weg maar verandert wel de
  cijfers. De benchmark zelf blijft bestaan.

### Content bewerken

Een vraag of bouwsteen waar al antwoorden aan hangen, wordt niet
verwijderd maar gearchiveerd (`gearchiveerd: true` op Categorie,
Bouwsteen of Vraag). Anders verdwijnen scores uit eerdere invullingen.
Nieuwe invullingen krijgen gearchiveerde content niet meer te zien.
Scores en exports van bestaande invullingen rekenen nog wel met die
content. In beheer is gearchiveerde content terug te zetten met
"Herstellen".

### Algemene teksten

Losse stukken tekst in de app die niet bij één Assessment horen (dus
geen `Bouwsteen`/`Vraag`/`Categorie`), en die anders hardcoded in de
code zouden staan. Generiek in plaats van een apart veld per tekst, zodat
er telkens gewoon een rij bijkomt in plaats van een nieuw datamodel-veld:

```
AlgemeneTekst {
  sleutel: string                   // bijv. "mijnMetingenIntro"
  waarde: string
}
```

Eerste en enige nu: `mijnMetingenIntro`, de introtekst boven de lijst
met scans op "Mijn metingen" (`schermen.md`, Mijn metingen). Eén
tekst voor iedereen, niet per Assessment of per organisatie: Die pagina
toont immers alle scans van een respondent door elkaar, ongeacht
scan-type. Beheerbaar bij `beheerpagina.md` punt 2a, Algemene teksten. Ook de
teksten achter de Info-iconen zijn Algemene teksten, met sleutels als
`info.bewaartermijn` (`beheerpagina.md`, punt 2a).

### Organisatievelden

Instelbaar in beheer, nu als vaste data (JSON), zodat het beheerscherm er
later overheen kan zonder de flow te herbouwen. De lijst geldt voor het hele
platform (`data/organisatie-velden.ts`) en verschilt dus niet per Assessment.

```
VeldDefinitie {
  id: string
  label: string
  type: "tekst" | "getal" | "select" | "select-afhankelijk" | "select-met-verdeling" | "percentage" | "groep"
  opties?: string[]                 // vaste antwoordcategorieën
  eigenOptie?: boolean              // alleen "select": naast `opties` ook "Anders…" met een invoerveld, zie Techstack
  voorop?: string[]                 // alleen "select" met `eigenOptie`: opties die bovenaan staan, in deze volgorde (bijv. "Geen ondersteuning")
  eigenOptiePlaceholder?: string    // alleen "select" met `eigenOptie`: hint in het invoerveld bij "Anders…"
  afhankelijkVan?: string           // alleen "select-afhankelijk": id van het broer-veld waarvan de keuze de lijst hier bepaalt
  optiesPerWaarde?: { [waarde: string]: string[] } // alleen "select-afhankelijk"
  subvelden?: VeldDefinitie[]       // voor herhalende structuren
  eenheid?: string // weergave-eenheid bij getal en percentage, bijv. "s" of "%", gebruikt door Verkennen bij de drempel
}
```

**Korte namen** (`visualisatie-verkennen.md`, Korte namen). Een korte naam is een weergavenaam naast het origineel. De Organisatie bewaart altijd de originele waarde.

```
KorteNaam {
  veldId: string       // id van het veld waar de waarde bij hoort (bij een subveld de id van het subveld)
  waarde: string       // de originele waarde, zoals ze in `Organisatie.kenmerken` staat
  korteNaam: string    // maximaal 30 tekens, uniek binnen het veld (hoofdletterongevoelig)
}
```

- Verkennen leidt kenmerken en groeperingen af uit `type` en heeft geen vlag per veld nodig (`visualisatie-verkennen.md`, Kenmerken en filters).
- Een veldnaam heeft zijn korte naam in `VeldDefinitie.korteNaam`. `KorteNaam` is er voor waarden.
- Een lege of ontbrekende korte naam betekent het origineel.
- De rij hoort bij de combinatie van veld en waarde. Bij een waarde via "Anders…" ontstaat de rij pas zodra een Admin een korte naam invult. Verdwijnt de waarde uit de lijst en uit alle Organisaties, dan kan de rij weg (Data-integriteit, `beheerpagina.md`, punt 13).
- De korte naam staat in Verkennen, in het organisatie-detail (het organisatiepaneel en de keuzelijsten Sector en Subsector in het formulier, met het origineel in de tooltip) en in andere schermen waar ruimte krap is. Hij staat niet in de exports, de import en de PDF, want daar blijft het origineel staan.
- Wijzigen vraagt `content.beheren` (alleen Admin) en wordt gelogd (zie Audit).
- **Opslag.** De korte namen staan niet op de definities (`organisatie-velden.ts` is vaste data) maar bij de
  instellingen: `Instellingen.korteNamen = { velden: { [veldId]: string }, waarden: KorteNaam[] }`, met het veld-id als pad
  met punten (`kpis.aht`).

**Sector en subsector**
- Sector (select, vaste lijst: De SBI-hoofdindeling, `opties` in
  `sbi-indeling.md`)
- Subsector (`select-afhankelijk`, afhankelijk van Sector: Toont alleen
  de Afdelingen die onder de gekozen Sectie vallen, `optiesPerWaarde` in
  `sbi-indeling.md`. Uitgeschakeld zolang Sector nog leeg is; wijzigt
  Sector achteraf, dan wordt een al gekozen Subsector gewist.
  **Afwijking van een eerdere versie van dit document**: Die koos
  bewust géén cascading-select, die keuze is teruggedraaid zodra bleek
  dat een platte lijst van 87 Afdelingen in de praktijk onwerkbaar is,
  zie `sbi-indeling.md`)

**Volume en klantbasis**
- Totaal aantal klanten (getal, met B2B/B2C-verdeling als percentage)
- Contacten per jaar per kanaal: Staan bij de KPI's (KPI's en kanalen, hieronder).
- Adoptie mijnomgeving/app (percentage)

**Digitalisering**
- Percentage 2026 (getal)
- Ambitie 2030 (getal)

**Techstack**, zes categorieën, in deze volgorde in het formulier: Contact
center, WFM, CRM, Kennismanagement, Conversational AI en LLM-oplossing. Er is
geen aparte categorie "IT en deployment" meer: Deploymentmodel en
Cloudleverancier staan als velden bij de categorieën. Modelleer dit als één
herbruikbaar `TechstackItem { categorie, leverancier, ondersteuner,
deploymentmodel, cloudleverancier, toegangsroute }`. De vaste keuzes en de
partijen staan in `content-techstack.md`. Die lijsten worden hier niet
herhaald.

- **Contact center, WFM, CRM, Kennismanagement en Conversational AI**:
  `leverancier` (Oplossing), `ondersteuner` ("Geen ondersteuning" of een
  partij), `deploymentmodel` en `cloudleverancier`. Alle vier staan op één
  regel, in deze volgorde. Zelf of extern (`ondersteuning`) volgt uit
  `ondersteuner` en wordt alleen voor de exports afgeleid.
- **LLM-oplossing**: Alleen `leverancier` (de modelfamilie) en
  `toegangsroute`. Geen Ondersteund door, Deploymentmodel en
  Cloudleverancier.

**Keuzelijsten met "Anders…"** (`select` met `eigenOptie`). Bij alle zes de
categorieën is de Oplossing een keuzelijst, en ook Ondersteund door,
Deploymentmodel, Cloudleverancier en de toegangsroute. Regels:

- De lijst staat op alfabet (hoofdletterongevoelig), met "Anders…" onderaan.
  Is een lijst in een logische volgorde aangeleverd (Deploymentmodel,
  Cloudleverancier, de LLM-lijsten), dan blijft die volgorde (`voorop`) en komt
  eigen invoer daarna op alfabet.
- Kiest iemand "Anders…", dan verschijnt een invoerveld. De invoer wordt
  bewaard bij Enter of bij het verlaten van het veld. De hint is per veld
  (`eigenOptiePlaceholder`), bijvoorbeeld "Naam van de partij".
- De invoer wordt getrimd. Komt hij hoofdletterongevoelig overeen met een
  bestaande optie, dan geldt de spelling van die optie.
- De ingevulde tekst wordt als gewone waarde bij de organisatie opgeslagen en
  staat daarna in de lijst van alle organisaties, per categorie en per veld.
  Er is geen aparte lijst met toegevoegde opties: De lijst is de vaste lijst
  plus wat organisaties daar hebben ingevuld. Gebruikt geen enkele organisatie
  de waarde nog, dan verdwijnt hij weer uit de lijst.

**Ondersteund door.** De eerste keuze is altijd "Geen ondersteuning": De
organisatie ondersteunt de oplossing zelf. Daarna volgen de partijen van die
categorie op alfabet en onderaan "Anders…". `ondersteuning` ("zelf" of
"extern") wordt niet ingevuld maar afgeleid: "Geen ondersteuning" geeft
`zelf`, een partij geeft `extern`, zonder keuze is het leeg. De
InDesign-export (`export-indesign.md`) houdt daarmee zijn attribuut
`ondersteuning`. Bestaande data wordt bij het laden omgezet: `zelf` wordt
"Geen ondersteuning". Een oude waarde `extern` zonder bekende partij blijft
staan tot er een partij wordt gekozen, en de export gebruikt dan de oude
waarde.

**LLM-oplossing.** Wijkt af van de andere categorieën. `ondersteuning`
bestaat hier niet, dus de InDesign-export geeft voor het attribuut
`ondersteuning` altijd "n.v.t.". De toegangsroute, de gekozen partij, het
deploymentmodel en de cloudleverancier zitten nog niet in de InDesign-export
(`export-indesign.md`), wel in de CSV in de JSON-kolom met de kenmerken.

WFM staat in het formulier direct onder Contact center. De InDesign-export
heeft daarvoor het element `techstackWfm`, en het element
`techstackItDeployment` is vervallen (`export-indesign.md`).

**FTE**
- Klantcontactmedewerkers (getal, met inhouse/BPO-verdeling)
- Klantcontact management & support (een groep met het veld Aantal FTE, zoals
  IT DevOps. Een bestaande waarde zonder groep wordt bij het laden `{ aantal }`)
- IT DevOps-medewerkers (getal, met percentage gericht op Digital)

**KPI's.** De KPI's zijn geen organisatievelden. Ze staan hieronder bij KPI's en kanalen: AHT, NPS, CSAT, SLA, FTR en CES (veld-id `kpis.aht` enzovoort).
Verkennen gebruikt ze als filter, als groepering (AHT met een
drempel) en als as in het spreidingsdiagram (`visualisatie-verkennen.md`,
KPI's als kenmerk).

### KPI's en kanalen

Ontwerp: `Claude outputs/kpi-design/`. Een KPI-waarde hoort bij een plek: De
hele organisatie, een Onderdeel, of een kanaal binnen een van die twee. Je vult
alleen in wat je weet.

```
Kanaal {
  id: string
  naam: string                      // uniek, hoofdletterongevoelig
  volgorde: number
}

KpiDefinitie {
  id: string                        // bijv. "aht", gebruikt in het pad `kpis.aht`
  naam: string
  eenheid: string | null            // bijv. "s", "%" of "aantal"
  perOnderdeel: boolean             // mag een waarde per Onderdeel hebben
  perKanaal: boolean                // mag een waarde per kanaal hebben
  schaalMin: number | null          // ondergrens van de ring bij de Lead, null = geen ring
  schaalMax: number | null          // bovengrens van de ring bij de Lead, null = geen ring
  volgorde: number
}

KpiWaarde {
  organisatieId: string
  onderdeelId: string | null        // null is Algemeen, de hele organisatie
  kanaalId: string | null           // null is Algemeen, alle kanalen samen
  kpiId: string
  waarde: number
}
```

- **Algemeen.** `onderdeelId: null` is Algemeen bij de plek en `kanaalId: null`
  is Algemeen bij het kanaal. De waarde Algemeen bij Algemeen is wat tot nu toe
  het enige KPI-veld was.
- **Algemeen is een gewone waarde.** De app rekent hem niet uit de onderdelen of
  de kanalen en overschrijft hem nooit. Een gebruiker vult Algemeen in zolang de
  details onbekend zijn. Komen die er, dan vervangt de gebruiker hem zelf of
  laat hem staan. Er is geen weging op volume.
- **Eén waarde per combinatie.** Uniek op Organisatie, Onderdeel, kanaal en
  KPI. Een lege cel is geen record, en een cel leegmaken verwijdert het record.
  0 is een geldige waarde. De waarde is een getal, met een komma of een punt als
  decimaalteken bij invoer.
- **Wat een KPI mag.** `perOnderdeel` en `perKanaal` bepalen op welke plekken
  een waarde kan staan. Een KPI zonder `perKanaal` heeft alleen het kanaal
  Algemeen. Een Admin kan een vlag niet uitzetten zolang er waarden op dat
  niveau staan. Het vinkje staat dan uitgeschakeld, met de reden en het aantal
  waarden.
- **Eenheid.** Tekst of leeg. De eenheid staat als subregel onder de KPI-naam in
  de invoertabel, behalve bij "aantal" en bij een lege eenheid, en dient als
  eenheid bij de drempel in Verkennen (`VeldDefinitie.eenheid` doet dat nu).
- **Kanalen.** Eén lijst voor het hele platform, beheerd door een Admin
  (`content.beheren`). Startwaarde: Call, Voicebot, Livechat, Chatbot, E-mail en
  Whatsapp, in deze volgorde. Een kanaal telt als ingezet bij een waarde boven 0
  voor de KPI Contacten per jaar (`visualisatie-verkennen.md`, Ingezette
  kanalen). Een leeg veld is onbekend en telt niet als "niet ingezet".
- **Schaal.** `schaalMin` en `schaalMax` bepalen hoe ver de ring van de KPI gevuld is in het blok KPI's van het Profiel voor de Lead (`dossier.md`, KPI-ringen). Een KPI zonder schaal krijgt geen ring. Startwaarden: AHT 0 tot 600 (s), NPS -100 tot 100, CSAT 1 tot 10, SLA 0 tot 100 (%), FTR 0 tot 100 (%) en CES 1 tot 7. Contacten per jaar heeft geen schaal, want die staat in de cijferrij. Een Admin past ze aan bij de KPI-definitie, en `schaalMin` moet kleiner zijn dan `schaalMax`.
- **Startset KPI's**, aanpasbaar door een Admin: Contacten per jaar (aantal, per
  Onderdeel, per kanaal), AHT (s, per Onderdeel, per kanaal), NPS (geen eenheid,
  per Onderdeel, per kanaal), CSAT (geen eenheid, per Onderdeel, per
  kanaal), SLA (%, per Onderdeel, per kanaal), FTR (%, per Onderdeel, per
  kanaal) en CES (Customer Effort Score, geen eenheid, per Onderdeel, per kanaal).
- **NPS per kanaal.** Het kanaal waar het contact plaatsvond, bepaalt waar de uitvraag vandaan komt, en de uitkomst wordt onder dat kanaal gerapporteerd. Algemeen is het gemiddelde cijfer en een kanaalcijfer is de NPS van alleen dat kanaal. Beide kunnen naast elkaar bestaan en Algemeen wordt niet uit de kanalen berekend (zie Algemeen is een gewone waarde).
- **Korte naam.** Een KPI heeft een korte naam zoals een organisatieveld. Hij
  staat in `Instellingen.korteNamen.velden` onder het pad `kpis.<id>`, dus een
  bestaande korte naam van `kpis.aht` blijft werken. Wijzigen wordt gelogd als
  `korteNaam.gewijzigd`.
- **Geen tijd.** Een waarde heeft geen peildatum. De huidige waarde telt. Een
  peildatum komt later (`backlog.md`). De sleutel wordt dan uitgebreid en
  bestaande waarden krijgen een lege datum.
- **Recht en slot.** Waarden invullen vraagt `organisaties.bewerken` en neemt het
  Bewerkslot van de Organisatie. De definities van KPI's en kanalen vragen
  `content.beheren`.

**Gevolgen voor andere specs.**

- `export-csv.md`: De kolom `onderdeel` blijft de naam van het Onderdeel.
  `organisatie_kenmerken` bevat de KPI's en de contacten per kanaal niet meer.
  Een JSON-kolom `organisatie_kpis` met een lijst van onderdeel,
  kanaal, KPI en waarde, naast `organisatie_kenmerken`.
- `import-scans.md`: De kolom `onderdeel` zoekt het Onderdeel bij de Organisatie
  of stelt een nieuw voor (Onderdeel uit het label voorstellen). De kolom
  `organisatie_kpis` wordt teruggelezen, en bij een bestaande Organisatie
  overschrijft ze niets, zoals `organisatie_kenmerken`.
- `export-indesign.md`: De elementen `kpiAht`, `kpiNps`, `kpiCsat`, `kpiSla` en
  `kpiFtr` krijgen de waarde Algemeen bij Algemeen, zodat het sjabloon blijft
  werken. De elementen `contactenCall` tot en met `contactenWhatsapp` krijgen de
  waarde van de KPI Contacten per jaar bij dat kanaal, bij Algemeen. Een kanaal
  dat een Admin toevoegt, krijgt geen element zolang het sjabloon er niet om
  vraagt. Hetzelfde geldt voor een KPI die niet in het sjabloon staat, zoals CES. Waarden per Onderdeel volgen als het sjabloon ze vraagt.
- `benchmark.md` en `visualisatie-scores.md`: Waar ze het onderdeel van een
  Meting tonen of vergelijken, is dat de naam van het Onderdeel. Er verandert
  niets aan de regels.
- Help (`help.md`): De uitleg staat in `help/kpis-invullen.md` en
  `help/metingen-en-onderdelen.md`.

**Open punten.**

- Of "niet van toepassing" bij een kanaal een eigen stand moet blijven in plaats
  van 0.
- Het verwijderen van een KPI-definitie en het hernoemen van een kanaal staan
  niet in het design (`beheerpagina.md`, punt 3, KPI's en kanalen).

---

### Adviesverloop

Het adviesverloop van een Organisatie, of van een Onderdeel daarvan (`adviesverloop.md`): De voortgang door de zes fasen, de shortlist en de gedane stappen. Een Meting is de aanleiding en de bron van de scores, maar het adviesverloop hoort bij de Organisatie. Er kunnen in de loop van het traject Metingen bijkomen. De fasen, use cases en rollen zijn data die een Admin beheert (`beheerpagina.md`, punt 17).

```
Fase {
  id: string                       // "1" tot en met "6"
  volgorde: number
  naam: string                     // bijvoorbeeld "Oplossen & Ontwerpen"
  korteNaam: string                // bijvoorbeeld "Oplossen"
}

AdviesRol {
  id: string                       // "consultant" | "salesmanager" | "teamleider", uitbreidbaar
  naam: string                     // "Consultant", "Salesmanager", "Teamleider (interim)"
  standaardTekst: string           // de beginwaarde van de tekst van de rol in het AdviesProfiel van een nieuwe Consultant, maximaal 600 tekens
  volgorde: number
}

AdviesProfiel {
  gebruikerId: string              // Gebruiker.id, één per Admin of Consultant, bij de eerste keer openen van Mijn account of van een adviesverloop gevuld uit de AdviesRollen
  overMij: string                  // de tekst "Over mij", maximaal 600 tekens, mag leeg zijn
  standaardRolId: string           // AdviesProfielRol.id, de rol die een nieuw adviesverloop voorselecteert
  rollen: AdviesProfielRol[]       // minstens één
}

AdviesProfielRol {
  id: string
  naam: string                     // vrij, maximaal 60 tekens, bijvoorbeeld "Consultant" of "Teamleider (interim)"
  tekst: string                    // wie je bij deze klant bent, maximaal 600 tekens, mag leeg zijn
  adviesRolId: string | null       // de AdviesRol waarvan de prompts van de use cases worden gebruikt; null bij een zelf toegevoegde rol, dan telt de prompt van de rol Consultant
  volgorde: number
}

UseCase {
  id: string                       // code, bijvoorbeeld "4-1"
  faseId: string
  titel: string                    // verplicht, maximaal 120 tekens
  omschrijving: string             // maximaal 400 tekens
  apps: string[]                   // "copilot" | "word" | "excel" | "powerpoint"
  inStrook: boolean                // telt mee als stap in de fasestrook, standaard false
  volgorde: number
  bouwsteenIds: string[]           // voorgesteld bij deze bouwstenen, mag leeg zijn
  klassen: string[]                // voorgesteld bij een klasse: "basis" | "uitbouwen" | "sterk", mag leeg zijn
  prompts: UseCasePrompt[]         // hoogstens één per rol
}

UseCasePrompt {
  rolId: string                    // AdviesRol.id
  context: string                  // beschrijft de situatie van de rol bij deze use case
  prompt: string                   // de vraag aan Copilot
}

Adviesverloop {
  id: string
  organisatieId: string
  onderdeelId: string | null       // null is "Hele organisatie", zoals bij de Meting
  status: "lopend" | "afgerond"
  afgerondOp: datetime | null
  startMetingId: string            // de Meting waarmee het Adviesverloop is geopend
  benchmarkId: string | null       // de Benchmark die Metingen van verschillende Assessments verbindt, alleen ingevuld als er Metingen van meer dan één Assessment gekoppeld zijn
  peilMetingId: string | null      // de Meting waarvan de scores de shortlist bepalen, null is de meest recente gekoppelde Meting met afgeronde scans
  aangemaaktDoor: string           // Gebruiker.id
  aangemaaktOp: datetime
  shortlistBouwsteenIds: string[] | null // de door de Consultant gekozen shortlist, in de gekozen volgorde; null is de standaard (de laagste scores)
  nvFaseIds: string[]              // fasen die de Consultant heeft overgeslagen
  nvUseCaseIds: string[]           // use cases die de Consultant niet van toepassing heeft verklaard
  rolId: string                    // gekozen AdviesProfielRol van de Consultant die het adviesverloop bewerkt, de tekst staat in het AdviesProfiel en niet bij het adviesverloop
}

AdviesverloopMeting {
  adviesverloopId: string
  metingId: string                 // een Meting hoort bij hoogstens één Adviesverloop
  label: string | null             // vrije aanduiding, bijvoorbeeld "Nulmeting", "Tussenmeting" of "Eindmeting", maximaal 40 tekens
  gekoppeldOp: datetime
  gekoppeldDoor: string            // Gebruiker.id
}

Adviesstap {
  id: string
  adviesverloopId: string
  useCaseId: string
  status: "promptGekopieerd" | "gedaan"
  bouwsteenId: string | null       // de bouwsteen waarvoor de stap is gedaan
  metingId: string | null          // de Meting waarvan de scores in het contextblok zaten
  link: string                     // http of https, mag leeg zijn
  gedaanOp: datetime
  gedaanDoor: string               // Gebruiker.id
}
```

- **Bereik.** Een Adviesverloop hoort bij een Organisatie en een Onderdeel (of de hele Organisatie), niet bij een Meting. Per Organisatie en Onderdeel is er hoogstens één lopend Adviesverloop. Een afgerond Adviesverloop blijft bestaan en een nieuw traject begint met een nieuw Adviesverloop.
- **Metingen koppelen.** De Meting waarmee het Adviesverloop wordt geopend is de eerste gekoppelde Meting. Daarna kan de Consultant andere Metingen van dezelfde Organisatie en hetzelfde Onderdeel koppelen en weer loskoppelen, gewone en samengestelde Metingen (een samengestelde Meting telt als afgerond als haar onderliggende Metingen voldoen), zoveel als bij het traject passen, maar er is altijd minstens één gekoppelde Meting: Loskoppelen van de laatste kan niet. Het `label` is een hulpmiddel en geen vaste indeling: Er is geen verplichte nulmeting, tussenmeting of eindmeting, en de app dwingt geen volgorde of aantal af. De volgorde in de tijd volgt de meetdatum van de Meting.
- **Ander Assessment.** Een Meting van een ander Assessment dan de eerste gekoppelde Meting kan alleen gekoppeld worden als de Organisatie lid is van een Benchmark waarin beide Assessments zitten. De Consultant kiest die Benchmark (`benchmarkId`) uit de Benchmarks die aan die eis voldoen; is er maar één, dan wordt die voorgesteld. Verdwijnt de Benchmark, of gaat de Organisatie eruit, dan worden de Metingen van het andere Assessment losgekoppeld en noemt de bevestiging dat. Scores van verschillende Assessments worden niet gemengd, dus het verschil met de eerste Meting wordt alleen getoond tussen Metingen van hetzelfde Assessment.
- **Peilmeting.** De Meting die de scores levert voor de shortlist en het contextblok. Standaard de meest recente gekoppelde Meting met afgeronde scans (`peilMetingId: null`). De Consultant kan een andere kiezen.
- **Shortlist.** Standaard (`shortlistBouwsteenIds: null`) zijn dat de `shortlistAantal` bouwstenen met de laagste score van de peilmeting (`Instellingen`, Drempels en termijnen), op volgorde van score en bij gelijke score op nummer. Die lijst wordt afgeleid en niet opgeslagen, dus een score die verandert, verandert de shortlist. Kiest de Consultant zelf, dan wordt de lijst met bouwstenen en hun volgorde opgeslagen in `shortlistBouwsteenIds` en volgen latere scorewijzigingen de lijst niet meer. Bouwstenen toevoegen, weghalen en verplaatsen kan vrij, de lijst mag leeg zijn (dan is er niets uit te werken), en "Standaard herstellen" zet het veld terug op null. Bouwstenen die met een nieuwe peilmeting niet meer bestaan, vallen weg.
- **Niet van toepassing.** De Consultant kan een hele fase overslaan (`nvFaseIds`) en een use case niet van toepassing verklaren (`nvUseCaseIds`). Beide zijn omkeerbaar. Een use case waarvoor al een `Adviesstap` bestaat, kan niet n.v.t. worden verklaard, zet de stap eerst terug naar open. Een fase die is overgeslagen telt niet mee in de huidige fase en in de voortgang; een fase waarvan alle use cases n.v.t. zijn, gedraagt zich net zo.
- **Een stap telt als gedaan** bij de statussen `promptGekopieerd` en `gedaan`. Terugzetten naar open verwijdert de `Adviesstap`. Use cases in `nvUseCaseIds` tellen niet mee in de totalen.
- **Huidige fase** is de eerste fase die niet is overgeslagen, met een `UseCase` met `inStrook` die niet n.v.t. is en waarvoor nog geen `Adviesstap` bestaat. Dit wordt afgeleid, er is geen veld voor.
- **Aanmaken** bij het eerste openen vanaf een Meting met afgeronde scans. Een Meting zonder afgeronde scans kan geen Adviesverloop starten. Bestaat er voor de Organisatie en het Onderdeel al een lopend Adviesverloop, dan stelt de app voor de Meting daaraan te koppelen.
- **Afronden.** De Consultant zet het Adviesverloop op `afgerond`. Daarna zijn shortlist, stappen en koppelingen alleen nog te lezen, en kan een nieuw Adviesverloop beginnen. Heropenen kan.
- **Wat niet wordt opgeslagen.** De inhoud van de prompt en het contextblok. Alleen de `Adviesstap` en een eventuele link.
- **Adviesverloop verwijderen.** Het Adviesverloop met zijn koppelingen en Adviesstappen. De Metingen blijven bestaan. De bevestiging noemt het aantal stappen. Een Admin mag het van alle Organisaties, een Consultant van zijn eigen (zelf aangemaakt of toegewezen).
- **Content en rechten.** `Fase`, `AdviesRol` en `UseCase` volgen de regels van Content bewerken: Alleen een Admin beheert ze.
- **Adviescontext per Consultant.** Het `AdviesProfiel` is persoonlijk: Alleen de eigenaar leest en wijzigt het, ook een Admin ziet dat van een ander niet. Het wordt bewerkt in Mijn account, tab Adviescontext (`beheerpagina.md`). Het bevat geen namen van klanten of personen en wordt niet in het audit-log gelegd. De rollen starten als kopie van de `AdviesRol`-records. Een latere wijziging van de `standaardTekst` door een Admin verandert bestaande profielen niet. Verwijdert de Consultant een rol die een adviesverloop gebruikt, dan valt dat adviesverloop terug op de standaardrol. De laatste rol kan niet verwijderd worden. Het profiel verdwijnt met de Gebruiker.

---

## Deel 2: Benchmark

Een benchmark zet de
scores van een zelf gekozen groep naast elkaar. Het gedrag staat in `benchmark.md`, de
schermen in `beheerpagina.md`, punt 14. Hier staan de records, de
uitbreiding op Organisatie en de instellingen.

Scores worden ook hier berekend en nooit opgeslagen (Scoreberekening in
deel 1). Een benchmark slaat alleen de samenstelling op, dus welke leden
(organisaties met een Meting, of Metingen) meedoen.

### Benchmark

```
Benchmark {
  id: string
  naam: string                      // vrije tekst, bepaalt de Admin
  assessmentIds: string[]           // één of meer
  leden: BenchmarkLid[]             // leeg bij soort "verkenning", de leden volgen uit de filters
  meldingen: { tekst: string, op: datetime }[] // schermmeldingen, zie hieronder
  niveau?: "organisaties" | "metingen" | "scans"
                                    // ontbreekt = "organisaties"
  lezing?: "ontwikkeling" | "naastElkaar" // alleen bij niveau "metingen"; ontbreekt het veld, dan volgt ze uit de leden (zie hieronder)
  soort?: "vasteGroep" | "verkenning" // alleen bij niveau "organisaties"; ontbreekt = "vasteGroep"
  eenheid?: "organisaties" | "onderdelen"
                                    // alleen bij soort "verkenning"
  filters?: { kenmerk: string, waarden: string[] }[]
                                    // alleen bij soort "verkenning", minstens één; kenmerk is een veld uit de organisatievelden
  meetperiode?: { van: date, totEnMet: date } // alleen bij soort "verkenning"; ontbreekt = per lid telt de meest recente Meting
  aangemaaktOp: datetime
  aangemaaktDoor: string            // Gebruiker
}

BenchmarkLid {
  organisatieId: string
  assessmentId: string              // een van assessmentIds
  metingId: string                  // een Meting van deze organisatie en dit Assessment
}
```

`BenchmarkToewijzing` bestaat niet
meer. Een view voor een Lead is een `LeadToegang` met `weergave:
"benchmark"` (`datamodel-rollen.md`, Audit).

Op niveau "organisaties" heeft een organisatie per benchmark per Assessment
hoogstens één lid. Het sectorfilter bij het samenstellen wordt niet
opgeslagen.

**`meldingen`** is wel opgeslagen, maar geen inhoud van de
benchmark. Het zijn korte teksten voor de beheerweergave, bijvoorbeeld "{naam}
is uit de benchmark gehaald: De Meting is verwijderd". Ze ontstaan als een lid
automatisch wegvalt (zie Verwijderen en datakoppelingen). Een Admin klikt ze
weg, en een wijziging van de samenstelling wist ze. Ze bevatten alleen namen
van organisaties, geen scores of persoonsgegevens, en ze blijven alleen
bestaan zolang de benchmark bestaat.

**`niveau`** bepaalt wat een lid is, zie `benchmark.md`.

- `organisaties`: Een lid is een organisatie met een Meting per Assessment.
  Dit is de waarde als het veld ontbreekt, dus bestaande benchmarks hoeven
  niet te worden aangepast.
- `metingen`: Alle leden hebben dezelfde `organisatieId`. Per Assessment zijn
  er meerdere leden, elk met een andere Meting.
- `scans`: Eén lid, de Meting waarin de scans worden vergeleken. De scans
  zelf zijn geen leden, want ze volgen uit de Meting. Een view op een scan wordt
  niet aan een Lead gegeven (`benchmark.md`, View voor een Lead). Niveau 3 is een
  weergave voor de Admin.

**`soort`, `eenheid`, `filters` en `meetperiode`** (`benchmark.md`, Opgeslagen verkenning). Een benchmark met `soort: "verkenning"` slaat geen
leden op. De leden worden bij elk gebruik berekend uit `filters`, met de
poolregels van Verkennen. Bij `eenheid: "organisaties"` is een lid een
Organisatie, bij `onderdelen` een onderdeel. `assessmentIds` heeft bij een
verkenning precies één waarde. Het Assessment en de eenheid zijn niet te
wijzigen, de naam, de filters en de `meetperiode` wel. Per lid telt de laatste Meting
met een `meetdatum` in de periode (`benchmark.md`, Welke Meting telt waar). Bij
`eenheid: "onderdelen"` tellen alleen gewone Metingen met een onderdeel mee, nooit een
samengestelde Meting. Een periode is geen filter en telt niet mee voor de eis van minstens
één filter. De groepering, de focus en de drempel van
een getalkenmerk uit Verkennen worden niet opgeslagen. Voldoet een Organisatie
niet meer aan de filters, dan vervalt het vinkje van haar Leads (`LeadToegang`).

**`lezing`** zegt hoe de leden van een benchmark
op niveau `metingen` gelezen worden (`benchmark.md`, Niveau 2, Lezing). Bij
niveau `organisaties` en `scans` ontbreekt ze.

- `ontwikkeling`: Alle leden hebben hetzelfde onderdeel en verschillende
  meetdata. De volgorde is op meetdatum.
- `naastElkaar`: Geen regel voor het onderdeel. De volgorde is op de naam van
  de Meting. Meetdata die meer dan `benchmarkMaxDagenTussenMetingen` dagen uit elkaar
  liggen geven een waarschuwing bij opslaan, geen blokkade.

De Admin kan de lezing achteraf wijzigen. De controles lopen dan opnieuw.
Een benchmark die van vóór de lezing is en het veld niet heeft, krijgt haar
lezing uit de leden als volgt: Hetzelfde onderdeel en
verschillende meetdata geven `ontwikkeling`, in elk ander geval `naastElkaar`.
De opgeslagen waarde wint altijd.

### Uitbreiding op Organisatie

`Organisatie` krijgt `antwoordenMetNamen` (boolean, standaard false). Staat hij aan, dan ziet een Lead bij Antwoorden de namen
van de respondenten, en anders R1 tot en met Rn (`beheerpagina.md`, punt 6a).
Een Admin zet hem na afstemming met de opdrachtgever. De intake en het
toestemmingsvakje veranderen er niet door.

`Organisatie` krijgt ook `benchmarkToegestaan` (boolean, standaard false). Een
Admin zet de vlag nadat dit met de organisatie is afgesproken. Alleen
organisaties met de vlag kunnen in een benchmark worden opgenomen. Zie
`benchmark.md`, Toestemming en privacy.

`Organisatie` krijgt ook `caseToegestaan` (boolean, standaard false): De Afspraak "Mag als case gebruikt worden". Een Admin zet de
vlag nadat dit met de organisatie is afgesproken. Alleen met de vlag kan een
Case bij een andere Organisatie naar haar verwijzen en voor een Lead zichtbaar
zijn. Bestaande Organisaties beginnen met false. Zie `dossier.md`.

### Instellingen

Globale instellingen, door een Admin te bepalen in beheer
(`beheerpagina.md`, punt 10, Drempels en termijnen). `benchmarkMinOrganisaties` (startwaarde 5,
niveau 1) en `benchmarkMinScans` (startwaarde 3) Per
niveau een eigen drempel voor het aanvinken van een view voor een Lead,
`benchmarkMinRespondenten`
(startwaarde 5, het minimale aantal afgeronde scans in een Meting voor
Spreiding, voor anonieme Antwoorden en voor de lijn van laagste tot hoogste score bij een Lead).
Voor het spreidingslabel: `spreidingWisselend` (0,55) en `spreidingVerdeeld` (0,8) voor schaalscans, `spreidingWisselendQuickscan` (14) en `spreidingVerdeeldQuickscan` (20) voor de Quickscan, positieve getallen waarbij de tweede grens boven de eerste ligt (`beheerpagina.md`, formulier Spreiding).
Voor de testknop in de vragenlijst: `testknopAan` (boolean, standaard false, `beheerpagina.md`, Schakelaar Testknop).
Voor Verkennen: `verkennenMinGroep` (3), `verkennenMinVergelijking` (5),
`verkennenMinPool` (6), `verkennenMaxGroepen` (12) en `verkennenMinIngevuldPct` (40),
alle gehele getallen van minstens 1. Het percentage mag 0 zijn en loopt tot en met 100 (`visualisatie-verkennen.md`, Drempels). `benchmarkMinOrganisaties` geldt ook voor een opgeslagen verkenning en telt daar altijd Organisaties, ook bij de eenheid Onderdelen.
`benchmarkMaxDagenTussenMetingen` (startwaarde 90),
het aantal dagen waarboven een vergelijking met de lezing Naast elkaar een
waarschuwing geeft. De
betekenis staat in `benchmark.md`, Drempels en View voor een Lead.
