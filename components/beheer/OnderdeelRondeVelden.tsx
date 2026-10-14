"use client";

import { useMemo } from "react";
import { STANDAARD_ONDERDEEL, bestaandeOnderdelen, genereerLabel, rondesNieuwsteEerst } from "@/lib/rondes";
import { Organisatie } from "@/lib/types";

/**
 * De twee velden die een Meting bepalen: Ronde en Onderdeel (`beheerpagina.md`, punt 5, Wat je invult). Een label is er niet
 * meer om in te vullen: Onder de velden staat alleen ter controle wat de naam wordt ("Wordt: Zuid-Nederland Zakelijk |
 * 0-meting", `datamodel.md`, Naam van een Meting). Eén component voor een Meting plannen, een Meting die bij "Vragenlijst
 * sturen" nieuw wordt, Wijzigen en "Scans samenbrengen".
 */
export const NIEUWE_RONDE = "__nieuweronde__";
export const GEEN_RONDE = "__geenronde__";

export interface OnderdeelRondeWaarde {
  onderdeel: string;
  /** Een `Ronde.id`, `NIEUWE_RONDE` of (alleen bij `metZonderRonde`) `GEEN_RONDE`. */
  ronde: string;
  /** De naam van de nieuwe ronde, bij `NIEUWE_RONDE`. */
  nieuweRonde: string;
}

/** De beginwaarde: De nieuwste ronde, of "Nieuwe ronde" als de organisatie er nog geen heeft. */
export function beginWaarde(organisatie: Pick<Organisatie, "rondes">, onderdeel = STANDAARD_ONDERDEEL): OnderdeelRondeWaarde {
  const rondes = rondesNieuwsteEerst(organisatie);
  return { onderdeel, ronde: rondes.length === 0 ? NIEUWE_RONDE : rondes[0].id, nieuweRonde: "" };
}

/** Het doel in de vorm die `maakMeting` en `brengScansSamen` verwachten. */
export function rondeDoel(w: OnderdeelRondeWaarde): { rondeId?: string; nieuweRondeLabel?: string } {
  if (w.ronde === NIEUWE_RONDE) return { nieuweRondeLabel: w.nieuweRonde };
  if (w.ronde === GEEN_RONDE) return {};
  return { rondeId: w.ronde };
}

/** De naam die de Meting krijgt, of een lege tekst zolang de ronde nog geen naam heeft. */
export function metingNaam(organisatie: Pick<Organisatie, "rondes">, w: OnderdeelRondeWaarde): string {
  const ronde =
    w.ronde === NIEUWE_RONDE
      ? w.nieuweRonde.trim()
      : (organisatie.rondes ?? []).find((r) => r.id === w.ronde)?.label ?? "";
  return ronde ? genereerLabel(w.onderdeel, ronde) : "";
}

export function OnderdeelRondeVelden({
  organisatie,
  waarde,
  onChange,
  metZonderRonde = false,
  idPrefix = "meting",
  inRij = false,
}: {
  organisatie: Pick<Organisatie, "rondes" | "scanUitvoeringen">;
  waarde: OnderdeelRondeWaarde;
  onChange: (w: OnderdeelRondeWaarde) => void;
  /** Alleen voor een bestaande Meting die nog geen ronde heeft: Dan kan ze zonder ronde blijven. */
  metZonderRonde?: boolean;
  idPrefix?: string;
  /**
   * De velden staan direct in de rij van de aanroeper (`stylesheet.md`, Veldenrij met labels en een knop): Geen eigen rij en
   * geen regel "Wordt: …", die staat dan onder de rij van de aanroeper (`metingNaam`), zodat hij geen veld omlaag duwt.
   */
  inRij?: boolean;
}) {
  const rondes = rondesNieuwsteEerst(organisatie);
  const onderdelen = useMemo(() => bestaandeOnderdelen(organisatie), [organisatie]);
  const naam = metingNaam(organisatie, waarde);
  const lijstId = `${idPrefix}-onderdelen`;
  const velden = (
    <>
      <div className="admin-field" style={{ marginBottom: 0 }}>
        <label>Ronde</label>
        <select value={waarde.ronde} onChange={(e) => onChange({ ...waarde, ronde: e.target.value })}>
          {metZonderRonde && <option value={GEEN_RONDE}>Zonder ronde</option>}
          {rondes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
          <option value={NIEUWE_RONDE}>Nieuwe ronde</option>
        </select>
      </div>
      {waarde.ronde === NIEUWE_RONDE && (
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label>Naam van de ronde</label>
          <input
            type="text"
            value={waarde.nieuweRonde}
            placeholder="0-meting"
            onChange={(e) => onChange({ ...waarde, nieuweRonde: e.target.value })}
          />
        </div>
      )}
      <div className="admin-field" style={{ marginBottom: 0 }}>
        <label>Onderdeel</label>
        <input type="text" list={lijstId} value={waarde.onderdeel} onChange={(e) => onChange({ ...waarde, onderdeel: e.target.value })} />
        <datalist id={lijstId}>
          {onderdelen.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      </div>
    </>
  );
  if (inRij) return velden;
  return (
    <>
      <div className="flex flex-wrap items-start gap-3">{velden}</div>
      {naam && (
        <p className="text-sm text-ink-m" style={{ margin: "0.5rem 0 0" }}>
          Wordt: <strong>{naam}</strong>
        </p>
      )}
    </>
  );
}
