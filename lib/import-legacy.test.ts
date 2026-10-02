import { describe, expect, it } from "vitest";
import { detecteerBronFormaat } from "./import-legacy";

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
