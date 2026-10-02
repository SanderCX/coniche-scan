import type { ComponentType, SVGProps } from "react";
import { IconBase } from "./AssessmentIcons";

type IconProps = SVGProps<SVGSVGElement>;

/** Vooraf gebundeld dossier (bestelgegevens, facturen, screenshots, logs). */
function DossierIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 7.5a1.5 1.5 0 0 1 1.5-1.5h4l1.5 2h9A1.5 1.5 0 0 1 20.5 9.5v9A1.5 1.5 0 0 1 19 20H4.5A1.5 1.5 0 0 1 3 18.5v-11Z" />
      <path d="M7.75 13h8.5M7.75 16.25h5" />
    </IconBase>
  );
}

/** Actiegericht verzoek i.p.v. een losse vraag — bliksem, gevuld net als SparkleIcon. */
function BoltIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12.9 2.5 4.5 14h5.3l-1 7.5L19.5 10h-5.3l1-7.5Z" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

/** Contactfrequentie, 24 uur per dag. */
function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5V12l3.25 1.9" />
    </IconBase>
  );
}

/** Verschuivende, oplopende verwachtingen. */
function TrendUpIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 16.5 9 11l3.5 3.5L20.5 6" />
      <path d="M15 6h5.5v5.5" />
    </IconBase>
  );
}

/** Nieuwe, onverwachte vragen over een "foute" transactie. */
function AlertIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.5 21 19.5H3L12 3.5Z" />
      <path d="M12 9.5v4.25" />
      <circle cx="12" cy="16.75" r="0.9" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

/**
 * Iconen bij de vijf effecten van de machine customer
 * (`data/klantcontact-2030-content.ts`, `machineCustomerEffecten`), in
 * dezelfde lijnstijl als `ASSESSMENT_ICONS` (components/icons/AssessmentIcons.tsx)
 * maar een losse set: dit zijn geen `Assessment.icoon`-waarden, puur een
 * visuele vervanging van de bullets op de "Klantcontact richting 2030"-pagina.
 */
export const MACHINE_CUSTOMER_ICONS: Record<string, ComponentType<IconProps>> = {
  dossier: DossierIcon,
  bolt: BoltIcon,
  clock: ClockIcon,
  trendUp: TrendUpIcon,
  alert: AlertIcon,
};
