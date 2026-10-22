import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { alleBouwblokkenMetGroep } from "./assessment-structuur";
import { describe, expect, it } from "vitest";
import { bestandOverslaanReden, detecteerBronFormaat, valideerNieuweExportRijen } from "./import-legacy";
import type { Assessment } from "./types";

const OUD = ["assessment_id", "organization_name", "respondent_email", "created_at", "status", "answers"];
const NIEUW = ["organisatie_naam", "meting_label", "assessment_naam", "respondent_email", "status", "antwoorden"];

describe("detecteerBronFormaat", () => {
  it("herkent het oude formaat met en zonder aanhalingstekens in de header", () => {
    expect(detecteerBronFormaat(OUD.join(",") + "\n")).toBe("oud");
    expect(detecteerBronFormaat(OUD.map((k) => `"${k}"`).join(",") + "\n")).toBe("oud");
  });

  it("herkent onze eigen export (puntkomma), ook met BOM en aanhalingstekens", () => {
    expect(detecteerBronFormaat(NIEUW.join(";") + "\n")).toBe("nieuw");
    expect(detecteerBronFormaat("﻿" + NIEUW.map((k) => `"${k}"`).join(";") + "\n")).toBe("nieuw");
  });

  it("geeft undefined voor een bestand dat geen van beide is", () => {
    expect(detecteerBronFormaat("ID,Type,Organisatie,Status\n1,a,b,c\n")).toBeUndefined();
    expect(detecteerBronFormaat("")).toBeUndefined();
  });
});

describe("bestandOverslaanReden", () => {
  const kop = ["assessment_id", "organization_name", "respondent_email", "created_at", "status"];

  it("slaat een batch-export zonder kolom answers over", () => {
    expect(bestandOverslaanReden(kop.join(",") + "\n1,Acme,a@x.nl,2026-01-01,completed\n")).toMatch(/geen antwoorden per vraag/);
  });

  it("slaat een bestand met overal een lege answers over", () => {
    expect(bestandOverslaanReden([...kop, "answers"].join(",") + "\n1,Acme,a@x.nl,2026-01-01,completed,\n")).toMatch(/geen antwoorden per vraag/);
  });

  it("geeft eigen meldingen voor geen kopregel, geen rijen en ongeldige JSON", () => {
    expect(bestandOverslaanReden("")).toMatch(/kopregel/);
    expect(bestandOverslaanReden([...kop, "answers"].join(",") + "\n")).toMatch(/geen rijen/);
    expect(bestandOverslaanReden([...kop, "answers"].join(",") + "\n1,Acme,a@x.nl,2026-01-01,completed,niets\n")).toMatch(/geldige JSON/);
  });

  it("laat een bestand met antwoorden en onze eigen export door", () => {
    expect(bestandOverslaanReden([...kop, "answers"].join(",") + "\n1,Acme,a@x.nl,2026-01-01,completed,[]\n")).toBeNull();
    expect(bestandOverslaanReden(NIEUW.join(";") + "\n")).toBeNull();
  });
});

describe("notitie per scan bij de eigen export", () => {
  const rij = (extra: Record<string, string> = {}) => ({
    organisatie_naam: "Org", meting_label: "Nul", assessment_naam: "Onbekend", respondent_naam: "", respondent_email: "a@x.nl",
    respondent_functie: "", respondent_team: "", status: "afgerond", uitgenodigd_op: "", gestart_op: "", afgerond_op: "",
    organisatie_kenmerken: "", antwoorden: "[]", opmerkingen_per_bouwsteen: "{}", ...extra,
  });

  it("leest de kolom scan_notitie als notitie van de scan, en laat hem leeg als de kolom ontbreekt", () => {
    const [met, zonder] = valideerNieuweExportRijen([rij({ scan_notitie: " Jan Jansen " }), rij()], [] as Assessment[]);
    expect(met.scanNotitie).toBe("Jan Jansen");
    expect(zonder.scanNotitie).toBe("");
  });
});

describe("de kolom met opmerkingen per bouwsteen (22 oktober 2026)", () => {
  const assessment = klantcontactVolwassenheid;
  const bouwblokken = alleBouwblokkenMetGroep(assessment).map((b) => b.bouwblok);
  const items = (nieuw: boolean) =>
    JSON.stringify(
      bouwblokken.flatMap((b) =>
        b.vragen.map((v) => ({ ...(nieuw ? { bouwsteenId: b.id, bouwsteenNaam: b.naam } : { bouwblokId: b.id, bouwblokNaam: b.naam }), vraagId: v.id, score: 3 }))
      )
    );
  const rij = (extra: Record<string, string>, nieuw = true) => ({
    organisatie_naam: "Org", meting_label: "Nul", assessment_naam: assessment.naam, respondent_naam: "", respondent_email: "a@x.nl",
    respondent_functie: "", respondent_team: "", status: "afgerond", uitgenodigd_op: "", gestart_op: "", afgerond_op: "",
    organisatie_kenmerken: "", antwoorden: items(nieuw), ...extra,
  });
  const opm = JSON.stringify({ [bouwblokken[0].id]: "Een opmerking" });

  it("leest zowel opmerkingen_per_bouwsteen als de oude naam opmerkingen_per_bouwblok, met de oude of de nieuwe namen in de antwoorden", () => {
    const [nieuw, oud] = valideerNieuweExportRijen(
      [rij({ opmerkingen_per_bouwsteen: opm }), rij({ opmerkingen_per_bouwblok: opm }, false)],
      [assessment]
    );
    expect(nieuw.ok).toBe(true);
    expect(nieuw.opmerkingenPerBouwblok).toEqual({ [bouwblokken[0].id]: "Een opmerking" });
    expect(oud.ok).toBe(true);
    expect(oud.opmerkingenPerBouwblok).toEqual({ [bouwblokken[0].id]: "Een opmerking" });
  });

  it("meldt een ongeldige JSON met de nieuwe kolomnaam", () => {
    const [kapot] = valideerNieuweExportRijen([rij({ opmerkingen_per_bouwsteen: "{kapot" })], [assessment]);
    expect(kapot.ok).toBe(false);
    expect(kapot.probleem).toContain("opmerkingen_per_bouwsteen");
  });
});
