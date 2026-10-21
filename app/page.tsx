"use client";

import { useAssessments } from "@/lib/assessment-store";
import { AssessmentCirkel } from "@/components/AssessmentCirkel";
import { PageWithChrome } from "@/components/PageWithChrome";

/**
 * Scherm 1, Kies jouw assessment (`CLAUDE.md`, scherm 1, besloten door Joost op 21 oktober 2026, ontwerp `Home-D`): De eyebrow, de titel en een
 * inleiding van twee zinnen op de breedte van de pagina, daaronder de Assessmentcirkel met het detailpaneel. De inleiding is een voorstel van de spec.
 */
export default function Home() {
  const assessments = useAssessments();

  return (
    <PageWithChrome>
      <div className="container ac-pagina">
        <h1>Kies jouw assessment</h1>
        <p className="ac-intro">
          Coniche Scan laat zien hoe volwassen jouw klantcontact is en waar de grootste kansen liggen. Je collega&apos;s vullen een korte vragenlijst in, jij krijgt een
          radar met concrete vervolgstappen.
        </p>
        <AssessmentCirkel assessments={assessments} />
      </div>
    </PageWithChrome>
  );
}
