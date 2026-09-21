# Coniche Scan — Backlog

Bewust nog niet opgepakt, verzameld tijdens de bouw. Geen prioritering.

## Functioneel

- **AI-gegenereerde managementsamenvatting** — stond als placeholder in het
  oude PDF-rapport ("nog niet gegenereerd, genereer via knop"). Nieuw op te
  zetten, niet 1-op-1 overnemen — dit wordt uiteindelijk anders opgelost
  dan de oude opzet.
- **Aggregatie over meerdere respondenten per organisatie** — hoe toon je
  het resultaat als 20 mensen dezelfde scan hebben ingevuld: gemiddelde,
  afwijking t.o.v. gemiddelde, spreiding hoog/laag? Nog geen ontwerpkeuze
  gemaakt.
- **PDF- en CSV-export van resultaten** — de knoppen en de `.btn-danger`/
  knopbreedte-stijl staan er, de exportfunctie zelf nog niet. Wordt de ENE
  herbruikbare functie voor zowel de resultatenpagina als bulk-export
  vanuit "Ingevulde scans" (zie `admin-beheerpagina.md` punt 6).
- **Extra assessment-types**: Zorg-variant, en naar verwachting een
  Adoptiescan. De architectuur is generiek opgezet zodat dit nieuwe
  `Assessment`-objecten worden, geen nieuwe flow-logica.
- **Terugkomen bij eerdere scans via hetzelfde verificatiemechanisme** —
  een respondent moet later (buiten de actieve invulperiode) opnieuw via
  e-mail + verificatiecode bij een eerder ingevulde of nog lopende scan
  kunnen komen, niet alleen tijdens de eerste sessie. Bouwt voort op het
  verificatiemechanisme uit v1-aanpassingen.md punt 2 (nog actief, nog
  niet gebouwd).
- **Gedeeltelijk extern invullen van organisatiekenmerken** — in de
  praktijk vult Coniche niet altijd alle organisatiekenmerken zelf in,
  soms moet een deel samen met medewerkers van de klantorganisatie
  doorlopen worden. Dat past nog niet op het huidige toegangsmodel
  (kenmerken zijn nu een Coniche-only beheerhandeling, met een apart,
  scan-gebonden toegangsmechanisme voor respondenten). Zie de
  toelichting in `admin-beheerpagina.md`, sectie "Spanning met
  CLAUDE.md".
- **Respondent moet nogmaals een scan kunnen invullen** (dezelfde of een
  andere) — vraagt een knip in het datamodel: `antwoorden`/
  `opmerkingenPerBouwblok`/`status`/`gestartOp`/`afgerondOp` staan nu
  vast op `Respondent` (CLAUDE.md sectie 1), wat uitgaat van precies 1
  invulling per respondent. Moet worden een los `ScanInvulling`-record
  (N per Respondent), zodat "een scan verwijderen" en "de respondent
  verwijderen" ook echt twee verschillende dingen kunnen zijn — zie de
  verwijderregels in `admin-beheerpagina.md`, die daar nu al rekening
  mee houden ook al bestaat de knip zelf nog niet. Nog te bepalen: of de
  respondent dit zelf triggert vanuit de scan, of dit via beheer loopt,
  en of er een bevestigingsstap nodig is.

## Content / ontwerpkeuzes nog te bevestigen

- "Rol / Functie" bij de respondent: vrije tekst of vaste lijst?

## Techniek / infrastructuur

- **E-mailuitnodigingen en verificatiemechanisme**: nog te bouwen, zie
  v1-aanpassingen.md punt 2 (nog actief, inclusief het sub-punt over de
  link-geldigheid).
- **Persistente opslag van scan-resultaten over sessies heen**: werkt
  kennelijk al (de "Ingevulde scans"-lijst toont historische, eerder
  ingevulde scans over meerdere dagen) — check of dit ook een echte
  backend/database is of nog een tussenvorm.
