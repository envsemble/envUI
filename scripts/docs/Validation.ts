import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked, type Token, type Tokens } from 'marked';
import type { DocumentationBlock } from './model/DocumentationTypes.ts';
import { optionTable, optionTableProblems } from './model/CatalogueContent.ts';
import {
  codeSubsections,
  documentationDirectory,
  exampleFields,
  exampleRoles,
  frontmatterSchema,
  guideExportStatus,
  otherFrontmatter,
  pageSchemas,
  pageSections,
  sourcePattern,
  statuses,
  type ExampleEntry,
  type Frontmatter,
  type PageSection,
  type PageSectionDefinition,
} from './Schema.ts';

/** A figure of a foundation's page, or an example file placed as a figure. */
type FigureBlock = Extract<DocumentationBlock, { kind: 'figure' }>;
type ExampleBlock = Extract<DocumentationBlock, { kind: 'example' }>;

/** A section of a page as readPage builds it: its blocks, and in Compose its tokens. */
interface ReadSection extends PageSection {
  tokens: Token[];
}

/** The part names readPartNames finds: every class, and each component's parts. */
export interface PartNames {
  classes: Set<string>;
  components: Record<string, string[]>;
}

export const cell = (text: unknown) =>
  String(text).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

/** What a page's frontmatter is checked against: its kind, and the versions its since may name. */
export interface FrontmatterContext {
  kind: string;
  /** The released versions and the next one; without them, since goes unchecked. */
  versions?: Set<string>;
}

