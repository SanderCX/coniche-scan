"use client";

import { SlotType, useBewerkslot } from "@/lib/bewerkslot";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";

/**
 * Bewerkslot in beheer (`datamodel.md`, Bewerkslot): Eerste wint. Is het record
 * al in gebruik, dan staat er een melding met de naam van de houder in plaats
 * van het record, en opent het record zodra het slot vrij is (de hook controleert
 * zelf opnieuw). `id` = `null` claimt niets, bijvoorbeeld zolang het record niet
 * bestaat of de gebruiker er niet bij mag.
 *
 * Met `onSluit` verschijnt de melding in een Overzichtsmodal (Respondent-overzicht),
 * anders als melding op de pagina (Organisatie-detail).
 */
export function MetBewerkslot({
  type,
  id,
  wat,
  onSluit,
  children,
}: {
  type: SlotType;
  id: string | null;
  /** Hoe het record in de melding heet, bijv. "Organisatie" of "Respondent". */
  wat: string;
  onSluit?: () => void;
  children: React.ReactNode;
}) {
  const slot = useBewerkslot(type, id);

  if (id === null || slot.status === "eigen") return <>{children}</>;
  if (slot.status === "controleren") return null;

  const melding = (
    <>
      <h2 className="text-lg font-bold text-ink">{wat} is in gebruik</h2>
      <p className="overzicht-melding fout">
        {slot.houderNaam ? `${slot.houderNaam} bewerkt` : "Iemand anders bewerkt"} deze {wat.toLowerCase()} op dit
        moment. Er kan maar één persoon tegelijk bewerken. Zodra het vrij is, opent hij hier vanzelf.
      </p>
      <div className="btn-rij" style={{ marginTop: "1rem", maxWidth: "20rem" }}>
        <button type="button" className="btn btn-outline btn-compact" onClick={slot.opnieuw}>
          Opnieuw proberen
        </button>
      </div>
    </>
  );

  return onSluit ? (
    <OverzichtModal label={`${wat} is in gebruik`} onSluit={onSluit}>
      {melding}
    </OverzichtModal>
  ) : (
    <div className="admin-main">{melding}</div>
  );
}
