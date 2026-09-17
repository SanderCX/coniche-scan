import { verstuurVerificatiecode } from "./mailer";

const KEY = "coniche-scan:verificaties";
const GELDIGHEID_MS = 15 * 60 * 1000;

interface VerificatieRecord {
  emailIngevoerd: string;
  code: string;
  verlooptOp: string;
  geverifieerd: boolean;
}

function laadAlles(): Record<string, VerificatieRecord> {
  if (typeof window === "undefined") return {};
  const ruw = window.localStorage.getItem(KEY);
  if (!ruw) return {};
  try {
    return JSON.parse(ruw) as Record<string, VerificatieRecord>;
  } catch {
    return {};
  }
}

function slaAlles(alles: Record<string, VerificatieRecord>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(alles));
}

function genereerCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Genereert een code, slaat 'm op (15 min geldig) en verstuurt 'm via Gmail.
 * Geeft terug of de mail echt is verstuurd (`verstuurd`) en de code zelf
 * (`code`) — die laatste alleen bedoeld om te tonen als dev-fallback
 * wanneer `verstuurd` false is.
 */
export async function stuurVerificatiecode(
  respondentId: string,
  email: string
): Promise<{ code: string; verstuurd: boolean }> {
  const alles = laadAlles();
  const code = genereerCode();
  alles[respondentId] = {
    emailIngevoerd: email,
    code,
    verlooptOp: new Date(Date.now() + GELDIGHEID_MS).toISOString(),
    geverifieerd: false,
  };
  slaAlles(alles);
  const verstuurd = await verstuurVerificatiecode(email, code);
  return { code, verstuurd };
}

export type CodeControleResultaat = "ok" | "onjuist" | "verlopen" | "niet-aangevraagd";

export function controleerCode(respondentId: string, code: string): CodeControleResultaat {
  const alles = laadAlles();
  const record = alles[respondentId];
  if (!record) return "niet-aangevraagd";
  if (new Date(record.verlooptOp).getTime() < Date.now()) return "verlopen";
  if (record.code !== code.trim()) return "onjuist";
  record.geverifieerd = true;
  slaAlles(alles);
  return "ok";
}

export function isGeverifieerd(respondentId: string): boolean {
  return laadAlles()[respondentId]?.geverifieerd ?? false;
}
