"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useAssessment, useAssessments, updateAssessment } from "@/lib/assessment-store";
import { Categorie, ContentBron } from "@/lib/types";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { BouwblokEditor } from "@/components/beheer/BouwblokEditor";
import { addCategorie, patchCategorie, removeCategorie, herstelCategorie, addBouwblok, herstelBouwblok, schakelCategorieLaag, patchFeatureCard, addFeatureCard, removeFeatureCard } from "@/lib/assessment-bewerken";
import { CATEGORIE_COLORS } from "@/lib/colors";
import { AssessmentIcon } from "@/components/icons/AssessmentIcons";
import { InfoIcoon } from "@/components/InfoIcoon";
import { WegingBeheer } from "@/components/beheer/WegingBeheer";
import { STANDAARD_WEGINGTEKST } from "@/lib/weging";

/** Vaste lijst, zie lib/types.ts `ContentBron` en export-pdf-visual-volwassenheidsscan.md, "Slotsectie per scan-type". */
const SLOTSECTIE_OPTIES: { bron: ContentBron; titel: string }[] = [
  { bron: "visie-coniche.md-deel1", titel: "Visie" },
  { bron: "content-2030.md", titel: "2030" },
];

export default function ContentEditorPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const assessment = useAssessment(assessmentId);
  const alleAssessments = useAssessments();
  const [categorieArchiveren, setCategorieArchiveren] = useState<Categorie | null>(null);

  if (!assessment) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Assessment niet gevonden.</p>
      </div>
    );
  }

  const heeftCategorieen = assessment.categorieen !== null;
  const template = alleAssessments.find((a) => a.id === assessment.afgeleidVanAssessmentId);

  return (
    <div className="admin-main space-y-8 pb-20">
      <div>
        <Link href="/beheer/content" className="text-sm text-ink-m hover:text-ink">
          ← Alle assessment-types
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{assessment.naam}</h1>
        {assessment.afgeleidVanAssessmentId && (
          <p className="mt-1 text-xs text-ink-m">
            Afgeleid van: {template ? template.naam : "(verwijderd Assessment)"}
          </p>
        )}
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Instellingen</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Naam</span>
            <input
              value={assessment.naam}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, naam: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Icoon</span>
            <div className="flex items-center gap-2">
              <AssessmentIcon
                name={assessment.icoon}
                style={{ width: "1.25rem", height: "1.25rem", color: "var(--or)" }}
              />
              <input
                value={assessment.icoon}
                onChange={(e) =>
                  updateAssessment(assessmentId, (a) => ({ ...a, icoon: e.target.value }))
                }
                placeholder="Een emoji, bijv. 🩺"
                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
              />
              <InfoIcoon sleutel="info.contentIcoon" />
            </div>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-ink">Subtitel</span>
            <input
              value={assessment.subtitel}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, subtitel: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-ink">Beschrijving</span>
            <textarea
              value={assessment.beschrijving}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, beschrijving: e.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-ink">Doelgroep</span>
            <input
              value={assessment.doelgroep}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, doelgroep: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Geschatte duur</span>
            <input
              value={assessment.geschatteDuur}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, geschatteDuur: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">
              Kort label <span className="font-normal text-ink-m">(PDF-footer, bijv. &quot;Volwassenheidsscan&quot;)</span>
            </span>
            <input
              value={assessment.kortLabel}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, kortLabel: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Eenheid enkelvoud</span>
            <input
              value={assessment.bouwblokEenheidEnkelvoud}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({
                  ...a,
                  bouwblokEenheidEnkelvoud: e.target.value,
                }))
              }
              placeholder="Bouwblok / Domein"
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Eenheid meervoud</span>
            <input
              value={assessment.bouwblokEenheidMeervoud}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({
                  ...a,
                  bouwblokEenheidMeervoud: e.target.value,
                }))
              }
              placeholder="bouwblokken / AI-domeinen"
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Bouwblok-label</span>
            <div className="flex items-center gap-2">
              <input
                value={assessment.bouwblokLabel}
                onChange={(e) => updateAssessment(assessmentId, (a) => ({ ...a, bouwblokLabel: e.target.value }))}
                placeholder="Bouwsteen / AI-domein"
                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
              />
              <InfoIcoon sleutel="info.contentBouwblokLabel" />
            </div>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Titel wegingskaart</span>
            <input
              value={assessment.wegingTitel ?? ""}
              onChange={(e) => updateAssessment(assessmentId, (a) => ({ ...a, wegingTitel: e.target.value || null }))}
              placeholder="Gewogen scoring"
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-ink">Tekst wegingskaart</span>
            <textarea
              value={assessment.wegingToelichting ?? ""}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, wegingToelichting: e.target.value || null }))
              }
              rows={2}
              placeholder={STANDAARD_WEGINGTEKST}
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={assessment.scoresPerGroepGesorteerd}
            onChange={(e) =>
              updateAssessment(assessmentId, (a) => ({
                ...a,
                scoresPerGroepGesorteerd: e.target.checked,
              }))
            }
          />
          Scores op het resultatenscherm sorteren van hoog naar laag
        </label>

        <label className="mt-2 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={heeftCategorieen}
            onChange={(e) => schakelCategorieLaag(assessmentId, e.target.checked)}
          />
          Bouwblokken groeperen in categorieën
        </label>

        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-ink">Slotsectie voor de PDF-export</p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={assessment.pdfContentSecties?.bron ?? ""}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({
                  ...a,
                  pdfContentSecties: e.target.value
                    ? {
                        titel: SLOTSECTIE_OPTIES.find((o) => o.bron === e.target.value)!.titel,
                        bron: e.target.value as ContentBron,
                      }
                    : null,
                }))
              }
              className="rounded-lg border border-gray-200 p-2 text-sm"
            >
              <option value="">Geen slotsectie</option>
              {SLOTSECTIE_OPTIES.map((o) => (
                <option key={o.bron} value={o.bron}>
                  {o.titel} ({o.bron})
                </option>
              ))}
            </select>
            {assessment.pdfContentSecties && (
              <label className="flex items-center gap-2 text-sm">
                Titel
                <input
                  value={assessment.pdfContentSecties.titel}
                  onChange={(e) =>
                    updateAssessment(assessmentId, (a) =>
                      a.pdfContentSecties
                        ? { ...a, pdfContentSecties: { ...a.pdfContentSecties, titel: e.target.value } }
                        : a
                    )
                  }
                  className="w-32 rounded-lg border border-gray-200 p-2 text-sm"
                />
              </label>
            )}
            <InfoIcoon sleutel="info.contentSlotsectie" />
          </div>
        </div>

        <p className="mb-2 mt-6 text-sm font-medium text-ink">Schaal-labels (1–5)</p>
        <div className="space-y-2">
          {assessment.schaal.map((s, i) => (
            <div key={s.waarde} className="flex items-center gap-3">
              <span className="w-4 text-sm font-semibold text-ink-m">{s.waarde}</span>
              <input
                value={s.label}
                onChange={(e) =>
                  updateAssessment(assessmentId, (a) => {
                    a.schaal[i] = { ...a.schaal[i], label: e.target.value };
                    return a;
                  })
                }
                className="flex-1 rounded-lg border border-gray-200 p-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Feature-cards (landingspagina)</h2>
          <button
            type="button"
            onClick={() => addFeatureCard(assessmentId)}
            className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-sm font-medium text-ink-m hover:border-gray-400"
          >
            + Kaart
          </button>
        </div>
        <div className="space-y-3">
          {assessment.featureCards.map((card, i) => (
            <div key={i} className="flex gap-2 rounded-lg border border-gray-100 p-3">
              <div className="flex-1 space-y-2">
                <input
                  value={card.titel}
                  onChange={(e) => patchFeatureCard(assessmentId, i, { titel: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm font-medium"
                  placeholder="Titel"
                />
                <textarea
                  value={card.tekst}
                  onChange={(e) => patchFeatureCard(assessmentId, i, { tekst: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                  placeholder="Tekst"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFeatureCard(assessmentId, i)}
                className="btn btn-outline btn-compact"
              >
                Verwijderen
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            {heeftCategorieen
              ? "Categorieën & bouwblokken"
              : `${assessment.bouwblokEenheidMeervoud} (geen categorie-laag)`}
          </h2>
          {heeftCategorieen ? (
            <button
              type="button"
              onClick={() => addCategorie(assessmentId)}
              className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-sm font-medium text-ink-m hover:border-gray-400"
            >
              + Categorie
            </button>
          ) : (
            <button
              type="button"
              onClick={() => addBouwblok(assessmentId, null)}
              className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-sm font-medium text-ink-m hover:border-gray-400"
            >
              + {assessment.bouwblokEenheidEnkelvoud}
            </button>
          )}
        </div>

        {heeftCategorieen ? (
          <div className="space-y-4">
            {[...(assessment.categorieen ?? [])]
              .filter((c) => !c.gearchiveerd)
              .sort((a, b) => a.volgorde - b.volgorde)
              .map((categorie) => (
                <details key={categorie.id} className="rounded-xl border border-gray-200 p-4" open>
                  <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${CATEGORIE_COLORS[categorie.kleur]?.bg ?? "bg-gray-400"}`}
                    />
                    <input
                      value={categorie.naam}
                      onChange={(e) =>
                        patchCategorie(assessmentId, categorie.id, { naam: e.target.value })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 rounded-lg border border-gray-200 p-1.5 text-sm font-semibold"
                    />
                    <select
                      value={categorie.kleur}
                      onChange={(e) =>
                        patchCategorie(assessmentId, categorie.id, { kleur: e.target.value })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-gray-200 p-1.5 text-sm"
                    >
                      {Object.keys(CATEGORIE_COLORS).map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCategorieArchiveren(categorie);
                      }}
                      className="btn btn-outline btn-compact"
                    >
                      Archiveren
                    </button>
                  </summary>

                  <div className="mt-4 space-y-3 border-l-2 border-gray-100 pl-4">
                    {categorie.bouwblokken
                      .filter((b) => !b.gearchiveerd)
                      .map((bouwblok) => (
                        <BouwblokEditor
                          key={bouwblok.id}
                          assessmentId={assessmentId}
                          categorieId={categorie.id}
                          bouwblok={bouwblok}
                        />
                      ))}
                    <button
                      type="button"
                      onClick={() => addBouwblok(assessmentId, categorie.id)}
                      className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-sm font-medium text-ink-m hover:border-gray-400"
                    >
                      + {assessment.bouwblokEenheidEnkelvoud}
                    </button>

                    {categorie.bouwblokken.some((b) => b.gearchiveerd) && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-medium text-ink-m">
                          Gearchiveerd (
                          {categorie.bouwblokken.filter((b) => b.gearchiveerd).length})
                        </summary>
                        <div className="mt-2 space-y-1">
                          {categorie.bouwblokken
                            .filter((b) => b.gearchiveerd)
                            .map((bouwblok) => (
                              <div key={bouwblok.id} className="flex items-center gap-2 text-xs text-ink-m">
                                <span className="flex-1 truncate">{bouwblok.naam}</span>
                                <button
                                  type="button"
                                  onClick={() => herstelBouwblok(assessmentId, categorie.id, bouwblok.id)}
                                  className="btn btn-outline btn-compact"
                                >
                                  Herstellen
                                </button>
                              </div>
                            ))}
                        </div>
                      </details>
                    )}
                  </div>
                </details>
              ))}

            {(assessment.categorieen ?? []).some((c) => c.gearchiveerd) && (
              <details>
                <summary className="cursor-pointer text-sm font-medium text-ink-m">
                  Gearchiveerde categorieën (
                  {(assessment.categorieen ?? []).filter((c) => c.gearchiveerd).length})
                </summary>
                <div className="mt-2 space-y-1">
                  {(assessment.categorieen ?? [])
                    .filter((c) => c.gearchiveerd)
                    .map((categorie) => (
                      <div key={categorie.id} className="flex items-center gap-2 text-sm text-ink-m">
                        <span className="flex-1">{categorie.naam}</span>
                        <button
                          type="button"
                          onClick={() => herstelCategorie(assessmentId, categorie.id)}
                          className="btn btn-outline btn-compact"
                        >
                          Herstellen
                        </button>
                      </div>
                    ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {(assessment.bouwblokken ?? [])
              .filter((b) => !b.gearchiveerd)
              .map((bouwblok) => (
                <BouwblokEditor
                  key={bouwblok.id}
                  assessmentId={assessmentId}
                  categorieId={null}
                  bouwblok={bouwblok}
                />
              ))}

            {(assessment.bouwblokken ?? []).some((b) => b.gearchiveerd) && (
              <details>
                <summary className="cursor-pointer text-sm font-medium text-ink-m">
                  Gearchiveerd (
                  {(assessment.bouwblokken ?? []).filter((b) => b.gearchiveerd).length})
                </summary>
                <div className="mt-2 space-y-1">
                  {(assessment.bouwblokken ?? [])
                    .filter((b) => b.gearchiveerd)
                    .map((bouwblok) => (
                      <div key={bouwblok.id} className="flex items-center gap-2 text-sm text-ink-m">
                        <span className="flex-1">{bouwblok.naam}</span>
                        <button
                          type="button"
                          onClick={() => herstelBouwblok(assessmentId, null, bouwblok.id)}
                          className="btn btn-outline btn-compact"
                        >
                          Herstellen
                        </button>
                      </div>
                    ))}
                </div>
              </details>
            )}
          </div>
        )}
      </section>

      <WegingBeheer assessment={assessment} />

      <BevestigModal
        open={categorieArchiveren !== null}
        titel="Categorie archiveren"
        bericht={`Categorie "${categorieArchiveren?.naam ?? ""}" archiveren? Ze en haar bouwblokken verdwijnen uit de doorloopflow voor nieuwe invullingen, maar bestaande scores blijven behouden. Je kunt dit terugzetten via "Gearchiveerde categorieën" hieronder.`}
        bevestigLabel="Archiveren"
        onBevestigen={() => {
          if (categorieArchiveren) removeCategorie(assessmentId, categorieArchiveren.id);
          setCategorieArchiveren(null);
        }}
        onAnnuleren={() => setCategorieArchiveren(null)}
      />
    </div>
  );
}
