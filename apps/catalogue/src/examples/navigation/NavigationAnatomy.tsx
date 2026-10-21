import { useState } from 'react';
import {
  Breadcrumbs,
  Button,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  SearchTrigger,
  Tabs,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/' },
  { label: 'Projects', icon: <Category />, href: '/projects', current: true },
];

export default function NavigationAnatomy() {
  const [view, setView] = useState<string | null>('tasks');
  return (
    // The rail at every width, so the figure keeps its parts on a narrow page.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '20rem' }}
      forms={{ compact: 'rail', medium: 'rail', expanded: 'rail', large: 'rail' }}
      topBar={<TopBar title="Northwind" actions={<SearchTrigger iconOnly />} />}
      navigation={{ rail: <Rail destinations={destinations} /> }}
    >
      <Page
        header={
          <PageHeader
            headingLevel={3}
            title="Website refresh"
            breadcrumbs={
              <Breadcrumbs
                wrap={false}
                items={[{ label: 'Projects', href: '/projects' }, { label: 'Website refresh' }]}
              />
            }
          />
        }
      >
        <Tabs
          aria-label="Website refresh views"
          value={view}
          onValueChange={setView}
          items={[
            { value: 'tasks', button: <Button>Tasks</Button>, content: <Text>Three tasks.</Text> },
            { value: 'files', button: <Button>Files</Button>, content: <Text>Two files.</Text> },
          ]}
        />
      </Page>
    </Scaffold>
  );
}
