import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { highlightCode } from '../packages/ui/dist/content/internal/CodeHighlighting.js';
import { tokenStyle } from '../packages/ui/dist/content/internal/codeTokenStyle.js';

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

test('tokens carry high-contrast colors only when asked, which loads those themes', async () => {
  const standard = await highlightCode('const a = 1;', 'javascript');
  assert.ok(standard.flat().every((token) => !token.lightHigh && !token.darkHigh));
  const high = await highlightCode('const a = 1;', 'javascript', true);
  assert.ok(high.flat().some((token) => token.lightHigh?.color && token.darkHigh?.color));
});

test('a token without high-contrast styles takes its standard color at high contrast', () => {
  assert.deepEqual(tokenStyle({ color: '#123456', fontStyle: 1 }, undefined), {
    '--env-code-token': '#123456',
    '--env-code-token-high': '#123456',
    fontStyle: 'italic',
    fontWeight: undefined,
    textDecoration: undefined,
  });
  assert.equal(tokenStyle({ color: '#123456' }, {})['--env-code-token-high'], '#123456');
  assert.equal(
    tokenStyle({ color: '#123456' }, { color: '#000000' })['--env-code-token-high'],
    '#000000',
  );
  assert.deepEqual(tokenStyle({ fontStyle: 2 | 4 | 8 }), {
    '--env-code-token': undefined,
    '--env-code-token-high': undefined,
    fontStyle: undefined,
    fontWeight: 700,
    textDecoration: 'underline line-through',
  });
});

