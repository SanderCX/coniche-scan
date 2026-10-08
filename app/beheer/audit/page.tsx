"use client";

import { Suspense, useMemo, useState } from "react";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magGebruikersBeheren } from "@/lib/rechten";
import { useUrlParams } from "@/lib/beheer-url";
import { logAudit, ruimAuditOp, useAuditEvents, AuditEvent } from "@/lib/audit-store";
import { useInstellingen } from "@/lib/instellingen-store";
import { downloadTekstBestand } from "@/lib/csv-export";
import {
  ImportGroep,
  ImportStatus,
  PERIODE_LABEL,
  PERIODE_VOLGORDE,
  Periode,
  actorLabel,
  auditCsv,
  bouwImportGroepen,
  detailTekst,
  entiteitLabel,
  importGroepTekst,
  inPeriode,
  periodeBereik,
  typeLabel,
  typeVan,
} from "@/lib/audit-weergave";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { InfoIcoon } from "@/components/InfoIcoon";

const PER_PAGINA = 50;
const STATUS_LABEL: Record<ImportStatus, string> = { voltooid: "Voltooid", deels: "Deels", mislukt: "Mislukt" };

const nl = new Intl.NumberFormat("nl-NL");
const tijdFormat = new Intl.DateTimeFormat("nl-NL", { dateStyle: "short", timeStyle: "medium" });

type Rij = { soort: "gebeurtenis"; tijdstip: string; event: AuditEvent } | { soort: "import"; tijdstip: string; groep: ImportGroep };

/**
 * Audit-log (`beheerpagina.md`, punt 12): Alleen-lezen overzicht van wie wat deed, wanneer
 * en op welk record. Admin-only. Filters staan in de URL. Een import is één groepsregel.
 */
