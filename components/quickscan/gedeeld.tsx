import { Classificatie } from "@/lib/types";
import { KLASSE_NAAM } from "@/lib/quickscan";

/**
 * De stijlwaarden van de Quickscan-visualisaties (`visualisatie-quickscan.md`, Nieuwe stijlwaarden): De drie klassekleuren, niet de
 * vijf scorekleuren. `cel` is de vulling van een matrixcel.
 */
export const KLASSE_STIJL: Record<Classificatie, { kleur: string; vulling: string; tekst: string; rand: string; cel: string }> = {
  groen: { kleur: "var(--stat-green)", vulling: "#e7f6ef", tekst: "#0e4d30", rand: "#c3e6d2", cel: "#c3e6d2" },
  oranje: { kleur: "var(--stat-amber)", vulling: "#fdf2e3", tekst: "#6b3a00", rand: "#f2cf9b", cel: "#fde9c8" },
  rood: { kleur: "var(--stat-red)", vulling: "#fdecec", tekst: "#7f1d1d", rand: "#f7c6c1", cel: "#f7c6c1" },
};

/** De kleuren van een antwoord (`visualisatie-quickscan.md`, Gedeelde regels): Weet ik niet staat nooit in de kleur van Nee. */
export const ANTWOORD_KLEUR = { ja: "var(--stat-green)", nee: "var(--stat-red)", weetNiet: "#d4d1ca" } as const;

/** "Goed op orde" voor een afdeling of dimensie, "Sterk ontwikkeld" voor een totaal. */
export function klasseNaam(klasse: Classificatie, totaal = false): string {
  return (totaal ? KLASSE_NAAM.totaal : KLASSE_NAAM.afdeling)[klasse];
}

export function KlasseBadge({ klasse, totaal = false }: { klasse: Classificatie | null; totaal?: boolean }) {
  if (!klasse) return null;
  const s = KLASSE_STIJL[klasse];
  return (
    <span className="qv-klasse" style={{ background: s.vulling, color: s.tekst, borderColor: s.rand }}>
      {klasseNaam(klasse, totaal)}
    </span>
  );
}

/** De namen van de drie banden boven een balk van 0 tot 100%, in dezelfde kolomindeling als de rijen (`.qv-rij`). */
export function Bandnamen({ rechts }: { rechts?: string }) {
  return (
    <div className="qv-bandnamen" aria-hidden="true">
      <div />
      <div>
        <span style={{ width: "50%" }}>Ontwikkelruimte</span>
        <span style={{ width: "30%" }}>Gemiddeld inzicht</span>
        <span style={{ width: "20%" }}>Goed op orde</span>
      </div>
      <div style={{ justifyContent: "flex-end" }}>{rechts ?? ""}</div>
    </div>
  );
}

/** Hulplijnen op 50% en 80% in een balk. */
export function Hulplijnen() {
  return (
    <>
      <span className="qv-spoor-hulp" style={{ left: "50%" }} />
      <span className="qv-spoor-hulp" style={{ left: "80%" }} />
    </>
  );
}

/** Een getal met komma en één decimaal als het geen geheel getal is. */
export function getal(n: number): string {
  return String(Number(n.toFixed(1))).replace(".", ",");
}
