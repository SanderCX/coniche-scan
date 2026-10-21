import { Dossieritem, Organisatie } from "../types";
import { laadAlles, slaAlles } from "./store";
import { logAudit } from "../audit-store";
import { organisatieContext } from "../audit-context";
import { nieuwId } from "../id";
import { DossierInvoer, aantalZichtbaarVoorLead, controleerDossieritem, dossierVan, kanOpenZetten, leegDossier } from "../dossier";
import type { Resultaat } from "./meting-plannen";

/**
 * Het Dossier van een Organisatie: Items toevoegen, wijzigen en verwijderen, het Dossier openzetten voor de Lead, de Afspraak "Mag als case
 * gebruikt worden" en het moment waarop een Lead het Dossier las (`dossier.md`). Elke wijziging wordt gelogd. Bij een Case staat de naam van
 * de Organisatie in de case in de log (alleen een Admin leest die, `dossier.md`, Audit).
 */

function context(organisatieId: string) {
  const alles = laadAlles();
  return { alles, organisatie: alles.find((o) => o.id === organisatieId) };
}

function dossierVanOrg(organisatie: Organisatie) {
  if (!organisatie.dossier) organisatie.dossier = leegDossier();
  return organisatie.dossier;
}

/** De naam van de Organisatie in een Case, voor de audit-log. */
function caseNaam(alles: Organisatie[], item: Pick<Dossieritem, "soort" | "caseOrganisatieId">): Record<string, unknown> {
  if (item.soort !== "case") return {};
  const o = alles.find((x) => x.id === item.caseOrganisatieId);
  return { caseOrganisatieNaam: o?.naam ?? null };
}

