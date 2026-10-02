import { getSql } from "@/lib/neon";

/**
 * Lokale, host-brede opslag (Fase 1 van de Postgres-migratie,
 * `changelog.md`): niet het volledige relationele schema uit
 * `datamodel.md` — nog altijd één JSON-blob per sleutel, alleen de
 * opslag zelf verhuisde van een bestand onder `.data/` naar een rij in
 * Neon (`app_data`, kolommen `key`/`data jsonb`/`created_at`/
 * `updated_at`). Elke store (`lib/db.ts` e.a.) blijft zelf
 * verantwoordelijk voor de vorm van zijn data — deze route valideert of
 * parset de inhoud niet, behalve de `::jsonb`-cast die Postgres zelf
 * afdwingt.
 *
 * Zonder `DATABASE_URL` (`lib/neon.ts`, `getSql()` geeft dan `null`
 * terug) gedraagt deze route zich als "nog nooit opgeslagen" i.p.v. te
 * crashen — dezelfde aanroepers (`lib/server-sync.ts`) werkten immers al
 * prima toen er nog helemaal geen opslag achter deze route zat.
 *
 * Bewust geen auth, geen gelijktijdigheidscontrole, geen multi-user-
 * garanties: Dit is bedoeld voor één persoon die op één apparaat tussen
 * meerdere browsers wisselt tijdens lokale ontwikkeling, niet voor een
 * gedeelde, publieke omgeving. "Laatste schrijver wint" is voor dat doel
 * voldoende — hetzelfde uitgangspunt als vóór deze migratie.
 */
const TOEGESTANE_SLEUTELS = new Set([
  "organisaties",
  "assessments",
  "gebruikers",
  "instellingen",
  "algemene-teksten",
]);

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!TOEGESTANE_SLEUTELS.has(key)) {
    return new Response("Onbekende sleutel.", { status: 400 });
  }
  const sql = getSql();
  if (!sql) {
    // Geen DATABASE_URL: zelfde respons als "nog nooit opgeslagen".
    return new Response(null, { status: 204 });
  }
  try {
    const rows = await sql`SELECT data FROM app_data WHERE key = ${key}`;
    if (rows.length === 0) {
      // Nog nooit opgeslagen vanaf dit apparaat — geen fout, de
      // aanroeper valt dan terug op zijn eigen (lokale of net-geseede)
      // data.
      return new Response(null, { status: 204 });
    }
    const data = rows[0].data;
    const json = typeof data === "string" ? data : JSON.stringify(data);
    return new Response(json, { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    // Een échte storing (database onbereikbaar, verkeerde
    // DATABASE_URL): bewust 503, niet 204 — zichtbaar in serverlogs i.p.v.
    // onopvallend "nog niets". `lib/server-sync.ts` behandelt elke
    // non-200 vandaag nog hetzelfde (niets ophalen, lokaal blijft
    // leidend), maar de server-kant maakt het verschil nu wél zichtbaar.
    console.error(`[store] GET ${key} mislukt:`, error);
    return new Response("Database onbereikbaar.", { status: 503 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!TOEGESTANE_SLEUTELS.has(key)) {
    return new Response("Onbekende sleutel.", { status: 400 });
  }
  const tekst = await request.text();
  if (!tekst) {
    return new Response("Lege body.", { status: 400 });
  }
  const sql = getSql();
  if (!sql) {
    return new Response("Database niet geconfigureerd.", { status: 503 });
  }
  try {
    // `tekst` is al een geldige JSON-string (dezelfde die de store ook
    // in localStorage zet); de `::jsonb`-cast laat Postgres zelf
    // valideren/opslaan, geen aparte JSON.parse/stringify-stap nodig.
    await sql`
      INSERT INTO app_data (key, data, updated_at)
      VALUES (${key}, ${tekst}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `;
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`[store] PUT ${key} mislukt:`, error);
    return new Response("Database onbereikbaar.", { status: 503 });
  }
}
