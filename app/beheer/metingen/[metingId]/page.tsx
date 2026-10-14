"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/lib/assessment-store";
import { nodigLidUit, useScanUitvoering, verwijderMeting, verwijderScanInvullingen } from "@/lib/db";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magOrganisatieToegang } from "@/lib/rechten";
import { aantalBenchmarksMetMeting } from "@/lib/benchmark-store";
import { voortgang } from "@/lib/scoring";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { useBeheerOverzicht, useUrlParams } from "@/lib/beheer-url";
import { kruimelsVoorMeting, metVia, VIA_RESULTATEN } from "@/lib/resultaten-nav";
import { rolTeamTekst } from "@/components/beheer/overzicht-helpers";
import { CsvRijContext } from "@/lib/csv-export";
import { exporteerScanIndesign, exporteerScanPdf, exporteerScansCsv } from "@/lib/scan-export";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { NaarAndereMetingStap, ScanVerplaatsResultaat } from "@/components/beheer/VerplaatsStappen";
import { conflictActies } from "@/components/beheer/ConflictHost";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";
import { STATUS_LABEL } from "@/components/beheer/overzicht-helpers";
import { isLead } from "@/lib/lead";
import { leadsMetToegangTotMeting } from "@/lib/lead-toegang";
import { STANDAARD_ONDERDEEL, isSamengesteld, onderdeelVan, rondeVan } from "@/lib/rondes";
import { MetingWijzigenFormulier } from "@/components/beheer/MetingWijzigenFormulier";
import { SamengesteldMetingOverzicht } from "@/components/beheer/SamengesteldMetingOverzicht";
import { NaarRondeModal } from "@/components/beheer/NaarRondeModal";

/**
 * Meting-overzicht (beheerpagina.md punt 5): alles binnen één Meting op
 * één plek. Een eigen pagina en geen modal, omdat er een lijst op staat
 * die op zijn beurt het Respondent-overzicht opent.
 */
type ScanKolom = "naam" | "rolTeam" | "status" | "voortgang" | "gestart" | "aangemaakt" | "notitie";

const SCAN_KOLOMMEN: { key: ScanKolom; label: string }[] = [
  { key: "naam", label: "Naam" },
  { key: "rolTeam", label: "Rol / team" },
  { key: "status", label: "Status" },
  { key: "voortgang", label: "Voortgang" },
  { key: "gestart", label: "Gestart" },
  { key: "aangemaakt", label: "Aangemaakt" },
  { key: "notitie", label: "Notitie" },
];

