import LZString from "lz-string";

/**
 * Compressed share links (default): `#z=…` via LZ-String (much shorter than raw base64).
 * Legacy: `#e=…` UTF-8 base64 + encodeURIComponent — still decoded for old links.
 */
export const SHARE_HASH_PREFIX = "z=";
export const SHARE_HASH_LEGACY_PREFIX = "e=";

function utf8ToBase64(html: string): string {
  const bytes = new TextEncoder().encode(html);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/** Hash body only, without leading `#`. */
export function encodeHtmlToHashBody(html: string): string {
  return `${SHARE_HASH_PREFIX}${LZString.compressToEncodedURIComponent(html)}`;
}

export function decodeHtmlFromHash(hash: string): string | null {
  if (!hash.startsWith("#")) return null;
  const body = hash.slice(1);

  if (body.startsWith(SHARE_HASH_PREFIX)) {
    const raw = body.slice(SHARE_HASH_PREFIX.length);
    const out = LZString.decompressFromEncodedURIComponent(raw);
    return out === null ? null : out;
  }

  if (body.startsWith(SHARE_HASH_LEGACY_PREFIX)) {
    const encoded = body.slice(SHARE_HASH_LEGACY_PREFIX.length);
    try {
      return base64ToUtf8(decodeURIComponent(encoded));
    } catch {
      return null;
    }
  }

  return null;
}

export function buildShareableEditorUrl(html: string): string {
  if (typeof window === "undefined") return "";
  const hashBody = encodeHtmlToHashBody(html);
  return `${window.location.origin}${window.location.pathname}${window.location.search}#${hashBody}`;
}

export function readSharedHtmlFromWindow(): string | null {
  if (typeof window === "undefined") return null;
  return decodeHtmlFromHash(window.location.hash);
}
