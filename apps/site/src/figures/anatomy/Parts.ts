import type { AnatomyLegendItem } from '../../documentation/DocumentationTypes';

interface PartGroup {
  root: string;
  parts: { class: string; description: string }[];
  states: { attribute: string; values: string[]; parts: string[] }[];
  colors?: { property: string; description: string }[];
}

interface PartsFile {
  schemaVersion: number;
  components: Record<string, PartGroup & { source: string; uses?: string[] }>;
  shared: Record<string, PartGroup & { usedBy: string[] }>;
}

const partsFileWhenGenerated = import.meta.glob<PartsFile>(
  '../../../../../docs/generated/parts.json',
  {
    eager: true,
    import: 'default',
  },
);
const file: Partial<PartsFile> = Object.values(partsFileWhenGenerated)[0] ?? {};
const components = file.components ?? {};
const groups = [...Object.values(components), ...Object.values(file.shared ?? {})];

export function partDescription(className: string): string | undefined {
  for (const group of groups) {
    const part = group.parts.find((item) => item.class === className);
    if (part) return part.description;
  }
  return undefined;
}

export function legendOf(component: string): AnatomyLegendItem[] {
  const entry = components[component];
  if (!entry) return [];
  const names = [entry.root, ...entry.parts.map((part) => part.class)];
  return [...new Set(names)].map((name) => ({ part: name, text: `\`${name}\`` }));
}

export function partSelector(part: string): { selector: string; text: boolean } {
  const text = /::text$/.test(part);
  const selector = part
    .replace(/::text$/, '')
    .replace(/(^|[\s>+~(,])(env-[\w-]+)/g, '$1.$2')
    .trim();
  return { selector, text };
}

export function partsOf(component: string): PartGroup | undefined {
  return components[component];
}
