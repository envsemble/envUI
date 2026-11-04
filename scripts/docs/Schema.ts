import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

export const documentationDirectory = fileURLToPath(new URL('../../docs/', import.meta.url));

export const examplesDirectory = fileURLToPath(
  new URL('../../apps/site/src/examples/', import.meta.url),
);
export const specimensDirectory = fileURLToPath(
  new URL('../../apps/site/src/specimens/', import.meta.url),
);
export const generatedFile = fileURLToPath(
  new URL('../../apps/site/src/generated/Documentation.ts', import.meta.url),
);
const changelogFile = fileURLToPath(new URL('../../packages/ui/CHANGELOG.md', import.meta.url));
const changesetDirectory = fileURLToPath(new URL('../../.changeset/', import.meta.url));

/** The index's component groups; a component page's category is one of them. */
export const componentGroups = [
  'Actions',
  'Forms & selection',
  'Navigation',
  'Data display',
  'Text & content',
  'Feedback',
  'Overlays',
  'App frame & layout',
];
/** A page's or an export's status, a ladder from alpha to stable, then deprecated. */
export const statuses = ['alpha', 'beta', 'stable', 'deprecated'];
/**
 * The status of an export a guide or foundations page documents, such as EnvUIProvider or
 * useContainerSize, unless the page's `statuses` gives it another, or a guide's `status`.
 */
export const guideExportStatus = 'stable';
/** What people are doing, in order: a pattern page's intent groups it in the catalogue and agents. */
export const intents = [
  'Enter and change data',
  'Keep people informed',
  'Work with lists and tables',
  'Frame the application',
];
/** The kind of a page of docs/, by its folder. */
export function pageKindOf(path) {
  if (path.startsWith('components/')) return 'component';
  if (path.startsWith('patterns/')) return 'pattern';
  if (path.startsWith('foundations/')) return 'foundation';
  return 'guide';
}
/**
 * The kinds of page in the one-file structure, with frontmatter of their own and the sections of
 * pageSections; a guide is written freely.
 */
export const pageKinds = new Set(['component', 'pattern', 'foundation']);
/** The kinds of page that document exports, which a page relates to by an export's name. */
export const exportKinds = new Set(['component', 'pattern']);
/** Index sections that hold one kind of page, each from its own folder. */
export const indexSectionKinds = {
  Foundations: 'foundation',
  Patterns: 'pattern',
};
export const kindFolders = {
  component: 'docs/components',
  pattern: 'docs/patterns',
  foundation: 'docs/foundations',
  guide: 'the top of docs',
};

/**
 * The sections of a page in the one-file structure, the same for a component, a pattern and a
 * foundation, in the order the catalogue shows them and an agent reads them: what it is and its
 * examples in the frontmatter, then its variants or options, its parts, how it behaves, ending with
 * how it adapts to width, its rules, which open with when to use it, its accessibility, the words
 * people use, and how to compose it in code. Overview is generated from the frontmatter's overview
 * examples, Props from the TypeScript declarations of the page's exports and Related from its
 * avoidWhen. A foundation calls its variants Options. contributing/pages.md describes it.
 */

/**
 * A page's frontmatter as parsed YAML: unchecked until validateFrontmatter checks it field by field
 * against its kind's schema, so its fields are read as the schema says they are.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- parsed YAML, checked at run time
export type Frontmatter = Record<string, any>;

/** A field of a page's frontmatter as its schema checks it. */
export interface FrontmatterRule {
  type: 'string' | 'strings' | 'statuses' | 'avoid' | 'examples';
  required?: boolean;
  nonEmpty?: boolean;
  values?: readonly string[];
  pattern?: RegExp;
}

/** The fields a kind of page's frontmatter takes, by name. */
export type FrontmatterSchema = Record<string, FrontmatterRule>;

/** A section a page in the one-file structure may have, in its order. */
export interface PageSectionDefinition {
  id: string;
  title: string;
  /** Written by the build, not the page. */
  generated?: boolean;
  /** Its title on a foundation's page. */
  foundationTitle?: string;
  required?: boolean;
}

