# Coniche Scan: Techstack, oplossingen en ondersteunende partijen

Overzicht voor de specs: de vaste keuzes bij de organisatievelden onder
Techstack. Dit bestand is bedoeld als bron voor `datamodel.md` (Organisatievelden,
Techstack) en `beheerpagina.md` (punt 3, Organisatievelden). De lijsten staan nu
in de code (`data/organisatie-velden.ts`) en zijn daaruit overgenomen, per
categorie op alfabet. Aangeleverd door Sander op 12 oktober 2026.

**Status**: Gebouwd in de app (commit `f9b2615`), nog niet opgenomen in de specs.

## 1. Wat de app doet

Elke techstack-categorie heeft bij een Organisatie keuzelijsten op één regel. Vijf
categorieën hebben vier velden: Oplossing, Ondersteund door, Deploymentmodel en
Cloudleverancier. LLM-oplossing heeft er twee: LLM (modelfamilie) en
LLM-toegangsroute.

| Veld | Type | Waarde bij opslaan |
|---|---|---|
| Oplossing | Keuzelijst met "Anders…" (alle zes categorieën). Bij LLM-oplossing heet het "LLM (modelfamilie)" | `leverancier` |
| Ondersteund door | Keuzelijst met "Geen ondersteuning" vooraan en "Anders…" onderaan (vijf categorieën) | `ondersteuner` |
| Deploymentmodel | Keuzelijst met "Anders…", in aangeleverde volgorde (vijf categorieën, niet LLM-oplossing) | `deploymentmodel` |
| Cloudleverancier | Keuzelijst met "Anders…", in aangeleverde volgorde (vijf categorieën, niet LLM-oplossing) | `cloudleverancier` |
| LLM-toegangsroute | Keuzelijst met "Anders…", in aangeleverde volgorde (alleen LLM-oplossing) | `toegangsroute` |

**Regels voor een keuzelijst met "Anders…"**

- De lijst staat op alfabet (hoofdletterongevoelig), met "Anders…" altijd onderaan.
- Kiest iemand "Anders…", dan verschijnt een invoerveld ("Naam van de oplossing" bij
  Oplossing, "Naam van de partij" bij Ondersteund door). De invoer wordt bewaard bij
  Enter of bij het verlaten van het veld.
- De invoer wordt getrimd. Komt hij hoofdletterongevoelig overeen met een
  bestaande optie, dan geldt de spelling van die optie ("ZENDESK" wordt "Zendesk").
- De ingevulde tekst wordt als gewone waarde bij de organisatie opgeslagen en staat
  daarna in de lijst van alle organisaties, **van die categorie en dat veld**.
- Er is geen aparte opslag van toegevoegde opties: De lijst is de vaste lijst plus
  wat organisaties erin hebben ingevuld. Gebruikt geen enkele organisatie de
  waarde nog, dan verdwijnt hij weer uit de lijst.

**Regels voor "Ondersteund door"**

- De eerste keuze is altijd "Geen ondersteuning": De organisatie ondersteunt de
  oplossing zelf. Die staat vooraan en niet tussen de partijen op alfabet.
- Daarna volgen de partijen van die categorie op alfabet, en onderaan "Anders…".
- Eén waarde per categorie: Een categorie kan niet door twee partijen tegelijk
  worden ondersteund.
- Zelf of extern volgt uit de keuze: "Geen ondersteuning" is `zelf`, een partij is
  `extern`. Dat wordt niet apart ingevuld maar afgeleid, voor de exports.

## 2. Overzicht van de categorieën

De volgorde is die van het formulier: Contact center, WFM, CRM, Kennismanagement, Conversational AI en LLM-oplossing.

| Categorie | Veld-id | Oplossingen | Ondersteunende partijen |
|---|---|---|---|
| Contact center | `techstack-contact-center` | 19 | 25 |
| WFM | `techstack-wfm` | 20 | 25 |
| CRM | `techstack-crm` | 17 | 23 |
| Kennismanagement | `techstack-kennismanagement` | 14 | 25 |
| Conversational AI | `techstack-conversational-ai` | 14 | 25 |
| LLM-oplossing | `techstack-llm-oplossing` | 16 (modelfamilie) | geen |

LLM-oplossing heeft geen "Ondersteund door", Deploymentmodel en Cloudleverancier,
maar een LLM-toegangsroute (7 opties). Zie de lijsten onder "LLM-oplossing" hieronder.
De categorie "IT en deployment" is vervallen: Deploymentmodel en Cloudleverancier
staan nu bij elke andere categorie.

