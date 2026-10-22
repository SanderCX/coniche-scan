/**
 * De kleur en het icoon van een Kanaal (`stylesheet.md`, Kanaalkleuren): Call `--or` (telefoon), Voicebot `--pu` (microfoon), Livechat `--bl`
 * (tekstballon), Chatbot `#0e7c86` (robot), E-mail `--ye` (envelop, icoon in `--ink`) en Whatsapp `--gr` (berichtbel). Een kanaal dat een Admin
 * toevoegt, heeft nog geen eigen kleur en krijgt een neutrale kleur met het icoon van een tekstballon. De kleur is nooit het enige verschil: De naam
 * staat er altijd bij.
 */
export type KanaalIcoonSoort = "telefoon" | "microfoon" | "tekstballon" | "robot" | "envelop" | "berichtbel";

export interface KanaalStijl {
  icoon: KanaalIcoonSoort;
  /** De volle kleur van de cirkel. */
  kleur: string;
  /** De kleur van het icoon op de cirkel. */
  icoonKleur: string;
  /** De lichte variant voor de pil: De kleur op ongeveer 10% op wit, met een rand van ongeveer 25%. */
  licht: string;
  rand: string;
}

const STIJLEN: Record<string, Omit<KanaalStijl, "licht" | "rand">> = {
  call: { icoon: "telefoon", kleur: "#ff671f", icoonKleur: "#ffffff" },
  voicebot: { icoon: "microfoon", kleur: "#392944", icoonKleur: "#ffffff" },
  livechat: { icoon: "tekstballon", kleur: "#225ba0", icoonKleur: "#ffffff" },
  chatbot: { icoon: "robot", kleur: "#0e7c86", icoonKleur: "#ffffff" },
  "e-mail": { icoon: "envelop", kleur: "#ffc043", icoonKleur: "#1c1c1a" },
  whatsapp: { icoon: "berichtbel", kleur: "#197f4e", icoonKleur: "#ffffff" },
};
const NEUTRAAL: Omit<KanaalStijl, "licht" | "rand"> = { icoon: "tekstballon", kleur: "#6b6a63", icoonKleur: "#ffffff" };

/** De stijl van een kanaal, op de naam (hoofdletterongevoelig): De namen van de startlijst hebben een eigen kleur en icoon. */
export function kanaalStijl(naam: string): KanaalStijl {
  const basis = STIJLEN[naam.trim().toLowerCase()] ?? NEUTRAAL;
  return { ...basis, licht: `${basis.kleur}1a`, rand: `${basis.kleur}40` };
}
