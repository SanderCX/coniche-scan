"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { getAssessment } from "@/data/assessments";
import { starteRespondent } from "@/lib/storage";

export default function StartPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const assessment = getAssessment(assessmentId);
  const router = useRouter();

  const [naam, setNaam] = useState("");
  const [rol, setRol] = useState("");
  const [team, setTeam] = useState("");
  const [notities, setNotities] = useState("");

  if (!assessment) {
    return (
      <div className="mx-auto w-full max-w-xl flex-1 px-6 py-16 text-center text-slate-600">
        Assessment niet gevonden.
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    starteRespondent({ naam, rol, team, notities });
    router.push(`/${assessmentId}/scan`);
  }

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Voordat je begint</h1>
      <p className="mt-2 text-sm text-slate-500">
        De organisatiegegevens staan al vast — we hebben alleen een paar gegevens
        van jou nodig.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Naam
          </label>
          <input
            required
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Rol / functie
          </label>
          <input
            required
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Team <span className="font-normal text-slate-400">(optioneel)</span>
          </label>
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Notities <span className="font-normal text-slate-400">(optioneel)</span>
          </label>
          <textarea
            value={notities}
            onChange={(e) => setNotities(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Start de scan
        </button>
      </form>
    </div>
  );
}
