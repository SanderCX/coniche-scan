"use client";

import { useState } from "react";
import { Assessment } from "@/lib/types";
import { useOrganisaties } from "@/lib/db";
import { alleBouwblokkenMetGroep } from "@/lib/assessment-structuur";
import { aantalScansMetAntwoordInBouwblok, pasGewichtenToe } from "@/lib/assessment-bewerken";
import { formatGewicht, parseGewicht } from "@/lib/format";
import { BevestigModal } from "@/components/beheer/BevestigModal";

/**
 * "Weging per bouwblok" (`beheerpagina.md` punt 2). Een gewicht wijzigen werkt
 * terugwerkend door in alle scans van het Assessment, dus opslaan vraagt een
 * bevestiging met bouwblok, oud en nieuw gewicht en het aantal scans dat
 * anders gaat rekenen. Meerdere gewichten tegelijk: één opslagactie, één
 * bevestiging, één logregel per bouwblok.
 */
export function WegingBeheer({ assessment }: { assessment: Assessment }) {
  const organisaties = useOrganisaties();
  const bouwblokken = alleBouwblokkenMetGroep(assessment).filter((b) => !b.bouwblok.gearchiveerd);
  const [concept, setConcept] = useState<Record<string, string>>({});
  const [bevestigen, setBevestigen] = useState(false);

  const veldWaarde = (id: string, huidig: number) => concept[id] ?? formatGewicht(huidig);
  const rijen = bouwblokken.map(({ bouwblok }) => {
    const tekst = veldWaarde(bouwblok.id, bouwblok.gewicht);
    const nieuw = parseGewicht(tekst);
    return { bouwblok, tekst, nieuw, ongeldig: nieuw === null };
  });
  const wijzigingen = rijen.filter((r) => r.nieuw !== null && r.nieuw !== r.bouwblok.gewicht);
  const heeftOngeldig = rijen.some((r) => r.ongeldig);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-ink">Weging per bouwblok</h2>
      <div className="space-y-2">
        {rijen.map(({ bouwblok, tekst, ongeldig }) => (
          <div key={bouwblok.id} className="flex items-center gap-3 text-sm">
            <span className="w-8 text-xs font-semibold text-ink-m">#{bouwblok.volgnummer}</span>
            <span className="flex-1 text-ink">{bouwblok.naam}</span>
            {bouwblok.gewicht !== 1 && <span className="gewicht-chip">{formatGewicht(bouwblok.gewicht)}×</span>}
            <input
              inputMode="decimal"
              value={tekst}
              aria-label={`Weging bouwblok ${bouwblok.volgnummer} ${bouwblok.naam}`}
              aria-invalid={ongeldig}
              onChange={(e) => setConcept({ ...concept, [bouwblok.id]: e.target.value })}
              className="w-20 rounded-lg border p-2 text-sm"
              style={{ borderColor: ongeldig ? "var(--stat-red)" : "var(--border-d)" }}
            />
          </div>
        ))}
      </div>
      {heeftOngeldig && (
        <p className="mt-2 text-sm" style={{ color: "var(--stat-red)" }}>
          Een weging is een getal groter dan 0, bijvoorbeeld 1 of 1,5.
        </p>
      )}
      <div className="btn-rij" style={{ marginTop: "1rem" }}>
        <button
          type="button"
          className="btn btn-or btn-compact"
          disabled={wijzigingen.length === 0 || heeftOngeldig}
          onClick={() => setBevestigen(true)}
        >
          Weging opslaan
        </button>
        {wijzigingen.length > 0 && (
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setConcept({})}>
            Annuleren
          </button>
        )}
      </div>

      <BevestigModal
        open={bevestigen}
        titel="Weging wijzigen"
        bericht={
          <div className="space-y-2 text-sm">
            <p>
              Een nieuwe weging werkt terugwerkend door in alle scans van dit Assessment: de categorie- en
              overallscores, de resultatenpagina&apos;s, de Organisatie-resultaten en alle exports.
            </p>
            <ul className="space-y-1">
              {wijzigingen.map(({ bouwblok, nieuw }) => (
                <li key={bouwblok.id}>
                  <strong>
                    #{bouwblok.volgnummer} {bouwblok.naam}
                  </strong>
                  : {formatGewicht(bouwblok.gewicht)} → {formatGewicht(nieuw!)}, werkt door in{" "}
                  {aantalScansMetAntwoordInBouwblok(organisaties, assessment.id, bouwblok)} ingevulde scans
                </li>
              ))}
            </ul>
          </div>
        }
        bevestigLabel="Weging opslaan"
        bevestigVariant="primair"
        onBevestigen={() => {
          pasGewichtenToe(
            assessment.id,
            wijzigingen.map((w) => ({ bouwblokId: w.bouwblok.id, gewicht: w.nieuw! })),
            organisaties
          );
          setConcept({});
          setBevestigen(false);
        }}
        onAnnuleren={() => setBevestigen(false)}
      />
    </section>
  );
}
