import { useState } from 'react';
import { Card, LoadingState, SegmentedControl, Skeleton, Stack, Text } from '@envsemble/envui';

const projects = {
  website: {
    name: 'Website refresh',
    summary: 'A new home page and pricing page, with the product tour moved into the help centre.',
  },
  billing: {
    name: 'Billing migration',
    summary: 'Invoices and payment methods move to the new provider before the end of the quarter.',
  },
};
type ProjectId = keyof typeof projects;
const options = [
  { value: 'website', label: 'Website refresh' },
  { value: 'billing', label: 'Billing migration' },
];

export default function LoadThenShow() {
  const [chosen, setChosen] = useState<ProjectId>('website');
  const [loaded, setLoaded] = useState<ProjectId>('website');
  const choose = (next: string) => {
    setChosen(next as ProjectId);
    // The project loads from a server; a timer stands in for it here.
    window.setTimeout(() => setLoaded(next as ProjectId), 1500);
  };
  const project = projects[loaded];
  return (
    <Stack gap={4}>
      <SegmentedControl
        aria-label="Project"
        items={options}
        value={chosen}
        onValueChange={choose}
      />
      <Card>
        {chosen === loaded ? (
          <Stack gap={2}>
            <Text render={<h3 />} variant="title">
              {project.name}
            </Text>
            <Text>{project.summary}</Text>
          </Stack>
        ) : (
          <LoadingState label="Loading project">
            <Skeleton width="38%" height="1.25rem" />
            <Skeleton width="100%" />
            <Skeleton width="72%" />
          </LoadingState>
        )}
      </Card>
    </Stack>
  );
}
