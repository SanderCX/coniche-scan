"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  useGebruiker,
  useGebruikers,
  updateGebruiker,
  kanDeactiveren,
  deactiveerGebruiker,
  heractiveerGebruiker,
} from "@/lib/gebruikers-store";
import { useOrganisaties, zetOrganisatiesOver } from "@/lib/db";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magGebruikersBeheren } from "@/lib/rechten";
import { BeheerRol } from "@/lib/types";
import { normaliseerEmail } from "@/lib/email";

/**
 * Wijzigen + deactiveren (beheerpagina.md punt 9). Deactiveren is
 * geblokkeerd zolang dit de laatste actieve Admin is (`kanDeactiveren`,
 * `lib/gebruikers-store.ts`). Deactiveert dit een Consultant met eigen
 * organisaties, dan is "eigenaarschap overzetten" verplicht vóórdat
 * deactiveren definitief is: De modal toont dan een keuze uit de overige
 * actieve gebruikers, en zet pas daarna `Organisatie.aangemaaktDoor` om.
 *
 * Heractiveren staat niet letterlijk zo in de spec (die noemt alleen
 * deactiveren), maar zonder een weg terug zou een deactivering nooit meer
 * ongedaan te maken zijn — een kleine, veilige aanvulling.
 */
export default function GebruikerDetailPage({
  params,
}: {
  params: Promise<{ gebruikerId: string }>;
}) {
  const { gebruikerId } = use(params);
  const ingelogd = useIngelogdeGebruiker();
  const gebruiker = useGebruiker(gebruikerId);
  const alleGebruikers = useGebruikers();
  const organisaties = useOrganisaties();

  const [naam, setNaam] = useState(gebruiker?.naam ?? "");
  const [email, setEmail] = useState(gebruiker?.email ?? "");
  const [rol, setRol] = useState<BeheerRol>(gebruiker?.rol ?? "consultant");
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState("");
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [deactiverenOpen, setDeactiverenOpen] = useState(false);
  const [overzettenNaar, setOverzettenNaar] = useState("");

  if (!magGebruikersBeheren(ingelogd)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin kan gebruikers beheren.</p>
      </div>
    );
  }
  if (!gebruiker) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Gebruiker niet gevonden.</p>
      </div>
    );
  }

  const eigenOrganisaties = organisaties.filter((o) => o.aangemaaktDoor === gebruiker.id);
  const deactiveerCheck = kanDeactiveren(gebruiker.id);
  const overzetKandidaten = alleGebruikers.filter((g) => g.actief && g.id !== gebruiker.id);

  function handleOpslaan(e: React.FormEvent) {
    e.preventDefault();
    updateGebruiker(gebruiker!.id, (g) => ({
      ...g,
      naam,
      email: normaliseerEmail(email),
      rol,
      wachtwoord: nieuwWachtwoord ? nieuwWachtwoord : g.wachtwoord,
    }));
    setNieuwWachtwoord("");
    setOpgeslagen(true);
    setTimeout(() => setOpgeslagen(false), 2000);
  }

  function handleDeactiveren() {
    if (eigenOrganisaties.length > 0) {
      if (!overzettenNaar) return;
      zetOrganisatiesOver(gebruiker!.id, overzettenNaar);
    }
    const res = deactiveerGebruiker(gebruiker!.id);
    if (res.ok) {
      setDeactiverenOpen(false);
      setOverzettenNaar("");
    }
  }

  return (
    <div className="admin-main">
      <Link href="/beheer/gebruikers" className="admin-back">
        ← Gebruikers
      </Link>
      <div className="flex items-center justify-between">
        <h1>{gebruiker.naam}</h1>
        <span
          className={`admin-badge ${gebruiker.actief ? "status-actief" : "status-gedeactiveerd"}`}
        >
          {gebruiker.actief ? "Actief" : "Gedeactiveerd"}
        </span>
      </div>

      <form onSubmit={handleOpslaan}>
        <div className="admin-field">
          <label>Naam</label>
          <input type="text" required value={naam} onChange={(e) => setNaam(e.target.value)} />
        </div>
        <div className="admin-field">
          <label>E-mailadres</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label>Rol</label>
          <select value={rol} onChange={(e) => setRol(e.target.value as BeheerRol)}>
            <option value="admin">Admin</option>
            <option value="consultant">Consultant</option>
          </select>
        </div>
        <div className="admin-field">
          <label>Nieuw wachtwoord (optioneel)</label>
          <input
            type="text"
            minLength={6}
            value={nieuwWachtwoord}
            onChange={(e) => setNieuwWachtwoord(e.target.value)}
            placeholder="Laat leeg om het huidige wachtwoord te behouden"
          />
        </div>
        <div className="btn-rij" style={{ maxWidth: "22rem" }}>
          <button type="submit" className="btn btn-or">
            Opslaan
          </button>
          {opgeslagen && <span className="text-sm text-stat-green">Opgeslagen ✓</span>}
        </div>
      </form>

      <div className="mt-8">
        {gebruiker.actief ? (
          <>
            <button
              type="button"
              className="btn btn-danger"
              disabled={!deactiveerCheck.ok}
              title={!deactiveerCheck.ok ? deactiveerCheck.reden : undefined}
              onClick={() => setDeactiverenOpen(true)}
            >
              Deactiveren
            </button>
            {!deactiveerCheck.ok && (
              <p className="mt-2 text-sm text-stat-red">{deactiveerCheck.reden}</p>
            )}
          </>
        ) : (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => heractiveerGebruiker(gebruiker!.id)}
          >
            Heractiveren
          </button>
        )}
      </div>

      {deactiverenOpen && (
        <div className="modal-overlay" onClick={() => setDeactiverenOpen(false)} role="alertdialog" aria-modal="true">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-ink">Gebruiker deactiveren</h2>
            {eigenOrganisaties.length > 0 ? (
              <>
                <p className="text-sm leading-relaxed text-ink-m" style={{ marginBottom: "1rem" }}>
                  {gebruiker.naam} heeft {eigenOrganisaties.length} organisatie(s) aangemaakt.
                  Kies aan wie het eigenaarschap overgaat voordat je deactiveert — anders verliest
                  niemand meer toegang tot die organisaties via het bereik &ldquo;aangemaakt&rdquo;.
                </p>
                <div className="admin-field">
                  <label>Nieuwe eigenaar</label>
                  <select value={overzettenNaar} onChange={(e) => setOverzettenNaar(e.target.value)}>
                    <option value="">Kies...</option>
                    {overzetKandidaten.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.naam} ({g.rol === "admin" ? "Admin" : "Consultant"})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-ink-m" style={{ marginBottom: "1.5rem" }}>
                {gebruiker.naam} deactiveren? Dit kan later ongedaan gemaakt worden via
                &ldquo;Heractiveren&rdquo;.
              </p>
            )}
            <div className="btn-rij">
              <button type="button" className="btn btn-outline" onClick={() => setDeactiverenOpen(false)}>
                Annuleren
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={eigenOrganisaties.length > 0 && !overzettenNaar}
                onClick={handleDeactiveren}
              >
                Deactiveren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