function AuditLogInhoud() {
  const gebruiker = useIngelogdeGebruiker();
  const events = useAuditEvents();
  const instellingen = useInstellingen();
  const { get, set } = useUrlParams();
  const [uitgeklapt, setUitgeklapt] = useState<Set<string>>(new Set());
  const [opruimenOpen, setOpruimenOpen] = useState(false);

  const periode = (get("periode", "7") as Periode) || "7";
  const van = periode === "aangepast" ? get("van") : periodeBereik(periode).van;
  const tot = periode === "aangepast" ? get("tot") : periodeBereik(periode).tot;
  const bereik = { van, tot };
  const filterActor = get("actor");
  const filterType = get("type");
  const filterStatus = get("status");
  const pagina = Math.max(1, Number(get("pagina", "1")) || 1);

  const gefilterd = (() => {
    const groepen = bouwImportGroepen(events);
    const importGroepIds = new Set(groepen.map((g) => g.groepId));
    const passeertActorEnType = (e: AuditEvent) =>
      (!filterActor || actorLabel(e) === filterActor) && (!filterType || typeVan(e.actie) === filterType);

    // Gebeurtenissen binnen de filters (losse gebeurtenissen, ook binnen ingeklapte groepen).
    const inFilter = events.filter((e) => inPeriode(e.tijdstip, van, tot) && passeertActorEnType(e) && !filterStatus);
    const rijen: Rij[] = [];
    let aantalGebeurtenissen = 0;

    // Een groep verschijnt zodra een van zijn gebeurtenissen in de periode valt.
    for (const groep of groepen) {
      const typeOk = !filterType || filterType === "import";
      const statusOk = !filterStatus || groep.status === filterStatus;
      const actorOk = !filterActor || groep.actor === filterActor;
      const inPeriodeOk = groep.gebeurtenissen.some((e) => inPeriode(e.tijdstip, van, tot));
      if (typeOk && statusOk && actorOk && inPeriodeOk) {
        rijen.push({ soort: "import", tijdstip: groep.tijdstip, groep });
        aantalGebeurtenissen += groep.gebeurtenissen.filter((e) => inPeriode(e.tijdstip, van, tot)).length;
      }
    }
    // Een statusfilter gaat alleen over imports.
    if (!filterStatus) {
      for (const e of inFilter) {
        if (e.groepId && importGroepIds.has(e.groepId)) continue;
        rijen.push({ soort: "gebeurtenis", tijdstip: e.tijdstip, event: e });
        aantalGebeurtenissen++;
      }
    }
    rijen.sort((a, b) => b.tijdstip.localeCompare(a.tijdstip));
    return { rijen, aantalGebeurtenissen };
  })();

  /** De gebeurtenissen die de export meeneemt: Alle pagina's, één rij per gebeurtenis, geen groepsregels. */
  function gefilterdeGebeurtenissen(): AuditEvent[] {
    const lijst: AuditEvent[] = [];
    for (const r of gefilterd.rijen) {
      if (r.soort === "gebeurtenis") lijst.push(r.event);
      else lijst.push(...r.groep.gebeurtenissen.filter((e) => inPeriode(e.tijdstip, van, tot)));
    }
    return lijst.sort((a, b) => b.tijdstip.localeCompare(a.tijdstip));
  }

  const actoren = useMemo(() => [...new Set(events.map(actorLabel))].sort(), [events]);
  const types = useMemo(() => [...new Set(events.map((e) => typeVan(e.actie)))].sort(), [events]);

  const bewaarGrens = useMemo(() => {
    if (instellingen.bewaarTermijnDagen === null) return null;
    const d = new Date();
    d.setDate(d.getDate() - instellingen.bewaarTermijnDagen);
    return d.toISOString();
  }, [instellingen.bewaarTermijnDagen]);
  const teOudAantal = bewaarGrens ? events.filter((e) => e.tijdstip < bewaarGrens).length : 0;

  if (!magGebruikersBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet de Audit-log.</p>
      </div>
    );
  }

  const aantalPaginas = Math.max(1, Math.ceil(gefilterd.rijen.length / PER_PAGINA));
  const zichtbaar = gefilterd.rijen.slice((pagina - 1) * PER_PAGINA, pagina * PER_PAGINA);
  const filtersActief = Boolean(filterActor || filterType || filterStatus);

  function kiesPeriode(p: Periode) {
    const b = periodeBereik(p);
    set({ periode: p, van: p === "aangepast" ? bereik.van : b.van || null, tot: p === "aangepast" ? bereik.tot : b.tot || null, pagina: null });
  }

  function volgendeGroteresBereik(): Periode | null {
    const i = PERIODE_VOLGORDE.indexOf(periode);
    return i >= 0 && i < PERIODE_VOLGORDE.length - 1 ? PERIODE_VOLGORDE[i + 1] : periode === "aangepast" ? "alles" : null;
  }

  function periodeTekst(): string {
    if (periode === "alles") return "Alle gebeurtenissen";
    if (periode === "vandaag") return "Vandaag";
    const datum = (s: string) => (s ? new Date(`${s}T00:00:00`).toLocaleDateString("nl-NL") : "…");
    return `${datum(bereik.van)} t/m ${datum(bereik.tot)}`;
  }

  function exporteer() {
    const lijst = gefilterdeGebeurtenissen();
    const datum = new Date().toISOString().slice(0, 10);
    downloadTekstBestand(auditCsv(lijst), `Audit-log export ${datum}.csv`, "text/csv;charset=utf-8");
    logAudit({
      actie: "auditlog.geexporteerd",
      entiteitType: "auditlog",
      entiteitId: "auditlog",
      details: {
        filters: { periode, van: bereik.van, tot: bereik.tot, actor: filterActor, type: filterType, status: filterStatus },
        aantalRijen: lijst.length,
      },
    });
  }

  function wissel(sleutel: string) {
    setUitgeklapt((vorige) => {
      const nieuw = new Set(vorige);
      if (nieuw.has(sleutel)) nieuw.delete(sleutel);
      else nieuw.add(sleutel);
      return nieuw;
    });
  }

  const groterBereik = volgendeGroteresBereik();

  return (
    <div className="admin-main admin-main--breed">
      <div className="titel-rij">
        <h1>Audit-log</h1>
        <InfoIcoon sleutel="info.auditLog" />
      </div>

      {bewaarGrens && teOudAantal > 0 && (
        <div className="admin-notice" style={{ marginTop: "1rem" }}>
          Er {teOudAantal === 1 ? "is 1 gebeurtenis" : `zijn ${nl.format(teOudAantal)} gebeurtenissen`} ouder dan de bewaartermijn (
          {instellingen.bewaarTermijnDagen} dagen). Ze blijven bestaan tot je ze bewust opruimt.{" "}
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setOpruimenOpen(true)}>
            Opruimen…
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Periode">
        {([...PERIODE_VOLGORDE, "aangepast"] as Periode[]).map((p) => (
          <button
            key={p}
            type="button"
            className={`btn btn-compact ${periode === p ? "btn-or" : "btn-outline"}`}
            aria-pressed={periode === p}
            onClick={() => kiesPeriode(p)}
          >
            {PERIODE_LABEL[p]}
          </button>
        ))}
      </div>

      <div className="filter-rij mt-4 mb-5 flex flex-wrap items-end gap-3">
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label>Vanaf</label>
          <input
            type="date"
            value={bereik.van}
            disabled={periode === "alles"}
            onChange={(e) => set({ periode: "aangepast", van: e.target.value || null, tot: bereik.tot || null, pagina: null })}
          />
        </div>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label>Tot</label>
          <input
            type="date"
            value={bereik.tot}
            disabled={periode === "alles"}
            onChange={(e) => set({ periode: "aangepast", tot: e.target.value || null, van: bereik.van || null, pagina: null })}
          />
        </div>
        <div className="admin-field" style={{ marginBottom: 0, minWidth: "12rem" }}>
          <label>Actor</label>
          <select value={filterActor} onChange={(e) => set({ actor: e.target.value || null, pagina: null })}>
            <option value="">Alle actoren</option>
            {actoren.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field" style={{ marginBottom: 0, minWidth: "10rem" }}>
          <label>Type</label>
          <select value={filterType} onChange={(e) => set({ type: e.target.value || null, status: null, pagina: null })}>
            <option value="">Alle typen</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {typeLabel(t)}
              </option>
            ))}
          </select>
        </div>
        {(filterType === "import" || filterStatus) && (
          <div className="admin-field" style={{ marginBottom: 0, minWidth: "9rem" }}>
            <label>Status import</label>
            <select value={filterStatus} onChange={(e) => set({ status: e.target.value || null, pagina: null })}>
              <option value="">Alle</option>
              {(Object.keys(STATUS_LABEL) as ImportStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        )}
        {filtersActief && (
          <button
            type="button"
            onClick={() => set({ actor: null, type: null, status: null, pagina: null })}
            className="btn btn-outline btn-compact"
          >
            Filters wissen
          </button>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-m">
          <strong>{periodeTekst()}</strong> · {nl.format(gefilterd.aantalGebeurtenissen)}{" "}
          {gefilterd.aantalGebeurtenissen === 1 ? "gebeurtenis" : "gebeurtenissen"} (van {nl.format(events.length)} in totaal)
        </p>
        <button
          type="button"
          className="btn btn-outline btn-compact"
          disabled={gefilterd.aantalGebeurtenissen === 0}
          onClick={exporteer}
        >
          Exporteren als CSV
        </button>
      </div>

      {gefilterd.rijen.length === 0 ? (
        <p className="admin-notice">
          Geen gebeurtenissen in deze periode.{" "}
          {groterBereik && (
            <button type="button" className="btn btn-outline btn-compact" onClick={() => kiesPeriode(groterBereik)}>
              Toon {PERIODE_LABEL[groterBereik].toLowerCase()}
            </button>
          )}
        </p>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tijdstip</th>
                <th>Actor</th>
                <th>Actie</th>
                <th>Entiteit</th>
                <th>Details</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {zichtbaar.map((rij) => {
                if (rij.soort === "import") {
                  const g = rij.groep;
                  const open = uitgeklapt.has(g.groepId);
                  return (
                    <ImportRij key={g.groepId} groep={g} open={open} onWissel={() => wissel(g.groepId)} />
                  );
                }
                const e = rij.event;
                const open = uitgeklapt.has(e.id);
                return (
                  <GebeurtenisRij key={e.id} event={e} open={open} onWissel={() => wissel(e.id)} />
                );
              })}
            </tbody>
          </table>

          {aantalPaginas > 1 && (
            <div className="mt-4 flex items-center gap-3 text-sm text-ink-m">
              <button
                type="button"
                className="btn btn-outline btn-compact"
                disabled={pagina <= 1}
                onClick={() => set({ pagina: pagina - 1 <= 1 ? null : String(pagina - 1) })}
              >
                ← Vorige
              </button>
              <span>
                Pagina {pagina} van {aantalPaginas}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-compact"
                disabled={pagina >= aantalPaginas}
                onClick={() => set({ pagina: String(pagina + 1) })}
              >
                Volgende →
              </button>
            </div>
          )}
        </>
      )}

      <BevestigModal
        open={opruimenOpen}
        titel="Audit-log opruimen"
        bericht={`Alle ${nl.format(teOudAantal)} gebeurtenissen ouder dan de bewaartermijn (${instellingen.bewaarTermijnDagen} dagen, dus vóór ${
          bewaarGrens ? new Date(bewaarGrens).toLocaleDateString("nl-NL") : ""
        }) worden definitief verwijderd. Dit kan niet ongedaan worden gemaakt. Het opruimen zelf wordt gelogd.`}
        bevestigLabel="Opruimen"
        onBevestigen={() => {
          if (bewaarGrens) ruimAuditOp(bewaarGrens);
          setOpruimenOpen(false);
        }}
        onAnnuleren={() => setOpruimenOpen(false)}
      />
    </div>
  );
}

function IdsEnJson({ event }: { event: AuditEvent }) {
  return (
    <div className="text-xs text-ink-m" style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
      <div>entiteit_id: {event.entiteitId}</div>
      {event.groepId && <div>groep_id: {event.groepId}</div>}
      {event.details && <div>details_json: {JSON.stringify(event.details, null, 1)}</div>}
    </div>
  );
}

function GebeurtenisRij({ event, open, onWissel }: { event: AuditEvent; open: boolean; onWissel: () => void }) {
  return (
    <>
      <tr>
        <td style={{ whiteSpace: "nowrap" }}>{tijdFormat.format(new Date(event.tijdstip))}</td>
        <td>{actorLabel(event)}</td>
        <td>
          <code>{event.actie}</code>
        </td>
        <td>{entiteitLabel(event)}</td>
        <td>{detailTekst(event)}</td>
        <td className="cel-knop">
          <button type="button" className="btn btn-outline btn-compact" aria-expanded={open} onClick={onWissel}>
            {open ? "Minder" : "Meer"}
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6}>
            <IdsEnJson event={event} />
          </td>
        </tr>
      )}
    </>
  );
}

