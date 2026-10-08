import { Organisatie } from "../types";
import { nieuwId } from "../id";
import { laadAlles, slaAlles, useOrganisaties } from "./store";
import { logAudit, nieuweGroepId } from "../audit-store";
import { organisatieContext } from "../audit-context";
import { haalOrganisatiesUitBenchmarks } from "../benchmark-store";

/** Organisaties: aanmaken, bijwerken, verwijderen en overzetten naar een andere eigenaar. */

export function useOrganisatie(id: string): Organisatie | undefined {
  return useOrganisaties().find((o) => o.id === id);
}

export function maakOrganisatie(input: {
  naam: string;
  kenmerken: Record<string, unknown>;
  /** `Gebruiker.id` van de Consultant/Admin die aanmaakt — bepaalt het bereik "eigen" (`lib/rechten.ts`). */
  aangemaaktDoor: string;
}): Organisatie {
  const nu = new Date().toISOString();
  const organisatie: Organisatie = {
    id: nieuwId(),
    naam: input.naam,
    kenmerken: input.kenmerken,
    leden: [],
    scanUitvoeringen: [],
    aangemaaktDoor: input.aangemaaktDoor,
    toegewezenAan: [],
    benchmarkToegestaan: false,
    aangemaaktOp: nu,
    gewijzigdOp: nu,
  };
  const alles = laadAlles();
  alles.push(organisatie);
  slaAlles(alles);
  logAudit({
    actie: "organisatie.aangemaakt",
    entiteitType: "organisatie",
    entiteitId: organisatie.id,
    entiteitNaam: organisatie.naam,
    details: organisatieContext(organisatie),
  });
  return organisatie;
}

/** Cascadeert naar alle leden, scanuitvoeringen en invullingen van elke organisatie. */
export function verwijderOrganisaties(organisatieIds: string[]): void {
  const ids = new Set(organisatieIds);
  const alles = laadAlles();
  const weg = alles.filter((o) => ids.has(o.id));
  const groepId = nieuweGroepId();
  slaAlles(alles.filter((o) => !ids.has(o.id)));
  // Een organisatie weg haalt haar leden en toewijzingen uit de benchmarks (`datamodel.md`).
  haalOrganisatiesUitBenchmarks(
    weg.map((o) => ({ organisatieId: o.id, organisatieNaam: o.naam })),
    "de organisatie is verwijderd"
  );
  logAudit(
    weg.map((o) => ({
      actie: "organisatie.verwijderd",
      entiteitType: "organisatie",
      entiteitId: o.id,
      entiteitNaam: o.naam,
      groepId: weg.length > 1 ? groepId : null,
      details: {
        ...organisatieContext(o),
        aantalRespondenten: o.leden.length,
        aantalMetingen: o.scanUitvoeringen.length,
        aantalScans: o.scanUitvoeringen.reduce((n, m) => n + m.invullingen.length, 0),
      },
    }))
  );
}

export function updateOrganisatie(
  organisatieId: string,
  updater: (organisatie: Organisatie) => Organisatie
): void {
  const alles = laadAlles();
  const index = alles.findIndex((o) => o.id === organisatieId);
  if (index === -1) return;
  const { leden, scanUitvoeringen } = alles[index];
  const voor = alles[index];
  alles[index] = {
    ...updater(structuredClone(alles[index])),
    leden,
    scanUitvoeringen,
    gewijzigdOp: new Date().toISOString(),
  };
  slaAlles(alles);
  const na = alles[index];
  const velden = [
    voor.naam !== na.naam ? "naam" : null,
    JSON.stringify(voor.kenmerken) !== JSON.stringify(na.kenmerken) ? "kenmerken" : null,
    JSON.stringify(voor.toegewezenAan) !== JSON.stringify(na.toegewezenAan) ? "toegewezenAan" : null,
    voor.aangemaaktDoor !== na.aangemaaktDoor ? "aangemaaktDoor" : null,
  ].filter((v): v is string => v !== null);
  if (velden.length > 0) {
    logAudit({
      actie: "organisatie.bewerkt",
      entiteitType: "organisatie",
      entiteitId: na.id,
      entiteitNaam: na.naam,
      details: { ...organisatieContext(na), velden, ...(voor.naam !== na.naam ? { oudeNaam: voor.naam } : {}) },
    });
  }
}

/**
 * "Eigenaarschap overzetten" bij het deactiveren van een Consultant
 * (`beheerpagina.md` punt 9): Alle organisaties die de oude
 * gebruiker aanmaakte, gaan naar de nieuwe — nodig zodat het bereik
 * "aangemaakt" (`lib/rechten.ts`) niet ineens niemand meer toelaat.
 */
export function zetOrganisatiesOver(vanGebruikerId: string, naarGebruikerId: string): number {
  const alles = laadAlles();
  let aantal = 0;
  for (const organisatie of alles) {
    if (organisatie.aangemaaktDoor === vanGebruikerId) {
      organisatie.aangemaaktDoor = naarGebruikerId;
      aantal++;
    }
  }
  if (aantal > 0) slaAlles(alles);
  return aantal;
}

/**
 * De benchmark-vlag (`beheerpagina.md`, punt 4, Benchmark-vlag; `datamodel.md` deel 3): Een Admin zet hem aan nadat dit
 * met de organisatie is afgesproken. Uitzetten haalt de leden van de organisatie uit alle benchmarks. Wijzigen wordt
 * gelogd (`organisatie.benchmarkVlagGewijzigd`).
 */
export function zetBenchmarkVlag(organisatieId: string, toegestaan: boolean): void {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie || organisatie.benchmarkToegestaan === toegestaan) return;
  organisatie.benchmarkToegestaan = toegestaan;
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  if (!toegestaan) {
    haalOrganisatiesUitBenchmarks(
      [{ organisatieId: organisatie.id, organisatieNaam: organisatie.naam }],
      "de organisatie doet niet meer mee aan benchmarks"
    );
  }
  logAudit({
    actie: "organisatie.benchmarkVlagGewijzigd",
    entiteitType: "organisatie",
    entiteitId: organisatie.id,
    entiteitNaam: organisatie.naam,
    details: { ...organisatieContext(organisatie), benchmarkToegestaan: toegestaan },
  });
}
