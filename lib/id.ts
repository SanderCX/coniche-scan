/** Niet-oplopend, niet van e-mail afgeleid — geschikt als ongokbare URL-token. */
export function nieuwId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