/** Checks a page's frontmatter against its kind's schema, throwing with every problem it has. */
export function validateFrontmatter(
  frontmatter: Frontmatter,
  path: string,
  { kind, versions }: FrontmatterContext,
) {
  const problems: string[] = [];
  const schema = pageSchemas[kind];
  if (!schema) {
    for (const key of Object.keys(frontmatter))
      if (!otherFrontmatter.has(key))
        problems.push(
          `${key} is not allowed here; only status, components, aliases, exportAliases and statuses are`,
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
        for (const [name, entry] of Object.entries<string | Partial<ExampleEntry> | null>(value)) {
          const { role, caption, open, stage, motion, wide, device }: Partial<ExampleEntry> =
            typeof entry === 'string' ? { role: entry } : (entry ?? {});
          if (!/^[A-Z][A-Za-z\d]*$/.test(name))
            problems.push(`${key} names ${name}; name an example by its PascalCase file name`);
          if (!exampleRoles.includes(role ?? ''))
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
          if (
            (open !== undefined ||
              stage !== undefined ||
              motion !== undefined ||
              wide !== undefined ||
              device !== undefined) &&
            role !== 'overview'
          )
            problems.push(
              `${key} gives ${name} open, stage, motion, wide or device, which only an overview example takes here; write them on its fence`,
            );
          if (device !== undefined && !deviceKinds.includes(device))
            problems.push(
              `${key} gives ${name} device: ${device}; a device is ${deviceKinds.join(' or ')}, or nothing for the stage alone`,
            );
          if (device !== undefined && open !== undefined)
            problems.push(`${key} gives ${name} device and open; a figure on a device is closed`);
          if (open !== undefined && open !== true)
            problems.push(`${key} gives ${name} open: ${open}; write open: true, or leave it out`);
          if (motion !== undefined && motion !== true)
            problems.push(
              `${key} gives ${name} motion: ${motion}; write motion: true, or leave it out`,
            );
          if (wide !== undefined && wide !== true)
            problems.push(`${key} gives ${name} wide: ${wide}; write wide: true, or leave it out`);
          if (stage !== undefined && !stageFills.includes(stage))
            problems.push(
              `${key} gives ${name} stage: ${stage}; a stage takes ${stageFills.join(', ')}, or nothing for the stage in the page's color`,
            );
          if (caption !== undefined && (typeof caption !== 'string' || !caption.trim()))
            problems.push(`${key} gives ${name} an empty caption`);
          if ((role === 'do' || role === 'dont' || role === 'caution') && !caption)
            problems.push(`${key} gives the ${role} figure ${name} no caption, its rule`);
        }
    } else if (rule.type === 'statuses') {
      const listed = Array.isArray(frontmatter.components) ? frontmatter.components : [];
      if (!value || typeof value !== 'object' || Array.isArray(value))
        problems.push(`${key} must map an export to its status`);
      else
        for (const [name, status] of Object.entries<unknown>(value)) {
          if (!listed.includes(name))
            problems.push(`${key} names ${name}, which components does not list`);
          if (!statuses.includes(status as string))
            problems.push(`${key} of ${name} must be one of ${statuses.join(', ')}`);
          else if (
            status === (schema ? frontmatter.status : (frontmatter.status ?? guideExportStatus))
          )
            problems.push(
              schema || frontmatter.status
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
      frontmatter.since.match(schema.since.pattern!) &&
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
export function isPropsTable(token: Token) {
  if (token.type !== 'table') return false;
  const header = (token as Tokens.Table).header.map((cell) => cell.text.trim().toLowerCase());
  return (
    propsTableNames.includes(header[0]) &&
    header.slice(1).some((cell) => propsTableColumns.includes(cell))
  );
}

/** A fence long enough for a source: three backticks, or one more than its longest run. */
export function fenceFor(source: string) {
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
function accessibilityProblems(tokens: Token[]) {
  const problems: string[] = [];
  const headings = tokens
    .filter((token): token is Tokens.Heading => token.type === 'heading' && token.depth === 3)
    .map((token) => token.text);
  for (const required of providesHeadings) {
    const start = tokens.findIndex(
      (token) => token.type === 'heading' && token.depth === 3 && token.text === required,
    );
    const list = tokens
      .slice(start + 1)
      .find((token) => token.type === 'list' || token.type === 'heading');
    if (
      start === -1 ||
      list?.type !== 'list' ||
      !(list as Tokens.List).items.some((item) => item.text.trim())
    )
      problems.push(`"## Accessibility" needs a "### ${required}" list`);
  }
  if (headings.includes('Keyboard')) {
    const start = tokens.findIndex(
      (token) => token.type === 'heading' && token.text === 'Keyboard',
    );
    const table = tokens
      .slice(start + 1)
      .find((token) => token.type === 'table' || (token.type === 'heading' && token.depth <= 3));
    const header =
      table?.type === 'table' ? (table as Tokens.Table).header.map((cell) => cell.text) : [];
    if (header[0] !== 'Key' || header[1] !== 'Action')
      problems.push('"### Keyboard" needs a table with "Key" and "Action" columns');
  }
  return problems;
}

/**
 * A version's place in a changelog: 1.0.0 after 0.7.0, and a release after its prereleases, so
 * 1.0.0 after 1.0.0-prerelease.6, which comes after 1.0.0-prerelease.5.
 */
function versionRank(version: string) {
  const [release, prerelease] = version.split('-');
  const numbers = release.split('.').map(Number);
  return [...numbers, prerelease === undefined ? 1 : 0, Number(prerelease?.split('.').at(-1) ?? 0)];
}

/** Orders versions from the oldest, as versionRank places them. */
function compareChangelogVersions(a: string, b: string) {
  const [x, y] = [versionRank(a), versionRank(b)];
  for (const [index, part] of x.entries()) if (part !== y[index]) return part - y[index];
  return 0;
}

/** What a Changelog's entries get wrong: they run from the newest version to the oldest. */
function changelogProblems(tokens: Token[]) {
  const versions = tokens
    .filter((token): token is Tokens.List => token.type === 'list')
    .flatMap((list) => list.items)
    .map((item) => /^\*\*([^*]+)\*\*:/.exec(item.text)?.[1])
    .filter((version): version is string => Boolean(version));
  const misplaced = versions.find(
    (version, index) => index > 0 && compareChangelogVersions(versions[index - 1]!, version) < 0,
  );
  return misplaced
    ? [`"## Changelog" lists ${misplaced} below an older version: list the newest first`]
    : [];
}

/** Problems of any heading: the title is the only `#`, and props are generated. */
function headingProblems(token: Token) {
  const problems: string[] = [];
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
const figureAttributes: Record<string, { allowed: string[]; required: string[] }> = {
  example: {
    allowed: ['widths', 'sweep', 'classes', 'fit', 'open', 'stage', 'wide', 'motion', 'device'],
    required: [],
  },
  do: { allowed: ['open', 'stage', 'wide', 'motion'], required: ['caption'] },
  dont: { allowed: ['open', 'stage', 'wide', 'motion'], required: ['caption'] },
  caution: { allowed: ['open', 'stage', 'wide', 'motion'], required: ['caption'] },
  anatomy: { allowed: ['of', 'open', 'stage', 'enlarge', 'width', 'specimen'], required: [] },
  variants: { allowed: ['stage'], required: [] },
};
/**
 * The fills a figure's stage takes besides the default, the canvas recessed from what it sits on:
 * `stage="shaded"`, a canvas deeper than both the page's and the navigation's backgrounds, where
 * the subject is a whole window that shows both, such as a Scaffold.
 */
const stageFills = ['shaded'];
/**
 * The devices an example is drawn in on its page, at the device's real width and filling its
 * screen (`device="phone"` or `device="window"`): a whole screen of an application, such as a
 * Scaffold, rather than a box standing in for one. The catalogue's cards never draw one.
 */
const deviceKinds = ['phone', 'window'];
/**
 * The attributes that are flags, written without a value: `open` shows the example's overlays
 * open on its stage, contained; `enlarge` shows an anatomy figure's subject half as large again
 * where its stage has room, so the callouts on its close-set parts don't crowd; and `wide` keeps an
 * example across the whole column, alone in its row, rather than beside the text before it, where
 * it needs the room, such as a popup open beside its trigger, or a do and a don't one above the
 * other. With `widths`, `sweep` shows one
 * frame whose width sweeps between them and back, `classes` names the window class on its ruler,
 * and `fit` draws the frame smaller where it must to reach its widest width on the stage; `motion`
 * plays the example in the catalogue: its playback, the specimen of the same name, takes its place; and
 * `specimen` numbers an anatomy figure's parts on its playback, the specimen of the same name, held in
 * a moment its parts show apart, such as a value caught as it rolls in.
 */
const figureFlags = new Set([
  'open',
  'enlarge',
  'wide',
  'sweep',
  'classes',
  'fit',
  'motion',
  'specimen',
]);
/** A file name as words: ConnectedButtons is "Connected buttons". */
const fileWords = (name: string) =>
  name
    .replace(/(?<=[a-z\d])(?=[A-Z])/g, ' ')
    .replace(/ [A-Z](?=[a-z])/g, (word) => word.toLowerCase());

const stylesDirectory = fileURLToPath(new URL('../../packages/ui/src/styles/', import.meta.url));

/**
 * The part class names an anatomy legend may name: every `env-*` class of packages/ui's style
 * sheets and of docs/generated/parts.json, and that file's components by export name, each with
 * its parts, for a figure without a legend.
 */
export function readPartNames(directory = documentationDirectory): PartNames {
  const classes = new Set<string>();
  if (existsSync(stylesDirectory))
    for (const name of readdirSync(stylesDirectory).filter((file) => file.endsWith('.css')))
      for (const [, found] of readFileSync(resolve(stylesDirectory, name), 'utf8').matchAll(
        /\.(env-[\w-]+)/g,
      ))
        classes.add(found);
  const file = resolve(directory, 'generated/parts.json');
  const json = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const components: Record<string, string[]> = {};
  for (const [group, entries] of [
    ['components', json.components],
    ['shared', json.shared],
  ])
    for (const [name, entry] of Object.entries<{ root?: string; parts?: { class: string }[] }>(
      entries ?? {},
    )) {
      const parts = [entry.root, ...(entry.parts ?? []).map((part) => part.class)].filter(
        (part): part is string => Boolean(part),
      );
      for (const part of parts) classes.add(part);
      if (group === 'components') components[name] = parts;
    }
  return { classes, components };
}

/** The page readPage reads: its id, the path its problems name, and its title. */
export interface PageInput {
  id: string;
  path: string;
  title: string;
}

/**
 * What readPage checks a page against: its kind, the examples its frontmatter lists, the example
 * and specimen files of its folder, and the part names its legends may name.
 */
export interface PageContext {
  kind: string;
  catalog: Record<string, ExampleEntry>;
  examples: Set<string>;
  specimens: Set<string>;
  partNames: PartNames;
}

/** What readPage keeps as it reads a page's tokens in order. */
interface PageReading {
  document: PageInput;
  context: PageContext;
  foundation: boolean;
  /** The sections the page's kind takes, in their order, with their titles on this kind. */
  structure: PageSectionDefinition[];
  codeTitle: string;
  /** The figures placed so far, by name. */
  placed: Set<string>;
  sections: ReadSection[];
  problems: string[];
  current: ReadSection | undefined;
  subheading: string | undefined;
  /** The figure an ordered list right after it is the legend of. */
  legendOf: FigureBlock | ExampleBlock | undefined;
  /** The `###` subsections of Compose so far, by their index in codeSubsections. */
  codeOrder: number[];
}

/** Adds Markdown to a section's blocks, to the Markdown block it ends with if it does. */
function appendMarkdown(blocks: DocumentationBlock[], raw: string) {
  const last = blocks.at(-1);
  if (last?.kind === 'markdown') last.markdown += raw;
  else blocks.push({ kind: 'markdown', markdown: raw });
}

/**
 * The sections of a page in the one-file structure, each with its blocks: Markdown, figures with
 * their legends, specimens and, in Compose, examples shown as code. It checks the structure: the
 * sections pageSections knows, once each, in its order, with Rules; every example the frontmatter
 * lists placed once, but the overview's, which the generated Overview shows; and on a component or
 * a pattern, an overview example and Accessibility's lists. A foundation's figures are the
 * catalogue's (figures/foundations); an example file there is the code of the figure of its name.
 */
export function readPage(document: PageInput, body: string, context: PageContext) {
  const tokens = marked.lexer(body);
  if (tokens.map((token) => token.raw).join('') !== body)
    throw new Error(`Could not split ${document.path} into sections.`);
  const foundation = context.kind === 'foundation';
  const structure = pageSections.map((item) => ({
    ...item,
    title: (foundation && item.foundationTitle) || item.title,
  }));
  const page: PageReading = {
    document,
    context,
    foundation,
    structure,
    codeTitle: structure.find((item) => item.id === 'code')!.title,
    placed: new Set(),
    sections: [],
    problems: [],
    current: undefined,
    subheading: undefined,
    legendOf: undefined,
    codeOrder: [],
  };
  for (const token of tokens) readToken(page, token);
  page.problems.push(...pageProblems(page));
  if (page.problems.length)
    throw new Error(
      `${document.path} does not follow the one-file structure (contributing/pages.md):\n  - ${page.problems.join('\n  - ')}`,
    );
  return withOverview(page);
}

/** Reads one token of a page into the section it belongs to. */
function readToken(page: PageReading, token: Token) {
  const { problems, codeTitle } = page;
  problems.push(...headingProblems(token));
  if (page.current?.id === 'code' && !(token.type === 'heading' && token.depth === 2)) {
    readComposeToken(page, page.current, token);
    return;
  }
  if (token.type === 'heading' && token.depth === 2 && !startSection(page, token as Tokens.Heading))
    return;
  const current = page.current;
  if (!current) {
    if (token.type !== 'space') problems.push('content must follow a "##" section heading');
    return;
  }
  current.tokens.push(token);
  if (token.type === 'space') {
    appendMarkdown(current.blocks, token.raw);
    return;
  }
  if (token.type === 'blockquote')
    problems.push(
      `${current.title} has a blockquote; write its text as a paragraph, or a rule as a do and don't pair`,
    );
  if (token.type === 'heading' && token.depth === 3) page.subheading = token.text;
  if (isPropsTable(token))
    problems.push(`${current.title} lists props in a table; the Props section is generated`);
  // An option table, whose last column is Use for, shows in the catalogue as a legend of tags.
  const options = optionTable(token);
  if (options)
    problems.push(...optionTableProblems(options).map((problem) => `${current.title}: ${problem}`));
  if (token.type === 'list' && token.ordered && readLegend(page, token as Tokens.List)) return;
  page.legendOf = undefined;
  const lang = token.type === 'code' ? (token.lang ?? '') : '';
  if (sourcePattern.test(lang))
    problems.push(
      `\`${lang}\` in "## ${current.title}": an example's source as code belongs in "## ${codeTitle}"`,
    );
  if (kindFencePattern.test(lang)) {
    problems.push(
      `\`${lang}\`: place a figure as \`tsx figure=Name\`, and list its role and caption under examples in the frontmatter`,
    );
    return;
  }
  const figure = lang.match(figurePattern);
  if (/^tsx\s+figure=/.test(lang) && !figure) {
    problems.push(
      `the fence \`${lang}\` is malformed: write \`tsx figure=Name\`, with attributes as name="value" (a value holds no ", so use ' or “ ”) and flags, such as open, as their name alone`,
    );
    return;
  }
  if (figure) {
    placeFigure(page, current, token as Tokens.Code, figure[1]!, figure[2]!);
    return;
  }
  if (token.type === 'html' && specimenPattern.test(token.raw.trim())) {
    const name = token.raw.trim().match(specimenPattern)![1]!;
    if (!page.context.specimens.has(name))
      problems.push(
        `specimen ${name} has no file apps/site/src/specimens/${page.document.id}/${name}.tsx`,
      );
    current.blocks.push({ kind: 'specimen', name });
    return;
  }
  appendMarkdown(current.blocks, token.raw);
}

/**
 * Reads a token of "## Compose", the developer part: `###` subsections of codeSubsections, in
 * order, holding Markdown and example files shown as code.
 */
function readComposeToken(page: PageReading, current: ReadSection, token: Token) {
  const { problems, codeTitle, codeOrder } = page;
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
        `"### ${token.text}" must come before "### ${codeSubsections[Math.max(...codeOrder)]!.title}" in "## ${codeTitle}"`,
      );
    codeOrder.push(index);
  } else if (token.type !== 'space' && !codeOrder.length)
    problems.push(`"## ${codeTitle}" starts with a "###" subsection, such as "### Usage"`);
  // Code of one language with nothing between is one block, rather than a line and then more.
  const before = current.tokens.slice(0, -1).findLast((item) => item.type !== 'space');
  if (
    token.type === 'code' &&
    before?.type === 'code' &&
    before.lang === token.lang &&
    !sourcePattern.test(token.lang ?? '')
  )
    problems.push(
      `"## ${codeTitle}" gives two ${token.lang || 'code'} blocks in a row; make them one block`,
    );
  if (token.type === 'code' && sourcePattern.test(token.lang ?? '')) {
    const name = token.lang.match(sourcePattern)[1];
    if (!page.context.examples.has(name))
      problems.push(
        `source ${name} has no file apps/site/src/examples/${page.document.id}/${name}.tsx`,
      );
    if (token.text.trim())
      problems.push(`the fence of source ${name} must be empty; the build fills in its file`);
    current.blocks.push({ kind: 'source', name });
    return;
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
  appendMarkdown(current.blocks, token.raw);
}

/**
 * Starts the section a `##` heading opens, checking it is one the page's kind takes, once, in
 * order; false for a heading of no such section, which the page then leaves out.
 */
function startSection(page: PageReading, token: Tokens.Heading) {
  const { structure, sections, problems } = page;
  const section = structure.find((item) => item.title === token.text);
  if (!section) {
    problems.push(
      `"## ${token.text}" is not a section of a ${page.context.kind} page (${structure
        .filter((item) => !item.generated)
        .map((item) => item.title)
        .join(', ')})`,
    );
    return false;
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
  page.current = { id: section.id, title: section.title, blocks: [], tokens: [] };
  sections.push(page.current);
  page.subheading = undefined;
  page.legendOf = undefined;
  return true;
}

/** Reads an ordered list as the legend of the figure before it, if it has one; false if not. */
function readLegend(page: PageReading, list: Tokens.List) {
  const figure = page.legendOf;
  if (!figure) return false;
  if (figure.kind === 'figure') figure.legend = foundationLegend(page, figure, list);
  else if (figure.role === 'variants') figure.legend = variantsLegend(page, figure, list);
  else figure.legend = anatomyLegend(page, figure, list);
  page.legendOf = undefined;
  return true;
}

/**
 * A foundation figure's legend: what each numbered mark, or each picture of a run, shows, its name
 * in bold and then what it means, such as **Tight, inside a group**: A title….
 */
function foundationLegend(page: PageReading, figure: FigureBlock, list: Tokens.List) {
  return list.items.map((item, index) => {
    const match = item.text.replace(/\s+/g, ' ').match(/^\*\*([^*]+)\*\*:?\s*(.*)$/);
    if (!match)
      page.problems.push(
        `item ${index + 1} of the legend of figure ${figure.name} must start with its name in bold, such as **Compact**: and what it means`,
      );
    return { name: match?.[1] ?? '', text: match?.[2]!.trim() ?? item.text };
  });
}

/**
 * A variants figure's legend: each variant's name in bold, labelling the example's items in order,
 * or the item a part reference names.
 */
function variantsLegend(page: PageReading, figure: ExampleBlock, list: Tokens.List) {
  return list.items.map((item, index) => {
    const label = item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
    if (!label)
      page.problems.push(
        `item ${index + 1} of the legend of variants ${figure.name} must start with the variant's name in bold, such as **Outline**`,
      );
    const part = item.text.match(/`(env-[^`]+)`/)?.[1] ?? '';
    for (const name of part.match(/env-[\w-]+/g) ?? [])
      if (!page.context.partNames.classes.has(name))
        page.problems.push(
          `item ${index + 1} of the legend of variants ${figure.name} names ${name}, which neither packages/ui's CSS nor docs/generated/parts.json has`,
        );
    return { part, text: item.text.replace(/\s+/g, ' ').trim(), label: label ?? '' };
  });
}

/** An anatomy figure's legend: one numbered part per item, by its class name. */
function anatomyLegend(page: PageReading, figure: ExampleBlock, list: Tokens.List) {
  return list.items.map((item, index) => {
    const part = item.text.match(/`(env-[^`]+)`/)?.[1];
    if (!part)
      page.problems.push(
        `item ${index + 1} of the legend of anatomy ${figure.name} names no part, such as \`env-button\``,
      );
    // The catalogue shows the part's name alone; its class names and props are for developers.
    const name = item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
    if (!name)
      page.problems.push(
        `item ${index + 1} of the legend of anatomy ${figure.name} must start with the part's name in bold, such as **Label**, which is all the catalogue shows of it`,
      );
    // Every class it names is one envUI styles or lists as a part.
    for (const name of (part ?? '').replace(/::text$/, '').match(/env-[\w-]+/g) ?? [])
      if (!page.context.partNames.classes.has(name))
        page.problems.push(
          `item ${index + 1} of the legend of anatomy ${figure.name} names ${name}, which neither packages/ui's CSS nor docs/generated/parts.json has`,
        );
    return {
      part: part ?? '',
      text: item.text.replace(/\s+/g, ' ').trim(),
      ...(name && { name }),
    };
  });
}

/** Places the figure a `tsx figure=Name` fence names, with the attributes `rest` gives it. */
function placeFigure(
  page: PageReading,
  current: ReadSection,
  token: Tokens.Code,
  name: string,
  rest: string,
) {
  const { problems } = page;
  const listed = page.context.catalog[name];
  if (page.placed.has(name)) problems.push(`figure ${name} is placed twice; place it once`);
  page.placed.add(name);
  if (!listed) {
    problems.push(`figure ${name} is not listed under examples in the frontmatter`);
    return;
  }
  if (listed.role === 'overview') {
    problems.push(
      `figure ${name} is an overview example, which the Overview shows from the frontmatter; don't place it`,
    );
    return;
  }
  if (token.text.trim())
    problems.push(`the fence of figure ${name} must be empty; the build fills in its file`);
  if (current.id === 'changelog')
    problems.push(`figure ${name} belongs in a section before the changelog`);
  if (page.foundation) {
    // A foundation's figure is the catalogue's own, from its page's preview, with the legend
    // that follows it; an example file of its name, where it has one, is its code.
    if (rest.trim()) problems.push(`figure ${name} takes no attributes on a foundation page`);
    const block: FigureBlock = {
      kind: 'figure',
      name,
      heading: page.subheading ?? fileWords(name),
      role: listed.role,
      ...(listed.caption && { caption: listed.caption }),
      ...(page.context.examples.has(name) && { code: true }),
    };
    current.blocks.push(block);
    page.legendOf = block;
    return;
  }
  const block = exampleFigure(page, name, listed, figureAttributesOf(page, name, listed, rest));
  current.blocks.push(block);
  if (listed.role === 'anatomy' || listed.role === 'variants') page.legendOf = block;
}

/**
 * The attributes on an example's figure fence, each checked against those its role takes: a value,
 * or true for a flag. The caption is the frontmatter's.
 */
function figureAttributesOf(page: PageReading, name: string, listed: ExampleEntry, rest: string) {
  const { problems } = page;
  const { role } = listed;
  const attributes: Record<string, string | true> = {};
  for (const [, key, value, quoted, plain] of rest.matchAll(
    /\s+([a-z]+)(=(?:"([^"]*)"|([^\s"]+)))?/g,
  )) {
    if (key === 'caption')
      problems.push(`figure ${name} has a caption on its fence; it goes under examples`);
    else if (!figureAttributes[role]!.allowed.includes(key!))
      problems.push(
        `${role} ${name} takes no ${key}${figureAttributes[role]!.allowed.length ? `; it takes ${figureAttributes[role]!.allowed.join(', ')}` : ''}`,
      );
    else if (figureFlags.has(key!) && value)
      problems.push(`${role} ${name} has ${key}${value}; write the flag ${key} alone`);
    else if (!figureFlags.has(key!) && !value)
      problems.push(`${role} ${name} has ${key} without a value; write ${key}="…"`);
    if (key! in attributes) problems.push(`${role} ${name} repeats ${key}`);
    attributes[key!] = value ? (quoted ?? plain)!.trim() : true;
  }
  delete attributes.caption;
  if (listed.caption) attributes.caption = listed.caption;
  for (const key of figureAttributes[role]!.required)
    if (!attributes[key]) problems.push(`${role} ${name} needs a ${key}, one sentence`);
  return attributes;
}

