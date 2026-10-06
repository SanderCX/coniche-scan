"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { maakGebruiker } from "@/lib/gebruikers-store";
import { kopieerNaarKlembord } from "@/lib/clipboard";
import { Gebruiker } from "@/lib/types";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magGebruikersBeheren } from "@/lib/rechten";
import { BeheerRol } from "@/lib/types";

/**
 * Aanmaken (beheerpagina.md punt 9): Naam, e-mail, rol. De Admin triggert het aanmaken en
 * het systeem genereert het wachtwoord. Een link waarmee de gebruiker zelf een wachtwoord
 * instelt volgt met de mailserver (backlog.md), dus hier **prototype-niveau**: Het
 * gegenereerde wachtwoord staat eenmalig in beeld, de Admin geeft het door.
 */
export default function NieuweGebruikerPage() {
  const router = useRouter();
  const ingelogd = useIngelogdeGebruiker();

  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<BeheerRol>("consultant");
  const [aangemaakt, setAangemaakt] = useState<Gebruiker | null>(null);
  const [gekopieerd, setGekopieerd] = useState<boolean | null>(null);

  if (!magGebruikersBeheren(ingelogd)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin kan gebruikers beheren.</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAangemaakt(maakGebruiker({ naam, email, rol }));
  }

  async function kopieer(wachtwoord: string) {
    setGekopieerd(await kopieerNaarKlembord(wachtwoord));
    setTimeout(() => setGekopieerd(null), 1600);
  }

  if (aangemaakt) {
    return (
      <div className="admin-main">
        <h1>Gebruiker aangemaakt</h1>
        <div className="admin-notice" style={{ maxWidth: "36rem" }}>
          <p>
            <strong>{aangemaakt.naam}</strong> ({aangemaakt.email}) kan nu inloggen. Geef dit wachtwoord door. Het staat
            alleen nu in beeld.
          </p>
          <div className="btn-rij" style={{ marginTop: "0.8rem", maxWidth: "24rem" }}>
            <input type="text" readOnly value={aangemaakt.wachtwoord} aria-label="Gegenereerd wachtwoord" style={{ flex: 2 }} />
            <button type="button" className="btn btn-outline btn-compact" onClick={() => kopieer(aangemaakt.wachtwoord)}>
              {gekopieerd === null ? "Kopieer" : gekopieerd ? "Gekopieerd!" : "Mislukt"}
            </button>
          </div>
        </div>
        <div className="btn-rij" style={{ marginTop: "1rem", maxWidth: "24rem" }}>
          <button type="button" className="btn btn-or btn-compact" onClick={() => router.push(`/beheer/gebruikers/${aangemaakt.id}`)}>
            Naar de gebruiker
          </button>
        </div>
      </div>
    );
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
        <button type="submit" className="btn btn-or">
          Gebruiker aanmaken
        </button>
      </form>
    </div>
  );
}
