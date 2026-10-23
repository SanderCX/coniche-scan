# Coniche Scan: Adviesverloop

Het adviesverloop is de plek waar een Consultant, na een afgeronde Meting, het adviesproces met een klant doorloopt. Het adviesverloop hoort bij de Organisatie (of een Onderdeel daarvan) en heeft minstens één Meting als bron. In de loop van het traject kunnen er Metingen bijkomen. De scan levert de inzichten, het adviesverloop helpt om daar de juiste gesprekken en vervolgstappen aan te koppelen, met Copilot als hulpmiddel. Dit bestand beschrijft de schermen, de regels en de aansluiting op de rest van de app. Het datamodel staat in `datamodel.md`, de rechten in `datamodel-rollen.md`, de beheerschermen in `beheerpagina.md` en de koppeling met Copilot en SharePoint in `copilot-koppeling.md`. Alle opmaak staat in `stylesheet.md`.

## Uitgangspunten

- Het adviesverloop hoort bij een Organisatie en een Onderdeel (of de hele Organisatie), niet bij een Meting. Een Meting is de aanleiding. Er is altijd minstens één gekoppelde Meting, en er kunnen er meer bijkomen, bijvoorbeeld een tussenmeting of een eindmeting. Die namen zijn voorbeelden en geen vaste indeling.
- De scores van de peilmeting bepalen de shortlist. Standaard is dat de meest recente gekoppelde Meting.
- Alleen een Admin en een Consultant zien het adviesverloop. Een Lead en een Respondent zien het niet.
- De scan blijft de enige plek waar scores en grafieken staan. Het adviesverloop toont scores alleen als kleine verwijzing (score, klasse, benchmark) met een knop naar de resultaten.
- De scan is de ingang van het adviesverloop. Het adviesverloop begint bij een afgeronde Meting. In Evalueren kan de Consultant een nieuwe Meting koppelen om het effect te zien.
- De fasen, de stappen, de use cases en de prompts zijn data en worden door een Admin beheerd (punt 17 in `beheerpagina.md`). Er is geen scherm per fase of per use case.
- In de versie zonder koppeling zet de app een prompt klaar die de Consultant zelf in Copilot plakt. De app ziet niet wat er in Copilot, Word of PowerPoint gebeurt.
- Naar Copilot gaan alleen gegevens die in de scan al op groepsniveau staan: Gemiddelde scores, benchmark, spreiding en de KPI's van de Organisatie. Nooit antwoorden per persoon en nooit namen van Respondenten.

## Begrippen

| Term | Betekenis |
|---|---|
| **Adviesverloop** | De voortgang van een Organisatie of Onderdeel door de zes fasen, met de shortlist en de gedane stappen |
| **Gekoppelde Meting** | Een Meting die bij het adviesverloop hoort, met een vrij label zoals "Nulmeting", "Tussenmeting" of "Eindmeting". Minstens één per adviesverloop |
| **Peilmeting** | De gekoppelde Meting waarvan de scores de shortlist en het contextblok bepalen |
| **Fase** | Een van de zes fasen: Acquireren & Starten, Offreren & Overeenkomen, Onderzoeken & Beeldvormen, Oplossen & Ontwerpen, Implementeren, Evalueren & Afronden |
| **Use case** | Een taak binnen een fase, bijvoorbeeld "Brainstormen en alternatieven verkennen". Heeft een titel, een omschrijving, apps en per rol een prompt |
| **Stap** | Een use case die in dit adviesverloop is opgepakt. De fasestrook telt stappen |
| **Shortlist** | De bouwstenen die de Consultant met de klant wil bespreken |
| **Contextblok** | De tekst met gegevens uit de peilmeting die bij de prompt hoort |
| **Rol** | De positie van de Consultant bij deze klant: Consultant, Salesmanager of Teamleider (interim) |

## Waar het adviesverloop staat

