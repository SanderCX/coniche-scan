"use client";

import { useState } from "react";
import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useTestModus, zetTestModus } from "@/lib/instellingen";
import { maakPubliekeLink } from "@/lib/uitnodiging-link";

const TEST_KLANT_ID = "resp-testklant";

export default function BeheerDashboard() {
  const assessments = useAssessments();
  const organisaties = useOrganisaties();
  const testModus = useTestModus();
  const [gekopieerd, setGekopieerd] = useState(false);
  const alleRespondenten = organisaties.flatMap((o) => o.respondenten);

  const testKlant = organisaties
    .flatMap((o) => o.respondenten.map((r) => ({ organisatie: o, respondent: r })))
    .find((r) => r.respondent.id === TEST_KLANT_ID);

  const stats = [
    { label: "Assessment-types", waarde: assessments.length, href: "/beheer/content" },
    { label: "Organisaties", waarde: organisaties.length, href: "/beheer/organisaties" },
    { label: "Respondenten totaal", waarde: alleRespondenten.length, href: "/beheer/scans" },
    {
      label: "Respondenten afgerond",
      waarde: alleRespondenten.filter((r) => r.status === "afgerond").length,
      href: "/beheer/scans",
    },
  ];

  function kopieerTestLink() {
    if (!testKlant) return;
    navigator.clipboard.writeText(
      maakPubliekeLink(window.location.origin, testKlant.organisatie, testKlant.respondent)
    );
    setGekopieerd(true);
    setTimeout(() => setGekopieerd(false), 1600);
  }

  return (
    <div className="admin-main">
      <h1>Dashboard</h1>
      <p>Overzicht van scans en content.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card">
            <p className="text-3xl font-bold text-ink">{s.waarde}</p>
            <p className="mt-1 text-sm text-ink-s">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 btn-rij" style={{ maxWidth: "26rem" }}>
        <Link href="/beheer/organisaties/nieuw" className="btn btn-or">
          Nieuwe organisatie
        </Link>
        <Link href="/beheer/content" className="btn btn-outline">
          Content beheren
        </Link>
      </div>

      <div className="admin-notice mt-10" style={{ maxWidth: "36rem" }}>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={testModus}
            onChange={(e) => zetTestModus(e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="block font-semibold text-ink">Test-modus: inloggen overslaan</span>
            <span className="mt-0.5 block text-sm text-ink-m">
              Staat dit aan, dan is Beheer direct open zonder e-mail+wachtwoord — handig om snel
              te testen en de vragenlijsten door te ontwikkelen. Zet uit voor een realistische
              test van de inlogflow.
            </span>
          </span>
        </label>

        {testKlant && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium text-ink">
              Testklant: {testKlant.organisatie.naam} ({testKlant.respondent.email})
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" onClick={kopieerTestLink} className="btn btn-outline btn-compact">
                {gekopieerd ? "Gekopieerd!" : "Kopieer publieke link"}
              </button>
              <Link
                href={`/beheer/organisaties/${testKlant.organisatie.id}`}
                className="text-sm text-ink-m hover:text-ink"
              >
                Bekijk in Organisaties →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
