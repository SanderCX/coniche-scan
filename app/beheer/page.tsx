"use client";

import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";

export default function BeheerDashboard() {
  const assessments = useAssessments();
  const organisaties = useOrganisaties();
  const alleRespondenten = organisaties.flatMap((o) => o.respondenten);

  const stats = [
    { label: "Assessment-types", waarde: assessments.length, href: "/beheer/content" },
    { label: "Scans (organisaties)", waarde: organisaties.length, href: "/beheer/scans" },
    { label: "Respondenten totaal", waarde: alleRespondenten.length, href: "/beheer/scans" },
    {
      label: "Respondenten afgerond",
      waarde: alleRespondenten.filter((r) => r.status === "afgerond").length,
      href: "/beheer/scans",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overzicht van scans en content.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow"
          >
            <p className="text-3xl font-bold text-slate-900">{s.waarde}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex gap-3">
        <Link
          href="/beheer/scans"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Nieuwe scan aanmaken
        </Link>
        <Link
          href="/beheer/content"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400"
        >
          Content beheren
        </Link>
      </div>
    </div>
  );
}
