"use client";

import { useEffect, useState } from "react";
import {
  CONTROLE_TITELS,
  ControleId,
  ControleUitkomst,
  Vondst,
  controleerIntegriteit,
  koppelWeesMetingAanOrganisatie,
  koppelWeesRespondentAanOrganisatie,
  koppelWeesScanAanMeting,
  koppelWeesScanAanRespondent,
  totaalVondsten,
  useOrganisaties,
  verwijderLeden,
  verwijderLeadVerwijzing,
  verwijderMeting,
  verwijderScanInvullingen,
} from "@/lib/db";
import { InfoIcoon } from "@/components/InfoIcoon";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";

/**
 * Data-integriteit (`beheerpagina.md`, punt 13): "Controleer nu" geeft een samenvatting en één regel per
 * controle met het aantal vondsten. "Bekijken" opent een modal per controle met per vondst de gegevens en de
 * acties (koppelen of verwijderen), elk met een bevestiging. Geen bulkactie. De modal blijft open na een
 * actie, en na het sluiten draait de controle opnieuw.
 */
export function DataIntegriteit() {
  const organisaties = useOrganisaties();
  const [uitkomst, setUitkomst] = useState<ControleUitkomst[] | null>(null);
  const [open, setOpen] = useState<ControleId | null>(null);
  const [melding, setMelding] = useState<string | null>(null);

  function controleer() {
    setMelding(null);
    setUitkomst(controleerIntegriteit());
  }

  function sluit(meldingTekst?: string) {
    setOpen(null);
    setMelding(meldingTekst ?? null);
    setUitkomst(controleerIntegriteit());
  }

  const totaal = uitkomst ? totaalVondsten(uitkomst) : 0;

  return (
    <div className="admin-notice mt-10" style={{ maxWidth: "40rem" }}>
      <p className="font-semibold text-ink">Data-integriteit</p>
      <div className="knoppenrij mt-3">
        <button type="button" onClick={controleer} className="btn btn-outline btn-compact">
          Controleer nu
        </button>
        <InfoIcoon sleutel="info.dataIntegriteit" />
      </div>

      {melding && <p className="text-sm text-ink-m mt-3">{melding}</p>}

      {uitkomst && (
        <div className="mt-3">
          {totaal === 0 ? (
            <p className="text-sm font-medium" style={{ color: "var(--stat-green)" }}>
              ✓ Geen verwijzingen naar een niet-bestaand record gevonden.
            </p>
          ) : (
            <p className="text-sm font-semibold" style={{ color: "var(--stat-red)" }}>
              {totaal} {totaal === 1 ? "verwijzing" : "verwijzingen"} naar een niet-bestaand record gevonden
            </p>
          )}
          <ul className="mt-2" style={{ listStyle: "none", padding: 0 }}>
            {uitkomst.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 text-sm" style={{ padding: "0.35rem 0" }}>
                <span>
                  {c.titel}: <strong>{c.vondsten.length}</strong>
                </span>
                {c.vondsten.length > 0 && (
                  <button type="button" className="btn btn-outline btn-compact" onClick={() => setOpen(c.id)}>
                    Bekijken
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && <ControleModal id={open} organisaties={organisaties} onSluit={sluit} />}
    </div>
  );
}

interface Bevestiging {
  titel: string;
  tekst: string;
  label: string;
  danger: boolean;
  uitvoeren: () => { ok: boolean; reden?: string } | void;
}

function ControleModal({
  id,
  organisaties,
  onSluit,
}: {
  id: ControleId;
  organisaties: ReturnType<typeof useOrganisaties>;
  onSluit: (melding?: string) => void;
}) {
  // Altijd uit de actuele data: Na een actie verdwijnt de rij en telt het aantal af.
  const vondsten = controleerIntegriteit(organisaties).find((c) => c.id === id)?.vondsten ?? [];
  const [keuze, setKeuze] = useState<Record<string, string>>({});
  const [bevestig, setBevestig] = useState<Bevestiging | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  // Bij 0 vondsten sluit de modal met de melding dat er niets meer te vinden is.
  const leeg = vondsten.length === 0;
  useEffect(() => {
    if (leeg) onSluit(`${CONTROLE_TITELS[id]}: Er is niets meer te vinden.`);
  }, [leeg, id, onSluit]);
  if (leeg) return null;

  const orgVan = (v: Vondst) => organisaties.find((o) => o.id === v.organisatieId);

  function vraag(b: Bevestiging) {
    setFout(null);
    setBevestig(b);
  }

  function doe() {
    if (!bevestig) return;
    const r = bevestig.uitvoeren();
    setBevestig(null);
    if (r && !r.ok) setFout(r.reden ?? "De actie is niet gelukt.");
  }

  function rij(v: Vondst) {
    const o = orgVan(v);
    const gekozen = keuze[v.sleutel] ?? "";
    const selecteer = (opties: { id: string; label: string }[], leeg: string) => (
      <select
        className="veld-compact"
        value={gekozen}
        aria-label={leeg}
        onChange={(e) => setKeuze({ ...keuze, [v.sleutel]: e.target.value })}
      >
        <option value="">{leeg}</option>
        {opties.map((x) => (
          <option key={x.id} value={x.id}>
            {x.label}
          </option>
        ))}
      </select>
    );
    const label = (opties: { id: string; label: string }[], idKeuze: string) => opties.find((x) => x.id === idKeuze)?.label ?? "";

    if (v.controle === "scan-zonder-respondent") {
      const opties = (o?.leden ?? []).map((l) => ({ id: l.id, label: l.naam || l.email }));
      return (
        <div className="knoppenrij">
          {selecteer(opties, "Kies een Respondent")}
          <button
            type="button"
            className="btn btn-outline btn-compact"
            disabled={!gekozen}
            onClick={() =>
              vraag({
                titel: "Aan Respondent koppelen",
                tekst: `Deze scan koppelen aan ${label(opties, gekozen)}?`,
                label: "Koppelen",
                danger: false,
                uitvoeren: () => koppelWeesScanAanRespondent(v.recordId, gekozen),
              })
            }
          >
            Aan Respondent koppelen
          </button>
          <button
            type="button"
            className="btn btn-danger btn-compact"
            onClick={() =>
              vraag({
                titel: "Scan verwijderen",
                tekst: "Deze ingevulde scan definitief verwijderen, met antwoorden en opmerkingen? Dit kan niet ongedaan gemaakt worden.",
                label: "Verwijderen",
                danger: true,
                uitvoeren: () => verwijderScanInvullingen([v.recordId]),
              })
            }
          >
            Verwijderen
          </button>
        </div>
      );
    }

    if (v.controle === "scan-zonder-meting") {
      const bron = o?.scanUitvoeringen.find((m) => m.invullingen.some((i) => i.id === v.recordId));
      const opties = (o?.scanUitvoeringen ?? [])
        .filter((m) => m.assessmentId === bron?.assessmentId)
        .map((m) => ({ id: m.id, label: m.label }));
      return (
        <div className="knoppenrij">
          {selecteer(opties, "Kies een Meting")}
          <button
            type="button"
            className="btn btn-outline btn-compact"
            disabled={!gekozen}
            onClick={() =>
              vraag({
                titel: "Aan Meting koppelen",
                tekst: `Deze scan koppelen aan Meting "${label(opties, gekozen)}"?`,
                label: "Koppelen",
                danger: false,
                uitvoeren: () => koppelWeesScanAanMeting(v.recordId, gekozen),
              })
            }
          >
            Aan Meting koppelen
          </button>
          <button
            type="button"
            className="btn btn-danger btn-compact"
            onClick={() =>
              vraag({
                titel: "Scan verwijderen",
                tekst: "Deze ingevulde scan definitief verwijderen, met antwoorden en opmerkingen? Dit kan niet ongedaan gemaakt worden.",
                label: "Verwijderen",
                danger: true,
                uitvoeren: () => verwijderScanInvullingen([v.recordId]),
              })
            }
          >
            Verwijderen
          </button>
        </div>
      );
    }

    if (v.controle === "respondent-zonder-organisatie" || v.controle === "meting-zonder-organisatie") {
      const opties = organisaties.map((x) => ({ id: x.id, label: x.naam }));
      const isLid = v.controle === "respondent-zonder-organisatie";
      return (
        <div className="knoppenrij">
          {selecteer(opties, "Kies een Organisatie")}
          <button
            type="button"
            className="btn btn-outline btn-compact"
            disabled={!gekozen}
            onClick={() =>
              vraag({
                titel: "Aan Organisatie koppelen",
                tekst: `${isLid ? "Deze Respondent" : "Deze Meting"} koppelen aan ${label(opties, gekozen)}?`,
                label: "Koppelen",
                danger: false,
                uitvoeren: () => (isLid ? koppelWeesRespondentAanOrganisatie(v.recordId, gekozen) : koppelWeesMetingAanOrganisatie(v.recordId, gekozen)),
              })
            }
          >
            Aan Organisatie koppelen
          </button>
          <button
            type="button"
            className="btn btn-danger btn-compact"
            onClick={() =>
              vraag({
                titel: isLid ? "Respondent verwijderen" : "Meting verwijderen",
                tekst: `${isLid ? "Deze Respondent" : "Deze Meting"} definitief verwijderen, met ${v.aantalScans ?? 0} ingevulde scan${
                  v.aantalScans === 1 ? "" : "s"
                }${isLid ? " en de persoonlijke link" : ""}? Dit kan niet ongedaan gemaakt worden.`,
                label: "Verwijderen",
                danger: true,
                uitvoeren: () => (isLid ? verwijderLeden([v.recordId]) : verwijderMeting(v.recordId)),
              })
            }
          >
            Verwijderen
          </button>
        </div>
      );
    }

    return (
      <div className="knoppenrij">
        <button
          type="button"
          className="btn btn-outline btn-compact"
          onClick={() =>
            vraag({
              titel: "Verwijzing verwijderen",
              tekst: "Alleen de toegang tot de niet-bestaande Meting vervalt. De Respondent blijft bestaan.",
              label: "Verwijzing verwijderen",
              danger: false,
              uitvoeren: () => verwijderLeadVerwijzing(v.recordId, v.ontbrekendId),
            })
          }
        >
          Verwijzing verwijderen
        </button>
      </div>
    );
  }

  return (
    <>
      <OverzichtModal label={CONTROLE_TITELS[id]} onSluit={() => onSluit()} escUitgeschakeld={bevestig !== null}>
        <h2 className="text-lg font-bold text-ink">
          {CONTROLE_TITELS[id]} ({vondsten.length})
        </h2>
        {fout && <p className="overzicht-melding fout">{fout}</p>}
        {vondsten.map((v) => (
          <section key={v.sleutel} className="overzicht-blok">
            <dl className="beschrijvingslijst">
              {v.regels.map((r) => {
                const i = r.indexOf(": ");
                return (
                  <div key={r} style={{ display: "contents" }}>
                    <dt>{i === -1 ? "" : r.slice(0, i)}</dt>
                    <dd>{i === -1 ? r : r.slice(i + 2)}</dd>
                  </div>
                );
              })}
              <dt>Organisatie</dt>
              <dd>{v.organisatieNaam}</dd>
            </dl>
            <div style={{ marginTop: "0.7rem" }}>{rij(v)}</div>
          </section>
        ))}
      </OverzichtModal>
      <BevestigModal
        open={bevestig !== null}
        titel={bevestig?.titel ?? ""}
        bericht={bevestig?.tekst ?? ""}
        bevestigLabel={bevestig?.label ?? "Bevestigen"}
        bevestigVariant={bevestig?.danger ? "danger" : "primair"}
        onBevestigen={doe}
        onAnnuleren={() => setBevestig(null)}
      />
    </>
  );
}
