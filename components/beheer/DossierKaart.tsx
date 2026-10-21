"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { BouwblokChip } from "@/components/dossier/BouwblokChip";
import { CaseIcoon, NieuwsIcoon } from "@/components/icons/DossierIcons";
import { useAssessments } from "@/lib/assessment-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { useInstellingen } from "@/lib/instellingen-store";
import { magCaseVlagZetten, magDossierBewerken } from "@/lib/rechten";
import { useOrganisaties, verwijderDossieritem, voegDossieritemToe, wijzigDossieritem, zetDossierOpen } from "@/lib/db";
import {
  BRON_MAX,
  DOSSIER_STATUS_LABEL,
  DossierInvoer,
  OMVANG_MAX,
  SAMENVATTING_MAX,
  TITEL_MAX,
  TOELICHTING_MAX,
  TOT_RESULTAAT_MAX,
  aantalZichtbaarVoorLead,
  aantallPerSoort,
  brancheVan,
  datumKort,
  dossierBouwblokken,
  dossierVan,
  invoerVanItem,
  itemStatus,
  itemsInVolgorde,
  kanOpenZetten,
  leegDossierInvoer,
} from "@/lib/dossier";
import { kopNaam } from "@/lib/korte-namen";
import { Dossieritem, Organisatie } from "@/lib/types";

type Filter = "alles" | "case" | "nieuw";

/**
 * De kaart Dossier op het organisatie-detail (`dossier.md`, Scherm 1; `beheerpagina.md`, punt 4, Dossier): Onder de Kenmerken en de rij
 * Toegang en Afspraken, boven de KPI's. Met de schakelaar "Open voor Lead", een filter Alles, Cases en Nieuws, en per item een rij met een
 * statusbadge en de knop "Bewerken". Voor een Admin en voor een Consultant met toegang tot de Organisatie (`dossier.bewerken`). Het Bewerkslot
 * van de Organisatie geldt voor de hele pagina (`MetBewerkslot`).
 */
export function DossierKaart({ organisatie }: { organisatie: Organisatie }) {
  const gebruiker = useIngelogdeGebruiker();
  const alle = useOrganisaties();
  const { korteNamen } = useInstellingen();
  const kanBewerken = magDossierBewerken(gebruiker, organisatie);
  const dossier = dossierVan(organisatie);
  const [filter, setFilter] = useState<Filter>("alles");
  const [modal, setModal] = useState<"nieuw" | Dossieritem | null>(null);
  const [bevestigOpen, setBevestigOpen] = useState(false);

  const telling = aantallPerSoort(dossier.items);
  const zichtbaar = aantalZichtbaarVoorLead(organisatie, alle);
  const gefilterd = itemsInVolgorde(dossier.items).filter((i) => filter === "alles" || (filter === "case" ? i.soort === "case" : i.soort === "nieuws"));

  function wissel(aan: boolean) {
    if (aan) setBevestigOpen(true);
    else zetDossierOpen(organisatie.id, false);
  }

  return (
    <section className="beheer-kaart dos-kaart" aria-label="Dossier">
      <div className="dos-kop">
        <div className="titel-rij">
          <h2 style={{ margin: 0 }}>Dossier</h2>
          <InfoIcoon sleutel="info.dossier" />
        </div>
        <div className="dos-kop-rechts">
          <label className="dos-open">
            <input
              type="checkbox"
              checked={dossier.openVoorLead}
              disabled={!kanBewerken}
              onChange={(e) => wissel(e.target.checked)}
            />
            <span className="dos-open-label">Open voor Lead</span>
            {!dossier.openVoorLead && <span className="dos-open-stand">Niet gedeeld</span>}
          </label>
          {kanBewerken && (
            <button type="button" className="btn btn-or btn-compact" onClick={() => setModal("nieuw")}>
              + Toevoegen
            </button>
          )}
        </div>
      </div>

      <div className="dos-filter">
        <WeergaveWissel<Filter>
          ariaLabel="Soort item"
          waarde={filter}
          onChange={setFilter}
          opties={[
            { waarde: "alles", label: `Alles ${telling.alles}` },
            { waarde: "case", label: `Cases ${telling.cases}` },
            { waarde: "nieuw", label: `Nieuws ${telling.nieuws}` },
          ]}
        />
      </div>

      {dossier.items.length === 0 ? (
        <p className="kenmerken-leeg">Er staan nog geen items in het Dossier.</p>
      ) : gefilterd.length === 0 ? (
        <p className="kenmerken-leeg">Er staan geen items van deze soort in het Dossier.</p>
      ) : (
        <ul className="dos-lijst">
          {gefilterd.map((item) => (
            <ItemRij key={item.id} item={item} alle={alle} kanBewerken={kanBewerken} onBewerk={() => setModal(item)} korteNamen={korteNamen} />
          ))}
        </ul>
      )}

      <BevestigModal
        open={bevestigOpen}
        titel="Dossier openzetten"
        bevestigLabel="Openzetten"
        bevestigVariant="primair"
        bericht={
          zichtbaar > 0
            ? `Het Dossier wordt zichtbaar voor de Leads van ${organisatie.naam}. Ze zien ${zichtbaar} ${zichtbaar === 1 ? "item" : "items"}.`
            : `Het Dossier wordt zichtbaar voor de Leads van ${organisatie.naam}. Er staan nog geen items op Zichtbaar voor klant.`
        }
        onBevestigen={() => {
          zetDossierOpen(organisatie.id, true);
          setBevestigOpen(false);
        }}
        onAnnuleren={() => setBevestigOpen(false)}
      />
      {kanBewerken && modal && <DossierItemModal organisatie={organisatie} item={modal === "nieuw" ? null : modal} onSluit={() => setModal(null)} />}
    </section>
  );
}

