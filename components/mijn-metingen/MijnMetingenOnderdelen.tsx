"use client";

import { useState } from "react";
import Link from "next/link";
import { AssessmentIcon } from "@/components/icons/AssessmentIcons";
import { nodigLidUit } from "@/lib/db";
import { voortgang } from "@/lib/scoring";
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

/** Een balk van 8px met een tekstalternatief ("23 van 60 vragen beantwoord"). */
function Balk({ fractie, label, warm = false }: { fractie: number; label: string; warm?: boolean }) {
  return (
    <div className={`mm-balk ${warm ? "mm-balk--warm" : ""}`} role="img" aria-label={label}>
      <div style={{ width: `${Math.round(Math.min(1, Math.max(0, fractie)) * 100)}%` }} />
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
        <div className="mm-teaser-rijen">
          {teaser.rijen.map((r) => (
            <div key={r.sleutel} className="mm-teaser-rij">
              <span className="mm-teaser-naam">{r.naam}</span>
              <span className="mm-teaser-balk" aria-hidden="true">
                <i style={{ width: `${Math.round(r.fractie * 100)}%`, background: r.kleur }} />
              </span>
              <span className="mm-teaser-waarde">{r.waarde}</span>
            </div>
          ))}
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
  return (
    <article className={`mm-kaart ${invulling.status === "afgerond" ? "mm-kaart--vol" : ""}`}>
      <KaartKop
        assessment={assessment}
        titel={assessment?.naam ?? "Onbekend type"}
        sub={metingSub(scanUitvoering, invulling.status === "afgerond" ? invulling.afgerondOp : null)}
        rechts={<Chip klasse={chip.klasse}>{chip.tekst}</Chip>}
      />
      <EigenScanInhoud assessment={assessment} invulling={invulling} />
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

/** Het blok "Hele meting": Teaser (of de reden dat die er nog niet is), respons en de knoppen die aan staan. */
function HeleMeting({
  code,
  assessment,
  scanUitvoering,
  organisatie,
  lid,
  minRespondenten,
  hoofdLabel,
  teaserLabel,
}: LeadInvoer & { hoofdLabel: string; teaserLabel: string }) {
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
  const paar = toonResultaten && toonUitnodigen;

  return (
    <>
      {aan("resultaten") &&
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
      {!samengesteld && <ResponsBlok respons={respons} warm />}
      {samengesteld && <p className="mm-sub">Gemiddelde van de onderliggende Metingen, {afgerond} afgeronde scans.</p>}
      <div className={`mm-knoppen ${paar ? "mm-knoppen--paar" : ""}`}>
        {toonResultaten && (
          <Link href={basis} className="btn btn-or btn-compact mm-knop">
            {hoofdLabel}
          </Link>
        )}
        {toonUitnodigen && (
          <button
            type="button"
            className={`btn btn-compact mm-knop ${toonResultaten ? "btn-outline" : "btn-or"}`}
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
  return (
    <article className="mm-kaart">
      <KaartKop
        assessment={assessment}
        titel={assessment?.naam ?? "Onbekend type"}
        sub={metingSub(scanUitvoering)}
        rechts={
          <>
            <span className="mm-rolchip">Lead</span>
            <StandChip scanUitvoering={scanUitvoering} />
          </>
        }
      />
      <HeleMeting {...invoer} hoofdLabel="Resultaten" teaserLabel="Hele meting" />
    </article>
  );
}

/** Eén kaart met twee blokken: Jouw scan en Hele meting (`visualisatie-mijn-metingen.md`, Kaart: Lead en respondent). */
export function LeadEnRespondentKaart({ invulling, ...invoer }: LeadInvoer & { invulling: ScanInvulling }) {
  const { assessment, scanUitvoering } = invoer;
  const chip = STATUS_CHIP[invulling.status];
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
