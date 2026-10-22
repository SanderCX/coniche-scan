"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { bewaarKpiWaarden } from "@/lib/db";
import { useInstellingen } from "@/lib/instellingen-store";
import { KpiWijziging, kanalenMetWaarde, kpiMagOpPlek, kpiWaardeVan, parseKpiGetal, toonKpiGetal } from "@/lib/kpi";
import { onderdelenOpAlfabet } from "@/lib/onderdelen";
import { Organisatie } from "@/lib/types";

const ALGEMEEN = "__algemeen__";
const sleutel = (onderdeelId: string | null, kanaalId: string | null, kpiId: string) => `${onderdeelId ?? "_"}|${kanaalId ?? "_"}|${kpiId}`;

/**
 * "KPI's invullen" (`beheerpagina.md`, punt 4, KPI's invullen; `datamodel.md`, KPI's en kanalen): Een brede modal met per plek
 * (Algemeen of een Onderdeel) een invoertabel met de KPI's in de rijen en de kolommen Algemeen en de gekozen kanalen. Alleen wat je
 * weet: Een lege cel is geen waarde, 0 is een geldige waarde. Wisselen van plek behoudt wat is ingevuld. Eén "Opslaan" bewaart de
 * wijzigingen van alle plekken, "Annuleren" gooit ze allemaal weg.
 */
