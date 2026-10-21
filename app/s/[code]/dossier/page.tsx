"use client";

import { Suspense, use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrganisaties, useRespondentPerToegangscode, markeerDossierGezien } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useInstellingen } from "@/lib/instellingen-store";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";
import { RadarChartView } from "@/components/RadarChartView";
import { BouwblokChip, BouwblokCirkel } from "@/components/dossier/BouwblokChip";
import { CaseIcoon, NieuwsIcoon } from "@/components/icons/DossierIcons";
import { CLASSIFICATIE_INFO } from "@/lib/colors";
import { classificatie } from "@/lib/scoring";
import { formatScore } from "@/lib/format";
import { langeDatum } from "@/lib/mijn-metingen";
import { dossierRadar } from "@/lib/dossier-radar";
import { DOSSIER_ASSESSMENT_ID, LeadCase, LeadDossier, LeadNieuws, datumKort, filterOpBouwblok, itemsPerBouwblok, leadDossier } from "@/lib/dossier";

/**
 * De Dossierpagina van een Lead (`dossier.md`, Scherm 5): Het Dossier dat de Consultant voor deze Lead heeft opengezet, met een kop, de radar in
 * een filtermodus, de Cases en het Nieuws. De naam van de Organisatie in een Case staat er nergens, alleen de branche. Het gekozen bouwblok staat in
 * de URL (`?bouwblok=…`), zodat de terugknop van de browser werkt. Opent de Lead de pagina, dan wordt `dossierGezienOp` gezet.
 */
export default function DossierPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return (
    <Suspense fallback={null}>
      <DossierInhoud code={code} />
    </Suspense>
  );
}

function DossierInhoud({ code }: { code: string }) {
  const gegevens = useRespondentPerToegangscode(code);
  const alle = useOrganisaties();
  const assessments = useAssessments();
  const { korteNamen } = useInstellingen();
  const router = useRouter();
  const zoek = useSearchParams();

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

  const assessment = assessments.find((a) => a.id === DOSSIER_ASSESSMENT_ID);
  const telling = itemsPerBouwblok(dossier);
  const radar = assessment ? dossierRadar(assessment, organisatie, lid.id) : null;
  const bouwblokken = radar?.resultaten ?? [];
  const gevraagd = zoek.get("bouwblok");
  const gekozen = gevraagd && telling.has(gevraagd) && bouwblokken.some((r) => r.bouwblok.id === gevraagd) ? gevraagd : null;
  const gefilterd = filterOpBouwblok(dossier, gekozen);
  const gekozenResultaat = bouwblokken.find((r) => r.bouwblok.id === gekozen);

  function kies(id: string | null) {
    router.push(id ? `/s/${code}/dossier?bouwblok=${encodeURIComponent(id)}` : `/s/${code}/dossier`, { scroll: false });
  }

  // Een chip bij een item: De bouwblokken die nog in de radar staan filteren, de rest (gearchiveerd) is alleen tekst.
  const chips = (ids: string[]) =>
    ids.flatMap((id) => {
      const r = bouwblokken.find((x) => x.bouwblok.id === id);
      if (r) {
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
      }
      const b = assessment?.categorieen?.flatMap((c) => c.bouwblokken).find((x) => x.id === id);
      return b ? [<BouwblokChip key={id} volgnummer={b.volgnummer} naam={b.naam} groepKleur={null} />] : [];
    });

  const toonRadar = telling.size > 0 && assessment && bouwblokken.length > 0;
  const datum = langeDatum(dossier.openSinds);

  return (
    <PageWithChrome logoHref={`/s/${code}`} code={code} toonTerug identiteitMenu={<MijnGegevensMenu lid={lid} />}>
      <div className="container dp-pagina">
        <header className="dp-kop">
          <div className="dp-kop-tekst">
            <span className="dp-eyebrow">Dossier</span>
            <h1 className="page-title">Dossier {dossier.organisatieNaam}</h1>
            <p>
              Je consultant heeft cases en nieuws verzameld die passen bij jullie situatie, met bij elk item uitleg waarom. Bij elk item staat het bouwblok waar het
              over gaat.
            </p>
            <div className="dp-kop-chips">
              <span className="dp-kopchip">Gedeeld door je consultant</span>
              {datum && <span className="dp-kopchip">{datum}</span>}
            </div>
          </div>
          <div className="dp-tegels">
            <div className="dp-tegel">
              <strong>{dossier.cases.length}</strong>
              <span>{dossier.cases.length === 1 ? "Case" : "Cases"}</span>
            </div>
            <div className="dp-tegel">
              <strong>{dossier.nieuws.length}</strong>
              <span>{dossier.nieuws.length === 1 ? "Nieuwsbericht" : "Nieuwsberichten"}</span>
            </div>
          </div>
        </header>

        {toonRadar && assessment && (
          <section className="dp-radarkaart" aria-label="Waar dit dossier over gaat">
            <div className="dp-radar">
              <RadarChartView
                resultaten={bouwblokken}
                naam={`Organisatie ${dossier.organisatieNaam}`}
                filter={{ actief: new Set(telling.keys()), gekozen, onKies: kies }}
              />
            </div>
            <div className="dp-radarlijst">
              <h2>Waar dit dossier over gaat</h2>
              <p className="dp-radarlijst-sub">Kies een bouwblok om de cases en het nieuws daarover te zien.</p>
              <ul>
                {bouwblokken
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
            <div className="dp-sectiekop">
              <span className="dp-sectie-icoon dp-sectie-icoon--case" aria-hidden="true">
                <CaseIcoon width={26} height={26} />
              </span>
              <div>
                <h2>Cases</h2>
                <p>Zo hebben andere organisaties het aangepakt</p>
              </div>
            </div>
            {gefilterd.cases.map((c) => (
              <CaseKaart key={c.id} item={c} chips={chips(c.bouwblokIds)} />
            ))}
          </section>
        )}

        {gefilterd.nieuws.length > 0 && (
          <section className="dp-sectie" aria-label="Nieuws">
            <div className="dp-sectiekop">
              <span className="dp-sectie-icoon dp-sectie-icoon--nieuws" aria-hidden="true">
                <NieuwsIcoon width={26} height={26} />
              </span>
              <div>
                <h2>Nieuws</h2>
                <p>Wat er speelt rond jullie organisatie</p>
              </div>
            </div>
            {gefilterd.nieuws.map((n) => (
              <NieuwsRij key={n.id} item={n} chips={chips(n.bouwblokIds)} />
            ))}
          </section>
        )}

        <p className="dp-slot">Vragen over dit dossier? Je consultant helpt je graag verder.</p>
      </div>
    </PageWithChrome>
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

function NieuwsRij({ item, chips }: { item: LeadNieuws; chips: React.ReactNode[] }) {
  const datum = item.gepubliceerdOp ? new Date(`${item.gepubliceerdOp}T00:00:00Z`) : null;
  const geldig = datum && !Number.isNaN(datum.getTime());
  return (
    <article className="dp-nieuws">
      <div className="dp-datumtegel">
        {geldig ? (
          <>
            <span>{datum.toLocaleDateString("nl-NL", { month: "short", timeZone: "UTC" }).replace(".", "")}</span>
            <strong>{datum.getUTCDate()}</strong>
          </>
        ) : (
          <NieuwsIcoon width={26} height={26} />
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
        Lees artikel ↗
      </a>
    </article>
  );
}
