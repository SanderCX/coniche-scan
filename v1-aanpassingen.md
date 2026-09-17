# Coniche Scan — Aanpassingen op v1

Voor direct terug naar Sander, nog voordat v1 als afgerond geldt. Onderscheid
met BACKLOG.md: dat is "later, na v1", dit is "nu, terug naar de bouwer".

Legenda:
- **Afwijking** — gebouwd anders dan de CLAUDE.md-spec, dus een bug t.o.v.
  wat al was afgesproken
- **Aanpassing** — bewust anders gewenst dan wat gebouwd is, geen bug
- **Vraag** — input van Sander nodig voordat het een aanpassing wordt

## Resultatenpagina

1. **[Aanpassing]** Geen algemene navigatie op de resultatenpagina — je kunt
   niet terug om bijvoorbeeld een vraag aan te passen. Nog niet in CLAUDE.md
   vastgelegd, dus nieuw punt, geen afwijking van de spec.

## Toegang / URL-structuur

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
   5. Respondent vult de code in, pas dan opent de scanpagina zelf

   Geen los wachtwoord of account, wel een verstuurmechanisme voor
   verificatiecodes nodig (mailservice, Sander regelt dit). Raakt de kern
   van de doorloopflow uit CLAUDE.md sectie 2 (respondent-uitnodiging per
   e-mail), dus niet pas bij de beheerpagina oppakken.

   **Correctie, was niet expliciet genoeg gespecificeerd**: alleen de
   verificatiecode (stap 4) is tijdgebonden, 15 minuten. De link/token
   zelf (stap 1) verloopt NIET en is NIET eenmalig — die moet onbeperkt
   herbruikbaar blijven, ook na een voltooide verificatie, zodat een
   respondent later via dezelfde link kan terugkeren (zie ook
   BACKLOG.md, "Terugkomen bij eerdere scans"). Elke keer dat de link
   geopend wordt, opnieuw naar de verificatiepagina, opnieuw een nieuwe
   code aanvragen — de link zelf hoeft daarvoor niet ongeldig te worden.
   Als er nu een foutmelding "link niet meer geldig" verschijnt ongeacht
   welk e-mailadres wordt ingevuld, is dat vermoedelijk hierdoor: de
   link zelf is ergens single-use of tijdgebonden gemaakt, terwijl alleen
   de code dat had moeten zijn.

## Toelichting per bouwblok

3. **[Aanpassing]** Elke bouwblok-kop in de doorloopflow krijgt een link/
   icoon naast de titel die een overlay (modal) opent met een langere
   uitleg van dat bouwblok — apart van de korte `omschrijving`-zin die er
   al onder de titel stond. Nieuw veld `toelichting` op `Bouwblok`, zie
   CLAUDE.md sectie 1.

   Aanname, nog te bevestigen: overlay/modal, geen aparte pagina — dat
   houdt de respondent in de flow zonder de voortgang te verlaten. Zeg
   het als dit een eigen pagina met URL moet worden in plaats van een
   modal.

   Content voor v1: de beschrijving + kernwoorden per bouwblok uit
   `coniche_bouwstenen.md` (het officiële Bouwstenenmodel), niet zelf
   herschrijven. Moet uiteindelijk bewerkbaar zijn via de beheerpagina
   (zie `admin-beheerpagina.md`), voor v1 mag het een vaste tekst per
   bouwblok in de content-data zijn.

## Look & feel (stylesheet.md nog niet toegepast)

4. **[Afwijking]** Geen van de schermen gebruikt op dit moment de kleuren,
   fonts of het logo uit `stylesheet.md` — dat stond er al voordat dit
   gebouwd werd, dus dit is geen nieuwe eis maar een afwijking van wat al
   was aangeleverd. Geldt voor alle schermen, met name genoemd:
   hoofdpagina (scherm 1), individuele scan-pagina (scherm 2). De
   voorbeeld-outputpagina (scherm 3) is al dichterbij, mist alleen nog
   het logo.

5. **[Aanpassing]** Navigatiebalk en footer moeten één gedeeld component
   worden, hergebruikt over alle schermen heen (zie CLAUDE.md sectie 5,
   nieuw toegevoegd bovenaan de schermflow) — nu kennelijk per pagina
   losstaand, of ontbrekend. Vormgeving exact zoals in `stylesheet.md`
   ("Logo-gebruik" en de nav-beschrijving onder "Layout en spacing").

6. **[Aanpassing]** AI-samenvatting-tekst en -kaart moeten volledig van de
   individuele scan-pagina (scherm 2) af, niet alleen als placeholder
   laten staan. Zie CLAUDE.md sectie 5 punt 2 en sectie 7 — dit is bewust
   voor v1 geschrapt, geen bug.

7. **[Correctie op eerdere documentatie]** De individuele scan-pagina
   (scherm 2) moet een directe "Start assessment"-knop hebben die meteen
   naar de intake gaat, los van de "Bekijk wat je krijgt"-knop die naar
   de preview leidt. Beide knoppen stonden al in de oorspronkelijke
   screenshots, maar CLAUDE.md sectie 5 beschreef scherm 2 eerder zonder
   dat expliciet als twee losse CTA's te benoemen — dat is nu
   gecorrigeerd in CLAUDE.md zelf. Dit is dus geen nieuwe eis van Joost,
   maar een gat in de eerdere spec dat rechtgezet is.

## Reeds bekend, geen nieuwe actie (ter info, stonden al in BACKLOG.md)

- CSV- en PDF-export werken nog niet — stond al expliciet als "vandaag niet
  gebouwd" in CLAUDE.md, geen afwijking.
- Admin-inlog en beheerpagina ontbreken — stond al in BACKLOG.md
  ("Beheerscherm voor organisatievelden, bouwblokken en vragen"). Wordt nu
  als eigen werkspoor met Joost opgepakt (zie admin-beheerpagina.md).
