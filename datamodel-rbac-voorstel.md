# Coniche Scan: Datamodel (voorstel, compleet)

**Status: Voorstel, nog niet gevalideerd.** Dit bestand staat los van
CLAUDE.md en de andere specs. Er is nog niets van overgenomen. Na
validatie wordt dit verwerkt volgens de impactbeschrijving in sectie 11.

Opgebouwd uit wat nu in CLAUDE.md, admin-beheerpagina.md,
v1-aanpassingen.md en backlog.md staat, aangevuld met de rollen uit het
werkoverleg (Admin, Consultant, Lead, Respondent).

## Uitgangspunten

- Role based access, met rechten die per rol aan- en uitgezet kunnen
  worden zonder codewijziging.
- Dataveiligheid: Minimale toegang per rol, verificatie voor iedereen
  zonder account, audit van wijzigingen.
- Modulair: Functies hangen aan permissies, permissies aan modules.
- Beheer en organisatiekant strikt gescheiden. Andere tabellen, ander
  inlogmechanisme, geen gedeelde accounts.

## Overzicht van de entiteiten

**Beheerkant (Coniche)**: Gebruiker, Sessie.

**Rollen en permissies (voor beide kanten)**: Rol, Permissie, Module,
RolPermissie, GebruikerRol, OrganisatieLidRol.

**Organisatiekant**: Organisatie, OrganisatieLid, ScanUitvoering,
ScanInvulling, Antwoord, BouwblokOpmerking.

**Toegang organisatiekant**: VerificatieCode, ToegangsSessie.

**Content**: Assessment, SchaalLabel, Categorie, Bouwblok, Vraag,
VeldDefinitie.

**Audit**: AuditEvent.

Nieuw ten opzichte van de eerdere brainstorm zijn ScanUitvoering,
Antwoord, BouwblokOpmerking, VerificatieCode en ToegangsSessie. Waarom,
staat in sectie 9.

---

## 1. Beheerkant

### Gebruiker

Iedereen van Coniche die inlogt in beheer (Admin, Consultant).

```
Gebruiker {
  id: string
  email: string                  // uniek
  naam: string
  wachtwoordHash: string
  tfaGeheim: string | null       // versleuteld opgeslagen
  tfaActief: boolean             // verplicht true voordat beheer toegankelijk is
  actief: boolean                // false = gedeactiveerd, nooit hard verwijderd (zie sectie 8)
  laatstIngelogdOp: datetime | null
  aangemaaktOp: datetime
}
```

### Sessie

```
Sessie {
  id: string
  gebruikerId: string
  aangemaaktOp: datetime
  verlooptOp: datetime
  ingetrokkenOp: datetime | null // Admin kan een sessie op afstand beëindigen
}
```

---

## 2. Rollen en permissies

### Rol

```
Rol {
  id: string
  sleutel: string                // "admin" | "consultant" | "lead", uitbreidbaar
  naam: string
  context: "beheer" | "organisatie"
  systeemrol: boolean            // true = niet te verwijderen via beheer (admin, lead)
}
```

Een beheer-rol kan alleen aan een Gebruiker gekoppeld worden, een
organisatie-rol alleen aan een OrganisatieLid. Dat wordt afgedwongen via
`context`, niet alleen via de UI.

### Module en Permissie

```
Module {
  id: string
  sleutel: string                // bijv. "export", "bulkacties", "ai-samenvatting"
  naam: string
  actief: boolean                // module uit = alle bijbehorende permissies uit, voor iedereen
}

Permissie {
  id: string
  sleutel: string                // bijv. "leden.uitnodigen", zie de lijst in sectie 7
  moduleId: string | null        // null = kernfunctie, altijd beschikbaar
  omschrijving: string
}
```

### RolPermissie

Hier zit de modulariteit, en ook het bereik van een recht.

```
RolPermissie {
  rolId: string
  permissieId: string
  bereik: "alle" | "aangemaakt" | "organisatie" | "zelf"
}
```

