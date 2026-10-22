# Coniche Scan: Beheeromgeving

De omgeving waarin Coniche scans, content en organisaties beheert.

## Inhoud

De nummers (punt 1 tot en met 15) zijn de nummers waarmee andere specs naar een onderdeel verwijzen.

| Gedeelte | Onderdelen |
|---|---|
| Algemeen | Toegang, Vormgeving, Accountmenu, Navigatie in beheer |
| Instellingen (Admin) | 9 Gebruikers, 10 Drempels en termijnen, 2a Algemene teksten, 11 Content-pagina's, 12 Audit-log, 13 Data-integriteit |
| Assessments (Admin) | 1 Assessment-types, 2 Content |
| Organisaties | 3 Organisatievelden, 4 Organisaties, 5 Metingen, 6 Respondenten uitnodigen, 6a Leads: Toegang per weergave, 6b Respondenten, 8 Import van historische scans |
| Resultaten | 7 Resultaten, 14 Benchmarks, 15 Verkennen |
| Afsluitend | Verwijderen, Ter overweging, Open punten |

## Toegang

Beheer is alleen toegankelijk met een account. Nu met e-mail en
wachtwoord; 2FA volgt zodra er een backend is. Rollen binnen beheer
(Admin, Consultant) staan in `datamodel-rollen.md`. Ze zijn nu
ingericht als testhulp (prototype). Het inlogscherm heeft geen
rolkeuze: De rol volgt uit het account waarmee iemand inlogt. De
definitieve rollen en rechten volgen met de backend. Admin-accounts
hebben onderling dezelfde rechten, en meer dan een Consultant.

Respondenten loggen niet in. Zij krijgen een persoonlijke link, zie
`datamodel.md`, Toegangscode.

## Vormgeving

Dezelfde nav en footer als de rest van de app, met de beheerlinks in
`.nav-right`. Componenten staan in `stylesheet.md`.

**Rolbadge in plaats van de vaste badge "Beheer"**: Waar eerder altijd
de tekst "Beheer" in zwart stond, staat nu de rol van de ingelogde
Gebruiker (Admin of Consultant), in de bijbehorende rolkleur
(`stylesheet.md`, Rolkleuren). De rol is gezet bij het aanmaken van de
Gebruiker (punt 9, Gebruikers). Lead en Respondent hebben geen Rolbadge:
Zij loggen niet in op beheer, en hun rol volgt uit de Organisatie (punt
6a).

In de interface: "Respondenten" (niet "leden"), "Meting" en "Ingevulde
scans". Zie CLAUDE.md, Terminologie.

**Uitleg in een Info-icoon.** Uitleg bij een veld of knop staat in een
Info-icoon (`stylesheet.md`, Info-icoon) en niet als vaste tekst eronder.
Dat geldt ook voor de reden achter een uitgeschakelde knop, in plaats van
een `title`-tooltip. Een Admin kan elke Info-icoon-tekst aanpassen op de
plek zelf. Welke teksten er zijn en wat de initiële waarde is, staat bij
punt 2a, Algemene teksten. Een standaardtekst bevat geen verwijzing naar
een document of andere bouwerstekst.

### Accountmenu

Niet te verwarren met beheeronderdeel 9, "Gebruikers" (de link naar het
beheerscherm voor Admin/Consultant-accounts): Dit is de weergave van de
ingelogde gebruiker zelf, in `.nav-right`.

Helemaal uiterst rechts: Punt 5 van de navigatieregel in `schermen.md`,
Globale layout. Conventie: Een account-/profielmenu staat vrijwel altijd
als allerlaatste element in een nav. Volgorde in `.nav-right`, van links
naar rechts: Scherm-specifieke acties ("Assessments"/"Organisaties"/
"Benchmark" voor een Admin, alleen "Organisaties" voor een Consultant,
zie Wat beheerbaar is hieronder) → scheidingslijn → Accountmenu.

**Geen "← Terug naar site" in beheer.** Voegt niets toe en verwart met
"Uitloggen" (twee manieren om "weg te gaan" naast elkaar, onduidelijk
welke wat doet), beheer heeft dus geen exit-actie (punt 3 van de
navigatieregel), en dus ook geen scheidingslijn ervóór (punt 2):
Alleen scherm-specifieke acties, één scheidingslijn, Accountmenu.
Uitloggen is de enige manier om beheer te verlaten, via het accountmenu
hieronder. Was tot nu toe wél gespecificeerd; hierbij vervallen.

Eén dropdown-knop, zelfde patroon als de Dropdown-knop uit
`stylesheet.md` (zoals "Exporteren" op de resultatenpagina), niet twee
losse elementen naast elkaar.

- **Knop**: Toont het e-mailadres van de ingelogde gebruiker (bijv.
  "admin@coniche.nl"), met het pijltje van de dropdown-knop.
- **Dropdown-inhoud**: Eerste rij, niet-klikbaar: E-mailadres + rol
  tussen haakjes (bijv. "admin@coniche.nl (Consultant)"). Voor elke rol
  daarna de klikbare rij "Mijn account" (zie Mijn account hieronder) en voor
  een Admin daaronder de klikbare rij "Instellingen", die de pagina
  Instellingen opent (zie Instellingen hieronder). Daaronder staat voor elke
  rol de klikbare rij "Help", die de helppagina opent (`help.md`). Boven de laatste rij
  staat een scheidingslijn. Laatste rij, klikbaar: "Uitloggen". Een
  Consultant heeft geen rij "Instellingen": Zijn menu bestaat uit de eerste
  rij, "Mijn account", "Help" en "Uitloggen". Functionaliteit van uitloggen blijft
  ongewijzigd ten opzichte van nu.
- **Actieve staat**: Zolang een pagina onder Instellingen open is, heeft de
  knop van het Accountmenu een duidelijke actieve staat, zoals een actieve
  hoofdlink, en is de rij "Instellingen" in het menu gemarkeerd. De
  vormgeving komt in `stylesheet.md`.
- **Toetsenbord**: Zoals de Dropdown-knop in `stylesheet.md`: Enter of spatie
  opent het menu, pijltjestoetsen lopen door de rijen, Esc sluit.

**Mijn account** (het wachtwoord komt met de echte inlog). Een modal volgens het patroon van "Mijn
gegevens" aan de respondentkant (`schermen.md`, Mijn gegevens-menu), voor Admin en
Consultant. Hier wijzigt een gebruiker zijn eigen gegevens. Wat een Admin bij
een andere gebruiker wijzigt, staat bij Gebruikers (punt 9).

- **Velden**: Naam (invoerveld), E-mailadres en Rol (beide alleen-lezen) en
  een knop "Wachtwoord wijzigen".
- **E-mailadres**: Kan in Mijn account door niemand worden gewijzigd, ook niet
  door een Admin. Een Admin wijzigt het wel via Instellingen, Gebruikers
  (punt 9). Het is de inlognaam en de sleutel
  (`datamodel.md`, Gebruiker). Het veld staat er wel, alleen-lezen, zodat
  duidelijk is waarmee je inlogt.
- **Rol**: Alleen-lezen. Een rol wijzigt alleen een Admin, bij een andere
  gebruiker (punt 9).
- **Wachtwoord wijzigen**: Klapt in dezelfde modal drie velden open: Huidig
  wachtwoord, Nieuw wachtwoord en Herhaal nieuw wachtwoord. Dit hoort bij de
  echte inlog met gehashte wachtwoorden (`backlog.md`, Fase 2) en komt daarmee.
- **2FA**: Staat hier niet. Een reset doet een Admin bij een andere gebruiker
  (punt 9). Zelf opnieuw instellen komt met de backend.
- **Opslaan en Annuleren**: Onder het formulier. Opslaan schrijft direct, zonder
  aparte bevestigingsstap, en sluit de modal met een korte bevestiging.
- **Rechten**: `account.bewerken`, bereik `zelf`, voor Admin en Consultant
  (`datamodel.md`, Rechtenmatrix). Een gebruiker kan alleen zijn eigen gegevens
  wijzigen.
- **Gelogd**: `gebruiker.eigenGegevensGewijzigd` (`datamodel.md`, Audit), met alleen
  welke velden zijn gewijzigd.

### Navigatie in beheer

Beheer heeft drie niveaus: De hoofdlinks in de nav (Assessments,
Organisaties, Resultaten) en Instellingen, dat via het Accountmenu opent,
daaronder de onderdelen van die link, en
daaronder de detailpagina's van één organisatie, Meting of Respondent.
Er is geen "Terug"-knop in de nav. Wel zijn er de hulpmiddelen hieronder.

- **Onderdelen binnen een hoofdlink**: Onder de nav staat een tabbalk
  met de onderdelen van de gekozen hoofdlink. Bij Organisaties zijn dat
  Organisaties en Respondenten, voor een Admin aangevuld met
  Organisatievelden. Bij Resultaten zijn dat Metingen en, voor een
  Admin, Benchmarks en Verkennen (punt 7 en 15). Bij Instellingen zijn
  dat Gebruikers, Drempels en termijnen, Algemene teksten, Content-pagina's,
  Audit-log en Data-integriteit. De tabbalk is zichtbaar op de
  lijstpagina's, niet op een detailpagina. Metingen en uitnodigen hebben
  geen tab: Die zitten in het organisatie-detail en het Meting-overzicht.
- **Kruimelpad op detailpagina's**: Boven de paginatitel staat het pad
  waarlangs je er bent gekomen, elk deel klikbaar behalve het laatste:
  Organisaties › Voorbeeld BV › Nulmeting 2026. Zo kom je altijd
  één of meer stappen terug zonder de browserknop. Het pad volgt de
  hiërarchie (Organisatie, Meting, Resultaten van één scan) en niet de
  klikgeschiedenis. Een Respondent-overzicht en een Scan-overzicht zijn
  modals en staan dus niet in het pad.
- **Klikken op een rij**: In elke lijst met Respondenten of ingevulde
  scans (de lijst Respondenten, het organisatie-detail en het
  Meting-overzicht) is de hele rij klikbaar en
  opent het overzicht (modal) van die Respondent of scan. Een rij met
  een "Bekijk" heeft die als compacte knop erbij voor wie het zoekt,
  met dezelfde werking. Een selectievakje, "Kopieer link" of een
  Meting-label in de rij opent de modal niet maar doet alleen zijn eigen
  werk. Er bestaat geen aparte detailpagina meer per scan.
- **Scan-overzicht (modal)**: Opent vanuit het Meting-overzicht en de
  scanregel in het
  Respondent-overzicht. De adresbalk krijgt `?scan=<id>`; sluiten,
  terugkeren en delen werken zoals hieronder bij het Respondent-overzicht.
  Vanuit het Scan-overzicht opent "Bekijk Respondent" het
  Respondent-overzicht in dezelfde modal (de inhoud wordt vervangen, de
  URL wordt `?respondent=<id>`), en andersom via een scanregel.
- **Respondent-overzicht (modal)**: Opent vanuit de lijst Respondenten,
  het organisatie-detail en het Meting-overzicht, en de adresbalk krijgt
  dan `?respondent=<id>`. Sluiten kan met het kruisje, Esc, een klik naast
  de modal of de terugknop van de browser. Je komt terug op de pagina
  waar je was, met dezelfde filters, sortering en scrollpositie. Een
  gedeelde link met `?respondent=<id>` opent de pagina met de modal erop,
  mits de ontvanger bij die Respondent mag (zelfde bereik als de lijst).
- **Leads-venster (modal)**: Opent vanuit het blok Leads op het
  organisatie-detail (punt 6a), alleen voor een Admin. De adresbalk krijgt
  `?leads=<organisatieId>`. Sluiten, terugkeren en delen werken zoals bij het
  Respondent-overzicht. Een gedeelde link opent de pagina met het venster
  erop, mits de ontvanger een Admin is.
- **Filters in de URL**: De lijsten Respondenten en Metingen
  bewaren hun filters, sortering en pagina in de adresbalk (zoals
  de audit-log, punt 12), zodat terugkeren uit een detailpagina of
  modal dezelfde lijst toont.

**Wat er gebeurt na een actie in het Respondent-overzicht**:

- Bewerken, de Lead-rol aan- of uitzetten of een scan naar een andere Meting: De modal
  blijft open en het getoonde blok ververst, met een korte bevestiging
  bovenin de modal.
- Verplaatsen naar een andere organisatie, samenvoegen of verwijderen van
  de hele Respondent: De Respondent hoort daarna niet meer bij deze
  pagina. De modal sluit, de lijst ververst en bovenaan de pagina staat
  een melding met wat er gebeurde. Bij verplaatsen bevat de melding een
  link naar de Respondent in de nieuwe organisatie.
- Eén scan naar een andere organisatie: De Respondent blijft staan, het
  blok Scans ververst en de verplaatste scan verdwijnt uit de regel.

**Naar de resultaten van een scan** (via "Resultaten bekijken" in het
Scan-overzicht of "Bekijk resultaten" in een scanregel van het
Respondent-overzicht): Het resultatenscherm (`schermen.md`, Resultatenpagina) toont in
beheer de gewone beheer-nav met het kruimelpad Organisaties › Organisatie
› Meting › Resultaten van {Respondent} (via Resultaten: Resultaten › Organisatie
› Meting › Resultaten van {Respondent}; de hoofdlink waarlangs je kwam
bepaalt het begin van het pad), en niet de respondentacties
"Terug naar de scan" en "Terug naar Mijn metingen". Wel de dropdown
"Exporteren". Terug gaat via het kruimelpad. Dat wordt het Meting-overzicht
en niet de Respondent-modal, want die is niet meer open. Boven de resultaten
staat een schakelaar met Scores van deze scan en Positie in de Meting (zie `visualisatie-scores.md`, Navigatie).

**Organisatie-resultaten** (punt 4): Zelfde kruimelpad, eindigend op
Resultaten van de Meting.

---

## Wat beheerbaar is

Vier hoofdonderdelen: Drie links in `.nav-right`, **Assessments**,
**Organisaties** en **Resultaten**, en **Instellingen** (voorheen
Applicatie), dat niet in de nav staat maar opent vanuit het Accountmenu
(zie Accountmenu bovenaan). Voor een Admin alle vier zichtbaar. Een
Consultant ziet **Organisaties** en **Resultaten**, beide met bereik `eigen`.
Assessments en Instellingen gaan over dingen die voor de hele omgeving
gelden, niet over het eigen werk van één Consultant. "Overzicht" als apart
dashboardscherm vervalt: Er is geen aparte dashboardlink, je landt direct
op een van de hoofdlinks.

De nummering van de onderdelen hieronder (1 t/m 12) is ongewijzigd ten
opzichte van eerdere versies van dit document waar al naar "punt X"
verwezen wordt elders (`datamodel.md`, `CLAUDE.md`), alleen de
indeling in drie navigatielinks hieronder is nieuw, met drie nieuwe
onderdelen (2a, 11 en 12). Benchmark is nummer 14.

| Link | Onderdelen |
|---|---|
| **Instellingen** (Admin-only, via het Accountmenu) | 9. Gebruikers, 10. Drempels en termijnen, 2a. Algemene teksten, 11. Content-pagina's, 12. Audit-log, 13. Data-integriteit |
| **Assessments** (Admin-only) | 1. Assessment-types, 2. Content |
| **Organisaties** (Admin: Alle, Consultant: Eigen) | 3. Organisatievelden, 4. Organisaties, 5. Metingen, 6. Respondenten uitnodigen, 6a. Leads (toegang per weergave, Admin-only), 6b. Respondenten, 8. Import (knop in het organisatie-detail, alleen voor een Admin) |
| **Resultaten** (Admin: Alle, Consultant: Eigen) | 7. Resultaten (tab Metingen), 14. Benchmarks (tab, Admin-only) |

### Instellingen (Admin-only)

Heette eerder Applicatie en stond als hoofdlink in `.nav-right`. Het is nu een
rij in het Accountmenu (zie Accountmenu bovenaan), alleen voor een Admin. Een
klik opent de pagina Instellingen, met de tabbalk uit Navigatie in beheer:
Gebruikers, Drempels en termijnen, Algemene teksten, Content-pagina's,
Audit-log en Data-integriteit. De eerste tab, Gebruikers, is de landingstab.
De inhoud van de onderdelen is niet veranderd, alleen de plek. Een Consultant
heeft de rij niet en de pagina's zijn voor hem niet bereikbaar, ook niet via
de adresregel, zoals elke Admin-only pagina.

#### 9. Gebruikers (Admin-only)

Los beheeronderdeel met de lijst en het beheer van alle Admin- en
Consultant-accounts (`datamodel-rollen.md`, `Gebruiker`). Het hele
onderdeel is Admin-only: Een Consultant ziet het niet, ook niet als
lijst, en heeft er geen link naar. Respondenten en Leads blijven
bereikbaar via de organisatie (punt 4), niet hier.

- **Lijst**: Naam, e-mail, rol, status (actief/gedeactiveerd), laatst
  ingelogd.
- **Aanmaken**: Naam, e-mail, rol. De Admin triggert het aanmaken en het
  systeem genereert het wachtwoord (12 tekens), dat de Admin eenmalig in
  beeld krijgt en daarna niet meer kan terugzien. Een link waarmee de gebruiker zelf een
  wachtwoord instelt volgt met de mailserver (`backlog.md`).
- **Wijzigen**: Naam, e-mail, rol.
- **Deactiveren, niet verwijderen**: Nooit hard verwijderd
  (`datamodel-rollen.md`). Actie heet "Deactiveren", `.btn-danger` met
  bevestiging.
- **Eigenaarschap bij deactiveren van een Consultant**: Verplicht
  overzetten van diens organisaties naar een andere Consultant of Admin
  vóórdat deactiveren definitief is (per organisatie of in bulk).
  Organisaties die alleen aan hem waren **toegewezen** (niet
  aangemaakt) hoeven niet overgezet te worden: Die toewijzing vervalt
  gewoon, dat blokkeert het deactiveren niet (`datamodel-rollen.md`,
  Eigenaarschap en toegang van/tot organisaties).
- **Minimaal 1 actieve Admin verplicht**: Deactiveren van een Admin is
  geblokkeerd zolang hij de laatste actieve Admin is, met een duidelijke
  melding waarom. Geldt ook bij zelf-deactivering: Geen aparte regel
  nodig, dezelfde check geldt altijd.
- **2FA**: `tfaActief` verplicht voordat beheer toegankelijk is, via
  TOTP (authenticator-app, `datamodel-rollen.md`, 2FA: TOTP via
  authenticator-app), geen sms of e-mail. Komt met de backend, niet in
  dit punt. Al genoteerd in `backlog.md` onder rollen/rechten/inlog.
  **Reset-actie op een andere Gebruiker**: Een Admin kan diens
  `tfaActief` terugzetten (bijv. bij een kwijtgeraakt toestel zonder
  geldige herstelcodes meer), niet bij zichzelf zolang hij de laatste
  actieve Admin is, zelfde soort regel als hierboven.

**Toegang tot dit scherm**: Alleen Admin (`gebruikers.beheren`, bereik
`alle`, Rechtenmatrix). Een Consultant ziet "Instellingen" niet in
het Accountmenu.

#### 10. Drempels en termijnen (Admin-only)

Heette eerder Instellingen. Die naam is nu van het hoofdonderdeel hierboven.
Klein, groeit later mee. Waarden die een Admin hier instelt:

- **Sessieduur respondenten/Leads** (`sessieDuurUren`, `datamodel.md`
  deel 2, Toegang voor respondenten): Hoe lang een `ToegangsSessie`
  geldig blijft na een geslaagde verificatie, **default 4 uur**. Eén
  getal, geldt voor de hele omgeving, niet per organisatie of
  respondent.
- **Bewaartermijn ingevulde scans** (`bewaarTermijnDagen`,
  `datamodel-rollen.md`, Bewaartermijn ingevulde scans). **Opmaak van de
  rij**: Veld, eenheid ("dagen") en Info-icoon staan op één regel en het
  icoon valt nooit naar een eigen regel (`stylesheet.md`, Info-icoon, Nooit
  van de regel af). Hetzelfde geldt voor de aantallen scans bij de
  benchmarkdrempels hieronder. Aantal dagen
  na `ScanInvulling.afgerondOp` waarna een ingevulde scan als "oud"
  geldt. Geen default, door een Admin zelf te bepalen
  (`privacy-pagina.md` noemt dit als openstaand). Eén globale waarde voor
  de hele applicatie, geen instelling per organisatie. Dezelfde termijn
  geldt voor de audit-log (punt 12). Zolang de waarde leeg is, kan de
  lijst "Data ouder dan de bewaartermijn" (punt 4) niets tonen, en toont
  dit scherm een waarschuwing dat de bewaartermijn nog niet is
  ingesteld.
- **Verlengtermijn** (`verlengTermijnDagen`): Met hoeveel dagen de
  lijst "Data ouder dan de bewaartermijn" een scan uitstelt bij
  "Verlengen" (punt 4).
- **Minimale groepsgrootte benchmark** (`benchmarkMinOrganisaties`,
  startwaarde 5): Het minimale aantal organisaties per Assessment in een
  benchmark, inclusief de organisatie van de view, om die view voor een Lead
  aan te kunnen vinken in het Leads-venster. Bij een opgeslagen verkenning telt hij altijd Organisaties, ook bij de eenheid Onderdelen. Eén getal voor deze drempel van niveau 1. De betekenis
  staat in `benchmark.md`, Drempels. Het privacy statement noemt dezelfde
  waarde (`privacy-pagina.md`, sectie 3a).
- **Minimaal aantal scans per Meting in een benchmark**
  (`benchmarkMinScans`, startwaarde 3): Het minimale aantal afgeronde
  scans dat een Meting moet hebben om in een benchmark gekozen te kunnen
  worden.
- **Maximaal aantal dagen tussen Metingen bij Naast elkaar**
  (`benchmarkMaxDagenTussenMetingen`, startwaarde 90): Het aantal
  dagen tussen de oudste en de nieuwste meetdatum in een vergelijking met de
  lezing Naast elkaar, waarboven de Admin bij het opslaan een waarschuwing
  krijgt (`benchmark.md`, Niveau 2, Lezing). Het is geen blokkade en geldt niet
  bij Ontwikkeling over tijd. Een geheel getal van minstens 1.
