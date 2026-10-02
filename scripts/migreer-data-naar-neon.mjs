// Eenmalig te draaien: zet de inhoud van elk bestaand .data/<sleutel>.json
// (de lokale JSON-bestand-opslag van vóór de Neon-migratie, zie
// app/api/store/[key]/route.ts) over naar de "app_data"-tabel in Neon.
// Idempotent (veilig opnieuw te draaien — laatste run wint) en verwijdert
// de .data-bestanden niet: die blijven de terugval-optie zolang
// DATABASE_URL ontbreekt.
//
// Vereist dat de tabel al bestaat (eenmalig aan te maken in Neons eigen
// SQL-editor):
//
//   CREATE TABLE app_data (
//     key text PRIMARY KEY CHECK (key IN ('organisaties', 'assessments', 'gebruikers', 'instellingen', 'algemene-teksten')),
//     data jsonb NOT NULL,
//     created_at timestamptz NOT NULL DEFAULT now(),
//     updated_at timestamptz NOT NULL DEFAULT now()
//   );
//
// Gebruik:
//   node --env-file=.env.local scripts/migreer-data-naar-neon.mjs

import { readFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const SLEUTELS = ["organisaties", "assessments", "instellingen", "algemene-teksten"];

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL ontbreekt. Draai dit script met: node --env-file=.env.local scripts/migreer-data-naar-neon.mjs"
  );
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

for (const sleutel of SLEUTELS) {
  const bestandsPad = path.join(process.cwd(), ".data", `${sleutel}.json`);
  let tekst;
  try {
    tekst = await readFile(bestandsPad, "utf-8");
  } catch {
    console.log(`– ${sleutel}: geen .data/${sleutel}.json gevonden, overgeslagen.`);
    continue;
  }
  await sql`
    INSERT INTO app_data (key, data, updated_at)
    VALUES (${sleutel}, ${tekst}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;
  console.log(`✓ ${sleutel}: overgezet naar Neon.`);
}

console.log("\nKlaar. Controleer in Neon's SQL-editor met:");
console.log("  SELECT key, updated_at, jsonb_pretty(data) FROM app_data;");
