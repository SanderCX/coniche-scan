"use client";

import { useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magVerkennen } from "@/lib/rechten";
import { heeftEigenResultaat } from "@/lib/assessment-structuur";
import { korteNaamVeld, korteNaamWaarde } from "@/lib/korte-namen";
import { Meetperiode, VerkenEenheid } from "@/lib/types";
import {
  FilterStand,
  Groepering,
  KANALEN_ID,
  ONDERDEEL_ID,
  ORGANISATIE_ID,
  besluitGroepering,
  onderdeelVelden,
  rondDrempel,
  LEGE_FILTERS,
  bouwPool,
  filterVelden,
  getalWaarde,
  getalWaarden,
  heatmap as bouwHeatmap,
  kanGroeperen,
  metKanaal,
  kanalenVeld,
  lidWaarde,
  maakGroepen,
  mediaan,
  pasFiltersToe,
  splitsFocus,
  vergelijk,
  veldLabelZonderGroep,
  zonderWaarde,
} from "@/lib/verkennen";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { InfoIcoon } from "@/components/InfoIcoon";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { KenmerkenKaart, SNEL_BEGINNEN, SNEL_BEGINNEN_ONDERDELEN } from "@/components/verkennen/KenmerkenKaart";
import { LEGE_PERIODE_INVOER, MeetperiodeKeuze, PeriodeInvoer, periodeVanInvoer } from "@/components/verkennen/MeetperiodeKeuze";
import { OpslaanAlsBenchmark } from "@/components/verkennen/OpslaanAlsBenchmark";
import { GroeperOptie, Vergelijken } from "@/components/verkennen/Vergelijken";
import { Sortering, WeergaveGroepRest } from "@/components/verkennen/WeergaveGroepRest";
import { WeergaveHeatmap } from "@/components/verkennen/WeergaveHeatmap";
import { WeergaveVerband, verbandPunten } from "@/components/verkennen/WeergaveVerband";

type Weergave = "groep" | "spreiding" | "heatmap" | "verband";
const VERBAND_X = [
  { id: "kpis.aht", label: "AHT" },
  { id: "kpis.ftr", label: "FTR" },
  { id: "kpis.nps", label: "NPS" },
];

/**
 * Verkennen (`visualisatie-verkennen.md`, `beheerpagina.md`, punt 15): Alle Organisaties van één Assessment filteren, groeperen
 * en naast elkaar zetten, alleen voor een Admin. Het scherm begint leeg: De Admin voegt kenmerken toe, elk kenmerk is een filter
 * en een mogelijke groepering. Het scherm slaat niets op: De stand verdwijnt als de Admin het scherm verlaat. Een Assessment met
 * Ja / Nee / Weet ik niet staat er nog niet in (`visualisatie-verkennen.md`, Later).
 */
