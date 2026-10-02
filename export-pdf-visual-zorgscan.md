# Coniche Scan: PDF Zorgscan, visuele opbouw

**Status: Gebouwd (as-built).** Beschrijft hoe de PDF van één ingevulde
Zorgscan eruitziet. De gedeelde regels (bron van de content,
slotsectie-schema, bulk-export, techniek, gedeelde elementen als
papier/marges/hero/footer) staan in
`export-pdf-visual-volwassenheidsscan.md`, dat document is leidend voor
alle scan-types; dit document beschrijft alleen wat voor de Zorgscan
anders is.

**Voorbeeld**: 10 pagina's (A4), bestandsnaam `<Organisatie>
Volwassenheidsscan Zorg Report.pdf` (volgt uit
`Assessment.kortLabel: "Volwassenheidsscan Zorg"`). Footer rechts:
`Assessment.kortLabel` ("Volwassenheidsscan Zorg") met het logo.

## Pagina's

**Identiek aan `export-pdf-visual-volwassenheidsscan.md`.** De Zorgscan
is een sector-variant van de Klantcontact Volwassenheidsscan
(`datamodel.md`, Sector-varianten): zelfde 15 bouwblokken, 5 categorieën
en volgorde, dus ook dezelfde paginaverdeling (1 resultatenpagina, 4
bouwsteenpagina's met 2 per pagina, 1 slotsectiepagina). Alleen de
vraagteksten wijken af (`content-zorgscan.md`), en die passen zonder
verdere aanpassing in dezelfde lay-out.

## Slotsectie

`{titel: "Visie", bron: "visie-coniche.md-deel1"}` — zelfde bron en
pagina-opbouw als de Klantcontact Volwassenheidsscan (pagina 10 in
`export-pdf-visual-volwassenheidsscan.md`), niet de 2030-variant van de
AI-scan.

## Bron van de tekst

Zelfde bestanden als de webpagina's, op één na: `data/zorgscan-assessment.ts`
in plaats van `data/klantcontact-assessment.ts` voor de vragen, schaal en
de scan-brede PDF-instellingen.

**Uitleg per bouwblok, met een kanttekening**: De rijke bouwsteen-content
(eyebrow, categoriekleur, "CENTRALE VRAAG"-blok, beschrijving) wordt voor
de Zorgscan hergebruikt van het template, gematcht op `volgnummer` — dus
**dezelfde** content voor beide scan-types, niet een eigen zorg-versie.
Reden: De Zorgscan heeft exact dezelfde 15 bouwblokken/nummering als het
template (`datamodel.md`, Sector-varianten), en die content is nog niet
sector-vertaald (zie het open punt bovenaan `content-zorgscan.md`). Zodra
Joost een zorg-versie van deze content aanlevert, vervangt die dit
hergebruik en spreekt deze paragraaf zichzelf tegen (dan is dit stuk
verouderd).

## Let op bij aanpassingen

Zelfde aandachtspunten als `export-pdf-visual-volwassenheidsscan.md`:
Controleer na een contentwijziging het aantal pagina's (10) en dat elk
bouwblokpaar op één pagina blijft staan.
