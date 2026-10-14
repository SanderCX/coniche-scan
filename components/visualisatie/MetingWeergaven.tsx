"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Assessment, Organisatie, ScanInvulling, ScanUitvoering } from "@/lib/types";
import { useInstellingen } from "@/lib/instellingen-store";
import { useBenchmarks } from "@/lib/benchmark-store";
import {
  aantalAfgerondInMeting,
  gemiddeldeAntwoordenVoorMetingMetSamenstelling,
  isSamengesteld,
  vergelijkbareMetingen,
  voldoetAanMinScans,
} from "@/lib/rondes";
import { antwoordenPerVraag, eenMeting, spreiding, tussenMetingen } from "@/lib/visualisatie";
import { DropdownKnop } from "@/components/DropdownKnop";
import { InfoIcoon } from "@/components/InfoIcoon";
import { WeergaveWissel } from "./WeergaveWissel";
import { WeergaveBouwblok } from "./WeergaveBouwblok";
import { WeergaveSpreiding } from "./WeergaveSpreiding";
import { WeergaveAntwoorden } from "./WeergaveAntwoorden";
import { WeergaveVergelijking } from "./WeergaveVergelijking";

type Weergave = "overzicht" | "bouwblok" | "spreiding" | "antwoorden";

/**
 * De weergaven op de resultatenpagina van een Meting (`visualisatie-scores.md`, Navigatie): Overzicht (de bestaande pagina,
 * ongewijzigd), Per bouwblok (A) en Spreiding (B), met rechts de knop "Vergelijk met vorige Meting" (C). De gekozen weergave
 * staat in de adresbalk (`?weergave=bouwblok|spreiding`, `?vergelijk=<metingId>`), zodat de terugknop werkt en de link te
 * delen is. Wisselen is een knop en geen link.
 *
 * Admin en Consultant zien daarnaast Antwoorden (G, `antwoordenToegestaan`): De antwoorden per vraag en per respondent, met naam.
 * Een Lead ziet die weergave alleen met het vinkje Antwoorden (en zonder namen als de organisatie dat niet heeft afgesproken,
 * `antwoordenAnoniem`). Een Lead krijgt Overzicht en Per bouwblok en de vergelijking. Spreiding is er voor hem alleen als een Admin die heeft
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
  /** Wie de weergave Antwoorden (G) mag zien: Een Admin en Consultant, en een Lead met het vinkje in de tabel Leads. */
  antwoordenToegestaan: boolean;
  /** Antwoorden zonder namen (R1 tot en met Rn): Voor een Lead als `Organisatie.antwoordenMetNamen` uit staat. */
  antwoordenAnoniem?: boolean;
  /** De lijn van laagste tot hoogste score: Voor een Admin altijd, voor een Lead pas vanaf `benchmarkMinRespondenten`. */
  bereikAltijd: boolean;
  /**
   * Alleen deze Metingen zijn te vergelijken (voor een Lead: De Metingen waarop hij ook bereik heeft). Zonder deze lijst zijn
   * dat alle eerdere Metingen van hetzelfde Assessment in de organisatie.
   */
  toegestaneMetingIds?: string[];
  /** Alleen een Admin: De link "Bekijk in benchmark" als de organisatie of de Meting lid is van een benchmark. */
  toonBenchmarkLink: boolean;
}

