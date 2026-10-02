// Eenmalig te draaien: maakt de tabel "scan_sloten" aan in Neon (het slot dat
// voorkomt dat twee personen tegelijk dezelfde scan invullen, zie
// app/api/slot/[scanId]/route.ts en lib/scan-slot.ts). Idempotent: opnieuw
// draaien doet niets als de tabel al bestaat.
//
// Gebruik:
//   node --env-file=.env.local scripts/maak-sloten-tabel.mjs

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL ontbreekt. Draai met: node --env-file=.env.local scripts/maak-sloten-tabel.mjs");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS scan_sloten (
    scan_id text PRIMARY KEY,
    houder text NOT NULL,
    verloopt_op timestamptz NOT NULL
  )
`;
console.log("✓ scan_sloten bestaat.");