## 3. Lijsten per categorie

### Contact center

**Oplossingen** (19)

- Amazon Connect
- Anywhere 365
- Avaya Experience Platform
- Cisco Webex Contact Center
- Enreach Contact Center
- Five9
- Freshdesk Contact Center
- Genesys Cloud
- Microsoft 365 Contact Center
- Mitel Contact Center
- NICE CXone
- Odigo
- Puzzel
- RingCentral Contact Center
- Salesforce Service Cloud Voice
- Sprinklr
- Storm CX
- Talkdesk
- Zendesk

**Ondersteunende partijen** (25)

- Accenture
- Avanade
- Axians
- Bright Contact
- Capgemini
- Cegeka
- Cloudoe
- Computacenter
- Concentrix
- Coniche
- Conscia
- Eviden
- Frontline
- Inetum
- KPN
- NTT Data
- Odido Business
- Proximus NXT
- Sabio
- Sopra Steria
- SPIE ICS
- Teleperformance
- VodafoneZiggo Zakelijk
- Wortell
- Yource

### WFM

**Oplossingen** (20)

- Alvaria Workforce
- Assembled
- Calabrio WFM
- Five9 WFM
- Genesys Cloud WEM
- GMT Planet
- Injixo
- Inplanning
- Intradiem
- Monet WFM
- NICE WFM
- ORTEC Workforce Scheduling
- Pipkins Merlang
- Planday
- Playvox
- Puzzel WFM
- Talkdesk WFM
- Verint Workforce Management
- Zendesk WFM
- Zoom Workforce Management

**Ondersteunende partijen** (25)

- Accenture
- Avanade
- Axians
- Bright Contact
- Capgemini
- Cegeka
- Cloudoe
- Computacenter
- Concentrix
- Coniche
- Conscia
- Deloitte
- Eviden
- Frontline
- HSO
- KPN
- NTT Data
- Odido Business
- Proximus NXT
- Sabio
- Sopra Steria
- Teleperformance
- Vlirdens
- VodafoneZiggo Zakelijk
- Yource

### CRM

**Oplossingen** (17)

- AFAS CRM
- Freshdesk
- HubSpot Service Hub
- Intercom
- Microsoft Dynamics 365 Customer Service
- Oracle CX Service
- Oracle Siebel CRM
- Pega Customer Service
- Salesforce Service Cloud
- SAP Service Cloud
- ServiceNow Customer Service Management
- SugarCRM
- SuperOffice
- TOPdesk
- Trengo
- Zendesk
- Zoho Desk

**Ondersteunende partijen** (23)

- Accenture
- Avanade
- Bright Contact
- BusinessBase
- Capgemini
- Cegeka
- Cloudoe
- Conclusion
- Coniche
- Deloitte Digital
- Devoteam
- Frontline
- HSO
- ilionx
- KPN
- Macaw
- NTT Data Business Solutions
- Odido Business
- Plat4mation
- PwC
- Sopra Steria
- Valtech
- VodafoneZiggo Zakelijk

### Kennismanagement

**Oplossingen** (14)

- CM.com Knowledge
- Confluence
- eGain Knowledge
- Freshdesk Knowledge Base
- Guru
- KnowledgePlaza
- Microsoft Dynamics 365 Knowledge Management
- NICE CXone Expert
- Salesforce Knowledge
- ServiceNow Knowledge Management
- SharePoint
- TOPdesk Kennisbank
- Verint Knowledge Management
- Zendesk Guide

**Ondersteunende partijen** (25)

- Accenture
- Avanade
- Bright Contact
- Capgemini
- Cegeka
- Cloudoe
- Concentrix
- Conclusion
- Coniche
- Deloitte Digital
- Devoteam
- Frontline
- HSO
- ilionx
- KPN
- Macaw
- Neople
- Odido Business
- Plat4mation
- Sabio
- Sopra Steria
- Teleperformance
- TKC The Knowledge Company
- VodafoneZiggo Zakelijk
- Yource

### Conversational AI

**Oplossingen** (14)

- Amazon Lex
- Chatlayer
- CM.com Conversational AI Cloud
- Cognigy
- Genesys Cloud Digital & Voice Bots
- Google Dialogflow CX
- IBM Watson Assistant
- Kore.ai
- Microsoft Copilot Studio
- Parloa
- Rasa
- Seamly
- Watermelon
- Zendesk AI Agents

**Ondersteunende partijen** (25)

