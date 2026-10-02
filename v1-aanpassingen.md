# Coniche Scan: Aanpassingen op v1

Afwijkingen van de spec (bugs: gebouwd anders dan CLAUDE.md/datamodel.md/
stylesheet.md al zeggen) en open vragen aan Sander. Een besloten
aanpassing aan de spec zelf komt voortaan direct in het betreffende
bestand (CLAUDE.md, datamodel.md, stylesheet.md, beheerpagina.md,
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
2. **[Vraag, deels beantwoord]** `Organisatie.aangemaaktDoor` is een
   nieuw veld (`lib/types.ts`), nodig voor het bereik "eigen".
   Organisaties van vóór dit veld (bestaande localStorage-data, de
   demo-organisatie) hebben `aangemaaktDoor: null` gekregen: Zichtbaar
   voor Admin, niet voor een Consultant. Inmiddels gebouwd:
   "Organisatie-toegang toewijzen" (`toegewezenAan`, `beheerpagina.md`
   punt 4) geeft een Admin een manier om zo'n organisatie alsnog aan een
   Consultant te ontsluiten, zonder `aangemaaktDoor` zelf te wijzigen.
   **Nog steeds geen UI om `aangemaaktDoor` zelf over te zetten** buiten
   het gedeactiveerde-Consultant-pad (`beheerpagina.md` punt 9, dat al
   een bestaande aanmaker vereist). Met Sander bespreken: Is `toewijzen`
   hiervoor voldoende, of blijft een losse "eigenaarschap overzetten"
   nodig voor een organisatie met `aangemaaktDoor: null`?
3. **[Afwijking, content]** Zorgscan: 29 van de 60 vraagteksten zijn
   woordelijk gelijk aan het Klantcontact-template, dus niet sector-
   vertaald naar patiënt-/cliëntcontact — in tegenstelling tot wat
   `content-zorgscan.md` en `data/zorgscan-assessment.ts` beweerden ("alle
   60 zijn af"). Ontdekt bij het doorlichten van alle specs (30-9-2026),
   nog niet gecorrigeerd: Welke vragen precies, en de herschreven tekst
   zelf, vragen inhoudelijke input van Joost/Sander, niet iets om zelf
   te verzinnen. Zie `content-zorgscan.md` voor de volledige toelichting.
4. **[Vraag]** `datamodel-rbac-voorstel.md`: Een vroeg RBAC-ontwerp dat op
   vrijwel elk punt anders is uitgevallen dan wat uiteindelijk gebouwd is
   (zie de statusnotitie bovenaan dat bestand). Met Sander bespreken:
   Verwijderen, of laten staan als historisch archief?
5. **[Vraag]** Het "Toelichting"-veld in het contentbeheerscherm heeft
   voor de drie bestaande Assessment-types (Klantcontact, AI, Zorg)
   zichtbaar geen effect: De toelichting-overlay en interactieve visuals
   gebruiken altijd een losse lookup-tabel (`data/bouwstenen-content.ts`/
   `data/ai-domeinen-content.ts`), niet dit veld (zie `datamodel.md`,
   Bouwblok). Alleen bij een zelf aangemaakt bouwblok (nieuw
   Assessment-type) werkt het veld wel. Met Sander bespreken: Is dit
   acceptabel zolang het maar hier gedocumenteerd staat, of moet het
   contentbeheerscherm een waarschuwing tonen wanneer dit veld genegeerd
   wordt?

## Opgelost

- **[Afwijking, opgelost]** `datamodel.md`, Content bewerken, zei dat een
  vraag/bouwblok/categorie met bestaande antwoorden wordt gearchiveerd,
  niet verwijderd, maar er was geen `gearchiveerd`-veld: Het
  contentbeheerscherm verwijderde altijd hard. Gebouwd: `gearchiveerd?:
  boolean` op `Categorie`/`Bouwblok`/`Vraag`, "Verwijderen" in het
  contentbeheerscherm zet dit veld i.p.v. te verwijderen, met een
  "Gearchiveerd"-lijstje en een Herstellen-knop erbij. Nieuwe invullingen
  krijgen gearchiveerde content niet meer te zien (`lib/assessment-
  structuur.ts`, `actieveGroepen`/`actieveBouwblokkenMetGroep`/
  `actieveVragen`); scoring/exports op bestaande invullingen blijven de
  ongefilterde functies gebruiken, dus scores blijven behouden.
- **[Vraag, beantwoord]** `content.beheren` stond in de Rechtenmatrix
  lang als "te bevestigen" voor een Consultant. Inmiddels besloten en
  in `datamodel.md` doorgevoerd: Admin-only (`-` voor Consultant/Lead),
  want Assessment-types en Content zitten onder de link "Assessments",
  die een Consultant niet ziet. Matcht al met `lib/rechten.ts`
  (`magContentBeheren`).
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
12. **[Afwijking, hersteld]** PDF-export: De volledige opmaak en
    beschrijving per bouwsteen (eyebrow, "CENTRALE VRAAG"-blok,
    beschrijving) ontbrak in de Zorgscan-PDF, gemeld door Sander na het
    zij-aan-zij vergelijken van een echte Klantcontact- en Zorgscan-PDF
    ("mis in de zorg scan PDF de tekst van de bouwstenen ... zoals in de
    andere PDF"). Oorzaak: `toelichtingVoor` (`lib/bouwblok-info.ts`)
    koppelt die rijke content alleen aan bouwblok-id's die met `bb`
    (Klantcontact) of `ai` (AI-scan) beginnen; de Zorgscan heeft eigen
    id's (`zorg-...`), dus kreeg daar nooit een match. Een eerste, kleinere
    fix (alleen `Bouwblok.toelichting` als platte alinea tonen) loste de
    lege pagina op maar niet de ontbrekende opmaak. Definitief rechtgezet:
    `toelichtingVoor` matcht nu ook `zorg-...`-id's op `volgnummer` tegen
    dezelfde `data/bouwstenen-content.ts` als het template (zelfde
    aanpassing in `components/BouwblokForm.tsx` voor de
    toelichting-overlay in de doorloopflow) — dus identieke opmaak, met
    content die nog niet sector-vertaald is (zie het open punt bovenaan
    `content-zorgscan.md`). Gedocumenteerd in `export-pdf-visual-zorgscan.md`,
    "Bron van de tekst".
- Datamodel deel 1 (organisatie, respondent, meting, ingevulde scan),
  vastgelegd in `datamodel.md` deel 1.
- Verwijderen op Ingevulde scans gooit de invulling echt weg.
- **[Afwijking, hersteld]** `Assessment.icoon` (`datamodel.md`) liet ook
  een letterlijke emoji toe, maar het Icoon-veld in het
  contentbeheerscherm was een vaste `<select>` met alleen de bestaande
  SVG-icoonsleutels ("target", "sparkle") — een beheerder kon dus nooit
  zelf een emoji intypen. Rechtgezet: Vrij tekstveld, met een live
  preview (`AssessmentIcon`) en een toelichting dat de SVG-sleutels
  daarnaast blijven bestaan.
- De Zorgscan kreeg hierbij kort een stethoscoop-emoji ("🩺", per een
  notitie dat Joost dit koos boven een hartje-outline). Sander heeft dat
  nadien teruggedraaid naar een hartje-outline in de stijl van de andere
  twee scan-iconen (`icoon: "heart"`, `HeartIcon` in
  `components/icons/AssessmentIcons.tsx`) — zie `content-zorgscan.md`
  voor de afwijking t.o.v. die eerdere notitie.

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
  Verwijderen en datakoppelingen, en `beheerpagina.md`, Verwijderen.
  De testfunctie-suggestie staat in `backlog.md` onder "Voor productie".
- **Fundament-kleur: Antraciet in plaats van geel** → `stylesheet.md`,
  Categoriekleuren en Niet gebruiken.
- **"Respondenten" in plaats van "Leden"** → CLAUDE.md, Terminologie, en
  `beheerpagina.md`.
- **4 content-links altijd bovenaan in `.nav-right`** → CLAUDE.md
  sectie 3, Globale layout en schermen 4/5/6.
- **`export-pdf-visual-volwassenheidsscan zorg.md` condenseren en
  hernoemen** → Sander bevestigde beide: Het document is herschreven naar
  het verschillen-patroon van `export-pdf-visual-ai-scan.md` en hernoemd
  naar `export-pdf-visual-zorgscan.md` (CLAUDE.md, Bestanden).
- **Zorgscan `kortLabel` "Zorgscan" → "Volwassenheidsscan Zorg"** → De
  PDF-bestandsnaam-spec (`export-pdf-visual-zorgscan.md`) vereiste dit;
  doorgevoerd in `data/zorgscan-assessment.ts` en `content-zorgscan.md`.
