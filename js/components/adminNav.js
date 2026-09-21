// Beheer hergebruikt dezelfde nav/footer als de rest van de app (zelfde
// logo, zelfde witte balk) — alleen de rechterlinks en een "Beheer"-badge
// zijn eigen aan deze omgeving. Geen losse donkere balk meer.
import { renderNav, renderFooter } from "./navFooter.js";

export function renderAdminNav(actief) {
  const links = [
    { href: "#/admin", label: "Overzicht", key: "dashboard" },
    { href: "#/admin/organisaties", label: "Organisaties", key: "organisaties" },
    { href: "#/admin/scans", label: "Ingevulde scans", key: "scans" },
  ];
  const extra =
    links
      .map((l) => `<a href="${l.href}" class="${l.key === actief ? "actief" : ""}">${l.label}</a>`)
      .join("") + `<a href="#/" class="admin-nav-terug">&larr; Terug naar site</a>`;

  return renderNav({ extra, badge: "Beheer" });
}

export { renderFooter as renderAdminFooter };
