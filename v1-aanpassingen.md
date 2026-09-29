# Coniche Scan: Aanpassingen op v1

Afwijkingen van de spec (bugs: gebouwd anders dan CLAUDE.md/datamodel.md/
stylesheet.md al zeggen) en open vragen aan Sander. Een besloten
aanpassing aan de spec zelf komt voortaan direct in het betreffende
bestand (CLAUDE.md, datamodel.md, stylesheet.md, admin-beheerpagina.md,
etc.), niet hier: Sander laadt die bestanden toch al bij elke sessie in,
dus dat is de snelste en enige-bron-van-waarheid-route. Dit bestand is
er voor de twee dingen die een spec-wijziging niet oplost.

Legenda:
- **Afwijking**: Gebouwd anders dan de spec al zegt, dus een bug ten
  opzichte van wat al is vastgelegd.
- **Vraag**: Input van Sander nodig voordat er een besluit is en het dus
  ergens in een spec kan.

## Actief

1. **[Vraag]** De Organisatie/Meting/ScanInvulling-datamodelsplitsing uit
   `datamodel.md` deel 1 is nog niet volledig doorgevoerd: Er is geen
   los `Meting`-object gebouwd. Kwam concreet naar boven bij de
   PDF-export-titel (`export-pdf-visual-volwassenheidsscan.md`), die daardoor voorlopig zonder
   `Meting.label` moet. Met Sander bespreken: Staat dit al ergens
   gepland, of is dit een gat dat pas zichtbaar wordt zodra een feature
   het nodig heeft?

## Opgelost

1. Resultatenpagina: "Terug naar scan" en export staan in `.nav-right`.
3. Toelichting per bouwblok als overlay.
4. Kleuren, fonts en logo uit `stylesheet.md` toegepast op alle schermen.
5. Nav en footer als één gedeeld component.
6. AI-samenvatting verwijderd van de scanpagina.
7. Twee knoppen op de scanpagina. "Start assessment" is uitgeschakeld
   (toegang loopt via de persoonlijke link) en blijft dat voorlopig.
8. `.btn-danger` voor verwijderen.
9. Gelijke knopbreedte binnen een actierij.
10. Ingevulde scans: Organisatie- en Meting-kolom, sorteren, filters.
11. Sidebar in de doorloopflow: Koptekst blijft staan, lijst zo lang
    mogelijk. Akkoord zoals gebouwd.
- Datamodel deel 1 (organisatie, respondent, meting, ingevulde scan),
  vastgelegd in `datamodel.md` deel 1.
- Verwijderen op Ingevulde scans gooit de invulling echt weg.

## Verwerkt in de specs (voorheen hier als losse punten)

Onderstaande stonden eerder als Aanpassing in dit bestand. Ze zijn
besloten en staan nu in de spec zelf, niet meer hier:

- **Korte, niet-herleidbare persoonlijke link** → `datamodel.md`,
  Toegangscode.
- **Nummering van de bouwstenen** → al doorgevoerd in zowel
  `visie-coniche.md` als `content-klantcontact-volwassenheid.md`,
  geverifieerd.
- **Scorekleuren in vijf stappen** → `stylesheet.md`, Scorekleuren, en
  CLAUDE.md sectie 1.
- **Geen achterblijvende data na verwijderen** → `datamodel.md`,
  Verwijderen en datakoppelingen, en `admin-beheerpagina.md`, Verwijderen.
  De testfunctie-suggestie staat in `backlog.md` onder "Voor productie".
- **Fundament-kleur: Antraciet in plaats van geel** → `stylesheet.md`,
  Categoriekleuren en Niet gebruiken.
- **"Respondenten" in plaats van "Leden"** → CLAUDE.md, Terminologie, en
  `admin-beheerpagina.md`.
- **4 content-links altijd bovenaan in `.nav-right`** → CLAUDE.md
  sectie 3, Globale layout en schermen 4/5/6.
