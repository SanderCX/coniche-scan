# Coniche Scan: Adviesverloop

Het adviesverloop is de plek waar een Consultant, na een afgeronde Meting, het adviesproces met de klant doorloopt. De scan levert de inzichten, het adviesverloop helpt om daar de juiste gesprekken en vervolgstappen aan te koppelen, met Copilot als hulpmiddel. Dit bestand beschrijft de schermen, de regels en de aansluiting op de rest van de app. Het datamodel staat in `datamodel.md`, de rechten in `datamodel-rollen.md`, de beheerschermen in `beheerpagina.md` en de koppeling met Copilot en SharePoint in `copilot-koppeling.md`. Alle opmaak staat in `stylesheet.md`.

## Uitgangspunten

- Het adviesverloop hoort bij één Meting. De scores van die Meting bepalen de shortlist, en een herhaalmeting begint een nieuw adviesverloop.
- Alleen een Admin en een Consultant zien het adviesverloop. Een Lead en een Respondent zien het niet.
- De scan blijft de enige plek waar scores en grafieken staan. Het adviesverloop toont scores alleen als kleine verwijzing (score, klasse, benchmark) met een knop naar de resultaten.
- De scan is de ingang van het adviesverloop. Het adviesverloop begint bij een afgeronde Meting en eindigt bij Evalueren met een nieuwe Meting.
- De fasen, de stappen, de use cases en de prompts zijn data en worden door een Admin beheerd (punt 17 in `beheerpagina.md`). Er is geen scherm per fase of per use case.
- In de versie zonder koppeling zet de app een prompt klaar die de Consultant zelf in Copilot plakt. De app ziet niet wat er in Copilot, Word of PowerPoint gebeurt.
- Naar Copilot gaan alleen gegevens die in de scan al op groepsniveau staan: Gemiddelde scores, benchmark, spreiding en de KPI's van de Organisatie. Nooit antwoorden per persoon en nooit namen van Respondenten.

## Begrippen

| Term | Betekenis |
|---|---|
| **Adviesverloop** | De voortgang van één Meting door de zes fasen, met de shortlist en de gedane stappen |
| **Fase** | Een van de zes fasen: Acquireren & Starten, Offreren & Overeenkomen, Onderzoeken & Beeldvormen, Oplossen & Ontwerpen, Implementeren, Evalueren & Afronden |
| **Use case** | Een taak binnen een fase, bijvoorbeeld "Brainstormen en alternatieven verkennen". Heeft een titel, een omschrijving, apps en per rol een prompt |
| **Stap** | Een use case die voor deze Meting is opgepakt. De fasestrook telt stappen |
| **Shortlist** | De bouwstenen die de Consultant met de klant wil bespreken |
| **Contextblok** | De tekst met gegevens uit de Meting die bij de prompt hoort |
| **Rol** | De positie van de Consultant bij deze klant: Consultant, Salesmanager of Teamleider (interim) |

## Waar het adviesverloop staat

| Plek | Wie | Wat |
|---|---|---|
| Resultaten, tab Metingen | Admin (alle), Consultant (eigen) | Een kolom Adviesverloop met de huidige fase en de voortgang, bijvoorbeeld "Oplossen · 0 van 4" |
| Meting-overzicht (`beheerpagina.md`, punt 5) | Admin (alle), Consultant (eigen) | Een kaart bovenaan met de fasestrook in klein formaat en de knop "Adviesverloop openen" |
| Organisatie-detail | Admin (alle), Consultant (eigen) | Bij elke Meting dezelfde regel met de huidige fase |
| Pagina Adviesverloop | Admin (alle), Consultant (eigen) | De schermen hieronder. Kruimelpad: Organisaties › {Organisatie} › {Meting} › Adviesverloop |
| Assessments, tab Adviescatalogus | Admin | Het beheer van fasen, use cases, rollen en prompts (punt 17 in `beheerpagina.md`) |

Het adviesverloop bestaat pas als een Consultant het voor het eerst opent. Een Meting zonder afgeronde scans heeft geen adviesverloop: De knop "Adviesverloop openen" is dan uitgeschakeld, met de reden in een Info-icoon.

## De fasestrook

De fasestrook staat op elk scherm van het adviesverloop onder de nav, blijft bij scrollen in beeld (`position: sticky`) en bestaat uit:

- **Het blok Scan**, uiterst links, met de tekst "Scan" en eronder "Meting {maand jaar} · afgerond". Het blok is een link naar de resultaten van de Meting. Het staat voor de fasen met een pijl ertussen, omdat de scan geen fase is maar de ingang.
- **De zes fasen**, elk met een dunne balk die vult naar het aandeel gedane stappen, een nummercirkel (24px), de korte naam en de telling "{gedaan} van {totaal}".
- **De status van een fase**: Klaar als alle stappen van de fase gedaan zijn (cirkel gevuld in `--or` met een vinkje), huidig is de eerste fase met een open stap (cirkel met `--or` rand, de naam in gewicht 800), de overige zijn nog niet begonnen (grijze rand).
- **Het uitklappaneel.** Een klik op een fase opent een paneel onder de strook met links de fase en de telling, in het midden de gedane stappen en rechts de volgende stap als knop. Elke gedane stap is één regel met de titel, wat er gedaan is ("Prompt gekopieerd" of "Gemarkeerd als gedaan"), de datum en de code van de use case. Een fase zonder gedane stappen toont "Hier is nog niets gedaan". Een klik op dezelfde fase of op Sluiten sluit het paneel.

