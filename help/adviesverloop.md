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
Het adviesverloop hoort bij een Organisatie en een onderdeel, niet bij één Meting. Je start het vanaf een Meting met afgeronde scans, kiest met de klant welke bouwstenen je bespreekt (de shortlist), en zet per bouwsteen en per stap een prompt voor Copilot klaar. De app plakt niets in Copilot en ziet niet wat daar gebeurt: Je kopieert de prompt en plakt hem zelf.

## Wat je ziet
1. **Starten.** In het Meting-overzicht staat de kaart Adviesverloop. Zonder adviesverloop voor dit onderdeel staat er "Adviesverloop starten". Loopt er al een, dan staat er "Koppelen" en kun je de Meting aan het lopende adviesverloop hangen. Hoort de Meting er al bij, dan staat er "Adviesverloop openen". Zonder afgeronde scans zijn de knoppen uitgeschakeld, met de reden in een Info-icoon. Op het organisatie-detail staat per adviesverloop een regel met de fase, het aantal Metingen en de status, en in Resultaten, tab Metingen, een kolom met de fase.
2. **De fasestrook.** Bovenaan elk scherm van het adviesverloop, en hij blijft bij scrollen staan. Links het blok Scan met de peilmeting, dan de zes fasen met een balk, een nummer, de naam en "{gedaan} van {totaal}". Een fase is klaar (vinkje) als al zijn stappen gedaan zijn, de huidige fase is de eerste met een open stap. Een klik op een fase toont wat je al deed en de volgende stap.
3. **Metingen en peilmeting.** Via het blok Scan koppel je er Metingen van dezelfde Organisatie en hetzelfde onderdeel bij, met een vrij label zoals Nulmeting, Tussenmeting of Eindmeting, en koppel je ze weer los. Er blijft altijd minstens één Meting gekoppeld. De peilmeting levert de scores: Standaard de meest recente gekoppelde Meting met afgeronde scans, of de Meting die je zelf kiest. Een Meting van een ander Assessment kun je alleen koppelen als de Organisatie in een benchmark zit waarin beide Assessments staan.
4. **De shortlist.** De bouwstenen met de laagste score van de peilmeting, standaard drie (een Admin stelt dat aantal in). Bij gelijke scores wint het laagste nummer. Met de knop rechtsboven de lijst voeg je een bouwsteen toe waar je met de klant over wilt praten, ook als hij goed scoort. Per rij zie je de score, de klasse, het verschil met de benchmark, de spreiding en, bij meer Metingen van hetzelfde Assessment, het verschil met de eerste Meting.
5. **Uitwerken.** Per bouwsteen zie je de resultaten in het klein, de use cases van de huidige fase (eerst die voor deze bouwsteen of klasse) en de items uit het Dossier die aan de bouwsteen zijn gekoppeld.
6. **Prompt klaarzetten.** Kies je rol, pas de tekst bij "Wie ben jij bij deze klant" aan in je eigen woorden, controleer het contextblok met gegevens uit de peilmeting en pas de prompt aan. "Kopiëren" zet alles als één tekst op het klembord en legt de stap vast. De rol en jouw tekst blijven bij het adviesverloop bewaard.
7. **Markeer als gedaan.** Voor werk buiten de app: Je legt een stap vast met een optionele link (http of https) naar het document, bijvoorbeeld in SharePoint. De app bewaart de link en niet het document. "Terugzetten" haalt de stap weer weg.
8. **Afronden en verwijderen.** Een afgerond adviesverloop blijft leesbaar en je kunt het heropenen, zolang er voor dat onderdeel geen ander adviesverloop loopt. Verwijderen kan door een Admin en door een Consultant bij zijn eigen Organisaties. De Metingen blijven bestaan en de bevestiging noemt het aantal gedane stappen.

## Let op
Naar Copilot gaan alleen gegevens die in de scan al op groepsniveau staan: Gemiddelde scores, benchmark, spreiding en de KPI's Algemeen en kenmerken van de Organisatie. Nooit antwoorden per persoon, namen of opmerkingen. Zijn er minder afgeronde scans dan de minimale groepsgrootte voor een Meting, dan laat het contextblok de scores weg. Je ziet het blok altijd voor je kopieert. Een Meting die de enige gekoppelde Meting van een adviesverloop is, kun je niet verwijderen zolang dat adviesverloop bestaat, en een onderdeel met een adviesverloop kun je niet verwijderen. De fasen, use cases, rollen en prompts beheert een Admin onder Assessments, tab Adviescatalogus.

## Zie ook
- [Metingen en onderdelen](metingen-en-onderdelen)
- [Het Dossier van een Organisatie](het-dossier-van-een-organisatie)
