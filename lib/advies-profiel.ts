import { updateGebruiker, useGebruikers } from "./gebruikers-store";
import { nieuwId } from "./id";
import { ROLTEKST_MAX, useAdviesCatalogus } from "./advies-catalogus-store";
import type { AdviesCatalogus, AdviesProfiel, AdviesProfielRol, Gebruiker } from "./types";

/**
 * De adviescontext van een Admin of Consultant (`adviesverloop.md`, Adviescontext in Mijn account; `datamodel.md`, Adviesverloop): "Over mij" en de rollen met
 * hun tekst. Persoonlijk: Alleen de eigenaar leest en wijzigt hem, hij staat bij de Gebruiker en verdwijnt met hem. Wijzigingen komen niet in het audit-log
 * en de teksten gaan alleen mee in de prompt die de Consultant zelf kopieert.
 */
export const OVER_MIJ_MAX = 600;
export const ROL_NAAM_MAX = 60;
/** De rol waarvan de prompts gelden bij een zelf toegevoegde rol (`adviesverloop.md`, Welke prompt bij een eigen rol). */
export const STANDAARD_PROMPT_ROL = "consultant";

/** Een nieuw profiel: De rollen uit de catalogus (`standaardTekst`) en een lege tekst bij Over mij. */
export function beginProfiel(catalogus: Pick<AdviesCatalogus, "rollen">): AdviesProfiel {
  const rollen = [...catalogus.rollen]
    .sort((a, b) => a.volgorde - b.volgorde)
    .map((r) => ({ id: r.id, naam: r.naam, tekst: r.standaardTekst, adviesRolId: r.id }));
  return { overMij: "", standaardRolId: rollen[0]?.id ?? "", rollen };
}

/** Het profiel van een Gebruiker: Het opgeslagene, of bij de eerste keer het beginprofiel. Een profiel zonder rollen of met een onbekende standaardrol wordt hersteld. */
export function profielVan(gebruiker: Pick<Gebruiker, "adviesProfiel"> | null | undefined, catalogus: Pick<AdviesCatalogus, "rollen">): AdviesProfiel {
  const p = gebruiker?.adviesProfiel;
  if (!p || !Array.isArray(p.rollen) || p.rollen.length === 0) return beginProfiel(catalogus);
  const standaardRolId = p.rollen.some((r) => r.id === p.standaardRolId) ? p.standaardRolId : p.rollen[0].id;
  return { overMij: p.overMij ?? "", standaardRolId, rollen: p.rollen };
}

/** De gekozen rol; bestaat die niet meer (de Consultant verwijderde hem), dan de standaardrol (`datamodel.md`, Adviescontext per Consultant). */
export function kiesProfielRol(profiel: AdviesProfiel, rolId: string | null | undefined): AdviesProfielRol {
  return profiel.rollen.find((r) => r.id === rolId) ?? profiel.rollen.find((r) => r.id === profiel.standaardRolId) ?? profiel.rollen[0];
}

/** De `AdviesRol` waarvan de prompts van de use cases voor deze rol gelden. */
export const promptRolId = (rol: Pick<AdviesProfielRol, "adviesRolId">): string => rol.adviesRolId ?? STANDAARD_PROMPT_ROL;

export type ProfielControle = { ok: true; profiel: AdviesProfiel } | { ok: false; reden: string };

/** Controleert en maakt het profiel schoon: Getrimde namen, grenzen op de lengtes, minstens één rol en een geldige standaardrol. */
export function controleerProfiel(invoer: AdviesProfiel): ProfielControle {
  if (invoer.overMij.length > OVER_MIJ_MAX) return { ok: false, reden: `"Over mij" mag maximaal ${OVER_MIJ_MAX} tekens hebben.` };
  if (invoer.rollen.length === 0) return { ok: false, reden: "Er blijft minstens één rol." };
  const rollen: AdviesProfielRol[] = [];
  for (const r of invoer.rollen) {
    const naam = r.naam.trim();
    if (!naam) return { ok: false, reden: "Elke rol heeft een naam." };
    if (naam.length > ROL_NAAM_MAX) return { ok: false, reden: `De naam van een rol mag maximaal ${ROL_NAAM_MAX} tekens hebben.` };
    if (r.tekst.length > ROLTEKST_MAX) return { ok: false, reden: `De tekst van een rol mag maximaal ${ROLTEKST_MAX} tekens hebben.` };
    rollen.push({ ...r, naam });
  }
  if (new Set(rollen.map((r) => r.id)).size !== rollen.length) return { ok: false, reden: "Een rol komt dubbel voor." };
  const standaardRolId = rollen.some((r) => r.id === invoer.standaardRolId) ? invoer.standaardRolId : rollen[0].id;
  return { ok: true, profiel: { overMij: invoer.overMij, standaardRolId, rollen } };
}

/** Een nieuwe rol: "Nieuwe rol" met een lege tekst, zonder eigen prompts (die van de rol Consultant gelden). */
export const nieuweProfielRol = (): AdviesProfielRol => ({ id: nieuwId(), naam: "Nieuwe rol", tekst: "", adviesRolId: null });

/** Een rol weghalen: De laatste rol kan niet weg en de standaardrol schuift door naar de eerste. */
export function verwijderProfielRol(profiel: AdviesProfiel, rolId: string): AdviesProfiel {
  if (profiel.rollen.length <= 1) return profiel;
  const rollen = profiel.rollen.filter((r) => r.id !== rolId);
  return { ...profiel, rollen, standaardRolId: profiel.standaardRolId === rolId ? rollen[0].id : profiel.standaardRolId };
}

/** Bewaart het profiel van een Gebruiker. Zonder audit-regel: De teksten zijn persoonlijk (`adviesverloop.md`, Privacy). */
export function slaProfielOp(gebruikerId: string, invoer: AdviesProfiel): { ok: true } | { ok: false; reden: string } {
  const c = controleerProfiel(invoer);
  if (!c.ok) return c;
  updateGebruiker(gebruikerId, (g) => ({ ...g, adviesProfiel: c.profiel }));
  return { ok: true };
}

/** Het profiel van de ingelogde Gebruiker voor in een scherm. */
export function useAdviesProfiel(gebruikerId: string | null | undefined): AdviesProfiel {
  const catalogus = useAdviesCatalogus();
  const gebruiker = useGebruikers().find((g) => g.id === gebruikerId);
  return profielVan(gebruiker, catalogus);
}
