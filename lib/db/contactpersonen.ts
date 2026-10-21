import { Contactpersoon } from "../types";
import { laadAlles, slaAlles } from "./store";
import { logAudit } from "../audit-store";
import { organisatieContext } from "../audit-context";
import { nieuwId } from "../id";
import { ContactpersoonInvoer, controleerContactpersoon } from "../contactpersonen";
import type { Resultaat } from "./meting-plannen";

/**
 * Contactpersonen van een Organisatie toevoegen, wijzigen en verwijderen (`datamodel.md`, Contactpersoon). Elke wijziging wordt
 * gelogd. De audit-log bevat nooit de naam, de functie of het LinkedIn-adres van een contactpersoon (`datamodel.md`, Audit).
 */

function context(organisatieId: string) {
  const alles = laadAlles();
  return { alles, organisatie: alles.find((o) => o.id === organisatieId) };
}

export function voegContactpersoonToe(organisatieId: string, invoer: ContactpersoonInvoer): Resultaat<{ contactpersoon: Contactpersoon }> {
  const c = controleerContactpersoon(invoer);
  if (!c.ok) return { ok: false, reden: c.reden };
  const { alles, organisatie } = context(organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  const contactpersoon: Contactpersoon = { id: nieuwId(), ...c.waarde, aangemaaktOp: new Date().toISOString() };
  organisatie.contactpersonen = [...(organisatie.contactpersonen ?? []), contactpersoon];
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit({
    actie: "contactpersoon.toegevoegd",
    entiteitType: "contactpersoon",
    entiteitId: contactpersoon.id,
    details: { ...organisatieContext(organisatie), metLinkedin: contactpersoon.linkedinUrl !== "" },
  });
  return { ok: true, contactpersoon };
}

export function wijzigContactpersoon(organisatieId: string, id: string, invoer: ContactpersoonInvoer): Resultaat {
  const c = controleerContactpersoon(invoer);
  if (!c.ok) return { ok: false, reden: c.reden };
  const { alles, organisatie } = context(organisatieId);
  const bestaand = organisatie?.contactpersonen?.find((p) => p.id === id);
  if (!organisatie || !bestaand) return { ok: false, reden: "Contactpersoon niet gevonden." };
  const velden = (Object.keys(c.waarde) as (keyof ContactpersoonInvoer)[]).filter((k) => bestaand[k] !== c.waarde[k]);
  if (velden.length === 0) return { ok: true };
  Object.assign(bestaand, c.waarde);
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit({
    actie: "contactpersoon.gewijzigd",
    entiteitType: "contactpersoon",
    entiteitId: bestaand.id,
    details: { ...organisatieContext(organisatie), velden },
  });
  return { ok: true };
}

export function verwijderContactpersoon(organisatieId: string, id: string): Resultaat {
  const { alles, organisatie } = context(organisatieId);
  const bestaand = organisatie?.contactpersonen?.find((p) => p.id === id);
  if (!organisatie || !bestaand) return { ok: false, reden: "Contactpersoon niet gevonden." };
  organisatie.contactpersonen = (organisatie.contactpersonen ?? []).filter((p) => p.id !== id);
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit({
    actie: "contactpersoon.verwijderd",
    entiteitType: "contactpersoon",
    entiteitId: id,
    details: organisatieContext(organisatie),
  });
  return { ok: true };
}
