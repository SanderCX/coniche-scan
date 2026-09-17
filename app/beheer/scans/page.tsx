"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties, maakOrganisatie } from "@/lib/db";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";

export default function ScansPage() {
  const assessments = useAssessments();
  const organisaties = useOrganisaties();
  const router = useRouter();

  const [naam, setNaam] = useState("");
  const [assessmentId, setAssessmentId] = useState(assessments[0]?.id ?? "");
  const [kenmerken, setKenmerken] = useState<Record<string, unknown>>({});
  const [formOpen, setFormOpen] = useState(false);

  const gekozenAssessment = assessments.find((a) => a.id === assessmentId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assessmentId) return;
    const organisatie = maakOrganisatie({ naam, assessmentId, kenmerken });
    setNaam("");
    setKenmerken({});
    setFormOpen(false);
    router.push(`/beheer/scans/${organisatie.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Scans</h1>
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="rounded-lg bg-or px-4 py-2 text-sm font-semibold text-white hover:bg-or-l hover:-translate-y-px"
        >
          {formOpen ? "Annuleren" : "+ Nieuwe scan"}
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Organisatienaam
            </label>
            <input
              required
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Assessment-type
            </label>
            <select
              value={assessmentId}
              onChange={(e) => setAssessmentId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.naam}
                </option>
              ))}
            </select>
          </div>

          {gekozenAssessment && gekozenAssessment.organisatieVelden.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Organisatiekenmerken</p>
              <KenmerkenForm
                velden={gekozenAssessment.organisatieVelden}
                waarden={kenmerken}
                onChange={setKenmerken}
              />
            </div>
          )}

          <button
            type="submit"
            className="rounded-lg bg-or px-6 py-2.5 text-sm font-semibold text-white hover:bg-or-l hover:-translate-y-px"
          >
            Scan aanmaken
          </button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {organisaties.length === 0 && (
          <p className="text-sm text-ink-m">Nog geen scans aangemaakt.</p>
        )}
        {organisaties.map((org) => {
          const assessment = assessments.find((a) => a.id === org.assessmentId);
          const afgerond = org.respondenten.filter((r) => r.status === "afgerond").length;
          return (
            <Link
              key={org.id}
              href={`/beheer/scans/${org.id}`}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow"
            >
              <div>
                <p className="font-semibold text-ink">{org.naam}</p>
                <p className="text-sm text-ink-m">{assessment?.naam ?? "Onbekend type"}</p>
              </div>
              <p className="text-sm text-ink-m">
                {afgerond}/{org.respondenten.length} afgerond
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