| Plek | Wie | Wat |
|---|---|---|
| Resultaten, tab Metingen | Admin (alle), Consultant (eigen) | Een kolom Adviesverloop met de huidige fase en de voortgang van het adviesverloop waar de Meting bij hoort, bijvoorbeeld "Oplossen · 0 van 4" |
| Meting-overzicht (`beheerpagina.md`, punt 5) | Admin (alle), Consultant (eigen) | Een kaart bovenaan. Hoort de Meting bij een adviesverloop, dan met de fasestrook in klein formaat en de knop "Adviesverloop openen". Anders met "Koppelen" aan het lopende adviesverloop van de Organisatie, of "Adviesverloop starten" |
| Organisatie-detail | Admin (alle), Consultant (eigen) | Een blok Adviesverloop met per Onderdeel één regel met de huidige fase, het aantal gekoppelde Metingen en de status |
| Pagina Adviesverloop | Admin (alle), Consultant (eigen) | De schermen hieronder. Kruimelpad: Organisaties › {Organisatie} › Adviesverloop |
| Assessments, tab Adviescatalogus | Admin | Het beheer van fasen, use cases, rollen en prompts (punt 17 in `beheerpagina.md`) |

Het adviesverloop bestaat pas als een Consultant het vanaf een Meting voor het eerst opent. Die Meting wordt de eerste gekoppelde Meting. Een Meting zonder afgeronde scans kan geen adviesverloop starten: De knop is dan uitgeschakeld, met de reden in een Info-icoon. Per Organisatie en Onderdeel is er hoogstens één lopend adviesverloop. Opent een Consultant een andere Meting van dezelfde Organisatie en hetzelfde Onderdeel, dan stelt de app voor die te koppelen aan het lopende adviesverloop.

## Metingen in het adviesverloop

Een adviesverloop heeft minstens één gekoppelde Meting. De Consultant kan er Metingen van dezelfde Organisatie en hetzelfde Onderdeel bij koppelen en weer loskoppelen, behalve de laatste. Bij het koppelen kan een label worden ingevuld, met als suggesties Nulmeting, Tussenmeting en Eindmeting. Het label is vrij en de app vraagt er niet om: Er is geen vaste volgorde en geen vast aantal. De volgorde in de tijd volgt de meetdatum.

De **peilmeting** levert de scores. Standaard is dat de meest recente gekoppelde Meting met afgeronde scans, en de Consultant kan een andere kiezen. Zijn er meer gekoppelde Metingen van hetzelfde Assessment, dan staat bij elke bouwsteen op de shortlist ook het verschil met de eerste gekoppelde Meting, bijvoorbeeld "+0,4 sinds de eerste Meting".

**Welke Metingen.** Een gewone Meting en een samengestelde Meting kunnen allebei gekoppeld worden. Een samengestelde Meting voldoet aan de eis van afgeronde scans als haar onderliggende Metingen voldoen (`benchmark.md`, Samengestelde Meting). Een Meting van een ander Assessment dan de eerste gekoppelde Meting kan alleen gekoppeld worden als de Organisatie lid is van een benchmark waarin beide Assessments zitten (`benchmark.md`, Benchmark per Assessment). Scores van verschillende Assessments worden nooit gemengd: Het verschil per bouwsteen sinds de eerste Meting verschijnt alleen tussen Metingen van hetzelfde Assessment.

**Modals voor de Metingen.** Beide keuzes hergebruiken het patroon van de modal "Meting voor de radar" uit het Dossier (`dossier.md`, Scores in de radar): `.modal-box` van 560px, per Meting een rij met de datum, het aantal afgeronde scans en bij een Meting die niet te kiezen is de reden in grijs, onderaan Annuleren en Opslaan.

