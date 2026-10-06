"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScanInvulling, updateScanInvulling, scanWeergave } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { actieveBouwblokkenMetGroep, actieveVragen } from "@/lib/assessment-structuur";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";
import { Sidebar } from "@/components/Sidebar";
import { MobielVoortgang } from "@/components/MobielVoortgang";
import { BouwblokForm } from "@/components/BouwblokForm";
import { ScanBezet } from "@/components/ScanBezet";
import { useBewerkslot } from "@/lib/bewerkslot";

export default function DoorloopPage({
  params,
  searchParams,
}: {
  params: Promise<{ respondentId: string }>;
  searchParams: Promise<{ bouwblok?: string }>;
}) {
  const { respondentId } = use(params);
  const { bouwblok: gevraagdBouwblokId } = use(searchParams);
  const gegevens = useScanInvulling(respondentId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const router = useRouter();
  // Eén persoon tegelijk per scan (lib/bewerkslot.ts): De eerste houdt het slot, een tweede ziet een melding.
  const slot = useBewerkslot("scan", gegevens ? respondentId : null);

  // Gearchiveerde bouwblokken (datamodel.md, "Content bewerken") krijgt een
  // nieuwe invulling niet meer te zien.
  const alleBouwblokken = assessment ? actieveBouwblokkenMetGroep(assessment) : [];

  // Geen lazy-initializer: alleBouwblokken is pas na hydration (async localStorage-
  // lezing) gevuld, dus het actieve bouwblok wordt bij elke render opnieuw afgeleid
  // in plaats van één keer bij mount vastgezet.
  const [handmatigGekozenId, setHandmatigGekozenId] = useState<string | null>(null);
  const [testGemiddelde, setTestGemiddelde] = useState(3);
  const kandidaatId = handmatigGekozenId ?? gevraagdBouwblokId ?? null;
  const actieveBouwblokId =
    kandidaatId && alleBouwblokken.some((b) => b.bouwblok.id === kandidaatId)
      ? kandidaatId
      : (alleBouwblokken[0]?.bouwblok.id ?? null);

  useEffect(() => {
    if (!gegevens) return;
    if (gegevens.invulling.status === "uitgenodigd") {
      router.replace(`/scan/${respondentId}/intake`);
    }
  }, [gegevens, respondentId, router]);

  // Bij een nieuw bouwblok (via "Volgende" of een klik in de sidebar) moet het
  // hoofdscherm bovenaan beginnen — anders blijft de scrollpositie van het
  // vorige bouwblok staan en start je middenin de nieuwe vragenlijst.
  useEffect(() => {
    if (!actieveBouwblokId) return;
    window.scrollTo({ top: 0 });
  }, [actieveBouwblokId]);

  if (!gegevens || !assessment || !actieveBouwblokId) {
    return (
      <PageWithChrome>
        <div className="flex-1 px-6 py-16 text-center text-ink-m">Laden...</div>
      </PageWithChrome>
    );
  }

  if (gegevens.invulling.status === "uitgenodigd") {
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

  const { lid, invulling } = gegevens;
  const assessmentVast = assessment;
  const respondent = scanWeergave(lid, invulling);
  const huidigeIndex = alleBouwblokken.findIndex((b) => b.bouwblok.id === actieveBouwblokId);
  const huidig = alleBouwblokken[huidigeIndex];
  const isLaatsteBouwblok = huidigeIndex === alleBouwblokken.length - 1;

  function handleAntwoord(vraagId: string, waarde: number) {
    updateScanInvulling(respondentId, (i) => ({
      ...i,
      antwoorden: { ...i.antwoorden, [vraagId]: waarde },
    }));
  }

  function handleOpmerking(tekst: string) {
    updateScanInvulling(respondentId, (i) => ({
      ...i,
      opmerkingenPerBouwblok: { ...i.opmerkingenPerBouwblok, [huidig.bouwblok.id]: tekst },
    }));
  }

  function handleTestVulAutomatisch() {
    const vragen = actieveVragen(assessmentVast);
    const nieuweAntwoorden: Record<string, number> = {};
    vragen.forEach((vraag, i) => {
      const offset = (i % 3) - 1; // cyclisch: gemiddelde-1, gemiddelde, gemiddelde+1
      nieuweAntwoorden[vraag.id] = Math.min(5, Math.max(1, testGemiddelde + offset));
    });
    updateScanInvulling(respondentId, (i) => ({
      ...i,
      antwoorden: { ...i.antwoorden, ...nieuweAntwoorden },
      status: "afgerond",
      afgerondOp: i.afgerondOp ?? new Date().toISOString(),
    }));
    router.push(`/scan/${respondentId}/resultaten`);
  }

  function handleVolgende() {
    if (isLaatsteBouwblok) {
      if (invulling.status !== "afgerond") {
        updateScanInvulling(respondentId, (i) => ({
          ...i,
          status: "afgerond",
          afgerondOp: new Date().toISOString(),
        }));
      }
      router.push(`/scan/${respondentId}/resultaten`);
      return;
    }
    setHandmatigGekozenId(alleBouwblokken[huidigeIndex + 1].bouwblok.id);
  }

  return (
    <PageWithChrome
      logoHref={`/s/${lid.toegangscode}`}
      code={lid.toegangscode}
      toonTerug
      navRight={
        invulling.status === "afgerond" ? (
          <Link href={`/scan/${respondentId}/resultaten`}>Naar resultaten →</Link>
        ) : undefined
      }
      identiteitMenu={<MijnGegevensMenu lid={lid} />}
    >
      {/* TIJDELIJKE TESTKNOP — op verzoek van Sander, om het resultatenscherm
          (classificatiekleuren, radar chart, spreiding) te kunnen testen
          zonder alle vragen met de hand te beantwoorden. Verwijderen voor
          productie. */}
      <div
        className="container"
        style={{
          margin: "1rem auto 0",
          padding: "0.75rem 1rem",
          border: "1px dashed var(--or)",
          borderRadius: "0.5rem",
          background: "var(--or-faint)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span className="text-xs font-semibold" style={{ color: "var(--or)" }}>
          TESTKNOP (tijdelijk)
        </span>
        <label
          className="text-sm"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          Gemiddelde score
          <input
            type="number"
            min={2}
            max={4}
            step={1}
            value={testGemiddelde}
            onChange={(e) =>
              setTestGemiddelde(Math.min(4, Math.max(2, Number(e.target.value) || 3)))
            }
            style={{ width: "4rem" }}
          />
        </label>
        <button
          type="button"
          onClick={handleTestVulAutomatisch}
          className="btn btn-outline btn-compact"
        >
          Vul alle vragen automatisch in
        </button>
      </div>

      <MobielVoortgang assessment={assessment} respondent={respondent} />
      <div className="flow-layout flex-1">
        <Sidebar
          assessment={assessment}
          respondent={respondent}
          actieveBouwblokId={actieveBouwblokId}
          onSelecteer={setHandmatigGekozenId}
        />
        <main className="flow-main">
          <BouwblokForm
            bouwblok={huidig.bouwblok}
            categorieKleur={huidig.groepKleur}
            categorieNaam={huidig.groepNaam}
            bouwblokLabel={assessment.bouwblokLabel}
            eenheid={assessment.bouwblokEenheidEnkelvoud}
            schaal={assessment.schaal}
            respondent={respondent}
            isLaatsteBouwblok={isLaatsteBouwblok}
            onAntwoord={handleAntwoord}
            onOpmerking={handleOpmerking}
            onVolgende={handleVolgende}
          />
        </main>
      </div>
    </PageWithChrome>
  );
}
