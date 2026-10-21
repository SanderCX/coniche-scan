import { describe, expect, it } from "vitest";
import { spanningsmeter } from "@/data/spanningsmeter-assessment";
import { demoSpanningGroep } from "@/data/demo-antwoorden-spanning";
import { Antwoord } from "./types";
import {
  fmt1,
  fmtVerschil,
  groepProfiel,
  groepZichtbaar,
  isSpanning,
  niveauNaam,
  niveauVan,
  rond1,
  spanningProfiel,
  spanningZin,
  spanningsvelden,
} from "./spanning";

const velden = spanningsvelden(spanningsmeter);

/** Antwoorden uit vijf waarden per veld, in de volgorde van de velden. */
function antwoorden(perVeld: number[][]): Record<string, Antwoord> {
  const uit: Record<string, Antwoord> = {};
  velden.forEach((veld, i) => veld.vragen.forEach((v, j) => (uit[v.id] = perVeld[i][j])));
  return uit;
}

// De fictieve deelnemer uit `datamodel.md`, Scoreberekening, Spanningsmeter.
const deelnemer = antwoorden([
  [4, 4, 4, 4, 3],
  [3, 3, 2, 3, 2],
  [2, 2, 3, 2, 2],
  [3, 4, 3, 3, 4],
  [2, 3, 2, 3, 2],
  [4, 4, 4, 4, 4],
]);

describe("de Spanningsmeter als Assessment", () => {
  it("heeft zes velden in de volgorde van de bouwlogica en vijf vragen per veld, zonder categorielaag", () => {
    expect(isSpanning(spanningsmeter)).toBe(true);
    expect(velden.map((v) => v.korteNaam)).toEqual(["Verhaal", "Regie", "Gedrag", "Data", "Processen", "Technologie"]);
    expect(velden.every((v) => v.vragen.length === 5 && v.ijkpunten?.length === 5)).toBe(true);
    expect(spanningsmeter.categorieen).toBeNull();
    expect(velden.flatMap((v) => v.vragen)).toHaveLength(30);
    expect(new Set(velden.flatMap((v) => v.vragen.map((q) => q.id))).size).toBe(30);
  });
});

