import { nbspNaKoppelteken } from "@/lib/format";

/**
 * Een sectie van de Assessment-pagina (`CLAUDE.md`, scherm 2, Herontwerp): Met een anker (`#visie`, `#bouwblokken`, `#ai`, `#2030`, `#wat`,
 * `#praktisch`) dat de sticky sub-nav aanwijst, en 60px ruimte erboven voor die balk (`scroll-margin-top`).
 */
export function Sectie({
  id,
  kop,
  inleiding,
  kinderen,
  warm = false,
}: {
  id: string;
  kop: string;
  inleiding?: string;
  kinderen: React.ReactNode;
  /** Een warme achtergrond (`--bg-warm`) met een boven- en onderrand: Secties wisselen af tussen wit en warm, beginnend met wit. */
  warm?: boolean;
}) {
  return (
    <section id={id} className={`ap-sectie ${warm ? "ap-sectie--warm" : ""}`} aria-labelledby={`${id}-kop`}>
      <div className="container">
        <div className="ap-sectie-kop">
          <h2 id={`${id}-kop`}>{kop}</h2>
          {inleiding && <p className="lead ap-inleiding">{nbspNaKoppelteken(inleiding)}</p>}
        </div>
        {kinderen}
      </div>
    </section>
  );
}
