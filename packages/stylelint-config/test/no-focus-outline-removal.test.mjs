import assert from 'node:assert/strict';
import { test } from 'node:test';
import { message, passes } from './Lint.mjs';

test('removing the outline on :focus-visible without another ring is reported', async () => {
  assert.equal(
    (await message('.a:focus-visible { outline: none; }')).text,
    "outline: none on :focus-visible removes the focus ring: leave envUI's focus ring, or draw another ring, such as box-shadow: 0 0 0 2px var(--env-color-border-focus). (envui/no-focus-outline-removal)",
  );
  await passes(
    '.a:focus-visible { outline: 0; box-shadow: 0 0 0 2px var(--env-color-border-focus); }',
  );
  await passes(
    '.a:focus-visible { outline: none; } .a:focus-visible .b { outline: 2px solid var(--env-color-border-focus); }',
  );
  await passes('.a:focus-visible::before { outline: 0; }');
});
