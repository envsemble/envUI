import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import {
  analyze,
  exceptionsFile,
  interactiveElements,
  keyOf,
  rulesFile,
} from './composition/Analysis.ts';

/**
 * Composition rules for packages/ui/src, described by tests/library/rules/composition/Rules.json:
 * 1. imports go down the layers (internal, foundations, base, composites, shell) or stay in their
 *    layer (a family's internal/ folder stays its own through ESLint, eslint.config.mjs);
 * 2. raw interactive HTML appears only in the leaf controls and internals that render it;
 * 3. a module uses only its own component's classes, and a stylesheet selects only its own
 *    components' classes, besides shared helpers and documented container rules.
 * Today's violations are counted in tests/library/rules/composition/Exceptions.json. A test fails on a new
 * violation, and on a listed one that has gone or shrunk, so the list only shrinks.
 */

const { problems, layers, findings } = analyze();
const exceptions = JSON.parse(readFileSync(exceptionsFile, 'utf8'));
const source = (path, sites) => `packages/ui/src/${path}:${sites.join(', ')}`;
const times = (count) => (count === 1 ? 'once' : `${count} times`);

/** What has to change for the findings of a section to match its exceptions. */
function changes(section, { describe, fix, label }) {
  const result: string[] = [];
  const listed = new Map();
  for (const entry of exceptions[section]) {
    const key = keyOf(section, entry);
    if (listed.has(key)) result.push(`${exceptionsFile} lists ${label(entry)} twice.`);
    listed.set(key, entry);
  }
  for (const [key, finding] of findings[section]) {
    const count = finding.sites.length;
    const allowed = listed.has(key) ? (listed.get(key).count ?? 1) : 0;
    if (count > allowed)
      result.push(
        `${describe(finding)}${allowed > 0 ? `, ${count - allowed} more than ${exceptionsFile} allows` : ''}. ${fix(finding)}`,
      );
    else if (count < allowed)
      result.push(
        `${label(finding.entry)} now occurs ${times(count)}, fewer than ${exceptionsFile} allows: lower its "count" to ${count}.`,
      );
  }
  for (const [key, entry] of listed)
    if (!findings[section].has(key))
      result.push(
        `${label(entry)} no longer occurs: remove its entry from "${section}" in ${exceptionsFile}.`,
      );
  return result;
}

function assertNoChanges(list) {
  assert.equal(list.length, 0, `\n${list.join('\n\n')}\n`);
}

test('the composition rules give every module a layer and every class an owner', () => {
  assertNoChanges(problems);
});

test('imports go down the layers', () => {
  assertNoChanges(
    changes('imports', {
      label: (entry) => `${entry.module} importing ${entry.imports}`,
      describe: ({ entry, sites, from, to }) =>
        `${source(entry.module, sites)} imports ${entry.imports}, but a ${from} module may import only from its own layer or below (${layers.slice(0, -1).join(' < ')}), and ${entry.imports} is ${to}`,
      fix: () =>
        `Move what both need into a lower layer, or correct the layer in ${rulesFile} if it is wrong: a component of a family's folder that renders a composite is a composite, listed under layers.modules.`,
    }),
  );
});

test('raw interactive HTML stays in leaf controls and internals', () => {
  assertNoChanges(
    changes('interactive', {
      label: (entry) => `raw ${element(entry.element)} in ${entry.module}`,
      describe: ({ entry, sites }) =>
        `${source(entry.module, sites)} renders a raw ${element(entry.element)} ${times(sites.length)}`,
      fix: ({ entry }) =>
        entry.element === 'role={…}'
          ? `List the roles it can take under interactive.dynamicRoles in ${rulesFile}, so the check can tell whether it is interactive.`
          : `Render envUI's Button, IconButton or Link, or give a Base UI part render={<IconButton />}. Only the leaf controls and internals under interactive.leafControls in ${rulesFile} render raw interactive HTML.`,
    }),
  );
});

test('a role set by a condition counts with each branch, and one the source hides needs its roles listed', () => {
  const ts = createRequire(import.meta.url)('typescript');
  const tag = (source) => {
    const file = ts.createSourceFile(
      'Probe.tsx',
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    let found;
    const visit = (node) => {
      if (!found && ts.isJsxSelfClosingElement(node)) found = node;
      ts.forEachChild(node, visit);
    };
    visit(file);
    return found;
  };
  const rules = { elements: ['button'], roles: ['button', 'link'] };
  assert.deepEqual(
    interactiveElements(tag("<span role={on ? 'button' : undefined} />"), rules, 'Probe.tsx'),
    ['role="button"'],
  );
  assert.deepEqual(
    interactiveElements(tag("<span role={on ? 'img' : null} />"), rules, 'Probe.tsx'),
    [],
  );
  const hidden = tag('<span role={on ? stand.role : undefined} />');
  assert.deepEqual(interactiveElements(hidden, rules, 'Probe.tsx'), ['role={…}']);
  assert.deepEqual(
    interactiveElements(
      hidden,
      { ...rules, dynamicRoles: { 'Probe.tsx': { 'stand.role': ['link', 'status'] } } },
      'Probe.tsx',
    ),
    ['role="link"'],
  );
  // A listing covers its expression only, not another role={…} in the same module.
  assert.deepEqual(
    interactiveElements(
      tag('<span role={other} />'),
      { ...rules, dynamicRoles: { 'Probe.tsx': { 'stand.role': ['link'] } } },
      'Probe.tsx',
    ),
    ['role={…}'],
  );
});

test("modules use only their own component's classes", () => {
  assertNoChanges(
    changes('tsxClasses', {
      label: (entry) => `${entry.class} in ${entry.module}`,
      describe: ({ entry, sites, owner }) =>
        `${source(entry.module, sites)} uses ${entry.class}, a class of ${owner}, ${times(sites.length)}`,
      fix: ({ owner }) =>
        `Render ${owner} itself (a Base UI part takes render={<${owner} />}) or give ${owner} the prop or variant you need, rather than copying or querying its classes. If the class is wrongly attributed, correct its owner under classes.components in ${rulesFile}.`,
    }),
  );
});

test("stylesheets select only their own components' classes", () => {
  assertNoChanges(
    changes('cssClasses', {
      label: (entry) => `.${entry.class} in styles/${entry.stylesheet}`,
      describe: ({ entry, sites, owner, disallowed }) =>
        `${source(`styles/${entry.stylesheet}`, sites)} selects .${entry.class}, a class of ${owner}, in ${sites.length === 1 ? 'a selector' : `${sites.length} selectors`}` +
        (disallowed.size > 0
          ? `, and declares ${[...disallowed].join(', ')}, which a container may not set on another component's element`
          : ''),
      fix: ({ owner }) =>
        `Style your own element, or use ${owner}'s props or variants (such as variant="ghost" on a button) or a custom property ${owner} reads, set on your own element. A container that only places, sizes or spaces the child can be documented under classes.childRules in ${rulesFile}.`,
    }),
  );
});

function element(name) {
  return name.startsWith('role=') ? `element with ${name}` : `<${name}>`;
}
