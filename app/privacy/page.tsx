import { PageWithChrome } from "@/components/PageWithChrome";

/**
 * Privacypagina (`privacy-pagina.md`). Status daar: "Voorstel, structuur en
 * feiten staan, juridische formulering nog niet getoetst" — secties 5, 7 en
 * 8 bevatten daarom bewust placeholder-tekst, geen getoetste juridische
 * tekst.
 */
export default function PrivacyPage() {
  return (
    <PageWithChrome>
      <div className="container section" style={{ maxWidth: "42rem" }}>
        <span className="eyebrow">Coniche Scan</span>
        <h1>Privacy</h1>
        <p>
          Deze pagina legt uit welke gegevens de Coniche Scan verzamelt, waarvoor, en wie ze kan
          zien.
        </p>

        <h2 style={{ fontSize: "1.3rem" }}>1. Wie is verantwoordelijk</h2>
        <p>
          Coniche is verantwoordelijk voor de verwerking van gegevens in deze app.
          <br />
          <em className="text-ink-s">
            Placeholder: statutaire naam, adres, KvK-nummer, contact-e-mailadres voor
            privacyvragen.
          </em>
        </p>

        <h2 style={{ fontSize: "1.3rem" }}>2. Welke gegevens de app verzamelt</h2>
        <p>
          <strong>Van respondenten</strong> (medewerkers van de klantorganisatie die een scan
          invullen):
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>E-mailadres (bij uitnodigen)</li>
          <li>Naam, functie, team, notities (bij de intake, optioneel)</li>
          <li>Antwoorden op de scanvragen (1-5) en opmerkingen per bouwblok</li>
          <li>
            Technische gegevens die nodig zijn om de link te laten werken (de toegangscode zelf)
          </li>
        </ul>
        <p>
          <strong>Van de organisatie</strong> (ingevuld door Coniche, niet door respondenten):
          organisatiekenmerken zoals klantvolumes, kanaalgebruik, techstack en KPI&apos;s.
        </p>
        <p>
          <strong>Van beheerders</strong> (Coniche-medewerkers): e-mailadres en naam voor het
          beheeraccount.
        </p>

        <h2 style={{ fontSize: "1.3rem" }}>3. Waarvoor de gegevens worden gebruikt</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>De scan zelf laten werken (toegang via de link, tonen van resultaten).</li>
          <li>Resultaten en advies terugkoppelen aan de organisatie.</li>
          <li>Intern bij Coniche: analyse en advies aan de klant.</li>
        </ul>
        <p>
          Expliciet niet: individuele antwoorden herleiden naar een persoon buiten het doel van de
          scan, of gebruiken voor iets anders dan waarvoor de organisatie de scan heeft laten
          uitzetten.
        </p>

        <h2 style={{ fontSize: "1.3rem" }}>4. Toestemming</h2>
        <p>
          Bij het starten van een scan vraagt de app expliciet toestemming: &quot;Ik geef
          toestemming om mijn antwoorden (en eventueel ingevulde contactgegevens) te delen met
          Coniche voor analyse en advies.&quot;
        </p>

        <h2 style={{ fontSize: "1.3rem" }}>5. Bewaartermijn</h2>
        <p>
          <em className="text-ink-s">
            Placeholder: nog te bepalen, hangt samen met een toekomstige functie om te melden dat
            data te oud wordt.
          </em>
        </p>

        <h2 style={{ fontSize: "1.3rem" }}>6. Wie de gegevens kan zien</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Respondenten: alleen hun eigen scan-invulling(en).</li>
          <li>
            Coniche-beheerders: organisaties en respondenten die zij zelf beheren, of, met de rol
            Admin, alles.
          </li>
          <li>Een Lead: resultaten van de metingen waar hij toegang toe heeft.</li>
          <li>
            Geen derden, behalve waar dat nodig is voor de techniek zelf (hosting,
            e-mailverzending).
          </li>
        </ul>

        <h2 style={{ fontSize: "1.3rem" }}>7. Beveiliging</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Toegang voor respondenten via een niet-herleidbare link, geen wachtwoord.</li>
          <li>Beheertoegang met wachtwoord, 2FA volgt met de backend.</li>
        </ul>
        <p>
          <em className="text-ink-s">Placeholder: waar de data wordt gehost, en of dat binnen de EU is.</em>
        </p>

        <h2 style={{ fontSize: "1.3rem" }}>8. Rechten van betrokkenen</h2>
        <p>
          <em className="text-ink-s">
            Placeholder: standaard AVG-rechten (inzage, correctie, verwijdering). Voor
            respondenten zonder account loopt een verzoek via de contactpersoon bij hun eigen
            organisatie, of rechtstreeks bij Coniche.
          </em>
        </p>

        <h2 style={{ fontSize: "1.3rem" }}>9. Cookies en tracking</h2>
        <p>
          <em className="text-ink-s">
            Placeholder: geen cookies of analytics buiten wat technisch noodzakelijk is voor de
            sessie.
          </em>
        </p>
      </div>
    </PageWithChrome>
  );
}
