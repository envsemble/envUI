import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked, type Token, type Tokens } from 'marked';
import type { DocumentationBlock } from '../../apps/site/src/DocumentationTypes.ts';
import { optionTable, optionTableProblems } from '../../apps/site/src/shared/CatalogueContent.ts';
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
} from './Schema.ts';

/** A figure of a foundation's page, or an example file placed as a figure. */
type FigureBlock = Extract<DocumentationBlock, { kind: 'figure' }>;
type ExampleBlock = Extract<DocumentationBlock, { kind: 'example' }>;

/** A section of a page as readPage builds it: its blocks, and in Compose its tokens. */
export interface ReadSection {
  id: string;
  title: string;
  blocks: DocumentationBlock[];
  tokens: Token[];
}

/** The part names readPartNames finds: every class, and each component's parts. */
export interface PartNames {
  classes: Set<string>;
  components: Record<string, string[]>;
}

export const cell = (text: unknown) =>
  String(text).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

export function validateFrontmatter(frontmatter, path, { kind, versions }) {
  const problems: string[] = [];
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
  const problems: string[] = [];
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
    allowed: ['widths', 'sweep', 'classes', 'fit', 'open', 'stage', 'wide'],
    required: [],
  },
  do: { allowed: ['open', 'stage'], required: ['caption'] },
  dont: { allowed: ['open', 'stage'], required: ['caption'] },
  anatomy: { allowed: ['of', 'open', 'stage', 'enlarge', 'width'], required: [] },
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
 * it needs the room, such as a popup open beside its trigger. With `widths`, `sweep` shows one
 * frame whose width sweeps between them and back, `classes` names the window class on its ruler,
 * and `fit` draws the frame smaller where it must to reach its widest width on the stage.
 */
const figureFlags = new Set(['open', 'enlarge', 'wide', 'sweep', 'classes', 'fit']);
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

/**
 * The sections of a page in the one-file structure, each with its blocks: Markdown, figures with
 * their legends, specimens and, in Compose, examples shown as code. It checks the structure: the
 * sections pageSections knows, once each, in its order, with Rules; every example the frontmatter
 * lists placed once, but the overview's, which the generated Overview shows; and on a component or
 * a pattern, an overview example and Accessibility's lists. A foundation's figures are the
 * catalogue's (previews/foundations), not example files.
 */
