import Link from "next/link";
import { Assessment } from "@/lib/types";
import { alleBouwblokkenMetGroep, alleVragen } from "@/lib/assessment-structuur";
import { AssessmentIcon } from "@/components/icons/AssessmentIcons";

export function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const totaalVragen = alleVragen(assessment).length;
  // Titel over twee regels: vóór " in " (AI-volwassenheid / in Klantcontact),
  // anders na het eerste woord (Klantcontact / Volwassenheid).
  const inIndex = assessment.naam.indexOf(" in ");
  const splitsAt = inIndex !== -1 ? inIndex : assessment.naam.indexOf(" ");
  const regels =
    splitsAt === -1
      ? [assessment.naam, ""]
      : [assessment.naam.slice(0, splitsAt), assessment.naam.slice(splitsAt + 1)];
  const totaalBouwblokken = alleBouwblokkenMetGroep(assessment).length;

  return (
    <Link
      href={`/${assessment.id}`}
      className="block rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center gap-4">
        <AssessmentIcon
          name={assessment.icoon}
          style={{ width: "3.5rem", height: "3.5rem", color: "var(--or)", flex: "none" }}
        />
        <h2 className="text-xl font-bold text-ink" style={{ margin: 0, fontSize: "1.6rem" }}>
          {regels[0]}
          <br />
          {regels[1]}
        </h2>
      </div>
      <p className="text-sm text-ink-m" style={{ marginTop: "1.5rem" }}>
        {assessment.subtitel}
      </p>
      <p className="mt-3 text-sm text-ink-m">{assessment.beschrijving}</p>
      <div className="mt-4 flex gap-4 text-xs text-ink-m">
        <span>
          {totaalBouwblokken} {assessment.bouwblokEenheidMeervoud}
        </span>
        <span>{totaalVragen} vragen</span>
        <span>{assessment.geschatteDuur}</span>
      </div>
    </Link>
  );
}
