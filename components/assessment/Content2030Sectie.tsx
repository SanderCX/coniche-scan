"use client";

import { useState } from "react";
import { Sectie } from "@/components/assessment/Sectie";
import { MACHINE_CUSTOMER_ICONS } from "@/components/icons/MachineCustomerIcons";
import {
  aiConcreet,
  geenVastEindbeeld,
  gemeenschappelijkeKenmerken,
  kenmerkenIntro,
  kostenBusinesscase,
  machineCustomerEffecten,
  machineCustomerEffectenIntro,
  machineCustomerIntro,
  machineCustomerPunten,
  machineCustomerSlot,
  relatieMetScan,
  vijfDingenIntro,
  vijfDingenOntwerpen,
  watDitVoorMensenBetekent,
} from "@/data/klantcontact-2030-content";

/** De eerste zin van een tekst, voor de korte kaart. */
const eersteZin = (tekst: string | string[]) => (Array.isArray(tekst) ? tekst[0] : tekst).split(/(?<=[.!?])\s+/)[0];

/** De overige onderdelen van het stuk, als pillen onder de kaarten (`CLAUDE.md`, scherm 2, Klantcontact richting 2030). */
const ONDERDELEN = [
  "Geen vast eindbeeld",
  "De machine customer",
  "Wat dit voor AI concreet betekent",
  "Kosten en businesscase",
  "Wat dit voor mensen betekent",
  "Wat organisaties gemeen hebben",
  "De relatie met deze scan",
];

function GenummerdeLijst({ items }: { items: { titel: string; tekst: string | string[] }[] }) {
  return (
    <div className="ap-2030-lijst">
      {items.map((item, i) => (
        <div key={item.titel} className="card" style={{ display: "flex", gap: "1rem" }}>
          <span className="ap-cirkel ap-cirkel--licht" aria-hidden="true">
            {i + 1}
          </span>
          <div>
            <p className="font-semibold text-ink">{item.titel}</p>
            {(Array.isArray(item.tekst) ? item.tekst : [item.tekst]).map((alinea, j) => (
              <p key={j} className="text-sm" style={{ color: "var(--ink-m)", marginTop: j === 0 ? "0.25rem" : "0.6rem" }}>
                {alinea}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function IconLijst({ items }: { items: { titel: string; tekst: string; icoon: string }[] }) {
  return (
    <div style={{ marginTop: "1rem" }}>
      {items.map((item) => {
        const Icon = MACHINE_CUSTOMER_ICONS[item.icoon];
        return (
          <div key={item.titel} style={{ display: "flex", gap: "0.85rem", marginTop: "1rem" }}>
            <span className="ap-cirkel ap-cirkel--licht ap-cirkel--icoon" aria-hidden="true">
              {Icon && <Icon width={16} height={16} />}
            </span>
            <div>
              <p className="font-semibold text-ink">{item.titel}</p>
              <p className="text-sm" style={{ color: "var(--ink-m)", marginTop: "0.15rem" }}>
                {item.tekst}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * De sectie "Klantcontact richting 2030" (`CLAUDE.md`, scherm 2, Herontwerp; bron `content-2030.md`): De vijf ontwerpkeuzes als vijf kaarten naast
 * elkaar (nummer, titel, één zin), daaronder pillen met de overige onderdelen van het stuk en "Lees het hele stuk", dat het volledige stuk op
 * dezelfde pagina uitklapt. De zin op een kaart is de eerste zin van de tekst.
 */
export function Content2030Sectie() {
  const [open, setOpen] = useState(false);
  return (
    <Sectie
      id="2030"
      kop="Klantcontact richting 2030"
      inleiding={vijfDingenIntro}
      kinderen={
        <>
          <ol className="ap-2030-kaarten" aria-label="Vijf dingen die iedere organisatie moet ontwerpen">
            {vijfDingenOntwerpen.map((k, i) => (
              <li key={k.titel} className="ap-2030-kaart">
                <span className="ap-cirkel ap-cirkel--licht" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{k.titel}</h3>
                <p>{eersteZin(k.tekst)}</p>
              </li>
            ))}
          </ol>
          <div className="ap-2030-onderdelen">
            <span className="ap-label">Verder in het stuk</span>
            {ONDERDELEN.map((t) => (
              <span key={t} className="ap-onderdeel">
                {t}
              </span>
            ))}
          </div>
          <button type="button" className="btn btn-outline btn-compact" aria-expanded={open} aria-controls="stuk-2030" onClick={() => setOpen(!open)}>
            {open ? "Verberg het stuk" : "Lees het hele stuk"}
          </button>
          {open && (
            <div id="stuk-2030" className="ap-2030-stuk">
              <h3>Geen vast eindbeeld</h3>
              {geenVastEindbeeld.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
              <h3>Vijf dingen die iedere organisatie moet ontwerpen</h3>
              <p>{vijfDingenIntro}</p>
              <GenummerdeLijst items={vijfDingenOntwerpen} />
              <h3>De machine customer: nieuwe combinaties</h3>
              {machineCustomerIntro.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
              <p>{machineCustomerEffectenIntro}</p>
              <IconLijst items={machineCustomerEffecten} />
              <GenummerdeLijst items={machineCustomerPunten} />
              {machineCustomerSlot.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
              <h3>Wat dit voor AI concreet betekent</h3>
              <GenummerdeLijst items={aiConcreet} />
              <h3>Kosten en businesscase</h3>
              {kostenBusinesscase.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
              <h3>Wat dit voor mensen betekent</h3>
              {watDitVoorMensenBetekent.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
              <h3>Wat organisaties die zich hierop voorbereiden gemeen hebben</h3>
              <p>{kenmerkenIntro}</p>
              <div className="ap-2030-kenmerken">
                {gemeenschappelijkeKenmerken.map((item) => (
                  <div key={item.titel}>
                    <p className="text-sm font-semibold text-ink">{item.titel}</p>
                    <p className="text-sm" style={{ color: "var(--ink-m)" }}>
                      {item.tekst}
                    </p>
                  </div>
                ))}
              </div>
              <h3>De relatie met deze scan</h3>
              <p>{relatieMetScan}</p>
            </div>
          )}
        </>
      }
    />
  );
}