export function readPage(
  document: { id: string; path: string; title: string },
  body: string,
  {
    kind,
    catalog,
    examples,
    specimens,
    partNames,
  }: {
    kind: string;
    catalog: Record<string, ExampleEntry>;
    examples: Set<string>;
    specimens: Set<string>;
    partNames: PartNames;
  },
) {
  const tokens = marked.lexer(body);
  if (tokens.map((token) => token.raw).join('') !== body)
    throw new Error(`Could not split ${document.path} into sections.`);
  const foundation = kind === 'foundation';
  const structure = pageSections.map((item) => ({
    ...item,
    title: (foundation && item.foundationTitle) || item.title,
  }));
  const codeTitle = structure.find((item) => item.id === 'code')!.title;
  const placed = new Set<string>();
  const sections: ReadSection[] = [];
  const problems: string[] = [];
  let current: ReadSection | undefined;
  let subheading: string | undefined;
  /** The figure an ordered list right after it is the legend of. */
  let legendOf: FigureBlock | ExampleBlock | undefined;
  /** The `###` subsections of Compose so far, by their index in codeSubsections. */
  const codeOrder: number[] = [];
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
            `source ${name} has no file apps/site/src/examples/${document.id}/${name}.tsx`,
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
    const title = current.title;
    if (options)
      problems.push(...optionTableProblems(options).map((problem) => `${title}: ${problem}`));
    if (legendOf?.kind === 'figure' && token.type === 'list' && token.ordered) {
      // A foundation figure's legend: what each numbered mark, or each picture of a run, shows,
      // its name in bold and then what it means, such as **Tight, inside a group**: A title….
      const figure = legendOf;
      figure.legend = token.items.map((item, index) => {
        const match = item.text.replace(/\s+/g, ' ').match(/^\*\*([^*]+)\*\*:?\s*(.*)$/);
        if (!match)
          problems.push(
            `item ${index + 1} of the legend of figure ${figure.name} must start with its name in bold, such as **Compact**: and what it means`,
          );
        return { name: match?.[1] ?? '', text: match?.[2].trim() ?? item.text };
      });
      legendOf = undefined;
      continue;
    }
    if (legendOf?.role === 'variants' && token.type === 'list' && token.ordered) {
      // A variants figure's legend: each variant's name in bold, labelling the example's items in
      // order, or the item a part reference names.
      const figure = legendOf;
      figure.legend = token.items.map((item, index) => {
        const label = item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
        if (!label)
          problems.push(
            `item ${index + 1} of the legend of variants ${figure.name} must start with the variant's name in bold, such as **Outline**`,
          );
        const part = item.text.match(/`(env-[^`]+)`/)?.[1] ?? '';
        for (const name of part.match(/env-[\w-]+/g) ?? [])
          if (!partNames.classes.has(name))
            problems.push(
              `item ${index + 1} of the legend of variants ${figure.name} names ${name}, which neither packages/ui's CSS nor docs/generated/parts.json has`,
            );
        return { part, text: item.text.replace(/\s+/g, ' ').trim(), label: label ?? '' };
      });
      legendOf = undefined;
      continue;
    }
    if (legendOf && token.type === 'list' && token.ordered) {
      // The anatomy figure's legend: one numbered part per item, by its class name.
      const figure = legendOf;
      figure.legend = token.items.map((item, index) => {
        const part = item.text.match(/`(env-[^`]+)`/)?.[1];
        if (!part)
          problems.push(
            `item ${index + 1} of the legend of anatomy ${figure.name} names no part, such as \`env-button\``,
          );
        // The catalogue shows the part's name alone; its class names and props are for
        // developers.
        const name = item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
        if (!name)
          problems.push(
            `item ${index + 1} of the legend of anatomy ${figure.name} must start with the part's name in bold, such as **Label**, which is all the catalogue shows of it`,
          );
        // Every class it names is one envUI styles or lists as a part.
        for (const name of (part ?? '').replace(/::text$/, '').match(/env-[\w-]+/g) ?? [])
          if (!partNames.classes.has(name))
            problems.push(
              `item ${index + 1} of the legend of anatomy ${figure.name} names ${name}, which neither packages/ui's CSS nor docs/generated/parts.json has`,
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
      if ((token as Tokens.Code).text.trim())
        problems.push(`the fence of figure ${name} must be empty; the build fills in its file`);
      if (current!.id === 'changelog')
        problems.push(`figure ${name} belongs in a section before the changelog`);
      if (foundation) {
        // A foundation's figure is the catalogue's own, from its page's preview, with the legend
        // that follows it; it has no example file.
        if (rest.trim()) problems.push(`figure ${name} takes no attributes on a foundation page`);
        const block: FigureBlock = {
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
      const attributes: Record<string, string | true> = {};
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
          `figure ${name} has no file apps/site/src/examples/${document.id}/${name}.tsx`,
        );
      const caption = typeof attributes.caption === 'string' ? attributes.caption : undefined;
      const block: ExampleBlock = {
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
          problems.push(
            `example ${name} has sweep; give the widths it sweeps between, widths="30 16"`,
          );
        else if (attributes.open === true)
          problems.push(
            `example ${name} has sweep and open; a sweeping frame shows no overlays open`,
          );
        else block.sweep = true;
      }
      if (attributes.classes === true) {
        if (attributes.sweep !== true)
          problems.push(
            `example ${name} has classes without sweep; only a sweeping frame names them`,
          );
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
      if (attributes.enlarge === true) block.enlarge = true;
      if (attributes.wide === true) block.wide = true;
      blocks.push(block);
      if (role === 'anatomy' || role === 'variants') legendOf = block;
      continue;
    }
    if (token.type === 'html' && specimenPattern.test(token.raw.trim())) {
      const name = token.raw.trim().match(specimenPattern)![1]!;
      if (!specimens.has(name))
        problems.push(
          `specimen ${name} has no file apps/site/src/specimens/${document.id}/${name}.tsx`,
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
  for (const [name, { role, open, stage }] of entries) {
    if (foundation && (open || stage))
      problems.push(`figure ${name} takes no open or stage on a foundation page`);
    if (role !== 'overview' && !placed.has(name))
      problems.push(`example ${name} is listed in the frontmatter but placed nowhere`);
    if (!foundation && !examples.has(name))
      problems.push(
        `example ${name} has no file apps/site/src/examples/${document.id}/${name}.tsx`,
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
