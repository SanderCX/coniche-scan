"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/lib/assessment-store";
import { hernoemMeting, nodigLidUit, useScanUitvoering, verwijderLeden, verwijderMeting } from "@/lib/db";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magOrganisatieToegang } from "@/lib/rechten";
import { voortgang } from "@/lib/scoring";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { useBeheerOverzicht } from "@/lib/beheer-url";
import { CsvRijContext } from "@/lib/csv-export";
import { exporteerScanIndesign, exporteerScanPdf, exporteerScansCsv } from "@/lib/scan-export";
import { IndeterminateCheckbox } from "@/components/beheer/IndeterminateCheckbox";
import { BulkToolbar } from "@/components/beheer/BulkToolbar";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { NaarAndereMetingStap, ScanVerplaatsResultaat } from "@/components/beheer/VerplaatsStappen";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";
import { STATUS_LABEL } from "@/components/beheer/overzicht-helpers";

/**
 * Meting-overzicht (beheerpagina.md punt 5): alles binnen één Meting op
 * één plek. Een eigen pagina en geen modal, omdat er een lijst op staat
 * die op zijn beurt het Respondent-overzicht opent.
 */
export default function MetingOverzichtPage({ params }: { params: Promise<{ metingId: string }> }) {
  const { metingId } = use(params);
  const gegevens = useScanUitvoering(metingId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const ingelogd = useIngelogdeGebruiker();
  const router = useRouter();
  const { open } = useBeheerOverzicht();

  const invullingen = gegevens?.scanUitvoering.invullingen ?? [];
  const bulk = useBulkSelect(invullingen.map((i) => i.id));
  const [email, setEmail] = useState("");
  const [ookLeadMaken, setOokLeadMaken] = useState(false);
  const [nieuweLink, setNieuweLink] = useState<string | null>(null);
  const [kopieerStatus, setKopieerStatus] = useState<{ id: string; gelukt: boolean } | null>(null);
  const [labelBewerken, setLabelBewerken] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [metingVerwijderenOpen, setMetingVerwijderenOpen] = useState(false);
  const [respondentenVerwijderenOpen, setRespondentenVerwijderenOpen] = useState(false);
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

  const afgerond = invullingen.filter((i) => i.status === "afgerond").length;
  const leads = organisatie.leden.filter((l) => l.leadMetingIds.includes(scanUitvoering.id));

  async function kopieer(id: string, url: string) {
    const gelukt = await kopieerNaarKlembord(url);
    setKopieerStatus({ id, gelukt });
    setTimeout(() => setKopieerStatus((h) => (h?.id === id ? null : h)), 1600);
  }

  function handleLabelOpslaan(e: React.FormEvent) {
    e.preventDefault();
    const nieuwLabel = labelInput.trim();
    if (nieuwLabel) hernoemMeting(scanUitvoering.id, nieuwLabel);
    setLabelBewerken(false);
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

  function handleRespondentenVerwijderd() {
    verwijderLeden(geselecteerdeInvullingen.map((i) => i.organisatieLidId));
    bulk.clear();
    setRespondentenVerwijderenOpen(false);
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
    });
  }

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Organisaties", href: "/beheer/organisaties" },
          { label: organisatie.naam, href: `/beheer/organisaties/${organisatie.id}` },
          { label: scanUitvoering.label },
        ]}
      />

      {labelBewerken ? (
        <form onSubmit={handleLabelOpslaan} className="flex items-center gap-2" style={{ marginBottom: "0.5rem" }}>
          <div className="admin-field" style={{ marginBottom: 0, width: "20rem" }}>
            <input type="text" value={labelInput} onChange={(e) => setLabelInput(e.target.value)} autoFocus />
          </div>
          <button type="submit" className="btn btn-or btn-compact">
            Opslaan
          </button>
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setLabelBewerken(false)}>
            Annuleren
          </button>
        </form>
      ) : (
        <h1>{scanUitvoering.label}</h1>
      )}
      <p className="text-sm text-ink-m">
        {assessment.naam} ·{" "}
        <Link href={`/beheer/organisaties/${organisatie.id}`} style={{ color: "var(--or)" }}>
          {organisatie.naam}
        </Link>{" "}
        · {afgerond} van {invullingen.length} afgerond
      </p>

      <div className="overzicht-acties" style={{ margin: "1rem 0 0.5rem" }}>
        {afgerond > 0 && (
          <Link href={`/beheer/rapportage/${scanUitvoering.id}`} className="btn btn-outline btn-compact">
            Naar resultaten →
          </Link>
        )}
        {!labelBewerken && (
          <button
            type="button"
            className="btn btn-outline btn-compact"
            onClick={() => {
              setLabelInput(scanUitvoering.label);
              setLabelBewerken(true);
            }}
          >
            Wijzig label
          </button>
        )}
        <button type="button" className="btn btn-danger btn-compact" onClick={() => setMetingVerwijderenOpen(true)}>
          Meting verwijderen
        </button>
      </div>

      {leads.length > 0 && (
        <p className="text-sm text-ink-m" style={{ marginTop: "0.8rem" }}>
          Leads met toegang tot deze Meting:{" "}
          {leads.map((l, i) => (
            <span key={l.id}>
              {i > 0 && ", "}
              <button type="button" className="admin-bekijk-knop" onClick={() => open("respondent", l.id)}>
                {l.naam || l.email}
              </button>
            </span>
          ))}
        </p>
      )}

      <h2>Respondenten in deze Meting</h2>
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
            onVerwijderen={() => setRespondentenVerwijderenOpen(true)}
            verwijderLabel="Respondenten verwijderen"
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
            open={respondentenVerwijderenOpen}
            titel="Respondenten verwijderen"
            bericht={`${bulk.selected.size} respondent(en) definitief verwijderen, met al hun ingevulde scans? Dit kan niet ongedaan gemaakt worden.`}
            bevestigLabel="Respondenten verwijderen"
            onBevestigen={handleRespondentenVerwijderd}
            onAnnuleren={() => setRespondentenVerwijderenOpen(false)}
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
                <th>Naam</th>
                <th>Status</th>
                <th>Voortgang</th>
                <th>Persoonlijke link</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invullingen.map((invulling) => {
                const lid = organisatie.leden.find((l) => l.id === invulling.organisatieLidId);
                if (!lid) return null;
                const { percentage } = voortgang(assessment, invulling.antwoorden);
                const link = maakPubliekeLink(window.location.origin, lid);
                return (
                  <tr key={invulling.id} className="admin-table-rij-klikbaar" onClick={() => open("respondent", lid.id)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={bulk.isSelected(invulling.id)} onChange={() => bulk.toggle(invulling.id)} />
                    </td>
                    <td>
                      {lid.naam || <em className="text-ink-s">{lid.email}</em>}{" "}
                      {lid.leadMetingIds.length > 0 && <span className="lead-badge">Lead</span>}
                    </td>
                    <td>
                      <span className={`admin-badge status-${invulling.status}`}>{STATUS_LABEL[invulling.status]}</span>
                    </td>
                    <td>{percentage}%</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="admin-sort-btn" onClick={() => kopieer(invulling.id, link)}>
                        {kopieerStatus?.id === invulling.id ? (kopieerStatus.gelukt ? "Gekopieerd!" : "Mislukt, opnieuw") : "Kopieer link"}
                      </button>
                      {" · "}
                      <a href={link} target="_blank" rel="noreferrer" className="admin-sort-btn">
                        Openen
                      </a>
                    </td>
                    <td>
                      <button type="button" className="admin-bekijk-knop" onClick={() => open("respondent", lid.id)}>
                        Bekijk &gt;&gt;
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
        bericht={`"${scanUitvoering.label}" en alle ${invullingen.length} scan(s) daarbinnen definitief verwijderen? De respondenten zelf en hun eventuele andere Metingen blijven bestaan. Dit kan niet ongedaan gemaakt worden.`}
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
    </div>
  );
}
