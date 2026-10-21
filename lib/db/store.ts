import { useSyncExternalStore } from "react";
import { Organisatie } from "../types";
import { normaliseerEmail } from "../email";
import { demoOrganisatie } from "@/data/demo-organisatie";
import { haalServerKopieOp, stuurNaarServer } from "../server-sync";
import { migreerTechstackOndersteuning } from "@/lib/techstack";
import { ruimOrganisatieOp } from "@/lib/metingen";
import { zorgOnderdelenKloppend } from "@/lib/onderdelen";
import { migreerKpiWaarden } from "@/lib/kpi";
import { getBenchmarks, haalMetingenUitBenchmarks, legeToewijzingen, wisOmgezetteToewijzingen } from "@/lib/benchmark-store";
import { getBenchmarksMetLeden } from "@/lib/benchmark-leden";
import { ruimLeadToegangOp, toegangSleutel, zetLegacyBereikOm } from "@/lib/lead-toegang";
import { techstackCategorieIdsMetLijst } from "@/data/organisatie-velden";
import { migreerFteManagementSupport } from "@/lib/fte";
import { ruimDossierOp, zetNieuwsartikelenOm } from "@/lib/dossier";

const KEY = "coniche-scan:organisaties";
const SERVER_SLEUTEL = "organisaties";
const SERVER_SENTINEL = "__server__";

type Listener = () => void;
const listeners = new Set<Listener>();
function emitChange(): void {
  listeners.forEach((l) => l());
}
function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Leest de ruwe snapshot-string; zaait localStorage bij het eerste gebruik. Puur op basis
 * van deze string, zodat de hooks hieronder tijdens hydration exact hetzelfde opleveren als
 * de server (die altijd SERVER_SENTINEL ziet). */
function getSnapshot(): string {
  if (typeof window === "undefined") return SERVER_SENTINEL;
  const ruw = window.localStorage.getItem(KEY);
  if (ruw) return ruw;
  // Niet meteen naar de server pushen: zonder lokale data weet deze browser
  // nog niet of de server al écht andere data heeft (die dan ten onrechte
  // overschreven zou worden, vóórdat `haalServerKopieOp` hieronder haar
  // async ophaal-ronde heeft kunnen doen). Pas bij een eerste echte
  // schrijfactie (`slaAlles`) wordt dit zaad alsnog naar de server gestuurd.
  const seed = JSON.stringify([structuredClone(demoOrganisatie)]);
  window.localStorage.setItem(KEY, seed);
  return seed;
}
function getServerSnapshot(): string {
  return SERVER_SENTINEL;
}

// Bij het laden van de pagina: eenmalig de lokale, host-brede serverkopie
// ophalen zodat elke browser op dit apparaat met dezelfde data start
// (lib/server-sync.ts).
if (typeof window !== "undefined") {
  // Na het ophalen van de serverkopie loopt de overgang van de toewijzingen opnieuw: De organisaties kunnen nu pas bekend zijn.
  haalServerKopieOp(SERVER_SLEUTEL, KEY, () => {
    voerLeadOvergangUit();
    emitChange();
  });
  voerLeadOvergangUit();
}

/**
 * Vangt oudere of beschadigde localStorage-data op: elke plek in dit
 * bestand gaat ervan uit dat `leden`/`scanUitvoeringen`/`invullingen`
 * altijd arrays zijn (bijv. `organisatie.leden.find(...)`), zonder losse
 * undefined-checks per aanroep. Zonder deze normalisatie crasht de hele
 * app op een enkel organisatie-record dat niet meer helemaal klopt met
 * het huidige `Organisatie`-type (bijv. een browser met een oudere versie
 * van de opslag, of een handmatig bewerkte localStorage-waarde) — dat is
 * hier gemeld als "Cannot read properties of undefined (reading 'find')"
 * op `organisatie.leden`. Geen migratie van de inhoud, alleen de vorm.
 */