- Accenture
- Avanade
- Bright Contact
- Capgemini
- Cloudoe
- Concentrix
- Conclusion
- Coniche
- Deloitte
- Devoteam
- Frontline
- ilionx
- Incentro
- KPN
- Macaw
- Neople
- Odido Business
- Sabio
- Seamly
- Sopra Steria
- Studio Winegum
- Teleperformance
- VodafoneZiggo Zakelijk
- Wortell
- Yource

### LLM-oplossing

**LLM (modelfamilie)** (16)

- OpenAI GPT
- Anthropic Claude
- Google Gemini
- Meta Llama
- Mistral
- Cohere Command
- xAI Grok
- DeepSeek
- Alibaba Qwen
- Amazon Nova
- Microsoft Phi
- IBM Granite
- NVIDIA Nemotron
- GPT-NL
- Vendor eigen model
- Onbekend / niet openbaar

**LLM-toegangsroute** (7)

- Direct via modelleverancier (API)
- Azure AI Foundry / Azure OpenAI
- AWS Bedrock
- Google Vertex AI
- Ingebouwd in vendorplatform
- Self-hosted (open-weight model)
- EU-gehost / sovereign

Beide lijsten staan in de aangeleverde volgorde, niet alfabetisch. Eigen invoer
("Anders…") komt daarna op alfabet.

### Deploymentmodel en Cloudleverancier (bij alle categorieën behalve LLM-oplossing)

Dezelfde twee lijsten bij de vijf categorieën met een lijst partijen, op één regel
naast Oplossing en Ondersteund door. De volgorde is die van de aanlevering, niet alfabetisch: Een
eigen invoer komt daarna op alfabet.

**Deploymentmodel** (9)

- Public Cloud (SaaS, multi-tenant)
- Dedicated Cloud (single-tenant)
- Private Cloud
- Sovereign Cloud
- Hosted bij provider
- Hosted bij partner/integrator
- On-premises
- Hybride
- Multicloud

**Cloudleverancier** (20)

- Microsoft Azure
- Amazon Web Services
- Google Cloud
- Oracle Cloud
- IBM Cloud
- Vendor eigen cloud
- VMware
- OpenStack
- OVHcloud
- STACKIT
- Scaleway
- IONOS
- Leaseweb
- Previder
- Cyso
- KPN
- VodafoneZiggo
- Odido
- Rijkscloud / ODC
- Eigen datacenter

## 4. Partijen per categorie

Welke ondersteunende partij in welke lijst staat. Een lijst is per categorie eigen,
dus een partij moet in elke lijst waar hij hoort apart staan.

| Partij | Contact center | WFM | CRM | Kennis | Conv. AI | Aantal |
|---|---|---|---|---|---|---|
| Accenture | x | x | x | x | x | 5 |
| Avanade | x | x | x | x | x | 5 |
| Axians | x | x |  |  |  | 2 |
| Bright Contact | x | x | x | x | x | 5 |
| BusinessBase |  |  | x |  |  | 1 |
| Capgemini | x | x | x | x | x | 5 |
| Cegeka | x | x | x | x |  | 4 |
| Cloudoe | x | x | x | x | x | 5 |
| Computacenter | x | x |  |  |  | 2 |
| Concentrix | x | x |  | x | x | 4 |
| Conclusion |  |  | x | x | x | 3 |
| Coniche | x | x | x | x | x | 5 |
| Conscia | x | x |  |  |  | 2 |
| Deloitte |  | x |  |  | x | 2 |
| Deloitte Digital |  |  | x | x |  | 2 |
| Devoteam |  |  | x | x | x | 3 |
| Eviden | x | x |  |  |  | 2 |
| Frontline | x | x | x | x | x | 5 |
| HSO |  | x | x | x |  | 3 |
| ilionx |  |  | x | x | x | 3 |
| Incentro |  |  |  |  | x | 1 |
| Inetum | x |  |  |  |  | 1 |
| KPN | x | x | x | x | x | 5 |
| Macaw |  |  | x | x | x | 3 |
| Neople |  |  |  | x | x | 2 |
| NTT Data | x | x |  |  |  | 2 |
| NTT Data Business Solutions |  |  | x |  |  | 1 |
| Odido Business | x | x | x | x | x | 5 |
| Plat4mation |  |  | x | x |  | 2 |
| Proximus NXT | x | x |  |  |  | 2 |
| PwC |  |  | x |  |  | 1 |
| Sabio | x | x |  | x | x | 4 |
| Seamly |  |  |  |  | x | 1 |
| Sopra Steria | x | x | x | x | x | 5 |
| SPIE ICS | x |  |  |  |  | 1 |
| Studio Winegum |  |  |  |  | x | 1 |
| Teleperformance | x | x |  | x | x | 4 |
| TKC The Knowledge Company |  |  |  | x |  | 1 |
| Valtech |  |  | x |  |  | 1 |
| Vlirdens |  | x |  |  |  | 1 |
| VodafoneZiggo Zakelijk | x | x | x | x | x | 5 |
| Wortell | x |  |  |  | x | 2 |
| Yource | x | x |  | x | x | 4 |

