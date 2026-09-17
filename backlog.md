# Coniche Scan — Backlog (na versie 1)

Items die bewust buiten scope van het prototype van vandaag zijn gehouden,
verzameld tijdens de reconstructie van de oude app. Geen prioritering, dat
volgt na de eerste doorloop van versie 1.

## Functioneel

- **AI-gegenereerde managementsamenvatting** — stond als placeholder in het
  oude PDF-rapport ("nog niet gegenereerd, genereer via knop"). Nieuw op te
  zetten, niet 1-op-1 overnemen — Joost wil dit uiteindelijk anders oplossen
  dan de oude opzet.
- **Aggregatie over meerdere respondenten per organisatie** — hoe toon je
  het resultaat als 20 mensen dezelfde scan hebben ingevuld: gemiddelde,
  afwijking t.o.v. gemiddelde, spreiding hoog/laag? Nog geen ontwerpkeuze
  gemaakt.
- **Beheerscherm voor organisatievelden, bouwblokken en vragen** — de
  onderliggende datastructuur is in CLAUDE.md al zo opgezet dat dit erboven
  gebouwd kan worden, maar het scherm zelf bestaat nog niet.
- **PDF- en CSV-export van resultaten** — knoppen stonden al in de oude
  versie, functionaliteit nog te bouwen.
- **Extra assessment-types**: Klantcontact Volwassenheid — Zorg-variant,
  AI-Volwassenheid in Klantcontact, en naar verwachting een Adoptiescan.
  De architectuur is generiek opgezet zodat dit nieuwe `Assessment`-objecten
  worden, geen nieuwe flow-logica.
- **Terugkomen bij eerdere scans via hetzelfde verificatiemechanisme** —
  een respondent moet later (buiten de actieve invulperiode) opnieuw via
  e-mail + verificatiecode bij een eerder ingevulde of nog lopende scan
  kunnen komen, niet alleen tijdens de eerste sessie. Bouwt voort op het
  verificatiemechanisme uit v1-aanpassingen.md punt 2.

## Content / ontwerpkeuzes nog te bevestigen

- Exacte cutoffs voor de classificatie rood/oranje/groen (nu een aanname:
  <2,5 / 2,5–3,49 / ≥3,5)
- Exacte huisstijl-kleurcodes per categorie
- "Rol / Functie" bij de respondent: vrije tekst of vaste lijst?

## Techniek / infrastructuur

- Echte backend en authenticatie (vandaag: localStorage + hardcoded content)
- E-mailuitnodigingen naar respondenten (vandaag: geen verstuurmechanisme)
- Persistente opslag van scan-resultaten over sessies heen
