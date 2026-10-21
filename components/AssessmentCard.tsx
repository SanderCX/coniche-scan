import Link from "next/link";
import { Assessment } from "@/lib/types";
import { tegelInhoud } from "@/lib/landing";
import { AssessmentIcon } from "@/components/icons/AssessmentIcons";
import { TEGEL_ICONEN } from "@/components/icons/LandingIcons";

/**
 * De tegel op scherm 1 (`CLAUDE.md`, scherm 1, Tegels; `stylesheet.md`, Assessmenttegel): Icoon en titel, één zin en drie punten met een grijs
 * lijnicoon. De hele tegel is klikbaar en gaat naar de pagina van het Assessment, er staat geen aparte link in.
 */
export function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const { zin, punten } = tegelInhoud(assessment);
  return (
    <Link href={`/${assessment.id}`} className="card ap-tegel">
      <div className="ap-tegel-kop">
        <AssessmentIcon name={assessment.icoon} style={{ width: "48px", height: "48px", color: "var(--or)", flex: "none" }} />
        <h2>{assessment.naam}</h2>
      </div>
      <p className="ap-tegel-zin">{zin}</p>
      <ul className="ap-tegel-punten">
        {punten.map((p) => {
          const Icoon = TEGEL_ICONEN[p.icoon];
          return (
            <li key={p.tekst}>
              <Icoon aria-hidden="true" style={{ width: "20px", height: "20px", flex: "none", color: "var(--ink-s)" }} />
              {p.tekst}
            </li>
          );
        })}
      </ul>
    </Link>
  );
}
