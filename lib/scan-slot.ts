import { useCallback, useEffect, useState } from "react";

/**
 * Scanslot (CLAUDE.md, scherm 5, "Gelijktijdig invullen"): Wie een scan als
 * eerste opent, houdt hem vast zolang de pagina openstaat. Een tweede
 * persoon met dezelfde link ziet een melding in plaats van de vragenlijst,
 * zodat twee mensen niet door elkaar heen dezelfde antwoorden overschrijven.
 *
 * De server (`app/api/slot/[scanId]/route.ts`) beslist, zodat het ook werkt
 * tussen verschillende browsers en apparaten. Zonder database (of zonder
 * bereikbare server) valt dit terug op een slot in `localStorage`, dat
 * alleen tabbladen in dezelfde browser tegen elkaar beschermt.
 *
 * Een "houder" is een willekeurige id per browsertabblad (`sessionStorage`,
 * overleeft een herlaadbeurt), dus één persoon in twee tabbladen wordt ook
 * als twee gelijktijdige bewerkers gezien.
 */
const HARTSLAG_MS = 15_000;
const LOKAAL_TTL_MS = 90_000;
const TAB_ID_SLEUTEL = "coniche-scan:tab-id";
const LOKAAL_SLEUTEL = "coniche-scan:scan-sloten";

type LokaleSloten = Record<string, { houder: string; tot: number }>;

function tabId(): string {
  let id = window.sessionStorage.getItem(TAB_ID_SLEUTEL);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(TAB_ID_SLEUTEL, id);
  }
  return id;
}

function leesLokaal(): LokaleSloten {
  try {
    return JSON.parse(window.localStorage.getItem(LOKAAL_SLEUTEL) ?? "{}") as LokaleSloten;
  } catch {
    return {};
  }
}

function lokaalClaim(scanId: string, houder: string): boolean {
  const nu = Date.now();
  const sloten = leesLokaal();
  for (const [id, slot] of Object.entries(sloten)) if (slot.tot <= nu) delete sloten[id];
  const huidig = sloten[scanId];
  if (huidig && huidig.houder !== houder) {
    window.localStorage.setItem(LOKAAL_SLEUTEL, JSON.stringify(sloten));
    return false;
  }
  sloten[scanId] = { houder, tot: nu + LOKAAL_TTL_MS };
  window.localStorage.setItem(LOKAAL_SLEUTEL, JSON.stringify(sloten));
  return true;
}

function lokaalVrijgeven(scanId: string, houder: string): void {
  const sloten = leesLokaal();
  if (sloten[scanId]?.houder === houder) {
    delete sloten[scanId];
    window.localStorage.setItem(LOKAAL_SLEUTEL, JSON.stringify(sloten));
  }
}

const slotUrl = (scanId: string) => `/api/slot/${encodeURIComponent(scanId)}`;

/** `true` = dit tabblad heeft het slot (nu of al eerder), `false` = een ander heeft het. */
async function claimSlot(scanId: string): Promise<boolean> {
  const houder = tabId();
  try {
    const response = await fetch(slotUrl(scanId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actie: "claim", houder }),
    });
    if (response.status === 200) return true;
    if (response.status === 409) return false;
  } catch {
    // Server onbereikbaar: terugval op het lokale slot hieronder.
  }
  return lokaalClaim(scanId, houder);
}

function geefSlotVrij(scanId: string): void {
  const houder = tabId();
  lokaalVrijgeven(scanId, houder);
  const body = JSON.stringify({ actie: "vrijgeven", houder });
  // `sendBeacon` overleeft het sluiten van het tabblad, een gewone fetch niet altijd.
  if (navigator.sendBeacon?.(slotUrl(scanId), new Blob([body], { type: "application/json" }))) return;
  fetch(slotUrl(scanId), { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(
    () => {}
  );
}

/**
 * Aantal pagina's in dit tabblad dat nu een slot op deze scan wil houden.
 * Van intake naar vragenlijst wisselen sluit de ene pagina en opent de
 * andere vlak na elkaar: Direct vrijgeven zou dan het zojuist geclaimde slot
 * weer wissen (zelfde houder), dus vrijgeven wacht even en kijkt of een
 * volgende pagina het al heeft overgenomen.
 */
const actieveMounts = new Map<string, number>();
const VRIJGEVEN_VERTRAGING_MS = 400;

export type SlotStatus = "controleren" | "eigen" | "bezet";

/**
 * Claimt het slot op deze scan zolang de pagina openstaat (hartslag elke
 * 15 seconden) en geeft het vrij bij het verlaten. `scanId` = `null`
 * claimt niets (de scan is nog niet geladen of bestaat niet).
 * `opnieuw` probeert direct nog een keer, voor wie de melding "bezet" ziet.
 */
export function useScanSlot(scanId: string | null): { status: SlotStatus; opnieuw: () => void } {
  const [status, setStatus] = useState<SlotStatus>("controleren");

  const opnieuw = useCallback(() => {
    if (!scanId) return;
    claimSlot(scanId).then((ok) => setStatus(ok ? "eigen" : "bezet"));
  }, [scanId]);

  useEffect(() => {
    if (!scanId) return;
    let actief = true;
    actieveMounts.set(scanId, (actieveMounts.get(scanId) ?? 0) + 1);
    const controleer = () =>
      claimSlot(scanId).then((ok) => {
        if (actief) setStatus(ok ? "eigen" : "bezet");
      });
    controleer();
    const timer = setInterval(controleer, HARTSLAG_MS);
    const bijVerlaten = () => geefSlotVrij(scanId);
    window.addEventListener("pagehide", bijVerlaten);
    return () => {
      actief = false;
      clearInterval(timer);
      window.removeEventListener("pagehide", bijVerlaten);
      const resterend = (actieveMounts.get(scanId) ?? 1) - 1;
      if (resterend > 0) actieveMounts.set(scanId, resterend);
      else actieveMounts.delete(scanId);
      setTimeout(() => {
        if (!actieveMounts.has(scanId)) geefSlotVrij(scanId);
      }, VRIJGEVEN_VERTRAGING_MS);
    };
  }, [scanId]);

  return { status, opnieuw };
}
