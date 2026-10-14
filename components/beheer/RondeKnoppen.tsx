"use client";

import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { useInstellingen } from "@/lib/instellingen-store";
import { isSamengesteld, metingenInRonde, onderdeelVan, vergelijkbareMetingen, voldoetAanMinScans } from "@/lib/rondes";
import { metVia } from "@/lib/resultaten-nav";
import { Organisatie, Ronde } from "@/lib/types";
import { DropdownKnop } from "@/components/DropdownKnop";
import { InfoIcoon } from "@/components/InfoIcoon";

/**
 * De knoppen van een ronde (`beheerpagina.md`, punt 7, Ronde-overzicht): "Gemiddelde van deze ronde" en "Vergelijk met
 * vorige ronde". Eén component voor de rondekop in het organisatie-detail en de kop van het Ronde-overzicht.
 *
 * "Vergelijk met vorige ronde" is alleen actief als minstens één Meting in deze ronde een eerdere ronde heeft met dezelfde
 * combinatie van onderdeel en Assessment en met genoeg afgeronde scans (`benchmarkMinScans`). Anders staat hij
 * uitgeschakeld met de reden in `info.vergelijkRonde`. De vergelijking zelf is die van weergave C op de resultatenpagina van
 * de Meting: Met één mogelijkheid opent de knop direct, met meer kiest de gebruiker de Meting.
 */
export function RondeKnoppen({
  organisatie,
  ronde,
  onGemiddelde,
  via = false,
}: {
  organisatie: Organisatie;
  ronde: Ronde;
  onGemiddelde: () => void;
  via?: boolean;
}) {
  const router = useRouter();
  const assessments = useAssessments();
  const { benchmarkMinScans } = useInstellingen();
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";

  const mogelijkheden = metingenInRonde(organisatie, ronde.id).flatMap((m) => {
    if (!voldoetAanMinScans(organisatie, m, benchmarkMinScans)) return [];
    const vorige = vergelijkbareMetingen(organisatie, m).find(
      (v) => v.ontwikkeling && voldoetAanMinScans(organisatie, v.meting, benchmarkMinScans)
    );
    return vorige ? [{ meting: m, vorige: vorige.meting }] : [];
  });
  const open = (m: { meting: { id: string }; vorige: { id: string } }) =>
    router.push(metVia(`/beheer/rapportage/${m.meting.id}?vergelijk=${m.vorige.id}`, via));

  return (
    <>
      <button type="button" className="btn btn-outline btn-compact" onClick={onGemiddelde}>
        Gemiddelde van deze ronde
      </button>
      {mogelijkheden.length === 0 ? (
        <span className="knop-met-icoon">
          <button type="button" className="btn btn-outline btn-compact" disabled>
            Vergelijk met vorige ronde
          </button>
          <InfoIcoon sleutel="info.vergelijkRonde" naastVeld />
        </span>
      ) : mogelijkheden.length === 1 ? (
        <button type="button" className="btn btn-outline btn-compact" onClick={() => open(mogelijkheden[0])}>
          Vergelijk met vorige ronde
        </button>
      ) : (
        <DropdownKnop
          label="Vergelijk met vorige ronde"
          opties={mogelijkheden.map((m) => ({
            label: `${isSamengesteld(m.meting) ? "Gemiddelde" : onderdeelVan(m.meting)} · ${assessmentNaam(m.meting.assessmentId)}`,
            onClick: () => open(m),
          }))}
        />
      )}
    </>
  );
}
