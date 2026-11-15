interface PartInfo {
  className: string;
  component: string;
  description?: string;
  root: boolean;
  shared: boolean;
}

interface StateAttribute {
  attribute: string;
  values: string[];
  parts: string[];
}

export interface PartsIndex {
  byClass: Map<string, PartInfo>;
  states: Map<string, StateAttribute[]>;
}

/** One component or shared group of parts.json. */
export interface PartsEntry {
  /** The root class, or null for a shared group without one of its own. */
  root: string | null;
  parts: { class: string; description: string }[];
  states?: { attribute: string; values: string[]; parts: string[] }[];
}

/** The parts' descriptions, as docs/generated/parts.json holds them. */
export interface PartsFile {
  schemaVersion: number;
  components: Record<string, PartsEntry & { source: string; uses?: string[] }>;
  shared?: Record<string, PartsEntry & { usedBy?: string[] }>;
}

/** @internal */
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

export const knownParts = () => current;

export function setParts(data: PartsFile | null) {
  current = data === null ? null : indexParts(data);
  for (const listener of listeners) listener();
}

export function onPartsChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const helperClasses = new Set([
  'env-theme',
  'env-surface',
  'env-text',
  'env-icon',
  'env-prose',
  'env-connected-rows',
  'env-connected-row',
]);

const isPartClass = (name: string) =>
  name.startsWith('env-') && name !== 'env-window' && !name.startsWith('env-dev');

export function partClassOf(element: Element): string | null {
  const classes = typeof element.className === 'string' ? element.className : null;
  const known = classes === null ? undefined : partClassCache.get(element);
  if (known && known.classes === classes) return known.part;
  let own: string | null = null;
  let helper: string | null = null;
  for (const name of Array.from(element.classList)) {
    if (!isPartClass(name)) continue;
    if (helperClasses.has(name)) helper = name;
    else own = name;
  }
  const part = own ?? helper;
  if (classes !== null) partClassCache.set(element, { classes, part });
  return part;
}

const partClassCache = new WeakMap<Element, { classes: string; part: string | null }>();

const fromThePackagedModule = '../../docs/generated/parts.json';
const fromTheSourceInACheckout = '../../../../docs/generated/parts.json';

export async function loadParts(source?: string | URL): Promise<boolean> {
  const candidates = source
    ? [String(source)]
    : [
        new URL(fromThePackagedModule, import.meta.url).href,
        new URL(fromTheSourceInACheckout, import.meta.url).href,
      ];
  for (const url of candidates) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      setParts((await response.json()) as PartsFile);
      return true;
    } catch {
      continue;
    }
  }
  return false;
}
