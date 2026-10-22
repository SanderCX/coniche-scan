"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { Modal } from "@/components/Modal";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { updateOrganisatie } from "@/lib/db";
import { Gebruiker, Organisatie } from "@/lib/types";

/**
 * Het vlak Toegang in het organisatiepaneel (`beheerpagina.md`, punt 4, Organisatie-toegang toewijzen, voorstel van 19 oktober 2026),
 * alleen voor een Admin: Wie bij de gegevens van de organisatie mag. De eigenaar (`aangemaaktDoor`) staat er met een badge en kan niet
 * worden ingetrokken, een toegewezen Consultant heeft een knop "Intrekken" met een korte bevestiging, en "+ Consultant toewijzen" opent een
 * modal met de actieve Consultants die nog geen toegang hebben. Intrekken is de spiegel van toewijzen.
 */
export function ToegangKaart({ organisatie, gebruikers }: { organisatie: Organisatie; gebruikers: Gebruiker[] }) {
  const eigenaar = gebruikers.find((g) => g.id === organisatie.aangemaaktDoor);
  const toegewezen = gebruikers.filter((g) => organisatie.toegewezenAan.includes(g.id));
  const kandidaten = gebruikers.filter(
    (g) => g.actief && g.rol === "consultant" && g.id !== organisatie.aangemaaktDoor && !organisatie.toegewezenAan.includes(g.id)
  );
  const [toewijzenOpen, setToewijzenOpen] = useState(false);
  const [intrekken, setIntrekken] = useState<Gebruiker | null>(null);

  function wijsToe(ids: string[]) {
    updateOrganisatie(organisatie.id, (o) => ({ ...o, toegewezenAan: [...o.toegewezenAan, ...ids.filter((id) => !o.toegewezenAan.includes(id))] }));
  }

  return (
    <section className="op-vlak" aria-label="Toegang">
      <div className="beheer-kaart-kop">
        <div className="titel-rij">
          <h2>Toegang</h2>
          <InfoIcoon sleutel="info.organisatieToegang" />
        </div>
        <button type="button" className="btn btn-or btn-compact" disabled={kandidaten.length === 0} onClick={() => setToewijzenOpen(true)}>
          + Consultant toewijzen
        </button>
      </div>
      <ul className="toegang-lijst">
        <li>
          <span className="toegang-label">Eigenaar</span>
          <span className="toegang-naam">{eigenaar ? eigenaar.naam : "Onbekend"}</span>
          <span className="toegang-badge">Eigenaar</span>
        </li>
        {toegewezen.map((g) => (
          <li key={g.id}>
            <span className="toegang-label">Consultant</span>
            <span className="toegang-naam">
              {g.naam} <span className="toegang-mail">{g.email}</span>
            </span>
            <button type="button" className="btn btn-outline btn-compact" onClick={() => setIntrekken(g)}>
              Intrekken
            </button>
          </li>
        ))}
      </ul>
      {toegewezen.length === 0 && <p className="toegang-leeg">Nog niemand toegewezen.</p>}

      {toewijzenOpen && <ToewijzenModal kandidaten={kandidaten} onSluit={() => setToewijzenOpen(false)} onToewijzen={(ids) => { wijsToe(ids); setToewijzenOpen(false); }} />}
      <BevestigModal
        open={intrekken !== null}
        titel="Toegang intrekken"
        bericht={`${intrekken?.naam ?? ""} heeft daarna geen toegang meer tot ${organisatie.naam}, tenzij hij of zij de eigenaar is.`}
        bevestigLabel="Intrekken"
        onBevestigen={() => {
          if (intrekken) {
            const id = intrekken.id;
            updateOrganisatie(organisatie.id, (o) => ({ ...o, toegewezenAan: o.toegewezenAan.filter((x) => x !== id) }));
          }
          setIntrekken(null);
        }}
        onAnnuleren={() => setIntrekken(null)}
      />
    </section>
  );
}

/** Meerdere keuzes in een lijst, dus een modal (`stylesheet.md`, Bewerken: Op de plek of in een modal). */
function ToewijzenModal({ kandidaten, onSluit, onToewijzen }: { kandidaten: Gebruiker[]; onSluit: () => void; onToewijzen: (ids: string[]) => void }) {
  const [gekozen, setGekozen] = useState<string[]>([]);
  return (
    <Modal open onClose={onSluit} title="Consultant toewijzen">
      <div className="flex flex-col gap-2" style={{ marginBottom: "var(--sp-4)" }}>
        {kandidaten.map((c) => (
          <label key={c.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={gekozen.includes(c.id)}
              onChange={(e) => setGekozen(e.target.checked ? [...gekozen, c.id] : gekozen.filter((id) => id !== c.id))}
            />
            {c.naam} ({c.email})
          </label>
        ))}
      </div>
      <div className="btn-rij" style={{ justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
          Annuleren
        </button>
        <button type="button" className="btn btn-or btn-compact" disabled={gekozen.length === 0} onClick={() => onToewijzen(gekozen)}>
          Toewijzen
        </button>
      </div>
    </Modal>
  );
}
