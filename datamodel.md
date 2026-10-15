# Coniche Scan: Datamodel

Enige bron voor het datamodel.

- **Deel 1: Gebouwd.** Content, organisatie, respondent, meting, ingevulde
  scan, toegangscode, organisatievelden, en de regels voor verwijderen.
- **Deel 2: Voorstel.** Rollen, rechten, inlog en audit. Wordt gebouwd
  samen met de Azure SQL-database; clientside zou het alleen schijnveiligheid
  opleveren.
- **Deel 3: Gebouwd en voorstel.** Benchmark. Het niveau tussen organisaties
  is gebouwd, de niveaus binnen een organisatie en binnen een Meting zijn
  voorstel. Het gedrag staat in `benchmark.md`, hier alleen de records en de
  uitbreiding op Organisatie.

Termen (Meting, Respondent, Ingevulde scan) staan in CLAUDE.md onder
Terminologie.

---

## Deel 1: Gebouwd

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
  icoon: string                     // sleutel in ASSESSMENT_ICONS (eigen SVG's, nu target, sparkle en heart, zie stylesheet.md, Assessment-icoon); valt terug op een letterlijke emoji als er geen SVG bij de sleutel is
  geschatteDuur: string             // bijv. "±30 minuten"
  categorieen: Categorie[] | null   // optioneel, zie hieronder
  bouwblokken: Bouwblok[] | null    // gebruikt als categorieen ontbreken
  scoresPerGroepGesorteerd: boolean // AI-scan sorteert op waarde, Klantcontact-scan niet
  schaal: SchaalLabel[5] | null     // per Assessment, zie hieronder; null bij antwoordType "ja-nee-weetniet"
  antwoordType: "schaal" | "ja-nee-weetniet" // standaard "schaal" (1–5), zie Antwoordtype
  instructieregel: string | null    // regel boven de vragen in de doorloopflow; leeg = de standaardtekst voor de 1–5-schaal
  relevantieVraag: string | null    // alleen als een Categorie optioneel is: de Ja/Nee-vraag bovenaan die categorie, zie Optionele categorieën
  pdfContentSecties: { titel: string, bron: ContentBron } | null // zie export-pdf-visual-volwassenheidsscan.md
  afgeleidVanAssessmentId: string | null // zie Sector-varianten hieronder
  bouwblokLabel: string             // eyebrow in de Toelichtingsmodal; standaard "Bouwsteen" (Klantcontact, Zorg), "AI-domein" bij de AI-scan
  bouwblokEenheidEnkelvoud: string  // enkelvoud van de eenheid in lopende tekst, bijv. "bouwsteen" of "domein"
  bouwblokEenheidMeervoud: string   // meervoud, bijv. "bouwstenen" of "domeinen"
  wegingTitel: string | null        // kop van de wegingskaart, zie Bouwblok.gewicht; leeg = standaardtitel
  wegingToelichting: string | null  // tekst van de wegingskaart, per Assessment aanpasbaar; leeg = standaardtekst
}
```

Niet elk scan-type heeft een categorie-laag. De Klantcontact
Volwassenheidsscan groepeert 15 bouwblokken in 5 categorieën, de
AI-volwassenheidsscan heeft 8 domeinen plat onder elkaar. Als
`categorieen` leeg is, tonen sidebar en resultatenpagina de bouwblokken
direct, zonder categoriekop. Maak geen kunstmatige categorieën met elk
één bouwblok.

### Sector-varianten

Een sector-variant (bijv. een Zorg-versie van de Klantcontact
Volwassenheidsscan) is een **eigen, volwaardig Assessment-record**,
geen schakelaar binnen één Assessment. Reden: Scherm 1 ("Kies jouw
assessment", CLAUDE.md sectie 3) toont kaarten per Assessment-type,
generiek over `Assessment[]` — een sector-variant moet daar als eigen
kaart verschijnen, met eigen `naam`/`kortLabel` (bijv. "Zorgscan"), dus
moet het een eigen record zijn. Een Meting koppelt aan precies één
Assessment (`assessmentId`), dus deze keuze sluit direct aan op het
bestaande model.

**`afgeleidVanAssessmentId`**: Verwijst naar het Assessment waarvan
deze variant is afgeleid (`null` bij een op zichzelf staand
Assessment, zoals nu de Klantcontact- en AI-volwassenheidsscan). Puur
herkomstinformatie voor beheer (bijv. "afgeleid van Klantcontact
Volwassenheid" tonen in de lijst) — geen lopende koppeling. Wordt het
template verwijderd, dan wordt het veld `null` en verdwijnt de regel
"Afgeleid van" (zie Verwijderen en datakoppelingen).

**Aanmaken = kopiëren, geen levende overerving.** Bij het aanmaken van
een sector-variant vanuit een template kopieert die actie alle
Categorieën, Bouwblokken en Vragen naar nieuwe, losse content-records
onder het nieuwe Assessment (nieuwe id's). Daarna zijn het gewone,
onafhankelijke content-records: Wijzig je een vraagtekst of een
`Bouwblok.gewicht` op de sector-variant, dan raakt dat alleen die
variant. Een latere correctie op het template werkt dus
niet automatisch door in bestaande sector-varianten — bewuste keuze,
om dezelfde reden als "Content bewerken" hieronder: Een sector-scan
die al ingevuld is, mag niet ongemerkt van betekenis veranderen omdat
iemand het template bijwerkt. Een generieke fix (bijv. een typo in een
vraagtekst die in alle varianten voorkomt) moet dus bewust in elke
variant apart worden doorgevoerd.

Wat er bij het kopiëren verandert, komt met het aanmaken van de eerste
sector-variant zelf aan bod (nog niet uitgewerkt): In elk geval de
vraagteksten en de gewichten per bouwblok, mogelijk ook
bouwbloktoelichtingen. De structuur (aantal bouwblokken, categorieën,
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
  bouwblokken: Bouwblok[]
}
```

### Bouwblok

```
Bouwblok {
  id: string
  volgnummer: number                // 1 t/m 15, volgens de nummering in visie-coniche.md
  naam: string
  omschrijving: string              // de vraagzin onder de titel
  toelichting: string | null        // lopende tekst in de Toelichtingsmodal, zie stylesheet.md; leeg = dat onderdeel ontbreekt
  centraleVraag: string | null      // blok "CENTRALE VRAAG" in dezelfde modal, bron: visie-coniche.md deel 2 / visie-ai-klantcontact.md; leeg = het blok ontbreekt
  tags: string[]                    // variabel aantal
  gewicht: number                   // standaard 1, zie toelichting hieronder
  gearchiveerd: boolean             // standaard false, zie Content bewerken
  aandachtZin: string | null        // alleen bij antwoordType "ja-nee-weetniet": zin onder de categoriekaart als dit bouwblok het grootste aandachtspunt is, zie content-ziekenhuis-quickscan.md
  vragen: Vraag[]                   // nu steeds 4 (AI-scan: 5, Quickscan: 1 tot en met 12), niet hardcoded aannemen
}
```

**`gewicht`** (alleen op `Bouwblok`, niet op `Categorie` en niet op
`Vraag`): Bepaalt hoe zwaar een bouwblok meetelt in de scores. Standaard
`1`. Een getal groter dan 0, ook decimalen (bijv. `1,5`). Het gewicht
hangt aan het bouwblok en dus aan het bouwstenenmodel, inclusief de
categorie waarin het blok zit. Bij een Assessment zonder categorielaag
(AI-volwassenheid) werkt het hetzelfde.

Het gewicht werkt door in de categoriescore en in de overall-score, niet
in de bouwblokscore zelf (zie Scoreberekening). Een gewicht ongelijk aan
1 is bewust zichtbaar voor de respondent: Zie CLAUDE.md, sectie 3
(wegingskaart en factor per bouwblok). Een gewicht van 1 wordt nergens
getoond, dat is de normale situatie.

