"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageWithChrome } from "@/components/PageWithChrome";
import { Modal } from "@/components/Modal";
import { aiDomeinen, AiDomeinContent } from "@/data/ai-domeinen-content";

function DomeinKaart({
  domein,
  actief,
  onClick,
}: {
  domein: AiDomeinContent;
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
          "--accent": "var(--or)",
          display: "flex",
          alignItems: "center",
          textAlign: "left",
          width: "100%",
          minWidth: 0,
          height: "4.75rem",
          cursor: "pointer",
          position: "relative",
          padding: "1.1rem 2.2rem 1.1rem 1.2rem",
          background: actief ? "var(--or)" : "var(--bg)",
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
        {domein.nummer}
      </span>
      <span className="text-sm font-semibold" style={{ color: actief ? "#fff" : "var(--ink)" }}>
        {domein.naam}
      </span>
    </button>
  );
}

/**
 * AI-domeinenmodel, interactief overzicht (`ai-domeinenmodel-visual.md`).
 * Analoog aan `/bouwstenen`, maar één plat grid (geen categorielaag, geen
 * overkoepelende/fundamentele balken) en overal dezelfde accentkleur
 * (`--or`) — er is geen categorie om een eigen kleur aan op te hangen.
 */
export default function AiDomeinenPage() {
  return (
    <Suspense fallback={null}>
      <AiDomeinenInhoud />
    </Suspense>
  );
}

function AiDomeinenInhoud() {
  const [geselecteerd, setGeselecteerd] = useState<AiDomeinContent | null>(null);
  const code = useSearchParams().get("code") ?? undefined;

  return (
    <PageWithChrome logoHref={code ? `/s/${code}` : undefined} code={code} toonTerug>
      <div style={{ background: "linear-gradient(180deg, var(--or-faint) 0%, var(--bg) 65%)" }}>
        <div className="container" style={{ padding: "4.5rem 2rem 3.5rem", textAlign: "center" }}>
          <span className="eyebrow">Coniche Scan</span>
          <h1>De AI-domeinen in Klantcontact</h1>
          <p
            style={{
              maxWidth: "40rem",
              margin: "1rem auto 0",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            Acht domeinen beschrijven hoe volwassen een organisatie is in het inzetten van AI
            binnen klantcontact. Klik op een domein voor meer uitleg.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "5rem", maxWidth: "64rem" }}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
          {aiDomeinen.map((domein) => (
            <DomeinKaart
              key={domein.nummer}
              domein={domein}
              actief={geselecteerd?.nummer === domein.nummer}
              onClick={() => setGeselecteerd(domein)}
            />
          ))}
        </div>
      </div>

      <Modal
        open={geselecteerd !== null}
        onClose={() => setGeselecteerd(null)}
        title={geselecteerd?.naam ?? ""}
        eyebrow={geselecteerd ? `AI-DOMEIN ${geselecteerd.nummer}` : undefined}
        accentColor="var(--or)"
      >
        {geselecteerd && (
          <>
            <div
              style={{
                borderLeft: "3px solid var(--or)",
                paddingLeft: "0.9rem",
                margin: "0 0 1.2rem",
              }}
            >
              <p
                className="text-xs font-bold"
                style={{ color: "var(--or)", letterSpacing: "0.08em", marginBottom: "0.2rem" }}
              >
                CENTRALE VRAAG
              </p>
              <p style={{ color: "var(--ink)", fontWeight: 600 }}>{geselecteerd.centraleVraag}</p>
            </div>
            {geselecteerd.beschrijving.map((tekst, i) => (
              <p key={i}>{tekst}</p>
            ))}
          </>
        )}
      </Modal>
    </PageWithChrome>
  );
}
