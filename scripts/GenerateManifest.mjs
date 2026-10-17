// Generates the files agents read from the package, all from the documentation's own sources: the
// index and each page's frontmatter (docs/), the generated props (docs/generated/props.json), the
// example files (apps/catalogue/src/examples) and the token list
// (packages/ui/src/generated/tokens.json).
//
//   node scripts/GenerateManifest.mjs           rewrite docs/generated/manifest.json and llms.txt
//   node scripts/GenerateManifest.mjs --check   fail when either differs from its sources
//
// manifest.json lists every component page with its summary, aliases, when to use it and what to
// use instead, its exports with their import path and props, and its examples; the other pages
// (guides, foundations, patterns and templates); every runtime export; and the tokens. llms.txt is
// the llmstxt.org index of the documentation. Both are committed, so a change to a source shows up
// in review, and the package build copies them to the package root beside llms-full.txt, every
// compiled page in one file. The `npx --no envui agents` index and the `envui mcp` server read the
// installed manifest, so they always describe the installed version.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compileDocument,
  documentationDirectory,
  documentedExports,
  examplesDirectory,
  intents,
  pageKindOf,
  readDocumentation,
  readProps,
} from './GenerateDocumentation.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export const manifestFile = resolve(root, 'docs/generated/manifest.json');
export const llmsFile = resolve(root, 'docs/generated/llms.txt');
const tokensFile = resolve(root, 'packages/ui/src/generated/tokens.json');

export const manifestSchemaVersion = 1;
const packageName = '@envsemble/envui';

/** Index groups that are not component categories, and the manifest list each one fills. */
const pageKinds = {
  'Setup and workflows': 'guides',
  Foundations: 'foundations',
  Patterns: 'patterns',
  Templates: 'templates',
};

/** Markdown reduced to one line of plain text: links keep their text, emphasis goes. */
const plain = (markdown) =>
  markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/\s+/g, ' ')
    .trim();

