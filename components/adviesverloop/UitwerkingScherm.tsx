"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { ScoreRing } from "@/components/ScoreRing";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { appNaam } from "@/lib/advies-catalogus-store";
import { faseVoortgang, stapTekst, casesVoorBouwsteen, verschilTekst } from "@/lib/advies";
import { CLASSIFICATIE_INFO } from "@/lib/colors";
import { zetFaseOverslaan, zetStapTerug } from "@/lib/db";
import { DOSSIER_STATUS_LABEL, dossierVan, itemStatus } from "@/lib/dossier";
import { formatScore } from "@/lib/format";
import { classificatie } from "@/lib/scoring";
import { ringVanScore } from "@/lib/score-ring";
import { useOrganisaties } from "@/lib/db";
import { useBenchmarksMetLeden } from "@/lib/use-benchmarks";
import type { UseCase } from "@/lib/types";
import { KiezenModal, KlasseChip } from "./ShortlistScherm";
import type { AdviesData } from "./useAdviesData";

const SOORT_LABEL: Record<string, string> = { nieuws: "Nieuws", case: "Case", event: "Event", blog: "Blog", benchmark: "Benchmark" };

/**
 * Scherm Uitwerking per bouwsteen (`adviesverloop.md`, Scherm Uitwerking per bouwsteen): De gekozen bouwstenen als pilgroep, en per bouwsteen de
 * resultaatkop, de kaart van de huidige fase met de use cases en de kaart Dossier bij deze bouwsteen.
 */
