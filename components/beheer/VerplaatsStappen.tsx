"use client";

import { openConflict } from "@/components/beheer/ConflictHost";
import { useMemo, useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import {
  VerplaatsMetingKeuze,
  VerplaatsRespondentResultaat,
  verplaatsResponsNaarMeting,
  verplaatsResponsNaarOrganisatie,
  verplaatsResponsenNaarMeting,
  verplaatsRespondentNaarOrganisatie,
  voorstelDoelMeting,
} from "@/lib/db";
import { Organisatie, OrganisatieLid, ScanUitvoering } from "@/lib/types";

/**
 * Vervolgstappen in het Respondent- en Scan-overzicht (beheerpagina.md
 * punt 6b, `stylesheet.md`, Vervolgstappen): de actie vervangt de inhoud
 * van dezelfde modal door een korte stap met "← Terug", de keuzes en
 * Annuleren/Bevestigen. Geen tweede modal bovenop de eerste.
 */

export interface ScanVerplaatsResultaat {
  verplaatst: number;
  /** `conflict` is gezet als de reden is dat de Respondent in de doel-Meting al een scan heeft ("Conflict oplossen"). */
  overgeslagen: { scanInvullingId: string; reden: string; conflict?: { doelMetingId: string } }[];
  doelLabel: string;
}

function StapKader({ titel, onTerug, children }: { titel: string; onTerug: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button type="button" className="overzicht-stap-terug" onClick={onTerug}>
        ← Terug
      </button>
      <h2 className="mb-3 text-lg font-bold text-ink">{titel}</h2>
      {children}
    </div>
  );
}

const NIEUW = "nieuw";

/** Keuzelijst "bestaande Meting of nieuwe Meting" met een label-veld voor de nieuwe. */
function MetingKeuze({
  metingen,
  waarde,
  onWaarde,
  label,
  onLabel,
  assessmentNamen,
}: {
  metingen: ScanUitvoering[];
  waarde: string;
  onWaarde: (waarde: string) => void;
  label: string;
  onLabel: (label: string) => void;
  assessmentNamen?: Record<string, string>;
}) {
  return (
    <div className="admin-field" style={{ marginBottom: 0 }}>
      <select value={waarde} onChange={(e) => onWaarde(e.target.value)}>
        {metingen.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
            {assessmentNamen ? ` — ${assessmentNamen[s.assessmentId] ?? "Onbekend type"}` : ""}
          </option>
        ))}
        <option value={NIEUW}>Nieuwe Meting met dit label</option>
      </select>
      {waarde === NIEUW && (
        <input
          type="text"
          value={label}
          onChange={(e) => onLabel(e.target.value)}
          placeholder="Label van de nieuwe Meting"
          style={{ marginTop: "0.4rem" }}
        />
      )}
    </div>
  );
}

/**
 * "Respons naar andere Meting verplaatsen" (beheerpagina.md punt 6b): één
 * scan, of meerdere vanuit de organisatie-gefilterde lijst Ingevulde scans.
 * Doel: een Meting van dezelfde organisatie met hetzelfde Assessment-type,
 * of een nieuwe.
 */
