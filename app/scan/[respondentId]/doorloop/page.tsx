"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRespondent, updateRespondent } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { alleBouwblokkenMetGroep } from "@/lib/assessment-structuur";
import { isGeverifieerd } from "@/lib/verificatie";
import { Sidebar } from "@/components/Sidebar";
import { BouwblokForm } from "@/components/BouwblokForm";

export default function DoorloopPage({
  params,
  searchParams,
}: {
  params: Promise<{ respondentId: string }>;
  searchParams: Promise<{ bouwblok?: string }>;
}) {
  const { respondentId } = use(params);
  const { bouwblok: gevraagdBouwblokId } = use(searchParams);
  const gegevens = useRespondent(respondentId);
  const assessment = useAssessment(gegevens?.organisatie.assessmentId ?? "");
  const router = useRouter();

  const alleBouwblokken = assessment ? alleBouwblokkenMetGroep(assessment) : [];

  // Geen lazy-initializer: alleBouwblokken is pas na hydration (async localStorage-
  // lezing) gevuld, dus het actieve bouwblok wordt bij elke render opnieuw afgeleid
  // in plaats van één keer bij mount vastgezet.
  const [handmatigGekozenId, setHandmatigGekozenId] = useState<string | null>(null);
  const kandidaatId = handmatigGekozenId ?? gevraagdBouwblokId ?? null;
  const actieveBouwblokId =
    kandidaatId && alleBouwblokken.some((b) => b.bouwblok.id === kandidaatId)
      ? kandidaatId
      : (alleBouwblokken[0]?.bouwblok.id ?? null);

  useEffect(() => {
    if (!gegevens) return;
    if (!isGeverifieerd(respondentId)) {
      router.replace(`/uitnodiging/${respondentId}`);
      return;
    }
    if (gegevens.respondent.status === "uitgenodigd") {
      router.replace(`/scan/${respondentId}/intake`);
    }
  }, [gegevens, respondentId, router]);

  if (!gegevens || !assessment || !actieveBouwblokId) {
    return <div className="flex-1 px-6 py-16 text-center text-muted">Laden...</div>;
  }

  if (gegevens.respondent.status === "uitgenodigd") {
    return null;
  }

  const { respondent } = gegevens;
  const huidigeIndex = alleBouwblokken.findIndex((b) => b.bouwblok.id === actieveBouwblokId);
  const huidig = alleBouwblokken[huidigeIndex];
  const isLaatsteBouwblok = huidigeIndex === alleBouwblokken.length - 1;

  function handleAntwoord(vraagId: string, waarde: number) {
    updateRespondent(respondentId, (r) => ({
      ...r,
      antwoorden: { ...r.antwoorden, [vraagId]: waarde },
    }));
  }

  function handleOpmerking(tekst: string) {
    updateRespondent(respondentId, (r) => ({
      ...r,
      opmerkingenPerBouwblok: { ...r.opmerkingenPerBouwblok, [huidig.bouwblok.id]: tekst },
    }));
  }

  function handleVolgende() {
    if (isLaatsteBouwblok) {
      if (respondent.status !== "afgerond") {
        updateRespondent(respondentId, (r) => ({
          ...r,
          status: "afgerond",
          afgerondOp: new Date().toISOString(),
        }));
      }
      router.push(`/scan/${respondentId}/resultaten`);
      return;
    }
    setHandmatigGekozenId(alleBouwblokken[huidigeIndex + 1].bouwblok.id);
  }

  return (
    <div className="flex flex-1 flex-col sm:flex-row">
      <Sidebar
        assessment={assessment}
        respondent={respondent}
        actieveBouwblokId={actieveBouwblokId}
        onSelecteer={setHandmatigGekozenId}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50 px-6 py-10">
        <BouwblokForm
          bouwblok={huidig.bouwblok}
          categorieKleur={huidig.groepKleur}
          eenheid={assessment.bouwblokEenheidEnkelvoud}
          schaal={assessment.schaal}
          respondent={respondent}
          isLaatsteBouwblok={isLaatsteBouwblok}
          onAntwoord={handleAntwoord}
          onOpmerking={handleOpmerking}
          onVolgende={handleVolgende}
        />
      </main>
    </div>
  );
}