function ItemRij({
  item,
  alle,
  kanBewerken,
  onBewerk,
  korteNamen,
}: {
  item: Dossieritem;
  alle: Organisatie[];
  kanBewerken: boolean;
  onBewerk: () => void;
  korteNamen: ReturnType<typeof useInstellingen>["korteNamen"];
}) {
  const isCase = item.soort === "case";
  const status = itemStatus(item, alle);
  const caseOrg = isCase ? alle.find((o) => o.id === item.caseOrganisatieId) : undefined;
  const regel = isCase
    ? [
        caseOrg ? kopNaam(caseOrg) : "",
        brancheVan(caseOrg, korteNamen).toLowerCase(),
        item.omvang ? `ongeveer ${item.omvang}` : "",
        item.totResultaat ? `resultaat in ${item.totResultaat}` : "",
      ]
        .filter(Boolean)
        .join(", ")
    : [item.bron, item.gepubliceerdOp ? datumKort(item.gepubliceerdOp) : ""].filter(Boolean).join(", ");
  return (
    <li className="dos-rij">
      <span className={`dos-icoon ${isCase ? "dos-icoon--case" : "dos-icoon--nieuws"}`} aria-hidden="true">
        {isCase ? <CaseIcoon width={26} height={26} /> : <NieuwsIcoon width={26} height={26} />}
      </span>
      <div className="dos-tekst">
        <span className={`dos-eyebrow ${isCase ? "dos-eyebrow--case" : "dos-eyebrow--nieuws"}`}>{isCase ? "Case" : "Nieuws"}</span>
        <h3 className="dos-titel">{item.titel}</h3>
        {regel && <span className="dos-regel">{regel}</span>}
        {item.toelichting && <span className="dos-toelichting">{item.toelichting}</span>}
      </div>
      <div className="dos-acties">
        <span className={`dos-status dos-status--${status}`}>{DOSSIER_STATUS_LABEL[status]}</span>
        {kanBewerken && (
          <button type="button" className="btn btn-outline btn-compact" onClick={onBewerk}>
            Bewerken
          </button>
        )}
      </div>
    </li>
  );
}

/**
 * Item toevoegen of bewerken (`dossier.md`, Scherm 3): Een modal van 640px met de soort (bij Bewerken vast), de velden van dat soort, de
 * chips "Gaat over bouwblokken" en de schakelaar Zichtbaar voor klant. Bij Bewerken staat links "Verwijderen" met een bevestiging.
 */
