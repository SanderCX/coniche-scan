import { Organisatie, ScanUitvoering } from "../types";
import { nieuwId } from "../id";
import { laadAlles, slaAlles } from "./store";
import { logAudit, nieuweGroepId } from "../audit-store";
import { metingContext } from "../audit-context";
import {
  STANDAARD_ONDERDEEL,
  genereerLabel,
  isGeldigeDatum,
  isSamengesteld,
  laatsteMeetdatum,
  meetdatumVan,
  metingMetCombinatie,
  onderdeelVan,
  onderliggendeMetingen,
  standaardLabel,
  voldoetAanMinScans,
} from "../metingen";

/**
 * Metingen plannen en wijzigen (`datamodel.md`, Meting; `beheerpagina.md`, punt 5; `benchmark.md`, Onderdeel en
 * samengestelde Meting). Een Meting is één onderdeel van één Assessment op één meetdatum. Een groepering daarboven bestaat
 * niet: Wat bij elkaar hoort, kiest de gebruiker bij een vergelijking of een gemiddelde.
 */

export type Resultaat<T = object> = ({ ok: true } & T) | { ok: false; reden: string };

function vindOrganisatie(alles: Organisatie[], id: string): Organisatie | undefined {
  return alles.find((o) => o.id === id);
}

/* ---------- Een Meting aanmaken en wijzigen ---------- */

export interface MetingInvoer {
  assessmentId: string;
  /** Standaard "Hele organisatie". */
  onderdeel?: string;
  /** Verplicht, `JJJJ-MM-DD`. De naam van de Meting volgt uit onderdeel en meetdatum. */
  meetdatum: string;
}

/**
 * Een Meting aanmaken met onderdeel en meetdatum (`beheerpagina.md`, punt 5). De naam van de Meting maakt de app uit
 * onderdeel en meetdatum (`datamodel.md`, Naam van een Meting). Dezelfde combinatie als een bestaande Meting is geen fout: De
 * uitkomst noemt die Meting in `dubbelVan`, zodat het scherm een waarschuwing kan tonen.
 */
export function maakMeting(organisatieId: string, input: MetingInvoer): Resultaat<{ meting: ScanUitvoering; dubbelVan?: string }> {
  const alles = laadAlles();
  const organisatie = vindOrganisatie(alles, organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  if (!isGeldigeDatum(input.meetdatum)) return { ok: false, reden: "Kies een meetdatum." };
  const onderdeel = input.onderdeel?.trim() || STANDAARD_ONDERDEEL;
  const dubbel = metingMetCombinatie(organisatie, onderdeel, input.assessmentId, input.meetdatum);

  const meting: ScanUitvoering = {
    id: nieuwId(),
    organisatieId,
    assessmentId: input.assessmentId,
    label: genereerLabel(onderdeel, input.meetdatum),
    onderdeel,
    meetdatum: input.meetdatum,
    aangemaaktOp: new Date().toISOString(),
    invullingen: [],
  };
  organisatie.scanUitvoeringen.push(meting);
  slaAlles(alles);
  logAudit({
    actie: "meting.aangemaakt",
    entiteitType: "meting",
    entiteitId: meting.id,
    entiteitNaam: meting.label,
    details: { ...metingContext(organisatie, meting), onderdeel, meetdatum: input.meetdatum },
  });
  return { ok: true, meting, dubbelVan: dubbel?.label };
}

export interface MetingWijziging {
  onderdeel?: string;
  /** `null`: De meetdatum leegmaken (alleen voor een Meting uit de tijd van de rondes, `datamodel.md`, Overgang). */
  meetdatum?: string | null;
  /** De gebruiker past de naam aan: Hij volgt onderdeel en meetdatum daarna niet meer. */
  label?: string;
  /** "Standaardnaam herstellen": De naam volgt onderdeel en meetdatum weer. */
  herstelLabel?: boolean;
}

/**
 * Onderdeel, meetdatum en naam van een Meting wijzigen (`beheerpagina.md`, punt 5, Wijzigen). Het Assessment ligt vast. De
 * naam volgt onderdeel en meetdatum, tenzij de gebruiker hem zelf heeft aangepast (`labelHandmatig`). Een samengestelde
 * Meting heeft geen eigen meetdatum: Die volgt haar onderliggende Metingen.
 */
export function wijzigMeting(metingId: string, wijziging: MetingWijziging): Resultaat<{ dubbelVan?: string }> {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.scanUitvoeringen.some((m) => m.id === metingId));
  const meting = organisatie?.scanUitvoeringen.find((m) => m.id === metingId);
  if (!organisatie || !meting) return { ok: false, reden: "Meting niet gevonden." };
  if (isSamengesteld(meting) && wijziging.meetdatum !== undefined) {
    return { ok: false, reden: "Een samengestelde Meting heeft geen eigen meetdatum: Ze volgt de onderliggende Metingen." };
  }
  if (wijziging.meetdatum !== undefined && wijziging.meetdatum !== null && !isGeldigeDatum(wijziging.meetdatum)) {
    return { ok: false, reden: "De meetdatum klopt niet." };
  }
  const naam = wijziging.label?.trim();
  if (wijziging.label !== undefined && !naam) return { ok: false, reden: "De naam is verplicht." };

  const oud = { label: meting.label, onderdeel: onderdeelVan(meting), meetdatum: meetdatumVan(meting) };
  const onderdeel = wijziging.onderdeel !== undefined ? wijziging.onderdeel.trim() || STANDAARD_ONDERDEEL : oud.onderdeel;
  const meetdatum = wijziging.meetdatum === undefined ? oud.meetdatum : wijziging.meetdatum;

  meting.onderdeel = onderdeel;
  if (meetdatum) meting.meetdatum = meetdatum;
  else delete meting.meetdatum;

  if (wijziging.herstelLabel) {
    meting.labelHandmatig = false;
    meting.label = standaardLabel(meting);
  } else if (naam !== undefined) {
    if (naam === standaardLabel(meting)) {
      meting.labelHandmatig = false;
      meting.label = naam;
    } else {
      meting.labelHandmatig = true;
      meting.label = naam;
    }
  } else if (!meting.labelHandmatig) {
    meting.label = standaardLabel(meting);
  }

  const dubbel = metingMetCombinatie(organisatie, onderdeel, meting.assessmentId, meetdatum, meting.id);
  slaAlles(alles);

  const velden = [
    meting.label !== oud.label ? "label" : null,
    onderdeel !== oud.onderdeel ? "onderdeel" : null,
    meetdatum !== oud.meetdatum ? "meetdatum" : null,
  ].filter((v): v is string => v !== null);
  const groepId = nieuweGroepId();
  logAudit([
    ...(velden.length > 0
      ? [
          {
            actie: velden.length === 1 && velden[0] === "label" ? "meting.hernoemd" : "meting.bewerkt",
            entiteitType: "meting",
            entiteitId: meting.id,
            entiteitNaam: meting.label,
            groepId,
            details: { ...metingContext(organisatie, meting), velden, oudLabel: oud.label },
          },
        ]
      : []),
    ...(meetdatum !== oud.meetdatum
      ? [
          {
            actie: "meting.meetdatumGewijzigd",
            entiteitType: "meting",
            entiteitId: meting.id,
            entiteitNaam: meting.label,
            groepId,
            details: { ...metingContext(organisatie, meting), oudeMeetdatum: oud.meetdatum, nieuweMeetdatum: meetdatum },
          },
        ]
      : []),
  ]);
  return { ok: true, dubbelVan: dubbel?.label };
}

