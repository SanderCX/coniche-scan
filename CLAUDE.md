# Coniche Scan — Projectspecificatie

Herbouw van de klantcontact-volwassenheidsscan (voorheen "Volwassenheidsmodel
Klantcontact"). Geen code hergebruikt uit de oude versie, wel de volledige
content en scoringslogica, gereconstrueerd uit screenshots en het PDF-rapport
van de oude app. Doel van vandaag: een doorloopbaar werkend prototype,
gebouwd zodat de eisen van morgen (instelbare velden, meerdere respondenten
per organisatie) er niet als losse laag overheen hoeven, maar al in het
datamodel zitten.

## Kernprincipe voor vandaag

Bouw de flow generiek over data heen, niet met hardcoded schermen per
bouwblok. Bouwblokken, vragen, schaal-labels en organisatievelden zijn data
(zie hieronder), geen componentstructuur. Dat is het verschil tussen "morgen
een beheerscherm bouwen dat deze JSON bewerkt" en "morgen alles overnieuw".

Wat vandaag WEL gebouwd wordt: de volledige doorloopflow, met de content van
de Klantcontact Volwassenheidsscan (zie `content-klantcontact-volwassenheid.md`)
als eerste en enige ingevulde assessment-type.

Wat vandaag NIET gebouwd wordt (bewust uitgesteld):
- AI-gegenereerde managementsamenvatting (placeholder in UI is prima, geen
  API-integratie)
- Beheerscherm om velden/vragen te bewerken (de JSON-structuur moet er wel
  al staan, het scherm erboven niet)
- Aggregatie van scores over meerdere respondenten (gemiddelde/spreiding
  binnen één organisatie) — nader uit te werken, nu alleen het datamodel zo
  bouwen dat het niet in de weg zit
- PDF/CSV-export (knoppen mogen aanwezig zijn, functionaliteit later)
- Echte backend/auth — voor vandaag localStorage + hardcoded content

## Rolverdeling vandaag

- Sander: richt Claude Code in, bouwt de scaffold en de flow
- Joost: content en datamodel (dit document), comms

---

## 1. Datamodel

### Assessment (scan-type)

Er is straks meer dan één scan-type (Klantcontact Volwassenheid, Zorg-variant,
AI-Volwassenheid, later een Adoptiescan). Bouw dus geen vaste lijst
bouwblokken in de flow-logica, maar een `Assessment`-object waar de intake-
en doorloopflow generiek doorheen navigeert.

```
Assessment {
  id: string
  naam: string                    // bijv. "Klantcontact Volwassenheid"
  subtitel: string                // "±30 minuten. Heldere inzichten. Direct verbeterkansen."
  beschrijving: string
  doelgroep: string                // "MT, operations en CX-verantwoordelijken..."
  icoon: string
  geschatteDuur: string             // "±30 minuten"
  categorieen: Categorie[] | null   // optioneel — zie hieronder
  bouwblokken: Bouwblok[] | null    // gebruikt i.p.v. categorieen als die ontbreken
  scoresPerGroepGesorteerd: boolean // AI-scan sorteert op waarde, Klantcontact-scan niet
  schaal: SchaalLabel[5]            // globaal per Assessment, zie sectie 3
  organisatieVelden: VeldDefinitie[] // zie sectie 2
}
```

Niet elk Assessment-type heeft een categorie-laag. De Klantcontact
Volwassenheidsscan groepeert 15 bouwblokken in 5 categorieën, de
AI-Volwassenheidsscan (zie `content-ai-scan.md`) heeft 8 domeinen plat
onder elkaar, zonder groepering — geverifieerd in de sidebar-screenshots,
die tonen één ongegroepeerde lijst. Bouw de flow dus zo dat categorieën
optioneel zijn: als `categorieen` leeg is, toont de sidebar en de
resultatenpagina de `bouwblokken` direct, zonder categorie-kop erboven.
Forceer dit niet kunstmatig door 8 categorieën met elk 1 bouwblok aan te
maken, dat is nep-structuur voor iets dat het brondata gewoon niet heeft.

### Categorie

```
Categorie {
  id: string
  naam: string                     // "Overkoepelend", "Organisatie", "Proces & Tech", "Mens", "Fundament"
  kleur: string                    // accentkleur, zie sectie 4
  volgorde: number
  bouwblokken: Bouwblok[]
}
```

### Bouwblok

```
Bouwblok {
  id: string
  volgnummer: number               // 1 t/m 15, doorlopend over alle categorieën
  naam: string
  omschrijving: string             // de vraagzin onder de titel
  tags: string[]                   // variabel aantal! Financial control heeft er maar 1, andere 5-6
  vragen: Vraag[]                  // steeds 4 in de huidige scan, maar niet hardcoded aannemen
}
```

### Vraag

```
Vraag {
  id: string
  volgnummer: number               // 1 t/m 4 binnen het bouwblok
  tekst: string
}
```

### SchaalLabel

Vaste 1–5-schaal, globaal ingesteld per Assessment (dus voor de hele
Klantcontact Volwassenheidsscan identiek over alle 60 vragen — bij een
toekomstige AI-scan of Adoptiescan mag dit een andere set zijn):

```
1: Niet aanwezig
2: Deels / incidenteel
3: Aanwezig en meestal toegepast
4: Structureel geborgd en gemeten
5: Geoptimaliseerd en continu verbeterd
```

### Organisatie (scan-instantie, aangemaakt door Coniche in beheer)

Dit is de grote wijziging ten opzichte van de oude versie: een scan wordt
aangemaakt op organisatieniveau door Coniche, met vaste kenmerken die de
respondenten niet mogen aanpassen, en respondenten worden per e-mailadres
uitgenodigd.

```
Organisatie {
  id: string
  assessmentId: string
  naam: string
  kenmerken: { [veldId: string]: waarde }   // ingevuld door Coniche, read-only voor respondenten
  respondenten: Respondent[]
}
```

`kenmerken` volgt de `organisatieVelden`-lijst van het Assessment
(instelbaar in beheer, zie sectie 2). Voor vandaag: hardcode de veldenlijst
uit sectie 2 als data, het beheerscherm erboven hoeft nog niet te bestaan.

### Respondent

```
Respondent {
  id: string
  organisatieId: string
  email: string                    // enige verplichte veld bij uitnodigen
  naam: string                     // door respondent zelf ingevuld
  rol: string
  team: string                     // optioneel
  notities: string                 // optioneel
  antwoorden: { [vraagId: string]: number }  // 1-5
  opmerkingenPerBouwblok: { [bouwblokId: string]: string }
  status: "uitgenodigd" | "bezig" | "afgerond"
  gestartOp: datetime
  afgerondOp: datetime | null
}
```

Let op: organisatienaam, sector/subsector etc. staan NIET meer in het
korte respondent-formulier (dat was de oude screenshot 4) — die liggen al
vast op het `Organisatie`-niveau voordat de respondent begint. Het
respondent-formulier bevat alleen nog: naam, rol/functie, team (optioneel),
notities (optioneel).

---

## 2. Organisatievelden (instelbaar in beheer, vandaag als vaste data)

Bron: intern rapport dat Coniche zelf samenstelt over klanten (zie
voorbeeld "4a"). Voor vandaag hardcoded als JSON-structuur, zodat er later
een beheerscherm overheen kan zonder de flow te herbouwen.

```
VeldDefinitie {
  id: string
  label: string
  type: "tekst" | "getal" | "select" | "select-met-verdeling" | "percentage" | "groep"
  opties?: string[]                // vaste antwoordcategorieën, indien van toepassing
  subvelden?: VeldDefinitie[]       // voor herhalende structuren, zie techstack hieronder
}
```

Veldengroepen uit het bronmateriaal:

**Volume en klantbasis**
- Totaal aantal klanten (getal, met B2B/B2C-verdeling als percentage)
- Totaal aantal contacten per jaar, per kanaal: Call, Voicebot, Livechat,
  Chatbot, E-mail, Whatsapp (elk een getal, "niet van toepassing" toegestaan)
- Adoptie mijnomgeving/app (percentage)

**Digitalisering**
- Percentage 2026 (getal)
- Ambitie 2030 (getal)

**Techstack** — zes herhalende structuren, elk met dezelfde twee subvelden
(leverancier, zelf/extern ondersteund):
- Contact center
- Conversational AI
- CRM
- Kennismanagement
- LLM-oplossing
- IT en deployment

Model dit dus als één herbruikbare `TechstackItem { categorie, leverancier,
ondersteuning: "zelf" | "extern" }`, niet als 12 losse velden.

**FTE**
- Klantcontact medewerkers (getal, met inhouse/BPO-verdeling)
- Klantcontact management & support (getal)
- IT DevOps medewerkers (getal, met percentage gericht op Digital)

**KPI's** — vaste set, elk een los numeriek veld: AHT, NPS, CSAT, SLA, FTR

---

## 3. Scoringslogica (herleid uit het PDF-rapport, niet los gedocumenteerd)

- **Bouwblokscore** = gemiddelde van de scores op de vragen binnen dat
  bouwblok, afgerond op 1 decimaal.
- **Categoriescore** = gemiddelde van de bouwblokscores binnen die
  categorie, afgerond op 1 decimaal.
- **Overall score** = gemiddelde van ALLE 15 bouwblokscores samen — dus
  NIET het gemiddelde van de 5 categoriescores. Geverifieerd met de
  voorbeelddata: gemiddelde van de 5 categoriescores geeft 2,5, maar het
  rapport toont 2,7, wat exact overeenkomt met het gemiddelde van alle 15
  bouwblokken. Categorieën met meer bouwblokken (Organisatie, Proces & Tech,
  Mens hebben er 4; Overkoepelend heeft er 2; Fundament heeft er 1) wegen
  dus niet gelijk mee als je via categoriegemiddelden zou rekenen — bouw dit
  bewust op bouwblok-niveau.
- **Afronding**: standaard "half-away-from-zero" (zoals JS `toFixed(1)`),
  zichtbaar aan 1,25 → 1,3 in de voorbeelddata.
- **Voortgang** = aantal beantwoorde vragen / totaal aantal vragen in de
  hele scan (dus op vraagniveau, niet op bouwblokniveau — geverifieerd: na
  bouwblok 1 stond de voortgang op 7% = 4/60, na 1 vraag in bouwblok 2 op
  8% = 5/60).
- **Bouwblok-status in sidebar**: drie staten — nog niet begonnen (grijs
  nummer), bezig (gevuld cirkeltje + "x/4" naast de titel), afgerond (groen
  vinkje).

### Classificatie (Basis op Orde / Uitbouwen / Sterk punt)

Legenda uit het resultatenscherm:
- Rood — "Basis op Orde": "De basis moet op dit punt eerst op orde gemaakt
  worden om verder te kunnen uitbouwen."
- Oranje — "Uitbouwen": "De basis is op orde en je bent onderweg, maar er
  is nog een verbeterstap nodig om richting excellent te gaan."
- Groen — "Sterk punt": "Hier is de organisatie al heel goed in. Benut dit
  optimaal en bouw het verder uit, ook ter ondersteuning van zwakkere
  bouwblokken."

**Bevestigde grens: < 2,5 rood, 2,5–3,49 oranje, ≥ 3,5 groen.**

Bevestigd met een tweede, volledig gescheiden dataset (de AI-Volwassenheids-
scan). Twee losse datasets binnen die scan komen allebei uit op dezelfde
grens: het voorbeeldscherm (3,8/3,6/3,4/3,2/3,0/2,8/2,6/2,4 — precies 2
groen, 5 oranje, 1 rood) én het echte resultatenscherm
(5,0/4,0/3,4/3,2/2,8/2,4/1,8/1,8 — 2 groen, 3 oranje, 3 rood). Niet langer
een aanname.

### Top 3 Sterktes / Top 3 Verbeterkansen

Simpelweg de 15 bouwblokken gesorteerd op score: hoogste 3 = Sterktes,
laagste 3 = Verbeterkansen.

---

## 4. Kleuren per categorie

Bevestigd over alle 15 bouwblokken in de interactieve doorloopflow (de
PDF-export gebruikt overigens overal oranje, ongeacht categorie — dat is
bewust anders, geen fout):

- Overkoepelend: oranje
- Organisatie: blauw
- Proces & Tech: paars
- Mens: groen
- Fundament: geel/goud

Exacte hex-waarden nog niet bevestigd — gebruik voorlopig standaard
Tailwind-tinten (orange-500, blue-500, purple-500, green-500, amber-500)
totdat de huisstijlkleuren van Coniche.nl bekend zijn.

---

## 5. Schermflow

1. **Kies jouw assessment** — landingspagina met kaarten per Assessment-type
   (voor vandaag: alleen Klantcontact Volwassenheid ingevuld, de kaarten-
   component moet wel generiek over `Assessment[]` heen werken)
2. **Assessment-landingspagina** — titel, hero, 3 feature-cards, "Praktische
   informatie"-blok met 4 punten (invultijd, direct resultaat, AI-samenvatting
   [placeholder], privacy)
