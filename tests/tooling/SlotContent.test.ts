import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import stylelint from 'stylelint';
import type { PartsContract } from '../../scripts/docs/parts/Contract.ts';
import { partsFile } from '../../scripts/RepositoryPaths.ts';
import { slotClasses, slotContent, slotContentRuleName } from '../../scripts/lint/SlotContent.ts';

const config = { plugins: [slotContent], rules: { [slotContentRuleName]: true } };
const [slot] = slotClasses(JSON.parse(readFileSync(partsFile, 'utf8')) as PartsContract);
const component = 'env-component';

async function warnings(code: string) {
  const { results } = await stylelint.lint({ code, config });
  return results[0]!.warnings.map(({ rule, text }) => ({ rule, text }));
}

const passes = async (code: string) => assert.deepEqual(await warnings(code), [], code);

async function fails(code: string, message: RegExp) {
  const found = await warnings(code);
  assert.equal(found.length, 1, JSON.stringify(found));
  assert.equal(found[0]!.rule, slotContentRuleName);
  assert.match(found[0]!.text, message);
}

test('the parts contract names slots', () => assert.ok(slot));

test('a slot placed by its own rule, or by its parent, passes', async () => {
  await passes(`.${slot} { display: flex; gap: 0.5rem; margin-inline-start: auto; }`);
  await passes(`.${component} > .${slot} { align-self: center; }`);
  await passes(`.${component}:has(.${slot}) { padding-inline-end: 0; }`);
  await passes(`.${slot} + .${component} { margin: 0; }`);
});

test('a selector that reaches inside a slot fails, whatever the combinator', async () => {
  await fails(`.${slot} .${component} { color: red; }`, /reaches inside the slot/);
  await fails(`.${slot} > svg { width: 1rem; }`, /reaches inside the slot/);
  await fails(`.${component}:is(.${slot}) > * { width: 1rem; }`, /reaches inside the slot/);
});

test("a slot that styles its content's text, color or overflow fails", async () => {
  await fails(`.${slot} { color: red; }`, /"color" on the slot/);
  await fails(`.${component} > .${slot} { font-weight: 600; }`, /"font-weight" on the slot/);
  await fails(`.${slot} { text-overflow: ellipsis; }`, /"text-overflow" on the slot/);
});

test('a slot inside :not() or :has() is not the element styled', () =>
  passes(`.${component}:not(.${slot}) span { color: red; }`));
