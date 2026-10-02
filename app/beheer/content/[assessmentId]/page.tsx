"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useAssessment, useAssessments, updateAssessment } from "@/lib/assessment-store";
import { Assessment, Bouwblok, Categorie, ContentBron, FeatureCard } from "@/lib/types";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { nieuwId } from "@/lib/id";
import { CATEGORIE_COLORS } from "@/lib/colors";
import { AssessmentIcon, ASSESSMENT_ICONS } from "@/components/icons/AssessmentIcons";
import { InfoIcoon } from "@/components/InfoIcoon";

/** Vaste lijst, zie lib/types.ts `ContentBron` en export-pdf-visual-volwassenheidsscan.md, "Slotsectie per scan-type". */
const SLOTSECTIE_OPTIES: { bron: ContentBron; titel: string }[] = [
  { bron: "visie-coniche.md-deel1", titel: "Visie" },
  { bron: "content-2030.md", titel: "2030" },
];

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
      gewicht: 1,
      bouwblokken: [],
    });
    return { ...a, categorieen };
  });
}

function patchCategorie(
  assessmentId: string,
  categorieId: string,
  patch: Partial<{ naam: string; kleur: string; gewicht: number }>
) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    categorieen: (a.categorieen ?? []).map((c) => (c.id === categorieId ? { ...c, ...patch } : c)),
  }));
}

/**
 * "Verwijderen" archiveert (datamodel.md, "Content bewerken") i.p.v. het
 * record echt te verwijderen: anders verdwijnen scores uit eerdere
 * invullingen die deze categorie/bouwblok/vraag nog gebruikten.
 * Gearchiveerde items blijven in de array staan (voor scoring/exports),
 * maar tellen niet meer mee voor nieuwe invullingen (`lib/assessment-
 * structuur.ts`, `actieve*`-functies) en zijn hier verplaatst naar een
 * apart "Gearchiveerd"-blokje met een Herstellen-knop.
 */
function removeCategorie(assessmentId: string, categorieId: string) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    categorieen: (a.categorieen ?? []).map((c) =>
      c.id === categorieId ? { ...c, gearchiveerd: true } : c
    ),
  }));
}

function herstelCategorie(assessmentId: string, categorieId: string) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    categorieen: (a.categorieen ?? []).map((c) =>
      c.id === categorieId ? { ...c, gearchiveerd: false } : c
    ),
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
        gewicht: 1,
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
    metBouwblokken(a, categorieId, (bouwblokken) =>
      bouwblokken.map((b) => (b.id === bouwblokId ? { ...b, gearchiveerd: true } : b))
    )
  );
}

function herstelBouwblok(assessmentId: string, categorieId: string | null, bouwblokId: string) {
  updateAssessment(assessmentId, (a) =>
    metBouwblokken(a, categorieId, (bouwblokken) =>
      bouwblokken.map((b) => (b.id === bouwblokId ? { ...b, gearchiveerd: false } : b))
    )
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
        b.id !== bouwblokId
          ? b
          : { ...b, vragen: b.vragen.map((v) => (v.id === vraagId ? { ...v, gearchiveerd: true } : v)) }
      )
    )
  );
}

