"use client";

import { use } from "react";
import Link from "next/link";
import { useAssessment, updateAssessment } from "@/lib/assessment-store";
import { Assessment, Bouwblok, FeatureCard, VeldDefinitie } from "@/lib/types";
import { nieuwId } from "@/lib/id";
import { CATEGORIE_COLORS } from "@/lib/colors";
import { VeldDefinitieEditor } from "@/components/beheer/VeldDefinitieEditor";

/** Leest/schrijft de bouwblokken op hun plek: genest in een categorie, of
 * plat op de assessment zelf als `categorieId` null is (geen categorie-laag). */
function metBouwblokken(
  assessment: Assessment,
  categorieId: string | null,
  updater: (bouwblokken: Bouwblok[]) => Bouwblok[]
): Assessment {
  if (categorieId === null) {
    return { ...assessment, bouwblokken: updater(assessment.bouwblokken ?? []) };
  }
  return {
    ...assessment,
    categorieen: (assessment.categorieen ?? []).map((c) =>
      c.id === categorieId ? { ...c, bouwblokken: updater(c.bouwblokken) } : c
    ),
  };
}

function alleVolgnummers(assessment: Assessment): number[] {
  const bouwblokken = assessment.categorieen
    ? assessment.categorieen.flatMap((c) => c.bouwblokken)
    : (assessment.bouwblokken ?? []);
  return bouwblokken.map((b) => b.volgnummer);
}

function addCategorie(assessmentId: string) {
  updateAssessment(assessmentId, (a) => {
    const categorieen = a.categorieen ?? [];
    categorieen.push({
      id: nieuwId(),
      naam: "Nieuwe categorie",
      kleur: "blauw",
      volgorde: categorieen.length + 1,
      bouwblokken: [],
    });
    return { ...a, categorieen };
  });
}

function patchCategorie(
  assessmentId: string,
  categorieId: string,
  patch: Partial<{ naam: string; kleur: string }>
) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    categorieen: (a.categorieen ?? []).map((c) => (c.id === categorieId ? { ...c, ...patch } : c)),
  }));
}

function removeCategorie(assessmentId: string, categorieId: string) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    categorieen: (a.categorieen ?? []).filter((c) => c.id !== categorieId),
  }));
}

function addBouwblok(assessmentId: string, categorieId: string | null) {
  updateAssessment(assessmentId, (a) => {
    const maxVolgnummer = Math.max(0, ...alleVolgnummers(a));
    return metBouwblokken(a, categorieId, (bouwblokken) => [
      ...bouwblokken,
      {
        id: nieuwId(),
        volgnummer: maxVolgnummer + 1,
        naam: "Nieuw bouwblok",
        omschrijving: "",
        toelichting: "",
        tags: [],
        vragen: [],
      },
    ]);
  });
}

function patchBouwblok(
  assessmentId: string,
  categorieId: string | null,
  bouwblokId: string,
  patch: Partial<Bouwblok>
) {
  updateAssessment(assessmentId, (a) =>
    metBouwblokken(a, categorieId, (bouwblokken) =>
      bouwblokken.map((b) => (b.id === bouwblokId ? { ...b, ...patch } : b))
    )
  );
}

function removeBouwblok(assessmentId: string, categorieId: string | null, bouwblokId: string) {
  updateAssessment(assessmentId, (a) =>
    metBouwblokken(a, categorieId, (bouwblokken) => bouwblokken.filter((b) => b.id !== bouwblokId))
  );
}

function addVraag(assessmentId: string, categorieId: string | null, bouwblokId: string) {
  updateAssessment(assessmentId, (a) =>
    metBouwblokken(a, categorieId, (bouwblokken) =>
      bouwblokken.map((b) =>
        b.id !== bouwblokId
          ? b
          : { ...b, vragen: [...b.vragen, { id: nieuwId(), volgnummer: b.vragen.length + 1, tekst: "" }] }
      )
    )
  );
}

function patchVraag(
  assessmentId: string,
  categorieId: string | null,
  bouwblokId: string,
  vraagId: string,
  tekst: string
) {
  updateAssessment(assessmentId, (a) =>
    metBouwblokken(a, categorieId, (bouwblokken) =>
      bouwblokken.map((b) =>
        b.id !== bouwblokId
          ? b
          : { ...b, vragen: b.vragen.map((v) => (v.id === vraagId ? { ...v, tekst } : v)) }
      )
    )
  );
}

function removeVraag(
  assessmentId: string,
  categorieId: string | null,
  bouwblokId: string,
  vraagId: string
) {
  updateAssessment(assessmentId, (a) =>
    metBouwblokken(a, categorieId, (bouwblokken) =>
      bouwblokken.map((b) =>
        b.id !== bouwblokId ? b : { ...b, vragen: b.vragen.filter((v) => v.id !== vraagId) }
      )
    )
  );
}

