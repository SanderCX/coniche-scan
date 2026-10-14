"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssessment } from "@/lib/assessment-store";
import { verwijderMeting } from "@/lib/db";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { isAdmin } from "@/lib/rechten";
import { leadsMetToegangTotMeting } from "@/lib/lead-toegang";
import {
  aantalAfgerondInMeting,
  onderdeelVan,
  onderliggendeMetingen,
  rondeVan,
} from "@/lib/rondes";
import { Organisatie, ScanUitvoering } from "@/lib/types";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { Modal } from "@/components/Modal";
import { SamengesteldeMetingFormulier } from "@/components/beheer/SamengesteldeMetingFormulier";
import { MetingWijzigenFormulier } from "@/components/beheer/MetingWijzigenFormulier";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";
import { aantalBenchmarksMetMeting } from "@/lib/benchmark-store";
import { kruimelsVoorMeting, metVia, VIA_RESULTATEN } from "@/lib/resultaten-nav";

/**
 * Meting-overzicht van een samengestelde Meting (`beheerpagina.md`, punt 5, Samengestelde Meting): Dezelfde kop als een gewone
 * Meting, maar zonder het blok Respondenten. In plaats daarvan het blok Samenstelling met de onderliggende Metingen, elk met een
 * link naar zijn eigen Meting-overzicht, en daarnaast "Naar resultaten →", "Samenstelling wijzigen", "Verwijderen" en de Leads.
 * Blijft er één onderliggende Meting over, dan staat er een melding en past de beheerder haar aan of verwijdert haar.
 */
export function SamengesteldMetingOverzicht({ organisatie, meting }: { organisatie: Organisatie; meting: ScanUitvoering }) {
  const router = useRouter();
  const via = useSearchParams().get("via") === VIA_RESULTATEN;
  const assessment = useAssessment(meting.assessmentId);
  const ingelogd = useIngelogdeGebruiker();
  const [wijzigenOpen, setWijzigenOpen] = useState(false);
  const [labelBewerken, setLabelBewerken] = useState(false);
  const [verwijderenOpen, setVerwijderenOpen] = useState(false);

  const onder = onderliggendeMetingen(organisatie, meting);
  const ronde = rondeVan(organisatie, meting);
  const leads = leadsMetToegangTotMeting(organisatie, meting.id);
  const inBenchmarks = aantalBenchmarksMetMeting(meting.id);
  const scans = aantalAfgerondInMeting(organisatie, meting);

  function verwijderd() {
    verwijderMeting(meting.id);
    zetBeheerMelding({ tekst: `Samengestelde Meting "${meting.label}" is verwijderd. De onderliggende Metingen zijn niet veranderd.` });
    router.push(`/beheer/organisaties/${organisatie.id}`);
  }

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad delen={kruimelsVoorMeting(organisatie, meting, ronde, via)} />
      {labelBewerken ? (
        <MetingWijzigenFormulier organisatie={organisatie} meting={meting} onKlaar={() => setLabelBewerken(false)} />
      ) : (
        <div className="titel-rij">
          <h1>
            {meting.label} <span className="admin-badge status-uitgenodigd" style={{ verticalAlign: "middle" }}>Gemiddelde</span>
          </h1>
          <button type="button" className="titel-potlood" aria-label="Meting wijzigen (onderdeel en ronde)" title="Meting wijzigen (onderdeel en ronde)" onClick={() => setLabelBewerken(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
      <p className="text-sm text-ink-m">
        {assessment?.naam ?? "Onbekend type"} · {organisatie.naam}
        {ronde && ` · ${ronde.label}`} · onderdeel {onderdeelVan(meting)}
      </p>
      <p className="text-sm text-ink-m">
        Gemiddelde van {onder.length} {onder.length === 1 ? "Meting" : "Metingen"}, elk even zwaar ({scans} afgeronde scans in
        totaal).
      </p>

      {onder.length === 1 && (
        <p className="admin-notice">
          Er is nog maar één onderliggende Meting over, dus dit is geen gemiddelde meer. Pas de samenstelling aan of verwijder deze
          Meting.
        </p>
      )}

      <div className="overzicht-acties" style={{ margin: "1rem 0 0.5rem" }}>
        {scans > 0 && (
          <Link href={metVia(`/beheer/rapportage/${meting.id}`, via)} className="btn btn-outline btn-compact">
            Naar resultaten →
          </Link>
        )}
        <button type="button" className="btn btn-outline btn-compact" onClick={() => setWijzigenOpen(true)}>
          Samenstelling wijzigen
        </button>
        <button type="button" className="btn btn-danger btn-compact" onClick={() => setVerwijderenOpen(true)}>
          Verwijderen
        </button>
      </div>

      <h2>Samenstelling</h2>
      {onder.length === 0 ? (
        <p className="admin-notice">Geen onderliggende Metingen.</p>
      ) : (
        <table className="admin-table">
          <tbody>
            {onder.map((m) => (
              <tr key={m.id} className="admin-table-rij-klikbaar" onClick={() => router.push(`/beheer/metingen/${m.id}`)}>
                <td>
                  <strong>{m.label}</strong> <span className="text-ink-s">— {onderdeelVan(m)}</span>
                </td>
                <td>{aantalAfgerondInMeting(organisatie, m)} afgeronde scans</td>
                <td className="cel-knop">
                  <Link href={`/beheer/metingen/${m.id}`} className="btn btn-outline btn-compact" onClick={(e) => e.stopPropagation()}>
                    Bekijk
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Leads</h2>
      {leads.length === 0 ? (
        <p className="admin-notice">
          Geen Lead ziet deze Meting. Toegang erft niet mee van de onderliggende Metingen: Vink Resultaten van deze Meting aan in
          de tabel Leads van de organisatie.
        </p>
      ) : (
        <ul className="text-sm text-ink-m" style={{ listStyle: "disc", paddingLeft: "1.2rem" }}>
          {leads.map((l) => (
            <li key={l.id}>
              {l.naam || l.email} <span className="text-ink-s">— ziet alleen het gemiddelde</span>
            </li>
          ))}
        </ul>
      )}
      {isAdmin(ingelogd) && inBenchmarks > 0 && (
        <p className="text-sm text-ink-m">Deze Meting doet mee aan {inBenchmarks} {inBenchmarks === 1 ? "benchmark" : "benchmarks"}.</p>
      )}

      <Modal open={wijzigenOpen} onClose={() => setWijzigenOpen(false)} title="Samenstelling wijzigen">
        {wijzigenOpen && meting.rondeId && (
          <SamengesteldeMetingFormulier
            organisatie={organisatie}
            rondeId={meting.rondeId}
            bestaande={meting}
            onKlaar={() => setWijzigenOpen(false)}
            onAnnuleren={() => setWijzigenOpen(false)}
          />
        )}
      </Modal>
      <BevestigModal
        open={verwijderenOpen}
        titel="Samengestelde Meting verwijderen"
        bericht={`"${meting.label}" verwijderen? De onderliggende Metingen en hun scans blijven bestaan.${
          inBenchmarks > 0 ? ` Ze valt ook uit ${inBenchmarks} ${inBenchmarks === 1 ? "benchmark" : "benchmarks"}.` : ""
        }`}
        bevestigLabel="Verwijderen"
        onBevestigen={verwijderd}
        onAnnuleren={() => setVerwijderenOpen(false)}
      />
    </div>
  );
}
