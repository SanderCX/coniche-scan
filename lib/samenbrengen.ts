/**
 * Scans samenbrengen in één Meting (`beheerpagina.md`, punt 6b, "Scans samenbrengen in één Meting"). Pure controle, zonder
 * opslag, zodat het scherm dezelfde regels toont als de opslagfunctie afdwingt.
 *
 * Eén Respondent heeft hoogstens één scan per Meting. De controle kijkt daarom naar het eindresultaat: Welke Respondent
 * hoort na afloop bij elke scan, en komt er in de doel-Meting een Respondent twee keer voor? Dat geldt ook voor de scans die er al
 * in staan.
 */
import { Organisatie, OrganisatieLid } from "./types";
import { normaliseerEmail } from "./email";

export type RespondentKeuze =
  | { soort: "houden" }
  | { soort: "bestaand"; respondentId: string }
  | { soort: "nieuw"; naam: string; email: string; functie: string; team: string };

export interface SamenbrengRegel {
  invullingId: string;
  respondent: RespondentKeuze;
}

export interface SamenbrengBron {
  invullingId: string;
  metingId: string;
  lidId: string;
}

/** Een tekst per regel (`invullingId`) die uitlegt waarom opslaan nog niet kan. Een lege uitkomst betekent: In orde. */
export type SamenbrengFouten = Record<string, string>;

/** Hoe een Respondent heet in een melding: De naam, anders het e-mailadres. */
export function lidNaam(lid: Pick<OrganisatieLid, "naam" | "email"> | undefined): string {
  return lid ? lid.naam || lid.email : "Deze Respondent";
}

/**
 * Controleert de regels tegen de doel-Meting. `doelMetingId` is `null` bij een nieuwe Meting (die is leeg). De namen van
 * de regels staan in `volgorde`, voor de verwijzing "regel 3" in de melding.
 */
export function controleerSamenbrengen(
  organisatie: Pick<Organisatie, "leden" | "scanUitvoeringen">,
  bronnen: SamenbrengBron[],
  regels: SamenbrengRegel[],
  doelMetingId: string | null
): SamenbrengFouten {
  const fouten: SamenbrengFouten = {};
  const bron = new Map(bronnen.map((b) => [b.invullingId, b]));
  const ledenPerId = new Map(organisatie.leden.map((l) => [l.id, l]));
  const bestaandeEmails = new Map(organisatie.leden.map((l) => [normaliseerEmail(l.email), l]));
  const volgorde = regels.map((r) => r.invullingId);

  // 1. Nieuwe Respondenten: Verplicht e-mailadres, niet in gebruik, onderling verschillend.
  const nieuweEmails = new Map<string, string>();
  for (const regel of regels) {
    if (regel.respondent.soort !== "nieuw") continue;
    const email = normaliseerEmail(regel.respondent.email);
    if (!email) {
      fouten[regel.invullingId] = "Vul een e-mailadres in voor de nieuwe Respondent (een tijdelijk adres mag).";
      continue;
    }
    if (!email.includes("@")) {
      fouten[regel.invullingId] = "Dit e-mailadres is niet geldig.";
      continue;
    }
    const inGebruik = bestaandeEmails.get(email);
    if (inGebruik) {
      fouten[regel.invullingId] = `Dit e-mailadres is al in gebruik door ${lidNaam(inGebruik)}. Kies die Respondent in de lijst.`;
      continue;
    }
    const eerder = nieuweEmails.get(email);
    if (eerder) {
      fouten[regel.invullingId] = `Dit e-mailadres staat ook bij regel ${volgorde.indexOf(eerder) + 1}.`;
      continue;
    }
    nieuweEmails.set(email, regel.invullingId);
  }

  // 2. Het eindresultaat per regel: De Respondent die na afloop bij de scan hoort.
  const eind = new Map<string, string>(); // invullingId -> sleutel van de Respondent
  for (const regel of regels) {
    const b = bron.get(regel.invullingId);
    if (!b) continue;
    if (regel.respondent.soort === "houden") eind.set(regel.invullingId, b.lidId);
    else if (regel.respondent.soort === "bestaand") {
      if (!ledenPerId.has(regel.respondent.respondentId)) fouten[regel.invullingId] ??= "Deze Respondent bestaat niet meer.";
      else eind.set(regel.invullingId, regel.respondent.respondentId);
    } else eind.set(regel.invullingId, `nieuw:${normaliseerEmail(regel.respondent.email) || regel.invullingId}`);
  }

  // 3. Hoogstens één scan per Respondent in de doel-Meting, ook voor wat er al in staat.
  const geselecteerd = new Set(regels.map((r) => r.invullingId));
  const doel = doelMetingId ? organisatie.scanUitvoeringen.find((m) => m.id === doelMetingId) : undefined;
  const aanwezig = new Map<string, string>(); // sleutel van de Respondent -> invullingId van een scan die er al staat
  for (const i of doel?.invullingen ?? []) if (!geselecteerd.has(i.id)) aanwezig.set(i.organisatieLidId, i.id);

  const perRespondent = new Map<string, string[]>();
  for (const regel of regels) {
    const sleutel = eind.get(regel.invullingId);
    if (!sleutel) continue;
    perRespondent.set(sleutel, [...(perRespondent.get(sleutel) ?? []), regel.invullingId]);
  }
  for (const [sleutel, ids] of perRespondent) {
    const lid = ledenPerId.get(sleutel);
    const naam = lid ? lidNaam(lid) : "Deze Respondent";
    const reedsAanwezig = aanwezig.has(sleutel);
    if (!reedsAanwezig && ids.length < 2) continue;
    for (const id of ids) {
      if (fouten[id]) continue;
      const anderen = ids.filter((x) => x !== id).map((x) => `regel ${volgorde.indexOf(x) + 1}`);
      const erbij = reedsAanwezig ? "al in de Meting aanwezig" : anderen.join(", ");
      fouten[id] = `${naam} heeft al een scan in deze Meting (${erbij}).`;
    }
  }
  return fouten;
}
