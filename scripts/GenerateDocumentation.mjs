// Reads the documentation in docs/: the index, which groups and orders the pages, and each page with
// its frontmatter. It validates them, generates the catalogue's data
// (apps/catalogue/src/generated/Documentation.ts) and compiles the Markdown that ships in the
// package, where example files and generated props tables are filled in.
//
// Component, pattern and foundation pages (docs/components, docs/patterns and docs/foundations)
// are in the one-file structure: YAML frontmatter (see pageSchemas) that lists each example once,
// with its role and caption, then the `##` sections of pageSections, in their order. An example is
// a file in apps/catalogue/src/examples/<page>/<Name>.tsx, or on a foundation one of the
// catalogue's figures, placed by an empty fence ```tsx figure=Name```; the Overview, Props and
// Related are generated, Related from its avoidWhen. The build fails on a page of these kinds that
// is not in the structure. docs/component-pages.md and docs/pattern-pages.md describe it for
// authors.
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
 * Pages the package leaves out, whose links in its pages lead to the copies on main instead, and
 * which the packaged index doesn't list: the contributor pages, for people who work on envUI
 * itself, which neither the catalogue nor the Docs show
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
  'Actions',
  'Forms & selection',
  'Navigation',
  'Data display',
  'Text & content',
  'Feedback',
  'Overlays',
  'App frame & layout',
];
export const statuses = ['experimental', 'beta', 'stable', 'deprecated'];
/**
 * The status of an export a guide or foundations page documents, such as EnvUIProvider or
 * useContainerSize, unless the page's `statuses` gives it another.
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
const pageKinds = new Set(['component', 'pattern', 'foundation']);
/** The kinds of page that document exports, which a page relates to by an export's name. */
const exportKinds = new Set(['component', 'pattern']);
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
 * The sections of a page in the one-file structure, the same for a component, a pattern and a
 * foundation, in the order the catalogue shows them and an agent reads them: what it is and its
 * examples in the frontmatter, then its variants or options, its parts, how it behaves, ending with
 * how it adapts to width, its rules, which open with when to use it, its accessibility, the words
 * people use, and how to compose it in code. Overview is generated from the frontmatter's overview
 * examples, Props from the TypeScript declarations of the page's exports and Related from its
 * avoidWhen. A foundation calls its variants Options. docs/component-pages.md describes it.
 */