function MetingWeergavenInhoud({
  assessment,
  organisatie,
  scanUitvoering,
  overzicht,
  spreidingToegestaan,
  antwoordenToegestaan,
  antwoordenAnoniem = false,
  bereikAltijd,
  toegestaneMetingIds,
  toonBenchmarkLink,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const zoek = useSearchParams();
  const instellingen = useInstellingen();
  const benchmarks = useBenchmarks();

  const weergaveParam = zoek.get("weergave");
  const weergave: Weergave =
    weergaveParam === "bouwblok" ||
    (weergaveParam === "spreiding" && spreidingToegestaan) ||
    (weergaveParam === "antwoorden" && antwoordenToegestaan && !isSamengesteld(scanUitvoering))
      ? weergaveParam
      : "overzicht";
  const vergelijkId = zoek.get("vergelijk");

  const huidigeScans = aantalAfgerondInMeting(organisatie, scanUitvoering);
  // "Vergelijk met vorige ronde" (`visualisatie-scores.md`, C): Alleen dezelfde combinatie van onderdeel en Assessment in een
  // eerdere ronde, de meest recente bovenaan. Beide Metingen moeten aan `benchmarkMinScans` voldoen.
  const vergelijkbaar = useMemo(
    () =>
      voldoetAanMinScans(organisatie, scanUitvoering, instellingen.benchmarkMinScans)
        ? vergelijkbareMetingen(organisatie, scanUitvoering).filter(
            (v) =>
              v.ontwikkeling &&
              voldoetAanMinScans(organisatie, v.meting, instellingen.benchmarkMinScans) &&
              (!toegestaneMetingIds || toegestaneMetingIds.includes(v.meting.id))
          )
        : [],
    [organisatie, scanUitvoering, toegestaneMetingIds, instellingen.benchmarkMinScans]
  );
  const gekozenVergelijking = vergelijkId ? vergelijkbaar.find((v) => v.meting.id === vergelijkId) ?? null : null;
  const vorige = gekozenVergelijking?.meting ?? null;

  // Een samengestelde Meting heeft geen scans: Ze telt als één "scan" met het gemiddelde van de onderliggende Metingen.
  const invullingenVan = (m: ScanUitvoering): ScanInvulling[] =>
    isSamengesteld(m)
      ? [
          {
            id: `samengesteld-${m.id}`,
            scanUitvoeringId: m.id,
            organisatieLidId: "",
            status: "afgerond",
            antwoorden: gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, organisatie, m),
            opmerkingenPerBouwblok: {},
            aangemaaktOp: m.aangemaaktOp,
            uitgenodigdOp: m.aangemaaktOp,
            gestartOp: null,
            afgerondOp: null,
            bewaarVerlengdTot: null,
          },
        ]
      : m.invullingen;

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
    const w = tussenMetingen(assessment, invullingenVan(vorige), invullingenVan(scanUitvoering));
    return (
      <div>
        <div className="vis-acties">
          <button type="button" className="btn btn-outline btn-compact" onClick={() => zet({ vergelijk: null })}>
            Vergelijking sluiten
          </button>
        </div>
        {gekozenVergelijking && !gekozenVergelijking.ontwikkeling && (
          <p className="admin-notice" role="status">
            Let op: Dit zijn verschillende onderdelen, het verschil is geen ontwikkeling.
          </p>
        )}
        <WeergaveVergelijking assessment={assessment} weergave={w} vorigLabel={vorige.label} huidigLabel={scanUitvoering.label} />
      </div>
    );
  }

  const opties: { waarde: Weergave; label: string; disabled?: boolean }[] = [
    { waarde: "overzicht", label: "Overzicht" },
    { waarde: "bouwblok", label: "Per bouwblok" },
    ...(spreidingToegestaan ? [{ waarde: "spreiding" as Weergave, label: "Spreiding" }] : []),
    // Een samengestelde Meting heeft geen scans en dus geen antwoorden per respondent.
    ...(antwoordenToegestaan && !isSamengesteld(scanUitvoering) ? [{ waarde: "antwoorden" as Weergave, label: "Antwoorden" }] : []),
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
        {vergelijkbaar.length === 0 && (
          <span className="knop-met-icoon">
            <button type="button" className="btn btn-outline btn-compact" disabled>
              Vergelijk met vorige ronde
            </button>
            <InfoIcoon sleutel="info.vergelijkRonde" naastVeld />
          </span>
        )}
        {vergelijkbaar.length === 1 && (
          <button type="button" className="btn btn-outline btn-compact" onClick={() => zet({ vergelijk: vergelijkbaar[0].meting.id })}>
            Vergelijk met vorige ronde
          </button>
        )}
        {vergelijkbaar.length > 1 && (
          <DropdownKnop
            label="Vergelijk met vorige ronde"
            opties={vergelijkbaar.map((v) => ({
              label: v.ronde?.label ?? v.meting.label,
              onClick: () => zet({ vergelijk: v.meting.id }),
            }))}
          />
        )}
      </div>

      {weergave === "overzicht" && overzicht}
      {weergave === "bouwblok" && (
        <WeergaveBouwblok assessment={assessment} weergave={eenMeting(assessment, invullingenVan(scanUitvoering))} toonBereik={toonBereik && !isSamengesteld(scanUitvoering)} />
      )}
      {weergave === "spreiding" && (
        <WeergaveSpreiding assessment={assessment} weergave={spreiding(assessment, scanUitvoering.invullingen)} />
      )}

      {weergave === "antwoorden" && (
        <WeergaveAntwoorden
          assessment={assessment}
          weergave={antwoordenPerVraag(
            assessment,
            scanUitvoering.invullingen,
            (i) => {
              const lid = organisatie.leden.find((l) => l.id === i.organisatieLidId);
              return lid ? lid.naam || lid.email : "Onbekende respondent";
            },
            { anoniem: antwoordenAnoniem }
          )}
        />
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
