"use client";

import { Suspense, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageWithChrome } from "@/components/PageWithChrome";
import { Modal } from "@/components/Modal";
import { bouwstenenGroepen, BouwsteenContent } from "@/data/bouwstenen-content";
import { CATEGORIE_COLORS } from "@/lib/colors";

interface Geselecteerd {
  bouwsteen: BouwsteenContent;
  groepNaam: string;
  kleur: string;
}

/**
 * Op de kaart zelf (niet in de modal-titel) mogen deze twee samengestelde
 * namen over 2 regels — een onzichtbare break-hint op de samenstellingsgrens
 * voorkomt dat de browser midden in "-ment" afbreekt.
 */
const KAART_NAAM: Record<string, string> = {
  Kennismanagement: "Kennis​management",
  Kanaalmanagement: "Kanaal​management",
};

function BouwsteenKaart({
  bouwsteen,
  kleur,
  actief,
  onClick,
}: {
  bouwsteen: BouwsteenContent;
  kleur: string;
  actief: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card card-accent-left"
      style={
        {
          "--accent": kleur,
          display: "flex",
          alignItems: "center",
          textAlign: "left",
          width: "100%",
          minWidth: 0,
          height: "4.75rem",
          cursor: "pointer",
          position: "relative",
          padding: "1.1rem 2.2rem 1.1rem 1.2rem",
          background: actief ? kleur : "var(--bg)",
        } as React.CSSProperties
      }
    >
      <span
        style={{
          position: "absolute",
          top: "0.7rem",
          right: "0.9rem",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: actief ? "rgba(255,255,255,0.75)" : "var(--ink-s)",
        }}
      >
        {bouwsteen.nummer}
      </span>
      <span
        className="text-sm font-semibold"
        style={{
          color: actief ? "#fff" : "var(--ink)",
          overflowWrap: "break-word",
          minWidth: 0,
        }}
      >
        {KAART_NAAM[bouwsteen.naam] ?? bouwsteen.naam}
      </span>
    </button>
  );
}

