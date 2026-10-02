import type { ComponentType, ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Gedeelde SVG-wrapper, ook hergebruikt door components/icons/MachineCustomerIcons.tsx voor dezelfde lijnstijl buiten de Assessment-iconen om. */
export function IconBase({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

function TargetIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <circle cx="12" cy="12" r="4.75" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

function SparkleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M12 3.5c.5 3.2 1.3 5 2.6 6.3S17.8 11.6 21 12c-3.2.4-5 1.2-6.4 2.5S12.5 17.8 12 21c-.5-3.2-1.3-5-2.6-6.3S6.2 12.4 3 12c3.2-.4 5-1.2 6.4-2.5S11.5 6.7 12 3.5Z"
        fill="currentColor"
        stroke="none"
      />
    </IconBase>
  );
}

function HeartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      {/* Iets kleiner (0.9x, rond het midden van de 24x24 viewBox) dan de kale
          vorm: een hart vult die box optisch voller dan de cirkels/sparkle
          van de andere twee icoon, en oogde daardoor te dominant naast ze. */}
      <g transform="translate(1.2 1.2) scale(0.9)">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </g>
    </IconBase>
  );
}

/** Sleutel per Assessment (`assessment.icoon`), instelbaar in Content-beheer. */
export const ASSESSMENT_ICONS: Record<string, ComponentType<IconProps>> = {
  target: TargetIcon,
  sparkle: SparkleIcon,
  heart: HeartIcon,
};

/**
 * Rendert het icoon-veld van een Assessment. `datamodel.md`
 * (`Assessment.icoon`) laat ook een letterlijke emoji toe: Zo'n waarde
 * heeft geen entry in `ASSESSMENT_ICONS` en valt hier terug op platte
 * tekst — een emoji-teken toont daarmee vanzelf goed, geen apart
 * SVG-icoon nodig. De Zorgscan gebruikt in plaats daarvan de sleutel
 * "heart" hierboven (hartje-outline, op verzoek van Sander, in dezelfde
 * lijnstijl als target/sparkle).
 */
export function AssessmentIcon({ name, ...props }: { name: string } & IconProps) {
  const Icon = ASSESSMENT_ICONS[name];
  if (!Icon) return <span>{name}</span>;
  return <Icon {...props} />;
}