/** The block of an example's figure, from its attributes, each checked against the others. */
function exampleFigure(
  page: PageReading,
  name: string,
  listed: ExampleEntry,
  attributes: Record<string, string | true>,
): ExampleBlock {
  const { problems, document } = page;
  const { examples, specimens } = page.context;
  const { role } = listed;
  if (!examples.has(name))
    problems.push(`figure ${name} has no file apps/site/src/examples/${document.id}/${name}.tsx`);
  const caption = typeof attributes.caption === 'string' ? attributes.caption : undefined;
  const block: ExampleBlock = {
    kind: 'example',
    name,
    heading:
      role === 'do'
        ? `Do: ${caption}`
        : role === 'dont'
          ? `Don't: ${caption}`
          : role === 'caution'
            ? `Caution: ${caption}`
            : role === 'anatomy'
              ? `${document.title} anatomy`
              : role === 'variants'
                ? `${document.title} variants`
                : (page.subheading ?? fileWords(name)),
    ...(role !== 'example' && { role: role as ExampleBlock['role'] }),
    ...(caption && { caption }),
  };
  if (attributes.widths !== undefined) {
    const widths = String(attributes.widths)
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    if (!widths.length || widths.some((width) => !(width >= 10 && width <= 120)))
      problems.push(
        `example ${name} has widths="${attributes.widths}"; give widths in rem, from 10 to 120`,
      );
    block.widths = widths;
  }
  if (attributes.sweep === true) {
    if (!block.widths || block.widths.length < 2)
      problems.push(`example ${name} has sweep; give the widths it sweeps between, widths="30 16"`);
    else if (attributes.open === true)
      problems.push(`example ${name} has sweep and open; a sweeping frame shows no overlays open`);
    else block.sweep = true;
  }
  if (attributes.classes === true) {
    if (attributes.sweep !== true)
      problems.push(`example ${name} has classes without sweep; only a sweeping frame names them`);
    else block.classes = true;
  }
  if (attributes.fit === true) {
    if (attributes.sweep !== true)
      problems.push(
        `example ${name} has fit without sweep; only a sweeping frame is drawn smaller`,
      );
    else block.fit = true;
  }
  if (attributes.width !== undefined) {
    const width = Number(attributes.width);
    if (!(width >= 10 && width <= 120))
      problems.push(
        `${role} ${name} has width="${attributes.width}"; give one width in rem, from 10 to 120`,
      );
    block.width = width;
  }
  if (attributes.of !== undefined) block.of = String(attributes.of);
  if (typeof attributes.stage === 'string') {
    if (stageFills.includes(attributes.stage))
      block.stage = attributes.stage as ExampleBlock['stage'];
    else
      problems.push(
        `${role} ${name} has stage="${attributes.stage}"; a stage takes ${stageFills.map((fill) => `"${fill}"`).join(', ')}, or nothing for the stage in the page's color`,
      );
  }
  if (attributes.open === true) block.open = true;
  if (attributes.device !== undefined) {
    if (!deviceKinds.includes(String(attributes.device)))
      problems.push(
        `example ${name} has device="${attributes.device}"; a device is ${deviceKinds.map((kind) => `"${kind}"`).join(' or ')}`,
      );
    else if (attributes.widths !== undefined || attributes.open === true)
      problems.push(
        `example ${name} has device with widths or open; a device is one window of its own width, closed`,
      );
    else block.device = attributes.device as ExampleBlock['device'];
  }
  if (attributes.enlarge === true) block.enlarge = true;
  if (attributes.wide === true) block.wide = true;
  if (attributes.motion === true) block.motion = true;
  if (block.motion && !specimens.has(name))
    problems.push(
      `example ${name} has motion but no playback apps/site/src/specimens/${document.id}/${name}.tsx, named after it, to play it`,
    );
  if (attributes.specimen === true) block.specimen = true;
  if (block.specimen && !specimens.has(name))
    problems.push(
      `anatomy ${name} has specimen but no playback apps/site/src/specimens/${document.id}/${name}.tsx, named after it, to number`,
    );
  return block;
}

