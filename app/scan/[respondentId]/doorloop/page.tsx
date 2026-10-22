"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScanInvulling, updateScanInvulling, scanWeergave } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { actieveBouwblokkenMetGroep, actieveGroepen, actieveVragen } from "@/lib/assessment-structuur";
import { categorieVanToepassing, isVolledigIngevuld } from "@/lib/scoring";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import { isSpanning } from "@/lib/spanning";
import { Antwoord } from "@/lib/types";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";
import { Sidebar } from "@/components/Sidebar";
import { MobielVoortgang } from "@/components/MobielVoortgang";
import { BouwblokForm } from "@/components/BouwblokForm";
import { ScanBezet } from "@/components/ScanBezet";
import { SpanningSidebar } from "@/components/spanning/SpanningSidebar";
import { SpanningVeldForm } from "@/components/spanning/SpanningVeldForm";
import { useBewerkslot } from "@/lib/bewerkslot";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { useInstellingen } from "@/lib/instellingen-store";

export default function DoorloopPage({
  params,
  searchParams,
}: {
  params: Promise<{ respondentId: string }>;
  searchParams: Promise<{ bouwsteen?: string; bouwblok?: string }>;
}) {
  const { respondentId } = use(params);
  const { bouwsteen: gevraagdBouwsteenId, bouwblok: oudBouwblokId } = use(searchParams);
  const gevraagdBouwblokId = gevraagdBouwsteenId ?? oudBouwblokId;
  const gegevens = useScanInvulling(respondentId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const router = useRouter();
  // De testknop staat alleen aan als een Admin de instelling aanzette en alleen voor een ingelogde Admin of Consultant (`beheerpagina.md`, Schakelaar Testknop).
  const { testknopAan } = useInstellingen();
  const beheerder = useIngelogdeGebruiker();
  // Eén persoon tegelijk per scan (lib/bewerkslot.ts): De eerste houdt het slot, een tweede ziet een melding.
  const slot = useBewerkslot("scan", gegevens ? respondentId : null);

  // Gearchiveerde bouwblokken (datamodel.md, "Content bewerken") krijgt een
  // nieuwe invulling niet meer te zien. Bij een optionele categorie die niet van toepassing is, blijft alleen het eerste
  // bouwblok over (de kaarten met de relevantievraag): De rest wordt overgeslagen (`datamodel.md`, Optionele categorieën).
  const relevantie = gegevens?.invulling.relevantie;
  const alleBouwblokken = assessment
    ? actieveBouwblokkenMetGroep(assessment).filter((b, i, lijst) => {
        if (categorieVanToepassing(assessment, b.groepId, relevantie)) return true;
        return lijst.findIndex((x) => x.groepId === b.groepId) === i;
      })
    : [];

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
  const jaNee = isJaNeeWeetNiet(assessment);
  const spanning = isSpanning(assessment);
  // Een optionele categorie begint met haar kaarten bij het eerste bouwblok.
  const categorie = (assessment.categorieen ?? []).find((c) => c.id === huidig.groepId);
  const eersteVanOptioneleCategorie =
    categorie?.optioneel === true &&
    actieveBouwblokkenMetGroep(assessmentVast).find((b) => b.groepId === huidig.groepId)?.bouwblok.id === huidig.bouwblok.id;
  // Het nummer van de afdeling: De plek van de categorie in de volgorde van de afdelingen (`AFDELING {n}`).
  const afdelingNummer = actieveGroepen(assessment).findIndex((g) => g.id === huidig.groepId) + 1;
  const kanAfronden = isVolledigIngevuld(invulling.antwoorden, assessment, invulling.relevantie);

  function handleAntwoord(vraagId: string, waarde: Antwoord) {
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
    const nieuweAntwoorden: Record<string, Antwoord> = {};
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

  function handleRelevantie(categorieId: string, relevant: boolean) {
    updateScanInvulling(respondentId, (i) => ({
      ...i,
      relevantie: { ...(i.relevantie ?? {}), [categorieId]: relevant },
    }));
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
      {/* Geen testknop bij de Quickscan Ziekenhuis: Daar vult de respondent de scan zelf in (op verzoek van Sander). */}
      {!jaNee && testknopAan && beheerder && (
        <>
        {/* TESTKNOP — om het resultatenscherm (classificatiekleuren, radar chart, spreiding) te kunnen testen zonder alle vragen met de hand te
            beantwoorden. Alleen zichtbaar met de instelling `testknopAan` (standaard uit) en alleen voor een ingelogde Admin of Consultant. */}
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
            {/* Een keuzelijst met de toegestane waarden, geen invulveld: Er is niets anders dan 2, 3 of 4 te kiezen. */}
            <select
              className="veld-compact"
              value={testGemiddelde}
              onChange={(e) => setTestGemiddelde(Number(e.target.value))}
              aria-label="Gemiddelde score"
            >
              {[2, 3, 4].map((waarde) => (
                <option key={waarde} value={waarde}>
                  {waarde}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={handleTestVulAutomatisch}
            className="btn btn-outline btn-compact"
          >
            Vul alle vragen automatisch in
          </button>
        </div>
        </>
      )}

      <MobielVoortgang assessment={assessment} respondent={respondent} />
      <div className="flow-layout flex-1">
        {spanning ? (
          <SpanningSidebar
            assessment={assessment}
            respondent={respondent}
            actieveBouwblokId={actieveBouwblokId}
            onSelecteer={setHandmatigGekozenId}
          />
        ) : (
          <Sidebar
            assessment={assessment}
            respondent={respondent}
            actieveBouwblokId={actieveBouwblokId}
            onSelecteer={setHandmatigGekozenId}
          />
        )}
        <main className={spanning ? "flow-main flow-main--spanning" : "flow-main"}>
          {spanning ? (
            <SpanningVeldForm
              key={huidig.bouwblok.id}
              assessment={assessment}
              veld={huidig.bouwblok}
              respondent={respondent}
              eerste={huidigeIndex === 0}
              laatste={isLaatsteBouwblok}
              kanAfronden={kanAfronden}
              onAntwoord={handleAntwoord}
              onVoorbeeld={handleOpmerking}
              onVorige={() => setHandmatigGekozenId(alleBouwblokken[huidigeIndex - 1].bouwblok.id)}
              onVolgende={handleVolgende}
            />
          ) : (
            <BouwblokForm
              bouwblok={huidig.bouwblok}
              // Zonder categorielaag (de AI-scan) geldt `--or` als accent, niet de kleur van het domein (`stylesheet.md`, Doorloopflow).
              categorieKleur={huidig.groepNaam ? huidig.groepKleur : null}
              categorieNaam={huidig.groepNaam}
              bouwblokLabel={assessment.bouwblokLabel}
              schaal={assessment.schaal}
              respondent={respondent}
              isLaatsteBouwblok={isLaatsteBouwblok}
              jaNee={jaNee}
              instructieregel={assessment.instructieregel}
              afdeling={
                eersteVanOptioneleCategorie && categorie
                  ? {
                      categorie,
                      nummer: afdelingNummer,
                      relevantieVraag: assessment.relevantieVraag?.trim() || "Is dit onderdeel relevant voor uw situatie?",
                      relevantie: invulling.relevantie?.[categorie.id],
                      onRelevantie: (relevant) => handleRelevantie(categorie.id, relevant),
                    }
                  : undefined
              }
              kanAfronden={kanAfronden}
              onAntwoord={handleAntwoord}
              onOpmerking={handleOpmerking}
              onVolgende={handleVolgende}
            />
          )}
        </main>
      </div>
    </PageWithChrome>
  );
}
