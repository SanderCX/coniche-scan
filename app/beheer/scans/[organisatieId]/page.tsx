"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useAssessment } from "@/lib/assessment-store";
import { useOrganisatie, updateOrganisatie, nodigRespondentUit } from "@/lib/db";
import { verstuurUitnodiging } from "@/lib/mailer";
import { KenmerkenForm } from "@/components/beheer/KenmerkenForm";
import { Respondent } from "@/lib/types";

const STATUS_LABEL: Record<Respondent["status"], string> = {
  uitgenodigd: "Uitgenodigd",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

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
  const [gekopieerd, setGekopieerd] = useState(false);

  if (!organisatie || !assessment) {
    return <p className="text-sm text-slate-500">Scan niet gevonden.</p>;
  }

  function handleUitnodigen(e: React.FormEvent) {
    e.preventDefault();
    const respondent = nodigRespondentUit(organisatieId, email.trim());
    if (!respondent) return;
    const url = `${window.location.origin}/uitnodiging/${respondent.id}`;
    verstuurUitnodiging(email.trim(), url);
    setLaatsteLink(url);
    setEmail("");
    setGekopieerd(false);
  }

  function kopieerLink(url: string) {
    navigator.clipboard.writeText(url);
    setGekopieerd(true);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/beheer/scans" className="text-sm text-slate-400 hover:text-slate-600">
        ← Alle scans
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{organisatie.naam}</h1>
      <p className="text-sm text-slate-500">{assessment.naam}</p>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Respondent uitnodigen
        </h2>
        <form onSubmit={handleUitnodigen} className="flex gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="naam@organisatie.nl"
            className="flex-1 rounded-lg border border-slate-200 p-3 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Uitnodigen
          </button>
        </form>
        {laatsteLink && (
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
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Respondenten</h2>
        {organisatie.respondenten.length === 0 && (
          <p className="text-sm text-slate-500">Nog geen respondenten uitgenodigd.</p>
        )}
        <ul className="divide-y divide-slate-100">
          {organisatie.respondenten.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">{r.naam || r.email}</p>
                <p className="text-slate-500">{r.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    r.status === "afgerond"
                      ? "bg-green-100 text-green-700"
                      : r.status === "bezig"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
                <button
                  type="button"
                  onClick={() => kopieerLink(`${window.location.origin}/uitnodiging/${r.id}`)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  Kopieer link
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Organisatiekenmerken</h2>
        {assessment.organisatieVelden.length === 0 ? (
          <p className="text-sm text-slate-500">Geen organisatievelden gedefinieerd.</p>
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
