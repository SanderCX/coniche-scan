"use client";

import { useState } from "react";
import { PageWithChrome } from "@/components/PageWithChrome";

/**
 * Scherm 4a, "Toegang" (CLAUDE.md sectie 3): publiek, geen inlog nodig.
 * Bestemming van "Inloggen" op scherm 1, en straks van "Uitloggen" vanuit
 * het "Mijn gegevens"-menu. Nu een niet-functionele voorkant: geen
 * daadwerkelijke code/link wordt verstuurd, dat vraagt de
 * Coniche-mailserver (`backlog.md`). Altijd dezelfde, neutrale
 * bevestigingstekst, ongeacht of het adres bestaat.
 */
export default function ToegangPage() {
  const [email, setEmail] = useState("");
  const [verstuurd, setVerstuurd] = useState(false);

  function handleVersturen(e: React.FormEvent) {
    e.preventDefault();
    setVerstuurd(true);
  }

  return (
    <PageWithChrome>
      <div className="container section" style={{ maxWidth: "28rem" }}>
        <span className="eyebrow">Toegang</span>
        <h1>Toegang tot je meting</h1>

        {verstuurd ? (
          <p className="mt-4">
            Als dit e-mailadres bekend is, ontvang je een nieuwe toegangslink.
          </p>
        ) : (
          <>
            <p className="mt-4">
              Vul het e-mailadres in waarmee je bent uitgenodigd. Ben je die persoonlijke link
              kwijt, dan sturen we je een nieuwe.
            </p>
            <form onSubmit={handleVersturen} className="flex gap-3 mt-6">
              <div className="admin-field flex-1" style={{ marginBottom: 0 }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@organisatie.nl"
                />
              </div>
              <button type="submit" className="btn btn-or btn-compact">
                Versturen
              </button>
            </form>
          </>
        )}
      </div>
    </PageWithChrome>
  );
}