Bij Klantcontact Volwassenheid en AI-volwassenheid staat het overal op
`1`. Bij de Zorgscan hebben drie bouwblokken gewicht `2`: 4 (Leren uit
Klantcontact), 10 (Kanaalmanagement) en 11 (Performance Management), zie
`content-zorgscan.md`. De bouwblok-nummers zijn de `volgnummer`s uit
`visie-coniche.md`.

Bij de Quickscan is een bouwblok een dimensie binnen een afdeling. Een
afdeling zwaarder laten wegen betekent daar hetzelfde gewicht op al haar
bouwblokken (`content-ziekenhuis-quickscan.md`).

**Wijzigen kan altijd**, ook als er al ingevulde scans zijn. Scores
worden nooit opgeslagen maar altijd berekend uit `antwoorden` en het
actuele gewicht, dus een wijziging werkt in één keer door in alle
scans van dat Assessment: Resultatenpagina, PDF, InDesign, CSV en de
Organisatie-resultaten per Meting. Dat is een bewuste verantwoordelijkheid van Coniche. De wijziging wordt gelogd (`bouwblok.gewichtGewijzigd`,
zie Audit).

### Vraag

```
Vraag {
  id: string
  volgnummer: number                // binnen het bouwblok
  tekst: string
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

Een vraag is beantwoord zodra er een waarde staat, ook `"weet-niet"`. De
voortgang telt dus ook Weet ik niet mee.

**Structuur van de Quickscan.** Dit Assessment gebruikt de bestaande
lagen en voegt er geen toe. De 4 afdelingen zijn `Categorie`s, de
dimensies (Organisatie, Processen en techniek, Mensen) zijn `Bouwblok`ken
onder een afdeling, en de vragen hangen aan die bouwblokken. Een
dimensie die in een afdeling geen vragen heeft, bestaat daar niet als
bouwblok. Dezelfde dimensienaam komt daardoor in meerdere afdelingen
terug als aparte bouwblokken.

**Optionele categorieën.** Een Categorie met `optioneel: true` begint in
de doorloopflow met de vraag uit `Assessment.relevantieVraag`, met Ja en
Nee als antwoord, onder de `omschrijving` van de categorie. Het antwoord
staat in `ScanInvulling.relevantie`.

- Ja: De categorie is van toepassing en haar vragen worden gesteld.
- Nee: De categorie is niet van toepassing. Haar bouwblokken en vragen
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
  korteNaam?: string | null         // gebouwd op 15 oktober 2026: weergavenaam in kolomkoppen, maximaal 30 tekens, leeg betekent `naam`
  kenmerken: { [veldId: string]: waarde }   // in beheer, altijd bewerkbaar, niet door respondenten
  aangemaaktOp: datetime
}
```

`kenmerken` volgt de organisatievelden (zie hieronder).

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
opslag én bij elke vergelijking — ook bij de verificatiecode-flow
(Toegang voor respondenten hieronder) en bij Respondent-matching in
uitnodigen en import (`import-scans.md`). Zonder normalisatie
ontstaat bij een andere schrijfwijze (hoofdletters, spaties) een
dubbele respondent in plaats van hergebruik. Geldt hetzelfde voor
`Gebruiker.email` hieronder — anders herkent een latere login een
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
  labelHandmatig: boolean           // gebouwd op 14 oktober 2026, standaard false
  onderdeel: string                 // gebouwd, standaard "Hele organisatie", bijv. "Team A"
  meetdatum?: date                  // gebouwd op 14 oktober 2026, zonder tijdstip
  samenstelling?: string[]          // gebouwd, metingIds, alleen bij een samengestelde Meting
  aangemaaktOp: datetime
}
```

**Onderdeel en meetdatum.** Het onderdeel zegt over welk deel van de
organisatie een Meting gaat, bijvoorbeeld "Team A", en is standaard "Hele
organisatie". De meetdatum is de dag waarop de Meting plaatsvindt. Respondenten
mogen er daarna nog dagen over doen. Het is niet het moment waarop de Meting in
de app is aangemaakt (`aangemaaktOp`) en niet het moment van importeren.

- **Meetdatum is verplicht** bij het aanmaken van een Meting, en is achteraf
  te wijzigen. De datum geeft de volgorde in de tijd, en daarmee de volgorde
  waarin Metingen in een vergelijking staan (`benchmark.md`, Niveau 2). Een
  Meting zonder meetdatum, zoals een bestaande Meting uit de tijd van de rondes
  (zie Overgang hieronder), toont "Datum ontbreekt". Ze kan pas in een
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
- **Onderdeel uit het label voorstellen (gebouwd op 13 oktober 2026).** Een
  geïmporteerde Meting heeft het onderdeel "Hele organisatie", ook als haar
  label een onderdeel noemt (bijv. "Zuid-Nederland | 0-meting" na een import).
  "Scans samenbrengen" en Wijzigen stellen het onderdeel voor uit het label: De
  tekst vóór " | ", anders "Hele organisatie". Het is een voorstel dat de
  beheerder ziet en kan aanpassen, nooit een stille wijziging.
- **Overgang van de rondes (gebouwd op 14 oktober 2026).** `Ronde` en
  `Meting.rondeId` vervallen. De Metingen houden hun `label`, onderdeel en
  `samenstelling`. De meetdatum is leeg. Een Admin of Consultant vult hem in
  per Meting. De audit-regels `ronde.aangemaakt` en `ronde.hernoemd` blijven
  geldig voor wat al is gelogd.

**Samengestelde Meting (gebouwd op 13 oktober 2026, aangepast in het voorstel van
14 oktober 2026).** Een Meting met `samenstelling` is een gemiddelde over andere
Metingen van dezelfde organisatie en hetzelfde Assessment, minstens twee, elk
hoogstens één keer en zelf niet samengesteld. De Metingen kiest de gebruiker
zelf, zonder verdere grens. Ze heeft standaard het onderdeel "Hele
organisatie". Haar meetdatum volgt de onderliggende Metingen: Het is de
laatste meetdatum van de geselecteerde Metingen. Ze is dus niet los te
wijzigen, en een geselecteerde Meting zonder datum blokkeert het opslaan. Een
bestaande samenstelling waarvan de leden geen datum hebben (uit de tijd van de
rondes) toont "Datum ontbreekt". In de app staat de datum altijd alleen-lezen,
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
  laatstOpgeslagenOp: datetime | null  // gebouwd op 15 oktober 2026, voor "Laatst opgeslagen" op Mijn metingen (`visualisatie-mijn-metingen.md`); gezet bij elk opslaan van een antwoord
  antwoorden: { [vraagId: string]: number | string }   // 1-5, of "ja" | "nee" | "weet-niet" bij antwoordType "ja-nee-weetniet"
  relevantie: { [categorieId: string]: boolean }       // alleen bij optionele categorieën: true = van toepassing, false = niet van toepassing, ontbreekt = nog niet beantwoord
  opmerkingenPerBouwblok: { [bouwblokId: string]: string }
  notitie: string | null            // gebouwd op 13 oktober 2026, zie hieronder
  bewaarVerlengdTot: datetime | null        // zie Bewaartermijn ingevulde scans
}
```

Uniek per combinatie van meting en respondent. Dezelfde scan opnieuw
invullen gebeurt via een nieuwe meting.

**Notitie op de scan (gebouwd op 13 oktober 2026).** Een notitie bij het starten
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
Content-pagina's).

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

Eén gedeelde functie berekent de overall-score en de score per
categorie/bouwblok uit `antwoorden` en `Bouwblok.gewicht`. Alle scores
worden berekend en nooit opgeslagen. Met `g` het gewicht van een
bouwblok en `n` het aantal vragen in dat blok:

- **Bouwblokscore** = som van de antwoorden in het blok gedeeld door `n`.
  Ongewogen.
