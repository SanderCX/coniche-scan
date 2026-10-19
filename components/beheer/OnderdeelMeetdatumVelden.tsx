"use client";

import { useState } from "react";
import { STANDAARD_ONDERDEEL, genereerLabel, isGeldigeDatum, toonMeetdatum } from "@/lib/metingen";
import { ONDERDEEL_NAAM_MAX, controleerOnderdeelNaam, isHeleOrganisatie, onderdelenOpAlfabet, vindOnderdeel } from "@/lib/onderdelen";
import { Organisatie } from "@/lib/types";
import { InfoIcoon } from "@/components/InfoIcoon";

/**
 * De twee velden die een Meting bepalen naast het Assessment: Onderdeel en Meetdatum (`beheerpagina.md`, punt 5, Wat je
 * invult). Een label is er niet om in te vullen: Onder de velden staat alleen ter controle wat de naam wordt ("Wordt:
 * Zuid-Nederland Zakelijk | okt 2026", `datamodel.md`, Naam van een Meting). Eén component voor een Meting plannen, Wijzigen
 * en "Scans samenbrengen".
 */
export interface OnderdeelMeetdatumWaarde {
  /** De naam van het Onderdeel, "Hele organisatie" voor de standaard. Bij `nieuw` de ingetypte naam van een nieuw Onderdeel. */
  onderdeel: string;
  /**
   * "Nieuw onderdeel…" is gekozen: `onderdeel` is de ingetypte naam en nog geen Onderdeel. Het Onderdeel ontstaat pas bij het opslaan
   * van het formulier (`datamodel.md`, Onderdeel, Aanmaken). Een lege naam laat opslaan niet toe (`onderdeelFout`).
   */
  nieuw?: boolean;
  /** `JJJJ-MM-DD`, of een lege tekst zolang er geen datum is gekozen. */
  meetdatum: string;
}

/** De beginwaarde: "Hele organisatie" en een lege meetdatum, zodat de gebruiker bewust een datum kiest. */
export function beginWaarde(onderdeel = STANDAARD_ONDERDEEL, meetdatum = ""): OnderdeelMeetdatumWaarde {
  return { onderdeel, meetdatum };
}

/**
 * Is het veld in de stand "Nieuw onderdeel…"? Ook als de naam geen bestaand Onderdeel is, bijvoorbeeld het voorstel uit het label bij
 * "Scans samenbrengen": Dan staat "Nieuw onderdeel…" met de naam ingevuld (`datamodel.md`, Onderdeel uit het label voorstellen).
 */
export function isNieuwOnderdeel(organisatie: Pick<Organisatie, "onderdelen">, w: OnderdeelMeetdatumWaarde): boolean {
  if (w.nieuw) return true;
  return !isHeleOrganisatie(w.onderdeel) && !vindOnderdeel(organisatie, w.onderdeel);
}

/**
 * De melding bij het veld Onderdeel, of `null` als de waarde klopt. Alleen bij "Nieuw onderdeel…" kan er iets misgaan: Een lege of te
 * lange naam. Een naam die al bestaat kiest dat Onderdeel, en "Hele organisatie" kiest de standaard (`beheerpagina.md`, punt 5,
 * Het veld Onderdeel). Elk formulier met dit veld laat opslaan niet toe zolang er een melding is.
 */
export function onderdeelFout(organisatie: Pick<Organisatie, "onderdelen">, w: OnderdeelMeetdatumWaarde): string | null {
  if (!isNieuwOnderdeel(organisatie, w)) return null;
  const c = controleerOnderdeelNaam(organisatie, w.onderdeel);
  return c.ok ? null : c.reden;
}

/** De naam die het Onderdeel krijgt bij het opslaan: De spelling van een bestaand Onderdeel wint van wat is ingetypt. */
export function onderdeelNaamVoorOpslaan(organisatie: Pick<Organisatie, "onderdelen">, w: OnderdeelMeetdatumWaarde): string {
  const c = controleerOnderdeelNaam(organisatie, w.onderdeel);
  return c.ok ? c.naam : STANDAARD_ONDERDEEL;
}

/** De naam die de Meting krijgt, of een lege tekst zolang er geen meetdatum is gekozen. */
export function metingNaam(w: OnderdeelMeetdatumWaarde): string {
  return isGeldigeDatum(w.meetdatum) ? genereerLabel(w.onderdeel.trim() || STANDAARD_ONDERDEEL, w.meetdatum) : "";
}

/**
 * Het veld Onderdeel (`beheerpagina.md`, punt 5, Het veld Onderdeel): Een keuzelijst met "Hele organisatie", de Onderdelen van de
 * Organisatie op alfabet en onderaan "Nieuw onderdeel…". Bij "Nieuw onderdeel…" wordt het een tekstveld met een kruisje dat
 * terugkeert naar de lijst. Het Onderdeel ontstaat pas bij het opslaan van het formulier. Overal hetzelfde veld.
 */
