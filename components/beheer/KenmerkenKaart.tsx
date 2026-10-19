"use client";

import { useState } from "react";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";
import { organisatieVelden } from "@/data/organisatie-velden";
import { kenmerkenRaster } from "@/lib/kenmerken-weergave";
import { Organisatie } from "@/lib/types";

/**
 * De kaart Kenmerken bovenaan het organisatie-detail (`beheerpagina.md`, punt 4, Kenmerken): Een rustig raster met de ingevulde
 * velden en de knop "Bewerken", die een modal opent met alle velden (`stylesheet.md`, Bewerken: op de plek of in een modal). Opslaan
 * schrijft naar `Organisatie.kenmerken`, Annuleren en het kruisje gooien de wijzigingen weg. Het Bewerkslot van de Organisatie
 * geldt al zolang de pagina open is (`MetBewerkslot`).
 */
export function KenmerkenKaart({
  organisatie,
  onOpslaan,
}: {
  organisatie: Organisatie;
  onOpslaan: (kenmerken: Record<string, unknown>) => void;
}) {
  const [open, setOpen] = useState(false);
  const raster = kenmerkenRaster(organisatieVelden, organisatie.kenmerken);
  return (
    <section className="kenmerken-kaart" aria-label="Kenmerken">
      <div className="kenmerken-kop">
        <h2>Kenmerken</h2>
        <button type="button" className="btn btn-outline btn-compact" onClick={() => setOpen(true)}>
          Bewerken
        </button>
      </div>
      {raster.length === 0 ? (
        <p className="kenmerken-leeg">Er zijn nog geen kenmerken ingevuld.</p>
      ) : (
        <dl className="kenmerken-raster">
          {raster.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.waarde}</dd>
            </div>
          ))}
        </dl>
      )}
      {open && (
        <KenmerkenModal
          organisatie={organisatie}
          onSluit={() => setOpen(false)}
          onOpslaan={(k) => {
            onOpslaan(k);
            setOpen(false);
          }}
        />
      )}
    </section>
  );
}

function KenmerkenModal({
  organisatie,
  onSluit,
  onOpslaan,
}: {
  organisatie: Organisatie;
  onSluit: () => void;
  onOpslaan: (kenmerken: Record<string, unknown>) => void;
}) {
  const [concept, setConcept] = useState<Record<string, unknown>>(organisatie.kenmerken);
  return (
    <OverzichtModal label="Kenmerken bewerken" onSluit={onSluit}>
      <div className="overzicht-kop">
        <h2>Kenmerken bewerken</h2>
        <p className="text-sm text-ink-m" style={{ margin: 0 }}>
          {organisatie.naam}
        </p>
      </div>
      <div className="kenmerken-modal">
        <KenmerkenForm velden={organisatieVelden} waarden={concept} onChange={setConcept} className="kenmerken-form-raster" />
      </div>
      <div className="btn-rij kenmerken-modal-knoppen">
        <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
          Annuleren
        </button>
        <button type="button" className="btn btn-or btn-compact" onClick={() => onOpslaan(concept)}>
          Opslaan
        </button>
      </div>
    </OverzichtModal>
  );
}
