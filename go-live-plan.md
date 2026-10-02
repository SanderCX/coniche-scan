# Coniche Scan: Actielijst naar productie

**Status: Concept, 30 september 2026.** Opgesteld uit de specs in deze map
(`CLAUDE.md`, `datamodel.md`, `backlog.md`, `beheerpagina.md`,
`import-scans.md`, `privacy-pagina.md`) en
aangevuld met wat een livegang verder nodig heeft. Punten die uit een spec
komen hebben een bronverwijzing. Punten zonder bronverwijzing zijn
aanvullingen en staan als zodanig gemarkeerd.

Eigenaren zijn een eerste voorstel op basis van de taakverdeling tot nu toe.
**Joost** is content, datamodel en klantcontact, **Sander** is techniek en
infrastructuur. Streefdata staan er bewust niet in, die volgen na de
besluiten in fase 0.

## Waar we staan

Functioneel is het prototype bijna klaar, maar alles draait nog in de
localStorage van één browser. Een persoonlijke link werkt daardoor alleen
op de plek waar de data staat (`CLAUDE.md`, Status). Database en backend
zijn dus de kritieke route. Inloggen, e-mail, import, export en de
privacy-afspraken hangen er allemaal aan.

Twee sporen kunnen direct starten en hoeven niet op de bouw te wachten. Dat
zijn de inventarisatie van de oude omgeving (fase 5) en de juridische
kant (fase 7). Ze hebben de langste doorlooptijd, omdat ze van anderen
afhangen (leverancier, klanten, jurist).

## Fase 0: Besluiten die de rest bepalen

Eerst deze punten dichttimmeren, omdat elk ervan werk in andere fasen
verandert.

- [ ] **Minimale scope van de livegang vastleggen (Joost).** Voorstel is
  dat alles in `backlog.md` onder Functioneel na de livegang komt
  (aggregatie, AI-managementsamenvatting, Zorg-variant, Adoptiescan,
  landingspagina als leadgenerator, Lezen/Presenteren-toggle, calls to
  action bij bouwstenen, responsive). Bevestigen of er iets uit moet
  dat de oude tool wel kon en waar klanten op rekenen.
- [ ] **Toegang voor respondenten bij livegang (Joost en Sander).** Alleen
  de korte persoonlijke link (nu gebouwd), of meteen met e-mailverificatie
  zoals `datamodel.md` deel 2 beschrijft.
  De resultaten bevatten bedrijfsgevoelige scores, en een link kan
  doorgestuurd worden. Dat pleit voor verificatie vanaf dag 1.
- [ ] **Rollen en inlog bij livegang (Joost en Sander).** Volledige rollen
  en 2FA (`datamodel.md` deel 2) of eerst een tussenvorm met alleen Admin
  en een beperkt aantal beheeraccounts. Vaststellen dat 2FA voor beheer
  verplicht is voordat er echte klantdata in staat (aanvulling).
- [ ] **Open punten deel 2 beantwoorden (Joost).** De cellen "te
  bevestigen" in de rechtenmatrix, duur van een ToegangsSessie en het
  aantal mislukte pogingen voor een code ongeldig wordt, één Rol-tabel of
  twee (`datamodel.md`, Open punten).
- [ ] **Afwijking Toegangscode (Sander).** Nu een veld op `Respondent`,
  volgens het datamodel een aparte tabel. Beslissen vóórdat het schema in
  Postgres wordt vastgelegd, want daarna is het lastig om te wijzigen
  (`datamodel.md`).
- [ ] **Keuze auth-framework (Sander).** Bestaand framework of zelf
  bouwen (`datamodel.md`, Open punt 4). Aanrader is een bestaand
  framework voor wachtwoorden, sessies en 2FA (aanvulling).
- [ ] **Hostingkeuze en domein (Sander).** Waar frontend en API draaien,
  op welk domein (bijvoorbeeld onder `app.coniche.nl`), EU-regio voor alle
  onderdelen. De app draait nu lokaal met een eigen kleine server
  (`server.ps1`). Controleren of de router met hash-routes (`#/`) blijft
  of naar echte paden gaat, want de spec noemt persoonlijke links als
  `/s/k7m2p9xq4r` en dat vraagt serverconfiguratie (aanvulling).
