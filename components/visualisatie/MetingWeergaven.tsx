"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Assessment, Organisatie, ScanUitvoering } from "@/lib/types";
import { useInstellingen } from "@/lib/instellingen-store";
import { useBenchmarks } from "@/lib/benchmark-store";
import { aantalAfgerond } from "@/lib/benchmark";
import { eenMeting, spreiding, tussenMetingen } from "@/lib/visualisatie";
import { DropdownKnop } from "@/components/DropdownKnop";
import { WeergaveWissel } from "./WeergaveWissel";
import { WeergaveBouwblok } from "./WeergaveBouwblok";
import { WeergaveSpreiding } from "./WeergaveSpreiding";
import { WeergaveVergelijking } from "./WeergaveVergelijking";

type Weergave = "overzicht" | "bouwblok" | "spreiding";

/**
 * De weergaven op de resultatenpagina van een Meting (`visualisatie-scores.md`, Navigatie): Overzicht (de bestaande pagina,
 * ongewijzigd), Per bouwblok (A) en Spreiding (B), met rechts de knop "Vergelijk met vorige Meting" (C). De gekozen weergave
 * staat in de adresbalk (`?weergave=bouwblok|spreiding`, `?vergelijk=<metingId>`), zodat de terugknop werkt en de link te
 * delen is. Wisselen is een knop en geen link.
 *
 * Een Lead krijgt Overzicht en Per bouwblok en de vergelijking. Spreiding is er voor hem alleen als een Admin die heeft
 * toegewezen (`benchmark.md`), dus `spreidingToegestaan` is dan uit. Voor een Lead staat de lijn van laagste tot hoogste
 * score pas aan vanaf `benchmarkMinRespondenten` (`toonBereik`).
 */
export function MetingWeergaven(props: Props) {
  return (
    <Suspense fallback={null}>
      <MetingWeergavenInhoud {...props} />
    </Suspense>
  );
}

interface Props {
  assessment: Assessment;
  organisatie: Organisatie;
  scanUitvoering: ScanUitvoering;
  /** De bestaande resultaten (classificatiecirkel, radar, staafdiagram, top 3), getoond bij Overzicht. */
  overzicht: React.ReactNode;
  /** Wie de weergave Spreiding mag zien: Admin en Consultant ja, een Lead alleen via een toegewezen view. */
  spreidingToegestaan: boolean;
  /** De lijn van laagste tot hoogste score: Voor een Admin altijd, voor een Lead pas vanaf `benchmarkMinRespondenten`. */
  bereikAltijd: boolean;
  /** Eerdere Metingen van dezelfde organisatie en hetzelfde Assessment waarmee deze Meting te vergelijken is. */
  eerdereMetingen: ScanUitvoering[];
  /** Alleen een Admin: De link "Bekijk in benchmark" als de organisatie of de Meting lid is van een benchmark. */
  toonBenchmarkLink: boolean;
}

function MetingWeergavenInhoud({
  assessment,
  organisatie,
  scanUitvoering,
  overzicht,
  spreidingToegestaan,
  bereikAltijd,
  eerdereMetingen,
  toonBenchmarkLink,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const zoek = useSearchParams();
  const instellingen = useInstellingen();
  const benchmarks = useBenchmarks();

  const weergaveParam = zoek.get("weergave");
  const weergave: Weergave =
    weergaveParam === "bouwblok" || (weergaveParam === "spreiding" && spreidingToegestaan) ? weergaveParam : "overzicht";
  const vergelijkId = zoek.get("vergelijk");

  const huidigeScans = aantalAfgerond(scanUitvoering);
  const vergelijkbaar = useMemo(
    () =>
      huidigeScans >= instellingen.benchmarkMinScans
        ? eerdereMetingen
            .filter((m) => aantalAfgerond(m) >= instellingen.benchmarkMinScans)
            .sort((a, b) => b.aangemaaktOp.localeCompare(a.aangemaaktOp))
        : [],
    [eerdereMetingen, huidigeScans, instellingen.benchmarkMinScans]
  );
  const vorige = vergelijkId ? vergelijkbaar.find((m) => m.id === vergelijkId) ?? null : null;

  function zet(wijziging: Record<string, string | null>) {
    const params = new URLSearchParams(zoek.toString());
    for (const [k, v] of Object.entries(wijziging)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const toonBereik = bereikAltijd || huidigeScans >= instellingen.benchmarkMinRespondenten;

  const benchmarkLinks = toonBenchmarkLink
    ? benchmarks.flatMap((b) => {
        const lid = b.leden.find((l) => l.metingId === scanUitvoering.id);
        if (!lid) return [];
        const niveau = b.niveau ?? "organisaties";
        if (niveau === "scans") return [];
        return [
          {
            label: b.naam,
            href: niveau === "metingen" ? `/beheer/benchmark/${b.id}/meting/${scanUitvoering.id}` : `/beheer/benchmark/${b.id}/organisatie/${organisatie.id}`,
          },
        ];
      })
    : [];

  /* ---------- C. Vergelijking ---------- */
  if (vorige) {
    const w = tussenMetingen(assessment, vorige.invullingen, scanUitvoering.invullingen);
    return (
      <div>
        <div className="vis-acties">
          <button type="button" className="btn btn-outline btn-compact" onClick={() => zet({ vergelijk: null })}>
            Vergelijking sluiten
          </button>
        </div>
        <WeergaveVergelijking assessment={assessment} weergave={w} vorigLabel={vorige.label} huidigLabel={scanUitvoering.label} />
      </div>
    );
  }

  const opties: { waarde: Weergave; label: string; disabled?: boolean }[] = [
    { waarde: "overzicht", label: "Overzicht" },
    { waarde: "bouwblok", label: "Per bouwblok" },
    ...(spreidingToegestaan ? [{ waarde: "spreiding" as Weergave, label: "Spreiding" }] : []),
  ];

  return (
    <div>
      <div className="vis-acties">
        <WeergaveWissel
          ariaLabel="Weergave van de resultaten"
          opties={opties}
          waarde={weergave}
          onChange={(w) => zet({ weergave: w === "overzicht" ? null : w })}
        />
        {vergelijkbaar.length === 1 && (
          <button type="button" className="btn btn-outline btn-compact" onClick={() => zet({ vergelijk: vergelijkbaar[0].id })}>
            Vergelijk met vorige Meting
          </button>
        )}
        {vergelijkbaar.length > 1 && (
          <DropdownKnop
            label="Vergelijk met vorige Meting"
            opties={vergelijkbaar.map((m) => ({ label: m.label, onClick: () => zet({ vergelijk: m.id }) }))}
          />
        )}
      </div>

      {weergave === "overzicht" && overzicht}
      {weergave === "bouwblok" && (
        <WeergaveBouwblok assessment={assessment} weergave={eenMeting(assessment, scanUitvoering.invullingen)} toonBereik={toonBereik} />
      )}
      {weergave === "spreiding" && (
        <WeergaveSpreiding assessment={assessment} weergave={spreiding(assessment, scanUitvoering.invullingen)} />
      )}

      {benchmarkLinks.length > 0 && (
        <p className="vis-onderschrift">
          Bekijk in benchmark:{" "}
          {benchmarkLinks.map((l, i) => (
            <span key={l.href}>
              {i > 0 && ", "}
              <Link href={l.href} className="tekst-link">
                {l.label}
              </Link>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
