// envUI's built-in strings, read from packages/ui/src/foundations/messages: each namespace's keys,
// their English defaults and what each names, and the components that show them, from the
// sentence that opens each module ("The English defaults of the `alert` messages: Alert."). The
// generated documentation gives each component's page its Strings, so no page writes them.
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const messagesDirectory = fileURLToPath(
  new URL('../../packages/ui/src/foundations/messages/', import.meta.url),
);

/** One string of a namespace: its key, its English default and what it names. */
interface MessageString {
  namespace: string;
  key: string;
  /** The default as written, or for a function of values, the values it names. */
  value: string;
  description: string;
}

/** A namespace of messages and the exports that show its strings. */
export interface MessageNamespace {
  namespace: string;
  components: string[];
  strings: MessageString[];
}

/** A node's TSDoc comment as one line of text. */
const docText = (node: ts.Node) =>
  ts
    .getJSDocCommentsAndTags(node)
    .map((doc) =>
      typeof doc.comment === 'string' ? doc.comment : (ts.getTextOfJSDocComment(doc.comment) ?? ''),
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

/** The value of a message as the docs show it: the string, or the values a function takes. */
function valueOf(node: ts.Expression, source: ts.SourceFile): string {
  if (ts.isStringLiteralLike(node)) return JSON.stringify(node.text);
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    const [parameter] = node.parameters;
    if (parameter && ts.isObjectBindingPattern(parameter.name))
      return `({ ${parameter.name.elements.map((element) => element.name.getText(source)).join(', ')} }) => string`;
    return '() => string';
  }
  return node.getText(source);
}

/** Every namespace of envUI's messages, in file order, with the exports that show it. */
export function readMessages(directory = messagesDirectory): MessageNamespace[] {
  const namespaces: MessageNamespace[] = [];
  for (const file of readdirSync(directory)
    .filter((name) => name.endsWith('.ts'))
    .sort()) {
    const path = resolve(directory, file);
    const source = ts.createSourceFile(
      path,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
        continue;
      const [declaration] = statement.declarationList.declarations;
      if (!declaration?.initializer || !ts.isObjectLiteralExpression(declaration.initializer))
        continue;
      const lead = docText(statement).match(/messages: (.*?)\./)?.[1] ?? '';
      if (!/^The English defaults of/.test(docText(statement))) continue;
      const namespace = declaration.name.getText(source);
      const components = [...new Set(lead.match(/\b[A-Z][A-Za-z]+\b/g) ?? [])].filter(
        (name) => name !== 'The' && name !== 'Words',
      );
      const strings = declaration.initializer.properties.flatMap((property) =>
        ts.isPropertyAssignment(property)
          ? [
              {
                namespace,
                key: property.name.getText(source),
                value: valueOf(property.initializer, source),
                description: docText(property),
              },
            ]
          : [],
      );
      namespaces.push({ namespace, components, strings });
    }
  }
  return namespaces;
}

/** The strings the exports a page documents show, by namespace. */
export function stringsOf(components: readonly string[], namespaces = readMessages()) {
  return namespaces.filter((entry) => entry.components.some((name) => components.includes(name)));
}

const cell = (text: string) => text.replaceAll('|', '\\|').replace(/\s+/g, ' ');

/**
 * The generated Strings section of a page, as Markdown: each key under EnvUIProvider's `messages`,
 * its English default and what it names.
 */
export function renderStrings(components: readonly string[], namespaces = readMessages()) {
  const found = stringsOf(components, namespaces);
  if (!found.length) return '';
  const lines = [
    '## Strings',
    '',
    "EnvUIProvider's `messages` overrides each, and a component's own label prop wins over it.",
    '',
    '| Key | Default | Names |',
    '| --- | --- | --- |',
  ];
  for (const entry of found)
    for (const string of entry.strings)
      lines.push(
        `| \`messages.${string.namespace}.${string.key}\` | \`${cell(string.value)}\` | ${cell(string.description)} |`,
      );
  return `${lines.join('\n')}\n`;
}
