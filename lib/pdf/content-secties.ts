import { ContentBron } from "@/lib/types";
import { escapeHtml } from "./escape-html";
import {
  visieSecties,
  watIsGoedKlantcontact,
  watIsGoedKlantcontactSlot,
  verbetercyclus,
  watIsGoedIntro,
} from "@/data/visie-content";
import {
  geenVastEindbeeld,
  vijfDingenOntwerpen,
  machineCustomerIntro,
  machineCustomerEffecten,
  machineCustomerPunten,
  machineCustomerSlot,
  aiConcreet,
  kostenBusinesscase,
  watDitVoorMensenBetekent,
  gemeenschappelijkeKenmerken,
  relatieMetScan,
  vijfDingenIntro,
  machineCustomerEffectenIntro,
  kenmerkenIntro,
} from "@/data/klantcontact-2030-content";

function p(tekst: string): string {
  return `<p>${escapeHtml(tekst)}</p>`;
}

function alineas(tekst: string | string[]): string {
  return (Array.isArray(tekst) ? tekst : [tekst]).map(p).join("");
}

/**
 * De Visie in dezelfde opbouw en stijl als de webpagina (app/visie/page.tsx):
 * tekstsecties met h2, de warme kaart met vinkjes, de verbetercyclus als
 * genummerde stappen. Past op 1 pagina; de hero staat in build-html.ts.
 */
function bouwstenenDeel1Html(): string {
  const [sectie1, sectie2, sectie3] = visieSecties;
  const tekstSectie = (titel: string, tekst: string[]) => `<h2>${escapeHtml(titel)}</h2>${tekst.map(p).join("")}`;
  const goedKaart = `<div class="kenmerken-kaart"><h3>Wat is goed klantcontact?</h3>${p(watIsGoedIntro)}<ul class="vinkjes">${watIsGoedKlantcontact
    .map((punt) => `<li><span class="vink">✓</span><span>${escapeHtml(punt)}</span></li>`)
    .join("")}</ul>${p(watIsGoedKlantcontactSlot)}</div>`;
  const cyclus = `<div class="cyclus">${verbetercyclus
    .map(
      (stap, i) =>
        `<div class="cyclus-stap"><span class="cyclus-nummer">${i + 1}</span><span class="cyclus-label">${escapeHtml(stap)}</span></div>${i < verbetercyclus.length - 1 ? '<span class="cyclus-pijl">→</span>' : ""}`
    )
    .join("")}</div>`;
  return `<div class="pdf-pagina visie">${tekstSectie(sectie1.titel, sectie1.alineas)}${goedKaart}${tekstSectie(sectie2.titel, sectie2.alineas)}<h2>${escapeHtml(sectie3.titel)}</h2>${p(sectie3.alineas[0])}${cyclus}${p(sectie3.alineas[1])}</div>`;
}

/** Genummerde kaarten zoals op /klantcontact-2030: cirkel met nummer, titel en tekst in een omkaderd vlak. */
function kaartenLijst(items: { titel: string; tekst: string | string[] }[]): string {
  return `<div class="kaarten">${items
    .map(
      (item, i) =>
        `<div class="kaart"><span class="kaart-nummer">${i + 1}</span><div><p class="kaart-titel">${escapeHtml(item.titel)}</p>${alineas(item.tekst)}</div></div>`
    )
    .join("")}</div>`;
}

/**
 * De 2030-sectie in dezelfde opbouw en stijl als de webpagina
 * (app/klantcontact-2030/page.tsx). Handmatig over pagina's verdeeld
 * (`.pdf-pagina`), zodat elke pagina vanaf de bovenrand kan beginnen met
 * ruimte en er geen kaart of kop midden op een pagina wordt afgebroken.
 * De hero (titel met oranje gloed) staat in build-html.ts, boven de eerste
 * pagina.
 */
function content2030Html(): string {
  const kenmerken = gemeenschappelijkeKenmerken
    .map((item) => `<div><p class="kenmerk-titel">${escapeHtml(item.titel)}</p>${alineas(item.tekst)}</div>`)
    .join("");
  const pagina1 =
    alineas(geenVastEindbeeld) +
    `<h2>Vijf dingen die iedere organisatie moet ontwerpen</h2>` +
    p(vijfDingenIntro) +
    kaartenLijst(vijfDingenOntwerpen);
  const pagina2 =
    `<h2>De machine customer: nieuwe combinaties</h2>` +
    alineas(machineCustomerIntro) +
    p(machineCustomerEffectenIntro) +
    `<ul>${machineCustomerEffecten.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul>` +
    kaartenLijst(machineCustomerPunten) +
    alineas(machineCustomerSlot);
  const pagina3 =
    `<h2>Wat dit voor AI concreet betekent</h2>` +
    kaartenLijst(aiConcreet) +
    `<h2>Kosten en businesscase</h2>` +
    alineas(kostenBusinesscase);
  const pagina4 =
    `<h2>Wat dit voor mensen betekent</h2>` +
    alineas(watDitVoorMensenBetekent) +
    `<div class="kenmerken-kaart"><h3>Wat organisaties die zich hierop voorbereiden gemeen hebben</h3>${p(kenmerkenIntro)}<div class="kenmerken-grid">${kenmerken}</div></div>` +
    `<h2>De relatie met deze scan</h2>` +
    p(relatieMetScan);
  return [pagina1, pagina2, pagina3, pagina4].map((html) => `<div class="pdf-pagina">${html}</div>`).join("");
}

/** Volledige tekst van de PDF-slotsectie, uit dezelfde bron als de bijbehorende interactieve pagina. */
export function contentVoorBron(bron: ContentBron): string {
  switch (bron) {
    case "visie-coniche.md-deel1":
      return bouwstenenDeel1Html();
    case "content-2030.md":
      return content2030Html();
  }
}
