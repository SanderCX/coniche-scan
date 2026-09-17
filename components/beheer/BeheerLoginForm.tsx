"use client";

import { useState } from "react";
import { login } from "@/lib/admin-auth";

export function BeheerLoginForm() {
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(email, wachtwoord)) {
      setFout("Onjuiste inloggegevens.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm flex-1 px-6 py-24">
      <h1 className="text-xl font-bold text-ink">Coniche Scan — Beheer</h1>
      <p className="mt-2 text-sm text-muted">
        Prototype-inlog voor Joost en Sander. Nog geen 2FA — zie admin-beheerpagina.md
        voor de vervolgstap.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">E-mailadres</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Wachtwoord</label>
          <input
            type="password"
            required
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        {fout && <p className="text-sm text-red-600">{fout}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:brightness-90"
        >
          Inloggen
        </button>
      </form>
    </div>
  );
}