function normaliseerOrganisatie(invoer: Organisatie): Organisatie {
  // `rondes` bestaat niet meer (`datamodel.md`, Overgang van de rondes): Het veld valt hier weg uit de opgeslagen data.
  const ruw = { ...invoer } as Organisatie & { rondes?: unknown };
  delete ruw.rondes;
  const organisatie: Organisatie = {
    ...ruw,
    // Het oude veld zelf/extern wordt "Ondersteund door" bij de techstack-categorieën met een lijst (`lib/techstack.ts`).
    kenmerken: migreerFteManagementSupport(
      migreerTechstackOndersteuning(
        ruw.kenmerken && typeof ruw.kenmerken === "object" ? ruw.kenmerken : {},
        techstackCategorieIdsMetLijst
      )
    ),
    // `email` genormaliseerd (getrimd, lowercase) voor data van vóór die
    // regel bestond (datamodel.md, Respondent) — anders herkent
    // `nodigLidUit`/`voegLeadToe` een bestaand lid met afwijkende casing
    // niet en maakt een dubbele aan.
    leden: Array.isArray(ruw.leden)
      ? ruw.leden.map((l) => ({
          ...l,
          email: normaliseerEmail(l.email),
          // Het bereik van een Lead van vóór het Leads-venster: `zetLegacyBereikOm` hieronder zet het om en laat het vallen.
          ...(Array.isArray(l.leadMetingIds) ? { leadMetingIds: l.leadMetingIds } : {}),
          ...(l.leadVoorOrganisatie === true ? { leadVoorOrganisatie: true } : {}),
          lead: l.lead === true ? true : undefined,
        }))
      : [],
    scanUitvoeringen: Array.isArray(ruw.scanUitvoeringen)
      ? ruw.scanUitvoeringen.map((meting) => {
          // Overgang van de rondes (`datamodel.md`, Overgang van de rondes): De ronde bestaat niet meer. De Meting houdt haar
          // naam, onderdeel en samenstelling, de meetdatum blijft leeg tot een Admin of Consultant hem invult. Haar naam
          // volgt onderdeel en meetdatum pas als de gebruiker "Standaardnaam herstellen" kiest.
          const s = { ...meting } as typeof meting & { rondeId?: string };
          delete s.rondeId;
          return {
          ...s,
          labelHandmatig: s.labelHandmatig ?? s.meetdatum === undefined,
          invullingen: Array.isArray(s.invullingen)
            ? s.invullingen.map((i) => ({
                ...i,
                // De Meting waarin een scan staat is de juiste: Een verplaatsing werkte vroeger alleen `organisatieLidId` bij en liet
                // `scanUitvoeringId` naar de oude Meting wijzen (`backlog.md`, Omgehangen scans). Dit herstelt bestaande data
                // bij elke keer laden, zonder aparte migratiestap.
                scanUitvoeringId: s.id,
                bewaarVerlengdTot: i.bewaarVerlengdTot ?? null,
                // Ontbreekt bij data van vóór dit veld: Het uitnodigmoment is dan de beste schatting.
                aangemaaktOp: i.aangemaaktOp ?? i.uitgenodigdOp,
              }))
            : [],
          };
        })
      : [],
    // Ontbreekt bij data van vóór dit veld (localStorage uit een eerdere
    // sessie) — behandeld als "geen bekende aanmaker", zie Organisatie in
    // lib/types.ts: alleen voor Admin zichtbaar, nooit voor een Consultant.
    aangemaaktDoor: ruw.aangemaaktDoor ?? null,
    toegewezenAan: Array.isArray(ruw.toegewezenAan) ? ruw.toegewezenAan : [],
    // Ontbreekt bij data van vóór de benchmark: Geen toestemming vastgelegd, dus niet toegestaan.
    benchmarkToegestaan: ruw.benchmarkToegestaan === true,
    // Ontbreken bij data van vóór het Leads-venster: Niemand ziet iets, de namen staan uit en er is geen melding.
    leadToegang: Array.isArray(ruw.leadToegang) ? ruw.leadToegang : [],
    antwoordenMetNamen: ruw.antwoordenMetNamen === true,
    leadOvergangMelding: ruw.leadOvergangMelding ?? null,
    // Ontbreekt bij data van vóór de contactpersonen: Dan zijn er geen.
    contactpersonen: Array.isArray(ruw.contactpersonen) ? ruw.contactpersonen : [],
    // De nieuwsartikelen van vóór het Dossier worden Dossieritems, zonder dat er iets open of zichtbaar voor een Lead is (`dossier.md`, Overgang).
    dossier: zetNieuwsartikelenOm(ruw as unknown as Record<string, unknown>),
    // Ontbreekt bij data van vóór de Afspraak: Geen toestemming vastgelegd, dus niet toegestaan.
    caseToegestaan: ruw.caseToegestaan === true,
  };
  delete (organisatie as { nieuwsartikelen?: unknown }).nieuwsartikelen;
  zetLegacyBereikOm(organisatie);
  // Overgang van de tekst op de Meting naar Onderdelen (`datamodel.md`, Onderdeel): Idempotent, en stabiel tot het is opgeslagen.
  zorgOnderdelenKloppend(organisatie);
  // De KPI's en de contacten per kanaal zijn geen organisatievelden meer maar KPI-waarden (`datamodel.md`, KPI's en kanalen, Overgang).
  organisatie.kpiWaarden = Array.isArray(ruw.kpiWaarden) ? ruw.kpiWaarden : [];
  migreerKpiWaarden(organisatie);
  ruimLeadToegangOp(organisatie);
  return organisatie;
}

function parseSnapshot(snapshot: string): Organisatie[] {
  if (snapshot === SERVER_SENTINEL) return [];
  try {
    const alles = JSON.parse(snapshot) as Organisatie[];
    if (!Array.isArray(alles)) return [];
    return alles.map(normaliseerOrganisatie);
  } catch {
    return [];
  }
}

