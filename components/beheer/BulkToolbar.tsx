import { DropdownKnop } from "@/components/DropdownKnop";
import { InfoIcoon } from "@/components/InfoIcoon";

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: "0.8rem", height: "0.8rem" }}
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
 * Verschijnt zodra er iets geselecteerd is (beheerpagina.md punt 6 +
 * "Verwijderen — cascade-regels"). Gelijke knopbreedte in de rij, compacte
 * knopmaat — zie stylesheet.md "Compacte knopmaat voor actiebalken".
 */
export function BulkToolbar({
  aantal,
  onVerwijderen,
  verwijderLabel = "Verwijderen",
  verwijderenDisabledReden,
  onExporteren,
  exporterenDisabledReden,
  onExporterenPdf,
  onExporterenIndesign,
  exportBezig,
  onNaarAndereMeting,
}: {
  aantal: number;
  onVerwijderen: () => void;
  verwijderLabel?: string;
  /** Reden waarom Verwijderen nu uitgeschakeld is (bijv. ontbrekend recht, `lib/rechten.ts`). */
  verwijderenDisabledReden?: string;
  /** CSV-export, beschikbaar bij elke selectiegrootte. Weglaten houdt de knop uitgeschakeld. */
  onExporteren?: () => void;
  /** Reden waarom Exporteren nu uitgeschakeld is, ook al is `onExporteren` gegeven (bijv. een selectie over meerdere organisaties). */
  exporterenDisabledReden?: string;
  /**
   * PDF/InDesign, "beschikbaar bij precies één scan" (export-pdf-visual-
   * volwassenheidsscan.md / export-indesign.md) — de aanroeper geeft deze
   * twee dus alleen door als `aantal === 1`, hier alleen het tonen/
   * uitschakelen van de bijbehorende menu-opties.
   */
  onExporterenPdf?: () => void;
  onExporterenIndesign?: () => void;
  /** PDF wordt asynchroon gegenereerd (serverroute); schakelt de PDF-optie tijdelijk uit. */
  exportBezig?: boolean;
  /**
   * "Naar andere Meting" (beheerpagina.md punt 7): alleen in een lijst die
   * binnen één organisatie blijft, omdat de doel-Meting bij dezelfde
   * organisatie hoort. Weglaten verbergt de knop.
   */
  onNaarAndereMeting?: () => void;
}) {
  if (aantal === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--r)] border border-border bg-bg-warm px-4 py-3">
      <span className="text-sm font-semibold text-ink">{aantal} geselecteerd</span>
      <div className="btn-rij" style={{ maxWidth: onNaarAndereMeting ? "36rem" : "22rem" }}>
        {onNaarAndereMeting && (
          <button type="button" onClick={onNaarAndereMeting} className="btn btn-outline btn-compact">
            Naar andere Meting
          </button>
        )}
        <DropdownKnop
          label={exportBezig ? "Bezig…" : "Exporteren"}
          className="btn btn-outline btn-compact"
          disabled={Boolean(exporterenDisabledReden)}
          opties={[
            {
              label: "Als PDF",
              onClick: onExporterenPdf,
              disabled: !onExporterenPdf || Boolean(exportBezig),
              title: exportBezig ? "PDF wordt gemaakt…" : undefined,
              infoSleutel: !onExporterenPdf ? "info.exportEenScan" : undefined,
            },
            {
              label: "Als CSV",
              onClick: onExporteren,
              disabled: !onExporteren || Boolean(exporterenDisabledReden),
              title: !onExporteren ? "Binnenkort beschikbaar" : undefined,
            },
            {
              label: "Voor InDesign (XML)",
              onClick: onExporterenIndesign,
              disabled: !onExporterenIndesign,
              infoSleutel: !onExporterenIndesign ? "info.exportEenScan" : undefined,
            },
          ]}
        />
        {exporterenDisabledReden && <InfoIcoon naastVeld sleutel="info.bulkExportOrganisatie" />}
        <button
          type="button"
          disabled={Boolean(verwijderenDisabledReden)}
          title={verwijderenDisabledReden}
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
