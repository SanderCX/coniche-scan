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
    { label: "Organisaties", waarde: organisaties.length, href: "/beheer/organisaties" },
    { label: "Respondenten totaal", waarde: alleRespondenten.length, href: "/beheer/scans" },
    {
      label: "Respondenten afgerond",
      waarde: alleRespondenten.filter((r) => r.status === "afgerond").length,
      href: "/beheer/scans",
    },
  ];

  return (
    <div className="admin-main">
      <h1>Dashboard</h1>
      <p>Overzicht van scans en content.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card">
            <p className="text-3xl font-bold text-ink">{s.waarde}</p>
            <p className="mt-1 text-sm text-ink-s">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 btn-rij" style={{ maxWidth: "26rem" }}>
        <Link href="/beheer/organisaties/nieuw" className="btn btn-or">
          Nieuwe organisatie
        </Link>
        <Link href="/beheer/content" className="btn btn-outline">
          Content beheren
        </Link>
      </div>
    </div>
  );
}
