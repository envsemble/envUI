import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { highlightCode } from '../../../packages/ui/dist/content/internal/codeHighlighting.js';
import { tokenStyle } from '../../../packages/ui/dist/content/internal/codeTokenStyle.js';
import { join } from 'node:path';
import { styleSheetsDirectory, tokensDataFile } from '../../../scripts/RepositoryPaths.ts';

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

test('a token carries its colors in both code themes, its standard ones at high contrast where it has no high-contrast styles', () => {
  const token = (light, dark, lightHigh, darkHigh) => ({
    content: 'a',
    light,
    dark,
    lightHigh,
    darkHigh,
  });
  assert.deepEqual(tokenStyle(token({ color: '#123456', fontStyle: 1 }, { color: '#654321' })), {
    '--_code-token': '#123456',
    '--_code-token-high': '#123456',
    '--_code-token-dark': '#654321',
    '--_code-token-dark-high': '#654321',
    fontStyle: 'italic',
    fontWeight: undefined,
    textDecoration: undefined,
  });
  const high = tokenStyle(
    token({ color: '#123456' }, { color: '#654321' }, { color: '#000000' }, { color: '#ffffff' }),
  );
  assert.equal(high['--_code-token-high'], '#000000');
  assert.equal(high['--_code-token-dark-high'], '#ffffff');
  assert.deepEqual(tokenStyle(token({ fontStyle: 2 | 4 | 8 }, {})), {
    '--_code-token': undefined,
    '--_code-token-high': undefined,
    '--_code-token-dark': undefined,
    '--_code-token-dark-high': undefined,
    fontStyle: undefined,
    fontWeight: 700,
    textDecoration: 'underline line-through',
  });
});

test('the code themes style a token alike, so its font style is the same in either', async () => {
  const sources = [
    [
      [
        'export function A({ a }: { a?: string }) {',
        '  // A comment',
        '  return <b className="x">{a}</b>;',
        '}',
      ].join('\n'),
      'tsx',
    ],
    ['.a:hover { color: red; /* note */ }', 'css'],
    [['# Title', '', '*emphasis* **strong** `code`'].join('\n'), 'markdown'],
  ];
  for (const [source, language] of sources)
    for (const token of (await highlightCode(source, language, true)).flat())
      for (const style of [token.dark, token.lightHigh, token.darkHigh])
        assert.equal(
          style?.fontStyle ?? 0,
          token.light.fontStyle ?? 0,
          `${language}: ${token.content}`,
        );
});

test('every theme boundary sets the code colors codeColors.ts gives its theme', async () => {
  const { codeThemeStyle } =
    await import('../../../packages/ui/dist/content/internal/codeColors.js');
  const css = await readFile(join(styleSheetsDirectory, 'Code.css'), 'utf8');
  const declared = (selector) => {
    const properties = {};
    for (const [, at, body] of css.matchAll(/^ {2}([^\n{]+) \{([^}]*)\}/gm))
      if (at === selector)
        for (const [, name, value] of body.matchAll(
          /(--_code-(?:back|fore)ground[\w-]*): ([^;]+);/g,
        ))
          properties[name] = value;
    return properties;
  };
  for (const [scheme, selector] of [
    ['light', '.env-theme'],
    ['dark', ".env-theme[data-env-theme='dark']"],
  ]) {
    const { colorScheme, ...colors } = codeThemeStyle(scheme);
    assert.equal(colorScheme, scheme);
    assert.deepEqual(declared(selector), colors, `${scheme}: update Code.css to codeColors.ts`);
  }
});

