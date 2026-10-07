"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { zichtbareOrganisaties } from "@/lib/rechten";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { useBeheerOverzicht, useUrlParams } from "@/lib/beheer-url";
import { RespondentStatusBadge } from "@/components/beheer/overzicht-helpers";
import { ScanInvulling } from "@/lib/types";

type Kolom = "naam" | "organisatie" | "metingen" | "status";

interface Rij {
  lidId: string;
  naam: string;
  email: string;
  organisatieId: string;
  organisatie: string;
  metingIds: string[];
  metingen: { id: string; label: string }[];
  invullingen: ScanInvulling[];
  isLead: boolean;
  link: string;
  /** Sorteerwaarde voor "Status": aandeel afgerond, scans zonder uitkomst onderaan. */
  statusSortering: number;
}

const KOLOMMEN: { key: Kolom; label: string }[] = [
  { key: "naam", label: "Naam" },
  { key: "organisatie", label: "Organisatie" },
  { key: "metingen", label: "Meting(en)" },
  { key: "status", label: "Status" },
];

/**
 * Respondenten (beheerpagina.md punt 6b): één lijst van alle Respondenten,
 * zelfde bereik als de rest van Organisaties. Een rij opent het
 * Respondent-overzicht (modal, `?respondent=<id>`). Filters, sortering en
 * zoekterm staan in de adresbalk.
 */
