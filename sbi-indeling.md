# Coniche Scan: SBI-indeling (Sector/Subsector)

**Status: Vastgelegd domein.** De vaste `opties`-lijst voor
`Organisatie.kenmerken`, velden Sector en Subsector (`datamodel.md`,
Organisatievelden). Overgenomen uit de officiële SBI2025-structuur
(CBS/Kamer van Koophandel, Nederlandstalige versie 2026), **alleen de
bovenste twee niveaus**: Secties (hoofdindeling, de letters) en
Afdelingen (subindeling, de tweecijferige codes). Groepen, klassen en
subklassen (drie cijfers en verder) worden bewust genegeerd: Te
gedetailleerd voor wat Coniche van een organisatie wil vastleggen.

Sector (`VeldDefinitie` Sector) gebruikt de Secties; Subsector
(`VeldDefinitie` Subsector) gebruikt de Afdelingen, **cascaderend op de
gekozen Sector** (zie `datamodel.md`, "select-afhankelijk"): Subsector
toont alleen de Afdelingen die onder de gekozen Sectie vallen, en staat
uitgeschakeld ("Kies eerst Sector") zolang er nog geen Sector gekozen
is. Wijzigt de Sector achteraf, dan wordt een al gekozen Subsector
gewist: Die hoorde bij de vorige Sectie en is dus niet meer geldig.