export function NaarAndereMetingStap({
  organisatie,
  invullingIds,
  onTerug,
  onKlaar,
}: {
  organisatie: Organisatie;
  invullingIds: string[];
  onTerug: () => void;
  onKlaar: (resultaat: ScanVerplaatsResultaat) => void;
}) {
  const bronMeting = organisatie.scanUitvoeringen.find((s) => s.invullingen.some((i) => i.id === invullingIds[0]));
  const opties = useMemo(
    () =>
      organisatie.scanUitvoeringen.filter(
        (s) => s.assessmentId === bronMeting?.assessmentId && !(invullingIds.length === 1 && s.id === bronMeting?.id)
      ),
    [organisatie, bronMeting, invullingIds.length]
  );
  const [keuze, setKeuze] = useState(opties[0]?.id ?? NIEUW);
  const [label, setLabel] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{ doelMetingId: string } | null>(null);

  function bevestig() {
    setConflict(null);
    const doelId = keuze === NIEUW ? null : keuze;
    const doelLabel = doelId ? (opties.find((s) => s.id === doelId)?.label ?? "") : label.trim();
    if (!doelId && !label.trim()) {
      setFout("Geef de nieuwe Meting een label.");
      return;
    }
    if (invullingIds.length === 1) {
      const r = verplaatsResponsNaarMeting(invullingIds[0], doelId, label);
      if (!r.ok) {
        setFout(r.reden ?? "Verplaatsen is niet gelukt.");
        setConflict(r.conflict ?? null);
        return;
      }
      onKlaar({ verplaatst: 1, overgeslagen: [], doelLabel });
      return;
    }
    const r = verplaatsResponsenNaarMeting(invullingIds, doelId, label);
    onKlaar({ verplaatst: r.verplaatst, overgeslagen: r.overgeslagen, doelLabel });
  }

  return (
    <StapKader
      titel={invullingIds.length === 1 ? "Scan naar andere Meting" : `${invullingIds.length} scans naar andere Meting`}
      onTerug={onTerug}
    >
      <p className="text-sm text-ink-m mb-3">
        Kies een Meting van deze organisatie met hetzelfde Assessment-type, of maak een nieuwe aan. De
        Respondent en de antwoorden blijven ongewijzigd.
      </p>
      <MetingKeuze metingen={opties} waarde={keuze} onWaarde={setKeuze} label={label} onLabel={setLabel} />
      {fout && <p className="overzicht-melding fout">{fout}</p>}
      {conflict && (
        <div className="knoppenrij" style={{ marginTop: "0.6rem" }}>
          <button
            type="button"
            className="btn btn-outline btn-compact"
            onClick={() => openConflict({ organisatieId: organisatie.id, scanId: invullingIds[0], doelMetingId: conflict.doelMetingId })}
          >
            Conflict oplossen
          </button>
        </div>
      )}
      <div className="btn-rij" style={{ marginTop: "1.2rem" }}>
        <button type="button" className="btn btn-outline" onClick={onTerug}>
          Annuleren
        </button>
        <button type="button" className="btn btn-or" onClick={bevestig}>
          Verplaatsen
        </button>
      </div>
    </StapKader>
  );
}