- **Peilmeting kiezen.** Een keuzerondje "Automatisch (meest recent)" met de hint welke Meting dat nu is (de standaard, `peilMetingId: null`) en per gekoppelde Meting een keuzerondje "Handmatig: {label of Meting}". Een Meting zonder afgeronde scans staat er uitgeschakeld.
- **Metingen koppelen.** Dezelfde opbouw met een selectievakje per Meting in plaats van een keuzerondje. De lijst toont de Metingen van de Organisatie en het Onderdeel, gegroepeerd per Assessment, met de reeds gekoppelde Metingen aangevinkt. Achter elke aangevinkte Meting staat een optioneel veld Label (placeholder "Bijvoorbeeld Tussenmeting"). Niet te kiezen, met de reden erbij: een Meting zonder afgeronde scans ("Nog geen afgeronde scans"), een Meting die bij een ander adviesverloop hoort ("Hoort bij een ander adviesverloop"), een Meting van een ander Assessment zonder benchmark waarin beide Assessments zitten ("Geen benchmark met beide Assessments") en de laatste gekoppelde Meting ("Minstens één Meting"). De knop "Koppelen" in het Meting-overzicht opent deze modal met die Meting aangevinkt.

**Afronden en verwijderen.** De Consultant kan het adviesverloop afronden. Het blijft dan leesbaar, en een nieuw traject begint met een nieuw adviesverloop. Een Admin en een Consultant (voor een Organisatie die hij zelf heeft aangemaakt of die aan hem is toegewezen) kunnen het adviesverloop ook verwijderen. De bevestiging noemt het aantal gedane stappen en zegt dat de Metingen blijven bestaan en dat verwijderen niet ongedaan kan worden gemaakt.

## De fasestrook

De fasestrook staat op elk scherm van het adviesverloop onder de nav, blijft bij scrollen in beeld (`position: sticky`) en bestaat uit:

- **Het blok Scan**, uiterst links, met de tekst "Scan" en eronder "{label of Meting} {maand jaar} · afgerond" voor de peilmeting, of bij meer gekoppelde Metingen "{n} Metingen · peil {maand jaar}". Een klik opent een klein paneel met de gekoppelde Metingen (label, datum, link naar de resultaten) en twee knoppen: "Peilmeting kiezen" en "Metingen koppelen". Beide openen een modal (zie Modals voor de Metingen). Het staat voor de fasen met een pijl ertussen, omdat de scan geen fase is maar de ingang.
- **De zes fasen**, elk met een dunne balk die vult naar het aandeel gedane stappen, een nummercirkel (24px), de korte naam en de telling "{gedaan} van {totaal}".
- **De status van een fase**: Klaar als alle stappen van de fase gedaan zijn (cirkel gevuld in `--or` met een vinkje), huidig is de eerste fase met een open stap (cirkel met `--or` rand, de naam in gewicht 800), de overige zijn nog niet begonnen (grijze rand).
- **Het uitklappaneel.** Een klik op een fase opent een paneel onder de strook met links de fase en de telling, in het midden de gedane stappen en rechts de volgende stap als knop. Elke gedane stap is één regel met de titel, wat er gedaan is ("Prompt gekopieerd" of "Gemarkeerd als gedaan"), de datum en de code van de use case. Een fase zonder gedane stappen toont "Hier is nog niets gedaan". Een klik op dezelfde fase of op Sluiten sluit het paneel.

Welke use cases meetellen als stap in de strook, stelt een Admin per use case in (`inStrook`, `datamodel.md`). Een andere use case is wel te gebruiken, maar telt niet mee.

## Scherm Adviesverloop (shortlist)

Opbouw van boven naar beneden:

