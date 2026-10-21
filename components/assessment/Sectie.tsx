/**
 * Een sectie van de Assessment-pagina (`CLAUDE.md`, scherm 2, Herontwerp): Met een anker (`#visie`, `#bouwblokken`, `#ai`, `#2030`, `#wat`,
 * `#praktisch`) dat de sticky sub-nav aanwijst, en 60px ruimte erboven voor die balk (`scroll-margin-top`).
 */
export function Sectie({
  id,
  kop,
  inleiding,
  kinderen,
  breed = false,
}: {
  id: string;
  kop: string;
  inleiding?: string;
  kinderen: React.ReactNode;
  /** Zonder de maximale breedte van de tekst, voor secties met kaarten. */
  breed?: boolean;
}) {
  return (
    <section id={id} className="ap-sectie" aria-labelledby={`${id}-kop`}>
      <div className="container">
        <div className={breed ? "ap-sectie-kop" : "ap-sectie-kop"}>
          <h2 id={`${id}-kop`}>{kop}</h2>
          {inleiding && <p className="ap-inleiding">{inleiding}</p>}
        </div>
        {kinderen}
      </div>
    </section>
  );
}