export function OnderdeelVeld({
  organisatie,
  waarde,
  onChange,
  idPrefix = "meting",
  compact = false,
  ariaLabel,
}: {
  organisatie: Pick<Organisatie, "onderdelen">;
  waarde: { onderdeel: string; nieuw?: boolean };
  onChange: (waarde: { onderdeel: string; nieuw?: boolean }) => void;
  idPrefix?: string;
  /** In een tabelcel: Zonder label en Info-icoon, met `ariaLabel` voor schermlezers. */
  compact?: boolean;
  ariaLabel?: string;
}) {
  const lijst = onderdelenOpAlfabet(organisatie);
  const [aangeraakt, setAangeraakt] = useState(false);
  // Alleen na een keuze van "Nieuw onderdeel…" krijgt het tekstveld de focus, niet als de naam al zo binnenkomt (een voorstel, de import).
  const [focusNaKeuze, setFocusNaKeuze] = useState(false);
  const w = { onderdeel: waarde.onderdeel, nieuw: waarde.nieuw, meetdatum: "" };
  const fout = aangeraakt ? onderdeelFout(organisatie, w) : null;
  // Wat de keuzelijst toont: Hele organisatie, een bestaand Onderdeel of "Nieuw onderdeel…". Een ingetypte naam die al bestaat, kiest
  // dat Onderdeel zodra de gebruiker teruggaat naar de lijst.
  const nieuwModus = isNieuwOnderdeel(organisatie, w);
  const gekozen = isHeleOrganisatie(waarde.onderdeel) ? STANDAARD_ONDERDEEL : (vindOnderdeel(organisatie, waarde.onderdeel)?.naam ?? waarde.onderdeel);
  const NIEUW = "__nieuw__";
  const labelStijl = { display: "flex", alignItems: "center", gap: "0.35rem", minHeight: "1.25rem" } as const;
  return (
    <div className="admin-field" style={{ marginBottom: 0 }}>
      {!compact && (
        <label htmlFor={`${idPrefix}-onderdeel`} style={labelStijl}>
          Onderdeel
          <InfoIcoon sleutel="info.metingOnderdeel" />
        </label>
      )}
      {nieuwModus ? (
        <div className="onderdeel-nieuw">
          <input
            id={`${idPrefix}-onderdeel`}
            type="text"
            placeholder="Naam van het onderdeel"
            aria-label={ariaLabel}
            maxLength={ONDERDEEL_NAAM_MAX}
            autoFocus={focusNaKeuze}
            value={waarde.onderdeel}
            aria-invalid={fout ? true : undefined}
            onChange={(e) => {
              setAangeraakt(true);
              onChange({ onderdeel: e.target.value, nieuw: true });
            }}
            onBlur={() => setAangeraakt(true)}
          />
          <button
            type="button"
            className="onderdeel-nieuw-terug"
            aria-label="Terug naar de lijst met onderdelen"
            onClick={() => {
              setAangeraakt(false);
              // Een ingetypte naam die al bestaat (of de hele organisatie) kiest die in de lijst, anders de standaard.
              const c = controleerOnderdeelNaam(organisatie, waarde.onderdeel);
              onChange({ onderdeel: c.ok ? c.naam : STANDAARD_ONDERDEEL, nieuw: false });
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <select
          id={`${idPrefix}-onderdeel`}
          aria-label={ariaLabel}
          value={gekozen}
          onChange={(e) => {
            if (e.target.value === NIEUW) {
              setFocusNaKeuze(true);
              onChange({ onderdeel: "", nieuw: true });
            }
            else onChange({ onderdeel: e.target.value, nieuw: false });
          }}
        >
          <option value={STANDAARD_ONDERDEEL}>{STANDAARD_ONDERDEEL}</option>
          {lijst.map((o) => (
            <option key={o.id} value={o.naam}>
              {o.naam}
            </option>
          ))}
          <option disabled>──────────</option>
          <option value={NIEUW}>Nieuw onderdeel…</option>
        </select>
      )}
      {fout && (
        <span className="text-xs" style={{ color: "var(--stat-red)" }} role="alert">
          {fout}
        </span>
      )}
    </div>
  );
}

export function OnderdeelMeetdatumVelden({
  organisatie,
  waarde,
  onChange,
  idPrefix = "meting",
  inRij = false,
  meetdatumUitgeschakeld = false,
}: {
  organisatie: Pick<Organisatie, "scanUitvoeringen" | "onderdelen">;
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
  const naam = metingNaam(waarde);
  const labelStijl = { display: "flex", alignItems: "center", gap: "0.35rem", minHeight: "1.25rem" } as const;
  const velden = (
    <>
      <OnderdeelVeld
        organisatie={organisatie}
        waarde={waarde}
        onChange={(o) => onChange({ ...waarde, ...o })}
        idPrefix={idPrefix}
      />
      {meetdatumUitgeschakeld ? (
        // Een samengestelde Meting: De datum is alleen-lezen en volgt de nieuwste Meting in de samenstelling
        // (`datamodel.md`, Samengestelde Meting). Geen invoerveld, want er is niets in te vullen.
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label style={labelStijl}>Meetdatum</label>
          <p style={{ margin: 0, minHeight: "var(--control-h)", display: "flex", alignItems: "center" }}>
            <span className={isGeldigeDatum(waarde.meetdatum) ? undefined : "text-ink-s"}>{toonMeetdatum(waarde.meetdatum)}</span>
          </p>
          <span className="text-xs text-ink-s">Volgt de nieuwste Meting in de samenstelling</span>
        </div>
      ) : (
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label htmlFor={`${idPrefix}-meetdatum`} style={labelStijl}>
            Meetdatum
          </label>
          <input
            id={`${idPrefix}-meetdatum`}
            type="date"
            required
            value={waarde.meetdatum}
            onChange={(e) => onChange({ ...waarde, meetdatum: e.target.value })}
          />
        </div>
      )}
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
