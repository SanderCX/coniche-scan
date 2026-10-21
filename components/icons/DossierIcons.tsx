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
