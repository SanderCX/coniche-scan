# Coniche Scan: Azure-plan

Overzicht van wat nodig is om de app op een Azure DevOps-omgeving met een
Microsoft SQL-database te implementeren, te deployen, te laten draaien en
bereikbaar te maken via `coniche-scan.nl`. Dit is een plan en geen uitvoering:
Niets hieruit is gedaan.

Het vult `go-live-plan.md` aan met de Azure-specifieke stappen. Waar een punt
daar al staat, verwijst dit document ernaar (fase 0 t/m 11). De
checklist daar blijft leidend voor volgorde en go/no-go.

## Aan de slag: eerste stappen

De code staat in Azure Repos (`werkend2040/coniche`). De volgorde hieronder
gaat over wat nu kan en waar we op wachten. De technische volgorde van de
migratie staat verderop onder "Volgorde".

**Nu, zonder Azure-subscription (Claude Code)**
1. Branchbeleid op `main` instellen en de geschiedenis op geheimen controleren
   (zie "Eerste push naar Azure Repos").
2. `output: "standalone"` in `next.config`, een `Dockerfile` met Chromium en
   lettertypen voor de PDF-export, en lokaal testen met `docker build` en
   `docker run`.
3. In een aparte branch de Neon-code vervangen door een SQL Server-driver
   (punt 2, Database), zodat alleen de verbindingsstring nog ontbreekt.
4. De mailfunctie achter één module zetten (`verstuurMail`), zodat de
   provider te wisselen is (punt 2, Mail).

**Zodra de subscription er is (aanvraag loopt bij IT)**
5. Resourcegroep voor Test, Azure SQL, Key Vault en Container Registry
   (punt 1). Eerst alleen Test.
6. Pipeline koppelen aan de repo en de eerste uitrol naar Test (punt 3).
7. Domein, mailprovider en DNS (punt 4). De beheerder van `coniche-scan.nl`
   is hiervoor nodig.
8. Application Insights en monitoring (punt 6).

**Nog te beslissen**
- Container Apps of App Service met een container (Sander).
- Mailprovider: Azure Communication Services Email of SendGrid. Voorkeur is
  Azure Communication Services Email, omdat het bij dezelfde leverancier
  blijft. SendGrid kan als tussenstap als de subscription te laat komt.
- Wie beheert de DNS van `coniche-scan.nl`.

## Waar we staan

- Next.js 16 (App Router) met TypeScript.
- Data in de `localStorage` van de browser, met als tijdelijke serveropslag
  een Postgres-database (Neon, vervalt) achter twee API-routes (`app/api/store`,
  `app/api/slot`). Eén JSON-blob per sleutel, geen relationeel schema.
- Beheerlogin met platte wachtwoorden in de browser (prototype), geen 2FA,
  geen serverkant autorisatie.
- PDF-export via Puppeteer (Chromium op de server).
- Mail alleen via een Gmail-testkoppeling.

## 0. Besluiten vooraf

- [ ] **Database:** Azure SQL Database (beheerd) of SQL Server op een VM.
  Voorstel: Azure SQL Database. Bij een VM zijn patches en back-ups eigen werk.
  Welke database definitief wordt, staat nog open met IT (`backlog.md`).
- [ ] **Hosting van de app:** App Service (Linux, Node) of Container Apps /
  App Service met een container. Voorstel: een container, vanwege de
  PDF-export (zie punt 2).
- [ ] **Regio:** West Europe (Amsterdam) voor alle onderdelen
  (`go-live-plan.md`, fase 0).
- [ ] **Mail:** Azure Communication Services Email of SendGrid
  (`backlog.md`, Coniche-mailserver).
- [ ] **Omgevingen:** Test en Productie, aan te raden met een Acceptatie voor
  klanttests.
- [ ] **Eigenaarschap:** Wie heeft het Azure-abonnement, wie beheert de
  resourcegroepen, rechten en kosten, en wie beheert de DNS van
  `coniche-scan.nl`.

## 1. Azure-omgeving opzetten

- [ ] Resourcegroep per omgeving.
- [ ] App Service Plan en Web App (of Container Apps Environment en Azure
  Container Registry bij een container).
