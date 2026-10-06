"use client";

import { useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { koppelScanAanAndereRespondent, useOrganisaties, verplaatsResponsNaarMeting } from "@/lib/db";
import type { RespondentKeuze } from "@/lib/db";
import { overallScore, voortgang } from "@/lib/scoring";
import { Organisatie, OrganisatieLid, ScanInvulling, ScanUitvoering } from "@/lib/types";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { InfoIcoon } from "@/components/InfoIcoon";
import { MetBewerkslot } from "@/components/beheer/MetBewerkslot";

const NIEUW = "__nieuw__";

interface Kolom {
  scan: ScanInvulling;
  meting: ScanUitvoering;
  lid: OrganisatieLid;
}

function zoek(organisatie: Organisatie, scanId: string): Kolom | null {
  for (const meting of organisatie.scanUitvoeringen) {
    const scan = meting.invullingen.find((i) => i.id === scanId);
    const lid = scan && organisatie.leden.find((l) => l.id === scan.organisatieLidId);
    if (scan && lid) return { scan, meting, lid };
  }
  return null;
}

/**
 * Conflict oplossen (`beheerpagina.md`, punt 6b): Modal "Twee scans van dezelfde Respondent". Links
 * de scan die al in de doel-Meting staat, rechts de scan die wordt verplaatst. Per kolom de knop
 * "Andere Respondent koppelen", waarna het Respondent-blok zelf bewerkbaar wordt. Alleen die ene
 * scan gaat naar de gekozen Respondent. Daarna kan het verplaatsen alsnog worden uitgevoerd.
 * De Respondent valt onder het Bewerkslot zolang de modal open staat.
 */
export function ConflictOplossen({
  organisatieId,
  verplaatsScanId,
  doelMetingId,
  onSluit,
  onKlaar,
}: {
  organisatieId: string;
  /** De scan die was overgeslagen bij het verplaatsen. */
  verplaatsScanId: string;
  doelMetingId: string;
  onSluit: () => void;
  /** Het verplaatsen is alsnog uitgevoerd. */
  onKlaar: (tekst: string) => void;
}) {
  const organisaties = useOrganisaties();
  const organisatie = organisaties.find((o) => o.id === organisatieId);
  // De scan die al in de doel-Meting staat (bij het openen: Dezelfde Respondent als de scan die verplaatst wordt).
  const [bestaandeScanId] = useState<string | null>(() => {
    const o = organisaties.find((x) => x.id === organisatieId);
    const rechts = o && zoek(o, verplaatsScanId);
    const doel = o?.scanUitvoeringen.find((m) => m.id === doelMetingId);
    return rechts ? (doel?.invullingen.find((i) => i.organisatieLidId === rechts.lid.id)?.id ?? null) : null;
  });
  const [slotLidId] = useState<string | null>(() => {
    const o = organisaties.find((x) => x.id === organisatieId);
    return (o && zoek(o, verplaatsScanId)?.lid.id) ?? null;
  });

  if (!organisatie || !bestaandeScanId) {
    return (
      <OverzichtModal label="Conflict oplossen" onSluit={onSluit}>
        <h2 className="text-lg font-bold text-ink">Conflict oplossen</h2>
        <p className="overzicht-melding fout">Er is geen conflict meer: De Respondent heeft in de doel-Meting geen scan meer.</p>
      </OverzichtModal>
    );
  }

  return (
    <MetBewerkslot type="respondent" id={slotLidId} wat="Respondent" onSluit={onSluit}>
      <ConflictInhoud
        organisatie={organisatie}
        linksId={bestaandeScanId}
        rechtsId={verplaatsScanId}
        doelMetingId={doelMetingId}
        onSluit={onSluit}
        onKlaar={onKlaar}
      />
    </MetBewerkslot>
  );
}

function ConflictInhoud({
  organisatie,
  linksId,
  rechtsId,
  doelMetingId,
  onSluit,
  onKlaar,
}: {
  organisatie: Organisatie;
  linksId: string;
  rechtsId: string;
  doelMetingId: string;
  onSluit: () => void;
  onKlaar: (tekst: string) => void;
}) {
  const links = zoek(organisatie, linksId);
  const rechts = zoek(organisatie, rechtsId);
  const [fout, setFout] = useState<string | null>(null);

  if (!links || !rechts) {
    return (
      <OverzichtModal label="Conflict oplossen" onSluit={onSluit}>
        <h2 className="text-lg font-bold text-ink">Conflict oplossen</h2>
        <p className="overzicht-melding fout">Een van de twee scans bestaat niet meer.</p>
      </OverzichtModal>
    );
  }

  const opgelost = links.lid.id !== rechts.lid.id;

  function verplaats() {
    const r = verplaatsResponsNaarMeting(rechtsId, doelMetingId);
    if (!r.ok) {
      setFout(r.reden ?? "Verplaatsen is niet gelukt.");
      return;
    }
    const doel = organisatie.scanUitvoeringen.find((m) => m.id === doelMetingId);
    onKlaar(`Scan verplaatst naar Meting "${doel?.label ?? ""}".`);
  }

  return (
    <OverzichtModal label="Twee scans van dezelfde Respondent" onSluit={onSluit}>
      <div className="flex items-center gap-2" style={{ marginBottom: "1rem" }}>
        <h2 className="text-lg font-bold text-ink">Twee scans van dezelfde Respondent</h2>
        <InfoIcoon sleutel="info.conflictOplossen" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <KolomKaart titel="Staat al in de doel-Meting" organisatie={organisatie} kolom={links} onFout={setFout} />
        <KolomKaart titel="Wordt verplaatst" organisatie={organisatie} kolom={rechts} onFout={setFout} />
      </div>

      {fout && <p className="overzicht-melding fout">{fout}</p>}

      <div className="knoppenrij" style={{ marginTop: "1.2rem" }}>
        <button type="button" className="btn btn-or btn-compact" disabled={!opgelost} onClick={verplaats}>
          Verplaatsen alsnog uitvoeren
        </button>
        <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
          Sluiten
        </button>
      </div>
    </OverzichtModal>
  );
}

function KolomKaart({
  titel,
  organisatie,
  kolom,
  onFout,
}: {
  titel: string;
  organisatie: Organisatie;
  kolom: Kolom;
  onFout: (f: string | null) => void;
}) {
  const assessments = useAssessments();
  const assessment = assessments.find((a) => a.id === kolom.meting.assessmentId);
  const { lid, scan, meting } = kolom;
  const [bewerken, setBewerken] = useState(false);
  const [keuze, setKeuze] = useState(NIEUW);
  const [form, setForm] = useState({ naam: "", email: "", functie: "", team: "", notities: "" });

  const voortgangTekst = assessment ? `${voortgang(assessment, scan.antwoorden).percentage}%` : "";
  const score = assessment ? overallScore(assessment, scan.antwoorden) : null;
  const kandidaten = organisatie.leden.filter(
    (l) => l.id !== lid.id && !meting.invullingen.some((i) => i.id !== scan.id && i.organisatieLidId === l.id)
  );
  const gekozenLid = keuze === NIEUW ? null : organisatie.leden.find((l) => l.id === keuze) ?? null;
  const toon = gekozenLid ?? null;

  function start() {
    onFout(null);
    setKeuze(NIEUW);
    // Vooraf ingevuld met de huidige gegevens, het e-mailadres blijft leeg: Een nieuwe Respondent heeft een eigen adres nodig.
    setForm({ naam: lid.naam ?? "", email: "", functie: lid.functie, team: lid.team, notities: lid.notities });
    setBewerken(true);
  }

  function opslaan() {
    const k: RespondentKeuze = keuze === NIEUW ? { soort: "nieuw", invoer: form } : { soort: "bestaand", lidId: keuze };
    const r = koppelScanAanAndereRespondent(scan.id, k);
    if (!r.ok) {
      onFout(r.reden ?? "Koppelen is niet gelukt.");
      return;
    }
    onFout(null);
    setBewerken(false);
  }

  const rij = (label: string, waarde: string) => (
    <>
      <dt>{label}</dt>
      <dd>{waarde}</dd>
    </>
  );

  return (
    <div className="overzicht-blok" style={{ marginTop: 0 }}>
      <div className="overzicht-blok-kop">
        <h3>{titel}</h3>
      </div>
      <dl className="beschrijvingslijst">
        {rij("Meting", meting.label)}
        {rij("Afgerond op", scan.afgerondOp ? new Date(scan.afgerondOp).toLocaleDateString("nl-NL") : "")}
        {rij("Voortgang", voortgangTekst)}
        {rij("Totaalscore", score !== null ? score.toFixed(1).replace(".", ",") : "")}
      </dl>

      <div className="overzicht-blok-kop" style={{ marginTop: "0.8rem" }}>
        <h3>Respondent</h3>
      </div>
      {bewerken ? (
        <div>
          <select className="veld-compact" value={keuze} onChange={(e) => setKeuze(e.target.value)} aria-label="Respondent" style={{ width: "100%", marginBottom: "0.6rem" }}>
            <option value={NIEUW}>Nieuwe Respondent</option>
            {kandidaten.map((l) => (
              <option key={l.id} value={l.id}>
                {l.naam || l.email}
              </option>
            ))}
          </select>
          {keuze === NIEUW ? (
            <dl className="beschrijvingslijst">
              <dt>Naam</dt>
              <dd><input className="veld-compact" style={{ width: "100%" }} value={form.naam} onChange={(e) => setForm({ ...form, naam: e.target.value })} /></dd>
              <dt>E-mail</dt>
              <dd>
                <input
                  className="veld-compact"
                  style={{ width: "100%" }}
                  type="email"
                  value={form.email}
                  placeholder="E-mailadres (eigen, nog niet gebruikt)"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </dd>
              <dt>Functie</dt>
              <dd><input className="veld-compact" style={{ width: "100%" }} value={form.functie} onChange={(e) => setForm({ ...form, functie: e.target.value })} /></dd>
              <dt>Team</dt>
              <dd><input className="veld-compact" style={{ width: "100%" }} value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} /></dd>
              <dt>Notities</dt>
              <dd><input className="veld-compact" style={{ width: "100%" }} value={form.notities} onChange={(e) => setForm({ ...form, notities: e.target.value })} /></dd>
            </dl>
          ) : (
            <dl className="beschrijvingslijst">
              {rij("Naam", toon?.naam ?? "")}
              {rij("E-mail", toon?.email ?? "")}
              {rij("Functie", toon?.functie ?? "")}
              {rij("Team", toon?.team ?? "")}
              {rij("Notities", toon?.notities ?? "")}
            </dl>
          )}
          <div className="knoppenrij" style={{ marginTop: "0.6rem" }}>
            <button type="button" className="btn btn-or btn-compact" onClick={opslaan}>
              Opslaan
            </button>
            <button type="button" className="btn btn-outline btn-compact" onClick={() => { setBewerken(false); onFout(null); }}>
              Annuleren
            </button>
          </div>
        </div>
      ) : (
        <>
          <dl className="beschrijvingslijst">
            {rij("Naam", lid.naam ?? "")}
            {rij("E-mail", lid.email)}
            {rij("Functie", lid.functie)}
            {rij("Team", lid.team)}
            {rij("Notities", lid.notities)}
          </dl>
          <div style={{ marginTop: "0.6rem" }}>
            <button type="button" className="btn btn-outline btn-compact" onClick={start}>
              Andere Respondent koppelen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
