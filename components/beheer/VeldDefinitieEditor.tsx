import { VeldDefinitie, VeldType } from "@/lib/types";
import { nieuwId } from "@/lib/id";

const VELD_TYPES: VeldType[] = [
  "tekst",
  "getal",
  "percentage",
  "select",
  "select-met-verdeling",
  "groep",
];

function VeldRow({
  veld,
  onChange,
  onRemove,
}: {
  veld: VeldDefinitie;
  onChange: (veld: VeldDefinitie) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={veld.label}
          onChange={(e) => onChange({ ...veld, label: e.target.value })}
          className="min-w-[10rem] flex-1 rounded-lg border border-gray-200 p-2 text-sm"
          placeholder="Label"
        />
        <select
          value={veld.type}
          onChange={(e) => {
            const type = e.target.value as VeldType;
            onChange({
              ...veld,
              type,
              subvelden: type === "groep" ? (veld.subvelden ?? []) : undefined,
              opties: type === "select" ? (veld.opties ?? []) : undefined,
            });
          }}
          className="rounded-lg border border-gray-200 p-2 text-sm"
        >
          {VELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-600 hover:underline"
        >
          Verwijderen
        </button>
      </div>

      {veld.type === "select" && (
        <input
          value={(veld.opties ?? []).join(", ")}
          onChange={(e) =>
            onChange({
              ...veld,
              opties: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="Opties, komma-gescheiden"
          className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm"
        />
      )}

      {veld.type === "groep" && (
        <div className="mt-3 space-y-2 border-l-2 border-gray-100 pl-4">
          {(veld.subvelden ?? []).map((sub, i) => (
            <VeldRow
              key={sub.id}
              veld={sub}
              onChange={(nieuw) => {
                const subvelden = [...(veld.subvelden ?? [])];
                subvelden[i] = nieuw;
                onChange({ ...veld, subvelden });
              }}
              onRemove={() =>
                onChange({
                  ...veld,
                  subvelden: (veld.subvelden ?? []).filter((_, j) => j !== i),
                })
              }
            />
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...veld,
                subvelden: [
                  ...(veld.subvelden ?? []),
                  { id: nieuwId(), label: "Nieuw veld", type: "tekst" },
                ],
              })
            }
            className="text-sm font-medium text-muted hover:text-ink"
          >
            + Subveld toevoegen
          </button>
        </div>
      )}
    </div>
  );
}

export function VeldDefinitieEditor({
  velden,
  onChange,
}: {
  velden: VeldDefinitie[];
  onChange: (velden: VeldDefinitie[]) => void;
}) {
  return (
    <div className="space-y-3">
      {velden.map((veld, i) => (
        <VeldRow
          key={veld.id}
          veld={veld}
          onChange={(nieuw) => {
            const kopie = [...velden];
            kopie[i] = nieuw;
            onChange(kopie);
          }}
          onRemove={() => onChange(velden.filter((_, j) => j !== i))}
        />
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...velden, { id: nieuwId(), label: "Nieuw veld", type: "tekst" }])
        }
        className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-muted hover:border-gray-400"
      >
        + Veld toevoegen
      </button>
    </div>
  );
}
