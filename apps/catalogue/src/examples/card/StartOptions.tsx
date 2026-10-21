import { useState } from 'react';
import { Card, Stack, Text } from '@envsemble/envui';

const options = [
  { id: 'blank', title: 'Blank project', detail: 'Start with an empty plan.' },
  { id: 'template', title: 'From a template', detail: 'Pick a plan another team shared.' },
  { id: 'import', title: 'Import a file', detail: 'Bring in a spreadsheet or a document.' },
];

const grid = {
  display: 'grid',
  inlineSize: '100%',
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
          <Card key={id} onClick={() => setStarted(title)}>
            <Text render={<span />} variant="title">
              {title}
            </Text>
            <Text render={<span />} emphasis="muted">
              {detail}
            </Text>
          </Card>
        ))}
        <Card disabled onClick={() => setStarted('Copy a project')}>
          <Text render={<span />} variant="title">
            Copy a project
          </Text>
          <Text render={<span />} emphasis="muted">
            Available once you have a project.
          </Text>
        </Card>
      </div>
      <Text variant="caption" emphasis="muted" role="status">
        {started && `Starting: ${started}`}
      </Text>
    </Stack>
  );
}
