"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScanInvulling, voltooiIntake } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { PageWithChrome } from "@/components/PageWithChrome";
import { RespondentGegevensVelden } from "@/components/RespondentGegevensVelden";
import { ScanBezet } from "@/components/ScanBezet";
import { WegingKaart } from "@/components/WegingKaart";
import { InfoIcoon } from "@/components/InfoIcoon";
import { useBewerkslot } from "@/lib/bewerkslot";

export default function IntakePage({
  params,
}: {
  params: Promise<{ respondentId: string }>;
}) {
  const { respondentId } = use(params);
  const gegevens = useScanInvulling(respondentId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const router = useRouter();
  // Eén persoon tegelijk per scan (lib/bewerkslot.ts): De eerste houdt het slot, een tweede ziet een melding.
  const slot = useBewerkslot("scan", gegevens ? respondentId : null);

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

  if (slot.status === "bezet") {
    return <ScanBezet toegangscode={gegevens.lid.toegangscode} onOpnieuw={slot.opnieuw} />;
  }
  if (slot.status === "controleren") {
    return (
      <PageWithChrome>
        <div className="flex-1 px-6 py-16 text-center text-ink-m">Laden...</div>
      </PageWithChrome>
    );
  }

  const { lid } = gegevens;
  const rolgroepen = assessment.rolgroepen ?? [];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    voltooiIntake(respondentId, {
      naam: String(data.get("naam") ?? "").trim(),
      functie: String(data.get("functie") ?? "").trim(),
      team: String(data.get("team") ?? "").trim(),
      notities: String(data.get("notities") ?? "").trim(),
      // Alleen bij een Assessment met rolgroepen (de Spanningsmeter, `CLAUDE.md`, scherm 4).
      ...(rolgroepen.length > 0 ? { rolgroep: String(data.get("rolgroep") ?? "") } : {}),
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

        <WegingKaart assessment={assessment} />

        <form onSubmit={handleSubmit} className="mt-8">
          <RespondentGegevensVelden
            naam={lid.naam}
            functie={lid.functie}
            team={lid.team}
            notities={lid.notities}
          />

          {rolgroepen.length > 0 && (
            <div className="field">
              <label htmlFor="intake-rolgroep">
                Rolgroep <span className="font-normal text-ink-s">(optioneel)</span>
              </label>
              <span className="knop-met-icoon" style={{ width: "100%" }}>
                <select id="intake-rolgroep" name="rolgroep" className="field" defaultValue="" style={{ flex: 1 }}>
                  <option value="">Kies een rolgroep</option>
                  {rolgroepen.map((groep) => (
                    <option key={groep} value={groep}>
                      {groep}
                    </option>
                  ))}
                </select>
                <InfoIcoon naastVeld sleutel="info.rolgroep" />
              </span>
            </div>
          )}

          <label
            className="text-sm"
            style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", margin: "1.5rem 0" }}
          >
            <input type="checkbox" required style={{ marginTop: "0.2rem" }} />
            <span style={{ color: "var(--ink-m)" }}>
              Ik geef toestemming om mijn antwoorden (en eventueel ingevulde contactgegevens) te
              delen met Coniche voor analyse en advies. Zie{" "}
              <Link href="/privacy" target="_blank" className="tekst-link">
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
