// Part names and their descriptions, from docs/generated/parts.json when the app hands it to dev
// mode or dev mode can fetch it. Without it, a part is named by its class alone.

/** A part of a component: its class, the component it belongs to and what it is. */
export interface PartInfo {
  /** The part's class name, such as `env-card-header`. */
  className: string;
  /** The component it belongs to, such as `Card`. */
  component: string;
  /** What the part is, in a sentence. */
  description?: string;
  /** Whether it is the component's root. */
  root: boolean;
}

/** A state attribute of a component, with the values it takes. */
export interface StateAttribute {
  attribute: string;
  values: string[];
}

/** The parts by class name, and the state attributes by component. */
export interface PartsIndex {
  byClass: Map<string, PartInfo>;
  states: Map<string, StateAttribute[]>;
}

type Loose = Record<string, unknown>;
const isObject = (value: unknown): value is Loose =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === 'string' && value.length > 0);

/** A part given as a class name, or as an object with its class and description. */
function partOf(
  value: unknown,
  fallbackClass?: string,
): { className?: string; description?: string } {
  if (typeof value === 'string')
    return fallbackClass ? { className: fallbackClass, description: value } : { className: value };
  if (!isObject(value)) return {};
  return {
    className: text(value.className, value.class, value.name, fallbackClass),
    description: text(value.description, value.summary),
  };
}

function statesOf(value: unknown): StateAttribute[] {
  const values = (input: unknown) =>
    Array.isArray(input) ? input.filter((item): item is string => typeof item === 'string') : [];
  if (Array.isArray(value))
    return value.flatMap((item) => {
      if (typeof item === 'string') return [{ attribute: item, values: [] }];
      if (!isObject(item)) return [];
      const attribute = text(item.attribute, item.name);
      return attribute ? [{ attribute, values: values(item.values) }] : [];
    });
  if (isObject(value))
    return Object.entries(value).map(([attribute, item]) => ({ attribute, values: values(item) }));
  return [];
}

/**
 * Indexes parts.json leniently: a list of components or an object of them by name, or either
 * under `components`; each with a root class (`root`, `rootClass` or `className`), its parts as
 * a list of classes or of `{ className, description }`, or an object from class to description,
 * and its state attributes (`states` or `stateAttributes`).
 */
export function indexParts(data: unknown): PartsIndex {
  const index: PartsIndex = { byClass: new Map(), states: new Map() };
  const source = isObject(data) && 'components' in data ? data.components : data;
  const entries: [string | undefined, unknown][] = Array.isArray(source)
    ? source.map((component) => [undefined, component])
    : isObject(source)
      ? Object.entries(source)
      : [];
  for (const [key, component] of entries) {
    if (!isObject(component)) continue;
    const name = text(component.name, component.component, key) ?? '';
    const root = partOf(component.root ?? component.rootClass ?? component.className);
    if (root.className)
      index.byClass.set(root.className, {
        className: root.className,
        component: name,
        description: root.description ?? text(component.description, component.summary),
        root: true,
      });
    const parts = component.parts;
    const list: { className?: string; description?: string }[] = Array.isArray(parts)
      ? parts.map((part) => partOf(part))
      : isObject(parts)
        ? Object.entries(parts).map(([className, part]) => partOf(part, className))
        : [];
    for (const part of list)
      if (part.className && !index.byClass.has(part.className))
        index.byClass.set(part.className, {
          className: part.className,
          component: name,
          description: part.description,
          root: false,
        });
    const states = statesOf(component.states ?? component.stateAttributes);
    if (states.length) index.states.set(name, states);
  }
  return index;
}

let current: PartsIndex | null = null;

/** The parts dev mode knows, or null before any are loaded. */
export const knownParts = () => current;

/** Replaces the parts dev mode knows. */
export function setParts(data: unknown) {
  current = data === null ? null : indexParts(data);
}

/**
 * The part class of an element: of its `env-*` classes, the last one parts.json knows, or else the
 * last one; null when it has none.
 */
export function partClassOf(element: Element, parts: PartsIndex | null = current): string | null {
  const classes = typeof element.className === 'string' ? element.className : null;
  const known = classes === null ? undefined : partCache.get(element);
  if (known && known.classes === classes && known.parts === parts) return known.part;
  let last: string | null = null;
  let found: string | null = null;
  for (const name of Array.from(element.classList)) {
    if (!name.startsWith('env-')) continue;
    last = name;
    if (parts?.byClass.has(name)) found = name;
  }
  const part = found ?? last;
  if (classes !== null) partCache.set(element, { classes, parts, part });
  return part;
}

/** Each element's part class, kept while its classes and the parts stay the same. */
const partCache = new WeakMap<
  Element,
  { classes: string; parts: PartsIndex | null; part: string | null }
>();

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
      setParts(await response.json());
      return true;
    } catch {
      // Not there, or not JSON, such as an app's index page served for any path.
    }
  }
  return false;
}
