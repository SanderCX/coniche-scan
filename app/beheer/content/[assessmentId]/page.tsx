"use client";

import { use } from "react";
import Link from "next/link";
import { useAssessment, updateAssessment } from "@/lib/assessment-store";
import { Assessment, VeldDefinitie } from "@/lib/types";
import { nieuwId } from "@/lib/id";
import { CATEGORIE_COLORS } from "@/lib/colors";
import { VeldDefinitieEditor } from "@/components/beheer/VeldDefinitieEditor";

function addCategorie(assessmentId: string) {
  updateAssessment(assessmentId, (a) => {
    a.categorieen.push({
      id: nieuwId(),
      naam: "Nieuwe categorie",
      kleur: "blauw",
      volgorde: a.categorieen.length + 1,
      bouwblokken: [],
    });
    return a;
  });
}

function patchCategorie(
  assessmentId: string,
  categorieId: string,
  patch: Partial<Assessment["categorieen"][number]>
) {
  updateAssessment(assessmentId, (a) => {
    a.categorieen = a.categorieen.map((c) => (c.id === categorieId ? { ...c, ...patch } : c));
    return a;
  });
}

function removeCategorie(assessmentId: string, categorieId: string) {
  updateAssessment(assessmentId, (a) => {
    a.categorieen = a.categorieen.filter((c) => c.id !== categorieId);
    return a;
  });
}

function addBouwblok(assessmentId: string, categorieId: string) {
  updateAssessment(assessmentId, (a) => {
    const maxVolgnummer = Math.max(
      0,
      ...a.categorieen.flatMap((c) => c.bouwblokken.map((b) => b.volgnummer))
    );
    a.categorieen = a.categorieen.map((c) =>
      c.id === categorieId
        ? {
            ...c,
            bouwblokken: [
              ...c.bouwblokken,
              {
                id: nieuwId(),
                volgnummer: maxVolgnummer + 1,
                naam: "Nieuw bouwblok",
                omschrijving: "",
                tags: [],
                vragen: [],
              },
            ],
          }
        : c
    );
    return a;
  });
}

function patchBouwblok(
  assessmentId: string,
  categorieId: string,
  bouwblokId: string,
  patch: Partial<Assessment["categorieen"][number]["bouwblokken"][number]>
) {
  updateAssessment(assessmentId, (a) => {
    a.categorieen = a.categorieen.map((c) =>
      c.id !== categorieId
        ? c
        : {
            ...c,
            bouwblokken: c.bouwblokken.map((b) =>
              b.id === bouwblokId ? { ...b, ...patch } : b
            ),
          }
    );
    return a;
  });
}

function removeBouwblok(assessmentId: string, categorieId: string, bouwblokId: string) {
  updateAssessment(assessmentId, (a) => {
    a.categorieen = a.categorieen.map((c) =>
      c.id !== categorieId
        ? c
        : { ...c, bouwblokken: c.bouwblokken.filter((b) => b.id !== bouwblokId) }
    );
    return a;
  });
}

function addVraag(assessmentId: string, categorieId: string, bouwblokId: string) {
  updateAssessment(assessmentId, (a) => {
    a.categorieen = a.categorieen.map((c) =>
      c.id !== categorieId
        ? c
        : {
            ...c,
            bouwblokken: c.bouwblokken.map((b) =>
              b.id !== bouwblokId
                ? b
                : {
                    ...b,
                    vragen: [...b.vragen, { id: nieuwId(), volgnummer: b.vragen.length + 1, tekst: "" }],
                  }
            ),
          }
    );
    return a;
  });
}

function patchVraag(
  assessmentId: string,
  categorieId: string,
  bouwblokId: string,
  vraagId: string,
  tekst: string
) {
  updateAssessment(assessmentId, (a) => {
    a.categorieen = a.categorieen.map((c) =>
      c.id !== categorieId
        ? c
        : {
            ...c,
            bouwblokken: c.bouwblokken.map((b) =>
              b.id !== bouwblokId
                ? b
                : { ...b, vragen: b.vragen.map((v) => (v.id === vraagId ? { ...v, tekst } : v)) }
            ),
          }
    );
    return a;
  });
}

function removeVraag(
  assessmentId: string,
  categorieId: string,
  bouwblokId: string,
  vraagId: string
) {
  updateAssessment(assessmentId, (a) => {
    a.categorieen = a.categorieen.map((c) =>
      c.id !== categorieId
        ? c
        : {
            ...c,
            bouwblokken: c.bouwblokken.map((b) =>
              b.id !== bouwblokId
                ? b
                : { ...b, vragen: b.vragen.filter((v) => v.id !== vraagId) }
            ),
          }
    );
    return a;
  });
}

