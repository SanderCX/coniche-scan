"use client";

import { useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magVerkennen } from "@/lib/rechten";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import {
  FilterStand,
  LEGE_FILTERS,
  bouwPool,
  filterVelden,
  getalWaarde,
  getalWaarden,
  heatmap as bouwHeatmap,
  kenmerkWaarde,
  maakGroepen,
  mediaan,
  pasFiltersToe,
  splitsFocus,
  vergelijk,
} from "@/lib/verkennen";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { InfoIcoon } from "@/components/InfoIcoon";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { FilterPaneel } from "@/components/verkennen/FilterPaneel";
import { AHT_VELD, GroeperenOp, Vergelijken, groepering } from "@/components/verkennen/Vergelijken";
import { Sortering, WeergaveGroepRest } from "@/components/verkennen/WeergaveGroepRest";
import { WeergaveHeatmap } from "@/components/verkennen/WeergaveHeatmap";
import { WeergaveVerband, verbandPunten } from "@/components/verkennen/WeergaveVerband";

type Weergave = "groep" | "spreiding" | "heatmap" | "verband";
const VERBAND_X = [
  { id: "kpis.aht", label: "AHT", eenheid: "seconden" },
  { id: "kpis.ftr", label: "FTR", eenheid: "%" },
  { id: "kpis.nps", label: "NPS", eenheid: undefined },
];

/**
 * Verkennen (`visualisatie-verkennen.md`, `beheerpagina.md`, punt 15): Alle Organisaties van één Assessment filteren, groeperen
 * en naast elkaar zetten, alleen voor een Admin. Het scherm slaat niets op: De stand verdwijnt als de Admin het scherm verlaat.
 * Een Assessment met Ja / Nee / Weet ik niet staat er nog niet in (`visualisatie-verkennen.md`, Later).
 */
