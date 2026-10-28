import { Column, Text } from '@envsemble/envui';
import { ColorSwatch } from '@envsemble/envui/color';
import { PlainCode, SimpleTable } from '../template/SimpleTable';
// Every token with its value in each theme and scale, as the token build writes it; no entry of
// the package exports this data, so the reference reads the generated file.
import tokenList from '../../../../packages/ui/src/generated/tokens.json';
// The ids search leads to, as the search index writes them.
import { tokenSection } from '../shared/SearchAnchors';

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

/** The themes a color takes a value in, by their names. */
const themes = [
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['light-high-contrast', 'Light high contrast'],
  ['dark-high-contrast', 'Dark high contrast'],
] as const;

/** One value in plain monospace, with a small swatch of the color for a color token. */
function Value({ token, value }: { token: Token; value?: TokenValue }) {
  const color = token.type === 'color' && typeof value?.resolved === 'string';
  return (
    <span className="docs-token-value">
      {color && <ColorSwatch color={value.resolved as string} />}
      <PlainCode>{valueText(value)}</PlainCode>
    </span>
  );
}

/** A token's name in plain monospace, with what it is for below in small muted text. */
function TokenName({ token }: { token: Token }) {
  const description = 'description' in token ? token.description : undefined;
  return (
    <>
      <PlainCode name>{token.cssVariable}</PlainCode>
      {description && <span className="docs-token-description">{description}</span>}
    </>
  );
}

/**
 * A group of tokens as a simple table: colors with their value in each theme, other tokens at
 * each scale.
 */
function TokenTable({ title, tokens }: { title: string; tokens: Token[] }) {
  const colors = tokens[0]?.type === 'color';
  const columns = colors
    ? [
        { title: 'Token', width: '36%' },
        ...themes.map(([, label]) => ({ title: label, width: '16%' })),
      ]
    : [
        { title: 'Token', width: '50%' },
        { title: 'Comfortable', width: '25%' },
        { title: 'Compact', width: '25%' },
      ];
  return (
    <Column render={<section />} gap={4} aria-labelledby={`tokens-${title}`}>
      <Text render={<h2 />} variant="title" id={`tokens-${title}`}>
        {title}
      </Text>
      <SimpleTable
        label={`${title} tokens`}
        columns={columns}
        rows={tokens.map((token) => {
          const compact = 'scales' in token ? token.scales?.compact : undefined;
          return {
            key: token.id,
            id: tokenSection(token.cssVariable),
            cells: [
              <TokenName key="name" token={token} />,
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
    </Column>
  );
}

/**
 * Every token, generated from the token list that the token build writes from the DTCG source:
 * colors with a swatch in each theme, other tokens at each scale. Search leads to a token's row.
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
          <TokenTable key={group.title} title={group.title} tokens={tokens} />
        ) : null;
      })}
    </>
  );
}
