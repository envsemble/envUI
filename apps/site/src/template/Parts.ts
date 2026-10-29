/**
 * The public part names of envUI's components, from docs/generated/parts.json: per component, by
 * its export name, its root class, its parts with a short description each and its state
 * attributes, and the groups of parts several components share. Anatomy figures number parts by
 * these class names and take a part's description from here when their legend gives none; the
 * build checks that every legend names a part that exists.
 */
import { use } from 'react';
import type { AnatomyLegendItem } from '../shared/DocumentationTypes';
import { loadOnce } from './LoadOnce';

interface PartGroup {
  root: string;
  parts: { class: string; description: string }[];
  states: { attribute: string; values: string[]; parts: string[] }[];
  /** The color properties that set one instance's colors, each with what it colors. */
  colors?: { property: string; description: string }[];
}

interface PartsFile {
  schemaVersion: number;
  components: Record<string, PartGroup & { source: string; uses?: string[] }>;
  shared: Record<string, PartGroup & { usedBy: string[] }>;
}

// A glob, so a checkout without the generated file still builds; its figures then show the parts
// their legends name, without descriptions from the file. It loads with the pages that show parts.
const files = import.meta.glob<PartsFile>('../../../../docs/generated/parts.json', {
  import: 'default',
});
const loads = new Map<string, Promise<Parts>>();

/** The part names, loaded once and kept (loadOnce), as a page that shows them is coming. */
export function loadParts(): Promise<Parts> {
  const load = Object.values(files)[0];
  return loadOnce(loads, 'parts', async () => new Parts(load ? await load() : {}));
}

/** The part names, suspending until they have loaded. */
export const useParts = () => use(loadParts());

/** What parts.json says of envUI's components and their parts. */
export class Parts {
  private components: PartsFile['components'];
  private groups: PartGroup[];

  constructor(file: Partial<PartsFile>) {
    this.components = file.components ?? {};
    this.groups = [...Object.values(this.components), ...Object.values(file.shared ?? {})];
  }

  /** The description it gives a part, by its class name, on any component or shared group. */
  description(className: string): string | undefined {
    for (const group of this.groups) {
      const part = group.parts.find((item) => item.class === className);
      if (part) return part.description;
    }
    return undefined;
  }

  /** A legend of every part of a component, its root first, for an anatomy figure without one. */
  legendOf(component: string): AnatomyLegendItem[] {
    const entry = this.components[component];
    if (!entry) return [];
    const names = [entry.root, ...entry.parts.map((part) => part.class)];
    return [...new Set(names)].map((name) => ({ part: name, text: `\`${name}\`` }));
  }

  /** A component's part names and state attributes, by its export name, such as Button. */
  of(component: string): PartGroup | undefined {
    return this.components[component];
  }
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
