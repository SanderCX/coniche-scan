import { Gebruiker, Organisatie } from "./types";

/**
 * Rechtencontroles voor de beheerkant, uit de Rechtenmatrix in
 * `datamodel.md` deel 2. Gecentraliseerd hier in plaats van als losse
 * `Rol`/`Permissie`/`RolPermissie`-datarecords — zie de toelichting bij
 * `Gebruiker` in `lib/types.ts` voor waarom dat nu bewust eenvoudiger is.
 *
 * De matrix geeft `organisaties.bewerken`, `organisaties.verwijderen`,
 * `metingen.plannen`, `respondenten.uitnodigen`, `respondenten.
 * leadToekennen`, `respondenten.verwijderen`, `scans.verwijderen`,
 * `resultaten.inzien` en `export.uitvoeren` allemaal hetzelfde bereik
 * "eigen" voor een Consultant — dus één gate (`magOrganisatieToegang`)
 * voor al die rijen, ongeacht welke actie het precies is.
 *
 * **`content.beheren` staat in de matrix zelf nog als "te bevestigen"**
 * voor een Consultant: Hier op geen toegang gezet, in lijn met "minimale
 * toegang per rol" (`datamodel.md` deel 2). Admin is in alle gevallen
 * onbeperkt.
 */

export function isAdmin(gebruiker: Gebruiker | null): boolean {
  return gebruiker?.rol === "admin";
}

export function isConsultant(gebruiker: Gebruiker | null): boolean {
  return gebruiker?.rol === "consultant";
}

/** Import van scans (`beheerpagina.md`, punt 8): Alleen een Admin. */
export function magImporteren(gebruiker: Gebruiker | null): boolean {
  return isAdmin(gebruiker);
}

/** `gebruikers.beheren`/`rollen.toekennen`: alle (Admin) — Consultant heeft geen toegang. */
export function magGebruikersBeheren(gebruiker: Gebruiker | null): boolean {
  return isAdmin(gebruiker);
}

/** `content.beheren`: alle (Admin) — "te bevestigen" voor Consultant, hier standaard geen toegang. */
export function magContentBeheren(gebruiker: Gebruiker | null): boolean {
  return isAdmin(gebruiker);
}

/**
 * `benchmark.beheren`: alle (Admin). Een benchmark rekent over organisaties die een Consultant niet beheert, dus het
 * bereik "eigen" past er niet bij en een Consultant heeft er vooralsnog geen toegang toe (`datamodel.md` deel 2,
 * Rechtenmatrix).
 */
export function magBenchmarkBeheren(gebruiker: Gebruiker | null): boolean {
  return isAdmin(gebruiker);
}

/**
 * Bereik "eigen" (`datamodel.md` deel 2, Eigenaarschap en toegang van/tot
 * organisaties): Admin altijd, Consultant alleen als hij de organisatie
 * aanmaakte (`aangemaaktDoor`) óf een Admin hem die expliciet toewees
 * (`toegewezenAan`). Dekt `organisaties.bewerken`, `organisaties.
 * verwijderen`, `metingen.plannen`, `respondenten.uitnodigen`,
 * `respondenten.leadToekennen`, `respondenten.verwijderen`, `scans.
 * verwijderen`, `resultaten.inzien` en `export.uitvoeren` — allemaal
 * dezelfde rij "eigen" in de Rechtenmatrix.
 */
export function magOrganisatieToegang(
  gebruiker: Gebruiker | null,
  organisatie: Pick<Organisatie, "aangemaaktDoor" | "toegewezenAan">
): boolean {
  if (isAdmin(gebruiker)) return true;
  if (!isConsultant(gebruiker)) return false;
  return organisatie.aangemaaktDoor === gebruiker!.id || organisatie.toegewezenAan.includes(gebruiker!.id);
}

/** Filtert een lijst organisaties naar wat deze gebruiker mag zien/beheren (zelfde bereik als hierboven). */
export function zichtbareOrganisaties<T extends Pick<Organisatie, "aangemaaktDoor" | "toegewezenAan">>(
  gebruiker: Gebruiker | null,
  organisaties: T[]
): T[] {
  if (isAdmin(gebruiker)) return organisaties;
  return organisaties.filter((org) => magOrganisatieToegang(gebruiker, org));
}

/** `organisaties.aanmaken`: alle (Admin) / ja (Consultant) — beide mogen, geen scope nodig. */
export function magOrganisatieAanmaken(gebruiker: Gebruiker | null): boolean {
  return isAdmin(gebruiker) || isConsultant(gebruiker);
}

/** `organisaties.toewijzen` (aan een Consultant): alle (Admin) — Consultant heeft geen toegang. */
export function magOrganisatieToewijzen(gebruiker: Gebruiker | null): boolean {
  return isAdmin(gebruiker);
}

/** `organisaties.verwijderen`: alle (Admin) / eigen (Consultant). */
export function magOrganisatieVerwijderen(
  gebruiker: Gebruiker | null,
  organisatie: Pick<Organisatie, "aangemaaktDoor" | "toegewezenAan">
): boolean {
  return magOrganisatieToegang(gebruiker, organisatie);
}

/** `respondenten.verwijderen`: alle (Admin) / eigen (Consultant). */
export function magRespondentVerwijderen(
  gebruiker: Gebruiker | null,
  organisatie: Pick<Organisatie, "aangemaaktDoor" | "toegewezenAan">
): boolean {
  return magOrganisatieToegang(gebruiker, organisatie);
}

/** `scans.verwijderen`: alle (Admin) / eigen (Consultant). */
export function magScanVerwijderen(
  gebruiker: Gebruiker | null,
  organisatie: Pick<Organisatie, "aangemaaktDoor" | "toegewezenAan">
): boolean {
  return magOrganisatieToegang(gebruiker, organisatie);
}

/** `respondenten.leadToekennen`: alle (Admin) / eigen (Consultant). */
export function magLeadToekennen(
  gebruiker: Gebruiker | null,
  organisatie: Pick<Organisatie, "aangemaaktDoor" | "toegewezenAan">
): boolean {
  return magOrganisatieToegang(gebruiker, organisatie);
}

/**
 * Algemene teksten (`beheerpagina.md` punt 2a, `datamodel.md`
 * `AlgemeneTekst`): niet in de Rechtenmatrix als eigen rij, maar staat
 * onder "Applicatie" naast Gebruikers/Instellingen — dezelfde Admin-only
 * gate als die twee.
 */
export function magAlgemeneTekstenBeheren(gebruiker: Gebruiker | null): boolean {
  return isAdmin(gebruiker);
}
