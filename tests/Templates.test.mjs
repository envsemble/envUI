// Static checks of every template screen, the file of a ```tsx template=Name``` block in
// docs/templates: what applications copy as it is has to work in their tree. The rules are
// docs/pattern-pages.md's "Template files"; the browser checks of the screens rendered are in
// tests/browser/Templates.spec.ts.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import ts from 'typescript';
import { examplesDirectory, readDocumentation } from '../scripts/GenerateDocumentation.mjs';

/** The neutral people of sample data (docs/pattern-pages.md); emails are at example.com. */
export const sampleNames = [
  'Alex Morgan',
  'Sam Lee',
  'Priya Shah',
  'Jordan Kim',
  'Maria Garcia',
  'Chen Wei',
];
/** Fields of sample data that hold a person's name. */
const personFields = /^(?:owner|author|assignee|reviewer|member|person|user|createdBy|updatedBy)$/;
/** Providers an application has at its root once; a template that brought its own would nest them. */
const providers = ['Theme', 'EnvUIProvider', 'LinkProvider', 'ThemePreferenceProvider'];
/** The app frame template, which takes the screen it frames. */
const appFrame = 'app-frame/AppFrame';

/** What is wrong with a template file's source, as sentences; empty when nothing is. */
export function templateProblems(source, { frame = false } = {}) {
  const problems = [];
  const file = ts.createSourceFile('Template.tsx', source, ts.ScriptTarget.Latest, true);

  // A default-exported function component an application can render as it is.
  const declaration = file.statements.find(
    (statement) =>
      ts.isFunctionDeclaration(statement) &&
      statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
      statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword),
  );
  if (!declaration) problems.push('it default-exports no function component');
  else {
    const [parameter, ...rest] = declaration.parameters;
    if (rest.length) problems.push('its component takes more than one parameter');
    const members =
      parameter?.type && ts.isTypeLiteralNode(parameter.type) ? parameter.type.members : undefined;
    if (parameter && !members && !parameter.questionToken && !parameter.initializer)
      problems.push('its props must be written inline, all optional');
    const props = (members ?? []).map((member) => ({
      name: member.name?.getText(file),
      optional: Boolean(member.questionToken),
    }));
    for (const prop of props.filter((item) => !item.optional))
      problems.push(`its prop ${prop.name} is required; a template renders with no props`);
    if (frame) {
      const names = props.map((prop) => prop.name).sort();
      if (names.join() !== 'children,current')
        problems.push('the app frame takes children? and current?, and nothing else');
    } else if (props.length) problems.push('a template screen takes no props');
  }

  // Providers belong to the application's root.
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings))
      for (const element of bindings.elements) {
        const name = (element.propertyName ?? element.name).text;
        if (providers.includes(name))
          problems.push(`it imports ${name}; the application provides it at its root`);
      }
  }
  if (/\bToast\.Provider\b/.test(source))
    problems.push('it renders Toast.Provider; the application provides it at its root');

  // Nothing from the network, and no links that go nowhere.
  if (/\bhttps?:\/\//.test(source)) problems.push('it loads or links an http(s) address');
  if (/\bhref=(?:"#"|'#'|\{\s*['"`]#['"`]\s*\})/.test(source))
    problems.push('it links to "#"; use an application path such as /projects');

  // An inline style stands in for a layout envUI lacks, and says so.
  const lines = source.split('\n');
  lines.forEach((line, index) => {
    if (!/\bstyle=\{/.test(line)) return;
    const context = lines.slice(Math.max(0, index - 3), index + 1).join('\n');
    if (!/envUI has no/.test(context))
      problems.push(
        `line ${index + 1} has an inline style without an "envUI has no …" comment above it`,
      );
  });

  // Neutral sample data: people from the roster, email at example.com.
  for (const [, address] of source.matchAll(/[\w.+-]+@([\w-]+(?:\.[\w-]+)+)/g))
    if (address !== 'example.com') problems.push(`an email address at ${address}, not example.com`);
  const people = [];
  const visit = (node) => {
    if (
      ts.isJsxAttribute(node) &&
      node.name.getText(file) === 'name' &&
      ts.isJsxOpeningLikeElement(node.parent.parent) &&
      node.parent.parent.tagName.getText(file) === 'Avatar' &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    )
      people.push(node.initializer.text);
    if (
      ts.isPropertyAssignment(node) &&
      personFields.test(node.name.getText(file)) &&
      ts.isStringLiteralLike(node.initializer)
    )
      people.push(node.initializer.text);
    ts.forEachChild(node, visit);
  };
  visit(file);
  for (const person of people)
    if (!sampleNames.includes(person))
      problems.push(`the sample person "${person}" is not one of ${sampleNames.join(', ')}`);
  return problems;
}

/** Every template screen of the documentation, as page/Name. */
function templateFiles() {
  const files = [];
  for (const document of readDocumentation())
    for (const section of document.sections ?? [])
      for (const block of section.blocks)
        if (block.kind === 'template') files.push(`${document.id}/${block.name}`);
  return files;
}

test('every template screen follows the template file rules', () => {
  for (const key of templateFiles()) {
    const source = readFileSync(join(examplesDirectory, `${key}.tsx`), 'utf8');
    assert.deepEqual(
      templateProblems(source, { frame: key === appFrame }),
      [],
      `examples/${key}.tsx`,
    );
  }
});

const screen = (body, props = '') =>
  [
    "import { Avatar, Button, Page, Stack } from '@envsemble/envui';",
    '',
    `export default function SettingsPage(${props}) {`,
    `  return (${body});`,
    '}',
    '',
  ].join('\n');

test('the template rules accept a screen that keeps them', () => {
  assert.deepEqual(
    templateProblems(
      screen(
        [
          '<Page>',
          '  {/* envUI has no responsive columns yet: these wrap without media queries. */}',
          '  <Stack direction="row" wrap style={{ gap: \'1rem\' }}>',
          '    <Avatar name="Priya Shah" />',
          '    <Button href="/projects/website-refresh">Open</Button>',
          '  </Stack>',
          '</Page>',
        ].join('\n'),
      ) + "const members = [{ owner: 'Sam Lee', email: 'sam@example.com' }];\n",
    ),
    [],
  );
  assert.deepEqual(
    templateProblems(
      [
        "import type { ReactNode } from 'react';",
        'export default function AppFrame({ children, current }: { children?: ReactNode; current?: string }) {',
        '  return <>{children}{current}</>;',
        '}',
      ].join('\n'),
      { frame: true },
    ),
    [],
  );
});

test('the template rules name what a screen breaks', () => {
  const problems = (source, options) => templateProblems(source, options).join('\n');
  assert.match(problems('export function SettingsPage() {}'), /default-exports no function/);
  assert.match(
    problems(screen('<Page />', '{ title }: { title: string }')),
    /prop title is required/,
  );
  assert.match(problems(screen('<Page />', '{ title }: { title?: string }')), /takes no props/);
  assert.match(
    problems(screen('<Page />', '{ children }: { children?: string }'), { frame: true }),
    /children\? and current\?/,
  );
  assert.match(
    problems(`import { Theme, Toast } from '@envsemble/envui';\n${screen('<Toast.Provider />')}`),
    /imports Theme[\s\S]*renders Toast\.Provider/,
  );
  assert.match(problems(screen('<img src="https://example.org/a.png" />')), /http\(s\) address/);
  assert.match(problems(screen('<Button href="#">Open</Button>')), /links to "#"/);
  assert.match(problems(screen("<Button href={'#'}>Open</Button>")), /links to "#"/);
  assert.match(
    problems(screen("<Stack style={{ gap: '1rem' }} />")),
    /line 4 has an inline style without/,
  );
  assert.match(problems(screen('<Avatar name="Jane Doe" />')), /"Jane Doe" is not one of/);
  assert.match(
    problems(`${screen('<Page />')}const task = { assignee: 'John Smith' };\n`),
    /"John Smith"/,
  );
  assert.match(
    problems(`${screen('<Page />')}const contact = 'alex@company.test';\n`),
    /at company\.test, not example\.com/,
  );
});