function DossierItemModal({ organisatie, item, onSluit }: { organisatie: Organisatie; item: Dossieritem | null; onSluit: () => void }) {
  const gebruiker = useIngelogdeGebruiker();
  const assessments = useAssessments();
  const alle = useOrganisaties();
  const { korteNamen } = useInstellingen();
  const [invoer, setInvoer] = useState<DossierInvoer>(item ? invoerVanItem(item) : leegDossierInvoer("nieuws"));
  const [fout, setFout] = useState<string | null>(null);
  const [bevestig, setBevestig] = useState(false);
  const bouwblokken = dossierBouwblokken(assessments);
  const isCase = invoer.soort === "case";

  const zet = (patch: Partial<DossierInvoer>) => {
    setInvoer((v) => ({ ...v, ...patch }));
    setFout(null);
  };

  // Welke Organisaties zijn te kiezen: Die met de Afspraak en die waar de Consultant toegang toe heeft (met "Geen toestemming" erbij).
  const keuzes = alle
    .filter((o) => o.id !== organisatie.id && (o.caseToegestaan === true || magDossierBewerken(gebruiker, o) || o.id === invoer.caseOrganisatieId))
    .sort((a, b) => a.naam.localeCompare(b.naam, "nl", { sensitivity: "base" }));
  const caseOrg = alle.find((o) => o.id === invoer.caseOrganisatieId);
  const reden = isCase ? kanOpenZetten(invoer, caseOrg) : null;
  const toestemming = isCase && caseOrg ? caseOrg.caseToegestaan === true : null;
  const branche = brancheVan(caseOrg, korteNamen);
  // Een item dat al open stond, mag open blijven; nieuw openzetten kan alleen als het mag.
  const schakelaarUit = reden !== null && !(item?.zichtbaarVoorLead && invoer.zichtbaarVoorLead);
  const kanCaseVlag = magCaseVlagZetten(gebruiker);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    const r = item ? wijzigDossieritem(organisatie.id, item.id, invoer) : voegDossieritemToe(organisatie.id, invoer);
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  function verwijder() {
    if (!item) return;
    const r = verwijderDossieritem(organisatie.id, item.id);
    if (!r.ok) {
      setBevestig(false);
      return setFout(r.reden);
    }
    onSluit();
  }

  function naarAfspraken() {
    onSluit();
    document.querySelector('[aria-label="Afspraken"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <OverzichtModal label={item ? "Item bewerken" : "Item toevoegen aan het Dossier"} onSluit={onSluit} escUitgeschakeld={bevestig} className="modal-box--dossier">
        <form onSubmit={opslaan}>
          <div className="overzicht-kop">
            <h2>{item ? "Item bewerken" : "Item toevoegen aan het Dossier"}</h2>
          </div>

          <div className="admin-field">
            <span className="dos-label">Soort</span>
            <WeergaveWissel<"nieuws" | "case">
              ariaLabel="Soort"
              waarde={invoer.soort}
              onChange={(soort) => zet({ soort })}
              opties={[
                { waarde: "nieuws", label: "Nieuws", disabled: !!item && item.soort !== "nieuws" },
                { waarde: "case", label: "Case", disabled: !!item && item.soort !== "case" },
              ]}
            />
          </div>

          <div className="admin-field">
            <label htmlFor="dos-titel">Titel</label>
            <input id="dos-titel" type="text" autoFocus maxLength={TITEL_MAX} value={invoer.titel} onChange={(e) => zet({ titel: e.target.value })} />
          </div>

          {isCase ? (
            <>
              <div className="admin-field">
                <label htmlFor="dos-samenvatting">Samenvatting</label>
                <textarea id="dos-samenvatting" rows={3} maxLength={SAMENVATTING_MAX} value={invoer.samenvatting} onChange={(e) => zet({ samenvatting: e.target.value })} />
                <span className="dos-hint">Noem de organisatie niet bij naam.</span>
              </div>
              <div className="admin-field">
                <label htmlFor="dos-case-org">Organisatie in de case</label>
                <select id="dos-case-org" value={invoer.caseOrganisatieId ?? ""} onChange={(e) => zet({ caseOrganisatieId: e.target.value || null })}>
                  <option value="">Kies een organisatie</option>
                  {keuzes.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.naam}
                      {o.caseToegestaan === true ? "" : " (Geen toestemming)"}
                    </option>
                  ))}
                </select>
                {caseOrg && toestemming && <p className="dos-paneel dos-paneel--groen">Toestemming staat vastgelegd bij de Afspraken van {caseOrg.naam}.</p>}
                {caseOrg && !toestemming && (
                  <p className="dos-paneel dos-paneel--oranje">
                    {caseOrg.naam} heeft de Afspraak &ldquo;Mag als case gebruikt worden&rdquo; niet. Zonder die toestemming kan deze case niet open voor de Lead.{" "}
                    {kanCaseVlag ? (
                      <button type="button" className="btn btn-outline btn-compact dos-paneel-knop" onClick={naarAfspraken}>
                        Naar Afspraken
                      </button>
                    ) : (
                      <strong>Vraag een Admin om &lsquo;Mag als case gebruikt worden&rsquo; aan te zetten.</strong>
                    )}
                  </p>
                )}
              </div>
              <div className="admin-field">
                <label htmlFor="dos-branche">Branche</label>
                <input id="dos-branche" type="text" readOnly value={branche} placeholder={caseOrg ? "" : "Volgt uit de organisatie in de case"} />
                <span className="dos-hint">
                  {caseOrg && !branche ? `Vul de Sector in bij de Kenmerken van ${caseOrg.naam}.` : "Uit de kenmerken van de organisatie."}
                </span>
              </div>
              <div className="dos-twee">
                <div className="admin-field">
                  <label htmlFor="dos-omvang">Omvang</label>
                  <input id="dos-omvang" type="text" maxLength={OMVANG_MAX} placeholder="800 medewerkers" value={invoer.omvang} onChange={(e) => zet({ omvang: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label htmlFor="dos-resultaat">Tot resultaat</label>
                  <input id="dos-resultaat" type="text" maxLength={TOT_RESULTAAT_MAX} placeholder="6 weken" value={invoer.totResultaat} onChange={(e) => zet({ totResultaat: e.target.value })} />
                </div>
              </div>
              <div className="admin-field">
                <label htmlFor="dos-url">Link naar de volledige case</label>
                <input id="dos-url" type="text" inputMode="url" placeholder="https://" value={invoer.url} onChange={(e) => zet({ url: e.target.value })} />
              </div>
            </>
          ) : (
            <>
              <div className="admin-field">
                <label htmlFor="dos-url">Link</label>
                <input id="dos-url" type="text" inputMode="url" placeholder="https://" value={invoer.url} onChange={(e) => zet({ url: e.target.value })} />
              </div>
              <div className="dos-twee">
                <div className="admin-field">
                  <label htmlFor="dos-bron">Bron</label>
                  <input id="dos-bron" type="text" maxLength={BRON_MAX} value={invoer.bron} onChange={(e) => zet({ bron: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label htmlFor="dos-datum">Datum</label>
                  <input id="dos-datum" type="date" value={invoer.gepubliceerdOp} onChange={(e) => zet({ gepubliceerdOp: e.target.value })} />
                </div>
              </div>
            </>
          )}

          <div className="admin-field">
            <label htmlFor="dos-toelichting">{isCase ? "Waarom dit voor jullie telt" : "Toelichting"}</label>
            <textarea id="dos-toelichting" rows={3} maxLength={TOELICHTING_MAX} value={invoer.toelichting} onChange={(e) => zet({ toelichting: e.target.value })} />
            <span className="dos-hint">De Lead leest deze tekst als je het item openzet.</span>
          </div>

          <div className="admin-field">
            <span className="dos-label">Gaat over bouwblokken (optioneel)</span>
            <div className="dos-chips">
              {bouwblokken.map(({ bouwblok, groepKleur }) => (
                <BouwblokChip
                  key={bouwblok.id}
                  volgnummer={bouwblok.volgnummer}
                  naam={bouwblok.naam}
                  groepKleur={groepKleur}
                  gekozen={invoer.bouwblokIds.includes(bouwblok.id)}
                  onClick={() =>
                    zet({
                      bouwblokIds: invoer.bouwblokIds.includes(bouwblok.id)
                        ? invoer.bouwblokIds.filter((id) => id !== bouwblok.id)
                        : [...invoer.bouwblokIds, bouwblok.id],
                    })
                  }
                />
              ))}
            </div>
            <span className="dos-hint">De Lead ziet de gekozen bouwblokken bij het item en kan in de radar op deze bouwblokken filteren.</span>
          </div>

          <div className={`dos-zichtbaar ${schakelaarUit ? "is-uit" : ""}`}>
            <label className="dos-open">
              <input
                type="checkbox"
                checked={invoer.zichtbaarVoorLead}
                disabled={schakelaarUit}
                onChange={(e) => zet({ zichtbaarVoorLead: e.target.checked })}
              />
              <span className="dos-open-label">{invoer.zichtbaarVoorLead ? "Zichtbaar voor klant" : "Alleen intern"}</span>
            </label>
            <span className="dos-hint">
              {schakelaarUit && reden
                ? reden
                : invoer.zichtbaarVoorLead
                  ? "De Lead ziet dit item zodra het Dossier open staat."
                  : "Alleen jij en je collega-consultants zien dit item."}
            </span>
          </div>

          {fout && (
            <p className="overzicht-melding fout" role="alert" style={{ marginTop: "var(--sp-3)" }}>
              {fout}
            </p>
          )}
          <div className="btn-rij" style={{ justifyContent: item ? "space-between" : "flex-end", flexWrap: "wrap", gap: "0.5rem" }}>
            {item && (
              <button type="button" className="btn btn-danger btn-compact" onClick={() => setBevestig(true)}>
                Verwijderen
              </button>
            )}
            <span className="knoppenrij">
              <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
                Annuleren
              </button>
              <button type="submit" className="btn btn-or btn-compact">
                Opslaan
              </button>
            </span>
          </div>
        </form>
      </OverzichtModal>
      <BevestigModal
        open={bevestig}
        titel="Item verwijderen"
        bericht={`"${item?.titel ?? ""}" wordt verwijderd uit het Dossier van ${organisatie.naam}. Dit kan niet ongedaan worden gemaakt.`}
        onBevestigen={verwijder}
        onAnnuleren={() => setBevestig(false)}
      />
    </>
  );
}
