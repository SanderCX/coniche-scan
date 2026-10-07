# Coniche Scan: Beheeromgeving

De omgeving waarin Coniche scans, content en organisaties beheert.

## Toegang

Beheer is alleen toegankelijk met een account. Nu met e-mail en
wachtwoord; 2FA volgt zodra er een backend is. Rollen binnen beheer
(Admin, Consultant) staan in `datamodel.md` deel 2. Ze zijn nu
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

Helemaal uiterst rechts: Punt 7 van de nav-volgorderegel in CLAUDE.md,
Globale layout. Conventie: Een account-/profielmenu staat vrijwel altijd
als allerlaatste element in een nav. Volgorde in `.nav-right`, van links
naar rechts: Scherm-specifieke acties ("Applicatie"/"Assessments"/
"Organisaties" voor een Admin, alleen "Organisaties" voor een Consultant
— zie Wat beheerbaar is hieronder) → scheidingslijn → Accountmenu.

**Geen "← Terug naar site" in beheer.** Voegt niets toe en verwart met
"Uitloggen" (twee manieren om "weg te gaan" naast elkaar, onduidelijk
welke wat doet) — beheer heeft dus geen exit-actie (punt 5 van de
nav-volgorderegel), en dus ook geen scheidingslijn ervóór (punt 4):
Alleen scherm-specifieke acties, één scheidingslijn, Accountmenu.
Uitloggen is de enige manier om beheer te verlaten, via het accountmenu
hieronder. Was tot nu toe wél gespecificeerd; hierbij vervallen.

Eén dropdown-knop, zelfde patroon als de Dropdown-knop uit
`stylesheet.md` (zoals "Exporteren" op de resultatenpagina), niet twee
losse elementen naast elkaar.

- **Knop**: Toont het e-mailadres van de ingelogde gebruiker (bijv.
  "admin@coniche.nl"), met het pijltje van de dropdown-knop.
- **Dropdown-inhoud**: Eerste rij, niet-klikbaar: E-mailadres + rol
  tussen haakjes (bijv. "admin@coniche.nl (Consultant)"). Tweede rij,
  klikbaar: "Uitloggen". Functionaliteit van uitloggen blijft ongewijzigd
  ten opzichte van nu, alleen de plek en vormgeving veranderen.

### Navigatie in beheer

Beheer heeft drie niveaus: De hoofdlinks in de nav (Applicatie,
Assessments, Organisaties), daaronder de onderdelen van die link, en
daaronder de detailpagina's van één organisatie, Meting of Respondent.
Er is geen "Terug"-knop in de nav. Wel zijn er de hulpmiddelen hieronder.

- **Onderdelen binnen een hoofdlink**: Onder de nav staat een tabbalk
  met de onderdelen van de gekozen hoofdlink. Bij Organisaties zijn dat
  Organisaties, Respondenten, Ingevulde scans en Import, voor een Admin
  aangevuld met Organisatievelden. Een Consultant ziet de tab Import
  wel, maar daar staat de importfunctie niet (punt 8). De tabbalk is zichtbaar op de
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
  scans (de lijsten Respondenten en Ingevulde scans, het
  organisatie-detail en het Meting-overzicht) is de hele rij klikbaar en
  opent het overzicht (modal) van die Respondent of scan. Een rij met
  een "Bekijk" heeft die als compacte knop erbij voor wie het zoekt,
  met dezelfde werking. Een selectievakje, "Kopieer link" of een
  Meting-label in de rij opent de modal niet maar doet alleen zijn eigen
  werk. Er bestaat geen aparte detailpagina meer per scan.
- **Scan-overzicht (modal)**: Opent vanuit de lijst Ingevulde scans, het
  organisatie-detail, het Meting-overzicht en de scanregel in het
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
- **Filters in de URL**: De lijst Respondenten en de lijst Ingevulde
  scans bewaren hun filters, sortering en pagina in de adresbalk (zoals
  de audit-log, punt 12), zodat terugkeren uit een detailpagina of
  modal dezelfde lijst toont.

**Wat er gebeurt na een actie in het Respondent-overzicht**:

- Bewerken, Lead-toegang of een scan naar een andere Meting: De modal
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
Respondent-overzicht): Het resultatenscherm (CLAUDE.md, scherm 6) toont in
beheer de gewone beheer-nav met het kruimelpad Organisaties › Organisatie
› Meting › Resultaten van {Respondent}, en niet de respondentacties
"Terug naar de scan" en "Terug naar Mijn metingen". Wel de dropdown
"Exporteren". Terug gaat via het kruimelpad. Dat wordt het Meting-overzicht
en niet de Respondent-modal, want die is niet meer open.

**Organisatie-resultaten** (punt 4): Zelfde kruimelpad, eindigend op
Resultaten van de Meting.

## Status

- **Gebouwd**: Organisaties (lijst, aanmaken, detail), metingen per
  organisatie, respondenten uitnodigen, Ingevulde scans met filters, Import,
  Assessments, Content, Gebruikersbeheer (punt 9), Instellingen (punt 10),
  Audit-log (punt 12) en Data-integriteit (punt 13). De audit-log staat nog
  alleen in de browser, tot de database er is (`azure-plan.md`).
- **Nog te bouwen**: Content-pagina's (punt 11), na overleg. De spec is
  leidend.

---

## Wat beheerbaar is

Drie hoofdonderdelen, elk een link in `.nav-right`: **Applicatie**,
**Assessments**, **Organisaties**. Voor een Admin alle drie zichtbaar;
een Consultant ziet alleen **Organisaties** (bereik `eigen`) — de
andere twee gaan over dingen die voor de hele omgeving gelden, niet
over het eigen werk van één Consultant. "Overzicht" als apart
dashboardscherm vervalt: Er is geen 4e link meer, je landt direct op
een van de drie.

