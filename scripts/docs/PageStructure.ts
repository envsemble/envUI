import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { documentationDirectory } from '../RepositoryPaths.ts';
import {
  componentGroups,
  pageStatuses,
  type DocumentationBlock,
  type ExportEntry,
  type PropEntry,
} from '../../apps/site/src/documentation/DocumentationTypes.ts';
import {
  fields,
  isMap,
  listOf,
  mapOf,
  oneOf,
  optional,
  text,
  textOrYesNo,
  yesNo,
  type Reader,
} from './Shapes.ts';

export const guideExportStatus = 'stable';
export function pageKindOf(path: string) {
  if (path.startsWith('components/')) return 'component';
  if (path.startsWith('foundations/')) return 'foundation';
  return 'guide';
}
export const pageKinds = new Set(['component', 'foundation']);
export const indexSectionKinds = {
  Foundations: 'foundation',
};
export const kindFolders = {
  component: 'docs/components',
  foundation: 'docs/foundations',
  guide: 'the top of docs',
};

export type RawFrontmatter = Record<string, unknown>;

interface AvoidEntry {
  text: string;
  use?: string;
  see?: string;
}

export interface Frontmatter {
  title?: string;
  summary?: string;
  status?: string;
  since?: string;
  category?: string;
  aliases?: string[];
  useWhen?: string[];
  avoidWhen?: AvoidEntry[];
  components?: string[];
  statuses?: Record<string, string>;
  exportAliases?: Record<string, string[]>;
  examples?: Record<string, string | ExampleEntry>;
}

interface FrontmatterRule {
  type: 'string' | 'strings' | 'statuses' | 'avoid' | 'examples';
  required?: boolean;
  nonEmpty?: boolean;
  values?: readonly string[];
  pattern?: RegExp;
}

export type FrontmatterSchema = Record<string, FrontmatterRule>;

export interface PageSectionDefinition {
  id: string;
  title: string;
  generated?: boolean;
  foundationTitle?: string;
  required?: boolean;
}

export interface PageSection {
  id: string;
  title: string;
  blocks: DocumentationBlock[];
}

export interface ExampleEntry {
  role: string;
  caption?: string;
  open?: boolean;
  stage?: string;
  motion?: boolean;
  wide?: boolean;
  device?: string;
}

export interface PropsFile {
  exports: Record<string, ExportEntry>;
}

export const pageSections: readonly PageSectionDefinition[] = [
  { id: 'overview', title: 'Overview', generated: true },
  { id: 'variants', title: 'Variants', foundationTitle: 'Options' },
  { id: 'anatomy', title: 'Anatomy' },
  { id: 'behaviour', title: 'Behaviour' },
  { id: 'rules', title: 'Rules' },
  { id: 'accessibility', title: 'Accessibility' },
  { id: 'words', title: 'Words to use' },
  { id: 'code', title: 'Compose' },
  { id: 'props', title: 'Props', generated: true },
  { id: 'related', title: 'Related', generated: true },
  { id: 'changelog', title: 'Changelog' },
];

export const exampleRoles: readonly string[] = [
  'overview',
  'example',
  'variants',
  'anatomy',
  'do',
  'dont',
  'caution',
];

export function examplesOf(frontmatter: Frontmatter | undefined): Record<string, ExampleEntry> {
  return Object.fromEntries(
    Object.entries(frontmatter?.examples ?? {}).map(([name, value]) => [
      name,
      typeof value === 'string' ? { role: value } : value,
    ]),
  );
}

export const exampleFields = ['role', 'caption', 'open', 'stage', 'motion', 'wide', 'device'];

export const codeSubsections = [
  { title: 'Usage', required: true, holds: 'short code examples of its common uses and options' },
  { title: 'Composition', holds: 'how its parts and the components around it fit together' },
  { title: 'Customize', holds: 'its color properties, tokens and part classes for CSS' },
];
export const sourcePattern = /^tsx\s+source=(\S+)\s*$/;

const importWidth = 60;

