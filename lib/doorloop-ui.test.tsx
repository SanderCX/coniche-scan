import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { aiVolwassenheid } from "@/data/ai-scan-assessment";
import { ziekenhuisQuickscan } from "@/data/ziekenhuis-quickscan-assessment";
import { spanningsmeter } from "@/data/spanningsmeter-assessment";
import { actieveGroepen, alleBouwblokkenMetGroep } from "./assessment-structuur";
import { BouwblokForm } from "@/components/BouwblokForm";
import { Sidebar } from "@/components/Sidebar";
import { SpanningSidebar } from "@/components/spanning/SpanningSidebar";
import { SpanningVeldForm } from "@/components/spanning/SpanningVeldForm";
import { AfdelingKaarten } from "@/components/AfdelingKaarten";
import { JaNeeRadio } from "@/components/JaNeeRadio";
import type { Assessment, Bouwblok, ScanWeergave } from "./types";

const leeg: ScanWeergave = { naam: "Sander", antwoorden: {}, opmerkingenPerBouwblok: {} };
const noop = () => {};

function kop(assessment: Assessment, index = 0, extra: Partial<Parameters<typeof BouwblokForm>[0]> = {}, bouwblokExtra: Partial<Bouwblok> = {}) {
  const b = alleBouwblokkenMetGroep(assessment)[index];
  return renderToStaticMarkup(
    <BouwblokForm
      bouwblok={{ ...b.bouwblok, ...bouwblokExtra }}
      categorieKleur={b.groepNaam ? b.groepKleur : null}
      categorieNaam={b.groepNaam}
      bouwblokLabel={assessment.bouwblokLabel}
      schaal={assessment.schaal ?? []}
      respondent={leeg}
      isLaatsteBouwblok={false}
      onAntwoord={noop}
      onOpmerking={noop}
      onVolgende={noop}
      {...extra}
    />
  );
}

describe("de kop van een bouwsteen in de doorloopflow (22 oktober 2026)", () => {
  it("toont de eyebrow, de titel, de centrale vraag en de toelichting direct, zonder i-icoon, omschrijving en tags", () => {
    const b = alleBouwblokkenMetGroep(klantcontactVolwassenheid)[0];
    // De centrale vraag komt in de app uit de bouwsteenteksten bij het laden; hier zetten we hem zelf.
    const html = kop(klantcontactVolwassenheid, 0, {}, { centraleVraag: "Wat is de koers?", toelichting: "Eerste alinea.\n\nTweede alinea." });
    expect(html).toContain("bouwblok-kop-eyebrow");
    expect(html).toContain(`${b.groepNaam!.toUpperCase()} · BOUWSTEEN ${b.bouwblok.volgnummer}`);
    expect(html).toContain(`<h2>${b.bouwblok.naam}</h2>`);
    expect(html).toContain("Centrale vraag");
    expect(html).toContain("bouwblok-kop-centrale-vraag");
    expect(html).toContain("Wat is de koers?");
    expect(html).toContain("<p>Eerste alinea.</p><p>Tweede alinea.</p>");
    expect(html).not.toContain("toelichting-link");
    expect(html).not.toContain("g-badge");
    expect(html).not.toContain(b.bouwblok.omschrijving);
    expect(html).not.toContain("bouwblok-omschrijving");
    expect(html).not.toContain("ⓘ");
  });

  it("neemt de categoriekleur over als accent, en bij de AI-scan geen categorie en geen kleur van het domein", () => {
    expect(kop(klantcontactVolwassenheid)).toContain("--accent:#ff671f");
    const ai = kop(aiVolwassenheid);
    expect(ai).toContain("AI-DOMEIN 1");
    expect(ai).not.toContain("--accent:");
  });

  it("laat bij de Quickscan de dimensie alleen een eyebrow en een naam hebben, zonder centrale vraag en toelichting", () => {
    const b = alleBouwblokkenMetGroep(ziekenhuisQuickscan)[0];
    const html = kop(ziekenhuisQuickscan, 0, { jaNee: true });
    expect(html).toContain(`${b.groepNaam!.toUpperCase()} · DIMENSIE ${b.bouwblok.volgnummer}`);
    expect(html).not.toContain("Centrale vraag");
    expect(html).not.toContain("bouwblok-kop-toelichting");
    // De vraag is 18px en het antwoord een pil van 40px.
    expect(html).toContain("vraag-tekst--groot");
    expect(html).toContain("antwoord-pillen");
    expect(html.match(/class="antwoord-pil[ "]/g)?.length).toBeGreaterThanOrEqual(3);
  });
});

