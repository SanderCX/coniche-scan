"use client";

import { useMemo, useState } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { naarRonde } from "@/lib/db";
import {
  NaarRondeRegel,
  STANDAARD_ONDERDEEL,
  bestaandeOnderdelen,
  controleerNaarRonde,
  genereerLabel,
  rondesNieuwsteEerst,
  stelOnderdeelVoor,
} from "@/lib/rondes";
import { Organisatie } from "@/lib/types";
import { Modal } from "@/components/Modal";

const NIEUWE_RONDE = "__nieuweronde__";

/**
 * "Naar ronde…" (`beheerpagina.md`, punt 5, Rondes beheren): Bovenaan de ronde (bestaand of nieuw), daaronder één regel per
 * Meting met alleen het veld Onderdeel. Het onderdeel is voorgevuld uit het oude label (`datamodel.md`, Onderdeel uit het
 * label voorstellen), zodat alle onderdelen in één stap goed staan. De knop is pas actief als in de gekozen ronde geen twee
 * Metingen hetzelfde onderdeel en Assessment hebben, ook niet met Metingen die er al staan. Een regel die botst, zegt dat
 * zelf en noemt de uitweg. Alles gaat in één keer naar de ronde, of niets.
 */
export function NaarRondeModal({
  organisatie,
  metingIds,
  onSluit,
  onKlaar,
}: {
  organisatie: Organisatie;
  metingIds: string[];
  onSluit: () => void;
  onKlaar: (tekst: string) => void;
}) {
  const assessments = useAssessments();
  const rondes = rondesNieuwsteEerst(organisatie);
  const metingen = useMemo(
    () => metingIds.flatMap((id) => organisatie.scanUitvoeringen.filter((m) => m.id === id)),
    [metingIds, organisatie]
  );
  const [keuze, setKeuze] = useState(rondes[0]?.id ?? NIEUWE_RONDE);
  const [nieuweNaam, setNieuweNaam] = useState("");
  const [onderdelen, setOnderdelen] = useState<Record<string, string>>({});
  const [fout, setFout] = useState<string | null>(null);

  const onderdeelVan = (id: string, label: string, huidig: string | undefined) =>
    onderdelen[id] ?? stelOnderdeelVoor({ label, onderdeel: huidig });
  const regels: NaarRondeRegel[] = metingen.map((m) => ({ metingId: m.id, onderdeel: onderdeelVan(m.id, m.label, m.onderdeel) }));

  const nieuw = keuze === NIEUWE_RONDE;
  const rondeNaam = nieuw ? nieuweNaam.trim() : rondes.find((r) => r.id === keuze)?.label ?? "";
  const fouten = controleerNaarRonde(organisatie, nieuw ? null : keuze, rondeNaam || "de nieuwe ronde", regels);
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";
  const suggesties = useMemo(() => bestaandeOnderdelen(organisatie), [organisatie]);
  const kanOpslaan = metingen.length > 0 && rondeNaam !== "" && Object.keys(fouten).length === 0;

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    const r = naarRonde(organisatie.id, regels, nieuw ? { nieuweRondeLabel: nieuweNaam } : { rondeId: keuze });
    if (!r.ok) return setFout(r.reden);
    onKlaar(`${r.verplaatst} ${r.verplaatst === 1 ? "Meting" : "Metingen"} naar ronde "${r.rondeLabel}".`);
  }

  return (
    <Modal open onClose={onSluit} title="Naar ronde…">
      <form onSubmit={opslaan} className="text-left">
        <p className="text-sm text-ink-m" style={{ marginTop: 0 }}>
          {metingen.length} {metingen.length === 1 ? "Meting" : "Metingen"} aan een ronde hangen. Controleer per Meting het
          onderdeel: De naam volgt uit onderdeel en ronde.
        </p>
        <div className="flex flex-wrap items-end gap-3" style={{ marginBottom: "1rem" }}>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label>Ronde</label>
            <select value={keuze} onChange={(e) => setKeuze(e.target.value)}>
              {rondes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
              <option value={NIEUWE_RONDE}>Nieuwe ronde</option>
            </select>
          </div>
          {nieuw && (
            <div className="admin-field" style={{ marginBottom: 0 }}>
              <label>Naam van de ronde</label>
              <input type="text" required value={nieuweNaam} onChange={(e) => setNieuweNaam(e.target.value)} placeholder="0-meting" />
            </div>
          )}
        </div>

        <datalist id="naar-ronde-onderdelen">
          {suggesties.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
        <table className="admin-table" style={{ marginBottom: "1rem" }}>
          <thead>
            <tr>
              <th>Meting</th>
              <th>Onderdeel</th>
            </tr>
          </thead>
          <tbody>
            {metingen.map((m) => {
              const onderdeel = onderdeelVan(m.id, m.label, m.onderdeel);
              const melding = fouten[m.id];
              return (
                <tr key={m.id} style={{ verticalAlign: "top" }}>
                  <td>
                    <strong>{m.label}</strong>
                    <br />
                    <span className="text-ink-s">{assessmentNaam(m.assessmentId)}</span>
                  </td>
                  <td style={{ minWidth: "16rem" }}>
                    <input
                      type="text"
                      className="veld-compact"
                      style={{ width: "100%" }}
                      list="naar-ronde-onderdelen"
                      aria-label={`Onderdeel van ${m.label}`}
                      value={onderdeel}
                      onChange={(e) => setOnderdelen((v) => ({ ...v, [m.id]: e.target.value }))}
                    />
                    {rondeNaam && (
                      <p className="text-sm text-ink-s" style={{ margin: "0.3rem 0 0" }}>
                        Wordt: {genereerLabel(onderdeel.trim() || STANDAARD_ONDERDEEL, rondeNaam)}
                      </p>
                    )}
                    {melding && (
                      <p className="text-sm" style={{ color: "var(--stat-red)", margin: "0.3rem 0 0" }} role="alert">
                        {melding}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {fout && <p className="overzicht-melding fout">{fout}</p>}
        <div className="btn-rij">
          <button type="button" className="btn btn-outline" onClick={onSluit}>
            Annuleren
          </button>
          <button type="submit" className="btn btn-or" disabled={!kanOpslaan}>
            Naar ronde
          </button>
        </div>
      </form>
    </Modal>
  );
}
