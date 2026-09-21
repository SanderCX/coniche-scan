# Coniche Scan — Aanpassingen op v1

Voor direct terug naar de bouwer, nog voordat v1 als afgerond geldt.
Onderscheid met BACKLOG.md: dat is "later, bewust nog niet opgepakt",
dit is "nu, actief punt voor de bouw".

Legenda:
- **Afwijking** — gebouwd anders dan de CLAUDE.md-spec, dus een bug t.o.v.
  wat al was afgesproken
- **Aanpassing** — bewust anders gewenst dan wat gebouwd is, geen bug
- **Vraag** — input van de bouwer nodig voordat het een aanpassing wordt

## Actief

### Doorloopflow-sidebar

11. **[Afwijking]** De linkerbalk (sidebar) in de doorloopflow scrollt nu
    mee met de rest van de pagina. Moet op zijn plek blijven staan
    (sticky) terwijl de content rechts scrolt, met precies één eigen
    scrollgebied als de inhoud te lang wordt — geen extra scrollbar op
    de pagina zelf. Vraagt een vaste nav-hoogte (`--nav-h`, nieuw
    token) om tegenaan te kunnen zetten. Exacte CSS-fix staat in
    `stylesheet.md` bij "Sticky sidebar". Geldt boven de
    900px-breakpoint; daaronder is de sidebar al `position: static`,
    dat blijft ongewijzigd.

### Ingevulde scans (beheer)

10. **[Aanpassing]** Organisatie-kolom toevoegen aan het "Ingevulde
    scans"-overzicht — ontbreekt nu, terwijl dit overzicht over alle
    organisaties heen spant (dus zonder die kolom niet te zien bij welke
    organisatie een rij hoort). Tegelijk: alle kolommen sorteerbaar
    maken. Zie `admin-beheerpagina.md` punt 6 voor de volledige
    kolomlijst.

### Toegang / URL-structuur

