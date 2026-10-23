# Coniche Scan: Adviesverloop

Het adviesverloop is de plek waar een Consultant, na een afgeronde Meting, het adviesproces met een klant doorloopt. Het adviesverloop hoort bij de Organisatie (of een Onderdeel daarvan) en heeft minstens één Meting als bron. In de loop van het traject kunnen er Metingen bijkomen. De scan levert de inzichten, het adviesverloop helpt om daar de juiste gesprekken en vervolgstappen aan te koppelen, met Copilot als hulpmiddel. Dit bestand beschrijft de schermen, de regels en de aansluiting op de rest van de app. Het datamodel staat in `datamodel.md`, de rechten in `datamodel-rollen.md`, de beheerschermen in `beheerpagina.md` en de koppeling met Copilot en SharePoint in `copilot-koppeling.md`. Alle opmaak staat in `stylesheet.md`.

## Uitgangspunten

- Het adviesverloop hoort bij een Organisatie en een Onderdeel (of de hele Organisatie), niet bij een Meting. Een Meting is de aanleiding. Er is altijd minstens één gekoppelde Meting, en er kunnen er meer bijkomen, bijvoorbeeld een tussenmeting of een eindmeting. Die namen zijn voorbeelden en geen vaste indeling.
- De scores van de peilmeting bepalen de standaard-shortlist. Standaard is dat de meest recente gekoppelde Meting.
- De Consultant bepaalt wat relevant is. Hij kiest zelf welke bouwstenen op de shortlist staan en in welke volgorde, en kan een fase overslaan of een use case niet van toepassing verklaren. De uitwerking, de prompts en het contextblok gaan over de gekozen bouwstenen en over de sector en het Onderdeel van de Organisatie, niet over de hele scan.
- De context van de Consultant zelf ("Over mij" en zijn rollen) staat in Mijn account en wordt in het adviesverloop alleen gekozen en niet opnieuw getypt.
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
| **Shortlist** | De bouwstenen die de Consultant met de klant wil bespreken, in de volgorde waarin hij ze wil uitwerken. Standaard de laagste scores |
| **Niet van toepassing (n.v.t.)** | Een fase die wordt overgeslagen of een use case die de Consultant voor deze klant niet nodig heeft. Telt niet mee in de voortgang |
| **Adviescontext** | De persoonlijke tekst "Over mij" en de rollen van een Consultant, in Mijn account |
| **Contextblok** | De tekst met gegevens uit de peilmeting die bij de prompt hoort |
| **Rol** | De positie van de Consultant bij een klant, met een eigen tekst. De Consultant beheert zijn rollen in Mijn account en kiest er in het adviesverloop een. Beginwaarden: Consultant, Salesmanager en Teamleider (interim) |

## Waar het adviesverloop staat

| Plek | Wie | Wat |
|---|---|---|
| Resultaten, tab Metingen | Admin (alle), Consultant (eigen) | Een kolom Adviesverloop met de huidige fase en de voortgang van het adviesverloop waar de Meting bij hoort, bijvoorbeeld "Oplossen · 0 van 4" |
| Meting-overzicht (`beheerpagina.md`, punt 5) | Admin (alle), Consultant (eigen) | Een kaart bovenaan. Hoort de Meting bij een adviesverloop, dan met de fasestrook in klein formaat en de knop "Adviesverloop openen". Anders met "Koppelen" aan het lopende adviesverloop van de Organisatie, of "Adviesverloop starten" |
| Organisatie-detail | Admin (alle), Consultant (eigen) | Een kaart Adviesverloop (`beheerpagina.md`, punt 4) met per Onderdeel één rij met de huidige fase, het aantal gekoppelde Metingen en de status |
| Pagina Adviesverloop | Admin (alle), Consultant (eigen) | De schermen hieronder. Kruimelpad: Organisaties › {Organisatie} › Adviesverloop |
| Assessments, tab Adviescatalogus | Admin | Het beheer van fasen, use cases, rollen en prompts (punt 17 in `beheerpagina.md`) |
| Mijn account, tab Adviescontext | Admin, Consultant (alleen eigen) | "Over mij" en de eigen rollen met tekst (zie Adviescontext hieronder) |

