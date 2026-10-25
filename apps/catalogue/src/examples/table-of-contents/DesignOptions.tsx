import { useRef, useState } from 'react';
import { Column, Row, SegmentedControl, TableOfContents, Text } from '@envsemble/envui';

// The three designs under review; the chosen one stays and the others go.
const designs = [
  { value: 'progress', label: 'Progress dots' },
  { value: 'pill', label: 'Pills' },
  { value: 'quiet', label: 'Quiet text' },
];

const sections = [
  { heading: 'Before you start', level: 4 },
  { heading: 'Create a workspace', level: 4 },
  { heading: 'Invite your team', level: 5 },
  { heading: 'Choose who can edit', level: 5 },
  { heading: 'Import your projects', level: 4 },
  { heading: 'Set up notifications', level: 4 },
  { heading: 'Next steps', level: 4 },
];

export default function DesignOptions() {
  const [design, setDesign] = useState('progress');
  const article = useRef<HTMLElement>(null);
  return (
    <Column gap={4} style={{ inlineSize: '100%' }}>
      <SegmentedControl
        aria-label="Design"
        size="sm"
        value={design}
        onValueChange={(value) => setDesign(value as string)}
        items={designs}
      />
      <div
        tabIndex={0}
        role="region"
        aria-label="Onboarding guide"
        style={{ blockSize: '20rem', inlineSize: '100%', overflow: 'auto' }}
      >
        <Row gap={6} align="start">
          <Column
            gap={6}
            render={<article ref={article} />}
            style={{ flex: 1, minInlineSize: 0, paddingBlockEnd: '12rem' }}
          >
            {sections.map(({ heading, level }) => (
              <Column key={heading} gap={2}>
                <Text variant="title" render={level === 4 ? <h4 /> : <h5 />}>
                  {heading}
                </Text>
                <Text>A few lines of the guide, enough to scroll past.</Text>
                <Text emphasis="muted">And a second paragraph under it.</Text>
              </Column>
            ))}
          </Column>
          <div style={{ position: 'sticky', insetBlockStart: 0, inlineSize: '12rem' }}>
            <TableOfContents
              aria-label="Sections of the guide"
              container={article}
              levels={[4, 5]}
              data-design={design}
            />
          </div>
        </Row>
      </div>
    </Column>
  );
}
