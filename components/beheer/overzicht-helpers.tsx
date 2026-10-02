import { OrganisatieLid, ScanInvulling } from "@/lib/types";

export const STATUS_LABEL: Record<ScanInvulling["status"], string> = {
  uitgenodigd: "Uitgenodigd",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

/** Rol / team: toont alleen wat er is, nooit een los streepje of puntje (beheerpagina.md, punt 7). */
export function rolTeamTekst(lid: Pick<OrganisatieLid, "functie" | "team">): string {
  return [lid.functie, lid.team].filter(Boolean).join(" / ");
}

export function datumTekst(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("nl-NL") : "";
}

/**
 * Status van een Respondent over al zijn scans: de status van die ene scan,
 * "x van y afgerond" bij meerdere (beheerpagina.md, punt 6b), of "Geen scans".
 */
export function RespondentStatusBadge({ invullingen }: { invullingen: ScanInvulling[] }) {
  if (invullingen.length === 0) return <span className="admin-badge status-uitgenodigd">Geen scans</span>;
  if (invullingen.length === 1) {
    const status = invullingen[0].status;
    return <span className={`admin-badge status-${status}`}>{STATUS_LABEL[status]}</span>;
  }
  const afgerond = invullingen.filter((i) => i.status === "afgerond").length;
  const klasse = afgerond === invullingen.length ? "afgerond" : afgerond > 0 ? "bezig" : "uitgenodigd";
  return (
    <span className={`admin-badge status-${klasse}`}>
      {afgerond} van {invullingen.length} afgerond
    </span>
  );
}
