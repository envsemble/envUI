// Reads the documentation in docs/: the index, which groups and orders the pages, and each page with
// its frontmatter. It validates them, generates the catalogue's data
// (apps/catalogue/src/generated/Documentation.ts) and compiles the Markdown that ships in the
// package, where example files and generated props tables are filled in.
//
// Component pages (docs/components/*.md) carry YAML frontmatter (see frontmatterSchema). A page on
// the template has the fixed `##` sections of templateSections, in their order; its examples are
// files in apps/catalogue/src/examples/<page>/<Name>.tsx, referenced by an empty fence
// ```tsx example=Name```, and its Props and Related sections are generated. docs/component-pages.md
// describes the template for authors.
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
import { writeSearchIndex } from './SearchIndex.mjs';

export const documentationDirectory = fileURLToPath(new URL('../docs/', import.meta.url));
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
 * Frontmatter of a component page. `template` fields are required once the page is on the
 * template; other pages (foundations, workflows) may only name the components they document.
 */
export const frontmatterSchema = {
  title: { type: 'string', required: true },
  summary: { type: 'string', required: true },
  status: { type: 'string', required: true, values: statuses },
  since: { type: 'string', required: true, pattern: /^\d+\.\d+\.\d+$/ },
  category: { type: 'string', required: true, values: componentGroups },
  aliases: { type: 'strings', required: true, nonEmpty: true },
  useWhen: { type: 'strings', template: true },
  avoidWhen: { type: 'avoid', template: true },
  related: { type: 'strings', required: true },
  components: { type: 'strings', required: true, nonEmpty: true },
};
const otherFrontmatter = new Set(['components', 'aliases']);
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
 * .changeset/config.json). In prerelease mode (.changeset/pre.json) it is the version the
 * prereleases lead to, such as 1.0.0 for 1.0.0-next.3: the version before the prereleases, from
 * the mode's initialVersions, raised by the largest bump of every changeset since, released in a
 * prerelease or not, as Changesets computes it. Prerelease headings such as `## 1.0.0-next.0` are
 * not versions a page can name. Undefined outside the repository, where the check is skipped.
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
  const bumps = existsSync(changesets)
    ? readdirSync(changesets)
        .filter((name) => name.endsWith('.md') && name !== 'README.md')
        .flatMap((name) => {
          const source = readFileSync(resolve(changesets, name), 'utf8');
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

function validateFrontmatter(frontmatter, path, { component, template, versions }) {
  const problems = [];
  if (!component) {
    for (const key of Object.keys(frontmatter))
      if (!otherFrontmatter.has(key))
        problems.push(`${key} is not allowed here; only components and aliases are`);
  }
  for (const [key, value] of Object.entries(frontmatter)) {
    const rule = frontmatterSchema[key];
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
            Object.keys(item).some((field) => field !== 'text' && field !== 'use'),
        )
      )
        problems.push(`${key} must be a list of { text, use } entries, use naming the alternative`);
    }
  }
  if (component) {
    for (const [key, rule] of Object.entries(frontmatterSchema)) {
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
      frontmatter.since.match(frontmatterSchema.since.pattern) &&
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

/** The blocks of a template page's sections: Markdown, example files and catalogue specimens. */
function readTemplate(document, body, { examples, specimens }) {
  const tokens = marked.lexer(body);
  if (tokens.map((token) => token.raw).join('') !== body)
    throw new Error(`Could not split ${document.path} into sections.`);
  const sections = [];
  let current;
  const problems = [];
  let subheading;
  for (const token of tokens) {
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
    if (token.type === 'heading' && token.depth === 2) {
      const section = templateSections.find((item) => item.title === token.text);
      if (!section) {
        problems.push(
          `"## ${token.text}" is not a template section (${templateSections.map((item) => item.title).join(', ')})`,
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
      if (example) {
        const name = example[1] ?? example[2];
        // The overview shows one example first, without a heading; the rest are under Examples.
        const hero = current.id === 'overview';
        if (hero && blocks.some((block) => block.kind === 'example'))
          problems.push('"## Overview" shows at most one example');
        if (!hero && current.id !== 'examples')
          problems.push(`example ${name} must be in "## Examples" or "## Overview"`);
        if (!/^[A-Z][A-Za-z\d]*$/.test(name))
          problems.push(`example ${name} must be a PascalCase file name`);
        if (token.text.trim())
          problems.push(`the fence of example ${name} must be empty; the build fills in its file`);
        if (!hero && !subheading) problems.push(`example ${name} needs a "###" heading`);
        if (!examples.has(name))
          problems.push(
            `example ${name} has no file apps/catalogue/src/examples/${document.id}/${name}.tsx`,
          );
        blocks.push({
          kind: 'example',
          name,
          heading: hero ? document.title : (subheading ?? name),
        });
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
  for (const section of templateSections)
    if (section.required && !sections.some((item) => item.id === section.id))
      problems.push(`"## ${section.title}" is required`);
  const examplesSection = sections.find((item) => item.id === 'examples');
  if (examplesSection) {
    const headings = examplesSection.tokens.filter(
      (token) => token.type === 'heading' && token.depth === 3,
    );
    const names = examplesSection.blocks.filter((block) => block.kind === 'example');
    if (!names.length) problems.push('"## Examples" needs at least one example file');
    for (const heading of headings) {
      const count = names.filter((block) => block.heading === heading.text).length;
      if (count !== 1) problems.push(`"### ${heading.text}" must introduce exactly one example`);
    }
  }
  const accessibility = sections.find((item) => item.id === 'accessibility');
  if (accessibility) {
    const headings = accessibility.tokens
      .filter((token) => token.type === 'heading' && token.depth === 3)
      .map((token) => token.text);
    for (const required of ['envUI provides', 'You provide']) {
      const start = accessibility.tokens.findIndex(
        (token) => token.type === 'heading' && token.depth === 3 && token.text === required,
      );
      const list = accessibility.tokens
        .slice(start + 1)
        .find((token) => token.type === 'list' || token.type === 'heading');
      if (start === -1 || list?.type !== 'list' || !list.items.some((item) => item.text.trim()))
        problems.push(`"## Accessibility" needs a "### ${required}" list`);
    }
    if (headings.includes('Keyboard')) {
      const start = accessibility.tokens.findIndex(
        (token) => token.type === 'heading' && token.text === 'Keyboard',
      );
      const table = accessibility.tokens
        .slice(start + 1)
        .find((token) => token.type === 'table' || (token.type === 'heading' && token.depth <= 3));
      const header = table?.type === 'table' ? table.header.map((cell) => cell.text) : [];
      if (header[0] !== 'Key' || header[1] !== 'Action')
        problems.push('"### Keyboard" needs a table with "Key" and "Action" columns');
    }
  }
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
      const component = path.startsWith('components/');
      const tokens = marked.lexer(markdown);
      const firstSection = tokens.find((t) => t.type === 'heading' && t.depth === 2);
      const template = component && firstSection?.text === 'Overview';
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
      if (component && !template && templateParts)
        throw new Error(
          `${path} uses the page template, so its first section must be "## Overview", not ${
            firstSection ? `"## ${firstSection.text}"` : 'missing'
          }.`,
        );
      if (component && !frontmatter) throw new Error(`Component page ${path} needs frontmatter.`);
      if (frontmatter) validateFrontmatter(frontmatter, path, { component, template, versions });
      if (component) {
        if (frontmatter.title !== title)
          throw new Error(`Frontmatter title of ${path} differs from its index entry.`);
        if (frontmatter.category !== group)
          throw new Error(
            `Category of ${path} is ${frontmatter.category}, but the index lists it under ${group}.`,
          );
        if (indexSummary)
          throw new Error(
            `The index entry of ${path} repeats a summary; it lives in the page's frontmatter.`,
          );
        if (kebab(title) !== id && !slugExceptions.has(id))
          throw new Error(`${path} must be named ${kebab(title)}.md after its title.`);
        if (!frontmatter.components.includes(title.split('.')[0]) && exported?.[title])
          throw new Error(`${path} must list ${title}, its own component, in components.`);
      } else if (!indexSummary) throw new Error(`Invalid documentation index entry: ${item.text}`);
      for (const name of frontmatter?.components ?? [])
        if (exported && !exported[name])
          throw new Error(`${path} lists ${name} in components, but envUI exports no ${name}.`);
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
      if (template)
        document.sections = readTemplate(document, markdown, {
          examples: filesOf(examples, id),
          specimens: filesOf(specimens, id),
        });
      documents.push(document);
    }
  }
  for (const document of documents) {
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
    if (document.frontmatter?.related && !document.sections) {
      // A page not yet on the template keeps its Related topics list; the frontmatter matches it.
      if (document.frontmatter.related.join(' ') !== listed.join(' '))
        throw new Error(
          `Frontmatter related of ${document.path} differs from its Related topics list.`,
        );
    }
    document.related = document.frontmatter?.related ?? listed;
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
      if (fragment && !headingsOf(linked.markdown).some(({ id }) => id === fragment))
        throw new Error(
          `Broken documentation link in ${document.path}: ${token.href} names no heading of ${linked.path}.`,
        );
    });
  }
  return documents;
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

function renderRelated(document, documents) {
  const lines = ['## Related', ''];
  for (const id of document.related) {
    const target = documents.find((entry) => entry.id === id);
    const href = posix.relative(posix.dirname(document.path), target.path);
    lines.push(
      `- [${target.title}](${href.startsWith('.') ? href : `./${href}`}) — ${target.summary}`,
    );
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
      else if (block.kind === 'example') {
        // The fence outlasts any backticks in the source, and closes on a line of its own.
        const source = exampleSource(document.id, block.name, examples).replace(/\n*$/, '\n');
        const fence = fenceFor(source);
        text += `${fence}tsx example=${block.name}\n${source}${fence}\n`;
      }
    }
    return text.replace(/\n{3,}/g, '\n\n').replace(/\s*$/, '\n');
  };
  for (const section of templateSections) {
    if (section.id === 'props') {
      if (propsSection) parts.push(propsSection);
      continue;
    }
    if (section.id === 'related') {
      if (document.related.length) parts.push(renderRelated(document, documents));
      continue;
    }
    const authored = document.sections.find((item) => item.id === section.id);
    if (authored) parts.push(write(authored));
  }
  return `${head}${title}${parts.join('\n')}`.replace(/\n*$/, '\n');
}

/** Every packaged documentation file: compiled pages, the index and the example sources. */
export function compileDocumentation(
  directory = documentationDirectory,
  { props = readProps(directory), examples = examplesDirectory } = {},
) {
  const documents = readDocumentation(directory, { props, examples });
  const files = new Map();
  for (const document of documents)
    files.set(document.path, compileDocument(document, documents, { props, examples }));
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

/** Writes the package's docs/: compiled pages and examples, and every other file as it is. */
export function packageDocumentation(outputDirectory) {
  rmSync(outputDirectory, { recursive: true, force: true });
  cpSync(documentationDirectory, outputDirectory, { recursive: true });
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
    if (!frontmatter || !document.path.startsWith('components/')) return entry;
    const metadata = {
      status: frontmatter.status,
      since: frontmatter.since,
      aliases: frontmatter.aliases ?? [],
      useWhen: frontmatter.useWhen ?? [],
      avoidWhen: frontmatter.avoidWhen ?? [],
      components: frontmatter.components ?? [],
    };
    if (!sections) return { ...entry, metadata };
    return {
      ...entry,
      metadata,
      sections,
      props: Object.fromEntries(
        documentedExports(frontmatter.components, props).map((name) => [name, props.exports[name]]),
      ),
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