- **Categoriescore** = `Σ(g × bouwblokscore) / Σ g` over de bouwblokken
  in die categorie. Een blok met gewicht 2 telt dus dubbel mee.
- **Overall** = `Σ(g × som antwoorden per blok) / Σ(g × n)` over alle
  bouwblokken. Bij gewicht `1` overal is dat de som van alle antwoorden
  gedeeld door het aantal vragen (60 bij Klantcontact). De overall komt
  uit de ruwe antwoorden en niet uit afgeronde bouwblokscores.
- **Afronding** alleen op getoonde waarden: 1 decimaal, half-away-from-
  zero (`toFixed(1)`). Classificatie en kleur volgen de afgeronde
  waarde.

Rekenvoorbeeld Zorgscan: Een invulling met som 172 over 60 vragen is
ongewogen 2,87. Met de blokken 4, 10 en 11 op gewicht 2 komt de som op
215 en de deler op 72, dus 2,99 (afgerond 3,0). Dit voorbeeld hoort in
de test van de scorefunctie.

**Antwoordtype `"ja-nee-weetniet"` (Quickscan).** Hier is de score een
aantal punten en een percentage, geen gemiddelde van 1 tot 5. Met `p` het
aantal Ja in een bouwblok, `n` het aantal vragen in dat blok en `g` het
gewicht:

- **Bouwblokscore** = `p` punten van `n`, als percentage `p / n`.
  Ongewogen. Bij de Quickscan is dit de score van een dimensie binnen een
  afdeling.
- **Categoriescore** = `Σ(g × p) / Σ(g × n)` over de bouwblokken in die
  categorie, als percentage. Dit wijkt af van het gemiddelde van de
  bouwblokpercentages dat bij de schaal geldt, want dat laat een bouwblok
  van 1 vraag even zwaar tellen als een bouwblok van 10. Poliklinieken
  scoren op Organisatie 2 van 4, Processen en techniek 2 van 10 en Mensen
  1 van 1: De afdeling staat op 5 van 15 (33%), het gemiddelde van de drie
  percentages zou 57% zijn.
- **Overall** = `Σ(g × p) / Σ(g × n)` als percentage. De getoonde punten
  zijn `Σ(g × p)` van `Σ(g × n)`. Bij gewicht 1 overal is dat het aantal
  Ja gedeeld door het aantal vragen (60 bij de Quickscan). Net als bij de
  schaal komt de overall uit de ruwe antwoorden en niet uit afgeronde
  bouwblokpercentages.
- **Niet van toepassing.** Bouwblokken van een categorie met `relevantie`
  op `false` doen niet mee. Overall en punten gaan dan over de overige
  categorieën, bijvoorbeeld 14 van 15 punten (93%) als alleen
  Patiëntenservice van toepassing is en daar 14 vragen met Ja zijn
  beantwoord. De categorie zelf krijgt geen score en geen klasse.
- **Tellingen** per bouwblok: Het aantal Ja, Nee en Weet ik niet, uit
  `antwoorden`.
- **Afronding**: Alleen op getoonde waarden, hele procenten,
  half-away-from-zero. Klasse en kleur volgen het afgeronde percentage
  (`CLAUDE.md`, sectie 1, Classificatie).

Rekenvoorbeeld Quickscan (de fictieve proefscan uit de PDF): De vier
afdelingen scoren 5, 3, 5 en 4 punten van 15, samen 17 van 60, dus 28%
(28,3 afgerond). Krijgen de bouwblokken van de tweede afdeling gewicht 2, dan is het
`Σ(g × p)` 5 + 6 + 5 + 4 = 20 en `Σ(g × n)` 15 + 30 + 15 + 15 = 75, dus
27% (26,7 afgerond). Dit voorbeeld hoort in de test van de scorefunctie.

Voor dit antwoordType gebruikt voorlopig alleen de resultatenpagina deze
berekening. PDF, CSV, InDesign, import, het gemiddelde over meerdere
Respondenten, spreiding en benchmark zijn er nog niet voor uitgewerkt
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
  `Bouwblok.gewicht`. Omdat de berekening lineair is, geeft dit hetzelfde
  als het gemiddelde van de scores van de leden. Er komt dus geen
  tweede rekenmethode bij.
- De leden horen bij hetzelfde Assessment. Een lid zonder afgeronde scan
  telt niet mee.
- Een samengestelde Meting (gebouwd) volgt dezelfde regel: De onderliggende
  Metingen zijn de leden en elke Meting telt één keer mee, ongeacht het aantal
  scans. Team A met 5 scans en overall 3,0 en Team B met 40 scans en overall 4,0
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
- **Wat de link opent**: Zie CLAUDE.md sectie 3, "Openen van de
  persoonlijke link".

**Afwijking, bewust zo gebouwd**: Gebouwd als veld op `Respondent`
(`toegangscode`) in plaats van als aparte tabel zoals hierboven staat.
Geeft hetzelfde resultaat (respondent weg → code weg) zonder een tweede
structuur ernaast.

Zolang er geen database is, werkt een link alleen in de browser waar de
data staat: Zonder gegevens in de link kan een andere browser zich niet
meer "bootstrappen" (zie CLAUDE.md, Status). E-mailverificatie bij het
openen van de link (code per mail, 15 minuten geldig) blijft het doel,
maar volgt pas met backend en Coniche-mailserver (`backlog.md`).

### Verwijderen en datakoppelingen

Na elke verwijderactie blijft er geen data achter die naar iets
verwijst wat niet meer bestaat.

- **Ingevulde scan**: Alleen die ene invulling, met antwoorden en
  opmerkingen. De respondent, zijn link en zijn andere invullingen
  blijven bestaan.
- **Respondent**: De respondent, zijn toegangscode en al zijn
  invullingen.
- **Meting**: De meting en alle invullingen daarbinnen. Respondenten
  blijven bestaan.
- **Organisatie**: Alles wat eronder hangt: Metingen, respondenten,
  toegangscodes, invullingen, antwoorden en opmerkingen. Het
  assessment-type en de content blijven staan.
- **Assessment**: Alleen als er geen enkele Meting van dit Assessment
  bestaat, bij welke organisatie dan ook (ook geen Meting zonder scans).
  Bestaat er wel een Meting, dan kan het Assessment niet worden verwijderd,
  ook niet door een Admin. Er is geen tussenvorm waarin de Metingen
  meegaan. De Admin verwijdert eerst zelf alle Metingen van dit Assessment
  (en zo nodig de Organisaties), en kan het Assessment daarna verwijderen.
  Zonder Metingen bestaan er geen scans, antwoorden of benchmarkleden van
  dit Assessment, dus er verdwijnt alleen de definitie: Het Assessment, zijn
  Categorieën, Bouwblokken, Vragen en Schaallabels, ook de gearchiveerde.
  Dit kan niet ongedaan worden gemaakt, en de bevestiging zegt dat.

Verwijzingen naar een verwijderd Assessment worden opgeruimd. Bij een ander
Assessment dat ervan is afgeleid, wordt `afgeleidVanAssessmentId` `null` (het
is alleen herkomstinformatie, zie Sector-varianten). Staat het Assessment in
`Benchmark.assessmentIds`, dan valt het daar weg en meldt de benchmark dat
(`Benchmark.meldingen`). De kaart op de publieke keuzepagina en de
landingspagina van het Assessment verdwijnen.

Een benchmark (deel 3) verwijst naar organisaties en Metingen. Een Lead
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

Een vraag of bouwblok waar al antwoorden aan hangen, wordt niet
verwijderd maar gearchiveerd (`gearchiveerd: true` op Categorie,
Bouwblok of Vraag). Anders verdwijnen scores uit eerdere invullingen.
Nieuwe invullingen krijgen gearchiveerde content niet meer te zien.
Scores en exports van bestaande invullingen rekenen nog wel met die
content. In beheer is gearchiveerde content terug te zetten met
"Herstellen".

