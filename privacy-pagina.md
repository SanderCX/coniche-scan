# Coniche Scan: Privacypagina

**Status: Voorstel, structuur en feiten staan, juridische formulering
nog niet getoetst.** Losstaand van de andere specs, nog niets van
overgenomen.

De oude app had een privacypagina op `/privacy`, maar de inhoud is niet
op te halen (client-rendered, geen tekst in de bron). Deze spec bouwt
de pagina daarom opnieuw op, vanuit wat de nieuwe app daadwerkelijk doet
volgens `datamodel.md`, niet als kopie van de oude tekst.

## Plek in de app

- **Footer**: Link "Privacy" op elk scherm, als enige link in de footer
  (zie `stylesheet.md`, Componenten, Footer).
- **Route**: `/privacy`, publiek toegankelijk, geen inlog nodig.
- **Ook te koppelen** vanaf het toestemmingsvakje op de respondent-
  intake (CLAUDE.md scherm 4: "Ik geef toestemming om mijn antwoorden
  ... te delen met Coniche"), als link binnen die tekst.

## Vormgeving

Gewone contentpagina binnen de gedeelde nav en footer. Geen apart
sjabloon nodig: Kopregels, alinea's, een enkele lijst. Past in de
bestaande `.container`-breedte uit `stylesheet.md`.

## Inhoud, per sectie

Wat hieronder staat is feitelijk (wat de app doet, uit `datamodel.md`).
De juridische kwalificaties (grondslag, bewaartermijn, rechten van
betrokkenen) staan er als placeholder, niet als getoetste tekst.

### 1. Wie is verantwoordelijk

Coniche, met contactgegevens. Placeholder: Statutaire naam, adres,
KvK-nummer, contact-e-mailadres voor privacyvragen.

### 2. Welke gegevens de app verzamelt

Onderscheid tussen de twee kanten uit `datamodel.md`, want dat bepaalt
ook de grondslag:

**Van respondenten** (medewerkers van de klantorganisatie die een scan
invullen):
- E-mailadres (bij uitnodigen)
- Naam, functie, team, notities (bij de intake, optioneel)
- Antwoorden op de scanvragen (1-5) en opmerkingen per bouwblok
- Technische gegevens die nodig zijn om de link te laten werken (de
  toegangscode zelf, zie `datamodel.md`, Toegangscode)

**Van de organisatie** (ingevuld door Coniche, niet door respondenten):
Organisatiekenmerken zoals klantvolumes, kanaalgebruik, techstack en
KPI's (`datamodel.md`, Organisatievelden).

**Van beheerders** (Coniche-medewerkers): E-mailadres en naam voor het
beheeraccount.

### 3. Waarvoor de gegevens worden gebruikt

- De scan zelf laten werken (toegang via de link, tonen van resultaten).
- Resultaten en advies terugkoppelen aan de organisatie.
- Intern bij Coniche: Analyse en advies aan de klant.

Expliciet niet: Individuele antwoorden herleiden naar een persoon
buiten het doel van de scan, of gebruiken voor iets anders dan waarvoor
de organisatie de scan heeft laten uitzetten.

### 4. Toestemming

Verwijst naar het toestemmingsvakje op scherm 4: "Ik geef toestemming
om mijn antwoorden (en eventueel ingevulde contactgegevens) te delen
met Coniche voor analyse en advies." Die tekst en deze pagina moeten
inhoudelijk hetzelfde blijven zeggen.

### 5. Bewaartermijn

Placeholder, hangt samen met het backlogpunt "Data-ouderdom" in
`backlog.md`: Een melding bij te oude data, met de mogelijkheid te
verifiëren of te verwijderen. Zodra dat gebouwd is, kan deze sectie de
concrete termijn noemen.

### 6. Wie de gegevens kan zien

- Respondenten: Alleen hun eigen scan-invulling(en).
- Coniche-beheerders: Organisaties en respondenten die zij zelf
  beheren, of, met de rol Admin, alles (`datamodel.md` deel 2).
- Een Lead (zodra gebouwd): Resultaten van de eigen organisatie
  (`datamodel.md` deel 2).
- Geen derden, behalve waar dat nodig is voor de techniek zelf
  (hosting, e-mailverzending).

### 7. Beveiliging

- Toegang voor respondenten via een niet-herleidbare link, geen
  wachtwoord (`datamodel.md`, Toegangscode).
- Beheertoegang met wachtwoord, 2FA volgt met de backend.
- Placeholder: Waar de data wordt gehost (met de Neon-database uit
  `backlog.md`), en of dat binnen de EU is.

### 8. Rechten van betrokkenen

Placeholder, standaard AVG-rechten (inzage, correctie, verwijdering).
Praktisch aandachtspunt: Voor respondenten zonder account moet
duidelijk zijn hoe zij zo'n verzoek indienen, aangezien er geen login
is om zelf iets aan te passen. Voorstel: Via de contactpersoon bij hun
eigen organisatie, of rechtstreeks bij Coniche.

### 9. Cookies en tracking

Placeholder. Nog na te gaan of de app zelf analytics of cookies
gebruikt buiten wat technisch noodzakelijk is voor de sessie.

## Open punten

- Juridische toetsing van bovenstaande, met name sectie 5, 7 en 8.
- Verwerkersovereenkomst nodig tussen Coniche en de klantorganisatie,
  gezien Coniche in deze opzet de gegevens verwerkt namens de klant.
  Losstaand van deze pagina, wel eraan gerelateerd.
- Exacte bewaartermijn (het getal, niet het mechanisme): Het mechanisme
  staat vast (`datamodel.md` deel 2, Bewaartermijn ingevulde scans;
  `beheerpagina.md`, punt 4), de waarde van `bewaarTermijnDagen` zelf
  nog niet.
