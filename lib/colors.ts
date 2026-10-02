import { BeheerRol, Classificatie } from "./types";

/**
 * Officiële Coniche-huisstijlkleuren per categorie (stylesheet.md,
 * Categoriekleuren). Alle vijf zijn zelf donker genoeg voor tekst op wit en
 * voor witte tekst erop — geen aparte tekstvariant meer nodig (v1-
 * aanpassingen.md punt 15). Fundament was eerder "goud" (`--ye`, te licht
 * om als tekst/achtergrond-onder-witte-tekst te lezen), nu "antraciet"
 * (`--fu`).
 */
export const CATEGORIE_COLORS: Record<
  string,
  { bg: string; text: string; border: string; hex: string }
> = {
  oranje: { bg: "bg-or", text: "text-or", border: "border-or", hex: "#ff671f" },
  blauw: { bg: "bg-bl", text: "text-bl", border: "border-bl", hex: "#225ba0" },
  paars: { bg: "bg-pu", text: "text-pu", border: "border-pu", hex: "#392944" },
  groen: { bg: "bg-gr", text: "text-gr", border: "border-gr", hex: "#197f4e" },
  antraciet: { bg: "bg-fu", text: "text-fu", border: "border-fu", hex: "#44403c" },
};

/**
 * Rolkleuren (stylesheet.md, "Rolkleuren"): los van de categoriekleuren
 * hierboven, maar hergebruikt vier van dezelfde merkkleuren. Voor de
 * Rolbadge naast het logo (vervangt de vaste zwarte "Beheer"-badge) —
 * momenteel alleen `admin`/`consultant` daadwerkelijk zichtbaar (de enige
 * twee `Gebruiker`-rollen, `lib/types.ts`); `lead`/`respondent` liggen
 * klaar voor als de organisatiekant een eigen ingelogde weergave krijgt.
 */
export const ROL_KLEUR: Record<BeheerRol | "lead" | "respondent", { hex: string; label: string }> = {
  admin: { hex: "#225ba0", label: "Admin" },
  consultant: { hex: "#ff671f", label: "Consultant" },
  lead: { hex: "#392944", label: "Lead" },
  respondent: { hex: "#197f4e", label: "Respondent" },
};

/**
 * Conditionele opmaak per individueel antwoord (1–5-schaal) in het
 * admin-scanoverzicht ("Antwoorden per bouwblok") — op verzoek van Sander.
 * Losse schaal van de 3-staps classificatie (--stat-*) hierboven: hier
 * gaat het om de score per vraag, niet om de classificatie van een
 * bouwblok/categorie.
 */
export const ANTWOORD_KLEUR: Record<number, { bg: string; text: string }> = {
  1: { bg: "#dc2626", text: "#ffffff" },
  2: { bg: "#f97316", text: "#ffffff" },
  3: { bg: "#facc15", text: "#1c1c1a" },
  4: { bg: "#84cc16", text: "#1c1c1a" },
  5: { bg: "#16a34a", text: "#ffffff" },
};

/**
 * Scorekleuren op een vijfstapsschaal (stylesheet.md, "Scorekleuren"; v1-
 * aanpassingen.md punt 13). Exacte waarden komen letterlijk uit tokens.css
 * (`--score-1` t/m `--score-5`). Gebruikt voor scores per bouwblok en
 * categorie, de overall score, de classificatiecirkel, de staafdiagrammen,
 * de top 3 en de legenda — NIET voor de antwoordopties in de vragenlijst
 * zelf (zie ANTWOORD_KLEUR hierboven, dat is een los, ouder mechanisme voor
 * al ingevulde antwoorden in het beheerscherm).
 */
export const SCORE_KLEUR: Record<1 | 2 | 3 | 4 | 5, { hex: string; textOp: string }> = {
  1: { hex: "#dc2626", textOp: "#ffffff" },
  2: { hex: "#e8871e", textOp: "#ffffff" },
  3: { hex: "#eab308", textOp: "#1c1c1a" },
  4: { hex: "#7bc043", textOp: "#1c1c1a" },
  5: { hex: "#15803d", textOp: "#ffffff" },
};

/** Rondt af naar de dichtstbijzijnde score (half-away-from-zero, zie lib/scoring.ts) en geeft de kleur. */
export function scoreKleur(score: number): string {
  const afgerond = Math.min(5, Math.max(1, Math.round(score))) as 1 | 2 | 3 | 4 | 5;
  return SCORE_KLEUR[afgerond].hex;
}

/**
 * Welke scorewaarden een classificatie omvat, omdat de grenzen (2,5 en
 * 3,5) samenvallen met de afrondingsgrenzen (stylesheet.md, Scorekleuren).
 * Gebruikt om de legenda per classificatie de juiste scorekleur(en) te
 * tonen in plaats van een eigen vaste statuskleur.
 */
export const CLASSIFICATIE_SCORES: Record<Classificatie, (1 | 2 | 3 | 4 | 5)[]> = {
  rood: [1, 2],
  oranje: [3],
  groen: [4, 5],
};

export const CLASSIFICATIE_INFO: Record<Classificatie, { label: string; omschrijving: string }> = {
  rood: {
    label: "Basis op Orde",
    omschrijving:
      "De basis moet op dit punt eerst op orde gemaakt worden om verder te kunnen uitbouwen.",
  },
  oranje: {
    label: "Uitbouwen",
    omschrijving:
      "De basis is op orde en je bent onderweg, maar er is nog een verbeterstap nodig om richting excellent te gaan.",
  },
  groen: {
    label: "Sterk punt",
    omschrijving:
      "Hier is de organisatie al heel goed in. Benut dit optimaal en bouw het verder uit, ook ter ondersteuning van zwakkere bouwblokken.",
  },
};
