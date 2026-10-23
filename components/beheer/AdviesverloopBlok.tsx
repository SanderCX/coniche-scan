"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InfoIcoon } from "@/components/InfoIcoon";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { useAssessments } from "@/lib/assessment-store";
import { useAdviesCatalogus } from "@/lib/advies-catalogus-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { adviesverlopenVan, adviesverloopVoorMeting, faseRegel, heeftAfgerondeScans, heeftBouwstenenMetScore, lopendAdviesverloop, onderdeelNaamVan } from "@/lib/advies";
import { startAdviesverloop } from "@/lib/db";
import { aantalAfgerondInMeting, meetdatumVan, toonMeetdatum, vergelijkNieuwsteEerst } from "@/lib/metingen";
import { maandJaarLang } from "@/lib/mijn-metingen";
import { magAdviesverloop } from "@/lib/rechten";
import type { Organisatie } from "@/lib/types";

/**
 * De kaart Adviesverloop op het organisatie-detail (`beheerpagina.md`, punt 4, Kaart Adviesverloop): Onder het Dossier en boven de Metingen, alleen voor wie
 * `adviesverloop.bekijken` heeft. Per Onderdeel met een adviesverloop (of voor de hele Organisatie) één rij met de naam van het Onderdeel, de status, de huidige fase
 * met de voortgang, het aantal gekoppelde Metingen en de knop "Openen". Heeft de Organisatie nog geen adviesverloop, dan staat er "Nog geen adviesverloop" met
 * de knop "Adviesverloop starten", die vraagt welke Meting het begin is. De knop is uitgeschakeld zonder Meting met afgeronde scans, met de reden in een Info-icoon.
 */
export function AdviesverloopBlok({ organisatie }: { organisatie: Organisatie }) {
  const gebruiker = useIngelogdeGebruiker();
  const catalogus = useAdviesCatalogus();
  const assessments = useAssessments();
  const [startOpen, setStartOpen] = useState(false);
  if (!magAdviesverloop(gebruiker, organisatie)) return null;
  const lijst = [...adviesverlopenVan(organisatie)].sort((a, b) => (a.status === b.status ? b.aangemaaktOp.localeCompare(a.aangemaaktOp) : a.status === "lopend" ? -1 : 1));
  const kanStarten = organisatie.scanUitvoeringen.some((m) => heeftAfgerondeScans(organisatie, m) && heeftBouwstenenMetScore(assessments.find((a) => a.id === m.assessmentId)));

  return (
    <section className="beheer-kaart org-anker" id="adviesverloop" aria-label="Adviesverloop">
      <div className="beheer-kaart-kop">
        <h2>Adviesverloop</h2>
        {lijst.length === 0 && (
          <span className="knop-met-icoon">
            <button type="button" className="btn btn-or btn-compact" disabled={!kanStarten} onClick={() => setStartOpen(true)}>
              Adviesverloop starten
            </button>
            {!kanStarten && <InfoIcoon naastVeld sleutel="info.adviesverloopStarten" voorloop="Er is nog geen Meting met afgeronde scans." />}
          </span>
        )}
      </div>
      {lijst.length === 0 ? (
        <p className="text-sm text-ink-s">Nog geen adviesverloop</p>
      ) : (
        <table className="admin-table">
          <tbody>
            {lijst.map((av) => (
              <tr key={av.id}>
                <td>
                  <strong>{onderdeelNaamVan(organisatie, av.onderdeelId)}</strong>
                </td>
                <td>{av.status === "lopend" ? "Lopend" : "Afgerond"}</td>
                <td>{faseRegel(catalogus, av) ?? "Geen fasen met stappen"}</td>
                <td>
                  {av.metingen.length} {av.metingen.length === 1 ? "Meting" : "Metingen"}
                </td>
                <td className="cel-knop">
                  <Link className="btn btn-outline btn-compact" href={`/beheer/organisaties/${organisatie.id}/adviesverloop/${av.id}`}>
                    Openen
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {startOpen && <StartModal organisatie={organisatie} onSluit={() => setStartOpen(false)} />}
    </section>
  );
}

/** De keuzemodal bij "Adviesverloop starten": Welke Meting is het begin (patroon "Meting voor de radar", `dossier.md`). Een Meting die niet kan, staat er uitgeschakeld met de reden. */
function StartModal({ organisatie, onSluit }: { organisatie: Organisatie; onSluit: () => void }) {
  const router = useRouter();
  const assessments = useAssessments();
  const metingen = [...organisatie.scanUitvoeringen].sort(vergelijkNieuwsteEerst);
  const reden = (m: (typeof metingen)[number]): string | null => {
    if (adviesverloopVoorMeting(organisatie, m.id)) return "Hoort bij een adviesverloop";
    if (!heeftAfgerondeScans(organisatie, m)) return "Nog geen afgeronde scans";
    if (!heeftBouwstenenMetScore(assessments.find((a) => a.id === m.assessmentId))) return "Alleen voor scans met een schaal van 1 tot 5";
    if (lopendAdviesverloop(organisatie, m.onderdeelId ?? null)) return "Er loopt al een adviesverloop voor dit onderdeel";
    return null;
  };
  const eerste = metingen.find((m) => reden(m) === null)?.id ?? null;
  const [keuze, setKeuze] = useState<string | null>(eerste);
  const [fout, setFout] = useState<string | null>(null);

  function start(e: React.FormEvent) {
    e.preventDefault();
    if (!keuze) return;
    const r = startAdviesverloop(organisatie.id, keuze);
    if (!r.ok) return setFout(r.reden);
    router.push(`/beheer/organisaties/${organisatie.id}/adviesverloop/${r.adviesverloop.id}`);
  }

  return (
    <OverzichtModal label="Adviesverloop starten" onSluit={onSluit} className="modal-box--instelling">
      <form onSubmit={start}>
        <div className="overzicht-kop">
          <h2>Adviesverloop starten</h2>
          <p>Kies de Meting waarmee het adviesverloop begint. Later koppel je er meer Metingen aan.</p>
        </div>
        <div className="dos-keuzes" role="radiogroup" aria-label="Meting om mee te beginnen">
          {metingen.map((m) => {
            const r = reden(m);
            const datum = meetdatumVan(m);
            return (
              <label key={m.id} className={`dos-keuze ${keuze === m.id ? "is-gekozen" : ""} ${r ? "is-uit" : ""}`}>
                <input type="radio" name="adv-start" checked={keuze === m.id} disabled={r !== null} onChange={() => setKeuze(m.id)} />
                <span>
                  <strong>{m.label}</strong>
                  <span className="dos-hint">
                    {assessments.find((a) => a.id === m.assessmentId)?.naam ?? "Onbekend type"} · {datum ? maandJaarLang(datum) : toonMeetdatum(null)} · {aantalAfgerondInMeting(organisatie, m)}{" "}
                    {aantalAfgerondInMeting(organisatie, m) === 1 ? "scan" : "scans"}
                  </span>
                  {r && <span className="dos-hint">{r}</span>}
                </span>
              </label>
            );
          })}
        </div>
        {fout && (
          <p className="overzicht-melding fout" role="alert">
            {fout}
          </p>
        )}
        <div className="btn-rij">
          <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
            Annuleren
          </button>
          <button type="submit" className="btn btn-or btn-compact" disabled={!keuze}>
            Starten
          </button>
        </div>
      </form>
    </OverzichtModal>
  );
}