Het adviesverloop bestaat pas als een Consultant het vanaf een Meting voor het eerst opent. Die Meting wordt de eerste gekoppelde Meting. Een Meting zonder afgeronde scans kan geen adviesverloop starten: De knop is dan uitgeschakeld, met de reden in een Info-icoon. Per Organisatie en Onderdeel is er hoogstens één lopend adviesverloop. Opent een Consultant een andere Meting van dezelfde Organisatie en hetzelfde Onderdeel, dan stelt de app voor die te koppelen aan het lopende adviesverloop.

## Metingen in het adviesverloop

Een adviesverloop heeft minstens één gekoppelde Meting. De Consultant kan er Metingen van dezelfde Organisatie en hetzelfde Onderdeel bij koppelen en weer loskoppelen, behalve de laatste. Bij het koppelen kan een label worden ingevuld, met als suggesties Nulmeting, Tussenmeting en Eindmeting. Het label is vrij en de app vraagt er niet om: Er is geen vaste volgorde en geen vast aantal. De volgorde in de tijd volgt de meetdatum.

De **peilmeting** levert de scores. Standaard is dat de meest recente gekoppelde Meting met afgeronde scans, en de Consultant kan een andere kiezen. Zijn er meer gekoppelde Metingen van hetzelfde Assessment, dan staat bij elke bouwsteen op de shortlist ook het verschil met de eerste gekoppelde Meting, bijvoorbeeld "+0,4 sinds de eerste Meting".

**Welke Metingen.** Een gewone Meting en een samengestelde Meting kunnen allebei gekoppeld worden. Een samengestelde Meting voldoet aan de eis van afgeronde scans als haar onderliggende Metingen voldoen (`benchmark.md`, Samengestelde Meting). Een Meting van een ander Assessment dan de eerste gekoppelde Meting kan alleen gekoppeld worden als de Organisatie lid is van een benchmark waarin beide Assessments zitten (`benchmark.md`, Benchmark per Assessment). Scores van verschillende Assessments worden nooit gemengd: Het verschil per bouwsteen sinds de eerste Meting verschijnt alleen tussen Metingen van hetzelfde Assessment.

**Modals voor de Metingen.** Beide keuzes hergebruiken het patroon van de modal "Meting voor de radar" uit het Dossier (`dossier.md`, Scores in de radar): `.modal-box` van 560px, per Meting een rij met de datum, het aantal afgeronde scans en bij een Meting die niet te kiezen is de reden in grijs, onderaan Annuleren en Opslaan.

- **Peilmeting kiezen.** Een keuzerondje "Automatisch (meest recent)" met de hint welke Meting dat nu is (de standaard, `peilMetingId: null`) en per gekoppelde Meting een keuzerondje "Handmatig: {label of Meting}". Een Meting zonder afgeronde scans staat er uitgeschakeld.
- **Metingen koppelen.** Dezelfde opbouw met een selectievakje per Meting in plaats van een keuzerondje. De lijst toont de Metingen van de Organisatie en het Onderdeel, gegroepeerd per Assessment, met de reeds gekoppelde Metingen aangevinkt. Achter elke aangevinkte Meting staat een optioneel veld Label (placeholder "Bijvoorbeeld Tussenmeting"). Niet te kiezen, met de reden erbij: een Meting zonder afgeronde scans ("Nog geen afgeronde scans"), een Meting die bij een ander adviesverloop hoort ("Hoort bij een ander adviesverloop"), een Meting van een ander Assessment als er geen Benchmark is waarin de Organisatie en beide Assessments zitten ("Geen benchmark met beide Assessments") en de laatste gekoppelde Meting ("Minstens één Meting"). De knop "Koppelen" in het Meting-overzicht opent deze modal met die Meting aangevinkt.

- **Benchmark kiezen.** Vink je in Metingen koppelen een Meting van een ander Assessment aan, en zit de Organisatie in meer dan één Benchmark waarin beide Assessments zitten, dan opent op dezelfde manier de modal "Benchmark voor de koppeling": 560px, een keuzerondje per Benchmark met de naam, het aantal leden en de Assessments, met de Benchmark die al gekozen is voorgeselecteerd. Is er maar één geschikte Benchmark, dan wordt die zonder modal gebruikt en staat de naam als hint onder de Meting. De keuze wordt bewaard bij het adviesverloop (`benchmarkId`, `datamodel.md`).

