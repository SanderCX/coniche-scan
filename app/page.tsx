"use client";

import { useAssessments } from "@/lib/assessment-store";
import { AssessmentCard } from "@/components/AssessmentCard";
import { PageWithChrome } from "@/components/PageWithChrome";

export default function Home() {
  const assessments = useAssessments();

  return (
    <PageWithChrome>
      <div style={{ background: "linear-gradient(180deg, var(--or-faint) 0%, var(--bg) 65%)" }}>
        <div className="container" style={{ padding: "4.5rem 2rem 3.5rem", textAlign: "center" }}>
          <span className="eyebrow">Coniche Scan</span>
          <h1>Kies jouw assessment</h1>
          <p
            style={{
              maxWidth: "40rem",
              margin: "1rem auto 0",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            Elke scan geeft direct inzicht in waar jouw organisatie staat en welke
            verbeterkansen er liggen.
          </p>
        </div>
      </div>

      <div className="container flex-1" style={{ paddingBottom: "5rem", maxWidth: "64rem" }}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {assessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      </div>
    </PageWithChrome>
  );
}
