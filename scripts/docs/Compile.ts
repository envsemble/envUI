import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { readDocumentation } from './Read.ts';
import {
  contributorPages,
  documentationDirectory,
  examplesDirectory,
  examplesOf,
  linkContributorPages,
  pageKindOf,
  readProps,
} from './Schema.ts';
import { cell, fenceFor } from './Validate.ts';

/** Every runtime export a page documents, with namespaces expanded to their parts. */
export function documentedExports(names, props) {
  return names.flatMap((name) => {
    const entry = props?.exports[name];
    if (!entry) return [];
    return entry.kind === 'namespace' ? [name, ...entry.parts] : [name];
  });
}

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
