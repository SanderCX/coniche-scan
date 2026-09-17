import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssessment } from "@/data/assessments";
import { demoAntwoorden, demoRespondentNaam } from "@/data/demo-antwoorden";
import { ResultsView } from "@/components/ResultsView";

export default async function VoorbeeldPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  const assessment = getAssessment(assessmentId);
  if (!assessment) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Voorbeeld-output
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{assessment.naam}</h1>
        </div>
        <Link
          href={`/${assessment.id}/start`}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Start de scan
        </Link>
      </div>

      <ResultsView
        assessment={assessment}
        antwoorden={demoAntwoorden}
        respondentNaam={demoRespondentNaam}
        isPreview
      />
    </div>
  );
}
