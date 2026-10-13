"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { hernoemRonde, maakMeting, startNieuweRonde } from "@/lib/db";
import {
  STANDAARD_ONDERDEEL,
  isSamengesteld,
  metingenInRonde,
  onderdeelVan,
  onderliggendeMetingen,
  rondesNieuwsteEerst,
} from "@/lib/rondes";
import { Organisatie, Ronde, ScanUitvoering } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";
import { SamengesteldeMetingFormulier } from "@/components/beheer/SamengesteldeMetingFormulier";
import { NaarRondeModal } from "@/components/beheer/NaarRondeModal";
import {
  OnderdeelRondeVelden,
  OnderdeelRondeWaarde,
  beginWaarde,
  rondeDoel,
} from "@/components/beheer/OnderdeelRondeVelden";
import { InfoIcoon } from "@/components/InfoIcoon";

/**
 * De Metingen van een organisatie, gegroepeerd per ronde (`beheerpagina.md`, punt 5, "Lijst Metingen in het
 * organisatie-detail"): De nieuwste ronde bovenaan, met per ronde een kop (naam met potlood, voortgang, "+ Meting aan deze
 * ronde", "Gemiddelde van deze ronde" en het overzicht van de ronde) en daaronder de Metingen. Metingen zonder ronde staan
 * onderaan. Boven de lijst staan "Nieuwe ronde starten" en het formulier om een Meting te plannen met ronde en onderdeel.
 */
