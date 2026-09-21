// localStorage-laag — CLAUDE.md: "voor vandaag localStorage + hardcoded content".
const ORG_KEY = "coniche-scan:organisaties";
const RESP_KEY = "coniche-scan:respondenten";

function readAll(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function writeAll(key, all) {
  localStorage.setItem(key, JSON.stringify(all));
}

function newId() {
  return (crypto.randomUUID && crypto.randomUUID()) || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Demo-organisatiekenmerken die een organisatieveldenlijst plausibel invullen.
// In v1 bestaat er nog geen beheerscherm dat dit doet, dus er is per
// assessment-type één vaste demo-organisatie die lazy wordt aangemaakt.
function demoKenmerken() {
  return {
    "totaal-klanten": 128000,
    "verdeling-b2b-b2c": { B2B: 35, B2C: 65 },
    "kanaal-call": 210000,
    "kanaal-voicebot": 40000,
    "kanaal-livechat": 65000,
    "kanaal-chatbot": 30000,
    "kanaal-email": 90000,
    "kanaal-whatsapp": 25000,
    "adoptie-mijnomgeving": 58,
    "digitalisering-2026": 42,
    "digitalisering-ambitie-2030": 70,
    "fte-klantcontact": 180,
    "fte-klantcontact-verdeling": { Inhouse: 70, BPO: 30 },
    "fte-management-support": 22,
    "fte-it-devops": 14,
    "fte-it-devops-digital": 45,
    "kpi-aht": 320,
    "kpi-nps": 24,
    "kpi-csat": 82,
    "kpi-sla": 88,
    "kpi-ftr": 76,
  };
}

// Echte, door de admin aangemaakte organisaties (admin-beheerpagina.md
// sectie 4) — los van de auto-aangemaakte demo-organisatie die de publieke
// intake-flow gebruikt (die blijft ongemoeid, geen koppeling met de nog
// niet gebouwde uitnodigings-/verificatieflow uit v1-aanpassingen.md).
export function createOrganisatie({ assessmentId, naam, kenmerken }) {
  const all = readAll(ORG_KEY);
  const id = newId();
  all[id] = {
    id,
    assessmentId,
    naam,
    kenmerken: kenmerken || {},
    respondenten: [],
  };
  writeAll(ORG_KEY, all);
  return all[id];
}

export function getAllOrganisaties() {
  return Object.values(readAll(ORG_KEY)).filter((o) => !o.id.startsWith("demo-org-"));
}

export function getOrganisatie(id) {
  const all = readAll(ORG_KEY);
  return all[id] || null;
}

export function updateOrganisatieKenmerken(id, kenmerken) {
  const all = readAll(ORG_KEY);
  const org = all[id];
  if (!org) return null;
  org.kenmerken = kenmerken;
  writeAll(ORG_KEY, all);
  return org;
}

// Cascade: verwijdert de organisatie + alle respondenten daarbinnen
// (antwoorden, opmerkingen, status) — admin-beheerpagina.md, "Verwijderen —
// cascade-regels". Raakt het Assessment-type niet, dat is generiek en
// blijft bestaan voor andere organisaties.
export function deleteOrganisaties(ids) {
  const orgAll = readAll(ORG_KEY);
  const respondenten = readAll(RESP_KEY);
  ids.forEach((id) => {
    const org = orgAll[id];
    if (!org) return;
    (org.respondenten || []).forEach((rid) => delete respondenten[rid]);
    delete orgAll[id];
  });
  writeAll(ORG_KEY, orgAll);
  writeAll(RESP_KEY, respondenten);
}

// Respondent uitnodigen vanuit de Organisatie-detailpagina: alleen e-mail
// nodig, status "uitgenodigd" — geen verstuurmechanisme (backlog.md), dus
// dit legt alleen het record vast.
export function addRespondentToOrganisatie(organisatieId, email) {
  const orgAll = readAll(ORG_KEY);
  const organisatie = orgAll[organisatieId];
  if (!organisatie) return null;

  const respondenten = readAll(RESP_KEY);
  const id = newId();
  const respondent = {
    id,
    organisatieId,
    assessmentId: organisatie.assessmentId,
    email,
    naam: "",
    rol: "",
    team: "",
    notities: "",
    antwoorden: {},
    opmerkingenPerBouwblok: {},
    status: "uitgenodigd",
    gestartOp: new Date().toISOString(),
    afgerondOp: null,
  };
  respondenten[id] = respondent;
  writeAll(RESP_KEY, respondenten);

  organisatie.respondenten.push(id);
  writeAll(ORG_KEY, orgAll);

  return respondent;
}

export function getRespondentenVoorOrganisatie(organisatieId) {
  return getAllRespondenten().filter((r) => r.organisatieId === organisatieId);
}

// Zet een uitgenodigde respondent om naar "bezig": vult naam/rol/team/
// notities (scherm 4, Respondent-intake) en markeert het echte startmoment.
// CLAUDE.md sectie 1: dit is het moment waarop naam het e-mail-fallback
// vervangt en status van "uitgenodigd" naar "bezig" springt.
export function completeIntake(respondentId, { naam, rol, team, notities }) {
  const all = readAll(RESP_KEY);
  const respondent = all[respondentId];
  if (!respondent) return null;
  respondent.naam = naam;
  respondent.rol = rol || "";
  respondent.team = team || "";
  respondent.notities = notities || "";
  respondent.status = "bezig";
  respondent.gestartOp = new Date().toISOString();
  writeAll(RESP_KEY, all);
  return respondent;
}

// "Scan-invulling verwijderen" (Ingevulde scans) — wist alleen deze ene
// invulpoging (antwoorden, opmerkingen, status, einddatum). De respondent
// zelf (naam, e-mail, uitnodiging) blijft bestaan, in tegenstelling tot
// deleteRespondenten hieronder ("respondent verwijderen"). Zie
// admin-beheerpagina.md, "Verwijderen — cascade-regels": dit zijn bewust
// twee aparte acties, ook al komt het vandaag (1 invulling per respondent)
// bijna op hetzelfde neer.
export function resetRespondentInvulling(ids) {
  const all = readAll(RESP_KEY);
  ids.forEach((id) => {
    const respondent = all[id];
    if (!respondent) return;
    respondent.antwoorden = {};
    respondent.opmerkingenPerBouwblok = {};
    respondent.status = "uitgenodigd";
    respondent.afgerondOp = null;
  });
  writeAll(RESP_KEY, all);
}

// "Respondent verwijderen" (Organisatie-detail → Respondenten) — gooit de
// hele respondent weg, cascade naar al diens scan-invulling(en).
export function deleteRespondenten(ids) {
  const respondenten = readAll(RESP_KEY);
  const orgAll = readAll(ORG_KEY);
  ids.forEach((id) => {
    const respondent = respondenten[id];
    if (!respondent) return;
    delete respondenten[id];
    const org = orgAll[respondent.organisatieId];
    if (org) org.respondenten = org.respondenten.filter((rid) => rid !== id);
  });
  writeAll(RESP_KEY, respondenten);
  writeAll(ORG_KEY, orgAll);
}

export function getOrCreateDemoOrganisatie(assessmentId) {
  const all = readAll(ORG_KEY);
  const orgId = `demo-org-${assessmentId}`;
  if (!all[orgId]) {
    all[orgId] = {
      id: orgId,
      assessmentId,
      naam: "Demo-organisatie",
      kenmerken: demoKenmerken(),
      respondenten: [],
    };
    writeAll(ORG_KEY, all);
  }
  return all[orgId];
}

export function createRespondent({ assessmentId, naam, rol, team, notities }) {
  const organisatie = getOrCreateDemoOrganisatie(assessmentId);
  const respondenten = readAll(RESP_KEY);
  const id = newId();
  const respondent = {
    id,
    organisatieId: organisatie.id,
    assessmentId,
    email: "",
    naam,
    rol: rol || "",
    team: team || "",
    notities: notities || "",
    antwoorden: {},
    opmerkingenPerBouwblok: {},
    status: "bezig",
    gestartOp: new Date().toISOString(),
    afgerondOp: null,
  };
  respondenten[id] = respondent;
  writeAll(RESP_KEY, respondenten);

  const orgAll = readAll(ORG_KEY);
  orgAll[organisatie.id].respondenten.push(id);
  writeAll(ORG_KEY, orgAll);

  return respondent;
}

export function getRespondent(id) {
  const all = readAll(RESP_KEY);
  return all[id] || null;
}

// Alle respondenten, over alle organisaties/assessments heen — voor het
// beheerscherm ("ingevulde scans inzien").
export function getAllRespondenten() {
  return Object.values(readAll(RESP_KEY)).sort(
    (a, b) => new Date(b.gestartOp) - new Date(a.gestartOp)
  );
}

export function saveAntwoord(respondentId, vraagId, waarde) {
  const all = readAll(RESP_KEY);
  const respondent = all[respondentId];
  if (!respondent) return null;
  respondent.antwoorden[vraagId] = waarde;
  writeAll(RESP_KEY, all);
  return respondent;
}

export function saveOpmerking(respondentId, bouwblokId, tekst) {
  const all = readAll(RESP_KEY);
  const respondent = all[respondentId];
  if (!respondent) return null;
  respondent.opmerkingenPerBouwblok[bouwblokId] = tekst;
  writeAll(RESP_KEY, all);
  return respondent;
}

export function markAfgerond(respondentId) {
  const all = readAll(RESP_KEY);
  const respondent = all[respondentId];
  if (!respondent) return null;
  respondent.status = "afgerond";
  respondent.afgerondOp = new Date().toISOString();
  writeAll(RESP_KEY, all);
  return respondent;
}