- [ ] **Beslissen wat er met de oude data gebeurt (Joost).** Welke klanten
  en scans gaan mee, hoe lang het archief van de oude omgeving bewaard
  blijft, en of klanten worden geïnformeerd (zie fase 5 en 7).
- [ ] **Streefdatum livegang en een vaste datum voor het uitzetten van de
  oude omgeving (Joost).** De opzegtermijn van de oude omgeving kan de
  planning bepalen, dus die eerst opzoeken (zie fase 5).

## Fase 1: Database en backend

- [ ] Neon-project aanmaken in een EU-regio, met aparte omgevingen voor
  test en productie (`backlog.md`, Techniek en infrastructuur).
- [ ] Schema opzetten vanuit `datamodel.md` deel 1: Assessment, Categorie,
  Bouwblok, Vraag, Organisatie, Respondent, Meting, ScanInvulling,
  Toegangscode, organisatievelden.
- [ ] Antwoorden als losse records of als lijst per ingevulde scan
  vastleggen. De backlog noemt losse records handig voor export en
  aggregatie, en het schema is later duur om om te zetten.
- [ ] Content (assessments, bouwblokken, vragen, schaallabels) van
  hardcoded data naar de database verplaatsen, met archiveren in plaats
  van verwijderen zodra er antwoorden aan hangen (`datamodel.md`, Content
  bewerken).
- [ ] API-laag bouwen voor alle acties die nu in de browser gebeuren,
  met de rechtencheck aan de serverkant. Zonder die check is de rest
  schijnveiligheid (`datamodel.md`, Deel 2).
- [ ] Verwijderregels serverside afdwingen zodat er geen losse data
  achterblijft (`datamodel.md`, Verwijderen en datakoppelingen), inclusief
  transacties.
- [ ] Eén gedeelde scorefunctie behouden, ook serverside. Resultaten, PDF,
  InDesign en CSV moeten dezelfde uitkomst geven (`datamodel.md`,
  Scoreberekening).
- [ ] Database-migraties onder versiebeheer, zodat test en productie
  hetzelfde schema krijgen (aanvulling).
- [ ] Back-ups en herstel: Point-in-time herstel in Neon controleren en
  één keer daadwerkelijk een herstel uitproberen (aanvulling).
- [ ] Geheimen (databasewachtwoord, mailgegevens, sleutels) buiten de
  repo houden en per omgeving instellen (aanvulling).
- [ ] Repo klaarzetten voor twee omgevingen, met CI-build en een
  deploy die Sander en Joost allebei kunnen volgen (aanvulling).

## Fase 2: Toegang en beveiliging

- [ ] Inlog voor beheer met wachtwoord, hashing en sessies
  (`datamodel.md`, Gebruiker en Sessie).
- [ ] 2FA voor beheer afdwingen (`tfaActief`, `beheerpagina.md`,
  punt 9).
- [ ] Rollen Admin en Consultant en de rechtenmatrix (`datamodel.md`
  deel 2), inclusief eigenaarschap van organisaties (`aangemaaktDoor`).
- [ ] Beheerscherm Gebruikers volgens `beheerpagina.md` punt 9,
  met het verplicht overzetten van eigenaarschap en minimaal één actieve
  Admin.
- [ ] Eerste Admin-account aanmaken op een veilige manier, zonder
  standaardwachtwoord in de code (aanvulling).
- [ ] Toegangscodes voor respondenten cryptografisch genereren en
  serverside controleren (`datamodel.md`, Toegangscode).
- [ ] Bij gekozen e-mailverificatie: VerificatieCode en ToegangsSessie,
  codes gehasht opgeslagen, 15 minuten geldig, eenmalig, met een grens op
  mislukte pogingen (`datamodel.md`, sectie 3).
- [ ] Beperking van pogingen (rate limiting) op inloggen, code-invoer en
  het scherm Toegang, zodat niet te achterhalen is welke e-mailadressen
  bekend zijn (aanvulling).
