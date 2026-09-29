import { VeldDefinitie } from "@/lib/types";

function VeldInput({
  veld,
  waarde,
  onChange,
  alleWaarden,
  alleVelden,
}: {
  veld: VeldDefinitie;
  waarde: unknown;
  onChange: (waarde: unknown) => void;
  /** Waarden van de broer-velden binnen dezelfde groep, voor type "select-afhankelijk" (bijv. Subsector die Sector nodig heeft). */
  alleWaarden?: Record<string, unknown>;
  /** Definities van diezelfde broer-velden, op id — voor het label in de placeholder ("Kies eerst {label}"). */
  alleVelden?: Record<string, VeldDefinitie>;
}) {
  if (veld.type === "groep") {
    const obj = (waarde as Record<string, unknown>) ?? {};
    const subvelden = veld.subvelden ?? [];
    // Subvelden die zelf geen groep zijn (dus losse getal/percentage/tekst/
    // select-velden) passen naast elkaar op één regel — een groep van
    // groepen (bijv. techstack) blijft onder elkaar staan, die is te breed.
    const opEenRegel = subvelden.length > 0 && subvelden.every((sub) => sub.type !== "groep");
    const veldPerId = Object.fromEntries(subvelden.map((sub) => [sub.id, sub]));
    return (
      <fieldset className="veld-groep">
        <legend>{veld.label}</legend>
        <div className={opEenRegel ? "veld-rij" : undefined}>
          {subvelden.map((sub) => (
            <VeldInput
              key={sub.id}
              veld={sub}
              waarde={obj[sub.id]}
              alleWaarden={obj}
              alleVelden={veldPerId}
              onChange={(w) => {
                const nieuw = { ...obj, [sub.id]: w };
                // Wijzigt een veld waar een ander veld in deze groep van afhangt
                // (bijv. Sector), dan is de afhankelijke waarde (Subsector)
                // mogelijk niet meer geldig — wissen i.p.v. laten staan.
                for (const afhankelijk of subvelden) {
                  if (afhankelijk.afhankelijkVan === sub.id) nieuw[afhankelijk.id] = undefined;
                }
                onChange(nieuw);
              }}
            />
          ))}
        </div>
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

  if (veld.type === "select-afhankelijk") {
    const ouderVeldId = veld.afhankelijkVan;
    const ouderWaarde = ouderVeldId ? (alleWaarden?.[ouderVeldId] as string | undefined) : undefined;
    const opties = ouderWaarde ? (veld.optiesPerWaarde?.[ouderWaarde] ?? []) : [];
    const ouderLabel = (ouderVeldId && alleVelden?.[ouderVeldId]?.label) || "het vorige veld";
    const placeholder = ouderWaarde ? "Kies..." : `Kies eerst ${ouderLabel.toLowerCase()}`;
    return (
      <div className="admin-field">
        <label>{veld.label}</label>
        <select
          value={(waarde as string) ?? ""}
          disabled={!ouderWaarde}
          title={!ouderWaarde ? placeholder : undefined}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {opties.map((o) => (
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
  const veldPerId = Object.fromEntries(velden.map((veld) => [veld.id, veld]));
  return (
    <div>
      {velden.map((veld) => (
        <VeldInput
          key={veld.id}
          veld={veld}
          waarde={waarden[veld.id]}
          alleWaarden={waarden}
          alleVelden={veldPerId}
          onChange={(w) => onChange({ ...waarden, [veld.id]: w })}
        />
      ))}
    </div>
  );
}
