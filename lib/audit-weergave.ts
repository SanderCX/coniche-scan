import type { AuditEvent } from "./audit-store";

/**
 * Weergave en export van de audit-log (`beheerpagina.md`, punt 12). Pure functies,
 * zonder opslag, zodat de scherm- en CSV-logica dezelfde uitkomst geven en testbaar zijn.
 */

const TYPE_LABEL: Record<string, string> = {
  organisatie: "Organisatie",
  meting: "Meting",
  respondent: "Respondent",
  respons: "Respons",
  scan: "Scan",
  gebruiker: "Gebruiker",
  bouwblok: "Bouwblok",
  import: "Import",
  algemeneTekst: "Algemene tekst",
  instellingen: "Instellingen",
  auditlog: "Audit-log",
};

/** Het deel van de actie vóór de punt, bijv. "organisatie" bij "organisatie.verwijderd". */
export function typeVan(actie: string): string {
  return actie.split(".")[0];
}

export function typeLabel(type: string): string {
  return TYPE_LABEL[type] ?? type;
}

/** Actor: de Gebruiker, "Systeem", of bij een Respondent alleen "Respondent" met de Organisatie. */
export function actorLabel(e: AuditEvent): string {
  if (e.actorType === "systeem") return "Systeem";
  if (e.actorType === "respondent") {
    const organisatie = e.details?.organisatieNaam;
    return typeof organisatie === "string" && organisatie ? `Respondent (${organisatie})` : "Respondent";
  }
  return e.actorNaam || "Onbekende gebruiker";
}

export function entiteitLabel(e: AuditEvent): string {
  const type = typeLabel(e.entiteitType);
  return e.entiteitNaam ? `${type}: ${e.entiteitNaam}` : type;
}

const DETAIL_LABEL: Record<string, string> = {
  organisatieNaam: "Organisatie",
  metingLabel: "Meting",
  assessmentNaam: "Assessment",
  bronOrganisatieNaam: "Van organisatie",
  doelOrganisatieNaam: "Naar organisatie",
  bronMeting: "Van Meting",
  doelMeting: "Naar Meting",
  oudLabel: "Oud label",
  oudeNaam: "Oude naam",
  bouwblokNaam: "Bouwblok",
  oudGewicht: "Oud gewicht",
  nieuwGewicht: "Nieuw gewicht",
  aantalScans: "Aantal scans",
  aantalRespondenten: "Aantal Respondenten",
  aantalMetingen: "Aantal Metingen",
  aantalScansOvergeslagen: "Overgeslagen scans",
  aantalScansVerplaatst: "Verplaatste scans",
  aantalOvergeslagen: "Overgeslagen",
  aantalMetingenVoor: "Metingen voor",
  aantalMetingenNa: "Metingen na",
  aantalBestanden: "Bestanden",
  aantalRijen: "Rijen",
  verlengTermijnDagen: "Verlengd met (dagen)",
  redenenOvergeslagen: "Reden overgeslagen",
  samengevoegd: "Samengevoegd",
  velden: "Velden",
  rol: "Rol",
  status: "Status",
  bestand: "Bestand",
  rijNummer: "Rij",
  reden: "Reden",
  sleutel: "Sleutel",
  aantal: "Aantal",
  van: "Van",
  tot: "Tot",
};

/** Sleutels die alleen bij uitklappen en in de export staan (ID's), nooit in de leesbare tekst. */
const ID_SLEUTEL = /(^id$|Id$|Ids$)/;

function waardeTekst(sleutel: string, waarde: unknown): string {
  if (waarde === null || waarde === undefined) return "";
  if (typeof waarde === "boolean") return waarde ? "ja" : "nee";
  if (Array.isArray(waarde)) {
    if (sleutel === "perMeting") {
      return waarde
        .map((x) => {
          const r = x as { bronMeting?: string; doelMeting?: string | null };
          return `${r.bronMeting ?? "?"} → ${r.doelMeting ?? "?"}`;
        })
        .join(", ");
    }
    if (sleutel === "bestanden") {
      return waarde
        .map((x) => {
          const r = x as { naam?: string; overgeslagen?: boolean; reden?: string | null };
          return r.overgeslagen ? `${r.naam} (overgeslagen: ${r.reden ?? "onbekend"})` : String(r.naam);
        })
        .join(", ");
    }
    return waarde.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join(", ");
  }
  if (typeof waarde === "object") return JSON.stringify(waarde);
  return String(waarde);
}