function importMarkdown(names: readonly string[], props: PropsFile | undefined): string {
  const byEntry = new Map<string, string[]>();
  for (const name of names) {
    const entry = props?.exports[name]?.entries[0];
    if (entry) byEntry.set(entry, [...(byEntry.get(entry) ?? []), name]);
  }
  if (!byEntry.size) return '';
  const lines = [...byEntry].map(([entry, list]) => {
    const sorted = [...list].sort((a, b) => a.localeCompare(b, 'en'));
    const single = `import { ${sorted.join(', ')} } from '${entry}';`;
    return single.length <= importWidth || sorted.length === 1
      ? single
      : `import {\n${sorted.map((name) => `  ${name},`).join('\n')}\n} from '${entry}';`;
  });
  return `### Import\n\n\`\`\`tsx\n${lines.join('\n')}\n\`\`\`\n\n`;
}

function importedIn(sections: readonly PageSection[]): Set<string> {
  const imported = new Set<string>();
  for (const section of sections)
    for (const block of section.blocks ?? [])
      for (const [, list] of (block.kind === 'markdown' ? block.markdown : '').matchAll(
        /^import\s*\{([^}]*)\}\s*from/gm,
      ))
        for (const name of list.split(',')) if (name.trim()) imported.add(name.trim());
  return imported;
}

