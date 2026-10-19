"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { maakMeting, zetMeetdatum } from "@/lib/db";
import {
  STANDAARD_ONDERDEEL,
  dubbeleCombinatieTekst,
  isGeldigeDatum,
  isSamengesteld,
  metingMetCombinatie,
  nieuwsteEerst,
  onderdeelVan,
  onderliggendeMetingen,
  toonMeetdatum,
  DATUM_ONTBREEKT,
  meetdatumVan,
} from "@/lib/metingen";
import { Organisatie, ScanUitvoering } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";
import { SamengesteldeMetingFormulier } from "@/components/beheer/SamengesteldeMetingFormulier";
import { ScansSamenbrengenModal } from "@/components/beheer/ScansSamenbrengenModal";
import {
  OnderdeelMeetdatumVelden,
  onderdeelFout,
  onderdeelNaamVoorOpslaan,
  OnderdeelMeetdatumWaarde,
  beginWaarde,
  metingNaam,
} from "@/components/beheer/OnderdeelMeetdatumVelden";
import { InfoIcoon } from "@/components/InfoIcoon";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magImporteren } from "@/lib/rechten";

/**
 * De Metingen van een organisatie (`beheerpagina.md`, punt 5, "Lijst Metingen in het organisatie-detail"): Eén lijst op
 * meetdatum met de nieuwste bovenaan, een Meting zonder meetdatum onderaan met "Datum ontbreekt". Boven de lijst staat het
 * formulier om een Meting te plannen (Assessment-type, Onderdeel en Meetdatum), met "Gemiddelde maken". Op een selectie komen
 * "Meetdatum instellen…" en "Samenbrengen in één Meting…" erbij.
 */
