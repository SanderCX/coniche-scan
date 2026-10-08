# Coniche Scan: Datamodel

Enige bron voor het datamodel.

- **Deel 1: Gebouwd.** Content, organisatie, respondent, meting, ingevulde
  scan, toegangscode, organisatievelden, en de regels voor verwijderen.
- **Deel 2: Voorstel.** Rollen, rechten, inlog en audit. Wordt gebouwd
  samen met de Azure SQL-database; clientside zou het alleen schijnveiligheid
  opleveren.

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
  schaal: SchaalLabel[5]            // per Assessment, zie hieronder
  pdfContentSecties: { titel: string, bron: ContentBron } | null // zie export-pdf-visual-volwassenheidsscan.md
  afgeleidVanAssessmentId: string | null // zie Sector-varianten hieronder
  bouwblokLabel: string             // eyebrow in de Toelichtingsmodal; standaard "Bouwsteen" (Klantcontact, Zorg), "AI-domein" bij de AI-scan
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
Volwassenheid" tonen in de lijst) — geen lopende koppeling.

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
  vragen: Vraag[]                   // nu steeds 4 (AI-scan: 5), niet hardcoded aannemen
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

### Organisatie

Aangemaakt in beheer. Een organisatie is niet aan één scan-type gebonden:
Die koppeling loopt via Meting.

```
Organisatie {
  id: string
  naam: string
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

Eén geplande ronde van één scan-type bij één organisatie, bijv.
"Nulmeting 2026" of een AI-scan naast een Klantcontact-scan.

```
Meting {
  id: string
  organisatieId: string
  assessmentId: string
  label: string
  aangemaaktOp: datetime
}
```

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
  antwoorden: { [vraagId: string]: number }            // 1-5
  opmerkingenPerBouwblok: { [bouwblokId: string]: string }
  bewaarVerlengdTot: datetime | null        // zie Bewaartermijn ingevulde scans
}
```

Uniek per combinatie van meting en respondent. Dezelfde scan opnieuw
invullen gebeurt via een nieuwe meting.

Status: `"uitgenodigd"` bij het uitnodigen, `"bezig"` zodra de intake is
verzonden (ook al is de voortgang dan nog 0%), `"afgerond"` als alle
vragen beantwoord zijn.

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

