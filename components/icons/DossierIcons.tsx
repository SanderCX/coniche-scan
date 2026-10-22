import type { SVGProps } from "react";

/** Lijniconen voor het Dossier (`dossier.md`): Een mapje voor het Dossier zelf, een koffertje voor een Case en een krant voor Nieuws. Raster van 24, lijndikte 1,75. */
const basis = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function MapIcoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...basis} aria-hidden="true" {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

export function CaseIcoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...basis} aria-hidden="true" {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 13h18" />
    </svg>
  );
}

export function NieuwsIcoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...basis} aria-hidden="true" {...props}>
      <path d="M5 5h11a1 1 0 0 1 1 1v13H6a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1Z" />
      <path d="M17 9h2a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2M8 9h5M8 13h5M8 16h3" />
    </svg>
  );
}

/** Een kalender voor een Event. */
export function EventIcoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...basis} aria-hidden="true" {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

/** Een pen op een blad voor een Blog. */
export function BlogIcoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...basis} aria-hidden="true" {...props}>
      <path d="M5 4h9a1 1 0 0 1 1 1v3M5 4a1 1 0 0 0-1 1v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
      <path d="M8 9h4M8 13h3M14.5 14.5 20 9l-2-2-5.5 5.5-.5 2.5 2.5-.5Z" />
    </svg>
  );
}

/**
 * Een staafdiagram met drie gevulde staven voor een Benchmark (`dossier.md`, Soortkleur en icoon): Hetzelfde icoon als bij "Benchmarks" op de pagina van de
 * Lead en op de benchmarkkaart, in de kleur van de tekst. Een eigen of dunner getekend icoon is een fout.
 */
export function BenchmarkIcoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="4" y="12" width="4" height="8" rx="1" fill="currentColor" />
      <rect x="10" y="6" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="16" y="9" width="4" height="11" rx="1" fill="currentColor" />
    </svg>
  );
}

/** De icoon per soort, met de maat. */
export function SoortIcoon({ soort, size = 26 }: { soort: "case" | "benchmark" | "nieuws" | "event" | "blog"; size?: number }) {
  const props = { width: size, height: size };
  if (soort === "case") return <CaseIcoon {...props} />;
  if (soort === "benchmark") return <BenchmarkIcoon {...props} />;
  if (soort === "nieuws") return <NieuwsIcoon {...props} />;
  if (soort === "event") return <EventIcoon {...props} />;
  return <BlogIcoon {...props} />;
}
