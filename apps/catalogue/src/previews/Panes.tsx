import { useState } from 'react';
import { NavigationItem, SplitView, Stack, Text } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Example } from './Example';
import { Preview } from './Preview';

const documents = [
  {
    id: 'report',
    title: 'Quarterly report',
    summary: 'Revenue grew in every region this quarter.',
  },
  {
    id: 'tokens',
    title: 'design-system/tokens',
    summary: 'The token migration is behind schedule by two weeks.',
  },
  { id: 'hiring', title: 'Hiring plan', summary: 'Support hiring trails the plan by two people.' },
  { id: 'review', title: 'Design review', summary: 'Aurora reviews the new navigation on Friday.' },
];

export function SplitViewPreview() {
  const [selected, setSelected] = useState(documents[0]!.id);
  const [size, setSize] = useState(35);
  const document = documents.find((item) => item.id === selected)!;
  return (
    <Preview>
      <Example
        title="List and details"
        size="wide"
        caption={
          <>
            Drag the divider or focus it and use the arrow keys; a double click restores the
            default. Below 36 rem of its own width, the panes stack. Start pane: {Math.round(size)}
            %.
          </>
        }
      >
        <SplitView
          defaultSize={35}
          minSize={25}
          maxSize={65}
          stackBelow="36rem"
          resizeLabel="Resize document list"
          onSizeChange={setSize}
          style={{ blockSize: '18rem' }}
          start={
            <Stack as="nav" gap={1} aria-label="Documents">
              {documents.map((item) => (
                <NavigationItem
                  key={item.id}
                  icon={<Description />}
                  selected={item.id === selected}
                  onClick={() => setSelected(item.id)}
                >
                  {item.title}
                </NavigationItem>
              ))}
            </Stack>
          }
          end={
            <Stack gap={2}>
              <Text as="h3" variant="section-heading">
                {document.title}
              </Text>
              <Text tone="muted">{document.summary}</Text>
            </Stack>
          }
        />
      </Example>
    </Preview>
  );
}