- **Minimaal aantal scans per Meting voor een Lead**
  (`benchmarkMinRespondenten`, startwaarde 5): Het minimale aantal
  afgeronde scans in een Meting om de kolom Antwoorden bij anonieme namen voor
  een Lead aan te kunnen vinken (punt 6a), om Spreiding voor een Lead aan te kunnen vinken en om voor een Lead de lijn van
  laagste tot hoogste score aan te zetten (`visualisatie-scores.md`,
  onderdeel A).

**Formulier Verkennen** (`visualisatie-verkennen.md`, Drempels). Een eigen formulier onder Drempels en termijnen, naast de formulieren Bewaartermijn en Benchmark, met de kop Verkennen en een Info-icoon (`info.verkennenInstellingen`). Het bevat de grenzen die bepalen wanneer Verkennen een groep, een vergelijking of een groepering toestaat. Het formulier heeft vijf velden: `verkennenMinGroep`, `verkennenMinVergelijking`, `verkennenMinPool`, `verkennenMinIngevuldPct` en een vijfde grens (`visualisatie-verkennen.md`, Drempels), met het Info-icoon `info.verkennenInstellingen`. De startwaarden 3, 5, 6, 12 en 40 zijn de norm vanuit het ontwerp en blijven de beginstand. Een Admin kan elke waarde in de praktijk aanpassen.

| Veld | Instelling | Startwaarde | Wat het doet |
|---|---|---|---|
| Organisaties in een groep, minimum | `verkennenMinGroep` | 3 | Een kleinere groep is gestreept en krijgt in de heatmap geen cijfers. Ook het minimum voor het verband in weergave 4. |
| Organisaties in focus of rest, waarschuwing | `verkennenMinVergelijking` | 5 | Een kleinere focus of rest krijgt een waarschuwing. Het is geen blokkade. |
| Organisaties in de pool, minimum | `verkennenMinPool` | 6 | In een kleinere pool kan er niet gegroepeerd worden. |
| Waarden per kenmerk, maximum | `verkennenMaxGroepen` | 12 | Een select-kenmerk met meer verschillende waarden in de pool kan niet groeperen. |
| Kenmerk ingevuld, minimum | `verkennenMinIngevuldPct` | 40 | Een kenmerk dat bij een lager percentage van de Organisaties in het Assessment is ingevuld, kan niet groeperen en staat grijs in het menu Kenmerk toevoegen. Bij 0 geldt geen ondergrens. |

- **Opmaak**: Eén rij velden die op een smal scherm doorloopt naar de volgende regel. Per veld het label in het label-formaat (`--fs-12`, gewicht 700, hoofdletters) boven een invoerveld van `--control-h` (40px), met onder het veld in `--fs-12` en `var(--ink-s)` wat het doet (bij het percentage de eenheid). Onder de velden de knop Opslaan en het Info-icoon op één regel. Het formulier heeft geen Annuleren, net als Benchmark.
- **Invoer**: Gehele getallen van minstens 1. Alleen het percentage mag 0 zijn (dan geldt geen ondergrens voor hoe vaak een kenmerk is ingevuld) en ligt tussen 0 en 100. Bij een ongeldige waarde staat er naast Opslaan "Vul bij elk veld een geheel getal van minstens 1 in (bij het percentage mag 0). Het percentage kan niet boven 100." en schrijft Opslaan niets.
- **Opslaan** schrijft direct. De nieuwe waarden gelden vanaf het volgende scherm Verkennen, voor alle Assessments. Het scherm slaat zijn eigen keuzes niet op, dus er valt niets te migreren.
- **Alleen een Admin** ziet dit formulier en kan het wijzigen.

#### 2a. Algemene teksten

Teksten los van een specifiek Assessment (`datamodel.md`, Algemene
teksten): `AlgemeneTekst { sleutel, waarde }`, één tekstveld per
sleutel, niet per Assessment/organisatie. Nu enkel de introtekst boven
de scanlijst op "Mijn metingen" (`mijnMetingenIntro`). Was tot nu toe
hardcoded in de code, dus dit maakt 'm voor het eerst zelf aan te
passen zonder Sander erbij te hoeven halen.

Staat onder Instellingen, niet onder Assessments (punt 2, Content): Deze
teksten horen niet bij één Assessment maar bij de applicatie als
geheel.

**Info-icoon-teksten.** Ook de teksten achter de Info-iconen
(`stylesheet.md`, Info-icoon) zijn Algemene teksten, met een sleutel per
plek, bijvoorbeeld `info.bewaartermijn`. De standaardtekst blijft in de
code staan. Een lege of ontbrekende waarde betekent de standaardtekst, net
als bij `wegingToelichting`.

- **Aanpassen op de plek zelf**: Een Admin ziet in het open Info-icoon een
  potlood links van het sluitkruisje, op elk scherm van de app waar hij is
  ingelogd. Een klik opent een tekstvak met "Opslaan" en "Annuleren", en
  een knop "Standaardtekst herstellen" zodra de tekst afwijkt. Een
  Consultant, Lead of Respondent ziet geen potlood.
- **Opmaak**: Platte tekst met regeleinden, maximaal 500 tekens, geen
  links of HTML en geen variabelen.
- **Overzicht**: Onder Algemene teksten staat een lijst met alle
  Info-icoon-sleutels, de plek en de actuele tekst, zodat ze ook
  gebundeld na te lopen zijn.
- **Logging**: Een wijziging wordt gelogd als `algemeneTekst.gewijzigd`
  met alleen de sleutel en niet de tekst (`datamodel.md`, Audit).
- **Nieuw Info-icoon**: Elk nieuw Info-icoon krijgt hier een sleutel, een
  plek en een initiële tekst.

Register van de Info-iconen (overgenomen uit `data/info-teksten.ts`, de
standaardteksten zoals ze nu in de app staan):

| Sleutel | Plek | Tekst |
|---|---|---|
| `info.bewaartermijn` | Instellingen, Drempels en termijnen, formulier Bewaartermijn ingevulde scans | Zonder ingestelde bewaartermijn verschijnt hier nooit een scan: Er is geen automatische verwijdering, alleen een melding zodra jij een termijn instelt. |
| `info.importBestanden` | Importeren (organisatie-detail), bij "Bestanden kiezen" | Meerdere bestanden tegelijk mogen: Houd Cmd/Ctrl (of Shift voor een reeks) ingedrukt bij het selecteren, of kies direct een hele map met losse CSV's. Elk bestand mag een ander bronformaat hebben, dat wordt per bestand apart herkend. |
| `info.importRijen` | Importeren (organisatie-detail), bij "rijen importeren" | Rijen met een 95%+-vraagtekstmatch (niet 100%) tellen pas mee na een expliciete goedkeuring per rij, met de knop "Goedkeuren" in de tabel hierboven. |
| `info.respondentBewerken` | Respondent-overzicht, bewerkformulier | De persoonlijke link blijft ongewijzigd, ook na een nieuw e-mailadres. Een wijziging geldt voor alle scans van deze Respondent. |
| `info.algemeneTeksten` | Algemene teksten, bij het tekstveld | Staat direct onder de titel op de persoonlijke link van elke respondent/Lead. |
| `info.contentIcoon` | Content, veld Icoon | Een emoji die op de kaart van dit assessment staat, bijvoorbeeld 🩺. |
| `info.contentSlotsectie` | Content, Slotsectie voor de PDF-export | Kies de titel en de bron van de slotsectie aan het eind van de PDF uit de vaste lijst. Zonder keuze krijgt de PDF geen slotsectie. |
| `info.auditLog` | Audit-log, naast de paginatitel | Wie (of het Systeem) wat deed, wanneer en op welk record. Alleen-lezen. Geen persoonsgegevens uit scans. |
| `info.algemeneTekstenPagina` | Algemene teksten, naast de paginatitel | Teksten los van één Assessment-type. Wijzigingen zijn direct zichtbaar, geen aparte publicatiestap. |
| `info.algemeneTekstenInfoIconen` | Algemene teksten, naast de kop Info-iconen | Alle toelichtingen achter een Info-icoon, met de plek en de actuele tekst. Aanpassen kan op de plek zelf, met het potlood in het open Info-icoon. |
| `info.contentToelichting` | Content, veld Toelichting van een bouwblok | Lopende tekst in de Toelichtingsmodal op de Assessment-pagina en in de kop van dit bouwblok in de doorloopflow. Een lege regel scheidt de alinea's. Laat je het veld leeg, dan ontbreekt dit onderdeel in de modal en in de kop. |
| `info.contentBouwblokLabel` | Content, veld Bouwblok-label | De kleine kop boven de titel in de Toelichtingsmodal en in de doorloopflow, bijvoorbeeld "Bouwblok" of "AI-domein", gevolgd door het nummer. |
| `info.conflictOplossen` | Conflict oplossen, naast de titel van de modal | Een Respondent heeft per Meting één scan. Hang één van de twee scans aan een andere Respondent. Alleen die scan gaat mee, de oorspronkelijke Respondent blijft bestaan met de andere scan. |
| `info.dataIntegriteit` | Instellingen, Data-integriteit, naast "Controleer nu" | Controleert of er, bijvoorbeeld na een verwijderactie, nog ingevulde scans zijn die naar een niet-bestaande Respondent verwijzen. |
| `info.startAssessment` | Assessment-landingspagina, achter de uitgeschakelde knop "Start assessment" | Toegang tot een assessment loopt via een persoonlijke uitnodiging. |
| `info.bulkExportOrganisatie` | Resultaten, lijst Metingen, achter de uitgeschakelde knop "Exporteren" bij een selectie over meer dan één organisatie | Bulk-export kan alleen binnen één organisatie. Filter eerst op Organisatie. |
| `info.metingBegrippen` | Organisatie-detail, naast de kop "Metingen" | Onderdeel: Welk deel van de organisatie gemeten wordt, zoals "Zuid-Nederland Zakelijk", of "Hele organisatie". Assessment: De vragenlijst. Meetdatum: De dag waarop gemeten wordt, niet de dag van aanmaken of importeren. Meting: Eén onderdeel met één Assessment op één meetdatum, de Respondenten horen bij een Meting. De naam van de Meting maakt de app uit onderdeel en meetdatum, je kunt hem achteraf aanpassen. |
| `info.scansSamenbrengen` | Resultaten, lijst Metingen, achter de uitgeschakelde knop "Samenbrengen in één Meting…" bij een selectie met meer dan één Assessment of meer dan één organisatie | Samenbrengen kan alleen voor Metingen van hetzelfde Assessment, binnen één organisatie. Selecteer alleen Metingen van één Assessment. |
| `info.assessmentVerwijderen` | Assessments, op de kaart en het detail, naast de uitgeschakelde knop "Verwijderen" | Verwijder eerst alle Metingen van dit Assessment, bij alle organisaties. Daarna kan het Assessment worden verwijderd. Dit kan niet ongedaan worden gemaakt. De tekst begint altijd met het aantal Metingen en organisaties, die zin maakt de app zelf. |
| `info.vergelijkMetingen` | Resultaten van een Meting, naast de uitgeschakelde knop "Vergelijking" | Deze Meting zit in geen enkele vergelijking. Een Admin maakt die aan onder Resultaten, Benchmarks, met het niveau Binnen een organisatie. |
| `info.spreidingOnderdelen` | Resultaten van een samengestelde Meting, een vergelijking en een benchmark, naast de uitgeschakelde weergave Spreiding | Spreiding tussen onderdelen is er vanaf 3 onderdelen. Bij twee zegt een standaardafwijking weinig. |
| `info.antwoordenGeenScans` | Resultaten van een samengestelde Meting en een vergelijking, naast de uitgeschakelde weergave Antwoorden | Antwoorden per vraag is er alleen bij één Meting met scans. Een samengestelde Meting heeft geen scans en een vergelijking mengt Metingen. |
| `info.toonAls` | Resultaten van een samengestelde Meting en een vergelijking, naast het label Toon als | Gemiddeld telt elk onderdeel even zwaar mee, ongeacht het aantal scans, en laat niet zien welk onderdeel waar zit. Naast elkaar geeft elk onderdeel een eigen vorm op zijn eigen score. De vorm onderscheidt de onderdelen, niet de kleur. |
| `info.toonAlsTeVeel` | Resultaten van een samengestelde Meting en een vergelijking, naast de uitgeschakelde keuze Naast elkaar | Naast elkaar is er bij hoogstens zes onderdelen, want er zijn zes vormen. Bij meer onderdelen toont de weergave het gemiddelde. |
| `info.positieMeting` | Resultaten van één scan, naast de uitgeschakelde weergave "Positie in de Meting" | De positie van een scan tegenover de andere scans in de Meting is er pas bij voldoende afgeronde scans. Bij minder is een scan te herleiden naar een persoon. Het minimum staat bij Drempels en termijnen (aantal respondenten per Meting). |
| `info.mijnAccountWachtwoord` | Mijn account, naast de uitgeschakelde knop "Wachtwoord wijzigen" | Wachtwoord wijzigen komt met de echte inlog. Tot die tijd vraag je een Admin om je wachtwoord te wijzigen. |
| `info.benchmarkInstellingen` | Instellingen, Drempels en termijnen, formulier Benchmark | Een Lead ziet een vergelijking pas als de groep groot genoeg is, inclusief het lid van de view: Zoveel organisaties (tussen organisaties), Metingen (binnen een organisatie) of scans in de Meting (binnen een Meting). Het aantal scans per gekozen Meting is hoeveel afgeronde scans een Meting minstens moet hebben om in een benchmark gekozen te kunnen worden. Het aantal dagen tussen Metingen is voor een vergelijking met de lezing Naast elkaar: Liggen de meetdata verder uit elkaar, dan krijg je bij het opslaan een waarschuwing. Opslaan blijft mogelijk. |
| `info.verkennen` | Verkennen, naast de paginatitel | Verkennen werkt op de pool van één Assessment: De Organisaties met toestemming voor benchmark die een Meting hebben met genoeg afgeronde scans, per Organisatie de Meting die telt volgens de Meetperiode, of de meest recente als je geen periode kiest. Elke Organisatie telt even zwaar mee. Het scherm slaat niets op en een Lead ziet het nooit. |
| `info.organisatieToegang` | Organisatie-detail, kaart Toegang, naast de titel | De eigenaar is de Consultant die de organisatie heeft aangemaakt. Een toegewezen Consultant mag deze organisatie ook zien en beheren, en dezelfde gegevens inzien. Intrekken haalt die toegang weer weg. |
| `info.benchmarkVlag` | Organisatie-detail, bij de schakelaar "Doet mee aan benchmark" | Zet dit pas aan nadat dit met de organisatie is afgesproken, bijvoorbeeld via contract of mail. Zonder deze schakelaar staat de organisatie niet in de keuzelijst van een benchmark. Uitzetten haalt de organisatie uit alle benchmarks. |
| `info.leadToegangCel` | Leads-venster van de organisatie, in een grijze cel | De reden volgt de situatie. Spreiding, Antwoorden en Exporteren kunnen pas aan als Resultaten van dezelfde Meting aan staat. Een samengestelde Meting heeft alleen Resultaten. Spreiding heeft te weinig scans om anoniem te blijven. Bij anonieme namen heeft de Meting te weinig afgeronde scans om anoniem te blijven. Een benchmark is er pas als de groep groot genoeg is, en bij een benchmark binnen een organisatie ook als de Lead Resultaten heeft van een Meting in die benchmark. Bij een Verkenning met te weinig Organisaties staat er: "Te weinig Organisaties in deze groep: {n}, minimaal {min}." |
| `info.antwoordenMetNamen` | Organisatie-detail, bij het vinkje "Namen tonen bij Antwoorden" | Uit: Leads zien de antwoorden als R1 tot en met Rn. Aan: Leads zien de namen van de respondenten. Stem dit af met de opdrachtgever voordat je het aanzet. Het geldt voor alle Leads van deze organisatie. |
| `info.benchmarkAanmaken` | Benchmark aanmaken of wijzigen, achter de uitgeschakelde knop | Een benchmark heeft een naam nodig, minstens één Assessment en minstens één organisatie die je hebt aangevinkt. Een organisatie staat alleen in de lijst als ze meedoet aan benchmarks en een Meting heeft van een gekozen Assessment met genoeg afgeronde scans. |
| `info.benchmarkAanmakenMetingen` | Benchmark binnen een organisatie aanmaken of wijzigen, achter de uitgeschakelde knop | Een vergelijking tussen Metingen heeft een naam nodig, een organisatie, een Assessment en precies twee Metingen. Een Meting is alleen te kiezen met een meetdatum en genoeg afgeronde scans. |
| `info.benchmarkAanmakenScans` | Benchmark binnen een Meting aanmaken of wijzigen, achter de uitgeschakelde knop | Een benchmark binnen een Meting heeft een naam nodig, een organisatie, een Assessment en een Meting. Een Meting is alleen te kiezen met genoeg afgeronde scans. |
| `info.exportEenScan` | Meting-overzicht en de lijsten onder Resultaten, achter de uitgeschakelde opties "Als PDF" en "Voor InDesign (XML)" | Beschikbaar bij precies één scan. |
| `info.korteNaamOrganisatie` | Organisatie aanmaken en bewerken, naast het veld Korte naam | Een korte naam staat in de kolomkoppen van matrices en heatmaps, bijvoorbeeld "Rabobank" in plaats van de volledige naam. Laat je het veld leeg, dan geldt de naam zelf. De volledige naam staat in de tooltip. |
| `info.verkennenInstellingen` | Instellingen, Drempels en termijnen, formulier Verkennen | Grenzen voor Verkennen. Een groep onder het minimum is gestreept en krijgt geen cijfers. Bij een kleinere focus of rest staat een waarschuwing. In een kleinere pool kun je niet groeperen. Een kenmerk met meer waarden dan het maximum of een lagere invulling dan het minimum kan niet groeperen. |
| `info.verkennenKenmerken` | Verkennen, kaart Kenmerken, naast de titel | Zet hier een kenmerk neer om op te filteren en om op te groeperen. Een kenmerk zonder gekozen waarde filtert niets. Filteren op bereik bij getallen volgt later. |
| `info.verkennenGroeperen` | Verkennen, naast het label Groeperen op | Kies een kenmerk om de Organisaties in groepen te verdelen. Daarna kies je de groep waarop je inzoomt (de focusgroep). Die wordt vergeleken met alle andere Organisaties. Is er nog geen kenmerk, dan staat er: Er is nog geen kenmerk om op te groeperen. Voeg bij Kenmerken een kenmerk toe, dan kun je de Organisaties erop in groepen verdelen. |
| `info.verkennenEenheid` | Verkennen, naast het label Eenheid | Kies waarover je vergelijkt. Bij Organisaties telt elke Organisatie één keer, met de Meting uit de Meetperiode. Bij Onderdelen telt elk onderdeel van een Organisatie apart, en elk onderdeel telt even zwaar mee. Een samengestelde Meting telt bij Onderdelen niet mee. |
| `info.verkennenMeetperiode` | Verkennen en het wijzigen van een opgeslagen verkenning, naast het label Meetperiode | Per Organisatie telt de laatste Meting met een meetdatum in deze periode. Zo kun je de eerste meting blijven vergelijken, ook als de volgende al deels binnen is. Zonder periode telt de meest recente Meting. Een Organisatie zonder Meting in de periode doet niet mee. |
| `info.verkennenOpslaan` | Verkennen, naast de knop Opslaan als benchmark | Je slaat de filters op en niet de uitkomst. De groep volgt de filters: Komt er een Organisatie bij die erbij past, dan telt die mee. Daarna wijs je de benchmark toe aan een Lead van een Organisatie die erin zit, in het Leads-venster van die Organisatie. |
| `info.korteNamen` | Organisatievelden, tab Korte namen, naast de titel, en in de modal Korte namen in Verkennen | Een korte naam staat op de chips en in de grafieken van Verkennen. De Organisatie houdt de originele waarde, ook in de exports. Laat je het veld leeg, dan geldt het origineel. |
| `info.contactpersonen` | Organisatie-detail, bij Kenmerken, naast de kop Contactpersonen | Mensen bij de organisatie die voor Coniche relevant zijn, met hun functie en het LinkedIn-profiel. Het zijn geen Respondenten en ze krijgen niets toegestuurd. Een Admin beheert ze, een Consultant met toegang tot deze organisatie ziet ze. |
| `info.dossier` (vervangt `info.nieuwsartikelen`) | Organisatie-detail, kaart Dossier, naast de titel | Cases en nieuws die je bij deze organisatie bewaart. Alleen jij en je collega-consultants zien ze. De Lead ziet een item pas als het Dossier zichtbaar is én het item op Zichtbaar voor Lead staat. Een case kan alleen zichtbaar worden als de organisatie in de case dat heeft toegestaan. |
| `info.caseVlag` | Organisatie-detail, bij het vinkje "Mag als case gebruikt worden" | Zet dit pas aan nadat dit met de organisatie is afgesproken, bijvoorbeeld via contract of mail. Dan mag een consultant deze organisatie als case laten zien aan de lead van een andere organisatie. De lead ziet de branche en de omvang, nooit de naam. Uitzetten haalt de cases met deze organisatie meteen weg bij de leads. |
| `info.kpiBlok` | Organisatie-detail, blok KPI's, naast de titel | Algemeen geldt voor de hele organisatie en voor alle kanalen samen. Vul in wat je weet en splits uit zodra je meer weet. |
| `info.kpiPlek` | Modal KPI's invullen, naast het label Plek | Kies voor welk deel van de organisatie je invult. Algemeen is de hele organisatie. |
| `info.kpiKanalen` | Modal KPI's invullen, naast het label Kanalen uitsplitsen | Kies alleen de kanalen waarvoor je cijfers hebt. De kolom Algemeen blijft altijd staan. |
| `info.kpiDefinities` | Organisatievelden, tab KPI's en kanalen, naast de titel KPI's | Per KPI bepaal je of hij per onderdeel en per kanaal ingevuld mag worden. Algemeen is altijd mogelijk. |
| `info.kanalen` | Organisatievelden, tab KPI's en kanalen, naast de titel Kanalen | De lijst met kanalen die bij een KPI kunnen staan. Een kanaal telt als ingezet bij een volume boven 0. |
| `info.metingOnderdeel` | Meting plannen en de andere formulieren met een veld Onderdeel, naast het label Onderdeel | Kies een onderdeel van deze organisatie of maak een nieuw onderdeel aan. Een nieuw onderdeel verschijnt ook als kolom bij de KPI's. |

