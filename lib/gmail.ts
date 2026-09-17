import "server-only";
import { google } from "googleapis";

/**
 * Verstuurt e-mail via de Gmail API met OAuth2, vanaf het Gmail-account
 * waarvoor de refresh token is gegenereerd (zie scripts/gmail-refresh-token.mjs).
 * Server-only: de OAuth-credentials mogen nooit in de clientbundel terechtkomen.
 */

function isGeconfigureerd(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.GMAIL_AFZENDER
  );
}

function maakClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

function encodeerBericht(input: { naar: string; onderwerp: string; tekst: string }): string {
  const afzender = process.env.GMAIL_AFZENDER;
  const regels = [
    `From: ${afzender}`,
    `To: ${input.naar}`,
    `Subject: =?UTF-8?B?${Buffer.from(input.onderwerp, "utf-8").toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    input.tekst,
  ];
  return Buffer.from(regels.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function verstuurMail(input: {
  naar: string;
  onderwerp: string;
  tekst: string;
}): Promise<{ verstuurd: boolean; reden?: string }> {
  if (!isGeconfigureerd()) {
    return { verstuurd: false, reden: "niet-geconfigureerd" };
  }
  try {
    const auth = maakClient();
    const gmail = google.gmail({ version: "v1", auth });
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodeerBericht(input) },
    });
    return { verstuurd: true };
  } catch (error) {
    console.error("[gmail] Versturen mislukt:", error);
    return { verstuurd: false, reden: "verzendfout" };
  }
}