function schakelCategorieLaag(assessmentId: string, aanzetten: boolean) {
  updateAssessment(assessmentId, (a) => {
    if (aanzetten) {
      return {
        ...a,
        categorieen: [
          {
            id: nieuwId(),
            naam: "Nieuwe categorie",
            kleur: "blauw",
            volgorde: 1,
            bouwblokken: a.bouwblokken ?? [],
          },
        ],
        bouwblokken: null,
      };
    }
    return {
      ...a,
      bouwblokken: (a.categorieen ?? []).flatMap((c) => c.bouwblokken),
      categorieen: null,
    };
  });
}

function BouwblokEditor({
  assessmentId,
  categorieId,
  bouwblok,
}: {
  assessmentId: string;
  categorieId: string | null;
  bouwblok: Bouwblok;
}) {
  return (
    <details className="rounded-lg border border-gray-100 p-3">
      <summary className="flex cursor-pointer flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-ink-m">#{bouwblok.volgnummer}</span>
        <input
          value={bouwblok.naam}
          onChange={(e) =>
            patchBouwblok(assessmentId, categorieId, bouwblok.id, { naam: e.target.value })
          }
          onClick={(e) => e.stopPropagation()}
          className="flex-1 rounded-lg border border-gray-200 p-1.5 text-sm font-medium"
        />
        <span className="text-xs text-ink-m">{bouwblok.vragen.length} vragen</span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            removeBouwblok(assessmentId, categorieId, bouwblok.id);
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Verwijderen
        </button>
      </summary>

      <div className="mt-3 space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-ink">Omschrijving</span>
          <textarea
            value={bouwblok.omschrijving}
            onChange={(e) =>
              patchBouwblok(assessmentId, categorieId, bouwblok.id, {
                omschrijving: e.target.value,
              })
            }
            rows={2}
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink">
            Toelichting <span className="font-normal text-ink-m">(overlay-tekst)</span>
          </span>
          <textarea
            value={bouwblok.toelichting}
            onChange={(e) =>
              patchBouwblok(assessmentId, categorieId, bouwblok.id, {
                toelichting: e.target.value,
              })
            }
            rows={4}
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink">Tags (komma-gescheiden)</span>
          <input
            value={bouwblok.tags.join(", ")}
            onChange={(e) =>
              patchBouwblok(assessmentId, categorieId, bouwblok.id, {
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
          />
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Vragen</p>
          <div className="space-y-2">
            {bouwblok.vragen.map((vraag) => (
              <div key={vraag.id} className="flex items-start gap-2">
                <span className="mt-2 w-4 text-xs text-ink-m">{vraag.volgnummer}.</span>
                <textarea
                  value={vraag.tekst}
                  onChange={(e) =>
                    patchVraag(assessmentId, categorieId, bouwblok.id, vraag.id, e.target.value)
                  }
                  rows={2}
                  className="flex-1 rounded-lg border border-gray-200 p-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeVraag(assessmentId, categorieId, bouwblok.id, vraag.id)}
                  className="mt-2 text-xs text-red-600 hover:underline"
                >
                  Verwijder
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addVraag(assessmentId, categorieId, bouwblok.id)}
            className="mt-2 text-sm font-medium text-ink-m hover:text-ink"
          >
            + Vraag toevoegen
          </button>
        </div>
      </div>
    </details>
  );
}

function patchFeatureCard(assessmentId: string, index: number, patch: Partial<FeatureCard>) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    featureCards: a.featureCards.map((c, i) => (i === index ? { ...c, ...patch } : c)),
  }));
}

function addFeatureCard(assessmentId: string) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    featureCards: [...a.featureCards, { titel: "Nieuwe feature", tekst: "" }],
  }));
}

function removeFeatureCard(assessmentId: string, index: number) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    featureCards: a.featureCards.filter((_, i) => i !== index),
  }));
}

export default function ContentEditorPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const assessment = useAssessment(assessmentId);

  if (!assessment) {
    return <p className="text-sm text-ink-m">Assessment niet gevonden.</p>;
  }

  const heeftCategorieen = assessment.categorieen !== null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div>
        <Link href="/beheer/content" className="text-sm text-ink-m hover:text-ink">
          ← Alle assessment-types
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{assessment.naam}</h1>
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
            <span className="mb-1 block text-ink">Icoon (emoji)</span>
            <input
              value={assessment.icoon}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, icoon: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            />
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
                className="text-sm text-red-600 hover:underline"
              >
                Verwijderen
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Organisatievelden</h2>
        <VeldDefinitieEditor
          velden={assessment.organisatieVelden}
          onChange={(velden: VeldDefinitie[]) =>
            updateAssessment(assessmentId, (a) => ({ ...a, organisatieVelden: velden }))
          }
        />
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
                        removeCategorie(assessmentId, categorie.id);
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Verwijderen
                    </button>
                  </summary>

                  <div className="mt-4 space-y-3 border-l-2 border-gray-100 pl-4">
                    {categorie.bouwblokken.map((bouwblok) => (
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
                  </div>
                </details>
              ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(assessment.bouwblokken ?? []).map((bouwblok) => (
              <BouwblokEditor
                key={bouwblok.id}
                assessmentId={assessmentId}
                categorieId={null}
                bouwblok={bouwblok}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