Elk nieuw Info-icoon krijgt hier een regel en een regel in
`data/info-teksten.ts`. Een standaardtekst bevat geen verwijzing naar een
document of andere bouwerstekst.

#### 11. Content-pagina's (Visie, Bouwblokken, AI, 2030)

De content van Visie, Bouwblokken, AI en 2030 staat als secties op de Assessment-pagina (`schermen.md`, Assessment-pagina). Dit onderdeel maakt ze bewerkbaar vanuit beheer, net als Algemene teksten hierboven:

- **Visie** (`visie-coniche.md` deel 1) en **2030**
  (`content-2030.md`): Secties met tekst (de Visie met drie kaarten, de 2030 met vijf kaarten en een uitklapbaar stuk). Eén
  tekstveld per pagina, zelfde soort component als Algemene teksten.
- **Bouwblokken**: De 15 bouwblokken uit `visie-coniche.md` /
  `visual-bouwblokken-en-domeinen.md`. Titel en omschrijving per bouwblok
  bewerkbaar. De interactieve visual zelf (indeling, volgorde,
  interactie) niet, dat blijft vast, alleen de tekstinhoud erin wordt
  beheerbaar.
- **AI**: De 8 AI-domeinen uit `visie-ai-klantcontact.md` /
  `visual-bouwblokken-en-domeinen.md`. Titel en modal-tekst per domein
  bewerkbaar, de visual zelf niet, zelfde uitgangspunt als Bouwblokken.

**Nog open**: Het onderliggende datamodel hiervoor (records per
bouwblok/domein, versiebeheer, of het archiveren i.p.v. verwijderen
zoals bij Content per Assessment) is nog niet uitgewerkt, dit
beschrijft alleen wélke content beheerbaar wordt, niet de
implementatie ervan. Zie Open punten onderaan dit document.

#### 12. Audit-log

`AuditEvent` (`datamodel-rollen.md`,
Audit) wordt al gelogd: Wie (of "Systeem") wat deed, wanneer, op welk
record. Er was nergens een scherm om die logging terug te zien.
Alleen-lezen overzicht, Admin-only (net als de rest van Instellingen):

- **Kolommen**: Tijdstip, Actor, Actie (bijv. "organisatie.verwijderd",
  "respondent.uitgenodigd"), Entiteit en Details. Actor is de Gebruiker
  zoals die bij punt 9 staat (bij een Admin dus de inlognaam) of
  "Systeem". Entiteit toont het type en een herkenbare naam, bijv. de
  organisatienaam in plaats van kaal een `entiteitId`. Details staat
  leesbaar, niet als ruwe JSON, met namen van Organisatie, Assessment en
  Meting in plaats van ID's. ID's staan niet in de app maar alleen in de
  export. Een verwijderd record toont de naam zoals die was bij het
  loggen; die naam wordt daarom bij het loggen in `details` vastgelegd.
  De knop "Meer" (`.btn-outline .btn-compact`) staat alleen op
  importgroepen (zie "Een import als groep"), want alleen daar valt iets
  uit te klappen. Gewone rijen hebben geen knop en geen uitklapblok, ook
  geen ruwe JSON. De knop staat niet achter de detailtekst, maar in een
  eigen laatste kolom, rechts uitgelijnd, zoals de "Bekijk"-knoppen bij
  Organisaties (`stylesheet.md`, Knop in een lijstrij).
- **Geen persoonsgegevens uit scans**: De log gaat over wat gebruikers
  van de app deden, niet over de inhoud van een scan. Naam, e-mailadres,
  functie, team, notities en antwoorden van een Respondent staan niet in
  de log, ook niet in `details` of in een entiteitsnaam. Een scan is te
  herkennen aan Organisatie, Assessment en Meting. Doet een Respondent
  zelf iets (`actorType` `respondent`), dan toont Actor alleen
  "Respondent" met de Organisatie. Dit geldt ook voor de export.
- **Een import als groep**: Een import (`import-scans.md`) verschijnt als
  één groepsregel met een status (voltooid, deels, mislukt) en aantallen,
  bijv. "Import oude tool: 10 bestanden, 6 geïmporteerd, 3 overgeslagen, 1
  mislukt". De groep kent vier statussen: Geïmporteerd, overgeslagen,
  mislukt en nog niet geïmporteerd (rijen die in beeld bleven en nog niet
  zijn gedaan). Uitklappen toont een tabel met één regel per bestand of
  rij, in dezelfde opmaak als de Voorbeeldweergave in de importinterface
  (`import-scans.md`, punt 5): Bestand, Rij, Assessment, Organisatie,
  Respondent en Status. De status is een badge en zegt duidelijk of de
  rij wel of niet is geïmporteerd (Geïmporteerd, Overgeslagen, Mislukt of
  Nog niet geïmporteerd), met de reden bij overgeslagen en mislukt. Er
  staan geen knoppen in (goedkeuren kan alleen in de importinterface zelf).
  Er staat nooit ruwe JSON, een ID of een lange lijst bestandsnamen in
  een tekstregel. De groepsregel zelf houdt de korte samenvatting met
  aantallen. De losse gebeurtenis "import.gestart" toont geen eigen
  detailtekst met bestandslijst: De tabel vervangt die. De groep begint
  bij de eerste keer dat de knop "N rijen importeren" wordt gebruikt;
  goedkeuren en annuleren daarvoor logt niets. Rijen die later alsnog worden
  geïmporteerd,
  komen als nieuwe gebeurtenissen bij dezelfde groep, waarna de aantallen
  meeschuiven. De groepsregel is een afgeleid overzicht en geen
  opgeslagen record; de losse gebeurtenissen blijven onveranderlijk. De
  koppeling loopt via `AuditEvent.groepId` (`datamodel.md`, Audit).
  Ingeklapt is de lijst veel korter dan het aantal gebeurtenissen.
- **Aantallen**: Boven de lijst staat het aantal gebeurtenissen binnen de
  actieve filters en het totaal, bijv. "312 gebeurtenissen (van 1.940 in
  totaal)". Het zijn losse gebeurtenissen, ook binnen ingeklapte groepen.
  Een groepsregel toont zijn eigen aantallen.
- **Periode**: Keuzeknoppen Vandaag, 7 dagen, 30 dagen, 90 dagen, Alles
  en Aangepast, standaard 7 dagen. Een knop vult Vanaf en Tot met dat
  bereik; een datum aanpassen zet de keuze op Aangepast. De gekozen
  periode staat zichtbaar boven de lijst. Is er niets in de periode, dan
  staat er geen aparte melding en geen knop: De regel met de aantallen
  ("0 gebeurtenissen (van 0 in totaal)") zegt dat al, en de
  periodeknoppen bovenaan het formulier zijn de enige plek om het bereik
  te wijzigen. De lijst eronder blijft leeg. Een groep verschijnt zodra een van zijn gebeurtenissen in de
  periode valt.
- **Lijst en filters**: 50 gebeurtenissen per pagina, nieuwste eerst. De
  filters staan in de URL, zodat een gefilterd overzicht te delen is.
  Naast de periode zijn er een Actor-keuzelijst en een keuzelijst voor
  het type (het deel van de actie vóór de punt, bijv. Import,
  Organisatie, Meting, Respondent, Scan, Gebruiker, Benchmark), in plaats van het
  tekstveld "Actietype bevat". Voor imports komt een statusfilter bij
  (voltooid, deels, mislukt).
- **Export naar CSV**: Knop "Exporteren als CSV" boven de lijst. Het
  exporteert het gefilterde resultaat, dus alle pagina's en niet alleen
  wat zichtbaar is, met één rij per gebeurtenis (geen groepsregels).
  Kolommen: `tijdstip`, `actor`, `actie`, `entiteit_type`,
  `entiteit_naam`, `entiteit_id`, `groep_id`, `details` (leesbare tekst)
  en `details_json`. Formaat zoals de overige CSV's (`export-csv.md`):
  Puntkomma, UTF-8 met BOM, JSON-kolom als string. Bestandsnaam:
  `Audit-log export <datum>.csv`. De export zelf wordt gelogd
  (`auditlog.geexporteerd`, met de gekozen filters en het aantal rijen).
- **Bewaartermijn**: De bewaartermijn van ingevulde scans
  (`bewaarTermijnDagen`, `datamodel.md`, Bewaartermijn ingevulde scans)
  geldt ook voor de audittrail, gerekend vanaf het `tijdstip` van de
  gebeurtenis. Een afwijkende termijn voor de audittrail volgt alleen als
  daar later een eigen spec voor komt. **Geen automatische verwijdering**,
  net als bij scans: Verstrijkt de termijn, dan blijven de gebeurtenissen
  bestaan en krijgt de Admin een melding dat er gebeurtenissen ouder dan
  de bewaartermijn zijn. Verwijderen is een bewuste actie van de Admin,
  met een bevestiging die de periode en het aantal gebeurtenissen noemt
  (zoals elke verwijderactie, zie Verwijderen). Het opruimen zelf wordt
  gelogd (`auditlog.opgeruimd`, met periode en aantal). Open: De
  vormgeving van de melding, en of "Verlengen" zoals bij scans hier nodig
  is.
- **Geen selectie in de lijst zelf**: Het scherm is alleen-lezen, er valt
  niets te selecteren of per regel te verwijderen. Exporteren en het
  opruimen na de bewaartermijn (zie Bewaartermijn) zijn de enige acties.
- **Niet bedoeld als vervanging** van de acties die al ergens anders
  zichtbaar zijn (zoals de status van een Ingevulde scan, punt 7),
  dit is het overkoepelende overzicht voor wie/wat/wanneer, niet een
  tweede plek voor dingen die al een eigen scherm hebben.

#### 13. Data-integriteit (Admin-only)

Het onderdeel zorgt dat er geen wees-data in het systeem blijft zitten,
bijvoorbeeld ingevulde scans die na een verwijderactie nog naar een
niet-bestaande Respondent verwijzen. De pagina heeft een knop "Controleer
nu" met een Info-icoon (`info.dataIntegriteit`). Of het onderdeel in
productie blijft, is nog een besluit (`go-live-plan.md`).

**Uitkomst van de controle.** Bovenaan een samenvatting ("4 verwijzingen
naar een niet-bestaand record gevonden"), daaronder één regel per controle
met het aantal vondsten:

1. Ingevulde scans zonder bestaande Respondent.
2. Ingevulde scans zonder bestaande Meting.
3. Respondenten zonder bestaande Organisatie.
4. Metingen zonder bestaande Organisatie.
5. Leads met toegang tot een niet-bestaande Meting.

Een regel met een aantal groter dan nul heeft de knop "Bekijken". Een
regel met 0 heeft geen knop.

**Modal per controle.** "Bekijken" opent een modal met de titel van de
controle en het aantal, bijvoorbeeld "Respondenten zonder bestaande
Organisatie (4)". De modal toont per vondst een rij met genoeg gegevens
om het record te herkennen, en de acties. Persoonsgegevens zijn zichtbaar,
want de pagina is alleen voor een Admin, en komen niet in de audit-log
(`datamodel.md`, Audit). De modal blijft open na een actie, de rij
verdwijnt en het aantal telt af. Bij 0 vondsten sluit de modal met de
melding dat er niets meer te vinden is. Na het sluiten draait de controle
opnieuw, zodat de pagina klopt.

Een vondst heeft per controle deze gegevens en acties. Elke actie vraagt
een bevestiging. Wat een verwijderactie meeneemt, volgt de bestaande
verwijderfunctie (Verwijderen, onderaan deze pagina).

| Controle | Rij toont | Acties |
|---|---|---|
| Scan zonder Respondent | Meting, Assessment, afgerond op, de ontbrekende Respondent-verwijzing | "Aan Respondent koppelen" (kiezen uit de Respondenten van dezelfde Organisatie als de Meting), "Verwijderen" |
| Scan zonder Meting | Respondent, Organisatie, Assessment, afgerond op | "Aan Meting koppelen" (Metingen van dezelfde Organisatie en hetzelfde Assessment), "Verwijderen" |
| Respondent zonder Organisatie | Naam, e-mail, aantal scans | "Aan Organisatie koppelen" (kiezen uit bestaande Organisaties, zoals "Hele respondent verplaatsen" in punt 6b), "Verwijderen" met het aantal scans dat meegaat |
| Meting zonder Organisatie | Meting, Assessment, aantal scans | "Aan Organisatie koppelen", "Verwijderen" met het aantal scans dat meegaat |
| Lead met niet-bestaande Meting | Respondent, Organisatie, de verwijzing | "Verwijzing verwijderen" (alleen de toegang, de Respondent blijft) |

De acties werken per vondst. Er is geen bulkactie, omdat elke vondst een
bewuste keuze vraagt (koppelen of verwijderen). Aan een Respondent of
Meting zonder Organisatie wordt de Organisatie gekoppeld die de beheerder
kiest, en het Bewerkslot (`datamodel.md`) geldt zoals bij andere
bewerkingen.

**Audit-log.** Acties vanuit deze pagina gebruiken de bestaande acties voor
verplaatsen, omhangen en verwijderen (`datamodel.md`, Audit), met in
`details` dat ze vanuit Data-integriteit zijn gedaan. De controle zelf
(het klikken op "Controleer nu") wordt niet gelogd.

### Assessments (Admin-only)

#### 1. Assessment-types

Aanmaken en bewerken van een `Assessment` (`datamodel.md`): Naam, kort
label (voor de PDF-footer, bijv. "Volwassenheidsscan"), subtitel,
beschrijving, doelgroep, geschatte duur, het bouwblok-label (de eyebrow
in de Toelichtingsmodal en de doorloopflow, standaard "Bouwblok", bij de AI-scan
"AI-domein"), de vijf schaallabels, en de
slotsectie voor de PDF-export (`pdfContentSecties`, zie
  `export-pdf-visual-volwassenheidsscan.md`, Slotsectie per scan-type):
Een titel en een bron, gekozen uit een vaste lijst, geen vrij
tekstveld.

**Sector-variant aanmaken vanuit een template** (`datamodel.md`,
Sector-varianten): Naast "Nieuw Assessment aanmaken" (leeg) een tweede
actie, "Aanmaken vanuit bestaand Assessment". Kies een bestaand
Assessment als template; de actie kopieert al zijn Categorieën,
Bouwblokken en Vragen naar nieuwe content-records onder het nieuwe
Assessment (`afgeleidVanAssessmentId` wijst terug naar het template,
puur ter herkomst). Daarna bewerk je de kopie als een gewoon
Assessment: Naam/kortLabel aanpassen (bijv. "Zorgscan"), en per
Bouwblok/Vraag de tekst, en per Bouwblok het gewicht (zie Content).
Het gewicht en de wegingstekst (`Assessment.wegingTitel` en
`wegingToelichting`) worden bij het kopiëren meegenomen. Geen
lopende koppeling met het template: Een latere wijziging daarop werkt
niet door in de sector-variant.

In de Assessment-lijst in beheer: Bij een afgeleid Assessment een
regel "Afgeleid van: <naam template>", puur informatief.

**Icoon in de Assessment-lijst.** Elke kaart in de lijst toont het icoon van
het Assessment links van de naam, in dezelfde vormgeving als op de
publieke kaart (`stylesheet.md`, Assessment-icoon): Een rond vlak in
`var(--or-faint)` met het icoon in `var(--or)`. De grootte is hier `2rem`.
Het icoon is dus niet zwart en niet los zonder rondje.

**Assessment verwijderen.** Een Assessment kan alleen worden verwijderd als
er geen enkele Meting van is, bij welke organisatie dan ook. Zodra er een
Meting is, kan het niet meer, ook niet door een Admin. Wil de Admin het
toch weg, dan verwijdert hij eerst alle Metingen van dit Assessment
(punt 4 en 6) en daarna het Assessment. Er is geen optie waarmee de
Metingen meegaan. De regels staan in `datamodel.md`, Verwijderen en
datakoppelingen.

- **Knop**: Op de kaart in de Assessment-lijst en op het detail, een
  "Verwijderen" in de stijl van de andere verwijderacties
  (`.btn-outline .btn-compact`, destructief in de bevestiging).
- **Plaats op de kaart**: Alle kaarten in de lijst zijn even breed, over de
  volle breedte van de lijst, en niet zo breed als hun inhoud. De knop staat
  binnen de kaart in een eigen laatste kolom, rechts uitgelijnd en verticaal
  gecentreerd, dus op elke kaart op dezelfde plek (`stylesheet.md`, Knop in
  een lijstrij). Het Info-icoon staat direct rechts van de knop (`stylesheet.md`,
  Info-icoon). Onder de knop staat geen tekst. De plek van het icoon is op
  elke kaart gereserveerd, ook als er geen icoon staat: Een vaste kolom van
  `1.25rem` (de breedte van het icoon) met `0.5rem` ruimte ervoor, dus de knop
  eindigt op elke kaart op dezelfde afstand van de rechterrand. Zonder die
  vaste kolom staat een actieve knop verder naar rechts dan een
  uitgeschakelde, omdat alleen de laatste het icoon naast zich heeft. Alle
  knoppen zijn even breed en even hoog (`.btn-outline .btn-compact`, ook als
  ze uitgeschakeld zijn; de uitgeschakelde staat verandert alleen kleur en
  cursor, niet de maat).
- **Uitgeschakeld**: Zolang er Metingen zijn, is de knop uitgeschakeld, met
  een Info-icoon (`info.assessmentVerwijderen`) dat de reden geeft. De tekst
  begint met een zin die de app zelf maakt en die de Admin niet kan
  aanpassen: "Dit Assessment kan niet worden verwijderd, want er zijn nog
  {n} Metingen bij {m} organisaties." Daarna volgt de standaardtekst uit het
  register, die wel aanpasbaar is. Is er geen Meting, dan is de knop actief en
  staat er geen Info-icoon.
- **Bevestiging**: Een modal met de titel "Assessment verwijderen?" en de
  tekst "Weet je zeker dat je {naam} wilt verwijderen? Dit kan niet ongedaan
  worden gemaakt." Daaronder wat er verdwijnt: Het Assessment met zijn
  Categorieën, Bouwblokken en Vragen (met aantallen), de benchmarks waaruit
  het wordt gehaald, en de Assessments die ervan zijn afgeleid (die houden
  hun inhoud, alleen de regel "Afgeleid van" vervalt). Knoppen
  "Annuleren" en een destructieve "Verwijderen".
- **Controle bij bevestigen**: Op het moment van bevestigen wordt opnieuw
  gecontroleerd of er Metingen zijn. Is er in de tussentijd een Meting
  bijgekomen, dan gebeurt er niets en meldt het scherm dat het Assessment
  nu Metingen heeft. De regel hoort bij de gegevenslaag, niet alleen bij de
  uitgeschakelde knop. Met de database wordt dit een verwijzing die het
  verwijderen weigert zolang er Metingen zijn.
- **Gelogd**: `assessment.verwijderd` (`datamodel.md`, Audit). Recht:
  `content.beheren`, dus Admin-only.

#### 2. Content

Per Assessment: Categorieën met kleur en volgorde, bouwblokken (naam,
omschrijving, toelichting, centrale vraag, tags) en de vragen per bouwblok. Content waar
al antwoorden aan hangen wordt gearchiveerd, niet verwijderd
(`datamodel.md`, Content bewerken).

**Weging per bouwblok.** Bij elk bouwblok een veld "Weging" (getal groter
dan 0, ook decimalen zoals 1,5, standaard 1; `Bouwblok.gewicht`,
`datamodel.md`). Bouwblokken met een weging ongelijk aan 1 krijgen in de
lijst een chip met de factor ("2×"), bij weging 1 staat er niets. Het
veld heeft het nummer en de naam van het bouwblok erbij, zodat duidelijk
is welk blok het betreft. Een gewicht wijzigen kan altijd, ook als er al
ingevulde scans zijn: Alle scores worden berekend en niet opgeslagen,
dus de wijziging werkt direct door in alle scans van dat Assessment (en
in de Organisatie-resultaten, PDF en exports). Opslaan vraagt daarom een
bevestiging die noemt om welk bouwblok het gaat, het oude en nieuwe
gewicht en het aantal ingevulde scans dat anders gaat rekenen. De
wijziging wordt gelogd (`bouwblok.gewichtGewijzigd`, zie Audit-log).
Meerdere gewichten tegelijk wijzigen kan in één opslagactie, met één
bevestiging en één logregel per bouwblok. Rechten: Als overige
Content-beheer.

**Wegingstekst per Assessment.** Twee velden bij het Assessment: "Titel
wegingskaart" en "Tekst wegingskaart" (`wegingTitel`,
`wegingToelichting`). Dit is de tekst op de kaart bij aanvang van de
scan (`schermen.md`, Intake, Wegingskaart). De velden mogen leeg blijven:
Dan geldt de standaardtekst. Bij een Assessment zonder afwijkende
gewichten verschijnt de kaart niet, ook als de velden gevuld zijn. De
bouwblokken en hun factor onder de tekst komen uit de gewichten zelf en
hoeven niet in de tekst te staan.

Teksten die niet aan één Assessment hangen (zoals de introtekst op
"Mijn metingen"): Zie 2a, Algemene teksten, onder Instellingen hierboven,
niet hier.

### Organisaties (Admin: Alle, Consultant: Eigen)

#### 3. Organisatievelden

De organisatievelden uit `datamodel.md` (volume en klantbasis,
digitalisering, techstack, FTE) worden zelf ook beheerbaar: Label,
type en vaste antwoordcategorieën. De KPI's en de kanalen hebben een eigen tab (KPI's en kanalen, hieronder).

Dit punt gaat over de definitie van de velden en is Admin-only
(`content.beheren`, Rechtenmatrix). Een Consultant ziet dit onderdeel
niet in de tabbalk. De waarden van een organisatie invullen en wijzigen
(de Kenmerken in het organisatie-detail, punt 4) kan wel voor een Admin
en voor een Consultant bij zijn eigen organisaties
(`organisaties.bewerken`). Een Consultant stelt die vragen immers zelf
aan de klant, tijdens een gesprek over de inrichting en omvang, en moet
het antwoord daarom zelf kunnen vastleggen.

**Korte namen.** Veldnamen en waarden zoals
"Activiteiten op het gebied van financiële dienstverlening en verzekeringen"
zijn te lang voor de chips en lijsten van Verkennen. Een Admin geeft ze hier een
korte naam (`visualisatie-verkennen.md`, Korte namen). De pagina heeft een
schakelaar Velden | KPI's en kanalen | Korte namen (`.weergave-wissel`, de middelste tab is), en de derde weergave is
een tabel met de kolommen Soort (Veldnaam of Waarde), Veld, Origineel, Korte
naam en In gebruik.