export default function VerkennenPage() {
  const gebruiker = useIngelogdeGebruiker();
  const assessments = useAssessments().filter((a) => !isJaNeeWeetNiet(a));
  const organisaties = useOrganisaties();
  const instellingen = useInstellingen();

  const [assessmentKeuze, setAssessmentKeuze] = useState<string>("");
  const [filters, setFilters] = useState<FilterStand>(LEGE_FILTERS);
  const [toegevoegd, setToegevoegd] = useState<string[]>([]);
  const [op, setOp] = useState<GroeperenOp>("crm");
  const [drempel, setDrempel] = useState<number | null>(null);
  const [focusKeuze, setFocusKeuze] = useState<string | undefined>(undefined);
  const [weergave, setWeergave] = useState<Weergave>("groep");
  const [sortering, setSortering] = useState<Sortering>("model");
  const [verbandX, setVerbandX] = useState(VERBAND_X[0].id);
  const [verbandY, setVerbandY] = useState("overall");

  const assessment = assessments.find((a) => a.id === assessmentKeuze) ?? assessments[0];
  // Het scherm rekent bij elke wijziging opnieuw: De pool is klein en er wordt niets opgeslagen.
  const velden = filterVelden();
  const pool = assessment ? bouwPool(organisaties, assessment, instellingen.benchmarkMinScans) : null;
  const gefilterd = pool ? pasFiltersToe(pool.leden, filters, velden) : [];
  const ahtVeld = velden.find((v) => v.id === AHT_VELD);
  const ahtMediaan = ahtVeld ? mediaan(getalWaarden(gefilterd, ahtVeld)) : null;
  const gekozenGroepering = groepering(op, drempel, ahtMediaan === null ? null : Math.round(ahtMediaan));
  const groepen = maakGroepen(gefilterd, gekozenGroepering, velden);
  // Bij het wisselen van groepering wordt de grootste groep de focus: Een focus die niet (meer) bestaat valt terug op de eerste.
  const focus = groepen.find((g) => g.sleutel === focusKeuze) ?? groepen[0];
  const { focus: focusLeden, rest: restLeden } = splitsFocus(gefilterd, focus);

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
  const focusIds = new Set(focusLeden.map((l) => l.organisatie.id));
  const xVeld = VERBAND_X.find((x) => x.id === verbandX) ?? VERBAND_X[0];
  const yIndex = verbandY === "overall" ? -1 : pool.rijen.findIndex((r) => r.bouwblok.id === verbandY);
  const punten = verbandPunten(
    gefilterd,
    focusIds,
    (l) => getalWaarde(kenmerkWaarde(l.organisatie, xVeld.id.split("."))),
    (l) => (yIndex === -1 ? l.overall : l.scores[yIndex])
  );
  const yLabel = yIndex === -1 ? "Overall score" : pool.rijen[yIndex].bouwblok.naam;

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
            setFilters(LEGE_FILTERS);
            setToegevoegd([]);
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

      <FilterPaneel
        velden={velden}
        stand={filters}
        onChange={setFilters}
        toegevoegd={toegevoegd}
        onToegevoegd={setToegevoegd}
        pool={pool.leden}
        gefilterd={gefilterd}
        zonderToestemming={pool.zonderToestemming}
      />

      <Vergelijken
        velden={velden}
        leden={gefilterd}
        op={op}
        onOp={(nieuw) => {
          setOp(nieuw);
          setFocusKeuze(undefined);
        }}
        drempel={drempel}
        onDrempel={setDrempel}
        groepen={groepen}
        focusSleutel={focus?.sleutel}
        onFocus={setFocusKeuze}
        focusLeden={focusLeden}
        restLeden={restLeden}
        minGroep={instellingen.verkennenMinGroep}
        waarschuwing={instellingen.verkennenWaarschuwingGroep}
      />

      <section className="qv-kaart" aria-label="Resultaten" style={{ marginTop: "1.5rem" }}>
        <div className="vis-acties">
          <WeergaveWissel
            ariaLabel="Weergave van de resultaten"
            opties={[
              { waarde: "groep", label: "Groep tegenover de rest" },
              { waarde: "spreiding", label: "Spreiding binnen de groep" },
              { waarde: "heatmap", label: "Alle groepen naast elkaar" },
              { waarde: "verband", label: "Verband met een kenmerk" },
            ]}
            waarde={weergave}
            onChange={setWeergave}
          />
          {(weergave === "groep" || weergave === "spreiding") && (
            <>
              <span className="text-sm text-ink-m">Sorteren</span>
              <WeergaveWissel
                ariaLabel="Sorteren"
                opties={[
                  { waarde: "model", label: "Volgorde van het model" },
                  { waarde: "uitslag", label: weergave === "groep" ? "Grootste verschil" : "Grootste spreiding" },
                ]}
                waarde={sortering}
                onChange={setSortering}
              />
            </>
          )}
          {weergave === "verband" && (
            <>
              <div className="admin-field" style={{ marginBottom: 0 }}>
                <label htmlFor="verband-x">Kenmerk</label>
                <select id="verband-x" value={verbandX} onChange={(e) => setVerbandX(e.target.value)}>
                  {VERBAND_X.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.label}
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
            onFocus={(sleutel) => {
              setFocusKeuze(sleutel);
              setWeergave("groep");
            }}
          />
        ) : weergave === "verband" ? (
          <WeergaveVerband punten={punten} xLabel={xVeld.label} yLabel={yLabel} eenheidX={xVeld.eenheid} />
        ) : focusLeden.length === 0 || restLeden.length === 0 ? (
          <p className="admin-notice">
            {focusLeden.length === 0 ? "De focus is leeg." : "De rest is leeg."} Kies een andere focusgroep of pas de filters aan.
          </p>
        ) : (
          <WeergaveGroepRest
            assessment={assessment}
            vergelijking={vergelijking}
            modus={weergave}
            sortering={sortering}
            focusNaam={focus?.naam ?? "de focus"}
          />
        )}
      </section>
    </div>
  );
}
