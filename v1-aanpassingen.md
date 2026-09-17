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

## Reeds bekend, geen nieuwe actie (ter info, stonden al in BACKLOG.md)

- CSV- en PDF-export werken nog niet — stond al expliciet als "vandaag niet
  gebouwd" in CLAUDE.md, geen afwijking.
- Admin-inlog en beheerpagina ontbreken — stond al in BACKLOG.md
  ("Beheerscherm voor organisatievelden, bouwblokken en vragen"). Wordt nu
  als eigen werkspoor met Joost opgepakt (zie admin-beheerpagina.md).
