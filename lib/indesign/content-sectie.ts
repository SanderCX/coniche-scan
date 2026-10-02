/**
 * `contentSectie` in de InDesign-XML: dezelfde bron als de PDF-slotsectie
 * (`lib/pdf/content-secties.ts`), maar hier plat als een reeks `<alinea>`-
 * elementen in plaats van de opgemaakte HTML met kaarten — een designer
 * legt de opmaak zelf vast in het InDesign-sjabloon (export-indesign.md).
 * Een koptekst wordt een vetgedrukte alinea, er is geen apart kop-element
 * in dit contract.
 */
import { ContentBron } from "@/lib/types";
import { escapeXml } from "./xml-utils";
import {
  visieSecties,
  watIsGoedKlantcontact,
  watIsGoedKlantcontactSlot,
  watIsGoedIntro,
  verbetercyclus,
} from "@/data/visie-content";
import {
  geenVastEindbeeld,
  vijfDingenIntro,
  vijfDingenOntwerpen,
  machineCustomerIntro,
  machineCustomerEffectenIntro,
  machineCustomerEffecten,
  machineCustomerPunten,
  machineCustomerSlot,
  aiConcreet,
  kostenBusinesscase,
  watDitVoorMensenBetekent,
  kenmerkenIntro,
  gemeenschappelijkeKenmerken,
  relatieMetScan,
} from "@/data/klantcontact-2030-content";

/** `**vet**` en `*cursief*` (losstaand, niet genest) naar `<b>`/`<i>`; verder platte, ge-escapete tekst. */
function markdownInline(tekst: string): string {
  const delen = tekst.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter((d) => d !== "");
  return delen
    .map((deel) => {
      if (deel.startsWith("**") && deel.endsWith("**")) return `<b>${escapeXml(deel.slice(2, -2))}</b>`;
      if (deel.startsWith("*") && deel.endsWith("*")) return `<i>${escapeXml(deel.slice(1, -1))}</i>`;
      return escapeXml(deel);
    })
    .join("");
}

function alinea(tekst: string): string {
  return `<alinea>${markdownInline(tekst)}</alinea>`;
}

function kopAlinea(tekst: string): string {
  return `<alinea><b>${escapeXml(tekst)}</b></alinea>`;
}

function meerdere(tekst: string | string[]): string[] {
  return Array.isArray(tekst) ? tekst : [tekst];
}

function visieAlineas(): string[] {
  const [sectie1, sectie2, sectie3] = visieSecties;
  return [
    kopAlinea(sectie1.titel),
    ...sectie1.alineas.map(alinea),
    kopAlinea("Wat is goed klantcontact?"),
    alinea(watIsGoedIntro),
    ...watIsGoedKlantcontact.map((p) => alinea(`— ${p}`)),
    alinea(watIsGoedKlantcontactSlot),
    kopAlinea(sectie2.titel),
    ...sectie2.alineas.map(alinea),
    kopAlinea(sectie3.titel),
    alinea(sectie3.alineas[0]),
    kopAlinea("De verbetercyclus"),
    alinea(verbetercyclus.join(" → ")),
    alinea(sectie3.alineas[1]),
  ];
}

function content2030Alineas(): string[] {
  const kenmerken = gemeenschappelijkeKenmerken.flatMap((item) => [
    kopAlinea(item.titel),
    ...meerdere(item.tekst).map(alinea),
  ]);
  return [
    ...geenVastEindbeeld.map(alinea),
    kopAlinea("Vijf dingen die iedere organisatie moet ontwerpen"),
    alinea(vijfDingenIntro),
    ...vijfDingenOntwerpen.flatMap((item) => [kopAlinea(item.titel), ...meerdere(item.tekst).map(alinea)]),
    kopAlinea("De machine customer: nieuwe combinaties"),
    ...machineCustomerIntro.map(alinea),
    alinea(machineCustomerEffectenIntro),
    ...machineCustomerEffecten.map((e) => alinea(`— **${e.titel}.** ${e.tekst}`)),
    ...machineCustomerPunten.flatMap((item) => [kopAlinea(item.titel), ...meerdere(item.tekst).map(alinea)]),
    ...machineCustomerSlot.map(alinea),
    kopAlinea("Wat dit voor AI concreet betekent"),
    ...aiConcreet.flatMap((item) => [kopAlinea(item.titel), ...meerdere(item.tekst).map(alinea)]),
    kopAlinea("Kosten en businesscase"),
    ...kostenBusinesscase.map(alinea),
    kopAlinea("Wat dit voor mensen betekent"),
    ...watDitVoorMensenBetekent.map(alinea),
    kopAlinea("Wat organisaties die zich hierop voorbereiden gemeen hebben"),
    alinea(kenmerkenIntro),
    ...kenmerken,
    kopAlinea("De relatie met deze scan"),
    alinea(relatieMetScan),
  ];
}

const TITEL_PER_BRON: Record<ContentBron, string> = {
  "visie-coniche.md-deel1": "Visie",
  "content-2030.md": "2030",
};

/** `<contentSectie>` voor de gegeven bron, of leeg als er geen slotsectie is (geen element, zie de spec). */
export function contentSectieXml(sectie: { titel: string; bron: ContentBron } | null): string {
  if (!sectie) return "";
  const alineas = sectie.bron === "visie-coniche.md-deel1" ? visieAlineas() : content2030Alineas();
  const titel = sectie.titel || TITEL_PER_BRON[sectie.bron];
  return `<contentSectie><titel>${escapeXml(titel)}</titel><tekst>${alineas.join("")}</tekst></contentSectie>`;
}