**Afronden en verwijderen.** De Consultant kan het adviesverloop afronden. Het blijft dan leesbaar, en een nieuw traject begint met een nieuw adviesverloop. Een Admin en een Consultant (voor een Organisatie die hij zelf heeft aangemaakt of die aan hem is toegewezen) kunnen het adviesverloop ook verwijderen. De bevestiging noemt het aantal gedane stappen en zegt dat de Metingen blijven bestaan en dat verwijderen niet ongedaan kan worden gemaakt.

## De fasestrook

De fasestrook staat op elk scherm van het adviesverloop onder de nav, blijft bij scrollen in beeld (`position: sticky`) en bestaat uit:

- **Het blok Scan**, uiterst links, met de tekst "Scan" en eronder "{label of Meting} {maand jaar} · afgerond" voor de peilmeting, of bij meer gekoppelde Metingen "{n} Metingen · peil {maand jaar}". Een klik opent een klein paneel met de gekoppelde Metingen (label, datum, link naar de resultaten) en twee knoppen: "Peilmeting kiezen" en "Metingen koppelen". Beide openen een modal (zie Modals voor de Metingen). Het staat voor de fasen met een pijl ertussen, omdat de scan geen fase is maar de ingang.
- **De zes fasen**, elk met een dunne balk die vult naar het aandeel gedane stappen, een nummercirkel (24px), de korte naam en de telling "{gedaan} van {totaal}".
- **De status van een fase**: Klaar als alle stappen van de fase gedaan zijn (cirkel gevuld in `--or` met een vinkje), huidig is de eerste fase met een open stap (cirkel met `--or` rand, de naam in gewicht 800), de overige zijn nog niet begonnen (grijze rand).
- **Het uitklappaneel.** Een klik op een fase opent een paneel onder de strook met links de fase en de telling, in het midden de gedane stappen en rechts de volgende stap als knop. Elke gedane stap is één regel met de titel, wat er gedaan is ("Prompt gekopieerd" of "Gemarkeerd als gedaan"), de datum en de code van de use case. Een fase zonder gedane stappen toont "Hier is nog niets gedaan". Een klik op dezelfde fase of op Sluiten sluit het paneel.

Welke use cases meetellen als stap in de strook, stelt een Admin per use case in (`inStrook`, `datamodel.md`). Een andere use case is wel te gebruiken, maar telt niet mee.

**Overslaan en niet van toepassing.** Niet elke fase en niet elke use case past bij elke klant, en de Consultant kan dat zelf aangeven:

- **Fase overslaan.** In het uitklappaneel staat rechtsonder de knop "Fase overslaan" (omlijnd, 40px), bij een overgeslagen fase "Fase weer meenemen". Een overgeslagen fase toont in de strook de telling "Overgeslagen" in grijs, zonder gevulde balk en zonder vinkje, en het paneel zegt "Deze fase telt niet mee." De fase kan nog steeds geopend worden.
- **Use case n.v.t.** Bij elke stap in het uitklappaneel staat een tekstknop "Niet van toepassing" (bij een n.v.t. stap "Weer meenemen"). Een n.v.t. stap staat in grijs, doorgestreept, met de bol als stippellijn en de regel "Niet van toepassing". De knop ontbreekt bij een stap die al gedaan is. Wie die toch n.v.t. wil verklaren, zet hem eerst terug naar open.
- **Tellingen.** N.v.t. stappen en overgeslagen fasen tellen niet mee in "{gedaan} van {totaal}". Het paneel noemt het aantal: "2 van 3 stappen gedaan · 1 niet van toepassing". Een fase waarvan alle stappen n.v.t. zijn, toont "n.v.t." als telling.
- **Huidige fase.** De eerste fase die niet is overgeslagen en nog een open stap heeft. De knop "Volgende stap" slaat n.v.t. stappen over.
- **In de uitwerking.** Een n.v.t. use case verschijnt niet in de kaart van de huidige fase. Een overgeslagen fase heeft in de uitwerking geen use cases, wel een regel met de knop "Fase weer meenemen".
- **Wat de app niet doet.** Er is geen reden en geen toelichting nodig. De keuze geldt alleen voor dit adviesverloop en niet voor de catalogus.

