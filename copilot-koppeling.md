# Coniche Scan: Koppeling met Copilot en SharePoint

Hoe het adviesverloop (`adviesverloop.md`) Copilot kan gebruiken op de uitkomsten van de scan en op de content in het bedrijfsdomein. Dit bestand is een architectuurbeschrijving en een stappenplan, geen uitvoering. De keuzes waar de specs nog niets over zeggen, staan onderaan als open punt. Alle onderdelen van Microsoft 365 Copilot veranderen snel: Controleer de actuele mogelijkheden in de documentatie van Microsoft voordat een stap wordt gebouwd.

## Uitgangspunten

- De Consultant houdt de controle. Wat naar Copilot gaat, is eerst zichtbaar en aanpasbaar in de app.
- Er gaan alleen gegevens op groepsniveau naar Copilot (`adviesverloop.md`, Contextblok).
- Copilot volgt de rechten van de bron. Een gebruiker die geen toegang heeft tot een map in SharePoint, krijgt er geen antwoorden uit.
- Elke stap werkt op zichzelf. De stappen 0 en 1 vragen geen eigen API en geen nieuwe identiteit.

## Componenten

| Component | Wat de specs vastleggen | Wat nog open staat |
|---|---|---|
| App en API | Next.js 16 met TypeScript. Nu browser-first met twee API-routes, straks een API per entiteit (`azure-plan.md`, punt 2) | Container Apps of App Service met een container |
| Database | Azure SQL Database in West Europe als voorstel, een echt schema met de entiteiten uit `datamodel.md`, migraties in de pipeline, het Bewerkslot in T-SQL | Is Azure SQL definitief? De entiteiten van het adviesverloop (`datamodel.md`, Adviesverloop) moeten in het schema |
| Login beheer en Consultant | Eigen login met gehasht wachtwoord, sessies, verplichte 2FA met TOTP, lockout, rechten per rol op de server (`datamodel-rollen.md`) | Eigen auth-framework of Microsoft Entra ID. Voor Copilot is Entra ID nodig bij elke koppeling waarbij een agent namens een Consultant data opvraagt |
| Toegang Respondent en Lead | Persoonlijke link `/s/<code>`, e-mailcode, sessie van 4 uur, 3 pogingen (`datamodel.md`, Toegangscode) | Niets voor het adviesverloop |
| Mail | Eén module `verstuurMail`, voorkeur Azure Communication Services Email, SPF, DKIM, DMARC | De provider en de DNS van `coniche-scan.nl` |
| PDF-export | Puppeteer met Chromium in de container | Dezelfde container of een aparte dienst |
| Beheer van Azure | Resourcegroep per omgeving, Key Vault, managed identity, privé-verbinding naar de database, Application Insights, Front Door met WAF, infrastructuur als code | Het Azure-abonnement |
| Pipeline | Azure Repos, CI en CD naar Test, Acceptatie en Productie, migraties als eigen stap | Branchbeleid en werkwijze |
| Use-casecatalogus | Niets. In de Boks-app staat de inhoud als Markdown per fase | Waar de catalogus komt: In de database met een beheerscherm (`beheerpagina.md`, punt 17) |
| Adviesverloop | `adviesverloop.md` en `datamodel.md`, Adviesverloop | De uitwerking in het schema en in de API |
| SharePoint-koppeling | Niets | In welke tenant de bestanden komen, wie de toegang goedkeurt en welke map per Organisatie |
| Copilot-agent | Niets | Welke mogelijkheden de tenant biedt en wie agents mag publiceren |
| Privacy en juridisch | Een verwerkersovereenkomst met Microsoft voor Azure staat op de lijst (`go-live-plan.md`, fase 7). De bewaartermijn voor ingevulde scans bestaat | Of gegevens op groepsniveau naar Copilot mogen, onder welke afspraak met de klant, en de bewaartermijn van een kopie in SharePoint |

## Stappen naar een Copilot-agent