- [ ] AuditEvent vastleggen voor gevoelige acties zoals verwijderen,
  uitnodigen en rechten toekennen (`datamodel.md`, Audit).
- [ ] Standaard webbeveiliging: HTTPS overal, beveiligingsheaders,
  CORS beperkt tot het eigen domein, invoer serverside valideren
  (aanvulling).
- [ ] Onafhankelijke controle op beveiliging vóór livegang. Dat kan een
  kort penetratietest-verzoek zijn of een gestructureerde review met
  een checklist, afhankelijk van wat de klanten (Univé, DPG Media, KPN)
  vragen (aanvulling).

## Fase 3: E-mail

- [ ] Coniche-mailserver of mailprovider kiezen, ter vervanging van de
  Gmail-koppeling die alleen voor testen bedoeld is (`backlog.md`).
- [ ] Afzenderadres en domein instellen, met SPF, DKIM en DMARC. Anders
  belanden uitnodigingen bij klanten in de spam (aanvulling).
- [ ] Sjablonen schrijven en laten nalezen: Uitnodiging met persoonlijke
  link, verificatiecode, wachtwoord instellen voor nieuwe gebruikers,
  bevestigingstekst op het scherm Toegang.
- [ ] Bezorging testen bij de mailomgevingen van echte klanten, dus niet
  alleen naar eigen adressen (aanvulling).
- [ ] Knop "Kopieer link" laten staan als terugvaloptie voor beheer
  (`beheerpagina.md`, punt 6).
- [ ] Het scherm Toegang echt laten werken en de tekst laten kloppen met
  wat er gebeurt (`CLAUDE.md`, scherm 4a).

## Fase 4: Functionaliteit afmaken en opruimen

- [ ] Controleren welke onderdelen uit de specs daadwerkelijk gebouwd
  zijn. `CLAUDE.md` noemt nog PDF- en CSV-export als niet gebouwd, en
  beheer van assessment-types, content en organisatievelden staat
  in `beheerpagina.md` onder "Nog te bouwen".
- [ ] Export bouwen of bevestigen: PDF (`export-pdf-visual-*.md`), CSV
  (`export-csv.md`) en InDesign-XML (`export-indesign.md`). Bulk-CSV
  alleen vanaf de organisatie-gefilterde lijst.
- [ ] Beheer van assessment-types, content en organisatievelden
  (`beheerpagina.md`, punt 1 tot en met 3). Beslissen of dat voor de
  livegang nodig is of dat content voorlopig via een bestand en een
  release wordt aangepast.
- [ ] Importfunctie voor historische scans (`beheerpagina.md`,
  punt 8 en `import-scans.md`). Zie fase 6.
- [ ] Verplaatsfunctie voor respondenten en losse responsen
  (`beheerpagina.md`, punt 4). Dit is het herstelmiddel als de
  import een organisatie dubbel aanmaakt.
- [ ] Verplaatsfunctie "Respons naar andere Meting" (`beheerpagina.md`,
  punt 4 en punt 7), ook voor meerdere responsen tegelijk. De import zet
  alles in nieuwe import-Metingen, dus deze functie moet af zijn vóór de
  definitieve import (aanvulling).
- [ ] Beheeractie "Respondent bewerken" (`beheerpagina.md`, punt 4). De
  import koppelt de oude scans aan een neutrale Respondent per
  organisatie, en de beheerder past die daarna aan (aanvulling).
- [ ] Openstaande aanpassingen op de eerste versie afhandelen, inclusief
  navigatie op de resultatenpagina.
- [ ] Open contentvragen beantwoorden: De cutoffs voor Basis op Orde,
  Uitbouwen en Sterk punt (nu een aanname), de kleurcodes per categorie,
  en of Rol/Functie vrije tekst of een vaste lijst wordt (`backlog.md`,
  `CLAUDE.md` sectie 5).
- [ ] Status van de contentbestanden nalopen. Bouwsteenbeschrijvingen
  staan volgens `CLAUDE.md` nog op concept, en de bestaande tekst blijft
  staan zolang dat zo is (`inhoudelijk-fundament.md`).
