"use client";

import { useEffect, useMemo, useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { brengScansSamen, SamenbrengResultaat, verwijderMeting } from "@/lib/db";
import { RespondentKeuze, controleerSamenbrengen, lidNaam } from "@/lib/samenbrengen";
import {
  STANDAARD_ONDERDEEL,
  dubbeleCombinatieTekst,
  isGeldigeDatum,
  isSamengesteld,
  metingMetCombinatie,
  oudsteEerst,
  meetdatumVan,
  stelOnderdeelVoor,
} from "@/lib/metingen";
import { SlotType, useBewerkslot } from "@/lib/bewerkslot";
import { Organisatie } from "@/lib/types";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { RespondentFunctieKeuze } from "@/components/RespondentFunctieKeuze";
import {
  OnderdeelMeetdatumVelden,
  onderdeelFout,
  onderdeelNaamVoorOpslaan,
  OnderdeelMeetdatumWaarde,
  beginWaarde,
} from "@/components/beheer/OnderdeelMeetdatumVelden";

const NIEUWE_METING = "__nieuw__";
const HOUDEN = "__houden__";
const NIEUWE_RESPONDENT = "__nieuweRespondent__";

type SlotStatus = "controleren" | "eigen" | "bezet";

/** Houdt één Bewerkslot vast zolang de modal openstaat en meldt de stand aan de modal (`datamodel.md`, Bewerkslot). */
function SlotHouder({
  type,
  id,
  onStatus,
}: {
  type: SlotType;
  id: string;
  onStatus: (sleutel: string, status: SlotStatus, houderNaam: string | null) => void;
}) {
  const { status, houderNaam } = useBewerkslot(type, id);
  useEffect(() => {
    onStatus(`${type}:${id}`, status, houderNaam);
  }, [type, id, status, houderNaam, onStatus]);
  return null;
}

interface RegelState {
  keuze: string; // HOUDEN, NIEUWE_RESPONDENT of een respondentId
  naam: string;
  email: string;
  functie: string;
  team: string;
}

/**
 * "Scans samenbrengen in één Meting" (`beheerpagina.md`, punt 6b): Eén modal met bovenaan de doel-Meting en daaronder één
 * regel per scan, met de Respondent die in de doel-Meting bij de scan hoort. De knop "Samenbrengen" is pas actief als elke
 * Respondent hoogstens één scan in de doel-Meting heeft. Een botsing staat als rode melding in de regel zelf. De app haalt de
 * Respondent niet uit de notitie: De beheerder leest de notitie en kiest.
 */
export function ScansSamenbrengenModal({
  organisatie,
  invullingIds,
  onSluit,
  onKlaar,
}: {
  organisatie: Organisatie;
  invullingIds: string[];
  onSluit: () => void;
  onKlaar: (resultaat: Extract<SamenbrengResultaat, { ok: true }>) => void;
}) {
  const assessments = useAssessments();

  // De scans van de selectie, in de volgorde van de selectie.
  const scans = useMemo(
    () =>
      invullingIds.flatMap((id) => {
        for (const meting of organisatie.scanUitvoeringen) {
          const invulling = meting.invullingen.find((i) => i.id === id);
          if (invulling) {
            return [{ invulling, meting, lid: organisatie.leden.find((l) => l.id === invulling.organisatieLidId) }];
          }
        }
        return [];
      }),
    [invullingIds, organisatie]
  );
  const assessmentId = scans[0]?.meting.assessmentId ?? "";
  const assessmentNaam = assessments.find((a) => a.id === assessmentId)?.naam ?? "";

  /* ---------- Bewerkslot ---------- */
  const [sloten, setSloten] = useState<Record<string, { status: SlotStatus; houderNaam: string | null }>>({});
  const onStatus = useMemo(
    () => (sleutel: string, status: SlotStatus, houderNaam: string | null) =>
      setSloten((vorig) => (vorig[sleutel]?.status === status ? vorig : { ...vorig, [sleutel]: { status, houderNaam } })),
    []
  );
  const respondentIds = [...new Set(scans.map((s) => s.invulling.organisatieLidId))];
  const slotLijst = [
    ...scans.map((s) => ({ type: "scan" as const, id: s.invulling.id })),
    ...respondentIds.map((id) => ({ type: "respondent" as const, id })),
  ];
  const bezet = Object.values(sloten).find((s) => s.status === "bezet");
  const controleren = slotLijst.some((s) => (sloten[`${s.type}:${s.id}`]?.status ?? "controleren") === "controleren");

  /* ---------- Doel ---------- */
  const doelMetingen = organisatie.scanUitvoeringen.filter((m) => m.assessmentId === assessmentId && !isSamengesteld(m));
  const [doelKeuze, setDoelKeuze] = useState<string>(NIEUWE_METING);
  // Het onderdeel van de nieuwe Meting: Voorgesteld uit het oude label van de eerste scan, nooit blind "Hele organisatie". De
  // meetdatum is voorgevuld met de oudste meetdatum van de Metingen waaruit de scans komen (`beheerpagina.md`, punt 6b).
  const [nieuw, setNieuw] = useState<OnderdeelMeetdatumWaarde | null>(null); // `null`: De beginwaarde
  const voorstelOnderdeel = scans[0] ? stelOnderdeelVoor(scans[0].meting) : STANDAARD_ONDERDEEL;
  const voorstelDatum = oudsteEerst(scans.map((s) => s.meting)).map(meetdatumVan).find((d) => d !== null) ?? "";
  const waarde = nieuw ?? beginWaarde(voorstelOnderdeel, voorstelDatum);
  const nieuweMeting = doelKeuze === NIEUWE_METING;

  /* ---------- Regels ---------- */
  const [regels, setRegels] = useState<Record<string, RegelState>>({});
  const regelVan = (id: string): RegelState => regels[id] ?? { keuze: HOUDEN, naam: "", email: "", functie: "", team: "" };
  function zetRegel(id: string, patch: Partial<RegelState>) {
    setRegels((v) => ({ ...v, [id]: { ...regelVan(id), ...patch } }));
  }
  const keuzeVan = (id: string): RespondentKeuze => {
    const r = regelVan(id);
    if (r.keuze === HOUDEN) return { soort: "houden" };
    if (r.keuze === NIEUWE_RESPONDENT) return { soort: "nieuw", naam: r.naam, email: r.email, functie: r.functie, team: r.team };
    return { soort: "bestaand", respondentId: r.keuze };
  };

  // Bestaat de combinatie van onderdeel, Assessment en meetdatum al, dan is dat een waarschuwing met de Meting die er is:
  // De beheerder kiest die Meting hierboven, of gaat toch door (`datamodel.md`, Uniek).
  const onderdeelNaam = onderdeelNaamVoorOpslaan(organisatie, waarde);
  const botsendeMeting = nieuweMeting ? metingMetCombinatie(organisatie, onderdeelNaam, assessmentId, waarde.meetdatum) : undefined;

  const fouten = useMemo(
    () =>
      controleerSamenbrengen(
        organisatie,
        scans.map((s) => ({ invullingId: s.invulling.id, metingId: s.meting.id, lidId: s.invulling.organisatieLidId })),
        scans.map((s) => ({ invullingId: s.invulling.id, respondent: keuzeVan(s.invulling.id) })),
        nieuweMeting ? null : doelKeuze
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [organisatie, scans, regels, doelKeuze, nieuweMeting]
  );

  const doelGeldig = nieuweMeting ? isGeldigeDatum(waarde.meetdatum) && onderdeelFout(organisatie, waarde) === null : doelMetingen.some((m) => m.id === doelKeuze);
  const kanOpslaan = scans.length > 0 && doelGeldig && Object.keys(fouten).length === 0 && !bezet && !controleren;

  const [fout, setFout] = useState<string | null>(null);
  const [klaar, setKlaar] = useState<Extract<SamenbrengResultaat, { ok: true }> | null>(null);
  const [legeVerwijderenOpen, setLegeVerwijderenOpen] = useState(false);
  const [legeGeruimd, setLegeGeruimd] = useState(false);

  function opslaan() {
    setFout(null);
    const uitkomst = brengScansSamen(
      organisatie.id,
      nieuweMeting
        ? { soort: "nieuw", onderdeel: onderdeelNaam, meetdatum: waarde.meetdatum }
        : { soort: "bestaand", metingId: doelKeuze },
      scans.map((s) => ({ invullingId: s.invulling.id, respondent: keuzeVan(s.invulling.id) }))
    );
    if (!uitkomst.ok) return setFout(uitkomst.reden);
    setKlaar(uitkomst);
    onKlaar(uitkomst);
  }

  function ruimLegeOp() {
    for (const m of klaar?.legeMetingen ?? []) verwijderMeting(m.id);
    setLegeVerwijderenOpen(false);
    setLegeGeruimd(true);
  }

  /* ---------- Weergave ---------- */
  const slotHouders = slotLijst.map((s) => <SlotHouder key={`${s.type}:${s.id}`} type={s.type} id={s.id} onStatus={onStatus} />);

  if (klaar) {
    return (
      <OverzichtModal label="Scans samengebracht" onSluit={onSluit} escUitgeschakeld={legeVerwijderenOpen}>
        <h2 className="mb-3 text-lg font-bold text-ink">Scans samengebracht</h2>
        <p className="overzicht-melding">
          {klaar.aantal} {klaar.aantal === 1 ? "scan" : "scans"} samengebracht in Meting &quot;{klaar.doelLabel}&quot;.
        </p>
        {klaar.legeMetingen.length > 0 && !legeGeruimd && (
          <>
            <p className="text-sm text-ink-m">
              {klaar.legeMetingen.length} {klaar.legeMetingen.length === 1 ? "Meting is" : "Metingen zijn"} nu leeg en{" "}
              {klaar.legeMetingen.length === 1 ? "blijft" : "blijven"} staan.
            </p>
            <div className="btn-rij" style={{ marginTop: "0.8rem" }}>
              <button type="button" className="btn btn-outline btn-compact" onClick={() => setLegeVerwijderenOpen(true)}>
                Lege Metingen verwijderen
              </button>
            </div>
          </>
        )}
        {legeGeruimd && <p className="overzicht-melding">De lege Metingen zijn verwijderd.</p>}
        <div className="btn-rij" style={{ marginTop: "1.2rem" }}>
          <button type="button" className="btn btn-or" onClick={onSluit}>
            Sluiten
          </button>
        </div>
        <BevestigModal
          open={legeVerwijderenOpen}
          titel="Lege Metingen verwijderen"
          bericht={`${klaar.legeMetingen.length} lege ${klaar.legeMetingen.length === 1 ? "Meting" : "Metingen"} verwijderen (${klaar.legeMetingen
            .map((m) => m.label)
            .join(", ")})? Er staan geen scans meer in. Dit kan niet ongedaan gemaakt worden.`}
          bevestigLabel="Verwijderen"
          onBevestigen={ruimLegeOp}
          onAnnuleren={() => setLegeVerwijderenOpen(false)}
        />
      </OverzichtModal>
    );
  }

  return (
    <OverzichtModal label="Scans samenbrengen in één Meting" onSluit={onSluit}>
      {slotHouders}
      <h2 className="mb-3 text-lg font-bold text-ink">Scans samenbrengen in één Meting</h2>
      <p className="text-sm text-ink-m mb-3">
        {scans.length} {scans.length === 1 ? "scan" : "scans"} van {organisatie.naam}, Assessment {assessmentNaam}. Kies de
        Meting en koppel per scan de Respondent. Antwoorden en organisatie blijven ongewijzigd, en alles wordt in één keer
        opgeslagen.
      </p>

      {bezet && (
        <p className="overzicht-melding fout">
          {bezet.houderNaam ? `${bezet.houderNaam} bewerkt` : "Iemand anders bewerkt"} een van deze scans of Respondenten op dit
          moment. Er kan maar één persoon tegelijk bewerken. Probeer het zo opnieuw.
        </p>
      )}

      <section className="overzicht-blok">
        <div className="overzicht-blok-kop">
          <h3>Doel-Meting</h3>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="admin-field" style={{ marginBottom: 0, minWidth: "16rem" }}>
            <label>Meting</label>
            <select value={doelKeuze} onChange={(e) => setDoelKeuze(e.target.value)}>
              <option value={NIEUWE_METING}>Nieuwe Meting</option>
              {doelMetingen.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {nieuweMeting && (
          <div style={{ marginTop: "0.7rem" }}>
            <OnderdeelMeetdatumVelden organisatie={organisatie} waarde={waarde} onChange={setNieuw} idPrefix="samenbrengen" />
          </div>
        )}
        {botsendeMeting && (
          <p className="overzicht-melding">
            {dubbeleCombinatieTekst(botsendeMeting.label)} Kies die Meting hierboven, of ga door met een nieuwe Meting.
          </p>
        )}
      </section>

      <section className="overzicht-blok">
        <div className="overzicht-blok-kop">
          <h3>Scans en Respondenten</h3>
        </div>
        {scans.length === 0 && <p className="admin-notice">De geselecteerde Metingen bevatten nog geen scans.</p>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Huidige Meting</th>
              <th>Notitie</th>
              <th>Huidige Respondent</th>
              <th>Respondent in de doel-Meting</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((s, i) => {
              const r = regelVan(s.invulling.id);
              const melding = fouten[s.invulling.id];
              return (
                <tr key={s.invulling.id} style={{ verticalAlign: "top" }}>
                  <td>{i + 1}</td>
                  <td>{s.meting.label}</td>
                  <td style={{ maxWidth: "14rem", whiteSpace: "pre-wrap" }}>{s.invulling.notitie ?? ""}</td>
                  <td>{lidNaam(s.lid)}</td>
                  <td style={{ minWidth: "14rem" }}>
                    <select
                      className="veld-compact"
                      style={{ width: "100%" }}
                      aria-label={`Respondent voor regel ${i + 1}`}
                      value={r.keuze}
                      onChange={(e) => zetRegel(s.invulling.id, { keuze: e.target.value })}
                    >
                      <option value={HOUDEN}>Dezelfde Respondent houden</option>
                      <option value={NIEUWE_RESPONDENT}>Nieuwe Respondent</option>
                      {organisatie.leden
                        .filter((l) => l.id !== s.invulling.organisatieLidId)
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {lidNaam(l)}
                          </option>
                        ))}
                    </select>
                    {r.keuze === NIEUWE_RESPONDENT && (
                      <div className="flex flex-col gap-2" style={{ marginTop: "0.5rem" }}>
                        <input
                          type="text"
                          className="veld-compact"
                          placeholder="Naam"
                          aria-label={`Naam voor regel ${i + 1}`}
                          value={r.naam}
                          onChange={(e) => zetRegel(s.invulling.id, { naam: e.target.value })}
                        />
                        <input
                          type="email"
                          className="veld-compact"
                          placeholder="E-mailadres (verplicht, een tijdelijk adres mag)"
                          aria-label={`E-mailadres voor regel ${i + 1}`}
                          value={r.email}
                          onChange={(e) => zetRegel(s.invulling.id, { email: e.target.value })}
                        />
                        <RespondentFunctieKeuze
                          variant="compact"
                          waarde={r.functie}
                          onChange={(functie) => zetRegel(s.invulling.id, { functie })}
                        />
                        <input
                          type="text"
                          className="veld-compact"
                          placeholder="Team"
                          aria-label={`Team voor regel ${i + 1}`}
                          value={r.team}
                          onChange={(e) => zetRegel(s.invulling.id, { team: e.target.value })}
                        />
                      </div>
                    )}
                    {melding && (
                      <p className="text-sm" style={{ color: "var(--stat-red)", margin: "0.4rem 0 0" }} role="alert">
                        {melding}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {fout && <p className="overzicht-melding fout">{fout}</p>}
      <div className="btn-rij" style={{ marginTop: "1.2rem" }}>
        <button type="button" className="btn btn-outline" onClick={onSluit}>
          Annuleren
        </button>
        <button type="button" className="btn btn-or" disabled={!kanOpslaan} onClick={opslaan}>
          Samenbrengen
        </button>
      </div>
    </OverzichtModal>
  );
}
