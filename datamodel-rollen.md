# Coniche Scan: Datamodel, rollen, rechten en inlog

Rollen, rechten, inlog en audit. Dit hoort bij de Azure SQL-database; clientside zou het alleen schijnveiligheid opleveren. De records van Content, Organisatie, Respondent en Meting staan in `datamodel.md`, de records van de benchmark ook.


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
| Consultant | Beheer | Organisaties en metingen aanmaken, Lead en respondenten koppelen (en weer loskoppelen), resultaten inzien, voor organisaties die hij zelf aanmaakte of die een Admin aan hem toewees |
| Lead | Organisatie | De weergaven zien en doen die een Admin per Lead heeft aangevinkt: Resultaten, Spreiding, Antwoorden, Uitnodigen, Exporteren en benchmarkviews. Kan ook zelf invullen, maar hoeft niet |
| (geen rol) | Organisatie | Gewone respondent: Eigen scans invullen en eigen resultaten zien |

**Wat een Lead mag zien.** Dit vervangt het
bereik van een Lead (Specifieke Metingen of Hele organisatie), de koppeling
`RespondentRolMeting`, het veld `leadVoorOrganisatie` en de toewijzing van
benchmarkviews (`BenchmarkToewijzing`). Een Admin
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
  bouwsteen en de vergelijking met een eerdere Meting waarvoor de Lead ook
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
  `Organisatie.antwoordenMetNamen` (`datamodel.md`, Deel 2: Benchmark).
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
  email: string                  // uniek, genormaliseerd (zie Respondent in `datamodel.md`)
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
Microsoft Authenticator, Authy, 1Password, ...), geen koppeling aan
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
gehasht bewaard, net als `VerificatieCode`/`Toegangscode`), voor een
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
(`beheerpagina.md`, punt 9), anders sluit hij zichzelf mogelijk
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
  Deel 2: Benchmark).
- `zelf`: Alleen de eigen ingevulde scans (respondent).

Een respondent zonder RespondentRol is een gewone respondent.

---

### 3. Toegang voor respondenten

De korte persoonlijke link (Toegangscode, `datamodel.md`) wordt aangevuld met
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
beheerkant (`beheerpagina.md`, analoog aan de 2FA-reset bij Gebruikers),
dat vangt het scenario op waarin herhaaldelijk aanvragen zelf ook
wordt misbruikt, niet alleen het gokken op één code.

**Sessieduur, instelbaar**: `ToegangsSessie.verlooptOp` volgt uit een
globale instelling `sessieDuurUren` (default **4 uur**), door een
Admin aan te passen in beheer. Na het verlopen moet de respondent
opnieuw zijn e-mailadres invullen en een nieuwe code opvragen, geen
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
  wegens het verbod op persoonsgegevens uit scans (`datamodel.md`).
- `respondent.inzage`: Een AVG-inzage van een Respondent (`export-csv.md`,
  Inzage (AVG)). `details` bevat het aantal scans in het bestand en de
  naam van de Organisatie, zonder persoonsgegevens van de Respondent.

Een overgeslagen scan bij een samenvoeging of bulkverplaatsing wordt als
onderdeel van `details` gelogd en niet als aparte actie.

**Assessment verwijderd.** Het verwijderen van een Assessment is een
gebeurtenis (`assessment.verwijderd`). `details` bevat de naam en het kort
label van het Assessment, het aantal Categorieën, Bouwstenen en Vragen dat
meeging, en de namen van de benchmarks waaruit het is gehaald. Er zijn
geen scans of persoonsgegevens bij betrokken.

**Gewichtswijziging.** Een wijziging van `Bouwsteen.gewicht` is een
gebeurtenis (`bouwsteen.gewichtGewijzigd`), omdat die terugwerkend de
scores van alle scans van dat Assessment verandert. `details` bevat de
naam en het volgnummer van de bouwsteen, de naam van het Assessment, het
oude en het nieuwe gewicht en het aantal scans dat daardoor anders
doorrekent.

**Benchmark.** De acties rond een benchmark (`datamodel.md`, Deel 2: Benchmark) loggen elk een
gebeurtenis, zonder persoonsgegevens uit scans.

- `benchmark.aangemaakt`, `benchmark.gewijzigd` en `benchmark.verwijderd`.
  `details` bevat de naam van de benchmark en de namen van de Assessments
  en organisaties zoals ze op dat moment waren.
