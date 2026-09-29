import { readFile } from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { pdfBestandsnaam } from "@/lib/pdf/bestandsnaam";
import { buildResultatenPdfHtml, ExportPdfPayload } from "@/lib/pdf/build-html";

/**
 * PDF-export van één ingevulde scan (export-pdf.md). Zelfstandig: de client
 * stuurt alle benodigde data mee (het huidige Assessment zoals de
 * respondent het zag, plus de antwoorden/opmerkingen), zodat de server geen
 * toegang nodig heeft tot de localStorage-data van de browser — die bestaat
 * hier niet. Duidingscontent (visie/bouwstenen/2030/AI-domeinen) komt uit
 * dezelfde statische content-bestanden als de interactieve pagina's
 * (`lib/pdf/content-secties.ts`), niet uit de payload.
 *
 * Rendering: een zelfstandige HTML-string (geen navigatie naar de live
 * app — die kent deze respondent niet, om dezelfde reden), geopend in een
 * headless Chromium-pagina en geprint naar PDF. `displayHeaderFooter` +
 * `footerTemplate` geven de native "Pagina X / Y" die platte
 * browser-print-to-PDF niet kan (zie export-pdf.md, "Technisch").
 */
export async function POST(request: Request) {
  const payload = (await request.json()) as ExportPdfPayload;

  if (!payload?.assessment || !payload.antwoorden || !payload.organisatieNaam) {
    return Response.json({ fout: "ongeldig-verzoek" }, { status: 400 });
  }

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
