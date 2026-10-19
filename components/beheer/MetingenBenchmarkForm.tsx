"use client";

import { useMemo, useState } from "react";
import { Assessment, Benchmark, BenchmarkLezing, BenchmarkLid, Organisatie } from "@/lib/types";
import {
  assessmentsVoorMetingenBenchmark,
  dagenTussenMeetdata,
  dubbelTellendeMetingen,
  gelijkeMeetdata,
  LEZING_KEUZE,
  lezingVan,
  metingenVoorVergelijking,
  MIN_METINGEN_PER_ASSESSMENT,
  organisatiesVoorMetingenBenchmark,
  redenOntwikkeling,
  voorstelLezing,
} from "@/lib/benchmark";
import { onderdeelVan, toonMeetdatum } from "@/lib/metingen";
import { InfoIcoon } from "@/components/InfoIcoon";

const scansTekst = (n: number) => `${n} ${n === 1 ? "afgeronde scan" : "afgeronde scans"}`;

/** De eerste versie vergelijkt precies twee Metingen (`benchmark.md`, Niveau 2, Samenstellen). */
const AANTAL_METINGEN = 2;

/**
 * Samenstellen of wijzigen van een vergelijking tussen Metingen, een benchmark binnen een organisatie (`benchmark.md`,
 * Niveau 2; `beheerpagina.md`, punt 14): Eén organisatie, één Assessment en precies twee Metingen. Er geldt geen vlag
 * `benchmarkToegestaan`, want de gegevens verlaten de organisatie niet. Een Meting heeft een meetdatum en minimaal
 * `benchmarkMinScans` afgeronde scans, ook een samengestelde Meting mag meedoen. Het onderdeel mag verschillen. Doen een
 * samengestelde Meting en een van haar onderliggende Metingen allebei mee, dan staat er een waarschuwing.
 *
 * De schakelaar "Lees als" (`Benchmark.lezing`, `benchmark.md`, Niveau 2, Lezing) bepaalt wat samen mag: Bij Ontwikkeling over
 * tijd staan Metingen met een ander onderdeel uitgeschakeld en kan Opslaan niet bij gelijke meetdata, bij Naast elkaar staat er
 * een waarschuwing als de meetdata meer dan `maxDagen` dagen uit elkaar liggen. De app stelt een lezing voor zolang de Admin de
 * schakelaar niet zelf heeft aangeraakt.
 */
export interface MetingenBenchmarkWaarden {
  naam: string;
  lezing: BenchmarkLezing;
  assessmentIds: string[];
  leden: BenchmarkLid[];
}