- [ ] Azure SQL Server en database.
- [ ] Key Vault voor geheimen.
- [ ] Application Insights en Log Analytics.
- [ ] Storage Account, alleen als er bestanden bewaard moeten worden.
- [ ] **Netwerk:** De database is niet openbaar bereikbaar. De app verbindt via
  een private endpoint of een firewallregel.
- [ ] **Identiteit:** Een managed identity voor de app, zodat er geen
  wachtwoorden in de configuratie staan.
- [ ] **Infrastructuur als code:** Bicep of Terraform in dezelfde repo, zodat
  Test, Acceptatie en Productie gelijk blijven.
- [ ] **Schaal en kosten:** Het niveau van App Service en SQL (DTU of vCore) en
  een kostenbewaking.

## 2. Aanpassingen in de applicatie

### Database

- [ ] **Driver:** `@neondatabase/serverless` en `lib/neon.ts` vervangen door
  een SQL Server-driver (`mssql`/`tedious`) of een ORM (Prisma of Drizzle).
- [ ] **SQL herschrijven:** `app/api/store` en `app/api/slot` gebruiken
  Postgres-syntax (`jsonb`, `ON CONFLICT`, `interval`). Die wordt `MERGE` met
  `UPDLOCK`, `NVARCHAR(MAX)` met `ISJSON` en `DATEADD`. Het atomaire
  Bewerkslot (`datamodel.md`, Bewerkslot) moet opnieuw worden gebouwd met T-SQL.
- [ ] **Echt schema:** De entiteiten uit `datamodel.md` (Organisatie,
  Respondent, Meting, ScanInvulling, Gebruiker, AuditEvent, enzovoort) als
  tabellen met foreign keys, en API-routes per entiteit. Nu leest en
  schrijft de code alles als één JSON-blob vanuit de browser
  (`go-live-plan.md`, fase 1).
- [ ] **Migraties:** Een vast migratiemiddel (EF-migraties, Flyway of Prisma
  Migrate), draaiend in de pipeline.
- [ ] **Audit-log en Bewerkslot** als echte tabellen (de vraag over de
  `app_data`-constraint van de tijdelijke opslag vervalt dan).

### Beveiliging

- [ ] **Beheerlogin:** wachtwoord-hashing, sessies met cookies, 2FA (TOTP),
  herstelcodes en lockout (`datamodel.md` deel 2).
- [ ] **Autorisatie op de server:** Per rol en per record. Nu zijn de
  API-routes open en bepaalt de browser wat mag.
- [ ] **Respondenten:** E-mailverificatie met een code, een ToegangsSessie van
  4 uur (instelbaar), rate limiting per IP.
- [ ] **Standaard webbeveiliging:** HTTPS overal, beveiligingsheaders, CORS
  beperkt tot het eigen domein, invoervalidatie aan de serverkant,
  geparametriseerde queries.
- [ ] **Dev-code eruit:** De dev-autologin (`devAutoLogin`), de testknop, de
  seed-accounts met bekende wachtwoorden en de tijdelijke footerlink naar
  beheer.

### PDF-export

- [ ] Puppeteer start Chromium. De container moet Chromium en de benodigde
  libraries bevatten. Daarom een Dockerfile.

### Mail

- [ ] `lib/gmail.ts` vervangen door de gekozen provider.
- [ ] Een apart domein voor scan-verkeer, met SPF, DKIM en DMARC.
- [ ] Reminder-functionaliteit en verzendgedrag testen
  (`go-live-plan.md`, fase 3).

### Configuratie

- [ ] Alle instellingen via omgevingsvariabelen en Key Vault
  (`DATABASE_URL`, mailgegevens, sessiegeheimen).
- [ ] `output: "standalone"` in `next.config` voor een kleinere container.

## 3. Pipeline in Azure DevOps

- [x] **Koppeling met de code:** De repo staat in Azure Repos
  (`werkend2040/coniche`). Azure Pipelines koppelt er rechtstreeks aan.
- [ ] **Build (CI):** Installeren, lint, typecheck, de tests, `next build`, en
  het container-image bouwen en naar Azure Container Registry pushen.
- [ ] **Release (CD):** Automatisch naar Test, met een goedkeuring voor
  Acceptatie en Productie.
- [ ] **Databasemigraties** als aparte stap vóór de uitrol, met een
  back-up of herstelpunt.
- [ ] **Secrets** uit Key Vault.
- [ ] **Branchbeleid:** Pull requests met review. Geen directe push naar `main`
  meer.
