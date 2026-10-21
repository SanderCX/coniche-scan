"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
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
import { langeDatum, maandJaarLang } from "@/lib/mijn-metingen";
import { aantalAfgerondInMeting } from "@/lib/metingen";
import { dossierRadar } from "@/lib/dossier-radar";
import { BouwblokResultaat } from "@/lib/scoring";
import { Assessment, ScanUitvoering } from "@/lib/types";
import {
  DOSSIER_ASSESSMENT_IDS,
  DossierSectieInhoud,
  DossierLijsten,
  LeadBlog,
  LeadCase,
  LeadDossier,
  LeadEvent,
  LeadNieuws,
  SoortFilter,
  VERDELING_EERST,
  aantallenPerSoortLead,
  datumKort,
  filterOpBouwblok,
  filterOpSoort,
  itemsPerBouwblok,
  leadDossier,
  sorteerVerdeling,
  verdeelOverSecties,
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
  /** De Meting waarvan de scores komen (`dossier.md`, Bron van de scores), `null` zonder scores. */
  meting: ScanUitvoering | null;
  /** Heeft de Lead een Meting van dit Assessment waarvan hij de Resultaten mag zien? Zonder zijn er geen scores en klassen. */
  heeftScores: boolean;
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
  const [eerdereOpen, setEerdereOpen] = useState<ReadonlySet<string>>(new Set());
  const [soort, setSoort] = useState<SoortFilter>("alles");
  const [verdelingOpen, setVerdelingOpen] = useState(false);

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
    const { resultaten, heeftScores, meting } = dossierRadar(assessment, organisatie, lid.id);
    return resultaten.some((r) => telling.has(r.bouwblok.id)) ? [{ assessment, resultaten, heeftScores, meting }] : [];
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
  const komendTotaal = dossier.events.filter((e) => !e.verlopen).length;
  const heeftAi = radars.some((r) => r.assessment.bouwblokLabel === "AI-domein");
  const tegels = [
    { n: dossier.cases.length, een: "Case", meer: "Cases" },
    { n: dossier.nieuws.length, een: "Nieuwsbericht", meer: "Nieuwsberichten" },
    { n: komendTotaal, een: "Event", meer: "Events" },
    { n: dossier.blogs.length, een: "Blog", meer: "Blogs" },
  ].filter((t) => t.n > 0);

  // Het soortfilter telt wat er nu in de lijst past (met het filter op een bouwblok, zonder verlopen events). De lijst volgt beide filters.
  const aantallen = aantallenPerSoortLead(gefilterd);
  const lijsten: DossierLijsten = filterOpSoort(gefilterd, soort);
  const totaalInLijst = lijsten.cases.length + lijsten.nieuws.length + lijsten.events.length + lijsten.blogs.length;

  // De klassen bestaan alleen met een Meting waarvan de Lead de Resultaten mag zien: Anders geen verdeling, geen rail en geen secties.
  const scores = new Map<string, number | null>(alleBouwblokken.map((r) => [r.bouwblok.id, r.score]));
  const metScores = radars.some((r) => r.heeftScores);
  const secties: DossierSectieInhoud[] = metScores ? verdeelOverSecties(lijsten, scores, heeftAi && radars.length === 1 ? "domein" : "bouwblok") : [];

  function wisselEerdere(sleutel: string) {
    const nieuw = new Set(eerdereOpen);
    if (nieuw.has(sleutel)) nieuw.delete(sleutel);
    else nieuw.add(sleutel);
    setEerdereOpen(nieuw);
  }

  /** De vier lijsten onder elkaar, elk met een eigen kop. `sleutel` onderscheidt de uitklapknop van Eerdere events per sectie. */
  const soorten = (l: DossierLijsten, sleutel: string) => {
    const komend = l.events.filter((e) => !e.verlopen);
    const verlopen = l.events.filter((e) => e.verlopen);
    const open = eerdereOpen.has(sleutel);
    return (
      <>
        {l.cases.length > 0 && (
          <section className="dp-sectie" aria-label="Cases">
            <SectieKop soort="case" titel="Cases" regel="Zo hebben andere organisaties het aangepakt" />
            {l.cases.map((c) => (
              <CaseKaart key={c.id} item={c} chips={chips(c.bouwblokIds)} />
            ))}
          </section>
        )}

        {l.nieuws.length > 0 && (
          <section className="dp-sectie" aria-label="Nieuws">
            <SectieKop soort="nieuws" titel="Nieuws" regel="Wat er speelt rond jullie organisatie" />
            {l.nieuws.map((n) => (
              <NieuwsRij key={n.id} item={n} chips={chips(n.bouwblokIds)} knop="Lees artikel ↗" />
            ))}
          </section>
        )}

        {l.events.length > 0 && (
          <section className="dp-sectie" aria-label="Events">
            <SectieKop soort="event" titel="Events" regel="Zien we je daar?" />
            {komend.map((e) => (
              <EventRij key={e.id} item={e} chips={chips(e.bouwblokIds)} />
            ))}
            {verlopen.length > 0 && (
              <>
                <button type="button" className="dp-eerdere" aria-expanded={open} aria-controls={`dp-eerdere-${sleutel}`} onClick={() => wisselEerdere(sleutel)}>
                  Eerdere events {open ? "verbergen" : "tonen"} ({verlopen.length}) <span aria-hidden="true">{open ? "▲" : "▼"}</span>
                </button>
                {open && (
                  <div id={`dp-eerdere-${sleutel}`}>
                    {verlopen.map((e) => (
                      <EventRij key={e.id} item={e} chips={chips(e.bouwblokIds)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {l.blogs.length > 0 && (
          <section className="dp-sectie" aria-label="Blogs">
            <SectieKop soort="blog" titel="Blogs" regel="Om verder te lezen" />
            {l.blogs.map((b) => (
              <NieuwsRij key={b.id} item={b} chips={chips(b.bouwblokIds)} knop="Lees blog ↗" soort="blog" />
            ))}
          </section>
        )}
      </>
    );
  };

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
              <Verdeling
                key={actief.assessment.id}
                assessment={actief.assessment}
                resultaten={actief.resultaten.filter((r) => telling.has(r.bouwblok.id))}
                heeftScores={actief.heeftScores}
                bron={
                  actief.heeftScores && actief.meting
                    ? {
                        assessment: actief.assessment.naam,
                        wanneer: maandJaarLang(actief.meting.meetdatum) || actief.meting.label,
                        aantal: aantalAfgerondInMeting(organisatie, actief.meting),
                        href: `/s/${code}/resultaten/${actief.meting.id}`,
                      }
                    : null
                }
                telling={telling}
                gekozen={gekozen}
                open={verdelingOpen}
                onOpen={setVerdelingOpen}
                onKies={(id) => kies(gekozen === id ? null : id)}
              />
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

        <div className="dp-soortfilter">
          <WeergaveWissel<SoortFilter>
            ariaLabel="Soort item"
            waarde={soort}
            onChange={setSoort}
            opties={[
              { waarde: "alles", label: `Alles ${aantallen.alles}` },
              { waarde: "case", label: `Cases ${aantallen.case}` },
              { waarde: "nieuws", label: `Nieuws ${aantallen.nieuws}` },
              { waarde: "event", label: `Events ${aantallen.event}` },
              { waarde: "blog", label: `Blogs ${aantallen.blog}` },
            ]}
          />
        </div>

        {totaalInLijst === 0 ? (
          <p className="dp-leeg">Voor deze keuze staat nog niets in het dossier.</p>
        ) : secties.length > 0 ? (
          <SectiesMetRail secties={secties} soorten={soorten} />
        ) : (
          soorten(lijsten, "alles")
        )}

        <p className="dp-slot">Vragen over dit dossier? Je consultant helpt je graag verder.</p>
      </div>
    </PageWithChrome>
  );
}

/**
 * De lijst met de rail "In dit dossier" (`dossier.md`, Scherm 5): Links een rail die meescrolt met per sectie het nummer in een cirkel, de naam en het
 * aantal items, rechts de secties zelf. Een klik op de rail springt naar de sectie en de sectie waar de lezer staat is oranje gevuld.
 */
function SectiesMetRail({ secties, soorten }: { secties: DossierSectieInhoud[]; soorten: (l: DossierLijsten, sleutel: string) => React.ReactNode }) {
  const [huidig, setHuidig] = useState<string>(secties[0]?.sectie ?? "");
  const sleutel = secties.map((x) => x.sectie).join("|");

  // De sectie waar de lezer staat: De laatste waarvan de bovenkant minder dan 180px onder de bovenkant van het venster staat.
  useEffect(() => {
    function bijScrollen() {
      let gevonden = secties[0]?.sectie ?? "";
      for (const sec of secties) {
        const el = document.getElementById(`dp-sec-${sec.sectie}`);
        if (el && el.getBoundingClientRect().top < 180) gevonden = sec.sectie;
      }
      setHuidig(gevonden);
    }
    bijScrollen();
    window.addEventListener("scroll", bijScrollen, { passive: true });
    return () => window.removeEventListener("scroll", bijScrollen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleutel]);

  let nummer = 0;
  return (
    <div className="dp-lijst">
      <nav className="dp-rail" aria-label="In dit dossier">
        <span className="dp-rail-kop">In dit dossier</span>
        <ul>
          {secties.map((sec) => {
            const nr = sec.sectie === "algemeen" ? null : ++nummer;
            return (
              <li key={sec.sectie}>
                <a href={`#dp-sec-${sec.sectie}`} className={huidig === sec.sectie ? "is-huidig" : ""} aria-current={huidig === sec.sectie ? "location" : undefined}>
                  <span className={`dp-rail-nr ${nr === null ? "is-algemeen" : ""}`} aria-hidden="true">
                    {nr ?? "–"}
                  </span>
                  <span className="dp-rail-naam">{sec.naam}</span>
                  <span className="dp-rail-aantal">{sec.aantal}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="dp-secties">
        {(() => {
          let n = 0;
          return secties.map((sec) => {
            const nr = sec.sectie === "algemeen" ? null : ++n;
            return (
              <section key={sec.sectie} id={`dp-sec-${sec.sectie}`} className="dp-klasse" aria-label={sec.naam}>
                <header className="dp-klassekop">
                  <span className={`dp-rail-nr dp-rail-nr--groot ${nr === null ? "is-algemeen" : ""}`} aria-hidden="true">
                    {nr ?? "–"}
                  </span>
                  <div>
                    <h2>{sec.naam}</h2>
                    <p>{sec.regel}</p>
                  </div>
                </header>
                {soorten(sec.lijsten, sec.sectie)}
              </section>
            );
          });
        })()}
      </div>
    </div>
  );
}

/**
 * De verdeling rechts van de radar (`dossier.md`, Verdeling rechts van de radar): Per actief bouwblok een rij, de laagste score eerst, met de cirkel,
 * de naam en het aantal items, een balk met de plek van de score in de drie zones en de score met de klasse. Eerst vier rijen, de rest achter "Nog {n}
 * bouwblokken tonen". Zonder scores staat er een lijst op het nummer, zonder balk, score en klasse.
 */
function Verdeling({
  assessment,
  resultaten,
  heeftScores,
  bron,
  telling,
  gekozen,
  open,
  onOpen,
  onKies,
}: {
  assessment: Assessment;
  resultaten: BouwblokResultaat[];
  heeftScores: boolean;
  /** Waar de scores vandaan komen (`dossier.md`, Bron van de scores): De Meting, haar maand, het aantal afgeronde scans en de link naar haar Resultaten. */
  bron: { assessment: string; wanneer: string; aantal: number; href: string } | null;
  telling: Map<string, number>;
  gekozen: string | null;
  open: boolean;
  onOpen: (open: boolean) => void;
  onKies: (bouwblokId: string) => void;
}) {
  const woord = eenheid(assessment);
  const meervoud = woord === "domein" ? "domeinen" : "bouwblokken";
  const rijen = sorteerVerdeling(resultaten.map((r) => ({ r, score: heeftScores ? r.score : null, volgnummer: r.bouwblok.volgnummer })));
  const zichtbaar = open ? rijen : rijen.slice(0, VERDELING_EERST);
  const rest = rijen.length - zichtbaar.length;
  return (
    <div className="dp-radarlijst">
      <h2>Waar dit dossier over gaat</h2>
      <p className="dp-radarlijst-sub">
        Kies een {woord} om de cases, het nieuws, de events en de blogs daarover te zien.
        {heeftScores && ` Onder de radar staan de ${meervoud} met de laagste score bovenaan.`}
      </p>
      {heeftScores && (
        <ul className="dp-klassenuitleg" aria-label="De klassen">
          {(["rood", "oranje", "groen"] as const).map((k) => (
            <li key={k}>
              <i className={`dp-klassestip dp-klassestip--${k}`} aria-hidden="true" />
              {CLASSIFICATIE_INFO[k].label}
              <span>{k === "rood" ? "onder 2,5" : k === "oranje" ? "2,5 tot 3,5" : "vanaf 3,5"}</span>
            </li>
          ))}
        </ul>
      )}
      <ul className={`dp-verdeling ${heeftScores ? "dp-verdeling--score" : ""}`}>
        {zichtbaar.map(({ r, score }) => {
          const n = telling.get(r.bouwblok.id) ?? 0;
          const klasse = score === null ? null : classificatie(score);
          return (
            <li key={r.bouwblok.id}>
              <button
                type="button"
                className={`dp-radarrij ${gekozen === r.bouwblok.id ? "is-gekozen" : ""}`}
                aria-pressed={gekozen === r.bouwblok.id}
                title={score !== null && bron ? `Groepsscore ${formatScore(score)}, meting ${bron.wanneer}` : undefined}
                onClick={() => onKies(r.bouwblok.id)}
              >
                <BouwblokCirkel volgnummer={r.bouwblok.volgnummer} groepKleur={r.groepKleur} groot />
                <span className="dp-radarrij-tekst">
                  <strong>{r.bouwblok.naam}</strong>
                  <span>
                    {n} {n === 1 ? "item" : "items"}
                  </span>
                </span>
                {score !== null && klasse && (
                  <>
                    <span className="dp-balk" aria-hidden="true">
                      <i style={{ left: `${(((Math.min(5, Math.max(1, score)) - 1) / 4) * 100).toFixed(1)}%` }} />
                    </span>
                    <span className="dp-score">
                      <strong>{formatScore(score)}</strong>
                      <span className={`dp-klasse-badge dp-klasse-badge--${klasse}`}>{CLASSIFICATIE_INFO[klasse].label}</span>
                    </span>
                  </>
                )}
              </button>
            </li>
          );
        })}
        {heeftScores && (
          <li className="dp-ankers" aria-hidden="true">
            <span />
            <span />
            <span className="dp-ankers-rij">
              <span style={{ left: "0%" }}>1</span>
              <span style={{ left: "37.5%" }}>2,5</span>
              <span style={{ left: "62.5%" }}>3,5</span>
              <span style={{ left: "100%" }}>5</span>
            </span>
            <span />
          </li>
        )}
      </ul>
      {rijen.length > VERDELING_EERST && (
        <button type="button" className="dp-meer" aria-expanded={open} onClick={() => onOpen(!open)}>
          {open ? "Minder tonen ▴" : `Nog ${rest} ${rest === 1 ? woord : meervoud} tonen ▾`}
        </button>
      )}
      {bron && (
        <p className="dp-bron">
          Scores uit de meting {bron.assessment} van {bron.wanneer}, groepsscore van {bron.aantal} afgeronde {bron.aantal === 1 ? "scan" : "scans"}.{" "}
          <Link href={bron.href}>Bekijk de meting</Link>
        </p>
      )}
    </div>
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
