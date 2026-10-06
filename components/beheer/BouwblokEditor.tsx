"use client";

import { useState } from "react";
import { Bouwblok } from "@/lib/types";
import { formatGewicht } from "@/lib/format";
import { InfoIcoon } from "@/components/InfoIcoon";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { patchBouwblok, removeBouwblok, addVraag, patchVraag, removeVraag, herstelVraag } from "@/lib/assessment-bewerken";

export function BouwblokEditor({
  assessmentId,
  categorieId,
  bouwblok,
}: {
  assessmentId: string;
  categorieId: string | null;
  bouwblok: Bouwblok;
}) {
  // Geen `window.confirm()`: Dat wordt in sommige browseromgevingen stil
  // onderdrukt, waardoor de knop niets lijkt te doen (BevestigModal.tsx).
  const [archiveren, setArchiveren] = useState<{ soort: "bouwblok" } | { soort: "vraag"; vraagId: string } | null>(null);

  return (
    <>
    <details className="rounded-lg border border-gray-100 p-3">
      <summary className="flex cursor-pointer flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-ink-m">#{bouwblok.volgnummer}</span>
        <input
          value={bouwblok.naam}
          onChange={(e) =>
            patchBouwblok(assessmentId, categorieId, bouwblok.id, { naam: e.target.value })
          }
          onClick={(e) => e.stopPropagation()}
          className="flex-1 rounded-lg border border-gray-200 p-1.5 text-sm font-medium"
        />
        {bouwblok.gewicht !== 1 && <span className="gewicht-chip">{formatGewicht(bouwblok.gewicht)}×</span>}
        <span className="text-xs text-ink-m">
          {bouwblok.vragen.filter((v) => !v.gearchiveerd).length} vragen
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setArchiveren({ soort: "bouwblok" });
          }}
          className="btn btn-outline btn-compact"
        >
          Archiveren
        </button>
      </summary>

      <div className="mt-3 space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-ink">Omschrijving</span>
          <textarea
            value={bouwblok.omschrijving}
            onChange={(e) =>
              patchBouwblok(assessmentId, categorieId, bouwblok.id, {
                omschrijving: e.target.value,
              })
            }
            rows={2}
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink">Centrale vraag</span>
          <textarea
            value={bouwblok.centraleVraag ?? ""}
            onChange={(e) =>
              patchBouwblok(assessmentId, categorieId, bouwblok.id, {
                centraleVraag: e.target.value || null,
              })
            }
            rows={2}
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink">Toelichting</span>
          <div className="flex items-start gap-2">
            <textarea
              value={bouwblok.toelichting ?? ""}
              onChange={(e) =>
                patchBouwblok(assessmentId, categorieId, bouwblok.id, {
                  toelichting: e.target.value,
                })
              }
              rows={4}
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
            <InfoIcoon sleutel="info.contentToelichting" />
          </div>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink">Tags (komma-gescheiden)</span>
          <input
            value={bouwblok.tags.join(", ")}
            onChange={(e) =>
              patchBouwblok(assessmentId, categorieId, bouwblok.id, {
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
          />
        </label>
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Vragen</p>
          <div className="space-y-2">
            {bouwblok.vragen
              .filter((v) => !v.gearchiveerd)
              .map((vraag) => (
                <div key={vraag.id} className="flex items-start gap-2">
                  <span className="mt-2 w-4 text-xs text-ink-m">{vraag.volgnummer}.</span>
                  <textarea
                    value={vraag.tekst}
                    onChange={(e) =>
                      patchVraag(assessmentId, categorieId, bouwblok.id, vraag.id, e.target.value)
                    }
                    rows={2}
                    className="flex-1 rounded-lg border border-gray-200 p-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setArchiveren({ soort: "vraag", vraagId: vraag.id })}
                    className="btn btn-outline btn-compact mt-2"
                  >
                    Archiveer
                  </button>
                </div>
              ))}
          </div>
          <button
            type="button"
            onClick={() => addVraag(assessmentId, categorieId, bouwblok.id)}
            className="btn btn-outline btn-compact mt-2"
          >
            + Vraag toevoegen
          </button>

          {bouwblok.vragen.some((v) => v.gearchiveerd) && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-ink-m">
                Gearchiveerd ({bouwblok.vragen.filter((v) => v.gearchiveerd).length})
              </summary>
              <div className="mt-2 space-y-1">
                {bouwblok.vragen
                  .filter((v) => v.gearchiveerd)
                  .map((vraag) => (
                    <div key={vraag.id} className="flex items-center gap-2 text-xs text-ink-m">
                      <span className="flex-1 truncate">{vraag.tekst}</span>
                      <button
                        type="button"
                        onClick={() => herstelVraag(assessmentId, categorieId, bouwblok.id, vraag.id)}
                        className="btn btn-outline btn-compact"
                      >
                        Herstellen
                      </button>
                    </div>
                  ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </details>
    <BevestigModal
      open={archiveren !== null}
      titel={archiveren?.soort === "vraag" ? "Vraag archiveren" : "Bouwblok archiveren"}
      bericht={
        archiveren?.soort === "vraag"
          ? 'Vraag archiveren? Ze verdwijnt uit de doorloopflow voor nieuwe invullingen, maar bestaande antwoorden blijven behouden in de score. Je kunt dit terugzetten via "Gearchiveerd" hieronder.'
          : `Bouwblok "${bouwblok.naam}" archiveren? Het verdwijnt uit de doorloopflow voor nieuwe invullingen, maar bestaande scores op zijn vragen blijven behouden. Je kunt dit terugzetten via "Gearchiveerd" hieronder.`
      }
      bevestigLabel="Archiveren"
      onBevestigen={() => {
        if (archiveren?.soort === "vraag") removeVraag(assessmentId, categorieId, bouwblok.id, archiveren.vraagId);
        else removeBouwblok(assessmentId, categorieId, bouwblok.id);
        setArchiveren(null);
      }}
      onAnnuleren={() => setArchiveren(null)}
    />
    </>
  );
}
