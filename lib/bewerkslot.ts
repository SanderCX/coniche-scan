import { useCallback, useEffect, useState } from "react";
import { useIngelogdeGebruiker } from "./admin-auth";

/**
 * Bewerkslot (`datamodel.md`, Bewerkslot; CLAUDE.md, Uitgangspunten): Wie een
 * scan, Respondent of Organisatie als eerste opent om te bewerken, houdt hem
 * vast zolang de pagina openstaat. Een tweede persoon ziet een melding in
 * plaats van het record, zodat twee mensen niet door elkaar heen dezelfde
 * gegevens overschrijven. De melding verdwijnt en het record opent zodra het
 * slot vrij is.
 *
 * De server (`app/api/slot/[type]/[id]/route.ts`) beslist, zodat het ook werkt
 * tussen verschillende browsers en apparaten. Zonder database (of zonder
 * bereikbare server) valt dit terug op een slot in `localStorage`, dat alleen
 * tabbladen in dezelfde browser beschermt.
 *
 * Een "houder" is een willekeurige id per browsertabblad (`sessionStorage`,
 * overleeft een herlaadbeurt), dus één persoon in twee tabbladen wordt ook als
 * twee gelijktijdige bewerkers gezien. In beheer staat in de melding wie het
 * slot heeft; aan de respondentkant staat er geen naam in.
 */
export type SlotType = "scan" | "respondent" | "organisatie";

const HARTSLAG_MS = 15_000;
/** Zolang het slot bezet is, kijkt de pagina vaker of het vrij is gekomen. */
const WACHT_HERHAAL_MS = 5_000;
const LOKAAL_TTL_MS = 90_000;
const TAB_ID_SLEUTEL = "coniche-scan:tab-id";
const LOKAAL_SLEUTEL = "coniche-scan:bewerk-sloten";

type LokaleSloten = Record<string, { houder: string; naam: string | null; tot: number }>;

function tabId(): string {
  let id = window.sessionStorage.getItem(TAB_ID_SLEUTEL);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(TAB_ID_SLEUTEL, id);
  }
  return id;
}

const sleutelVan = (type: SlotType, id: string) => `${type}:${id}`;

function leesLokaal(): LokaleSloten {
  try {
    return JSON.parse(window.localStorage.getItem(LOKAAL_SLEUTEL) ?? "{}") as LokaleSloten;
  } catch {
    return {};
  }
}

interface ClaimUitkomst {
  ok: boolean;
  /** Naam van de houder, alleen gevuld als dit een beheerder is die erom vroeg. */
  houderNaam: string | null;
}

function lokaalClaim(type: SlotType, id: string, houder: string, naam: string | null, toonNaam: boolean): ClaimUitkomst {
  const nu = Date.now();
  const sloten = leesLokaal();
  for (const [sleutel, slot] of Object.entries(sloten)) if (slot.tot <= nu) delete sloten[sleutel];
  const sleutel = sleutelVan(type, id);
  const huidig = sloten[sleutel];
  if (huidig && huidig.houder !== houder) {
    window.localStorage.setItem(LOKAAL_SLEUTEL, JSON.stringify(sloten));
    return { ok: false, houderNaam: toonNaam ? huidig.naam : null };
  }
  sloten[sleutel] = { houder, naam, tot: nu + LOKAAL_TTL_MS };
  window.localStorage.setItem(LOKAAL_SLEUTEL, JSON.stringify(sloten));
  return { ok: true, houderNaam: null };
}

function lokaalVrijgeven(type: SlotType, id: string, houder: string): void {
  const sloten = leesLokaal();
  const sleutel = sleutelVan(type, id);
  if (sloten[sleutel]?.houder === houder) {
    delete sloten[sleutel];
    window.localStorage.setItem(LOKAAL_SLEUTEL, JSON.stringify(sloten));
  }
}

const slotUrl = (type: SlotType, id: string) => `/api/slot/${type}/${encodeURIComponent(id)}`;