Betekenis van `bereik`:
- `alle`: Alle records, zonder beperking (Admin).
- `aangemaakt`: Alleen organisaties waarvan `aangemaaktDoor` deze
  Gebruiker is, plus alles wat daaronder hangt (Consultant).
- `organisatie`: Alleen de organisatie waar dit OrganisatieLid bij hoort
  (Lead).
- `zelf`: Alleen de eigen records van dit OrganisatieLid (Respondent).

### GebruikerRol en OrganisatieLidRol

```
GebruikerRol {
  gebruikerId: string
  rolId: string                  // alleen rollen met context "beheer"
  toegekendDoor: string          // gebruikerId
  toegekendOp: datetime
}

OrganisatieLidRol {
  organisatieLidId: string
  rolId: string                  // alleen rollen met context "organisatie"
  toegekendDoor: string          // gebruikerId of organisatieLidId, zie sectie 10
  toegekendOp: datetime
}
```

Een OrganisatieLid zonder entry in OrganisatieLidRol is een gewone
respondent. Daar is geen aparte rol voor nodig.

---

## 3. Organisatiekant

### Organisatie

```
Organisatie {
  id: string
  naam: string
  kenmerken: { [veldSleutel: string]: waarde }  // volgt VeldDefinitie, altijd bewerkbaar
  aangemaaktDoor: string         // gebruikerId, bepaalt het bereik "aangemaakt"
  aangemaaktOp: datetime
  gewijzigdOp: datetime
}
```

Let op: `assessmentId` staat hier niet meer. Een organisatie is niet
langer aan één scan-type gebonden, dat verhuist naar ScanUitvoering.

### OrganisatieLid (vervangt Respondent)

De persoon, los van hoe vaak die persoon een scan invult.

```
OrganisatieLid {
  id: string
  organisatieId: string
  email: string                  // uniek binnen de organisatie
  naam: string | null            // leeg tot de eerste intake, daarna vooringevuld bij volgende scans
  functie: string | null         // was Respondent.rol, hernoemd om botsing met Rol te voorkomen
  team: string | null
  notities: string | null
  toegangsToken: string          // ongokbaar, niet verlopend, niet eenmalig; zie sectie 4
  uitgenodigdDoorGebruikerId: string | null
  uitgenodigdDoorLidId: string | null  // gevuld als een Lead de uitnodiging deed
  aangemaaktOp: datetime
}
```

In beheeroverzichten toont de naam het e-mailadres als fallback zolang
`naam` leeg is (zoals nu al in CLAUDE.md staat).

### ScanUitvoering (nieuw)

E�n geplande ronde van één scan-type bij één organisatie. Dit is wat de
Consultant "plant".

```
ScanUitvoering {
  id: string
  organisatieId: string
  assessmentId: string
  label: string                  // bijv. "Nulmeting 2026", vrij in te vullen
  status: "gepland" | "open" | "gesloten"
  openVanaf: date | null
  sluitOp: date | null
  aangemaaktDoor: string         // gebruikerId
  aangemaaktOp: datetime
}
```

### ScanInvulling

E�n keer invullen door één lid binnen één ScanUitvoering. Neemt de velden
over die nu nog op Respondent staan.

```
ScanInvulling {
  id: string
  scanUitvoeringId: string
  organisatieLidId: string
  status: "uitgenodigd" | "bezig" | "afgerond"
  uitgenodigdOp: datetime
  gestartOp: datetime | null     // gezet bij verzenden van de intake
  afgerondOp: datetime | null
}
```

Uniek per combinatie `scanUitvoeringId` + `organisatieLidId`. Nogmaals
dezelfde scan invullen gebeurt via een nieuwe ScanUitvoering (bijv. een
hermeting), niet via een tweede invulling binnen dezelfde ronde.

Statusovergangen:
- `uitgenodigd` → `bezig`: Bij het verzenden van de intake (scherm 4).
  Intakegegevens worden op OrganisatieLid opgeslagen, niet hier.
