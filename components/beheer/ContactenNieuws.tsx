"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { InfoIcoon } from "@/components/InfoIcoon";
import { LinkedInIcoon } from "@/components/icons/LinkedInIcoon";
import {
  voegContactpersoonToe,
  voegNieuwsartikelToe,
  verwijderContactpersoon,
  verwijderNieuwsartikel,
  wijzigContactpersoon,
  wijzigNieuwsartikel,
} from "@/lib/db";
import {
  BRON_MAX,
  FUNCTIE_MAX,
  NAAM_MAX,
  NOTITIE_MAX,
  TITEL_MAX,
  contactpersonenOpAlfabet,
  nieuwsNieuwsteEerst,
} from "@/lib/contacten-nieuws";
import { Contactpersoon, Nieuwsartikel, Organisatie } from "@/lib/types";

/** Een datum jjjj-mm-dd als "14 okt 2026". */
function datumTekst(d: string): string {
  const datum = new Date(`${d}T00:00:00Z`);
  return Number.isNaN(datum.getTime()) ? d : datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/**
 * Contactpersonen en Nieuws bij de Kenmerken op het organisatie-detail (`beheerpagina.md`, punt 4, Contactpersonen en Nieuws): Twee lijsten naast
 * elkaar onder het raster van de Kenmerken. Een Admin en een Consultant met toegang tot de Organisatie voegen toe en bewerken
 * (`organisaties.bewerken`), "Bewerken" opent een basismodal met "Verwijderen". Een LinkedIn-profiel en een artikel zijn links die
 * in een nieuw tabblad openen. Het Bewerkslot van de Organisatie geldt voor de hele pagina (`MetBewerkslot`).
 */
export function ContactenNieuws({ organisatie }: { organisatie: Organisatie }) {
  const contacten = contactpersonenOpAlfabet(organisatie.contactpersonen);
  const nieuws = nieuwsNieuwsteEerst(organisatie.nieuwsartikelen);
  const [contactModal, setContactModal] = useState<"nieuw" | Contactpersoon | null>(null);
  const [nieuwsModal, setNieuwsModal] = useState<"nieuw" | Nieuwsartikel | null>(null);

  return (
    <div className="cn-rij">
      <section className="cn-sectie" aria-label="Contactpersonen">
        <div className="cn-kop">
          <div className="titel-rij">
            <h3>Contactpersonen</h3>
            <InfoIcoon sleutel="info.contactpersonen" />
          </div>
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setContactModal("nieuw")}>
            + Toevoegen
          </button>
        </div>
        {contacten.length === 0 ? (
          <p className="kenmerken-leeg">Er zijn nog geen contactpersonen toegevoegd.</p>
        ) : (
          <ul className="cn-lijst">
            {contacten.map((c) => (
              <li key={c.id} className="cn-item">
                <div className="cn-tekst">
                  <span className="cn-naamrij">
                    <span className="cn-titel">{c.naam}</span>
                    {c.linkedinUrl && (
                      <a
                        href={c.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cn-linkedin"
                        aria-label={`LinkedIn-profiel van ${c.naam}`}
                        title="LinkedIn-profiel"
                      >
                        <LinkedInIcoon width={18} height={18} />
                      </a>
                    )}
                  </span>
                  {c.functie && <span className="cn-sub">{c.functie}</span>}
                  {c.notitie && <span className="cn-notitie">{c.notitie}</span>}
                </div>
                <button type="button" className="btn btn-outline btn-compact" onClick={() => setContactModal(c)}>
                  Bewerken
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cn-sectie" aria-label="Nieuws">
        <div className="cn-kop">
          <div className="titel-rij">
            <h3>Nieuws</h3>
            <InfoIcoon sleutel="info.nieuwsartikelen" />
          </div>
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setNieuwsModal("nieuw")}>
            + Toevoegen
          </button>
        </div>
        {nieuws.length === 0 ? (
          <p className="kenmerken-leeg">Er zijn nog geen nieuwsartikelen toegevoegd.</p>
        ) : (
          <ul className="cn-lijst">
            {nieuws.map((n) => (
              <li key={n.id} className="cn-item">
                <div className="cn-tekst">
                  <a href={n.url} target="_blank" rel="noopener noreferrer" className="tekst-link cn-titel">
                    {n.titel}
                  </a>
                  {(n.bron || n.gepubliceerdOp) && (
                    <span className="cn-sub">{[n.bron, n.gepubliceerdOp ? datumTekst(n.gepubliceerdOp) : ""].filter(Boolean).join(" · ")}</span>
                  )}
                  {n.notitie && <span className="cn-notitie">{n.notitie}</span>}
                </div>
                <button type="button" className="btn btn-outline btn-compact" onClick={() => setNieuwsModal(n)}>
                  Bewerken
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {contactModal && <ContactpersoonModal organisatie={organisatie} contactpersoon={contactModal === "nieuw" ? null : contactModal} onSluit={() => setContactModal(null)} />}
      {nieuwsModal && <NieuwsartikelModal organisatie={organisatie} nieuwsartikel={nieuwsModal === "nieuw" ? null : nieuwsModal} onSluit={() => setNieuwsModal(null)} />}
    </div>
  );
}

function ContactpersoonModal({ organisatie, contactpersoon, onSluit }: { organisatie: Organisatie; contactpersoon: Contactpersoon | null; onSluit: () => void }) {
  const [naam, setNaam] = useState(contactpersoon?.naam ?? "");
  const [functie, setFunctie] = useState(contactpersoon?.functie ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(contactpersoon?.linkedinUrl ?? "");
  const [notitie, setNotitie] = useState(contactpersoon?.notitie ?? "");
  const [fout, setFout] = useState<string | null>(null);
  const [bevestig, setBevestig] = useState(false);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    const invoer = { naam, functie, linkedinUrl, notitie };
    const r = contactpersoon ? wijzigContactpersoon(organisatie.id, contactpersoon.id, invoer) : voegContactpersoonToe(organisatie.id, invoer);
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  function verwijder() {
    if (!contactpersoon) return;
    const r = verwijderContactpersoon(organisatie.id, contactpersoon.id);
    if (!r.ok) {
      setBevestig(false);
      return setFout(r.reden);
    }
    onSluit();
  }

  return (
    <>
      <Modal open onClose={onSluit} title={contactpersoon ? "Contactpersoon bewerken" : "Contactpersoon toevoegen"}>
        <form onSubmit={opslaan}>
          <div className="admin-field">
            <label htmlFor="cp-naam">Naam</label>
            <input id="cp-naam" type="text" autoFocus maxLength={NAAM_MAX} value={naam} onChange={(e) => { setNaam(e.target.value); setFout(null); }} />
          </div>
          <div className="admin-field">
            <label htmlFor="cp-functie">Functie</label>
            <input id="cp-functie" type="text" maxLength={FUNCTIE_MAX} value={functie} onChange={(e) => setFunctie(e.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="cp-linkedin">LinkedIn-profiel</label>
            <input
              id="cp-linkedin"
              type="text"
              inputMode="url"
              placeholder="https://www.linkedin.com/in/naam"
              value={linkedinUrl}
              onChange={(e) => { setLinkedinUrl(e.target.value); setFout(null); }}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="cp-notitie">Notitie</label>
            <textarea id="cp-notitie" rows={3} maxLength={NOTITIE_MAX} value={notitie} onChange={(e) => setNotitie(e.target.value)} />
          </div>
          {fout && (
            <p className="overzicht-melding fout" role="alert" style={{ marginTop: "var(--sp-3)" }}>
              {fout}
            </p>
          )}
          <div className="btn-rij" style={{ justifyContent: contactpersoon ? "space-between" : "flex-end", flexWrap: "wrap", gap: "0.5rem" }}>
            {contactpersoon && (
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
      </Modal>
      <BevestigModal
        open={bevestig}
        titel="Contactpersoon verwijderen"
        bericht={`${contactpersoon?.naam ?? "De contactpersoon"} wordt verwijderd bij ${organisatie.naam}. Dit kan niet ongedaan worden gemaakt.`}
        onBevestigen={verwijder}
        onAnnuleren={() => setBevestig(false)}
      />
    </>
  );
}

function NieuwsartikelModal({ organisatie, nieuwsartikel, onSluit }: { organisatie: Organisatie; nieuwsartikel: Nieuwsartikel | null; onSluit: () => void }) {
  const [titel, setTitel] = useState(nieuwsartikel?.titel ?? "");
  const [url, setUrl] = useState(nieuwsartikel?.url ?? "");
  const [bron, setBron] = useState(nieuwsartikel?.bron ?? "");
  const [gepubliceerdOp, setGepubliceerdOp] = useState(nieuwsartikel?.gepubliceerdOp ?? "");
  const [notitie, setNotitie] = useState(nieuwsartikel?.notitie ?? "");
  const [fout, setFout] = useState<string | null>(null);
  const [bevestig, setBevestig] = useState(false);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    const invoer = { titel, url, bron, gepubliceerdOp, notitie };
    const r = nieuwsartikel ? wijzigNieuwsartikel(organisatie.id, nieuwsartikel.id, invoer) : voegNieuwsartikelToe(organisatie.id, invoer);
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  function verwijder() {
    if (!nieuwsartikel) return;
    const r = verwijderNieuwsartikel(organisatie.id, nieuwsartikel.id);
    if (!r.ok) {
      setBevestig(false);
      return setFout(r.reden);
    }
    onSluit();
  }

  return (
    <>
      <Modal open onClose={onSluit} title={nieuwsartikel ? "Nieuwsartikel bewerken" : "Nieuwsartikel toevoegen"}>
        <form onSubmit={opslaan}>
          <div className="admin-field">
            <label htmlFor="na-titel">Titel</label>
            <input id="na-titel" type="text" autoFocus maxLength={TITEL_MAX} value={titel} onChange={(e) => { setTitel(e.target.value); setFout(null); }} />
          </div>
          <div className="admin-field">
            <label htmlFor="na-url">Link</label>
            <input id="na-url" type="text" inputMode="url" placeholder="https://" value={url} onChange={(e) => { setUrl(e.target.value); setFout(null); }} />
          </div>
          <div className="admin-field">
            <label htmlFor="na-bron">Bron</label>
            <input id="na-bron" type="text" maxLength={BRON_MAX} value={bron} onChange={(e) => setBron(e.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="na-datum">Datum</label>
            <input id="na-datum" type="date" value={gepubliceerdOp} onChange={(e) => { setGepubliceerdOp(e.target.value); setFout(null); }} />
          </div>
          <div className="admin-field">
            <label htmlFor="na-notitie">Notitie</label>
            <textarea id="na-notitie" rows={3} maxLength={NOTITIE_MAX} value={notitie} onChange={(e) => setNotitie(e.target.value)} />
          </div>
          {fout && (
            <p className="overzicht-melding fout" role="alert" style={{ marginTop: "var(--sp-3)" }}>
              {fout}
            </p>
          )}
          <div className="btn-rij" style={{ justifyContent: nieuwsartikel ? "space-between" : "flex-end", flexWrap: "wrap", gap: "0.5rem" }}>
            {nieuwsartikel && (
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
      </Modal>
      <BevestigModal
        open={bevestig}
        titel="Nieuwsartikel verwijderen"
        bericht={`Het artikel "${nieuwsartikel?.titel ?? ""}" wordt verwijderd bij ${organisatie.naam}. Dit kan niet ongedaan worden gemaakt.`}
        onBevestigen={verwijder}
        onAnnuleren={() => setBevestig(false)}
      />
    </>
  );
}
