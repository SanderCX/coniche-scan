"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { FaseVoortgang, faseVoortgang, metingNaamInTraject, stapTekst } from "@/lib/advies";
import { maandJaar, meetdatumVan, toonMeetdatum } from "@/lib/metingen";
import type { AdviesCatalogus, Adviesverloop, ScanUitvoering, UseCase } from "@/lib/types";

/**
 * De fasestrook (`adviesverloop.md`, De fasestrook): Onder de nav, blijft bij scrollen in beeld. Links het blok Scan met de peilmeting of de
 * gekoppelde Metingen, dan de zes fasen met een balk, een nummercirkel, de korte naam en de telling. Een klik op een fase opent een
 * paneel met de gedane stappen en de volgende stap.
 */
export function Fasestrook({
  adviesverloop,
  catalogus,
  gekoppeld,
  peil,
  kanWijzigen,
  onPeilmeting,
  onKoppelen,
  onKiesUseCase,
}: {
  adviesverloop: Adviesverloop;
  catalogus: AdviesCatalogus;
  gekoppeld: ScanUitvoering[];
  peil: ScanUitvoering | null;
  kanWijzigen: boolean;
  onPeilmeting: () => void;
  onKoppelen: () => void;
  onKiesUseCase: (useCase: UseCase) => void;
}) {
  const voortgang = faseVoortgang(catalogus, adviesverloop);
  const [open, setOpen] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const geopend = voortgang.find((v) => v.fase.id === open) ?? null;

  const peilDatum = peil ? meetdatumVan(peil) : null;
  const scanSub = !peil
    ? "Nog geen afgeronde scans"
    : gekoppeld.length > 1
      ? `${gekoppeld.length} Metingen${peilDatum ? ` · peil ${maandJaar(peilDatum)}` : ""}`
      : `${metingNaamInTraject(adviesverloop, peil)}${peilDatum ? ` ${maandJaar(peilDatum)}` : ""} · afgerond`;

  return (
    <div className="fasestrook-kader">
      <div className="fasestrook">
        <button
          type="button"
          className="fasestrook-scan"
          aria-expanded={scanOpen}
          onClick={() => {
            setScanOpen(!scanOpen);
            setOpen(null);
          }}
        >
          <strong>Scan</strong>
          <span>{scanSub}</span>
        </button>
        <span className="fasestrook-pijl" aria-hidden="true">
          →
        </span>
        {voortgang.map((v) => (
          <FaseKnop
            key={v.fase.id}
            v={v}
            open={open === v.fase.id}
            onKlik={() => {
              setOpen(open === v.fase.id ? null : v.fase.id);
              setScanOpen(false);
            }}
          />
        ))}
      </div>
      {scanOpen && (
        <div className="fasepaneel">
          <div className="fasepaneel-inhoud" style={{ gridTemplateColumns: "1fr auto" }}>
            <ul className="fasepaneel-stappen">
              {gekoppeld.map((m) => (
                <li key={m.id}>
                  <span>
                    <strong>{metingNaamInTraject(adviesverloop, m)}</strong> · {toonMeetdatum(meetdatumVan(m))}
                  </span>
                  <Link className="text-sm" href={`/beheer/rapportage/${m.id}`}>
                    Resultaten bekijken
                  </Link>
                </li>
              ))}
            </ul>
            <div className="adv-acties" style={{ alignSelf: "start" }}>
              <button type="button" className="btn btn-outline btn-compact" disabled={!kanWijzigen} onClick={onPeilmeting}>
                Peilmeting kiezen
              </button>
              <button type="button" className="btn btn-outline btn-compact" disabled={!kanWijzigen} onClick={onKoppelen}>
                Metingen koppelen
              </button>
              <button type="button" className="btn btn-outline btn-compact" onClick={() => setScanOpen(false)}>
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
      {geopend && (
        <div className="fasepaneel">
          <div className="fasepaneel-inhoud">
            <div>
              <p className="fasepaneel-kop">
                {geopend.fase.naam}
                <InfoIcoon sleutel="info.adviesverloopStappen" />
              </p>
              <p className="adv-sub">
                {geopend.gedaan} van {geopend.totaal} gedaan
              </p>
            </div>
            {geopend.stappen.length === 0 ? (
              <p className="fasepaneel-leeg">Hier is nog niets gedaan</p>
            ) : (
              <ul className="fasepaneel-stappen">
                {geopend.stappen.map(({ stap, useCase }) => (
                  <li key={stap.id}>
                    <strong>{useCase?.titel ?? stap.useCaseId}</strong>
                    <span className="text-ink-s">
                      {stapTekst(stap)}
                      {stap.link && (
                        <>
                          {" · "}
                          <a href={stap.link} target="_blank" rel="noreferrer">
                            Document
                          </a>
                        </>
                      )}
                    </span>
                    <span className="stap-code">{stap.useCaseId}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="fasepaneel-volgende">
              {geopend.volgende ? (
                <>
                  <p className="eyebrow">Volgende stap</p>
                  <button type="button" className="btn btn-or btn-compact" disabled={!kanWijzigen} onClick={() => onKiesUseCase(geopend.volgende!)}>
                    {geopend.volgende.titel}
                  </button>
                </>
              ) : (
                <p className="fasepaneel-leeg">{geopend.totaal === 0 ? "Deze fase heeft geen stappen." : "Alle stappen van deze fase zijn gedaan."}</p>
              )}
              <button type="button" className="btn btn-outline btn-compact" onClick={() => setOpen(null)}>
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FaseKnop({ v, open, onKlik }: { v: FaseVoortgang; open: boolean; onKlik: () => void }) {
  const aandeel = v.totaal === 0 ? 0 : Math.round((v.gedaan / v.totaal) * 100);
  return (
    <button type="button" className={`fase ${v.klaar ? "fase--klaar" : ""} ${v.huidig ? "fase--huidig" : ""}`} aria-expanded={open} onClick={onKlik}>
      <span className="fase-cirkel" aria-hidden="true">
        {v.klaar ? "✓" : v.fase.volgorde}
      </span>
      <span className="fase-tekst">
        <span className="fase-naam">{v.fase.korteNaam}</span>
        <span className="fase-telling">
          {v.gedaan} van {v.totaal}
        </span>
      </span>
      <span className="fase-balk" aria-hidden="true">
        <span style={{ width: `${aandeel}%` }} />
      </span>
    </button>
  );
}

/** De strook in klein formaat in het Meting-overzicht (`beheerpagina.md`, punt 5, Adviesverloop): Cirkels en korte namen, zonder uitklappaneel. */
export function FasestrookKlein({ catalogus, adviesverloop }: { catalogus: AdviesCatalogus; adviesverloop: Pick<Adviesverloop, "stappen"> }) {
  return (
    <ol className="fasestrook-klein" aria-label="Fasen van het adviesverloop">
      {faseVoortgang(catalogus, adviesverloop).map((v) => (
        <li key={v.fase.id} className={`${v.klaar ? "fase--klaar" : ""} ${v.huidig ? "fase--huidig" : ""}`}>
          <span className="fase-cirkel" aria-hidden="true">
            {v.klaar ? "✓" : v.fase.volgorde}
          </span>
          {v.fase.korteNaam}
          <span className="fase-telling">
            {v.gedaan} van {v.totaal}
          </span>
        </li>
      ))}
    </ol>
  );
}
