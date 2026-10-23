---
titel: Het adviesverloop
groep: Scans en Metingen
volgorde: 8
rollen: [Consultant, Admin]
afbeelding:
film:
bronnen: [adviesverloop.md, beheerpagina.md, datamodel.md, content-adviesverloop.md]
bijgewerkt: 2026-10-23
---
Het adviesverloop is de plek waar je na een afgeronde Meting het adviesproces met een klant doorloopt. De scan levert de inzichten, het adviesverloop helpt je om daar de juiste gesprekken en vervolgstappen aan te koppelen, met Copilot als hulpmiddel. Een Lead en een Respondent zien het adviesverloop niet.

## In het kort
Het adviesverloop hoort bij een Organisatie en een onderdeel, niet bij één Meting. Je start het vanaf een Meting met afgeronde scans, kiest zelf welke bouwstenen je met de klant bespreekt (de shortlist) en in welke volgorde, en zet per bouwsteen en per stap een prompt voor Copilot klaar. Past een fase of een stap niet bij deze klant, dan sla je hem over. De app plakt niets in Copilot en ziet niet wat daar gebeurt: Je kopieert de prompt en plakt hem zelf.

## Wat je ziet
1. **Starten.** Op het organisatie-detail staat de kaart Adviesverloop. Heeft de Organisatie nog geen adviesverloop, dan kies je met "Adviesverloop starten" de Meting waarmee het begint. In het Meting-overzicht staat een kaart met dezelfde keuze: "Adviesverloop starten" als er voor dit onderdeel geen loopt, "Koppelen" als de Meting nog bij het lopende adviesverloop hoort en "Adviesverloop openen" als ze er al bij hoort. Zonder afgeronde scans zijn de knoppen uitgeschakeld, met de reden in een Info-icoon. In Resultaten, tab Metingen, staat een kolom met de fase.
2. **De fasestrook.** Bovenaan elk scherm van het adviesverloop, en hij blijft bij scrollen staan. Links het blok Scan met de peilmeting, dan de zes fasen met een balk, een nummer, de naam en "{gedaan} van {totaal}". Een fase is klaar (vinkje) als al zijn stappen gedaan zijn, de huidige fase is de eerste met een open stap. Een klik op een fase toont de stappen van die fase, wat je al deed en de volgende stap.
3. **Een fase overslaan, een stap niet van toepassing.** In het paneel van een fase kies je "Fase overslaan" (en later "Fase weer meenemen"). Bij elke stap staat "Niet van toepassing" (en "Weer meenemen"). Wat je overslaat telt niet mee in de voortgang en in de huidige fase, en een stap die niet van toepassing is verschijnt niet in de uitwerking. Een stap die al gedaan is, kun je niet overslaan: Zet hem eerst terug naar open. De keuze geldt alleen voor dit adviesverloop.
4. **Metingen en peilmeting.** Via het blok Scan koppel je er Metingen van dezelfde Organisatie en hetzelfde onderdeel bij, met een vrij label zoals Nulmeting, Tussenmeting of Eindmeting, en koppel je ze weer los. Er blijft altijd minstens één Meting gekoppeld. De peilmeting levert de scores: Standaard de meest recente gekoppelde Meting met afgeronde scans, of de Meting die je zelf kiest.
5. **Een Meting van een ander Assessment.** Die kun je koppelen als de Organisatie in een benchmark zit waarin beide Assessments staan. Zit ze in meer dan één zo'n benchmark, dan kies je welke ("Benchmark voor de koppeling"). Verdwijnt die benchmark, of valt de Organisatie of een Assessment eruit, dan worden de Metingen van het andere Assessment losgekoppeld.
6. **Jouw rol bij deze klant.** Boven de shortlist kies je een van je rollen. Die staan in Mijn account, tab Adviescontext, samen met je tekst bij "Over mij". Je vult ze eenmaal in. "Aanpassen in Mijn account" opent die tab. Alleen jij ziet je adviescontext.
7. **De shortlist.** Standaard de bouwstenen met de laagste score van de peilmeting, drie (een Admin stelt dat aantal in). Met "Bouwstenen kiezen" vink je aan wat je wilt bespreken en haal je weg wat niet past, en met de pijltjes bepaal je de volgorde. Je mag ook een bouwsteen kiezen die goed scoort, als de klant er graag over praat. "Standaard herstellen" zet de laagste scores terug. Per rij zie je de score, de klasse, het verschil met de benchmark, de spreiding en, bij meer Metingen van hetzelfde Assessment, het verschil met de eerste Meting.
8. **Uitwerken.** Per bouwsteen op de shortlist zie je de resultaten in het klein, de use cases van de huidige fase (eerst die voor deze bouwsteen of klasse) en de items uit het Dossier die aan de bouwsteen zijn gekoppeld.
9. **Prompt klaarzetten.** Kies je rol en pas zo nodig de tekst van de rol aan voor deze ene prompt, controleer het contextblok met gegevens uit de peilmeting en pas de prompt aan. "Kopiëren" zet je tekst bij Over mij, de rol, het contextblok en de prompt als één tekst op het klembord en legt de stap vast. Heb je zelf een rol toegevoegd, dan geldt de prompt van de rol Consultant.
10. **Markeer als gedaan.** Voor werk buiten de app: Je legt een stap vast met een optionele link (http of https) naar het document, bijvoorbeeld in SharePoint. De app bewaart de link en niet het document. "Terugzetten" haalt de stap weer weg.
11. **Afronden en verwijderen.** Een afgerond adviesverloop blijft leesbaar en je kunt het heropenen, zolang er voor dat onderdeel geen ander adviesverloop loopt. Verwijderen kan door een Admin en door een Consultant bij zijn eigen Organisaties. De Metingen blijven bestaan en de bevestiging noemt het aantal gedane stappen.

## Let op
Naar Copilot gaan alleen gegevens die in de scan al op groepsniveau staan: Gemiddelde scores, benchmark, spreiding en de KPI's Algemeen en kenmerken van de Organisatie, gericht op de gekozen bouwsteen, de sector en de andere bouwstenen op je shortlist. Bouwstenen buiten de shortlist gaan niet mee. Nooit antwoorden per persoon, namen of opmerkingen. Zijn er minder afgeronde scans dan de minimale groepsgrootte voor een Meting, dan laat het contextblok de scores weg. Je ziet het blok altijd voor je kopieert. Noem geen namen van klanten of personen bij Over mij en in je rollen: Die teksten gaan in elke prompt mee. Een Meting die de enige gekoppelde Meting van een adviesverloop is, kun je niet verwijderen zolang dat adviesverloop bestaat, en een onderdeel met een adviesverloop kun je niet verwijderen. De fasen, use cases, rollen en prompts beheert een Admin onder Assessments, tab Adviescatalogus. Een wijziging van de standaardteksten daar verandert je eigen rollen niet.

## Zie ook
- [Metingen en onderdelen](metingen-en-onderdelen)
- [Het Dossier van een Organisatie](het-dossier-van-een-organisatie)