- [ ] Contentpagina's Visie, Bouwstenen, AI en 2030 nalezen op
  actualiteit en onderling kloppen (`content-2030.md`, `visie-*.md`).
- [ ] Focus- en foutstaten in formulieren afmaken (`CLAUDE.md` sectie 5,
  `stylesheet.md`), en foutmeldingen die een gebruiker daadwerkelijk kan
  zien bij een netwerkfout of verlopen sessie (aanvulling).
- [ ] **Opruimen voor productie** (`backlog.md`, Voor productie):
  - [ ] Testknop (vragenlijst automatisch invullen) verwijderen
  - [ ] Seed-data met testorganisatie en testrespondent verwijderen
  - [ ] Controlefunctie voor "niets blijft achter bij verwijderen"
    verwijderen na gebruik
  - [ ] Hardcoded accounts, zoals `admin@coniche.nl`, en preview- of
    demodata uit de productiebuild halen (aanvulling)
- [ ] Eenvoudige foutregistratie en beschikbaarheidsbewaking instellen,
  met een melding naar Sander en Joost (aanvulling).
- [ ] Voorbeeld-output (scherm 3) op vaste demodata laten staan en
  controleren dat die geen echte klantdata bevat.

## Fase 5: Oude omgeving, inventarisatie en export

Kan nu al starten.

**Inventariseren**
- [ ] Vastleggen wat de oude omgeving is: Hosting, database, domeinen en
  subdomeinen, wie het account beheert, en welke andere betaalde diensten
  eraan hangen (bijvoorbeeld een AI-koppeling voor de oude samenvatting,
  mail, analytics). Bij voorkeur met een kostenoverzicht per maand
  (aanvulling).
- [ ] Contractvoorwaarden opzoeken: Looptijd, opzegtermijn, en of
  gegevens na opzegging nog een periode opvraagbaar zijn (aanvulling).
- [ ] Gebruik in kaart brengen: Aantal organisaties, aantal scans per
  status (afgerond, bezig, niet begonnen), datum van de laatste activiteit
  per organisatie, aantal unieke respondenten, en welke persoonlijke links
  nog in omloop zijn.
- [ ] Beheeraccounts en beheerders van de oude omgeving vastleggen.
- [ ] Vaststellen of er ergens anders naar de oude omgeving verwezen
  wordt: Denk aan coniche.nl, mails, presentaties, offertes, LinkedIn (aanvulling).

**Beslissen**
- [ ] Per organisatie bepalen wat er met de scans gebeurt: Overzetten,
  laten vervallen, of eerst met de klant afstemmen.
- [ ] Onafgeronde scans: Laten aflopen tot een sluitingsdatum, afmaken of
  bewust laten vervallen. De importspec neemt alleen afgeronde scans mee
  (`import-scans.md`, Beslist).
- [ ] Toestemming (`consent_given`) vastleggen. De scans zijn door
  Coniche-collega's samen met de klant ingevuld, dus toestemming geldt
  als gegeven voor alle rijen die worden overgenomen (besluit Joost, 30
  september 2026). Het veld wordt bewust niet geïmporteerd
  (`import-scans.md`). Wel de kolommen `consent_given` en
  `consent_timestamp` meenemen in het archief, en een korte controle
  doen of ze inderdaad overal op waar staan (aanvulling).

**Exporteren**
- [ ] Per te behouden scan de CSV-export uit de oude tool, in het formaat
  dat `import-scans.md` beschrijft. Twee voorbeeldexports bestaan
  al (Univé Zuid-Nederland en Unive). De batch-export van de oude tool
  bevat geen antwoorden per vraag, dus elke scan wordt los geëxporteerd.
  Alle bestanden komen in één map, zonder submappen; de import leest die
  map in één keer.
- [ ] Controlegetallen vastleggen per map: Aantal bestanden, aantal rijen,
  aantal scans per organisatie en de `overall_score` per scan. De import negeert die
  score, maar hij is bruikbaar om na de import te controleren of de nieuwe
  berekening hetzelfde geeft (aanvulling).