Welke use cases meetellen als stap in de strook, stelt een Admin per use case in (`inStrook`, `datamodel.md`). Een andere use case is wel te gebruiken, maar telt niet mee.

## Scherm Adviesverloop (shortlist)

Opbouw van boven naar beneden:

1. **Kruimelpad en kop.** Eyebrow "Adviesverloop", titel de naam van de Organisatie, subregel "{Assessment} · {Meting} · {n} Respondenten". Rechts de knop "Alle resultaten bekijken".
2. **Kaart Shortlist voor het gesprek.** Titel met Info-icoon, subregel "{n} bouwstenen: De drie laagste scores" met bij toegevoegde bouwstenen "en {m} toegevoegd". Rechts de knop "Bouwsteen toevoegen".
3. **Rijen.** Per bouwsteen een rij met links de kleine ring (`.score-ring--mini`, 44px, volle scorekleur), dan eyebrow "Bouwsteen {nr} · {categorie}", de naam in 18px gewicht 800 en daaronder het verschil met de benchmark en de spreiding. Rechts de klassenchip in de klassekleur (`stylesheet.md`, Scorekleuren) en de knop "Bekijk in resultaten". Een toegevoegde bouwsteen heeft er ook de knop "Verwijderen" bij.
4. **Voet.** Links "De drie laagste scores staan er standaard in." en rechts de knop "Uitwerken", die naar de uitwerking van de eerste bouwsteen gaat.

**Standaard.** De shortlist begint met de bouwstenen met de laagste scores. Het aantal is een instelling (`shortlistAantal`, standaard 3, punt 10 in `beheerpagina.md`). Bij gelijke scores wint de bouwsteen met het laagste nummer. De drie bouwstenen kunnen niet verwijderd worden, wel aangevuld.

**Bouwsteen toevoegen.** Een modal (patroon Overzichtsmodal, `stylesheet.md`) met alle andere bouwstenen, van laag naar hoog. Per rij een selectievakje, de nummercirkel in de categoriekleur, naam en categorie, de score en de klassenchip. Onderaan de telling en de knop "Klaar". Het doel is een open deur: Een bouwsteen die goed scoort, maar waar de Consultant de klant graag over wil spreken.

**Scores.** Het adviesverloop gebruikt de scores van de Meting zoals de resultatenpagina ze toont, met dezelfde afronding en klassen (`CLAUDE.md`, Scoringslogica). Bij een samengestelde Meting zijn dat de gemiddelden van de samenstelling.

## Scherm Uitwerking per bouwsteen

Opent met "Uitwerken" en toont de gekozen bouwstenen als pilgroep bovenaan (`.pil`, 32px), met rechts "Bouwstenen wijzigen". Onder de pilgroep, per gekozen bouwsteen:

- **Resultaatkop.** Dezelfde opbouw als de Resultaatkop in `stylesheet.md`: De ring (128px, score in 32px gewicht 700, label SCORE), eyebrow "Bouwsteen {nr} · {categorie}" in `--or`, de naam als titel, de klassenchip met de uitleg van de klasse (`CLAUDE.md`, Classificatie) en de feiten Benchmark, Spreiding en Vragen.
- **Kaart van de huidige fase.** Titel de naam van de fase met Info-icoon. Per use case een rij met een rond icoon (48px, `--or-faint`, icoon in `--or`), eyebrow "{Fase} · {code}", de titel, de omschrijving en een chip per app (Copilot, Word, Excel, PowerPoint). Rechts de knop "Prompt klaarzetten". Welke use cases verschijnen, volgt uit de catalogus: Alle use cases van de fase, en bij een bouwsteen eerst de use cases die voor die bouwsteen of klasse zijn voorgesteld.
- **Kaart Dossier bij deze bouwsteen.** De Dossieritems van de Organisatie die aan deze bouwsteen zijn gekoppeld (`dossier.md`), in dezelfde rijopmaak, met de status "Zichtbaar voor klant" of "Intern". Rechts de knop "Naar Dossier".

## Prompt klaarzetten

Een modal (760px) met de eyebrow "{Fase} · {code}", de titel van de use case en de subregel met Meting en Organisatie. De modal heeft drie genummerde delen en de voet met "Annuleren" (omlijnd) en "Kopiëren" (gevuld).

