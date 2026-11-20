import { useState } from 'react';
import { Button, Column, Theme } from '@envsemble/envui';
import { CodeDiff } from '@envsemble/envui/diff';

export const mount = 'standalone';

const lines = Array.from({ length: 40 }, (_, index) => `const line${index + 1} = ${index + 1};`);
const longBefore = lines.join('\n');
const longAfter = ['const line1 = 0;', ...lines.slice(1, -1), 'const line40 = 0;'].join('\n');

export default function CodeDiffFixture() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <Column gap={4} data-testid="switched">
      <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Switch theme</Button>
      <Theme theme={theme}>
        <CodeDiff before={longBefore} after={longAfter} filename="lines.ts" layout="unified" />
      </Theme>
      <div data-testid="annotated" style={{ inlineSize: '30rem' }}>
        <CodeDiff
          before={longBefore}
          after={longAfter}
          filename="annotated.ts"
          layout="split"
          headerEnd={<button type="button">View file</button>}
          annotations={[{ side: 'additions', lineNumber: 1, data: 'Why zero?' }]}
          renderAnnotation={(annotation) => (
            <p className="fixture-annotation">{String(annotation.data)}</p>
          )}
        />
      </div>
      <div data-testid="auto" style={{ inlineSize: '60rem' }}>
        <CodeDiff before={longBefore} after={longAfter} filename="auto.ts" />
      </div>
    </Column>
  );
}
