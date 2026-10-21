"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magGebruikersBeheren } from "@/lib/rechten";
import { useInstellingen, zetInstellingen } from "@/lib/instellingen-store";

interface VerkennenVeld {
  sleutel: "verkennenMinGroep" | "verkennenMinVergelijking" | "verkennenMinPool" | "verkennenMaxGroepen" | "verkennenMinIngevuldPct";
  label: string;
  uitleg: string;
  max?: number;
  /** Ondergrens van het veld: 1, of 0 bij het percentage (dan geldt geen ondergrens voor de invulling). */
  min: number;
}

const VERKENNEN_VELDEN: VerkennenVeld[] = [
  {
    sleutel: "verkennenMinGroep",
    min: 1,
    label: "Organisaties in een groep, minimum",
    uitleg: "Een kleinere groep is gestreept en krijgt geen cijfers in de heatmap. Ook het minimum voor het verband.",
  },
  {
    sleutel: "verkennenMinVergelijking",
    min: 1,
    label: "Organisaties in focus of rest, waarschuwing",
    uitleg: "Een kleinere focus of rest krijgt een waarschuwing. Geen blokkade.",
  },
  {
    sleutel: "verkennenMinPool",
    min: 1,
    label: "Organisaties in de pool, minimum",
    uitleg: "In een kleinere pool kan er niet gegroepeerd worden.",
  },
  {
    sleutel: "verkennenMaxGroepen",
    min: 1,
    label: "Waarden per kenmerk, maximum",
    uitleg: "Een keuzelijst met meer waarden kan niet groeperen.",
  },
  {
    sleutel: "verkennenMinIngevuldPct",
    min: 0,
    label: "Kenmerk ingevuld, minimum (%)",
    uitleg: "Een kenmerk dat bij een lager percentage is ingevuld kan niet groeperen. Bij 0 geldt geen ondergrens.",
    max: 100,
  },
];

/**
 * Drempels en termijnen (`beheerpagina.md`, punt 10, heette eerder Instellingen), Admin-only, een tab onder Instellingen
 * in het Accountmenu. Nu de
 * bewaartermijn van ingevulde scans en de verlengtermijn: Eén globale waarde voor de
 * hele applicatie, geen instelling per organisatie. De lijst "Data ouder dan de
 * bewaartermijn" die eruit volgt staat bij Organisaties (punt 4), ook voor een Consultant.
 * De sessieduur voor respondenten en Leads volgt met e-mailverificatie en de backend.
 */
