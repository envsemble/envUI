// Reads the documentation in docs/: the index, which groups and orders the pages, and each page with
// its frontmatter. It validates them, generates the catalogue's data
// (apps/catalogue/src/generated/Documentation.ts) and compiles the Markdown that ships in the
// package, where example files and generated props tables are filled in.
//
// Component and pattern pages (docs/components and docs/patterns) carry YAML frontmatter (see
// pageSchemas). A page on the template has the fixed `##` sections of templateSections, in their
// order, the subset its kind allows (sectionRules); its examples are files in
// apps/catalogue/src/examples/<page>/<Name>.tsx, referenced by an empty fence ```tsx example=Name```,
// and its Props and Related sections are generated, Related from its avoidWhen. docs/component-pages.md and docs/pattern-pages.md describe the
// template for authors.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, isAbsolute, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { parse as parseYaml } from 'yaml';
import { headingsOf } from './MarkdownHeadings.mjs';
import { headingSlugger } from './SearchAnchors.mjs';
import { optionTable, optionTableProblems } from './SiteContent.mjs';
import { writeSearchIndex } from './SearchIndex.mjs';

export const documentationDirectory = fileURLToPath(new URL('../docs/', import.meta.url));

/**
 * Pages the package leaves out, whose links in its pages lead to the copies on main instead: the
 * contributor pages, for people who work on envUI itself, which neither the Site nor the Docs show
 * (unlistedDocuments in apps/catalogue/src/navigation/DocumentationRoutes.ts), and local
 * development, which needs a checkout of envUI and which the Docs show.
 */
export const contributorPages = new Set([
  'local-development.md',
  'library-development.md',
  'component-pages.md',
  'pattern-pages.md',
]);
const repositoryDocumentation = 'https://github.com/envsemble/envUI/blob/main/docs/';

/** A packaged page's links to contributor pages, pointed at the repository's copies on main. */
export function linkContributorPages(markdown, path) {
  return markdown.replace(/\]\(([^)\s#:]+\.md)(#[^)\s]*)?\)/g, (link, href, hash = '') => {
    const target = posix.normalize(posix.join(posix.dirname(path), href));
    return contributorPages.has(target) ? `](${repositoryDocumentation}${target}${hash})` : link;
  });
}

export const examplesDirectory = fileURLToPath(
  new URL('../apps/catalogue/src/examples/', import.meta.url),
);
export const specimensDirectory = fileURLToPath(
  new URL('../apps/catalogue/src/specimens/', import.meta.url),
);
const generatedFile = fileURLToPath(
  new URL('../apps/catalogue/src/generated/Documentation.ts', import.meta.url),
);
const changelogFile = fileURLToPath(new URL('../packages/ui/CHANGELOG.md', import.meta.url));
const changesetDirectory = fileURLToPath(new URL('../.changeset/', import.meta.url));

/** The index's component groups; a component page's category is one of them. */
export const componentGroups = [
  'Layout & surfaces',
  'Actions',
  'Forms & selection',
  'Navigation',
  'Content & guidance',
  'Feedback & overlays',
];
export const statuses = ['experimental', 'beta', 'stable', 'deprecated'];
/**
 * The status of an export a guide or foundations page documents, such as EnvUIProvider or
 * useContainerSize, unless the page's `statuses` gives it another.
 */
export const guideExportStatus = 'stable';
/** What people are doing, in order: a pattern page's intent groups it in the catalogue and agents. */
export const intents = ['Enter and change data', 'Keep people informed', 'Find and navigate'];
/** The kind of a page of docs/, by its folder. */
export function pageKindOf(path) {
  if (path.startsWith('components/')) return 'component';
  if (path.startsWith('patterns/')) return 'pattern';
  if (path.startsWith('foundations/')) return 'foundation';
  return 'guide';
}
/** Page kinds that have frontmatter of their own and, once on it, the page template's sections. */
const sectionedKinds = new Set(['component', 'pattern']);
/** Index sections that hold one kind of page, each from its own folder. */
const indexSectionKinds = {
  Foundations: 'foundation',
  Patterns: 'pattern',
};
const kindFolders = {
  component: 'docs/components',
  pattern: 'docs/patterns',
  foundation: 'docs/foundations',
  guide: 'the top of docs',
};

/**
 * The sections of a page on the template, in order. Props and Related are generated: Props from
 * the TypeScript declarations of the page's components, Related from its frontmatter.
 */
export const templateSections = [
  { id: 'overview', title: 'Overview', required: true },
  { id: 'anatomy', title: 'Anatomy' },
  { id: 'variants', title: 'Variants and sizes' },
  { id: 'states', title: 'States and behaviour' },
  { id: 'content', title: 'Content guidelines' },
  { id: 'do-and-dont', title: "Do and don't" },
  { id: 'accessibility', title: 'Accessibility', required: true },
  { id: 'examples', title: 'Examples', required: true },
  { id: 'props', title: 'Props', generated: true },
  { id: 'related', title: 'Related', generated: true },
  { id: 'changelog', title: 'Changelog' },
];

/**
 * The sections of a component page on the figure template, in order: short text and live figures
 * under ordinary headings. Props and Related are generated, as on the section template.
 */
export const figureSections = [
  { id: 'overview', title: 'Overview', required: true },
  { id: 'variants', title: 'Variants' },
  { id: 'usage', title: 'When to use', required: true },
  { id: 'anatomy', title: 'Anatomy' },
  { id: 'width', title: 'Adapting to width' },
  { id: 'accessibility', title: 'Accessibility', required: true },
  { id: 'code', title: 'In code' },
  { id: 'props', title: 'Props', generated: true },
  { id: 'related', title: 'Related', generated: true },
  { id: 'changelog', title: 'Changelog' },
];

/**
 * The developer-only part of a page on the figure template: its "## In code" section, which the
 * Site leaves out and the page's guide in the Docs, the package and agents show. It holds these
 * `###` subsections, in this order, after the generated Import; Usage is required. Its code is
 * Markdown fences of a few lines, or an example file of the page shown as code, in an empty
 * ```tsx source=Name``` fence.
 */
export const codeSubsections = [
  { title: 'Usage', required: true, holds: 'short code examples of its common uses and options' },
  { title: 'Composition', holds: 'how its parts and the components around it fit together' },
  { title: 'Customize', holds: 'its color properties, tokens and part classes for CSS' },
];
const sourcePattern = /^tsx\s+source=(\S+)\s*$/;

/**
 * The generated start of "## In code": how to import what the page documents or, on a pattern
 * page, what it composes, from the entries props.json gives each export.
 */
export function importMarkdown(names, props) {
  const byEntry = new Map();
  for (const name of names) {
    const entry = props?.exports[name]?.entries[0];
    if (entry) byEntry.set(entry, [...(byEntry.get(entry) ?? []), name]);
  }
  if (!byEntry.size) return '';
  const lines = [...byEntry].map(([entry, list]) => {
    const sorted = [...list].sort((a, b) => a.localeCompare(b, 'en'));
    const single = `import { ${sorted.join(', ')} } from '${entry}';`;
    return single.length <= 100
      ? single
      : `import {\n${sorted.map((name) => `  ${name},`).join('\n')}\n} from '${entry}';`;
  });
  return `### Import\n\n\`\`\`tsx\n${lines.join('\n')}\n\`\`\`\n\n`;
}

/**
 * The page's sections with "## In code" opening on the generated Import, and the section added,
 * after Accessibility, where the page writes none.
 */