async function claimSlot(type: SlotType, id: string, naam: string | null, toonNaam: boolean): Promise<ClaimUitkomst> {
  const houder = tabId();
  try {
    const response = await fetch(slotUrl(type, id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actie: "claim", houder, houderNaam: naam, toonNaam }),
    });
    if (response.status === 200) return { ok: true, houderNaam: null };
    if (response.status === 409) {
      const antwoord = (await response.json().catch(() => null)) as { houderNaam?: string | null } | null;
      return { ok: false, houderNaam: antwoord?.houderNaam ?? null };
    }
  } catch {
    // Server onbereikbaar: terugval op het lokale slot hieronder.
  }
  return lokaalClaim(type, id, houder, naam, toonNaam);
}

function geefSlotVrij(type: SlotType, id: string): void {
  const houder = tabId();
  lokaalVrijgeven(type, id, houder);
  const body = JSON.stringify({ actie: "vrijgeven", houder });
  // `sendBeacon` overleeft het sluiten van het tabblad, een gewone fetch niet altijd.
  if (navigator.sendBeacon?.(slotUrl(type, id), new Blob([body], { type: "application/json" }))) return;
  fetch(slotUrl(type, id), { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(
    () => {}
  );
}

/**
 * Aantal pagina's in dit tabblad dat nu een slot op dit record wil houden.
 * Van intake naar vragenlijst wisselen sluit de ene pagina en opent de andere
 * vlak na elkaar: Direct vrijgeven zou dan het zojuist geclaimde slot weer
 * wissen (zelfde houder), dus vrijgeven wacht even en kijkt of een volgende
 * pagina het al heeft overgenomen ("een overgang naar een volgende pagina in
 * hetzelfde tabblad behoudt het slot").
 */
const actieveMounts = new Map<string, number>();
const VRIJGEVEN_VERTRAGING_MS = 400;

export type SlotStatus = "controleren" | "eigen" | "bezet";

/**
 * Claimt het slot op dit record zolang de pagina openstaat (hartslag elke 15
 * seconden) en geeft het vrij bij het verlaten. `id` = `null` claimt niets (het
 * record is nog niet geladen of bestaat niet). `houderNaam` is de naam van de
 * huidige houder en alleen gevuld voor een ingelogde beheerder.
 * `opnieuw` probeert direct nog een keer, voor wie de melding "bezet" ziet.
 */
export function useBewerkslot(
  type: SlotType,
  id: string | null
): { status: SlotStatus; houderNaam: string | null; opnieuw: () => void } {
  const [status, setStatus] = useState<SlotStatus>("controleren");
  const [houderNaam, setHouderNaam] = useState<string | null>(null);
  // Alleen in beheer (ingelogde Gebruiker): De naam hoort bij het slot en mag in de melding.
  const gebruiker = useIngelogdeGebruiker();
  const naam = gebruiker?.naam ?? null;
  const toonNaam = gebruiker !== null;

  const controleer = useCallback(
    () =>
      id
        ? claimSlot(type, id, naam, toonNaam).then((uitkomst) => {
            setStatus(uitkomst.ok ? "eigen" : "bezet");
            setHouderNaam(uitkomst.ok ? null : uitkomst.houderNaam);
            return uitkomst.ok;
          })
        : Promise.resolve(false),
    [type, id, naam, toonNaam]
  );

  useEffect(() => {
    if (!id) return;
    const sleutel = sleutelVan(type, id);
    let actief = true;
    actieveMounts.set(sleutel, (actieveMounts.get(sleutel) ?? 0) + 1);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const volgende = (ok: boolean) => {
      if (!actief) return;
      timer = setTimeout(() => controleer().then(volgende), ok ? HARTSLAG_MS : WACHT_HERHAAL_MS);
    };
    controleer().then(volgende);
    const bijVerlaten = () => geefSlotVrij(type, id);
    window.addEventListener("pagehide", bijVerlaten);
    return () => {
      actief = false;
      clearTimeout(timer);
      window.removeEventListener("pagehide", bijVerlaten);
      const resterend = (actieveMounts.get(sleutel) ?? 1) - 1;
      if (resterend > 0) actieveMounts.set(sleutel, resterend);
      else actieveMounts.delete(sleutel);
      setTimeout(() => {
        if (!actieveMounts.has(sleutel)) geefSlotVrij(type, id);
      }, VRIJGEVEN_VERTRAGING_MS);
    };
  }, [type, id, controleer]);

  return { status, houderNaam, opnieuw: () => void controleer() };
}