3. **Voorbeeld-output preview** — dezelfde resultaatcomponenten als scherm 6,
   gevuld met vaste demo-data (`isPreview: true` of een aparte mock-dataset,
   zodat de resultaatcomponent maar één keer gebouwd hoeft te worden)
4. **Respondent-intake** — alleen naam, rol/functie, team (optioneel),
   notities (optioneel). Organisatiekenmerken liggen al vast op
   Organisatie-niveau, dus GEEN organisatienaam/sector/subsector-velden meer
   in dit scherm.
5. **Doorloopflow** — vaste sidebar (Coniche-logo, naam respondent,
   voortgangspercentage, 5 categorieën met genummerde bouwblokken, actieve
   bouwblok gemarkeerd, 3 statussen per bouwblok). Hoofdscherm per bouwblok:
   gekleurde kop met titel + omschrijving, tags, grijze instructieregel
   ("Beantwoord op basis van wat aantoonbaar geregeld is (documenten,
   ritmes, tooling, afspraken)."), 4 vragen met 5-punts radiobuttons, één
   opmerkingenveld onderaan (per bouwblok, niet per vraag). Knoptekst
   wisselt op het allerlaatste bouwblok van "Volgende" naar "Bekijk
   resultaten".
6. **Resultatenscherm** — overall score (groot getal + classificatie-cirkel
   + voortgang "60 van 60 vragen"), radar chart (alle 15 bouwblokken),
   staafdiagram per categorie (5 balken, kleur = classificatie niet
   categoriekleur), Top 3 Sterktes / Top 3 Verbeterkansen, legenda-blok met
   de 3 classificaties, export-knoppen (PDF/CSV — stub voor vandaag)

