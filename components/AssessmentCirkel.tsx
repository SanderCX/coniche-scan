"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AssessmentIcon } from "@/components/icons/AssessmentIcons";
import { TEGEL_ICONEN } from "@/components/icons/LandingIcons";
import { nbspNaKoppelteken } from "@/lib/format";
import { tegelInhoud } from "@/lib/landing";
import {
  BOOG_DIKTE,
  CENTRUM,
  DELEN,
  DeelDef,
  KORTE_NAMEN,
  LABEL_REGELS,
  MAAT,
  QUICK_BOGEN,
  RINGEN,
  WEDGE_DEKKING,
  bandVlak,
  boogPad,
  deelWedges,
  delenMetAssessments,
  labelPunt,
  lijnPunten,
  lijnVulling,
  stipPunt,
  volgendeKeuze,
  wedgePad,
} from "@/lib/assessmentcirkel";
import { Assessment } from "@/lib/types";
import { bandPunten as bandPuntenLijn } from "@/lib/assessmentcirkel";

/** De beelden in een deel zijn vaste illustraties met voorbeelddata: Ze rekenen niets uit. */
function Beeld({ deel, clipId }: { deel: DeelDef; clipId: string }) {
  const lijn = deel.soort !== "quick";
  const wedge = { fillOpacity: WEDGE_DEKKING, stroke: "#fff", strokeWidth: 1.2 };
  return (
    <g clipPath={`url(#${clipId})`}>
      {deelWedges(deel).map((w, i) => (
        <path key={i} d={wedgePad(w.van, w.tot)} fill={w.kleur} {...wedge} />
      ))}
      {lijn && RINGEN.map((r) => <circle key={r} cx={CENTRUM} cy={CENTRUM} r={r} fill="none" stroke="#fff" strokeOpacity={0.75} strokeWidth={1.2} />)}
      {deel.soort === "quick" &&
        QUICK_BOGEN.map((b) => (
          <g key={b.r}>
            <path d={boogPad(b.r, 1)} fill="none" stroke="#e9e6df" strokeWidth={BOOG_DIKTE} strokeLinecap="round" />
            <path d={boogPad(b.r, b.score)} fill="none" stroke={b.kleur} strokeWidth={BOOG_DIKTE} strokeLinecap="round" />
          </g>
        ))}
      {deel.soort === "spanning" && (
        <g>
          <polygon points={bandVlak()} fill="#ff671f" fillOpacity={0.1} stroke="none" />
          {/* De rand van de band is één dunne grijze lijn en geen oranje streepjes: Drie oranje lijnen naast elkaar waren te heftig (PR 164). */}
          <polyline points={bandPuntenLijn("boven")} fill="none" stroke="#a3a19b" strokeWidth={1} />
          <polyline points={bandPuntenLijn("onder")} fill="none" stroke="#a3a19b" strokeWidth={1} />
        </g>
      )}
      {lijn && <polygon points={lijnVulling()} fill="#ff671f" fillOpacity={0.14} stroke="none" />}
      {lijn && <polyline points={lijnPunten()} fill="none" stroke="#ff671f" strokeWidth={2.5} strokeLinejoin="miter" strokeLinecap="butt" />}
    </g>
  );
}

/**
 * Kies jouw assessment als cirkel met vijf delen (`CLAUDE.md`, scherm 1, besloten door Joost op 21 oktober 2026, ontwerp `Home-D`, met de Digitale
 * Spanningsmeter als vijfde deel, variant E2): Eén cirkel van 568px in vijf delen van 72°, elk deel is een Assessment op een vaste plek (met de klok
 * mee vanaf links: Klantcontact Volwassenheid, Zorg, AI, Quickscan, Spanningsmeter), met rechts het detailpaneel van het gekozen deel. Een
 * keuzegroep met vijf opties: Pijltoetsen wisselen in die volgorde, de naam van het Assessment is het label. Er is steeds één deel gekozen of geen.
 * Een gekozen deel schuift 10px naar buiten langs zijn middenlijn, de andere vier gaan naar 38% dekking.
 */
