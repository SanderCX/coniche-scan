"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Assessment, Organisatie, ScanInvulling, ScanUitvoering } from "@/lib/types";
import { useInstellingen } from "@/lib/instellingen-store";
import { useBenchmarks } from "@/lib/benchmark-store";
import {
  aantalAfgerondInMeting,
  gemiddeldeAntwoordenVoorMetingMetSamenstelling,
  isSamengesteld,
} from "@/lib/metingen";
import { antwoordenPerVraag, eenMeting, spreiding } from "@/lib/visualisatie";
import { DropdownKnop } from "@/components/DropdownKnop";
import { InfoIcoon } from "@/components/InfoIcoon";
import { WeergaveWissel } from "./WeergaveWissel";
import { WeergaveBouwblok } from "./WeergaveBouwblok";
import { WeergaveSpreiding } from "./WeergaveSpreiding";
import { WeergaveAntwoorden } from "./WeergaveAntwoorden";
import { QuickscanScan, QuickscanMeting } from "@/lib/quickscan-groep";
import { QuickscanGemiddeldeSpreiding } from "@/components/quickscan/QuickscanGemiddeldeSpreiding";
import { QuickscanAntwoorden } from "@/components/quickscan/QuickscanAntwoorden";

type Weergave = "overzicht" | "bouwblok" | "spreiding" | "antwoorden";