export interface MeetdatumInstellenResultaat {
  gewijzigd: number;
  /** Samengestelde Metingen in de selectie: Hun meetdatum volgt de onderliggende Metingen. */
  overgeslagen: number;
}

/**
 * "Meetdatum instellen…" (`beheerpagina.md`, punt 5): Dezelfde meetdatum voor een selectie Metingen van één organisatie, voor
 * de bestaande Metingen die na het wegvallen van de rondes nog geen datum hebben. Eén gebeurtenis per Meting, onder één
 * groep (`datamodel.md`, Audit). Een samengestelde Meting slaat de actie over: Ze volgt haar onderliggende Metingen.
 */
export function zetMeetdatum(
  organisatieId: string,
  metingIds: string[],
  meetdatum: string
): Resultaat<MeetdatumInstellenResultaat> {
  if (!isGeldigeDatum(meetdatum)) return { ok: false, reden: "Kies een meetdatum." };
  const alles = laadAlles();
  const organisatie = vindOrganisatie(alles, organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  const gekozen = new Set(metingIds);
  const geraakt: { meting: ScanUitvoering; oud: string | null; oudLabel: string }[] = [];
  let overgeslagen = 0;
  for (const meting of organisatie.scanUitvoeringen) {
    if (!gekozen.has(meting.id)) continue;
    if (isSamengesteld(meting)) {
      overgeslagen += 1;
      continue;
    }
    const oud = meetdatumVan(meting);
    if (oud === meetdatum) continue;
    geraakt.push({ meting, oud, oudLabel: meting.label });
    meting.meetdatum = meetdatum;
    if (!meting.labelHandmatig) meting.label = standaardLabel(meting);
  }
  if (geraakt.length === 0) return { ok: true, gewijzigd: 0, overgeslagen };
  slaAlles(alles);
  const groepId = nieuweGroepId();
  logAudit(
    geraakt.map(({ meting, oud }) => ({
      actie: "meting.meetdatumGewijzigd",
      entiteitType: "meting",
      entiteitId: meting.id,
      entiteitNaam: meting.label,
      groepId,
      details: { ...metingContext(organisatie, meting), oudeMeetdatum: oud, nieuweMeetdatum: meetdatum },
    }))
  );
  return { ok: true, gewijzigd: geraakt.length, overgeslagen };
}

/* ---------- Samengestelde Meting ---------- */

export interface SamengesteldInvoer {
  assessmentId: string;
  /** Standaard "Hele organisatie". De naam van de Meting maakt de app. */
  onderdeel?: string;
  metingIds: string[];
  /** `benchmarkMinScans`: Elke onderliggende Meting moet daaraan voldoen. */
  minScans: number;
}

function valideerSamenstelling(
  organisatie: Organisatie,
  invoer: Pick<SamengesteldInvoer, "assessmentId" | "metingIds" | "minScans">
): string | null {
  const ids = [...new Set(invoer.metingIds)];
  if (ids.length < 2) return "Kies minstens twee Metingen.";
  for (const id of ids) {
    const m = organisatie.scanUitvoeringen.find((x) => x.id === id);
    if (!m) return "Een gekozen Meting bestaat niet meer.";
    if (isSamengesteld(m)) return "Een samengestelde Meting kan niet in een andere samengestelde Meting.";
    if (m.assessmentId !== invoer.assessmentId) return "Alle Metingen moeten hetzelfde Assessment hebben.";
    if (!meetdatumVan(m)) return `"${m.label}" heeft geen meetdatum. Vul die eerst in.`;
    if (!voldoetAanMinScans(organisatie, m, invoer.minScans)) {
      return `"${m.label}" heeft minder dan ${invoer.minScans} afgeronde scans.`;
    }
  }
  return null;
}

/**
 * Een samengestelde Meting maken (`beheerpagina.md`, punt 5; `benchmark.md`, Samengestelde Meting): Het gemiddelde van
 * minstens twee Metingen van één organisatie en één Assessment, elke Meting hoogstens één keer, op elke meetdatum. Ze heeft
 * geen Respondenten en kopieert geen antwoorden. Haar meetdatum is de laatste meetdatum van de selectie.
 */
export function maakSamengesteldeMeting(organisatieId: string, invoer: SamengesteldInvoer): Resultaat<{ meting: ScanUitvoering }> {
  const alles = laadAlles();
  const organisatie = vindOrganisatie(alles, organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  const fout = valideerSamenstelling(organisatie, invoer);
  if (fout) return { ok: false, reden: fout };
  const onderdeel = invoer.onderdeel?.trim() || STANDAARD_ONDERDEEL;
  const ids = [...new Set(invoer.metingIds)];
  const gekozen = ids.map((id) => organisatie.scanUitvoeringen.find((m) => m.id === id)!);
  const meetdatum = laatsteMeetdatum(gekozen)!;
  const meting: ScanUitvoering = {
    id: nieuwId(),
    organisatieId,
    assessmentId: invoer.assessmentId,
    label: genereerLabel(onderdeel, meetdatum),
    onderdeel,
    meetdatum,
    samenstelling: ids,
    aangemaaktOp: new Date().toISOString(),
    invullingen: [],
  };
  organisatie.scanUitvoeringen.push(meting);
  slaAlles(alles);
  logAudit({
    actie: "meting.samengesteldAangemaakt",
    entiteitType: "meting",
    entiteitId: meting.id,
    entiteitNaam: meting.label,
    details: {
      ...metingContext(organisatie, meting),
      onderliggendeMetingen: onderliggendeMetingen(organisatie, meting).map((m) => m.label),
    },
  });
  return { ok: true, meting };
}

/** De samenstelling of het onderdeel van een samengestelde Meting wijzigen. Het Assessment ligt vast, de meetdatum volgt de selectie. */
export function wijzigSamengesteldeMeting(
  metingId: string,
  wijziging: { onderdeel?: string; metingIds: string[]; minScans: number }
): Resultaat {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.scanUitvoeringen.some((m) => m.id === metingId));
  const meting = organisatie?.scanUitvoeringen.find((m) => m.id === metingId);
  if (!organisatie || !meting || !isSamengesteld(meting)) return { ok: false, reden: "Samengestelde Meting niet gevonden." };
  const fout = valideerSamenstelling(organisatie, {
    assessmentId: meting.assessmentId,
    metingIds: wijziging.metingIds,
    minScans: wijziging.minScans,
  });
  if (fout) return { ok: false, reden: fout };
  meting.samenstelling = [...new Set(wijziging.metingIds)];
  meting.onderdeel = wijziging.onderdeel !== undefined ? wijziging.onderdeel.trim() || STANDAARD_ONDERDEEL : onderdeelVan(meting);
  const datum = laatsteMeetdatum(onderliggendeMetingen(organisatie, meting));
  if (datum) meting.meetdatum = datum;
  if (!meting.labelHandmatig) meting.label = standaardLabel(meting);
  slaAlles(alles);
  logAudit({
    actie: "meting.samengesteldGewijzigd",
    entiteitType: "meting",
    entiteitId: meting.id,
    entiteitNaam: meting.label,
    details: { ...metingContext(organisatie, meting), onderliggendeMetingen: onderliggendeMetingen(organisatie, meting).map((m) => m.label) },
  });
  return { ok: true };
}
