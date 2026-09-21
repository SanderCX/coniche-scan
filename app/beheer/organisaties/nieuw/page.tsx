"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { maakOrganisatie } from "@/lib/db";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";

export default function NieuweOrganisatiePage() {
  const assessments = useAssessments();
  const router = useRouter();

  const [naam, setNaam] = useState("");
  const [assessmentId, setAssessmentId] = useState(assessments[0]?.id ?? "");
  const [kenmerken, setKenmerken] = useState<Record<string, unknown>>({});

  const gekozenAssessment = assessments.find((a) => a.id === assessmentId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assessmentId) return;
    const organisatie = maakOrganisatie({ naam, assessmentId, kenmerken });
    router.push(`/beheer/organisaties/${organisatie.id}`);
  }

  return (
    <div className="admin-main">
      <Link href="/beheer/organisaties" className="admin-back">
        ← Organisaties
      </Link>
      <h1>Nieuwe organisatie</h1>

      <form onSubmit={handleSubmit}>
        <div className="admin-field">
          <label>Organisatienaam</label>
          <input type="text" required value={naam} onChange={(e) => setNaam(e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Assessment-type</label>
          <select value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)}>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.naam}
              </option>
            ))}
          </select>
        </div>

        {gekozenAssessment && gekozenAssessment.organisatieVelden.length > 0 && (
          <div className="mb-6">
            <h2>Organisatiekenmerken</h2>
            <KenmerkenForm
              velden={gekozenAssessment.organisatieVelden}
              waarden={kenmerken}
              onChange={setKenmerken}
            />
          </div>
        )}

        <button type="submit" className="btn btn-or">
          Organisatie aanmaken
        </button>
      </form>
    </div>
  );
}
