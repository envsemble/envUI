import { useState } from 'react';
import { Button, Column, Page, PageHeader, Scaffold, TextField } from '@envsemble/envui';

export const mount = 'standalone';

const destinations = ['Inbox', 'Settings', 'Archive'] as const;
type Destination = (typeof destinations)[number];

export default function PageNavigationFixture() {
  const [current, setCurrent] = useState<Destination>('Inbox');
  const [name, setName] = useState('Settings');
  const title = current === 'Settings' ? name : current;
  return (
    <Scaffold
      scroll="body"
      navigationForms={{ compact: 'drawer', medium: 'drawer' }}
      navigation={{
        drawer: (
          <nav aria-label="Main">
            <Column gap={1}>
              {destinations.map((destination) => (
                <Button
                  key={destination}
                  variant="ghost"
                  aria-current={destination === current ? 'page' : undefined}
                  onClick={() => setCurrent(destination)}
                >
                  {destination}
                </Button>
              ))}
            </Column>
          </nav>
        ),
      }}
    >
      <Page
        key={current}
        header={<PageHeader title={title} focusOnNavigation={current !== 'Archive'} />}
      >
        {current === 'Settings' && (
          <TextField label="Page name" value={name} onValueChange={setName} />
        )}
      </Page>
    </Scaffold>
  );
}
