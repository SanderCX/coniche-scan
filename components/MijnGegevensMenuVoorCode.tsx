"use client";

import { useRespondentPerToegangscode } from "@/lib/db";
import { MijnGegevensMenu } from "./MijnGegevensMenu";

/**
 * Client-wrapper zodat de 4 content-pagina's (server components, lezen
 * `code` uit `searchParams`) toch het "Mijn gegevens"-menu kunnen tonen:
 * `useRespondentPerToegangscode` is een hook en moet in een client
 * component draaien. Rendert niets als de code geen respondent oplevert
 * (bijv. een verwijderde respondent met een dode link).
 */
export function MijnGegevensMenuVoorCode({ code }: { code: string }) {
  const gegevens = useRespondentPerToegangscode(code);
  if (!gegevens) return null;
  return <MijnGegevensMenu lid={gegevens.lid} />;
}
