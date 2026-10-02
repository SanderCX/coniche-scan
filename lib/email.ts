/**
 * Eén normalisatie voor elk e-mailadres in de app (`Respondent.email`,
 * `Gebruiker.email`): getrimd en lowercase, zowel vóór opslag als bij elke
 * vergelijking (`datamodel.md`, Respondent). Zonder dit ontstaat bij een
 * andere schrijfwijze (hoofdletters, spaties) een dubbele respondent/
 * gebruiker in plaats van hergebruik, of een gemiste match bij inloggen.
 */
export function normaliseerEmail(email: string): string {
  return email.trim().toLowerCase();
}
