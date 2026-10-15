"use client";

import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { Groep, Groepering, PoolLid, FilterVeld, getalWaarden, histogram, mediaan } from "@/lib/verkennen";

export const CRM_VELD = "techstack.techstack-crm.leverancier";
export const SECTOR = "sector-subsector.sector";
export const AHT_VELD = "kpis.aht";

export type GroeperenOp = "crm" | "sector" | "aht";

/**
 * Vergelijken (`visualisatie-verkennen.md`, Groeperen en focus): Groeperen op CRM-pakket, sector of de AHT-drempel, en de
 * focusgroep als chips met het aantal. Bij de AHT-drempel staat een slider met een histogram waarin de staven van de
 * focusgroep oranje zijn. Een groep met minder dan `minGroep` organisaties is gestreept, en heeft de focus of de rest minder dan
 * `waarschuwing`, dan staat er een waarschuwing. Het is geen blokkade.
 */
export function Vergelijken({
  velden,
  leden,
  op,
  onOp,
  drempel,
  onDrempel,
  groepen,
  focusSleutel,
  onFocus,
  focusLeden,
  restLeden,
  minGroep,
  waarschuwing,
}: {
  velden: FilterVeld[];
  leden: PoolLid[];
  op: GroeperenOp;
  onOp: (op: GroeperenOp) => void;
  drempel: number | null;
  onDrempel: (d: number) => void;
  groepen: Groep[];
  focusSleutel: string | undefined;
  onFocus: (sleutel: string) => void;
  focusLeden: PoolLid[];
  restLeden: PoolLid[];
  minGroep: number;
  waarschuwing: number;
}) {
  const ahtVeld = velden.find((v) => v.id === AHT_VELD);
  const ahtWaarden = ahtVeld ? getalWaarden(leden, ahtVeld) : [];
  const focus = groepen.find((g) => g.sleutel === focusSleutel);
  const focusIds = new Set(focus?.leden.map((l) => l.organisatie.id));
  const klein = (n: number) => n < waarschuwing;

  let slider = null;
  if (op === "aht") {
    if (ahtWaarden.length === 0) {
      slider = <p className="text-sm text-ink-s">Geen enkele Organisatie in de pool heeft de AHT ingevuld.</p>;
    } else {
      const min = Math.min(...ahtWaarden);
      const max = Math.max(...ahtWaarden);
      const d = drempel ?? Math.round(mediaan(ahtWaarden) ?? min);
      const staven = histogram(ahtWaarden, min, max);
      const piek = Math.max(1, ...staven);
      const lid = (w: number) => (max <= min ? 0 : Math.min(staven.length - 1, Math.floor(((w - min) / (max - min)) * staven.length)));
      // Een staaf is "focus" als de focusgroep Organisaties heeft in dat bereik.
      const focusStaven = new Array<number>(staven.length).fill(0);
      for (const l of leden) {
        const w = ahtVeld ? getalWaarden([l], ahtVeld)[0] : undefined;
        if (w !== undefined && focusIds.has(l.organisatie.id)) focusStaven[lid(w)] += 1;
      }
      const onder = ahtWaarden.filter((w) => w <= d).length;
      slider = (
        <div style={{ marginTop: "0.8rem" }}>
          <p className="vk-veldkop" style={{ marginTop: 0 }}>
            AHT-drempel (seconden)
          </p>
          <div className="vk-histogram" aria-hidden="true">
            {staven.map((n, i) => (
              <div key={i} className={focusStaven[i] > 0 ? "focus" : undefined} style={{ height: `${(n / piek) * 100}%` }} />
            ))}
          </div>
          <input
            type="range"
            className="vk-slider"
            aria-label="AHT-drempel in seconden"
            min={min}
            max={max}
            step={max - min > 100 ? 5 : 1}
            value={Math.min(max, Math.max(min, d))}
            onChange={(e) => onDrempel(Number(e.target.value))}
          />
          <p className="text-sm text-ink-m" style={{ margin: 0 }}>
            Drempel <strong>{d}</strong> · {onder} Organisaties op of onder de drempel, {ahtWaarden.length - onder} erboven · {ahtWaarden.length}{" "}
            van {leden.length} hebben de AHT ingevuld
          </p>
        </div>
      );
    }
  }

  return (
    <section className="qv-kaart" aria-label="Vergelijken">
      <h3>Vergelijken</h3>
      <p className="qv-kaart-sub">Groepeer de pool en kies de focusgroep. De rest is alle andere Organisaties in de pool.</p>
      <div className="vis-acties" style={{ marginBottom: "0.4rem" }}>
        <span className="text-sm text-ink-m">Groeperen op</span>
        <WeergaveWissel
          ariaLabel="Groeperen op"
          opties={[
            { waarde: "crm", label: "CRM-pakket" },
            { waarde: "sector", label: "Sector" },
            { waarde: "aht", label: "AHT-drempel" },
          ]}
          waarde={op}
          onChange={onOp}
        />
      </div>
      {slider}
      <p className="vk-veldkop">Focusgroep</p>
      <div className="vk-chips">
        {groepen.map((g) => (
          <button
            key={g.sleutel}
            type="button"
            className={`vk-chip vk-chip--focus ${g.leden.length < minGroep ? "vk-chip--klein" : ""}`}
            aria-pressed={g.sleutel === focusSleutel}
            onClick={() => onFocus(g.sleutel)}
          >
            {g.naam}
            <span>{g.leden.length}</span>
          </button>
        ))}
        {groepen.length === 0 && <span className="text-sm text-ink-s">Geen groepen: Geen Organisatie heeft dit veld ingevuld.</span>}
      </div>
      {focus && (focusLeden.length === 0 || restLeden.length === 0) && (
        <p className="admin-notice" style={{ marginTop: "0.9rem" }}>
          {focusLeden.length === 0 ? "De focus is leeg" : "De rest is leeg"}: Er is niets om te vergelijken. Pas de filters of de groepering aan.
        </p>
      )}
      {focus && focusLeden.length > 0 && restLeden.length > 0 && (klein(focusLeden.length) || klein(restLeden.length)) && (
        <p className="vk-waarschuwing" role="status">
          <span aria-hidden="true">⚠</span>
          <span>
            {klein(focusLeden.length) && klein(restLeden.length)
              ? `De focus telt ${focusLeden.length} en de rest ${restLeden.length} Organisaties`
              : klein(focusLeden.length)
                ? `De focus telt ${focusLeden.length} Organisaties`
                : `De rest telt ${restLeden.length} Organisaties`}
            . Lees verschillen voorzichtig: Bij zo weinig Organisaties kan een enkele uitschieter het gemiddelde bepalen.
          </span>
        </p>
      )}
    </section>
  );
}

/** De groepering die bij de keuze hoort. */
export function groepering(op: GroeperenOp, drempel: number | null, ahtMediaan: number | null): Groepering {
  if (op === "crm") return { soort: "select", veldId: CRM_VELD };
  if (op === "sector") return { soort: "select", veldId: SECTOR };
  return { soort: "drempel", veldId: AHT_VELD, drempel: drempel ?? ahtMediaan ?? 0 };
}
