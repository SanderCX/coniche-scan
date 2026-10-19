"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { KpiDefinitiesBeheer } from "@/components/beheer/KpiDefinitiesBeheer";
import { KorteNamenTabel } from "@/components/beheer/KorteNamenTabel";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magContentBeheren } from "@/lib/rechten";
import { organisatieVelden } from "@/data/organisatie-velden";
import { VeldDefinitie } from "@/lib/types";

type Weergave = "velden" | "kpis" | "korteNamen";

const TYPE_LABEL: Record<string, string> = {
  tekst: "Tekst",
  getal: "Getal",
  select: "Keuzelijst",
  "select-afhankelijk": "Keuzelijst, afhankelijk",
  "select-met-verdeling": "Keuzelijst met verdeling",
  percentage: "Percentage",
  groep: "Groep",
};

function VeldRijen({ velden, diepte }: { velden: VeldDefinitie[]; diepte: number }) {
  return (
    <>
      {velden.map((v) => (
        <FragmentRij key={v.id} veld={v} diepte={diepte} />
      ))}
    </>
  );
}

function FragmentRij({ veld, diepte }: { veld: VeldDefinitie; diepte: number }) {
  const aantalOpties = (veld.opties?.length ?? 0) + Object.values(veld.optiesPerWaarde ?? {}).reduce((n, l) => n + l.length, 0);
  return (
    <>
      <tr>
        <td style={{ paddingLeft: `${0.75 + diepte * 1.25}rem`, fontWeight: veld.type === "groep" ? 700 : 400 }}>{veld.label}</td>
        <td>{TYPE_LABEL[veld.type] ?? veld.type}</td>
        <td>{aantalOpties > 0 ? aantalOpties : ""}</td>
      </tr>
      {veld.subvelden && <VeldRijen velden={veld.subvelden} diepte={diepte + 1} />}
    </>
  );
}

/**
 * Organisatievelden (`beheerpagina.md`, punt 3), alleen een Admin (`content.beheren`). De schakelaar Velden | Korte namen: De
 * tweede weergave is de tabel met korte namen voor veldnamen en waarden. De weergave Velden toont de definitie nu alleen
 * lezend: De velden zijn vaste data (`data/organisatie-velden.ts`), een beheerscherm om ze te bewerken is er nog niet.
 */
export default function OrganisatieveldenPage() {
  const gebruiker = useIngelogdeGebruiker();
  const [weergave, setWeergave] = useState<Weergave>("korteNamen");

  if (!magContentBeheren(gebruiker)) {
    return (
      <div className="admin-main admin-main--breed">
        <p className="admin-notice">Geen toegang: alleen een Admin beheert de organisatievelden.</p>
      </div>
    );
  }

  return (
    <div className="admin-main admin-main--breed">
      <div className="titel-rij">
        <h1>Organisatievelden</h1>
        {weergave === "korteNamen" && <InfoIcoon sleutel="info.korteNamen" />}
      </div>
      <div className="vis-acties" style={{ margin: "0.8rem 0 1.2rem" }}>
        <WeergaveWissel<Weergave>
          ariaLabel="Weergave van de organisatievelden"
          opties={[
            { waarde: "velden", label: "Velden" },
            { waarde: "kpis", label: "KPI's en kanalen" },
            { waarde: "korteNamen", label: "Korte namen" },
          ]}
          waarde={weergave}
          onChange={setWeergave}
        />
      </div>

      {weergave === "kpis" ? (
        <KpiDefinitiesBeheer />
      ) : weergave === "korteNamen" ? (
        <KorteNamenTabel />
      ) : (
        <>
          <p className="text-sm text-ink-m">
            De definitie van de velden is vaste data en nog niet bewerkbaar in beheer. Wat hier staat, is wat Kenmerken in het
            organisatie-detail en de filters van Verkennen gebruiken.
          </p>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Veld</th>
                <th>Type</th>
                <th>Opties</th>
              </tr>
            </thead>
            <tbody>
              <VeldRijen velden={organisatieVelden} diepte={0} />
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
