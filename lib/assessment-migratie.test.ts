import { describe, expect, it } from "vitest";
import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { aiVolwassenheid } from "@/data/ai-scan-assessment";
import { zorgscan } from "@/data/zorgscan-assessment";
import { verrijkAssessment } from "./assessment-migratie";

describe("het label van een bouwblok (22 oktober 2026)", () => {
  it("heet standaard Bouwblok bij Klantcontact Volwassenheid en Zorg, en AI-domein bij de AI-scan", () => {
    expect(klantcontactVolwassenheid.bouwblokLabel).toBe("Bouwblok");
    expect(zorgscan.bouwblokLabel).toBe("Bouwblok");
    expect(aiVolwassenheid.bouwblokLabel).toBe("AI-domein");
  });
  it("zet een opgeslagen kopie met het oude label Bouwsteen om naar Bouwblok", () => {
    expect(verrijkAssessment({ ...klantcontactVolwassenheid, bouwblokLabel: "Bouwsteen" }).bouwblokLabel).toBe("Bouwblok");
  });
  it("laat een eigen label staan", () => {
    expect(verrijkAssessment({ ...klantcontactVolwassenheid, bouwblokLabel: "Pijler" }).bouwblokLabel).toBe("Pijler");
  });
  it("geeft een ontbrekend label de standaard", () => {
    const zonder = { ...klantcontactVolwassenheid } as Partial<typeof klantcontactVolwassenheid>;
    delete zonder.bouwblokLabel;
    expect(verrijkAssessment(zonder as typeof klantcontactVolwassenheid).bouwblokLabel).toBe("Bouwblok");
  });
});