Vier plekken gebruiken dezelfde uitkomst, geen van alle een eigen
herimplementatie: De resultatenpagina, de PDF-export
(`export-pdf-visual-volwassenheidsscan.md`), de InDesign-export
(`export-indesign.md`, `groepsScores`) en de CSV-export
(`export-csv.md`, `overall_score`/`groepsScores`). Wijkt de score op
één van die plekken af van de andere, dan is dat per definitie een
bug in die ene plek, niet een tweede, losstaande berekening.

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
  afhankelijkVan?: string           // alleen "select-afhankelijk": id van het broer-veld waarvan de keuze de lijst hier bepaalt
  optiesPerWaarde?: { [waarde: string]: string[] } // alleen "select-afhankelijk"
  subvelden?: VeldDefinitie[]       // voor herhalende structuren
}
```

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

**Techstack**, zes keer dezelfde structuur (leverancier, zelf/extern
ondersteund) voor Contact center, Conversational AI, CRM,
Kennismanagement, LLM-oplossing en IT en deployment. Modelleer dit als
één herbruikbaar `TechstackItem { categorie, leverancier, ondersteuning:
"zelf" | "extern" }`.

**FTE**
- Klantcontactmedewerkers (getal, met inhouse/BPO-verdeling)
- Klantcontact management & support (getal)
- IT DevOps-medewerkers (getal, met percentage gericht op Digital)

**KPI's**, elk een numeriek veld: AHT, NPS, CSAT, SLA, FTR.

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
| Lead | Organisatie | Respondenten uitnodigen voor en resultaten inzien van zijn toegewezen Metingen. Kan ook zelf invullen, maar hoeft niet |
| (geen rol) | Organisatie | Gewone respondent: Eigen scans invullen en eigen resultaten zien |

**Een Lead ziet niet automatisch alle Metingen van de organisatie.**
Toegang wordt per Meting toegekend, niet als blanket-toegang op de hele
organisatie: Anders zou een nieuwe Meting die later wordt aangemaakt
meteen zichtbaar zijn voor elke bestaande Lead, zonder dat iemand dat
bewust besloot. Een Lead kan aan meerdere Metingen tegelijk gekoppeld
zijn.

```
RespondentRolMeting {
  respondentId: string
  metingId: string               // een Meting waar deze Lead toegang toe heeft
}
```

Minstens 1 koppeling verplicht bij het toekennen van de Lead-rol (zie
`beheerpagina.md`, punt 6a): Geen Lead zonder minstens één toegewezen
Meting.

**Wat de Lead op zijn eigen pagina ziet**: Zijn eigen vragenlijst,
alleen als hij ook zelf respondent is (dus zelf invult); en sowieso de
resultaten van elke Meting waar hij aan gekoppeld is, zodra daar
minstens 1 scan binnen is afgerond, geen hoger minimum. Zelfde
aggregatieweergave (gemiddelde per Meting) als de organisatie-resultaten
in beheer, zie `beheerpagina.md`, Organisatie-resultaten.

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
  bereik: "alle" | "eigen" | "toegewezen metingen" | "zelf"
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

Bij de Lead-rol komt hier `RespondentRolMeting` bij (zie Rollen
hierboven): Welke specifieke Metingen deze Lead mag zien, niet
automatisch de hele organisatie.

Betekenis van `bereik`:
- `alle`: Alle records (Admin).
- `eigen`: Organisaties die deze Gebruiker aanmaakte (`aangemaaktDoor`),
  óf die een Admin expliciet aan hem toewees (`OrganisatieToegang`),
  met alles wat daaronder hangt (Consultant). Zie Eigenaarschap en
  toegang van/tot organisaties hierboven.
- `toegewezen metingen`: Alleen de Metingen die via `RespondentRolMeting`
  expliciet aan deze Lead zijn gekoppeld (Lead).
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
(`beheerpagina.md`, punt 10, Instellingen): `bewaarTermijnDagen`
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
  punt 6b). `details` bevat de Meting en of de Respondent nieuw is
  aangemaakt, zonder persoonsgegevens.
- `respondent.bewerkt`: Alleen welke velden zijn gewijzigd, bijvoorbeeld
  `["naam", "e-mail"]`. De waarden (oud of nieuw) staan niet in de log,
  wegens het verbod op persoonsgegevens uit scans hierboven.
- `respondent.inzage`: Een AVG-inzage van een Respondent (`export-csv.md`,
  Inzage (AVG)). `details` bevat het aantal scans in het bestand en de
  naam van de Organisatie, zonder persoonsgegevens van de Respondent.

Een overgeslagen scan bij een samenvoeging of bulkverplaatsing wordt als
onderdeel van `details` gelogd en niet als aparte actie.

**Gewichtswijziging.** Een wijziging van `Bouwblok.gewicht` is een
gebeurtenis (`bouwblok.gewichtGewijzigd`), omdat die terugwerkend de
scores van alle scans van dat Assessment verandert. `details` bevat de
naam en het volgnummer van het bouwblok, de naam van het Assessment, het
oude en het nieuwe gewicht en het aantal scans dat daardoor anders
doorrekent.

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
| `rollen.toekennen` | alle | - | - | - |
| `content.beheren` (ook de definitie van organisatievelden) | alle | - | - | - |
| `organisaties.aanmaken` | alle | ja | - | - |
| `organisaties.toewijzen` (aan een Consultant) | alle | - | - | - |
| `organisaties.bewerken` (incl. kenmerken) | alle | eigen | te bevestigen | - |
| `organisaties.verwijderen` | alle | eigen | - | - |
| `metingen.plannen` | alle | eigen | - | - |
| `respondenten.uitnodigen` | alle | eigen | toegewezen metingen | - |
| `respondenten.leadToekennen` | alle | eigen | - | - |
| `respondenten.verwijderen` | alle | eigen | - | - |
| `scans.verwijderen` | alle | eigen | - | - |
| `scan.invullen` | - | - | zelf | zelf |
| `resultaten.inzien` | alle | eigen | toegewezen metingen | zelf |
| `export.uitvoeren` | alle | eigen | zelf, of toegewezen Metingen | zelf |

Een Lead die zelf invult, doet dat met het bereik `zelf`, net als elke
respondent.

**`export.uitvoeren`, bereik van een Lead/Respondent**: Bewust smaller dan
`resultaten.inzien` hierboven. Een Respondent en een Lead kunnen alleen
exporteren wat ze ook al zelf op hun eigen scherm zien: een Respondent zijn
eigen ingevulde scan (resultatenpagina, bereik `zelf`), een Lead daarnaast
ook de Metingen waarvoor hij Lead is (`respondent.leadMetingIds`) — dus
niet elke Meting die hij toevallig kan *inzien* via een andere weg. Geen
bulk-export en geen toegang tot exports van andere organisaties/Metingen,
ook niet "te bevestigen": dat was hier eerder nog open, nu vastgelegd. Voor
Admin en Consultant blijft dit ongewijzigd: bereik `alle`/`eigen`, zoals de
rest van deze matrix, inclusief de bulk-acties in `beheerpagina.md` punt 7.

`content.beheren` is Admin-only: Assessment-types en Content
(bouwblokken, vragen, categorieën) zitten in beheer onder de link
"Assessments", die een Consultant niet ziet (`beheerpagina.md`, Wat
beheerbaar is). Een Consultant beheert alleen zijn eigen organisaties,
metingen en respondenten, niet de scaninhoud zelf.

---

### 6. Open punten

1. Eén gedeelde Rol-tabel (zoals hier) of aparte tabellen voor beheer en
   organisatie.
2. De cellen "te bevestigen" in de rechtenmatrix.
3. Bestaand auth-framework of zelf bouwen (keuze voor de bouwer).
