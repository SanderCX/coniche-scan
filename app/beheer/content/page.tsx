"use client";

import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";

export default function ContentOverzichtPage() {
  const assessments = useAssessments();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Content</h1>
      <p className="mt-1 text-sm text-slate-500">
        Assessment-instellingen, organisatievelden en de vragencontent.
      </p>

      <div className="mt-6 space-y-3">
        {assessments.map((a) => (
          <Link
            key={a.id}
            href={`/beheer/content/${a.id}`}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow"
          >
            <div>
              <p className="font-semibold text-slate-900">
                {a.icoon} {a.naam}
              </p>
              <p className="text-sm text-slate-500">
                {a.categorieen.length} categorieën ·{" "}
                {a.categorieen.reduce((s, c) => s + c.bouwblokken.length, 0)} bouwblokken
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