/** An example's entry in a page's frontmatter: its role, and its caption and framing. */
export interface ExampleEntry {
  role: string;
  caption?: string;
  open?: boolean;
  stage?: string;
  motion?: boolean;
  wide?: boolean;
}

/** The props of every export, as docs/generated/props.json holds them. */
export interface PropsFile {
  exports: Record<string, ExportProps>;
}

/** An export's entry in props.json: the entry points it comes from, and the rest of its record. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generated JSON; ExtractProps writes it
export type ExportProps = { entries: string[] } & Record<string, any>;

export const pageSections: readonly PageSectionDefinition[] = [
  { id: 'overview', title: 'Overview', generated: true },
  { id: 'variants', title: 'Variants', foundationTitle: 'Options' },
  { id: 'anatomy', title: 'Anatomy' },
  { id: 'behaviour', title: 'Behaviour' },
  { id: 'rules', title: 'Rules', required: true },
  { id: 'accessibility', title: 'Accessibility' },
  { id: 'words', title: 'Words to use' },
  { id: 'code', title: 'Compose' },
  { id: 'props', title: 'Props', generated: true },
  { id: 'related', title: 'Related', generated: true },
  { id: 'changelog', title: 'Changelog' },
];

/** The roles an example plays, as its page's frontmatter lists it. */
export const exampleRoles: readonly string[] = [
  'overview',
  'example',
  'variants',
  'anatomy',
  'do',
  'dont',
  'caution',
];

/**
 * A page's examples as its frontmatter lists them, by name: a role alone, such as
 * `CreateProject: overview`, or a role and a caption. An overview example, which no fence places,
 * takes here the framing a fence gives a figure: `open: true` shows its overlays open on its stage,
 * `stage: shaded` the deeper stage of a whole window, `motion: true` plays it in the catalogue,
 * by its animated specimen of the same name, and `wide: true` gives it a row of its own.
 */
export function examplesOf(frontmatter: Frontmatter | undefined): Record<string, ExampleEntry> {
  return Object.fromEntries(
    Object.entries<Frontmatter | string>(frontmatter?.examples ?? {}).map(([name, value]) => [
      name,
      typeof value === 'string'
        ? { role: value }
        : {
            role: value?.role,
            caption: value?.caption,
            ...(value?.open !== undefined && { open: value.open }),
            ...(value?.stage !== undefined && { stage: value.stage }),
            ...(value?.motion !== undefined && { motion: value.motion }),
            ...(value?.wide !== undefined && { wide: value.wide }),
          },
    ]),
  );
}

/**
 * The fields of an example's entry in the frontmatter; open, stage, motion and wide are an
 * overview's alone.
 */
export const exampleFields = ['role', 'caption', 'open', 'stage', 'motion', 'wide'];

/**
 * The developer part of a page: its "## Compose" section, which the catalogue leaves out and the
 * page in the Docs, the package and agents show. It holds these `###` subsections, in this order,
 * after the generated Import; Usage is required. Its code is Markdown fences of a few lines, or an
 * example file of the page shown as code, in an empty ```tsx source=Name``` fence.
 */
export const codeSubsections = [
  { title: 'Usage', required: true, holds: 'short code examples of its common uses and options' },
  { title: 'Composition', holds: 'how its parts and the components around it fit together' },
  { title: 'Customize', holds: 'its color properties, tokens and part classes for CSS' },
];
export const sourcePattern = /^tsx\s+source=(\S+)\s*$/;

/** The longest import of several names kept on one line, in characters. */
const importWidth = 60;

/**
 * The generated start of "## Compose": how to import what the page documents or, on a pattern
 * page, what it composes, from the entries props.json gives each export. An import of several names
 * that would run past importWidth puts one name to a line, so the whole of it reads in the Docs'
 * column without scrolling.
 */
