// Maakt de tabel "bewerk_sloten" aan in Neon (het Bewerkslot dat voorkomt dat twee
// personen tegelijk dezelfde scan, Respondent of Organisatie bewerken, zie
// app/api/slot/[type]/[id]/route.ts en lib/bewerkslot.ts). De route maakt de tabel
// ook zelf aan bij het eerste gebruik; dit script is voor wie dat vooraf wil doen.
// Idempotent: opnieuw draaien doet niets als de tabel al bestaat.
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
  CREATE TABLE IF NOT EXISTS bewerk_sloten (
    entiteit_type text NOT NULL,
    entiteit_id text NOT NULL,
    houder text NOT NULL,
    houder_naam text,
    hartslag_op timestamptz NOT NULL,
    PRIMARY KEY (entiteit_type, entiteit_id)
  )
`;
console.log("✓ bewerk_sloten bestaat.");
