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
  korteNaam?: string;
  kenmerken: Record<string, unknown>;
  /** `Gebruiker.id` van de Consultant/Admin die aanmaakt — bepaalt het bereik "eigen" (`lib/rechten.ts`). */
  aangemaaktDoor: string;
}): Organisatie {
  const nu = new Date().toISOString();
  const organisatie: Organisatie = {
    id: nieuwId(),
    naam: input.naam,
    ...(input.korteNaam?.trim() ? { korteNaam: input.korteNaam.trim().slice(0, 30) } : {}),
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

export type HernoemResultaat = { ok: true; gewijzigd: boolean } | { ok: false; reden: string };

/**
 * Een organisatie hernoemen (`beheerpagina.md`, punt 4, Naam wijzigen): Dezelfde regels als bij aanmaken, dus de naam is
 * verplicht en wordt getrimd. Alleen `Organisatie.naam` verandert: Het `id` en alle koppelingen (Metingen, Respondenten, scans,
 * benchmarks) blijven gelijk, dus de nieuwe naam staat direct overal. Gelogd als `organisatie.hernoemd`, met de oude en de
 * nieuwe naam in `details` (`datamodel.md`, Audit). Oudere audit-regels houden de naam zoals die was bij het loggen.
 */
export function hernoemOrganisatie(organisatieId: string, nieuweNaam: string): HernoemResultaat {
  const naam = nieuweNaam.trim();
  if (!naam) return { ok: false, reden: "De naam is verplicht." };
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  if (organisatie.naam === naam) return { ok: true, gewijzigd: false };
  const oudeNaam = organisatie.naam;
  organisatie.naam = naam;
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit({
    actie: "organisatie.hernoemd",
    entiteitType: "organisatie",
    entiteitId: organisatie.id,
    entiteitNaam: naam,
    details: { ...organisatieContext(organisatie), oudeNaam, nieuweNaam: naam },
  });
  return { ok: true, gewijzigd: true };
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
    (voor.korteNaam ?? "") !== (na.korteNaam ?? "") ? "korteNaam" : null,
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
  // Eerst uit de benchmarks, dan opslaan: `slaAlles` laat de vinkjes van Leads voor die benchmarks vervallen.
  if (!toegestaan) {
    haalOrganisatiesUitBenchmarks(
      [{ organisatieId: organisatie.id, organisatieNaam: organisatie.naam }],
      "de organisatie doet niet meer mee aan benchmarks",
      true
    );
  }
  slaAlles(alles);
  logAudit({
    actie: "organisatie.benchmarkVlagGewijzigd",
    entiteitType: "organisatie",
    entiteitId: organisatie.id,
    entiteitNaam: organisatie.naam,
    details: { ...organisatieContext(organisatie), benchmarkToegestaan: toegestaan },
  });
}

/**
 * "Namen tonen bij Antwoorden" (`beheerpagina.md`, punt 4 en punt 6a, Namen bij Antwoorden; `datamodel.md` deel 3): Een Admin zet
 * het aan na afstemming met de opdrachtgever. Uit: Een Lead ziet bij Antwoorden R1 tot en met Rn. Wijzigen wordt gelogd
 * (`organisatie.antwoordenNamenGewijzigd`). Dit zegt niets over de toestemming van de respondent: De intake verandert niet.
 */
export function zetAntwoordenMetNamen(organisatieId: string, aan: boolean): void {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie || (organisatie.antwoordenMetNamen === true) === aan) return;
  organisatie.antwoordenMetNamen = aan;
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit({
    actie: "organisatie.antwoordenNamenGewijzigd",
    entiteitType: "organisatie",
    entiteitId: organisatie.id,
    entiteitNaam: organisatie.naam,
    details: { ...organisatieContext(organisatie), antwoordenMetNamen: aan },
  });
}

/** Sluit de melding aan de Admin over de omzetting van het bereik van een Lead (`beheerpagina.md`, punt 6a, Overgang). */
export function sluitLeadOvergangMelding(organisatieId: string): void {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie || !organisatie.leadOvergangMelding) return;
  organisatie.leadOvergangMelding = null;
  slaAlles(alles);
}

/**
 * Laat de vinkjes van Leads kloppen met de benchmarks zoals ze nu zijn: Na het verwijderen of wijzigen van een benchmark vallen
 * de vinkjes voor die benchmark weg als de organisatie er geen lid van is, of bij niveau 2 geen Resultaten heeft op een
 * lid-Meting. Dat ruimt `slaAlles` bij elke opslag op, dit zorgt dat het meteen gebeurt. Geeft het aantal vervallen vinkjes.
 */
export function ruimBenchmarkVinkjesOp(): number {
  const alles = laadAlles();
  const voor = alles.reduce((n, o) => n + (o.leadToegang?.length ?? 0), 0);
  slaAlles(alles);
  const na = laadAlles().reduce((n, o) => n + (o.leadToegang?.length ?? 0), 0);
  return voor - na;
}
