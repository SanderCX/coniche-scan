# Coniche Scan — Changelog

Bouwbeslissingen die niet uit een van de content-/specdocumenten
(CLAUDE.md, v1-aanpassingen.md, etc.) volgen, maar tijdens het bouwen
door Sander zijn genomen — meestal om een tegenstrijdigheid tussen twee
eerder aangeleverde documenten op te lossen. Nieuwste bovenaan.

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