export function KpiInvullenModal({ organisatie, onSluit, beginOnderdeelId = null }: { organisatie: Organisatie; onSluit: () => void; /** De plek waarmee de modal opent: Het gekozen Onderdeel in het organisatiepaneel, `null` is Algemeen. */ beginOnderdeelId?: string | null }) {
  const { kpiDefinities, kanalen } = useInstellingen();
  const kpis = [...kpiDefinities].sort((a, b) => a.volgorde - b.volgorde);
  const kanalenOpVolgorde = [...kanalen].sort((a, b) => a.volgorde - b.volgorde);
  const onderdelen = onderdelenOpAlfabet(organisatie);

  // Het concept: Per cel de ingetypte tekst, alleen voor cellen die de gebruiker aanraakte.
  const [concept, setConcept] = useState<Record<string, string>>({});
  const [plek, setPlek] = useState<string>(beginOnderdeelId && onderdelen.some((o) => o.id === beginOnderdeelId) ? beginOnderdeelId : ALGEMEEN);
  // De gekozen kanaalkolommen per plek. Een kanaal met een waarde bij die plek staat gekozen bij het openen.
  const [gekozenKanalen, setGekozenKanalen] = useState<Record<string, string[]>>({});
  const [fout, setFout] = useState<string | null>(null);

  const onderdeelId = plek === ALGEMEEN ? null : plek;
  const plekSleutel = plek;
  const metWaarde = kanalenMetWaarde(organisatie, kanalenOpVolgorde, onderdeelId).map((k) => k.id);
  const gekozen = gekozenKanalen[plekSleutel] ?? metWaarde;
  const kolomKanalen = kanalenOpVolgorde.filter((k) => gekozen.includes(k.id));

  const opgeslagenTekst = (oId: string | null, kId: string | null, kpiId: string) => toonKpiGetal(kpiWaardeVan(organisatie, kpiId, { onderdeelId: oId, kanaalId: kId }));
  const celTekst = (oId: string | null, kId: string | null, kpiId: string) => {
    const s = sleutel(oId, kId, kpiId);
    return s in concept ? concept[s] : opgeslagenTekst(oId, kId, kpiId);
  };

  // Een kanaal staat vast zolang zijn kolom bij deze plek niet leeg is (de ingetypte stand telt mee).
  const kolomLeeg = (kanaalId: string) => kpis.every((k) => celTekst(onderdeelId, kanaalId, k.id).trim() === "");
  const wisselKanaal = (id: string) => {
    const nieuw = gekozen.includes(id) ? gekozen.filter((k) => k !== id) : [...gekozen, id];
    setGekozenKanalen({ ...gekozenKanalen, [plekSleutel]: nieuw });
  };

  function opslaan() {
    setFout(null);
    const wijzigingen: KpiWijziging[] = [];
    const alleOnderdelen: (string | null)[] = [null, ...onderdelen.map((o) => o.id)];
    for (const [s, tekst] of Object.entries(concept)) {
      const [oRuw, kRuw, kpiId] = s.split("|");
      const oId = oRuw === "_" ? null : oRuw;
      const kId = kRuw === "_" ? null : kRuw;
      if (!alleOnderdelen.includes(oId)) continue;
      const getal = parseKpiGetal(tekst);
      if (Number.isNaN(getal)) {
        const kpi = kpis.find((k) => k.id === kpiId);
        return setFout(`${kpi?.naam ?? "Een KPI"}: "${tekst}" is geen getal.`);
      }
      const huidig = kpiWaardeVan(organisatie, kpiId, { onderdeelId: oId, kanaalId: kId });
      if (getal === huidig) continue;
      wijzigingen.push({ onderdeelId: oId, kanaalId: kId, kpiId, waarde: getal });
    }
    const r = bewaarKpiWaarden(organisatie.id, wijzigingen);
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  return (
    <OverzichtModal label="KPI's invullen" onSluit={onSluit}>
      <div className="overzicht-kop">
        <h2>KPI&apos;s invullen</h2>
        <p className="text-sm text-ink-m" style={{ margin: 0 }}>
          {organisatie.naam}
        </p>
      </div>

      {onderdelen.length > 0 && (
        <div className="kpi-keuze">
          <span className="kpi-keuze-label">
            Plek <InfoIcoon sleutel="info.kpiPlek" />
          </span>
          <WeergaveWissel<string>
            ariaLabel="Plek"
            opties={[{ waarde: ALGEMEEN, label: "Algemeen" }, ...onderdelen.map((o) => ({ waarde: o.id, label: o.naam }))]}
            waarde={plek}
            onChange={setPlek}
          />
        </div>
      )}

      {kpis.some((k) => k.perKanaal) && kanalenOpVolgorde.length > 0 && (
        <div className="kpi-keuze">
          <span className="kpi-keuze-label">
            Kanalen uitsplitsen <InfoIcoon sleutel="info.kpiKanalen" />
          </span>
          <div className="vk-chips" style={{ margin: 0 }}>
            {kanalenOpVolgorde.map((k) => {
              const aan = gekozen.includes(k.id);
              const vast = aan && !kolomLeeg(k.id);
              return (
                <button
                  key={k.id}
                  type="button"
                  className="pil"
                  aria-pressed={aan}
                  disabled={vast}
                  title={vast ? "Er staat een waarde in deze kolom. Maak de kolom eerst leeg." : undefined}
                  onClick={() => wisselKanaal(k.id)}
                >
                  {k.naam}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="kpi-invoer-wrap">
        <table className="kpi-invoer">
          <thead>
            <tr>
              <th className="kpi-eerste">KPI</th>
              <th>Algemeen</th>
              {kolomKanalen.map((k) => (
                <th key={k.id}>{k.naam}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi) => (
              <tr key={kpi.id}>
                <th scope="row" className="kpi-eerste">
                  <span className="kpi-naam">
                    <span>{kpi.naam}</span>
                    {kpi.eenheid && kpi.eenheid !== "aantal" && <span className="kpi-eenheid">{kpi.eenheid}</span>}
                  </span>
                </th>
                {[null, ...kolomKanalen.map((k) => k.id)].map((kanaalId) => {
                  const mag = kpiMagOpPlek(kpi, { onderdeelId, kanaalId });
                  return (
                    <td key={kanaalId ?? "algemeen"}>
                      {mag ? (
                        <input
                          type="text"
                          inputMode="decimal"
                          className="kpi-cel"
                          placeholder="–"
                          aria-label={`${kpi.naam}, ${kanaalId === null ? "Algemeen" : (kanalen.find((k) => k.id === kanaalId)?.naam ?? "")}`}
                          value={celTekst(onderdeelId, kanaalId, kpi.id)}
                          onChange={(e) => {
                            setFout(null);
                            setConcept({ ...concept, [sleutel(onderdeelId, kanaalId, kpi.id)]: e.target.value });
                          }}
                        />
                      ) : (
                        <span className="kpi-cel kpi-cel--nvt" aria-label="Niet van toepassing">
                          n.v.t.
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fout && (
        <p className="overzicht-melding fout" role="alert">
          {fout}
        </p>
      )}
      <div className="btn-rij" style={{ justifyContent: "flex-end", marginTop: "var(--sp-4)" }}>
        <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
          Annuleren
        </button>
        <button type="button" className="btn btn-or btn-compact" onClick={opslaan}>
          Opslaan
        </button>
      </div>
    </OverzichtModal>
  );
}