export function laadAlles(): Organisatie[] {
  return parseSnapshot(getSnapshot());
}

export function slaAlles(alles: Organisatie[]): void {
  if (typeof window === "undefined") return;
  // Houdt samenstellingen kloppend na elke wijziging: Een samengestelde Meting zonder
  // onderliggende Metingen verdwijnt vanzelf (`datamodel.md`, Samengestelde Meting). Eén plek, zodat geen schrijfactie het vergeet.
  const verdwenen: { metingId: string; organisatieNaam: string }[] = [];
  for (const organisatie of alles) {
    // Een Meting met een naam die nog geen Onderdeel is, maakt er een aan, en een hernoeming werkt de Metingen bij.
    zorgOnderdelenKloppend(organisatie);
    const r = ruimOrganisatieOp(organisatie);
    for (const id of r.verwijderdeSamengesteldeIds) verdwenen.push({ metingId: id, organisatieNaam: organisatie.naam });
  }
  if (verdwenen.length > 0) haalMetingenUitBenchmarks(verdwenen);
  // De vinkjes van Leads kloppend houden: Een benchmark die er niet meer is of waar de organisatie geen lid meer van is, en
  // alles wat van een verdwenen Meting of Lead was (`datamodel.md`, Verwijderen en datakoppelingen).
  // Bij een opgeslagen verkenning volgen de leden uit de filters: Voldoet een organisatie niet meer, dan vervalt het vinkje van haar Leads.
  const benchmarks = getBenchmarksMetLeden(alles);
  for (const organisatie of alles) ruimLeadToegangOp(organisatie, benchmarks);
  // Een Case bij een andere Organisatie die naar een verwijderde Organisatie verwees, vraagt om een nieuwe keuze (`dossier.md`, Verwijderen en datakoppelingen).
  ruimDossierOp(alles);
  const json = JSON.stringify(alles);
  window.localStorage.setItem(KEY, json);
  emitChange();
  stuurNaarServer(SERVER_SLEUTEL, json);
}

export function useOrganisaties(): Organisatie[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return parseSnapshot(snapshot);
}

/**
 * De overgang van het toewijzen van benchmarkviews naar vinkjes in het Leads-venster (`beheerpagina.md`, punt 6a, Overgang): Een
 * `BenchmarkToewijzing` op niveau 1 of 2 wordt het vinkje voor die benchmark, een toewijzing op niveau 3 wordt Spreiding voor
 * die Meting, zonder ring op de scan, met een melding aan de Admin. Wat is omgezet, wordt gewist. Een toewijzing van een Lead
 * die (nog) niet bekend is, blijft staan tot de organisaties er zijn. Idempotent.
 */
export function voerLeadOvergangUit(): void {
  if (typeof window === "undefined") return;
  const oud = legeToewijzingen();
  if (oud.length === 0) return;
  const alles = laadAlles();
  if (alles.length === 0) return;
  const benchmarks = getBenchmarks();
  const nu = new Date().toISOString();
  const omgezet: string[] = [];
  for (const t of oud) {
    const organisatie = alles.find((o) => o.leden.some((l) => l.id === t.respondentId));
    const lid = organisatie?.leden.find((l) => l.id === t.respondentId);
    if (!organisatie || !lid) continue;
    lid.lead = true;
    const benchmark = benchmarks.find((b) => b.id === t.benchmarkId);
    const niveau = benchmark?.niveau ?? "organisaties";
    const toegang =
      niveau === "scans" && t.metingId
        ? { respondentId: lid.id, weergave: "spreiding" as const, metingId: t.metingId }
        : benchmark
          ? { respondentId: lid.id, weergave: "benchmark" as const, benchmarkId: t.benchmarkId }
          : null;
    if (toegang) {
      const bestaand = new Set((organisatie.leadToegang ?? []).map(toegangSleutel));
      if (!bestaand.has(toegangSleutel(toegang))) {
        organisatie.leadToegang = [...(organisatie.leadToegang ?? []), { ...toegang, toegekendDoor: t.toegewezenDoor || "systeem", toegekendOp: nu }];
      }
    }
    if (niveau === "scans") {
      const tekst =
        "Een view op één scan is omgezet in Spreiding voor die Meting, zonder ring op de scan. Controleer het Leads-venster.";
      if (!organisatie.leadOvergangMelding?.includes(tekst)) {
        organisatie.leadOvergangMelding = organisatie.leadOvergangMelding ? `${organisatie.leadOvergangMelding} ${tekst}` : tekst;
      }
    }
    omgezet.push(t.id);
  }
  if (omgezet.length === 0) return;
  slaAlles(alles);
  wisOmgezetteToewijzingen(omgezet);
}
