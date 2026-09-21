// Gedeeld nav + footer component — hergebruikt op alle schermen, inclusief
// de doorloopflow en het resultatenscherm. Structuur/gedrag 1-op-1
// overgenomen van de bestaande BOKS-app (../index.html .topbar/footer):
// sticky witte balk met logo en oranje onderrand, simpele tekstfooter.

// `extra` (HTML string) rendert rechts in de balk, `badge` zet een klein
// label naast het logo — gebruikt door de beheeromgeving om dezelfde nav te
// hergebruiken met eigen navigatielinks, i.p.v. een losse eigen balk te
// bouwen (zelfde logo, zelfde structuur, overal in de app).
export function renderNav({ extra = "", badge = "" } = {}) {
  return `
    <nav class="nav" id="site-nav">
      <a href="#/" class="nav-logo">
        <img src="assets/coniche-logo.png" alt="Coniche" />
      </a>
      ${badge ? `<span class="nav-badge">${badge}</span>` : ""}
      ${extra ? `<div class="nav-right">${extra}</div>` : ""}
    </nav>
  `;
}

export function renderFooter() {
  return `
    <footer class="footer">
      &copy; ${new Date().getFullYear()} Coniche — Maakt Meer Werkend
      <span aria-hidden="true"> · </span>
      <a href="#/admin" class="footer-admin-link">Beheer</a>
    </footer>
  `;
}

// Geen transparant/scroll-gedrag meer nodig nu de nav altijd wit is
// (zoals de bestaande BOKS-app) — functie blijft als no-op zodat bestaande
// call-sites niet hoeven te wijzigen.
export function bindNavScroll() {}