function withImport(sections, names, props) {
  const imports = importMarkdown(names, props);
  if (!imports) return sections;
  const index = sections.findIndex((section) => section.id === 'code');
  if (index === -1) {
    const after = sections.findIndex((section) => section.id === 'accessibility');
    const code = {
      id: 'code',
      title: 'In code',
      blocks: [{ kind: 'markdown', markdown: `## In code\n\n${imports}` }],
    };
    return [...sections.slice(0, after + 1), code, ...sections.slice(after + 1)];
  }
  const [first, ...rest] = sections[index].blocks;
  const markdown = first.markdown.replace(/^## In code\n+/, `## In code\n\n${imports}`);
  return sections.with(index, {
    ...sections[index],
    blocks: [{ ...first, markdown }, ...rest],
  });
}

/**
 * Frontmatter of a component page. `template` fields are required once the page is on the
 * template; other pages (foundations, workflows) may only name the components they document.
 */
export const frontmatterSchema = {
  title: { type: 'string', required: true },
  summary: { type: 'string', required: true },
  status: { type: 'string', required: true, values: statuses },
  /** The status of an export that differs from the page's, such as a beta editor on a stable page. */
  statuses: { type: 'statuses' },
  since: { type: 'string', required: true, pattern: /^\d+\.\d+\.\d+$/ },
  category: { type: 'string', required: true, values: componentGroups },
  aliases: { type: 'strings', required: true, nonEmpty: true },
  useWhen: { type: 'strings', template: true },
  /** The page's one list of related components and pages: what to use for a need it doesn't meet. */
  avoidWhen: { type: 'avoid', template: true },
  components: { type: 'strings', required: true, nonEmpty: true },
};
/** Frontmatter of a pattern page: required as a whole, with what it composes. */
const compositionFrontmatter = {
  title: { type: 'string', required: true },
  summary: { type: 'string', required: true },
  status: { type: 'string', required: true, values: statuses },
  since: { type: 'string', required: true, pattern: /^\d+\.\d+\.\d+$/ },
  aliases: { type: 'strings', required: true, nonEmpty: true },
  useWhen: { type: 'strings', required: true, nonEmpty: true },
  avoidWhen: { type: 'avoid', required: true },
  /** The exports, namespaces rather than parts, that the page's compositions combine. */
  composes: { type: 'strings', required: true, nonEmpty: true },
};
/** The frontmatter of each page kind that has its own; other pages take otherFrontmatter only. */
export const pageSchemas = {
  component: frontmatterSchema,
  pattern: {
    ...compositionFrontmatter,
    intent: { type: 'string', required: true, values: intents },
  },
};
const otherFrontmatter = new Set(['components', 'aliases', 'exportAliases', 'statuses']);
/** A page whose slug cannot follow its title until the component it documents is merged. */
const slugExceptions = new Set(['chips']);

const kebab = (name) =>
  name
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
const contained = (directory, path) => {
  const inside = relative(directory, path);
  return inside && !inside.startsWith('..') && !isAbsolute(inside);
};

/** The changesets' version bumps, in order of size. */
const bumpOrder = ['patch', 'minor', 'major'];

/** A version raised by a bump: 1.2.3 by minor is 1.3.0. */
function bumped(version, bump) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/** Orders versions such as 0.10.0 after 0.9.0. */
const compareVersions = (a, b) => {
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
  const readJson = (name) => {
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

export function readProps(directory = documentationDirectory) {
  const file = resolve(directory, 'generated/props.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined;
}

/** Splits `---` YAML frontmatter from a Markdown source. */
export function splitFrontmatter(source, path) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n(?:\r?\n)*/);
  if (!match) return { frontmatter: undefined, yaml: '', body: source };
  let frontmatter;
  try {
    frontmatter = parseYaml(match[1], { uniqueKeys: true, strict: true });
  } catch (error) {
    throw new Error(`Invalid frontmatter in ${path}: ${error.message}`, { cause: error });
  }
  if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter))
    throw new Error(`Frontmatter of ${path} must be a mapping.`);
  return { frontmatter, yaml: match[1], body: source.slice(match[0].length) };
}

function validateFrontmatter(frontmatter, path, { kind, template, versions }) {
  const problems = [];
  const schema = pageSchemas[kind];
  if (!schema) {
    for (const key of Object.keys(frontmatter))
      if (!otherFrontmatter.has(key))
        problems.push(
          `${key} is not allowed here; only components, aliases, exportAliases and statuses are`,
        );
  }
  if (!schema && 'exportAliases' in frontmatter) {
    // The names people search for an export by, for an export without a component page of its
    // own, such as "theme switcher" for ThemeToggle: a list per export the page documents.
    const value = frontmatter.exportAliases;
    const listed = Array.isArray(frontmatter.components) ? frontmatter.components : [];
    if (!value || typeof value !== 'object' || Array.isArray(value))
      problems.push('exportAliases must map an export to its aliases');
    else
      for (const [name, aliases] of Object.entries(value)) {
        if (!listed.includes(name))
          problems.push(`exportAliases names ${name}, which components does not list`);
        if (
          !Array.isArray(aliases) ||
          !aliases.length ||
          aliases.some((alias) => typeof alias !== 'string' || !alias.trim()) ||
          new Set(aliases).size !== aliases.length
        )
          problems.push(`exportAliases of ${name} must be a list of distinct strings`);
      }
  }
  for (const [key, value] of Object.entries(frontmatter)) {
    if (key === 'exportAliases' && !schema) continue;
    const rule = (schema ?? frontmatterSchema)[key];
    if (!rule) {
      problems.push(`unknown field ${key}`);
      continue;
    }
    if (rule.type === 'string') {
      if (typeof value !== 'string' || !value.trim()) problems.push(`${key} must be a string`);
      else if (rule.values && !rule.values.includes(value))
        problems.push(`${key} must be one of ${rule.values.join(', ')}`);
      else if (rule.pattern && !rule.pattern.test(value))
        problems.push(`${key} must match ${rule.pattern}`);
    } else if (rule.type === 'strings') {
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim()))
        problems.push(`${key} must be a list of strings`);
      else if (new Set(value).size !== value.length) problems.push(`${key} repeats an entry`);
    } else if (rule.type === 'avoid') {
      if (
        !Array.isArray(value) ||
        value.some(
          (item) =>
            !item ||
            typeof item !== 'object' ||
            typeof item.text !== 'string' ||
            !item.text.trim() ||
            ('use' in item && (typeof item.use !== 'string' || !item.use.trim())) ||
            ('see' in item && (typeof item.see !== 'string' || !item.see.trim())) ||
            'use' in item === 'see' in item ||
            Object.keys(item).some((field) => !['text', 'use', 'see'].includes(field)),
        )
      )
        problems.push(
          `${key} must be a list of { text, use } or { text, see } entries, use naming the export to use instead and see the page to read instead`,
        );
    } else if (rule.type === 'statuses') {
      const listed = Array.isArray(frontmatter.components) ? frontmatter.components : [];
      if (!value || typeof value !== 'object' || Array.isArray(value))
        problems.push(`${key} must map an export to its status`);
      else
        for (const [name, status] of Object.entries(value)) {
          if (!listed.includes(name))
            problems.push(`${key} names ${name}, which components does not list`);
          if (!statuses.includes(status))
            problems.push(`${key} of ${name} must be one of ${statuses.join(', ')}`);
          else if (status === (schema ? frontmatter.status : guideExportStatus))
            problems.push(
              schema
                ? `${key} of ${name} repeats the page's status; leave it out`
                : `${key} of ${name} repeats the default status of a guide's exports, ${guideExportStatus}; leave it out`,
            );
        }
    }
  }
  if (schema) {
    for (const [key, rule] of Object.entries(schema)) {
      const required = rule.required || (rule.template && template);
      if (required && !(key in frontmatter)) problems.push(`${key} is required`);
      if ((rule.nonEmpty || (rule.template && template)) && Array.isArray(frontmatter[key]))
        if (!frontmatter[key].length) problems.push(`${key} must not be empty`);
    }
    if (typeof frontmatter.summary === 'string' && !/[.!?]$/.test(frontmatter.summary.trim()))
      problems.push('summary must be a sentence ending with a full stop');
    if (
      versions &&
      typeof frontmatter.since === 'string' &&
      frontmatter.since.match(schema.since.pattern) &&
      !versions.has(frontmatter.since)
    )
      problems.push(
        `since ${frontmatter.since} is neither a released version nor the next one (${[...versions].join(', ')})`,
      );
    for (const name of Array.isArray(frontmatter.components) ? frontmatter.components : [])
      if (typeof name === 'string' && name.includes('.'))
        problems.push(
          `components lists ${name}, a part: list its namespace, ${name.split('.')[0]}, whose page documents its parts`,
        );
    for (const name of Array.isArray(frontmatter.composes) ? frontmatter.composes : [])
      if (typeof name === 'string' && name.includes('.'))
        problems.push(`composes lists ${name}, a part: list its namespace, ${name.split('.')[0]}`);
  }
  if (problems.length)
    throw new Error(`Invalid frontmatter in ${path}:\n  - ${problems.join('\n  - ')}`);
}