- `lead.toegangGewijzigd`. `details` bevat de
  organisatie, de weergave (resultaten, antwoorden of benchmark), de Meting of
  de benchmark en of het vinkje aan of uit is gezet, zonder naam of
  e-mailadres van de Lead. De gebeurtenissen `benchmark.toegewezen` en
  `benchmark.toewijzingIngetrokken` blijven geldig voor wat al is gelogd.
- `korteNaam.gewijzigd`. `details` bevat het
  veld en de originele waarde, en niet de nieuwe korte naam, zoals bij
  `algemeneTekst.gewijzigd`.
- `organisatie.antwoordenNamenGewijzigd`. `details` bevat de naam
  van de organisatie en de nieuwe stand van de schakelaar.
- `organisatie.benchmarkVlagGewijzigd`. `details` bevat de naam van de
  organisatie en de nieuwe stand van de vlag.
- `ronde.aangemaakt` en `ronde.hernoemd`: Alleen nog te vinden in oudere audit-regels; er komen geen nieuwe bij.
- `meting.meetdatumGewijzigd`. `details` bevat het label van de
  Meting en de oude en de nieuwe meetdatum.
- `meting.samengesteldAangemaakt`, `meting.samengesteldGewijzigd` en
  `meting.samengesteldVerwijderd`. `details` bevat het label en de
  labels van de onderliggende Metingen zoals ze op dat moment waren.
- `organisatie.hernoemd`. `details` bevat de oude en de nieuwe naam van de
  organisatie. Alleen `Organisatie.naam` verandert, het `id` en alle
  koppelingen blijven gelijk.
- `onderdeel.aangemaakt`, `onderdeel.hernoemd` en `onderdeel.verwijderd`
 . `details` bevat de naam van de Organisatie
  en de naam van het Onderdeel. Bij hernoemen staan de oude en de nieuwe naam
  erin, bij verwijderen het aantal KPI-waarden dat meeging.
- `kpi.waardenGewijzigd`. Eén gebeurtenis per plek
  die bij één keer Opslaan in "KPI's invullen" wijzigde, met één `groepId` voor
  de hele keer. `details` bevat de naam van de Organisatie, de plek (de naam van
  het Onderdeel of "Algemeen") en het aantal ingevulde, gewijzigde en gewiste
  waarden.
- `contactpersoon.toegevoegd`, `contactpersoon.gewijzigd` en
  `contactpersoon.verwijderd`. `details` bevat
  alleen de Organisatie en bij `toegevoegd` of er een LinkedIn-profiel is, en
  bij `gewijzigd` welke velden zijn gewijzigd (`["functie"]`), nooit de naam,
  de functie, het adres of de notitie. `entiteitNaam` is leeg, zoals bij
  `respondent.bewerkt`.
- `nieuwsartikel.toegevoegd`, `nieuwsartikel.gewijzigd` en
  `nieuwsartikel.verwijderd` (vervallen voor nieuwe gebeurtenissen; bestaande regels blijven leesbaar).
- `dossier.itemToegevoegd`, `dossier.itemGewijzigd` en
  `dossier.itemVerwijderd`. `details` bevat de
  Organisatie, de soort, de titel en bij `itemGewijzigd` de namen van de
  gewijzigde velden. Bij een Case staat ook de naam van de Organisatie in de
  Case erin.
- `dossier.zichtbaarGemaakt` en `dossier.verborgen` (voorheen `dossier.geopend` en `dossier.gesloten`; hernoemd op):
  `zichtbaar` is aan of uit gezet. `details` bevat de Organisatie en het
  aantal zichtbare items.
- `dossier.profielGewijzigd`: Een schakelaar van `toonProfiel` is gewijzigd. `details` bevat de Organisatie, het blok (cijfers, kanalen, techstack, overig of kpis) en de nieuwe waarde.
- `dossier.instellingGewijzigd`: `naamVoorLead` of
  een `radarBronnen` is gewijzigd. `details` bevat de Organisatie, het veld, bij
  een scorebron het Assessment en de Meting (of "automatisch"), en de oude en
  nieuwe waarde.
- `organisatie.caseVlagGewijzigd`:
  `caseToegestaan` is gewijzigd. `details` bevat de Organisatie en de nieuwe
  waarde.
- `kpiDefinitie.aangemaakt`, `kpiDefinitie.gewijzigd`, `kpiDefinitie.verwijderd`,
  `kpiDefinitie.volgordeGewijzigd`, `kanaal.aangemaakt`, `kanaal.hernoemd`,
  `kanaal.verwijderd` en `kanaal.volgordeGewijzigd`. `details` bevat de naam en
  bij `kpiDefinitie.gewijzigd` de oude en de nieuwe waarde van elk gewijzigd
  veld. Bij `kanaal.verwijderd` en `kpiDefinitie.verwijderd` staat het aantal waarden en Organisaties dat
  meeging.