1. **Kruimelpad en kop.** Eyebrow "Adviesverloop", titel de naam van de Organisatie, subregel "{Onderdeel of Hele organisatie} · {n} Metingen · peil {label of Meting} {maand jaar}". Rechts de knop "Alle resultaten bekijken".
2. **Kaart Shortlist voor het gesprek.** Titel met Info-icoon, subregel "{n} bouwstenen: De drie laagste scores" met bij toegevoegde bouwstenen "en {m} toegevoegd". Rechts de knop "Bouwsteen toevoegen".
3. **Rijen.** Per bouwsteen een rij met links de kleine ring (`.score-ring--mini`, 44px, volle scorekleur), dan eyebrow "Bouwsteen {nr} · {categorie}", de naam in 18px gewicht 800 en daaronder het verschil met de benchmark en de spreiding. Rechts de klassenchip in de klassekleur (`stylesheet.md`, Scorekleuren) en de knop "Bekijk in resultaten". Een toegevoegde bouwsteen heeft er ook de knop "Verwijderen" bij.
4. **Voet.** Links "De drie laagste scores staan er standaard in." en rechts de knop "Uitwerken", die naar de uitwerking van de eerste bouwsteen gaat.

**Standaard.** De shortlist begint met de bouwstenen met de laagste scores. Het aantal is een instelling (`shortlistAantal`, standaard 3, punt 10 in `beheerpagina.md`). Bij gelijke scores wint de bouwsteen met het laagste nummer. De drie bouwstenen kunnen niet verwijderd worden, wel aangevuld.

**Bouwsteen toevoegen.** Een modal (patroon Overzichtsmodal, `stylesheet.md`) met alle andere bouwstenen, van laag naar hoog. Per rij een selectievakje, de nummercirkel in de categoriekleur, naam en categorie, de score en de klassenchip. Onderaan de telling en de knop "Klaar". Het doel is een open deur: Een bouwsteen die goed scoort, maar waar de Consultant de klant graag over wil spreken.

**Scores.** Het adviesverloop gebruikt de scores van de peilmeting zoals de resultatenpagina ze toont, met dezelfde afronding en klassen (`CLAUDE.md`, Scoringslogica). Bij een samengestelde Meting zijn dat de gemiddelden van de samenstelling.

## Scherm Uitwerking per bouwsteen

Opent met "Uitwerken" en toont de gekozen bouwstenen als pilgroep bovenaan (`.pil`, 32px), met rechts "Bouwstenen wijzigen". Onder de pilgroep, per gekozen bouwsteen:

- **Resultaatkop.** Dezelfde opbouw als de Resultaatkop in `stylesheet.md`: De ring (128px, score in 32px gewicht 700, label SCORE), eyebrow "Bouwsteen {nr} · {categorie}" in `--or`, de naam als titel, de klassenchip met de uitleg van de klasse (`CLAUDE.md`, Classificatie) en de feiten Benchmark, Spreiding en Vragen.
- **Kaart van de huidige fase.** Titel de naam van de fase met Info-icoon. Per use case een rij met een rond icoon (48px, `--or-faint`, icoon in `--or`), eyebrow "{Fase} · {code}", de titel, de omschrijving en een chip per app (Copilot, Word, Excel, PowerPoint). Rechts de knop "Prompt klaarzetten". Welke use cases verschijnen, volgt uit de catalogus: Alle use cases van de fase, en bij een bouwsteen eerst de use cases die voor die bouwsteen of klasse zijn voorgesteld.
- **Kaart Dossier bij deze bouwsteen.** De Dossieritems van de Organisatie die aan deze bouwsteen zijn gekoppeld (`dossier.md`), in dezelfde rijopmaak, met de status "Zichtbaar voor klant" of "Intern". Rechts de knop "Naar Dossier".

## Prompt klaarzetten

Een modal (760px) met de eyebrow "{Fase} · {code}", de titel van de use case en de subregel met Organisatie, Onderdeel en peilmeting. De modal heeft drie genummerde delen en de voet met "Annuleren" (omlijnd) en "Kopiëren" (gevuld).

