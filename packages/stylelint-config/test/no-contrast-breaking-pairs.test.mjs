import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lint, passes } from './Lint.mjs';

test('token pairs that break contrast are reported', async () => {
  assert.deepEqual(
    (
      await lint(
        [
          '.a { color: var(--env-color-fg-on-emphasis); background: var(--env-color-bg-default); }',
          '.b { background-color: var(--env-color-fg-default); color: var(--env-color-fg-on-emphasis); }',
          '.c { color: var(--env-color-bg-page); }',
        ].join('\n'),
      )
    ).map(({ rule, text }) => `${rule} ${text}`),
    [
      'envui/no-contrast-breaking-pairs --env-color-fg-on-emphasis',
      'envui/no-contrast-breaking-pairs --env-color-fg-default',
      'envui/no-contrast-breaking-pairs --env-color-bg-page',
    ],
  );
  await passes(
    '.a { color: var(--env-color-fg-on-emphasis); background: var(--env-color-bg-accent-emphasis-hover); }',
  );
  await passes(
    '.a { background: color-mix(in oklch, var(--env-color-fg-default) 8%, transparent); }',
  );
});

test('a text color as the fill of a label that sets its font or text but inherits its color is reported', async () => {
  assert.deepEqual(
    (
      await lint(
        [
          '.a { background: var(--env-color-fg-default); font: var(--env-type-body-sm); }',
          '.b { background-color: var(--env-color-fg-muted); line-height: 1.5; }',
          '.c { background: var(--env-color-fg-accent); text-transform: uppercase; }',
          '.d { background: var(--env-color-fg-default); font-weight: 600; }',
        ].join('\n'),
      )
    ).map(({ rule, text }) => `${rule} ${text}`),
    [
      'envui/no-contrast-breaking-pairs --env-color-fg-default',
      'envui/no-contrast-breaking-pairs --env-color-fg-muted',
      'envui/no-contrast-breaking-pairs --env-color-fg-accent',
      'envui/no-contrast-breaking-pairs --env-color-fg-default',
    ],
  );
});

test('a text color as the fill of a masked icon, or of a shape that sets no text property, passes', async () => {
  await passes(
    [
      '.a { mask: url("icon.svg") center / contain no-repeat; background-color: var(--env-color-fg-muted); color: var(--env-color-fg-default); }',
      '.b { -webkit-mask-image: url("icon.svg"); background: var(--env-color-fg-default); }',
      '.status-dot { inline-size: 0.5rem; block-size: 0.5rem; background: var(--env-color-fg-success); }',
      '.separator { inline-size: 100%; background-color: var(--env-color-fg-muted); }',
    ].join('\n'),
  );
});
