"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import {
  bewerkRespondent,
  useOrganisaties,
  verwijderLeden,
  vindRespondentConflict,
} from "@/lib/db";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magLeadToekennen, magRespondentVerwijderen, zichtbareOrganisaties } from "@/lib/rechten";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";
import { downloadAvgInzage } from "@/lib/avg-inzage";
import { overzichtHref } from "@/lib/beheer-url";
import { Organisatie, OrganisatieLid } from "@/lib/types";
import { DropdownKnop } from "@/components/DropdownKnop";
import { InfoIcoon } from "@/components/InfoIcoon";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";
import { RespondentStatusBadge, STATUS_LABEL } from "@/components/beheer/overzicht-helpers";
import { ToegangBlok } from "@/components/beheer/ToegangBlok";
import {
  NaarAndereMetingStap,
  NaarAndereOrganisatieStap,
  RespondentVerplaatsenStap,
  ScanVerplaatsResultaat,
} from "@/components/beheer/VerplaatsStappen";

interface GegevensInput {
  naam: string;
  email: string;
  functie: string;
  team: string;
  notities: string;
}

type Stap =
  | { soort: "verplaatsen" }
  | { soort: "scan-meting"; invullingId: string }
  | { soort: "scan-org"; invullingId: string }
  | { soort: "samenvoegen"; input: GegevensInput; conflict: OrganisatieLid };

interface Melding {
  tekst: string;
  details?: string[];
  fout?: boolean;
}

/**
 * Respondent-overzicht (beheerpagina.md punt 6b): kop, gegevens, toegang,
 * scans en de acties op de hele Respondent, in één modal. Elke actie die
 * meer vraagt dan één klik wordt een vervolgstap binnen dezelfde modal.
 */
