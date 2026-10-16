"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import {
  Bruikbaarheid,
  FilterVeld,
  Groep,
  PoolLid,
  drempelStap,
  formatGetal,
  getalWaarden,
  histogram,
  mediaan,
  rondDrempel,
} from "@/lib/verkennen";

/** Een kenmerk als pil bij Groeperen op, met of het kan groeperen en de naam zoals die op de pil staat. */
export interface GroeperOptie {
  veld: FilterVeld;
  naam: string;
  bruikbaarheid: Bruikbaarheid;
}

/**
 * Vergelijken (`visualisatie-verkennen.md`, Groeperen en focus): Groeperen op is een pilvormige groep met één pil per kenmerk. Een
 * pil die niet kan is uitgeschakeld, met de reden in een tooltip en als regel eronder. Is er geen kenmerk toegevoegd, dan staat er
 * één losse, grijze pil "Geen kenmerk". Bij een getal staat de drempel met vier manieren om hem te kiezen (slider, invoerveld,
 * snelknoppen en klikken op een staaf), die elkaar bijwerken. Daarna de focusgroep als pillen met het aantal. Een groep met minder
 * dan `minGroep` organisaties is gestreept, en heeft de focus of de rest minder dan `waarschuwing`, dan staat er een
 * waarschuwing. Het is geen blokkade.
 */
