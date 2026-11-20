import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.ts';
import { declarations } from '../../support/CssDeclarations.ts';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { repositoryRoot, styleSheetsDirectory } from '../../../scripts/RepositoryPaths.ts';

const { Markdown } = await importSource('Markdown', 'packages/ui/src/markdown.ts');

const render = (source, props) =>
  elementsOf(firstElement(renderToString(h(Markdown, props, source))));
const regionNames = (elements) =>
  elements
    .filter((element) => element.attributes.role === 'region')
    .map((element) => element.attributes['aria-label']);

const table = (header) => `| ${header} | Value |\n| --- | --- |\n| a | b |\n`;

test('table regions are named after their heading or first column, numbered where they share a name, and tasks are envUI checkboxes', () => {
  const elements = render(
    `## Prices\n\n${table('Plan')}\n${table('Key')}\n${table('Key')}\n- [x] Draft the brief\n- [ ] Send it\n`,
  );
  assert.deepEqual(regionNames(elements), ['Prices table', 'Prices table 2', 'Prices table 3']);
  assert.deepEqual(regionNames(render(table('Setting'))), ['Setting table']);
  const tasks = elements.filter((element) => element.attributes.type === 'checkbox');
  assert.deepEqual(
    tasks.map((task) => task.attributes['aria-label']),
    ['Completed task', 'Incomplete task'],
  );
  assert.ok(tasks.every((task) => hasClass(task, 'env-checkbox-input')));
});

test('bold is semibold, heavier than the regular body text and a heading', () => {
  const prose = declarations(readFileSync(join(styleSheetsDirectory, 'Prose.css'), 'utf8'));
  const weight = prose.find(
    (each) => each.selector === '.env-prose strong' && each.prop === 'font-weight',
  );
  assert.equal(weight?.value, 'var(--env-font-weight-semibold)');
  const { tokens } = JSON.parse(
    readFileSync(join(repositoryRoot, 'packages/ui/src/generated/tokens.json'), 'utf8'),
  );
  const token = (name) => tokens.find((each) => each.cssVariable === name).values.light;
  const semibold = Number(token('--env-font-weight-semibold').resolved);
  assert.equal(semibold, 600);
  for (const type of ['--env-type-body', '--env-type-title']) {
    const font = token(type).css['font-weight'];
    const name = String(font).match(/var\((--[\w-]+)\)/)?.[1];
    assert.ok(Number(token(name).resolved) < semibold, type);
  }
});

const headingIds = () => (tree) => {
  const text = (node) =>
    node.type === 'text' ? node.value : (node.children ?? []).map(text).join('');
  const visit = (node) => {
    if (node.type === 'element' && /^h[1-6]$/.test(node.tagName))
      node.properties = { ...node.properties, id: text(node).toLowerCase().replace(/\W+/g, '-') };
    node.children?.forEach(visit);
  };
  visit(tree);
};

const rehypeRawStandIn = () => (tree) => {
  const visit = (node) => {
    node.children = node.children?.map((child) =>
      child.type === 'raw'
        ? {
            type: 'element',
            tagName: 'mark',
            properties: { 'data-raw': '' },
            children: [{ type: 'text', value: child.value }],
          }
        : child,
    );
    node.children?.forEach(visit);
  };
  visit(tree);
};

const emphasizeTodo = () => (tree) => {
  const visit = (node) => {
    if (node.type === 'emphasis') return;
    node.children = node.children?.map((child) =>
      child.type === 'text' && child.value === 'TODO'
        ? { type: 'emphasis', children: [{ type: 'text', value: 'TODO' }] }
        : child,
    );
    node.children?.forEach(visit);
  };
  visit(tree);
};

const extended = [
  '# Project plan',
  '> A quoted decision',
  'TODO',
  '| A | B |\n| - | - |\n| 1 | 2 |',
  'Some <span>inline</span> HTML',
  '<div>A block</div>',
  'Press <kbd>Ctrl</kbd>+<kbd>P</kbd> or <kbd><b>F1</b></kbd>.',
  'Not keys: <kbd onclick="alert(1)">A</kbd> <kbd class="x">B</kbd>',
].join('\n\n');

test('Markdown accepts component overrides and remark and rehype plugins, and still ignores raw HTML but for keys around plain text', () => {
  const elements = render(extended, {
    headingOffset: 1,
    className: 'fixture-markdown',
    rehypePlugins: [headingIds, rehypeRawStandIn],
    remarkPlugins: [emphasizeTodo],
    components: {
      blockquote: ({ node: _node, ...props }) =>
        h('blockquote', { ...props, 'data-custom-quote': '' }),
    },
  });
  const [root] = elements;
  assert.ok(hasClass(root, 'env-markdown') && hasClass(root, 'fixture-markdown'));
  const heading = elements.find((element) => element.tag === 'h2');
  assert.equal(textOf(heading), 'Project plan');
  assert.equal(heading.attributes.id, 'project-plan');
  const quote = elements.find((element) => element.tag === 'blockquote');
  assert.equal(quote.attributes['data-custom-quote'], '');
  assert.equal(textOf(quote).trim(), 'A quoted decision');
  assert.deepEqual(elements.filter((element) => element.tag === 'em').map(textOf), ['TODO']);
  assert.ok(elements.some((element) => element.tag === 'table'));
  const text = textOf(root);
  assert.match(text, /Some inline HTML/);
  assert.ok(!elements.some((element) => 'data-raw' in element.attributes));
  assert.doesNotMatch(text, /A block|<span>/);
  const keys = elements.filter((element) => element.tag === 'kbd');
  assert.ok(keys.every((key) => hasClass(key, 'env-kbd')));
  assert.deepEqual(keys.map(textOf), ['Ctrl', 'P']);
  const paragraphs = elements.filter((element) => element.tag === 'p').map(textOf);
  assert.ok(paragraphs.includes('Press Ctrl+P or F1.'));
  assert.ok(paragraphs.includes('Not keys: A B'));
  assert.ok(!elements.some((element) => 'onclick' in element.attributes || element.tag === 'b'));
});

test("links keep only safe schemes, and the application's own with allowLinkSchemes, without images taking them", () => {
  const source = [
    '[Open](vscode://file/src/App.tsx) [Ticket](Tracker:42) [Run](javascript:alert(1))',
    '[Site](https://example.com) [Page](/docs) ![Logo](vscode://file/logo.png)',
  ].join('\n\n');
  const hrefs = (props) =>
    render(source, props)
      .filter((element) => element.tag === 'a')
      .map((element) => element.attributes.href);
  assert.deepEqual(hrefs({}), ['https://example.com', '/docs']);
  assert.deepEqual(hrefs({ allowLinkSchemes: ['vscode', 'tracker:'] }), [
    'vscode://file/src/App.tsx',
    'Tracker:42',
    'https://example.com',
    '/docs',
  ]);
  const images = render(source, { allowLinkSchemes: ['vscode'] }).filter(
    (element) => element.tag === 'img',
  );
  assert.deepEqual(images, []);
});

test('allowHtml keeps raw HTML for the rehype plugins, which a sanitizing rehype-raw then renders', () => {
  const source = 'H<sub>2</sub>O\n\n<details>More</details>';
  const kept = render(source, { allowHtml: true, rehypePlugins: [rehypeRawStandIn] });
  assert.deepEqual(kept.filter((element) => 'data-raw' in element.attributes).map(textOf), [
    '<sub>',
    '</sub>',
    '<details>More</details>',
  ]);
  const dropped = render(source, { rehypePlugins: [rehypeRawStandIn] });
  assert.ok(!dropped.some((element) => 'data-raw' in element.attributes));
});