**Bewaartermijn.** De bewaartermijn van ingevulde scans
(`bewaarTermijnDagen`, zie Bewaartermijn ingevulde scans in `datamodel.md`)
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
| `content.beheren` (ook de definitie van organisatievelden, KPI's en kanalen) | alle | - | - | - |
| `organisaties.aanmaken` | alle | ja | - | - |
| `organisaties.toewijzen` (aan een Consultant) | alle | - | - | - |
| `organisaties.bewerken` (incl. kenmerken, KPI-waarden en Onderdelen) | alle | eigen | te bevestigen | - |
| `contactpersonen.bewerken` (Contactpersonen aanmaken, wijzigen en verwijderen; een Consultant ziet ze wel; vooralsnog alleen Admin, later waarschijnlijk eigen voor een Consultant) | alle | - | - | - |
| `dossier.bewerken` (Dossieritems aanmaken, wijzigen en verwijderen, Zichtbaar voor Lead, de naam en de scorebron van het Dossier, de blokken van het profiel die de Lead ziet; `dossier.md`) | alle | eigen | - | - |
| `dossier.inzien` | alle | eigen | alleen openstaande items van de eigen Organisatie | - |
| `organisaties.verwijderen` | alle | eigen | - | - |
| `metingen.plannen` (ook een nieuw Onderdeel aanmaken in het formulier) | alle | eigen | - | - |
| `respondenten.uitnodigen` | alle | eigen | aangevinkte Metingen (Uitnodigen) | - |
| `respondenten.leadToekennen` (het Leads-venster en de Lead-rol) | alle | - | - | - |
| `respondenten.verwijderen` | alle | eigen | - | - |
| `scans.verwijderen` | alle | eigen | - | - |
| `scan.invullen` | - | - | zelf | zelf |
| `resultaten.inzien` | alle | eigen | aangevinkte Metingen (Resultaten) | zelf |
| `spreiding.inzien` (weergave B) | alle | eigen | aangevinkte Metingen (Spreiding) | - |
| `antwoorden.inzien` (weergave G) | alle | eigen | aangevinkte Metingen (Antwoorden) | - |
| `export.uitvoeren` | alle | eigen | zelf, of aangevinkte Metingen (Exporteren) | zelf |
| `benchmark.beheren` | alle | - | - | - |
| `benchmark.inzien` | alle | - | aangevinkte benchmarks | - |
| `verkennen.inzien` | alle | - | - | - |

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
exporteren wat ze ook al zelf op hun eigen scherm zien: Een Respondent zijn
eigen ingevulde scan (resultatenpagina, bereik `zelf`), een Lead daarnaast
ook de Metingen waarvoor hij Exporteren heeft (`LeadToegang`), dus
niet elke Meting die hij toevallig kan *inzien* via een andere weg. Geen
bulk-export en geen toegang tot exports van andere organisaties/Metingen,
ook niet "te bevestigen": Dat was hier eerder nog open, nu vastgelegd. Voor
Admin en Consultant blijft dit ongewijzigd: Bereik `alle`/`eigen`, zoals de
rest van deze matrix, inclusief de bulk-acties in `beheerpagina.md` punt 5 en 7.

`content.beheren` is Admin-only: Assessment-types en Content
(bouwstenen, vragen, categorieën) zitten in beheer onder de link
"Assessments", die een Consultant niet ziet (`beheerpagina.md`, Wat
beheerbaar is). Een Consultant beheert alleen zijn eigen organisaties,
metingen en respondenten, niet de scaninhoud zelf.

---

`benchmark.beheren` is Admin-only, zoals `content.beheren`. Een benchmark
rekent over organisaties die een Consultant niet beheert, dus het bereik
`eigen` past er niet bij. Een Consultant heeft er vooralsnog geen toegang
toe. `benchmark.inzien` geldt voor een Lead alleen voor de benchmarks die een
Admin voor hem heeft aangevinkt (`datamodel.md`, Deel 2: Benchmark, en `benchmark.md`). Het prototype kent
`benchmark.inzien` nog niet als aparte regel in `lib/rechten.ts`: Daar loopt de
toegang van de Lead via de toewijzing en `leadMetingIds`, net als bij
`export.uitvoeren`, tot de overgang naar `LeadToegang`. De regel in de matrix is
het doel voor de rolrechten die met de database komen.

`verkennen.inzien` is Admin-only, om dezelfde reden
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
