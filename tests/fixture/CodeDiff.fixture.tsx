import { useState } from 'react';
import { Button, Column, Theme } from '@envsemble/envui';
import { CodeDiff } from '@envsemble/envui/diff';

export const mount = 'standalone';

/** A file of 40 lines, changed in its first and last, so the lines between them fold. */
const lines = Array.from({ length: 40 }, (_, index) => `const line${index + 1} = ${index + 1};`);
const longBefore = lines.join('\n');
const longAfter = ['const line1 = 0;', ...lines.slice(1, -1), 'const line40 = 0;'].join('\n');

/** A diff in a theme that a button switches, to show it keeps its state through the switch. */
export default function CodeDiffFixture() {
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
