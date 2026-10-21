/**
 * De meetkunde van de radar van het Spanningsprofiel (`visualisatie-spanningsmeter.md`, Radar en score per veld): Een zeshoek met
 * zes wedges van 60° rond de assen, vier hulpcirkels op 2, 3, 4 en 5 en zes assen. De score loopt van 1 in het midden (straal 20 van
 * de 250) tot 5 aan de rand. De eerste as staat bovenaan en de velden lopen met de klok mee. Pure functies, getest.
 */
export const RADAR = { grootte: 600, midden: 300, binnen: 20, buiten: 250, knooppunt: 20 } as const;

export interface Punt {
  x: number;
  y: number;
}

/** De straal bij een score: 1 geeft `binnen`, 5 geeft `buiten`. Een score buiten 1 tot 5 wordt tot dat bereik begrensd. */
export function straalVoorScore(score: number): number {
  const s = Math.min(5, Math.max(1, score));
  return RADAR.binnen + ((s - 1) / 4) * (RADAR.buiten - RADAR.binnen);
}

/** De hoek in radialen van as `index` van `aantal`: De eerste bovenaan, daarna met de klok mee. */
export function hoekVoorAs(index: number, aantal: number): number {
  return ((-90 + (index * 360) / aantal) * Math.PI) / 180;
}

export function puntOp(hoek: number, straal: number): Punt {
  return { x: RADAR.midden + straal * Math.cos(hoek), y: RADAR.midden + straal * Math.sin(hoek) };
}

const rond = (n: number) => Number(n.toFixed(2));

/** Het punt van een score op een as. */
export function puntVoorScore(index: number, aantal: number, score: number): Punt {
  return puntOp(hoekVoorAs(index, aantal), straalVoorScore(score));
}

/** De wedge van as `index`: Een taartpunt van 360/aantal graden, gecentreerd op de as, tot de straal `buiten`. */
export function wedgePad(index: number, aantal: number): string {
  const hoek = hoekVoorAs(index, aantal);
  const halve = Math.PI / aantal;
  const a = puntOp(hoek - halve, RADAR.buiten);
  const b = puntOp(hoek + halve, RADAR.buiten);
  return `M ${RADAR.midden} ${RADAR.midden} L ${rond(a.x)} ${rond(a.y)} A ${RADAR.buiten} ${RADAR.buiten} 0 0 1 ${rond(b.x)} ${rond(b.y)} Z`;
}

/** Een gesloten pad door punten, met scherpe hoeken. */
export function veelhoekPad(punten: Punt[]): string {
  return punten.map((p, i) => `${i === 0 ? "M" : "L"} ${rond(p.x)} ${rond(p.y)}`).join(" ") + " Z";
}
