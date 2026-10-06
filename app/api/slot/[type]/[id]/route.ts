import { getSql } from "@/lib/neon";

/**
 * Bewerkslot (`datamodel.md`, Bewerkslot): Eén persoon tegelijk per record dat
 * bewerkt wordt. Geldt voor een ingevulde scan (invullen), een Respondent en een
 * Organisatie. De eerste die een record opent, houdt het slot zolang zijn pagina
 * openstaat: Die stuurt elke 15 seconden een "claim" (hartslag) en geeft het slot
 * vrij bij het verlaten. Een tweede persoon krijgt `409` en een melding. Zonder
 * hartslag komt het slot na `TTL_SECONDEN` vanzelf vrij, zodat een record nooit
 * blijvend geblokkeerd raakt.
 *
 * Eén atomaire SQL-instructie (`INSERT … ON CONFLICT DO UPDATE … WHERE`), geen
 * lees-dan-schrijf: Twee gelijktijdige claims kunnen het slot nooit allebei
 * krijgen. `houder` is een willekeurige id per browsertabblad
 * (`lib/bewerkslot.ts`), geen persoonsgegeven. De naam van de houder wordt alleen
 * teruggegeven aan een beheerder (`toonNaam`), nooit aan de respondentkant.
 * Zonder database (`503`) valt de client terug op een slot in localStorage.
 *
 * Bewust geen auth, net als `app/api/store/[key]/route.ts`: Zie de
 * beveiligingspunten in `backlog.md` (fase 3). `toonNaam` is dus een afspraak
 * met de eigen client en geen beveiliging.
 */
const TTL_SECONDEN = 90;
const TYPES = new Set(["scan", "respondent", "organisatie"]);
const ID = /^[A-Za-z0-9-]{8,64}$/;

let tabelKlaar: Promise<unknown> | null = null;
function zorgVoorTabel(sql: NonNullable<ReturnType<typeof getSql>>) {
  tabelKlaar ??= sql`
    CREATE TABLE IF NOT EXISTS bewerk_sloten (
      entiteit_type text NOT NULL,
      entiteit_id text NOT NULL,
      houder text NOT NULL,
      houder_naam text,
      hartslag_op timestamptz NOT NULL,
      PRIMARY KEY (entiteit_type, entiteit_id)
    )
  `.catch((error) => {
    tabelKlaar = null;
    throw error;
  });
  return tabelKlaar;
}

export async function POST(request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const body = (await request.json().catch(() => null)) as {
    actie?: string;
    houder?: string;
    houderNaam?: string | null;
    toonNaam?: boolean;
  } | null;
  if (!TYPES.has(type) || !ID.test(id) || !body?.houder || !ID.test(body.houder)) {
    return Response.json({ ok: false, reden: "ongeldig-verzoek" }, { status: 400 });
  }
  const sql = getSql();
  if (!sql) return Response.json({ ok: false, reden: "geen-database" }, { status: 503 });

  try {
    await zorgVoorTabel(sql);
    if (body.actie === "vrijgeven") {
      await sql`DELETE FROM bewerk_sloten WHERE entiteit_type = ${type} AND entiteit_id = ${id} AND houder = ${body.houder}`;
      return new Response(null, { status: 204 });
    }
    if (body.actie !== "claim") {
      return Response.json({ ok: false, reden: "ongeldig-verzoek" }, { status: 400 });
    }
    const naam = typeof body.houderNaam === "string" ? body.houderNaam.slice(0, 120) : null;
    const rijen = await sql`
      INSERT INTO bewerk_sloten (entiteit_type, entiteit_id, houder, houder_naam, hartslag_op)
      VALUES (${type}, ${id}, ${body.houder}, ${naam}, now())
      ON CONFLICT (entiteit_type, entiteit_id) DO UPDATE
        SET houder = EXCLUDED.houder, houder_naam = EXCLUDED.houder_naam, hartslag_op = EXCLUDED.hartslag_op
        WHERE bewerk_sloten.houder = EXCLUDED.houder
          OR bewerk_sloten.hartslag_op < now() - ${TTL_SECONDEN}::int * interval '1 second'
      RETURNING houder
    `;
    if (rijen.length > 0) return Response.json({ ok: true });
    const huidig = await sql`
      SELECT houder_naam FROM bewerk_sloten WHERE entiteit_type = ${type} AND entiteit_id = ${id}
    `;
    return Response.json(
      { ok: false, bezet: true, houderNaam: body.toonNaam ? (huidig[0]?.houder_naam ?? null) : null },
      { status: 409 }
    );
  } catch (error) {
    console.error(`[slot] ${body.actie} ${type}/${id} mislukt:`, error);
    return Response.json({ ok: false, reden: "database-onbereikbaar" }, { status: 503 });
  }
}
