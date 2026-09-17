// Eenmalig te draaien: haalt een Gmail-refresh-token op voor het account
// waarmee je inlogt in de browser die dit script opent.
//
// Gebruik:
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/gmail-refresh-token.mjs
//
// Vereist een OAuth-client van het type "Desktop app" in Google Cloud Console
// (zie de instructies die je apart hebt gekregen).

import { createServer } from "node:http";
import { google } from "googleapis";

const PORT = 8765;
const REDIRECT_URI = `http://localhost:${PORT}`;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "Zet GOOGLE_CLIENT_ID en GOOGLE_CLIENT_SECRET als env-variabelen voordat je dit script draait."
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/gmail.send"],
});

console.log("\nOpen deze URL in je browser en log in met het Gmail-account dat mag versturen:\n");
console.log(authUrl);
console.log("\nWachten op autorisatie...\n");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");

  if (!code) {
    res.writeHead(400).end("Geen code ontvangen.");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Gelukt</h1><p>Je kunt dit tabblad sluiten en teruggaan naar de terminal.</p>");

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Refresh token opgehaald. Zet deze in .env.local als GOOGLE_REFRESH_TOKEN:\n");
    console.log(tokens.refresh_token);
    console.log("");
  } catch (error) {
    console.error("Token-uitwisseling mislukt:", error);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT);
