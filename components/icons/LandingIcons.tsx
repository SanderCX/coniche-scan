import type { ComponentType, SVGProps } from "react";
import { IconBase } from "@/components/icons/AssessmentIcons";

type IconProps = SVGProps<SVGSVGElement>;

/** Iconen op de landingspagina van een Assessment (lijntekeningen op een raster van 24, zoals de Assessment-iconen). Altijd grijs, via `currentColor`. */

export function KlokIcoon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </IconBase>
  );
}

export function GloeilampIcoon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 17.5h6M10 20.5h4" />
      <path d="M12 3.5a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3.5Z" />
    </IconBase>
  );
}

export function StijgendIcoon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 17 9.5 11l4 4 7-7.5" />
      <path d="M15 7.5h5.5V13" />
    </IconBase>
  );
}

export function LagenIcoon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 4 8.5 4.5L12 13 3.5 8.5 12 4Z" />
      <path d="m3.5 12.5 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16.5 8.5 4.5 8.5-4.5" />
    </IconBase>
  );
}

export function StaafIcoon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20.5h16" />
      <path d="M6.5 20.5V13M12 20.5V6.5M17.5 20.5V10.5" />
    </IconBase>
  );
}

export function SleutelIcoon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.5 6.5a4 4 0 0 0-5.2 5.2L3.5 17.5V20.5h3v-2h2v-2l2.8-2.8a4 4 0 0 0 5.2-5.2l-2.5 2.5-2-2 2.5-2.5Z" />
    </IconBase>
  );
}

export function SlotIcoon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </IconBase>
  );
}

export function VlagIcoon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.5 21V4" />
      <path d="M5.5 4.5h11.5l-2.2 3.8 2.2 3.7H5.5" />
    </IconBase>
  );
}

/** De iconen van de punten op een tegel (`lib/landing.ts`, `tegelInhoud`). */
export const TEGEL_ICONEN: Record<"klok" | "lagen" | "vlag" | "staafjes", ComponentType<IconProps>> = {
  klok: KlokIcoon,
  lagen: LagenIcoon,
  vlag: VlagIcoon,
  staafjes: StaafIcoon,
};

/** Het icoon bij een deel van de subtitel, op de inhoud van dat deel. Geen passend icoon: `null`. */
export function icoonVoorSubtitel(deel: string): ComponentType<IconProps> | null {
  const t = deel.toLowerCase();
  if (t.includes("minuten")) return KlokIcoon;
  if (t.includes("inzicht")) return GloeilampIcoon;
  if (t.includes("verbeterkansen") || t.includes("vervolgstappen")) return StijgendIcoon;
  return null;
}

/** De iconen boven de kaarten, op volgorde van de kaart: Volledig beeld, Direct inzicht, Concreet en toepasbaar. */
export const KAART_ICONEN: ComponentType<IconProps>[] = [LagenIcoon, StaafIcoon, SleutelIcoon];
