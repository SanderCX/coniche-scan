/**
 * Tabbladtitel per route (`stylesheet.md`, Browsericoon, Tabbladtitel): `<Paginanaam> | Coniche Scan`.
 * De eerste regel die past wint, dus specifieke routes staan boven algemene. Een segment tussen `[` en `]` past
 * op elke waarde. Een route zonder regel krijgt alleen "Coniche Scan".
 */
export const SITE_TITEL = "Coniche Scan";

const PAGINA_TITELS: { route: string; titel: string }[] = [
  { route: "/", titel: "Kies jouw assessment" },
  { route: "/toegang", titel: "Toegang" },
  { route: "/privacy", titel: "Privacy" },
  { route: "/visie", titel: "Visie" },
  { route: "/bouwstenen", titel: "Bouwstenen" },
  { route: "/ai-scan", titel: "AI" },
  { route: "/klantcontact-2030", titel: "2030" },
  { route: "/help", titel: "Help" },
  { route: "/help/[onderwerp]", titel: "Help" },
  { route: "/[assessmentId]", titel: "Assessment" },
  { route: "/[assessmentId]/voorbeeld", titel: "Voorbeeld-output" },

  // Respondentkant
  { route: "/s/[code]", titel: "Mijn metingen" },
  { route: "/s/[code]/resultaten/[scanUitvoeringId]", titel: "Resultaten van de Meting" },
  { route: "/s/[code]/benchmark/[toewijzingId]", titel: "Benchmark" },
  { route: "/scan/[respondentId]/intake", titel: "Intake" },
  { route: "/scan/[respondentId]/doorloop", titel: "Vragenlijst" },
  { route: "/scan/[respondentId]/resultaten", titel: "Resultaten" },

  // Beheer
  { route: "/beheer/help", titel: "Help" },
  { route: "/beheer/help/[onderwerp]", titel: "Help" },
  { route: "/beheer", titel: "Beheer" },
  { route: "/beheer/applicatie", titel: "Instellingen" },
  { route: "/beheer/instellingen", titel: "Instellingen" },
  { route: "/beheer/drempels", titel: "Drempels en termijnen" },
  { route: "/beheer/audit", titel: "Audit-log" },
  { route: "/beheer/teksten", titel: "Algemene teksten" },
  { route: "/beheer/content-paginas", titel: "Content-pagina's" },
  { route: "/beheer/data-integriteit", titel: "Data-integriteit" },
  { route: "/beheer/gebruikers", titel: "Gebruikers" },
  { route: "/beheer/gebruikers/nieuw", titel: "Nieuwe gebruiker" },
  { route: "/beheer/gebruikers/[gebruikerId]", titel: "Gebruiker" },
  { route: "/beheer/content", titel: "Content" },
  { route: "/beheer/content/nieuw", titel: "Nieuw Assessment" },
  { route: "/beheer/content/[assessmentId]", titel: "Assessment bewerken" },
  { route: "/beheer/organisaties", titel: "Organisaties" },
  { route: "/beheer/organisaties/nieuw", titel: "Nieuwe organisatie" },
  { route: "/beheer/organisaties/[organisatieId]", titel: "Organisatie" },
  { route: "/beheer/respondenten", titel: "Respondenten" },
  { route: "/beheer/scans", titel: "Metingen" },
  { route: "/beheer/resultaten", titel: "Resultaten" },
  { route: "/beheer/resultaten/metingen", titel: "Metingen" },
  { route: "/beheer/organisaties/[organisatieId]/import", titel: "Importeren" },
  { route: "/beheer/metingen/[metingId]", titel: "Meting" },
  { route: "/beheer/rapportage/[scanUitvoeringId]", titel: "Resultaten van de Meting" },
  { route: "/beheer/resultaten/[scanInvullingId]", titel: "Resultaten" },
  { route: "/beheer/import", titel: "Import van scans" },
  { route: "/beheer/benchmark", titel: "Benchmarks" },
  { route: "/beheer/benchmark/nieuw", titel: "Nieuwe benchmark" },
  { route: "/beheer/benchmark/[benchmarkId]", titel: "Benchmark" },
  { route: "/beheer/benchmark/[benchmarkId]/bewerken", titel: "Benchmark bewerken" },
  { route: "/beheer/benchmark/[benchmarkId]/organisatie/[organisatieId]", titel: "Benchmark per organisatie" },
  { route: "/beheer/benchmark/[benchmarkId]/meting/[metingId]", titel: "Benchmark per Meting" },
  { route: "/beheer/benchmark/[benchmarkId]/scan/[invullingId]", titel: "Benchmark per scan" },
];

function past(route: string, pad: string): boolean {
  const routeDelen = route.split("/");
  const padDelen = pad.split("/");
  if (routeDelen.length !== padDelen.length) return false;
  return routeDelen.every((deel, i) => (deel.startsWith("[") && deel.endsWith("]") ? padDelen[i] !== "" : deel === padDelen[i]));
}

/** De volledige tabbladtitel voor een pad, bijv. "Organisaties | Coniche Scan". */
export function paginaTitel(pad: string): string {
  const normaal = pad.length > 1 ? pad.replace(/\/$/, "") : pad;
  const regel = PAGINA_TITELS.find((r) => past(r.route, normaal));
  return regel ? `${regel.titel} | ${SITE_TITEL}` : SITE_TITEL;
}