export function voegDossieritemToe(organisatieId: string, invoer: DossierInvoer): Resultaat<{ item: Dossieritem }> {
  const { alles, organisatie } = context(organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  const c = controleerDossieritem(invoer, organisatie.id);
  if (!c.ok) return { ok: false, reden: c.reden };
  if (c.waarde.zichtbaarVoorLead) {
    const reden = kanOpenZetten(c.waarde, alles.find((o) => o.id === c.waarde.caseOrganisatieId));
    if (reden) return { ok: false, reden };
  }
  const nu = new Date().toISOString();
  const item: Dossieritem = { id: nieuwId(), ...c.waarde, aangemaaktOp: nu, gewijzigdOp: nu };
  const dossier = dossierVanOrg(organisatie);
  dossier.items = [...dossier.items, item];
  if (item.zichtbaarVoorLead) dossier.gewijzigdOp = nu;
  organisatie.gewijzigdOp = nu;
  slaAlles(alles);
  logAudit({
    actie: "dossier.itemToegevoegd",
    entiteitType: "dossieritem",
    entiteitId: item.id,
    entiteitNaam: item.titel,
    details: { ...organisatieContext(organisatie), soort: item.soort, titel: item.titel, ...caseNaam(alles, item) },
  });
  return { ok: true, item };
}

export function wijzigDossieritem(organisatieId: string, id: string, invoer: DossierInvoer): Resultaat {
  const { alles, organisatie } = context(organisatieId);
  const bestaand = organisatie?.dossier?.items.find((i) => i.id === id);
  if (!organisatie || !bestaand) return { ok: false, reden: "Item niet gevonden." };
  const c = controleerDossieritem({ ...invoer, soort: bestaand.soort }, organisatie.id);
  if (!c.ok) return { ok: false, reden: c.reden };
  // Een item dat al open stond, mag bewerkt worden zonder dat de toestemming nu klopt (dan staat de status op "Toestemming ontbreekt").
  // Nieuw openzetten kan alleen met toestemming.
  if (c.waarde.zichtbaarVoorLead && !bestaand.zichtbaarVoorLead) {
    const reden = kanOpenZetten(c.waarde, alles.find((o) => o.id === c.waarde.caseOrganisatieId));
    if (reden) return { ok: false, reden };
  }
  const velden = (Object.keys(c.waarde) as (keyof DossierInvoer)[]).filter(
    (k) => JSON.stringify(bestaand[k]) !== JSON.stringify(c.waarde[k])
  );
  if (velden.length === 0) return { ok: true };
  const nu = new Date().toISOString();
  const zagLead = bestaand.zichtbaarVoorLead;
  Object.assign(bestaand, c.waarde, { gewijzigdOp: nu });
  const dossier = dossierVanOrg(organisatie);
  if (zagLead || bestaand.zichtbaarVoorLead) dossier.gewijzigdOp = nu;
  organisatie.gewijzigdOp = nu;
  slaAlles(alles);
  logAudit({
    actie: "dossier.itemGewijzigd",
    entiteitType: "dossieritem",
    entiteitId: bestaand.id,
    entiteitNaam: bestaand.titel,
    details: { ...organisatieContext(organisatie), soort: bestaand.soort, titel: bestaand.titel, velden, ...caseNaam(alles, bestaand) },
  });
  return { ok: true };
}

export function verwijderDossieritem(organisatieId: string, id: string): Resultaat {
  const { alles, organisatie } = context(organisatieId);
  const bestaand = organisatie?.dossier?.items.find((i) => i.id === id);
  if (!organisatie || !bestaand) return { ok: false, reden: "Item niet gevonden." };
  const dossier = dossierVanOrg(organisatie);
  dossier.items = dossier.items.filter((i) => i.id !== id);
  const nu = new Date().toISOString();
  if (bestaand.zichtbaarVoorLead) dossier.gewijzigdOp = nu;
  organisatie.gewijzigdOp = nu;
  slaAlles(alles);
  logAudit({
    actie: "dossier.itemVerwijderd",
    entiteitType: "dossieritem",
    entiteitId: id,
    entiteitNaam: bestaand.titel,
    details: { ...organisatieContext(organisatie), soort: bestaand.soort, titel: bestaand.titel, ...caseNaam(alles, bestaand) },
  });
  return { ok: true };
}

/** "Open voor Lead" aan- of uitzetten (`dossier.md`, Scherm 1). Aanzetten zet `openSinds` op nu. */
export function zetDossierOpen(organisatieId: string, open: boolean): Resultaat {
  const { alles, organisatie } = context(organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };
  const dossier = dossierVanOrg(organisatie);
  if (dossier.openVoorLead === open) return { ok: true };
  const nu = new Date().toISOString();
  dossier.openVoorLead = open;
  if (open) {
    dossier.openSinds = nu;
    dossier.gewijzigdOp = nu;
  }
  organisatie.gewijzigdOp = nu;
  const aantal = aantalZichtbaarVoorLead(organisatie, alles);
  slaAlles(alles);
  logAudit({
    actie: open ? "dossier.geopend" : "dossier.gesloten",
    entiteitType: "organisatie",
    entiteitId: organisatie.id,
    entiteitNaam: organisatie.naam,
    details: { ...organisatieContext(organisatie), aantalZichtbaar: aantal },
  });
  return { ok: true };
}

/** De Afspraak "Mag als case gebruikt worden" (`dossier.md`, Rechten): Alleen een Admin, in de kaart Afspraken. */
export function zetCaseVlag(organisatieId: string, toegestaan: boolean): void {
  const { alles, organisatie } = context(organisatieId);
  if (!organisatie || (organisatie.caseToegestaan === true) === toegestaan) return;
  const nu = new Date().toISOString();
  organisatie.caseToegestaan = toegestaan;
  organisatie.gewijzigdOp = nu;
  // Cases die hierdoor voor een Lead verschijnen of verdwijnen, tellen als een wijziging in het Dossier (de tag "Nieuw").
  for (const o of alles) {
    if (o.id === organisatieId || !o.dossier) continue;
    if (o.dossier.items.some((i) => i.soort === "case" && i.caseOrganisatieId === organisatieId && i.zichtbaarVoorLead)) o.dossier.gewijzigdOp = nu;
  }
  slaAlles(alles);
  logAudit({
    actie: "organisatie.caseVlagGewijzigd",
    entiteitType: "organisatie",
    entiteitId: organisatie.id,
    entiteitNaam: organisatie.naam,
    details: { ...organisatieContext(organisatie), caseToegestaan: toegestaan },
  });
}

/** Zet `dossierGezienOp` van een Lead op nu: De Lead opende de Dossierpagina. Schrijft niet als er niets verandert. */
export function markeerDossierGezien(organisatieId: string, lidId: string): void {
  const { alles, organisatie } = context(organisatieId);
  const lid = organisatie?.leden.find((l) => l.id === lidId);
  if (!organisatie || !lid) return;
  const dossier = dossierVan(organisatie);
  const laatste = [dossier.gewijzigdOp, dossier.openSinds].filter((x): x is string => !!x).sort().pop();
  if (lid.dossierGezienOp && (!laatste || lid.dossierGezienOp >= laatste)) return;
  lid.dossierGezienOp = new Date().toISOString();
  slaAlles(alles);
}