### Algemene teksten

Losse stukken tekst in de app die niet bij één Assessment horen (dus
geen `Bouwblok`/`Vraag`/`Categorie`), en die anders hardcoded in de
code zouden staan. Generiek in plaats van een apart veld per tekst, zodat
er telkens gewoon een rij bijkomt in plaats van een nieuw datamodel-veld:

```
AlgemeneTekst {
  sleutel: string                   // bijv. "mijnMetingenIntro"
  waarde: string
}
```

Eerste en enige nu: `mijnMetingenIntro` — de introtekst boven de lijst
met scans op "Mijn metingen" (CLAUDE.md schermflow, scherm 4). Eén
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
  korteNaam?: string                // voorstel: weergavenaam van het veld in lijsten en grafieken, leeg betekent `label`
  eenheid?: string                  // gebouwd op 15 oktober 2026: weergave-eenheid bij getal en percentage, bijv. "s" of "%", gebruikt door Verkennen bij de drempel
}
```

**Korte namen** (gebouwd op 15 oktober 2026, `visualisatie-verkennen.md`, Korte namen). Een korte naam is een weergavenaam naast het origineel. De Organisatie bewaart altijd de originele waarde.

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
- De korte naam staat in Verkennen en in andere schermen waar ruimte krap is. Hij staat niet in het organisatie-detail, de exports en de import, want daar blijft het origineel staan.
- Wijzigen vraagt `content.beheren` (alleen Admin) en wordt gelogd (zie Audit).
- **Opslag zoals gebouwd.** De korte namen staan niet op de definities (`organisatie-velden.ts` is vaste data) maar bij de
  instellingen: `Instellingen.korteNamen = { velden: { [veldId]: string }, waarden: KorteNaam[] }`, met het veld-id als pad
  met punten (`kpis.aht`). `VeldDefinitie.korteNaam` staat in het type maar wordt niet gebruikt.

**Sector en subsector**
- Sector (select, vaste lijst: de SBI-hoofdindeling, `opties` in
  `sbi-indeling.md`)
- Subsector (`select-afhankelijk`, afhankelijk van Sector: toont alleen
  de Afdelingen die onder de gekozen Sectie vallen, `optiesPerWaarde` in
  `sbi-indeling.md`. Uitgeschakeld zolang Sector nog leeg is; wijzigt
  Sector achteraf, dan wordt een al gekozen Subsector gewist.
  **Afwijking van een eerdere versie van dit document**: Die koos
  bewust géén cascading-select — die keuze is teruggedraaid zodra bleek
  dat een platte lijst van 87 Afdelingen in de praktijk onwerkbaar is,
  zie `sbi-indeling.md`)

**Volume en klantbasis**
- Totaal aantal klanten (getal, met B2B/B2C-verdeling als percentage)
- Contacten per jaar per kanaal: Call, Voicebot, Livechat, Chatbot,
  E-mail, Whatsapp (elk een getal, "niet van toepassing" toegestaan)
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
- **LLM-oplossing**: alleen `leverancier` (de modelfamilie) en
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

**KPI's**, elk een numeriek veld: AHT, NPS, CSAT, SLA, FTR.

Verkennen (`visualisatie-verkennen.md`) gebruikt deze velden als filter, als
groepering (AHT met een drempel) en als as in het spreidingsdiagram. Voorstel,
nog niet besloten: AHT per kanaal. AHT wordt dan een subveld bij elk kanaal in
plaats van één los KPI-veld, zodat een filter "kanaal ingezet" kan samengaan met
een AHT-slider voor dat kanaal. Dit raakt de bestaande data en de exports en
staat in `backlog.md`.

---

## Deel 2: Rollen, rechten en inlog (voorstel)

**Status: Voorstel.** De rollen Admin, Consultant, Lead en Respondent zijn
nu ingericht als testhulp (prototype). De definitieve inrichting volgt
samen met de backend en de database.

### Uitgangspunten

- Rechten per rol, aan en uit te zetten zonder codewijziging.
- Minimale toegang per rol, verificatie voor iedereen zonder account,
  audit van wijzigingen.
- Beheer en organisatiekant strikt gescheiden: Andere tabellen, ander
  inlogmechanisme, geen gedeelde accounts.

### Rollen

| Rol | Kant | Wat de rol mag |
|---|---|---|
| Admin | Beheer | Alles, inclusief rechten toekennen en verwijderen |
| Consultant | Beheer | Organisaties en metingen aanmaken, Lead en respondenten koppelen (en weer loskoppelen), resultaten inzien — voor organisaties die hij zelf aanmaakte of die een Admin aan hem toewees |
| Lead | Organisatie | De weergaven zien en doen die een Admin per Lead heeft aangevinkt: Resultaten, Spreiding, Antwoorden, Uitnodigen, Exporteren en benchmarkviews. Kan ook zelf invullen, maar hoeft niet |
| (geen rol) | Organisatie | Gewone respondent: Eigen scans invullen en eigen resultaten zien |

**Wat een Lead mag zien (gebouwd op 14 oktober 2026).** Dit vervangt het
bereik van een Lead (Specifieke Metingen of Hele organisatie), de koppeling
`RespondentRolMeting`, het veld `leadVoorOrganisatie` en de toewijzing van
benchmarkviews (`BenchmarkToewijzing`). Wat daarvan op 13 oktober 2026 is
gebouwd, wordt vervangen (`beheerpagina.md`, punt 6a, Overgang). Een Admin
vinkt per Lead aan welke weergaven hij ziet, in één tabel per organisatie
(`beheerpagina.md`, punt 6a).

```
LeadToegang {
  respondentId: string           // de Lead
  weergave: "resultaten" | "spreiding" | "antwoorden" | "uitnodigen"
            | "exporteren" | "benchmark"
  metingId?: string              // bij alle weergaven behalve benchmark
  benchmarkId?: string           // bij benchmark
  toegekendDoor: string          // Admin
  toegekendOp: datetime
}
```

Een `LeadToegang` is uniek per combinatie van Respondent, weergave en Meting of
benchmark.

- **Resultaten**: De resultatenpagina van de Meting, met Overzicht, Per
  bouwblok en de vergelijking met een eerdere Meting waarvoor de Lead ook
  Resultaten heeft. Een `LeadToegang` mag naar een samengestelde Meting
  verwijzen. De Lead ziet dan alleen het gemiddelde.
- **Spreiding**: Weergave B van die Meting, zonder ring
  (`visualisatie-scores.md`, onderdeel B). Kan alleen als er een `resultaten`
  voor dezelfde Meting is, en niet voor een samengestelde Meting.
- **Uitnodigen**: Respondenten voor die Meting uitnodigen. Onafhankelijk van
  `resultaten`.
- **Exporteren**: De export van die Meting. Kan alleen als er een `resultaten`
  voor dezelfde Meting is.
- **Antwoorden**: Weergave G van die Meting (`visualisatie-scores.md`,
  onderdeel G). Kan alleen als er een `resultaten` voor dezelfde Meting is, en
  niet voor een samengestelde Meting. Of de Lead namen ziet, bepaalt
  `Organisatie.antwoordenMetNamen` (deel 3).
- **Benchmark**: De view of views die in die benchmark bij deze Lead horen
  (`benchmark.md`, View voor een Lead). Bij een benchmark tussen organisaties
  (niveau 1) kan het vinkje voor elke Lead van een organisatie in die
  benchmark. Bij een benchmark binnen een organisatie (niveau 2) kan het alleen
  als de Lead `resultaten` heeft voor een lid-Meting van die benchmark.

Een nieuwe Meting of benchmark begint voor elke Lead zonder vinkje. Er is geen
bereik "hele organisatie" en toegang erft nergens van mee. Een Lead zonder
`LeadToegang` ziet niets.

**Wat een Lead is.** Een Respondent is Lead als hij de `RespondentRol` Lead
heeft. Dat geldt overal waar de app dat vraagt: De badge "Lead", de lijsten en
filters, het Leads-venster en de data-integriteitscontrole.

**Verplaatsen, samenvoegen en importeren.** De Lead-rol gaat niet mee naar een
andere organisatie. Bij elke verplaatsing van een Respondent naar een andere
organisatie worden de Lead-rol en al zijn `LeadToegang` verwijderd. Bij een
samenvoeging behoudt de bestaande Respondent zijn eigen rol en vinkjes, en die
van de samengevoegde Respondent vervallen. Een Respondent die de import
aanmaakt, is nooit Lead. Zonder deze regel blijft iemand Lead voor een
organisatie waar hij niet meer hoort.

**Wat de Lead op zijn eigen pagina ziet**: Zijn eigen vragenlijst, alleen als
hij ook zelf respondent is (dus zelf invult), en de resultaten van elke Meting
waarvoor `resultaten` aan staat, zodra daar minstens 1 scan is afgerond, geen
hoger minimum. Zelfde aggregatieweergave (gemiddelde per Meting) als de
organisatie-resultaten in beheer, zie `beheerpagina.md`,
Organisatie-resultaten. Daarnaast Uitnodigen voor elke Meting waarvoor dat aan staat, en Spreiding en
Antwoorden als weergave op de resultatenpagina van de Meting waarvoor die aan staan, en de views van de benchmarks die aan staan (`benchmark.md`, View voor
een Lead).

---

### 1. Beheerkant

#### Gebruiker

```
Gebruiker {
  id: string
  email: string                  // uniek, genormaliseerd (zie Respondent hierboven)
  naam: string
  wachtwoordHash: string
  tfaGeheim: string | null       // versleuteld opgeslagen, TOTP-secret (zie 2FA hieronder)
  tfaActief: boolean             // verplicht true voordat beheer toegankelijk is
  actief: boolean                // false = gedeactiveerd, nooit hard verwijderd
  laatstIngelogdOp: datetime | null
  aangemaaktOp: datetime
}
```

Een gebruiker wijzigt zijn eigen naam en wachtwoord via "Mijn account"
(`beheerpagina.md`, Accountmenu), het e-mailadres niet.

#### 2FA: TOTP via authenticator-app

**Gekozen mechanisme: TOTP (RFC 6238)**, niet sms of e-mail. Werkt met
elke authenticator-app die de standaard volgt (Google Authenticator,
Microsoft Authenticator, Authy, 1Password, ...) — geen koppeling aan
één leverancier. Geen extra kosten (in tegenstelling tot sms), werkt
offline, en is de gangbare standaard voor dit soort tools.

```
TfaHerstelcode {
  id: string
  gebruikerId: string
  codeHash: string                // nooit leesbaar opgeslagen, net als codeHash bij VerificatieCode
  gebruiktOp: datetime | null      // eenmalig bruikbaar
  aangemaaktOp: datetime
}
```

**Instellen** (eenmalig, per Gebruiker): `tfaGeheim` genereren, tonen
als QR-code (en als tekst, voor wie niet kan scannen). Bevestigen door
éénmalig een geldige code in te voeren, pas dan `tfaActief = true`.
Tegelijk **10 herstelcodes** tonen (eenmalig zichtbaar, daarna alleen
gehasht bewaard, net als `VerificatieCode`/`Toegangscode`) — voor een
kwijtgeraakt toestel. Op = op: Zijn alle 10 gebruikt, dan moet een
Admin `tfaActief` resetten (zie hieronder), geen automatisch nieuwe
lichting genereren.

**Inloggen**: Na e-mail + wachtwoord, bij `tfaActief = true`, een
tweede stap met de 6-cijferige TOTP-code óf een herstelcode.

**Kwijtgeraakt toestel én herstelcodes op**: Een Admin kan bij een
andere Gebruiker `tfaActief` terugzetten naar `false` (en `tfaGeheim`
naar `null`), zodat die Gebruiker bij de volgende login opnieuw door
het instellen heen moet. Geen zelfbediening hiervoor (zou 2FA
zinloos maken als je 'm zelf kan uitzetten zonder tweede factor).
Een Admin kan dit niet bij zichzelf doen zolang hij de enige actieve
Admin is, zelfde soort regel als "Minimaal 1 actieve Admin verplicht"
(`beheerpagina.md`, punt 9) — anders sluit hij zichzelf mogelijk
volledig buiten.

#### Sessie

```
Sessie {
  id: string
  gebruikerId: string
  aangemaaktOp: datetime
  verlooptOp: datetime
  ingetrokkenOp: datetime | null // Admin kan een sessie op afstand beëindigen
}
```

Een Gebruiker wordt nooit hard verwijderd, alleen gedeactiveerd, zodat
eigenaarschap en audit blijven kloppen.

#### Eigenaarschap en toegang van/tot organisaties

Organisatie krijgt een veld `aangemaaktDoor` (gebruikerId): De
Consultant die de organisatie aanmaakte, is er automatisch eigenaar
van. Een Consultant ziet en beheert niet alleen zijn eigen
organisaties: Een Admin kan een organisatie ook expliciet aan een
andere Consultant **toewijzen**, bovenop het eigenaarschap:

```
OrganisatieToegang {
  organisatieId: string
  gebruikerId: string             // de Consultant
  toegekendDoor: string           // Admin
  toegekendOp: datetime
}
```

Het bereik "eigen" van de Consultant (Rechtenmatrix hieronder) is dus
`aangemaaktDoor = deze Consultant` **of** een regel in
`OrganisatieToegang` voor deze Consultant en organisatie. Toewijzen en
intrekken zijn beide Admin-only acties (`beheerpagina.md`, punt 4,
Organisatie-toegang toewijzen). Intrekken is de spiegel van toewijzen:
Kan een Admin toewijzen, dan moet een Admin het ook weer kunnen
intrekken.

**"Eigen" is alleen een rechten-groepering, geen verlies van herkomst.**
Wie de organisatie daadwerkelijk aanmaakte (`aangemaaktDoor`) blijft
altijd apart zichtbaar in beheer, ook al vallen eigenaar en toegewezen
Consultants samen onder hetzelfde toegangsbereik (`beheerpagina.md`,
punt 4: "Aangemaakt door" in de lijst en het detail).

Bij het deactiveren van een Consultant kan een Admin het eigenaarschap
(`aangemaaktDoor`) overzetten naar een andere Consultant of Admin;
`OrganisatieToegang`-koppelingen van de gedeactiveerde Consultant
vervallen gewoon, dat blokkeert het deactiveren niet (in tegenstelling
tot eigenaarschap, dat wél verplicht wordt overgezet, zie
`beheerpagina.md` punt 9).

---

### 2. Rollen en permissies

```
Rol {
  id: string
  sleutel: string                // "admin" | "consultant" | "lead", uitbreidbaar
  naam: string
  kant: "beheer" | "organisatie"
  systeemrol: boolean            // true = niet te verwijderen
}

