import { useState } from 'react';
import {
  Breadcrumbs,
  Button,
  IconButton,
  Page,
  PageHeader,
  NavigationRail,
  Scaffold,
  Tabs,
  Text,
  Tooltip,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { IconCategory } from '@envsemble/envui/icons/Category';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconSearch } from '@envsemble/envui/icons/Search';

const destinations: Destination[] = [
  { label: 'Home', icon: <IconHome />, href: '/' },
  { label: 'Projects', icon: <IconCategory />, href: '/projects', current: true },
];

export default function NavigationAnatomy() {
  const [view, setView] = useState<string | null>('tasks');
  return (
    // The rail at every width, so the figure keeps its parts on a narrow page.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '20rem' }}
      navigationForms={{ compact: 'rail', medium: 'rail', expanded: 'rail', large: 'rail' }}
      topBar={
        <TopBar
          title="Northwind"
          actions={
            <Tooltip content="Search" side="bottom">
              <IconButton variant="ghost" icon={<IconSearch />} aria-label="Search" />
            </Tooltip>
          }
        />
      }
      navigation={{ rail: <NavigationRail destinations={destinations} /> }}
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
