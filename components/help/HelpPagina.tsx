"use client";

import Link from "next/link";
import { useState } from "react";
import { HELP_ONDERWERPEN } from "@/data/help-onderwerpen";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { HelpBlokken, HelpInline } from "@/components/help/HelpTekst";
import { HelpFilm, FilmNaam } from "@/components/help/HelpFilm";
import { KOP_KORT, KOP_LET_OP, KOP_PRAKTIJK, KOP_ZIE, KOPPEN_LIJST, HelpOnderwerp } from "@/lib/help-bron";
import {
  HelpGebruiker,
  artikelVan,
  inhoudsopgave,
  onderwerpenVoor,
  rolBadge,
  toonAdminLabel,
  zichtbaarheidsZin,
  zoekOnderwerpen,
} from "@/lib/help";

/**
 * De helppagina (`help.md`): Links een zoekveld en de inhoudsopgave van wat deze gebruiker mag zien, rechts één onderwerp in
 * de vaste opbouw. Eén component voor beheer (`/beheer/help`) en voor Respondent en Lead (`/help?code=`), met alleen een
 * andere basis voor de verwijzingen. Een onderwerp dat de rol niet mag zien, bestaat hier niet, ook niet met de directe link.
 */
export function HelpPagina({
  gebruiker,
  basis,
  code,
  slug,
}: {
  gebruiker: HelpGebruiker;
  /** `/help` of `/beheer/help`. */
  basis: string;
  /** Persoonlijke code van een Respondent of Lead, wordt aan elke verwijzing meegegeven. */
  code?: string;
  slug?: string;
}) {
  const [zoek, setZoek] = useState("");
  const zichtbaar = onderwerpenVoor(gebruiker, HELP_ONDERWERPEN);
  const gevonden = zoekOnderwerpen(zichtbaar, zoek);
  const opgave = inhoudsopgave(gevonden);
  const href = (s: string) => `${basis}/${s}${code ? `?code=${code}` : ""}`;
  const eerste = inhoudsopgave(zichtbaar)[0]?.onderwerpen[0];
  const onderwerp = slug ? zichtbaar.find((o) => o.slug === slug) : eerste;

  return (
    <div className="help-pagina">
      <Kruimelpad
        delen={[
          { label: "Help", href: onderwerp && slug ? `${basis}${code ? `?code=${code}` : ""}` : undefined },
          ...(onderwerp && slug ? [{ label: onderwerp.titel }] : []),
        ]}
      />
      <div className="help-layout">
        <aside className="help-zijbalk" aria-label="Inhoudsopgave van de help">
          <div className="admin-field" style={{ marginBottom: "var(--sp-4)" }}>
            <label htmlFor="help-zoek" className="sr-only">
              Zoek in de help
            </label>
            <input id="help-zoek" type="text" placeholder="Zoek in de help" value={zoek} onChange={(e) => setZoek(e.target.value)} autoComplete="off" />
          </div>
          <nav>
            {opgave.map((g) => (
              <div key={g.groep} className="help-groep">
                <h2 className="help-groep-kop">{g.groep}</h2>
                <ul>
                  {g.onderwerpen.map((o) => {
                    const actief = onderwerp?.slug === o.slug;
                    return (
                      <li key={o.slug}>
                        <Link href={href(o.slug)} className={`help-onderwerp-link ${actief ? "actief" : ""}`} aria-current={actief ? "page" : undefined}>
                          <span>{o.titel}</span>
                          {toonAdminLabel(gebruiker, o) && <span className="help-adminlabel">Admin</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {opgave.length === 0 && <p className="help-leeg">Geen onderwerpen gevonden voor &quot;{zoek}&quot;.</p>}
          </nav>
          <p className="help-zichtbaar">{zichtbaarheidsZin(gebruiker)}</p>
        </aside>
        <article className="help-artikel">
          {onderwerp ? (
            <Onderwerp o={onderwerp} href={href} gebruiker={gebruiker} />
          ) : (
            <div className="help-kaart">
              <h1 className="page-title">Dit onderwerp bestaat niet</h1>
              <p>Het onderwerp bestaat niet, of er is geen uitleg voor jouw rol. Kies een onderwerp in de inhoudsopgave.</p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

function Onderwerp({ o, href, gebruiker }: { o: HelpOnderwerp; href: (slug: string) => string; gebruiker: HelpGebruiker }) {
  const artikel = artikelVan(o);
  // Een onderwerp kan meer films hebben, gescheiden door een komma (`film: wat-krijg-ik, radar`).
  const films = (o.film ?? "").split(",").map((f) => f.trim()).filter(Boolean) as FilmNaam[];
  return (
    <>
      <div className="help-regel">
        <span className="eyebrow">Help</span>
        <span className="help-badge">{rolBadge(o)}</span>
        {toonAdminLabel(gebruiker, o) && <span className="help-adminlabel">Admin</span>}
      </div>
      <h1 className="page-title">{o.titel}</h1>
      <div className="help-intro">
        <HelpBlokken blokken={artikel.intro} href={href} />
      </div>
      {artikel.secties.map((s) => {
        if (s.kop === KOP_KORT)
          return (
            <div key={s.kop}>
              <section className="help-kaart help-kaart--kort">
                <h2 className="help-kaart-kop">{s.kop}</h2>
                <HelpBlokken blokken={s.blokken} href={href} />
              </section>
              {films.map((f) => (
                <HelpFilm key={f} naam={f} />
              ))}
              {o.svg && (
                <section className="help-kaart">
                  <h2 className="help-kaart-kop">Zo ziet het eruit</h2>
                  <span className="help-label">Voorbeeld met voorbeelddata</span>
                  <div className="help-illustratie" dangerouslySetInnerHTML={{ __html: o.svg }} />
                </section>
              )}
            </div>
          );
        if (KOPPEN_LIJST.includes(s.kop))
          return (
            <section key={s.kop} className="help-sectie">
              <h2>{s.kop}</h2>
              <HelpBlokken blokken={s.blokken} href={href} />
            </section>
          );
        if (s.kop === KOP_PRAKTIJK)
          return (
            <section key={s.kop} className="help-kaart">
              <h2 className="help-kaart-kop">{s.kop}</h2>
              <HelpBlokken blokken={s.blokken} href={href} />
            </section>
          );
        if (s.kop === KOP_LET_OP)
          return (
            <section key={s.kop} className="help-letop" role="note">
              <h2 className="help-kaart-kop">{s.kop}</h2>
              <HelpBlokken blokken={s.blokken} href={href} />
            </section>
          );
        if (s.kop === KOP_ZIE)
          return (
            <section key={s.kop} className="help-sectie help-zie">
              <h2>{s.kop}</h2>
              <ul className="help-opsomming">
                {s.blokken.flatMap((b) => (b.soort === "lijst" ? b.items : [])).map((item, i) => (
                  <li key={i}>
                    <HelpInline tekst={item} href={href} />
                  </li>
                ))}
              </ul>
            </section>
          );
        return null;
      })}
    </>
  );
}
