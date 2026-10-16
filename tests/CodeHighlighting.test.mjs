import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { highlightCode } from '../packages/ui/dist/content/internal/CodeHighlighting.js';

test('concurrent cold highlighting consumers share one token matrix', async (context) => {
  const source = Array.from({ length: 40 }, (_, index) => `const value${index} = ${index};`).join(
    '\n',
  );
  const requests = await Promise.all(
    Array.from({ length: 24 }, () => highlightCode(source, 'javascript')),
  );
  const matrices = new Set(requests);
  context.diagnostic(
    `${requests.length} concurrent requests produced ${matrices.size} token matrix`,
  );
  assert.equal(matrices.size, 1);
  assert.equal(
    requests[0].map((line) => line.map((token) => token.content).join('')).join('\n'),
    source,
  );
  assert.ok(requests[0].flat().some((token) => token.light.color && token.dark.color));
  assert.equal(await highlightCode(source, 'javascript'), requests[0]);
});

test('every highlighted token is readable on its code background, in code blocks and diffs', async () => {
  const { wcagContrast } = await import('culori');
  const { codeBackground, codeThemes, diffThemes } = await import(
    '../packages/ui/dist/content/internal/CodeThemes.js'
  );
  const { contrastFile, codeThemesSource, targetContrast } = await import(
    '../scripts/GenerateCodeThemes.mjs'
  );
  assert.equal(
    readFileSync(contrastFile, 'utf8'),
    await codeThemesSource(),
    'Run node scripts/GenerateCodeThemes.mjs and commit CodeThemeContrast.ts.',
  );
  assert.ok(targetContrast >= 4.5);
  const samples = {
    tsx: "import { Button } from '@envsemble/envui';\n// Saves the draft.\nexport const Save = ({ count = 2 }) => <Button onClick={() => save(String(count))}>Save {true}</Button>;",
    css: '.card:hover { color: var(--color-fg-default); margin: 0 1rem !important; }',
    json: '{ "name": "envui", "private": true, "count": 3, "items": [null] }',
    shellscript: 'npm install --save-exact "@envsemble/envui" # pinned\nexport PORT=8080',
    yaml: 'title: Button # the page\nstatus: beta\ncount: 3',
    markdown: '# Title\n\nSome **bold** text with `code` and a [link](https://example.com).',
  };
  for (const [language, source] of Object.entries(samples))
    for (const line of await highlightCode(source, language))
      for (const token of line)
        for (const theme of ['light', 'dark']) {
          const color = token[theme].color;
          if (!color || !token.content.trim()) continue;
          const contrast = wcagContrast(color, codeBackground(theme));
          assert.ok(
            contrast >= 4.5,
            `${language} ${theme} "${token.content}" ${color}: ${contrast}`,
          );
        }
  // Every token color of each theme reaches 4.5:1: on code's background in code blocks, and on the
  // lines Diffs tints in diffs, which the generator checks against their strongest tint.
  for (const theme of ['light', 'dark'])
    for (const rule of codeThemes[theme].tokenColors ?? []) {
      const color = rule.settings?.foreground;
      if (color) assert.ok(wcagContrast(color, codeBackground(theme)) >= 4.5, `${theme} ${color}`);
    }
  for (const theme of ['light', 'dark'])
    assert.notEqual(diffThemes[theme].name, codeThemes[theme].name);
});
