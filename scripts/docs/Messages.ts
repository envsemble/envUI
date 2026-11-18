import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { librarySourceDirectory } from '../RepositoryPaths.ts';

const messagesDirectory = resolve(librarySourceDirectory, 'foundations/messages');

interface MessageString {
  namespace: string;
  key: string;
  value: string;
  description: string;
}

export interface MessageNamespace {
  namespace: string;
  components: string[];
  strings: MessageString[];
}

const docText = (node: ts.Node) =>
  ts
    .getJSDocCommentsAndTags(node)
    .map((doc) =>
      typeof doc.comment === 'string' ? doc.comment : (ts.getTextOfJSDocComment(doc.comment) ?? ''),
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

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

export function stringsOf(components: readonly string[], namespaces = readMessages()) {
  return namespaces.filter((entry) => entry.components.some((name) => components.includes(name)));
}

const cell = (text: string) => text.replaceAll('|', '\\|').replace(/\s+/g, ' ');

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