- `bezig` → `afgerond`: Als alle vragen beantwoord zijn. Of dat
  automatisch bij 100% gebeurt of pas bij "Bekijk resultaten", staat in
  sectie 10.
- Reset → `uitgenodigd`: Antwoorden en opmerkingen gewist, datums leeg,
  het lid en de intakegegevens blijven staan (zoals v1-aanpassingen.md
  punt 2a nu beschrijft).

### Antwoord en BouwblokOpmerking

Los opgeslagen in plaats van als één JSON-veld, zodat export (CSV) en
aggregatie over meerdere invullingen rechtstreeks uit de database komen.

```
Antwoord {
  scanInvullingId: string
  vraagId: string
  waarde: 1 | 2 | 3 | 4 | 5
  beantwoordOp: datetime
}                                // uniek per scanInvullingId + vraagId

BouwblokOpmerking {
  scanInvullingId: string
  bouwblokId: string
  tekst: string
  gewijzigdOp: datetime
}                                // uniek per scanInvullingId + bouwblokId
```

---

## 4. Toegang voor organisatieleden

Organisatieleden hebben nooit een wachtwoord of account. Toegang loopt
via een persoonlijke link plus e-mailverificatie.

**De link hoort bij de persoon, niet bij één invulling.**
`OrganisatieLid.toegangsToken` leidt na verificatie naar een persoonlijke
omgeving. Daar ziet een lid de eigen scan-invullingen (open en afgerond),
en een Lead daarnaast de organisatie-onderdelen (resultaten, leden
uitnodigen). Waarom dit anders is dan v1-aanpassingen.md punt 2, staat in
sectie 9.

### VerificatieCode

```
VerificatieCode {
  id: string
  organisatieLidId: string
  codeHash: string               // code zelf nooit leesbaar opgeslagen
  aangemaaktOp: datetime
  verlooptOp: datetime           // aangemaaktOp + 15 minuten
  gebruiktOp: datetime | null    // eenmalig bruikbaar
  mislukkePogingen: number       // na N pogingen code ongeldig, N te bepalen
}
```

Regel: Een code wordt alleen verstuurd als het ingevulde e-mailadres
overeenkomt met `OrganisatieLid.email` van het token. De pagina geeft in
beide gevallen dezelfde melding, zodat niet af te leiden is welk
e-mailadres bij een link hoort.

### ToegangsSessie

```
ToegangsSessie {
  id: string
  organisatieLidId: string
  aangemaaktOp: datetime
  verlooptOp: datetime           // duur te bepalen, zie sectie 10
}
```

Zonder deze sessie moet iemand bij elke paginawissel opnieuw een code
aanvragen. Los van `Sessie` aan de beheerkant, zodat de twee
inlogmechanismen gescheiden blijven.

**Tussenoplossing (v1-aanpassingen.md punt 2a)** blijft geldig tot er
een mailservice is: De link geeft direct toegang, zonder VerificatieCode.
In dit model betekent dat alleen dat VerificatieCode tijdelijk nog niet
gebruikt wordt; de rest van de structuur hoeft er niet voor te wijken.

---

## 5. Content

Inhoudelijk gelijk aan CLAUDE.md sectie 1 en 2, hier compleet gemaakt
met de koppelvelden en één nieuwe regel (`gearchiveerd`).

```
Assessment {
  id: string
  sleutel: string
  naam: string
  subtitel: string
  beschrijving: string
  doelgroep: string
  icoon: string                  // verwijzing naar een bestand in /assets/icons/
  geschatteDuur: string
  heeftCategorieen: boolean      // false bij de AI-scan: bouwblokken plat
  scoresPerGroepGesorteerd: boolean
  actief: boolean                // false = niet zichtbaar op "Kies jouw assessment"
}

SchaalLabel {
  assessmentId: string
  waarde: 1 | 2 | 3 | 4 | 5
  label: string                  // bijv. "Niet aanwezig"
}                                // precies 5 per Assessment

Categorie {
  id: string
  assessmentId: string
  naam: string
  kleurToken: string             // bijv. "--bl", nooit een hexwaarde (stylesheet.md is de bron)
  volgorde: number
}

Bouwblok {
  id: string
  assessmentId: string
  categorieId: string | null     // null bij scans zonder categorie-laag
  volgnummer: number
  naam: string
  omschrijving: string
  toelichting: string            // tekst in de overlay
  tags: string[]
  gearchiveerd: boolean
}

Vraag {
  id: string
  bouwblokId: string
  volgnummer: number
  tekst: string
  gearchiveerd: boolean
}
```

