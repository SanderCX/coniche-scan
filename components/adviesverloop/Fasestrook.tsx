"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { FaseVoortgang, faseVoortgang, metingNaamInTraject, stapTekst } from "@/lib/advies";
import { zetFaseOverslaan, zetUseCaseNv } from "@/lib/db";
import { maandJaar, meetdatumVan, toonMeetdatum } from "@/lib/metingen";
import type { AdviesCatalogus, Adviesverloop, ScanUitvoering, UseCase } from "@/lib/types";

/**
 * De fasestrook (`adviesverloop.md`, De fasestrook): Onder de nav, blijft bij scrollen in beeld. Links het blok Scan met de peilmeting of de
 * gekoppelde Metingen, dan de zes fasen met een balk, een nummercirkel, de korte naam en de telling. Een klik op een fase opent een
 * paneel met de stappen van de fase en de volgende stap. Een fase kan worden overgeslagen en een stap niet van toepassing verklaard
 * (`adviesverloop.md`, Overslaan en niet van toepassing): Die tellen dan niet mee.
 */
export function Fasestrook({
  organisatieId,
  adviesverloop,
  catalogus,
  gekoppeld,
  peil,
  kanWijzigen,
  onPeilmeting,
  onKoppelen,
  onKiesUseCase,
}: {
  organisatieId: string;
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
  const [fout, setFout] = useState<string | null>(null);
  const geopend = voortgang.find((v) => v.fase.id === open) ?? null;

  const peilDatum = peil ? meetdatumVan(peil) : null;
  const scanSub = !peil
    ? "Nog geen afgeronde scans"
    : gekoppeld.length > 1
      ? `${gekoppeld.length} Metingen${peilDatum ? ` · peil ${maandJaar(peilDatum)}` : ""}`
      : `${metingNaamInTraject(adviesverloop, peil)}${peilDatum ? ` ${maandJaar(peilDatum)}` : ""} · afgerond`;

  const meld = (r: { ok: boolean; reden?: string }) => setFout(r.ok ? null : (r.reden ?? "Dat kan niet."));

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
              setFout(null);
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
              <p className="adv-sub">{geopend.overgeslagen ? "Deze fase telt niet mee." : telTekst(geopend)}</p>
            </div>
            {geopend.overgeslagen ? (
              <p className="fasepaneel-leeg">De fase is overgeslagen. De stappen tellen niet mee in de voortgang.</p>
            ) : (
              <div>
                {geopend.gedaan === 0 && <p className="fasepaneel-leeg">Hier is nog niets gedaan</p>}
                <ul className="fasepaneel-stappen fasepaneel-stappen--lijst">
                  {geopend.useCases.map(({ useCase, stap, nv }) => (
                    <li key={useCase.id} className={`fasepaneel-stap ${nv ? "fasepaneel-stap--nv" : ""}`}>
                      <span className={`stap-bol ${stap ? "stap-bol--klaar" : ""} ${nv ? "stap-bol--nv" : ""}`} aria-hidden="true" />
                      <span className="fasepaneel-stap-tekst">
                        <strong>{useCase.titel}</strong>
                        {stap && (
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
                        )}
                        {nv && <span className="text-ink-s">Niet van toepassing</span>}
                        <span className="stap-code">{useCase.id}</span>
                      </span>
                      {!stap && (
                        <button
                          type="button"
                          className="tekstknop"
                          disabled={!kanWijzigen}
                          onClick={() => meld(zetUseCaseNv(organisatieId, adviesverloop.id, useCase.id, !nv))}
                        >
                          {nv ? "Weer meenemen" : "Niet van toepassing"}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="fasepaneel-volgende">
              {!geopend.overgeslagen && geopend.volgende ? (
                <>
                  <p className="eyebrow">Volgende stap</p>
                  <button type="button" className="btn btn-or btn-compact" disabled={!kanWijzigen} onClick={() => onKiesUseCase(geopend.volgende!)}>
                    {geopend.volgende.titel}
                  </button>
                </>
              ) : (
                !geopend.overgeslagen && <p className="fasepaneel-leeg">{geopend.totaal === 0 ? "Deze fase heeft geen stappen die meetellen." : "Alle stappen van deze fase zijn gedaan."}</p>
              )}
              {fout && (
                <p className="admin-notice" role="alert">
                  {fout}
                </p>
              )}
              <div className="adv-acties">
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={!kanWijzigen}
                  onClick={() => meld(zetFaseOverslaan(organisatieId, adviesverloop.id, geopend.fase.id, !geopend.overgeslagen))}
                >
                  {geopend.overgeslagen ? "Fase weer meenemen" : "Fase overslaan"}
                </button>
                <button type="button" className="btn btn-outline btn-compact" onClick={() => setOpen(null)}>
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** "2 van 3 stappen gedaan · 1 niet van toepassing" (`adviesverloop.md`, Tellingen). */
function telTekst(v: FaseVoortgang): string {
  if (v.alleNv) return "Alle stappen zijn niet van toepassing";
  const gedaan = `${v.gedaan} van ${v.totaal} ${v.totaal === 1 ? "stap" : "stappen"} gedaan`;
  return v.nv > 0 ? `${gedaan} · ${v.nv} niet van toepassing` : gedaan;
}

/** De telling onder de naam van een fase in de strook: "Overgeslagen", "n.v.t." of "{gedaan} van {totaal}". */
export function faseTelling(v: FaseVoortgang): string {
  if (v.overgeslagen) return "Overgeslagen";
  if (v.alleNv) return "n.v.t.";
  return `${v.gedaan} van ${v.totaal}`;
}

function FaseKnop({ v, open, onKlik }: { v: FaseVoortgang; open: boolean; onKlik: () => void }) {
  const aandeel = v.overgeslagen || v.totaal === 0 ? 0 : Math.round((v.gedaan / v.totaal) * 100);
  return (
    <button
      type="button"
      className={`fase ${v.klaar ? "fase--klaar" : ""} ${v.huidig ? "fase--huidig" : ""} ${v.overgeslagen ? "fase--overgeslagen" : ""}`}
      aria-expanded={open}
      onClick={onKlik}
    >
      <span className="fase-cirkel" aria-hidden="true">
        {v.klaar ? "✓" : v.fase.volgorde}
      </span>
      <span className="fase-tekst">
        <span className="fase-naam">{v.fase.korteNaam}</span>
        <span className="fase-telling">{faseTelling(v)}</span>
      </span>
      <span className="fase-balk" aria-hidden="true">
        <span style={{ width: `${aandeel}%` }} />
      </span>
    </button>
  );
}

/** De strook in klein formaat in het Meting-overzicht (`beheerpagina.md`, punt 5, Adviesverloop): Cirkels en korte namen, zonder uitklappaneel. */
export function FasestrookKlein({
  catalogus,
  adviesverloop,
}: {
  catalogus: AdviesCatalogus;
  adviesverloop: Pick<Adviesverloop, "stappen"> & Partial<Pick<Adviesverloop, "nvFaseIds" | "nvUseCaseIds">>;
}) {
  return (
    <ol className="fasestrook-klein" aria-label="Fasen van het adviesverloop">
      {faseVoortgang(catalogus, adviesverloop).map((v) => (
        <li key={v.fase.id} className={`${v.klaar ? "fase--klaar" : ""} ${v.huidig ? "fase--huidig" : ""} ${v.overgeslagen ? "fase--overgeslagen" : ""}`}>
          <span className="fase-cirkel" aria-hidden="true">
            {v.klaar ? "✓" : v.fase.volgorde}
          </span>
          {v.fase.korteNaam}
          <span className="fase-telling">{faseTelling(v)}</span>
        </li>
      ))}
    </ol>
  );
}
