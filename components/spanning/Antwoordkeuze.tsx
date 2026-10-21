"use client";

import { useRef } from "react";
import { Assessment, Bouwblok } from "@/lib/types";
import { KAN_IK_NIET_BEOORDELEN, KAN_IK_NIET_TEKST, Niveau, niveauNaam } from "@/lib/spanning";

/**
 * De antwoordkeuze van een vraag van de Spanningsmeter (`visualisatie-spanningsmeter.md`, Doorloopflow, Antwoordkeuze): Vijf ronde
 * knoppen met het cijfer 1 tot en met 5 en de niveaunaam eronder, een scheidingslijn en daarachter de pilknop "0 · Kan ik niet
 * beoordelen". Gekozen is massief oranje. Onder de keuze staat de gekozen score met het ijkpunt van het veld. Een keuzegroep met
 * `aria-pressed`: Tab komt op de gekozen knop (of de eerste), pijltoetsen lopen door de zes keuzes.
 */
export function Antwoordkeuze({
  assessment,
  veld,
  vraagId,
  waarde,
  onKies,
}: {
  assessment: Assessment;
  veld: Bouwblok;
  vraagId: string;
  waarde: number | undefined;
  onKies: (waarde: number) => void;
}) {
  const groepRef = useRef<HTMLDivElement>(null);
  const keuzes = [1, 2, 3, 4, 5, KAN_IK_NIET_BEOORDELEN];
  // Roving tabindex: De gekozen knop, anders de eerste, is de ene stop van de groep.
  const tabStop = waarde !== undefined && keuzes.includes(waarde) ? waarde : 1;

  function onKeyDown(e: React.KeyboardEvent) {
    const volgorde = [1, 2, 3, 4, 5, 0];
    const huidig = volgorde.indexOf(Number((document.activeElement as HTMLElement | null)?.dataset.waarde));
    if (huidig === -1) return;
    let nieuw = huidig;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nieuw = Math.min(volgorde.length - 1, huidig + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") nieuw = Math.max(0, huidig - 1);
    else return;
    e.preventDefault();
    groepRef.current?.querySelector<HTMLElement>(`[data-waarde="${volgorde[nieuw]}"]`)?.focus();
  }

  const ijkpunt = waarde !== undefined && waarde >= 1 && waarde <= 5 ? veld.ijkpunten?.[waarde - 1] : null;

  return (
    <div>
      <div className="sp-keuze" role="group" aria-label="Kies een score van 1 tot 5, of 0 als je de vraag niet kunt beoordelen" ref={groepRef} onKeyDown={onKeyDown}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="sp-score"
            data-waarde={n}
            aria-pressed={waarde === n}
            tabIndex={tabStop === n ? 0 : -1}
            onClick={() => onKies(n)}
            id={`${vraagId}-${n}`}
          >
            <span className="sp-score-rond">{n}</span>
            <span className="sp-score-naam">{niveauNaam(assessment, n as Niveau)}</span>
          </button>
        ))}
        <span className="sp-keuze-lijn" aria-hidden="true" />
        <button
          type="button"
          className="pil sp-nul"
          data-waarde={KAN_IK_NIET_BEOORDELEN}
          aria-pressed={waarde === KAN_IK_NIET_BEOORDELEN}
          tabIndex={tabStop === KAN_IK_NIET_BEOORDELEN ? 0 : -1}
          onClick={() => onKies(KAN_IK_NIET_BEOORDELEN)}
        >
          0 · {KAN_IK_NIET_TEKST}
        </button>
      </div>
      {waarde !== undefined && (
        <p className="sp-gekozen" aria-live="polite">
          {waarde === KAN_IK_NIET_BEOORDELEN ? (
            <>
              <strong>0 · {KAN_IK_NIET_TEKST}:</strong> Deze vraag telt niet mee.
            </>
          ) : (
            <>
              <strong>
                {waarde} · {niveauNaam(assessment, waarde as Niveau)}:
              </strong>{" "}
              {ijkpunt}
            </>
          )}
        </p>
      )}
    </div>
  );
}
