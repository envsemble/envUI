import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lint, message, passes } from './Lint.mjs';

test("spacing and radius lengths off envUI's scales are reported with the step to write", async () => {
  assert.deepEqual(
    (
      await lint('.a { padding: 8px 0.6rem; gap: 2rem; margin: -0.5rem auto; border-radius: 4px; }')
    ).map(({ text }) => text),
    ['8px', '0.6rem', '2rem', '-0.5rem', '4px'],
  );
  assert.equal(
    (await message('.a { gap: 0.5rem; }')).text,
    "0.5rem in gap: write var(--env-space-2) instead, envUI's spacing step of that size. (envui/no-off-scale-values)",
  );
  assert.equal(
    (await message('.a { border-radius: 0.6rem; }')).text,
    "0.6rem in border-radius is off envUI's radius scale: write the nearest step, var(--env-radius-sm) (0.5rem), or another var(--env-radius-…) step. (envui/no-off-scale-values)",
  );
  await passes(
    '.a { margin: 0 auto; padding: 0; gap: 5%; inline-size: 13rem; inset: calc(var(--env-space-2) + 1px); }',
  );
});

test('positioning offsets and hairline corrections are not spacing, so the scales leave them alone', async () => {
  await passes(
    [
      '.a { position: absolute; inset-block-start: 3.5rem; inset-inline: 0.3rem auto; }',
      '.b { margin-inline-start: -1px; margin-block: 1px 0; padding-block-end: 0.0625rem; }',
      '.c { position: relative; top: -1px; inset-inline-end: 1px; }',
    ].join('\n'),
  );
  assert.deepEqual(
    (await lint('.a { inset-block-start: 24px; top: 2px; margin: -2px; }')).map(
      ({ rule, text }) => `${rule} ${text}`,
    ),
    ['envui/no-px 24px', 'envui/no-px 2px', 'envui/no-off-scale-values -2px'],
  );
});

test('lengths in units other than rem and px, alone or in a calculation, are not checked against the scales', async () => {
  await passes(
    '.a { margin-inline: calc(50% - 50vw); padding-inline: 1ch; margin-block: 0.5em; inset-block-start: 100dvh; }',
  );
});

test('a radius past the largest step is pointed to the full radius', async () => {
  assert.equal(
    (await message('.a { border-radius: 9999px; }')).text,
    "9999px in border-radius is past envUI's largest radius step: write var(--env-radius-full) for a fully rounded corner. (envui/no-off-scale-values)",
  );
});

test('a radius a little past the largest step is pointed to the nearest step', async () => {
  assert.match((await message('.a { border-radius: 2rem; }')).text, /--env-radius-xl/);
});