export default function DrempelsEnTermijnenPage() {
  const gebruiker = useIngelogdeGebruiker();
  const instellingen = useInstellingen();
  const [bewaarInput, setBewaarInput] = useState<string | null>(null);
  const [verlengInput, setVerlengInput] = useState<string | null>(null);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [minOrgInput, setMinOrgInput] = useState<string | null>(null);
  const [minScansInput, setMinScansInput] = useState<string | null>(null);
  const [minRespondentenInput, setMinRespondentenInput] = useState<string | null>(null);
  const [maxDagenInput, setMaxDagenInput] = useState<string | null>(null);
  const [benchmarkOpgeslagen, setBenchmarkOpgeslagen] = useState(false);
  const [verkennenInput, setVerkennenInput] = useState<Record<string, string>>({});
  const [verkennenOpgeslagen, setVerkennenOpgeslagen] = useState(false);
  const [spanningInput, setSpanningInput] = useState<string | null>(null);
  const [spanningOpgeslagen, setSpanningOpgeslagen] = useState(false);

  if (!magGebruikersBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet Drempels en termijnen.</p>
      </div>
    );
  }

  const bewaar = bewaarInput ?? String(instellingen.bewaarTermijnDagen ?? "");
  const verleng = verlengInput ?? String(instellingen.verlengTermijnDagen ?? "");

  const minOrg = minOrgInput ?? String(instellingen.benchmarkMinOrganisaties);
  const minScans = minScansInput ?? String(instellingen.benchmarkMinScans);
  const minRespondenten = minRespondentenInput ?? String(instellingen.benchmarkMinRespondenten);
  const maxDagen = maxDagenInput ?? String(instellingen.benchmarkMaxDagenTussenMetingen);
  const geheelGetalVanMinstens1 = (v: string) => v.trim() !== "" && Number.isInteger(Number(v)) && Number(v) >= 1;
  const benchmarkGeldig = [minOrg, minScans, minRespondenten, maxDagen].every(geheelGetalVanMinstens1);

  function handleBenchmarkOpslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!benchmarkGeldig) return;
    zetInstellingen({
      benchmarkMinOrganisaties: Number(minOrg),
      benchmarkMinScans: Number(minScans),
      benchmarkMinRespondenten: Number(minRespondenten),
      benchmarkMaxDagenTussenMetingen: Number(maxDagen),
    });
    setMinOrgInput(null);
    setMinScansInput(null);
    setMinRespondentenInput(null);
    setMaxDagenInput(null);
    setBenchmarkOpgeslagen(true);
    setTimeout(() => setBenchmarkOpgeslagen(false), 1600);
  }

  // De vijf grenzen van Verkennen (`visualisatie-verkennen.md`, Drempels): Gehele getallen van minstens 1, het percentage tot en met 100.
  const verkennenWaarde = (veld: VerkennenVeld) => verkennenInput[veld.sleutel] ?? String(instellingen[veld.sleutel]);
  const verkennenGeldig = VERKENNEN_VELDEN.every((v) => {
    const w = verkennenWaarde(v);
    return w.trim() !== "" && Number.isInteger(Number(w)) && Number(w) >= v.min && (v.max === undefined || Number(w) <= v.max);
  });

  function handleVerkennenOpslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!verkennenGeldig) return;
    zetInstellingen(Object.fromEntries(VERKENNEN_VELDEN.map((v) => [v.sleutel, Number(verkennenWaarde(v))])));
    setVerkennenInput({});
    setVerkennenOpgeslagen(true);
    setTimeout(() => setVerkennenOpgeslagen(false), 1600);
  }

  // De Spanningsmeter (`datamodel.md`, Instellingen): Eén geheel getal van minstens 1.
  const spanningMin = spanningInput ?? String(instellingen.spanningMinPerRol);
  const spanningGeldig = geheelGetalVanMinstens1(spanningMin);

  function handleSpanningOpslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!spanningGeldig) return;
    zetInstellingen({ spanningMinPerRol: Number(spanningMin) });
    setSpanningInput(null);
    setSpanningOpgeslagen(true);
    setTimeout(() => setSpanningOpgeslagen(false), 1600);
  }

  function handleOpslaan(e: React.FormEvent) {
    e.preventDefault();
    zetInstellingen({
      bewaarTermijnDagen: bewaar.trim() ? Number(bewaar) : null,
      verlengTermijnDagen: verleng.trim() ? Number(verleng) : null,
    });
    setBewaarInput(null);
    setVerlengInput(null);
    setOpgeslagen(true);
    setTimeout(() => setOpgeslagen(false), 1600);
  }

  return (
    <div className="admin-main">
      <h1>Drempels en termijnen</h1>

      {instellingen.bewaarTermijnDagen === null && (
        <p className="admin-notice" style={{ marginTop: "1rem" }}>
          De bewaartermijn is nog niet ingesteld. Zolang dat zo is, toont de lijst &quot;Data ouder dan de
          bewaartermijn&quot; niets.
        </p>
      )}

      <h2 style={{ marginTop: "2rem" }}>Bewaartermijn ingevulde scans</h2>
      <form onSubmit={handleOpslaan} className="flex flex-wrap items-end gap-3">
        <div className="admin-field" style={{ marginBottom: 0, maxWidth: "12rem", minWidth: 0 }}>
          <label>Bewaartermijn (dagen)</label>
          <input
            type="number"
            min={1}
            value={bewaar}
            onChange={(e) => setBewaarInput(e.target.value)}
            placeholder="Geen termijn ingesteld"
          />
        </div>
        <div className="admin-field" style={{ marginBottom: 0, maxWidth: "12rem", minWidth: 0 }}>
          <label>Verlengtermijn (dagen)</label>
          <input
            type="number"
            min={1}
            value={verleng}
            onChange={(e) => setVerlengInput(e.target.value)}
            placeholder="Nog niet ingesteld"
          />
        </div>
        <span className="knop-met-icoon">
          <button type="submit" className="btn btn-or btn-compact">
            Opslaan
          </button>
          <InfoIcoon naastVeld sleutel="info.bewaartermijn" />
          {opgeslagen && <span className="text-sm text-ink-m">Opgeslagen ✓</span>}
        </span>
      </form>

      <h2 style={{ marginTop: "2rem" }}>Benchmark</h2>
      <form onSubmit={handleBenchmarkOpslaan} className="flex flex-wrap items-end gap-3">
        <div className="admin-field" style={{ marginBottom: 0, maxWidth: "14rem", minWidth: 0 }}>
          <label>Groepsgrootte, organisaties</label>
          <input type="number" min={1} step={1} value={minOrg} onChange={(e) => setMinOrgInput(e.target.value)} />
        </div>
        <div className="admin-field" style={{ marginBottom: 0, maxWidth: "14rem", minWidth: 0 }}>
          <label>Scans in een Meting</label>
          <input type="number" min={1} step={1} value={minRespondenten} onChange={(e) => setMinRespondentenInput(e.target.value)} />
        </div>
        <div className="admin-field" style={{ marginBottom: 0, maxWidth: "14rem", minWidth: 0 }}>
          <label>Scans per gekozen Meting</label>
          <input type="number" min={1} step={1} value={minScans} onChange={(e) => setMinScansInput(e.target.value)} />
        </div>
        <div className="admin-field" style={{ marginBottom: 0, maxWidth: "14rem", minWidth: 0 }}>
          <label>Dagen tussen Metingen, naast elkaar</label>
          <input type="number" min={1} step={1} value={maxDagen} onChange={(e) => setMaxDagenInput(e.target.value)} />
        </div>
        <span className="knop-met-icoon">
          <button type="submit" className="btn btn-or btn-compact" disabled={!benchmarkGeldig}>
            Opslaan
          </button>
          <InfoIcoon naastVeld sleutel="info.benchmarkInstellingen" />
          {benchmarkOpgeslagen && <span className="text-sm text-ink-m">Opgeslagen ✓</span>}
        </span>
      </form>

      <h2 style={{ marginTop: "2rem" }}>Verkennen</h2>
      <form onSubmit={handleVerkennenOpslaan}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-4)", alignItems: "flex-start" }}>
          {VERKENNEN_VELDEN.map((v) => (
            <div key={v.sleutel} className="admin-field" style={{ marginBottom: 0, width: "13rem", minWidth: 0 }}>
              <label htmlFor={`verkennen-${v.sleutel}`}>{v.label}</label>
              <input
                id={`verkennen-${v.sleutel}`}
                type="number"
                min={v.min}
                max={v.max}
                step={1}
                value={verkennenWaarde(v)}
                onChange={(e) => setVerkennenInput({ ...verkennenInput, [v.sleutel]: e.target.value })}
              />
              <p className="text-xs text-ink-s" style={{ margin: "var(--sp-1) 0 0" }}>
                {v.uitleg}
              </p>
            </div>
          ))}
        </div>
        <span className="knop-met-icoon" style={{ marginTop: "var(--sp-4)" }}>
          <button type="submit" className="btn btn-or btn-compact">
            Opslaan
          </button>
          <InfoIcoon naastVeld sleutel="info.verkennenInstellingen" />
          {!verkennenGeldig && (
            <span className="text-sm" style={{ color: "var(--stat-red)", whiteSpace: "normal" }}>
              Vul bij elk veld een geheel getal van minstens 1 in (bij het percentage mag 0). Het percentage kan niet boven 100.
            </span>
          )}
          {verkennenOpgeslagen && <span className="text-sm text-ink-m">Opgeslagen ✓</span>}
        </span>
      </form>

      <h2 style={{ marginTop: "2rem" }}>Spanningsmeter</h2>
      <form onSubmit={handleSpanningOpslaan} className="flex flex-wrap items-end gap-3">
        <div className="admin-field" style={{ marginBottom: 0, maxWidth: "14rem", minWidth: 0 }}>
          <label htmlFor="spanning-min-per-rol">Scans per rol, minimum</label>
          <input
            id="spanning-min-per-rol"
            type="number"
            min={1}
            step={1}
            value={spanningMin}
            onChange={(e) => setSpanningInput(e.target.value)}
          />
        </div>
        <span className="knop-met-icoon">
          <button type="submit" className="btn btn-or btn-compact" disabled={!spanningGeldig}>
            Opslaan
          </button>
          <InfoIcoon naastVeld sleutel="info.spanningMinPerRol" />
          {spanningOpgeslagen && <span className="text-sm text-ink-m">Opgeslagen ✓</span>}
        </span>
      </form>
    </div>
  );
}
