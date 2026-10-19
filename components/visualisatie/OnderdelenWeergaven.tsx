"use client";

import { Fragment, useState } from "react";
import { Assessment } from "@/lib/types";
import {
  EenheidInvoer,
  MAX_NAAST_ELKAAR,
  MIN_ONDERDELEN_SPREIDING,
  Vorm,
  eenheidScanId,
  vormVoor,
  eenhedenGemiddeld,
  eenhedenNaastElkaar,
  eenhedenSpreiding,
} from "@/lib/visualisatie";
import { InfoIcoon } from "@/components/InfoIcoon";
import { WeergaveWissel, WisselOptie } from "./WeergaveWissel";
import { WeergaveBouwblok } from "./WeergaveBouwblok";
import { WeergaveSpreiding } from "./WeergaveSpreiding";
import { WeergaveMeerdere } from "./WeergaveMeerdere";
import { VormTeken } from "./VormTeken";
import { KLASSE_KLEUR, EenheidTeksten, toon } from "./gedeeld";

/**
 * De weergaven van een groep onderdelen (`visualisatie-scores.md`, I): Bij een samengestelde Meting, een vergelijking binnen een
 * organisatie en een opgeslagen verkenning op één Organisatie. Elk onderdeel is een eenheid met haar gemiddelde per vraag en telt
 * even zwaar mee. Dezelfde schakelaar als bij een Meting (Overzicht, Per bouwblok, Spreiding, Antwoorden) en rechts "Toon als"
 * met Gemiddeld en Naast elkaar.
 */
export type OnderdelenWeergave = "overzicht" | "bouwblok" | "spreiding" | "antwoorden";
export type ToonAls = "gemiddeld" | "naast";

/** Naast elkaar is er bij hoogstens zes onderdelen (er zijn zes vormen) en vanaf twee: Bij één onderdeel valt er niets te vergelijken. */
export function naastElkaarMogelijk(aantal: number): boolean {
  return aantal >= 2 && aantal <= MAX_NAAST_ELKAAR;
}

/** De opties van de schakelaar. Antwoorden staat uitgeschakeld: Het is er alleen bij één Meting met scans. */
export function onderdelenOpties(aantal: number, metAntwoorden: boolean, meervoud = "onderdelen"): WisselOptie<OnderdelenWeergave>[] {
  const spreidingKan = aantal >= MIN_ONDERDELEN_SPREIDING;
  return [
    { waarde: "overzicht", label: "Overzicht" },
    { waarde: "bouwblok", label: "Per bouwblok" },
    {
      waarde: "spreiding",
      label: "Spreiding",
      disabled: !spreidingKan,
      title: spreidingKan ? undefined : `Spreiding tussen ${meervoud} is er vanaf ${MIN_ONDERDELEN_SPREIDING} ${meervoud}`,
      infoSleutel: spreidingKan || meervoud !== "onderdelen" ? undefined : "info.spreidingOnderdelen",
    },
    ...(metAntwoorden
      ? [
          {
            waarde: "antwoorden" as const,
            label: "Antwoorden",
            disabled: true,
            title: "Antwoorden per vraag is er alleen bij één Meting met scans",
            infoSleutel: "info.antwoordenGeenScans",
          },
        ]
      : []),
  ];
}

/** "Toon als" met Gemiddeld en Naast elkaar, naast een Info-icoon. */
export function ToonAlsKeuze({ waarde, onChange, aantal }: { waarde: ToonAls; onChange: (waarde: ToonAls) => void; aantal: number }) {
  const kan = naastElkaarMogelijk(aantal);
  return (
    <span className="vis-toon-als">
      <span className="text-sm text-ink-m">Toon als</span>
      <InfoIcoon naastVeld sleutel="info.toonAls" />
      <WeergaveWissel<ToonAls>
        ariaLabel="Toon als"
        opties={[
          { waarde: "gemiddeld", label: "Gemiddeld" },
          {
            waarde: "naast",
            label: "Naast elkaar",
            disabled: !kan,
            title: kan ? undefined : aantal > MAX_NAAST_ELKAAR ? "Naast elkaar is er bij hoogstens zes onderdelen" : "Naast elkaar is er vanaf twee onderdelen",
            infoSleutel: !kan && aantal > MAX_NAAST_ELKAAR ? "info.toonAlsTeVeel" : undefined,
          },
        ]}
        waarde={kan ? waarde : "gemiddeld"}
        onChange={onChange}
      />
    </span>
  );
}

/** Het effectieve "Toon als": Naast elkaar valt terug op Gemiddeld als er te weinig of te veel onderdelen zijn. */
export function effectiefToonAls(gewenst: ToonAls, aantal: number): ToonAls {
  return gewenst === "naast" && naastElkaarMogelijk(aantal) ? "naast" : "gemiddeld";
}

/** De legenda met de vormen en de namen, boven Per bouwblok en Spreiding bij Naast elkaar. */
export function VormenLegenda({ eenheden }: { eenheden: EenheidInvoer[] }) {
  return (
    <p className="vis-legenda vis-legenda-rij">
      {eenheden.map((e, i) => (
        <span key={e.id}>
          <VormTeken vorm={vormVoor(i)} /> <strong>{e.label}</strong>
          {e.sublabel && <span className="text-ink-s"> · {e.sublabel}</span>}
        </span>
      ))}
    </p>
  );
}

/**
 * Het Overzicht van een groep onderdelen: Een kaart per onderdeel met de vorm, de naam, de meetdatum en de totaalscore in de
 * kleur van de klasse (`visualisatie-scores.md`, I, Overzicht).
 */