- [ ] Aparte volledige back-up van de oude omgeving als archief:
  Database-dump plus alles wat de tool zelf kan exporteren, inclusief de
  gegenereerde AI-samenvattingen en toestemmingsgegevens die niet worden
  geïmporteerd. Versleuteld opslaan met een afgesproken bewaartermijn
  (aanvulling).
- [ ] Bepalen wie het archief beheert en waar het staat. De CSV-bestanden
  bevatten persoonsgegevens (naam, e-mail, telefoon) en horen niet
  losstaand in een gedeelde map te blijven liggen.

**Klanten en links**
- [ ] Bepalen of en hoe klanten worden ingelicht over de overgang en de
  nieuwe links. Dit raakt vooral organisaties met lopende scans.
- [ ] Afspraak over de oude URL na de overgang. Voorstel is een redirect of
  een korte pagina met uitleg, zolang de oude domeinnaam bestaat
  (aanvulling).

## Fase 6: Import in de nieuwe omgeving

Vraagt een werkende database en de importfunctie uit fase 4.

- [ ] Mapping opstellen van `sector_name` en `subsector_name` in de oude
  data naar de SBI-titels in `sbi-indeling.md`. Doe dit vooraf voor alle
  waarden die in de exports voorkomen, en leg de lijst met onduidelijke
  gevallen aan Joost voor (`import-scans.md`, Beslist).
- [ ] Per unieke organisatienaam in het bestand de organisatie vooraf
  koppelen of bepalen dat het een nieuwe wordt. De import vraagt dit één
  keer per naam. Er is bewust geen automatische fuzzy-match. Bekende
  twijfel is "Univé Zuid-Nederland" tegenover "Unive".
- [ ] Importfunctie eerst uitgebreid testen op een testomgeving, met beide
  voorbeeldbestanden, als map met losse bestanden en samengevoegd tot één
  bestand, en met bewust foute varianten (ander aantal blokken, ander
  aantal vragen, tegenstrijdige `blockComment`, een bestand zonder
  `answers` zoals een batch-export). Ook testen: Een rij mislukt halverwege
  een bulkimport en wordt daarna apart alsnog geïmporteerd.
- [ ] Gedeeld e-mailadres kiezen voor de neutrale Respondent
  "Coniche (historische scan)" en beslissen waar de herkomst per scan komt
  (notities of een veld op `ScanInvulling`, `import-scans.md`, Open). Dit
  moet vast liggen vóór de eerste import (aanvulling).
- [ ] Importlogboek bijhouden met mapnaam of bestandsnaam, aantal
  bestanden, datum, aantal rijen per organisatie en wie het deed. De spec
  heeft bewust geen controle op dubbele import van dezelfde
  `assessment_id`, ook niet bij overlap tussen bestanden in een map. In
  productie is een dubbele import lastig recht te zetten, dus overwegen
  om dat besluit te herzien of het logboek strikt te volgen (aanvulling).
- [ ] Definitieve import op productie, per map (of per bestand), met
  voorbeeldweergave, organisatiekeuzes en bevestiging in bulk of per rij.
  Rijen die niet lukken, importeer je daarna een voor een, zonder de map
  opnieuw te kiezen.
- [ ] Neutrale Respondenten nalopen en bewerken waar een echte
  contactpersoon bekend is (`beheerpagina.md`, "Respondent bewerken")
  (aanvulling).
- [ ] Controle na import: Aantal organisaties, respondenten, metingen en
  scans tegen de controlegetallen uit fase 5, en de berekende score tegen
  de oude `overall_score` (afronding kan een verschil van 0,1 geven).
  Steekproef van een paar scans volledig doorlopen in de resultatenpagina.
- [ ] Import-Metingen ("Legacy-import {jaar}") nalopen en de responsen
  omhangen naar de juiste Meting per organisatie (`beheerpagina.md`,
  "Respons naar andere Meting verplaatsen"). Daarna de lege
  import-Metingen verwijderen. Beslissen of organisatiekenmerken zo
  blijven of nog worden aangevuld.
- [ ] Na de controle de losse CSV-bestanden verwijderen op de plekken
  waar ze niet horen, en alleen het versleutelde archief bewaren.

