"use client";

import { useState } from "react";
import Link from "next/link";
import { AssessmentIcon } from "@/components/icons/AssessmentIcons";
import { CirkelPaneel } from "@/components/mijn-metingen/CirkelPaneel";
import { nodigLidUit } from "@/lib/db";
import { voortgang } from "@/lib/scoring";
import { balkVul } from "@/lib/format";
import { volgendeUrl } from "@/lib/scan-routing";
import { aantalAfgerondInMeting, isSamengesteld, gemiddeldeAntwoordenVoorMetingMetSamenstelling } from "@/lib/metingen";
import { heeftMetingToegang } from "@/lib/lead-toegang";
import {
  Respons,
  Teaser,
  isEindstand,
  laatstOpgeslagenTekst,
  langeDatum,
  maandJaarLang,
  responsVan,
  teaserVoorGemiddelden,
  teaserVoorMeting,
  teaserVoorScan,
} from "@/lib/mijn-metingen";
import { dagVan } from "@/lib/metingen";
import { Assessment, Organisatie, OrganisatieLid, ScanInvulling, ScanInvullingStatus, ScanUitvoering } from "@/lib/types";

/* ---------- Kleine onderdelen ---------- */

const STATUS_CHIP: Record<ScanInvullingStatus, { tekst: string; klasse: string }> = {
  uitgenodigd: { tekst: "Uitgenodigd", klasse: "mm-chip--blauw" },
  bezig: { tekst: "Bezig", klasse: "mm-chip--amber" },
  afgerond: { tekst: "Afgerond", klasse: "mm-chip--groen" },
};

const HOOFDACTIE: Record<ScanInvullingStatus, string> = {
  uitgenodigd: "Start de scan",
  bezig: "Ga verder",
  afgerond: "Bekijk jouw resultaten",
};

