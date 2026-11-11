import { useState } from 'react';
import { Column } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/markdown';

export const mount = 'standalone';

const narrow = `| Setting | Value |
| ------- | ----- |
| \`notificationDeliveryScheduleOverride\` | on |
`;

// Items whose keys run in their line, the first key starting one.
const keys = `- <kbd>Ctrl</kbd>+<kbd>K</kbd> opens search
- Press <kbd>Esc</kbd> or <kbd>Enter</kbd>
`;

/**
 * Markdown under a parent that renders again, with an inline renderLink, a new function each time,
 * as an application writes it: its elements stay the same while the link shows the latest one.
 */
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

/** Key caps in list items, inline code in a narrow table cell, and Markdown rendered again. */
export default function MarkdownFixture() {
  return (
    <Column gap={6}>
      <div data-testid="keys">
        <Markdown>{keys}</Markdown>
      </div>
      {/* A narrow column, where a cell's code would otherwise break inside its word. */}
      <div data-testid="narrow" style={{ inlineSize: '12rem' }}>
        <Markdown>{narrow}</Markdown>
      </div>
      <RenderedAgain />
    </Column>
  );
}