Module {
  id: string
  sleutel: string                // bijv. "export", "bulkacties", "ai-samenvatting"
  naam: string
  actief: boolean                // module uit = bijbehorende permissies uit, voor iedereen
}

Permissie {
  id: string
  sleutel: string                // bijv. "respondenten.uitnodigen"
  moduleId: string | null        // null = kernfunctie
  omschrijving: string
}

RolPermissie {
  rolId: string
  permissieId: string
  bereik: "alle" | "eigen" | "aangevinkte Metingen" | "aangevinkte benchmarks" | "zelf"
}

GebruikerRol {
  gebruikerId: string
  rolId: string                  // alleen rollen met kant "beheer"
  toegekendDoor: string
  toegekendOp: datetime
}

RespondentRol {
  respondentId: string
  rolId: string                  // alleen rollen met kant "organisatie"
  toegekendDoor: string
  toegekendOp: datetime
}
```

Bij de Lead-rol komt hier `LeadToegang` bij (zie Rollen hierboven): Welke
weergaven deze Lead mag zien, per Meting en per benchmark. Niets is automatisch
zichtbaar.

Betekenis van `bereik`:
- `alle`: Alle records (Admin).
- `eigen`: Organisaties die deze Gebruiker aanmaakte (`aangemaaktDoor`),
  óf die een Admin expliciet aan hem toewees (`OrganisatieToegang`),
  met alles wat daaronder hangt (Consultant). Zie Eigenaarschap en
  toegang van/tot organisaties hierboven.
- `aangevinkte Metingen`: Alleen de Metingen waarvoor een Admin een
  `LeadToegang` met `resultaten` of `antwoorden` heeft aangevinkt (Lead).
- `aangevinkte benchmarks`: Alleen de views van de benchmarks waarvoor een
  Admin een `LeadToegang` met `weergave: "benchmark"` heeft aangevinkt (Lead,
  deel 3).
- `zelf`: Alleen de eigen ingevulde scans (respondent).

Een respondent zonder RespondentRol is een gewone respondent.

---

### 3. Toegang voor respondenten

De korte persoonlijke link (Toegangscode, deel 1) wordt aangevuld met
e-mailverificatie:

```
VerificatieCode {
  id: string
  respondentId: string
  codeHash: string               // code nooit leesbaar opgeslagen
  aangemaaktOp: datetime
  verlooptOp: datetime           // aangemaaktOp + 15 minuten
  gebruiktOp: datetime | null    // eenmalig bruikbaar
  mislukkePogingen: number
  geblokkeerd: boolean           // true na 3 mislukte pogingen
}