export default function ContentEditorPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const assessment = useAssessment(assessmentId);

  if (!assessment) {
    return <p className="text-sm text-slate-500">Assessment niet gevonden.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div>
        <Link href="/beheer/content" className="text-sm text-slate-400 hover:text-slate-600">
          ← Alle assessment-types
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{assessment.naam}</h1>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Instellingen</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Naam</span>
            <input
              value={assessment.naam}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, naam: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Icoon (emoji)</span>
            <input
              value={assessment.icoon}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, icoon: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-slate-700">Subtitel</span>
            <input
              value={assessment.subtitel}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, subtitel: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-slate-700">Beschrijving</span>
            <textarea
              value={assessment.beschrijving}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, beschrijving: e.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border border-slate-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-slate-700">Doelgroep</span>
            <input
              value={assessment.doelgroep}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, doelgroep: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 p-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Geschatte duur</span>
            <input
              value={assessment.geschatteDuur}
              onChange={(e) =>
                updateAssessment(assessmentId, (a) => ({ ...a, geschatteDuur: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 p-2 text-sm"
            />
          </label>
        </div>

        <p className="mb-2 mt-6 text-sm font-medium text-slate-800">Schaal-labels (1–5)</p>
        <div className="space-y-2">
          {assessment.schaal.map((s, i) => (
            <div key={s.waarde} className="flex items-center gap-3">
              <span className="w-4 text-sm font-semibold text-slate-500">{s.waarde}</span>
              <input
                value={s.label}
                onChange={(e) =>
                  updateAssessment(assessmentId, (a) => {
                    a.schaal[i] = { ...a.schaal[i], label: e.target.value };
                    return a;
                  })
                }
                className="flex-1 rounded-lg border border-slate-200 p-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Organisatievelden</h2>
        <VeldDefinitieEditor
          velden={assessment.organisatieVelden}
          onChange={(velden: VeldDefinitie[]) =>
            updateAssessment(assessmentId, (a) => ({ ...a, organisatieVelden: velden }))
          }
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Categorieën & bouwblokken</h2>
          <button
            type="button"
            onClick={() => addCategorie(assessmentId)}
            className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-400"
          >
            + Categorie
          </button>
        </div>

        <div className="space-y-4">
          {[...assessment.categorieen]
            .sort((a, b) => a.volgorde - b.volgorde)
            .map((categorie) => (
              <details
                key={categorie.id}
                className="rounded-xl border border-slate-200 p-4"
                open
              >
                <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                  <span
                    className={`h-3 w-3 rounded-full ${CATEGORIE_COLORS[categorie.kleur]?.bg ?? "bg-slate-400"}`}
                  />
                  <input
                    value={categorie.naam}
                    onChange={(e) =>
                      patchCategorie(assessmentId, categorie.id, { naam: e.target.value })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 rounded-lg border border-slate-200 p-1.5 text-sm font-semibold"
                  />
                  <select
                    value={categorie.kleur}
                    onChange={(e) =>
                      patchCategorie(assessmentId, categorie.id, { kleur: e.target.value })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg border border-slate-200 p-1.5 text-sm"
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

                <div className="mt-4 space-y-3 border-l-2 border-slate-100 pl-4">
                  {categorie.bouwblokken.map((bouwblok) => (
                    <details key={bouwblok.id} className="rounded-lg border border-slate-100 p-3">
                      <summary className="flex cursor-pointer flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">
                          #{bouwblok.volgnummer}
                        </span>
                        <input
                          value={bouwblok.naam}
                          onChange={(e) =>
                            patchBouwblok(assessmentId, categorie.id, bouwblok.id, {
                              naam: e.target.value,
                            })
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 rounded-lg border border-slate-200 p-1.5 text-sm font-medium"
                        />
                        <span className="text-xs text-slate-400">
                          {bouwblok.vragen.length} vragen
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            removeBouwblok(assessmentId, categorie.id, bouwblok.id);
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Verwijderen
                        </button>
                      </summary>

                      <div className="mt-3 space-y-3">
                        <label className="block text-sm">
                          <span className="mb-1 block text-slate-700">Omschrijving</span>
                          <textarea
                            value={bouwblok.omschrijving}
                            onChange={(e) =>
                              patchBouwblok(assessmentId, categorie.id, bouwblok.id, {
                                omschrijving: e.target.value,
                              })
                            }
                            rows={2}
                            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                          />
                        </label>
                        <label className="block text-sm">
                          <span className="mb-1 block text-slate-700">
                            Tags (komma-gescheiden)
                          </span>
                          <input
                            value={bouwblok.tags.join(", ")}
                            onChange={(e) =>
                              patchBouwblok(assessmentId, categorie.id, bouwblok.id, {
                                tags: e.target.value
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean),
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                          />
                        </label>

                        <div>
                          <p className="mb-2 text-sm font-medium text-slate-800">Vragen</p>
                          <div className="space-y-2">
                            {bouwblok.vragen.map((vraag) => (
                              <div key={vraag.id} className="flex items-start gap-2">
                                <span className="mt-2 w-4 text-xs text-slate-400">
                                  {vraag.volgnummer}.
                                </span>
                                <textarea
                                  value={vraag.tekst}
                                  onChange={(e) =>
                                    patchVraag(
                                      assessmentId,
                                      categorie.id,
                                      bouwblok.id,
                                      vraag.id,
                                      e.target.value
                                    )
                                  }
                                  rows={2}
                                  className="flex-1 rounded-lg border border-slate-200 p-2 text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeVraag(assessmentId, categorie.id, bouwblok.id, vraag.id)
                                  }
                                  className="mt-2 text-xs text-red-600 hover:underline"
                                >
                                  Verwijder
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addVraag(assessmentId, categorie.id, bouwblok.id)}
                            className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                          >
                            + Vraag toevoegen
                          </button>
                        </div>
                      </div>
                    </details>
                  ))}
                  <button
                    type="button"
                    onClick={() => addBouwblok(assessmentId, categorie.id)}
                    className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-400"
                  >
                    + Bouwblok
                  </button>
                </div>
              </details>
            ))}
        </div>
      </section>
    </div>
  );
}
