// Markdown's markup: tables named for their region, tasks as envUI checkboxes, the application's
// component overrides and plugins, and raw HTML ignored but for keys; and bold in semibold, which
// the prose style sheet declares. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.mjs';
import { declarations } from '../../support/CssDeclarations.mjs';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.mjs';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

const { Markdown } = await importSource('Markdown', 'packages/ui/src/markdown.ts');

const render = (source, props) =>
  elementsOf(firstElement(renderToString(h(Markdown, props, source))));
const regionNames = (elements) =>
  elements
    .filter((element) => element.attributes.role === 'region')
    .map((element) => element.attributes['aria-label']);

const table = (header) => `| ${header} | Value |\n| --- | --- |\n| a | b |\n`;

test('table regions are named after their heading, numbered where they share a name', () => {
  const elements = render(
    `## Prices\n\n${table('Plan')}\n${table('Key')}\n${table('Key')}\n- [x] Draft the brief\n- [ ] Send it\n`,
  );
  assert.deepEqual(regionNames(elements), ['Prices table', 'Prices table 2', 'Prices table 3']);
  // Without a heading, a table is named after its first column.
  assert.deepEqual(regionNames(render(table('Setting'))), ['Setting table']);
  // Tasks are envUI checkboxes, not small native boxes.
  const tasks = elements.filter((element) => element.attributes.type === 'checkbox');
  assert.deepEqual(
    tasks.map((task) => task.attributes['aria-label']),
    ['Completed task', 'Incomplete task'],
  );
  assert.ok(tasks.every((task) => hasClass(task, 'env-checkbox-input')));
});

test('bold is semibold, heavier than the regular body text and a heading', () => {
  const prose = declarations(
    readFileSync(join(repositoryRoot, 'packages/ui/src/styles/Prose.css'), 'utf8'),
  );
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
  // Body text is regular and a heading's title medium, both lighter than semibold.
  for (const type of ['--env-type-body', '--env-type-title']) {
    const font = token(type).css['font-weight'];
    const name = String(font).match(/var\((--[\w-]+)\)/)?.[1];
    assert.ok(Number(token(name).resolved) < semibold, type);
  }
});

/** A rehype plugin: headings get ids from their text. */
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

/** Stands in for rehype-raw: raw HTML that reaches the HTML tree would show as marked text. */
const renderRaw = () => (tree) => {
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

/** A remark plugin: the text "TODO" becomes emphasized. */
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

test('Markdown accepts component overrides and remark and rehype plugins', () => {
  const elements = render(extended, {
    headingOffset: 1,
    className: 'fixture-markdown',
    rehypePlugins: [headingIds, renderRaw],
    remarkPlugins: [emphasizeTodo],
    components: {
      blockquote: ({ node: _node, ...props }) =>
        h('blockquote', { ...props, 'data-custom-quote': '' }),
    },
  });
  const [root] = elements;
  assert.ok(hasClass(root, 'env-markdown') && hasClass(root, 'fixture-markdown'));
  // envUI's heading offset still applies, and the rehype plugin's id reaches the element.
  const heading = elements.find((element) => element.tag === 'h2');
  assert.equal(textOf(heading), 'Project plan');
  assert.equal(heading.attributes.id, 'project-plan');
  // The application's override wins over envUI's components.
  const quote = elements.find((element) => element.tag === 'blockquote');
  assert.equal(quote.attributes['data-custom-quote'], '');
  assert.equal(textOf(quote).trim(), 'A quoted decision');
  // The remark plugin runs after envUI's own Markdown extensions, which still render tables.
  assert.deepEqual(elements.filter((element) => element.tag === 'em').map(textOf), ['TODO']);
  assert.ok(elements.some((element) => element.tag === 'table'));
  // Raw HTML stays ignored, even with a rehype plugin that would render it.
  const text = textOf(root);
  assert.match(text, /Some inline HTML/);
  assert.ok(!elements.some((element) => 'data-raw' in element.attributes));
  assert.doesNotMatch(text, /A block|<span>/);
  // Keys are the one exception: <kbd> around plain text renders as Kbd, and nothing else.
  const keys = elements.filter((element) => element.tag === 'kbd');
  assert.ok(keys.every((key) => hasClass(key, 'env-kbd')));
  assert.deepEqual(keys.map(textOf), ['Ctrl', 'P']);
  const paragraphs = elements.filter((element) => element.tag === 'p').map(textOf);
  assert.ok(paragraphs.includes('Press Ctrl+P or F1.'));
  assert.ok(paragraphs.includes('Not keys: A B'));
  assert.ok(!elements.some((element) => 'onclick' in element.attributes || element.tag === 'b'));
});
