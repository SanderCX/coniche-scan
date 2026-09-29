"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScanInvulling, voltooiIntake } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { PageWithChrome } from "@/components/PageWithChrome";

export default function IntakePage({
  params,
}: {
  params: Promise<{ respondentId: string }>;
}) {
  const { respondentId } = use(params);
  const gegevens = useScanInvulling(respondentId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const router = useRouter();

  useEffect(() => {
    if (!gegevens) return;
    if (gegevens.invulling.status === "bezig") {
      router.replace(`/scan/${respondentId}/doorloop`);
    } else if (gegevens.invulling.status === "afgerond") {
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

  if (gegevens.invulling.status !== "uitgenodigd") {
    return null;
  }

  const { lid } = gegevens;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    voltooiIntake(respondentId, {
      naam: String(data.get("naam") ?? "").trim(),
      functie: String(data.get("functie") ?? "").trim(),
      team: String(data.get("team") ?? "").trim(),
      notities: String(data.get("notities") ?? "").trim(),
    });
    router.push(`/scan/${respondentId}/doorloop`);
  }

  return (
    <PageWithChrome logoHref={`/s/${lid.toegangscode}`} code={lid.toegangscode} toonTerug>
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
            <input type="text" name="naam" required defaultValue={lid.naam ?? ""} />
          </div>
          <div className="field">
            <label>Rol / functie</label>
            <input type="text" name="functie" required defaultValue={lid.functie} />
          </div>
          <div className="field">
            <label>
              Team <span className="font-normal text-ink-s">(optioneel)</span>
            </label>
            <input type="text" name="team" defaultValue={lid.team} />
          </div>
          <div className="field">
            <label>
              Notities <span className="font-normal text-ink-s">(optioneel)</span>
            </label>
            <textarea name="notities" rows={3} defaultValue={lid.notities} />
          </div>

          <label
            className="text-sm"
            style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", margin: "1.5rem 0" }}
          >
            <input type="checkbox" required style={{ marginTop: "0.2rem" }} />
            <span style={{ color: "var(--ink-m)" }}>
              Ik geef toestemming om mijn antwoorden (en eventueel ingevulde contactgegevens) te
              delen met Coniche voor analyse en advies. Zie{" "}
              <Link href="/privacy" target="_blank" style={{ textDecoration: "underline" }}>
                privacy
              </Link>
              .
            </span>
          </label>

          <button type="submit" className="btn btn-or" style={{ width: "100%" }}>
            Start de scan
          </button>
        </form>
      </div>
    </PageWithChrome>
  );
}
