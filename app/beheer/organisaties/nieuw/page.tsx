"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { maakOrganisatie } from "@/lib/db";
import { organisatieVelden } from "@/data/organisatie-velden";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";

export default function NieuweOrganisatiePage() {
  const router = useRouter();

  const [naam, setNaam] = useState("");
  const [kenmerken, setKenmerken] = useState<Record<string, unknown>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const organisatie = maakOrganisatie({ naam, kenmerken });
    router.push(`/beheer/organisaties/${organisatie.id}`);
  }

  return (
    <div className="admin-main">
      <Link href="/beheer/organisaties" className="admin-back">
        ← Organisaties
      </Link>
      <h1>Nieuwe organisatie</h1>
      <p className="text-sm text-ink-m">
        Een organisatie is niet langer aan één scan-type gebonden — welke scan(s) je hierbinnen
        plant, kies je zo op de organisatiepagina.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="admin-field">
          <label>Organisatienaam</label>
          <input type="text" required value={naam} onChange={(e) => setNaam(e.target.value)} />
        </div>

        {organisatieVelden.length > 0 && (
          <div className="mb-6">
            <h2>Organisatiekenmerken</h2>
            <KenmerkenForm velden={organisatieVelden} waarden={kenmerken} onChange={setKenmerken} />
          </div>
        )}

        <button type="submit" className="btn btn-or">
          Organisatie aanmaken
        </button>
      </form>
    </div>
  );
}
