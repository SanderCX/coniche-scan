"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRespondent, updateRespondent } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { PageWithChrome } from "@/components/PageWithChrome";

export default function IntakePage({
  params,
}: {
  params: Promise<{ respondentId: string }>;
}) {
  const { respondentId } = use(params);
  const gegevens = useRespondent(respondentId);
  const assessment = useAssessment(gegevens?.organisatie.assessmentId ?? "");
  const router = useRouter();

  useEffect(() => {
    if (!gegevens) return;
    if (gegevens.respondent.status === "bezig") {
      router.replace(`/scan/${respondentId}/doorloop`);
    } else if (gegevens.respondent.status === "afgerond") {
      router.replace(`/scan/${respondentId}/resultaten`);
    }
  }, [gegevens, respondentId, router]);

  if (!gegevens || !assessment) {
    return (
      <PageWithChrome>
        <div className="flex-1 px-6 py-16 text-center text-ink-m">Laden...</div>
      </PageWithChrome>
    );
  }

  if (gegevens.respondent.status !== "uitgenodigd") {
    return null;
  }

  const { respondent } = gegevens;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    updateRespondent(respondentId, (r) => ({
      ...r,
      naam: String(data.get("naam") ?? "").trim(),
      rol: String(data.get("rol") ?? "").trim(),
      team: String(data.get("team") ?? "").trim(),
      notities: String(data.get("notities") ?? "").trim(),
      status: "bezig",
      gestartOp: new Date().toISOString(),
    }));
    router.push(`/scan/${respondentId}/doorloop`);
  }

  return (
    <PageWithChrome>
      <div className="container section" style={{ maxWidth: "36rem" }}>
        <span className="eyebrow">{assessment.naam}</span>
        <h1>Voordat je begint</h1>
        <p>
          De organisatiegegevens staan al vast — we hebben alleen een paar gegevens van jou
          nodig.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="field">
            <label>Naam</label>
            <input
              type="text"
              name="naam"
              required
              defaultValue={respondent.naam ?? ""}
            />
          </div>
          <div className="field">
            <label>Rol / functie</label>
            <input type="text" name="rol" required defaultValue={respondent.rol} />
          </div>
          <div className="field">
            <label>
              Team <span className="font-normal text-ink-s">(optioneel)</span>
            </label>
            <input type="text" name="team" defaultValue={respondent.team} />
          </div>
          <div className="field">
            <label>
              Notities <span className="font-normal text-ink-s">(optioneel)</span>
            </label>
            <textarea name="notities" rows={3} defaultValue={respondent.notities} />
          </div>

          <button type="submit" className="btn btn-or" style={{ width: "100%" }}>
            Start de scan
          </button>
        </form>
      </div>
    </PageWithChrome>
  );
}
