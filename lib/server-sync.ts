/**
 * Bridge tussen elke losse `localStorage`-store (`lib/db.ts`,
 * `lib/assessment-store.ts`,
 * `lib/instellingen-store.ts`, `lib/algemene-teksten-store.ts`) en de
 * lokale, host-brede opslag (`app/api/store/[key]/route.ts`) — zodat
 * elke browser op hetzelfde apparaat met dezelfde data start, i.p.v. elk
 * zijn eigen, geïsoleerde `localStorage` (CLAUDE.md, Status).
 *
 * Elke store blijft voor zichzelf de bron van waarheid via
 * `localStorage` (ongewijzigd, inclusief `useSyncExternalStore`);
 * deze twee functies komen er puur bovenop:
 * - `haalServerKopieOp`: bij het laden van de pagina, één keer per
 *   sleutel, de serverkopie ophalen en de lokale `localStorage`-waarde
 *   ermee overschrijven als ze verschilt (`emitChange` laat de
 *   React-hooks dan opnieuw renderen met de nieuwe data).
 * - `stuurNaarServer`: na elke schrijfactie (fire-and-forget) de nieuwe
 *   staat naar de server sturen, zodat een andere browser 'm bij zijn
 *   volgende laadbeurt ziet.
 *
 * Geen server bereikbaar (bijv. een productie-build zonder deze route,
 * of de dev-server even niet actief): beide functies falen stil, en
 * `localStorage` blijft gewoon de enige bron, precies zoals voorheen.
 * Bewust "laatste schrijver wint", geen samenvoegen van wijzigingen: Dit
 * is bedoeld voor één persoon op één apparaat, niet gelijktijdig gebruik
 * door meerdere mensen.
 */

const opgehaald = new Set<string>();

export function haalServerKopieOp(sleutel: string, localStorageKey: string, emitChange: () => void): void {
  if (typeof window === "undefined") return;
  if (opgehaald.has(sleutel)) return;
  opgehaald.add(sleutel);
  fetch(`/api/store/${sleutel}`)
    .then((response) => (response.status === 200 ? response.text() : null))
    .then((serverJson) => {
      if (!serverJson) return;
      const huidig = window.localStorage.getItem(localStorageKey);
      if (serverJson === huidig) return;
      window.localStorage.setItem(localStorageKey, serverJson);
      emitChange();
    })
    .catch(() => {
      // Server niet bereikbaar: localStorage blijft de enige bron.
    });
}

export function stuurNaarServer(sleutel: string, json: string): void {
  if (typeof window === "undefined") return;
  fetch(`/api/store/${sleutel}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: json,
  }).catch(() => {
    // Server niet bereikbaar: deze browser blijft lokaal werken, een
    // volgende succesvolle schrijfactie haalt de synchronisatie in.
  });
}