/** First columns that name what a props table lists. */
const propsTableNames = [
  'prop',
  'props',
  'name',
  'property',
  'properties',
  'option',
  'options',
  'attribute',
  'attributes',
  'parameter',
  'parameters',
  'argument',
  'arguments',
  'field',
  'fields',
];
/**
 * The columns that make a table one of props: a type, default or contract. A table of attributes
 * and their values, or of names and descriptions, is not.
 */
const propsTableColumns = ['type', 'types', 'contract', 'contracts', 'default', 'defaults'];

/**
 * A table that lists props by hand, such as `| Name | Contract |` or `| Option | Type |`; the
 * template generates them.
 */
export function isPropsTable(token) {
  if (token.type !== 'table') return false;
  const header = token.header.map((cell) => cell.text.trim().toLowerCase());
  return (
    propsTableNames.includes(header[0]) &&
    header.slice(1).some((cell) => propsTableColumns.includes(cell))
  );
}

/** A fence long enough for a source: three backticks, or one more than its longest run. */
export function fenceFor(source) {
  const longest = Math.max(0, ...[...source.matchAll(/`+/g)].map((match) => match[0].length));
  return '`'.repeat(Math.max(3, longest + 1));
}

const examplePattern = /^tsx\s+example=(?:"([^"]*)"|(\S+))\s*$/;
const specimenPattern = /^<!--\s*specimen:\s*([A-Za-z][\w]*)\s*-->\s*$/;

/** The sections of a pattern page: the component template's, without Variants and Props. */
const compositionSections = [
  'overview',
  'anatomy',
  'states',
  'content',
  'do-and-dont',
  'accessibility',
  'examples',
  'related',
  'changelog',
];
/** The sections each kind of page may have, and those it needs. */
export const sectionRules = {
  component: {
    allowed: templateSections.map((section) => section.id),
    required: ['overview', 'accessibility', 'examples'],
  },
  pattern: {
    allowed: compositionSections,
    required: ['overview', 'anatomy', 'content', 'accessibility', 'examples'],
  },
};
/** The `###` lists each kind's Accessibility section needs. */
const accessibilityHeadings = {
  component: ['envUI provides', 'You provide'],
  pattern: ['envUI provides', 'You provide'],
};
/** Live example files a pattern shows at least: its lead example and two more. */
export const patternExampleMinimum = 3;

/**
 * What an Accessibility section lacks: the `###` lists its kind needs, and a Key and Action table
 * under `### Keyboard`.
 */
function accessibilityProblems(tokens, kind) {
  const problems = [];
  const headings = tokens
    .filter((token) => token.type === 'heading' && token.depth === 3)
    .map((token) => token.text);
  for (const required of accessibilityHeadings[kind]) {
    const start = tokens.findIndex(
      (token) => token.type === 'heading' && token.depth === 3 && token.text === required,
    );
    const list = tokens
      .slice(start + 1)
      .find((token) => token.type === 'list' || token.type === 'heading');
    if (start === -1 || list?.type !== 'list' || !list.items.some((item) => item.text.trim()))
      problems.push(`"## Accessibility" needs a "### ${required}" list`);
  }
  if (headings.includes('Keyboard')) {
    const start = tokens.findIndex(
      (token) => token.type === 'heading' && token.text === 'Keyboard',
    );
    const table = tokens
      .slice(start + 1)
      .find((token) => token.type === 'table' || (token.type === 'heading' && token.depth <= 3));
    const header = table?.type === 'table' ? table.header.map((cell) => cell.text) : [];
    if (header[0] !== 'Key' || header[1] !== 'Action')
      problems.push('"### Keyboard" needs a table with "Key" and "Action" columns');
  }
  return problems;
}

/** Problems shared by both page forms: headings and props the template generates. */
function headingProblems(token) {
  const problems = [];
  if (token.type === 'heading' && token.depth === 1)
    problems.push('only the title is a level-one heading');
  if (token.type === 'html' && /<h[1-6][\s>]/i.test(token.raw))
    problems.push(`write headings in Markdown, not as HTML: ${token.raw.trim().split('\n')[0]}`);
  // "### Props" and "### Props & contracts", but not "### Props forwarding".
  if (
    token.type === 'heading' &&
    token.depth >= 3 &&
    /^props(?:$|\s*(?:&|and)\s)/i.test(token.text.trim())
  )
    problems.push(
      `"${'#'.repeat(token.depth)} ${token.text}" lists props by hand; the Props section is generated`,
    );
  return problems;
}

/**
 * A figure of a page on the figure template: ```tsx example=Name```, a do or don't figure
 * ```tsx do=Name caption="…"``` or ```tsx dont=Name caption="…"```, an anatomy figure
 * ```tsx anatomy=Name``` or a variants figure ```tsx variants=Name```, each with optional
 * attributes, written name="value", and flags, such as `open`, written as their name alone.
 */
const figurePattern =
  /^tsx\s+(example|do|dont|anatomy|variants)=(\S+)((?:\s+[a-z]+(?:=(?:"[^"]*"|[^\s"]+))?)*)\s*$/;
/**
 * Where a figure fence that doesn't parse has a double quote inside a value, such as
 * `caption="Label it "Save"."`: the attribute and the text from the stray quote on. A value can't
 * hold one, escaped or not, since Markdown unescapes `\"` in a fence's info string.
 */
export function strayQuote(info) {
  const head = info.match(/^tsx\s+(?:example|do|dont|anatomy|variants)=\S+/);
  if (!head) return undefined;
  const rest = info.slice(head[0].length).trimEnd();
  const attribute = /\s+([a-z]+)(?:=(?:"[^"]*"|[^\s"]+))?/y;
  let key;
  let index = 0;
  for (let match; (match = attribute.exec(rest)); index = attribute.lastIndex) key = match[1];
  const left = rest.slice(index);
  if (
    !key ||
    !left ||
    /^\s/.test(left) ||
    (!rest.slice(0, index).endsWith('"') && !left.startsWith('"'))
  )
    return undefined;
  const quote = left.startsWith('"') ? index : rest.lastIndexOf('"', index - 1);
  return { key, from: rest.slice(quote) };
}
/** The attributes each kind of figure takes, and those it needs. */
const figureAttributes = {
  example: { allowed: ['caption', 'widths', 'open', 'stage'], required: [] },
  do: { allowed: ['caption', 'open', 'stage'], required: ['caption'] },
  dont: { allowed: ['caption', 'open', 'stage'], required: ['caption'] },
  anatomy: { allowed: ['caption', 'of', 'open', 'stage', 'enlarge'], required: [] },
  variants: { allowed: ['caption', 'stage'], required: [] },
};
/**
 * The fills a figure's stage takes besides the default, the canvas recessed from what it sits on:
 * `stage="shaded"`, a canvas deeper than both the page's and the navigation's backgrounds, where
 * the subject is a whole window that shows both, such as a Scaffold.
 */
const stageFills = ['shaded'];
/**
 * The attributes that are flags, written without a value: `open` shows the example's overlays
 * open on its stage, contained, and `enlarge` shows an anatomy figure's subject half as large
 * again where its stage has room, so the callouts on its close-set parts don't crowd.
 */
const figureFlags = new Set(['open', 'enlarge']);
/** A file name as words: ConnectedButtons is "Connected buttons". */
const fileWords = (name) =>
  name
    .replace(/(?<=[a-z\d])(?=[A-Z])/g, ' ')
    .replace(/ [A-Z](?=[a-z])/g, (word) => word.toLowerCase());

const stylesDirectory = fileURLToPath(new URL('../packages/ui/src/styles/', import.meta.url));

/**
 * The part class names an anatomy legend may name: every `env-*` class of packages/ui's style
 * sheets and of docs/generated/parts.json, and that file's components by export name, each with
 * its parts, for a figure without a legend.
 */
export function readPartNames(directory = documentationDirectory) {
  const classes = new Set();
  if (existsSync(stylesDirectory))
    for (const name of readdirSync(stylesDirectory).filter((file) => file.endsWith('.css')))
      for (const [, found] of readFileSync(resolve(stylesDirectory, name), 'utf8').matchAll(
        /\.(env-[\w-]+)/g,
      ))
        classes.add(found);
  const file = resolve(directory, 'generated/parts.json');
  const json = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const components = {};
  for (const [group, entries] of [
    ['components', json.components],
    ['shared', json.shared],
  ])
    for (const [name, entry] of Object.entries(entries ?? {})) {
      const parts = [entry.root, ...(entry.parts ?? []).map((part) => part.class)].filter(Boolean);
      for (const part of parts) classes.add(part);
      if (group === 'components') components[name] = parts;
    }
  return { classes, components };
}

