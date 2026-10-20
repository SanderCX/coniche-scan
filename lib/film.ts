import { Assessment } from "./types";
import { isJaNeeWeetNiet } from "./quickscan";
import { actieveBouwblokkenMetGroep, isVlakkeAssessment } from "./assessment-structuur";

/**
 * De varianten van de film "Wat krijg ik" per Assessment-type (`help.md`, Films, Varianten van Wat krijg ik per Assessment-type): Dezelfde
 * opbouw, maten en drie stapkaarten voor elk type, met de kleuren en eenheden van dat type.
 *
 * - `categorieen`: Klantcontact Volwassenheid en de Zorgscan, vijf categorieën in hun eigen kleur en een ring met een score van 1 tot 5.
 * - `domeinen`: Een Assessment zonder categorielaag (de AI-scan), acht rijen met een nummercirkel en de domeinkleur.
 * - `quickscan`: Ja / Nee / Weet ik niet, met percentages en de klassekleuren.
 */
export type FilmVariant = "categorieen" | "domeinen" | "quickscan";

export function filmVariant(assessment: Pick<Assessment, "antwoordType" | "categorieen" | "bouwblokken"> | null | undefined): FilmVariant {
  if (!assessment) return "categorieen";
  if (isJaNeeWeetNiet(assessment as Assessment)) return "quickscan";
  if (isVlakkeAssessment(assessment as Assessment)) return "domeinen";
  return "categorieen";
}

const GETALWOORD = ["nul", "één", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien"];

/**
 * De weging in de film van de Zorgscan: "Drie bouwblokken tellen 2× mee" onder de klassenaam en de zin op stapkaart 2. Het aantal en de factor
 * komen uit de gewichten van de Assessment, de film noemt geen namen van bouwblokken. Zonder gewichten ongelijk aan 1 is er geen weging
 * (`null`). Hebben de zwaardere bouwblokken niet dezelfde factor, dan staat er "zwaarder" in plaats van de factor.
 */
export function filmWeging(assessment: Assessment | null | undefined): { regel: string; zin: string } | null {
  if (!assessment || isJaNeeWeetNiet(assessment)) return null;
  const gewichten = actieveBouwblokkenMetGroep(assessment)
    .map((b) => b.bouwblok.gewicht ?? 1)
    .filter((g) => g !== 1);
  if (gewichten.length === 0) return null;
  const n = gewichten.length;
  const gelijk = gewichten.every((g) => g === gewichten[0]);
  const factor = gelijk ? `${String(gewichten[0]).replace(".", ",")}×` : null;
  const woord = n <= 10 ? GETALWOORD[n] : String(n);
  const begin = `${woord.charAt(0).toUpperCase()}${woord.slice(1)}`;
  const regel = n === 1 ? `${begin} bouwblok telt ${factor ?? "zwaarder"} mee` : `${begin} bouwblokken tellen ${factor ?? "zwaarder"} mee`;
  return { regel, zin: "Bouwblokken die zwaarder meetellen, tonen hun factor" + (factor ? `, zoals ${factor}.` : ".") };
}