## Fase 7: Privacy en juridisch

Kan parallel aan de bouw. De doorlooptijd hangt van anderen af.

- [ ] Juridische toetsing van de privacypagina, met name bewaartermijn,
  beveiliging en rechten van betrokkenen (`privacy-pagina.md`, Open
  punten).
- [ ] Placeholders invullen: Statutaire naam, adres, KvK-nummer,
  privacycontact, hostingplek en EU-regio.
- [ ] Toestemmingstekst op de intake en de privacypagina inhoudelijk
  gelijk houden (`privacy-pagina.md`, sectie 4).
- [ ] Verwerkersovereenkomst tussen Coniche en de klantorganisaties, omdat
  Coniche verwerkt namens de klant (`privacy-pagina.md`, Open punten).
  Nagaan bij welke bestaande klanten die al is afgesloten.
- [ ] Verwerkersovereenkomsten met de eigen leveranciers (Neon, hosting,
  mailprovider) en hun namen in de privacypagina opnemen (aanvulling).
- [ ] Bewaartermijn vaststellen en de melding voor data-ouderdom
  bouwen of bewust uitstellen (`backlog.md`, Data-ouderdom). Dit bepaalt
  ook hoe lang de gemigreerde oude scans blijven staan.
- [ ] Procedure voor verzoeken van betrokkenen (inzage, correctie,
  verwijdering) voor respondenten zonder account, via de contactpersoon
  bij hun organisatie of rechtstreeks bij Coniche (`privacy-pagina.md`,
  sectie 8).
- [ ] Nagaan of de app cookies of analytics gebruikt buiten wat technisch
  nodig is, en de pagina daarop afstemmen (`privacy-pagina.md`, sectie 9).
- [ ] Register van verwerkingsactiviteiten bijwerken, en bepalen of een
  gegevensbeschermingseffectbeoordeling nodig is (aanvulling).
- [ ] Afspraak voor het melden van een datalek en wie dat doet
  (aanvulling).
- [ ] Vaststellen op welke grondslag de oude scans in het nieuwe systeem
  blijven staan, en of respondenten en klanten dat moeten horen
  (aanvulling).

## Fase 8: Testen

- [ ] Testplan met de hele keten: Organisatie aanmaken, meting plannen,
  respondent uitnodigen, mail ontvangen, link openen, verifiëren,
  intake, invullen, resultaten, export, verwijderen.
- [ ] Beide scan-types doorlopen, met en zonder categorielaag.
- [ ] Rechten testen per rol: Kan een Consultant niets zien wat hij niet
  zelf aanmaakte, komt een Lead niet bij een andere organisatie, werkt
  een verlopen of ingetrokken sessie niet meer.
- [ ] Bewust misbruik proberen: Codes raden, andermans link aanpassen,
  meerdere keren foute codes invoeren, rechtstreeks de API aanroepen.
- [ ] Testen met echte mailadressen bij minstens twee klantdomeinen.
- [ ] Twee of drie collega's of vertrouwde klanten een echte scan laten
  invullen, met de vraag waar ze vastliepen (aanvulling).
- [ ] Exports controleren: PDF, CSV en InDesign-XML met dezelfde scan en
  dezelfde scores als op het scherm.
- [ ] Browsers: De spec vraagt alleen desktop. Bevestigen welke browsers
  Chrome, Edge, Firefox en Safari worden ondersteund, en dat de app op
  een telefoon een nette melding geeft in plaats van een kapotte pagina
  (aanvulling).
- [ ] Herstel van een back-up daadwerkelijk uitproberen.
- [ ] Een kleine belastingtest met het aantal respondenten van een grote
  klant tegelijk (aanvulling).
- [ ] Acceptatie door Joost op content en flow, door Sander op techniek.
  Lijst met blokkerende bevindingen bijhouden en pas afvinken bij nul.

## Fase 9: Livegang

Volgorde voor de dag zelf. Het idee is dat de oude omgeving in dit stuk
bereikbaar blijft, zodat terugvallen kan.

- [ ] Livegang plannen op een moment dat er weinig lopende scans zijn en
  Sander en Joost allebei bereikbaar zijn.
