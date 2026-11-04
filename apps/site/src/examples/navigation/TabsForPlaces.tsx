import { useState } from 'react';
import { Button, Column, PageHeader, Tabs, Text } from '@envsemble/envui';

export default function TabsForPlaces() {
  const [place, setPlace] = useState<string | null>('projects');
  return (
    // Places of the application as tabs: they have no address, and the navigation repeats them.
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <PageHeader headingLevel={3} title="Northwind" />
      <Tabs
        aria-label="Places"
        value={place}
        onValueChange={setPlace}
        items={[
          { value: 'home', button: <Button>Home</Button>, content: <Text>Welcome back.</Text> },
          {
            value: 'projects',
            button: <Button>Projects</Button>,
            content: <Text>Four projects.</Text>,
          },
          { value: 'team', button: <Button>Team</Button>, content: <Text>Six members.</Text> },
        ]}
      />
    </Column>
  );
}
