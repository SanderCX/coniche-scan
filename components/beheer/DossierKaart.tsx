"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { BouwblokChip } from "@/components/dossier/BouwblokChip";
import { useAssessments } from "@/lib/assessment-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { useInstellingen } from "@/lib/instellingen-store";
import { magCaseVlagZetten, magDossierBewerken } from "@/lib/rechten";
import { Schakelaar } from "@/components/Schakelaar";
import { useOrganisaties, verwijderDossieritem, voegDossieritemToe, wijzigDossieritem, zetDossierZichtbaar, zetNaamVoorLead, zetRadarBron } from "@/lib/db";
import {
  BRON_MAX,
  DOSSIER_ASSESSMENT_IDS,
  DOSSIER_STATUS_LABEL,
  NAAM_VOOR_LEAD_MAX,
  DossierInvoer,
  DossierSoort,
  OMVANG_MAX,
  PLAATS_MAX,
  SAMENVATTING_MAX,
  TITEL_MAX,
  TOELICHTING_MAX,
  TOT_RESULTAAT_MAX,
  aantalZichtbaarVoorLead,
  aantallPerSoort,
  aantalOrganisatiesInBenchmark,
  benchmarkRijRegel,
  benchmarksVoorDossier,
  brancheVan,
  datumKort,
  dossierBouwblokkenPerAssessment,
  dossierVan,
  invoerVanItem,
  itemStatus,
  itemsInVolgorde,
  kanOpenZetten,
  leegDossierInvoer,
  naamVoorLeadVan,
  standaardNaamVoorLead,
} from "@/lib/dossier";
import { automatischeRadarMeting, metingZichtbaarVoorLead, radarBronVan, radarKeuzes, verlorenRadarBronnen } from "@/lib/dossier-radar";
import { aantalAfgerondInMeting } from "@/lib/metingen";
import { langeDatum, maandJaarLang } from "@/lib/mijn-metingen";
import { kopNaam } from "@/lib/korte-namen";
import { Assessment, Benchmark, Dossieritem, Organisatie, ScanUitvoering } from "@/lib/types";
import { SoortIcoon } from "@/components/icons/DossierIcons";
import { useBenchmarksMetLeden } from "@/lib/use-benchmarks";
import { useBeheerOverzicht } from "@/lib/beheer-url";
import { magLeadToekennen } from "@/lib/rechten";
import { leadsMetBenchmark } from "@/lib/lead-toegang";

type Filter = "alles" | DossierSoort;

/**
 * De kaart Dossier op het organisatie-detail (`dossier.md`, Scherm 1; `beheerpagina.md`, punt 4, Dossier; ontwerp `Dossier-beheer-B`): Onder de
 * Kenmerken en de rij Toegang en Afspraken, boven de KPI's. Met het paneel "Instellingen voor de Lead" (de schakelaar Zichtbaar voor Lead, de naam
 * voor de Lead en de Meting per radar), een filter Alles, Cases, Nieuws, Events en Blogs met de knop "+ Toevoegen", en de items in één kaart met
 * per item een statusbadge en de knop "Bewerken". Voor een Admin en voor een Consultant met toegang tot de Organisatie (`dossier.bewerken`). Het
 * Bewerkslot van de Organisatie geldt voor de hele pagina (`MetBewerkslot`).
 */
export function DossierKaart({ organisatie }: { organisatie: Organisatie }) {
  const gebruiker = useIngelogdeGebruiker();
  const alle = useOrganisaties();
  const { korteNamen } = useInstellingen();
  const benchmarks = useBenchmarksMetLeden();
  const assessments = useAssessments();
  const kanBewerken = magDossierBewerken(gebruiker, organisatie);
  const dossier = dossierVan(organisatie);
  const [filter, setFilter] = useState<Filter>("alles");
  const [modal, setModal] = useState<"nieuw" | Dossieritem | null>(null);

  const telling = aantallPerSoort(dossier.items);
  const gefilterd = itemsInVolgorde(dossier.items).filter((i) => filter === "alles" || i.soort === filter);

  return (
    <section className="beheer-kaart dos-kaart org-anker" id="dossier" aria-label="Dossier">
      <div className="dos-kop">
        <h2 className="dos-kop-titel">Dossier</h2>
      </div>

      <InstellingenVoorLead organisatie={organisatie} alle={alle} benchmarks={benchmarks} kanBewerken={kanBewerken} />

      <div className="dos-filterrij">
        <WeergaveWissel<Filter>
          ariaLabel="Soort item"
          waarde={filter}
          onChange={setFilter}
          opties={[
            { waarde: "alles", label: `Alles ${telling.alles}` },
            { waarde: "case", label: `Cases ${telling.cases}` },
            { waarde: "benchmark", label: `Benchmarks ${telling.benchmarks}` },
            { waarde: "nieuws", label: `Nieuws ${telling.nieuws}` },
            { waarde: "event", label: `Events ${telling.events}` },
            { waarde: "blog", label: `Blogs ${telling.blogs}` },
          ]}
        />
        {kanBewerken && (
          <button type="button" className="btn btn-or btn-compact" onClick={() => setModal("nieuw")}>
            + Toevoegen
          </button>
        )}
      </div>

      {dossier.items.length === 0 ? (
        <p className="kenmerken-leeg">Er staan nog geen items in het Dossier.</p>
      ) : gefilterd.length === 0 ? (
        <p className="kenmerken-leeg">Er staan geen items van deze soort in het Dossier.</p>
      ) : (
        <ul className="dos-lijst">
          {gefilterd.map((item) => (
            <ItemRij
              key={item.id}
              item={item}
              organisatie={organisatie}
              alle={alle}
              benchmarks={benchmarks}
              assessments={assessments}
              kanBewerken={kanBewerken}
              onBewerk={() => setModal(item)}
              korteNamen={korteNamen}
            />
          ))}
        </ul>
      )}

      {kanBewerken && modal && <DossierItemModal organisatie={organisatie} item={modal === "nieuw" ? null : modal} onSluit={() => setModal(null)} />}
    </section>
  );
}

