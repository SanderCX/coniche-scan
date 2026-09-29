/**
 * Kopieert tekst naar het klembord, met een fallback voor situaties waarin
 * de Clipboard API faalt of ontbreekt (bijv. geen focus op de pagina, geen
 * HTTPS, strenger browserbeleid). Zonder deze fallback bleef de UI altijd
 * "Gekopieerd!" tonen, ook als het schrijven naar het klembord stilletjes
 * mislukte — de gebruiker plakte dan een oude (mogelijk niet meer geldige)
 * link zonder dat te merken.
 */
export async function kopieerNaarKlembord(tekst: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(tekst);
      return true;
    } catch {
      // val terug op de methode hieronder
    }
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = tekst;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const gelukt = document.execCommand("copy");
    document.body.removeChild(textarea);
    return gelukt;
  } catch {
    return false;
  }
}
