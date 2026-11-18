import { useEffect, useState } from 'react';
import { Column, List, Spinner, Text } from '@envsemble/envui';

const files = [
  { name: 'quarterly-report.pdf', edited: 'Edited today by Priya Shah' },
  { name: 'launch-plan.md', edited: 'Edited yesterday by Sam Lee' },
  { name: 'budget-2026.xlsx', edited: 'Edited on 2 March by Alex Morgan' },
];

export default function LoadingFiles() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const simulatedRequest = setTimeout(() => setLoaded(true), 2000);
    return () => clearTimeout(simulatedRequest);
  }, []);
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Text variant="title" render={<h3 />} id="recent-files-heading">
        Recent files
      </Text>
      <Column aria-busy={!loaded} justify="center" style={{ minBlockSize: '11rem' }}>
        {loaded ? (
          <List.Root aria-labelledby="recent-files-heading">
            {files.map(({ name, edited }) => (
              <List.Item key={name} label={name} description={edited} />
            ))}
          </List.Root>
        ) : (
          <Column align="center">
            <Spinner size="lg" label="Loading the recent files" />
          </Column>
        )}
      </Column>
    </Column>
  );
}
