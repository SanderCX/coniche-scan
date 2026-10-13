import { Organisatie, Ronde, ScanUitvoering } from "../types";
import { nieuwId } from "../id";
import { laadAlles, slaAlles } from "./store";
import { logAudit } from "../audit-store";
import { metingContext, organisatieContext } from "../audit-context";
import { maakInvulling } from "./respondenten";
import {
  STANDAARD_ONDERDEEL,
  genereerLabel,
  isSamengesteld,
  metingMetCombinatie,
  onderdeelVan,
  onderliggendeMetingen,
  rondeVan,
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

/** De ronde van een Meting is bekend aan de organisatie: Nog niet opgeslagen rondes bestaan alleen binnen één actie. */
function labelVolgtGegenereerd(meting: ScanUitvoering, organisatie: Organisatie): boolean {
  const ronde = rondeVan(organisatie, meting);
  return !!ronde && meting.label === genereerLabel(onderdeelVan(meting), ronde.label);
}

/* ---------- Een Meting aanmaken en wijzigen ---------- */

export interface MetingInvoer {
  assessmentId: string;
  /** Leeg: Het gegenereerde label ("{onderdeel} | {ronde}"). */
  label?: string;
  /** Standaard "Hele organisatie". */
  onderdeel?: string;
  /** Een bestaande ronde, of `nieuweRondeLabel` voor een nieuwe. Zonder beide staat de Meting zonder ronde. */
  rondeId?: string;
  nieuweRondeLabel?: string;
}

/**
 * Een Meting aanmaken met ronde en onderdeel (`beheerpagina.md`, punt 5). Hetzelfde onderdeel voor hetzelfde Assessment in
 * dezelfde ronde kan niet twee keer: De reden noemt de Meting die er al is.
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

  if (ronde) {
    const bestaand = metingMetCombinatie(organisatie, ronde.id, onderdeel, input.assessmentId);
    if (bestaand) {
      return { ok: false, reden: `In ${ronde.label} staat voor dit onderdeel en Assessment al de Meting "${bestaand.label}".` };
    }
  }

  const label = input.label?.trim() || (ronde ? genereerLabel(onderdeel, ronde.label) : "");
  if (!label) return { ok: false, reden: "Geef de Meting een label of kies een ronde." };

  const meting: ScanUitvoering = {
    id: nieuwId(),
    organisatieId,
    assessmentId: input.assessmentId,
    ...(ronde ? { rondeId: ronde.id } : {}),
    label,
    onderdeel,
    aangemaaktOp: new Date().toISOString(),
    invullingen: [],
  };
  organisatie.scanUitvoeringen.push(meting);
  slaAlles(alles);
  logAudit([
    ...(nieuw && ronde
      ? [{ actie: "ronde.aangemaakt", entiteitType: "ronde", entiteitId: ronde.id, entiteitNaam: ronde.label, details: { ...organisatieContext(organisatie), aantalMetingen: 1 } }]
      : []),
    { actie: "meting.aangemaakt", entiteitType: "meting", entiteitId: meting.id, entiteitNaam: meting.label, details: { ...metingContext(organisatie, meting), onderdeel, ronde: ronde?.label ?? null } },
  ]);
  return { ok: true, meting };
}

export interface MetingWijziging {
  label?: string;
  onderdeel?: string;
  /** `null`: De Meting uit zijn ronde halen. */
  rondeId?: string | null;
  nieuweRondeLabel?: string;
}

/**
 * Label, onderdeel en ronde van een Meting wijzigen (`beheerpagina.md`, punt 5, Wijzigen). Het Assessment ligt vast. Een
 * label dat nog het gegenereerde label is, volgt het nieuwe onderdeel of de nieuwe ronde (`datamodel.md`, Label). Een
 * label dat met de hand is aangepast, blijft staan.
 */
export function wijzigMeting(metingId: string, wijziging: MetingWijziging): Resultaat {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.scanUitvoeringen.some((m) => m.id === metingId));
  const meting = organisatie?.scanUitvoeringen.find((m) => m.id === metingId);
  if (!organisatie || !meting) return { ok: false, reden: "Meting niet gevonden." };

  const volgdLabel = labelVolgtGegenereerd(meting, organisatie);
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
    if (bestaand) {
      return { ok: false, reden: `In ${ronde.label} staat voor dit onderdeel en Assessment al de Meting "${bestaand.label}".` };
    }
  }

  meting.onderdeel = nieuwOnderdeel;
  if (rondeId) meting.rondeId = rondeId;
  else delete meting.rondeId;
  if (wijziging.label !== undefined && wijziging.label.trim()) meting.label = wijziging.label.trim();
  else if (volgdLabel && ronde) meting.label = genereerLabel(nieuwOnderdeel, ronde.label);

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
  overgeslagen: { metingId: string; label: string; reden: string }[];
  rondeLabel: string;
}

