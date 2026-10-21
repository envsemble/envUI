/**
 * The width Panes keeps under its `persist` key, read from a Cookie header, such as the request's
 * on the server, or from `document.cookie`. Render Panes.Root with it as `defaultSize`, on the
 * server and in the browser alike, so the server's markup has the width people chose and nothing
 * moves as the page hydrates:
 *
 *   <Panes.Root persist="inbox" defaultSize={readPanesSize(cookieHeader, 'inbox') ?? 22.5}>
 *
 * Returns undefined where no width is kept under the key.
 */
export function readPanesSize(cookies: string | null | undefined, key: string): number | undefined {
  if (!cookies) return undefined;
  const name = encodeURIComponent(key);
  for (const part of cookies.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    const size = Number(decodeURIComponent(part.slice(separator + 1).trim()));
    return Number.isFinite(size) && part.slice(separator + 1).trim() !== '' ? size : undefined;
  }
  return undefined;
}

/** Keeps a width under a key in a cookie for a year, or forgets it, for every page of the site. */
export function writePanesSize(key: string, size: number | undefined) {
  try {
    const name = encodeURIComponent(key);
    document.cookie =
      size === undefined
        ? `${name}=; path=/; max-age=0; samesite=lax`
        : `${name}=${size}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Panes still work where cookies are unavailable, as in a sandboxed frame.
  }
}
