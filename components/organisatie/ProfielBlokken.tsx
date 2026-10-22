import { KanaalIcoon } from "@/components/icons/KanaalIcons";
import { kanaalStijl } from "@/lib/kanaal-stijl";
import type { ProfielCijfer, ProfielKanaal, ProfielOverig, ProfielTegel } from "@/lib/organisatie-profiel";

/**
 * De blokken van het organisatiepaneel (`beheerpagina.md`, Organisatiepaneel): De kop met de beginletter, de naam en de pillen Sector en Subsector, de
 * cijferrij, de Kanalen, de Techstack en de overige velden. Eén opmaak voor het paneel bij de Consultant en voor het profiel dat de Lead bovenaan het
 * Dossier ziet (`dossier.md`, Profiel van de Organisatie). Een blok zonder inhoud rendert niets.
 */
export function ProfielKop({
  letter,
  naam,
  sector,
  subsector,
  niveau: Kop = "h1",
  naamActie,
  acties,
  onder,
}: {
  letter: string;
  naam: string;
  sector: { tekst: string; origineel?: string } | null;
  subsector: { tekst: string; origineel?: string } | null;
  /** Het kopniveau van de naam: `h1` in het paneel, `h2` waar de pagina al een eigen h1 heeft (het Dossier van de Lead). */
  niveau?: "h1" | "h2";
  /** Naast de naam, bijvoorbeeld het potlood om de naam te bewerken. */
  naamActie?: React.ReactNode;
  /** Rechts in de kop, bijvoorbeeld "Bewerken". */
  acties?: React.ReactNode;
  /** Onder de pillen, bijvoorbeeld de regel "Aangemaakt door". */
  onder?: React.ReactNode;
}) {
  return (
    <div className="op-kop">
      <span className="op-letter" aria-hidden="true">
        {letter}
      </span>
      <div className="op-kop-tekst">
        <div className="op-naamrij">
          <Kop className="op-naam">{naam}</Kop>
          {naamActie}
        </div>
        {(sector || subsector) && (
          <div className="op-pillen">
            {sector && (
              <span className="op-pil op-pil--sector" title={sector.origineel}>
                {sector.tekst}
              </span>
            )}
            {subsector && (
              <span className="op-pil op-pil--subsector" title={subsector.origineel}>
                {subsector.tekst}
              </span>
            )}
          </div>
        )}
        {onder}
      </div>
      {acties && <div className="op-kop-acties">{acties}</div>}
    </div>
  );
}

/** De cijferrij: Een kolom per cijfer met een lijn ertussen. Een cijfer zonder waarde valt weg, de rest schuift op. */
export function Cijferrij({ cijfers }: { cijfers: ProfielCijfer[] }) {
  if (cijfers.length === 0) return null;
  return (
    <dl className="op-cijfers" aria-label="Cijfers">
      {cijfers.map((c) => (
        <div key={c.id} className="op-cijfer">
          <dd className="op-cijfer-waarde">{c.waarde}</dd>
          <dt className="op-cijfer-toelichting">{c.toelichting}</dt>
        </div>
      ))}
    </dl>
  );
}

/** Een pil per Kanaal: Ingezet gekleurd met het aantal contacten per jaar, niet ingezet lichtgrijs. Het blok staat er zodra er kanalen zijn. */
export function KanalenBlok({ kanalen }: { kanalen: ProfielKanaal[] }) {
  if (kanalen.length === 0) return null;
  return (
    <div className="op-blok">
      <span className="op-label">Kanalen</span>
      <ul className="op-kanalen">
        {kanalen.map((k) => {
          const stijl = kanaalStijl(k.naam);
          return (
            <li
              key={k.id}
              className={`op-kanaal ${k.ingezet ? "is-ingezet" : "is-uit"}`}
              style={k.ingezet ? { background: stijl.licht, borderColor: stijl.rand } : undefined}
            >
              <span className="op-kanaal-cirkel" style={k.ingezet ? { background: stijl.kleur, color: stijl.icoonKleur } : undefined}>
                <KanaalIcoon soort={stijl.icoon} size={14} />
              </span>
              <span className="op-kanaal-naam">{k.naam}</span>
              {k.aantal && <span className="op-kanaal-aantal">{k.aantal}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Een tegel per Techstack-categorie met een oplossing: Alleen de oplossing, niet wie haar ondersteunt. */
export function TechstackBlok({ tegels }: { tegels: ProfielTegel[] }) {
  if (tegels.length === 0) return null;
  return (
    <div className="op-blok">
      <span className="op-label">Techstack</span>
      <ul className="op-techstack">
        {tegels.map((t) => (
          <li key={t.categorie} className="op-tegel" title={t.origineel}>
            <span className="op-tegel-categorie">{t.categorie}</span>
            <span className="op-tegel-oplossing">{t.oplossing}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** De overige velden als kleine regel: Een label boven een waarde, in een rij die afbreekt. */
export function OverigBlok({ overig }: { overig: ProfielOverig[] }) {
  if (overig.length === 0) return null;
  return (
    <dl className="op-overig" aria-label="Overige velden">
      {overig.map((o) => (
        <div key={o.label}>
          <dt>{o.label}</dt>
          <dd>{o.waarde}</dd>
        </div>
      ))}
    </dl>
  );
}
