// Gegenereerd door `npm run help` (scripts/bouw-help.ts) uit help/*.md. Niet met de hand aanpassen.
import type { HelpOnderwerp } from "@/lib/help-bron";

export const HELP_ONDERWERPEN: HelpOnderwerp[] = [
  {
    "slug": "zo-werkt-coniche-scan",
    "titel": "Zo werkt Coniche Scan",
    "groep": "Beginnen",
    "volgorde": 1,
    "rollen": [
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "CLAUDE.md",
      "beheerpagina.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Coniche Scan meet hoe volwassen het klantcontact van een Organisatie is. Dit onderwerp laat zien hoe de onderdelen samenhangen, zodat je weet waar je wat vindt.\n\n## In het kort\nJe maakt een Organisatie aan, plant daarbij een Meting en nodigt Respondenten uit. Zij vullen de scan in via een persoonlijke link. Daarna lees je de resultaten per Meting, en vergelijk je Metingen of Organisaties met een benchmark.\n\n## Wat je ziet\n1. **Organisaties.** Elke klant is een Organisatie met kenmerken, Respondenten en Metingen. Je vindt ze onder Organisaties in de navigatiebalk.\n2. **Metingen.** Een Meting is één afname van één scan bij één Organisatie, voor één onderdeel en op één meetdatum.\n3. **Respondenten.** Een Respondent is de persoon die de scan invult. Een Respondent met de rol Lead kan daarnaast resultaten van de Organisatie zien.\n4. **Resultaten.** Onder Resultaten vind je de uitkomsten per Meting. Een Admin kan daar ook Verkennen en Benchmarks gebruiken.\n5. **Instellingen.** Een Admin vindt Gebruikers, drempels en teksten in het menu rechtsboven, onder Instellingen.\n\n## Let op\nEen Consultant ziet en beheert alleen de Organisaties die hij zelf heeft aangemaakt of die een Admin aan hem heeft toegewezen.\n\n## Zie ook\n- [Rollen en rechten](rollen-en-rechten)\n- [Een scan aanmaken](scan-aanmaken)\n- [Resultaten van een Meting](resultaten-meting)",
    "svg": null
  },
  {
    "slug": "rollen-en-rechten",
    "titel": "Rollen en rechten",
    "groep": "Beginnen",
    "volgorde": 2,
    "rollen": [
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "CLAUDE.md",
      "datamodel.md",
      "beheerpagina.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "In Coniche Scan heeft iedereen een rol. De rol bepaalt wat je ziet en wat je kunt doen.\n\n## In het kort\nAdmin en Consultant werken in beheer. Lead en Respondent werken via een persoonlijke link. Een Admin heeft alle rechten, een Consultant werkt met zijn eigen Organisaties.\n\n## Wat je ziet\n1. **Admin.** Mag alles: Organisaties, Gebruikers, Assessments, drempels, benchmarks en Verkennen. Een Admin zet ook vast wat een Lead ziet.\n2. **Consultant.** Maakt Organisaties en Metingen aan, nodigt Respondenten uit en leest de resultaten, voor de Organisaties die hij zelf aanmaakte of die een Admin aan hem toewees.\n3. **Lead.** Een Respondent van een klant die meer mag zien dan de eigen scan. Een Admin vinkt per Lead aan welke weergaven hij ziet. Zonder vinkje ziet een Lead niets.\n4. **Respondent.** Vult de eigen scan in en ziet de eigen resultaten.\n\n## Let op\nDe rol volgt uit het account waarmee je inlogt. Heb je een Lead nodig die ook zelf invult, dan hoeft er geen tweede account te komen: Dezelfde persoon kan beide.\n\n## Zie ook\n- [Zo werkt Coniche Scan](zo-werkt-coniche-scan)\n- [Een scan aanmaken](scan-aanmaken)",
    "svg": null
  },
  {
    "slug": "zo-werkt-de-scan",
    "titel": "Zo werkt de scan",
    "groep": "Beginnen",
    "volgorde": 3,
    "rollen": [
      "Respondent",
      "Lead",
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "CLAUDE.md",
      "visualisatie-mijn-metingen.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Een scan is een vragenlijst over hoe je Organisatie het klantcontact heeft ingericht. Je ontvangt een persoonlijke link en vult de scan in je eigen tempo in.\n\n## In het kort\nJe opent je persoonlijke link en komt op Mijn metingen. Daar start je de scan, beantwoordt je de vragen per bouwblok en zie je daarna meteen je resultaten. Je antwoorden worden onderweg bewaard.\n\n## Wat je ziet\n1. **Je persoonlijke link.** Die opent altijd eerst Mijn metingen, met al je scans en hun status.\n2. **Een korte intake.** Je vult je naam, rol of functie en team in en geeft toestemming om je antwoorden te delen met Coniche.\n3. **De vragen per bouwblok.** Bij elke vraag kies je een antwoord op een schaal van 1 tot 5. Onderaan elk bouwblok kun je een opmerking achterlaten.\n4. **Je resultaten.** Na de laatste vraag klik je op \"Bekijk resultaten\". Je ziet direct je scores.\n\n## Let op\nBeantwoord elke vraag op basis van wat aantoonbaar geregeld is, zoals documenten, ritmes, tooling en afspraken. Een goed bedoeld plan telt niet mee.\n\n## Zie ook\n- [Een scan invullen](een-scan-invullen)\n- [Verder waar je was gebleven](verder-waar-je-was)\n- [Mijn metingen](mijn-metingen)",
    "svg": null
  },
  {
    "slug": "een-scan-invullen",
    "titel": "Een scan invullen",
    "groep": "Beginnen",
    "volgorde": 4,
    "rollen": [
      "Respondent",
      "Lead",
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "CLAUDE.md",
      "datamodel.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Hier lees je wat er gebeurt vanaf het moment dat je op \"Start de scan\" klikt tot je de laatste vraag hebt beantwoord.\n\n## In het kort\nJe vult eerst de intake in en loopt daarna de bouwblokken door in de volgorde van de linkerbalk. Je kunt vooruit en terug en je antwoorden worden steeds bewaard. Op het laatste bouwblok wordt \"Volgende\" de knop \"Bekijk resultaten\".\n\n## Wat je ziet\n1. **De intake.** Naam, rol of functie, team en notities. Het vakje voor toestemming is verplicht. Staan er gegevens van een eerdere scan, dan zijn die al ingevuld.\n2. **De balk links.** Bovenaan staan je naam en je voortgang. Daaronder staan de bouwblokken, met een grijs nummer als je nog niet begon, een gevuld rondje als je bezig bent en een groen vinkje als het bouwblok klaar is.\n3. **De vragen.** Een bouwblok heeft meestal vier vragen met een schaal van 1 (niet aanwezig) tot 5 (geoptimaliseerd en continu verbeterd). Het icoon naast de titel opent een toelichting op het bouwblok.\n4. **Een opmerking.** Per bouwblok is er één opmerkingenveld. Het is niet verplicht.\n\n## Let op\nEen scan is maar voor één persoon tegelijk te openen. Opent iemand anders dezelfde scan terwijl jij bezig bent, dan krijgt die een melding en kan de scan pas open als jij klaar bent. Weegt een bouwblok zwaarder mee in de totaalscore, dan staat daarvan bij de intake een kaart en achter het bouwblok een factor zoals \"2×\".\n\n## Zie ook\n- [Verder waar je was gebleven](verder-waar-je-was)\n- [Je resultaten lezen](resultaten-lezen)",
    "svg": null
  },
  {
    "slug": "verder-waar-je-was",
    "titel": "Verder waar je was gebleven",
    "groep": "Beginnen",
    "volgorde": 5,
    "rollen": [
      "Respondent",
      "Lead",
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "CLAUDE.md",
      "visualisatie-mijn-metingen.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Je hoeft een scan niet in één keer af te maken. Je kunt altijd stoppen en later verder gaan.\n\n## In het kort\nJe antwoorden worden bewaard terwijl je invult. Open je persoonlijke link opnieuw en klik op \"Ga verder\", dan sta je weer op het bouwblok waar je bleef.\n\n## Wat je ziet\n1. **Je persoonlijke link.** Bewaar de link of de e-mail waarin je hem kreeg. De link blijft werken zolang je als Respondent bestaat.\n2. **De status Bezig.** Op Mijn metingen staat je scan als Bezig, met hoeveel vragen je al beantwoordde en wanneer je laatst opsloeg.\n3. **De knop \"Ga verder\".** Die brengt je terug in de scan.\n4. **Mijn gegevens.** In het menu rechtsboven kun je je gegevens bekijken of bewerken, of uitloggen. Uitloggen sluit alleen deze sessie. Je antwoorden blijven bewaard.\n\n## Zie ook\n- [Een scan invullen](een-scan-invullen)\n- [Mijn metingen](mijn-metingen)",
    "svg": null
  },
  {
    "slug": "gebruikers",
    "titel": "Gebruikers",
    "groep": "Instellingen",
    "volgorde": 1,
    "rollen": [
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "beheerpagina.md",
      "datamodel.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Onder Gebruikers beheer je de Admin- en Consultant-accounts. Respondenten en Leads beheer je bij de Organisatie.\n\n## In het kort\nJe maakt een gebruiker aan met een naam, een e-mailadres en een rol. De app maakt een wachtwoord van 12 tekens, dat je één keer te zien krijgt. Een gebruiker wordt nooit verwijderd, alleen gedeactiveerd.\n\n## Wat je ziet\n1. **De lijst.** Naam, e-mailadres, rol, status en wanneer de gebruiker voor het laatst inlogde.\n2. **Aanmaken.** Kies de rol Admin of Consultant. Noteer het wachtwoord direct, want het is daarna niet meer te zien.\n3. **Wijzigen.** Je past naam, e-mailadres en rol aan.\n4. **Deactiveren.** Zo verdwijnt de toegang en blijft de historie kloppen. Bij een Consultant zet je eerst zijn Organisaties over naar iemand anders.\n\n## Let op\nEr moet altijd minstens één actieve Admin zijn. De laatste Admin kan niet gedeactiveerd worden.\n\n## Zie ook\n- [Rollen en rechten](rollen-en-rechten)",
    "svg": null
  },
  {
    "slug": "drempels-en-termijnen",
    "titel": "Drempels en termijnen",
    "groep": "Instellingen",
    "volgorde": 2,
    "rollen": [
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "beheerpagina.md",
      "datamodel.md",
      "visualisatie-verkennen.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Hier stel je de grenzen in die bepalen wanneer iets zichtbaar is, hoe lang gegevens bewaard blijven en wanneer Verkennen een groep toestaat.\n\n## In het kort\nDe waarden gelden voor de hele omgeving. Een wijziging werkt door vanaf het volgende scherm. Bij elk veld staat een Info-icoon met uitleg.\n\n## Wat je ziet\n1. **Sessieduur.** Hoe lang een Respondent of Lead ingelogd blijft na verificatie. De beginwaarde is 4 uur.\n2. **Bewaartermijn en verlengtermijn.** Na de bewaartermijn komt een afgeronde scan op de lijst \"Data ouder dan de bewaartermijn\". Er wordt niets vanzelf verwijderd. Verlengen stelt de melding uit.\n3. **Benchmark.** Het minimum aantal Organisaties in een groep (beginwaarde 5), het minimum aantal scans per Meting (3) en het aantal dagen waarboven een vergelijking Naast elkaar een waarschuwing geeft (90).\n4. **Voor een Lead.** Het minimum aantal afgeronde scans voor Spreiding, anonieme Antwoorden en de lijn van de laagste tot de hoogste score (5).\n5. **Verkennen.** Vijf grenzen voor groepen, vergelijkingen, de pool, het aantal waarden per kenmerk en hoe vaak een kenmerk ingevuld moet zijn.\n\n## Let op\nVerlaag je een grens, dan kunnen resultaten voor een Lead eerder zichtbaar worden. Ga daar bewust mee om, want een kleine groep maakt individuele antwoorden herleidbaar.\n\n## Zie ook\n- [Verkennen](verkennen)\n- [Gebruikers](gebruikers)",
    "svg": null
  },
  {
    "slug": "mijn-metingen",
    "titel": "Mijn metingen",
    "groep": "Je resultaten",
    "volgorde": 1,
    "rollen": [
      "Respondent",
      "Lead",
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "visualisatie-mijn-metingen.md",
      "CLAUDE.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Mijn metingen is de pagina waar je persoonlijke link altijd op uitkomt. Je ziet er al je scans en wat je kunt doen.\n\n## In het kort\nElke Meting waaraan je meedoet is een kaart met de naam van de scan, een status en een knop. Een Lead ziet daarnaast kaarten voor de Metingen en benchmarks waarvoor een Admin hem toegang gaf.\n\n## Wat je ziet\n1. **Het icoon en de titel.** Ze zeggen welke scan het is en bij welke Meting hij hoort.\n2. **De status.** Uitgenodigd betekent dat je nog niet begon, Bezig dat je al antwoorden gaf en Afgerond dat je klaar bent.\n3. **De voortgang of de uitkomst.** Bezig toont hoeveel vragen je beantwoordde. Bij een afgeronde scan staat er een samenvatting van je score: een ring met je totaalscore en de klasse, en de score per categorie.\n4. **De knop.** \"Start de scan\", \"Ga verder\" of \"Bekijk jouw resultaten\", afhankelijk van de status.\n\n## Let op\nEen Lead die zelf ook invult, ziet bij dezelfde Meting één kaart met twee delen: Jouw scan en Hele meting. Het deel Hele meting is er pas als er genoeg scans zijn afgerond. Zie Resultaten van je Organisatie voor de grens.\n\n## Zie ook\n- [Je resultaten lezen](resultaten-lezen)\n- [Verder waar je was gebleven](verder-waar-je-was)",
    "svg": null
  },
  {
    "slug": "resultaten-lezen",
    "titel": "Je resultaten lezen",
    "groep": "Je resultaten",
    "volgorde": 2,
    "rollen": [
      "Respondent",
      "Lead",
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": "resultaten-lezen.svg",
    "film": "wat-krijg-ik",
    "bronnen": [
      "visualisatie-scores.md",
      "visualisatie-mijn-metingen.md",
      "stylesheet.md",
      "CLAUDE.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Na afloop zie je bovenaan je totaalscore in een ring, met de klasse en een korte uitleg ervan. Daaronder staan de radar en je scores per categorie. Dit onderwerp legt uit wat elk teken in de grafiek Per categorie betekent. In de radar kies je een genummerd bolletje om de naam en de score van dat bouwblok te zien, en in het staafdiagram doe je dat met een balk.\n\n## In het kort\nDe gekleurde staaf is je eigen score op een schaal van 1 tot 5. De stippellijnen bij 2,5 en 3,5 delen de schaal in drie klassen: Basis op Orde, Uitbouwen en Sterk punt. Ziet een Lead de gegevens van de hele Meting, dan staan daarbij ook een stip met het gemiddelde en een grijze lijn van de laagste tot de hoogste score.\n\n## Wat je ziet\n1. **De staaf.** De hoogte is de score van de Organisatie in die categorie, met het getal erboven. De kleur is de kleur van de categorie.\n2. **De stip.** Het gemiddelde van de groep, in dezelfde kleur als de staaf. Alleen een Lead ziet de stip, en alleen als er genoeg scans zijn.\n3. **De grijze lijn.** Loopt van de laagste tot de hoogste score van één afgeronde scan. Hoe langer de lijn, hoe meer de scans verschillen.\n4. **De stippellijnen.** Ze liggen bij 2,5 en 3,5 en maken de grenzen van de klassen zichtbaar. Onder 2,5 is Basis op Orde, van 2,5 tot 3,5 Uitbouwen en vanaf 3,5 Sterk punt.\n\n## Let op\nDe stip en de grijze lijn staan er pas vanaf een minimum aantal afgeronde scans, zodat niemand uit een gemiddelde kan afleiden wat één persoon invulde. De Admin kan die grens aanpassen bij Instellingen, onder Drempels en termijnen. De beginwaarde is 5 scans.\n\n## Zie ook\n- [Je score vergelijken](score-vergelijken)\n- [Mijn metingen](mijn-metingen)",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 800 330\" role=\"img\" width=\"100%\">\n<title>Staafdiagram Per categorie met per categorie een staaf voor je eigen score, een stip met het gemiddelde van de groep, een grijze lijn van de laagste tot de hoogste score en twee stippellijnen bij 2,5 en 3,5</title>\n<rect x=\"0\" y=\"0\" width=\"800\" height=\"330\" rx=\"10\" fill=\"var(--bg)\"/>\n<line x1=\"60\" y1=\"250\" x2=\"640\" y2=\"250\" stroke=\"var(--border)\" stroke-width=\"1\"/><text x=\"48\" y=\"254\" text-anchor=\"end\" font-size=\"12\" fill=\"var(--ink-s)\">1</text>\n<line x1=\"60\" y1=\"195\" x2=\"640\" y2=\"195\" stroke=\"var(--border)\" stroke-width=\"1\"/><text x=\"48\" y=\"199\" text-anchor=\"end\" font-size=\"12\" fill=\"var(--ink-s)\">2</text>\n<line x1=\"60\" y1=\"140\" x2=\"640\" y2=\"140\" stroke=\"var(--border)\" stroke-width=\"1\"/><text x=\"48\" y=\"144\" text-anchor=\"end\" font-size=\"12\" fill=\"var(--ink-s)\">3</text>\n<line x1=\"60\" y1=\"85\" x2=\"640\" y2=\"85\" stroke=\"var(--border)\" stroke-width=\"1\"/><text x=\"48\" y=\"89\" text-anchor=\"end\" font-size=\"12\" fill=\"var(--ink-s)\">4</text>\n<line x1=\"60\" y1=\"30\" x2=\"640\" y2=\"30\" stroke=\"var(--border)\" stroke-width=\"1\"/><text x=\"48\" y=\"34\" text-anchor=\"end\" font-size=\"12\" fill=\"var(--ink-s)\">5</text>\n<line x1=\"60\" y1=\"167.5\" x2=\"640\" y2=\"167.5\" stroke=\"#9a978f\" stroke-width=\"1.5\" stroke-dasharray=\"5 5\"/>\n<line x1=\"60\" y1=\"112.5\" x2=\"640\" y2=\"112.5\" stroke=\"#9a978f\" stroke-width=\"1.5\" stroke-dasharray=\"5 5\"/>\n<text x=\"650\" y=\"171.5\" font-size=\"12\" fill=\"var(--ink-s)\">2,5: grens Uitbouwen</text>\n<text x=\"650\" y=\"116.5\" font-size=\"12\" fill=\"var(--ink-s)\">3,5: grens Sterk punt</text>\n<rect x=\"100\" y=\"156.5\" width=\"48\" height=\"93.5\" fill=\"var(--or)\" rx=\"3\"/>\n<text x=\"124\" y=\"148.5\" text-anchor=\"middle\" font-size=\"16\" font-weight=\"700\" fill=\"var(--ink)\">2,7</text>\n<line x1=\"168\" y1=\"118.0\" x2=\"168\" y2=\"195.0\" stroke=\"#b3b0a8\" stroke-width=\"2\"/>\n<circle cx=\"168\" cy=\"145.5\" r=\"7\" fill=\"var(--or)\" stroke=\"#fff\" stroke-width=\"2\"/>\n<text x=\"134\" y=\"272\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"var(--ink-m)\">Overkoepelend</text>\n<rect x=\"208\" y=\"118.0\" width=\"48\" height=\"132.0\" fill=\"var(--bl)\" rx=\"3\"/>\n<text x=\"232\" y=\"110.0\" text-anchor=\"middle\" font-size=\"16\" font-weight=\"700\" fill=\"var(--ink)\">3,4</text>\n<line x1=\"276\" y1=\"79.50000000000003\" x2=\"276\" y2=\"151.0\" stroke=\"#b3b0a8\" stroke-width=\"2\"/>\n<circle cx=\"276\" cy=\"112.5\" r=\"7\" fill=\"var(--bl)\" stroke=\"#fff\" stroke-width=\"2\"/>\n<text x=\"242\" y=\"272\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"var(--ink-m)\">Organisatie</text>\n<rect x=\"316\" y=\"134.5\" width=\"48\" height=\"115.5\" fill=\"var(--pu)\" rx=\"3\"/>\n<text x=\"340\" y=\"126.5\" text-anchor=\"middle\" font-size=\"16\" font-weight=\"700\" fill=\"var(--ink)\">3,1</text>\n<line x1=\"384\" y1=\"90.5\" x2=\"384\" y2=\"167.5\" stroke=\"#b3b0a8\" stroke-width=\"2\"/>\n<circle cx=\"384\" cy=\"129.0\" r=\"7\" fill=\"var(--pu)\" stroke=\"#fff\" stroke-width=\"2\"/>\n<text x=\"350\" y=\"272\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"var(--ink-m)\">Proces & Tech</text>\n<rect x=\"424\" y=\"96.0\" width=\"48\" height=\"154.0\" fill=\"var(--gr)\" rx=\"3\"/>\n<text x=\"448\" y=\"88.0\" text-anchor=\"middle\" font-size=\"16\" font-weight=\"700\" fill=\"var(--ink)\">3,8</text>\n<line x1=\"492\" y1=\"62.99999999999997\" x2=\"492\" y2=\"140.0\" stroke=\"#b3b0a8\" stroke-width=\"2\"/>\n<circle cx=\"492\" cy=\"101.5\" r=\"7\" fill=\"var(--gr)\" stroke=\"#fff\" stroke-width=\"2\"/>\n<text x=\"458\" y=\"272\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"var(--ink-m)\">Mens</text>\n<rect x=\"532\" y=\"178.5\" width=\"48\" height=\"71.5\" fill=\"var(--ye)\" rx=\"3\"/>\n<text x=\"556\" y=\"170.5\" text-anchor=\"middle\" font-size=\"16\" font-weight=\"700\" fill=\"var(--ink)\">2,3</text>\n<line x1=\"600\" y1=\"140.0\" x2=\"600\" y2=\"200.5\" stroke=\"#b3b0a8\" stroke-width=\"2\"/>\n<circle cx=\"600\" cy=\"167.5\" r=\"7\" fill=\"var(--ye)\" stroke=\"#fff\" stroke-width=\"2\"/>\n<text x=\"566\" y=\"272\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"600\" fill=\"var(--ink-m)\">Fundament</text>\n<g data-nr=\"1\"><circle cx=\"76\" cy=\"162.5\" r=\"11\" fill=\"var(--ink)\"/><text x=\"76\" y=\"167.0\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"#fff\">1</text></g>\n<g data-nr=\"2\"><circle cx=\"180\" cy=\"111.5\" r=\"11\" fill=\"var(--ink)\"/><text x=\"180\" y=\"116.0\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"#fff\">2</text></g>\n<g data-nr=\"3\"><circle cx=\"250\" cy=\"65.50000000000003\" r=\"11\" fill=\"var(--ink)\"/><text x=\"250\" y=\"70.00000000000003\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"#fff\">3</text></g>\n<g data-nr=\"4\"><circle cx=\"34\" cy=\"112.5\" r=\"11\" fill=\"var(--ink)\"/><text x=\"34\" y=\"117.0\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"#fff\">4</text></g>\n<text x=\"60\" y=\"310\" font-size=\"12\" fill=\"var(--ink-s)\">Scores van 1 tot 5. Voorbeelddata.</text>\n</svg>"
  },
  {
    "slug": "score-vergelijken",
    "titel": "Je score vergelijken",
    "groep": "Je resultaten",
    "volgorde": 3,
    "rollen": [
      "Respondent",
      "Lead",
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "CLAUDE.md",
      "stylesheet.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Een score van 3,4 zegt pas iets als je weet waarmee je hem vergelijkt. Op je resultatenpagina staan daarvoor drie hulpmiddelen.\n\n## In het kort\nJe vergelijkt je score met de klassen, met je andere categorieën en met de bouwblokken die er het meest uitspringen. Zo zie je waar je sterk staat en waar de volgende stap ligt.\n\n## Wat je ziet\n1. **De klasse.** Onder 2,5 staat Basis op Orde, van 2,5 tot en met 3,49 Uitbouwen en vanaf 3,5 Sterk punt. De kleur van een score volgt de afgeronde waarde, van rood voor 1 tot donkergroen voor 5.\n2. **De categorieën naast elkaar.** Het staafdiagram laat zien welke categorie het hoogst en welke het laagst scoort.\n3. **De radar.** Elk bouwblok is een punt. Een punt dicht bij de rand is een sterk punt, een punt dicht bij het midden een bouwblok waar nog winst ligt.\n4. **De top 3.** De drie hoogste bouwblokken zijn je sterktes, de drie laagste je verbeterkansen.\n\n## Let op\nBij sommige scans weegt een bouwblok zwaarder mee in de categoriescore en de totaalscore. Een factor zoals \"2×\" naast de naam laat dat zien. De score van het bouwblok zelf blijft gewoon het gemiddelde van de vragen.\n\nDit onderwerp gaat over de Klantcontact Volwassenheidsscan en de Zorgscan. Bij de AI-scan staan de domeinen in een eigen overzicht, zonder categorieën. De Quickscan werkt met percentages en de klassen Goed op orde, Gemiddeld inzicht en Ontwikkelruimte.\n\n## Zie ook\n- [Je resultaten lezen](resultaten-lezen)",
    "svg": null
  },
  {
    "slug": "resultaten-meting",
    "titel": "Resultaten van een Meting",
    "groep": "Resultaten voor beheer",
    "volgorde": 1,
    "rollen": [
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "beheerpagina.md",
      "visualisatie-scores.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Vanaf een Meting open je het gemiddelde van alle afgeronde scans. Zo zie je in één oogopslag hoe de Organisatie scoort.\n\n## In het kort\nKlik bij een Meting op \"Naar resultaten\". Je ziet de totaalscore, de grafieken per categorie en de top 3. De schakelaar boven de resultaten wisselt tussen vier weergaven.\n\n## Wat je ziet\n1. **Overzicht.** De classificatiecirkel, de radar, het staafdiagram per categorie, de top 3 en de legenda.\n2. **Per bouwblok.** Een rij per bouwblok met een stip op het gemiddelde en een lijn van de laagste tot de hoogste score.\n3. **Spreiding.** Een stip per afgeronde scan, om te zien hoe verdeeld de Respondenten zijn.\n4. **Antwoorden.** De antwoorden per vraag en per Respondent.\n\n## Let op\nDe resultaten zijn te zien zodra er minstens één scan is afgerond. De knop \"Vergelijking\" werkt alleen als de Meting in een vergelijking tussen Metingen zit, die een Admin aanmaakt.\n\n## Zie ook\n- [Metingen en onderdelen](metingen-en-onderdelen)\n- [Je resultaten lezen](resultaten-lezen)",
    "svg": null
  },
  {
    "slug": "leads-toegang",
    "titel": "Leads toegang geven",
    "groep": "Resultaten voor beheer",
    "volgorde": 2,
    "rollen": [
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "beheerpagina.md",
      "datamodel.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Een Lead ziet niets totdat een Admin dat aanzet. Dat doe je in het Leads-venster van de Organisatie.\n\n## In het kort\nOpen de Organisatie en klik bij het blok Leads op \"Leads beheren\". In de tabel vink je per Lead en per Meting aan welke weergaven hij ziet. Na \"Opslaan\" geldt het direct.\n\n## Wat je ziet\n1. **De rijen.** Eén rij per Lead van deze Organisatie.\n2. **De kolommen per Meting.** Resultaten, Spreiding, Antwoorden, Uitnodigen en Exporteren. Spreiding, Antwoorden en Exporteren kunnen alleen aan als Resultaten van dezelfde Meting aan staat.\n3. **De kolommen per benchmark.** Eén kolom per benchmark waar de Organisatie in zit. Een grijs vakje heeft een Info-icoon dat zegt waarom het nog niet kan.\n4. **Opslaan.** Pas na \"Opslaan\" verandert toegang. \"Annuleren\" zet de vinkjes terug.\n\n## Let op\nEen nieuwe Lead en een nieuwe Meting beginnen zonder vinkjes. Er wordt niets vanzelf aangezet. Ook Antwoorden zonder namen kan pas aan bij genoeg afgeronde scans.\n\n## Zie ook\n- [Rollen en rechten](rollen-en-rechten)\n- [Resultaten van een Meting](resultaten-meting)",
    "svg": null
  },
  {
    "slug": "scan-aanmaken",
    "titel": "Een scan aanmaken",
    "groep": "Scans en Metingen",
    "volgorde": 1,
    "rollen": [
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "beheerpagina.md",
      "datamodel.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Een scan zet je klaar door een Meting te plannen bij een Organisatie.\n\n## In het kort\nOpen de Organisatie, kies het Assessment, het onderdeel en de meetdatum en klik op \"+ Meting plannen\". De app maakt zelf de naam van de Meting. Daarna nodig je Respondenten uit.\n\n## Wat elke keuze doet\n1. **Assessment.** De vragenlijst die je afneemt, zoals de Klantcontact Volwassenheidsscan of de AI-volwassenheidsscan.\n2. **Onderdeel.** Welk deel van de Organisatie je meet. Standaard staat er \"Hele organisatie\". Kies \"Nieuw onderdeel…\" om een nieuw onderdeel aan te maken.\n3. **Meetdatum.** De dag waarop de Meting plaatsvindt. Respondenten mogen er daarna nog dagen over doen. De datum is verplicht en bepaalt de volgorde in vergelijkingen.\n4. **De naam.** Onder de velden staat \"Wordt: …\". De naam volgt uit het onderdeel en de meetdatum, bijvoorbeeld \"Team A | okt 2026\".\n\n## Let op\nBestaat er al een Meting met dezelfde Organisatie, hetzelfde onderdeel, hetzelfde Assessment en dezelfde meetdatum, dan krijg je een waarschuwing. Je kunt toch doorgaan.\n\n## Zie ook\n- [Respondenten toevoegen](respondenten-toevoegen)\n- [Metingen en onderdelen](metingen-en-onderdelen)",
    "svg": null
  },
  {
    "slug": "respondenten-toevoegen",
    "titel": "Respondenten toevoegen",
    "groep": "Scans en Metingen",
    "volgorde": 2,
    "rollen": [
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "beheerpagina.md",
      "datamodel.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Respondenten vullen de scan in. Je voegt ze toe binnen een Meting, met hun e-mailadres.\n\n## In het kort\nVoer het e-mailadres in en klik op uitnodigen. Er ontstaat een scan met de status Uitgenodigd en een persoonlijke link. Zolang er geen mailserver is, kopieer je die link en deel je hem zelf.\n\n## Wat je ziet\n1. **Het e-mailadres.** Bestaat het adres al binnen de Organisatie, dan gebruikt de app dezelfde Respondent. Dat voorkomt dubbelen.\n2. **De knop \"Kopieer link\".** Zet de persoonlijke link op je klembord.\n3. **De knop \"Openen\".** Opent de link meteen in een nieuw tabblad, zodat je zelf kunt proberen hoe de Respondent het ziet.\n4. **De status.** Uitgenodigd, Bezig of Afgerond. Ze volgt wat de Respondent doet.\n\n## Let op\nEen Respondent kan alleen verwijderd worden samen met zijn scans. Zijn persoonlijke link werkt daarna niet meer.\n\n## Zie ook\n- [Een scan aanmaken](scan-aanmaken)\n- [Metingen en onderdelen](metingen-en-onderdelen)",
    "svg": null
  },
  {
    "slug": "metingen-en-onderdelen",
    "titel": "Metingen en onderdelen",
    "groep": "Scans en Metingen",
    "volgorde": 3,
    "rollen": [
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "beheerpagina.md",
      "datamodel.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Een Organisatie kan meerdere Metingen hebben, voor verschillende onderdelen en op verschillende momenten.\n\n## In het kort\nEen Meting hoort bij één Organisatie, één Assessment, één onderdeel en één meetdatum. Een onderdeel is een deel van de Organisatie, zoals een team of een afdeling. Je beheert onderdelen vanuit de Meting zelf.\n\n## Wat je ziet\n1. **Onderdeel.** Hele organisatie of een naam zoals \"Team A\". Een nieuw onderdeel ontstaat zodra je de Meting opslaat.\n2. **Het Meting-overzicht.** Per Meting zie je de Respondenten, de status van hun scans en de link naar de resultaten.\n3. **Wijzigen.** Je kunt het onderdeel en de meetdatum aanpassen. De naam volgt, tenzij je hem zelf hebt aangepast.\n4. **Hernoemen of verwijderen.** Een onderdeel kun je hernoemen. Verwijderen kan alleen als er geen Meting meer aan hangt. De KPI-waarden van het onderdeel verdwijnen dan mee, en de bevestiging noemt hoeveel.\n\n## Let op\nEen Meting zonder meetdatum heeft \"Datum ontbreekt\" en kan nog niet in een vergelijking of samengestelde Meting.\n\n## Zie ook\n- [Een samengestelde Meting maken](samengestelde-meting)\n- [KPI's invullen](kpis-invullen)\n- [Een scan aanmaken](scan-aanmaken)",
    "svg": null
  },
  {
    "slug": "samengestelde-meting",
    "titel": "Een samengestelde Meting maken",
    "groep": "Scans en Metingen",
    "volgorde": 4,
    "rollen": [
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "benchmark.md",
      "beheerpagina.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Een samengestelde Meting is het gemiddelde van meerdere Metingen van dezelfde Organisatie en hetzelfde Assessment.\n\n## In het kort\nKies \"Gemiddelde maken\" boven de lijst Metingen, vink minstens twee Metingen aan en sla op. Elke gekozen Meting telt even zwaar mee, ongeacht hoeveel Respondenten erin zaten.\n\n## Wat je ziet\n1. **De selectie.** Alle Metingen van de Organisatie voor dat Assessment, op meetdatum. Een Meting met te weinig scans of zonder meetdatum is uitgeschakeld, met de reden erbij.\n2. **De meetdatum.** Die volgt de nieuwste Meting in de selectie. Je vult hem niet zelf in.\n3. **De waarschuwing.** Kies je twee Metingen van hetzelfde onderdeel, dan zegt de app dat een gemiddelde over twee momenten weinig zegt over de ontwikkeling. Je kunt toch opslaan.\n4. **Het gebruik.** Een samengestelde Meting doet mee als één deelnemer in een benchmark en in een vergelijking tussen Metingen.\n\n## Let op\nEen samengestelde Meting heeft geen eigen Respondenten en geen antwoorden per vraag. Haar scores worden berekend uit de Metingen waaruit ze bestaat.\n\n## Zie ook\n- [Metingen en onderdelen](metingen-en-onderdelen)",
    "svg": null
  },
  {
    "slug": "kpis-invullen",
    "titel": "KPI's invullen",
    "groep": "Scans en Metingen",
    "volgorde": 5,
    "rollen": [
      "Consultant",
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "beheerpagina.md",
      "datamodel.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "KPI's zoals de gemiddelde afhandeltijd, de NPS en het aantal contacten per jaar horen bij de Organisatie. Je vult ze in op het organisatie-detail, per plek en eventueel per kanaal.\n\n## In het kort\nOp het organisatie-detail staat de kaart KPI's met een tabel. De kolom Algemeen geldt voor de hele Organisatie, de andere kolommen zijn de onderdelen. Met \"KPI's invullen\" vul je alles in één venster in.\n\n## Wat je ziet\n1. **De tabel.** De KPI's staan in de rijen, Algemeen en de onderdelen in de kolommen. Onder elke kolomnaam staat hoeveel KPI's er al zijn ingevuld.\n2. **Een onderdeel toevoegen.** Met \"+ Onderdeel toevoegen\" maak je een onderdeel aan, bijvoorbeeld een team. Het potlood bij de naam hernoemt of verwijdert het onderdeel.\n3. **KPI's invullen.** Kies bovenin de plek, Algemeen of een onderdeel. Kies daarna welke kanalen je wilt uitsplitsen. Een grijs vak met \"n.v.t.\" zegt dat de KPI op die plek niet mag.\n4. **Opslaan.** Wisselen van plek bewaart wat je invulde. Eén keer opslaan bewaart de wijzigingen van alle plekken.\n\n## Let op\nEen onderdeel kun je pas verwijderen als er geen Meting meer aan hangt. Een Admin bepaalt bij Organisatievelden welke KPI's en kanalen er zijn en of een KPI per onderdeel of per kanaal mag.\n\n## Zie ook\n- [Metingen en onderdelen](metingen-en-onderdelen)\n- [Een scan aanmaken](scan-aanmaken)",
    "svg": null
  },
  {
    "slug": "verkennen",
    "titel": "Verkennen",
    "groep": "Verkennen en Benchmarks",
    "volgorde": 1,
    "rollen": [
      "Admin"
    ],
    "toegang": [],
    "afbeelding": "verkennen.svg",
    "film": "meetperiode",
    "bronnen": [
      "visualisatie-verkennen.md",
      "benchmark.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Met Verkennen zoek je patronen in alle Organisaties van één Assessment. Je filtert op kenmerken en vergelijkt groepen, zonder iets op te slaan.\n\n## In het kort\nJe begint met drie keuzes bovenaan: het Assessment, de Eenheid en de Meetperiode. Samen bepalen ze de pool, de groep Organisaties die meedoet. Daaronder kies je kenmerken om te filteren en te groeperen.\n\n## Wat elke keuze doet\n1. **Assessment.** Verkennen werkt binnen één Assessment. Scores van verschillende Assessments worden niet door elkaar gezet.\n2. **Eenheid.** Bij Organisaties telt elke Organisatie één keer. Bij Onderdelen telt elk onderdeel met een eigen Meting apart.\n3. **Meetperiode.** Bij \"Meest recente\" telt per Organisatie de nieuwste Meting. Bij \"Periode\" kies je twee datums en telt de laatste Meting met een meetdatum in die periode.\n4. **De pool.** Onderaan staat hoeveel Organisaties meedoen, uit hoeveel er voor dit Assessment in aanmerking komen. Daarmee zie je meteen wat een filter of een periode kost.\n\n## Voorbeeld uit de praktijk\nEen eerste meting vond plaats half januari tot begin februari, een volgende ronde in oktober. Kies je voor de eerste ronde Periode met 12-01-2026 tot en met 10-02-2026, dan tellen de Metingen van die ronde, ook al hebben sommige Organisaties inmiddels een nieuwe. Organisaties zonder Meting in die periode doen niet mee en staan in een regel onder de keuze.\n\n## Let op\nAlleen Organisaties met toestemming voor benchmark en met genoeg afgeronde scans doen mee. Kleine groepen krijgen een waarschuwing of staan gestreept, volgens de drempels bij Instellingen. Een Consultant heeft dit scherm niet.\n\n## Zie ook\n- [Benchmarks](benchmarks)\n- [Drempels en termijnen](drempels-en-termijnen)",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 680 300\" role=\"img\" width=\"100%\">\n<title>Bovenkant van het scherm Verkennen met een keuzelijst Assessment, de keuze Eenheid, de keuze Meetperiode met twee datums en de teller met het aantal Organisaties in de pool</title>\n<rect x=\"0\" y=\"0\" width=\"680\" height=\"300\" rx=\"10\" fill=\"var(--bg)\" stroke=\"var(--border)\"/>\n<text x=\"60\" y=\"40\" font-size=\"12\" font-weight=\"700\" letter-spacing=\"1.2\" fill=\"var(--ink-s)\">ASSESSMENT</text>\n<rect x=\"60\" y=\"50\" width=\"300\" height=\"40\" rx=\"6\" fill=\"#fff\" stroke=\"var(--border-d)\"/><text x=\"76\" y=\"75\" font-size=\"14\" fill=\"var(--ink)\">Klantcontact Volwassenheid</text><path d=\"M336 66 l6 7 l6 -7 z\" fill=\"var(--ink-m)\"/>\n<g data-nr=\"1\"><circle cx=\"40\" cy=\"70\" r=\"11\" fill=\"var(--ink)\"/><text x=\"40\" y=\"74.5\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"#fff\">1</text></g>\n<text x=\"400\" y=\"40\" font-size=\"12\" font-weight=\"700\" letter-spacing=\"1.2\" fill=\"var(--ink-s)\">EENHEID</text>\n<rect x=\"400\" y=\"52\" width=\"110\" height=\"32\" rx=\"16\" fill=\"var(--or)\" stroke=\"var(--or)\"/><text x=\"455.0\" y=\"73\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"600\" fill=\"#fff\">Organisaties</text><rect x=\"518\" y=\"52\" width=\"100\" height=\"32\" rx=\"16\" fill=\"#fff\" stroke=\"var(--border-d)\"/><text x=\"568.0\" y=\"73\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"600\" fill=\"var(--ink-m)\">Onderdelen</text>\n<g data-nr=\"2\"><circle cx=\"382\" cy=\"68\" r=\"11\" fill=\"var(--ink)\"/><text x=\"382\" y=\"72.5\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"#fff\">2</text></g>\n<text x=\"60\" y=\"128\" font-size=\"12\" font-weight=\"700\" letter-spacing=\"1.2\" fill=\"var(--ink-s)\">MEETPERIODE</text>\n<rect x=\"60\" y=\"140\" width=\"130\" height=\"32\" rx=\"16\" fill=\"#fff\" stroke=\"var(--border-d)\"/><text x=\"125.0\" y=\"161\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"600\" fill=\"var(--ink-m)\">Meest recente</text><rect x=\"198\" y=\"140\" width=\"90\" height=\"32\" rx=\"16\" fill=\"var(--or)\" stroke=\"var(--or)\"/><text x=\"243.0\" y=\"161\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"600\" fill=\"#fff\">Periode</text>\n<rect x=\"310\" y=\"136\" width=\"130\" height=\"40\" rx=\"6\" fill=\"#fff\" stroke=\"var(--border-d)\"/><text x=\"326\" y=\"161\" font-size=\"14\" fill=\"var(--ink)\">12-01-2026</text>\n<text x=\"450\" y=\"161\" font-size=\"14\" fill=\"var(--ink-m)\">tot en met</text>\n<rect x=\"528\" y=\"136\" width=\"130\" height=\"40\" rx=\"6\" fill=\"#fff\" stroke=\"var(--border-d)\"/><text x=\"544\" y=\"161\" font-size=\"14\" fill=\"var(--ink)\">10-02-2026</text>\n<g data-nr=\"3\"><circle cx=\"40\" cy=\"156\" r=\"11\" fill=\"var(--ink)\"/><text x=\"40\" y=\"160.5\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"#fff\">3</text></g>\n<text x=\"60\" y=\"204\" font-size=\"12\" fill=\"var(--ink-s)\">Per organisatie telt de laatste Meting tussen 12-01-2026 en 10-02-2026.</text>\n<line x1=\"60\" y1=\"224\" x2=\"640\" y2=\"224\" stroke=\"var(--border)\"/>\n<text x=\"60\" y=\"252\" font-size=\"14\" font-weight=\"700\" fill=\"var(--ink)\">32 van 44 Organisaties in de pool</text>\n<rect x=\"60\" y=\"264\" width=\"580\" height=\"8\" rx=\"4\" fill=\"var(--bg-mid)\"/><rect x=\"60\" y=\"264\" width=\"422\" height=\"8\" rx=\"4\" fill=\"var(--or)\"/>\n<g data-nr=\"4\"><circle cx=\"40\" cy=\"250\" r=\"11\" fill=\"var(--ink)\"/><text x=\"40\" y=\"254.5\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"700\" fill=\"#fff\">4</text></g>\n<text x=\"60\" y=\"292\" font-size=\"12\" fill=\"var(--ink-s)\">Voorbeelddata.</text>\n</svg>"
  },
  {
    "slug": "benchmarks",
    "titel": "Benchmarks",
    "groep": "Verkennen en Benchmarks",
    "volgorde": 2,
    "rollen": [
      "Admin"
    ],
    "toegang": [],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "benchmark.md",
      "beheerpagina.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Een benchmark zet de scores van een zelf gekozen groep naast elkaar. Je maakt hem voor een Lead, die er een view van krijgt.\n\n## In het kort\nOnder Resultaten, Benchmarks stel je een groep samen van Organisaties met hun Metingen. Daarna zet je in het Leads-venster aan welke Lead de view ziet. De Lead ziet alleen gemiddelden, nooit de namen van de andere deelnemers.\n\n## Wat je ziet\n1. **Tussen Organisaties.** Elke Organisatie met toestemming voor benchmark is een lid, met één Meting per Assessment. Je kunt ook een Verkenning opslaan als benchmark, dan volgen de leden uit de filters.\n2. **Binnen een Organisatie.** Een vergelijking van twee of meer Metingen, met de lezing Ontwikkeling over tijd of Naast elkaar.\n3. **Binnen een Meting.** De spreiding van de scans, en voor jou de positie van één scan.\n4. **De teller.** Boven elk Assessment staat \"X van Y Organisaties\". Zakt die onder de drempel, dan krijgt de teller een waarschuwingskleur en kan een Lead de view niet aanzetten.\n\n## Let op\nEen Organisatie kan alleen meedoen als je de vlag voor benchmark hebt aangezet, nadat dit met de Organisatie is afgesproken.\n\n## Zie ook\n- [Verkennen](verkennen)\n- [Leads toegang geven](leads-toegang)",
    "svg": null
  },
  {
    "slug": "resultaten-organisatie",
    "titel": "Resultaten van je Organisatie",
    "groep": "Voor Leads",
    "volgorde": 1,
    "rollen": [
      "Lead"
    ],
    "toegang": [
      "resultaten"
    ],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "visualisatie-scores.md",
      "visualisatie-mijn-metingen.md",
      "beheerpagina.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Als Lead zie je niet alleen je eigen scan, maar ook de resultaten van de Meting waarvoor een Admin je toegang gaf.\n\n## In het kort\nOp Mijn metingen staat per Meting een kaart. Daarop open je de resultaten van de hele Meting: het gemiddelde van alle afgeronde scans, per categorie en per bouwblok. Een Meting is pas te zien als er genoeg scans zijn afgerond.\n\n## Wat je ziet\n1. **De kaart van de Meting.** Met het aantal Respondenten dat al klaar is en de knop \"Resultaten\".\n2. **Tussenstand of Eindstand.** Zolang de Meting open is, zijn het gemiddelden van de scans tot nu toe. Zodra de Meting is afgesloten, zijn het de eindcijfers.\n3. **Overzicht en Per bouwblok.** De schakelaar boven de resultaten wisselt tussen de totaalscore met de grafieken en een regel per bouwblok met een stip op het gemiddelde.\n4. **Het aantal scans.** Onder de titel staat uit hoeveel afgeronde scans het gemiddelde bestaat.\n\n## Let op\nIs het aantal afgeronde scans kleiner dan de grens die een Admin instelt (beginwaarde 5), dan staat er \"Resultaten volgen bij minstens 5 afgeronde scans\" met de teller. Het gemiddelde van twee scans zou verraden wat iemand invulde.\n\n## Zie ook\n- [Je resultaten lezen](resultaten-lezen)\n- [Spreiding binnen een Meting](spreiding-meting)",
    "svg": null
  },
  {
    "slug": "spreiding-meting",
    "titel": "Spreiding binnen een Meting",
    "groep": "Voor Leads",
    "volgorde": 2,
    "rollen": [
      "Lead"
    ],
    "toegang": [
      "spreiding"
    ],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "visualisatie-scores.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Een gemiddelde verbergt of iedereen het eens is of niet. De weergave Spreiding laat zien hoe de scores van de Respondenten verdeeld zijn.\n\n## In het kort\nBij elk bouwblok staat een rij met een grijze stip per afgeronde scan en een streep op het gemiddelde. Liggen de stippen dicht bij elkaar, dan zijn de Respondenten het eens. Liggen ze ver uit elkaar, dan zien ze de situatie verschillend.\n\n## Wat je ziet\n1. **De stippen.** Eén per afgeronde scan, op de score van dat bouwblok. Scans met dezelfde score staan onder elkaar. De stippen hebben geen naam.\n2. **De streep.** Het gemiddelde van de Meting voor dat bouwblok.\n3. **Het label.** Eensgezind, Wisselend of Verdeeld, afhankelijk van hoe ver de scores uit elkaar liggen.\n4. **De sortering.** Standaard staan de bouwblokken in de volgorde van het model. Je kunt ze ook sorteren op spreiding.\n\n## Let op\nSpreiding is er pas vanaf een minimum aantal afgeronde scans (beginwaarde 5, aan te passen door een Admin), en alleen als een Admin het vinkje Spreiding voor jou aan zette.\n\n## Zie ook\n- [Resultaten van je Organisatie](resultaten-organisatie)",
    "svg": null
  },
  {
    "slug": "antwoorden-per-vraag",
    "titel": "Antwoorden per vraag",
    "groep": "Voor Leads",
    "volgorde": 3,
    "rollen": [
      "Lead"
    ],
    "toegang": [
      "antwoorden"
    ],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "visualisatie-scores.md",
      "beheerpagina.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "De weergave Antwoorden laat zien wat elke Respondent bij elke vraag antwoordde. Het is het meest gedetailleerde niveau.\n\n## In het kort\nJe ziet een tabel met de bouwblokken als rijen en de Respondenten als kolommen. Klap een bouwblok open en je ziet de vragen met de antwoorden. De kleur van elke cel volgt het antwoord.\n\n## Wat je ziet\n1. **De kolommen.** Eén per afgeronde scan. Is het tonen van namen uitgezet, dan heten de kolommen R1 tot en met Rn. Anders staan er initialen en toont een tooltip de naam.\n2. **De bouwblokken.** Standaard ingeklapt. Met \"Alles uitklappen\" zie je alle vragen.\n3. **De cijfers.** Een antwoord is een getal van 1 tot 5. Bij een bouwblok staat per Respondent het gemiddelde. Rechts staan het gemiddelde en het aantal antwoorden.\n4. **De totaalscore.** De onderste rij toont de totaalscore per Respondent.\n\n## Let op\nDit zijn antwoorden van personen. Daarom zet een Admin deze weergave alleen aan voor een Lead die het nodig heeft. Opmerkingen bij een bouwblok staan er niet in.\n\n## Zie ook\n- [Spreiding binnen een Meting](spreiding-meting)",
    "svg": null
  },
  {
    "slug": "respondenten-uitnodigen-lead",
    "titel": "Respondenten uitnodigen",
    "groep": "Voor Leads",
    "volgorde": 4,
    "rollen": [
      "Lead"
    ],
    "toegang": [
      "uitnodigen"
    ],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "beheerpagina.md",
      "datamodel.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Een Admin kan je toestemming geven om zelf Respondenten voor een Meting uit te nodigen. Dat doe je vanaf je pagina Mijn metingen.\n\n## In het kort\nJe voert het e-mailadres van een collega in. Zij krijgen een persoonlijke link en verschijnen bij de Meting met de status Uitgenodigd.\n\n## Wat je ziet\n1. **De knop \"Respondenten uitnodigen\".** Die staat op de kaart van de Meting waarvoor de Admin Uitnodigen aanzette.\n2. **Het e-mailadres.** Bestaat het adres al binnen je Organisatie, dan gebruikt Coniche Scan dezelfde Respondent opnieuw.\n3. **De persoonlijke link.** Kopieer de link en deel hem zelf met de collega.\n4. **De voortgang.** Op de kaart zie je hoeveel Respondenten klaar zijn, met een percentage.\n\n## Zie ook\n- [Resultaten van je Organisatie](resultaten-organisatie)",
    "svg": null
  },
  {
    "slug": "benchmark-vergelijking",
    "titel": "Benchmark en vergelijking",
    "groep": "Voor Leads",
    "volgorde": 5,
    "rollen": [
      "Lead"
    ],
    "toegang": [
      "benchmark"
    ],
    "afbeelding": null,
    "film": null,
    "bronnen": [
      "benchmark.md",
      "visualisatie-scores.md",
      "visualisatie-mijn-metingen.md"
    ],
    "bijgewerkt": "2026-10-19",
    "tekst": "Een benchmark zet de scores van je Organisatie naast die van een groep. Een vergelijking zet twee Metingen van je eigen Organisatie naast elkaar.\n\n## In het kort\nHeeft een Admin een benchmark voor je aangezet, dan staat er op Mijn metingen een kaart voor. Daarin zie je hoe je Organisatie scoort tegenover het gemiddelde van de andere deelnemers, zonder hun namen.\n\n## Wat je ziet\n1. **De kaart.** Met de naam van de benchmark en het aantal deelnemende Organisaties. Dat aantal staat er alleen als er genoeg deelnemers zijn.\n2. **Jouw Organisatie tegenover de groep.** Een radar en een staafdiagram met twee reeksen: Jouw Organisatie en de rest van de groep.\n3. **De positie per bouwblok.** Per bouwblok zie je het bereik van de groep, het middelste deel en jouw score, met een label voor je positie.\n4. **Een vergelijking tussen Metingen.** Heb je Resultaten op twee Metingen van de vergelijking, dan zie je hoe de scores zich ontwikkelen of naast elkaar liggen.\n\n## Let op\nJe ziet nooit de naam van een andere deelnemer, ook niet van een andere Meting in een vergelijking.\n\n## Zie ook\n- [Resultaten van je Organisatie](resultaten-organisatie)",
    "svg": null
  }
];
