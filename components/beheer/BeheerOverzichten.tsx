"use client";

import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magOrganisatieToegang } from "@/lib/rechten";
import { useBeheerOverzicht } from "@/lib/beheer-url";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { RespondentOverzicht } from "@/components/beheer/RespondentOverzicht";
import { ScanOverzicht } from "@/components/beheer/ScanOverzicht";

/**
 * Rendert het Respondent- of Scan-overzicht als `?respondent=<id>` of
 * `?scan=<id>` in de adresbalk staat, op elke beheerpagina (beheerpagina.md,
 * "Navigatie in beheer"). Een gedeelde link opent alleen als de ontvanger
 * bij die organisatie mag, zelfde bereik als de lijsten.
 */
export function BeheerOverzichten() {
  const { respondentId, scanId, vervang, sluit } = useBeheerOverzicht();
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const ingelogd = useIngelogdeGebruiker();

  if (!ingelogd || (!respondentId && !scanId)) return null;

  if (respondentId) {
    const organisatie = organisaties.find((o) => o.leden.some((l) => l.id === respondentId));
    const lid = organisatie?.leden.find((l) => l.id === respondentId);
    if (!organisatie || !lid) return <NietGevonden onSluit={sluit} wat="Respondent" />;
    if (!magOrganisatieToegang(ingelogd, organisatie)) return <GeenToegang onSluit={sluit} />;
    return (
      <RespondentOverzicht
        key={lid.id}
        organisatie={organisatie}
        lid={lid}
        onSluit={sluit}
        onOpenScan={(id) => vervang("scan", id)}
      />
    );
  }

  const organisatie = organisaties.find((o) => o.scanUitvoeringen.some((s) => s.invullingen.some((i) => i.id === scanId)));
  const scanUitvoering = organisatie?.scanUitvoeringen.find((s) => s.invullingen.some((i) => i.id === scanId));
  const invulling = scanUitvoering?.invullingen.find((i) => i.id === scanId);
  const lid = organisatie?.leden.find((l) => l.id === invulling?.organisatieLidId);
  const assessment = assessments.find((a) => a.id === scanUitvoering?.assessmentId);
  if (!organisatie || !scanUitvoering || !invulling || !lid || !assessment) {
    return <NietGevonden onSluit={sluit} wat="Scan" />;
  }
  if (!magOrganisatieToegang(ingelogd, organisatie)) return <GeenToegang onSluit={sluit} />;
  return (
    <ScanOverzicht
      key={invulling.id}
      organisatie={organisatie}
      scanUitvoering={scanUitvoering}
      lid={lid}
      invulling={invulling}
      assessment={assessment}
      onSluit={sluit}
      onOpenRespondent={() => vervang("respondent", lid.id)}
    />
  );
}

function NietGevonden({ onSluit, wat }: { onSluit: () => void; wat: string }) {
  return (
    <OverzichtModal label={`${wat} niet gevonden`} onSluit={onSluit}>
      <h2 className="text-lg font-bold text-ink">{wat} niet gevonden</h2>
      <p className="overzicht-melding fout">Deze {wat.toLowerCase()} bestaat niet (meer), bijvoorbeeld omdat hij is verwijderd of verplaatst.</p>
    </OverzichtModal>
  );
}

function GeenToegang({ onSluit }: { onSluit: () => void }) {
  return (
    <OverzichtModal label="Geen toegang" onSluit={onSluit}>
      <h2 className="text-lg font-bold text-ink">Geen toegang</h2>
      <p className="overzicht-melding fout">
        Dit hoort bij een organisatie die niet door jou is aangemaakt en ook niet aan jou is toegewezen.
      </p>
    </OverzichtModal>
  );
}