export function withImport<Section extends PageSection>(
  sections: Section[],
  names: readonly string[],
  props: PropsFile | undefined,
  title = 'Compose',
): Section[] {
  const imported = importedIn(sections);
  const imports = importMarkdown(
    names.filter((name, place) => place === 0 || !imported.has(name)),
    props,
  );
  if (!imports) return sections;
  const index = sections.findIndex((section) => section.id === 'code');
  if (index === -1) {
    const after = sections.findLastIndex((section) =>
      ['accessibility', 'rules', 'anatomy', 'variants', 'behaviour', 'words'].includes(section.id),
    );
    const code = {
      id: 'code',
      title,
      blocks: [{ kind: 'markdown', markdown: `## ${title}\n\n${imports}` }],
    } as Section;
    return [...sections.slice(0, after + 1), code, ...sections.slice(after + 1)];
  }
  const [first, ...rest] = sections[index].blocks as [
    Extract<DocumentationBlock, { kind: 'markdown' }>,
    ...DocumentationBlock[],
  ];
  const markdown = first.markdown.replace(/^## Compose\n+/, `## Compose\n\n${imports}`);
  return sections.with(index, {
    ...sections[index],
    blocks: [{ ...first, markdown }, ...rest],
  });
}

export function withRules<Section extends PageSection>(
  sections: Section[],
  useWhen: readonly string[],
): Section[] {
  if (!useWhen.length || sections.some((section) => section.id === 'rules')) return sections;
  const order = (id: string) => pageSections.findIndex((section) => section.id === id);
  const rules = {
    id: 'rules',
    title: 'Rules',
    blocks: [{ kind: 'markdown', markdown: '## Rules\n\n' }],
  } as Section;
  const at = sections.findIndex((section) => order(section.id) > order('rules'));
  return at === -1 ? [...sections, rules] : sections.toSpliced(at, 0, rules);
}

export const maxWhenEntries = 3;
export const maxWhenEntryLength = 80;

export const frontmatterSchema: FrontmatterSchema = {
  title: { type: 'string', required: true },
  summary: { type: 'string', required: true },
  status: { type: 'string', required: true, values: pageStatuses },
  statuses: { type: 'statuses' },
  since: { type: 'string', required: true, pattern: /^\d+\.\d+\.\d+$/ },
  category: { type: 'string', required: true, values: componentGroups },
  aliases: { type: 'strings', required: true, nonEmpty: true },
  useWhen: { type: 'strings', required: true, nonEmpty: true },
  avoidWhen: { type: 'avoid', required: true, nonEmpty: true },
  components: { type: 'strings', required: true, nonEmpty: true },
  examples: { type: 'examples', required: true },
};
const foundationFrontmatter: FrontmatterSchema = {
  title: { type: 'string', required: true },
  summary: { type: 'string', required: true },
  aliases: { type: 'strings', required: true, nonEmpty: true },
  useWhen: { type: 'strings' },
  avoidWhen: { type: 'avoid' },
  components: { type: 'strings' },
  statuses: { type: 'statuses' },
  examples: { type: 'examples', required: true },
};
export const pageSchemas: Record<string, FrontmatterSchema> = {
  component: frontmatterSchema,
  foundation: foundationFrontmatter,
};
export const otherFrontmatter = new Set([
  'status',
  'components',
  'aliases',
  'exportAliases',
  'statuses',
]);
export const slugExceptions = new Set(['chips']);

export const kebab = (name: string) =>
  name
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
export const contained = (directory: string, path: string) => {
  const inside = relative(directory, path);
  return inside && !inside.startsWith('..') && !isAbsolute(inside);
};

const texts = optional(listOf(text));
const exampleEntry = fields<ExampleEntry>({
  role: text,
  caption: optional(text),
  open: optional(yesNo),
  stage: optional(text),
  motion: optional(yesNo),
  wide: optional(yesNo),
  device: optional(text),
});
export const frontmatterOf = fields<Frontmatter>({
  title: optional(text),
  summary: optional(text),
  status: optional(text),
  since: optional(text),
  category: optional(text),
  aliases: texts,
  useWhen: texts,
  avoidWhen: optional(
    listOf(fields<AvoidEntry>({ text, use: optional(text), see: optional(text) })),
  ),
  components: texts,
  statuses: optional(mapOf(text)),
  exportAliases: optional(mapOf(listOf(text))),
  examples: optional(
    mapOf((value, where) => (typeof value === 'string' ? value : exampleEntry(value, where))),
  ),
});

const propEntry = fields<PropEntry>({
  name: text,
  type: text,
  required: yesNo,
  requiredWhen: optional(text),
  default: optional(text),
  defaultBuiltIn: optional(yesNo),
  description: text,
  deprecated: optional(textOrYesNo),
  source: optional(oneOf(['base-ui'] as const)),
});
const exportBase = { source: text, description: text, entries: listOf(text) };
const exportEntries = {
  component: fields({
    kind: oneOf(['component'] as const),
    ...exportBase,
    props: listOf(propEntry),
    native: listOf(text),
  }),
  namespace: fields({ kind: oneOf(['namespace'] as const), ...exportBase, parts: listOf(text) }),
  function: fields({ kind: oneOf(['function'] as const), ...exportBase, signature: text }),
};
const exportEntry: Reader<ExportEntry> = (value, where) => {
  const kind = isMap(value) ? value.kind : undefined;
  if (kind !== 'component' && kind !== 'namespace' && kind !== 'function')
    throw new Error(`${where}.kind must be component, namespace or function`);
  return exportEntries[kind](value, where);
};
const propsFileOf = fields<PropsFile>({ exports: mapOf(exportEntry) });

export function readProps(directory = documentationDirectory): PropsFile | undefined {
  const file = resolve(directory, 'generated/props.json');
  return existsSync(file)
    ? propsFileOf(JSON.parse(readFileSync(file, 'utf8')), 'props.json')
    : undefined;
}

export function splitFrontmatter(
  source: string,
  path: string,
): { frontmatter: RawFrontmatter | undefined; yaml: string; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n(?:\r?\n)*/);
  if (!match) return { frontmatter: undefined, yaml: '', body: source };
  let frontmatter: unknown;
  try {
    frontmatter = parseYaml(match[1], { uniqueKeys: true, strict: true });
  } catch (error) {
    throw new Error(`Invalid frontmatter in ${path}: ${(error as Error).message}`, {
      cause: error,
    });
  }
  if (!isMap(frontmatter)) throw new Error(`Frontmatter of ${path} must be a mapping.`);
  return { frontmatter, yaml: match[1], body: source.slice(match[0].length) };
}
