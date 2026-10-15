import { describe, expect, it } from "vitest";
import { migreerFteManagementSupport } from "./fte";

describe("migreerFteManagementSupport", () => {
  it("zet een los getal om naar een groep met aantal", () => {
    const uit = migreerFteManagementSupport({ fte: { "fte-management-support": 28, "fte-it-devops": { aantal: 14 } } });
    expect(uit).toEqual({ fte: { "fte-management-support": { aantal: 28 }, "fte-it-devops": { aantal: 14 } } });
  });

  it("laat een groep, een lege waarde en ontbrekende FTE ongemoeid", () => {
    const groep = { fte: { "fte-management-support": { aantal: 5 } } };
    expect(migreerFteManagementSupport(groep)).toBe(groep);
    const leeg = { fte: {} };
    expect(migreerFteManagementSupport(leeg)).toBe(leeg);
    const geen = {};
    expect(migreerFteManagementSupport(geen)).toBe(geen);
  });
});