/** The text after the last `###` heading of a Markdown block, as one line. */
function exampleDescription(markdown) {
  const lines = (markdown ?? '').split('\n');
  const start = lines.findLastIndex((line) => /^###\s/.test(line));
  if (start === -1) return '';
  return plain(lines.slice(start + 1).join('\n'));
}

/** Pages a Markdown page links to, by id, in order. */
function linkedPages(markdown, documents) {
  const ids = [];
  for (const [, href] of markdown.matchAll(/\]\(([^)#\s]+\.md)(?:#[^)]*)?\)/g)) {
    const id = href.split('/').at(-1).slice(0, -'.md'.length);
    if (documents.some((document) => document.id === id) && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * The files a page shows of a kind, example or template, each with its title, what it shows and
 * its packaged path; a template's screen also with its frame and whether it is the page's main one.
 */
function filesOf(document, kind) {
  const items = [];
  for (const section of document.sections ?? [])
    section.blocks.forEach((block, index) => {
      if (block.kind !== kind) return;
      const before = section.blocks[index - 1];
      const primary = section.id === 'overview';
      items.push({
        name: block.name,
        title: block.heading,
        description: primary
          ? document.summary
          : exampleDescription(before?.kind === 'markdown' ? before.markdown : ''),
        file: `docs/examples/${document.id}/${block.name}.tsx`,
        ...(kind === 'template' && { frame: block.frame, primary }),
      });
    });
  return items;
}

/** The scales every template is shown and tested in. */
const templateScales = ['comfortable', 'compact'];

/** A pattern or template page as the manifest lists it, from its frontmatter and files. */
function compositionEntry(document, kind, doc) {
  const { frontmatter } = document;
  return {
    name: document.id,
    title: document.title,
    group: document.group,
    ...(kind === 'pattern' && { intent: frontmatter.intent }),
    status: frontmatter.status,
    since: frontmatter.since,
    summary: document.summary,
    aliases: frontmatter.aliases,
    useWhen: frontmatter.useWhen,
    avoidWhen: frontmatter.avoidWhen,
    composes: frontmatter.composes,
    related: document.related,
    doc,
    ...(kind === 'template' && {
      frame: frontmatter.frame,
      scales: templateScales,
      files: filesOf(document, 'template'),
    }),
    examples: filesOf(document, 'example'),
  };
}

/**
 * An export as the manifest lists it: where to import it from, its TSDoc, its props or signature,
 * and the page that documents it.
 */
function exportEntry(entry, home, aliases) {
  const item = {
    kind: entry.kind,
    import: entry.entries[0],
    ...(entry.entries.length > 1 && { alsoFrom: entry.entries.slice(1) }),
    description: entry.description,
  };
  if (entry.deprecated) item.deprecated = entry.deprecated;
  if (entry.kind === 'namespace') item.parts = entry.parts;
  if (entry.kind === 'function') item.signature = entry.signature;
  if (entry.kind === 'component') {
    item.props = entry.props;
    item.native = entry.native;
  }
  if (aliases?.length) item.aliases = aliases;
  if (home?.status) item.status = home.status;
  item.page = home?.page ?? null;
  item.doc = home?.doc ?? null;
  return item;
}

/** One value when every theme agrees, otherwise the value per theme. */
function tokenValues(token, themes) {
  const resolved = themes.map((theme) => token.values[theme]?.resolved);
  const same = resolved.every((value) => JSON.stringify(value) === JSON.stringify(resolved[0]));
  return same
    ? { value: resolved[0] }
    : { values: Object.fromEntries(themes.map((theme, index) => [theme, resolved[index]])) };
}

/**
 * The tokens: current names with their values per theme and scale, and every name before 1.0 (the
 * 0.x names and the unprefixed ones of 1.0's development) with what replaces it, from the token
 * migration map beside the token list.
 */
function readTokens(file = tokensFile) {
  const tokens = JSON.parse(readFileSync(file, 'utf8'));
  const themes = tokens.themes.map((theme) => theme.name);
  const items = [];
  for (const token of tokens.tokens) {
    const item = {
      id: token.id,
      cssVariable: token.cssVariable,
      type: token.type,
      ...(token.description && { description: token.description }),
      ...tokenValues(token, themes),
    };
    for (const [scale, value] of Object.entries(token.scales ?? {})) item[scale] = value.resolved;
    if (token.deprecated) item.deprecated = token.deprecated;
    items.push(item);
  }
  const migrationFile = resolve(file, '../token-migration.json');
  const migration = existsSync(migrationFile)
    ? JSON.parse(readFileSync(migrationFile, 'utf8')).names
    : {};
  const typeOf = new Map(tokens.tokens.map((token) => [token.id, token.type]));
  const legacy = Object.entries(migration).map(([name, entry]) => ({
    cssVariable: name,
    ...(entry.cssVariable && { use: entry.cssVariable }),
    ...(entry.value && { value: entry.value }),
    ...(entry.kind === 'removed' && { removed: true }),
    ...((entry.token || entry.kind === 'fixed') && {
      type: entry.token ? typeOf.get(entry.token) : 'color',
    }),
    ...(entry.note && { note: entry.note }),
  }));
  return {
    themes,
    scales: tokens.scales.map((scale) => scale.name),
    usage:
      'Use a token through its CSS custom property, such as var(--env-color-fg-muted), in CSS that styles the application. envUI components already use them; never restyle their classes.',
    items,
    legacy,
  };
}

/** The manifest, from the documentation, the props, the example files and the tokens. */
export function buildManifest({
  directory = documentationDirectory,
  props = readProps(directory),
  examples = examplesDirectory,
  tokens = tokensFile,
} = {}) {
  const documents = readDocumentation(directory, { props, examples });
  const components = [];
  const pages = { guides: [], foundations: [], patterns: [], templates: [] };
  const exportPages = new Map();
  const exportAliases = new Map();
  for (const document of documents) {
    if (document.id === 'index') continue;
    const doc = `docs/${document.path}`;
    const kind = pageKindOf(document.path);
    if (kind === 'pattern' || kind === 'template') {
      pages[`${kind}s`].push(compositionEntry(document, kind, doc));
      continue;
    }
    if (!document.path.startsWith('components/')) {
      const kind = pageKinds[document.group] ?? 'guides';
      pages[kind].push({
        name: document.id,
        title: document.title,
        group: document.group,
        summary: document.summary,
        doc,
        ...(document.frontmatter?.components && { exports: document.frontmatter.components }),
        ...(document.frontmatter?.aliases && { aliases: document.frontmatter.aliases }),
        related: linkedPages(document.markdown, documents),
      });
      for (const name of documentedExports(document.frontmatter?.components ?? [], props))
        if (!exportPages.has(name)) exportPages.set(name, { page: document.id, doc });
      for (const [name, aliases] of Object.entries(document.frontmatter?.exportAliases ?? {}))
        exportAliases.set(name, aliases);
      continue;
    }
    const { frontmatter } = document;
    const names = documentedExports(frontmatter.components, props);
    // Each export takes its page's status, or its own where `statuses` sets one; a part takes its
    // namespace's.
    const statusOf = (name) =>
      frontmatter.statuses?.[name] ??
      frontmatter.statuses?.[name.split('.')[0]] ??
      frontmatter.status;
    for (const name of names)
      exportPages.set(name, { page: document.id, doc, status: statusOf(name) });
    const exampleItems = filesOf(document, 'example');
    components.push({
      name: document.title,
      page: document.id,
      doc,
      category: frontmatter.category,
      status: frontmatter.status,
      ...(frontmatter.statuses && { statuses: frontmatter.statuses }),
      since: frontmatter.since,
      summary: document.summary,
      aliases: frontmatter.aliases,
      useWhen: frontmatter.useWhen ?? [],
      avoidWhen: frontmatter.avoidWhen ?? [],
      related: document.related,
      exports: names,
      examples: exampleItems,
    });
  }
  // Each component page leads to the patterns and templates that compose its exports.
  for (const component of components) {
    const names = new Set(component.exports.map((name) => name.split('.')[0]));
    const using = (list) =>
      list.filter((page) => page.composes.some((name) => names.has(name))).map(({ name }) => name);
    component.usedIn = { patterns: using(pages.patterns), templates: using(pages.templates) };
  }
  const exportIndex = Object.fromEntries(
    Object.entries(props.exports).map(([name, entry]) => [
      name,
      exportEntry(entry, exportPages.get(name), exportAliases.get(name)),
    ]),
  );
  return {
    $comment:
      'Generated by scripts/GenerateManifest.mjs from docs/, docs/generated/props.json, the example files and the tokens; do not edit. Paths are relative to the package root.',
    schemaVersion: manifestSchemaVersion,
    package: packageName,
    rule: 'Search envUI before writing any UI element; propose an envUI addition instead of a local copy.',
    files: {
      index: 'docs/index.md',
      llms: 'llms.txt',
      llmsFull: 'llms-full.txt',
      props: 'docs/generated/props.json',
      icons: 'icon-manifest.json',
    },
    imports: {
      entryPoints: [...new Set(Object.values(props.exports).flatMap((entry) => entry.entries))],
      styles: `${packageName}/styles.css`,
      icons: `${packageName}/icons/<Name>`,
    },
    categories: [
      ...new Set(documents.filter((d) => d.path.startsWith('components/')).map((d) => d.group)),
    ],
    intents,
    components,
    ...pages,
    exports: exportIndex,
    tokens: readTokens(tokens),
  };
}

export function serializeManifest(manifest) {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

/** The llmstxt.org index of the documentation, with paths relative to the package root. */
export function renderLlmsText(manifest) {
  const lines = [
    '# envUI',
    '',
    `> ${manifest.package}: a React 19 design system of components, tokens and patterns for product interfaces. These files describe the installed version; paths are relative to the package root.`,
    '',
    `${manifest.rule} Each component page has when to use it and what to use instead, accessibility, examples as source and props generated from the TypeScript declarations. manifest.json holds the same as data, and \`npx --no envui mcp\` serves it to agents over MCP.`,
    '',
  ];
  const section = (title, items) => {
    if (!items.length) return;
    lines.push(`## ${title}`, '');
    for (const item of items) lines.push(item);
    lines.push('');
  };
  const page = (item) => `- [${item.title}](${item.doc}): ${item.summary}`;
  section('Setup and workflows', manifest.guides.map(page));
  section('Foundations', manifest.foundations.map(page));
  for (const category of manifest.categories)
    section(
      `Components: ${category}`,
      manifest.components
        .filter((component) => component.category === category)
        .map((component) => {
          const names = component.exports.filter((name) => !name.includes('.'));
          const others = names.filter((name) => name !== component.name);
          return `- [${component.name}](${component.doc}): ${component.summary}${
            others.length ? ` Also: ${others.join(', ')}.` : ''
          }`;
        }),
    );
  for (const intent of manifest.intents)
    section(
      `Patterns: ${intent}`,
      manifest.patterns.filter((pattern) => pattern.intent === intent).map(page),
    );
  section(
    'Templates',
    manifest.templates.map(
      (template) =>
        `${page(template)} (${template.frame === 'app' ? 'inside the app frame' : 'a whole screen'})`,
    ),
  );
  section('Optional', [
    '- [Full documentation](llms-full.txt): every page above in one file, with examples and props.',
    '- [Manifest](manifest.json): components, exports, props, examples, patterns and tokens as JSON.',
    '- [Props](docs/generated/props.json): the props of every export.',
    '- [Icons](icon-manifest.json): every icon, imported from `@envsemble/envui/icons/<Name>`.',
  ]);
  return `${lines.join('\n').replace(/\n+$/, '')}\n`;
}

/**
 * Every compiled page in one file, in the index's order, for agents that read the documentation
 * whole. Frontmatter becomes a summary line; the manifest carries the rest of it.
 */
export function renderLlmsFull(
  manifest,
  {
    directory = documentationDirectory,
    props = readProps(directory),
    examples = examplesDirectory,
  } = {},
) {
  const documents = readDocumentation(directory, { props, examples });
  const parts = [
    `# envUI documentation\n\n> Every page of the ${manifest.package} documentation in one file, in the order of docs/index.md. Each page starts with a comment naming its file.\n`,
  ];
  for (const document of documents) {
    if (document.id === 'index') continue;
    const compiled = compileDocument(document, documents, { props, examples });
    const body = compiled.replace(/^---\n[\s\S]*?\n---\n\n/, '').replace(/^# [^\n]+\n+/, '');
    const component = manifest.components.find((item) => item.page === document.id);
    const head = [`<!-- docs/${document.path} -->`, '', `# ${document.title}`, ''];
    if (document.summary) head.push(`> ${document.summary}`, '');
    const composition = [...manifest.patterns, ...manifest.templates].find(
      (item) => item.name === document.id,
    );
    if (composition)
      head.push(
        `Status: ${composition.status}. Since: ${composition.since}.${composition.intent ? ` Intent: ${composition.intent}.` : ''}${composition.frame ? ` Frame: ${composition.frame === 'app' ? 'inside the app frame' : 'a whole screen'}.` : ''} Built from: ${composition.composes.join(', ')}.`,
        '',
      );
    if (component) {
      const byImport = new Map();
      for (const name of component.exports.filter((entry) => !entry.includes('.'))) {
        const from = manifest.exports[name].import;
        byImport.set(from, [...(byImport.get(from) ?? []), name]);
      }
      head.push(
        `Status: ${component.status}${
          component.statuses
            ? ` (${Object.entries(component.statuses)
                .map(([name, status]) => `${name}: ${status}`)
                .join(', ')})`
            : ''
        }. Since: ${component.since}. ${[...byImport]
          .map(([from, names]) => `\`import { ${names.join(', ')} } from '${from}'\``)
          .join('; ')}.`,
        '',
      );
    }
    parts.push(`${head.join('\n')}${body}`);
  }
  return `${parts.join('\n')}`.replace(/\n*$/, '\n');
}

/**
 * Writes the agent files of the package root: manifest.json with the package version, llms.txt
 * and llms-full.txt.
 */
export function writeAgentFiles(outputDirectory, { version }) {
  const manifest = buildManifest();
  const { $comment, schemaVersion, package: name, ...rest } = manifest;
  const packaged = { $comment, schemaVersion, package: name, version, ...rest };
  writeFileSync(resolve(outputDirectory, 'manifest.json'), serializeManifest(packaged));
  writeFileSync(resolve(outputDirectory, 'llms.txt'), renderLlmsText(manifest));
  writeFileSync(resolve(outputDirectory, 'llms-full.txt'), renderLlmsFull(manifest));
  return packaged;
}

/** The committed files and what their sources produce now. */
export function generatedAgentFiles() {
  const manifest = buildManifest();
  return [
    { file: manifestFile, contents: serializeManifest(manifest) },
    { file: llmsFile, contents: renderLlmsText(manifest) },
  ];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const stale = [];
  for (const { file, contents } of generatedAgentFiles()) {
    const current = existsSync(file) ? readFileSync(file, 'utf8') : undefined;
    if (current === contents) continue;
    if (check) stale.push(file);
    else {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, contents);
    }
  }
  const names = ['docs/generated/manifest.json', 'docs/generated/llms.txt'];
  if (check) {
    if (stale.length) {
      console.error(
        `${names.join(' and ')} differ from the documentation, props, examples or tokens. Run \`npm run docs:manifest\` and commit the result.`,
      );
      process.exit(1);
    }
    console.log(`${names.join(' and ')} match their sources.`);
  } else console.log(`Generated ${names.join(' and ')}.`);
}
