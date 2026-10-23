"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { ROLTEKST_MAX } from "@/lib/advies-catalogus-store";
import { bouwContextblok, bouwPromptTekst, onderdeelNaamVan, promptVoorRol } from "@/lib/advies";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { legStapVast, zetRol } from "@/lib/db";
import { useInstellingen } from "@/lib/instellingen-store";
import type { UseCase } from "@/lib/types";
import type { AdviesData } from "./useAdviesData";

/**
 * De modal Prompt klaarzetten (`adviesverloop.md`, Prompt klaarzetten): Drie genummerde delen (Wie ben jij bij deze klant, Waar werk je aan, Wat wil je nu)
 * en de voet met Annuleren en Kopiëren. Kopiëren zet rol, context en prompt als één tekst op het klembord en legt de stap vast. De inhoud van de prompt en
 * van het contextblok wordt niet bewaard; alleen de rol en de tekst bij Wie ben jij blijven bij het adviesverloop staan.
 */
export function PromptModal({ data, useCase, bouwsteenId, onSluit }: { data: AdviesData; useCase: UseCase; bouwsteenId: string | null; onSluit: () => void }) {
  const { organisatie, adviesverloop, catalogus, peil, assessment } = data;
  const instellingen = useInstellingen();
  const rollen = [...catalogus.rollen].sort((a, b) => a.volgorde - b.volgorde);
  const fase = catalogus.fasen.find((f) => f.id === useCase.faseId);
  const begin = rollen.find((r) => r.id === adviesverloop.rolId) ?? rollen[0];
  const [rolId, setRolId] = useState(begin?.id ?? "");
  const [rolTekst, setRolTekst] = useState(adviesverloop.rolTekst || begin?.standaardTekst || "");
  const [rolTekstAangepast, setRolTekstAangepast] = useState(false);
  const [context, setContext] = useState(() =>
    peil && assessment
      ? bouwContextblok({
          organisatie,
          onderdeelNaam: onderdeelNaamVan(organisatie, adviesverloop.onderdeelId),
          assessment,
          peil,
          peilLabel: data.peilLabel,
          resultaten: data.resultaten,
          bouwsteenId,
          spreiding: data.spreiding,
          benchmark: data.benchmark,
          eerste: data.eerste,
          kpiDefinities: instellingen.kpiDefinities,
          minRespondenten: instellingen.benchmarkMinRespondenten,
        })
      : ""
  );
  const [prompt, setPrompt] = useState(promptVoorRol(useCase, begin?.id ?? "").prompt);
  const [promptAangepast, setPromptAangepast] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const situatie = promptVoorRol(useCase, rolId).context;

  function kiesRol(id: string) {
    setRolId(id);
    const rol = rollen.find((r) => r.id === id);
    if (rol && !rolTekstAangepast) setRolTekst(rol.standaardTekst);
    if (!promptAangepast) setPrompt(promptVoorRol(useCase, id).prompt);
  }

  async function kopieer() {
    const gelukt = await kopieerNaarKlembord(bouwPromptTekst(rolTekst, context, prompt));
    if (!gelukt) return setFout("Kopiëren naar het klembord lukt niet. Selecteer de tekst zelf en kopieer hem.");
    const rol = zetRol(organisatie.id, adviesverloop.id, rolId, rolTekst);
    if (!rol.ok) return setFout(rol.reden);
    const stap = legStapVast(organisatie.id, adviesverloop.id, { useCaseId: useCase.id, status: "promptGekopieerd", bouwsteenId, metingId: peil?.id ?? null });
    if (!stap.ok) return setFout(stap.reden);
    onSluit();
  }

  const bouwsteen = bouwsteenId ? data.resultaten.find((r) => r.bouwblok.id === bouwsteenId)?.bouwblok : undefined;
  return (
    <OverzichtModal label="Prompt klaarzetten" onSluit={onSluit} className="modal-box--prompt">
      <div className="overzicht-kop">
        <p className="eyebrow">
          {fase?.korteNaam ?? "Fase"} · {useCase.id}
        </p>
        <h2>{useCase.titel}</h2>
        <p>
          {organisatie.naam} · {onderdeelNaamVan(organisatie, adviesverloop.onderdeelId)}
          {peil ? ` · ${data.peilLabel}` : ""}
          {bouwsteen ? ` · Bouwsteen ${bouwsteen.volgnummer}` : ""}
        </p>
      </div>

      <div className="adv-modal-deel">
        <h3>
          1. Wie ben jij bij deze klant
          <InfoIcoon sleutel="info.adviesverloopRol" />
        </h3>
        <div className="pil-groep" role="group" aria-label="Rol">
          {rollen.map((r) => (
            <button key={r.id} type="button" className={r.id === rolId ? "actief" : ""} aria-pressed={r.id === rolId} onClick={() => kiesRol(r.id)}>
              {r.naam}
            </button>
          ))}
        </div>
        <textarea
          aria-label="Wie ben jij bij deze klant"
          rows={5}
          maxLength={ROLTEKST_MAX}
          style={{ marginTop: "var(--sp-2)" }}
          value={rolTekst}
          onChange={(e) => {
            setRolTekst(e.target.value);
            setRolTekstAangepast(true);
          }}
        />
      </div>

      <div className="adv-modal-deel">
        <h3>
          2. Waar werk je aan
          <InfoIcoon sleutel="info.adviesverloopContext" />
        </h3>
        <textarea aria-label="Waar werk je aan" rows={9} value={context} onChange={(e) => setContext(e.target.value)} />
        <div className="adv-chips" style={{ marginTop: "var(--sp-2)" }}>
          <span className="eyebrow" style={{ margin: 0 }}>
            Meegenomen
          </span>
          {["Gemiddelde scores", "Benchmark", "KPI's Algemeen", "Kenmerken"].map((t) => (
            <span key={t} className="adv-chip">
              {t}
            </span>
          ))}
        </div>
        <div className="adv-chips" style={{ marginTop: "var(--sp-2)" }}>
          <span className="eyebrow" style={{ margin: 0 }}>
            Niet meegenomen
          </span>
          {["Antwoorden per persoon", "Namen", "Groepen onder de minimale groepsgrootte"].map((t) => (
            <span key={t} className="adv-chip">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="adv-modal-deel">
        <h3>3. Wat wil je nu</h3>
        {situatie && <p className="adv-sub">Situatie: {situatie}</p>}
        <textarea
          aria-label="Wat wil je nu"
          rows={7}
          value={prompt}
          placeholder={prompt ? undefined : "Voor deze rol is er geen prompt. Schrijf zelf wat je aan Copilot wilt vragen."}
          onChange={(e) => {
            setPrompt(e.target.value);
            setPromptAangepast(true);
          }}
        />
      </div>

      {fout && (
        <p className="overzicht-melding fout" role="alert">
          {fout}
        </p>
      )}
      <div className="btn-rij">
        <button type="button" className="btn btn-outline" onClick={onSluit}>
          Annuleren
        </button>
        <button type="button" className="btn btn-or" onClick={kopieer}>
          Kopiëren
        </button>
      </div>
    </OverzichtModal>
  );
}

/** De modal "Markeer als gedaan" (`adviesverloop.md`, Gedane stappen vastleggen): Een optionele link naar het document. De app bewaart de link en niet de inhoud. */
export function GedaanModal({ data, useCase, bouwsteenId, onSluit }: { data: AdviesData; useCase: UseCase; bouwsteenId: string | null; onSluit: () => void }) {
  const bestaand = data.adviesverloop.stappen.find((s) => s.useCaseId === useCase.id && s.bouwsteenId === bouwsteenId);
  const [link, setLink] = useState(bestaand?.link ?? "");
  const [fout, setFout] = useState<string | null>(null);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    const r = legStapVast(data.organisatie.id, data.adviesverloop.id, { useCaseId: useCase.id, status: "gedaan", bouwsteenId, metingId: data.peil?.id ?? null, link });
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  return (
    <OverzichtModal label="Markeer als gedaan" onSluit={onSluit} className="modal-box--instelling">
      <form onSubmit={opslaan}>
        <div className="overzicht-kop">
          <h2>Markeer als gedaan</h2>
          <p>{useCase.titel}</p>
        </div>
        <div className="admin-field">
          <label htmlFor="adv-link">Link naar het document (optioneel)</label>
          <input id="adv-link" type="text" inputMode="url" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} />
          <span className="text-xs text-ink-s">Bijvoorbeeld een document in SharePoint. De app bewaart de link en niet de inhoud van het document.</span>
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
          <button type="submit" className="btn btn-or btn-compact">
            Markeer als gedaan
          </button>
        </div>
      </form>
    </OverzichtModal>
  );
}