ToegangsSessie {
  id: string
  respondentId: string
  aangemaaktOp: datetime
  verlooptOp: datetime           // aangemaaktOp + sessieDuurUren, zie Instellingen hieronder
}
```

Een code wordt alleen verstuurd als het ingevulde e-mailadres hoort bij
de respondent van de link. De pagina geeft in beide gevallen dezelfde
melding. De ToegangsSessie voorkomt dat bij elke pagina opnieuw een code
nodig is, en staat los van de Sessie aan de beheerkant.

**Lockout na 3 mislukte pogingen**: `mislukkePogingen` telt foutieve
codes bij deze `VerificatieCode`. Bij de 3e mislukte poging
`geblokkeerd = true`: Geen nieuwe pogingen meer op déze code, ook al
is de geldigheidstermijn (15 minuten) nog niet voorbij. De respondent
kan opnieuw een code aanvragen (nieuwe `VerificatieCode`, nieuwe teller),
**tenzij** een Admin de blokkade expliciet heeft opgeheven aan de
beheerkant (`beheerpagina.md`, analoog aan de 2FA-reset bij Gebruikers)
— dat vangt het scenario op waarin herhaaldelijk aanvragen zelf ook
wordt misbruikt, niet alleen het gokken op één code.

**Sessieduur, instelbaar**: `ToegangsSessie.verlooptOp` volgt uit een
globale instelling `sessieDuurUren` (default **4 uur**), door een
Admin aan te passen in beheer. Na het verlopen moet de respondent
opnieuw zijn e-mailadres invullen en een nieuwe code opvragen — geen
stilzwijgende verlenging.

#### Bewaartermijn ingevulde scans

Twee globale instellingen, door een Admin te bepalen in beheer
(`beheerpagina.md`, punt 10, Drempels en termijnen): `bewaarTermijnDagen`
(vanaf `ScanInvulling.afgerondOp`, geen default) en
`verlengTermijnDagen` (hoe lang een expliciete "Verlengen"-actie de
melding uitstelt). Verstrijkt `bewaarTermijnDagen` (of, na een eerdere
verlenging, `ScanInvulling.bewaarVerlengdTot`), dan verschijnt de scan in
een "Data ouder dan de bewaartermijn"-lijst in beheer. **Geen
automatische verwijdering**: Zonder actie van een Admin/Consultant
blijft de scan gewoon bestaan. Verwijderen gebruikt de bestaande
verwijderactie (Verwijderen en datakoppelingen hieronder); Verlengen zet
`bewaarVerlengdTot` op het moment van de klik plus `verlengTermijnDagen`.

---

### 4. Audit

```
AuditEvent {
  id: string
  actorType: "gebruiker" | "respondent" | "systeem"
  actorId: string | null
  actie: string                  // bijv. "organisatie.verwijderd", "respondent.uitgenodigd"
  entiteitType: string
  entiteitId: string
  tijdstip: datetime
  groepId: string | null         // bijv. alle gebeurtenissen van één import, zie `beheerpagina.md` punt 12
  details: json | null           // bijv. aantallen bij een verwijdering, en de naam van het record bij loggen
}
```

Ook uitnodigingen door een Lead worden gelogd.

**Geen persoonsgegevens uit scans in de audittrail.** `details` en
entiteitsnamen bevatten geen naam, e-mailadres, functie, team,
notities of antwoorden van een Respondent. De audittrail gaat over wat
gebruikers van de app deden, niet over de inhoud van een scan. Een scan
is te herkennen aan Organisatie, Assessment en Meting.

**Namen bij loggen.** Bij een gebeurtenis legt `details` de naam vast van
Organisatie, Assessment en Meting zoals die op dat moment was, zodat het
overzicht ook leesbaar blijft als het record later is verwijderd of van
naam is veranderd.

**Groepen.** `groepId` heeft bij een import één waarde voor alle
gebeurtenissen van die import. Acties daarbij: `import.gestart` (legt vast
welke bestanden zijn geladen, en welke direct zijn overgeslagen met
reden), `scan.geimporteerd`, `import.rijMislukt` en de bestaande
aanmaakacties (Organisatie, Respondent, Meting). Een groepsoverzicht is
afgeleid uit deze gebeurtenissen en wordt niet apart opgeslagen. Een
export van de audit-log is zelf een gebeurtenis (`auditlog.geexporteerd`).

**Verplaatsen en bewerken.** De beheeracties uit `beheerpagina.md`,
punt 6b (Respondent-overzicht), loggen elk een eigen gebeurtenis:

- `respondent.verplaatst`: Hele Respondent naar een andere organisatie.
  `details` bevat de bron- en doelorganisatie (met naam), het aantal
  verplaatste scans, per bron-Meting de gekozen doel-Meting, en of er
  een samenvoeging was.
- `respons.verplaatst`: Eén respons naar een andere organisatie, met
  bron- en doelorganisatie en Meting.
- `respons.metingVerplaatst`: Eén of meer responsen naar een andere
  Meting van dezelfde organisatie, met bron- en doel-Meting en het
  aantal. Bij een bulkactie staat het aantal overgeslagen scans (met
  reden) in `details`, en geldt één `groepId` voor de hele actie.
- `respons.respondentGewijzigd`: Eén respons aan een andere Respondent
  van dezelfde organisatie gehangen, bijvoorbeeld bij het oplossen van een
  conflict bij "Respons naar andere Meting verplaatsen" (`beheerpagina.md`,
  punt 6b), of met "Andere Respondent koppelen" in het Scan-overzicht
  (punt 7). `details` bevat de Meting en of de Respondent nieuw is
  aangemaakt, zonder persoonsgegevens.
- `gebruiker.eigenGegevensGewijzigd`: Een Admin of Consultant wijzigde zijn
  eigen gegevens via "Mijn account" (`beheerpagina.md`, Accountmenu). `details`
  bevat alleen welke velden zijn gewijzigd (`["naam"]` of `["wachtwoord"]`),
  nooit de waarden.
- `respondent.bewerkt`: Alleen welke velden zijn gewijzigd, bijvoorbeeld
  `["naam", "e-mail"]`. De waarden (oud of nieuw) staan niet in de log,
  wegens het verbod op persoonsgegevens uit scans hierboven.
- `respondent.inzage`: Een AVG-inzage van een Respondent (`export-csv.md`,
  Inzage (AVG)). `details` bevat het aantal scans in het bestand en de
  naam van de Organisatie, zonder persoonsgegevens van de Respondent.

Een overgeslagen scan bij een samenvoeging of bulkverplaatsing wordt als
onderdeel van `details` gelogd en niet als aparte actie.

**Assessment verwijderd.** Het verwijderen van een Assessment is een
gebeurtenis (`assessment.verwijderd`). `details` bevat de naam en het kort
label van het Assessment, het aantal Categorieën, Bouwblokken en Vragen dat
meeging, en de namen van de benchmarks waaruit het is gehaald. Er zijn
geen scans of persoonsgegevens bij betrokken.

**Gewichtswijziging.** Een wijziging van `Bouwblok.gewicht` is een
gebeurtenis (`bouwblok.gewichtGewijzigd`), omdat die terugwerkend de
scores van alle scans van dat Assessment verandert. `details` bevat de
naam en het volgnummer van het bouwblok, de naam van het Assessment, het
oude en het nieuwe gewicht en het aantal scans dat daardoor anders
doorrekent.

**Benchmark.** De acties rond een benchmark (deel 3) loggen elk een
gebeurtenis, zonder persoonsgegevens uit scans.

- `benchmark.aangemaakt`, `benchmark.gewijzigd` en `benchmark.verwijderd`.
  `details` bevat de naam van de benchmark en de namen van de Assessments
  en organisaties zoals ze op dat moment waren.
- `lead.toegangGewijzigd` (gebouwd op 14 oktober 2026). `details` bevat de
  organisatie, de weergave (resultaten, antwoorden of benchmark), de Meting of
  de benchmark en of het vinkje aan of uit is gezet, zonder naam of
  e-mailadres van de Lead. De gebeurtenissen `benchmark.toegewezen` en
  `benchmark.toewijzingIngetrokken` blijven geldig voor wat al is gelogd.
- `korteNaam.gewijzigd` (gebouwd op 15 oktober 2026). `details` bevat het
  veld en de originele waarde, en niet de nieuwe korte naam, zoals bij
  `algemeneTekst.gewijzigd`.
- `organisatie.antwoordenNamenGewijzigd` (voorstel). `details` bevat de naam
  van de organisatie en de nieuwe stand van de schakelaar.
- `organisatie.benchmarkVlagGewijzigd`. `details` bevat de naam van de
  organisatie en de nieuwe stand van de vlag.
- `ronde.aangemaakt` en `ronde.hernoemd` (gebouwd, vervallen op 14 oktober 2026
  met de ronde). Wat al is gelogd, blijft staan.
- `meting.meetdatumGewijzigd` (gebouwd). `details` bevat het label van de
  Meting en de oude en de nieuwe meetdatum.
- `meting.samengesteldAangemaakt`, `meting.samengesteldGewijzigd` en
  `meting.samengesteldVerwijderd` (gebouwd). `details` bevat het label en de
  labels van de onderliggende Metingen zoals ze op dat moment waren.
- `organisatie.hernoemd`. `details` bevat de oude en de nieuwe naam van de
  organisatie. Alleen `Organisatie.naam` verandert, het `id` en alle
  koppelingen blijven gelijk.

**Bewaartermijn.** De bewaartermijn van ingevulde scans
(`bewaarTermijnDagen`, zie Bewaartermijn ingevulde scans hierboven)
geldt ook voor `AuditEvent`, gerekend vanaf `tijdstip`. Een afwijkende
termijn volgt alleen als daar later een eigen spec voor komt. Net als bij
scans is er geen automatische verwijdering: Na de termijn krijgt de Admin
een melding en blijven de gebeurtenissen bestaan tot de Admin ze bewust
opruimt. Dat opruimen is zelf een gebeurtenis (`auditlog.opgeruimd`, met
periode en aantal).

---

### 5. Rechtenmatrix

Een streepje betekent geen toegang.

| Permissie | Admin | Consultant | Lead | Respondent |
|---|---|---|---|---|
| `gebruikers.beheren` | alle | - | - | - |
| `account.bewerken` (eigen naam en wachtwoord) | zelf | zelf | - | - |
| `rollen.toekennen` | alle | - | - | - |
| `content.beheren` (ook de definitie van organisatievelden) | alle | - | - | - |
| `organisaties.aanmaken` | alle | ja | - | - |
| `organisaties.toewijzen` (aan een Consultant) | alle | - | - | - |
| `organisaties.bewerken` (incl. kenmerken) | alle | eigen | te bevestigen | - |
| `organisaties.verwijderen` | alle | eigen | - | - |
| `metingen.plannen` | alle | eigen | - | - |
| `respondenten.uitnodigen` | alle | eigen | aangevinkte Metingen (Uitnodigen) | - |
| `respondenten.leadToekennen` (het Leads-venster en de Lead-rol) | alle | - | - | - |
| `respondenten.verwijderen` | alle | eigen | - | - |
| `scans.verwijderen` | alle | eigen | - | - |
| `scan.invullen` | - | - | zelf | zelf |
| `resultaten.inzien` | alle | eigen | aangevinkte Metingen (Resultaten) | zelf |
| `spreiding.inzien` (weergave B, voorstel) | alle | eigen | aangevinkte Metingen (Spreiding) | - |
| `antwoorden.inzien` (weergave G, voorstel) | alle | eigen | aangevinkte Metingen (Antwoorden) | - |
| `export.uitvoeren` | alle | eigen | zelf, of aangevinkte Metingen (Exporteren) | zelf |
| `benchmark.beheren` | alle | - | - | - |
| `benchmark.inzien` | alle | - | aangevinkte benchmarks | - |
| `verkennen.inzien` (gebouwd, 15 oktober 2026) | alle | - | - | - |

Een Lead die zelf invult, doet dat met het bereik `zelf`, net als elke
respondent.

**Wat een Lead met een vinkje mag.** Elke weergave is een eigen vinkje per
Meting: Resultaten (`resultaten.inzien`), Spreiding (`spreiding.inzien`),
Antwoorden (`antwoorden.inzien`), Uitnodigen (`respondenten.uitnodigen`) en
Exporteren (`export.uitvoeren`). De beperkingen blijven: Geen bulk-export,
niets van andere organisaties, geen Lead-rollen toekennen
(`respondenten.leadToekennen`) en geen beheerrechten. Antwoorden toont namen
of is anoniem volgens `Organisatie.antwoordenMetNamen`. De Consultant heeft geen recht op het
Leads-venster, omdat die alleen voor een Admin is.

**`export.uitvoeren`, bereik van een Lead/Respondent**: Bewust smaller dan
`resultaten.inzien` hierboven. Een Respondent en een Lead kunnen alleen
exporteren wat ze ook al zelf op hun eigen scherm zien: een Respondent zijn
eigen ingevulde scan (resultatenpagina, bereik `zelf`), een Lead daarnaast
ook de Metingen waarvoor hij Exporteren heeft (`LeadToegang`), dus
niet elke Meting die hij toevallig kan *inzien* via een andere weg. Geen
bulk-export en geen toegang tot exports van andere organisaties/Metingen,
ook niet "te bevestigen": dat was hier eerder nog open, nu vastgelegd. Voor
Admin en Consultant blijft dit ongewijzigd: bereik `alle`/`eigen`, zoals de
rest van deze matrix, inclusief de bulk-acties in `beheerpagina.md` punt 5 en 7.

`content.beheren` is Admin-only: Assessment-types en Content
(bouwblokken, vragen, categorieën) zitten in beheer onder de link
"Assessments", die een Consultant niet ziet (`beheerpagina.md`, Wat
beheerbaar is). Een Consultant beheert alleen zijn eigen organisaties,
metingen en respondenten, niet de scaninhoud zelf.

---

`benchmark.beheren` is Admin-only, zoals `content.beheren`. Een benchmark
rekent over organisaties die een Consultant niet beheert, dus het bereik
`eigen` past er niet bij. Een Consultant heeft er vooralsnog geen toegang
toe. `benchmark.inzien` geldt voor een Lead alleen voor de benchmarks die een
Admin voor hem heeft aangevinkt (deel 3 en `benchmark.md`). Het prototype kent
`benchmark.inzien` nog niet als aparte regel in `lib/rechten.ts`: Daar loopt de
toegang van de Lead via de toewijzing en `leadMetingIds`, net als bij
`export.uitvoeren`, tot de overgang naar `LeadToegang`. De regel in de matrix is
het doel voor de rolrechten die met de database komen.

`verkennen.inzien` (gebouwd, 15 oktober 2026) is Admin-only, om dezelfde reden
als `benchmark.beheren`: Verkennen rekent over alle Organisaties van een
Assessment en laat de namen zien. Een Consultant en een Lead hebben er geen
toegang toe (`visualisatie-verkennen.md`).

---

### 6. Open punten

1. Eén gedeelde Rol-tabel (zoals hier) of aparte tabellen voor beheer en
   organisatie.
2. De cellen "te bevestigen" in de rechtenmatrix.
3. Bestaand auth-framework of zelf bouwen (keuze voor de bouwer).

---

## Deel 3: Benchmark (gebouwd en voorstel)

**Status.** Het niveau tussen organisaties is gebouwd (PR 61). De niveaus binnen
een organisatie en binnen een Meting zijn voorstel en staan hieronder als
zodanig aangegeven. Een benchmark zet de
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
  leden: BenchmarkLid[]
  meldingen: { tekst: string, op: datetime }[]
                                    // gebouwd: schermmeldingen, zie hieronder
  niveau?: "organisaties" | "metingen" | "scans"
                                    // voorstel, ontbreekt = "organisaties"
  lezing?: "ontwikkeling" | "naastElkaar"
                                    // gebouwd op 14 oktober 2026, alleen bij niveau "metingen"; ontbreekt het veld, dan volgt ze uit de leden (zie hieronder)
  aangemaaktOp: datetime
  aangemaaktDoor: string            // Gebruiker
}

BenchmarkLid {
  organisatieId: string
  assessmentId: string              // een van assessmentIds
  metingId: string                  // een Meting van deze organisatie en dit Assessment
}
```