function RespondentenPageInhoud() {
  const ingelogd = useIngelogdeGebruiker();
  const organisaties = zichtbareOrganisaties(ingelogd, useOrganisaties());
  const assessments = useAssessments();
  const { get, set } = useUrlParams();
  const { open } = useBeheerOverzicht();
  const [kopieerId, setKopieerId] = useState<{ id: string; gelukt: boolean } | null>(null);

  const filterOrganisatie = get("organisatie");
  const filterMeting = get("meting");
  const filterStatus = get("status");
  const zoek = get("q");
  const sortKolom = get("sort", "naam") as Kolom;
  const sortRichting = get("dir", "asc") === "desc" ? "desc" : "asc";

  const rijen = useMemo<Rij[]>(() => {
    return organisaties.flatMap((org) =>
      org.leden.map((lid) => {
        const metingen = org.scanUitvoeringen
          .filter((s) => s.invullingen.some((i) => i.organisatieLidId === lid.id))
          .map((s) => ({ id: s.id, label: s.label }));
        const invullingen = org.scanUitvoeringen.flatMap((s) => s.invullingen.filter((i) => i.organisatieLidId === lid.id));
        const afgerond = invullingen.filter((i) => i.status === "afgerond").length;
        return {
          lidId: lid.id,
          naam: lid.naam || lid.email,
          email: lid.email,
          organisatieId: org.id,
          organisatie: org.naam,
          metingIds: metingen.map((m) => m.id),
          metingen,
          invullingen,
          isLead: lid.leadMetingIds.length > 0,
          link: typeof window === "undefined" ? "" : maakPubliekeLink(window.location.origin, lid),
          statusSortering: invullingen.length === 0 ? -1 : afgerond / invullingen.length,
        };
      })
    );
  }, [organisaties]);

  const metingOpties = useMemo(
    () =>
      organisaties
        .filter((o) => !filterOrganisatie || o.id === filterOrganisatie)
        .flatMap((o) =>
          o.scanUitvoeringen.map((s) => ({
            id: s.id,
            tekst: `${s.label} — ${assessments.find((a) => a.id === s.assessmentId)?.naam ?? "Onbekend type"}${
              filterOrganisatie ? "" : ` (${o.naam})`
            }`,
          }))
        ),
    [organisaties, assessments, filterOrganisatie]
  );

  const gefilterd = useMemo(() => {
    const term = zoek.trim().toLowerCase();
    return rijen.filter((r) => {
      if (filterOrganisatie && r.organisatieId !== filterOrganisatie) return false;
      if (filterMeting && !r.metingIds.includes(filterMeting)) return false;
      if (filterStatus && !r.invullingen.some((i) => i.status === filterStatus)) return false;
      if (term && !r.naam.toLowerCase().includes(term) && !r.email.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [rijen, filterOrganisatie, filterMeting, filterStatus, zoek]);

  const gesorteerd = useMemo(() => {
    const kopie = [...gefilterd];
    kopie.sort((a, b) => {
      let cmp: number;
      if (sortKolom === "metingen") cmp = a.metingen.length - b.metingen.length;
      else if (sortKolom === "status") cmp = a.statusSortering - b.statusSortering;
      else cmp = String(a[sortKolom]).localeCompare(String(b[sortKolom]), "nl");
      return sortRichting === "asc" ? cmp : -cmp;
    });
    return kopie;
  }, [gefilterd, sortKolom, sortRichting]);

  function handleSort(kolom: Kolom) {
    if (kolom === sortKolom) set({ dir: sortRichting === "asc" ? "desc" : "asc" });
    else set({ sort: kolom, dir: "asc" });
  }

  async function kopieer(id: string, url: string) {
    const gelukt = await kopieerNaarKlembord(url);
    setKopieerId({ id, gelukt });
    setTimeout(() => setKopieerId((h) => (h?.id === id ? null : h)), 1600);
  }

  const filtersActief = Boolean(filterOrganisatie || filterMeting || filterStatus || zoek);

  return (
    <div className="admin-main admin-main--breed">
      <h1>Respondenten</h1>
      <p>
        Alle personen die een scan invullen of Lead zijn, met hun gegevens, toegang en scans op één plek. Voor de
        scans zelf, zie Ingevulde scans.
      </p>

      {rijen.length === 0 ? (
        <p className="admin-notice">Nog geen respondenten.</p>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-end gap-3">
            <div className="admin-field" style={{ marginBottom: 0, minWidth: "12rem" }}>
              <label>Organisatie</label>
              <select value={filterOrganisatie} onChange={(e) => set({ organisatie: e.target.value, meting: null })}>
                <option value="">Alle organisaties</option>
                {organisaties.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.naam}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field" style={{ marginBottom: 0, minWidth: "14rem" }}>
              <label>Meting</label>
              <select value={filterMeting} onChange={(e) => set({ meting: e.target.value })}>
                <option value="">Alle Metingen</option>
                {metingOpties.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.tekst}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field" style={{ marginBottom: 0, minWidth: "10rem" }}>
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => set({ status: e.target.value })}>
                <option value="">Alle statussen</option>
                <option value="uitgenodigd">Uitgenodigd</option>
                <option value="bezig">Bezig</option>
                <option value="afgerond">Afgerond</option>
              </select>
            </div>
            <div className="admin-field" style={{ marginBottom: 0, minWidth: "14rem" }}>
              <label>Zoeken</label>
              <input type="search" value={zoek} onChange={(e) => set({ q: e.target.value })} placeholder="Naam of e-mailadres" />
            </div>
            {filtersActief && (
              <button
                type="button"
                onClick={() => set({ organisatie: null, meting: null, status: null, q: null })}
                className="btn btn-outline btn-compact"
              >
                Filters wissen
              </button>
            )}
          </div>

          {gesorteerd.length === 0 ? (
            <p className="admin-notice">Geen respondenten gevonden voor deze filters.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  {KOLOMMEN.map((k) => (
                    <th key={k.key}>
                      <button type="button" className="admin-sort-btn" onClick={() => handleSort(k.key)}>
                        {k.label}
                        {sortKolom === k.key ? (sortRichting === "asc" ? " ▲" : " ▼") : ""}
                      </button>
                    </th>
                  ))}
                  <th>Persoonlijke link</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {gesorteerd.map((r) => (
                  <tr key={r.lidId} className="admin-table-rij-klikbaar" onClick={() => open("respondent", r.lidId)}>
                    <td>
                      {r.naam} {r.isLead && <span className="lead-badge">Lead</span>}
                    </td>
                    <td>{r.organisatie}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {r.metingen.length === 0 ? (
                        ""
                      ) : r.metingen.length === 1 ? (
                        <Link href={`/beheer/metingen/${r.metingen[0].id}`}>{r.metingen[0].label}</Link>
                      ) : (
                        `${r.metingen.length} Metingen`
                      )}
                    </td>
                    <td>
                      <RespondentStatusBadge invullingen={r.invullingen} />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="knoppenrij">
                        <button type="button" className="btn btn-outline btn-compact" onClick={() => kopieer(r.lidId, r.link)}>
                        {kopieerId?.id === r.lidId ? (kopieerId.gelukt ? "Gekopieerd!" : "Mislukt, opnieuw") : "Kopieer link"}
                        </button>
                        <a href={r.link} target="_blank" rel="noreferrer" className="btn btn-outline btn-compact">
                          Openen
                        </a>
                      </div>
                    </td>
                    <td className="cel-knop" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="btn btn-outline btn-compact" onClick={() => open("respondent", r.lidId)}>
                        Bekijk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

/** `useSearchParams` (filters in de URL) vraagt een Suspense-grens zodat de pagina statisch gebouwd kan worden. */
export default function RespondentenPage() {
  return (
    <Suspense fallback={null}>
      <RespondentenPageInhoud />
    </Suspense>
  );
}
