import { Card, Column, Theme } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import { CodeDiff } from '@envsemble/envui/diff';

const before = '{\n  "theme": "light",\n  "density": "standard"\n}';
const after = '{\n  "theme": "system",\n  "density": "standard",\n  "language": "en"\n}';

/**
 * A code block above a diff of the same JSON, on the page and on a card, in the light and the dark
 * theme, mounted with ?fixture=code-diff.
 */
export function CodeDiffFixture() {
  return (
    <Column gap={4}>
      {(['light', 'dark'] as const).map((theme) => (
        <Theme key={theme} theme={theme} data-testid={theme}>
          <Column gap={4} style={{ padding: '1rem' }}>
            <CodeBlock language="json" data-testid="block">
              {after}
            </CodeBlock>
            <CodeDiff before={before} after={after} filename="settings.json" layout="unified" />
            <Card data-testid="card">
              <CodeDiff before={before} after={after} filename="settings.json" layout="unified" />
            </Card>
          </Column>
        </Theme>
      ))}
    </Column>
  );
}