export function AssessmentCirkel({ assessments }: { assessments: Assessment[] }) {
  // Per plek het Assessment of `null`; `volgorde` zijn de plekken die er zijn, in de volgorde van de pijltoetsen.
  const perPlek = delenMetAssessments(assessments);
  const volgorde = perPlek.map((a, plek) => (a ? plek : -1)).filter((plek) => plek >= 0);
  const [gekozen, setGekozen] = useState<number | null>(null);
  const [schaal, setSchaal] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const paneelRef = useRef<HTMLDivElement>(null);
  const deelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const meet = () => setSchaal(Math.min(1, el.clientWidth / MAAT));
    meet();
    const ro = new ResizeObserver(meet);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Escape heft de keuze op (`CLAUDE.md`, scherm 1, Gedrag, PR 166).
  useEffect(() => {
    if (gekozen === null) return;
    const bijToets = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGekozen(null);
    };
    window.addEventListener("keydown", bijToets);
    return () => window.removeEventListener("keydown", bijToets);
  }, [gekozen]);

  /** Een klik op het gekozen deel heft de keuze op, een klik op een ander deel wisselt de keuze direct. */
  function wissel(plek: number) {
    kies(gekozen === plek ? null : plek);
  }

  function kies(plek: number | null) {
    setGekozen(plek);
    // Onder 768px staat het paneel onder de cirkel: Scrol ernaartoe.
    if (plek !== null && typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      setTimeout(() => paneelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }

  function onToets(e: React.KeyboardEvent, plek: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      wissel(plek);
      return;
    }
    if (e.key === "Escape") {
      kies(null);
      return;
    }
    const volgende = volgendeKeuze(volgorde.indexOf(plek), volgorde.length, e.key);
    if (volgende === null) return;
    e.preventDefault();
    kies(volgorde[volgende]);
    deelRefs.current[volgorde[volgende]]?.focus();
  }

  const gekozenAssessment = gekozen !== null ? perPlek[gekozen] : null;
  const inhoud = gekozenAssessment ? tegelInhoud(gekozenAssessment) : null;

  return (
    <div className="ac">
      <div ref={wrapRef} className="ac-vlak" style={{ height: MAAT * schaal }}>
        <div className="ac-stage" role="radiogroup" aria-label="Kies jouw assessment" style={{ transform: `scale(${schaal})` }}>
          {DELEN.map((d, plek) => {
            const a = perPlek[plek];
            if (!a) return null;
            const isGekozen = gekozen === plek;
            const gedimd = gekozen !== null && !isGekozen;
            const clipId = `ac-${uid}-${plek}`;
            const [stipX, stipY] = stipPunt(d.assessmentId);
            const [lx, ly] = labelPunt(d.assessmentId);
            const regels = LABEL_REGELS[a.id] ?? [KORTE_NAMEN[a.id] ?? a.kortLabel ?? a.naam];
            return (
              <div
                key={a.id}
                ref={(el) => {
                  deelRefs.current[plek] = el;
                }}
                role="radio"
                aria-checked={isGekozen}
                aria-label={a.naam}
                tabIndex={isGekozen || (gekozen === null && plek === volgorde[0]) ? 0 : -1}
                className={`ac-deel ${isGekozen ? "is-gekozen" : ""} ${gedimd ? "is-gedimd" : ""}`}
                style={{
                  ["--ac-dx" as string]: `${d.richting[0] * 10}px`,
                  ["--ac-dy" as string]: `${d.richting[1] * 10}px`,
                }}
                onClick={() => wissel(plek)}
                onKeyDown={(e) => onToets(e, plek)}
              >
                <svg width={MAAT} height={MAAT} viewBox={`0 0 ${MAAT} ${MAAT}`} aria-hidden="true">
                  <defs>
                    <clipPath id={clipId}>
                      <path d={d.pad} />
                    </clipPath>
                  </defs>
                  <path className="ac-deel-vorm" d={d.pad} fill="#faf8f5" />
                  <Beeld deel={d} clipId={clipId} />
                  {isGekozen && (
                    <g>
                      {/* De gloed is oranje licht rondom de stip, ook op een gekleurde wedge, met daarbovenop de pulse (PR 164). */}
                      <circle className="ac-gloed" cx={stipX} cy={stipY} r={12} fill="rgba(255,103,31,.55)" />
                      <circle className="ac-puls" cx={stipX} cy={stipY} r={9} fill="none" stroke="rgba(255,103,31,.55)" strokeWidth={2} />
                      <circle cx={stipX} cy={stipY} r={9} fill="#ff671f" stroke="#fff" strokeWidth={3} />
                    </g>
                  )}
                </svg>
                <span className="ac-label" style={{ left: lx, top: ly }}>
                  <AssessmentIcon name={a.icoon} style={{ width: "30px", height: "30px", color: "var(--or)", flex: "none" }} />
                  <span className="ac-label-tekst">
                    {regels.map((r) => (
                      <span key={r}>{r}</span>
                    ))}
                  </span>
                </span>
              </div>
            );
          })}
          <span className="ac-midden" aria-hidden="true" style={{ left: CENTRUM - 40, top: CENTRUM - 40 }}>
            <Image src="/coniche-icoon.svg" alt="" width={46} height={46} />
          </span>
        </div>
      </div>

      <div className="ac-paneel" ref={paneelRef} aria-live="polite">
        {gekozenAssessment && inhoud ? (
          <div key={gekozenAssessment.id} className="ac-detail">
            <h2>{gekozenAssessment.naam}</h2>
            <p className="ac-zin">{nbspNaKoppelteken(inhoud.zin)}</p>
            <ul className="ac-punten">
              {inhoud.punten.map((p) => {
                const Icoon = TEGEL_ICONEN[p.icoon];
                return (
                  <li key={p.tekst}>
                    <Icoon aria-hidden="true" style={{ width: "20px", height: "20px", flex: "none", color: "var(--ink-s)" }} />
                    {p.tekst}
                  </li>
                );
              })}
            </ul>
            <Link href={`/${gekozenAssessment.id}`} className="ac-knop">
              Bekijk dit assessment
            </Link>
          </div>
        ) : (
          <h2 className="ac-leeg">Actionable advies voor het verbeteren van je klantcontact</h2>
        )}
      </div>
    </div>
  );
}
