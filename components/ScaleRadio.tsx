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
              ? "border-or bg-or-faint"
              : "border-gray-200 bg-white hover:border-or"
          }`}
        >
          <input
            type="radio"
            name={naam}
            value={s.waarde}
            checked={waarde === s.waarde}
            onChange={() => onChange(s.waarde)}
            className="h-5 w-5 accent-or"
          />
          <span className="text-sm font-semibold text-ink">{s.waarde}</span>
          <span className="text-xs leading-snug text-ink-m">{s.label}</span>
        </label>
      ))}
    </div>
  );
}