- [ ] Klanten met lopende scans van tevoren informeren.
- [ ] Oude omgeving op alleen-lezen zetten of nieuwe invullingen stoppen,
  zodat de laatste export compleet is.
- [ ] Laatste export uit de oude omgeving en vergelijken met de eerdere
  exports en controlegetallen.
- [ ] Productie schoon controleren: Geen testdata, geen testknop, juiste
  omgevingsvariabelen, juiste afzender, echte Admin-accounts met 2FA.
- [ ] Import uitvoeren en controle na import (fase 6).
- [ ] Domein omzetten en HTTPS controleren.
- [ ] Rooktest op productie: Één complete scan van uitnodiging tot
  resultaat, met echte mail.
- [ ] Redirect of uitlegpagina op de oude URL aanzetten.
- [ ] Klanten informeren dat de nieuwe omgeving live is, en waar nodig
  nieuwe links sturen.
- [ ] Terugvalplan vooraf opgeschreven: Welk moment beslist dat we
  teruggaan en hoe (DNS terug, oude omgeving weer op lezen en schrijven).
- [ ] Eerste dagen: Foutregistratie en mailbezorging dagelijks bekijken.

## Fase 10: Oude omgeving uitzetten

Pas na een afgesproken wachtperiode na de livegang, bijvoorbeeld twee tot
vier weken. De opzegtermijn uit fase 5 bepaalt of opzeggen al eerder moet
gebeuren.

- [ ] Bevestigen dat het archief compleet en leesbaar is, en dat er iemand
  eigenaar van is.
- [ ] Bevestigen dat alle klanten die scans wilden behouden, die scans in
  de nieuwe omgeving hebben teruggezien.
- [ ] Abonnementen en hosting opzeggen, met bevestiging van de leverancier
  en de einddatum.
- [ ] API-sleutels, tokens en gedeelde wachtwoorden van de oude omgeving
  intrekken.
- [ ] Domein of subdomein van de oude omgeving afhandelen: Doorverwijzen
  zolang er nog verwijzingen bestaan, daarna loslaten of aanhouden.
- [ ] Verzoek aan de leverancier om de gegevens definitief te wissen, met
  schriftelijke bevestiging (aanvulling).
- [ ] Kosten van de oude omgeving als afgesloten markeren, en besparing
  noteren.

## Fase 11: Na de livegang

- [ ] Backlog prioriteren (`backlog.md`), met als eerste kandidaten de
  AI-managementsamenvatting, aggregatie over meerdere respondenten en de
  Zorg-variant.
- [ ] Elke twee maanden `content-2030.md` controleren op actualiteit
  (`backlog.md`, Content-onderhoud).
- [ ] Vaste momenten voor herstel-test van back-ups, updates van
  afhankelijkheden en het nalopen van beheeraccounts (aanvulling).
- [ ] Na vier tot zes weken een terugblik op gebruik, fouten en klachten.

## Afhankelijkheden in het kort

- Besluiten in fase 0 gaan vóór schema, inlog en planning.
- Fase 1 gaat vóór fase 2, 3, 6 en de definitieve export.
- Fase 5 en fase 7 zijn onafhankelijk van de bouw en kunnen nu starten.
- De importfunctie (fase 4) en een werkende productiedatabase (fase 1) gaan
  vóór de definitieve import in fase 6.
- Fase 8 sluit af vóór fase 9, en fase 10 begint pas na fase 9.

## Vragen die ik nog nodig heb

1. Wat is de oude omgeving precies (hosting, waar staat de data, wie
   beheert het) en wat kost hij per maand?
2. Wat is de opzegtermijn, en is er een einddatum die de planning
   bepaalt?
3. Wie in het team beslist over de hostingkeuze en het auth-framework,
   Sander alleen of samen?
4. Is er een streefdatum voor de livegang, of een klant die erop wacht?
5. Zijn er klanten met lopende scans in de oude tool die de overgang
   direct merken?
6. Welke van de specs zijn al door Sander gebouwd, zodat ik fase 4 kan
   terugbrengen tot wat echt nog open staat?
