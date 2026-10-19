import { laadAlles, slaAlles } from "./store";
import { logAudit, nieuweGroepId } from "../audit-store";
import { organisatieContext } from "../audit-context";
import { getInstellingen } from "../instellingen-store";
import { KpiWijziging, kpiMagOpPlek, pasKpiWijzigingenToe } from "../kpi";
import type { Resultaat } from "./meting-plannen";

/**
 * KPI-waarden van een Organisatie bewaren (`datamodel.md`, KPI's en kanalen; `beheerpagina.md`, punt 4, KPI's invullen). Eén keer
 * Opslaan bewaart de wijzigingen van alle plekken. Elke plek met wijzigingen is één gebeurtenis `kpi.waardenGewijzigd`, met één
 * `groepId` voor de hele keer, zonder persoonsgegevens (`details`: de Organisatie, de plek en de aantallen).
 */
export function bewaarKpiWaarden(organisatieId: string, wijzigingen: KpiWijziging[]): Resultaat<{ gewijzigd: number }> {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  const { kpiDefinities, kanalen } = getInstellingen();
  // Alleen wat mag: Een waarde op een plek die de KPI niet toestaat, een onbekende KPI, Onderdeel of kanaal, wordt niet bewaard.
  const geldig = wijzigingen.filter((w) => {
    const kpi = kpiDefinities.find((k) => k.id === w.kpiId);
    if (!kpi || !kpiMagOpPlek(kpi, w)) return false;
    if (w.onderdeelId !== null && !organisatie.onderdelen?.some((o) => o.id === w.onderdeelId)) return false;
    if (w.kanaalId !== null && !kanalen.some((k) => k.id === w.kanaalId)) return false;
    return w.waarde === null || Number.isFinite(w.waarde);
  });
  // Per plek (Onderdeel) tellen en loggen.
  const perPlek = new Map<string | null, KpiWijziging[]>();
  for (const w of geldig) perPlek.set(w.onderdeelId, [...(perPlek.get(w.onderdeelId) ?? []), w]);
  const logs: Parameters<typeof logAudit>[0] = [];
  const groepId = nieuweGroepId();
  let totaal = 0;
  for (const [onderdeelId, lijst] of perPlek) {
    const telling = pasKpiWijzigingenToe(organisatie, lijst);
    const n = telling.ingevuld + telling.gewijzigd + telling.gewist;
    if (n === 0) continue;
    totaal += n;
    (logs as unknown[]).push({
      actie: "kpi.waardenGewijzigd",
      entiteitType: "kpi",
      entiteitId: organisatie.id,
      entiteitNaam: organisatie.naam,
      groepId,
      details: {
        ...organisatieContext(organisatie),
        plek: onderdeelId === null ? "Algemeen" : (organisatie.onderdelen?.find((o) => o.id === onderdeelId)?.naam ?? "Onbekend onderdeel"),
        aantalIngevuld: telling.ingevuld,
        aantalGewijzigd: telling.gewijzigd,
        aantalGewist: telling.gewist,
      },
    });
  }
  if (totaal === 0) return { ok: true, gewijzigd: 0 };
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit(logs);
  return { ok: true, gewijzigd: totaal };
}