export function MetingenSectie({ organisatie }: { organisatie: Organisatie }) {
  const router = useRouter();
  const ingelogd = useIngelogdeGebruiker();
  const assessments = useAssessments();
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";

  /* ---------- Meting plannen ---------- */
  const [assessmentId, setAssessmentId] = useState("");
  const [concept, setConcept] = useState<OnderdeelMeetdatumWaarde | null>(null); // `null`: De beginwaarde
  const [fout, setFout] = useState<string | null>(null);

  const keuzeAssessment = assessmentId || assessments[0]?.id || "";
  const waarde = concept ?? beginWaarde();
  const onderdeelNaam = onderdeelNaamVoorOpslaan(organisatie, waarde);
  const dubbel = keuzeAssessment ? metingMetCombinatie(organisatie, onderdeelNaam, keuzeAssessment, waarde.meetdatum) : undefined;

  function plan(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    if (!keuzeAssessment) return;
    const onderdeelProbleem = onderdeelFout(organisatie, waarde);
    if (onderdeelProbleem) return setFout(onderdeelProbleem);
    if (!isGeldigeDatum(waarde.meetdatum)) return setFout("Kies een meetdatum.");
    const r = maakMeting(organisatie.id, {
      assessmentId: keuzeAssessment,
      onderdeel: onderdeelNaam,
      meetdatum: waarde.meetdatum,
    });
    if (!r.ok) return setFout(r.reden);
    setConcept(null);
  }

  /* ---------- Selectie en modals ---------- */
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [gemiddeldeOpen, setGemiddeldeOpen] = useState(false);
  const [datumOpen, setDatumOpen] = useState(false);
  const [samenbrengenOpen, setSamenbrengenOpen] = useState(false);

  const metingen = useMemo(() => nieuwsteEerst(organisatie.scanUitvoeringen), [organisatie.scanUitvoeringen]);
  const geselecteerd = metingen.filter((m) => gekozen.includes(m.id));
  const gewoneGeselecteerd = geselecteerd.filter((m) => !isSamengesteld(m));
  const meerdereAssessments = new Set(gewoneGeselecteerd.map((m) => m.assessmentId)).size > 1;
  const scanIds = gewoneGeselecteerd.flatMap((m) => m.invullingen.map((i) => i.id));

  function metingRij(m: ScanUitvoering) {
    const samengesteld = isSamengesteld(m);
    const onder = samengesteld ? onderliggendeMetingen(organisatie, m).length : 0;
    const afgerond = m.invullingen.filter((i) => i.status === "afgerond").length;
    const datum = meetdatumVan(m);
    return (
      <tr key={m.id} className="admin-table-rij-klikbaar" onClick={() => router.push(`/beheer/metingen/${m.id}`)}>
        <td style={{ width: "2rem" }} onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            aria-label={`Kies ${m.label}`}
            checked={gekozen.includes(m.id)}
            onChange={(e) => setGekozen((g) => (e.target.checked ? [...g, m.id] : g.filter((x) => x !== m.id)))}
          />
        </td>
        <td>
          <strong>{m.label}</strong> <span className="text-ink-s">— {assessmentNaam(m.assessmentId)}</span>{" "}
          {samengesteld && <span className="admin-badge status-uitgenodigd">Gemiddelde</span>}
          {onderdeelVan(organisatie, m) !== STANDAARD_ONDERDEEL && <span className="text-ink-s"> · {onderdeelVan(organisatie, m)}</span>}
        </td>
        <td className={datum ? undefined : "text-ink-s"}>{datum ? toonMeetdatum(datum) : DATUM_ONTBREEKT}</td>
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

  const naam = metingNaam(waarde);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3" style={{ marginTop: "2rem" }}>
        <span className="titel-rij" style={{ marginBottom: 0 }}>
          <h2 style={{ margin: 0 }}>Metingen</h2>
          <InfoIcoon sleutel="info.metingBegrippen" />
        </span>
        <button type="button" className="btn btn-outline btn-compact" onClick={() => setGemiddeldeOpen(true)}>
          Gemiddelde maken
        </button>
        {/* Importeren (`beheerpagina.md`, punt 8): Rechts in de kop, alleen voor een Admin. */}
        {magImporteren(ingelogd) && (
          <button
            type="button"
            className="btn btn-outline btn-compact"
            style={{ marginLeft: "auto" }}
            onClick={() => router.push(`/beheer/organisaties/${organisatie.id}/import`)}
          >
            Importeren
          </button>
        )}
      </div>

      {/* Veldenrij met labels en een knop (`stylesheet.md`, Formulieren): `items-start`, elk veld met zijn label in een eigen
          kolom, de knop met een lege labelregel erboven. De regel "Wordt: …" staat onder de rij en duwt geen veld omlaag. */}
      <form id="meting-plannen" onSubmit={plan} className="filter-rij flex flex-wrap items-start gap-3" style={{ marginTop: "1rem" }}>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label htmlFor="meting-plannen-assessment">Assessment-type</label>
          <select id="meting-plannen-assessment" value={keuzeAssessment} onChange={(e) => setAssessmentId(e.target.value)}>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.naam}
              </option>
            ))}
          </select>
        </div>
        <OnderdeelMeetdatumVelden organisatie={organisatie} waarde={waarde} onChange={setConcept} idPrefix="meting-plannen" inRij />
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label aria-hidden="true" style={{ visibility: "hidden" }}>
            &nbsp;
          </label>
          <button type="submit" className="btn btn-or btn-compact">
            + Meting plannen
          </button>
        </div>
      </form>
      {naam && (
        <p className="text-sm text-ink-m" style={{ margin: "0.5rem 0 0" }}>
          Wordt: <strong>{naam}</strong>
        </p>
      )}
      {dubbel && (
        <p className="overzicht-melding" style={{ margin: "0.5rem 0 0" }}>
          {dubbeleCombinatieTekst(dubbel.label)}
        </p>
      )}
      {fout && <p className="overzicht-melding fout">{fout}</p>}

      {gekozen.length > 0 && (
        <div className="knoppenrij" style={{ margin: "1rem 0 0.5rem" }}>
          <span className="text-sm text-ink-m">{gekozen.length} geselecteerd</span>
          <button type="button" className="btn btn-outline btn-compact" disabled={gewoneGeselecteerd.length === 0} onClick={() => setDatumOpen(true)}>
            Meetdatum instellen…
          </button>
          <button
            type="button"
            className="btn btn-outline btn-compact"
            disabled={scanIds.length === 0 || meerdereAssessments}
            onClick={() => setSamenbrengenOpen(true)}
          >
            Samenbrengen in één Meting…
          </button>
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setGekozen([])}>
            Selectie wissen
          </button>
        </div>
      )}

      {organisatie.scanUitvoeringen.length === 0 ? (
        <p className="admin-notice" style={{ marginTop: "1rem" }}>
          Nog geen meting gepland voor deze organisatie.
        </p>
      ) : (
        <table className="admin-table" style={{ marginTop: "1rem" }}>
          <tbody>{metingen.map(metingRij)}</tbody>
        </table>
      )}

      <Modal open={gemiddeldeOpen} onClose={() => setGemiddeldeOpen(false)} title="Gemiddelde maken">
        {gemiddeldeOpen && (
          <SamengesteldeMetingFormulier
            organisatie={organisatie}
            onKlaar={(meting) => {
              setGemiddeldeOpen(false);
              router.push(`/beheer/metingen/${meting.id}`);
            }}
            onAnnuleren={() => setGemiddeldeOpen(false)}
          />
        )}
      </Modal>

      <Modal open={datumOpen} onClose={() => setDatumOpen(false)} title="Meetdatum instellen">
        {datumOpen && (
          <MeetdatumInstellenFormulier
            organisatie={organisatie}
            metingen={gewoneGeselecteerd}
            overgeslagen={geselecteerd.length - gewoneGeselecteerd.length}
            onKlaar={(tekst) => {
              setDatumOpen(false);
              setGekozen([]);
              zetBeheerMelding({ tekst });
            }}
            onAnnuleren={() => setDatumOpen(false)}
          />
        )}
      </Modal>

      {samenbrengenOpen && (
        <ScansSamenbrengenModal
          organisatie={organisatie}
          invullingIds={scanIds}
          onSluit={() => {
            setSamenbrengenOpen(false);
            setGekozen([]);
          }}
          onKlaar={() => {}}
        />
      )}
    </>
  );
}