`BenchmarkToewijzing` (gebouwd op 13 oktober 2026) is op 14 oktober 2026
vervallen. Een view voor een Lead is een `LeadToegang` met `weergave:
"benchmark"` (deel 2). Bestaande toewijzingen worden daarbij overgezet
(`beheerpagina.md`, punt 6a, Overgang).

Op niveau "organisaties" heeft een organisatie per benchmark per Assessment
hoogstens één lid. Het sectorfilter bij het samenstellen wordt niet
opgeslagen.

**`meldingen`** (gebouwd) is wel opgeslagen, maar geen inhoud van de
benchmark. Het zijn korte teksten voor de beheerweergave, bijvoorbeeld "{naam}
is uit de benchmark gehaald: de Meting is verwijderd". Ze ontstaan als een lid
automatisch wegvalt (zie Verwijderen en datakoppelingen). Een Admin klikt ze
weg, en een wijziging van de samenstelling wist ze. Ze bevatten alleen namen
van organisaties, geen scores of persoonsgegevens, en ze blijven alleen
bestaan zolang de benchmark bestaat.

**`niveau`** (voorstel) bepaalt wat een lid is, zie `benchmark.md`.

- `organisaties`: Een lid is een organisatie met een Meting per Assessment.
  Dit is de waarde als het veld ontbreekt, dus bestaande benchmarks hoeven
  niet te worden aangepast.
