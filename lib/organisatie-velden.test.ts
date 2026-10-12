import { describe, expect, it } from "vitest";
import { organisatieVelden } from "@/data/organisatie-velden";

const techstack = organisatieVelden.find((v) => v.id === "techstack")!;
const categorie = (id: string) => techstack.subvelden!.find((c) => c.id === id)!;

describe("organisatievelden, techstack", () => {
  it("heeft zes categorieën in de volgorde Contact center, WFM, CRM, Kennismanagement, Conversational AI, LLM", () => {
    expect(techstack.subvelden!.map((c) => c.label)).toEqual([
      "Contact center",
      "WFM",
      "CRM",
      "Kennismanagement",
      "Conversational AI",
      "LLM-oplossing",
    ]);
  });

  it("geeft elke categorie een keuzelijst voor de Oplossing met Anders…", () => {
    for (const cat of techstack.subvelden!) {
      const oplossing = cat.subvelden!.find((v) => v.id === "leverancier")!;
      expect(oplossing.type, cat.label).toBe("select");
      expect(oplossing.eigenOptie, cat.label).toBe(true);
    }
  });

  it("heeft per categorie met een lijst één keuzelijst 'Ondersteund door' met Geen ondersteuning vooraan", () => {
    for (const id of ["techstack-contact-center", "techstack-wfm", "techstack-conversational-ai", "techstack-crm", "techstack-kennismanagement"]) {
      const velden = categorie(id).subvelden!;
      const ondersteuner = velden.find((v) => v.id === "ondersteuner")!;
      expect(ondersteuner.label).toBe("Ondersteund door");
      expect(ondersteuner.voorop).toEqual(["Geen ondersteuning"]);
      expect(ondersteuner.eigenOptie).toBe(true);
      // CRM zonder de drie BPO's (Concentrix, Teleperformance, Yource) en met BusinessBase.
      expect(ondersteuner.opties).toHaveLength(id === "techstack-crm" ? 23 : 25);
      // Het oude veld zelf/extern is er niet meer naast.
      expect(velden.some((v) => v.id === "ondersteuning")).toBe(false);
    }
  });

  it("heeft bij CRM BusinessBase en geen BPO's als ondersteunende partij", () => {
    const opties = categorie("techstack-crm").subvelden!.find((v) => v.id === "ondersteuner")!.opties!;
    expect(opties).toContain("BusinessBase");
    for (const bpo of ["Concentrix", "Teleperformance", "Yource"]) expect(opties).not.toContain(bpo);
  });

  it("heeft bij LLM-oplossing een modelfamilie en een toegangsroute, zonder ondersteuning, deployment en cloud", () => {
    const velden = categorie("techstack-llm-oplossing").subvelden!;
    expect(velden.map((v) => v.id)).toEqual(["leverancier", "toegangsroute"]);
    const [modelfamilie, route] = velden;
    expect(modelfamilie.label).toBe("LLM (modelfamilie)");
    expect(modelfamilie.voorop).toHaveLength(16);
    expect(modelfamilie.voorop![0]).toBe("OpenAI GPT");
    expect(modelfamilie.voorop!.at(-1)).toBe("Onbekend / niet openbaar");
    expect(route.label).toBe("LLM-toegangsroute");
    expect(route.voorop).toHaveLength(7);
    expect(route.voorop![0]).toBe("Direct via modelleverancier (API)");
    expect(route.voorop!.at(-1)).toBe("EU-gehost / sovereign");
    expect(modelfamilie.eigenOptie && route.eigenOptie).toBe(true);
  });

  it("heeft Deploymentmodel en Cloudleverancier bij elke categorie behalve LLM-oplossing, in aangeleverde volgorde", () => {
    for (const cat of techstack.subvelden!.filter((c) => c.id !== "techstack-llm-oplossing")) {
      const velden = cat.subvelden!;
      const deployment = velden.find((v) => v.id === "deploymentmodel")!;
      const cloud = velden.find((v) => v.id === "cloudleverancier")!;
      expect(deployment.label, cat.label).toBe("Deploymentmodel");
      expect(deployment.eigenOptie).toBe(true);
      expect(deployment.voorop).toHaveLength(9);
      expect(deployment.voorop![0]).toBe("Public Cloud (SaaS, multi-tenant)");
      expect(deployment.voorop!.at(-1)).toBe("Multicloud");
      expect(cloud.label).toBe("Cloudleverancier");
      expect(cloud.eigenOptie).toBe(true);
      expect(cloud.voorop).toHaveLength(20);
      expect(cloud.voorop![0]).toBe("Microsoft Azure");
      expect(cloud.voorop!.at(-1)).toBe("Eigen datacenter");
      // Op dezelfde regel: Beide staan direct in de groep, naast Oplossing.
      expect(velden.map((v) => v.id).slice(-2)).toEqual(["deploymentmodel", "cloudleverancier"]);
    }
  });

  it("kent geen aparte categorie IT en deployment meer", () => {
    expect(techstack.subvelden!.some((c) => c.id === "techstack-it-en-deployment")).toBe(false);
  });

  it("kent geen dubbelen binnen een lijst", () => {
    for (const cat of techstack.subvelden!) {
      for (const veld of cat.subvelden!) {
        const sleutels = [...(veld.voorop ?? []), ...(veld.opties ?? [])].map((o) => o.toLowerCase());
        expect(new Set(sleutels).size, `${cat.label} / ${veld.label}`).toBe(sleutels.length);
      }
    }
  });
});
