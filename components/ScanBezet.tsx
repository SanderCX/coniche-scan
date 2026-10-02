"use client";

import { PageWithChrome } from "@/components/PageWithChrome";

/**
 * Getoond in plaats van de intake of de vragenlijst als een andere
 * respondent de scan op dit moment al bewerkt (`lib/scan-slot.ts`). De
 * pagina probeert zelf elke paar seconden opnieuw, via de hartslag van
 * `useScanSlot`: Zodra de ander klaar is, verschijnt de vragenlijst.
 */
export function ScanBezet({ toegangscode, onOpnieuw }: { toegangscode: string; onOpnieuw: () => void }) {
  return (
    <PageWithChrome logoHref={`/s/${toegangscode}`} code={toegangscode} toonTerug>
      <div className="container section" style={{ maxWidth: "36rem", textAlign: "center" }}>
        <span className="eyebrow">Scan in gebruik</span>
        <h1>Deze scan wordt op dit moment al bewerkt</h1>
        <p>
          De vragenlijst wordt nu door een andere respondent bewerkt en beantwoord. Er kan maar één persoon
          tegelijk invullen, zodat jullie elkaars antwoorden niet overschrijven. Probeer het later opnieuw.
          Deze pagina controleert dat ook zelf: Zodra de ander klaar is, kun jij verder.
        </p>
        <button type="button" className="btn btn-or" onClick={onOpnieuw} style={{ marginTop: "1.5rem" }}>
          Opnieuw proberen
        </button>
      </div>
    </PageWithChrome>
  );
}