2. **[Aanpassing]** Elke scan-instantie (Organisatie) en elke individuele
   invulversie van een respondent krijgt een eigen niet-herleidbare unieke
   URL — een lange ongokbare token, niet oplopend en niet afgeleid van het
   e-mailadres. De URL alleen is niet genoeg toegang, het volledige
   toegangsmechanisme:
   1. Coniche maakt de persoon aan (met e-mailadres), die persoon ontvangt
      de unieke URL per mail
   2. Klikken op de link opent een verificatiepagina (nog geen scan-inhoud)
   3. Respondent vult zijn e-mailadres in op die verificatiepagina
   4. Systeem stuurt een verificatiecode naar dat e-mailadres, geldig 15
      minuten
   5. Respondent vult de code in, pas dan opent de scanpagina zelf — dit
      is eerst scherm 4 (Respondent-intake: naam, rol, team, notities),
      pas na het invullen daarvan begint de doorloopflow zelf. Zie
      CLAUDE.md sectie 1 (Respondent) voor wat dit betekent voor de
      Naam-kolom in "Ingevulde scans": die toont het e-mailadres als
      fallback totdat deze stap voltooid is, en de status springt op dit
      moment van "uitgenodigd" naar "bezig".

   Geen los wachtwoord of account, wel een verstuurmechanisme voor
   verificatiecodes nodig (mailservice). Raakt de kern van de
   doorloopflow uit CLAUDE.md sectie 2 (respondent-uitnodiging per
   e-mail), dus niet pas bij de beheerpagina oppakken.

   **Correctie, was niet expliciet genoeg gespecificeerd**: alleen de
   verificatiecode (stap 4) is tijdgebonden, 15 minuten. De link/token
   zelf (stap 1) verloopt NIET en is NIET eenmalig — die moet onbeperkt
   herbruikbaar blijven, ook na een voltooide verificatie, zodat een
   respondent later via dezelfde link kan terugkeren (zie ook
   BACKLOG.md, "Terugkomen bij eerdere scans"). Elke keer dat de link
   geopend wordt, opnieuw naar de verificatiepagina, opnieuw een nieuwe
   code aanvragen — de link zelf hoeft daarvoor niet ongeldig te worden.

   **2a. Tussenoplossing, vervangt nog niet de volledige verificatieflow**:
   zolang er geen mailservice is, wordt de publieke link
   (`#/scan/<respondent-id>`) niet automatisch gemaild, maar handmatig
   door de admin gedeeld:
   1. Admin nodigt een respondent uit vanuit een Organisatie-
      detailpagina (alleen e-mailadres) → respondent-record met status
      `"uitgenodigd"`, `naam` leeg.
   2. Admin kopieert de publieke link vanaf de scan-detailpagina in
      beheer ("Publieke link"-veld, met kopieerknop) en deelt die zelf
      (mail, chat, etc.) — geen verstuurmechanisme.
   3. Respondent opent de link. Zolang status `"uitgenodigd"` is, toont
      dit geen verificatiescherm en geen doorloopflow, maar direct
      scherm 4 (Respondent-intake: naam, rol/functie, team, notities) —
      vooraf ingevuld als er al eerder gegevens waren (bijv. na een
      reset, zie hieronder).
   4. Bij versturen wordt hetzelfde respondent-record bijgewerkt (geen
      nieuw record): `naam`/`rol`/`team`/`notities` ingevuld, status →
      `"bezig"`, `gestartOp` gezet op dit moment. Pas dan begint de
      doorloopflow.

   Nadrukkelijk geen onderdeel hiervan: geen e-mailverificatiecode, geen
   15-minuten-geldigheid, geen aparte verificatiepagina — dat blijft het
   openstaande punt hierboven. De link zelf is niet anders beveiligd dan
   "wie de URL heeft, kan 'm openen" (ongokbare token, geen wachtwoord) —
   functioneel gelijk aan wat hierboven al over token-geldigheid staat
   (onbeperkt herbruikbaar, niet eenmalig), alleen zonder de code-stap
   ervoor.

   Samenhang met "Ingevulde scans verwijderen" (reset, zie
   `admin-beheerpagina.md`): die actie zet status terug naar
   `"uitgenodigd"` zonder naam/e-mail te wissen — de respondent komt dan
   bij een volgende keer openen van dezelfde link opnieuw op scherm 4
   terecht, met de vorige naam/rol/team/notities al ingevuld.

## Opgelost

Compact gehouden — wie de volledige oorspronkelijke toelichting nodig
heeft, kan die desgewenst opvragen, maar voor de bouw is hier alleen
relevant dát het is opgelost:

1. ✅ Resultatenpagina: navigatie ("Terug naar scan", export-acties) hoort
   in `.nav-right`, niet als losse pagina-knop — gebouwd.
3. ✅ Toelichting per bouwblok: overlay/modal met `toelichting`-veld,
   content uit `coniche_bouwstenen.md` — gebouwd.
4. ✅ Stylesheet.md (kleuren/fonts/logo) wordt nu toegepast op alle
   schermen.
5. ✅ Nav en footer zijn nu één gedeeld component, hergebruikt over alle
   schermen.
6. ✅ AI-samenvatting-tekst en -kaart zijn volledig van de individuele
   scan-pagina af.
7. ✅ Individuele scan-pagina heeft de twee losse CTA's ("Start
   assessment" direct + "Bekijk wat je krijgt" naar preview).
8. ✅ `.btn-danger` toegevoegd voor destructieve acties (was een ad-hoc
   rode outline-knop zonder spec, nu vervangen).
9. ✅ Knoppen binnen één actierij hebben gelijke breedte.

## Reeds bekend, geen nieuwe actie (ter info, stonden al in BACKLOG.md)

- CSV- en PDF-export werken nog niet — stond al expliciet benoemd als nog
  te bouwen in CLAUDE.md, geen afwijking.
- Admin-inlog en beheerpagina: inmiddels een eigen, actief werkspoor, zie
  `admin-beheerpagina.md`.
