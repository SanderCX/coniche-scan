# Coniche Scan: Datamodel

Enige bron voor het datamodel.

- **Deel 1: Gebouwd.** Content, organisatie, respondent, meting, ingevulde
  scan, toegangscode, organisatievelden, en de regels voor verwijderen.
- **Deel 2: Voorstel.** Rollen, rechten, inlog en audit. Wordt gebouwd
  samen met de Neon-database; clientside zou het alleen schijnveiligheid
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
  icoon: string
  geschatteDuur: string             // bijv. "±30 minuten"
  categorieen: Categorie[] | null   // optioneel, zie hieronder
  bouwblokken: Bouwblok[] | null    // gebruikt als categorieen ontbreken
  scoresPerGroepGesorteerd: boolean // AI-scan sorteert op waarde, Klantcontact-scan niet
  schaal: SchaalLabel[5]            // per Assessment, zie hieronder
  organisatieVelden: VeldDefinitie[] // zie Organisatievelden
  pdfContentSecties: { titel: string, bron: ContentBron } | null // zie export-pdf-visual-volwassenheidsscan.md
  afgeleidVanAssessmentId: string | null // zie Sector-varianten hieronder
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
`Categorie.gewicht`/`Bouwblok.gewicht` op de sector-variant, dan raakt
dat alleen die variant. Een latere correctie op het template werkt dus
niet automatisch door in bestaande sector-varianten — bewuste keuze,
om dezelfde reden als "Content bewerken" hieronder: Een sector-scan
die al ingevuld is, mag niet ongemerkt van betekenis veranderen omdat
iemand het template bijwerkt. Een generieke fix (bijv. een typo in een
vraagtekst die in alle varianten voorkomt) moet dus bewust in elke
variant apart worden doorgevoerd.

Wat er bij het kopiëren verandert, komt met het aanmaken van de eerste
sector-variant zelf aan bod (nog niet uitgewerkt): In elk geval de
vraagteksten en de gewichten per categorie/bouwblok, mogelijk ook
bouwbloktoelichtingen. De structuur (aantal bouwblokken, categorieën,
volgorde) blijft ongewijzigd overnemen, tenzij expliciet aangepast.

### Categorie

```
Categorie {
  id: string
  naam: string                      // "Overkoepelend", "Organisatie", "Proces & Tech", "Mens", "Fundament"
  kleur: string                     // categoriekleur, waarde in stylesheet.md
  volgorde: number
  gewicht: number                   // standaard 1, zie toelichting bij Bouwblok.gewicht
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
  toelichting: string               // tekst in de overlay, zie CLAUDE.md sectie 3
  centraleVraag: string             // label "CENTRALE VRAAG" in dezelfde overlay, bron: visie-coniche.md deel 2 / visie-ai-klantcontact.md
  tags: string[]                    // variabel aantal
  gewicht: number                   // standaard 1, zie toelichting hieronder
  vragen: Vraag[]                   // nu steeds 4 (AI-scan: 5), niet hardcoded aannemen
}
```

**`gewicht`** (op zowel `Categorie` als `Bouwblok`, niet op `Vraag`):
Bepaalt hoe zwaar een groepering meetelt binnen de laag die
rechtstreeks naar de overall-score oprolt. Welke laag dat is, hangt af
van of het scan-type een categorielaag heeft (`Assessment.categorieen`
hierboven):

- **Klantcontact Volwassenheid** (wel een categorielaag): De vijf
  categorieën rollen rechtstreeks op naar de overall-score, dus
  `Categorie.gewicht` is daar de relevante laag. `Bouwblok.gewicht`
  bestaat ook hier (`Bouwblok` is één type, gebruikt door beide
  scan-types), maar heeft voorlopig geen omschreven rol: Bouwblokken
  binnen een categorie tellen ongewogen mee, tenzij daar later
  alsnog behoefte aan blijkt.
- **AI-volwassenheid** (geen categorielaag): De acht domeinen —
  in dit datamodel gewoon `Bouwblok`, zie hierboven — rollen zelf
  rechtstreeks op naar de overall-score, dus daar is
  `Bouwblok.gewicht` de relevante laag.

Bij beide huidige scan-types staat dit overal op `1` (geen effect op
de score). Toegevoegd omdat het verschil tussen een sector-variant en
zijn template (zie Sector-varianten hierboven) vooral in twee dingen
zit: Andere vraagteksten (`Vraag.tekst`, al bestaand) en andere
gewichten op categorie-/bouwblokniveau (nieuw). Hoe een afwijkend
gewicht precies doorwerkt in de score-berekening (nu een ongewogen
gemiddelde) is nog niet uitgewerkt — dat volgt zodra de eerste
sector-variant zelf wordt opgepakt, deze velden liggen er alvast zodat
historische data (`import-legacy-scans.md`) er niet opnieuw bij hoeft.

### Vraag

```
Vraag {
  id: string
  volgnummer: number                // binnen het bouwblok
  tekst: string
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
  email: string                     // uniek binnen de organisatie
  naam: string | null               // leeg tot de eerste intake
  functie: string | null            // in de interface: "Rol / Functie"
  team: string | null
  notities: string | null
  aangemaaktOp: datetime
}
```