## 5. Opslag en export

- **Opslag**: In `Organisatie.kenmerken`, genest op veld-id's, bijvoorbeeld
  `kenmerken.techstack["techstack-wfm"].leverancier`, `.ondersteuner`,
  `.deploymentmodel` en `.cloudleverancier`. Alle vier zijn gewone tekst. Bij LLM-oplossing staan
  `.leverancier` (modelfamilie) en `.toegangsroute`. Bestaande data wordt bij het laden
  omgezet: `zelf` wordt "Geen ondersteuning". Een oude `extern` zonder bekende partij
  blijft staan tot er een partij is gekozen.
- **CSV** (`export-csv.md`): De kenmerken zitten als geheel in de JSON-kolom
  `organisatie_kenmerken`, dus `ondersteuner` en de WFM-categorie komen daar vanzelf in
  mee.
- **InDesign** (`export-indesign.md`): WFM heeft een eigen element `techstackWfm`
  met `leverancier` en `ondersteuning`, net als de andere zes. `ondersteuning` is
  afgeleid uit "Ondersteund door" (`zelf` of `extern`), dus het sjabloon merkt niets.
  De partij zelf (`ondersteuner`) zit er **nog niet** in.

## 6. Punten voor Joost

1. **Naamgeving van partijen.** Een paar partijen staan onder verschillende namen in
   de lijsten: "Deloitte" (WFM en Conversational AI) tegenover "Deloitte Digital"
   (CRM en Kennismanagement), en "NTT Data" (Contact center en WFM) tegenover "NTT
   Data Business Solutions" (CRM). Dat kan bedoeld zijn, maar als het één partij is,
   leidt het tot twee namen in de benchmark of een analyse op partij.
2. **De eerste lijst heette "CCO".** Gelezen als de lijst voor Contact center,
   omdat de andere vier onder hun categorienaam stonden ("Conversational" gelezen
   als Conversational AI, "Kennis" als Kennismanagement).
3. **Eigen invoer is niet permanent.** Een eigen waarde blijft alleen in de lijst
   zolang een organisatie hem gebruikt. Wil Coniche toegevoegde opties blijvend
   bewaren, of ze kunnen opschonen (typefouten, dubbelen), dan is een beheerde lijst
   nodig. Dat past bij punt 3 van `beheerpagina.md` (organisatievelden beheerbaar
   maken), dat nog niet is gebouwd.
4. **LLM-oplossing en ondersteuning.** Bij LLM is "Ondersteund door" bewust weggelaten.
   Betekent dat dat een organisatie het model altijd zelf beheert, of is het niet
   relevant? Het oude veld zelf/extern komt hier niet meer terug.
5. **`ondersteuner` en `toegangsroute` in de InDesign-export.** Aanvullen als attribuut
   op de zes techstack-elementen? Dat verandert het contract met het sjabloon.
6. **Eén partij per categorie.** Komt het voor dat een categorie door een partij wordt
   beheerd en door een andere wordt gehost, dan past dat niet in één veld.
   "Geen ondersteuning" sluit ook een deels-zelf, deels-extern situatie uit.
   Hetzelfde geldt voor Deploymentmodel: Hybride en Multicloud staan in de lijst,
   maar een oplossing met twee cloudleveranciers past niet in één veld.
9. **Deploymentmodel en Cloudleverancier in de exports.** Nog niet in de InDesign-export
   en niet apart in de CSV (wel in de JSON-kolom met de kenmerken).
10. **Overlap in Cloudleverancier.** "KPN", "VodafoneZiggo" en "Odido" staan ook als
    ondersteunende partij. Dat is bedoeld als hostingaanbieder, maar het is dezelfde naam
    in twee lijsten met een andere betekenis.
7. **Benchmark.** Is Techstack een filter of een vergelijking in de benchmark
   (`benchmark.md`)? De lijsten maken dat mogelijk, maar het is niet gespecificeerd.
8. **Waar het in de specs hoort.** Voorstel: Deze lijsten als bijlage bij
   `datamodel.md` (Organisatievelden) of als eigen contentbestand, zoals
   `content-klantcontact-volwassenheid.md` dat voor de vragen is.
