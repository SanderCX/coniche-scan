import { escapeHtml } from "../util.js";

// Recursieve renderer voor de VeldDefinitie-boom (js/data/organisatieVelden.js)
// — admin-beheerpagina.md sectie 4 ("Organisatie aanmaken"/"detail"). Elk
// blad-veld wordt opgeslagen onder zijn volledige pad (dot-joined), zodat
// gelijknamige subvelden binnen verschillende groepen (bijv. "leverancier"
// binnen elke techstack-categorie) niet botsen.
function veldId(path) {
  return `veld-${path.replace(/\./g, "--")}`;
}

export function renderVeldenForm(velden, waarden = {}, path = "") {
  return velden.map((veld) => renderVeld(veld, waarden, path)).join("");
}

function renderVeld(veld, waarden, parentPath) {
  const path = parentPath ? `${parentPath}.${veld.id}` : veld.id;

  if (veld.type === "groep") {
    return `
      <fieldset class="veld-groep">
        <legend>${escapeHtml(veld.label)}</legend>
        ${renderVeldenForm(veld.subvelden, waarden, path)}
      </fieldset>
    `;
  }

  const id = veldId(path);
  const waarde = waarden[path];

  if (veld.type === "select") {
    return `
      <div class="admin-field">
        <label for="${id}">${escapeHtml(veld.label)}</label>
        <select id="${id}">
          <option value="">—</option>
          ${veld.opties
            .map((o) => `<option value="${escapeHtml(o)}" ${waarde === o ? "selected" : ""}>${escapeHtml(o)}</option>`)
            .join("")}
        </select>
      </div>
    `;
  }

  if (veld.type === "select-met-verdeling") {
    return `
      <div class="admin-field">
        <label>${escapeHtml(veld.label)}</label>
        <div class="veld-verdeling">
          ${veld.opties
            .map(
              (o) => `
            <div class="veld-verdeling-item">
              <span>${escapeHtml(o)}</span>
              <input type="number" id="${id}__${escapeHtml(o)}" min="0" max="100" value="${
                waarde && waarde[o] != null ? waarde[o] : ""
              }" />
              <span>%</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  if (veld.type === "percentage" || veld.type === "getal") {
    return `
      <div class="admin-field">
        <label for="${id}">${escapeHtml(veld.label)}</label>
        <input type="number" id="${id}" ${veld.type === "percentage" ? 'min="0" max="100"' : ""} value="${
          waarde != null ? waarde : ""
        }" />
      </div>
    `;
  }

  // "tekst" (default)
  return `
    <div class="admin-field">
      <label for="${id}">${escapeHtml(veld.label)}</label>
      <input type="text" id="${id}" value="${waarde != null ? escapeHtml(String(waarde)) : ""}" />
    </div>
  `;
}

// Leest de huidige waarden uit de DOM terug in een plat { pad: waarde }-object
// — spiegelt renderVeldenForm 1-op-1 zodat render/lezen niet uit de pas
// kunnen lopen.
export function leesVeldenForm(velden, path = "") {
  let result = {};
  for (const veld of velden) {
    const fullPath = path ? `${path}.${veld.id}` : veld.id;

    if (veld.type === "groep") {
      Object.assign(result, leesVeldenForm(veld.subvelden, fullPath));
      continue;
    }

    const id = veldId(fullPath);

    if (veld.type === "select-met-verdeling") {
      const obj = {};
      veld.opties.forEach((o) => {
        const el = document.getElementById(`${id}__${o}`);
        if (el && el.value !== "") obj[o] = Number(el.value);
      });
      if (Object.keys(obj).length) result[fullPath] = obj;
      continue;
    }

    const el = document.getElementById(id);
    if (!el || el.value === "") continue;
    result[fullPath] = veld.type === "getal" || veld.type === "percentage" ? Number(el.value) : el.value;
  }
  return result;
}
