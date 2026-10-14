"use client";

import { useMemo } from "react";
import { STANDAARD_ONDERDEEL, bestaandeOnderdelen, genereerLabel, isGeldigeDatum } from "@/lib/metingen";
import { Organisatie } from "@/lib/types";

/**
 * De twee velden die een Meting bepalen naast het Assessment: Onderdeel en Meetdatum (`beheerpagina.md`, punt 5, Wat je
 * invult). Een label is er niet om in te vullen: Onder de velden staat alleen ter controle wat de naam wordt ("Wordt:
 * Zuid-Nederland Zakelijk | okt 2026", `datamodel.md`, Naam van een Meting). Eén component voor een Meting plannen, Wijzigen
 * en "Scans samenbrengen".
 */
export interface OnderdeelMeetdatumWaarde {
  onderdeel: string;
  /** `JJJJ-MM-DD`, of een lege tekst zolang er geen datum is gekozen. */
  meetdatum: string;
}

/** De beginwaarde: "Hele organisatie" en een lege meetdatum, zodat de gebruiker bewust een datum kiest. */
export function beginWaarde(onderdeel = STANDAARD_ONDERDEEL, meetdatum = ""): OnderdeelMeetdatumWaarde {
  return { onderdeel, meetdatum };
}

/** De naam die de Meting krijgt, of een lege tekst zolang er geen meetdatum is gekozen. */
export function metingNaam(w: OnderdeelMeetdatumWaarde): string {
  return isGeldigeDatum(w.meetdatum) ? genereerLabel(w.onderdeel, w.meetdatum) : "";
}

export function OnderdeelMeetdatumVelden({
  organisatie,
  waarde,
  onChange,
  idPrefix = "meting",
  inRij = false,
  meetdatumUitgeschakeld = false,
}: {
  organisatie: Pick<Organisatie, "scanUitvoeringen">;
  waarde: OnderdeelMeetdatumWaarde;
  onChange: (w: OnderdeelMeetdatumWaarde) => void;
  idPrefix?: string;
  /**
   * De velden staan direct in de rij van de aanroeper (`stylesheet.md`, Veldenrij met labels en een knop): Geen eigen rij en
   * geen regel "Wordt: …", die staat dan onder de rij van de aanroeper (`metingNaam`), zodat hij geen veld omlaag duwt.
   */
  inRij?: boolean;
  /** Een samengestelde Meting heeft geen eigen meetdatum: Ze volgt de onderliggende Metingen. */
  meetdatumUitgeschakeld?: boolean;
}) {
  const onderdelen = useMemo(() => bestaandeOnderdelen(organisatie), [organisatie]);
  const naam = metingNaam(waarde);
  const lijstId = `${idPrefix}-onderdelen`;
  const velden = (
    <>
      <div className="admin-field" style={{ marginBottom: 0 }}>
        <label htmlFor={`${idPrefix}-onderdeel`}>Onderdeel</label>
        <input
          id={`${idPrefix}-onderdeel`}
          type="text"
          list={lijstId}
          value={waarde.onderdeel}
          onChange={(e) => onChange({ ...waarde, onderdeel: e.target.value })}
        />
        <datalist id={lijstId}>
          {onderdelen.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      </div>
      <div className="admin-field" style={{ marginBottom: 0 }}>
        <label htmlFor={`${idPrefix}-meetdatum`}>Meetdatum</label>
        <input
          id={`${idPrefix}-meetdatum`}
          type="date"
          required
          disabled={meetdatumUitgeschakeld}
          value={waarde.meetdatum}
          onChange={(e) => onChange({ ...waarde, meetdatum: e.target.value })}
        />
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
