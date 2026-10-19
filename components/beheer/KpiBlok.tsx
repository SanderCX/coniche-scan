"use client";

import { Fragment, useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { KpiInvullenModal } from "@/components/beheer/KpiInvullenModal";
import { OnderdeelToevoegenModal, OnderdeelWijzigenModal } from "@/components/beheer/OnderdeelModals";
import { useInstellingen } from "@/lib/instellingen-store";
import { kanalenMetWaarde, kpiIngevuldTelling, kpiMagOpPlek, kpiWaardeVan } from "@/lib/kpi";
import { onderdelenOpAlfabet } from "@/lib/onderdelen";
import { Organisatie } from "@/lib/types";

const getalFormaat = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 6 });

/**
 * Het blok KPI's in het organisatie-detail (`beheerpagina.md`, punt 4, KPI's; `datamodel.md`, KPI's en kanalen): Een eigen kaart onder
 * de Kenmerken, met de KPI's in de rijen en de kolom Algemeen en de Onderdelen op alfabet. Een KPI met waarden per kanaal klapt open
 * tot een rij per kanaal. "+ Onderdeel toevoegen" en het potlood bij een Onderdeel openen een basismodal, "KPI's invullen" een brede
 * modal. Het Bewerkslot van de Organisatie geldt voor de hele pagina (`MetBewerkslot`).
 */
