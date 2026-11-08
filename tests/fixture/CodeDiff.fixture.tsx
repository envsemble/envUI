import { useState } from 'react';
import { Button, Card, Column, Theme } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/code';
import { CodeDiff } from '@envsemble/envui/diff';

export const mount = 'standalone';

const before = '{\n  "theme": "light",\n  "density": "standard"\n}';
const after = '{\n  "theme": "system",\n  "density": "standard",\n  "language": "en"\n}';

/** A file of 40 lines, changed in its first and last, so the lines between them fold. */
const lines = Array.from({ length: 40 }, (_, index) => `const line${index + 1} = ${index + 1};`);
const longBefore = lines.join('\n');
const longAfter = ['const line1 = 0;', ...lines.slice(1, -1), 'const line40 = 0;'].join('\n');

/** A diff in a theme that a button switches, to show it keeps its state through the switch. */
function SwitchedDiff() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <Column gap={4} data-testid="switched">
      <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Switch theme</Button>
      <Theme theme={theme}>
        <CodeDiff before={longBefore} after={longAfter} filename="lines.ts" layout="unified" />
      </Theme>
    </Column>
  );
}

/**
 * A code block above a diff of the same JSON, on the page and on a card, in the light and the dark
 * theme, and a diff whose theme switches, mounted with ?fixture=code-diff.
 */
export default function CodeDiffFixture() {
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
      <SwitchedDiff />
    </Column>
  );
}