1. **Wie ben jij bij deze klant.** Een pilgroep met de rol (Consultant, Salesmanager, Teamleider (interim)) en daaronder een tekstveld. Het veld is vooraf gevuld met een standaardtekst per rol en bedoeld om in de eigen woorden van de Consultant aan te passen: Wie je kent, hoe je samenwerkt en wat je kunt doen. De rol en de tekst blijven bewaard bij het adviesverloop, zodat ze niet opnieuw getypt hoeven te worden.
2. **Waar werk je aan.** Het contextblok, gevuld uit de Meting en bewerkbaar. Eronder twee regels chips: Meegenomen (Gemiddelde scores, Benchmark, KPI's Algemeen, Kenmerken) en Niet meegenomen (Antwoorden per persoon, Namen, Groepen onder de minimale groepsgrootte).
3. **Wat wil je nu.** De prompt van de use case voor de gekozen rol, bewerkbaar.

**Kopiëren** zet rol, context en prompt als één tekst op het klembord en legt de stap vast (`Adviesstap`, status "Prompt gekopieerd"). Een use case voor een andere fase, zoals Samenwerkingsvoorstel presenteren bij Offreren, werkt hetzelfde. Het voorbeeld in het ontwerp is een pitch aan het MT om een vervolgstap met Coniche te bepleiten, met de rol en de relaties van de Consultant als belangrijkste verschil.

## Gedane stappen vastleggen

De app legt alleen vast wat in de app gebeurt: Een gekopieerde prompt, een gekoppeld Dossieritem of het gebruik van de Meting of de benchmark. Voor werk buiten de app heeft elke stap de actie "Markeer als gedaan", met een optionele link (http of https) naar het document, bijvoorbeeld in SharePoint. De app bewaart de link en niet de inhoud van het document en niet de inhoud van de prompt.

| Status | Wanneer | Tekst in het paneel |
|---|---|---|
| Open | Nog niets gedaan | Niet getoond |
| Prompt gekopieerd | De Consultant kopieerde de prompt | "Prompt gekopieerd · {datum}" |
| Gedaan | De Consultant markeerde de stap als gedaan | "Gemarkeerd als gedaan · {datum}", met de link als die er is |

Een stap telt als gedaan bij Prompt gekopieerd en bij Gedaan. Een Consultant kan een stap weer terugzetten naar Open.

## Contextblok

Het contextblok wordt door de app samengesteld uit de Meting en bevat:

- Het Assessment, de Meting, de Organisatie en het aantal afgeronde scans.
- De scores van de bouwsteen waar het om gaat en van de andere bouwstenen op Basis op orde, met klasse, benchmark en spreiding.
- De sterke punten.
- De KPI's van de Organisatie die in `datamodel.md` (KPI's en kanalen) als Algemeen zijn ingevuld.
- De Kenmerken van de Organisatie die geen persoonsgegevens zijn.

Wat er niet in zit: Antwoorden per persoon, namen van Respondenten, opmerkingen van Respondenten en gegevens van groepen die onder de minimale groepsgrootte vallen. De Consultant ziet het blok altijd voor het gekopieerd wordt en kan het aanpassen.

## Rechten en audit

De rechten staan in `datamodel-rollen.md`, Rechtenmatrix: `adviesverloop.bekijken` en `adviesverloop.bewerken` voor een Admin (alle) en een Consultant (eigen), en `adviesverloop.catalogus` alleen voor een Admin. Het audit-log krijgt de gebeurtenissen `adviesstap.gedaan`, `adviesverloop.shortlistGewijzigd` en `adviescatalogus.gewijzigd`.

## Beheer

De Admin beheert de catalogus onder Assessments, tab Adviescatalogus (punt 17 in `beheerpagina.md`), en stelt het aantal bouwstenen in de shortlist in onder Instellingen, Drempels en termijnen (punt 10). De Info-teksten van het adviesverloop zijn Algemene teksten (punt 2a), met een initiële waarde.

De use cases voor de eerste inrichting komen uit de Boks-app: Zes fasen, per fase een lijst use cases, per use case de apps en per rol een context en een prompt. De rollen zijn Consultant, Salesmanager en Teamleider (interim).

## Hulp

Het adviesverloop krijgt een helpbestand voor de Consultant in `help/` (`help.md`, Actueel houden).

## Open punten

- Of een adviesverloop per Meting blijft, of per Organisatie loopt over meerdere Metingen heen. Bij een herhaalmeting begint nu een nieuw adviesverloop dat naar het vorige kan verwijzen.
- Of de catalogus onder Assessments hoort, of een eigen tab onder Instellingen krijgt, omdat een use case niet aan één Assessment hangt.
- De minimale groepsgrootte voor het contextblok. Het datamodel kent nu geen drempel voor het aantal afgeronde scans waaronder gegevens niet naar Copilot gaan.
- Welke stappen per fase meetellen in de fasestrook. Het ontwerp telt drie of vier per fase.
- Of "Markeer als gedaan" met een link voldoende is, of dat de app het document zelf moet kunnen terugvinden.
- Of een Admin in Verkennen wil zien welke use cases het meest gebruikt worden.
- Of de rollen (Consultant, Salesmanager, Teamleider) aan de Gebruiker gekoppeld worden of per adviesverloop gekozen blijven.
- De teksten van de standaard-rollen en van de prompts moeten door een Consultant gelezen worden.
