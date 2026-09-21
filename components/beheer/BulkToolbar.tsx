/**
 * Verschijnt zodra er iets geselecteerd is (admin-beheerpagina.md punt 6 +
 * "Verwijderen — cascade-regels"). Gelijke knopbreedte in de rij, compacte
 * knopmaat — zie stylesheet.md "Compacte knopmaat voor actiebalken".
 */
export function BulkToolbar({
  aantal,
  onVerwijderen,
  verwijderLabel = "Verwijderen",
}: {
  aantal: number;
  onVerwijderen: () => void;
  verwijderLabel?: string;
}) {
  if (aantal === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--r)] border border-border bg-bg-warm px-4 py-3">
      <span className="text-sm font-semibold text-ink">{aantal} geselecteerd</span>
      <div className="btn-rij" style={{ maxWidth: "22rem" }}>
        <button
          type="button"
          disabled
          title="Binnenkort beschikbaar"
          className="btn btn-outline btn-compact"
        >
          Exporteren
        </button>
        <button type="button" onClick={onVerwijderen} className="btn btn-danger btn-compact">
          🗑 {verwijderLabel}
        </button>
      </div>
    </div>
  );
}
