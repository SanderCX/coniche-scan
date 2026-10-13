import { Organisatie, Ronde, ScanUitvoering } from "../types";
import { nieuwId } from "../id";
import { laadAlles, slaAlles } from "./store";
import { logAudit, nieuweGroepId } from "../audit-store";
import { metingContext, organisatieContext } from "../audit-context";
import { maakInvulling } from "./respondenten";
import {
  STANDAARD_ONDERDEEL,
  botsingTekst,
  controleerNaarRonde,
  genereerLabel,
  isSamengesteld,
  metingMetCombinatie,
  onderdeelVan,
  onderliggendeMetingen,
  rondeVan,
  NaarRondeRegel,
  rondesVan,
  samengesteldeMetingenMet,
  voldoetAanMinScans,
} from "../rondes";

/**
 * Rondes, onderdelen en samengestelde Metingen (`datamodel.md`, Ronde en onderdeel; `beheerpagina.md`, punt 5; `benchmark.md`,
 * Onderdeel en samengestelde Meting). Een Meting is één onderdeel in één ronde voor één Assessment. Een ronde zonder Metingen
 * verdwijnt vanzelf (`slaAlles`).
 */

export type Resultaat<T = object> = ({ ok: true } & T) | { ok: false; reden: string };

function vindOrganisatie(alles: Organisatie[], id: string): Organisatie | undefined {
  return alles.find((o) => o.id === id);
}

function nieuweRonde(organisatie: Organisatie, label: string): Ronde {
  const ronde: Ronde = {
    id: nieuwId(),
    organisatieId: organisatie.id,
    label: label.trim(),
    aangemaaktOp: new Date().toISOString(),
  };
  organisatie.rondes = [...rondesVan(organisatie), ronde];
  return ronde;
}

/* ---------- Een Meting aanmaken en wijzigen ---------- */

export interface MetingInvoer {
  assessmentId: string;
  /** Standaard "Hele organisatie". */
  onderdeel?: string;
  /** Een bestaande ronde, of `nieuweRondeLabel` voor een nieuwe. Een van beide is verplicht: De naam volgt uit onderdeel en ronde. */
  rondeId?: string;
  nieuweRondeLabel?: string;
}

/**
 * Een Meting aanmaken met ronde en onderdeel (`beheerpagina.md`, punt 5). De naam van de Meting maakt de app uit onderdeel
 * en ronde, een label is er niet meer om in te vullen (`datamodel.md`, Naam van een Meting). Hetzelfde onderdeel voor
 * hetzelfde Assessment in dezelfde ronde kan niet twee keer: De reden noemt de Meting die er al is en beide uitwegen.
 */
