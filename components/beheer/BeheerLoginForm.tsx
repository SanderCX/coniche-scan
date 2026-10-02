"use client";

import { useState } from "react";
import { login } from "@/lib/admin-auth";
import { BeheerRol } from "@/lib/types";
import { ROL_KLEUR } from "@/lib/colors";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const BEHEER_ROLLEN: BeheerRol[] = ["admin", "consultant"];

export function BeheerLoginForm() {
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [rol, setRol] = useState<BeheerRol>("admin");
  const [fout, setFout] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(email, wachtwoord, rol)) {
      setFout("Onjuiste inloggegevens, of dit account heeft niet de gekozen rol.");
    }
  }

  return (
    <>
      <SiteHeader badge="Beheer" />
      <main className="flex-1">
        <div className="container section" style={{ maxWidth: "24rem" }}>
          <h1 style={{ fontSize: "1.5rem" }}>Coniche Scan — Beheer</h1>
          <p>
            Prototype-inlog voor Joost en Sander. Nog geen 2FA — zie beheerpagina.md voor
            de vervolgstap.
          </p>
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="field">
              <label>E-mailadres</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Wachtwoord</label>
              <input
                type="password"
                required
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Rol</label>
              <select value={rol} onChange={(e) => setRol(e.target.value as BeheerRol)}>
                {BEHEER_ROLLEN.map((r) => (
                  <option key={r} value={r}>
                    {ROL_KLEUR[r].label}
                  </option>
                ))}
              </select>
            </div>
            {fout && <p className="text-sm text-stat-red">{fout}</p>}
            <button type="submit" className="btn btn-or" style={{ width: "100%" }}>
              Inloggen
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
