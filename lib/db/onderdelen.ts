import { Onderdeel } from "../types";
import { laadAlles, slaAlles } from "./store";
import { logAudit } from "../audit-store";
import { organisatieContext } from "../audit-context";
import { standaardLabel } from "../metingen";
import { controleerOnderdeelNaam, isHeleOrganisatie, metingenVanOnderdeel, nieuwOnderdeel, sleutelVan } from "../onderdelen";
import { adviesverloopVanOnderdeel } from "../advies";
import type { Resultaat } from "./meting-plannen";

/**
 * Onderdelen van een Organisatie aanmaken, hernoemen en verwijderen (`datamodel.md`, Onderdeel). Aanmaken kan hier of
 * vanzelf bij het opslaan van een Meting met een nieuwe naam (`zorgOnderdelenKloppend`). Elke wijziging wordt gelogd
 * (`onderdeel.aangemaakt`, `onderdeel.hernoemd` en `onderdeel.verwijderd`) zonder persoonsgegevens.
 */

/** Een Onderdeel aanmaken. Een naam die hoofdletterongevoelig overeenkomt met een bestaand Onderdeel is geen nieuw Onderdeel. */
export function maakOnderdeel(organisatieId: string, invoer: string): Resultaat<{ onderdeel: Onderdeel; nieuw: boolean }> {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  const c = controleerOnderdeelNaam(organisatie, invoer);
  if (!c.ok) return { ok: false, reden: c.reden };
  if (c.hele) return { ok: false, reden: "Hele organisatie is de standaard en geen onderdeel." };
  if (c.bestaand) return { ok: true, onderdeel: c.bestaand, nieuw: false };
  const onderdeel = nieuwOnderdeel(organisatie.id, c.naam);
  organisatie.onderdelen = [...(organisatie.onderdelen ?? []), onderdeel];
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit({
    actie: "onderdeel.aangemaakt",
    entiteitType: "onderdeel",
    entiteitId: onderdeel.id,
    entiteitNaam: onderdeel.naam,
    details: { ...organisatieContext(organisatie), onderdeelNaam: onderdeel.naam },
  });
  return { ok: true, onderdeel, nieuw: true };
}

/**
 * Een Onderdeel hernoemen: De naam verandert op één plek en de Metingen volgen. Een Meting met een naam die uit het onderdeel
 * volgt, krijgt de nieuwe naam, een Meting met `labelHandmatig` houdt haar eigen naam. De naam moet uniek blijven binnen de
 * Organisatie, een andere schrijfwijze van dezelfde naam (hoofdletters) mag.
 */
export function hernoemOnderdeel(organisatieId: string, onderdeelId: string, invoer: string): Resultaat<{ gewijzigd: boolean }> {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  const onderdeel = organisatie?.onderdelen?.find((o) => o.id === onderdeelId);
  if (!organisatie || !onderdeel) return { ok: false, reden: "Onderdeel niet gevonden." };
  const naam = invoer.trim().replace(/\s+/g, " ");
  if (!naam) return { ok: false, reden: "Vul een naam in." };
  if (isHeleOrganisatie(naam)) return { ok: false, reden: "Deze naam is gereserveerd voor de hele organisatie." };
  const c = controleerOnderdeelNaam(organisatie, naam);
  if (!c.ok) return { ok: false, reden: c.reden };
  if (c.bestaand && c.bestaand.id !== onderdeel.id) return { ok: false, reden: "Er is al een onderdeel met deze naam." };
  if (onderdeel.naam === naam) return { ok: true, gewijzigd: false };
  const oudeNaam = onderdeel.naam;
  onderdeel.naam = naam;
  for (const m of metingenVanOnderdeel(organisatie, onderdeel.id)) {
    if (!m.labelHandmatig) m.label = standaardLabel(naam, m);
  }
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit({
    actie: "onderdeel.hernoemd",
    entiteitType: "onderdeel",
    entiteitId: onderdeel.id,
    entiteitNaam: naam,
    details: { ...organisatieContext(organisatie), oudeNaam, nieuweNaam: naam },
  });
  return { ok: true, gewijzigd: true };
}

/** De Metingen die een Onderdeel aan het verwijderen hinderen, en het aantal KPI-waarden dat meegaat. */
export function verwijderGevolgenOnderdeel(organisatieId: string, onderdeelId: string): { metingen: number; kpiWaarden: number } {
  const organisatie = laadAlles().find((o) => o.id === organisatieId);
  if (!organisatie) return { metingen: 0, kpiWaarden: 0 };
  return {
    metingen: metingenVanOnderdeel(organisatie, onderdeelId).length,
    kpiWaarden: (organisatie.kpiWaarden ?? []).filter((w) => w.onderdeelId === onderdeelId).length,
  };
}

/**
 * Een Onderdeel verwijderen: Alleen als er geen Meting en geen adviesverloop aan hangt. De KPI-waarden van het Onderdeel verdwijnen mee, de
 * bevestiging in het scherm noemt het aantal (`verwijderGevolgenOnderdeel`).
 */
export function verwijderOnderdeel(organisatieId: string, onderdeelId: string): Resultaat<{ kpiWaarden: number }> {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  const onderdeel = organisatie?.onderdelen?.find((o) => o.id === onderdeelId);
  if (!organisatie || !onderdeel) return { ok: false, reden: "Onderdeel niet gevonden." };
  const aantalMetingen = metingenVanOnderdeel(organisatie, onderdeel.id).length;
  if (aantalMetingen > 0) {
    return { ok: false, reden: `Dit onderdeel heeft ${aantalMetingen} ${aantalMetingen === 1 ? "Meting" : "Metingen"}. Verwijder of wijzig die eerst.` };
  }
  if (adviesverloopVanOnderdeel(organisatie, onderdeel.id)) return { ok: false, reden: "Dit onderdeel heeft een adviesverloop. Verwijder dat eerst." };
  const weg = (organisatie.kpiWaarden ?? []).filter((w) => w.onderdeelId === onderdeel.id).length;
  organisatie.onderdelen = (organisatie.onderdelen ?? []).filter((o) => o.id !== onderdeel.id);
  if (organisatie.kpiWaarden) organisatie.kpiWaarden = organisatie.kpiWaarden.filter((w) => w.onderdeelId !== onderdeel.id);
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit({
    actie: "onderdeel.verwijderd",
    entiteitType: "onderdeel",
    entiteitId: onderdeel.id,
    entiteitNaam: onderdeel.naam,
    details: { ...organisatieContext(organisatie), onderdeelNaam: onderdeel.naam, aantalKpiWaarden: weg },
  });
  return { ok: true, kpiWaarden: weg };
}

/** Een naam voor in een lijst: Hoofdletterongevoelig uniek. */
export function onderdeelNaamBestaat(organisatieId: string, naam: string, uitgezonderdId?: string): boolean {
  const organisatie = laadAlles().find((o) => o.id === organisatieId);
  const s = sleutelVan(naam);
  return !!organisatie?.onderdelen?.some((o) => o.id !== uitgezonderdId && sleutelVan(o.naam) === s);
}