export default function MetingOverzichtPage({ params }: { params: Promise<{ metingId: string }> }) {
  const { metingId } = use(params);
  const gegevens = useScanUitvoering(metingId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const ingelogd = useIngelogdeGebruiker();
  const router = useRouter();
  const { open } = useBeheerOverzicht();
  const { get: urlGet, set: urlSet } = useUrlParams();
  const viaResultaten = urlGet("via") === VIA_RESULTATEN;

  const invullingen = gegevens?.scanUitvoering.invullingen ?? [];
  const bulk = useBulkSelect(invullingen.map((i) => i.id));
  const [email, setEmail] = useState("");
  const [ookLeadMaken, setOokLeadMaken] = useState(false);
  const [nieuweLink, setNieuweLink] = useState<string | null>(null);
  const [kopieerStatus, setKopieerStatus] = useState<{ id: string; gelukt: boolean } | null>(null);
  const [labelBewerken, setLabelBewerken] = useState(false);
  const [naarRondeOpen, setNaarRondeOpen] = useState(false);
  const [metingVerwijderenOpen, setMetingVerwijderenOpen] = useState(false);
  const [scansVerwijderenOpen, setScansVerwijderenOpen] = useState(false);
  const [naarMetingOpen, setNaarMetingOpen] = useState(false);
  const [pdfBezig, setPdfBezig] = useState(false);

  if (!gegevens || !assessment) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Meting niet gevonden.</p>
      </div>
    );
  }
  const { organisatie, scanUitvoering } = gegevens;

  if (!magOrganisatieToegang(ingelogd, organisatie)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">
          Geen toegang: deze Meting hoort bij een organisatie die niet door jou is aangemaakt en ook niet aan jou is
          toegewezen.
        </p>
      </div>
    );
  }

  // Een samengestelde Meting heeft een eigen overzicht: Geen Respondenten, wel een samenstelling.
  if (isSamengesteld(scanUitvoering)) {
    return <SamengesteldMetingOverzicht organisatie={organisatie} meting={scanUitvoering} />;
  }

  const afgerond = invullingen.filter((i) => i.status === "afgerond").length;
  const leads = leadsMetToegangTotMeting(organisatie, scanUitvoering.id);
  const benchmarksMetMeting = aantalBenchmarksMetMeting(scanUitvoering.id);

  async function kopieer(id: string, url: string) {
    const gelukt = await kopieerNaarKlembord(url);
    setKopieerStatus({ id, gelukt });
    setTimeout(() => setKopieerStatus((h) => (h?.id === id ? null : h)), 1600);
  }

  function handleUitnodigen(e: React.FormEvent) {
    e.preventDefault();
    const resultaat = nodigLidUit(scanUitvoering.id, email.trim(), ookLeadMaken);
    if (!resultaat) return;
    setNieuweLink(maakPubliekeLink(window.location.origin, resultaat.lid));
    setEmail("");
    setOokLeadMaken(false);
  }

  function handleMetingVerwijderd() {
    verwijderMeting(scanUitvoering.id);
    zetBeheerMelding({ tekst: `Meting "${scanUitvoering.label}" is verwijderd, met alle scans daarbinnen.` });
    router.push(`/beheer/organisaties/${organisatie.id}`);
  }

  const geselecteerdeInvullingen = invullingen.filter((i) => bulk.isSelected(i.id));
  const rijenVoorExport: CsvRijContext[] = geselecteerdeInvullingen
    .map((invulling) => {
      const lid = organisatie.leden.find((l) => l.id === invulling.organisatieLidId);
      return lid ? { organisatie, scanUitvoering, lid, invulling, assessment } : null;
    })
    .filter((r): r is CsvRijContext => r !== null);
  const enkeleSelectie = rijenVoorExport.length === 1 ? rijenVoorExport[0] : undefined;

  async function handleExporterenPdf() {
    if (!enkeleSelectie) return;
    setPdfBezig(true);
    const gelukt = await exporteerScanPdf(enkeleSelectie);
    setPdfBezig(false);
    if (gelukt) bulk.clear();
    else window.alert("Het exporteren als PDF is mislukt. Probeer het opnieuw.");
  }

  function handleScansVerwijderd() {
    verwijderScanInvullingen(geselecteerdeInvullingen.map((i) => i.id));
    bulk.clear();
    setScansVerwijderenOpen(false);
  }

  // Alle kolommen zijn sorteerbaar (`beheerpagina.md`, punt 5, Scans in deze Meting): Standaard op Naam.
  const sortKolom = urlGet("sort", "naam") as ScanKolom;
  const sortRichting = urlGet("dir", "asc") === "desc" ? "desc" : "asc";
  const scanRijen = invullingen.flatMap((invulling) => {
    const lid = organisatie.leden.find((l) => l.id === invulling.organisatieLidId);
    if (!lid) return [];
    return [
      {
        invulling,
        lid,
        naam: lid.naam || lid.email,
        rolTeam: rolTeamTekst(lid),
        status: invulling.status,
        voortgang: voortgang(assessment!, invulling.antwoorden).percentage,
        gestart: invulling.gestartOp ?? "",
        aangemaakt: invulling.aangemaaktOp,
        notitie: invulling.notitie ?? "",
      },
    ];
  });
  const gesorteerdeRijen = [...scanRijen].sort((a, b) => {
    const va = a[sortKolom];
    const vb = b[sortKolom];
    const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "nl");
    return sortRichting === "asc" ? cmp : -cmp;
  });
  function handleSort(kolom: ScanKolom) {
    if (kolom === sortKolom) urlSet({ dir: sortRichting === "asc" ? "desc" : "asc" });
    else urlSet({ sort: kolom, dir: "asc" });
  }

  function handleVerplaatst(r: ScanVerplaatsResultaat) {
    setNaarMetingOpen(false);
    bulk.clear();
    zetBeheerMelding({
      tekst:
        r.overgeslagen.length === 0
          ? `${r.verplaatst} scan${r.verplaatst === 1 ? "" : "s"} verplaatst naar Meting "${r.doelLabel}".`
          : `${r.verplaatst} scan(s) verplaatst naar "${r.doelLabel}", ${r.overgeslagen.length} overgeslagen: ${[
              ...new Set(r.overgeslagen.map((o) => o.reden)),
            ].join(" ")}`,
      acties: conflictActies(organisatie.id, r.overgeslagen),
    });
  }

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad delen={kruimelsVoorMeting(organisatie, scanUitvoering, rondeVan(organisatie, scanUitvoering), viaResultaten)} />

      {labelBewerken ? (
        <MetingWijzigenFormulier organisatie={organisatie} meting={scanUitvoering} onKlaar={() => setLabelBewerken(false)} />
      ) : (
        <div className="titel-rij">
          <h1>{scanUitvoering.label}</h1>
          <button type="button" className="titel-potlood" aria-label="Meting wijzigen (onderdeel en ronde)" title="Meting wijzigen (onderdeel en ronde)" onClick={() => setLabelBewerken(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
      <p className="text-sm text-ink-m">
        {assessment.naam} ·{" "}
        <Link href={`/beheer/organisaties/${organisatie.id}`} style={{ color: "var(--or)" }}>
          {organisatie.naam}
        </Link>
        {rondeVan(organisatie, scanUitvoering) && ` · ${rondeVan(organisatie, scanUitvoering)!.label}`}
        {onderdeelVan(scanUitvoering) !== STANDAARD_ONDERDEEL && ` · onderdeel ${onderdeelVan(scanUitvoering)}`} · {afgerond} van{" "}
        {invullingen.length} afgerond
      </p>

      <div className="overzicht-acties" style={{ margin: "1rem 0 0.5rem" }}>
        {afgerond > 0 && (
          <Link href={metVia(`/beheer/rapportage/${scanUitvoering.id}`, viaResultaten)} className="btn btn-outline btn-compact">
            Naar resultaten →
          </Link>
        )}
        <button type="button" className="btn btn-outline btn-compact" onClick={() => setNaarRondeOpen(true)}>
          Naar ronde…
        </button>
        <button type="button" className="btn btn-danger btn-compact" onClick={() => setMetingVerwijderenOpen(true)}>
          Meting verwijderen
        </button>
      </div>

      {leads.length > 0 && (
        <p className="text-sm text-ink-m" style={{ marginTop: "0.8rem" }}>
          Leads die weergaven van deze Meting zien (tabel Leads van de organisatie):{" "}
          {leads.map((l, i) => (
            <span key={l.id}>
              {i > 0 && ", "}
              <button type="button" className="btn btn-outline btn-compact" onClick={() => open("respondent", l.id)}>
                {l.naam || l.email}
              </button>
            </span>
          ))}
        </p>
      )}

      <h2>Scans in deze Meting</h2>
      <form onSubmit={handleUitnodigen} className="flex items-stretch gap-3" style={{ maxWidth: "44rem" }}>
        <div className="admin-field flex-1" style={{ marginBottom: 0 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="naam@organisatie.nl"
          />
        </div>
        <label className="flex items-center gap-1 text-sm text-ink-m whitespace-nowrap">
          <input type="checkbox" checked={ookLeadMaken} onChange={(e) => setOokLeadMaken(e.target.checked)} />
          Ook Lead maken
        </label>
        <button type="submit" className="btn btn-or btn-compact">
          Respondent uitnodigen
        </button>
      </form>
      {nieuweLink && (
        <div className="admin-notice mt-3">
          <p className="font-medium text-ink">
            Respondent uitgenodigd. Deel deze persoonlijke link handmatig (mail, chat): er wordt niets automatisch
            verstuurd.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-bg px-2 py-1 text-xs">{nieuweLink}</code>
            <button type="button" onClick={() => kopieer("nieuw", nieuweLink)} className="btn btn-outline btn-compact">
              {kopieerStatus?.id === "nieuw" ? (kopieerStatus.gelukt ? "Gekopieerd!" : "Mislukt, probeer opnieuw") : "Kopieer"}
            </button>
            <a href={nieuweLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-compact">
              Openen
            </a>
          </div>
        </div>
      )}

      {invullingen.length === 0 ? (
        <p className="admin-notice mt-3">Nog geen respondenten uitgenodigd voor deze Meting.</p>
      ) : (
        <>
          <div className="mt-4" />
          <BulkToolbar
            aantal={bulk.selected.size}
            onVerwijderen={() => setScansVerwijderenOpen(true)}
            verwijderLabel="Verwijderen"
            onExporteren={() => {
              exporteerScansCsv(rijenVoorExport);
              bulk.clear();
            }}
            onExporterenPdf={enkeleSelectie ? handleExporterenPdf : undefined}
            onExporterenIndesign={
              enkeleSelectie
                ? () => {
                    exporteerScanIndesign(enkeleSelectie);
                    bulk.clear();
                  }
                : undefined
            }
            exportBezig={pdfBezig}
            onNaarAndereMeting={() => setNaarMetingOpen(true)}
          />
          <BevestigModal
            open={scansVerwijderenOpen}
            titel="Scans verwijderen"
            bericht={`${bulk.selected.size} scan(s) definitief verwijderen, met antwoorden en opmerkingen? De Respondenten zelf en hun scans in andere Metingen blijven bestaan. Dit kan niet ongedaan gemaakt worden.`}
            bevestigLabel="Scans verwijderen"
            onBevestigen={handleScansVerwijderd}
            onAnnuleren={() => setScansVerwijderenOpen(false)}
          />
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <IndeterminateCheckbox
                    checked={bulk.alleGeselecteerd}
                    indeterminate={bulk.sommigeGeselecteerd}
                    onChange={bulk.toggleAll}
                  />
                </th>
                {SCAN_KOLOMMEN.map((k) => (
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
              {gesorteerdeRijen.map(({ invulling, lid, naam, rolTeam, voortgang: percentage, notitie }) => {
                const link = maakPubliekeLink(window.location.origin, lid);
                return (
                  <tr key={invulling.id} className="admin-table-rij-klikbaar" onClick={() => open("scan", invulling.id)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={bulk.isSelected(invulling.id)} onChange={() => bulk.toggle(invulling.id)} />
                    </td>
                    <td>
                      {lid.naam ? naam : <em className="text-ink-s">{naam}</em>}{" "}
                      {isLead(lid) && <span className="lead-badge">Lead</span>}
                    </td>
                    <td>{rolTeam}</td>
                    <td>
                      <span className={`admin-badge status-${invulling.status}`}>{STATUS_LABEL[invulling.status]}</span>
                    </td>
                    <td>{percentage}%</td>
                    <td>{invulling.gestartOp ? new Date(invulling.gestartOp).toLocaleDateString("nl-NL") : ""}</td>
                    <td>{new Date(invulling.aangemaaktOp).toLocaleDateString("nl-NL")}</td>
                    <td className="cel-notitie" title={notitie || undefined}>
                      {notitie}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="knoppenrij">
                        <button type="button" className="btn btn-outline btn-compact" onClick={() => kopieer(invulling.id, link)}>
                          {kopieerStatus?.id === invulling.id ? (kopieerStatus.gelukt ? "Gekopieerd!" : "Mislukt, opnieuw") : "Kopieer link"}
                        </button>
                        <a href={link} target="_blank" rel="noreferrer" className="btn btn-outline btn-compact">
                          Openen
                        </a>
                      </div>
                    </td>
                    <td className="cel-knop">
                      <button type="button" className="btn btn-outline btn-compact" onClick={() => open("scan", invulling.id)}>
                        Bekijk
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <BevestigModal
        open={metingVerwijderenOpen}
        titel="Meting verwijderen"
        bericht={`"${scanUitvoering.label}" en alle ${invullingen.length} scan(s) daarbinnen definitief verwijderen? De respondenten zelf en hun eventuele andere Metingen blijven bestaan.${
          benchmarksMetMeting > 0
            ? ` Deze Meting zit in ${benchmarksMetMeting} benchmark${benchmarksMetMeting === 1 ? "" : "s"}: De organisatie valt dan uit ${benchmarksMetMeting === 1 ? "die benchmark" : "die benchmarks"}.`
            : ""
        } Dit kan niet ongedaan gemaakt worden.`}
        bevestigLabel="Meting verwijderen"
        onBevestigen={handleMetingVerwijderd}
        onAnnuleren={() => setMetingVerwijderenOpen(false)}
      />
      {naarMetingOpen && (
        <OverzichtModal label="Scans naar andere Meting" onSluit={() => setNaarMetingOpen(false)}>
          <NaarAndereMetingStap
            organisatie={organisatie}
            invullingIds={geselecteerdeInvullingen.map((i) => i.id)}
            onTerug={() => setNaarMetingOpen(false)}
            onKlaar={handleVerplaatst}
          />
        </OverzichtModal>
      )}
      {naarRondeOpen && (
        <NaarRondeModal
          organisatie={organisatie}
          metingIds={[scanUitvoering.id]}
          onSluit={() => setNaarRondeOpen(false)}
          onKlaar={(tekst) => {
            setNaarRondeOpen(false);
            zetBeheerMelding({ tekst });
          }}
        />
      )}
    </div>
  );
}
