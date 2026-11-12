import { ColorSwatch } from '@envsemble/envui/color';
import { PlainCode } from './SimpleTable';
// Every token with its value in each theme and scale, as the token build writes it; no entry of
// the package exports this data, so the reference reads the generated file.
import tokenList from '@envsemble/envui/tokens.json';
// The ids search leads to, as the search index writes them.
import { tokenSection } from '../../documentation/SearchAnchors';
import { groupOf, themes, tokenGroups, tokenValueText } from './TokenGroups';
import { TokenIntro, TokenName, TokenTable } from './TokenTables';

type Token = (typeof tokenList.tokens)[number];
type TokenValue = Token['values']['light'];

/** One value in plain monospace, with a small swatch of the color for a color token. */
function Value({ token, value }: { token: Token; value?: TokenValue }) {
  const color = token.type === 'color' && typeof value?.resolved === 'string';
  return (
    <span className="docs-token-value">
      {color && <ColorSwatch color={value.resolved as string} />}
      <PlainCode>{tokenValueText(value?.resolved)}</PlainCode>
    </span>
  );
}

/**
 * Every token, generated from the token list that the token build writes from the DTCG source:
 * colors with a swatch in each theme, other tokens at each scale. Search leads to a token's row.
 */
export function TokenReference() {
  return (
    <>
      <TokenIntro />
      {tokenGroups.map((group) => {
        const tokens = tokenList.tokens.filter((token) => groupOf(token) === group);
        if (!tokens.length) return null;
        const colors = tokens[0]?.type === 'color';
        return (
          <TokenTable
            key={group.title}
            title={group.title}
            colors={colors}
            rows={tokens.map((token) => {
              const compact = 'scales' in token ? token.scales?.compact : undefined;
              return {
                key: token.id,
                id: tokenSection(token.cssVariable),
                cells: [
                  <TokenName
                    key="name"
                    name={token.cssVariable}
                    description={'description' in token ? token.description : undefined}
                  />,
                  ...(colors
                    ? themes.map(([theme]) => (
                        <Value key={theme} token={token} value={token.values[theme]} />
                      ))
                    : [
                        <Value key="comfortable" token={token} value={token.values.light} />,
                        <Value key="compact" token={token} value={compact ?? token.values.light} />,
                      ]),
                ],
              };
            })}
          />
        );
      })}
    </>
  );
}
