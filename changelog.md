# Coniche Scan — Changelog

Bouwbeslissingen die niet uit een van de content-/specdocumenten
(CLAUDE.md, v1-aanpassingen.md, etc.) volgen, maar tijdens het bouwen
door Sander zijn genomen — meestal om een tegenstrijdigheid tussen twee
eerder aangeleverde documenten op te lossen. Nieuwste bovenaan.

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
admin-beheerpagina.md ("Login": e-mail + wachtwoord + 2FA, hier nog een
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
echte e-mail+wachtwoord+2FA-inlog uit admin-beheerpagina.md — die blijft
de standaard zodra test-modus uitstaat.

## 2026-09-21 — Rebuild op de aangeleverde `tokens.css`/`components.css`/`admin.css`/`charts.css`

**Aanleiding**: Joost leverde een volledig statisch HTML/CSS/JS-ontwerp
aan (`index.html`, `designer-preview-homepage.html`, `css/`, `js/`,
`assets/`) dat stylesheet.md nu expliciet als de letterlijke, leidende
CSS-bron aanwijst ("Sander neemt deze bestanden letterlijk over, niet
herschrijven"). Tegelijk een grote update van CLAUDE.md,
admin-beheerpagina.md en v1-aanpassingen.md.

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
  admin-beheerpagina.md `gestartOp` bij een reset laten wissen terwijl de
  uitnodigingsdatum moet blijven staan, en dat kon niet allebei op
  hetzelfde veld.
- Admin herbouwd naar de 3-schermen-plus-tabel-structuur uit
  admin-beheerpagina.md: `/beheer/organisaties` (lijst, was voorheen
  `/beheer/scans`), `/beheer/organisaties/nieuw`, `/beheer/organisaties/
  [id]` (detail, was voorheen `/beheer/scans/[organisatieId]`), en
  `/beheer/scans` is nu de platte "Ingevulde scans"-tabel over alle
  organisaties heen (Organisatie-kolom, sorteerbare kolommen,
  bulk-selectie/verwijderen, exportknop als stub) met een aparte
  scandetailpagina op `/beheer/scans/[respondentId]`. De admin-navigatie
  is vervangen door de gedeelde publieke nav/footer met "Beheer"-badge en
  admin-links (was een losse linker-sidebar) — zie stylesheet.md/
  admin-beheerpagina.md "Admin hergebruikt de publieke nav/footer".
- Verwijder-cascades geïmplementeerd volgens admin-beheerpagina.md:
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