export function importMarkdown(names: readonly string[], props: PropsFile | undefined): string {
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

/**
 * The page's sections with "## Compose" opening on the generated Import, and the section added,
 * after the plain sections, where the page writes none.
 */
export function withImport(sections, names, props, title = 'Compose') {
  const imports = importMarkdown(names, props);
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
    };
    return [...sections.slice(0, after + 1), code, ...sections.slice(after + 1)];
  }
  const [first, ...rest] = sections[index].blocks;
  const markdown = first.markdown.replace(/^## Compose\n+/, `## Compose\n\n${imports}`);
  return sections.with(index, {
    ...sections[index],
    blocks: [{ ...first, markdown }, ...rest],
  });
}

/**
 * Frontmatter of a component page. Guides may only name the exports they document, with
 * otherFrontmatter's fields, whose values this schema checks.
 */
export const frontmatterSchema: FrontmatterSchema = {
  title: { type: 'string', required: true },
  summary: { type: 'string', required: true },
  status: { type: 'string', required: true, values: statuses },
  /** The status of an export that differs from the page's, such as a beta editor on a stable page. */
  statuses: { type: 'statuses' },
  since: { type: 'string', required: true, pattern: /^\d+\.\d+\.\d+$/ },
  category: { type: 'string', required: true, values: componentGroups },
  aliases: { type: 'strings', required: true, nonEmpty: true },
  useWhen: { type: 'strings', required: true, nonEmpty: true },
  /** The page's one list of related components and pages: what to use for a need it doesn't meet. */
  avoidWhen: { type: 'avoid', required: true, nonEmpty: true },
  components: { type: 'strings', required: true, nonEmpty: true },
  /** Each example file once, by name, with its role and caption. */
  examples: { type: 'examples', required: true },
};
/** Frontmatter of a pattern page: required as a whole, with what it composes. */
const compositionFrontmatter: FrontmatterSchema = {
  title: { type: 'string', required: true },
  summary: { type: 'string', required: true },
  status: { type: 'string', required: true, values: statuses },
  since: { type: 'string', required: true, pattern: /^\d+\.\d+\.\d+$/ },
  aliases: { type: 'strings', required: true, nonEmpty: true },
  useWhen: { type: 'strings', required: true, nonEmpty: true },
  avoidWhen: { type: 'avoid', required: true },
  /** The exports, namespaces rather than parts, that the page's compositions combine. */
  composes: { type: 'strings', required: true, nonEmpty: true },
  examples: { type: 'examples', required: true },
};
/**
 * Frontmatter of a foundation page: what it is, the words people search for, its related pages and
 * its figures, which are the catalogue's (figures/foundations), each once with its role and
 * caption.
 */
const foundationFrontmatter: FrontmatterSchema = {
  title: { type: 'string', required: true },
  summary: { type: 'string', required: true },
  aliases: { type: 'strings', required: true, nonEmpty: true },
  useWhen: { type: 'strings' },
  avoidWhen: { type: 'avoid' },
  components: { type: 'strings' },
  /** The status of an export that differs from stable, such as a beta hook. */
  statuses: { type: 'statuses' },
  examples: { type: 'examples', required: true },
};
/** The frontmatter of each kind of page in the one-file structure; guides take otherFrontmatter. */
export const pageSchemas: Record<string, FrontmatterSchema> = {
  component: frontmatterSchema,
  pattern: {
    ...compositionFrontmatter,
    intent: { type: 'string', required: true, values: intents },
  },
  foundation: foundationFrontmatter,
};
export const otherFrontmatter = new Set([
  'status',
  'components',
  'aliases',
  'exportAliases',
  'statuses',
]);
/** A page whose slug cannot follow its title until the component it documents is merged. */
export const slugExceptions = new Set(['chips']);

/** A name in kebab case: `AvatarGroup` is `avatar-group`, `CodeDiff` `code-diff`. */
export const kebab = (name: string) =>
  name
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
export const contained = (directory: string, path: string) => {
  const inside = relative(directory, path);
  return inside && !inside.startsWith('..') && !isAbsolute(inside);
};

