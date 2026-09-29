function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: "1rem", height: "1rem" }}
    >
      <path d="M4 7h16" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

/**
 * Verschijnt zodra er iets geselecteerd is (admin-beheerpagina.md punt 6 +
 * "Verwijderen — cascade-regels"). Gelijke knopbreedte in de rij, compacte
 * knopmaat — zie stylesheet.md "Compacte knopmaat voor actiebalken".
 */
export function BulkToolbar({
  aantal,
  onVerwijderen,
  verwijderLabel = "Verwijderen",
  onExporteren,
  exporterenDisabledReden,
}: {
  aantal: number;
  onVerwijderen: () => void;
  verwijderLabel?: string;
  /** Weglaten houdt de knop uitgeschakeld ("Binnenkort beschikbaar") — zie stylesheet.md, Knoppen, Disabled. */
  onExporteren?: () => void;
  /** Reden waarom Exporteren nu uitgeschakeld is, ook al is `onExporteren` gegeven (bijv. een selectie over meerdere organisaties). */
  exporterenDisabledReden?: string;
}) {
  if (aantal === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--r)] border border-border bg-bg-warm px-4 py-3">
      <span className="text-sm font-semibold text-ink">{aantal} geselecteerd</span>
      <div className="btn-rij" style={{ maxWidth: "22rem" }}>
        <button
          type="button"
          disabled={!onExporteren || Boolean(exporterenDisabledReden)}
          title={
            !onExporteren ? "Binnenkort beschikbaar" : (exporterenDisabledReden ?? undefined)
          }
          onClick={onExporteren}
          className="btn btn-outline btn-compact"
        >
          Exporteren
        </button>
        <button
          type="button"
          onClick={onVerwijderen}
          className="btn btn-danger btn-compact flex items-center justify-center gap-2"
        >
          <TrashIcon />
          {verwijderLabel}
        </button>
      </div>
    </div>
  );
}
