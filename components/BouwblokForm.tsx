import { useState } from "react";
import { Bouwblok, Respondent, SchaalLabel } from "@/lib/types";
import { CATEGORIE_COLORS } from "@/lib/colors";
import { ScaleRadio } from "./ScaleRadio";
import { Modal } from "./Modal";

export function BouwblokForm({
  bouwblok,
  categorieKleur,
  eenheid,
  schaal,
  respondent,
  isLaatsteBouwblok,
  onAntwoord,
  onOpmerking,
  onVolgende,
}: {
  bouwblok: Bouwblok;
  categorieKleur: string | null;
  /** UI-woord voor dit bouwblok, bijv. "Bouwblok" of "Domein". */
  eenheid: string;
  schaal: SchaalLabel[];
  respondent: Respondent;
  isLaatsteBouwblok: boolean;
  onAntwoord: (vraagId: string, waarde: number) => void;
  onOpmerking: (tekst: string) => void;
  onVolgende: () => void;
}) {
  const kleur = categorieKleur ? CATEGORIE_COLORS[categorieKleur] : undefined;
  const alleBeantwoord = bouwblok.vragen.every(
    (v) => typeof respondent.antwoorden[v.id] === "number"
  );
  const [toelichtingOpen, setToelichtingOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex gap-4 rounded-t-2xl border border-b-0 border-gray-200 bg-white p-6">
        <div className={`w-1.5 flex-shrink-0 rounded-full ${kleur?.bg ?? "bg-gray-300"}`} />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-m">
            {eenheid} {bouwblok.volgnummer}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink">{bouwblok.naam}</h1>
            <button
              type="button"
              onClick={() => setToelichtingOpen(true)}
              aria-label={`Meer uitleg over ${bouwblok.naam}`}
              title="Meer uitleg"
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-ink-m hover:border-or hover:text-or"
            >
              i
            </button>
          </div>
          <p className="mt-2 text-sm text-ink-m">{bouwblok.omschrijving}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {bouwblok.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-or-mid bg-or-faint px-2.5 py-1 text-xs font-medium text-or"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={toelichtingOpen}
        onClose={() => setToelichtingOpen(false)}
        title={bouwblok.naam}
      >
        {bouwblok.toelichting}
      </Modal>

      <div className="space-y-8 rounded-b-2xl border border-t-0 border-gray-200 bg-white px-6 py-6">
        <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-ink-m">
          Beantwoord op basis van wat aantoonbaar geregeld is (documenten, ritmes, tooling,
          afspraken).
        </p>

        {bouwblok.vragen.map((vraag) => (
          <div key={vraag.id}>
            <p className="mb-3 text-sm font-medium text-ink">
              {vraag.volgnummer}. {vraag.tekst}
            </p>
            <ScaleRadio
              naam={vraag.id}
              schaal={schaal}
              waarde={respondent.antwoorden[vraag.id]}
              onChange={(waarde) => onAntwoord(vraag.id, waarde)}
            />
          </div>
        ))}

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            Opmerkingen bij dit bouwblok (optioneel)
          </label>
          <textarea
            value={respondent.opmerkingenPerBouwblok[bouwblok.id] ?? ""}
            onChange={(e) => onOpmerking(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-or focus:outline-none"
            placeholder="Toelichting, context of voorbeelden..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!alleBeantwoord}
            onClick={onVolgende}
            className="rounded-lg bg-or px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-or-l hover:-translate-y-px disabled:cursor-not-allowed disabled:bg-or-disabled disabled:hover:bg-or-disabled disabled:hover:translate-y-0"
          >
            {isLaatsteBouwblok ? "Bekijk resultaten" : "Volgende"}
          </button>
        </div>
      </div>
    </div>
  );
}
