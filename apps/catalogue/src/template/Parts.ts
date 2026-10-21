/**
 * The public part names of envUI's components, from docs/generated/parts.json: per component, by
 * its export name, its root class, its parts with a short description each and its state
 * attributes, and the groups of parts several components share. Anatomy figures number parts by
 * these class names and take a part's description from here when their legend gives none; the
 * build checks that every legend names a part that exists.
 */
import type { AnatomyLegendItem } from '../DocumentationTypes';

interface PartGroup {
  root: string;
  parts: { class: string; description: string }[];
  states: { attribute: string; values: string[]; parts: string[] }[];
}

interface PartsFile {
  schemaVersion: number;
  components: Record<string, PartGroup & { source: string; uses?: string[] }>;
  shared: Record<string, PartGroup & { usedBy: string[] }>;
}

// A glob, so a checkout without the generated file still builds; its figures then show the parts
// their legends name, without descriptions from the file.
const files = import.meta.glob<PartsFile>('../../../../docs/generated/parts.json', {
  eager: true,
  import: 'default',
});
const file: Partial<PartsFile> = Object.values(files)[0] ?? {};
const components = file.components ?? {};
const groups = [...Object.values(components), ...Object.values(file.shared ?? {})];

/** The description parts.json gives a part, by its class name, on any component or shared group. */
export function partDescription(className: string): string | undefined {
  for (const group of groups) {
    const part = group.parts.find((item) => item.class === className);
    if (part) return part.description;
  }
  return undefined;
}

/** A legend of every part of a component, its root first, for an anatomy figure without one. */
export function legendOf(component: string): AnatomyLegendItem[] {
  const entry = components[component];
  if (!entry) return [];
  const names = [entry.root, ...entry.parts.map((part) => part.class)];
  return [...new Set(names)].map((name) => ({ part: name, text: `\`${name}\`` }));
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