/**
 * De weergaven op de resultatenpagina van een Meting (`visualisatie-scores.md`, Navigatie): Overzicht (de bestaande pagina,
 * ongewijzigd), Per bouwblok (A), Spreiding (B) en Antwoorden (G), met rechts de knop "Vergelijking". Die opent de benchmark
 * binnen een organisatie waarvan de Meting lid is (`benchmark.md`, Niveau 2): De vergelijking zelf (C) staat in die benchmark
 * en niet op deze pagina. De gekozen weergave staat in de adresbalk (`?weergave=bouwblok|spreiding|antwoorden`), zodat de
 * terugknop werkt en de link te delen is. Wisselen is een knop en geen link.
 *
 * Admin en Consultant zien daarnaast Antwoorden (G, `antwoordenToegestaan`): De antwoorden per vraag en per respondent, met naam.
 * Een Lead ziet die weergave alleen met het vinkje Antwoorden (en zonder namen als de organisatie dat niet heeft afgesproken,
 * `antwoordenAnoniem`). Een Lead krijgt Overzicht en Per bouwblok. Spreiding is er voor hem alleen met het vinkje in het
 * Leads-venster (`spreidingToegestaan`). Voor een Lead staat de lijn van laagste tot hoogste score pas aan vanaf
 * `benchmarkMinRespondenten` (`toonBereik`).
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
  /** Wie de weergave Antwoorden (G) mag zien: Een Admin en Consultant, en een Lead met het vinkje in het Leads-venster. */
  antwoordenToegestaan: boolean;
  /** Antwoorden zonder namen (R1 tot en met Rn): Voor een Lead als `Organisatie.antwoordenMetNamen` uit staat. */
  antwoordenAnoniem?: boolean;
  /** De lijn van laagste tot hoogste score: Voor een Admin altijd, voor een Lead pas vanaf `benchmarkMinRespondenten`. */
  bereikAltijd: boolean;
  /**
   * De knop "Vergelijking" (`benchmark.md`, Niveau 2, Op de resultatenpagina): De benchmarks binnen een organisatie waarvan
   * deze Meting lid is en die de gebruiker mag openen. Eén opent direct, meer geven een keuzelijst, geen enkele een
   * uitgeschakelde knop met `info.vergelijkMetingen`. Zonder deze prop (`undefined`) staat er geen knop, zoals bij een
   * Consultant, die geen benchmarks opent.
   */
  vergelijkingen?: { id: string; naam: string; href: string }[];
  /** Alleen een Admin: De link "Bekijk in benchmark" als de organisatie lid is van een benchmark tussen organisaties. */
  toonBenchmarkLink: boolean;
  /**
   * Een Meting van een Assessment met Ja / Nee / Weet ik niet (`visualisatie-quickscan.md`, 3 en 4): De schakelaar heeft dan
   * Overzicht, "Gemiddelde en spreiding" en Antwoorden, in plaats van Per bouwblok en Spreiding. Overzicht is `overzicht`, met
   * het gemiddelde van de Meting in de kaarten.
   */
  quickscan?: {
    meting: QuickscanMeting;
    scans: QuickscanScan[];
    /** De naam per scan-id, voor Per respondent. */
    namen: Record<string, string>;
    uitgenodigd: number;
  };
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
  vergelijkingen,
  toonBenchmarkLink,
  quickscan,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const zoek = useSearchParams();
  const instellingen = useInstellingen();
  const benchmarks = useBenchmarks();

  const weergaveParam = zoek.get("weergave");
  const weergave: Weergave =
    (weergaveParam === "bouwblok" && !quickscan) ||
    (weergaveParam === "spreiding" && spreidingToegestaan) ||
    (weergaveParam === "antwoorden" && antwoordenToegestaan && !isSamengesteld(scanUitvoering))
      ? weergaveParam
      : "overzicht";

  const huidigeScans = aantalAfgerondInMeting(organisatie, scanUitvoering);

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

  // "Bekijk in benchmark" (alleen een Admin): De benchmarks tussen organisaties waarin de organisatie met deze Meting meedoet.
  const benchmarkLinks = toonBenchmarkLink
    ? benchmarks.flatMap((b) => {
        const lid = b.leden.find((l) => l.metingId === scanUitvoering.id);
        if (!lid || (b.niveau ?? "organisaties") !== "organisaties") return [];
        return [{ label: b.naam, href: `/beheer/benchmark/${b.id}/organisatie/${organisatie.id}` }];
      })
    : [];

  const opties: { waarde: Weergave; label: string; disabled?: boolean }[] = [
    { waarde: "overzicht", label: "Overzicht" },
    ...(quickscan ? [] : [{ waarde: "bouwblok" as Weergave, label: "Per bouwblok" }]),
    ...(spreidingToegestaan
      ? [{ waarde: "spreiding" as Weergave, label: quickscan ? "Gemiddelde en spreiding" : "Spreiding" }]
      : []),
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
        {vergelijkingen !== undefined && vergelijkingen.length === 0 && (
          <span className="knop-met-icoon">
            <button type="button" className="btn btn-outline btn-compact" disabled>
              Vergelijking
            </button>
            <InfoIcoon sleutel="info.vergelijkMetingen" naastVeld />
          </span>
        )}
        {vergelijkingen?.length === 1 && (
          <button type="button" className="btn btn-outline btn-compact" onClick={() => router.push(vergelijkingen[0].href)}>
            Vergelijking
          </button>
        )}
        {vergelijkingen !== undefined && vergelijkingen.length > 1 && (
          <DropdownKnop
            label="Vergelijking"
            opties={vergelijkingen.map((v) => ({ label: v.naam, onClick: () => router.push(v.href) }))}
          />
        )}
      </div>

      {weergave === "overzicht" && overzicht}
      {quickscan && weergave === "spreiding" && (
        <QuickscanGemiddeldeSpreiding
          meting={quickscan.meting}
          uitgenodigd={quickscan.uitgenodigd}
          minRespondenten={bereikAltijd ? undefined : instellingen.benchmarkMinRespondenten}
        />
      )}
      {quickscan && weergave === "antwoorden" && (
        <QuickscanAntwoorden
          assessment={assessment}
          scans={quickscan.scans}
          namen={quickscan.namen}
          anoniem={antwoordenAnoniem}
        />
      )}
      {!quickscan && weergave === "bouwblok" && (
        <WeergaveBouwblok assessment={assessment} weergave={eenMeting(assessment, invullingenVan(scanUitvoering))} toonBereik={toonBereik && !isSamengesteld(scanUitvoering)} />
      )}
      {!quickscan && weergave === "spreiding" && (
        <WeergaveSpreiding assessment={assessment} weergave={spreiding(assessment, scanUitvoering.invullingen)} />
      )}

      {!quickscan && weergave === "antwoorden" && (
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
