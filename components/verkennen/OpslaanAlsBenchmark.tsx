"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { maakBenchmark } from "@/lib/benchmark-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";
import { useInstellingen } from "@/lib/instellingen-store";
import { maakFilterNamen } from "@/lib/verkenning-namen";
import { aantalOrganisatiesInLeden, filterRegels, filtersVanStand, redenNietOpslaan, voorgesteldeNaam } from "@/lib/verkenning-benchmark";
import { Assessment, Meetperiode, Organisatie, VerkenEenheid } from "@/lib/types";
import { FilterStand, PoolLid, meetperiodeTekst } from "@/lib/verkennen";

export const MAX_NAAM_BENCHMARK = 60;

/**
 * Opslaan als benchmark (`visualisatie-verkennen.md`, Opslaan als benchmark): Onder de teller in de kaart Kenmerken. De knop opent
 * een paneel met de naam (zichtbaar voor de Lead), de filters als regels en het aantal in de groep. Wat wordt bewaard zijn de
 * filters, de eenheid en het Assessment, niet de groepering, de focus of de uitkomst. Toewijzen aan een Lead gebeurt in het
 * Leads-venster van een Organisatie die erin zit.
 */
export function OpslaanAlsBenchmark({
  assessment,
  eenheid,
  meetperiode,
  stand,
  poolGrootte,
  gefilterd,
  organisaties,
}: {
  assessment: Assessment;
  eenheid: VerkenEenheid;
  /** Leeg: De meest recente Meting telt. */
  meetperiode?: Meetperiode | null;
  stand: FilterStand;
  /** De pool zonder filters, voor de reden als de knop uit staat. */
  poolGrootte: number;
  gefilterd: PoolLid[];
  organisaties: Organisatie[];
}) {
  const gebruiker = useIngelogdeGebruiker();
  const { korteNamen, verkennenMinPool } = useInstellingen();
  const [open, setOpen] = useState(false);
  const [naam, setNaam] = useState("");
  const [opgeslagen, setOpgeslagen] = useState<{ id: string; naam: string } | null>(null);

  if (!magBenchmarkBeheren(gebruiker)) return null;
  const eenheidWoord = eenheid === "onderdelen" ? "onderdelen" : "Organisaties";
  const reden = redenNietOpslaan(stand, poolGrootte, verkennenMinPool, eenheidWoord);
  const filters = filtersVanStand(stand);
  const namen = maakFilterNamen(korteNamen, organisaties);
  const regels = filterRegels(filters, namen);

  function openen() {
    if (!open) {
      const enkel = filters.length === 1 && filters[0].waarden.length === 1 && filters[0].kenmerk !== "__kanalen";
      setNaam(enkel ? voorgesteldeNaam([{ veld: filters[0].kenmerk, waarde: namen.waarde(filters[0].kenmerk, filters[0].waarden[0]) }]) : "");
    }
    setOpen(!open);
  }

  function opslaan() {
    if (!gebruiker || !naam.trim() || reden) return;
    const organisatieNamen = [...new Set(gefilterd.map((l) => l.organisatie.naam))];
    const b = maakBenchmark(
      {
        naam: naam.trim().slice(0, MAX_NAAM_BENCHMARK),
        niveau: "organisaties",
        soort: "verkenning",
        eenheid,
        filters,
        meetperiode,
        assessmentIds: [assessment.id],
        leden: [],
        aangemaaktDoor: gebruiker.id,
      },
      { assessmentNamen: [assessment.naam], organisatieNamen, filters: regels }
    );
    setOpgeslagen({ id: b.id, naam: b.naam });
    setOpen(false);
  }

  return (
    <div className="vk-opslaan">
      <div className="knop-met-icoon">
        <button type="button" className="btn btn-outline btn-compact" disabled={reden !== null} aria-expanded={open} onClick={openen}>
          Opslaan als benchmark
        </button>
        <InfoIcoon naastVeld sleutel="info.verkennenOpslaan" />
        {reden && <span className="text-xs text-ink-s" style={{ whiteSpace: "normal" }}>{reden}</span>}
      </div>
      {open && !reden && (
        <div className="vk-opslaan-paneel">
          <div className="admin-field" style={{ marginBottom: 0, maxWidth: "28rem" }}>
            <label htmlFor="benchmark-naam">Naam (zichtbaar voor de Lead)</label>
            <input
              id="benchmark-naam"
              type="text"
              maxLength={MAX_NAAM_BENCHMARK}
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              autoFocus
            />
            <span className="text-xs text-ink-s">
              {naam.length} van {MAX_NAAM_BENCHMARK} tekens
            </span>
          </div>
          <div>
            <p className="vk-veldkop" style={{ marginTop: 0 }}>
              Filters
            </p>
            <ul className="vk-regels">
              {regels.map((r) => (
                <li key={r}>{r}</li>
              ))}
              {meetperiode && <li>Meetperiode {meetperiodeTekst(meetperiode)}</li>}
            </ul>
          </div>
          <p className="text-sm text-ink-m" style={{ margin: 0 }}>
            Nu {gefilterd.length} {eenheidWoord} in de groep
            {eenheid === "onderdelen" ? ` van ${aantalOrganisatiesInLeden(gefilterd.map((l) => ({ organisatieId: l.organisatie.id, assessmentId: "", metingId: "" })))} Organisaties` : ""}. De
            Lead ziet de eigen scores tegenover de rest van de groep. Alleen de eigen Organisatie en haar onderdelen staan met naam in beeld.
          </p>
          <div className="btn-rij" style={{ maxWidth: "22rem" }}>
            <button type="button" className="btn btn-or btn-compact" disabled={!naam.trim()} onClick={opslaan}>
              Opslaan
            </button>
            <button type="button" className="btn btn-outline btn-compact" onClick={() => setOpen(false)}>
              Annuleren
            </button>
          </div>
        </div>
      )}
      {opgeslagen && (
        <p className="vk-opgeslagen" role="status">
          Opgeslagen als <strong>{opgeslagen.naam}</strong>. Wijs hem toe in het Leads-venster van een Organisatie die erin zit.{" "}
          <Link href={`/beheer/benchmark/${opgeslagen.id}`}>Bekijk de benchmark</Link>
        </p>
      )}
    </div>
  );
}
