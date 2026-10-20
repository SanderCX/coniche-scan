import { Contactpersoon, Nieuwsartikel } from "../types";
import { laadAlles, slaAlles } from "./store";
import { logAudit } from "../audit-store";
import { organisatieContext } from "../audit-context";
import { nieuwId } from "../id";
import {
  ContactpersoonInvoer,
  NieuwsartikelInvoer,
  controleerContactpersoon,
  controleerNieuwsartikel,
} from "../contacten-nieuws";
import type { Resultaat } from "./meting-plannen";

/**
 * Contactpersonen en nieuwsartikelen van een Organisatie toevoegen, wijzigen en verwijderen (`datamodel.md`, Contactpersoon en
 * Nieuwsartikel). Elke wijziging wordt gelogd. De audit-log bevat nooit de naam, de functie of het LinkedIn-adres van een
 * contactpersoon (`datamodel.md`, Audit), wel de titel van een nieuwsartikel.
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

export function voegNieuwsartikelToe(organisatieId: string, invoer: NieuwsartikelInvoer): Resultaat<{ nieuwsartikel: Nieuwsartikel }> {
  const c = controleerNieuwsartikel(invoer);
  if (!c.ok) return { ok: false, reden: c.reden };
  const { alles, organisatie } = context(organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  const nieuwsartikel: Nieuwsartikel = { id: nieuwId(), ...c.waarde, aangemaaktOp: new Date().toISOString() };
  organisatie.nieuwsartikelen = [...(organisatie.nieuwsartikelen ?? []), nieuwsartikel];
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit({
    actie: "nieuwsartikel.toegevoegd",
    entiteitType: "nieuwsartikel",
    entiteitId: nieuwsartikel.id,
    entiteitNaam: nieuwsartikel.titel,
    details: { ...organisatieContext(organisatie), titel: nieuwsartikel.titel },
  });
  return { ok: true, nieuwsartikel };
}

export function wijzigNieuwsartikel(organisatieId: string, id: string, invoer: NieuwsartikelInvoer): Resultaat {
  const c = controleerNieuwsartikel(invoer);
  if (!c.ok) return { ok: false, reden: c.reden };
  const { alles, organisatie } = context(organisatieId);
  const bestaand = organisatie?.nieuwsartikelen?.find((n) => n.id === id);
  if (!organisatie || !bestaand) return { ok: false, reden: "Nieuwsartikel niet gevonden." };
  const velden = (Object.keys(c.waarde) as (keyof NieuwsartikelInvoer)[]).filter((k) => bestaand[k] !== c.waarde[k]);
  if (velden.length === 0) return { ok: true };
  Object.assign(bestaand, c.waarde);
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit({
    actie: "nieuwsartikel.gewijzigd",
    entiteitType: "nieuwsartikel",
    entiteitId: bestaand.id,
    entiteitNaam: bestaand.titel,
    details: { ...organisatieContext(organisatie), titel: bestaand.titel, velden },
  });
  return { ok: true };
}

export function verwijderNieuwsartikel(organisatieId: string, id: string): Resultaat {
  const { alles, organisatie } = context(organisatieId);
  const bestaand = organisatie?.nieuwsartikelen?.find((n) => n.id === id);
  if (!organisatie || !bestaand) return { ok: false, reden: "Nieuwsartikel niet gevonden." };
  organisatie.nieuwsartikelen = (organisatie.nieuwsartikelen ?? []).filter((n) => n.id !== id);
  organisatie.gewijzigdOp = new Date().toISOString();
  slaAlles(alles);
  logAudit({
    actie: "nieuwsartikel.verwijderd",
    entiteitType: "nieuwsartikel",
    entiteitId: id,
    entiteitNaam: bestaand.titel,
    details: { ...organisatieContext(organisatie), titel: bestaand.titel },
  });
  return { ok: true };
}
