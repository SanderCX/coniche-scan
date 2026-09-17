# Coniche Scan — Admin-beheerpagina

Vervolgstap na v1, samen met Joost uitgewerkt. 1 rol (admin), toegang voor
Joost en Sander. Geen rechtenmodel nodig, wel het volledige beheer van
content en scans.

## Login

Simpel houden: 2 vaste accounts, geen zelfregistratie of rollenstructuur.
E-mail + wachtwoord + 2FA voor de admin-omgeving. Geldt uitdrukkelijk NIET
voor respondenten die een scan invullen, die loggen niet in (zie hieronder).

## Toegang voor respondenten

Geen login voor respondenten. Volledige mechanisme (uniek per scan-instantie
én per respondent-invulversie, plus verificatiecode-flow) staat in
v1-aanpassingen.md punt 2 — dat is al bij Sander in bouw, niet hier
dupliceren.

## Wat beheerbaar moet zijn

### 1. Assessment-types
Aanmaken/bewerken van een `Assessment` (zie CLAUDE.md sectie 1): naam,
subtitel, beschrijving, doelgroep, geschatte duur, en de globale schaal-
labels (5 stuks, instelbaar per Assessment-type — dus voor Klantcontact
Volwassenheid anders dan straks voor een AI-scan).

### 2. Content: categorieën, bouwblokken, vragen
Per Assessment: categorieën met kleur en volgorde, bouwblokken daarbinnen
(naam, omschrijving, tags — variabel aantal tags), en de vragen per
bouwblok (tekst). Dit is de contentset die nu in CLAUDE.md sectie 6
hardcoded staat voor de Klantcontact Volwassenheidsscan — dat wordt hiermee
bewerkbaar in plaats van vast in code.

### 3. Organisatievelden (VeldDefinitie's)
De veldenlijst uit CLAUDE.md sectie 2 (volume/klantbasis, digitalisering,
techstack, FTE, KPI's) wordt zelf ook beheerbaar: label, type, vaste
antwoordcategorieën waar van toepassing. Dit is een meta-laag boven de
scans zelf.

### 4. Scans aanmaken
Kies een Assessment-type, vul de organisatienaam en -kenmerken in volgens
de veldenlijst van punt 3.

### 5. Respondenten toevoegen
Per scan: e-mailadressen toevoegen, voortgang/status per respondent zien
(uitgenodigd / bezig / afgerond).

## Nog te bevestigen

- Exacte login-methode (zie aanname hierboven)
- Of bouwblokken/vragen alleen bewerkbaar zijn per Assessment-type, of ook
  herbruikbaar tussen types (bijv. een bouwblok delen tussen de
  Volwassenheidsscan en de Zorg-variant)