export function maakMeting(organisatieId: string, input: MetingInvoer): Resultaat<{ meting: ScanUitvoering }> {
  const alles = laadAlles();
  const organisatie = vindOrganisatie(alles, organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  const onderdeel = input.onderdeel?.trim() || STANDAARD_ONDERDEEL;

  let ronde: Ronde | undefined;
  let nieuw = false;
  if (input.rondeId) {
    ronde = rondesVan(organisatie).find((r) => r.id === input.rondeId);
    if (!ronde) return { ok: false, reden: "Ronde niet gevonden." };
  } else if (input.nieuweRondeLabel?.trim()) {
    ronde = nieuweRonde(organisatie, input.nieuweRondeLabel);
    nieuw = true;
  }
  if (!ronde) return { ok: false, reden: "Kies een ronde of geef een nieuwe ronde een naam." };

  const bestaand = metingMetCombinatie(organisatie, ronde.id, onderdeel, input.assessmentId);
  if (bestaand) return { ok: false, reden: botsingTekst(ronde.label, bestaand.label, "nieuw") };

  const label = genereerLabel(onderdeel, ronde.label);

  const meting: ScanUitvoering = {
    id: nieuwId(),
    organisatieId,
    assessmentId: input.assessmentId,
    rondeId: ronde.id,
    label,
    onderdeel,
    aangemaaktOp: new Date().toISOString(),
    invullingen: [],
  };
  organisatie.scanUitvoeringen.push(meting);
  slaAlles(alles);
  logAudit([
    ...(nieuw
      ? [{ actie: "ronde.aangemaakt", entiteitType: "ronde", entiteitId: ronde.id, entiteitNaam: ronde.label, details: { ...organisatieContext(organisatie), aantalMetingen: 1 } }]
      : []),
    { actie: "meting.aangemaakt", entiteitType: "meting", entiteitId: meting.id, entiteitNaam: meting.label, details: { ...metingContext(organisatie, meting), onderdeel, ronde: ronde.label } },
  ]);
  return { ok: true, meting };
}

export interface MetingWijziging {
  onderdeel?: string;
  /** `null`: De Meting uit zijn ronde halen. */
  rondeId?: string | null;
  nieuweRondeLabel?: string;
}

/**
 * Onderdeel en ronde van een Meting wijzigen (`beheerpagina.md`, punt 5, Wijzigen). Het Assessment ligt vast. De naam volgt
 * vanzelf uit onderdeel en ronde. Een Meting zonder ronde houdt haar oude label zolang ze geen ronde krijgt.
 */
export function wijzigMeting(metingId: string, wijziging: MetingWijziging): Resultaat {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.scanUitvoeringen.some((m) => m.id === metingId));
  const meting = organisatie?.scanUitvoeringen.find((m) => m.id === metingId);
  if (!organisatie || !meting) return { ok: false, reden: "Meting niet gevonden." };

  const oud = { label: meting.label, onderdeel: onderdeelVan(meting), ronde: rondeVan(organisatie, meting)?.label ?? null };

  const nieuwOnderdeel = wijziging.onderdeel !== undefined ? wijziging.onderdeel.trim() || STANDAARD_ONDERDEEL : onderdeelVan(meting);
  let rondeId = meting.rondeId;
  let nieuweRondeAangemaakt: Ronde | undefined;
  if (wijziging.nieuweRondeLabel?.trim()) {
    nieuweRondeAangemaakt = nieuweRonde(organisatie, wijziging.nieuweRondeLabel);
    rondeId = nieuweRondeAangemaakt.id;
  } else if (wijziging.rondeId !== undefined) {
    rondeId = wijziging.rondeId ?? undefined;
  }
  if (isSamengesteld(meting) && rondeId !== meting.rondeId) {
    return { ok: false, reden: "Een samengestelde Meting hoort bij de ronde van haar onderliggende Metingen." };
  }
  const ronde = rondeId ? rondesVan(organisatie).find((r) => r.id === rondeId) : undefined;
  if (rondeId && !ronde) return { ok: false, reden: "Ronde niet gevonden." };
  if (ronde) {
    const bestaand = metingMetCombinatie(organisatie, ronde.id, nieuwOnderdeel, meting.assessmentId, meting.id);
    if (bestaand) return { ok: false, reden: botsingTekst(ronde.label, bestaand.label, "deze") };
  }

  meting.onderdeel = nieuwOnderdeel;
  if (rondeId) meting.rondeId = rondeId;
  else delete meting.rondeId;
  if (ronde) meting.label = genereerLabel(nieuwOnderdeel, ronde.label);

  // Een onderliggende Meting die naar een andere ronde gaat, valt uit de samenstelling van de samengestelde Meting daar.
  for (const s of samengesteldeMetingenMet(organisatie, meting.id)) {
    if (s.rondeId !== meting.rondeId) s.samenstelling = s.samenstelling!.filter((id) => id !== meting.id);
  }
  slaAlles(alles);

  const velden = [
    meting.label !== oud.label ? "label" : null,
    nieuwOnderdeel !== oud.onderdeel ? "onderdeel" : null,
    (ronde?.label ?? null) !== oud.ronde ? "ronde" : null,
  ].filter((v): v is string => v !== null);
  logAudit([
    ...(nieuweRondeAangemaakt
      ? [{ actie: "ronde.aangemaakt", entiteitType: "ronde", entiteitId: nieuweRondeAangemaakt.id, entiteitNaam: nieuweRondeAangemaakt.label, details: { ...organisatieContext(organisatie), aantalMetingen: 1 } }]
      : []),
    ...(velden.length > 0
      ? [
          {
            actie: velden.length === 1 && velden[0] === "label" ? "meting.hernoemd" : "meting.bewerkt",
            entiteitType: "meting",
            entiteitId: meting.id,
            entiteitNaam: meting.label,
            details: { ...metingContext(organisatie, meting), velden, oudLabel: oud.label, ...(velden.includes("ronde") ? { oudeRonde: oud.ronde, nieuweRonde: ronde?.label ?? null } : {}) },
          },
        ]
      : []),
  ]);
  return { ok: true };
}