**Afwijking van een eerdere versie van deze spec**: Die koos bewust
géén cascading-select, met als argument dat het altijd nog kon met
`subvelden` als de praktijk erom vroeg. Die praktijkbehoefte bleek er
al bij de eerste keer bouwen te zijn: 87 Afdelingen in één platte lijst
is onwerkbaar. De koppeling tussen Sectie en Afdeling volgt uit de
tweecijferige Afdelingscode, via een vaste rangeindeling (zie hieronder
bij elke Sectie de bijbehorende codes), niet uit een aparte
"Groep"-laag: Die is hier bewust nog steeds genegeerd (zie "Wat bewust
genegeerd is").

## Sector (Secties)

| Code | Titel | Afdelingen |
|---|---|---|
| A | Landbouw, bosbouw en visserij | 01-03 |
| B | Winning van delfstoffen | 05-09 |
| C | Industrie | 10-33 |
| D | Productie en distributie van en handel in elektriciteit, gas, stoom en gekoelde lucht | 35 |
| E | Winning en distributie van water; afval- en afvalwaterbeheer en sanering | 36-39 |
| F | Bouwnijverheid | 41-43 |
| G | Groot- en detailhandel | 46-47 |
| H | Vervoer en opslag | 49-53 |
| I | Logies-, maaltijd- en drankverstrekking | 55-56 |
| J | Activiteiten van uitgeverijen, omroepactiviteiten, en activiteiten op het gebied van productie en distributie van inhoud | 58-60 |
| K | Telecommunicatie, computerprogrammering en consultancy, informatica-infrastructuur en overige activiteiten op het gebied van informatiediensten | 61-63 |
| L | Activiteiten op het gebied van financiële dienstverlening en verzekeringen | 64-66 |
| M | Exploitatie van en handel in onroerend goed | 68 |
| N | Wetenschappelijke en technische activiteiten en specialistische zakelijke dienstverlening | 69-75 |
| O | Verhuur van roerende goederen en overige zakelijke dienstverlening | 77-82 |
| P | Openbaar bestuur, overheidsdiensten en verplichte sociale verzekeringen | 84 |
| Q | Onderwijs | 85 |
| R | Gezondheids- en welzijnszorg | 86-88 |
| S | Kunst, cultuur, sport en recreatie | 90-93 |
| T | Overige dienstverlening | 94-96 |
| U | Activiteiten van huishoudens als werkgever en niet-gedifferentieerde productie van goederen en diensten door huishoudens voor eigen gebruik | 97-98 |
| V | Activiteiten van extraterritoriale organisaties en instanties | 99 |

## Subsector (Afdelingen)

| Code | Titel |
|---|---|
| 01 | Landbouw, jacht en dienstverlening voor de landbouw en jacht |
| 02 | Bosbouw, exploitatie van bossen en dienstverlening voor de bosbouw |
| 03 | Visserij en aquacultuur |
| 05 | Winning van steenkool en bruinkool |
| 06 | Winning van aardolie en aardgas |
| 07 | Winning van metaalertsen |
| 08 | Overige winning van delfstoffen |
| 09 | Dienstverlening voor de winning van delfstoffen |
| 10 | Vervaardiging van voedingsmiddelen |
| 11 | Vervaardiging van dranken |
| 12 | Vervaardiging van tabaksproducten |
| 13 | Vervaardiging van textiel |
| 14 | Vervaardiging van kleding |
| 15 | Vervaardiging van leer, lederwaren en soortgelijke producten van andere materialen |
| 16 | Houtindustrie en vervaardiging van artikelen van hout en kurk, met uitzondering van meubelen; vervaardiging van artikelen van riet en van vlechtwerk |
| 17 | Vervaardiging van papier en papierwaren |
| 18 | Activiteiten op het gebied van drukwerk en reproductie van opgenomen media |
| 19 | Vervaardiging van cokes en van geraffineerde aardolieproducten |
| 20 | Vervaardiging van chemicaliën en chemische producten |
| 21 | Vervaardiging van farmaceutische grondstoffen en producten |
| 22 | Vervaardiging van producten van rubber of kunststof |
| 23 | Vervaardiging van overige niet-metaalhoudende minerale producten |
| 24 | Vervaardiging van basismetalen |
| 25 | Vervaardiging van producten van metaal, met uitzondering van machines en apparatuur |
| 26 | Vervaardiging van computers en van elektronische en optische apparatuur |
| 27 | Vervaardiging van elektrische apparatuur |
| 28 | Vervaardiging van machines en apparaten, n.e.g. |
| 29 | Vervaardiging van motorvoertuigen, aanhangwagens en opleggers |
| 30 | Vervaardiging van overige vervoermiddelen |
| 31 | Vervaardiging van meubelen |
| 32 | Vervaardiging van overige goederen |
| 33 | Reparatie, onderhoud en installatie van machines en apparaten |
| 35 | Productie en distributie van en handel in elektriciteit, gas, stoom en gekoelde lucht |
| 36 | Winning, behandeling en distributie van water |
| 37 | Afvalwaterinzameling en -behandeling |
| 38 | Afvalinzameling, voorbereiding tot recycling, en verwijdering |
| 39 | Sanering en overig afvalbeheer |
| 41 | Burgerlijke en utiliteitsbouw |
| 42 | Grond-, water- en wegenbouw |
| 43 | Gespecialiseerde werkzaamheden in de bouw |
| 46 | Groothandel |
| 47 | Detailhandel |
| 49 | Vervoer over land en via pijpleidingen |
| 50 | Vervoer over water |
| 51 | Luchtvaart |
| 52 | Opslag en dienstverlening voor vervoer |
| 53 | Post- en koeriersdiensten |
| 55 | Logiesverstrekking en -bemiddeling |
| 56 | Exploitatie van eet- en drinkgelegenheden |
| 58 | Activiteiten van uitgeverijen |
| 59 | Productie en distributie van films en video- en televisieprogramma's en audio, maken van geluidsopnamen en uitgeven van muziekopnamen |
| 60 | Programmering, uitzending, perssagentschappen en overige activiteiten op het gebied van de verspreiding van inhoud |
| 61 | Telecommunicatie |
| 62 | Computerprogrammering, consultancy en aanverwante activiteiten |
| 63 | Dienstverlenende activiteiten op het gebied van informatie |
| 64 | Financiële dienstverlening, met uitzondering van verzekeringen en pensioenfondsen |
| 65 | Activiteiten op het gebied van verzekeringen en pensioenfondsen, met uitzondering van verplichte sociale verzekeringen |
| 66 | Ondersteunende activiteiten voor financiële diensten, verzekeringen en pensioenen |
| 68 | Exploitatie van en handel in onroerend goed |
| 69 | Rechtskundige en boekhoudkundige dienstverlening |
| 70 | Activiteiten van hoofdkantoren, interne concerndiensten en managementadvisering |
| 71 | Activiteiten van architecten en ingenieurs; technisch ontwerp en advies, keuring en controle |
| 72 | Wetenschappelijk onderzoek en ontwikkeling |
| 73 | Reclameactiviteiten, marktonderzoek en public relations |
| 74 | Overige wetenschappelijke en technische activiteiten en overige specialistische zakelijke dienstverlening |
| 75 | Veterinaire dienstverlening |
| 77 | Verhuur en lease |
| 78 | Arbeidsbemiddeling, activiteiten van uitzendbureaus en personeelsbeheer |
| 79 | Activiteiten van reisbureaus, reisorganisatoren, reserveringsbureaus en aanverwante activiteiten |
| 80 | Opsporings- en beveiligingsdiensten |
| 81 | Diensten in verband met gebouwen; landschapsverzorging |
| 82 | Administratieve en ondersteunende activiteiten ten behoeve van kantoren en overige zakelijke dienstverlening |
| 84 | Openbaar bestuur, overheidsdiensten en verplichte sociale verzekeringen |
| 85 | Onderwijs |
| 86 | Gezondheidszorg |
| 87 | Verpleging, verzorging en begeleiding met verblijf |
| 88 | Maatschappelijke dienstverlening zonder verblijf |
| 90 | Activiteiten op het gebied van scheppende en uitvoerende kunst |
| 91 | Activiteiten van bibliotheken, archieven, musea en overige culturele activiteiten |
| 92 | Exploitatie van loterijen, kansspelen en kansspelautomaten |
| 93 | Sport, ontspanning en recreatie |
| 94 | Activiteiten van ledenorganisaties |
| 95 | Reparatie en onderhoud van computers, consumentenartikelen, auto's en motorfietsen |
| 96 | Persoonlijke dienstverlening |
| 97 | Activiteiten van huishoudens als werkgever van huishoudelijk personeel |
| 98 | Niet-gedifferentieerde productie van goederen en diensten door particuliere huishoudens voor eigen gebruik |
| 99 | Activiteiten van extraterritoriale organisaties en instanties |

## Wat bewust genegeerd is

Groepen (3 cijfers), klassen (4 cijfers) en subklassen (5 cijfers) uit
de volledige SBI2025-structuur, op uitdrukkelijk verzoek. Komt er later
toch behoefte aan een fijnere indeling, dan is dat een uitbreiding van
deze twee lijsten, geen andere aanpak.

## Vertaling van de importdata

De twee geïmporteerde exports (`import-legacy-scans.md`) gebruikten
zelf een verkorte, eigen formulering, geen letterlijke SBI-tekst:
`sector_name` "Financiële dienstverlening" en `subsector_name`
"Verzekeringen en pensioenfondsen". Dit komt inhoudelijk overeen met
Sectie **L** en Afdeling **65** hierboven; bij het importeren van deze
twee scans wordt dus naar de officiële SBI-titel gemapt, niet de oude
tekst letterlijk overgenomen.