Wordt iemand uitgenodigd met een e-mailadres dat al bestaat binnen de
organisatie, dan wordt dezelfde respondent hergebruikt.

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
  uitgenodigdOp: datetime
  gestartOp: datetime | null        // gezet bij het verzenden van de intake
  afgerondOp: datetime | null
  antwoorden: { [vraagId: string]: number }            // 1-5
  opmerkingenPerBouwblok: { [bouwblokId: string]: string }
}
```

Uniek per combinatie van meting en respondent. Dezelfde scan opnieuw
invullen gebeurt via een nieuwe meting.

Status: `"uitgenodigd"` bij het uitnodigen, `"bezig"` zodra de intake is
verzonden (ook al is de voortgang dan nog 0%), `"afgerond"` als alle
vragen beantwoord zijn.

### Scoreberekening

Eén gedeelde functie berekent de overall-score en de score per
categorie/bouwblok uit `antwoorden`, ongeacht `Categorie.gewicht`/
`Bouwblok.gewicht` (nu overal `1`, zie hierboven). Vier plekken
gebruiken dezelfde uitkomst, geen van alle een eigen herimplementatie:
De resultatenpagina, de PDF-export
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

**Afwijking, nog te bespreken met Sander**: Gebouwd als veld op
`Respondent` (`toegangscode`) in plaats van als aparte tabel. Niet hier
al doorgevoerd zolang dat gesprek nog loopt; zie `v1-aanpassingen.md`.

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
verwijderd maar gearchiveerd. Anders verdwijnen scores uit eerdere
invullingen.

### Organisatievelden

Instelbaar in beheer, nu als vaste data (JSON), zodat het beheerscherm er
later overheen kan zonder de flow te herbouwen.

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

**Status: Voorstel, wordt gebouwd samen met de database.**

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
| Consultant | Beheer | Organisaties aanmaken, metingen plannen, respondenten uitnodigen, resultaten inzien van organisaties die hij zelf aanmaakte |
| Lead | Organisatie | Respondenten uitnodigen en alle resultaten van de eigen organisatie inzien. Kan ook zelf invullen, maar hoeft niet |
| (geen rol) | Organisatie | Gewone respondent: Eigen scans invullen en eigen resultaten zien |

---

### 1. Beheerkant

#### Gebruiker

```
Gebruiker {
  id: string
  email: string                  // uniek
  naam: string
  wachtwoordHash: string
  tfaGeheim: string | null       // versleuteld opgeslagen
  tfaActief: boolean             // verplicht true voordat beheer toegankelijk is
  actief: boolean                // false = gedeactiveerd, nooit hard verwijderd
  laatstIngelogdOp: datetime | null
  aangemaaktOp: datetime
}
```

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

#### Eigenaarschap van organisaties

Organisatie krijgt een veld `aangemaaktDoor` (gebruikerId). Daarop is het
bereik "aangemaakt" van de Consultant gebaseerd. Bij het deactiveren van
een Consultant kan een Admin het eigenaarschap overzetten.

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
  bereik: "alle" | "aangemaakt" | "organisatie" | "zelf"
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

Betekenis van `bereik`:
- `alle`: Alle records (Admin).
- `aangemaakt`: Organisaties die deze Gebruiker aanmaakte, met alles
  wat daaronder hangt (Consultant).
- `organisatie`: De eigen organisatie van deze respondent (Lead).
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
}

ToegangsSessie {
  id: string
  respondentId: string
  aangemaaktOp: datetime
  verlooptOp: datetime
}
```

Een code wordt alleen verstuurd als het ingevulde e-mailadres hoort bij
de respondent van de link. De pagina geeft in beide gevallen dezelfde
melding. De ToegangsSessie voorkomt dat bij elke pagina opnieuw een code
nodig is, en staat los van de Sessie aan de beheerkant.

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
  details: json | null           // bijv. aantallen bij een verwijdering
}
```

Ook uitnodigingen door een Lead worden gelogd.

---

### 5. Rechtenmatrix

Een streepje betekent geen toegang.

| Permissie | Admin | Consultant | Lead | Respondent |
|---|---|---|---|---|
| `gebruikers.beheren` | alle | - | - | - |
| `rollen.toekennen` | alle | - | - | - |
| `content.beheren` | alle | te bevestigen | - | - |
| `organisaties.aanmaken` | alle | ja | - | - |
| `organisaties.bewerken` (incl. kenmerken) | alle | aangemaakt | te bevestigen | - |
| `organisaties.verwijderen` | alle | te bevestigen | - | - |
| `metingen.plannen` | alle | aangemaakt | - | - |
| `respondenten.uitnodigen` | alle | aangemaakt | organisatie | - |
| `respondenten.leadToekennen` | alle | te bevestigen | te bevestigen | - |
| `respondenten.verwijderen` | alle | te bevestigen | - | - |
| `scans.verwijderen` | alle | te bevestigen | - | - |
| `scan.invullen` | - | - | zelf | zelf |
| `resultaten.inzien` | alle | aangemaakt | organisatie | zelf |
| `export.uitvoeren` | alle | aangemaakt | te bevestigen | - |

Een Lead die zelf invult, doet dat met het bereik `zelf`, net als elke
respondent.

---

### 6. Open punten

1. Eén gedeelde Rol-tabel (zoals hier) of aparte tabellen voor beheer en
   organisatie.
2. De cellen "te bevestigen" in de rechtenmatrix.
3. Duur van een ToegangsSessie, en na hoeveel mislukte pogingen een code
   ongeldig wordt.
4. Bestaand auth-framework of zelf bouwen (keuze voor de bouwer).
