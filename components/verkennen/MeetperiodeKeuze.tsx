"use client";

import { InfoIcoon } from "@/components/InfoIcoon";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { Meetperiode } from "@/lib/types";
import { geldigeMeetperiode, meetperiodeTekst } from "@/lib/verkennen";

/** De invoer van de keuze: De modus en de twee datums, ook als ze nog niet (allebei) gevuld zijn. */
export interface PeriodeInvoer {
  modus: "recent" | "periode";
  van: string;
  totEnMet: string;
}

export const LEGE_PERIODE_INVOER: PeriodeInvoer = { modus: "recent", van: "", totEnMet: "" };

/** De periode die uit de invoer volgt: Alleen bij de modus Periode met twee bruikbare datums, anders telt de meest recente Meting. */
export function periodeVanInvoer(invoer: PeriodeInvoer): Meetperiode | null {
  return invoer.modus === "periode" && geldigeMeetperiode(invoer) ? { van: invoer.van, totEnMet: invoer.totEnMet } : null;
}

export function invoerVanPeriode(periode: Meetperiode | null | undefined): PeriodeInvoer {
  return periode ? { modus: "periode", van: periode.van, totEnMet: periode.totEnMet } : LEGE_PERIODE_INVOER;
}

/**
 * De keuze Meetperiode (`visualisatie-verkennen.md`, Meetperiode): Een pilvormige groep met Meest recente en Periode, bij Periode
 * twee datumvelden. Eronder staat wat er telt en hoeveel er afvallen. Staat in Verkennen en in het wijzigscherm van een opgeslagen
 * verkenning.
 */
export function MeetperiodeKeuze({
  invoer,
  onChange,
  eenheidWoord,
  buitenPeriode,
  idVoorvoegsel = "verkennen",
}: {
  invoer: PeriodeInvoer;
  onChange: (invoer: PeriodeInvoer) => void;
  eenheidWoord: string;
  /** Het aantal Organisaties (of onderdelen) met een bruikbare Meting maar niet in de periode. */
  buitenPeriode: number;
  idVoorvoegsel?: string;
}) {
  const periode = periodeVanInvoer(invoer);
  const omgekeerd = invoer.modus === "periode" && !!invoer.van && !!invoer.totEnMet && invoer.van > invoer.totEnMet;
  const per = eenheidWoord === "onderdelen" ? "Per onderdeel" : "Per Organisatie";
  let regel: string;
  if (invoer.modus === "recent") regel = `${per} telt de meest recente Meting.`;
  else if (periode)
    regel = `${per} telt de laatste Meting tussen ${meetperiodeTekst(periode).replace(" tot en met ", " en ")}.${
      buitenPeriode > 0
        ? ` ${buitenPeriode} ${buitenPeriode === 1 && eenheidWoord !== "onderdelen" ? "Organisatie heeft" : `${eenheidWoord} hebben`} geen Meting in deze periode en ${buitenPeriode === 1 ? "doet" : "doen"} niet mee.`
        : ""
    }`;
  else regel = "Vul beide datums in. Zolang de periode niet compleet is, telt de meest recente Meting.";

  return (
    <div className="vk-eenheid vk-eenheid--periode">
      <span className="text-sm text-ink-m">Meetperiode</span>
      <InfoIcoon naastVeld sleutel="info.verkennenMeetperiode" />
      <WeergaveWissel<"recent" | "periode">
        ariaLabel="Meetperiode"
        opties={[
          { waarde: "recent", label: "Meest recente" },
          { waarde: "periode", label: "Periode" },
        ]}
        waarde={invoer.modus}
        onChange={(modus) => onChange({ ...invoer, modus })}
      />
      {invoer.modus === "periode" && (
        <span className="vk-periode-velden">
          <span className="admin-field">
            <input
              id={`${idVoorvoegsel}-periode-van`}
              type="date"
              aria-label="Meetperiode van"
              value={invoer.van}
              max={invoer.totEnMet || undefined}
              onChange={(e) => onChange({ ...invoer, van: e.target.value })}
            />
          </span>
          <span className="text-sm text-ink-m">tot en met</span>
          <span className="admin-field">
            <input
              id={`${idVoorvoegsel}-periode-tot`}
              type="date"
              aria-label="Meetperiode tot en met"
              value={invoer.totEnMet}
              min={invoer.van || undefined}
              onChange={(e) => onChange({ ...invoer, totEnMet: e.target.value })}
            />
          </span>
        </span>
      )}
      <p className="vk-periode-regel" role="status">
        {omgekeerd ? "De begindatum ligt na de einddatum." : regel}
      </p>
    </div>
  );
}
