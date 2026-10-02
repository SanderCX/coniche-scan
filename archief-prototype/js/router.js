import * as kiesAssessment from "./screens/kiesAssessment.js";
import * as assessmentLanding from "./screens/assessmentLanding.js";
import * as preview from "./screens/preview.js";
import * as intake from "./screens/intake.js";
import * as doorloopflow from "./screens/doorloopflow.js";
import * as resultaten from "./screens/resultaten.js";
import * as adminDashboard from "./screens/admin/adminDashboard.js";
import * as adminContent from "./screens/admin/adminContent.js";
import * as adminScans from "./screens/admin/adminScans.js";
import * as adminScanDetail from "./screens/admin/adminScanDetail.js";
import * as adminOrganisaties from "./screens/admin/adminOrganisaties.js";
import * as adminOrganisatieNieuw from "./screens/admin/adminOrganisatieNieuw.js";
import * as adminOrganisatieDetail from "./screens/admin/adminOrganisatieDetail.js";

const routes = [
  { pattern: /^#\/$/, screen: kiesAssessment, params: () => ({}) },
  { pattern: /^#\/assessment\/([^/]+)\/preview$/, screen: preview, params: (m) => ({ assessmentId: m[1] }) },
  { pattern: /^#\/assessment\/([^/]+)\/intake$/, screen: intake, params: (m) => ({ assessmentId: m[1] }) },
  { pattern: /^#\/assessment\/([^/]+)$/, screen: assessmentLanding, params: (m) => ({ assessmentId: m[1] }) },
  {
    pattern: /^#\/scan\/([^/]+)\/bouwblok\/([^/]+)$/,
    screen: doorloopflow,
    params: (m) => ({ respondentId: m[1], bouwblokId: m[2] }),
  },
  { pattern: /^#\/scan\/([^/]+)\/resultaten$/, screen: resultaten, params: (m) => ({ respondentId: m[1] }) },
  { pattern: /^#\/scan\/([^/]+)$/, screen: doorloopflow, params: (m) => ({ respondentId: m[1] }) },
  { pattern: /^#\/admin\/content\/([^/]+)$/, screen: adminContent, params: (m) => ({ assessmentId: m[1] }) },
  { pattern: /^#\/admin\/scans\/([^/]+)$/, screen: adminScanDetail, params: (m) => ({ respondentId: m[1] }) },
  { pattern: /^#\/admin\/scans$/, screen: adminScans, params: () => ({}) },
  { pattern: /^#\/admin\/organisaties\/nieuw$/, screen: adminOrganisatieNieuw, params: () => ({}) },
  {
    pattern: /^#\/admin\/organisaties\/([^/]+)$/,
    screen: adminOrganisatieDetail,
    params: (m) => ({ organisatieId: m[1] }),
  },
  { pattern: /^#\/admin\/organisaties$/, screen: adminOrganisaties, params: () => ({}) },
  { pattern: /^#\/admin$/, screen: adminDashboard, params: () => ({}) },
];

export function start(container) {
  const handle = () => {
    const hash = location.hash || "#/";
    const match = routes.find((r) => r.pattern.test(hash));
    if (!match) {
      location.hash = "#/";
      return;
    }
    const m = hash.match(match.pattern);
    window.scrollTo(0, 0);
    match.screen.render(container, match.params(m));
  };
  window.addEventListener("hashchange", handle);
  handle();
}