export function MetingenSectie({ organisatie }: { organisatie: Organisatie }) {
  const router = useRouter();
  const assessments = useAssessments();
  const rondes = rondesNieuwsteEerst(organisatie);
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";

  /* ---------- Meting plannen ---------- */
  const [assessmentId, setAssessmentId] = useState("");
  const [concept, setConcept] = useState<OnderdeelRondeWaarde | null>(null); // `null`: De beginwaarde
  const [fout, setFout] = useState<string | null>(null);

  const keuzeAssessment = assessmentId || assessments[0]?.id || "";
  // Heeft de organisatie nog geen ronde, dan staat "Nieuwe ronde" voorgekozen.
  const waarde = concept ?? beginWaarde(organisatie);

  function plan(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    if (!keuzeAssessment) return;
    const r = maakMeting(organisatie.id, {
      assessmentId: keuzeAssessment,
      onderdeel: waarde.onderdeel,
      ...rondeDoel(waarde),
    });
    if (!r.ok) return setFout(r.reden);
    setConcept(null);
  }

  /* ---------- Selectie, rondes en modals ---------- */
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [nieuweRondeOpen, setNieuweRondeOpen] = useState(false);
  const [naarRondeOpen, setNaarRondeOpen] = useState(false);
  const [gemiddeldeRondeId, setGemiddeldeRondeId] = useState<string | null>(null);
  const [hernoemId, setHernoemId] = useState<string | null>(null);

  const zonderRonde = organisatie.scanUitvoeringen.filter((m) => !m.rondeId || !rondes.some((r) => r.id === m.rondeId));

  function metingRij(m: ScanUitvoering) {
    const samengesteld = isSamengesteld(m);
    const onder = samengesteld ? onderliggendeMetingen(organisatie, m).length : 0;
    const afgerond = m.invullingen.filter((i) => i.status === "afgerond").length;
    return (
      <tr key={m.id} className="admin-table-rij-klikbaar" onClick={() => router.push(`/beheer/metingen/${m.id}`)}>
        <td style={{ width: "2rem" }} onClick={(e) => e.stopPropagation()}>
          {!samengesteld && (
            <input
              type="checkbox"
              aria-label={`Kies ${m.label}`}
              checked={gekozen.includes(m.id)}
              onChange={(e) => setGekozen((g) => (e.target.checked ? [...g, m.id] : g.filter((x) => x !== m.id)))}
            />
          )}
        </td>
        <td>
          <strong>{m.label}</strong> <span className="text-ink-s">— {assessmentNaam(m.assessmentId)}</span>{" "}
          {samengesteld && <span className="admin-badge status-uitgenodigd">Gemiddelde</span>}
          {onderdeelVan(m) !== STANDAARD_ONDERDEEL && <span className="text-ink-s"> · {onderdeelVan(m)}</span>}
        </td>
        <td>
          {samengesteld
            ? `${onder} ${onder === 1 ? "Meting" : "Metingen"}`
            : `${m.invullingen.length} respondent${m.invullingen.length === 1 ? "" : "en"}, ${afgerond} afgerond`}
        </td>
        <td className="cel-knop">
          <Link href={`/beheer/metingen/${m.id}`} className="btn btn-outline btn-compact" onClick={(e) => e.stopPropagation()}>
            Bekijk
          </Link>
        </td>
      </tr>
    );
  }

  function rondeKop(r: Ronde) {
    const metingen = metingenInRonde(organisatie, r.id).filter((m) => !isSamengesteld(m));
    const totaal = metingen.reduce((n, m) => n + m.invullingen.length, 0);
    const afgerond = metingen.reduce((n, m) => n + m.invullingen.filter((i) => i.status === "afgerond").length, 0);
    return (
      <div className="flex flex-wrap items-center gap-3" style={{ margin: "1.4rem 0 0.5rem" }}>
        {hernoemId === r.id ? (
          <RondeNaamFormulier ronde={r} onKlaar={() => setHernoemId(null)} />
        ) : (
          <div className="titel-rij" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: 0 }}>{r.label}</h3>
            <button type="button" className="titel-potlood" aria-label="Naam van de ronde wijzigen" title="Naam van de ronde wijzigen" onClick={() => setHernoemId(r.id)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
        <span className="text-sm text-ink-m">
          {afgerond} van {totaal} afgerond
        </span>
        <span className="knoppenrij" style={{ marginLeft: "auto" }}>
          <button type="button" className="btn btn-outline btn-compact" onClick={() => { setConcept({ ...waarde, ronde: r.id }); document.getElementById("meting-plannen")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
            + Meting aan deze ronde
          </button>
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setGemiddeldeRondeId(r.id)}>
            Gemiddelde van deze ronde
          </button>
          <Link href={`/beheer/rondes/${r.id}`} className="btn btn-outline btn-compact">
            Overzicht
          </Link>
        </span>
      </div>
    );
  }

  const tabel = (metingen: ScanUitvoering[]) => (
    <table className="admin-table">
      <tbody>{metingen.map(metingRij)}</tbody>
    </table>
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3" style={{ marginTop: "2rem" }}>
        <span className="titel-rij" style={{ marginBottom: 0 }}>
          <h2 style={{ margin: 0 }}>Metingen</h2>
          <InfoIcoon sleutel="info.metingBegrippen" />
        </span>
        <button type="button" className="btn btn-or btn-compact" disabled={rondes.length === 0} onClick={() => setNieuweRondeOpen(true)}>
          Nieuwe ronde starten
        </button>
      </div>

      <form id="meting-plannen" onSubmit={plan} className="filter-rij flex flex-wrap items-end gap-3 mb-4" style={{ marginTop: "1rem" }}>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label>Assessment-type</label>
          <select value={keuzeAssessment} onChange={(e) => setAssessmentId(e.target.value)}>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.naam}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: "1 1 auto" }}>
          <OnderdeelRondeVelden organisatie={organisatie} waarde={waarde} onChange={setConcept} idPrefix="meting-plannen" />
        </div>
        <button type="submit" className="btn btn-or btn-compact">
          + Meting plannen
        </button>
      </form>
      {fout && <p className="overzicht-melding fout">{fout}</p>}

      {gekozen.length > 0 && (
        <div className="knoppenrij" style={{ margin: "0.5rem 0" }}>
          <span className="text-sm text-ink-m">{gekozen.length} geselecteerd</span>
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setNaarRondeOpen(true)}>
            Naar ronde…
          </button>
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setGekozen([])}>
            Selectie wissen
          </button>
        </div>
      )}

      {organisatie.scanUitvoeringen.length === 0 ? (
        <p className="admin-notice">Nog geen meting gepland voor deze organisatie.</p>
      ) : (
        <>
          {rondes.map((r) => (
            <div key={r.id}>
              {rondeKop(r)}
              {tabel(metingenInRonde(organisatie, r.id))}
            </div>
          ))}
          {zonderRonde.length > 0 && (
            <div>
              {rondes.length > 0 && <h3 style={{ margin: "1.4rem 0 0.5rem" }}>Zonder ronde</h3>}
              {tabel(zonderRonde)}
            </div>
          )}
        </>
      )}

      <Modal open={nieuweRondeOpen} onClose={() => setNieuweRondeOpen(false)} title="Nieuwe ronde starten">
        {nieuweRondeOpen && (
          <NieuweRondeFormulier
            organisatie={organisatie}
            onKlaar={(ronde, aantal) => {
              setNieuweRondeOpen(false);
              zetBeheerMelding({ tekst: `Ronde "${ronde.label}" gestart met ${aantal} ${aantal === 1 ? "Meting" : "Metingen"}.` });
            }}
            onAnnuleren={() => setNieuweRondeOpen(false)}
          />
        )}
      </Modal>

      {naarRondeOpen && (
        <NaarRondeModal
          organisatie={organisatie}
          metingIds={gekozen}
          onSluit={() => setNaarRondeOpen(false)}
          onKlaar={(tekst) => {
            setNaarRondeOpen(false);
            setGekozen([]);
            zetBeheerMelding({ tekst });
          }}
        />
      )}

      <Modal open={gemiddeldeRondeId !== null} onClose={() => setGemiddeldeRondeId(null)} title="Gemiddelde van deze ronde">
        {gemiddeldeRondeId && (
          <SamengesteldeMetingFormulier
            organisatie={organisatie}
            rondeId={gemiddeldeRondeId}
            onKlaar={(meting) => {
              setGemiddeldeRondeId(null);
              router.push(`/beheer/metingen/${meting.id}`);
            }}
            onAnnuleren={() => setGemiddeldeRondeId(null)}
          />
        )}
      </Modal>
    </>
  );
}