/**
 * What the page as a whole gets wrong once it is read: legends, required sections and
 * subsections, the examples its frontmatter lists, and Accessibility's and Changelog's contents.
 */
function pageProblems(page: PageReading) {
  const { document, sections, structure, codeTitle, codeOrder, foundation, placed } = page;
  const { catalog, examples, specimens, partNames } = page.context;
  const problems: string[] = [];
  // An anatomy figure without a legend numbers the parts parts.json lists for its component; a
  // variants figure needs one, the names of its variants.
  for (const section of sections)
    for (const block of section.blocks)
      if (block.kind !== 'example' && block.kind !== 'figure') continue;
      else if (block.role === 'variants' && !block.legend)
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
  for (const [name, { role, open, stage, motion, wide, device }] of entries) {
    if (foundation && (open || stage || motion || wide || device))
      problems.push(
        `figure ${name} takes no open, stage, motion, wide or device on a foundation page`,
      );
    if (role !== 'overview' && !placed.has(name))
      problems.push(`example ${name} is listed in the frontmatter but placed nowhere`);
    if (!foundation && !examples.has(name))
      problems.push(
        `example ${name} has no file apps/site/src/examples/${document.id}/${name}.tsx`,
      );
    if (role === 'overview' && motion && !specimens.has(name))
      problems.push(
        `example ${name} has motion but no playback apps/site/src/specimens/${document.id}/${name}.tsx, named after it, to play it`,
      );
  }
  // A foundation's example file is the code of its figure of the same name.
  if (foundation)
    for (const name of examples)
      if (!catalog[name])
        problems.push(
          `apps/site/src/examples/${document.id}/${name}.tsx is no figure's code: name it after the figure it shows`,
        );
  if (!foundation) {
    if (!entries.some(([, { role }]) => role === 'overview'))
      problems.push('the frontmatter lists no overview example, which shows what it is');
    const accessibility = sections.find((item) => item.id === 'accessibility');
    if (!accessibility)
      problems.push('"## Accessibility" is required, with what envUI and you provide');
    else problems.push(...accessibilityProblems(accessibility.tokens));
  }
  const changelog = sections.find((item) => item.id === 'changelog');
  if (changelog) problems.push(...changelogProblems(changelog.tokens));
  return problems;
}

/**
 * The page's sections, after the Overview: the frontmatter's overview examples, side by side, the
 * first named after the page.
 */
function withOverview({ document, sections, foundation, context }: PageReading): PageSection[] {
  const result = sections.map(({ id, title, blocks }) => ({ id, title, blocks }));
  const overviews = Object.entries(context.catalog).filter(([, { role }]) => role === 'overview');
  if (!overviews.length) return result;
  const overview = {
    id: 'overview',
    title: 'Overview',
    blocks: [
      { kind: 'markdown' as const, markdown: '## Overview\n\n' },
      ...(overviews.map(([name, { caption, open, stage, motion, wide, device }], index) => ({
        kind: foundation ? 'figure' : 'example',
        name,
        heading: index === 0 ? document.title : fileWords(name),
        ...(caption && { caption }),
        ...(open && { open: true }),
        ...(stage && { stage }),
        ...(motion && { motion: true }),
        ...(wide && { wide: true }),
        ...(device && { device: device as ExampleBlock['device'] }),
      })) as DocumentationBlock[]),
    ],
  };
  return [overview, ...result];
}