test('every highlighted token is readable on its code background, in code blocks and diffs', async () => {
  const { wcagContrast, interpolate, formatHex, rgb, differenceEuclidean } = await import('culori');
  const { codeTheme, diffTheme } = await import(
    '../packages/ui/dist/content/internal/CodeThemes.js'
  );
  const { codeBackgrounds, codeColors, codeContrastTargets, diffBackground } = await import(
    '../packages/ui/dist/content/internal/CodeColors.js'
  );
  const { tokens } = await import('../packages/ui/src/generated/tokens.ts');
  const { over, readableReplacements } = await import(
    '../packages/ui/dist/content/internal/ReadableColors.js'
  );
  const { diffTints } = await import('../packages/ui/dist/content/internal/CodeDiffTints.js');
  const { tintsFile, tintsSource } = await import('../scripts/GenerateCodeThemes.mjs');
  assert.equal(
    readFileSync(tintsFile, 'utf8'),
    await tintsSource(),
    'Run node scripts/GenerateCodeThemes.mjs and commit CodeDiffTints.ts.',
  );
  const theme = async (name) => (await import(`shiki/themes/${name}.mjs`)).default;
  const github = {
    light: {
      standard: await theme('github-light-default'),
      high: await theme('github-light-high-contrast'),
    },
    dark: {
      standard: await theme('github-dark-dimmed'),
      high: await theme('github-dark-high-contrast'),
    },
  };
  // AA for text in the standard themes, AAA under high contrast.
  const targets = { standard: 4.5, high: 7 };
  const samples = {
    tsx: "import { Button } from '@envsemble/envui';\n// Saves the draft.\nexport const Save = ({ count = 2 }) => <Button onClick={() => save(String(count))}>Save {true}</Button>;",
    css: '.card:hover { color: var(--env-color-fg-default); margin: 0 1rem !important; }',
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
    for (const line of await highlightCode(source, language, true))
      for (const token of line)
        for (const [key, [scheme, contrast]] of Object.entries(variants)) {
          const color = token[key].color;
          if (!color || !token.content.trim()) continue;
          for (const background of codeBackgrounds('block', scheme, contrast)) {
            const ratio = wcagContrast(color, background);
            assert.ok(
              ratio >= targets[contrast],
              `${language} ${key} "${token.content}" ${color} on ${background}: ${ratio}`,
            );
          }
        }

  /** The text colors of a theme, from its token rules and foreground. */
  const textColors = (theme) => [
    theme.colors['editor.foreground'],
    ...(theme.tokenColors ?? []).map((rule) => rule.settings?.foreground).filter(Boolean),
  ];
  /**
   * Each original token color of a Shiki theme, with what a readable theme made of it, matched by
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
      const target = targets[contrast];
      const theme = await codeTheme(scheme, contrast);
      const colors = codeColors(scheme, contrast);
      // Code sits on the page, a pane or card, a raised surface, a popup, a muted fill or a list
      // item, as the tokens give them; inline code's layer is the neutral muted fill.
      const tokenTheme = `${scheme}${contrast === 'high' ? '-high-contrast' : ''}`;
      const value = (id) => tokens[id].values[tokenTheme];
      assert.deepEqual(
        [...colors.surfaces].sort(),
        [
          ...new Set(
            [
              ...['page', 'default', 'raised', 'popup', 'muted'].map((name) => `color.bg.${name}`),
              'color.list-item.bg',
            ].map(value),
          ),
        ].sort(),
        `${scheme} ${contrast}: update the surfaces in CodeColors.ts to the color tokens`,
      );
      const { color: layer, alpha } = colors.inline;
      const [r, g, b] = [1, 3, 5].map((start) =>
        Number.parseInt(layer.slice(start, start + 2), 16),
      );
      assert.equal(`rgb(${r} ${g} ${b} / ${alpha})`, value('color.bg.neutral.muted'));
      // Blocks and inline code are a step from every surface they sit on, as a level of the
      // background ladder is from the next.
      const blocks = codeBackgrounds('block', scheme, contrast);
      const inlines = codeBackgrounds('inline', scheme, contrast);
      for (const kind of ['block', 'inline'])
        for (const surface of colors.surfaces) {
          const { color, alpha: opacity } = colors[kind];
          const step = wcagContrast(over(color, opacity, surface), surface);
          assert.ok(step >= 1.09, `${scheme} ${contrast} ${kind} on ${surface}: ${step}`);
        }
      for (const color of textColors(theme))
        for (const background of blocks)
          assert.ok(
            wcagContrast(color, background) >= target,
            `${scheme} ${contrast} ${color} on ${background}`,
          );
      // The foreground is the installed theme's, moved where it falls short on a block or inline
      // code over any surface.
      const original = github[scheme][contrast].colors;
      const fg = original['editor.foreground'];
      const readable =
        readableReplacements(
          [fg],
          [...blocks, ...inlines],
          codeContrastTargets[contrast],
          scheme === 'light' ? 'darker' : 'lighter',
        )[fg.toLowerCase()] ?? fg;
      const { foreground } = colors;
      assert.equal(
        foreground,
        readable,
        `${scheme} ${contrast}: update CodeColors.ts to the installed themes`,
      );
      // Inline code and a block's plain text take the theme's foreground, on either background.
      assert.equal(theme.colors['editor.foreground'], foreground);
      for (const surface of [...blocks, ...inlines])
        assert.ok(
          wcagContrast(foreground, surface) >= target,
          `${scheme} ${contrast} foreground ${foreground} on ${surface}`,
        );
      // Diffs sit on their own opaque background, from which Diffs mixes its line tints.
      const background = diffBackground(scheme, contrast);
      // Tokens that were distinct stay apart: by 0.02 in OKLab, or as far as they were.
      const distance = differenceEuclidean('oklab');
      const mapped = [...pairs(github[scheme][contrast], theme)];
      for (const [a, aAfter] of mapped)
        for (const [b, bAfter] of mapped)
          if (a < b)
            assert.ok(
              distance(aAfter, bAfter) >= Math.min(0.02, distance(a, b)) - 1e-3,
              `${scheme} ${contrast}: ${a} and ${b} became ${aAfter} and ${bAfter}`,
            );

      // Diffs: the change colors read on code's background, and the tokens on every line and word
      // Diffs tints with them, mixed as its style sheet mixes them.
      const diff = await diffTheme(scheme, contrast);
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
