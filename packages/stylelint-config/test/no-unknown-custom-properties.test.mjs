import assert from 'node:assert/strict';
import { test } from 'node:test';
import { message, passes } from './Lint.mjs';

test('an --env- name envUI does not define is reported, with the nearest public name', async () => {
  assert.equal(
    (await message('.a { color: var(--env-color-fg-defualt); }')).text,
    '--env-color-fg-defualt is not an envUI token or public property: write var(--env-color-fg-default) instead. (envui/no-unknown-custom-properties)',
  );
  assert.equal(
    (await message('.a { --env-card-inset: 1rem; }')).text,
    "--env-card-inset is not an envUI token or public property: set an envUI token, or name the application's own property outside --env-, such as --app-card-inset. (envui/no-unknown-custom-properties)",
  );
  await passes(
    '.a { --env-button-container: var(--env-color-bg-muted); color: var(--env-color-fg-default); --app-gap: 1rem; }',
  );
});

test('the members of a composite type token are known names', async () => {
  await passes('.a { letter-spacing: var(--env-type-headline-letter-spacing); }');
});
