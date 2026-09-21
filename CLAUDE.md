# Coniche Scan — Projectspecificatie

Herbouw van de klantcontact-volwassenheidsscan (voorheen "Volwassenheidsmodel
Klantcontact"). Dit is de doorlopende specificatie van de Coniche Scan-app:
architectuur, datamodel en scoringslogica staan hier, en groeien mee
terwijl er iteratief functionaliteit en nieuwe scans (assessment-types)
bijkomen. Content per scan-type staat in losse bestanden (sectie 6),
lopende aanpassingen en terugkoppeling naar de bouwer in
v1-aanpassingen.md, wat bewust nog niet is opgepakt in BACKLOG.md. Waar
dit document ambigu of onvolledig is, wordt dat hier opgelost, niet
losgelaten.

## Kernprincipe

Bouw de flow generiek over data heen, niet met hardcoded schermen per
bouwblok. Bouwblokken, vragen, schaal-labels en organisatievelden zijn data
(zie hieronder), geen componentstructuur. Dat is het verschil tussen "een
beheerscherm bouwen dat deze JSON bewerkt" en "alles overnieuw bouwen"
zodra er een nieuw scan-type of veld bijkomt.

De doorloopflow is gebouwd, met de content van zowel de Klantcontact
Volwassenheidsscan als de AI-Volwassenheidsscan (zie sectie 6) al
ingevuld. Actuele status van wat er wel/niet al staat:
- **In ontwikkeling**: het beheerscherm (zie `admin-beheerpagina.md` —
  Organisaties-overzicht en Ingevulde-scans-overzicht bestaan al,
  content-beheer en organisatievelden-beheer nog niet)
- **Nog te bouwen**: het verificatiemechanisme voor respondent-toegang
  (zie v1-aanpassingen.md punt 2, nog actief) — geen los wachtwoord of
  account is wel het uitgangspunt, maar de flow zelf staat er nog niet
- **Nog bewust uitgesteld**: AI-gegenereerde managementsamenvatting
  (placeholder in UI, geen API-integratie), aggregatie van scores over
  meerdere respondenten binnen één organisatie (nader uit te werken),
  PDF/CSV-export als werkende functie (knoppen staan er, zie
  admin-beheerpagina.md punt 6 voor de aanpak)

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
onder elkaar, zonder groepering. Bouw de flow dus zo dat categorieën
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
  toelichting: string              // langere uitleg, zie overlay in sectie 5 — apart van omschrijving, bewerkbaar in beheer
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
(instelbaar in beheer, zie sectie 2). De veldenlijst uit sectie 2 staat
als data vast; het beheerscherm om die velden zelf te bewerken staat nog
niet in `admin-beheerpagina.md` als gebouwd (zie de status bovenaan dit
document).

### Respondent

```
Respondent {
  id: string
  organisatieId: string
  email: string                    // enige verplichte veld bij uitnodigen
  naam: string | null              // leeg bij uitnodigen, pas gevuld zodra de respondent scherm 4 (intake) invult — zie toelichting hieronder
  rol: string
  team: string                     // optioneel
  notities: string                 // optioneel
  antwoorden: { [vraagId: string]: number }  // 1-5 — gaat uit van 1 invulling per respondent, zie vlag hieronder
  opmerkingenPerBouwblok: { [bouwblokId: string]: string }
  status: "uitgenodigd" | "bezig" | "afgerond"
  gestartOp: datetime
  afgerondOp: datetime | null
}
```

**Bekende beperking, bewust nog niet opgelost**: dit model gaat uit van
precies 1 invulling per respondent. Zodra een respondent later nogmaals
een scan moet kunnen invullen (BACKLOG.md), verhuizen
`antwoorden`/`opmerkingenPerBouwblok`/`status`/`gestartOp`/`afgerondOp`
naar een los `ScanInvulling`-record (N per Respondent) in plaats van
vaste velden hier. Nu nog niet bouwen, wel al rekening mee houden bij
bijvoorbeeld verwijderacties in `admin-beheerpagina.md`.

**`naam` is leeg tot de intake is voltooid**: bij het aanmaken van een
uitnodiging heeft Coniche alleen het e-mailadres. In elk beheeroverzicht
(bijv. "Ingevulde scans") toont de Naam-kolom dan een fallback: het
e-mailadres zelf, cursief of anderszins herkenbaar als placeholder — niet
een lege cel. Zodra de respondent de verificatie doorloopt (v1-
aanpassingen.md punt 2) én scherm 4 (Respondent-intake: naam, rol, team,
notities) invult en verzendt, wordt `naam` overschreven met wat de
respondent zelf invulde, en toont de tabel vanaf dan die echte naam in
plaats van het e-mailadres.

Dat moment (intake voltooid) is ook waar de status van `"uitgenodigd"`
naar `"bezig"` springt — niet pas bij de eerste beantwoorde vraag. Dat is
zichtbaar in de praktijk: een net-uitgenodigde respondent staat op 0%
met status "uitgenodigd", maar zodra iemand de intake heeft ingevuld
staat de status al op "bezig" terwijl de voortgang nog 0% is.

Let op: organisatienaam, sector/subsector etc. staan NIET meer in het
korte respondent-formulier — die liggen al vast op het `Organisatie`-
niveau voordat de respondent begint. Het respondent-formulier bevat
alleen nog: naam, rol/functie, team (optioneel), notities (optioneel).

---

## 2. Organisatievelden (instelbaar in beheer, nu als vaste data)

Bron: intern rapport dat Coniche zelf samenstelt over klanten (zie
voorbeeld "4a"). Hardcoded als JSON-structuur, zodat het beheerscherm
eroverheen kan zonder de flow te herbouwen — zie `admin-beheerpagina.md`
punt 3 voor de status daarvan.

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

## 3. Scoringslogica

- **Bouwblokscore** = gemiddelde van de scores op de vragen binnen dat
  bouwblok, afgerond op 1 decimaal.
- **Categoriescore** = gemiddelde van de bouwblokscores binnen die
  categorie, afgerond op 1 decimaal.
- **Overall score** = gemiddelde van ALLE 15 bouwblokscores samen — dus
  NIET het gemiddelde van de 5 categoriescores. Categorieën met meer
  bouwblokken (Organisatie, Proces & Tech, Mens hebben er 4; Overkoepelend
  heeft er 2; Fundament heeft er 1) wegen dus niet gelijk mee als je via
  categoriegemiddelden zou rekenen — bouw dit bewust op bouwblok-niveau.
- **Afronding**: standaard "half-away-from-zero" (zoals JS `toFixed(1)`).
- **Voortgang** = aantal beantwoorde vragen / totaal aantal vragen in de
  hele scan, dus op vraagniveau, niet op bouwblokniveau.
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

**Grens: < 2,5 rood, 2,5–3,49 oranje, ≥ 3,5 groen.**

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

Voor alle opmaak — exacte hex-waarden per categorie, tekstkleuren,
randen/achtergronden, classificatiekleuren, knopstaten, en wat nog niet
met zekerheid vastligt (font-family, spacing, interactiestaten) — is
`stylesheet.md` de enige bron. Niet hier dupliceren, dat voorkomt dat de
twee documenten uit elkaar gaan lopen zodra er een kleur wijzigt.

---

## 5. Schermflow

**Globale layout, over alle schermen heen**: een gedeelde navigatiebalk
en footer, exact zoals beschreven in `stylesheet.md` (logo op 44px in de
nav, sticky met oranje onderrand — géén transparant-wordt-wit-bij-scroll,
dat patroon is losgelaten; footer voorlopig zonder logo, alleen tekst,
zie "Nog open" in stylesheet.md). Dit is één component dat op ELK scherm
hieronder hergebruikt wordt, niet per pagina opnieuw gebouwd — anders
lopen ze vanzelf uit elkaar. Idem voor alle kleuren/fonts: elk scherm
gebruikt de
tokens uit `stylesheet.md`, dat geldt voor alle 6 schermen hieronder,
niet alleen waar het expliciet herhaald wordt.

**De nav is niet overal identiek**: het logo-deel links is vast, het
rechterdeel (`.nav-right` in components.css) is contextueel en toont
scherm-specifieke acties. Op de resultatenpagina (scherm 6) horen daar
in elk geval "Terug naar scan" (om een antwoord aan te passen) en de
export-acties (PDF/CSV). Welke acties op de andere schermen in de nav
thuishoren, is nog niet compleet vastgelegd — dit is een eerste
vastlegging van het principe, aan te vullen zodra de visuele uitwerking
verder komt.

**Vaste volgorde binnen `.nav-right`, overal hetzelfde**: eerst de
pagina-specifieke acties (bijv. "Terug naar scan", "Exporteren" op de
resultatenpagina, of "Overzicht"/"Ingevulde scans" in de beheeromgeving),
dan een verticale scheidingslijn, dan als laatste de "verlaat deze
sectie"-link (bijv. "← Terug naar site" vanuit beheer). Die laatste staat
altijd uiterst rechts, met een `←`-pijl ervoor, na de scheidingslijn —
zo leert de gebruiker één vaste plek voor "hier kom ik weg", ongeacht op
welk scherm. Bevestigd voorbeeld: de beheer-nav volgt dit al exact
(Overzicht, Organisaties, Ingevulde scans, scheidingslijn, ← Terug naar site).

1. **Kies jouw assessment** — landingspagina met kaarten per Assessment-type
   (inmiddels Klantcontact Volwassenheid én AI-Volwassenheid ingevuld, zie
   sectie 6 — de kaarten-component werkt generiek over `Assessment[]` heen)
2. **Assessment-landingspagina** — titel, hero, 3 feature-cards, "Praktische
   informatie"-blok met 3 punten (invultijd, direct resultaat, privacy —
   AI-samenvatting is hier bewust verwijderd, zie sectie 7). Twee aparte
   CTA's, niet één: een primaire "Start assessment"-knop direct onder de
   hero (gaat rechtstreeks naar scherm 4, Respondent-intake) én, verderop
   op de pagina, een aparte "Bekijk wat je krijgt"-knop die naar scherm 3
   (Voorbeeld-output preview) gaat.
