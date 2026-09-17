"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRespondent } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import {
  controleerCode,
  isGeverifieerd,
  stuurVerificatiecode,
} from "@/lib/verificatie";

function volgendeUrl(respondentId: string, status: string): string {
  if (status === "afgerond") return `/scan/${respondentId}/resultaten`;
  if (status === "bezig") return `/scan/${respondentId}/doorloop`;
  return `/scan/${respondentId}/intake`;
}

export default function UitnodigingPage({
  params,
}: {
  params: Promise<{ respondentId: string }>;
}) {
  const { respondentId } = use(params);
  const gegevens = useRespondent(respondentId);
  const assessment = useAssessment(gegevens?.organisatie.assessmentId ?? "");
  const router = useRouter();

  const [stap, setStap] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [versturen, setVersturen] = useState(false);

  useEffect(() => {
    if (gegevens && isGeverifieerd(respondentId)) {
      router.replace(volgendeUrl(respondentId, gegevens.respondent.status));
    }
  }, [gegevens, respondentId, router]);

  if (!gegevens) {
    return (
      <div className="mx-auto w-full max-w-md flex-1 px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-ink">Ongeldige link</h1>
        <p className="mt-2 text-sm text-muted">
          Deze uitnodiging bestaat niet (meer). Neem contact op met Coniche
          voor een nieuwe link.
        </p>
      </div>
    );
  }

  const { organisatie, respondent } = gegevens;

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    if (email.trim().toLowerCase() !== respondent.email.trim().toLowerCase()) {
      setFout("Dit e-mailadres komt niet overeen met de uitnodiging.");
      return;
    }
    setVersturen(true);
    const { code: gegenereerdeCode, verstuurd } = await stuurVerificatiecode(
      respondentId,
      email.trim()
    );
    setVersturen(false);
    setDevCode(verstuurd ? null : gegenereerdeCode);
    setStap("code");
  }

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    const resultaat = controleerCode(respondentId, code);
    if (resultaat === "ok") {
      router.push(volgendeUrl(respondentId, respondent.status));
      return;
    }
    if (resultaat === "verlopen") {
      setFout("Deze code is verlopen. Vraag een nieuwe code aan.");
      return;
    }
    setFout("Onjuiste code. Controleer je e-mail en probeer opnieuw.");
  }

  async function handleOpnieuwVersturen() {
    setVersturen(true);
    const { code: gegenereerdeCode, verstuurd } = await stuurVerificatiecode(
      respondentId,
      email.trim()
    );
    setVersturen(false);
    setDevCode(verstuurd ? null : gegenereerdeCode);
    setFout(null);
    setCode("");
  }

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">
        {organisatie.naam}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-ink">
        {assessment?.naam ?? "Uitnodiging"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Bevestig je e-mailadres om toegang te krijgen tot deze scan.
      </p>

      {stap === "email" && (
        <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              E-mailadres
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-brand focus:outline-none"
              placeholder="naam@organisatie.nl"
            />
          </div>
          {fout && <p className="text-sm text-red-600">{fout}</p>}
          <button
            type="submit"
            disabled={versturen}
            className="w-full rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:bg-brand-disabled disabled:hover:brightness-100"
          >
            {versturen ? "Versturen..." : "Verstuur verificatiecode"}
          </button>
        </form>
      )}

      {stap === "code" && (
        <form onSubmit={handleCodeSubmit} className="mt-8 space-y-4">
          {devCode ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-medium">Ontwikkelmodus — nog geen mailservice gekoppeld</p>
              <p className="mt-1">
                Je verificatiecode is: <span className="font-mono font-bold">{devCode}</span>
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
              We hebben een verificatiecode gestuurd naar {email}.
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Verificatiecode
            </label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="w-full rounded-lg border border-gray-200 p-3 text-center font-mono text-lg tracking-widest focus:border-brand focus:outline-none"
              placeholder="123456"
            />
            <p className="mt-1 text-xs text-muted">Geldig gedurende 15 minuten.</p>
          </div>
          {fout && <p className="text-sm text-red-600">{fout}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:brightness-90"
          >
            Bevestig code
          </button>
          <button
            type="button"
            onClick={handleOpnieuwVersturen}
            className="w-full text-sm text-muted hover:text-ink"
          >
            Geen code ontvangen? Opnieuw versturen
          </button>
        </form>
      )}
    </div>
  );
}