describe("de sidebar van de doorloopflow (22 oktober 2026)", () => {
  const sidebar = (assessment: Assessment, index: number, w: ScanWeergave = leeg) =>
    renderToStaticMarkup(
      <Sidebar assessment={assessment} respondent={w} actieveBouwblokId={alleBouwblokkenMetGroep(assessment)[index].bouwblok.id} onSelecteer={noop} />
    );

  it("markeert alleen de actieve categorie met de lijn en de actieve bouwsteen met een vlak", () => {
    const html = sidebar(klantcontactVolwassenheid, 0);
    expect(html.match(/sidebar-categorie--actief/g)).toHaveLength(1);
    expect(html.match(/ actief /g)).toHaveLength(1);
    expect(html).not.toContain("sidebar-bouwblok--streep");
    expect(html).toContain("0% – 0 van 60 vragen");
  });

  it("geeft zonder categorielaag (de AI-scan) de actieve bouwsteen zelf een streepje", () => {
    const html = sidebar(aiVolwassenheid, 2);
    expect(html).not.toContain("sidebar-categorie--actief");
    expect(html.match(/sidebar-bouwblok--streep/g)).toHaveLength(1);
  });

  it("toont bij de Quickscan een afdeling die niet van toepassing is grijs met N.V.T. en doorgestreepte dimensies", () => {
    const eerste = (ziekenhuisQuickscan.categorieen ?? [])[0];
    const html = sidebar(ziekenhuisQuickscan, 0, { ...leeg, relevantie: { [eerste.id]: false } });
    expect(html).toContain("sidebar-categorie--nvt");
    expect(html).toContain("· N.V.T.");
    expect(html).toContain("sidebar-bouwblok-naam");
    // Alleen het eerste bouwblok van de afdeling is nog kiesbaar.
    const groep = actieveGroepen(ziekenhuisQuickscan)[0];
    expect(html.match(/disabled=""/g)?.length ?? 0).toBe(groep.bouwblokken.length - 1);
  });

  it("toont bij de Quickscan achter elke dimensie het aantal beantwoorde vragen", () => {
    const html = sidebar(ziekenhuisQuickscan, 0);
    expect(html).toMatch(/>0\/\d+</);
  });
});

describe("de Spanningsmeter in de doorloopflow (22 oktober 2026)", () => {
  const veld = (spanningsmeter.bouwblokken ?? [])[2];

  it("heeft een veldkop met een eyebrow, de naam en de omschrijving, zonder Info-icoon", () => {
    const html = renderToStaticMarkup(
      <SpanningVeldForm
        assessment={spanningsmeter}
        veld={veld}
        respondent={leeg}
        eerste={false}
        laatste={false}
        kanAfronden={false}
        onAntwoord={noop}
        onVoorbeeld={noop}
        onVorige={noop}
        onVolgende={noop}
      />
    );
    expect(html).toContain(`Veld ${veld.volgnummer}`);
    expect(html).toContain("sp-kop-eyebrow");
    expect(html).toContain(`<h2>${veld.naam.replace("&", "&amp;")}</h2>`);
    expect(html).not.toContain("info-icoon");
    expect(html).not.toContain("Uitleg over");
  });

  it("geeft het actieve veld in de sidebar een streepje in de veldkleur", () => {
    const html = renderToStaticMarkup(<SpanningSidebar assessment={spanningsmeter} respondent={leeg} actieveBouwblokId={veld.id} onSelecteer={noop} />);
    expect(html.match(/sp-side-rij [^"]*actief/g)).toHaveLength(1);
    expect(html).toContain("--veld:#197f4e");
  });
});

describe("de afdelingskop van de Quickscan", () => {
  it("heeft de eyebrow AFDELING n, de naam, de definitie en een kaart met de relevantievraag als pillen", () => {
    const afdeling = (ziekenhuisQuickscan.categorieen ?? [])[1];
    const html = renderToStaticMarkup(
      <AfdelingKaarten categorie={afdeling} nummer={2} relevantieVraag="Is dit relevant?" relevantie={true} onRelevantie={noop} />
    );
    expect(html).toContain("Afdeling 2");
    expect(html).toContain(`<h2>${afdeling.naam}</h2>`);
    expect(html).toContain("afdeling-kop-definitie");
    expect(html).toContain("afdeling-relevantievraag");
    expect(html.match(/class="antwoord-pil[ "]/g)).toHaveLength(2);
    expect(html).toMatch(/antwoord-pil is-gekozen[^>]*>[^<]*<input[^>]*checked[^>]*>Ja/);
  });

  it("geeft Ja, Nee en Weet ik niet als pillen onder de vraag", () => {
    const html = renderToStaticMarkup(<JaNeeRadio naam="v1" waarde="nee" onChange={noop} />);
    expect(html.match(/class="antwoord-pil[ "]/g)).toHaveLength(3);
    expect(html).toContain("Weet ik niet");
    expect(html).toMatch(/antwoord-pil is-gekozen/);
  });
});