3. **Voorbeeld-output preview** — dezelfde resultaatcomponenten als scherm 6,
   gevuld met vaste demo-data (`isPreview: true` of een aparte mock-dataset,
   zodat de resultaatcomponent maar één keer gebouwd hoeft te worden)
4. **Respondent-intake** — alleen naam, rol/functie, team (optioneel),
   notities (optioneel). Organisatiekenmerken liggen al vast op
   Organisatie-niveau, dus GEEN organisatienaam/sector/subsector-velden meer
   in dit scherm.
5. **Doorloopflow** — logo zit alleen nog in de gedeelde nav (sectie 5,
   "Globale layout"), niet meer los in de sidebar. Sidebar: naam
   respondent, voortgangspercentage, 5 categorieën met genummerde
   bouwblokken, actieve bouwblok gemarkeerd, 3 statussen per bouwblok.
   Hoofdscherm per bouwblok:
   gekleurde kop met titel + omschrijving, een link/icoon naast de titel
   die een overlay (modal) opent met de `toelichting`-tekst van dat
   bouwblok (langere uitleg dan de omschrijving, bron: eerste versie komt
   uit `coniche_bouwstenen.md`, later bewerkbaar via beheer — zie
   `admin-beheerpagina.md`), tags, grijze instructieregel ("Beantwoord op
   basis van wat aantoonbaar geregeld is (documenten, ritmes, tooling,
   afspraken)."), 4 vragen met 5-punts radiobuttons, één opmerkingenveld
   onderaan (per bouwblok, niet per vraag). Knoptekst wisselt op het
   allerlaatste bouwblok van "Volgende" naar "Bekijk resultaten".
6. **Resultatenscherm** — overall score (groot getal + classificatie-cirkel
   + voortgang "60 van 60 vragen"), radar chart (alle 15 bouwblokken),
   staafdiagram per categorie (5 balken, kleur = classificatie niet
   categoriekleur), Top 3 Sterktes / Top 3 Verbeterkansen, legenda-blok met
   de 3 classificaties, export-knoppen (PDF/CSV — zie admin-beheerpagina.md
   punt 6 voor de aanpak als gedeelde exportfunctie)

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

- Hoe de aggregatie van meerdere respondenten per organisatie wordt getoond
  (gemiddelde, afwijking t.o.v. gemiddelde, spreiding hoog/laag) — bewust
  nog niet uitgewerkt
- Of "Rol / Functie" bij de respondent een vrij tekstveld blijft of een
  vaste lijst wordt
- Focus- en error-states (formuliervalidatie) — komen niet voor in het
  aangeleverde referentiemateriaal, zie `stylesheet.md`. Font-family,
  kleurtokens, border-radius en knop-hover-states zijn inmiddels wél
  bekend (uit `coniche-v4.html`).
- AI-gegenereerde managementsamenvatting: was eerder een placeholder op
  de assessment-landingspagina (scherm 2), is nu bewust volledig van dat
  scherm verwijderd voor v1 (geen feature-card, geen bullet in
  "Praktische informatie"). Staat nog wel in BACKLOG.md als iets om
  later, anders opgezet, terug te brengen.
