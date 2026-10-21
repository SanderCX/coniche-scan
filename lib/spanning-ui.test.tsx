import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { spanningsmeter } from "@/data/spanningsmeter-assessment";
import { demoAntwoordenSpanning, demoSpanningGroep } from "@/data/demo-antwoorden-spanning";
import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { assessments } from "@/data/assessments";
import { heeftEigenResultaat } from "./assessment-structuur";
import { contentSoort, overDezeScan, paginaSecties, tegelInhoud } from "./landing";
import { filmVariant } from "./film";
import { teaserVoorMeting, teaserVoorScan } from "./mijn-metingen";
import { standaardInfoTekst } from "@/data/info-teksten";
import { HelpFilm } from "@/components/help/HelpFilm";
import { SpanningVeldenSectie } from "@/components/assessment/SpanningVeldenSectie";
import { SpanningResultaat } from "@/components/spanning/SpanningResultaat";
import { Antwoordkeuze } from "@/components/spanning/Antwoordkeuze";
import { SpanningVeldForm } from "@/components/spanning/SpanningVeldForm";
import { ScanInvulling } from "./types";

const veld = (spanningsmeter.bouwblokken ?? [])[0];

describe("de Spanningsmeter op de Assessment-pagina en scherm 1", () => {
  it("is het vijfde Assessment en heeft een eigen opbouw van het resultaat", () => {
    expect(assessments.map((a) => a.id)).toContain("spanningsmeter");
    expect(heeftEigenResultaat(spanningsmeter)).toBe(true);
    expect(heeftEigenResultaat(klantcontactVolwassenheid)).toBe(false);
  });

  it("heeft de secties De 6 spanningsvelden, Praktisch, Wat krijg ik en Visie", () => {
    expect(contentSoort(spanningsmeter)).toBe("spanning");
    expect(paginaSecties(spanningsmeter).map((s) => [s.id, s.label])).toEqual([
      ["velden", "De 6 spanningsvelden"],
      ["praktisch", "Praktisch"],
      ["wat", "Wat krijg ik"],
      ["visie", "Visie"],
    ]);
    expect(overDezeScan(spanningsmeter)).toEqual({ tekst: "Over deze scan: spanningsvelden en visie", href: "/spanningsmeter" });
  });

  it("noemt in de tegel het aantal vragen en velden en het eigen profiel", () => {
    const t = tegelInhoud(spanningsmeter);
    expect(t.zin).toBe("Zie waar de spanning zit tussen verhaal, regie, gedrag, data, processen en technologie.");
    expect(t.punten.map((p) => p.tekst)).toEqual(["30 vragen, ±10 tot 15 minuten", "6 spanningsvelden", "Je eigen Spanningsprofiel, daarna de groep naast elkaar"]);
    expect(t.punten.map((p) => p.icoon)).toEqual(["klok", "lagen", "vlag"]);
  });

  it("heeft een eigen variant van de film met drie stapkaarten en geen totaalscore", () => {
    expect(filmVariant(spanningsmeter)).toBe("spanning");
    const html = renderToStaticMarkup(<HelpFilm naam="wat-krijg-ik" assessment={spanningsmeter} />);
    expect(html).toContain("Je beoordeelt zes velden.");
    expect(html).toContain("Je profiel verschijnt.");
    expect(html).toContain("De spanning wordt zichtbaar.");
    expect(html).toContain("Technologie +1,4 op Processen");
    expect(html).not.toContain("Totaalscore");
    expect(html.match(/class="sf-stap /g)).toHaveLength(3);
  });
});

describe("Mijn metingen bij de Spanningsmeter", () => {
  it("toont het Gemiddeld niveau in de ring met een rij per veld en de grootste spanning", () => {
    const t = teaserVoorScan(spanningsmeter, demoAntwoordenSpanning)!;
    expect(t.getal).toBe("3,1");
    expect(t.klasseNaam).toBe("Georganiseerd");
    expect(t.ringLabel).toBe("Niveau");
    expect(t.rijenLabel).toBe("Per spanningsveld");
    expect(t.rijen.map((r) => [r.naam, r.waarde])).toEqual([
      ["Verhaal", "3,8"],
      ["Regie", "2,6"],
      ["Gedrag", "2,2"],
      ["Data", "3,4"],
      ["Processen", "2,4"],
      ["Technologie", "4,0"],
    ]);
    expect(t.spanningsZin).toBe("Technologie loopt 1,8 voor op Mensen & gedrag.");
  });

  it("toont voor de hele Meting het gemiddelde met de laagste tot hoogste score", () => {
    const invullingen = demoSpanningGroep.map(
      (s, i) =>
        ({ id: `s${i}`, status: "afgerond", antwoorden: s.antwoorden, opmerkingen: s.opmerkingen }) as unknown as ScanInvulling,
    );
    const t = teaserVoorMeting(spanningsmeter, invullingen)!;
    expect(t.getal).toBe("3,1");
    expect(t.aantalScans).toBe(12);
    expect(t.stijl).toBe("stip");
    const gedrag = t.rijen[2];
    expect(gedrag.waarde).toBe("2,7");
    expect(gedrag.lijn).toBeDefined();
    expect(t.spanningsZin).toBe("Technologie loopt 1,4 voor op Processen.");
  });
});

describe("het resultaat van de Spanningsmeter", () => {
  it("toont Jouw profiel met de grootste spanning, de tabel Score per veld en geen totaalscore", () => {
    const html = renderToStaticMarkup(
      <SpanningResultaat assessment={spanningsmeter} eigen={{ antwoorden: demoAntwoordenSpanning, subregel: ["Joost"] }} />,
    );
    expect(html).toContain("Jouw resultaat");
    expect(html).toContain("30 van 30 vragen beantwoord");
    expect(html).toContain("De Spanningsmeter kent geen totaalscore.");
    expect(html).toContain("Technologie loopt voor op Mensen &amp; gedrag");
    expect(html).toContain("Het groepsbeeld volgt in de sessie.");
    expect(html).toContain("−1,2");
    expect(html).toContain("+1,8");
    expect(html).toContain("De vijf niveaus");
    expect(html).not.toContain("Totaalscore");
    expect(html).not.toContain("Gemiddelde per rol");
    // Zonder groep geen schakelaar.
    expect(html).not.toContain('role="tablist"');
  });

  it("toont Groep met het meest uiteenlopende veld, zonder uitsplitsing per rol", () => {
    const html = renderToStaticMarkup(
      <SpanningResultaat assessment={spanningsmeter} groep={{ scans: demoSpanningGroep, subregel: ["Meting"] }} />,
    );
    expect(html).toContain("Resultaat van de Meting");
    expect(html).toContain("Meest uiteenlopend");
    expect(html).toContain("Scores van 1,4 tot 4,0.");
    expect(html).not.toContain("Gemiddelde per rol");
    expect(html).not.toContain("Voorbeelden uit de groep");
    expect(html).not.toContain("Het groepsbeeld volgt in de sessie.");
  });

  it("toont de voorbeelden uit de groep alleen als ze voor deze lezer zijn vrijgegeven", () => {
    const html = renderToStaticMarkup(
      <SpanningResultaat assessment={spanningsmeter} groep={{ scans: demoSpanningGroep, voorbeelden: true, subregel: ["Meting"] }} />,
    );
    expect(html).toContain("Voorbeelden uit de groep");
    expect(html).toContain("Voorbeelden zijn anoniem en staan bij het veld waar ze bij horen. Ze krijgen geen score.");
    expect((html.match(/class="sp-voorbeeld"/g) ?? []).length).toBe(4);
  });

  it("toont de schakelaar Jouw profiel en Groep alleen als beide weergaven er zijn", () => {
    const html = renderToStaticMarkup(
      <SpanningResultaat
        assessment={spanningsmeter}
        eigen={{ antwoorden: demoAntwoordenSpanning, subregel: [] }}
        groep={{ scans: demoSpanningGroep, subregel: [] }}
      />,
    );
    expect(html).toContain("Jouw profiel");
    expect(html).toContain(">Groep<");
  });
});

describe("de doorloopflow van de Spanningsmeter", () => {
  it("heeft vijf ronde knoppen met de niveaunaam en een aparte pil voor 0, en zet het gekozen antwoord op aria-pressed", () => {
    const html = renderToStaticMarkup(<Antwoordkeuze assessment={spanningsmeter} veld={veld} vraagId="VL1" waarde={3} onKies={() => {}} />);
    expect(html).toContain("Reactief");
    expect(html).toContain("Adaptief");
    expect(html).toContain("0 · Kan ik niet beoordelen");
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toContain("3 · Georganiseerd:");
    expect(html).toContain(veld.ijkpunten![2]);
  });

  it("toont bij 0 dat de vraag niet meetelt", () => {
    const html = renderToStaticMarkup(<Antwoordkeuze assessment={spanningsmeter} veld={veld} vraagId="VL1" waarde={0} onKies={() => {}} />);
    expect(html).toContain("Deze vraag telt niet mee.");
  });

  it("toont de ijkpunten, de vragen met invalshoek en de open vraag, en zet Volgend veld uit zolang niet alles beantwoord is", () => {
    const html = renderToStaticMarkup(
      <SpanningVeldForm
        assessment={spanningsmeter}
        veld={veld}
        respondent={{ naam: "Joost", antwoorden: { VL1: 4 }, opmerkingenPerBouwblok: {} }}
        eerste
        laatste={false}
        kanAfronden={false}
        onAntwoord={() => {}}
        onVoorbeeld={() => {}}
        onVorige={() => {}}
        onVolgende={() => {}}
      />,
    );
    expect(html).toContain("Spanningsmeter voor Verhaal &amp; leiderschap");
    expect(html).toContain("Noodzaak");
    expect(html).toContain("Waar je op let");
    expect(html).toContain("VL6");
    expect(html).toContain("Voorbeeld · niet verplicht");
    expect(html).toContain("Dit voorbeeld krijgt geen score.");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Volgend veld/);
    expect(html).not.toContain("Vorig veld");
  });
});

describe("de velden als radar op de Assessment-pagina", () => {
  const html = renderToStaticMarkup(<SpanningVeldenSectie assessment={spanningsmeter} />);

  it("toont zes taartpunten, zes nummers en zes rijen, zonder de zes kaarten", () => {
    expect(html).toContain("De 6 spanningsvelden");
    expect((html.match(/class="br-nr /g) ?? []).length).toBe(6);
    expect((html.match(/class="br-pil /g) ?? []).length).toBe(6);
    expect(html).not.toContain("sp-veld-kaart");
    expect(html).toContain("Beweeg over een veld of een nummer in de radar om de omschrijving te zien.");
  });

  it("heeft een aria-label met de volledige naam en de voorbeeldscore", () => {
    expect(html).toContain('aria-label="3, Mensen &amp; gedrag, voorbeeldscore 2,2"');
  });
});

describe("de teksten van de Spanningsmeter in het register", () => {
  it("heeft geen Info-teksten meer voor de rolgroep", () => {
    expect(standaardInfoTekst("info.spanningMinPerRol")).toBe("");
    expect(standaardInfoTekst("info.rolgroep")).toBe("");
  });
});
