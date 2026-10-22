"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { Schakelaar } from "@/components/Schakelaar";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";
import { Contactpersonen } from "@/components/beheer/Contactpersonen";
import { ToegangKaart } from "@/components/beheer/ToegangKaart";
import { AfsprakenKaart } from "@/components/beheer/AfsprakenKaart";
import { OrganisatieNaamBewerken } from "@/components/beheer/OrganisatieNaamBewerken";
import { Cijferrij, KanalenBlok, OverigBlok, ProfielKop, TechstackBlok } from "@/components/organisatie/ProfielBlokken";
import { organisatieVelden } from "@/data/organisatie-velden";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { useInstellingen } from "@/lib/instellingen-store";
import { zetToonProfiel } from "@/lib/db";
import { dossierVan, geenProfiel } from "@/lib/dossier";
import { PROFIEL_BLOKKEN, PROFIEL_BLOK_LABEL, organisatieProfiel } from "@/lib/organisatie-profiel";
import { magDossierBewerken, magOrganisatieToewijzen } from "@/lib/rechten";
import { Gebruiker, Organisatie, ToonProfiel } from "@/lib/types";

/**
 * Het organisatiepaneel bovenaan het organisatie-detail (`beheerpagina.md`, Organisatiepaneel): Eén witte kaart met de kop (beginletter, naam, pillen
 * Sector en Subsector, "Bewerken"), de cijferrij, de Kanalen, de Techstack en de overige velden, daaronder Toegang en Afspraken (alleen een Admin) en
 * onderaan de Contactpersonen. Het paneel toont alleen wat bekend is. "Bewerken" opent een modal met alle organisatievelden (`stylesheet.md`, Bewerken: Op
 * de plek of in een modal), met onderin de schakelaars "Zichtbaar voor de Lead" voor wie `dossier.bewerken` heeft. Het Bewerkslot van de Organisatie
 * geldt al zolang de pagina open is (`MetBewerkslot`).
 */
export function OrganisatiePaneel({
  organisatie,
  gebruikers,
  onOpslaan,
}: {
  organisatie: Organisatie;
  gebruikers: Gebruiker[];
  onOpslaan: (kenmerken: Record<string, unknown>) => void;
}) {
  const ingelogd = useIngelogdeGebruiker();
  const { korteNamen, kanalen } = useInstellingen();
  const [open, setOpen] = useState(false);
  const profiel = organisatieProfiel(organisatie, { kanalen, techstackVeld: organisatieVelden.find((v) => v.id === "techstack"), korteNamen });
  const isAdmin = magOrganisatieToewijzen(ingelogd);
  const eigenaar = gebruikers.find((g) => g.id === organisatie.aangemaaktDoor);
  const toegewezen = gebruikers.filter((g) => organisatie.toegewezenAan.includes(g.id));
  const leeg = profiel.cijfers.length === 0 && profiel.techstack.length === 0 && profiel.overig.length === 0;

  return (
    <section className="op-paneel" aria-label="Organisatie">
      <ProfielKop
        letter={profiel.letter}
        naam={organisatie.naam}
        sector={profiel.sector}
        subsector={profiel.subsector}
        naamActie={<OrganisatieNaamBewerken organisatieId={organisatie.id} naam={organisatie.naam} korteNaam={organisatie.korteNaam ?? ""} />}
        acties={
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setOpen(true)}>
            Bewerken
          </button>
        }
        onder={
          // Toegang toont de eigenaar en de toegewezen Consultants aan een Admin; een Consultant ziet dat vlak niet en houdt daarom deze regel.
          !isAdmin && (
            <p className="op-regel">
              Aangemaakt door: {eigenaar ? eigenaar.naam : "onbekend"}
              {toegewezen.length > 0 && ` · Ook toegewezen aan: ${toegewezen.map((g) => g.naam).join(", ")}`}
            </p>
          )
        }
      />

      {leeg ? <p className="op-leeg">Er zijn nog geen kenmerken ingevuld.</p> : <Cijferrij cijfers={profiel.cijfers} />}
      <KanalenBlok kanalen={profiel.kanalen} />
      <TechstackBlok tegels={profiel.techstack} />
      <OverigBlok overig={profiel.overig} />

      {isAdmin && (
        <div className="op-onder">
          <ToegangKaart organisatie={organisatie} gebruikers={gebruikers} />
          <AfsprakenKaart organisatie={organisatie} />
        </div>
      )}

      <Contactpersonen organisatie={organisatie} />

      {open && (
        <KenmerkenModal
          organisatie={organisatie}
          toonProfielBewerken={magDossierBewerken(ingelogd, organisatie)}
          onSluit={() => setOpen(false)}
          onOpslaan={(kenmerken, toon) => {
            onOpslaan(kenmerken);
            if (toon) zetToonProfiel(organisatie.id, toon);
            setOpen(false);
          }}
        />
      )}
    </section>
  );
}

/**
 * De modal "Kenmerken bewerken" (`beheerpagina.md`, Bewerken en Zichtbaar voor de Lead): De velden in twee kolommen, daaronder, voor wie
 * `dossier.bewerken` heeft, de groep "Zichtbaar voor de Lead" met een schakelaar per blok. Opslaan schrijft de velden en de schakelaars samen,
 * Annuleren en het kruisje gooien alles weg.
 */
function KenmerkenModal({
  organisatie,
  toonProfielBewerken,
  onSluit,
  onOpslaan,
}: {
  organisatie: Organisatie;
  toonProfielBewerken: boolean;
  onSluit: () => void;
  onOpslaan: (kenmerken: Record<string, unknown>, toon: ToonProfiel | null) => void;
}) {
  const dossier = dossierVan(organisatie);
  const [concept, setConcept] = useState<Record<string, unknown>>(organisatie.kenmerken);
  const [toon, setToon] = useState<ToonProfiel>({ ...geenProfiel(), ...dossier.toonProfiel });
  return (
    <OverzichtModal label="Kenmerken bewerken" onSluit={onSluit}>
      <div className="overzicht-kop">
        <h2>Kenmerken bewerken</h2>
        <p className="text-sm text-ink-m" style={{ margin: 0 }}>
          {organisatie.naam}
        </p>
      </div>
      <div className="kenmerken-modal">
        <KenmerkenForm velden={organisatieVelden} waarden={concept} onChange={setConcept} className="kenmerken-form-raster" />
      </div>
      {toonProfielBewerken && (
        <div className="op-zichtbaar">
          <div className="titel-rij op-zichtbaar-kop">
            <h3 id="op-zichtbaar-kop">Zichtbaar voor de Lead</h3>
            <InfoIcoon sleutel="info.profielLead" />
          </div>
          <ul className="op-zichtbaar-lijst">
            {PROFIEL_BLOKKEN.map((blok) => (
              <li key={blok}>
                <span id={`op-zichtbaar-${blok}`}>{PROFIEL_BLOK_LABEL[blok]}</span>
                <Schakelaar aan={toon[blok]} ariaLabelledBy={`op-zichtbaar-${blok}`} onChange={(aan) => setToon((t) => ({ ...t, [blok]: aan }))} />
              </li>
            ))}
          </ul>
          {!dossier.zichtbaar && <p className="op-hint">De Lead ziet dit pas als het Dossier zichtbaar is gemaakt.</p>}
        </div>
      )}
      <div className="btn-rij kenmerken-modal-knoppen">
        <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
          Annuleren
        </button>
        <button type="button" className="btn btn-or btn-compact" onClick={() => onOpslaan(concept, toonProfielBewerken ? toon : null)}>
          Opslaan
        </button>
      </div>
    </OverzichtModal>
  );
}
