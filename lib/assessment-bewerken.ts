import { getAssessment, updateAssessment } from "@/lib/assessment-store";
import { Assessment, Bouwblok, FeatureCard, Organisatie } from "@/lib/types";
import { AuditInvoer, logAudit, nieuweGroepId } from "@/lib/audit-store";
import { nieuwId } from "@/lib/id";

/**
 * Wijzigingen op een Assessment in het contentbeheerscherm (beheerpagina.md, punt 2):
 * categorieën, bouwblokken, vragen en feature-cards toevoegen, aanpassen, archiveren
 * en herstellen. Zonder React: Alleen `updateAssessment` van de store.
 */
/** Leest/schrijft de bouwblokken op hun plek: genest in een categorie, of
 * plat op de assessment zelf als `categorieId` null is (geen categorie-laag). */
export function metBouwblokken(
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

export function alleVolgnummers(assessment: Assessment): number[] {
  const bouwblokken = assessment.categorieen
    ? assessment.categorieen.flatMap((c) => c.bouwblokken)
    : (assessment.bouwblokken ?? []);
  return bouwblokken.map((b) => b.volgnummer);
}

export function addCategorie(assessmentId: string) {
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

export function patchCategorie(
  assessmentId: string,
  categorieId: string,
  patch: Partial<{ naam: string; kleur: string }>
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
export function removeCategorie(assessmentId: string, categorieId: string) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    categorieen: (a.categorieen ?? []).map((c) =>
      c.id === categorieId ? { ...c, gearchiveerd: true } : c
    ),
  }));
}

export function herstelCategorie(assessmentId: string, categorieId: string) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    categorieen: (a.categorieen ?? []).map((c) =>
      c.id === categorieId ? { ...c, gearchiveerd: false } : c
    ),
  }));
}

export function addBouwblok(assessmentId: string, categorieId: string | null) {
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

export function patchBouwblok(
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

export function removeBouwblok(assessmentId: string, categorieId: string | null, bouwblokId: string) {
  updateAssessment(assessmentId, (a) =>
    metBouwblokken(a, categorieId, (bouwblokken) =>
      bouwblokken.map((b) => (b.id === bouwblokId ? { ...b, gearchiveerd: true } : b))
    )
  );
}

export function herstelBouwblok(assessmentId: string, categorieId: string | null, bouwblokId: string) {
  updateAssessment(assessmentId, (a) =>
    metBouwblokken(a, categorieId, (bouwblokken) =>
      bouwblokken.map((b) => (b.id === bouwblokId ? { ...b, gearchiveerd: false } : b))
    )
  );
}

export function addVraag(assessmentId: string, categorieId: string | null, bouwblokId: string) {
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

export function patchVraag(
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

export function removeVraag(
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

export function herstelVraag(
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

export function schakelCategorieLaag(assessmentId: string, aanzetten: boolean) {
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

export function patchFeatureCard(assessmentId: string, index: number, patch: Partial<FeatureCard>) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    featureCards: a.featureCards.map((c, i) => (i === index ? { ...c, ...patch } : c)),
  }));
}

export function addFeatureCard(assessmentId: string) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    featureCards: [...a.featureCards, { titel: "Nieuwe feature", tekst: "" }],
  }));
}

export function removeFeatureCard(assessmentId: string, index: number) {
  updateAssessment(assessmentId, (a) => ({
    ...a,
    featureCards: a.featureCards.filter((_, i) => i !== index),
  }));
}

export interface GewichtWijziging {
  bouwblokId: string;
  /** Nieuw gewicht, groter dan 0. */
  gewicht: number;
}

/**
 * Aantal scans (met minstens één antwoord in dit bouwblok) waarvan de score
 * verandert als het gewicht van dit bouwblok wijzigt. Dat zijn alle scans
 * van dit Assessment met een antwoord in het blok: Categorie-, overall- en
 * Meting-scores rekenen allemaal mee met het gewicht.
 */
export function aantalScansMetAntwoordInBouwblok(
  organisaties: Organisatie[],
  assessmentId: string,
  bouwblok: Bouwblok
): number {
  const vraagIds = new Set(bouwblok.vragen.map((v) => v.id));
  let aantal = 0;
  for (const organisatie of organisaties) {
    const metingIds = new Set(
      organisatie.scanUitvoeringen.filter((m) => m.assessmentId === assessmentId).map((m) => m.id)
    );
    for (const meting of organisatie.scanUitvoeringen) {
      if (!metingIds.has(meting.id)) continue;
      for (const invulling of meting.invullingen) {
        if (Object.keys(invulling.antwoorden).some((id) => vraagIds.has(id))) aantal++;
      }
    }
  }
  return aantal;
}

/**
 * Past één of meer gewichten in één opslagactie toe (`beheerpagina.md` punt 2,
 * Weging per bouwblok) en logt per gewijzigd bouwblok één
 * `bouwblok.gewichtGewijzigd` (`datamodel.md`, Audit, Gewichtswijziging).
 * Zonder opgegeven `organisaties` wordt het aantal scans als 0 gelogd.
 */
export function pasGewichtenToe(
  assessmentId: string,
  wijzigingen: GewichtWijziging[],
  organisaties: Organisatie[]
): void {
  const assessment = getAssessment(assessmentId);
  if (!assessment) return;
  const gewicht = new Map(wijzigingen.map((w) => [w.bouwblokId, w.gewicht]));
  const alleBouwblokken = [
    ...(assessment.categorieen ?? []).flatMap((c) => c.bouwblokken),
    ...(assessment.bouwblokken ?? []),
  ];
  const gelogd: AuditInvoer[] = [];
  const groepId = wijzigingen.length > 1 ? nieuweGroepId() : null;
  for (const bouwblok of alleBouwblokken) {
    const nieuw = gewicht.get(bouwblok.id);
    if (nieuw === undefined || nieuw === bouwblok.gewicht) continue;
    gelogd.push({
      actie: "bouwblok.gewichtGewijzigd",
      entiteitType: "bouwblok",
      entiteitId: bouwblok.id,
      entiteitNaam: bouwblok.naam,
      groepId,
      details: {
        bouwblokNaam: bouwblok.naam,
        volgnummer: bouwblok.volgnummer,
        assessmentNaam: assessment.naam,
        assessmentId: assessment.id,
        oudGewicht: bouwblok.gewicht,
        nieuwGewicht: nieuw,
        aantalScans: aantalScansMetAntwoordInBouwblok(organisaties, assessmentId, bouwblok),
      },
    });
  }
  if (gelogd.length === 0) return;
  updateAssessment(assessmentId, (a) => {
    const pas = (b: Bouwblok): Bouwblok => (gewicht.has(b.id) ? { ...b, gewicht: gewicht.get(b.id)! } : b);
    return {
      ...a,
      categorieen: a.categorieen
        ? a.categorieen.map((c) => ({ ...c, bouwblokken: c.bouwblokken.map(pas) }))
        : null,
      bouwblokken: a.bouwblokken ? a.bouwblokken.map(pas) : null,
    };
  });
  logAudit(gelogd);
}
