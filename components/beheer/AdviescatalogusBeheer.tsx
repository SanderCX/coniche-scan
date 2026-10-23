"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { Schakelaar } from "@/components/Schakelaar";
import { useAssessments } from "@/lib/assessment-store";
import { actieveBouwblokkenMetGroep } from "@/lib/assessment-structuur";
import { useOrganisaties } from "@/lib/db";
import {
  APPS,
  KLASSEN,
  OMSCHRIJVING_MAX,
  ROLTEKST_MAX,
  TITEL_MAX,
  UseCaseInvoer,
  appNaam,
  maakUseCase,
  useAdviesCatalogus,
  verbergUseCase,
  verplaatsFase,
  verplaatsUseCase,
  verwijderUseCase,
  wijzigFase,
  wijzigRol,
  wijzigUseCase,
  zetPrompt,
} from "@/lib/advies-catalogus-store";
import { aantalStappenMetUseCase, bestaatAdviesverloop, fasenOpVolgorde, heeftBouwstenenMetScore } from "@/lib/advies";
import type { AdviesFase, AdviesRol, UseCase } from "@/lib/types";

/**
 * Het beheer van de Adviescatalogus (`beheerpagina.md`, punt 17): Fasen, rollen en per fase de use cases met hun apps, voorstelregels en prompts.
 * Alleen een Admin. Zodra er een adviesverloop bestaat, staan de fasen vast; een use case waar een stap naar verwijst kan alleen worden verborgen.
 */
