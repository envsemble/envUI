import { useState } from 'react';
import { Column } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/markdown';

export const mount = 'standalone';

const narrow = `| Setting | Value |
| ------- | ----- |
| \`notificationDeliveryScheduleOverride\` | on |
`;

const keys = `- <kbd>Ctrl</kbd>+<kbd>K</kbd> opens search
- Press <kbd>Esc</kbd> or <kbd>Enter</kbd>
`;

function RenderedAgain() {
  const [round, setRound] = useState(0);
  return (
    <div data-testid="rendered-again">
      <button type="button" onClick={() => setRound((count) => count + 1)}>
        Render again
      </button>
      <Markdown renderLink={({ href, ...link }) => <a {...link} href={href} data-round={round} />}>
        {`## Plans

See [the prices](#prices).`}
      </Markdown>
    </div>
  );
}

export default function MarkdownFixture() {
  return (
    <Column gap={6}>
      <div data-testid="keys">
        <Markdown>{keys}</Markdown>
      </div>
      <div data-testid="narrow" style={{ inlineSize: '12rem' }}>
        <Markdown>{narrow}</Markdown>
      </div>
      <RenderedAgain />
    </Column>
  );
}