/**
 * Whether a component page is on the figure template: it has a "## When to use" section, which the
 * section template has not.
 */
export function usesFigures(tokens) {
  return tokens.some(
    (token) => token.type === 'heading' && token.depth === 2 && token.text === 'When to use',
  );
}

/**
 * The blocks of a component page on the figure template: per section, Markdown, live figures with
 * their legends, and specimens.
 */
function readFigures(document, body, { examples, specimens, partNames }) {
  const tokens = marked.lexer(body);
  if (tokens.map((token) => token.raw).join('') !== body)
    throw new Error(`Could not split ${document.path} into sections.`);
  const sections = [];
  const problems = [];
  let current;
  let subheading;
  /** The anatomy or variants figure an ordered list right after it is the legend of. */
  let legendOf;
  /** The `###` subsections of "## In code" so far, by their index in codeSubsections. */
  const codeOrder = [];
  for (const token of tokens) {
    problems.push(...headingProblems(token));
    if (current?.id === 'code' && !(token.type === 'heading' && token.depth === 2)) {
      // The developer-only part: `###` subsections of codeSubsections, in order, holding Markdown
      // and example files shown as code.
      current.tokens.push(token);
      if (token.type === 'heading' && token.depth === 3) {
        const index = codeSubsections.findIndex((item) => item.title === token.text);
        if (token.text === 'Import')
          problems.push('"### Import" of "## In code" is generated; remove it');
        else if (index === -1)
          problems.push(
            `"### ${token.text}" is not a subsection of "## In code" (${codeSubsections.map((item) => item.title).join(', ')}); use a "####" heading inside one`,
          );
        else if (codeOrder.includes(index)) problems.push(`"### ${token.text}" appears twice`);
        else if (codeOrder.some((other) => other > index))
          problems.push(
            `"### ${token.text}" must come before "### ${codeSubsections[Math.max(...codeOrder)].title}" in "## In code"`,
          );
        codeOrder.push(index);
      } else if (token.type !== 'space' && !codeOrder.length)
        problems.push('"## In code" starts with a "###" subsection, such as "### Usage"');
      if (token.type === 'code' && sourcePattern.test(token.lang ?? '')) {
        const name = token.lang.match(sourcePattern)[1];
        if (!examples.has(name))
          problems.push(
            `source ${name} has no file apps/catalogue/src/examples/${document.id}/${name}.tsx`,
          );
        if (token.text.trim())
          problems.push(`the fence of source ${name} must be empty; the build fills in its file`);
        current.blocks.push({ kind: 'source', name });
        continue;
      }
      if (token.type === 'code' && /^tsx\s+(?:example|do|dont|anatomy|variants)=/.test(token.lang))
        problems.push(
          `"## In code" shows code, not figures: show an example's source with \`tsx source=Name\`, not \`${token.lang}\``,
        );
      if (token.type === 'html' && specimenPattern.test(token.raw.trim()))
        problems.push('"## In code" shows code, not specimens');
      const last = current.blocks.at(-1);
      if (last?.kind === 'markdown') last.markdown += token.raw;
      else current.blocks.push({ kind: 'markdown', markdown: token.raw });
      continue;
    }
    if (token.type === 'heading' && token.depth === 2) {
      const section = figureSections.find((item) => item.title === token.text);
      if (!section) {
        problems.push(
          `"## ${token.text}" is not a section of a component page (${figureSections
            .filter((item) => !item.generated)
            .map((item) => item.title)
            .join(', ')})`,
        );
        continue;
      }
      if (section.generated) problems.push(`"## ${token.text}" is generated; remove it`);
      if (sections.some((item) => item.id === section.id))
        problems.push(`"## ${token.text}" appears twice`);
      const previous = sections.at(-1);
      if (
        previous &&
        figureSections.indexOf(section) <
          figureSections.findIndex((item) => item.id === previous.id)
      )
        problems.push(`"## ${token.text}" must come before "## ${previous.title}"`);
      current = { id: section.id, title: section.title, blocks: [], tokens: [] };
      sections.push(current);
      subheading = undefined;
      legendOf = undefined;
    }
    if (!current) {
      if (token.type !== 'space') problems.push('content must follow a "##" section heading');
      continue;
    }
    current.tokens.push(token);
    const blocks = current.blocks;
    const appendMarkdown = (raw) => {
      const last = blocks.at(-1);
      if (last?.kind === 'markdown') last.markdown += raw;
      else blocks.push({ kind: 'markdown', markdown: raw });
    };
    if (token.type === 'space') {
      appendMarkdown(token.raw);
      continue;
    }
    if (token.type === 'blockquote')
      problems.push(
        `${current.title} has a blockquote; write its text as a paragraph, or a rule as a do and don't pair`,
      );
    if (token.type === 'heading' && token.depth === 3) subheading = token.text;
    if (isPropsTable(token))
      problems.push(`${current.title} lists props in a table; the Props section is generated`);
    // An option table, whose last column is Use for, shows on the Site as a legend of tags.
    const options = optionTable(token);
    if (options)
      problems.push(
        ...optionTableProblems(options).map((problem) => `${current.title}: ${problem}`),
      );
    if (legendOf?.role === 'variants' && token.type === 'list' && token.ordered) {
      // A variants figure's legend: each variant's name in bold, labelling the example's items in
      // order, or the item a part reference names.
      legendOf.legend = token.items.map((item, index) => {
        const label = item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
        if (!label)
          problems.push(
            `item ${index + 1} of the legend of variants ${legendOf.name} must start with the variant's name in bold, such as **Outline**`,
          );
        const part = item.text.match(/`(env-[^`]+)`/)?.[1] ?? '';
        for (const name of part.match(/env-[\w-]+/g) ?? [])
          if (!partNames.classes.has(name))
            problems.push(
              `item ${index + 1} of the legend of variants ${legendOf.name} names ${name}, which neither packages/ui's CSS nor docs/generated/parts.json has`,
            );
        return { part, text: item.text.replace(/\s+/g, ' ').trim(), label: label ?? '' };
      });
      legendOf = undefined;
      continue;
    }
    if (legendOf && token.type === 'list' && token.ordered) {
      // The anatomy figure's legend: one numbered part per item, by its class name.
      legendOf.legend = token.items.map((item, index) => {
        const part = item.text.match(/`(env-[^`]+)`/)?.[1];
        if (!part)
          problems.push(
            `item ${index + 1} of the legend of anatomy ${legendOf.name} names no part, such as \`env-button\``,
          );
        // The Site shows the part's name alone; its class names and props are for developers.
        const name = item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
        if (!name)
          problems.push(
            `item ${index + 1} of the legend of anatomy ${legendOf.name} must start with the part's name in bold, such as **Label**, which is all the Site shows of it`,
          );
        // Every class it names is one envUI styles or lists as a part.
        for (const name of (part ?? '').replace(/::text$/, '').match(/env-[\w-]+/g) ?? [])
          if (!partNames.classes.has(name))
            problems.push(
              `item ${index + 1} of the legend of anatomy ${legendOf.name} names ${name}, which neither packages/ui's CSS nor docs/generated/parts.json has`,
            );
        return {
          part: part ?? '',
          text: item.text.replace(/\s+/g, ' ').trim(),
          ...(name && { name }),
        };
      });
      legendOf = undefined;
      continue;
    }
    legendOf = undefined;
    if (token.type === 'code' && sourcePattern.test(token.lang ?? ''))
      problems.push(
        `\`${token.lang}\` in "## ${current.title}": an example's source as code belongs in "## In code"`,
      );
    if (
      token.type === 'code' &&
      /^tsx\s+(?:example|do|dont|anatomy|variants)=/.test(token.lang ?? '')
    ) {
      const match = (token.lang ?? '').match(figurePattern);
      const quote = match ? undefined : strayQuote(token.lang);
      if (quote) {
        problems.push(
          `the ${quote.key} of the fence \`${token.lang}\` has a double quote inside it, at \`${quote.from}\`: a value can't hold ", escaped or not, so rephrase it or use ' or “ ”`,
        );
        continue;
      }
      if (!match) {
        problems.push(
          `the fence \`${token.lang}\` is malformed: write \`tsx example=Name\`, \`tsx do=Name caption="…"\`, \`tsx dont=Name caption="…"\`, \`tsx anatomy=Name\` or \`tsx variants=Name\`, with attributes as name="value" and flags, such as open, as their name alone`,
        );
        continue;
      }
      const [, role, name, rest] = match;
      const attributes = {};
      for (const [, key, value, quoted, plain] of rest.matchAll(
        /\s+([a-z]+)(=(?:"([^"]*)"|([^\s"]+)))?/g,
      )) {
        if (!figureAttributes[role].allowed.includes(key))
          problems.push(
            `${role} ${name} takes no ${key}${figureAttributes[role].allowed.length ? `; it takes ${figureAttributes[role].allowed.join(', ')}` : ''}`,
          );
        else if (figureFlags.has(key) && value)
          problems.push(`${role} ${name} has ${key}${value}; write the flag ${key} alone`);
        else if (!figureFlags.has(key) && !value)
          problems.push(`${role} ${name} has ${key} without a value; write ${key}="…"`);
        if (key in attributes) problems.push(`${role} ${name} repeats ${key}`);
        attributes[key] = value ? (quoted ?? plain).trim() : true;
      }
      for (const key of figureAttributes[role].required)
        if (!attributes[key]) problems.push(`${role} ${name} needs ${key}="…", one sentence`);
      if (current.id === 'changelog')
        problems.push(`${role} ${name} belongs in a section before the changelog`);
      if (!/^[A-Z][A-Za-z\d]*$/.test(name))
        problems.push(`${role} ${name} must be a PascalCase file name`);
      if (token.text.trim())
        problems.push(`the fence of ${role} ${name} must be empty; the build fills in its file`);
      if (!examples.has(name))
        problems.push(
          `${role} ${name} has no file apps/catalogue/src/examples/${document.id}/${name}.tsx`,
        );
      const caption = attributes.caption;
      const block = {
        kind: 'example',
        name,
        heading:
          role === 'do'
            ? `Do: ${caption}`
            : role === 'dont'
              ? `Don't: ${caption}`
              : role === 'anatomy'
                ? `${document.title} anatomy`
                : role === 'variants'
                  ? `${document.title} variants`
                  : // The Overview's first example shows the component itself, named after it.
                    current.id === 'overview' && !blocks.some((item) => item.kind === 'example')
                    ? document.title
                    : (subheading ?? fileWords(name)),
        ...(role !== 'example' && { role }),
        ...(caption && { caption }),
      };
      if (attributes.widths !== undefined) {
        const widths = attributes.widths
          .split(/[\s,]+/)
          .filter(Boolean)
          .map(Number);
        if (!widths.length || widths.some((width) => !(width >= 10 && width <= 120)))
          problems.push(
            `example ${name} has widths="${attributes.widths}"; give widths in rem, from 10 to 120`,
          );
        block.widths = widths;
      }
      if (attributes.of !== undefined) block.of = attributes.of;
      if (typeof attributes.stage === 'string') {
        if (stageFills.includes(attributes.stage)) block.stage = attributes.stage;
        else
          problems.push(
            `${role} ${name} has stage="${attributes.stage}"; a stage takes ${stageFills.map((fill) => `"${fill}"`).join(', ')}, or nothing for the stage in the page's color`,
          );
      }
      if (attributes.open === true) block.open = true;
      if (attributes.enlarge === true) block.enlarge = true;
      blocks.push(block);
      if (role === 'anatomy' || role === 'variants') legendOf = block;
      continue;
    }
    if (token.type === 'html' && specimenPattern.test(token.raw.trim())) {
      const name = token.raw.trim().match(specimenPattern)[1];
      if (!specimens.has(name))
        problems.push(
          `specimen ${name} has no file apps/catalogue/src/specimens/${document.id}/${name}.tsx`,
        );
      blocks.push({ kind: 'specimen', name });
      continue;
    }
    appendMarkdown(token.raw);
  }
  // An anatomy figure without a legend numbers the parts parts.json lists for its component; a
  // variants figure needs one, the names of its variants.
  for (const section of sections)
    for (const block of section.blocks)
      if (block.role === 'variants' && !block.legend)
        problems.push(
          `variants ${block.name} has no legend: follow it with a numbered list of its variants' names in bold, such as 1. **Outline**`,
        );
      else if (block.role === 'anatomy' && !block.legend) {
        const component = block.of ?? document.title;
        if (!partNames.components[component]?.length)
          problems.push(
            `anatomy ${block.name} has no legend, and docs/generated/parts.json lists no parts of ${component}${block.of ? '' : '; write a legend or name the component with of="Name"'}`,
          );
      }
  for (const section of figureSections)
    if (section.required && !sections.some((item) => item.id === section.id))
      problems.push(`"## ${section.title}" is required`);
  if (sections.some((item) => item.id === 'code'))
    for (const [index, item] of codeSubsections.entries())
      if (item.required && !codeOrder.includes(index))
        problems.push(`"## In code" needs a "### ${item.title}" subsection: ${item.holds}`);
  const overview = sections.find((item) => item.id === 'overview');
  if (overview && !overview.blocks.some((block) => block.kind === 'example'))
    problems.push(
      '"## Overview" shows what the component looks like: at least one ```tsx example=Name```',
    );
  const accessibility = sections.find((item) => item.id === 'accessibility');
  if (accessibility) problems.push(...accessibilityProblems(accessibility.tokens, 'component'));
  if (problems.length)
    throw new Error(
      `${document.path} does not follow the figure template:\n  - ${problems.join('\n  - ')}`,
    );
  return sections.map(({ id, title, blocks }) => ({ id, title, blocks }));
}