function GroepRij({
  groepNaam,
  kleur,
  metLabel,
  geselecteerd,
  onSelecteer,
}: {
  groepNaam: string;
  kleur: string;
  metLabel: boolean;
  geselecteerd: Geselecteerd | null;
  onSelecteer: (s: Geselecteerd) => void;
}) {
  const groep = bouwstenenGroepen.find((g) => g.naam === groepNaam)!;
  const volleBreedte = groep.bouwstenen.length === 1 || groepNaam === "Overkoepelend";

  /**
   * Volle-breedte balken lijnen rechts uit met kolom 3 (5/9/13), behalve
   * blok 2 dat op verzoek juist met kolom 4 (6/10/14) rechts uitlijnt.
   */
  function gridColumnVoor(nummer: number): string | undefined {
    if (!volleBreedte) return undefined;
    return nummer === 2 ? "1 / -1" : "1 / span 3";
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "flex-start",
        marginBottom: "1.2rem",
        padding: "1.2rem",
        ...(metLabel ? { background: "var(--or-faint)", borderRadius: "10px" } : {}),
      }}
    >
      <div
        style={{
          width: "8rem",
          flex: "none",
          display: "flex",
          alignItems: "center",
          paddingTop: "1.2rem",
        }}
      >
        {metLabel && (
          <span className="text-sm font-semibold" style={{ color: "var(--ink-m)" }}>
            {groepNaam}
          </span>
        )}
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.75rem",
          flex: 1,
        }}
      >
        {groep.bouwstenen.map((bouwsteen) => (
          <div
            key={bouwsteen.nummer}
            data-bouwsteen-nummer={bouwsteen.nummer}
            style={{ gridColumn: gridColumnVoor(bouwsteen.nummer) }}
          >
            <BouwsteenKaart
              bouwsteen={bouwsteen}
              kleur={kleur}
              actief={geselecteerd?.bouwsteen.nummer === bouwsteen.nummer}
              onClick={() => onSelecteer({ bouwsteen, groepNaam, kleur })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Stippellijn-kader (op verzoek van Sander) waarvan de boven- en onderrand
 * niet om blok 1 en 15 heen lopen, maar er precies horizontaal doorheen
 * (achter de verticale middens) — vandaar gemeten posities i.p.v. een
 * gewone CSS `border` met padding.
 */
function StippellijnKader({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lijnen, setLijnen] = useState<{ top: number; bottom: number } | null>(null);

  useLayoutEffect(() => {
    function meet() {
      const container = containerRef.current;
      if (!container) return;
      const blok1 = container.querySelector('[data-bouwsteen-nummer="1"]');
      const blok15 = container.querySelector('[data-bouwsteen-nummer="15"]');
      if (!blok1 || !blok15) return;
      const containerTop = container.getBoundingClientRect().top;
      const r1 = blok1.getBoundingClientRect();
      const r15 = blok15.getBoundingClientRect();
      setLijnen({
        top: r1.top + r1.height / 2 - containerTop,
        bottom: r15.top + r15.height / 2 - containerTop,
      });
    }
    meet();
    window.addEventListener("resize", meet);
    return () => window.removeEventListener("resize", meet);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", padding: "0 1.5rem" }}>
      {lijnen && (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: lijnen.top,
              borderTop: "2px dashed var(--or)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: lijnen.bottom,
              borderTop: "2px dashed var(--or)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: lijnen.top,
              height: lijnen.bottom - lijnen.top,
              borderLeft: "2px dashed var(--or)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: lijnen.top,
              height: lijnen.bottom - lijnen.top,
              borderRight: "2px dashed var(--or)",
            }}
          />
        </>
      )}
      {children}
    </div>
  );
}

export default function BouwstenenPage() {
  return (
    <Suspense fallback={null}>
      <BouwstenenInhoud />
    </Suspense>
  );
}

function BouwstenenInhoud() {
  const [geselecteerd, setGeselecteerd] = useState<Geselecteerd | null>(null);
  const code = useSearchParams().get("code") ?? undefined;

  return (
    <PageWithChrome logoHref={code ? `/s/${code}` : undefined} code={code} toonTerug>
      <div style={{ background: "linear-gradient(180deg, var(--or-faint) 0%, var(--bg) 65%)" }}>
        <div className="container" style={{ padding: "4.5rem 2rem 3.5rem", textAlign: "center" }}>
          <span className="eyebrow">Coniche Scan</span>
          <h1>De Bouwstenen van Klantcontact</h1>
          <p
            style={{
              maxWidth: "40rem",
              margin: "1rem auto 0",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            Vijftien bouwstenen, verdeeld over vijf groepen, beschrijven de voorwaarden voor goed
            klantcontact. Klik op een bouwsteen voor de beschrijving en de centrale vraag.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "5rem", maxWidth: "64rem" }}>
      <StippellijnKader>
        <GroepRij
          groepNaam="Overkoepelend"
          kleur={CATEGORIE_COLORS.oranje.hex}
          metLabel={false}
          geselecteerd={geselecteerd}
          onSelecteer={setGeselecteerd}
        />
        <GroepRij
          groepNaam="Organisatie"
          kleur={CATEGORIE_COLORS.blauw.hex}
          metLabel
          geselecteerd={geselecteerd}
          onSelecteer={setGeselecteerd}
        />
        <GroepRij
          groepNaam="Proces & Tech"
          kleur={CATEGORIE_COLORS.paars.hex}
          metLabel
          geselecteerd={geselecteerd}
          onSelecteer={setGeselecteerd}
        />
        <GroepRij
          groepNaam="Mens"
          kleur={CATEGORIE_COLORS.groen.hex}
          metLabel
          geselecteerd={geselecteerd}
          onSelecteer={setGeselecteerd}
        />
        <GroepRij
          groepNaam="Fundament"
          kleur={CATEGORIE_COLORS.antraciet.hex}
          metLabel={false}
          geselecteerd={geselecteerd}
          onSelecteer={setGeselecteerd}
        />
      </StippellijnKader>
      </div>

      <Modal
        open={geselecteerd !== null}
        onClose={() => setGeselecteerd(null)}
        title={geselecteerd?.bouwsteen.naam ?? ""}
        eyebrow={
          geselecteerd
            ? `${geselecteerd.groepNaam.toUpperCase()} · BOUWSTEEN ${geselecteerd.bouwsteen.nummer}`
            : undefined
        }
        accentColor={geselecteerd?.kleur}
      >
        {geselecteerd && (
          <>
            <div
              style={{
                borderLeft: `3px solid ${geselecteerd.kleur}`,
                paddingLeft: "0.9rem",
                margin: "0 0 1.2rem",
              }}
            >
              <p
                className="text-xs font-bold"
                style={{ color: geselecteerd.kleur, letterSpacing: "0.08em", marginBottom: "0.2rem" }}
              >
                CENTRALE VRAAG
              </p>
              <p style={{ color: "var(--ink)", fontWeight: 600 }}>
                {geselecteerd.bouwsteen.centraleVraag}
              </p>
            </div>
            {geselecteerd.bouwsteen.beschrijving.map((tekst, i) => (
              <p key={i}>{tekst}</p>
            ))}
          </>
        )}
      </Modal>
    </PageWithChrome>
  );
}
