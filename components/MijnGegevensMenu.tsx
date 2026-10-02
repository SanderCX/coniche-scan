"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropdownKnop } from "./DropdownKnop";
import { Modal } from "./Modal";
import { RespondentGegevensVelden } from "./RespondentGegevensVelden";
import { updateRespondentGegevens } from "@/lib/db";
import { OrganisatieLid } from "@/lib/types";

/**
 * "Mijn gegevens"-menu (CLAUDE.md sectie 3): identiteitsmenu voor een
 * respondent, punt 7 van de nav-volgorderegel (helemaal uiterst rechts,
 * voorbij de exit-actie). Niet het Accountmenu van beheerpagina.md — dat
 * is voor beheerders.
 */
export function MijnGegevensMenu({ lid }: { lid: OrganisatieLid }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleOpslaan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    updateRespondentGegevens(lid.id, {
      naam: String(data.get("naam") ?? "").trim(),
      functie: String(data.get("functie") ?? "").trim(),
      team: String(data.get("team") ?? "").trim(),
      notities: String(data.get("notities") ?? "").trim(),
    });
    setOpen(false);
  }

  function handleUitloggen() {
    // Respondenten hebben geen account om echt op af te melden — dit is het
    // verlaten van de lokale sessie, niet een serverside logout. Er is nog
    // geen `ToegangsSessie` (datamodel.md deel 2, wordt gebouwd met de
    // backend): de `code` leeft alleen in de URL, niet in localStorage/
    // sessionStorage, dus er valt vandaag niets los te wissen — navigeren
    // weg van de persoonlijke link is voor nu het hele effect.
    router.push("/toegang");
  }

  return (
    <>
      <DropdownKnop
        label="Mijn gegevens"
        opties={[
          { label: "Gegevens bekijken/wijzigen", onClick: () => setOpen(true) },
          { label: "Uitloggen", onClick: handleUitloggen },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Mijn gegevens">
        <form onSubmit={handleOpslaan} className="text-left">
          <RespondentGegevensVelden
            naam={lid.naam}
            functie={lid.functie}
            team={lid.team}
            notities={lid.notities}
          />
          <button type="submit" className="btn btn-or" style={{ width: "100%" }}>
            Opslaan
          </button>
        </form>
      </Modal>
    </>
  );
}