/** "Eén losse respons verplaatsen" naar een andere organisatie: de Respondent zelf blijft staan. */
export function NaarAndereOrganisatieStap({
  organisatie,
  invullingId,
  mogelijkeOrganisaties,
  onTerug,
  onKlaar,
}: {
  organisatie: Organisatie;
  invullingId: string;
  mogelijkeOrganisaties: Organisatie[];
  onTerug: () => void;
  onKlaar: (resultaat: ScanVerplaatsResultaat & { doelOrganisatieNaam: string }) => void;
}) {
  const kandidaten = mogelijkeOrganisaties.filter((o) => o.id !== organisatie.id);
  const bronMeting = organisatie.scanUitvoeringen.find((s) => s.invullingen.some((i) => i.id === invullingId));
  const [doelOrgId, setDoelOrgId] = useState(kandidaten[0]?.id ?? "");
  const doelOrg = kandidaten.find((o) => o.id === doelOrgId);
  const metingen = (doelOrg?.scanUitvoeringen ?? []).filter((s) => s.assessmentId === bronMeting?.assessmentId);
  const [keuzePerOrg, setKeuzePerOrg] = useState<Record<string, string>>({});
  const keuze = keuzePerOrg[doelOrgId] ?? metingen.find((s) => s.label === bronMeting?.label)?.id ?? NIEUW;
  const [label, setLabel] = useState(bronMeting?.label ?? "");
  const [fout, setFout] = useState<string | null>(null);

  function bevestig() {
    if (!doelOrg) return;
    const doelId = keuze === NIEUW ? null : keuze;
    if (!doelId && !label.trim()) {
      setFout("Geef de nieuwe Meting een label.");
      return;
    }
    const r = verplaatsResponsNaarOrganisatie(invullingId, doelOrg.id, doelId, label);
    if (!r.ok) {
      setFout(r.reden ?? "Verplaatsen is niet gelukt.");
      return;
    }
    onKlaar({
      verplaatst: 1,
      overgeslagen: [],
      doelLabel: doelId ? (metingen.find((s) => s.id === doelId)?.label ?? "") : label.trim(),
      doelOrganisatieNaam: doelOrg.naam,
    });
  }

  return (
    <StapKader titel="Scan naar andere organisatie" onTerug={onTerug}>
      <p className="text-sm text-ink-m mb-3">
        Alleen deze ene scan gaat naar de andere organisatie. De Respondent blijft in {organisatie.naam}. Bestaat
        daar al een Respondent met hetzelfde e-mailadres, dan wordt die gebruikt; anders ontstaat er een nieuwe
        met dezelfde gegevens.
      </p>
      {kandidaten.length === 0 ? (
        <p className="overzicht-melding fout">Er is geen andere organisatie waarnaar je kunt verplaatsen.</p>
      ) : (
        <>
          <div className="admin-field">
            <label>Doelorganisatie</label>
            <select value={doelOrgId} onChange={(e) => setDoelOrgId(e.target.value)}>
              {kandidaten.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.naam}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label>Meting in {doelOrg?.naam}</label>
            <MetingKeuze
              metingen={metingen}
              waarde={keuze}
              onWaarde={(w) => setKeuzePerOrg((prev) => ({ ...prev, [doelOrgId]: w }))}
              label={label}
              onLabel={setLabel}
            />
          </div>
        </>
      )}
      {fout && <p className="overzicht-melding fout">{fout}</p>}
      <div className="btn-rij" style={{ marginTop: "1.2rem" }}>
        <button type="button" className="btn btn-outline" onClick={onTerug}>
          Annuleren
        </button>
        <button type="button" className="btn btn-or" disabled={!doelOrg} onClick={bevestig}>
          Verplaatsen
        </button>
      </div>
    </StapKader>
  );
}

/**
 * "Hele respondent verplaatsen" (beheerpagina.md punt 6b): per Meting waar
 * de Respondent een scan in heeft een regel met het voorstel voor de
 * doel-Meting, aan te passen, en daarna één bevestiging. Bij een
 * e-mailconflict in de doelorganisatie legt de stap expliciet uit dat de
 * scans naar de bestaande Respondent gaan en deze Respondent (met zijn
 * link) verdwijnt.
 */