- **Korte naam**: Een invoerveld van hoogstens 30 tekens, met een teller.
  Leeg betekent het origineel. De naam moet uniek zijn binnen het veld, zonder
  verschil tussen hoofdletters en kleine letters, anders staat er een melding
  bij het veld.
- **Filters**: Veld (Alle velden, Veldnamen of een veld), zoeken op origineel of
  korte naam, en een vinkje dat waarden in gebruik zonder korte naam bovenaan
  zet (standaard aan). Boven de tabel staat "X van Y hebben een korte naam".
- **Opslaan**: Eén knop onder de tabel, met "Annuleren" ernaast.
- **In gebruik**: Het aantal Organisaties met die waarde. Bij een veldnaam het
  aantal Organisaties dat het veld heeft ingevuld.
- **Nieuwe waarden**: Waarden die Organisaties zelf invullen via "Anders…"
  verschijnen vanzelf in de tabel, met een lege korte naam
  (`datamodel.md`, Korte namen).
- **Op de plek zelf**: In Verkennen opent een potlood naast de kop van een
  filter een modal met dezelfde tabel voor dat ene veld (punt 15).
- **Recht en logging**: `content.beheren`, dus alleen een Admin. Een wijziging
  wordt gelogd als `korteNaam.gewijzigd` (`datamodel.md`, Audit).
- **Uitleg**: In een Info-icoon (`info.korteNamen`, punt 2a), niet als vaste
  tekst. Het visual design toont hem als vaste tekst.

**KPI's en kanalen (ontworpen door Joost).** De tab voor de definities uit `datamodel.md`, KPI's en kanalen.
Alleen voor een Admin (`content.beheren`). Het design staat in
`Claude outputs/kpi-design/`, bord 4.

- **Kaart KPI's.** Titel met een Info-icoon (`info.kpiDefinities`) en rechts de
  knop "+ KPI toevoegen" (`.btn-or .btn-compact`). Daaronder een tabel met de
  kolommen Naam (invoerveld), Eenheid (invoerveld), Per onderdeel (vinkje), Per
  kanaal (vinkje) en Korte naam (invoerveld, met de naam als placeholder). De
  rijen staan in de volgorde van aanmaken.
