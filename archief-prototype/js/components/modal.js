import { escapeHtml } from "../util.js";

// Overlay/modal met de langere `toelichting`-tekst van een bouwblok
// (v1-aanpassingen punt 3).
export function openToelichtingModal(titel, tekst) {
  closeModal();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "toelichting-modal";
  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-titel">
      <button class="modal-close" aria-label="Sluiten" data-close>&times;</button>
      <h3 id="modal-titel">${escapeHtml(titel)}</h3>
      <p>${escapeHtml(tekst)}</p>
    </div>
  `;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", onEscape);
  document.body.appendChild(overlay);
}

function onEscape(e) {
  if (e.key === "Escape") closeModal();
}

export function closeModal() {
  const existing = document.getElementById("toelichting-modal");
  if (existing) existing.remove();
  document.removeEventListener("keydown", onEscape);
}
