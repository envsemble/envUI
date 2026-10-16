import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { analyze, exceptionsFile, keyOf, rulesFile } from './composition/Analysis.mjs';

/**
 * Composition rules for packages/ui/src, described by tests/composition/Rules.json:
 * 1. imports go down the layers (internal, foundations, base, composites, shell) or stay in their
 *    layer, and private modules stay private;
 * 2. raw interactive HTML appears only in the leaf controls and internals that render it;
 * 3. a module uses only its own component's classes, and a stylesheet selects only its own
 *    components' classes, besides shared helpers and documented container rules.
 * Today's violations are counted in tests/composition/Exceptions.json. A test fails on a new
 * violation, and on a listed one that has gone or shrunk, so the list only shrinks.
 */

const { problems, layers, findings } = analyze();
const exceptions = JSON.parse(readFileSync(exceptionsFile, 'utf8'));
const source = (path, sites) => `packages/ui/src/${path}:${sites.join(', ')}`;
const times = (count) => (count === 1 ? 'once' : `${count} times`);

/** What has to change for the findings of a section to match its exceptions. */
function changes(section, { describe, fix, label }) {
  const result = [];
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

test('imports go down the layers and private modules stay private', () => {
  assertNoChanges(
    changes('imports', {
      label: (entry) => `${entry.module} importing ${entry.imports}`,
      describe: ({ entry, sites, from, to, upward, privateTo }) =>
        upward
          ? `${source(entry.module, sites)} imports ${entry.imports}, but a ${from} module may import only from its own layer or below (${layers.slice(0, -1).join(' < ')}), and ${entry.imports} is ${to}`
          : `${source(entry.module, sites)} imports ${entry.imports}, which is private to ${privateTo.join(', ')}`,
      fix: ({ upward }) =>
        upward
          ? `Move what both need into a lower layer, or correct the layer in ${rulesFile} if it is wrong.`
          : 'Move the module into a shared internal directory, or build on the public API of the component it belongs to.',
    }),
  );
});

test('raw interactive HTML stays in leaf controls and internals', () => {
  assertNoChanges(
    changes('interactive', {
      label: (entry) => `raw ${element(entry.element)} in ${entry.module}`,
      describe: ({ entry, sites }) =>
        `${source(entry.module, sites)} renders a raw ${element(entry.element)} ${times(sites.length)}`,
      fix: () =>
        `Render envUI's Button, IconButton or Link, or give a Base UI part render={<IconButton />}. Only the leaf controls and internals under interactive.leafControls in ${rulesFile} render raw interactive HTML.`,
    }),
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
        `Style your own element, or use ${owner}'s props or variants (such as variant="quiet" on a button) or a custom property ${owner} reads, set on your own element. A container that only places, sizes or spaces the child can be documented under classes.childRules in ${rulesFile}.`,
    }),
  );
});

function element(name) {
  return name.startsWith('role=') ? `element with ${name}` : `<${name}>`;
}
