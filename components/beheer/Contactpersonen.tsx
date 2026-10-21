"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { InfoIcoon } from "@/components/InfoIcoon";
import { LinkedInIcoon } from "@/components/icons/LinkedInIcoon";
import { voegContactpersoonToe, verwijderContactpersoon, wijzigContactpersoon } from "@/lib/db";
import { FUNCTIE_MAX, NAAM_MAX, NOTITIE_MAX, contactpersonenOpAlfabet } from "@/lib/contactpersonen";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magContactpersonenBewerken } from "@/lib/rechten";
import { Contactpersoon, Organisatie } from "@/lib/types";

/**
 * Contactpersonen bij de Kenmerken op het organisatie-detail (`beheerpagina.md`, punt 4, Contactpersonen): Een lijst onder het raster van de
 * Kenmerken. Alleen een Admin voegt toe, bewerkt en verwijdert (`contactpersonen.bewerken`, besloten op 20 oktober 2026): Een Consultant met
 * toegang tot de Organisatie ziet de lijst zonder de knoppen. "Bewerken" opent een basismodal met "Verwijderen". Een LinkedIn-profiel is een
 * link die in een nieuw tabblad opent. Het Bewerkslot van de Organisatie geldt voor de hele pagina (`MetBewerkslot`). Het nieuws dat hier
 * stond, staat sinds 20 oktober 2026 in het Dossier (`DossierKaart`).
 */
export function Contactpersonen({ organisatie }: { organisatie: Organisatie }) {
  const kanBewerken = magContactpersonenBewerken(useIngelogdeGebruiker());
  const contacten = contactpersonenOpAlfabet(organisatie.contactpersonen);
  const [contactModal, setContactModal] = useState<"nieuw" | Contactpersoon | null>(null);

  return (
    <div className="cn-rij">
      <section className="cn-sectie" aria-label="Contactpersonen">
        <div className="cn-kop">
          <div className="titel-rij">
            <h3>Contactpersonen</h3>
            <InfoIcoon sleutel="info.contactpersonen" />
          </div>
          {kanBewerken && (
            <button type="button" className="btn btn-outline btn-compact" onClick={() => setContactModal("nieuw")}>
              + Toevoegen
            </button>
          )}
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
                {kanBewerken && (
                  <button type="button" className="btn btn-outline btn-compact" onClick={() => setContactModal(c)}>
                    Bewerken
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {kanBewerken && contactModal && <ContactpersoonModal organisatie={organisatie} contactpersoon={contactModal === "nieuw" ? null : contactModal} onSluit={() => setContactModal(null)} />}
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
            <span className="text-xs" style={{ color: "var(--ink-s)" }}>
              Alleen zakelijke, openbaar vindbare informatie. Geen privégegevens.
            </span>
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
