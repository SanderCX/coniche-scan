"use client";

import { useState } from "react";
import { Antwoord, Assessment, Bouwblok, ScanWeergave } from "@/lib/types";
import { veldKleur } from "@/lib/colors";
import { Antwoordkeuze } from "./Antwoordkeuze";
import { VeldInfoKnop, ijkpuntenMetNaam } from "./VeldToelichting";

/** Het ID van de open vraag van een veld: Het voorvoegsel van de vragen met een 6 erachter ("VL" wordt "VL6"). */
export function openVraagId(veld: Bouwblok): string {
  return `${(veld.vragen[0]?.id ?? "").replace(/\d+$/, "")}6`;
}

/**
 * Een veld van de Spanningsmeter in de doorloopflow (`visualisatie-spanningsmeter.md`, Doorloopflow, `CLAUDE.md`, scherm 5): De
 * veldkop met een Info-icoon, het instructievlak met de vijf ijkpunten, een kaart per vraag met de invalshoek, de antwoordkeuze en
 * de toelichting "Waar je op let" achter een Info-knop, de open vraag die niet verplicht is en geen score krijgt, en onderaan
 * Vorig veld en Volgend veld.
 */
export function SpanningVeldForm({
  assessment,
  veld,
  respondent,
  eerste,
  laatste,
  kanAfronden,
  onAntwoord,
  onVoorbeeld,
  onVorige,
  onVolgende,
}: {
  assessment: Assessment;
  veld: Bouwblok;
  respondent: ScanWeergave;
  eerste: boolean;
  laatste: boolean;
  /** Op het laatste veld: Mag de scan nu worden afgerond? Anders staat de knop uit. */
  kanAfronden: boolean;
  onAntwoord: (vraagId: string, waarde: Antwoord) => void;
  onVoorbeeld: (tekst: string) => void;
  onVorige: () => void;
  onVolgende: () => void;
}) {
  const kleur = veldKleur(veld.volgnummer);
  const vragen = veld.vragen.filter((v) => !v.gearchiveerd);
  const alleBeantwoord = vragen.every((v) => respondent.antwoorden[v.id] !== undefined);
  const ijkpunten = ijkpuntenMetNaam(assessment, veld);

  /** Na een antwoord schuift de pagina naar de volgende vraag (of naar de open vraag), zoals bij de andere scans. */
  function scrollNaarVolgende(vraagId: string) {
    const index = vragen.findIndex((v) => v.id === vraagId);
    const volgende = vragen[index + 1];
    const targetId = volgende ? `vraag-${volgende.id}` : "veld-einde";
    setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  }

  return (
    <div>
      <div className="sp-kop" style={{ borderLeftColor: kleur }}>
        <div className="sp-kop-titelrij">
          <h2>{veld.naam}</h2>
          <VeldInfoKnop assessment={assessment} veld={veld} />
        </div>
        <p>{veld.omschrijving}</p>
      </div>

      <div className="sp-instructie">
        {assessment.instructieregel?.trim() && <p>{assessment.instructieregel}</p>}
        <h3>Spanningsmeter voor {veld.naam}</h3>
        <ol className="sp-ijkpunten">
          {ijkpunten.map((punt) => (
            <li key={punt.niveau}>
              <span className="sp-ijk-nr" aria-hidden="true">
                {punt.niveau}
              </span>
              <strong>{punt.naam}</strong>
              <span>{punt.tekst}</span>
            </li>
          ))}
        </ol>
      </div>

      {vragen.map((vraag) => (
        <VraagKaart
          key={vraag.id}
          assessment={assessment}
          veld={veld}
          vraagId={vraag.id}
          invalshoek={vraag.invalshoek ?? null}
          tekst={vraag.tekst}
          aandachtspunt={vraag.aandachtspunt ?? null}
          waarde={typeof respondent.antwoorden[vraag.id] === "number" ? (respondent.antwoorden[vraag.id] as number) : undefined}
          onKies={(w) => {
            onAntwoord(vraag.id, w);
            scrollNaarVolgende(vraag.id);
          }}
        />
      ))}

      <div className="sp-kaart" id="veld-einde">
        <div className="sp-kaart-kop">
          <span className="sp-id">{openVraagId(veld)}</span>
          <span className="sp-invalshoek">Voorbeeld · niet verplicht</span>
        </div>
        {assessment.openVraag?.trim() ? (
          <p className="sp-vraag">{assessment.openVraag}</p>
        ) : (
          <p className="sp-vraag">Opmerkingen bij dit veld (optioneel)</p>
        )}
        <textarea
          className="field"
          rows={4}
          value={respondent.opmerkingenPerBouwblok[veld.id] ?? ""}
          onChange={(e) => onVoorbeeld(e.target.value)}
          placeholder="Typ hier je voorbeeld"
          aria-label={assessment.openVraag?.trim() || "Voorbeeld bij dit veld"}
        />
        <p className="sp-noot">Dit voorbeeld krijgt geen score. In de sessie bespreken we ook tegenvoorbeelden.</p>
      </div>

      <div className="sp-nav">
        {eerste ? (
          <span />
        ) : (
          <button type="button" className="btn btn-outline sp-nav-knop" onClick={onVorige}>
            ← Vorig veld
          </button>
        )}
        <button
          type="button"
          className="btn btn-or sp-nav-knop"
          disabled={!alleBeantwoord || (laatste && !kanAfronden)}
          onClick={onVolgende}
        >
          {laatste ? "Bekijk resultaten" : "Volgend veld →"}
        </button>
      </div>
    </div>
  );
}

function VraagKaart({
  assessment,
  veld,
  vraagId,
  invalshoek,
  tekst,
  aandachtspunt,
  waarde,
  onKies,
}: {
  assessment: Assessment;
  veld: Bouwblok;
  vraagId: string;
  invalshoek: string | null;
  tekst: string;
  aandachtspunt: string | null;
  waarde: number | undefined;
  onKies: (waarde: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sp-kaart" id={`vraag-${vraagId}`}>
      <div className="sp-kaart-kop">
        <span className="sp-id">{vraagId}</span>
        {invalshoek && <span className="sp-invalshoek">{invalshoek}</span>}
        {aandachtspunt && (
          <button
            type="button"
            className="btn btn-outline btn-compact sp-info"
            aria-expanded={open}
            aria-controls={`aandacht-${vraagId}`}
            onClick={() => setOpen(!open)}
          >
            Waar je op let
          </button>
        )}
      </div>
      <p className="sp-vraag">{tekst}</p>
      {aandachtspunt && open && (
        <div className="sp-aandacht" id={`aandacht-${vraagId}`}>
          <span>Waar je op let</span>
          <p>{aandachtspunt}</p>
        </div>
      )}
      <Antwoordkeuze assessment={assessment} veld={veld} vraagId={vraagId} waarde={waarde} onKies={onKies} />
    </div>
  );
}