export function UitwerkingScherm({
  data,
  kanWijzigen,
  onPrompt,
  onGedaan,
}: {
  data: AdviesData;
  kanWijzigen: boolean;
  onPrompt: (useCase: UseCase, bouwsteenId: string) => void;
  onGedaan: (useCase: UseCase, bouwsteenId: string) => void;
}) {
  const { shortlist, catalogus, adviesverloop, organisatie } = data;
  const voortgang = faseVoortgang(catalogus, adviesverloop);
  const huidig =
    voortgang.find((v) => v.huidig) ??
    [...voortgang].reverse().find((v) => v.totaal > 0 && !v.overgeslagen) ??
    voortgang.find((v) => !v.overgeslagen) ??
    voortgang[0];
  const [kiezen, setKiezen] = useState(false);
  const alle = useOrganisaties();
  const benchmarks = useBenchmarksMetLeden();
  const [terugzetten, setTerugzetten] = useState<{ stapId: string; titel: string } | null>(null);

  return (
    <div className="adv-pagina" style={{ padding: 0 }}>
      <div className="adv-kop" style={{ alignItems: "center" }}>
        <div className="pil-rij" role="group" aria-label="Bouwstenen op de shortlist">
          {shortlist.map((r) => (
            <button key={r.bouwblok.id} type="button" className="pil" onClick={() => document.getElementById(`adv-bs-${r.bouwblok.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              {r.bouwblok.volgnummer}. {r.bouwblok.naam}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-outline btn-compact" disabled={!kanWijzigen} onClick={() => setKiezen(true)}>
          Bouwstenen wijzigen
        </button>
      </div>

      {shortlist.map((r) => {
        const klasse = classificatie(r.score);
        const groep = data.groepen.get(r.bouwblok.id);
        const bm = data.benchmark?.perBouwsteen.get(r.bouwblok.id);
        const sp = data.spreiding.get(r.bouwblok.id);
        const sinds = data.verschil?.get(r.bouwblok.id);
        const useCases = huidig && !huidig.overgeslagen ? casesVoorBouwsteen(catalogus, huidig.fase.id, r.bouwblok.id, klasse, adviesverloop.nvUseCaseIds) : [];
        const items = dossierVan(organisatie).items.filter((i) => i.bouwblokIds.includes(r.bouwblok.id));
        return (
          <section key={r.bouwblok.id} id={`adv-bs-${r.bouwblok.id}`} className="org-kaarten" style={{ marginTop: 0, scrollMarginTop: "10rem" }}>
            <div className="adv-uitwerking-kop">
              <ScoreRing klein metChip={false} label="Score" ring={ringVanScore(r.score, klasse)} alt={`${r.bouwblok.naam}: ${formatScore(r.score)}`} />
              <div className="adv-uitwerking-tekst">
                <p className="eyebrow">
                  Bouwsteen {r.bouwblok.volgnummer}
                  {groep?.naam ? ` · ${groep.naam}` : ""}
                </p>
                <h2>{r.bouwblok.naam}</h2>
                <KlasseChip score={r.score} />
                <p className="adv-sub" style={{ margin: 0 }}>
                  {CLASSIFICATIE_INFO[klasse].omschrijving}
                </p>
                <ul className="adv-feiten">
                  <li>Benchmark: {bm ? `${verschilTekst(bm.verschil)} ten opzichte van de rest van de groep` : "geen benchmark"}</li>
                  <li>Spreiding: {sp ? sp.label.toLowerCase() : "niet beschikbaar"}</li>
                  {sinds !== undefined && <li>{verschilTekst(sinds)} sinds de eerste Meting</li>}
                  <li>Vragen: {r.bouwblok.vragen.length}</li>
                </ul>
              </div>
            </div>

            <div className="beheer-kaart">
              <div className="beheer-kaart-kop">
                <div className="titel-rij">
                  <h2>{huidig?.fase.naam ?? "Huidige fase"}</h2>
                  <InfoIcoon sleutel="info.adviesverloopUsecases" />
                </div>
              </div>
              {huidig?.overgeslagen ? (
                <div className="adv-regel">
                  <span className="text-sm text-ink-s">Deze fase is overgeslagen. Er staan geen use cases.</span>
                  <button type="button" className="btn btn-outline btn-compact" disabled={!kanWijzigen} onClick={() => zetFaseOverslaan(organisatie.id, adviesverloop.id, huidig.fase.id, false)}>
                    Fase weer meenemen
                  </button>
                </div>
              ) : (
                useCases.length === 0 && <p className="text-sm text-ink-s">Deze fase heeft geen use cases.</p>
              )}
              {useCases.map((u) => {
                const stap = adviesverloop.stappen.find((s) => s.useCaseId === u.id && s.bouwsteenId === r.bouwblok.id);
                return (
                  <div key={u.id} className="adv-rij">
                    <span className="adv-usecase-icoon" aria-hidden="true">
                      {u.id}
                    </span>
                    <div className="adv-rij-tekst">
                      <p className="eyebrow">
                        {huidig?.fase.korteNaam} · {u.id}
                      </p>
                      <span className="adv-rij-naam" style={{ fontSize: "var(--fs-16)" }}>
                        {u.titel}
                      </span>
                      {u.omschrijving && <span className="adv-rij-feit">{u.omschrijving}</span>}
                      <div className="adv-chips" style={{ marginTop: "var(--sp-2)" }}>
                        {u.apps.map((a) => (
                          <span key={a} className="adv-chip">
                            {appNaam(a)}
                          </span>
                        ))}
                      </div>
                      {stap && (
                        <span className="adv-rij-feit" style={{ marginTop: "var(--sp-2)" }}>
                          {stapTekst(stap)}
                          {stap.link && (
                            <>
                              {" · "}
                              <a href={stap.link} target="_blank" rel="noreferrer">
                                Document
                              </a>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="adv-acties" style={{ flex: "none" }}>
                      <button type="button" className="btn btn-or btn-compact" disabled={!kanWijzigen} onClick={() => onPrompt(u, r.bouwblok.id)}>
                        Prompt klaarzetten
                      </button>
                      {stap ? (
                        <button type="button" className="btn btn-outline btn-compact" disabled={!kanWijzigen} onClick={() => setTerugzetten({ stapId: stap.id, titel: u.titel })}>
                          Terugzetten
                        </button>
                      ) : (
                        <button type="button" className="btn btn-outline btn-compact" disabled={!kanWijzigen} onClick={() => onGedaan(u, r.bouwblok.id)}>
                          Markeer als gedaan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="beheer-kaart">
              <div className="beheer-kaart-kop">
                <h2>Dossier bij deze bouwsteen</h2>
                <Link className="btn btn-outline btn-compact" href={`/beheer/organisaties/${organisatie.id}`}>
                  Naar Dossier
                </Link>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-ink-s">Er is nog niets uit het Dossier aan deze bouwsteen gekoppeld.</p>
              ) : (
                items.map((i) => {
                  const status = itemStatus(i, alle, new Date(), { benchmarks, organisatie });
                  return (
                    <div key={i.id} className="adv-regel">
                      <span className="adv-regel-tekst">
                        <strong>{i.titel || SOORT_LABEL[i.soort]}</strong>
                        <span className="adv-reden">{SOORT_LABEL[i.soort]}</span>
                      </span>
                      <span className={`dos-status dos-status--${status}`}>{DOSSIER_STATUS_LABEL[status]}</span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        );
      })}

      {shortlist.length === 0 && <p className="admin-notice">Er staat niets op de shortlist. Kies minstens één bouwsteen om te kunnen uitwerken.</p>}
      {kiezen && <KiezenModal data={data} onSluit={() => setKiezen(false)} />}
      <BevestigModal
        open={terugzetten !== null}
        titel="Stap terugzetten?"
        bericht={<p>{terugzetten?.titel} gaat terug naar open. De fasestrook telt hem dan niet meer mee.</p>}
        bevestigLabel="Terugzetten"
        bevestigVariant="primair"
        onAnnuleren={() => setTerugzetten(null)}
        onBevestigen={() => {
          if (terugzetten) zetStapTerug(organisatie.id, adviesverloop.id, terugzetten.stapId);
          setTerugzetten(null);
        }}
      />
    </div>
  );
}