De nummering van de onderdelen hieronder (1 t/m 12) is ongewijzigd ten
opzichte van eerdere versies van dit document waar al naar "punt X"
verwezen wordt elders (`datamodel.md`, `CLAUDE.md`) — alleen de
indeling in drie navigatielinks hieronder is nieuw, met drie nieuwe
onderdelen (2a, 11 en 12).

| Link | Onderdelen |
|---|---|
| **Applicatie** (Admin-only) | 9. Gebruikers, 10. Instellingen, 2a. Algemene teksten, 11. Content-pagina's, 12. Audit-log, 13. Data-integriteit |
| **Assessments** (Admin-only) | 1. Assessment-types, 2. Content |
| **Organisaties** (Admin: alle, Consultant: eigen) | 3. Organisatievelden, 4. Organisaties, 5. Metingen, 6. Respondenten uitnodigen, 6a. Lead-rol toekennen, 6b. Respondenten, 7. Ingevulde scans, 8. Import (alleen voor een Admin, een Consultant ziet een melding) |

### Applicatie (Admin-only)

#### 9. Gebruikers (Admin-only)

Los beheeronderdeel met de lijst en het beheer van alle Admin- en
Consultant-accounts (`datamodel.md` deel 2, `Gebruiker`). Het hele
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
  (`datamodel.md` deel 2). Actie heet "Deactiveren", `.btn-danger` met
  bevestiging.
- **Eigenaarschap bij deactiveren van een Consultant**: Verplicht
  overzetten van diens organisaties naar een andere Consultant of Admin
  vóórdat deactiveren definitief is (per organisatie of in bulk).
  Organisaties die alleen aan hem waren **toegewezen** (niet
  aangemaakt) hoeven niet overgezet te worden: Die toewijzing vervalt
  gewoon, dat blokkeert het deactiveren niet (`datamodel.md` deel 2,
  Eigenaarschap en toegang van/tot organisaties).
- **Minimaal 1 actieve Admin verplicht**: Deactiveren van een Admin is
  geblokkeerd zolang hij de laatste actieve Admin is, met een duidelijke
  melding waarom. Geldt ook bij zelf-deactivering: Geen aparte regel
  nodig, dezelfde check geldt altijd.
- **2FA**: `tfaActief` verplicht voordat beheer toegankelijk is, via
  TOTP (authenticator-app, `datamodel.md` deel 2, 2FA: TOTP via
  authenticator-app) — geen sms of e-mail. Komt met de backend, niet in
  dit punt. Al genoteerd in `backlog.md` onder rollen/rechten/inlog.
  **Reset-actie op een andere Gebruiker**: Een Admin kan diens
  `tfaActief` terugzetten (bijv. bij een kwijtgeraakt toestel zonder
  geldige herstelcodes meer), niet bij zichzelf zolang hij de laatste
  actieve Admin is — zelfde soort regel als hierboven.

**Toegang tot dit scherm**: Alleen Admin (`gebruikers.beheren`, bereik
`alle`, Rechtenmatrix). Een Consultant ziet "Applicatie" niet in
`.nav-right`.

#### 10. Instellingen (Admin-only)

Klein, groeit later mee. Instellingen nu:

- **Sessieduur respondenten/Leads** (`sessieDuurUren`, `datamodel.md`
  deel 2, Toegang voor respondenten): Hoe lang een `ToegangsSessie`
  geldig blijft na een geslaagde verificatie, **default 4 uur**. Eén
  getal, geldt voor de hele omgeving, niet per organisatie of
  respondent.
- **Bewaartermijn ingevulde scans** (`bewaarTermijnDagen`,
  `datamodel.md` deel 2, Bewaartermijn ingevulde scans): Aantal dagen
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

#### 2a. Algemene teksten

Teksten los van een specifiek Assessment (`datamodel.md`, Algemene
teksten): `AlgemeneTekst { sleutel, waarde }`, één tekstveld per
sleutel, niet per Assessment/organisatie. Nu enkel de introtekst boven
de scanlijst op "Mijn metingen" (`mijnMetingenIntro`). Was tot nu toe
hardcoded in de code, dus dit maakt 'm voor het eerst zelf aan te
passen zonder Sander erbij te hoeven halen.