/**
 * The blocks of the sections of a page on the template: Markdown, example files and catalogue
 * specimens.
 */
function readTemplate(document, body, { examples, specimens, kind = 'component' }) {
  const tokens = marked.lexer(body);
  if (tokens.map((token) => token.raw).join('') !== body)
    throw new Error(`Could not split ${document.path} into sections.`);
  const rules = sectionRules[kind];
  const allowed = templateSections.filter((section) => rules.allowed.includes(section.id));
  const sections = [];
  let current;
  const problems = [];
  let subheading;
  for (const token of tokens) {
    problems.push(...headingProblems(token));
    if (token.type === 'heading' && token.depth === 2) {
      const section = allowed.find((item) => item.title === token.text);
      if (!section) {
        problems.push(
          `"## ${token.text}" is not a template section${kind === 'component' ? '' : ` of a ${kind} page`} (${allowed.map((item) => item.title).join(', ')})${
            kind === 'component' && figureSections.some((item) => item.title === token.text)
              ? '; a page on the figure template has a "## When to use" section'
              : ''
          }`,
        );
        continue;
      }
      if (section.generated) problems.push(`"## ${token.text}" is generated; remove it`);
      if (sections.some((item) => item.id === section.id))
        problems.push(`"## ${token.text}" appears twice`);
      const previous = sections.at(-1);
      if (
        previous &&
        templateSections.indexOf(section) <
          templateSections.findIndex((item) => item.id === previous.id)
      )
        problems.push(`"## ${token.text}" must come before "## ${previous.title}"`);
      current = { id: section.id, title: section.title, blocks: [], tokens: [] };
      sections.push(current);
      subheading = undefined;
    }
    if (!current) {
      if (token.type !== 'space') problems.push('content must follow a "##" section heading');
      continue;
    }
    current.tokens.push(token);
    if (token.type === 'heading' && token.depth === 3) subheading = token.text;
    if (isPropsTable(token))
      problems.push(`${current.title} lists props in a table; the Props section is generated`);
    const blocks = current.blocks;
    const appendMarkdown = (raw) => {
      const last = blocks.at(-1);
      if (last?.kind === 'markdown') last.markdown += raw;
      else blocks.push({ kind: 'markdown', markdown: raw });
    };
    if (token.type === 'code') {
      const example = (token.lang ?? '').match(examplePattern);
      // A fence that names a file but doesn't parse would otherwise show as plain code.
      if (!example && /^tsx\s+(?:example|template)=/.test(token.lang ?? '')) {
        problems.push(`the fence \`${token.lang}\` is malformed: write \`tsx example=Name\``);
        continue;
      }
      if (example) {
        const what = 'example';
        const name = example[1] ?? example[2];
        // The overview shows one example first, without a heading; the rest are under Examples.
        const hero = current.id === 'overview';
        if (hero && blocks.some((block) => block.kind === 'example'))
          problems.push('"## Overview" shows at most one example');
        if (!hero && current.id !== 'examples')
          problems.push(`${what} ${name} must be in "## Examples" or "## Overview"`);
        if (!/^[A-Z][A-Za-z\d]*$/.test(name))
          problems.push(`${what} ${name} must be a PascalCase file name`);
        if (token.text.trim())
          problems.push(`the fence of ${what} ${name} must be empty; the build fills in its file`);
        if (!hero && !subheading) problems.push(`${what} ${name} needs a "###" heading`);
        if (!examples.has(name))
          problems.push(
            `${what} ${name} has no file apps/catalogue/src/examples/${document.id}/${name}.tsx`,
          );
        const heading = hero ? document.title : (subheading ?? name);
        blocks.push({ kind: 'example', name, heading });
        continue;
      }
      if (current.id === 'examples')
        problems.push('code in "## Examples" must be an example file: ```tsx example=Name```');
    }
    if (token.type === 'html' && specimenPattern.test(token.raw.trim())) {
      const name = token.raw.trim().match(specimenPattern)[1];
      if (!specimens.has(name))
        problems.push(
          `specimen ${name} has no file apps/catalogue/src/specimens/${document.id}/${name}.tsx`,
        );
      blocks.push({ kind: 'specimen', name });
      continue;
    }
    appendMarkdown(token.raw);
  }
  for (const section of allowed)
    if (rules.required.includes(section.id) && !sections.some((item) => item.id === section.id))
      problems.push(`"## ${section.title}" is required`);
  const shown = (section, ...kinds) =>
    (section?.blocks ?? []).filter((block) => kinds.includes(block.kind));
  const overview = sections.find((item) => item.id === 'overview');
  const examplesSection = sections.find((item) => item.id === 'examples');
  if (examplesSection) {
    const headings = examplesSection.tokens.filter(
      (token) => token.type === 'heading' && token.depth === 3,
    );
    const names = shown(examplesSection, 'example');
    if (!names.length) problems.push('"## Examples" needs at least one example file');
    for (const heading of headings) {
      const count = names.filter((block) => block.heading === heading.text).length;
      if (count !== 1) problems.push(`"### ${heading.text}" must introduce exactly one example`);
    }
  }
  if (kind === 'pattern') {
    if (overview && !shown(overview, 'example').length)
      problems.push('"## Overview" shows the lead example, a ```tsx example=Name``` fence');
    const count = shown(overview, 'example').length + shown(examplesSection, 'example').length;
    if (count < patternExampleMinimum)
      problems.push(
        `a pattern shows at least ${patternExampleMinimum} example files, its lead example and two under "## Examples"; it has ${count}`,
      );
  }
  const accessibility = sections.find((item) => item.id === 'accessibility');
  if (accessibility) problems.push(...accessibilityProblems(accessibility.tokens, kind));
  const doAndDont = sections.find((item) => item.id === 'do-and-dont');
  if (doAndDont) {
    const headings = doAndDont.tokens
      .filter((token) => token.type === 'heading' && token.depth === 3)
      .map((token) => token.text);
    if (!headings.includes('Do') || !headings.includes("Don't"))
      problems.push(`"## Do and don't" needs "### Do" and "### Don't" lists`);
  }
  if (problems.length)
    throw new Error(
      `${document.path} does not follow the page template:\n  - ${problems.join('\n  - ')}`,
    );
  return sections.map(({ id, title, blocks }) => ({ id, title, blocks }));
}

