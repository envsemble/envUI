// No client directive: a server component calls readAppShellCookie to hydrate the frame's state.

/** A sidebar's side of the frame: start, the left in left-to-right text, or end. */
export type SidebarSide = 'start' | 'end';

/** A value for both sides, or a bare value for the start sidebar. */
export type PerSide<T> = T | Partial<Record<SidebarSide, T>>;

/** What the frame remembers of one sidebar: whether it is docked open, and its width in rem. */
export interface SidebarSnapshot {
  open: boolean;
  /** The width a person chose by resizing, in rem, so it follows the reader's font size. */
  width?: number;
}

/** What the frame remembers of its sidebars, per side. */
export type AppShellState = Partial<Record<SidebarSide, SidebarSnapshot>>;

/** Where and how the frame remembers its sidebars. */
export interface PersistOptions {
  /** The storage key or cookie name, such as app.frame. */
  key: string;
  /**
   * local: localStorage, read after hydration, so a server-rendered page can show the default
   * state for one frame. cookie: a cookie the server reads too, with readAppShellCookie, so the
   * first paint is already right.
   * @default 'local'
   */
  storage?: 'local' | 'cookie';
  /**
   * The cookie's attributes.
   * @default { path: '/', maxAge: 31536000, sameSite: 'lax', secure: true on https }
   */
  cookie?: { path?: string; maxAge?: number; sameSite?: 'lax' | 'strict'; secure?: boolean };
}

const sides: readonly SidebarSide[] = ['start', 'end'];

/** A width in rem as the frame keeps it: positive, finite and rounded to a hundredth. */
function remWidth(value: unknown): number | undefined {
  const number =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) / 100 : undefined;
}

/** The state written as the cookie's value: start.open=1&start.width=16.5&end.open=0. */
export function serializeAppShellState(state: AppShellState): string {
  const parts: string[] = [];
  for (const side of sides) {
    const snapshot = state[side];
    if (!snapshot) continue;
    parts.push(`${side}.open=${snapshot.open ? 1 : 0}`);
    const width = remWidth(snapshot.width);
    if (width !== undefined) parts.push(`${side}.width=${width}`);
  }
  return parts.join('&');
}

/**
 * The state in a cookie's value, as serializeAppShellState writes it; undefined where it holds no
 * side. Unknown or malformed entries are skipped, so an old or edited cookie never throws.
 */
export function parseAppShellState(value: string): AppShellState | undefined {
  const state: AppShellState = {};
  for (const entry of value.split('&')) {
    const [name, raw = ''] = entry.split('=');
    const [side, field] = (name ?? '').split('.');
    if (side !== 'start' && side !== 'end') continue;
    if (field === 'open' && (raw === '1' || raw === '0'))
      state[side] = { ...state[side], open: raw === '1' };
    else if (field === 'width') {
      const width = remWidth(raw);
      if (width !== undefined) state[side] = { open: true, ...state[side], width };
    }
  }
  return Object.keys(state).length > 0 ? state : undefined;
}

/** The state kept in localStorage as JSON; undefined for anything else. */
export function parseStoredAppShellState(value: string | null): AppShellState | undefined {
  if (!value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return undefined;
    const state: AppShellState = {};
    for (const side of sides) {
      const snapshot = (parsed as Record<string, unknown>)[side] as
        | { open?: unknown; width?: unknown }
        | undefined;
      if (!snapshot || typeof snapshot.open !== 'boolean') continue;
      const width = remWidth(snapshot.width);
      state[side] = width === undefined ? { open: snapshot.open } : { open: snapshot.open, width };
    }
    return Object.keys(state).length > 0 ? state : undefined;
  } catch {
    return undefined;
  }
}

/** A cookie's value in a Cookie header (`a=1; b=2`), decoded; undefined where it isn't set. */
export function readCookie(cookieHeader: string | null | undefined, name: string) {
  if (!cookieHeader) return undefined;
  const encodedName = encodeURIComponent(name);
  for (const pair of cookieHeader.split(';')) {
    const index = pair.indexOf('=');
    if (index === -1) continue;
    if (pair.slice(0, index).trim() !== encodedName) continue;
    try {
      return decodeURIComponent(pair.slice(index + 1).trim());
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * The frame state a persisted cookie holds, for AppShell.Root's (or Sidebar.Provider's)
 * initialState, so the server renders the sidebars as the person left them and hydration meets
 * that markup without a flash. It runs on the server: pass the request's Cookie header and the
 * key given to persist.
 *
 *   const initialState = readAppShellCookie(request.headers.get('cookie'), 'app.frame');
 *   <AppShell.Root persist={{ key: 'app.frame', storage: 'cookie' }} initialState={initialState}>
 */
export function readAppShellCookie(
  cookieHeader: string | null | undefined,
  key: string,
): AppShellState | undefined {
  const value = readCookie(cookieHeader, key);
  return value === undefined ? undefined : parseAppShellState(value);
}

/** The cookie that keeps the state, as document.cookie takes it. */
export function appShellCookie(
  key: string,
  state: AppShellState,
  options: PersistOptions['cookie'] = {},
  https = false,
) {
  const { path = '/', maxAge = 31536000, sameSite = 'lax', secure = https } = options;
  return [
    `${encodeURIComponent(key)}=${encodeURIComponent(serializeAppShellState(state))}`,
    `path=${path}`,
    `max-age=${maxAge}`,
    `samesite=${sameSite}`,
    ...(secure ? ['secure'] : []),
  ].join('; ');
}
