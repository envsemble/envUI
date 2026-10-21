import { EnvUIProvider, Column } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';

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

- [x] Draft the brief
- [ ] Send it to Sam Lee
`;

const narrow = `| Setting | Value |
| ------- | ----- |
| \`notificationDeliveryScheduleOverride\` | on |
`;

/** Markdown tables, tasks and inline code in a cell, mounted with ?fixture=markdown-tables. */
export function MarkdownFixture() {
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
      {/* A narrow column, where a cell's code would otherwise break inside its word. */}
      <div data-testid="narrow" style={{ inlineSize: '12rem' }}>
        <Markdown>{narrow}</Markdown>
      </div>
    </Column>
  );
}