/** File names, without .tsx, in a page's example or specimen folder. */
function filesOf(directory, page) {
  const folder = resolve(directory, page);
  if (!existsSync(folder)) return new Set();
  return new Set(
    readdirSync(folder)
      .filter((name) => name.endsWith('.tsx'))
      .map((name) => name.slice(0, -'.tsx'.length)),
  );
}

/**
 * The indexed documents. The index supplies discovery, catalogue groups and ordering; component
 * pages supply their title, summary and metadata in frontmatter.
 */
export function readDocumentation(
  directory = documentationDirectory,
  {
    props = readProps(directory),
    examples = examplesDirectory,
    specimens = specimensDirectory,
    versions = directory === documentationDirectory ? libraryVersions() : undefined,
    partNames = readPartNames(directory),
  } = {},
) {
  // Pages saved with CRLF line endings read as LF, as Git checks them out.
  const read = (file) => readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  const index = read(resolve(directory, 'index.md'));
  const documents = [
    {
      id: 'index',
      title: 'envUI documentation',
      group: 'Setup and workflows',
      path: 'index.md',
      summary: '',
      related: [],
      markdown: index.replace(/^# [^\n]+\r?\n\s*/, ''),
    },
  ];
  const exported = props?.exports;
  let group;
  for (const token of marked.lexer(index)) {
    if (token.type === 'heading' && token.depth === 2) group = token.text;
    if (token.type !== 'list') continue;
    if (!group) throw new Error('Documentation entries need a level-two family heading.');
    for (const item of token.items) {
      const entry = item.text.match(/^\[([^\]]+)\]\(([^)]+\.md)\)(?: — ([\s\S]+))?$/);
      if (!entry) throw new Error(`Invalid documentation index entry: ${item.text}`);
      const [, title, path, indexSummary] = entry;
      const file = resolve(directory, path);
      if (!contained(directory, file))
        throw new Error(`Documentation entry escapes docs/: ${path}`);
      if (documents.some((document) => document.path === path))
        throw new Error(`Duplicate documentation entry: ${path}`);
      const id = basename(path, '.md');
      if (documents.some((document) => document.id === id))
        throw new Error(`Two documentation pages share the name ${id}: ${path}`);
      const source = read(file);
      const { frontmatter, yaml, body } = splitFrontmatter(source, path);
      if (!body.startsWith(`# ${title}\n`) && !body.startsWith(`# ${title}\r\n`))
        throw new Error(`Documentation title differs from its index entry: ${path}`);
      const markdown = body.replace(/^# [^\n]+\r?\n\s*/, '');
      const kind = pageKindOf(path);
      // A page's folder says its kind, and the index lists each kind of page under its section.
      const sectionKind = indexSectionKinds[group];
      const kindSection = Object.keys(indexSectionKinds).find(
        (section) => indexSectionKinds[section] === kind,
      );
      if (sectionKind ? sectionKind !== kind : kindSection)
        throw new Error(
          `${path} is a ${kind} page, from ${kindFolders[kind]}, but the index lists it under "## ${group}"; ${
            kindSection
              ? `list it under "## ${kindSection}"`
              : `move it to ${kindFolders[sectionKind]}`
          }.`,
        );
      const component = kind === 'component';
      // Pattern pages are always on the template; a component page once it starts with its
      // Overview.
      const composition = kind === 'pattern';
      const tokens = marked.lexer(markdown);
      const firstSection = tokens.find((t) => t.type === 'heading' && t.depth === 2);
      const template = composition || (component && firstSection?.text === 'Overview');
      // A page that uses the template's parts is on the template, whatever its first section.
      // They are read from the tokens, as the page renders: a fence indented by a few spaces is a
      // fence, and one shown inside another fence is text.
      let usesTemplate = false;
      marked.walkTokens(tokens, (token) => {
        if (
          (token.type === 'heading' && token.depth === 2 && token.text === 'Overview') ||
          (token.type === 'code' && examplePattern.test(token.lang ?? '')) ||
          (token.type === 'html' && /^<!--\s*specimen:/.test(token.raw.trim()))
        )
          usesTemplate = true;
      });
      const templateParts =
        usesTemplate || (frontmatter && ('useWhen' in frontmatter || 'avoidWhen' in frontmatter));
      if (
        (component && !template && templateParts) ||
        (composition && firstSection?.text !== 'Overview')
      )
        throw new Error(
          `${path} ${composition ? `is a ${kind} page, on` : 'uses'} the page template, so its first section must be "## Overview", not ${
            firstSection ? `"## ${firstSection.text}"` : 'missing'
          }.`,
        );
      if (sectionedKinds.has(kind) && !frontmatter)
        throw new Error(`${kind[0].toUpperCase()}${kind.slice(1)} page ${path} needs frontmatter.`);
      if (frontmatter) validateFrontmatter(frontmatter, path, { kind, template, versions });
      if (sectionedKinds.has(kind)) {
        if (frontmatter.title !== title)
          throw new Error(`Frontmatter title of ${path} differs from its index entry.`);
        if (component && frontmatter.category !== group)
          throw new Error(
            `Category of ${path} is ${frontmatter.category}, but the index lists it under ${group}.`,
          );
        if (indexSummary)
          throw new Error(
            `The index entry of ${path} repeats a summary; it lives in the page's frontmatter.`,
          );
        if (component && kebab(title) !== id && !slugExceptions.has(id))
          throw new Error(`${path} must be named ${kebab(title)}.md after its title.`);
        if (component && !frontmatter.components.includes(title.split('.')[0]) && exported?.[title])
          throw new Error(`${path} must list ${title}, its own component, in components.`);
      } else if (!indexSummary) throw new Error(`Invalid documentation index entry: ${item.text}`);
      for (const name of frontmatter?.components ?? [])
        if (exported && !exported[name])
          throw new Error(`${path} lists ${name} in components, but envUI exports no ${name}.`);
      for (const name of frontmatter?.composes ?? [])
        if (exported && !exported[name])
          throw new Error(`${path} lists ${name} in composes, but envUI exports no ${name}.`);
      for (const { use } of frontmatter?.avoidWhen ?? [])
        if (use && exported && !exported[use])
          throw new Error(`${path} suggests ${use} in avoidWhen, but envUI exports no ${use}.`);
      const document = {
        id,
        title,
        group,
        path,
        summary: (frontmatter?.summary ?? indexSummary).replace(/\s+/g, ' ').trim(),
        related: [],
        markdown,
        ...(frontmatter && { frontmatter, yaml }),
      };
      // Component and pattern pages may be on the figure template.
      if (template && (component || kind === 'pattern') && usesFigures(tokens)) {
        document.format = 'figures';
        document.sections = withImport(
          readFigures(document, markdown, {
            examples: filesOf(examples, id),
            specimens: filesOf(specimens, id),
            partNames,
          }),
          frontmatter.components ?? frontmatter.composes ?? [],
          props,
        );
      } else if (template)
        document.sections = readTemplate(document, markdown, {
          examples: filesOf(examples, id),
          specimens: filesOf(specimens, id),
          kind,
        });
      documents.push(document);
    }
  }
  for (const document of documents) {
    // A page's avoidWhen is its one list of related components and pages, its Related section:
    // each entry names an export to use or a page to read, and each relation is named once.
    const relations = [];
    for (const { use, see } of document.frontmatter?.avoidWhen ?? []) {
      if (see && (see === document.id || !documents.some((entry) => entry.id === see)))
        throw new Error(
          `${document.path} sends readers to ${see} in avoidWhen, which is ${see === document.id ? 'the page itself' : 'not an indexed page'}.`,
        );
      const key = use ?? `page:${see}`;
      if (relations.some((relation) => relation.key === key))
        throw new Error(
          `${document.path} names ${use ?? see} twice in avoidWhen; say each relation once, in one entry.`,
        );
      relations.push({ key, page: use ? pageOfExport(documents, use)?.id : see });
    }
    for (const { key, page } of relations)
      if (
        key.startsWith('page:') &&
        relations.some((other) => !other.key.startsWith('page:') && other.page === page)
      )
        throw new Error(
          `${document.path} sends readers to ${page} in avoidWhen and also names an export it documents; name the relation once.`,
        );

    let related = false;
    const listed = [];
    for (const token of marked.lexer(document.markdown)) {
      if (token.type === 'heading' && token.depth === 2) related = token.text === 'Related topics';
      if (related && token.type === 'list') {
        marked.walkTokens([token], (link) => {
          if (link.type === 'link') listed.push(basename(link.href, '.md'));
        });
      }
    }
    if (document.sections && listed.length)
      throw new Error(
        `${document.path} lists related topics in its body; they live in frontmatter.`,
      );
    // A component or pattern page relates to the pages its avoidWhen names; another page to those
    // its Related topics list links.
    document.related = sectionedKinds.has(pageKindOf(document.path))
      ? [...new Set(relations.flatMap(({ page }) => (page && page !== document.id ? [page] : [])))]
      : listed;
    if (document.related.includes(document.id))
      throw new Error(`${document.path} lists itself in related.`);
    for (const id of document.related)
      if (!documents.some((entry) => entry.id === id))
        throw new Error(`${document.path} relates to ${id}, which is not an indexed page.`);
    marked.walkTokens(marked.lexer(document.markdown), (token) => {
      if (token.type !== 'link' || /^[a-z][a-z\d+.-]*:/i.test(token.href)) return;
      const [path, fragment] = token.href.split('#');
      let linked = document;
      if (path) {
        const target = resolve(directory, dirname(document.path), path);
        if (!contained(directory, target) || !existsSync(target))
          throw new Error(`Broken documentation link in ${document.path}: ${token.href}`);
        linked = documents.find(
          (entry) => entry.path === relative(directory, target).replaceAll('\\', '/'),
        );
        if (!linked) throw new Error(`Documentation link is missing from the index: ${token.href}`);
      }
      // A link to a heading names one the page has, by the id the catalogue gives it.
      if (fragment && !headingsOf(linked.markdown).some(({ id }) => id === decoded(fragment)))
        throw new Error(
          `Broken documentation link in ${document.path}: ${token.href} names no heading of ${linked.path}.`,
        );
    });
  }
  return documents;
}