export function KpiBlok({ organisatie }: { organisatie: Organisatie }) {
  const { kpiDefinities, kanalen } = useInstellingen();
  const kpis = [...kpiDefinities].sort((a, b) => a.volgorde - b.volgorde);
  const onderdelen = onderdelenOpAlfabet(organisatie);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{ soort: "toevoegen" } | { soort: "wijzigen"; onderdeelId: string } | { soort: "invullen" } | null>(null);

  // De kolommen: Algemeen en dan de Onderdelen.
  const kolommen = [{ id: null as string | null, naam: "Algemeen" }, ...onderdelen.map((o) => ({ id: o.id as string | null, naam: o.naam }))];
  const wijzigOnderdeel = modal?.soort === "wijzigen" ? onderdelen.find((o) => o.id === modal.onderdeelId) : undefined;

  const cel = (kpiId: string, onderdeelId: string | null, kanaalId: string | null) => {
    const kpi = kpis.find((k) => k.id === kpiId)!;
    if (!kpiMagOpPlek(kpi, { onderdeelId, kanaalId })) return <span className="kpi-nvt">n.v.t.</span>;
    const w = kpiWaardeVan(organisatie, kpiId, { onderdeelId, kanaalId });
    return w === null ? <span className="kpi-leeg">–</span> : getalFormaat.format(w);
  };

  return (
    <section className="kpi-blok" aria-label="KPI's">
      <div className="kpi-kop">
        <div className="titel-rij">
          <h2 style={{ margin: 0 }}>KPI&apos;s</h2>
          <InfoIcoon sleutel="info.kpiBlok" />
        </div>
        <span className="knoppenrij">
          <button type="button" className="btn btn-or btn-compact" onClick={() => setModal({ soort: "toevoegen" })}>
            + Onderdeel toevoegen
          </button>
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setModal({ soort: "invullen" })}>
            KPI&apos;s invullen
          </button>
        </span>
      </div>

      <div className="kpi-tabel-wrap">
        <table className="kpi-tabel">
          <thead>
            <tr>
              <th className="kpi-eerste">KPI</th>
              {kolommen.map((k) => {
                const t = kpiIngevuldTelling(organisatie, kpis, k.id);
                const onderdeel = k.id === null ? undefined : onderdelen.find((o) => o.id === k.id);
                return (
                  <th key={k.id ?? "algemeen"} className={k.id === null ? "kpi-algemeen" : undefined}>
                    <span className="kpi-kolomnaam">
                      <span title={k.naam}>{k.naam}</span>
                      {onderdeel && (
                        <button
                          type="button"
                          className="vk-potlood"
                          aria-label="Onderdeel wijzigen"
                          title="Onderdeel wijzigen"
                          onClick={() => setModal({ soort: "wijzigen", onderdeelId: onderdeel.id })}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </span>
                    <span className="kpi-kolomsub">
                      {t.n} van {t.m} ingevuld
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi) => {
              // Alle kanalen met minstens één waarde bij een plek in de tabel, voor deze KPI.
              const metWaarden = kpi.perKanaal
                ? kanalen
                    .filter((k) => kolommen.some((c) => kanalenMetWaarde(organisatie, kanalen, c.id, kpi.id).some((m) => m.id === k.id)))
                    .sort((a, b) => a.volgorde - b.volgorde)
                : [];
              const uitgeklapt = open.has(kpi.id);
              return (
                <Fragment key={kpi.id}>
                  <tr>
                    <th scope="row" className="kpi-eerste">
                      {metWaarden.length > 0 ? (
                        <button
                          type="button"
                          className="kpi-chevron"
                          aria-expanded={uitgeklapt}
                          aria-label={`${kpi.naam}: ${metWaarden.length} ${metWaarden.length === 1 ? "kanaal" : "kanalen"} ${uitgeklapt ? "inklappen" : "uitklappen"}`}
                          onClick={() => setOpen((huidig) => {
                            const nieuw = new Set(huidig);
                            if (nieuw.has(kpi.id)) nieuw.delete(kpi.id);
                            else nieuw.add(kpi.id);
                            return nieuw;
                          })}
                        >
                          <span aria-hidden="true">{uitgeklapt ? "▾" : "▸"}</span>
                        </button>
                      ) : (
                        <span className="kpi-chevron-leeg" aria-hidden="true" />
                      )}
                      <span className="kpi-naam">
                        <span>{kpi.naam}</span>
                        {kpi.eenheid && kpi.eenheid !== "aantal" && <span className="kpi-eenheid">{kpi.eenheid}</span>}
                      </span>
                      {metWaarden.length > 0 && (
                        <span className="kpi-kanalen-aantal">
                          {metWaarden.length} {metWaarden.length === 1 ? "kanaal" : "kanalen"}
                        </span>
                      )}
                    </th>
                    {kolommen.map((k) => (
                      <td key={k.id ?? "algemeen"} className={k.id === null ? "kpi-algemeen" : undefined}>
                        {cel(kpi.id, k.id, null)}
                      </td>
                    ))}
                  </tr>
                  {uitgeklapt &&
                    metWaarden.map((kanaal) => (
                      <tr key={`${kpi.id}-${kanaal.id}`} className="kpi-kanaalrij">
                        <th scope="row" className="kpi-eerste kpi-kanaalnaam">
                          {kanaal.naam}
                        </th>
                        {kolommen.map((k) => (
                          <td key={k.id ?? "algemeen"} className={k.id === null ? "kpi-algemeen" : undefined}>
                            {cel(kpi.id, k.id, kanaal.id)}
                          </td>
                        ))}
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {onderdelen.length === 0 && (
        <p className="text-sm text-ink-s" style={{ margin: "var(--sp-3) 0 0" }}>
          Er zijn nog geen onderdelen. De waarden gelden voor de hele organisatie en voor alle kanalen samen.
        </p>
      )}

      {modal?.soort === "toevoegen" && <OnderdeelToevoegenModal organisatie={organisatie} onSluit={() => setModal(null)} />}
      {modal?.soort === "wijzigen" && wijzigOnderdeel && (
        <OnderdeelWijzigenModal organisatie={organisatie} onderdeel={wijzigOnderdeel} onSluit={() => setModal(null)} />
      )}
      {modal?.soort === "invullen" && <KpiInvullenModal organisatie={organisatie} onSluit={() => setModal(null)} />}
    </section>
  );
}