- [ ] **Uitrollen zonder downtime:** Deployment slots (blue/green) en een
  duidelijke terugdraaiprocedure.
- [ ] **Werkwijze vastleggen** voor Sander en Joost (`backlog.md`, Werkwijze
  Azure DevOps of GitHub).

## 4. Domein, DNS en certificaat (coniche-scan.nl)

- [ ] **DNS:** Een `A`- of `CNAME`-record naar de Web App of de
  Application Gateway, plus het verificatierecord (`asuid`). Beide varianten,
  met en zonder `www`.
- [ ] **Certificaat:** Een door Azure beheerd certificaat, of via Front Door.
- [ ] **Bescherming:** Azure Front Door of Application Gateway met WAF, voor
  DDoS-bescherming en rate limiting.
- [ ] **Persoonlijke links:** `https://coniche-scan.nl/s/<code>` blijft het
  formaat. Uitnodigingsmails gebruiken het productiedomein.
- [ ] **Mail op het domein:** SPF, DKIM en DMARC.

## 5. Data en overgang

- [ ] Besluiten welke data meegaat. Testdata niet.
- [ ] Een eenmalige migratie van de bestaande opslag naar het echte schema.
- [ ] De import van historische scans uit de oude tool (`import-scans.md`)
  draait pas als de database klaar is (`go-live-plan.md`, fase 5 en 6).

## 6. Beheer en bewaking

- [ ] **Back-ups en herstel:** Point-in-time restore van Azure SQL, back-upretentie
  afgestemd op het dataretentiebeleid, en een geoefende herstelprocedure.
- [ ] **Bewaking:** Application Insights, alerts op fouten en mislukte logins,
  security logging.
- [ ] **Incidenten:** Een procedure en een contactlijst.
- [ ] **Kosten en onderhoud:** Patches, updates van Next.js en het runtime.
- [ ] **Servicewindow voor beheer** (`backlog.md`), zodra er echte sessies zijn.

## 7. Testen en validatie vóór livegang

- [ ] Functionele tests per rol (Admin, Consultant, Lead, Respondent) op
  Acceptatie.
- [ ] Belastingtest en DDoS-/rate-limit-test.
- [ ] Onafhankelijke code review en penetratietest. Dit is de go/no-go-eis uit
  `go-live-plan.md`.
- [ ] Privacy: Verwerkersovereenkomst, bewaartermijnen, AVG-inzage en
  verwijderprocedure (`go-live-plan.md`, fase 7).

## Volgorde

1. Besluiten (punt 0).
2. Infrastructuur en pipeline met een lege app (punt 1 en 3).
3. Databasemigratie, nieuw schema en API per entiteit (punt 2).
4. Login, rechten en e-mail (punt 2).
5. Domein en WAF (punt 4).
6. Acceptatie: testen, pentest en review (punt 7).
7. Dataoverdracht en livegang (punt 5).

De grootste klus zijn stap 3 en 4: de app is nu browser-first en moet naar een
echte server met database, inlog en autorisatie. De Azure-inrichting zelf is
overzichtelijk.

## Vragen die nog open staan

- Wie heeft het Azure-abonnement en wie beheert de DNS van `coniche-scan.nl`?
- Is de keuze voor Azure SQL gemaakt?
- Waar draait de PDF-export (container met Chromium of een aparte dienst)?
- Welke mailprovider?
- Welke omgevingen (Test, Acceptatie, Productie)?

## Eerste push naar Azure Repos

Organisatie `werkend2040`, project `coniche`, repo `coniche` (leeg).

- [ ] Repo leeg laten (geen README of .gitignore aanmaken in Azure DevOps).
- [ ] Geschiedenis controleren op geheimen (o.a. de Neon-verbindingsstring,
  `.env`-bestanden, wachtwoorden in seed-data). Staat er iets in, roteer het
  dan en schrijf de geschiedenis schoon vóór de push.
- [ ] `git remote add azure https://werkend2040@dev.azure.com/werkend2040/coniche/_git/coniche`
- [ ] `git push azure --all` en `git push azure --tags`. Inloggen via Git
  Credential Manager.
- [ ] Branchbeleid op `main` instellen (PR verplicht, pipeline-check).
- [ ] Afspreken welke repo leidend is (Azure Repos) en de oude remote
  loskoppelen.
