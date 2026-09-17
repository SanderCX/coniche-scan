"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useAssessment } from "@/lib/assessment-store";
import { useOrganisatie, updateOrganisatie, nodigRespondentUit } from "@/lib/db";
import { verstuurUitnodiging } from "@/lib/mailer";
import { maakUitnodigingUrl } from "@/lib/uitnodiging-link";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";
import { Respondent } from "@/lib/types";
import { useTestModus } from "@/lib/instellingen";

const STATUS_LABEL: Record<Respondent["status"], string> = {
  uitgenodigd: "Uitgenodigd",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

function testUrl(respondent: Respondent): string {
  if (respondent.status === "afgerond") return `/scan/${respondent.id}/resultaten`;
  if (respondent.status === "bezig") return `/scan/${respondent.id}/doorloop`;
  return `/scan/${respondent.id}/intake`;
}

export default function ScanDetailPage({
  params,
}: {
  params: Promise<{ organisatieId: string }>;
}) {
  const { organisatieId } = use(params);
  const organisatie = useOrganisatie(organisatieId);
  const assessment = useAssessment(organisatie?.assessmentId ?? "");

  const [email, setEmail] = useState("");
  const [laatsteLink, setLaatsteLink] = useState<string | null>(null);
  const [laatsteLinkVerstuurd, setLaatsteLinkVerstuurd] = useState(false);
  const [gekopieerd, setGekopieerd] = useState(false);
  const [versturen, setVersturen] = useState(false);
  const testModus = useTestModus();

  if (!organisatie || !assessment) {
    return <p className="text-sm text-ink-m">Scan niet gevonden.</p>;
  }
  // Vastgezet na de guard hierboven, zodat de nested functies hieronder
  // (die TS niet automatisch herkent als na de guard aangeroepen) hem als
  // gegarandeerd aanwezig zien in plaats van `Organisatie | undefined`.
  const organisatieVast = organisatie;

  async function handleUitnodigen(e: React.FormEvent) {
    e.preventDefault();
    const respondent = nodigRespondentUit(organisatieId, email.trim());
    if (!respondent) return;
    const url = maakUitnodigingUrl(window.location.origin, organisatieVast, respondent);
    setVersturen(true);
    const verstuurd = await verstuurUitnodiging(email.trim(), url);
    setVersturen(false);
    setLaatsteLink(url);
    setLaatsteLinkVerstuurd(verstuurd);
    setEmail("");
    setGekopieerd(false);
  }

  function kopieerLink(url: string) {
    navigator.clipboard.writeText(url);
    setGekopieerd(true);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/beheer/scans" className="text-sm text-ink-m hover:text-ink">
        ← Alle scans
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-ink">{organisatie.naam}</h1>
      <p className="text-sm text-ink-m">{assessment.naam}</p>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">
          Respondent uitnodigen
        </h2>
        <form onSubmit={handleUitnodigen} className="flex gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="naam@organisatie.nl"
            className="flex-1 rounded-lg border border-gray-200 p-3 text-sm"
          />
          <button
            type="submit"
            disabled={versturen}
            className="rounded-lg bg-or px-5 py-2.5 text-sm font-semibold text-white hover:bg-or-l hover:-translate-y-px disabled:cursor-not-allowed disabled:bg-or-disabled disabled:hover:bg-or-disabled disabled:hover:translate-y-0"
          >
            {versturen ? "Versturen..." : "Uitnodigen"}
          </button>
        </form>
        {laatsteLink && !laatsteLinkVerstuurd && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-medium">
              Ontwikkelmodus — nog geen mailservice gekoppeld. Deel deze link handmatig:
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-white px-2 py-1 text-xs">
                {laatsteLink}
              </code>
              <button
                type="button"
                onClick={() => kopieerLink(laatsteLink)}
                className="rounded-lg border border-amber-400 px-3 py-1 text-xs font-medium hover:bg-amber-100"
              >
                {gekopieerd ? "Gekopieerd!" : "Kopieer"}
              </button>
            </div>
          </div>
        )}
        {laatsteLink && laatsteLinkVerstuurd && (
          <div className="mt-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
            Uitnodiging verstuurd. Je kunt de link ook nog handmatig kopiëren via de lijst
            hieronder.
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Respondenten</h2>
        {organisatie.respondenten.length === 0 && (
          <p className="text-sm text-ink-m">Nog geen respondenten uitgenodigd.</p>
        )}
        <ul className="divide-y divide-gray-100">
          {organisatie.respondenten.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-ink">{r.naam || r.email}</p>
                <p className="text-ink-m">{r.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    r.status === "afgerond"
                      ? "bg-green-100 text-green-700"
                      : r.status === "bezig"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-ink-m"
                  }`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    kopieerLink(maakUitnodigingUrl(window.location.origin, organisatie, r))
                  }
                  className="text-xs text-ink-m hover:text-ink"
                >
                  Kopieer link
                </button>
                {testModus && (
                  <button
                    type="button"
                    onClick={() => kopieerLink(`${window.location.origin}${testUrl(r)}`)}
                    title="Alleen werkzaam zolang test-modus aanstaat (zie Dashboard)"
                    className="text-xs text-or hover:underline"
                  >
                    Kopieer testlink
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Organisatiekenmerken</h2>
        {assessment.organisatieVelden.length === 0 ? (
          <p className="text-sm text-ink-m">Geen organisatievelden gedefinieerd.</p>
        ) : (
          <KenmerkenForm
            velden={assessment.organisatieVelden}
            waarden={organisatie.kenmerken}
            onChange={(kenmerken) =>
              updateOrganisatie(organisatieId, (o) => ({ ...o, kenmerken }))
            }
          />
        )}
      </section>
    </div>
  );
}
