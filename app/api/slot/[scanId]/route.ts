import { getSql } from "@/lib/neon";

/**
 * Scanslot: één persoon tegelijk per ingevulde scan (CLAUDE.md, scherm 5,
 * "Gelijktijdig invullen"). De eerste die de vragenlijst opent, houdt het
 * slot zolang zijn pagina open staat: Die stuurt elke paar seconden een
 * "claim" (hartslag) en geeft het slot vrij bij het verlaten. Een tweede
 * persoon krijgt `409` en een melding. Verloopt de hartslag (gesloten
 * browser, slapende laptop), dan komt het slot na `TTL_SECONDEN` vanzelf
 * vrij, zodat een scan nooit blijvend geblokkeerd raakt.
 *
 * Eén atomaire SQL-instructie (`INSERT … ON CONFLICT DO UPDATE … WHERE`),
 * geen lees-dan-schrijf: Twee gelijktijdige claims kunnen het slot nooit
 * allebei krijgen. `houder` is een willekeurige id per browsertabblad
 * (`lib/scan-slot.ts`), geen persoonsgegeven. Zonder database (`503`)
 * valt de client terug op een slot in localStorage.
 *
 * Bewust geen auth, net als `app/api/store/[key]/route.ts`: Zie de
 * beveiligingspunten in `backlog.md` (fase 3).
 */
const TTL_SECONDEN = 90;
const SCAN_ID = /^[A-Za-z0-9-]{8,64}$/;
const HOUDER = /^[A-Za-z0-9-]{8,64}$/;

export async function POST(request: Request, { params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  const body = (await request.json().catch(() => null)) as { actie?: string; houder?: string } | null;
  if (!SCAN_ID.test(scanId) || !body?.houder || !HOUDER.test(body.houder)) {
    return Response.json({ ok: false, reden: "ongeldig-verzoek" }, { status: 400 });
  }
  const sql = getSql();
  if (!sql) return Response.json({ ok: false, reden: "geen-database" }, { status: 503 });

  try {
    if (body.actie === "vrijgeven") {
      await sql`DELETE FROM scan_sloten WHERE scan_id = ${scanId} AND houder = ${body.houder}`;
      return new Response(null, { status: 204 });
    }
    if (body.actie !== "claim") {
      return Response.json({ ok: false, reden: "ongeldig-verzoek" }, { status: 400 });
    }
    const rijen = await sql`
      INSERT INTO scan_sloten (scan_id, houder, verloopt_op)
      VALUES (${scanId}, ${body.houder}, now() + ${TTL_SECONDEN}::int * interval '1 second')
      ON CONFLICT (scan_id) DO UPDATE
        SET houder = EXCLUDED.houder, verloopt_op = EXCLUDED.verloopt_op
        WHERE scan_sloten.houder = EXCLUDED.houder OR scan_sloten.verloopt_op < now()
      RETURNING houder
    `;
    return rijen.length > 0
      ? Response.json({ ok: true })
      : Response.json({ ok: false, bezet: true }, { status: 409 });
  } catch (error) {
    console.error(`[slot] ${body.actie} ${scanId} mislukt:`, error);
    return Response.json({ ok: false, reden: "database-onbereikbaar" }, { status: 503 });
  }
}
