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
      <fieldset className="veld-groep">
        <legend>{veld.label}</legend>
        {(veld.subvelden ?? []).map((sub) => (
          <VeldInput
            key={sub.id}
            veld={sub}
            waarde={obj[sub.id]}
            onChange={(w) => onChange({ ...obj, [sub.id]: w })}
          />
        ))}
      </fieldset>
    );
  }

  if (veld.type === "select") {
    return (
      <div className="admin-field">
        <label>{veld.label}</label>
        <select value={(waarde as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">Kies...</option>
          {(veld.opties ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const isNumeriek = veld.type === "getal" || veld.type === "percentage";
  return (
    <div className="admin-field">
      <label>
        {veld.label}
        {veld.type === "percentage" && " (%)"}
      </label>
      <input
        type={isNumeriek ? "number" : "text"}
        value={(waarde as string | number) ?? ""}
        onChange={(e) => onChange(isNumeriek ? Number(e.target.value) : e.target.value)}
      />
    </div>
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
    <div>
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