function herstelVraag(
  assessmentId: string,
  categorieId: string | null,
  bouwblokId: string,
  vraagId: string
) {
  updateAssessment(assessmentId, (a) =>
    metBouwblokken(a, categorieId, (bouwblokken) =>
      bouwblokken.map((b) =>
        b.id !== bouwblokId
          ? b
          : { ...b, vragen: b.vragen.map((v) => (v.id === vraagId ? { ...v, gearchiveerd: false } : v)) }
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
            gewicht: 1,
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
  // Geen `window.confirm()`: Dat wordt in sommige browseromgevingen stil
  // onderdrukt, waardoor de knop niets lijkt te doen (BevestigModal.tsx).
  const [archiveren, setArchiveren] = useState<{ soort: "bouwblok" } | { soort: "vraag"; vraagId: string } | null>(null);

  return (
    <>
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
        <span className="text-xs text-ink-m">
          {bouwblok.vragen.filter((v) => !v.gearchiveerd).length} vragen
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setArchiveren({ soort: "bouwblok" });
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Archiveren
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
        <label className="block text-sm" style={{ maxWidth: "10rem" }}>
          <span className="mb-1 block text-ink">
            Gewicht <span className="font-normal text-ink-m">(standaard 1, nog geen effect op de score)</span>
          </span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={bouwblok.gewicht}
            onChange={(e) =>
              patchBouwblok(assessmentId, categorieId, bouwblok.id, {
                gewicht: Number(e.target.value),
              })
            }
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
          />
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Vragen</p>
          <div className="space-y-2">
            {bouwblok.vragen
              .filter((v) => !v.gearchiveerd)
              .map((vraag) => (
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
                    onClick={() => setArchiveren({ soort: "vraag", vraagId: vraag.id })}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Archiveer
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

          {bouwblok.vragen.some((v) => v.gearchiveerd) && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-ink-m">
                Gearchiveerd ({bouwblok.vragen.filter((v) => v.gearchiveerd).length})
              </summary>
              <div className="mt-2 space-y-1">
                {bouwblok.vragen
                  .filter((v) => v.gearchiveerd)
                  .map((vraag) => (
                    <div key={vraag.id} className="flex items-center gap-2 text-xs text-ink-m">
                      <span className="flex-1 truncate">{vraag.tekst}</span>
                      <button
                        type="button"
                        onClick={() => herstelVraag(assessmentId, categorieId, bouwblok.id, vraag.id)}
                        className="text-ink-m underline hover:text-ink"
                      >
                        Herstellen
                      </button>
                    </div>
                  ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </details>
    <BevestigModal
      open={archiveren !== null}
      titel={archiveren?.soort === "vraag" ? "Vraag archiveren" : "Bouwblok archiveren"}
      bericht={
        archiveren?.soort === "vraag"
          ? 'Vraag archiveren? Ze verdwijnt uit de doorloopflow voor nieuwe invullingen, maar bestaande antwoorden blijven behouden in de score. Je kunt dit terugzetten via "Gearchiveerd" hieronder.'
          : `Bouwblok "${bouwblok.naam}" archiveren? Het verdwijnt uit de doorloopflow voor nieuwe invullingen, maar bestaande scores op zijn vragen blijven behouden. Je kunt dit terugzetten via "Gearchiveerd" hieronder.`
      }
      bevestigLabel="Archiveren"
      onBevestigen={() => {
        if (archiveren?.soort === "vraag") removeVraag(assessmentId, categorieId, bouwblok.id, archiveren.vraagId);
        else removeBouwblok(assessmentId, categorieId, bouwblok.id);
        setArchiveren(null);
      }}
      onAnnuleren={() => setArchiveren(null)}
    />
    </>
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
              <InfoIcoon>
                Een letterlijke emoji (datamodel.md, Assessment.icoon), bijv. 🩺. De sleutels{" "}
                {Object.keys(ASSESSMENT_ICONS).map((k) => `“${k}”`).join(" en ")} geven in plaats daarvan
                een eigen SVG-icoon.
              </InfoIcoon>
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
            <InfoIcoon>
              Titel en bron uit een vaste lijst, zie export-pdf-visual-volwassenheidsscan.md, &quot;Slotsectie
              per scan-type&quot;.
            </InfoIcoon>
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
                className="text-sm text-red-600 hover:underline"
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
                    <label className="flex items-center gap-1 text-xs text-ink-m" onClick={(e) => e.stopPropagation()}>
                      Gewicht
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={categorie.gewicht}
                        onChange={(e) =>
                          patchCategorie(assessmentId, categorie.id, { gewicht: Number(e.target.value) })
                        }
                        className="w-16 rounded-lg border border-gray-200 p-1 text-sm"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCategorieArchiveren(categorie);
                      }}
                      className="text-sm text-red-600 hover:underline"
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
                                  className="text-ink-m underline hover:text-ink"
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
                          className="text-ink-m underline hover:text-ink"
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
                          className="text-ink-m underline hover:text-ink"
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
