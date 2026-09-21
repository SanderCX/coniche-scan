"use client";

import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { alleBouwblokkenMetGroep } from "@/lib/assessment-structuur";

export default function ContentOverzichtPage() {
  const assessments = useAssessments();

  return (
    <div className="admin-main">
      <h1>Content</h1>
      <p>Assessment-instellingen, organisatievelden en de vragencontent.</p>

      <div className="admin-list">
        {assessments.map((a) => (
          <Link key={a.id} href={`/beheer/content/${a.id}`} className="admin-row">
            <div>
              <p className="admin-row-titel">
                {a.icoon} {a.naam}
              </p>
              <p className="admin-row-sub">
                {a.categorieen
                  ? `${a.categorieen.length} categorieën · `
                  : "Geen categorie-laag · "}
                {alleBouwblokkenMetGroep(a).length} {a.bouwblokEenheidMeervoud}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