/**
 * "Naar ronde…" (`beheerpagina.md`, punt 5, Rondes beheren): Hangt één of meer Metingen aan een bestaande of nieuwe ronde.
 * Een Meting kan alleen naar een ronde waarin haar onderdeel en Assessment nog niet voorkomen, en een samengestelde Meting
 * hoort bij de ronde van haar onderliggende Metingen. Overgeslagen Metingen staan met reden in het resultaat.
 */
export function naarRonde(
  organisatieId: string,
  metingIds: string[],
  doel: { rondeId: string } | { nieuweRondeLabel: string }
): Resultaat<NaarRondeResultaat> {
  const alles = laadAlles();
  const organisatie = vindOrganisatie(alles, organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  let ronde: Ronde | undefined;
  let nieuw = false;
  if ("rondeId" in doel) {
    ronde = rondesVan(organisatie).find((r) => r.id === doel.rondeId);
    if (!ronde) return { ok: false, reden: "Ronde niet gevonden." };
  } else {
    if (!doel.nieuweRondeLabel.trim()) return { ok: false, reden: "Geef de nieuwe ronde een naam." };
    ronde = nieuweRonde(organisatie, doel.nieuweRondeLabel);
    nieuw = true;
  }

  const overgeslagen: NaarRondeResultaat["overgeslagen"] = [];
  let verplaatst = 0;
  const bij: ScanUitvoering[] = [];
  for (const id of metingIds) {
    const m = organisatie.scanUitvoeringen.find((x) => x.id === id);
    if (!m) continue;
    if (isSamengesteld(m)) {
      overgeslagen.push({ metingId: id, label: m.label, reden: "Een samengestelde Meting hoort bij de ronde van haar onderliggende Metingen." });
      continue;
    }
    if (m.rondeId === ronde.id) continue;
    const bestaand = metingMetCombinatie(organisatie, ronde.id, onderdeelVan(m), m.assessmentId, m.id);
    if (bestaand) {
      overgeslagen.push({ metingId: id, label: m.label, reden: `In ${ronde.label} staat voor dit onderdeel en Assessment al "${bestaand.label}".` });
      continue;
    }
    const volgde = labelVolgtGegenereerd(m, organisatie);
    m.rondeId = ronde.id;
    // Een met de hand aangepast label (of het label van een import) blijft staan.
    if (volgde) m.label = genereerLabel(onderdeelVan(m), ronde.label);
    bij.push(m);
    verplaatst += 1;
  }
  // Een onderliggende Meting in een andere ronde valt uit de samenstelling van de samengestelde Meting in de oude ronde.
  for (const m of bij) {
    for (const s of samengesteldeMetingenMet(organisatie, m.id)) {
      if (s.rondeId !== m.rondeId) s.samenstelling = s.samenstelling!.filter((id) => id !== m.id);
    }
  }
  if (nieuw && verplaatst === 0) {
    // Een nieuwe ronde zonder Metingen bestaat niet: Terugdraaien.
    organisatie.rondes = rondesVan(organisatie).filter((r) => r.id !== ronde!.id);
    nieuw = false;
  }
  slaAlles(alles);
  if (verplaatst > 0) {
    logAudit([
      ...(nieuw ? [{ actie: "ronde.aangemaakt", entiteitType: "ronde", entiteitId: ronde.id, entiteitNaam: ronde.label, details: { ...organisatieContext(organisatie), aantalMetingen: verplaatst } }] : []),
      ...bij.map((m) => ({
        actie: "meting.bewerkt",
        entiteitType: "meting",
        entiteitId: m.id,
        entiteitNaam: m.label,
        details: { ...metingContext(organisatie, m), velden: ["ronde"], nieuweRonde: ronde!.label },
      })),
    ]);
  }
  return { ok: true, verplaatst, overgeslagen, rondeLabel: ronde.label };
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
  label: string;
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
    return {
      ok: false,
      reden: `In ${ronde.label} bestaat voor het onderdeel "${onderdeel}" al "${bestaand.label}". Kies een andere naam voor het onderdeel.`,
    };
  }
  const label = invoer.label.trim() || genereerLabel(onderdeel, ronde.label);
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

/** De samenstelling, het label of het onderdeel van een samengestelde Meting wijzigen. De ronde en het Assessment liggen vast. */
export function wijzigSamengesteldeMeting(
  metingId: string,
  wijziging: { label?: string; onderdeel?: string; metingIds: string[]; minScans: number }
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
    if (bestaand) return { ok: false, reden: `In deze ronde bestaat voor het onderdeel "${onderdeel}" al "${bestaand.label}".` };
  }
  meting.samenstelling = [...new Set(wijziging.metingIds)];
  meting.onderdeel = onderdeel;
  if (wijziging.label?.trim()) meting.label = wijziging.label.trim();
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