/* ---------- Rondes beheren ---------- */

/**
 * Een ronde hernoemen (`beheerpagina.md`, punt 5, Rondes beheren). Labels van Metingen die nog het gegenereerde label zijn,
 * volgen de nieuwe naam. Gelogd als `ronde.hernoemd`, met de oude en de nieuwe naam.
 */
export function hernoemRonde(rondeId: string, nieuweNaam: string): Resultaat<{ gewijzigd: boolean }> {
  const naam = nieuweNaam.trim();
  if (!naam) return { ok: false, reden: "De naam is verplicht." };
  const alles = laadAlles();
  const organisatie = alles.find((o) => rondesVan(o).some((r) => r.id === rondeId));
  const ronde = organisatie && rondesVan(organisatie).find((r) => r.id === rondeId);
  if (!organisatie || !ronde) return { ok: false, reden: "Ronde niet gevonden." };
  if (ronde.label === naam) return { ok: true, gewijzigd: false };
  const oudeNaam = ronde.label;
  for (const m of organisatie.scanUitvoeringen) {
    if (m.rondeId === rondeId && m.label === genereerLabel(onderdeelVan(m), oudeNaam)) {
      m.label = genereerLabel(onderdeelVan(m), naam);
    }
  }
  ronde.label = naam;
  slaAlles(alles);
  logAudit({
    actie: "ronde.hernoemd",
    entiteitType: "ronde",
    entiteitId: ronde.id,
    entiteitNaam: naam,
    details: { ...organisatieContext(organisatie), oudeNaam, nieuweNaam: naam },
  });
  return { ok: true, gewijzigd: true };
}

export interface NaarRondeResultaat {
  verplaatst: number;
  rondeLabel: string;
}

/**
 * "Naar ronde…" (`beheerpagina.md`, punt 5, Rondes beheren): Hangt één of meer Metingen aan een bestaande of nieuwe ronde,
 * elk met een eigen onderdeel. Alles of niets: Vóór het schrijven loopt dezelfde controle als in het scherm
 * (`controleerNaarRonde`), en bij één botsing verandert er niets. De naam van elke Meting volgt uit onderdeel en ronde, ook
 * die van een geïmporteerde Meting. Een samengestelde Meting hoort bij de ronde van haar onderliggende Metingen.
 */