export const pageSections = [
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
export const exampleRoles = ['overview', 'example', 'variants', 'anatomy', 'do', 'dont'];

/**
 * A page's examples as its frontmatter lists them, by name: a role alone, such as
 * `CreateProject: overview`, or a role and a caption. An overview example, which no fence places,
 * takes here the framing a fence gives a figure: `open: true` shows its overlays open on its stage,
 * and `stage: shaded` the deeper stage of a whole window.
 */
export function examplesOf(frontmatter) {
  return Object.fromEntries(
    Object.entries(frontmatter?.examples ?? {}).map(([name, value]) => [
      name,
      typeof value === 'string'
        ? { role: value }
        : {
            role: value?.role,
            caption: value?.caption,
            ...(value?.open !== undefined && { open: value.open }),
            ...(value?.stage !== undefined && { stage: value.stage }),
          },
    ]),
  );
}

/** The fields of an example's entry in the frontmatter; open and stage are an overview's alone. */
const exampleFields = ['role', 'caption', 'open', 'stage'];

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
const sourcePattern = /^tsx\s+source=(\S+)\s*$/;

/**
 * The generated start of "## Compose": how to import what the page documents or, on a pattern
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
 * The page's sections with "## Compose" opening on the generated Import, and the section added,
 * after the plain sections, where the page writes none.
 */
function withImport(sections, names, props, title = 'Compose') {
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
export const frontmatterSchema = {
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
  examples: { type: 'examples', required: true },
};
/**
 * Frontmatter of a foundation page: what it is, the words people search for, its related pages and
 * its figures, which are the catalogue's (previews/foundations), each once with its role and
 * caption.
 */
const foundationFrontmatter = {
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
export const pageSchemas = {
  component: frontmatterSchema,
  pattern: {
    ...compositionFrontmatter,
    intent: { type: 'string', required: true, values: intents },
  },
  foundation: foundationFrontmatter,
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

function validateFrontmatter(frontmatter, path, { kind, versions }) {
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
    } else if (rule.type === 'examples') {
      if (!value || typeof value !== 'object' || Array.isArray(value))
        problems.push(
          `${key} must map each example's name to its role, or to its role and caption`,
        );
      else
        for (const [name, entry] of Object.entries(value)) {
          const { role, caption, open, stage } =
            typeof entry === 'string' ? { role: entry } : (entry ?? {});
          if (!/^[A-Z][A-Za-z\d]*$/.test(name))
            problems.push(`${key} names ${name}; name an example by its PascalCase file name`);
          if (!exampleRoles.includes(role))
            problems.push(
              `${key} gives ${name} the role ${role}; one of ${exampleRoles.join(', ')}`,
            );
          if (
            entry &&
            typeof entry === 'object' &&
            Object.keys(entry).some((field) => !exampleFields.includes(field))
          )
            problems.push(`${key} gives ${name} a field other than ${exampleFields.join(', ')}`);
          // An overview is framed here, since no fence places it; other figures on their fence.
          if ((open !== undefined || stage !== undefined) && role !== 'overview')
            problems.push(
              `${key} gives ${name} open or stage, which only an overview example takes here; write them on its fence`,
            );
          if (open !== undefined && open !== true)
            problems.push(`${key} gives ${name} open: ${open}; write open: true, or leave it out`);
          if (stage !== undefined && !stageFills.includes(stage))
            problems.push(
              `${key} gives ${name} stage: ${stage}; a stage takes ${stageFills.join(', ')}, or nothing for the stage in the page's color`,
            );
          if (caption !== undefined && (typeof caption !== 'string' || !caption.trim()))
            problems.push(`${key} gives ${name} an empty caption`);
          if ((role === 'do' || role === 'dont') && !caption)
            problems.push(`${key} gives the ${role} figure ${name} no caption, its rule`);
        }
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
      if (rule.required && !(key in frontmatter)) problems.push(`${key} is required`);
      if (rule.nonEmpty && Array.isArray(frontmatter[key]))
        if (!frontmatter[key].length) problems.push(`${key} must not be empty`);
    }
    if (typeof frontmatter.summary === 'string' && !/[.!?]$/.test(frontmatter.summary.trim()))
      problems.push('summary must be a sentence ending with a full stop');
    if (
      versions &&
      schema.since &&
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

const specimenPattern = /^<!--\s*specimen:\s*([A-Za-z][\w]*)\s*-->\s*$/;

/** The `###` lists a component's or a pattern's Accessibility section needs. */
const providesHeadings = ['envUI provides', 'You provide'];

/**
 * What an Accessibility section lacks: the `###` lists of what envUI and the application provide,
 * and a Key and Action table under `### Keyboard`.
 */
function accessibilityProblems(tokens) {
  const problems = [];
  const headings = tokens
    .filter((token) => token.type === 'heading' && token.depth === 3)
    .map((token) => token.text);
  for (const required of providesHeadings) {
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

/** Problems of any heading: the title is the only `#`, and props are generated. */
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
 * A figure, placed by name: ```tsx figure=Name```, with optional attributes, written
 * name="value", and flags, such as `open`, written as their name alone. Its role and caption come
 * from the frontmatter.
 */
const figurePattern = /^tsx\s+figure=([A-Za-z]\w*)((?:\s+[a-z]+(?:=(?:"[^"]*"|[^\s"]+))?)*)\s*$/;
/** A fence that names an example by its kind, as pages wrote figures before: a figure= fence now. */
const kindFencePattern = /^tsx\s+(?:example|do|dont|anatomy|variants)=/;
/** The attributes each role's figure takes, and those it needs. */
const figureAttributes = {
  example: { allowed: ['widths', 'open', 'stage', 'wide'], required: [] },
  do: { allowed: ['open', 'stage'], required: ['caption'] },
  dont: { allowed: ['open', 'stage'], required: ['caption'] },
  anatomy: { allowed: ['of', 'open', 'stage', 'enlarge'], required: [] },
  variants: { allowed: ['stage'], required: [] },
};
/**
 * The fills a figure's stage takes besides the default, the canvas recessed from what it sits on:
 * `stage="shaded"`, a canvas deeper than both the page's and the navigation's backgrounds, where
 * the subject is a whole window that shows both, such as a Scaffold.
 */
const stageFills = ['shaded'];
/**
 * The attributes that are flags, written without a value: `open` shows the example's overlays
 * open on its stage, contained; `enlarge` shows an anatomy figure's subject half as large again
 * where its stage has room, so the callouts on its close-set parts don't crowd; and `wide` keeps an
 * example across the whole column, alone in its row, rather than beside the text before it, where
 * it needs the room, such as a popup open beside its trigger.
 */
const figureFlags = new Set(['open', 'enlarge', 'wide']);
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
 * The sections of a page in the one-file structure, each with its blocks: Markdown, figures with
 * their legends, specimens and, in Compose, examples shown as code. It checks the structure: the
 * sections pageSections knows, once each, in its order, with Rules; every example the frontmatter
 * lists placed once, but the overview's, which the generated Overview shows; and on a component or
 * a pattern, an overview example and Accessibility's lists. A foundation's figures are the
 * catalogue's (previews/foundations), not example files.
 */
function readPage(document, body, { kind, catalog, examples, specimens, partNames }) {
  const tokens = marked.lexer(body);
  if (tokens.map((token) => token.raw).join('') !== body)
    throw new Error(`Could not split ${document.path} into sections.`);
  const foundation = kind === 'foundation';
  const structure = pageSections.map((item) => ({
    ...item,
    title: (foundation && item.foundationTitle) || item.title,
  }));
  const codeTitle = structure.find((item) => item.id === 'code').title;
  const placed = new Set();
  const sections = [];
  const problems = [];
  let current;
  let subheading;
  /** The figure an ordered list right after it is the legend of. */
  let legendOf;
  /** The `###` subsections of Compose so far, by their index in codeSubsections. */
  const codeOrder = [];
  for (const token of tokens) {
    problems.push(...headingProblems(token));
    if (current?.id === 'code' && !(token.type === 'heading' && token.depth === 2)) {
      // The developer part: `###` subsections of codeSubsections, in order, holding Markdown and
      // example files shown as code.
      current.tokens.push(token);
      if (token.type === 'heading' && token.depth === 3) {
        const index = codeSubsections.findIndex((item) => item.title === token.text);
        if (token.text === 'Import')
          problems.push(`"### Import" of "## ${codeTitle}" is generated; remove it`);
        else if (index === -1)
          problems.push(
            `"### ${token.text}" is not a subsection of "## ${codeTitle}" (${codeSubsections.map((item) => item.title).join(', ')}); use a "####" heading inside one`,
          );
        else if (codeOrder.includes(index)) problems.push(`"### ${token.text}" appears twice`);
        else if (codeOrder.some((other) => other > index))
          problems.push(
            `"### ${token.text}" must come before "### ${codeSubsections[Math.max(...codeOrder)].title}" in "## ${codeTitle}"`,
          );
        codeOrder.push(index);
      } else if (token.type !== 'space' && !codeOrder.length)
        problems.push(`"## ${codeTitle}" starts with a "###" subsection, such as "### Usage"`);
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
      if (
        token.type === 'code' &&
        (figurePattern.test(token.lang ?? '') || kindFencePattern.test(token.lang ?? ''))
      )
        problems.push(
          `"## ${codeTitle}" shows code, not figures: show an example's source with \`tsx source=Name\`, not \`${token.lang}\``,
        );
      if (token.type === 'html' && specimenPattern.test(token.raw.trim()))
        problems.push(`"## ${codeTitle}" shows code, not specimens`);
      const last = current.blocks.at(-1);
      if (last?.kind === 'markdown') last.markdown += token.raw;
      else current.blocks.push({ kind: 'markdown', markdown: token.raw });
      continue;
    }
    if (token.type === 'heading' && token.depth === 2) {
      const section = structure.find((item) => item.title === token.text);
      if (!section) {
        problems.push(
          `"## ${token.text}" is not a section of a ${kind} page (${structure
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
        structure.indexOf(section) < structure.findIndex((item) => item.id === previous.id)
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
    // An option table, whose last column is Use for, shows in the catalogue as a legend of tags.
    const options = optionTable(token);
    if (options)
      problems.push(
        ...optionTableProblems(options).map((problem) => `${current.title}: ${problem}`),
      );
    if (legendOf?.kind === 'figure' && token.type === 'list' && token.ordered) {
      // A foundation figure's legend: what each numbered mark, or each picture of a run, shows,
      // its name in bold and then what it means, such as **Tight, inside a group**: A title….
      legendOf.legend = token.items.map((item, index) => {
        const match = item.text.replace(/\s+/g, ' ').match(/^\*\*([^*]+)\*\*:?\s*(.*)$/);
        if (!match)
          problems.push(
            `item ${index + 1} of the legend of figure ${legendOf.name} must start with its name in bold, such as **Compact**: and what it means`,
          );
        return { name: match?.[1] ?? '', text: match?.[2].trim() ?? item.text };
      });
      legendOf = undefined;
      continue;
    }
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
        // The catalogue shows the part's name alone; its class names and props are for
        // developers.
        const name = item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
        if (!name)
          problems.push(
            `item ${index + 1} of the legend of anatomy ${legendOf.name} must start with the part's name in bold, such as **Label**, which is all the catalogue shows of it`,
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
    const lang = token.type === 'code' ? (token.lang ?? '') : '';
    if (sourcePattern.test(lang))
      problems.push(
        `\`${lang}\` in "## ${current.title}": an example's source as code belongs in "## ${codeTitle}"`,
      );
    if (kindFencePattern.test(lang)) {
      problems.push(
        `\`${lang}\`: place a figure as \`tsx figure=Name\`, and list its role and caption under examples in the frontmatter`,
      );
      continue;
    }
    const figure = lang.match(figurePattern);
    if (/^tsx\s+figure=/.test(lang) && !figure) {
      problems.push(
        `the fence \`${lang}\` is malformed: write \`tsx figure=Name\`, with attributes as name="value" (a value holds no ", so use ' or “ ”) and flags, such as open, as their name alone`,
      );
      continue;
    }
    if (figure) {
      const [, name, rest] = figure;
      const listed = catalog[name];
      if (placed.has(name)) problems.push(`figure ${name} is placed twice; place it once`);
      placed.add(name);
      if (!listed) {
        problems.push(`figure ${name} is not listed under examples in the frontmatter`);
        continue;
      }
      if (listed.role === 'overview') {
        problems.push(
          `figure ${name} is an overview example, which the Overview shows from the frontmatter; don't place it`,
        );
        continue;
      }
      if (token.text.trim())
        problems.push(`the fence of figure ${name} must be empty; the build fills in its file`);
      if (current.id === 'changelog')
        problems.push(`figure ${name} belongs in a section before the changelog`);
      if (foundation) {
        // A foundation's figure is the catalogue's own, from its page's preview, with the legend
        // that follows it; it has no example file.
        if (rest.trim()) problems.push(`figure ${name} takes no attributes on a foundation page`);
        const block = {
          kind: 'figure',
          name,
          heading: subheading ?? fileWords(name),
          role: listed.role,
          ...(listed.caption && { caption: listed.caption }),
        };
        blocks.push(block);
        legendOf = block;
        continue;
      }
      const { role } = listed;
      const attributes = {};
      for (const [, key, value, quoted, plain] of rest.matchAll(
        /\s+([a-z]+)(=(?:"([^"]*)"|([^\s"]+)))?/g,
      )) {
        if (key === 'caption')
          problems.push(`figure ${name} has a caption on its fence; it goes under examples`);
        else if (!figureAttributes[role].allowed.includes(key))
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
      delete attributes.caption;
      if (listed.caption) attributes.caption = listed.caption;
      for (const key of figureAttributes[role].required)
        if (!attributes[key]) problems.push(`${role} ${name} needs a ${key}, one sentence`);
      if (!examples.has(name))
        problems.push(
          `figure ${name} has no file apps/catalogue/src/examples/${document.id}/${name}.tsx`,
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
      if (attributes.wide === true) block.wide = true;
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
      else if (block.role === 'anatomy' && block.kind === 'example' && !block.legend) {
        const component = block.of ?? document.title;
        if (!partNames.components[component]?.length)
          problems.push(
            `anatomy ${block.name} has no legend, and docs/generated/parts.json lists no parts of ${component}${block.of ? '' : '; write a legend or name the component with of="Name"'}`,
          );
      }
  for (const section of structure)
    if (section.required && !sections.some((item) => item.id === section.id))
      problems.push(`"## ${section.title}" is required`);
  if (sections.some((item) => item.id === 'code'))
    for (const [index, item] of codeSubsections.entries())
      if (item.required && !codeOrder.includes(index))
        problems.push(`"## ${codeTitle}" needs a "### ${item.title}" subsection: ${item.holds}`);
  // Every example the frontmatter lists is placed once, but the overview's, which the Overview
  // shows; a component or pattern shows what it is with at least one, and says what envUI and the
  // application provide under Accessibility.
  const entries = Object.entries(catalog);
  for (const [name, { role, open, stage }] of entries) {
    if (foundation && (open || stage))
      problems.push(`figure ${name} takes no open or stage on a foundation page`);
    if (role !== 'overview' && !placed.has(name))
      problems.push(`example ${name} is listed in the frontmatter but placed nowhere`);
    if (!foundation && !examples.has(name))
      problems.push(
        `example ${name} has no file apps/catalogue/src/examples/${document.id}/${name}.tsx`,
      );
  }
  if (!foundation) {
    if (!entries.some(([, { role }]) => role === 'overview'))
      problems.push('the frontmatter lists no overview example, which shows what it is');
    const accessibility = sections.find((item) => item.id === 'accessibility');
    if (!accessibility)
      problems.push('"## Accessibility" is required, with what envUI and you provide');
    else problems.push(...accessibilityProblems(accessibility.tokens));
  }
  if (problems.length)
    throw new Error(
      `${document.path} does not follow the one-file structure (docs/component-pages.md):\n  - ${problems.join('\n  - ')}`,
    );
  const result = sections.map(({ id, title, blocks }) => ({ id, title, blocks }));
  // The Overview: the frontmatter's overview examples, side by side, the first named after the page.
  const overviews = entries.filter(([, { role }]) => role === 'overview');
  if (!overviews.length) return result;
  const overview = {
    id: 'overview',
    title: 'Overview',
    blocks: [
      { kind: 'markdown', markdown: '## Overview\n\n' },
      ...overviews.map(([name, { caption, open, stage }], index) => ({
        kind: foundation ? 'figure' : 'example',
        name,
        heading: index === 0 ? document.title : fileWords(name),
        ...(caption && { caption }),
        ...(open && { open: true }),
        ...(stage && { stage }),
      })),
    ],
  };
  return [overview, ...result];
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
      // A component, pattern or foundation page is in the one-file structure: its frontmatter
      // lists its examples, and its sections follow the title in pageSections' order. A page that
      // isn't fails, so every page stays in it.
      const structured = pageKinds.has(kind);
      if (structured && !frontmatter)
        throw new Error(
          `${kind[0].toUpperCase()}${kind.slice(1)} page ${path} needs frontmatter: it is in the one-file structure (docs/component-pages.md).`,
        );
      if (structured && !('examples' in frontmatter))
        throw new Error(
          `${path} is not in the one-file structure: its frontmatter lists no examples, each once with its role (docs/component-pages.md).`,
        );
      if (frontmatter) validateFrontmatter(frontmatter, path, { kind, versions });
      if (structured) {
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
      if (structured)
        document.sections = withImport(
          readPage(document, markdown, {
            kind,
            catalog: examplesOf(frontmatter),
            examples: filesOf(examples, id),
            specimens: filesOf(specimens, id),
            partNames,
          }),
          frontmatter.components ?? frontmatter.composes ?? [],
          props,
        );
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
    // A page in the one-file structure relates to the pages its avoidWhen names; a guide to those
    // its Related topics list links.
    document.related = document.sections
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

const orList = (items) =>
  items.length === 1 ? items[0] : `${items.slice(0, -1).join(', ')} or ${items.at(-1)}`;
const andList = (items) =>
  items.length === 1 ? items[0] : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;

/** The elements whose native props an export takes; the index says once what native props are. */
function nativeSentence(elements) {
  if (!elements.length) return '';
  const tags = elements.map((element) =>
    element === 'element' ? 'HTML element' : `\`<${element}>\``,
  );
  return `Native props: ${orList(tags)}.`;
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

/**
 * The generated Props section of a page, as Markdown: each export's props in a table, where a prop
 * an export above says word for word is named after the table rather than repeated.
 */
export function renderProps(names, props, headingDepth = 2) {
  const heading = '#'.repeat(headingDepth);
  const lines = [`${heading} Props`, ''];
  // The export that first lists a prop, by its name, type, default and description.
  const firstWith = new Map();
  const propKey = (prop) =>
    JSON.stringify([prop.name, prop.required, prop.type, prop.default, propDescription(prop)]);
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
    // A prop said word for word on an export above is named after the table, not repeated.
    const shared = new Map();
    const own = entry.props.filter((prop) => {
      const owner = firstWith.get(propKey(prop));
      if (!owner) {
        firstWith.set(propKey(prop), name);
        return true;
      }
      shared.set(owner, [...(shared.get(owner) ?? []), codeCell(prop.name)]);
      return false;
    });
    const sharedSentence = [...shared]
      .map(([owner, list]) => `${andList(list)}, as on ${owner}`)
      .join('; ');
    if (!own.length) {
      lines.push(`Takes ${sharedSentence}.${native ? ` ${native}` : ''}`, '');
      continue;
    }
    lines.push('| Prop | Type | Default | Description |', '| --- | --- | --- | --- |');
    for (const prop of own)
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
    if (sharedSentence) lines.push(`Also ${sharedSentence}.`, '');
    if (native) lines.push(native, '');
  }
  return lines.join('\n');
}

/** The component or pattern page that documents an export; a part such as Menu.Item is on its
 * namespace's. */
function pageOfExport(documents, name) {
  return documents.find(
    (entry) =>
      exportKinds.has(pageKindOf(entry.path)) &&
      entry.frontmatter?.components?.includes(name.split('.')[0]),
  );
}

/** An example's source as the package and agents read it. */
export function exampleSource(page, name, directory = examplesDirectory) {
  return readFileSync(resolve(directory, page, `${name}.tsx`), 'utf8');
}

/**
 * The frontmatter of a page as it ships: as written, with each example once, by its role and
 * caption, under a comment that says where its file is; how the catalogue frames an overview is
 * left out. A foundation's figures are the catalogue's, with no file, and its legends say what
 * they show, so they are left out.
 */
function shippedYaml(document) {
  const foundation = pageKindOf(document.path) === 'foundation';
  const entries = foundation ? [] : Object.entries(examplesOf(document.frontmatter));
  const lines = entries.map(
    ([name, { role, caption }]) =>
      `  ${name}: ${caption ? `{ role: ${role}, caption: ${JSON.stringify(caption)} }` : role}`,
  );
  const examples = lines.length
    ? `examples: # Each file is examples/${document.id}/<Name>.tsx.\n${lines.join('\n')}\n`
    : '';
  return `${document.yaml.replace(/\n*$/, '\n').replace(/^examples:[^\n]*\n(?:[ \t]+[^\n]*\n)*/m, examples)}`;
}

/**
 * The Markdown of a component, pattern or foundation page as it ships, for agents: the whole file,
 * in its order, with each example's code once. The frontmatter lists every example with its role and
 * caption, and says what to use instead, so Related isn't repeated at the end; the Overview's
 * examples are there. In the body, a run of figures is one line that names them, an anatomy figure
 * its legend, a variants figure its option table and a foundation's figure its legend; Compose
 * holds the canonical example's source in full. The props name what an export shares with one above
 * rather than repeating it, and the releases are
 * in the package's CHANGELOG.md.
 */
function compilePage(document, { props, examples, title }) {
  const head = `---\n${shippedYaml(document).replace(/\n*$/, '')}\n---\n\n`;
  const legendLines = (legend, named = false) =>
    legend
      .map((item, index) =>
        named ? `${index + 1}. **${item.name}**: ${item.text}` : `${index + 1}. ${item.text}`,
      )
      .join('\n');
  const write = (section) => {
    let text = '';
    let run = [];
    const flush = () => {
      if (run.length) text += `${run.length > 1 ? 'Examples' : 'Example'}: ${run.join(', ')}.\n\n`;
      run = [];
    };
    for (const [index, block] of section.blocks.entries()) {
      if (block.kind === 'markdown') {
        if (!block.markdown.trim() && run.length) continue;
        flush();
        text += block.markdown;
      } else if (block.kind === 'source') {
        flush();
        const source = exampleSource(document.id, block.name, examples).replace(/\n*$/, '\n');
        const fence = fenceFor(source);
        text += `${fence}tsx source=${block.name}\n${source}${fence}\n`;
      } else if (block.kind === 'figure') {
        flush();
        if (block.legend) text += `\n${legendLines(block.legend, true)}\n\n`;
      } else if (block.kind === 'example' && block.role === 'anatomy') {
        flush();
        if (block.legend) text += `\n${legendLines(block.legend)}\n\n`;
      } else if (block.kind === 'example' && block.role === 'variants') {
        flush();
        const next = section.blocks[index + 1];
        const table = next?.kind === 'markdown' && next.markdown.trimStart().startsWith('|');
        if (block.legend && !table) text += `\n${legendLines(block.legend)}\n\n`;
      } else if (block.kind === 'example')
        // A do or a don't says so; its rule is its caption, in the frontmatter.
        run.push(
          block.role ? `${block.name} (${block.role === 'dont' ? "don't" : 'do'})` : block.name,
        );
    }
    flush();
    return text.replace(/\n{3,}/g, '\n\n').replace(/\s*$/, '\n');
  };
  const parts = [];
  for (const section of document.sections) {
    if (['overview', 'related', 'changelog'].includes(section.id)) continue;
    parts.push(write(section));
    if (section.id === 'code' && props) parts.push(props);
  }
  if (props && !document.sections.some((section) => section.id === 'code')) parts.push(props);
  return `${head}${title}${parts.join('\n')}`.replace(/\n*$/, '\n');
}

/**
 * The Markdown of a page as it ships: a component, pattern or foundation page as compilePage writes
 * it, with its props; the index with each page's summary and without the contributor pages; and a
 * guide as it is written.
 */
export function compileDocument(document, documents, { props, examples = examplesDirectory } = {}) {
  const title = `# ${document.title}\n\n`;
  if (document.id === 'index') {
    const markdown = document.markdown
      .replace(/^- \[([^\]]+)\]\(([^)]+\.md)\)(.*)$/gm, (line, text, path, rest) => {
        if (contributorPages.has(path)) return '';
        const target = documents.find((entry) => entry.path === path);
        return target?.frontmatter && !rest ? `${line} — ${target.summary}` : line;
      })
      .replace(/\n{3,}/g, '\n\n');
    return `${title}${markdown}`;
  }
  if (document.sections) {
    const propsSection =
      props && document.frontmatter.components
        ? renderProps(document.frontmatter.components, props)
        : '';
    return compilePage(document, { props: propsSection, examples, title });
  }
  const head = document.frontmatter ? `---\n${document.yaml.replace(/\n*$/, '')}\n---\n\n` : '';
  return `${head}${title}${document.markdown}`;
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
    if (!frontmatter) return entry;
    // A guide names the exports it documents, such as LinkProvider, so a page that relates to one
    // links to it.
    if (!sections)
      return frontmatter.components ? { ...entry, components: frontmatter.components } : entry;
    const metadata = {
      ...(frontmatter.status && { status: frontmatter.status }),
      ...(frontmatter.since && { since: frontmatter.since }),
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
