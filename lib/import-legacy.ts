import { Assessment, Bouwblok, ScanInvullingStatus } from "./types";
import { alleBouwblokkenMetGroep, alleVragen } from "./assessment-structuur";
import { organisatieVelden } from "@/data/organisatie-velden";

/**
 * Import van scans (CSV), in twee bronformaten (`import-scans.md`):
 * "oud" (de externe, stopgezette tool) en "nieuw" (onze eigen "Als
 * CSV"-export, `export-csv.md`) — dat laatste vooral bedoeld om data te
 * verplaatsen tussen browsers, zolang de opslag nog localStorage is
 * (CLAUDE.md, Status). "Oud" verdwijnt zodra de historische migratie
 * voltooid is (`backlog.md`); "nieuw" blijft.
 *
 * Puur functioneel: geen localStorage-toegang hier — parsen en valideren
 * staat los van het daadwerkelijk wegschrijven (`lib/db.ts`,
 * `voerLegacyImportUit`), zodat de preview-stap (CLAUDE.md-stijl: eerst
 * tonen, dan pas schrijven) los te testen is.
 *
 * De vorm van de `answers`-kolom (JSON), bevestigd tegen de daadwerkelijke
 * exports (`import-scans.md`, "Bronformaat"): een **platte lijst**
 * van losse vraag-items (60 bij Klantcontact, 40 bij de AI-scan), geen
 * geneste structuur per bouwblok. `groepeerPerBouwblok` hieronder groepeert
 * deze lijst eerst op `buildingBlockId` (volgorde van eerste voorkomen),
 * vóórdat de matching- en telregels worden toegepast.
 */
export interface LegacyAnswerItem {
  buildingBlockId: string;
  buildingBlockName: string;
  buildingBlockCategory?: string;
  questionId: string;
  questionText?: string;
  /** Het scoreveld heet in de CSV `answerScore`, niet `score`. */
  answerScore: number;
  answerLabel?: string;
  /** Bij beide huidige exports overal `1`; niet geïmporteerd, zie de spec. */
  weight?: number;
  blockComment: string | null;
}

interface LegacyBlok {
  buildingBlockId: string;
  buildingBlockName: string;
  items: LegacyAnswerItem[];
}

/** Groepeert de platte vraag-lijst op `buildingBlockId`, op volgorde van eerste voorkomen. */
function groepeerPerBouwblok(items: LegacyAnswerItem[]): LegacyBlok[] {
  const groepen: LegacyBlok[] = [];
  const index = new Map<string, LegacyBlok>();
  for (const item of items) {
    let groep = index.get(item.buildingBlockId);
    if (!groep) {
      groep = { buildingBlockId: item.buildingBlockId, buildingBlockName: item.buildingBlockName, items: [] };
      index.set(item.buildingBlockId, groep);
      groepen.push(groep);
    }
    groep.items.push(item);
  }
  return groepen;
}

export interface LegacyCsvRow {
  assessment_id: string;
  organization_name: string;
  sector_name: string;
  subsector_name: string;
  assessor_name: string;
  respondent_email: string;
  respondent_role: string;
  team_name: string;
  start_comment: string;
  created_at: string;
  completed_at: string;
  status: string;
  answers: string;
}

const VERPLICHTE_KOLOMMEN: (keyof LegacyCsvRow)[] = [
  "assessment_id",
  "organization_name",
  "respondent_email",
  "created_at",
  "status",
  "answers",
];

/**
 * Minimale RFC4180-CSV-parser: quoted fields, "" als ontsnapte
 * aanhalingsteken, scheidingsteken (en nieuwe regels) binnen quotes
 * genegeerd. `scheidingsteken` is instelbaar: "oud" gebruikt een komma,
 * "nieuw" een puntkomma (`export-csv.md`, "CSV-formaat", Excel-NL).
 */
