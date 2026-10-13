# Coniche Scan: Rol / functie van de Respondent

De vaste lijst bij het veld "Rol / functie" van een Respondent. Dit bestand is de
enige plek voor de lijst zelf. De regels staan in `datamodel.md` (Respondent, Rol /
functie), `CLAUDE.md` (scherm 4, Respondent-intake) en `beheerpagina.md` (punt 6b,
Respondent bewerken). De lijst is aangeleverd door Sander op 12 oktober 2026.

**Status**: Besloten op 12 oktober 2026: Rol / functie wordt een keuzelijst met deze
waarden, in de intake, in "Mijn gegevens" en in beheer. Opgenomen in de specs, nog niet
gebouwd. In de app is het nu een vrij tekstveld. De punten onder 4 zijn open.

**Let op de naam.** Dit gaat over de functie van de persoon in zijn organisatie,
niet over een autorisatierol. Het bestand heet `content-respondentrol.md`, maar
`RespondentRol` in `datamodel.md` deel 2 is de Lead-rol (rechten). De twee hebben
niets met elkaar te maken. In de interface heet het veld "Rol / functie" en in de
code `functie`.

## 1. Waar het veld voorkomt

| Plek | Nu | Spec |
|---|---|---|
| Respondent-intake (de eerste keer) | Verplicht tekstveld "Rol / functie" | `CLAUDE.md`, scherm 4 |
| "Mijn gegevens" (Gegevens bekijken/wijzigen) | Hetzelfde formulier, vooringevuld | `CLAUDE.md`, scherm 4 |
| Beheer: Respondent bewerken, conflict oplossen, nieuwe Respondent | Tekstveld | `beheerpagina.md`, punt 6b |
| Import | Kolom uit het bronbestand | `import-scans.md` |
| CSV-export | Kolom `functie` | `export-csv.md` |

Het veld hoort bij de Respondent (niet bij de scan) en wordt bij een volgende
Meting hergebruikt. Het staat nooit in de audit-log (`datamodel.md`, Audit).

## 2. De lijst

29 rollen, in de volgorde van de aanlevering:

1. Klantenservicemedewerker
2. Tweedelijns medewerker / specialist
3. Back-office medewerker
4. Webcare-medewerker
5. Outbound / telesales-medewerker
6. Klachtenbehandelaar
7. Teamleider
8. Supervisor / floormanager
9. Operationeel manager
10. Contactcentermanager
11. Manager klantcontact
12. Directeur klantenservice
13. Workforce planner
14. Real-time / intraday planner
15. Kwaliteitscoach
16. Trainer
17. Kennismanager
18. Data-analist klantcontact
19. Business analist
20. Functioneel beheerder contactcenter
21. Applicatiebeheerder CRM
22. Conversation designer
23. CX-manager
24. Productowner klantcontact
25. AI Lead
26. IT-manager
27. IT-supportmedewerker
28. Marketingmanager
29. HR-adviseur

## 3. Hoe de app het gebruikt

Zelfde patroon als de keuzelijsten bij Techstack (`content-techstack.md`):

- Een keuzelijst met de 29 rollen in de aangeleverde volgorde, en "Anders…"
  onderaan met een invoerveld als de rol er niet bij staat.
- Een eigen invoer komt daarna in de lijst voor andere Respondenten, zonder aparte
  opslag. Een eigen invoer blijft alleen in de lijst zolang iemand hem gebruikt.
- De waarde blijft gewone tekst in `Respondent.functie`, dus import, CSV-export,
  verplaatsen en samenvoegen veranderen niet.
- Bestaande vrije tekst blijft staan en wordt vanzelf een extra keuze.

De keuzelijst zelf is besloten. De uitwerking hierboven (met "Anders…", eigen invoer in
de lijst) volgt het patroon van Techstack en is een voorstel. Er is nog niets van gebouwd.

## 4. Punten voor Joost

1. **Vaste lijst, vrije tekst of allebei.** De lijst vervangt het vrije tekstveld
   niet vanzelf. "Anders…" houdt het vrije veld open. Wil Coniche echt een vaste
   lijst (en dus een analyse per rol), dan moet "Anders…" er niet in.
2. **Verplicht of optioneel.** Het veld is nu verplicht in de intake, terwijl het
   privacy statement het veld "optioneel" noemt (`privacy-pagina.md`). Dat moet
   gelijk, ook bij een vaste lijst.
3. **Combinatielabels.** Vier rollen bevatten een schuine streep: "Tweedelijns
   medewerker / specialist", "Outbound / telesales-medewerker", "Supervisor /
   floormanager" en "Real-time / intraday planner". Is dat één keuze of twee? Zo
   gebouwd is het één keuze met de tekst zoals aangeleverd.
4. **Overlap.** "Teamleider", "Supervisor / floormanager", "Operationeel manager",
   "Contactcentermanager" en "Manager klantcontact" liggen dicht bij elkaar, net als
   "CX-manager" en "Productowner klantcontact". Voor een analyse per rol is een
   duidelijke definitie of een niveau nodig (uitvoerend, leidinggevend, staf).
5. **Niet alleen klantcontact.** Marketingmanager, HR-adviseur, IT-manager en
   IT-supportmedewerker staan er ook in. Bewust, en geldt dat voor alle Assessments
   (Klantcontact, AI en Zorg)?
6. **Zorgscan.** De lijst is klantcontact-specifiek. Bij de Zorgscan
   (`content-zorgscan.md`) zou je andere termen verwachten, zoals patiëntcontact of
   cliëntondersteuning. Eén lijst voor alle Assessments, of per Assessment (zoals
   de vragen dat al zijn)?
7. **Analyse per rol.** Nu is er geen spec die resultaten per rol uitsplitst
   (`backlog.md`, aggregatie en spreiding). Voor een uitsplitsing gelden dezelfde
   minimale groepsgrootte-regels als bij de benchmark (`benchmark.md`, Toestemming
   en privacy), omdat een functie met een klein team een persoon identificeert.
8. **Meerdere rollen.** Het veld is één waarde. Komt het voor dat iemand twee rollen
   heeft (bijvoorbeeld Teamleider en Trainer)? Dan past dat niet in dit veld.
9. **Beheerbaar maken.** De lijst staat nu niet in beheer. Hoort ze bij de
   organisatievelden (`beheerpagina.md`, punt 3) of bij Algemene teksten, zodat een
   Admin ze kan aanpassen zonder codewijziging?