1. **Wie ben jij bij deze klant.** Een pilgroep met de rol (Consultant, Salesmanager, Teamleider (interim)) en daaronder een tekstveld. Het veld is vooraf gevuld met een standaardtekst per rol en bedoeld om in de eigen woorden van de Consultant aan te passen: Wie je kent, hoe je samenwerkt en wat je kunt doen. De rol en de tekst blijven bewaard bij het adviesverloop, zodat ze niet opnieuw getypt hoeven te worden.
2. **Waar werk je aan.** Het contextblok, gevuld uit de peilmeting en bewerkbaar. Eronder twee regels chips: Meegenomen (Gemiddelde scores, Benchmark, KPI's Algemeen, Kenmerken) en Niet meegenomen (Antwoorden per persoon, Namen, Groepen onder de minimale groepsgrootte).
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

Het contextblok wordt door de app samengesteld uit de peilmeting en bevat:

- Het Assessment, de peilmeting met haar label, de Organisatie, het Onderdeel en het aantal afgeronde scans.
- Bij meer gekoppelde Metingen van hetzelfde Assessment de scores van de eerste gekoppelde Meting, zodat Copilot het verloop kan benoemen.
- De scores van de bouwsteen waar het om gaat en van de andere bouwstenen op Basis op orde, met klasse, benchmark en spreiding.
- De sterke punten.
- De KPI's van de Organisatie die in `datamodel.md` (KPI's en kanalen) als Algemeen zijn ingevuld.
- De Kenmerken van de Organisatie die geen persoonsgegevens zijn.

Wat er niet in zit: Antwoorden per persoon, namen van Respondenten, opmerkingen van Respondenten en gegevens van groepen die onder de minimale groepsgrootte vallen. De Consultant ziet het blok altijd voor het gekopieerd wordt en kan het aanpassen.

## Rechten en audit

De rechten staan in `datamodel-rollen.md`, Rechtenmatrix: `adviesverloop.bekijken` en `adviesverloop.bewerken` voor een Admin (alle) en een Consultant (eigen), en `adviesverloop.catalogus` alleen voor een Admin. Verwijderen valt onder `adviesverloop.verwijderen`, voor een Admin (alle) en een Consultant (eigen). Het audit-log krijgt de gebeurtenissen `adviesstap.gedaan`, `adviesverloop.shortlistGewijzigd`, `adviesverloop.metingGekoppeld`, `adviesverloop.statusGewijzigd`, `adviesverloop.verwijderd` en `adviescatalogus.gewijzigd`.

## Beheer

De Admin beheert de catalogus onder Assessments, tab Adviescatalogus (punt 17 in `beheerpagina.md`), en stelt het aantal bouwstenen in de shortlist in onder Instellingen, Drempels en termijnen (punt 10). De Info-teksten van het adviesverloop zijn Algemene teksten (punt 2a), met een initiële waarde.

De use cases voor de eerste inrichting komen uit de Boks-app en staan in `content-adviesverloop.md`: Zes fasen, per fase een lijst use cases, per use case de apps en per rol een context en een prompt. De rollen zijn Consultant, Salesmanager en Teamleider (interim).

## Hulp

Het adviesverloop krijgt een helpbestand voor de Consultant in `help/` (`help.md`, Actueel houden).

## Open punten

- Welke benchmark telt voor een Meting van een ander Assessment als de Organisatie in meerdere benchmarks zit.
- Of de catalogus onder Assessments hoort, of een eigen tab onder Instellingen krijgt, omdat een use case niet aan één Assessment hangt.
- De minimale groepsgrootte voor het contextblok. Het datamodel kent nu geen drempel voor het aantal afgeronde scans waaronder gegevens niet naar Copilot gaan.
- Welke stappen per fase meetellen in de fasestrook. Het ontwerp telt drie of vier per fase.
- Of "Markeer als gedaan" met een link voldoende is, of dat de app het document zelf moet kunnen terugvinden.
- Of een Admin in Verkennen wil zien welke use cases het meest gebruikt worden.
- Of de rollen (Consultant, Salesmanager, Teamleider) aan de Gebruiker gekoppeld worden of per adviesverloop gekozen blijven.
- De teksten van de standaard-rollen en van de prompts moeten door een Consultant gelezen worden.