describe("afronden en niveau", () => {
  it("rondt half-away-from-zero af, ook bij negatieve getallen", () => {
    expect(rond1(2.25)).toBe(2.3);
    expect(rond1(-1.25)).toBe(-1.3);
    expect(rond1(3.0666)).toBe(3.1);
  });

  it("legt de grenzen van de niveaus op 1,5, 2,5, 3,5 en 4,5", () => {
    expect([1, 1.4, 1.5, 2.4, 2.5, 3.4, 3.5, 4.4, 4.5, 5].map(niveauVan)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
    expect(niveauNaam(spanningsmeter, 3)).toBe("Georganiseerd");
  });

  it("schrijft getallen met een decimale komma en een echt min-teken", () => {
    expect(fmt1(3.8)).toBe("3,8");
    expect(fmtVerschil(-1.2)).toBe("−1,2");
    expect(fmtVerschil(1.8)).toBe("+1,8");
    expect(fmtVerschil(0)).toBe("0,0");
  });
});

describe("het profiel van een deelnemer", () => {
  const profiel = spanningProfiel(spanningsmeter, deelnemer);

  it("rekent de veldscores en de niveaus uit het rekenvoorbeeld", () => {
    expect(profiel.velden.map((v) => v.score)).toEqual([3.8, 2.6, 2.2, 3.4, 2.4, 4.0]);
    expect(profiel.velden.map((v) => niveauNaam(spanningsmeter, v.niveau!))).toEqual([
      "Geïntegreerd",
      "Georganiseerd",
      "Gefragmenteerd",
      "Georganiseerd",
      "Gefragmenteerd",
      "Geïntegreerd",
    ]);
  });

  it("rekent de spanning ten opzichte van het laagste voorgaande veld", () => {
    expect(profiel.velden.map((v) => (v.spanning === null ? null : rond1(v.spanning)))).toEqual([null, -1.2, -0.4, 1.2, 0.2, 1.8]);
    expect(profiel.velden[1].referentie?.korteNaam).toBe("Verhaal");
    expect(profiel.velden[5].referentie?.korteNaam).toBe("Gedrag");
  });

  it("noemt Technologie de grootste spanning en maakt er een zin van", () => {
    expect(profiel.grootste?.veld.korteNaam).toBe("Technologie");
    expect(spanningZin(profiel.grootste!)).toBe("Technologie loopt 1,8 voor op Mensen & gedrag.");
    expect(spanningZin(profiel.velden[1])).toBe("Governance, regie & control blijft 1,2 achter bij Verhaal & leiderschap.");
  });

  it("toont het gemiddeld niveau als weergave: 3,1 en Georganiseerd", () => {
    expect(profiel.gemiddeld?.score).toBe(3.1);
    expect(niveauNaam(spanningsmeter, profiel.gemiddeld!.niveau)).toBe("Georganiseerd");
  });

  it("laat een 0 niet meetellen: 4, 4, 4, 4, 0 is 4,0 over vier antwoorden", () => {
    const a = { ...deelnemer, [velden[0].vragen[4].id]: 0 };
    const v = spanningProfiel(spanningsmeter, a).velden[0];
    expect(v.score).toBe(4.0);
    expect(v.beoordeeld).toBe(4);
  });

  it("geeft een veld met minder dan drie beoordeelde vragen geen score en laat het buiten spanning en gemiddelde", () => {
    const a = { ...deelnemer };
    velden[1].vragen.slice(0, 3).forEach((q) => (a[q.id] = 0)); // Regie: nog twee beoordeeld
    const p = spanningProfiel(spanningsmeter, a);
    expect(p.velden[1].score).toBeNull();
    expect(p.velden[1].spanning).toBeNull();
    // Gedrag wordt nu gemeten tegen Verhaal alleen (3,8) in plaats van tegen Regie.
    expect(rond1(p.velden[2].spanning!)).toBe(-1.6);
    expect(p.gemiddeld?.score).toBe(rond1((3.8 + 2.2 + 3.4 + 2.4 + 4.0) / 5));
  });

  it("heeft geen profiel zonder antwoorden", () => {
    const p = spanningProfiel(spanningsmeter, {});
    expect(p.velden.every((v) => v.score === null)).toBe(true);
    expect(p.grootste).toBeNull();
    expect(p.gemiddeld).toBeNull();
  });
});

describe("het profiel van een groep", () => {
  // De fictieve groep van 12 scans uit `datamodel.md` en de voorbeeld-output: Dezelfde data staat in de film en op de pagina.
  const scans = demoSpanningGroep;
  const groep = groepProfiel(spanningsmeter, scans, 3);

  it("rekent de groepsgemiddelden, de spanning daarop en de grootste spanning", () => {
    expect(groep.velden.map((v) => v.score)).toEqual([3.6, 2.9, 2.7, 3.2, 2.5, 3.9]);
    expect(groep.velden.map((v) => (v.spanning === null ? null : rond1(v.spanning)))).toEqual([null, -0.7, -0.2, 0.5, -0.2, 1.4]);
    expect(groep.grootste?.veld.korteNaam).toBe("Technologie");
    expect(groep.grootste?.referentie?.korteNaam).toBe("Processen");
  });

  it("noemt de laagste en hoogste score, de spreiding en het veld dat het meest uiteenloopt", () => {
    const gedrag = groep.velden[2];
    expect([gedrag.laagste, gedrag.hoogste, gedrag.spreiding]).toEqual([1.4, 4.0, 2.6]);
    expect(groep.meestUiteenlopend?.veld.korteNaam).toBe("Gedrag");
    expect(groep.scans).toBe(12);
    expect(groep.velden.every((v) => v.scansMetScore === 12)).toBe(true);
  });

  it("rekent het gemiddeld niveau van de groep: 3,1 en Georganiseerd", () => {
    expect(groep.gemiddeld?.score).toBe(3.1);
    expect(niveauNaam(spanningsmeter, groep.gemiddeld!.niveau)).toBe("Georganiseerd");
  });

  it("splitst per rolgroep en rekent het verschil per veld", () => {
    expect(groep.rollen.map((r) => [r.rolgroep, r.scans])).toEqual([
      ["Direct met klanten", 5],
      ["Leidinggevende", 4],
      ["MT en directie", 3],
    ]);
    const verhaal = groep.rollen.map((r) => rond1(r.gemiddelden[0] as number));
    expect(verhaal).toEqual([3.0, 3.6, 4.6]);
    expect(rond1(groep.rolVerschil[0] as number)).toBe(1.6);
    expect(groep.grootsteRolVerschil).toBe(groep.rolVerschil[0]);
  });

  it("laat een rolgroep onder de drempel weg, en de hele uitsplitsing bij minder dan twee rolgroepen", () => {
    expect(groepProfiel(spanningsmeter, scans, 4).rollen.map((r) => r.rolgroep)).toEqual(["Direct met klanten", "Leidinggevende"]);
    const alleen = groepProfiel(spanningsmeter, scans, 5);
    expect(alleen.rollen).toEqual([]);
    expect(alleen.rolVerschil.every((v) => v === null)).toBe(true);
    expect(alleen.grootsteRolVerschil).toBeNull();
  });

  it("toont de groep voor een Lead pas vanaf het minimum aantal afgeronde scans", () => {
    expect(groepZichtbaar(4, 5)).toBe(false);
    expect(groepZichtbaar(5, 5)).toBe(true);
    expect(groepZichtbaar(0, 0)).toBe(false);
  });

  it("heeft geen meest uiteenlopend veld bij één scan", () => {
    expect(groepProfiel(spanningsmeter, [scans[0]], 3).meestUiteenlopend).toBeNull();
  });
});