/** A link's fragment with its percent escapes decoded, or as it is where they are malformed. */
function decoded(fragment) {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

/** Every runtime export a page documents, with namespaces expanded to their parts. */
export function documentedExports(names, props) {
  return names.flatMap((name) => {
    const entry = props?.exports[name];
    if (!entry) return [];
    return entry.kind === 'namespace' ? [name, ...entry.parts] : [name];
  });
}

const cell = (text) => String(text).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const codeCell = (text) => `\`${cell(text)}\``;

function nativeSentence(elements) {
  if (!elements.length) return '';
  const tags = elements.map((element) =>
    element === 'element' ? 'HTML element' : `\`<${element}>\``,
  );
  const list = tags.length === 1 ? tags[0] : `${tags.slice(0, -1).join(', ')} or ${tags.at(-1)}`;
  return `Also accepts the native props of ${list}, such as \`ref\`, \`className\` and \`aria-*\` attributes.`;
}

/** The description of a prop as its table shows it, with when it is required or deprecated. */
export function propDescription(prop) {
  return [
    prop.deprecated ? `Deprecated${prop.deprecated === true ? '' : `: ${prop.deprecated}`}.` : '',
    prop.requiredWhen
      ? prop.requiredWhen === 'in some forms'
        ? 'Required in some forms.'
        : `Required when ${prop.requiredWhen}.`
      : '',
    prop.source === 'base-ui' ? 'Passed to Base UI.' : '',
    prop.description,
  ]
    .filter(Boolean)
    .join(' ');
}

/** The generated Props section of a page, as Markdown. */
export function renderProps(names, props, headingDepth = 2) {
  const heading = '#'.repeat(headingDepth);
  const lines = [`${heading} Props`, ''];
  for (const name of documentedExports(names, props)) {
    const entry = props.exports[name];
    if (entry.kind === 'namespace') continue;
    lines.push(`${heading}# ${name}`, '');
    if (entry.description) lines.push(entry.description, '');
    if (entry.kind === 'function') {
      lines.push('```ts', `${name}${entry.signature}`, '```', '');
      continue;
    }
    const native = nativeSentence(entry.native);
    if (!entry.props.length) {
      lines.push(native ? `No props of its own. ${native}` : 'Takes no props.', '');
      continue;
    }
    lines.push('| Prop | Type | Default | Description |', '| --- | --- | --- | --- |');
    for (const prop of entry.props)
      lines.push(
        `| ${codeCell(prop.name)}${prop.required ? ' (required)' : ''} | ${codeCell(prop.type)} | ${
          prop.default !== undefined
            ? codeCell(prop.default)
            : prop.defaultBuiltIn
              ? 'built-in'
              : '—'
        } | ${cell(propDescription(prop))} |`,
      );
    lines.push('');
    if (native) lines.push(native, '');
  }
  return lines.join('\n');
}

/** The component or pattern page that documents an export; a part such as Menu.Item is on its
 * namespace's. */
function pageOfExport(documents, name) {
  return documents.find(
    (entry) =>
      sectionedKinds.has(pageKindOf(entry.path)) &&
      entry.frontmatter?.components?.includes(name.split('.')[0]),
  );
}

/**
 * The generated Related section: on a component or pattern page, each entry of its avoidWhen, the
 * export or page with when to choose it; on another page, each related page with its summary.
 */
function renderRelated(document, documents) {
  const lines = ['## Related', ''];
  const link = (target) => {
    const href = posix.relative(posix.dirname(document.path), target.path);
    return href.startsWith('.') ? href : `./${href}`;
  };
  const entries = document.frontmatter?.avoidWhen;
  if (entries?.length)
    for (const { text, use, see } of entries) {
      const target = use
        ? pageOfExport(documents, use)
        : documents.find((entry) => entry.id === see);
      const name = use ?? target.title;
      lines.push(`- ${target ? `[${name}](${link(target)})` : `\`${name}\``}: ${text}`);
    }
  else
    for (const id of document.related) {
      const target = documents.find((entry) => entry.id === id);
      lines.push(`- [${target.title}](${link(target)}) — ${target.summary}`);
    }
  return `${lines.join('\n')}\n`;
}

/** An example's source as the package and agents read it. */
export function exampleSource(page, name, directory = examplesDirectory) {
  return readFileSync(resolve(directory, page, `${name}.tsx`), 'utf8');
}

/**
 * The Markdown of a page as it ships: frontmatter, examples filled in from their files, specimens
 * (catalogue-only) left out, and the generated Props and Related sections in their place.
 */
export function compileDocument(document, documents, { props, examples = examplesDirectory } = {}) {
  const head = document.frontmatter ? `---\n${document.yaml}\n---\n\n` : '';
  const title = `# ${document.title}\n\n`;
  if (document.id === 'index') {
    const markdown = document.markdown.replace(
      /^- \[([^\]]+)\]\(([^)]+\.md)\)$/gm,
      (line, text, path) => {
        const target = documents.find((entry) => entry.path === path);
        return target?.frontmatter ? `${line} — ${target.summary}` : line;
      },
    );
    return `${title}${markdown}`;
  }
  const propsSection =
    props && document.frontmatter?.components
      ? renderProps(document.frontmatter.components, props)
      : '';
  // A page not yet on the template ships as it is written. Its own "Props & contracts" table says
  // what each prop is for; the generated tables, without the descriptions its TSDoc does not have
  // yet, would only repeat it. Their types and defaults ship in generated/props.json, and the
  // page gets them in place of its table when it moves to the template.
  if (!document.sections) return `${head}${title}${document.markdown}`;
  const parts = [];
  const write = (section) => {
    let text = '';
    for (const block of section.blocks) {
      if (block.kind === 'markdown') text += block.markdown;
      else if (block.kind === 'source') {
        // An example file shown as code in "## In code", its source filled in.
        const source = exampleSource(document.id, block.name, examples).replace(/\n*$/, '\n');
        const fence = fenceFor(source);
        text += `${fence}tsx source=${block.name}\n${source}${fence}\n`;
      } else if (block.kind === 'example') {
        // The fence outlasts any backticks in the source, and closes on a line of its own.
        const source = exampleSource(document.id, block.name, examples).replace(/\n*$/, '\n');
        const fence = fenceFor(source);
        // A figure of a page on the figure template keeps its kind and attributes.
        const info = [
          `${block.role ?? 'example'}=${block.name}`,
          block.of && `of=${block.of}`,
          block.open && 'open',
          block.enlarge && 'enlarge',
          block.stage && `stage=${block.stage}`,
          block.widths && `widths="${block.widths.join(' ')}"`,
          block.caption && `caption="${block.caption}"`,
        ]
          .filter(Boolean)
          .join(' ');
        text += `${fence}tsx ${info}\n${source}${fence}\n`;
        if (block.legend)
          text += `\n${block.legend.map((item, index) => `${index + 1}. ${item.text}`).join('\n')}\n\n`;
      }
    }
    return text.replace(/\n{3,}/g, '\n\n').replace(/\s*$/, '\n');
  };
  for (const section of document.format === 'figures' ? figureSections : templateSections) {
    if (section.id === 'props') {
      if (propsSection) parts.push(propsSection);
      continue;
    }
    if (section.id === 'related') {
      if (document.related.length || document.frontmatter?.avoidWhen?.length)
        parts.push(renderRelated(document, documents));
      continue;
    }
    const authored = document.sections.find((item) => item.id === section.id);
    if (authored) parts.push(write(authored));
  }
  return `${head}${title}${parts.join('\n')}`.replace(/\n*$/, '\n');
}