/** Leesbare details, met namen in plaats van ID's (ID's staan alleen bij uitklappen en in de export). */
export function detailTekst(e: AuditEvent): string {
  if (!e.details) return "";
  const delen: string[] = [];
  const details = e.details;
  if (e.actie === "bouwblok.gewichtGewijzigd") {
    delen.push(`Bouwblok: #${details.volgnummer ?? "?"} ${details.bouwblokNaam ?? ""}`.trim());
  }
  if (e.actie === "instellingen.gewijzigd" && details.gewijzigd && typeof details.gewijzigd === "object") {
    for (const [k, v] of Object.entries(details.gewijzigd as Record<string, { oud: unknown; nieuw: unknown }>)) {
      delen.push(`${k}: ${waardeTekst(k, v.oud) || "leeg"} → ${waardeTekst(k, v.nieuw) || "leeg"}`);
    }
    return delen.join(" · ");
  }
  for (const [sleutel, waarde] of Object.entries(details)) {
    if (ID_SLEUTEL.test(sleutel)) continue;
    // De rijenlijst van `import.gestart` staat als tabel in de uitgeklapte groep, niet als lange tekstregel.
    if (sleutel === "rijen") continue;
    if (e.actie === "bouwblok.gewichtGewijzigd" && (sleutel === "bouwblokNaam" || sleutel === "volgnummer")) continue;
    const tekst = waardeTekst(sleutel, waarde);
    if (tekst === "") continue;
    delen.push(`${DETAIL_LABEL[sleutel] ?? sleutel}: ${tekst}`);
  }
  return delen.join(" · ");
}

/* ---------- Importgroepen ---------- */

export type ImportStatus = "voltooid" | "deels" | "mislukt";

export interface ImportGroep {
  groepId: string;
  gebeurtenissen: AuditEvent[];
  titel: string;
  status: ImportStatus;
  aantalBestanden: number;
  geimporteerd: number;
  overgeslagen: number;
  mislukt: number;
  nogNietGeimporteerd: number;
  /** Tijdstip van de nieuwste gebeurtenis in de groep. */
  tijdstip: string;
  /** Wie de import startte. */
  actor: string;
}

/**
 * Een import als één groepsregel: Afgeleid uit de gebeurtenissen met hetzelfde
 * `groepId`, nooit apart opgeslagen. Een groep bestaat zodra er een
 * `import.gestart` is. Rijen die later alsnog worden geïmporteerd komen bij
 * dezelfde groep, waarna de aantallen meeschuiven.
 */
export function bouwImportGroepen(events: AuditEvent[]): ImportGroep[] {
  const perGroep = new Map<string, AuditEvent[]>();
  for (const e of events) {
    if (!e.groepId) continue;
    const lijst = perGroep.get(e.groepId) ?? [];
    lijst.push(e);
    perGroep.set(e.groepId, lijst);
  }
  const groepen: ImportGroep[] = [];
  for (const [groepId, gebeurtenissen] of perGroep) {
    const start = gebeurtenissen.find((e) => e.actie === "import.gestart");
    if (!start) continue;
    const details = start.details ?? {};
    const bestanden = (Array.isArray(details.bestanden) ? details.bestanden : []) as {
      overgeslagen?: boolean;
      bronFormaat?: string | null;
    }[];
    const aantalBestanden = Number(details.aantalBestanden ?? bestanden.length);
    const overgeslagen = bestanden.filter((b) => b.overgeslagen).length;
    const geimporteerd = gebeurtenissen.filter((e) => e.actie === "scan.geimporteerd").length;
    const mislukt = gebeurtenissen.filter((e) => e.actie === "import.rijMislukt").length;
    const aantalRijen = Number(details.aantalRijen ?? 0);
    const nogNietGeimporteerd = Math.max(0, aantalRijen - geimporteerd - mislukt);
    const formaten = new Set(bestanden.filter((b) => !b.overgeslagen).map((b) => b.bronFormaat));
    const bron =
      formaten.size === 1 && formaten.has("oud")
        ? "oude tool"
        : formaten.size === 1 && formaten.has("nieuw")
          ? "eigen export"
          : "";
    const status: ImportStatus =
      geimporteerd === 0 ? "mislukt" : mislukt === 0 && overgeslagen === 0 && nogNietGeimporteerd === 0 ? "voltooid" : "deels";
    groepen.push({
      groepId,
      gebeurtenissen: [...gebeurtenissen].sort((a, b) => a.tijdstip.localeCompare(b.tijdstip)),
      titel: bron ? `Import ${bron}` : "Import",
      status,
      aantalBestanden,
      geimporteerd,
      overgeslagen,
      mislukt,
      nogNietGeimporteerd,
      tijdstip: gebeurtenissen.reduce((m, e) => (e.tijdstip > m ? e.tijdstip : m), start.tijdstip),
      actor: actorLabel(start),
    });
  }
  return groepen;
}

