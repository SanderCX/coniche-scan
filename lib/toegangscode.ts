/**
 * Korte, niet-herleidbare code achter de publieke respondent-link
 * (v1-aanpassingen.md punt 2): 10 tekens uit een alfabet zonder
 * verwarrende tekens (geen 0/o, 1/l/i), nooit afgeleid van een id,
 * e-mailadres of naam.
 */
const ALFABET = "23456789abcdefghjkmnpqrstuvwxyz";
const LENGTE = 10;

export function genereerToegangscode(): string {
  const bytes = new Uint8Array(LENGTE);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < LENGTE; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let code = "";
  for (let i = 0; i < LENGTE; i++) {
    code += ALFABET[bytes[i] % ALFABET.length];
  }
  return code;
}