export function MetingenBenchmarkForm({
  organisaties,
  assessments,
  minScans,
  maxDagen,
  begin,
  bevestigLabel,
  onOpslaan,
}: {
  organisaties: Organisatie[];
  assessments: Assessment[];
  minScans: number;
  /** `benchmarkMaxDagenTussenMetingen`: Daarboven staat bij Naast elkaar een waarschuwing. */
  maxDagen: number;
  begin?: Benchmark;
  bevestigLabel: string;
  onOpslaan: (waarden: MetingenBenchmarkWaarden) => void;
}) {
  // Een benchmark uit de tijd van de groepsgemiddelden kan meer Assessments of Metingen hebben. Wijzigen maakt er een
  // vergelijking van twee Metingen van: Het eerste Assessment en de oudste twee Metingen staan voorgekozen.
  const beginLeden = useMemo(() => {
    if (!begin) return [];
    const eerste = begin.leden[0]?.assessmentId;
    return begin.leden.filter((l) => l.assessmentId === eerste).slice(0, AANTAL_METINGEN);
  }, [begin]);
  const afwijkendeVorm = Boolean(begin) && (begin!.assessmentIds.length > 1 || begin!.leden.length !== AANTAL_METINGEN);

  const [naam, setNaam] = useState(begin?.naam ?? "");
  const [organisatieId, setOrganisatieId] = useState(begin?.leden[0]?.organisatieId ?? "");
  const [assessmentId, setAssessmentId] = useState(beginLeden[0]?.assessmentId ?? "");
  const [gekozen, setGekozen] = useState<string[]>(beginLeden.map((l) => l.metingId));
  // Een bestaande benchmark heeft al een lezing (of volgt uit haar leden): Die blijft staan tot de Admin zelf wisselt.
  const [lezingKeuze, setLezingKeuze] = useState<BenchmarkLezing>(begin ? lezingVan(begin, organisaties) : "naastElkaar");
  const [lezingAangeraakt, setLezingAangeraakt] = useState(Boolean(begin));

  const organisatieLijst = useMemo(() => {
    const lijst = organisatiesVoorMetingenBenchmark(organisaties, minScans);
    const huidig = begin ? organisaties.find((o) => o.id === begin.leden[0]?.organisatieId) : undefined;
    if (huidig && !lijst.some((o) => o.id === huidig.id)) lijst.push(huidig);
    return lijst.sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
  }, [organisaties, minScans, begin]);
  const organisatie = organisaties.find((o) => o.id === organisatieId);

  // De Assessments van deze organisatie met genoeg bruikbare Metingen. Bij wijzigen blijft het huidige Assessment zichtbaar.
  const assessmentLijst = useMemo(() => {
    if (!organisatie) return [];
    const ids = assessmentsVoorMetingenBenchmark(organisatie, minScans)
      .map((p) => p.assessmentId)
      // Alleen de Assessments die in de lijst staan: Een Assessment met Ja / Nee / Weet ik niet is er niet voor uitgewerkt.
      .filter((id) => assessments.some((a) => a.id === id));
    if (assessmentId && !ids.includes(assessmentId)) ids.push(assessmentId);
    return ids;
  }, [organisatie, minScans, assessmentId, assessments]);

  const metingen = useMemo(
    () => (organisatie && assessmentId ? metingenVoorVergelijking(organisatie, assessmentId, minScans) : []),
    [organisatie, assessmentId, minScans]
  );
  const dubbel = organisatie ? dubbelTellendeMetingen(organisatie, gekozen) : [];

  // De gekozen Metingen in de volgorde van de keuze, voor het voorstel en de regels van de lezing.
  const gekozenMetingen = gekozen
    .map((id) => organisatie?.scanUitvoeringen.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);
  const lezing: BenchmarkLezing = lezingAangeraakt ? lezingKeuze : voorstelLezing(gekozenMetingen);
  const ontwikkeling = lezing === "ontwikkeling";
  const dagen = dagenTussenMeetdata(gekozenMetingen);
  // Bij Ontwikkeling over tijd hoort alles bij het onderdeel van de eerst gekozen Meting.
  const andereOnderdelen =
    ontwikkeling && organisatie !== undefined && gekozenMetingen.some((m) => redenOntwikkeling(organisatie, m, gekozenMetingen.slice(0, 1)) !== null);
  const gelijkeDatums = ontwikkeling && gelijkeMeetdata(gekozenMetingen);

  function kiesOrganisatie(id: string) {
    setOrganisatieId(id);
    setAssessmentId("");
    setGekozen([]);
  }

  function kiesAssessment(id: string) {
    setAssessmentId(id);
    setGekozen([]);
  }

  function wisselMeting(metingId: string) {
    setGekozen((huidig) => (huidig.includes(metingId) ? huidig.filter((m) => m !== metingId) : [...huidig, metingId]));
  }

  const kanOpslaan =
    naam.trim() !== "" &&
    organisatieId !== "" &&
    assessmentId !== "" &&
    gekozen.length === AANTAL_METINGEN &&
    !andereOnderdelen &&
    !gelijkeDatums;

  function handleOpslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!kanOpslaan) return;
    onOpslaan({
      naam: naam.trim(),
      lezing,
      assessmentIds: [assessmentId],
      leden: gekozen.map((metingId) => ({ organisatieId, assessmentId, metingId })),
    });
  }

  return (
    <form onSubmit={handleOpslaan}>
      <div className="admin-field" style={{ maxWidth: "28rem" }}>
        <label htmlFor="benchmark-naam">Naam</label>
        <input id="benchmark-naam" type="text" value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Bijv. Team A, okt 2026 naast apr 2027" />
      </div>

      <h2>1. Organisatie</h2>
      {organisatieLijst.length === 0 ? (
        <p className="admin-notice">
          Er is geen organisatie met minstens {MIN_METINGEN_PER_ASSESSMENT} Metingen van hetzelfde Assessment met een meetdatum en elk
          minstens {minScans} afgeronde scans.
        </p>
      ) : (
        <div className="admin-field" style={{ maxWidth: "28rem" }}>
          <select aria-label="Organisatie" value={organisatieId} onChange={(e) => kiesOrganisatie(e.target.value)} disabled={Boolean(begin)}>
            <option value="">Kies een organisatie</option>
            {organisatieLijst.map((o) => (
              <option key={o.id} value={o.id}>
                {o.naam}
              </option>
            ))}
          </select>
        </div>
      )}

      {organisatie && (
        <>
          <h2>2. Assessment</h2>
          {assessmentLijst.length === 0 ? (
            <p className="admin-notice">
              Deze organisatie heeft geen Assessment met {MIN_METINGEN_PER_ASSESSMENT} Metingen met een meetdatum en minstens {minScans}{" "}
              afgeronde scans.
            </p>
          ) : (
            <div className="admin-field" style={{ maxWidth: "28rem" }}>
              <select aria-label="Assessment" value={assessmentId} onChange={(e) => kiesAssessment(e.target.value)}>
                <option value="">Kies een Assessment</option>
                {assessmentLijst.map((id) => (
                  <option key={id} value={id}>
                    {assessments.find((a) => a.id === id)?.naam ?? "Onbekend Assessment"}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {organisatie && assessmentId && (
        <>
          <h2>3. Metingen (kies er {AANTAL_METINGEN})</h2>
          {afwijkendeVorm && (
            <p className="admin-notice">
              Deze benchmark is gemaakt met meer Metingen of Assessments. Een vergelijking heeft nu precies {AANTAL_METINGEN} Metingen
              van één Assessment: Opslaan vervangt de samenstelling.
            </p>
          )}
          <div className="benchmark-metingen">
            {metingen.map((m) => {
              const gekozenNu = gekozen.includes(m.meting.id);
              const vol = gekozen.length >= AANTAL_METINGEN && !gekozenNu;
              // Bij wijzigen blijft een huidig lid kiesbaar, ook als zijn Meting inmiddels onder het minimum zakte.
              const nee =
                !gekozenNu && (m.reden ?? (ontwikkeling && organisatie ? redenOntwikkeling(organisatie, m.meting, gekozenMetingen) : null));
              return (
                <label key={m.meting.id} className="benchmark-keuze" style={{ fontWeight: 400, opacity: nee || vol ? 0.6 : 1 }}>
                  <input type="checkbox" checked={gekozenNu} disabled={Boolean(nee) || vol} onChange={() => wisselMeting(m.meting.id)} />
                  {m.meting.label} · {organisatie ? onderdeelVan(organisatie, m.meting) : ""} · {toonMeetdatum(m.meting.meetdatum)} · {scansTekst(m.aantalAfgerond)}
                  {nee && <span className="text-ink-s"> · {nee}</span>}
                </label>
              );
            })}
          </div>
          <p className="text-sm text-ink-m" style={{ marginTop: "0.6rem" }}>
            {gekozen.length} van {AANTAL_METINGEN} Metingen gekozen. De volgorde in de vergelijking volgt{" "}
            {ontwikkeling ? "de meetdatum, de oudste eerst" : "de naam van de Meting"}.
          </p>

          <h2>4. Lees als</h2>
          <div role="radiogroup" aria-label="Lees als" className="benchmark-metingen">
            {(["ontwikkeling", "naastElkaar"] as const).map((k) => (
              <label key={k} className="benchmark-keuze" style={{ fontWeight: 400, alignItems: "flex-start" }}>
                <input
                  type="radio"
                  name="lezing"
                  style={{ marginTop: "0.25rem" }}
                  checked={lezing === k}
                  onChange={() => {
                    setLezingKeuze(k);
                    setLezingAangeraakt(true);
                  }}
                />
                <span>
                  <strong>{LEZING_KEUZE[k].titel}</strong>
                  <br />
                  <span className="text-sm text-ink-m">{LEZING_KEUZE[k].uitleg}</span>
                </span>
              </label>
            ))}
          </div>
          {!lezingAangeraakt && gekozen.length >= AANTAL_METINGEN && (
            <p className="text-sm text-ink-m" style={{ marginTop: "0.4rem" }}>
              Voorgesteld op basis van de gekozen Metingen. Je kunt zelf een andere lezing kiezen.
            </p>
          )}
          {andereOnderdelen && (
            <p className="overzicht-melding fout">
              Bij Ontwikkeling over tijd hebben de Metingen hetzelfde onderdeel. Kies Metingen met één onderdeel, of lees als Naast
              elkaar.
            </p>
          )}
          {gelijkeDatums && (
            <p className="overzicht-melding fout">
              Metingen met dezelfde meetdatum hebben geen volgorde. Kies Metingen met een andere meetdatum, of lees als Naast elkaar.
            </p>
          )}
          {!ontwikkeling && dagen !== null && dagen > maxDagen && (
            <p className="overzicht-melding">
              Deze Metingen liggen meer dan {maxDagen} dagen uit elkaar. Is dit een vergelijkbaar meetmoment? Opslaan kan.
            </p>
          )}
          {dubbel.length > 0 && (
            <p className="overzicht-melding">
              &ldquo;{dubbel[0].label}&rdquo; is een gemiddelde van een Meting die ook meedoet: Dezelfde scans tellen dan twee keer
              mee in de vergelijking. Opslaan kan.
            </p>
          )}
        </>
      )}

      <div className="btn-rij" style={{ marginTop: "1.5rem", maxWidth: "22rem" }}>
        <button type="submit" className="btn btn-or btn-compact" disabled={!kanOpslaan}>
          {bevestigLabel}
        </button>
        {!kanOpslaan && <InfoIcoon naastVeld sleutel="info.benchmarkAanmakenMetingen" />}
      </div>
    </form>
  );
}