## Scherm Adviesverloop (shortlist)

Opbouw van boven naar beneden:

1. **Kruimelpad en kop.** Eyebrow "Adviesverloop", titel de naam van de Organisatie, subregel "{Onderdeel of Hele organisatie} · {Sector} · {n} Metingen · peil {label of Meting} {maand jaar}". Rechts de knop "Alle resultaten bekijken".
2. **Jouw rol bij deze klant.** Een regel met een pilgroep (`.pil`, 32px) met de rollen uit Mijn account, de voorgeselecteerde is de standaardrol, en rechts de link "Aanpassen in Mijn account", die de modal Mijn account opent op de tab Adviescontext. De gekozen rol staat bij het adviesverloop (`rolId`) en geldt voor alle prompts.
3. **Kaart Shortlist voor het gesprek.** Titel met Info-icoon, subregel "{n} bouwstenen: De drie laagste scores." zolang de shortlist de standaard is, en anders "{n} bouwstenen. Jij bepaalt wat erop staat en wat eerst komt." Rechts de knop "Bouwstenen kiezen".
4. **Rijen.** Per bouwsteen een rij met links een volgnummer en twee pijltjes (omhoog en omlaag, uitgeschakeld aan de uiteinden), dan de kleine ring (`.score-ring--mini`, 44px, volle scorekleur), eyebrow "Bouwsteen {nr} · {categorie}", de naam in 18px gewicht 800 en daaronder het verschil met de benchmark, de spreiding en bij een bouwsteen die niet bij de laagste scores hoort "Door jou toegevoegd". Rechts de klassenchip in de klassekleur (`stylesheet.md`, Scorekleuren) en de knop "Bekijk in resultaten". Er is geen knop "Verwijderen" op de rij: Weghalen gaat met de selectievakjes in Bouwstenen kiezen.
5. **Lege shortlist.** Staat er niets op, dan toont de kaart "Er staat niets op de shortlist. Kies minstens één bouwsteen om te kunnen uitwerken." en is "Uitwerken" uitgeschakeld.
6. **Voet.** Links "De drie laagste scores staan er standaard in. Met de pijltjes bepaal je wat eerst komt." (bij een eigen lijst: "Eerst bovenaan. De uitwerking en de prompts gaan over deze bouwstenen."), daarnaast de tekstknop "Standaard herstellen" zolang de lijst afwijkt, en rechts de knop "Uitwerken", die naar de uitwerking van de eerste bouwsteen gaat.

**Standaard.** De shortlist begint met de bouwstenen met de laagste scores. Het aantal is een instelling (`shortlistAantal`, standaard 3, punt 10 in `beheerpagina.md`). Bij gelijke scores wint de bouwsteen met het laagste nummer. De Consultant mag de lijst daarna vrij aanpassen (zie Bouwstenen kiezen): Er is geen verplicht minimum, behalve voor "Uitwerken".

**Bouwstenen kiezen.** Een modal (patroon Overzichtsmodal, `stylesheet.md`) met alle bouwstenen, van laag naar hoog score, met de huidige keuze aangevinkt. Per rij een selectievakje, de nummercirkel in de categoriekleur, naam en categorie, de score en de klassenchip. Bovenin de uitleg "Vink aan wat je wilt bespreken en haal weg wat niet past." Onderaan de telling ("{n} bouwstenen gekozen.") en de knop "Klaar". Een aangevinkte bouwsteen komt achteraan op de lijst, een uitgevinkte verdwijnt eruit. De volgorde bepaalt de Consultant op het scherm zelf met de pijltjes. Het doel van meer kiezen dan de laagste scores is een open deur: Een bouwsteen die goed scoort, maar waar de Consultant de klant graag over wil spreken.

**Scores.** Het adviesverloop gebruikt de scores van de peilmeting zoals de resultatenpagina ze toont, met dezelfde afronding en klassen (`CLAUDE.md`, Scoringslogica). Bij een samengestelde Meting zijn dat de gemiddelden van de samenstelling.

## Scherm Uitwerking per bouwsteen

Opent met "Uitwerken" en toont de gekozen bouwstenen in de gekozen volgorde als pilgroep bovenaan (`.pil`, 32px), met rechts "Bouwstenen wijzigen" (dezelfde modal als Bouwstenen kiezen). Onder de pilgroep, per gekozen bouwsteen:

- **Resultaatkop.** Dezelfde opbouw als de Resultaatkop in `stylesheet.md`: De ring (128px, score in 32px gewicht 700, label SCORE), eyebrow "Bouwsteen {nr} · {categorie}" in `--or`, de naam als titel, de klassenchip met de uitleg van de klasse (`CLAUDE.md`, Classificatie) en de feiten Benchmark, Spreiding en Vragen.
- **Kaart van de huidige fase.** Titel de naam van de fase met Info-icoon. Per use case een rij met een rond icoon (48px, `--or-faint`, icoon in `--or`), eyebrow "{Fase} · {code}", de titel, de omschrijving en een chip per app (Copilot, Word, Excel, PowerPoint). Rechts de knop "Prompt klaarzetten". Welke use cases verschijnen, volgt uit de catalogus: Alle use cases van de fase die niet n.v.t. zijn verklaard, en bij een bouwsteen eerst de use cases die voor die bouwsteen of klasse zijn voorgesteld.
- **Kaart Dossier bij deze bouwsteen.** De Dossieritems van de Organisatie die aan deze bouwsteen zijn gekoppeld (`dossier.md`), in dezelfde rijopmaak, met de status "Zichtbaar voor klant" of "Intern". Rechts de knop "Naar Dossier".

## Prompt klaarzetten

Een modal (760px) met de eyebrow "{Fase} · {code}", de titel van de use case en de subregel met Organisatie, Onderdeel en peilmeting. De modal heeft drie genummerde delen en de voet met "Annuleren" (omlijnd) en "Kopiëren" (gevuld).

1. **Wie ben jij bij deze klant.** Een pilgroep met de rollen uit Mijn account (de gekozen rol is voorgeselecteerd) en daaronder de tekst van die rol, zodat de Consultant ziet wat er meegaat. Het veld is bewerkbaar voor deze ene prompt, de wijziging verandert de tekst in Mijn account niet. Vooraan in de prompt staat eerst "Over mij" en dan de tekst van de rol. De link "Aanpassen in Mijn account" opent de modal.
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

Het contextblok wordt door de app samengesteld uit de peilmeting en richt zich op de gekozen bouwsteen en de sector van de Organisatie. Het bevat:

- Het Assessment, de peilmeting met haar label, de Organisatie, het Onderdeel, de sector en subsector, en het aantal afgeronde scans.
- Bij meer gekoppelde Metingen van hetzelfde Assessment de scores van de eerste gekoppelde Meting, zodat Copilot het verloop kan benoemen.
- De scores van de bouwsteen waar het om gaat, met klasse, benchmark en spreiding, en de andere bouwstenen op de shortlist. Bouwstenen die niet op de shortlist staan komen er niet in, ook niet als ze laag scoren.
- De sterke punten die op de shortlist staan.
- De KPI's van de Organisatie die in `datamodel.md` (KPI's en kanalen) als Algemeen zijn ingevuld.
- De Kenmerken van de Organisatie die geen persoonsgegevens zijn.

Wat er niet in zit: Antwoorden per persoon, namen van Respondenten, opmerkingen van Respondenten, gegevens van groepen die onder de minimale groepsgrootte vallen en bouwstenen buiten de shortlist. De Consultant ziet het blok altijd voor het gekopieerd wordt en kan het aanpassen.

## Rechten en audit

De rechten staan in `datamodel-rollen.md`, Rechtenmatrix: `adviesverloop.bekijken` en `adviesverloop.bewerken` voor een Admin (alle) en een Consultant (eigen), en `adviesverloop.catalogus` alleen voor een Admin. Verwijderen valt onder `adviesverloop.verwijderen`, voor een Admin (alle) en een Consultant (eigen). Het audit-log krijgt de gebeurtenissen `adviesstap.gedaan`, `adviesverloop.shortlistGewijzigd` (ook voor een gewijzigde volgorde), `adviesverloop.metingGekoppeld`, `adviesverloop.statusGewijzigd`, `adviesverloop.verwijderd` en `adviescatalogus.gewijzigd`. De adviescontext in Mijn account is persoonlijk en heeft geen aparte rechten: Een Admin en een Consultant bewerken alleen hun eigen, en dat komt niet in het audit-log.