export type ImportRegelStatus = "geimporteerd" | "overgeslagen" | "mislukt" | "nogNiet";

/** Eén regel in de uitgeklapte importgroep (`beheerpagina.md`, punt 12, Een import als groep). */
export interface ImportRegel {
  bestand: string;
  /** Leeg bij een overgeslagen bestand: Dan is er geen rij. */
  rij: number | null;
  assessment: string;
  organisatie: string;
  /** "Nieuw" of "Gevonden", nooit een naam of e-mailadres (geen persoonsgegevens uit scans in de audit-log). Leeg als de rij niet is geïmporteerd. */
  respondent: string;
  status: ImportRegelStatus;
  /** De reden bij overgeslagen en mislukt. */
  reden: string;
}

export const IMPORT_REGEL_STATUS_LABEL: Record<ImportRegelStatus, string> = {
  geimporteerd: "Geïmporteerd",
  overgeslagen: "Overgeslagen",
  mislukt: "Mislukt",
  nogNiet: "Nog niet geïmporteerd",
};

const tekstOf = (v: unknown): string => (typeof v === "string" ? v : "");

/**
 * De regels van een importgroep, één per bestand of rij, afgeleid uit de gebeurtenissen van de groep (nooit apart
 * opgeslagen). Bronnen: De bestanden en rijen uit `import.gestart` (rijen alleen bij imports vanaf het moment dat die
 * lijst wordt gelogd), `scan.geimporteerd` en `import.rijMislukt`. Een rij zonder een van de twee laatste is "nog niet
 * geïmporteerd". Een oudere groep zonder rijenlijst toont alleen wat er daadwerkelijk gebeurde.
 */
export function importRegels(groep: ImportGroep): ImportRegel[] {
  const start = groep.gebeurtenissen.find((e) => e.actie === "import.gestart");
  const details = start?.details ?? {};
  const sleutel = (bestand: string, rij: number) => `${bestand}::${rij}`;
  const regels = new Map<string, ImportRegel>();
  const overgeslagen: ImportRegel[] = [];

  for (const b of (Array.isArray(details.bestanden) ? details.bestanden : []) as {
    naam?: string;
    overgeslagen?: boolean;
    reden?: string | null;
  }[]) {
    if (b.overgeslagen) {
      overgeslagen.push({
        bestand: tekstOf(b.naam),
        rij: null,
        assessment: "",
        organisatie: "",
        respondent: "",
        status: "overgeslagen",
        reden: tekstOf(b.reden),
      });
    }
  }
  for (const r of (Array.isArray(details.rijen) ? details.rijen : []) as Record<string, unknown>[]) {
    const bestand = tekstOf(r.bestand);
    const rij = Number(r.rijNummer);
    regels.set(sleutel(bestand, rij), {
      bestand,
      rij,
      assessment: tekstOf(r.assessmentNaam),
      organisatie: tekstOf(r.organisatieNaam),
      respondent: "",
      status: "nogNiet",
      reden: "",
    });
  }
  for (const e of groep.gebeurtenissen) {
    if (e.actie !== "scan.geimporteerd" && e.actie !== "import.rijMislukt") continue;
    const d = e.details ?? {};
    const bestand = tekstOf(d.bestand);
    const rij = Number(d.rijNummer);
    const bestaand = regels.get(sleutel(bestand, rij));
    const regel: ImportRegel = {
      bestand,
      rij,
      assessment: tekstOf(d.assessmentNaam) || bestaand?.assessment || "",
      organisatie: tekstOf(d.organisatieNaam) || bestaand?.organisatie || "",
      respondent: e.actie === "scan.geimporteerd" ? (d.respondentNieuw ? "Nieuw" : d.respondentNieuw === false ? "Gevonden" : "") : "",
      status: e.actie === "scan.geimporteerd" ? "geimporteerd" : "mislukt",
      reden: e.actie === "import.rijMislukt" ? tekstOf(d.reden) : "",
    };
    regels.set(sleutel(bestand, rij), regel);
  }
  const rijRegels = [...regels.values()].sort((a, b) => a.bestand.localeCompare(b.bestand, "nl") || (a.rij ?? 0) - (b.rij ?? 0));
  return [...overgeslagen.sort((a, b) => a.bestand.localeCompare(b.bestand, "nl")), ...rijRegels];
}

