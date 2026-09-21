// Bewerkbare content-laag boven de hardcoded Assessment-data (CLAUDE.md:
// "de JSON-structuur moet er wel al staan, het scherm erboven niet" — dit IS
// dat scherm, voor tekstvelden. Structurele wijzigingen (bouwblok/vraag
// toevoegen of verwijderen, organisatievelden, scans aanmaken) zijn bewust
// nog niet beheerbaar — "complexere zaken doen we later".
import { assessments } from "./data/assessments.js";

const KEY = "coniche-scan:content-overrides";

function readOverrides() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function writeOverrides(all) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

function applyBouwblokOverride(bouwblok, override) {
  if (!override) return bouwblok;
  if (override.naam != null) bouwblok.naam = override.naam;
  if (override.omschrijving != null) bouwblok.omschrijving = override.omschrijving;
  if (override.toelichting != null) bouwblok.toelichting = override.toelichting;
  if (override.tags != null) bouwblok.tags = override.tags;
  if (override.vragen) {
    bouwblok.vragen = bouwblok.vragen.map((v) =>
      override.vragen[v.id] != null ? { ...v, tekst: override.vragen[v.id] } : v
    );
  }
  return bouwblok;
}

// Geeft een Assessment terug met alle opgeslagen wijzigingen toegepast —
// alle schermen (publiek + admin) lezen via deze functie, nooit rechtstreeks
// de statische data, zodat een wijziging overal meteen zichtbaar is.
export function getEffectiveAssessment(assessmentId) {
  const base = assessments.find((a) => a.id === assessmentId);
  if (!base) return null;
  const result = JSON.parse(JSON.stringify(base));
  const overrides = readOverrides()[assessmentId];
  if (!overrides) return result;

  Object.assign(result, overrides.meta || {});
  const bbOverrides = overrides.bouwblokken || {};
  if (result.categorieen) {
    result.categorieen.forEach((c) =>
      c.bouwblokken.forEach((b) => applyBouwblokOverride(b, bbOverrides[b.id]))
    );
  }
  if (result.bouwblokken) {
    result.bouwblokken.forEach((b) => applyBouwblokOverride(b, bbOverrides[b.id]));
  }
  return result;
}

export function getAllEffectiveAssessments() {
  return assessments.map((a) => getEffectiveAssessment(a.id));
}

export function updateAssessmentMeta(assessmentId, patch) {
  const all = readOverrides();
  all[assessmentId] = all[assessmentId] || {};
  all[assessmentId].meta = { ...(all[assessmentId].meta || {}), ...patch };
  writeOverrides(all);
}

export function updateBouwblok(assessmentId, bouwblokId, patch) {
  const all = readOverrides();
  all[assessmentId] = all[assessmentId] || {};
  all[assessmentId].bouwblokken = all[assessmentId].bouwblokken || {};
  const existing = all[assessmentId].bouwblokken[bouwblokId] || {};
  all[assessmentId].bouwblokken[bouwblokId] = { ...existing, ...patch };
  writeOverrides(all);
}

export function updateVraagTekst(assessmentId, bouwblokId, vraagId, tekst) {
  const all = readOverrides();
  all[assessmentId] = all[assessmentId] || {};
  all[assessmentId].bouwblokken = all[assessmentId].bouwblokken || {};
  const bb = all[assessmentId].bouwblokken[bouwblokId] || {};
  bb.vragen = { ...(bb.vragen || {}), [vraagId]: tekst };
  all[assessmentId].bouwblokken[bouwblokId] = bb;
  writeOverrides(all);
}

export function heeftOverrides(assessmentId) {
  return Boolean(readOverrides()[assessmentId]);
}

export function resetOverrides(assessmentId) {
  const all = readOverrides();
  delete all[assessmentId];
  writeOverrides(all);
}
