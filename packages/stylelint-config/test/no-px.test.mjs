import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixed, lint, message, passes } from './Lint.mjs';

test('px is reported outside hairlines and offsets, and fixed to rem', async () => {
  assert.deepEqual(
    await lint(
      [
        '.c { width: calc(100% - 24px); }',
        '@media (min-width: 600px) { .d { margin: 0; } }',
        '.e { font-size: 14px; }',
        '.f { --card-border-radius: 4px; }',
        '.g { border-spacing: 2px; }',
        '.h { --divider-color: 1px; }',
      ].join('\n'),
      { lines: true },
    ),
    [
      { rule: 'envui/no-px', line: 1, text: '24px' },
      { rule: 'envui/no-px', line: 2, text: '600px' },
      { rule: 'envui/no-px', line: 3, text: '14px' },
      { rule: 'envui/no-px', line: 4, text: '4px' },
      { rule: 'envui/no-px', line: 5, text: '2px' },
      { rule: 'envui/no-px', line: 6, text: '1px' },
    ],
  );
  assert.equal(
    (await message('.a { font-size: 14px; }')).text,
    "14px: write 0.875rem instead, so the size follows the reader's font size; px is only for hairlines: border and outline widths, focus-ring offsets and shadow offsets. (envui/no-px)",
  );
  assert.equal(
    await fixed('.a { width: calc(100% - 24px); height: 1px; } @media (min-width: 600px) {}'),
    '.a { width: calc(100% - 1.5rem); height: 1px; } @media (min-width: 37.5rem) {}',
  );
  await passes(
    [
      '.a { border: 1px solid var(--env-color-border-default); outline: 2px solid; outline-offset: 2px; }',
      '.b { box-shadow: 0 1px 2px var(--shadow); text-underline-offset: 3px; border-inline-start-width: 1px; }',
      '.c { --card-border-width: 1px; --focus-ring-offset: 2px; }',
      '.d { padding: var(--env-space-4); margin: var(--space, 8px); inset-block-start: env(safe-area-inset-top, 20px); }',
    ].join('\n'),
  );
});
