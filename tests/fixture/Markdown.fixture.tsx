import { useState } from 'react';
import { EnvUIProvider, Column } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/markdown';

export const mount = 'standalone';

const document = `## Prices

| Plan | Price |
| ---- | ----- |
| Team | 12    |

| Key | Action |
| --- | ------ |
| Esc | Close  |

| Key | Action |
| --- | ------ |
| Tab | Next   |

Prices are **per seat**, billed monthly.

---

- [x] Draft the brief
- [ ] Send it to Sam Lee
`;

const narrow = `| Setting | Value |
| ------- | ----- |
| \`notificationDeliveryScheduleOverride\` | on |
`;

const lists = `- Confirm the pricing
- Review the plan
  - Keep the notes

1. Freeze the copy
2. Publish the notes
   1. Draft them
`;

// Items whose keys run in their line, the first key starting one.
const keys = `- <kbd>Ctrl</kbd>+<kbd>K</kbd> opens search
- Press <kbd>Esc</kbd> or <kbd>Enter</kbd>
`;

/**
 * Markdown tables, tasks, inline code in a cell and lists.
 */
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

export default function MarkdownFixture() {
  return (
    <Column gap={6}>
      <div data-testid="english">
        <Markdown>{document}</Markdown>
      </div>
      <EnvUIProvider
        messages={{
          markdown: {
            table: 'Tabelle',
            tableNamed: ({ name }) => `Tabelle ${name}`,
            taskDone: 'Erledigte Aufgabe',
            taskOpen: 'Offene Aufgabe',
          },
        }}
      >
        <div data-testid="german">
          <Markdown>{document}</Markdown>
        </div>
      </EnvUIProvider>
      <div data-testid="lists">
        <Markdown>{lists}</Markdown>
      </div>
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