export function importGroepTekst(g: ImportGroep): string {
  const delen = [
    `${g.aantalBestanden} bestand${g.aantalBestanden === 1 ? "" : "en"}`,
    `${g.geimporteerd} geïmporteerd`,
    ...(g.overgeslagen ? [`${g.overgeslagen} overgeslagen`] : []),
    ...(g.mislukt ? [`${g.mislukt} mislukt`] : []),
    ...(g.nogNietGeimporteerd ? [`${g.nogNietGeimporteerd} nog niet geïmporteerd`] : []),
  ];
  return `${g.titel}: ${delen.join(", ")}`;
}

/* ---------- Export ---------- */

function csvVeld(waarde: string): string {
  return `"${waarde.replace(/"/g, '""')}"`;
}

/**
 * CSV van de gefilterde gebeurtenissen, één rij per gebeurtenis (geen groepsregels).
 * Formaat zoals de overige CSV's (`export-csv.md`): Puntkomma, UTF-8 met BOM, CRLF,
 * JSON-kolom als string.
 */
export function auditCsv(events: AuditEvent[]): string {
  const kop = ["tijdstip", "actor", "actie", "entiteit_type", "entiteit_naam", "entiteit_id", "groep_id", "details", "details_json"];
  const rijen = events.map((e) =>
    [
      e.tijdstip,
      actorLabel(e),
      e.actie,
      e.entiteitType,
      e.entiteitNaam ?? "",
      e.entiteitId,
      e.groepId ?? "",
      detailTekst(e),
      e.details ? JSON.stringify(e.details) : "",
    ]
      .map(csvVeld)
      .join(";")
  );
  return "﻿" + [kop.join(";"), ...rijen].join("\r\n") + "\r\n";
}

/* ---------- Periode ---------- */

export type Periode = "vandaag" | "7" | "30" | "90" | "alles" | "aangepast";
export const PERIODE_VOLGORDE: Periode[] = ["vandaag", "7", "30", "90", "alles"];

export const PERIODE_LABEL: Record<Periode, string> = {
  vandaag: "Vandaag",
  "7": "7 dagen",
  "30": "30 dagen",
  "90": "90 dagen",
  alles: "Alles",
  aangepast: "Aangepast",
};

function datumTekst(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Vanaf en Tot (datums, inclusief) bij een keuzeknop. `alles` heeft geen grenzen. */
export function periodeBereik(periode: Periode, nu: Date = new Date()): { van: string; tot: string } {
  if (periode === "alles" || periode === "aangepast") return { van: "", tot: "" };
  const dagen = periode === "vandaag" ? 0 : Number(periode);
  const van = new Date(nu);
  van.setDate(van.getDate() - dagen);
  return { van: datumTekst(van), tot: datumTekst(nu) };
}

/** Valt het tijdstip binnen Vanaf/Tot (lokale datums, beide inclusief, leeg = onbegrensd)? */
export function inPeriode(tijdstip: string, van: string, tot: string): boolean {
  const d = new Date(tijdstip);
  if (van && d < new Date(`${van}T00:00:00`)) return false;
  if (tot && d >= new Date(new Date(`${tot}T00:00:00`).getTime() + 24 * 60 * 60 * 1000)) return false;
  return true;
}