export function RespondentVerplaatsenStap({
  organisatie,
  lid,
  mogelijkeOrganisaties,
  onTerug,
  onKlaar,
}: {
  organisatie: Organisatie;
  lid: OrganisatieLid;
  mogelijkeOrganisaties: Organisatie[];
  onTerug: () => void;
  onKlaar: (resultaat: VerplaatsRespondentResultaat & { doelOrganisatieNaam: string }) => void;
}) {
  const assessments = useAssessments();
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";
  const kandidaten = mogelijkeOrganisaties.filter((o) => o.id !== organisatie.id);
  const bronMetingen = organisatie.scanUitvoeringen.filter((s) => s.invullingen.some((i) => i.organisatieLidId === lid.id));

  const [doelOrgId, setDoelOrgId] = useState(kandidaten[0]?.id ?? "");
  const doelOrg = kandidaten.find((o) => o.id === doelOrgId);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [fout, setFout] = useState<string | null>(null);

  const conflictLid = doelOrg?.leden.find((l) => l.email === lid.email) ?? null;

  const regels = bronMetingen.map((bron) => {
    const voorstel = doelOrg ? voorstelDoelMeting(bron, doelOrg) : null;
    const keuze = overrides[`${doelOrgId}::${bron.id}`] ?? voorstel?.id ?? NIEUW;
    const opties = (doelOrg?.scanUitvoeringen ?? []).filter((s) => s.assessmentId === bron.assessmentId);
    const doelMeting = keuze === NIEUW ? undefined : opties.find((s) => s.id === keuze);
    const overgeslagen = Boolean(
      conflictLid && doelMeting?.invullingen.some((i) => i.organisatieLidId === conflictLid.id)
    );
    return { bron, keuze, opties, overgeslagen };
  });
  const aantalOvergeslagen = regels.filter((r) => r.overgeslagen).length;

  function bevestig() {
    if (!doelOrg) return;
    const keuzes: VerplaatsMetingKeuze[] = regels.map((r) => ({
      bronMetingId: r.bron.id,
      doelMetingId: r.keuze === NIEUW ? null : r.keuze,
      nieuwLabel: labels[r.bron.id] ?? r.bron.label,
    }));
    const resultaat = verplaatsRespondentNaarOrganisatie(lid.id, doelOrg.id, keuzes, conflictLid?.id);
    if (!resultaat.ok) {
      setFout(resultaat.reden ?? "Verplaatsen is niet gelukt.");
      return;
    }
    onKlaar({ ...resultaat, doelOrganisatieNaam: doelOrg.naam });
  }

  return (
    <StapKader titel="Respondent verplaatsen" onTerug={onTerug}>
      <p className="text-sm text-ink-m mb-3">
        {lid.naam || lid.email} gaat met alle scans naar een andere organisatie. Een Meting hoort bij precies één
        organisatie: kies per Meting waar de scan terechtkomt.
      </p>
      {kandidaten.length === 0 ? (
        <p className="overzicht-melding fout">Er is geen andere organisatie waarnaar je kunt verplaatsen.</p>
      ) : (
        <>
          <div className="admin-field">
            <label>Doelorganisatie</label>
            <select value={doelOrgId} onChange={(e) => setDoelOrgId(e.target.value)}>
              {kandidaten.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.naam}
                </option>
              ))}
            </select>
          </div>

          {regels.length === 0 ? (
            <p className="text-sm text-ink-m">Deze Respondent heeft geen scans, alleen de Respondent zelf verhuist.</p>
          ) : (
            <div>
              {regels.map((r) => (
                <div key={r.bron.id} className="overzicht-stap-rij">
                  <span>
                    <strong>{r.bron.label}</strong>{" "}
                    <span className="text-ink-s">— {assessmentNaam(r.bron.assessmentId)}</span>
                  </span>
                  <MetingKeuze
                    metingen={r.opties}
                    waarde={r.keuze}
                    onWaarde={(w) => setOverrides((prev) => ({ ...prev, [`${doelOrgId}::${r.bron.id}`]: w }))}
                    label={labels[r.bron.id] ?? r.bron.label}
                    onLabel={(l) => setLabels((prev) => ({ ...prev, [r.bron.id]: l }))}
                  />
                  {r.overgeslagen && (
                    <span style={{ color: "var(--stat-red)" }}>
                      Wordt overgeslagen: de bestaande Respondent heeft in deze Meting al een scan.
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {conflictLid && (
            <p className="overzicht-melding fout">
              In {doelOrg?.naam} bestaat al een Respondent met het e-mailadres {lid.email}. Alle scans gaan naar die
              bestaande Respondent, en {lid.naam || lid.email} met de persoonlijke link wordt verwijderd: die link
              werkt daarna niet meer.
              {aantalOvergeslagen > 0 &&
                ` ${aantalOvergeslagen} scan${aantalOvergeslagen === 1 ? "" : "s"} wordt overgeslagen en blijft bij ${
                  lid.naam || lid.email
                } staan; die Respondent wordt dan niet verwijderd.`}
            </p>
          )}
        </>
      )}
      {fout && <p className="overzicht-melding fout">{fout}</p>}
      <div className="btn-rij" style={{ marginTop: "1.2rem" }}>
        <button type="button" className="btn btn-outline" onClick={onTerug}>
          Annuleren
        </button>
        <button
          type="button"
          className={conflictLid ? "btn btn-danger" : "btn btn-or"}
          disabled={!doelOrg}
          onClick={bevestig}
        >
          {conflictLid ? "Samenvoegen en verplaatsen" : "Verplaatsen"}
        </button>
      </div>
    </StapKader>
  );
}
