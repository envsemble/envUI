// The Terrazzo config of envUI's tokens: plugin-css for Tokens.css, envUI's plugin for the token
// list, and the lint rules with what they compare, read from the token sources.
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

/**
 * A fresh config, so a long-running build (the site's dev server) reads the tokens anew.
 * `tokensDirectory` and `outDir` (file URLs ending in a slash) build other tokens elsewhere.
 */
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
        // The value checks for every DTCG type, as Terrazzo recommends; names must be kebab-case.
        ...RECOMMENDED_CONFIG,
        'core/consistent-naming': ['error', { format: 'kebab-case' }],
        'envui/declared-once': ['error', { duplicates: duplicateTokens(tokensDirectory) }],
        'envui/color-schemes': ['error', { dark }],
        'envui/high-contrast': [
          'error',
          {
            light: declaredTokens(
              readTokenSource('base/contrast-high.tokens.json', tokensDirectory),
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