export function AdviescatalogusBeheer() {
  const catalogus = useAdviesCatalogus();
  const organisaties = useOrganisaties();
  const vergrendeld = bestaatAdviesverloop(organisaties);
  const [fout, setFout] = useState<string | null>(null);
  const [faseBewerken, setFaseBewerken] = useState<AdviesFase | null>(null);
  const [rolBewerken, setRolBewerken] = useState<AdviesRol | null>(null);
  const [useCaseBewerken, setUseCaseBewerken] = useState<{ useCase: UseCase | null; faseId: string } | null>(null);
  const [weg, setWeg] = useState<UseCase | null>(null);

  const meld = (r: { ok: boolean; reden?: string }) => setFout(r.ok ? null : (r.reden ?? "Dat kan niet."));
  const fasen = fasenOpVolgorde(catalogus);

  return (
    <div className="org-kaarten">
      {fout && (
        <p className="admin-notice" role="alert">
          {fout}
        </p>
      )}

      <section className="beheer-kaart" aria-labelledby="advcat-fasen">
        <div className="beheer-kaart-kop">
          <h2 id="advcat-fasen">Fasen</h2>
        </div>
        {vergrendeld && <p className="text-sm text-ink-s">Er bestaat al een adviesverloop: De fasen staan vast.</p>}
        <ol className="advcat-lijst">
          {fasen.map((f, i) => (
            <li key={f.id} className="advcat-rij">
              <span className="advcat-nummer">{f.volgorde}</span>
              <span className="advcat-tekst">
                <strong>{f.naam}</strong>
                <span className="text-sm text-ink-s">
                  {f.korteNaam}
                  {f.omschrijving ? ` · ${f.omschrijving}` : ""}
                </span>
              </span>
              <span className="advcat-acties">
                <button type="button" className="btn btn-outline btn-compact" aria-label={`${f.naam} omhoog`} disabled={vergrendeld || i === 0} onClick={() => meld(verplaatsFase(f.id, -1, vergrendeld))}>
                  ↑
                </button>
                <button type="button" className="btn btn-outline btn-compact" aria-label={`${f.naam} omlaag`} disabled={vergrendeld || i === fasen.length - 1} onClick={() => meld(verplaatsFase(f.id, 1, vergrendeld))}>
                  ↓
                </button>
                <button type="button" className="btn btn-outline btn-compact" disabled={vergrendeld} onClick={() => setFaseBewerken(f)}>
                  Bewerken
                </button>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="beheer-kaart" aria-labelledby="advcat-rollen">
        <div className="beheer-kaart-kop">
          <h2 id="advcat-rollen">Rollen</h2>
        </div>
        <ul className="advcat-lijst">
          {[...catalogus.rollen].sort((a, b) => a.volgorde - b.volgorde).map((r) => (
            <li key={r.id} className="advcat-rij">
              <span className="advcat-tekst">
                <strong>{r.naam}</strong>
                <span className="text-sm text-ink-s advcat-afgekapt">{r.standaardTekst || "Geen standaardtekst"}</span>
              </span>
              <span className="advcat-acties">
                <button type="button" className="btn btn-outline btn-compact" onClick={() => setRolBewerken(r)}>
                  Bewerken
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {fasen.map((f) => {
        const lijst = catalogus.useCases.filter((u) => u.faseId === f.id).sort((a, b) => a.volgorde - b.volgorde);
        return (
          <section key={f.id} className="beheer-kaart" aria-label={`Use cases ${f.naam}`}>
            <div className="beheer-kaart-kop">
              <h2>
                {f.volgorde}. {f.naam}
              </h2>
              <button type="button" className="btn btn-outline btn-compact" onClick={() => setUseCaseBewerken({ useCase: null, faseId: f.id })}>
                Use case toevoegen
              </button>
            </div>
            {lijst.length === 0 ? (
              <p className="text-sm text-ink-s">Deze fase heeft nog geen use cases.</p>
            ) : (
              <ul className="advcat-lijst">
                {lijst.map((u, i) => (
                  <li key={u.id} className={`advcat-rij ${u.verborgen ? "advcat-rij--verborgen" : ""}`}>
                    <span className="advcat-code">{u.id}</span>
                    <span className="advcat-tekst">
                      <strong>{u.titel}</strong>
                      <span className="text-sm text-ink-s">
                        {[
                          u.apps.map(appNaam).join(", ") || "Geen apps",
                          u.inStrook ? "Telt mee in de fasestrook" : "Telt niet mee",
                          `${u.prompts.length} ${u.prompts.length === 1 ? "prompt" : "prompts"}`,
                          u.verborgen ? "Verborgen" : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <span className="advcat-acties">
                      <button type="button" className="btn btn-outline btn-compact" aria-label={`${u.titel} omhoog`} disabled={i === 0} onClick={() => meld(verplaatsUseCase(u.id, -1))}>
                        ↑
                      </button>
                      <button type="button" className="btn btn-outline btn-compact" aria-label={`${u.titel} omlaag`} disabled={i === lijst.length - 1} onClick={() => meld(verplaatsUseCase(u.id, 1))}>
                        ↓
                      </button>
                      <button type="button" className="btn btn-outline btn-compact" onClick={() => setUseCaseBewerken({ useCase: u, faseId: f.id })}>
                        Bewerken
                      </button>
                      <button type="button" className="btn btn-outline btn-compact" onClick={() => meld(verbergUseCase(u.id, !u.verborgen))}>
                        {u.verborgen ? "Tonen" : "Verbergen"}
                      </button>
                      <button type="button" className="btn btn-outline btn-compact" onClick={() => setWeg(u)}>
                        Verwijderen
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {faseBewerken && <FaseModal fase={faseBewerken} vergrendeld={vergrendeld} onSluit={() => setFaseBewerken(null)} />}
      {rolBewerken && <RolModal rol={rolBewerken} onSluit={() => setRolBewerken(null)} />}
      {useCaseBewerken && <UseCaseModal useCase={useCaseBewerken.useCase} faseId={useCaseBewerken.faseId} onSluit={() => setUseCaseBewerken(null)} />}
      <BevestigModal
        open={weg !== null}
        titel="Use case verwijderen?"
        bericht={
          weg && (
            <>
              <p>
                {weg.id} {weg.titel} verdwijnt met zijn prompts. Dit kan niet ongedaan worden gemaakt.
              </p>
              {aantalStappenMetUseCase(organisaties, weg.id) > 0 && <p>Er verwijzen stappen naar deze use case: Verberg hem dan in plaats van hem te verwijderen.</p>}
            </>
          )
        }
        onAnnuleren={() => setWeg(null)}
        onBevestigen={() => {
          if (weg) meld(verwijderUseCase(weg.id, aantalStappenMetUseCase(organisaties, weg.id)));
          setWeg(null);
        }}
      />
    </div>
  );
}

function FaseModal({ fase, vergrendeld, onSluit }: { fase: AdviesFase; vergrendeld: boolean; onSluit: () => void }) {
  const [naam, setNaam] = useState(fase.naam);
  const [korteNaam, setKorteNaam] = useState(fase.korteNaam);
  const [omschrijving, setOmschrijving] = useState(fase.omschrijving);
  const [fout, setFout] = useState<string | null>(null);
  return (
    <Modal open onClose={onSluit} title="Fase bewerken" eyebrow={`Fase ${fase.volgorde}`}>
      <div className="admin-field">
        <label htmlFor="fase-naam">Naam</label>
        <input id="fase-naam" type="text" value={naam} onChange={(e) => setNaam(e.target.value)} />
      </div>
      <div className="admin-field">
        <label htmlFor="fase-korte-naam">Korte naam</label>
        <input id="fase-korte-naam" type="text" value={korteNaam} onChange={(e) => setKorteNaam(e.target.value)} />
      </div>
      <div className="admin-field">
        <label htmlFor="fase-omschrijving">Omschrijving</label>
        <textarea id="fase-omschrijving" rows={3} value={omschrijving} onChange={(e) => setOmschrijving(e.target.value)} />
      </div>
      {fout && <p className="admin-notice">{fout}</p>}
      <div className="btn-rij">
        <button type="button" className="btn btn-outline" onClick={onSluit}>
          Annuleren
        </button>
        <button
          type="button"
          className="btn btn-or"
          onClick={() => {
            const r = wijzigFase(fase.id, { naam, korteNaam, omschrijving }, vergrendeld);
            if (r.ok) onSluit();
            else setFout(r.reden);
          }}
        >
          Opslaan
        </button>
      </div>
    </Modal>
  );
}

function RolModal({ rol, onSluit }: { rol: AdviesRol; onSluit: () => void }) {
  const [naam, setNaam] = useState(rol.naam);
  const [tekst, setTekst] = useState(rol.standaardTekst);
  const [fout, setFout] = useState<string | null>(null);
  return (
    <Modal open onClose={onSluit} title="Rol bewerken">
      <div className="admin-field">
        <label htmlFor="rol-naam">Naam</label>
        <input id="rol-naam" type="text" value={naam} onChange={(e) => setNaam(e.target.value)} />
      </div>
      <div className="admin-field">
        <label htmlFor="rol-tekst">Standaardtekst bij Wie ben jij bij deze klant</label>
        <textarea id="rol-tekst" rows={5} maxLength={ROLTEKST_MAX} value={tekst} onChange={(e) => setTekst(e.target.value)} />
        <span className="text-xs text-ink-s">
          {tekst.length} van {ROLTEKST_MAX} tekens
        </span>
      </div>
      {fout && <p className="admin-notice">{fout}</p>}
      <div className="btn-rij">
        <button type="button" className="btn btn-outline" onClick={onSluit}>
          Annuleren
        </button>
        <button
          type="button"
          className="btn btn-or"
          onClick={() => {
            const r = wijzigRol(rol.id, { naam, standaardTekst: tekst });
            if (r.ok) onSluit();
            else setFout(r.reden);
          }}
        >
          Opslaan
        </button>
      </div>
    </Modal>
  );
}

/** Een code voor een nieuwe use case: Het fasenummer, een streepje en het eerstvolgende vrije nummer ("4-6"). */
function volgendeCode(useCases: UseCase[], faseId: string): string {
  const nummers = useCases.filter((u) => u.faseId === faseId).map((u) => Number(u.id.split("-")[1])).filter((n) => Number.isFinite(n));
  return `${faseId}-${Math.max(0, ...nummers) + 1}`;
}

function UseCaseModal({ useCase, faseId, onSluit }: { useCase: UseCase | null; faseId: string; onSluit: () => void }) {
  const catalogus = useAdviesCatalogus();
  const assessments = useAssessments().filter((a) => heeftBouwstenenMetScore(a));
  const rollen = [...catalogus.rollen].sort((a, b) => a.volgorde - b.volgorde);
  const [invoer, setInvoer] = useState<UseCaseInvoer>(
    useCase
      ? { id: useCase.id, faseId: useCase.faseId, titel: useCase.titel, omschrijving: useCase.omschrijving, apps: useCase.apps, inStrook: useCase.inStrook, bouwsteenIds: useCase.bouwsteenIds, klassen: useCase.klassen }
      : { id: volgendeCode(catalogus.useCases, faseId), faseId, titel: "", omschrijving: "", apps: [], inStrook: false, bouwsteenIds: [], klassen: [] }
  );
  const [prompts, setPrompts] = useState<Record<string, { context: string; prompt: string }>>(
    Object.fromEntries(rollen.map((r) => [r.id, useCase?.prompts.find((p) => p.rolId === r.id) ?? { context: "", prompt: "" }]))
  );
  const [fout, setFout] = useState<string | null>(null);
  const wissel = (lijst: string[], waarde: string) => (lijst.includes(waarde) ? lijst.filter((x) => x !== waarde) : [...lijst, waarde]);

  function opslaan() {
    const r = useCase ? wijzigUseCase(useCase.id, invoer) : maakUseCase(invoer);
    if (!r.ok) return setFout(r.reden);
    for (const rol of rollen) {
      const p = prompts[rol.id];
      const pr = zetPrompt(invoer.id.trim(), rol.id, p.context, p.prompt);
      if (!pr.ok) return setFout(pr.reden);
    }
    onSluit();
  }

  return (
    <Modal open onClose={onSluit} title={useCase ? "Use case bewerken" : "Use case toevoegen"} eyebrow={catalogus.fasen.find((f) => f.id === invoer.faseId)?.naam}>
      <div className="advcat-formulier">
        <div className="admin-field">
          <label htmlFor="uc-code">Code</label>
          <input id="uc-code" type="text" value={invoer.id} onChange={(e) => setInvoer({ ...invoer, id: e.target.value })} />
        </div>
        <div className="admin-field">
          <label htmlFor="uc-titel">Titel</label>
          <input id="uc-titel" type="text" maxLength={TITEL_MAX} value={invoer.titel} onChange={(e) => setInvoer({ ...invoer, titel: e.target.value })} />
        </div>
        <div className="admin-field">
          <label htmlFor="uc-omschrijving">Omschrijving</label>
          <textarea id="uc-omschrijving" rows={3} maxLength={OMSCHRIJVING_MAX} value={invoer.omschrijving} onChange={(e) => setInvoer({ ...invoer, omschrijving: e.target.value })} />
        </div>
        <fieldset className="advcat-groep">
          <legend>Apps</legend>
          {APPS.map((a) => (
            <label key={a.code} className="advcat-keuze">
              <input type="checkbox" checked={invoer.apps.includes(a.code)} onChange={() => setInvoer({ ...invoer, apps: wissel(invoer.apps, a.code) })} />
              {a.naam}
            </label>
          ))}
        </fieldset>
        <div className="advcat-schakelrij">
          <Schakelaar aan={invoer.inStrook} ariaLabelledBy="uc-instrook-label" onChange={(aan) => setInvoer({ ...invoer, inStrook: aan })} />
          <span id="uc-instrook-label">Telt mee als stap in de fasestrook</span>
        </div>
        <fieldset className="advcat-groep">
          <legend>Voorgesteld bij een klasse</legend>
          {KLASSEN.map((k) => (
            <label key={k.code} className="advcat-keuze">
              <input type="checkbox" checked={invoer.klassen.includes(k.code)} onChange={() => setInvoer({ ...invoer, klassen: wissel(invoer.klassen, k.code) })} />
              {k.naam}
            </label>
          ))}
        </fieldset>
        <details className="advcat-groep">
          <summary>Voorgesteld bij bouwstenen ({invoer.bouwsteenIds.length})</summary>
          {assessments.map((a) => (
            <div key={a.id}>
              <p className="advcat-kop">{a.naam}</p>
              {actieveBouwblokkenMetGroep(a).map(({ bouwblok }) => (
                <label key={bouwblok.id} className="advcat-keuze">
                  <input type="checkbox" checked={invoer.bouwsteenIds.includes(bouwblok.id)} onChange={() => setInvoer({ ...invoer, bouwsteenIds: wissel(invoer.bouwsteenIds, bouwblok.id) })} />
                  {bouwblok.volgnummer}. {bouwblok.naam}
                </label>
              ))}
            </div>
          ))}
        </details>
        <p className="advcat-kop">Prompts per rol</p>
        {rollen.map((r) => (
          <fieldset key={r.id} className="advcat-groep">
            <legend>{r.naam}</legend>
            <div className="admin-field">
              <label htmlFor={`uc-context-${r.id}`}>Context</label>
              <textarea id={`uc-context-${r.id}`} rows={3} value={prompts[r.id].context} onChange={(e) => setPrompts({ ...prompts, [r.id]: { ...prompts[r.id], context: e.target.value } })} />
            </div>
            <div className="admin-field">
              <label htmlFor={`uc-prompt-${r.id}`}>Prompt</label>
              <textarea id={`uc-prompt-${r.id}`} rows={4} value={prompts[r.id].prompt} onChange={(e) => setPrompts({ ...prompts, [r.id]: { ...prompts[r.id], prompt: e.target.value } })} />
            </div>
          </fieldset>
        ))}
      </div>
      {fout && <p className="admin-notice">{fout}</p>}
      <div className="btn-rij">
        <button type="button" className="btn btn-outline" onClick={onSluit}>
          Annuleren
        </button>
        <button type="button" className="btn btn-or" onClick={opslaan}>
          Opslaan
        </button>
      </div>
    </Modal>
  );
}
