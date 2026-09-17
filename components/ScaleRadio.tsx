import { SchaalLabel } from "@/lib/types";

export function ScaleRadio({
  naam,
  schaal,
  waarde,
  onChange,
}: {
  naam: string;
  schaal: SchaalLabel[];
  waarde: number | undefined;
  onChange: (waarde: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-3">
      {schaal.map((s) => (
        <label
          key={s.waarde}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
            waarde === s.waarde
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white hover:border-slate-400"
          }`}
        >
          <input
            type="radio"
            name={naam}
            value={s.waarde}
            checked={waarde === s.waarde}
            onChange={() => onChange(s.waarde)}
            className="sr-only"
          />
          <span className="text-lg font-semibold">{s.waarde}</span>
          <span className="text-xs leading-snug">{s.label}</span>
        </label>
      ))}
    </div>
  );
}
