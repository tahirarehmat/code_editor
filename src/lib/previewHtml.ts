/**
 * Injects a strict CSP so only inline / internal CSS works (no external stylesheets).
 * Blocks scripts. Allows common image/font sources for embedded content.
 */
const CSP_INJECTION = `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https: blob:; font-src data: https:; connect-src 'none'; script-src 'none'; base-uri 'none';">`;

export function buildPreviewDocument(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) {
    return `<!DOCTYPE html><html><head>${CSP_INJECTION}</head><body></body></html>`;
  }

  const head = trimmed.slice(0, 32).toLowerCase();
  const looksLikeFullDoc =
    head.startsWith("<!doctype") || head.startsWith("<html");

  if (looksLikeFullDoc) {
    if (/<head(\s[^>]*)?>/i.test(trimmed)) {
      return trimmed.replace(
        /<head(\s[^>]*)?>/i,
        (match) => `${match}${CSP_INJECTION}`,
      );
    }
    if (/<html(\s[^>]*)?>/i.test(trimmed)) {
      return trimmed.replace(
        /<html(\s[^>]*)?>/i,
        (match) => `${match}<head>${CSP_INJECTION}</head>`,
      );
    }
    return `<!DOCTYPE html><html><head>${CSP_INJECTION}</head><body>${trimmed}</body></html>`;
  }

  return `<!DOCTYPE html><html><head>${CSP_INJECTION}</head><body>${trimmed}</body></html>`;
}
