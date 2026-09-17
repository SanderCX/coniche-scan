/**
 * Client-side helper die de server-only Gmail-koppeling (app/api/mail,
 * lib/gmail.ts) aanroept. Zolang GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN en
 * GMAIL_AFZENDER niet in .env.local staan, meldt de API "niet-
 * geconfigureerd" en valt de aanroepende UI terug op het zichtbare
 * dev-codeblok (zie v1-aanpassingen.md).
 */
async function verstuur(naar: string, onderwerp: string, tekst: string): Promise<boolean> {
  try {
    const res = await fetch("/api/mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naar, onderwerp, tekst }),
    });
    const data = (await res.json()) as { verstuurd: boolean };
    return data.verstuurd;
  } catch (error) {
    console.error("[mailer] Aanroep naar /api/mail mislukt:", error);
    return false;
  }
}

export async function verstuurVerificatiecode(email: string, code: string): Promise<boolean> {
  const verstuurd = await verstuur(
    email,
    "Je verificatiecode voor Coniche Scan",
    `Je verificatiecode is: ${code}\n\nDeze code is 15 minuten geldig.`
  );
  if (!verstuurd) {
    console.info(`[stub-mail] Verificatiecode voor ${email}: ${code} (geldig 15 minuten)`);
  }
  return verstuurd;
}

export async function verstuurUitnodiging(email: string, uitnodigingsUrl: string): Promise<boolean> {
  const verstuurd = await verstuur(
    email,
    "Je bent uitgenodigd voor de Coniche Scan",
    `Je bent uitgenodigd om de Coniche Scan in te vullen.\n\nOpen deze link om te beginnen:\n${uitnodigingsUrl}`
  );
  if (!verstuurd) {
    console.info(`[stub-mail] Uitnodiging voor ${email}: ${uitnodigingsUrl}`);
  }
  return verstuurd;
}
