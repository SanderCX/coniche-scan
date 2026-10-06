# Overleg met Joost

Punten die Sander met Joost wil bespreken, voordat ze in de specs of de code
worden vastgelegd. Per punt: wat er speelt, wat er nu in de code staat en wat
er gevraagd wordt. Opgeloste punten gaan eruit of krijgen een besluit met datum.

---

## 1. Register van de Info-iconen in `beheerpagina.md` is niet meer compleet

**Achtergrond.** Elke uitleg bij een veld of knop staat in een Info-icoon, en
elk Info-icoon heeft een sleutel, een plek en een initiële tekst in het
register bij punt 2a, Algemene teksten (`beheerpagina.md`). Een Admin kan de
tekst op de plek zelf aanpassen. Een standaardtekst bevat geen verwijzing naar
een document.

In de code staat het register in `data/info-teksten.ts`. Dat is de bron van
de standaardteksten en van het overzicht onder Algemene teksten. Het register
in de spec loopt achter op de code.

**1a. Zes sleutels die in de code staan en niet in het register.**
Voorstel om toe te voegen:

| Sleutel | Plek | Initiële tekst |
|---|---|---|
| `info.auditLog` | Audit-log, naast de paginatitel | "Wie (of het Systeem) wat deed, wanneer en op welk record. Alleen-lezen. Geen persoonsgegevens uit scans." |
| `info.algemeneTekstenPagina` | Algemene teksten, naast de paginatitel | "Teksten los van één Assessment-type. Wijzigingen zijn direct zichtbaar, geen aparte publicatiestap." |
| `info.algemeneTekstenInfoIconen` | Algemene teksten, naast de kop Info-iconen | "Alle toelichtingen achter een Info-icoon, met de plek en de actuele tekst. Aanpassen kan op de plek zelf, met het potlood in het open Info-icoon." |
| `info.contentToelichting` | Content, veld Toelichting van een bouwblok | "Lopende tekst in de Toelichtingsmodal bij dit bouwblok. Een lege regel scheidt de alinea's. Laat je het veld leeg, dan ontbreekt dit onderdeel in de modal." |
| `info.contentBouwblokLabel` | Content, veld Bouwblok-label | "De kleine kop boven de titel in de Toelichtingsmodal, bijvoorbeeld "Bouwsteen" of "AI-domein", gevolgd door het nummer." |
| `info.conflictOplossen` | Conflict oplossen, naast de titel van de modal | "Een Respondent heeft per Meting één scan. Hang één van de twee scans aan een andere Respondent. Alleen die scan gaat mee, de oorspronkelijke Respondent blijft bestaan met de andere scan." |

**1b. Bestaande regels die niet meer kloppen.**

- `info.bewaartermijn`: Het register noemt als plek "Organisaties, formulier
  Bewaartermijn ingevulde scans". Volgens punt 10 staan de bewaartermijn en de
  verlengtermijn onder Applicatie, Instellingen (Admin-only). In de code staat
  het formulier daar nu. Voorstel: de plek wordt "Applicatie, Instellingen,
  formulier Bewaartermijn ingevulde scans".
- `info.importRijen`: De tekst noemde "Importeer deze rij". Die knop bestaat
  niet meer (goedkeuren en importeren op één plek). De tekst is nu: "Rijen met
  een 95%+-vraagtekstmatch (niet 100%) tellen pas mee na een expliciete
  goedkeuring per rij, met de knop "Goedkeuren" in de tabel hierboven."
- `info.bewaartermijnAlleenLezen`: Stond tijdelijk in de code voor de
  weergave aan een Consultant. Die weergave bestaat niet meer en de sleutel is
  verwijderd. Staat niet in het register, dus niets te doen.

**1c. Het register zegt bij de meeste regels "Zoals nu in de app".**
Dat is een verwijzing naar de code en geen tekst. Voorstel: de feitelijke
tekst opnemen, of verwijzen naar `data/info-teksten.ts` als de plek waar de
standaardteksten staan. Dan kan het register niet meer uit de pas lopen.

**Vraag aan Joost.** Akkoord met 1a en 1b? En wil je de standaardteksten in de
spec of alleen in de code?

**Wie voert het door.** Na akkoord werkt Sander `beheerpagina.md` bij.

---

## 2. Content-pagina's (Visie, Bouwstenen, AI, 2030): hoe beheerbaar?

**Achtergrond.** `beheerpagina.md` punt 11 wil de vier vaste content-pagina's
bewerkbaar maken vanuit beheer (Applicatie). Het is nog niet gebouwd. De spec
beschrijft alleen welke content beheerbaar wordt, niet hoe het is opgeslagen
(zie ook Open punten onderaan `beheerpagina.md`).

**2a. Visie en 2030: één tekstveld per pagina, of per tekstblok?**
De spec zegt: "Gewone leespagina's, alleen tekst. Eén tekstveld per pagina,
zelfde soort component als Algemene teksten." De pagina's zijn nu geen platte
tekst:

- **Visie** heeft een intro, drie secties met kopjes en alinea's, een
  checklistkaart ("Wat is goed klantcontact?") met zes punten, en een
  verbetercyclus met vijf stappen (Meten, Begrijpen, Besluiten, Doen, Leren).
