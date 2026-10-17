// The static half of the Phase 4 proof (tests/browser/FrameNeeds.spec.ts is the other): the frame
// fixtures in tests/fixture/frame reproduce the applications' needs with the frame parts alone. Their
// CSS selects no envUI class and sets no envUI property, reading the frame's variables only, and
// their code measures no header, neither with getBoundingClientRect nor with a hidden element.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const directory = fileURLToPath(new URL('./fixture/frame/', import.meta.url));
const files = readdirSync(directory);
const styles = files.filter((name) => name.endsWith('.css'));
const sources = files.filter((name) => name.endsWith('.tsx'));
const read = (name) => readFileSync(join(directory, name), 'utf8');

/** The fixtures each need: one per application need, and their stylesheet. */
const fixtures = [
  'RailsFrame.tsx',
  'DocumentFrame.tsx',
  'TitleBarFrame.tsx',
  'WindowSections.tsx',
  'SplitHeaderFrame.tsx',
];

test('every frame fixture exists, with its stylesheet', () => {
  for (const name of fixtures) assert.ok(sources.includes(name), name);
  assert.deepEqual(styles, ['Frame.css']);
});

test('the frame fixtures’ CSS selects no .env-* class and sets no --env-* property', () => {
  const problems = [];
  for (const name of styles) {
    const root = postcss.parse(read(name), { from: name });
    root.walkRules((rule) => {
      if (/\.env-/.test(rule.selector))
        problems.push(`${name}:${rule.source?.start?.line} selects ${rule.selector}`);
    });
    root.walkDecls((declaration) => {
      if (declaration.prop.startsWith('--env-'))
        problems.push(`${name}:${declaration.source?.start?.line} sets ${declaration.prop}`);
    });
  }
  assert.deepEqual(problems, []);
});

test('the frame fixtures read the frame’s published variables', () => {
  const css = styles.map(read).join('\n');
  for (const variable of ['--env-frame-sticky-top', '--env-frame-header-block-size'])
    assert.match(css, new RegExp(`var\\(${variable}\\)`), variable);
});

test('the frame fixtures’ code sets no envUI property or class and measures no header', () => {
  const problems = [];
  for (const name of sources) {
    const source = read(name);
    const check = (pattern, what) => {
      if (pattern.test(source)) problems.push(`${name}: ${what}`);
    };
    check(/['"`]--env-[\w-]+['"`]\s*:/, 'sets an --env-* property in a style');
    check(/setProperty\(\s*['"`]--env-/, 'sets an --env-* property');
    check(/className=\{?['"`][^'"`]*\benv-/, 'names an envUI class');
    check(/getBoundingClientRect/, 'measures with getBoundingClientRect');
    check(/visibility:\s*['"`]?hidden/, 'renders a hidden element');
    check(/aria-hidden/, 'renders a hidden element');
  }
  assert.deepEqual(problems, []);
});

test('the document frame’s sticky offsets come from the frame, not from measuring', () => {
  const source = read('DocumentFrame.tsx');
  assert.match(source, /getStickyTop\(\)/);
  assert.doesNotMatch(source, /ResizeObserver|offsetHeight|clientHeight/);
});

test('the frame fixtures style their own elements, never a library part', () => {
  // A fixture class on a library part, such as positioning AppShell.Main, would prove a need with
  // an override. Only the frame's root carries one, fixture-frame, which the stylesheet reads to
  // reset the body's margin and never styles itself.
  const problems = [];
  for (const name of sources)
    for (const match of read(name).matchAll(/<([A-Z][\w.]*)\b[^>]*?className=["'{`]+([^"'`}]*)/g))
      if (match[2] !== 'fixture-frame') problems.push(`${name}: ${match[1]} has ${match[2]}`);
  assert.deepEqual(problems, []);
  const css = styles.map(read).join('\n');
  assert.doesNotMatch(css, /\.fixture-frame\s*[{,]/);
});
