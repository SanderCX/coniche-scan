import { VeldDefinitie } from "@/lib/types";

function VeldInput({
  veld,
  waarde,
  onChange,
}: {
  veld: VeldDefinitie;
  waarde: unknown;
  onChange: (waarde: unknown) => void;
}) {
  if (veld.type === "groep") {
    const obj = (waarde as Record<string, unknown>) ?? {};
    return (
      <fieldset className="rounded-lg border border-gray-200 p-4">
        <legend className="px-1 text-sm font-semibold text-ink">{veld.label}</legend>
        <div className="mt-2 space-y-3">
          {(veld.subvelden ?? []).map((sub) => (
            <VeldInput
              key={sub.id}
              veld={sub}
              waarde={obj[sub.id]}
              onChange={(w) => onChange({ ...obj, [sub.id]: w })}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  if (veld.type === "select") {
    return (
      <label className="block text-sm">
        <span className="mb-1 block text-ink">{veld.label}</span>
        <select
          value={(waarde as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 p-2 text-sm"
        >
          <option value="">Kies...</option>
          {(veld.opties ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  }

  const isNumeriek = veld.type === "getal" || veld.type === "percentage";
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-ink">
        {veld.label}
        {veld.type === "percentage" && <span className="text-ink-m"> (%)</span>}
      </span>
      <input
        type={isNumeriek ? "number" : "text"}
        value={(waarde as string | number) ?? ""}
        onChange={(e) => onChange(isNumeriek ? Number(e.target.value) : e.target.value)}
        className="w-full rounded-lg border border-gray-200 p-2 text-sm"
      />
    </label>
  );
}

export function KenmerkenForm({
  velden,
  waarden,
  onChange,
}: {
  velden: VeldDefinitie[];
  waarden: Record<string, unknown>;
  onChange: (waarden: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      {velden.map((veld) => (
        <VeldInput
          key={veld.id}
          veld={veld}
          waarde={waarden[veld.id]}
          onChange={(w) => onChange({ ...waarden, [veld.id]: w })}
        />
      ))}
    </div>
  );
}
