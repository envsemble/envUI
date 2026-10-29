// Part names and their descriptions, from docs/generated/parts.json when the app hands it to dev
// mode or dev mode can fetch it. Names never depend on it: a node is named by its part class
// whether or not the descriptions have loaded, so the readout reads the same before and after.

/** A part: its class, the component or shared group it belongs to, and what it is. */
export interface PartInfo {
  /** The part's class name, such as `env-card-header`. */
  className: string;
  /** The component's export name, such as `Card`, or the shared group's, such as `ConnectedRows`. */
  component: string;
  /** What the part is, in a sentence. */
  description?: string;
  /** Whether it is the root of its component or group. */
  root: boolean;
  /** Whether it belongs to a shared group, anatomy several components render. */
  shared: boolean;
}

/** A state attribute, with the values it takes and the parts it goes on. */
export interface StateAttribute {
  attribute: string;
  values: string[];
  parts: string[];
}

/** The parts by class name, and the state attributes by component or group. */
export interface PartsIndex {
  byClass: Map<string, PartInfo>;
  states: Map<string, StateAttribute[]>;
}

/** One component or shared group of parts.json. */
export interface PartsEntry {
  root: string;
  parts: { class: string; description: string }[];
  states?: { attribute: string; values: string[]; parts: string[] }[];
}

/** docs/generated/parts.json, as scripts/docs/GenerateParts.ts writes it. */
export interface PartsFile {
  schemaVersion: number;
  components: Record<string, PartsEntry & { source: string; uses?: string[] }>;
  shared?: Record<string, PartsEntry & { usedBy?: string[] }>;
}

/**
 * Indexes parts.json: `components` by export name and `shared` groups by name, each with its root
 * class, its parts (`{ class, description }`) and its states (`{ attribute, values, parts }`).
 * Anything else is refused, so a changed format shows at once rather than as missing descriptions.
 */
export function indexParts(data: PartsFile): PartsIndex {
  if (typeof data !== 'object' || data === null || typeof data.components !== 'object')
    throw new TypeError('Not docs/generated/parts.json: it has no components.');
  const index: PartsIndex = { byClass: new Map(), states: new Map() };
  const add = (name: string, entry: PartsEntry, shared: boolean) => {
    for (const part of entry.parts ?? [])
      if (!index.byClass.has(part.class))
        index.byClass.set(part.class, {
          className: part.class,
          component: name,
          description: part.description,
          root: part.class === entry.root,
          shared,
        });
    if (entry.states?.length)
      index.states.set(
        name,
        entry.states.map(({ attribute, values, parts }) => ({ attribute, values, parts })),
      );
  };
  for (const [name, entry] of Object.entries(data.components)) add(name, entry, false);
  for (const [name, entry] of Object.entries(data.shared ?? {})) add(name, entry, true);
  return index;
}

let current: PartsIndex | null = null;
const listeners = new Set<() => void>();

/** The parts dev mode knows, or null before any are loaded. */
export const knownParts = () => current;

/** Replaces the parts dev mode knows, and tells those listening. */
export function setParts(data: PartsFile | null) {
  current = data === null ? null : indexParts(data);
  for (const listener of listeners) listener();
}

/** Calls a listener whenever the parts change; returns what stops it. */
export function onPartsChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Classes that name no part of their own: the theme boundary and the helpers many components
 * render through, which yield to a component's own class on the same element.
 */
const helpers = new Set([
  'env-theme',
  'env-surface',
  'env-text',
  'env-icon',
  'env-prose',
  'env-connected-rows',
  'env-connected-row',
]);

/** Whether a class is a part class: `env-*`, but not the window's container or dev mode's own. */
const isPartClass = (name: string) =>
  name.startsWith('env-') && name !== 'env-window' && !name.startsWith('env-dev');

/**
 * The part class of an element: its last `env-*` class that isn't a helper, else its last helper
 * class; null when it has none. It never reads parts.json, so names don't change as it loads.
 */
export function partClassOf(element: Element): string | null {
  const classes = typeof element.className === 'string' ? element.className : null;
  const known = classes === null ? undefined : partCache.get(element);
  if (known && known.classes === classes) return known.part;
  let own: string | null = null;
  let helper: string | null = null;
  for (const name of Array.from(element.classList)) {
    if (!isPartClass(name)) continue;
    if (helpers.has(name)) helper = name;
    else own = name;
  }
  const part = own ?? helper;
  if (classes !== null) partCache.set(element, { classes, part });
  return part;
}

/** Each element's part class, kept while its classes stay the same. */
const partCache = new WeakMap<Element, { classes: string; part: string | null }>();

/**
 * Loads parts.json from a URL, or from where a package or a checkout keeps it beside this module.
 * Failing quietly: the descriptions are a help, not a need.
 */
export async function loadParts(source?: string | URL): Promise<boolean> {
  const candidates = source
    ? [String(source)]
    : [
        // The package: dist/dev/parts.js beside docs/generated/parts.json.
        new URL('../../docs/generated/parts.json', import.meta.url).href,
        // A checkout running the source: packages/ui/src/dev/parts.ts.
        new URL('../../../../docs/generated/parts.json', import.meta.url).href,
      ];
  for (const url of candidates) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      setParts((await response.json()) as PartsFile);
      return true;
    } catch {
      // Not there, or not JSON, such as an app's index page served for any path.
    }
  }
  return false;
}
