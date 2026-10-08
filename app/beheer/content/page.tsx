"use client";

import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { actieveBouwblokkenMetGroep } from "@/lib/assessment-structuur";
import { AssessmentIcon } from "@/components/icons/AssessmentIcons";
import { AssessmentVerwijderen } from "@/components/beheer/AssessmentVerwijderen";

export default function ContentOverzichtPage() {
  const assessments = useAssessments();

  return (
    <div className="admin-main">
      <h1>Content</h1>
      <p>Assessment-instellingen, organisatievelden en de vragencontent.</p>

      <Link href="/beheer/content/nieuw" className="btn btn-or" style={{ marginBottom: "1.5rem" }}>
        + Nieuw Assessment
      </Link>

      <div className="admin-list">
        {assessments.map((a) => {
          const template = assessments.find((t) => t.id === a.afgeleidVanAssessmentId);
          return (
            <div key={a.id} className="admin-row-groep">
              <Link href={`/beheer/content/${a.id}`} className="admin-row" style={{ flex: 1 }}>
                <div className="flex items-center gap-4">
                  <span className="assessment-icoon-rond" aria-hidden="true">
                    <AssessmentIcon name={a.icoon} style={{ width: "2rem", height: "2rem" }} />
                  </span>
                  <div>
                    <p className="admin-row-titel">{a.naam}</p>
                    <p className="admin-row-sub">
                      {a.categorieen
                        ? `${a.categorieen.filter((c) => !c.gearchiveerd).length} categorieën · `
                        : "Geen categorie-laag · "}
                      {actieveBouwblokkenMetGroep(a).length} {a.bouwblokEenheidMeervoud}
                      {template && ` · Afgeleid van: ${template.naam}`}
                    </p>
                  </div>
                </div>
              </Link>
              <AssessmentVerwijderen assessment={a} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
