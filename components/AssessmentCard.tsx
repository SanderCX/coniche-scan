import Link from "next/link";
import { Assessment } from "@/lib/types";
import { alleBouwblokkenMetGroep, alleVragen } from "@/lib/assessment-structuur";

export function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const totaalVragen = alleVragen(assessment).length;
  const totaalBouwblokken = alleBouwblokkenMetGroep(assessment).length;

  return (
    <Link
      href={`/${assessment.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span className="text-3xl">{assessment.icoon}</span>
      <h2 className="mt-4 text-xl font-bold text-slate-900">{assessment.naam}</h2>
      <p className="mt-1 text-sm text-slate-500">{assessment.subtitel}</p>
      <p className="mt-3 text-sm text-slate-600">{assessment.beschrijving}</p>
      <div className="mt-4 flex gap-4 text-xs text-slate-500">
        <span>
          {totaalBouwblokken} {assessment.bouwblokEenheidMeervoud}
        </span>
        <span>{totaalVragen} vragen</span>
        <span>{assessment.geschatteDuur}</span>
      </div>
    </Link>
  );
}