export function RespondentOverzicht({
  organisatie,
  lid,
  onSluit,
  onOpenScan,
}: {
  organisatie: Organisatie;
  lid: OrganisatieLid;
  onSluit: () => void;
  onOpenScan: (invullingId: string) => void;
}) {
  const assessments = useAssessments();
  const ingelogd = useIngelogdeGebruiker();
  const alleOrganisaties = useOrganisaties();
  const router = useRouter();
  const pathname = usePathname();
  const mogelijkeOrganisaties = zichtbareOrganisaties(ingelogd, alleOrganisaties);

  const [stap, setStap] = useState<Stap | null>(null);
  const [bewerken, setBewerken] = useState(false);
  const [form, setForm] = useState<GegevensInput>({
    naam: lid.naam ?? "",
    email: lid.email,
    functie: lid.functie,
    team: lid.team,
    notities: lid.notities,
  });
  const [melding, setMelding] = useState<Melding | null>(null);
  const [verwijderenOpen, setVerwijderenOpen] = useState(false);

  const scans = organisatie.scanUitvoeringen.flatMap((s) =>
    s.invullingen.filter((i) => i.organisatieLidId === lid.id).map((i) => ({ meting: s, invulling: i }))
  );
  const link = typeof window === "undefined" ? "" : maakPubliekeLink(window.location.origin, lid);
  const naam = lid.naam || lid.email;
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";
  const magLead = magLeadToekennen(ingelogd, organisatie);
  const magVerwijderen = magRespondentVerwijderen(ingelogd, organisatie);

  function beschrijfOvergeslagen(overgeslagen: { metingLabel?: string; reden: string }[]): string[] {
    return overgeslagen.map((o) => (o.metingLabel ? `${o.metingLabel}: ${o.reden}` : o.reden));
  }

  function handleOpslaan(e: React.FormEvent) {
    e.preventDefault();
    const conflict = vindRespondentConflict(lid.id, form.email);
    if (conflict) {
      setStap({ soort: "samenvoegen", input: form, conflict });
      return;
    }
    bewerkRespondent(lid.id, form);
    setBewerken(false);
    setMelding({ tekst: "Gegevens opgeslagen." });
  }

  function handleSamenvoegen(input: GegevensInput, conflict: OrganisatieLid) {
    const r = bewerkRespondent(lid.id, input, conflict.id);
    if (r?.respondentVerwijderd) {
      zetBeheerMelding({
        tekst: `${naam} is samengevoegd met ${conflict.naam || conflict.email}: alle scans staan nu bij die Respondent.`,
        link: { href: overzichtHref(pathname, "respondent", conflict.id), label: "Bekijk die Respondent →" },
      });
      onSluit();
      return;
    }
    setStap(null);
    setBewerken(false);
    setMelding({
      tekst: `${r?.verplaatst ?? 0} scan(s) verplaatst, ${r?.overgeslagen.length ?? 0} overgeslagen en bij ${naam} gebleven. ${naam} is niet verwijderd.`,
      details: beschrijfOvergeslagen(r?.overgeslagen ?? []),
      fout: true,
    });
  }

  function handleScanVerplaatst(r: ScanVerplaatsResultaat, extra?: string) {
    setStap(null);
    setMelding({
      tekst:
        r.overgeslagen.length === 0
          ? `${r.verplaatst === 1 ? "Scan" : `${r.verplaatst} scans`} verplaatst naar Meting "${r.doelLabel}"${extra ?? ""}.`
          : `${r.verplaatst} scan(s) verplaatst, ${r.overgeslagen.length} overgeslagen.`,
      details: r.overgeslagen.map((o) => o.reden),
      fout: r.overgeslagen.length > 0,
    });
  }

  function handleVerwijderd() {
    verwijderLeden([lid.id]);
    setVerwijderenOpen(false);
    zetBeheerMelding({ tekst: `${naam} is verwijderd, met al zijn ingevulde scans.` });
    onSluit();
  }

  const terug = () => setStap(null);

  let inhoud: React.ReactNode;
  if (stap?.soort === "scan-meting") {
    inhoud = (
      <NaarAndereMetingStap
        organisatie={organisatie}
        invullingIds={[stap.invullingId]}
        onTerug={terug}
        onKlaar={(r) => handleScanVerplaatst(r)}
      />
    );
  } else if (stap?.soort === "scan-org") {
    inhoud = (
      <NaarAndereOrganisatieStap
        organisatie={organisatie}
        invullingId={stap.invullingId}
        mogelijkeOrganisaties={mogelijkeOrganisaties}
        onTerug={terug}
        onKlaar={(r) => handleScanVerplaatst(r, ` in ${r.doelOrganisatieNaam}`)}
      />
    );
  } else if (stap?.soort === "verplaatsen") {
    inhoud = (
      <RespondentVerplaatsenStap
        organisatie={organisatie}
        lid={lid}
        mogelijkeOrganisaties={mogelijkeOrganisaties}
        onTerug={terug}
        onKlaar={(r) => {
          if (r.respondentVerwijderd || !r.overgeslagen.length) {
            const aantal = r.verplaatst;
            zetBeheerMelding({
              tekst: `${naam} is verplaatst naar ${r.doelOrganisatieNaam} (${aantal} scan${aantal === 1 ? "" : "s"}).${
                r.respondentVerwijderd ? " De Respondent is samengevoegd met een bestaande Respondent daar." : ""
              }`,
              link: r.doelLidId
                ? { href: overzichtHref(pathname, "respondent", r.doelLidId), label: `Bekijk in ${r.doelOrganisatieNaam} →` }
                : undefined,
            });
            onSluit();
            return;
          }
          setStap(null);
          setMelding({
            tekst: `${r.verplaatst} scan(s) verplaatst naar ${r.doelOrganisatieNaam}, ${r.overgeslagen.length} overgeslagen en bij ${naam} gebleven. ${naam} is niet verwijderd.`,
            details: beschrijfOvergeslagen(r.overgeslagen),
            fout: true,
          });
        }}
      />
    );
  } else if (stap?.soort === "samenvoegen") {
    const { input, conflict } = stap;
    inhoud = (
      <div>
        <button type="button" className="overzicht-stap-terug" onClick={terug}>
          ← Terug
        </button>
        <h2 className="mb-3 text-lg font-bold text-ink">Samenvoegen met bestaande Respondent</h2>
        <p className="text-sm text-ink-m">
          Het e-mailadres {input.email.trim().toLowerCase()} hoort in {organisatie.naam} al bij{" "}
          <strong>{conflict.naam || conflict.email}</strong>. Als je doorgaat, gaan de scans van {naam} naar die
          Respondent en wordt {naam} met de persoonlijke link verwijderd: die link werkt daarna niet meer. De
          gegevens van de bestaande Respondent blijven ongewijzigd. Heeft die in dezelfde Meting al een scan, dan blijft
          die ene scan bij {naam} staan en wordt {naam} niet verwijderd.
        </p>
        <div className="btn-rij" style={{ marginTop: "1.2rem" }}>
          <button type="button" className="btn btn-outline" onClick={terug}>
            Annuleren
          </button>
          <button type="button" className="btn btn-danger" onClick={() => handleSamenvoegen(input, conflict)}>
            Samenvoegen
          </button>
        </div>
      </div>
    );
  } else {
    inhoud = (
      <>
        <div className="overzicht-kop">
          <h2>{naam}</h2>
          <div className="overzicht-kop-sub">
            <span>{organisatie.naam}</span>
            <RespondentStatusBadge invullingen={scans.map((s) => s.invulling)} />
            {lid.leadMetingIds.length > 0 && <span className="lead-badge">Lead</span>}
          </div>
        </div>

        {melding && (
          <div className={`overzicht-melding ${melding.fout ? "fout" : ""}`} role="status">
            {melding.tekst}
            {melding.details && melding.details.length > 0 && (
              <ul style={{ margin: "0.4rem 0 0 1.1rem", listStyle: "disc" }}>
                {melding.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <section className="overzicht-blok">
          <div className="overzicht-blok-kop">
            <h3>Gegevens</h3>
            {!bewerken && (
              <button type="button" className="btn btn-outline btn-compact" onClick={() => setBewerken(true)}>
                Bewerken
              </button>
            )}
          </div>
          {bewerken ? (
            <form onSubmit={handleOpslaan}>
              <div className="admin-field">
                <label>Naam</label>
                <input type="text" value={form.naam} onChange={(e) => setForm({ ...form, naam: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>E-mailadres</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Rol / functie</label>
                <input type="text" value={form.functie} onChange={(e) => setForm({ ...form, functie: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Team</label>
                <input type="text" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Notities</label>
                <textarea rows={3} value={form.notities} onChange={(e) => setForm({ ...form, notities: e.target.value })} />
              </div>
              <div className="overzicht-acties">
                <button type="submit" className="btn btn-or btn-compact">
                  Opslaan
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-compact"
                  onClick={() => {
                    setForm({ naam: lid.naam ?? "", email: lid.email, functie: lid.functie, team: lid.team, notities: lid.notities });
                    setBewerken(false);
                  }}
                >
                  Annuleren
                </button>
                <InfoIcoon naastVeld sleutel="info.respondentBewerken" />
              </div>
            </form>
          ) : (
            <dl className="beschrijvingslijst">
              <dt>Naam</dt>
              <dd>{lid.naam}</dd>
              <dt>E-mail</dt>
              <dd>{lid.email}</dd>
              <dt>Functie</dt>
              <dd>{lid.functie}</dd>
              <dt>Team</dt>
              <dd>{lid.team}</dd>
              <dt>Notities</dt>
              <dd>{lid.notities}</dd>
            </dl>
          )}
        </section>

        <ToegangBlok
          organisatie={organisatie}
          lid={lid}
          link={link}
          magLead={magLead}
          onMelding={(tekst, fout) => setMelding({ tekst, fout })}
        />

        <section className="overzicht-blok">
          <div className="overzicht-blok-kop">
            <h3>Scans ({scans.length})</h3>
          </div>
          {scans.length === 0 ? (
            <p className="text-sm text-ink-m">Deze Respondent heeft geen scans.</p>
          ) : (
            scans.map(({ meting, invulling }) => (
              <div key={invulling.id} className="overzicht-scanregel">
                <button
                  type="button"
                  className="btn btn-outline btn-compact"
                  style={{ textAlign: "left", whiteSpace: "normal" }}
                  onClick={() => onOpenScan(invulling.id)}
                >
                  {meting.label} <span style={{ color: "var(--ink-s)", fontWeight: 400 }}>— {assessmentNaam(meting.assessmentId)}</span>
                </button>
                <div className="overzicht-scanregel-rechts">
                  <span className={`admin-badge status-${invulling.status}`}>{STATUS_LABEL[invulling.status]}</span>
                  <DropdownKnop
                    label="Acties"
                    opties={[
                      {
                        label: "Bekijk resultaten",
                        onClick: () => router.push(`/beheer/resultaten/${invulling.id}`),
                        disabled: invulling.status !== "afgerond",
                        title: invulling.status !== "afgerond" ? "Alleen bij een afgeronde scan" : undefined,
                      },
                      { label: "Naar andere Meting", onClick: () => setStap({ soort: "scan-meting", invullingId: invulling.id }) },
                      { label: "Naar andere organisatie", onClick: () => setStap({ soort: "scan-org", invullingId: invulling.id }) },
                    ]}
                  />
                </div>
              </div>
            ))
          )}
        </section>

        <section className="overzicht-blok">
          <div className="overzicht-blok-kop">
            <h3>Beheer van deze Respondent</h3>
          </div>
          <div className="overzicht-acties">
            <button type="button" className="btn btn-outline btn-compact" onClick={() => setStap({ soort: "verplaatsen" })}>
              Verplaatsen
            </button>
            <button type="button" className="btn btn-outline btn-compact" onClick={() => downloadAvgInzage(organisatie, lid, assessments)}>
              AVG-inzage
            </button>
            <button
              type="button"
              className="btn btn-danger btn-compact"
              disabled={!magVerwijderen}
              onClick={() => setVerwijderenOpen(true)}
            >
              Verwijderen
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <OverzichtModal label={`Respondent ${naam}`} onSluit={onSluit} escUitgeschakeld={verwijderenOpen}>
        {inhoud}
      </OverzichtModal>
      <BevestigModal
        open={verwijderenOpen}
        titel="Respondent verwijderen"
        bericht={`${naam} definitief verwijderen, met ${scans.length} ingevulde scan${scans.length === 1 ? "" : "s"} en de persoonlijke link? Dit kan niet ongedaan gemaakt worden.`}
        bevestigLabel="Respondent verwijderen"
        onBevestigen={handleVerwijderd}
        onAnnuleren={() => setVerwijderenOpen(false)}
      />
    </>
  );
}