/**
 * "Meetdatum instellen…" (`beheerpagina.md`, punt 5): Eén datumveld en de lijst van de geselecteerde Metingen, die de datum
 * allemaal krijgen. Bedoeld voor de bestaande Metingen die na het wegvallen van de rondes nog geen meetdatum hebben.
 */
function MeetdatumInstellenFormulier({
  organisatie,
  metingen,
  overgeslagen,
  onKlaar,
  onAnnuleren,
}: {
  organisatie: Organisatie;
  metingen: ScanUitvoering[];
  overgeslagen: number;
  onKlaar: (tekst: string) => void;
  onAnnuleren: () => void;
}) {
  const [datum, setDatum] = useState("");
  const [fout, setFout] = useState<string | null>(null);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    const r = zetMeetdatum(
      organisatie.id,
      metingen.map((m) => m.id),
      datum
    );
    if (!r.ok) return setFout(r.reden);
    onKlaar(`Meetdatum ${toonMeetdatum(datum)} ingesteld voor ${r.gewijzigd} ${r.gewijzigd === 1 ? "Meting" : "Metingen"}.`);
  }

  return (
    <form onSubmit={opslaan} className="text-left">
      <div className="admin-field">
        <label htmlFor="meetdatum-instellen">Meetdatum</label>
        <input id="meetdatum-instellen" type="date" required autoFocus value={datum} onChange={(e) => setDatum(e.target.value)} />
      </div>
      <p className="text-sm text-ink-m" style={{ margin: "0 0 0.4rem" }}>
        Deze {metingen.length === 1 ? "Meting krijgt" : "Metingen krijgen"} de datum:
      </p>
      <ul className="text-sm text-ink-m" style={{ listStyle: "disc", paddingLeft: "1.2rem", marginBottom: "1rem" }}>
        {metingen.map((m) => (
          <li key={m.id}>
            {m.label} <span className="text-ink-s">— nu {toonMeetdatum(meetdatumVan(m))}</span>
          </li>
        ))}
      </ul>
      {overgeslagen > 0 && (
        <p className="text-sm text-ink-s">
          Een samengestelde Meting in de selectie doet niet mee: Haar meetdatum volgt de onderliggende Metingen.
        </p>
      )}
      {fout && <p className="overzicht-melding fout">{fout}</p>}
      <div className="btn-rij">
        <button type="button" className="btn btn-outline" onClick={onAnnuleren}>
          Annuleren
        </button>
        <button type="submit" className="btn btn-or" disabled={!isGeldigeDatum(datum) || metingen.length === 0}>
          Meetdatum instellen
        </button>
      </div>
    </form>
  );
}
