"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAssessment } from "@/data/assessments";
import { rondAf, updateAntwoord, updateOpmerking } from "@/lib/storage";
import { useRespondent } from "@/lib/use-respondent";
import { Sidebar } from "@/components/Sidebar";
import { BouwblokForm } from "@/components/BouwblokForm";

export default function ScanPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const assessment = getAssessment(assessmentId);
  const router = useRouter();
  const respondent = useRespondent();

  const alleBouwblokken = assessment
    ? [...assessment.categorieen]
        .sort((a, b) => a.volgorde - b.volgorde)
        .flatMap((c) => c.bouwblokken.map((b) => ({ bouwblok: b, categorieKleur: c.kleur })))
    : [];

  const [actieveBouwblokId, setActieveBouwblokId] = useState<string | null>(
    () => alleBouwblokken[0]?.bouwblok.id ?? null
  );

  useEffect(() => {
    if (respondent === null) {
      router.replace(`/${assessmentId}/start`);
    }
  }, [respondent, assessmentId, router]);

  if (!assessment) {
    return (
      <div className="mx-auto w-full max-w-xl flex-1 px-6 py-16 text-center text-slate-600">
        Assessment niet gevonden.
      </div>
    );
  }

  if (!respondent || !actieveBouwblokId) {
    return <div className="flex-1 px-6 py-16 text-center text-slate-400">Laden...</div>;
  }

  const huidigeIndex = alleBouwblokken.findIndex((b) => b.bouwblok.id === actieveBouwblokId);
  const huidig = alleBouwblokken[huidigeIndex];
  const isLaatsteBouwblok = huidigeIndex === alleBouwblokken.length - 1;

  function handleAntwoord(vraagId: string, waarde: number) {
    updateAntwoord(vraagId, waarde);
  }

  function handleOpmerking(tekst: string) {
    updateOpmerking(huidig.bouwblok.id, tekst);
  }

  function handleVolgende() {
    if (isLaatsteBouwblok) {
      rondAf();
      router.push(`/${assessmentId}/resultaten`);
      return;
    }
    setActieveBouwblokId(alleBouwblokken[huidigeIndex + 1].bouwblok.id);
  }

  return (
    <div className="flex flex-1 flex-col sm:flex-row">
      <Sidebar
        assessment={assessment}
        respondent={respondent}
        actieveBouwblokId={actieveBouwblokId}
        onSelecteer={setActieveBouwblokId}
      />
      <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-10">
        <BouwblokForm
          bouwblok={huidig.bouwblok}
          categorieKleur={huidig.categorieKleur}
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
