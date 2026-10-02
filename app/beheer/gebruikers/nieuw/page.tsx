"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { maakGebruiker } from "@/lib/gebruikers-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magGebruikersBeheren } from "@/lib/rechten";
import { BeheerRol } from "@/lib/types";

/**
 * Aanmaken (beheerpagina.md punt 9): Naam, e-mail, rol. De spec zegt
 * "Wachtwoord stelt de gebruiker zelf in via een link" — dat vereist de
 * mailserver die er nog niet is (backlog.md), dus hier **prototype-niveau**:
 * de Admin geeft direct een tijdelijk wachtwoord mee, net zoals
 * `lib/admin-auth.ts` dat al voor het bestaande account doet.
 */
export default function NieuweGebruikerPage() {
  const router = useRouter();
  const ingelogd = useIngelogdeGebruiker();

  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [rol, setRol] = useState<BeheerRol>("consultant");

  if (!magGebruikersBeheren(ingelogd)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin kan gebruikers beheren.</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const gebruiker = maakGebruiker({ naam, email, wachtwoord, rol });
    router.push(`/beheer/gebruikers/${gebruiker.id}`);
  }

  return (
    <div className="admin-main">
      <Link href="/beheer/gebruikers" className="admin-back">
        ← Gebruikers
      </Link>
      <h1>Nieuwe gebruiker</h1>

      <form onSubmit={handleSubmit}>
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
          <label>Tijdelijk wachtwoord</label>
          <input
            type="text"
            required
            minLength={6}
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
          />
          <p className="text-sm text-ink-m">
            Prototype-invoer: geef dit door aan de nieuwe gebruiker. Zelf instellen via een
            link volgt met de mailserver (backlog.md).
          </p>
        </div>

        <button type="submit" className="btn btn-or">
          Gebruiker aanmaken
        </button>
      </form>
    </div>
  );
}