Staat onder Applicatie, niet onder Assessments (punt 2, Content): Deze
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
| `info.bewaartermijn` | Applicatie, Instellingen, formulier Bewaartermijn ingevulde scans | Zonder ingestelde bewaartermijn verschijnt hier nooit een scan: Er is geen automatische verwijdering, alleen een melding zodra jij een termijn instelt. |
| `info.importBestanden` | Import, bij "Bestanden kiezen" | Meerdere bestanden tegelijk mogen: Houd Cmd/Ctrl (of Shift voor een reeks) ingedrukt bij het selecteren, of kies direct een hele map met losse CSV's. Elk bestand mag een ander bronformaat hebben, dat wordt per bestand apart herkend. |
| `info.importRijen` | Import, bij "rijen importeren" | Rijen met een 95%+-vraagtekstmatch (niet 100%) tellen pas mee na een expliciete goedkeuring per rij, met de knop "Goedkeuren" in de tabel hierboven. |
| `info.respondentBewerken` | Respondent-overzicht, bewerkformulier | De persoonlijke link blijft ongewijzigd, ook na een nieuw e-mailadres. Een wijziging geldt voor alle scans van deze Respondent. |
| `info.algemeneTeksten` | Algemene teksten, bij het tekstveld | Staat direct onder de titel op de persoonlijke link van elke respondent/Lead. |
| `info.contentIcoon` | Content, veld Icoon | Een emoji die op de kaart van dit assessment staat, bijvoorbeeld 🩺. |
| `info.contentSlotsectie` | Content, Slotsectie voor de PDF-export | Kies de titel en de bron van de slotsectie aan het eind van de PDF uit de vaste lijst. Zonder keuze krijgt de PDF geen slotsectie. |
| `info.auditLog` | Audit-log, naast de paginatitel | Wie (of het Systeem) wat deed, wanneer en op welk record. Alleen-lezen. Geen persoonsgegevens uit scans. |
| `info.algemeneTekstenPagina` | Algemene teksten, naast de paginatitel | Teksten los van één Assessment-type. Wijzigingen zijn direct zichtbaar, geen aparte publicatiestap. |
| `info.algemeneTekstenInfoIconen` | Algemene teksten, naast de kop Info-iconen | Alle toelichtingen achter een Info-icoon, met de plek en de actuele tekst. Aanpassen kan op de plek zelf, met het potlood in het open Info-icoon. |
| `info.contentToelichting` | Content, veld Toelichting van een bouwblok | Lopende tekst in de Toelichtingsmodal bij dit bouwblok. Een lege regel scheidt de alinea's. Laat je het veld leeg, dan ontbreekt dit onderdeel in de modal. |
| `info.contentBouwblokLabel` | Content, veld Bouwblok-label | De kleine kop boven de titel in de Toelichtingsmodal, bijvoorbeeld "Bouwsteen" of "AI-domein", gevolgd door het nummer. |
| `info.conflictOplossen` | Conflict oplossen, naast de titel van de modal | Een Respondent heeft per Meting één scan. Hang één van de twee scans aan een andere Respondent. Alleen die scan gaat mee, de oorspronkelijke Respondent blijft bestaan met de andere scan. |
| `info.dataIntegriteit` | Applicatie, Data-integriteit, naast "Controleer nu" | Controleert of er, bijvoorbeeld na een verwijderactie, nog ingevulde scans zijn die naar een niet-bestaande Respondent verwijzen. |
| `info.startAssessment` | Assessment-landingspagina, achter de uitgeschakelde knop "Start assessment" | Toegang tot een assessment loopt via een persoonlijke uitnodiging. |
| `info.bulkExportOrganisatie` | Ingevulde scans, achter de uitgeschakelde knop "Exporteren" bij een selectie over meer dan één organisatie | Bulk-export kan alleen binnen één organisatie. Filter eerst op Organisatie. |
| `info.exportEenScan` | Ingevulde scans en organisatie-detail, achter de uitgeschakelde opties "Als PDF" en "Voor InDesign (XML)" | Beschikbaar bij precies één scan. |

Elk nieuw Info-icoon krijgt hier een regel en een regel in
`data/info-teksten.ts`. Een standaardtekst bevat geen verwijzing naar een
document of andere bouwerstekst.

#### 11. Content-pagina's (Visie, Bouwstenen, AI, 2030)

**Nieuw, nog niet gebouwd.** De 4 vaste content-links (CLAUDE.md,
Globale layout, punt 3 van de nav-volgorderegel) komen nu uit losse
bronbestanden en zijn nergens beheerbaar. Dit onderdeel maakt ze
bewerkbaar vanuit beheer, net als Algemene teksten hierboven:

- **Visie** (`visie-coniche.md` deel 1) en **2030**
  (`content-2030.md`): Gewone leespagina's, alleen tekst. Eén
  tekstveld per pagina, zelfde soort component als Algemene teksten.
- **Bouwstenen**: De 15 bouwstenen uit `visie-coniche.md` /
  `bouwstenenmodel-visual.md`. Titel en omschrijving per bouwsteen
  bewerkbaar. De interactieve visual zelf (indeling, volgorde,
  interactie) niet — dat blijft vast, alleen de tekstinhoud erin wordt
  beheerbaar.
- **AI**: De 8 AI-domeinen uit `visie-ai-klantcontact.md` /
  `ai-domeinenmodel-visual.md`. Titel en modal-tekst per domein
  bewerkbaar, de visual zelf niet, zelfde uitgangspunt als Bouwstenen.

**Nog open**: Het onderliggende datamodel hiervoor (records per
bouwsteen/domein, versiebeheer, of het archiveren i.p.v. verwijderen
zoals bij Content per Assessment) is nog niet uitgewerkt — dit
beschrijft alleen wélke content beheerbaar wordt, niet de
implementatie ervan. Zie Open punten onderaan dit document.

#### 12. Audit-log

**Gebouwd.** `AuditEvent` (`datamodel.md` deel 2,
Audit) wordt al gelogd: Wie (of "Systeem") wat deed, wanneer, op welk
record. Er was nergens een scherm om die logging terug te zien.
Alleen-lezen overzicht, Admin-only (net als de rest van Applicatie):

- **Kolommen**: Tijdstip, Actor, Actie (bijv. "organisatie.verwijderd",
  "respondent.uitgenodigd"), Entiteit en Details. Actor is de Gebruiker
  zoals die bij punt 9 staat (bij een Admin dus de inlognaam) of
  "Systeem". Entiteit toont het type en een herkenbare naam, bijv. de
  organisatienaam in plaats van kaal een `entiteitId`. Details staat
  leesbaar, niet als ruwe JSON, met namen van Organisatie, Assessment en
  Meting in plaats van ID's. ID's staan alleen bij uitklappen en in de
  export. Een verwijderd record toont de naam zoals die was bij het
  loggen; die naam wordt daarom bij het loggen in `details` vastgelegd.
  De knop "Meer" (`.btn-outline .btn-compact`) staat niet achter de
  detailtekst, maar in een eigen laatste kolom, rechts uitgelijnd, zodat
  hij op elke rij op dezelfde plek staat, zoals de "Bekijk"-knoppen bij
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
  zijn gedaan). Uitklappen toont per bestand of rij wat er gebeurde, met
  de reden bij overgeslagen en mislukt, en bij een geïmporteerde rij wat
  is aangemaakt (Organisatie, Respondent, Meting, scan). De groep begint
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
  staat er een melding met een knop voor het eerstvolgende grotere
  bereik. Een groep verschijnt zodra een van zijn gebeurtenissen in de
  periode valt.
