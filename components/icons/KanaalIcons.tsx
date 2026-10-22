import type { SVGProps } from "react";
import type { KanaalIcoonSoort } from "@/lib/kanaal-stijl";

/** Lijniconen voor de kanalen (`stylesheet.md`, Kanaalkleuren). Raster van 24, lijndikte 1,75, in de kleur van de tekst. */
const basis = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function KanaalIcoon({ soort, size = 14, ...rest }: { soort: KanaalIcoonSoort; size?: number } & SVGProps<SVGSVGElement>) {
  const props = { ...basis, width: size, height: size, "aria-hidden": true, ...rest };
  switch (soort) {
    case "telefoon":
      return (
        <svg {...props}>
          <path d="M6.6 3.5h2.7l1.4 4-1.8 1.3a11 11 0 0 0 5.3 5.3l1.3-1.8 4 1.4v2.7a2 2 0 0 1-2.2 2A16 16 0 0 1 4.6 5.7 2 2 0 0 1 6.6 3.5Z" />
        </svg>
      );
    case "microfoon":
      return (
        <svg {...props}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
        </svg>
      );
    case "robot":
      return (
        <svg {...props}>
          <rect x="4.5" y="8" width="15" height="11" rx="3" />
          <path d="M12 8V4.5M9.5 13h.01M14.5 13h.01M9.5 16.5h5" />
        </svg>
      );
    case "envelop":
      return (
        <svg {...props}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "berichtbel":
      return (
        <svg {...props}>
          <path d="M4 20l1.2-3.7A8 8 0 1 1 8.2 19L4 20Z" />
          <path d="M9 10c.4 2 2 3.6 4 4l1.2-1 1.8.8" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 16h-7l-4 3.5V16H5a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 5 5Z" />
        </svg>
      );
  }
}
