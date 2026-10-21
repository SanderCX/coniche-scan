"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrganisaties, useRespondentPerToegangscode, markeerDossierGezien } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useInstellingen } from "@/lib/instellingen-store";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";
import { RadarChartView } from "@/components/RadarChartView";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { BouwblokChip, BouwblokCirkel } from "@/components/dossier/BouwblokChip";
import { SoortIcoon } from "@/components/icons/DossierIcons";
import { CLASSIFICATIE_INFO } from "@/lib/colors";
import { classificatie } from "@/lib/scoring";
import { formatScore } from "@/lib/format";
import { langeDatum } from "@/lib/mijn-metingen";
import { dossierRadar } from "@/lib/dossier-radar";
import { BouwblokResultaat } from "@/lib/scoring";
import { Assessment } from "@/lib/types";
import {
  DOSSIER_ASSESSMENT_IDS,
  LeadBlog,
  LeadCase,
  LeadDossier,
  LeadEvent,
  LeadNieuws,
  datumKort,
  filterOpBouwblok,
  itemsPerBouwblok,
  leadDossier,
} from "@/lib/dossier";

/**
 * De Dossierpagina van een Lead (`dossier.md`, Scherm 5): Het Dossier dat de Consultant voor deze Lead heeft opengezet, met een kop, een radar
 * per Assessment (de Klantcontact Volwassenheidsscan en de AI-scan) in een filtermodus, de Cases, het Nieuws, de Events en de Blogs. De naam van
 * de Organisatie in een Case staat er nergens, alleen de branche. Het gekozen bouwblok of AI-domein staat in de URL (`?bouwblok=…`), zodat de
 * terugknop van de browser werkt. Opent de Lead de pagina, dan wordt `dossierGezienOp` gezet.
 */
export default function DossierPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return (
    <Suspense fallback={null}>
      <DossierInhoud code={code} />
    </Suspense>
  );
}

/** Een radar met de bouwblokken van één Assessment en wat de Lead daarvan mag zien. */
interface RadarGegevens {
  assessment: Assessment;
  resultaten: BouwblokResultaat[];
}

/** Het woord voor een bouwblok in een tekst: Bij de AI-scan een domein. */
const eenheid = (a: Assessment) => (a.bouwblokLabel === "AI-domein" ? "domein" : "bouwblok");

