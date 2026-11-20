import { RECOMMENDED_CONFIG, type Config } from '@terrazzo/parser';
import { tokenList } from './TokenList.ts';
import { tokensCss } from './TokensCss.ts';
import { scaleRules } from './Themes.ts';
import {
  aliasTargets,
  contextTokens,
  declaredTokens,
  defaultOutDir,
  defaultTokensDirectory,
  duplicateTokens,
  readTokenSource,
  resolverIn,
} from './TokenSources.ts';

export function createConfig({
  tokensDirectory = defaultTokensDirectory,
  outDir = defaultOutDir,
}: { tokensDirectory?: URL; outDir?: URL } = {}) {
  const dark = contextTokens('colorScheme', 'dark', tokensDirectory);
  const high = contextTokens('contrast', 'high', tokensDirectory);
  const scaleTokens = Object.fromEntries(
    scaleRules.map((scale) => [scale.name, contextTokens('scale', scale.name, tokensDirectory)]),
  );
  return {
    tokens: [resolverIn(tokensDirectory).href],
    outDir: outDir.href,
    plugins: [
      tokensCss({ dark, high, scaleTokens }),
      tokenList({
        handwrittenFile: new URL('styles/TokensHandwritten.css', outDir),
        handwrittenList: new URL('handwritten.json', tokensDirectory),
      }),
    ],
    lint: {
      build: { enabled: true },
      rules: {
        ...RECOMMENDED_CONFIG,
        'core/consistent-naming': ['error', { format: 'kebab-case' }],
        'envui/declared-once': ['error', { duplicates: duplicateTokens(tokensDirectory) }],
        'envui/color-schemes': ['error', { dark }],
        'envui/high-contrast': [
          'error',
          {
            light: declaredTokens(
              readTokenSource('base/light-contrast-high.tokens.json', tokensDirectory),
            ),
            dark: declaredTokens(
              readTokenSource('color-scheme/dark-contrast-high.tokens.json', tokensDirectory),
            ),
            pointers: aliasTargets(readTokenSource('contrast/high.tokens.json', tokensDirectory)),
          },
        ],
        'envui/unique-css-names': ['error', {}],
      },
    },
  } satisfies Config;
}
