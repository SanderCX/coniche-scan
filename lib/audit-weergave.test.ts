import { describe, expect, it } from "vitest";
import type { AuditEvent } from "./audit-store";
import { actorLabel, auditCsv, bouwImportGroepen, detailTekst, importGroepTekst, inPeriode, periodeBereik, typeVan } from "./audit-weergave";

const event = (extra: Partial<AuditEvent>): AuditEvent => ({
  id: "e1",
  actorType: "gebruiker",
  actorId: "g1",
  actorNaam: "Beheerder",
  actie: "organisatie.verwijderd",
  entiteitType: "organisatie",
  entiteitId: "o1",
  entiteitNaam: "Acme",
  tijdstip: "2026-10-05T10:00:00.000Z",
  groepId: null,
  details: null,
  ...extra,
});

describe("audit-weergave", () => {
  it("typeVan geeft het deel vóór de punt", () => {
    expect(typeVan("organisatie.verwijderd")).toBe("organisatie");
  });

  it("actor: Gebruiker, Systeem, en bij een Respondent alleen Respondent met de Organisatie", () => {
    expect(actorLabel(event({}))).toBe("Beheerder");
    expect(actorLabel(event({ actorType: "systeem", actorNaam: null }))).toBe("Systeem");
    expect(
      actorLabel(event({ actorType: "respondent", actorNaam: "Respondent", details: { organisatieNaam: "Acme" } }))
    ).toBe("Respondent (Acme)");
  });

  it("details zijn leesbaar, met namen en zonder ID's", () => {
    const tekst = detailTekst(
      event({
        actie: "scan.geimporteerd",
        details: { organisatieId: "o1", organisatieNaam: "Acme", metingLabel: "Nulmeting", assessmentNaam: "Zorgscan", aantalScans: 3 },
      })
    );
    expect(tekst).toContain("Organisatie: Acme");
    expect(tekst).toContain("Meting: Nulmeting");
    expect(tekst).not.toContain("o1");
  });

  it("een gewichtswijziging noemt bouwblok, volgnummer, oud en nieuw gewicht", () => {
    const tekst = detailTekst(
      event({
        actie: "bouwblok.gewichtGewijzigd",
        details: { bouwblokNaam: "Kanaalmanagement", volgnummer: 10, assessmentNaam: "Zorgscan", oudGewicht: 1, nieuwGewicht: 2, aantalScans: 5 },
      })
    );
    expect(tekst).toContain("Bouwblok: #10 Kanaalmanagement");
    expect(tekst).toContain("Oud gewicht: 1");
    expect(tekst).toContain("Nieuw gewicht: 2");
  });

  it("een import wordt één groep met aantallen en status", () => {
    const g = "g-1";
    const events = [
      event({ id: "a", actie: "import.gestart", groepId: g, entiteitType: "import", details: { aantalBestanden: 3, aantalRijen: 4, bestanden: [{ naam: "a.csv", bronFormaat: "oud", overgeslagen: false }, { naam: "b.csv", bronFormaat: "oud", overgeslagen: false }, { naam: "c.csv", bronFormaat: null, overgeslagen: true, reden: "geen antwoorden" }] } }),
      event({ id: "b", actie: "scan.geimporteerd", groepId: g, entiteitType: "scan" }),
      event({ id: "c", actie: "scan.geimporteerd", groepId: g, entiteitType: "scan" }),
      event({ id: "d", actie: "import.rijMislukt", groepId: g, entiteitType: "import" }),
      event({ id: "e", actie: "organisatie.verwijderd", groepId: "andere" }),
    ];
    const groepen = bouwImportGroepen(events);
    expect(groepen).toHaveLength(1);
    expect(groepen[0].status).toBe("deels");
    expect(importGroepTekst(groepen[0])).toBe("Import oude tool: 3 bestanden, 2 geïmporteerd, 1 overgeslagen, 1 mislukt, 1 nog niet geïmporteerd");
  });

  it("de CSV heeft BOM, puntkomma's en één rij per gebeurtenis, met details_json", () => {
    const csv = auditCsv([event({ details: { aantalScans: 2 } })]);
    expect(csv.startsWith("﻿\"") || csv.startsWith("﻿tijdstip")).toBe(true);
    const regels = csv.trim().split("\r\n");
    expect(regels).toHaveLength(2);
    expect(regels[0]).toContain("details_json");
    expect(regels[1]).toContain('"{""aantalScans"":2}"');
  });

  it("periodeBereik en inPeriode werken met inclusieve datums", () => {
    const nu = new Date("2026-10-05T12:00:00");
    expect(periodeBereik("vandaag", nu)).toEqual({ van: "2026-10-05", tot: "2026-10-05" });
    expect(periodeBereik("7", nu)).toEqual({ van: "2026-09-28", tot: "2026-10-05" });
    expect(periodeBereik("alles", nu)).toEqual({ van: "", tot: "" });
    expect(inPeriode("2026-10-05T23:30:00", "2026-10-05", "2026-10-05")).toBe(true);
    expect(inPeriode("2026-10-04T23:30:00", "2026-10-05", "")).toBe(false);
  });
});