export function naarRonde(
  organisatieId: string,
  regels: NaarRondeRegel[],
  doel: { rondeId: string } | { nieuweRondeLabel: string }
): Resultaat<NaarRondeResultaat> & { fouten?: Record<string, string> } {
  if (regels.length === 0) return { ok: false, reden: "Kies minstens één Meting." };
  const alles = laadAlles();
  const organisatie = vindOrganisatie(alles, organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  let ronde: Ronde | undefined;
  let nieuw = false;
  let nieuweNaam = "";
  if ("rondeId" in doel) {
    ronde = rondesVan(organisatie).find((r) => r.id === doel.rondeId);
    if (!ronde) return { ok: false, reden: "Ronde niet gevonden." };
  } else {
    nieuweNaam = doel.nieuweRondeLabel.trim();
    if (!nieuweNaam) return { ok: false, reden: "Geef de nieuwe ronde een naam." };
  }
  const rondeLabel = ronde?.label ?? nieuweNaam;

  const fouten = controleerNaarRonde(organisatie, ronde?.id ?? null, rondeLabel, regels);
  if (Object.keys(fouten).length > 0) return { ok: false, reden: "Niet alle Metingen passen in deze ronde.", fouten };

  if (!ronde) {
    ronde = nieuweRonde(organisatie, nieuweNaam);
    nieuw = true;
  }
  const bij: { meting: ScanUitvoering; oudeRonde: string | null }[] = [];
  for (const regel of regels) {
    const m = organisatie.scanUitvoeringen.find((x) => x.id === regel.metingId)!;
    const onderdeel = regel.onderdeel.trim() || STANDAARD_ONDERDEEL;
    bij.push({ meting: m, oudeRonde: rondeVan(organisatie, m)?.label ?? null });
    m.rondeId = ronde.id;
    m.onderdeel = onderdeel;
    m.label = genereerLabel(onderdeel, ronde.label);
  }
  // Een onderliggende Meting in een andere ronde valt uit de samenstelling van de samengestelde Meting in de oude ronde.
  for (const { meting } of bij) {
    for (const s of samengesteldeMetingenMet(organisatie, meting.id)) {
      if (s.rondeId !== meting.rondeId) s.samenstelling = s.samenstelling!.filter((id) => id !== meting.id);
    }
  }
  slaAlles(alles);
  const groepId = nieuweGroepId();
  logAudit([
    ...(nieuw
      ? [{ actie: "ronde.aangemaakt", entiteitType: "ronde", entiteitId: ronde.id, entiteitNaam: ronde.label, groepId, details: { ...organisatieContext(organisatie), aantalMetingen: bij.length } }]
      : []),
    ...bij.map(({ meting, oudeRonde }) => ({
      actie: "meting.bewerkt",
      entiteitType: "meting",
      entiteitId: meting.id,
      entiteitNaam: meting.label,
      groepId,
      details: { ...metingContext(organisatie, meting), velden: ["ronde", "onderdeel"], oudeRonde, nieuweRonde: ronde!.label },
    })),
  ]);
  return { ok: true, verplaatst: bij.length, rondeLabel: ronde.label };
}

/* ---------- Nieuwe ronde starten ---------- */

export interface NieuweRondeInvoer {
  label: string;
  /** De vorige ronde waaruit de Metingen komen. */
  vanRondeId: string;
  /** De Metingen die meegaan (onderdeel en Assessment worden overgenomen). */
  metingIds: string[];
  /** Standaard uit: Elke nieuwe Meting krijgt dezelfde Respondenten met de status "uitgenodigd". */
  respondentenMeenemen?: boolean;
}

/**
 * "Nieuwe ronde starten" (`beheerpagina.md`, punt 5): Maakt de ronde en per vinkje een Meting met hetzelfde onderdeel en
 * Assessment, het gegenereerde label en het `rondeId` van de nieuwe ronde. Een samengestelde Meting gaat alleen mee als al
 * haar onderliggende Metingen meegaan: De nieuwe samengestelde Meting verwijst dan naar de nieuwe Metingen.
 */
export function startNieuweRonde(
  organisatieId: string,
  invoer: NieuweRondeInvoer
): Resultaat<{ ronde: Ronde; aantalMetingen: number }> {
  const naam = invoer.label.trim();
  if (!naam) return { ok: false, reden: "De naam van de ronde is verplicht." };
  const alles = laadAlles();
  const organisatie = vindOrganisatie(alles, organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  const vorige = rondesVan(organisatie).find((r) => r.id === invoer.vanRondeId);
  if (!vorige) return { ok: false, reden: "De vorige ronde bestaat niet." };

  const gekozen = invoer.metingIds
    .map((id) => organisatie.scanUitvoeringen.find((m) => m.id === id))
    .filter((m): m is ScanUitvoering => !!m && m.rondeId === vorige.id);
  if (gekozen.length === 0) return { ok: false, reden: "Kies minstens één Meting om mee te nemen." };

  const gekozenIds = new Set(gekozen.map((m) => m.id));
  const gewoon = gekozen.filter((m) => !isSamengesteld(m));
  const samengesteld = gekozen.filter(isSamengesteld);
  for (const s of samengesteld) {
    if (!s.samenstelling!.every((id) => gekozenIds.has(id))) {
      return { ok: false, reden: `"${s.label}" gaat alleen mee als al haar onderliggende Metingen meegaan.` };
    }
  }

  const ronde = nieuweRonde(organisatie, naam);
  const nu = new Date().toISOString();
  const nieuweVoorOud = new Map<string, ScanUitvoering>();
  for (const m of gewoon) {
    const kopie: ScanUitvoering = {
      id: nieuwId(),
      organisatieId,
      assessmentId: m.assessmentId,
      rondeId: ronde.id,
      label: genereerLabel(onderdeelVan(m), ronde.label),
      onderdeel: onderdeelVan(m),
      aangemaaktOp: nu,
      invullingen: [],
    };
    if (invoer.respondentenMeenemen) {
      // Dezelfde Respondent (niet opnieuw aangemaakt), een eigen invulling met status "uitgenodigd".
      kopie.invullingen = m.invullingen.map((i) => maakInvulling(kopie.id, i.organisatieLidId));
    }
    nieuweVoorOud.set(m.id, kopie);
    organisatie.scanUitvoeringen.push(kopie);
  }
  for (const s of samengesteld) {
    const onder = s.samenstelling!.map((id) => nieuweVoorOud.get(id)).filter((m): m is ScanUitvoering => !!m);
    organisatie.scanUitvoeringen.push({
      id: nieuwId(),
      organisatieId,
      assessmentId: s.assessmentId,
      rondeId: ronde.id,
      label: genereerLabel(onderdeelVan(s), ronde.label),
      onderdeel: onderdeelVan(s),
      samenstelling: onder.map((m) => m.id),
      aangemaaktOp: nu,
      invullingen: [],
    });
  }
  slaAlles(alles);
  const aantal = gewoon.length + samengesteld.length;
  logAudit({
    actie: "ronde.aangemaakt",
    entiteitType: "ronde",
    entiteitId: ronde.id,
    entiteitNaam: ronde.label,
    details: {
      ...organisatieContext(organisatie),
      vorigeRonde: vorige.label,
      aantalMetingen: aantal,
      respondentenMeegenomen: invoer.respondentenMeenemen === true,
    },
  });
  return { ok: true, ronde, aantalMetingen: aantal };
}

/* ---------- Samengestelde Meting ---------- */

export interface SamengesteldInvoer {
  rondeId: string;
  assessmentId: string;
  /** Standaard "Hele organisatie". De naam van de Meting maakt de app. */
  onderdeel?: string;
  metingIds: string[];
  /** `benchmarkMinScans`: Elke onderliggende Meting moet daaraan voldoen. */
  minScans: number;
}

function valideerSamenstelling(
  organisatie: Organisatie,
  invoer: Pick<SamengesteldInvoer, "rondeId" | "assessmentId" | "metingIds" | "minScans">
): string | null {
  const ids = [...new Set(invoer.metingIds)];
  if (ids.length < 2) return "Kies minstens twee Metingen.";
  for (const id of ids) {
    const m = organisatie.scanUitvoeringen.find((x) => x.id === id);
    if (!m) return "Een gekozen Meting bestaat niet meer.";
    if (isSamengesteld(m)) return "Een samengestelde Meting kan niet in een andere samengestelde Meting.";
    if (m.assessmentId !== invoer.assessmentId) return "Alle Metingen moeten hetzelfde Assessment hebben.";
    if (m.rondeId !== invoer.rondeId) return "Alle Metingen moeten in dezelfde ronde staan.";
    if (!voldoetAanMinScans(organisatie, m, invoer.minScans)) {
      return `"${m.label}" heeft minder dan ${invoer.minScans} afgeronde scans.`;
    }
  }
  return null;
}

/**
 * Een samengestelde Meting maken (`beheerpagina.md`, punt 5; `benchmark.md`, Samengestelde Meting): Het gemiddelde van
 * minstens twee Metingen van één ronde, één organisatie en één Assessment, elke Meting hoogstens één keer. Ze hoort bij die
 * ronde, heeft geen Respondenten en kopieert geen antwoorden.
 */
export function maakSamengesteldeMeting(organisatieId: string, invoer: SamengesteldInvoer): Resultaat<{ meting: ScanUitvoering }> {
  const alles = laadAlles();
  const organisatie = vindOrganisatie(alles, organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  const ronde = rondesVan(organisatie).find((r) => r.id === invoer.rondeId);
  if (!ronde) return { ok: false, reden: "Ronde niet gevonden." };
  const fout = valideerSamenstelling(organisatie, invoer);
  if (fout) return { ok: false, reden: fout };
  const onderdeel = invoer.onderdeel?.trim() || STANDAARD_ONDERDEEL;
  const bestaand = metingMetCombinatie(organisatie, ronde.id, onderdeel, invoer.assessmentId);
  if (bestaand) {
    return { ok: false, reden: botsingTekst(ronde.label, bestaand.label, "nieuw") };
  }
  const label = genereerLabel(onderdeel, ronde.label);
  const meting: ScanUitvoering = {
    id: nieuwId(),
    organisatieId,
    assessmentId: invoer.assessmentId,
    rondeId: ronde.id,
    label,
    onderdeel,
    samenstelling: [...new Set(invoer.metingIds)],
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

/** De samenstelling of het onderdeel van een samengestelde Meting wijzigen. De ronde en het Assessment liggen vast. */
export function wijzigSamengesteldeMeting(
  metingId: string,
  wijziging: { onderdeel?: string; metingIds: string[]; minScans: number }
): Resultaat {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.scanUitvoeringen.some((m) => m.id === metingId));
  const meting = organisatie?.scanUitvoeringen.find((m) => m.id === metingId);
  if (!organisatie || !meting || !isSamengesteld(meting)) return { ok: false, reden: "Samengestelde Meting niet gevonden." };
  const fout = valideerSamenstelling(organisatie, {
    rondeId: meting.rondeId ?? "",
    assessmentId: meting.assessmentId,
    metingIds: wijziging.metingIds,
    minScans: wijziging.minScans,
  });
  if (fout) return { ok: false, reden: fout };
  const onderdeel = wijziging.onderdeel !== undefined ? wijziging.onderdeel.trim() || STANDAARD_ONDERDEEL : onderdeelVan(meting);
  if (meting.rondeId) {
    const bestaand = metingMetCombinatie(organisatie, meting.rondeId, onderdeel, meting.assessmentId, meting.id);
    if (bestaand) {
      const ronde = rondesVan(organisatie).find((r) => r.id === meting.rondeId);
      return { ok: false, reden: botsingTekst(ronde?.label ?? "deze ronde", bestaand.label, "deze") };
    }
  }
  meting.samenstelling = [...new Set(wijziging.metingIds)];
  meting.onderdeel = onderdeel;
  const ronde = rondeVan(organisatie, meting);
  if (ronde) meting.label = genereerLabel(onderdeel, ronde.label);
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
