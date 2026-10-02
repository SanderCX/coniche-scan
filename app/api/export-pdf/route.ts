import { readFile } from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { pdfBestandsnaam } from "@/lib/pdf/bestandsnaam";
import { buildResultatenPdfHtml, ExportPdfPayload } from "@/lib/pdf/build-html";

/**
 * PDF-export van één ingevulde scan (export-pdf-visual-volwassenheidsscan.md
 * e.v.). Zelfstandig: de client stuurt alle benodigde data mee (het huidige
 * Assessment zoals de respondent het zag, plus de antwoorden/opmerkingen),
 * zodat de server geen toegang nodig heeft tot de localStorage-data van de
 * browser — die bestaat hier niet. Duidingscontent (visie/bouwstenen/2030/
 * AI-domeinen) komt uit dezelfde statische content-bestanden als de
 * interactieve pagina's (`lib/pdf/content-secties.ts`), niet uit de payload.
 *
 * Rendering: een zelfstandige HTML-string (geen navigatie naar de live
 * app — die kent deze respondent niet, om dezelfde reden), geopend in een
 * headless Chromium-pagina en geprint naar PDF. De paginanummering ("Pagina
 * X / Y") komt uit een CSS `@page`-marginbox in de HTML zelf, niet uit
 * Puppeteer's `displayHeaderFooter`/`footerTemplate` (zie
 * export-pdf-visual-volwassenheidsscan.md).
 */
const MAX_BODY_BYTES = 2_000_000;
const MAX_GELIJKTIJDIG = 2;
let actief = 0;

export async function POST(request: Request) {
  // Zonder inlog bereikbaar (backlog.md, fase 3): Tot die er is, begrenzen we
  // wat één verzoek mag kosten, zodat de route geen onbeperkt aantal
  // headless browsers kan starten.
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return Response.json({ fout: "te-groot" }, { status: 413 });
  }
  if (actief >= MAX_GELIJKTIJDIG) {
    return Response.json({ fout: "bezet" }, { status: 429 });
  }
  const payload = (await request.json().catch(() => null)) as ExportPdfPayload | null;

  if (!payload?.assessment || !payload.antwoorden || !payload.organisatieNaam) {
    return Response.json({ fout: "ongeldig-verzoek" }, { status: 400 });
  }

  actief++;
  try {
    return await maakPdf(payload);
  } finally {
    actief--;
  }
}

async function maakPdf(payload: ExportPdfPayload): Promise<Response> {
  const logoPad = path.join(process.cwd(), "public/LOGO/Coniche_MMW_standard.svg");
  const logoSvg = await readFile(logoPad, "utf-8");
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;

  const html = buildResultatenPdfHtml(payload, logoDataUri);

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    const bestandsnaam = pdfBestandsnaam(payload.assessment, payload.organisatieNaam);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${bestandsnaam.normalize("NFD").replace(/[^\x20-\x7e]/g, "")}"; filename*=UTF-8''${encodeURIComponent(bestandsnaam)}`,
      },
    });
  } finally {
    await browser.close();
  }
}
