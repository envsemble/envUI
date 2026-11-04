import { useState } from 'react';
import { Button, Column, PageHeader, Tabs, Text } from '@envsemble/envui';

export default function TabsForViews() {
  const [view, setView] = useState<string | null>('tasks');
  return (
    // Views of the one project the page is about, switched in place.
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <PageHeader headingLevel={3} title="Website refresh" />
      <Tabs
        aria-label="Website refresh views"
        value={view}
        onValueChange={setView}
        items={[
          {
            value: 'overview',
            button: <Button>Overview</Button>,
            content: <Text>Due 31 March.</Text>,
          },
          {
            value: 'tasks',
            button: <Button>Tasks</Button>,
            content: <Text>Three tasks are open.</Text>,
          },
          { value: 'files', button: <Button>Files</Button>, content: <Text>Two files.</Text> },
        ]}
      />
    </Column>
  );
}
