"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { Schakelaar } from "@/components/Schakelaar";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";
import { Contactpersonen } from "@/components/beheer/Contactpersonen";
import { OrganisatieNaamBewerken } from "@/components/beheer/OrganisatieNaamBewerken";
import { Cijferrij, KanalenBlok, KpiRingenBlok, OverigBlok, ProfielKop, TechstackBlok } from "@/components/organisatie/ProfielBlokken";
import { DropdownKnop } from "@/components/DropdownKnop";
import { KpiInvullenModal } from "@/components/beheer/KpiInvullenModal";
import { OnderdelenModal } from "@/components/beheer/OnderdelenModal";
import { organisatieVelden } from "@/data/organisatie-velden";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { useInstellingen } from "@/lib/instellingen-store";
import { zetToonProfiel } from "@/lib/db";
import { dossierVan, geenProfiel } from "@/lib/dossier";
import { kanaalStijl } from "@/lib/kanaal-stijl";
import { bouwKpiRing, kopTekstKpis, kpiRingInvoer } from "@/lib/kpi-ringen";
import { onderdelenOpAlfabet } from "@/lib/onderdelen";
import { PROFIEL_BLOKKEN, PROFIEL_BLOK_LABEL, organisatieProfiel, profielKanalen } from "@/lib/organisatie-profiel";
import { magDossierBewerken, magOrganisatieToewijzen } from "@/lib/rechten";
import { Gebruiker, Organisatie, ToonProfiel } from "@/lib/types";

/**
 * Het organisatiepaneel bovenaan het organisatie-detail (`beheerpagina.md`, Organisatiepaneel): Eén witte kaart met de kop (beginletter, naam, pillen
 * Sector en Subsector), de cijferrij, de Kanalen, de Techstack en de overige velden en onderaan de Contactpersonen. De kaart heet Bedrijfsgegevens, met rechts
 * in de kop "Bewerken". Toegang en Afspraken staan in de kaart Permissies (`PermissiesKaart`, alleen een Admin). Het paneel toont alleen wat bekend is. "Bewerken" opent een modal met alle organisatievelden (`stylesheet.md`, Bewerken: Op
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
  const { korteNamen, kanalen, kpiDefinities } = useInstellingen();
  // Wat er open staat: De modal Kenmerken, KPI's invullen of Onderdelen (allemaal onder de knop Bewerken).
  const [modal, setModal] = useState<"kenmerken" | "kpis" | "onderdelen" | null>(null);
  // De keuze van het Onderdeel en het kanaal voor de KPI-ringen: Ze blijven staan als je de andere wijzigt, maar worden niet bewaard.
  const [gekozenOnderdeel, setGekozenOnderdeel] = useState<string | null>(null);
  const [kanaalId, setKanaalId] = useState<string | null>(null);
  const profiel = organisatieProfiel(organisatie, { kanalen, techstackVeld: organisatieVelden.find((v) => v.id === "techstack"), korteNamen });
  const isAdmin = magOrganisatieToewijzen(ingelogd);
  const eigenaar = gebruikers.find((g) => g.id === organisatie.aangemaaktDoor);
  const toegewezen = gebruikers.filter((g) => organisatie.toegewezenAan.includes(g.id));
  const onderdelen = onderdelenOpAlfabet(organisatie);
  // Is het gekozen Onderdeel verwijderd, dan geldt weer de hele organisatie.
  const onderdeel = onderdelen.find((o) => o.id === gekozenOnderdeel) ?? null;
  const onderdeelId = onderdeel?.id ?? null;
  const kanalenPlek = profielKanalen(organisatie, kanalen, { onderdeelId });
  const gekozenKanaal = kanalen.find((k) => k.id === kanaalId);
  const ringen = kpiRingInvoer(organisatie, kpiDefinities, { onderdeelId, metKanalen: true }).map((k) => bouwKpiRing(k, kanaalId, { onderdeelGekozen: onderdeelId !== null }));
  const leeg = profiel.cijfers.length === 0 && profiel.techstack.length === 0 && profiel.overig.length === 0;

  return (
    <section className="op-paneel org-anker" id="profiel" aria-label="Bedrijfsgegevens">
      <div className="beheer-kaart-kop">
        <h2>Bedrijfsgegevens</h2>
        <DropdownKnop
          label="Bewerken"
          rechtsUitgelijnd
          opties={[
            { label: "Kenmerken", onClick: () => setModal("kenmerken") },
            { label: "KPI's invullen", onClick: () => setModal("kpis") },
            { label: "Onderdelen", onClick: () => setModal("onderdelen") },
          ]}
        />
      </div>
      <ProfielKop
        letter={profiel.letter}
        naam={organisatie.naam}
        sector={profiel.sector}
        subsector={profiel.subsector}
        naamActie={<OrganisatieNaamBewerken organisatieId={organisatie.id} naam={organisatie.naam} korteNaam={organisatie.korteNaam ?? ""} />}
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
      <KanalenBlok kanalen={kanalenPlek} gekozen={kanaalId} onKies={setKanaalId} />
      <KpiRingenBlok
        kop={kopTekstKpis([onderdeel?.naam.toLocaleUpperCase("nl-NL"), gekozenKanaal?.naam.toLocaleUpperCase("nl-NL")])}
        ringen={ringen}
        kanaalKleur={gekozenKanaal ? kanaalStijl(gekozenKanaal.naam).kleur : "var(--or)"}
        legenda={!!gekozenKanaal}
        info={<InfoIcoon sleutel="info.kpiBlok" />}
        rechts={
          onderdelen.length > 0 && (
            <select className="field" aria-label="Onderdeel" value={onderdeelId ?? ""} onChange={(e) => setGekozenOnderdeel(e.target.value || null)}>
              <option value="">Hele organisatie</option>
              {onderdelen.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.naam}
                </option>
              ))}
            </select>
          )
        }
      />
      <TechstackBlok tegels={profiel.techstack} />
      <OverigBlok overig={profiel.overig} />

      <Contactpersonen organisatie={organisatie} />

      {modal === "kenmerken" && (
        <KenmerkenModal
          organisatie={organisatie}
          toonProfielBewerken={magDossierBewerken(ingelogd, organisatie)}
          onSluit={() => setModal(null)}
          onOpslaan={(kenmerken, toon) => {
            onOpslaan(kenmerken);
            if (toon) zetToonProfiel(organisatie.id, toon);
            setModal(null);
          }}
        />
      )}
      {modal === "kpis" && <KpiInvullenModal organisatie={organisatie} beginOnderdeelId={onderdeelId} onSluit={() => setModal(null)} />}
      {modal === "onderdelen" && <OnderdelenModal organisatie={organisatie} onSluit={() => setModal(null)} />}
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
