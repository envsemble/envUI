import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

export const documentationDirectory = fileURLToPath(new URL('../docs/', import.meta.url));
const generatedFile = fileURLToPath(
  new URL('../apps/catalogue/src/generated/Documentation.ts', import.meta.url),
);

/** The Markdown index supplies discovery, catalogue groups and ordering. */
export function readDocumentation(directory = documentationDirectory) {
  const index = readFileSync(resolve(directory, 'index.md'), 'utf8');
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
  let group;
  for (const token of marked.lexer(index)) {
    if (token.type === 'heading' && token.depth === 2) group = token.text;
    if (token.type !== 'list') continue;
    if (!group) throw new Error('Documentation entries need a level-two family heading.');
    for (const item of token.items) {
      const entry = item.text.match(/^\[([^\]]+)\]\(([^)]+\.md)\) — ([\s\S]+)$/);
      if (!entry) throw new Error(`Invalid documentation index entry: ${item.text}`);
      const [, title, path, summary] = entry;
      const file = resolve(directory, path);
      const contained = relative(directory, file);
      if (contained.startsWith('..') || isAbsolute(contained))
        throw new Error(`Documentation entry escapes docs/: ${path}`);
      if (documents.some((document) => document.path === path))
        throw new Error(`Duplicate documentation entry: ${path}`);
      const source = readFileSync(file, 'utf8');
      if (!source.startsWith(`# ${title}\n`) && !source.startsWith(`# ${title}\r\n`))
        throw new Error(`Documentation title differs from its index entry: ${path}`);
      documents.push({
        id: basename(path, '.md'),
        title,
        group,
        path,
        summary: summary.replace(/\s+/g, ' ').trim(),
        related: [],
        markdown: source.replace(/^# [^\n]+\r?\n\s*/, ''),
      });
    }
  }
  for (const document of documents) {
    let related = false;
    for (const token of marked.lexer(document.markdown)) {
      if (token.type === 'heading' && token.depth === 2) related = token.text === 'Related topics';
      if (related && token.type === 'list') {
        marked.walkTokens([token], (link) => {
          if (link.type === 'link') document.related.push(basename(link.href, '.md'));
        });
      }
    }
    marked.walkTokens(marked.lexer(document.markdown), (token) => {
      if (token.type !== 'link' || /^(?:[a-z][a-z\d+.-]*:|#)/i.test(token.href)) return;
      const path = token.href.split('#')[0];
      const target = resolve(directory, dirname(document.path), path);
      const contained = relative(directory, target);
      if (contained.startsWith('..') || isAbsolute(contained) || !existsSync(target))
        throw new Error(`Broken documentation link in ${document.path}: ${token.href}`);
      if (!documents.some((entry) => entry.path === contained.replaceAll('\\', '/')))
        throw new Error(`Documentation link is missing from the index: ${token.href}`);
    });
  }
  return documents;
}

export function generateDocumentation() {
  const documents = readDocumentation();
  const source = `// Generated from docs/index.md and its pages; edit the Markdown sources.\nexport const documents = ${JSON.stringify(documents, null, 2)};\n`;
  mkdirSync(dirname(generatedFile), { recursive: true });
  if (!existsSync(generatedFile) || readFileSync(generatedFile, 'utf8') !== source)
    writeFileSync(generatedFile, source);
  return documents;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(
    `Prepared ${generateDocumentation().length} indexed Markdown documents for the catalogue.`,
  );
}