function DossierInhoud({ code }: { code: string }) {
  const gegevens = useRespondentPerToegangscode(code);
  const alle = useOrganisaties();
  const assessments = useAssessments();
  const { korteNamen } = useInstellingen();
  const router = useRouter();
  const zoek = useSearchParams();
  const [pilId, setPilId] = useState<string | null>(null);
  const [eerdereOpen, setEerdereOpen] = useState(false);

  const lid = gegevens?.lid;
  const organisatie = gegevens?.organisatie;
  const dossier: LeadDossier | null = lid?.lead === true && organisatie ? leadDossier(organisatie, alle, korteNamen) : null;
  const dossierAanwezig = dossier !== null;
  const organisatieId = organisatie?.id;
  const lidId = lid?.id;

  // De Lead opent de pagina: De tag "Nieuw" op de kaart verdwijnt tot het Dossier weer wijzigt.
  useEffect(() => {
    if (dossierAanwezig && organisatieId && lidId) markeerDossierGezien(organisatieId, lidId);
  }, [dossierAanwezig, organisatieId, lidId]);

  if (!gegevens || !lid || !organisatie || !dossier) {
    return (
      <PageWithChrome code={code} toonTerug logoHref={`/s/${code}`}>
        <div className="container section" style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1>Geen dossier</h1>
          <p>Er staat op dit moment geen dossier voor je klaar.</p>
        </div>
      </PageWithChrome>
    );
  }

  const telling = itemsPerBouwblok(dossier);
  // Per Assessment een radar, alleen als minstens één zichtbaar item aan een bouwblok van dat Assessment hangt (`dossier.md`, Scherm 5).
  const radars: RadarGegevens[] = DOSSIER_ASSESSMENT_IDS.flatMap((id) => {
    const assessment = assessments.find((a) => a.id === id);
    if (!assessment) return [];
    const resultaten = dossierRadar(assessment, organisatie, lid.id).resultaten;
    return resultaten.some((r) => telling.has(r.bouwblok.id)) ? [{ assessment, resultaten }] : [];
  });
  const alleBouwblokken = radars.flatMap((r) => r.resultaten.map((res) => ({ ...res, assessment: r.assessment })));
  const gevraagd = zoek.get("bouwblok");
  const gekozen = gevraagd && telling.has(gevraagd) && alleBouwblokken.some((r) => r.bouwblok.id === gevraagd) ? gevraagd : null;
  const gekozenResultaat = alleBouwblokken.find((r) => r.bouwblok.id === gekozen);
  const gefilterd = filterOpBouwblok(dossier, gekozen);

  // Welke radar staat open: Die van het gekozen bouwblok, anders de gekozen pil, anders het Assessment met de meeste zichtbare items.
  const aantalVoor = (r: RadarGegevens) => r.resultaten.reduce((n, res) => n + (telling.get(res.bouwblok.id) ?? 0), 0);
  const meeste = [...radars].sort((a, b) => aantalVoor(b) - aantalVoor(a))[0];
  const actief = radars.find((r) => r.assessment.id === gekozenResultaat?.assessment.id) ?? radars.find((r) => r.assessment.id === pilId) ?? meeste;

  function kies(id: string | null) {
    router.push(id ? `/s/${code}/dossier?bouwblok=${encodeURIComponent(id)}` : `/s/${code}/dossier`, { scroll: false });
  }

  function kiesPil(id: string) {
    setPilId(id);
    // Een filter op een bouwblok van het andere Assessment zet de pil om: Wisselen van pil haalt het filter weg.
    if (gekozenResultaat && gekozenResultaat.assessment.id !== id) kies(null);
  }

  // Een chip bij een item: De bouwblokken die in een radar staan filteren, de rest (gearchiveerd) is alleen tekst.
  const chips = (ids: string[]) =>
    ids.flatMap((id) => {
      const r = alleBouwblokken.find((x) => x.bouwblok.id === id);
      if (!r) return [];
      return [
        <BouwblokChip
          key={id}
          volgnummer={r.bouwblok.volgnummer}
          naam={r.bouwblok.naam}
          groepKleur={r.groepKleur}
          gekozen={gekozen === id}
          onClick={() => kies(gekozen === id ? null : id)}
        />,
      ];
    });

  const datum = langeDatum(dossier.openSinds);
  const komend = gefilterd.events.filter((e) => !e.verlopen);
  const verlopen = gefilterd.events.filter((e) => e.verlopen);
  const komendTotaal = dossier.events.filter((e) => !e.verlopen).length;
  const heeftAi = radars.some((r) => r.assessment.bouwblokLabel === "AI-domein");
  const tegels = [
    { n: dossier.cases.length, een: "Case", meer: "Cases" },
    { n: dossier.nieuws.length, een: "Nieuwsbericht", meer: "Nieuwsberichten" },
    { n: komendTotaal, een: "Event", meer: "Events" },
    { n: dossier.blogs.length, een: "Blog", meer: "Blogs" },
  ].filter((t) => t.n > 0);

  return (
    <PageWithChrome logoHref={`/s/${code}`} code={code} toonTerug identiteitMenu={<MijnGegevensMenu lid={lid} />}>
      <div className="container dp-pagina">
        <header className="dp-kop">
          <div className="dp-kop-tekst">
            <span className="dp-eyebrow">Dossier</span>
            <h1 className="page-title">Dossier {dossier.organisatieNaam}</h1>
            <p>
              Je consultant heeft cases, nieuws, events en blogs verzameld die passen bij jullie situatie, met bij elk item uitleg waarom. Bij elk item staat het{" "}
              {heeftAi ? "bouwblok of AI-domein" : "bouwblok"} waar het over gaat.
            </p>
            <div className="dp-kop-chips">
              <span className="dp-kopchip">Gedeeld door je consultant</span>
              {datum && <span className="dp-kopchip">{datum}</span>}
            </div>
          </div>
          <div className="dp-tegels">
            {tegels.map((t) => (
              <div key={t.een} className="dp-tegel">
                <strong>{t.n}</strong>
                <span>{t.n === 1 ? t.een : t.meer}</span>
              </div>
            ))}
          </div>
        </header>

        {actief && (
          <section className="dp-radarkaart-wrap" aria-label="Waar dit dossier over gaat">
            {radars.length > 1 && (
              <div className="dp-pil">
                <WeergaveWissel<string>
                  ariaLabel="Assessment van de radar"
                  waarde={actief.assessment.id}
                  onChange={kiesPil}
                  opties={radars.map((r) => ({ waarde: r.assessment.id, label: `${PIL_NAAM[r.assessment.id] ?? r.assessment.kortLabel} ${aantalVoor(r)}` }))}
                />
              </div>
            )}
            <div className="dp-radarkaart">
              <div className="dp-radar">
                <RadarChartView
                  key={actief.assessment.id}
                  resultaten={actief.resultaten}
                  naam={`Organisatie ${dossier.organisatieNaam}`}
                  filter={{ actief: new Set(actief.resultaten.map((r) => r.bouwblok.id).filter((id) => telling.has(id))), gekozen, onKies: kies }}
                />
              </div>
              <div className="dp-radarlijst">
                <h2>Waar dit dossier over gaat</h2>
                <p className="dp-radarlijst-sub">
                  Kies een {eenheid(actief.assessment)} om de cases, het nieuws, de events en de blogs daarover te zien.
                </p>
                <ul>
                  {actief.resultaten
                    .filter((r) => telling.has(r.bouwblok.id))
                    .map((r) => {
                      const n = telling.get(r.bouwblok.id) ?? 0;
                      const score = r.score;
                      const regel = [r.groepNaam, score !== null ? formatScore(score) : null, score !== null ? CLASSIFICATIE_INFO[classificatie(score)].label : null]
                        .filter(Boolean)
                        .join(" · ");
                      return (
                        <li key={r.bouwblok.id}>
                          <button type="button" className={`dp-radarrij ${gekozen === r.bouwblok.id ? "is-gekozen" : ""}`} aria-pressed={gekozen === r.bouwblok.id} onClick={() => kies(gekozen === r.bouwblok.id ? null : r.bouwblok.id)}>
                            <BouwblokCirkel volgnummer={r.bouwblok.volgnummer} groepKleur={r.groepKleur} />
                            <span className="dp-radarrij-tekst">
                              <strong>{r.bouwblok.naam}</strong>
                              {regel && <span>{regel}</span>}
                            </span>
                            <span className="dp-radarrij-aantal">
                              {n} {n === 1 ? "item" : "items"}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          </section>
        )}

        {gekozenResultaat && (
          <div className="dp-filterbalk" role="status">
            <BouwblokCirkel volgnummer={gekozenResultaat.bouwblok.volgnummer} groepKleur={gekozenResultaat.groepKleur} groot />
            <span className="dp-filterbalk-tekst">
              <strong>{gekozenResultaat.bouwblok.naam}</strong>
              <span>
                {telling.get(gekozenResultaat.bouwblok.id) ?? 0} {(telling.get(gekozenResultaat.bouwblok.id) ?? 0) === 1 ? "item" : "items"} in dit dossier
              </span>
            </span>
            <button type="button" className="btn btn-outline btn-compact" onClick={() => kies(null)}>
              Alle items tonen ×
            </button>
          </div>
        )}

        {gefilterd.cases.length > 0 && (
          <section className="dp-sectie" aria-label="Cases">
            <SectieKop soort="case" titel="Cases" regel="Zo hebben andere organisaties het aangepakt" />
            {gefilterd.cases.map((c) => (
              <CaseKaart key={c.id} item={c} chips={chips(c.bouwblokIds)} />
            ))}
          </section>
        )}

        {gefilterd.nieuws.length > 0 && (
          <section className="dp-sectie" aria-label="Nieuws">
            <SectieKop soort="nieuws" titel="Nieuws" regel="Wat er speelt rond jullie organisatie" />
            {gefilterd.nieuws.map((n) => (
              <NieuwsRij key={n.id} item={n} chips={chips(n.bouwblokIds)} knop="Lees artikel ↗" />
            ))}
          </section>
        )}

        {gefilterd.events.length > 0 && (
          <section className="dp-sectie" aria-label="Events">
            <SectieKop soort="event" titel="Events" regel="Zien we je daar?" />
            {komend.map((e) => (
              <EventRij key={e.id} item={e} chips={chips(e.bouwblokIds)} />
            ))}
            {verlopen.length > 0 && (
              <>
                <button type="button" className="dp-eerdere" aria-expanded={eerdereOpen} aria-controls="dp-eerdere-lijst" onClick={() => setEerdereOpen(!eerdereOpen)}>
                  Eerdere events ({verlopen.length}) <span aria-hidden="true">{eerdereOpen ? "▲" : "▼"}</span>
                </button>
                {eerdereOpen && (
                  <div id="dp-eerdere-lijst">
                    {verlopen.map((e) => (
                      <EventRij key={e.id} item={e} chips={chips(e.bouwblokIds)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {gefilterd.blogs.length > 0 && (
          <section className="dp-sectie" aria-label="Blogs">
            <SectieKop soort="blog" titel="Blogs" regel="Om verder te lezen" />
            {gefilterd.blogs.map((b) => (
              <NieuwsRij key={b.id} item={b} chips={chips(b.bouwblokIds)} knop="Lees blog ↗" soort="blog" />
            ))}
          </section>
        )}

        <p className="dp-slot">Vragen over dit dossier? Je consultant helpt je graag verder.</p>
      </div>
    </PageWithChrome>
  );
}

/** De namen op de pillen boven de radar. */
const PIL_NAAM: Record<string, string> = { "klantcontact-volwassenheid": "Klantcontact Volwassenheid", "ai-volwassenheid": "AI-volwassenheid" };

function SectieKop({ soort, titel, regel }: { soort: "case" | "nieuws" | "event" | "blog"; titel: string; regel: string }) {
  return (
    <div className="dp-sectiekop">
      <span className={`dp-sectie-icoon dp-sectie-icoon--${soort}`} aria-hidden="true">
        <SoortIcoon soort={soort} />
      </span>
      <div>
        <h2>{titel}</h2>
        <p>{regel}</p>
      </div>
    </div>
  );
}

function CaseKaart({ item, chips }: { item: LeadCase; chips: React.ReactNode[] }) {
  return (
    <article className="dp-case">
      <div className={`dp-case-blok ${item.branche.length > 14 ? "dp-case-blok--lang" : ""}`}>
        <strong>{item.branche}</strong>
        <span>Branche</span>
      </div>
      <div className="dp-case-inhoud">
        <span className="dp-badge dp-badge--case">Case</span>
        <h3>{item.titel}</h3>
        <p className="dp-case-samenvatting">{item.samenvatting}</p>
        {(item.omvang || item.totResultaat) && (
          <div className="dp-case-tegels">
            {item.omvang && (
              <div className="dp-case-tegel">
                <span>Omvang</span>
                <strong>{item.omvang}</strong>
              </div>
            )}
            {item.totResultaat && (
              <div className="dp-case-tegel">
                <span>Tot resultaat</span>
                <strong>{item.totResultaat}</strong>
              </div>
            )}
          </div>
        )}
        {item.toelichting && (
          <div className="dp-waarom">
            <span>Waarom dit voor jullie telt</span>
            <p>{item.toelichting}</p>
          </div>
        )}
        {(chips.length > 0 || item.url) && (
          <div className="dp-case-voet">
            {chips.length > 0 && (
              <div className="dp-gaatover">
                <span>Gaat over</span>
                {chips}
              </div>
            )}
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-compact">
                Lees de case ↗
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function NieuwsRij({ item, chips, knop, soort = "nieuws" }: { item: LeadNieuws | LeadBlog; chips: React.ReactNode[]; knop: string; soort?: "nieuws" | "blog" }) {
  const datum = item.gepubliceerdOp ? new Date(`${item.gepubliceerdOp}T00:00:00Z`) : null;
  const geldig = datum && !Number.isNaN(datum.getTime());
  return (
    <article className="dp-nieuws">
      <div className={`dp-datumtegel dp-datumtegel--${soort}`}>
        {geldig ? (
          <>
            <span>{datum.toLocaleDateString("nl-NL", { month: "short", timeZone: "UTC" }).replace(".", "")}</span>
            <strong>{datum.getUTCDate()}</strong>
          </>
        ) : (
          <SoortIcoon soort={soort} />
        )}
      </div>
      <div className="dp-nieuws-tekst">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="dp-nieuws-titel">
          {item.titel}
        </a>
        {(item.bron || geldig) && <span className="dp-nieuws-bron">{[item.bron, geldig ? datumKort(item.gepubliceerdOp) : ""].filter(Boolean).join(", ")}</span>}
        {item.toelichting && <p>{item.toelichting}</p>}
        {chips.length > 0 && (
          <div className="dp-gaatover">
            <span>Gaat over</span>
            {chips}
          </div>
        )}
      </div>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-compact">
        {knop}
      </a>
    </article>
  );
}

/** Een Event: Een datumtegel in groen (grijs als het verlopen is), de titel, "{datum}, {plaats}" en, alleen met een link, de knop "Meer informatie". */
function EventRij({ item, chips }: { item: LeadEvent; chips: React.ReactNode[] }) {
  const start = new Date(`${item.datum}T00:00:00Z`);
  const geldig = !Number.isNaN(start.getTime());
  const wanneer = item.einddatum && item.einddatum !== item.datum ? `${datumKort(item.datum)} tot ${datumKort(item.einddatum)}` : datumKort(item.datum);
  return (
    <article className={`dp-nieuws ${item.verlopen ? "is-verlopen" : ""}`}>
      <div className={`dp-datumtegel ${item.verlopen ? "dp-datumtegel--verlopen" : "dp-datumtegel--event"}`}>
        {geldig ? (
          <>
            <span>{start.toLocaleDateString("nl-NL", { month: "short", timeZone: "UTC" }).replace(".", "")}</span>
            <strong>{start.getUTCDate()}</strong>
          </>
        ) : (
          <SoortIcoon soort="event" />
        )}
      </div>
      <div className="dp-nieuws-tekst">
        {item.url && !item.verlopen ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="dp-nieuws-titel">
            {item.titel}
          </a>
        ) : (
          <span className="dp-nieuws-titel dp-nieuws-titel--tekst">{item.titel}</span>
        )}
        <span className="dp-nieuws-bron">{[wanneer, item.plaats].filter(Boolean).join(", ")}</span>
        {item.toelichting && <p>{item.toelichting}</p>}
        {chips.length > 0 && (
          <div className="dp-gaatover">
            <span>Gaat over</span>
            {chips}
          </div>
        )}
      </div>
      {item.url && !item.verlopen ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-compact">
          Meer informatie ↗
        </a>
      ) : (
        <span />
      )}
    </article>
  );
}
