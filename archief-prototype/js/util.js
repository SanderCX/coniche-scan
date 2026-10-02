export function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

export function formatDecimaal(n) {
  if (typeof n !== "number") return "–";
  return n.toFixed(1).replace(".", ",");
}
