"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { useInstellingen } from "@/lib/instellingen-store";
import { bewaarKorteNamen, MAX_KORTE_NAAM } from "@/lib/korte-namen";
import { gevolgenKanaal, maakKanaal, maakKpi, vlagBlokkade, verwijderKanaal, wijzigKpis } from "@/lib/kpi-beheer";

interface Concept {
  id: string | null;
  naam: string;
  eenheid: string;
  perOnderdeel: boolean;
  perKanaal: boolean;
  korteNaam: string;
}

/**
 * De tab KPI's en kanalen op de pagina Organisatievelden (`beheerpagina.md`, punt 3, KPI's en kanalen), alleen voor een Admin
 * (`content.beheren`). De kaart KPI's heeft een tabel met naam, eenheid, de vinkjes Per onderdeel en Per kanaal en een korte naam, die
 * op Opslaan wordt bewaard. De kaart Kanalen heeft verwijderbare pillen en een veld om een kanaal toe te voegen, dat direct gebeurt.
 */
export function KpiDefinitiesBeheer() {
  const { kpiDefinities, kanalen, korteNamen } = useInstellingen();
  const kpis = [...kpiDefinities].sort((a, b) => a.volgorde - b.volgorde);
  const basis: Concept[] = kpis.map((k) => ({
    id: k.id,
    naam: k.naam,
    eenheid: k.eenheid ?? "",
    perOnderdeel: k.perOnderdeel,
    perKanaal: k.perKanaal,
    korteNaam: korteNamen.velden[`kpis.${k.id}`] ?? "",
  }));
  // `null`: Geen wijziging, dan geldt de opgeslagen stand. Nieuwe KPI's staan er alleen in het concept in.
  const [concept, setConcept] = useState<Concept[] | null>(null);
  const rijen = concept ?? basis;
  const [fout, setFout] = useState<string | null>(null);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [nieuwKanaal, setNieuwKanaal] = useState("");
  const [kanaalFout, setKanaalFout] = useState<string | null>(null);
  const [kanaalWeg, setKanaalWeg] = useState<string | null>(null);

  const wijzig = (index: number, patch: Partial<Concept>) => {
    setOpgeslagen(false);
    setFout(null);
    setConcept(rijen.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  function opslaan() {
    setFout(null);
    const wijzigingen: Record<string, { naam: string; eenheid: string | null; perOnderdeel: boolean; perKanaal: boolean }> = {};
    const nieuweIds = new Map<number, string>();
    // Eerst de nieuwe KPI's aanmaken, zodat ze een id hebben.
    for (const [i, r] of rijen.entries()) {
      if (r.id !== null) continue;
      const m = maakKpi(r.naam);
      if (!m.ok) return setFout(m.reden);
      nieuweIds.set(i, m.kpi.id);
    }
    for (const [i, r] of rijen.entries()) {
      const id = r.id ?? nieuweIds.get(i)!;
      wijzigingen[id] = { naam: r.naam, eenheid: r.eenheid.trim() || null, perOnderdeel: r.perOnderdeel, perKanaal: r.perKanaal };
    }
    const w = wijzigKpis(wijzigingen);
    if (!w.ok) return setFout(w.reden);
    // De korte namen horen bij het veld `kpis.<id>` (`datamodel.md`, KPI's en kanalen).
    bewaarKorteNamen(
      rijen.map((r, i) => {
        const id = r.id ?? nieuweIds.get(i)!;
        return { soort: "veldnaam" as const, veldId: `kpis.${id}`, veldLabel: `KPI's › ${r.naam}`, origineel: `KPI's › ${r.naam}`, korteNaam: r.korteNaam, inGebruik: 0 };
      }),
      korteNamen
    );
    setConcept(null);
    setOpgeslagen(true);
  }

  function voegKanaalToe(e: React.FormEvent) {
    e.preventDefault();
    const r = maakKanaal(nieuwKanaal);
    if (!r.ok) return setKanaalFout(r.reden);
    setNieuwKanaal("");
    setKanaalFout(null);
  }

  const weg = kanaalWeg ? kanalen.find((k) => k.id === kanaalWeg) : undefined;
  const gevolgen = kanaalWeg ? gevolgenKanaal(kanaalWeg) : { waarden: 0, organisaties: 0 };

  return (
    <div className="kpi-beheer">
      <section className="kpi-blok" aria-label="KPI's">
        <div className="kpi-kop">
          <div className="titel-rij">
            <h2 style={{ margin: 0 }}>KPI&apos;s</h2>
            <InfoIcoon sleutel="info.kpiDefinities" />
          </div>
          <button
            type="button"
            className="btn btn-or btn-compact"
            onClick={() => {
              setOpgeslagen(false);
              setConcept([...rijen, { id: null, naam: "", eenheid: "", perOnderdeel: false, perKanaal: false, korteNaam: "" }]);
            }}
          >
            + KPI toevoegen
          </button>
        </div>
        <div className="kpi-tabel-wrap">
          <table className="kpi-tabel kpi-definities">
            <thead>
              <tr>
                <th className="kpi-eerste">Naam</th>
                <th style={{ textAlign: "left" }}>Eenheid</th>
                <th>Per onderdeel</th>
                <th>Per kanaal</th>
                <th style={{ textAlign: "left" }}>Korte naam</th>
              </tr>
            </thead>
            <tbody>
              {rijen.map((r, i) => {
                const blokOnderdeel = r.id ? vlagBlokkade(r.id, "onderdeel") : 0;
                const blokKanaal = r.id ? vlagBlokkade(r.id, "kanaal") : 0;
                return (
                  <tr key={r.id ?? `nieuw-${i}`}>
                    <td className="kpi-eerste">
                      <input type="text" className="kpi-tekst" aria-label="Naam van de KPI" value={r.naam} onChange={(e) => wijzig(i, { naam: e.target.value })} />
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <input type="text" className="kpi-tekst kpi-tekst--smal" aria-label={`Eenheid van ${r.naam}`} value={r.eenheid} onChange={(e) => wijzig(i, { eenheid: e.target.value })} />
                    </td>
                    <td>
                      <span className="kpi-vinkje">
                        <input
                          type="checkbox"
                          aria-label={`${r.naam} per onderdeel`}
                          checked={r.perOnderdeel}
                          disabled={r.perOnderdeel && blokOnderdeel > 0}
                          onChange={(e) => wijzig(i, { perOnderdeel: e.target.checked })}
                        />
                        {r.perOnderdeel && blokOnderdeel > 0 && (
                          <InfoIcoon naastVeld sleutel="info.kpiDefinities" voorloop={`Er staan ${blokOnderdeel} waarden per onderdeel. Verwijder die eerst.`} />
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="kpi-vinkje">
                        <input
                          type="checkbox"
                          aria-label={`${r.naam} per kanaal`}
                          checked={r.perKanaal}
                          disabled={r.perKanaal && blokKanaal > 0}
                          onChange={(e) => wijzig(i, { perKanaal: e.target.checked })}
                        />
                        {r.perKanaal && blokKanaal > 0 && (
                          <InfoIcoon naastVeld sleutel="info.kpiDefinities" voorloop={`Er staan ${blokKanaal} waarden per kanaal. Verwijder die eerst.`} />
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <input
                        type="text"
                        className="kpi-tekst kpi-tekst--smal"
                        aria-label={`Korte naam van ${r.naam}`}
                        placeholder={r.naam}
                        maxLength={MAX_KORTE_NAAM}
                        value={r.korteNaam}
                        onChange={(e) => wijzig(i, { korteNaam: e.target.value })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {fout && (
          <p className="overzicht-melding fout" role="alert">
            {fout}
          </p>
        )}
        <div className="btn-rij" style={{ marginTop: "var(--sp-4)", maxWidth: "22rem" }}>
          <button type="button" className="btn btn-or btn-compact" disabled={concept === null} onClick={opslaan}>
            Opslaan
          </button>
          <button type="button" className="btn btn-outline btn-compact" disabled={concept === null} onClick={() => setConcept(null)}>
            Annuleren
          </button>
          <span className={`admin-save-state ${opgeslagen ? "zichtbaar" : ""}`}>Opgeslagen ✓</span>
        </div>
      </section>

      <section className="kpi-blok" aria-label="Kanalen">
        <div className="titel-rij" style={{ marginBottom: "var(--sp-4)" }}>
          <h2 style={{ margin: 0 }}>Kanalen</h2>
          <InfoIcoon sleutel="info.kanalen" />
        </div>
        <div className="vk-chips" style={{ margin: 0 }}>
          {[...kanalen]
            .sort((a, b) => a.volgorde - b.volgorde)
            .map((k) => (
              <button key={k.id} type="button" className="pil" aria-label={`${k.naam} verwijderen`} onClick={() => setKanaalWeg(k.id)}>
                {k.naam}
                <span aria-hidden="true">×</span>
              </button>
            ))}
        </div>
        <form onSubmit={voegKanaalToe} className="kpi-kanaal-toevoegen">
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label htmlFor="nieuw-kanaal">Nieuw kanaal</label>
            <input id="nieuw-kanaal" type="text" value={nieuwKanaal} aria-invalid={kanaalFout ? true : undefined} onChange={(e) => { setNieuwKanaal(e.target.value); setKanaalFout(null); }} />
            {kanaalFout && (
              <span className="text-xs" style={{ color: "var(--stat-red)" }} role="alert">
                {kanaalFout}
              </span>
            )}
          </div>
          <button type="submit" className="btn btn-or btn-compact">
            + Kanaal toevoegen
          </button>
        </form>
      </section>

      <BevestigModal
        open={weg !== undefined}
        titel="Kanaal verwijderen"
        bericht={
          gevolgen.waarden > 0
            ? `Het kanaal "${weg?.naam}" wordt verwijderd, met ${gevolgen.waarden} ${gevolgen.waarden === 1 ? "KPI-waarde" : "KPI-waarden"} bij ${gevolgen.organisaties} ${gevolgen.organisaties === 1 ? "Organisatie" : "Organisaties"}. Dit kan niet ongedaan worden gemaakt.`
            : `Het kanaal "${weg?.naam}" wordt verwijderd. Er staan geen waarden bij. Dit kan niet ongedaan worden gemaakt.`
        }
        onBevestigen={() => {
          if (kanaalWeg) verwijderKanaal(kanaalWeg);
          setKanaalWeg(null);
        }}
        onAnnuleren={() => setKanaalWeg(null)}
      />
    </div>
  );
}
