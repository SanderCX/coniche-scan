// Eenmalig te draaien: zet de huidige Assessment-content (`data/assessments.ts`,
// dezelfde bron die `lib/assessment-store.ts` gebruikt om localStorage te
// zaaien op een leeg apparaat) over naar Neon onder sleutel "assessments".
//
// Nodig omdat deze sleutel nooit via het oude .data/-bestand liep (zie
// scripts/migreer-data-naar-neon.mjs, die hem altijd oversloeg) en dus nooit
// eerder in de database stond: elke browser zaaide bij de eerste keer laden
// zijn eigen lokale kopie, en bleef daarna voor altijd bij die kopie hangen —
// ook nadat de content in de codebase is uitgebreid (bijv. de AI-scan en de
// Zorgscan, die in een al langer bestaande browser nooit meer verschenen).
// Door de content hier naar Neon te pushen, haalt elke browser bij de
// eerstvolgende laadbeurt automatisch de actuele versie op en overschrijft
// daarmee zijn verouderde lokale kopie (lib/server-sync.ts, `haalServerKopieOp`).
//
// LET OP: Dit overschrijft in Neon alles wat daar onder "assessments" stond.
// Is er via het contentbeheerscherm al handmatig iets gewijzigd ná de
// Neon-migratie, dan staat die wijziging al (via `stuurNaarServer`) in Neon
// en overschrijf je die hiermee met de kale codebase-versie. Bewust geen
// onderdeel van `npm run dev`/`build` — alleen handmatig draaien.
//
// Gebruik:
//   npx tsx --env-file=.env.local scripts/push-assessments-naar-neon.ts

import { neon } from "@neondatabase/serverless";
import { assessments } from "../data/assessments";

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL ontbreekt. Draai met: npx tsx --env-file=.env.local scripts/push-assessments-naar-neon.ts"
  );
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const json = JSON.stringify(assessments);

async function main() {
  await sql`
    INSERT INTO app_data (key, data, updated_at)
    VALUES ('assessments', ${json}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;

  console.log(
    `✓ assessments: ${assessments.length} Assessment-types overgezet naar Neon (${assessments
      .map((a) => a.naam)
      .join(", ")}).`
  );
}

main();