/** Het potlood in een rij van het paneel: Een knop van 40×40px met een oranje icoon (`dossier.md`, Scherm 1). */
function PotloodKnop({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="dos-potlood" aria-label={label} title={label} onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** "Meting oktober 2026 · 12 scans". */
function metingTekst(organisatie: Organisatie, meting: ScanUitvoering): string {
  const n = aantalAfgerondInMeting(organisatie, meting);
  return `Meting ${maandJaarLang(meting.meetdatum) || meting.label} · ${n} ${n === 1 ? "scan" : "scans"}`;
}

/**
 * Het paneel "Instellingen voor de Lead" (`dossier.md`, Scherm 1, Paneel): Een witte kaart met drie rijen. Zichtbaar voor Lead (een schakelaar
 * die na een bevestiging aangaat), Naam voor de Lead (een potlood naar een modal) en Scores in de radar (een tabel met per Assessment de Meting
 * en de bron, met een potlood naar een modal). Verliest een gekozen Meting haar zichtbaarheid, dan staat het Dossier uit en meldt het paneel waarom.
 */
function InstellingenVoorLead({ organisatie, alle, benchmarks, kanBewerken }: { organisatie: Organisatie; alle: Organisatie[]; benchmarks: Benchmark[]; kanBewerken: boolean }) {
  const assessments = useAssessments();
  const dossier = dossierVan(organisatie);
  const [bevestigOpen, setBevestigOpen] = useState(false);
  const [naamOpen, setNaamOpen] = useState(false);
  const [bronOpen, setBronOpen] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const zichtbaar = aantalZichtbaarVoorLead(organisatie, alle, new Date(), benchmarks);
  const eigenNaam = dossier.naamVoorLead.trim();
  const verloren = verlorenRadarBronnen(organisatie);
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? id;
  // Alleen een Assessment met een radar én minstens één Meting bij deze Organisatie staat in de tabel.
  const radars = DOSSIER_ASSESSMENT_IDS.flatMap((id) => {
    const assessment = assessments.find((a) => a.id === id);
    return assessment && organisatie.scanUitvoeringen.some((m) => m.assessmentId === id) ? [assessment] : [];
  });

  function wissel(aan: boolean) {
    setFout(null);
    if (aan) setBevestigOpen(true);
    else zetDossierZichtbaar(organisatie.id, false);
  }

  return (
    <div className="dos-instellingen">
      <div className="titel-rij dos-instellingen-kop">
        <h3>Instellingen voor de Lead</h3>
        <InfoIcoon sleutel="info.dossier" />
      </div>

      {verloren.length > 0 && (
        <p className="overzicht-melding dos-melding" role="status">
          Het Dossier is niet meer zichtbaar voor de Lead, omdat de Meting voor de radar (
          {verloren.map((v, i) => (
            <span key={v.assessmentId + v.metingId}>
              {i > 0 && "; "}
              {assessmentNaam(v.assessmentId)}, {v.metingLabel ?? "verwijderd"}
            </span>
          ))}
          ) niet meer zichtbaar is voor de Lead. Controleer de Meting en zet het Dossier daarna weer aan.
        </p>
      )}

      <div className="dos-instelling">
        <span id="dos-zichtbaar-label" className="dos-instelling-label">
          Zichtbaar voor Lead
        </span>
        <div className="dos-instelling-waarde">
          <span className="dos-instelling-regel">
            <Schakelaar aan={dossier.zichtbaar} onChange={wissel} disabled={!kanBewerken} ariaLabelledBy="dos-zichtbaar-label" />
            <strong>{dossier.zichtbaar ? "Aan" : "Uit"}</strong>
          </span>
          <span className="dos-hint">
            De Lead ziet het dossier en de items die zichtbaar zijn gemaakt. Uit: alleen jij en je collega-Consultants zien het.
          </span>
          {fout && <span className="dos-fout">{fout}</span>}
        </div>
        <span />
      </div>

      <div className="dos-instelling">
        <span className="dos-instelling-label">Naam voor de Lead</span>
        <div className="dos-instelling-waarde">
          <span className="dos-instelling-regel">
            <strong>{naamVoorLeadVan(organisatie)}</strong>
            {!eigenNaam && <span className="dos-badge-grijs">Standaard</span>}
          </span>
          <span className="dos-hint">Titel van het dossier voor de Lead. Leeg laten geeft &ldquo;{standaardNaamVoorLead("{Organisatie}")}&rdquo;.</span>
        </div>
        {kanBewerken ? <PotloodKnop label="Naam voor de Lead wijzigen" onClick={() => setNaamOpen(true)} /> : <span />}
      </div>

      {radars.length > 0 && (
        <div className="dos-instelling dos-instelling--tabel">
          <span className="dos-instelling-label">Scores in de radar</span>
          <table className="dos-bronnen">
            <thead>
              <tr>
                <th scope="col">Assessment</th>
                <th scope="col">Meting</th>
                <th scope="col">Bron</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {radars.map((a) => {
                const vast = radarBronVan(organisatie, a.id);
                const vasteMeting = vast ? organisatie.scanUitvoeringen.find((m) => m.id === vast) : undefined;
                const nu = vast ? vasteMeting : automatischeRadarMeting(organisatie, a.id);
                const niet = vast ? !vasteMeting || !metingZichtbaarVoorLead(organisatie, vast) : false;
                return (
                  <tr key={a.id}>
                    <td>{a.naam}</td>
                    <td>
                      {nu ? metingTekst(organisatie, nu) : vast ? "Meting verwijderd" : "Geen Meting"}
                      {niet && <span className="dos-badge-oranje">Niet zichtbaar voor de Lead</span>}
                    </td>
                    <td>
                      <span className={vast ? "dos-badge-oranje-faint" : "dos-badge-grijs"}>{vast ? "Handmatig" : "Automatisch (meest recent)"}</span>
                    </td>
                    <td className="dos-bronnen-actie">{kanBewerken && <PotloodKnop label={`Meting voor de radar kiezen: ${a.naam}`} onClick={() => setBronOpen(a.id)} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <BevestigModal
        open={bevestigOpen}
        titel="Dossier zichtbaar maken"
        bevestigLabel="Zichtbaar maken"
        bevestigVariant="primair"
        bericht={
          zichtbaar > 0
            ? `Het Dossier wordt zichtbaar voor de Leads van ${organisatie.naam}. Ze zien ${zichtbaar} ${zichtbaar === 1 ? "item" : "items"}.`
            : `Het Dossier wordt zichtbaar voor de Leads van ${organisatie.naam}. Er staan nog geen items op Zichtbaar voor Lead.`
        }
        onBevestigen={() => {
          const r = zetDossierZichtbaar(organisatie.id, true);
          if (!r.ok) setFout(r.reden);
          setBevestigOpen(false);
        }}
        onAnnuleren={() => setBevestigOpen(false)}
      />
      {naamOpen && <NaamModal organisatie={organisatie} onSluit={() => setNaamOpen(false)} />}
      {bronOpen && <BronModal organisatie={organisatie} assessmentId={bronOpen} assessmentNaam={assessmentNaam(bronOpen)} onSluit={() => setBronOpen(null)} />}
    </div>
  );
}

/** De modal "Naam voor de Lead" (`dossier.md`, Scherm 1): Een invoerveld, de hint en de knoppen Annuleren en Opslaan. */
function NaamModal({ organisatie, onSluit }: { organisatie: Organisatie; onSluit: () => void }) {
  const [naam, setNaam] = useState(dossierVan(organisatie).naamVoorLead);
  const [fout, setFout] = useState<string | null>(null);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    const r = zetNaamVoorLead(organisatie.id, naam);
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  return (
    <OverzichtModal label="Naam voor de Lead" onSluit={onSluit} className="modal-box--instelling">
      <form onSubmit={opslaan}>
        <div className="overzicht-kop">
          <h2>Naam voor de Lead</h2>
        </div>
        <div className="admin-field">
          <label htmlFor="dos-naam">Naam</label>
          <input
            id="dos-naam"
            type="text"
            autoFocus
            maxLength={NAAM_VOOR_LEAD_MAX}
            placeholder={standaardNaamVoorLead(organisatie.naam)}
            value={naam}
            onChange={(e) => {
              setNaam(e.target.value);
              setFout(null);
            }}
          />
          <span className="dos-hint">
            Leeg laten geeft &ldquo;{standaardNaamVoorLead(organisatie.naam)}&rdquo; (de naam van de Organisatie). De naam komt alleen in het Dossier voor.
          </span>
        </div>
        {fout && (
          <p className="overzicht-melding fout" role="alert">
            {fout}
          </p>
        )}
        <div className="btn-rij">
          <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
            Annuleren
          </button>
          <button type="submit" className="btn btn-or btn-compact">
            Opslaan
          </button>
        </div>
      </form>
    </OverzichtModal>
  );
}

/**
 * De modal "Meting voor de radar" (`dossier.md`, Scherm 1): Een keuze "Automatisch (meest recent)" met de hint welke Meting dat nu is, en per Meting een keuze
 * "Handmatig: {Meting}" met de afrondingsdatum en het aantal scans. Een Meting waarvan de Lead de Resultaten niet mag inzien staat er uitgeschakeld.
 */
function BronModal({ organisatie, assessmentId, assessmentNaam, onSluit }: { organisatie: Organisatie; assessmentId: string; assessmentNaam: string; onSluit: () => void }) {
  const [keuze, setKeuze] = useState<string | null>(radarBronVan(organisatie, assessmentId));
  const [fout, setFout] = useState<string | null>(null);
  const keuzes = radarKeuzes(organisatie, assessmentId, (m) => aantalAfgerondInMeting(organisatie, m));
  const nu = automatischeRadarMeting(organisatie, assessmentId);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    const r = zetRadarBron(organisatie.id, assessmentId, keuze);
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  /** De dag van de laatst afgeronde scan van de Meting, "Afgerond op 15 oktober 2026". */
  const afgerondOp = (m: ScanUitvoering) => {
    const laatste = m.invullingen.map((i) => i.afgerondOp).filter((x): x is string => !!x).sort().pop();
    return laatste ? `Afgerond op ${langeDatum(laatste)}` : "Nog geen afgeronde scans";
  };

  return (
    <OverzichtModal label="Meting voor de radar" onSluit={onSluit} className="modal-box--instelling">
      <form onSubmit={opslaan}>
        <div className="overzicht-kop">
          <h2>Meting voor de radar</h2>
          <p>{assessmentNaam}</p>
        </div>
        <div className="dos-keuzes" role="radiogroup" aria-label="Meting voor de radar">
          <label className={`dos-keuze ${keuze === null ? "is-gekozen" : ""}`}>
            <input type="radio" name="dos-bron" checked={keuze === null} onChange={() => setKeuze(null)} />
            <span>
              <strong>Automatisch (meest recent)</strong>
              <span className="dos-hint">{nu ? `Nu: ${metingTekst(organisatie, nu)}` : "Er is nog geen Meting waarvan de Lead de Resultaten ziet."}</span>
            </span>
          </label>
          {keuzes.map((k) => (
            <label key={k.meting.id} className={`dos-keuze ${keuze === k.meting.id ? "is-gekozen" : ""} ${k.zichtbaar ? "" : "is-uit"}`}>
              <input type="radio" name="dos-bron" checked={keuze === k.meting.id} disabled={!k.zichtbaar} onChange={() => setKeuze(k.meting.id)} />
              <span>
                <strong>Handmatig: Meting {maandJaarLang(k.meting.meetdatum) || k.meting.label}</strong>
                <span className="dos-hint">
                  {afgerondOp(k.meting)} · {k.aantalScans} {k.aantalScans === 1 ? "scan" : "scans"}
                </span>
                {!k.zichtbaar && <span className="dos-hint">Resultaten niet opengezet voor de Lead, daarom niet te kiezen</span>}
              </span>
            </label>
          ))}
        </div>
        <p className="dos-hint dos-bron-regel">De Lead ziet in het dossier welke Meting dit is, met een link naar de resultaten ervan.</p>
        {fout && (
          <p className="overzicht-melding fout" role="alert">
            {fout}
          </p>
        )}
        <div className="btn-rij">
          <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
            Annuleren
          </button>
          <button type="submit" className="btn btn-or btn-compact">
            Opslaan
          </button>
        </div>
      </form>
    </OverzichtModal>
  );
}

function ItemRij({
  item,
  organisatie,
  alle,
  benchmarks,
  assessments,
  kanBewerken,
  onBewerk,
  korteNamen,
}: {
  item: Dossieritem;
  organisatie: Organisatie;
  alle: Organisatie[];
  benchmarks: Benchmark[];
  assessments: Assessment[];
  kanBewerken: boolean;
  onBewerk: () => void;
  korteNamen: ReturnType<typeof useInstellingen>["korteNamen"];
}) {
  const isCase = item.soort === "case";
  const status = itemStatus(item, alle, new Date(), { benchmarks, organisatie });
  const benchmark = item.soort === "benchmark" ? benchmarks.find((b) => b.id === item.benchmarkId) : undefined;
  const caseOrg = isCase ? alle.find((o) => o.id === item.caseOrganisatieId) : undefined;
  let regel: string;
  if (isCase) {
    regel = [
      caseOrg ? kopNaam(caseOrg) : "",
      brancheVan(caseOrg, korteNamen).toLowerCase(),
      item.omvang ? `ongeveer ${item.omvang}` : "",
      item.totResultaat ? `resultaat in ${item.totResultaat}` : "",
    ]
      .filter(Boolean)
      .join(", ");
  } else if (item.soort === "benchmark") {
    regel = benchmarkRijRegel(benchmark, assessments, organisatie);
  } else if (item.soort === "event") {
    // "{datum}, {plaats}", bij een meerdaags event "{datum} tot {einddatum}, {plaats}". Een lege plaats valt weg.
    const wanneer = item.einddatum && item.einddatum !== item.datum ? `${datumKort(item.datum)} tot ${datumKort(item.einddatum)}` : datumKort(item.datum);
    regel = [wanneer, item.plaats].filter(Boolean).join(", ");
  } else {
    regel = [item.bron, item.gepubliceerdOp ? datumKort(item.gepubliceerdOp) : ""].filter(Boolean).join(", ");
  }
  return (
    <li className="dos-rij">
      <span className={`dos-soort dos-soort--${item.soort}${status === "verlopen" ? " is-verlopen" : ""}`}>
        <span className="dos-soort-tegel">
          <SoortIcoon soort={item.soort} size={20} />
        </span>
        <span className="dos-eyebrow">{SOORT_LABEL[item.soort]}</span>
      </span>
      <div className="dos-tekst">
        <h3 className="dos-titel">{item.soort === "benchmark" ? (benchmark?.naam ?? "Kies een benchmark") : item.titel}</h3>
        {regel && <span className="dos-regel">{regel}</span>}
      </div>
      <div className="dos-acties">
        <span className={`dos-status dos-status--${status}`}>{DOSSIER_STATUS_LABEL[status]}</span>
        {kanBewerken ? (
          <button type="button" className="btn btn-outline btn-compact" onClick={onBewerk}>
            Bewerken
          </button>
        ) : (
          <span />
        )}
      </div>
    </li>
  );
}

/**
 * Een meerregelig veld met een vaste hoogte en een tekenteller (`dossier.md`, Scherm 3, Samenvatting en Toelichting): Samenvatting 72px (twee regels),
 * Toelichting 96px (drie regels). Onder het veld links de hint en rechts "{n} / {max}"; typen stopt bij het maximum.
 */
function TekstMetTeller({
  id,
  label,
  hoogte,
  max,
  waarde,
  onChange,
  hint,
  placeholder,
}: {
  id: string;
  label: string;
  hoogte: "samenvatting" | "toelichting";
  max: number;
  waarde: string;
  onChange: (waarde: string) => void;
  hint: string;
  placeholder?: string;
}) {
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} className={`dos-tekstvak dos-tekstvak--${hoogte}`} maxLength={max} value={waarde} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <span className="dos-hint dos-hint--teller">
        <span>{hint}</span>
        <span className="dos-teller">
          {waarde.length} / {max}
        </span>
      </span>
    </div>
  );
}

/** De bouwblokken van één Assessment, gegroepeerd per categorie in de volgorde van de nummers. Zonder categorielaag (de AI-scan) is er één groep zonder naam. */
function chipGroepen<T extends { bouwblok: { volgnummer: number }; groepNaam: string | null }>(bouwblokken: T[]): { naam: string | null; bouwblokken: T[] }[] {
  const groepen: { naam: string | null; bouwblokken: T[] }[] = [];
  for (const b of bouwblokken) {
    const laatste = groepen[groepen.length - 1];
    if (laatste && laatste.naam === b.groepNaam) laatste.bouwblokken.push(b);
    else groepen.push({ naam: b.groepNaam, bouwblokken: [b] });
  }
  return groepen;
}

/** De namen op de pillen van de koppeling: De volledige naam is te lang voor een pil. */
const KOPPEL_NAAM: Record<string, string> = { "klantcontact-volwassenheid": "Klantcontact Volwassenheid", "ai-volwassenheid": "AI-volwassenheid" };

const SOORT_LABEL: Record<DossierSoort, string> = { case: "Case", benchmark: "Benchmark", nieuws: "Nieuws", event: "Event", blog: "Blog" };

/**
 * Item toevoegen of bewerken (`dossier.md`, Scherm 3): Een modal van 640px met de soort (bij Bewerken vast), de velden van dat soort, de
 * chips "Gaat over bouwblokken" en de schakelaar Zichtbaar voor Lead. Bij Bewerken staat links "Verwijderen" met een bevestiging.
 */
function DossierItemModal({ organisatie, item, onSluit }: { organisatie: Organisatie; item: Dossieritem | null; onSluit: () => void }) {
  const gebruiker = useIngelogdeGebruiker();
  const assessments = useAssessments();
  const alle = useOrganisaties();
  const { korteNamen } = useInstellingen();
  const benchmarks = useBenchmarksMetLeden();
  const { open: openOverzicht } = useBeheerOverzicht();
  const [invoer, setInvoer] = useState<DossierInvoer>(item ? invoerVanItem(item) : leegDossierInvoer("nieuws"));
  const [fout, setFout] = useState<string | null>(null);
  const [bevestig, setBevestig] = useState(false);
  const perAssessment = dossierBouwblokkenPerAssessment(assessments);
  // De pil-groep Gaat over: Het Assessment waarvan de chips staan. Een bestaande koppeling bepaalt waarmee het begint.
  const [koppelAssessmentId, setKoppelAssessmentId] = useState<string>(
    () => perAssessment.find((a) => a.bouwblokken.some((b) => (item?.bouwblokIds ?? []).includes(b.bouwblok.id)))?.assessment.id ?? perAssessment[0]?.assessment.id ?? ""
  );
  const koppel = perAssessment.find((a) => a.assessment.id === koppelAssessmentId) ?? perAssessment[0];
  const isCase = invoer.soort === "case";
  const isEvent = invoer.soort === "event";
  const isBenchmark = invoer.soort === "benchmark";

  const zet = (patch: Partial<DossierInvoer>) => {
    setInvoer((v) => ({ ...v, ...patch }));
    setFout(null);
  };

  // Welke Organisaties zijn te kiezen: Die met de Afspraak en die waar de Consultant toegang toe heeft (met "Geen toestemming" erbij).
  const keuzes = alle
    .filter((o) => o.id !== organisatie.id && (o.caseToegestaan === true || magDossierBewerken(gebruiker, o) || o.id === invoer.caseOrganisatieId))
    .sort((a, b) => a.naam.localeCompare(b.naam, "nl", { sensitivity: "base" }));
  const caseOrg = alle.find((o) => o.id === invoer.caseOrganisatieId);
  const reden = isCase ? kanOpenZetten(invoer, caseOrg) : null;
  const toestemming = isCase && caseOrg ? caseOrg.caseToegestaan === true : null;
  const branche = brancheVan(caseOrg, korteNamen);
  // Een item dat al zichtbaar was, mag zichtbaar blijven; nieuw zichtbaar maken kan alleen als het mag.
  const schakelaarUit = reden !== null && !(item?.zichtbaarVoorLead && invoer.zichtbaarVoorLead);
  const kanCaseVlag = magCaseVlagZetten(gebruiker);

  // Benchmark: Alleen benchmarks waar de Organisatie in zit en die nog niet in het Dossier staan (de eigen keuze van dit item blijft staan).
  const andereBenchmarkIds = dossierVan(organisatie)
    .items.filter((i) => i.soort === "benchmark" && i.benchmarkId && i.id !== item?.id)
    .map((i) => i.benchmarkId as string);
  const benchmarkKeuzes = benchmarksVoorDossier(benchmarks, organisatie.id).filter((b) => !andereBenchmarkIds.includes(b.id));
  const gekozenBenchmark = isBenchmark ? benchmarks.find((b) => b.id === invoer.benchmarkId) : undefined;
  const aantalLeads = organisatie.leden.filter((l) => l.lead === true).length;
  const leadsMetToegang = gekozenBenchmark ? leadsMetBenchmark(organisatie, gekozenBenchmark.id).length : 0;
  const kanLeadsOpenen = magLeadToekennen(gebruiker);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    const r = item ? wijzigDossieritem(organisatie.id, item.id, invoer) : voegDossieritemToe(organisatie.id, invoer);
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  function verwijder() {
    if (!item) return;
    const r = verwijderDossieritem(organisatie.id, item.id);
    if (!r.ok) {
      setBevestig(false);
      return setFout(r.reden);
    }
    onSluit();
  }

  function naarLeads() {
    onSluit();
    openOverzicht("leads", organisatie.id);
  }

  function naarAfspraken() {
    onSluit();
    document.querySelector('[aria-label="Afspraken"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <OverzichtModal label={item ? "Item bewerken" : "Item toevoegen aan het Dossier"} onSluit={onSluit} escUitgeschakeld={bevestig} className="modal-box--dossier">
        <form onSubmit={opslaan}>
          <div className="overzicht-kop">
            <h2>{item ? "Item bewerken" : "Item toevoegen aan het Dossier"}</h2>
          </div>

          <div className="admin-field">
            <span className="dos-label">Soort</span>
            <WeergaveWissel<DossierSoort>
              ariaLabel="Soort"
              waarde={invoer.soort}
              onChange={(soort) => zet({ soort })}
              opties={(["nieuws", "case", "event", "blog", "benchmark"] as DossierSoort[]).map((soort) => ({
                waarde: soort,
                label: SOORT_LABEL[soort],
                disabled: !!item && item.soort !== soort,
              }))}
            />
          </div>

          {!isBenchmark && (
            <div className="admin-field">
              <label htmlFor="dos-titel">Titel</label>
              <input id="dos-titel" type="text" autoFocus maxLength={TITEL_MAX} value={invoer.titel} onChange={(e) => zet({ titel: e.target.value })} />
            </div>
          )}

          {isBenchmark ? (
            <div className="admin-field">
              <label htmlFor="dos-benchmark">Benchmark</label>
              <select id="dos-benchmark" value={invoer.benchmarkId ?? ""} onChange={(e) => zet({ benchmarkId: e.target.value || null })}>
                <option value="">Kies een benchmark</option>
                {benchmarkKeuzes.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.naam}
                  </option>
                ))}
              </select>
              <span className="dos-hint">
                Alleen benchmarks waar {organisatie.naam} in zit. De Lead ziet de naam van de benchmark, dus kies een naam zonder organisatienamen.
              </span>
              {gekozenBenchmark && (
                <>
                  <dl className="dos-benchmark-gegevens">
                    <div>
                      <dt>Assessment</dt>
                      <dd>{gekozenBenchmark.assessmentIds.map((id) => assessments.find((a) => a.id === id)?.naam).filter(Boolean).join(", ")}</dd>
                    </div>
                    <div>
                      <dt>Vergelijking</dt>
                      <dd>
                        {aantalOrganisatiesInBenchmark(gekozenBenchmark)} {aantalOrganisatiesInBenchmark(gekozenBenchmark) === 1 ? "organisatie" : "organisaties"}
                      </dd>
                    </div>
                    <div>
                      <dt>Soort</dt>
                      <dd>{gekozenBenchmark.soort === "verkenning" ? "Verkenning" : "Vaste groep"}</dd>
                    </div>
                  </dl>
                  {leadsMetToegang > 0 ? (
                    <p className="dos-paneel dos-paneel--groen">
                      {leadsMetToegang} van {aantalLeads} Leads van {organisatie.naam} hebben toegang tot deze benchmark. Alleen zij zien dit item.
                    </p>
                  ) : (
                    <p className="dos-paneel dos-paneel--oranje">
                      Geen enkele Lead van {organisatie.naam} heeft toegang tot deze benchmark. Een Admin geeft toegang in het Leads-venster. Zolang dat niet is gebeurd,
                      ziet niemand dit item.{" "}
                      {kanLeadsOpenen ? (
                        <button type="button" className="btn btn-outline btn-compact dos-paneel-knop" onClick={naarLeads}>
                          Naar Leads
                        </button>
                      ) : (
                        <strong>Vraag een Admin om de Lead toegang te geven.</strong>
                      )}
                    </p>
                  )}
                </>
              )}
            </div>
          ) : isCase ? (
            <>
              <TekstMetTeller
                id="dos-samenvatting"
                label="Samenvatting"
                hoogte="samenvatting"
                max={SAMENVATTING_MAX}
                waarde={invoer.samenvatting}
                onChange={(samenvatting) => zet({ samenvatting })}
                hint="Noem de organisatie niet bij naam."
              />
              <div className="dos-twee dos-twee--boven">
                <div className="admin-field">
                  <label htmlFor="dos-case-org">Organisatie in de case</label>
                  <select id="dos-case-org" value={invoer.caseOrganisatieId ?? ""} onChange={(e) => zet({ caseOrganisatieId: e.target.value || null })}>
                    <option value="">Kies een organisatie</option>
                    {keuzes.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.naam}
                        {o.caseToegestaan === true ? "" : " (Geen toestemming)"}
                      </option>
                    ))}
                  </select>
                  {caseOrg && toestemming && <p className="dos-paneel dos-paneel--groen">Toestemming staat vastgelegd bij de Afspraken van {caseOrg.naam}.</p>}
                  {caseOrg && !toestemming && (
                    <p className="dos-paneel dos-paneel--oranje">
                      {caseOrg.naam} heeft de Afspraak &ldquo;Mag als case gebruikt worden&rdquo; niet. Zonder die toestemming kan deze case niet zichtbaar worden voor de Lead.{" "}
                      {kanCaseVlag ? (
                        <button type="button" className="btn btn-outline btn-compact dos-paneel-knop" onClick={naarAfspraken}>
                          Naar Afspraken
                        </button>
                      ) : (
                        <strong>Vraag een Admin om &lsquo;Mag als case gebruikt worden&rsquo; aan te zetten.</strong>
                      )}
                    </p>
                  )}
                </div>
                <div className="admin-field">
                  <label htmlFor="dos-branche">Branche</label>
                  <input id="dos-branche" type="text" readOnly value={branche} placeholder={caseOrg ? "" : "Volgt uit de organisatie in de case"} />
                  <span className="dos-hint">
                    {caseOrg && !branche ? `Vul de Sector in bij de Kenmerken van ${caseOrg.naam}.` : "Uit de kenmerken van de organisatie."}
                  </span>
                </div>
              </div>
              <div className="dos-twee">
                <div className="admin-field">
                  <label htmlFor="dos-omvang">Omvang</label>
                  <input id="dos-omvang" type="text" maxLength={OMVANG_MAX} placeholder="800 medewerkers" value={invoer.omvang} onChange={(e) => zet({ omvang: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label htmlFor="dos-resultaat">Tot resultaat</label>
                  <input id="dos-resultaat" type="text" maxLength={TOT_RESULTAAT_MAX} placeholder="6 weken" value={invoer.totResultaat} onChange={(e) => zet({ totResultaat: e.target.value })} />
                </div>
              </div>
              <div className="admin-field">
                <label htmlFor="dos-url">Link naar de volledige case</label>
                <input id="dos-url" type="text" inputMode="url" placeholder="https://" value={invoer.url} onChange={(e) => zet({ url: e.target.value })} />
              </div>
            </>
          ) : isEvent ? (
            <>
              <div className="dos-twee">
                <div className="admin-field">
                  <label htmlFor="dos-datum">Datum</label>
                  <input id="dos-datum" type="date" value={invoer.datum} onChange={(e) => zet({ datum: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label htmlFor="dos-einddatum">
                    Einddatum <span className="font-normal text-ink-s">(optioneel)</span>
                  </label>
                  <input id="dos-einddatum" type="date" value={invoer.einddatum} onChange={(e) => zet({ einddatum: e.target.value })} />
                </div>
              </div>
              <div className="admin-field">
                <label htmlFor="dos-plaats">Plaats</label>
                <input id="dos-plaats" type="text" maxLength={PLAATS_MAX} placeholder="Utrecht of Online" value={invoer.plaats} onChange={(e) => zet({ plaats: e.target.value })} />
              </div>
              <div className="admin-field">
                <label htmlFor="dos-url">
                  Link <span className="font-normal text-ink-s">(optioneel, de aanmeldpagina)</span>
                </label>
                <input id="dos-url" type="text" inputMode="url" placeholder="https://" value={invoer.url} onChange={(e) => zet({ url: e.target.value })} />
              </div>
            </>
          ) : (
            <>
              <div className="admin-field">
                <label htmlFor="dos-url">Link</label>
                <input id="dos-url" type="text" inputMode="url" placeholder="https://" value={invoer.url} onChange={(e) => zet({ url: e.target.value })} />
              </div>
              <div className="dos-twee">
                <div className="admin-field">
                  <label htmlFor="dos-bron">Bron</label>
                  <input id="dos-bron" type="text" maxLength={BRON_MAX} value={invoer.bron} onChange={(e) => zet({ bron: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label htmlFor="dos-datum">Datum</label>
                  <input id="dos-datum" type="date" value={invoer.gepubliceerdOp} onChange={(e) => zet({ gepubliceerdOp: e.target.value })} />
                </div>
              </div>
            </>
          )}

          <TekstMetTeller
            id="dos-toelichting"
            label={isCase ? "Waarom dit voor jullie telt" : "Toelichting"}
            placeholder={isBenchmark ? "Waarom is deze vergelijking relevant voor deze organisatie?" : undefined}
            hoogte="toelichting"
            max={TOELICHTING_MAX}
            waarde={invoer.toelichting}
            onChange={(toelichting) => zet({ toelichting })}
            hint="De Lead leest deze tekst zodra het item zichtbaar is voor de Lead."
          />

          <div className="admin-field">
            <span className="dos-label">Gaat over bouwstenen (optioneel)</span>
            {perAssessment.length > 1 && (
              <div className="dos-koppel">
                <WeergaveWissel<string>
                  ariaLabel="Assessment van de bouwstenen"
                  waarde={koppel?.assessment.id ?? ""}
                  onChange={setKoppelAssessmentId}
                  opties={perAssessment.map((a) => ({
                    waarde: a.assessment.id,
                    label: `${KOPPEL_NAAM[a.assessment.id] ?? a.assessment.kortLabel} ${a.bouwblokken.filter((b) => invoer.bouwblokIds.includes(b.bouwblok.id)).length}`,
                  }))}
                />
              </div>
            )}
            <div className="dos-chipgroepen">
              {chipGroepen(koppel?.bouwblokken ?? []).map((groep) => (
                <div key={groep.naam ?? "_"} className={`dos-chipgroep ${groep.naam ? "" : "dos-chipgroep--zonder"}`}>
                  {groep.naam && <span className="dos-chipgroep-naam">{groep.naam}</span>}
                  <div className="dos-chips">
                    {groep.bouwblokken.map(({ bouwblok, groepKleur }) => (
                      <BouwblokChip
                        key={bouwblok.id}
                        volgnummer={bouwblok.volgnummer}
                        naam={bouwblok.naam}
                        groepKleur={groepKleur}
                        gekozen={invoer.bouwblokIds.includes(bouwblok.id)}
                        onClick={() =>
                          zet({
                            bouwblokIds: invoer.bouwblokIds.includes(bouwblok.id)
                              ? invoer.bouwblokIds.filter((id) => id !== bouwblok.id)
                              : [...invoer.bouwblokIds, bouwblok.id],
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <span className="dos-hint">De Lead ziet de gekozen bouwstenen bij het item en kan in de radar op deze bouwstenen filteren.</span>
          </div>

          <div className={`dos-zichtbaar ${schakelaarUit ? "is-uit" : ""}`}>
            <div className="dos-zichtbaar-rij">
              <span id="dos-zichtbaar-item-label" className="dos-zichtbaar-label">
                Zichtbaar voor Lead
              </span>
              <Schakelaar
                aan={invoer.zichtbaarVoorLead}
                disabled={schakelaarUit}
                ariaLabelledBy="dos-zichtbaar-item-label"
                onChange={(aan) => zet({ zichtbaarVoorLead: aan })}
              />
            </div>
            <span className="dos-hint">
              {schakelaarUit && reden
                ? reden
                : invoer.zichtbaarVoorLead
                  ? isBenchmark
                    ? "De Lead ziet dit item zodra het Dossier zichtbaar is voor de Lead, en alleen een Lead met toegang tot de benchmark."
                    : "De Lead ziet dit item zodra het Dossier zichtbaar is voor de Lead."
                  : "Alleen jij en je collega-consultants zien dit item."}
            </span>
          </div>

          {fout && (
            <p className="overzicht-melding fout" role="alert" style={{ marginTop: "var(--sp-3)" }}>
              {fout}
            </p>
          )}
          <div className="dos-knoppen">
            {item ? (
              <button type="button" className="btn btn-danger btn-compact dos-knop" onClick={() => setBevestig(true)}>
                Verwijderen
              </button>
            ) : (
              <span />
            )}
            <span className="dos-knoppen-rechts">
              <button type="button" className="btn btn-outline btn-compact dos-knop" onClick={onSluit}>
                Annuleren
              </button>
              <button type="submit" className="btn btn-or btn-compact dos-knop">
                Opslaan
              </button>
            </span>
          </div>
        </form>
      </OverzichtModal>
      <BevestigModal
        open={bevestig}
        titel="Item verwijderen"
        bericht={`"${item?.soort === "benchmark" ? (gekozenBenchmark?.naam ?? "Benchmark") : (item?.titel ?? "")}" wordt verwijderd uit het Dossier van ${organisatie.naam}. Dit kan niet ongedaan worden gemaakt.`}
        onBevestigen={verwijder}
        onAnnuleren={() => setBevestig(false)}
      />
    </>
  );
}