- **Lijst en filters**: 50 gebeurtenissen per pagina, nieuwste eerst. De
  filters staan in de URL, zodat een gefilterd overzicht te delen is.
  Naast de periode zijn er een Actor-keuzelijst en een keuzelijst voor
  het type (het deel van de actie vóór de punt, bijv. Import,
  Organisatie, Meting, Respondent, Scan, Gebruiker), in plaats van het
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
  zichtbaar zijn (zoals de status van een Ingevulde scan, punt 7) —
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
in de Toelichtingsmodal, standaard "Bouwsteen", bij de AI-scan
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
scan (CLAUDE.md, sectie 3, Wegingskaart). De velden mogen leeg blijven:
Dan geldt de standaardtekst. Bij een Assessment zonder afwijkende
gewichten verschijnt de kaart niet, ook als de velden gevuld zijn. De
bouwblokken en hun factor onder de tekst komen uit de gewichten zelf en
hoeven niet in de tekst te staan.

Teksten die niet aan één Assessment hangen (zoals de introtekst op
"Mijn metingen"): zie 2a, Algemene teksten, onder Applicatie hierboven
— niet hier.

### Organisaties (Admin: alle, Consultant: eigen)

#### 3. Organisatievelden

De organisatievelden uit `datamodel.md` (volume en klantbasis,
digitalisering, techstack, FTE, KPI's) worden zelf ook beheerbaar: Label,
type en vaste antwoordcategorieën.

Dit punt gaat over de definitie van de velden en is Admin-only
(`content.beheren`, Rechtenmatrix). Een Consultant ziet dit onderdeel
niet in de tabbalk. De waarden van een organisatie invullen en wijzigen
(de Kenmerken in het organisatie-detail, punt 4) kan wel voor een Admin
en voor een Consultant bij zijn eigen organisaties
(`organisaties.bewerken`). Een Consultant stelt die vragen immers zelf
aan de klant, tijdens een gesprek over de inrichting en omvang, en moet
het antwoord daarom zelf kunnen vastleggen.

#### 4. Organisaties

- **Lijst**: Voor een Admin alle organisaties. Voor een Consultant
  alleen zijn **eigen** organisaties (`datamodel.md` deel 2,
  Eigenaarschap en toegang van/tot organisaties): Die hij zelf
  aanmaakte, plus die een Admin expliciet aan hem toewees. Per rij de
  naam, het aantal respondenten, het aantal afgeronde scans, en
  **"Aangemaakt door"** (de naam van de eigenaar) — altijd zichtbaar,
  voor iedereen die de organisatie ziet, ongeacht of hij eigenaar of
  toegewezen is. Puur informatief, geen filter.
- **Score en voortgang, alléén op de Consultant-lijst** (portfolio-
  overzicht, om te zien welke klant aandacht nodig heeft): Twee extra
  kolommen, niet op de Admin-lijst — een Admin beheert het systeem,
  volgt geen individuele klantrelaties op, dus is hier geen
  actiehouder.
  - **Score**: Het gemiddelde van de meest recente Meting van deze
    organisatie met minstens 1 afgeronde scan (zelfde drempel als
    Organisatie-resultaten hieronder). Geen Meting die aan die drempel
    voldoet: "-".
  - **Voortgang**: Van diezelfde meest recente Meting, "X van Y
    afgerond" (afgeronde `ScanInvulling`s van het totaal uitgenodigde).
    Is de meest recente Meting al volledig afgerond, dan blijft de
    kolom leeg — voortgang is alleen relevant zolang een Meting nog
    loopt.
- **Aanmaken**: Naam en kenmerken invullen. Zowel Admin als Consultant;
  de aanmaker wordt automatisch eigenaar (`aangemaaktDoor`).
- **Organisatie-toegang toewijzen** (Admin-only, ook weer intrekken):
  Op de organisatiedetailpagina, naast Kenmerken, één of meer
  Consultants toevoegen die deze organisatie ook mogen zien en
  beheren, bovenop de eigenaar. Zelfde soort multi-select-patroon als
  Lead-toegang beheren (punt 6a) — nu op Gebruikers in plaats van
  Respondenten. Intrekken van een toewijzing is de spiegel van
  toewijzen, geen aparte permissie. Dit scherm toont ook, los van de
  toewijs-actie zelf, wie de eigenaar is (`aangemaaktDoor`) en wie
  toegewezen is — die twee blijven zichtbaar als apart onderscheid,
  ook al vallen ze in de rechtenmatrix allebei onder hetzelfde bereik
  "eigen".
- **Detail**: Kenmerken (altijd bewerkbaar), "Aangemaakt door" (zie
  hierboven), de metingen van deze organisatie met "Bekijk" naar het
  Meting-overzicht (punt 5), en de respondenten met hun status, elk met
  alleen "Bekijk" dat het Respondent-overzicht opent (punt 6b), en de
  ingevulde scans van de organisatie (punt 7).
  **Lange lijsten**: Respondenten en ingevulde scans tonen op de detailpagina
  maximaal 5 rijen. Zijn het er meer, dan staat onder de lijst een link
  "Alle respondenten van deze organisatie →" respectievelijk "Alle
  ingevulde scans van deze organisatie →". Die opent het tabblad
  Respondenten (punt 6b) respectievelijk Ingevulde scans (punt 7) met het
  filter Organisatie al ingesteld op deze organisatie (in de URL, zoals de
  andere filters). Zijn het er 5 of minder, dan is er geen link. Er komt
  geen link naar de lijst over alle organisaties heen.
- **Data ouder dan de bewaartermijn** (`datamodel.md` deel 2,
  Bewaartermijn ingevulde scans). De twee instellingen (bewaartermijn en
  verlengtermijn) staan bij Instellingen (punt 10) en zijn Admin-only.
  De lijst en acties hieronder zijn ook voor een Consultant, zoals de
  rest van dit scherm (bereik `eigen`).
  - **Geen automatische verwijdering.** Zodra `bewaarTermijnDagen`
    verstreken is (en, bij eerder verlengen, ook `bewaarVerlengdTot`,
    `datamodel.md`), verschijnt de scan in een lijst **"Data ouder dan
    de bewaartermijn"** — over alle organisaties heen voor Admin, eigen
    organisaties voor Consultant, zelfde bereik als de rest van dit
    scherm. Per rij twee acties, voor **beide** rollen: **"Verwijderen"**
    (bestaande verwijderactie op de ingevulde scan) of **"Verlengen"**
    (zet `bewaarVerlengdTot` op het moment van de klik plus
    `verlengTermijnDagen`, dus vanaf nu en niet vanaf de oude einddatum.
    De scan verdwijnt uit de lijst tot die nieuwe datum verstreken is).
    Zonder actie blijft de scan gewoon bestaan en in de lijst staan —
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
  resultatenscherm van één scan (CLAUDE.md, schermflow punt 6:
  classificatiecirkel, radar, staafdiagram per categorie, top 3, legenda),
  alleen met de gemiddelde scores van de Meting in plaats van die van
  één respondent. De weging uit `Bouwblok.gewicht` werkt hier hetzelfde
  door: De uitkomst is het gemiddelde van de antwoorden van alle
  afgeronde scans, door dezelfde scorefunctie gewogen, wat gelijk is aan
  het gemiddelde van de scores per respondent. Zichtbaar zodra er minstens
  1 afgeronde scan is binnen de Meting, geen hoger minimum. Dezelfde
  weergave gebruikt de Lead-rol op zijn eigen pagina (`datamodel.md`
  deel 2, Rollen).

  **Nog niet gedekt**: Export (PDF/CSV/InDesign) van dit
  organisatieresultaat. De bestaande exports blijven per één scan, zie
  `export-pdf-visual-volwassenheidsscan.md`, "Export van één scan, geen
  aggregatie". Zodra dit gebouwd wordt: een Lead ziet die export alleen op
  zíjn eigen toegewezen Metingen (`respondent.leadMetingIds`), niet op elke
  Meting die hij verder kan bereiken — zie `datamodel.md` deel 2,
  Rechtenmatrix, `export.uitvoeren`, en `export-indesign.md`, "Waar dit een
  plek krijgt".
- **Acties op een Respondent** (AVG-verzoek, verplaatsen naar een andere
  organisatie, responsen naar een andere Meting, bewerken): Staan in het
  Respondent-overzicht, zie punt 6b. Het organisatie-detail toont de
  respondenten alleen als lijst met "Bekijk".

#### 5. Metingen

Vanuit de organisatie: Een meting aanmaken met een assessment-type en
een label (bijv. "Nulmeting 2026"). Een organisatie kan meerdere metingen
hebben, ook van verschillende scan-types.

**Wijzigen**: Alleen het label, achteraf aanpasbaar (bijv. een typo
corrigeren). Het assessment-type ligt vast na aanmaken — dat achteraf
wijzigen zou de al ingevulde antwoorden inconsistent maken met een
ander scan-type; voor een ander scan-type maak je een nieuwe Meting
aan.

**Meting-overzicht** (eigen pagina, bereikbaar via "Bekijk" bij een
Meting in het organisatie-detail en via het Meting-label in de lijst
Respondenten, punt 6b): Alles binnen één Meting op één plek. Een eigen
pagina en geen modal, omdat er een lijst op staat die op zijn beurt het
Respondent-overzicht opent. Een eigen adres, zodat het te openen en te
delen is binnen beheer. Zelfde bereik als de organisatie: Een Admin ziet
alle Metingen, een Consultant die van zijn eigen organisaties.

- **Kop**: Label, Assessment, de organisatie (met link terug naar het
  organisatie-detail) en voortgang ("x van y afgerond").
- **Respondenten in deze Meting**: Lijst met Naam, Status, Voortgang en
  de persoonlijke link ("Kopieer link", "Openen"), elk met "Bekijk"
  naar het Respondent-overzicht (punt 6b). Hier staat ook "Respondent
  uitnodigen" (punt 6).
- **Resultaten**: De link "Naar resultaten →" (Organisatie-resultaten,
  punt 4), zodra er minstens 1 afgeronde scan is.
- **Leads**: Welke Leads toegang hebben tot deze Meting
  (`RespondentRolMeting`, punt 6a), alleen als weergave. Beheren gebeurt
  in het Respondent-overzicht.
- **Acties**: Het label wijzigen (hierboven), responsen naar een andere
  Meting verplaatsen via selectie in de lijst (zelfde actie als punt 6b,
  "Respons naar andere Meting verplaatsen") en de Meting verwijderen (de
  bestaande verwijderfunctie, ook voor een lege import-Meting).

#### 6. Respondenten uitnodigen

Binnen een meting: E-mailadres invoeren. Bestaat dat adres al binnen de
organisatie, dan wordt dezelfde respondent hergebruikt. Er ontstaat een
ingevulde scan met status `"uitgenodigd"`. Zolang er geen mailserver is,
kopieert de beheerder de persoonlijke link van de respondent (knop
"Kopieer link") en deelt die zelf. Ernaast een knop **"Openen"**: Opent
diezelfde link direct in een nieuw tabblad, zodat de beheerder 'm meteen
zelf kan proberen zonder eerst te plakken.

**Vinkje "Ook Lead maken"**, naast het e-mailveld hierboven: Kent
meteen ook de Lead-rol toe aan deze respondent, met toegang tot precies
de Meting waarvoor wordt uitgenodigd (zie hieronder). Puur een
snelkoppeling voor het geval iemand tegelijk moet invullen én Lead moet
worden — de twee blijven onafhankelijke acties, zie hieronder. Extra
Metingen voor deze Lead erbij: via "Lead-toegang beheren" hieronder.

#### 6a. Lead-rol toekennen — los van uitnodigen voor een meting

Lead-worden (identiteit en toegang) en een vragenlijst krijgen
(uitgenodigd worden voor een Meting) zijn twee losse acties, geen
automatisme. Een Lead-rol is een `RespondentRol` op een `Respondent`
(`datamodel.md` deel 2); die respondent hoeft geen enkele
`ScanInvulling` te hebben. Een Lead ziet **niet automatisch alle
Metingen van de organisatie**: Welke Metingen hij mag zien, wordt per
Meting toegekend (`RespondentRolMeting`, `datamodel.md` deel 2), met
minstens 1 verplicht.

- **Lead toevoegen** (nieuwe actie op organisatieniveau, niet per
  Meting): Een oranje knop "+ Lead toevoegen" (`.btn-or .btn-compact`,
  zoals de andere +-knoppen, bijv. "+ Meting plannen"), geen
  tekstlink en geen uitklapbox met driehoekje. De knop staat in het
  blok Respondenten van het organisatie-detail, direct onder de lijst
  met Respondenten, links uitgelijnd. Pas na een klik op de knop klapt
  het formulier eronder open: Naam +
  e-mailadres invoeren, plus een **verplichte keuze
  van 1 of meer Metingen** van deze organisatie waar de Lead toegang
  toe krijgt. Maakt een `Respondent` met Lead-rol aan, met meteen een
  werkende persoonlijke link/toegangscode, zonder `ScanInvulling`. Net
  als bij "Respondenten uitnodigen" hierboven: de knoppen "Kopieer
  link" en "Openen" (nieuw tabblad), zodat de link direct zelf te
  testen is.
- **Lead-toegang beheren op een bestaande respondent**: Direct in het
  blok "Toegang" van het Respondent-overzicht (punt 6b), zonder tweede
  venster. Het blok heeft een selectievakje "Lead". Aanvinken klapt in
  hetzelfde blok de lijst met Metingen van deze organisatie open, elk met
  een selectievakje. Er moet minstens één Meting aan staan voordat de
  keuze kan worden opgeslagen, want zonder Meting is er geen Lead.
  Uitvinken van "Lead" trekt de rol in, na een bevestiging. Aanvinken geeft
  ook toegang als de respondent al `ScanInvullingen` heeft. Bij meer dan
  vijf Metingen scrolt de lijst. Onder het vakje staat als samenvatting
  "Geen Lead" of "Lead voor 2 Metingen". "Kopieer link" en "Openen" staan
  er zoals altijd.
- **Vinkje "Ook Lead maken" bij het uitnodigen** (punt 6 hierboven):
  Snelkoppeling die in één stap zowel de `ScanInvulling` (uitnodiging
  voor de vragenlijst) als de Lead-rol aanmaakt, met toegang tot precies
  die ene Meting.
- **Alsnog een vragenlijst sturen aan een bestaande Respondent**: Een eigen
  deel in het Respondent-overzicht (punt 6b), onder het blok "Toegang" en
  los van de Lead-rol. Het geldt voor elke Respondent, ook een gewone. Een
  keuzelijst met de Metingen van deze organisatie (of "Nieuwe Meting", zelfde
  patroon als punt 5) en daarnaast de knop "Vragenlijst sturen". Metingen
  waarin de Respondent al een `ScanInvulling` heeft, zijn niet te kiezen.
  De actie maakt de `ScanInvulling` aan zoals "Respondenten uitnodigen"
  hierboven. Is de Respondent Lead, dan geeft dezelfde stap hem ook toegang
  tot die Meting (voegt 'm toe aan `RespondentRolMeting`), zonder aparte
  tweede actie.

**Wie dit mag**: Admin en Consultant (bij de Consultant: bereik
`eigen`, zelfde als de andere respondent-acties). Niet de Lead
zelf. Zie Rechtenmatrix (`datamodel.md` deel 2,
`respondenten.leadToekennen`).

**Wat de persoonlijke link laat zien**: "Mijn metingen" (CLAUDE.md,
schermflow punt 4) toont voor een Lead altijd, naast de eigen metingen
(indien aanwezig), de resultaten van en de uitnodigen-actie voor **elke
Meting waar hij toegang toe heeft** (`RespondentRolMeting`) — niet de
hele organisatie (zie Organisatie-resultaten, punt 4 hierboven). Heeft
de Lead zelf geen enkele `ScanInvulling`, dan is de lijst met eigen
metingen leeg en staan alleen die toegewezen Metingen er — geen intake,
geen vragenlijst. Krijgt de Lead later alsnog een `ScanInvulling` (via
"Vragenlijst sturen" hierboven), dan verschijnt die gewoon als extra
item in dezelfde lijst, met de bestaande status-routing
(uitgenodigd/bezig/afgerond).

**Verificatie-blokkade opheffen**: Na 3 mislukte pogingen op een
verificatiecode raakt die geblokkeerd (`datamodel.md` deel 2, Toegang
voor respondenten). De respondent kan zelf gewoon een nieuwe code
aanvragen — dat lost de meeste gevallen vanzelf op. Blijkt dat zelf
herhaaldelijk aanvragen ook misbruikt te worden, dan kan een Admin of
Consultant (bereik `eigen`) de blokkade voor deze respondent expliciet
opheffen, actie in het Respondent-overzicht (punt 6b). Analoog aan de
2FA-reset bij Gebruikers (punt 9), maar dan aan de organisatiekant.

**Valt een eigen Meting samen met een toegewezen Meting** (de Lead is
zelf ook respondent binnen een Meting waar hij ook Lead-toegang toe
heeft — het gebruikelijke geval): **Eén kaart voor die Meting, niet
twee.** Op die kaart staan naast elkaar twee knoppen, waarvan de eerste
afhangt van de status van zijn eigen `ScanInvulling`:

- **Eigen scan, afhankelijk van de status** (de gewone knop uit de
  status-routing van "Mijn metingen", CLAUDE.md, schermflow punt 4):
  - `"uitgenodigd"`: "Start de intake".
  - `"bezig"`: "Ga verder met de scan".
  - `"afgerond"`: "Bekijk jouw resultaten" → zijn eigen `ScanInvulling`
    (zoals een gewone respondent).
- **"Bekijk de resultaten van de hele meting"** → de
  organisatie-resultaten van die Meting (het gemiddelde van alle
  afgeronde scans, zie Organisatie-resultaten hierboven).

De eigen scan blijft dus altijd bereikbaar, ook als hij nog niet is
afgerond. Alleen "Bekijk jouw resultaten" vervalt zolang de scan niet is
afgerond. Heeft de Lead voor die Meting helemaal geen eigen
`ScanInvulling` (puur toegewezen), dan staat er alleen "Bekijk de
resultaten van de hele meting", net als bij elke andere toegewezen Meting.

#### 6b. Respondenten (lijst en overzicht)

Eén lijst van alle Respondenten, met per
Respondent een overzicht (modal) waarin alle acties op die Respondent
staan. Dit vervangt de losse acties per rij in het organisatie-detail
(punt 4), dat daardoor weer over de organisatie zelf gaat.
**Zelfde bereik als de rest van dit onderdeel**: Een Admin ziet alle
Respondenten over alle organisaties heen, een Consultant alleen die van
zijn eigen organisaties (`datamodel.md` deel 2, Rechtenmatrix).

Het verschil met Ingevulde scans (punt 7): Die lijst gaat over de scan,
met resultaten en export. Deze lijst gaat over de persoon, met zijn
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
  e-mailadres. Zelfde patroon als bij Ingevulde scans (punt 7). Voor een
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
     "Geen Lead" of "Lead voor 2 Metingen". Aanvinken toont in dit blok de
     Metingen met selectievakjes, met "Opslaan" en "Annuleren" (punt 6a).
     Er is geen aparte knop "Beheren" en geen tweede venster. "Blokkade
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
  voorheen (Admin en Consultant met bereik `eigen`, niet de Lead), zie
  `datamodel.md` deel 2, Rechtenmatrix.

**Acties in het overzicht** (de regels van voorheen, nu hier):

- **AVG-verzoek verwerken** (Admin: alle organisaties, Consultant:
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
  Beide acties worden gelogd (`datamodel.md` deel 2, Audit) — dat is
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
- **Respons naar andere Meting verplaatsen** (1 oktober 2026): Hangt een
  ingevulde scan onder een andere Meting van dezelfde organisatie.
  Bedoeld voor de responsen die de import (`import-scans.md`) in een
  eigen import-Meting heeft gezet, maar bruikbaar voor elke
  ScanInvulling. Dit is een voorwaarde voor de importaanpak: De import
  maakt altijd nieuwe Metingen aan en de beheerder hangt de responsen
  daarna om.

  1. **Eén respons** (actie per ingevulde scan in het blok "Scans"
     van het overzicht, naast "Eén losse respons verplaatsen" hierboven).
  2. **Meerdere responsen tegelijk** (actie op de selectie in de
     organisatie-gefilterde lijst Ingevulde scans, punt 7). Alle
     geselecteerde scans gaan naar dezelfde doel-Meting.

  **Doel-Meting**: Kiezen uit de Metingen van dezelfde organisatie met
  hetzelfde Assessment-type als de huidige Meting, of in dezelfde stap een
  nieuwe Meting aanmaken met een label (zoals bij punt 5). Organisatie,
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
- **Respondent bewerken** (1 oktober 2026): Actie in het Respondent-overzicht
  (Admin: alle organisaties, Consultant: eigen). Bedoeld om een Respondent die de import
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
    van deze Respondent in de organisatie. Een losse respons aan een
    andere Respondent in dezelfde organisatie hangen kan nog niet
    (`backlog.md`).

#### 7. Ingevulde scans

Overzicht van alle ingevulde scans, met daarnaast een gefilterde versie
op de detailpagina van elke organisatie. Er is altijd een pad van
organisatie via meting en respondent naar de scan. **Zelfde bereik als de
rest van dit onderdeel** (zie het kopje "Organisaties" bovenaan dit
document): een Admin ziet dit overzicht over alle organisaties heen, een
Consultant alleen de scans binnen zijn eigen organisaties
(`datamodel.md` deel 2, Rechtenmatrix, `resultaten.inzien`) — geen scans
van organisaties waar hij geen eigenaar of toegewezen Consultant van is,
ook niet hier op het globale overzicht.

- **Kolommen**: Naam, Organisatie, Meting, Assessment, Rol/Team, Status,
  Voortgang, Gestart, en "Bekijk" als compacte knop. De hele rij is
  klikbaar en opent het Scan-overzicht (hieronder). Rol/Team toont alleen
  wat er is: Is de rol leeg, dan staat er alleen het team, is het team
  leeg alleen de rol, en zijn ze allebei leeg dan blijft de cel leeg.
  Nooit een los streepje of puntje. Alle kolommen sorteerbaar.
- **Filters**: Aanwezig, zoals gebouwd.
- **Scan-overzicht (modal)**: Vervangt de vroegere detailpagina per
  scan. Eén modal volgens het patroon Overzichtsmodal in `stylesheet.md`,
  met dezelfde navigatieregels als het Respondent-overzicht (Navigatie in
  beheer). Opbouw, van boven naar beneden:
  1. **Kop**: Naam van de Respondent, daaronder Organisatie, Meting en
     Assessment, en de status als badge.
  2. **Scan**: Beschrijvingslijst met Rol/Team (volgens de lege-waarderegel
     hierboven), Gestart, Afgerond (alleen bij een afgeronde scan),
     Voortgang ("60 van 60 vragen", bij een lopende scan met percentage)
     en Overall score met het niveau (alleen bij een afgeronde scan). Geen
     tegels.
  3. **Toegang**: De persoonlijke link in een alleen-lezen veld met
     "Kopieer" eraan vast en "Openen" ernaast, zoals bij het
     Respondent-overzicht. Er staat geen bouwerstekst of verwijzing naar
     een ander document in de interface.
  4. **Acties**: Compacte knoppen naast elkaar, links uitgelijnd:
     "Resultaten bekijken" (alleen bij een afgeronde scan, opent het
     resultatenscherm), "Exporteren" als dropdown-knop (zelfde opties en
     rechten als op de resultatenpagina), "Naar andere Meting" (opent een
     vervolgstap, punt 6b) en apart onderaan "Verwijderen" (rood, opent een
     vervolgstap met bevestiging). Daarnaast de knop "Bekijk
     Respondent" (opent het Respondent-overzicht). Verplaatsen
     naar een andere organisatie staat alleen in het Respondent-overzicht.
  Rechten per actie zijn gelijk aan die op deze lijst en het resultaten-
  en exportbereik uit `datamodel.md` deel 2, Rechtenmatrix.
- **Selectie**: Selectievakje per rij en "alles selecteren" in de koprij.
- **Acties op de selectie**: Exporteren en Verwijderen (compacte knoppen,
  gelijke breedte). In de organisatie-gefilterde versie komt daar "Naar
  andere Meting" bij (punt 6b, "Respons naar andere Meting verplaatsen"),
  niet op het globale overzicht, omdat de doel-Meting bij dezelfde
  organisatie hoort.
- **Export**: Eén gedeelde exportfunctie voor dit overzicht (meerdere
  scans) en de resultatenpagina (één scan), zie `export-csv.md` voor de
  exacte kolommen. **Bulk-CSV (meerdere scans in één export) alleen
  binnen één organisatie**, in verband met datavermenging, zie
  `export-csv.md`. Dat geldt op het globale overzicht en op de
  organisatie-gefilterde versie (punt 4, organisatie-detailpagina). Horen
  alle geselecteerde scans bij dezelfde organisatie, dan werkt
  "Exporteren" ook op het globale overzicht, zonder eerst te filteren.
  Bevat de selectie scans van meer dan één organisatie, dan is
  "Exporteren" uitgeschakeld, met een Info-icoon ernaast
  (`info.bulkExportOrganisatie`, register in punt 2a). Een selectie
  binnen één organisatie blijft dus toegestaan, ook als het overzicht niet
  op die organisatie is gefilterd. PDF en de InDesign-export (XML) zijn
  sowieso alleen beschikbaar bij precies één scan (hier, org-gefilterd,
  of op de resultatenpagina), zie
  `export-pdf-visual-volwassenheidsscan.md`, Export van één scan, geen
  aggregatie, en `export-indesign.md`.

Selecteren en verwijderen is een terugkerend patroon: Dezelfde component
komt ook op de lijst van organisaties, de metingen en de respondenten.

#### 8. Import van historische scans (CSV)

Eenmalige of periodieke import van ingevulde scans uit de oude,
stopgezette tool, zodat historische klantdata behouden blijft. Volledige
spec, inclusief veldmapping en matchingregels: `import-scans.md`.

**Alleen voor een Admin.** Een Consultant kan geen scans importeren. Op
de tab Import toont hij in plaats van de importfunctie een melding in
dezelfde opmaak als de melding bij een lege lijst, zoals "Nog geen
organisatie aangemaakt" (een `.admin-notice`, zie `stylesheet.md`), met de
tekst: "Vraag de beheerder om bestanden te importeren." De tekst staat
vast in de code en hoort niet in het register van Algemene teksten (punt
2a). Reden: Een Consultant ziet alleen zijn eigen Organisaties, dus hij
kan niet vaststellen of een Organisatie die een import nieuw aanmaakt al
bestaat of door hem zomaar toegevoegd mag worden. De beperking geldt ook
voor de route zelf en voor de actie "N rijen importeren": Een Consultant
die de importpagina rechtstreeks opent, krijgt dezelfde melding, en een
importverzoek van een Consultant wordt geweigerd.

Bij "Oude tool" kies je een map met losse CSV's (één bestand per scan) of
losse bestanden; een bestand mag ook scans van meerdere organisaties en
beide scantypes bevatten. Elke import maakt nieuwe Metingen aan met
"import" in het label; de beheerder hangt de responsen daarna om naar de
juiste Meting (punt 6b, "Respons naar andere Meting verplaatsen"). Elke scan
krijgt een Respondent met de gegevens uit het bestand (naam, e-mailadres,
functie, team en notitie), die de beheerder daarna kan bewerken (punt 6b,
"Respondent bewerken").

Importeren gaat met één knop, "N rijen importeren", voor de hele set. Rijen
met een waarschuwing (een 95%+-match) tellen pas mee na een expliciete
goedkeuring per rij; er is geen import per rij (`import-scans.md`,
Werkwijze in beheer, punt 6).

---

## Verwijderen

Wat er precies wordt verwijderd, staat in `datamodel.md` onder
"Verwijderen en datakoppelingen". Kort:

- **Ingevulde scan**: Alleen die invulling. De respondent en zijn link
  blijven bestaan.
- **Respondent**: De persoon met al zijn ingevulde scans.
- **Meting**: De meting met alle ingevulde scans daarin.
- **Organisatie**: Alles wat eronder hangt.

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
  navigatie ligt nu vast (Applicatie/Assessments/Organisaties, zie Wat
  beheerbaar is hierboven), maar een doorlopende flow-beschrijving per
  scherm binnen die drie onderdelen ontbreekt nog — de schermen staan
  alleen hier, per onderdeel, niet als samenhangende flow.
- Het datamodel achter onderdeel 11, Content-pagina's (Visie,
  Bouwstenen, AI, 2030): welke records, versiebeheer, archiveren i.p.v.
  verwijderen zoals bij Content per Assessment.