## Adviescontext in Mijn account

De Consultant vult zijn context eenmaal in, in plaats van bij elk adviesverloop opnieuw. Dit is een tab in de bestaande modal Mijn account (`beheerpagina.md`, Accountmenu), naast de tab Gegevens, voor Admin en Consultant. Alleen de eigenaar ziet en wijzigt zijn adviescontext.

- **Opbouw.** De modal "Mijn account" met onder de titel de pilgroep Gegevens | Adviescontext. De ondertitel zegt: "Je gegevens en de context die je in een adviesverloop gebruikt."
- **Over mij.** Een tekstveld (maximaal 600 tekens, met teller "{n} van 600 tekens") met een Info-icoon. Uitleg: "Deze tekst staat vooraan in elke prompt, vóór de rol. Schrijf het zoals je het aan een collega zou vertellen. Noem geen namen van klanten of personen."
- **Mijn rollen bij een klant.** Een lijst rollen, elk met een veld "Naam van de rol", een tekstveld "Tekst van de rol" (maximaal 600 tekens, met teller) en de acties "Standaard maken" en "Verwijderen". De standaardrol toont een chip "Standaard". "Verwijderen" ontbreekt bij de laatste rol. Onder de lijst de knop "Rol toevoegen" (een nieuwe rol heet "Nieuwe rol" met een lege tekst).
- **Uitleg bij de rollen** (Info-icoon): "Eenmaal invullen. In een adviesverloop kies je welke rol je bij die klant speelt. De tekst gaat mee in de prompt die je zelf naar Copilot kopieert, en wordt nergens anders gebruikt."
- **Voet.** "Alleen jij ziet deze gegevens en teksten." met Annuleren en Opslaan. Opslaan geldt voor beide tabs.
- **Beginwaarden.** Een nieuw profiel krijgt de rollen uit de catalogus (Consultant, Salesmanager en Teamleider (interim), `standaardTekst`) en een lege tekst bij Over mij.
- **Welke prompt bij een eigen rol.** Een rol die de Consultant zelf toevoegt gebruikt de prompt van de rol Consultant uit de catalogus (`adviesRolId: null`, `datamodel.md`). Alleen de tekst bij Wie ben jij is anders.
- **Privacy.** De teksten worden niet gelogd en niet gedeeld. Ze gaan alleen mee in de prompt die de Consultant zelf kopieert.

## Beheer

De Admin beheert de catalogus onder Assessments, tab Adviescatalogus (punt 17 in `beheerpagina.md`), en stelt het aantal bouwstenen in de shortlist in onder Instellingen, Drempels en termijnen (punt 10). De Info-teksten van het adviesverloop zijn Algemene teksten (punt 2a), met een initiële waarde.

De use cases voor de eerste inrichting komen uit de Boks-app en staan in `content-adviesverloop.md`: Zes fasen, per fase een lijst use cases, per use case de apps en per rol een context en een prompt. De rollen zijn Consultant, Salesmanager en Teamleider (interim).

## Hulp

Het adviesverloop krijgt een helpbestand voor de Consultant in `help/` (`help.md`, Actueel houden).

## Open punten

- Of de catalogus onder Assessments hoort, of een eigen tab onder Instellingen krijgt, omdat een use case niet aan één Assessment hangt.
- De minimale groepsgrootte voor het contextblok. Het datamodel kent nu geen drempel voor het aantal afgeronde scans waaronder gegevens niet naar Copilot gaan.
- Welke stappen per fase meetellen in de fasestrook. Het ontwerp telt drie of vier per fase.
- Of "Markeer als gedaan" met een link voldoende is, of dat de app het document zelf moet kunnen terugvinden.
- Of een Admin in Verkennen wil zien welke use cases het meest gebruikt worden.
- Of een zelf toegevoegde rol een eigen set prompts moet kunnen krijgen. Nu gebruikt die de prompt van de rol Consultant.
- Of een n.v.t.-keuze (fase of use case) in een volgend adviesverloop voor dezelfde Organisatie meegegeven moet worden.
- De teksten van de standaard-rollen en van de prompts moeten door een Consultant gelezen worden.