/**
 * Every packaged documentation file: compiled pages, the index and the example sources, without the
 * contributor pages.
 */
export function compileDocumentation(
  directory = documentationDirectory,
  { props = readProps(directory), examples = examplesDirectory } = {},
) {
  const documents = readDocumentation(directory, { props, examples });
  const files = new Map();
  for (const document of documents)
    if (!contributorPages.has(document.path))
      files.set(
        document.path,
        linkContributorPages(
          compileDocument(document, documents, { props, examples }),
          document.path,
        ),
      );
  for (const document of documents)
    for (const section of document.sections ?? [])
      for (const block of section.blocks)
        if (block.kind === 'example')
          files.set(
            `examples/${document.id}/${block.name}.tsx`,
            exampleSource(document.id, block.name, examples),
          );
  return files;
}

/**
 * Writes the package's docs/: compiled pages and examples, and every other file as it is but the
 * contributor pages.
 */
export function packageDocumentation(outputDirectory) {
  rmSync(outputDirectory, { recursive: true, force: true });
  cpSync(documentationDirectory, outputDirectory, { recursive: true });
  for (const path of contributorPages) rmSync(resolve(outputDirectory, path), { force: true });
  for (const [path, contents] of compileDocumentation()) {
    const file = resolve(outputDirectory, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, contents);
  }
}

export function generateDocumentation() {
  const props = readProps();
  const documents = readDocumentation(documentationDirectory, { props });
  const entries = documents.map((document) => {
    const { yaml: _yaml, frontmatter, sections, ...entry } = document;
    const kind = pageKindOf(document.path);
    if (!frontmatter || !sectionedKinds.has(kind)) return entry;
    const metadata = {
      status: frontmatter.status,
      since: frontmatter.since,
      aliases: frontmatter.aliases ?? [],
      useWhen: frontmatter.useWhen ?? [],
      avoidWhen: frontmatter.avoidWhen ?? [],
      components: frontmatter.components ?? [],
      ...(frontmatter.statuses && { statuses: frontmatter.statuses }),
      ...(frontmatter.intent && { intent: frontmatter.intent }),
      ...(frontmatter.composes && { composes: frontmatter.composes }),
    };
    if (!sections) return { ...entry, metadata };
    // The ids of the headings in each section, numbered across the page, so the catalogue opens a
    // link to a heading in the view that shows it.
    const slug = headingSlugger();
    return {
      ...entry,
      metadata,
      sections: sections.map((section) => ({
        ...section,
        anchors: section.blocks.flatMap((block) =>
          block.kind === 'markdown' ? headingsOf(block.markdown, slug).map(({ id }) => id) : [],
        ),
      })),
      // Pattern and template pages document no exports of their own; they link to what they compose.
      ...(kind === 'component' && {
        props: Object.fromEntries(
          documentedExports(frontmatter.components, props).map((name) => [
            name,
            props.exports[name],
          ]),
        ),
      }),
    };
  });
  const source = `// Generated from docs/index.md, its pages and docs/generated/props.json; edit the sources.\nimport type { DocumentationEntry } from '../DocumentationTypes';\n\nexport const documents: DocumentationEntry[] = ${JSON.stringify(entries, null, 2)};\n`;
  mkdirSync(dirname(generatedFile), { recursive: true });
  if (!existsSync(generatedFile) || readFileSync(generatedFile, 'utf8') !== source)
    writeFileSync(generatedFile, source);
  // The catalogue's search index, of the same pages, props and the token list.
  writeSearchIndex({ documents, props });
  return documents;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // --check reads and validates the documentation, its links and headings, and writes nothing.
  if (process.argv.includes('--check'))
    console.log(
      `The ${readDocumentation().length} indexed Markdown documents and their links hold.`,
    );
  else
    console.log(
      `Prepared ${generateDocumentation().length} indexed Markdown documents for the catalogue.`,
    );
}
