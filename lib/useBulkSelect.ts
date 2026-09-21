import { useMemo, useState } from "react";

/** Herbruikbaar select-all/bulk-select patroon (admin-beheerpagina.md: "Select + verwijderen wordt een terugkerend patroon"). */
export function useBulkSelect(alleIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const geldig = useMemo(() => {
    const ids = new Set(alleIds);
    return new Set([...selected].filter((id) => ids.has(id)));
  }, [selected, alleIds]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === alleIds.length ? new Set() : new Set(alleIds)));
  }

  function clear() {
    setSelected(new Set());
  }

  return {
    selected: geldig,
    isSelected: (id: string) => geldig.has(id),
    toggle,
    toggleAll,
    clear,
    alleGeselecteerd: alleIds.length > 0 && geldig.size === alleIds.length,
    sommigeGeselecteerd: geldig.size > 0 && geldig.size < alleIds.length,
  };
}
