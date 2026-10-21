"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AssessmentIcon } from "@/components/icons/AssessmentIcons";
import { TEGEL_ICONEN } from "@/components/icons/LandingIcons";
import { tegelInhoud } from "@/lib/landing";
import {
  AI_WEDGES,
  BOOG_DIKTE,
  CENTRUM,
  KORTE_NAMEN,
  KWART,
  KWARTEN,
  LABEL_R,
  LINKS_WEDGES,
  MAAT,
  QUICK_BOGEN,
  RINGEN,
  WEDGE_DEKKING,
  boogPad,
  kompas,
  lijnPunten,
  lijnVulling,
  stipPunt,
  volgendeKeuze,
  wedgePad,
  Positie,
} from "@/lib/assessmentcirkel";
import { Assessment } from "@/lib/types";

/** De beelden in een kwart zijn vaste illustraties met voorbeelddata: Ze rekenen niets uit. */
function Beeld({ positie, clipId }: { positie: Positie; clipId: string }) {
  const lijn = positie !== "br";
  return (
    <g clipPath={`url(#${clipId})`}>
      {positie === "tl" || positie === "bl"
        ? LINKS_WEDGES.map((w) => <path key={w.naam} d={wedgePad(w.van, w.tot)} fill={w.kleur} fillOpacity={WEDGE_DEKKING} stroke="#fff" strokeWidth={1.2} />)
        : positie === "tr"
          ? AI_WEDGES.map((w, i) => <path key={i} d={wedgePad(w.van, w.tot)} fill={w.kleur} fillOpacity={WEDGE_DEKKING} stroke="#fff" strokeWidth={1.2} />)
          : null}
      {positie !== "br" &&
        RINGEN.map((r) => <circle key={r} cx={CENTRUM} cy={CENTRUM} r={r} fill="none" stroke="#fff" strokeOpacity={0.75} strokeWidth={1.2} />)}
      {positie === "br" &&
        QUICK_BOGEN.map((b) => (
          <g key={b.r}>
            <path d={boogPad(b.r, 1)} fill="none" stroke="#e9e6df" strokeWidth={BOOG_DIKTE} strokeLinecap="round" />
            <path d={boogPad(b.r, b.score)} fill="none" stroke={b.kleur} strokeWidth={BOOG_DIKTE} strokeLinecap="round" />
          </g>
        ))}
      {lijn && <polygon points={lijnVulling()} fill="#ff671f" fillOpacity={0.14} stroke="none" />}
      {lijn && <polyline points={lijnPunten()} fill="none" stroke="#ff671f" strokeWidth={2.5} strokeLinejoin="miter" strokeLinecap="butt" />}
    </g>
  );
}

/**
 * Kies jouw assessment als cirkel met vier kwarten (`CLAUDE.md`, scherm 1, besloten door Joost op 21 oktober 2026, ontwerp `Home-D`): Eén cirkel van
 * 568px in vier kwarten, elk kwart is een Assessment (in de volgorde van de lijst: linksboven, rechtsboven, linksonder, rechtsonder), met rechts
 * het detailpaneel van het gekozen kwart. Een keuzegroep met vier opties: Pijltoetsen wisselen, de naam van het Assessment is het label. Er is
 * steeds één kwart gekozen of geen. Bij meer dan vier Assessments staan de overige niet in de cirkel (open punt, `backlog.md`).
 */
export function AssessmentCirkel({ assessments }: { assessments: Assessment[] }) {
  const lijst = assessments.slice(0, 4);
  const [gekozen, setGekozen] = useState<number | null>(null);
  const [schaal, setSchaal] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const paneelRef = useRef<HTMLDivElement>(null);
  const kwartRefs = useRef<(HTMLDivElement | null)[]>([]);
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

  function kies(i: number | null) {
    setGekozen(i);
    // Onder 768px staat het paneel onder de cirkel: Scrol ernaartoe.
    if (i !== null && typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      setTimeout(() => paneelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }

  function onToets(e: React.KeyboardEvent, i: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      kies(i);
      return;
    }
    const volgende = volgendeKeuze(i, lijst.length, e.key);
    if (volgende === null) return;
    e.preventDefault();
    kies(volgende);
    kwartRefs.current[volgende]?.focus();
  }

  const gekozenAssessment = gekozen !== null ? lijst[gekozen] : null;
  const inhoud = gekozenAssessment ? tegelInhoud(gekozenAssessment) : null;

  return (
    <div className="ac">
      <div ref={wrapRef} className="ac-vlak" style={{ height: MAAT * schaal }}>
        <div className="ac-stage" role="radiogroup" aria-label="Kies jouw assessment" style={{ transform: `scale(${schaal})` }}>
          {KWARTEN.map((k, i) => {
            const a = lijst[i];
            if (!a) return null;
            const isGekozen = gekozen === i;
            const gedimd = gekozen !== null && !isGekozen;
            const clipId = `ac-${uid}-${k.positie}`;
            const [stipX, stipY] = stipPunt(k.positie);
            const [lx, ly] = kompas(LABEL_R, k.midden);
            const label = KORTE_NAMEN[a.id] ?? a.kortLabel ?? a.naam;
            return (
              <div
                key={a.id}
                ref={(el) => {
                  kwartRefs.current[i] = el;
                }}
                role="radio"
                aria-checked={isGekozen}
                aria-label={a.naam}
                tabIndex={isGekozen || (gekozen === null && i === 0) ? 0 : -1}
                className={`ac-kwart ${isGekozen ? "is-gekozen" : ""} ${gedimd ? "is-gedimd" : ""}`}
                style={{
                  left: k.x0,
                  top: k.y0,
                  width: KWART,
                  height: KWART,
                  transformOrigin: `${k.richting[0] < 0 ? KWART : 0}px ${k.richting[1] < 0 ? KWART : 0}px`,
                  ["--ac-dx" as string]: `${k.richting[0] * 7}px`,
                  ["--ac-dy" as string]: `${k.richting[1] * 7}px`,
                }}
                onClick={() => kies(i)}
                onKeyDown={(e) => onToets(e, i)}
              >
                <svg width={KWART} height={KWART} viewBox={`${k.x0} ${k.y0} ${KWART} ${KWART}`} aria-hidden="true">
                  <defs>
                    <clipPath id={clipId}>
                      <path d={k.pad} />
                    </clipPath>
                  </defs>
                  <path d={k.pad} fill="#faf8f5" />
                  <Beeld positie={k.positie} clipId={clipId} />
                  {isGekozen && (
                    <g>
                      <circle className="ac-puls" cx={stipX} cy={stipY} r={9} fill="none" stroke="#ff671f" strokeWidth={2} />
                      <circle cx={stipX} cy={stipY} r={9} fill="#ff671f" stroke="#fff" strokeWidth={3} />
                    </g>
                  )}
                </svg>
                <span className="ac-label" style={{ left: lx - k.x0, top: ly - k.y0 }}>
                  <AssessmentIcon name={a.icoon} style={{ width: "30px", height: "30px", color: "var(--or)", flex: "none" }} />
                  <span>{label}</span>
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
            <p className="ac-zin">{inhoud.zin}</p>
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
          <h2 className="ac-leeg">Vier assessments in één cirkel. Klik op een kwart voor de details.</h2>
        )}
      </div>
    </div>
  );
}
