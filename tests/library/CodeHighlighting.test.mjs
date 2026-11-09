import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { highlightCode } from '../../packages/ui/dist/content/internal/codeHighlighting.js';
import { tokenStyle } from '../../packages/ui/dist/content/internal/codeTokenStyle.js';

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

test('every theme boundary sets the code colors codeColors.ts gives its theme', async () => {
  const { codeThemeStyle } = await import('../../packages/ui/dist/content/internal/codeColors.js');
  const css = await readFile(
    new URL('../../packages/ui/src/styles/Code.css', import.meta.url),
    'utf8',
  );
  // The code colors each rule of a selector declares, in the order of the style sheet.
  const declared = (selector) => {
    const properties = {};
    for (const [, at, body] of css.matchAll(/^ {2}([^\n{]+) \{([^}]*)\}/gm))
      if (at === selector)
        for (const [, name, value] of body.matchAll(
          /(--env-code-(?:back|fore)ground[\w-]*): ([^;]+);/g,
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
    await import('../../packages/ui/dist/content/internal/codeThemes.js');
  const { codeBackgrounds, codeColors, codeContrastTargets, diffTintOpacity } =
    await import('../../packages/ui/dist/content/internal/codeColors.js');
  const tokenList = JSON.parse(
    await readFile(new URL('../../packages/ui/src/generated/tokens.json', import.meta.url), 'utf8'),
  );
  const tokens = Object.fromEntries(tokenList.tokens.map((token) => [token.id, token]));
  const { over, readableReplacements } =
    await import('../../packages/ui/dist/content/internal/readableColors.js');
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
        `${scheme} ${contrast}: update codeColors.ts to the installed themes`,
      );
      // Inline code and a block's plain text take the theme's foreground, on either background.
      assert.equal(theme.colors['editor.foreground'], foreground);
      for (const surface of [...blocks, ...inlines])
        assert.ok(
          wcagContrast(foreground, surface) >= target,
          `${scheme} ${contrast} foreground ${foreground} on ${surface}`,
        );
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

      // Diffs: on a block's layer with the code theme itself, its change colors readable there,
      // and every token readable on the lines and words it tints, as the browser composites them.
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
        // In dark a line keeps less of the change color's chroma than its gutter, which carries
        // the change; at high contrast both are as dark as the tokens need.
        if (scheme === 'dark' && contrast === 'standard')
          assert.ok(
            chroma(tints[kind]) < chroma(tints[`${kind}Gutter`]),
            `${scheme} ${contrast} ${kind}: the line's tint is quieter than the gutter's`,
          );
        for (const fill of [tints[kind], tints[`${kind}Gutter`]])
          for (const block of blocks) {
            const line = over(fill, diffTintOpacity.line, block);
            const word = over(fill, diffTintOpacity.word, line);
            // A tint people can see: a step from the block, as the block is from its surface.
            assert.ok(
              differenceEuclidean('oklab')(line, block) >= 0.01,
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