export function OnderdelenKaarten({ assessment, eenheden }: { assessment: Assessment; eenheden: EenheidInvoer[] }) {
  const w = eenhedenNaastElkaar(assessment, eenheden);
  return (
    <div className="vis-onderdeel-kaarten">
      {w.eenheden.map((e) => (
        <div key={e.id} className="vis-onderdeel-kaart">
          <div className="vis-onderdeel-kaart-kop">
            <VormTeken vorm={e.vorm} /> <span>{e.label}</span>
          </div>
          {e.sublabel && <div className="vis-onderdeel-kaart-datum">{e.sublabel}</div>}
          <div className="vis-onderdeel-kaart-score" style={e.totaalKlasse ? { color: KLASSE_KLEUR[e.totaalKlasse] } : undefined}>
            {toon(e.totaal)}
          </div>
        </div>
      ))}
    </div>
  );
}

/** De inhoud van Per bouwblok en Spreiding voor een groep onderdelen, naar "Toon als". */
export function OnderdelenInhoud({
  assessment,
  eenheden,
  eenheid,
  weergave,
  toonAls,
  naastElkaarTwee,
}: {
  assessment: Assessment;
  eenheden: EenheidInvoer[];
  eenheid: EenheidTeksten;
  weergave: "bouwblok" | "spreiding";
  toonAls: ToonAls;
  /** Bij een vergelijking met precies twee Metingen en Naast elkaar: Weergave C of H in plaats van de vormen. */
  naastElkaarTwee?: React.ReactNode;
}) {
  const effectief = effectiefToonAls(toonAls, eenheden.length);
  const vormen = new Map<string, Vorm>();
  if (effectief === "naast") eenheden.forEach((e, i) => vormen.set(eenheidScanId(e.id), vormVoor(i)));
  if (weergave === "bouwblok") {
    if (effectief === "naast") {
      if (eenheden.length === 2 && naastElkaarTwee) return <>{naastElkaarTwee}</>;
      return <WeergaveMeerdere assessment={assessment} weergave={eenhedenNaastElkaar(assessment, eenheden)} eenheid={eenheid} />;
    }
    return <WeergaveBouwblok assessment={assessment} weergave={eenhedenGemiddeld(assessment, eenheden)} toonBereik eenheid={eenheid} />;
  }
  return (
    <Fragment>
      {effectief === "naast" && <VormenLegenda eenheden={eenheden} />}
      <WeergaveSpreiding
        assessment={assessment}
        weergave={eenhedenSpreiding(assessment, eenheden)}
        eenheid={eenheid}
        vormVan={effectief === "naast" ? (id) => vormen.get(id) : undefined}
      />
    </Fragment>
  );
}

/**
 * De weergaven van een groep onderdelen met een eigen schakelaar en eigen stand (niet in de adresbalk): Voor een vergelijking, een
 * opgeslagen verkenning op één Organisatie en andere plekken waar meerdere secties op één pagina staan. `overzicht` is wat bij
 * Overzicht staat, boven de kaarten per onderdeel.
 */
export function OnderdelenWeergaven({
  assessment,
  eenheden,
  eenheid,
  overzicht,
  toonKaarten = true,
  standaardToonAls = "naast",
  naastElkaarTwee,
  extra = [],
  toonAlsKeuze = true,
  metAntwoorden = true,
}: {
  assessment: Assessment;
  eenheden: EenheidInvoer[];
  eenheid: EenheidTeksten;
  overzicht?: React.ReactNode;
  toonKaarten?: boolean;
  standaardToonAls?: ToonAls;
  naastElkaarTwee?: React.ReactNode;
  /** Extra tabs achter de vier weergaven, bijvoorbeeld de matrix op niveau 1. */
  extra?: { waarde: string; label: string; inhoud: React.ReactNode }[];
  /** "Toon als" rechts van de schakelaar. Uit bij een benchmark tussen organisaties: Daar is er alleen het gemiddelde met de lijn. */
  toonAlsKeuze?: boolean;
  /** De uitgeschakelde weergave Antwoorden: Er alleen bij onderdelen, een benchmark tussen organisaties heeft hem niet. */
  metAntwoorden?: boolean;
}) {
  const [weergave, setWeergave] = useState<string>("overzicht");
  const [toonAls, setToonAls] = useState<ToonAls>(standaardToonAls);
  const opties: WisselOptie<OnderdelenWeergave>[] = [
    ...onderdelenOpties(eenheden.length, metAntwoorden, eenheid.meervoud),
    ...extra.map((e) => ({ waarde: e.waarde as OnderdelenWeergave, label: e.label })),
  ];
  const actief = opties.find((o) => o.waarde === weergave && !o.disabled) ? weergave : "overzicht";
  const extraInhoud = extra.find((e) => e.waarde === actief);
  return (
    <div>
      <div className="vis-acties">
        <WeergaveWissel<OnderdelenWeergave>
          ariaLabel="Weergave van de resultaten"
          opties={opties}
          waarde={actief as OnderdelenWeergave}
          onChange={(w) => setWeergave(w)}
        />
        {toonAlsKeuze && <ToonAlsKeuze waarde={toonAls} onChange={setToonAls} aantal={eenheden.length} />}
      </div>
      {actief === "overzicht" && (
        <>
          {overzicht}
          {toonKaarten && toonAlsKeuze && <OnderdelenKaarten assessment={assessment} eenheden={eenheden} />}
        </>
      )}
      {(actief === "bouwblok" || actief === "spreiding") && (
        <OnderdelenInhoud
          assessment={assessment}
          eenheden={eenheden}
          eenheid={eenheid}
          weergave={actief}
          toonAls={toonAlsKeuze ? toonAls : "gemiddeld"}
          naastElkaarTwee={naastElkaarTwee}
        />
      )}
      {extraInhoud && extraInhoud.inhoud}
    </div>
  );
}
