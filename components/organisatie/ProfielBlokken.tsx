import { KanaalIcoon } from "@/components/icons/KanaalIcons";
import { kanaalStijl } from "@/lib/kanaal-stijl";
import type { ProfielCijfer, ProfielKanaal, ProfielOverig, ProfielTegel } from "@/lib/organisatie-profiel";
import type { KpiRing } from "@/lib/kpi-ringen";

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
export function KanalenBlok({ kanalen, gekozen = null, onKies }: { kanalen: ProfielKanaal[]; gekozen?: string | null; onKies?: (kanaalId: string | null) => void }) {
  if (kanalen.length === 0) return null;
  return (
    <div className="op-blok">
      <span className="op-label">Kanalen</span>
      <ul className="op-kanalen">
        {kanalen.map((k) => {
          const stijl = kanaalStijl(k.naam);
          const inhoud = (
            <>
              <span className="op-kanaal-cirkel" style={k.ingezet ? { background: stijl.kleur, color: stijl.icoonKleur } : undefined}>
                <KanaalIcoon soort={stijl.icoon} size={14} />
              </span>
              <span className="op-kanaal-naam">{k.naam}</span>
              {k.aantal && <span className="op-kanaal-aantal">{k.aantal}</span>}
            </>
          );
          const isGekozen = gekozen === k.id;
          const stijlAan = k.ingezet
            ? { background: stijl.licht, borderColor: isGekozen ? stijl.kleur : stijl.rand, boxShadow: isGekozen ? `0 0 0 2px ${stijl.kleur}` : undefined }
            : undefined;
          // Een kanaal kiezen kan als er een keuze is (`onKies`) en het kanaal bij de gekozen plek ingezet is; een klik op het gekozen kanaal wist de keuze.
          if (onKies && k.klikbaar) {
            return (
              <li key={k.id}>
                <button type="button" className="op-kanaal op-kanaal--knop is-ingezet" style={stijlAan} aria-pressed={isGekozen} onClick={() => onKies(isGekozen ? null : k.id)}>
                  {inhoud}
                </button>
              </li>
            );
          }
          return (
            <li key={k.id} className={`op-kanaal ${k.ingezet ? "is-ingezet" : "is-uit"}`} style={stijlAan}>
              {inhoud}
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

/**
 * Eén ring van het blok KPI's (`dossier.md`, KPI-ringen): 96px met een lijn van 9px, het spoor `#efede8` en een vulling met afgeronde uiteinden die bovenaan begint
 * en met de klok mee loopt. In het midden de waarde (met de eenheid), onder de ring de naam en een regel. Een uitgegrijsde ring heeft alleen het spoor en een
 * streepje in het midden. Elke ring is een afbeelding met een `aria-label`.
 */
const RING = 96;
const LIJN = 9;
const STRAAL = (RING - LIJN) / 2;
const OMTREK = 2 * Math.PI * STRAAL;

export function KpiRingFiguur({ ring, kleur }: { ring: KpiRing; kleur: string }) {
  const grijs = ring.toestand === "leeg" || ring.toestand === "nvt";
  const kleurVol = ring.toestand === "kanaal" ? kleur : "var(--or)";
  const hoek = ring.stip === null ? 0 : ring.stip * 2 * Math.PI - Math.PI / 2;
  return (
    <div className={`op-ring ${grijs ? "is-grijs" : ""}`}>
      <div className="op-ring-figuur" role="img" aria-label={ring.ariaLabel}>
        <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} aria-hidden="true">
          <circle cx={RING / 2} cy={RING / 2} r={STRAAL} fill="none" stroke="#efede8" strokeWidth={LIJN} />
          {!grijs && ring.fractie > 0 && (
            <circle
              cx={RING / 2}
              cy={RING / 2}
              r={STRAAL}
              fill="none"
              stroke={kleurVol}
              strokeWidth={LIJN}
              strokeLinecap="round"
              strokeDasharray={`${OMTREK * ring.fractie} ${OMTREK}`}
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          )}
          {ring.stip !== null && <circle cx={RING / 2 + STRAAL * Math.cos(hoek)} cy={RING / 2 + STRAAL * Math.sin(hoek)} r={5} fill="#fff" stroke="var(--ink)" strokeWidth={2} />}
        </svg>
        <span className="op-ring-waarde" aria-hidden="true">
          {grijs ? <span className="op-ring-streep" /> : ring.tekst}
        </span>
      </div>
      <span className="op-ring-naam">{ring.naam}</span>
      <span className="op-ring-regel">{ring.regel || " "}</span>
    </div>
  );
}

/**
 * Het blok KPI's: Het label (met, bij een gekozen kanaal en Onderdeel, die erachter), rechts de legenda of een keuzelijst, en de rij ringen. Eén opmaak voor
 * het organisatiepaneel en voor het profiel van de Lead.
 */
export function KpiRingenBlok({
  kop,
  ringen,
  kanaalKleur,
  legenda,
  info,
  rechts,
}: {
  kop: string;
  ringen: KpiRing[];
  /** De kleur van het gekozen kanaal. */
  kanaalKleur: string;
  /** Bij een gekozen kanaal: De legenda "Algemeen (alle kanalen)" met het stipje. */
  legenda: boolean;
  info?: React.ReactNode;
  /** Rechts op de regel van het label, bijvoorbeeld de keuzelijst van het Onderdeel. */
  rechts?: React.ReactNode;
}) {
  if (ringen.length === 0) return null;
  return (
    <div className="op-blok op-kpis">
      <div className="op-kpis-kop">
        <span className="op-label">{kop}</span>
        {info}
        <span className="op-kpis-rechts">
          {legenda && (
            <span className="op-legenda">
              <span className="op-legenda-stip" aria-hidden="true" />
              Algemeen (alle kanalen)
            </span>
          )}
          {rechts}
        </span>
      </div>
      <div className="op-ringen">
        {ringen.map((r) => (
          <KpiRingFiguur key={r.id} ring={r} kleur={kanaalKleur} />
        ))}
      </div>
    </div>
  );
}
