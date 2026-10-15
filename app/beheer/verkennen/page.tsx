"use client";

import { useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magVerkennen } from "@/lib/rechten";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import { korteNaamVeld, korteNaamWaarde } from "@/lib/korte-namen";
import {
  FilterStand,
  Groepering,
  KANALEN_ID,
  LEGE_FILTERS,
  bouwPool,
  filterVelden,
  getalWaarde,
  getalWaarden,
  heatmap as bouwHeatmap,
  kanGroeperen,
  kanalenVeld,
  kenmerkWaarde,
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
import { KenmerkenKaart } from "@/components/verkennen/KenmerkenKaart";
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
  const assessments = useAssessments().filter((a) => !isJaNeeWeetNiet(a));
  const organisaties = useOrganisaties();
  const instellingen = useInstellingen();

  const [assessmentKeuze, setAssessmentKeuze] = useState<string>("");
  const [filters, setFilters] = useState<FilterStand>(LEGE_FILTERS);
  const [kenmerken, setKenmerken] = useState<string[]>([]);
  const [gekozenOp, setGekozenOp] = useState<string | null>(null);
  const [drempel, setDrempel] = useState<number | null>(null);
  const [focusKeuze, setFocusKeuze] = useState<string | undefined>(undefined);
  const [weergave, setWeergave] = useState<Weergave>("groep");
  const [sortering, setSortering] = useState<Sortering>("model");
  const [verbandX, setVerbandX] = useState(VERBAND_X[0].id);
  const [verbandY, setVerbandY] = useState("overall");

  const assessment = assessments.find((a) => a.id === assessmentKeuze) ?? assessments[0];
  // Het scherm rekent bij elke wijziging opnieuw: De pool is klein en er wordt niets opgeslagen.
  const velden = filterVelden();
  const alleVelden = [...velden, kanalenVeld()];
  const pool = assessment ? bouwPool(organisaties, assessment, instellingen.benchmarkMinScans) : null;
  const gefilterd = pool ? pasFiltersToe(pool.leden, filters, velden) : [];
  const drempels = {
    minPool: instellingen.verkennenMinPool,
    maxGroepen: instellingen.verkennenMaxGroepen,
    minIngevuldPct: instellingen.verkennenMinIngevuldPct,
  };
  const korte = (id: string, label: string) => korteNaamVeld(instellingen.korteNamen, id, label);

  // Welke kenmerken kunnen groeperen, en waarop er nu gegroepeerd wordt.
  const groeperOpties: GroeperOptie[] = pool
    ? kenmerken
        .map((id) => velden.find((v) => v.id === id))
        .filter((v): v is NonNullable<typeof v> => v !== undefined)
        .map((veld) => {
          const naam = korte(veld.id, veldLabelZonderGroep(veld));
          return {
            veld,
            naam: veld.type === "getal" ? `${naam}-drempel` : naam,
            bruikbaarheid: kanGroeperen(veld, pool.leden, gefilterd, drempels),
          };
        })
    : [];
  const eerstBruikbaar = groeperOpties.find((o) => o.bruikbaarheid.ok);
  const gekozenOptie = groeperOpties.find((o) => o.veld.id === gekozenOp);
  const effectiefOptie = gekozenOptie?.bruikbaarheid.ok ? gekozenOptie : eerstBruikbaar;
  const effectief = effectiefOptie?.veld.id ?? null;

  // De terugval (`visualisatie-verkennen.md`, Groeperen en focus): Een eerder gekozen kenmerk dat niet meer kan, met de reden.
  let melding: string | null = null;
  if (gekozenOp !== null && effectiefOptie?.veld.id !== gekozenOp) {
    const gekozenVeld = velden.find((v) => v.id === gekozenOp);
    const gekozenNaam = gekozenVeld ? korte(gekozenVeld.id, veldLabelZonderGroep(gekozenVeld)) : "Het kenmerk";
    const reden = gekozenOptie ? (gekozenOptie.bruikbaarheid.reden ?? "Het kenmerk kan niet groeperen") : `${gekozenNaam} is verwijderd`;
    if (effectiefOptie) melding = `${reden}. De groepering staat nu op ${effectiefOptie.naam}.`;
    else if (gefilterd.length < drempels.minPool && pool && pool.leden.length >= drempels.minPool) {
      melding = `Met deze filters zit er ${gefilterd.length} ${gefilterd.length === 1 ? "Organisatie" : "Organisaties"} in de pool. Dat is te weinig om te vergelijken. Haal een filter weg.`;
    } else melding = "Er is geen kenmerk meer om op te groeperen.";
  }

  const groeperVeld = effectiefOptie?.veld;
  const waardenVeld = groeperVeld && groeperVeld.type === "getal" ? getalWaarden(gefilterd, groeperVeld) : [];
  const mediaanVeld = mediaan(waardenVeld);
  const gekozenGroepering: Groepering | null = !groeperVeld
    ? null
    : groeperVeld.type === "select"
      ? { soort: "select", veldId: groeperVeld.id }
      : { soort: "drempel", veldId: groeperVeld.id, drempel: drempel ?? Math.round(mediaanVeld ?? 0) };
  const groepen = gekozenGroepering
    ? maakGroepen(gefilterd, gekozenGroepering, velden, (veldId, waarde) =>
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
  const focusIds = new Set(focusLeden.map((l) => l.organisatie.id));
  const xVeld = VERBAND_X.find((x) => x.id === verbandX) ?? VERBAND_X[0];
  const xDef = velden.find((v) => v.id === xVeld.id);
  const yIndex = verbandY === "overall" ? -1 : pool.rijen.findIndex((r) => r.bouwblok.id === verbandY);
  const punten = verbandPunten(
    gefilterd,
    focusIds,
    (l) => getalWaarde(kenmerkWaarde(l.organisatie, xVeld.id.split("."))),
    (l) => (yIndex === -1 ? l.overall : l.scores[yIndex])
  );
  const yLabel = yIndex === -1 ? "Overall score" : pool.rijen[yIndex].bouwblok.naam;
  // Zonder groepering is Grootste verschil uitgeschakeld: Er is geen rest om mee te vergelijken.
  const grootsteVerschilKan = !(weergave === "groep" && zonderGroepering);
  const sorteringNu: Sortering = sortering === "uitslag" && !grootsteVerschilKan ? "model" : sortering;

  const voegToe = (id: string) => {
    if (kenmerken.includes(id)) return;
    setKenmerken([...kenmerken, id]);
    // Het eerste bruikbare kenmerk dat de Admin toevoegt, wordt automatisch de groepering. Een kenmerk dat niet kan, wist een
    // oude (vervallen) keuze zodat de melding niet blijft staan.
    const veld = velden.find((v) => v.id === id);
    if (effectief === null && id !== KANALEN_ID && veld && kanGroeperen(veld, pool.leden, gefilterd, drempels).ok) {
      setGekozenOp(id);
      setDrempel(null);
      setFocusKeuze(undefined);
    } else if (effectief === null) {
      setGekozenOp(null);
    }
  };
  const verwijder = (id: string) => {
    setKenmerken(kenmerken.filter((k) => k !== id));
    // Het kruisje haalt ook het filter weg.
    const select = { ...filters.select };
    delete select[id];
    const bereik = { ...filters.bereik };
    delete bereik[id];
    setFilters({ ...filters, select, bereik, kanalen: id === KANALEN_ID ? [] : filters.kanalen });
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
            setFilters(LEGE_FILTERS);
            setKenmerken([]);
            setGekozenOp(null);
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

      <KenmerkenKaart
        velden={alleVelden}
        kenmerken={kenmerken}
        stand={filters}
        onStand={setFilters}
        onToevoegen={voegToe}
        onVerwijder={verwijder}
        pool={pool.leden}
        gefilterd={gefilterd}
        zonderToestemming={pool.zonderToestemming}
      />

      <Vergelijken
        opties={groeperOpties}
        heeftKenmerken={kenmerken.length > 0}
        effectief={effectief}
        onKies={(id) => {
          setGekozenOp(id);
          setDrempel(null);
          setFocusKeuze(undefined);
        }}
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
          <WeergaveVerband minPunten={instellingen.verkennenMinGroep} punten={punten} xLabel={korte(xVeld.id, xVeld.label)} yLabel={yLabel} eenheidX={xDef?.eenheid} />
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
          />
        )}
      </section>
    </div>
  );
}
