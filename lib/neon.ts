import "server-only";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Verbinding met de lokale, host-brede opslag (Fase 1 van de Postgres-
 * migratie, zie go-live-plan.md/changelog.md): vervangt de JSON-
 * bestanden onder `.data/` door een echte tabel in Neon, achter
 * `app/api/store/[key]/route.ts`. De vijf localStorage-stores
 * (`lib/db.ts` e.a.) en `lib/server-sync.ts` weten hier niets van —
 * voor hen verandert er niets.
 *
 * Zelfde "stil uitgeschakeld zonder configuratie"-patroon als
 * `lib/gmail.ts` (`isGeconfigureerd`): ontbreekt `DATABASE_URL`, dan
 * geeft `getSql()` `null` terug in plaats van te crashen — de route
 * valt dan terug op het bestaande "nog nooit opgeslagen"-gedrag. Dit
 * voorkomt dat een `npm run build`/`next dev` zonder database breekt,
 * wat belangrijk is omdat deze app tot nu toe prima zonder database
 * draaide (localStorage).
 *
 * `neon()` zelf is goedkoop (geen TCP-handshake, de HTTP-driver bouwt
 * de connectie per losse query op) — één module-brede singleton is dus
 * voldoende, geen pool nodig.
 *
 * Expliciet getypeerd als `NeonQueryFunction<false, false>` (de defaults
 * van `neon()` zonder opties): `ReturnType<typeof neon>` laat de generics
 * van de (overloaded) functie onopgelost naar hun constraint (`boolean`)
 * i.p.v. hun default (`false`), waardoor elke query terugkomt als de
 * brede unie `any[][] | Record<string, any>[] | FullQueryResults<boolean>`
 * in plaats van gewoon `Record<string, any>[]`.
 */
let client: NeonQueryFunction<false, false> | null = null;

export function getSql() {
  if (!process.env.DATABASE_URL) return null;
  if (!client) client = neon(process.env.DATABASE_URL);
  return client;
}