- **Vinkjes.** Een vinkje staat uitgeschakeld zolang er waarden op dat niveau
  staan, met de reden en het aantal waarden in een Info-icoon
  (`datamodel.md`, KPI's en kanalen, Wat een KPI mag).
- **Kaart Kanalen.** Titel met een Info-icoon (`info.kanalen`). Elk kanaal is
  een verwijderbare keuzepil (`.pil` met kruisje, `stylesheet.md`), in de
  volgorde van de lijst. Daaronder een invoerveld "Nieuw kanaal" en de knop "+
  Kanaal toevoegen" (`.btn-or .btn-compact`). Een naam die hoofdletterongevoelig
  al bestaat, geeft een melding bij het veld. Toevoegen en verwijderen gebeuren
  direct. Het kruisje opent de bevestigingsmodal, die het aantal waarden en
  Organisaties noemt (`datamodel.md`, Verwijderen en datakoppelingen).
- **Opslaan.** De wijzigingen in de tabel KPI's gaan op "Opslaan", met
  "Annuleren" ernaast (`.btn-or .btn-compact` en `.btn-outline .btn-compact`),
  zoals bij Korte namen. Het design toont deze knoppen niet.
- **Recht en log.** `content.beheren`. Gelogd als `kpiDefinitie.aangemaakt`,
  `kpiDefinitie.gewijzigd`, `kanaal.aangemaakt` en `kanaal.verwijderd`, en voor
  de korte naam als `korteNaam.gewijzigd` (`datamodel.md`, Audit).
- **Hernoemen, verwijderen en volgorde (niet in het design van Joost).** Door Claude Code ingevuld, Joost beoordeelt het.
  - **Een kanaal hernoemen**: De naam in de lijst Kanalen is een invoerveld. Enter
    of het verlaten van het veld bewaart, Esc zet de naam terug. Alleen de naam
    verandert, het id en alle KPI-waarden blijven. De naam blijft hoofdletterongevoelig
    uniek. Gelogd als `kanaal.hernoemd`.
  - **Een KPI verwijderen**: Een knop "Verwijderen" achter de rij, met een
    bevestiging die het aantal waarden en Organisaties noemt, zoals bij een kanaal.
    De waarden bij alle Organisaties en de korte naam gaan mee. Gelogd als
    `kpiDefinitie.verwijderd`. De knop is uitgeschakeld zolang er niet-opgeslagen
    wijzigingen in de tabel staan.
  - **Volgorde**: Elke KPI en elk kanaal heeft knoppen ↑ en ↓ om een plek te
    verschuiven. De volgorde geldt voor de tabel, de menu's en de kolommen. Gelogd
    als `kpiDefinitie.volgordeGewijzigd` en `kanaal.volgordeGewijzigd`. De kanalen
    staan daarmee als lijst met een invoerveld per kanaal in plaats van als pillen.

#### 4. Organisaties

- **Lijst**: Voor een Admin alle organisaties. Voor een Consultant
  alleen zijn **eigen** organisaties (`datamodel-rollen.md`,
  Eigenaarschap en toegang van/tot organisaties): Die hij zelf
  aanmaakte, plus die een Admin expliciet aan hem toewees. Per rij de
  naam, het aantal respondenten, het aantal afgeronde scans, en
  **"Aangemaakt door"** (de naam van de eigenaar), altijd zichtbaar,
  voor iedereen die de organisatie ziet, ongeacht of hij eigenaar of
  toegewezen is. Puur informatief, geen filter.
- **Score en voortgang, alléén op de Consultant-lijst** (portfolio-
  overzicht, om te zien welke klant aandacht nodig heeft): Twee extra
  kolommen, niet op de Admin-lijst, een Admin beheert het systeem,
  volgt geen individuele klantrelaties op, dus is hier geen
  actiehouder.
  - **Score**: Het gemiddelde van de meest recente Meting van deze
    organisatie met minstens 1 afgeronde scan (zelfde drempel als
    Organisatie-resultaten hieronder). Geen Meting die aan die drempel
    voldoet: "-".
  - **Voortgang**: Van diezelfde meest recente Meting, "X van Y
    afgerond" (afgeronde `ScanInvulling`s van het totaal uitgenodigde).
    Is de meest recente Meting al volledig afgerond, dan blijft de
    kolom leeg, voortgang is alleen relevant zolang een Meting nog
    loopt.
- **Aanmaken**: Naam en kenmerken invullen. Zowel Admin als Consultant;
  de aanmaker wordt automatisch eigenaar (`aangemaaktDoor`).
- **Korte naam** (optioneel): Een tweede,
  korte naam van de Organisatie voor kolomkoppen in matrices en heatmaps
  (`stylesheet.md`, Kolomkop en rijkop), maximaal 30 tekens, bij voorkeur
  tot 12 zodat hij zonder afkapping in een kolom van 96px past. Leeg
  betekent dat de naam zelf geldt. Staat in het aanmaak- en bewerkformulier
  onder Naam, met een Info-icoon (`info.korteNaamOrganisatie`).
- **Organisatie-toegang toewijzen** (Admin-only, ook weer intrekken):
  Eén of meer Consultants die deze organisatie ook mogen zien en beheren,
  bovenop de eigenaar. Intrekken van een toewijzing is de spiegel van
  toewijzen, geen aparte permissie. De eigenaar (`aangemaaktDoor`) en wie
  toegewezen is blijven twee onderscheiden dingen, ook al vallen ze in de
  rechtenmatrix allebei onder hetzelfde bereik "eigen". De Toegang is een kaart en geen uitklapbaar
  blok met losse tekst en selectievakjes. Het gaat over wie bij de gegevens van
  de organisatie mag, en hoort dus bij de kaart Afspraken, in één rij met
  die kaart.
  - **Plek**: Onder de kaart Kenmerken, links van de kaart Afspraken (twee
    kaarten van gelijke breedte, 24px ertussen). Alleen voor een Admin.
  - **Kop**: De titel Toegang met een Info-icoon (`info.organisatieToegang`).
    De uitleg staat in het Info-icoon en niet als vaste tekst eronder. Rechts de
    knop "+ Consultant toewijzen" (`.btn-or .btn-compact`).
  - **Eigenaar**: Eén rij met het label Eigenaar en de naam van de
    `aangemaaktDoor`, met een badge "Eigenaar". Er is geen knop om hem in te
    trekken.
  - **Toegewezen Consultants**: Eén rij per Consultant met naam en e-mailadres
    en rechts een knop "Intrekken" (`.btn-outline .btn-compact`). Intrekken vraagt
    een korte bevestiging. Is niemand toegewezen, dan staat er "Nog niemand
    toegewezen." in `--ink-s` (14px).
  - **Toewijzen**: "+ Consultant toewijzen" opent een modal met een lijst van
    de actieve Consultants die nog geen toegang hebben, elk met een
    selectievakje, en onderin "Annuleren" en "Toewijzen". Het zijn meerdere
    keuzes in een lijst, dus een modal (`stylesheet.md`, Bewerken: Op de plek of
    in een modal). Is er geen Consultant meer om toe te wijzen, dan is de knop
    uitgeschakeld.
  - **Regel onder de naam**: De regel "Aangemaakt door: … · Ook toegewezen aan: …"
    onder de paginatitel blijft staan, voor iedereen die de organisatie ziet,
    als alleen-lezen tekst. De kaart Toegang is de plek om het te wijzigen.
  - **Logging**: Zoals nu (`datamodel.md`, Audit).
- **Afspraken** (in `components/beheer/AfsprakenKaart.tsx`, Admin-only): Een smalle kaart
  direct onder de kaart Kenmerken en boven de kaart KPI's, rechts van de kaart
  Toegang, met de titel "Afspraken" en de drie schakelaars hieronder naast
  elkaar in één rij, elk met Info-icoon. Ze leggen vast wat met de organisatie
  is afgesproken over haar gegevens, en staan uit bij een nieuwe organisatie.
  Daarom horen ze bovenaan en niet onderaan de pagina: Een Admin ziet in één
  blik wat aan staat. Een Consultant en een Lead zien de kaart niet.
- **Benchmark-vlag** (Admin-only): In de kaart Afspraken, links, een
  schakelaar "Doet mee aan benchmark"
  (`Organisatie.benchmarkToegestaan`, `datamodel.md`, Deel 2: Benchmark). Hij staat
  uit bij een nieuwe organisatie. Een Admin zet hem aan nadat dit met de
  organisatie is afgesproken, bijvoorbeeld via contract of mail. Uitzetten
  gaat na een bevestiging die noemt in hoeveel benchmarks de organisatie
  meedoet. De leden van de organisatie vallen dan uit die benchmarks.
  Wijzigen wordt gelogd (`organisatie.benchmarkVlagGewijzigd`). Zie
  `benchmark.md`, Toestemming en privacy.
- **Namen tonen bij Antwoorden** (Admin-only): In de kaart Afspraken,
  rechts van de Benchmark-vlag, een schakelaar (`Organisatie.antwoordenMetNamen`,
  `datamodel.md`, Deel 2: Benchmark). Hij staat uit bij een nieuwe organisatie. Uit: Leads
  zien bij Antwoorden R1 tot en met Rn. Aan: Ze zien de namen. Een Admin zet
  hem aan na afstemming met de opdrachtgever. Aanzetten gaat na een
  bevestiging die zegt dat de Leads van deze organisatie dan namen zien,
  uitzetten kan zonder bevestiging. Wijzigen wordt gelogd
  (`organisatie.antwoordenNamenGewijzigd`). Zie punt 6a, Namen bij Antwoorden.
- **Case-vlag** (Admin-only, in `components/beheer/CaseVlag.tsx`): In de kaart Afspraken,
  rechts van het vinkje "Namen tonen bij Antwoorden", een vinkje
  "Mag als case gebruikt worden" (`Organisatie.caseToegestaan`, `datamodel.md`
  deel 3) met een Info-icoon (`info.caseVlag`). Hij staat uit bij een nieuwe
  organisatie en bij alle bestaande. Een Admin zet hem aan nadat dit met de
  organisatie is afgesproken. Aanzetten kan zonder bevestiging. Uitzetten gaat na
  een bevestiging die zegt in hoeveel Cases bij andere organisaties deze
  organisatie voorkomt en dat die voor de Leads verdwijnen. Wijzigen wordt
  gelogd (`organisatie.caseVlagGewijzigd`). De Afspraken zijn vinkjes, ook "Namen tonen bij Antwoorden". Past het derde vinkje niet in de rij, dan staat het eronder
  (de kaart is een rij die afbreekt). De bevestiging bij uitzetten telt
  alleen de Cases die voor een Lead zichtbaar zijn (`zichtbaarVoorLead`), en een
  Case waarvan de vlag uitgaat blijft bij de Consultant staan met de status
  "Toestemming ontbreekt". Zie `dossier.md`.
- **Naam wijzigen** (`organisaties.bewerken`, dus Admin voor alle
  organisaties en Consultant voor zijn eigen): Op het organisatie-detail
  staat de naam in de kop met een potlood ernaast. Een klik opent een modal
  met de velden Naam en Korte naam, met "Annuleren" en "Opslaan" (twee velden, dus een modal volgens `stylesheet.md`, Bewerken: Op de plek of in een modal). Er gelden dezelfde
  regels als bij Aanmaken: De naam is verplicht en wordt getrimd. Na opslaan
  staat de nieuwe naam direct in de kop, het kruimelpad, de lijst en overal
  waar de organisatie wordt genoemd (Respondent-overzicht, Resultaten,
  benchmarks). Het `id` en de koppelingen blijven gelijk, dus er verandert
  niets aan Metingen, Respondenten of scans. Het wijzigen wordt gelogd als
  `organisatie.hernoemd`, met de oude en de nieuwe naam in `details`
  (`datamodel.md`, Audit). Oudere audit-regels houden de naam zoals die was
  bij het loggen.
- **Detail**: Kenmerken (altijd bewerkbaar), "Aangemaakt door" (zie
  hierboven), de metingen van deze organisatie met "Bekijk" naar het
  Meting-overzicht (punt 5), op meetdatum, de nieuwste bovenaan, en de respondenten met hun
  status, elk met alleen "Bekijk" dat het Respondent-overzicht opent
  (punt 6b). Voor een Admin staat in de kop van het blok Metingen ook de knop
  "Importeren" (punt 8), en onder het blok Respondenten een compact blok
  Leads met de knop "Leads beheren" (punt 6a). De ingevulde scans staan niet op deze pagina: Die
  staan per Meting in het Meting-overzicht.
  **Lange lijsten**: Respondenten tonen op de detailpagina maximaal 5 rijen.
  Zijn het er meer, dan staat onder de lijst een link "Alle respondenten van
  deze organisatie →". Die opent het tabblad Respondenten (punt 6b) met het
  filter Organisatie al ingesteld op deze organisatie (in de URL, zoals de
  andere filters). Zijn het er 5 of minder, dan is er geen link. Er komt
  geen link naar de lijst over alle organisaties heen.
- **Kenmerken** (design in `Claude outputs/kpi-design/`, bord 1 en 2, linksboven): De kaart bovenaan
  het organisatie-detail, boven de kaarten KPI's en Metingen. Ze toont de
  waarden van de organisatievelden (`datamodel.md`, Organisatievelden) als een
  rustig raster, en laat bewerken op dezelfde plek.
  - **Kaart**: Zoals Kaarten in `stylesheet.md` (wit, `1px solid var(--border)`,
    `border-radius: 10px`). Bovenin links de titel Kenmerken (18px, gewicht 700),
    rechts de knop "Bewerken" (`.btn-outline .btn-compact`, vraagt
    `organisaties.bewerken`). Een Lead of Respondent ziet deze kaart niet.
  - **Raster**: Vier kolommen van gelijke breedte, 32px tussen de kolommen en
    16px tussen de rijen, met de velden rij na rij van links naar rechts, in de volgorde die
    onder Volgorde staat. Per veld
    staat het label boven de waarde, op twee regels en zonder lijnen of vlakken
    ertussen.
  - **Label**: 12px, gewicht 400, in `--ink-s`. Het label is de veldnaam
    (`VeldDefinitie.label`, nooit de korte naam). Heeft de waarde meer delen, dan
    noemt het label die delen in dezelfde volgorde, gescheiden door een komma
    of een schuine streep met een spatie aan weerskanten: "Klanten, B2B / B2C".
  - **Waarde**: 16px, gewicht 600, in `--ink`, op één regel. Past ze niet, dan
    breekt ze af op een spatie en blijft het label bij de eerste regel staan. De
    waarde staat letterlijk zoals ze is opgeslagen, dus ook bij "Anders…" in de
    spelling van de invoer. Bij een keuzelijst met korte namen (Sector, Subsector,
    de techstack-leveranciers) staat de korte naam (`datamodel.md`, Korte namen),
    met de originele naam in de tooltip.
  - **Opmaak per soort veld**: Getallen met duizendtalpunt en komma als
    decimaalteken (410.000). Een percentage met het procentteken direct achter het
    getal (38%). Bij meer delen staan de delen achter elkaar: "410.000, 15 / 85%"
    (aantal klanten, daarna B2B / B2C), "140, 70% inhouse" (FTE, daarna het
    aandeel inhouse) en "31% / 60%" (digitalisering 2026 / 2030). Een
    techstack-categorie toont de oplossing en daarachter hoe ze wordt
    ondersteund: "Pakket 1, extern ondersteund" of, bij "Geen ondersteuning",
    "Pakket 1, zelf ondersteund". Deploymentmodel en cloudleverancier staan alleen
    in het formulier. Een keuze als "Nog niet ingezet" is een waarde en staat er
    gewoon.
  - **Lege velden**: Een veld zonder waarde staat niet in het raster, zodat de
    kaart alleen laat zien wat bekend is. Is geen enkel veld ingevuld, dan staat
    er in plaats van het raster de tekst "Er zijn nog geen kenmerken ingevuld."
    in `--ink-s` (14px), met "Bewerken" rechtsboven zoals altijd.
  - **Bewerken** (volgt de regel Bewerken in `stylesheet.md`): "Bewerken" opent een modal (`.modal-box--breed`, titel
    "Kenmerken bewerken" met de naam van de Organisatie eronder) met de velden
    van `datamodel.md`, Organisatievelden, in een raster van twee kolommen. Het
    zijn er te veel om in de kaart zelf te bewerken, en een formulier in de kaart
    verspringt de pagina. Onderin "Annuleren" (`.btn-outline`) en "Opslaan"
    (`.btn-or`), rechts uitgelijnd. Opslaan schrijft naar
    `Organisatie.kenmerken`, sluit de modal en de kaart toont de nieuwe waarden.
    Annuleren en het kruisje gooien de wijzigingen weg. Terwijl de modal open
    staat, geldt het Bewerkslot (`datamodel.md`, Bewerkslot). Een veld dat van een
    ander veld afhangt (Subsector bij Sector) volgt de regels uit het datamodel.
  - **Wat de kaart niet bevat**: De KPI's en de contacten per kanaal staan in de
    kaart eronder (hieronder). De Meting, het benchmarkvinkje en de Leads hebben
    eigen blokken.
  - **Contactpersonen** (op verzoek van Sander; Nieuws is op verhuisd naar de kaart Dossier, zie hieronder): Onder het raster van de Kenmerken, in dezelfde kaart,
    gescheiden door een lijn van 1px `--border` en 24px ruimte, staat de lijst
    Contactpersonen met een kop van 16px, gewicht 700, een Info-icoon
    (`info.contactpersonen`) en rechts een knop "+ Toevoegen"
    (`.btn-outline .btn-compact`). Alleen een Admin mag toevoegen, bewerken en
    verwijderen (`contactpersonen.bewerken`; de eerste bouw gebruikte `organisaties.bewerken` en moet worden aangepast). Een
    Consultant met toegang tot de Organisatie ziet de lijst zonder de knoppen
    "+ Toevoegen" en "Bewerken". Later krijgt een Consultant het recht ook,
    beperkt tot eigen Organisaties. Een Lead en een Respondent zien ze niet. Het
    Bewerkslot van de Organisatie geldt voor de hele pagina. De velden en regels
    staan in `datamodel.md`, Contactpersoon.
    - **Contactpersonen**: Op alfabet. Per rij de naam (14px, gewicht 600), de
      functie, het LinkedIn-logo (18px, `--ink-s`, bij hover `--or`) achter de naam als link naar het profiel in een nieuw tabblad, met "LinkedIn-profiel" als tooltip en "LinkedIn-profiel van {naam}" als label
      (alleen met een adres) en de notitie (12px, `--ink-s`), met rechts de knop
      "Bewerken". Leeg: "Er zijn nog geen contactpersonen toegevoegd."
    - **Toevoegen en bewerken**: Een basismodal met "Annuleren" en "Opslaan":
      Naam (verplicht), Functie, LinkedIn-profiel (optioneel,
      een adres van linkedin.com, met `https://` als het ontbreekt) en Notitie.
      Onder Notitie staat in 12px `--ink-s`: "Alleen zakelijke, openbaar
      vindbare informatie. Geen privégegevens.".
      Een fout staat boven de knoppen in een `.overzicht-melding`
      (bijvoorbeeld "Dit is geen LinkedIn-adres."). Bij Bewerken staat links
      "Verwijderen" (`.btn-danger`), dat om een bevestiging vraagt
      (`BevestigModal`), zoals bij een Onderdeel.
  - **Dossier** (`dossier.md`): Een eigen kaart
    onder de Kenmerken en onder de rij Toegang en Afspraken, boven de kaart
    KPI's, met de lijst Cases en Nieuws, het paneel "Instellingen voor de Lead" (de schakelaar "Zichtbaar voor Lead", de naam voor de Lead en de Meting per radar) en de
    knop "+ Toevoegen". Voor een Admin en voor een Consultant met toegang tot de
    Organisatie. De opmaak, het formulier en de regels staan in `dossier.md`,
    Organisatie-detail, kaart Dossier en Item toevoegen of bewerken. Het Dossier vervangt de lijst Nieuws in de kaart
    Kenmerken.
  - **Volgorde**: De spec bepaalt de volgorde, niet de code. De velden staan in
    de volgorde van `datamodel.md`, Organisatievelden: Sector, Subsector, Totaal
    aantal klanten, Adoptie mijnomgeving/app, Percentage 2026, Ambitie 2030 (de
    laatste twee samen als "Digitalisering 2026 / 2030"), de zes
    techstack-categorieën (Contact center, WFM, CRM, Kennismanagement,
    Conversational AI, LLM-oplossing), Klantcontactmedewerkers (FTE), Klantcontact
    management & support en IT DevOps-medewerkers. Lege velden vallen weg, de rest
    schuift op. De kaart volgt deze volgorde. Bij Sector
    staat de korte naam, met de volledige SBI-naam (`sbi-indeling.md`) in de
    tooltip (zie de bullet hieronder).

  - **Korte namen in kaart en formulier** (Sector, Subsector en de techstack-leveranciers in de kaart, en Sector en Subsector in het formulier als keuzelijst met zoekveld, `components/ZoekSelect.tsx`): De korte
    namen die een Admin heeft ingevuld (tab Korte namen) staan ook in het
    organisatie-detail. In de kaart Kenmerken toont Sector de korte naam, met de
    originele SBI-titel in de tooltip. In het formulier tonen de keuzelijsten
    Sector en Subsector de korte naam per optie, in de volgorde van
    `sbi-indeling.md`, met de originele titel in de tooltip van de optie en
    doorzoekbaar in het zoekveld. Een waarde zonder korte naam toont het
    origineel. Bewaard wordt altijd het origineel (`Organisatie.kenmerken`), dus
    een korte naam wijzigen verandert geen gegevens. De exports, de import en de
    PDF houden het origineel (`datamodel.md`, Korte namen).
- **KPI's** (ontworpen; design in `Claude outputs/kpi-design/`, bord 1 en 2, de kolommen in bord 6): Een eigen kaart onder de
  Kenmerken. De KPI's en de contacten per kanaal staan niet meer bij de
  Kenmerken (`datamodel.md`, KPI's en kanalen). De Kenmerken zelf zijn in het
  design een compacte lijst met "Bewerken", uitgeschreven in het punt Kenmerken
  hierboven. De spec van de Kenmerken verandert alleen doordat de KPI's eruit zijn.
  - **Kop**: De titel KPI's met een Info-icoon (`info.kpiBlok`). Rechts "+
    Onderdeel toevoegen" (`.btn-or .btn-compact`) en "KPI's invullen"
    (`.btn-outline .btn-compact`). Beide vragen `organisaties.bewerken`. "+
    Onderdeel toevoegen" opent een basismodal met het veld Naam, "Annuleren" en
    "Opslaan". Die modal staat niet in het design.
  - **Tabel**: In de eerste kolom de KPI's in de volgorde van de definities.
    Daarna de kolom Algemeen en dan de Onderdelen op alfabet. Algemeen heeft
    `--bg-warm` als achtergrond. De tabel staat in een vak met `overflow-x:
    auto`, met de eerste kolom vast (`position: sticky; left: 0`) zodra de
    tabel breder is dan het vak.
  - **Kolomkop** (design bord 1 en 6, volgt `stylesheet.md`, Kolomkop en rijkop): Elke kolom met cijfers is 96px breed
    (`--kolom-b`), ook Algemeen, en de eerste kolom is 240px. Op de eerste regel
    staat de naam in 14px, gewicht 700, rechts uitgelijnd, op één regel en met
    een afkapping (`…`) als hij niet past. Een korte naam bestaat hier niet
    (korte namen staan niet in het organisatie-detail), dus de volledige naam
    wordt afgekapt. Op de tweede regel staat "n van m" in 12px, gewicht 400, in
    `--ink-s`, zonder het woord "ingevuld". Daarin is n het aantal KPI's met een
    waarde bij het kanaal Algemeen voor die plek, en m het aantal KPI's dat op
    die plek mag (bij Algemeen alle KPI's, bij een Onderdeel de KPI's met
    `perOnderdeel`). De tooltip (`title`) noemt de volledige naam, "n van m
    KPI's ingevuld" en bij een Onderdeel "Klik om te bewerken" (de regel Bewerken in `stylesheet.md`). De
    tabel heeft vaste kolommen (`table-layout: fixed`, 240px en 96px) en elke rij
    is 48px hoog (gemeten in de browser), een kanaalrij 40px.
    - **Onderdeel wijzigen**: De kop van een Onderdeel is zelf een knop (hover
      `--bg-mid`, zichtbare focusring) die een basismodal opent met de naam,
      "Verwijderen" (`.btn-danger`, uitgeschakeld zolang er Metingen zijn, met
      de reden), "Annuleren" en "Opslaan". Er staat geen potlood in de kop. De
      kop van Algemeen is geen knop. Die modal staat niet in het design.
    - **Fout, geen variant**: Een kop op twee regels, een kolom die breder is
      dan 96px, een kolom waarvan de breedte van de naam afhangt en een eenheid
      op een tweede regel onder de KPI-naam.
  - **KPI-naam en eenheid**: De eenheid staat achter de naam op dezelfde regel,
    bijvoorbeeld "AHT (s)" en "SLA (%)", zodat elke rij 48px hoog is. Een
    kanaalrij is 40px hoog.
  - **Cel**: De waarde, rechts uitgelijnd, met tabelcijfers. Een lege cel is
    een streepje in grijs. Mag de KPI niet op die plek (`perOnderdeel` uit),
    dan staat er "n.v.t." in grijs.
  - **Kanalen per KPI**: Een KPI met `perKanaal` en minstens één kanaalwaarde in
    de tabel heeft voor de naam een chevron en achter de naam "n kanalen" in
    12px grijs, met n het aantal kanalen met minstens één waarde. Een klik
    klapt de KPI open: Per kanaal met minstens één waarde een rij, in de
    volgorde van de kanalenlijst, met een streepje bij lege cellen. Een KPI
    zonder kanaalwaarden heeft geen chevron. Standaard staat elke KPI dicht en
    de stand wordt niet bewaard.
  - **Zonder Onderdelen**: Dan toont de tabel alleen de kolom Algemeen, met
    eronder de regel "Er zijn nog geen onderdelen. De waarden gelden voor de
    hele organisatie en voor alle kanalen samen."
- **KPI's invullen** (ontworpen; design bord 3): Een modal in plaats van een zijpaneel, omdat de specs alleen
  de modal kennen voor een formulier met "Annuleren" en "Opslaan" (zoals de modal
  Korte namen). `.modal-box--breed` (maximaal 720px), met `max-height: 88vh` en
  scrollen binnen de modal.
  - **Kop**: De titel "KPI's invullen" als `h2` van 18px
    (`.modal-overlay .modal-box h2`), met de naam van de Organisatie eronder
    in 14px, en een kruisje. Sluiten werkt ook met Esc en een klik naast de
    modal.
  - **Plek**: Een pilvormige groep (`.pil-groep`, `stylesheet.md`) met Algemeen
    en daarna de Onderdelen op alfabet, met een Info-icoon (`info.kpiPlek`).
    Algemeen staat gekozen bij het openen. Een Organisatie zonder Onderdelen
    toont geen groep.
  - **Kanalen uitsplitsen**: Keuzepillen (`.pil`, meerdere tegelijk te kiezen)
    voor elk kanaal van de lijst, met een Info-icoon (`info.kpiKanalen`). Een
    kanaal met een ingevulde waarde bij deze plek staat gekozen. Je kunt het pas
    uitzetten als zijn kolom leeg is, anders staat de pil uitgeschakeld met de
    reden. Een KPI zonder `perKanaal` heeft geen kolom per kanaal.
  - **Invoertabel**: De KPI's in de rijen, in de volgorde van de definities.
    Onder de naam staat de eenheid in 12px, behalve bij "aantal" en bij een lege
    eenheid. De kolommen zijn Algemeen en daarna de gekozen kanalen, in de
    volgorde van de kanalenlijst. Elke cel is een invoerveld (`.field`, 96px,
    rechts uitgelijnd, `stylesheet.md`, Formulieren), met een streepje als
    placeholder. Een cel waar de KPI niet mag (geen `perKanaal` in een
    kanaalkolom, geen `perOnderdeel` bij een Onderdeel) is een grijs vak met
    "n.v.t." dat de focus niet krijgt. Een cel leegmaken wist de waarde.
  - **Concept**: Wisselen van plek behoudt wat is ingevuld. Eén "Opslaan"
    bewaart de wijzigingen van alle plekken, "Annuleren" gooit ze allemaal weg.
    Beide staan rechts in een `.btn-rij` onderaan, "Annuleren" als
    `.btn-outline .btn-compact` en "Opslaan" als `.btn-or .btn-compact`.
  - **Slot en log**: Openen neemt het Bewerkslot van de Organisatie
    (`datamodel.md`, Bewerkslot). Opslaan logt `kpi.waardenGewijzigd`, één
    gebeurtenis per plek met wijzigingen.
- **Data ouder dan de bewaartermijn** (`datamodel-rollen.md`,
  Bewaartermijn ingevulde scans). De twee instellingen (bewaartermijn en
  verlengtermijn) staan bij Drempels en termijnen (punt 10) en zijn Admin-only.
  De lijst en acties hieronder zijn ook voor een Consultant, zoals de
  rest van dit scherm (bereik `eigen`).
  - **Geen automatische verwijdering.** Zodra `bewaarTermijnDagen`
    verstreken is (en, bij eerder verlengen, ook `bewaarVerlengdTot`,
    `datamodel.md`), verschijnt de scan in een lijst **"Data ouder dan
    de bewaartermijn"**, over alle organisaties heen voor Admin, eigen
    organisaties voor Consultant, zelfde bereik als de rest van dit
    scherm. Per rij twee acties, voor **beide** rollen: **"Verwijderen"**
    (bestaande verwijderactie op de ingevulde scan) of **"Verlengen"**
    (zet `bewaarVerlengdTot` op het moment van de klik plus
    `verlengTermijnDagen`, dus vanaf nu en niet vanaf de oude einddatum.
    De scan verdwijnt uit de lijst tot die nieuwe datum verstreken is).
    Zonder actie blijft de scan gewoon bestaan en in de lijst staan,
    niets gebeurt vanzelf.
- **Verlengd, nog niet opnieuw te beoordelen**: Tweede lijst onder de eerste,
  met tussen haakjes het aantal. Kolommen: Organisatie, Respondent,
  Meting, Afgerond op en Verlengd tot (datum en tijd). Een scan staat
  hier vanaf de klik op "Verlengen" tot `bewaarVerlengdTot` verstreken
  is, en komt dan weer in de lijst hierboven. Zelfde bereik en rechten
  als de lijst hierboven.
- **Organisatie-resultaten**: Vanaf een Meting in het organisatie-detail
  een link "Naar resultaten →", naar het gemiddelde van alle afgeronde
  ingevulde scans binnen die Meting (dus per scanronde, niet over
  meerdere Metingen of scan-types heen). Zelfde opbouw als het
  resultatenscherm van één scan (`schermen.md`, Resultatenpagina:
  classificatiecirkel, radar, staafdiagram per categorie, top 3, legenda),
  alleen met de gemiddelde scores van de Meting in plaats van die van
  één respondent. De weging uit `Bouwblok.gewicht` werkt hier hetzelfde
  door: De uitkomst is het gemiddelde van de antwoorden van alle
  afgeronde scans, door dezelfde scorefunctie gewogen, wat gelijk is aan
  het gemiddelde van de scores per respondent. Zichtbaar zodra er minstens
  1 afgeronde scan is binnen de Meting, geen hoger minimum. Dezelfde
  weergave gebruikt de Lead-rol op zijn eigen pagina (`datamodel.md`
  deel 2, Rollen).

  **Weergaven.** Boven de
  inhoud staat een weergave-schakelaar (`stylesheet.md`, Weergave-schakelaar)
  met Overzicht, Per bouwblok en Spreiding, en voor een Admin en Consultant ook Antwoorden (de antwoorden per vraag en per respondent). Overzicht is de standaard en de
  opbouw hierboven, die ongewijzigd blijft. Rechts van de schakelaar staat de
  knop "Vergelijking", actief als de Meting in een vergelijking tussen Metingen zit
  (punt 14). De weergaven, de knop en de
  adresbalkparameters staan in `visualisatie-scores.md`, Navigatie. Een Lead
  ziet Overzicht en Per bouwblok, de vergelijking als hij de benchmark aangevinkt
  heeft en Resultaten op de Metingen daarin, en Spreiding en Antwoorden als die vinkjes in
  het Leads-venster aan staan (punt 6a).

  **Eén kop.** De pagina heeft één kop. Bovenaan staat het Meting-label als
  eyebrow ("Nulmeting"), daaronder de naam van het Assessment als titel, en
  daaronder "Gemiddelde over N afgeronde respondenten" (bij 1 in het
  enkelvoud). Het resultaatonderdeel toont op deze pagina zelf geen titel en
  geen voortgangsregel ("60 van 60 vragen beantwoord"). Die staan alleen op
  het resultatenscherm van één scan.

  **Nog niet gedekt**: Export (PDF/CSV/InDesign) van dit
  organisatieresultaat. De bestaande exports blijven per één scan, zie
  `export-pdf-visual-volwassenheidsscan.md`, "Export van één scan, geen
  aggregatie". Voor die export geldt: Een Lead ziet die export alleen op
  Metingen waarvoor hij Resultaten heeft (`LeadToegang`), niet op elke
  Meting die hij verder kan bereiken, zie `datamodel-rollen.md`,
  Rechtenmatrix, `export.uitvoeren`, en `export-indesign.md`, "Waar dit een
  plek krijgt".
- **Acties op een Respondent** (AVG-verzoek, verplaatsen naar een andere
  organisatie, responsen naar een andere Meting, bewerken): Staan in het
  Respondent-overzicht, zie punt 6b. Het organisatie-detail toont de
  respondenten alleen als lijst met "Bekijk".

#### 5. Metingen

Vanuit de organisatie: Een Meting aanmaken met een assessment-type, een
onderdeel en een meetdatum. Een organisatie kan meerdere Metingen hebben, ook
van verschillende scan-types.

**Begrippen**, ook als Info-icoon boven de lijst Metingen
(`info.metingBegrippen`):
- **Onderdeel**: Welk deel van de organisatie gemeten wordt, zoals
  "Zuid-Nederland Zakelijk", of "Hele organisatie".
- **Assessment**: De vragenlijst.
- **Meetdatum**: De dag waarop gemeten wordt. Het is niet de datum waarop de
  Meting in de app is aangemaakt en niet het moment van importeren.
- **Meting**: Eén onderdeel met één Assessment op één meetdatum. Respondenten
  horen bij een Meting.
- **Naam van de Meting**: Wordt door de app gemaakt uit onderdeel en
  meetdatum, en is aan te passen.

**Wat je invult.** Bij aanmaken drie velden: Assessment-type, Onderdeel en
Meetdatum (`datamodel.md`, Meting). Alle drie zijn verplicht.

- **Onderdeel**: Een keuzelijst, voorgevuld met "Hele organisatie"
  (design bord 5a en 5b; daarvoor was het een tekstveld met suggesties). Zie Het veld Onderdeel hieronder.
- **Meetdatum**: Een datumveld, leeg bij aanmaken, zodat de gebruiker bewust
  een datum kiest. Een datum in de toekomst mag, want een Meting kan vooraf
  worden gepland.
- **Naam van de Meting**: Geen invoerveld bij aanmaken. Onder de velden staat
  alleen ter controle wat het wordt, bijvoorbeeld "Wordt: Zuid-Nederland
  Zakelijk | okt 2026" (`datamodel.md`, Naam van een Meting). Aanpassen kan
  achteraf bij Wijzigen.
- **Dezelfde combinatie**: Bestaat er al een Meting met dit onderdeel, dit
  Assessment en deze meetdatum, dan staat onder de velden een waarschuwing met
  de Meting die er al is. Opslaan blijft mogelijk.
- **Uitlijning**: Assessment-type, Onderdeel en Meetdatum staan met hun labels
  op één lijn, en "+ Meting plannen" staat op de hoogte van de velden. De regel
  "Wordt: …" verschuift niets in de rij (`stylesheet.md`, Formulieren,
  Veldenrij met labels en een knop).

**Het veld Onderdeel** (ontworpen). Het onderdeel is een Onderdeel van de Organisatie (`datamodel.md`,
Onderdeel), en geen tekst meer. Het veld is overal dezelfde keuzelijst: In "+
Meting plannen", in Wijzigen van een Meting, in "Gemiddelde maken", in "Scans
samenbrengen" (punt 6b) en bij de import (punt 8).

- **Opties**: Eerst "Hele organisatie", dan de Onderdelen van deze Organisatie
  op alfabet (hoofdletterongevoelig), dan een scheidingslijn en onderaan
  "Nieuw onderdeel…". Dat is dezelfde volgorde als bij "Anders…"
  (`datamodel.md`, Organisatievelden). De gekozen optie heeft een vinkje. De
  scheidingslijn mag ontbreken als de browser hem in een `select.field` niet
  toont.
- **Nieuw onderdeel…**: Het veld wordt een tekstveld met als placeholder "Naam
  van het onderdeel" en een kruisje in het veld (`aria-label` "Terug naar de
  lijst met onderdelen") dat terugkeert naar de lijst. Het Onderdeel ontstaat
  pas bij "+ Meting plannen" of bij Opslaan van het formulier. Annuleren laat
  niets achter.
- **Naam**: De regels van een Onderdeel gelden (`datamodel.md`, Onderdeel). Een
  lege naam laat Opslaan niet toe, met de melding "Vul een naam in." bij het
  veld. Een naam die hoofdletterongevoelig overeenkomt met een bestaand
  Onderdeel kiest dat Onderdeel, met zijn eigen spelling. De naam "Hele
  organisatie" kiest "Hele organisatie".
- **Wordt**: De regel "Wordt: …" onder Meetdatum gebruikt de ingetypte naam.
- **Uitleg**: In een Info-icoon naast het label (`info.metingOnderdeel`, punt 2a).
  Alle labels in de rij blijven even hoog, ook die zonder icoon.
- **Recht**: `metingen.plannen`, ook voor het aanmaken van het Onderdeel
  (`datamodel.md`, Rechtenmatrix).

**Lijst Metingen in het organisatie-detail**: Eén lijst, op meetdatum, de
nieuwste bovenaan. Per Meting een rij met de naam, het Assessment, de
meetdatum, het aantal Respondenten en "Bekijk". Een Meting zonder meetdatum
staat onderaan met "Datum ontbreekt" op de plek van de datum. Een samengestelde
Meting heeft de badge "Gemiddelde". Boven de lijst staan de knop "Gemiddelde
maken" (zie Samengestelde Meting) en, voor een Admin, "Importeren" (punt 8).
Selecteer je één of meer Metingen, dan komen daar de acties "Meetdatum
instellen…" en, voor het samenvoegen van losse Metingen, "Samenbrengen in één
Meting…" (punt 6b) bij.

**Meetdatum instellen…**: Opent een modal met één datumveld en de
lijst van de geselecteerde Metingen, die de datum allemaal krijgen. Bedoeld
voor Metingen die nog geen meetdatum hebben. Gelogd als `meting.meetdatumGewijzigd` (`datamodel.md`,
Audit), één gebeurtenis per Meting.

**Bewerken**: Een potlood naast de naam van de Meting in het Meting-overzicht.
Het opent een modal (drie velden, `stylesheet.md`, Bewerken: Op de plek of in een modal) met de velden Onderdeel, Meetdatum en
Naam, met Annuleren en Opslaan, en verder niets. Naam is voorgevuld met de huidige naam. Pas je
de naam aan, dan volgt hij onderdeel en meetdatum niet meer
(`Meting.labelHandmatig`). Een knop "Standaardnaam herstellen" naast het veld
zet hem terug. Het assessment-type ligt vast na aanmaken, want achteraf wijzigen
zou de al ingevulde antwoorden inconsistent maken met een ander scan-type. Voor
een ander scan-type maak je een nieuwe Meting aan. Een samengestelde Meting
heeft geen eigen meetdatum om te wijzigen (zie hieronder).

**Metingen zonder meetdatum.**

- Een Meting zonder meetdatum staat als "Datum ontbreekt" onderaan de lijst,
  tot de Admin of Consultant de datum invult met Wijzigen of "Meetdatum
  instellen…".
- Zonder meetdatum doet een Meting niet mee aan een samenstelling of aan een
  vergelijking tussen Metingen. Ze blijft wel zichtbaar en bruikbaar voor
  resultaten en uitnodigen.

**Meting-overzicht** (eigen pagina, bereikbaar via "Bekijk" bij een
Meting in het organisatie-detail en via het Meting-label in de lijst
Respondenten, punt 6b): Alles binnen één Meting op één plek. Een eigen
pagina en geen modal, omdat er een lijst op staat die op zijn beurt het
Respondent-overzicht opent. Een eigen adres, zodat het te openen en te
delen is binnen beheer. Zelfde bereik als de organisatie: Een Admin ziet
alle Metingen, een Consultant die van zijn eigen organisaties.

- **Kop**: Naam van de Meting met een potlood erachter (Wijzigen, hierboven),
  Assessment, onderdeel, meetdatum, de organisatie (met link terug naar het organisatie-detail) en
  voortgang ("x van y afgerond").
- **Scans in deze Meting**: Eén rij per Respondent in deze Meting. Kolommen:
  Naam, Rol/Team, Status, Voortgang, Gestart, Aangemaakt
  (`ScanInvulling.aangemaaktOp`, bij een import het importmoment, zodat je
  geïmporteerde scans kunt terugvinden en groeperen), Notitie
  (`ScanInvulling.notitie`, afgekapt op één regel met de volledige tekst bij
  hover, leeg als er geen is), de persoonlijke link ("Kopieer link",
  "Openen") en "Bekijk". Rol/Team toont alleen wat er is: Is de rol leeg, dan
  staat er alleen het team, is het team leeg alleen de rol, en zijn ze allebei
  leeg dan blijft de cel leeg. Nooit een los streepje of puntje. Alle kolommen
  zijn sorteerbaar. De hele rij is klikbaar en opent het Scan-overzicht
  (punt 7), en bij een Respondent zonder scan, zoals een Lead, het
  Respondent-overzicht (punt 6b). Selectievakje per rij en "alles
  selecteren" in de koprij, met de acties "Exporteren", "Naar andere Meting"
  (punt 6b) en "Verwijderen" (compacte knoppen, gelijke breedte). Hier staat
  ook "Respondent uitnodigen" (punt 6).
- **Resultaten**: De link "Naar resultaten →" (Organisatie-resultaten,
  punt 4), zodra er minstens 1 afgeronde scan is.
- **Leads**: Welke Leads welke weergaven van deze Meting hebben
  (`LeadToegang`, punt 6a), alleen als weergave. Beheren gebeurt in het
  Leads-venster van de organisatie.
- **Acties**: Responsen naar een andere
  Meting verplaatsen via selectie in de lijst (zelfde actie als punt 6b,
  "Respons naar andere Meting verplaatsen") en de Meting verwijderen (de
  bestaande verwijderfunctie, ook voor een lege import-Meting).

**Samengestelde Meting** (aangepast in het ; `benchmark.md`, Onderdeel en samengestelde Meting): Een
gemiddelde over meerdere Metingen van één organisatie en één Assessment,
bruikbaar als één deelnemer in een benchmark tussen organisaties en in een
vergelijking tussen Metingen. Admin en Consultant (bij zijn eigen organisaties,
`metingen.plannen`).

- **Aanmaken**: Met de knop "Gemiddelde maken" boven de lijst Metingen. Het
  formulier vraagt het Assessment en het onderdeel (voorgevuld met "Hele
  organisatie"). De naam maakt de app. Daaronder staan de Metingen van deze
  organisatie voor dat Assessment, op meetdatum, elk met een selectievakje, het
  onderdeel, de meetdatum en het aantal afgeronde scans. Standaard staat er
  niets aan, omdat de Metingen van verschillende momenten kunnen zijn. Een
  Meting met te weinig scans (`benchmarkMinScans`) of zonder meetdatum is
  uitgeschakeld, met de reden erbij. Opslaan kan pas bij minstens twee Metingen.
- **Waarschuwing**: Staan in de selectie twee Metingen met hetzelfde onderdeel
  en Assessment, dan staat onder de lijst: "Een gemiddelde over twee momenten van
  hetzelfde onderdeel zegt weinig over de ontwikkeling." Opslaan blijft mogelijk.
- **Meetdatum**: Volgt de selectie. Het is de laatste meetdatum van de
  geselecteerde Metingen, en niet los te wijzigen. In het formulier "Wijzigen"
  en in het Meting-overzicht staat de datum daarom alleen-lezen, zonder
  invoerveld, met de toelichting "Volgt de nieuwste Meting in de
  samenstelling". Hebben de leden van een bestaande samenstelling geen datum, dan staat er
  "Datum ontbreekt" en vul je eerst de datum van de leden in ("Meetdatum instellen…" in de
  lijst). Daarna volgt de samenstelling vanzelf. "Meetdatum instellen…" werkt
  niet op een samengestelde Meting.
- **In de lijst**: De badge "Gemiddelde", het aantal onderliggende Metingen en
  geen knop "Respondent uitnodigen".
- **Meting-overzicht**: Zelfde kop als hierboven, maar zonder het blok
  Respondenten. In plaats daarvan het blok Samenstelling met de onderliggende
  Metingen, elk met een link naar zijn eigen Meting-overzicht. Daarnaast
  "Naar resultaten →", de acties "Samenstelling wijzigen" en "Verwijderen",
  en de Leads zoals bij een gewone Meting.
- **Resultaten**: Zoals Organisatie-resultaten (punt 4), met onder de titel
  "Gemiddelde van {n} Metingen, elk even zwaar". Voor de Admin staat eronder de
  matrix met de onderliggende Metingen als kolommen
  (`visualisatie-scores.md`, onderdeel E).
- **Vergelijken**: Een samengestelde Meting kan lid zijn van een vergelijking
  tussen Metingen, bijvoorbeeld samenstelling 1 naast samenstelling 2
  (`benchmark.md`, Niveau 2).
- **Verwijderen van een onderliggende Meting**: De Meting valt uit de
  samenstelling. De bevestiging noemt de samengestelde Metingen waarin ze zit en
  dat het gemiddelde daardoor verandert.

#### 6. Respondenten uitnodigen

Binnen een meting: E-mailadres invoeren. Bestaat dat adres al binnen de
organisatie, dan wordt dezelfde respondent hergebruikt. Er ontstaat een
ingevulde scan met status `"uitgenodigd"`. Zolang er geen mailserver is,
kopieert de beheerder de persoonlijke link van de respondent (knop
"Kopieer link") en deelt die zelf. Ernaast een knop **"Openen"**: Opent
diezelfde link direct in een nieuw tabblad, zodat de beheerder 'm meteen
zelf kan proberen zonder eerst te plakken.

**Vinkje "Ook Lead maken"**, naast het e-mailveld hierboven: Kent
meteen ook de Lead-rol toe aan deze respondent, met Resultaten aan voor de
Meting waarvoor wordt uitgenodigd (punt 6a). Puur een snelkoppeling voor het
geval iemand tegelijk moet invullen én Lead moet worden. De twee blijven
onafhankelijke acties. Meer weergaven voor deze Lead vink je aan in het
Leads-venster (punt 6a).

#### 6a. Leads: Toegang per weergave

Lead worden en een vragenlijst krijgen zijn twee losse acties. Een Lead is een
Respondent met de Lead-rol (`RespondentRol`, `datamodel-rollen.md`) en hoeft
geen enkele `ScanInvulling` te hebben. Wat een Lead mag zien, staat op één
plek: Het Leads-venster van de organisatie.

**Blok Leads en Leads-venster.** Alleen voor een Admin. Een Consultant ziet
het blok en het venster niet. De tabel is breed (vijf kolommen per Meting),
daarom staat ze niet op de pagina zelf maar in een eigen venster.

- **Blok op het organisatie-detail**: Compact, onder het blok Respondenten.
  Eén regel per Lead met de naam, de samenvatting "Ziet 3 weergaven" (of "Ziet
  nog niets") en "Bekijk", dat het Respondent-overzicht opent (punt 6b). In
  de kop van het blok staat de knop "Leads beheren" (`.btn-outline
  .btn-compact`), die het Leads-venster opent. Zijn het meer dan 5 Leads, dan
  staan er 5 en eronder de link "Alle Leads beheren →", die hetzelfde venster
  opent. Zonder Leads staat er "Nog geen Leads" met de knop "+ Lead
  toevoegen", die het venster opent met het formulier al open.
- **Leads-venster (modal)**: De Overzichtsmodal (`stylesheet.md`) in de
  brede variant `.modal-box--vol`, zodat de tabel zo veel mogelijk op het
  scherm past. De adresbalk krijgt `?leads=<organisatieId>`. Sluiten kan met
  het kruisje, Esc, een klik naast het venster of de terugknop van de browser.
  Zijn er niet-opgeslagen vinkjes, dan vraagt de app eerst "Sluiten zonder
  op te slaan?" met "Terug" en "Sluiten". Zolang het venster open staat valt
  de Organisatie onder het Bewerkslot (`datamodel.md`).
- **Opbouw van het venster**: Van boven naar beneden de kop (organisatienaam
  en "Leads"), een regel uitleg ("Vink per Lead aan welke weergaven hij
  ziet. Een nieuwe Lead en een nieuwe Meting beginnen zonder vinkjes."), de
  melding van de overgang als die er is (met "Sluiten"), een keuzelijst
  "Assessment", de tabel, daaronder "+ Lead toevoegen", en onderaan een vaste
  voettekst met "Opslaan" en "Annuleren". Alleen de tabel scrolt, de kop en de
  voettekst blijven staan.
- **Keuzelijst Assessment**: Alleen als de organisatie Metingen van meer dan
  één Assessment heeft. Standaard staat ze op alle Assessments. Een keuze
  beperkt de Meting-kolommen tot dat Assessment. Vinkjes in verborgen
  kolommen blijven staan en worden bij Opslaan gewoon bewaard. De
  benchmarkkolommen blijven altijd zichtbaar.
- **Rijen**: Eén rij per Lead van deze organisatie, met naam en e-mailadres.
  Achteraan staat de knop "Bekijk", die het Respondent-overzicht opent
  (punt 6b).
- **Kolommen**: Elke weergave die een Lead kan krijgen is een kolom.
  - Per Meting vijf kolommen onder één kop met het label van de Meting:
    Resultaten, Spreiding, Antwoorden, Uitnodigen en Exporteren. De Metingen
    staan op meetdatum, de nieuwste links, zoals in de lijst
    Metingen. Een samengestelde Meting heeft de badge "Gemiddelde" en alleen
    de kolom Resultaten, want ze heeft geen scans en geen Respondenten.
  - Per benchmark waar deze organisatie in zit één kolom, met de naam van de
    benchmark. Onder de naam staat een badge, Vaste groep of Verkenning, en
    het aantal Organisaties in de groep (`benchmark.md`, Opgeslagen verkenning). Bij een Verkenning zit de
    organisatie in de groep als ze aan de filters voldoet, bij de eenheid
    Onderdelen als minstens één onderdeel van haar eraan voldoet. Een
    Verkenning waarin de organisatie niet zit, heeft geen kolom. Is de groep
    kleiner dan `benchmarkMinOrganisaties`, dan zijn de vakjes van die kolom
    grijs.
- **Cellen**: Een selectievakje. Aan betekent dat de Lead die weergave ziet.
  Een nieuwe Lead en een nieuwe Meting beginnen zonder vinkjes. Er wordt niets
  meegenomen of vanzelf aangezet.
- **Opslaan**: De Admin zet vinkjes en klikt onderaan op "Opslaan", met
  "Annuleren" ernaast. Beide zijn uitgeschakeld zolang er niets is gewijzigd.
  Na Opslaan blijft het venster open met de melding "Opgeslagen". Annuleren
  zet de vinkjes terug en laat het venster open. Zo verandert toegang nooit
  door één verkeerde klik. Gelogd als
  `lead.toegangGewijzigd` (`datamodel.md`, Audit), één gebeurtenis per
  gewijzigde cel.
- **Veel kolommen en veel Leads**: De tabel scrolt binnen het venster, met een
  vaste eerste kolom (de naam van de Lead) en twee vaste kopregels, bovenaan
  het label van de Meting en daaronder de weergave. Bij het scrollen blijven
  ze staan. Meting-kolommen staan per Meting onder een gedeelde kop, met een
  dunne lijn tussen twee Metingen.
- **Lege toestand**: Een Lead zonder vinkjes ziet niets. De rij zegt dat
  ("Ziet nog niets").

**Wat elke kolom geeft.**

- **Resultaten (per Meting)**: De resultatenpagina van de Meting, met
  Overzicht, Per bouwblok en de knop "Vergelijking"
  (`visualisatie-scores.md`, Navigatie). De vergelijking is er alleen als de Lead
  de benchmark heeft aangevinkt en Resultaten heeft op de Metingen daarin.
- **Spreiding (per Meting)**: Weergave B zonder ring (`visualisatie-scores.md`,
  onderdeel B), een stip per scan per bouwblok met de spreiding. De stippen
  hebben geen naam en geen tooltip. Het is een extra weergave op de
  resultatenpagina van die Meting.
- **Uitnodigen (per Meting)**: Respondenten voor deze Meting uitnodigen,
  met "Kopieer link" en "Openen" zoals bij punt 6. Dit hangt niet af van
  Resultaten.
- **Exporteren (per Meting)**: De exportknop op de resultatenpagina van deze
  Meting (`datamodel.md`, Rechtenmatrix, `export.uitvoeren`). Geen bulk-export.
- **Antwoorden (per Meting)**: Weergave G, de antwoorden per vraag en per
  respondent (`visualisatie-scores.md`, onderdeel G). Het is een extra
  weergave op de resultatenpagina van die Meting. Voor de namen zie Namen bij
  Antwoorden.
- **Benchmark**: De view die in die benchmark bij deze Lead hoort. Bij niveau
  1 is dat de view van de organisatie tegenover de rest van de groep. Bij
  niveau 2 is dat de vergelijking tussen de Metingen in die benchmark waarvoor
  de Lead Resultaten heeft. De Lead ziet dus nooit meer
  dan zijn eigen Metingen (`benchmark.md`, View voor een Lead).

De weergave Positie in de Meting, de ring op de scan van één Respondent, is er
niet voor een Lead en blijft voor de Admin. Spreiding is er wel, als eigen
kolom, zonder ring.

**Grijze cellen.** Een cel die niet aan te vinken is, is grijs, met de reden in
een Info-icoon (`info.leadToegangCel`, de tekst volgt de reden).

- Spreiding, Antwoorden en Exporteren kunnen pas aan als Resultaten van
  dezelfde Meting aan staat. Zet de Admin Resultaten uit, dan gaan ze mee uit.
  Uitnodigen is onafhankelijk.
- Een samengestelde Meting heeft alleen de kolom Resultaten.
- Spreiding is grijs zolang de Meting minder afgeronde scans heeft dan
  `benchmarkMinRespondenten` (startwaarde 5), want met weinig
  stippen is een scan te herleiden tot een persoon.
- Bij anonieme namen (zie hieronder) geldt dezelfde drempel voor Antwoorden.
  Bij namen geldt de drempel voor Antwoorden niet.
- Een benchmarkkolom is grijs als in die benchmark geen enkele groep aan de
  drempel van zijn niveau voldoet (`benchmark.md`, Drempels). Bij een
  benchmark binnen een organisatie (niveau 2) is de kolom ook grijs als de
  Lead voor minder dan twee lid-Metingen Resultaten heeft, want dan is er
  niets te vergelijken. Bij een benchmark tussen organisaties (niveau 1) is Resultaten
  niet nodig, omdat de view de scores van de eigen organisatie zelf al toont.
  Voldoet maar één Assessment aan de drempel, dan ziet de Lead alleen die
  sectie.

Toegang erft niet mee. Een samengestelde Meting en haar onderliggende Metingen
zijn elk een eigen kolom.

**Namen bij Antwoorden.** Per organisatie een vinkje "Namen tonen bij
Antwoorden" (`Organisatie.antwoordenMetNamen`, standaard uit), alleen voor een
Admin, op het organisatie-detail naast de Benchmark-vlag (punt 4), met een
Info-icoon (`info.antwoordenMetNamen`).

- **Uit**: Een Lead ziet de kolommen R1 tot en met Rn, zonder naam in een
  tooltip. De volgorde volgt niet de naam en niet het moment van afronden,
  zodat die geen aanwijzing geeft. De volgorde is een vaste volgorde uit een hash
  van het scan-id, per Meting.
- **Aan**: Een Lead ziet dezelfde kolomkoppen als een Admin, de initialen met
  de volledige naam in een tooltip.
- **Afstemming**: Of namen getoond mogen worden, stemmen Coniche en de
  opdrachtgever onderling af. De app legt dat niet vast bij de respondent. De
  intake en het toestemmingsvakje veranderen niet, en de schakelaar is ook na
  de eerste scan te wijzigen. Wel logt de app elke wijziging
  (`organisatie.antwoordenNamenGewijzigd`), en de bevestiging bij aanzetten
  noemt dat de Leads van deze organisatie dan namen zien. In de kop van de
  kolom Antwoorden staat "met namen" zolang de schakelaar aan staat.
- Een Admin en een Consultant zien altijd de namen.

**Lead toevoegen.** Een oranje knop "+ Lead toevoegen" (`.btn-or
.btn-compact`) in het Leads-venster, onder de tabel, links uitgelijnd. Een klik
opent eronder in het venster een formulier met twee keuzes, een bestaande Respondent van deze organisatie
(keuzelijst) of een nieuwe (naam en e-mailadres). Opslaan geeft de Respondent
de Lead-rol. Een nieuwe Respondent krijgt meteen een persoonlijke link zonder
`ScanInvulling`, met "Kopieer link" en "Openen" zoals bij Respondenten
uitnodigen (punt 6). De nieuwe rij verschijnt zonder vinkjes. Dit is een
eigen actie, los van "Opslaan" van de vinkjes, en verandert de vinkjes die
al zijn gezet niet.

**Op een bestaande respondent.** Het blok Toegang van het Respondent-overzicht
(punt 6b) houdt het selectievakje "Lead", zonder keuze van een bereik.
Aanvinken geeft de Respondent een rij in het Leads-venster. De samenvatting
zegt "Geen Lead" of "Lead, ziet 3 weergaven", met de link "Leads beheren", die
het Leads-venster van de organisatie opent (in dezelfde modal, de inhoud
wordt vervangen). De vinkjes zelf staan alleen in dat venster. Uitvinken trekt de
Lead-rol in, na een bevestiging die zegt dat alle vinkjes van deze Lead
verdwijnen. Gelogd.

**Vinkje "Ook Lead maken" bij het uitnodigen** (punt 6): Snelkoppeling die de
Lead-rol toekent en voor deze Meting Resultaten aanvinkt. Antwoorden en de
rest blijven uit.

**Alsnog een vragenlijst sturen aan een bestaande Respondent**: Een eigen deel
in het Respondent-overzicht (punt 6b), onder het blok Toegang en los van de
Lead-rol. Het geldt voor elke Respondent, ook een gewone. Een keuzelijst met de
Metingen van deze organisatie (of "Nieuwe Meting", zelfde patroon als punt 5)
en daarnaast de knop "Vragenlijst sturen". Metingen waarin de Respondent al een
`ScanInvulling` heeft, zijn niet te kiezen. De actie maakt alleen de
`ScanInvulling` aan, zoals "Respondenten uitnodigen" hierboven. De vinkjes van
een Lead veranderen er niet door.

**Wie dit mag**: Alleen een Admin (`respondenten.leadToekennen`, `datamodel.md`
deel 2, Rechtenmatrix). Een Consultant ziet het blok en het venster niet en kan
geen Lead aanmaken. Een Lead ziet ze nooit.

**Wat de persoonlijke link laat zien (de landingspagina van een Lead)**:
"Mijn metingen" (`schermen.md`) toont voor een Lead alleen wat
een Admin heeft aangevinkt.

- **Kop**: De naam van de organisatie. Een Lead die geen respondent is, ziet
  geen intake, geen vragenlijst en geen lijst met eigen scans.
- **Metingen**: Eén kaart per Meting waarvoor minstens één vinkje aan staat,
  op meetdatum, de nieuwste bovenaan. Op de kaart staan alleen
  de knoppen Resultaten en Uitnodigen, voor zover ze aan staan. Spreiding,
  Antwoorden en Exporteren staan niet op de kaart. Ze zitten in de schakelaar
  en op de resultatenpagina van de Meting, voor zover de Admin ze heeft
  aangevinkt (punt 6a, Wat elke kolom geeft). Een Meting zonder vinkje staat er
  niet.
- **Benchmarks**: Onder de Metingen een kaart per benchmark die aan staat. Een
  Lead kan een benchmark hebben zonder een enkele Meting, en dan bestaat de
  pagina alleen uit die kaart. Wat hij ziet en wanneer, staat in
  `benchmark.md`, View voor een Lead.
- **Eigen scans**: Is de Lead ook respondent, dan staan zijn eigen scans erbij
  met de bestaande status-routing (uitgenodigd, bezig of afgerond). Valt een
  eigen Meting samen met een Meting op zijn pagina, dan is het één kaart (zie
  hieronder). Krijgt de Lead later alsnog een `ScanInvulling` (via
  "Vragenlijst sturen" hierboven), dan verschijnt die als extra item.
- **Lege toestand**: Een Lead zonder vinkjes en zonder eigen scans ziet de
  melding "Er staat nog niets voor je klaar. Neem contact op met Coniche als
  je dit niet verwacht."

**Open punten.**

- Een Consultant heeft in deze opzet geen enkele rol bij Leads. Dat volgt uit
  "alles Admin-only", en kan later worden verruimd.

**Verificatie-blokkade opheffen**: Na 3 mislukte pogingen op een
verificatiecode raakt die geblokkeerd (`datamodel-rollen.md`, Toegang
voor respondenten). De respondent kan zelf gewoon een nieuwe code
aanvragen, dat lost de meeste gevallen vanzelf op. Blijkt dat zelf
herhaaldelijk aanvragen ook misbruikt te worden, dan kan een Admin of
Consultant (bereik `eigen`) de blokkade voor deze respondent expliciet
opheffen, actie in het Respondent-overzicht (punt 6b). Analoog aan de
2FA-reset bij Gebruikers (punt 9), maar dan aan de organisatiekant.

**Valt een eigen Meting samen met een Meting waarvoor de Lead Resultaten
heeft** (de Lead is zelf ook respondent binnen een Meting waar hij ook het
vinkje Resultaten voor heeft, het gebruikelijke geval): **Eén kaart voor die Meting, niet
twee.** Op die kaart staan naast elkaar twee knoppen, waarvan de eerste
afhangt van de status van zijn eigen `ScanInvulling`:

- **Eigen scan, afhankelijk van de status** (de gewone knop uit de
  status-routing van "Mijn metingen", `schermen.md`):
  - `"uitgenodigd"`: "Start de scan".
  - `"bezig"`: "Ga verder".
  - `"afgerond"`: "Bekijk jouw resultaten" → zijn eigen `ScanInvulling`
    (zoals een gewone respondent).
- **"Resultaten hele meting"** → de
  organisatie-resultaten van die Meting (het gemiddelde van alle
  afgeronde scans, zie Organisatie-resultaten hierboven). Opmaak, teaser en
  voorwaarden: `visualisatie-mijn-metingen.md`.

De eigen scan blijft dus altijd bereikbaar, ook als hij nog niet is
afgerond. Alleen "Bekijk jouw resultaten" vervalt zolang de scan niet is
afgerond. Heeft de Lead voor die Meting helemaal geen eigen
`ScanInvulling` (alleen vinkjes in het Leads-venster), dan staat er alleen
"Resultaten hele meting", net als bij elke andere Meting met Resultaten aan.

#### 6b. Respondenten (lijst en overzicht)

Eén lijst van alle Respondenten, met per
Respondent een overzicht (modal) waarin alle acties op die Respondent
staan. Dit vervangt de losse acties per rij in het organisatie-detail
(punt 4), dat daardoor weer over de organisatie zelf gaat.
**Zelfde bereik als de rest van dit onderdeel**: Een Admin ziet alle
Respondenten over alle organisaties heen, een Consultant alleen die van
zijn eigen organisaties (`datamodel-rollen.md`, Rechtenmatrix).

Het verschil met de scanlijst in het Meting-overzicht (punt 5): Die lijst gaat
over de scan, met resultaten en export. Deze lijst gaat over de persoon, met zijn
gegevens, toegang en alle scans op één plek. Een Respondent zonder
scan, zoals een Lead zonder vragenlijst of een leeggeraakte Respondent
na het verplaatsen van zijn laatste respons, staat alleen hier.

- **Kolommen**: Naam, Organisatie, Meting(en), Status en de persoonlijke
  link met "Kopieer link" en "Openen" (zoals bij punt 6). Het Meting-label
  is klikbaar en opent het Meting-overzicht (punt 5). Eén rij per
  Respondent. Heeft de Respondent scans in meer dan één Meting, dan toont
  Meting(en) het aantal ("3 Metingen") en Status "x van y afgerond" over
  alle scans, met de status per Meting in het overzicht. Alle kolommen
  sorteerbaar.
- **Filters**: Organisatie, Meting, Status en een zoekveld op naam en
  e-mailadres. Zelfde patroon als de lijsten onder Resultaten (punt 7). Voor een
  Consultant bevat de Organisatie-keuze alleen zijn eigen organisaties.
- **Overzicht (modal)**: Opent door op een rij te klikken. Eén modal,
  die ook opent via "Bekijk" bij een Respondent in het
  organisatie-detail (punt 4) en bij een Respondent in een Meting. Er is
  dus één overzicht met meerdere ingangen. Navigatie, sluiten en wat er na
  een actie gebeurt staan bij Navigatie in beheer. De vormgeving staat in
  `stylesheet.md`, Overzichtsmodal. Opbouw, van boven naar beneden:
  1. **Kop**: Naam van de Respondent, daaronder de organisatie en de
     status als badge. Rechtsboven het kruisje.
  2. **Gegevens**: Naam, e-mail, functie, team en notities als
     beschrijvingslijst (label links, waarde rechts). Eén kleine knop
     "Bewerken" rechtsboven in het blok. Na klikken verandert het blok in
     een formulier met "Opslaan" en "Annuleren". De rest van de modal
     blijft dan staan.
  3. **Toegang**: De persoonlijke link in een alleen-lezen veld met de
     knop "Kopieer" er direct achter, en ernaast de knop "Openen". Daaronder het selectievakje "Lead" met de samenvatting
     "Geen Lead" of "Lead, ziet 3 weergaven". Aanvinken geeft de Respondent
     een rij in het Leads-venster van de organisatie (punt 6a). De vinkjes
     staan alleen daar, niet in dit blok. Er is geen aparte knop "Beheren" en
     geen tweede venster. "Blokkade
     opheffen" staat alleen in het blok als de Respondent geblokkeerd is.
     Onder het blok staat het deel "Vragenlijst sturen" (punt 6a), met een
     keuzelijst met Metingen en de knop "Vragenlijst sturen".
  4. **Scans**: Eén regel per ingevulde scan, met links Meting en
     Assessment en rechts de status als badge en een menuknop "Acties"
     (dropdown-knop). Het menu bevat Bekijk resultaten, Naar andere
     Meting en Naar andere organisatie. Per regel dus één knop en geen
     rij losse knoppen.
  5. **Hele Respondent**: Onderaan, apart door een scheidingslijn,
     onder de kop "Beheer van deze Respondent". Drie kleine knoppen naast
     elkaar: "Verplaatsen", "AVG-inzage" en "Verwijderen" (rood).
     Verplaatsen en Verwijderen openen een vervolgstap, zie
     Vervolgstappen in de stylesheet.
- **Selectie**: Er is nog geen selectie van meerdere Respondenten. Zie
  `backlog.md` voor de later bedoelde toewijsactie.
- **Rechten**: Elke actie in het overzicht heeft dezelfde rechten als
  voorheen (Admin en Consultant met bereik `eigen`, niet de Lead), behalve
  het selectievakje Lead, dat alleen een Admin mag zetten (punt 6a), zie
  `datamodel-rollen.md`, Rechtenmatrix.

**Acties in het overzicht** (de regels van voorheen, nu hier):

- **AVG-verzoek verwerken** (Admin: Alle organisaties, Consultant:
  eigen): Actie in het blok "Hele Respondent" van het
  Respondent-overzicht. Twee opties:
  - **Inzage**: Downloadt een CSV met alle data van deze respondent:
    persoonsgegevens (naam, e-mail, functie, team, notities) en zijn
    scanresultaten (antwoorden per ingevulde scan). Kolommen,
    bestandsnaam en regels staan in `export-csv.md`, Inzage (AVG).
    De actie is een gewone knop en vraagt geen bevestiging, omdat ze
    niets wijzigt.
  - **Verwijdering**: Hergebruikt de bestaande verwijderactie op de
    respondent (Verwijderen hieronder), geen nieuwe verwijderlogica.
  Beide acties worden gelogd (`datamodel-rollen.md`, Audit), dat is
  meteen ook het bewijs dat een AVG-verzoek daadwerkelijk is
  afgehandeld.
- **Respondent of losse respons naar een andere organisatie
  verplaatsen**: Bedoeld om een verkeerde organisatiekoppeling recht te
  zetten, bijvoorbeeld na een import (`import-scans.md`) waarbij
  per ongeluk een tweede organisatie is aangemaakt voor een klant die al
  bestond onder een net iets andere naam. Twee aparte acties in het
  Respondent-overzicht, elk met een ander effect:

  1. **Hele respondent verplaatsen** (actie per respondent): Zet
     `Respondent.organisatieId` om naar een andere, bestaande
     organisatie. Alle ScanInvullingen van deze respondent gaan mee.
  2. **Eén losse respons verplaatsen** (actie per ingevulde scan in het
     blok "Scans" van het overzicht): De respondent zelf blijft in zijn
     huidige organisatie, alleen deze ene ScanInvulling gaat naar een
     andere organisatie.

  **Doelorganisatie**: Zoeken en kiezen uit bestaande organisaties. Een
  gewone keuzelijst volstaat zolang er weinig organisaties zijn (tot
  ruim tien); daarboven een zoekveld. Geen nieuwe organisatie aanmaken
  vanuit deze actie, dat gebeurt bij Aanmaken in punt 4.

  **E-mailconflict in de doelorganisatie**: Bestaat daar al een
  Respondent met hetzelfde e-mailadres, dan geldt de bestaande regel uit
  `datamodel.md` (Respondent): Hergebruiken in plaats van dupliceren.
  Bij "hele respondent verplaatsen" gaan alle ScanInvullingen dan naar
  die bestaande Respondent, en wordt de verplaatste Respondent zelf (met
  zijn Toegangscode) verwijderd: Zijn persoonlijke link werkt daarna
  niet meer, de link van de bestaande respondent in de doelorganisatie
  blijft gelden. De beheerder bevestigt dit expliciet voordat het
  gebeurt, geen automatische stille samenvoeging. Bij "losse respons
  verplaatsen" gaat alleen die ene respons naar de bestaande (of een
  nieuw aangemaakte) Respondent in de doelorganisatie; de oorspronkelijke
  Respondent blijft gewoon bestaan met zijn overige responsen. Wordt er
  een nieuwe Respondent aangemaakt (geen e-mailmatch), dan nemen naam,
  functie, team en notities van de oorspronkelijke Respondent mee, zodat
  de invuller herkenbaar blijft. Het e-mailadres is de sleutel en komt
  mee. De Toegangscode van de nieuwe Respondent is een nieuwe.

  **Conflict binnen de samenvoeging**: Heeft de bestaande Respondent in
  de doelorganisatie al een scan in dezelfde doel-Meting, dan wordt die
  ene scan overgeslagen en gaan de overige scans wel door. De actie wordt
  dus niet in zijn geheel geblokkeerd. Vóór het uitvoeren toont het
  bevestigingsscherm hoeveel scans worden overgeslagen en in welke
  Meting. Daarna staat in de melding het aantal overgeslagen scans met de
  reden, en elke overgeslagen scan staat in de audit-log. De
  oorspronkelijke Respondent houdt de overgeslagen scans en wordt dan niet
  verwijderd. Zo gaat er niets stilletjes verloren.

  **Meting in de doelorganisatie**: Een ScanInvulling hangt aan een
  Meting, en een Meting hoort bij precies één organisatie
  (`datamodel.md`). Verplaatsen van een respons vraagt dus ook een
  Meting in de doelorganisatie, van hetzelfde Assessment-type. Bestaat
  die al, dan kiest de beheerder welke. Bestaat die nog niet, dan maakt
  de actie er automatisch één aan, met hetzelfde label als de
  oorspronkelijke.

  **Meting bij "hele respondent verplaatsen"**: Dezelfde regel geldt per
  Meting waar de Respondent een scan in heeft. Het bevestigingsscherm
  toont één regel per bron-Meting (label en Assessment-type), met als
  voorstel een bestaande Meting in de doelorganisatie met hetzelfde label
  en Assessment-type, en anders "Nieuwe Meting met dit label". De
  beheerder kan elke regel aanpassen naar een andere bestaande Meting van
  hetzelfde Assessment-type of naar een nieuwe, en bevestigt daarna in
  één keer. Er blijft nooit een scan achter aan een Meting van de
  oorspronkelijke organisatie, want een Meting hoort bij precies één
  organisatie.

  **Lead-rol bij verplaatsen**: De Lead-rol gaat niet mee naar een andere
  organisatie. Bij het verplaatsen van een Respondent worden de Lead-rol en al
  zijn `LeadToegang` verwijderd. Bij een samenvoeging behoudt de bestaande
  Respondent zijn eigen vinkjes (`datamodel.md`, Verplaatsen, samenvoegen en
  importeren).

  **Twee verwijzingen per scan**: Een ScanInvulling heeft een verwijzing naar
  zijn Respondent (`organisatieLidId`) en naar zijn Meting
  (`scanUitvoeringId`). Elke verplaatsing werkt beide bij, ook "Respons naar
  andere Meting verplaatsen". Anders meldt de data-integriteitscontrole
  (punt 13) een correct verplaatste scan als zonder Meting.

  **Leeggeraakte respondent**: Verplaatst een losse respons de laatste
  ScanInvulling van een respondent weg, dan blijft die respondent zonder
  scans, maar mét zijn toegangscode, gewoon staan in de oorspronkelijke
  organisatie. Geen automatische opruiming: Er kan bewust reden zijn om
  deze respondent daar te laten staan, bijvoorbeeld om later opnieuw uit
  te nodigen voor een nieuwe meting. Opruimen blijft een aparte, bewuste
  actie (bestaande verwijderfunctie op de respondent).

  **Resultaat**: Een organisatie waar na het verplaatsen niets meer
  onder hangt, is te verwijderen via de bestaande verwijderfunctie
  hieronder (Verwijderen). Die cascade is dan leeg, geen nieuwe logica
  nodig.
- **Respons naar andere Meting verplaatsen**: Hangt een
  ingevulde scan onder een andere Meting van dezelfde organisatie.
  Bedoeld voor de responsen die de import (`import-scans.md`) in een
  eigen import-Meting heeft gezet, maar bruikbaar voor elke
  ScanInvulling. Dit is een voorwaarde voor de importaanpak: De import
  maakt altijd nieuwe Metingen aan en de beheerder hangt de responsen
  daarna om.

  1. **Eén respons** (actie per ingevulde scan in het blok "Scans"
     van het overzicht, naast "Eén losse respons verplaatsen" hierboven).
  2. **Meerdere responsen tegelijk** (actie op de selectie in de
     scanlijst van het Meting-overzicht, punt 5). Alle
     geselecteerde scans gaan naar dezelfde doel-Meting.

  **Doel-Meting**: Kiezen uit de Metingen van dezelfde organisatie met
  hetzelfde Assessment-type als de huidige Meting, of in dezelfde stap een
  nieuwe Meting aanmaken met een onderdeel en een meetdatum (zoals bij punt 5,
  zonder label). Organisatie,
  Respondent en antwoorden blijven ongewijzigd.

  **Respondent heeft in de doel-Meting al een scan**: Een Respondent heeft
  per Meting één ingevulde scan. Bestaat die er al, dan wordt die ene
  respons niet verplaatst en krijgt de beheerder een melding met het
  aantal overgeslagen scans en de reden. De overige geselecteerde scans
  gaan wel door, en elke overgeslagen scan staat in de audit-log. Bij elke
  overgeslagen scan in de melding staat de knop "Conflict oplossen".

  **Conflict oplossen (modal)**: Dit conflict ontstaat vooral na een
  import, omdat de import een Respondent op e-mailadres hergebruikt
  (`import-scans.md`, "Wie de Respondent wordt"). Dan hangen beide scans aan
  dezelfde Respondent, vaak een Coniche-medewerker, en is het wijzigen van
  naam of e-mail geen oplossing, want dat geldt voor beide scans. Er moet
  één van de twee scans aan een andere Respondent hangen. De modal
  "Twee scans van dezelfde Respondent" helpt daarbij:
  - **Twee kolommen**: Links de scan die al in de doel-Meting staat,
    rechts de scan die wordt verplaatst. Per kolom staan de gegevens van
    de scan (Meting, afgerond op, voortgang en totaalscore) en daaronder
    de gegevens van de Respondent (naam, e-mail, functie, team, notities).
    De gegevens van de gedeelde Respondent zijn in beide kolommen gelijk.
    Per kolom staat ook de notitie van de scan zelf (`datamodel.md`, Notitie
    op de scan), die per scan verschilt en dus laat zien welke Respondent erbij
    hoort.
  - **Per kolom de knop "Andere Respondent koppelen"**: De knop zit onder
    het Respondent-blok van die kolom. Na een klik wordt dat blok zelf
    bewerkbaar, op de plek waar het staat. Er opent geen apart formulier
    onder de modal. Bovenaan het blok staat een keuzelijst met "Nieuwe
    Respondent" en de bestaande Respondenten van dezelfde organisatie.
    - **Nieuwe Respondent**: De velden Naam, E-mail, Functie, Team en
      Notities worden invoervelden in de rijen waar de waarden stonden,
      vooraf ingevuld met de huidige gegevens. Het e-mailveld is leeg en
      toont de hint "E-mailadres (eigen, nog niet gebruikt)", want een
      nieuwe Respondent heeft een eigen adres nodig dat nog niet bij een
      andere Respondent in de organisatie voorkomt. Het e-mailadres is de
      sleutel (`datamodel.md`, Respondent). Is het echte adres nog niet
      bekend, dan kan de beheerder een tijdelijk adres invullen en dat later
      wijzigen met "Respondent bewerken".
    - **Bestaande Respondent**: De velden tonen de gegevens van de gekozen
      Respondent, alleen-lezen.
    - **Opslaan en Annuleren**: Onder het blok, in dezelfde kolom. De
      knop "Andere Respondent koppelen" maakt hier plaats voor. Annuleren
      zet het blok terug zoals het was. De andere kolom blijft intact.
  - **Effect van opslaan**: Alleen die ene scan gaat naar de gekozen
    Respondent. De oorspronkelijke Respondent blijft bestaan met de andere
    scan. Een nieuwe Respondent krijgt een nieuwe Toegangscode.
  - **Daarna**: De modal biedt "Verplaatsen alsnog uitvoeren" voor de scan
    die was overgeslagen. Bij een bulkactie lost de beheerder de conflicten
    een voor een op, en de overige scans zijn dan al verplaatst.
  - **Bewerkslot**: De betrokken Respondenten vallen onder het Bewerkslot
    (`datamodel.md`), zolang de modal open staat.
  - **Audit-log**: `respons.respondentGewijzigd`, en bij een nieuwe
    Respondent ook de bestaande aanmaakactie (`datamodel.md`, Audit).

  **Lege Meting**: Blijft staan na het verplaatsen van de laatste respons.
  Opruimen is een aparte actie, via de bestaande verwijderfunctie
  (Verwijderen).
- **Scans samenbrengen in één Meting**: Zet
  scans die na een import verspreid over losse Metingen staan en onder één
  Respondent hangen, in één keer in één Meting en koppelt ze aan de juiste
  Respondent. Het voorbeeld is een import van tien bestanden waarin steeds
  dezelfde medewerker de invuller is en de echte persoon in de notitie
  staat. Het gewenste eindresultaat is één Meting met tien
  Respondenten. De bestaande acties "Respons naar andere Meting verplaatsen"
  en "Andere Respondent koppelen" kunnen dit ook, maar dan scan voor scan en
  met een conflictmelding bij elke scan na de eerste, omdat één Respondent
  maar één scan per Meting kan hebben. Deze actie doet het in één scherm.

  **Waar**: Actie "Samenbrengen in één Meting…" op de selectie in de lijst
  Metingen (Resultaten, punt 7). Het gaat om alle scans van de geselecteerde
  Metingen. Alle geselecteerde Metingen hebben dezelfde organisatie en
  hetzelfde Assessment, anders is de actie uitgeschakeld met een Info-icoon dat
  zegt waarom (`info.scansSamenbrengen`).

  **Het scherm** (modal, twee delen):
  1. **Doel-Meting** bovenaan: Kiezen uit bestaande Metingen van dezelfde
     organisatie en hetzelfde Assessment, of "Nieuwe Meting" met de velden
     Onderdeel en Meetdatum (zoals bij punt 5), zonder Label. Voor het
     voorbeeld: Meetdatum 14-01-2026, Onderdeel "Team Service". De meetdatum
     is voorgevuld met de oudste meetdatum van de geselecteerde Metingen. Het
     onderdeel is voorgevuld uit het oude label van de eerste
     geselecteerde Meting (`datamodel.md`, Onderdeel uit het label voorstellen),
     niet blind met "Hele organisatie". Bestaat de combinatie van onderdeel,
     Assessment en meetdatum al, dan staat er een waarschuwing met de Meting
     die er al is, en kan de beheerder die Meting hierboven kiezen of toch
     doorgaan (`datamodel.md`, Meting).
  2. **Tabel met één regel per scan**: Kolommen Huidige Meting, Notitie
     (van de scan), Huidige Respondent en Respondent in de doel-Meting. De
     laatste kolom is een keuzelijst met "Dezelfde Respondent houden", "Nieuwe
     Respondent" en de bestaande Respondenten van de organisatie. Bij "Nieuwe
     Respondent" klapt de regel open met Naam, E-mail (verplicht, nog niet in
     gebruik, een tijdelijk adres mag), Functie en Team. De velden zijn
     leeg, niet vooraf ingevuld met de gegevens van de gedeelde Respondent.
     De notitie staat zichtbaar in de regel, zodat de beheerder de naam eruit
     kan overnemen. Een nieuwe Respondent krijgt een nieuwe Toegangscode.

  **Controle vóór opslaan**: De knop "Samenbrengen" is pas actief als elke
  Respondent hoogstens één scan in de doel-Meting heeft. Dat geldt ook voor
  scans die er al in staan. Een regel die botst krijgt een rode melding in de
  regel zelf ("{naam} heeft al een scan in deze Meting"), met de andere regel
  erbij genoemd. Er is dus geen losse conflictmelding achteraf.

  **Alles of niets**: De actie slaat alles in één keer op, of niets. Per scan
  wordt zowel de Respondent als de Meting bijgewerkt (`scanUitvoeringId` en
  `organisatieLidId`, zie "Twee verwijzingen per scan"). Antwoorden en
  organisatie blijven ongewijzigd.

  **Na afloop**: De melding noemt het aantal scans en de doel-Meting.
  De bron-Metingen die leeg zijn, blijven staan (zie "Lege Meting"),
  met in de melding het aantal lege Metingen en een knop "Lege Metingen
  verwijderen" die de bestaande verwijderfunctie gebruikt na bevestiging.

  **Bewerkslot**: Alle betrokken scans en Respondenten vallen onder het
  Bewerkslot zolang de modal open staat (`datamodel.md`).

  **Audit-log**: Per scan `respons.metingVerplaatst` en, als de Respondent
  wijzigt, `respons.respondentGewijzigd`, alle met hetzelfde `groepId`
  (`datamodel.md`, Audit).

  **Niet automatisch**: De app probeert de Respondent niet zelf uit de notitie
  te halen. Notities zijn vrije tekst, en een verkeerde koppeling merkt
  niemand op. De beheerder leest de notitie en kiest.
- **Respondent bewerken**: Actie in het Respondent-overzicht
  (Admin: Alle organisaties, Consultant: Eigen). Bedoeld om een Respondent die de import
  aanmaakt (`import-scans.md`, "Wie de Respondent wordt"), vaak een
  Coniche-medewerker, later aan de echte persoon te koppelen, maar
  bruikbaar voor elke Respondent.
  - **Velden**: Naam, e-mail, functie, team en notities. Dat zijn dezelfde
    gegevens als in de intake en in "Mijn gegevens" aan de
    respondentkant, aangevuld met het e-mailadres.
  - **E-mailadres**: Wordt genormaliseerd opgeslagen (getrimd, lowercase,
    `datamodel.md`, Respondent). Bestaat het nieuwe adres al bij een
    andere Respondent in dezelfde organisatie, dan geldt dezelfde regel als
    bij "Hele respondent verplaatsen" hierboven (E-mailconflict): De scans
    gaan naar de bestaande Respondent, de bewerkte Respondent met zijn
    Toegangscode wordt verwijderd, en de beheerder bevestigt dat expliciet.
  - **Toegangscode**: Blijft ongewijzigd na een nieuw e-mailadres. Zodra
    e-mailverificatie bestaat (`backlog.md`), bepaalt dit adres wie bij de
    scans van deze Respondent kan.
  - **Alle scans gaan mee**: Een wijziging geldt voor alle ingevulde scans
    van deze Respondent in de organisatie. Dat staat in het formulier zelf,
    boven de velden, als vaste regel: "Deze wijziging geldt voor alle {n}
    scans van {naam} bij {organisatie}", met de labels van de Metingen
    eronder. Heeft de Respondent maar één scan, dan staat er "voor de scan
    in {Meting}". De regel staat er ook als het formulier vanuit een
    Scan-overzicht is geopend.
  - **Alleen voor één scan**: Wil de beheerder een andere naam alleen bij
    één scan, dan is dat geen bewerking van de Respondent maar een andere
    Respondent aan die scan koppelen ("Andere Respondent koppelen" in het
    Scan-overzicht, punt 7). De scan krijgt dan een nieuwe of bestaande
    Respondent, de oorspronkelijke Respondent houdt zijn naam en zijn andere
    scans.

#### 8. Import van historische scans (CSV)

Eenmalige of periodieke import van ingevulde scans uit de oude,
stopgezette tool, zodat historische klantdata behouden blijft. Volledige
spec, inclusief veldmapping en matchingregels: `import-scans.md`.

**Alleen voor een Admin, op organisatieniveau.** De import start vanuit het
organisatie-detail (punt 4) met de knop "Importeren" (`.btn-compact`), in de
kop van het blok Metingen, rechts. De import hoort dan bij die ene organisatie:
Alle scans komen in die organisatie terecht. Er is geen aparte tab Import meer
en geen import over organisaties heen. Een Consultant ziet de knop niet. Opent
hij de importroute rechtstreeks, dan toont de pagina een melding in dezelfde
opmaak als de melding bij een lege lijst, zoals "Nog geen organisatie
aangemaakt" (een `.admin-notice`, zie `stylesheet.md`), met de tekst: "Vraag de
beheerder om bestanden te importeren." De tekst staat vast in de code en hoort
niet in het register van Algemene teksten (punt 2a). Een importverzoek van een
Consultant wordt geweigerd. Reden: Een Consultant kan niet vaststellen of een
import in een organisatie hoort die hij zelf niet mag zien, en de import kan
Respondenten en Metingen aanmaken.

Bij "Oude tool" kies je een map met losse CSV's (één bestand per scan) of
losse bestanden. Een bestand mag ook rijen van andere organisaties bevatten:
Die koppel je in de voorbeeldweergave aan deze organisatie of sla je over
(`import-scans.md`, Organisatie-matching). Elke import maakt nieuwe Metingen aan
met "import" in het label en de meetdatum uit het bestand
(`import-scans.md`, Meetdatum). De beheerder
hangt de responsen daarna om naar de juiste Meting (punt 6b, "Respons naar
andere Meting verplaatsen"). Elke scan krijgt een Respondent met de gegevens
uit het bestand (naam, e-mailadres, functie, team en notitie), die de
beheerder daarna kan bewerken (punt 6b, "Respondent bewerken").

Importeren gaat met één knop, "N rijen importeren", voor de hele set. Rijen
met een waarschuwing (een 95%+-match) tellen pas mee na een expliciete
goedkeuring per rij; er is geen import per rij (`import-scans.md`,
Werkwijze in beheer, punt 6).

### Resultaten (Admin: Alle, Consultant: Eigen)

#### 7. Resultaten

Alles wat uit ingevulde scans komt, staat onder één hoofdlink: Resultaten. Een
Admin ziet alles, een Consultant alleen de Metingen van zijn eigen
organisaties (`datamodel-rollen.md`, Rechtenmatrix, `resultaten.inzien`).
Benchmarks zijn alleen voor een Admin (`benchmark.beheren`). De hoofdlink staat
in `.nav-right` na Organisaties.

De tabs zijn Metingen en, voor een Admin, Benchmarks en Verkennen. Heeft een gebruiker maar
één tab, zoals een Consultant, dan toont de pagina geen tabbalk. Elke lijst
opent met een klik op de rij het volgende niveau, hetzelfde patroon als de
benchmarkniveaus (`benchmark.md`): Een lijst van deelnemers, en per deelnemer
een view een niveau dieper.

- **Metingen**: Eén rij per Meting, op meetdatum, de nieuwste bovenaan.
  Kolommen: Organisatie, Meting (de naam), Onderdeel, Assessment, Meetdatum,
  Afgeronde scans ("x van y") en "Bekijk". Een Meting zonder meetdatum staat
  onderaan met "Datum ontbreekt". Een samengestelde Meting heeft de badge
  "Gemiddelde". Filters: Organisatie, Assessment en een periode op meetdatum.
  Alle kolommen zijn sorteerbaar. Een klik op de rij opent het Meting-overzicht
  (punt 5), met de lijst scans, het Scan-overzicht en de resultaten van één
  scan. Je komt dus altijd van organisatie via Meting bij de scan.
- **Benchmarks** (alleen Admin): De benchmarks, punt 14. Daaronder vallen ook
  de vergelijkingen tussen Metingen (`benchmark.md`, Niveau 2).
- **Verkennen** (alleen Admin): Alle
  Organisaties van één Assessment filteren, groeperen en vergelijken, punt 15.
- **Selectie**: Selectievakje per rij, met de acties "Exporteren" voor de
  afgeronde scans van de geselecteerde Metingen (zie Export hieronder) en
  "Samenbrengen in één Meting…" (punt 6b).

**Waar de functies van de oude pagina Ingevulde scans zijn gebleven.**

- De lijst met scans en de kolommen Rol/Team, Gestart, Aangemaakt en Notitie:
  Die staan per Meting in het Meting-overzicht (punt 5).
- Zoeken op naam of e-mailadres over alle organisaties: Dat kan in de lijst
  Respondenten (punt 6b).
- Exporteren, Verwijderen en "Naar andere Meting" op een selectie scans: Die
  staan in het Meting-overzicht. Exporteren op een selectie Metingen staat in
  de lijst hierboven.
- "Samenbrengen in één Meting…": Staat op een selectie in de lijst Metingen
  (punt 6b).
- Het Scan-overzicht blijft bestaan, hieronder.
- Import: Een knop in het organisatie-detail (punt 8).

- **Scan-overzicht (modal)**: Vervangt de vroegere detailpagina per
  scan. Eén modal volgens het patroon Overzichtsmodal in `stylesheet.md`,
  met dezelfde navigatieregels als het Respondent-overzicht (Navigatie in
  beheer). Opbouw, van boven naar beneden:
  1. **Kop**: Naam van de Respondent, daaronder Organisatie, Meting en
     Assessment, en de status als badge.
  2. **Scan**: Beschrijvingslijst met Rol/Team (volgens de lege-waarderegel
     hierboven), Notitie (alleen als de scan er een heeft), Gestart, Afgerond (alleen bij een afgeronde scan),
     Voortgang ("60 van 60 vragen", bij een lopende scan met percentage)
     en Totaalscore met het niveau (alleen bij een afgeronde scan). Geen
     tegels.
  3. **Toegang**: De persoonlijke link in een alleen-lezen veld met
     "Kopieer" eraan vast en "Openen" ernaast, zoals bij het
     Respondent-overzicht. Er staat geen bouwerstekst of verwijzing naar
     een ander document in de interface.
  4. **Acties**: Compacte knoppen naast elkaar, links uitgelijnd:
     "Resultaten bekijken" (alleen bij een afgeronde scan, opent het
     resultatenscherm), "Exporteren" als dropdown-knop (zelfde opties en
     rechten als op de resultatenpagina), "Naar andere Meting" (opent een
     vervolgstap, punt 6b), "Andere Respondent koppelen" (zie hieronder) en
     apart onderaan "Verwijderen" (rood, opent een vervolgstap met
     bevestiging). Daarnaast de knop "Bekijk
     Respondent" (opent het Respondent-overzicht).

     **Naam van de Respondent in de kop**: De kop is alleen-lezen. De naam
     staat op de Respondent, niet op de scan, dus een naamwijziging via
     "Bekijk Respondent" en "Respondent bewerken" geldt voor alle scans van
     die Respondent, en het formulier zegt dat (punt 6b). Alleen deze scan
     onder een andere naam is "Andere Respondent koppelen".

     **Andere Respondent koppelen**: Opent een vervolgstap met
     hetzelfde blok als in "Conflict oplossen" (punt 6b): Een keuzelijst met
     "Nieuwe Respondent" en de bestaande Respondenten van dezelfde
     organisatie. Bij "Nieuwe Respondent" zijn Naam, E-mail, Functie, Team en
     Notities invoervelden, vooraf ingevuld met de huidige gegevens, met een
     leeg e-mailveld dat nog niet bij een Respondent in de organisatie
     voorkomt. Bij een bestaande Respondent zijn de velden alleen-lezen. Alleen
     deze ene scan gaat naar de gekozen Respondent. Heeft die Respondent in
     deze Meting al een scan, dan is hij niet te kiezen en staat er waarom. De
     oorspronkelijke Respondent blijft staan (ook zonder scans, zoals bij
     "Leeggeraakte respondent" in punt 6b). Audit-log:
     `respons.respondentGewijzigd`. Verplaatsen
     naar een andere organisatie staat alleen in het Respondent-overzicht.
  Rechten per actie zijn gelijk aan die op deze lijst en het resultaten-
  en exportbereik uit `datamodel-rollen.md`, Rechtenmatrix.
- **Export**: Eén gedeelde exportfunctie voor een selectie scans (Meting-overzicht),
  een selectie Metingen (deze lijst) en de resultatenpagina (één
  scan), zie `export-csv.md` voor de exacte kolommen. Een selectie Metingen
  exporteert de afgeronde scans daarin. **Bulk-CSV (meerdere scans in één
  export) alleen binnen één organisatie**, in verband met datavermenging, zie
  `export-csv.md`. Horen alle geselecteerde Metingen bij dezelfde
  organisatie, dan werkt "Exporteren" ook in de lijst Metingen
  zonder eerst te filteren. Bevat de selectie Metingen van meer dan
  één organisatie, dan is "Exporteren" uitgeschakeld, met een Info-icoon ernaast
  (`info.bulkExportOrganisatie`, register in punt 2a). PDF en de InDesign-export
  (XML) zijn sowieso alleen beschikbaar bij precies één scan (Meting-overzicht
  of resultatenpagina), zie `export-pdf-visual-volwassenheidsscan.md`, Export
  van één scan, geen aggregatie, en `export-indesign.md`.

Selecteren en verwijderen is een terugkerend patroon: Dezelfde component
komt ook op de lijst van organisaties, de metingen en de respondenten.

**Open punten.**

- Een Consultant ziet geen Benchmarks. Verruimen kan later (`benchmark.md`).

#### 14. Benchmarks

De tab Benchmarks onder Resultaten (punt 7), alleen zichtbaar voor een Admin
(`benchmark.beheren`, `datamodel-rollen.md`, Rechtenmatrix). Een Consultant
ziet de tab niet. Het gedrag staat in `benchmark.md`, de records in
`datamodel.md`, Deel 2: Benchmark. Hier staan de schermen.

Alle drie de niveaus staan op deze plek (`benchmark.md`, Wat het is). De
schermen hieronder gelden voor niveau 1 (tussen organisaties). Wat voor
niveau 2 en 3 anders is, staat onder Niveau 2 en 3 aan het eind van dit punt.

- **Lijst**: Alle benchmarks, per rij de naam, de Assessments, per
  Assessment het aantal organisaties als "X van Y" (`benchmark.md`, Teller)
  en wanneer de benchmark is aangemaakt. Bij niveau 1 een badge Vaste groep of Verkenning. Zodra er meer dan één niveau bestaat, komt er een kolom Niveau en bij niveau 2 de lezing. Boven de lijst een oranje knop
  "+ Benchmark aanmaken" (`.btn-or .btn-compact`).
- **Aanmaken en wijzigen**: Eerst de Assessments, daarna de organisaties
  met het optionele sectorfilter, en per organisatie de Meting per
  Assessment in dezelfde lijst, met alle Metingen als keuze, gewone en
  samengestelde, en niet stil de meest recente (`benchmark.md`, Samenstellen). De Admin
  geeft de benchmark een naam. Wijzigen van de samenstelling kan altijd.
  Organisaties met de vlag die niet in de lijst staan, komen onder de lijst
  met de reden. De knop "Benchmark aanmaken" is uitgeschakeld tot de benchmark een naam,
  een Assessment en een organisatie heeft, met de reden in
  `info.benchmarkAanmaken`. Zodra er meer dan één niveau bestaat, komt eerst een keuze voor het niveau.
- **Verkenning**: Een benchmark die uit
  Verkennen komt (`benchmark.md`, Opgeslagen verkenning) staat in de lijst met
  de badge Verkenning en het aantal Organisaties van dit moment. Het detail
  toont erboven de filters als regels ("CRM-pakket is Salesforce"), de Meetperiode en de eenheid. De
  leden zijn berekend en niet te kiezen. De Admin wijzigt de naam, de
  filters en de Meetperiode met de knop "Wijzigen" (zie Opgeslagen verkenning, Aanpassen). Het
  Assessment en de eenheid zijn vast. Aanmaken
  gaat alleen vanuit Verkennen. De teller volgt de eenheid, bij Onderdelen
  "3 onderdelen van 1 Organisatie" (`benchmark.md`, Teller). Het detail en het perspectief
  van een lid staan in `benchmark.md`, Opgeslagen verkenning, Detail en perspectief.
  Een lege pagina komt niet voor. Zonder uitkomst staat er een melding met de reden. Bij het verwijderen staat in de bevestiging
  hoeveel vinkjes van Leads vervallen, zoals bij een Vaste groep.
- **Detail**: Kruimelpad Resultaten › Benchmarks › {naam}. Per Assessment een sectie met
  de teller "X van Y organisaties", de gemiddelden van de groep en per
  organisatie het aantal afgeronde scans. De Admin ziet hier de namen van
  de organisaties, ook van de organisaties die in een Assessment
  ontbreken (`benchmark.md`, Weergave voor de Admin). Onder de gemiddelden
  staat per Assessment de matrix "Per bouwblok en per organisatie", met de
  bouwblokken als rijen en de organisaties als kolommen (`benchmark.md`,
  Weergave voor de Admin, en `visualisatie-scores.md`, onderdeel E). Is een lid
  automatisch weggevallen, dan staat boven het detail een melding
  (`Benchmark.meldingen`) die de Admin kan wegklikken. Onder de cijfers
  staat de peildatum.
- **View per organisatie**: Vanuit het detail opent de Admin voor elke
  deelnemende organisatie een view met die organisatie tegenover de rest
  van de groep (`benchmark.md`, View per organisatie). Het groepsgemiddelde
  staat in het staafdiagram als tweede, neutrale balk.
- **Leads**: Op de view staat geen blok om een Lead te kiezen. Wie de
  view ziet, vink je aan in het Leads-venster van de organisatie (punt 6a). Onder
  de view staat alleen een lijst van de Leads die hem nu zien, met per Lead de
  knop "Bekijk" (Respondent-overzicht, punt 6b) en een verwijzing naar de
  tabel. Zie `benchmark.md`, View voor een Lead.
- **Verwijderen**: Met een bevestiging die noemt hoeveel vinkjes van Leads
  meegaan.

**Niveau 2 en 3 (niveau 2).** Niveau 2 gebruikt dezelfde schermen met een
andere keuzelijst: Eerst één organisatie, dan één Assessment, dan de Metingen
daarvan (de eerste versie precies twee, zonder vlag). Elke Meting heeft een
meetdatum en minimaal `benchmarkMinScans` afgeronde scans, en ook een
samengestelde Meting mag meedoen. Onder de lijst staat de schakelaar "Lees
als" met "Ontwikkeling over tijd" en "Naast elkaar" (`Benchmark.lezing`,
`benchmark.md`, Niveau 2, Lezing). Onder elke keuze staat één regel uitleg:
"Dezelfde Meting op twee momenten. Het onderdeel is gelijk en de meetdatum
verschilt." en "Twee onderdelen of samenstellingen op een vergelijkbaar
meetmoment." De app stelt een keuze voor zolang de Admin de schakelaar niet zelf
heeft aangeraakt. Bij Ontwikkeling over tijd staan Metingen met een ander
onderdeel uitgeschakeld in de lijst, met de reden erbij, en kan Opslaan niet bij
twee gelijke meetdata. Bij Naast elkaar staat onder de lijst een waarschuwing als
de meetdata meer dan `benchmarkMaxDagenTussenMetingen` dagen uit elkaar liggen
(punt 10). Opslaan blijft dan mogelijk. In het detail staan de Metingen op
meetdatum (bij Naast elkaar op naam), met de matrix, bij twee Metingen een kolom
Verschil of Hoogste en weergave C of H, naar de lezing (`benchmark.md`, Niveau 2). Er is geen groepsgemiddelde. Niveau 3 is een view
op één Meting: De scan van een Respondent naast het gemiddelde van de andere
scans in die Meting. De hoofdpagina van zo'n Meting toont boven de lijst met
scans het Overzicht en de Spreiding, zonder de positie-ring, en pas daaronder
de lijst (`visualisatie-scores.md`, onderdeel J). Kiest de Admin een scan, dan
staat de samenvatting van die Respondent boven de positie ten opzichte van de
groep (`benchmark.md`, Niveau 3). De vergelijking (niveau 2) geeft
de Admin via het Leads-venster aan een Lead met Resultaten op de Metingen daarin. De
spreiding binnen een Meting (niveau 3) krijgt een Lead als kolom Spreiding
(punt 6a). De view op één scan blijft voor de Admin.

#### 15. Verkennen

Het gedrag staat in `visualisatie-verkennen.md`, hier staat de plek in beheer.

De tab Verkennen onder Resultaten (punt 7), alleen zichtbaar voor een Admin
(`verkennen.inzien`, `datamodel-rollen.md`, Rechtenmatrix). Een Consultant ziet
de tab niet. Kruimelpad Resultaten › Verkennen. Het scherm slaat zelf niets op. Alleen de knop Opslaan als benchmark bewaart de filters.

- **Bovenaan**: De eyebrow Resultaten, de paginatitel Verkennen en een
  keuze van het Assessment. Alles op de pagina werkt binnen dat ene
  Assessment.
- **Eenheid**: Een pilvormige groep
  Organisaties of Onderdelen naast de keuze van het Assessment
  (`visualisatie-verkennen.md`, Eenheid). Bij Onderdelen komen de kenmerken
  Organisatie en Onderdeel erbij, en tellen de teller, de teksten en de
  drempels in onderdelen.
- **Opslaan als benchmark**: Onder
  de teller en de balk in de kaart Kenmerken staat de knop "Opslaan als
  benchmark" met een Info-icoon (`info.verkennenOpslaan`). De knop opent een
  paneel met het veld Naam (zichtbaar voor de Lead), de filters als regels,
  het aantal in de groep en "Opslaan" en "Annuleren". Na Opslaan staat er een
  groene regel met de naam en de verwijzing naar het Leads-venster
  (`visualisatie-verkennen.md`, Opslaan als benchmark).
- **Kenmerken**: De kaart Kenmerken (`visualisatie-verkennen.md`, Kenmerken
  en filters). Een KPI staat erin met een keuze van het kanaal (`visualisatie-verkennen.md`, KPI's als kenmerk). Het scherm begint leeg, met "Snel beginnen" (CRM-pakket,
  Sector, AHT) en een knop "Kenmerk toevoegen" met een menu per groep van
  velden met zoekveld. Per kenmerk een rij met de korte naam, een potlood voor
  de korte namen van dat veld (punt 3), een kruisje en de keuzepillen met het
  aantal Organisaties erachter. Daaronder "Wis filters" en de teller "X van Y
  Organisaties in de pool" met een balk, en een regel met het aantal
  Organisaties zonder toestemming voor benchmark.
- **Vergelijken**: Groeperen op als pilvormige groep met de kenmerken die
  kunnen groeperen (met reden in een tooltip bij een uitgeschakelde pil), de
  pil "Geen kenmerk" zolang er niets is toegevoegd, de AHT- of NPS-drempel
  als slider met histogram, en de focusgroep als pillen. Zonder groepering
  toont het scherm de hele pool. Een waarschuwing staat in beeld bij een
  kleine groep.
- **Resultaten**: Vier weergaven in de weergave-schakelaar (`stylesheet.md`,
  Tabbalk en kruimelpad): Groep tegenover de rest, Spreiding binnen de groep,
  Alle groepen naast elkaar en Verband met een kenmerk.

---

## Verwijderen

Wat er precies wordt verwijderd, staat in `datamodel.md` onder
"Verwijderen en datakoppelingen". Kort:

- **Ingevulde scan**: Alleen die invulling. De respondent en zijn link
  blijven bestaan.
- **Respondent**: De persoon met al zijn ingevulde scans.
- **Meting**: De meting met alle ingevulde scans daarin. Het Onderdeel blijft
  bestaan.
- **Onderdeel**: Alleen zonder Metingen, met de
  KPI-waarden van het Onderdeel. De knop staat uitgeschakeld zolang er Metingen
  zijn, met de reden.
- **Kanaal**: Het kanaal met al zijn KPI-waarden
  bij alle Organisaties.
- **Organisatie**: Alles wat eronder hangt, ook de Onderdelen en de KPI-waarden.
- **Benchmark**: De benchmark met de vinkjes van Leads voor die benchmark.
  Organisaties, Metingen en scans blijven bestaan.

Zit een Meting of Organisatie in een benchmark, dan noemt de bevestiging
dat ook, omdat het lid dan uit die benchmark verdwijnt (`datamodel.md`,
Verwijderen en datakoppelingen).

Elke verwijderactie vraagt een bevestiging die noemt wat er mee
verdwijnt, bij een organisatie met aantallen. Na verwijderen blijft er
geen losse data achter.

Opnieuw invullen is iets wat de respondent later zelf vanuit de scan
doet, niet een beheeractie (`backlog.md`).

---

## Ter overweging, nog niet besloten

- Een respondent opnieuw uitnodigen zonder een nieuwe aan te maken
- Toegang van een respondent intrekken (nieuwe code, oude link werkt dan
  niet meer)
- Meerdere e-mailadressen tegelijk uitnodigen
- Herinneringsmail bij respondenten die lang op "uitgenodigd" of "bezig"
  staan
- Een organisatie dupliceren als sjabloon

## Open punten

- Of bouwblokken en vragen herbruikbaar moeten zijn tussen
  assessment-types.
- Organisatiekenmerken worden in de praktijk soms samen met medewerkers
  van de klant ingevuld. Het huidige model kent die toegang niet
  (`backlog.md`).
- Geen eigen schermflow-beschrijving voor de beheerkant, zoals
  CLAUDE.md die wel heeft voor de respondentkant. De top-level
  navigatie ligt nu vast (Assessments/Organisaties/Benchmark, met Instellingen in het Accountmenu, zie Wat
  beheerbaar is hierboven), maar een doorlopende flow-beschrijving per
  scherm binnen die drie onderdelen ontbreekt nog, de schermen staan
  alleen hier, per onderdeel, niet als samenhangende flow.
- Het datamodel achter onderdeel 11, Content-pagina's (Visie,
  Bouwblokken, AI, 2030): Welke records, versiebeheer, archiveren i.p.v.
  verwijderen zoals bij Content per Assessment.