export default function VerkennenPage() {
  const gebruiker = useIngelogdeGebruiker();
  const assessments = useAssessments().filter((a) => !heeftEigenResultaat(a));
  const organisaties = useOrganisaties();
  const instellingen = useInstellingen();

  const [assessmentKeuze, setAssessmentKeuze] = useState<string>("");
  const [eenheid, setEenheid] = useState<VerkenEenheid>("organisaties");
  const [periodeInvoer, setPeriodeInvoer] = useState<PeriodeInvoer>(LEGE_PERIODE_INVOER);
  // Het gekozen kanaal per KPI (`null` is Algemeen): Een KPI met `perKanaal` heeft een groep Kanaal bij het kenmerk.
  const [kpiKanaal, setKpiKanaal] = useState<Record<string, string | null>>({});
  const [filters, setFilters] = useState<FilterStand>(LEGE_FILTERS);
  const [kenmerken, setKenmerken] = useState<string[]>([]);
  const [gekozenOp, setGekozenOp] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const [drempel, setDrempel] = useState<number | null>(null);
  const [focusKeuze, setFocusKeuze] = useState<string | undefined>(undefined);
  const [weergave, setWeergave] = useState<Weergave>("groep");
  const [sortering, setSortering] = useState<Sortering>("model");
  const [verbandX, setVerbandX] = useState(VERBAND_X[0].id);
  const [verbandY, setVerbandY] = useState("overall");

  const assessment = assessments.find((a) => a.id === assessmentKeuze) ?? assessments[0];
  // Het scherm rekent bij elke wijziging opnieuw: De pool is klein en er wordt niets opgeslagen.
  const bouwVelden = (kanaalPerKpi: Record<string, string | null>) =>
    filterVelden(undefined, instellingen.kpiDefinities).map((v) => (v.kpi ? metKanaal(v, kanaalPerKpi[v.kpi.kpiId] ?? null) : v));
  const velden = bouwVelden(kpiKanaal);
  // Bij de eenheid Onderdelen komen de kenmerken Organisatie en Onderdeel erbij (`visualisatie-verkennen.md`, Eenheid).
  const filterbaar = eenheid === "onderdelen" ? [...velden, ...onderdeelVelden()] : velden;
  const alleVelden = [...filterbaar, kanalenVeld()];
  const eenheidWoord = eenheid === "onderdelen" ? "onderdelen" : "Organisaties";
  const meetperiode = periodeVanInvoer(periodeInvoer);
  const pool = assessment ? bouwPool(organisaties, assessment, instellingen.benchmarkMinScans, eenheid, meetperiode) : null;
  const gefilterd = pool ? pasFiltersToe(pool.leden, filters, filterbaar) : [];
  const drempels = {
    minPool: instellingen.verkennenMinPool,
    maxGroepen: instellingen.verkennenMaxGroepen,
    minIngevuldPct: instellingen.verkennenMinIngevuldPct,
  };
  const korte = (id: string, label: string) => korteNaamVeld(instellingen.korteNamen, id, label);

  // Welke kenmerken kunnen groeperen: Elk toegevoegd kenmerk is een pil, ook Ingezette kanalen (altijd uitgeschakeld).
  const optiesVoor = (
    ids: string[],
    gefilterdeLeden: typeof gefilterd,
    poolLeden = pool?.leden ?? [],
    woord = eenheidWoord,
    beschikbaar = alleVelden
  ): GroeperOptie[] =>
    pool
      ? ids
          .map((id) => beschikbaar.find((v) => v.id === id))
          .filter((v): v is NonNullable<typeof v> => v !== undefined)
          .map((veld) => {
            const naam = veld.id === KANALEN_ID ? korte(KANALEN_ID, "Ingezette kanalen") : korte(veld.id, veldLabelZonderGroep(veld));
            // Bij een KPI met een kanaal anders dan Algemeen staat het kanaal in de naam: "AHT Call-drempel".
            const kanaalNaam = veld.kpi?.kanaalId ? instellingen.kanalen.find((k) => k.id === veld.kpi?.kanaalId)?.naam : undefined;
            return {
              veld,
              naam: veld.type === "getal" ? `${naam}${kanaalNaam ? ` ${kanaalNaam}` : ""}-drempel` : naam,
              bruikbaarheid: kanGroeperen(veld, poolLeden, gefilterdeLeden, drempels, woord),
            };
          })
      : [];
  const groeperOpties = optiesVoor(kenmerken, gefilterd);
  const effectiefOptie = groeperOpties.find((o) => o.veld.id === gekozenOp && o.bruikbaarheid.ok);
  const effectief = effectiefOptie?.veld.id ?? null;

  /**
   * Elke wijziging van kenmerken, filters of keuze loopt hierdoor (`visualisatie-verkennen.md`, Terugval, Levensduur van een
   * melding en Herstel): De groepering en de melding worden opnieuw bepaald. Een melding beschrijft zo één gebeurtenis en
   * verdwijnt bij de volgende wijziging, en een kenmerk dat weer kan groeperen wordt zonder melding gekozen.
   */
  const wijzig = (verandering: {
    kenmerken?: string[];
    filters?: FilterStand;
    gekozen?: string | null;
    eenheid?: VerkenEenheid;
    periode?: PeriodeInvoer;
    kpiKanaal?: Record<string, string | null>;
  }) => {
    if (!pool || !assessment) return;
    const nieuweEenheid = verandering.eenheid ?? eenheid;
    const eenheidGewisseld = nieuweEenheid !== eenheid;
    const nieuweInvoer = verandering.periode ?? periodeInvoer;
    const nieuwePeriode: Meetperiode | null = periodeVanInvoer(nieuweInvoer);
    const periodeGewijzigd = nieuwePeriode?.van !== meetperiode?.van || nieuwePeriode?.totEnMet !== meetperiode?.totEnMet;
    const nieuwePool =
      eenheidGewisseld || periodeGewijzigd
        ? bouwPool(organisaties, assessment, instellingen.benchmarkMinScans, nieuweEenheid, nieuwePeriode)
        : pool;
    const nieuweKpiKanaal = verandering.kpiKanaal ?? kpiKanaal;
    const nieuweVelden = bouwVelden(nieuweKpiKanaal);
    const nieuweFilterbaar = nieuweEenheid === "onderdelen" ? [...nieuweVelden, ...onderdeelVelden()] : nieuweVelden;
    const nieuweAlle = [...nieuweFilterbaar, kanalenVeld()];
    const woord = nieuweEenheid === "onderdelen" ? "onderdelen" : "Organisaties";
    let nieuweKenmerken = verandering.kenmerken ?? kenmerken;
    let nieuweFilters = verandering.filters ?? filters;
    // Bij het wisselen naar Organisaties vervallen Organisatie en Onderdeel met hun filters (`visualisatie-verkennen.md`, Eenheid).
    const vervallen = eenheidGewisseld && nieuweEenheid === "organisaties" ? [ORGANISATIE_ID, ONDERDEEL_ID] : [];
    if (vervallen.length > 0) {
      nieuweKenmerken = nieuweKenmerken.filter((k) => !vervallen.includes(k));
      const select = { ...nieuweFilters.select };
      for (const k of vervallen) delete select[k];
      nieuweFilters = { ...nieuweFilters, select };
    }
    const nieuweGefilterd = pasFiltersToe(nieuwePool.leden, nieuweFilters, nieuweFilterbaar);
    const nieuweOpties = optiesVoor(nieuweKenmerken, nieuweGefilterd, nieuwePool.leden, woord, nieuweAlle);
    const vorige = verandering.gekozen !== undefined ? verandering.gekozen : gekozenOp;
    const vorigeVeld = vorige ? alleVelden.find((v) => v.id === vorige) : undefined;
    const besluit = besluitGroepering({
      vorige,
      kenmerken: nieuweOpties.map((o) => ({ id: o.veld.id, naam: o.naam, bruikbaarheid: o.bruikbaarheid })),
      vorigeNaam: vorigeVeld ? korte(vorigeVeld.id, veldLabelZonderGroep(vorigeVeld)) : undefined,
      vorigeWeg:
        vorige && vervallen.includes(vorige) ? "Organisatie en Onderdeel bestaan alleen bij Eenheid Onderdelen" : undefined,
      eenheidWoord: woord,
      poolGrootte: nieuweGefilterd.length,
      poolTotaal: nieuwePool.leden.length,
      minPool: drempels.minPool,
    });
    setEenheid(nieuweEenheid);
    setKpiKanaal(nieuweKpiKanaal);
    setPeriodeInvoer(nieuweInvoer);
    setKenmerken(nieuweKenmerken);
    setFilters(nieuweFilters);
    if (eenheidGewisseld) setFocusKeuze(undefined);
    setMelding(besluit.melding);
    if (besluit.gekozen !== gekozenOp) {
      setGekozenOp(besluit.gekozen);
      setDrempel(null);
      setFocusKeuze(undefined);
    }
  };

  const groeperVeld = effectiefOptie?.veld;
  const waardenVeld = groeperVeld && groeperVeld.type === "getal" ? getalWaarden(gefilterd, groeperVeld) : [];
  const mediaanVeld = mediaan(waardenVeld);
  const heleGetallen = waardenVeld.every((w) => Number.isInteger(w));
  const gekozenGroepering: Groepering | null = !groeperVeld
    ? null
    : groeperVeld.type === "select"
      ? { soort: "select", veldId: groeperVeld.id }
      : { soort: "drempel", veldId: groeperVeld.id, drempel: drempel ?? rondDrempel(mediaanVeld ?? 0, heleGetallen) };
  const groepen = gekozenGroepering
    ? maakGroepen(gefilterd, gekozenGroepering, filterbaar, (veldId, waarde) =>
        korteNaamWaarde(instellingen.korteNamen, veldId, waarde)
      )
    : [];
  // Bij het wisselen van groepering wordt de grootste groep de focus: Een focus die niet (meer) bestaat valt terug op de eerste.
  const focus = groepen.find((g) => g.sleutel === focusKeuze) ?? groepen[0];
  const { focus: focusLeden, rest: restLeden } = splitsFocus(gefilterd, groepen, focus);
  const zonderGroepering = gekozenGroepering === null;

  if (!magVerkennen(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet Verkennen.</p>
      </div>
    );
  }
  if (!assessment || !pool) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Er is geen Assessment om te verkennen.</p>
      </div>
    );
  }

  const vergelijking = vergelijk(pool.rijen, focusLeden, restLeden);
  const heat = bouwHeatmap(pool.rijen, gefilterd, groepen, instellingen.verkennenMinGroep);
  const focusIds = new Set(focusLeden.map((l) => l.id));
  const xVeld = VERBAND_X.find((x) => x.id === verbandX) ?? VERBAND_X[0];
  const xDef = velden.find((v) => v.id === xVeld.id);
  const yIndex = verbandY === "overall" ? -1 : pool.rijen.findIndex((r) => r.bouwblok.id === verbandY);
  const punten = verbandPunten(
    gefilterd,
    focusIds,
    (l) => getalWaarde(xDef ? lidWaarde(l, xDef) : undefined),
    (l) => (yIndex === -1 ? l.overall : l.scores[yIndex])
  );
  const yLabel = yIndex === -1 ? "Overall score" : pool.rijen[yIndex].bouwblok.naam;
  // Zonder groepering is Grootste verschil uitgeschakeld: Er is geen rest om mee te vergelijken.
  const grootsteVerschilKan = !(weergave === "groep" && zonderGroepering);
  const sorteringNu: Sortering = sortering === "uitslag" && !grootsteVerschilKan ? "model" : sortering;

  const voegToe = (id: string) => {
    if (kenmerken.includes(id)) return;
    // Het eerste bruikbare kenmerk dat de Admin toevoegt, wordt automatisch de groepering (`besluitGroepering`).
    wijzig({ kenmerken: [...kenmerken, id] });
  };
  const verwijder = (id: string) => {
    // Het kruisje haalt ook het filter weg.
    const select = { ...filters.select };
    delete select[id];
    const bereik = { ...filters.bereik };
    delete bereik[id];
    wijzig({
      kenmerken: kenmerken.filter((k) => k !== id),
      filters: { ...filters, select, bereik, kanalen: id === KANALEN_ID ? [] : filters.kanalen },
    });
  };

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad delen={[{ label: "Resultaten", href: "/beheer/resultaten/metingen" }, { label: "Verkennen" }]} />
      <span className="eyebrow">Resultaten</span>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <h1 style={{ margin: 0 }}>Verkennen</h1>
        <InfoIcoon sleutel="info.verkennen" />
      </div>
      <p className="text-sm text-ink-m" style={{ marginTop: "0.4rem" }}>
        Filter de Organisaties van één Assessment, groepeer ze en zet groepen naast elkaar. Het scherm slaat niets op.
      </p>

      <div className="admin-field" style={{ maxWidth: "26rem", marginTop: "1rem" }}>
        <label htmlFor="verkennen-assessment">Assessment</label>
        <select
          id="verkennen-assessment"
          value={assessment.id}
          onChange={(e) => {
            setAssessmentKeuze(e.target.value);
            setKpiKanaal({});
            setPeriodeInvoer(LEGE_PERIODE_INVOER);
            setFilters(LEGE_FILTERS);
            setKenmerken([]);
            setGekozenOp(null);
            setMelding(null);
            setDrempel(null);
            setFocusKeuze(undefined);
            setVerbandY("overall");
          }}
        >
          {assessments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.naam}
            </option>
          ))}
        </select>
      </div>

      <div className="vk-eenheid">
        <span className="text-sm text-ink-m">Eenheid</span>
        <InfoIcoon naastVeld sleutel="info.verkennenEenheid" />
        <WeergaveWissel<VerkenEenheid>
          ariaLabel="Eenheid"
          opties={[
            { waarde: "organisaties", label: "Organisaties" },
            { waarde: "onderdelen", label: "Onderdelen" },
          ]}
          waarde={eenheid}
          onChange={(nieuw) => wijzig({ eenheid: nieuw })}
        />
      </div>

      <MeetperiodeKeuze
        invoer={periodeInvoer}
        onChange={(periode) => wijzig({ periode })}
        eenheidWoord={eenheidWoord}
        buitenPeriode={pool.buitenPeriode}
      />

      <KenmerkenKaart
        velden={alleVelden}
        kenmerken={kenmerken}
        stand={filters}
        onStand={(f) => wijzig({ filters: f })}
        onToevoegen={voegToe}
        onVerwijder={verwijder}
        kpiKanaal={kpiKanaal}
        onKpiKanaal={(kpiId, kanaalId) => {
          // Wisselt de Admin van kanaal bij de KPI waarop gegroepeerd wordt, dan keert de drempel terug naar de mediaan van de nieuwe waarden.
          if (gekozenOp === `kpis.${kpiId}`) setDrempel(null);
          wijzig({ kpiKanaal: { ...kpiKanaal, [kpiId]: kanaalId } });
        }}
        pool={pool.leden}
        gefilterd={gefilterd}
        zonderToestemming={pool.zonderToestemming}
        eenheidWoord={eenheidWoord}
        snelBeginnen={eenheid === "onderdelen" ? SNEL_BEGINNEN_ONDERDELEN : SNEL_BEGINNEN}
        onderTeller={
          <OpslaanAlsBenchmark
            assessment={assessment}
            eenheid={eenheid}
            meetperiode={meetperiode}
            stand={filters}
            poolGrootte={pool.leden.length}
            gefilterd={gefilterd}
            organisaties={organisaties}
          />
        }
      />

      <Vergelijken
        opties={groeperOpties}
        heeftKenmerken={kenmerken.length > 0}
        effectief={effectief}
        onKies={(id) => wijzig({ gekozen: id })}
        melding={melding}
        leden={gefilterd}
        drempel={drempel}
        onDrempel={setDrempel}
        groepen={groepen}
        zonderWaarde={groeperVeld ? zonderWaarde(gefilterd, groeperVeld) : 0}
        focusSleutel={focus?.sleutel}
        onFocus={setFocusKeuze}
        focusLeden={focusLeden}
        restLeden={restLeden}
        minGroep={instellingen.verkennenMinGroep}
        waarschuwing={instellingen.verkennenMinVergelijking}
        eenheidWoord={eenheidWoord}
      />

      <section className="qv-kaart" aria-label="Resultaten" style={{ marginTop: "1.5rem" }}>
        <div className="vis-acties">
          <WeergaveWissel
            ariaLabel="Weergave van de resultaten"
            opties={[
              { waarde: "groep", label: zonderGroepering ? "De pool" : "Groep tegenover de rest" },
              { waarde: "spreiding", label: "Spreiding binnen de groep" },
              { waarde: "heatmap", label: "Alle groepen naast elkaar" },
              { waarde: "verband", label: "Verband met een kenmerk" },
            ]}
            waarde={weergave}
            onChange={setWeergave}
          />
          {(weergave === "groep" || weergave === "spreiding") && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}>
              <span className="text-sm text-ink-m">Sorteren</span>
              <WeergaveWissel
                ariaLabel="Sorteren"
                opties={[
                  { waarde: "model", label: "Volgorde van het model" },
                  {
                    waarde: "uitslag",
                    label: weergave === "groep" ? "Grootste verschil" : "Grootste spreiding",
                    disabled: !grootsteVerschilKan,
                    title: grootsteVerschilKan ? undefined : "Er is geen groepering om mee te vergelijken",
                  },
                ]}
                waarde={sorteringNu}
                onChange={setSortering}
              />
            </span>
          )}
          {weergave === "verband" && (
            <>
              <div className="admin-field" style={{ marginBottom: 0 }}>
                <label htmlFor="verband-x">Kenmerk</label>
                <select id="verband-x" value={verbandX} onChange={(e) => setVerbandX(e.target.value)}>
                  {VERBAND_X.map((x) => (
                    <option key={x.id} value={x.id}>
                      {korte(x.id, x.label)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field" style={{ marginBottom: 0 }}>
                <label htmlFor="verband-y">Score</label>
                <select id="verband-y" value={verbandY} onChange={(e) => setVerbandY(e.target.value)}>
                  <option value="overall">Overall score</option>
                  {pool.rijen.map((r) => (
                    <option key={r.bouwblok.id} value={r.bouwblok.id}>
                      {r.bouwblok.volgnummer}. {r.bouwblok.naam}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {gefilterd.length === 0 ? (
          <p className="admin-notice">Geen enkele Organisatie in de pool voldoet aan de filters.</p>
        ) : weergave === "heatmap" ? (
          <WeergaveHeatmap
            assessment={assessment}
            rijen={pool.rijen}
            heatmap={heat}
            minGroep={instellingen.verkennenMinGroep}
            hint={zonderGroepering ? "Kies een kenmerk om groepen naast elkaar te zetten" : undefined}
            onFocus={(sleutel) => {
              setFocusKeuze(sleutel);
              setWeergave("groep");
            }}
          />
        ) : weergave === "verband" ? (
          <WeergaveVerband minPunten={instellingen.verkennenMinGroep} eenheidWoord={eenheidWoord} punten={punten} xLabel={korte(xVeld.id, xVeld.label)} yLabel={yLabel} eenheidX={xDef?.eenheid} />
        ) : !zonderGroepering && (focusLeden.length === 0 || restLeden.length === 0) ? (
          <p className="admin-notice">
            {focusLeden.length === 0 ? "De focus is leeg." : "De rest is leeg."} Kies een andere focusgroep of pas de filters aan.
          </p>
        ) : (
          <WeergaveGroepRest
            assessment={assessment}
            vergelijking={vergelijking}
            modus={weergave}
            sortering={sorteringNu}
            focusNaam={focus?.naam ?? "de focus"}
            zonderGroepering={zonderGroepering}
            eenheidWoord={eenheidWoord}
          />
        )}
      </section>
    </div>
  );
}
