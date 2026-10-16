import { useState } from 'react';
import { Card, Stack, Text } from '@envsemble/envui';

const options = [
  { id: 'blank', title: 'Blank project', detail: 'Start with an empty plan.' },
  { id: 'template', title: 'From a template', detail: 'Pick a plan another team shared.' },
  { id: 'import', title: 'Import a file', detail: 'Bring in a spreadsheet or a document.' },
];

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 12rem), 1fr))',
  gap: '1rem',
} as const;

export default function StartOptions() {
  const [started, setStarted] = useState<string>();
  return (
    <Stack gap={3}>
      <div style={grid}>
        {options.map(({ id, title, detail }) => (
          // A button card holds phrasing content only, so its text is spans.
          <Card key={id} as="button" onClick={() => setStarted(title)}>
            <Text as="span" variant="section-heading">
              {title}
            </Text>
            <Text as="span" tone="muted">
              {detail}
            </Text>
          </Card>
        ))}
        <Card as="button" disabled>
          <Text as="span" variant="section-heading">
            Copy a project
          </Text>
          <Text as="span" tone="muted">
            Available once you have a project.
          </Text>
        </Card>
      </div>
      <Text variant="caption" tone="muted" role="status">
        {started && `Starting: ${started}`}
      </Text>
    </Stack>
  );
}
