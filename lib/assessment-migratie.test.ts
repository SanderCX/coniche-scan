import { describe, expect, it } from "vitest";
import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { aiVolwassenheid } from "@/data/ai-scan-assessment";
import { zorgscan } from "@/data/zorgscan-assessment";
import { verrijkAssessment } from "./assessment-migratie";

describe("het label van een bouwsteen (22 oktober 2026)", () => {
  it("heet bij Klantcontact Volwassenheid en Zorg overal Bouwsteen en bij de AI-scan AI-domein", () => {
    for (const a of [klantcontactVolwassenheid, zorgscan]) {
      expect(a.bouwblokLabel).toBe("Bouwsteen");
      expect(a.bouwblokEenheidEnkelvoud).toBe("Bouwsteen");
      expect(a.bouwblokEenheidMeervoud).toBe("bouwstenen");
    }
    expect(aiVolwassenheid.bouwblokLabel).toBe("AI-domein");
  });
  it("zet een opgeslagen kopie met het label Bouwblok om naar Bouwsteen, ook de eenheid", () => {
    const v = verrijkAssessment({ ...klantcontactVolwassenheid, bouwblokLabel: "Bouwblok", bouwblokEenheidEnkelvoud: "Bouwblok", bouwblokEenheidMeervoud: "bouwblokken" });
    expect(v.bouwblokLabel).toBe("Bouwsteen");
    expect(v.bouwblokEenheidEnkelvoud).toBe("Bouwsteen");
    expect(v.bouwblokEenheidMeervoud).toBe("bouwstenen");
  });
  it("laat een eigen label staan", () => {
    expect(verrijkAssessment({ ...klantcontactVolwassenheid, bouwblokLabel: "Pijler" }).bouwblokLabel).toBe("Pijler");
  });
  it("geeft een ontbrekend label de standaard", () => {
    const zonder = { ...klantcontactVolwassenheid } as Partial<typeof klantcontactVolwassenheid>;
    delete zonder.bouwblokLabel;
    expect(verrijkAssessment(zonder as typeof klantcontactVolwassenheid).bouwblokLabel).toBe("Bouwsteen");
  });
});
