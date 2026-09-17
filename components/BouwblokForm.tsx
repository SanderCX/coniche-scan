import { Bouwblok, Respondent, SchaalLabel } from "@/lib/types";
import { CATEGORIE_COLORS } from "@/lib/colors";
import { ScaleRadio } from "./ScaleRadio";

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

  return (
    <div className="mx-auto max-w-3xl">
      <div className={`rounded-t-2xl px-6 py-5 text-white ${kleur?.bg ?? "bg-slate-700"}`}>
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">
          {eenheid} {bouwblok.volgnummer}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{bouwblok.naam}</h1>
        <p className="mt-2 text-sm opacity-90">{bouwblok.omschrijving}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {bouwblok.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-8 rounded-b-2xl border border-t-0 border-slate-200 bg-white px-6 py-6">
        <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Beantwoord op basis van wat aantoonbaar geregeld is (documenten, ritmes, tooling,
          afspraken).
        </p>

        {bouwblok.vragen.map((vraag) => (
          <div key={vraag.id}>
            <p className="mb-3 text-sm font-medium text-slate-800">
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
          <label className="mb-2 block text-sm font-medium text-slate-800">
            Opmerkingen bij dit bouwblok (optioneel)
          </label>
          <textarea
            value={respondent.opmerkingenPerBouwblok[bouwblok.id] ?? ""}
            onChange={(e) => onOpmerking(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none"
            placeholder="Toelichting, context of voorbeelden..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!alleBeantwoord}
            onClick={onVolgende}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isLaatsteBouwblok ? "Bekijk resultaten" : "Volgende"}
          </button>
        </div>
      </div>
    </div>
  );
}
