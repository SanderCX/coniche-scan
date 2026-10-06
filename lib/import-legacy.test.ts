import { describe, expect, it } from "vitest";
import { bestandOverslaanReden, detecteerBronFormaat } from "./import-legacy";

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
