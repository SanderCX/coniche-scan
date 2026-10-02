"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessments, createAssessment, duplicateAssessmentAsVariant } from "@/lib/assessment-store";

/**
 * beheerpagina.md punt 1: "Nieuw Assessment aanmaken" (leeg) en
 * "Aanmaken vanuit bestaand Assessment" (sector-variant, datamodel.md
 * "Sector-varianten") als twee aparte acties op één scherm.
 */
export default function NieuwAssessmentPage() {
  const router = useRouter();
  const assessments = useAssessments();

  const [modus, setModus] = useState<"leeg" | "template">("leeg");
  const [naam, setNaam] = useState("");
  const [kortLabel, setKortLabel] = useState("");
  const [templateId, setTemplateId] = useState(assessments[0]?.id ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (modus === "leeg") {
      const assessment = createAssessment({ naam, kortLabel });
      router.push(`/beheer/content/${assessment.id}`);
      return;
    }
    const assessment = duplicateAssessmentAsVariant(templateId, { naam, kortLabel });
    if (assessment) router.push(`/beheer/content/${assessment.id}`);
  }

  return (
    <div className="admin-main">
      <Link href="/beheer/content" className="admin-back">
        ← Alle assessment-types
      </Link>
      <h1>Nieuw Assessment</h1>

      <div className="btn-rij" style={{ maxWidth: "28rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          className={`btn btn-compact ${modus === "leeg" ? "btn-or" : "btn-outline"}`}
          onClick={() => setModus("leeg")}
        >
          Leeg aanmaken
        </button>
        <button
          type="button"
          className={`btn btn-compact ${modus === "template" ? "btn-or" : "btn-outline"}`}
          onClick={() => setModus("template")}
        >
          Vanuit bestaand Assessment
        </button>
      </div>

      {modus === "template" && (
        <p className="text-sm text-ink-m" style={{ maxWidth: "28rem", marginTop: "-0.5rem" }}>
          Kopieert alle categorieën, bouwblokken en vragen van het gekozen Assessment naar nieuwe,
          losse content-records. Daarna bewerk je de kopie als een gewoon Assessment — een latere
          wijziging op het origineel werkt niet door (datamodel.md, Sector-varianten).
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: "28rem", marginTop: "1.5rem" }}>
        {modus === "template" && (
          <div className="admin-field">
            <label>Template</label>
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.naam}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="admin-field">
          <label>Naam</label>
          <input
            type="text"
            required
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder={modus === "template" ? "bijv. Zorgscan" : ""}
          />
        </div>
        <div className="admin-field">
          <label>Kort label (PDF-footer)</label>
          <input
            type="text"
            required
            value={kortLabel}
            onChange={(e) => setKortLabel(e.target.value)}
            placeholder="bijv. Zorgscan"
          />
        </div>
        <button type="submit" className="btn btn-or" disabled={modus === "template" && !templateId}>
          Aanmaken
        </button>
      </form>
    </div>
  );
}
