/**
 * The public part names of envUI's components, from docs/generated/parts.json when it exists: per
 * component its root class, its parts with a short description each, and its state attributes.
 * Anatomy figures number parts by these class names and take a part's description from here when
 * their legend gives none. Without the file, figures number only the parts their legend names.
 */
import type { AnatomyLegendItem } from '../DocumentationTypes';

export interface ComponentParts {
  root: string;
  parts: { className: string; description: string }[];
  states: { attribute: string; values: string[] }[];
}

// A glob, so a checkout without the generated file builds and falls back.
const files = import.meta.glob<unknown>('../../../../docs/generated/parts.json', {
  eager: true,
  import: 'default',
});

/** The file's components by name; it may list them at its top or under `components`. */
function readParts(): Record<string, ComponentParts> {
  const json = Object.values(files)[0];
  if (!json || typeof json !== 'object') return {};
  const listed = (json as { components?: unknown }).components ?? json;
  const entries = Array.isArray(listed)
    ? listed.map((entry) => [(entry as { name?: string }).name ?? '', entry] as const)
    : Object.entries(listed as Record<string, unknown>);
  return Object.fromEntries(
    entries.filter(
      (entry): entry is readonly [string, ComponentParts] =>
        Boolean(entry[0]) &&
        typeof (entry[1] as ComponentParts)?.root === 'string' &&
        Array.isArray((entry[1] as ComponentParts).parts),
    ),
  );
}

export const componentParts = readParts();

/** The description parts.json gives a part, by its class name, on any component. */
export function partDescription(className: string): string | undefined {
  for (const entry of Object.values(componentParts)) {
    const part = entry.parts.find((item) => item.className === className);
    if (part) return part.description;
  }
  return undefined;
}

/** A legend of every part of a component, for an anatomy figure without one of its own. */
export function legendOf(component: string): AnatomyLegendItem[] {
  const entry = componentParts[component];
  if (!entry) return [];
  const parts = entry.parts.some((part) => part.className === entry.root)
    ? entry.parts
    : [{ className: entry.root, description: 'The root.' }, ...entry.parts];
  return parts.map(({ className }) => ({ part: className, text: `\`${className}\`` }));
}

/**
 * The selector of a part reference: a class name such as env-card-header, or a selector whose
 * env-* class names are written without their dot, such as `env-button > env-icon:last-child`. A
 * trailing ::text points at the element's own text rather than its box.
 */
export function partSelector(part: string): { selector: string; text: boolean } {
  const text = /::text$/.test(part);
  const selector = part
    .replace(/::text$/, '')
    .replace(/(^|[\s>+~(,])(env-[\w-]+)/g, '$1.$2')
    .trim();
  return { selector, text };
}