function RondeNaamFormulier({ ronde, onKlaar }: { ronde: Ronde; onKlaar: () => void }) {
  const [naam, setNaam] = useState(ronde.label);
  const [fout, setFout] = useState<string | null>(null);
  return (
    <form
      className="flex flex-wrap items-start gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const r = hernoemRonde(ronde.id, naam);
        if (!r.ok) return setFout(r.reden);
        onKlaar();
      }}
    >
      <div className="admin-field" style={{ marginBottom: 0, minWidth: "16rem" }}>
        <input type="text" autoFocus required aria-label="Naam van de ronde" value={naam} onChange={(e) => setNaam(e.target.value)} />
        {fout && <p className="overzicht-melding fout" style={{ marginTop: "0.4rem" }}>{fout}</p>}
      </div>
      <button type="submit" className="btn btn-or btn-compact">
        Opslaan
      </button>
      <button type="button" className="btn btn-outline btn-compact" onClick={onKlaar}>
        Annuleren
      </button>
    </form>
  );
}

/**
 * "Nieuwe ronde starten" (`beheerpagina.md`, punt 5): Naam (verplicht), de vorige ronde (standaard de nieuwste), de Metingen
 * daarvan met een vinkje (standaard allemaal aan), samengestelde Metingen alleen aan te vinken als al hun onderliggende
 * Metingen aanstaan, en "Respondenten meenemen" (standaard uit).
 */
function NieuweRondeFormulier({
  organisatie,
  onKlaar,
  onAnnuleren,
}: {
  organisatie: Organisatie;
  onKlaar: (ronde: Ronde, aantalMetingen: number) => void;
  onAnnuleren: () => void;
}) {
  const assessments = useAssessments();
  const rondes = rondesNieuwsteEerst(organisatie);
  const [naam, setNaam] = useState("");
  const [vanRondeId, setVanRondeId] = useState(rondes[0]?.id ?? "");
  const [uit, setUit] = useState<string[]>([]); // uitgevinkte Metingen
  const [respondenten, setRespondenten] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const metingen = metingenInRonde(organisatie, vanRondeId);
  const aan = (m: ScanUitvoering) => !uit.includes(m.id);
  const kanSamengesteld = (m: ScanUitvoering) => (m.samenstelling ?? []).every((id) => metingen.some((x) => x.id === id && aan(x)));
  const meegaand = metingen.filter((m) => aan(m) && (!isSamengesteld(m) || kanSamengesteld(m)));
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    const r = startNieuweRonde(organisatie.id, { label: naam, vanRondeId, metingIds: meegaand.map((m) => m.id), respondentenMeenemen: respondenten });
    if (!r.ok) return setFout(r.reden);
    onKlaar(r.ronde, r.aantalMetingen);
  }

  return (
    <form onSubmit={opslaan} className="text-left">
      <div className="admin-field">
        <label>Naam van de nieuwe ronde</label>
        <input type="text" required autoFocus value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Nameting 2027" />
      </div>
      <div className="admin-field">
        <label>Vanuit</label>
        <select value={vanRondeId} onChange={(e) => { setVanRondeId(e.target.value); setUit([]); }}>
          {rondes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div className="admin-field">
        <label>Metingen die meegaan</label>
        <div className="flex flex-col gap-1">
          {metingen.map((m) => {
            const samengesteld = isSamengesteld(m);
            const kan = !samengesteld || kanSamengesteld(m);
            return (
              <label key={m.id} className="flex items-center gap-2 text-sm" style={{ opacity: kan ? 1 : 0.6 }}>
                <input
                  type="checkbox"
                  disabled={!kan}
                  checked={aan(m) && kan}
                  onChange={(e) => setUit((u) => (e.target.checked ? u.filter((x) => x !== m.id) : [...u, m.id]))}
                />
                <span>
                  {m.label} <span className="text-ink-s">— {onderdeelVan(m)} · {assessmentNaam(m.assessmentId)}</span>
                  {samengesteld && <span className="admin-badge status-uitgenodigd" style={{ marginLeft: "0.4rem" }}>Gemiddelde</span>}
                  {samengesteld && !kan && <span className="text-ink-s"> · alleen mee als al haar onderliggende Metingen meegaan</span>}
                </span>
              </label>
            );
          })}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm" style={{ marginBottom: "1rem" }}>
        <input type="checkbox" checked={respondenten} onChange={(e) => setRespondenten(e.target.checked)} />
        Respondenten meenemen (dezelfde Respondenten, status uitgenodigd, eigen persoonlijke link)
      </label>
      {fout && <p className="overzicht-melding fout">{fout}</p>}
      <div className="btn-rij">
        <button type="button" className="btn btn-outline" onClick={onAnnuleren}>
          Annuleren
        </button>
        <button type="submit" className="btn btn-or" disabled={meegaand.length === 0 || !naam.trim()}>
          Ronde starten
        </button>
      </div>
    </form>
  );
}