---

## 6. Content per scan-type

De volledige vragenlijst per Assessment-type staat NIET meer in dit
document, maar in een los contentbestand per scan-type, zodat dit
architectuurdocument stabiel blijft terwijl de content per scan-type
groeit of wijzigt:

- **Klantcontact Volwassenheid** → `content-klantcontact-volwassenheid.md`
  (15 bouwblokken, 5 categorieën, 60 vragen)
- **AI-Volwassenheid in Klantcontact** → `content-ai-scan.md` (8 domeinen,
  geen categorie-laag, 40 vragen — zie ook de structuurverschillen
  bovenaan dat bestand)
- **Zorg-variant, Adoptiescan** → nog niet gestart

Elk contentbestand volgt dezelfde structuur: per categorie de bouwblokken
met naam, omschrijvingszin, tags (variabel aantal) en de vragen, op de
globale schaal die bij dat Assessment-type hoort (sectie 3).

---

## 7. Open punten / aannames om later te verifiëren

- Exacte hex-kleurcodes per categorie
- Hoe de aggregatie van meerdere respondenten per organisatie wordt getoond
  (gemiddelde, afwijking t.o.v. gemiddelde, spreiding hoog/laag) — bewust
  nog niet uitgewerkt
- Of "Rol / Functie" bij de respondent een vrij tekstveld blijft of een
  vaste lijst wordt