function parseCsv(tekst: string, scheidingsteken: string): string[][] {
  const rijen: string[][] = [];
  let rij: string[] = [];
  let veld = "";
  let inQuotes = false;
  let i = 0;
  const n = tekst.length;
  while (i < n) {
    const c = tekst[i];
    if (inQuotes) {
      if (c === '"') {
        if (tekst[i + 1] === '"') {
          veld += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      veld += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === scheidingsteken) {
      rij.push(veld);
      veld = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      rij.push(veld);
      rijen.push(rij);
      rij = [];
      veld = "";
      i++;
      continue;
    }
    veld += c;
    i++;
  }
  if (veld.length > 0 || rij.length > 0) {
    rij.push(veld);
    rijen.push(rij);
  }
  return rijen.filter((r) => !(r.length === 1 && r[0] === ""));
}

export interface CsvParseResultaat<T> {
  rijen: T[];
  ontbrekendeKolommen: string[];
}

/** Gedeeld: parseert de tabel en zet elke rij om naar een record (ontbrekende kolommen worden lege strings). Strip een voorloop-BOM (onze eigen export schrijft die, `export-csv.md`). */
function parseCsvNaarRijen<T>(
  tekst: string,
  scheidingsteken: string,
  verplichteKolommen: string[]
): CsvParseResultaat<T> {
  const schoon = tekst.replace(/^﻿/, "");
  const tabel = parseCsv(schoon, scheidingsteken);
  if (tabel.length === 0) return { rijen: [], ontbrekendeKolommen: verplichteKolommen };
  const [header, ...rest] = tabel;
  const ontbrekendeKolommen = verplichteKolommen.filter((k) => !header.includes(k));
  const rijen = rest
    .filter((cols) => cols.some((c) => c !== ""))
    .map((cols) => {
      const obj: Record<string, string> = {};
      header.forEach((h, i) => (obj[h] = cols[i] ?? ""));
      return obj as unknown as T;
    });
  return { rijen, ontbrekendeKolommen };
}

/** Leest een CSV in het "oud"-formaat (de externe, stopgezette tool): komma-gescheiden. */
export function parseLegacyCsv(tekst: string): CsvParseResultaat<LegacyCsvRow> {
  return parseCsvNaarRijen<LegacyCsvRow>(tekst, ",", VERPLICHTE_KOLOMMEN);
}

/**
 * Beste-poging-koppeling van de verkorte importtekst aan de officiële
 * SBI-titel (sbi-indeling.md): exact, anders op woordoverlap. Een woord dat
 * voorkomt vóór een eventuele "met uitzondering van"-clausule van de optie
 * weegt zwaarder dan een woord dat alleen in die clausule zelf staat — nodig
 * omdat veel SBI-titels juist het naastgelegen, uitgesloten onderwerp
 * noemen (bijv. Afdeling 64 sluit expliciet "verzekeringen en
 * pensioenfondsen" uit, dat is Afdeling 65). Zonder dat onderscheid matcht
 * een simpele "bevat de tekst"-check op het verkeerde, eerste toevallige
 * record. Geen enkele woordoverlap: undefined, geen harde fout.
 */
function mapNaarSbiTitel(kort: string, opties: string[]): string | undefined {
  const tekst = kort.trim().toLowerCase();
  if (!tekst) return undefined;
  const exact = opties.find((o) => o.toLowerCase() === tekst);
  if (exact) return exact;

  const woorden = (s: string) => new Set(s.split(/[\s,;]+/).filter((w) => w.length > 2));
  const kortWoorden = woorden(tekst);
  if (kortWoorden.size === 0) return undefined;

  let beste: string | undefined;
  let besteScore = 0;
  for (const optie of opties) {
    const optieLower = optie.toLowerCase();
    const hoofdDeel = optieLower.split("met uitzondering van")[0];
    const hoofdWoorden = woorden(hoofdDeel);
    const alleWoorden = woorden(optieLower);
    let score = 0;
    for (const w of kortWoorden) {
      if (hoofdWoorden.has(w)) score += 2;
      else if (alleWoorden.has(w)) score += 1;
    }
    if (score > besteScore) {
      besteScore = score;
      beste = optie;
    }
  }
  return beste;
}

const sectorVeld = organisatieVelden.find((v) => v.id === "sector-subsector")?.subvelden;
const SBI_SECTOREN = sectorVeld?.find((v) => v.id === "sector")?.opties ?? [];
const SBI_SUBSECTOREN_PER_SECTOR = sectorVeld?.find((v) => v.id === "subsector")?.optiesPerWaarde ?? {};
const SBI_SUBSECTOREN_ALLES = Object.values(SBI_SUBSECTOREN_PER_SECTOR).flat();

export type ImportBronFormaat = "oud" | "nieuw";

/**
 * Bestanden die als geheel niet te importeren zijn (import-scans.md, "Bestanden die niet
 * te importeren zijn"): Zonder kolom `answers` of met overal een lege `answers` (de
 * batch-export van de oude tool bevat geen antwoorden per vraag), zonder kopregel,
 * zonder rijen, of waarvan `answers` nergens geldige JSON is. Geeft de melding, of
 * `null` als het bestand wél (verder) beoordeeld kan worden. Onze eigen export valt
 * hier niet onder.
 */
export function bestandOverslaanReden(tekst: string): string | null {
  const schoon = tekst.replace(/^﻿/, "");
  if (schoon.trim() === "") return "Bevat geen kopregel.";
  if (detecteerBronFormaat(tekst) === "nieuw") return null;
  const tabel = parseCsv(schoon, ",");
  if (tabel.length === 0) return "Bevat geen kopregel.";
  const header = tabel[0].map((k) => k.trim());
  const lijktOudeTool = header.includes("organization_name") && header.includes("respondent_email");
  if (!lijktOudeTool) return null;
  const BATCH = "Bevat geen antwoorden per vraag (mogelijk een batch-export).";
  const answersIndex = header.indexOf("answers");
  if (answersIndex === -1) return BATCH;
  const rijen = tabel.slice(1).filter((cols) => cols.some((c) => c !== ""));
  if (rijen.length === 0) return "Bevat geen rijen.";
  const waarden = rijen.map((cols) => (cols[answersIndex] ?? "").trim());
  if (waarden.every((w) => w === "")) return BATCH;
  const geldig = (w: string) => {
    try {
      return Array.isArray(JSON.parse(w));
    } catch {
      return false;
    }
  };
  if (!waarden.some(geldig)) return "De kolom answers bevat geen geldige JSON.";
  return null;
}

export interface GevalideerdeRij {
  rijNummer: number;
  /** "oud": het `assessment_id` uit de externe tool. "nieuw": leeg, onze eigen export kent geen los rij-ID. */
  legacyAssessmentId: string;
  ok: boolean;
  /** Reden waarom deze rij niet importeert (ok: false), of leeg. */
  probleem?: string;
  /** Automatisch bepaald ("oud": `detecteerAssessment`; "nieuw": op naam), leeg als dat niet lukte. */
  assessmentId?: string;
  assessmentNaam?: string;
  /**
   * Alleen "oud", bij een 95%+-vraagtekstmatch i.p.v. een 100%-bloknaam-
   * match (import-scans.md, Assessment- en bouwblok-matching, stap 2):
   * deze rij is wel gedetecteerd, maar vereist een losse bevestiging per
   * rij vóór import, nooit in bulk. `assessmentMatchPercentage`/
   * `afwijkendeVragen` zijn dan gezet, voor de voorbeeldweergave.
   */
  vereistBevestiging?: boolean;
  assessmentMatchPercentage?: number;
  afwijkendeVragen?: string[];
  organisatieNaam: string;
  /** Alleen ter info in de preview; de daadwerkelijke matching gebeurt bij het schrijven (lib/db.ts), op naam op dat moment. */
  organisatieBestaatMogelijk: boolean;
  sectorTitel?: string;
  subsectorTitel?: string;
  /** Alleen "nieuw": `Organisatie.kenmerken` rechtstreeks uit de export, toegepast bij het aanmaken van een nieuwe organisatie (nooit bij hergebruik van een bestaande, zie `voerLegacyImportUit`). */
  organisatieKenmerken?: Record<string, unknown>;
  respondentEmail: string;
  respondentNaam: string;
  respondentFunctie: string;
  respondentTeam: string;
  respondentNotities: string;
  /** "nieuw" kent alle drie de statussen; "oud" importeert alleen "completed" → altijd "afgerond". */
  status: ScanInvullingStatus;
  uitgenodigdOp: string;
  gestartOp: string | null;
  afgerondOp: string | null;
  meetingLabel: string;
  antwoorden: Record<string, number>;
  opmerkingenPerBouwblok: Record<string, string>;
}


/** Matcht de gegroepeerde blokken/vragen van één CSV-rij tegen de huidige content van het gekozen Assessment. */
function matchAntwoorden(
  blokken: LegacyBlok[],
  bouwblokken: Bouwblok[]
): { ok: true; antwoorden: Record<string, number>; opmerkingen: Record<string, string> } | { ok: false; reden: string } {
  if (blokken.length !== bouwblokken.length) {
    return {
      ok: false,
      reden: `Aantal blokken in de CSV (${blokken.length}) komt niet overeen met het aantal in de huidige content (${bouwblokken.length}).`,
    };
  }
  const antwoorden: Record<string, number> = {};
  const opmerkingen: Record<string, string> = {};
  const gebruikt = new Set<string>();
  for (const blok of blokken) {
    const kandidaten = bouwblokken.filter((b) => b.naam === blok.buildingBlockName);
    if (kandidaten.length === 0) {
      return { ok: false, reden: `Bouwblok "${blok.buildingBlockName}" niet gevonden in de huidige content.` };
    }
    if (kandidaten.length > 1 || gebruikt.has(kandidaten[0].id)) {
      return {
        ok: false,
        reden: `Bouwblok "${blok.buildingBlockName}" is niet eenduidig te matchen, handmatig oplossen.`,
      };
    }
    const bouwblok = kandidaten[0];
    gebruikt.add(bouwblok.id);
    if (blok.items.length !== bouwblok.vragen.length) {
      return {
        ok: false,
        reden: `Aantal vragen bij "${bouwblok.naam}" (${blok.items.length}) komt niet overeen met de huidige content (${bouwblok.vragen.length}).`,
      };
    }
    blok.items.forEach((item, i) => {
      antwoorden[bouwblok.vragen[i].id] = item.answerScore;
    });
    // blockComment staat op elk vraag-item binnen het blok herhaald (import-scans.md,
    // "Opmerkingen per bouwblok") — dedupliceren tot één waarde, tegenstrijdige waarden binnen
    // hetzelfde blok is een reden om de hele rij niet te importeren.
    const opmerkingWaarden = new Set(blok.items.map((item) => item.blockComment).filter((c): c is string => !!c));
    if (opmerkingWaarden.size > 1) {
      return {
        ok: false,
        reden: `Bouwblok "${bouwblok.naam}" heeft tegenstrijdige opmerkingen binnen hetzelfde blok.`,
      };
    }
    if (opmerkingWaarden.size === 1) opmerkingen[bouwblok.id] = [...opmerkingWaarden][0];
  }
  return { ok: true, antwoorden, opmerkingen };
}

type DetectieResultaat =
  | { ok: true; assessment: Assessment; vereistBevestiging: false }
  | { ok: true; assessment: Assessment; vereistBevestiging: true; percentage: number; afwijkendeVragen: string[] }
  | { ok: false; reden: string };

/** 95%-drempel voor de vraagtekst-tiebreak (import-scans.md, Assessment- en bouwblok-matching) — vast, niet beheerbaar. */
const VRAAGTEKST_DREMPEL = 95;

/**
 * Berekent het percentage vragen (op volgorde, per blok) dat woordelijk
 * overeenkomt tussen de CSV en de huidige content van dit Assessment-type,
 * plus een leesbare lijst van de afwijkende vragen — gebruikt om twee
 * scan-types met identieke bloknamen te onderscheiden (zie
 * `detecteerAssessment`). Een ontbrekende `questionText`, of een blok/
 * vragenaantal dat niet overeenkomt, telt als geen match voor die vraag,
 * nooit als een gok. `null` als het totaal aantal vragen niet te bepalen
 * is (zou hier niet moeten voorkomen, bouwblokken-aantal is al gelijk).
 */
function vraagtekstMatch(
  groepen: LegacyBlok[],
  assessment: Assessment
): { percentage: number; afwijkendeVragen: string[] } {
  const bouwblokken = alleBouwblokkenMetGroep(assessment).map((b) => b.bouwblok);
  let totaal = 0;
  let gematcht = 0;
  const afwijkendeVragen: string[] = [];
  for (const groep of groepen) {
    const bouwblok = bouwblokken.find((b) => b.naam === groep.buildingBlockName);
    if (!bouwblok) {
      totaal += groep.items.length;
      afwijkendeVragen.push(`${groep.buildingBlockName}: hele blok niet gevonden`);
      continue;
    }
    const n = Math.max(bouwblok.vragen.length, groep.items.length);
    totaal += n;
    for (let i = 0; i < n; i++) {
      const item = groep.items[i];
      const vraag = bouwblok.vragen[i];
      if (item && vraag && !!item.questionText && item.questionText.trim() === vraag.tekst.trim()) {
        gematcht++;
      } else {
        afwijkendeVragen.push(`${bouwblok.naam}, vraag ${i + 1}`);
      }
    }
  }
  const percentage = totaal === 0 ? 0 : Math.round((gematcht / totaal) * 1000) / 10;
  return { percentage, afwijkendeVragen };
}

/**
 * Bepaalt automatisch welk Assessment-type een rij bevat — de beheerder
 * hoeft dit niet vooraf te kiezen. Eerste stap, zoals altijd: de
 * bouwblok-/domeinnamen in de (gegroepeerde) CSV-data tegen de huidige
 * content, vereist een volledige match (alle groepnamen komen voor in dat
 * Assessment, en het aantal komt exact overeen).
 *
 * **Tweede stap, nodig sinds sector-varianten bestaan** (`datamodel.md`,
 * Sector-varianten): Een sector-variant kopieert de bouwblok-namen van zijn
 * template één-op-één (bijv. de Zorgscan heeft exact dezelfde 15
 * bouwblok-namen als de Klantcontact Volwassenheidsscan, alleen de
 * vraagteksten wijken af) — de eerste stap alleen levert dan meerdere
 * kandidaten op. In dat geval beslissen de vraagteksten, met een
 * matchpercentage in plaats van alles-of-niets (dit voorkomt dat een CSV
 * die vóór een latere, kleine tekstcorrectie in de content was
 * geëxporteerd, helemaal niet meer te importeren is):
 *
 * - Precies één kandidaat op 100%: gedetecteerd, automatisch.
 * - Geen enkele kandidaat op 100%, maar precies één op of boven de 95%-
 *   drempel: ook gedetecteerd, maar niet automatisch — de rij vereist een
 *   losse bevestiging per rij (nooit in bulk), met het percentage en de
 *   afwijkende vragen erbij.
 * - Geen enkele kandidaat op of boven 95%, of meerdere op of boven 95%:
 *   onbepaald, geen gok die een fout bestand stilzwijgend op het
 *   verkeerde scan-type plakt.
 */
function detecteerAssessment(groepen: LegacyBlok[], assessments: Assessment[]): DetectieResultaat {
  const naamKandidaten = assessments.filter((assessment) => {
    const bouwblokken = alleBouwblokkenMetGroep(assessment).map((b) => b.bouwblok);
    if (bouwblokken.length !== groepen.length) return false;
    const namen = new Set(bouwblokken.map((b) => b.naam));
    return groepen.every((g) => namen.has(g.buildingBlockName));
  });

  if (naamKandidaten.length === 0) {
    return {
      ok: false,
      reden: `de ${groepen.length} blokken in de CSV komen niet overeen met de bouwblokken/domeinen van een van de scan-types`,
    };
  }
  if (naamKandidaten.length === 1) {
    return { ok: true, assessment: naamKandidaten[0], vereistBevestiging: false };
  }

  const metScore = naamKandidaten.map((assessment) => ({ assessment, ...vraagtekstMatch(groepen, assessment) }));
  const op100 = metScore.filter((k) => k.percentage === 100);
  if (op100.length === 1) {
    return { ok: true, assessment: op100[0].assessment, vereistBevestiging: false };
  }
  if (op100.length === 0) {
    const op95 = metScore.filter((k) => k.percentage >= VRAAGTEKST_DREMPEL);
    if (op95.length === 1) {
      return {
        ok: true,
        assessment: op95[0].assessment,
        vereistBevestiging: true,
        percentage: op95[0].percentage,
        afwijkendeVragen: op95[0].afwijkendeVragen,
      };
    }
  }

  const namenLijst = naamKandidaten.map((a) => `"${a.naam}"`).join(", ");
  const besteScore = Math.max(...metScore.map((k) => k.percentage));
  return {
    ok: false,
    reden:
      besteScore < VRAAGTEKST_DREMPEL
        ? `de bloknamen komen overeen met meerdere scan-types (${namenLijst}), maar de vraagteksten in de CSV komen met geen daarvan voor minstens ${VRAAGTEKST_DREMPEL}% overeen`
        : `de bloknamen én vraagteksten komen overeen met meerdere scan-types (${namenLijst}, elk op of boven ${VRAAGTEKST_DREMPEL}%), handmatig oplossen`,
  };
}

/**
 * Valideert alle CSV-rijen: bepaalt per rij zelf het Assessment-type
 * (`detecteerAssessment`) en matcht daarna tegen die content. Geeft voor
 * elke rij een resultaat terug (ook de rijen met een probleem), zodat de
 * preview-stap alles in één tabel kan tonen — rijen met een probleem
 * blokkeren de rest niet (import-scans.md, Werkwijze in beheer).
 */
export function valideerLegacyRijen(rijen: LegacyCsvRow[], assessments: Assessment[]): GevalideerdeRij[] {
  return rijen.map((rij, index) => {
    const rijNummer = index + 1;
    const sectorTitel = mapNaarSbiTitel(rij.sector_name ?? "", SBI_SECTOREN);
    const basis = {
      rijNummer,
      legacyAssessmentId: rij.assessment_id,
      organisatieNaam: rij.organization_name,
      organisatieBestaatMogelijk: false,
      respondentEmail: rij.respondent_email,
      respondentNaam: rij.assessor_name,
      respondentFunctie: rij.respondent_role,
      respondentTeam: rij.team_name,
      // `start_comment` ongewijzigd en zonder opbouwtekst (import-scans.md, "Wie de Respondent wordt").
      respondentNotities: rij.start_comment ?? "",
      // De oude tool kent geen apart "uitgenodigd"-moment; created_at is het beste beschikbare bod.
      uitgenodigdOp: rij.created_at,
      gestartOp: rij.created_at,
      afgerondOp: rij.completed_at || null,
      status: "afgerond" as ScanInvullingStatus,
      meetingLabel: `Legacy-import ${new Date(rij.created_at).getFullYear() || "onbekend"}`,
      sectorTitel,
      subsectorTitel: mapNaarSbiTitel(
        rij.subsector_name ?? "",
        // Zoek eerst binnen de subsectoren van de al-bepaalde sector (nauwkeuriger nu
        // Sector/Subsector cascaderen, sbi-indeling.md); zonder bepaalde sector, of
        // zonder match daarbinnen, de volledige lijst als terugval.
        (sectorTitel && SBI_SUBSECTOREN_PER_SECTOR[sectorTitel]) || SBI_SUBSECTOREN_ALLES
      ),
    };

    if (!rij.organization_name.trim() || !rij.respondent_email.trim()) {
      return { ...basis, ok: false, probleem: "Organisatienaam of e-mailadres ontbreekt.", antwoorden: {}, opmerkingenPerBouwblok: {} };
    }
    if (rij.status.trim().toLowerCase() !== "completed") {
      return {
        ...basis,
        ok: false,
        probleem: `Status "${rij.status}" wordt niet ondersteund, alleen "completed" wordt geïmporteerd.`,
        antwoorden: {},
        opmerkingenPerBouwblok: {},
      };
    }

    let items: LegacyAnswerItem[];
    try {
      items = JSON.parse(rij.answers);
      if (!Array.isArray(items)) throw new Error("geen array");
    } catch {
      return { ...basis, ok: false, probleem: "Kolom 'answers' is geen geldige JSON-array.", antwoorden: {}, opmerkingenPerBouwblok: {} };
    }

    const groepen = groepeerPerBouwblok(items);
    const detectie = detecteerAssessment(groepen, assessments);
    if (!detectie.ok) {
      return {
        ...basis,
        ok: false,
        probleem: `Kon geen Assessment-type bepalen: ${detectie.reden}.`,
        antwoorden: {},
        opmerkingenPerBouwblok: {},
      };
    }
    const assessment = detectie.assessment;
    const detectieVelden = detectie.vereistBevestiging
      ? {
          vereistBevestiging: true as const,
          assessmentMatchPercentage: detectie.percentage,
          afwijkendeVragen: detectie.afwijkendeVragen,
        }
      : { vereistBevestiging: false as const };

    const bouwblokken = alleBouwblokkenMetGroep(assessment).map((b) => b.bouwblok);
    const resultaat = matchAntwoorden(groepen, bouwblokken);
    if (!resultaat.ok) {
      return {
        ...basis,
        ...detectieVelden,
        assessmentId: assessment.id,
        assessmentNaam: assessment.naam,
        ok: false,
        probleem: resultaat.reden,
        antwoorden: {},
        opmerkingenPerBouwblok: {},
      };
    }

    return {
      ...basis,
      ...detectieVelden,
      ok: true,
      assessmentId: assessment.id,
      assessmentNaam: assessment.naam,
      antwoorden: resultaat.antwoorden,
      opmerkingenPerBouwblok: resultaat.opmerkingen,
    };
  });
}

/**
 * Een rij uit onze **eigen** "Als CSV"-export (`export-csv.md`), bedoeld om
 * terug in te lezen — vooral als tijdelijke manier om data tussen browsers
 * te verplaatsen zolang de opslag nog localStorage is (CLAUDE.md, Status).
 * In tegenstelling tot het "oud"-formaat matcht dit rechtstreeks op de
 * eigen `bouwblokId`/`vraagId` (geen naam-/volgorde-heuristiek nodig: het
 * is al onze eigen data), en importeert het alle drie de statussen, niet
 * alleen afgeronde scans.
 */
export interface NieuweExportCsvRow {
  organisatie_naam: string;
  meting_label: string;
  assessment_naam: string;
  respondent_naam: string;
  respondent_email: string;
  respondent_functie: string;
  respondent_team: string;
  status: string;
  uitgenodigd_op: string;
  gestart_op: string;
  afgerond_op: string;
  organisatie_kenmerken: string;
  antwoorden: string;
  opmerkingen_per_bouwblok: string;
}

const VERPLICHTE_KOLOMMEN_NIEUW: (keyof NieuweExportCsvRow)[] = [
  "organisatie_naam",
  "meting_label",
  "assessment_naam",
  "respondent_email",
  "status",
  "antwoorden",
];

const NIEUWE_EXPORT_STATUSSEN: ScanInvullingStatus[] = ["uitgenodigd", "bezig", "afgerond"];

interface NieuwAntwoordItem {
  bouwblokId: string;
  bouwblokNaam: string;
  vraagId: string;
  vraagTekst?: string;
  score: number;
  schaalLabel?: string;
}

/** Leest een CSV in het "nieuw"-formaat (onze eigen export): puntkomma-gescheiden, UTF-8-BOM. */
export function parseNieuweExportCsv(tekst: string): CsvParseResultaat<NieuweExportCsvRow> {
  return parseCsvNaarRijen<NieuweExportCsvRow>(tekst, ";", VERPLICHTE_KOLOMMEN_NIEUW);
}

/**
 * Bepaalt het bronformaat uit de headerregel zelf, in plaats van de
 * beheerder dit vooraf te laten kiezen (`import-scans.md`, Werkwijze in
 * beheer): Net als de Assessment-detectie hieronder is er geen reden om
 * een keuze te vragen die uit de data zelf al ondubbelzinnig volgt — de
 * twee formaten delen geen van hun onderscheidende kolomnamen
 * (`organisatie_naam`/`meting_label`/`antwoorden` bij "nieuw" tegenover
 * `assessment_id`/`organization_name`/`answers` bij "oud"), dus een
 * verkeerde gok is uitgesloten. Kijkt naar de headerregel met beide
 * mogelijke scheidingstekens (een kolomnaam uit het ene formaat bevat
 * nooit het scheidingsteken van het andere), zodat er nog geen keuze
 * voor een scheidingsteken nodig is om te bepalen wélk scheidingsteken
 * hoort bij dit bestand. Geen match voor geen van beide: `undefined`,
 * dezelfde "niet importeren en melden"-regel als de rest van dit bestand.
 *
 * **Leest de headerregel met dezelfde aanhalingstekens-bewuste `parseCsv`
 * die ook de rijen zelf parseert** (`parseCsvNaarRijen` hierboven), niet
 * met een kale `split` op het scheidingsteken: Een bulk-export met
 * aangehaalde kolomkoppen (`"organization_name","answers",...`,
 * gebruikelijk bij Excel-/pandas-achtige bulk-exports) matchte anders
 * nergens mee, want de aanhalingstekens bleven dan letterlijk in elke
 * kolomnaam staan (`"organization_name"` i.p.v. `organization_name`) —
 * een echte parserbug, ontdekt doordat losse per-organisatie-exports
 * toevallig niet aangehaald waren en het dus niet eerder opviel.
 */
export function detecteerBronFormaat(tekst: string): ImportBronFormaat | undefined {
  const schoon = tekst.replace(/^﻿/, "");
  const heeftAlleKolommen = (kolommen: string[], verplicht: readonly string[]) =>
    verplicht.every((v) => kolommen.includes(v));

  const kolommenPuntkomma = (parseCsv(schoon, ";")[0] ?? []).map((k) => k.trim());
  if (heeftAlleKolommen(kolommenPuntkomma, VERPLICHTE_KOLOMMEN_NIEUW)) return "nieuw";

  const kolommenKomma = (parseCsv(schoon, ",")[0] ?? []).map((k) => k.trim());
  if (heeftAlleKolommen(kolommenKomma, VERPLICHTE_KOLOMMEN)) return "oud";

  return undefined;
}

/**
 * Valideert rijen uit onze eigen export. Matcht `antwoorden`/
 * `opmerkingen_per_bouwblok` rechtstreeks op `bouwblokId`/`vraagId` tegen de
 * huidige content; bestaat een id niet meer (content is intussen gewijzigd),
 * dan wordt die rij overgeslagen met een duidelijke melding — dezelfde
 * "niet importeren en melden"-regel als het oude formaat.
 */
export function valideerNieuweExportRijen(
  rijen: NieuweExportCsvRow[],
  assessments: Assessment[]
): GevalideerdeRij[] {
  return rijen.map((rij, index) => {
    const rijNummer = index + 1;
    const sectorTitel = undefined; // organisatie_kenmerken bevat Sector/Subsector al compleet, geen losse mapping nodig.
    const basis = {
      rijNummer,
      legacyAssessmentId: "",
      organisatieNaam: rij.organisatie_naam,
      organisatieBestaatMogelijk: false,
      sectorTitel,
      subsectorTitel: undefined,
      respondentEmail: rij.respondent_email,
      respondentNaam: rij.respondent_naam,
      respondentFunctie: rij.respondent_functie,
      respondentTeam: rij.respondent_team,
      respondentNotities: "",
      uitgenodigdOp: rij.uitgenodigd_op || new Date().toISOString(),
      gestartOp: rij.gestart_op || null,
      afgerondOp: rij.afgerond_op || null,
      // import-scans.md, Meting: label "Import {meting_label}", niet het
      // kale label zelf — onderscheidt een geïmporteerde Meting meteen van
      // een handmatig aangemaakte met toevallig dezelfde naam.
      meetingLabel: `Import ${rij.meting_label || "Geïmporteerde meting"}`,
    };

    if (!rij.organisatie_naam.trim() || !rij.respondent_email.trim()) {
      return {
        ...basis,
        ok: false,
        probleem: "Organisatienaam of e-mailadres ontbreekt.",
        status: "uitgenodigd",
        antwoorden: {},
        opmerkingenPerBouwblok: {},
      };
    }

    const status = rij.status.trim().toLowerCase() as ScanInvullingStatus;
    if (!NIEUWE_EXPORT_STATUSSEN.includes(status)) {
      return {
        ...basis,
        ok: false,
        probleem: `Onbekende status "${rij.status}".`,
        status: "uitgenodigd",
        antwoorden: {},
        opmerkingenPerBouwblok: {},
      };
    }

    const assessment = assessments.find((a) => a.naam === rij.assessment_naam);
    if (!assessment) {
      return {
        ...basis,
        ok: false,
        status,
        probleem: `Assessment-type "${rij.assessment_naam}" niet gevonden.`,
        antwoorden: {},
        opmerkingenPerBouwblok: {},
      };
    }

    let organisatieKenmerken: Record<string, unknown> | undefined;
    if (rij.organisatie_kenmerken) {
      try {
        organisatieKenmerken = JSON.parse(rij.organisatie_kenmerken);
      } catch {
        return {
          ...basis,
          ok: false,
          status,
          assessmentId: assessment.id,
          assessmentNaam: assessment.naam,
          probleem: "Kolom 'organisatie_kenmerken' is geen geldige JSON.",
          antwoorden: {},
          opmerkingenPerBouwblok: {},
        };
      }
    }

    let items: NieuwAntwoordItem[] = [];
    if (rij.antwoorden) {
      try {
        items = JSON.parse(rij.antwoorden);
        if (!Array.isArray(items)) throw new Error("geen array");
      } catch {
        return {
          ...basis,
          ok: false,
          status,
          assessmentId: assessment.id,
          assessmentNaam: assessment.naam,
          probleem: "Kolom 'antwoorden' is geen geldige JSON-array.",
          antwoorden: {},
          opmerkingenPerBouwblok: {},
        };
      }
    }

    const geldigeVraagIds = new Set(alleVragen(assessment).map((v) => v.id));
    const onbekend = items.find((item) => !geldigeVraagIds.has(item.vraagId));
    if (onbekend) {
      return {
        ...basis,
        ok: false,
        status,
        assessmentId: assessment.id,
        assessmentNaam: assessment.naam,
        probleem: `Vraag "${onbekend.vraagId}" (${onbekend.bouwblokNaam}) bestaat niet meer in de huidige content van "${assessment.naam}".`,
        antwoorden: {},
        opmerkingenPerBouwblok: {},
      };
    }

    const antwoorden = Object.fromEntries(items.map((item) => [item.vraagId, item.score]));

    let opmerkingenPerBouwblok: Record<string, string> = {};
    if (rij.opmerkingen_per_bouwblok) {
      try {
        opmerkingenPerBouwblok = JSON.parse(rij.opmerkingen_per_bouwblok);
      } catch {
        return {
          ...basis,
          ok: false,
          status,
          assessmentId: assessment.id,
          assessmentNaam: assessment.naam,
          probleem: "Kolom 'opmerkingen_per_bouwblok' is geen geldige JSON.",
          antwoorden: {},
          opmerkingenPerBouwblok: {},
        };
      }
    }

    return {
      ...basis,
      ok: true,
      status,
      assessmentId: assessment.id,
      assessmentNaam: assessment.naam,
      organisatieKenmerken,
      antwoorden,
      opmerkingenPerBouwblok,
    };
  });
}
