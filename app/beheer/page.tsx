"use client";

import { useState } from "react";
import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties, controleerDataIntegriteit } from "@/lib/db";

export default function BeheerDashboard() {
  const assessments = useAssessments();
  const organisaties = useOrganisaties();
  const [integriteitResultaat, setIntegriteitResultaat] = useState<string[] | null>(null);

  const alleInvullingen = organisaties.flatMap((o) =>
    o.scanUitvoeringen.flatMap((s) => s.invullingen)
  );

  const stats = [
    { label: "Assessment-types", waarde: assessments.length, href: "/beheer/content" },
    { label: "Organisaties", waarde: organisaties.length, href: "/beheer/organisaties" },
    { label: "Ingevulde scans totaal", waarde: alleInvullingen.length, href: "/beheer/scans" },
    {
      label: "Afgerond",
      waarde: alleInvullingen.filter((i) => i.status === "afgerond").length,
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

      <div className="admin-notice mt-10" style={{ maxWidth: "36rem" }}>
        <p className="font-medium text-ink">Data-integriteit</p>
        <p className="mt-0.5 text-sm text-ink-m">
          Controleert of er, bijvoorbeeld na een verwijderactie, nog ingevulde scans zijn die naar
          een niet-bestaande respondent verwijzen (v1-aanpassingen.md punt 14).
        </p>
        <button
          type="button"
          onClick={() => setIntegriteitResultaat(controleerDataIntegriteit())}
          className="btn btn-outline btn-compact mt-3"
        >
          Controleer nu
        </button>
        {integriteitResultaat && (
          <div className="mt-3">
            {integriteitResultaat.length === 0 ? (
              <p className="text-sm font-medium" style={{ color: "var(--stat-green)" }}>
                ✓ Geen achterblijvende data gevonden.
              </p>
            ) : (
              <ul className="text-sm" style={{ color: "var(--stat-red)" }}>
                {integriteitResultaat.map((probleem, i) => (
                  <li key={i}>{probleem}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
