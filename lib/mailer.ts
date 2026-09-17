/**
 * Nog geen echte mailservice gekoppeld (zie v1-aanpassingen.md, punt 2 —
 * Sander regelt dit). Deze stub logt de code zodat de verificatieflow al wel
 * end-to-end te testen is; de verificatiepagina toont de code ook zichtbaar
 * in een duidelijk gelabeld ontwikkel-blok.
 */
export function verstuurVerificatiecode(email: string, code: string): void {
  console.info(`[stub-mail] Verificatiecode voor ${email}: ${code} (geldig 15 minuten)`);
}

export function verstuurUitnodiging(email: string, uitnodigingsUrl: string): void {
  console.info(`[stub-mail] Uitnodiging voor ${email}: ${uitnodigingsUrl}`);
}
