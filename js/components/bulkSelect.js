// Herbruikbaar select+verwijderen-patroon — admin-beheerpagina.md:
// "Select + verwijderen wordt een terugkerend patroon, niet uniek voor
// 'Ingevulde scans' ... Eén herbruikbare component, niet drie keer apart
// bouwen." Gebruikt op: Ingevulde scans, Organisaties-lijst, en de
// respondentenlijst binnen een Organisatie-detailpagina.
//
// Markup-contract: rij-checkboxes krijgen class="bulk-select" en
// data-id="<id>", de koprij een checkbox met id="select-all", en
// renderBulkToolbar() staat er ergens boven met matchende ids.

export function renderBulkToolbar({ exportLabel = "Exporteer selectie", deleteLabel = "Verwijderen" } = {}) {
  return `
    <div id="bulk-toolbar" style="display:none;align-items:center;gap:1rem;margin-bottom:1rem;">
      <span id="bulk-count" style="font-size:0.85rem;color:var(--ink-m);font-weight:600;"></span>
      <div class="btn-rij" style="flex:1;max-width:420px;">
        <button type="button" class="btn btn-outline btn-compact" id="bulk-export-btn" disabled aria-disabled="true" title="Binnenkort beschikbaar">${exportLabel}</button>
        <button type="button" class="btn btn-danger btn-compact" id="bulk-delete-btn">&#128465; ${deleteLabel}</button>
      </div>
    </div>
  `;
}

// onDelete ontvangt de array geselecteerde ids; zelf verantwoordelijk voor
// bevestigen (confirm) en het daadwerkelijk verwijderen + opnieuw renderen.
export function wireBulkSelect(container, onDelete) {
  const toolbar = container.querySelector("#bulk-toolbar");
  const countLabel = container.querySelector("#bulk-count");
  const selectAll = container.querySelector("#select-all");
  const checkboxes = Array.from(container.querySelectorAll(".bulk-select"));
  const deleteBtn = container.querySelector("#bulk-delete-btn");
  if (!toolbar || !selectAll) return;

  const selected = new Set();

  function updateToolbar() {
    if (selected.size > 0) {
      toolbar.style.display = "flex";
      countLabel.textContent = `${selected.size} geselecteerd`;
    } else {
      toolbar.style.display = "none";
    }
    selectAll.checked = checkboxes.length > 0 && selected.size === checkboxes.length;
    selectAll.indeterminate = selected.size > 0 && selected.size < checkboxes.length;
  }

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      if (cb.checked) selected.add(cb.dataset.id);
      else selected.delete(cb.dataset.id);
      updateToolbar();
    });
  });

  selectAll.addEventListener("change", () => {
    checkboxes.forEach((cb) => {
      cb.checked = selectAll.checked;
      if (selectAll.checked) selected.add(cb.dataset.id);
      else selected.delete(cb.dataset.id);
    });
    updateToolbar();
  });

  deleteBtn?.addEventListener("click", () => {
    if (selected.size === 0) return;
    onDelete([...selected]);
  });
}