export function Vergelijken({
  opties,
  heeftKenmerken,
  effectief,
  onKies,
  melding,
  leden,
  drempel,
  onDrempel,
  groepen,
  zonderWaarde,
  focusSleutel,
  onFocus,
  focusLeden,
  restLeden,
  minGroep,
  waarschuwing,
}: {
  opties: GroeperOptie[];
  heeftKenmerken: boolean;
  /** Het id van het kenmerk waarop nu gegroepeerd wordt, of `null` zonder groepering. */
  effectief: string | null;
  onKies: (id: string) => void;
  melding: string | null;
  leden: PoolLid[];
  drempel: number | null;
  onDrempel: (d: number) => void;
  groepen: Groep[];
  zonderWaarde: number;
  focusSleutel: string | undefined;
  onFocus: (sleutel: string) => void;
  focusLeden: PoolLid[];
  restLeden: PoolLid[];
  minGroep: number;
  waarschuwing: number;
}) {
  const [bereikMelding, setBereikMelding] = useState<string | null>(null);
  const gekozen = opties.find((o) => o.veld.id === effectief);
  const focus = groepen.find((g) => g.sleutel === focusSleutel);
  const focusIds = new Set(focus?.leden.map((l) => l.organisatie.id));
  const klein = (n: number) => n < waarschuwing;
  const eenheid = gekozen?.veld.eenheid ? ` ${gekozen.veld.eenheid}` : "";

  let slider = null;
  if (gekozen && gekozen.veld.type === "getal") {
    const waarden = getalWaarden(leden, gekozen.veld);
    if (waarden.length > 0) {
      const min = Math.min(...waarden);
      const max = Math.max(...waarden);
      const hele = waarden.every((w) => Number.isInteger(w));
      const stap = drempelStap(min, max, hele);
      // De slider loopt in afgeronde stappen: De uiteinden liggen op een veelvoud van de stap, zodat ze bereikbaar zijn.
      const sliderMin = Math.floor(min / stap) * stap;
      const sliderMax = Math.ceil(max / stap) * stap;
      const mediaanWaarde = rondDrempel(mediaan(waarden) ?? min, hele);
      const gemiddelde = rondDrempel(waarden.reduce((a, b) => a + b, 0) / waarden.length, hele);
      const d = drempel ?? mediaanWaarde;
      const staven = histogram(waarden, min, max);
      const piek = Math.max(1, ...staven);
      const lid = (w: number) => (max <= min ? 0 : Math.min(staven.length - 1, Math.floor(((w - min) / (max - min)) * staven.length)));
      // Een staaf is "focus" als de focusgroep Organisaties heeft in dat bereik.
      const focusStaven = new Array<number>(staven.length).fill(0);
      for (const l of leden) {
        const w = getalWaarden([l], gekozen.veld)[0];
        if (w !== undefined && focusIds.has(l.organisatie.id)) focusStaven[lid(w)] += 1;
      }
      const onder = waarden.filter((w) => w <= d).length;
      const stel = (n: number) => {
        setBereikMelding(null);
        onDrempel(n);
      };
      const stelUitInvoer = (tekst: string) => {
        if (tekst.trim() === "") return;
        const n = Number(tekst.replace(",", "."));
        if (!Number.isFinite(n)) return;
        if (n < min || n > max) {
          const dichtstbij = n < min ? min : max;
          onDrempel(dichtstbij);
          setBereikMelding(`Dit kenmerk loopt in de pool van ${formatGetal(min, 1)} tot ${formatGetal(max, 1)}.`);
        } else {
          stel(n);
        }
      };
      // Shift met de pijltjestoetsen verschuift tien stappen in plaats van één.
      const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!e.shiftKey || (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
        e.preventDefault();
        const richting = e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 1;
        stel(Math.min(sliderMax, Math.max(sliderMin, d + richting * 10 * stap)));
      };
      slider = (
        <div style={{ marginTop: "0.8rem" }}>
          <p className="vk-veldkop" style={{ marginTop: 0 }}>
            {gekozen.naam}
            {gekozen.veld.eenheid ? ` (${gekozen.veld.eenheid})` : ""}
          </p>
          <div className="vk-histogram">
            {staven.map((n, i) => {
              // Klikken op een staaf zet de drempel op de bovengrens van die staaf.
              const boven = rondDrempel(min + ((i + 1) * (max - min)) / staven.length, hele);
              return (
                <button
                  key={i}
                  type="button"
                  className={focusStaven[i] > 0 ? "focus" : undefined}
                  style={{ height: `${(n / piek) * 100}%` }}
                  aria-label={`Drempel op ${formatGetal(boven, 1)}${eenheid}, ${n} Organisaties in deze staaf`}
                  title={`Drempel op ${formatGetal(boven, 1)}${eenheid}`}
                  onClick={() => stel(boven)}
                />
              );
            })}
          </div>
          <input
            type="range"
            className="vk-slider"
            aria-label={`${gekozen.naam}, drempel`}
            min={sliderMin}
            max={sliderMax}
            step={stap}
            value={Math.min(sliderMax, Math.max(sliderMin, d))}
            onChange={(e) => stel(Number(e.target.value))}
            onKeyDown={onKeyDown}
          />
          <div className="vk-drempel-rij">
            <label className="vk-drempel-invoer">
              <span className="text-sm text-ink-m">Drempel</span>
              <input
                type="number"
                step={hele ? 1 : 0.1}
                value={d}
                aria-label={`${gekozen.naam}, drempel exact`}
                onChange={(e) => stelUitInvoer(e.target.value)}
              />
              {gekozen.veld.eenheid && <span className="text-sm text-ink-m">{gekozen.veld.eenheid}</span>}
            </label>
            <button type="button" className="pil" aria-pressed={d === mediaanWaarde} onClick={() => stel(mediaanWaarde)}>
              Mediaan <span>{formatGetal(mediaanWaarde, 1)}</span>
            </button>
            <button type="button" className="pil" aria-pressed={d === gemiddelde} onClick={() => stel(gemiddelde)}>
              Gemiddelde <span>{formatGetal(gemiddelde, 1)}</span>
            </button>
          </div>
          {bereikMelding && <p className="vk-reden">{bereikMelding}</p>}
          <p className="text-sm text-ink-m" style={{ margin: "var(--sp-2) 0 0" }}>
            Drempel <strong>{formatGetal(d, 1)}{eenheid}</strong> · {onder} Organisaties op of onder de drempel, {waarden.length - onder} erboven ·{" "}
            {waarden.length} van {leden.length} hebben dit ingevuld
          </p>
        </div>
      );
    }
  }

  const uitgeschakeld = opties.filter((o) => !o.bruikbaarheid.ok);

  return (
    <section className="qv-kaart" aria-label="Vergelijken">
      <h3>Vergelijken</h3>
      <p className="qv-kaart-sub">Groepeer de pool en kies de focusgroep. De rest zijn de Organisaties van de andere groepen.</p>

      <div className="vis-acties" style={{ marginBottom: "0.4rem" }}>
        <span className="text-sm text-ink-m">Groeperen op</span>
        <InfoIcoon naastVeld sleutel="info.verkennenGroeperen" />
        {opties.length === 0 ? (
          <button type="button" className="pil" disabled>
            Geen kenmerk
          </button>
        ) : (
          <WeergaveWissel
            ariaLabel="Groeperen op"
            opties={opties.map((o) => ({
              waarde: o.veld.id,
              label: o.naam,
              disabled: !o.bruikbaarheid.ok,
              title: o.bruikbaarheid.reden,
            }))}
            // Zonder bruikbaar kenmerk is er geen gekozen pil: De groep toont dan alleen uitgeschakelde pillen.
            waarde={effectief ?? ""}
            onChange={onKies}
          />
        )}
      </div>
      {!heeftKenmerken && <p className="vk-reden">Voeg bij Kenmerken een kenmerk toe om te beginnen.</p>}
      {uitgeschakeld.map((o) => (
        <p key={o.veld.id} className="vk-reden">
          {o.naam}: {o.bruikbaarheid.reden}
        </p>
      ))}
      {melding && (
        <p className="vk-waarschuwing" role="status">
          <span aria-hidden="true">⚠</span>
          <span>{melding}</span>
        </p>
      )}
      {slider}

      {effectief !== null && (
        <>
          <p className="vk-veldkop">Focusgroep</p>
          <div className="vk-chips">
            {groepen.map((g) => (
              <button
                key={g.sleutel}
                type="button"
                className={`pil ${g.leden.length < minGroep ? "pil--klein" : ""}`}
                title={g.volledigeNaam}
                aria-pressed={g.sleutel === focusSleutel}
                onClick={() => onFocus(g.sleutel)}
              >
                {g.naam}
                <span>{g.leden.length}</span>
              </button>
            ))}
            {groepen.length === 0 && <span className="text-sm text-ink-s">Geen groepen: Geen Organisatie heeft dit kenmerk ingevuld.</span>}
          </div>
          {zonderWaarde > 0 && <p className="vk-reden">{zonderWaarde} zonder waarde</p>}
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
        </>
      )}
    </section>
  );
}
