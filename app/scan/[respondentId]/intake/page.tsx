"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRespondent, updateRespondent } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { isGeverifieerd } from "@/lib/verificatie";

export default function IntakePage({
  params,
}: {
  params: Promise<{ respondentId: string }>;
}) {
  const { respondentId } = use(params);
  const gegevens = useRespondent(respondentId);
  const assessment = useAssessment(gegevens?.organisatie.assessmentId ?? "");
  const router = useRouter();

  const [naam, setNaam] = useState("");
  const [rol, setRol] = useState("");
  const [team, setTeam] = useState("");
  const [notities, setNotities] = useState("");

  useEffect(() => {
    if (!gegevens) return;
    if (!isGeverifieerd(respondentId)) {
      router.replace(`/uitnodiging/${respondentId}`);
      return;
    }
    if (gegevens.respondent.status === "bezig") {
      router.replace(`/scan/${respondentId}/doorloop`);
    } else if (gegevens.respondent.status === "afgerond") {
      router.replace(`/scan/${respondentId}/resultaten`);
    }
  }, [gegevens, respondentId, router]);

  if (!gegevens || !assessment) {
    return <div className="flex-1 px-6 py-16 text-center text-ink-m">Laden...</div>;
  }

  if (gegevens.respondent.status !== "uitgenodigd") {
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateRespondent(respondentId, (r) => ({
      ...r,
      naam,
      rol,
      team,
      notities,
      status: "bezig",
    }));
    router.push(`/scan/${respondentId}/doorloop`);
  }

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-6 py-16">
      <span className="inline-block rounded-full bg-or-faint px-3 py-1 text-xs font-semibold uppercase tracking-wide text-or">
        {assessment.naam}
      </span>
      <h1 className="mt-3 text-2xl font-bold text-ink">Voordat je begint</h1>
      <p className="mt-2 text-sm text-ink-m">
        De organisatiegegevens staan al vast — we hebben alleen een paar gegevens
        van jou nodig.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Naam</label>
          <input
            required
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-or focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Rol / functie
          </label>
          <input
            required
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-or focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Team <span className="font-normal text-ink-m">(optioneel)</span>
          </label>
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-or focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Notities <span className="font-normal text-ink-m">(optioneel)</span>
          </label>
          <textarea
            value={notities}
            onChange={(e) => setNotities(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-or focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-or px-6 py-3 text-sm font-semibold text-white transition hover:bg-or-l hover:-translate-y-px"
        >
          Start de scan
        </button>
      </form>
    </div>
  );
}