### VeldDefinitie (organisatiekenmerken)

```
VeldDefinitie {
  id: string
  sleutel: string                // sleutel in Organisatie.kenmerken
  groep: string                  // "Volume en klantbasis", "Techstack", "FTE", ...
  label: string
  type: "tekst" | "getal" | "select" | "select-met-verdeling" | "percentage" | "groep"
  opties: string[] | null
  subvelden: VeldDefinitie[] | null   // bijv. TechstackItem: leverancier + ondersteuning
  volgorde: number
  actief: boolean
}
```

Verschil met CLAUDE.md: Daar hangen de organisatievelden aan het
Assessment. Hier zijn ze één set voor het hele platform, omdat een
organisatie nu meerdere scan-types kan doen en de kenmerken (volumes,
techstack, FTE, KPI's) over de organisatie gaan, niet over een scan.

**Regel voor contentbeheer**: Een Vraag of Bouwblok waar al antwoorden
aan hangen, wordt niet verwijderd maar gearchiveerd. Anders verdwijnen
scores uit eerdere invullingen. Tekst aanpassen mag, maar alleen
redactioneel, niet inhoudelijk (zie sectie 10).

---

## 6. Afgeleide waarden (niet opslaan)

Bouwblokscore, categoriescore, overall score, voortgang, classificatie
en top 3 worden berekend uit Antwoord plus de content, volgens CLAUDE.md
sectie 3. Ze worden niet als veld opgeslagen, zodat een correctie in de
scoringslogica direct overal doorwerkt. Cachen voor snelheid mag, maar
Antwoord blijft de bron.

Aggregatie over meerdere respondenten (nog in backlog) krijgt met dit
model een vast anker: Altijd binnen één ScanUitvoering. Zo worden een
nulmeting en een hermeting nooit per ongeluk op één hoop gegooid.

---

## 7. Rechtenmatrix

Per permissie het bereik per rol. Een streepje betekent geen toegang.
"Te bevestigen" staat er waar het werkoverleg er niets over zei.

| Permissie | Admin | Consultant | Lead | Lid zonder rol |
|---|---|---|---|---|
| `gebruikers.beheren` | alle | - | - | - |
| `rollen.toekennen` (beheer) | alle | - | - | - |
| `content.beheren` (assessments, bouwblokken, vragen, velddefinities) | alle | te bevestigen | - | - |
| `organisaties.aanmaken` | alle | ja | - | - |
| `organisaties.bewerken` (incl. kenmerken) | alle | aangemaakt | te bevestigen (backlog) | - |
| `organisaties.verwijderen` | alle | te bevestigen | - | - |
| `scanuitvoeringen.plannen` | alle | aangemaakt | - | - |
| `leden.uitnodigen` | alle | aangemaakt | organisatie | - |
| `leden.leadToekennen` | alle | te bevestigen | te bevestigen | - |
| `leden.verwijderen` | alle | te bevestigen | - | - |
| `invullingen.verwijderen` / reset | alle | te bevestigen | - | - |
| `scan.invullen` | - | - | zelf | zelf |
| `resultaten.inzien` | alle | aangemaakt | organisatie | zelf |
| `export.uitvoeren` | alle | aangemaakt | te bevestigen | - |

Een Lead die zelf ook invult, heeft voor die eigen invulling
`scan.invullen` met bereik `zelf`, net als elk ander lid. Dat komt
vanzelf mee via de standaardrechten van een lid, niet via de Lead-rol.

---

## 8. Verwijderen en archiveren

- **Organisatie verwijderen**: Verwijdert alle leden, hun rollen, alle
  scanuitvoeringen, invullingen, antwoorden, opmerkingen, codes en
  sessies van die organisatie. Content en Gebruikers blijven staan.
  Stevige bevestigingsstap met aantallen, zoals admin-beheerpagina.md al
  voorstelt.
- **ScanUitvoering verwijderen**: Verwijdert alle invullingen binnen die
  ronde. Leden blijven bestaan.
- **OrganisatieLid verwijderen**: Verwijdert de persoon, rol-toewijzingen,
  al diens invullingen, codes en sessies.
- **ScanInvulling verwijderen of resetten**: Zie sectie 10, hier zit een
  keuze.
- **Gebruiker**: Nooit hard verwijderen, alleen `actief: false`.
  `aangemaaktDoor` en de audit-log blijven dan kloppen. Organisaties van
  een gedeactiveerde Consultant blijven bestaan; een Admin kan
  `aangemaaktDoor` overzetten naar een andere Consultant.
- **Content**: Archiveren in plaats van verwijderen zodra er antwoorden
  aan hangen (sectie 5).

### AuditEvent

```
AuditEvent {
  id: string
  actorType: "gebruiker" | "organisatieLid" | "systeem"
  actorId: string | null
  actie: string                  // bijv. "organisatie.verwijderd", "lid.uitgenodigd"
  entiteitType: string
  entiteitId: string
  tijdstip: datetime
  details: json | null           // bijv. aantallen bij een cascade-verwijdering
}
```

Ook handelingen van een Lead (uitnodigen) worden gelogd, niet alleen die
van beheer.

---

## 9. Keuzes die dit voorstel maakt ten opzichte van de huidige specs

1. **ScanUitvoering als nieuwe laag tussen Organisatie en invulling.**
   Drie dingen uit het werkoverleg en de backlog vroegen erom: De
   Consultant "plant een scanuitvoering", organisaties komen terug voor
   een volgende scan, en een organisatie kan meerdere scan-types doen.
   Met `assessmentId` direct op Organisatie (zoals nu) kan dat geen van
   drieën.
2. **De toegangslink hoort bij de persoon (OrganisatieLid), niet bij één
   invulling.** v1-aanpassingen.md punt 2 koppelt de link nu aan de
   invulversie. Een Lead die zelf niet invult, heeft dan geen invulling
   en dus geen link, en kan nooit bij de organisatieresultaten. Via een
   persoonlijke link lost dat zich op, en het sluit aan bij het
   backlogpunt "Terugkomen bij eerdere scans".
3. **Antwoorden als losse records** in plaats van een JSON-veld, met het
   oog op CSV-export en aggregatie.
4. **Organisatievelden platformbreed** in plaats van per Assessment,
   volgt uit keuze 1.
5. **Archiveren van content** met antwoorden, om historische scores
   intact te houden zodra content bewerkbaar wordt in beheer.

---

## 10. Open punten

1. Eén gedeelde Rol-tabel met `context` (zoals hier getekend) of twee
   aparte tabellen voor beheer- en organisatierollen.
2. De cellen "te bevestigen" in de rechtenmatrix (sectie 7), met name wat
   een Consultant mag verwijderen en wie de Lead-rol mag toekennen.
3. Verwijderen op "Ingevulde scans": Het record weggooien (dan moet het
   lid opnieuw uitgenodigd worden voor die ronde) of resetten naar
   `uitgenodigd` (zoals nu gebouwd in punt 2a). Voorstel: Resetten als
   standaard, want dat is wat er nu werkt en wat de respondent het minst
   hindert.
4. Wanneer `afgerond`: Automatisch bij 100% beantwoord, of pas bij een
   klik op "Bekijk resultaten".
5. Duur van een ToegangsSessie, en na hoeveel mislukte pogingen een
   verificatiecode ongeldig wordt.
6. Of organisatiekenmerken een momentopname per ScanUitvoering nodig
   hebben (om bij een hermeting te zien wat er toen gold), of dat de
   huidige stand volstaat.
7. Welke tekstwijzigingen aan een Vraag met antwoorden nog mogen, en wie
   dat bepaalt.
8. Bestaand auth-framework of zelf bouwen voor Gebruiker/Sessie (keuze
   voor de bouwer, raakt het model niet).

---

## 11. Impact op de bestaande bestanden (als dit wordt overgenomen)

### CLAUDE.md
- Sectie 1 wordt grotendeels vervangen: Respondent wordt OrganisatieLid,
  ScanUitvoering, ScanInvulling, Antwoord en BouwblokOpmerking komen
  erbij, Organisatie verliest `assessmentId` en krijgt `aangemaaktDoor`.
  De vlag "Bekende beperking" bij Respondent vervalt, die is hiermee
  opgelost.
- `Respondent.rol` wordt `OrganisatieLid.functie`.
- Assessment verliest `categorieen`, `bouwblokken` en
  `organisatieVelden` als geneste lijsten; de koppeling loopt via
  `assessmentId` op Categorie en Bouwblok. `heeftCategorieen` komt
  erbij.
- Sectie 2: Organisatievelden worden platformbreed in plaats van per
  Assessment.
- Nieuwe secties voor rollen en permissies, toegang organisatiekant en
  audit.
- Sectie 5 (schermflow): Er komt een persoonlijke omgeving voor
  organisatieleden (na verificatie) met eigen invullingen, en voor een
  Lead de organisatieresultaten en uitnodigen. Die bestaat nu nog niet.

### admin-beheerpagina.md
- Intro en "Login" worden herschreven: Niet langer "1 rol, 2 vaste
  accounts" maar Gebruikers met de rol Admin of Consultant.
- Nieuwe schermen: Gebruikers en rollen beheren, ScanUitvoering plannen
  binnen een Organisatie-detail.
- Elk overzicht krijgt het bereik "aangemaakt" als filter voor
  Consultants.
- "Ingevulde scans" toont per rij ook de ScanUitvoering (label), naast de
  Organisatie-kolom die er al aankomt.
- De cascade-regels worden vervangen door sectie 8 van dit voorstel.
- De sectie "Spanning met CLAUDE.md" over organisatiekenmerken krijgt
  een aanknopingspunt: Een permissie `organisaties.bewerken` met bereik
  `organisatie` voor een Lead.

### v1-aanpassingen.md
- Punt 2: De link verhuist van de invulversie naar de persoon (keuze 2
  in sectie 9). Dat is een inhoudelijke wijziging van een actief punt,
  dus afstemmen met de bouwer voordat het wordt doorgevoerd.
- Punt 2a blijft als tussenoplossing geldig; de publieke link wordt dan
  `OrganisatieLid.toegangsToken` in plaats van het respondent-id. Let
  op: Het huidige `#/scan/<respondent-id>` is alleen veilig als dat id
  ongokbaar is (bijv. een willekeurige UUID).
- Punt 10 (Organisatie-kolom, sorteren) blijft staan en krijgt een
  ScanUitvoering-kolom erbij.

### backlog.md
- "Respondent moet nogmaals een scan kunnen invullen": Opgelost door
  ScanUitvoering plus ScanInvulling, kan uit de backlog.
- "Terugkomen bij eerdere scans": Structureel opgelost door de
  persoonlijke link; alleen de mailservice blijft over.
- "Gedeeltelijk extern invullen van organisatiekenmerken": Krijgt een
  mechanisme (permissie voor Lead), het besluit zelf blijft open.
- "Aggregatie over meerdere respondenten": Krijgt een anker
  (ScanUitvoering), het ontwerp van de weergave blijft open.

### stylesheet.md, content-klantcontact-volwassenheid.md, content-ai-scan.md, coniche_bouwstenen.md
- Geen inhoudelijke impact. Wel een kleine aanpassing in de
  content-bestanden bij adoptie: Categoriekleur als token (`--bl`)
  vermelden in plaats van als woord ("blauw").
