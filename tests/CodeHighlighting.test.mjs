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
  const { wcagContrast, interpolate, formatHex, rgb, differenceEuclidean } = await import('culori');
  const { codeBackground, codeTheme, diffTheme } = await import(
    '../packages/ui/dist/content/internal/CodeThemes.js'
  );
  const { diffTints } = await import('../packages/ui/dist/content/internal/CodeDiffTints.js');
  const { tintsFile, tintsSource } = await import('../scripts/GenerateCodeThemes.mjs');
  assert.equal(
    readFileSync(tintsFile, 'utf8'),
    await tintsSource(),
    'Run node scripts/GenerateCodeThemes.mjs and commit CodeDiffTints.ts.',
  );
  const pierre = {
    light: (await import('@pierre/theme/pierre-light')).default,
    dark: (await import('@pierre/theme/pierre-dark')).default,
  };
  // AA for text in the standard themes, AAA under high contrast.
  const targets = { standard: 4.5, high: 7 };
  const samples = {
    tsx: "import { Button } from '@envsemble/envui';\n// Saves the draft.\nexport const Save = ({ count = 2 }) => <Button onClick={() => save(String(count))}>Save {true}</Button>;",
    css: '.card:hover { color: var(--color-fg-default); margin: 0 1rem !important; }',
    json: '{ "name": "envui", "private": true, "count": 3, "items": [null] }',
    shellscript: 'npm install --save-exact "@envsemble/envui" # pinned\nexport PORT=8080',
    yaml: 'title: Button # the page\nstatus: beta\ncount: 3',
    markdown: '# Title\n\nSome **bold** text with `code` and a [link](https://example.com).',
  };
  const variants = {
    light: ['light', 'standard'],
    dark: ['dark', 'standard'],
    lightHigh: ['light', 'high'],
    darkHigh: ['dark', 'high'],
  };
  for (const [language, source] of Object.entries(samples))
    for (const line of await highlightCode(source, language))
      for (const token of line)
        for (const [key, [scheme, contrast]] of Object.entries(variants)) {
          const color = token[key].color;
          if (!color || !token.content.trim()) continue;
          const ratio = wcagContrast(color, codeBackground(scheme));
          assert.ok(
            ratio >= targets[contrast],
            `${language} ${key} "${token.content}" ${color}: ${ratio}`,
          );
        }

  /** The text colors of a theme, from its token rules and foreground. */
  const textColors = (theme) => [
    theme.colors['editor.foreground'],
    ...(theme.tokenColors ?? []).map((rule) => rule.settings?.foreground).filter(Boolean),
  ];
  /**
   * Each original token color of a Pierre theme, with what a readable theme made of it, matched by
   * the rules' scopes, since the highlighter may add a rule of its own to a theme it loads.
   */
  const pairs = (original, readable) => {
    const byScope = (theme) =>
      new Map(
        (theme.tokenColors ?? [])
          .filter((rule) => rule.scope && rule.settings?.foreground)
          .map((rule) => [JSON.stringify(rule.scope), rule.settings.foreground.toLowerCase()]),
      );
    const after = byScope(readable);
    return new Map([...byScope(original)].map(([scope, color]) => [color, after.get(scope)]));
  };
  for (const scheme of ['light', 'dark'])
    for (const contrast of ['standard', 'high']) {
      const background = codeBackground(scheme);
      const target = targets[contrast];
      const theme = codeTheme(scheme, contrast);
      for (const color of textColors(theme))
        assert.ok(wcagContrast(color, background) >= target, `${scheme} ${contrast} ${color}`);
      // Tokens that were distinct stay apart: by 0.02 in OKLab, or as far as they were.
      const distance = differenceEuclidean('oklab');
      const mapped = [...pairs(pierre[scheme], theme)];
      for (const [a, aAfter] of mapped)
        for (const [b, bAfter] of mapped)
          if (a < b)
            assert.ok(
              distance(aAfter, bAfter) >= Math.min(0.02, distance(a, b)) - 1e-3,
              `${scheme} ${contrast}: ${a} and ${b} became ${aAfter} and ${bAfter}`,
            );

      // Diffs: the change colors read on code's background, and the tokens on every line and word
      // Diffs tints with them, mixed as its style sheet mixes them.
      const diff = diffTheme(scheme, contrast);
      assert.notEqual(diff.name, theme.name);
      const backgrounds = [background];
      for (const [kind, key] of [
        ['addition', 'gitDecoration.addedResourceForeground'],
        ['deletion', 'gitDecoration.deletedResourceForeground'],
      ]) {
        const change = diff.colors[key];
        assert.ok(wcagContrast(change, background) >= target, `${scheme} ${contrast} ${kind}`);
        const { mix, alpha } = diffTints[kind][scheme];
        const line = formatHex(interpolate([background, change], 'lab')(mix));
        const [top, bottom] = [rgb(change), rgb(line)];
        const word = formatHex({
          mode: 'rgb',
          r: top.r * alpha + bottom.r * (1 - alpha),
          g: top.g * alpha + bottom.g * (1 - alpha),
          b: top.b * alpha + bottom.b * (1 - alpha),
        });
        backgrounds.push(line, word);
      }
      for (const color of textColors(diff))
        for (const tint of backgrounds)
          assert.ok(
            wcagContrast(color, tint) >= target,
            `diff ${scheme} ${contrast} ${color} on ${tint}: ${wcagContrast(color, tint)}`,
          );
    }
});
