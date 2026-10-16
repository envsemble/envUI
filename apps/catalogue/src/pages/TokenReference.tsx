import { ColorSwatch, Stack, Table, Text } from '@envsemble/envui';
import { Code } from '@envsemble/envui/content';
import tokenList from '../../../../packages/ui/src/generated/tokens.json';
// The ids search leads to, as the search index writes them.
import { tokenSection } from '../../../../scripts/SearchAnchors.mjs';

type Token = (typeof tokenList.tokens)[number];
type TokenValue = Token['values']['light'];

/**
 * The groups of the reference, by the first part of the tokens' names, in order. The color roles
 * are color.bg, color.fg and color.border; the other colors are component tokens.
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
  // Tokens of a family the groups above don't name yet, so every token has a row.
  { title: 'Other tokens', prefixes: [] },
];

function groupOf(token: Token) {
  const prefix = token.id.split('.')[0];
  const component = prefix === 'color' && !/^color.(?:bg|fg|border)./.test(token.id);
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

/** A value, with a sample of the color for a color token. */
function Value({ token, value }: { token: Token; value: TokenValue | undefined }) {
  const text = valueText(value);
  if (token.type !== 'color' || typeof value?.resolved !== 'string')
    return <Code className="docs-prop-code">{text}</Code>;
  return (
    <span className="docs-token-color">
      <ColorSwatch color={value.resolved} />
      <Code className="docs-prop-code">{text}</Code>
    </span>
  );
}

function TokenTable({ title, tokens }: { title: string; tokens: Token[] }) {
  const colors = tokens[0]?.type === 'color';
  const columns = colors
    ? (['light', 'dark', 'light-high-contrast', 'dark-high-contrast'] as const)
    : undefined;
  const headings = colors ? ['Light', 'Dark', 'Light, high contrast', 'Dark, high contrast'] : [];
  return (
    <Stack as="section" gap={4} aria-labelledby={`tokens-${title}`}>
      <Text as="h2" variant="section-heading" id={`tokens-${title}`}>
        {title}
      </Text>
      <Table.Root aria-label={`${title} tokens`} narrowLayout="stack" stackBelow="40rem">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Token</Table.HeaderCell>
            {colors ? (
              headings.map((heading) => (
                <Table.HeaderCell key={heading}>{heading}</Table.HeaderCell>
              ))
            ) : (
              <>
                <Table.HeaderCell>Comfortable</Table.HeaderCell>
                <Table.HeaderCell>Compact</Table.HeaderCell>
              </>
            )}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {tokens.map((token) => {
            const description = 'description' in token ? token.description : undefined;
            const compact = 'scales' in token ? token.scales?.compact : undefined;
            return (
              <Table.Row key={token.id} id={tokenSection(token.cssVariable)}>
                <Table.Cell label="Token">
                  <Stack gap={1} align="start">
                    <Code className="docs-prop-code">{token.cssVariable}</Code>
                    {description && <Text variant="caption">{description}</Text>}
                  </Stack>
                </Table.Cell>
                {columns ? (
                  columns.map((theme, index) => (
                    <Table.Cell key={theme} label={headings[index]}>
                      <Value token={token} value={token.values[theme]} />
                    </Table.Cell>
                  ))
                ) : (
                  <>
                    <Table.Cell label="Comfortable">
                      <Value token={token} value={token.values.light} />
                    </Table.Cell>
                    <Table.Cell label="Compact">
                      <Value token={token} value={compact ?? token.values.light} />
                    </Table.Cell>
                  </>
                )}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Stack>
  );
}

/**
 * Every token, generated from the token list that the token build writes from the DTCG source:
 * colors in each theme, other tokens in each scale. Search leads to a token's row.
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