function ImportRij({ groep, open, onWissel }: { groep: ImportGroep; open: boolean; onWissel: () => void }) {
  return (
    <>
      <tr>
        <td style={{ whiteSpace: "nowrap" }}>{tijdFormat.format(new Date(groep.tijdstip))}</td>
        <td>{groep.actor}</td>
        <td>
          <code>import</code>
        </td>
        <td>
          <span className={`admin-badge ${groep.status === "voltooid" ? "status-afgerond" : groep.status === "deels" ? "status-bezig" : "status-uitgenodigd"}`}>
            {STATUS_LABEL[groep.status]}
          </span>
        </td>
        <td>{importGroepTekst(groep)}</td>
        <td className="cel-knop">
          <button type="button" className="btn btn-outline btn-compact" aria-expanded={open} onClick={onWissel}>
            {open ? "Inklappen" : "Uitklappen"}
          </button>
        </td>
      </tr>
      {open &&
        groep.gebeurtenissen.map((e) => (
          <tr key={e.id}>
            <td style={{ whiteSpace: "nowrap", paddingLeft: "1.5rem" }}>{tijdFormat.format(new Date(e.tijdstip))}</td>
            <td>{actorLabel(e)}</td>
            <td>
              <code>{e.actie}</code>
            </td>
            <td>{entiteitLabel(e)}</td>
            <td colSpan={2}>
              {detailTekst(e)}
              <IdsEnJson event={e} />
            </td>
          </tr>
        ))}
    </>
  );
}

/** `useSearchParams` (filters in de URL) vraagt een Suspense-grens zodat de pagina statisch gebouwd kan worden. */
export default function AuditLogPage() {
  return (
    <Suspense fallback={null}>
      <AuditLogInhoud />
    </Suspense>
  );
}
