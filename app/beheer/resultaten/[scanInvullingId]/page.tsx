"use client";

import { Suspense, use } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useScanInvulling } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magOrganisatieToegang } from "@/lib/rechten";
import { ResultsView } from "@/components/ResultsView";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { ExporterenNavKnop } from "@/components/beheer/ExporterenNavKnop";
import { useBeheerNavActions } from "@/components/beheer/BeheerNavActions";
import { useInstellingen } from "@/lib/instellingen-store";
import { kruimelsVoorMeting, VIA_RESULTATEN } from "@/lib/resultaten-nav";
import { rondeVan } from "@/lib/rondes";
import { aantalAfgerond } from "@/lib/benchmark";
import { spreiding } from "@/lib/visualisatie";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { WeergaveSpreiding } from "@/components/visualisatie/WeergaveSpreiding";
import { Assessment, OrganisatieLid, ScanInvulling, ScanUitvoering } from "@/lib/types";

/**
 * Resultatenscherm van één scan in beheer (CLAUDE.md sectie 3, scherm 6,
 * beheerpagina.md "Navigatie in beheer"): dezelfde resultaatcomponent als
 * aan de respondentkant, maar met de beheer-nav, een kruimelpad en alleen
 * de dropdown "Exporteren". Terug gaat via het kruimelpad naar het
 * Meting-overzicht.
 */
export default function BeheerResultatenPage({ params }: { params: Promise<{ scanInvullingId: string }> }) {
  const { scanInvullingId } = use(params);
  const gegevens = useScanInvulling(scanInvullingId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const ingelogd = useIngelogdeGebruiker();
  const via = useSearchParams().get("via") === VIA_RESULTATEN;

  useBeheerNavActions(<ExporterenNavKnop scanInvullingId={scanInvullingId} />);

  if (!gegevens || !assessment) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Scan niet gevonden.</p>
      </div>
    );
  }
  const { organisatie, scanUitvoering, lid, invulling } = gegevens;

  if (!magOrganisatieToegang(ingelogd, organisatie)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">
          Geen toegang: deze scan hoort bij een organisatie die niet door jou is aangemaakt en ook niet aan jou is
          toegewezen.
        </p>
      </div>
    );
  }

  const naam = lid.naam || lid.email;
  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={kruimelsVoorMeting(organisatie, scanUitvoering, rondeVan(organisatie, scanUitvoering), via, `Resultaten van ${naam}`)}
      />
      {invulling.status !== "afgerond" ? (
        <p className="admin-notice">De scan van {naam} is nog niet afgerond, er zijn nog geen resultaten.</p>
      ) : (
        <Suspense fallback={null}>
          <ScanWeergaven assessment={assessment} scanUitvoering={scanUitvoering} lid={lid} invulling={invulling} />
        </Suspense>
      )}
    </div>
  );
}

/**
 * De tweede schakelaar op de resultatenpagina van één scan (`visualisatie-scores.md`, Navigatie): "Scores van deze scan" is
 * de bestaande pagina, "Positie in de Meting" is weergave B met een ring op deze scan (de view van niveau 3,
 * `?weergave=positie`). Is het aantal afgeronde scans in de Meting kleiner dan `benchmarkMinRespondenten`, dan is de tweede
 * weergave uitgeschakeld met de reden in een Info-icoon (`info.positieMeting`). De respondent zelf ziet dit niet.
 */
function ScanWeergaven({
  assessment,
  scanUitvoering,
  lid,
  invulling,
}: {
  assessment: Assessment;
  scanUitvoering: ScanUitvoering;
  lid: OrganisatieLid;
  invulling: ScanInvulling;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const zoek = useSearchParams();
  const instellingen = useInstellingen();
  const scans = aantalAfgerond(scanUitvoering);
  const genoeg = scans >= instellingen.benchmarkMinRespondenten;
  const weergave: "scan" | "positie" = zoek.get("weergave") === "positie" && genoeg ? "positie" : "scan";

  function zet(waarde: "scan" | "positie") {
    const params = new URLSearchParams(zoek.toString());
    if (waarde === "positie") {
      params.set("weergave", "positie");
      params.set("focus", invulling.id);
    } else {
      params.delete("weergave");
      params.delete("focus");
    }
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  return (
    <div>
      <div className="vis-acties">
        <WeergaveWissel
          ariaLabel="Weergave van de resultaten van deze scan"
          waarde={weergave}
          onChange={zet}
          opties={[
            { waarde: "scan", label: "Scores van deze scan" },
            { waarde: "positie", label: "Positie in de Meting", disabled: !genoeg, infoSleutel: "info.positieMeting" },
          ]}
        />
      </div>
      {weergave === "scan" ? (
        <ResultsView assessment={assessment} antwoorden={invulling.antwoorden} respondentNaam={lid.naam} />
      ) : (
        <>
          <h1 style={{ marginTop: 0 }}>{assessment.naam}</h1>
          <p className="text-sm text-ink-m" style={{ marginBottom: "1.2rem" }}>
            Positie van {lid.naam || lid.email} in {scanUitvoering.label}, tegenover de andere {scans - 1} afgeronde scans.
          </p>
          <WeergaveSpreiding assessment={assessment} weergave={spreiding(assessment, scanUitvoering.invullingen, invulling.id)} />
        </>
      )}
    </div>
  );
}