test('every highlighted token is readable on its code background, in code blocks and diffs', async () => {
  const { wcagContrast, differenceEuclidean, oklch } = await import('culori');
  const chroma = (color) => oklch(color).c ?? 0;
  const { codeTheme, diffTintColors } =
    await import('../../../packages/ui/dist/content/internal/codeThemes.js');
  const { codeBackgrounds, codeColors, codeContrastTargets, diffTintOpacity } =
    await import('../../../packages/ui/dist/content/internal/codeColors.js');
  const tokenList = JSON.parse(await readFile(tokensDataFile, 'utf8'));
  const tokens = Object.fromEntries(tokenList.tokens.map((token) => [token.id, token]));
  const { over, readableReplacements } =
    await import('../../../packages/ui/dist/content/internal/readableColors.js');
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
  const wcagAAText = 4.5;
  const wcagAAAText = 7;
  const targets = { standard: wcagAAText, high: wcagAAAText };
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

  const textColors = (theme) => [
    theme.colors['editor.foreground'],
    ...(theme.tokenColors ?? []).map((rule) => rule.settings?.foreground).filter(Boolean),
  ];
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
      const tokenTheme = `${scheme}${contrast === 'high' ? '-high-contrast' : ''}`;
      const value = (id) => tokens[id].values[tokenTheme].resolved;
      assert.deepEqual(
        [...colors.surfaces].sort(),
        [
          ...new Set(
            [
              ...['page', 'default', 'raised', 'popup', 'muted'].map((name) => `color.bg.${name}`),
              'color.bg.list-item',
            ].map(value),
          ),
        ].sort(),
        `${scheme} ${contrast}: update the surfaces in codeColors.ts to the color tokens`,
      );
      const { color: layer, alpha } = colors.inline;
      const [r, g, b] = [1, 3, 5].map((start) =>
        Number.parseInt(layer.slice(start, start + 2), 16),
      );
      assert.equal(`rgb(${r} ${g} ${b} / ${alpha})`, value('color.bg.neutral.muted'));
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
        `${scheme} ${contrast}: update codeColors.ts to the installed themes`,
      );
      assert.equal(theme.colors['editor.foreground'], foreground);
      for (const surface of [...blocks, ...inlines])
        assert.ok(
          wcagContrast(foreground, surface) >= target,
          `${scheme} ${contrast} foreground ${foreground} on ${surface}`,
        );
      const distance = differenceEuclidean('oklab');
      const distinctTokensOklabDistance = 0.02;
      const mapped = [...pairs(github[scheme][contrast], theme)];
      for (const [a, aAfter] of mapped)
        for (const [b, bAfter] of mapped)
          if (a < b)
            assert.ok(
              distance(aAfter, bAfter) >=
                Math.min(distinctTokensOklabDistance, distance(a, b)) - 1e-3,
              `${scheme} ${contrast}: ${a} and ${b} became ${aAfter} and ${bAfter}`,
            );

      const tints = await diffTintColors(scheme, contrast);
      for (const [kind, key] of [
        ['addition', 'gitDecoration.addedResourceForeground'],
        ['deletion', 'gitDecoration.deletedResourceForeground'],
      ]) {
        for (const block of blocks)
          assert.ok(
            wcagContrast(theme.colors[key], block) >= target,
            `${scheme} ${contrast} ${kind} on ${block}`,
          );
        if (scheme === 'dark' && contrast === 'standard')
          assert.ok(
            chroma(tints[kind]) < chroma(tints[`${kind}Gutter`]),
            `${scheme} ${contrast} ${kind}: the line's tint is quieter than the gutter's`,
          );
        for (const fill of [tints[kind], tints[`${kind}Gutter`]])
          for (const block of blocks) {
            const line = over(fill, diffTintOpacity.line, block);
            const word = over(fill, diffTintOpacity.word, line);
            const visibleTintOklabDistance = 0.01;
            assert.ok(
              differenceEuclidean('oklab')(line, block) >= visibleTintOklabDistance,
              `${scheme} ${contrast} ${kind} line ${line} on ${block}`,
            );
            for (const color of textColors(theme))
              for (const tint of [line, word])
                assert.ok(
                  wcagContrast(color, tint) >= target,
                  `diff ${scheme} ${contrast} ${color} on ${tint}: ${wcagContrast(color, tint)}`,
                );
          }
      }
    }
});