/** The changesets' version bumps, in order of size. */
const bumpOrder = ['patch', 'minor', 'major'];

/** A version raised by a bump: 1.2.3 by minor is 1.3.0. */
function bumped(version: string, bump: string) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/** Orders versions such as 0.10.0 after 0.9.0. */
const compareVersions = (a: string, b: string) => {
  const [x, y] = [a, b].map((version) => version.split('.').map(Number));
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

/**
 * The versions a page's `since` may name: each stable version the library's changelog lists, and
 * the version its changesets lead to. That is the newest stable version raised by the largest bump
 * of a pending changeset, counting the packages that share envUI's version (the `fixed` group of
 * .changeset/config.json). In prerelease mode (.changeset/pre.json, with the changesets it applied
 * in .changeset/pre/) it is the version the prereleases lead to, such as 1.0.0 for
 * 1.0.0-prerelease.3: the version before the prereleases, from the mode's initialVersions or the
 * newest stable version, raised by the largest bump of every changeset since, released in a
 * prerelease or not, as Changesets computes it. Prerelease headings such as
 * `## 1.0.0-prerelease.0` are not versions a page can name. Undefined outside the repository, where the check is skipped.
 */
export function libraryVersions({
  changelog = changelogFile,
  changesets = changesetDirectory,
} = {}) {
  if (!existsSync(changelog)) return undefined;
  const released = [...readFileSync(changelog, 'utf8').matchAll(/^## (\d+\.\d+\.\d+)(?=\s|$)/gm)]
    .map((match) => match[1])
    .sort(compareVersions);
  const versions = new Set(released);
  const readJson = (name: string) => {
    const file = resolve(changesets, name);
    return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined;
  };
  const library = '@envsemble/envui';
  const group = readJson('config.json')?.fixed?.find((names) => names.includes(library)) ?? [
    library,
  ];
  const pre = readJson('pre.json');
  // Changesets 3 keeps the changesets that prereleases applied in .changeset/pre/ until the mode
  // ends; they count toward the version the prereleases lead to.
  const directories = [changesets];
  if (pre?.mode === 'pre') directories.push(resolve(changesets, 'pre'));
  const files = directories.flatMap((directory) =>
    existsSync(directory)
      ? readdirSync(directory)
          .filter((name) => name.endsWith('.md') && name !== 'README.md')
          .map((name) => resolve(directory, name))
      : [],
  );
  const bumps = files.length
    ? files.flatMap((file) => {
        const source = readFileSync(file, 'utf8');
        const header = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
        return [...header.matchAll(/^['"]?([^'"\s:]+)['"]?:\s*(major|minor|patch)\s*$/gm)]
          .filter(([, name]) => group.includes(name))
          .map(([, , bump]) => bump);
      })
    : [];
  const largest = bumps.sort((a, b) => bumpOrder.indexOf(b) - bumpOrder.indexOf(a))[0];
  const base =
    (pre?.mode === 'pre' ? pre.initialVersions?.[library] : undefined) ??
    released.at(-1) ??
    '0.0.0';
  if (largest) versions.add(bumped(base, largest));
  return versions;
}

export function readProps(directory = documentationDirectory): PropsFile | undefined {
  const file = resolve(directory, 'generated/props.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined;
}

/** Splits `---` YAML frontmatter from a Markdown source. */
export function splitFrontmatter(
  source: string,
  path: string,
): { frontmatter: Frontmatter | undefined; yaml: string; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n(?:\r?\n)*/);
  if (!match) return { frontmatter: undefined, yaml: '', body: source };
  let frontmatter: Frontmatter | undefined;
  try {
    frontmatter = parseYaml(match[1], { uniqueKeys: true, strict: true });
  } catch (error) {
    throw new Error(`Invalid frontmatter in ${path}: ${(error as Error).message}`, {
      cause: error,
    });
  }
  if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter))
    throw new Error(`Frontmatter of ${path} must be a mapping.`);
  return { frontmatter, yaml: match[1], body: source.slice(match[0].length) };
}