function Chip({ klasse, children }: { klasse: string; children: React.ReactNode }) {
  return (
    <span className={`mm-chip ${klasse}`}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

/** De vulling van een balk: Hele pixels, minstens 4px boven nul (`stylesheet.md`, Balklijst). */
function vul(percentage: number, kleur?: string): { className: string; style: React.CSSProperties } {
  const b = balkVul(percentage);
  return { className: b.className, style: { ...(b.style as React.CSSProperties), ...(kleur ? { background: kleur } : {}) } };
}

/** Een balk van 8px met een tekstalternatief ("23 van 60 vragen beantwoord"). */
function Balk({ fractie, label, warm = false }: { fractie: number; label: string; warm?: boolean }) {
  return (
    <div className={`mm-balk ${warm ? "mm-balk--warm" : ""}`} role="img" aria-label={label}>
      <div {...vul(fractie * 100)} />
    </div>
  );
}

/** De teaser: Links het getal met de klasse, rechts een rij per categorie of afdeling. */
function TeaserBlok({ teaser, label }: { teaser: Teaser; label: string }) {
  return (
    <div className="mm-teaser">
      <div className="mm-teaser-getal">
        {/* Bij de hele Meting staat het aantal scans achter de titel, zodat beide blokken dezelfde regels hebben. */}
        <span className="mm-label-klein">
          {label}
          {teaser.aantalScans !== undefined && ` · ${teaser.aantalScans} ${teaser.aantalScans === 1 ? "scan" : "scans"}`}
        </span>
        <div className="mm-teaser-getal-rij">
          <span className="mm-getal" style={teaser.getalKleur ? { color: teaser.getalKleur } : undefined}>
            {teaser.getal}
          </span>
          {teaser.pilAchtergrond && teaser.klasseNaam && (
            <span className="mm-klassepil" style={{ background: teaser.pilAchtergrond, color: teaser.pilTekst ?? undefined }}>
              {teaser.klasseNaam}
            </span>
          )}
        </div>
        {!teaser.pilAchtergrond && teaser.klasseNaam && <strong className="mm-klassenaam">{teaser.klasseNaam}</strong>}
        {teaser.sub && <span className="mm-sub">{teaser.sub}</span>}
      </div>
      {teaser.rijen.length > 0 && (
        <div className={`mm-teaser-rijen ${teaser.stijl === "stip" ? "mm-teaser-rijen--stip" : ""} ${teaser.soort === "schaal" ? "mm-teaser-rijen--schaal" : ""}`}>
          {teaser.rijen.map((r) => (
            <div key={r.sleutel} className="mm-teaser-rij" role="img" aria-label={r.alt}>
              <span className="mm-teaser-naam">{r.naam}</span>
              <span className="mm-teaser-balk" aria-hidden="true">
                {teaser.stijl === "stip" ? (
                  <>
                    {r.lijn && (
                      <b
                        className="mm-teaser-lijn"
                        style={{ left: `${r.lijn.van * 100}%`, width: `${(r.lijn.tot - r.lijn.van) * 100}%` }}
                      />
                    )}
                    <b className="mm-teaser-stip" style={{ left: `${r.fractie * 100}%`, background: r.kleur }} />
                  </>
                ) : (
                  <i {...vul(r.fractie * 100, r.kleur)} />
                )}
              </span>
              <span className="mm-teaser-waarde">{r.waarde}</span>
            </div>
          ))}
          {teaser.ankers && (
            <div className="mm-teaser-rij mm-teaser-ankers" aria-hidden="true">
              <span />
              <span className="mm-teaser-anker-spoor">
                <span>1</span>
                <span>5</span>
              </span>
              <span className="mm-teaser-waarde" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResponsBlok({ respons, warm }: { respons: Respons; warm?: boolean }) {
  return (
    <div className="mm-respons">
      <div className="mm-voortgang-rij">
        <strong>
          {respons.afgerond} van {respons.uitgenodigd} respondenten afgerond
        </strong>
        {respons.compleet ? <Chip klasse="mm-chip--groen">Compleet</Chip> : <span className="mm-sub">{respons.percentage}%</span>}
      </div>
      <Balk
        fractie={respons.uitgenodigd === 0 ? 0 : respons.afgerond / respons.uitgenodigd}
        label={`${respons.afgerond} van ${respons.uitgenodigd} respondenten afgerond`}
        warm={warm}
      />
    </div>
  );
}

function KaartKop({
  assessment,
  titel,
  sub,
  rechts,
}: {
  assessment: Assessment | undefined;
  titel: string;
  sub: string;
  rechts?: React.ReactNode;
}) {
  return (
    <header className="mm-kop">
      <span className="mm-icoon" aria-hidden="true">
        {assessment ? <AssessmentIcon name={assessment.icoon} width={30} height={30} /> : null}
      </span>
      <div className="mm-kop-tekst">
        <h2>{titel}</h2>
        <p>{sub}</p>
      </div>
      {rechts && <div className="mm-kop-rechts">{rechts}</div>}
    </header>
  );
}

function metingSub(scanUitvoering: ScanUitvoering, afgerondOp?: string | null): string {
  const maand = maandJaarLang(scanUitvoering.meetdatum);
  const basis = maand ? `Meting ${maand}` : `Meting ${scanUitvoering.label}`;
  const dag = langeDatum(dagVan(afgerondOp ?? undefined));
  return dag ? `${basis}, afgerond op ${dag}` : basis;
}

/* ---------- Eigen scan ---------- */

/** De teaser van een afgeronde eigen scan, voor de Kaart met cirkel. `null` zolang de scan niet is afgerond. */
function eigenTeaser(assessment: Assessment | undefined, invulling: ScanInvulling): Teaser | null {
  return invulling.status === "afgerond" && assessment ? teaserVoorScan(assessment, invulling.antwoorden, invulling.relevantie) : null;
}

/** De inhoud van een eigen scan per status: De zin, de voortgang of de teaser, met de hoofdknop. */
function EigenScanInhoud({
  code,
  assessment,
  invulling,
  teaserLabel = "Jouw overall score",
}: {
  code?: string;
  assessment: Assessment | undefined;
  invulling: ScanInvulling;
  teaserLabel?: string;
}) {
  void code;
  const { beantwoord, totaal } = assessment
    ? voortgang(assessment, invulling.antwoorden, invulling.relevantie)
    : { beantwoord: 0, totaal: 0 };
  const opgeslagen = laatstOpgeslagenTekst(invulling.laatstOpgeslagenOp);
  const teaser =
    invulling.status === "afgerond" && assessment ? teaserVoorScan(assessment, invulling.antwoorden, invulling.relevantie) : null;
  return (
    <>
      {invulling.status === "uitgenodigd" && (
        <p className="mm-tekst">
          Je bent op {langeDatum(invulling.uitgenodigdOp) || "een eerdere datum"} uitgenodigd voor deze scan. Je antwoorden worden
          tussentijds bewaard, dus je kunt later verder.
        </p>
      )}
      {invulling.status === "bezig" && (
        <div>
          <div className="mm-voortgang-rij">
            <strong>
              {beantwoord} van {totaal} vragen
            </strong>
            {opgeslagen && <span className="mm-sub">Laatst opgeslagen {opgeslagen}</span>}
          </div>
          <Balk fractie={totaal === 0 ? 0 : beantwoord / totaal} label={`${beantwoord} van ${totaal} vragen beantwoord`} />
        </div>
      )}
      {teaser && <TeaserBlok teaser={teaser} label={teaserLabel} />}
    </>
  );
}

export function RespondentKaart({
  assessment,
  scanUitvoering,
  invulling,
}: {
  assessment: Assessment | undefined;
  scanUitvoering: ScanUitvoering;
  invulling: ScanInvulling;
}) {
  const chip = STATUS_CHIP[invulling.status];
  const teaser = eigenTeaser(assessment, invulling);
  return (
    <article className={`mm-kaart ${invulling.status === "afgerond" ? "mm-kaart--vol" : ""}`}>
      <KaartKop
        assessment={assessment}
        titel={assessment?.naam ?? "Onbekend type"}
        sub={metingSub(scanUitvoering, invulling.status === "afgerond" ? invulling.afgerondOp : null)}
        rechts={<Chip klasse={chip.klasse}>{chip.tekst}</Chip>}
      />
      {teaser && teaser.rijen.length > 0 ? (
        <CirkelPaneel eigen={teaser} groep={null} afgerondOp={invulling.afgerondOp} />
      ) : (
        <EigenScanInhoud assessment={assessment} invulling={invulling} />
      )}
      <div className="mm-knoppen">
        <Link href={volgendeUrl(invulling.id, invulling.status)} className="btn btn-or btn-compact mm-knop">
          {HOOFDACTIE[invulling.status]}
        </Link>
      </div>
    </article>
  );
}

/* ---------- Lead ---------- */

interface LeadInvoer {
  code: string;
  assessment: Assessment | undefined;
  scanUitvoering: ScanUitvoering;
  organisatie: Organisatie;
  lid: OrganisatieLid;
  minRespondenten: number;
}

/** Wat een Lead van de hele Meting ziet: Het aantal afgeronde scans, de teaser (alleen met Resultaten aan en genoeg scans) en de respons. */
function groepGegevens({ assessment, scanUitvoering, organisatie, lid, minRespondenten }: LeadInvoer) {
  const afgerond = aantalAfgerondInMeting(organisatie, scanUitvoering);
  const aanResultaten = heeftMetingToegang(organisatie, lid.id, "resultaten", scanUitvoering.id);
  let teaser: Teaser | null = null;
  if (assessment && aanResultaten && afgerond >= minRespondenten) {
    teaser = isSamengesteld(scanUitvoering)
      ? teaserVoorGemiddelden(assessment, gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, organisatie, scanUitvoering), afgerond)
      : teaserVoorMeting(assessment, scanUitvoering.invullingen);
  }
  const laatst = scanUitvoering.invullingen
    .filter((i) => i.status === "afgerond" && i.afgerondOp)
    .map((i) => i.afgerondOp as string)
    .sort()
    .pop();
  const respons = { ...responsVan(scanUitvoering.invullingen), laatsteDatum: langeDatum(dagVan(laatst)) };
  return { afgerond, aanResultaten, teaser, respons, paneel: !!teaser && teaser.rijen.length > 0 };
}

/**
 * Het blok "Hele meting": Teaser (of de reden dat die er nog niet is), respons en de knoppen die aan staan. Met `paneel` staan de
 * teaser en de respons al in de Kaart met cirkel en blijven alleen de knoppen over. `voorKnop` is de hoofdknop van de eigen scan,
 * die in dezelfde rij staat.
 */
function HeleMeting({
  code,
  assessment,
  scanUitvoering,
  organisatie,
  lid,
  minRespondenten,
  hoofdLabel,
  teaserLabel,
  paneel = false,
  voorKnop,
}: LeadInvoer & { hoofdLabel: string; teaserLabel: string; paneel?: boolean; voorKnop?: React.ReactNode }) {
  const [uitnodigen, setUitnodigen] = useState(false);
  const [email, setEmail] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const samengesteld = isSamengesteld(scanUitvoering);
  const afgerond = aantalAfgerondInMeting(organisatie, scanUitvoering);
  const respons = responsVan(scanUitvoering.invullingen);
  const aan = (w: "resultaten" | "uitnodigen") => heeftMetingToegang(organisatie, lid.id, w, scanUitvoering.id);
  const basis = `/s/${code}/resultaten/${scanUitvoering.id}`;

  let teaser: Teaser | null = null;
  if (assessment && aan("resultaten") && afgerond >= minRespondenten) {
    teaser = samengesteld
      ? teaserVoorGemiddelden(assessment, gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, organisatie, scanUitvoering), afgerond)
      : teaserVoorMeting(assessment, scanUitvoering.invullingen);
  }

  function handleUitnodigen(e: React.FormEvent) {
    e.preventDefault();
    const resultaat = nodigLidUit(scanUitvoering.id, email.trim());
    if (!resultaat) return;
    setMelding(`Uitgenodigd: ${resultaat.lid.email}`);
    setEmail("");
    setTimeout(() => setMelding(null), 2400);
  }

  const toonResultaten = aan("resultaten") && afgerond > 0;
  const toonUitnodigen = aan("uitnodigen") && !samengesteld;
  // Staat alleen Uitnodigen aan, dan is dat de hoofdactie.
  const paar = [voorKnop, toonResultaten, toonUitnodigen].filter(Boolean).length > 1;

  return (
    <>
      {!paneel &&
        aan("resultaten") &&
        (afgerond >= minRespondenten && teaser ? (
          <TeaserBlok teaser={teaser} label={teaserLabel} />
        ) : (
          <div className="mm-wacht">
            <strong>
              Resultaten volgen bij minstens {minRespondenten} afgeronde scans
            </strong>
            <span className="mm-sub">
              {afgerond} van {minRespondenten}
            </span>
            <Balk fractie={Math.min(1, afgerond / minRespondenten)} label={`${afgerond} van ${minRespondenten} afgeronde scans`} warm />
          </div>
        ))}
      {!paneel && !samengesteld && <ResponsBlok respons={respons} warm />}
      {samengesteld && <p className="mm-sub">Gemiddelde van de onderliggende Metingen, {afgerond} afgeronde scans.</p>}
      <div className={`mm-knoppen ${paar ? "mm-knoppen--paar" : ""}`}>
        {voorKnop}
        {toonResultaten && (
          <Link href={basis} className="btn btn-or btn-compact mm-knop">
            {hoofdLabel}
          </Link>
        )}
        {toonUitnodigen && (
          <button
            type="button"
            className={`btn btn-compact mm-knop ${toonResultaten || voorKnop ? "btn-outline" : "btn-or"}`}
            aria-expanded={uitnodigen}
            onClick={() => setUitnodigen(!uitnodigen)}
          >
            Respondenten uitnodigen
          </button>
        )}
      </div>
      {uitnodigen && toonUitnodigen && (
        <form onSubmit={handleUitnodigen} className="mm-uitnodigen">
          <div className="admin-field" style={{ marginBottom: 0, flex: 1 }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@organisatie.nl"
              aria-label="E-mailadres om uit te nodigen"
            />
          </div>
          <button type="submit" className="btn btn-outline btn-compact">
            Uitnodigen
          </button>
        </form>
      )}
      {melding && <p className="mm-sub">{melding}</p>}
    </>
  );
}

function StandChip({ scanUitvoering }: { scanUitvoering: ScanUitvoering }) {
  if (isSamengesteld(scanUitvoering)) return <Chip klasse="mm-chip--blauw">Gemiddelde</Chip>;
  const eind = isEindstand(responsVan(scanUitvoering.invullingen));
  return <Chip klasse={eind ? "mm-chip--groen" : "mm-chip--amber"}>{eind ? "Eindstand" : "Tussenstand"}</Chip>;
}

export function LeadKaart(invoer: LeadInvoer) {
  const { assessment, scanUitvoering } = invoer;
  const g = groepGegevens(invoer);
  const samengesteld = isSamengesteld(scanUitvoering);
  return (
    // Een kaart met een paneel heeft altijd de volle breedte.
    <article className={`mm-kaart ${g.paneel ? "mm-kaart--vol" : ""}`}>
      <KaartKop
        assessment={assessment}
        titel={assessment?.naam ?? "Onbekend type"}
        sub={metingSub(scanUitvoering)}
        rechts={
          <>
            <span className="mm-rolchip">Lead</span>
            {/* In de Kaart met cirkel vervalt de chip Tussenstand of Eindstand: De respons zegt het al. */}
            {(!g.paneel || samengesteld) && <StandChip scanUitvoering={scanUitvoering} />}
          </>
        }
      />
      {g.paneel && <CirkelPaneel eigen={null} groep={g.teaser} respons={samengesteld ? undefined : g.respons} />}
      <HeleMeting {...invoer} hoofdLabel="Resultaten" teaserLabel="Hele meting" paneel={g.paneel} />
    </article>
  );
}

/** Eén kaart met twee blokken: Jouw scan en Hele meting (`visualisatie-mijn-metingen.md`, Kaart: Lead en respondent). */
export function LeadEnRespondentKaart({ invulling, ...invoer }: LeadInvoer & { invulling: ScanInvulling }) {
  const { assessment, scanUitvoering } = invoer;
  const chip = STATUS_CHIP[invulling.status];
  const eigen = eigenTeaser(assessment, invulling);
  const g = groepGegevens(invoer);
  // Met een afgeronde eigen scan en categorieën of afdelingen: Eén Kaart met cirkel met Jij en Groep op één spoor in plaats van twee blokken.
  if (eigen && eigen.rijen.length > 0) {
    const samengesteld = isSamengesteld(scanUitvoering);
    return (
      <article className="mm-kaart mm-kaart--vol">
        <KaartKop
          assessment={assessment}
          titel={assessment?.naam ?? "Onbekend type"}
          sub={metingSub(scanUitvoering)}
          rechts={
            <>
              <span className="mm-rolchip">Respondent</span>
              <span className="mm-rolchip">Lead</span>
            </>
          }
        />
        <CirkelPaneel
          eigen={eigen}
          groep={g.paneel ? g.teaser : null}
          groepWacht={g.aanResultaten && !g.teaser ? { afgerond: g.afgerond, minimum: invoer.minRespondenten } : undefined}
          respons={samengesteld ? undefined : g.respons}
          afgerondOp={invulling.afgerondOp}
        />
        <HeleMeting
          {...invoer}
          hoofdLabel="Resultaten hele meting"
          teaserLabel="Gemiddelde score"
          paneel
          voorKnop={
            <Link href={volgendeUrl(invulling.id, invulling.status)} className="btn btn-or btn-compact mm-knop">
              {HOOFDACTIE[invulling.status]}
            </Link>
          }
        />
      </article>
    );
  }
  return (
    <article className="mm-kaart mm-kaart--vol">
      <KaartKop
        assessment={assessment}
        titel={assessment?.naam ?? "Onbekend type"}
        sub={metingSub(scanUitvoering)}
        rechts={
          <>
            <span className="mm-rolchip">Respondent</span>
            <span className="mm-rolchip">Lead</span>
          </>
        }
      />
      <div className="mm-twee">
        <section className="mm-blok" aria-label="Jouw scan">
          <div className="mm-blok-kop">
            <span className="mm-label-klein">Jouw scan</span>
            <Chip klasse={chip.klasse}>
              {invulling.status === "afgerond" && invulling.afgerondOp
                ? `Afgerond op ${langeDatum(dagVan(invulling.afgerondOp))}`
                : chip.tekst}
            </Chip>
          </div>
          <EigenScanInhoud assessment={assessment} invulling={invulling} />
          <div className="mm-knoppen">
            <Link href={volgendeUrl(invulling.id, invulling.status)} className="btn btn-or btn-compact mm-knop">
              {HOOFDACTIE[invulling.status]}
            </Link>
          </div>
        </section>
        <section className="mm-blok mm-blok--warm" aria-label="Hele meting">
          <div className="mm-blok-kop">
            <span className="mm-label-klein">Hele meting</span>
            <StandChip scanUitvoering={scanUitvoering} />
          </div>
          <HeleMeting {...invoer} hoofdLabel="Resultaten hele meting" teaserLabel="Gemiddelde score" />
        </section>
      </div>
    </article>
  );
}

/* ---------- Benchmark ---------- */

export function BenchmarkKaart({
  code,
  id,
  naam,
  regel,
}: {
  code: string;
  id: string;
  naam: string;
  regel: string;
}) {
  return (
    <article className="mm-kaart mm-kaart--vol mm-kaart--benchmark">
      <div className="mm-benchmark">
        <span className="mm-icoon mm-icoon--blauw" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="12" width="4" height="8" rx="1" fill="currentColor" />
            <rect x="10" y="6" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="16" y="9" width="4" height="11" rx="1" fill="currentColor" />
          </svg>
        </span>
        <div className="mm-kop-tekst">
          <span className="mm-label-klein mm-label-klein--blauw">Benchmark</span>
          <h2>{naam}</h2>
          {regel && <p>{regel}</p>}
        </div>
        <Link href={`/s/${code}/benchmark/${id}`} className="btn btn-or btn-compact mm-knop">
          Bekijk vergelijking
        </Link>
      </div>
    </article>
  );
}