- `metingen`: Alle leden hebben dezelfde `organisatieId`. Per Assessment zijn
  er meerdere leden, elk met een andere Meting.
- `scans`: Eén lid, de Meting waarin de scans worden vergeleken. De scans
  zelf zijn geen leden, want ze volgen uit de Meting. Voorstel van 14 oktober
  2026: Deze waarde vervalt, want een view op een scan wordt niet meer aan een
  Lead gegeven (`benchmark.md`, View voor een Lead). Niveau 3 blijft een
  weergave voor de Admin.

**`lezing`** (gebouwd op 14 oktober 2026) zegt hoe de leden van een benchmark
op niveau `metingen` gelezen worden (`benchmark.md`, Niveau 2, Lezing). Bij
niveau `organisaties` en `scans` ontbreekt ze.

- `ontwikkeling`: Alle leden hebben hetzelfde onderdeel en verschillende
  meetdata. De volgorde is op meetdatum.
- `naastElkaar`: Geen regel voor het onderdeel. De volgorde is op de naam van
  de Meting. Meetdata die meer dan `benchmarkMaxDagenTussenMetingen` dagen uit elkaar
  liggen geven een waarschuwing bij opslaan, geen blokkade.

De Admin kan de lezing achteraf wijzigen. De controles lopen dan opnieuw.
Een benchmark die van vóór de lezing is en het veld niet heeft, krijgt haar
lezing uit de leden volgens het voorstel van de app: Hetzelfde onderdeel en
verschillende meetdata geven `ontwikkeling`, in elk ander geval `naastElkaar`.
De opgeslagen waarde wint altijd.

### Uitbreiding op Organisatie

`Organisatie` krijgt `antwoordenMetNamen` (boolean, standaard false, gebouwd
op 14 oktober 2026). Staat hij aan, dan ziet een Lead bij Antwoorden de namen
van de respondenten, en anders R1 tot en met Rn (`beheerpagina.md`, punt 6a).
Een Admin zet hem na afstemming met de opdrachtgever. De intake en het
toestemmingsvakje veranderen er niet door.

`Organisatie` krijgt ook `benchmarkToegestaan` (boolean, standaard false). Een
Admin zet de vlag nadat dit met de organisatie is afgesproken. Alleen
organisaties met de vlag kunnen in een benchmark worden opgenomen. Zie
`benchmark.md`, Toestemming en privacy.

### Instellingen

Globale instellingen, door een Admin te bepalen in beheer
(`beheerpagina.md`, punt 10, Drempels en termijnen). `benchmarkMinOrganisaties` (startwaarde 5,
niveau 1) en `benchmarkMinScans` (startwaarde 3) zijn gebouwd. Voorstel: Per
niveau een eigen drempel voor het aanvinken van een view voor een Lead,
`benchmarkMinRespondenten`
(startwaarde 5, het minimale aantal afgeronde scans in een Meting voor
Spreiding, voor anonieme Antwoorden en voor de lijn van laagste tot hoogste score bij een Lead).
Gebouwd op 15 oktober 2026 voor Verkennen: `verkennenMinGroep` (3), `verkennenMinVergelijking` (5),
`verkennenMinPool` (6), `verkennenMaxGroepen` (12) en `verkennenMinIngevuldPct` (40),
alle gehele getallen van minstens 1, het percentage tot en met 100 (`visualisatie-verkennen.md`, Drempels). `verkennenWaarschuwingGroep` is hernoemd naar `verkennenMinVergelijking`: Een opgeslagen waarde onder de oude naam wordt bij het lezen overgenomen. De startwaarden zijn de norm vanuit het ontwerp.
Gebouwd op 14 oktober 2026: `benchmarkMaxDagenTussenMetingen` (startwaarde 90),
het aantal dagen waarboven een vergelijking met de lezing Naast elkaar een
waarschuwing geeft. De
betekenis staat in `benchmark.md`, Drempels en View voor een Lead.