- **2030** heeft kopjes en alinea's, genummerde kaarten met een titel en
  tekst (vijf dingen om te ontwerpen, de punten bij de machine customer, wat dit
  voor AI betekent), een lijst met effecten met iconen en een kaart met
  gemeenschappelijke kenmerken.

Opties:

1. **Per tekstblok bewerken.** De opmaak blijft zoals nu. In beheer bewerk je
   elk tekstblok apart (intro, kopjes, alinea's, lijstpunten, kaarttitels). Dit
   wijkt af van "één tekstveld", maar niets verdwijnt van de pagina.
2. **Letterlijk één tekstveld per pagina**, met kopjes en alinea's. De
   pagina's worden platte tekst, en de checklistkaart, de cyclus, de genummerde
   kaarten en de iconen verdwijnen.
3. **Hybride:** één tekstveld voor de lopende tekst, en de kaarten en de
   cyclus blijven vast in de code (alleen aan te passen door een ontwikkelaar).

Voorkeur van Sander: nog niet bepaald. Optie 1 verliest niets, optie 2 volgt
de spec letterlijk.

**2b. Bouwstenen en AI: welke velden?**
De spec noemt voor Bouwstenen "titel en omschrijving per bouwsteen" en voor AI
"titel en modal-tekst per domein". De modal toont ook de centrale vraag per
bouwsteen of domein. Voorstel: naam, omschrijving (alinea's) en centrale vraag
bewerkbaar, de visual zelf (indeling, volgorde, interactie) vast.

**Let op, dubbele bron.** De Toelichtingsmodal in de vragenlijst gebruikt sinds
kort de velden `Bouwblok.toelichting` en `Bouwblok.centraleVraag` van het
Assessment (Content per Assessment). De visuals op `/bouwstenen` en `/ai-scan`
gebruiken nog hun eigen statische content. Vraag: Moeten die twee hetzelfde
zijn (dus één bron), of mogen ze uit elkaar lopen? Bij één bron wijzigt een
aanpassing in Content per Assessment ook de publieke pagina.

**2c. Opslag, versiebeheer en archiveren (nog open in de spec).**
Voorstel voor de eerste versie, zoals bij Algemene teksten: Een gewijzigde
tekst gaat voor op de standaardtekst uit de code, met "Standaardtekst
herstellen". Geen versiebeheer en geen archiveren: de pagina's tonen altijd de
actuele tekst. Een wijziging wordt gelogd in de audit-log, met alleen de
sleutel en niet de tekst. Vragen: Is dat genoeg? Willen we versies kunnen
terugzetten? Moet er een publicatiestap komen, zodat een wijziging niet direct
live staat?

**2d. Wie mag het?** Admin-only, zoals de rest van Applicatie. Akkoord?

**Vragen aan Joost.** Welke optie bij 2a? Eén bron of twee bij 2b? Is het
voorstel bij 2c genoeg?

**Wie voert het door.** Na akkoord werkt Sander punt 11 en de Open punten in
`beheerpagina.md` bij en wordt het gebouwd.

---

## 3. De knop "Bekijk >>" in lijstrijen: label en uiterlijk

**Achtergrond.** Elke klikbare rij in een lijst (Respondenten, Ingevulde scans,
organisatie-detail, Meting-overzicht) heeft een compacte knop "Bekijk >>", zodat
de rij ook zonder muis te openen is (`stylesheet.md`, Toetsenbord en focus,
Klikbare rijen; `beheerpagina.md` punt 6b en 7).

**3a. Label.** De spec schrijft overal "Bekijk >>" (`stylesheet.md`,
`beheerpagina.md`, `backlog.md`, `go-live-plan.md`). Sander wil de pijltjes
weg. In de code staat nu "Bekijk". Voorstel: Het label wordt "Bekijk" en de
specs worden overal aangepast. Akkoord?

**3b. Uiterlijk.** `stylesheet.md` (Knoppen en links) zegt dat acties een
knop zijn en dat secundaire acties `.btn-outline .btn-compact` gebruiken:
transparant, grijze rand (`2px solid var(--border-d)`), donkere tekst. Voor
"Bekijk" noemt de spec geen eigen kleur. De oude tekstlink "Bekijk >>" was
oranje, en Sander vond de oranje variant beter. In de code staan nu alle
"Bekijk"-knoppen, net als de andere compacte knoppen, met grijze rand en
donkere tekst. Eerder waren de knoppen in tabellen per ongeluk oranje (een
tabelregel kleurde álle links oranje), waardoor de knoppen niet gelijk waren.

Opties:

1. **Zoals de spec**: grijze rand en donkere tekst, gelijk aan alle andere
   compacte knoppen. Zo staat het nu.
2. **"Bekijk" met oranje tekst en grijze rand**: valt op als de knop om een rij
   te openen, maar is een uitzondering op de knopregels.
3. **Alle `.btn-outline` knoppen met oranje rand bij hover**: past bij het
   oranje accent van de huisstijl en geldt overal hetzelfde. Dit moet dan in de
   stylesheet-spec.

**Vragen aan Joost.** Welke optie bij 3b? En wil je dat de rij die je
aanwijst (nu een lichtoranje achtergrond) en de knop in dezelfde kleur
passen?

**Wie voert het door.** Na akkoord werkt Sander `stylesheet.md` en
`beheerpagina.md` bij en past de code aan.

---

## Nog niet besproken

Hier komen volgende punten.