| Stap | Wat | Wie | Resultaat en controle |
|---|---|---|---|
| 1. Besluiten | Kiezen in welke tenant de agent en de bestanden komen, of gegevens op groepsniveau naar Copilot mogen en of de auth van de scan op Entra ID aansluit | Admin, ontwikkelaar, IT | Drie besluiten, vastgelegd in dit bestand. Zonder deze besluiten beginnen stap 5 en verder niet |
| 2. Contextbestand | Een vast format voor het bestand dat de scan per Meting levert: Organisatie, Meting, scores per bouwsteen, benchmark, spreiding, KPI's. Hetzelfde als het contextblok | Admin | Eén voorbeeldbestand in Markdown. Controle: Er staat niets in van antwoorden per persoon of namen |
| 3. Proefagent zonder code | In Agent Builder een agent maken met een SharePoint-map vol voorbeeldbestanden als kennis. Eén agent kent maximaal 100 SharePoint-bestanden, dus begin met één Organisatie | Consultant met een Copilot-licentie | Een werkende agent. Controle: Een collega zonder toegang tot de map krijgt geen inhoud te zien |
| 4. Instructies | De rollen en de use cases per fase omzetten naar de instructies van de agent. De drie lagen blijven: Wie ben jij, waar werk je aan, wat wil je nu | Admin, Consultant | Een instructietekst en vijf tot tien gespreksstarters |
| 5. Delen | Eigenaren individueel als "Can edit", groepen alleen als "Can chat". Org-brede deling blijft uit tot de proef geslaagd is. Een agent in de organisatiecatalogus vraagt goedkeuring van een beheerder | Admin, IT | Een kleine groep gebruikers. Controle: Wat de beheerder aan delen heeft beperkt |
| 6. Testen | Vier tot zes Consultants gebruiken de agent bij een echt adviesgesprek | Consultants | Een lijst met verbeterpunten, en het besluit of automatiseren de moeite waard is |
| 7. Bestand automatisch schrijven | De scan schrijft het contextbestand zelf naar de SharePoint-map van de Organisatie, via Microsoft Graph met een app-registratie met toegang tot alleen die site. Eén map per Organisatie | Ontwikkelaar, IT | Het bestand staat er kort na het afronden van een Meting. Controle: De rechten van de map volgen de Consultant die aan de Organisatie gekoppeld is |
| 8. Eigen agent met API | Alleen als stap 7 niet genoeg is. Een declaratieve agent met een API-plug-in, gebouwd met Microsoft 365 Agents Toolkit. Dat levert vier bestanden: App-manifest, agent-manifest, plug-inmanifest en een OpenAPI-beschrijving. Elke functie verwijst naar een `operationId` in die beschrijving | Ontwikkelaar | Een API op Azure met alleen-lezen views, aangesloten op Entra ID. Controle: De agent geeft alleen wat de Consultant in de scan zelf ook mag zien |
| 9. Beheer | Het gebruik per use case bijhouden, de instructies periodiek bijwerken en de gedane stappen uit het adviesverloop vergelijken met wat Consultants echt deden | Admin | Een bijgewerkte catalogus |

## Beperkingen van Agent Builder

- Een agent kent maximaal 100 SharePoint-bestanden, 20 geüploade bestanden en 1 SharePoint-lijst. Eén agent voor alle Organisaties past daar niet in: Kies een agent per Organisatie of een agent met alleen de lopende trajecten.
- Een agent respecteert de rechten en de gevoeligheidslabels van SharePoint. Bestanden met niet-ondersteunde labels blokkeren het maken of bijwerken van de agent.
- Groepen kunnen alleen als "Can chat" worden toegevoegd. Eigenaren worden individueel toegevoegd.
- Een beheerder kan org-brede deling beperken of uitzetten.
- Voor een API-plug-in beschrijft de documentatie van Microsoft de authenticatievormen en de uitrol op aparte pagina's. Die vormen zijn hier niet vastgelegd en moeten voor stap 8 worden nagelopen.

## Open punten

- Eigen auth-framework of Entra ID voor beheer en Consultant (`go-live-plan.md`, fase 0).
- De tenant waarin de bestanden en de agent komen.
- Of gegevens op groepsniveau naar Copilot mogen, en onder welke afspraak met de klant.
- De bewaartermijn en het verwijderen van het contextbestand in SharePoint bij het verwijderen van een Meting of Organisatie (`datamodel.md`, Verwijderen en datakoppelingen).
- Welke Copilot-licentie welke kennisbronnen toestaat.
- Of een agent per Organisatie werkbaar is bij veel gelijktijdige trajecten.
