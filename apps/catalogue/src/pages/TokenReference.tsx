import { ColorSwatch, Column, Text } from '@envsemble/envui';
import { Code } from '@envsemble/envui/content';
import tokenList from '../../../../packages/ui/src/generated/tokens.json';
// The ids search leads to, as the search index writes them.
import { tokenSection } from '../../../../scripts/SearchAnchors.mjs';

type Token = (typeof tokenList.tokens)[number];
type TokenValue = Token['values']['light'];

/**
 * The groups of the reference, by the first part of the tokens' names, in order. The color roles
 * are color.bg, color.fg and color.border; the other colors are system tokens named for a component.
 */
const tokenGroups: { title: string; prefixes: string[]; component?: boolean }[] = [
  { title: 'Color roles', prefixes: ['color'] },
  { title: 'Component colors', prefixes: ['color'], component: true },
  { title: 'Elevation', prefixes: ['elevation'] },
  { title: 'Typography', prefixes: ['font', 'type', 'body'] },
  { title: 'Spacing', prefixes: ['space'] },
  { title: 'Corners', prefixes: ['radius'] },
  {
    title: 'Sizes',
    prefixes: ['control', 'field', 'row', 'tree', 'icon', 'title-bar', 'topbar'],
  },
  { title: 'Motion', prefixes: ['motion'] },
  { title: 'States', prefixes: ['state'] },
  // Tokens of a family the groups above don't name yet, so every token is listed.
  { title: 'Other tokens', prefixes: [] },
];

function groupOf(token: Token) {
  const prefix = token.id.split('.')[0];
  const component = prefix === 'color' && !/^color\.(?:bg|fg|border)\./.test(token.id);
  return (
    tokenGroups.find(
      (group) => group.prefixes.includes(prefix) && Boolean(group.component) === component,
    ) ?? tokenGroups.at(-1)
  );
}

const valueText = (value: TokenValue | undefined) => {
  const resolved = value?.resolved;
  if (resolved === undefined) return '—';
  return typeof resolved === 'string'
    ? resolved
    : Object.entries(resolved)
        .map(([property, part]) => `${property}: ${part}`)
        .join('; ');
};

/** The themes a color takes a value in, and the scales of the other tokens, by their names. */
const themes = [
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['light-high-contrast', 'Light, high contrast'],
  ['dark-high-contrast', 'Dark, high contrast'],
] as const;

/** One value, named, with a swatch of the color for a color token. */
function Value({ token, label, value }: { token: Token; label: string; value?: TokenValue }) {
  const color = token.type === 'color' && typeof value?.resolved === 'string';
  return (
    <span className="docs-token-value">
      {color && <ColorSwatch color={value.resolved as string} />}
      {label && (
        <Text render={<span />} variant="caption">
          {label}
        </Text>
      )}
      <Code className="docs-prop-code">{valueText(value)}</Code>
    </span>
  );
}

/** A token's values: a color in each theme, another token at each scale, or its one value. */
function Values({ token }: { token: Token }) {
  if (token.type === 'color')
    return themes.map(([theme, label]) => (
      <Value key={theme} token={token} label={label} value={token.values[theme]} />
    ));
  const compact = 'scales' in token ? token.scales?.compact : undefined;
  if (!compact || valueText(compact) === valueText(token.values.light))
    return <Value token={token} label="" value={token.values.light} />;
  return (
    <>
      <Value token={token} label="Comfortable" value={token.values.light} />
      <Value token={token} label="Compact" value={compact} />
    </>
  );
}

/** A group of tokens as a list, each token its name, what it is for and its values. */
function TokenList({ title, tokens }: { title: string; tokens: Token[] }) {
  return (
    <Column render={<section />} gap={4} aria-labelledby={`tokens-${title}`}>
      <Text render={<h2 />} variant="title" id={`tokens-${title}`}>
        {title}
      </Text>
      <ul className="docs-token-list" aria-label={`${title} tokens`}>
        {tokens.map((token) => {
          const description = 'description' in token ? token.description : undefined;
          return (
            <li key={token.id} id={tokenSection(token.cssVariable)} className="docs-token">
              <Column gap={1} align="start">
                <Code className="docs-prop-code">{token.cssVariable}</Code>
                {description && <Text variant="caption">{description}</Text>}
              </Column>
              <div className="docs-token-values">
                <Values token={token} />
              </div>
            </li>
          );
        })}
      </ul>
    </Column>
  );
}

/**
 * Every token, generated from the token list that the token build writes from the DTCG source:
 * colors with a swatch in each theme, other tokens at each scale. Search leads to a token.
 */
export function TokenReference() {
  return (
    <>
      <Text>
        Each token is a CSS custom property on every envUI theme boundary. Use the semantic names in
        application styles; the values change with the theme, the contrast and the scale. Names
        before 1.0, such as the 0.7 aliases, are listed in the migration guide with what replaces
        them.
      </Text>
      {tokenGroups.map((group) => {
        const tokens = tokenList.tokens.filter((token) => groupOf(token) === group);
        return tokens.length ? (
          <TokenList key={group.title} title={group.title} tokens={tokens} />
        ) : null;
      })}
    </>
  );
}
